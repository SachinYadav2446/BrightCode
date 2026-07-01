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
import "../components/Navbar.css";
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
  const [hoveredLink, setHoveredLink] = useState(null);
  const [activeLink, setActiveLink] = useState("features");

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      const sections = ["features", "modules", "arena"];
      const scrollPos = window.scrollY + 200;

      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveLink(sec);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <nav className={`floating-nav ${scrolled ? "scrolled" : ""}`}>
        <div className="nav-container">
          {/* LEFT: Logo */}
          <div className="nav-left">
            <a className="lnav-logo" href="#" onClick={e => e.preventDefault()}>
              <CodeBrightLogo size="small" />
            </a>
          </div>

          {/* CENTER: Nav links (styled identically to Home/Library/etc but pointing to Landing hashes) */}
          <div className="nav-center">
            {["Features", "Modules", "Arena"].map(l => {
              const id = l.toLowerCase();
              const isActive = activeLink === id;
              return (
                <a
                  key={l}
                  href={`#${id}`}
                  className={`nav-link-hover ${isActive ? "active" : ""}`}
                  onClick={() => setActiveLink(id)}
                >
                  {l}
                </a>
              );
            })}
          </div>

          {/* RIGHT: Actions / CTAs */}
          <div className="nav-right">
            <button 
              className="nav-link-hover" 
              onClick={() => handleAuth("login")}
              style={{ background: "none", border: "none", cursor: "pointer", marginRight: "4px" }}
            >
              Sign In
            </button>
            <button className="shiny-btn" onClick={() => handleAuth("register")}>
              Get Started
            </button>

            {/* Mobile Hamburger toggle */}
            <button
              className="nav-mobile-toggle"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu dropdown drawer */}
        {open && (
          <div className="nav-mobile-menu">
            {["Features", "Workflow", "Modules", "Arena"].map(l => {
              const id = l.toLowerCase();
              const isActive = activeLink === id;
              return (
                <a
                  key={l}
                  href={`#${id}`}
                  className={`nav-mobile-link ${isActive ? "active" : ""}`}
                  onClick={() => { setOpen(false); setActiveLink(id); }}
                >
                  {l}
                </a>
              );
            })}
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", padding: "0 16px" }}>
              <button 
                className="nav-mobile-link" 
                onClick={() => { handleAuth("login"); setOpen(false); }}
                style={{ flex: 1, justifyContent: "center", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer" }}
              >
                Sign In
              </button>
              <button 
                className="shiny-btn" 
                onClick={() => { handleAuth("register"); setOpen(false); }}
                style={{ flex: 1, justifyContent: "center" }}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}

/* ────────────────────────────────────────────────────────────
   HERO – BRIGHTCODE PIXEL DATA DRIFT CANVAS
──────────────────────────────────────────────────────────── */
function BrightCodeCanvas() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    const section = container.parentElement;

    let W = 0, H = 0;
    let particles = [];
    const lastMouse = { x: -9999, y: -9999 };
    let totalDist = 0;

    const DATA_TERMS = [
      "Python", "Rust", "Go", "TypeScript", "C++", "Java", "O(n)", "O(1)", "O(log n)",
      "30ms", "Live Battle", "Factions", "CodeVault", "Proctor AI", "Allies", "1024 XP",
      "{ }", "[ ]", "=>", "solve()", "compile", "heap", "stack", "BST", "DP", "Graph",
      "✓ pass", "Apprentice", "Grandmaster", "Elo +24", "Streak x5", "Sentinel"
    ];

    const COLORS = [
      '#ef4444', '#f87171', '#fbbf24', '#f59e0b', '#fb923c', '#a8a29e', '#cbd5e1'
    ];

    function init() {
      const rect = container.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      particles = [];
    }

    function spawnParticle(mx, my) {
      const text = DATA_TERMS[Math.floor(Math.random() * DATA_TERMS.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      ctx.font = '10px monospace';
      const textW = ctx.measureText(text).width;
      
      particles.push({
        x: mx - textW / 2 - 8,
        y: my - 10,
        w: textW + 16,
        h: 20,
        text: text,
        color: color,
        vx: (Math.random() - 0.5) * 0.8,
        vy: -0.5 - Math.random() * 0.8,
        alpha: 1.0,
        scale: 0.9 + Math.random() * 0.2,
        life: 1.0,
        decay: 0.008 + Math.random() * 0.008
      });
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      particles.forEach((p, idx) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        p.alpha = p.life;

        if (p.life <= 0) {
          particles.splice(idx, 1);
          return;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x + p.w / 2, p.y + p.h / 2);
        ctx.scale(p.scale, p.scale);
        ctx.translate(-p.w / 2, -p.h / 2);

        // Glassmorphic rounded bubble outline
        ctx.strokeStyle = p.color + '44'; // transparency
        ctx.lineWidth = 1;
        ctx.fillStyle = 'rgba(15, 15, 25, 0.4)';
        
        const rr = 6; // border radius
        ctx.beginPath();
        ctx.moveTo(rr, 0);
        ctx.lineTo(p.w - rr, 0);
        ctx.arcTo(p.w, 0, p.w, rr, rr);
        ctx.lineTo(p.w, p.h - rr);
        ctx.arcTo(p.w, p.h, p.w - rr, p.h, rr);
        ctx.lineTo(rr, p.h);
        ctx.arcTo(0, p.h, 0, p.h - rr, rr);
        ctx.lineTo(0, rr);
        ctx.arcTo(0, 0, rr, 0, rr);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Small indicator dot
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(8, p.h / 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Text label
        ctx.fillStyle = '#f4f4f5';
        ctx.font = '700 9px monospace';
        ctx.fillText(p.text, 15, p.h / 2 + 3);

        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(draw);
    }

    init();
    rafRef.current = requestAnimationFrame(draw);

    const onMove = e => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (lastMouse.x !== -9999) {
        const dist = Math.hypot(mx - lastMouse.x, my - lastMouse.y);
        totalDist += dist;
        if (totalDist > 24) {
          spawnParticle(mx, my);
          totalDist = 0;
        }
      }
      lastMouse.x = mx;
      lastMouse.y = my;
    };

    const onLeave = () => {
      lastMouse.x = -9999;
      lastMouse.y = -9999;
    };

    const onResize = () => { init(); };

    if (section) {
      section.addEventListener('mousemove', onMove);
      section.addEventListener('mouseleave', onLeave);
    }
    window.addEventListener('resize', onResize);

    return () => {
      if (section) {
        section.removeEventListener('mousemove', onMove);
        section.removeEventListener('mouseleave', onLeave);
      }
      window.removeEventListener('resize', onResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="brightcode-canvas-wrap">
      <canvas ref={canvasRef} className="brightcode-canvas" />
    </div>
  );
}



function HeroSection({ handleAuth, handleHub }) {
  return (
    <section className="hero-section" id="home">
      {/* Full-bg pixel reveal canvas */}
      <BrightCodeCanvas />

      {/* Gradient overlays */}
      <div className="hero-bg">
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-noise" />
      </div>

      <div className="hero-inner hero-inner-centered">
        <motion.div
          className="hero-left hero-left-centered"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <h1 className="hero-h1" style={{ textAlign: 'center', alignItems: 'center' }}>
            <span className="hero-h1-line">Code Harder.</span>
            <span className="hero-h1-line hero-h1-gradient">Compete Smarter.</span>
          </h1>

          <p className="hero-p" style={{ textAlign: 'center', maxWidth: '540px', margin: '0 auto 32px' }}>
            The ultimate competitive coding arena — real-time collaboration, AI-powered proctoring, faction wars &amp; more.
          </p>

          <div className="hero-actions" style={{ justifyContent: 'center' }}>
            <button className="btn-clay" onClick={() => handleAuth('register')}>
              Start Building for Free
            </button>
            <button className="btn-ghost-hero" onClick={handleHub}>
              <div className="btn-ghost-play"><Play size={14} fill="currentColor" /></div>
              Watch Demo
            </button>
          </div>

          <div className="hero-proof" style={{ justifyContent: 'center' }}>
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
              <span>{'<30ms'}</span>
              <span>Sync Speed</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Scroll hint */}
      <div className="hero-scroll-hint">
        <span />
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
    initial: { opacity: 0, y: 30, scale: 0.95 },
    animate: inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 30, scale: 0.95 },
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1], delay },
  });

  const cardsData = [
    {
      stat: "2,500+",
      label: "Algorithms & Quests",
      desc: "Spanning dynamic programming, graphs, machine learning, and systems design.",
      type: "image",
      src: "/developers_coding.png",
      alt: "Developers coding",
      accent: "rust"
    },
    {
      stat: "99.8%",
      label: "Assessment Integrity",
      desc: "Trusted worldwide via screen tracking, AI behavior checks, and tab monitoring.",
      type: "ui-proctor",
      accent: "cream"
    },
    {
      stat: "15+",
      label: "Supported Languages",
      desc: "Fully optimized environment with auto-completion and instant runtimes.",
      type: "ui-lang",
      accent: "gold"
    },
    {
      stat: "48K+",
      label: "Global Engineers",
      desc: "Collaborating, competing, scaling leaderboards, and building factions daily.",
      type: "image",
      src: "/global_community.png",
      alt: "Global community",
      accent: "sage"
    },
    {
      stat: "$10K+",
      label: "Weekly Battle Prizes",
      desc: "Won by developers in real-time speed coding arenas and faction tournaments.",
      type: "image",
      src: "/hackathon_team.png",
      alt: "Hackathon tournament",
      accent: "red"
    }
  ];

  return (
    <section className="bento-section" id="features" ref={ref}>
      <div className="bento-section-header">
        <motion.div {...cardAnim(0)}>
          <span className="section-pill">Platform Stats</span>
          <h2 className="section-h2">Everything You Need to Dominate</h2>
          <p className="section-sub">Empowering top-tier engineers to level up and verify their true skills.</p>
        </motion.div>
      </div>

      <div className="vertical-bento-row">
        {cardsData.map((card, i) => (
          <motion.div 
            key={i} 
            {...cardAnim(i * 0.08)} 
            className={`vert-bento-card accent-${card.accent}`}
          >
            <div className="vert-bcard-top">
              <span className="vert-bcard-stat">{card.stat}</span>
              <h3 className="vert-bcard-title">{card.label}</h3>
              <p className="vert-bcard-desc">{card.desc}</p>
            </div>
            
            <div className="vert-bcard-visual">
              {card.type === "image" && (
                <img src={card.src} alt={card.alt} className="vert-bcard-img" />
              )}
              
              {card.type === "ui-lang" && (
                <div className="vert-ui-lang-wrap">
                  <div className="vert-lang-chips">
                    {["Python", "JS", "Go", "Rust", "C++", "Java"].map((l, idx) => (
                      <span key={l} className={`vert-lang-chip ${idx === 0 ? "active" : ""}`}>
                        {l}
                      </span>
                    ))}
                  </div>
                  <div className="vert-mini-console">
                    <span className="c-green">✓</span> solve(nums) <span className="c-gray">in 4ms</span>
                  </div>
                </div>
              )}
              
              {card.type === "ui-proctor" && (
                <div className="vert-ui-proctor-wrap">
                  <div className="vert-proctor-circle">
                    <svg viewBox="0 0 36 36" className="vert-circular-chart">
                      <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                      <path className="circle-fg" strokeDasharray="98, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                    </svg>
                    <div className="vert-percentage">98%</div>
                  </div>
                  <div className="vert-proctor-tag">AI SECURE</div>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   ALUMNI & PARTNERS BAND (Redesigned Light Theme Stack Marquee)
──────────────────────────────────────────────────────────── */
function AlumniNetwork() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const row1Logos = [
    { name: "Python", color: "#3776AB", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.25.18c.9 0 1.66.72 1.66 1.62v2.22h-1.66V2.36c0-.52-.39-.93-.89-.93h-4.3c-.5 0-.89.41-.89.93v2.04h1.7v1.72h-1.7V9c0 .52.39.93.89.93h4.3c.5 0 .89-.41.89-.93V6.78h1.66v2.22c0 .9-.76 1.62-1.66 1.62H9.95c-.9 0-1.66-.72-1.66-1.62V6.16H6.63V4.44h1.66V1.8c0-.9.76-1.62 1.66-1.62h4.3z"/></svg>` },
    { name: "JavaScript", color: "#d97706", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0V0zm20 17.8c-.8.5-1.8.8-2.9.8-2.2 0-3.4-1.2-3.4-3.4h2.4c0 .9.5 1.4 1.2 1.4.6 0 1-.3 1-.8 0-.5-.3-.7-.9-1l-.9-.4c-1.6-.7-2.4-1.5-2.4-3.2 0-2 1.5-3.2 3.4-3.2 1.2 0 2.2.4 2.8.9l-.7 1.8c-.5-.4-1.2-.7-2-.7-.7 0-1.1.4-1.1.9 0 .5.3.7.9.9l.7.3c1.9.8 2.6 1.7 2.6 3.4 0 2.1-1.4 3.4-3.4 3.4zm-7.6 0c-.8.5-1.8.8-2.9.8-2.2 0-3.4-1.2-3.4-3.4h2.4c0 .9.5 1.4 1.2 1.4.6 0 1-.3 1-.8v-7H13v10.1c0 1.2 0 2.1-.3 2.1z"/></svg>` },
    { name: "TypeScript", color: "#3178C6", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M0 0h24v24H0V0zm20 17.8c-.8.5-1.8.8-2.9.8-2.2 0-3.4-1.2-3.4-3.4h2.4c0 .9.5 1.4 1.2 1.4.6 0 1-.3 1-.8 0-.5-.3-.7-.9-1l-.9-.4c-1.6-.7-2.4-1.5-2.4-3.2 0-2 1.5-3.2 3.4-3.2 1.2 0 2.2.4 2.8.9l-.7 1.8c-.5-.4-1.2-.7-2-.7-.7 0-1.1.4-1.1.9 0 .5.3.7.9.9l.7.3c1.9.8 2.6 1.7 2.6 3.4 0 2.1-1.4 3.4-3.4 3.4zM9 8h6v2h-2v8H9v-8H7V8z"/></svg>` },
    { name: "Go", color: "#00ADD8", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.5 10.5C2.5 6.4 5.9 3 10 3c3.6 0 6.6 2.5 7.3 5.9h-3.1C13.6 7.2 12 6 10 6c-2.5 0-4.5 2-4.5 4.5S7.5 15 10 15c2 0 3.6-1.2 4.2-2.9h-4.2V9.6h7.3v8c-1.3 2-3.6 3.4-6.3 3.4-4.1 0-7.5-3.4-7.5-7.5zm19 1.5v-2h-3v2h3zm0 4v-2h-3v2h3zm0-8V6h-3v2h3z"/></svg>` },
    { name: "Rust", color: "#E05F25", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>` },
    { name: "C++", color: "#00599C", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M9.5 5.5c-3.6 0-6.5 2.9-6.5 6.5s2.9 6.5 6.5 6.5c2.7 0 5-1.6 6-4H12.4c-.6.8-1.7 1.4-2.9 1.4-2 0-3.6-1.6-3.6-3.6s1.6-3.6 3.6-3.6c1.2 0 2.3.6 2.9 1.4H15.5c-1-2.4-3.3-4-6-4zm9.5 4.5h-1.5v2H16v1.5h1.5v2H19v-1.5h2V12h-2V10zm-4.5 4.5H13v2h-1.5v1.5h1.5v2H14.5v-1.5h2v-1.5h-2v-2z"/></svg>` },
    { name: "Java", color: "#E76F00", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M2 19h16v2H2v-2zm14-11V6c0-2.2-1.8-4-4-4s-4 1.8-4 4v2h8zm-6 0V6c0-1.1.9-2 2-2s2 .9 2 2v2h-4zm11 1.5c-1.1 0-2 .9-2 2V12c0 2.2-1.8 4-4 4H5c-1.7 0-3-1.3-3-3v-1c0-.6.4-1 1-1s1 .4 1 1v1c0 .6.4 1 1 1h8c1.1 0 2-.9 2-2v-1.5c0-1.1.9-2 2-2s2 .9 2 2V12c0 .6-.4 1-1 1s-1-.4-1-1v-2.5c0-.6-.4-1-1-1z"/></svg>` },
    { name: "React", color: "#0891b2", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 8.5c-.8 0-1.5.7-1.5 1.5s.7 1.5 1.5 1.5 1.5-.7 1.5-1.5-.7-1.5-1.5-1.5zm6.7 1.5c0 .3-.1.6-.3.9-.9 1.4-2.8 2.7-4.9 3.5-.3.1-.7.2-1 .3-.3-.1-.7-.2-1-.3-2.1-.8-4-2.1-4.9-3.5-.2-.3-.3-.6-.3-.9s.1-.6.3-.9c.9-1.4 2.8-2.7 4.9-3.5.3-.1.7-.2 1-.3.3.1.7.2 1 .3 2.1.8 4 2.1 4.9 3.5.2.3.3.6.3.9z"/></svg>` },
  ];

  const row2Logos = [
    { name: "HTML5", color: "#E34F26", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.9 21.2L12 24l-8.6-2.8L1.5 0zm15.4 6H7.1l.3 3h9.1l-.3 3.3-4.2 1.2-4.2-1.2-.3-2.6H4.7l.5 5.3 6.8 1.9 6.8-1.9.8-8.7.3-3z"/></svg>` },
    { name: "CSS3", color: "#1572B6", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 0h21l-1.9 21.2L12 24l-8.6-2.8L1.5 0zm15.8 5.7H6.7l.6 5.4h9.1c0 2-.6 4-2.4 4.5L12 16.2l-2-1c-.8-.4-1.2-1-1.3-1.8H5.9c.1 1.7 1.1 3 2.7 3.8l3.4 1.7 3.4-1.7c2.4-1.2 3.2-3.3 3.1-6.1l-.6-5.4z"/></svg>` },
    { name: "Node.js", color: "#16a34a", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 6.5v9l8 4.5 8-4.5v-9L12 2zm6 12.7l-6 3.3-6-3.3v-6.5l6-3.3 6 3.3v6.5z"/></svg>` },
    { name: "PostgreSQL", color: "#3178C6", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm1 14h-2v-4h-3V9h5v7z"/></svg>` },
    { name: "Docker", color: "#2496ED", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.983 8.871h-1.996v1.996h1.996V8.871zM11.61 8.871H9.614v1.996H11.61V8.871zm-2.372 0h-1.996v1.996h1.996V8.871zM-2.372 0H4.87v1.996h1.996v-1.996zM13.983 6.499h-1.996v1.996h1.996V6.499zm-2.372 0H9.614v1.996H11.61V6.499zm-2.372 0h-1.996v1.996h1.996V6.499zm4.744-2.372h-1.996v1.996h1.996V4.127zM24 12.5c-.3 0-1.6 0-3 1.2-1.2-1-3-1-3.2-1-.2 0-.4-.1-.5-.3-.3-.4-1.2-2.1-3.4-2.1h-.2v2.4h-.2c-3.2 0-5.8 2.6-5.8 5.8 0 .2 0 .4.1.5-.1.1-.3.2-.5.2H.1v1.6h5.8c.8 0 1.5-.5 1.8-1.2.6.4 1.4.7 2.2.7h1.4c3.8 0 7-3 7.2-6.8 1.4-1.1 2.8-.7 3.2-.5.8.3 1.5.3 2.1 0 .2 0 .2-.1.2-.2v-1.6z"/></svg>` },
    { name: "MongoDB", color: "#15803d", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 1.5C9.2 4.4 7.6 7.6 7.6 11.2c0 4 2.2 6.8 4.4 9.3 2.2-2.5 4.4-5.3 4.4-9.3 0-3.6-1.6-6.8-4.4-9.7zm-.6 15.3v-4.5c0-.6.4-1 1-1s1 .4 1 1v4.5c0 .6-.4 1-1 1s-1-.4-1-1z"/></svg>` },
    { name: "SQL", color: "#0284c7", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c5.52 0 10 2.24 10 5s-4.48 5-10 5-10-2.24-10-5 4.48-5 10-5zm0 14c-5.52 0-10-2.24-10-5v3c0 2.76 4.48 5 10 5s10-2.24 10-5v-3c0 2.76-4.48 5-10 5z"/></svg>` },
    { name: "Ruby", color: "#CC342D", svg: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7.2 2l-5.2 6 10 14 10-14-5.2-6H7.2zm4.8 12.3L6.3 8.1l5.7-4 5.7 4-5.7 6.2z"/></svg>` },
  ];

  return (
    <section className="alumni-section" ref={ref}>
      <div className="alumni-container">
        
        {/* UPPER ROW: Header + 3D-style code tag bracket symbol */}
        <div className="alumni-header-row">
          <div className="alumni-header-left">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5 }}
              className="alumni-h2"
            >
              15+ Supported Languages. Compile and Run. <br />
              <span className="alumni-highlight-text">Compatible with Your Tech Stack.</span>
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="alumni-p"
            >
              Whether you write high-performance systems in Rust and C++ or build responsive web platforms, 
              BrightCode compiles, runs, and evaluates your code instantly with less than 30ms latency. No local environment configuration required.
            </motion.p>
          </div>
          
          <div className="alumni-header-right">
            <div className="currency-3d-wrap">
              <div className="gold-currency-symbol" style={{ fontSize: "4.5rem" }}>&lt;/&gt;</div>
              <div className="gold-currency-reflection" />
            </div>
          </div>
        </div>

        {/* LOWER ROW: Two infinite sliding marquee strips */}
        <div className="alumni-marquees-wrap">
          {/* Row 1: Left to Right */}
          <div className="alumni-marquee-row">
            <div className="marquee-track">
              {[...row1Logos, ...row1Logos, ...row1Logos].map((logo, idx) => (
                <div 
                  key={`r1-${idx}`} 
                  className="logo-strip-item" 
                  title={logo.name}
                  style={{ "--brand-color": logo.color, "--brand-glow": logo.color + "28" }}
                >
                  <div className="logo-svg-wrap" style={{ color: logo.color }} dangerouslySetInnerHTML={{ __html: logo.svg }} />
                  <span className="logo-name">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Row 2: Right to Left */}
          <div className="alumni-marquee-row">
            <div className="marquee-track reverse">
              {[...row2Logos, ...row2Logos, ...row2Logos].map((logo, idx) => (
                <div 
                  key={`r2-${idx}`} 
                  className="logo-strip-item" 
                  title={logo.name}
                  style={{ "--brand-color": logo.color, "--brand-glow": logo.color + "28" }}
                >
                  <div className="logo-svg-wrap" style={{ color: logo.color }} dangerouslySetInnerHTML={{ __html: logo.svg }} />
                  <span className="logo-name">{logo.name}</span>
                </div>
              ))}
            </div>
          </div>
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
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let W = canvas.offsetWidth;
    let H = canvas.offsetHeight;

    const handleResize = () => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      W = rect.width;
      H = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const SYMBOLS = ["{", "}", "<", ">", "0", "1", "[]", "++", "code", "=>", "*", "sys"];
    const particles = [];

    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        vy: -0.2 - Math.random() * 0.4,
        vx: (Math.random() - 0.5) * 0.2,
        char: SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)],
        fontSize: 7 + Math.random() * 6,
        alpha: Math.random() * 0.3 + 0.1,
        waveSpeed: 0.01 + Math.random() * 0.02,
        waveAmp: 0.1 + Math.random() * 0.3,
        phase: Math.random() * Math.PI * 2
      });
    }

    function render() {
      ctx.clearRect(0, 0, W, H);

      particles.forEach(p => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(p.phase) * p.waveAmp;
        p.phase += p.waveSpeed;

        let currentAlpha = p.alpha;
        if (p.y < H * 0.4) {
          currentAlpha = p.alpha * (p.y / (H * 0.4));
        }

        ctx.fillStyle = `rgba(239, 68, 68, ${Math.max(0, currentAlpha)})`;
        ctx.font = `600 ${p.fontSize}px monospace`;
        ctx.fillText(p.char, p.x, p.y);

        if (p.y < 0 || p.x < 0 || p.x > W) {
          p.y = H + 10;
          p.x = Math.random() * W;
          p.alpha = Math.random() * 0.3 + 0.1;
        }
      });

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <footer className="lp-footer" style={{ position: "relative", overflow: "hidden" }}>
      <canvas ref={canvasRef} className="footer-canvas" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.5 }} />
      <div className="lp-footer-inner" style={{ position: "relative", zIndex: 1 }}>
        <div className="footer-brand">
          <div className="footer-logo">
            <Code2 size={20} />
            <span>BRIGHT<b>CODE</b></span>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 BrightCode</span>
        </div>
        <div className="footer-social">
          <a href="https://github.com/SachinYadav2446" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="GitHub">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
          <a href="https://www.linkedin.com/in/sachin-yadav-54646a322/" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="LinkedIn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
            </svg>
          </a>
          <a href="https://x.com/BINARYSPHERE45" target="_blank" rel="noopener noreferrer" className="footer-social-link" title="Twitter / X">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          </a>
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
   MODULES ECOSYSTEM COLLAGE SECTION
──────────────────────────────────────────────────────────── */
function ModulesSection() {
  const [activeTab, setActiveTab] = useState("code");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const tabs = [
    { id: "code", label: "Code & Arcade" },
    { id: "workspace", label: "Workspace & Themes" },
    { id: "vault", label: "CodeVault & Feed" },
    { id: "allies", label: "Allies & Profiles" },
    { id: "leaderboard", label: "Leaderboards & Factions" }
  ];

  const cardAnim = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: inView ? { opacity: 1, y: 0 } : {},
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1], delay }
  });

  return (
    <section className="collage-section" id="modules" ref={ref}>
      <div className="modules-header">
        <motion.div {...cardAnim(0)}>
          <span className="section-pill">Platform Ecosystem</span>
          <h2 className="section-h2">Core Platform Modules</h2>
          <p className="section-sub">
            BrightCode is an integrated ecosystem designed to support your growth from casual coder to competitive champion.
          </p>
        </motion.div>
      </div>

      {/* Tabs matching the screenshot (orange/gold active background) */}
      <div className="collage-tabs">
        {tabs.map((tab, idx) => (
          <button
            key={tab.id}
            className={`collage-tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Collage Grid Layout below the tabs */}
      <div className="collage-grid">
        
        {/* LEFT COLUMN: 2 Stacked Horizontal Cards */}
        <div className="collage-col">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${activeTab}-l1`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="collage-card short"
            >
              {activeTab === "code" && (
                <div className="c-card-content">
                  <div className="c-card-badge red">STREAKS</div>
                  <div className="c-streak-val">🔥 5 Days</div>
                  <p className="c-card-p">Maintain your daily multiplier and gain bonus XP on quests.</p>
                </div>
              )}
              {activeTab === "workspace" && (
                <div className="c-card-content">
                  <div className="c-card-badge green">AUDIO</div>
                  <div className="c-voice-status">🎙 Voice Connected</div>
                  <p className="c-card-p">Low-latency audio channel synced with editor sessions.</p>
                </div>
              )}
              {activeTab === "vault" && (
                <div className="c-card-content">
                  <div className="c-card-badge gold">GITHUB</div>
                  <div className="c-git-status">🟢 Auto-Sync Active</div>
                  <p className="c-card-p">Your solved solutions sync automatically to GitHub repositories.</p>
                </div>
              )}
              {activeTab === "allies" && (
                <div className="c-card-content">
                  <div className="c-card-badge red">ALLIES</div>
                  <div className="c-allies-status">👥 8 Friends Online</div>
                  <p className="c-card-p">Connect, compare stats, and send instant room invitations.</p>
                </div>
              )}
              {activeTab === "leaderboard" && (
                <div className="c-card-content">
                  <div className="c-card-badge gold">GUILDS</div>
                  <div className="c-wars-status">⚔ Season 4 Wars</div>
                  <p className="c-card-p">Compete in weekly clan wars to secure ranking territory.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div 
              key={`${activeTab}-l2`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="collage-card short"
            >
              {activeTab === "code" && (
                <div className="c-card-content">
                  <div className="c-card-badge gold">TOPICS</div>
                  <div className="c-topic-chips">
                    {["Graph", "Dynamic Prog", "Trees", "Sorting"].map(t => (
                      <span key={t} className="c-chip">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "workspace" && (
                <div className="c-card-content">
                  <div className="c-card-badge orange">CONFIG</div>
                  <div className="c-config-chips">
                    {["Vim Keybindings", "Font: Monospace", "Tab Size: 4"].map(t => (
                      <span key={t} className="c-chip">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "vault" && (
                <div className="c-card-content">
                  <div className="c-card-badge">CATEGORIES</div>
                  <div className="c-vault-tags">
                    {["Algorithms", "Solved", "Favorites", "SQL"].map(t => (
                      <span key={t} className="c-chip">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "allies" && (
                <div className="c-card-content">
                  <div className="c-card-badge green">INVITE</div>
                  <div className="c-invite-code">CODE: <code>BRIGHT-CO-OP</code></div>
                  <p className="c-card-p">Share invitation codes to start direct battles.</p>
                </div>
              )}
              {activeTab === "leaderboard" && (
                <div className="c-card-content">
                  <div className="c-card-badge red">ELO</div>
                  <div className="c-elo-display">🏆 Grandmaster (2,400 Elo)</div>
                  <p className="c-card-p">Top 0.8% of global competitive coding matches.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* CENTER COLUMN: 1 Tall Vertical Card (Main UI Collage Mockup) */}
        <div className="collage-col">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${activeTab}-center`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="collage-card tall"
            >
              {activeTab === "code" && (
                <div className="mock-editor-layout">
                  <div className="mock-editor-top">
                    <span className="me-file">📄 solve.py</span>
                    <span className="me-test-result green">✓ 47/47 passed</span>
                  </div>
                  <div className="mock-editor-body">
                    <code>
                      <span className="me-kw">def</span> <span className="me-fn">twoSum</span>(nums, target):<br />
                      &nbsp;&nbsp;seen = <span className="me-br">{"{}"}</span><br />
                      &nbsp;&nbsp;<span className="me-kw">for</span> i, n <span className="me-kw">in</span> <span className="me-fn">enumerate</span>(nums):<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;comp = target - n<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;<span className="me-kw">if</span> comp <span className="me-kw">in</span> seen:<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<span className="me-kw">return</span> [seen[comp], i]<br />
                      &nbsp;&nbsp;&nbsp;&nbsp;seen[n] = i
                    </code>
                  </div>
                  <div className="mock-editor-bottom">
                    <span className="me-stat-col">O(n) Time</span>
                    <span className="me-stat-col">98ms Speed</span>
                  </div>
                </div>
              )}
              {activeTab === "workspace" && (
                <div className="mock-collab-layout">
                  <div className="mock-editor-top">
                    <span className="me-file">👥 Room: #collab-392</span>
                    <span className="me-test-result">Latency: 24ms</span>
                  </div>
                  <div className="mock-collab-body">
                    <code>
                      <span className="me-kw">import</span> socket<br />
                      <span className="me-kw">def</span> <span className="me-fn">start_server</span>():<br />
                      &nbsp;&nbsp;s = socket.socket()<br />
                      &nbsp;&nbsp;<span className="cursor-indicator gold-bg">algo_queen typing…</span><br />
                      &nbsp;&nbsp;s.bind((<span className="me-str">"localhost"</span>, 8080))<br />
                      &nbsp;&nbsp;<span className="cursor-indicator red-bg">You editing…</span><br />
                      &nbsp;&nbsp;s.listen()
                    </code>
                  </div>
                </div>
              )}
              {activeTab === "vault" && (
                <div className="mock-feed-layout">
                  <div className="mock-feed-top">
                    <span>CodeFeed Activity</span>
                  </div>
                  <div className="mock-feed-post">
                    <div className="me-post-header">
                      <span className="me-post-avatar">S</span>
                      <div className="me-post-user">
                        <span className="me-username">Sachin</span>
                        <span className="me-post-time">2 mins ago</span>
                      </div>
                    </div>
                    <p className="me-post-text">Just solved Median of Two Sorted Arrays in Rust! Dynamic programming is awesome 🚀</p>
                    <div className="me-post-stats">
                      <span>👍 14 Likes</span>
                      <span>💬 3 Comments</span>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "allies" && (
                <div className="mock-profile-layout">
                  <div className="mock-profile-avatar-wrap">
                    <div className="mock-profile-avatar">S</div>
                    <div className="mock-profile-name">
                      <span className="me-username">Sachin</span>
                      <span className="me-rank-tier">Grandmaster Elite</span>
                    </div>
                  </div>
                  <div className="mock-profile-stats">
                    <div className="me-stat-box">
                      <span className="me-stat-label">Total XP</span>
                      <span className="me-stat-val">84,200 XP</span>
                    </div>
                    <div className="me-stat-box">
                      <span className="me-stat-label">Levels Solved</span>
                      <span className="me-stat-val">142</span>
                    </div>
                  </div>
                </div>
              )}
              {activeTab === "leaderboard" && (
                <div className="mock-factions-layout">
                  <div className="mock-factions-header">
                    <span>Faction Battle Arena</span>
                  </div>
                  <div className="mock-faction-comparison">
                    <div className="me-faction-col red-theme">
                      <span className="me-faction-icon">🐺</span>
                      <span className="me-faction-name">Iron Wolves</span>
                      <span className="me-faction-score">84.2K XP</span>
                    </div>
                    <div className="me-vs-text">VS</div>
                    <div className="me-faction-col gold-theme">
                      <span className="me-faction-icon">🦅</span>
                      <span className="me-faction-name">Code Phoenix</span>
                      <span className="me-faction-score">71.8K XP</span>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* RIGHT COLUMN: 2 Stacked Horizontal Cards */}
        <div className="collage-col">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${activeTab}-r1`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
              className="collage-card short"
            >
              {activeTab === "code" && (
                <div className="c-card-content">
                  <div className="c-card-badge gold">LEVEL</div>
                  <div className="c-rank-display">👑 Level 32</div>
                  <p className="c-card-p">Grandmaster rank unlocked with exclusive theme skins.</p>
                </div>
              )}
              {activeTab === "workspace" && (
                <div className="c-card-content">
                  <div className="c-card-badge red">THEMES</div>
                  <div className="c-theme-preview">
                    {["Midnight Red", "Cyber Gold", "Slate Grey"].map(t => (
                      <span key={t} className="c-chip">{t}</span>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "vault" && (
                <div className="c-card-content">
                  <div className="c-card-badge green">RESTORE</div>
                  <div className="c-restore-action">⏪ Rollback to v1.2</div>
                  <p className="c-card-p">Roll back to any previous working commit checkpoint.</p>
                </div>
              )}
              {activeTab === "allies" && (
                <div className="c-card-content">
                  <div className="c-card-badge red">PENDING</div>
                  <div className="c-requests-status">📩 2 Allies Requests</div>
                  <p className="c-card-p">Approve or reject incoming invitations.</p>
                </div>
              )}
              {activeTab === "leaderboard" && (
                <div className="c-card-content">
                  <div className="c-card-badge orange">SOLO RANK</div>
                  <div className="c-solo-rank">⭐ Rank #42</div>
                  <p className="c-card-p">Out of 48,000 active developers worldwide.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div 
              key={`${activeTab}-r2`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3, delay: 0.05 }}
              className="collage-card short"
            >
              {activeTab === "code" && (
                <div className="c-card-content">
                  <div className="c-card-badge red">BADGES</div>
                  <div className="c-badges-status">🏆 Apprentice Champion</div>
                  <p className="c-card-p">Unlock more achievements in the quest lists.</p>
                </div>
              )}
              {activeTab === "workspace" && (
                <div className="c-card-content">
                  <div className="c-card-badge gold">LATENCY</div>
                  <div className="c-latency-status">⚡ 24ms Sync Delay</div>
                  <p className="c-card-p">Real-time collaboration across multiple editors.</p>
                </div>
              )}
              {activeTab === "vault" && (
                <div className="c-card-content">
                  <div className="c-card-badge red">HISTORY</div>
                  <div className="c-history-preview">
                    {["v1.0 (Init)", "v1.1 (HashMap)", "v1.2 (Solved)"].map(h => (
                      <span key={h} className="c-chip">{h}</span>
                    ))}
                  </div>
                </div>
              )}
              {activeTab === "allies" && (
                <div className="c-card-content">
                  <div className="c-card-badge">NOTIFICATIONS</div>
                  <div className="c-inbox-status">🔔 3 Unread Alerts</div>
                  <p className="c-card-p">Check comments on your shared vault scripts.</p>
                </div>
              )}
              {activeTab === "leaderboard" && (
                <div className="c-card-content">
                  <div className="c-card-badge red">MULTIPLIER</div>
                  <div className="c-mult-status">🔥 x1.5 active</div>
                  <p className="c-card-p">Earn extra Elo for consecutive arena victories.</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
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
      <AlumniNetwork />
      <ModulesSection />
      <LeaderboardSection data={leaderboard} loading={lbLoading} handleAuth={handleAuth} />
      <CTASection handleAuth={handleAuth} handleHub={handleHub} />
      <Footer />
    </div>
  );
}
