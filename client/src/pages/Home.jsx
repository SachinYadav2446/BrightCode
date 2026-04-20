import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidV4 } from 'uuid';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
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
  Trophy
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
  const [dropdownOpen, setDropdownOpen] = useState(false);



  const createNewRoom = (e) => {
    e.preventDefault();
    const id = uuidV4();
    setRoomId(id);
    toast.success('Generated a new room ID', { style: { background: '#1e293b', color: '#fff' } });
  };

  const joinRoom = () => {
    if (!user) {
      toast.error('Please login first', { style: { background: '#1e293b', color: '#fff' } });
      navigate('/auth');
      return;
    }
    if (!roomId) {
      toast.error('Room ID is required', { style: { background: '#1e293b', color: '#fff' } });
      return;
    }
    navigate(`/editor/${roomId}`, {
      state: { username: user.username },
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
            <Link to="/arcade" className="nav-link-hover" style={{ color: '#fbbf24', fontWeight: 600 }}>Code Arena</Link>
            <Link to="/leaderboard" className="nav-link-hover">Hall of Fame</Link>
            <Link to="/factions" className="nav-link-hover" style={{ color: '#818cf8' }}>Factions</Link>
            <a href="#toolkit" className="nav-link-hover">Toolkit</a>
            <a href="#features" className="nav-link-hover">Features</a>
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
                      <Zap size={10} fill="#fbbf24" /> {localStorage.getItem('user_xp') || 0} XP
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
        {user ? (
          /* ── USER DASHBOARD: MISSION CONTROL ── */
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mission-control-section"
          >
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
                          <Zap size={12} fill="#fbbf24" /> {user.xp || 0} XP
                        </span>
                        <span className="psc-level-chip">
                          {(user.xp || 0) >= 10000 ? 'Grandmaster' :
                           (user.xp || 0) >= 5000 ? 'Expert' :
                           (user.xp || 0) >= 2000 ? 'Advanced' :
                           (user.xp || 0) >= 500 ? 'Apprentice' : 'Initiate'}
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

                {/* XP Progress Section */}
                <div className="psc-xp-section">
                  <div className="xp-header">
                    <span className="xp-label">Experience Progress</span>
                    <span className="xp-progress-text">{user.xp || 0} / {Math.ceil((user.xp + 1) / 1000) * 1000} XP</span>
                  </div>
                  <div className="psc-prog-bar">
                    <div className="psc-prog-fill" style={{ width: `${((user.xp || 0) % 1000) / 10}%` }}></div>
                  </div>
                  <div className="xp-milestones">
                    <span className="milestone">500</span>
                    <span className="milestone">2K</span>
                    <span className="milestone">5K</span>
                    <span className="milestone">10K</span>
                  </div>
                </div>

                <div className="psc-divider"></div>

                {/* Activity Heatmap */}
                <div className="psc-bottom">
                  <div className="psc-heatmap-section">
                    <div className="heatmap-header">
                      <h4><Zap size={16} fill="#fbbf24" /> Activity Heatmap</h4>
                      <div className="heatmap-streak">🔥 {user.streak || 0} day streak</div>
                    </div>
                    
                    <div className="heatmap-container">
                      <div className="heatmap-grid">
                        {[...Array(266)].map((_, i) => {
                          const level = (user.activity && user.activity[i]) ? Math.min(Math.floor(user.activity[i] / 50), 4) : 0;
                          return (
                            <div key={i} className={`heatmap-cell level-${level}`} title={`XP Gained: ${user.activity?.[i] || 0}`}></div>
                          );
                        })}
                      </div>
                      <div className="heatmap-legend">
                        <span>Less</span>
                        <div className="heatmap-cell level-0"></div>
                        <div className="heatmap-cell level-1"></div>
                        <div className="heatmap-cell level-2"></div>
                        <div className="heatmap-cell level-3"></div>
                        <div className="heatmap-cell level-4"></div>
                        <span>More</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
          
              {/* Workspace Section */}
              <div className="workspace-section-wrapper">
                <div className="workspace-main-card glass-morphism">
                  <div className="workspace-header">
                    <div className="workspace-title-block">
                      <Rocket size={24} className="workspace-icon" />
                      <h2>Quick Launch Workspace</h2>
                    </div>
                    <span className="workspace-badge">LIVE</span>
                  </div>
          
                  <div className="workspace-content-grid">
                    <div className="workspace-form-section">
                      <div className="workspace-input-group">
                        <label>Workspace Session ID</label>
                        <div className="workspace-input-wrapper">
                          <input
                            type="text"
                            className="workspace-premium-input"
                            placeholder="Enter workspace code..."
                            onChange={(e) => setRoomId(e.target.value)}
                            value={roomId}
                            onKeyUp={handleInputEnter}
                          />
                          <button className="copy-btn" onClick={createNewRoom}>
                            <Plus size={16} />
                            <span>New</span>
                          </button>
                        </div>
                      </div>
          
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="workspace-launch-btn"
                        onClick={joinRoom}
                      >
                        <Rocket size={20} />
                        <span>Launch Workspace Session</span>
                        <ChevronRight size={20} />
                      </motion.button>
          
                      <div className="workspace-quick-info">
                        <div className="info-item">
                          <ShieldCheck size={14} />
                          <span>End-to-end encrypted</span>
                        </div>
                        <div className="info-item">
                          <Globe size={14} />
                          <span>Real-time sync enabled</span>
                        </div>
                        <div className="info-item">
                          <Users size={14} />
                          <span>Unlimited collaborators</span>
                        </div>
                      </div>
                    </div>
          
                    <div className="workspace-features-panel">
                      <h3>Workspace Features</h3>
                      <div className="workspace-feature-list">
                        <div className="ws-feature-item">
                          <div className="ws-feature-icon">
                            <Code2 size={18} />
                          </div>
                          <div className="ws-feature-text">
                            <h4>Multi-Language Support</h4>
                            <p>JavaScript, Python, Java & more</p>
                          </div>
                        </div>
                        <div className="ws-feature-item">
                          <div className="ws-feature-icon">
                            <Share2 size={18} />
                          </div>
                          <div className="ws-feature-text">
                            <h4>Instant Sharing</h4>
                            <p>Share workspace with one click</p>
                          </div>
                        </div>
                        <div className="ws-feature-item">
                          <div className="ws-feature-icon">
                            <Terminal size={18} />
                          </div>
                          <div className="ws-feature-text">
                            <h4>Live Console</h4>
                            <p>Real-time output & debugging</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

        <section className="stats-ticker glass-ticker">
          <div className="stat"><strong>1.2m+</strong> <span>LOC Synced Today</span></div>
          <div className="stat"><strong>5ms</strong> <span>Global Latency</span></div>
          <div className="stat"><strong>99.999%</strong> <span>Uptime SLA</span></div>
          <div className="stat"><strong>256-bit</strong> <span>AES Encryption</span></div>
        </section>

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
                <button className="showcase-cta-btn arena-btn" onClick={() => navigate('/arcade')}>
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
            <div className="showcase-content reverse">
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
              <a href="#features">Features</a>
              <a href="#toolkit">Toolkit</a>
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
