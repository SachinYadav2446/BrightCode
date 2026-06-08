import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Code2, Users, Terminal, BookOpen, Brain, 
  Trophy, ArrowRight, Shield, Activity, ChevronRight, Play, CheckCircle,
  GitBranch, Sparkles, Flame, Check, HelpCircle
} from "lucide-react";
import API_URL from "../config";
import "./Landing.css";

export default function Landing() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState([]);
  const [lbLoading, setLbLoading] = useState(true);

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

  return (
    <div className="landing-root">
      {/* ══ NAV ══ */}
      <nav className="nav">
        <div className="nav-inner">
          {/* Logo + Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <a className="nav-logo" href="#" onClick={e => e.preventDefault()}>
              <div className="nav-logo-mark">
                <Code2 size={17} className="logo-icon" />
              </div>
              <span className="nav-logo-name">BRIGHT<span>CODE</span></span>
            </a>
            <span className="nav-status-badge">
              <span className="status-dot" />
              Live
            </span>
          </div>

          {/* Center Links */}
          <div className="nav-links">
            <a href="#features" className="nav-link">Features</a>
            <a href="#modules" className="nav-link">Modules</a>
            <a href="#workflow" className="nav-link">How it Works</a>
            <a href="#arena" className="nav-link">Leaderboard</a>
          </div>

          {/* Actions */}
          <div className="nav-actions">
            <button className="nav-btn-ghost" onClick={() => handleAuth('login')}>Sign In</button>
            <button className="nav-btn-primary" onClick={() => handleAuth('register')}>Get Started →</button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <header className="hero">
        <div className="hero-inner">
          {/* Left Column */}
          <div className="hero-left">
            <div className="hero-badge">
              <span className="badge-dot" />
              <span className="badge-text">Interactive & Collaborative Coding Platform</span>
            </div>

            <h1 className="hero-h1">
              A new way to <br />
              <span>master algorithms</span>.
            </h1>

            <p className="hero-sub">
              Practice coding, solve competitive challenges, and collaborate in real-time. Join factions, track your milestones, and code alongside your peers in an integrated environment.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" onClick={() => handleAuth('register')}>
                Join Now
                <ArrowRight size={16} />
              </button>
              <button className="btn-secondary" onClick={handleHub}>
                Explore Challenges
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="hero-stats">
              <div className="h-stat">
                <span className="h-stat-val">1.2k+</span>
                <span className="h-stat-lbl">Questions</span>
              </div>
              <div className="h-stat">
                <span className="h-stat-val">8</span>
                <span className="h-stat-lbl">Active Factions</span>
              </div>
              <div className="h-stat">
                <span className="h-stat-val">&lt;50ms</span>
                <span className="h-stat-lbl">Sync Latency</span>
              </div>
            </div>
          </div>

          {/* Right Column: Code Mockup Panel */}
          <div className="hero-right">
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
                      <strong>Output:</strong> [0,1]{"\n"}
                      <strong>Explanation:</strong> nums[0] + nums[1] == 9, we return [0, 1].
                    </pre>
                  </div>
                </div>
              </div>

              {/* Right Mock Panel: Code Editor */}
              <div className="mock-editor-panel">
                <div className="mock-panel-header">
                  <span className="tab active">solution.py</span>
                  <span className="tab">solution.js</span>
                  <div className="run-controls">
                    <button className="btn-run-small"><Play size={10} fill="currentColor" /> Run</button>
                  </div>
                </div>
                <div className="mock-editor-body">
                  <div className="code-line"><span className="ln">1</span><span className="ck">class</span> <span className="cf">Solution</span>:</div>
                  <div className="code-line"><span className="ln">2</span>    <span className="ck">def</span> <span className="cf">twoSum</span>(self, nums: List[int], target: int) -&gt; List[int]:</div>
                  <div className="code-line"><span className="ln">3</span>        seen = {}</div>
                  <div className="code-line"><span className="ln">4</span>        <span className="ck">for</span> i, num <span className="ck">in</span> enumerate(nums):</div>
                  <div className="code-line"><span className="ln">5</span>            remaining = target - num</div>
                  <div className="code-line"><span className="ln">6</span>            <span className="ck">if</span> remaining <span className="ck">in</span> seen:</div>
                  <div className="code-line"><span className="ln">7</span>                <span className="ck">return</span> [seen[remaining], i]</div>
                  <div className="code-line"><span className="ln">8</span>            seen[num] = i</div>
                  <div className="code-line"><span className="ln">9</span>        <span className="ck">return</span> []</div>
                </div>
                <div className="mock-console">
                  <div className="console-header">
                    <CheckCircle size={12} className="success-icon" />
                    <span>Test Cases Passed (3/3)</span>
                  </div>
                  <div className="console-result">
                    Runtime: 38 ms (Beats 94.2% of Python3 submissions)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══ KEY CAPABILITIES ══ */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Core Features</span>
            <h2 className="section-heading">Designed for modern developers</h2>
            <p className="section-subtext">Everything you need to practice, learn, and excel in coding.</p>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feat-icon-box blue-box">
                <Users size={20} />
              </div>
              <h3 className="feat-title">Collaborative Forge</h3>
              <p className="feat-desc">
                WS-based instant document sync. Work in pairs, coordinate sprint reviews, and pair program in shared code spaces with low-latency updates.
              </p>
            </div>

            <div className="feature-card">
              <div className="feat-icon-box orange-box">
                <Trophy size={20} />
              </div>
              <h3 className="feat-title">Code Arena</h3>
              <p className="feat-desc">
                Time-attack competitive coding challenges. Race against the clock, submit optimized algorithms, build streaks, and rise on the global leaderboards.
              </p>
            </div>

            <div className="feature-card">
              <div className="feat-icon-box green-box">
                <Brain size={20} />
              </div>
              <h3 className="feat-title">The Sentinel</h3>
              <p className="feat-desc">
                An integrated AI copilot that reviews syntax, suggests complexity optimizations, and helps you refactor algorithms directly inside the editor.
              </p>
            </div>

            <div className="feature-card">
              <div className="feat-icon-box purple-box">
                <BookOpen size={20} />
              </div>
              <h3 className="feat-title">CodeVault Notes</h3>
              <p className="feat-desc">
                A personal knowledge base supporting markdown notes, Excalidraw whiteboards, inline code segments, and folder trees for structured revision sheets.
              </p>
            </div>

            <div className="feature-card">
              <div className="feat-icon-box red-box">
                <Activity size={20} />
              </div>
              <h3 className="feat-title">Contribution Analytics</h3>
              <p className="feat-desc">
                A daily contribution grid displaying historical XP gain levels, streak metrics, and module-specific level indices so you can visualize your progression.
              </p>
            </div>

            <div className="feature-card">
              <div className="feat-icon-box gold-box">
                <Shield size={20} />
              </div>
              <h3 className="feat-title">Isolated Execution</h3>
              <p className="feat-desc">
                Run and compile submissions in isolated code sandboxes with execution timeouts and safety guidelines. Supports Python, Java, JS, and C++.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ NEW CONTENT: THE COMMAND DECK (MODULES) ══ */}
      <section className="section bg-alt" id="modules">
        <div className="section-inner">
          <div className="section-header">
            <span className="section-tag">Interactive Workspace</span>
            <h2 className="section-heading">The BrightCode Ecosystem</h2>
            <p className="section-subtext">Powerful workflows built into a single, clean workspace deck.</p>
          </div>

          <div className="modules-list">
            <div className="module-item">
              <div className="module-info">
                <div className="module-badge-box">
                  <Terminal size={18} />
                  <span>Logic Lab (100-Level Campaign)</span>
                </div>
                <h3 className="module-title">A progressive path to code mastery</h3>
                <p className="module-desc">
                  Our custom curriculum consists of successive operational phases, ranging from basic control structures to advanced graph theory. Each step contains interactive quests to validate your syntactic and algorithmic expertise.
                </p>
                <ul className="module-bullets">
                  <li><Check size={14} className="bullet-check" /> 10 progressive linear campaign phases</li>
                  <li><Check size={14} className="bullet-check" /> Immediate test case execution feedback</li>
                  <li><Check size={14} className="bullet-check" /> Detailed algorithm breakdown analytics</li>
                </ul>
              </div>
              <div className="module-visual">
                <div className="mock-visual-box">
                  <div className="box-header">Logic Lab Phase 2: Array Structures</div>
                  <div className="box-progress">
                    <span className="prog-label">Level Completion: 78%</span>
                    <div className="prog-bar"><div className="prog-fill" style={{width: "78%"}} /></div>
                  </div>
                  <div className="box-nodes">
                    <div className="node active"><span>01</span><span>Find Min/Max</span></div>
                    <div className="node active"><span>02</span><span>Reverse Array</span></div>
                    <div className="node active current"><span>03</span><span>Rotate Matrix</span></div>
                    <div className="node"><span>04</span><span>Merge Intervals</span></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="module-item reverse">
              <div className="module-info">
                <div className="module-badge-box">
                  <GitBranch size={18} />
                  <span>Warp Drive</span>
                </div>
                <h3 className="module-title">Time-travel code snapshotting</h3>
                <p className="module-desc">
                  Never worry about breaking your solutions again. Warp Drive captures editor snapshots at milestones, giving you an interactive chronological commit timeline to rollback or view code diffs on the fly.
                </p>
                <ul className="module-bullets">
                  <li><Check size={14} className="bullet-check" /> Instant version checkpoints in one click</li>
                  <li><Check size={14} className="bullet-check" /> Split-screen visual code comparisons</li>
                  <li><Check size={14} className="bullet-check" /> Local storage backup redundancy</li>
                </ul>
              </div>
              <div className="module-visual">
                <div className="mock-visual-box warp-visual">
                  <div className="box-header">Warp Drive Chronology</div>
                  <div className="timeline-trail">
                    <div className="timeline-node solved">
                      <span className="time-lbl">09:12 PM</span>
                      <span className="desc-lbl">First compiled version</span>
                    </div>
                    <div className="timeline-node solved">
                      <span className="time-lbl">09:20 PM</span>
                      <span className="desc-lbl">Refactored lookup loop</span>
                    </div>
                    <div className="timeline-node current">
                      <span className="time-lbl">09:26 PM</span>
                      <span className="desc-lbl">Current editor checkpoint</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="module-item">
              <div className="module-info">
                <div className="module-badge-box">
                  <Sparkles size={18} />
                  <span>Sentinel AI Assistant</span>
                </div>
                <h3 className="module-title">Contextual runtime optimization</h3>
                <p className="module-desc">
                  Sentinel reads your Monaco editor buffer to diagnose code execution runtime errors, identify potential complexity traps, and offer custom refactoring code suggestions in seconds.
                </p>
                <ul className="module-bullets">
                  <li><Check size={14} className="bullet-check" /> Interactive inline code syntax repairs</li>
                  <li><Check size={14} className="bullet-check" /> Time/Space Big-O complexity diagnostics</li>
                  <li><Check size={14} className="bullet-check" /> Dynamic prompt customization options</li>
                </ul>
              </div>
              <div className="module-visual">
                <div className="mock-visual-box sentinel-visual">
                  <div className="box-header">Sentinel Diagnostics</div>
                  <div className="suggestion-card">
                    <span className="sug-header">Complexity Alert</span>
                    <p className="sug-body">
                      Your solution runs in <code className="complexity">O(N²)</code> time complexity due to nested loops. We suggest refactoring with a Hash Map to run in <code className="complexity success">O(N)</code>.
                    </p>
                    <button className="sug-action-btn">Apply Suggestion</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ NEW CONTENT: HOW IT WORKS ══ */}
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
                Choose from over a thousand algorithmic problems, join competitive arcade arenas, or launch a pair programming sandbox session.
              </p>
            </div>
            <div className="step-card">
              <span className="step-num">2</span>
              <h4 className="step-title">Write and debug</h4>
              <p className="step-desc">
                Code with live sync, format rich text notes, and use Excalidraw blocks to design complex systems in our sandbox deck.
              </p>
            </div>
            <div className="step-card">
              <span className="step-num">3</span>
              <h4 className="step-title">Climb the leaderboard</h4>
              <p className="step-desc">
                Pass test cases to claim XP, build consistent daily activity streaks, and collaborate to elevate your Faction's global rank.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ══ COMPETITIVE LEADERBOARD SECTION ══ */}
      <section className="section bg-alt" id="arena">
        <div className="section-inner arena-grid">
          <div className="arena-left">
            <span className="section-tag">Competitive</span>
            <h2 className="section-heading">Rise on the Leaderboard</h2>
            <p className="section-subtext" style={{maxWidth: "100%"}}>
              Build your faction, challenge other syndicates, and compete in scheduled coding battles. Rack up XP by solving problems and secure your spot in the Hall of Fame podium.
            </p>
            <div className="arena-features">
              <div className="arena-feat-item">
                <div className="item-dot" />
                <span>Earn XP and rank up from Apprentice to Grandmaster.</span>
              </div>
              <div className="arena-feat-item">
                <div className="item-dot" />
                <span>Join Factions (Alpha, Omega, Sigma) and compete in Faction Wars.</span>
              </div>
              <div className="arena-feat-item">
                <div className="item-dot" />
                <span>Gain performance multipliers for consistent daily streaks.</span>
              </div>
            </div>
            <button className="btn-primary" style={{marginTop: "24px"}} onClick={() => handleAuth('register')}>
              Join a Faction
              <ArrowRight size={16} />
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
                  <div className="leader-row" style={{justifyContent: "center", color: "var(--text-muted)", fontSize: "0.85rem", padding: "20px"}}>
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
                  <div className="leader-row" style={{justifyContent: "center", color: "var(--text-muted)", fontSize: "0.85rem", padding: "20px"}}>
                    No operatives ranked yet.
                  </div>
                )}
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