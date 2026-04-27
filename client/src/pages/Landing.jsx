import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion';
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
  Mail,
  BookOpen,
  Rocket,
  Gamepad2,
  Sword,
  Layout,
  HelpCircle
} from 'lucide-react';
import PixelTrail from '../components/PixelTrail';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [currentCard, setCurrentCard] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);

  // 3D Sphere Interaction Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["17.5deg", "-17.5deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-17.5deg", "17.5deg"]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);

    // Update custom properties for the glow effect
    e.currentTarget.style.setProperty('--mouse-x', `${(mouseX / width) * 100}%`);
    e.currentTarget.style.setProperty('--mouse-y', `${(mouseY / height) * 100}%`);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const userModuleFeatures = [
    { icon: <BookOpen size={24} />, text: "Project Overview", desc: "Understand the core architecture and vision." },
    { icon: <Rocket size={24} />, text: "Getting Started", desc: "Launch your first workspace in seconds." },
    { icon: <Gamepad2 size={24} />, text: "Code Arena", desc: "Compete in high-stakes engineering challenges." },
    { icon: <Trophy size={24} />, text: "Hall of Fame", desc: "Where the elite engineers are immortalized." },
    { icon: <Layout size={24} />, text: "Workspace", desc: "Experience the next-gen collaborative IDE." },
    { icon: <Sword size={24} />, text: "Factions", desc: "Join forces with specialized developer groups." },
    { icon: <HelpCircle size={24} />, text: "Starter FAQ", desc: "Quick answers to get you up and running." }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % userModuleFeatures.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const exploreCards = [
    {
      icon: <Terminal size={40} color="#ef4444" />,
      title: "Collaborative Forge",
      description: "Real-time pair programming with live sync and AI assistance."
    },
    {
      icon: <Cpu size={40} color="#ef4444" />,
      title: "Architecture Lab",
      description: "Master system design and high-performance engineering patterns."
    },
    {
      icon: <Trophy size={40} color="#ef4444" />,
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
              <Globe size={32} color="#ef4444" />
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
                <Zap size={24} color="#ef4444" />
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
                <Shield size={24} color="#ef4444" />
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
              <h2>Beyond the Code</h2>
              <p>
                BrightCode isn't just a platform; it's a digital ecosystem engineered
                to bridge the gap between theoretical knowledge and industrial-scale
                system architecture. We provide the tools you need to build the future.
              </p>

              <div className="about-features-grid">
                <div className="about-feature-item">
                  <div className="feat-icon">
                    <Zap size={20} />
                  </div>
                  <div className="feat-content">
                    <h4>Real-time Synergy</h4>
                    <p>Collaborate with low-latency sync and AI-assisted pair programming.</p>
                  </div>
                </div>
                <div className="about-feature-item">
                  <div className="feat-icon">
                    <Shield size={20} />
                  </div>
                  <div className="feat-content">
                    <h4>Sandboxed Precision</h4>
                    <p>Execute complex architectures in secure, isolated environments.</p>
                  </div>
                </div>
                <div className="about-feature-item">
                  <div className="feat-icon">
                    <Users size={20} />
                  </div>
                  <div className="feat-content">
                    <h4>Elite Network</h4>
                    <p>Join a community of top-tier engineers pushing technical boundaries.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="about-visual">
              <div className="ide-mockup-container">
                <div className="ide-header">
                  <div className="ide-dots">
                    <span className="ide-dot"></span>
                    <span className="ide-dot"></span>
                    <span className="ide-dot"></span>
                  </div>
                  <div className="ide-tab">
                    <Code2 size={14} />
                    <span>Forge.engine.js</span>
                  </div>
                </div>
                <div className="ide-content">
                  <pre>
                    <code>
                      <span className="code-keyword">async function</span> <span className="code-func">initializeForge</span>(config) {'{'}<br />
                      {'  '}<span className="code-keyword">const</span> core = <span className="code-keyword">new</span> <span className="code-class">Engine</span>(config);<br />
                      <br />
                      {'  '}<span className="code-comment">// Optimize for high-performance clusters</span><br />
                      {'  '}<span className="code-keyword">await</span> core.<span className="code-func">deploy</span>({'{'}<br />
                      {'    '}target: <span className="code-str">'production'</span>,<br />
                      {'    '}mode: <span className="code-str">'performance'</span>,<br />
                      {'    '}autoScale: <span className="code-keyword">true</span><br />
                      {'  '}{'}'});<br />
                      {'}'}
                    </code>
                  </pre>
                </div>
                <div className="ide-glow"></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* User Module Section */}
      <section className="user-module-section" id="guide">
        <div className="user-module-container">
          <motion.div
            className="user-module-sphere-wrapper"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{
              rotateX,
              rotateY,
              transformStyle: "preserve-3d",
            }}
          >
            <motion.div
              className="user-module-card sphere-effect"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="sphere-glow-inner"></div>

              <div className="module-live-tag" style={{ transform: "translateZ(50px)" }}>
                <span className="pulse-dot"></span>
                LIVE DOCS
              </div>

              <div className="module-header-inside" style={{ transform: "translateZ(40px)" }}>
                <div className="module-badge">User Guide</div>
                <h2>Explore the Documentation</h2>
                <p>New here? Dive into our comprehensive guides and master the ecosystem.</p>
              </div>

              <div className="module-main-row" style={{ transform: "translateZ(60px)" }}>
                <div className="module-content">
                  <div className="module-slider-container">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeFeature}
                        className="slider-item"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="slider-icon-box">
                          {userModuleFeatures[activeFeature].icon}
                        </div>
                        <div className="slider-text-content">
                          <h3>{userModuleFeatures[activeFeature].text}</h3>
                          <p>{userModuleFeatures[activeFeature].desc}</p>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                    <div className="slider-dots">
                      {userModuleFeatures.map((_, idx) => (
                        <div
                          key={idx}
                          className={`slider-dot ${idx === activeFeature ? 'active' : ''}`}
                        ></div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="module-footer-inside">
                  <motion.button
                    className="premium-module-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigate('/user-module')}
                    style={{ transform: "translateZ(40px)" }}
                  >
                    <span className="btn-glow"></span>
                    <span className="btn-content">
                      Enter User Guide
                    </span>
                  </motion.button>
                </div>
              </div>

              <div className="module-visual" style={{ transform: "translateZ(30px)" }}>
                <div className="box-surface"></div>
                <div className="floating-elements-bg">
                  <div className="float-element e1"></div>
                  <div className="float-element e2"></div>
                  <div className="float-element e3"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer" id="about">
        <div className="footer-glow"></div>
        <div className="footer-container">
          <div className="footer-top-grid">
            <div className="footer-brand">
              <div className="footer-logo" onClick={() => navigate('/')}>
                <div className="logo-box">
                  <Code2 size={24} color="#fff" />
                </div>
                <span className="logo-text">BrightCode</span>
              </div>
              <p className="footer-description">
                Elevating the standard of technical excellence. The definitive platform for the next generation of engineers.
              </p>
              <div className="footer-social-links">
                <motion.a whileHover={{ y: -3 }} href="#" className="social-icon-btn" title="GitHub">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                </motion.a>
                <motion.a whileHover={{ y: -3 }} href="#" className="social-icon-btn" title="Twitter">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>
                </motion.a>
                <motion.a whileHover={{ y: -3 }} href="#" className="social-icon-btn" title="LinkedIn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
                </motion.a>
                <motion.a whileHover={{ y: -3 }} href="#" className="social-icon-btn" title="More">
                  <ExternalLink size={20} />
                </motion.a>
              </div>
            </div>

            <div className="footer-nav-groups">
              <div className="footer-nav-col">
                <h5 className="footer-nav-title">Platform</h5>
                <ul className="footer-nav-list">
                  <li><a href="#">Explore</a></li>
                  <li><a href="#">Challenges</a></li>
                  <li><a href="#">Factions</a></li>
                  <li><a href="#">Leaderboard</a></li>
                </ul>
              </div>
              <div className="footer-nav-col">
                <h5 className="footer-nav-title">Resources</h5>
                <ul className="footer-nav-list">
                  <li><a href="#">Documentation</a></li>
                  <li><a href="#">System Status</a></li>
                  <li><a href="#">Community</a></li>
                  <li><a href="#">Guidelines</a></li>
                </ul>
              </div>
              <div className="footer-nav-col">
                <h5 className="footer-nav-title">Legal</h5>
                <ul className="footer-nav-list">
                  <li><a href="#">Privacy Policy</a></li>
                  <li><a href="#">Terms of Service</a></li>
                  <li><a href="#">Cookie Policy</a></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="footer-divider"></div>

          <div className="footer-bottom-bar">
            <div className="copyright">
              &copy; {new Date().getFullYear()} BrightCode Ecosystem. All rights reserved.
            </div>
            <div className="footer-bottom-links">
              <span className="built-with">Built for the Elite</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
