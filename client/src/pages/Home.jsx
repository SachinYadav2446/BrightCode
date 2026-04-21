import React, { useEffect, useMemo, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
  Code2,
  Zap,
  Users,
  Share2,
  LogOut,
  Plus,
  Terminal,
  ShieldCheck,
  ChevronRight,
  Cpu,
  Sparkles,
  Settings as SettingsIcon,
  Globe,
  Rocket,
  Gamepad2,
  Trophy,
  CalendarDays,
  Flame,
  Target,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './Home.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 80 }
  }
};

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [roomId, setRoomId] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [workspaceHistory, setWorkspaceHistory] = useState([]);
  const [sessionTotalLive, setSessionTotalLive] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [arenaEnterFx, setArenaEnterFx] = useState(false);

  const xp = Number(user?.xp || 0);
  const createdSessions = Number(user?.createdCount ?? localStorage.getItem('created_count') ?? 0);
  const joinedSessions = Number(user?.joinedCount ?? localStorage.getItem('joined_count') ?? 0);
  const sessionTotal = sessionTotalLive || (createdSessions + joinedSessions);
  const historyStorageKey = `workspace_history_${user?.username || 'guest'}`;
  const nextXpMilestone = Math.max(1000, Math.ceil((xp + 1) / 1000) * 1000);
  const xpProgressPercent = Math.min(100, (xp / 10000) * 100);

  const playerTier =
    xp >= 10000 ? 'Grandmaster' :
      xp >= 5000 ? 'Expert' :
        xp >= 2000 ? 'Advanced' :
          xp >= 500 ? 'Apprentice' : 'Initiate';

  useEffect(() => {
    if (!user?.username) return;
    try {
      const raw = localStorage.getItem(historyStorageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      setWorkspaceHistory(Array.isArray(parsed) ? parsed : []);
    } catch {
      setWorkspaceHistory([]);
    }
    setSessionTotalLive(Number(localStorage.getItem('created_count') || 0) + Number(localStorage.getItem('joined_count') || 0));
  }, [user?.username, historyStorageKey]);

  const heatmapData = useMemo(() => {
    if (!user) return { days: [], weeks: [], maxActivity: 0, activeDays: 0, totalActivity: 0, bestDay: null };

    const rawActivity = (user && typeof user.activity === 'object' && user.activity !== null)
      ? user.activity
      : {};
    const WEEKS = 53;
    const totalDays = WEEKS * 7;

    // Anchor to Jan 1, 2026, then align to preceding Sunday
    const weekAlignedStart = new Date(2026, 0, 1);
    weekAlignedStart.setDate(weekAlignedStart.getDate() - weekAlignedStart.getDay());

    // Build day array for the whole year
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const current = new Date(weekAlignedStart);
      current.setDate(weekAlignedStart.getDate() + i);
      days.push({ date: current, activity: 0 });
    }

    // Map activity object keyed by YYYY-MM-DD into the day grid.
    Object.entries(rawActivity).forEach(([dateStr, value]) => {
      const numeric = Number(value || 0);
      if (!Number.isFinite(numeric) || numeric <= 0) return;
      const date = new Date(`${dateStr}T00:00:00`);
      const dayIndex = Math.floor((date - weekAlignedStart) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < totalDays && days[dayIndex]) {
        days[dayIndex].activity = Math.max(0, numeric);
      }
    });

    // Build weeks array for month-label strip
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weeks = [];
    for (let w = 0; w < WEEKS; w++) {
      const firstDay = days[w * 7];
      const month = firstDay ? MONTH_NAMES[firstDay.date.getMonth()] : '';
      // Only label first week of each month
      const isFirstOfMonth = firstDay && firstDay.date.getDate() <= 7;
      weeks.push({ label: isFirstOfMonth ? month : '', weekIdx: w });
    }

    const maxActivity = days.reduce((max, day) => Math.max(max, day.activity), 0);
    const totalActivity = days.reduce((sum, day) => sum + day.activity, 0);
    const activeDays = days.filter((day) => day.activity > 0).length;
    const bestDay = days.reduce((best, day) => (day.activity > (best?.activity || 0) ? day : best), null);

    return { days, weeks, maxActivity, activeDays, totalActivity, bestDay };
  }, [user]);

  const getActivityLevel = (value) => {
    // Any activity should render as green.
    return value > 0 ? 4 : 0;
  };



  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    setIsCreateMode(true);
    toast.success('Generated a new room ID', { style: { background: '#1e293b', color: '#fff' } });
  };

  const saveWorkspaceHistory = (entry) => {
    const next = [entry, ...workspaceHistory].slice(0, 10);
    setWorkspaceHistory(next);
    localStorage.setItem(historyStorageKey, JSON.stringify(next));
  };

  const playArenaEnterSound = async () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Fight bell + impact style cue.
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.26, now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.25);
      master.connect(ctx.destination);

      // Bell body
      const bell = ctx.createOscillator();
      bell.type = 'sine';
      bell.frequency.setValueAtTime(660, now);
      bell.frequency.exponentialRampToValueAtTime(520, now + 0.6);
      const bellGain = ctx.createGain();
      bellGain.gain.setValueAtTime(0.0001, now);
      bellGain.gain.exponentialRampToValueAtTime(0.24, now + 0.03);
      bellGain.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      bell.connect(bellGain).connect(master);

      // Metallic overtone
      const overtone = ctx.createOscillator();
      overtone.type = 'triangle';
      overtone.frequency.setValueAtTime(1320, now);
      overtone.frequency.exponentialRampToValueAtTime(980, now + 0.55);
      const overGain = ctx.createGain();
      overGain.gain.setValueAtTime(0.0001, now);
      overGain.gain.exponentialRampToValueAtTime(0.11, now + 0.02);
      overGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.85);
      overtone.connect(overGain).connect(master);

      // Short fight hit noise
      const noiseBuf = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.20), ctx.sampleRate);
      const data = noiseBuf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
      const noise = ctx.createBufferSource();
      noise.buffer = noiseBuf;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.setValueAtTime(1400, now);
      noiseFilter.Q.setValueAtTime(0.9, now);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.0, now);
      noiseGain.gain.linearRampToValueAtTime(0.09, now + 0.03);
      noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);
      noise.connect(noiseFilter).connect(noiseGain).connect(master);

      bell.start(now);
      overtone.start(now);
      noise.start(now);
      bell.stop(now + 1.05);
      overtone.stop(now + 0.95);
      noise.stop(now + 0.22);

      setTimeout(() => ctx.close().catch(() => {}), 1500);
    } catch {
      // ignore audio failures (autoplay / browser policy)
    }
  };

  const handleEnterArena = async () => {
    if (arenaEnterFx) return;
    setArenaEnterFx(true);
    playArenaEnterSound();
    setTimeout(() => navigate('/arcade'), 700);
    setTimeout(() => setArenaEnterFx(false), 1400);
  };

  const joinRoom = async () => {
    if (!user) {
      toast.error('Please login first', { style: { background: '#1e293b', color: '#fff' } });
      navigate('/auth');
      return;
    }
    if (!roomId) {
      toast.error('Room ID is required', { style: { background: '#1e293b', color: '#fff' } });
      return;
    }

    if (isCreateMode && !workspaceName.trim()) {
      toast.error('Workspace name is required when creating', { style: { background: '#1e293b', color: '#fff' } });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      const sessionType = isCreateMode ? 'created' : 'joined';
      const res = await axios.post(
        'http://localhost:5050/increment-session',
        { type: sessionType },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data?.joinedCount !== undefined) localStorage.setItem('joined_count', String(res.data.joinedCount || 0));
      if (res.data?.createdCount !== undefined) localStorage.setItem('created_count', String(res.data.createdCount || 0));
      setSessionTotalLive(Number(res.data?.createdCount || localStorage.getItem('created_count') || 0) + Number(res.data?.joinedCount || localStorage.getItem('joined_count') || 0));
    } catch {
      // Keep UX smooth even if telemetry fails.
      setSessionTotalLive((prev) => prev + 1);
    }

    saveWorkspaceHistory({
      id: roomId,
      name: (isCreateMode ? workspaceName : '').trim() || `Workspace ${roomId.slice(0, 8)}`,
      action: isCreateMode ? 'Created' : 'Joined',
      timestamp: new Date().toISOString()
    });

    navigate(`/editor/${roomId}`, {
      state: { username: user.username, workspaceName: isCreateMode ? workspaceName.trim() : '' },
    });
  };

  const handleInputEnter = (e) => {
    if (e.code === 'Enter') joinRoom();
  };

  return (
    <div className="homePageWrapper">
      {/* Immersive Background */}
      <div className="bg-container">
        <div className="noise-texture"></div>
        <div className="grid-background"></div>
        <div className="ambient-light main-light"></div>
        <div className="ambient-light secondary-light"></div>
        <div className="ambient-light accent-light"></div>
      </div>

      {/* Floating Navigation */}
      <nav className="floating-nav">
        <div className="nav-container">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="logo-section"
          >
            <div className="logo-icon-wrapper">
              <Code2 size={24} color="#fff" />
            </div>
            <span className="logo-text">Code Sight</span>
          </motion.div>

          <div className="nav-links">
            <a href="#arena" className="nav-link-hover">Code Arena</a>
            <a href="#leaderboard" className="nav-link-hover">Hall of Fame</a>
            <a href="#factions" className="nav-link-hover">Factions</a>
            <a href="#solutions" className="nav-link-hover">Solutions</a>

            {user ? (
              <div className="user-nav-wrapper">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(251, 191, 36, 0.05)',
                  padding: '4px 12px 4px 4px',
                  borderRadius: '30px',
                  border: '1px solid rgba(251, 191, 36, 0.2)'
                }}>
                  <div className="avatar-gradient" style={{ border: '2px solid rgba(251, 191, 36, 0.4)' }}>
                    {user.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span className="username-display" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.username}</span>
                    <span style={{ fontSize: '0.65rem', color: '#fbbf24', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={10} fill="#fbbf24" /> {xp} XP
                    </span>
                  </div>
                  <button
                    style={{ background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: '4px' }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <SettingsIcon size={14} />
                  </button>
                </div>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="dropdown-menu glass-panel"
                    >
                      <div className="dropdown-header">
                        <p className="dropdown-name">{user?.username || 'User'}</p>
                        <p className="dropdown-email">Pro Member</p>
                      </div>
                      <div className="dropdown-divider"></div>
                      <button className="dropdown-item" onClick={() => navigate('/settings')}>
                        <SettingsIcon size={16} /> Profile & Settings
                      </button>
                      <button className="dropdown-item danger" onClick={() => { logout(); setDropdownOpen(false); }}>
                        <LogOut size={16} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link to="/auth" className="shiny-btn login-link">
                <span>Sign In / Register</span>
              </Link>
            )}
          </div>
        </div>
      </nav>

      <main className="landing-container">
        {arenaEnterFx && (
          <div className="arena-enter-fx" aria-hidden="true">
            <div className="arena-enter-fx__veil" />
            <div className="arena-enter-fx__patches" />
            <div className="arena-enter-fx__sparks" />
            <div className="arena-enter-fx__text">ENTERING THE ARENA</div>
          </div>
        )}
        {user ? (
          /* ── USER DASHBOARD: MISSION CONTROL ── */
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mission-control-section"
          >
            {/* Welcome bar */}
            <div className="mission-dashboard-grid">
              {/* Profile Showcase Card */}
              <div className="psc-card glass-morphism">
                {/* Header Section with Avatar and Basic Info */}
                <div className="psc-header">
                  <div className="psc-avatar-section">
                    <div className="psc-avatar-ring">
                      <div className="psc-avatar">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="psc-status-badge">
                      <div className="status-dot"></div>
                      <span>Online</span>
                    </div>
                  </div>

                  <div className="psc-user-details">
                    <div className="psc-username-block">
                      <h1>{user.username}</h1>
                      <div className="psc-badges">
                        <span className="psc-rank-chip premium">
                          <Zap size={12} fill="#fbbf24" /> {xp} XP
                        </span>
                        <span className="psc-level-chip">
                          {playerTier}
                        </span>
                      </div>
                    </div>
                    <div className="psc-meta">
                      <span><ShieldCheck size={14} /> Verified Developer</span>
                      <span><Rocket size={14} /> Joined {new Date(user.joinedAt || Date.now()).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="psc-stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon css-icon"><Code2 size={20} /></div>
                    <div className="stat-info">
                      <span className="stat-value">{user.css_level || 0}</span>
                      <span className="stat-label">CSS Level</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon logic-icon"><Terminal size={20} /></div>
                    <div className="stat-info">
                      <span className="stat-value">{user.logic_level || 0}</span>
                      <span className="stat-label">Logic Level</span>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon react-icon"><Cpu size={20} /></div>
                    <div className="stat-info">
                      <span className="stat-value">{user.react_level || 0}</span>
                      <span className="stat-label">React Level</span>
                    </div>
                  </div>
                </div>

                <div className="psc-highlights-row">
                  <div className="psc-highlight-card">
                    <Flame size={16} />
                    <div>
                      <span>Current Streak</span>
                      <strong>{user.streak || 0} days</strong>
                    </div>
                  </div>
                  <div className="psc-highlight-card">
                    <CalendarDays size={16} />
                    <div>
                      <span>Active Days</span>
                      <strong>{heatmapData.activeDays || (xp > 0 ? 1 : 0)}</strong>
                    </div>
                  </div>
                  <div className="psc-highlight-card">
                    <Target size={16} />
                    <div>
                      <span>Total Activity</span>
                      <strong>{(heatmapData.totalActivity || xp).toLocaleString()} XP</strong>
                    </div>
                  </div>
                </div>

                {/* XP Progress Section */}
                <div className="psc-xp-section">
                  <div className="xp-header">
                    <span className="xp-label">Experience Progress</span>
                    <span className="xp-progress-text">{xp.toLocaleString()} / {nextXpMilestone.toLocaleString()} XP</span>
                  </div>
                  <div className="psc-prog-bar-wrapper">
                    <div className="psc-prog-bar">
                      <div className="psc-prog-fill" style={{ width: `${xpProgressPercent}%` }}></div>
                    </div>
                  </div>
                  <div className="xp-milestones">
                    <span className="milestone" style={{ left: '5%' }}>500</span>
                    <span className="milestone" style={{ left: '20%' }}>2K</span>
                    <span className="milestone" style={{ left: '50%' }}>5K</span>
                    <span className="milestone" style={{ left: '100%' }}>10K+</span>
                  </div>
                </div>

                <div className="psc-divider"></div>
              </div>

              {/* Workspace Section — right column */}
              <div className="workspace-section-wrapper">
                <div className="workspace-main-card glass-morphism">
                  <div className="workspace-header">
                    <div className="workspace-title-block">
                      <Terminal className="workspace-icon" size={24} />
                      <h2>Quick Launch Workspace</h2>
                    </div>
                  </div>

                  <div className="workspace-content-grid">
                    {isHistoryOpen ? (
                      <div className="workspace-form-section" style={{ height: '100%', minHeight: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <div style={{ fontSize: '0.78rem', color: '#a8a29e', fontWeight: 700, letterSpacing: '0.8px' }}>
                            LAST 10 WORKSPACES
                          </div>
                          <button
                            type="button"
                            onClick={() => setIsHistoryOpen(false)}
                            style={{
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.12)',
                              color: '#fff',
                              borderRadius: '8px',
                              padding: '6px 10px',
                              cursor: 'pointer',
                              fontSize: '0.75rem',
                              fontWeight: 700
                            }}
                          >
                            Back
                          </button>
                        </div>
                        <div style={{
                          border: '1px solid rgba(255,255,255,0.08)',
                          borderRadius: '12px',
                          padding: '12px',
                          height: '100%',
                          minHeight: '260px',
                          overflowY: 'auto',
                          background: 'rgba(0,0,0,0.2)'
                        }}>
                          {workspaceHistory.length === 0 ? (
                            <div style={{ fontSize: '0.78rem', color: '#78716c' }}>No workspace history yet.</div>
                          ) : workspaceHistory.map((item, idx) => (
                            <div key={`${item.id}-${idx}`} style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: '10px',
                              padding: '10px 0',
                              borderBottom: idx < workspaceHistory.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none'
                            }}>
                              <div style={{ minWidth: 0 }}>
                                <div style={{ color: '#fff', fontSize: '0.82rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                  {item.name}
                                </div>
                                <div style={{ color: '#a8a29e', fontSize: '0.7rem', fontFamily: 'var(--font-mono)' }}>
                                  {item.id}
                                </div>
                              </div>
                              <div style={{ fontSize: '0.68rem', color: '#fbbf24', fontWeight: 700, flexShrink: 0 }}>
                                {item.action}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                    <div className="workspace-form-section">
                      <div className="workspace-input-group">
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                          <label>Workspace Session ID</label>
                          {isCreateMode && (
                            <button
                              type="button"
                              onClick={() => {
                                setIsCreateMode(false);
                                setWorkspaceName('');
                                setRoomId('');
                              }}
                              style={{
                                background: 'transparent',
                                color: '#ef4444',
                                border: '1px solid rgba(239, 68, 68, 0.35)',
                                borderRadius: '999px',
                                width: '24px',
                                height: '24px',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontWeight: 700,
                                lineHeight: 1
                              }}
                              title="Cancel create mode"
                              aria-label="Cancel create mode"
                            >
                              ×
                            </button>
                          )}
                        </div>
                        <div className="workspace-input-wrapper full-width">
                          <input
                            type="text"
                            className="workspace-premium-input"
                            placeholder="Enter or generate a room code..."
                            onChange={(e) => {
                              setRoomId(e.target.value);
                              if (e.target.value) setIsCreateMode(false);
                            }}
                            value={roomId}
                            onKeyUp={handleInputEnter}
                          />
                        </div>
                      </div>

                      <div className="workspace-input-group">
                        <label>Workspace Name</label>
                        <div className="workspace-input-wrapper full-width">
                          <input
                            type="text"
                            className="workspace-premium-input"
                            placeholder={isCreateMode ? "Give your workspace a name..." : "Generate workspace ID first to name it"}
                            value={workspaceName}
                            onChange={(e) => setWorkspaceName(e.target.value)}
                            disabled={!isCreateMode}
                            style={{ cursor: isCreateMode ? 'text' : 'not-allowed' }}
                          />
                        </div>
                      </div>

                      <div className="workspace-actions-row">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="workspace-action-btn create-btn"
                          onClick={createNewRoom}
                        >
                          <Plus size={18} />
                          <span>Create</span>
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="workspace-action-btn join-btn"
                          onClick={joinRoom}
                        >
                          <Rocket size={18} />
                          <span>Join</span>
                          <ChevronRight size={18} />
                        </motion.button>
                      </div>

                      <div className="workspace-quick-info">
                        <div className="info-item">
                          <ShieldCheck size={14} />
                          <span>E2E Encryption Active</span>
                        </div>
                        <div className="info-item">
                          <Globe size={14} />
                          <span>Global Node: US-EAST-1</span>
                        </div>
                      </div>

                      <div className="workspace-footer-metrics">
                        <button
                          type="button"
                          className="ws-h-stat"
                          onClick={() => setIsHistoryOpen(true)}
                          style={{
                            background: 'rgba(245, 158, 11, 0.08)',
                            border: '1px solid rgba(245, 158, 11, 0.28)',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                          }}
                        >
                          <span>Sessions Joined</span>
                          <strong>{sessionTotal}</strong>
                        </button>
                      </div>
                    
                  </div>
                    )}
                </div>
              </div>
            </div>
          </div>

              <div className="activity-heatmap-master-wrapper">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                className="full-width-heatmap-container glass-morphism"
              >
                <div className="heatmap-header-premium">
                  <div className="hhp-title">
                    <Activity size={20} color="var(--amber)" />
                    <h3>Engineering Activity & Contribution Timeline</h3>
                  </div>
                  <div className="hhp-stats">
                    <div className="hhp-stat">
                      <span>Current Streak</span>
                      <strong>{user.streak || 0} Days</strong>
                    </div>
                    <div className="hhp-sep"></div>
                    <div className="hhp-stat">
                      <span>Rank Weight</span>
                      <strong>{playerTier}</strong>
                    </div>
                  </div>
                </div>

                <div className="heatmap-container-premium">
                  <div className="heatmap-body-premium">
                    <div className="heatmap-layout-premium">
                      <div className="heatmap-month-strip">
                        {(heatmapData.weeks || []).map((w) => (
                          <span key={w.weekIdx}>{w.label}</span>
                        ))}
                      </div>
                      <div className="heatmap-layout-inner">
                        <div className="heatmap-day-labels">
                          <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
                        </div>
                        <div className="heatmap-grid-premium" role="grid" aria-label="User activity heatmap">
                          {heatmapData.days.map((day, i) => {
                            const level = getActivityLevel(day.activity);
                            const prettyDate = day.date.toLocaleDateString(undefined, {
                              weekday: 'short', month: 'short', day: 'numeric'
                            });
                            return (
                              <button
                                key={`${day.date.toISOString()}-${i}`}
                                type="button"
                                className={`heatmap-cell level-${level}`}
                                title={`${prettyDate}: ${day.activity} XP`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="heatmap-sidebar-premium">
                      <div className="heatmap-side-block">
                        <label>Engagement Legend</label>
                        <div className="heatmap-legend-v">
                          <div className="legend-item"><div className="heatmap-cell level-0"></div> <span>Empty</span></div>
                          <div className="legend-item"><div className="heatmap-cell level-4"></div> <span>Active</span></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>
        ) : (
          /* ── LANDING PAGE: GHOST VISITOR ── */
          <section className="hero-grid">
            <motion.div
              initial={{ opacity: 0, filter: 'blur(10px)', y: 40 }}
              animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="hero-content"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="tag-badge shiny-border"
              >
                <Sparkles size={14} className="sparkle-icon" />
                <span>Introducing Architecture V3.1</span>
              </motion.div>

              <h1 className="hero-title">
                Engineering <br />
                <span className="gradient-text animated-gradient">Reimagined.</span>
              </h1>

              <p className="hero-subtitle">
                The world's most performant real-time IDE. Instantly deploy secure, synchronized environments for technical interviews, pair programming, and massive team sprints.
              </p>

              <div className="cta-group">
                <button className="primary-btn pulse-glow" onClick={() => navigate('/auth')}>
                  Start Building Free <ChevronRight size={18} />
                </button>
                <button className="secondary-btn glass-btn">
                  Read the Docs
                </button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9, rotateX: 10, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="room-card-container perspective-wrapper"
            >
              <div className="form-container premium-glass ultra-glass">
                <div className="workspace-card-inner">
                  <div className="form-header-premium">
                    <h3>Engineer Workspace</h3>
                    <p className="form-header-sub">Join or create a real-time coding session</p>
                  </div>
                  <div className="card-divider-h"></div>
                  <div className="input-group">
                    <label>Workspace Identifier</label>
                    <div className="input-with-icon">
                      <input
                        type="text"
                        className="premium-input no-icon"
                        placeholder="code-sight::v3_sync_8f91"
                        onChange={(e) => setRoomId(e.target.value)}
                        value={roomId}
                        onKeyUp={handleInputEnter}
                      />
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="primary-btn glow-btn"
                    onClick={joinRoom}
                  >
                    <span className="btn-content">
                      <Globe size={18} /> Join Workspace Session
                    </span>
                  </motion.button>
                  <div className="room-info-box">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span className="info-text">Starting a new codebase?</span>
                      <span style={{ fontSize: '0.75rem', color: '#a8a29e' }}>Generate a unique ID to invite collaborators.</span>
                    </div>
                    <button onClick={createNewRoom} className="text-link glow-text">New Workspace</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        <div className="below-live-heading-dark">
          <section className="stats-ticker glass-ticker">
            <div className="stat"><strong>Real-Time Workspace</strong> <span>Collaborative coding with live sync</span></div>
            <div className="stat"><strong>Code Arena Modules</strong> <span>CSS, Logic, and React challenge tracks</span></div>
            <div className="stat"><strong>XP & Streak Tracking</strong> <span>Progress heatmap, streaks, and levels</span></div>
            <div className="stat"><strong>Faction & Rankings</strong> <span>Team play and Hall of Fame competition</span></div>
          </section>

          <div className="news-headline-strip" aria-label="Builder headlines">
            <div className="news-headline-marquee">
              <div className="news-headline-track">
                <span>Rise. Build. Repeat. Every solved challenge levels you up.</span>
                <span>Small wins every day become unstoppable momentum.</span>
                <span>Stay consistent: one clean session today beats ten planned tomorrow.</span>
                <span>Debug with patience, learn with curiosity, ship with confidence.</span>
              </div>
              <div className="news-headline-track" aria-hidden="true">
                <span>Rise. Build. Repeat. Every solved challenge levels you up.</span>
                <span>Small wins every day become unstoppable momentum.</span>
                <span>Stay consistent: one clean session today beats ten planned tomorrow.</span>
                <span>Debug with patience, learn with curiosity, ship with confidence.</span>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════
            FEATURE SHOWCASE SECTIONS - Arena, Leaderboard, Factions
            ═══════════════════════════════════════════════════════════ */}

          {/* Code Arena Showcase */}
          <motion.section
            id="arena"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="feature-showcase-section arena-section"
          >
            <div className="showcase-container">
              <div className="showcase-content">
                <motion.div variants={itemVariants} className="showcase-text">
                  <div className="showcase-badge">
                    <Gamepad2 size={16} /> GAMIFIED LEARNING
                  </div>
                  <h2 className="showcase-title">Code Arena</h2>
                  <p className="showcase-description">
                    Master core programming concepts through interactive challenges.
                    Battle through CSS layouts, JavaScript logic puzzles, and React architecture quests.
                    Earn XP, unlock levels, and climb the global rankings.
                  </p>
                  <div className="showcase-features">
                    <div className="showcase-feature">
                      <Code2 size={18} className="feature-check" />
                      <span>CSS Odyssey - Master layouts & styling</span>
                    </div>
                    <div className="showcase-feature">
                      <Terminal size={18} className="feature-check" />
                      <span>Logic Lab - Algorithm challenges</span>
                    </div>
                    <div className="showcase-feature">
                      <Cpu size={18} className="feature-check" />
                      <span>React Quest - Component architecture</span>
                    </div>
                  </div>
                <button className="showcase-cta-btn arena-btn" onClick={handleEnterArena}>
                    Enter the Arena <ChevronRight size={18} />
                  </button>
                </motion.div>

                <motion.div variants={itemVariants} className="showcase-visual">
                  <div className="visual-card glass-morphism">
                    <div className="arena-preview">
                      <div className="preview-header">
                        <div className="preview-dots">
                          <span className="dot red"></span>
                          <span className="dot yellow"></span>
                          <span className="dot green"></span>
                        </div>
                        <span className="preview-title">CSS Challenge - Level 5</span>
                      </div>
                      <div className="preview-content">
                        <div className="code-line"><span className="keyword">display</span>: <span className="value">flex</span>;</div>
                        <div className="code-line"><span className="keyword">justify-content</span>: <span className="value">center</span>;</div>
                        <div className="code-line"><span className="keyword">align-items</span>: <span className="value">center</span>;</div>
                      </div>
                      <div className="preview-xp-badge">+50 XP</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.section>

        {/* Hall of Fame Showcase */}
        <motion.section
          id="leaderboard"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="feature-showcase-section leaderboard-section"
        >
          <div className="showcase-container">
            <div className="showcase-content">
              <motion.div variants={itemVariants} className="showcase-visual">
                <div className="visual-card glass-morphism">
                  <div className="leaderboard-preview">
                    <div className="podium-mini">
                      <div className="podium-rank silver">
                        <div className="podium-avatar">A</div>
                        <span className="podium-name">Alice</span>
                        <span className="podium-xp">8,450 XP</span>
                      </div>
                      <div className="podium-rank gold">
                        <div className="podium-avatar crowned">B</div>
                        <span className="podium-name">Bob</span>
                        <span className="podium-xp">12,320 XP</span>
                      </div>
                      <div className="podium-rank bronze">
                        <div className="podium-avatar">C</div>
                        <span className="podium-name">Carol</span>
                        <span className="podium-xp">6,890 XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="showcase-text">
                <div className="showcase-badge gold-badge">
                  <Zap size={16} /> GLOBAL RANKINGS
                </div>
                <h2 className="showcase-title">Hall of Fame</h2>
                <p className="showcase-description">
                  Compete with developers worldwide and claim your spot on the leaderboard.
                  Track your progress, showcase your mastery level, and rise through the ranks
                  from Initiate to Grandmaster.
                </p>
                <div className="showcase-features">
                  <div className="showcase-feature">
                    <Trophy size={18} className="feature-check" />
                    <span>Live global rankings</span>
                  </div>
                  <div className="showcase-feature">
                    <ShieldCheck size={18} className="feature-check" />
                    <span>Mastery badges & levels</span>
                  </div>
                  <div className="showcase-feature">
                    <Users size={18} className="feature-check" />
                    <span>Real-time XP tracking</span>
                  </div>
                </div>
                <button className="showcase-cta-btn leaderboard-btn" onClick={() => navigate('/leaderboard')}>
                  View Rankings <ChevronRight size={18} />
                </button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Factions Showcase */}
        <motion.section
          id="factions"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={containerVariants}
          className="feature-showcase-section factions-section"
        >
          <div className="showcase-container">
            <div className="showcase-content">
              <motion.div variants={itemVariants} className="showcase-text">
                <div className="showcase-badge faction-badge">
                  <Users size={16} /> TEAM COMPETITION
                </div>
                <h2 className="showcase-title">Factions</h2>
                <p className="showcase-description">
                  Join forces with fellow developers or forge your own faction.
                  Collaborate, compete, and dominate the faction leaderboards.
                  Build your team's reputation and conquer challenges together.
                </p>
                <div className="showcase-features">
                  <div className="showcase-feature">
                    <Users size={18} className="feature-check" />
                    <span>Create or join factions</span>
                  </div>
                  <div className="showcase-feature">
                    <Zap size={18} className="feature-check" />
                    <span>Combined team XP pools</span>
                  </div>
                  <div className="showcase-feature">
                    <Trophy size={18} className="feature-check" />
                    <span>Faction vs faction battles</span>
                  </div>
                </div>
                <button className="showcase-cta-btn factions-btn" onClick={() => navigate('/factions')}>
                  Join a Faction <ChevronRight size={18} />
                </button>
              </motion.div>

              <motion.div variants={itemVariants} className="showcase-visual">
                <div className="visual-card glass-morphism">
                  <div className="factions-preview">
                    <div className="faction-card-preview">
                      <div className="faction-emblem">⚔️</div>
                      <h4>Code Warriors</h4>
                      <div className="faction-stats">
                        <span>12 Members</span>
                        <span>45,680 Total XP</span>
                      </div>
                      <div className="faction-members-preview">
                        <div className="member-avatar">A</div>
                        <div className="member-avatar">B</div>
                        <div className="member-avatar">C</div>
                        <div className="member-avatar more">+9</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Use Cases Section */}
        <section id="solutions" className="use-cases-section">
          <div className="section-header center">
            <h2>Engineered for Teams</h2>
            <p>Trusted by engineering cohorts worldwide for critical, high-stakes development sessions.</p>
          </div>
          <div className="use-cases-flex">
            <div className="use-case-card">
              <h3>Technical Interviews</h3>
              <p>Evaluate candidates live on platform. Watch their logic evolve without screen-sharing artifacts.</p>
            </div>
            <div className="use-case-card">
              <h3>Pair Programming</h3>
              <p>Break through complex algorithms side-by-side. Follow cursor trajectories and execute together.</p>
            </div>
            <div className="use-case-card">
              <h3>Hackathons & Jams</h3>
              <p>Eliminate local 'works on my machine' environments. Standardize your hackathon team instantly.</p>
            </div>
          </div>
        </section>
        </div>
      </main>

      {/* Simple One-line Footer */}
      <footer className="refined-footer">
        <div className="footer-blur-bg"></div>
        <div className="footer-content-wrapper">
          <div className="footer-left">
            <div className="footer-logo">
              <Code2 size={20} className="text-gradient" />
              <span className="footer-logo-text">Code Sight</span>
            </div>
            <div className="footer-divider-v"></div>
            <span className="footer-copyright">© 2026 Logic Lab. All rights reserved.</span>
          </div>

          <div className="footer-center">
            <nav className="footer-nav">
              <a href="#solutions">Solutions</a>
              <a href="/docs">Docs</a>
            </nav>
          </div>

          <div className="footer-right">
            <div className="system-status-indicator">
              <div className="status-pulse"></div>
              <span>Network Stable</span>
            </div>
            <div className="footer-divider-v"></div>
            <div className="footer-socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer">GH</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LI</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">TW</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
