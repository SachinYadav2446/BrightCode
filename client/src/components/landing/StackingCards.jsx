import React from "react";
import { ArrowUpRight, Swords, School, ShieldAlert, Cpu } from "lucide-react";
import { RabbitHoleButton } from "./RabbitHole";

const PLATFORM_PILLARS = [
  {
    number: "01",
    tag: "ESPORTS ARENA MATRIX",
    title: "1v1, 2v2 & 4v4 Real-Time Ranked Duels",
    blurb: "High-intensity head-to-head coding duels with real-time keystroke telemetry.",
    description: "Built for competitive developers. Experience sub-10ms binary WebSocket synchronization, live syntax trees, auto-advancing test suites, and dynamic Elo progression. Compete in Faction Wars or climb the global Hall of Fame.",
    stack: ["Monaco Core v0.52", "WebSockets Binary", "Docker Sandboxes", "Redis Elo Engine"],
    icon: Swords,
    liveBadge: "RANKED QUEUE LIVE",
    actionLabel: "Launch 1v1 Ranked Match",
    actionTarget: "/auth",
    cursorNote: "Join 1v1 ranked queue with live tests ⚔️",
    accentClass: "badge-rose"
  },
  {
    number: "02",
    tag: "CAMPUS TESTING PLATFORM",
    title: "Institutional Examination Engine (200-300+ Students)",
    blurb: "Battle-tested campus portal tailored for universities, colleges, and placement drives.",
    description: "Faculty coordinators can schedule time-gated test suites, batch-onboard thousands of student roll numbers, and view real-time cheat telemetry. Students sign in with institutional roll numbers, eliminating account friction.",
    stack: ["Batch Student CSV", "Role-Based Auth", "Faculty Analytics", "PostgreSQL ACID"],
    icon: School,
    liveBadge: "CAMPUS GATEWAY READY",
    actionLabel: "Access College Portal",
    actionTarget: "/portal",
    cursorNote: "University roll number & coordinator dashboard 🏫",
    accentClass: "badge-emerald"
  },
  {
    number: "03",
    tag: "AI SENTINEL PROCTORING",
    title: "Multi-Modal AI Anti-Cheat & Originality Sentinel",
    blurb: "Zero-compromise automated proctoring running directly in browser workers.",
    description: "Continuously monitors multi-face detections, eye gaze deviation, tab and window switching, devtools inspection, and copy-paste clipboard hijacking. GPT-powered code originality analysis audits AST syntax trees for LLM artifacts.",
    stack: ["Face Mesh AI", "AST Syntax Parsing", "Clipboard Lock", "Live Audit Logs"],
    icon: ShieldAlert,
    liveBadge: "PROCTOR ACTIVE",
    actionLabel: "Explore Proctor Specs",
    actionTarget: "/auth",
    cursorNote: "Automated AI proctoring with 99.4% detection 🛡️",
    accentClass: "badge-sky"
  },
  {
    number: "04",
    tag: "ISOLATED DOCKER SANDBOX",
    title: "High-Throughput Ephemeral Code Execution Engine",
    blurb: "Sub-second compiled execution across 15+ modern programming languages.",
    description: "Every keystroke compilation executes inside disposable, heavily sandboxed micro-containers. Strict memory limits, CPU quotas, and zero network access prevent arbitrary code execution while testing corner cases in milliseconds.",
    stack: ["Docker Containers", "C++20 / Python 3.12", "Java 21 / Rust", "Judge0 Cluster"],
    icon: Cpu,
    liveBadge: "DOCKER SANDBOX ONLINE",
    actionLabel: "Test Monaco Playground",
    actionTarget: "/auth",
    cursorNote: "Isolated micro-container execution in <200ms ⚡",
    accentClass: "badge-amber"
  }
];

export function StackingCards() {
  return (
    <section id="pillars" className="bc-pillars-section">
      <div className="bc-watermark" aria-hidden="true">
        <div className="bc-watermark-top">
          <span>// 01 — 04</span>
          <span>DUAL-CORE ARCHITECTURE</span>
          <span>[ ESPORTS &amp; CAMPUS ]</span>
        </div>
        <p className="bc-watermark-text">Platforms</p>
      </div>

      <div className="bc-container">
        <div className="bc-section-header">
          <div className="bc-tag-pill">
            <span className="bc-status-dot pulse" />
            <span className="bc-tag-label">Dual-Core Operating System</span>
          </div>
          <h2 className="bc-section-title">
            Built for competitive duels. <br />
            <span className="bc-title-italic">Engineered for</span> campus exams.
          </h2>
          <p className="bc-section-desc">
            Whether you are a competitive programmer climbing ranked Elo ladders or a university administering proctored semester tests for hundreds of students, BrightCode is unified under one high-performance roof.
          </p>
        </div>

        <div className="bc-stacking-container">
          {PLATFORM_PILLARS.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <div
                key={pillar.title}
                className="bc-card-sticky"
                style={{
                  top: `calc(3.5rem + ${index * 0.9}rem)`,
                  zIndex: 10 + index,
                }}
              >
                <div className="bc-card">
                  <div className="bc-card-header">
                    <div className="bc-card-header-left">
                      <span className="bc-number-badge">{pillar.number}</span>
                      <span className="bc-tag-name">{pillar.tag}</span>
                    </div>
                    <span className={`bc-live-badge ${pillar.accentClass}`}>
                      <span className="bc-live-dot" />
                      {pillar.liveBadge}
                    </span>
                  </div>

                  <div className="bc-card-grid">
                    <div className="bc-card-info">
                      <div className="bc-card-title-row">
                        <Icon className="bc-card-icon" size={24} />
                        <h3 className="bc-card-title">{pillar.title}</h3>
                      </div>
                      <p className="bc-card-blurb">{pillar.blurb}</p>
                      <p className="bc-card-desc">{pillar.description}</p>

                      <div className="bc-stack-block">
                        <span className="bc-stack-label">Architecture &amp; Core Technology</span>
                        <div className="bc-stack-pills">
                          {pillar.stack.map((tech) => (
                            <span key={tech} className="bc-stack-pill">
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="bc-card-actions">
                        <RabbitHoleButton
                          label={pillar.actionLabel}
                          target={pillar.actionTarget}
                          dataCursor={pillar.cursorNote}
                        />
                      </div>
                    </div>

                    <div className="bc-card-telemetry">
                      <div className="bc-telemetry-box">
                        <div className="bc-telemetry-top">
                          <div className="bc-window-dots">
                            <span className="bc-dot red" />
                            <span className="bc-dot yellow" />
                            <span className="bc-dot green" />
                            <span className="bc-dot-text">// live_telemetry.log</span>
                          </div>
                          <span className="bc-telemetry-status">ACTIVE</span>
                        </div>
                        <pre className="bc-telemetry-code">
                          <code>
{`// Session: ${pillar.tag.toLowerCase()}
status: READY
ping: 8.2ms
ast_cache: HIT
workers: 4_THREAD_POOL
audit_status: VERIFIED
---------------------------
>> READY FOR DEPLOYMENT`}
                          </code>
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default StackingCards;
