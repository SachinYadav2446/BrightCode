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
        try { await axios.post(`${API_URL}/api/nexus/tickets/${id}/request-mentor`, {}, { headers: headers() }); fetchTicket(true); }
        catch (e) { alert(e.response?.data?.error || 'Failed'); }
    }

    async function acceptMentor(mentorId) {
        try {
            await axios.post(`${API_URL}/api/nexus/tickets/${id}/accept-mentor`, { mentorId }, { headers: headers() });
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

    const isAuthor   = ticket.author_id  === user?.id;
    const isMentor   = ticket.mentor_id  === user?.id;
    const requests   = ticket.mentor_requests || [];
    const messages   = ticket.messages || [];
    const hasOffered = requests.some(r => r.id === user?.id);
    const inProgress = ticket.status === 'in_progress';
    const canChat    = inProgress && (isAuthor || isMentor);
    const notifCount = isAuthor && ticket.status === 'open' ? requests.length : 0;

    /* ── render ── */
    return (
        <div className="ntd-root">
            {/* grid-bg overlay */}
            <div className="ntd-grid-bg" />

            <div className="ntd-inner">

                {/* ── BREADCRUMB ── */}
                <button className="ntd-back" onClick={() => navigate('/nexus')}>
                    <ArrowLeft size={15} /> Back to Nexus
                </button>

                {/* ── TWO-COLUMN LAYOUT ── */}
                <div className="ntd-layout">

                    {/* ════════ LEFT COLUMN ════════ */}
                    <div className="ntd-left">

                        {/* ── ticket hero card ── */}
                        <div className="ntd-hero-card">
                            <div className="ntd-hero-top">
                                <div className="ntd-hero-badges">
                                    <span className="ntd-lang-chip"><Code size={12}/>{ticket.language}</span>
                                    <StatusBadge status={ticket.status} />
                                    <span className="ntd-time-chip"><Clock size={12}/>{timeAgo(ticket.created_at)}</span>
                                </div>
                                <h1 className="ntd-ticket-title">{ticket.title}</h1>
                                <div className="ntd-author-row">
                                    <Avatar name={ticket.author_username} size={28}/>
                                    <span className="ntd-author">@{ticket.author_username}</span>
                                    {isAuthor && <span className="ntd-you">YOU</span>}
                                </div>
                            </div>

                            <div className="ntd-divider"/>

                            <div className="ntd-description-area">
                                <p className="ntd-section-label"><Code size={13}/> Description</p>
                                <p className="ntd-desc-text">{ticket.description}</p>
                            </div>

                            {ticket.tags?.length > 0 && (
                                <div className="ntd-tags-row">
                                    <Hash size={13} className="ntd-tag-icon"/>
                                    {ticket.tags.map((t,i) => <span key={i} className="ntd-tag">#{t}</span>)}
                                </div>
                            )}
                        </div>

                        {/* ── info tiles ── */}
                        <div className="ntd-tiles">
                            {[
                                { label:'Status',   val: <StatusBadge status={ticket.status}/> },
                                { label:'Language', val: ticket.language },
                                { label:'Author',   val: `@${ticket.author_username}` },
                                { label:'Created',  val: timeAgo(ticket.created_at) },
                                { label:'Offers',   val: `${requests.length} mentor${requests.length!==1?'s':''}` },
                                ticket.mentor_username && { label:'Mentor', val: `@${ticket.mentor_username}`, highlight: true },
                            ].filter(Boolean).map((item, i) => (
                                <div key={i} className={`ntd-tile ${item.highlight ? 'ntd-tile-hl' : ''}`}>
                                    <span className="ntd-tile-label">{item.label}</span>
                                    <span className="ntd-tile-val">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ════════ RIGHT COLUMN ════════ */}
                    <div className="ntd-right">

                        {/* ── Workspace button (always visible when in progress) ── */}
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
                                <Layout size={18}/>
                                <span>Open Workspace</span>
                                <Zap size={14} className="ntd-zap"/>
                            </button>
                        )}

                        {/* ── action buttons ── */}
                        <div className="ntd-actions-card">
                            {ticket.status === 'open' && !isAuthor && !hasOffered && (
                                <button className="ntd-btn ntd-btn-offer" onClick={offerHelp}>
                                    <Shield size={16}/> Offer Help
                                </button>
                            )}
                            {ticket.status === 'open' && !isAuthor && hasOffered && (
                                <button className="ntd-btn ntd-btn-pending" disabled>
                                    <Clock size={16}/> Offer Pending…
                                </button>
                            )}
                            {inProgress && isAuthor && (
                                <>
                                    <button className="ntd-btn ntd-btn-resolve" onClick={resolveTicket}>
                                        <CheckCircle size={16}/> Mark Resolved
                                    </button>
                                    <button className="ntd-btn ntd-btn-revoke" onClick={revokementor}>
                                        <RefreshCw size={15}/> Reopen Ticket
                                    </button>
                                </>
                            )}
                            {ticket.status === 'resolved' && (
                                <div className="ntd-resolved-badge">
                                    <CheckCircle size={18}/> Issue Resolved
                                </div>
                            )}
                            {/* show session info */}
                            {inProgress && ticket.mentor_username && (
                                <div className="ntd-session-row">
                                    <div className="ntd-live-dot"/>
                                    <Avatar name={ticket.mentor_username} size={26}/>
                                    <div>
                                        <span className="ntd-session-mentor">@{ticket.mentor_username}</span>
                                        <span className="ntd-session-label">Mentor · Active Session</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* ── TABS ── */}
                        <div className="ntd-panel">
                            <div className="ntd-tabs">
                                <button className={`ntd-tab ${activeTab==='notifications'?'ntd-tab-active':''}`}
                                    onClick={() => setActiveTab('notifications')}>
                                    <Bell size={14}/>
                                    Notifications
                                    {notifCount > 0 && <span className="ntd-badge">{notifCount}</span>}
                                </button>
                                <button className={`ntd-tab ${activeTab==='chat'?'ntd-tab-active':''} ${!canChat?'ntd-tab-off':''}`}
                                    onClick={() => canChat && setActiveTab('chat')}
                                    title={!canChat ? 'Available after mentor is assigned' : ''}>
                                    <MessageCircle size={14}/>
                                    Chat
                                    {messages.length > 0 && <span className="ntd-badge ntd-badge-blue">{messages.length}</span>}
                                </button>
                            </div>

                            {/* NOTIFICATIONS */}
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
                                                <div key={r.id} className="ntd-notif-row" style={{ animationDelay: `${idx*50}ms` }}>
                                                    <Avatar name={r.username} size={40}/>
                                                    <div className="ntd-notif-info">
                                                        <span className="ntd-notif-name">@{r.username}</span>
                                                        <span className="ntd-notif-sub">Offered to mentor this issue</span>
                                                    </div>
                                                    {isAuthor && ticket.status === 'open' && (
                                                        <button className="ntd-accept-btn" onClick={() => acceptMentor(r.id)}>
                                                            <CheckCircle size={13}/> Accept
                                                        </button>
                                                    )}
                                                    {ticket.mentor_id === r.id && (
                                                        <span className="ntd-accepted-tag">✓ Accepted</span>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* CHAT */}
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
                                                <div className="ntd-live-dot" style={{ marginLeft:'auto' }}/>
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
                                                        <div key={msg.id||i} className={`ntd-msg ${mine?'ntd-msg-mine':'ntd-msg-theirs'}`}>
                                                            {!mine && <Avatar name={msg.sender_username} size={26}/>}
                                                            <div className={`ntd-bubble ${mine?'ntd-bubble-mine':'ntd-bubble-theirs'}`}>
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
                    </div>
                </div>
            </div>
        </div>
    );
}

// fix the typo in revoke
NexusTicketDetail.displayName = 'NexusTicketDetail';
