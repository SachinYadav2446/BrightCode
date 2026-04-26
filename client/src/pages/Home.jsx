import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, LogOut, Settings, User, Layout, Library, Code2, Shield } from 'lucide-react';
import Editor from '@monaco-editor/react';
import toast from 'react-hot-toast';
import axios from 'axios';
import CodeBrightLogo from '../components/CodeBrightLogo';
import './Home.css';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 80 }
  }
};

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showEditorMobile, setShowEditorMobile] = useState(false);
  const [isMonitorActive, setIsMonitorActive] = useState(false);

  const xp = Number(user?.xp || 0);
  const activity = user?.activity || {};

  // Calculate Today's XP and Active Days
  const todayDateKey = new Date().toISOString().split('T')[0];
  const todaysXp = activity[todayDateKey] || 0;
  const activeDays = Object.keys(activity).length;

  // Calculate skill progress based on actual skill XP
  const calculateSkillProgress = (skillXp) => {
    const maxSkillXp = 5000;
    const percentage = Math.min((skillXp / maxSkillXp) * 100, 100);
    return percentage;
  };

  // Convert skill levels to XP for progress calculation
  const levelToXp = (level) => {
    if (level >= 4) return 5000; // Expert
    if (level >= 3) return 2000; // Advanced
    if (level >= 2) return 500;  // Intermediate
    if (level >= 1) return 100;  // Beginner
    return 0;
  };

  // Use actual skill levels to calculate XP
  const skillDistribution = {
    css: levelToXp(Number(user?.css_level || 0)),
    logic: levelToXp(Number(user?.logic_level || 0)),
    react: levelToXp(Number(user?.react_level || 0))
  };

  const getSkillLevel = (skillXp) => {
    if (skillXp >= 5000) return 'Expert';
    if (skillXp >= 2000) return 'Advanced';
    if (skillXp >= 500) return 'Intermediate';
    return 'Beginner';
  };

  // Generate heatmap data based on user activity
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Start from January 1st of the current year
    const startDate = new Date(currentYear, 0, 1);
    // Adjust to the start of that week (Sunday) to keep the grid consistent
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    for (let i = 0; i < 53; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + (i * 7 + j));
        
        const dateKey = currentDate.toISOString().split('T')[0];
        const xpGained = (activity && activity[dateKey]) || 0;
        
        let level = 0;
        if (xpGained > 0) {
          if (xpGained < 50) level = 1;
          else if (xpGained < 150) level = 2;
          else if (xpGained < 300) level = 3;
          else level = 4;
        }
        
        week.push({
          date: dateKey,
          xp: xpGained,
          level
        });
      }
      data.push(week);
    }
    return data;
  };

  const heatmapData = generateHeatmapData();

  const getMonthLabels = () => {
    if (!heatmapData || heatmapData.length === 0) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = [];
    let lastMonth = -1;
    let lastLabelIndex = -2; // Start with -2 to allow Jan at index 0
    
    heatmapData.forEach((week, i) => {
      if (!week || week.length === 0) return;
      
      const firstDayOfWeek = new Date(week[0].date);
      const currentMonth = firstDayOfWeek.getMonth();
      
      if (currentMonth !== lastMonth) {
        // Ensure at least 2 weeks gap between labels to prevent overlap
        if (i - lastLabelIndex >= 3) {
          labels.push({ month: months[currentMonth], index: i });
          lastLabelIndex = i;
        }
        lastMonth = currentMonth;
      }
    });
    
    return labels;
  };

  const monthLabels = getMonthLabels();

  const motivationalQuotes = [
    "CRUSH YOUR GOALS TODAY",
    "CODE IS POETRY IN MOTION",
    "CONSISTENCY IS THE MOTHER OF MASTERY",
    "EVERY LINE OF CODE IS A STEP FORWARD",
    "MASTER THE FRONTIER, ONE COMMIT AT A TIME",
    "STAY FOCUSED. STAY HUNGRY. STAY CURIOUS",
    "THE ONLY LIMIT IS YOUR IMAGINATION",
    "BUILD. TEST. DEPLOY. REPEAT",
    "ELITE DEVELOPERS ARE BORN IN THE LATE NIGHT SESSIONS"
  ];

  const dailyQuest = {
    id: "DQ-772",
    difficulty: "Advanced",
    title: "Project Glass: Protocol implementation",
    briefing: "Our core navigation systems are currently vulnerable to visual noise. Your mission is to implement a 'Glassmorphic' shield using the backdrop-filter protocol. This will ensure visual clarity while maintaining aesthetic transparency.",
    objectives: [
      { id: 1, label: "Initialize backdrop-filter with 10px Gaussian blur", keyword: "backdropFilter: 'blur(10px)'" },
      { id: 2, label: "Synchronize component transitions at 0.3s ease", keyword: "transition: 'all 0.3s ease'" },
      { id: 3, label: "Maintain RGBA alpha channel at 0.1 for transparency", keyword: "backgroundColor: 'rgba(255, 255, 255, 0.1)'" }
    ],
    initialCode: `const styles = {\n  navbar: {\n    /* MISSION: Update alpha channel and apply effects */\n    backgroundColor: 'rgba(255, 255, 255, 0.7)',\n    \n    /* TODO: Apply backdrop filter for glass effect */\n    backdropFilter: '',\n    \n    /* TODO: Add smooth transition for hover states */\n    transition: '',\n    \n    border: '1px solid rgba(255, 255, 255, 0.2)',\n    padding: '20px 40px',\n    display: 'flex',\n    justifyContent: 'space-between'\n  }\n};`,
    solutionKeywords: ["backdropFilter: 'blur(10px)'", "transition: 'all 0.3s ease'", "backgroundColor: 'rgba(255, 255, 255, 0.1)'"],
    language: "javascript"
  };

  const [questCode, setQuestCode] = useState(dailyQuest.initialCode);
  const [questStatus, setQuestStatus] = useState('idle'); // idle, checking, success, error
  const [questMessage, setQuestMessage] = useState(null);
  
  // Resizable pane state
  const [leftPaneWidth, setLeftPaneWidth] = useState(40); // Initial width in percentage
  const [isResizing, setIsResizing] = useState(false);
  const [supportForm, setSupportForm] = useState({
    subject: '',
    message: '',
    isSending: false
  });
  const [topRankers, setTopRankers] = useState([]);
  const [selectedRanker, setSelectedRanker] = useState(null);

  useEffect(() => {
    const fetchTopRankers = async () => {
      try {
        const { data } = await axios.get('http://localhost:5050/leaderboard');
        setTopRankers(data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch leaderboard:', err);
      }
    };
    fetchTopRankers();
  }, []);

  const getLevelInfo = (xp) => {
    if (xp >= 10000) return { label: 'Grandmaster', color: '#fbbf24' };
    if (xp >= 5000)  return { label: 'Expert',      color: '#818cf8' };
    if (xp >= 2000)  return { label: 'Advanced',    color: '#34d399' };
    if (xp >= 500)   return { label: 'Apprentice',  color: '#60a5fa' };
    return             { label: 'Initiate',    color: '#9ca3af' };
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      
      const container = document.querySelector('.monitor-internal-layout');
      if (!container) return;

      const containerRect = container.getBoundingClientRect();
      const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;
      
      // Constraints: 20% to 70%
      if (newWidth >= 20 && newWidth <= 70) {
        setLeftPaneWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = 'default';
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
    document.body.style.cursor = 'col-resize';
  };

  const handleQuestSubmit = async () => {
    setQuestStatus('checking');
    setQuestMessage(null);
    
    // Simulate a brief check
    setTimeout(() => {
      const isCorrect = dailyQuest.solutionKeywords.every(keyword => 
        questCode.includes(keyword)
      );

      if (isCorrect) {
        setQuestStatus('success');
        setQuestMessage({
          type: 'success',
          title: 'MISSION COMPLETE',
          text: 'XP Protocol Initiated.'
        });
      } else {
        setQuestStatus('error');
        setQuestMessage({
          type: 'error',
          title: 'MISSION FAILED',
          text: 'Logic mismatch detected.'
        });
        setTimeout(() => {
          setQuestStatus('idle');
          setQuestMessage(null);
        }, 3000);
      }
    }, 1200);
  };

  const playerTier =
    xp >= 10000 ? 'Grandmaster' :
      xp >= 5000 ? 'Expert' :
        xp >= 2000 ? 'Advanced' :
          xp >= 500 ? 'Apprentice' : 'Initiate';

  const handleReset = () => {
    setQuestCode(dailyQuest.initialCode);
    setQuestMessage(null);
  };

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportForm.message.trim()) {
      toast.error('Please enter a message');
      return;
    }

    setSupportForm(prev => ({ ...prev, isSending: true }));
    try {
      const { data } = await axios.post('http://localhost:5050/support', {
        email: user.email,
        username: user.username,
        subject: supportForm.subject,
        message: supportForm.message
      });
      toast.success(data.message || 'Message sent successfully!');
      setSupportForm({ subject: '', message: '', isSending: false });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
      setSupportForm(prev => ({ ...prev, isSending: false }));
    }
  };

  const getXpProgress = () => {
    if (xp >= 10000) return { current: 100, next: 'MAX', percent: 100, totalNext: 10000 };
    
    let currentLevelXp = 0;
    let nextLevelXp = 500;
    
    if (xp >= 5000) {
      currentLevelXp = 5000;
      nextLevelXp = 10000;
    } else if (xp >= 2000) {
      currentLevelXp = 2000;
      nextLevelXp = 5000;
    } else if (xp >= 500) {
      currentLevelXp = 500;
      nextLevelXp = 2000;
    } else {
      currentLevelXp = 0;
      nextLevelXp = 500;
    }
    
    const progress = ((xp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100;
    return {
      current: xp - currentLevelXp,
      next: nextLevelXp - currentLevelXp,
      percent: Math.min(Math.max(progress, 0), 100),
      totalNext: nextLevelXp
    };
  };

  const xpProgress = getXpProgress();

  return (
    <div className="homePageWrapper">
      {/* Background Grid */}
      <div className="bg-container">
        <div className="grid-background"></div>
        <div className="cursor-light"></div>
        <div className="ambient-glow"></div>
      </div>

      {/* Sticky Navigation */}
      <nav className="floating-nav">
        <div className="nav-container">
          <div className="logo-section">
            <CodeBrightLogo size="small" />
          </div>

          <div className="nav-links">
            <Link to="/hub" className="nav-link-hover active">
              Home
            </Link>
            <Link to="/library" className="nav-link-hover">
              Library
            </Link>
            <Link to="/workspace" className="nav-link-hover">
              Workspace
            </Link>
            <Link to="/factions" className="nav-link-hover">
              Factions
            </Link>
            
            {user ? (
                <Link to="/settings" className="user-profile-pill">
                  <span className="profile-initial">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </Link>
              ) : (
              <Link to="/auth" className="shiny-btn">
                Join Now
              </Link>
            )}
          </div>
        </div>
      </nav>

      {user && user.activity ? (
        /* ── USER DASHBOARD: MISSION CONTROL ── */
        <motion.section
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="mission-control-section"
        >
          <div className="home-dashboard-container">
            {/* User Core Stats */}
            <div className="home-user-info">
              <h1 className="home-welcome-text">
                Welcome back, <span className="highlight">{user.username}</span>
              </h1>
              
              {user.stack && user.stack.length > 0 && (
                <div className="home-user-stack">
                  {user.stack.map((tech, index) => (
                    <span key={index} className="tech-pill">{tech}</span>
                  ))}
                </div>
              )}

              <div className="home-stats-row">
                <div className="home-stat-box">
                  <span className="stat-label">Experience</span>
                  <span className="stat-value">{xp} XP</span>
                </div>
                <div className="home-stat-box">
                  <span className="stat-label">Rank</span>
                  <span className="stat-value">{playerTier}</span>
                </div>
                <div className="home-stat-box next-rank-box">
                  <span className="stat-label">Next Rank</span>
                  <div className="xp-progress-container">
                    <div className="xp-progress-header">
                      <span className="xp-needed">
                        {xpProgress.totalNext === 10000 && xp >= 10000 
                          ? "Maximum Rank" 
                          : `${xpProgress.totalNext - xp} XP to go`}
                      </span>
                      <span className="xp-percentage">{Math.round(xpProgress.percent)}%</span>
                    </div>
                    <div className="xp-progress-bar-bg">
                      <motion.div 
                        className="xp-progress-bar-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${xpProgress.percent}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Developer Activity & Profile Section */}
            <div className="home-dev-profile">
              <div className="home-dev-profile-inner">
                {/* Contribution Timeline */}
                <div id="timeline" className="home-contribution-section">
                  <h2 className="section-title">Activity Timeline</h2>
                  <div className="contribution-grid-wrapper">
                    <div className="contribution-scroll-container">
                      <div className="contribution-months">
                        {monthLabels && monthLabels.map((label, idx) => (
                          <span 
                            key={idx} 
                            className="month-label"
                            style={{ 
                              gridColumnStart: label.index + 1 
                            }}
                          >
                            {label.month}
                          </span>
                        ))}
                      </div>
                      <div className="contribution-grid">
                        {heatmapData && heatmapData.map((week, weekIdx) => (
                          <div key={weekIdx} className="contribution-week">
                            {week && week.map((day, dayIdx) => (
                              <div 
                                key={dayIdx} 
                                className={`contribution-day level-${day.level}`}
                                title={`${day.date}: ${day.xp} XP earned`}
                              />
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="contribution-legend">
                      <span>Less</span>
                      <div className="contribution-day level-0"></div>
                      <div className="contribution-day level-1"></div>
                      <div className="contribution-day level-2"></div>
                      <div className="contribution-day level-3"></div>
                      <div className="contribution-day level-4"></div>
                      <span>More</span>
                    </div>
                  </div>
                </div>

                {/* Profile Details Grid */}
                <div className="dev-details-grid">
                  <div className="detail-item">
                    <span className="detail-label">Bio</span>
                    <p className="detail-content">{user.bio || 'No bio set yet.'}</p>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Stack</span>
                    <div className="tech-tags">
                      {user.skills && user.skills.length > 0 ? (
                        user.skills.map((skill, idx) => (
                          <span key={idx} className="tech-tag">{skill}</span>
                        ))
                      ) : (
                        <span className="tech-tag empty">No skills added</span>
                      )}
                    </div>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Streak</span>
                    <span className="detail-content">
                      {user.streak || 0} Days
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Active Days</span>
                    <span className="detail-content">{activeDays} Days</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Today's XP</span>
                    <span className="detail-content">+{todaysXp} XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Motivational Live Strip */}
            <div className="motivational-strip">
              <div className="ticker-wrapper">
                <div className="ticker-content">
                  {motivationalQuotes && [...motivationalQuotes, ...motivationalQuotes].map((quote, idx) => (
                    <span key={idx} className="ticker-item">
                      <span className="ticker-bullet">✦</span>
                      {quote}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Skill Progress Dashboard */}
            <div id="skill-dashboard" className="skill-dashboard-section">
              <div className="monitor-header-text">
                <span className="hunt-label">SKILL PROGRESS</span>
                <div className="hunt-line"></div>
              </div>
              
              <div className="skills-grid">
                {/* CSS Skill */}
                <motion.div 
                  className="skill-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="skill-header">
                    <div className="skill-icon css-icon">CSS</div>
                    <div className="skill-level-badge">
                      {getSkillLevel(skillDistribution.css)}
                    </div>
                  </div>
                  <div className="skill-progress-container">
                    <div className="skill-progress-bar">
                      <motion.div 
                        className="skill-progress-fill css-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateSkillProgress(skillDistribution.css)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="skill-percentage">
                      {Math.round(calculateSkillProgress(skillDistribution.css))}%
                    </span>
                  </div>
                  <div className="skill-xp">
                    <Shield size={14} />
                    <span>{skillDistribution.css} XP</span>
                  </div>
                </motion.div>

                {/* Logic Skill */}
                <motion.div 
                  className="skill-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <div className="skill-header">
                    <div className="skill-icon logic-icon">LOGIC</div>
                    <div className="skill-level-badge">
                      {getSkillLevel(skillDistribution.logic)}
                    </div>
                  </div>
                  <div className="skill-progress-container">
                    <div className="skill-progress-bar">
                      <motion.div 
                        className="skill-progress-fill logic-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateSkillProgress(skillDistribution.logic)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="skill-percentage">
                      {Math.round(calculateSkillProgress(skillDistribution.logic))}%
                    </span>
                  </div>
                  <div className="skill-xp">
                    <Shield size={14} />
                    <span>{skillDistribution.logic} XP</span>
                  </div>
                </motion.div>

                {/* React Skill */}
                <motion.div 
                  className="skill-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <div className="skill-header">
                    <div className="skill-icon react-icon">REACT</div>
                    <div className="skill-level-badge">
                      {getSkillLevel(skillDistribution.react)}
                    </div>
                  </div>
                  <div className="skill-progress-container">
                    <div className="skill-progress-bar">
                      <motion.div 
                        className="skill-progress-fill react-fill"
                        initial={{ width: 0 }}
                        animate={{ width: `${calculateSkillProgress(skillDistribution.react)}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="skill-percentage">
                      {Math.round(calculateSkillProgress(skillDistribution.react))}%
                    </span>
                  </div>
                  <div className="skill-xp">
                    <Shield size={14} />
                    <span>{skillDistribution.react} XP</span>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Hall of Fame Section */}
            <div id="hall-of-fame" className="hall-of-fame-section">
              <div className="monitor-header-text">
                <span className="hunt-label">HALL OF FAME</span>
                <div className="hunt-line"></div>
              </div>
              
              <div className="fame-container">
                {topRankers && topRankers.length > 0 ? (
                  <div className="podium-minimal">
                    {topRankers.map((ranker, index) => (
                      <div 
                        key={ranker.id} 
                        className={`podium-item rank-${index + 1}`}
                        onClick={() => setSelectedRanker(ranker)}
                      >
                        <div className="rank-badge">
                          {index + 1}
                        </div>
                        <div className="ranker-avatar">
                          {ranker.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ranker-info">
                          <span className="ranker-name">{ranker.username}</span>
                          <span className="ranker-xp">{ranker.xp} XP</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="fame-loading">
                    <span className="loading-text">RETRIVING ELITE DATA...</span>
                  </div>
                )}
                
                <Link to="/leaderboard" className="view-all-fame">
                  VIEW FULL LEADERBOARD <ChevronRight size={16} />
                </Link>
              </div>

              {/* Quick View Modal */}
              <AnimatePresence>
                {selectedRanker && (
                  <motion.div 
                    className="ranker-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedRanker(null)}
                  >
                    <motion.div 
                      className="ranker-quick-card"
                      initial={{ scale: 0.9, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.9, y: 20 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="card-accent-line"></div>
                      <div className="card-header">
                        <div className="ranker-large-avatar">
                          {selectedRanker.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="ranker-main-info">
                          <h3>{selectedRanker.username}</h3>
                          <div className="level-badge" style={{ color: getLevelInfo(selectedRanker.xp).color }}>
                            {getLevelInfo(selectedRanker.xp).label}
                          </div>
                        </div>
                      </div>

                      <div className="card-body">
                        <div className="info-section">
                          <label>BIOGRAPHY</label>
                          <p>{selectedRanker.bio || 'No transmission recorded for this operative.'}</p>
                        </div>
                        <div className="info-section">
                          <label>TECH STACK</label>
                          <div className="stack-tags">
                            {selectedRanker.stack && selectedRanker.stack.length > 0 ? (
                              selectedRanker.stack.map((tech, i) => (
                                <span key={i} className="stack-tag">{tech}</span>
                              ))
                            ) : (
                              <span className="stack-tag empty">Undefined</span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button className="close-card-btn" onClick={() => setSelectedRanker(null)}>
                        DISMISS
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Support System Section */}
            <div id="support" className="support-system-section">
              <div className="monitor-header-text">
                <span className="hunt-label">SUPPORT COMMAND</span>
                <div className="hunt-line"></div>
              </div>
              
              <div className="support-container">
                <div className="support-info">
                  <h3>Direct Inquiry</h3>
                  <p>Have a question or need technical assistance? Send a direct message to our core team.</p>
                  <div className="support-meta">
                    <div className="meta-item">
                      <span className="meta-dot"></span>
                      <span>Response time: ~24h</span>
                    </div>
                    <div className="meta-item">
                      <span className="meta-dot"></span>
                      <span>Status: Active</span>
                    </div>
                  </div>
                </div>

                <form className="support-form" onSubmit={handleSupportSubmit}>
                  <div className="form-group">
                    <input 
                      type="text" 
                      placeholder="Subject of inquiry"
                      value={supportForm.subject}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <textarea 
                      placeholder="Transmission details..."
                      value={supportForm.message}
                      onChange={(e) => setSupportForm(prev => ({ ...prev, message: e.target.value }))}
                      required
                    ></textarea>
                  </div>
                  <button type="submit" className="support-submit-btn" disabled={supportForm.isSending}>
                    {supportForm.isSending ? 'TRANSMITTING...' : 'SEND INQUIRY'}
                  </button>
                </form>
              </div>
            </div>

            {/* About Section */}
            <div id="about" className="about-section">
              <div className="about-content">
                <div className="about-main-grid">
                  {/* Left Column - Brand Info */}
                  <div className="about-brand">
                    <div className="about-logo">
                      <div className="logo-box">
                        <Code2 size={28} />
                      </div>
                      <span className="brand-name">CodeBright</span>
                    </div>
                    <p className="brand-tagline">
                      Elevating the standard of technical excellence. The definitive platform for the next generation of engineers.
                    </p>
                    <div className="about-social-icons">
                      <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                      </a>
                      <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      </a>
                      <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </a>
                      <a href="https://codebright.io" target="_blank" rel="noopener noreferrer" className="social-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="20" height="20"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    </div>
                  </div>

                  {/* Platform Column */}
                  <div className="about-column">
                    <h4 className="column-title">PLATFORM</h4>
                    <ul className="column-links">
                      <li><Link to="/explore">Explore</Link></li>
                      <li><Link to="/challenges">Challenges</Link></li>
                      <li><Link to="/factions">Factions</Link></li>
                      <li><Link to="/leaderboard">Leaderboard</Link></li>
                    </ul>
                  </div>

                  {/* Resources Column */}
                  <div className="about-column">
                    <h4 className="column-title">RESOURCES</h4>
                    <ul className="column-links">
                      <li><Link to="/docs">Documentation</Link></li>
                      <li><Link to="/status">System Status</Link></li>
                      <li><Link to="/community">Community</Link></li>
                      <li><Link to="/guidelines">Guidelines</Link></li>
                    </ul>
                  </div>

                  {/* Legal Column */}
                  <div className="about-column">
                    <h4 className="column-title">LEGAL</h4>
                    <ul className="column-links">
                      <li><Link to="/privacy">Privacy Policy</Link></li>
                      <li><Link to="/terms">Terms of Service</Link></li>
                      <li><Link to="/cookies">Cookie Policy</Link></li>
                    </ul>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="about-bottom-bar">
                  <span className="about-copyright">© 2026 CodeBright Ecosystem. All rights reserved.</span>
                  <span className="about-tagline-right">Built for the Elite</span>
                </div>
              </div>
            </div>
          </div>
        </motion.section>
      ) : (
        <section className="hero-minimal">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-content-center"
          >
            <div className="about-badge">
              <span className="badge-dot"></span>
              CORE PROTOCOL
            </div>
            
            <h2 className="about-title">
              The Workspace for <span className="title-accent">Elite Logic</span>
            </h2>

            <p className="hero-subtitle-clean">
              A high-performance environment designed for developers who treat code as an art form. Build, test, and master the frontier of logic.
            </p>

            <div className="about-features-grid">
              <div className="about-feature-item">
                <span className="feature-number">01.0</span>
                <h4>Velocity</h4>
                <p>Engineered for low-latency collaboration and high-speed execution.</p>
              </div>
              <div className="about-feature-item">
                <span className="feature-number">02.0</span>
                <h4>Mastery</h4>
                <p>Curated challenges designed to push your technical boundaries.</p>
              </div>
              <div className="about-feature-item">
                <span className="feature-number">03.0</span>
                <h4>Network</h4>
                <p>Join a decentralized faction of the world's most capable engineers.</p>
              </div>
            </div>

            <motion.div 
              className="about-cta"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link to="/auth" className="shiny-btn">
                Initialize Connection
              </Link>
            </motion.div>
          </motion.div>
        </section>
      )}
    </div>
  );
};

export default Home;
