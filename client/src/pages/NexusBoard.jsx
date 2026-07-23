import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Plus, CheckCircle, Clock, Search, Code, Cpu, MessageCircle, HelpCircle, Bell, UserCheck, Send, Layout, Globe, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../config';
import './NexusBoard.css';

const TicketCard = ({ ticket }) => {
    const navigate = useNavigate();

    const timeAgo = (ts) => {
        const s = Math.floor((Date.now() - new Date(ts)) / 1000);
        if (s < 60) return `${s}s ago`;
        if (s < 3600) return `${Math.floor(s/60)}m ago`;
        if (s < 86400) return `${Math.floor(s/3600)}h ago`;
        return `${Math.floor(s/86400)}d ago`;
    };

    return (
        <div className="ticket-card" onClick={() => navigate(`/nexus/ticket/${ticket.id}`)} style={{ cursor: 'pointer' }}>
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
            
            <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--nexus-border)', textAlign: 'center', color: 'var(--nexus-blue)', fontWeight: '600', fontSize: '0.9rem' }}>
                View Details & Collaborate →
            </div>
        </div>
    );
};

export default function NexusBoard() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', language: 'javascript', tags: '' });
    const [activeTab, setActiveTab] = useState('global');

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
            const tagsArray = formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
            await axios.post(`${API_URL}/api/nexus/tickets`, {
                ...formData,
                tags: tagsArray
            }, { headers: { Authorization: `Bearer ${token}` }});
            setIsModalOpen(false);
            setFormData({ title: '', description: '', language: 'javascript', tags: '' });
            setActiveTab('personal');
            fetchTickets();
        } catch (error) {
            console.error('Error creating ticket', error);
            alert('Failed to create ticket: ' + (error.response?.data?.error || error.message));
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

    const handleRevokeMentor = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/nexus/tickets/${id}/revoke-mentor`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTickets();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to reopen ticket');
        }
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
                    <Plus size={18} strokeWidth={2.5} /> <span className="btn-post-sos-text">Create SOS Ticket</span>
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
            ) : activeTab === 'global' ? (
                <div className="tickets-grid">
                    {tickets.map(ticket => (
                        <TicketCard key={ticket.id} ticket={ticket} />
                    ))}
                    {tickets.length === 0 && (
                        <div className="empty-state">
                            <HelpCircle size={48} color="var(--border-hi)" />
                            <p>No active SOS tickets at the moment.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="personal-dashboard">
                    {/* ── Issues Raised ── */}
                    <div className="dashboard-section">
                        <div className="dashboard-section-header raised">
                            <HelpCircle size={18} />
                            <span>Issues Raised</span>
                            <span className="section-badge">{tickets.filter(t => t.author_id === user?.id).length}</span>
                        </div>
                        <div className="tickets-grid dashboard-grid">
                            {tickets.filter(t => t.author_id === user?.id).map(ticket => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            ))}
                            {tickets.filter(t => t.author_id === user?.id).length === 0 && (
                                <div className="empty-state-inline">
                                    <HelpCircle size={32} color="var(--border-hi)" />
                                    <p>You haven't raised any issues yet.</p>
                                    <button className="btn-post-sos-sm" onClick={() => setIsModalOpen(true)}>
                                        <Plus size={14} /> Create SOS Ticket
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Issues Mentored ── */}
                    <div className="dashboard-section">
                        <div className="dashboard-section-header mentored">
                            <UserCheck size={18} />
                            <span>Issues Mentored</span>
                            <span className="section-badge mentored-badge">{tickets.filter(t => t.mentor_id === user?.id).length}</span>
                        </div>
                        <div className="tickets-grid dashboard-grid">
                            {tickets.filter(t => t.mentor_id === user?.id).map(ticket => (
                                <TicketCard key={ticket.id} ticket={ticket} />
                            ))}
                            {tickets.filter(t => t.mentor_id === user?.id).length === 0 && (
                                <div className="empty-state-inline">
                                    <UserCheck size={32} color="var(--border-hi)" />
                                    <p>You haven't mentored anyone yet.</p>
                                    <p style={{fontSize: '0.8rem', opacity: 0.6}}>Browse the Global Board and offer help!</p>
                                </div>
                            )}
                        </div>
                    </div>
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

