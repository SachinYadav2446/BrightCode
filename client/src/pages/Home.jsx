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
  Shield,
  Sword,
  UserPlus,
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
  const [forgeEnterFx, setForgeEnterFx] = useState(false);

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

  const playForgeEnterSound = async () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const now = ctx.currentTime;

      // Premium digital pulse / sweep.
      const master = ctx.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(0.2, now + 0.05);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 1.0);
      master.connect(ctx.destination);

      // Main pulse
      const pulse = ctx.createOscillator();
      pulse.type = 'sine';
      pulse.frequency.setValueAtTime(440, now);
      pulse.frequency.exponentialRampToValueAtTime(880, now + 0.4);
      const pulseGain = ctx.createGain();
      pulseGain.gain.setValueAtTime(0.0001, now);
      pulseGain.gain.exponentialRampToValueAtTime(0.15, now + 0.05);
      pulseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      pulse.connect(pulseGain).connect(master);

      // Subtle resonance
      const res = ctx.createOscillator();
      res.type = 'triangle';
      res.frequency.setValueAtTime(220, now);
      res.frequency.exponentialRampToValueAtTime(440, now + 0.5);
      const resGain = ctx.createGain();
      resGain.gain.setValueAtTime(0.0001, now);
      resGain.gain.exponentialRampToValueAtTime(0.05, now + 0.1);
      resGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      res.connect(resGain).connect(master);

      pulse.start(now);
      res.start(now);
      pulse.stop(now + 1.0);
      res.stop(now + 1.0);

      setTimeout(() => ctx.close().catch(() => {}), 1500);
    } catch {
      // ignore audio failures
    }
  };

  const handleEnterForge = async () => {
    if (forgeEnterFx) return;
    setForgeEnterFx(true);
    playForgeEnterSound();
    setTimeout(() => navigate('/arcade'), 700);
    setTimeout(() => setForgeEnterFx(false), 1400);
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
              <Code2 size={24} color="#ef4444" />
            </div>
            <span className="logo-text">Code Sight</span>
          </motion.div>

          <div className="nav-links">
            <a href="#forge" className="nav-link-hover">Skill Forge</a>
            <a href="#leaderboard" className="nav-link-hover">Hall of Fame</a>
            <a href="#factions" className="nav-link-hover">Forge Alliances</a>
            <a href="#solutions" className="nav-link-hover">Solutions</a>

            {user ? (
              <div className="user-nav-wrapper">
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  padding: '4px 12px 4px 4px',
                  borderRadius: '30px',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}>
                  <div className="avatar-gradient" style={{ border: '2px solid rgba(255, 255, 255, 0.2)', background: '#fff', color: '#000' }}>
                    {user.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span className="username-display" style={{ fontSize: '0.85rem', fontWeight: 600, color: '#fff' }}>{user.username}</span>
                    <span style={{ fontSize: '0.65rem', color: '#fff', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px', opacity: 0.8 }}>
                      <Zap size={10} fill="#fff" /> {xp} XP
                    </span>
                  </div>
                  <button
                    style={{ background: 'transparent', border: 'none', color: '#888', cursor: 'pointer', padding: '4px' }}
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
        {forgeEnterFx && (
          <div className="forge-enter-fx" aria-hidden="true">
            <div className="forge-enter-fx__veil" />
            <div className="forge-enter-fx__patches" />
            <div className="forge-enter-fx__sparks" />
            <div className="forge-enter-fx__text">ACCESSING FORGE</div>
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
            <div className="mission-dashboard-grid single-column">
              {/* Workspace Section */}
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
                              <div style={{ fontSize: '0.68rem', color: '#fff', fontWeight: 700, flexShrink: 0, opacity: 0.8 }}>
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
                                color: '#fff',
                                border: '1px solid rgba(255, 255, 255, 0.35)',
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
                            background: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '10px',
                            padding: '10px 12px',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left'
                          }}
                        >
                          <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.8rem' }}>Sessions Joined</span>
                          <strong style={{ color: '#fff', fontSize: '1.1rem', display: 'block' }}>{sessionTotal}</strong>
                        </button>
                      </div>
                    
                  </div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </motion.section>
        ) : (
          /* ── LANDING PAGE: GHOST VISITOR ── */
          <section className="hero-minimal">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="hero-content-center"
            >
              <h1 className="hero-title-large">
                Crafting The Future.
              </h1>
              <p className="hero-subtitle-clean">
                High-performance environment for modern engineering teams.
              </p>

              <div className="cta-minimal">
                <div className="workspace-join-bar">
                  <input
                    type="text"
                    className="minimal-input"
                    placeholder="Enter Workspace ID"
                    onChange={(e) => setRoomId(e.target.value)}
                    value={roomId}
                    onKeyUp={handleInputEnter}
                  />
                  <button className="minimal-btn" onClick={joinRoom}>
                    Join Session
                  </button>
                </div>
                <div className="secondary-actions">
                  <button onClick={createNewRoom} className="minimal-text-btn">Create New Workspace</button>
                  <span className="divider">|</span>
                  <button onClick={() => navigate('/auth')} className="minimal-text-btn">Sign In</button>
                </div>
              </div>
            </motion.div>
          </section>
        )}

        <div className="below-live-heading-dark">
          <section className="stats-ticker glass-ticker">
            <div className="stat"><strong>Forge Workspace</strong> <span>Collaborative coding with live sync</span></div>
            <div className="stat"><strong>Skill Forge Modules</strong> <span>CSS, Logic, and React challenge tracks</span></div>
            <div className="stat"><strong>XP Tracking</strong> <span>Progress tracking and levels</span></div>
            <div className="stat"><strong>Forge Alliances</strong> <span>Team play and rankings</span></div>
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
            FEATURE SHOWCASE SECTIONS - Forge, Leaderboard, Factions
            ═══════════════════════════════════════════════════════════ */}

          {/* Skill Forge Showcase */}
          <motion.section
            id="forge"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="feature-showcase-section forge-section"
          >
            <div className="showcase-container">
              <div className="showcase-content">
                <motion.div variants={itemVariants} className="showcase-text">
                  <div className="showcase-badge">
                    <Zap size={16} /> SKILL DEVELOPMENT
                  </div>
                  <h2 className="showcase-title">Elite Skill Forge</h2>
                  <p className="showcase-description">
                    Ascend to mastery through our specialized engineering tracks. 
                    From high-performance CSS architectures to complex algorithmic logic, 
                    the Forge is where the world's best developers refine their craft.
                  </p>
                  <div className="showcase-features">
                    <div className="showcase-feature">
                      <Code2 size={18} className="feature-check" />
                      <span>CSS Architecture - Master high-scale styling</span>
                    </div>
                    <div className="showcase-feature">
                      <Terminal size={18} className="feature-check" />
                      <span>Logic Core - Advanced algorithmic patterns</span>
                    </div>
                    <div className="showcase-feature">
                      <Cpu size={18} className="feature-check" />
                      <span>System Design - Scalable component architecture</span>
                    </div>
                  </div>
                <motion.button 
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="showcase-cta-btn forge-btn" 
                  onClick={handleEnterForge}
                >
                    Enter the Forge <ChevronRight size={18} />
                  </motion.button>
                </motion.div>

                <motion.div variants={itemVariants} className="showcase-visual">
                  <div className="visual-card glass-morphism premium-border">
                    <div className="forge-preview">
                      <div className="preview-header">
                        <div className="preview-dots">
                          <span className="dot red"></span>
                          <span className="dot yellow"></span>
                          <span className="dot green"></span>
                        </div>
                        <span className="preview-title">Forge Engine v4.0</span>
                      </div>
                      <div className="preview-content">
                        <div className="code-line"><span className="keyword">const</span> <span className="variable">forge</span> = <span className="keyword">new</span> <span className="class">ForgeEngine</span>();</div>
                        <div className="code-line"><span className="variable">forge</span>.<span className="function">optimize</span>({"{"} <span className="property">performance</span>: <span className="value">'max'</span> {"}"});</div>
                        <div className="code-line"><span className="variable">forge</span>.<span className="function">deploy</span>(<span className="value">'production'</span>);</div>
                      </div>
                      <div className="preview-xp-badge">+500 XP</div>
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
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="feature-showcase-section leaderboard-section"
        >
          <div className="showcase-container">
            <div className="showcase-content reverse">
              <motion.div variants={itemVariants} className="showcase-visual">
                <div className="visual-card glass-morphism premium-border">
                  <div className="leaderboard-preview">
                    <div className="podium-mini">
                      <div className="podium-rank silver">
                        <div className="podium-avatar">JD</div>
                        <span className="podium-name">Dev_Elite</span>
                        <span className="podium-xp">18,450 XP</span>
                      </div>
                      <div className="podium-rank gold">
                        <div className="podium-avatar crowned">SM</div>
                        <span className="podium-name">System_Master</span>
                        <span className="podium-xp">24,320 XP</span>
                      </div>
                      <div className="podium-rank bronze">
                        <div className="podium-avatar">AX</div>
                        <span className="podium-name">Alex_Code</span>
                        <span className="podium-xp">15,890 XP</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="showcase-text">
                <div className="showcase-badge">
                  <Trophy size={16} /> FORGE MASTERS
                </div>
                <h2 className="showcase-title">The Hall of Forge</h2>
                <p className="showcase-description">
                  Immortalize your legacy among the top 1% of engineers. 
                  Compete for dominance, earn master titles, and showcase your 
                  prowess to the entire community.
                </p>
                <div className="showcase-features">
                  <div className="showcase-feature">
                    <Trophy size={18} className="feature-check" />
                    <span>Real-time Global Rankings</span>
                  </div>
                  <div className="showcase-feature">
                    <ShieldCheck size={18} className="feature-check" />
                    <span>Legendary Mastery Titles</span>
                  </div>
                  <div className="showcase-feature">
                    <Users size={18} className="feature-check" />
                    <span>Competitive Alliance Wars</span>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="showcase-cta-btn leaderboard-btn" 
                  onClick={() => navigate('/leaderboard')}
                >
                  View the Hall <ChevronRight size={18} />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Factions Showcase */}
        <motion.section
          id="factions"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="feature-showcase-section factions-section"
        >
          <div className="showcase-container">
            <div className="showcase-content">
              <motion.div variants={itemVariants} className="showcase-text">
                <div className="showcase-badge">
                  <Shield size={16} /> FORGE ALLIANCES
                </div>
                <h2 className="showcase-title">Forge Alliances</h2>
                <p className="showcase-description">
                  Join a global alliance and dominate the forge together. 
                  Coordinate team sprints, share knowledge, 
                  and claim your spot in the ecosystem.
                </p>
                <div className="showcase-features">
                  <div className="showcase-feature">
                    <Sword size={18} className="feature-check" />
                    <span>Alliance Territory Wars</span>
                  </div>
                  <div className="showcase-feature">
                    <UserPlus size={18} className="feature-check" />
                    <span>Exclusive Alliance Workspaces</span>
                  </div>
                  <div className="showcase-feature">
                    <Sparkles size={18} className="feature-check" />
                    <span>Legendary Alliance Rewards</span>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05, x: 10 }}
                  whileTap={{ scale: 0.95 }}
                  className="showcase-cta-btn factions-btn" 
                  onClick={() => navigate('/factions')}
                >
                  Join an Alliance <ChevronRight size={18} />
                </motion.button>
              </motion.div>

              <motion.div variants={itemVariants} className="showcase-visual">
                <div className="visual-card glass-morphism premium-border">
                  <div className="factions-preview">
                    <div className="faction-card-mini">
                      <div className="faction-icon-box">
                        <Shield className="faction-shield" size={32} style={{ color: '#fff' }} />
                      </div>
                      <div className="faction-info">
                        <span className="faction-name">Apex Forge</span>
                        <span className="faction-rank">Rank #1 Global</span>
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
            <h2 style={{ color: '#fff' }}>Engineered for Teams</h2>
            <p>Trusted by engineering cohorts worldwide for critical, high-stakes development sessions.</p>
          </div>
          <div className="use-cases-flex">
            <div className="use-case-card glass-morphism">
              <h3>Technical Interviews</h3>
              <p>Evaluate candidates live on platform. Watch their logic evolve without screen-sharing artifacts.</p>
            </div>
            <div className="use-case-card glass-morphism">
              <h3>Pair Programming</h3>
              <p>Break through complex algorithms side-by-side. Follow cursor trajectories and execute together.</p>
            </div>
            <div className="use-case-card glass-morphism">
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
              <Code2 size={20} style={{ color: '#fff' }} />
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
              <div className="status-pulse" style={{ background: '#fff' }}></div>
              <span>Network Stable</span>
            </div>
            <div className="footer-divider-v"></div>
            <div className="footer-socials">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a0a0a0' }}>GH</a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a0a0a0' }}>LI</a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" style={{ color: '#a0a0a0' }}>TW</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
