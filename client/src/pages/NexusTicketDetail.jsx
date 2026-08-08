import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Clock, Code, MessageCircle, CheckCircle, XCircle,
    UserCheck, Layout, Send, Bell, ArrowLeft, Tag,
    User, Shield, RefreshCw, Zap, Hash, Globe
} from 'lucide-react';
import API_URL from '../config';
import './NexusTicketDetail.css';

/* ── tiny helpers ──────────────────────────────────────────────────────── */
const AVATAR_COLORS = ['#e63946','#4a9eff','#10b981','#f59e0b','#8b5cf6','#06b6d4'];
const avatarColor = (name = '') => AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

function Avatar({ name = '', size = 36 }) {
    const c = avatarColor(name);
    return (
        <div className="ntd-avatar" style={{ width: size, height: size, fontSize: size * 0.36, background: `${c}18`, border: `1.5px solid ${c}55`, color: c }}>
            {name.slice(0,2).toUpperCase() || '??'}
        </div>
    );
}

function StatusBadge({ status }) {
    const cfg = {
        open:        { label: 'Open',        cls: 'ntd-s-open' },
        in_progress: { label: 'In Progress', cls: 'ntd-s-prog' },
        resolved:    { label: 'Resolved',    cls: 'ntd-s-done' },
    };
    const { label, cls } = cfg[status] ?? cfg.open;
    return <span className={`ntd-status ${cls}`}>{label}</span>;
}

function timeAgo(ts) {
    const s = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (s < 60) return `${s}s ago`;
    if (s < 3600) return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
}

/* ─────────────────────────────────────────────────────────────────────── */
export default function NexusTicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket]     = useState(null);
    const [loading, setLoading]   = useState(true);
    const [activeTab, setActiveTab] = useState('details');
    const [chatText, setChatText] = useState('');
    const [sending, setSending]   = useState(false);
    const bottomRef = useRef(null);

    const token = () => localStorage.getItem('token');
    const headers = () => ({ Authorization: `Bearer ${token()}` });

    async function fetchTicket(quiet = false) {
        try {
            const res = await axios.get(`${API_URL}/api/nexus/tickets/${id}`, { headers: headers() });
            setTicket(res.data);
        } catch (err) {
            if (err.response?.status === 404) navigate('/nexus');
        } finally {
            if (!quiet) setLoading(false);
        }
    }

    useEffect(() => {
        fetchTicket();
        const t = setInterval(() => fetchTicket(true), 4000);
        return () => clearInterval(t);
    }, [id]);

    // auto-scroll chat
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [ticket?.messages?.length]);

    /* actions */
    async function sendChat(e) {
        e.preventDefault();
        if (!chatText.trim() || sending) return;
        setSending(true);
        try {
            await axios.post(`${API_URL}/api/nexus/tickets/${id}/chat`, { text: chatText }, { headers: headers() });
            setChatText('');
            fetchTicket(true);
        } finally { setSending(false); }
    }

    async function offerHelp() {
        if (isAuthor) {
            alert('You cannot offer to mentor your own issue');
            return;
        }
        try { await axios.post(`${API_URL}/api/nexus/tickets/${id}/request-mentor`, {}, { headers: headers() }); fetchTicket(true); }
        catch (e) { alert(e.response?.data?.error || 'Failed'); }
    }

    async function acceptMentor(mentorId, mentorUsername) {
        try {
            await axios.post(`${API_URL}/api/nexus/tickets/${id}/accept-mentor`, { mentorId, mentorUsername }, { headers: headers() });
            fetchTicket(true);
            setActiveTab('chat');
        } catch (e) { alert(e.response?.data?.error || 'Failed'); }
    }

    async function resolveTicket() {
        try { await axios.post(`${API_URL}/api/nexus/tickets/${id}/resolve`, {}, { headers: headers() }); fetchTicket(true); }
        catch (e) { alert(e.response?.data?.error || 'Failed'); }
    }

    async function revokementor() {
        try { await axios.post(`${API_URL}/api/nexus/tickets/${id}/revoke-mentor`, {}, { headers: headers() }); fetchTicket(true); }
        catch (e) { alert(e.response?.data?.error || 'Failed'); }
    }

    /* derived */
    if (loading) return (
        <div className="ntd-loading">
            <div className="ntd-spinner" /><p>Loading ticket…</p>
        </div>
    );
    if (!ticket) return <div className="ntd-error">Ticket not found</div>;

    const isAuthor   = Boolean(
        user && (
            String(ticket.author_id) === String(user.id) ||
            (ticket.author_username && user.username && String(ticket.author_username).toLowerCase() === String(user.username).toLowerCase())
        )
    );
    const isMentor   = Boolean(
        user && (
            String(ticket.mentor_id) === String(user.id) ||
            (ticket.mentor_username && user.username && String(ticket.mentor_username).toLowerCase() === String(user.username).toLowerCase())
        )
    );
    const requests   = ticket.mentor_requests || [];
    const messages   = ticket.messages || [];
    const hasOffered = requests.some(r => 
        String(r.id) === String(user?.id) || 
        (r.username && user?.username && String(r.username).toLowerCase() === String(user.username).toLowerCase())
    );
    const inProgress = ticket.status === 'in_progress';
    const canChat    = inProgress && (isAuthor || isMentor);
    const notifCount = isAuthor && ticket.status === 'open' ? requests.length : 0;

    /* ── render ── */
    return (
        <div className="ntd-root">
            <div className="ntd-grid-bg" />

            <div className="ntd-inner">

                {/* ── BACK ── */}
                <button className="ntd-back" onClick={() => navigate('/nexus')}>
                    <ArrowLeft size={15} /> Back to Nexus
                </button>

                {/* ── PAGE HEADER ── */}
                <div className="ntd-page-header">
                    <div className="ntd-page-title-row">
                        <span className="ntd-ticket-id">Ticket #{ticket.id?.slice(-6).toUpperCase()}</span>
                        <h1 className="ntd-page-title">{ticket.title}</h1>
                    </div>
                    <div className="ntd-page-badges">
                        <span className="ntd-lang-chip"><Code size={12}/>{ticket.language}</span>
                        <StatusBadge status={ticket.status} />
                        <span className="ntd-time-chip"><Clock size={12}/>{timeAgo(ticket.created_at)}</span>
                    </div>
                </div>

                {/* ── BENTO GRID ── */}
                <div className="ntd-bento">

                    {/* ── CARD: Issue Overview ── */}
                    <div className="ntd-card ntd-card-issue">
                        <div className="ntd-card-header">
                            <span className="ntd-card-label"><Hash size={13}/> Issue Overview</span>
                        </div>
                        <div className="ntd-card-body">
                            <div className="ntd-issue-meta">
                                <span className="ntd-lang-chip"><Code size={11}/>{ticket.language}</span>
                                <StatusBadge status={ticket.status} />
                                <span className="ntd-time-chip"><Clock size={11}/>{timeAgo(ticket.created_at)}</span>
                            </div>
                            <h2 className="ntd-issue-title">{ticket.title}</h2>
                            {ticket.tags?.length > 0 && (
                                <div className="ntd-tags-row">
                                    <Tag size={12} className="ntd-tag-icon"/>
                                    {ticket.tags.map((t, i) => <span key={i} className="ntd-tag">#{t}</span>)}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── CARD: Actions sidebar ── */}
                    <div className="ntd-card ntd-card-actions">
                        <div className="ntd-card-header">
                            <span className="ntd-card-label"><Zap size={13}/> Actions</span>
                        </div>
                        <div className="ntd-card-body">

                            {/* Open workspace — full prominent button */}
                            {inProgress && (isAuthor || isMentor) && (
                                <button
                                    className="ntd-workspace-btn"
                                    onClick={() => navigate(`/editor/${ticket.id}`, {
                                        state: {
                                            returnTo: `/nexus/ticket/${ticket.id}`,
                                            nexusMode: true,
                                            nexusTicket: {
                                                id: ticket.id,
                                                title: ticket.title,
                                                description: ticket.description,
                                                language: ticket.language,
                                                authorUsername: ticket.author_username,
                                                mentorUsername: ticket.mentor_username,
                                            }
                                        }
                                    })}
                                >
                                    <Layout size={16}/> Open Workspace <Zap size={13} className="ntd-zap"/>
                                </button>
                            )}

                            {/* resolved badge */}
                            {ticket.status === 'resolved' && (
                                <div className="ntd-resolved-badge">
                                    <CheckCircle size={17}/> Issue Resolved
                                </div>
                            )}

                            {/* Offer help */}
                            {ticket.status === 'open' && !isAuthor && !hasOffered && (
                                <button className="ntd-btn ntd-btn-offer" onClick={offerHelp}>
                                    <Shield size={15}/> Offer Help
                                </button>
                            )}
                            {ticket.status === 'open' && !isAuthor && hasOffered && (
                                <button className="ntd-btn ntd-btn-pending" disabled>
                                    <Clock size={15}/> Pending…
                                </button>
                            )}

                            {/* Author controls — compact icon row */}
                            {inProgress && isAuthor && (
                                <div className="ntd-icon-actions">
                                    <button
                                        className="ntd-icon-btn ntd-icon-btn-resolve"
                                        onClick={resolveTicket}
                                        title="Mark Resolved"
                                    >
                                        <CheckCircle size={16}/>
                                        <span>Resolve</span>
                                    </button>
                                    <button
                                        className="ntd-icon-btn ntd-icon-btn-revoke"
                                        onClick={revokementor}
                                        title="Reopen Ticket"
                                    >
                                        <RefreshCw size={15}/>
                                        <span>Reopen</span>
                                    </button>
                                </div>
                            )}

                            {/* Active session */}
                            {inProgress && ticket.mentor_username && (
                                <div className="ntd-session-box">
                                    <div className="ntd-live-dot"/>
                                    <Avatar name={ticket.mentor_username} size={28}/>
                                    <div>
                                        <span className="ntd-session-mentor">@{ticket.mentor_username}</span>
                                        <span className="ntd-session-label">Mentor · Active Session</span>
                                    </div>
                                </div>
                            )}

                            {!inProgress && ticket.status === 'open' && isAuthor && (
                                <p className="ntd-actions-empty">Waiting for a mentor to offer help…</p>
                            )}
                        </div>
                    </div>

                    {/* ── CARD: Description ── */}
                    <div className="ntd-card ntd-card-description">
                        <div className="ntd-card-header">
                            <span className="ntd-card-label"><Globe size={13}/> Description</span>
                        </div>
                        <div className="ntd-card-body">
                            <p className="ntd-desc-text">
                                {ticket.description?.trim() || <span style={{ color: '#52525b', fontStyle: 'italic' }}>No description provided.</span>}
                            </p>
                        </div>
                    </div>

                    {/* ── CARD: People ── */}
                    <div className="ntd-card ntd-card-people">
                        <div className="ntd-card-header">
                            <span className="ntd-card-label"><User size={13}/> People</span>
                        </div>
                        <div className="ntd-card-body">
                            {/* Author */}
                            <div className="ntd-person-row">
                                <Avatar name={ticket.author_username} size={34}/>
                                <div className="ntd-person-info">
                                    <span className="ntd-person-name">@{ticket.author_username}</span>
                                    <span className="ntd-person-role">Issue Author</span>
                                </div>
                                <span className="ntd-role-pill ntd-role-author">Author</span>
                                {isAuthor && <span className="ntd-you-pill">YOU</span>}
                            </div>

                            {/* Mentor */}
                            {ticket.mentor_username ? (
                                <div className="ntd-person-row">
                                    <Avatar name={ticket.mentor_username} size={34}/>
                                    <div className="ntd-person-info">
                                        <span className="ntd-person-name">@{ticket.mentor_username}</span>
                                        <span className="ntd-person-role">Assigned Mentor</span>
                                    </div>
                                    <span className="ntd-role-pill ntd-role-mentor">Mentor</span>
                                    {isMentor && <span className="ntd-you-pill">YOU</span>}
                                    {inProgress && <div className="ntd-live-dot"/>}
                                </div>
                            ) : (
                                <div className="ntd-waiting-mentor">
                                    <UserCheck size={16}/> No mentor assigned yet
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── CARD: Notifications + Chat tabs ── */}
                    <div className="ntd-card ntd-card-tabs">
                        <div className="ntd-tabs-row">
                            <button
                                className={`ntd-tab ${activeTab === 'notifications' ? 'ntd-tab-active' : ''}`}
                                onClick={() => setActiveTab('notifications')}
                            >
                                <Bell size={14}/>
                                Notifications
                                {notifCount > 0 && <span className="ntd-badge">{notifCount}</span>}
                            </button>
                            <button
                                className={`ntd-tab ${activeTab === 'chat' ? 'ntd-tab-active' : ''} ${!canChat ? 'ntd-tab-off' : ''}`}
                                onClick={() => canChat && setActiveTab('chat')}
                                title={!canChat ? 'Available after mentor is assigned' : ''}
                            >
                                <MessageCircle size={14}/>
                                Chat
                                {messages.length > 0 && <span className="ntd-badge ntd-badge-blue">{messages.length}</span>}
                            </button>
                        </div>

                        {/* NOTIFICATIONS TAB */}
                        {activeTab === 'notifications' && (
                            <div className="ntd-tab-body">
                                {requests.length === 0 ? (
                                    <div className="ntd-empty">
                                        <Bell size={32} strokeWidth={1.5}/>
                                        <p>No offers yet</p>
                                        <span>Mentors who click "Offer Help" will appear here</span>
                                    </div>
                                ) : (
                                    <div className="ntd-notif-list">
                                        {requests.map((r, idx) => (
                                            <div key={r.id} className="ntd-notif-row" style={{ animationDelay: `${idx * 50}ms` }}>
                                                <Avatar name={r.username} size={40}/>
                                                <div className="ntd-notif-info">
                                                    <span className="ntd-notif-name">@{r.username}</span>
                                                    <span className="ntd-notif-sub">Offered to mentor this issue</span>
                                                </div>
                                                {isAuthor && ticket.status === 'open' && (
                                                    <button className="ntd-accept-btn" onClick={() => acceptMentor(r.id, r.username)}>
                                                        <CheckCircle size={13}/> Accept
                                                    </button>
                                                )}
                                                {ticket.mentor_id === r.id && <span className="ntd-accepted-tag">✓ Accepted</span>}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* CHAT TAB */}
                        {activeTab === 'chat' && (
                            <div className="ntd-tab-body ntd-chat-body">
                                {!canChat ? (
                                    <div className="ntd-empty">
                                        <MessageCircle size={32} strokeWidth={1.5}/>
                                        <p>Chat unlocks when a mentor is assigned</p>
                                    </div>
                                ) : (
                                    <>
                                        <div className="ntd-chat-header">
                                            <Avatar name={isAuthor ? ticket.mentor_username : ticket.author_username} size={30}/>
                                            <div>
                                                <span className="ntd-chat-peer">@{isAuthor ? ticket.mentor_username : ticket.author_username}</span>
                                                <span className="ntd-chat-role">{isAuthor ? 'Your Mentor' : 'Issue Author'}</span>
                                            </div>
                                            <div className="ntd-live-dot" style={{ marginLeft: 'auto' }}/>
                                        </div>
                                        <div className="ntd-messages">
                                            {messages.length === 0 && (
                                                <div className="ntd-chat-empty">
                                                    <span>👋</span>
                                                    <p>Session started! Say hello.</p>
                                                </div>
                                            )}
                                            {messages.map((msg, i) => {
                                                const mine = msg.sender_id === user?.id;
                                                return (
                                                    <div key={msg.id || i} className={`ntd-msg ${mine ? 'ntd-msg-mine' : 'ntd-msg-theirs'}`}>
                                                        {!mine && <Avatar name={msg.sender_username} size={26}/>}
                                                        <div className={`ntd-bubble ${mine ? 'ntd-bubble-mine' : 'ntd-bubble-theirs'}`}>
                                                            {!mine && <span className="ntd-bubble-from">{msg.sender_username}</span>}
                                                            <span className="ntd-bubble-text">{msg.text}</span>
                                                        </div>
                                                        {mine && <Avatar name={msg.sender_username} size={26}/>}
                                                    </div>
                                                );
                                            })}
                                            <div ref={bottomRef}/>
                                        </div>
                                        <form className="ntd-chat-form" onSubmit={sendChat}>
                                            <input
                                                type="text"
                                                placeholder="Type a message…"
                                                value={chatText}
                                                onChange={e => setChatText(e.target.value)}
                                                disabled={sending}
                                                autoFocus
                                            />
                                            <button type="submit" disabled={sending || !chatText.trim()}>
                                                <Send size={15}/>
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                </div>{/* end bento */}
            </div>
        </div>
    );
}

// fix the typo in revoke
NexusTicketDetail.displayName = 'NexusTicketDetail';
