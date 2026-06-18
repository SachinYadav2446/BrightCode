import API_URL from '../config';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Shield, Plus, Camera, Monitor, AlertTriangle, Lock,
  Video, Code2, CheckCircle, Zap, X, ArrowLeft, Clock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './CreateSessionPage.css';

/* ───────────────────────────────────────────────────────
   CONSTANTS
─────────────────────────────────────────────────────── */
const MODES = {
  INTERVIEW:  { label: 'Technical Interview', color: '#3b82f6', icon: Video,    desc: 'Live coding with real-time oversight' },
  ASSESSMENT: { label: 'Coding Assessment',   color: '#f59e0b', icon: Code2,    desc: 'Timed test with monitoring' },
  EXAM:       { label: 'Proctored Exam',       color: '#ef4444', icon: Shield,   desc: 'Full surveillance lockdown' },
};

/* ───────────────────────────────────────────────────────
   CREATE SESSION PAGE
─────────────────────────────────────────────────────── */
const CreateSessionPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', mode: 'INTERVIEW', timeLimit: 60,
    settings: { requireCamera: true, requireFullscreen: true, allowTabSwitch: false, accessCode: '' },
  });
  const [creating, setCreating] = useState(false);

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
    } catch (e) { toast.error(e?.response?.data?.error || 'Failed to create'); }
    finally { setCreating(false); }
  };

  const selectedMode = MODES[form.mode];

  return (
    <div className="csp-page">
      {/* Back Button */}
      <button className="csp-back-btn" onClick={() => navigate('/proctor')}>
        <ArrowLeft size={16} />
        <span>Back</span>
      </button>

      {/* Main Content */}
      <motion.div
        className="csp-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Title Section */}
        <div className="csp-title-section">
          <div className="csp-title-icon" style={{ background: `${selectedMode.color}15`, borderColor: `${selectedMode.color}30` }}>
            {React.createElement(selectedMode.icon, { size: 28, style: { color: selectedMode.color } })}
          </div>
          <div>
            <h1 className="csp-title">Create New Session</h1>
            <p className="csp-subtitle">Configure your proctored environment</p>
          </div>
        </div>

        {/* Grid Layout */}
        <div className="csp-grid">
          {/* Left Column - Mode & Title */}
          <div className="csp-left-col">
            {/* Session Type */}
            <div className="csp-section">
              <label className="csp-label">Session Type</label>
              <div className="csp-mode-grid">
                {Object.entries(MODES).map(([key, m]) => {
                  const Icon = m.icon;
                  const sel = form.mode === key;
                  return (
                    <button
                      key={key}
                      className={`csp-mode-card ${sel ? 'selected' : ''}`}
                      style={sel ? { borderColor: m.color + '50', background: m.color + '0a' } : {}}
                      onClick={() => setForm(f => ({ ...f, mode: key }))}
                    >
                      <div className="csp-mode-card-icon" style={{ background: m.color + '15', color: m.color }}>
                        <Icon size={18} />
                      </div>
                      <div className="csp-mode-card-text">
                        <div className="csp-mode-card-name" style={sel ? { color: m.color } : {}}>
                          {key === 'INTERVIEW' ? 'Interview' : key === 'ASSESSMENT' ? 'Assessment' : 'Exam'}
                        </div>
                        <div className="csp-mode-card-desc">{m.desc}</div>
                      </div>
                      {sel && <CheckCircle size={14} className="csp-mode-check" style={{ color: m.color }} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Title & Duration */}
            <div className="csp-section">
              <div className="csp-row2">
                <div className="csp-field">
                  <label className="csp-label">Session Title <span className="csp-req">*</span></label>
                  <input
                    className="csp-input"
                    placeholder="e.g. Senior Frontend Interview"
                    value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                    autoFocus
                  />
                </div>
                <div className="csp-field">
                  <label className="csp-label">Duration (min)</label>
                  <input
                    className="csp-input"
                    type="number" min={5} max={480}
                    value={form.timeLimit}
                    onChange={e => setForm(f => ({ ...f, timeLimit: parseInt(e.target.value) || 60 }))}
                  />
                </div>
              </div>
            </div>

            {/* Access Code */}
            <div className="csp-section">
              <div className="csp-field">
                <label className="csp-label">Access Code <span className="csp-opt">— optional</span></label>
                <input
                  className="csp-input"
                  placeholder="Leave blank for open access"
                  value={form.settings.accessCode}
                  onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, accessCode: e.target.value } }))}
                />
              </div>
            </div>
          </div>

          {/* Right Column - Security */}
          <div className="csp-right-col">
            <div className="csp-section">
              <label className="csp-label">Security Settings</label>
              <div className="csp-security-list">
                {[
                  { key: 'requireCamera',     icon: Camera,        label: 'Require Camera',   desc: 'Candidate must enable camera to proceed' },
                  { key: 'requireFullscreen', icon: Monitor,       label: 'Force Fullscreen', desc: 'Lock browser in fullscreen mode' },
                  { key: 'allowTabSwitch',    icon: AlertTriangle, label: 'Allow Tab Switch', desc: 'Permit navigating away from the tab' },
                ].map(({ key, icon: Icon, label, desc }) => (
                  <div
                    key={key}
                    className={`csp-security-item ${form.settings[key] ? 'on' : ''}`}
                    onClick={() => setForm(f => ({ ...f, settings: { ...f.settings, [key]: !f.settings[key] } }))}
                  >
                    <div className="csp-sec-left">
                      <Icon size={14} />
                      <div>
                        <div className="csp-sec-label">{label}</div>
                        <div className="csp-sec-desc">{desc}</div>
                      </div>
                    </div>
                    <div className={`csp-toggle ${form.settings[key] ? 'on' : ''}`}>
                      <div className="csp-toggle-knob" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Chips */}
            <div className="csp-section">
              <label className="csp-label">Session Preview</label>
              <div className="csp-preview-chips">
                <span className="csp-chip" style={{ color: selectedMode.color, borderColor: selectedMode.color + '30', background: selectedMode.color + '0a' }}>
                  {selectedMode.label}
                </span>
                <span className="csp-chip"><Clock size={11} /> {form.timeLimit}m</span>
                {form.settings.requireCamera     && <span className="csp-chip"><Camera size={11} /> Camera</span>}
                {form.settings.requireFullscreen && <span className="csp-chip"><Monitor size={11} /> Fullscreen</span>}
                {!form.settings.allowTabSwitch   && <span className="csp-chip"><Lock size={11} /> Tab Lock</span>}
              </div>
            </div>

            {/* Actions */}
            <div className="csp-actions">
              <button className="csp-btn-ghost" onClick={() => navigate('/proctor')}>
                Cancel
              </button>
              <button
                className="csp-btn-primary"
                onClick={createSession}
                disabled={creating || !form.title.trim()}
              >
                {creating ? <><div className="csp-spinner-sm" /> Creating…</> : <><Zap size={16} /> Create & Enter</>}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default CreateSessionPage;
