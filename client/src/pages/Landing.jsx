import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
  Brain, Trophy, Shield, GitBranch, Users, Terminal,
  Sparkles, Check, Play, CheckCircle, ArrowUpRight,
  Code2, Menu, X, Zap, Activity, Star, TrendingUp, Lock, Crown,
  User, Settings, ChevronRight
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

      // If at the very bottom of the page, automatically highlight the last section
      const isAtBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 80;
      if (isAtBottom) {
        setActiveLink("arena");
        return;
      }

      const sections = ["features", "modules", "arena"];
      for (const sec of sections) {
        const el = document.getElementById(sec);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveLink(sec);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Features", id: "features" },
    { label: "Modules", id: "modules" },
    { label: "Hall of Fame", id: "arena" }
  ];

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

          {/* CENTER: Nav links */}
          <div className="nav-center">
            {navLinks.map(link => {
              const isActive = activeLink === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`nav-link-hover ${isActive ? "active" : ""}`}
                  onClick={() => setActiveLink(link.id)}
                >
                  {link.label}
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
            {navLinks.map(link => {
              const isActive = activeLink === link.id;
              return (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  className={`nav-mobile-link ${isActive ? "active" : ""}`}
                  onClick={() => { setOpen(false); setActiveLink(link.id); }}
                >
                  {link.label}
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

    const COLORS = [
      '#ef4444', '#dc2626', '#b91c1c', '#ef4444'
    ];

    function init() {
      const rect = canvas.getBoundingClientRect();
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
      const text = "BrightCode";
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      
      particles.push({
        x: mx,
        y: my,
        text: text,
        color: color,
        alpha: 1.0,
        life: 1.0,
        decay: 0.04 // Fades out trail bubbles in ~25 frames
      });
    }

    function drawBubble(ctx, x, y, text, color, alpha, isMain) {
      ctx.save();
      ctx.globalAlpha = alpha;

      ctx.font = '700 13px monospace';
      const textW = ctx.measureText(text).width;
      const w = textW + 28;
      const h = 28;

      // Positioned close above the cursor tip, centered horizontally with canvas edge clamping
      const px = Math.max(4, Math.min(x - w / 2, W - w - 4));
      const py = Math.max(4, Math.min(y - h - 4, H - h - 4));

      ctx.translate(px + w / 2, py + h / 2);
      if (!isMain) {
        // scale down tail bubbles slightly to taper the trail
        ctx.scale(0.88, 0.88);
      }
      ctx.translate(-w / 2, -h / 2);

      // Bubble background and border outline
      ctx.strokeStyle = isMain ? 'rgba(255, 255, 255, 0.4)' : 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.fillStyle = isMain ? '#ef4444' : color;
      
      const rr = 6; // border radius
      ctx.beginPath();
      ctx.moveTo(rr, 0);
      ctx.lineTo(w - rr, 0);
      ctx.arcTo(w, 0, w, rr, rr);
      ctx.lineTo(w, h - rr);
      ctx.arcTo(w, h, w - rr, h, rr);
      ctx.lineTo(rr, h);
      ctx.arcTo(0, h, 0, h - rr, rr);
      ctx.lineTo(0, rr);
      ctx.arcTo(0, 0, rr, 0, rr);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Indicator dot
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(10, h / 2, 3, 0, Math.PI * 2);
      ctx.fill();

      // Text label
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 12px monospace';
      ctx.fillText(text, 18, h / 2 + 4.5);

      ctx.restore();
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      // 1. Draw and update trailing bubbles
      particles.forEach((p, idx) => {
        p.life -= p.decay;
        p.alpha = p.life;

        if (p.life <= 0) {
          particles.splice(idx, 1);
          return;
        }

        drawBubble(ctx, p.x, p.y, p.text, p.color, p.alpha, false);
      });

      // 2. Draw the main active bubble under the pointer (always on top)
      if (lastMouse.x !== -9999) {
        drawBubble(ctx, lastMouse.x, lastMouse.y, "BrightCode", "#ef4444", 1.0, true);
      }

      rafRef.current = requestAnimationFrame(draw);
    }

    init();
    rafRef.current = requestAnimationFrame(draw);

    const onMove = e => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      if (lastMouse.x !== -9999) {
        const dist = Math.hypot(mx - lastMouse.x, my - lastMouse.y);
        totalDist += dist;
        if (totalDist > 16) {
          spawnParticle(lastMouse.x, lastMouse.y);
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

          <div className="hero-actions" style={{ justifyContent: 'center', marginBottom: '56px' }}>
            <button className="btn-clay" onClick={() => handleAuth('register')}>
              Start Building for Free
            </button>
            <button className="btn-ghost-hero" onClick={handleHub}>
              <div className="btn-ghost-play"><Play size={14} fill="currentColor" /></div>
              Watch Demo
            </button>
          </div>

          {/* Interactive Platform Mockup Showcase */}
          <div className="hero-dashboard-preview">
            <div className="dashboard-window">
              <div className="window-header">
                <div className="window-dots">
                  <span className="window-dot red" />
                  <span className="window-dot yellow" />
                  <span className="window-dot green" />
                </div>
                <div className="window-title">brightcode.io/arena/1v1</div>
                <div className="window-actions-dummy" />
              </div>
              
              <div className="window-body">
                {/* Left Side: Code Editor Mock */}
                <div className="editor-mock">
                  <div className="editor-mock-header">
                    <span className="tab active">solution.rs</span>
                    <span className="tab">test_cases.json</span>
                  </div>
                  <div className="editor-mock-content">
                    <div className="code-line"><span className="keyword">fn</span> <span className="function">main</span>() &#123;</div>
                    <div className="code-line indent"><span className="keyword">let</span> <span className="variable">faction</span> = <span className="string">"CyberNova"</span>;</div>
                    <div className="code-line indent"><span className="keyword">let</span> <span className="variable">integrity</span> = <span className="number">100</span>;</div>
                    <div className="code-line indent"><span className="keyword">match</span> <span className="variable">compile_solution</span>() &#123;</div>
                    <div className="code-line indent-2"><span className="type">Ok</span>(<span className="variable">xp</span>) =&gt; <span className="macro">println!</span>(<span className="string">"Victory! +&#123;&#125; XP"</span>, <span className="variable">xp</span>),</div>
                    <div className="code-line indent-2"><span className="type">Err</span>(<span className="variable">e</span>) =&gt; <span className="macro">panic!</span>(<span className="string">"Refactor code"</span>),</div>
                    <div className="code-line indent">&#125;</div>
                    <div className="code-line">&#125;</div>
                  </div>
                </div>

                {/* Right Side: Arena Status Mock */}
                <div className="status-mock">
                  <div className="arena-header">
                    <span className="arena-badge">ARENA: SPEED DUEL</span>
                    <span className="arena-timer">01:42</span>
                  </div>

                  <div className="arena-players">
                    <div className="player-card">
                      <div className="player-info">
                        <span className="player-avatar red">CN</span>
                        <div className="player-meta">
                          <span className="player-name">User_Alpha</span>
                          <span className="player-faction">CyberNova</span>
                        </div>
                      </div>
                      <div className="player-status-line">
                        <span className="status-dot green" />
                        <span className="status-text">Tests: 5/5 Passed</span>
                      </div>
                    </div>

                    <div className="versus">VS</div>

                    <div className="player-card">
                      <div className="player-info">
                        <span className="player-avatar blue">BB</span>
                        <div className="player-meta">
                          <span className="player-name">User_Beta</span>
                          <span className="player-faction">BitBusters</span>
                        </div>
                      </div>
                      <div className="player-status-line">
                        <span className="status-dot yellow animate-pulse" />
                        <span className="status-text">Compiling solution...</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
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

function InteractivePlayground() {
  const [selectedChallenge, setSelectedChallenge] = useState(0);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [success, setSuccess] = useState(false);

  const challenges = [
    {
      name: "Reverse a String",
      fnName: "reverseString",
      desc: "Write a function that reverses the input string.",
      starter: `function reverseString(str) {\n  // Write your code here\n  return str.split("").reverse().join("");\n}`,
      tests: [
        { input: ["bright"], expected: "thgirb" },
        { input: ["code"], expected: "edoc" }
      ]
    },
    {
      name: "Is Palindrome",
      fnName: "isPalindrome",
      desc: "Return true if the string is a palindrome, false otherwise.",
      starter: `function isPalindrome(str) {\n  // Write your code here\n  const clean = str.toLowerCase().replace(/[^a-z0-9]/g, "");\n  return clean === clean.split("").reverse().join("");\n}`,
      tests: [
        { input: ["racecar"], expected: true },
        { input: ["hello"], expected: false }
      ]
    },
    {
      name: "FizzBuzz",
      fnName: "fizzBuzz",
      desc: "Return an array representing FizzBuzz from 1 to n.",
      starter: `function fizzBuzz(n) {\n  // Write your code here\n  let arr = [];\n  for (let i = 1; i <= n; i++) {\n    if (i % 3 === 0) arr.push("Fizz");\n    else if (i % 5 === 0) arr.push("Buzz");\n    else arr.push(i.toString());\n  }\n  return arr;\n}`,
      tests: [
        { input: [5], expected: ["1", "2", "Fizz", "4", "Buzz"] },
        { input: [3], expected: ["1", "2", "Fizz"] }
      ]
    }
  ];

  useEffect(() => {
    setCode(challenges[selectedChallenge].starter);
    setOutput([`// Output console ready for ${challenges[selectedChallenge].name}.`, `// Click 'Compile & Run' to check your code.`]);
    setSuccess(false);
  }, [selectedChallenge]);

  const handleRun = () => {
    setIsRunning(true);
    setSuccess(false);
    setOutput(["> Compiling solution...", "> Running test cases..."]);

    setTimeout(() => {
      try {
        const challenge = challenges[selectedChallenge];
        // Safely parse and run function
        const testCode = code + `\nreturn ${challenge.fnName};`;
        const userFn = new Function(testCode)();

        const logs = ["> Compiling solution... Done.", "> Running test cases..."];
        let allPassed = true;

        challenge.tests.forEach((test, idx) => {
          const result = userFn(...test.input);
          
          const isArr = Array.isArray(result) && Array.isArray(test.expected);
          const passed = isArr 
            ? JSON.stringify(result) === JSON.stringify(test.expected)
            : result === test.expected;

          if (passed) {
            logs.push(`✓ Test Case ${idx + 1}: ${challenge.fnName}(${JSON.stringify(test.input)}) -> ${JSON.stringify(result)} (Pass)`);
          } else {
            allPassed = false;
            logs.push(`✗ Test Case ${idx + 1} Failed: Expected ${JSON.stringify(test.expected)}, got ${JSON.stringify(result)}`);
          }
        });

        if (allPassed) {
          logs.push(`🎉 SUCCESS: All tests passed! +50 XP awarded.`);
          setSuccess(true);
        } else {
          logs.push(`✗ FAILED: Some test cases did not pass. Try again!`);
        }

        setOutput(logs);
      } catch (err) {
        setOutput([
          "> Compiling solution... Failed.",
          `✗ Runtime Error: ${err.message}`,
          "> Please check your syntax or function signature."
        ]);
      }
      setIsRunning(false);
    }, 750);
  };

  const lineCount = code.split("\n").length;
  const lineNumbers = Array.from({ length: Math.max(8, lineCount) }, (_, i) => i + 1);

  return (
    <section className="playground-section" id="playground">
      <div className="playground-header">
        <span className="section-pill">Playground</span>
        <h2 className="section-h2">Test Your Skills Instantly</h2>
        <p className="section-sub">Write Javascript code, compile, and validate test cases directly in the browser.</p>
      </div>

      <div className="playground-grid">
        {/* Editor Pod */}
        <div className="playground-editor-container">
          <div className="editor-header">
            <div className="editor-dots">
              <div className="editor-dot red" />
              <div className="editor-dot yellow" />
              <div className="editor-dot green" />
            </div>
            <div className="challenge-selector">
              {challenges.map((tab, idx) => (
                <button
                  key={tab.name}
                  className={`challenge-tab ${selectedChallenge === idx ? "active" : ""}`}
                  onClick={() => setSelectedChallenge(idx)}
                >
                  {tab.name}
                </button>
              ))}
            </div>
          </div>
          <div className="editor-body">
            <div className="editor-line-numbers">
              {lineNumbers.map(n => (
                <div key={n}>{n}</div>
              ))}
            </div>
            <textarea
              className="editor-textarea"
              value={code}
              onChange={e => setCode(e.target.value)}
              spellCheck="false"
            />
          </div>
        </div>

        {/* Console Pod */}
        <div className="playground-console-container">
          <div className="console-header">
            <div className="console-title" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Terminal size={14} />
              TEST RUNNER CONSOLE
            </div>
            <div className="console-status">
              <div className="console-pulse-dot" />
              ONLINE
            </div>
          </div>
          <div className="console-body">
            {output.map((log, idx) => {
              let logClass = "";
              if (log.startsWith("✓")) logClass = "green";
              else if (log.startsWith("✗") || log.startsWith("Error")) logClass = "red";
              else if (log.startsWith(">")) logClass = "yellow";
              return (
                <div key={idx} className={`console-log-item ${logClass}`}>
                  {log}
                </div>
              );
            })}
          </div>
          <div className="console-footer">
            <button
              className="btn-playground-run"
              onClick={handleRun}
              disabled={isRunning}
            >
              {isRunning ? "Compiling..." : "Compile & Run"}
            </button>
          </div>
        </div>
      </div>
    </section>
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
      stat: "1v1",
      label: "Live Code Wars Arena",
      desc: "Challenge top engineers to head-to-head speed-coding battles and climb the Elo ladder.",
      type: "ui-codewars",
    },
    {
      stat: "Active",
      label: "AI Proctor Arena",
      desc: "Run cheat-proof coding evaluations with tab activity logs, screen tracking, and copy-paste blocks.",
      type: "ui-proctor",
    },
    {
      stat: "900+",
      label: "Developer Arcade",
      desc: "Complete algorithm quests, solve learning tracks, and earn global XP rankings.",
      type: "ui-arcade",
    },
    {
      stat: "15+",
      label: "Supported Languages",
      desc: "Write, compile, and run code instantly in our high-performance collaborative web IDE.",
      type: "ui-lang",
    },
    {
      stat: "Guilds",
      label: "Developer Factions & Feed",
      desc: "Join programmer guilds, collaborate with alliances, and share solutions on the Code Feed.",
      type: "ui-factions",
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

      <div className="bento-grid-custom">
        {cardsData.map((card, i) => {
          const gridClass = i < 2 ? "bento-span-3" : "bento-span-2";
          return (
            <motion.div 
              key={i} 
              {...cardAnim(i * 0.08)} 
              className={`bento-card-custom ${gridClass}`}
            >
              <div className="vert-bcard-top">
                <span className="bento-card-stat">{card.stat}</span>
                <h3 className="vert-bcard-title">{card.label}</h3>
                <p className="vert-bcard-desc">{card.desc}</p>
              </div>
              
              <div className="bento-card-visual">
                {card.type === "ui-codewars" && (
                  <div className="visual-codewars">
                    <div className="cw-players">
                      <div className="cw-player">
                        <div className="cw-name">User_Alpha</div>
                        <div className="cw-hp-bar">
                          <div className="cw-hp-fill red" />
                        </div>
                      </div>
                      <div className="cw-vs">VS</div>
                      <div className="cw-player">
                        <div className="cw-name">User_Beta</div>
                        <div className="cw-hp-bar">
                          <div className="cw-hp-fill gray" />
                        </div>
                      </div>
                    </div>
                    <div className="cw-status">
                      <code>[STATUS] <span>7/10</span> test suites compiled successfully.</code>
                    </div>
                  </div>
                )}
                
                {card.type === "ui-proctor" && (
                  <div className="visual-proctor">
                    <div className="proctor-scanner">
                      <div className="proctor-ring" />
                      <div className="proctor-shield">
                        <Shield size={22} />
                      </div>
                    </div>
                    <div className="proctor-tags">
                      <div className="proctor-tag active">WEB CAM: ON</div>
                      <div className="proctor-tag active">TAB MONITOR: LOCKED</div>
                    </div>
                    <div className="proctor-integrity">
                      INTEGRITY RATING: <span>100% SECURE</span>
                    </div>
                  </div>
                )}

                {card.type === "ui-arcade" && (
                  <div className="visual-arcade">
                    <div className="arcade-xp-section">
                      <div className="arcade-lvl">LEVEL 42</div>
                      <div className="arcade-xp-text">950 / 1000 XP</div>
                    </div>
                    <div className="arcade-progress-bar">
                      <div className="arcade-progress-fill" />
                    </div>
                    <div className="arcade-quest-card">
                      <div className="arcade-quest-icon">
                        <Trophy size={16} />
                      </div>
                      <div className="arcade-quest-details">
                        <div className="arcade-quest-name">Dynamic Programming I</div>
                        <div className="arcade-quest-reward">+250 XP • Badge Unlocked</div>
                      </div>
                    </div>
                  </div>
                )}
                
                {card.type === "ui-lang" && (
                  <div className="visual-languages">
                    <div className="lang-grid-custom">
                      <div className="lang-card-mini active">Python</div>
                      <div className="lang-card-mini">JavaScript</div>
                      <div className="lang-card-mini active">Go</div>
                      <div className="lang-card-mini">Rust</div>
                      <div className="lang-card-mini active">C++</div>
                      <div className="lang-card-mini">Java</div>
                    </div>
                    <div className="lang-terminal-mini">
                      <code>$ python solve.py --test <span style={{ color: '#10b981' }}>✓ ok (4ms)</span></code>
                    </div>
                  </div>
                )}
                
                {card.type === "ui-factions" && (
                  <div className="visual-factions">
                    <div className="faction-rankings-mini">
                      <div className="faction-item-mini">
                        <div className="faction-name-mini">
                          <div className="faction-crest-dot" style={{ background: '#ef4444' }} />
                          CyberNova
                        </div>
                        <div className="faction-elo-mini">1,240 XP</div>
                      </div>
                      <div className="faction-item-mini">
                        <div className="faction-name-mini">
                          <div className="faction-crest-dot" style={{ background: '#71717a' }} />
                          BitBusters
                        </div>
                        <div className="faction-elo-mini">980 XP</div>
                      </div>
                      <div className="faction-item-mini">
                        <div className="faction-name-mini">
                          <div className="faction-crest-dot" style={{ background: '#52525b' }} />
                          CodeCrusaders
                        </div>
                        <div className="faction-elo-mini">850 XP</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

function ArcadeRoadmap() {
  const [selectedLevel, setSelectedLevel] = useState(0); // Default to Novice (index 0)
  const [activeTrackIdx, setActiveTrackIdx] = useState(0); // Selected sub-track index

  const roadmapData = [
    {
      level: 1,
      tier: "Novice",
      topic: "Code Library & Basic logic",
      desc: "The starting rank for all users. Solve easy problems in the Library to earn your first XP points (+50 XP per solve) and establish your Logic Level (logic_level) or CSS Level (css_level).",
      stats: "0+ XP • Library Access • +50 XP per Easy solve",
      badge: "Initiate Shield",
      tracks: [
        { name: "Variables & Loops", progress: 100, target: "Syntax logic: Complete basic arithmetic and looping quests." },
        { name: "CSS Flexbox & Box Model", progress: 90, target: "Layout control: Align page elements dynamically inside sandbox nodes." },
        { name: "Logic Calibration", progress: 75, target: "Type validation: Write checkers verifying JavaScript variable primitives." }
      ]
    },
    {
      level: 2,
      tier: "Apprentice",
      topic: "Intermediate Structures & 1v1 Arena",
      desc: "Unlock intermediate challenges once you cross 500 XP. Participate in 1v1 Arena Matches in Code Wars and climb language specific ratings (cpp_level, python_level).",
      stats: "500+ XP • Code Wars Access • +80 XP per Medium solve",
      badge: "Data Sentinel",
      tracks: [
        { name: "Arrays & Strings", progress: 80, target: "String parsing: Implement fast prefix searching and substring matching." },
        { name: "Stacks & HashMaps", progress: 40, target: "Key value lookups: Find elements and validate brackets sequence in O(1) time." },
        { name: "1v1 Arena Duels", progress: 15, target: "Speed matches: Beat the timer to submit correct solutions." }
      ]
    },
    {
      level: 3,
      tier: "Advanced",
      topic: "Fullstack Projects & CodeVault Notes",
      desc: "Reaching 2000 XP unlocks advanced stack modules. Level up React Level (react_level) and MERN Level (mern_level), and organize notes in CodeVault using Markdown.",
      stats: "2000+ XP • CodeVault Markdown Editor • +150 XP per Hard solve",
      badge: "Apprentice Crest",
      tracks: [
        { name: "React State & Hooks", progress: 0, target: "State management: Coordinate interactive data streams dynamically." },
        { name: "CodeVault Markdown Docs", progress: 0, target: "Knowledge base: Store notes, syntax helpers, and diagram scripts." },
        { name: "Websocket Session Sync", progress: 0, target: "Live sync: Connect sockets to collaborate concurrently on documents." }
      ]
    },
    {
      level: 4,
      tier: "Expert",
      topic: "Concurrency & Collaborative Code Wars",
      desc: "Crossing 5000 XP unlocks Expert-level challenges. Work with teammates inside live Monaco sync workspaces to tackle Code Wars passing all 15 weighted test cases.",
      stats: "5000+ XP • 15 Test Cases/Problem • Weighted Test Scoring",
      badge: "Master Code",
      tracks: [
        { name: "Go channels & Routines", progress: 0, target: "Pipeline worker: Stream bytes safely across parallel workers." },
        { name: "2v2 & 4v4 Team battles", progress: 0, target: "Collaborative Monaco: Code together in real-time with live cursor tracking." },
        { name: "Edge Case Code Hardening", progress: 0, target: "Stress testing: Optimize performance to pass stress and random inputs." }
      ]
    },
    {
      level: 5,
      tier: "Grandmaster",
      topic: "Distributed Systems & Faction Leadership",
      desc: "The ultimate rank on BrightCode. Lead active Factions (like Nothing, ABC, or g), coordinate faction battles, draw microservice consensus schemas via Mermaid, and dominate the global rankings.",
      stats: "10000+ XP • Factions Leadership • Max ELO Leaderboards",
      badge: "Elite Crown",
      tracks: [
        { name: "Consensus Algorithms", progress: 0, target: "Raft synchronization: Design coordinator sync routines across replicas." },
        { name: "Mermaid Architecture Charts", progress: 0, target: "Diagram styling: Draw consensus node sync schemes via Mermaid." },
        { name: "Faction Tournament Supremacy", progress: 0, target: "Elo trophy: Coordinate with teammates to defeat rival factions." }
      ]
    }
  ];

  // Reset selected sub-track when changing levels
  useEffect(() => {
    setActiveTrackIdx(0);
  }, [selectedLevel]);

  const handleSelectLevel = (idx) => {
    setSelectedLevel(idx);
  };

  const activeLevelData = roadmapData[selectedLevel];

  return (
    <section className="roadmap-section" id="roadmap">
      <div className="roadmap-header">
        <span className="section-pill">Arcade Road</span>
        <h2 className="section-h2">Rank Tiers &amp; Quest Tree</h2>
        <p className="section-sub">Interactive skill checkpoint. Select rank nodes, investigate target quests, and complete quizzes to unlock XP.</p>
      </div>

      <div className="roadmap-container">
        {/* Subway Map Track (Left side) */}
        <div className="roadmap-track-container">
          <div className="subway-line">
            <div 
              className="subway-line-fill" 
              style={{ height: `${(selectedLevel / (roadmapData.length - 1)) * 100}%` }}
            />
          </div>

          <div className="subway-nodes">
            {roadmapData.map((node, idx) => {
              const isActive = selectedLevel === idx;
              const isPassed = idx < selectedLevel;
              return (
                <div 
                  key={node.level} 
                  className={`subway-node-wrapper ${isActive ? "active" : ""} ${isPassed ? "passed" : ""}`}
                  onClick={() => handleSelectLevel(idx)}
                >
                  <div className="subway-node-dot">
                    <span className="node-inner-dot" />
                  </div>
                  <div className="subway-node-info">
                    <span className="node-level">LEVEL {node.level}</span>
                    <span className="node-tier">{node.tier}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Level Details Card (Right side) */}
        <div className="roadmap-details-card">
          <div className="details-card-header">
            <div className="details-title-wrap">
              <span className="details-level-tag">LEVEL {activeLevelData.level}</span>
              <h3 className="details-tier-name">{activeLevelData.tier}</h3>
            </div>
            <div className="details-badge-preview">
              <div className="details-badge-glowing-effect" />
              <Shield size={24} style={{ position: 'relative', zIndex: 1 }} />
            </div>
          </div>

          <div className="details-card-body">
            <h4 className="details-topic">{activeLevelData.topic}</h4>
            <p className="details-desc">{activeLevelData.desc}</p>
            
            <div className="details-stats-pill">
              {activeLevelData.stats}
            </div>

            {/* Sub-tracks Interactive Tabs */}
            <div className="details-tracks-list">
              <span className="details-tracks-title">SELECT A SUB-TRACK FOR ACTIVE TARGETS</span>
              <div className="tracks-tabs-wrap">
                {activeLevelData.tracks.map((track, tIdx) => (
                  <div 
                    key={tIdx} 
                    className={`details-track-item-interactive ${activeTrackIdx === tIdx ? "active" : ""}`}
                    onClick={() => setActiveTrackIdx(tIdx)}
                  >
                    <div className="track-meta">
                      <span className="track-name">{track.name}</span>
                      <span className="track-pct">{track.progress}%</span>
                    </div>
                    <div className="track-bar">
                      <div className="track-bar-fill" style={{ width: `${track.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

/* ────────────────────────────────────────────────────────────
   ALUMNI & PARTNERS BAND (Redesigned Light Theme Stack Marquee)
──────────────────────────────────────────────────────────── */
function AlumniNetwork() {
  const ref = useRef(null);
  const canvasRef = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

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
        fontSize: 8 + Math.random() * 7,
        alpha: Math.random() * 0.18 + 0.05,
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
          p.alpha = Math.random() * 0.18 + 0.05;
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
    <section className="alumni-section" ref={ref} style={{ position: "relative", overflow: "hidden" }}>
      <canvas ref={canvasRef} className="alumni-canvas" style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, opacity: 0.5 }} />
      <div className="alumni-container" style={{ position: "relative", zIndex: 1 }}>
        
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
function LeaderboardSection({ data, loading }) {
  const navigate = useNavigate();

  const mockData = [
    { username: "code_master_99", xp: 84200 },
    { username: "algo_queen", xp: 71800 },
    { username: "byte_ninja", xp: 68100 },
    { username: "rust_coder", xp: 54300 },
    { username: "stack_overflowed", xp: 49200 },
    { username: "git_push_force", xp: 44100 },
    { username: "py_wizard", xp: 39800 },
    { username: "hacker_ranker", xp: 35600 },
    { username: "binary_searcher", xp: 31200 },
    { username: "null_pointer", xp: 28900 }
  ];

  const displayData = data && data.length > 0 ? data : mockData;

  return (
    <section className="fame-section-fullwidth" id="arena">
      <div className="fame-fullwidth-inner">

        {/* Attracting Header Block */}
        <div className="fame-marketing-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '48px' }}>
          <span className="section-pill">Competitive Standings</span>
          <h2 className="section-h2">Rise on the Global Leaderboard</h2>
          <p className="section-sub" style={{ marginBottom: '24px' }}>
            Earn XP by solving challenges, maintaining streaks, and collaborating. Compete against top developers worldwide to claim your place on the 3D podium and secure your operative rank.
          </p>
          <button className="leaderboard-header-btn" onClick={() => navigate('/leaderboard')}>
            <Trophy size={14} />
            <span>View Full Leaderboard</span>
          </button>
        </div>

        {/* Two-column layout: Podium left | Rankings list right */}
        <div className="fame-layout-split">

          {/* LEFT: Top 3 Podium */}
          <div className="fame-podium-col">
            {loading ? (
              <p className="widget-loading">Loading...</p>
            ) : !displayData || !displayData.length ? (
              <p className="widget-error">Rankings node offline.</p>
            ) : (
              <div className="fame-podium">
                {/* 2nd Place */}
                {displayData[1] && (
                  <div className="podium-column column-2" onClick={(e) => { e.stopPropagation(); navigate(`/u/${displayData[1].username}`); }}>
                    <span className="podium-rank-emoji">🥈</span>
                    <div className="podium-avatar-circle avatar-silver">{displayData[1].username[0].toUpperCase()}</div>
                    <div className="podium-user-info">
                      <span className="podium-username">{displayData[1].username}</span>
                      <span className="podium-xp">{displayData[1].xp?.toLocaleString()} XP</span>
                    </div>
                    <div className="podium-box step-2-box"><span className="step-num">2</span></div>
                  </div>
                )}
                {/* 1st Place */}
                {displayData[0] && (
                  <div className="podium-column column-1" onClick={(e) => { e.stopPropagation(); navigate(`/u/${displayData[0].username}`); }}>
                    <span className="podium-crown-icon"><Crown size={20} fill="#fbbf24" color="#fbbf24" /></span>
                    <span className="podium-rank-emoji">🥇</span>
                    <div className="podium-avatar-circle avatar-gold">{displayData[0].username[0].toUpperCase()}</div>
                    <div className="podium-user-info">
                      <span className="podium-username">{displayData[0].username}</span>
                      <span className="podium-xp">{displayData[0].xp?.toLocaleString()} XP</span>
                    </div>
                    <div className="podium-box step-1-box"><span className="step-num">1</span></div>
                  </div>
                )}
                {/* 3rd Place */}
                {displayData[2] && (
                  <div className="podium-column column-3" onClick={(e) => { e.stopPropagation(); navigate(`/u/${displayData[2].username}`); }}>
                    <span className="podium-rank-emoji">🥉</span>
                    <div className="podium-avatar-circle avatar-bronze">{displayData[2].username[0].toUpperCase()}</div>
                    <div className="podium-user-info">
                      <span className="podium-username">{displayData[2].username}</span>
                      <span className="podium-xp">{displayData[2].xp?.toLocaleString()} XP</span>
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
            {loading ? (
              <p className="widget-loading">Loading...</p>
            ) : !displayData || !displayData.length ? (
              <p className="widget-error">Rankings node offline.</p>
            ) : (
              <div className="fame-list-stack">
                {displayData.slice(3, 10).map((ranker, idx) => (
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
/* ────────────────────────────────────────────────────────────
   MODULES ECOSYSTEM COLLAGE SECTION
──────────────────────────────────────────────────────────── */
function WorkspaceShowcase({ navigate }) {
  const [subTab, setSubTab] = useState("editor");

  const screenshots = {
    editor: "/images/workspace_editor.png",
    git: "/images/workspace_git.png",
    chat: "/images/workspace_chat.png"
  };

  const titles = {
    editor: "workspace/main.py",
    git: "workspace/source-control",
    chat: "workspace/team-chat"
  };

  return (
    <div className="workspace-showcase-container">
      {/* LEFT COLUMN */}
      <div className="workspace-showcase-left">
        <h3 className="w-title">Build Your Dream Project</h3>
        <p className="w-desc">
          A real-time collaborative workspace for developers. Write, run, and ship code together — instantly.
        </p>

        {/* Stats */}
        <div className="w-stats-row">
          <div className="w-stat-card">
            <span className="w-stat-num text-red">99.9%</span>
            <span className="w-stat-lbl">UPTIME</span>
          </div>
          <div className="w-stat-card">
            <span className="w-stat-num text-red">&lt;50ms</span>
            <span className="w-stat-lbl">LATENCY</span>
          </div>
          <div className="w-stat-card">
            <span className="w-stat-num text-red">14+</span>
            <span className="w-stat-lbl">LANGUAGES</span>
          </div>
        </div>

        {/* Interactive Switcher Chips */}
        <div className="w-chips-row">
          <button 
            className={`w-chip-btn ${subTab === "editor" ? "active" : ""}`}
            onClick={() => setSubTab("editor")}
          >
            <Terminal size={14} /> Multi-language editor
          </button>
          <button 
            className={`w-chip-btn ${subTab === "git" ? "active" : ""}`}
            onClick={() => setSubTab("git")}
          >
            <GitBranch size={14} /> Git integration
          </button>
          <button 
            className={`w-chip-btn ${subTab === "chat" ? "active" : ""}`}
            onClick={() => setSubTab("chat")}
          >
            <Users size={14} /> Live chat & collaboration
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN - BROWSER WINDOW MOCKUP */}
      <div className="workspace-showcase-right">
        <div className="w-browser">
          <div className="w-browser-header">
            <div className="w-dots">
              <span className="w-dot red" />
              <span className="w-dot yellow" />
              <span className="w-dot green" />
            </div>
            <div className="w-address-bar">{titles[subTab]}</div>
            <div className="w-live-badge">
              <span className="w-live-pulse" /> LIVE
            </div>
          </div>
          <div className="w-browser-content">
            <AnimatePresence mode="wait">
              <motion.img 
                key={subTab}
                src={screenshots[subTab]} 
                alt="Workspace preview" 
                className="w-preview-img"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ThemesShowcase({ navigate }) {
  const [selectedTheme, setSelectedTheme] = useState("crimson");

  const themes = [
    {
      id: "crimson",
      name: "Scarlet Flare",
      tagline: "TACTICAL CRIMSON",
      color: "#ef4444",
      desc: "Sleek tactical dark theme with brand red accents. Engineered for high-intensity programming and deep focus sessions.",
      image: "/images/theme_crimson.png",
      address: "dashboard/theme?id=crimson",
      palette: ["#ef4444", "#dc2626", "#0f0f0f", "#121214"]
    },
    {
      id: "amber",
      name: "Creeper Craft",
      tagline: "RETRO SANDBOX",
      color: "#FFD700",
      desc: "A blocky sandbox theme inspired by retro crafting classics. Custom pixel-art fonts, solid borders, and earthy green highlights.",
      image: "/images/theme_amber.png",
      address: "dashboard/theme?id=amber",
      palette: ["#FFD700", "#5D9E3F", "#111111", "#222222"]
    },
    {
      id: "neo-noir",
      name: "Night City",
      tagline: "CYBERPUNK NEON",
      color: "#00d9ff",
      desc: "A neon-drenched cyberpunk aesthetic featuring glowing cyan interfaces, hot pink secondary highlights, and dark obsidian backdrops.",
      image: "/images/theme_neon.png",
      address: "dashboard/theme?id=neo-noir",
      palette: ["#00d9ff", "#ff0080", "#050508", "#0b0b14"]
    }
  ];

  const currentTheme = themes.find(t => t.id === selectedTheme);

  return (
    <div className="themes-showcase-container">
      {/* LEFT COLUMN: Selectors */}
      <div className="themes-showcase-left">
        <div className="themes-list">
          {themes.map((theme) => (
            <div 
              key={theme.id}
              className={`theme-list-item ${selectedTheme === theme.id ? "active" : ""}`}
              onClick={() => setSelectedTheme(theme.id)}
              style={{ 
                "--theme-color-glow": theme.color + "15",
                "--theme-color-accent": theme.color
              }}
            >
              <div className="theme-item-meta">
                <span className="theme-item-tag">{theme.tagline}</span>
                <h4 className="theme-item-name">{theme.name}</h4>
                <p className="theme-item-desc">{theme.desc}</p>
              </div>

              {/* Color dots & Button */}
              <div className="theme-item-footer">
                <div className="theme-palette">
                  {theme.palette.map((c, i) => (
                    <span key={i} className="theme-palette-dot" style={{ backgroundColor: c }} />
                  ))}
                </div>
                <button 
                  className="theme-activate-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/settings");
                  }}
                >
                  Apply Theme
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT COLUMN: Browser Mockup displaying the REAL theme screenshot! */}
      <div className="themes-showcase-right">
        <div className="w-browser themed-preview-border">
          <div className="w-browser-header">
            <div className="w-dots">
              <span className="w-dot red" />
              <span className="w-dot yellow" />
              <span className="w-dot green" />
            </div>
            <div className="w-address-bar">{currentTheme.address}</div>
            <div className="w-live-badge" style={{ color: currentTheme.color, borderColor: currentTheme.color + "30", background: currentTheme.color + "08" }}>
              <span className="w-live-pulse" style={{ backgroundColor: currentTheme.color, boxShadow: `0 0 6px ${currentTheme.color}` }} /> APPLIED
            </div>
          </div>
          <div className="w-browser-content themed-preview-bg">
            <AnimatePresence mode="wait">
              <motion.img 
                key={selectedTheme}
                src={currentTheme.image} 
                alt={`${currentTheme.name} Theme Preview`} 
                className="w-preview-img"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function VaultShowcase({ navigate }) {
  const [subTab, setSubTab] = useState("editor");

  const screenshots = {
    editor: "/images/vault_note.png",
    draw: "/images/vault_draw.png"
  };

  const titles = {
    editor: "vault/notes/algorithm-notes.md",
    draw: "vault/diagrams/system-architecture.excalidraw"
  };

  return (
    <div className="workspace-showcase-container">
      {/* LEFT COLUMN */}
      <div className="workspace-showcase-left">
        <h3 className="w-title">CodeVault & Documentation</h3>
        <p className="w-desc">
          Document your algorithms, map architectures with Excalidraw, and sync notebooks directly with your repositories.
        </p>

        {/* Features List */}
        <div className="vault-features-list">
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>Export MD & PDF:</strong> Download notes instantly as standard Markdown (.md) or premium formatted PDF.
            </div>
          </div>
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>Smart Links:</strong> Insert clickable links to files, folders, or web pages and navigate with a single click.
            </div>
          </div>
        </div>

        {/* Interactive Switcher Chips */}
        <div className="w-chips-row">
          <button 
            className={`w-chip-btn ${subTab === "editor" ? "active" : ""}`}
            onClick={() => setSubTab("editor")}
            style={subTab === "editor" ? { borderColor: "rgba(234, 179, 8, 0.35)", background: "rgba(234, 179, 8, 0.08)", color: "#ffffff" } : {}}
          >
            <Terminal size={14} /> Rich Markdown Editor
          </button>
          <button 
            className={`w-chip-btn ${subTab === "draw" ? "active" : ""}`}
            onClick={() => setSubTab("draw")}
            style={subTab === "draw" ? { borderColor: "rgba(234, 179, 8, 0.35)", background: "rgba(234, 179, 8, 0.08)", color: "#ffffff" } : {}}
          >
            <GitBranch size={14} /> Integrated Excalidraw Canvas
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN - BROWSER WINDOW MOCKUP */}
      <div className="workspace-showcase-right">
        <div className="w-browser">
          <div className="w-browser-header">
            <div className="w-dots">
              <span className="w-dot red" />
              <span className="w-dot yellow" />
              <span className="w-dot green" />
            </div>
            <div className="w-address-bar">{titles[subTab]}</div>
            <div className="w-live-badge" style={{ color: "#eab308", borderColor: "rgba(234, 179, 8, 0.2)", background: "rgba(234, 179, 8, 0.08)" }}>
              <span className="w-live-pulse" style={{ backgroundColor: "#eab308", boxShadow: "0 0 6px #eab308" }} /> SAVED
            </div>
          </div>
          <div className="w-browser-content">
            <AnimatePresence mode="wait">
              <motion.img 
                key={subTab}
                src={screenshots[subTab]} 
                alt="Vault preview" 
                className="w-preview-img"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedShowcase({ navigate }) {
  return (
    <div className="workspace-showcase-container">
      {/* LEFT COLUMN */}
      <div className="workspace-showcase-left">
        <h3 className="w-title">CodeFeed Social Arena</h3>
        <p className="w-desc">
          Share your daily coding insights, learn from others, and interact with the community. Attach code blocks and earn XP for every post!
        </p>

        {/* Feature categories block representing the post types */}
        <div className="vault-features-list">
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>TIL (Today I Learned):</strong> Share quick technical learnings, handy tips, or keyboard shortcuts you discovered.
            </div>
          </div>
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>Roast My Code:</strong> Request constructive, high-level feedback and optimization reviews from fellow expert engineers.
            </div>
          </div>
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>Challenge & Ask:</strong> Publish coding puzzles, request debugging help, or post questions with full IDE code snippets.
            </div>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN - BROWSER WINDOW MOCKUP */}
      <div className="workspace-showcase-right">
        <div className="w-browser">
          <div className="w-browser-header">
            <div className="w-dots">
              <span className="w-dot red" />
              <span className="w-dot yellow" />
              <span className="w-dot green" />
            </div>
            <div className="w-address-bar">vault/feed</div>
            <div className="w-live-badge" style={{ color: "#22c55e", borderColor: "rgba(34, 197, 94, 0.2)", background: "rgba(34, 197, 94, 0.08)" }}>
              <span className="w-live-pulse" style={{ backgroundColor: "#22c55e", boxShadow: "0 0 6px #22c55e" }} /> ONLINE
            </div>
          </div>
          <div className="w-browser-content">
            <motion.img 
              src="/images/feed_page.png" 
              alt="CodeFeed preview" 
              className="w-preview-img"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function AlliesShowcase({ navigate }) {
  const [subTab, setSubTab] = useState("profile");

  const screenshots = {
    profile: "/images/allies_profile.png",
    edit: "/images/allies_edit.png",
    drawer: "/images/allies_list.png"
  };

  const titles = {
    profile: "vault/profile/admin",
    edit: "vault/profile/settings",
    drawer: "vault/allies"
  };

  return (
    <div className="workspace-showcase-container">
      {/* LEFT COLUMN */}
      <div className="workspace-showcase-left">
        <h3 className="w-title">Developer Identity & Friends</h3>
        <p className="w-desc">
          Build your professional reputation, showcase achievements, connect with friends, and customize your look with unlocked items.
        </p>

        {/* Features List */}
        <div className="vault-features-list">
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>Make Allies & Visit Profiles:</strong> Search for users, send friend requests, view their levels, total XP, challenge logs, and activity stats.
            </div>
          </div>
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>Real-time Chatting:</strong> Chat directly with your offline or online friends from the sliding Allies drawer.
            </div>
          </div>
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>Edit Avatars & Banners:</strong> Unlock premium operative avatars (Sniper, Ghost, Ninja, etc.) and profile banners (Crimson Flare, Cyber Neon, etc.) using your hard-earned XP.
            </div>
          </div>
        </div>

        {/* Interactive Switcher Chips */}
        <div className="w-chips-row">
          <button 
            className={`w-chip-btn ${subTab === "profile" ? "active" : ""}`}
            onClick={() => setSubTab("profile")}
            style={subTab === "profile" ? { borderColor: "rgba(239, 68, 68, 0.35)", background: "rgba(239, 68, 68, 0.08)", color: "#ffffff" } : {}}
          >
            <User size={14} /> Visit Profiles
          </button>
          <button 
            className={`w-chip-btn ${subTab === "edit" ? "active" : ""}`}
            onClick={() => setSubTab("edit")}
            style={subTab === "edit" ? { borderColor: "rgba(239, 68, 68, 0.35)", background: "rgba(239, 68, 68, 0.08)", color: "#ffffff" } : {}}
          >
            <Settings size={14} /> Customize Armory
          </button>
          <button 
            className={`w-chip-btn ${subTab === "drawer" ? "active" : ""}`}
            onClick={() => setSubTab("drawer")}
            style={subTab === "drawer" ? { borderColor: "rgba(239, 68, 68, 0.35)", background: "rgba(239, 68, 68, 0.08)", color: "#ffffff" } : {}}
          >
            <Users size={14} /> Allies Drawer
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN - BROWSER WINDOW MOCKUP */}
      <div className="workspace-showcase-right">
        <div className="w-browser">
          <div className="w-browser-header">
            <div className="w-dots">
              <span className="w-dot red" />
              <span className="w-dot yellow" />
              <span className="w-dot green" />
            </div>
            <div className="w-address-bar">{titles[subTab]}</div>
            <div className="w-live-badge" style={{ color: "#ef4444", borderColor: "rgba(239, 68, 68, 0.2)", background: "rgba(239, 68, 68, 0.08)" }}>
              <span className="w-live-pulse" style={{ backgroundColor: "#ef4444", boxShadow: "0 0 6px #ef4444" }} /> PROFILE
            </div>
          </div>
          <div className="w-browser-content">
            <AnimatePresence mode="wait">
              <motion.img 
                key={subTab}
                src={screenshots[subTab]} 
                alt="Allies preview" 
                className="w-preview-img"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardShowcase({ navigate }) {
  const [subTab, setSubTab] = useState("podium");

  const screenshots = {
    podium: "/images/leaderboard_podium.png",
    rank: "/images/leaderboard_rank.png"
  };

  const titles = {
    podium: "vault/leaderboard/podium",
    rank: "vault/leaderboard/standings"
  };

  return (
    <div className="workspace-showcase-container">
      {/* LEFT COLUMN */}
      <div className="workspace-showcase-left">
        <h3 className="w-title">Hall of Fame & XP Standings</h3>
        <p className="w-desc">
          Compete against the community, climb up the tiers, and claim your place on the 3D podium in our global standings hall of fame.
        </p>

        {/* Features List */}
        <div className="vault-features-list">
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>XP Progression System:</strong> Gain XP points automatically by executing code, submitting notes, and participating in forum discussions.
            </div>
          </div>
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>Interactive 3D Podium:</strong> View top players dynamically arranged on 3D column stands with detailed rank tier cards.
            </div>
          </div>
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>Rank Tiers:</strong> Level up and unlock status badges from *Initiate* and *Novice* to *Apprentice*, *Grandmaster*, and *Elite*.
            </div>
          </div>
        </div>

        {/* Interactive Switcher Chips */}
        <div className="w-chips-row">
          <button 
            className={`w-chip-btn ${subTab === "podium" ? "active" : ""}`}
            onClick={() => setSubTab("podium")}
            style={subTab === "podium" ? { borderColor: "rgba(245, 158, 11, 0.35)", background: "rgba(245, 158, 11, 0.08)", color: "#ffffff" } : {}}
          >
            <Trophy size={14} /> Hall of Fame Podium
          </button>
          <button 
            className={`w-chip-btn ${subTab === "rank" ? "active" : ""}`}
            onClick={() => setSubTab("rank")}
            style={subTab === "rank" ? { borderColor: "rgba(245, 158, 11, 0.35)", background: "rgba(245, 158, 11, 0.08)", color: "#ffffff" } : {}}
          >
            <Users size={14} /> Full User Standings
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN - BROWSER WINDOW MOCKUP */}
      <div className="workspace-showcase-right">
        <div className="w-browser">
          <div className="w-browser-header">
            <div className="w-dots">
              <span className="w-dot red" />
              <span className="w-dot yellow" />
              <span className="w-dot green" />
            </div>
            <div className="w-address-bar">{titles[subTab]}</div>
            <div className="w-live-badge" style={{ color: "#f59e0b", borderColor: "rgba(245, 158, 11, 0.2)", background: "rgba(245, 158, 11, 0.08)" }}>
              <span className="w-live-pulse" style={{ backgroundColor: "#f59e0b", boxShadow: "0 0 6px #f59e0b" }} /> STANDINGS
            </div>
          </div>
          <div className="w-browser-content">
            <AnimatePresence mode="wait">
              <motion.img 
                key={subTab}
                src={screenshots[subTab]} 
                alt="Leaderboard standings preview" 
                className="w-preview-img"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function FactionShowcase({ navigate }) {
  const [subTab, setSubTab] = useState("directory");

  const screenshots = {
    directory: "/images/faction_directory.png",
    roster: "/images/faction_roster.png",
    settings: "/images/faction_settings.png"
  };

  const titles = {
    directory: "vault/factions/directory",
    roster: "vault/factions/roster",
    settings: "vault/factions/settings"
  };

  return (
    <div className="workspace-showcase-container">
      {/* LEFT COLUMN */}
      <div className="workspace-showcase-left">
        <h3 className="w-title">Faction Command Center</h3>
        <p className="w-desc">
          Form code alliances, compete in seasonal league outposts, and coordinate team challenges with custom roster controls.
        </p>

        {/* Features List */}
        <div className="vault-features-list">
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>Faction Directory:</strong> Join existing public/private developer factions or register a new one to compete this season.
            </div>
          </div>
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>1v1 & 2v2 Battles (Coming Soon):</strong> Competitive faction arena matches are in development to let factions fight directly for territory Elo.
            </div>
          </div>
          <div className="v-feature-item">
            <span className="v-feat-icon" />
            <div className="v-feat-text">
              <strong>Faction Chat & Settings:</strong> Chat live with members inside the command center, configure visibility, or manage faction settings.
            </div>
          </div>
        </div>

        {/* Interactive Switcher Chips */}
        <div className="w-chips-row">
          <button 
            className={`w-chip-btn ${subTab === "directory" ? "active" : ""}`}
            onClick={() => setSubTab("directory")}
            style={subTab === "directory" ? { borderColor: "rgba(34, 197, 94, 0.35)", background: "rgba(34, 197, 94, 0.08)", color: "#ffffff" } : {}}
          >
            <Users size={14} /> Faction Directory
          </button>
          <button 
            className={`w-chip-btn ${subTab === "roster" ? "active" : ""}`}
            onClick={() => setSubTab("roster")}
            style={subTab === "roster" ? { borderColor: "rgba(34, 197, 94, 0.35)", background: "rgba(34, 197, 94, 0.08)", color: "#ffffff" } : {}}
          >
            <Shield size={14} /> Command Roster
          </button>
          <button 
            className={`w-chip-btn ${subTab === "settings" ? "active" : ""}`}
            onClick={() => setSubTab("settings")}
            style={subTab === "settings" ? { borderColor: "rgba(34, 197, 94, 0.35)", background: "rgba(34, 197, 94, 0.08)", color: "#ffffff" } : {}}
          >
            <Settings size={14} /> Manage Settings
          </button>
        </div>

      </div>

      {/* RIGHT COLUMN - BROWSER WINDOW MOCKUP */}
      <div className="workspace-showcase-right">
        <div className="w-browser">
          <div className="w-browser-header">
            <div className="w-dots">
              <span className="w-dot red" />
              <span className="w-dot yellow" />
              <span className="w-dot green" />
            </div>
            <div className="w-address-bar">{titles[subTab]}</div>
            <div className="w-live-badge" style={{ color: "#22c55e", borderColor: "rgba(34, 197, 94, 0.2)", background: "rgba(34, 197, 94, 0.08)" }}>
              <span className="w-live-pulse" style={{ backgroundColor: "#22c55e", boxShadow: "0 0 6px #22c55e" }} /> COMMAND
            </div>
          </div>
          <div className="w-browser-content">
            <AnimatePresence mode="wait">
              <motion.img 
                key={subTab}
                src={screenshots[subTab]} 
                alt="Faction preview" 
                className="w-preview-img"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.25 }}
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModulesSection() {
  const [activeTab, setActiveTab] = useState("workspace");
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const navigate = useNavigate();

  const tabs = [
    { id: "workspace", label: "Workspace & Collaboration" },
    { id: "theme", label: "Themes" },
    { id: "vault", label: "CodeVault" },
    { id: "feed", label: "Feed" },
    { id: "allies", label: "Allies & Profiles" },
    { id: "leaderboard", label: "Leaderboard" },
    { id: "faction", label: "Factions" }
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

      {/* Tab contents */}
      <AnimatePresence mode="wait">
        {activeTab === "workspace" && (
          <motion.div
            key="workspace"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            <WorkspaceShowcase navigate={navigate} />
          </motion.div>
        )}
        {activeTab === "theme" && (
          <motion.div
            key="theme"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            <ThemesShowcase navigate={navigate} />
          </motion.div>
        )}
        {activeTab === "vault" && (
          <motion.div
            key="vault"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            <VaultShowcase navigate={navigate} />
          </motion.div>
        )}
        {activeTab === "feed" && (
          <motion.div
            key="feed"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            <FeedShowcase navigate={navigate} />
          </motion.div>
        )}
        {activeTab === "allies" && (
          <motion.div
            key="allies"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            <AlliesShowcase navigate={navigate} />
          </motion.div>
        )}
        {activeTab === "leaderboard" && (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            <LeaderboardShowcase navigate={navigate} />
          </motion.div>
        )}
        {activeTab === "faction" && (
          <motion.div
            key="faction"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35 }}
          >
            <FactionShowcase navigate={navigate} />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

export default function Landing() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/leaderboard`)
      .then(r => r.json())
      .then(d => { const rows = Array.isArray(d) ? d : (d?.data || []); setLeaderboard(rows.slice(0, 10)); setLbLoading(false); })
      .catch(() => setLbLoading(false));
  }, []);

  const handleAuth = mode => navigate("/auth", { state: { mode } });
  const handleHub  = () => navigate("/hub");

  return (
    <div className="lp-root" style={{ position: "relative" }}>
      <Nav handleAuth={handleAuth} />
      <BrightCodeCanvas />
      <HeroSection handleAuth={handleAuth} handleHub={handleHub} />
      <Ticker />
      <InteractivePlayground />
      <BentoFeatures />
      <ArcadeRoadmap />
      <AlumniNetwork />
      <ModulesSection />
      <LeaderboardSection data={leaderboard} loading={lbLoading} />
      <CTASection handleAuth={handleAuth} handleHub={handleHub} />
      <Footer />
    </div>
  );
}
