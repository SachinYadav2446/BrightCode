import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Settings as SettingsIcon, Save, Plus, X, LogOut, Shield, Info, Globe, Terminal, Mail, Calendar, ShieldCheck, ChevronRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import './Settings.css';

const Settings = () => {
  const { user, updateProfile, changePassword, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('details');
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
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [isEditingStack, setIsEditingStack] = useState(false);
  const [newStackItem, setNewStackItem] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) return null;

  const handleUpdateBio = async () => {
    setIsSaving(true);
    try {
      const res = await updateProfile({
        username: user.username,
        bio: formData.bio,
        stack: user.stack // Keep current stack
      });
      if (res.success) {
        toast.success('Bio updated');
        setIsEditingBio(false);
      } else {
        toast.error(res.error);
      }
    } catch (err) {
      toast.error('Failed to update bio');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateStack = async (newStack) => {
    setIsSaving(true);
    try {
      const res = await updateProfile({
        username: user.username,
        bio: user.bio,
        stack: newStack
      });
      if (res.success) {
        setFormData(prev => ({ ...prev, stack: newStack }));
        toast.success('Stack updated');
      } else {
        toast.error(res.error);
      }
    } catch (err) {
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
    toast.success('Logged out securely');
  };

  const handleConfigureProfile = async () => {
    setIsSaving(true);
    try {
      // Update username if changed
      if (configData.username !== user.username) {
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
        toast.success('Username updated');
      }
      
      // Change password if provided
      if (configData.newPassword) {
        if (configData.newPassword !== configData.confirmPassword) {
          toast.error('Passwords do not match');
          setIsSaving(false);
          return;
        }
        
        const res = await changePassword(configData.currentPassword, configData.newPassword);
        if (!res.success) {
          toast.error(res.error);
          setIsSaving(false);
          return;
        }
        toast.success('Password changed successfully');
      }
      
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
          {/* Top Bar */}
          <div className="top-bar">
            <button className="top-back-btn" onClick={() => navigate('/hub')}>
              <ArrowLeft size={14} />
              <span>Back to Hub</span>
            </button>
          </div>

          <AnimatePresence mode="wait">            {activeTab === 'details' ? (
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
                    <button className="action-btn primary" onClick={() => setActiveTab('details')}>
                      <Terminal size={16} />
                      <span>Configure Profile</span>
                    </button>
                    <button className="action-btn danger" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Sign Out</span>
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
                        <span className="data-label">Bio</span>
                        <div className="bio-container">
                          {isEditingBio ? (
                            <div className="bio-edit-wrapper">
                              <textarea 
                                value={formData.bio}
                                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                                placeholder="Write your bio..."
                                autoFocus
                              />
                              <div className="bio-edit-actions">
                                <button className="bio-btn cancel" onClick={() => setIsEditingBio(false)}>Cancel</button>
                                <button className="bio-btn save" onClick={handleUpdateBio} disabled={isSaving}>
                                  {isSaving ? 'Saving...' : 'Save'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="bio-display-wrapper" onClick={() => {
                              setFormData(prev => ({ ...prev, bio: user.bio || '' }));
                              setIsEditingBio(true);
                            }}>
                              <p className="data-bio">{user.bio || 'No bio set yet.'}</p>
                              <span className="edit-hint">Click to edit bio</span>
                            </div>
                          )}
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

                  {/* Fleet/Metrics Card */}
                  <div className="dashboard-card metrics-card">
                    <div className="card-header">
                      <div className="header-icon">
                        <Globe size={18} />
                      </div>
                      <span className="header-tag">GLOBAL REACH</span>
                    </div>
                    <div className="card-body">
                      <span className="stat-label">ACTIVE DAYS</span>
                      <div className="stat-value">
                        <span className="number">{activeDays}</span>
                        <span className="unit">Active Sessions</span>
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
                  <h1>System Settings</h1>
                  <p>Environment configurations and security protocols.</p>
                </div>

                <div className="settings-cards-grid">
                  <div className="system-card">
                    <div className="card-icon"><Shield size={24} /></div>
                    <div className="card-info">
                      <h3>Security Protocol</h3>
                      <p>Active session protected via RSA-256 encryption.</p>
                    </div>
                  </div>
                  <div className="system-card">
                    <div className="card-icon"><Info size={24} /></div>
                    <div className="card-info">
                      <h3>System Version</h3>
                      <p>v2.4.0-Stable Production Build</p>
                    </div>
                  </div>
                </div>

                <div className="danger-zone">
                  <div className="danger-header">
                    <div className="danger-icon"><LogOut size={20} /></div>
                    <div className="danger-info">
                      <h3>Terminate Connection</h3>
                      <p>This will end your current secure session.</p>
                    </div>
                  </div>
                  <button className="logout-btn-large" onClick={handleLogout}>
                    Sign Out Securely
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Settings;
