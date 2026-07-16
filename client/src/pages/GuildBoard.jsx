import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Shield, PlusCircle, CheckCircle, Clock, Search, Code, Check } from 'lucide-react';
import API_URL from '../config';
import './GuildBoard.css';

export default function GuildBoard() {
    const { user } = useAuth();
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', language: 'javascript', tags: '' });

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/api/guild/tickets`, {
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
        
        // Polling as a fallback if sockets aren't implemented for guild yet
        const interval = setInterval(fetchTickets, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleCreateTicket = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const tagsArray = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
            await axios.post(`${API_URL}/api/guild/tickets`, {
                ...formData,
                tags: tagsArray
            }, { headers: { Authorization: `Bearer ${token}` }});
            setIsModalOpen(false);
            setFormData({ title: '', description: '', language: 'javascript', tags: '' });
            fetchTickets();
        } catch (error) {
            console.error('Error creating ticket', error);
        }
    };

    const handleAnswerTicket = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/guild/tickets/${id}/answer`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTickets();
        } catch (error) {
            alert(error.response?.data?.error || 'Failed to answer ticket');
        }
    };

    const handleResolveTicket = async (id) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/api/guild/tickets/${id}/resolve`, {}, {
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

    return (
        <div className="guild-container">
            <header className="guild-header">
                <div className="guild-title-section">
                    <h1><Shield size={32} color="var(--primary)" /> The Guild</h1>
                    <p>Mentorship, SOS Tickets, and Collaborative Code Bounties</p>
                </div>
                <button className="btn-post-sos" onClick={() => setIsModalOpen(true)}>
                    <PlusCircle size={20} /> Post SOS Ticket
                </button>
            </header>

            {loading ? (
                <div>Loading Guild Board...</div>
            ) : (
                <div className="tickets-grid">
                    {tickets.map(ticket => (
                        <div key={ticket.id} className="ticket-card">
                            <div className="ticket-header">
                                <h3 className="ticket-title">{ticket.title}</h3>
                                <span className={`ticket-status status-${ticket.status}`}>
                                    {ticket.status === 'open' ? 'OPEN' : ticket.status === 'in_progress' ? 'IN PROGRESS' : 'RESOLVED'}
                                </span>
                            </div>
                            
                            <div className="ticket-meta">
                                <span className="meta-item"><Clock size={14}/> {timeAgo(ticket.created_at)}</span>
                                <span className="meta-item"><Code size={14}/> {ticket.language}</span>
                                <span>by @{ticket.author_username}</span>
                            </div>

                            <p className="ticket-desc">{ticket.description}</p>

                            <div className="ticket-tags">
                                {ticket.tags && ticket.tags.map((tag, idx) => (
                                    <span key={idx} className="ticket-tag">#{tag}</span>
                                ))}
                            </div>

                            <div className="ticket-actions">
                                {ticket.status === 'open' && ticket.author_id !== user?.id && (
                                    <button className="btn-answer" onClick={() => handleAnswerTicket(ticket.id)}>
                                        <Shield size={16} /> Answer the Call
                                    </button>
                                )}
                                {ticket.status === 'in_progress' && ticket.author_id === user?.id && (
                                    <button className="btn-resolve" onClick={() => handleResolveTicket(ticket.id)}>
                                        <CheckCircle size={16} /> Mark as Resolved
                                    </button>
                                )}
                                {ticket.status === 'in_progress' && ticket.mentor_id === user?.id && (
                                    <span style={{color: 'var(--primary)', alignSelf: 'center', fontWeight: 'bold'}}>
                                        You are mentoring this ticket
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                    {tickets.length === 0 && (
                        <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '40px', color: '#888'}}>
                            No active SOS tickets. The realm is peaceful.
                        </div>
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="sos-modal-overlay">
                    <div className="sos-modal">
                        <h2><PlusCircle color="var(--primary)" /> Create SOS Ticket</h2>
                        <form onSubmit={handleCreateTicket}>
                            <div className="sos-form-group">
                                <label>Title (What do you need help with?)</label>
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
                                    placeholder="Explain your bug, goal, or what you are struggling to understand..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                            <div className="sos-form-group" style={{display: 'flex', gap: '15px'}}>
                                <div style={{flex: 1}}>
                                    <label>Language/Tech</label>
                                    <input 
                                        type="text" 
                                        placeholder="e.g. javascript"
                                        value={formData.language}
                                        onChange={(e) => setFormData({...formData, language: e.target.value})}
                                    />
                                </div>
                                <div style={{flex: 1}}>
                                    <label>Tags (comma separated)</label>
                                    <input 
                                        type="text" 
                                        placeholder="react, bug, frontend"
                                        value={formData.tags}
                                        onChange={(e) => setFormData({...formData, tags: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="sos-modal-actions">
                                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-submit"><Check size={18}/> Broadcast SOS</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
