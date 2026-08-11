import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Users, Crown, Shield, Swords, Clock, Copy, Check,
  LogOut, WifiOff, Zap, Send, ChevronDown, MessageSquare, X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../config';
import { initSocket } from '../socket';
import './ArenaWaitingRoom.css';

/* ── helpers ─────────────────────────────────────────── */
const buildTeams = (participants = [], playersConfig = '1v1') => {
  const parts = playersConfig.split('v').map(Number);
  const t1Size = parts[0] || 1;
  const t2Size = parts[1] || 1;
  return [
    { name: 'Team Alpha', color: '#6366f1', maxSize: t1Size, members: participants.slice(0, t1Size).map(p => ({ ...p, ready: true })) },
    { name: 'Team Beta',  color: '#dc2626', maxSize: t2Size, members: participants.slice(t1Size, t1Size + t2Size).map(p => ({ ...p, ready: true })) }
  ];
};

const fmtTime = (iso) => {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/* ═══════════════════════════════════════════════════════
   COMPONENT
   ═══════════════════════════════════════════════════════ */
const ArenaWaitingRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const arenaId = searchParams.get('arena');

  /* arena state */
  const [arena, setArena]         = useState(null);
  const [loading, setLoading]     = useState(true);
  const [copied, setCopied]       = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [fromSession, setFromSession] = useState(false);

  /* chat state */
  const [messages, setMessages]     = useState([]);
  const [inputText, setInputText]   = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'team' | username
  const [filterOpen, setFilterOpen] = useState(false);
  const [chatConnected, setChatConnected] = useState(false);
  const socketRef  = useRef(null);
  const msgEndRef  = useRef(null);
  const inputRef   = useRef(null);
  const chatJoinedRef = useRef(false); // prevents duplicate arena:chat:join emits

  /* ── session storage ── */
  const loadFromSession = useCallback(() => {
    if (!arenaId) return false;
    const stored = sessionStorage.getItem(`arena_${arenaId}`);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (!data.teams?.length) data.teams = buildTeams(data.participants, data.players);
        setArena(data);
        setFromSession(true);
        setLoading(false);
        return true;
      } catch (_) {}
    }
    return false;
  }, [arenaId]);

  /* ── fetch arena ── */
  const fetchArenaDetails = useCallback(async () => {
    if (!arenaId) return;
    if (arenaId.startsWith('temp_')) { loadFromSession(); return; }
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(`${API_URL}/arena/${arenaId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      if (!data || data.status === 'closed') {
        sessionStorage.removeItem(`arena_${arenaId}`);
        toast.error('This arena was closed by the host');
        navigate('/battle-arena');
        return;
      }
      if (!data.teams?.length) data.teams = buildTeams(data.participants, data.players);
      sessionStorage.setItem(`arena_${arenaId}`, JSON.stringify(data));
      setArena(data);
      setFromSession(false);
      setLoading(false);
      if (data.isFull && countdown === null) startCountdown();
    } catch (err) {
      if (err.response?.status === 404) {
        sessionStorage.removeItem(`arena_${arenaId}`);
        toast.error('The host closed this arena');
        navigate('/battle-arena');
        return;
      }
      if (!loadFromSession()) { setLoading(false); }
    }
  }, [arenaId, countdown, loadFromSession, navigate]);

  useEffect(() => {
    if (!arenaId) return;
    fetchArenaDetails();
    const iv = setInterval(fetchArenaDetails, 3000);
    return () => clearInterval(iv);
  }, [arenaId]);

  /* ── socket chat ─ step 1: connect + subscribe to events ── */
  useEffect(() => {
    if (!arenaId || !user) return;

    const sock = initSocket();
    socketRef.current = sock;
    setChatConnected(true);

    sock.on('arena:chat:message', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'msg' }]);
    });
    sock.on('arena:chat:system', (msg) => {
      setMessages(prev => [...prev, { ...msg, type: 'system' }]);
    });

    // Arena closed by host — redirect everyone
    sock.on('arena:closed', ({ reason }) => {
      toast.error(reason || 'Arena was closed by the host', { duration: 4000 });
      sessionStorage.removeItem(`arena_${arenaId}`);
      navigate('/battle-arena');
    });

    // A participant left — update local state immediately (no waiting for 3s poll)
    sock.on('arena:participant_left', ({ participants }) => {
      setArena(prev => prev ? { ...prev, participants } : prev);
    });

    // Match started by host — navigate everyone to CodeWars workspace directly
    sock.on('arena:match_started', ({ roomId }) => {
      toast.success('Match is starting! Launching editor...', { icon: '🚀' });
      navigate(`/code-wars?roomId=${roomId}`);
    });

    return () => {
      if (arenaId) sock.emit('arena:chat:leave', { arenaId });
      sock.off('arena:chat:message');
      sock.off('arena:chat:system');
      sock.off('arena:closed');
      sock.off('arena:participant_left');
      sock.off('arena:match_started');
      chatJoinedRef.current = false;
      setChatConnected(false);
    };
  }, [arenaId, user?.username]);

  /* ── socket chat ─ step 2: join with correct team AFTER arena loads ── */
  useEffect(() => {
    if (!arenaId || !user || !arena || chatJoinedRef.current || !socketRef.current) return;
    const myTeam = getMyTeam(arena);
    socketRef.current.emit('arena:chat:join', {
      arenaId,
      userId: user.id || user._id,
      username: user.username,
      team: myTeam
    });
    chatJoinedRef.current = true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [arenaId, user?.username, !arena]);  // !arena flips false->true when arena first loads

  /* scroll to bottom on new messages */
  useEffect(() => {
    msgEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  /* ── helpers ── */
  const getMyTeam = (a) => {
    if (!a || !user) return 'team-alpha';
    const teams = a.teams?.length ? a.teams : buildTeams(a.participants, a.players);
    const inT1 = teams[0]?.members?.some(m => m.username === user.username);
    return inT1 ? 'team-alpha' : 'team-beta';
  };

  const getAllPlayers = () => {
    if (!arena) return [];
    const teams = arena.teams?.length ? arena.teams : buildTeams(arena.participants, arena.players);
    return [
      ...teams[0].members.map(m => ({ ...m, team: 'team-alpha', teamLabel: 'T1' })),
      ...teams[1].members.map(m => ({ ...m, team: 'team-beta',  teamLabel: 'T2' }))
    ].filter(m => m.username !== user?.username);
  };

  const sendMessage = () => {
    if (!inputText.trim() || !socketRef.current) return;
    const isWhisper = filterMode !== 'all' && filterMode !== 'team';
    socketRef.current.emit('arena:chat:send', {
      arenaId,
      message: inputText.trim(),
      whisperTo: isWhisper ? filterMode : null,
      teamOnly:  filterMode === 'team'
    });
    setInputText('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const startCountdown = () => {
    let count = 10;
    setCountdown(count);
    const t = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) { clearInterval(t); navigate(`/code-wars?arena=${arenaId}&start=true`); }
    }, 1000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(arena?.code || arena?.passcode || arenaId);
    setCopied(true);
    toast.success('Copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveArena = async () => {
    try {
      const token = localStorage.getItem('token');
      if (token && arenaId && !arenaId.startsWith('temp_')) {
        await axios.post(`${API_URL}/arena/leave`, { arenaId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      // Non-fatal — we still navigate away
      console.warn('[Leave] API call failed:', err.message);
    } finally {
      socketRef.current?.emit('arena:chat:leave', { arenaId });
      sessionStorage.removeItem(`arena_${arenaId}`);
      toast.success('Left arena');
      navigate('/battle-arena');
    }
  };

  const handleStartMatch = async () => {
    const isCreator = user?.username === arena?.creatorUsername || user?.username === arena?.creator;
    if (!isCreator) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(`${API_URL}/arena/start`, { arenaId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.roomId) {
        toast.success('Starting match...', { icon: '🎮' });
        navigate(`/code-wars?roomId=${data.roomId}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to start match');
    }
  };

  /* ── filter label ── */
  const filterLabel = () => {
    if (filterMode === 'all')  return 'Everyone';
    if (filterMode === 'team') return 'My Team';
    return `→ ${filterMode}`;
  };

  /* ── loading/error ── */
  if (loading) return (
    <div className="wr-page">
      <div className="wr-bg"><div className="wr-grid"/><div className="wr-glow wr-glow-a"/><div className="wr-glow wr-glow-b"/></div>
      <div className="wr-center-state"><div className="wr-spinner"/><p className="wr-state-text">Loading arena…</p></div>
    </div>
  );

  if (!arena) return (
    <div className="wr-page">
      <div className="wr-bg"><div className="wr-grid"/><div className="wr-glow wr-glow-a"/><div className="wr-glow wr-glow-b"/></div>
      <div className="wr-center-state">
        <Shield size={48} style={{ color: '#6366f1' }}/>
        <p className="wr-state-text">Arena not found</p>
        <button className="wr-back-btn" onClick={() => navigate('/battle-arena')}>Back to Arena</button>
      </div>
    </div>
  );

  const teams       = arena.teams?.length ? arena.teams : buildTeams(arena.participants, arena.players);
  const maxPlayers  = parseInt(arena.players?.split('v').reduce((a,b)=>parseInt(a)+parseInt(b),0)) || 2;
  const currentPlayers = arena.participants?.length || teams.reduce((s,t)=>s+(t.members?.length||0),0);
  const isCreator   = user?.username === arena?.creatorUsername || user?.username === arena?.creator;
  const isFull      = currentPlayers >= maxPlayers;
  const fillPct     = Math.min(100, (currentPlayers / maxPlayers) * 100);
  const allPlayers  = getAllPlayers();

  // Team-filter helpers
  const myTeamKey    = getMyTeam(arena); // 'team-alpha' | 'team-beta'
  const myTeamIndex  = myTeamKey === 'team-alpha' ? 0 : 1;
  const myTeamSize   = teams[myTeamIndex]?.members?.length || 0;
  const canSendTeam  = myTeamSize > 1; // disable "My Team only" when solo

  // Auto-reset filterMode if user is now solo in their team
  if (filterMode === 'team' && !canSendTeam) {
    setFilterMode('all');
  }

  return (
    <div className="wr-page">
      <div className="wr-bg">
        <div className="wr-grid"/>
        <div className="wr-glow wr-glow-a"/>
        <div className="wr-glow wr-glow-b"/>
      </div>

      {/* ── Header ── */}
      <header className="wr-header">
        <div className="wr-header-left">
          <div className="wr-logo-wrap"><Shield size={18}/></div>
          <div>
            <h1 className="wr-arena-name">{arena.name || 'Arena'}</h1>
            <div className="wr-tags">
              <span className="wr-tag">{arena.game || 'Syntax Showdown'}</span>
              <span className="wr-tag">{arena.players || '1v1'}</span>
              <span className="wr-tag">{arena.difficulty || 'medium'}</span>
              <span className="wr-tag">{arena.duration || 30} min</span>
              {fromSession && <span className="wr-tag wr-tag-local"><WifiOff size={9}/> local</span>}
            </div>
          </div>
        </div>
        <div className="wr-header-right">
          {(arena.isPrivate || arena.code) && (
            <div className="wr-code-box">
              <span className="wr-code-label">Room Code</span>
              <span className="wr-code-val">{arena.code || arena.passcode || '—'}</span>
              <button className="wr-copy-btn" onClick={handleCopyCode}>{copied ? <Check size={13}/> : <Copy size={13}/>}</button>
            </div>
          )}
          <button className="wr-leave-btn" onClick={handleLeaveArena}><LogOut size={14}/> Leave</button>
        </div>
      </header>

      {/* ── Countdown ── */}
      {countdown !== null && (
        <div className="wr-countdown"><Swords size={18}/> Match starting in <strong>{countdown}</strong>s</div>
      )}

      {/* ── Body: two-column layout ── */}
      <main className="wr-body">

        {/* LEFT: arena stage */}
        <section className="wr-left">

          {/* Section header */}
          <div className="wr-section-title">
            <Users size={14}/>
            <span>Battle Roster</span>
            <span className="wr-count-badge">{currentPlayers} / {maxPlayers}</span>
            <div className="wr-fill-track">
              <div className="wr-fill-bar" style={{ width: `${fillPct}%` }}/>
            </div>
          </div>

          {/* Stage */}
          <div className="wr-stage">
            {/* Team 1 */}
            <div className="wr-team-card wr-team-alpha">
              <div className="wr-team-header wr-team-header-alpha">
                <div className="wr-team-emblem wr-emblem-alpha">T1</div>
                <div>
                  <div className="wr-team-name">{teams[0]?.name || 'Team Alpha'}</div>
                  <div className="wr-team-sub">{teams[0]?.members?.length||0} / {teams[0]?.maxSize||Math.ceil(maxPlayers/2)} players</div>
                </div>
              </div>
              <div className="wr-members">
                {(teams[0]?.members||[]).map((m,i)=>(
                  <div key={m.id||i} className="wr-member wr-member-filled">
                    <div className="wr-avatar wr-avatar-alpha">{m.username?.charAt(0).toUpperCase()}</div>
                    <div className="wr-member-info">
                      <span className="wr-member-name">{m.username}</span>
                      {(m.username===arena.creatorUsername||m.username===arena.creator)&&(
                        <span className="wr-host-badge"><Crown size={9}/> Host</span>
                      )}
                    </div>
                    <span className="wr-ready-dot wr-dot-ready"/>
                  </div>
                ))}
                {Array.from({length:Math.max(0,(teams[0]?.maxSize||Math.ceil(maxPlayers/2))-(teams[0]?.members?.length||0))}).map((_,i)=>(
                  <div key={`e1-${i}`} className="wr-member wr-member-empty">
                    <div className="wr-avatar wr-avatar-empty"><Users size={13}/></div>
                    <span className="wr-empty-text">Waiting for player…</span>
                    <span className="wr-ready-dot wr-dot-waiting"/>
                  </div>
                ))}
              </div>
            </div>

            {/* VS */}
            <div className="wr-vs-center">
              <div className="wr-vs-line wr-vs-line-l"/>
              <div className="wr-vs-ring"><span className="wr-vs-text">VS</span></div>
              <div className="wr-vs-line wr-vs-line-r"/>
            </div>

            {/* Team 2 */}
            <div className="wr-team-card wr-team-beta">
              <div className="wr-team-header wr-team-header-beta">
                <div className="wr-team-emblem wr-emblem-beta">T2</div>
                <div>
                  <div className="wr-team-name">{teams[1]?.name || 'Team Beta'}</div>
                  <div className="wr-team-sub">{teams[1]?.members?.length||0} / {teams[1]?.maxSize||Math.floor(maxPlayers/2)} players</div>
                </div>
              </div>
              <div className="wr-members">
                {(teams[1]?.members||[]).map((m,i)=>(
                  <div key={m.id||i} className="wr-member wr-member-filled">
                    <div className="wr-avatar wr-avatar-beta">{m.username?.charAt(0).toUpperCase()}</div>
                    <div className="wr-member-info">
                      <span className="wr-member-name">{m.username}</span>
                      {(m.username===arena.creatorUsername||m.username===arena.creator)&&(
                        <span className="wr-host-badge"><Crown size={9}/> Host</span>
                      )}
                    </div>
                    <span className="wr-ready-dot wr-dot-ready"/>
                  </div>
                ))}
                {Array.from({length:Math.max(0,(teams[1]?.maxSize||Math.floor(maxPlayers/2))-(teams[1]?.members?.length||0))}).map((_,i)=>(
                  <div key={`e2-${i}`} className="wr-member wr-member-empty">
                    <div className="wr-avatar wr-avatar-empty"><Users size={13}/></div>
                    <span className="wr-empty-text">Waiting for player…</span>
                    <span className="wr-ready-dot wr-dot-waiting"/>
                  </div>
                ))}
              </div>
            </div>
          </div>{/* /wr-stage */}

          {/* Footer */}
          <div className="wr-footer">
            <div className="wr-status">
              {!isFull
                ? <><Clock size={14}/><span>Waiting for <strong>{maxPlayers-currentPlayers}</strong> more player{maxPlayers-currentPlayers!==1?'s':''}…</span></>
                : <><Zap size={14} style={{color:'#22c55e'}}/><span style={{color:'#22c55e'}}>All players joined.</span></>
              }
            </div>
            {isCreator && currentPlayers >= 2 && (
              <button className="wr-start-btn" onClick={handleStartMatch}><Swords size={15}/> Start Match</button>
            )}
          </div>

        </section>{/* /wr-left */}

        {/* RIGHT: Chat panel */}
        <aside className="wr-chat">
          {/* Chat header */}
          <div className="wr-chat-header">
            <div className="wr-chat-title">
              <MessageSquare size={14}/>
              <span>Arena Chat</span>
              {chatConnected && <span className="wr-chat-live-dot"/>}
            </div>

            {/* Filter dropdown */}
            <div className="wr-filter-wrap">
              <button className="wr-filter-btn" onClick={()=>setFilterOpen(o=>!o)}>
                <span>{filterLabel()}</span>
                <ChevronDown size={12} className={filterOpen ? 'rot-180' : ''}/>
              </button>
              {filterOpen && (
                <div className="wr-filter-menu">
                  <div className="wr-filter-section-label">Broadcast</div>
                  <button className={`wr-filter-item ${filterMode==='all'?'active':''}`}
                    onClick={()=>{setFilterMode('all');setFilterOpen(false);}}>
                    <Users size={12}/> Everyone
                  </button>
                  <button
                    className={`wr-filter-item ${filterMode==='team'?'active':''} ${!canSendTeam?'wr-filter-disabled':''}`}
                    onClick={()=>{ if(!canSendTeam) return; setFilterMode('team'); setFilterOpen(false); }}
                    disabled={!canSendTeam}
                    title={!canSendTeam ? 'You are the only member on your team' : 'Message your team only'}
                  >
                    <Shield size={12}/>
                    My Team only
                    {!canSendTeam && <span className="wr-filter-solo-tag">solo</span>}
                  </button>
                  {allPlayers.length > 0 && (
                    <>
                      <div className="wr-filter-section-label" style={{marginTop:'.5rem'}}>Whisper to</div>
                      {allPlayers.map(p=>(
                        <button key={p.username}
                          className={`wr-filter-item ${filterMode===p.username?'active':''}`}
                          onClick={()=>{setFilterMode(p.username);setFilterOpen(false);}}>
                          <span className={`wr-fi-team-dot ${p.team==='team-alpha'?'alpha':'beta'}`}/>
                          {p.username}
                          <span className="wr-fi-team-tag">{p.teamLabel}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Active filter pill */}
          {filterMode !== 'all' && (
            <div className="wr-filter-active">
              <span>{filterMode === 'team' ? '📢 Team only' : `💬 Whispering to ${filterMode}`}</span>
              <button onClick={()=>setFilterMode('all')}><X size={11}/></button>
            </div>
          )}

          {/* Messages */}
          <div className="wr-msgs" onClick={()=>filterOpen&&setFilterOpen(false)}>
            {messages.length === 0 && (
              <div className="wr-msgs-empty">
                <MessageSquare size={24}/>
                <p>No messages yet.<br/>Say hi to your opponent!</p>
              </div>
            )}
            {messages.map(msg => {
              if (msg.type === 'system') return (
                <div key={msg.id} className="wr-msg-system">{msg.text}</div>
              );
              const isMe = msg.from === user?.username;
              const isAlpha = msg.team === 'team-alpha';
              return (
                <div key={msg.id} className={`wr-msg ${isMe ? 'wr-msg-me' : 'wr-msg-other'}`}>
                  {!isMe && (
                    <div className={`wr-msg-avatar ${isAlpha ? 'alpha' : 'beta'}`}>
                      {msg.from?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="wr-msg-body">
                    {!isMe && (
                      <div className="wr-msg-meta">
                        <span className="wr-msg-name">{msg.from}</span>
                        <span className={`wr-msg-team-tag ${isAlpha?'alpha':'beta'}`}>{isAlpha?'T1':'T2'}</span>
                        {msg.whisperTo && <span className="wr-msg-whisper-tag">whisper</span>}
                        {msg.teamOnly  && <span className="wr-msg-team-only-tag">team</span>}
                      </div>
                    )}
                    <div className="wr-msg-bubble">{msg.message}</div>
                    <div className="wr-msg-time">{fmtTime(msg.timestamp)}</div>
                  </div>
                </div>
              );
            })}
            <div ref={msgEndRef}/>
          </div>

          {/* Input */}
          <div className="wr-chat-input-row">
            <input
              ref={inputRef}
              className="wr-chat-input"
              type="text"
              placeholder={filterMode === 'team' ? 'Message your team…' : filterMode !== 'all' ? `Whisper to ${filterMode}…` : 'Message everyone…'}
              value={inputText}
              onChange={e=>setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              maxLength={300}
            />
            <button className="wr-chat-send" onClick={sendMessage} disabled={!inputText.trim()}>
              <Send size={15}/>
            </button>
          </div>
        </aside>

      </main>
    </div>
  );
};

export default ArenaWaitingRoom;
