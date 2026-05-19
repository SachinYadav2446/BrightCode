import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, Zap, Plus, Crown, Shield, Code, Swords, Trophy, Target, Award, Calendar, Sparkles, Search, Filter, TrendingUp, Globe, Lock, Trash2, UserMinus, MoreVertical, MessageSquare } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import ChatPanel from '../components/ChatPanel';
import { initSocket } from '../socket';
import './Factions.css';

const EMBLEMS = ['⚔️', '🛡️', '🔥', '⚡', '🌙', '💎', '🦅', '🐉', '🌊', '☄️', '🧪', '🎯'];

const FEATURE_CARDS = [
    { id: 'rankings', title: 'Global Rankings', icon: <Trophy size={32} />, desc: 'Dominate the global leaderboard and establish your syndicate\'s legacy.', color: 'var(--primary-dark)' },
    { id: 'xp', title: 'Collaborative XP', icon: <Zap size={32} />, desc: 'Sync your code with operatives to unlock massive faction-wide multipliers.', color: '#d4a847' },
    { id: 'wars', title: 'Guild Wars', icon: <Swords size={32} />, desc: 'Deploy your squad on Sundays for high-stakes territory battles.', color: 'var(--bg-surface)' },
    { id: 'vault', title: 'Private Vaults', icon: <Lock size={32} />, desc: 'Secure exclusive snippets and tactical assets in encrypted repositories.', color: '#8a7f72' },
    { id: 'hub', title: 'Global Command', icon: <Code size={32} />, desc: 'Communicate and collaborate with the world\'s most elite engineering teams.', color: '#2563eb' },
];

const Factions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const goBackPreserveScroll = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate('/');
    };
    const [factions, setFactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [myFactionId, setMyFactionId] = useState(null);
    const [myFactionName, setMyFactionName] = useState(null);
    const [myFactionEmblem, setMyFactionEmblem] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFaction, setNewFaction] = useState({ name: '', description: '', emblem: '⚔️', isPublic: true });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showHQ, setShowHQ] = useState(false);
    const [activeMemberMenu, setActiveMemberMenu] = useState(null);
    const [focusedCard, setFocusedCard] = useState(null);
    const [hqTab, setHqTab] = useState('roster'); // 'roster', 'chat', 'intel'
    const [socket, setSocket] = useState(null);
    const [chatMessages, setChatMessages] = useState([]);
    const [kickConfirmModal, setKickConfirmModal] = useState({ show: false, member: null });
    const [pendingRequests, setPendingRequests] = useState(new Set()); // Track pending join requests

    useEffect(() => {
        let s = null;
        if (myFactionId && !socket) {
            s = initSocket();
            setSocket(s);

            const roomId = `faction_${myFactionId}`;

            // Wait for connection before joining — fixes the race condition
            s.on('connect', () => {
                console.log('[Chat] Connected, joining room:', roomId);
                s.emit('join-chat-room', { roomId });
            });

            s.on('chat-history', ({ messages: history }) => {
                console.log('[Chat] History received:', history.length, 'messages');
                setChatMessages(history);
            });

            s.on('new-chat-message', (message) => {
                console.log('[Chat] New message received:', message);
                setChatMessages(prev => [...prev, message]);
            });

            // If already connected (reconnect), join immediately
            if (s.connected) {
                s.emit('join-chat-room', { roomId });
            }
        }
        return () => {
            if (s) {
                s.off('connect');
                s.off('chat-history');
                s.off('new-chat-message');
                s.disconnect();
                setSocket(null);
                setChatMessages([]);
            }
        };
    }, [myFactionId]);

    useEffect(() => { fetchFactions(); }, []);

    const fetchFactions = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5051/factions', { timeout: 6000 });
            const list = res.data || [];
            setFactions(list);
            if (user) {
                const mine = list.find(f => f.members?.some(m => m.username === user.username));
                setMyFactionId(mine?.id || null);
                setMyFactionName(mine?.name || null);
                setMyFactionEmblem(mine?.emblem || null);
            }
        } catch {
            // Silently handle error
        } finally {
            setLoading(false);
        }
    };

    const createFaction = async () => {
        if (!newFaction.name.trim()) return;
        if (!user) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5051/factions/create', newFaction, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setShowCreateModal(false);
            setNewFaction({ name: '', description: '', emblem: '⚔️', isPublic: true });
            fetchFactions();
        } catch (err) {
            // Silently handle error
        } finally {
            setIsSubmitting(false);
        }
    };

    const joinFaction = async (factionId) => {
        if (!user) { navigate('/auth'); return; }
        if (myFactionId) return;
        
        // Mark this faction as having a pending request
        setPendingRequests(prev => new Set([...prev, factionId]));
        
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5051/factions/join/${factionId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.data.pending) {
                setMyFactionId(factionId);
            }
            fetchFactions();
        } catch (err) {
            // Remove from pending if failed
            setPendingRequests(prev => {
                const newSet = new Set(prev);
                newSet.delete(factionId);
                return newSet;
            });
        }
    };

    const leaveFaction = async () => {
        if (!myFactionId) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5051/factions/leave/${myFactionId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyFactionId(null);
            fetchFactions();
        } catch {
            // Silently handle error
        }
    };

    const approveMember = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5051/factions/${myFactionId}/approve`, { userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFactions();
        } catch (err) {
            // Silently handle error
        }
    };

    const declineMember = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5051/factions/${myFactionId}/decline`, { userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFactions();
        } catch (err) {
            // Silently handle error
        }
    };

    const kickMember = async (userId) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5051/factions/${myFactionId}/kick`, { userId }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setKickConfirmModal({ show: false, member: null });
            fetchFactions();
        } catch (err) {
            // Silently handle error
        }
    };

    const togglePrivacy = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`http://localhost:5051/factions/${myFactionId}/toggle-privacy`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchFactions();
        } catch (err) {
            // Silently handle error
        }
    };

    const disbandFaction = async () => {
        if (!window.confirm('PERMANENTLY DISBAND this syndicate? All members will be removed and progress lost.')) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post(`http://localhost:5051/factions/disband/${myFactionId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMyFactionId(null);
            fetchFactions();
        } catch (err) {
            // Silently handle error
        }
    };

    const totalEngineers = factions.reduce((s, f) => s + (f.members?.length || 0), 0);
    const totalXP = factions.reduce((s, f) => s + (f.totalXp || 0), 0);

    return (
        <div className="factions-page">
            <div className="bg-container">
                <div className="noise-texture"></div>
                <div className="grid-background"></div>
                <div className="faction-ambient-light"></div>
            </div>

            <AnimatePresence>
                {showCreateModal && (
                    <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={(e) => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
                        <motion.div className="faction-modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}>
                            <div className="faction-modal-header">
                                <Code size={22} color="#818cf8" />
                                <h3>Found a New Guild</h3>
                                <p>Unite engineers under your banner and collaborate for global ranking.</p>
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
                                <label>Faction Name <span style={{ color: 'var(--primary)' }}>*</span></label>
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

                            <div className="faction-form-group">
                                <label>Syndicate Type</label>
                                <div className="privacy-toggle-group">
                                    <button
                                        type="button"
                                        className={`privacy-opt ${newFaction.isPublic ? 'active' : ''}`}
                                        onClick={() => setNewFaction(prev => ({ ...prev, isPublic: true }))}
                                    >
                                        <Globe size={14} /> Public
                                    </button>
                                    <button
                                        type="button"
                                        className={`privacy-opt ${!newFaction.isPublic ? 'active' : ''}`}
                                        onClick={() => setNewFaction(prev => ({ ...prev, isPublic: false }))}
                                    >
                                        <Lock size={14} /> Private
                                    </button>
                                </div>
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

            <section className="faction-cream-hero">
                <div className="faction-cards-stage">
                    <div className="cards-glow"></div>
                    {FEATURE_CARDS.map((card, idx) => (
                        <motion.div
                            key={card.id}
                            className={`play-card c${idx + 1} ${focusedCard === card.id ? 'focused' : ''}`}
                            onClick={() => setFocusedCard(focusedCard === card.id ? null : card.id)}
                            layout
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        >
                            <div className="card-inner">
                                <div className="card-top-icon" style={{ color: card.color }}>
                                    {card.icon}
                                </div>
                                <div className="card-main-content">
                                    <h4 className="card-feature-title">{card.title}</h4>
                                    <p className="card-feature-desc">{card.desc}</p>
                                </div>
                                <div className="card-footer-accent" style={{ background: card.color }}></div>
                            </div>
                            <div className="card-sheen"></div>
                        </motion.div>
                    ))}

                    <AnimatePresence>
                        {focusedCard && (
                            <motion.div
                                className="card-focus-overlay"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setFocusedCard(null)}
                            />
                        )}
                    </AnimatePresence>
                </div>

                <div className="faction-hero-cta">
                    <div className="faction-hero-tag">⚔️ Developer Guilds</div>
                    <h1 className="faction-hero-title">
                        Choose Your <span className="faction-hero-red">Faction.</span><br />
                        Prove Your Worth.
                    </h1>
                    <p className="faction-hero-desc">
                        Unite with elite engineers. Collaborate, climb the rankings, and build your legacy.
                    </p>
                    <div className="faction-hero-actions">
                        {user && !myFactionId ? (
                            <>
                                <button className="faction-cta-primary" onClick={() => setShowCreateModal(true)}>
                                    <Plus size={18} /> Found a Guild
                                </button>
                                <button className="faction-cta-secondary" onClick={() => document.querySelector('.factions-grid-section')?.scrollIntoView({ behavior: 'smooth' })}>
                                    Browse Guilds
                                </button>
                            </>
                        ) : myFactionId ? (
                            <div className="joined-faction-status">
                                <div className="status-label">CURRENTLY ACTIVE IN</div>
                                <div className="joined-faction-badge">
                                    <span className="joined-emblem">{myFactionEmblem}</span>
                                    <div className="joined-badge-main">
                                        <span className="joined-name">{myFactionName}</span>
                                        <div className="badge-mini-stats">
                                            <div className="b-stat"><strong>{factions.length}</strong><span>Guilds</span></div>
                                            <div className="b-divider"></div>
                                            <div className="b-stat"><strong>{totalEngineers}</strong><span>Members</span></div>
                                            <div className="b-divider"></div>
                                            <div className="b-stat"><strong>{totalXP.toLocaleString()}</strong><span>Total XP</span></div>
                                        </div>
                                    </div>
                                    <button className="leave-small-link" onClick={leaveFaction}>LEAVE GUILD</button>
                                </div>

                                <button
                                    className={`hq-toggle-btn ${showHQ ? 'active' : ''}`}
                                    onClick={() => {
                                        setShowHQ(!showHQ);
                                        if (!showHQ) {
                                            setTimeout(() => {
                                                document.querySelector('.my-guild-hq-section')?.scrollIntoView({ behavior: 'smooth' });
                                            }, 100);
                                        }
                                    }}
                                >
                                    <Shield size={16} />
                                    {showHQ ? 'Close Command Center' : 'Enter Command Center'}
                                </button>
                            </div>
                        ) : (
                            <>
                                <button className="faction-cta-primary" onClick={() => { navigate('/auth'); }}>
                                    Sign In to Join
                                </button>
                                <button className="faction-cta-secondary" onClick={() => document.querySelector('.factions-grid-section')?.scrollIntoView({ behavior: 'smooth' })}>
                                    Browse Guilds
                                </button>
                            </>
                        )}
                    </div>

                    {!myFactionId && (
                        <div className="faction-hero-mini-stats">
                            <div><strong>{factions.length}</strong><span>Guilds</span></div>
                            <div className="mini-divider"></div>
                            <div><strong>{totalEngineers}</strong><span>Members</span></div>
                            <div className="mini-divider"></div>
                            <div><strong>{totalXP.toLocaleString()}</strong><span>Total XP</span></div>
                        </div>
                    )}
                </div>
            </section>

            {!myFactionId && (
                <section className="faction-benefits-scroll">
                    <div className="benefits-marquee">
                        <div className="benefits-track">
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Trophy size={28} color="var(--primary-dark)" /></div>
                                <div className="benefit-text-content">
                                    <h3>Rankings</h3>
                                    <p>Lead your guild to the #1 spot on the global leaderboard.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Zap size={28} color="#d4a847" /></div>
                                <div className="benefit-text-content">
                                    <h3>Shared XP</h3>
                                    <p>Combine code with others to unlock faction-wide perks.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Target size={28} color="var(--primary-dark)" /></div>
                                <div className="benefit-text-content">
                                    <h3>Collab</h3>
                                    <p>Work on exclusive projects in a focused guild environment.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Award size={28} color="#d4a847" /></div>
                                <div className="benefit-text-content">
                                    <h3>Reputation</h3>
                                    <p>Build a unique brand with custom emblems and manifestos.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Shield size={28} color="var(--primary-dark)" /></div>
                                <div className="benefit-text-content">
                                    <h3>Private Repos</h3>
                                    <p>Access exclusive codebases reserved for your guild members.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Calendar size={28} color="#d4a847" /></div>
                                <div className="benefit-text-content">
                                    <h3>Events</h3>
                                    <p>Compete in high-stakes guild-vs-guild coding challenges.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Users size={28} color="var(--primary-dark)" /></div>
                                <div className="benefit-text-content">
                                    <h3>Mentors</h3>
                                    <p>Get direct feedback from senior guild leads and masters.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Sparkles size={28} color="#d4a847" /></div>
                                <div className="benefit-text-content">
                                    <h3>Badges</h3>
                                    <p>Unlock unique visual flair for your developer profile.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Trophy size={28} color="var(--primary-dark)" /></div>
                                <div className="benefit-text-content">
                                    <h3>Rankings</h3>
                                    <p>Lead your guild to the #1 spot on the global leaderboard.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Zap size={28} color="#d4a847" /></div>
                                <div className="benefit-text-content">
                                    <h3>Shared XP</h3>
                                    <p>Combine code with others to unlock faction-wide perks.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Target size={28} color="var(--primary-dark)" /></div>
                                <div className="benefit-text-content">
                                    <h3>Collab</h3>
                                    <p>Work on exclusive projects in a focused guild environment.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Award size={28} color="#d4a847" /></div>
                                <div className="benefit-text-content">
                                    <h3>Reputation</h3>
                                    <p>Build a unique brand with custom emblems and manifestos.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Shield size={28} color="var(--primary-dark)" /></div>
                                <div className="benefit-text-content">
                                    <h3>Private Repos</h3>
                                    <p>Access exclusive codebases reserved for your guild members.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Calendar size={28} color="#d4a847" /></div>
                                <div className="benefit-text-content">
                                    <h3>Events</h3>
                                    <p>Compete in high-stakes guild-vs-guild coding challenges.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Users size={28} color="var(--primary-dark)" /></div>
                                <div className="benefit-text-content">
                                    <h3>Mentors</h3>
                                    <p>Get direct feedback from senior guild leads and masters.</p>
                                </div>
                            </div>
                            <div className="benefit-card">
                                <div className="benefit-icon-wrapper"><Sparkles size={28} color="#d4a847" /></div>
                                <div className="benefit-text-content">
                                    <h3>Badges</h3>
                                    <p>Unlock unique visual flair for your developer profile.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {myFactionId && showHQ && (
                <section className="my-guild-hq-section">
                    <div className="hq-container">
                        <div className="hq-header">
                            <div className="hq-title-group">
                                <Shield className="hq-icon" size={24} />
                                <div className="hq-text">
                                    <div className="hq-level-pill">LVL {
                                        (factions.find(f => f.id === myFactionId)?.totalXp || 0) >= 8000 ? 5 :
                                            (factions.find(f => f.id === myFactionId)?.totalXp || 0) >= 5500 ? 4 :
                                                (factions.find(f => f.id === myFactionId)?.totalXp || 0) >= 3000 ? 3 :
                                                    (factions.find(f => f.id === myFactionId)?.totalXp || 0) >= 1000 ? 2 : 1
                                    } SYNDICATE</div>
                                    <h2><span className="black-accent">Syndicate</span> Headquarters</h2>
                                    <p>The inner circle of <strong>{myFactionName}</strong></p>
                                </div>
                            </div>
                            <div className="hq-stats">
                                <div className="hq-stat-box">
                                    <span className="hq-val">{factions.find(f => f.id === myFactionId)?.members?.length || 0}</span>
                                    <span className="hq-lab">Operatives</span>
                                </div>
                                <div className="hq-stat-box">
                                    <span className="hq-val">#{factions.findIndex(f => f.id === myFactionId) + 1}</span>
                                    <span className="hq-lab">Global Rank</span>
                                </div>
                            </div>
                        </div>

                        {/* HQ Internal Navigation */}
                        <div className="hq-nav-bar">
                            <div className="hq-nav-left">
                                <button className={`hq-nav-item ${hqTab === 'roster' ? 'active' : ''}`} onClick={() => setHqTab('roster')}>
                                    <Users size={16} /> Roster
                                </button>
                                <button className={`hq-nav-item ${hqTab === 'chat' ? 'active' : ''}`} onClick={() => setHqTab('chat')}>
                                    <MessageSquare size={16} /> Comm Center
                                </button>
                                {user?.username === factions.find(f => f.id === myFactionId)?.ownerName && (
                                    <button className={`hq-nav-item ${hqTab === 'intel' ? 'active' : ''}`} onClick={() => setHqTab('intel')}>
                                        <Shield size={16} /> Intel {(factions.find(f => f.id === myFactionId)?.pendingMembers || []).length > 0 && <span className="intel-count">{(factions.find(f => f.id === myFactionId)?.pendingMembers || []).length}</span>}
                                    </button>
                                )}
                            </div>
                            <button 
                                className="hq-arena-btn"
                                onClick={() => navigate('/battle-arena')}
                            >
                                <Swords size={16} />
                                <span>Battle Arena</span>
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            {hqTab === 'roster' && (
                                <motion.div 
                                    key="roster"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="hq-tab-content"
                                >
                                    <div className="hq-members-grid">
                                        <div className="hq-member-list-header">
                                            <span>Operative</span>
                                            <span>Weekly Gain</span>
                                            <span>Total XP</span>
                                            <span>Mastery</span>
                                        </div>
                                        <div className="hq-member-rows">
                                            {(factions.find(f => f.id === myFactionId)?.members || []).map((member, i) => {
                                                const weeklyXp = 0;
                                                const totalContributed = 0;
                                                const memberLvl = 1;

                                                return (
                                                    <div key={member.id || member.username} className="hq-member-row">
                                                        <div className="hq-member-info">
                                                            <div className="hq-avatar">
                                                                {member.username?.charAt(0).toUpperCase()}
                                                                {member.username === user?.username && <div className="me-indicator">YOU</div>}
                                                            </div>
                                                            <div className="hq-name-group">
                                                                <span className="hq-username">{member.username}</span>
                                                                <span className="hq-rank-tag">
                                                                    {member.username === factions.find(f => f.id === myFactionId)?.ownerName ? 'Syndicate Lead' : 'Elite Operative'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                        <div className="hq-stat-col hq-weekly-xp">
                                                            <span className="hq-stat-val">+{weeklyXp}</span>
                                                            <span className="hq-stat-sub">this week</span>
                                                        </div>
                                                        <div className="hq-stat-col hq-total-xp">
                                                            <span className="hq-stat-val">{totalContributed.toLocaleString()}</span>
                                                            <span className="hq-stat-sub">lifetime</span>
                                                        </div>
                                                        <div className="hq-stat-col hq-mastery">
                                                            <div className="mastery-track">
                                                                <div className="mastery-fill" style={{ width: `20%` }}></div>
                                                            </div>
                                                            <span className="mastery-lvl">LVL {memberLvl}</span>
                                                        </div>
                                                        <div className="hq-action-col">
                                                            {user?.username === factions.find(f => f.id === myFactionId)?.ownerName && member.username !== user?.username && (
                                                                <button 
                                                                    className="hq-kick-direct-btn"
                                                                    onClick={() => setKickConfirmModal({ show: true, member })}
                                                                    title="Remove from Syndicate"
                                                                >
                                                                    <UserMinus size={16} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {hqTab === 'chat' && (
                                <motion.div 
                                    key="chat"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="hq-tab-content chat-center-view"
                                >
                                    <ChatPanel 
                                        socket={socket} 
                                        roomId={`faction_${myFactionId}`} 
                                        user={user} 
                                        title={`${myFactionName} Comm Channel`}
                                        messages={chatMessages}
                                    />
                                </motion.div>
                            )}

                            {hqTab === 'intel' && (
                                <motion.div 
                                    key="intel"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="hq-tab-content"
                                >
                                    {/* Privacy Toggle Section */}
                                    <div className="hq-privacy-section">
                                        <h3 className="hq-sub-title">Syndicate Privacy Settings</h3>
                                        <div className="privacy-control-card">
                                            <div className="privacy-info">
                                                <div className="privacy-icon-wrapper">
                                                    {factions.find(f => f.id === myFactionId)?.isPublic === false ? (
                                                        <Lock size={24} color="var(--primary)" />
                                                    ) : (
                                                        <Globe size={24} color="#22c55e" />
                                                    )}
                                                </div>
                                                <div className="privacy-text">
                                                    <h4>Current Status: {factions.find(f => f.id === myFactionId)?.isPublic === false ? 'Private' : 'Public'}</h4>
                                                    <p>
                                                        {factions.find(f => f.id === myFactionId)?.isPublic === false 
                                                            ? 'Only approved members can join. New recruits must request access.'
                                                            : 'Anyone can join your syndicate instantly without approval.'}
                                                    </p>
                                                </div>
                                            </div>
                                            <button 
                                                className="privacy-toggle-action-btn"
                                                onClick={togglePrivacy}
                                            >
                                                {factions.find(f => f.id === myFactionId)?.isPublic === false ? (
                                                    <>
                                                        <Globe size={16} />
                                                        Make Public
                                                    </>
                                                ) : (
                                                    <>
                                                        <Lock size={16} />
                                                        Make Private
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Pending Members Section */}
                                    {(factions.find(f => f.id === myFactionId)?.pendingMembers || []).length > 0 ? (
                                        <div className="hq-pending-section">
                                            <h3 className="hq-sub-title">Intelligence Report: Pending Assets</h3>
                                            <div className="hq-pending-list">
                                                {(factions.find(f => f.id === myFactionId)?.pendingMembers || []).map(req => (
                                                    <div key={req.id} className="hq-pending-row">
                                                        <div className="hq-req-info">
                                                            <div className="hq-req-avatar">{req.username?.charAt(0).toUpperCase()}</div>
                                                            <div className="hq-req-meta">
                                                                <span className="hq-req-name">{req.username}</span>
                                                                <span className="hq-req-xp">{req.xp} Rep XP</span>
                                                            </div>
                                                        </div>
                                                        <div className="hq-req-actions">
                                                            <button className="approve-btn" onClick={() => approveMember(req.id)}>Accept Asset</button>
                                                            <button className="decline-btn" onClick={() => declineMember(req.id)}>Deny Entry</button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="hq-empty-intel">
                                            <Shield size={48} className="empty-intel-icon" />
                                            <h3>No Active Threats or Requests</h3>
                                            <p>Your syndicate borders are secure. No pending recruitment requests at this time.</p>
                                        </div>
                                    )}

                                    {/* Danger Zone */}
                                    <div className="hq-danger-zone">
                                        <h3 className="hq-sub-title danger-title">Danger Zone</h3>
                                        <div className="danger-card">
                                            <div className="danger-info">
                                                <Trash2 size={20} color="var(--primary)" />
                                                <div>
                                                    <h4>Disband Syndicate</h4>
                                                    <p>Permanently delete this faction. All members will be removed and progress lost.</p>
                                                </div>
                                            </div>
                                            <button className="danger-action-btn" onClick={disbandFaction}>
                                                Disband
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </section>
            )}

            <section className="factions-grid-section">
                <main className="factions-container">
                    <div className="section-header-row">
                        <div className="section-title-group">
                            <div className="mini-black-dash"></div>
                            <h2>Browse Syndicate Guilds</h2>
                            <p>{searchTerm ? `Showing results for "${searchTerm}"` : "The Ledger of Established Engineering Syndicates"}</p>
                        </div>
                        <div className="section-controls">
                            <div className="search-box-wrapper">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by name or emblem..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="faction-search-input"
                                />
                            </div>
                        </div>
                    </div>

                    {loading ? (
                        <div className="factions-loading">
                            <div className="factions-loading-ring"></div>
                            <p>Loading syndicate data...</p>
                        </div>
                    ) : factions.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                        <motion.div className="factions-empty" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="empty-emblem">{searchTerm ? '🔍' : '⚔️'}</div>
                            <h3>{searchTerm ? 'No matches found' : 'No active syndicates found in the global registry'}</h3>
                        </motion.div>
                    ) : (
                        <div className="factions-table-wrapper">
                            <table className="factions-syndicate-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Syndicate Guild</th>
                                        <th>Total XP</th>
                                        <th>Level</th>
                                        <th>Grandmaster</th>
                                        <th>Members</th>
                                        <th>Syndicate Type</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {factions
                                        .filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                        .map((faction, idx) => {
                                            const isMine = myFactionId === faction.id;
                                            const isMember = faction.members?.some(m => m.username === user?.username);
                                            const canJoin = user && !isMember && !myFactionId;
                                            const totalFactionXP = 0; // Reset for upcoming Guild Wars
                                            let factionLevel = 1;
                                            if (totalFactionXP >= 8000) factionLevel = 5;
                                            else if (totalFactionXP >= 5500) factionLevel = 4;
                                            else if (totalFactionXP >= 3000) factionLevel = 3;
                                            else if (totalFactionXP >= 1000) factionLevel = 2;
                                            else factionLevel = 1;

                                            return (
                                                <motion.tr
                                                    key={faction.id}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.05 }}
                                                    className={isMine ? 'my-faction-row' : ''}
                                                >
                                                    <td className="col-rank">{idx + 1}</td>
                                                    <td className="col-guild">
                                                        <div className="guild-identity">
                                                            <span className="guild-emblem-mini">{faction.emblem || '⚔️'}</span>
                                                            <div className="guild-name-group">
                                                                <span className="guild-name-text">{faction.name}</span>
                                                                {isMine && <span className="your-guild-tag">Your Guild</span>}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="col-xp">
                                                        <div className="xp-chip">
                                                            <Zap size={12} fill="#d4a847" color="#d4a847" />
                                                            {totalFactionXP.toLocaleString()}
                                                        </div>
                                                    </td>
                                                    <td className="col-level">
                                                        <span className="level-badge">LVL {factionLevel}</span>
                                                    </td>
                                                    <td className="col-creator">
                                                        <div className="creator-info">
                                                            <Crown size={12} color="#fbbf24" />
                                                            <span>{faction.ownerName}</span>
                                                        </div>
                                                    </td>
                                                    <td className="col-members">
                                                        <div className="member-count-pill">
                                                            <Users size={12} />
                                                            {faction.members?.length || 0} / {
                                                                (faction.totalXp || 0) >= 8000 ? 50 :
                                                                    (faction.totalXp || 0) >= 5500 ? 40 :
                                                                        (faction.totalXp || 0) >= 3000 ? 30 :
                                                                            (faction.totalXp || 0) >= 1000 ? 22 : 15
                                                            }
                                                        </div>
                                                    </td>
                                                    <td className="col-action">
                                                        <div className="type-action-group">
                                                            <div className={`type-badge ${faction.isPublic === false ? 'private' : 'public'}`}>
                                                                {faction.isPublic === false ? <Lock size={10} /> : <Globe size={10} />}
                                                                {faction.isPublic === false ? 'PRIVATE' : 'PUBLIC'}
                                                            </div>

                                                            {isMine || isMember ? (
                                                                <span className="member-status-label active">ACTIVE</span>
                                                            ) : (faction.members?.length || 0) >= ((faction.totalXp || 0) >= 8000 ? 50 : (faction.totalXp || 0) >= 5500 ? 40 : (faction.totalXp || 0) >= 3000 ? 30 : (faction.totalXp || 0) >= 1000 ? 22 : 15) ? (
                                                                <span className="status-locked full">FULL</span>
                                                            ) : (
                                                                canJoin && (
                                                                    <button className="table-join-btn" onClick={() => joinFaction(faction.id)}>
                                                                        {faction.isPublic === false ? 'Request' : 'Join'}
                                                                    </button>
                                                                )
                                                            )}
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </main>
            </section>

            {/* Kick Member Confirmation Modal */}
            <AnimatePresence>
                {kickConfirmModal.show && (
                    <motion.div 
                        className="kick-modal-overlay" 
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        exit={{ opacity: 0 }}
                        onClick={() => setKickConfirmModal({ show: false, member: null })}
                    >
                        <motion.div 
                            className="kick-modal-box"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="kick-modal-header">
                                <div className="kick-modal-icon">
                                    <UserMinus size={24} />
                                </div>
                                <h3>Remove Operative</h3>
                            </div>
                            
                            <div className="kick-modal-body">
                                <p>
                                    Remove <span className="kick-username">{kickConfirmModal.member?.username}</span> from the syndicate?
                                </p>
                                <div className="kick-warning">
                                    <Shield size={16} />
                                    <span>This action cannot be undone. The member will lose access to all faction resources.</span>
                                </div>
                            </div>

                            <div className="kick-modal-footer">
                                <button 
                                    className="kick-cancel-btn" 
                                    onClick={() => setKickConfirmModal({ show: false, member: null })}
                                >
                                    Cancel
                                </button>
                                <button 
                                    className="kick-confirm-btn"
                                    onClick={() => kickMember(kickConfirmModal.member?.id)}
                                >
                                    <UserMinus size={16} />
                                    Remove Member
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
            <Chatbot />
        </div>
    );
};

export default Factions;
