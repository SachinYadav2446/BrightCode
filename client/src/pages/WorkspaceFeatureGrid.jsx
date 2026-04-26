import React from 'react';
import { Globe, Users, Zap, Shield, Database } from 'lucide-react';
import './WorkspaceFeatureGrid.css';

const WorkspaceFeatureGrid = () => {
  return (
    <section className="workspace-feature-grid">
      <div className="feature-grid-container">
        {/* Top Left - Live Collaboration */}
        <div className="feature-box top-left">
          <span className="feature-label">COLLABORATION</span>
          <div className="feature-icon-small">
            <Users size={20} />
          </div>
          <span className="feature-title">Real-time Code</span>
          <span className="feature-desc highlight">Sync with team</span>
        </div>

        {/* Bottom Left - Deploy Speed */}
        <div className="feature-box bottom-left">
          <span className="feature-label">DEPLOY</span>
          <div className="feature-icon-small">
            <Zap size={20} />
          </div>
          <span className="feature-title">One-Click Deploy</span>
          <span className="feature-desc highlight">&lt; 30s to live</span>
        </div>

        {/* Center - Main Feature */}
        <div className="feature-box center">
          <div className="center-icon-large">
            <Globe size={40} />
          </div>
          <h2 className="center-title">Cloud Workspace</h2>
          <span className="center-subtitle">Build anywhere, anytime</span>
          <p className="center-desc">
            Access your development environment from any device. 
            Your code, your tools, always available.
          </p>
        </div>

        {/* Top Right - Security */}
        <div className="feature-box top-right">
          <span className="feature-label">SECURITY</span>
          <div className="feature-icon-small">
            <Shield size={20} />
          </div>
          <span className="feature-title">Enterprise Grade</span>
          <span className="feature-desc highlight">End-to-end encrypt</span>
        </div>

        {/* Bottom Right - Storage */}
        <div className="feature-box bottom-right">
          <span className="feature-label">STORAGE</span>
          <div className="feature-icon-small">
            <Database size={20} />
          </div>
          <span className="feature-title">Unlimited Cloud</span>
          <span className="feature-desc">Auto-backup daily</span>
        </div>
      </div>
    </section>
  );
};

export default WorkspaceFeatureGrid;
