import API_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Plus, Users, Clock, Play, Eye, Trash2,
  Copy, AlertTriangle, Lock, Camera, Search, X,
  Video, Code2, CheckCircle, Zap, Crown, ArrowRight,
  Monitor, FileText, UserCheck, ChevronRight, Star,
  Activity, TrendingUp, BarChart2, Check
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Chatbot from '../components/Chatbot';
import './ProctorPage.css';

/* ───────────────────────────────────────────────────────
   CONSTANTS
─────────────────────────────────────────────────────── */
const MODES = {
  INTERVIEW:  { label: 'Technical Interview', color: '#3b82f6', icon: Video,    desc: 'Live coding with real-time oversight' },
  ASSESSMENT: { label: 'Coding Assessment',   color: '#f59e0b', icon: FileText, desc: 'Timed test with monitoring' },
  EXAM:       { label: 'Proctored Exam',       color: '#ef4444', icon: Shield,   desc: 'Full surveillance lockdown' },
};

const STATUS_MAP = {
  created:    { label: 'Ready',      color: '#52525b' },
  lobby:      { label: 'Lobby',      color: '#3b82f6' },
  active:     { label: 'Live',       color: '#22c55e' },
  paused:     { label: 'Paused',     color: '#f59e0b' },
  completed:  { label: 'Completed',  color: '#8b5cf6' },
  terminated: { label: 'Terminated', color: '#ef4444' },
};

const FEATURES = [
  { icon: <Video size={20} />,    title: 'Two-way video & audio',   desc: 'Full HD streams between interviewer and candidates' },
  { icon: <Monitor size={20} />,  title: 'Screen share monitoring', desc: 'See exactly what candidates are doing in real time' },
  { icon: <Code2 size={20} />,    title: 'Live code editor',        desc: 'Monaco editor with multi-language support' },
  { icon: <Shield size={20} />,   title: 'Violation tracking',      desc: 'Auto-detect tab switches, copy-paste, and focus loss' },
  { icon: <FileText size={20} />, title: 'Push questions live',     desc: 'Send coding problems directly to candidate screen' },
  { icon: <Lock size={20} />,     title: 'Access code protection',  desc: 'Optional codes to prevent unauthorized access' },
];

/* ───────────────────────────────────────────────────────
   CREATE SESSION MODAL
─────────────────────────────────────────────────────── */
const CreateSessionModal = ({ onClose, onCreated }) => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm] = useState({
    title: '', mode: 'INTERVIEW', timeLimit: 60,
    settings: { requireCamera: true, requireFullscreen: true, allowTabSwitch: false, accessCode: '' },
  });
  const [creating, setCreating] = useState(false);
  const [step, setStep] = useState(1); // 1=type, 2=details, 3=security

  const createSession = async () => {
    if (!form.title.trim()) { toast.error('Session title is required'); return; }
    setCreating(true);
    try {
      const res = await axios.post(`${API_URL}/api/proctor/create-session`, {
        title: form.title.trim(), mode: form.mode,
        timeLimit: form.timeLimit * 60, questions: [],
        participants: [], settings: form.settings,
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Session created!');
      navigate(`/proctor/${res.data.sessionId}`);
      onClose();
    } catch (e) { toast.error(e?.response?.data?.error || 'Failed to create'); }
    finally    { setCreating(false); }
  };

  const selectedMode = MODES[form.mode];

  return (
    <div className="pp-modal-overlay" onClick={onClose}>
      <motion.div
        className="pp-modal pp-modal-lg"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="pp-modal-header">
          <div className="pp-modal-header-left">
            <div className="pp-modal-icon-wrap" style={{ background: `${selectedMode.color}15`, borderColor: `${selectedMode.color}30` }}>
              {React.createElement(selectedMode.icon, { size: 20, style: { color: selectedMode.color } })}
            </div>
            <div>
              <h3 className="pp-modal-title">Create New Session</h3>
              <p className="pp-modal-subtitle">Configure your proctored environment</p>
            </div>
          </div>
          <button className="pp-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="pp-modal-body">
          {/* Step 1: Mode selection */}
          <div className="pp-field">
            <label className="pp-label">Session Type</label>
            <div className="pp-mode-grid">
              {Object.entries(MODES).map(([key, m]) => {
                const Icon = m.icon;
                const sel  = form.mode === key;
                return (
                  <button
                    key={key}
                    className={`pp-mode-card ${sel ? 'selected' : ''}`}
                    style={sel ? { borderColor: m.color + '50', background: m.color + '0a' } : {}}
                    onClick={() => setForm(f => ({ ...f, mode: key }))}
                  >
                    <div className="pp-mode-card-icon" style={{ background: m.color + '15', color: m.color }}>
                      <Icon size={18} />
                    </div>
                    <div className="pp-mode-card-text">
                      <div className="pp-mode-card-name" style={sel ? { color: m.color } : {}}>
                        {key === 'INTERVIEW' ? 'Interview' : key === 'ASSESSMENT' ? 'Assessment' : 'Exam'}
                      </div>
                      <div className="pp-mode-card-desc">{m.desc}</div>
                    </div>
                    {sel && <CheckCircle size={14} className="pp-mode-check" style={{ color: m.color }} />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Duration */}
          <div className="pp-row2">
            <div className="pp-field">
              <label className="pp-label">Session Title <span className="pp-req">*</span></label>
              <input
                className="pp-input"
                placeholder="e.g. Senior Frontend Interview"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="pp-field">
              <label className="pp-label">Duration (minutes)</label>
              <input
                className="pp-input"
                type="number" min={5} max={480}
                value={form.timeLimit}
                onChange={e => setForm(f => ({ ...f, timeLimit: parseInt(e.target.value) || 60 }))}
              />
            </div>
          </div>

          {/* Security toggles */}
          <div className="pp-field">
            <label className="pp-label">Security Settings</label>
            <div className="pp-security-list">
              {[
                { key: 'requireCamera',     icon: Camera,        label: 'Require Camera',   desc: 'Candidate must enable camera to proceed' },
                { key: 'requireFullscreen', icon: Monitor,       label: 'Force Fullscreen', desc: 'Lock browser in fullscreen mode' },
                { key: 'allowTabSwitch',    icon: AlertTriangle, label: 'Allow Tab Switch', desc: 'Permit navigating away from the tab' },
              ].map(({ key, icon: Icon, label, desc }) => (
                <div
                  key={key}
                  className={`pp-security-item ${form.settings[key] ? 'on' : ''}`}
                  onClick={() => setForm(f => ({ ...f, settings: { ...f.settings, [key]: !f.settings[key] } }))}
                >
                  <div className="pp-sec-left">
                    <Icon size={14} />
                    <div>
                      <div className="pp-sec-label">{label}</div>
                      <div className="pp-sec-desc">{desc}</div>
                    </div>
                  </div>
                  <div className={`pp-toggle ${form.settings[key] ? 'on' : ''}`}>
                    <div className="pp-toggle-knob" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Access code */}
          <div className="pp-field">
            <label className="pp-label">Access Code <span className="pp-opt">— optional</span></label>
            <input
              className="pp-input"
              placeholder="Leave blank for open access"
              value={form.settings.accessCode}
              onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, accessCode: e.target.value } }))}
            />
          </div>
        </div>

        <div className="pp-modal-footer">
          <div className="pp-preview-chips">
            <span className="pp-chip" style={{ color: selectedMode.color, borderColor: selectedMode.color + '30', background: selectedMode.color + '0a' }}>
              {selectedMode.label}
            </span>
            <span className="pp-chip"><Clock size={11} /> {form.timeLimit}m</span>
            {form.settings.requireCamera     && <span className="pp-chip"><Camera size={11} /> Camera</span>}
            {form.settings.requireFullscreen && <span className="pp-chip"><Monitor size={11} /> Fullscreen</span>}
            {!form.settings.allowTabSwitch   && <span className="pp-chip"><Lock size={11} /> Tab Lock</span>}
          </div>
          <div className="pp-modal-actions">
            <button className="pp-btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="pp-btn-primary"
              onClick={createSession}
              disabled={creating || !form.title.trim()}
            >
              {creating ? <><div className="pp-spinner-sm" /> Creating…</> : <><Zap size={14} /> Create & Enter</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ───────────────────────────────────────────────────────
   JOIN SESSION MODAL
─────────────────────────────────────────────────────── */
const JoinSessionModal = ({ onClose }) => {
  const { user } = useAuth();
  const navigate  = useNavigate();
  const [joinId,   setJoinId]   = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [joining,  setJoining]  = useState(false);

  const joinSession = async () => {
    if (!joinId.trim()) { toast.error('Enter a session ID'); return; }
    setJoining(true);
    try {
      await axios.post(`${API_URL}/api/proctor/join-session`, {
        sessionId: joinId.trim(), accessCode: joinCode,
      }, { headers: { Authorization: `Bearer ${user.token}` } });
      navigate(`/proctor/${joinId.trim()}`);
      onClose();
    } catch (e) { toast.error(e?.response?.data?.error || 'Failed to join'); }
    finally    { setJoining(false); }
  };

  return (
    <div className="pp-modal-overlay" onClick={onClose}>
      <motion.div
        className="pp-modal pp-modal-sm"
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <div className="pp-modal-header">
          <div className="pp-modal-header-left">
            <div className="pp-modal-icon-wrap" style={{ background: 'rgba(59,130,246,0.1)', borderColor: 'rgba(59,130,246,0.25)' }}>
              <UserCheck size={20} style={{ color: '#3b82f6' }} />
            </div>
            <div>
              <h3 className="pp-modal-title">Join a Session</h3>
              <p className="pp-modal-subtitle">Enter the ID provided by your interviewer</p>
            </div>
          </div>
          <button className="pp-modal-close" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="pp-modal-body">
          <div className="pp-field">
            <label className="pp-label">Session ID <span className="pp-req">*</span></label>
            <input
              className="pp-input pp-input-mono"
              placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
              value={joinId}
              onChange={e => setJoinId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && joinSession()}
              autoFocus
            />
          </div>
          <div className="pp-field">
            <label className="pp-label">Access Code <span className="pp-opt">— if required</span></label>
            <input
              className="pp-input"
              placeholder="Enter access code"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
            />
          </div>
          <div className="pp-join-notice">
            <AlertTriangle size={13} />
            Joining enables camera, fullscreen enforcement, and violation monitoring as configured by the host.
          </div>
        </div>

        <div className="pp-modal-footer">
          <div className="pp-modal-actions">
            <button className="pp-btn-ghost" onClick={onClose}>Cancel</button>
            <button
              className="pp-btn-primary"
              onClick={joinSession}
              disabled={joining || !joinId.trim()}
            >
              {joining ? <><div className="pp-spinner-sm" /> Joining…</> : <><ChevronRight size={14} /> Join Session</>}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

/* ───────────────────────────────────────────────────────
   MAIN PAGE COMPONENT
─────────────────────────────────────────────────────── */
const ProctorPage = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [sessions,     setSessions]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [showCreate,   setShowCreate]   = useState(false);
  const [showJoin,     setShowJoin]     = useState(false);
  const [search,       setSearch]       = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [copiedId,     setCopiedId]     = useState(null);

  useEffect(() => { window.scrollTo(0, 0); loadSessions(); }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/proctor/my-sessions`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSessions(res.data.sessions || []);
    } catch { setSessions([]); }
    finally  { setLoading(false); }
  };

  const startSession = async (id) => {
    try { await axios.post(`${API_URL}/api/proctor/start-session`, { sessionId: id }, { headers: { Authorization: `Bearer ${user.token}` } }); } catch {}
    navigate(`/proctor/${id}`);
  };

  const deleteSession = async (id) => {
    if (!window.confirm('Permanently delete this session?')) return;
    try {
      await axios.delete(`${API_URL}/api/proctor/session/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
      toast.success('Session deleted');
      setSessions(p => p.filter(s => s.id !== id));
    } catch { toast.error('Could not delete'); }
  };

  const copyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('Session ID copied');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredSessions = sessions.filter(s => {
    if (filterStatus !== 'all' && s.status !== filterStatus) return false;
    if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const activeSessions  = sessions.filter(s => s.status === 'active');
  const completedCount  = sessions.filter(s => s.status === 'completed').length;
  const totalCandidates = sessions.reduce((a, s) => a + (s.participants?.length || 0), 0);

  return (
    <div className="pp-page">
      {/* Mode Switcher */}
      <div className="workspace-mode-selector">
        <button 
          className="mode-btn"
          onClick={() => navigate('/workspace')}
        >
          <Code2 size={14} />
          <span>Workspace</span>
        </button>
        <button 
          className="mode-btn active"
        >
          <Shield size={14} />
          <span>Proctor</span>
        </button>
      </div>

      {/* ── HERO ── */}
      <section className="pp-hero">
        <div className="pp-hero-bg">
          <div className="pp-hero-glow pp-hero-glow-1" />
          <div className="pp-hero-glow pp-hero-glow-2" />
          <div className="pp-hero-grid" />
        </div>
        <div className="pp-hero-inner">
          <motion.div
            className="pp-hero-content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="pp-hero-pill">
              <Shield size={13} />
              <span>ProctorArena — BrightCode</span>
            </div>
            <h1 className="pp-hero-title">
              Conduct Interviews
              <br />
              <span className="pp-hero-highlight">Without Compromise</span>
            </h1>
            <p className="pp-hero-desc">
              A full-stack proctoring platform with live video, real-time code monitoring,
              violation tracking, and secure session management.
            </p>

            {/* Stats */}
            <div className="pp-hero-stats">
              <div className="pp-stat-item">
                <span className="pp-stat-val" style={{ color: '#22c55e' }}>{activeSessions.length}</span>
                <span className="pp-stat-lbl">Live Now</span>
              </div>
              <div className="pp-stat-sep" />
              <div className="pp-stat-item">
                <span className="pp-stat-val">{sessions.length}</span>
                <span className="pp-stat-lbl">Total Sessions</span>
              </div>
              <div className="pp-stat-sep" />
              <div className="pp-stat-item">
                <span className="pp-stat-val" style={{ color: '#8b5cf6' }}>{completedCount}</span>
                <span className="pp-stat-lbl">Completed</span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="pp-cta-row">
              <motion.button
                className="pp-cta-primary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowCreate(true)}
              >
                <Plus size={18} />
                Create Session
              </motion.button>
              <motion.button
                className="pp-cta-secondary"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowJoin(true)}
              >
                <UserCheck size={18} />
                Join Session
              </motion.button>
            </div>
          </motion.div>

          {/* Hero visual */}
          <motion.div
            className="pp-hero-visual"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <div className="pp-session-mockup">
              <div className="pp-mockup-bar">
                <div className="pp-mockup-dots">
                  <span /><span /><span />
                </div>
                <div className="pp-mockup-title">
                  <Shield size={12} style={{ color: '#ef4444' }} />
                  ProctorArena — Interview Session
                </div>
                <div className="pp-mockup-live"><span className="pp-live-dot" /> Live</div>
              </div>
              <div className="pp-mockup-body">
                {/* Video feeds */}
                <div className="pp-mockup-videos">
                  <div className="pp-mockup-vid pp-mockup-vid-main">
                    <div className="pp-mockup-vid-placeholder">
                      <div className="pp-mockup-avatar pp-mockup-avatar-lg">A</div>
                      <span>Interviewer</span>
                    </div>
                    <div className="pp-vid-label">Admin</div>
                    <div className="pp-vid-live" />
                  </div>
                  <div className="pp-mockup-vid pp-mockup-vid-sm">
                    <div className="pp-mockup-vid-placeholder">
                      <div className="pp-mockup-avatar pp-mockup-avatar-sm">C</div>
                      <span>Candidate</span>
                    </div>
                    <div className="pp-vid-label">Candidate</div>
                  </div>
                </div>
                {/* Code area */}
                <div className="pp-mockup-code">
                  <div className="pp-mockup-code-bar">
                    <Code2 size={11} style={{ color: '#3b82f6' }} />
                    <span>main.py</span>
                    <span className="pp-code-lang">Python</span>
                  </div>
                  <div className="pp-code-lines">
                    <div className="pp-code-line"><span className="pp-ln">1</span><span className="pp-kw">def </span><span className="pp-fn">two_sum</span><span className="pp-pu">(nums, target):</span></div>
                    <div className="pp-code-line"><span className="pp-ln">2</span><span className="pp-ind" /><span className="pp-va">seen</span><span className="pp-pu"> = {}</span></div>
                    <div className="pp-code-line pp-code-active"><span className="pp-ln">3</span><span className="pp-ind" /><span className="pp-kw">for </span><span className="pp-va">i, n</span><span className="pp-kw"> in </span><span className="pp-fn">enumerate</span><span className="pp-pu">(nums):</span></div>
                    <div className="pp-code-line"><span className="pp-ln">4</span><span className="pp-ind" /><span className="pp-ind" /><span className="pp-kw">if </span><span className="pp-va">target</span><span className="pp-pu"> - n </span><span className="pp-kw">in </span><span className="pp-va">seen</span><span className="pp-pu">:</span></div>
                    <div className="pp-code-line"><span className="pp-ln">5</span><span className="pp-ind" /><span className="pp-ind" /><span className="pp-ind" /><span className="pp-kw">return </span><span className="pp-pu">[</span><span className="pp-va">seen</span><span className="pp-pu">[</span><span className="pp-va">target</span><span className="pp-pu"> - </span><span className="pp-va">n</span><span className="pp-pu">], </span><span className="pp-va">i</span><span className="pp-pu">]</span></div>
                    <div className="pp-cursor-blink" />
                  </div>
                </div>
              </div>
              {/* Status bar */}
              <div className="pp-mockup-status">
                <span className="pp-status-chip pp-status-chip-green"><span /> 1 Candidate Active</span>
                <span className="pp-status-chip"><Clock size={10} /> 32:14 remaining</span>
                <span className="pp-status-chip pp-status-chip-amber"><AlertTriangle size={10} /> 0 violations</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES STRIP ── */}
      <section className="pp-features-strip">
        <div className="pp-features-inner">
          {FEATURES.map((f, i) => (
            <motion.div
              key={i}
              className="pp-feat-item"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
            >
              <div className="pp-feat-icon">{f.icon}</div>
              <div>
                <div className="pp-feat-name">{f.title}</div>
                <div className="pp-feat-desc">{f.desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── SESSIONS TABLE ── */}
      <section className="pp-sessions-section">
        <div className="pp-sessions-inner">
          {/* Section header */}
          <div className="pp-section-header">
            <div>
              <h2 className="pp-section-title">Your Sessions</h2>
              <p className="pp-section-sub">Manage and monitor all your proctored sessions</p>
            </div>
            <div className="pp-section-actions">
              <div className="pp-search-wrap">
                <Search size={14} />
                <input
                  className="pp-search"
                  placeholder="Search sessions…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && <button className="pp-search-x" onClick={() => setSearch('')}><X size={12} /></button>}
              </div>
              <select className="pp-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                <option value="all">All status</option>
                <option value="created">Ready</option>
                <option value="active">Live</option>
                <option value="completed">Completed</option>
                <option value="terminated">Terminated</option>
              </select>
              <button className="pp-btn-primary pp-new-btn" onClick={() => setShowCreate(true)}>
                <Plus size={14} /> New Session
              </button>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="pp-loading">
              <div className="pp-spinner" />
              <span>Loading sessions…</span>
            </div>
          ) : filteredSessions.length === 0 ? (
            <div className="pp-empty">
              <div className="pp-empty-icon"><Shield size={40} /></div>
              <h3 className="pp-empty-title">{search ? 'No matching sessions' : 'No sessions yet'}</h3>
              <p className="pp-empty-sub">
                {search
                  ? 'Try a different search term or clear filters'
                  : 'Create your first interview session to get started'}
              </p>
              {!search && (
                <button className="pp-btn-primary" onClick={() => setShowCreate(true)}>
                  <Plus size={14} /> Create Session
                </button>
              )}
            </div>
          ) : (
            <div className="pp-table">
              <div className="pp-table-head">
                <span>Session</span>
                <span>Mode</span>
                <span>Status</span>
                <span>Duration</span>
                <span>Candidates</span>
                <span>Actions</span>
              </div>
              <div className="pp-table-body">
                {filteredSessions.map((s, i) => {
                  const mode   = MODES[s.mode]         || MODES.INTERVIEW;
                  const status = STATUS_MAP[s.status]  || STATUS_MAP.created;
                  const ModeIcon = mode.icon;
                  const isOwner  = s.creatorId === user?.id;
                  const canStart = isOwner && ['created', 'lobby'].includes(s.status);
                  const canEnter = ['active', 'lobby'].includes(s.status);
                  const isDone   = ['completed', 'terminated'].includes(s.status);

                  return (
                    <motion.div
                      key={s.id}
                      className="pp-table-row"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <div className="pp-col-title">
                        <span className="pp-row-title">{s.title}</span>
                        <span className="pp-row-id">{s.id.substring(0, 12)}…</span>
                      </div>
                      <div className="pp-col-mode">
                        <ModeIcon size={12} style={{ color: mode.color }} />
                        <span style={{ color: mode.color }}>
                          {s.mode === 'INTERVIEW' ? 'Interview' : s.mode === 'ASSESSMENT' ? 'Assessment' : 'Exam'}
                        </span>
                      </div>
                      <div className="pp-col-status">
                        <span
                          className={`pp-status-dot ${status.pulse ? 'pulse' : ''}`}
                          style={{ background: status.color }}
                        />
                        <span style={{ color: status.color }}>{status.label}</span>
                      </div>
                      <div className="pp-col-dur">
                        <Clock size={12} />
                        <span>{Math.floor((s.timeLimit || 0) / 60)}m</span>
                      </div>
                      <div className="pp-col-cands">
                        <Users size={12} />
                        <span>{s.participants?.length ?? 0}</span>
                        {s.violationCount > 0 && (
                          <span className="pp-viol-chip"><AlertTriangle size={10} /> {s.violationCount}</span>
                        )}
                      </div>
                      <div className="pp-col-actions">
                        {canStart && (
                          <button className="pp-action-btn pp-action-primary" onClick={() => startSession(s.id)}>
                            <Play size={11} /> Start
                          </button>
                        )}
                        {canEnter && !canStart && (
                          <button className="pp-action-btn pp-action-enter" onClick={() => navigate(`/proctor/${s.id}`)}>
                            <Eye size={11} /> Enter
                          </button>
                        )}
                        {isDone && isOwner && (
                          <button className="pp-action-btn pp-action-danger" onClick={() => deleteSession(s.id)}>
                            <Trash2 size={11} /> Delete
                          </button>
                        )}
                        <button
                          className="pp-action-icon"
                          title="Copy session ID"
                          onClick={() => copyId(s.id)}
                        >
                          {copiedId === s.id ? <Check size={12} /> : <Copy size={12} />}
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="pp-how-section">
        <div className="pp-how-inner">
          <h2 className="pp-how-title">How It Works</h2>
          <p className="pp-how-sub">Get started in three simple steps</p>
          <div className="pp-steps">
            {[
              { num: '01', title: 'Create a Session', desc: 'Configure your session type, duration, and security settings. Choose between Interview, Assessment, or Exam mode.', color: '#ef4444', icon: <Plus size={20} /> },
              { num: '02', title: 'Invite Candidates', desc: "Share the session ID with your candidates. They join using the ID, and optionally an access code if you've set one.", color: '#3b82f6', icon: <Users size={20} /> },
              { num: '03', title: 'Monitor in Real-time', desc: "Watch candidate screens, track violations, push coding questions live, and end sessions when you're done.", color: '#22c55e', icon: <Shield size={20} /> },
            ].map((step, i) => (
              <motion.div
                key={i}
                className="pp-step"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.12 }}
              >
                <div className="pp-step-num" style={{ color: step.color }}>{step.num}</div>
                <div className="pp-step-icon" style={{ background: step.color + '15', borderColor: step.color + '30', color: step.color }}>
                  {step.icon}
                </div>
                <h3 className="pp-step-title">{step.title}</h3>
                <p className="pp-step-desc">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modals */}
      <AnimatePresence>
        {showCreate && <CreateSessionModal onClose={() => setShowCreate(false)} onCreated={loadSessions} />}
        {showJoin   && <JoinSessionModal   onClose={() => setShowJoin(false)} />}
      </AnimatePresence>

      <Chatbot />
    </div>
  );
};

export default ProctorPage;
