import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, Sun, Moon, Palette, ArrowLeft, Save, Zap, CalendarDays, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import './Settings.css';

const Settings = () => {
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [isSaving, setIsSaving] = useState(false);

  const xp = Number(user?.xp || 0);

  const heatmapData = useMemo(() => {
    if (!user) return { days: [], weeks: [], maxActivity: 0, activeDays: 0, totalActivity: 0, bestDay: null };

    const rawActivity = (user && typeof user.activity === 'object' && user.activity !== null)
      ? user.activity
      : {};
    const WEEKS = 53;
    const totalDays = WEEKS * 7;

    // Anchor to Jan 1, 2026, then align to preceding Sunday
    const weekAlignedStart = new Date(2026, 0, 1);
    weekAlignedStart.setDate(weekAlignedStart.getDate() - weekAlignedStart.getDay());

    // Build day array for the whole year
    const days = [];
    for (let i = 0; i < totalDays; i++) {
      const current = new Date(weekAlignedStart);
      current.setDate(weekAlignedStart.getDate() + i);
      days.push({ date: current, activity: 0 });
    }

    // Map activity object keyed by YYYY-MM-DD into the day grid.
    Object.entries(rawActivity).forEach(([dateStr, value]) => {
      const numeric = Number(value || 0);
      if (!Number.isFinite(numeric) || numeric <= 0) return;
      const date = new Date(`${dateStr}T00:00:00`);
      const dayIndex = Math.floor((date - weekAlignedStart) / (24 * 60 * 60 * 1000));
      if (dayIndex >= 0 && dayIndex < totalDays && days[dayIndex]) {
        days[dayIndex].activity = Math.max(0, numeric);
      }
    });

    // Build weeks array for month-label strip
    const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const weeks = [];
    for (let w = 0; w < WEEKS; w++) {
      const firstDay = days[w * 7];
      const month = firstDay ? MONTH_NAMES[firstDay.date.getMonth()] : '';
      // Only label first week of each month
      const isFirstOfMonth = firstDay && firstDay.date.getDate() <= 7;
      weeks.push({ label: isFirstOfMonth ? month : '', weekIdx: w });
    }

    const maxActivity = days.reduce((max, day) => Math.max(max, day.activity), 0);
    const totalActivity = days.reduce((sum, day) => sum + day.activity, 0);
    const activeDays = days.filter((day) => day.activity > 0).length;
    const bestDay = days.reduce((best, day) => (day.activity > (best?.activity || 0) ? day : best), null);

    return { days, weeks, maxActivity, activeDays, totalActivity, bestDay };
  }, [user]);

  const getActivityLevel = (value) => {
    if (value <= 0) return 0;
    if (value <= 2) return 1;
    if (value <= 5) return 2;
    if (value <= 10) return 3;
    return 4;
  };

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
        <button className="back-btn" onClick={() => navigate('/hub')}>
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
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' }}>
                        <div className="xp-pill">
                          <Zap size={14} /> {xp} XP
                        </div>
                        <div className="status-pill">
                          <Activity size={14} /> {heatmapData.activeDays} Active Days
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Contribution Timeline */}
                  <div className="contribution-section" style={{ marginTop: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                      <CalendarDays size={18} className="text-mid" />
                      <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Contribution Timeline</h3>
                    </div>
                    
                    <div className="heatmap-container">
                      <div className="heatmap-scroll">
                        <div className="heatmap-grid">
                          <div className="month-labels">
                            {heatmapData.weeks.map((w, i) => (
                              <span key={i} className="month-label">{w.label}</span>
                            ))}
                          </div>
                          <div className="days-grid">
                            {heatmapData.days.map((day, i) => (
                              <div
                                key={i}
                                className={`heatmap-cell level-${getActivityLevel(day.activity)}`}
                                title={`${day.date.toDateString()}: ${day.activity} activities`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="heatmap-legend">
                        <span>Less</span>
                        <div className="heatmap-cell level-0"></div>
                        <div className="heatmap-cell level-1"></div>
                        <div className="heatmap-cell level-2"></div>
                        <div className="heatmap-cell level-3"></div>
                        <div className="heatmap-cell level-4"></div>
                        <span>More</span>
                      </div>
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
