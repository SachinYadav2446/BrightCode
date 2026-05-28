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
const FloatingOrb = ({ style }) => (
  <div className="floating-orb" style={style} />
);

/* ─── 3D Tilt Card Component ─── */
const TiltCard = ({ children, className = '', intensity = 8 }) => {
  const ref = useRef(null);
  const handleMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    ref.current.style.transform = `perspective(1000px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) translateZ(10px)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)';
  };
  return (
    <div ref={ref} className={`tilt-card ${className}`} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
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

  /* ── Fetch top rankers ── */
  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/leaderboard`, { timeout: 5000 });
        setTopRankers((data || []).slice(0, 3));
      } catch { setRankersError(true); }
      finally { setRankersLoading(false); }
    };
    fetch();
  }, []);

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

  /* ═══════════════════════════ RENDER ═══════════════════════════ */
  return (
    <div className="home-wrapper">
      {/* ── Ambient Background ── */}
      <div className="home-bg">
        <div className="bg-grid" />
        <div className="bg-cursor-glow" />
        <FloatingOrb style={{ top: '10%', left: '5%', width: 400, height: 400, background: 'radial-gradient(circle, rgba(239,68,68,0.06) 0%, transparent 70%)' }} />
        <FloatingOrb style={{ top: '50%', right: '5%', width: 500, height: 500, background: 'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', animationDelay: '-3s' }} />
        <FloatingOrb style={{ bottom: '20%', left: '30%', width: 350, height: 350, background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)', animationDelay: '-7s' }} />
      </div>

      {/* ═══════ AUTHENTICATED USER DASHBOARD ═══════ */}
      {user ? (
        <div className="home-dashboard">

          {/* ── HERO SECTION ── */}
          <motion.section ref={heroRef} className="home-hero-section" style={{ y: heroY, opacity: heroOpacity }}>
            <motion.div className="home-hero-inner" variants={stagger} initial="hidden" animate="visible">

              {/* Greeting */}
              <motion.div className="home-greeting-badge" variants={fadeUp} custom={0}>
                <span className="home-greeting-dot" />
                <span>MISSION CONTROL · ACTIVE SESSION</span>
              </motion.div>

              <motion.h1 className="home-hero-title" variants={fadeUp} custom={0.05}>
                Welcome back,{' '}
                <span className="home-hero-name">{user.username}</span>
              </motion.h1>

              <motion.p className="home-hero-subtitle" variants={fadeUp} custom={0.1}>
                Your progress is tracked. Your mission is live. Keep pushing the frontier.
              </motion.p>

              {/* XP Stats Row */}
              <motion.div className="home-hero-stats" variants={stagger}>
                {[
                  { icon: Zap, label: 'Total XP', value: xp.toLocaleString(), suffix: ' XP', color: '#ffd700' },
                  { icon: Crown, label: 'Rank', value: levelInfo.label, suffix: '', color: levelInfo.color },
                  { icon: Flame, label: 'Today\'s XP', value: todaysXp, suffix: ' XP', color: '#ef4444' },
                  { icon: Activity, label: 'Active Days', value: activeDays, suffix: '', color: '#22c55e' },
                ].map((stat, i) => (
                  <motion.div key={stat.label} className="home-stat-card" variants={fadeUp} custom={i * 0.05}
                    whileHover={{ y: -6, scale: 1.02 }}>
                    <div className="home-stat-icon" style={{ '--stat-color': stat.color }}>
                      <stat.icon size={18} />
                    </div>
                    <div className="home-stat-info">
                      <span className="home-stat-val" style={{ color: stat.color }}>
                        <AnimatedCounter end={typeof stat.value === 'number' ? stat.value : 0} />
                        {typeof stat.value === 'string' ? stat.value : ''}{stat.suffix}
                      </span>
                      <span className="home-stat-label">{stat.label}</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              {/* XP Progress Bar */}
              {levelInfo.next && (
                <motion.div className="home-xp-bar-wrap" variants={fadeUp} custom={0.2}>
                  <div className="home-xp-bar-labels">
                    <span>{levelInfo.label}</span>
                    <span className="home-xp-bar-pct">{Math.round(xpPercent)}% → Next Rank</span>
                    <span>{xp >= 5000 ? 'Expert' : xp >= 2000 ? 'Advanced' : xp >= 500 ? 'Apprentice' : 'Apprentice'}</span>
                  </div>
                  <div className="home-xp-bar-track">
                    <motion.div className="home-xp-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercent}%` }}
                      transition={{ duration: 1.4, ease: 'easeOut', delay: 0.3 }}
                      style={{ '--xp-color': levelInfo.color }}
                    />
                    <div className="home-xp-bar-glow" style={{ left: `${xpPercent}%`, '--xp-color': levelInfo.color }} />
                  </div>
                </motion.div>
              )}
            </motion.div>
          </motion.section>

          {/* ── QUICK ACTIONS GRID ── */}
          <motion.section className="home-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.div className="home-section-header" variants={fadeUp}>
              <span className="home-section-eyebrow">NAVIGATION</span>
              <h2 className="home-section-title">Command Center</h2>
              <p className="home-section-desc">Your high-priority modules, ready for deployment.</p>
            </motion.div>

            <div className="home-actions-grid">
              {quickActions.map((action, i) => (
                <motion.div key={action.label} variants={fadeUp} custom={i * 0.04}>
                  <TiltCard className="home-action-card" intensity={6}
                    onClick={() => navigate(action.path)}
                    style={{ '--card-color': action.color }}>
                    <div className="home-action-card-inner">
                      <div className="home-action-top">
                        <div className="home-action-icon" style={{ background: `${action.color}15`, border: `1px solid ${action.color}30` }}>
                          <action.icon size={22} style={{ color: action.color }} />
                        </div>
                        {action.badge && (
                          <span className="home-action-badge" style={{ background: `${action.color}20`, color: action.color, border: `1px solid ${action.color}40` }}>
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <h3 className="home-action-title">{action.label}</h3>
                      <p className="home-action-desc">{action.desc}</p>
                      <div className="home-action-arrow">
                        <ArrowUpRight size={16} style={{ color: action.color }} />
                      </div>
                    </div>
                    <div className="home-action-shimmer" />
                    <div className="home-action-glow" style={{ '--card-color': action.color }} />
                  </TiltCard>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* ── ACTIVITY HEATMAP ── */}
          <motion.section className="home-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.div className="home-section-header" variants={fadeUp}>
              <span className="home-section-eyebrow">ACTIVITY</span>
              <h2 className="home-section-title">Coding Heatmap</h2>
              <p className="home-section-desc">{new Date().getFullYear()} contribution timeline — every pixel represents XP earned.</p>
            </motion.div>

            <motion.div className="home-heatmap-card" variants={fadeUp}>
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
            </motion.div>
          </motion.section>

          {/* ── SKILL RADAR ── */}
          <motion.section className="home-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.div className="home-section-header" variants={fadeUp}>
              <span className="home-section-eyebrow">PROFICIENCY</span>
              <h2 className="home-section-title">Skill Arsenal</h2>
              <p className="home-section-desc">Track your mastery across all disciplines.</p>
            </motion.div>

            <div className="home-skills-grid">
              {skillDistribution.map((skill, i) => {
                const pct = Math.min((skill.val / skill.max) * 100, 100);
                const label = pct >= 100 ? 'MASTER' : pct >= 75 ? 'EXPERT' : pct >= 50 ? 'ADVANCED' : pct >= 25 ? 'INTERMEDIATE' : pct > 0 ? 'BEGINNER' : 'INITIATE';
                return (
                  <motion.div key={skill.id} className={`home-skill-card ${activeSkill === skill.id ? 'active' : ''}`}
                    variants={fadeUp} custom={i * 0.06}
                    whileHover={{ y: -4 }}
                    onClick={() => setActiveSkill(activeSkill === skill.id ? null : skill.id)}
                    style={{ '--skill-color': skill.color }}>
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
                  </motion.div>
                );
              })}
            </div>
          </motion.section>

          {/* ── MOTIVATIONAL TICKER ── */}
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

          {/* ── HALL OF FAME ── */}
          <motion.section className="home-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <motion.div className="home-section-header" variants={fadeUp}>
              <span className="home-section-eyebrow">ELITE TIER</span>
              <h2 className="home-section-title">Hall of Fame</h2>
              <p className="home-section-desc">The apex developers on the BrightCode network.</p>
            </motion.div>

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
                  <p>Rankings temporarily unavailable</p>
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
                      <motion.div key={ranker.username}
                        className={`home-fame-card rank-${actualIdx + 1} ${isFirst ? 'is-first' : ''}`}
                        variants={fadeUp} custom={di * 0.08}
                        whileHover={{ y: -8, scale: 1.02 }}
                        onClick={() => navigate(`/u/${ranker.username}`)}
                        style={{ '--medal-color': medalColors[di] }}>
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
                      </motion.div>
                    );
                  });
                })()
              )}
            </div>
            <motion.div className="home-fame-cta" variants={fadeUp} custom={0.3}>
              <Link to="/leaderboard" className="home-fame-btn">
                <Trophy size={16} />
                <span>View Full Rankings</span>
                <ChevronRight size={16} />
              </Link>
            </motion.div>
          </motion.section>

          {/* ── SUPPORT SECTION ── */}
          <motion.section className="home-section home-support-section" initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} variants={stagger}>
            <div className="home-support-inner">
              <motion.div className="home-support-info" variants={fadeUp}>
                <span className="home-section-eyebrow">SUPPORT</span>
                <h2 className="home-section-title">Direct Line</h2>
                <p className="home-section-desc">Reach the core team directly. We respond within 24 hours.</p>
                <div className="home-support-meta">
                  <div className="home-support-meta-item"><span className="meta-dot active" />Response: ~24h</div>
                  <div className="home-support-meta-item"><span className="meta-dot active" />Status: Active</div>
                  <div className="home-support-meta-item"><span className="meta-dot active" />Priority Support</div>
                </div>
              </motion.div>

              <motion.form className="home-support-form" onSubmit={handleSupportSubmit} variants={fadeUp} custom={0.1}>
                {supportForm.sent ? (
                  <motion.div className="home-support-sent" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                    <div className="home-sent-icon">✓</div>
                    <h3>Transmission Sent</h3>
                    <p>Our team will respond within 24 hours.</p>
                  </motion.div>
                ) : (
                  <>
                    <input className="home-support-input" type="text" placeholder="Subject of inquiry"
                      value={supportForm.subject} onChange={e => setSupportForm(p => ({ ...p, subject: e.target.value }))} />
                    <textarea className="home-support-textarea" placeholder="Describe your issue or question..."
                      value={supportForm.message} onChange={e => setSupportForm(p => ({ ...p, message: e.target.value }))} required />
                    <button className="home-support-btn" type="submit" disabled={supportForm.isSending}>
                      {supportForm.isSending ? (
                        <><span className="home-btn-spinner" />Transmitting...</>
                      ) : (
                        <><ArrowUpRight size={16} />Send Inquiry</>
                      )}
                    </button>
                  </>
                )}
              </motion.form>
            </div>
          </motion.section>

        </div>

      ) : (
        /* ═══════ GUEST VIEW ═══════ */
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
              A high-performance environment designed for developers who treat code as an art form.
            </motion.p>
            <motion.div className="home-guest-features" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1, transition: { delay: 0.3 } }}>
              {[{ n: '01', h: 'Velocity', p: 'Engineered for low-latency collaboration.' },
                { n: '02', h: 'Mastery', p: 'Curated challenges to push your limits.' },
                { n: '03', h: 'Network', p: 'Join elite factions of world-class engineers.' }
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
                Initialize Connection
              </Link>
            </motion.div>
          </div>
        </motion.section>
      )}

      <Chatbot />
    </div>
  );
};

export default Home;
