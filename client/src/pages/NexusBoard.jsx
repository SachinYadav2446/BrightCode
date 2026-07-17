import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle, Clock, Search, Code, Cpu, MessageCircle, HelpCircle, Bell, UserCheck } from 'lucide-react';
import API_URL from '../config';
import './NexusBoard.css';

export default function NexusBoard() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', language: 'javascript', tags: '' });
    const [activeTab, setActiveTab] = useState('global'); // 'global' or 'personal'

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/nexus/tickets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(res.data);
        } catch (error) {
            console.error('Error fetching tickets', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTickets();
        const interval = setInterval(fetchTickets, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
            await axios.post(`${API_URL}/api/nexus/tickets`, {
                ...formData,
                tags: tagsArray
            }, { headers: { Authorization: `Bearer ${token}` }});
            setIsModalOpen(false);
            setFormData({ title: '', description: '', language: 'javascript', tags: '' });
            setActiveTab('personal'); // Switch to personal tab when they create a ticket
            fetchTickets();
        } catch (error) {
            console.error('Error creating ticket', error);
        }
    };

    const handleRequestMentor = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/nexus/tickets/${id}/request-mentor`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTickets();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to request mentor');
        }
    };

    const handleAcceptMentor = async (id, mentorId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/nexus/tickets/${id}/accept-mentor`, { mentor_id: mentorId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTickets();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to accept mentor');
        }
    };

    const handleResolveTicket = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/nexus/tickets/${id}/resolve`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTickets();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to resolve ticket');
        }
    };

    const timeAgo = (ts) => {
        const s = Math.floor((Date.now() - new Date(ts)) / 1000);
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s/60)}m ago`;
        if (s < 86400) return `${Math.floor(s/3600)}h ago`;
        return `${Math.floor(s/86400)}d ago`;
    };

    const displayedTickets = tickets.filter(t => {
        if (activeTab === 'global') return true;
        return t.author_id === user?.id || t.mentor_id === user?.id;
    });

    return (
        <div className="nexus-container">
            <header className="nexus-header">
                <div className="nexus-title-section">
                    <h1>The Nexus</h1>
                    <p>Mentorship &amp; SOS Directory</p>
                </div>
                <button className="btn-post-sos" onClick={() => setIsModalOpen(true)}>
                    <Plus size={18} strokeWidth={2.5} /> Create SOS Ticket
                </button>
            </header>

            <div className="nexus-tabs">
                <button 
                    className={`nexus-tab ${activeTab === 'global' ? 'active' : ''}`}
                    onClick={() => setActiveTab('global')}
                >
                    <Globe size={16} /> Global Board
                </button>
                <button 
                    className={`nexus-tab ${activeTab === 'personal' ? 'active' : ''}`}
                    onClick={() => setActiveTab('personal')}
                >
                    <UserCheck size={16} /> My Dashboard
                </button>
            </div>

            {loading ? (
                <div style={{color: 'var(--text-muted)', fontSize: '1rem', padding: '20px'}}>
                    Loading tickets...
                </div>
            ) : (
                <div className="tickets-grid">
                    {displayedTickets.map(ticket => {
                        const isAuthor = ticket.author_id === user?.id;
                        const isMentor = ticket.mentor_id === user?.id;
                        const mentorRequests = ticket.mentor_requests || [];
                        const hasRequested = mentorRequests.some(r => r.id === user?.id);

                        return (
                            <div key={ticket.id} className="ticket-card">
                                <div className="ticket-header">
                                    <h3 className="ticket-title">{ticket.title}</h3>
                                    <span className={`ticket-status status-${ticket.status}`}>
                                        {ticket.status === 'open' ? 'Open' : ticket.status === 'in_progress' ? 'In Progress' : 'Resolved'}
                                    </span>
                                </div>
                                
                                <div className="ticket-meta">
                                    <span className="meta-item"><Clock size={14}/> {timeAgo(ticket.created_at)}</span>
                                    <span className="meta-item"><Code size={14}/> {ticket.language}</span>
                                    <span>@{ticket.author_username}</span>
                                </div>

                                <p className="ticket-desc">{ticket.description}</p>

                                <div className="ticket-tags">
                                    {ticket.tags && ticket.tags.map((tag, idx) => (
                                        <span key={idx} className="ticket-tag">#{tag}</span>
                                    ))}
                                </div>

                                {isAuthor && ticket.status === 'open' && mentorRequests.length > 0 && (
                                    <div className="mentor-requests-panel">
                                        <div className="mentor-requests-header">
                                            <Bell size={14} className="animate-pulse-icon" /> 
                                            <span>{mentorRequests.length} user{mentorRequests.length > 1 ? 's' : ''} offered to help!</span>
                                        </div>
                                        <div className="mentor-requests-list">
                                            {mentorRequests.map(r => (
                                                <div key={r.id} className="mentor-request-item">
                                                    <span>@{r.username}</span>
                                                    <button className="btn-accept" onClick={() => handleAcceptMentor(ticket.id, r.id)}>
                                                        Accept
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="ticket-actions">
                                    {ticket.status === 'open' && !isAuthor && !hasRequested && (
                                        <button className="btn-answer" onClick={() => handleRequestMentor(ticket.id)}>
                                            <MessageCircle size={16} /> Offer Help
                                        </button>
                                    )}
                                    {ticket.status === 'open' && !isAuthor && hasRequested && (
                                        <button className="btn-answer disabled" disabled>
                                            <Clock size={16} /> Offer Pending
                                        </button>
                                    )}
                                    {ticket.status === 'in_progress' && isAuthor && (
                                        <button className="btn-resolve" onClick={() => handleResolveTicket(ticket.id)}>
                                            <CheckCircle size={16} /> Mark Resolved
                                        </button>
                                    )}
                                    {ticket.status === 'in_progress' && isMentor && (
                                        <span className="mentor-active-badge">
                                            <UserCheck size={14} /> You are Mentoring
                                        </span>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                    {displayedTickets.length === 0 && (
                        <div className="empty-state">
                            <HelpCircle size={48} color="var(--border-hi)" />
                            <p>{activeTab === 'global' ? 'No active SOS tickets at the moment.' : 'You have no active tickets or mentorships.'}</p>
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="sos-modal-overlay">
                    <div className="sos-modal">
                        <h2>New SOS Ticket</h2>
                        <form onSubmit={handleCreateTicket}>
                            <div className="sos-form-group">
                                <label>Title</label>
                                <input 
                                    required 
                                    type="text" 
                                    placeholder="e.g. Memory leak in React useEffect"
                                    value={formData.title}
                                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                                />
                            </div>
                            <div className="sos-form-group">
                                <label>Description</label>
                                <textarea 
                                    required 
                                    rows="4" 
                                    placeholder="Explain your issue in detail..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div className="sos-form-group" style={{display: 'flex', gap: '20px'}}>
                                <div style={{flex: 1}}>
                                    <label>Language / Framework</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. React"
                                        value={formData.language}
                                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                                    />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Tags (comma separated)</label>
                                    <input 
                                        type="text" 
                                        placeholder="frontend, bug"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="sos-modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-submit">Submit Ticket</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

// Quick inline stub for missing Globe icon if not imported properly, but lucide-react has Globe.
// I will import Globe above.
