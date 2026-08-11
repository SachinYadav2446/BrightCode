import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Swords, Code2, ArrowLeft, Users, Clock, Zap, Trophy, Lock, Globe, UserCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../config';
import './ArenaLobby.css';

const ArenaLobby = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('game');
  
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
  const [createForm, setCreateForm] = useState({
    name: '',
    players: '1v1',
    duration: '15',
    difficulty: 'medium',
    isPrivate: false,
    passcode: ''
  });

  // Active arenas from API
  const [activeArenas, setActiveArenas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [joiningId, setJoiningId] = useState(null);     // arena being joined
  const [passcodeModal, setPasscodeModal] = useState(null); // { arenaId, arenaName }
  const [passcodeInput, setPasscodeInput] = useState('');
  const refreshIntervalRef = useRef(null);

  // Fetch + auto-refresh when Join tab is active
  useEffect(() => {
    if (activeTab === 'join') {
      fetchActiveArenas();
      refreshIntervalRef.current = setInterval(fetchActiveArenas, 5000);
    } else {
      clearInterval(refreshIntervalRef.current);
    }
    return () => clearInterval(refreshIntervalRef.current);
  }, [activeTab, gameId]);

  const fetchActiveArenas = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/arena/active`, {
        params: { game: gameId },
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setActiveArenas(response.data.arenas || []);
    } catch (error) {
      console.error('Error fetching active arenas:', error);
      if (!silent) toast.error('Failed to load active arenas');
      setActiveArenas([]);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const games = {
    'syntax-showdown': {
      title: 'Syntax Showdown',
      icon: Swords,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      players: ['1v1', '2v2', '4v4'],
      durations: ['5', '15', '30', '60'],
      difficulties: ['easy', 'medium', 'hard']
    },
    'algorithm-duel': {
      title: 'Algorithm Duel',
      icon: Zap,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      players: ['1v1'],
      durations: ['10', '20'],
      difficulties: ['medium', 'hard']
    },
    'hackathon-hub': {
      title: 'Hackathon Hub',
      icon: Trophy,
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      players: ['2v2', '4v4'],
      durations: ['20', '30', '60'],
      difficulties: ['easy', 'medium', 'hard']
    },
    'faction-wars': {
      title: 'Faction Wars',
      icon: Users,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      players: ['4v4'],
      durations: ['30', '60'],
      difficulties: ['medium', 'hard']
    }
  };

  const currentGame = games[gameId] || games['syntax-showdown'];
  const Icon = currentGame.icon;

  useEffect(() => {
    // Initialize form with game-specific defaults
    setCreateForm(prev => ({
      ...prev,
      players: currentGame.players[0],
      duration: currentGame.durations[0],
      difficulty: currentGame.difficulties[0],
      isPrivate: false,
      passcode: ''
    }));
  }, [gameId]);

  const handleCreateArena = async (e) => {
    e.preventDefault();
    
    console.log('handleCreateArena called', { user, createForm, gameId });
    
    // Check if user is logged in
    if (!user) {
      console.error('User not loaded');
      toast.error('Please wait for user data to load');
      return;
    }

    // Validate form
    if (!createForm.name || createForm.name.trim() === '') {
      toast.error('Please enter an arena name');
      return;
    }

    if (createForm.isPrivate && (!createForm.passcode || createForm.passcode.length < 4)) {
      toast.error('Private arenas require a passcode (4-6 characters)');
      return;
    }
    
    console.log('Creating arena with validated data...');
    
    try {
      // Temporary mock: Generate a temporary arena ID
      const tempArenaId = `temp_${Date.now()}`;
      
      // Get user ID - handle both _id and id
      const userId = user._id || user.id;
      const username = user.username || user.name || 'Anonymous';
      
      // Store arena data in sessionStorage for the waiting room to use
      const mockArena = {
        _id: tempArenaId,
        name: createForm.name,
        game: gameId,
        players: createForm.players,
        duration: createForm.duration,
        difficulty: createForm.difficulty,
        isPrivate: createForm.isPrivate,
        code: createForm.isPrivate ? generateArenaCode() : null,
        creator: username,
        participants: [
          {
            id: userId,
            username: username,
            ready: true
          }
        ],
        teams: generateTeams(createForm.players, user),
        createdAt: new Date().toISOString()
      };
      
      console.log('Mock arena created:', mockArena);
      
      // Call backend API to create arena
      try {
        const response = await axios.post(`${API_URL}/arena/create`, {
          name: createForm.name,
          game: gameId,
          players: createForm.players,
          duration: createForm.duration,
          difficulty: createForm.difficulty,
          isPrivate: createForm.isPrivate,
          passcode: createForm.passcode
        }, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        console.log('Arena created on backend:', response.data);
        const realArenaId = response.data.arena.id;
        
        // Merge server arena with local mock (teams, code, etc.) and store under real ID
        const fullArena = { ...mockArena, ...response.data.arena, teams: mockArena.teams, code: mockArena.code };
        sessionStorage.setItem(`arena_${realArenaId}`, JSON.stringify(fullArena));
        toast.success('Arena created successfully!');
        navigate(`/arena-waiting?arena=${realArenaId}`);
      } catch (apiError) {
        console.error('API Error creating arena:', apiError);
        
        // If API fails, use the temp local fallback
        console.warn('API failed, using local fallback arena');
        toast.warning('Using local arena (not synced with server)');
        sessionStorage.setItem(`arena_${tempArenaId}`, JSON.stringify(mockArena));
        navigate(`/arena-waiting?arena=${tempArenaId}`);
      }
    } catch (error) {
      console.error('Error creating arena:', error);
      toast.error('Failed to create arena: ' + error.message);
    }
    
    /* TODO: Replace with real API call
    axios.post(`${API_URL}/arena/create`, {
      game: gameId,
      ...createForm,
      creatorId: user._id,
      creatorUsername: user.username
    })
    .then(response => {
      toast.success('Arena created successfully!');
      const arenaId = response.data.arenaId || response.data.arena?._id;
      navigate(`/arena-waiting?arena=${arenaId}`);
    })
    .catch(error => {
      console.error('Error creating arena:', error);
      toast.error(error.response?.data?.message || 'Failed to create arena');
    });
    */
  };

  const generateArenaCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const generateTeams = (playerConfig, creator) => {
    const [team1Size, team2Size] = playerConfig.split('v').map(Number);
    const teams = [
      {
        members: [{ id: creator._id, username: creator.username, ready: true }]
      }
    ];
    
    if (team2Size) {
      teams.push({ members: [] });
    }
    
    return teams;
  };

  const joinArenaById = async (arenaId, passcode = null) => {
    setJoiningId(arenaId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/arena/join`, { arenaId, passcode }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const arena = response.data.arena;
      // Cache arena data so the waiting room can load instantly
      const arenaData = { ...arena };
      if (!arenaData.teams) {
        const parts = (arenaData.players || '1v1').split('v').map(Number);
        arenaData.teams = [
          { name: 'Team Alpha', color: '#6366f1', maxSize: parts[0], members: arenaData.participants?.slice(0, parts[0]) || [] },
          { name: 'Team Beta',  color: '#dc2626', maxSize: parts[1]||1, members: arenaData.participants?.slice(parts[0]) || [] }
        ];
      }
      sessionStorage.setItem(`arena_${arenaId}`, JSON.stringify(arenaData));
      toast.success('Joined arena!');
      navigate(`/arena-waiting?arena=${arenaId}`);
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to join arena';
      toast.error(msg);
    } finally {
      setJoiningId(null);
    }
  };

  const handleJoinArena = async (e) => {
    e.preventDefault();
    const code = e.target.arenaCode.value.trim();
    if (!code) return;
    // Find by passcode match in active arenas
    const match = activeArenas.find(a => a.passcode === code || a.code === code || a.id === code);
    if (match) {
      if (match.isPrivate) {
        setPasscodeModal({ arenaId: match.id, arenaName: match.name });
      } else {
        joinArenaById(match.id);
      }
    } else {
      toast.error('Arena not found. Check the code and try again.');
    }
  };

  const handleJoinArenaById = (arenaId, isPrivate) => {
    if (isPrivate) {
      const arena = activeArenas.find(a => a.id === arenaId);
      setPasscodeModal({ arenaId, arenaName: arena?.name || 'Arena' });
      setPasscodeInput('');
    } else {
      joinArenaById(arenaId);
    }
  };

  const handlePasscodeSubmit = (e) => {
    e.preventDefault();
    if (!passcodeInput.trim()) return;
    joinArenaById(passcodeModal.arenaId, passcodeInput.trim());
    setPasscodeModal(null);
    setPasscodeInput('');
  };

  return (
    <div className="arena-lobby-page">
      {/* Background */}
      <div className="lobby-bg">
        <div className="lobby-grid"></div>
        <div className="lobby-glow"></div>
      </div>

      {/* Back Button */}
      <button className="back-btn-floating" onClick={() => navigate('/battle-arena')}>
        <ArrowLeft size={18} />
        <span>Back</span>
      </button>

      {/* Main Content */}
      <main className="lobby-content">
        <div className="lobby-container">
          {/* Tab Switcher */}
          <div className="tab-switcher">
            <button 
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
              style={activeTab === 'create' ? { background: currentGame.gradient } : {}}
            >
              <Swords size={18} />
              <span>Create Arena</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'join' ? 'active' : ''}`}
              onClick={() => setActiveTab('join')}
              style={activeTab === 'join' ? { background: currentGame.gradient } : {}}
            >
              <Code2 size={18} />
              <span>Join Arena</span>
            </button>
          </div>

          {/* Create Arena Form */}
          {activeTab === 'create' && (
            <form className="lobby-form" onSubmit={handleCreateArena}>
              <h2 className="form-title">Setup Your Battle Arena</h2>
              
              <div className="form-group">
                <label>Arena Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  placeholder="e.g., Epic Battle Arena"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Players</label>
                  <select
                    value={createForm.players}
                    onChange={(e) => setCreateForm({...createForm, players: e.target.value})}
                  >
                    {currentGame.players.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (min)</label>
                  <select
                    value={createForm.duration}
                    onChange={(e) => setCreateForm({...createForm, duration: e.target.value})}
                  >
                    {currentGame.durations.map(d => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={createForm.difficulty}
                    onChange={(e) => setCreateForm({...createForm, difficulty: e.target.value})}
                  >
                    {currentGame.difficulties.map(d => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Arena Type</label>
                <div className="privacy-toggle">
                  <button 
                    type="button"
                    className={`privacy-btn ${!createForm.isPrivate ? 'active' : ''}`}
                    onClick={() => setCreateForm({...createForm, isPrivate: false, passcode: ''})}
                  >
                    <Globe size={16} />
                    Public
                  </button>
                  <button 
                    type="button"
                    className={`privacy-btn ${createForm.isPrivate ? 'active' : ''}`}
                    onClick={() => setCreateForm({...createForm, isPrivate: true})}
                  >
                    <Lock size={16} />
                    Private
                  </button>
                </div>
              </div>

              {createForm.isPrivate && (
                <div className="form-group">
                  <label>Passcode</label>
                  <input
                    type="text"
                    value={createForm.passcode}
                    onChange={(e) => setCreateForm({...createForm, passcode: e.target.value})}
                    placeholder="Enter 4-6 digit passcode"
                    required={createForm.isPrivate}
                    maxLength={6}
                  />
                  <small>Share this passcode with players you want to join</small>
                </div>
              )}

              <button type="submit" className="submit-btn" style={{ background: currentGame.gradient }}>
                <Swords size={20} /> Create Arena
              </button>
            </form>
          )}

          {/* Join Arena Form */}
          {activeTab === 'join' && (
            <div className="lobby-form join-section">
              <div className="join-header">
                <h2 className="form-title">Join an Arena</h2>
                <button className="refresh-btn" onClick={() => fetchActiveArenas()} title="Refresh">
                  <RefreshCw size={15} className={loading ? 'spin' : ''}/>
                </button>
              </div>

              {/* Join by Code */}
              <form onSubmit={handleJoinArena} className="join-by-code">
                <div className="form-group">
                  <label>Have an Arena Code?</label>
                  <div className="code-input-group">
                    <input
                      type="text"
                      name="arenaCode"
                      placeholder="e.g., ABC-123-XYZ"
                      autoComplete="off"
                      className="arena-code-input"
                    />
                    <button type="submit" className="code-submit-btn" style={{ background: currentGame.gradient }}>
                      <Code2 size={18} /> Join
                    </button>
                  </div>
                  <small>Enter the code shared by the arena creator</small>
                </div>
              </form>

              {/* Divider */}
              <div className="join-divider">
                <span>or browse active arenas</span>
              </div>

              {/* Active Arenas List */}
              <div className="active-arenas-list">
                {loading ? (
                  <div className="no-arenas">
                    <div className="arena-spinner"/>
                    <p>Loading arenas…</p>
                  </div>
                ) : activeArenas.length === 0 ? (
                  <div className="no-arenas">
                    <Users size={32} />
                    <p>No active arenas found</p>
                    <small>Create one or check back later!</small>
                  </div>
                ) : (
                  activeArenas.map(arena => {
                    const current = arena.participants?.length || 0;
                    const max     = arena.maxParticipants || parseInt((arena.players||'1v1').split('v').reduce((a,b)=>parseInt(a)+parseInt(b),0));
                    const isFull  = current >= max;
                    const isMe    = joiningId === (arena.id || arena._id);
                    return (
                      <div key={arena.id || arena._id} className={`arena-card ${isFull ? 'arena-card-full' : ''}`}>
                        <div className="arena-card-header">
                          <div className="arena-info">
                            <h3>{arena.name}</h3>
                            <span className="arena-creator">by {arena.creatorUsername || arena.creator}</span>
                          </div>
                          {arena.isPrivate ? (
                            <div className="privacy-badge private"><Lock size={12}/><span>Private</span></div>
                          ) : (
                            <div className="privacy-badge public"><Globe size={12}/><span>Public</span></div>
                          )}
                        </div>

                        <div className="arena-details">
                          <div className="arena-detail-item"><Users size={14}/><span>{arena.players}</span></div>
                          <div className="arena-detail-item"><Zap size={14}/><span>{arena.difficulty}</span></div>
                          <div className="arena-detail-item"><Clock size={14}/><span>{arena.duration}m</span></div>
                        </div>

                        <div className="arena-card-footer">
                          <div className="member-count">
                            <span className={`slot-indicator ${isFull ? 'full' : 'open'}`}/>
                            <span>{current}/{max} players</span>
                          </div>
                          <button
                            className="join-arena-card-btn"
                            onClick={() => handleJoinArenaById(arena.id || arena._id, arena.isPrivate)}
                            disabled={isFull || isMe}
                            style={!isFull ? { background: currentGame.gradient } : {}}
                          >
                            {isMe ? 'Joining…' : isFull ? 'Full' : arena.isPrivate ? <><Lock size={12}/> Join</> : 'Join →'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Passcode Modal */}
      {passcodeModal && (
        <div className="passcode-overlay" onClick={() => setPasscodeModal(null)}>
          <div className="passcode-modal" onClick={e => e.stopPropagation()}>
            <h3><Lock size={16}/> Private Arena</h3>
            <p>Enter the passcode to join <strong>{passcodeModal.arenaName}</strong></p>
            <form onSubmit={handlePasscodeSubmit}>
              <input
                type="text"
                className="passcode-input"
                placeholder="Enter passcode…"
                value={passcodeInput}
                onChange={e => setPasscodeInput(e.target.value)}
                autoFocus
                maxLength={6}
              />
              <div className="passcode-actions">
                <button type="button" className="passcode-cancel" onClick={() => setPasscodeModal(null)}>Cancel</button>
                <button type="submit" className="passcode-submit" style={{ background: currentGame.gradient }}>Join Arena</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ArenaLobby;

