import React from "react";
import { Cpu, Zap, Terminal, Shield, Database, Sparkles } from "lucide-react";

const TECH_CARDS = [
  {
    num: "01",
    name: "Monaco Core v0.52",
    tag: "EDITOR ENGINE",
    desc: "VS Code architecture in browser. Full IntelliSense, bracket colorization, AST syntax highlighting, and live multi-cursor pairing with <2ms parsing latency.",
    metric: "<2ms parse",
    icon: Terminal
  },
  {
    num: "02",
    name: "WebSockets Binary Wire",
    tag: "SYNC PROTOCOL",
    desc: "Sub-10ms binary delta compression streaming keystrokes, editor selections, test suite telemetry, and live cursor coordinates between dueling opponents.",
    metric: "8ms arena ping",
    icon: Zap
  },
  {
    num: "03",
    name: "Isolated Docker Sandbox",
    tag: "CODE RUNTIME",
    desc: "Ephemeral micro-containers executing C++, Python 3, Java, Rust, Go, and TypeScript with strict 2-second CPU timeouts, zero networking, and 256MB memory ceilings.",
    metric: "15+ languages",
    icon: Cpu
  },
  {
    num: "04",
    name: "AI Sentinel Proctor",
    tag: "ANTI-CHEAT ENGINE",
    desc: "Browser-side face detection, multi-face warning, gaze tracking, tab-switch audit, copy-paste lockouts, and GPT-assisted AST originality inspection.",
    metric: "99.4% detection",
    icon: Shield
  },
  {
    num: "05",
    name: "PostgreSQL & Redis Cache",
    tag: "DATA PERSISTENCE",
    desc: "ACID student rosters and institutional exams stored in PostgreSQL with memory-mapped Redis sorted sets powering sub-millisecond real-time Elo rank updates.",
    metric: "<0.5ms reads",
    icon: Database
  },
  {
    num: "06",
    name: "Framer Motion & KaTeX",
    tag: "UI & MATHEMATICS",
    desc: "GPU-accelerated vector rendering, spring-damped magnetic physics, smooth Catmull-Rom Bézier spline trajectories, and mathematical LaTeX algorithm notation.",
    metric: "60 FPS native",
    icon: Sparkles
  }
];

export function TechStackSection() {
  return (
    <section id="tech-stack" className="bc-tech-section">
      <div className="bc-container">
        <div className="bc-section-header">
          <div className="bc-tag-pill">
            <span className="bc-status-dot pulse" />
            <span className="bc-tag-label">Modern Engineering Stack</span>
          </div>
          <h2 className="bc-section-title">
            Engineered for precision. <br />
            <span className="bc-title-italic">Powered by</span> modern infrastructure.
          </h2>
          <p className="bc-section-desc">
            Every layer of BrightCode is optimized for high-concurrency throughput, sub-10ms duel synchronization, and rock-solid test integrity.
          </p>
        </div>

        <div className="bc-tech-grid">
          {TECH_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <div
                key={card.name}
                data-cursor={`${card.name} // ${card.metric}`}
                className="bc-tech-card"
              >
                <div className="bc-tech-top">
                  <div className="bc-tech-badge-left">
                    <span className="bc-tech-num">{card.num}</span>
                    <span className="bc-tech-tag">{card.tag}</span>
                  </div>
                  <span className="bc-tech-metric">{card.metric}</span>
                </div>

                <div className="bc-tech-title-row">
                  <div className="bc-tech-icon-wrap">
                    <Icon size={20} />
                  </div>
                  <h3 className="bc-tech-name">{card.name}</h3>
                </div>

                <p className="bc-tech-desc">{card.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default TechStackSection;
