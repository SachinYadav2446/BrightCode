import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

/* ─────────────────────────────────────────
   PARTICLES CANVAS
───────────────────────────────────────── */
function ParticlesCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let W, H, particles = [], raf;

    const resize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    class P {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.size = Math.random() * 1.6 + 0.3;
        this.vx = (Math.random() - 0.5) * 0.25;
        this.vy = (Math.random() - 0.5) * 0.25;
        this.a = Math.random() * 0.4 + 0.08;
        this.color = Math.random() > 0.65
          ? "#f0e4c8"
          : Math.random() > 0.5
          ? "#c8222f"
          : "#2d3f56";
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.a;
        ctx.fill();
      }
    }

    for (let i = 0; i < 140; i++) particles.push(new P());

    const loop = () => {
      ctx.clearRect(0, 0, W, H);
      ctx.globalAlpha = 1;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 90) {
            ctx.beginPath();
            ctx.strokeStyle = "#2d3f56";
            ctx.globalAlpha = (1 - d / 90) * 0.12;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
      particles.forEach(p => { p.update(); p.draw(); });
      raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(raf);
    };
  }, []);
  return <canvas id="particles-canvas" ref={canvasRef} />;
}

/* ─────────────────────────────────────────
   CURSOR
───────────────────────────────────────── */
function Cursor() {
  const cursorRef = useRef(null);
  const ringRef = useRef(null);
  useEffect(() => {
    let mx = 0, my = 0, tx = 0, ty = 0, raf;
    const move = e => { mx = e.clientX; my = e.clientY; };
    document.addEventListener("mousemove", move);

    const interactables = "a, button, [role='button']";
    const over = () => document.body.classList.add("hovering");
    const out = () => document.body.classList.remove("hovering");
    document.querySelectorAll(interactables).forEach(el => {
      el.addEventListener("mouseenter", over);
      el.addEventListener("mouseleave", out);
    });

    const loop = () => {
      if (cursorRef.current) {
        cursorRef.current.style.left = mx + "px";
        cursorRef.current.style.top = my + "px";
      }
      tx += (mx - tx) * 0.14;
      ty += (my - ty) * 0.14;
      if (ringRef.current) {
        ringRef.current.style.left = tx + "px";
        ringRef.current.style.top = ty + "px";
      }
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      document.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf);
    };
  }, []);
  return (
    <>
      <div id="cursor" ref={cursorRef} />
      <div id="cursor-ring" ref={ringRef} />
    </>
  );
}

/* ─────────────────────────────────────────
   SCROLL REVEAL HOOK
───────────────────────────────────────── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12, rootMargin: "0px 0px -50px 0px" }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─────────────────────────────────────────
   COUNTER ANIMATION HOOK
───────────────────────────────────────── */
function useCounterAnimation() {
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.querySelectorAll(".stat-block-num[data-count]").forEach(el => {
            const target = parseFloat(el.dataset.count);
            const suffix = el.dataset.suffix || "";
            const isFloat = el.dataset.float === "1";
            let start = 0;
            const dur = 1800;
            const step = target / (dur / 16);
            const iv = setInterval(() => {
              start = Math.min(start + step, target);
              el.textContent = isFloat
                ? start.toFixed(1) + suffix
                : Math.round(start).toLocaleString() + suffix;
              if (start >= target) clearInterval(iv);
            }, 16);
          });
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.3 });
    document.querySelectorAll(".stats-grid").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ─────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────── */
export default function CodeBright() {
  const navigate = useNavigate();
  useScrollReveal();
  useCounterAnimation();

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

  const handleAuth = (mode) => navigate('/auth', { state: { mode } });
  const handleHub = () => navigate('/hub');

  return (
    <div className="codebright-root">
      <Cursor />
      <ParticlesCanvas />
      <div className="bg-grid" />
      <div className="bg-noise" />
      <div className="bg-scan" />

      {/* ══ NAV ══ */}
      <nav className="nav">
        <div className="nav-inner">
          <a className="nav-logo" href="#" onClick={e => e.preventDefault()}>
            <div className="nav-logo-mark">
              <svg viewBox="0 0 24 24" fill="none" stroke="#c8222f" strokeWidth="2" strokeLinecap="round">
                <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
              </svg>
            </div>
            <span className="nav-logo-name">CODE<span>BRIGHT</span></span>
          </a>
          <div className="nav-links">
            {["features","collaborate","mission","about"].map(id => (
              <button key={id} className="nav-link" onClick={() => scrollTo(id)}>
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </button>
            ))}
          </div>
          <div className="nav-actions">
            <button className="nav-btn-ghost" onClick={() => handleAuth('login')}>Sign In</button>
            <button className="nav-btn-primary" onClick={() => handleAuth('register')}>Join Bootcamp →</button>
          </div>
        </div>
      </nav>

      {/* ══ HERO ══ */}
      <header className="hero">
        <div className="hero-aura-1" />
        <div className="hero-aura-2" />
        <div className="hero-aura-3" />
        <div className="hero-inner">
          {/* Left */}
          <div className="hero-left">
            <div className="hero-badge">
              <div className="badge-pulse" />
              <span className="badge-text">Open Beta · v2.4.0 · 4 Engineers Online</span>
            </div>

            <div className="hero-headline">
              <h1 className="hero-h1">
                <span className="h1-line plain">Code.</span>
                <span className="h1-line red-line">Compete.</span>
                <span className="h1-line serif-line">Dominate.</span>
              </h1>
            </div>

            <p className="hero-sub">
              A high-performance platform where real-time collaboration meets gamified learning. Sharpen your edge, join factions, crush the leaderboard — and build without limits.
            </p>

            <div className="hero-actions">
              <button className="btn-primary" onClick={() => handleAuth('register')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Create Free Account
              </button>
              <button className="btn-secondary" onClick={handleHub}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
                </svg>
                Explore Platform
              </button>
            </div>

            <div className="hero-stats">
              {[
                { val: "99.9%", lbl: "Uptime" },
                { val: "1,247", lbl: "Challenges" },
                { val: "8", lbl: "Factions" },
                { val: "<50ms", lbl: "Sync Latency" },
              ].map(s => (
                <div className="h-stat" key={s.lbl}>
                  <span className="h-stat-val">{s.val}</span>
                  <span className="h-stat-lbl">{s.lbl}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right — terminal */}
          <div className="hero-right">
            <div className="chip chip-a">
              <div className="chip-ico slate-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="#f0e4c8" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div>
                <div className="chip-val azure">23ms</div>
                <div className="chip-lbl">Live Latency</div>
              </div>
            </div>
            <div className="chip chip-b">
              <div className="chip-ico red-ico">
                <svg viewBox="0 0 24 24" fill="none" stroke="#e06070" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <div className="chip-val red">+240 XP</div>
                <div className="chip-lbl">Today's Streak</div>
              </div>
            </div>

            <div className="terminal-wrap">
              <div className="term-bar">
                <div className="term-dots">
                  <div className="t-dot r" /><div className="t-dot y" /><div className="t-dot g" />
                </div>
                <span className="term-title">collaborative-forge.js</span>
                <div className="term-badge">
                  <div className="term-badge-dot" />LIVE SESSION
                </div>
              </div>
              <div className="term-body">
                <div className="tl"><span className="tc">// CodeBright Collaborative Forge</span></div>
                <div className="tl"><span className="tc">// 3 engineers · Room #OMEGA-7</span></div>
                <div className="tl">&nbsp;</div>
                <div className="tl">
                  <span className="tk">import</span>
                  <span className="tv">&nbsp;{"{ forge, sentinel }"}&nbsp;</span>
                  <span className="tk">from</span>
                  <span className="ts">&nbsp;'@codebright/core'</span>
                </div>
                <div className="tl">&nbsp;</div>
                <div className="tl">
                  <span className="tk">const</span>
                  <span className="tv">&nbsp;session =&nbsp;</span>
                  <span className="tk">await</span>
                  <span className="tf">&nbsp;forge.create</span>
                  <span className="tv">{"({"}</span>
                </div>
                <div className="tl"><span className="tv">&nbsp;&nbsp;room:&nbsp;</span><span className="ts">'OMEGA-7'</span><span className="tv">,</span></div>
                <div className="tl"><span className="tv">&nbsp;&nbsp;ai: sentinel.</span><span className="tf">enable</span><span className="tv">(),</span></div>
                <div className="tl"><span className="tv">&nbsp;&nbsp;sync:&nbsp;</span><span className="ts">'realtime'</span></div>
                <div className="tl"><span className="tv">{"})"}</span></div>
                <div className="tl">&nbsp;</div>
                <div className="tl"><span className="tout">✓ Session active · 23ms · AES-256</span></div>
                <div className="tl"><span className="tk">▶&nbsp;</span><span className="tcur" /></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ══ MARQUEE ══ */}
      <div className="marquee-strip">
        <div className="marquee-track-wrap">
          {[0, 1].map(i => (
            <div className="marquee-track" key={i} aria-hidden={i === 1}>
              {["Real-Time Collaboration","Isolated Sandboxes","Skill Forge","Enterprise Architecture","Faction Battles","Global Leaderboards","AI Sentinel","Pair Programming","Warp Drive Versioning","XP Progression"].map((t, idx) => (
                <span key={idx} className={idx % 4 === 0 ? "red-mark" : ""}>{t}</span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ══ FEATURES ══ */}
      <section className="section" id="features">
        <div className="section-inner">
          <div className="feat-header reveal">
            <div className="eyebrow">
              <span className="eyebrow-line" />
              <span className="eyebrow-text">Platform Capabilities</span>
            </div>
            <h2 className="section-title">Everything a serious engineer needs.</h2>
            <p className="section-sub">One platform. Infinite depth. From first commit to faction domination.</p>
          </div>

          <div className="features-grid">
            {[
              {
                num:"01", type:"red-card", iconType:"red-icon", tag:"REAL-TIME", tagType:"red-tag",
                title:"Collaborative Forge",
                desc:"WebSocket-based code sync via Socket.io and Monaco Editor. Live cursors, shared execution, private and public rooms.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8222f" strokeWidth="2"><rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
              },
              {
                num:"02", type:"blue-card", iconType:"blue-icon", tag:"AI-POWERED", tagType:"blue-tag",
                title:"The Sentinel",
                desc:"Context-aware AI assistant for inline code suggestions, debug analysis, and architecture recommendations in real time.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0e4c8" strokeWidth="2"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2M20 14h2M15 13v2M9 13v2"/></svg>
              },
              {
                num:"03", type:"red-card", iconType:"red-icon", tag:"COMPETITIVE", tagType:"red-tag",
                title:"Code Arena",
                desc:"Time-attack coding battles across multiple modules. Earn XP, climb leaderboards, and dominate faction wars.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8222f" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>
              },
              {
                num:"04", type:"cream-card span2", iconType:"cream-icon", tag:"CREATIVE", tagType:"cream-tag",
                title:"CodeVault Notes",
                desc:"VS Code-inspired note system with rich text, code blocks, folder organisation, Excalidraw diagrams, and full-text search — your entire engineering brain in one vault.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0e4c8" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              },
              {
                num:"05", type:"blue-card", iconType:"blue-icon", tag:"TEMPORAL", tagType:"blue-tag",
                title:"Warp Drive",
                desc:"Visual code history navigation with snapshot diffing and instant restore. Time-travel through every edit.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0e4c8" strokeWidth="2"><circle cx="18" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><path d="M6 21V9a9 9 0 0 0 9 9"/></svg>
              },
              {
                num:"06", type:"red-card", iconType:"red-icon", tag:"ANALYTICS", tagType:"red-tag",
                title:"Activity Heatmap",
                desc:"GitHub-style XP contribution graph. Streaks, milestones, and performance analytics across every module.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8222f" strokeWidth="2"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6M10 22h4"/></svg>
              },
              {
                num:"07", type:"blue-card", iconType:"blue-icon", tag:"SOCIAL", tagType:"blue-tag",
                title:"Factions & Syndicates",
                desc:"Join engineering guilds, compete in sprint battles, and climb faction-specific and global rankings with your crew.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f0e4c8" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              },
              {
                num:"08", type:"red-card", iconType:"red-icon", tag:"ENTERPRISE", tagType:"red-tag",
                title:"Secure Execution",
                desc:"AES-256 isolated sandboxes. Your code, your data — locked down at enterprise grade. Zero-trust architecture.",
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8222f" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              },
            ].map(f => (
              <div className={`feat-card ${f.type} reveal`} key={f.num} style={{ transitionDelay: `${parseInt(f.num) * 0.055}s` }}>
                <div className="feat-top-bar" />
                <span className="feat-num">{f.num}</span>
                <div className={`feat-icon ${f.iconType}`}>{f.icon}</div>
                <div className="feat-title">{f.title}</div>
                <p className="feat-desc">{f.desc}</p>
                <span className={`feat-tag ${f.tagType}`}>{f.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ COLLAB SCENE ══ */}
      <section className="collab-section" id="collaborate">
        <div className="collab-inner">
          {/* Left text */}
          <div className="collab-text reveal-left">
            <div className="eyebrow"><span className="eyebrow-line" /><span className="eyebrow-text">Live Collaboration</span></div>
            <h2 className="collab-title">
              Your squad.<br />One codebase.<br />
              <span className="red">Infinite flow.</span>
            </h2>
            <p className="collab-desc">
              Real engineers. Real rooms. Real-time. Whether you're pair-programming across time zones or grinding faction battles with your crew — CodeBright keeps everyone in sync, character by character.
            </p>
            <div className="collab-pills">
              {[
                { label:"Live Cursors", type:"blue-pill" },
                { label:"Shared Execution", type:"blue-pill" },
                { label:"Voice Channels", type:"red-pill" },
                { label:"<50ms Latency", type:"blue-pill" },
              ].map(p => (
                <div className={`pill ${p.type}`} key={p.label}>
                  <div className="pill-dot" />
                  {p.label}
                </div>
              ))}
            </div>
            <div className="collab-avs">
              <div className="c-avs">
                <div className="c-av av-1">AK</div>
                <div className="c-av av-2">ZR</div>
                <div className="c-av av-3">MS</div>
                <div className="c-av av-4">PL</div>
              </div>
              <span className="c-av-text"><span>4 engineers</span> live in Room OMEGA-7</span>
            </div>
            <button className="btn-primary" onClick={handleHub}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13 12H3" />
              </svg>
              Open a Room
            </button>
          </div>

          {/* Right: coding scene */}
          <div className="scene-wrap reveal-right">
            <div className="notif-float">
              <span className="notif-icon">🧠</span>
              <div className="notif-main">
                <span className="notif-title">Sentinel AI · Suggestion</span>
                <span className="notif-sub">Async/await pattern detected — refactor?</span>
              </div>
            </div>
            <div className="xp-float">
              <div>
                <div className="xp-val">+85 XP</div>
                <div className="xp-lbl">Code Review Bonus</div>
              </div>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8222f" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>

            <div className="scene-card">
              <div className="scene-bar">
                <div className="s-dots"><div className="s-dot r" /><div className="s-dot y" /><div className="s-dot g" /></div>
                <span className="scene-title-text">Room OMEGA-7 · 4 collaborators</span>
                <div className="scene-live"><div className="scene-live-dot" />LIVE</div>
              </div>
              <div className="scene-body">
                {/* Sidebar */}
                <div className="sidebar-panel">
                  <div className="sb-sec">
                    <span className="sb-lbl">Online Now</span>
                    {[
                      { cls:"av-sm-a", init:"AK", name:"arjun_k", uc:"uc-a", delay:"0s" },
                      { cls:"av-sm-b", init:"ZR", name:"zara_r", uc:"uc-b", delay:"0.3s" },
                      { cls:"av-sm-c", init:"MS", name:"mike_s", uc:"uc-c", delay:"0.6s" },
                      { cls:"av-sm-d", init:"PL", name:"priya_l", uc:"uc-d", delay:"0.9s" },
                    ].map(u => (
                      <div className="user-row" key={u.init}>
                        <div className={`avatar-sm ${u.cls} online`}>{u.init}</div>
                        <span className="user-nm">{u.name}</span>
                        <div className={`user-cur ${u.uc}`} style={{ animationDelay: u.delay }} />
                      </div>
                    ))}
                  </div>
                  <div className="sb-files">
                    <span className="sb-lbl" style={{marginBottom:"8px",display:"block"}}>Files</span>
                    <div className="f-dir">▸ api/</div>
                    <div className="f-file active">forge.js</div>
                    <div className="f-file">sentinel.ts</div>
                    <div className="f-file">auth.js</div>
                    <div className="f-dir" style={{marginTop:"4px"}}>▸ utils/</div>
                    <div className="f-file">helpers.js</div>
                  </div>
                </div>

                {/* Code */}
                <div className="code-main">
                  <div className="code-tabs">
                    <div className="code-tab active">forge.js</div>
                    <div className="code-tab">sentinel.ts</div>
                    <div className="code-tab">auth.js</div>
                  </div>
                  <div className="code-area">
                    {[
                      { ln:1, bg:"rgba(200,34,47,0.04)", content: <span className="ct"><span className="ck">import</span> <span style={{color:"#c0a878"}}>{"{ io }"}</span> <span className="ck">from</span> <span className="cs">'socket.io-client'</span></span> },
                      { ln:2, content: <span className="ct"><span className="ck">import</span> <span style={{color:"#c0a878"}}>{"{ Monaco }"}</span> <span className="ck">from</span> <span className="cs">'@monaco-editor/react'</span></span> },
                      { ln:3, content: <span>&nbsp;</span> },
                      { ln:4, content: <span className="ct"><span className="cc">// AK: collaborative session bootstrap</span><span className="ic ic-a" style={{animationDelay:"0s"}} /></span> },
                      { ln:5, bg:"rgba(200,34,47,0.04)", content: <span className="ct"><span className="ck">export async function</span> <span className="cf">createForge</span><span className="cv">(config) {"{"}</span></span> },
                      { ln:6, content: <span className="ct"><span className="cv">&nbsp;&nbsp;</span><span className="ck">const</span><span className="cv"> socket = io(config.</span><span className="cf">serverUrl</span><span className="cv">, {"{"}</span></span> },
                      { ln:7, content: <span className="ct"><span className="cv">&nbsp;&nbsp;&nbsp;&nbsp;transports: [</span><span className="cs">'websocket'</span><span className="cv">],</span></span> },
                      { ln:8, content: <span className="ct"><span className="cv">&nbsp;&nbsp;&nbsp;&nbsp;auth: {"{ token: config."}</span><span className="cf">jwt</span><span className="cv"> {"}"}</span></span> },
                      { ln:9, content: <span className="ct"><span className="cv">&nbsp;&nbsp;{"}"});</span></span> },
                      { ln:10, content: <span>&nbsp;</span> },
                      { ln:11, content: <span className="ct"><span className="cc">// ZR: cursor broadcasting</span><span className="ic ic-b" style={{animationDelay:"0.35s"}} /></span> },
                      { ln:12, bg:"rgba(240,228,200,0.06)", content: <span className="ct"><span className="cv">&nbsp;&nbsp;socket.</span><span className="cf">emit</span><span className="cv">(</span><span className="cs">'join-room'</span><span className="cv">, {"{"}</span></span> },
                      { ln:13, bg:"rgba(240,228,200,0.06)", content: <span className="ct"><span className="cv">&nbsp;&nbsp;&nbsp;&nbsp;room: config.</span><span className="cp">roomId</span><span className="cv">, user: config.</span><span className="cp">userId</span></span> },
                      { ln:14, bg:"rgba(240,228,200,0.06)", content: <span className="ct"><span className="cv">&nbsp;&nbsp;{"}"});</span></span> },
                      { ln:15, content: <span>&nbsp;</span> },
                      { ln:16, content: <span className="ct"><span className="cc">// MS: return session object</span><span className="ic ic-c" style={{animationDelay:"0.7s"}} /></span> },
                      { ln:17, bg:"rgba(26,80,80,0.08)", content: <span className="ct"><span className="cv">&nbsp;&nbsp;</span><span className="ck">return</span><span className="cv"> {"{ socket, "}</span><span className="cf">sync</span><span className="cv">{": true, latency: "}</span><span className="cp">23</span><span className="cv"> {"};"}</span></span> },
                      { ln:18, content: <span className="ct"><span className="cv">{"}"}</span></span> },
                    ].map(line => (
                      <div className="code-line" key={line.ln} style={line.bg ? {background:line.bg} : {}}>
                        <span className="ln">{line.ln}</span>
                        {line.content}
                      </div>
                    ))}
                  </div>
                  <div className="scene-foot">
                    <div className="sf"><div className="sf-dot sf-green" />Connected</div>
                    <div className="sf"><div className="sf-dot sf-blue" />4 collaborators</div>
                    <div className="sf">Ln 17, Col 42</div>
                    <div className="sf sf-right">JavaScript · UTF-8</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ MISSION ══ */}
      <section className="section mission-section" id="mission">
        <div className="section-inner">
          <div className="mission-grid">
            <div className="reveal-left">
              <div className="eyebrow"><span className="eyebrow-line" /><span className="eyebrow-text">Our Mission</span></div>
              <h2 className="section-title">Engineering excellence,<br /><span className="serif">redefined</span> from scratch.</h2>
              <p className="section-sub" style={{maxWidth:"100%"}}>
                CodeBright is the definitive platform for engineers who demand more — where real-time collaboration meets competitive coding, and every challenge brings you closer to mastering the craft.
              </p>
              <div className="pillars">
                {[
                  { title:"Faction-Based Learning", desc:"Join engineering guilds, compete in syndicate wars, and climb global leaderboards.", type:"blue-pillar",
                    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0e4c8" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                  { title:"Live Collaborative Coding", desc:"Pair program in real-time with low-latency sync and AI-powered assistance built in.", type:"red-pillar",
                    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8222f" strokeWidth="2"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
                  { title:"Skill Forge Challenges", desc:"Master system design through timed challenges and earn XP rewards that matter.", type:"blue-pillar",
                    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0e4c8" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> },
                  { title:"Secure Execution", desc:"Run code in isolated sandboxes with enterprise-grade AES-256 security. Zero-trust.", type:"red-pillar",
                    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8222f" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> },
                ].map(p => (
                  <div className={`pillar ${p.type}`} key={p.title}>
                    <div className="pillar-ico">{p.icon}</div>
                    <div>
                      <div className="pillar-title">{p.title}</div>
                      <p className="pillar-desc">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal-right">
              <div className="stats-grid">
                {[
                  { num:"1247", suffix:"", lbl:"Faction Challenges", type:"blue-block",
                    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0e4c8" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
                  { num:"89", suffix:"", lbl:"XP Challenges", type:"red-block",
                    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8222f" strokeWidth="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg> },
                  { num:"8", suffix:"", lbl:"Active Factions", type:"blue-block",
                    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f0e4c8" strokeWidth="2"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg> },
                  { num:"99.9", suffix:"%", lbl:"Uptime", type:"red-block", isFloat:true,
                    icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#c8222f" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg> },
                ].map(s => (
                  <div className={`stat-block ${s.type}`} key={s.lbl}>
                    <div className="stat-block-ico">{s.icon}</div>
                    <div
                      className="stat-block-num"
                      data-count={s.num}
                      data-suffix={s.suffix}
                      data-float={s.isFloat ? "1" : "0"}
                    >
                      {s.num}{s.suffix}
                    </div>
                    <div className="stat-block-lbl">{s.lbl}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="cta-section">
        <div className="section-inner">
          <div className="cta-card reveal">
            <div className="cta-glow-blue" />
            <div className="cta-glow-red" />
            <p className="cta-pre">// READY TO SHIP?</p>
            <h2 className="cta-title">
              Join the engineers who<br />
              build <span className="red">without</span> <span className="serif">limits.</span>
            </h2>
            <p className="cta-body">Your faction is waiting. The leaderboard has a gap at the top. Real-time collaboration, AI assistance, and competitive challenges — it all starts with one account.</p>
            <div className="cta-btns">
              <button className="btn-primary" onClick={() => handleAuth('register')}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
                Create Free Account
              </button>
              <button className="btn-secondary" onClick={handleHub}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                Explore the Hub
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ══ */}
      <footer id="about">
        <div className="footer-inner">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="footer-logo">
                <div className="footer-logo-mark">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#c8222f" strokeWidth="2" strokeLinecap="round">
                    <polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" />
                  </svg>
                </div>
                <div>
                  <span className="footer-logo-name">CODE<span>BRIGHT</span></span>
                  <span className="footer-logo-sub">Engineering Excellence</span>
                </div>
              </div>
              <p className="footer-tagline">The definitive platform for engineers who demand more. Master your craft through competitive coding and collaborative learning.</p>
              <button className="footer-start" onClick={() => handleAuth('register')}>
                Start Building
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="footer-links">
              {[
                { title:"Platform", links:["Explore","Challenges","Factions","Leaderboard"] },
                { title:"Resources", links:["User Guide","Documentation","API Reference","Community"] },
                { title:"Connect", social: true },
              ].map(group => (
                <div className="f-group" key={group.title}>
                  <div className="f-group-title">{group.title}</div>
                  {group.social ? (
                    <div className="social-row">
                      {[
                        <svg key="gh" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.28 1.15-.28 2.35 0 3.5-.73 1.02-1.08 2.25-1 3.5 0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>,
                        <svg key="tw" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>,
                        <svg key="li" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>,
                        <svg key="em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
                      ].map((icon, i) => (
                        <a href="#" className="social-btn" key={i} onClick={e => e.preventDefault()}>{icon}</a>
                      ))}
                    </div>
                  ) : (
                    <div className="f-link-list">
                      {group.links.map(link => (
                        <a href="#" className="f-link" key={link} onClick={e => e.preventDefault()}>
                          <span className="f-link-dot" />{link}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div className="footer-bottom">
            <span className="footer-copy">© 2025 CodeBright. Crafted with precision.</span>
            <div className="footer-legal">
              <a href="#" onClick={e => e.preventDefault()}>Privacy</a>
              <span className="footer-sep">•</span>
              <a href="#" onClick={e => e.preventDefault()}>Terms</a>
              <span className="footer-sep">•</span>
              <a href="#" onClick={e => e.preventDefault()}>Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}