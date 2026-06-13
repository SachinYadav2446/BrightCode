import API_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
    Users, Zap, Plus, Crown, Shield, Swords, Trophy,
    Search, Globe, Lock, Trash2, UserMinus, TrendingUp,
    MessageSquare, ArrowRight, Activity, Code2, GitBranch,
    Flame, Gem, Skull, Rocket, Eye, Atom, Cpu, Wand2,
    Crosshair, Mountain, FlaskConical, Radio, Satellite,
    Star, BarChart2, Target, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import Chatbot from '../components/Chatbot';
import ChatPanel from '../components/ChatPanel';
import { initSocket } from '../socket';
import './Factions.css';

/* ── Emblems ── */
const EMBLEMS = [
    { id: 'swords',    icon: Swords,       color: '#ef4444' },
    { id: 'shield',    icon: Shield,       color: '#3b82f6' },
    { id: 'flame',     icon: Flame,        color: '#f97316' },
    { id: 'zap',       icon: Zap,          color: '#eab308' },
    { id: 'gem',       icon: Gem,          color: '#8b5cf6' },
    { id: 'crown',     icon: Crown,        color: '#f59e0b' },
    { id: 'rocket',    icon: Rocket,       color: '#06b6d4' },
    { id: 'skull',     icon: Skull,        color: '#94a3b8' },
    { id: 'eye',       icon: Eye,          color: '#a78bfa' },
    { id: 'atom',      icon: Atom,         color: '#22d3ee' },
    { id: 'cpu',       icon: Cpu,          color: '#34d399' },
    { id: 'wand',      icon: Wand2,        color: '#f472b6' },
    { id: 'crosshair', icon: Crosshair,    color: '#ef4444' },
    { id: 'mountain',  icon: Mountain,     color: '#94a3b8' },
    { id: 'satellite', icon: Satellite,    color: '#38bdf8' },
    { id: 'flask',     icon: FlaskConical, color: '#4ade80' },
    { id: 'radio',     icon: Radio,        color: '#fb923c' },
    { id: 'trophy',    icon: Trophy,       color: '#fbbf24' },
];

const EmblemIcon = ({ id, size = 20 }) => {
    const e = EMBLEMS.find(x => x.id === id) || EMBLEMS[0];
    const Icon = e.icon;
    return <Icon size={size} color={e.color} />;
};

/* ── Perks data ── */
const PERKS = [
    { icon: Trophy,    color: '#ef4444', title: 'Global Rankings',    desc: 'Your faction\'s combined XP earns you a slot on the global leaderboard. Every line of code counts.' },
    { icon: Swords,    color: '#8b5cf6', title: 'Guild Wars',         desc: 'Weekly faction vs faction battles. Deploy your best coders, solve challenges, claim territory.' },
    { icon: GitBranch, color: '#3b82f6', title: 'Private Workspace',  desc: 'Shared collaborative editors, private vaults, and encrypted snippet repos for your faction only.' },
    { icon: TrendingUp,color: '#22c55e', title: 'XP Multipliers',    desc: 'Group activity unlocks faction-wide XP bonuses. The more your team codes, the faster everyone levels.' },
    { icon: Code2,     color: '#f59e0b', title: 'Exclusive Challenges',desc: 'Access faction-only battle arena modes and curated problem sets unavailable to solo coders.' },
    { icon: Award,     color: '#06b6d4', title: 'Profile Badges',     desc: 'Earn unique badges, titles, and cosmetic rewards that display across your BrightCode profile.' },
];

/* ── Ticker items ── */
const TICKER = ['Global Rankings', 'Guild Wars', 'Shared XP', 'Private Vaults', 'Battle Arena', 'Collab Challenges', 'Custom Emblems', 'Profile Badges', 'Faction Chat', 'Weekly Missions'];

/* ── Animation variants ── */
const fadeUp   = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const fadeLeft = { hidden: { opacity: 0, x: -24 }, show: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } };
const stagger  = { hidden: {}, show: { transition: { staggerChildren: 0.07 } } };

/* ════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════ */
const Factions = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [factions, setFactions]               = useState([]);
    const [loading, setLoading]                 = useState(true);
    const [myFactionId, setMyFactionId]         = useState(null);
    const [myFactionName, setMyFactionName]     = useState(null);
    const [myFactionEmblem, setMyFactionEmblem] = useState(null);
    const [searchTerm, setSearchTerm]           = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newFaction, setNewFaction]           = useState({ name: '', description: '', emblem: 'swords', isPublic: true });
    const [isSubmitting, setIsSubmitting]       = useState(false);
    const [showHQ, setShowHQ]                   = useState(false);
    const [hqTab, setHqTab]                     = useState('roster');
    const [socket, setSocket]                   = useState(null);
    const [chatMessages, setChatMessages]       = useState([]);
    const [kickModal, setKickModal]             = useState({ show: false, member: null });
    const [pendingRequests, setPendingRequests] = useState(new Set());

    useEffect(() => {
        let s = null;
        if (myFactionId && !socket) {
            s = initSocket(); setSocket(s);
            const rid = `faction_${myFactionId}`;
            s.on('connect', () => s.emit('join-chat-room', { roomId: rid }));
            s.on('chat-history', ({ messages }) => setChatMessages(messages));
            s.on('new-chat-message', msg => setChatMessages(p => [...p, msg]));
            if (s.connected) s.emit('join-chat-room', { roomId: rid });
        }
        return () => { if (s) { s.off('connect'); s.off('chat-history'); s.off('new-chat-message'); s.disconnect(); setSocket(null); setChatMessages([]); } };
    }, [myFactionId]);

    useEffect(() => { fetchFactions(); }, []);

    const fetchFactions = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/factions`, { timeout: 6000 });
            const list = res.data || [];
            setFactions(list);
            if (user) {
                const mine = list.find(f => f.members?.some(m => m.username === user.username));
                setMyFactionId(mine?.id || null); setMyFactionName(mine?.name || null); setMyFactionEmblem(mine?.emblem || null);
            }
        } catch { } finally { setLoading(false); }
    };

    const createFaction = async () => {
        if (!newFaction.name.trim() || !user) return;
        setIsSubmitting(true);
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/factions/create`, newFaction, { headers: { Authorization: `Bearer ${token}` } });
            setShowCreateModal(false);
            setNewFaction({ name: '', description: '', emblem: 'swords', isPublic: true });
            fetchFactions();
            toast.success('Faction established.');
        } catch (err) {
            toast.error(err?.response?.data?.error || 'Failed to create faction.', { duration: 5000 });
        } finally { setIsSubmitting(false); }
    };

    const joinFaction = async (id) => {
        if (!user) { navigate('/auth'); return; }
        if (myFactionId) return;
        setPendingRequests(p => new Set([...p, id]));
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/factions/join/${id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.data.pending) setMyFactionId(id);
            fetchFactions();
        } catch { setPendingRequests(p => { const s = new Set(p); s.delete(id); return s; }); }
    };

    const leaveFaction   = async () => { try { const t = localStorage.getItem('token'); await axios.post(`${API_URL}/factions/leave/${myFactionId}`, {}, { headers: { Authorization: `Bearer ${t}` } }); setMyFactionId(null); fetchFactions(); } catch { } };
    const approveMember  = async (uid) => { try { const t = localStorage.getItem('token'); await axios.post(`${API_URL}/factions/${myFactionId}/approve`, { userId: uid }, { headers: { Authorization: `Bearer ${t}` } }); fetchFactions(); } catch { } };
    const declineMember  = async (uid) => { try { const t = localStorage.getItem('token'); await axios.post(`${API_URL}/factions/${myFactionId}/decline`, { userId: uid }, { headers: { Authorization: `Bearer ${t}` } }); fetchFactions(); } catch { } };
    const kickMember     = async (uid) => { try { const t = localStorage.getItem('token'); await axios.post(`${API_URL}/factions/${myFactionId}/kick`, { userId: uid }, { headers: { Authorization: `Bearer ${t}` } }); setKickModal({ show: false, member: null }); fetchFactions(); } catch { } };
    const togglePrivacy  = async () => { try { const t = localStorage.getItem('token'); await axios.post(`${API_URL}/factions/${myFactionId}/toggle-privacy`, {}, { headers: { Authorization: `Bearer ${t}` } }); fetchFactions(); } catch { } };
    const disbandFaction = async () => { if (!window.confirm('Permanently disband?')) return; try { const t = localStorage.getItem('token'); await axios.post(`${API_URL}/factions/disband/${myFactionId}`, {}, { headers: { Authorization: `Bearer ${t}` } }); setMyFactionId(null); fetchFactions(); } catch { } };

    const totalEngineers = factions.reduce((s, f) => s + (f.members?.length || 0), 0);
    const totalXP        = factions.reduce((s, f) => s + (f.totalXp || 0), 0);
    const myFaction      = factions.find(f => f.id === myFactionId);
    const myLevel        = (() => { const x = myFaction?.totalXp || 0; return x >= 8000 ? 5 : x >= 5500 ? 4 : x >= 3000 ? 3 : x >= 1000 ? 2 : 1; })();
    const myEmb          = EMBLEMS.find(e => e.id === myFactionEmblem) || EMBLEMS[0];
    const filtered       = factions.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="fp">
            <div className="fp-bg" aria-hidden />

            {/* ══ CREATE MODAL ══ */}
            <AnimatePresence>
                {showCreateModal && (
                    <motion.div className="fp-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={e => { if (e.target === e.currentTarget) setShowCreateModal(false); }}>
                        <motion.div className="fp-modal"
                            initial={{ opacity: 0, y: 28, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 28, scale: 0.97 }}
                            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}>
                            <div className="fp-modal-head">
                                <h3>Create Faction</h3>
                                <button className="fp-icon-btn" onClick={() => setShowCreateModal(false)}><Plus size={16} style={{ transform: 'rotate(45deg)' }} /></button>
                            </div>
                            <div className="fp-modal-body">
                                <label className="fp-label">Emblem</label>
                                <div className="fp-emblem-grid">
                                    {EMBLEMS.map(e => {
                                        const Icon = e.icon; const sel = newFaction.emblem === e.id;
                                        return (
                                            <button key={e.id} className={`fp-emblem-btn ${sel ? 'sel' : ''}`}
                                                style={sel ? { borderColor: e.color + '70', background: e.color + '14' } : {}}
                                                onClick={() => setNewFaction(p => ({ ...p, emblem: e.id }))} title={e.id}>
                                                <Icon size={18} color={sel ? e.color : 'rgba(255,255,255,0.38)'} />
                                            </button>
                                        );
                                    })}
                                </div>
                                <label className="fp-label">Name <span className="fp-req">*</span></label>
                                <input className="fp-input" type="text" placeholder="e.g. Neon Vanguard"
                                    value={newFaction.name} onChange={e => setNewFaction(p => ({ ...p, name: e.target.value }))} maxLength={32} autoFocus />
                                <label className="fp-label">Manifesto <span className="fp-opt">(optional)</span></label>
                                <textarea className="fp-textarea" placeholder="What does your faction stand for?"
                                    value={newFaction.description} onChange={e => setNewFaction(p => ({ ...p, description: e.target.value }))} maxLength={120} rows={2} />
                                <label className="fp-label">Visibility</label>
                                <div className="fp-toggle-row">
                                    {[{ v: true, icon: <Globe size={13} />, l: 'Public' }, { v: false, icon: <Lock size={13} />, l: 'Private' }].map(o => (
                                        <button key={String(o.v)} type="button" className={`fp-toggle-btn ${newFaction.isPublic === o.v ? 'active' : ''}`}
                                            onClick={() => setNewFaction(p => ({ ...p, isPublic: o.v }))}>
                                            {o.icon} {o.l}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="fp-modal-foot">
                                <button className="fp-btn-ghost" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button className="fp-btn-primary" onClick={createFaction} disabled={isSubmitting || !newFaction.name.trim()}>
                                    {isSubmitting ? 'Creating…' : 'Create Faction'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══ KICK MODAL ══ */}
            <AnimatePresence>
                {kickModal.show && (
                    <motion.div className="fp-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={() => setKickModal({ show: false, member: null })}>
                        <motion.div className="fp-modal fp-modal--sm" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                            transition={{ duration: 0.22 }} onClick={e => e.stopPropagation()}>
                            <div className="fp-modal-head">
                                <h3>Remove Member</h3>
                                <button className="fp-icon-btn" onClick={() => setKickModal({ show: false, member: null })}><Plus size={16} style={{ transform: 'rotate(45deg)' }} /></button>
                            </div>
                            <div className="fp-modal-body">
                                <p className="fp-modal-desc">Remove <strong>{kickModal.member?.username}</strong> from the faction? They will lose access to all faction resources. This cannot be undone.</p>
                            </div>
                            <div className="fp-modal-foot">
                                <button className="fp-btn-ghost" onClick={() => setKickModal({ show: false, member: null })}>Cancel</button>
                                <button className="fp-btn-danger" onClick={() => kickMember(kickModal.member?.id)}>Remove</button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════
                HERO — split layout
            ══════════════════════════════════════════ */}
            <section className="fp-hero">
                {/* Left copy */}
                <motion.div className="fp-hero-left" variants={stagger} initial="hidden" animate="show">
                    <motion.div variants={fadeLeft} className="fp-hero-eyebrow">
                        <span className="fp-eyebrow-dot" />
                        Developer Guilds
                    </motion.div>

                    <motion.h1 variants={fadeLeft} className="fp-hero-h1">
                        Find your<br />
                        <span className="fp-h1-accent">faction.</span>
                    </motion.h1>

                    <motion.p variants={fadeLeft} className="fp-hero-desc">
                        Engineering is a team sport. Join a faction, climb the global leaderboard,
                        compete in guild wars, and ship code alongside developers who match your ambition.
                    </motion.p>

                    <motion.div variants={fadeLeft} className="fp-hero-ctas">
                        {user && !myFactionId ? (
                            <>
                                <button className="fp-btn-primary fp-btn-lg" onClick={() => setShowCreateModal(true)}>
                                    <Plus size={16} /> Create Faction
                                </button>
                                <button className="fp-btn-ghost fp-btn-lg"
                                    onClick={() => document.querySelector('.fp-directory')?.scrollIntoView({ behavior: 'smooth' })}>
                                    Browse Factions <ArrowRight size={15} />
                                </button>
                            </>
                        ) : myFactionId ? (
                            <div className="fp-my-faction-card">
                                <div className="fp-mfc-left">
                                    <div className="fp-mfc-emblem" style={{ background: myEmb.color + '16', border: `1px solid ${myEmb.color}35` }}>
                                        <EmblemIcon id={myFactionEmblem} size={22} />
                                    </div>
                                    <div>
                                        <p className="fp-mfc-sub">Your active faction</p>
                                        <p className="fp-mfc-name">{myFactionName}</p>
                                    </div>
                                </div>
                                <div className="fp-mfc-right">
                                    <button className="fp-btn-ghost fp-btn-sm"
                                        onClick={() => { setShowHQ(v => !v); setTimeout(() => document.querySelector('.fp-hq')?.scrollIntoView({ behavior: 'smooth' }), 80); }}>
                                        <Shield size={13} /> {showHQ ? 'Close HQ' : 'Open HQ'}
                                    </button>
                                    <button className="fp-btn-ghost fp-btn-sm fp-btn-leave" onClick={leaveFaction}>Leave</button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button className="fp-btn-primary fp-btn-lg" onClick={() => navigate('/auth')}>Sign in to join</button>
                                <button className="fp-btn-ghost fp-btn-lg"
                                    onClick={() => document.querySelector('.fp-directory')?.scrollIntoView({ behavior: 'smooth' })}>
                                    Browse Factions <ArrowRight size={15} />
                                </button>
                            </>
                        )}
                    </motion.div>

                    <motion.div variants={fadeLeft} className="fp-hero-stats">
                        {[
                            { val: factions.length,            label: 'Factions' },
                            { val: totalEngineers,             label: 'Engineers' },
                            { val: totalXP.toLocaleString(),   label: 'Combined XP', raw: true },
                        ].map((s, i) => (
                            <React.Fragment key={i}>
                                {i > 0 && <div className="fp-stat-div" />}
                                <div className="fp-stat">
                                    <strong>{s.raw ? s.val : s.val.toLocaleString()}</strong>
                                    <span>{s.label}</span>
                                </div>
                            </React.Fragment>
                        ))}
                    </motion.div>
                </motion.div>

                {/* Right — live faction preview card stack */}
                <motion.div className="fp-hero-right"
                    initial={{ opacity: 0, x: 32 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}>

                    <div className="fp-preview-stack">
                        {/* Decorative behind-cards */}
                        <div className="fp-preview-card fp-preview-card--bg3" />
                        <div className="fp-preview-card fp-preview-card--bg2" />

                        {/* Main preview card */}
                        <div className="fp-preview-card fp-preview-card--main">
                            <div className="fp-pcard-head">
                                <div className="fp-pcard-emblem" style={{ background: '#ef444416', border: '1px solid #ef444430' }}>
                                    <Swords size={18} color="#ef4444" />
                                </div>
                                <div>
                                    <div className="fp-pcard-name">Crimson Protocol</div>
                                    <div className="fp-pcard-rank">#1 Global</div>
                                </div>
                                <div className="fp-pcard-lvl">Lv 5</div>
                            </div>

                            <div className="fp-pcard-members">
                                {['A','K','S','M','J'].map((l, i) => (
                                    <div key={i} className="fp-pcard-av" style={{ background: ['#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6'][i] + '22', border: `1px solid ${['#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6'][i]}35`, color: ['#ef4444','#3b82f6','#22c55e','#f59e0b','#8b5cf6'][i] }}>{l}</div>
                                ))}
                                <div className="fp-pcard-av fp-pcard-av--more">+12</div>
                            </div>

                            <div className="fp-pcard-stats">
                                <div className="fp-pcard-stat">
                                    <Zap size={12} color="#eab308" />
                                    <span>48,200 XP</span>
                                </div>
                                <div className="fp-pcard-stat">
                                    <Trophy size={12} color="#f59e0b" />
                                    <span>12 Wins</span>
                                </div>
                            </div>

                            <div className="fp-pcard-bar-wrap">
                                <div className="fp-pcard-bar-label">
                                    <span>Season progress</span><span>82%</span>
                                </div>
                                <div className="fp-pcard-bar">
                                    <motion.div className="fp-pcard-bar-fill"
                                        initial={{ width: 0 }} animate={{ width: '82%' }}
                                        transition={{ duration: 1.2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }} />
                                </div>
                            </div>

                            <div className="fp-pcard-activity">
                                <div className="fp-pcard-activity-label">
                                    <Activity size={11} color="#22c55e" />
                                    <span>Live</span>
                                    <span className="fp-pcard-dot" />
                                    <span>3 members coding now</span>
                                </div>
                            </div>
                        </div>

                        {/* Floating badge */}
                        <motion.div className="fp-preview-badge"
                            animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
                            <Crown size={14} color="#f59e0b" />
                            <span>Season 1 Leader</span>
                        </motion.div>
                    </div>
                </motion.div>
            </section>

            {/* ══ TICKER ══ */}
            <div className="fp-ticker">
                <div className="fp-ticker-track">
                    {[...TICKER, ...TICKER].map((item, i) => (
                        <span key={i} className="fp-ticker-item">
                            <span className="fp-ticker-dot" />
                            {item}
                        </span>
                    ))}
                </div>
            </div>

            {/* ══ PERKS SECTION — asymmetric ══ */}
            <section className="fp-perks">
                <div className="fp-perks-inner">
                    <div className="fp-perks-header">
                        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <p className="fp-section-eyebrow">Why Join a Faction</p>
                            <h2 className="fp-section-h2">Everything your team needs<br />to compete at the top.</h2>
                        </motion.div>
                    </div>

                    <div className="fp-perks-grid">
                        {PERKS.slice(0, 3).map((p, i) => {
                            const Icon = p.icon;
                            return (
                                <motion.div key={i} className="fp-perk-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ duration: 0.45, delay: i * 0.07 }}>
                                    <div className="fp-perk-icon" style={{ background: p.color + '16', border: `1px solid ${p.color}28` }}>
                                        <Icon size={20} color={p.color} />
                                    </div>
                                    <h3 className="fp-perk-title">{p.title}</h3>
                                    <p className="fp-perk-desc">{p.desc}</p>
                                    <div className="fp-perk-accent" style={{ background: `linear-gradient(90deg, ${p.color}30, transparent)` }} />
                                </motion.div>
                            );
                        })}
                    </div>
                    <div className="fp-perks-row2">
                        {PERKS.slice(3).map((p, i) => {
                            const Icon = p.icon;
                            return (
                                <motion.div key={i} className="fp-perk-card"
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, margin: '-40px' }}
                                    transition={{ duration: 0.45, delay: i * 0.07 }}>
                                    <div className="fp-perk-icon" style={{ background: p.color + '16', border: `1px solid ${p.color}28` }}>
                                        <Icon size={20} color={p.color} />
                                    </div>
                                    <h3 className="fp-perk-title">{p.title}</h3>
                                    <p className="fp-perk-desc">{p.desc}</p>
                                    <div className="fp-perk-accent" style={{ background: `linear-gradient(90deg, ${p.color}30, transparent)` }} />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══ HQ SECTION ══ */}
            <AnimatePresence>
                {myFactionId && showHQ && (
                    <motion.section className="fp-hq"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}>
                        <div className="fp-hq-inner">
                            <div className="fp-hq-head">
                                <div className="fp-hq-title-group">
                                    <div className="fp-hq-emblem" style={{ background: myEmb.color + '14', border: `1px solid ${myEmb.color}28` }}>
                                        <EmblemIcon id={myFactionEmblem} size={22} />
                                    </div>
                                    <div>
                                        <p className="fp-hq-supra">Command Center</p>
                                        <h2 className="fp-hq-name">{myFactionName}</h2>
                                    </div>
                                </div>
                                <div className="fp-hq-meta">
                                    {[
                                        { val: myFaction?.members?.length || 0, label: 'Members' },
                                        { val: `#${factions.findIndex(f => f.id === myFactionId) + 1}`, label: 'Rank' },
                                        { val: `Lv ${myLevel}`, label: 'Level' },
                                        { val: (myFaction?.totalXp || 0).toLocaleString(), label: 'Total XP' },
                                    ].map((m, i) => (
                                        <div className="fp-hq-meta-item" key={i}>
                                            <strong>{m.val}</strong><span>{m.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="fp-hq-tabs-bar">
                                <div className="fp-hq-tabs">
                                    {[
                                        { id: 'roster', icon: <Users size={14} />, label: 'Roster' },
                                        { id: 'chat',   icon: <MessageSquare size={14} />, label: 'Chat' },
                                        ...(user?.username === myFaction?.ownerName
                                            ? [{ id: 'settings', icon: <Shield size={14} />, label: 'Settings', badge: (myFaction?.pendingMembers || []).length }]
                                            : [])
                                    ].map(t => (
                                        <button key={t.id} className={`fp-tab ${hqTab === t.id ? 'active' : ''}`} onClick={() => setHqTab(t.id)}>
                                            {t.icon} {t.label}
                                            {t.badge > 0 && <span className="fp-tab-badge">{t.badge}</span>}
                                        </button>
                                    ))}
                                </div>
                                <button className="fp-btn-ghost fp-btn-sm" onClick={() => navigate('/battle-arena')}>
                                    <Swords size={13} /> Battle Arena
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {hqTab === 'roster' && (
                                    <motion.div key="roster" className="fp-tab-body" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                        <div className="fp-roster">
                                            <div className="fp-roster-head"><span>Member</span><span>Role</span><span>XP</span><span>Status</span><span /></div>
                                            {(myFaction?.members || []).map((m, i) => (
                                                <motion.div key={m.id || m.username} className="fp-roster-row"
                                                    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                                                    <div className="fp-member-cell">
                                                        <div className="fp-av">{m.username?.charAt(0).toUpperCase()}
                                                            {m.username === user?.username && <div className="fp-you">YOU</div>}
                                                        </div>
                                                        <span className="fp-member-name">{m.username}</span>
                                                    </div>
                                                    <span className="fp-role-cell">
                                                        {m.username === myFaction?.ownerName ? <><Crown size={11} color="#f59e0b" /> Lead</> : 'Member'}
                                                    </span>
                                                    <span className="fp-cell-dim">{(m.xp || 0).toLocaleString()}</span>
                                                    <span className="fp-cell-active"><Activity size={10} /> Active</span>
                                                    <div>{user?.username === myFaction?.ownerName && m.username !== user?.username && (
                                                        <button className="fp-remove-btn" onClick={() => setKickModal({ show: true, member: m })}><UserMinus size={13} /></button>
                                                    )}</div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                                {hqTab === 'chat' && (
                                    <motion.div key="chat" className="fp-tab-body fp-chat-body" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                        <ChatPanel socket={socket} roomId={`faction_${myFactionId}`} user={user} title={myFactionName} messages={chatMessages} />
                                    </motion.div>
                                )}
                                {hqTab === 'settings' && (
                                    <motion.div key="settings" className="fp-tab-body" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                                        <div className="fp-settings-row">
                                            <div className="fp-settings-card">
                                                <div className="fp-settings-info">
                                                    {myFaction?.isPublic === false ? <Lock size={15} /> : <Globe size={15} />}
                                                    <div>
                                                        <strong>{myFaction?.isPublic === false ? 'Private' : 'Public'}</strong>
                                                        <p>{myFaction?.isPublic === false ? 'Requires approval to join.' : 'Open to all engineers.'}</p>
                                                    </div>
                                                </div>
                                                <button className="fp-btn-ghost fp-btn-sm" onClick={togglePrivacy}>
                                                    {myFaction?.isPublic === false ? 'Make Public' : 'Make Private'}
                                                </button>
                                            </div>
                                            <div className="fp-settings-card fp-settings-card--danger">
                                                <div className="fp-settings-info fp-settings-info--danger">
                                                    <Trash2 size={15} />
                                                    <div><strong>Disband Faction</strong><p>Permanently remove all members and data.</p></div>
                                                </div>
                                                <button className="fp-btn-danger" onClick={disbandFaction}>Disband</button>
                                            </div>
                                        </div>
                                        {(myFaction?.pendingMembers || []).length > 0 && (
                                            <div className="fp-pending-section">
                                                <p className="fp-section-label">Pending Requests — {myFaction.pendingMembers.length}</p>
                                                {myFaction.pendingMembers.map(req => (
                                                    <div key={req.id} className="fp-pending-row">
                                                        <div className="fp-av">{req.username?.charAt(0).toUpperCase()}</div>
                                                        <div className="fp-pending-info">
                                                            <strong>{req.username}</strong><span>{req.xp} XP</span>
                                                        </div>
                                                        <button className="fp-approve-btn" onClick={() => approveMember(req.id)}>Accept</button>
                                                        <button className="fp-btn-ghost fp-btn-sm" onClick={() => declineMember(req.id)}>Decline</button>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.section>
                )}
            </AnimatePresence>

            {/* ══════════════════════════════════════════
                FACTION DIRECTORY
            ══════════════════════════════════════════ */}
            <section className="fp-directory">
                <div className="fp-directory-inner">
                    <div className="fp-dir-topbar">
                        <motion.div initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <h2 className="fp-dir-h2">Faction Directory</h2>
                            <p className="fp-dir-sub">{filtered.length} faction{filtered.length !== 1 ? 's' : ''} registered this season</p>
                        </motion.div>
                        <motion.div className="fp-dir-controls" initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
                            <div className="fp-search-wrap">
                                <Search size={14} className="fp-search-icon" />
                                <input className="fp-search" type="text" placeholder="Search factions…"
                                    value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                            </div>
                            {user && !myFactionId && (
                                <button className="fp-btn-primary" onClick={() => setShowCreateModal(true)}>
                                    <Plus size={14} /> New Faction
                                </button>
                            )}
                        </motion.div>
                    </div>

                    {loading ? (
                        <div className="fp-loading"><div className="fp-spinner" /><span>Loading…</span></div>
                    ) : filtered.length === 0 ? (
                        <div className="fp-empty">
                            <p>{searchTerm ? 'No factions match your search.' : 'No factions exist yet. Be the first.'}</p>
                            {!searchTerm && user && !myFactionId && <button className="fp-btn-primary" onClick={() => setShowCreateModal(true)}><Plus size={14} /> Create First Faction</button>}
                        </div>
                    ) : (
                        <>
                            <div className="fp-table-head">
                                <span>#</span><span>Faction</span><span>XP</span><span>Level</span>
                                <span>Grandmaster</span><span>Members</span><span>Type</span><span />
                            </div>
                            <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}>
                                {filtered.map((faction, idx) => {
                                    const isMine   = myFactionId === faction.id;
                                    const isMember = faction.members?.some(m => m.username === user?.username);
                                    const canJoin  = user && !isMember && !myFactionId;
                                    const cap      = faction.totalXp >= 8000 ? 50 : faction.totalXp >= 5500 ? 40 : faction.totalXp >= 3000 ? 30 : faction.totalXp >= 1000 ? 22 : 15;
                                    const full     = (faction.members?.length || 0) >= cap;
                                    const isPend   = pendingRequests.has(faction.id);
                                    const lvl      = (() => { const x = faction.totalXp || 0; return x >= 8000 ? 5 : x >= 5500 ? 4 : x >= 3000 ? 3 : x >= 1000 ? 2 : 1; })();
                                    const emb      = EMBLEMS.find(e => e.id === faction.emblem) || EMBLEMS[0];

                                    return (
                                        <motion.div key={faction.id} className={`fp-row ${isMine ? 'fp-row--mine' : ''}`} variants={fadeUp}>
                                            <span className="fp-col-num">
                                                {idx === 0 ? <Crown size={15} color="#f59e0b" /> : <span className="fp-num">{idx + 1}</span>}
                                            </span>
                                            <div className="fp-col-faction">
                                                <div className="fp-row-emblem" style={{ background: emb.color + '12', border: `1px solid ${emb.color}28` }}>
                                                    <EmblemIcon id={faction.emblem} size={17} />
                                                </div>
                                                <div>
                                                    <div className="fp-row-name">
                                                        {faction.name}
                                                        {isMine && <span className="fp-mine-tag">Yours</span>}
                                                    </div>
                                                    {faction.description && <div className="fp-row-desc">{faction.description}</div>}
                                                </div>
                                            </div>
                                            <span className="fp-col-xp">{(faction.totalXp || 0).toLocaleString()}</span>
                                            <span className="fp-col-lvl"><span className="fp-lvl">Lv {lvl}</span></span>
                                            <div className="fp-col-creator"><Crown size={11} color="#f59e0b" /><span>{faction.ownerName}</span></div>
                                            <div className="fp-col-members">
                                                <span>{faction.members?.length || 0}<span className="fp-cap">/{cap}</span></span>
                                                <div className="fp-bar">
                                                    <motion.div className="fp-bar-fill"
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${Math.min(100, ((faction.members?.length || 0) / cap) * 100)}%` }}
                                                        viewport={{ once: true }}
                                                        transition={{ duration: 0.9, delay: idx * 0.04 }} />
                                                </div>
                                            </div>
                                            <span className="fp-col-type">
                                                <span className={`fp-type ${faction.isPublic === false ? 'private' : 'public'}`}>
                                                    {faction.isPublic === false ? <Lock size={9} /> : <Globe size={9} />}
                                                    {faction.isPublic === false ? 'Private' : 'Public'}
                                                </span>
                                            </span>
                                            <div className="fp-col-action">
                                                {(isMine || isMember) ? <span className="fp-active-tag"><Activity size={10} /> Active</span>
                                                    : full ? <span className="fp-full-tag">Full</span>
                                                    : canJoin ? (
                                                        <button className="fp-join-btn" onClick={() => joinFaction(faction.id)} disabled={isPend}>
                                                            {isPend ? 'Pending' : faction.isPublic === false ? 'Request' : 'Join'}
                                                            {!isPend && <ArrowRight size={12} />}
                                                        </button>
                                                    ) : null}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </motion.div>
                        </>
                    )}

                    {/* Bottom CTA when user has no faction */}
                    {!myFactionId && user && !loading && factions.length > 0 && (
                        <motion.div className="fp-dir-cta"
                            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
                            <div className="fp-dir-cta-text">
                                <h3>None of these feel right?</h3>
                                <p>Found your own faction and set the rules.</p>
                            </div>
                            <button className="fp-btn-primary" onClick={() => setShowCreateModal(true)}>
                                <Plus size={14} /> Create a Faction
                            </button>
                        </motion.div>
                    )}
                </div>
            </section>

            <Chatbot />
        </div>
    );
};

export default Factions;
