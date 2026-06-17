import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Code2, Users, Terminal, BookOpen, Brain, 
  Trophy, ArrowRight, Shield, Activity, ChevronRight, Play, CheckCircle,
  GitBranch, Sparkles, Flame, Check, HelpCircle, Menu, X
} from "lucide-react";
import API_URL from "../config";
import CodeBrightLogo from "../components/CodeBrightLogo";
import "./Landing.css";

// Code Snippets for Hero typewriter simulation
const CODE_SNIPPETS = {
  python: {
    file: "solution.py",
    code: [
      "class Solution:",
      "    def twoSum(self, nums: List[int], target: int) -> List[int]:",
      "        seen = {}",
      "        for i, num in enumerate(nums):",
      "            remaining = target - num",
      "            if remaining in seen:",
      "                return [seen[remaining], i]",
      "            seen[num] = i",
      "        return []"
    ],
    console: {
      passed: "Test Cases Passed (3/3)",
      stats: "Runtime: 38 ms (Beats 94.2% of Python3 submissions)"
    }
  },
  javascript: {
    file: "solution.js",
    code: [
      "function twoSum(nums, target) {",
      "    const seen = new Map();",
      "    for (let i = 0; i < nums.length; i++) {",
      "        const remaining = target - nums[i];",
      "        if (seen.has(remaining)) {",
      "            return [seen.get(remaining), i];",
      "        }",
      "        seen.set(nums[i], i);",
      "    }",
      "    return [];",
      "}"
    ],
    console: {
      passed: "Test Cases Passed (5/5)",
      stats: "Runtime: 52 ms (Beats 91.8% of Node.js submissions)"
    }
  }
};

export default function Landing() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Typewriter state
  const [selectedLang, setSelectedLang] = useState('python');
  const [typedLines, setTypedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [consoleVisible, setConsoleVisible] = useState(false);

  // Playground interactive states
  const [logicLabNode, setLogicLabNode] = useState(3);
  const [warpCheckpoint, setWarpCheckpoint] = useState(3);
  const [sentinelOptimized, setSentinelOptimized] = useState(false);

  useEffect(() => {
    fetch(`${API_URL}/leaderboard`)
      .then(res => res.json())
      .then(data => {
        setLeaderboard(Array.isArray(data) ? data.slice(0, 5) : []);
        setLbLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch leaderboard:", err);
        setLbLoading(false);
      });
  }, []);

  const handleAuth = (mode) => navigate('/auth', { state: { mode } });
  const handleHub = () => navigate('/hub');

  const activeSnippet = CODE_SNIPPETS[selectedLang];

  // Typewriter effect
  useEffect(() => {
    setTypedLines([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setConsoleVisible(false);
  }, [selectedLang]);

  useEffect(() => {
    let timer;
    if (currentLineIndex < activeSnippet.code.length) {
      const lineText = activeSnippet.code[currentLineIndex];
      if (currentCharIndex < lineText.length) {
        timer = setTimeout(() => {
          setTypedLines(prev => {
            const next = [...prev];
            if (next[currentLineIndex] === undefined) {
              next[currentLineIndex] = "";
            }
            next[currentLineIndex] += lineText[currentCharIndex];
            return next;
          });
          setCurrentCharIndex(prev => prev + 1);
        }, 12);
      } else {
        timer = setTimeout(() => {
          setCurrentLineIndex(prev => prev + 1);
          setCurrentCharIndex(0);
        }, 50);
      }
    } else {
      timer = setTimeout(() => {
        setConsoleVisible(true);
      }, 150);
    }
    return () => clearTimeout(timer);
  }, [currentLineIndex, currentCharIndex, selectedLang]);

  return (
    <div className="landing-root tech-theme">
      {/* Dynamic Ambient Background Glows */}
      <div className="ambient-spot light-red"></div>
      <div className="ambient-spot light-purple"></div>

      {/* ══ NAV ══ */}
      <nav className="nav">
        <div className="nav-inner">
          <a className="nav-logo" href="#" onClick={e => e.preventDefault()} style={{ textDecoration: 'none' }}>
            <CodeBrightLogo size="small" />
          </a>

          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#modules" className="nav-link">Modules</a>
            <a href="#workflow" className="nav-link">How it Works</a>
            <a href="#arena" className="nav-link">Leaderboard</a>
          </div>

          <div className="nav-actions">
            <button className="nav-btn-ghost" onClick={() => handleAuth('login')}>Sign In</button>
            <button className="nav-btn-primary" onClick={() => handleAuth('register')}>Get Started</button>
          </div>

          <button 
            className="nav-mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="nav-mobile-menu">
            <a href="#features" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
            <a href="#modules" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Modules</a>
            <a href="#workflow" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
            <a href="#arena" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Leaderboard</a>
            <hr className="nav-mobile-divider" />
            <button className="nav-mobile-btn-ghost" onClick={() => { handleAuth('login'); setMobileMenuOpen(false); }}>Sign In</button>
            <button className="nav-mobile-btn-primary" onClick={() => { handleAuth('register'); setMobileMenuOpen(false); }}>Get Started</button>
          </div>
        )}
      </nav>

      {/* ══ HERO ══ */}
      <header className="hero">
        <div className="hero-inner">
          <motion.div 
            className="hero-left"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="hero-badge">
              <span className="badge-dot"></span>
              <span className="badge-text">✨ Redesigned High-Performance IDE</span>
            </div>
            <h1 className="hero-h1">
              Code, Collaborate, <br />
              <span>Conquer Challenges</span>.
            </h1>

            <p className="hero-sub">
              BrightCode is your premium, all-in-one platform for mastering programming. Practice algorithms, join faction battles, version-control snapshots via Warp Drive, and optimize nested iterations using Sentinel AI.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" onClick={() => handleAuth('register')}>
                Start Coding for Free <ArrowRight size={18} />
              </button>
              <button className="btn-secondary" onClick={handleHub}>
                <Play size={18} fill="currentColor" /> Live Demo
              </button>
            </div>

            <div className="hero-stats">
              <div className="h-stat">
                <span className="h-stat-val">2,500+</span>
                <span className="h-stat-lbl">Coding Problems</span>
              </div>
              <div className="h-stat">
                <span className="h-stat-val">15+</span>
                <span className="h-stat-lbl">Active Factions</span>
              </div>
              <div className="h-stat">
                <span className="h-stat-val">&lt;30ms</span>
                <span className="h-stat-lbl">Real-time Sync</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-right"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="mock-workspace">
              {/* Left Mock Panel: Problem Statement */}
              <div className="mock-problem-panel">
                <div className="mock-panel-header">
                  <span className="panel-title">Problem Description</span>
                </div>
                <div className="mock-panel-body">
                  <h3 className="prob-title">1. Two Sum</h3>
                  <div className="prob-tags">
                    <span className="tag-easy">Easy</span>
                    <span className="tag-meta">Algorithms</span>
                  </div>
                  <p className="prob-desc">
                    Given an array of integers <code>nums</code> and an integer <code>target</code>, return indices of the two numbers such that they add up to <code>target</code>.
                  </p>
                  <p className="prob-desc text-muted">
                    You may assume that each input would have exactly one solution, and you may not use the same element twice.
                  </p>
                  <div className="prob-example">
                    <span className="ex-title">Example 1:</span>
                    <pre>
                      <strong>Input:</strong> nums = [2,7,11,15], target = 9{"\n"}
                      <strong>Output:</strong> [0,1]
                    </pre>
                  </div>
                </div>
              </div>

              {/* Right Mock Panel: Code Editor */}
              <div className="mock-editor-panel">
                <div className="mock-panel-header">
                  <span 
                    className={`tab ${selectedLang === 'python' ? 'active' : ''}`}
                    onClick={() => setSelectedLang('python')}
                  >
                    solution.py
                  </span>
                  <span 
                    className={`tab ${selectedLang === 'javascript' ? 'active' : ''}`}
                    onClick={() => setSelectedLang('javascript')}
                  >
                    solution.js
                  </span>
                  <div className="run-controls">
                    <button className="btn-run-small" onClick={() => {
                      setTypedLines([]);
                      setCurrentLineIndex(0);
                      setCurrentCharIndex(0);
                      setConsoleVisible(false);
                    }}>
                      <Play size={10} fill="currentColor" /> Run
                    </button>
                  </div>
                </div>
                <div className="mock-editor-body">
                  {typedLines.map((line, idx) => (
                    <div className="code-line" key={idx}>
                      <span className="ln">{idx + 1}</span>
                      <span className="code-text">{line}</span>
                    </div>
                  ))}
                  {currentLineIndex < activeSnippet.code.length && (
                    <span className="cursor">|</span>
                  )}
                </div>
                <div className={`mock-console ${consoleVisible ? 'show' : ''}`}>
                  <div className="console-header">
                    <CheckCircle size={12} className="success-icon" />
                    <span>{activeSnippet.console.passed}</span>
                  </div>
                  <div className="console-result">
                    {activeSnippet.console.stats}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </header>

      {/* ══ CORE FEATURES ══ */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">💪 Powerful Features</span>
            <h2 className="section-heading">Everything a Developer Needs</h2>
            <p className="section-subtext">From coding practice to competitive programming, BrightCode has you covered with all the tools you need to succeed.</p>
          </div>

          <motion.div 
            className="features-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.08 } }
            }}
          >
            {[
              { id: 1, icon: Code2, title: "Smart Code Editor", desc: "Practice coding in our feature-rich editor with support for 10+ languages, syntax highlighting, and instant test case validation.", boxClass: "blue-box" },
              { id: 2, icon: Trophy, title: "Competitive Arenas", desc: "Join live speed-coding battles, compete against other developers, and climb the global leaderboards to prove your skills.", boxClass: "orange-box" },
              { id: 3, icon: Brain, title: "AI-Powered Help", desc: "Get instant code suggestions, complexity analysis (Big-O), and debugging assistance from our AI assistant, Sentinel.", boxClass: "green-box" },
              { id: 4, icon: BookOpen, title: "Study & Notes", desc: "Keep your knowledge organized with our built-in note vault, markdown editor, and Excalidraw whiteboard for diagrams.", boxClass: "purple-box" },
              { id: 5, icon: Users, title: "Team Collaboration", desc: "Code together in real-time with shared workspaces, collaborative whiteboards, and integrated voice and video calls.", boxClass: "red-box" },
              { id: 6, icon: Shield, title: "Secure Proctoring", desc: "Host or take secure coding assessments with screen monitoring, tab tracking, and detailed event logging.", boxClass: "gold-box" }
            ].map(feat => {
              const Icon = feat.icon;
              return (
                <motion.div 
                  className="feature-card" 
                  key={feat.id}
                  variants={{
                    hidden: { opacity: 0, y: 15 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
                  }}
                  whileHover={{ y: -5, transition: { duration: 0.2 } }}
                >
                  <div className={`feat-icon-box ${feat.boxClass}`}>
                    <Icon size={24} />
                  </div>
                  <h3 className="feat-title">{feat.title}</h3>
                  <p className="feat-desc">{feat.desc}</p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══ INTERACTIVE WORKSPACE (ECOSYSTEM) ══ */}
      <section className="section bg-alt" id="modules">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Interactive Workspace</span>
            <h2 className="section-heading">Built-in Developer Tools</h2>
            <p className="section-subtext">Powerful workflows built into a single, clean workspace deck.</p>
          </div>

          <div className="modules-list">
            {/* Module 1: Logic Lab Paths */}
            <div className="module-item">
              <div className="module-info">
                <div className="module-badge-box">
                  <Terminal size={18} />
                  <span>Logic Lab Path</span>
                </div>
                <h3 className="module-title">Structured learning campaigns</h3>
                <p className="module-desc">
                  Our curriculum consists of successive operational levels, ranging from basic control structures to advanced graph theory. Complete linear campaigns with immediate, automated feedback on every test case.
                </p>
                <ul className="module-bullets">
                  <li><Check size={14} className="bullet-check" /> 10+ progressive learning levels</li>
                  <li><Check size={14} className="bullet-check" /> Immediate test case execution feedback</li>
                  <li><Check size={14} className="bullet-check" /> Detailed algorithm breakdown analytics</li>
                </ul>
              </div>
              <div className="module-visual">
                <div className="mock-visual-box">
                  <div className="box-header">Logic Lab: Array Structures</div>
                  <div className="box-progress">
                    <span className="prog-label">Level Completion: {logicLabNode >= 4 ? "100%" : `${logicLabNode * 25}%`}</span>
                    <div className="prog-bar"><div className="prog-fill" style={{width: logicLabNode >= 4 ? "100%" : `${logicLabNode * 25}%`}} /></div>
                  </div>
                  <div className="box-nodes">
                    {[
                      { id: 1, label: "01", name: "Find Min/Max" },
                      { id: 2, label: "02", name: "Reverse Array" },
                      { id: 3, label: "03", name: "Rotate Matrix" },
                      { id: 4, label: "04", name: "Merge Intervals" },
                    ].map(node => (
                      <div 
                        key={node.id} 
                        className={`node ${logicLabNode >= node.id ? "active" : ""} ${logicLabNode === node.id ? "current" : ""}`}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => setLogicLabNode(node.id)}
                      >
                        <span>{node.label}</span>
                        <span>{node.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Module 2: Warp Drive timelines */}
            <div className="module-item reverse">
              <div className="module-info">
                <div className="module-badge-box">
                  <GitBranch size={18} />
                  <span>Warp Drive Snapshots</span>
                </div>
                <h3 className="module-title">Time-travel code timeline</h3>
                <p className="module-desc">
                  Warp Drive dynamically captures code milestones as you edit. Roll back, compare code diffs side-by-side, or restore previous versions in one click without git overhead.
                </p>
                <ul className="module-bullets">
                  <li><Check size={14} className="bullet-check" /> Instant version checkpoints in one click</li>
                  <li><Check size={14} className="bullet-check" /> Split-screen visual code comparisons</li>
                  <li><Check size={14} className="bullet-check" /> Local storage backup redundancy</li>
                </ul>
              </div>
              <div className="module-visual">
                <div className="mock-visual-box warp-visual">
                  <div className="box-header">Warp Drive Checkpoints</div>
                  <div className="timeline-trail">
                    {[
                      { id: 1, time: "09:12 PM", desc: "First compiled version" },
                      { id: 2, time: "09:20 PM", desc: "Refactored lookup loop" },
                      { id: 3, time: "09:26 PM", desc: "Current editor checkpoint" }
                    ].map(cp => (
                      <div 
                        key={cp.id}
                        className={`timeline-node ${warpCheckpoint >= cp.id ? "solved" : ""} ${warpCheckpoint === cp.id ? "current" : ""}`}
                        style={{ cursor: 'pointer', userSelect: 'none' }}
                        onClick={() => setWarpCheckpoint(cp.id)}
                      >
                        <span className="time-lbl">{cp.time}</span>
                        <span className="desc-lbl">{cp.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Module 3: Sentinel AI Assist */}
            <div className="module-item">
              <div className="module-info">
                <div className="module-badge-box">
                  <Sparkles size={18} />
                  <span>Sentinel AI Assistant</span>
                </div>
                <h3 className="module-title">Contextual runtime optimization</h3>
                <p className="module-desc">
                  Identify nested loop performance bottlenecks, resolve runtime compiler crashes, and apply recommended optimizations immediately to make your code run faster.
                </p>
                <ul className="module-bullets">
                  <li><Check size={14} className="bullet-check" /> AI-powered syntax repairs</li>
                  <li><Check size={14} className="bullet-check" /> Time/Space Big-O complexity diagnostics</li>
                  <li><Check size={14} className="bullet-check" /> Dynamic prompt customization options</li>
                </ul>
              </div>
              <div className="module-visual">
                <div className="mock-visual-box sentinel-visual">
                  <div className="box-header">Sentinel Diagnostics</div>
                  <div className="suggestion-card">
                    <span className="sug-header">Complexity Alert</span>
                    <p className="sug-body" style={{ minHeight: '54px' }}>
                      {sentinelOptimized ? (
                        <>Your solution runs in <code className="complexity success">O(N)</code> time complexity using a Hash Map.</>
                      ) : (
                        <>Your solution runs in <code className="complexity">O(N²)</code> time complexity due to nested loops. We suggest refactoring with a Hash Map to run in <code className="complexity success">O(N)</code>.</>
                      )}
                    </p>
                    <button 
                      className="sug-action-btn"
                      onClick={() => setSentinelOptimized(!sentinelOptimized)}
                    >
                      {sentinelOptimized ? "Reset Code" : "Apply Suggestion"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section className="section" id="workflow">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Workflow</span>
            <h2 className="section-heading">How BrightCode Works</h2>
            <p className="section-subtext">Three simple steps to start sharpening your engineering edge.</p>
          </div>

          <div className="workflow-steps">
            <div className="step-card">
              <span className="step-num">1</span>
              <h4 className="step-title">Select your quest</h4>
              <p className="step-desc">
                Choose from algorithmic problems, join speed-coding arenas, or launch collaborative rooms.
              </p>
            </div>
            <div className="step-card">
              <span className="step-num">2</span>
              <h4 className="step-title">Write and debug</h4>
              <p className="step-desc">
                Write solutions, get suggestions from Sentinel AI, and roll back code using Warp Drive checkpoints.
              </p>
            </div>
            <div className="step-card">
              <span className="step-num">3</span>
              <h4 className="step-title">Climb the ranks</h4>
              <p className="step-desc">
                Pass test cases to earn XP, maintain daily streaks, and lead your faction to the top.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ LEADERBOARD SECTION ══ */}
      <section className="section bg-alt" id="arena">
        <div className="section-inner">
          <div className="arena-grid">
            <div className="arena-left">
              <span className="section-tag">Competitive</span>
              <h2 className="section-heading">Rise on the Leaderboard</h2>
              <p className="section-subtext" style={{maxWidth: "100%"}}>
                Track your progress, earn experience points, and compare ranks against other software engineers on the platform.
              </p>
              <div className="arena-features">
                <div className="arena-feat-item">
                  <div className="item-dot" />
                  <span>Earn XP and rank up from Apprentice to Grandmaster.</span>
                </div>
                <div className="arena-feat-item">
                  <div className="item-dot" />
                  <span>Join Factions and compete in Faction Wars.</span>
                </div>
                <div className="arena-feat-item">
                  <div className="item-dot" />
                  <span>Gain multipliers for consistent daily streaks.</span>
                </div>
              </div>
              <button className="btn-primary" style={{marginTop: "24px"}} onClick={() => handleAuth('register')}>
                Join a Faction
              </button>
            </div>

            <div className="arena-right">
              <div className="leaderboard-card">
                <div className="card-header">
                  <Trophy size={16} className="trophy-gold" />
                  <span>Hall of Fame - Top Performers</span>
                </div>
                <div className="leaderboard-list">
                  {lbLoading ? (
                    <div className="leader-row" style={{justifyContent: "center", color: "var(--t3)", fontSize: "0.85rem", padding: "20px"}}>
                      Loading operatives...
                    </div>
                  ) : leaderboard.length > 0 ? (
                    leaderboard.map((user, idx) => {
                      const colors = ["#ef4444", "#3b82f6", "#10b981", "#a78bfa", "#f59e0b"];
                      const pillColor = colors[idx % colors.length];
                      return (
                        <div className="leader-row" key={user.username || idx}>
                          <span className="leader-rank">{idx + 1}</span>
                          <span className="leader-name">{user.username}</span>
                          <span className="leader-faction" style={{borderColor: pillColor, color: pillColor}}>
                            {user.level || "Initiate"}
                          </span>
                          <span className="leader-xp">{(user.xp || 0).toLocaleString()} XP</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="leader-row" style={{justifyContent: "center", color: "var(--t3)", fontSize: "0.85rem", padding: "20px"}}>
                      No operatives ranked yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="cta-section">
        <div className="cta-inner">
          <h2 className="cta-title">Start practicing coding now</h2>
          <p className="cta-desc">
            Sign up to access over a thousand algorithm questions, join faction wars, and code interactively with your friends.
          </p>
          <div className="cta-buttons">
            <button className="btn-primary-large" onClick={() => handleAuth('register')}>Create Free Account</button>
            <button className="btn-secondary-large" onClick={handleHub}>Browse Problems</button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="nav-logo">
                <div className="nav-logo-mark">
                  <Code2 size={16} className="logo-icon" />
                </div>
                <span className="nav-logo-name">BRIGHT<span>CODE</span></span>
              </div>
              <p className="footer-desc-text">
                A premium, modern workspace for practicing programming, running algorithms, and collaborating live.
              </p>
            </div>
            <div className="footer-link-groups">
              <div className="footer-group">
                <span className="group-title">Platform</span>
                <a href="#features">Features</a>
                <a href="#modules">Ecosystem</a>
                <a href="#workflow">Workflow</a>
              </div>
              <div className="footer-group">
                <span className="group-title">Community</span>
                <a href="#" onClick={e => e.preventDefault()}>Factions</a>
                <a href="#" onClick={e => e.preventDefault()}>Leaderboard</a>
                <a href="#" onClick={e => e.preventDefault()}>Bootcamp</a>
              </div>
              <div className="footer-group">
                <span className="group-title">About</span>
                <a href="#" onClick={e => e.preventDefault()}>Privacy Policy</a>
                <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
                <a href="#" onClick={e => e.preventDefault()}>Contact Support</a>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 BrightCode. All rights reserved.</span>
            <span>Made with precision for the modern software engineer.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}