import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronRight,
  Code2,
  Zap,
  Users,
  Trophy,
  Globe,
  Shield,
  Terminal,
  Cpu,
  ArrowRight,
  ExternalLink,
  BookOpen,
  Rocket,
  Gamepad2,
  Sword,
  Layout,
  HelpCircle,
  AlertTriangle,
  Mail
} from 'lucide-react';
import PixelTrail from '../components/PixelTrail';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [sessionBanner, setSessionBanner] = useState(false);

  const exploreCards = [
    {
      icon: <Terminal size={40} color="var(--primary)" />,
      title: "Collaborative Forge",
      description: "Real-time pair programming with live sync and AI assistance."
    },
    {
      icon: <Cpu size={40} color="var(--primary)" />,
      title: "Architecture Lab",
      description: "Master system design and high-performance engineering patterns."
    },
    {
      icon: <Trophy size={40} color="var(--primary)" />,
      title: "Syndicate Wars",
      description: "Join factions, compete in sprints, and dominate the leaderboard."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentCard((prev) => (prev + 1) % exploreCards.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [exploreCards.length]);

  // Detect concurrent login redirect
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('error') === 'concurrent_login') {
      setSessionBanner(true);
      // Clean the URL without reload
      window.history.replaceState({}, '', '/');
      const t = setTimeout(() => setSessionBanner(false), 6000);
      return () => clearTimeout(t);
    }
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  return (
    <div className="landing-wrapper">
      {/* Concurrent login banner */}
      <AnimatePresence>
        {sessionBanner && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="concurrent-login-banner"
          >
            <AlertTriangle size={16} />
            <span>Your session was ended because the same account logged in on another device.</span>
            <button onClick={() => setSessionBanner(false)} className="concurrent-close">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navbar */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="nav-logo" onClick={() => navigate('/')}>
            <span>BrightCode</span>
          </div>

          <div className="nav-links">
            <button className="nav-link-btn" onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}>Explore</button>
            <button className="nav-link-btn" onClick={() => document.getElementById('mission')?.scrollIntoView({ behavior: 'smooth' })}>Mission</button>
            <button className="nav-link-btn" onClick={() => document.getElementById('guide')?.scrollIntoView({ behavior: 'smooth' })}>Guide</button>
            <button className="nav-link-btn" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>About</button>
            <button className="nav-link-btn premium" onClick={() => navigate('/auth', { state: { mode: 'register' } })}>Premium</button>
          </div>

          <div className="nav-auth">
            <button className="bootcamp-btn" onClick={() => navigate('/auth', { state: { mode: 'register' } })}>
              Join Bootcamp <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <PixelTrail />
        <div className="hero-container">
          <motion.div
            className="hero-content"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
          >


            <motion.div className="hero-text" variants={itemVariants}>
              <h1>A New Way to Learn</h1>
              <p>
                Sharpen your engineering edge and master technical architecture
                to prepare for the industry's most demanding roles.
              </p>
              <button className="create-account-btn" onClick={() => navigate('/auth', { state: { mode: 'register' } })}>
                Create Account <ChevronRight size={18} />
              </button>
            </motion.div>
          </motion.div>
        </div>
      </header>

      {/* Feature Strip */}
      <div className="feature-strip content-strip">
        <div className="feature-marquee">
          <div className="feature-track">
            <span>REAL-TIME COLLABORATIVE CODING</span>
            <span>ISOLATED EXECUTION SANDBOXES</span>
            <span>INTERACTIVE SKILL FORGE CHALLENGES</span>
            <span>ENTERPRISE ARCHITECTURE LAB</span>
            <span>FACTION-BASED TEAM BATTLES</span>
            <span>GLOBAL ENGINEERING LEADERBOARDS</span>
            <span>AI-POWERED SENTINEL ASSISTANCE</span>
            <span>LOW-LATENCY PAIR PROGRAMMING</span>
          </div>
          <div className="feature-track" aria-hidden="true">
            <span>REAL-TIME COLLABORATIVE CODING</span>
            <span>ISOLATED EXECUTION SANDBOXES</span>
            <span>INTERACTIVE SKILL FORGE CHALLENGES</span>
            <span>ENTERPRISE ARCHITECTURE LAB</span>
            <span>FACTION-BASED TEAM BATTLES</span>
            <span>GLOBAL ENGINEERING LEADERBOARDS</span>
            <span>AI-POWERED SENTINEL ASSISTANCE</span>
            <span>LOW-LATENCY PAIR PROGRAMMING</span>
          </div>
        </div>
      </div>

      {/* Explore Section */}
      <section className="explore-teaser" id="explore">
        <div className="explore-container">
          <motion.div
            className="explore-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="explore-icon-box">
              <Globe size={32} color="var(--primary)" />
            </div>
            <h2>Universal Exploration Hub</h2>
            <p>
              Step into a well-organized ecosystem that helps you get the most out of
              BrightCode by providing structure to guide your progress towards the next
              milestone in your engineering career.
            </p>
            <button className="explore-btn" onClick={() => navigate('/hub')}>
              Enter the Hub <ArrowRight size={18} />
            </button>
          </motion.div>

          <div className="explore-main-layout">
            <div className="side-info left">
              <div className="side-icon-wrap">
                <Zap size={24} color="var(--primary)" />
              </div>
              <h4>High Performance</h4>
              <p>Optimized for low-latency collaboration and rapid execution.</p>
              <div className="side-stat">
                <span className="stat-val">99.9%</span>
                <span className="stat-label">Uptime</span>
              </div>
            </div>

            <div className="explore-carousel-wrapper">
              <div className="carousel-label">
                <span className="label-line"></span>
                <span className="label-text">FEATURED CAPABILITIES</span>
                <span className="label-line"></span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentCard}
                  className="explore-card-active"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                >
                  <div className="card-img-placeholder">
                    {exploreCards[currentCard].icon}
                  </div>
                  <h3>{exploreCards[currentCard].title}</h3>
                  <p>{exploreCards[currentCard].description}</p>
                </motion.div>
              </AnimatePresence>

              <div className="carousel-indicators">
                {exploreCards.map((_, index) => (
                  <div
                    key={index}
                    className={`indicator ${index === currentCard ? 'active' : ''}`}
                    onClick={() => setCurrentCard(index)}
                  />
                ))}
              </div>

              <div className="carousel-footer-text">
                Revolutionizing how you build, learn, and compete.
              </div>
            </div>

            <div className="side-info right">
              <div className="side-icon-wrap">
                <Shield size={24} color="var(--primary)" />
              </div>
              <h4>Enterprise Grade</h4>
              <p>Built with security and scalability at its very core.</p>
              <div className="side-stat">
                <span className="stat-val">AES-256</span>
                <span className="stat-label">Encryption</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="about-project" id="mission">
        <div className="about-container">
          <motion.div
            className="about-grid"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="about-text">
              <span className="about-subtitle">OUR MISSION</span>
              <h2>Engineering Excellence, Redefined</h2>
              <p>
                BrightCode is the definitive platform for engineers who demand more. We've built an ecosystem where real-time collaboration meets competitive coding, where learning factions drive innovation, and where every challenge brings you closer to mastering the craft.
              </p>

              <div className="about-features-grid">
                <div className="about-feature-item">
                  <div className="feat-icon">
                    <Users size={20} />
                  </div>
                  <div className="feat-content">
                    <h4>Faction-Based Learning</h4>
                    <p>Join engineering guilds, compete in syndicate wars, and climb global leaderboards.</p>
                  </div>
                </div>
                <div className="about-feature-item">
                  <div className="feat-icon">
                    <Terminal size={20} />
                  </div>
                  <div className="feat-content">
                    <h4>Live Collaborative Coding</h4>
                    <p>Pair program in real-time with low-latency sync and AI-powered assistance.</p>
                  </div>
                </div>
                <div className="about-feature-item">
                  <div className="feat-icon">
                    <Trophy size={20} />
                  </div>
                  <div className="feat-content">
                    <h4>Skill Forge Challenges</h4>
                    <p>Master system design through timed challenges and earn XP rewards.</p>
                  </div>
                </div>
                <div className="about-feature-item">
                  <div className="feat-icon">
                    <Shield size={20} />
                  </div>
                  <div className="feat-content">
                    <h4>Secure Execution</h4>
                    <p>Run code in isolated sandboxes with enterprise-grade security.</p>
                  </div>
                </div>

              </div>

              <button className="about-cta-btn" onClick={() => navigate('/auth', { state: { mode: 'register' } })}>
                Start Your Journey <ArrowRight size={18} />
              </button>
            </div>

            <div className="about-visual">
              <div className="stats-showcase">
                <motion.div 
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  <div className="stat-icon">
                    <Users size={32} color="var(--primary)" />
                  </div>
                  <div className="stat-number">1,247</div>
                  <div className="stat-label">Faction Challenges</div>
                </motion.div>

                <motion.div 
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="stat-icon">
                    <Gamepad2 size={32} color="var(--primary)" />
                  </div>
                  <div className="stat-number">89</div>
                  <div className="stat-label">XP Challenges</div>
                </motion.div>

                <motion.div 
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="stat-icon">
                    <Sword size={32} color="var(--primary)" />
                  </div>
                  <div className="stat-number">8</div>
                  <div className="stat-label">Library</div>
                </motion.div>

                <motion.div 
                  className="stat-card"
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="stat-icon">
                    <Zap size={32} color="var(--primary)" />
                  </div>
                  <div className="stat-number">99.2%</div>
                  <div className="stat-label">Vault</div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* User Guide Section */}
      <section className="user-module-section" id="guide">
        <div className="user-module-container">

          {/* Top label row */}
          <motion.div
            className="module-top-row"
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="module-eyebrow">
              <span className="module-eyebrow-line" />
              <span className="module-eyebrow-text">User Guide</span>
            </div>
            <div className="module-live-tag">
              <span className="pulse-dot" />
              Live Docs
            </div>
          </motion.div>

          {/* Two-column body */}
          <div className="module-body">

            {/* Left — headline + CTA */}
            <motion.div
              className="module-left"
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2>
                Everything you need<br />
                to <em>master</em> the<br />
                ecosystem.
              </h2>
              <p>
                From first login to faction domination — our comprehensive
                guides cover every feature, shortcut, and workflow inside
                BrightCode.
              </p>
              <div className="module-cta-row">
                <button
                  className="premium-module-btn"
                  onClick={() => navigate('/user-guide')}
                >
                  <span className="btn-content">
                    Learn More <ArrowRight size={16} />
                  </span>
                </button>
                <button
                  className="module-secondary-link"
                  onClick={() => navigate('/hub')}
                >
                  Go to Dashboard →
                </button>
              </div>
            </motion.div>

            {/* Right — feature list */}
            <motion.div
              className="module-right"
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {[
                { icon: <Rocket size={16} />, title: "Getting Started", desc: "Account setup, dashboard tour, and first workspace." },
                { icon: <Layout size={16} />, title: "Collaborative Workspace", desc: "Real-time editing, file sharing, and version control." },
                { icon: <Gamepad2 size={16} />, title: "Code Arena", desc: "Timed challenges, leaderboards, and XP rewards." },
                { icon: <BookOpen size={16} />, title: "CodeVault & Rich Editor", desc: "Notes, markdown, diagrams, and media embeds." },
                { icon: <Sword size={16} />, title: "Factions & Competition", desc: "Join groups, compete in sprints, climb rankings." },
                { icon: <HelpCircle size={16} />, title: "Keyboard Shortcuts", desc: "Full reference for power-user navigation." },
              ].map((f, i) => (
                <motion.div
                  key={i}
                  className="module-feature-row"
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                >
                  <div className="mf-icon">{f.icon}</div>
                  <div className="mf-text">
                    <span className="mf-title">{f.title}</span>
                    <span className="mf-desc">{f.desc}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="about">
        <div className="footer-container">
          <motion.div 
            className="footer-content"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="footer-brand-section">
              <motion.div 
                className="footer-logo-large"
                onClick={() => navigate('/')}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <div className="logo-icon-wrapper">
                  <Code2 size={32} color="var(--primary)" />
                </div>
                <div className="logo-text-wrapper">
                  <span className="logo-text-large">BrightCode</span>
                  <span className="logo-tagline">Engineering Excellence</span>
                </div>
              </motion.div>
              
              <p className="footer-tagline">
                The definitive platform for engineers who demand more. Master your craft through competitive coding and collaborative learning.
              </p>

              <div className="footer-cta">
                <motion.button 
                  className="footer-cta-btn"
                  onClick={() => navigate('/auth', { state: { mode: 'register' } })}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Building <ArrowRight size={16} />
                </motion.button>
              </div>
            </div>

            <div className="footer-links-section">
              <div className="footer-link-group">
                <h4 className="footer-link-title">Platform</h4>
                <div className="footer-link-list">
                  <motion.a 
                    href="#" 
                    className="footer-link"
                    whileHover={{ x: 5 }}
                  >
                    <span className="link-dot"></span>
                    Explore
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="footer-link"
                    whileHover={{ x: 5 }}
                  >
                    <span className="link-dot"></span>
                    Challenges
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="footer-link"
                    whileHover={{ x: 5 }}
                  >
                    <span className="link-dot"></span>
                    Factions
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="footer-link"
                    whileHover={{ x: 5 }}
                  >
                    <span className="link-dot"></span>
                    Leaderboard
                  </motion.a>
                </div>
              </div>

              <div className="footer-link-group">
                <h4 className="footer-link-title">Resources</h4>
                <div className="footer-link-list">
                  <motion.a 
                    href="/user-guide" 
                    className="footer-link"
                    whileHover={{ x: 5 }}
                  >
                    <span className="link-dot"></span>
                    User Guide
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="footer-link"
                    whileHover={{ x: 5 }}
                  >
                    <span className="link-dot"></span>
                    Documentation
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="footer-link"
                    whileHover={{ x: 5 }}
                  >
                    <span className="link-dot"></span>
                    API Reference
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="footer-link"
                    whileHover={{ x: 5 }}
                  >
                    <span className="link-dot"></span>
                    Community
                  </motion.a>
                </div>
              </div>

              <div className="footer-link-group">
                <h4 className="footer-link-title">Connect</h4>
                <div className="footer-social-grid">
                  <motion.a 
                    href="#" 
                    className="social-card"
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="social-card"
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="social-card"
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                  </motion.a>
                  <motion.a 
                    href="#" 
                    className="social-card"
                    whileHover={{ y: -5, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Mail size={20} />
                  </motion.a>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="footer-bottom"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="footer-bottom-content">
              <span className="footer-copyright">
                &copy; {new Date().getFullYear()} BrightCode. Crafted with precision.
              </span>
              <div className="footer-legal-links">
                <a href="#" className="footer-legal-link">Privacy</a>
                <span className="footer-separator">•</span>
                <a href="#" className="footer-legal-link">Terms</a>
                <span className="footer-separator">•</span>
                <a href="#" className="footer-legal-link">Cookies</a>
              </div>
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
