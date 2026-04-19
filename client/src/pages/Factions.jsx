import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Zap, Plus, Crown, Shield, Swords } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Factions.css';

const EMBLEMS = ['⚔️', '🛡️', '🔥', '⚡', '🌙', '💎', '🦅', '🐉', '🌊', '☄️', '🧪', '🎯'];

const Factions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [factions, setFactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myFactionId, setMyFactionId] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFaction, setNewFaction] = useState({ name: '', description: '', emblem: '⚔️' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => { fetchFactions(); }, []);

    const fetchFactions = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/factions', { timeout: 6000 });
            const list = res.data || [];
            setFactions(list);
            if (user) {
                const mine = list.find(f => f.members?.some(m => m.username === user.username));
                setMyFactionId(mine?.id || null);
            }
        } catch {
            toast.error('Could not connect to Syndicate server.');
        } finally {
            setLoading(false);
        }
    };

    const createFaction = async () => {
        if (!newFaction.name.trim()) return toast.error('Faction name is required.');
        if (!user) return toast.error('Login required.');
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/factions/create', newFaction, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(`Faction "${newFaction.name}" established!`, {
                style: { background: '#1c1917', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }
            });
            setShowCreateModal(false);
            setNewFaction({ name: '', description: '', emblem: '⚔️' });
            fetchFactions();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to create faction.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const joinFaction = async (factionId) => {
        if (!user) { navigate('/auth'); return; }
        if (myFactionId) return toast.error('Leave your current faction before joining another.');
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5000/factions/join/${factionId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success(res.data.message);
            setMyFactionId(factionId);
            fetchFactions();
        } catch (err) {
            toast.error(err.response?.data?.error || 'Failed to join.');
        }
    };

    const leaveFaction = async () => {
        if (!myFactionId) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5000/factions/leave/${myFactionId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success('Left faction.');
            setMyFactionId(null);
            fetchFactions();
        } catch {
            toast.error('Failed to leave faction.');
        }
    };

    const totalEngineers = factions.reduce((s, f) => s + (f.members?.length || 0), 0);
    const totalXP = factions.reduce((s, f) => s + (f.totalXp || 0), 0);

    return (
        <div className="factions-page">
            {/* Background */}
            <div className="bg-container">
                <div className="noise-texture"></div>
                <div className="grid-background"></div>
                <div className="faction-ambient-light"></div>
            </div>

            {/* Nav */}
            <nav className="factions-nav">
                <button onClick={() => navigate('/')} className="back-btn">
                    <ArrowLeft size={20} /> Back to Hub
                </button>
                <div className="nav-title">
                    <Swords size={24} color="#818cf8" />
                    <span>Faction Syndicate</span>
                </div>
                <div className="factions-nav-actions">
                    {myFactionId && (
                        <button className="leave-faction-btn" onClick={leaveFaction}>
                            Leave Faction
                        </button>
                    )}
                    {user && !myFactionId && (
                        <button className="primary-btn glow-btn" onClick={() => setShowCreateModal(true)}>
                            <Plus size={16} /> Found Faction
                        </button>
                    )}
                </div>
            </nav>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
                        <motion.div className="faction-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                            <div className="faction-modal-header">
                                <Swords size={22} color="#818cf8" />
                                <h3>Found a New Faction</h3>
                                <p>Unite engineers under your banner and battle for global supremacy.</p>
                            </div>

                            <div className="emblem-picker">
                                <label>Choose Emblem</label>
                                <div className="emblems-grid">
                                    {EMBLEMS.map(e => (
                                        <button key={e} className={`emblem-btn${newFaction.emblem === e ? ' selected' : ''}`}
                                            onClick={() => setNewFaction(prev => ({ ...prev, emblem: e }))}>
                                            {e}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="faction-form-group">
                                <label>Faction Name <span style={{ color: '#ef4444' }}>*</span></label>
                                <input type="text" className="faction-input" placeholder="e.g. Neon Vanguard, Quantum Syndicate..."
                                    value={newFaction.name} onChange={e => setNewFaction(prev => ({ ...prev, name: e.target.value }))}
                                    maxLength={32} />
                            </div>

                            <div className="faction-form-group">
                                <label>Manifesto <span style={{ color: '#666', fontWeight: 400 }}>(optional)</span></label>
                                <textarea className="faction-textarea" placeholder="What does your faction stand for?"
                                    value={newFaction.description} onChange={e => setNewFaction(prev => ({ ...prev, description: e.target.value }))}
                                    maxLength={120} rows={2} />
                            </div>

                            <div className="faction-modal-footer">
                                <button className="secondary-btn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button className="primary-btn glow-btn" onClick={createFaction} disabled={isSubmitting || !newFaction.name.trim()}>
                                    {isSubmitting ? 'Establishing...' : `${newFaction.emblem} Establish Faction`}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="factions-container">
                {/* Stats Banner */}
                <div className="factions-stats-banner">
                    <div className="faction-stat"><Swords size={18} color="#818cf8" /><span><strong>{factions.length}</strong> Active Factions</span></div>
                    <div className="faction-stat-divider"></div>
                    <div className="faction-stat"><Users size={18} color="#818cf8" /><span><strong>{totalEngineers}</strong> Engineers Enlisted</span></div>
                    <div className="faction-stat-divider"></div>
                    <div className="faction-stat"><Zap size={18} color="#fbbf24" /><span><strong>{totalXP.toLocaleString()}</strong> Combined XP</span></div>
                </div>

                {loading ? (
                    <div className="factions-loading">
                        <div className="factions-loading-ring"></div>
                        <p>Loading syndicate data...</p>
                    </div>
                ) : factions.length === 0 ? (
                    <motion.div className="factions-empty" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="empty-emblem">⚔️</div>
                        <h3>No Factions Exist Yet</h3>
                        <p>Be the first engineer to establish a faction and begin the battle for dominance.</p>
                        {user && (
                            <button className="primary-btn glow-btn" style={{ marginTop: '20px' }} onClick={() => setShowCreateModal(true)}>
                                <Plus size={16} /> Found the First Faction
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="factions-grid">
                        {factions.map((faction, idx) => {
                            const isMine = myFactionId === faction.id;
                            const isMember = faction.members?.some(m => m.username === user?.username);
                            const canJoin = user && !isMember && !myFactionId;
                            const totalFactionXP = faction.totalXp || faction.members?.reduce((s, m) => s + (m.xp || 0), 0) || 0;

                            return (
                                <motion.div
                                    key={faction.id}
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.08 }}
                                    className={`faction-card${isMine ? ' my-faction-card' : ''}`}
                                >
                                    {/* Rank Badge */}
                                    <div className="faction-rank-number">#{idx + 1}</div>
                                    {idx === 0 && <Crown size={18} className="faction-top-crown" />}

                                    <div className="faction-card-top">
                                        <div className="faction-emblem">{faction.emblem || '⚔️'}</div>
                                        <div className="faction-info">
                                            <h3>{faction.name}</h3>
                                            {faction.description && <p className="faction-desc">{faction.description}</p>}
                                            <div className="faction-owner-line">
                                                <Crown size={11} color="#fbbf24" /> Led by <strong>{faction.ownerName}</strong>
                                            </div>
                                        </div>
                                    </div>

                                    {/* XP Bar */}
                                    <div className="faction-xp-section">
                                        <div className="faction-xp-bar-track">
                                            <div className="faction-xp-bar-fill" style={{ width: `${Math.min(totalFactionXP / 1000 * 100, 100)}%` }}></div>
                                        </div>
                                        <span className="faction-xp-label"><Zap size={11} fill="#fbbf24" />{totalFactionXP.toLocaleString()} XP</span>
                                    </div>

                                    <div className="faction-card-bottom">
                                        {/* Member Avatars */}
                                        <div className="faction-members-row">
                                            {(faction.members || []).slice(0, 6).map(m => (
                                                <div key={m.id || m.username} className="member-pip" title={m.username}>
                                                    {m.username?.charAt(0)?.toUpperCase()}
                                                </div>
                                            ))}
                                            {(faction.members?.length || 0) > 6 && (
                                                <div className="member-pip more">+{faction.members.length - 6}</div>
                                            )}
                                            <span className="member-count-label">{faction.members?.length || 0} members</span>
                                        </div>

                                        {/* Action */}
                                        <div className="faction-action-area">
                                            {isMine && <div className="my-faction-badge"><Shield size={13} /> My Faction</div>}
                                            {canJoin && (
                                                <button className="enlist-btn" onClick={() => joinFaction(faction.id)}>
                                                    Enlist
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
};

export default Factions;
