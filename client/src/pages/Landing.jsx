import React, { useEffect, useRef, useState } from "react";
import { 
  ArrowUp, 
  ArrowUpRight, 
  Swords, 
  School, 
  ShieldAlert, 
  Cpu, 
  Terminal, 
  Zap, 
  Sparkles, 
  CheckCircle2 
} from "lucide-react";

import SplashScreen from "../components/landing/SplashScreen";
import CuriousCursor, { PhoneComment, sayComment } from "../components/landing/CuriousCursor";
import ParallaxEnvironment from "../components/landing/ParallaxEnvironment";
const CANVAS_VW = 400;
const CANVAS_TRAVEL_VW = 300;
import RabbitHoleButton, { FELL_IN } from "../components/landing/RabbitHole";
import StackingCards from "../components/landing/StackingCards";
import TechStackSection from "../components/landing/TechStackSection";

import "./Landing.css";

const SCROLL_EASE = 0.085;
const TIP_SCREEN_ANCHOR = 0.55;
const REVEAL_INSET = 4;

export default function Landing() {
  const storyRef = useRef(null);
  const canvasRef = useRef(null);
  const listeners = useRef(new Set());
  const [showSplash, setShowSplash] = useState(true);
  const [contentRevealed, setContentRevealed] = useState(true);
  const [scrollReady, setScrollReady] = useState(true);
  const [solidHeader, setSolidHeader] = useState(false);

  useEffect(() => {
    const checkHeader = () => {
      const pillars = document.getElementById("pillars");
      if (pillars) {
        setSolidHeader(window.scrollY >= pillars.offsetTop - 80);
      }
    };
    checkHeader();
    window.addEventListener("scroll", checkHeader, { passive: true });
    window.addEventListener("resize", checkHeader);
    return () => {
      window.removeEventListener("scroll", checkHeader);
      window.removeEventListener("resize", checkHeader);
    };
  }, []);

  const handleSplashComplete = React.useCallback(() => {
    setShowSplash(false);
    const root = document.documentElement;
    root.style.overflow = "";
    setContentRevealed(true);
    setScrollReady(true);
    setTimeout(() => {
      sayComment("intro", "Welcome to BrightCode. Real-time esports duels & campus testing.");
    }, 400);
  }, []);

  // Support horizontal trackpad swipe gestures to scroll story horizontally
  useEffect(() => {
    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        window.scrollBy({ top: e.deltaX, behavior: "auto" });
      }
    };
    window.addEventListener("wheel", handleWheel, { passive: true });
    return () => window.removeEventListener("wheel", handleWheel);
  }, []);

  // Horizontal scroll animation frame loop
  useEffect(() => {
    let frame = 0;
    let current = -1;
    const spoken = new Set();

    const tick = () => {
      const section = storyRef.current;
      const canvas = canvasRef.current;
      if (section) {
        const distance = section.offsetHeight - window.innerHeight;
        const target = Math.min(1, Math.max(0, (window.scrollY - section.offsetTop) / Math.max(distance, 1)));
        const next = current < 0 || Math.abs(target - current) < 0.00005 ? target : current + (target - current) * SCROLL_EASE;

        if (next !== current) {
          current = next;
          if (canvas && window.innerWidth >= 768) {
            canvas.style.transform = `translate3d(-${current * CANVAS_TRAVEL_VW}vw, 0, 0)`;

            const tip = current * CANVAS_TRAVEL_VW + TIP_SCREEN_ANCHOR * 100;
            const edge = current * CANVAS_TRAVEL_VW + 100 - REVEAL_INSET;

            canvas.querySelectorAll("[data-at]").forEach((el) => {
              const at = Number(el.dataset.at);
              const shown = (el.dataset.mode === "thread" ? tip : edge) >= at;
              el.toggleAttribute("data-shown", shown);

              const line = el.dataset.say;
              if (shown && line && !spoken.has(line)) {
                spoken.add(line);
                sayComment(`story:${line}`, line);
              }
            });
          }
          listeners.current.forEach((listen) => listen(current));
        }
      }
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const subscribe = (listen) => {
    listeners.current.add(listen);
    return () => listeners.current.delete(listen);
  };

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="bc-portfolio-landing">
      {/* 1. Cinematic Editorial Splash Screen */}
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      {/* 2. Floating Minimalist Editorial Header */}
      <header className={`bc-header ${solidHeader ? "solid" : ""}`}>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="bc-logo-btn"
          data-cursor="BrightCode // Real-Time Esports & Testing Core"
        >
          <span className="bc-logo-dot" />
          <span className="bc-logo-text">BrightCode</span>
        </button>

        <nav className="bc-nav-links">
          <button onClick={() => scrollToSection("story")} className="bc-nav-link desktop-only">
            // Story
          </button>
          <button onClick={() => scrollToSection("pillars")} className="bc-nav-link desktop-only">
            // Platforms
          </button>
          <button onClick={() => scrollToSection("tech-stack")} className="bc-nav-link tablet-only">
            // Tech Stack
          </button>

          <a
            href="/portal"
            className="bc-btn-portal"
            data-cursor="Campus Student Roll-Number & Coordinator Portal 🏫"
          >
            <School size={13} className="bc-portal-icon" />
            <span>Campus Portal</span>
          </a>

          <a
            href="/auth"
            className="bc-btn-signin"
            data-cursor="Sign In / Register to BrightCode 🚀"
          >
            Sign In <ArrowUpRight size={13} />
          </a>
        </nav>
      </header>

      {/* 3. Horizontal Story Track (580vh on desktop) */}
      <section id="story" ref={storyRef} className="bc-story-section">
        <div className="bc-story-sticky">
          <ParallaxEnvironment subscribe={subscribe} />

          <div
            ref={canvasRef}
            className="bc-story-canvas"
            style={{ width: `${CANVAS_VW}vw` }}
          >

            {/* Canvas Scenes Across 400vw Horizontal Width */}
            <div className="bc-canvas-content" style={{ width: `${CANVAS_VW}vw` }}>
              {/* Scene 1: Dual-Core Genesis (0vw - 100vw) */}
              <div className="bc-scene-1">
                <div className={`bc-scene-box ${contentRevealed ? "revealed" : ""}`}>
                  <div className="bc-tag-pill mb-4">
                    <span className="bc-status-dot pulse" />
                    <span className="bc-tag-label">Dual-Core Engineering Architecture</span>
                  </div>

                  <h1 className="bc-hero-title">
                    Code in Real-Time. <br />
                    <span className="bc-title-italic">Compete 1v1. Ace Exams.</span>
                  </h1>

                  <p className="bc-hero-desc">
                    BrightCode seamlessly unites competitive 1v1 multiplayer coding duels with an institutional, AI-proctored campus examination system. Sub-10ms WebSockets, isolated Docker execution, and tamper-proof testing.
                  </p>

                  <div className="bc-hero-ctas">
                    <RabbitHoleButton
                      label="Launch 1v1 Arena [Ranked]"
                      target="/auth"
                      dataCursor="⚔️ Join live ranked 1v1 queue with automated test runner"
                    />
                    <a
                      href="/portal"
                      data-cursor="🏫 University student roll-number & coordinator login"
                      className="bc-btn-secondary"
                    >
                      <School size={15} className="bc-portal-icon" />
                      <span>Campus College Portal</span>
                    </a>
                  </div>

                  {/* Telemetry Indicator Pills */}
                  <div className="bc-hero-telemetry-bar">
                    <span className="bc-telemetry-chip">
                      <Zap size={11} className="chip-icon rose" />
                      &lt;8ms WebSocket Ping
                    </span>
                    <span className="bc-telemetry-chip">
                      <Terminal size={11} className="chip-icon" />
                      15+ Languages
                    </span>
                    <span className="bc-telemetry-chip">
                      <Cpu size={11} className="chip-icon" />
                      Docker Sandboxes
                    </span>
                    <span className="bc-telemetry-chip">
                      <ShieldAlert size={11} className="chip-icon emerald" />
                      AI Sentinel Proctor
                    </span>
                  </div>
                </div>

                <div className="bc-scroll-indicator">
                  <span>Scroll to explore architecture</span>
                  <span className="bc-arrow-down">↓</span>
                </div>
              </div>

              {/* Scene 2: The Esports Arena Matrix (Positioned at 125vw) */}
              <div
                className="bc-scene-2 reveal"
                data-at="120"
                data-say="entering the esports duel matrix."
              >
                <div className="bc-scene-card">
                  <div className="bc-scene-tag rose">
                    <Swords size={14} />
                    <span>01 // Esports Arena Matrix</span>
                  </div>
                  <h2 className="bc-scene-heading">
                    Ranked 1v1 Duels. <br />
                    <span className="bc-title-italic">Sub-10ms AST Sync.</span>
                  </h2>
                  <p className="bc-scene-text">
                    Engineered for high-intensity competitive programming. Sub-10ms binary WebSocket deltas stream keystrokes, editor selections, and AST syntax trees between opponents. Isolated Docker micro-containers evaluate test assertions in milliseconds.
                  </p>
                  
                  {/* Live Simulation Card */}
                  <div className="bc-snippet-box">
                    <div className="bc-snippet-header">
                      <span className="bc-snippet-dot" />
                      <span>LIVE DUEL ENGINE // MATCH #8492</span>
                      <span className="bc-ping-pill">7.4ms</span>
                    </div>
                    <div className="bc-snippet-body">
                      <div><span className="text-zinc-500">P1:</span> Elo 1842 [C++20] · <span className="text-emerald-400">4/4 Tests Passed ✓</span></div>
                      <div><span className="text-zinc-500">P2:</span> Elo 1829 [Python 3.12] · <span className="text-amber-400">Running Test 3...</span></div>
                      <div className="text-zinc-500 text-[10px] mt-1">// Auto-advancing judge container: &lt;140ms execution</div>
                    </div>
                  </div>

                  <div className="bc-badge-row">
                    <span className="bc-badge">Elo Matchmaking</span>
                    <span className="bc-badge">Monaco Core v0.52</span>
                    <span className="bc-badge">Docker Sandboxes</span>
                    <span className="bc-badge">Faction Wars</span>
                  </div>
                </div>
              </div>

              {/* Scene 3: Institutional Campus Sentinel (Positioned at 215vw) */}
              <div
                className="bc-scene-3 reveal"
                data-at="210"
                data-say="institutional campus exam deployment."
              >
                <div className="bc-scene-card">
                  <div className="bc-scene-tag emerald">
                    <School size={14} />
                    <span>02 // Campus Examination Platform</span>
                  </div>
                  <h2 className="bc-scene-heading">
                    Conduct 300+ Student Exams. <br />
                    <span className="bc-title-italic">AI-Proctored. Zero Friction.</span>
                  </h2>
                  <p className="bc-scene-text">
                    Enterprise examination infrastructure built for universities. Faculty coordinators schedule exams, batch-onboard thousands of student roll numbers via CSV, and audit live test telemetry. AI Sentinel flags multi-face anomalies, tab switches, and clipboard hijacking in real-time.
                  </p>

                  {/* Campus Proctor Simulation Box */}
                  <div className="bc-snippet-box">
                    <div className="bc-snippet-header">
                      <span className="bc-snippet-dot emerald" />
                      <span>CAMPUS EXAM SENTINEL // BATCH CS-2026</span>
                      <span className="bc-ping-pill emerald">284 ACTIVE</span>
                    </div>
                    <div className="bc-snippet-body">
                      <div><span className="text-zinc-500">Status:</span> Proctoring Engine Armed · <span className="text-emerald-400">0.0% Breach Rate</span></div>
                      <div><span className="text-zinc-500">Telemetry:</span> Face Mesh: Locked · Tabs: Monitored · Clipboard: Restricted</div>
                      <div className="text-zinc-500 text-[10px] mt-1">// Automated gradebook export ready on session close</div>
                    </div>
                  </div>

                  <div className="bc-badge-row">
                    <span className="bc-badge">Roll Number Auth</span>
                    <span className="bc-badge">Faculty Dashboard</span>
                    <span className="bc-badge">AI Face Sentinel</span>
                    <span className="bc-badge">CSV Batch Sync</span>
                  </div>
                </div>
              </div>

              {/* Scene 4: The Convergence & Launch (Positioned at 305vw) */}
              <div
                className="bc-scene-4 reveal"
                data-at="300"
                data-say="warp drive armed. ready to enter."
              >
                <div className="bc-launch-card">
                  <div className="bc-scene-tag zinc">
                    <Sparkles size={14} className="text-rose" />
                    <span>03 // Ready for Deployment</span>
                  </div>
                  <h2 className="bc-launch-heading">
                    The Arena Is Armed. <br />
                    <span className="bc-title-italic">Choose Your Gateway.</span>
                  </h2>
                  <p className="bc-scene-text centered">
                    Whether you are climbing the ranked Elo ladder in competitive 1v1 duels or conducting high-stakes institutional campus examinations, step inside BrightCode.
                  </p>
                  <div className="bc-launch-ctas">
                    <RabbitHoleButton
                      label="Enter BrightCode Arena →"
                      target="/auth"
                      dataCursor="🚀 Warp into BrightCode"
                    />
                    <button
                      onClick={() => scrollToSection("pillars")}
                      className="bc-btn-ghost"
                    >
                      Explore Architectural Pillars ↓
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Story View (< 768px fallback) */}
        <div className="bc-mobile-story">
          <div className="bc-mobile-card hero">
            <span className="bc-mobile-dot" />
            <h1 className="bc-mobile-title">
              Code in Real-Time. <br />
              <span className="bc-title-italic">Compete 1v1. Ace Exams.</span>
            </h1>
            <p className="bc-mobile-text">
              High-stakes 1v1 coding duels meet AI-proctored institutional campus examinations.
            </p>
            <div className="bc-mobile-ctas">
              <a href="/auth" className="bc-btn-signin full">
                Launch 1v1 Duel →
              </a>
              <a href="/portal" className="bc-btn-portal full">
                Campus College Portal →
              </a>
            </div>
          </div>

          <div className="bc-mobile-card">
            <div className="bc-scene-tag rose mb-2">
              <Swords size={14} />
              <span>01 // Esports Arena</span>
            </div>
            <h2 className="bc-mobile-h2">Ranked 1v1 duels with sub-10ms sync.</h2>
            <p className="bc-mobile-text">
              Monaco editor AST syncing over WebSockets with automated Docker test suites.
            </p>
          </div>

          <div className="bc-mobile-card">
            <div className="bc-scene-tag emerald mb-2">
              <School size={14} />
              <span>02 // Campus Platform</span>
            </div>
            <h2 className="bc-mobile-h2">300+ student exams with AI Sentinel.</h2>
            <p className="bc-mobile-text">
              Batch roll number onboarding, multi-face tracking, tab-switch audit, and instant gradebook export.
            </p>
          </div>
        </div>
      </section>

      {/* 4. Stacking Cards Showcase Section */}
      <StackingCards />

      {/* 5. Modern Interactive Tech Stack */}
      <TechStackSection />

      {/* 6. Editorial Footer */}
      <footer className="bc-footer">
        <div className="bc-footer-inner">
          <div className="bc-footer-brand">
            <span className="bc-logo-dot" />
            <span className="bc-logo-text footer">BrightCode</span>
            <span className="bc-footer-dot">·</span>
            <span>Real-time Esports &amp; Campus Testing</span>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="bc-footer-backtop"
            data-cursor="Rewind to top ↑"
          >
            <span>Back to top</span>
            <ArrowUp size={13} />
          </button>
        </div>
      </footer>

      {/* 7. Curious Cursor & Mobile Phone Comment */}
      <CuriousCursor visible={scrollReady} />
      <PhoneComment />
    </div>
  );
}
