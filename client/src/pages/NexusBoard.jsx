import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Plus, Clock, Code, Globe, UserCheck,
    HelpCircle, X, AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import './NexusBoard.css';

/* ── helpers ── */
const AVATAR_COLORS = ['#e63946','#4a9eff','#10b981','#f59e0b','#8b5cf6','#06b6d4'];
const avatarColor = (n = '') => AVATAR_COLORS[n.charCodeAt(0) % AVATAR_COLORS.length];

function MiniAvatar({ name = '' }) {
    const c = avatarColor(name);
    return (
        <div className="nx-mini-avatar"
             style={{ background: `${c}18`, border: `1px solid ${c}44`, color: c }}>
            {name.slice(0, 2).toUpperCase() || '??'}
        </div>
    );
}

function StatusPill({ status }) {
    const map = {
        open:        { cls: 'nx-s-open',  label: 'Open'        },
        in_progress: { cls: 'nx-s-prog',  label: 'In Progress' },
        resolved:    { cls: 'nx-s-done',  label: 'Resolved'    },
    };
    const { cls, label } = map[status] ?? map.open;
    return (
        <span className={`nx-status ${cls}`}>
            <span className="nx-status-dot" />
            {label}
        </span>
    );
}

function timeAgo(ts) {
    const s = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (s < 60)   return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s / 60)}m ago`;
    if (s < 86400)return `${Math.floor(s / 3600)}h ago`;
    return `${Math.floor(s / 86400)}d ago`;
}

/* ── TicketRow ── */
function TicketRow({ ticket }) {
    const navigate = useNavigate();
    return (
        <div className="nx-row" onClick={() => navigate(`/nexus/ticket/${ticket.id}`)}>
            <div className="nx-row-title">
                <span className="nx-row-name">{ticket.title}</span>
                <div className="nx-row-meta">
                    <span className="nx-row-lang">
                        <Code size={11}/> {ticket.language}
                    </span>
                    {ticket.tags?.length > 0 && (
                        <div className="nx-row-tags">
                            {ticket.tags.slice(0, 3).map((t, i) => (
                                <span key={i} className="nx-tag">#{t}</span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="nx-row-author">
                <MiniAvatar name={ticket.author_username} />
                <span>@{ticket.author_username}</span>
            </div>

            <div className="nx-row-time">
                <Clock size={11} />
                {timeAgo(ticket.created_at)}
            </div>

            <div className="nx-row-status">
                <StatusPill status={ticket.status} />
            </div>
        </div>
    );
}

/* ── Empty ── */
function Empty({ icon: Icon, title, sub, action }) {
    return (
        <div className="nx-empty">
            <Icon size={38} strokeWidth={1.2} />
            <p className="nx-empty-title">{title}</p>
            <p>{sub}</p>
            {action}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════ */
export default function NexusBoard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [tickets,      setTickets]      = useState([]);
    const [loading,      setLoading]      = useState(true);
    const [modalOpen,    setModalOpen]    = useState(false);
    const [activeTab,    setActiveTab]    = useState('global');   // global | personal
    const [dashTab,      setDashTab]      = useState('raised');   // raised | mentored
    const [form,         setForm]         = useState({ title: '', description: '', language: 'javascript', tags: '' });
    const [submitting,   setSubmitting]   = useState(false);
    const [formError,    setFormError]    = useState('');

    /* fetch */
    const fetchTickets = async (quiet = false) => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/nexus/tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (e) {
            console.error('Nexus fetch error', e);
        } finally {
            if (!quiet) setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        const t = setInterval(() => fetchTickets(true), 6000);
        return () => clearInterval(t);
    }, []);

    /* create ticket */
    const handleCreate = async (e) => {
        e.preventDefault();
        if (form.description.trim().length < 50) {
            setFormError('Please add at least 50 characters so mentors have enough context to help.');
            return;
        }
        setFormError('');
        setSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
            await axios.post(`${API_URL}/api/nexus/tickets`, { ...form, tags }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setModalOpen(false);
            setForm({ title: '', description: '', language: 'javascript', tags: '' });
            setFormError('');
            setActiveTab('personal');
            fetchTickets();
        } catch (e) {
            setFormError(e.response?.data?.error || 'Unable to create the ticket. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    /* derived lists */
    const openTickets     = tickets.filter(t => t.status === 'open');
    const myRaised        = tickets.filter(t => t.author_id === user?.id);
    const myMentored      = tickets.filter(t => t.mentor_id === user?.id);

    const globalCount  = openTickets.length;
    const personalCount = myRaised.length + myMentored.length;

    /* ── render ── */
    return (
        <div className="nx-page">
            {/* BG */}
            <div className="nx-bg">
                <div className="nx-bg-grid" />
                <div className="nx-glow nx-glow-1" />
                <div className="nx-glow nx-glow-2" />
            </div>

            <div className="nx-main">

                {/* ── PAGE HEADER ── */}
                <div className="nx-header">
                    <div className="nx-header-left">
                        <span className="nx-header-eyebrow">Mentorship Hub</span>
                        <h1 className="nx-header-title">The Nexus</h1>
                        <p className="nx-header-sub">Post SOS tickets and get live help from senior devs</p>
                    </div>
                    <button className="nx-post-btn" onClick={() => { setFormError(''); setModalOpen(true); }}>
                        <Plus size={15} />
                        <span>Post SOS Ticket</span>
                    </button>
                </div>

                {/* ── TABS ── */}
                <div className="nx-tabs">
                    <button
                        className={`nx-tab ${activeTab === 'global' ? 'active' : ''}`}
                        onClick={() => setActiveTab('global')}
                    >
                        <Globe size={14} /> Global Board
                        <span className="nx-tab-count">{openTickets.length}</span>
                    </button>
                    <button
                        className={`nx-tab ${activeTab === 'personal' ? 'active' : ''}`}
                        onClick={() => setActiveTab('personal')}
                    >
                        <UserCheck size={14} /> My Dashboard
                        <span className="nx-tab-count">{personalCount}</span>
                    </button>
                </div>

                {loading ? (
                    <div className="nx-empty" style={{ paddingTop: 80 }}>
                        <AlertCircle size={32} strokeWidth={1.2} />
                        <p>Loading tickets…</p>
                    </div>
                ) : activeTab === 'global' ? (

                    /* ── GLOBAL BOARD ── */
                    <>
                        <div className="nx-section-head">
                            <span className="nx-section-label">Open Issues</span>
                            <span className="nx-count-pill">{openTickets.length} active</span>
                        </div>

                        <div className="nx-list">
                            <div className="nx-list-header">
                                <span>Issue</span>
                                <span>Author</span>
                                <span>Posted</span>
                                <span style={{ textAlign: 'right' }}>Status</span>
                            </div>

                            {openTickets.length === 0 ? (
                                <Empty
                                    icon={HelpCircle}
                                    title="No open issues"
                                    sub="Be the first to post an SOS ticket."
                                    action={
                                        <button className="nx-post-btn" onClick={() => { setFormError(''); setModalOpen(true); }}>
                                            <Plus size={14}/> Post SOS
                                        </button>
                                    }
                                />
                            ) : (
                                openTickets.map(t => <TicketRow key={t.id} ticket={t} />)
                            )}
                        </div>
                    </>

                ) : (

                    /* ── MY BOARD ── */
                    <>
                        <div className="nx-dash-tabs">
                            <button
                                className={`nx-dash-tab ${dashTab === 'raised' ? 'active-raised' : ''}`}
                                onClick={() => setDashTab('raised')}
                            >
                                <HelpCircle size={14} /> Issues Raised
                                <span className="nx-dash-badge">{myRaised.length}</span>
                            </button>
                            <button
                                className={`nx-dash-tab ${dashTab === 'mentored' ? 'active-mentored' : ''}`}
                                onClick={() => setDashTab('mentored')}
                            >
                                <UserCheck size={14} /> Mentoring
                                <span className="nx-dash-badge">{myMentored.length}</span>
                            </button>
                        </div>

                        {dashTab === 'raised' ? (
                            <>
                                <div className="nx-section-head">
                                    <span className="nx-section-label">My Issues</span>
                                    <span className="nx-count-pill">{myRaised.length} tickets</span>
                                </div>
                                <div className="nx-list">
                                    <div className="nx-list-header">
                                        <span>Issue</span>
                                        <span>Author</span>
                                        <span>Posted</span>
                                        <span style={{ textAlign: 'right' }}>Status</span>
                                    </div>
                                    {myRaised.length === 0 ? (
                                        <Empty
                                            icon={HelpCircle}
                                            title="No issues raised yet"
                                            sub="Post an SOS ticket to get help from a mentor."
                                            action={
                                                <button className="nx-post-btn" onClick={() => setModalOpen(true)}>
                                                    <Plus size={14}/> Post SOS
                                                </button>
                                            }
                                        />
                                    ) : (
                                        myRaised.map(t => <TicketRow key={t.id} ticket={t} />)
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="nx-section-head">
                                    <span className="nx-section-label">Issues I'm Mentoring</span>
                                    <span className="nx-count-pill">{myMentored.length} active</span>
                                </div>
                                <div className="nx-list">
                                    <div className="nx-list-header">
                                        <span>Issue</span>
                                        <span>Author</span>
                                        <span>Posted</span>
                                        <span style={{ textAlign: 'right' }}>Status</span>
                                    </div>
                                    {myMentored.length === 0 ? (
                                        <Empty
                                            icon={UserCheck}
                                            title="Not mentoring anyone yet"
                                            sub="Browse the Global Board and offer your expertise."
                                            action={
                                                <button className="nx-tab" style={{cursor:'pointer'}} onClick={() => setActiveTab('global')}>
                                                    <Globe size={13}/> Global Board
                                                </button>
                                            }
                                        />
                                    ) : (
                                        myMentored.map(t => <TicketRow key={t.id} ticket={t} />)
                                    )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            {/* ── CREATE MODAL ── */}
            {modalOpen && (
                <div className="nx-modal-overlay" onClick={e => e.target === e.currentTarget && setModalOpen(false)}>
                    <div className="nx-modal">
                        <div className="nx-modal-head">
                            <h2>New SOS Ticket</h2>
                            <button className="nx-modal-close" onClick={() => { setFormError(''); setModalOpen(false); }}>
                                <X size={15}/>
                            </button>
                        </div>

                        <form onSubmit={handleCreate}>
                            <div className="nx-field">
                                <label>Title</label>
                                <input
                                    required
                                    type="text"
                                    placeholder="e.g. Memory leak in React useEffect"
                                    value={form.title}
                                    onChange={e => setForm({ ...form, title: e.target.value })}
                                />
                            </div>

                            <div className="nx-field">
                                <label>
                                    <span>Description</span>
                                    <span
                                        className="nx-char-count"
                                        style={{ color: form.description.trim().length < 50 ? '#ef4444' : '#22c55e' }}
                                    >
                                        {form.description.trim().length} / 50 characters minimum
                                    </span>
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    minLength={50}
                                    placeholder="Describe the issue in detail…"
                                    value={form.description}
                                    onChange={e => setForm({ ...form, description: e.target.value })}
                                />
                                {formError && <p className="nx-form-error" role="alert">{formError}</p>}
                            </div>

                            <div className="nx-field-row">
                                <div className="nx-field" style={{ marginBottom: 0 }}>
                                    <label>Language / Framework</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. React"
                                        value={form.language}
                                        onChange={e => setForm({ ...form, language: e.target.value })}
                                    />
                                </div>
                                <div className="nx-field" style={{ marginBottom: 0 }}>
                                    <label>Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="bug, frontend"
                                        value={form.tags}
                                        onChange={e => setForm({ ...form, tags: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="nx-modal-footer">
                                <button type="button" className="nx-btn-cancel" onClick={() => { setFormError(''); setModalOpen(false); }}>
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="nx-btn-submit"
                                    disabled={submitting || form.description.trim().length < 50}
                                >
                                    {submitting ? 'Posting…' : 'Post Ticket'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
