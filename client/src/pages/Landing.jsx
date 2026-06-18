import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Brain, Trophy, Shield, GitBranch, Users, Terminal,
  Sparkles, Check, Play, CheckCircle, ArrowUpRight,
  Code2, Menu, X, Zap, Activity, Star, TrendingUp, Lock, Crown
} from "lucide-react";
import API_URL from "../config";
import CodeBrightLogo from "../components/CodeBrightLogo";
import "./Landing.css";

/* ────────────────────────────────────────────────────────────
   CONSTANTS
──────────────────────────────────────────────────────────── */
const TICKER_ITEMS = [
  "2,500+ Coding Challenges",
  "15+ Languages Supported",
  "AI-Powered Sentinel",
  "Real-time Sync &lt;30ms",
  "Faction Wars",
  "Secure Proctoring",
  "Warp Drive Version Control",
  "Daily Streak Multipliers",
  "Live Leaderboards",
  "Collaborative Workspaces",
];

const CODE_LINES = [
  { num: 1, text: "class Solution:" },
  { num: 2, text: "    def twoSum(self, nums, target):" },
  { num: 3, text: "        seen = {}" },
  { num: 4, text: "        for i, num in enumerate(nums):" },
  { num: 5, text: "            rem = target - num" },
  { num: 6, text: "            if rem in seen:" },
  { num: 7, text: "                return [seen[rem], i]" },
  { num: 8, text: "            seen[num] = i" },
];

/* ────────────────────────────────────────────────────────────
   ANIMATED COUNTER
──────────────────────────────────────────────────────────── */
function AnimCounter({ target, suffix = "", duration = 2000 }) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else setVal(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>;
}

/* ────────────────────────────────────────────────────────────
   NAV
──────────────────────────────────────────────────────────── */
function Nav({ handleAuth }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav className={`lnav ${scrolled ? "lnav-scrolled" : ""}`}>
      <div className="lnav-inner">
        <a className="lnav-logo" href="#" onClick={e => e.preventDefault()}>
          <CodeBrightLogo size="small" />
        </a>
        <div className="lnav-links">
          {["Features","Modules","Workflow","Arena"].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className="lnav-link">{l}</a>
          ))}
        </div>
        <div className="lnav-ctas">
          <button className="lnav-sign-in" onClick={() => handleAuth("login")}>Sign In</button>
          <button className="lnav-get-started" onClick={() => handleAuth("register")}>Get Started</button>
        </div>
        <button className="lnav-burger" onClick={() => setOpen(p => !p)}>
          {open ? <X size={22}/> : <Menu size={22}/>}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            className="lnav-drawer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {["Features","Modules","Workflow","Arena"].map(l => (
              <a key={l} href={`#${l.toLowerCase()}`} className="lnav-drawer-link" onClick={() => setOpen(false)}>{l}</a>
            ))}
            <div className="lnav-drawer-ctas">
              <button className="lnav-sign-in" onClick={() => { handleAuth("login"); setOpen(false); }}>Sign In</button>
              <button className="lnav-get-started" onClick={() => { handleAuth("register"); setOpen(false); }}>Get Started</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ────────────────────────────────────────────────────────────
   HERO
──────────────────────────────────────────────────────────── */
function HeroSection({ handleAuth, handleHub }) {
  const [visibleLines, setVisibleLines] = useState(0);
  const [consoleShow, setConsoleShow] = useState(false);

  useEffect(() => {
    if (visibleLines < CODE_LINES.length) {
      const t = setTimeout(() => setVisibleLines(v => v + 1), 280);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => setConsoleShow(true), 400);
      return () => clearTimeout(t);
    }
  }, [visibleLines]);

  return (
    <section className="hero-section" id="home">
      {/* Animated background */}
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />
        <div className="hero-noise" />
        <div className="hero-grid" />
      </div>

      <div className="hero-inner">
        {/* Left: Copy */}
        <motion.div
          className="hero-left"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >

          <h1 className="hero-h1">
            <span className="hero-h1-line">Code Harder.</span>
            <span className="hero-h1-line hero-h1-gradient">Compete Smarter.</span>
          </h1>

          <div className="hero-actions">
            <button className="btn-clay" onClick={() => handleAuth("register")}>
              Start Building for Free
            </button>
            <button className="btn-ghost-hero" onClick={handleHub}>
              <div className="btn-ghost-play"><Play size={14} fill="currentColor" /></div>
              Watch Demo
            </button>
          </div>

          <div className="hero-proof">
            <div className="proof-item">
              <AnimCounter target={2500} suffix="+" />
              <span>Challenges</span>
            </div>
            <div className="proof-sep" />
            <div className="proof-item">
              <AnimCounter target={12000} suffix="+" />
              <span>Engineers</span>
            </div>
            <div className="proof-sep" />
            <div className="proof-item">
              <span>{"<30ms"}</span>
              <span>Sync Speed</span>
            </div>
          </div>
        </motion.div>

        {/* Right: IDE card */}
        <motion.div
          className="hero-right"
          initial={{ opacity: 0, x: 40, rotateY: 10 }}
          animate={{ opacity: 1, x: 0, rotateY: -5 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          style={{ perspective: "1000px" }}
        >
          <div className="ide-card">
            {/* Glow rings */}
            <div className="ide-glow" />

            {/* Title bar */}
            <div className="ide-titlebar">
              <div className="ide-dots">
                <span className="ide-dot red" />
                <span className="ide-dot yellow" />
                <span className="ide-dot green" />
              </div>
              <div className="ide-title-center">
                <span className="ide-filename">solution.py</span>
              </div>
              <div className="ide-lang-tabs">
                <span className="ide-lang active">Python</span>
                <span className="ide-lang">JavaScript</span>
              </div>
            </div>

            {/* Problem bar */}
            <div className="ide-problem-bar">
              <span className="ide-prob-num">1.</span>
              <span className="ide-prob-name">Two Sum</span>
              <span className="ide-prob-diff easy">Easy</span>
              <div className="ide-sentinel-chip">
                <Sparkles size={10} />
                Sentinel Active
              </div>
            </div>

            {/* Code body */}
            <div className="ide-code-body">
              {CODE_LINES.slice(0, visibleLines).map((line, i) => (
                <motion.div
                  key={i}
                  className="ide-code-line"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="ide-ln">{line.num}</span>
                  <span className="ide-code-text">{line.text}</span>
                </motion.div>
              ))}
              {visibleLines < CODE_LINES.length && (
                <span className="ide-cursor blink">_</span>
              )}
            </div>

            {/* Console */}
            <AnimatePresence>
              {consoleShow && (
                <motion.div
                  className="ide-console"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className="ide-console-inner">
                    <CheckCircle size={12} className="ide-console-icon" />
                    <span className="ide-console-text">All 3 test cases passed</span>
                    <span className="ide-console-meta">· 38ms · Beats 94.2%</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Complexity badge */}
            <div className="ide-complexity-badge">
              <Activity size={11} />
              O(N) · Hash Map optimized
            </div>
          </div>

          {/* Floating achievement card */}
          <motion.div
            className="hero-float-card"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          >
            <Trophy size={16} className="float-card-icon" />
            <div className="float-card-text">
              <span>Rank #1 in Faction</span>
              <span>Iron Wolves</span>
            </div>
          </motion.div>

          {/* Floating XP card */}
          <motion.div
            className="hero-float-card hero-float-card-2"
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <Zap size={14} className="float-card-icon gold" />
            <div className="float-card-text">
              <span>+150 XP earned</span>
              <span>5 day streak</span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   TICKER
──────────────────────────────────────────────────────────── */
function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="ticker-wrap">
      <div className="ticker-track">
        {items.map((item, i) => (
          <span key={i} className="ticker-item">
            <span className="ticker-dot" />
            <span dangerouslySetInnerHTML={{ __html: item }} />
          </span>
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   BENTO FEATURES
──────────────────────────────────────────────────────────── */
function BentoFeatures() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const cardAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 24, scale: 0.97 },
    animate: inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 24, scale: 0.97 },
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay },
  });

  return (
    <section className="bento-section" id="features" ref={ref}>
      <div className="bento-section-header">
        <motion.div {...cardAnim(0)}>
          <span className="section-pill">Powerful Features</span>
          <h2 className="section-h2">Everything You Need to Dominate</h2>
          <p className="section-sub">Five pillars that make BrightCode the platform serious engineers trust.</p>
        </motion.div>
      </div>

      <div className="bento-grid">

        {/* ── CODE EDITOR ── */}
        <motion.div {...cardAnim(0)} className="bento-card bento-editor accent-rust floating-card">
          <div className="bcard-top">
            <div className="bcard-icon-wrap rust">
              <Terminal size={20} />
            </div>
            <span className="bcard-tag rust">Editor</span>
          </div>
          <h3 className="bcard-title">Smart Code Editor</h3>
          <p className="bcard-desc">10+ languages, syntax highlighting, and instant test validation.</p>
          <div className="bv-editor-langs">
            {["Python","JS","Go","Rust","C++"].map((l,i) => (
              <span key={l} className={`bv-lang-tab ${i===0 ? "active-rust" : ""}`}>{l}</span>
            ))}
          </div>
          <div className="bv-mini-code">
            <span className="bv-mc-kw">def</span> <span className="bv-mc-fn">solve</span>(nums):
            <br />&nbsp;&nbsp;seen = <span className="bv-mc-br">{"{}"}</span>
            <br />&nbsp;&nbsp;<span className="bv-mc-kw">return</span> <span className="bv-mc-fn">map</span>(...)
          </div>
        </motion.div>

        {/* ── BATTLE ARENA ── */}
        <motion.div {...cardAnim(0.5)} className="bento-card bento-battle accent-red floating-card">
          <div className="bcard-top">
            <div className="bcard-icon-wrap red">
              <Trophy size={20} />
            </div>
            <span className="bcard-live-badge"><span className="live-dot" />LIVE</span>
          </div>
          <h3 className="bcard-title">Competitive Arenas</h3>
          <p className="bcard-desc">Race against developers in real-time speed-coding battles.</p>
          <div className="bv-battle">
            <div className="bv-battle-row">
              <div className="bv-player you"><span>You</span><span className="bv-score">3 solved</span></div>
              <div className="bv-vs">VS</div>
              <div className="bv-player opp"><span>algo_queen</span><span className="bv-score">2 solved</span></div>
            </div>
            <div className="bv-timer-bar">
              <div className="bv-timer-fill" />
            </div>
            <div className="bv-time-left">02:47 remaining</div>
          </div>
        </motion.div>

        {/* ── WARP DRIVE ── */}
        <motion.div {...cardAnim(1)} className="bento-card bento-warp accent-sage floating-card">
          <div className="bcard-top">
            <div className="bcard-icon-wrap sage">
              <GitBranch size={20} />
            </div>
            <span className="bcard-tag sage">Version Control</span>
          </div>
          <h3 className="bcard-title">Warp Drive</h3>
          <p className="bcard-desc">Instant code snapshots. Roll back, compare, or restore in one click.</p>
          <div className="bv-timeline">
            {[
              { time: "09:12", label: "First build", done: true },
              { time: "09:24", label: "Optimized loop", done: true },
              { time: "09:31", label: "Current", done: false, current: true },
            ].map((cp, i) => (
              <div key={i} className={`bv-tl-node ${cp.done ? "done" : ""} ${cp.current ? "current" : ""}`}>
                <div className="bv-tl-dot" />
                <div className="bv-tl-info">
                  <span>{cp.time}</span>
                  <span>{cp.label}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── PROCTOR ── */}
        <motion.div {...cardAnim(1.5)} className="bento-card bento-proctor accent-cream floating-card">
          <div className="bcard-top">
            <div className="bcard-icon-wrap cream">
              <Shield size={20} />
            </div>
            <span className="bcard-tag cream">Security</span>
          </div>
          <h3 className="bcard-title">Secure Proctoring</h3>
          <p className="bcard-desc">Tab tracking, screen monitoring, real-time violation logs.</p>
          <div className="bv-proctor-stats">
            <div className="bv-ps-item">
              <span className="bv-ps-num sage">12</span>
              <span className="bv-ps-lbl">Active</span>
            </div>
            <div className="bv-ps-item">
              <span className="bv-ps-num warn">2</span>
              <span className="bv-ps-lbl">Violations</span>
            </div>
            <div className="bv-ps-item">
              <span className="bv-ps-num">98%</span>
              <span className="bv-ps-lbl">Integrity</span>
            </div>
          </div>
        </motion.div>

        {/* ── COMMUNITY ── */}
        <motion.div {...cardAnim(2)} className="bento-card bento-collab accent-gold floating-card">
          <div className="bcard-top">
            <div className="bcard-icon-wrap gold">
              <Users size={20} />
            </div>
            <span className="bcard-tag gold">Community</span>
          </div>
          <h3 className="bcard-title">Factions & Teams</h3>
          <p className="bcard-desc">Join a faction, compete in wars, climb the global ranks.</p>
          <div className="bv-factions">
            {[
              { name: "Iron Wolves", color: "#ef4444", xp: "84.2K" },
              { name: "Code Phoenix", color: "#8b5cf6", xp: "71.8K" },
              { name: "Silent Hash", color: "#06b6d4", xp: "68.1K" },
            ].map(f => (
              <div key={f.name} className="bv-faction-row">
                <span className="bv-faction-dot" style={{ background: f.color }} />
                <span className="bv-faction-name">{f.name}</span>
                <span className="bv-faction-xp">{f.xp} XP</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   HOW IT WORKS
──────────────────────────────────────────────────────────── */
function HowItWorks() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const steps = [
    { num: "01", icon: Star, title: "Pick Your Quest", desc: "Choose from 2,500+ algorithm challenges, join a live battle arena, or start a collaborative coding session with teammates." },
    { num: "02", icon: Brain, title: "Write & Optimize", desc: "Code in our smart editor with Sentinel AI watching live — it detects inefficiencies, suggests fixes, and tracks your Warp Drive checkpoints." },
    { num: "03", icon: TrendingUp, title: "Climb the Ranks", desc: "Earn XP, maintain streaks for multipliers, lead your faction to the top of the leaderboard, and become a Grandmaster." },
  ];

  return (
    <section className="hiw-section" id="workflow" ref={ref}>
      <div className="hiw-inner">
        <motion.div
          className="hiw-header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="section-pill">Workflow</span>
          <h2 className="section-h2">Three Steps to the Top</h2>
        </motion.div>

        <div className="hiw-steps">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={i}
                className="hiw-step"
                initial={{ opacity: 0, y: 30 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.55, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className="hiw-step-icon-wrap">
                  <Icon size={22} />
                </div>
                <h4 className="hiw-step-title">{step.title}</h4>
                <p className="hiw-step-desc">{step.desc}</p>
                {i < steps.length - 1 && <div className="hiw-connector" />}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   LEADERBOARD SECTION
──────────────────────────────────────────────────────────── */
function LeaderboardSection({ data, loading, handleAuth }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const RANK_COLORS = ["#f59e0b","#94a3b8","#b45309","#a78bfa","#34d399"];

  // Mock data for demonstration
  const mockData = [
    { username: "code_master_99", level: "Grandmaster", xp: 15420 },
    { username: "algo_queen", level: "Master", xp: 12350 },
    { username: "byte_ninja", level: "Expert", xp: 9870 },
  ];

  const displayData = data && data.length > 0 ? data : mockData;

  return (
    <section className="lb-section" id="arena" ref={ref}>
      <div className="lb-inner">
        <motion.div
          className="lb-left"
          initial={{ opacity: 0, x: -30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="section-pill">Competitive</span>
          <h2 className="section-h2">Rise on the Global Leaderboard</h2>
          <p className="section-sub">Solve problems, earn XP, and compete for the top spot.</p>

          <div className="lb-perks">
            {[
              { icon: Zap,         text: "XP from Apprentice to Grandmaster" },
              { icon: Users,       text: "Faction Wars with real stakes" },
              { icon: TrendingUp,  text: "Streak multipliers up to 3×" },
              { icon: Trophy,      text: "Monthly global ranking resets" },
            ].map(({ icon: Icon, text }, i) => (
              <div key={i} className="lb-perk">
                <div className="lb-perk-icon"><Icon size={15} /></div>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <button className="btn-clay" onClick={() => handleAuth("register")} style={{ marginTop: "28px" }}>
            Join a Faction Today
          </button>
        </motion.div>

        <motion.div
          className="lb-right"
          initial={{ opacity: 0, x: 30 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        >
          <div className="lb-podium">
            {loading ? (
              <div className="lb-empty">Loading operatives…</div>
            ) : displayData.length > 0 ? (
              <>
                {/* 2nd Place */}
                <motion.div
                  className="lb-podium-item lb-podium-2nd"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <div className="lb-podium-rank">2</div>
                  <div className="lb-podium-avatar">
                    <Trophy size={24} className="lb-podium-icon" />
                  </div>
                  <div className="lb-podium-name">{displayData[1]?.username}</div>
                  <div className="lb-podium-level">{displayData[1]?.level}</div>
                  <div className="lb-podium-xp">{(displayData[1]?.xp || 0).toLocaleString()} XP</div>
                </motion.div>

                {/* 1st Place */}
                <motion.div
                  className="lb-podium-item lb-podium-1st"
                  initial={{ opacity: 0, y: 30 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="lb-podium-crown">
                    <Crown size={28} className="lb-crown-icon" />
                  </div>
                  <div className="lb-podium-rank">1</div>
                  <div className="lb-podium-avatar">
                    <Trophy size={32} className="lb-podium-icon" />
                  </div>
                  <div className="lb-podium-name">{displayData[0]?.username}</div>
                  <div className="lb-podium-level">{displayData[0]?.level}</div>
                  <div className="lb-podium-xp">{(displayData[0]?.xp || 0).toLocaleString()} XP</div>
                </motion.div>

                {/* 3rd Place */}
                <motion.div
                  className="lb-podium-item lb-podium-3rd"
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.4 }}
                >
                  <div className="lb-podium-rank">3</div>
                  <div className="lb-podium-avatar">
                    <Trophy size={24} className="lb-podium-icon" />
                  </div>
                  <div className="lb-podium-name">{displayData[2]?.username}</div>
                  <div className="lb-podium-level">{displayData[2]?.level}</div>
                  <div className="lb-podium-xp">{(displayData[2]?.xp || 0).toLocaleString()} XP</div>
                </motion.div>
              </>
            ) : (
              <div className="lb-empty">No operatives ranked yet.</div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   STATS BAND
──────────────────────────────────────────────────────────── */
function StatsBand() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [currentStat, setCurrentStat] = useState(0);

  const stats = [
    { val: 2500, suffix: "+", label: "Coding Challenges", desc: "From easy to expert level problems" },
    { val: 12000, suffix: "+", label: "Active Engineers", desc: "Building skills every single day" },
    { val: 15, suffix: "+", label: "Languages", desc: "Code in your favorite language" },
    { val: 99, suffix: "%", label: "Uptime", desc: "Always available when you need it" },
  ];

  useEffect(() => {
    if (!inView) return;
    const interval = setInterval(() => {
      setCurrentStat(prev => (prev + 1) % stats.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [inView, stats.length]);

  return (
    <div className="stats-band" ref={ref}>
      <div className="stats-subheading">Platform Stats</div>
      <div className="stats-center-wrapper">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStat}
            className="stats-item stats-item-centered"
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -30, scale: 0.95 }}
            transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="stats-floating-orb stats-orb-1" />
            <div className="stats-floating-orb stats-orb-2" />
            <div className="stats-floating-orb stats-orb-3" />
            <div className="stats-num">
              {inView ? <AnimCounter target={stats[currentStat].val} suffix={stats[currentStat].suffix} /> : "0"}
            </div>
            <div className="stats-lbl">{stats[currentStat].label}</div>
            <div className="stats-desc">{stats[currentStat].desc}</div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="stats-dots">
        {stats.map((_, i) => (
          <button
            key={i}
            className={`stats-dot ${i === currentStat ? 'active' : ''}`}
            onClick={() => setCurrentStat(i)}
          />
        ))}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────────
   CTA
──────────────────────────────────────────────────────────── */
function CTASection({ handleAuth, handleHub }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  return (
    <section className="cta-section" ref={ref}>
      <motion.div
        className="cta-inner"
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={inView ? { opacity: 1, y: 0, scale: 1 } : {}}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="cta-orb cta-orb-1" />
        <div className="cta-orb cta-orb-2" />
        <div className="cta-content">
          <div className="cta-badge">
            <Sparkles size={12} />
            Free to start — no credit card required
          </div>
          <h2 className="cta-h2">Ready to become an elite engineer?</h2>
          <p className="cta-p">Join thousands of developers who practice smarter with BrightCode every day.</p>
          <div className="cta-btns">
            <button className="btn-clay btn-clay-large" onClick={() => handleAuth("register")}>
              Create Free Account
            </button>
            <button className="btn-ghost-hero btn-ghost-large" onClick={handleHub}>
              <div className="btn-ghost-play"><Play size={14} fill="currentColor" /></div>
              Explore Problems
            </button>
          </div>
          <p className="cta-note">
            <CheckCircle size={13} /> No setup required &nbsp;·&nbsp;
            <CheckCircle size={13} /> Runs in browser &nbsp;·&nbsp;
            <CheckCircle size={13} /> Cancel anytime
          </p>
        </div>
      </motion.div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   FOOTER
──────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="lp-footer">
      <div className="lp-footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <Code2 size={20} />
            <span>BRIGHT<b>CODE</b></span>
          </div>
        </div>
        <div className="footer-social">
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="footer-social-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="https://codechef.com" target="_blank" rel="noopener noreferrer" className="footer-social-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </a>
        </div>
        <div className="footer-bottom">
          <span>© 2026 BrightCode</span>
        </div>
      </div>
    </footer>
  );
}

/* ────────────────────────────────────────────────────────────
   MODULES CONSTANTS & DATA
   ──────────────────────────────────────────────────────────── */
const MODULES_DATA = [
  {
    id: "arcade",
    title: "Challenge Arcade",
    subtitle: "Gamified Algorithms & Quests",
    icon: Trophy,
    color: "gold",
    desc: "Level up your engineering skills with 2,500+ algorithm challenges. Earn achievements, maintain daily multipliers, and climb from Apprentice to Grandmaster.",
    perks: ["Custom test runner", "Hotkeys & Vim modes", "Streak multipliers"],
    previewType: "arcade",
  },
  {
    id: "workspace",
    title: "Collab Workspace",
    subtitle: "Real-time Pair Programming",
    icon: Terminal,
    color: "orange",
    desc: "Launch collaborative code rooms in seconds. Write, run, and debug code with team members simultaneously with sub-30ms typing synchronization.",
    perks: ["Shared code terminals", "Interactive cursor paths", "Built-in voice channels"],
    previewType: "workspace",
  },
  {
    id: "arena",
    title: "Battle Arena",
    subtitle: "Multiplayer Coding Duels",
    icon: Activity,
    color: "red",
    desc: "Race against the clock and live opponents in real-time speed coding matchups. Outsmart, outcode, and climb the competitive ladder.",
    perks: ["Elo matchmaking system", "Circular time progress", "Live spectator stream"],
    previewType: "arena",
  },
  {
    id: "proctor",
    title: "Sentinel Proctor",
    subtitle: "AI Compliance Suite",
    icon: Shield,
    color: "green",
    desc: "Deploy secure coding assessments. Sentinel AI monitors focus states, screen transitions, and browser compliance to ensure test integrity.",
    perks: ["Focus state tracking", "Audio violation logs", "Detailed integrity scores"],
    previewType: "proctor",
  },
  {
    id: "codevault",
    title: "CodeVault",
    subtitle: "Personal Code Repositories",
    icon: Lock,
    color: "cyan",
    desc: "Your secure cloud directory for all solved problems and custom scripts. Manage code versions, search syntax, and sync solutions to GitHub.",
    perks: ["GitHub continuous sync", "Tag & category filters", "One-click rollback"],
    previewType: "codevault",
  },
  {
    id: "factions",
    title: "Faction Wars",
    subtitle: "Guild-based Clan Competitions",
    icon: Users,
    color: "purple",
    desc: "Join one of the three factions — Iron Wolves, Code Phoenix, or Silent Hash. Compete in weekly guild battles to win territory and ranking points.",
    perks: ["Guild chat channels", "Faction XP multipliers", "Exclusive team skins"],
    previewType: "factions",
  }
];

/* ────────────────────────────────────────────────────────────
   MODULE VISUAL PREVIEW MOCKUPS
   ──────────────────────────────────────────────────────────── */
function ModuleVisualPreview({ type, color }) {
  if (type === "arcade") {
    return (
      <div className="vp-arcade">
        <div className="vp-arc-header">
          <span>Problem Set</span>
          <span className="vp-arc-tag">Algorithms</span>
        </div>
        <div className="vp-arc-problems">
          {[
            { name: "Median of Two Sorted Arrays", diff: "Hard", xp: 200, solved: true },
            { name: "Merge Intervals", diff: "Medium", xp: 120, solved: true },
            { name: "Binary Tree Maximum Path Sum", diff: "Hard", xp: 250, solved: false },
            { name: "Rotate Image Matrix", diff: "Medium", xp: 100, solved: false },
          ].map((prob, i) => (
            <div key={i} className="vp-arc-row">
              <div className={`vp-arc-check ${prob.solved ? "solved" : ""}`}>
                {prob.solved && <Check size={10} />}
              </div>
              <span className="vp-arc-name">{prob.name}</span>
              <span className={`vp-arc-diff ${prob.diff.toLowerCase()}`}>{prob.diff}</span>
              <span className="vp-arc-xp">+{prob.xp} XP</span>
            </div>
          ))}
        </div>
        <div className="vp-arc-footer">
          <div className="vp-arc-progress-label">
            <span>Daily Quest progress</span>
            <span>2 / 3 Complete</span>
          </div>
          <div className="vp-arc-progress-bar">
            <div className="vp-arc-progress-fill" style={{ width: "66%" }} />
          </div>
        </div>
      </div>
    );
  }

  if (type === "workspace") {
    return (
      <div className="vp-workspace">
        <div className="vp-ws-editor">
          <div className="vp-ws-line"><span className="vp-ws-ln">1</span><span className="vp-ws-kw">def</span> <span className="vp-ws-fn">calculate_mst</span>(graph):</div>
          <div className="vp-ws-line"><span className="vp-ws-ln">2</span>&nbsp;&nbsp;visited = <span className="vp-ws-fn">set</span>()</div>
          <div className="vp-ws-line" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <span className="vp-ws-ln">3</span>&nbsp;&nbsp;<span className="vp-ws-kw">for</span> edge <span className="vp-ws-op">in</span> graph.edges:
            <span className="vp-ws-cursor orange">
              <span className="vp-ws-cursor-lbl">Alex</span>
            </span>
          </div>
          <div className="vp-ws-line"><span className="vp-ws-ln">4</span>&nbsp;&nbsp;&nbsp;&nbsp;<span className="vp-ws-kw">if</span> edge.start <span className="vp-ws-op">not in</span> visited:</div>
          <div className="vp-ws-line" style={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <span className="vp-ws-ln">5</span>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;visited.<span className="vp-ws-fn">add</span>(edge.start)
            <span className="vp-ws-cursor red blink">
              <span className="vp-ws-cursor-lbl">Devon</span>
            </span>
          </div>
        </div>
        <div className="vp-ws-terminal">
          <div className="vp-ws-term-header">
            <span>Integrated Terminal</span>
            <span className="vp-ws-term-status green">Online</span>
          </div>
          <div className="vp-ws-term-log">
            <div className="vp-ws-term-line">python3 -u solution.py</div>
            <div className="vp-ws-term-line success">✓ Test Case 1 Passed. [22ms]</div>
            <div className="vp-ws-term-line success">✓ Test Case 2 Passed. [31ms]</div>
            <div className="vp-ws-term-line info">[System] Sync delay: 14ms (under 30ms limit)</div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "arena") {
    return (
      <div className="vp-arena">
        <div className="vp-ar-header">
          <div className="vp-ar-badge"><span className="live-dot" />Speed Match</div>
          <span className="vp-ar-status">Round 2</span>
        </div>
        <div className="vp-ar-versus">
          <div className="vp-ar-user you">
            <div className="vp-ar-avatar red">🐺</div>
            <span className="vp-ar-username">You (Rank #1)</span>
            <span className="vp-ar-score">3 / 4 Solved</span>
          </div>
          <div className="vp-ar-vs">VS</div>
          <div className="vp-ar-user opp">
            <div className="vp-ar-avatar purple">🦅</div>
            <span className="vp-ar-username">algo_queen</span>
            <span className="vp-ar-score">2 / 4 Solved</span>
          </div>
        </div>
        <div className="vp-ar-timer-container">
          <div className="vp-ar-timer-radial">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" className="circle-bg" />
              <circle cx="50" cy="50" r="45" className="circle-fill red" style={{ strokeDasharray: "283", strokeDashoffset: "90" }} />
            </svg>
            <div className="vp-ar-timer-text">
              <span className="vp-ar-time">02:47</span>
              <span className="vp-ar-label">REMAINING</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "proctor") {
    return (
      <div className="vp-proctor">
        <div className="vp-pr-grid">
          <div className="vp-pr-feed">
            <div className="vp-pr-video-mock">
              <div className="vp-pr-bounding-box" />
              <div className="vp-pr-face-mesh">
                <div className="vp-pr-mesh-dot" style={{ top: "45%", left: "40%" }} />
                <div className="vp-pr-mesh-dot" style={{ top: "45%", left: "60%" }} />
                <div className="vp-pr-mesh-dot" style={{ top: "55%", left: "50%" }} />
                <div className="vp-pr-mesh-dot" style={{ top: "68%", left: "38%" }} />
                <div className="vp-pr-mesh-dot" style={{ top: "68%", left: "62%" }} />
              </div>
              <div className="vp-pr-feed-indicator">
                <span className="live-dot" />
                <span>Webcam Feed</span>
              </div>
              <div className="vp-pr-feed-status">AI Face Lock: OK</div>
            </div>
          </div>
          <div className="vp-pr-status-panel">
            <div className="vp-pr-gauge">
              <span className="vp-pr-gauge-lbl">Integrity Score</span>
              <span className="vp-pr-gauge-val green">99.4%</span>
            </div>
            <div className="vp-pr-logs-header">Sentinel Compliance Logs</div>
            <div className="vp-pr-logs">
              <div className="vp-pr-log-row ok">
                <span className="vp-pr-log-dot" />
                <span>09:12:04 - Tab focus active</span>
              </div>
              <div className="vp-pr-log-row ok">
                <span className="vp-pr-log-dot" />
                <span>09:14:30 - Clipboard paste block</span>
              </div>
              <div className="vp-pr-log-row warn">
                <span className="vp-pr-log-dot" />
                <span>09:15:12 - Tab change detected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (type === "codevault") {
    return (
      <div className="vp-codevault">
        <div className="vp-cv-header">
          <span className="vp-cv-title">Active Repositories</span>
          <button className="btn-cv-sync">
            <Sparkles size={11} />
            <span>Sync GitHub</span>
          </button>
        </div>
        <div className="vp-cv-files">
          {[
            { path: "algorithms/dijkstra.py", size: "2.4KB", date: "2 hrs ago", commit: "Optimize heap queue" },
            { path: "algorithms/lru_cache.js", size: "1.8KB", date: "Yesterday", commit: "Add eviction test cases" },
            { path: "structures/red_black_tree.go", size: "5.1KB", date: "3 days ago", commit: "Initial balanced tree" },
          ].map((f, i) => (
            <div key={i} className="vp-cv-row">
              <div className="vp-cv-file-info">
                <span className="vp-cv-file-icon">📄</span>
                <div className="vp-cv-file-details">
                  <span className="vp-cv-file-path">{f.path}</span>
                  <span className="vp-cv-file-commit">{f.commit}</span>
                </div>
              </div>
              <span className="vp-cv-file-size">{f.size}</span>
              <span className="vp-cv-file-date">{f.date}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === "factions") {
    return (
      <div className="vp-factions-mod">
        <div className="vp-fact-header">
          <span>Active Faction Scoreboard</span>
          <span className="vp-fact-season">Season 4</span>
        </div>
        <div className="vp-fact-list">
          {[
            { name: "Iron Wolves", color: "#ef4444", xp: "84.2K XP", pct: 85, rank: 1, avatar: "🐺" },
            { name: "Code Phoenix", color: "#8b5cf6", xp: "71.8K XP", pct: 72, rank: 2, avatar: "🦅" },
            { name: "Silent Hash", color: "#06b6d4", xp: "68.1K XP", pct: 68, rank: 3, avatar: "🐍" },
          ].map((faction, i) => (
            <div key={faction.name} className="vp-fact-row">
              <div className="vp-fact-row-header">
                <div className="vp-fact-name-block">
                  <span className="vp-fact-rank">#{faction.rank}</span>
                  <span className="vp-fact-row-avatar">{faction.avatar}</span>
                  <span className="vp-fact-name">{faction.name}</span>
                </div>
                <span className="vp-fact-xp">{faction.xp}</span>
              </div>
              <div className="vp-fact-bar-outer">
                <div className="vp-fact-bar-inner" style={{ width: `${faction.pct}%`, background: faction.color }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return null;
}

/* ────────────────────────────────────────────────────────────
   MODULES SECTION
   ──────────────────────────────────────────────────────────── */
function ModulesSection() {
  const [activeIdx, setActiveIdx] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const activeMod = MODULES_DATA[activeIdx];

  return (
    <section className="modules-section" id="modules" ref={ref}>
      <div className="modules-inner">
        <motion.div
          className="modules-header"
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5 }}
        >
          <span className="section-pill">Platform Ecosystem</span>
          <h2 className="section-h2">Core Platform Modules</h2>
          <p className="section-sub">
            BrightCode is an integrated ecosystem designed to support your growth from casual coder to competitive champion.
          </p>
        </motion.div>

        <div className="modules-grid">
          {/* Left: Module list selectors */}
          <div className="modules-list">
            {MODULES_DATA.map((mod, idx) => {
              const Icon = mod.icon;
              const isActive = idx === activeIdx;
              return (
                <motion.div
                  key={mod.id}
                  className={`module-tab-card ${isActive ? `active-${mod.color}` : ""}`}
                  onClick={() => setActiveIdx(idx)}
                  whileHover={{ x: isActive ? 0 : 4 }}
                  transition={{ duration: 0.15 }}
                >
                  <div className={`module-tab-icon ${mod.color}`}>
                    <Icon size={18} />
                  </div>
                  <div className="module-tab-info">
                    <h4 className="module-tab-title">{mod.title}</h4>
                    <span className="module-tab-sub">{mod.subtitle}</span>
                  </div>
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className={`module-tab-indicator ${mod.color}`}
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Right: Rich Interactive Visual Preview */}
          <div className="module-preview-panel">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeMod.id}
                className="mock-frame"
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {/* Header bar of the mock screen */}
                <div className="mock-header">
                  <div className="mock-dots">
                    <span className="mock-dot red" />
                    <span className="mock-dot yellow" />
                    <span className="mock-dot green" />
                  </div>
                  <span className="mock-url">{`brightcode.io/hub/${activeMod.id}`}</span>
                  <div className={`mock-status-chip ${activeMod.color}`}>
                    <span className="mock-status-dot" />
                    <span>Active Module</span>
                  </div>
                </div>

                {/* Body of the mock screen */}
                <div className="mock-body">
                  <div className="mock-body-inner">
                    <div className="mock-desc-section">
                      <h3 className="mock-title">{activeMod.title}</h3>
                      <p className="mock-desc">{activeMod.desc}</p>
                      
                      <div className="mock-perks-row">
                        {activeMod.perks.map((perk, pi) => (
                          <div key={pi} className="mock-perk-item">
                            <Check size={12} className={`color-${activeMod.color}`} />
                            <span>{perk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="mock-visual-viewport">
                      <ModuleVisualPreview type={activeMod.previewType} color={activeMod.color} />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   ROOT
   ──────────────────────────────────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/leaderboard`)
      .then(r => r.json())
      .then(d => { setLeaderboard(Array.isArray(d) ? d.slice(0, 5) : []); setLbLoading(false); })
      .catch(() => setLbLoading(false));
  }, []);

  const handleAuth = mode => navigate("/auth", { state: { mode } });
  const handleHub  = () => navigate("/hub");

  return (
    <div className="lp-root">
      <Nav handleAuth={handleAuth} />
      <HeroSection handleAuth={handleAuth} handleHub={handleHub} />
      <Ticker />
      <BentoFeatures />
      <HowItWorks />
      <ModulesSection />
      <LeaderboardSection data={leaderboard} loading={lbLoading} handleAuth={handleAuth} />
      <CTASection handleAuth={handleAuth} handleHub={handleHub} />
      <Footer />
    </div>
  );
}