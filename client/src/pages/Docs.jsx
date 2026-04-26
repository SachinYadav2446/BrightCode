import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Code2, Users, Settings, Server } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Docs.css';

const Docs = () => {
  const navigate = useNavigate();

  return (
    <div className="docs-page">
      <nav className="settings-nav">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back to Hub
        </button>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="docs-container"
      >
        <div className="docs-header">
          <div className="docs-icon-wrapper"><BookOpen size={32} color="#fbbf24" /></div>
          <h1>System Documentation</h1>
          <p>Everything you need to navigate and master the CodeBright architecture.</p>
        </div>

        <div className="docs-grid">
          <div className="doc-card">
            <div className="doc-icon"><Code2 size={24} /></div>
            <h2>Warp Terminal Initialization</h2>
            <p>Access the core Workspace environment directly from the Hub. Entering any Room ID opens a real-time WebSocket connection to an isolated execution layer. You can instantly generate invite links inside the workspace.</p>
          </div>

          <div className="doc-card">
            <div className="doc-icon"><Users size={24} /></div>
            <h2>Real-Time Sync Protocols</h2>
            <p>All file system events (File Creation, Renaming, Deleting) and keystrokes are synchronized beneath 10ms latency using our dedicated Socket instance. The Collaborator Grid actively tracks connected peers.</p>
          </div>

          <div className="doc-card">
            <div className="doc-icon"><Server size={24} /></div>
            <h2>Code Execution Pipeline</h2>
            <p>Hitting 'Run' triggers a localized secure compilation layer for <code>JavaScript</code>, <code>Python</code>, <code>C++</code>, and <code>Java</code>. Strict output parsing streams errors and terminal results immediately back to your bottom console.</p>
          </div>

          <div className="doc-card">
            <div className="doc-icon"><Settings size={24} /></div>
            <h2>Command Center Configurations</h2>
            <p>Customize your digital footprint. The Settings panel securely handles your JSON Web Tokens (JWT) to safely proxy username modifications and track your protected email identifier directly inside the live filesystem database.</p>
          </div>
        </div>

        <div className="docs-footer-note">
           Platform Architecture Engineered for Teams. CodeBright V1.0
        </div>
      </motion.div>
    </div>
  );
};

export default Docs;
