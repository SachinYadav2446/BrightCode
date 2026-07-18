import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Clock, Code, MessageCircle, CheckCircle, XCircle, UserCheck, Layout, Send, Bell, ArrowLeft } from 'lucide-react';
import API_URL from '../config';
import './NexusTicketDetail.css';

export default function NexusTicketDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [ticket, setTicket] = useState(null);
    const [loading, setLoading] = useState(true);
    const [chatText, setChatText] = useState('');

    const fetchTicket = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/nexus/tickets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTicket(res.data);
        } catch (error) {
            console.error('Error fetching ticket', error);
            if (error.response?.status === 404) {
                navigate('/nexus');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTicket();
        const interval = setInterval(fetchTicket, 3000);
        return () => clearInterval(interval);
    }, [id]);

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatText.trim() || !ticket) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/nexus/tickets/${ticket.id}/chat`, { text: chatText }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setChatText('');
            fetchTicket();
        } catch (error) {
            console.error('Failed to send message', error);
        }
    };

    const handleAcceptMentor = async (mentorId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/nexus/tickets/${ticket.id}/accept-mentor`, { mentorId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTicket();
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
            alert(error.response?.data?.error || 'Failed to request mentor');
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
            alert(error.response?.data?.error || 'Failed to reopen ticket');
        }
    };

    const timeAgo = (ts) => {
        const s = Math.floor((Date.now() - new Date(ts)) / 1000);
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s/60)}m ago`;
        if (s < 86400) return `${Math.floor(s/3600)}h ago`;
        return `${Math.floor(s/86400)}d ago`;
    };

    if (loading) return <div className="nexus-loading">Loading ticket details...</div>;
    if (!ticket) return <div className="nexus-error">Ticket not found</div>;

    const isAuthor = ticket.author_id === user?.id;
    const isMentor = ticket.mentor_id === user?.id;
    const mentorRequests = ticket.mentor_requests || [];
    const hasRequested = mentorRequests.some(r => r.id === user?.id);
    const messages = ticket.messages || [];

    return (
        <div className="nexus-detail-container">
            <button className="btn-back" onClick={() => navigate('/nexus')}>
                <ArrowLeft size={18} /> Back to Nexus
            </button>
            
            <div className="ticket-detail-content">
                <div className="ticket-detail-main">
                    <div className="ticket-card detail-card">
                        <div className="ticket-header">
                            <h1 className="ticket-title">{ticket.title}</h1>
                            <span className={`ticket-status status-${ticket.status}`}>
                                {ticket.status === 'open' ? 'Open' : ticket.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                            </span>
                        </div>
                        
                        <div className="ticket-meta">
                            <span className="meta-item"><Clock size={16}/> {timeAgo(ticket.created_at)}</span>
                            <span className="meta-item"><Code size={16}/> {ticket.language}</span>
                            <span>@{ticket.author_username}</span>
                        </div>

                        <div className="ticket-desc-full">{ticket.description}</div>

                        <div className="ticket-tags">
                            {ticket.tags && ticket.tags.map((tag, idx) => (
                                <span key={idx} className="ticket-tag">#{tag}</span>
                            ))}
                        </div>
                        
                        <div className="ticket-actions-row">
                            {ticket.status === 'open' && !isAuthor && !hasRequested && (
                                <button className="btn-answer" onClick={handleRequestMentor}>
                                    <MessageCircle size={16} /> Offer Help
                                </button>
                            )}
                            {ticket.status === 'open' && !isAuthor && hasRequested && (
                                <button className="btn-answer disabled" disabled>
                                    <Clock size={16} /> Offer Pending
                                </button>
                            )}
                            {ticket.status === 'in_progress' && isAuthor && (
                                <>
                                    <button className="btn-resolve" onClick={handleResolveTicket}>
                                        <CheckCircle size={16} /> Mark Resolved
                                    </button>
                                    <button className="btn-revoke" onClick={handleRevokeMentor}>
                                        <XCircle size={16} /> Reopen Ticket (Revoke Mentor)
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                    
                    {isAuthor && ticket.status === 'open' && mentorRequests.length > 0 && (
                        <div className="mentor-requests-panel detail-panel">
                            <div className="mentor-requests-header">
                                <Bell size={16} className="animate-pulse-icon" /> 
                                <span>{mentorRequests.length} user{mentorRequests.length > 1 ? 's' : ''} offered to help!</span>
                            </div>
                            <div className="mentor-requests-list">
                                {mentorRequests.map(r => (
                                    <div key={r.id} className="mentor-request-item">
                                        <span>@{r.username}</span>
                                        <button className="btn-accept" onClick={() => handleAcceptMentor(r.id)}>
                                            Accept
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {ticket.status === 'in_progress' && (isAuthor || isMentor) && (
                    <div className="ticket-detail-sidebar">
                        <div className="mentorship-room detail-room">
                            <div className="mentorship-room-header">
                                <span><UserCheck size={16} /> Mentorship Room</span>
                                <button className="btn-join-workspace" onClick={() => navigate(`/editor/${ticket.id}`, { state: { returnTo: `/nexus/ticket/${ticket.id}` } })}>
                                    <Layout size={14} /> Join Workspace
                                </button>
                            </div>
                            <div className="mentorship-chat-window">
                                {messages.length === 0 ? (
                                    <div className="chat-empty">No messages yet. Say hi!</div>
                                ) : (
                                    messages.map(msg => (
                                        <div key={msg.id} className={`chat-bubble ${msg.sender_id === user?.id ? 'chat-mine' : 'chat-theirs'}`}>
                                            <span className="chat-sender">{msg.sender_username}</span>
                                            <span className="chat-text">{msg.text}</span>
                                        </div>
                                    ))
                                )}
                            </div>
                            <form className="mentorship-chat-input" onSubmit={handleSendChat}>
                                <input 
                                    type="text" 
                                    placeholder="Type a message..." 
                                    value={chatText} 
                                    onChange={e => setChatText(e.target.value)} 
                                />
                                <button type="submit"><Send size={16} /></button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
