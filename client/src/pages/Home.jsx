import React, { useState, useEffect } from 'react';

import { useNavigate, Link } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';

import { motion, AnimatePresence } from 'framer-motion';

import { ChevronLeft, ChevronRight, LogOut, Settings, User, Layout, Library, Code2, Shield, Zap, Crown, Trophy } from 'lucide-react';

import Editor from '@monaco-editor/react';

import toast from 'react-hot-toast';

import axios from 'axios';

import CodeBrightLogo from '../components/CodeBrightLogo';
import Navbar from '../components/Navbar';
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
  const [topRankers, setTopRankers] = useState([]);
  const [selectedRanker, setSelectedRanker] = useState(null);

  useEffect(() => {
    const fetchTopRankers = async () => {
      try {
        const response = await axios.get('http://localhost:5051/leaderboard');
        setTopRankers(response.data.slice(0, 3));
      } catch (err) {
        console.error('Failed to fetch top rankers', err);
      }
    };
    fetchTopRankers();
  }, []);



  const xp = Number(user?.xp || 0);

  const activity = user?.activity || {};



  // Calculate Today's XP and Active Days

  const todayDateKey = new Date().toISOString().split('T')[0];

  const todaysXp = activity[todayDateKey] || 0;

  const activeDays = Object.keys(activity).length;



  // Calculate skill progress based on actual solved levels from Arcade
  const calculateSkillProgress = (levelCount, type) => {
    const totalMap = { 
      css: 50, 
      logic: 150, 
      react: 500,
      java: 400
    };
    const total = totalMap[type] || 100;
    return Math.min((levelCount / total) * 100, 100);
  };

  const getSkillLevel = (percentage) => {
    if (percentage >= 100) return 'Master';
    if (percentage >= 75) return 'Expert';
    if (percentage >= 50) return 'Advanced';
    if (percentage >= 25) return 'Intermediate';
    if (percentage > 0) return 'Beginner';
    return 'Initiate';
  };

  // Use actual skill levels (count of solved challenges)
  const skillDistribution = {
    css: Number(user?.css_level || 0),
    logic: Number(user?.logic_level || 0),
    react: Number(user?.react_level || 0),
    java: Number(user?.java_level || 0)
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





  const getLevelInfo = (xp) => {

    if (xp >= 10000) return { label: 'Grandmaster', color: '#fbbf24' };

    if (xp >= 5000) return { label: 'Expert', color: '#818cf8' };

    if (xp >= 2000) return { label: 'Advanced', color: '#34d399' };

    if (xp >= 500) return { label: 'Apprentice', color: '#60a5fa' };

    return { label: 'Initiate', color: '#9ca3af' };

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
      return;
    }

    // Create mailto link with pre-filled content
    const supportEmail = 'support@brightcode.com'; // Replace with your actual support email
    const emailSubject = encodeURIComponent(supportForm.subject || 'Support Inquiry');
    const emailBody = encodeURIComponent(
      `From: ${user.username} (${user.email})\n\n` +
      `Subject: ${supportForm.subject}\n\n` +
      `Message:\n${supportForm.message}\n\n` +
      `---\nUser ID: ${user.username}\nTimestamp: ${new Date().toISOString()}`
    );

    const mailtoLink = `mailto:${supportEmail}?subject=${emailSubject}&body=${emailBody}`;
    
    // Open email client
    window.location.href = mailtoLink;
    
    // Clear form after a short delay
    setTimeout(() => {
      setSupportForm({ subject: '', message: '', isSending: false });
    }, 1000);
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



            {/* Hall of Fame (Top 3 Rankers) */}
            <div id="hall-of-fame" className="hall-of-fame-section">
              <div className="fame-header-centered">
                <span className="hunt-label">HALL OF FAME</span>
                <div className="hunt-line"></div>
              </div>

              <div className="hall-of-fame-grid">
                {(() => {
                  // Reorder: 2nd place (index 1) first, 1st place (index 0) middle, 3rd place (index 2) last
                  const orderedRankers = [
                    topRankers[1], // 2nd place - left
                    topRankers[0], // 1st place - middle
                    topRankers[2]  // 3rd place - right
                  ].filter(Boolean); // Remove undefined if less than 3 rankers

                  return orderedRankers.map((ranker, displayIdx) => {
                    // Find the actual index for rank calculation
                    const actualIdx = topRankers.indexOf(ranker);

                    return (
                      <motion.div
                        key={ranker.username}
                        className={`fame-card rank-${actualIdx + 1}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: displayIdx * 0.1, duration: 0.5 }}
                        whileHover={{ scale: 1.02, y: -5 }}
                        onClick={() => setSelectedRanker(ranker)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="fame-rank-wrapper">
                          <div className="fame-rank-badge">
                            {actualIdx === 0 ? <Crown size={18} /> : `#${actualIdx + 1}`}
                          </div>
                        </div>

                        <div className="fame-avatar-wrapper">
                          <div className="fame-avatar">
                            {ranker.username[0].toUpperCase()}
                          </div>
                          <div className="fame-rank-ring"></div>
                        </div>

                        <div className="fame-content">
                          <h3 className="fame-username">{ranker.username}</h3>
                          <div className="fame-meta">
                            <div className="fame-stat">
                              <Zap size={12} className="fame-icon" />
                              <span>{ranker.xp.toLocaleString()}</span>
                            </div>
                            <div className="fame-divider"></div>
                            <div className="fame-stat">
                              <Shield size={12} className="fame-icon" />
                              <span>LVL {ranker.level}</span>
                            </div>
                          </div>
                        </div>

                        {actualIdx === 0 && <div className="fame-glow"></div>}
                      </motion.div>
                    );
                  });
                })()}
              </div>

              {/* View All Rankings Button */}
              <motion.div
                className="fame-view-all-wrapper"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
              >
                <Link to="/leaderboard" className="fame-view-all-btn">
                  <Trophy size={20} />
                  <span>View Full Rankings</span>
                  <ChevronRight size={18} />
                </Link>
              </motion.div>
            </div>

            {/* Skill Progress Dashboard */}
            <div id="skill-dashboard" className="skill-dashboard-section">
              <div className="monitor-header-text">
                <span className="hunt-label">SKILL PROGRESS</span>
                <div className="hunt-line"></div>
              </div>

              <div className="skills-carousel-container">
                <div className="skills-single-page">
                  {/* CSS */}
                  <div className="skill-card">
                    <div className="skill-header">
                      <div className="skill-icon css-icon">CSS</div>
                      <div className="skill-level-badge">
                        {getSkillLevel(calculateSkillProgress(skillDistribution.css, 'css'))}
                      </div>
                    </div>
                    <div className="skill-progress-container">
                      <div className="skill-progress-bar">
                        <div
                          className="skill-progress-fill css-fill"
                          style={{ width: `${calculateSkillProgress(skillDistribution.css, 'css')}%` }}
                        />
                      </div>
                      <div className="skill-progress-labels">
                        <span className="skill-percentage">
                          {Math.round(calculateSkillProgress(skillDistribution.css, 'css'))}%
                        </span>
                        <span className="skill-count">{skillDistribution.css}/50</span>
                      </div>
                    </div>
                    <div className="skill-xp">
                      <Zap size={14} className="zap-icon" />
                      <span>{skillDistribution.css * 10} XP</span>
                    </div>
                  </div>

                  {/* Logic */}
                  <div className="skill-card">
                    <div className="skill-header">
                      <div className="skill-icon logic-icon">LOGIC</div>
                      <div className="skill-level-badge">
                        {getSkillLevel(calculateSkillProgress(skillDistribution.logic, 'logic'))}
                      </div>
                    </div>
                    <div className="skill-progress-container">
                      <div className="skill-progress-bar">
                        <div
                          className="skill-progress-fill logic-fill"
                          style={{ width: `${calculateSkillProgress(skillDistribution.logic, 'logic')}%` }}
                        />
                      </div>
                      <div className="skill-progress-labels">
                        <span className="skill-percentage">
                          {Math.round(calculateSkillProgress(skillDistribution.logic, 'logic'))}%
                        </span>
                        <span className="skill-count">{skillDistribution.logic}/150</span>
                      </div>
                    </div>
                    <div className="skill-xp">
                      <Zap size={14} className="zap-icon" />
                      <span>{skillDistribution.logic * 10} XP</span>
                    </div>
                  </div>

                  {/* React */}
                  <div className="skill-card">
                    <div className="skill-header">
                      <div className="skill-icon react-icon">REACT</div>
                      <div className="skill-level-badge">
                        {getSkillLevel(calculateSkillProgress(skillDistribution.react, 'react'))}
                      </div>
                    </div>
                    <div className="skill-progress-container">
                      <div className="skill-progress-bar">
                        <div
                          className="skill-progress-fill react-fill"
                          style={{ width: `${calculateSkillProgress(skillDistribution.react, 'react')}%` }}
                        />
                      </div>
                      <div className="skill-progress-labels">
                        <span className="skill-percentage">
                          {Math.round(calculateSkillProgress(skillDistribution.react, 'react'))}%
                        </span>
                        <span className="skill-count">{skillDistribution.react}/500</span>
                      </div>
                    </div>
                    <div className="skill-xp">
                      <Zap size={14} className="zap-icon" />
                      <span>{skillDistribution.react * 10} XP</span>
                    </div>
                  </div>
                </div>
              </div>
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
            {/* End of content */}
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

