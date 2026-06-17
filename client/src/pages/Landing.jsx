import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Code2, Users, Terminal, BookOpen, Brain, 
  Trophy, ArrowRight, Shield, Activity, ChevronRight, Play, CheckCircle,
  GitBranch, Sparkles, Flame, Check, HelpCircle, Menu, X, ArrowUpRight, Cpu
} from "lucide-react";
import API_URL from "../config";
import CodeBrightLogo from "../components/CodeBrightLogo";
import "./Landing.css";

// ── CODE SNIPPETS FOR HERO TYPING TERMINAL ────────────────────────────────
const CODE_SNIPPETS = [
  {
    lang: "python",
    file: "two_sum.py",
    lines: [
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
    console: "Test Cases Passed (3/3) | Runtime: 32 ms (Beats 98.4% of Python3)"
  },
  {
    lang: "javascript",
    file: "quick_sort.js",
    lines: [
      "function quickSort(arr) {",
      "  if (arr.length <= 1) return arr;",
      "  const pivot = arr[arr.length - 1];",
      "  const left = [], right = [];",
      "  for (let i = 0; i < arr.length - 1; i++) {",
      "    if (arr[i] < pivot) left.push(arr[i]);",
      "    else right.push(arr[i]);",
      "  }",
      "  return [...quickSort(left), pivot, ...quickSort(right)];",
      "}"
    ],
    console: "Test Cases Passed (5/5) | Runtime: 48 ms (Beats 94.6% of Node.js)"
  },
  {
    lang: "cpp",
    file: "binary_search.cpp",
    lines: [
      "int binarySearch(vector<int>& nums, int target) {",
      "    int left = 0, right = nums.size() - 1;",
      "    while (left <= right) {",
      "        int mid = left + (right - left) / 2;",
      "        if (nums[mid] == target) return mid;",
      "        if (nums[mid] < target) left = mid + 1;",
      "        else right = mid - 1;",
      "    }",
      "    return -1;",
      "}"
    ],
    console: "Test Cases Passed (4/4) | Runtime: 14 ms (Beats 97.2% of C++)"
  }
];

// Typewriter Editor Component
const TypewriterEditor = () => {
  const [snippetIndex, setSnippetIndex] = useState(0);
  const [typedLines, setTypedLines] = useState([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [showConsole, setShowConsole] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const snippet = CODE_SNIPPETS[snippetIndex];

  useEffect(() => {
    let timer;
    if (!isDeleting) {
      if (currentLineIndex < snippet.lines.length) {
        const targetLine = snippet.lines[currentLineIndex];
        if (currentCharIndex < targetLine.length) {
          timer = setTimeout(() => {
            setTypedLines(prev => {
              const next = [...prev];
              if (!next[currentLineIndex]) {
                next[currentLineIndex] = "";
              }
              next[currentLineIndex] += targetLine[currentCharIndex];
              return next;
            });
            setCurrentCharIndex(prev => prev + 1);
          }, 20);
        } else {
          timer = setTimeout(() => {
            setCurrentLineIndex(prev => prev + 1);
            setCurrentCharIndex(0);
          }, 80);
        }
      } else {
        setShowConsole(true);
        timer = setTimeout(() => {
          setIsDeleting(true);
        }, 3200);
      }
    } else {
      setShowConsole(false);
      if (typedLines.length > 0) {
        timer = setTimeout(() => {
          setTypedLines(prev => {
            const next = [...prev];
            const lastLine = next[next.length - 1];
            if (lastLine.length > 0) {
              next[next.length - 1] = lastLine.slice(0, -1);
            } else {
              next.pop();
            }
            return next;
          });
          if (typedLines[typedLines.length - 1].length === 0) {
            setCurrentLineIndex(prev => Math.max(0, prev - 1));
          }
        }, 8);
      } else {
        setIsDeleting(false);
        setCurrentLineIndex(0);
        setCurrentCharIndex(0);
        setSnippetIndex(prev => (prev + 1) % CODE_SNIPPETS.length);
      }
    }
    return () => clearTimeout(timer);
  }, [currentLineIndex, currentCharIndex, isDeleting, snippetIndex, typedLines]);

  return (
    <div className="mock-workspace glassmorphic">
      {/* Problem Statement side */}
      <div className="mock-problem-panel">
        <div className="mock-panel-header">
          <span className="panel-title">Problem Statement</span>
        </div>
        <div className="mock-panel-body">
          <h3 className="prob-title">Two Sum</h3>
          <div className="prob-tags">
            <span className="tag-easy">Easy</span>
            <span className="tag-meta">Algorithms</span>
          </div>
          <p className="prob-desc">
            Find indices of two numbers in an array that sum up to a specific target value.
          </p>
          <div className="prob-example">
            <span className="ex-title">Example:</span>
            <pre>
              nums = [2, 7, 11, 15]{"\n"}
              target = 9{"\n"}
              Output: [0, 1]
            </pre>
          </div>
        </div>
      </div>

      {/* Editor Mock side */}
      <div className="mock-editor-panel">
        <div className="mock-panel-header">
          <span className="tab active">{snippet.file}</span>
          <div className="run-controls">
            <span className="btn-run-small"><Play size={10} fill="currentColor" /> Live Run</span>
          </div>
        </div>
        <div className="mock-editor-body">
          {typedLines.map((line, idx) => (
            <div className="code-line" key={idx}>
              <span className="ln">{idx + 1}</span>
              <span className="code-text">{line}</span>
            </div>
          ))}
          <span className="cursor">|</span>
        </div>
        <div className={`mock-console ${showConsole ? "show" : ""}`}>
          <div className="console-header">
            <CheckCircle size={12} className="success-icon" />
            <span>Success</span>
          </div>
          <div className="console-result">{snippet.console}</div>
        </div>
      </div>
    </div>
  );
};

export default function Landing() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Interactive states for playgrounds
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

  // Animation configurations
  const pageTransition = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="landing-root grid-bg-effect">
      {/* Ambient background glows */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      {/* ══ NAV BAR ══ */}
      <nav className="nav glassmorphic">
        <div className="nav-inner">
          <a className="nav-logo" href="#" onClick={e => e.preventDefault()}>
            <CodeBrightLogo size="small" />
          </a>

          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#modules" className="nav-link">Ecosystem</a>
            <a href="#workflow" className="nav-link">How it Works</a>
            <a href="#arena" className="nav-link">Leaderboard</a>
          </div>

          <div className="nav-actions">
            <button className="nav-btn-ghost" onClick={() => handleAuth('login')}>Sign In</button>
            <button className="nav-btn-primary" onClick={() => handleAuth('register')}>Get Started</button>
          </div>

          <button className="nav-mobile-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div 
              className="nav-mobile-menu glassmorphic"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <a href="#features" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#modules" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Ecosystem</a>
              <a href="#workflow" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>How it Works</a>
              <a href="#arena" className="nav-mobile-link" onClick={() => setMobileMenuOpen(false)}>Leaderboard</a>
              <hr className="nav-mobile-divider" />
              <button className="nav-mobile-btn-ghost" onClick={() => { handleAuth('login'); setMobileMenuOpen(false); }}>Sign In</button>
              <button className="nav-mobile-btn-primary" onClick={() => { handleAuth('register'); setMobileMenuOpen(false); }}>Get Started</button>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ══ HERO SECTION ══ */}
      <header className="hero">
        <div className="hero-inner">
          <motion.div 
            className="hero-left"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="hero-badge animate-pulse-border">
              <span className="badge-dot"></span>
              <span className="badge-text">✨ Redesigned for High Fidelity</span>
            </div>
            
            <h1 className="hero-h1">
              Elevate Your Code.<br />
              <span>Conquer Technical Challenges</span>.
            </h1>

            <p className="hero-sub">
              An all-in-one dark workspace built for developers. Speed-run competitive programming tracks, collaborate via WebRTC visual streams, version check via Warp Drive snapshots, and optimize code utilizing Sentinel AI diagnostics.
            </p>

            <div className="hero-actions">
              <button className="btn-primary glow-red-hover" onClick={() => handleAuth('register')}>
                Start Coding for Free <ArrowRight size={18} />
              </button>
              <button className="btn-secondary" onClick={handleHub}>
                <Play size={16} fill="currentColor" /> Sandbox Demo
              </button>
            </div>

            <div className="hero-stats">
              <div className="h-stat">
                <span className="h-stat-val">2,500+</span>
                <span className="h-stat-lbl">Coding Levels</span>
              </div>
              <div className="h-stat">
                <span className="h-stat-val">10+</span>
                <span className="h-stat-lbl">Core Languages</span>
              </div>
              <div className="h-stat">
                <span className="h-stat-val">Real-Time</span>
                <span className="h-stat-lbl">Sync Engine</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            className="hero-right"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <TypewriterEditor />
          </motion.div>
        </div>
      </header>

      {/* ══ BENTO FEATURES SECTION ══ */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag"><Cpu size={14} /> Power Grid</span>
            <h2 className="section-heading">Designed for Peak Engineering</h2>
            <p className="section-subtext">A high-performance environment loaded with state-of-the-art diagnostic and collaboration utilities.</p>
          </div>

          <motion.div 
            className="bento-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Bento Box 1 - Smart Editor (Double size) */}
            <motion.div className="bento-card bento-w2" variants={cardVariants}>
              <div className="bento-glow bg-blue-glow"></div>
              <div className="bento-content">
                <div className="bento-icon blue-box"><Code2 size={24} /></div>
                <h3 className="bento-title">Smart Code Editor</h3>
                <p className="bento-desc">Write structured code with instant syntax highlights, custom tabs, auto-saving buffers, and split-pane output panels.</p>
                <div className="bento-visual mock-editor-preview">
                  <div className="editor-dots"><span className="dot"></span><span className="dot"></span><span className="dot"></span></div>
                  <pre className="syntax-code">
                    <code><span className="c-blue">const</span> bubbleSort = (arr) =&gt; {"{"}</code>{"\n"}
                    <code>  <span className="c-red">let</span> swapped;</code>{"\n"}
                    <code>  <span className="c-blue">do</span> {"{"} swapped = <span className="c-red">false</span>; ...</code>
                  </pre>
                </div>
              </div>
            </motion.div>

            {/* Bento Box 2 - Arenas */}
            <motion.div className="bento-card" variants={cardVariants}>
              <div className="bento-glow bg-red-glow"></div>
              <div className="bento-content">
                <div className="bento-icon orange-box"><Trophy size={24} /></div>
                <h3 className="bento-title">Speed Arenas</h3>
                <p className="bento-desc">Go head-to-head in synchronized fast-solve coding duels against developers worldwide.</p>
                <div className="bento-visual mock-arena-preview">
                  <div className="arena-timer"><Flame size={12} /><span>02:14.50</span></div>
                  <div className="arena-opponent"><span>Opponent Score:</span><strong>120 XP</strong></div>
                </div>
              </div>
            </motion.div>

            {/* Bento Box 3 - Sentinel AI */}
            <motion.div className="bento-card" variants={cardVariants}>
              <div className="bento-glow bg-green-glow"></div>
              <div className="bento-content">
                <div className="bento-icon green-box"><Brain size={24} /></div>
                <h3 className="bento-title">Sentinel AI</h3>
                <p className="bento-desc">Identify Big-O scaling, loops constraints, and compile glitches in real-time.</p>
                <div className="bento-visual mock-ai-preview">
                  <div className="complexity-badge">O(N log N)</div>
                  <div className="badge-glow"></div>
                </div>
              </div>
            </motion.div>

            {/* Bento Box 4 - Collab Rooms (Double size) */}
            <motion.div className="bento-card bento-w2" variants={cardVariants}>
              <div className="bento-glow bg-purple-glow"></div>
              <div className="bento-content">
                <div className="bento-icon purple-box"><Users size={24} /></div>
                <h3 className="bento-title">WebRTC Collab Rooms</h3>
                <p className="bento-desc">Share code workspace states, drawing canvas panels, and clear voice/video feeds with zero configuration.</p>
                <div className="bento-visual mock-collab-preview">
                  <div className="video-tile active">
                    <span className="dot-live"></span>
                    <span className="tile-name">You (Camera)</span>
                  </div>
                  <div className="video-tile">
                    <span className="tile-name">Peer #1</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Bento Box 5 - Note Vault */}
            <motion.div className="bento-card" variants={cardVariants}>
              <div className="bento-glow bg-gold-glow"></div>
              <div className="bento-content">
                <div className="bento-icon purple-box"><BookOpen size={24} /></div>
                <h3 className="bento-title">Note Vault</h3>
                <p className="bento-desc">Export formatted study sheets and draw diagrams on responsive infinite whiteboards.</p>
                <div className="bento-visual mock-vault-preview">
                  <div className="vault-check"><CheckCircle size={12} /><span>System Design.md</span></div>
                  <div className="vault-check"><CheckCircle size={12} /><span>DSA Graphs.draw</span></div>
                </div>
              </div>
            </motion.div>

            {/* Bento Box 6 - Proctoring */}
            <motion.div className="bento-card" variants={cardVariants}>
              <div className="bento-glow bg-red-glow"></div>
              <div className="bento-content">
                <div className="bento-icon gold-box"><Shield size={24} /></div>
                <h3 className="bento-title">Smart Proctoring</h3>
                <p className="bento-desc">Lock screens, check focus tabs, and audit camera metrics for tests.</p>
                <div className="bento-visual mock-proctor-preview">
                  <div className="proctor-bar"><span className="lbl">Focus:</span><strong>98%</strong></div>
                  <div className="proctor-bar"><span className="lbl">Face:</span><strong className="c-green">Detected</strong></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ INTERACTIVE ECOSYSTEM SECTION ══ */}
      <section className="section bg-alt" id="modules">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag"><Sparkles size={14} /> Interactive Deck</span>
            <h2 className="section-heading">Experience the Workspace</h2>
            <p className="section-subtext">Click on the visualizers below to interact with our three core developer workspace modules.</p>
          </div>

          <div className="modules-list">
            
            {/* Interactive Module 1: Logic Lab Node Navigator */}
            <div className="module-item">
              <motion.div 
                className="module-info"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="module-badge-box">
                  <Terminal size={18} />
                  <span>Logic Lab Paths</span>
                </div>
                <h3 className="module-title">Structured Algorithmic Levels</h3>
                <p className="module-desc">
                  Climb progressive levels tailored to evaluate data structures, flow conditions, and dynamic algorithms. Run test sequences and get instant analytical feedback.
                </p>
                <div className="interactive-hint">👉 Click any node in the panel to inspect active challenges!</div>
              </motion.div>

              <div className="module-visual">
                <div className="mock-visual-box glassmorphic">
                  <div className="box-header">Logic Lab: Tree Structures</div>
                  <div className="box-progress">
                    <span className="prog-label">Nodes Completion: {logicLabNode >= 4 ? "100%" : `${logicLabNode * 25}%`}</span>
                    <div className="prog-bar">
                      <div className="prog-fill" style={{ width: logicLabNode >= 4 ? "100%" : `${logicLabNode * 25}%` }}></div>
                    </div>
                  </div>
                  <div className="box-nodes">
                    {[
                      { id: 1, title: "01: BST Insertion" },
                      { id: 2, title: "02: Lowest Common Ancestor" },
                      { id: 3, title: "03: Level Order Traversal" },
                      { id: 4, title: "04: Invert Binary Tree" }
                    ].map(node => (
                      <button 
                        key={node.id} 
                        className={`node-interactive ${logicLabNode >= node.id ? "active" : ""} ${logicLabNode === node.id ? "current" : ""}`}
                        onClick={() => setLogicLabNode(node.id)}
                      >
                        <span>{node.title}</span>
                        {logicLabNode >= node.id ? <Check size={14} className="c-green" /> : <HelpCircle size={14} className="c-muted" />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Module 2: Warp Drive Time Machine */}
            <div className="module-item reverse">
              <motion.div 
                className="module-info"
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="module-badge-box">
                  <GitBranch size={18} />
                  <span>Warp Drive Checkpoints</span>
                </div>
                <h3 className="module-title">Local Version Time-Travel</h3>
                <p className="module-desc">
                  Compare visual code changes side-by-side or rollback snapshots without typing Git push commands. Snapshots are auto-buffered as you construct files.
                </p>
                <div className="interactive-hint">👉 Hover/Click checkpoint nodes below to see previous changes!</div>
              </motion.div>

              <div className="module-visual">
                <div className="mock-visual-box warp-visual glassmorphic">
                  <div className="box-header">Time Machine timeline</div>
                  <div className="timeline-trail">
                    {[
                      { id: 1, time: "10:14 PM", desc: "Base iterative function initialized." },
                      { id: 2, time: "10:22 PM", desc: "Refactored lookup keys to hashmap." },
                      { id: 3, time: "10:30 PM", desc: "Sentinel optimizations successfully applied." }
                    ].map(node => (
                      <button 
                        key={node.id} 
                        className={`timeline-node-btn ${warpCheckpoint >= node.id ? "solved" : ""} ${warpCheckpoint === node.id ? "current" : ""}`}
                        onClick={() => setWarpCheckpoint(node.id)}
                      >
                        <div className="tl-badge"></div>
                        <div className="tl-content">
                          <span className="time-lbl">{node.time}</span>
                          <span className="desc-lbl">{node.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive Module 3: Sentinel Code Refactoring */}
            <div className="module-item">
              <motion.div 
                className="module-info"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="module-badge-box">
                  <Sparkles size={18} />
                  <span>Sentinel AI Diagnostician</span>
                </div>
                <h3 className="module-title">Contextual Big-O Repairs</h3>
                <p className="module-desc">
                  Identify nested loop performance bottlenecks and apply instant code optimization proposals to save processor execution cycles.
                </p>
                <div className="interactive-hint">👉 Click "Optimize" in the panel below to refactor the code in real-time!</div>
              </motion.div>

              <div className="module-visual">
                <div className="mock-visual-box sentinel-visual glassmorphic">
                  <div className="box-header">Sentinel Diagnostics</div>
                  <div className="suggestion-card">
                    <span className="sug-header">Complexity Alert</span>
                    <pre className="sug-code">
                      {sentinelOptimized ? (
                        <code>
                          <span className="c-blue">def</span> find_dup(nums):{"\n"}
                          {"    "}seen = set(){"\n"}
                          {"    "}<span className="c-blue">for</span> n <span className="c-blue">in</span> nums:{"\n"}
                          {"        "}<span className="c-blue">if</span> n <span className="c-blue">in</span> seen: <span className="c-blue">return</span> n{"\n"}
                          {"        "}seen.add(n)
                        </code>
                      ) : (
                        <code>
                          <span className="c-blue">def</span> find_dup(nums):{"\n"}
                          {"    "}<span className="c-blue">for</span> i <span className="c-blue">in</span> range(len(nums)):{"\n"}
                          {"        "}<span className="c-blue">for</span> j <span className="c-blue">in</span> range(i+1, len(nums)):{"\n"}
                          {"            "}<span className="c-blue">if</span> nums[i] == nums[j]:{"\n"}
                          {"                "}<span className="c-blue">return</span> nums[i]
                        </code>
                      )}
                    </pre>
                    <p className="sug-body">
                      Complexity:{" "}
                      <strong className={`complexity-tag ${sentinelOptimized ? "optimized" : "slow"}`}>
                        {sentinelOptimized ? "O(N) - Linear" : "O(N²) - Quadratic"}
                      </strong>
                    </p>
                    <button 
                      className="sug-action-btn glow-red-hover"
                      onClick={() => setSentinelOptimized(!sentinelOptimized)}
                    >
                      {sentinelOptimized ? "Reset Code" : "Optimize Code"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ══ HOW IT WORKS SECTION ══ */}
      <section className="section" id="workflow">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag"><Activity size={14} /> Path Mechanics</span>
            <h2 className="section-heading">How BrightCode Works</h2>
            <p className="section-subtext">Start leveling up your coding skills in three simple steps.</p>
          </div>

          <div className="workflow-steps">
            <div className="step-card glassmorphic">
              <span className="step-num">01</span>
              <h4 className="step-title">Select Your Path</h4>
              <p className="step-desc">Pick algorithm skill tracks, register for live speed challenges, or create collaborative team workspaces.</p>
            </div>
            <div className="step-card glassmorphic">
              <span className="step-num">02</span>
              <h4 className="step-title">Solve & Optimize</h4>
              <p className="step-desc">Write clean answers using help from Sentinel AI diagnostics, comparing history changes with Warp Drive.</p>
            </div>
            <div className="step-card glassmorphic">
              <span className="step-num">03</span>
              <h4 className="step-title">Climb Ranks</h4>
              <p className="step-desc">Pass automated code compile tests to score XP, maintain daily streaks, and secure top global ranks.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ LEADERBOARD SECTION ══ */}
      <section className="section bg-alt" id="arena">
        <div className="section-inner">
          <div className="arena-grid">
            <div className="arena-left">
              <span className="section-tag"><Trophy size={14} /> Competitive</span>
              <h2 className="section-heading">Operative Rankings</h2>
              <p className="section-subtext">Join active factions, compete in global speed-coding rounds, and rank up through the Leaderboard tiers.</p>
              
              <div className="arena-features">
                <div className="arena-feat-item">
                  <div className="item-dot"></div>
                  <span>Scale operative brackets from Initiate up to Grandmaster.</span>
                </div>
                <div className="arena-feat-item">
                  <div className="item-dot"></div>
                  <span>Form factions to coordinate speed runs and secure rewards.</span>
                </div>
                <div className="arena-feat-item">
                  <div className="item-dot"></div>
                  <span>Score score-multipliers by logging consecutive coding streaks.</span>
                </div>
              </div>

              <button className="btn-primary glow-red-hover" style={{ marginTop: "24px" }} onClick={() => handleAuth('register')}>
                Register as Operative
              </button>
            </div>

            <div className="arena-right">
              <div className="leaderboard-card glassmorphic">
                <div className="card-header">
                  <Trophy size={16} className="trophy-gold" />
                  <span>Operatives Hall of Fame</span>
                </div>
                <div className="leaderboard-list">
                  {lbLoading ? (
                    <div className="leader-row loading">Loading operatives leaderboard...</div>
                  ) : leaderboard.length > 0 ? (
                    leaderboard.map((user, idx) => {
                      const rankColors = ["#f59e0b", "#94a3b8", "#b45309", "#a78bfa", "#ef4444"];
                      const userColor = rankColors[idx] || "rgba(255,255,255,0.4)";
                      return (
                        <div className="leader-row" key={user.username || idx}>
                          <span className="leader-rank" style={{ color: userColor }}>0{idx + 1}</span>
                          <span className="leader-name">{user.username}</span>
                          <span className="leader-faction" style={{ borderColor: userColor, color: userColor }}>
                            {user.level || "Initiate"}
                          </span>
                          <span className="leader-xp">{(user.xp || 0).toLocaleString()} XP</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="leader-row empty">No operatives ranked in this bracket yet.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA SECTION ══ */}
      <section className="cta-section">
        <div className="cta-inner glassmorphic">
          <h2 className="cta-title">Ready to level up your engineering skills?</h2>
          <p className="cta-desc">Join thousands of software engineers practice-solving DSA puzzles, competing in coding wars, and scaling collaborative networks.</p>
          <div className="cta-buttons">
            <button className="btn-primary glow-red-hover" onClick={() => handleAuth('register')}>Create Operative Account</button>
            <button className="btn-secondary" onClick={handleHub}>Explore Sandbox Problems</button>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-top">
            <div className="footer-brand">
              <div className="footer-logo">
                <Code2 size={20} className="logo-icon-red" />
                <span className="logo-text">BRIGHT<span>CODE</span></span>
              </div>
              <p className="footer-desc-text">
                A high-fidelity developer workspace built for competitive programming, WebRTC team collaboration, and AI diagnostics.
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
                <span className="group-title">Operative</span>
                <a href="#" onClick={e => e.preventDefault()}>Factions</a>
                <a href="#" onClick={e => e.preventDefault()}>Leaderboard</a>
                <a href="#" onClick={e => e.preventDefault()}>Arenas</a>
              </div>
              <div className="footer-group">
                <span className="group-title">About</span>
                <a href="#" onClick={e => e.preventDefault()}>Privacy Agreement</a>
                <a href="#" onClick={e => e.preventDefault()}>Terms of Service</a>
                <a href="#" onClick={e => e.preventDefault()}>Support Tickets</a>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span>© 2026 BrightCode. Engineered for performance.</span>
            <span>Zero dependencies compile target mode.</span>
          </div>
        </div>
      </footer>

    </div>
  );
}