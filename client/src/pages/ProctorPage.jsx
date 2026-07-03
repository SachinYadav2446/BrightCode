import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Lock, Zap, Video, Monitor, Code2,
  FileText, UserCheck, AlertTriangle, Star
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Chatbot from '../components/Chatbot';
import './ProctorPage.css';

/* ───────────────────────────────────────────────────────
   LOCKED FEATURE LIST
─────────────────────────────────────────────────────── */
const LOCKED_FEATURES = [
  { icon: <Video size={20} />,    title: 'Two-way video & audio',   desc: 'Full HD streams between interviewer and candidates' },
  { icon: <Monitor size={20} />,  title: 'Screen share monitoring', desc: 'See exactly what candidates are doing in real time' },
  { icon: <Code2 size={20} />,    title: 'Live code editor',        desc: 'Monaco editor with multi-language support' },
  { icon: <Shield size={20} />,   title: 'Violation tracking',      desc: 'Auto-detect tab switches, copy-paste, and focus loss' },
  { icon: <FileText size={20} />, title: 'Push questions live',     desc: 'Send coding problems directly to candidate screen' },
  { icon: <Lock size={20} />,     title: 'Access code protection',  desc: 'Optional codes to prevent unauthorized access' },
];

/* ───────────────────────────────────────────────────────
   MAIN PAGE — LOCKED / COMING SOON
─────────────────────────────────────────────────────── */
const ProctorPage = () => {
  const { loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { window.scrollTo(0, 0); }, []);

  if (authLoading) {
    return (
      <div className="pp-page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div className="pp-spinner" />
      </div>
    );
  }

  return (
    <div className="pp-page">

      {/* Mode Switcher */}
      <div className="workspace-mode-selector">
        <button className="mode-btn" onClick={() => navigate('/workspace')}>
          <Code2 size={14} />
          <span>Workspace</span>
        </button>
        <button className="mode-btn active">
          <Shield size={14} />
          <span>Proctor</span>
        </button>
      </div>

      {/* ── LOCKED HERO ── */}
      <section className="pp-hero pp-hero-locked">
        <div className="pp-hero-bg">
          <div className="pp-hero-glow pp-hero-glow-1" />
          <div className="pp-hero-glow pp-hero-glow-2" />
          <div className="pp-hero-grid" />
        </div>

        <div className="pp-hero-inner pp-hero-inner-centered">
          <motion.div
            className="pp-hero-content pp-hero-content-centered"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Pulsing lock icon */}
            <motion.div
              className="pp-locked-icon-wrap"
              animate={{
                scale: [1, 1.05, 1],
                boxShadow: [
                  '0 0 0 0px rgba(249, 115, 22,0.0)',
                  '0 0 0 18px rgba(249, 115, 22,0.06)',
                  '0 0 0 0px rgba(249, 115, 22,0.0)',
                ],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
            >
              <Lock size={40} />
            </motion.div>

            {/* Warning badge */}
            <div className="pp-locked-badge">
              <AlertTriangle size={12} />
              <span>Feature Locked — Coming Soon</span>
            </div>

            <h1 className="pp-hero-title pp-hero-title-lg">
              ProctorArena is
              <br />
              <span className="pp-hero-highlight">Under Construction</span>
            </h1>

            <p className="pp-hero-desc pp-hero-desc-centered">
              We&apos;re putting the finishing touches on our full-stack proctoring platform.
              Live video, real-time code monitoring, AI violation tracking, and secure session
              management — coming very soon.
            </p>

            {/* ETA */}
            <div className="pp-locked-eta">
              <Zap size={14} />
              <span>
                Expected launch: <strong>Q3 2026</strong> — all users will be notified automatically
              </span>
            </div>

            {/* Disabled CTAs */}
            <div className="pp-cta-row pp-cta-row-locked">
              <button className="pp-cta-primary pp-cta-disabled" disabled>
                <Lock size={16} />
                Create Session — Locked
              </button>
              <button className="pp-cta-secondary pp-cta-disabled" disabled>
                <UserCheck size={16} />
                Join Session — Locked
              </button>
            </div>

            <p className="pp-locked-note">
              <Star size={11} style={{ color: '#f59e0b' }} />
              Your account and any future sessions will be preserved when the feature launches.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES PREVIEW (shown locked) ── */}
      <section className="pp-features-strip pp-features-locked">
        <div className="pp-features-inner">
          {LOCKED_FEATURES.map((f, i) => (
            <motion.div
              key={i}
              className="pp-feat-item pp-feat-item-locked"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="pp-feat-icon">{f.icon}</div>
              <div>
                <div className="pp-feat-name">{f.title}</div>
                <div className="pp-feat-desc">{f.desc}</div>
              </div>
              <Lock size={12} className="pp-feat-lock-icon" />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── WHAT'S COMING ── */}
      <section className="pp-how-section">
        <div className="pp-how-inner">
          <h2 className="pp-how-title">What&apos;s Coming</h2>
          <p className="pp-how-sub">Three powerful modes launching at once</p>
          <div className="pp-steps">
            {[
              {
                num: '01',
                title: 'Technical Interview',
                desc: 'Conduct live coding interviews with HD video, shared editor, and real-time violation tracking.',
                color: 'var(--primary)',
                icon: <Video size={20} />,
              },
              {
                num: '02',
                title: 'Coding Assessment',
                desc: 'Deploy timed assessments to candidates with auto-grading, complexity analysis, and Sentinel AI monitoring.',
                color: 'var(--primary)',
                icon: <FileText size={20} />,
              },
              {
                num: '03',
                title: 'Proctored Exam',
                desc: 'Full lockdown mode with webcam face detection, screen capture, tab-switch blocking, and integrity scoring.',
                color: '#f59e0b',
                icon: <Shield size={20} />,
              },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="pp-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="pp-step-num" style={{ color: step.color }}>{step.num}</div>
                <div
                  className="pp-step-icon"
                  style={{
                    background: step.color + '15',
                    borderColor: step.color + '30',
                    color: step.color,
                  }}
                >
                  {step.icon}
                </div>
                <h3 className="pp-step-title">{step.title}</h3>
                <p className="pp-step-desc">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Chatbot />
    </div>
  );
};

export default ProctorPage;
