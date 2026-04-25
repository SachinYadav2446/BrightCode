import React from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  BookOpen, 
  Rocket, 
  HelpCircle, 
  Gamepad2, 
  Trophy, 
  Layout, 
  Sword,
  Shield,
  Zap,
  Globe,
  Terminal,
  Code2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './UserModule.css';

const UserModule = () => {
  const navigate = useNavigate();

  const sections = [
    {
      id: 'providing',
      icon: <Globe size={24} />,
      title: "What we are providing",
      content: "Code Sight is a high-performance ecosystem designed for the next generation of engineers. We provide an end-to-end platform for collaborative development, competitive programming, and professional networking within specialized factions."
    },
    {
      id: 'start',
      icon: <Rocket size={24} />,
      title: "How to starting",
      content: "Begin your journey by creating an account. Once authenticated, you can join a room using a unique ID, start a new project in the Workspace, or dive straight into the Arcade to test your skills."
    },
    {
      id: 'starters',
      icon: <HelpCircle size={24} />,
      title: "Starters Questions",
      content: "New to the platform? Check our FAQ. We cover everything from setting up your profile to managing your real-time synchronization settings in the editor."
    },
    {
      id: 'arena',
      icon: <Gamepad2 size={24} />,
      title: "Code Arena",
      content: "Enter the Arena to solve complex algorithms and real-world engineering problems. Compete in timed challenges and climb the global leaderboard."
    },
    {
      id: 'fame',
      icon: <Trophy size={24} />,
      title: "Hall of Fame",
      content: "The best of the best are immortalized here. Achieve top rankings in seasonal challenges to earn your spot among the platform's legends."
    },
    {
      id: 'workspace',
      icon: <Layout size={24} />,
      title: "Workspace",
      content: "Our signature IDE-like environment. Experience sub-10ms latency sync, multi-language support (JS, Python, C++, Java), and integrated team communication."
    },
    {
      id: 'faction',
      icon: <Sword size={24} />,
      title: "Factions",
      content: "Join specialized groups of developers. Each faction has its own identity and competitive goals. Work together to dominate the faction-wide leaderboard."
    }
  ];

  return (
    <div className="user-module-page">
      <nav className="module-nav">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> <span>Back to Landing</span>
        </button>
        <div className="nav-brand">
           <Code2 size={24} color="#ef4444" />
           <span>Code Sight / User Module</span>
        </div>
      </nav>

      <div className="module-layout">
        <aside className="module-sidebar">
          <div className="sidebar-header">
            <h3>Quick Navigation</h3>
          </div>
          <div className="sidebar-links">
            {sections.map(sec => (
              <a key={sec.id} href={`#${sec.id}`} className="sidebar-link">
                {sec.icon}
                <span>{sec.title}</span>
              </a>
            ))}
          </div>
        </aside>

        <main className="module-main">
          <motion.div 
            className="module-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="intro-badge">Welcome Explorer</div>
            <h1>Mastering the Ecosystem</h1>
            <p>Your comprehensive guide to navigating, competing, and excelling in Code Sight.</p>
          </motion.div>

          <div className="module-sections-grid">
            {sections.map((sec, index) => (
              <motion.section 
                key={sec.id} 
                id={sec.id}
                className="content-section"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="section-icon-box">
                  {sec.icon}
                </div>
                <div className="section-text">
                  <h2>{sec.title}</h2>
                  <p>{sec.content}</p>
                  <button className="section-cta">Learn more <Zap size={14} /></button>
                </div>
              </motion.section>
            ))}
          </div>

          <footer className="module-page-footer">
             <div className="footer-line"></div>
             <p>All documentation is free and open to the community. Join the elite.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default UserModule;
