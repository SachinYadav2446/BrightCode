import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Shield, Users, Timer, Eye, Play, Trash2,
    Copy, Clock, AlertTriangle, Lock, Camera,
    Search, ChevronRight, Zap, Crown, ArrowRight,
    Video, Code2, CheckCircle, X, Circle,
    Mic, Monitor, FileText, Settings, UserCheck
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ProctorHub.css';

const MODES = {
    INTERVIEW:  { label: 'Technical Interview', color: '#3b82f6', icon: Video,    desc: 'Live coding with real-time oversight' },
    ASSESSMENT: { label: 'Coding Assessment',   color: '#f59e0b', icon: FileText, desc: 'Timed test with monitoring' },
    EXAM:       { label: 'Proctored Exam',       color: '#ef4444', icon: Shield,   desc: 'Full surveillance lockdown' },
};

const STATUS_MAP = {
    created:    { label: 'Ready',      color: '#52525b', pulse: false },
    lobby:      { label: 'Lobby',      color: '#3b82f6', pulse: true },
    active:     { label: 'Live',       color: '#22c55e', pulse: true },
    paused:     { label: 'Paused',     color: '#f59e0b', pulse: false },
    completed:  { label: 'Completed',  color: '#8b5cf6', pulse: false },
    terminated: { label: 'Terminated', color: '#ef4444', pulse: false },
};

const ProctorHub = () => {
    const { user } = useAuth();
    const navigate  = useNavigate();

    const [sessions,     setSessions]     = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [activeTab,    setActiveTab]    = useState('sessions'); // sessions | create | join
    const [search,       setSearch]       = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    const [form, setForm] = useState({
        title: '', mode: 'INTERVIEW', timeLimit: 60,
        settings: { requireCamera: true, requireFullscreen: true, allowTabSwitch: false, accessCode: '' },
    });
    const [joinId,   setJoinId]   = useState('');
    const [joinCode, setJoinCode] = useState('');
    const [creating, setCreating] = useState(false);
    const [joining,  setJoining]  = useState(false);

    useEffect(() => { loadSessions(); }, []);

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

    const createSession = async () => {
        if (!form.title.trim()) { toast.error('Session title is required'); return; }
        setCreating(true);
        try {
            const res = await axios.post(`${API_URL}/api/proctor/create-session`, {
                title: form.title.trim(), mode: form.mode,
                timeLimit: form.timeLimit, questions: [],
                participants: [], settings: form.settings,
            }, { headers: { Authorization: `Bearer ${user.token}` } });
            toast.success('Session created');
            navigate(`/proctor/${res.data.sessionId}`);
        } catch (e) { toast.error(e?.response?.data?.error || 'Failed to create'); }
        finally    { setCreating(false); }
    };

    const joinSession = async () => {
        if (!joinId.trim()) { toast.error('Enter a session ID'); return; }
        setJoining(true);
        try {
            await axios.post(`${API_URL}/api/proctor/join-session`, {
                sessionId: joinId.trim(), accessCode: joinCode,
            }, { headers: { Authorization: `Bearer ${user.token}` } });
            navigate(`/proctor/${joinId.trim()}`);
        } catch (e) { toast.error(e?.response?.data?.error || 'Failed to join'); }
        finally    { setJoining(false); }
    };

    const startSession = async (id) => {
        try { await axios.post(`${API_URL}/api/proctor/start-session`, { sessionId: id }, { headers: { Authorization: `Bearer ${user.token}` } }); } catch {}
        navigate(`/proctor/${id}`);
    };

    const deleteSession = async (id) => {
        if (!window.confirm('Permanently delete this session?')) return;
        try {
            await axios.delete(`${API_URL}/api/proctor/session/${id}`, { headers: { Authorization: `Bearer ${user.token}` } });
            toast.success('Deleted');
            setSessions(p => p.filter(s => s.id !== id));
        } catch { toast.error('Could not delete'); }
    };

    const filteredSessions = sessions.filter(s => {
        if (filterStatus !== 'all' && s.status !== filterStatus) return false;
        if (search && !s.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const activeSessions  = sessions.filter(s => s.status === 'active');
    const totalCandidates = sessions.reduce((a, s) => a + (s.participants?.length || 0), 0);
    const completedCount  = sessions.filter(s => s.status === 'completed').length;

    return (
        <div className="ph2-root">

            {/* ══ LEFT SIDEBAR ══ */}
            <aside className="ph2-sidebar">
                {/* Brand */}
                <div className="ph2-sidebar-brand">
                    <div className="ph2-brand-icon"><Shield size={18} /></div>
                    <div>
                        <div className="ph2-brand-name">ProctorArena</div>
                        <div className="ph2-brand-sub">Interview Platform</div>
                    </div>
                </div>

                {/* Nav */}
                <nav className="ph2-nav">
                    <button className={`ph2-nav-item ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
                        <Monitor size={16} />
                        <span>Sessions</span>
                        {activeSessions.length > 0 && <span className="ph2-nav-badge">{activeSessions.length}</span>}
                    </button>
                    <button className={`ph2-nav-item ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>
                        <Plus size={16} />
                        <span>New Session</span>
                    </button>
                    <button className={`ph2-nav-item ${activeTab === 'join' ? 'active' : ''}`} onClick={() => setActiveTab('join')}>
                        <UserCheck size={16} />
                        <span>Join Session</span>
                    </button>
                </nav>

                {/* Stats */}
                <div className="ph2-sidebar-stats">
                    <div className="ph2-stat">
                        <span className="ph2-stat-val" style={{ color: '#22c55e' }}>{activeSessions.length}</span>
                        <span className="ph2-stat-label">Live Now</span>
                    </div>
                    <div className="ph2-stat">
                        <span className="ph2-stat-val">{sessions.length}</span>
                        <span className="ph2-stat-label">Total</span>
                    </div>
                    <div className="ph2-stat">
                        <span className="ph2-stat-val" style={{ color: '#8b5cf6' }}>{completedCount}</span>
                        <span className="ph2-stat-label">Done</span>
                    </div>
                </div>

                {/* Feature bullets */}
                <div className="ph2-sidebar-features">
                    {[
                        { icon: Video,    text: 'Two-way video & audio' },
                        { icon: Monitor,  text: 'Screen share monitoring' },
                        { icon: Code2,    text: 'Live code editor' },
                        { icon: Shield,   text: 'Violation tracking' },
                        { icon: FileText, text: 'Push questions live' },
                    ].map(({ icon: Icon, text }) => (
                        <div key={text} className="ph2-feat-item">
                            <Icon size={13} />
                            <span>{text}</span>
                        </div>
                    ))}
                </div>
            </aside>

            {/* ══ MAIN CONTENT ══ */}
            <main className="ph2-main">

                {/* ── SESSIONS ── */}
                {activeTab === 'sessions' && (
                    <div className="ph2-pane">
                        {/* Top bar */}
                        <div className="ph2-topbar">
                            <div className="ph2-topbar-left">
                                <h1 className="ph2-page-title">Sessions</h1>
                                <span className="ph2-page-count">{filteredSessions.length}</span>
                            </div>
                            <div className="ph2-topbar-right">
                                <div className="ph2-search-wrap">
                                    <Search size={14} />
                                    <input className="ph2-search" placeholder="Search sessions…"
                                        value={search} onChange={e => setSearch(e.target.value)} />
                                    {search && <button className="ph2-search-x" onClick={() => setSearch('')}><X size={12} /></button>}
                                </div>
                                <select className="ph2-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                                    <option value="all">All status</option>
                                    <option value="created">Ready</option>
                                    <option value="active">Live</option>
                                    <option value="completed">Completed</option>
                                    <option value="terminated">Terminated</option>
                                </select>
                                <button className="ph2-btn-red" onClick={() => setActiveTab('create')}>
                                    <Plus size={14} /> New Session
                                </button>
                            </div>
                        </div>

                        {/* Table */}
                        {loading ? (
                            <div className="ph2-loading"><div className="ph2-spinner" /><span>Loading…</span></div>
                        ) : filteredSessions.length === 0 ? (
                            <div className="ph2-empty">
                                <div className="ph2-empty-icon"><Shield size={36} /></div>
                                <p className="ph2-empty-title">No sessions yet</p>
                                <p className="ph2-empty-sub">Create your first interview session to get started</p>
                                <button className="ph2-btn-red" onClick={() => setActiveTab('create')}><Plus size={14} /> Create Session</button>
                            </div>
                        ) : (
                            <div className="ph2-table">
                                <div className="ph2-table-head">
                                    <span>Title</span>
                                    <span>Mode</span>
                                    <span>Status</span>
                                    <span>Duration</span>
                                    <span>Candidates</span>
                                    <span>Actions</span>
                                </div>
                                {filteredSessions.map((s, i) => {
                                    const mode   = MODES[s.mode]     || MODES.INTERVIEW;
                                    const status = STATUS_MAP[s.status] || STATUS_MAP.created;
                                    const ModeIcon = mode.icon;
                                    const isOwner  = s.creatorId === user?.id;
                                    const canStart = isOwner && ['created','lobby'].includes(s.status);
                                    const canEnter = ['active','lobby'].includes(s.status);
                                    const isDone   = ['completed','terminated'].includes(s.status);

                                    return (
                                        <motion.div key={s.id} className="ph2-table-row"
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.03 }}>
                                            {/* Title */}
                                            <div className="ph2-col-title">
                                                <span className="ph2-row-title">{s.title}</span>
                                                <span className="ph2-row-id">{s.id.substring(0, 12)}…</span>
                                            </div>
                                            {/* Mode */}
                                            <div className="ph2-col-mode">
                                                <ModeIcon size={13} style={{ color: mode.color }} />
                                                <span style={{ color: mode.color }}>{s.mode === 'INTERVIEW' ? 'Interview' : s.mode === 'ASSESSMENT' ? 'Assessment' : 'Exam'}</span>
                                            </div>
                                            {/* Status */}
                                            <div className="ph2-col-status">
                                                <span className={`ph2-status-dot ${status.pulse ? 'pulse' : ''}`} style={{ background: status.color }} />
                                                <span style={{ color: status.color }}>{status.label}</span>
                                            </div>
                                            {/* Duration */}
                                            <div className="ph2-col-dur">
                                                <Clock size={12} />
                                                <span>{Math.floor((s.timeLimit || 0) / 60)}m</span>
                                            </div>
                                            {/* Candidates */}
                                            <div className="ph2-col-cands">
                                                <Users size={12} />
                                                <span>{s.participants?.length ?? 0}</span>
                                                {s.violationCount > 0 && (
                                                    <span className="ph2-viol-chip"><AlertTriangle size={10} /> {s.violationCount}</span>
                                                )}
                                            </div>
                                            {/* Actions */}
                                            <div className="ph2-col-actions">
                                                {canStart && (
                                                    <button className="ph2-action-btn ph2-action-primary" onClick={() => startSession(s.id)}>
                                                        <Play size={12} /> Start
                                                    </button>
                                                )}
                                                {canEnter && !canStart && (
                                                    <button className="ph2-action-btn ph2-action-enter" onClick={() => navigate(`/proctor/${s.id}`)}>
                                                        <Eye size={12} /> Enter
                                                    </button>
                                                )}
                                                {isDone && isOwner && (
                                                    <button className="ph2-action-btn ph2-action-danger" onClick={() => deleteSession(s.id)}>
                                                        <Trash2 size={12} /> Delete
                                                    </button>
                                                )}
                                                <button className="ph2-action-icon" onClick={() => { navigator.clipboard.writeText(s.id); toast.success('ID copied'); }} title="Copy session ID">
                                                    <Copy size={13} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ── CREATE ── */}
                {activeTab === 'create' && (
                    <div className="ph2-pane ph2-pane-form">
                        <div className="ph2-topbar">
                            <div className="ph2-topbar-left">
                                <h1 className="ph2-page-title">New Session</h1>
                            </div>
                            <button className="ph2-btn-ghost" onClick={() => setActiveTab('sessions')}>
                                <X size={14} /> Cancel
                            </button>
                        </div>

                        <div className="ph2-form-layout">
                            {/* Left: form */}
                            <div className="ph2-form-left">
                                {/* Mode */}
                                <div className="ph2-field">
                                    <label className="ph2-label">Session Type</label>
                                    <div className="ph2-mode-row">
                                        {Object.entries(MODES).map(([key, m]) => {
                                            const Icon = m.icon;
                                            const sel  = form.mode === key;
                                            return (
                                                <button key={key}
                                                    className={`ph2-mode-btn ${sel ? 'selected' : ''}`}
                                                    style={sel ? { borderColor: m.color + '60', background: m.color + '0d' } : {}}
                                                    onClick={() => setForm(f => ({ ...f, mode: key }))}>
                                                    <Icon size={18} style={{ color: sel ? m.color : '#555' }} />
                                                    <div>
                                                        <div className="ph2-mode-label" style={sel ? { color: m.color } : {}}>{key === 'INTERVIEW' ? 'Interview' : key === 'ASSESSMENT' ? 'Assessment' : 'Exam'}</div>
                                                        <div className="ph2-mode-desc">{m.desc}</div>
                                                    </div>
                                                    {sel && <CheckCircle size={14} style={{ color: m.color, marginLeft: 'auto', flexShrink: 0 }} />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Title + duration */}
                                <div className="ph2-row2">
                                    <div className="ph2-field">
                                        <label className="ph2-label">Session Title <span className="ph2-req">*</span></label>
                                        <input className="ph2-input" placeholder="e.g. Senior Frontend Interview"
                                            value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                                    </div>
                                    <div className="ph2-field">
                                        <label className="ph2-label">Duration (minutes)</label>
                                        <input className="ph2-input" type="number" min={5} max={480}
                                            value={form.timeLimit} onChange={e => setForm(f => ({ ...f, timeLimit: parseInt(e.target.value) || 60 }))} />
                                    </div>
                                </div>

                                {/* Security */}
                                <div className="ph2-field">
                                    <label className="ph2-label">Security</label>
                                    <div className="ph2-security-grid">
                                        {[
                                            { key: 'requireCamera',     icon: Camera,        label: 'Require Camera',   desc: 'Candidate must enable camera' },
                                            { key: 'requireFullscreen', icon: Monitor,       label: 'Force Fullscreen', desc: 'Lock browser to fullscreen' },
                                            { key: 'allowTabSwitch',    icon: AlertTriangle, label: 'Allow Tab Switch', desc: 'Permit leaving the tab' },
                                        ].map(({ key, icon: Icon, label, desc }) => (
                                            <div key={key}
                                                className={`ph2-security-item ${form.settings[key] ? 'on' : ''}`}
                                                onClick={() => setForm(f => ({ ...f, settings: { ...f.settings, [key]: !f.settings[key] } }))}>
                                                <div className="ph2-sec-left">
                                                    <Icon size={15} />
                                                    <div>
                                                        <div className="ph2-sec-label">{label}</div>
                                                        <div className="ph2-sec-desc">{desc}</div>
                                                    </div>
                                                </div>
                                                <div className={`ph2-toggle ${form.settings[key] ? 'on' : ''}`}>
                                                    <div className="ph2-toggle-knob" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Access code */}
                                <div className="ph2-field">
                                    <label className="ph2-label">Access Code <span className="ph2-opt">— optional</span></label>
                                    <input className="ph2-input" placeholder="Leave blank for open access"
                                        value={form.settings.accessCode}
                                        onChange={e => setForm(f => ({ ...f, settings: { ...f.settings, accessCode: e.target.value } }))} />
                                </div>

                                <button className="ph2-btn-red ph2-btn-full" onClick={createSession} disabled={creating || !form.title.trim()}>
                                    {creating ? <><div className="ph2-spinner-sm" /> Creating…</> : <><Zap size={15} /> Create &amp; Enter Session</>}
                                </button>
                            </div>

                            {/* Right: preview card */}
                            <div className="ph2-form-right">
                                <div className="ph2-preview-card">
                                    <div className="ph2-preview-header">
                                        <span className="ph2-preview-label">Preview</span>
                                    </div>
                                    <div className="ph2-preview-body">
                                        <div className="ph2-preview-mode" style={{ color: MODES[form.mode]?.color }}>
                                            {React.createElement(MODES[form.mode]?.icon || Shield, { size: 16 })}
                                            {MODES[form.mode]?.label}
                                        </div>
                                        <div className="ph2-preview-title">{form.title || 'Untitled Session'}</div>
                                        <div className="ph2-preview-meta">
                                            <span><Clock size={12} /> {form.timeLimit}m</span>
                                            <span><Users size={12} /> 0 candidates</span>
                                        </div>
                                        <div className="ph2-preview-security">
                                            {form.settings.requireCamera     && <span className="ph2-sec-chip"><Camera size={11} /> Camera</span>}
                                            {form.settings.requireFullscreen && <span className="ph2-sec-chip"><Monitor size={11} /> Fullscreen</span>}
                                            {!form.settings.allowTabSwitch   && <span className="ph2-sec-chip"><Lock size={11} /> Tab Lock</span>}
                                            {form.settings.accessCode        && <span className="ph2-sec-chip ph2-sec-chip-code"><Lock size={11} /> Protected</span>}
                                        </div>
                                    </div>
                                    <div className="ph2-preview-tip">
                                        <Zap size={12} />
                                        You'll be the admin. Share the Session ID with candidates.
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── JOIN ── */}
                {activeTab === 'join' && (
                    <div className="ph2-pane ph2-pane-center">
                        <div className="ph2-join-card">
                            <div className="ph2-join-header">
                                <div className="ph2-join-icon-wrap"><ArrowRight size={24} /></div>
                                <h2>Join a Session</h2>
                                <p>Enter the session ID provided by your interviewer.</p>
                            </div>

                            <div className="ph2-field">
                                <label className="ph2-label">Session ID <span className="ph2-req">*</span></label>
                                <input className="ph2-input ph2-input-mono"
                                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                    value={joinId} onChange={e => setJoinId(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && joinSession()} />
                            </div>

                            <div className="ph2-field">
                                <label className="ph2-label">Access Code <span className="ph2-opt">— if required</span></label>
                                <input className="ph2-input"
                                    placeholder="Enter code"
                                    value={joinCode} onChange={e => setJoinCode(e.target.value)} />
                            </div>

                            <div className="ph2-join-notice">
                                <AlertTriangle size={13} />
                                Joining a session enables camera, fullscreen enforcement, and violation monitoring as configured by the host.
                            </div>

                            <button className="ph2-btn-red ph2-btn-full" onClick={joinSession} disabled={joining || !joinId.trim()}>
                                {joining ? <><div className="ph2-spinner-sm" /> Joining…</> : <><ChevronRight size={15} /> Join Session</>}
                            </button>

                            <button className="ph2-btn-ghost" onClick={() => setActiveTab('sessions')}>
                                Back to sessions
                            </button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProctorHub;
