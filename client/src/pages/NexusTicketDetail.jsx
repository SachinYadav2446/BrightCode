import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Clock, Code, MessageCircle, CheckCircle, XCircle,
    UserCheck, Layout, Send, Bell, ArrowLeft, Tag,
    AlertTriangle, User, Zap, Shield, RefreshCw
} from 'lucide-react';
import API_URL from '../config';
import './NexusTicketDetail.css';

const Avatar = ({ name, size = 36 }) => {
    const initials = name ? name.slice(0, 2).toUpperCase() : '??';
    const colors = ['#e63946','#4a9eff','#2ecc71','#f39c12','#9b59b6','#1abc9c'];
    const color = colors[name?.charCodeAt(0) % colors.length] || '#e63946';
    return (
        <div className="td-avatar" style={{ width: size, height: size, background: `${color}22`, border: `2px solid ${color}55`, color }}>
            {initials}
        </div>
    );
};

const StatusPill = ({ status }) => {
    const map = {
        open: { label: 'Open', cls: 'pill-open' },
        in_progress: { label: 'In Progress', cls: 'pill-progress' },
        resolved: { label: 'Resolved', cls: 'pill-resolved' },
    };
    const s = map[status] || map.open;
    return <span className={`td-status-pill ${s.cls}`}>{s.label}</span>;
};

export default function NexusTicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatText, setChatText] = useState('');
    const [activeTab, setActiveTab] = useState('details');
    const [sending, setSending] = useState(false);
    const chatEndRef = useRef(null);

    const fetchTicket = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/nexus/tickets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTicket(res.data);
        } catch (error) {
            if (error.response?.status === 404) navigate('/nexus');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
        const interval = setInterval(fetchTicket, 4000);
        return () => clearInterval(interval);
    }, [id]);

    // Auto-scroll chat & switch to chat tab when mentor assigned
    useEffect(() => {
        if (ticket?.status === 'in_progress') {
            chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [ticket?.messages]);

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatText.trim() || !ticket || sending) return;
        setSending(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/nexus/tickets/${ticket.id}/chat`, { text: chatText }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChatText('');
            fetchTicket();
        } catch (err) {
            console.error('Failed to send message', err);
        } finally {
            setSending(false);
        }
    };

    const handleAcceptMentor = async (mentorId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/nexus/tickets/${ticket.id}/accept-mentor`, { mentorId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTicket();
            setActiveTab('chat');
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to accept mentor');
        }
    };

    const handleRequestMentor = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/nexus/tickets/${ticket.id}/request-mentor`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTicket();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to offer help');
        }
    };

    const handleResolveTicket = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/nexus/tickets/${ticket.id}/resolve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTicket();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to resolve ticket');
        }
    };

    const handleRevokeMentor = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/nexus/tickets/${ticket.id}/revoke-mentor`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTicket();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to reopen');
        }
    };

    const timeAgo = (ts) => {
        const s = Math.floor((Date.now() - new Date(ts)) / 1000);
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s / 60)}m ago`;
        if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
        return `${Math.floor(s / 86400)}d ago`;
    };

    if (loading) return (
        <div className="td-loading">
            <div className="td-spinner" />
            <span>Loading ticket...</span>
        </div>
    );
    if (!ticket) return <div className="td-error">Ticket not found</div>;

    const isAuthor = ticket.author_id === user?.id;
    const isMentor = ticket.mentor_id === user?.id;
    const mentorRequests = ticket.mentor_requests || [];
    const hasRequested = mentorRequests.some(r => r.id === user?.id);
    const messages = ticket.messages || [];
    const isInProgress = ticket.status === 'in_progress';
    const canChat = isInProgress && (isAuthor || isMentor);
    const unreadNotifs = isAuthor && ticket.status === 'open' ? mentorRequests.length : 0;

    const tabs = [
        { key: 'details', label: 'Details', icon: <Code size={15} /> },
        { key: 'notifications', label: 'Notifications', icon: <Bell size={15} />, badge: unreadNotifs },
        { key: 'chat', label: 'Chat', icon: <MessageCircle size={15} />, badge: messages.length > 0 ? messages.length : 0, disabled: !canChat },
    ];

    return (
        <div className="td-page">
            {/* Ambient background */}
            <div className="td-ambient" />

            {/* ── Hero Header ───────────────────────────────────────────── */}
            <div className="td-hero">
                <button className="td-back" onClick={() => navigate('/nexus')}>
                    <ArrowLeft size={16} /> Back to Nexus
                </button>

                <div className="td-hero-body">
                    <div className="td-hero-left">
                        <div className="td-hero-meta">
                            <span className="td-lang-badge"><Code size={13} /> {ticket.language}</span>
                            <StatusPill status={ticket.status} />
                            <span className="td-time"><Clock size={13} /> {timeAgo(ticket.created_at)}</span>
                        </div>
                        <h1 className="td-title">{ticket.title}</h1>
                        <div className="td-author-row">
                            <Avatar name={ticket.author_username} size={30} />
                            <span className="td-author-name">@{ticket.author_username}</span>
                            {isAuthor && <span className="td-you-badge">You</span>}
                        </div>
                    </div>

                    {/* ── Hero Actions ─────────────────────────────────── */}
                    <div className="td-hero-actions">
                        {isInProgress && (isAuthor || isMentor) && (
                            <button className="td-btn-workspace" onClick={() => navigate(`/editor/${ticket.id}`, { state: { returnTo: `/nexus/ticket/${ticket.id}` } })}>
                                <Layout size={16} />
                                <span>Open Workspace</span>
                                <Zap size={12} className="td-zap" />
                            </button>
                        )}
                        {ticket.status === 'open' && !isAuthor && !hasRequested && (
                            <button className="td-btn-offer" onClick={handleRequestMentor}>
                                <Shield size={16} /> Offer Help
                            </button>
                        )}
                        {ticket.status === 'open' && !isAuthor && hasRequested && (
                            <button className="td-btn-pending" disabled>
                                <Clock size={16} /> Offer Pending
                            </button>
                        )}
                        {isInProgress && isAuthor && (
                            <>
                                <button className="td-btn-resolve" onClick={handleResolveTicket}>
                                    <CheckCircle size={16} /> Mark Resolved
                                </button>
                                <button className="td-btn-revoke" onClick={handleRevokeMentor}>
                                    <RefreshCw size={15} /> Reopen
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Assigned mentor strip */}
                {isInProgress && ticket.mentor_username && (
                    <div className="td-mentor-strip">
                        <UserCheck size={14} />
                        <span>Assigned mentor:</span>
                        <Avatar name={ticket.mentor_username} size={22} />
                        <strong>@{ticket.mentor_username}</strong>
                        <span className="td-live-dot" />
                        <span style={{ color: '#2ecc71', fontSize: '0.78rem' }}>Session active</span>
                    </div>
                )}
            </div>

            {/* ── Tab Bar ───────────────────────────────────────────────── */}
            <div className="td-tabbar">
                {tabs.map(tab => (
                    <button
                        key={tab.key}
                        className={`td-tab ${activeTab === tab.key ? 'active' : ''} ${tab.disabled ? 'disabled' : ''}`}
                        onClick={() => !tab.disabled && setActiveTab(tab.key)}
                        title={tab.disabled ? 'Only available when a mentor is assigned' : ''}
                    >
                        {tab.icon}
                        <span>{tab.label}</span>
                        {tab.badge > 0 && <span className="td-tab-badge">{tab.badge}</span>}
                    </button>
                ))}
            </div>

            {/* ── Tab Content ───────────────────────────────────────────── */}
            <div className="td-content">

                {/* DETAILS TAB */}
                {activeTab === 'details' && (
                    <div className="td-details-layout">
                        <div className="td-card td-description-card">
                            <div className="td-card-label"><Code size={14} /> Description</div>
                            <p className="td-description">{ticket.description}</p>
                        </div>

                        {ticket.tags && ticket.tags.length > 0 && (
                            <div className="td-card td-tags-card">
                                <div className="td-card-label"><Tag size={14} /> Tags</div>
                                <div className="td-tags">
                                    {ticket.tags.map((tag, i) => (
                                        <span key={i} className="td-tag">#{tag}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="td-info-grid">
                            <div className="td-info-item">
                                <span className="td-info-label">Status</span>
                                <StatusPill status={ticket.status} />
                            </div>
                            <div className="td-info-item">
                                <span className="td-info-label">Language</span>
                                <span className="td-info-value">{ticket.language}</span>
                            </div>
                            <div className="td-info-item">
                                <span className="td-info-label">Posted by</span>
                                <span className="td-info-value">@{ticket.author_username}</span>
                            </div>
                            <div className="td-info-item">
                                <span className="td-info-label">Created</span>
                                <span className="td-info-value">{timeAgo(ticket.created_at)}</span>
                            </div>
                            <div className="td-info-item">
                                <span className="td-info-label">Offers</span>
                                <span className="td-info-value">{mentorRequests.length} mentor{mentorRequests.length !== 1 ? 's' : ''}</span>
                            </div>
                            {ticket.mentor_username && (
                                <div className="td-info-item">
                                    <span className="td-info-label">Mentor</span>
                                    <span className="td-info-value" style={{ color: '#4a9eff' }}>@{ticket.mentor_username}</span>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* NOTIFICATIONS TAB */}
                {activeTab === 'notifications' && (
                    <div className="td-notif-layout">
                        {mentorRequests.length === 0 ? (
                            <div className="td-empty">
                                <Bell size={40} strokeWidth={1.5} />
                                <p>No notifications yet</p>
                                <span>Mentors who offer help will appear here</span>
                            </div>
                        ) : (
                            <>
                                <div className="td-notif-heading">
                                    <Bell size={16} className="td-bell-anim" />
                                    <span>{mentorRequests.length} developer{mentorRequests.length > 1 ? 's' : ''} offered to help with this issue</span>
                                </div>
                                <div className="td-notif-list">
                                    {mentorRequests.map((r, idx) => (
                                        <div key={r.id} className="td-notif-card" style={{ animationDelay: `${idx * 60}ms` }}>
                                            <Avatar name={r.username} size={44} />
                                            <div className="td-notif-info">
                                                <span className="td-notif-name">@{r.username}</span>
                                                <span className="td-notif-sub">Offered to mentor this issue</span>
                                            </div>
                                            <div className="td-notif-actions">
                                                {isAuthor && ticket.status === 'open' ? (
                                                    <button className="td-btn-accept" onClick={() => handleAcceptMentor(r.id)}>
                                                        <CheckCircle size={14} /> Accept
                                                    </button>
                                                ) : (
                                                    <span className="td-notif-status">
                                                        {ticket.mentor_id === r.id ? '✓ Accepted' : 'Pending'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}

                {/* CHAT TAB */}
                {activeTab === 'chat' && (
                    <div className="td-chat-layout">
                        {!canChat ? (
                            <div className="td-empty">
                                <MessageCircle size={40} strokeWidth={1.5} />
                                <p>Chat unlocked when mentor is assigned</p>
                                <span>Accept a mentor offer to start the session</span>
                            </div>
                        ) : (
                            <>
                                <div className="td-chat-header">
                                    <div className="td-chat-with">
                                        <Avatar name={isAuthor ? ticket.mentor_username : ticket.author_username} size={34} />
                                        <div>
                                            <span className="td-chat-with-name">
                                                @{isAuthor ? ticket.mentor_username : ticket.author_username}
                                            </span>
                                            <span className="td-chat-with-role">
                                                {isAuthor ? 'Your Mentor' : 'Issue Author'}
                                            </span>
                                        </div>
                                    </div>
                                    <button className="td-btn-workspace-sm" onClick={() => navigate(`/editor/${ticket.id}`, { state: { returnTo: `/nexus/ticket/${ticket.id}` } })}>
                                        <Layout size={14} /> Open Workspace
                                    </button>
                                </div>

                                <div className="td-chat-messages">
                                    {messages.length === 0 ? (
                                        <div className="td-chat-empty">
                                            <span>👋</span>
                                            <p>Session started! Say hello.</p>
                                        </div>
                                    ) : (
                                        messages.map((msg, i) => {
                                            const mine = msg.sender_id === user?.id;
                                            return (
                                                <div key={msg.id || i} className={`td-msg-row ${mine ? 'mine' : 'theirs'}`}>
                                                    {!mine && <Avatar name={msg.sender_username} size={28} />}
                                                    <div className={`td-bubble ${mine ? 'td-bubble-mine' : 'td-bubble-theirs'}`}>
                                                        {!mine && <span className="td-bubble-sender">{msg.sender_username}</span>}
                                                        <span className="td-bubble-text">{msg.text}</span>
                                                    </div>
                                                    {mine && <Avatar name={msg.sender_username} size={28} />}
                                                </div>
                                            );
                                        })
                                    )}
                                    <div ref={chatEndRef} />
                                </div>

                                <form className="td-chat-input" onSubmit={handleSendChat}>
                                    <input
                                        type="text"
                                        placeholder="Type a message..."
                                        value={chatText}
                                        onChange={e => setChatText(e.target.value)}
                                        disabled={sending}
                                        autoFocus
                                    />
                                    <button type="submit" disabled={sending || !chatText.trim()}>
                                        <Send size={16} />
                                    </button>
                                </form>
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
