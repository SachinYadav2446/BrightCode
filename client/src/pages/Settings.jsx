import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Settings as SettingsIcon, Save, Plus, X, LogOut, Shield, Info, Globe, Terminal, Mail, Calendar, ShieldCheck, ChevronRight, Layers, Zap, Users, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'details');
  const [showConfigModal, setShowConfigModal] = useState(false);

  // Calculate Metrics (similar to Home.jsx)
  const activity = user?.activity || {};
  const todayDateKey = new Date().toISOString().split('T')[0];
  const todaysXp = activity[todayDateKey] || 0;
  const activeDays = Object.keys(activity).length;

  // Form States
  const [formData, setFormData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    stack: user?.stack || []
  });

  // Config Modal States
  const [configData, setConfigData] = useState({
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [newStackItem, setNewStackItem] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingBio, setIsSavingBio] = useState(false);
  const bioSaveTimer = useRef(null);
  const [useMemoryDB, setUseMemoryDB] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState('crimson');
  const [selectedFont, setSelectedFont] = useState('poppins');
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state?.activeTab]);

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      username: user?.username || '',
      stack: user?.stack || [],
    }));
  }, [user?.username, user?.stack]);

  useEffect(() => () => {
    if (bioSaveTimer.current) clearTimeout(bioSaveTimer.current);
  }, []);

  // Apply theme and font on mount
  React.useEffect(() => {
    let savedTheme = localStorage.getItem('app_theme') || 'crimson';
    if (savedTheme === 'cyber-neon') {
      savedTheme = 'neo-noir';
      localStorage.setItem('app_theme', 'neo-noir');
    }
    const savedFont = localStorage.getItem('app_font') || 'poppins';
    setSelectedTheme(savedTheme);
    setSelectedFont(savedFont);
    applyTheme(savedTheme);
    applyFont(savedFont);
  }, []);

  const applyTheme = (theme) => {
    const root = document.documentElement;
    // Remove all theme classes first
    root.classList.remove('theme-minecraft');
    root.classList.remove('theme-cyberpunk');

    if (theme === 'amber') {
      // ── Minecraft / Amber theme ──────────────────────────────
      root.classList.add('theme-minecraft');
      root.style.setProperty('--primary', '#FFD700');
      root.style.setProperty('--primary-rgb', '255, 215, 0');
      root.style.setProperty('--primary-dark', '#c8a020');
      root.style.setProperty('--primary-dark-rgb', '200, 160, 32');
      root.style.setProperty('--primary-light', '#ffe566');
      root.style.setProperty('--primary-light-rgb', '255, 229, 102');
      root.style.setProperty('--primary-glow', 'rgba(255, 215, 0, 0.5)');
      root.style.setProperty('--complementary', '#5D9E3F');
      root.style.setProperty('--text-complementary', '#fffdd0');
      root.style.setProperty('--panel-text', '#fffdd0');
      root.style.setProperty('--bg-dark', '#1a1a1a');
      root.style.setProperty('--bg-surface', '#3a3a3a');
      root.style.setProperty('--text-main', '#fffdd0');
      root.style.setProperty('--text-muted', '#7a7a7a');
      root.style.setProperty('--text-hi', '#fffdd0');
      root.style.setProperty('--text-mid', '#FFD700');
      root.style.setProperty('--text-lo', '#8B6914');
      root.style.setProperty('--font-sans', "'Press Start 2P', monospace");
    } else if (theme === 'neo-noir') {
      // ── Cyberpunk / Neo Noir theme ──────────────────────────────
      root.classList.add('theme-cyberpunk');
      root.style.setProperty('--primary', '#00d9ff');
      root.style.setProperty('--primary-rgb', '0, 217, 255');
      root.style.setProperty('--primary-dark', '#ff0080');
      root.style.setProperty('--primary-dark-rgb', '255, 0, 128');
      root.style.setProperty('--primary-light', '#66e8ff');
      root.style.setProperty('--primary-light-rgb', '102, 232, 255');
      root.style.setProperty('--primary-glow', 'rgba(0, 217, 255, 0.6)');
      root.style.setProperty('--complementary', '#ff0080');
      root.style.setProperty('--text-complementary', '#ffffff');
      root.style.setProperty('--panel-text', '#00d9ff');
      root.style.setProperty('--bg-dark', '#050508');
      root.style.setProperty('--bg-surface', '#0a0a12');
      root.style.setProperty('--text-main', '#e0f7ff');
      root.style.setProperty('--text-muted', '#4a6a7a');
      root.style.setProperty('--text-hi', '#ffffff');
      root.style.setProperty('--text-mid', '#00d9ff');
      root.style.setProperty('--text-lo', '#ff0080');
      root.style.setProperty('--font-sans', "'Orbitron', 'Share Tech Mono', sans-serif");
    } else {
      // ── Scarlet Flare theme (default) ──────────────────────────
      root.style.setProperty('--primary', '#ef4444');
      root.style.setProperty('--primary-rgb', '239, 68, 68');
      root.style.setProperty('--primary-dark', '#dc2626');
      root.style.setProperty('--primary-dark-rgb', '220, 38, 38');
      root.style.setProperty('--primary-light', '#f87171');
      root.style.setProperty('--primary-light-rgb', '248, 113, 113');
      root.style.setProperty('--primary-glow', 'rgba(239, 68, 68, 0.5)');
      root.style.setProperty('--complementary', '#fdf5e6');
      root.style.setProperty('--text-complementary', '#1a1a1a');
      root.style.setProperty('--panel-text', '#1a1a1a');
      root.style.setProperty('--bg-dark', '#0f0f0f');
      root.style.setProperty('--bg-surface', '#1a1a1a');
      // Text variables – always set explicitly to prevent CSS cascade bugs
      root.style.setProperty('--text-main', '#ffffff');
      root.style.setProperty('--text-muted', '#a0a0a0');
      root.style.setProperty('--text-hi', '#fffdd0');   // Cream – the Scarlet Flare signature
      root.style.setProperty('--text-mid', '#f5f5dc');  // Light cream
      root.style.setProperty('--text-lo', '#d2b48c');   // Tan
    }
  };

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    localStorage.setItem('app_theme', theme);

    // Trigger cinematic transition
    setIsTransitioning(true);
    setTimeout(() => {
      window.location.href = '/';
    }, 1000);
  };

  const applyFont = (font) => {
    const root = document.documentElement;
    const fonts = {
      'poppins': "'Poppins', sans-serif",
      'inter': "'Inter', sans-serif",
      'outfit': "'Outfit', sans-serif",
      'montserrat': "'Montserrat', sans-serif"
    };
    root.style.setProperty('--font-sans', fonts[font] || fonts['poppins']);
  };

  const handleFontChange = (font) => {
    setSelectedFont(font);
    localStorage.setItem('app_font', font);
    applyFont(font);

    // Trigger cinematic transition
    setIsTransitioning(true);
    setTimeout(() => {
      window.location.href = '/settings';
    }, 1000);
  };

  if (!user) return null;

  const persistProfile = async ({ bio, stack }) => {
    const res = await updateProfile({
      username: user.username,
      bio: bio !== undefined ? bio : (user.bio || ''),
      stack: stack !== undefined ? stack : (user.stack || []),
    });
    if (!res.success) {
      toast.error(res.error || 'Failed to save profile');
    }
    return res;
  };

  const handleBioChange = (value) => {
    setFormData(prev => ({ ...prev, bio: value }));
    if (bioSaveTimer.current) clearTimeout(bioSaveTimer.current);
    bioSaveTimer.current = setTimeout(async () => {
      setIsSavingBio(true);
      await persistProfile({ bio: value });
      setIsSavingBio(false);
    }, 600);
  };

  const handleUpdateStack = async (newStack) => {
    setIsSaving(true);
    setFormData(prev => ({ ...prev, stack: newStack }));
    try {
      await persistProfile({ stack: newStack });
    } catch {
      toast.error('Failed to update stack');
    } finally {
      setIsSaving(false);
    }
  };

  const addStackItem = () => {
    if (!newStackItem.trim()) return;
    const updatedStack = [...formData.stack, newStackItem.trim()];
    handleUpdateStack(updatedStack);
    setNewStackItem('');
  };

  const removeStackItem = (indexToRemove) => {
    const updatedStack = formData.stack.filter((_, index) => index !== indexToRemove);
    handleUpdateStack(updatedStack);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not Available';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Not Available';
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } catch (e) {
      return 'Not Available';
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCloseModal = () => {
    setShowConfigModal(false);
    setConfigData({
      username: user.username,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleConfigureProfile = async () => {
    setIsSaving(true);
    try {
      let hasChanges = false;

      // Update username if changed
      if (configData.username !== user.username) {
        if (!configData.username.trim()) {
          toast.error('Username cannot be empty');
          setIsSaving(false);
          return;
        }

        const res = await updateProfile({
          username: configData.username,
          bio: user.bio,
          stack: user.stack
        });
        if (!res.success) {
          toast.error(res.error);
          setIsSaving(false);
          return;
        }
        hasChanges = true;
      }

      // Change password if provided
      if (configData.newPassword) {
        if (!configData.currentPassword) {
          toast.error('Current password is required');
          setIsSaving(false);
          return;
        }

        if (configData.newPassword !== configData.confirmPassword) {
          toast.error('New passwords do not match');
          setIsSaving(false);
          return;
        }

        if (configData.newPassword.length < 6) {
          toast.error('Password must be at least 6 characters');
          setIsSaving(false);
          return;
        }

        const res = await changePassword(configData.currentPassword, configData.newPassword);
        if (!res.success) {
          toast.error(res.error);
          setIsSaving(false);
          return;
        }
        hasChanges = true;
      }

      if (!hasChanges) {
        toast.error('No changes to save');
        setIsSaving(false);
        return;
      }

      // Close modal and reset form
      setShowConfigModal(false);
      setConfigData({
        username: user.username,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="settings-page">
      <div className="settings-wrapper">
        {/* Left Sidebar */}
        <aside className="settings-sidebar">
          <nav className="sidebar-nav">
            <button
              className={`nav-item ${activeTab === 'details' ? 'active' : ''}`}
              onClick={() => setActiveTab('details')}
            >
              <User size={20} />
              <span>Identity</span>
            </button>
            <button
              className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <SettingsIcon size={20} />
              <span>System</span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <button className="logout-trigger" onClick={handleLogout}>
              <LogOut size={18} />
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="settings-main">
          <AnimatePresence mode="wait">
            {activeTab === 'details' ? (
              <motion.div
                key="details"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="dashboard-content"
              >
                {/* Profile Header Card */}
                <div className="profile-header-card">
                  <div className="profile-info-group">
                    <div className="profile-avatar">
                      {user.username?.[0]?.toUpperCase() || 'U'}
                      <div className="avatar-status-badge">
                        <ShieldCheck size={12} />
                      </div>
                    </div>
                    <div className="profile-text">
                      <div className="name-row">
                        <h1>{user.username}</h1>
                        <span className="tier-badge">ENTERPRISE</span>
                      </div>
                      <div className="email-row">
                        <Mail size={14} />
                        <span>{user.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className="profile-actions">
                    <button type="button" className="action-btn primary" onClick={() => setShowConfigModal(true)}>
                      <Terminal size={16} />
                      <span>Configure Profile</span>
                    </button>
                    <button
                      type="button"
                      className="action-btn"
                      onClick={() => navigate('/user-guide', { state: { returnTo: '/settings', activeTab: 'details' } })}
                    >
                      <Info size={16} />
                      <span>User Guide</span>
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="details-grid">
                  {/* Identity Card */}
                  <div className="dashboard-card identity-card">
                    <div className="card-header">
                      <div className="header-icon">
                        <User size={18} />
                      </div>
                      <h3>Identity Details</h3>
                    </div>
                    <div className="card-body">
                      <div className="data-row">
                        <span className="data-label">Joined</span>
                        <div className="data-value">
                          <Calendar size={14} />
                          <span>{formatDate(user.createdAt)}</span>
                        </div>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Active Days</span>
                        <div className="data-value">
                          <Activity size={14} />
                          <span>{activeDays} Sessions</span>
                        </div>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Bio</span>
                        <div className="bio-container">
                          <div className="bio-edit-wrapper">
                            <textarea
                              value={formData.bio}
                              onChange={(e) => handleBioChange(e.target.value)}
                              placeholder="Write your bio — saves automatically..."
                              rows={4}
                            />
                            <span className="edit-hint">
                              {isSavingBio ? 'Saving to profile...' : 'Shown on your home page · auto-saves'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="data-row">
                        <span className="data-label">Stack</span>
                        <div className="stack-container">
                          <div className="stack-list">
                            {formData.stack.map((item, index) => (
                              <div key={index} className="stack-tag">
                                <span>{item}</span>
                                <button className="remove-tag" onClick={() => removeStackItem(index)}>
                                  <X size={12} />
                                </button>
                              </div>
                            ))}
                            <div className="add-stack-wrapper">
                              <input
                                type="text"
                                value={newStackItem}
                                onChange={(e) => setNewStackItem(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addStackItem()}
                                placeholder="Add tech..."
                              />
                              <button className="add-tag-btn" onClick={addStackItem} disabled={isSaving}>
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="status-intel">
                        <span className="intel-label">STATUS INTELLIGENCE</span>
                        <p>Your account is in excellent standing</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="dashboard-content"
              >
                {/* System Settings Content */}
                <div className="section-title">
                  <h1>System Configuration</h1>
                  <p>Manage preferences, security, and application settings.</p>
                </div>

                {/* Theme Section */}
                <div className="system-section">
                  <div className="section-header">
                    <h2>Theme</h2>
                  </div>
                  <div className="theme-selector">
                    <div
                      className={`theme-option ${selectedTheme === 'crimson' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('crimson')}
                    >
                      <div className="theme-preview crimson-theme">
                        <div className="preview-header"></div>
                        <div className="preview-content">
                          <div className="preview-sidebar"></div>
                          <div className="preview-main">
                            <div className="preview-line"></div>
                            <div className="preview-line short"></div>
                          </div>
                        </div>
                      </div>
                      <div className="theme-info">
                        <h3>Scarlet Flare</h3>
                        <p>High-energy crimson</p>
                      </div>
                      <div className="theme-check">
                        <ShieldCheck size={16} />
                      </div>
                    </div>

                    <div
                      className={`theme-option ${selectedTheme === 'amber' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('amber')}
                    >
                      <div className="theme-preview amber-theme">
                        <div className="preview-header"></div>
                        <div className="preview-content">
                          <div className="preview-sidebar"></div>
                          <div className="preview-main">
                            <div className="preview-line"></div>
                            <div className="preview-line short"></div>
                          </div>
                        </div>
                      </div>
                      <div className="theme-info">
                        <h3>Creeper Craft</h3>
                        <p>Pixel block world</p>
                      </div>
                      <div className="theme-check">
                        <ShieldCheck size={16} />
                      </div>
                    </div>

                    <div
                      className={`theme-option ${selectedTheme === 'neo-noir' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('neo-noir')}
                    >
                      <div className="theme-preview neo-noir-theme">
                        <div className="preview-header"></div>
                        <div className="preview-content">
                          <div className="preview-sidebar"></div>
                          <div className="preview-main">
                            <div className="preview-line"></div>
                            <div className="preview-line short"></div>
                          </div>
                        </div>
                      </div>
                      <div className="theme-info">
                        <h3>Night City</h3>
                        <p>Cyberpunk neon grid</p>
                      </div>
                      <div className="theme-check">
                        <ShieldCheck size={16} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Font Section - ONLY for Scarlet Flare */}
                {selectedTheme === 'crimson' && (
                  <div className="system-section">
                    <div className="section-header">
                      <h2>Font Style</h2>
                    </div>
                    <div className="font-selector">
                      <div
                        className={`font-option ${selectedFont === 'poppins' ? 'active' : ''}`}
                        onClick={() => handleFontChange('poppins')}
                      >
                        <div className="font-preview" style={{ fontFamily: "'Poppins', sans-serif" }}>Aa</div>
                        <div className="font-info">
                          <h3>Poppins</h3>
                          <p>Modern Geometric</p>
                        </div>
                      </div>
                      <div
                        className={`font-option ${selectedFont === 'inter' ? 'active' : ''}`}
                        onClick={() => handleFontChange('inter')}
                      >
                        <div className="font-preview" style={{ fontFamily: "'Inter', sans-serif" }}>Aa</div>
                        <div className="font-info">
                          <h3>Inter</h3>
                          <p>Clean Precision</p>
                        </div>
                      </div>
                      <div
                        className={`font-option ${selectedFont === 'outfit' ? 'active' : ''}`}
                        onClick={() => handleFontChange('outfit')}
                      >
                        <div className="font-preview" style={{ fontFamily: "'Outfit', sans-serif" }}>Aa</div>
                        <div className="font-info">
                          <h3>Outfit</h3>
                          <p>Elegant Round</p>
                        </div>
                      </div>
                      <div
                        className={`font-option ${selectedFont === 'montserrat' ? 'active' : ''}`}
                        onClick={() => handleFontChange('montserrat')}
                      >
                        <div className="font-preview" style={{ fontFamily: "'Montserrat', sans-serif" }}>Aa</div>
                        <div className="font-info">
                          <h3>Montserrat</h3>
                          <p>Classic Modern</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Danger Zone */}
                <div className="danger-zone">
                  <div className="danger-content">
                    <h3>Sign Out</h3>
                    <p>End your current session and return to landing page.</p>
                  </div>
                  <button className="logout-btn-large" onClick={handleLogout}>
                    <LogOut size={18} />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Configure Profile Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
            />
            <motion.div
              className="config-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            >
              <div className="config-modal-header">
                <div className="config-header-icon">
                  <Terminal size={20} />
                </div>
                <div>
                  <h2>Configure Profile</h2>
                  <p>Update your username and password</p>
                </div>
                <button className="modal-close-btn" onClick={handleCloseModal}>
                  <X size={20} />
                </button>
              </div>

              <div className="config-modal-body">
                <div className="config-input-group">
                  <label>Username</label>
                  <input
                    type="text"
                    value={configData.username}
                    onChange={(e) => setConfigData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter new username"
                  />
                </div>

                <div className="config-divider">
                  <span>Password Change (Optional)</span>
                </div>

                <div className="config-input-group">
                  <label>Current Password</label>
                  <input
                    type="password"
                    value={configData.currentPassword}
                    onChange={(e) => setConfigData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    placeholder="Enter current password"
                  />
                </div>

                <div className="config-input-group">
                  <label>New Password</label>
                  <input
                    type="password"
                    value={configData.newPassword}
                    onChange={(e) => setConfigData(prev => ({ ...prev, newPassword: e.target.value }))}
                    placeholder="Enter new password"
                  />
                </div>

                <div className="config-input-group">
                  <label>Confirm New Password</label>
                  <input
                    type="password"
                    value={configData.confirmPassword}
                    onChange={(e) => setConfigData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                  />
                </div>
              </div>

              <div className="config-modal-footer">
                <button className="config-btn cancel" onClick={handleCloseModal}>
                  Cancel
                </button>
                <button
                  className="config-btn save"
                  onClick={handleConfigureProfile}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            className="theme-transition-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="transition-content">
              <motion.div
                className="transition-logo"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <span className="logo-bright">BRIGHT</span>
                <span className="logo-code">CODE</span>
              </motion.div>
              <motion.div
                className="transition-bar"
                initial={{ width: 0 }}
                animate={{ width: "200px" }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                transition={{ delay: 0.5 }}
              >
                RECONFIGURING SYSTEM CORE...
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Settings;
