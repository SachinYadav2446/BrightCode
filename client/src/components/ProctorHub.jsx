import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Plus, Shield, Users, Timer, Eye, Play, Trash2,
    Copy, Share2, Clock, CheckCircle, XCircle,
    AlertTriangle, Lock, Camera,
    BookOpen, Search, ChevronRight, Zap, Crown, Star,
    ArrowRight, Settings
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ProctorHub.css';

const PROCTOR_MODES = {
    INTERVIEW: {
        name: 'Technical Interview',
        description: 'Live coding with real-time interviewer oversight',
        icon: <Users size={22} />,
        color: '#3b82f6',
        bg: 'rgba(59,130,246,0.08)',
        border: 'rgba(59,130,246,0.2)',
        features: ['Live Video', 'Code Editor', 'Chat'],
    },
    ASSESSMENT: {
        name: 'Coding Assessment',
        description: 'Timed test with tab-switch monitoring',
        icon: <Timer size={22} />,
        color: '#f59e0b',
        bg: 'rgba(245,158,11,0.08)',
        border: 'rgba(245,158,11,0.2)',
        features: ['Tab Monitor', 'Time Limit', 'Auto-submit'],
    },
    EXAM: {
        name: 'Proctored Exam',
        description: 'Full surveillance with browser lockdown',
        icon: <Shield size={22} />,
        color: '#ef4444',
        bg: 'rgba(239,68,68,0.08)',
        border: 'rgba(239,68,68,0.2)',
        features: ['Face Detect', 'Screen Record', 'Browser Lock'],
    },
};

const STATUS = {
    created:    { label: 'Ready',     color: '#6b7280', dot: '#6b7280' },
    lobby:      { label: 'Lobby',     color: '#3b82f6', dot: '#3b82f6' },
    active:     { label: 'Live',      color: '#22c55e', dot: '#22c55e' },
    paused:     { label: 'Paused',    color: '#f59e0b', dot: '#f59e0b' },
    completed:  { label: 'Done',      color: '#8b5cf6', dot: '#8b5cf6' },
    terminated: { label: 'Terminated',color: '#ef4444', dot: '#ef4444' },
};

const ProctorHub = () => {
    const { user } = useAuth();
    const navigate  = useNavigate();

    const [sessions,    setSessions]    = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [view,        setView]        = useState('dashboard'); // dashboard | create | join
    const [search,      setSearch]      = useState('');
    const [filterMode,  setFilterMode]  = useState('all');
    const [filterStatus,setFilterStatus]= useState('all');

    const [form, setForm] = useState({
        title: '', mode: 'INTERVIEW', timeLimit: 60,
        settings: {
            requireCamera: true, requireFullscreen: true,
            requireMicrophone: false, recordScreen: false,
            allowTabSwitch: false, maxViolations: 3,
            autoSubmit: true, accessCode: '',
        },
    });
    const [joinId,      setJoinId]      = useState('');
    const [joinCode,    setJoinCode]    = useState('');
    const [creating,    setCreating]    = useState(false);
    const [joining,     setJoining]     = useState(false);

    useEffect(() => { loadSessions(); }, []);

    const loadSessions = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_URL}/api/proctor/my-sessions`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setSessions(res.data.sessions || []);
        } catch {
            setSessions([]);
        } finally {
            setLoading(false);
        }
    };

    const createSession = async () => {
        if (!form.title.trim()) { toast.error('Give your session a title'); return; }
        setCreating(true);
        try {
            const res = await axios.post(`${API_URL}/api/proctor/create-session`, {
                title: form.title.trim(), mode: form.mode,
                timeLimit: form.timeLimit, questions: [],
                participants: [], settings: form.settings,
            }, { headers: { Authorization: `Bearer ${user.token}` } });
            toast.success('Session created');
            navigate(`/proctor/${res.data.sessionId}`);
        } catch (e) {
            toast.error(e?.response?.data?.error || 'Failed to create session');
        } finally {
            setCreating(false);
        }
    };

    const joinSession = async () => {
        if (!joinId.trim()) { toast.error('Enter a session ID'); return; }
        setJoining(true);
        try {
            await axios.post(`${API_URL}/api/proctor/join-session`, {
                sessionId: joinId.trim(), accessCode: joinCode,
            }, { headers: { Authorization: `Bearer ${user.token}` } });
            toast.success('Joined session');
            navigate(`/proctor/${joinId.trim()}`);
        } catch (e) {
            toast.error(e?.response?.data?.error || 'Failed to join session');
        } finally {
            setJoining(false);
        }
    };

    const startSession = async (id) => {
        try {
            await axios.post(`${API_URL}/api/proctor/start-session`, { sessionId: id }, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
        } catch { /* maybe already active */ }
        navigate(`/proctor/${id}`);
    };

    const deleteSession = async (id) => {
        if (!window.confirm('Delete this session?')) return;
        try {
            await axios.delete(`${API_URL}/api/proctor/session/${id}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            toast.success('Deleted');
            setSessions(prev => prev.filter(s => s.id !== id));
        } catch {
            toast.error('Could not delete session');
        }
    };

    const copyId = (id) => { navigator.clipboard.writeText(id); toast.success('Copied!'); };

    const filtered = sessions.filter(s => {
        if (filterStatus !== 'all' && s.status !== filterStatus) return false;
        if (filterMode   !== 'all' && s.mode   !== filterMode)   return false;
        if (search && !s.title.toLowerCase().includes(search.toLowerCase()) && !s.id.includes(search)) return false;
        return true;
    });

    // ── Stats ──
    const stats = {
        total:  sessions.length,
        active: sessions.filter(s => s.status === 'active').length,
        done:   sessions.filter(s => s.status === 'completed').length,
    };

    return (
        <div className="ph-root">

            {/* ── HERO BANNER ── */}
            <div className="ph-hero">
                <div className="ph-hero-inner">
                    <div className="ph-hero-left">
                        <div className="ph-hero-badge">
                            <Shield size={14} />
                            <span>Proctored Environment</span>
                        </div>
                        <h1 className="ph-hero-title">
                            Proctor<span className="ph-hero-accent">Arena</span>
                        </h1>
                        <p className="ph-hero-sub">
                            Conduct secure interviews and assessments with real-time
                            monitoring, tab-switch detection, and violation tracking.
                        </p>
                        <div className="ph-hero-stats">
                            <div className="ph-stat"><span className="ph-stat-n">{stats.total}</span><span className="ph-stat-l">Sessions</span></div>
                            <div className="ph-stat-sep" />
                            <div className="ph-stat"><span className="ph-stat-n" style={{color:'#22c55e'}}>{stats.active}</span><span className="ph-stat-l">Live</span></div>
                            <div className="ph-stat-sep" />
                            <div className="ph-stat"><span className="ph-stat-n" style={{color:'#8b5cf6'}}>{stats.done}</span><span className="ph-stat-l">Completed</span></div>
                        </div>
                        <div className="ph-hero-ctas">
                            <button className="ph-cta-primary" onClick={() => setView('create')}>
                                <Plus size={18} /> New Session
                            </button>
                            <button className="ph-cta-secondary" onClick={() => setView('join')}>
                                <ArrowRight size={18} /> Join Session
                            </button>
                        </div>
                    </div>
                    <div className="ph-hero-right">
                        <div className="ph-feature-grid">
                            {[
                                { icon: <Lock size={20} />,          label: 'Browser Lock',    desc: 'Fullscreen enforcement' },
                                { icon: <Camera size={20} />,        label: 'Face Monitoring', desc: 'Live camera feed' },
                                { icon: <AlertTriangle size={20} />, label: 'Violation Track', desc: 'Auto flag & report' },
                                { icon: <Zap size={20} />,           label: 'Instant Setup',   desc: 'Ready in seconds' },
                            ].map((f, i) => (
                                <div key={i} className="ph-feature-card">
                                    <div className="ph-feature-icon">{f.icon}</div>
                                    <div>
                                        <div className="ph-feature-label">{f.label}</div>
                                        <div className="ph-feature-desc">{f.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── TAB BAR ── */}
            <div className="ph-tabs">
                <button className={`ph-tab ${view === 'dashboard' ? 'active' : ''}`} onClick={() => setView('dashboard')}>
                    <BookOpen size={16} /> Dashboard
                </button>
                <button className={`ph-tab ${view === 'create' ? 'active' : ''}`} onClick={() => setView('create')}>
                    <Plus size={16} /> Create Session
                </button>
                <button className={`ph-tab ${view === 'join' ? 'active' : ''}`} onClick={() => setView('join')}>
                    <Users size={16} /> Join Session
                </button>
            </div>

            {/* ── CONTENT ── */}
            <div className="ph-body">
                <AnimatePresence mode="wait">

                    {/* ── DASHBOARD ── */}
                    {view === 'dashboard' && (
                        <motion.div key="dash"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.2 }}
                        >
                            {/* Toolbar */}
                            <div className="ph-toolbar">
                                <div className="ph-search-wrap">
                                    <Search size={16} className="ph-search-icon" />
                                    <input
                                        className="ph-search"
                                        placeholder="Search by title or ID…"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                    />
                                </div>
                                <div className="ph-filters">
                                    <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="ph-select">
                                        <option value="all">All Status</option>
                                        <option value="created">Ready</option>
                                        <option value="active">Live</option>
                                        <option value="completed">Done</option>
                                        <option value="terminated">Terminated</option>
                                    </select>
                                    <select value={filterMode} onChange={e => setFilterMode(e.target.value)} className="ph-select">
                                        <option value="all">All Modes</option>
                                        <option value="INTERVIEW">Interview</option>
                                        <option value="ASSESSMENT">Assessment</option>
                                        <option value="EXAM">Exam</option>
                                    </select>
                                    <button className="ph-refresh-btn" onClick={loadSessions}>Refresh</button>
                                </div>
                            </div>

                            {/* Grid */}
                            {loading ? (
                                <div className="ph-loading">
                                    <div className="ph-spinner" />
                                    <p>Loading sessions…</p>
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="ph-empty">
                                    <Shield size={52} />
                                    <h3>No sessions yet</h3>
                                    <p>Create your first proctored session to get started.</p>
                                    <button className="ph-cta-primary" onClick={() => setView('create')}>
                                        <Plus size={16} /> Create Session
                                    </button>
                                </div>
                            ) : (
                                <div className="ph-grid">
                                    {filtered.map(session => {
                                        const mode   = PROCTOR_MODES[session.mode] || PROCTOR_MODES.INTERVIEW;
                                        const status = STATUS[session.status]      || STATUS.created;
                                        const isOwner = session.creatorId === user?.id;
                                        const canStart = isOwner && ['created', 'lobby'].includes(session.status);
                                        const canJoin  = ['active', 'lobby'].includes(session.status);

                                        return (
                                            <motion.div
                                                key={session.id}
                                                className="ph-card"
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                whileHover={{ y: -3 }}
                                            >
                                                {/* Top bar */}
                                                <div className="ph-card-bar" style={{ background: mode.color }} />

                                                <div className="ph-card-inner">
                                                    {/* Header */}
                                                    <div className="ph-card-head">
                                                        <div className="ph-card-mode" style={{ color: mode.color, background: mode.bg, border: `1px solid ${mode.border}` }}>
                                                            {mode.icon}
                                                            <span>{mode.name}</span>
                                                        </div>
                                                        <div className="ph-card-status">
                                                            <span className="ph-status-dot" style={{ background: status.dot }} />
                                                            <span style={{ color: status.color }}>{status.label}</span>
                                                        </div>
                                                    </div>

                                                    {/* Title */}
                                                    <h3 className="ph-card-title">{session.title}</h3>

                                                    {/* Meta */}
                                                    <div className="ph-card-meta">
                                                        <span><Clock size={13} /> {Math.floor((session.timeLimit || 0) / 60)}m</span>
                                                        <span><Users size={13} /> {session.participants?.length ?? 0}</span>
                                                        {(session.violationCount > 0) && (
                                                            <span className="ph-meta-violation"><AlertTriangle size={13} /> {session.violationCount}</span>
                                                        )}
                                                    </div>

                                                    {/* ID row */}
                                                    <div className="ph-card-id">
                                                        <span>{session.id.substring(0, 16)}…</span>
                                                        <button onClick={() => copyId(session.id)} className="ph-icon-btn" title="Copy ID">
                                                            <Copy size={13} />
                                                        </button>
                                                        <button onClick={() => copyId(session.id)} className="ph-icon-btn" title="Share">
                                                            <Share2 size={13} />
                                                        </button>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="ph-card-actions">
                                                        {canStart && (
                                                            <button className="ph-btn ph-btn-primary" onClick={() => startSession(session.id)}>
                                                                <Play size={14} /> Start
                                                            </button>
                                                        )}
                                                        {canJoin && (
                                                            <button className="ph-btn ph-btn-secondary" onClick={() => navigate(`/proctor/${session.id}`)}>
                                                                <Eye size={14} /> Enter
                                                            </button>
                                                        )}
                                                        {/* Completed / terminated — no re-entry, only delete */}
                                                        {isOwner && ['completed', 'terminated'].includes(session.status) && (
                                                            <button className="ph-btn ph-btn-danger" onClick={() => deleteSession(session.id)}>
                                                                <Trash2 size={14} /> Delete
                                                            </button>
                                                        )}
                                                        {isOwner && session.status === 'created' && (
                                                            <button className="ph-btn ph-btn-danger" onClick={() => deleteSession(session.id)}>
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* ── CREATE ── */}
                    {view === 'create' && (
                        <motion.div key="create"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.2 }}
                            className="ph-form-wrap"
                        >
                            <div className="ph-form-card">
                                <div className="ph-form-header">
                                    <h2>Create Session</h2>
                                    <p>Set up a new proctored environment for your candidates.</p>
                                </div>

                                {/* Mode picker */}
                                <div className="ph-field">
                                    <label>Session Type</label>
                                    <div className="ph-mode-grid">
                                        {Object.entries(PROCTOR_MODES).map(([key, m]) => (
                                            <button
                                                key={key}
                                                className={`ph-mode-card ${form.mode === key ? 'selected' : ''}`}
                                                style={form.mode === key ? { borderColor: m.color, background: m.bg } : {}}
                                                onClick={() => setForm(f => ({ ...f, mode: key }))}
                                            >
                                                <div className="ph-mode-icon" style={{ color: m.color }}>{m.icon}</div>
                                                <div className="ph-mode-name">{m.name}</div>
                                                <div className="ph-mode-desc">{m.description}</div>
                                                <div className="ph-mode-tags">
                                                    {m.features.map(feat => <span key={feat} className="ph-tag">{feat}</span>)}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Title + time */}
                                <div className="ph-row-2">
                                    <div className="ph-field">
                                        <label>Session Title <span className="req">*</span></label>
                                        <input
                                            className="ph-input"
                                            placeholder="e.g. Senior Frontend Interview"
                                            value={form.title}
                                            onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                        />
                                    </div>
                                    <div className="ph-field">
                                        <label>Duration (minutes)</label>
                                        <input
                                            className="ph-input"
                                            type="number" min={5} max={480}
                                            value={form.timeLimit}
                                            onChange={e => setForm(f => ({ ...f, timeLimit: parseInt(e.target.value) || 60 }))}
                                        />
                                    </div>
                                </div>

                                {/* Security toggles */}
                                <div className="ph-field">
                                    <label>Security Options</label>
                                    <div className="ph-toggles">
                                        {[
                                            { key: 'requireCamera',     icon: <Camera size={16} />,        label: 'Require Camera' },
                                            { key: 'requireFullscreen', icon: <Lock size={16} />,          label: 'Force Fullscreen' },
                                            { key: 'recordScreen',      icon: <Eye size={16} />,           label: 'Record Screen' },
                                            { key: 'allowTabSwitch',    icon: <AlertTriangle size={16} />, label: 'Allow Tab Switch' },
                                        ].map(({ key, icon, label }) => (
                                            <label key={key} className="ph-toggle-row">
                                                <div className="ph-toggle-left">
                                                    {icon} {label}
                                                </div>
                                                <div
                                                    className={`ph-toggle-switch ${form.settings[key] ? 'on' : ''}`}
                                                    onClick={() => setForm(f => ({
                                                        ...f,
                                                        settings: { ...f.settings, [key]: !f.settings[key] },
                                                    }))}
                                                >
                                                    <div className="ph-toggle-knob" />
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {/* Access code */}
                                <div className="ph-field">
                                    <label>Access Code <span className="opt">(optional)</span></label>
                                    <input
                                        className="ph-input"
                                        placeholder="Leave blank for open access"
                                        value={form.settings.accessCode}
                                        onChange={e => setForm(f => ({
                                            ...f,
                                            settings: { ...f.settings, accessCode: e.target.value },
                                        }))}
                                    />
                                </div>

                                <div className="ph-form-footer">
                                    <button className="ph-btn ph-btn-ghost" onClick={() => setView('dashboard')}>Cancel</button>
                                    <button
                                        className="ph-btn ph-btn-primary ph-btn-lg"
                                        onClick={createSession}
                                        disabled={creating || !form.title.trim()}
                                    >
                                        {creating ? <div className="ph-spinner-sm" /> : <Plus size={16} />}
                                        {creating ? 'Creating…' : 'Create & Enter Session'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* ── JOIN ── */}
                    {view === 'join' && (
                        <motion.div key="join"
                            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.2 }}
                            className="ph-form-wrap"
                        >
                            <div className="ph-form-card ph-form-card--narrow">
                                <div className="ph-form-header">
                                    <div className="ph-join-icon"><ArrowRight size={28} /></div>
                                    <h2>Join a Session</h2>
                                    <p>Enter the session ID shared by your interviewer or administrator.</p>
                                </div>

                                <div className="ph-field">
                                    <label>Session ID <span className="req">*</span></label>
                                    <input
                                        className="ph-input ph-input-mono"
                                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                                        value={joinId}
                                        onChange={e => setJoinId(e.target.value)}
                                    />
                                </div>

                                <div className="ph-field">
                                    <label>Access Code <span className="opt">(if required)</span></label>
                                    <input
                                        className="ph-input"
                                        placeholder="Enter access code"
                                        value={joinCode}
                                        onChange={e => setJoinCode(e.target.value)}
                                    />
                                </div>

                                <div className="ph-join-notice">
                                    <AlertTriangle size={14} />
                                    <span>By joining you consent to session monitoring as configured by the host.</span>
                                </div>

                                <div className="ph-form-footer">
                                    <button className="ph-btn ph-btn-ghost" onClick={() => setView('dashboard')}>Cancel</button>
                                    <button
                                        className="ph-btn ph-btn-primary ph-btn-lg"
                                        onClick={joinSession}
                                        disabled={joining || !joinId.trim()}
                                    >
                                        {joining ? <div className="ph-spinner-sm" /> : <ChevronRight size={16} />}
                                        {joining ? 'Joining…' : 'Join Session'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
};

export default ProctorHub;
