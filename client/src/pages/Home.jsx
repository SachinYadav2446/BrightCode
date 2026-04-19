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
  Gamepad2
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
        {/* Dynamic Hero Section */}
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
                {/* Header centered and cleaned */}
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

        <section className="stats-ticker glass-ticker">
          <div className="stat"><strong>1.2m+</strong> <span>LOC Synced Today</span></div>
          <div className="stat"><strong>5ms</strong> <span>Global Latency</span></div>
          <div className="stat"><strong>99.999%</strong> <span>Uptime SLA</span></div>
          <div className="stat"><strong>256-bit</strong> <span>AES Encryption</span></div>
        </section>

        {/* Extensive Features Section */}
        <motion.section
          id="features"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="features-section"
        >
          <div className="section-header center">
            <motion.h2 variants={itemVariants}>Uncompromising Architecture</motion.h2>
            <motion.p variants={itemVariants}>Built from the ground up to bypass traditional latency bottlenecks and deliver desktop-class coding directly on the browser edge.</motion.p>
          </div>

          <div className="features-grid extensive-grid">
            <motion.div variants={itemVariants} className="feature-card premium-glass hover-lift border-highlight">
              <div className="feature-icon-wrapper"><Users className="feature-icon text-gradient" /></div>
              <h3>Multiplayer State</h3>
              <p>Experience real-time operational transformation with predictive cursor tracking across global edge networks.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="feature-card premium-glass hover-lift border-highlight">
              <div className="feature-icon-wrapper"><Cpu className="feature-icon text-gradient" /></div>
              <h3>WASM Compiler</h3>
              <p>Execute JavaScript, Python, C++, and Java code directly in isolated sandboxed environments locally.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="feature-card premium-glass hover-lift border-highlight">
              <div className="feature-icon-wrapper"><ShieldCheck className="feature-icon text-gradient" /></div>
              <h3>Zero-Trust Auth</h3>
              <p>All rooms are protected by cryptographically secure JSON Web Tokens. Your codebase is impenetrable.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="feature-card premium-glass hover-lift border-highlight">
              <div className="feature-icon-wrapper"><Globe className="feature-icon text-gradient" /></div>
              <h3>Edge Hosted</h3>
              <p>WebSockets are terminated at the nearest point of presence for ultimate responsiveness and zero jitters.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="feature-card premium-glass hover-lift border-highlight">
              <div className="feature-icon-wrapper"><Gamepad2 className="feature-icon text-gradient" /></div>
              <h3>Training Arena</h3>
              <p>Master core subjects like CSS layouts, JavaScript logic, and React architectures through interactive modules.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="feature-card premium-glass hover-lift border-highlight">
              <div className="feature-icon-wrapper"><Zap className="feature-icon text-gradient" /></div>
              <h3>Dynamic Isolation</h3>
              <p>Every workspace is isolated in a secure, ephemeral container that self-destructs after completion.</p>
            </motion.div>


            <motion.div variants={itemVariants} className="feature-card premium-glass hover-lift border-highlight">
              <div className="feature-icon-wrapper"><Terminal className="feature-icon text-gradient" /></div>
              <h3>VS Code Core</h3>
              <p>Powered by the Monaco Editor. Enjoy syntax highlighting, intelligent autocomplete, and multiple cursors.</p>
            </motion.div>

            <motion.div variants={itemVariants} className="feature-card premium-glass hover-lift border-highlight">
              <div className="feature-icon-wrapper"><Share2 className="feature-icon text-gradient" /></div>
              <h3>One-Click Share</h3>
              <p>Bypass exhaustive setups. Generate a session token, share it with your team, and pair-program instantly.</p>
            </motion.div>
          </div>
        </motion.section>

        {/* What We Provide Section */}
        <section id="toolkit" className="provision-section parallax-bg">
          <div className="section-header center">
            <h2>Everything Required to Build</h2>
            <p>Code Sight provides a fully integrated ecosystem, stripping away environment friction so you can focus strictly on the logic.</p>
          </div>
          <div className="provision-grid">
            <div className="provision-item glass-morphism">
              <div className="provision-icon-wrapper"><Cpu size={24} className="text-gradient" /></div>
              <div className="provision-content">
                <h4>Isolated Execution Engine</h4>
                <p>Run your scripts in fully protected, containerized Node.js and local compiler instances. Zero setup required on your global path.</p>
              </div>
            </div>
            <div className="provision-item glass-morphism">
              <div className="provision-icon-wrapper"><Code2 size={24} className="text-gradient" /></div>
              <div className="provision-content">
                <h4>Native Language Support</h4>
                <p>Complete execution pipelines established for JavaScript, Python 3, modern C++, and robust Java environments.</p>
              </div>
            </div>
            <div className="provision-item glass-morphism">
              <div className="provision-icon-wrapper"><Terminal size={24} className="text-gradient" /></div>
              <div className="provision-content">
                <h4>Interactive Console Output</h4>
                <p>Stream stdout and stderror processes instantly into your session. Real-time feedback debugging ensures you crush bugs faster.</p>
              </div>
            </div>
            <div className="provision-item glass-morphism">
              <div className="provision-icon-wrapper"><Globe size={24} className="text-gradient" /></div>
              <div className="provision-content">
                <h4>Synchronized Filesystem</h4>
                <p>Multi-file architecture allowing you to construct vast directories. Your entire codebase updates across all peers instantly.</p>
              </div>
            </div>
          </div>
        </section>

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
