import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, User, Settings as SettingsIcon, Save, Plus, X, LogOut, Shield, Info, Globe, Terminal, Mail, Calendar, ShieldCheck, ChevronRight, Layers, Zap, Users, Activity, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import Chatbot from '../components/Chatbot';
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
    stack: user?.stack || [],
    avatarId: user?.avatarId || user?.username || '',
    bannerId: user?.bannerId || 'crimson',
    github: user?.github || '',
    leetcode: user?.leetcode || '',
    project1: user?.project1 || '',
    project2: user?.project2 || ''
  });

  const AVATARS = [
    { seed: 'Sniper', rank: 1 }, { seed: 'Ghost', rank: 1 },
    { seed: 'Ninja', rank: 2 }, { seed: 'Viper', rank: 2 },
    { seed: 'Nova', rank: 3 }, { seed: 'Titan', rank: 3 },
    { seed: 'Apex', rank: 4 }, { seed: 'Zero', rank: 4 },
    { seed: 'Hunter', rank: 5 }, { seed: 'Reaper', rank: 5 }
  ];
  const BANNERS = [
    { id: 'crimson', name: 'Crimson Flare', css: 'linear-gradient(135deg, rgba(127, 29, 29, 0.8) 0%, rgba(10, 10, 12, 1) 100%)', rank: 1 },
    { id: 'cyber', name: 'Cyber Neon', css: 'linear-gradient(135deg, rgba(0, 217, 255, 0.6) 0%, rgba(10, 10, 12, 1) 100%)', rank: 2 },
    { id: 'toxic', name: 'Toxic Viper', css: 'linear-gradient(135deg, rgba(34, 197, 94, 0.6) 0%, rgba(10, 10, 12, 1) 100%)', rank: 3 },
    { id: 'void', name: 'Void Phantom', css: 'linear-gradient(135deg, rgba(30, 27, 75, 0.8) 0%, rgba(5, 5, 5, 1) 100%)', rank: 4 },
    { id: 'gold', name: 'Golden Crown', css: 'linear-gradient(135deg, rgba(245, 158, 11, 0.6) 0%, rgba(10, 10, 12, 1) 100%)', rank: 5 },
  ];

  const computeUserRank = (xp) => {
    if (xp >= 10000) return 5;
    if (xp >= 5000) return 4;
    if (xp >= 2000) return 3;
    if (xp >= 500) return 2;
    return 1;
  };

  const userRank = computeUserRank(user?.xp || 0);

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
      avatarId: user?.avatarId || user?.username || '',
      bannerId: user?.bannerId || 'crimson',
      github: user?.github || '',
      leetcode: user?.leetcode || '',
      project1: user?.project1 || '',
      project2: user?.project2 || ''
    }));
  }, [user?.username, user?.stack, user?.avatarId, user?.bannerId, user?.github, user?.leetcode, user?.project1, user?.project2]);

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
    if (savedTheme !== 'amber' && savedTheme !== 'neo-noir' && savedTheme !== 'leetcode') {
      applyFont(savedFont);
    }
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
    } else if (theme === 'leetcode') {
      // ── LeetCode theme ──────────────────────────────
      root.style.setProperty('--primary', '#ffa116');
      root.style.setProperty('--primary-rgb', '255, 161, 22');
      root.style.setProperty('--primary-dark', '#b36b00');
      root.style.setProperty('--primary-dark-rgb', '179, 107, 0');
      root.style.setProperty('--primary-light', '#ffc059');
      root.style.setProperty('--primary-light-rgb', '255, 192, 89');
      root.style.setProperty('--primary-glow', 'rgba(255, 161, 22, 0.4)');
      root.style.setProperty('--complementary', '#2cbb5d');
      root.style.setProperty('--text-complementary', '#ffffff');
      root.style.setProperty('--panel-text', '#ffa116');
      root.style.setProperty('--bg-dark', '#1a1a1a');
      root.style.setProperty('--bg-surface', '#282828');
      root.style.setProperty('--text-main', '#eff1f6');
      root.style.setProperty('--text-muted', '#8c8c8c');
      root.style.setProperty('--text-hi', '#ffffff');
      root.style.setProperty('--text-mid', '#eff1f6');
      root.style.setProperty('--text-lo', '#bfbfbf');
      root.style.setProperty('--font-sans', "'Inter', sans-serif");
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

  const persistProfile = async ({ bio, stack, avatarId, bannerId, github, leetcode, project1, project2 }) => {
    const res = await updateProfile({
      username: user.username,
      bio: bio !== undefined ? bio : (user.bio || ''),
      stack: stack !== undefined ? stack : (user.stack || []),
      avatarId: avatarId !== undefined ? avatarId : (user.avatarId || user.username),
      bannerId: bannerId !== undefined ? bannerId : (user.bannerId || 'crimson'),
      github: github !== undefined ? github : (user.github || ''),
      leetcode: leetcode !== undefined ? leetcode : (user.leetcode || ''),
      project1: project1 !== undefined ? project1 : (user.project1 || ''),
      project2: project2 !== undefined ? project2 : (user.project2 || '')
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
    if (newStackItem.trim() && !formData.stack.includes(newStackItem.trim()) && formData.stack.length < 4) {
      const updatedStack = [...formData.stack, newStackItem.trim()];
      handleUpdateStack(updatedStack);
      setNewStackItem('');
    }
  };

  const removeStackItem = (indexToRemove) => {
    const updatedStack = formData.stack.filter((_, index) => index !== indexToRemove);
    handleUpdateStack(updatedStack);
  };

  const handleAvatarSelect = async (seed, reqRank) => {
    if (userRank < reqRank) {
      toast.error(`Reach Level ${reqRank} to unlock!`);
      return;
    }
    setFormData(prev => ({ ...prev, avatarId: seed }));
    await persistProfile({ avatarId: seed });
  };

  const handleBannerSelect = async (bannerId, reqRank) => {
    if (userRank < reqRank) {
      toast.error(`Reach Level ${reqRank} to unlock!`);
      return;
    }
    setFormData(prev => ({ ...prev, bannerId: bannerId }));
    await persistProfile({ bannerId: bannerId });
  };

  const handleLinkChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (bioSaveTimer.current) clearTimeout(bioSaveTimer.current);
    bioSaveTimer.current = setTimeout(async () => {
      setIsSavingBio(true);
      await persistProfile({ [field]: value });
      setIsSavingBio(false);
    }, 800);
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
                <div 
                  className="profile-header-card premium-header" 
                  style={{ background: BANNERS.find(b => b.id === formData.bannerId)?.css || 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(10,10,15,0.95) 100%)' }}
                >
                  <div className="premium-overlay" />
                  <div className="profile-info-group">
                    <div className="premium-avatar-wrap">
                      <div className="premium-avatar-hex">
                        <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.avatarId || 'Sniper'}&backgroundColor=transparent`} alt="Avatar" />
                      </div>
                    </div>
                    <div className="profile-text">
                      <div className="name-row">
                        <h1>{user.username}</h1>
                        <span className="premium-rank-badge">LVL {userRank} {userRank === 5 ? 'MAX' : ''}</span>
                      </div>
                      <div className="email-row">
                        <Mail size={14} />
                        <span>{user.email}</span>
                      </div>
                      <div className="premium-stats-row">
                        <span className="stat-pill"><Calendar size={12}/> Joined {formatDate(user.createdAt)}</span>
                        <span className="stat-pill"><Activity size={12}/> {activeDays} Sessions</span>
                      </div>
                    </div>
                  </div>
                  <div className="profile-actions">
                    <button type="button" className="action-btn primary" onClick={() => setShowConfigModal(true)}>
                      <Terminal size={16} />
                      <span>Configure System</span>
                    </button>
                    <button
                      type="button"
                      className="action-btn secondary"
                      onClick={() => navigate('/user-guide', { state: { returnTo: '/settings', activeTab: 'details' } })}
                    >
                      <Info size={16} />
                      <span>Intel Guide</span>
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="premium-details-grid">
                  
                  {/* Left Column: Core Identity & Links */}
                  <div className="premium-col">
                    <div className="dashboard-card identity-card">
                      <div className="card-header">
                        <div className="header-icon"><User size={18} /></div>
                        <h3>Identity & Intel</h3>
                      </div>
                      <div className="card-body">
                        <div className="premium-input-group">
                          <label>Operative Bio (Max 30 Chars)</label>
                          <input
                            type="text"
                            className="premium-input"
                            value={formData.bio}
                            maxLength={30}
                            onChange={(e) => handleBioChange(e.target.value)}
                            placeholder="Brief operative bio..."
                          />
                          <span className="save-indicator">{isSavingBio ? 'Saving...' : 'Auto-saves on typing'}</span>
                        </div>

                        <div className="premium-input-group mt-4">
                          <label>Tech Arsenal</label>
                          <div className="stack-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="premium-add-stack">
                              <input
                                type="text"
                                value={newStackItem}
                                onChange={(e) => setNewStackItem(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && addStackItem()}
                                placeholder={formData.stack.length >= 4 ? "Arsenal full (Max 4)" : "Add weapon (e.g. React)..."}
                                disabled={formData.stack.length >= 4}
                              />
                              <button className="premium-add-btn" onClick={addStackItem} disabled={isSaving || formData.stack.length >= 4}>
                                Add
                              </button>
                            </div>
                            
                            <div className="stack-list">
                              {formData.stack.map((item, index) => (
                                <div key={index} className="stack-tag">
                                  <span>{item}</span>
                                  <button className="remove-tag" onClick={() => removeStackItem(index)}>
                                    <X size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        
                        <div className="premium-section-divider"></div>
                        
                        <div className="premium-input-group">
                          <label><Globe size={12} style={{display:'inline', marginRight:'4px'}}/> External Intel Links</label>
                          <div className="premium-links-grid">
                            <div className="intel-input-wrap">
                              <span className="intel-prefix">GH</span>
                              <input type="text" placeholder="GitHub URL..." value={formData.github} onChange={(e) => handleLinkChange('github', e.target.value)} />
                            </div>
                            <div className="intel-input-wrap">
                              <span className="intel-prefix">LC</span>
                              <input type="text" placeholder="LeetCode URL..." value={formData.leetcode} onChange={(e) => handleLinkChange('leetcode', e.target.value)} />
                            </div>
                            <div className="intel-input-wrap">
                              <span className="intel-prefix">P1</span>
                              <input type="text" placeholder="Project Alpha URL..." value={formData.project1} onChange={(e) => handleLinkChange('project1', e.target.value)} />
                            </div>
                            <div className="intel-input-wrap">
                              <span className="intel-prefix">P2</span>
                              <input type="text" placeholder="Project Beta URL..." value={formData.project2} onChange={(e) => handleLinkChange('project2', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Customization */}
                  <div className="premium-col">
                    <div className="dashboard-card identity-card customization-card">
                      <div className="card-header">
                        <div className="header-icon"><Layers size={18} /></div>
                        <h3>Armory</h3>
                      </div>
                      <div className="card-body">
                        <div className="premium-section">
                          <div className="premium-section-header">
                            <h4>Operative Avatars</h4>
                            <span className="premium-badge">Unlock via XP</span>
                          </div>
                          <div className="avatar-selection-grid">
                            {AVATARS.map(({ seed, rank }) => {
                              const isLocked = userRank < rank;
                              return (
                                <div 
                                  key={seed} 
                                  className={`avatar-option premium ${formData.avatarId === seed ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                                  onClick={() => handleAvatarSelect(seed, rank)}
                                >
                                  <img src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}&backgroundColor=transparent`} alt={seed} style={{ opacity: isLocked ? 0.3 : 1 }} />
                                  <div className="avatar-name">{seed}</div>
                                  {isLocked && <div className="lock-overlay"><Lock size={16} /></div>}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="premium-section mt-4">
                          <div className="premium-section-header">
                            <h4>Profile Banners</h4>
                            <span className="premium-badge">Unlock via XP</span>
                          </div>
                          <div className="banner-selection-grid">
                            {BANNERS.map(banner => {
                              const isLocked = userRank < banner.rank;
                              return (
                                <div 
                                  key={banner.id} 
                                  className={`banner-option premium ${formData.bannerId === banner.id ? 'selected' : ''} ${isLocked ? 'locked' : ''}`}
                                  style={{ background: banner.css }}
                                  onClick={() => handleBannerSelect(banner.id, banner.rank)}
                                >
                                  <div className="banner-name">{banner.name}</div>
                                  {formData.bannerId === banner.id && <div className="banner-check"><ShieldCheck size={16} /></div>}
                                  {isLocked && <div className="lock-overlay"><Lock size={20} /></div>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        <div className="status-intel mt-4">
                          <span className="intel-label">SYSTEM CHECK</span>
                          <p>All loadouts secure. Earn XP in Arena to unlock more.</p>
                        </div>
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

                    <div
                      className={`theme-option ${selectedTheme === 'leetcode' ? 'active' : ''}`}
                      onClick={() => handleThemeChange('leetcode')}
                    >
                      <div className="theme-preview leetcode-theme">
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
                        <h3>LeetCode Dark</h3>
                        <p>Clean, basic developer mode</p>
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
      <Chatbot isSidebarOpen={true} />
    </div>
  );
};

export default Settings;
