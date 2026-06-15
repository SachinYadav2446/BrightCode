import API_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, Plus, Users, X, Copy, Check, Clock, Crown, User,
  Code2, Terminal, GitBranch, Wifi, FolderOpen,
  Calendar, Hash, ExternalLink, AlertTriangle, Shield
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Chatbot from '../components/Chatbot';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import './Workspace.css';

const generateWorkspaceId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 6);
  return `ws-${timestamp}-${random}`;
};

const LANGUAGES = [
  { name: 'Python',     color: '#3572A5' },
  { name: 'JavaScript', color: '#f1e05a' },
  { name: 'TypeScript', color: '#2b7489' },
  { name: 'Go',         color: '#00ADD8' },
  { name: 'Rust',       color: '#dea584' },
  { name: 'Java',       color: '#b07219' },
  { name: 'C++',        color: '#f34b7d' },
  { name: 'Ruby',       color: '#cc342d' },
  { name: 'Swift',      color: '#F05138' },
  { name: 'Kotlin',     color: '#A97BFF' },
  { name: 'PHP',        color: '#4F5D95' },
  { name: 'C#',         color: '#178600' },
  { name: 'Dart',       color: '#00B4AB' },
  { name: 'Scala',      color: '#c22d40' },
];

const AVATAR_COLORS = ['#e74c3c','#3498db','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22'];

const getAvatarColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* ────────────────────────────────────────────────────────────
   FEATURES SHOWCASE – sequential animated cards
   ──────────────────────────────────────────────────────────── */
const FEATURES = [
  {
    icon: <Terminal size={32} />,
    title: 'Interactive Terminal',
    desc: 'Full-featured terminal synced across all collaborators. Run commands, scripts, and see output the moment it appears.',
    tag: '01 / Terminal',
    accent: '#ef4444',
    detail: ['Real-time output sync', 'Multi-user access', 'Persistent session'],
  },
  {
    icon: <Code2 size={32} />,
    title: 'Multi-Language Editor',
    desc: 'Write in 14+ languages with syntax highlighting, auto-completion, and cursor presence for every collaborator.',
    tag: '02 / Editor',
    accent: '#3b82f6',
    detail: ['14+ languages', 'Live cursors', 'Intellisense'],
  },
  {
    icon: <Users size={32} />,
    title: 'Real-time Collaboration',
    desc: 'See every keystroke, cursor, and change live. Built-in voice chat and team messaging keep everyone aligned.',
    tag: '03 / Collab',
    accent: '#22c55e',
    detail: ['Voice & video', 'Live presence', 'Team chat'],
  },
  {
    icon: <GitBranch size={32} />,
    title: 'Version Snapshots',
    desc: 'Capture full-workspace snapshots at any point. Warp back instantly — every file, every line, restored.',
    tag: '04 / Versions',
    accent: '#a855f7',
    detail: ['One-click snapshot', 'Warp to any point', 'Never lose work'],
  },
  {
    icon: <Wifi size={32} />,
    title: 'Admin Controls',
    desc: 'Grant or revoke write access per user. End sessions from anywhere, monitor activity, keep your workspace secure.',
    tag: '05 / Admin',
    accent: '#f59e0b',
    detail: ['Permission system', 'Remote end session', 'User management'],
  },
];

const FeaturesShowcase = () => {
  const [active, setActive] = React.useState(0);
  const [animating, setAnimating] = React.useState(false);
  const [visible, setVisible] = React.useState(false);
  const sectionRef = React.useRef(null);
  const timerRef = React.useRef(null);

  // Intersection observer to start auto-play only when visible
  React.useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.3 }
    );
    if (sectionRef.current) obs.observe(sectionRef.current);
    return () => obs.disconnect();
  }, []);

  // Auto-advance every 3 s
  React.useEffect(() => {
    if (!visible) return;
    timerRef.current = setInterval(() => advance(), 3000);
    return () => clearInterval(timerRef.current);
  }, [visible, active]);

  const advance = () => {
    setAnimating(true);
    setTimeout(() => {
      setActive(prev => (prev + 1) % FEATURES.length);
      setAnimating(false);
    }, 350);
  };

  const goTo = (i) => {
    if (i === active) return;
    clearInterval(timerRef.current);
    setAnimating(true);
    setTimeout(() => {
      setActive(i);
      setAnimating(false);
    }, 350);
  };

  const f = FEATURES[active];

  return (
    <section className="fs-section" ref={sectionRef}>
      {/* Header */}
      <div className="fs-header">
        <h2>Everything you need to code together</h2>
        <p>Professional tools built for modern development teams</p>
      </div>

      {/* Stage */}
      <div className="fs-stage">
        {/* Sidebar index list */}
        <div className="fs-sidebar">
          {FEATURES.map((feat, i) => (
            <button
              key={i}
              className={`fs-sidebar-item ${i === active ? 'active' : ''}`}
              onClick={() => goTo(i)}
            >
              <span className="fs-sidebar-num">0{i + 1}</span>
              <span className="fs-sidebar-title">{feat.title}</span>
              {i === active && <span className="fs-sidebar-bar" style={{ background: feat.accent }}></span>}
            </button>
          ))}
        </div>

        {/* Main card */}
        <div className={`fs-card ${animating ? 'fs-card--out' : 'fs-card--in'}`}>
          {/* Accent glow */}
          <div className="fs-card-glow" style={{ background: f.accent }}></div>

          <div className="fs-card-inner">
            {/* Icon */}
            <div className="fs-card-icon" style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}40`, color: f.accent }}>
              {f.icon}
            </div>

            {/* Tag */}
            <span className="fs-card-tag" style={{ color: f.accent, borderColor: `${f.accent}40`, background: `${f.accent}10` }}>
              {f.tag}
            </span>

            {/* Title & description */}
            <h3 className="fs-card-title">{f.title}</h3>
            <p className="fs-card-desc">{f.desc}</p>

            {/* Detail pills */}
            <div className="fs-card-pills">
              {f.detail.map((d, i) => (
                <span key={i} className="fs-pill" style={{ borderColor: `${f.accent}30`, color: `${f.accent}cc` }}>
                  {d}
                </span>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          <div className="fs-card-progress">
            <div className="fs-progress-fill" style={{ background: f.accent, animationDuration: '3s' }}></div>
          </div>
        </div>
      </div>

      {/* Dot navigation (mobile) */}
      <div className="fs-dots">
        {FEATURES.map((_, i) => (
          <button
            key={i}
            className={`fs-dot ${i === active ? 'active' : ''}`}
            onClick={() => goTo(i)}
            style={i === active ? { background: f.accent } : {}}
          />
        ))}
      </div>
    </section>
  );
};

const Workspace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal]     = useState(false);
  const [workspaceName, setWorkspaceName]     = useState('');
  const [joinId, setJoinId]                   = useState('');
  const [createdWorkspace, setCreatedWorkspace] = useState(null);
  const [copied, setCopied]                   = useState(false);
  const [workspaceHistory, setWorkspaceHistory] = useState([]);
  // roomsStatus: map of roomId → { live, userCount, owner }
  const [roomsStatus, setRoomsStatus]         = useState({});
  const [copiedCardId, setCopiedCardId]       = useState(null);
  const [terminatedSessions, setTerminatedSessions] = useState(() =>
    JSON.parse(localStorage.getItem('terminatedSessions') || '[]')
  );
  // confirmEnd: roomId of the card the admin wants to end from dashboard
  const [confirmEnd, setConfirmEnd]           = useState(null);
  const socketRef                             = useRef(null);

  useEffect(() => { window.scrollTo(0, 0); }, []);

  useEffect(() => {
    const historyKey = `workspaceHistory_${user?.username || 'guest'}`;
    const statsKey   = `workspaceStats_${user?.username || 'guest'}`;
    const history    = JSON.parse(localStorage.getItem(historyKey) || '[]');
    setWorkspaceHistory(history);

    // Seed stats from history if stats key doesn't exist yet
    if (!localStorage.getItem(statsKey) && history.length > 0) {
      const seeded = {
        total:    history.length,
        asAdmin:  history.filter(w => w.isAdmin).length,
        asMember: history.filter(w => !w.isAdmin).length,
      };
      localStorage.setItem(statsKey, JSON.stringify(seeded));
    }

    // Connect a lightweight socket just to receive session-ended events
    const socket = io(API_URL, { transports: ['websocket'], autoConnect: true });
    socketRef.current = socket;

    // Listen for room-specific session-ended (if user happens to be in that room socket)
    socket.on('session-ended', ({ roomId: endedRoomId }) => {
      if (endedRoomId) {
        const key      = 'terminatedSessions';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        if (!existing.includes(endedRoomId)) {
          const merged = [...existing, endedRoomId];
          localStorage.setItem(key, JSON.stringify(merged));
          setTerminatedSessions(merged);
        }
        // Update roomsStatus to mark it offline immediately
        setRoomsStatus(prev => ({ ...prev, [endedRoomId]: { live: false, userCount: 0, owner: null } }));
      }
    });

    // Listen for GLOBAL session termination broadcast (so all workspace viewers see it)
    socket.on('session-terminated-global', ({ roomId: endedRoomId }) => {
      if (endedRoomId) {
        const key      = 'terminatedSessions';
        const existing = JSON.parse(localStorage.getItem(key) || '[]');
        if (!existing.includes(endedRoomId)) {
          const merged = [...existing, endedRoomId];
          localStorage.setItem(key, JSON.stringify(merged));
          setTerminatedSessions(merged);
        }
        setRoomsStatus(prev => ({ ...prev, [endedRoomId]: { live: false, userCount: 0, owner: null } }));
      }
    });

    // Fetch real status for all rooms in history using bulk endpoint
    const fetchRoomsStatus = async (hist) => {
      const ids = (hist || history).map(w => w.id);
      if (ids.length === 0) return;
      try {
        const res  = await fetch(`${API_URL}/rooms-status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ roomIds: ids }),
        });
        const data = await res.json();
        setRoomsStatus(data);
      } catch (err) {
        console.error('Failed to fetch rooms status:', err);
      }
    };

    fetchRoomsStatus(history);
    const interval = setInterval(() => fetchRoomsStatus(
      JSON.parse(localStorage.getItem(`workspaceHistory_${user?.username || 'guest'}`) || '[]')
    ), 10000);

    return () => {
      clearInterval(interval);
      socket.disconnect();
    };
  }, []);

  const saveToHistory = (workspaceId, wsName, isAdmin) => {
    const newEntry = { id: workspaceId, name: wsName, lastVisited: new Date().toISOString(), isAdmin, visitCount: 1 };
    const historyKey  = `workspaceHistory_${user?.username || 'guest'}`;
    const statsKey    = `workspaceStats_${user?.username || 'guest'}`;
    const existing    = JSON.parse(localStorage.getItem(historyKey) || '[]');

    // Check if this is a brand-new workspace (not already in history)
    const isNew = !existing.find(item => item.id === workspaceId);

    const filtered    = existing.filter(item => item.id !== workspaceId);
    const updated     = [newEntry, ...filtered].slice(0, 10);

    // Any IDs that got pushed out of the recent-10 window → auto-terminate
    const kept        = new Set(updated.map(w => w.id));
    const pushedOut   = filtered.filter(w => !kept.has(w.id)).map(w => w.id);
    if (pushedOut.length > 0) {
      const terminated = JSON.parse(localStorage.getItem('terminatedSessions') || '[]');
      const merged     = [...new Set([...terminated, ...pushedOut])];
      localStorage.setItem('terminatedSessions', JSON.stringify(merged));
      setTerminatedSessions(merged);
    }

    // Persist running total independently (never trimmed)
    if (isNew) {
      const stats = JSON.parse(localStorage.getItem(statsKey) || '{"total":0,"asAdmin":0,"asMember":0}');
      stats.total  += 1;
      if (isAdmin) stats.asAdmin  += 1;
      else         stats.asMember += 1;
      localStorage.setItem(statsKey, JSON.stringify(stats));
    }

    localStorage.setItem(historyKey, JSON.stringify(updated));
    setWorkspaceHistory(updated);
  };

  const formatTimeAgo = (dateString) => {
    const diffMs    = Date.now() - new Date(dateString);
    const diffMins  = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays  = Math.floor(diffMs / 86400000);
    if (diffMins  < 1)  return 'Just now';
    if (diffMins  < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays  < 7)  return `${diffDays}d ago`;
    return new Date(dateString).toLocaleDateString();
  };

  // Read real lifetime stats from the persistent counter (not capped history)
  const persistedStats = (() => {
    const statsKey = `workspaceStats_${user?.username || 'guest'}`;
    return JSON.parse(localStorage.getItem(statsKey) || '{"total":0,"asAdmin":0,"asMember":0}');
  })();

  const userStats = {
    total:      persistedStats.total   || workspaceHistory.length,
    asAdmin:    persistedStats.asAdmin || workspaceHistory.filter(w => w.isAdmin).length,
    // Active = rooms that are confirmed live (have connected users) and not terminated
    active:     workspaceHistory.filter(w => {
      const status = roomsStatus[w.id] || {};
      const isLive = status.live === true && status.userCount > 0;
      const notTerminated = !terminatedSessions.includes(w.id);
      console.log(`[ACTIVE CHECK] ${w.id}: live=${status.live}, userCount=${status.userCount}, terminated=${terminatedSessions.includes(w.id)}`);
      return isLive && notTerminated;
    }).length,
    terminated: terminatedSessions.length,
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceName.trim()) return;

    const sub = user?.subscription || 'basic';
    const limit = sub === 'elite' ? 99999 : (sub === 'pro' ? 50 : 10);
    if (workspaceHistory.length >= limit) {
      toast.error(`Workspace limit (${limit}) reached under the ${sub === 'basic' ? 'Basic (Free)' : 'Pro'} plan. Please upgrade to create more workspaces.`);
      return;
    }

    const workspaceId = generateWorkspaceId();
    const currentUser = user?.username || 'User-' + Math.random().toString(36).substr(2, 4);
    try {
      const response = await fetch(`${API_URL}/create-workspace`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, name: workspaceName, admin: currentUser }),
      });
      if (!response.ok) {
        const errBody = await response.json().catch(() => ({}));
        throw new Error(errBody.error || `Server error (${response.status})`);
      }
      const data = await response.json();
      localStorage.setItem('currentWorkspace', workspaceId);
      localStorage.setItem(`workspace_${workspaceId}_isAdmin`, 'true');
      localStorage.setItem(`workspace_${workspaceId}_userRole`, 'admin');
      setCreatedWorkspace({ id: workspaceId, name: workspaceName, ...data.workspace });
    } catch (error) {
      console.error('Error creating workspace:', error);
      const msg = error.message === 'Failed to fetch'
        ? 'Cannot reach the server. Make sure the backend is running on port 5051.'
        : error.message;
      toast.error('Failed to create workspace: ' + msg);
    }
  };

  const handleCopyId = () => {
    if (createdWorkspace) {
      navigator.clipboard.writeText(createdWorkspace.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyCardId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedCardId(id);
    setTimeout(() => setCopiedCardId(null), 2000);
  };

  const handleEnterWorkspace = () => {
    if (createdWorkspace) {
      saveToHistory(createdWorkspace.id, createdWorkspace.name, true);
      navigate(`/editor/${createdWorkspace.id}`);
    }
  };

  const handleJoinWorkspace = () => {
    if (!joinId.trim()) return;
    localStorage.setItem('currentWorkspace', joinId.trim());
    localStorage.setItem(`workspace_${joinId.trim()}_isAdmin`, 'false');
    localStorage.setItem(`workspace_${joinId.trim()}_userRole`, 'member');
    saveToHistory(joinId.trim(), `Workspace ${joinId.trim().slice(0, 12)}...`, false);
    navigate(`/editor/${joinId.trim()}`);
  };

  // Admin ends a session directly from the dashboard card (no need to rejoin)
  const handleEndFromCard = (roomId) => {
    if (!socketRef.current) return;

    // Join the room socket just long enough to emit end-session
    socketRef.current.emit('join-room', { roomId, username: user?.username || 'admin' });
    // Small delay to ensure join is processed before end-session
    setTimeout(() => {
      socketRef.current.emit('end-session', { roomId });
    }, 300);

    // Mark terminated locally immediately
    const key      = 'terminatedSessions';
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    if (!existing.includes(roomId)) {
      const merged = [...existing, roomId];
      localStorage.setItem(key, JSON.stringify(merged));
      setTerminatedSessions(merged);
    }
    setRoomsStatus(prev => ({ ...prev, [roomId]: { live: false, userCount: 0 } }));
    setConfirmEnd(null);
  };

  const tickerItems = [...LANGUAGES, ...LANGUAGES];

  return (
    <div className="workspace-page">
      {/* Mode Switcher */}
      <div className="workspace-mode-selector">
        <button 
          className="mode-btn active"
        >
          <Code2 size={14} />
          <span>Workspace</span>
        </button>
        <button 
          className="mode-btn"
          onClick={() => navigate('/proctor')}
        >
          <Shield size={14} />
          <span>Proctor</span>
        </button>
      </div>

      <>
          {/* ── HERO ── */}
      <section className="workspace-hero">
        <div className="hero-inner">
          <div className="hero-left">
            <div className="hero-pill"><Wifi size={12} /><span>Live collaboration</span></div>
            <h1>Build Your<br /><span className="highlight">Dream Project</span></h1>
            <p>A real-time collaborative workspace for developers. Write, run, and ship code together — instantly.</p>
            
            {/* Performance Metrics */}
            <div className="hero-metrics">
              <div className="metric-item">
                <div className="metric-value">99.9%</div>
                <div className="metric-label">Uptime</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">&lt;50ms</div>
                <div className="metric-label">Latency</div>
              </div>
              <div className="metric-item">
                <div className="metric-value">14+</div>
                <div className="metric-label">Languages</div>
              </div>
            </div>
            
            <div className="hero-features">
              <span className="hero-feat"><Code2 size={14} /> Multi-language editor</span>
              <span className="hero-feat"><GitBranch size={14} /> Git integration</span>
              <span className="hero-feat"><Terminal size={14} /> Live terminal</span>
            </div>
            <div className="cta-buttons">
              <button className="cta-button primary" onClick={() => { setShowCreateModal(true); setWorkspaceName(''); setCreatedWorkspace(null); }}>
                <Plus size={18} /> Create Workspace
              </button>
              <button className="cta-button secondary" onClick={() => { setShowJoinModal(true); setJoinId(''); }}>
                <Users size={18} /> Join Workspace
              </button>
            </div>
          </div>

          <div className="hero-right">
            <div className="editor-mockup">
              <div className="mockup-bar">
                <span className="dot red"></span><span className="dot yellow"></span><span className="dot green"></span>
                <span className="mockup-title">main.py — BrightCode</span>
                <span className="mockup-live"><span className="live-dot"></span> 3 live</span>
              </div>
              <div className="mockup-body">
                <div className="mockup-sidebar">
                  <span className="sb-item active">main.py</span>
                  <span className="sb-item">utils.js</span>
                  <span className="sb-item">README.md</span>
                  <span className="sb-item">config.json</span>
                </div>
                <div className="mockup-code">
                  <div className="code-line"><span className="ln">1</span><span className="kw">def </span><span className="fn">solve</span><span className="pu">(</span><span className="va">nums</span><span className="pu">):</span></div>
                  <div className="code-line"><span className="ln">2</span><span className="ind"></span><span className="va">seen</span><span className="pu"> = </span><span className="kw">set</span><span className="pu">()</span></div>
                  <div className="code-line"><span className="ln">3</span><span className="ind"></span><span className="kw">for </span><span className="va">n</span><span className="kw"> in </span><span className="va">nums</span><span className="pu">:</span></div>
                  <div className="code-line active-line"><span className="ln">4</span><span className="ind"></span><span className="ind"></span><span className="kw">if </span><span className="va">n</span><span className="kw"> in </span><span className="va">seen</span><span className="pu">:</span></div>
                  <div className="code-line"><span className="ln">5</span><span className="ind"></span><span className="ind"></span><span className="ind"></span><span className="kw">return </span><span className="va">n</span></div>
                  <div className="code-line"><span className="ln">6</span><span className="ind"></span><span className="ind"></span><span className="va">seen</span><span className="pu">.</span><span className="fn">add</span><span className="pu">(</span><span className="va">n</span><span className="pu">)</span></div>
                  <div className="code-line"><span className="ln">7</span><span className="ind"></span><span className="kw">return </span><span className="st">-1</span></div>
                  <div className="code-line empty"><span className="ln">8</span></div>
                  <div className="cursor-blink"></div>
                </div>
              </div>
              <div className="mockup-footer">
                <div className="avatar-stack">
                  <span className="av" style={{ background: '#e74c3c' }}>A</span>
                  <span className="av" style={{ background: '#3498db' }}>K</span>
                  <span className="av" style={{ background: '#2ecc71' }}>S</span>
                </div>
                <span className="footer-status">3 collaborators editing</span>
                <span className="footer-branch"><GitBranch size={12} /> main</span>
              </div>
            </div>
            

          </div>
        </div>
      </section>

      {/* ── LANGUAGE TICKER ── */}
      <div className="lang-strip">
        <div className="lang-track">
          {tickerItems.map((lang, i) => (
            <span className="lang-chip" key={i}>
              <span className="lang-dot" style={{ background: lang.color }}></span>
              {lang.name}
            </span>
          ))}
        </div>
      </div>

      {/* ── FEATURES SHOWCASE (animated sequential) ── */}
      <FeaturesShowcase />

      {/* ── STATS BAR ── */}
      {workspaceHistory.length > 0 && (
        <section className="stats-bar">
          <div className="stats-bar-inner">
            <div className="stats-label">
              <span className="stats-greeting">Welcome back, <strong>{user?.username || 'Developer'}</strong></span>
              <span className="stats-sub">Your workspace activity at a glance</span>
            </div>
            <div className="stats-items">
              <div className="stat-chip">
                <div className="stat-chip-icon" style={{ background: 'rgba(var(--primary-rgb),0.12)', color: 'var(--primary)' }}>
                  <FolderOpen size={18} />
                </div>
                <div>
                  <div className="stat-chip-num">{userStats.total}</div>
                  <div className="stat-chip-lbl">Total Created</div>
                </div>
              </div>
              <div className="stat-sep"></div>
              <div className="stat-chip">
                <div className="stat-chip-icon" style={{ background: 'rgba(52,152,219,0.12)', color: '#3498db' }}>
                  <Crown size={18} />
                </div>
                <div>
                  <div className="stat-chip-num">{userStats.asAdmin}</div>
                  <div className="stat-chip-lbl">Owned</div>
                </div>
              </div>
              <div className="stat-sep"></div>
              <div className="stat-chip">
                <div className="stat-chip-icon" style={{ background: 'rgba(46,204,113,0.12)', color: '#2ecc71' }}>
                  <Wifi size={18} />
                </div>
                <div>
                  <div className="stat-chip-num">{userStats.active}</div>
                  <div className="stat-chip-lbl">Active Sessions</div>
                </div>
              </div>
              <div className="stat-sep"></div>
              <div className="stat-chip">
                <div className="stat-chip-icon" style={{ background: 'rgba(var(--primary-rgb),0.08)', color: 'var(--primary)' }}>
                  <X size={18} />
                </div>
                <div>
                  <div className="stat-chip-num">{userStats.terminated}</div>
                  <div className="stat-chip-lbl">Terminated</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── WORKSPACE CARDS ── */}
      <section className="workspace-history">
        <div className="history-container">
          <div className="history-header">
            <div>
              <h2 className="history-title">Recent Workspaces</h2>
              <p className="history-subtitle">Pick up right where you left off</p>
              {workspaceHistory.length > 0 && (
                <div className="quick-stats">
                  <span className="quick-stat">
                    <span className="quick-stat-value">{workspaceHistory.length}</span>
                    <span className="quick-stat-label">Total</span>
                  </span>
                  <span className="quick-stat-separator">•</span>
                  <span className="quick-stat">
                    <span className="quick-stat-value">{userStats.active}</span>
                    <span className="quick-stat-label">Active</span>
                  </span>
                  <span className="quick-stat-separator">•</span>
                  <span className="quick-stat">
                    <span className="quick-stat-value">{userStats.asAdmin}</span>
                    <span className="quick-stat-label">Owned</span>
                  </span>
                </div>
              )}
            </div>
            <button className="new-ws-btn" onClick={() => { setShowCreateModal(true); setWorkspaceName(''); setCreatedWorkspace(null); }}>
              <Plus size={16} /> New Workspace
            </button>
          </div>

          {workspaceHistory.length > 0 ? (
            <div className="ws-cards-grid">
              {workspaceHistory.map((ws) => {
                const status       = roomsStatus[ws.id] || {};
                const isLive       = status.live === true && !terminatedSessions.includes(ws.id);
                const isTerminated = terminatedSessions.includes(ws.id);
                const userCount    = status.userCount || 0;
                const initials     = ws.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
                const color        = getAvatarColor(ws.id);

                return (
                  <div className={`ws-card ${isLive ? 'ws-card--live' : ''} ${isTerminated ? 'ws-card--terminated' : ''}`} key={ws.id}>

                    <div className="ws-card-accent" style={{ background: isTerminated ? 'linear-gradient(90deg, rgba(255,255,255,0.1), transparent)' : `linear-gradient(90deg, ${color}, transparent)` }}></div>

                    <div className="ws-card-header">
                      <div className="ws-card-avatar" style={
                        isTerminated
                          ? { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }
                          : { background: `${color}1a`, border: `1px solid ${color}40` }
                      }>
                        <span style={{ color: isTerminated ? 'rgba(255,255,255,0.3)' : color }}>{initials}</span>
                      </div>
                      <div className="ws-card-header-right">
                        {isLive && (
                          <span className="ws-card-live-badge">
                            <span className="live-dot"></span> {userCount} live
                          </span>
                        )}
                        {isTerminated && (
                          <span className="ws-card-terminated-badge">Terminated</span>
                        )}
                        <span className={`ws-card-role ${ws.isAdmin ? 'admin' : 'member'}`}>
                          {ws.isAdmin ? <Crown size={10} /> : <User size={10} />}
                          {ws.isAdmin ? 'Admin' : 'Member'}
                        </span>
                      </div>
                    </div>

                    <h3 className="ws-card-name" style={isTerminated ? { color: 'rgba(255,255,255,0.4)' } : {}}>{ws.name}</h3>

                    <div className="ws-card-details">
                      <div className="ws-card-detail-row">
                        <Hash size={12} />
                        <code className="ws-card-id">{ws.id}</code>
                        <button className="ws-card-copy" title="Copy ID" onClick={() => handleCopyCardId(ws.id)}>
                          {copiedCardId === ws.id ? <Check size={11} /> : <Copy size={11} />}
                        </button>
                      </div>
                      <div className="ws-card-detail-row">
                        <Clock size={12} />
                        <span>Last visited {formatTimeAgo(ws.lastVisited)}</span>
                      </div>
                      <div className="ws-card-detail-row">
                        <Calendar size={12} />
                        <span>Created {formatDate(ws.lastVisited)}</span>
                      </div>
                      {isLive && userCount > 0 && (
                        <div className="ws-card-detail-row">
                          <Users size={12} />
                          <span>{userCount} user{userCount !== 1 ? 's' : ''} connected</span>
                        </div>
                      )}
                    </div>

                    <div className="ws-card-divider"></div>

                    <div className="ws-card-footer">
                      <div className="ws-card-status">
                        <span className={`ws-status-dot ${isTerminated ? 'terminated' : isLive ? 'live' : 'ended'}`}></span>
                        <span className="ws-status-text">
                          {isTerminated ? 'Permanently terminated' : isLive ? 'Session active' : 'Session ended'}
                        </span>
                      </div>

                      <div className="ws-card-actions">
                        {/* Admin-only End button — visible when session is live or ended but not terminated */}
                        {ws.isAdmin && !isTerminated && (
                          <button
                            className="ws-card-btn ws-card-btn--end"
                            title="End session permanently"
                            onClick={() => setConfirmEnd(ws.id)}
                          >
                            End
                          </button>
                        )}

                        {isTerminated ? (
                          <span className="ws-card-terminated-action">No longer available</span>
                        ) : isLive ? (
                          <button className="ws-card-btn ws-card-btn--resume" onClick={() => navigate(`/editor/${ws.id}`)}>
                            Resume <ArrowRight size={13} />
                          </button>
                        ) : (
                          <button className="ws-card-btn ws-card-btn--open" onClick={() => navigate(`/editor/${ws.id}`)}>
                            Rejoin <ExternalLink size={12} />
                          </button>
                        )}
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="history-empty">
              <div className="history-empty-icon"><FolderOpen size={36} /></div>
              <h3>No workspaces yet</h3>
              <p>Create or join a workspace to get started. Your recent projects will appear here.</p>
              <button className="cta-button primary" style={{ marginTop: '20px' }}
                onClick={() => { setShowCreateModal(true); setWorkspaceName(''); setCreatedWorkspace(null); }}>
                <Plus size={16} /> Create your first workspace
              </button>
            </div>
          )}
        </div>
      </section>
        </>

      {/* ── CREATE MODAL ── */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" type="button"
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); if (createdWorkspace) { setCreatedWorkspace(null); setWorkspaceName(''); } else setShowCreateModal(false); }}>
              <X size={20} />
            </button>
            {!createdWorkspace ? (
              <>
                <h3 className="modal-title">Create New Workspace</h3>
                <p className="modal-desc">Give your workspace a name to get started</p>
                {(() => {
                  const sub = user?.subscription || 'basic';
                  const limit = sub === 'elite' ? 99999 : (sub === 'pro' ? 50 : 10);
                  const isLimitReached = workspaceHistory.length >= limit;
                  
                  if (isLimitReached) {
                    return (
                      <div className="limit-warning-banner" style={{
                        padding: '12px',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: '8px',
                        color: '#ef4444',
                        fontSize: '0.8rem',
                        marginBottom: '16px',
                        textAlign: 'center',
                        lineHeight: '1.4'
                      }}>
                        Workspace deployment limit ({limit}) reached under the {sub === 'basic' ? 'Basic (Free)' : 'Pro'} plan. Upgrade clearance in Settings to deploy more workspaces.
                      </div>
                    );
                  }
                  
                  return (
                    <input type="text" className="modal-input" placeholder="My Awesome Project"
                      value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCreateWorkspace()} autoFocus />
                  );
                })()}
                <button className="modal-button primary" onClick={handleCreateWorkspace} 
                  disabled={!workspaceName.trim() || (workspaceHistory.length >= (user?.subscription === 'elite' ? 99999 : (user?.subscription === 'pro' ? 50 : 10)))} type="button">
                  {(workspaceHistory.length >= (user?.subscription === 'elite' ? 99999 : (user?.subscription === 'pro' ? 50 : 10))) ? 'Limit Reached' : 'Create Workspace'}
                </button>
              </>
            ) : (
              <>
                <div className="modal-success"><Check size={48} className="success-icon" /></div>
                <h3 className="modal-title">Workspace Created!</h3>
                <p className="modal-desc">Share this ID with your team to collaborate</p>
                <div className="workspace-id-box">
                  <code className="workspace-id">{createdWorkspace.id}</code>
                  <button className="copy-button workspace-copy-btn" type="button" title="Copy workspace ID"
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopyId(); }}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <button className="modal-button primary" onClick={handleEnterWorkspace} type="button">
                  Enter Workspace <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── JOIN MODAL ── */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowJoinModal(false)}><X size={20} /></button>
            <h3 className="modal-title">Join Workspace</h3>
            <p className="modal-desc">Enter the workspace ID shared by your teammate</p>
            <input type="text" className="modal-input" placeholder="ws-abc123-def456"
              value={joinId} onChange={(e) => setJoinId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinWorkspace()} autoFocus />
            <button className="modal-button secondary" onClick={handleJoinWorkspace} disabled={!joinId.trim()}>
              Join Workspace
            </button>
          </div>
        </div>
      )}

      {/* ── CONFIRM END SESSION FROM CARD ── */}
      {confirmEnd && (
        <div className="modal-overlay" onClick={() => setConfirmEnd(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()} style={{ maxWidth: 420 }}>
            <button className="modal-close" onClick={() => setConfirmEnd(null)}><X size={20} /></button>
            <div className="modal-warn-icon">
              <AlertTriangle size={36} />
            </div>
            <h3 className="modal-title">End Session?</h3>
            <p className="modal-desc">
              This will permanently terminate the workspace for all connected users. This cannot be undone.
            </p>
            <div className="modal-btn-row">
              <button className="modal-button secondary" onClick={() => setConfirmEnd(null)} style={{ flex: 1 }}>
                Cancel
              </button>
              <button className="modal-button danger" onClick={() => handleEndFromCard(confirmEnd)} style={{ flex: 1 }}>
                End Session
              </button>
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
};

export default Workspace;
