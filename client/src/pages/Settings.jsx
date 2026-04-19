import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Sun, Moon, Palette, ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './Settings.css';

const Settings = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (newUsername === user?.username) return;
    setIsSaving(true);
    const res = await updateProfile(newUsername);
    if (res.success) {
      toast.success('System username reconfigured.');
    } else {
      toast.error(res.error);
    }
    setIsSaving(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="settings-page">
      <nav className="settings-nav">
        <button className="back-btn" onClick={() => navigate('/')}>
          <ArrowLeft size={20} /> Back to Hub
        </button>
      </nav>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="settings-container"
      >
        <div className="settings-header">
          <h1>Command Center</h1>
          <p>Read-only environment configurations and profile management.</p>
        </div>

        <div className="settings-grid">
          {/* Sidebar Tabs */}
          <div className="settings-sidebar">
            <button 
                className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
            >
                <User size={18} /> Profiling Data
            </button>
            <button 
                className={`sidebar-link ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
            >
                <Palette size={18} /> Aesthetics System
            </button>
          </div>

          <div className="settings-content">
            {activeTab === 'profile' && (
                <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                      <h2 style={{ margin: 0, borderBottom: 'none' }}>Developer Profile</h2>
                  </div>
                  <div className="profile-card">
                    <div className="profile-avatar-large">
                      {user?.username?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="profile-details">
                      <h3>{user?.username || 'User'}</h3>
                      <p style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ height: '8px', width: '8px', background: '#10b981', borderRadius: '50%', display: 'inline-block' }}></span> 
                          Pro Network Participant
                      </p>
                    </div>
                  </div>
                  
                  <div className="input-group" style={{ marginTop: '30px' }}>
                    <label>System Username</label>
                    <input 
                       type="text" 
                       value={newUsername} 
                       onChange={(e) => setNewUsername(e.target.value)} 
                       className="settings-input" 
                    />
                  </div>

                  <div className="input-group" style={{ opacity: 0.6, marginTop: '20px' }}>
                    <label style={{ display: 'flex', justifyContent: 'space-between' }}>
                        Registered Email 
                        <span style={{ fontSize: '0.65rem', color: '#f59e0b' }}>Protected Identifier</span>
                    </label>
                    <input type="text" value={user?.email || 'Relogin required to sync email'} disabled className="settings-input" style={{ cursor: 'not-allowed' }} />
                  </div>

                  <div className="settings-actions" style={{ marginTop: '40px', borderTop: '1px solid rgba(251, 191, 36, 0.1)', paddingTop: '30px', justifyContent: 'space-between' }}>
                     <button className="primary-btn glow-btn" onClick={handleSave} disabled={isSaving || newUsername === user?.username}>
                         {isSaving ? 'Updating Network...' : 'Save Configuration'}
                     </button>
                     <button className="danger-btn" onClick={handleLogout}>
                         Log Out Securely
                     </button>
                  </div>
                </motion.section>
            )}

            {activeTab === 'appearance' && (
                <motion.section initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="settings-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <h2 style={{ margin: 0, borderBottom: 'none' }}>Engine Aesthetics</h2>
                      <span className="beta-tag" style={{ background: 'rgba(217, 119, 6, 0.2)', color: '#fbbf24', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem' }}>UNDER CONSTRUCTION</span>
                  </div>
                  <p className="section-desc" style={{ marginBottom: '30px' }}>Full reactive dynamic theme variants are currently offline.</p>
                  
                  <div className="theme-options">
                    <div className="theme-card active" style={{ cursor: 'default' }}>
                      <Moon size={24} color="#fbbf24" />
                      <span style={{ color: '#fbbf24' }}>Masterclass Dark (Active)</span>
                    </div>
                    <div className="theme-card locked" onClick={() => toast.error('Light aesthetics engine is currently offline.')}>
                      <Sun size={24} />
                      <span>Light Motif <sup className="beta-tag">STRICT BETA</sup></span>
                    </div>
                  </div>
                </motion.section>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
