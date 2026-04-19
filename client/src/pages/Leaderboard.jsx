import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, ArrowLeft, Zap, Search, Shield, Filter, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import './Leaderboard.css';

// ── XP-based level computation (client-side, always correct) ──────────────
const getLevelInfo = (xp) => {
    if (xp >= 10000) return { label: 'Grandmaster', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.35)' };
    if (xp >= 5000)  return { label: 'Expert',      color: '#818cf8', bg: 'rgba(99,102,241,0.15)', border: 'rgba(99,102,241,0.35)' };
    if (xp >= 2000)  return { label: 'Advanced',    color: '#34d399', bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.35)' };
    if (xp >= 500)   return { label: 'Apprentice',  color: '#60a5fa', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.35)' };
    return             { label: 'Initiate',   color: '#9ca3af', bg: 'rgba(156,163,175,0.1)', border: 'rgba(156,163,175,0.2)' };
};

// Podium visual config: [Silver(2), Gold(1), Bronze(3)]
const PODIUM_CONFIG = [
    { rank: 2, className: 'silver', barClass: 'silver-bar', avatarClass: 'avatar-large', delay: 0.2 },
    { rank: 1, className: 'gold',   barClass: 'gold-bar',   avatarClass: 'avatar-xl',    delay: 0.1, isFirst: true },
    { rank: 3, className: 'bronze', barClass: 'bronze-bar', avatarClass: 'avatar-large', delay: 0.3 },
];

const Leaderboard = () => {
    const navigate = useNavigate();
    const { user, updateXP } = useAuth();
    const [rankers, setRankers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dbError, setDbError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);
    const socketRef = useRef(null);

    const fetchRankings = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            const response = await axios.get('http://localhost:5000/leaderboard', { timeout: 8000 });
            setRankers(response.data || []);
            setDbError(null);
            setLastUpdated(new Date());
        } catch (err) {
            console.error('Leaderboard Fetch Error:', err);
            setDbError('Server unreachable. Showing last cached state.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    // ── Sync current user's fresh XP from server on mount ────────
    const syncMyXP = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get('http://localhost:5000/me', {
                headers: { Authorization: `Bearer ${token}` },
                timeout: 4000
            });
            if (res.data?.xp !== undefined) {
                updateXP(res.data.xp, {
                    css_level: res.data.css_level,
                    logic_level: res.data.logic_level,
                    react_level: res.data.react_level
                });
            }
        } catch { /* silent — non-critical */ }
    };

    useEffect(() => {
        fetchRankings();
        syncMyXP();

        // ── Live socket subscription for instant leaderboard updates ──
        const socket = io('http://localhost:5000', { transports: ['websocket'] });
        socketRef.current = socket;

        socket.on('leaderboard-update', (freshData) => {
            setRankers(freshData || []);
            setLastUpdated(new Date());
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, []);

    // Filter by search
    const filteredRankers = rankers.filter(r =>
        r?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Podium: top 3 of filtered list
    const podiumUsers = filteredRankers.slice(0, 3);
    // Display order: [rank2, rank1, rank3]
    const displayPodium = [podiumUsers[1] || null, podiumUsers[0] || null, podiumUsers[2] || null];
    const listUsers = filteredRankers.slice(3);

    return (
        <div className="leaderboard-page">
            <div className="bg-container">
                <div className="noise-texture"></div>
                <div className="grid-background"></div>
                <div className="ambient-light main-light"></div>
            </div>

            {/* Nav */}
            <nav className="leaderboard-nav">
                <button onClick={() => navigate('/')} className="back-btn">
                    <ArrowLeft size={20} /> Back to Hub
                </button>

                <div className="nav-title">
                    <Trophy size={24} color="#fbbf24" />
                    <span>Global Hall of Fame</span>
                </div>

                <div className="nav-right-section">
                    {user && (
                        <div className="your-rank-chip">
                            <div className="your-rank-avatar">{user.username?.charAt(0)?.toUpperCase()}</div>
                            <div>
                                <span className="your-rank-name">{user.username}</span>
                                <span className="your-rank-xp">
                                    <Zap size={10} fill="#fbbf24" /> {(user.xp || 0).toLocaleString()} XP
                                </span>
                            </div>
                        </div>
                    )}
                    <button className={`refresh-btn ${isRefreshing ? 'spinning' : ''}`} onClick={() => fetchRankings(true)} title="Refresh">
                        <RefreshCw size={16} />
                    </button>
                </div>
            </nav>

            {/* DB Error Banner */}
            <AnimatePresence>
                {dbError && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="db-error-banner">
                        <Shield size={14} /> {dbError}
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="leaderboard-container">
                {/* Search + Stats Bar */}
                <div className="lb-toolbar">
                    <div className="lb-search">
                        <Search size={15} color="#555" />
                        <input type="text" placeholder="Search engineers by name..."
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        {searchQuery && (
                            <button className="clear-search" onClick={() => setSearchQuery('')}>×</button>
                        )}
                    </div>
                    <div className="lb-stats">
                        <span><Filter size={13} /> {filteredRankers.length} Engineers</span>
                        <span>·</span>
                        <span><Zap size={13} color="#fbbf24" /> {filteredRankers.reduce((s, r) => s + (r?.xp || 0), 0).toLocaleString()} Total XP</span>
                    </div>
                </div>

                {/* Podium Section */}
                <section className="top-podium">
                    {loading ? (
                        <div className="podium-skeleton">
                            <div className="ske-block" style={{ height: 160 }}></div>
                            <div className="ske-block" style={{ height: 200 }}></div>
                            <div className="ske-block" style={{ height: 120 }}></div>
                        </div>
                    ) : (
                        <div className="podium-wrapper">
                            {PODIUM_CONFIG.map((cfg, idx) => {
                                const rankUser = displayPodium[idx];
                                const lvl = rankUser ? getLevelInfo(rankUser.xp || 0) : null;
                                const isCurrentUser = user && rankUser?.username === user.username;

                                return rankUser ? (
                                    <motion.div
                                        key={rankUser.username}
                                        initial={{ y: 60, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: cfg.delay, type: 'spring', stiffness: 80 }}
                                        className={`podium-item ${cfg.className}${isCurrentUser ? ' podium-me' : ''}`}
                                    >
                                        {cfg.isFirst && <Crown className="crown-icon" size={32} />}
                                        <div className={`rank-badge${cfg.isFirst ? ' gold-badge' : ''}`}>{cfg.rank}</div>
                                        <div className={cfg.avatarClass}>{rankUser.username?.charAt(0)?.toUpperCase() || '?'}</div>
                                        <h4>{rankUser.username}</h4>
                                        <span className="level-pill" style={{ background: lvl.bg, color: lvl.color, border: `1px solid ${lvl.border}` }}>
                                            {lvl.label}
                                        </span>
                                        <div className={`xp-tag${cfg.isFirst ? ' gold-xp' : ''}`}>
                                            <Zap size={13} fill={cfg.isFirst ? '#fbbf24' : 'currentColor'} /> {(rankUser.xp || 0).toLocaleString()} XP
                                        </div>
                                        <div className={`podium-bar ${cfg.barClass}`}></div>
                                    </motion.div>
                                ) : (
                                    <div key={`empty-${idx}`} className={`podium-item ${cfg.className} empty-slot`}>
                                        <div className={`rank-badge${cfg.isFirst ? ' gold-badge' : ''}`}>{cfg.rank}</div>
                                        <div className={cfg.avatarClass} style={{ opacity: 0.2 }}>?</div>
                                        <h4 style={{ color: '#444' }}>Unranked</h4>
                                        <div className="xp-tag" style={{ color: '#333' }}>—</div>
                                        <div className={`podium-bar ${cfg.barClass}`} style={{ opacity: 0.2 }}></div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* Rank List */}
                <section className="rank-list-section">
                    <div className="list-card premium-glass">
                        <div className="list-header">
                            <div className="col rank-col">RANK</div>
                            <div className="col flex-2">ENGINEER</div>
                            <div className="col">MASTERY</div>
                            <div className="col">TOTAL XP</div>
                            <div className="col progress-col">PROGRESS</div>
                        </div>
                        <div className="list-body">
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="rank-row skeleton-row">
                                        <div className="col"><div className="ske-inline" style={{ width: 30 }}></div></div>
                                        <div className="col flex-2"><div className="ske-inline" style={{ width: 120 }}></div></div>
                                        <div className="col"><div className="ske-inline" style={{ width: 80 }}></div></div>
                                        <div className="col"><div className="ske-inline" style={{ width: 60 }}></div></div>
                                        <div className="col"><div className="ske-inline" style={{ width: 100 }}></div></div>
                                    </div>
                                ))
                            ) : listUsers.length === 0 && filteredRankers.length > 3 ? null : listUsers.map((u, idx) => {
                                const lvl = getLevelInfo(u?.xp || 0);
                                const isCurrentUser = user && u?.username === user.username;
                                const xpProgress = Math.min(((u?.xp || 0) / 200) * 100, 100);

                                return (
                                    <motion.div
                                        key={u?.username || idx}
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: Math.min(idx * 0.03, 0.3) }}
                                        className={`rank-row${isCurrentUser ? ' my-rank-row' : ''}`}
                                    >
                                        <div className="col rank-col">
                                            <span className="rank-num">#{idx + 4}</span>
                                        </div>
                                        <div className="col flex-2 user-cell">
                                            <div className="mini-avatar" style={isCurrentUser ? { background: 'rgba(251,191,36,0.15)', color: '#fbbf24' } : {}}>
                                                {u?.username?.charAt(0)?.toUpperCase() || '?'}
                                            </div>
                                            <div>
                                                <span style={{ color: isCurrentUser ? '#fbbf24' : 'inherit' }}>{u?.username || 'Unknown'}</span>
                                                {isCurrentUser && <span className="you-badge">YOU</span>}
                                            </div>
                                        </div>
                                        <div className="col level-cell">
                                            <span className="level-pill" style={{ background: lvl.bg, color: lvl.color, border: `1px solid ${lvl.border}` }}>
                                                {lvl.label}
                                            </span>
                                        </div>
                                        <div className="col xp-cell">
                                            <Zap size={13} className="zap-icon" /> {(u?.xp || 0).toLocaleString()}
                                        </div>
                                        <div className="col progress-col">
                                            <div className="xp-bar-track">
                                                <div className="xp-bar-fill" style={{ width: `${xpProgress}%` }}></div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {!loading && filteredRankers.length === 0 && (
                                <div className="empty-leaderboard">
                                    <Trophy size={40} color="#2a2a2a" />
                                    <p>{searchQuery ? `No engineers matching "${searchQuery}"` : 'No engineers ranked yet. Be the first!'}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Leaderboard;
