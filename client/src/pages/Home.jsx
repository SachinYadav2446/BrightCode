import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ChevronRight, Crown, Trophy, Flame, Cpu, Globe, Terminal, Layers, Calendar
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Chatbot from '../components/Chatbot';
import './Home.css';

const AnimatedCounter = ({ end, suffix = '', duration = 1500 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    const step = end / (duration / 16);
    let cur = 0;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= end) {
        setVal(end);
        clearInterval(timer);
      } else {
        setVal(Math.floor(cur));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{val.toLocaleString()}{suffix}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topRankers, setTopRankers] = useState([]);
  const [rankersLoading, setRankersLoading] = useState(true);
  const [rankersError, setRankersError] = useState(false);
  const [supportForm, setSupportForm] = useState({ subject: '', message: '', isSending: false, sent: false });

  /* ── Fetch dashboard telemetry ── */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data: leaderboardData } = await axios.get(`${API_URL}/leaderboard`, { timeout: 5000 });
        setTopRankers((leaderboardData || []).slice(0, 5));
      } catch (err) {
        console.error("Leaderboard fetch failed:", err);
        setRankersError(true);
      } finally {
        setRankersLoading(false);
      }
    };
    loadDashboard();
  }, []);

  /* ── Derived User Metrics ── */
  const xp = Number(user?.xp || 0);
  const activity = user?.activity || {};
  const todayDateKey = new Date().toISOString().split('T')[0];
  const todaysXp = activity[todayDateKey] || 0;
  const activeDays = Object.keys(activity).length;

  const levelInfo = xp >= 10000 ? { label: 'Grandmaster', color: '#ef4444', next: null }
    : xp >= 5000 ? { label: 'Expert', color: '#f59e0b', next: 10000 }
    : xp >= 2000 ? { label: 'Advanced', color: '#3b82f6', next: 5000 }
    : xp >= 500 ? { label: 'Apprentice', color: '#10b981', next: 2000 }
    : { label: 'Initiate', color: '#a1a1aa', next: 500 };

  const xpPercent = levelInfo.next
    ? Math.min(((xp - (xp >= 5000 ? 5000 : xp >= 2000 ? 2000 : xp >= 500 ? 500 : 0)) /
      (levelInfo.next - (xp >= 5000 ? 5000 : xp >= 2000 ? 2000 : xp >= 500 ? 500 : 0))) * 100, 100)
    : 100;

  const skillDistribution = [
    { id: 'css', label: 'CSS Wizardry', val: Number(user?.css_level || 0), max: 50, color: '#3b82f6', icon: Layers },
    { id: 'logic', label: 'Logic Engine', val: Number(user?.logic_level || 0), max: 150, color: '#ef4444', icon: Cpu },
    { id: 'react', label: 'React Forge', val: Number(user?.react_level || 0), max: 500, color: '#06b6d4', icon: Globe },
    { id: 'java', label: 'Java Protocol', val: Number(user?.java_level || 0), max: 400, color: '#10b981', icon: Terminal },
  ];

  /* ── Heatmap Generator ── */
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    for (let i = 0; i < 53; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + (i * 7 + j));
        const key = d.toISOString().split('T')[0];
        const xpg = (activity && activity[key]) || 0;
        let level = 0;
        if (xpg > 0) level = xpg < 50 ? 1 : xpg < 150 ? 2 : xpg < 300 ? 3 : 4;
        week.push({ date: key, xp: xpg, level });
      }
      data.push(week);
    }
    return data;
  };
  const heatmapData = generateHeatmapData();

  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = []; let lastMonth = -1; let lastIdx = -2;
    heatmapData.forEach((week, i) => {
      if (!week?.length) return;
      const m = new Date(week[0].date).getMonth();
      if (m !== lastMonth && i - lastIdx >= 3) {
        labels.push({ month: months[m], index: i });
        lastIdx = i;
      }
      lastMonth = m;
    });
    return labels;
  };
  const monthLabels = getMonthLabels();

  const motivationalQuotes = [
    "Consistency beats talent. Keep committing.",
    "Solve problems, gain experience, level up.",
    "Every line of code is a step towards mastery.",
    "Analyze, refactor, optimize, repeat.",
    "Build clean interfaces, write readable solutions."
  ];

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportForm.message.trim()) return;
    setSupportForm(p => ({ ...p, isSending: true }));
    try {
      await axios.post(`${API_URL}/support`, {
        email: user.email,
        username: user.username,
        subject: supportForm.subject || 'Support Inquiry',
        message: supportForm.message
      });
      setSupportForm({ subject: '', message: '', isSending: false, sent: true });
      toast.success('Feedback received by the core team.');
      setTimeout(() => setSupportForm(p => ({ ...p, sent: false })), 4000);
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message.');
      setSupportForm(p => ({ ...p, isSending: false }));
    }
  };

  return (
    <div className="home-wrapper">
      <div className="home-bg">
        <div className="bg-grid" />
      </div>

      {user ? (
        <div className="home-dashboard-vertical">
          
          {/* ══ HEADER / SECTION 1: USER DETAILS (BLACK BG, EDGE-TO-EDGE) ══ */}
          <header className="profile-header-black">
            <div className="profile-header-inner">
              <h1 className="welcome-banner-text">Welcome back, <span className="welcome-username-highlight">{user.username}</span>!</h1>
              
              <div className="profile-details-row">
                {/* Left Column: Avatar & Details */}
                <div className="profile-identity-col">
                  <div className="profile-avatar-large">
                    {user.username[0].toUpperCase()}
                  </div>
                  <div className="profile-identity-info">
                    <div className="profile-badge-row">
                      <span className="profile-username-text">{user.username}</span>
                      <span className="profile-badge-pill" style={{ color: levelInfo.color, borderColor: levelInfo.color }}>
                        <Crown size={12} />
                        <span>{levelInfo.label}</span>
                      </span>
                    </div>
                    <div className="profile-metrics-row">
                      <div className="metric-box-item">
                        <span className="metric-box-label">Total Experience</span>
                        <span className="metric-box-value"><AnimatedCounter end={xp} /> XP</span>
                      </div>
                      <div className="metric-box-item">
                        <span className="metric-box-label">Daily Streak</span>
                        <span className="metric-box-value streak-glow">
                          <Flame size={16} fill="currentColor" />
                          <span>{activeDays} Days</span>
                        </span>
                      </div>
                      <div className="metric-box-item">
                        <span className="metric-box-label">Earned Today</span>
                        <span className="metric-box-value text-red">+{todaysXp} XP</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Right Column: Radial Progress Summary */}
                <div className="profile-progress-col">
                  <div className="circle-progress-container">
                    <svg className="radial-progress" viewBox="0 0 100 100">
                      <circle className="radial-track" cx="50" cy="50" r="42" />
                      <motion.circle 
                        className="radial-fill" 
                        cx="50" 
                        cy="50" 
                        r="42" 
                        strokeDasharray="263.8"
                        initial={{ strokeDashoffset: 263.8 }}
                        animate={{ strokeDashoffset: 263.8 - (263.8 * xpPercent) / 100 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        style={{ stroke: levelInfo.color }}
                      />
                    </svg>
                    <div className="radial-center">
                      <span className="radial-percent">{Math.round(xpPercent)}%</span>
                      <span className="radial-lbl">Level Completion</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* ══ CONTENT AREA (WITH GRID SYSTEM BG) ══ */}
          <div className="dashboard-content-area">
            
            {/* ══ SECTION 2: SUBMISSION CALENDAR (TACTICAL DIGITAL ACTIVITY LOG) ══ */}
            <section className="home-activity-log-section">
              <div className="section-header-row calendar-header-row">
                <div className="section-title-wrapper-row">
                  <div className="title-left-group">
                    <Terminal size={20} className="calendar-accent-icon" />
                    <h2 className="vertical-section-title">ACTIVITY LOG (PAST YEAR)</h2>
                  </div>
                  <div className="calendar-stats-summary-row">
                    <div className="cal-summary-item">
                      <span className="cal-summary-num">{activeDays}</span>
                      <span className="cal-summary-lbl">Active Days</span>
                    </div>
                    <div className="cal-summary-separator" />
                    <div className="cal-summary-item">
                      <span className="cal-summary-num streak-text-glow">{activeDays} Days</span>
                      <span className="cal-summary-lbl">Current Streak</span>
                    </div>
                    <div className="cal-summary-separator" />
                    <div className="cal-summary-item">
                      <span className="cal-summary-num">{xp.toLocaleString()}</span>
                      <span className="cal-summary-lbl">Total XP</span>
                    </div>
                  </div>
                </div>
                <p className="vertical-section-subtitle">Contribution grid logging developer commit outputs and accumulated daily XP.</p>
              </div>
              
              <div className="heatmap-card">
                <div className="heatmap-inner">
                  <div className="heatmap-months">
                    {monthLabels.map((lbl, i) => (
                      <span key={i} className="heatmap-month" style={{ gridColumnStart: lbl.index + 1 }}>
                        {lbl.month.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <div className="heatmap-grid">
                    {heatmapData.map((week, wi) => (
                      <div key={wi} className="heatmap-week">
                        {week.map((day, di) => (
                          <div key={di}
                            className={`heatmap-day level-${day.level}`}
                            title={`${day.date}: ${day.xp} XP`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                  <div className="heatmap-legend">
                    <span>IDLE</span>
                    {[0, 1, 2, 3, 4].map(l => <div key={l} className={`heatmap-day level-${l}`} />)}
                    <span>ACTIVE</span>
                  </div>
                </div>
              </div>
            </section>

            {/* ══ SECTION 3: SOLVED MODULES PROGRESSION ══ */}
            <section className="dashboard-vertical-section modules-section-dark">
              <div className="section-header-row">
                <h2 className="vertical-section-title">Solved Modules Progression</h2>
                <p className="vertical-section-subtitle">Track your proficiency levels and solved challenges across development cores.</p>
              </div>
              
              <div className="modules-progression-grid">
                {skillDistribution.map(skill => {
                  const pct = Math.min((skill.val / skill.max) * 100, 100);
                  const skillLabel = pct >= 100 ? 'Master' : pct >= 75 ? 'Expert' : pct >= 50 ? 'Advanced' : pct >= 25 ? 'Intermediate' : pct > 0 ? 'Beginner' : 'Initiate';
                  return (
                    <div key={skill.id} className="module-progression-card">
                      <div className="module-card-header">
                        <div className="module-icon-box" style={{ color: skill.color, backgroundColor: `${skill.color}10` }}>
                          <skill.icon size={20} />
                        </div>
                        <div className="module-name-meta">
                          <span className="module-title-text">{skill.label}</span>
                          <span className="module-level-badge" style={{ color: skill.color, borderColor: `${skill.color}40` }}>{skillLabel}</span>
                        </div>
                      </div>
                      
                      <div className="module-progress-bar-container">
                        <div className="module-progress-bar-track">
                          <div className="module-progress-bar-fill" style={{ width: `${pct}%`, backgroundColor: skill.color }} />
                        </div>
                        <div className="module-progress-ratio">
                          <span>{Math.round(pct)}% Completed</span>
                          <span>{skill.val} / {skill.max} Solved</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* ══ SECTION 4: HALL OF FAME PODIUM ══ */}
            <section className="dashboard-vertical-section fame-section-dark">
              <div className="section-header-row fame-header-interactive" onClick={() => navigate('/leaderboard')}>
                <h2 className="vertical-section-title fame-title-glow">
                  Hall of Fame <ChevronRight size={16} className="title-chevron-icon" />
                </h2>
                <Link to="/leaderboard" className="leaderboard-header-btn" onClick={(e) => e.stopPropagation()}>
                  <Trophy size={14} />
                  <span>View Leaderboard</span>
                </Link>
              </div>
              
              <div className="fame-ranks-podium-container">
                {rankersLoading ? (
                  <p className="widget-loading">Loading top performers...</p>
                ) : rankersError || !topRankers.length ? (
                  <p className="widget-error">Rankings node offline.</p>
                ) : (
                  <div className="fame-podium">
                    {/* 2nd Place (Left) */}
                    {topRankers[1] && (
                      <div className="podium-column column-2" onClick={(e) => { e.stopPropagation(); navigate(`/u/${topRankers[1].username}`); }}>
                        <span className="podium-rank-emoji">🥈</span>
                        <div className="podium-avatar-circle avatar-silver">
                          {topRankers[1].username[0].toUpperCase()}
                        </div>
                        <div className="podium-user-info">
                          <span className="podium-username">{topRankers[1].username}</span>
                          <span className="podium-xp">{topRankers[1].xp?.toLocaleString()} XP</span>
                        </div>
                        <div className="podium-box step-2-box">
                          <span className="step-num">2</span>
                        </div>
                      </div>
                    )}

                    {/* 1st Place (Middle - tallest) */}
                    {topRankers[0] && (
                      <div className="podium-column column-1" onClick={(e) => { e.stopPropagation(); navigate(`/u/${topRankers[0].username}`); }}>
                        <span className="podium-crown-icon"><Crown size={20} fill="#fbbf24" color="#fbbf24" /></span>
                        <span className="podium-rank-emoji">🥇</span>
                        <div className="podium-avatar-circle avatar-gold">
                          {topRankers[0].username[0].toUpperCase()}
                        </div>
                        <div className="podium-user-info">
                          <span className="podium-username">{topRankers[0].username}</span>
                          <span className="podium-xp">{topRankers[0].xp?.toLocaleString()} XP</span>
                        </div>
                        <div className="podium-box step-1-box">
                          <span className="step-num">1</span>
                        </div>
                      </div>
                    )}

                    {/* 3rd Place (Right) */}
                    {topRankers[2] && (
                      <div className="podium-column column-3" onClick={(e) => { e.stopPropagation(); navigate(`/u/${topRankers[2].username}`); }}>
                        <span className="podium-rank-emoji">🥉</span>
                        <div className="podium-avatar-circle avatar-bronze">
                          {topRankers[2].username[0].toUpperCase()}
                        </div>
                        <div className="podium-user-info">
                          <span className="podium-username">{topRankers[2].username}</span>
                          <span className="podium-xp">{topRankers[2].xp?.toLocaleString()} XP</span>
                        </div>
                        <div className="podium-box step-3-box">
                          <span className="step-num">3</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ══ SECTION 5: SUPPORT & FEEDBACK ══ */}
            <section className="dashboard-vertical-section support-section-dark">
              <div className="section-header-row">
                <h2 className="vertical-section-title">Support & Feedback</h2>
                <p className="vertical-section-subtitle">Detail your request or feature feedback directly to the operator team.</p>
              </div>
              
              <div className="support-card-content">
                <form className="support-widget-form" onSubmit={handleSupportSubmit}>
                  {supportForm.sent ? (
                    <div className="support-widget-success">
                      <span className="success-icon">✓</span>
                      <h4>Transmission Dispatched</h4>
                      <p>Our operator team has received your support request.</p>
                    </div>
                  ) : (
                    <>
                      <input className="support-widget-input" type="text" placeholder="Subject"
                        value={supportForm.subject} onChange={e => setSupportForm(p => ({ ...p, subject: e.target.value }))} />
                      <textarea className="support-widget-textarea" placeholder="Detail your request or feature feedback..."
                        value={supportForm.message} onChange={e => setSupportForm(p => ({ ...p, message: e.target.value }))} required />
                      <button className="support-widget-btn" type="submit" disabled={supportForm.isSending}>
                        {supportForm.isSending ? 'Sending...' : 'Send Message'}
                      </button>
                    </>
                  )}
                </form>
              </div>
            </section>

          </div>
        </div>
      ) : (
        <div className="home-guest-view">
          <div className="guest-card">
            <h2>Access Unauthorized</h2>
            <p>Please log in to link into BrightCode core engines.</p>
            <Link to="/auth" className="guest-cta-btn">Proceed to Login</Link>
          </div>
        </div>
      )}

      {/* Motivational Ticker */}
      {user && (
        <div className="ticker-banner">
          <div className="ticker-viewport">
            <div className="ticker-track">
              {motivationalQuotes.concat(motivationalQuotes).map((q, i) => (
                <span key={i} className="ticker-item">
                  <span className="ticker-dot">✦</span>{q}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <Chatbot />
    </div>
  );
};

export default Home;
