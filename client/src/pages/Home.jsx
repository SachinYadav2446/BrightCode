import API_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  ChevronRight, ChevronLeft, Crown, Trophy, Flame, Cpu, Globe, Terminal, Layers, Calendar, Code2, BookOpen, Lock, Play, Award
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

/* ── Typewriter hook ── */
const useTypewriter = (text, speed = 45) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
};

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [topRankers, setTopRankers] = useState([]);
  const [rankersLoading, setRankersLoading] = useState(true);
  const [rankersError, setRankersError] = useState(false);

  const carouselRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 380; // card width + gap approx
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // Ensure right arrow state updates on load and window resizing
  useEffect(() => {
    const timer = setTimeout(handleCarouselScroll, 200);
    window.addEventListener('resize', handleCarouselScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleCarouselScroll);
    };
  }, []);

  /* ── Fetch dashboard telemetry ── */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data: leaderboardData } = await axios.get(`${API_URL}/leaderboard`, { timeout: 5000 });
        // server now returns { data: [...], total, page, limit } — fall back to plain array for compat
        const rows = Array.isArray(leaderboardData) ? leaderboardData : (leaderboardData?.data || []);
        setTopRankers(rows.slice(0, 10));
      } catch (err) {
        console.error("Leaderboard fetch failed:", err);
        setRankersError(true);
      } finally {
        setRankersLoading(false);
      }
    };
    loadDashboard();
  }, []);

  /* ── Typewriter greeting ── */
  const greetingFull = `Welcome back, ${user?.username ?? ''}!`;
  const { displayed: greetingText, done: greetingDone } = useTypewriter(user ? greetingFull : '', 48);

  /* ── Split greeting for coloring the username part ── */
  const prefix = 'Welcome back, ';
  const suffix = '!';
  const usernameInGreeting = user?.username ?? '';
  const greetingPrefix  = greetingText.slice(0, Math.min(greetingText.length, prefix.length));
  const greetingUser    = greetingText.length > prefix.length
    ? greetingText.slice(prefix.length, Math.min(greetingText.length, prefix.length + usernameInGreeting.length))
    : '';
  const greetingSuffix  = greetingText.length > prefix.length + usernameInGreeting.length ? suffix : '';
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

  const totalLevelsSolved = (Number(user?.css_level || 0) + Number(user?.logic_level || 0) +
    Number(user?.react_level || 0) + Number(user?.java_level || 0) +
    Number(user?.cpp_level || 0) + Number(user?.python_level || 0) +
    Number(user?.go_level || 0));


  const skillDistribution = [
    { 
      id: 'css-odyssey', 
      label: 'CSS Wizardry', 
      val: Number(user?.css_level || 0), 
      max: 50, 
      color: '#3b82f6', 
      icon: Layers, 
      category: 'Frontend', 
      desc: 'Master layouts, flexbox, variables, grid architectures, animations, and high-fidelity simulators.',
      skills: ['Flexbox', 'CSS Grid', 'Keyframes', 'Variables'],
      milestones: [{ name: 'Basics', end: 10 }, { name: 'Flexbox', end: 25 }, { name: 'Grid', end: 40 }, { name: 'Advanced', end: 50 }]
    },
    { 
      id: 'logic-lab', 
      label: 'Logic Engine', 
      val: Number(user?.logic_level || 0), 
      max: 150, 
      color: '#ef4444', 
      icon: Cpu, 
      category: 'JS Logic', 
      desc: 'Conquer complex JavaScript puzzles ranging from control flow to nested arrays, closures, and DOM selectors.',
      skills: ['Arrays', 'Closures', 'Recursion', 'DOM API'],
      milestones: [{ name: 'Foundations', end: 10 }, { name: 'Logic Basics', end: 20 }, { name: 'Control Flow', end: 35 }, { name: 'Loops', end: 55 }, { name: 'Data', end: 80 }, { name: 'Functional', end: 110 }, { name: 'DOM Mastery', end: 150 }]
    },
    { 
      id: 'react-quest', 
      label: 'React Forge', 
      val: Number(user?.react_level || 0), 
      max: 500, 
      color: '#06b6d4', 
      icon: Globe, 
      category: 'Architecture', 
      desc: 'Test your React structure, lifecycle design, virtual DOM updates, hook mechanics, and state workflows.',
      skills: ['JSX', 'Hooks', 'State Mgmt', 'React Router'],
      milestones: [{ name: 'Basics', end: 100 }, { name: 'Hooks', end: 250 }, { name: 'Performance', end: 400 }, { name: 'Ecosystem', end: 500 }]
    },
    { 
      id: 'java-master', 
      label: 'Java Protocol', 
      val: Number(user?.java_level || 0), 
      max: 400, 
      color: '#10b981', 
      icon: Terminal, 
      category: 'OOP Core', 
      desc: 'Master object-oriented patterns, abstraction, memory, collections, multithreading, and stream optimization.',
      skills: ['OOP', 'Streams', 'Generics', 'Threads'],
      milestones: [{ name: 'Variables', end: 80 }, { name: 'OOP Basics', end: 180 }, { name: 'Collections', end: 280 }, { name: 'Advanced Java', end: 400 }]
    },
    { 
      id: 'cpp-master', 
      label: 'C++ Protocol', 
      val: Number(user?.cpp_level || 0), 
      max: 400, 
      color: '#ec4899', 
      icon: Code2, 
      category: 'System Programming', 
      desc: 'Control system-level resources, pointers, dynamic memory management, standard template library (STL), and compilation.',
      skills: ['Pointers', 'STL', 'Templates', 'Memory Mgmt'],
      milestones: [{ name: 'Syntax Basics', end: 80 }, { name: 'OOP', end: 180 }, { name: 'STL Containers', end: 280 }, { name: 'System Optimization', end: 400 }]
    },
    { 
      id: 'python-master', 
      label: 'Python Protocol', 
      val: Number(user?.python_level || 0), 
      max: 400, 
      color: '#eab308', 
      icon: Code2, 
      category: 'Scripting & AI', 
      desc: 'Master decorators, file I/O, custom generators, regex, algorithms, and modular scientific scripting in Python.',
      skills: ['Decorators', 'Generators', 'Data Science', 'OOP'],
      milestones: [{ name: 'Syntax', end: 80 }, { name: 'Data structures', end: 180 }, { name: 'OOP & Modules', end: 280 }, { name: 'Pythonic Code', end: 400 }]
    },
    { 
      id: 'go-master', 
      label: 'Go Protocol', 
      val: Number(user?.go_level || 0), 
      max: 400, 
      color: '#0ea5e9', 
      icon: Code2, 
      category: 'Concurrency', 
      desc: 'Leverage goroutines, channels, structures, pointers, web routing, and modern distributed service paradigms.',
      skills: ['Goroutines', 'Channels', 'Interfaces', 'Pointers'],
      milestones: [{ name: 'Go Syntax', end: 80 }, { name: 'Interfaces', end: 180 }, { name: 'Goroutines', end: 280 }, { name: 'Concurrency Patterns', end: 400 }]
    }
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



  const badges = [
    {
      id: 'streak_novice',
      name: 'Flame Initiate',
      desc: 'Achieve a 3-day coding streak.',
      icon: Flame,
      color: '#f59e0b',
      unlocked: activeDays >= 3
    },
    {
      id: 'streak_expert',
      name: 'Flame Overlord',
      desc: 'Achieve a 10-day coding streak.',
      icon: Flame,
      color: '#ef4444',
      unlocked: activeDays >= 10
    },
    {
      id: 'xp_silver',
      name: 'XP Hoarder',
      desc: 'Earn a total of 2,000 experience points.',
      icon: Trophy,
      color: '#3b82f6',
      unlocked: xp >= 2000
    },
    {
      id: 'xp_gold',
      name: 'Glory Seeker',
      desc: 'Earn a total of 10,000 experience points.',
      icon: Crown,
      color: '#fbbf24',
      unlocked: xp >= 10000
    },
    {
      id: 'solve_bronze',
      name: 'Code Soldier',
      desc: 'Solve 20 levels across any track.',
      icon: Code2,
      color: '#10b981',
      unlocked: totalLevelsSolved >= 20
    },
    {
      id: 'solve_gold',
      name: 'Legendary Solver',
      desc: 'Solve 100 levels across any track.',
      icon: Award,
      color: '#a855f7',
      unlocked: totalLevelsSolved >= 100
    },
    {
      id: 'css_master',
      name: 'Style Sculptor',
      desc: 'Reach Level 25 in CSS Wizardry.',
      icon: Layers,
      color: '#06b6d4',
      unlocked: Number(user?.css_level || 0) >= 25
    },
    {
      id: 'logic_master',
      name: 'Algorithm Sage',
      desc: 'Reach Level 55 in Logic Engine.',
      icon: Cpu,
      color: '#ef4444',
      unlocked: Number(user?.logic_level || 0) >= 55
    }
  ];

  return (
    <div className="home-wrapper">
      <div className="home-bg">
        <div className="bg-grid" />
      </div>

      {user ? (
        <div className="home-dashboard-vertical">
          
          {/* ══ HEADER ══ */}
          <header className="profile-header-black">
            <div className="profile-header-inner">

              {/* Typewriter greeting */}
              <h1 className="welcome-banner-text">
                {greetingPrefix}
                {greetingUser && <span className="welcome-username-highlight">{greetingUser}</span>}
                {greetingSuffix}
                {!greetingDone && <span className="tw-cursor" />}
              </h1>

              {/* 3-column card row */}
              <div className="profile-card-row">

                {/* COL 1 — Avatar */}
                <div className="profile-col-avatar">
                  <div className="profile-avatar-dicebear">
                    <img
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${user.avatarId || user.username || 'Sniper'}&backgroundColor=transparent`}
                      alt={`${user.username} avatar`}
                      className="dicebear-img"
                    />
                    <span className="avatar-online-dot" />
                  </div>
                </div>

                {/* COL 2 — Identity + stats */}
                <div className="profile-col-info">
                  {/* Name + email */}
                  <div className="profile-name-row">
                    <span className="profile-username-text">{user.username}</span>
                    {user.email && (
                      <span className="profile-email-chip">
                        <Globe size={11} />
                        {user.email}
                      </span>
                    )}
                  </div>

                  {/* Bio */}
                  {user.bio && <p className="profile-bio-text">{user.bio}</p>}

                  {/* Stack tags */}
                  {user.stack && user.stack.length > 0 && (
                    <div className="profile-stack-row">
                      {user.stack.map(tag => (
                        <span key={tag} className="profile-stack-tag">
                          <Code2 size={10} />{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats grid */}
                  <div className="profile-stats-grid">
                    <div className="stat-card">
                      <span className="stat-card-label">Total XP</span>
                      <span className="stat-card-value"><AnimatedCounter end={xp} /> XP</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-card-label">Daily Streak</span>
                      <span className="stat-card-value streak-glow">
                        <Flame size={14} fill="currentColor" />
                        <span>{activeDays} Days</span>
                      </span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-card-label">Earned Today</span>
                      <span className="stat-card-value text-red">+{todaysXp} XP</span>
                    </div>
                    <div className="stat-card">
                      <span className="stat-card-label">Levels Solved</span>
                      <span className="stat-card-value">{totalLevelsSolved}</span>
                    </div>
                  </div>
                </div>

                {/* COL 3 — Radial XP ring */}
                <div className="profile-col-ring">
                  <div className="circle-progress-container">
                    <svg className="radial-progress" viewBox="0 0 100 100">
                      <circle className="radial-track" cx="50" cy="50" r="42" />
                      <motion.circle
                        className="radial-fill"
                        cx="50" cy="50" r="42"
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
                  <div className="radial-tier-label" style={{ color: levelInfo.color }}>
                    {levelInfo.label}
                  </div>
                  <div className="radial-xp-summary">
                    <span className="radial-xp-val">{xp.toLocaleString()} XP</span>
                    {levelInfo.next && (
                      <span className="radial-xp-next">/ {levelInfo.next.toLocaleString()} XP</span>
                    )}
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
                <p className="vertical-section-subtitle">Contribution grid logging developer commit outputs and daily XP accumulated.</p>
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
          </div>

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

          {/* ══ SECTION 3: SOLVED MODULES PROGRESSION (FULL WIDTH BAND) ══ */}
          <section className="progression-section-fullwidth">
            <div className="progression-fullwidth-inner">
              <div className="section-header-row">
                <div className="title-left-group">
                  <Layers size={20} className="carousel-accent-icon" />
                  <h2 className="vertical-section-title">Solved Modules Progression</h2>
                </div>
                <p className="vertical-section-subtitle">Track your proficiency levels and solved challenges across development cores.</p>
              </div>

              <div className="carousel-wrapper-container">
                {/* Left Navigation Arrow */}
                {showLeftArrow && (
                  <button className="carousel-nav-btn btn-left" onClick={() => scrollCarousel('left')} aria-label="Slide Left">
                    <ChevronLeft size={20} />
                  </button>
                )}

                {/* Carousel Card viewport */}
                <div className="modules-carousel-viewport" ref={carouselRef} onScroll={handleCarouselScroll}>
                  {skillDistribution.map(skill => {
                    const pct = Math.min((skill.val / skill.max) * 100, 100);
                    
                    // Dynamic phase calculation
                    let currentPhase = 'Basics';
                    let nextPhase = 'Mastery';
                    let currentEnd = skill.max;
                    for (let i = 0; i < skill.milestones.length; i++) {
                      const m = skill.milestones[i];
                      if (skill.val <= m.end) {
                        currentPhase = m.name;
                        currentEnd = m.end;
                        nextPhase = skill.milestones[i + 1] ? skill.milestones[i + 1].name : 'Mastery';
                        break;
                      }
                    }

                    const skillLabel = pct >= 100 ? 'Master' : pct >= 75 ? 'Expert' : pct >= 50 ? 'Advanced' : pct >= 25 ? 'Intermediate' : pct > 0 ? 'Beginner' : 'Initiate';
                    
                    return (
                      <div 
                        key={skill.id} 
                        className="module-progression-large-card" 
                        style={{ 
                          '--accent-theme': skill.color,
                          '--accent-theme-glow': skill.color + '40'
                        }}
                      >
                        {/* Top Meta info */}
                        <div className="large-card-header">
                          <div className="large-card-icon-box" style={{ color: skill.color, backgroundColor: `${skill.color}15` }}>
                            <skill.icon size={26} />
                          </div>
                          <div className="large-card-meta">
                            <span className="large-card-category">{skill.category.toUpperCase()}</span>
                            <span className="large-card-title">{skill.label}</span>
                          </div>
                          <span className="large-card-level-badge" style={{ color: skill.color, borderColor: `${skill.color}50` }}>{skillLabel}</span>
                        </div>

                        {/* Description */}
                        <p className="large-card-desc-text">{skill.desc}</p>

                        {/* Milestones statistics */}
                        <div className="large-card-milestone-info">
                          <div className="milestone-stat-row">
                            <span className="m-stat-label">Current Stage:</span>
                            <span className="m-stat-value text-glow-accent" style={{ color: skill.color }}>{currentPhase}</span>
                          </div>
                          <div className="milestone-stat-row">
                            <span className="m-stat-label">Next Target:</span>
                            <span className="m-stat-value text-muted-val">{nextPhase}</span>
                          </div>
                        </div>

                        {/* Skills Cover tag pills */}
                        <div className="large-card-tag-group">
                          {skill.skills.map(sk => (
                            <span key={sk} className="large-card-tag-pill">{sk}</span>
                          ))}
                        </div>

                        {/* Progress slider bar */}
                        <div className="large-card-progress-box">
                          <div className="large-card-progress-ratio">
                            <span>{Math.round(pct)}% Complete</span>
                            <span>{skill.val} / {skill.max} Solved</span>
                          </div>
                          <div className="large-card-progress-track">
                            <div className="large-card-progress-fill" style={{ width: `${pct}%`, backgroundColor: skill.color }} />
                          </div>
                        </div>

                        {/* Action CTA Button */}
                        <button className="large-card-cta-btn" onClick={() => navigate(`/library?track=${skill.id}`)}>
                          <span>Launch Track</span>
                          <Play size={12} fill="currentColor" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Right Navigation Arrow */}
                {showRightArrow && (
                  <button className="carousel-nav-btn btn-right" onClick={() => scrollCarousel('right')} aria-label="Slide Right">
                    <ChevronRight size={20} />
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* ══ SECTION 4: HALL OF FAME (FULL WIDTH) ══ */}
          <section className="fame-section-fullwidth">
            <div className="fame-fullwidth-inner">

              {/* Header Row */}
              <div className="fame-header-interactive" onClick={() => navigate('/leaderboard')}>
                <h2 className="vertical-section-title fame-title-glow">
                  Hall of Fame <ChevronRight size={16} className="title-chevron-icon" />
                </h2>
                <Link to="/leaderboard" className="leaderboard-header-btn" onClick={(e) => e.stopPropagation()}>
                  <Trophy size={14} />
                  <span>View Leaderboard</span>
                </Link>
              </div>

              {/* Two-column layout: Podium left | Rankings list right */}
              <div className="fame-layout-split">

                {/* LEFT: Top 3 Podium */}
                <div className="fame-podium-col">
                  {rankersLoading ? (
                    <p className="widget-loading">Loading...</p>
                  ) : rankersError || !topRankers.length ? (
                    <p className="widget-error">Rankings node offline.</p>
                  ) : (
                    <div className="fame-podium">
                      {/* 2nd Place */}
                      {topRankers[1] && (
                        <div className="podium-column column-2" onClick={(e) => { e.stopPropagation(); navigate(`/u/${topRankers[1].username}`); }}>
                          <span className="podium-rank-emoji">🥈</span>
                          <div className="podium-avatar-circle avatar-silver">{topRankers[1].username[0].toUpperCase()}</div>
                          <div className="podium-user-info">
                            <span className="podium-username">{topRankers[1].username}</span>
                            <span className="podium-xp">{topRankers[1].xp?.toLocaleString()} XP</span>
                          </div>
                          <div className="podium-box step-2-box"><span className="step-num">2</span></div>
                        </div>
                      )}
                      {/* 1st Place */}
                      {topRankers[0] && (
                        <div className="podium-column column-1" onClick={(e) => { e.stopPropagation(); navigate(`/u/${topRankers[0].username}`); }}>
                          <span className="podium-crown-icon"><Crown size={20} fill="#fbbf24" color="#fbbf24" /></span>
                          <span className="podium-rank-emoji">🥇</span>
                          <div className="podium-avatar-circle avatar-gold">{topRankers[0].username[0].toUpperCase()}</div>
                          <div className="podium-user-info">
                            <span className="podium-username">{topRankers[0].username}</span>
                            <span className="podium-xp">{topRankers[0].xp?.toLocaleString()} XP</span>
                          </div>
                          <div className="podium-box step-1-box"><span className="step-num">1</span></div>
                        </div>
                      )}
                      {/* 3rd Place */}
                      {topRankers[2] && (
                        <div className="podium-column column-3" onClick={(e) => { e.stopPropagation(); navigate(`/u/${topRankers[2].username}`); }}>
                          <span className="podium-rank-emoji">🥉</span>
                          <div className="podium-avatar-circle avatar-bronze">{topRankers[2].username[0].toUpperCase()}</div>
                          <div className="podium-user-info">
                            <span className="podium-username">{topRankers[2].username}</span>
                            <span className="podium-xp">{topRankers[2].xp?.toLocaleString()} XP</span>
                          </div>
                          <div className="podium-box step-3-box"><span className="step-num">3</span></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Vertical divider */}
                <div className="fame-split-divider" />

                {/* RIGHT: Ranks 4-10 stacked list */}
                <div className="fame-rankings-col">
                  <div className="fame-rankings-label">RANKS 4 – 10</div>
                  {rankersLoading ? (
                    <p className="widget-loading">Loading...</p>
                  ) : rankersError ? (
                    <p className="widget-error">Rankings node offline.</p>
                  ) : (
                    <div className="fame-list-stack">
                      {topRankers.slice(3, 10).map((ranker, idx) => (
                        <div
                          key={ranker.username}
                          className="fame-list-row"
                          onClick={(e) => { e.stopPropagation(); navigate(`/u/${ranker.username}`); }}
                        >
                          <span className="fame-list-rank">#{idx + 4}</span>
                          <div className="fame-list-avatar">{ranker.username[0].toUpperCase()}</div>
                          <span className="fame-list-username">{ranker.username}</span>
                          <span className="fame-list-xp">{ranker.xp?.toLocaleString()} XP</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </section>

          {/* ══ ACHIEVEMENTS & BADGES (BELOW HALL OF FAME) ══ */}
          <div className="dashboard-content-area">
            <section className="dashboard-vertical-section achievements-section">
              <div className="section-header-row">
                <div className="title-left-group">
                  <Award size={20} className="achievements-accent-icon" />
                  <h2 className="vertical-section-title">Achievements & Badges</h2>
                </div>
                <p className="vertical-section-subtitle">Locked and unlocked developer credentials based on your platform activity and progress.</p>
              </div>

              <div className="achievements-grid">
                {badges.map(badge => {
                  const Icon = badge.icon;
                  return (
                    <div key={badge.id} className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`} style={badge.unlocked ? { '--badge-color': badge.color } : {}}>
                      <div className="badge-icon-wrapper">
                        {badge.unlocked ? (
                          <div className="badge-glow-effect" style={{ backgroundColor: badge.color }} />
                        ) : (
                          <div className="badge-lock-overlay"><Lock size={12} /></div>
                        )}
                        <Icon className="badge-main-icon" size={24} style={badge.unlocked ? { color: badge.color } : { color: '#52525b' }} />
                      </div>
                      <div className="badge-details">
                        <span className="badge-name">{badge.name}</span>
                        <span className="badge-desc">{badge.desc}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* ══ ABOUT BRIGHTCODE SECTION ══ */}
          <section className="about-section-fullwidth">
            <div className="about-section-inner">

              {/* Section Header */}
              <div className="about-section-header">
                <div className="about-header-label">
                  <span className="about-label-dot" />
                  <span>PLATFORM OVERVIEW</span>
                </div>
                <h2 className="about-main-title">Built for Developers.<br /><span className="about-title-accent">Engineered for Growth.</span></h2>
                <p className="about-subtitle">BrightCode is a developer-first interactive learning platform designed to take you from fundamentals to mastery through structured, gamified coding challenges across multiple technology tracks.</p>
              </div>

              {/* Main Content Grid */}
              <div className="about-content-grid">

                {/* Mission Card */}
                <div className="about-card about-card-mission">
                  <div className="about-card-icon-row">
                    <div className="about-card-icon" style={{ background: 'rgba(239,68,68,0.12)', color: '#ef4444' }}>
                      <Flame size={22} />
                    </div>
                    <span className="about-card-tag">Our Mission</span>
                  </div>
                  <h3 className="about-card-title">Democratising Technical Excellence</h3>
                  <p className="about-card-body">
                    We believe every developer deserves a structured path to mastery. BrightCode bridges the gap between learning and doing — replacing passive tutorials with hands-on, level-based challenges that push your boundaries and reward real progress.
                  </p>
                  <ul className="about-bullet-list">
                    <li><span className="about-bullet-dot" style={{ background: '#ef4444' }} />Gamified XP system that makes progress tangible</li>
                    <li><span className="about-bullet-dot" style={{ background: '#ef4444' }} />Daily coding streaks to build consistency habits</li>
                    <li><span className="about-bullet-dot" style={{ background: '#ef4444' }} />Tier-based ranking to benchmark your skill level</li>
                  </ul>
                </div>

                {/* How it Works Card */}
                <div className="about-card about-card-howto">
                  <div className="about-card-icon-row">
                    <div className="about-card-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                      <Layers size={22} />
                    </div>
                    <span className="about-card-tag">How It Works</span>
                  </div>
                  <h3 className="about-card-title">Structured. Adaptive. Competitive.</h3>
                  <div className="about-steps-list">
                    <div className="about-step-item">
                      <div className="about-step-num" style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>01</div>
                      <div className="about-step-content">
                        <span className="about-step-title">Choose Your Track</span>
                        <span className="about-step-desc">Pick from CSS, JavaScript Logic, React, Java, C++, Python, or Go — each with a curated progression path.</span>
                      </div>
                    </div>
                    <div className="about-step-item">
                      <div className="about-step-num" style={{ borderColor: '#10b981', color: '#10b981' }}>02</div>
                      <div className="about-step-content">
                        <span className="about-step-title">Solve Challenges & Earn XP</span>
                        <span className="about-step-desc">Each level you complete earns XP. The harder the problem, the bigger the reward. Climb the tiers from Initiate to Grandmaster.</span>
                      </div>
                    </div>
                    <div className="about-step-item">
                      <div className="about-step-num" style={{ borderColor: '#ef4444', color: '#ef4444' }}>03</div>
                      <div className="about-step-content">
                        <span className="about-step-title">Rank Up & Get Recognised</span>
                        <span className="about-step-desc">Your XP, streak, and badges define your profile. Compete globally on the Hall of Fame leaderboard and showcase your milestones.</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Stats Card */}
                <div className="about-card about-card-stats">
                  <div className="about-card-icon-row">
                    <div className="about-card-icon" style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>
                      <Trophy size={22} />
                    </div>
                    <span className="about-card-tag">By The Numbers</span>
                  </div>
                  <h3 className="about-card-title">What You're Competing In</h3>
                  <div className="about-stats-grid">
                    <div className="about-stat-box">
                      <span className="about-stat-num" style={{ color: '#ef4444' }}>7</span>
                      <span className="about-stat-label">Technology Tracks</span>
                    </div>
                    <div className="about-stat-box">
                      <span className="about-stat-num" style={{ color: '#3b82f6' }}>1,900+</span>
                      <span className="about-stat-label">Unique Challenges</span>
                    </div>
                    <div className="about-stat-box">
                      <span className="about-stat-num" style={{ color: '#10b981' }}>5</span>
                      <span className="about-stat-label">Rank Tiers</span>
                    </div>
                    <div className="about-stat-box">
                      <span className="about-stat-num" style={{ color: '#f87171' }}>8</span>
                      <span className="about-stat-label">Achievement Badges</span>
                    </div>
                  </div>
                  <div className="about-tech-tracks-row">
                    {[
                      { label: 'CSS', color: '#3b82f6' },
                      { label: 'JS Logic', color: '#ef4444' },
                      { label: 'React', color: '#06b6d4' },
                      { label: 'Java', color: '#10b981' },
                      { label: 'C++', color: '#ec4899' },
                      { label: 'Python', color: '#dc2626' },
                      { label: 'Go', color: '#0ea5e9' },
                    ].map(t => (
                      <span key={t.label} className="about-track-pill" style={{ borderColor: t.color + '50', color: t.color, background: t.color + '12' }}>{t.label}</span>
                    ))}
                  </div>
                </div>

              </div>

              {/* Bottom CTA Banner */}
              <div className="about-cta-banner">
                <div className="about-cta-text">
                  <span className="about-cta-eyebrow">Ready to level up?</span>
                  <span className="about-cta-headline">Start solving. Start growing. <span style={{ color: '#ef4444' }}>Today.</span></span>
                </div>
                <div className="about-cta-actions">
                  <button className="about-cta-primary" onClick={() => navigate('/library')}>
                    <Play size={14} fill="currentColor" />
                    Browse Tracks
                  </button>
                  <button className="about-cta-secondary" onClick={() => navigate('/leaderboard')}>
                    <Trophy size={14} />
                    View Leaderboard
                  </button>
                </div>
              </div>

            </div>
          </section>

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

      <Chatbot />
    </div>
  );
};

export default Home;
