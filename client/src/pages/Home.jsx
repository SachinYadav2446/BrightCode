import API_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import {
  ChevronRight, LogOut, Settings, User, Code2, Shield, Zap, Crown,
  Trophy, Flame, Target, BookOpen, Users, Star, TrendingUp,
  Activity, Award, Cpu, Globe, Lock, ArrowUpRight, Play,
  BarChart2, Calendar, GitBranch, Terminal, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import Chatbot from '../components/Chatbot';
import './Home.css';

/* ─── Animation Variants ─── */
const fadeUp = {
  hidden: { y: 40, opacity: 0 },
  visible: (d = 0) => ({ y: 0, opacity: 1, transition: { delay: d, duration: 0.6, ease: [0.22, 1, 0.36, 1] } })
};

const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.09, delayChildren: 0.1 } }
};

/* ─── Floating Particle Component ─── */
const FloatingOrb = ({ style, delay = 0 }) => (
  <motion.div
    className="floating-orb"
    style={style}
    animate={{
      y: [0, -40, 20, 0],
      x: [0, 20, -30, 0],
      scale: [1, 1.06, 0.94, 1],
    }}
    transition={{
      duration: 18,
      delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
  />
);

/* ─── 3D Tilt Card Component ─── */
const TiltCard = ({ children, className = '', intensity = 8, onClick, style, ...props }) => {
  const ref = useRef(null);
  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    ref.current.style.transform = `perspective(1000px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateZ(15px)`;
    
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    ref.current.style.setProperty('--mouse-x-local', `${px}px`);
    ref.current.style.setProperty('--mouse-y-local', `${py}px`);
  };
  const handleLeave = () => {
    if (ref.current) {
      ref.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)';
    }
  };
  return (
    <motion.div
      ref={ref}
      className={`tilt-card ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      onClick={onClick}
      style={style}
      whileHover={{ scale: 1.025, transition: { duration: 0.25, ease: "easeOut" } }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

/* ─── Animated Counter ─── */
const AnimatedCounter = ({ end, suffix = '', duration = 2000 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    const step = end / (duration / 16);
    let cur = 0;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= end) { setVal(end); clearInterval(timer); }
      else setVal(Math.floor(cur));
    }, 16);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{val.toLocaleString()}{suffix}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [topRankers, setTopRankers] = useState([]);
  const [rankersLoading, setRankersLoading] = useState(true);
  const [rankersError, setRankersError] = useState(false);
  const [activeSkill, setActiveSkill] = useState(null);
  const [supportForm, setSupportForm] = useState({ subject: '', message: '', isSending: false, sent: false });
  const [friendsCount, setFriendsCount] = useState(0);
  const [factionsCount, setFactionsCount] = useState(0);
  const [factionsList, setFactionsList] = useState([]);
  const [notesCount, setNotesCount] = useState(0);
  const [activePvPGames, setActivePvPGames] = useState([]);
  const [activeTab, setActiveTab] = useState('missions');
  const heroRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  /* ── Mouse Parallax ── */
  useEffect(() => {
    const handler = (e) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handler);
    return () => window.removeEventListener('mousemove', handler);
  }, []);

  /* ── Fetch dynamic dashboard data ── */
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const { data: leaderboardData } = await axios.get(`${API_URL}/leaderboard`, { timeout: 5000 });
        setTopRankers((leaderboardData || []).slice(0, 3));
      } catch {
        setRankersError(true);
      } finally {
        setRankersLoading(false);
      }

      if (!user) return;

      try {
        const { data: friendsData } = await axios.get(`${API_URL}/friends`);
        setFriendsCount((friendsData || []).length);
      } catch (err) {
        console.error("Friends fetch failed:", err);
      }

      try {
        const { data: factionsData } = await axios.get(`${API_URL}/factions`);
        setFactionsList(factionsData || []);
        const userFactions = (factionsData || []).filter(fac => 
          fac.members?.some(m => m.username === user.username || m.id === user.id || m === user.username)
        );
        setFactionsCount(userFactions.length);
      } catch (err) {
        console.error("Factions fetch failed:", err);
      }

      try {
        const { data: notesData } = await axios.get(`${API_URL}/api/notes`);
        setNotesCount((notesData || []).length);
      } catch (err) {
        console.error("Vault notes fetch failed:", err);
      }

      try {
        const { data: gamesData } = await axios.get(`${API_URL}/code-wars/active-games`);
        setActivePvPGames(gamesData || []);
      } catch (err) {
        console.error("Active games fetch failed:", err);
      }
    };
    loadDashboard();
  }, [user]);

  /* ── Derived Data ── */
  const xp = Number(user?.xp || 0);
  const activity = user?.activity || {};
  const todayDateKey = new Date().toISOString().split('T')[0];
  const todaysXp = activity[todayDateKey] || 0;
  const activeDays = Object.keys(activity).length;

  const levelInfo = xp >= 10000 ? { label: 'Grandmaster', color: '#ffd700', next: null }
    : xp >= 5000 ? { label: 'Expert', color: '#f97316', next: 10000 }
    : xp >= 2000 ? { label: 'Advanced', color: '#fb923c', next: 5000 }
    : xp >= 500 ? { label: 'Apprentice', color: '#fbbf24', next: 2000 }
    : { label: 'Initiate', color: '#fffdd0', next: 500 };

  const xpPercent = levelInfo.next
    ? Math.min(((xp - (xp >= 5000 ? 5000 : xp >= 2000 ? 2000 : xp >= 500 ? 500 : 0)) /
      (levelInfo.next - (xp >= 5000 ? 5000 : xp >= 2000 ? 2000 : xp >= 500 ? 500 : 0))) * 100, 100)
    : 100;

  const skillDistribution = [
    { id: 'css', label: 'CSS Wizardry', val: Number(user?.css_level || 0), max: 50, color: '#3b82f6', icon: Layers, desc: 'Visual mastery' },
    { id: 'logic', label: 'Logic Engine', val: Number(user?.logic_level || 0), max: 150, color: '#8b5cf6', icon: Cpu, desc: 'Algorithmic thinking' },
    { id: 'react', label: 'React Forge', val: Number(user?.react_level || 0), max: 500, color: '#06b6d4', icon: Globe, desc: 'Component architecture' },
    { id: 'java', label: 'Java Protocol', val: Number(user?.java_level || 0), max: 400, color: '#22c55e', icon: Terminal, desc: 'Systems & backend' },
  ];

  const getDynamicMissions = () => {
    if (!user) return [];
    const sortedSkills = [...skillDistribution].sort((a, b) => a.val - b.val);
    const primarySkill = sortedSkills[0];
    const secondarySkill = sortedSkills[1];
    
    return [
      {
        id: 1,
        title: primarySkill.id === 'css' ? 'Centering Genesis' : primarySkill.id === 'logic' ? 'Matrix Decryptor' : primarySkill.id === 'react' ? 'Concurrent Threading' : 'Buffer Overflow Shield',
        type: 'DAILY PRIORITY',
        reward: `${(primarySkill.max - primarySkill.val) * 10 || 150} XP`,
        difficulty: primarySkill.val < primarySkill.max * 0.3 ? 'Beginner' : primarySkill.val < primarySkill.max * 0.7 ? 'Intermediate' : 'Expert',
        progress: Math.round((primarySkill.val / primarySkill.max) * 100),
        accent: primarySkill.color,
        desc: `Level up lowest proficiency skill (${primarySkill.label}). Complete code challenges.`
      },
      {
        id: 2,
        title: secondarySkill.id === 'css' ? 'Flexbox Grid Design' : secondarySkill.id === 'logic' ? 'Binary Pathfinder' : secondarySkill.id === 'react' ? 'Redux Store Context Sync' : 'Spring Bean Injection',
        type: 'SECONDARY QUEST',
        reward: `${(secondarySkill.max - secondarySkill.val) * 8 || 120} XP`,
        difficulty: secondarySkill.val < secondarySkill.max * 0.5 ? 'Intermediate' : 'Advanced',
        progress: Math.round((secondarySkill.val / secondarySkill.max) * 100),
        accent: secondarySkill.color,
        desc: `Bridge the skill gap in ${secondarySkill.label} to unlock master grade rankings.`
      },
      {
        id: 3,
        title: 'Faction Code Nexus',
        type: 'GLOBAL CO-OP',
        reward: '500 XP',
        difficulty: 'Hard',
        progress: Math.min(factionsCount * 25, 100),
        accent: '#fb7185',
        desc: `Join forces with faction members. Currently active in ${factionsCount} groups.`
      }
    ];
  };
  const missions = getDynamicMissions();

  /* ── Heatmap ── */
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
      if (m !== lastMonth && i - lastIdx >= 3) { labels.push({ month: months[m], index: i }); lastIdx = i; }
      lastMonth = m;
    });
    return labels;
  };
  const monthLabels = getMonthLabels();

  const quickActions = [
    { label: 'Code Editor', desc: 'Launch collaborative workspace', icon: Code2, path: '/editor/new', color: '#ef4444', badge: 'LIVE' },
    { label: 'Arcade', desc: 'Skill challenges & missions', icon: Target, path: '/library', color: '#8b5cf6', badge: 'HOT' },
    { label: 'Code Wars', desc: 'Competitive coding battles', icon: Zap, path: '/code-wars', color: '#f97316', badge: 'PVP' },
    { label: 'Factions', desc: 'Join elite developer groups', icon: Users, path: '/factions', color: '#22c55e', badge: null },
    { label: 'Code Vault', desc: 'Your personal code library', icon: BookOpen, path: '/codevault', color: '#06b6d4', badge: null },
    { label: 'Leaderboard', desc: 'Global rankings & glory', icon: Trophy, path: '/leaderboard', color: '#ffd700', badge: 'RANK' },
  ];

  const motivationalQuotes = [
    "CRUSH YOUR GOALS TODAY", "CODE IS POETRY IN MOTION",
    "CONSISTENCY IS THE MOTHER OF MASTERY", "EVERY LINE OF CODE IS A STEP FORWARD",
    "MASTER THE FRONTIER, ONE COMMIT AT A TIME", "STAY FOCUSED. STAY HUNGRY. STAY CURIOUS",
    "BUILD. TEST. DEPLOY. REPEAT", "ELITE DEVELOPERS ARE BORN IN THE LATE NIGHT SESSIONS"
  ];

  const handleSupportSubmit = async (e) => {
    e.preventDefault();
    if (!supportForm.message.trim()) return;
    setSupportForm(p => ({ ...p, isSending: true }));
    try {
      await axios.post(`${API_URL}/support`, { email: user.email, username: user.username, subject: supportForm.subject || 'Support Inquiry', message: supportForm.message });
      setSupportForm({ subject: '', message: '', isSending: false, sent: true });
      toast.success('Message sent to the core team!');
      setTimeout(() => setSupportForm(p => ({ ...p, sent: false })), 4000);
    } catch {
      toast.error('Failed to send. Try again.');
      setSupportForm(p => ({ ...p, isSending: false }));
    }
  };

  const tabs = [
    { id: 'missions', label: 'MISSIONS', icon: Target },
    { id: 'skills', label: 'SKILLS', icon: Layers },
    { id: 'pvp', label: 'ARENA', icon: Zap },
    { id: 'factions', label: 'FACTIONS', icon: Users },
    { id: 'fame', label: 'HALL OF FAME', icon: Trophy },
    { id: 'support', label: 'SUPPORT', icon: Terminal }
  ];

  /* ──═════════════════════════ RENDER ═════════════════════════── */
  return (
    <div className="home-wrapper">
      {/* ── Ambient Background ── */}
      <div className="home-bg">
        <div className="bg-grid" />
        <div className="bg-cursor-glow" />
        <FloatingOrb style={{ top: '10%', left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(var(--primary-rgb, 239, 68, 68), 0.06) 0%, transparent 70%)' }} />
        <FloatingOrb delay={3} style={{ top: '50%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)' }} />
        <FloatingOrb delay={7} style={{ bottom: '20%', left: '30%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)' }} />
        <div className="cyber-glass-box box-1" />
        <div className="cyber-glass-box box-2" />
        <div className="cyber-glass-box box-3" />
      </div>

      {user ? (
        <div className="home-dashboard">
          <div className="home-dashboard-layout">
          
          {/* ── LEFT SIDEBAR: OPERATIVE PROFILE ── */}
          <div className="home-sidebar">
            <TiltCard className="sidebar-hud-panel" intensity={2}>
              <div className="sidebar-hud-header">
                <div className="sidebar-radial-wrap">
                  <svg className="sidebar-radial" viewBox="0 0 100 100">
                    <circle className="hud-radial-track" cx="50" cy="50" r="42" />
                    <motion.circle 
                      className="hud-radial-fill" 
                      cx="50" 
                      cy="50" 
                      r="42" 
                      strokeDasharray="263.8"
                      initial={{ strokeDashoffset: 263.8 }}
                      animate={{ strokeDashoffset: 263.8 - (263.8 * xpPercent) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}
                      style={{ '--xp-color': levelInfo.color }}
                    />
                  </svg>
                  <div className="sidebar-radial-content">
                    <span className="hud-radial-percent">{Math.round(xpPercent)}%</span>
                  </div>
                </div>
                
                <div className="sidebar-identity">
                  <span className="hud-bio-eyebrow">OPERATIVE ID</span>
                  <h1 className="sidebar-username">{user.username}</h1>
                  <div className="home-hud-rank-pill" style={{ '--rank-color': levelInfo.color }}>
                    <Crown size={12} />
                    <span>{levelInfo.label}</span>
                  </div>
                </div>
              </div>

              <div className="sidebar-stats-divider" />

              <div className="sidebar-stats-list">
                {[
                  { icon: Zap, label: 'TOTAL XP', value: xp, color: '#ffa116' },
                  { icon: Flame, label: 'TODAY XP', value: todaysXp, color: '#ef4444' },
                  { icon: Activity, label: 'ACTIVE DAYS', value: activeDays, color: '#22c55e' },
                  { icon: Users, label: 'FRIENDS', value: friendsCount, color: '#06b6d4' },
                  { icon: Code2, label: 'FACTIONS', value: factionsCount, color: '#8b5cf6' },
                  { icon: BookOpen, label: 'VAULT NOTES', value: notesCount, color: '#ec4899' },
                ].map((stat) => (
                  <div key={stat.label} className="sidebar-stat-row">
                    <div className="sidebar-stat-label-wrap">
                      <stat.icon size={14} style={{ color: stat.color }} />
                      <span>{stat.label}</span>
                    </div>
                    <span className="sidebar-stat-value">
                      <AnimatedCounter end={stat.value} />
                    </span>
                  </div>
                ))}
              </div>

              {levelInfo.next && (
                <div className="sidebar-hud-progress">
                  <div className="sidebar-progress-text">
                    <span>Level Progress</span>
                    <span>{xp.toLocaleString()} / {levelInfo.next.toLocaleString()}</span>
                  </div>
                  <div className="home-hud-progress-tube">
                    <motion.div className="home-hud-progress-charge"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercent}%` }}
                      transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                      style={{ '--xp-color': levelInfo.color }}
                    />
                  </div>
                </div>
              )}
            </TiltCard>

            {/* QUICK LINK ACTIONS DECK */}
            <div className="sidebar-quick-actions">
              <span className="sidebar-subtitle-eyebrow">QUICK DECK</span>
              <div className="sidebar-actions-grid">
                {quickActions.map((act) => (
                  <Link key={act.label} to={act.path} className="sidebar-action-pill" style={{ '--act-color': act.color }}>
                    <act.icon size={14} />
                    <span>{act.label}</span>
                    {act.badge && <span className="action-pill-badge">{act.badge}</span>}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANELS: INTERACTIVE CYBER DECK ── */}
          <div className="home-content-deck">
            
            {/* CYBER TAB BAR SELECTOR */}
            <div className="deck-tab-bar">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  className={`deck-tab-btn ${activeTab === t.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(t.id)}
                >
                  <t.icon size={16} />
                  <span>{t.label}</span>
                  {activeTab === t.id && (
                    <motion.div className="active-tab-glow" layoutId="activeTabGlow" />
                  )}
                </button>
              ))}
            </div>

            {/* TAB CONTAINER CONTENT PANELS */}
            <div className="deck-panel-container">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.25 }}
                  className="deck-tab-panel"
                >
                  
                  {/* TAB 1: INTEL & MISSIONS */}
                  {activeTab === 'missions' && (
                    <div className="tab-pane-content">
                      <div className="home-section-header">
                        <span className="home-section-eyebrow">MISSIONS</span>
                        <h2 className="home-section-title">Active Assignments</h2>
                        <p className="home-section-desc">Dynamic objectives scaled to your lowest level proficiency tracks.</p>
                      </div>
                      
                      <div className="home-missions-grid">
                        {missions.map((mission, idx) => (
                          <TiltCard key={mission.id} className="home-mission-card" style={{ '--mission-color': mission.accent }} intensity={2}>
                            <div className="mission-badge" style={{ '--badge-color': mission.accent }}>{mission.type}</div>
                            <h3 className="mission-title">{mission.title}</h3>
                            <p className="mission-desc">{mission.desc}</p>
                            
                            <div className="mission-progress-section">
                              <div className="mission-progress-label">
                                <span>SYNC RATIO</span>
                                <span>{mission.progress}%</span>
                              </div>
                              <div className="mission-progress-bar">
                                <motion.div 
                                  className="mission-progress-fill" 
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${mission.progress}%` }}
                                  transition={{ duration: 1, delay: idx * 0.1 }}
                                />
                              </div>
                            </div>

                            <div className="mission-footer">
                              <span className="mission-difficulty">DIFFICULTY: {mission.difficulty}</span>
                              <span className="mission-reward">+{mission.reward}</span>
                            </div>
                          </TiltCard>
                        ))}
                      </div>

                      <div className="home-section-header" style={{ marginTop: '40px' }}>
                        <span className="home-section-eyebrow">CHRONOLOGY</span>
                        <h2 className="home-section-title">Activity Grid</h2>
                        <p className="home-section-desc">Commit logs and contribution cells mapping current year XP.</p>
                      </div>
                      
                      <div className="home-heatmap-card">
                        <div className="home-heatmap-inner">
                          <div className="home-heatmap-months">
                            {monthLabels.map((lbl, i) => (
                              <span key={i} className="home-heatmap-month" style={{ gridColumnStart: lbl.index + 1 }}>{lbl.month}</span>
                            ))}
                          </div>
                          <div className="home-heatmap-grid">
                            {heatmapData.map((week, wi) => (
                              <div key={wi} className="home-heatmap-week">
                                {week.map((day, di) => (
                                  <div key={di}
                                    className={`home-heatmap-day level-${day.level}`}
                                    title={`${day.date}: ${day.xp} XP`}
                                  />
                                ))}
                              </div>
                            ))}
                          </div>
                          <div className="home-heatmap-legend">
                            <span>Less</span>
                            {[0, 1, 2, 3, 4].map(l => <div key={l} className={`home-heatmap-day level-${l}`} />)}
                            <span>More</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: SKILLS MATRIX */}
                  {activeTab === 'skills' && (
                    <div className="tab-pane-content">
                      <div className="home-section-header">
                        <span className="home-section-eyebrow">PROFICIENCY</span>
                        <h2 className="home-section-title">Skill Arsenal</h2>
                        <p className="home-section-desc">Track and specialize across different development cores.</p>
                      </div>

                      <div className="home-skills-grid">
                        {skillDistribution.map((skill, i) => {
                          const pct = Math.min((skill.val / skill.max) * 100, 100);
                          const label = pct >= 100 ? 'MASTER' : pct >= 75 ? 'EXPERT' : pct >= 50 ? 'ADVANCED' : pct >= 25 ? 'INTERMEDIATE' : pct > 0 ? 'BEGINNER' : 'INITIATE';
                          return (
                            <TiltCard
                              key={skill.id}
                              className={`home-skill-card ${activeSkill === skill.id ? 'active' : ''}`}
                              variants={fadeUp}
                              custom={i * 0.06}
                              onClick={() => setActiveSkill(activeSkill === skill.id ? null : skill.id)}
                              style={{
                                '--skill-color': skill.color,
                                '--skill-color-rgb': skill.id === 'css' ? '59, 130, 246'
                                  : skill.id === 'logic' ? '139, 92, 246'
                                  : skill.id === 'react' ? '6, 182, 212'
                                  : '34, 197, 94'
                              }}
                              intensity={6}
                            >
                              <div className="home-skill-top">
                                <div className="home-skill-icon">
                                  <skill.icon size={20} />
                                </div>
                                <div className="home-skill-badge">{label}</div>
                              </div>
                              <h3 className="home-skill-name">{skill.label}</h3>
                              <p className="home-skill-desc">{skill.desc}</p>
                              <div className="home-skill-progress-wrap">
                                <div className="home-skill-progress-track">
                                  <motion.div className="home-skill-progress-fill"
                                    initial={{ width: 0 }}
                                    whileInView={{ width: `${pct}%` }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 1.2, delay: i * 0.1, ease: 'easeOut' }}
                                  />
                                </div>
                                <div className="home-skill-progress-meta">
                                  <span>{Math.round(pct)}%</span>
                                  <span>{skill.val}/{skill.max} challenges</span>
                                </div>
                              </div>
                              <div className="home-skill-xp">
                                <Zap size={12} />
                                <span>{(skill.val * 10).toLocaleString()} XP earned</span>
                              </div>
                              <div className="home-skill-glow" />
                            </TiltCard>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB 3: PVP ARENA */}
                  {activeTab === 'pvp' && (
                    <div className="tab-pane-content">
                      <div className="home-section-header">
                        <span className="home-section-eyebrow">COMBAT TELEMETRY</span>
                        <h2 className="home-section-title">PvP Battle Logs & Lobbies</h2>
                        <p className="home-section-desc">Join active lobbies or inspect live combat details.</p>
                      </div>

                      <div className="home-terminal-log">
                        <div className="terminal-header">
                          <div className="terminal-dots">
                            <span className="terminal-dot red" />
                            <span className="terminal-dot yellow" />
                            <span className="terminal-dot green" />
                          </div>
                          <span className="terminal-title">SYS://BATTLE_REC/LOG</span>
                        </div>
                        <div className="terminal-body">
                          {activePvPGames.length > 0 ? (
                            activePvPGames.map((game, gi) => (
                              <div key={gi} className="terminal-row row-win">
                                <span className="row-outcome">LIVE MATCH</span>
                                <span className="row-opponent">{game.creatorUsername || 'Lobby'}</span>
                                <span className="row-lang">{game.language || 'Any'}</span>
                                <span className="row-time">{game.participants?.length || 0} players</span>
                                <span className="row-xp">+{game.xpReward || 100} XP</span>
                                <span className="row-date"><Link to={`/code-wars/game/${game.id}`} className="join-active-game-btn">JOIN</Link></span>
                              </div>
                            ))
                          ) : (
                            <>
                              <div className="terminal-row row-win">
                                <span className="row-outcome">READY</span>
                                <span className="row-opponent">Operative: {user.username}</span>
                                <span className="row-lang">Status: Active</span>
                                <span className="row-time">Session: Online</span>
                                <span className="row-xp">Level {user.level || 1}</span>
                                <span className="row-date">Now</span>
                              </div>
                              <div className="terminal-row row-win">
                                <span className="row-outcome">LOG</span>
                                <span className="row-opponent">Latest XP deposit</span>
                                <span className="row-lang">Total: {user.xp} XP</span>
                                <span className="row-time">Activity: Checked</span>
                                <span className="row-xp">+{todaysXp} today</span>
                                <span className="row-date">Session</span>
                              </div>
                              <div className="terminal-row row-win">
                                <span className="row-outcome">BLUEPRINTS</span>
                                <span className="row-opponent">Vault Records</span>
                                <span className="row-lang">{notesCount} Items</span>
                                <span className="row-time">Vault: Configured</span>
                                <span className="row-xp">Secure</span>
                                <span className="row-date">Online</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* TAB 4: NETWORK FACTIONS */}
                  {activeTab === 'factions' && (
                    <div className="tab-pane-content">
                      <div className="home-section-header">
                        <span className="home-section-eyebrow">COLLECTIVES</span>
                        <h2 className="home-section-title">Network Factions</h2>
                        <p className="home-section-desc">Synchronize with active alliances or explore group ranks.</p>
                      </div>

                      <div className="factions-tab-grid">
                        {factionsList.length > 0 ? (
                          factionsList.map((fac) => {
                            const isMember = fac.members?.some(m => m.username === user.username || m.id === user.id || m === user.username);
                            return (
                              <TiltCard key={fac._id || fac.id} className={`faction-list-card ${isMember ? 'joined' : ''}`} style={{ '--faction-accent': fac.color || 'var(--primary)' }} intensity={3}>
                                <div className="faction-card-header">
                                  <h4 className="faction-name">{fac.name}</h4>
                                  <span className="faction-privacy-badge">{fac.isPrivate ? 'PRIVATE' : 'PUBLIC'}</span>
                                </div>
                                <p className="faction-description">{fac.description || 'No description set.'}</p>
                                <div className="faction-card-meta">
                                  <span>{fac.members?.length || 0} members</span>
                                  {isMember && <span className="joined-indicator">✓ MEMBER</span>}
                                </div>
                              </TiltCard>
                            );
                          })
                        ) : (
                          <div className="factions-empty-state">
                            <Users size={32} />
                            <p>No factions registered. Navigate to Factions to initialize a network node!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TAB 5: APEX HALL OF FAME */}
                  {activeTab === 'fame' && (
                    <div className="tab-pane-content">
                      <div className="home-section-header">
                        <span className="home-section-eyebrow">ELITE TIER</span>
                        <h2 className="home-section-title">Hall of Fame</h2>
                        <p className="home-section-desc">The apex developers on the network leaderboard.</p>
                      </div>

                      <div className="home-fame-grid">
                        {rankersLoading ? (
                          [1, 2, 3].map(i => (
                            <div key={i} className="home-fame-card skeleton">
                              <div className="fame-skeleton-avatar" />
                              <div className="fame-skeleton-text" />
                              <div className="fame-skeleton-text short" />
                            </div>
                          ))
                        ) : rankersError || !topRankers.length ? (
                          <div className="home-fame-empty">
                            <Trophy size={48} />
                            <p>Leaderboard node temporarily offline.</p>
                          </div>
                        ) : (
                          (() => {
                            const ordered = [topRankers[1], topRankers[0], topRankers[2]].filter(Boolean);
                            return ordered.map((ranker, di) => {
                              const actualIdx = topRankers.indexOf(ranker);
                              const medalColors = ['#c0c0c0', '#ffd700', '#cd7f32'];
                              const medalEmoji = ['🥈', '🥇', '🥉'];
                              const isFirst = actualIdx === 0;
                              return (
                                <TiltCard
                                  key={ranker.username}
                                  className={`home-fame-card rank-${actualIdx + 1} ${isFirst ? 'is-first' : ''}`}
                                  variants={fadeUp}
                                  custom={di * 0.08}
                                  onClick={() => navigate(`/u/${ranker.username}`)}
                                  style={{ '--medal-color': medalColors[di] }}
                                  intensity={4}
                                >
                                  {isFirst && <div className="fame-crown-glow" />}
                                  <div className="home-fame-rank">{medalEmoji[di]}</div>
                                  <div className="home-fame-avatar">
                                    {ranker.username[0].toUpperCase()}
                                    <div className="home-fame-avatar-ring" />
                                  </div>
                                  <div className="home-fame-info">
                                    <h3>{ranker.username}</h3>
                                    <div className="home-fame-meta">
                                      <span><Zap size={12} />{ranker.xp?.toLocaleString()} XP</span>
                                      <span><Shield size={12} />LVL {ranker.level}</span>
                                    </div>
                                  </div>
                                  <div className="home-fame-shimmer" />
                                </TiltCard>
                              );
                            });
                          })()
                        )}
                      </div>
                      <div className="home-fame-cta">
                        <Link to="/leaderboard" className="home-fame-btn">
                          <Trophy size={16} />
                          <span>View Full Leaderboards</span>
                          <ChevronRight size={16} />
                        </Link>
                      </div>
                    </div>
                  )}

                  {/* TAB 6: SUPPORT CHANNELS */}
                  {activeTab === 'support' && (
                    <div className="tab-pane-content">
                      <div className="home-support-inner">
                        <div className="home-support-info">
                          <span className="home-section-eyebrow">TRANSMISSIONS</span>
                          <h2 className="home-section-title">Direct Line</h2>
                          <p className="home-section-desc">Establish secure socket link to system operators.</p>
                          <div className="home-support-meta">
                            <div className="home-support-meta-item"><span className="meta-dot active" />Response latency: &lt;24h</div>
                            <div className="home-support-meta-item"><span className="meta-dot active" />Signal strength: Optimal</div>
                          </div>
                        </div>

                        <form className="home-support-form" onSubmit={handleSupportSubmit}>
                          {supportForm.sent ? (
                            <motion.div className="home-support-sent" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                              <div className="home-sent-icon">✓</div>
                              <h3>Transmission Dispatched</h3>
                              <p>System operators will respond shortly.</p>
                            </motion.div>
                          ) : (
                            <>
                              <input className="home-support-input" type="text" placeholder="Subject of inquiry"
                                value={supportForm.subject} onChange={e => setSupportForm(p => ({ ...p, subject: e.target.value }))} />
                              <textarea className="home-support-textarea" placeholder="Describe inquiry parameters..."
                                value={supportForm.message} onChange={e => setSupportForm(p => ({ ...p, message: e.target.value }))} required />
                              <button className="home-support-btn" type="submit" disabled={supportForm.isSending}>
                                {supportForm.isSending ? (
                                  <><span className="home-btn-spinner" />Dispatched...</>
                                ) : (
                                  <><ArrowUpRight size={16} />Dispatch Signal</>
                                )}
                              </button>
                            </>
                          )}
                        </form>
                      </div>
                    </div>
                  )}
                  
                </motion.div>
              </AnimatePresence>
            </div>
            
          </div>
        </div>
      </div>
      ) : (
        /* ──═══════════════ GUEST INDEX ═══════════════── */
        <motion.section className="home-guest-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="home-guest-inner">
            <motion.div className="home-greeting-badge" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
              <span className="home-greeting-dot" />
              <span>CORE PROTOCOL · INITIALIZED</span>
            </motion.div>
            <motion.h2 className="home-guest-title" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.1 } }}>
              The Workspace for <span>Elite Logic</span>
            </motion.h2>
            <motion.p className="home-guest-subtitle" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}>
              A high-performance collaborative workspace designed for developers who treat coding as an art form.
            </motion.p>
            <motion.div className="home-guest-features" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}>
              {[{ n: '01', h: 'Velocity', p: 'Engineered for low-latency live operations.' },
                { n: '02', h: 'Mastery', p: 'Curated modules to push engineering parameters.' },
                { n: '03', h: 'Alliances', p: 'Coordinate with factions on global leaderboard arrays.' }
              ].map(f => (
                <TiltCard key={f.n} className="home-guest-feature-card">
                  <span className="home-guest-feat-num">{f.n}</span>
                  <h4>{f.h}</h4>
                  <p>{f.p}</p>
                </TiltCard>
              ))}
            </motion.div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1, transition: { delay: 0.4 } }}>
              <Link to="/auth" className="home-guest-cta">
                <Play size={18} />
                Initialize Link
              </Link>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* MOTIVATIONAL TICKER BANNER */}
      {user && (
        <div className="home-ticker-wrap">
          <div className="home-ticker">
            <div className="home-ticker-track">
              {[...motivationalQuotes, ...motivationalQuotes].map((q, i) => (
                <span key={i} className="home-ticker-item">
                  <span className="home-ticker-sep">✦</span>{q}
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
