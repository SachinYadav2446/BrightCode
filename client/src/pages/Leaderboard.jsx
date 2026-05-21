import API_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, ArrowLeft, Zap, Search, Shield, RefreshCw, X, UserPlus, Eye, Clock, Check, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import './Leaderboard.css';

const getLevelInfo = (xp) => {
    if (xp >= 10000) return { label: 'Grandmaster', color: '#fbbf24', bg: 'rgba(251,191,36,0.15)', border: 'rgba(251,191,36,0.35)', glow: 'rgba(251,191,36,0.4)' };
    if (xp >= 5000)  return { label: 'Expert',      color: '#818cf8', bg: 'rgba(99,102,241,0.15)',  border: 'rgba(99,102,241,0.35)',  glow: 'rgba(99,102,241,0.4)' };
    if (xp >= 2000)  return { label: 'Advanced',    color: '#34d399', bg: 'rgba(16,185,129,0.15)',  border: 'rgba(16,185,129,0.35)',  glow: 'rgba(16,185,129,0.4)' };
    if (xp >= 500)   return { label: 'Apprentice',  color: '#60a5fa', bg: 'rgba(59,130,246,0.15)',  border: 'rgba(59,130,246,0.35)',  glow: 'rgba(59,130,246,0.4)' };
    return             { label: 'Initiate',   color: '#9ca3af', bg: 'rgba(156,163,175,0.1)',  border: 'rgba(156,163,175,0.2)',  glow: 'rgba(156,163,175,0.2)' };
};

const PODIUM_ORDER = [
    { rank: 2, size: 'large', barH: 160, delay: 0.2, medal: '🥈' },
    { rank: 1, size: 'xl',    barH: 220, delay: 0.0, medal: '🥇', isFirst: true },
    { rank: 3, size: 'large', barH: 120, delay: 0.4, medal: '🥉' },
];

const Leaderboard = () => {
    const navigate = useNavigate();
    const { user, updateXP, setNavbarHidden } = useAuth();

    useEffect(() => {
        setNavbarHidden(true);
        return () => setNavbarHidden(false);
    }, [setNavbarHidden]);

    const [rankers, setRankers]           = useState([]);
    const [loading, setLoading]           = useState(true);
    const [minLoadingComplete, setMinLoadingComplete] = useState(false);
    const [dbError, setDbError]           = useState(null);
    const [searchQuery, setSearchQuery]   = useState('');
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated]   = useState(null);
    const [userRank, setUserRank]         = useState(null);
    const [friendStatuses, setFriendStatuses] = useState({});
    const [actionLoading, setActionLoading]   = useState({});
    const socketRef = useRef(null);

    const fetchRankings = async (silent = false) => {
        if (!silent) setLoading(true);
        else setIsRefreshing(true);
        try {
            const response = await axios.get(`${API_URL}/leaderboard`, { timeout: 8000 });
            const data = response.data || [];
            setRankers(data);
            if (user?.username) {
                const idx = data.findIndex(r => r.username === user.username);
                setUserRank(idx !== -1 ? idx + 1 : null);
            }
            setDbError(null);
            setLastUpdated(new Date());
        } catch (err) {
            setDbError('Server unreachable. Showing last cached state.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const syncMyXP = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/me`, {
                headers: { Authorization: `Bearer ${token}` }, timeout: 4000
            });
            if (res.data?.xp !== undefined) updateXP(res.data.xp, res.data);
        } catch {}
    };

    const fetchFriendStatuses = async (users) => {
        const token = localStorage.getItem('token');
        if (!token || !user) return;
        try {
            const names = users.map(u => u.username).join(',');
            const res = await axios.get(`${API_URL}/friends/search?q=`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const map = {};
            (res.data || []).forEach(u => { map[u.username] = u.friendStatus || 'none'; });
            setFriendStatuses(map);
        } catch {}
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchRankings();
        syncMyXP();
        
        // Set minimum loading duration for branding animation (2.5 seconds)
        const minLoadingTimer = setTimeout(() => {
            setMinLoadingComplete(true);
        }, 2500);
        
        const socket = io(`${API_URL}`, { transports: ['websocket'] });
        socketRef.current = socket;
        socket.on('leaderboard-update', (freshData) => {
            setRankers(freshData || []);
            if (user?.username && freshData) {
                const idx = freshData.findIndex(r => r.username === user.username);
                setUserRank(idx !== -1 ? idx + 1 : null);
            }
            setLastUpdated(new Date());
        });
        return () => { 
            clearTimeout(minLoadingTimer);
            socket.disconnect(); 
            socketRef.current = null; 
        };
    }, []);

    useEffect(() => {
        if (rankers.length > 0) fetchFriendStatuses(rankers.slice(0, 10));
    }, [rankers]);

    const sendRequest = async (targetUser) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setActionLoading(p => ({ ...p, [targetUser.username]: true }));
        try {
            await axios.post(`${API_URL}/friends/request`, { recipientId: targetUser.id },
                { headers: { Authorization: `Bearer ${token}` } });
            setFriendStatuses(p => ({ ...p, [targetUser.username]: 'pending' }));
        } catch {}
        finally { setActionLoading(p => ({ ...p, [targetUser.username]: false })); }
    };

    const filteredRankers = rankers.filter(r =>
        r?.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const podiumUsers  = filteredRankers.slice(0, 3);
    const displayPodium = [podiumUsers[1] || null, podiumUsers[0] || null, podiumUsers[2] || null];
    const listUsers    = filteredRankers.slice(3, 10);
    const myRankOutsideTop10 = !searchQuery && user?.username && userRank && userRank > 10
        ? rankers[userRank - 1] : null;

    const FriendBtn = ({ u }) => {
        if (!user || u?.username === user?.username) return null;
        const status = friendStatuses[u?.username] || 'none';
        const busy   = actionLoading[u?.username];
        if (status === 'accepted') return (
            <span className="lb-friend-chip allies"><UserCheck size={11}/> Allies</span>
        );
        if (status === 'pending') return (
            <span className="lb-friend-chip pending"><Clock size={11}/> Sent</span>
        );
        if (status === 'incoming') return (
            <span className="lb-friend-chip incoming"><Check size={11}/> Accept</span>
        );
        return (
            <button className="lb-add-btn" onClick={() => sendRequest(u)} disabled={busy} title="Send friend request">
                <UserPlus size={13}/>
            </button>
        );
    };

    return (
        <div className="lb-page">
            {/* ── Animated background ── */}
            <div className="lb-bg">
                <div className="lb-bg-grid"/>
                <div className="lb-bg-glow lb-glow-1"/>
                <div className="lb-bg-glow lb-glow-2"/>
                <div className="lb-bg-glow lb-glow-3"/>
                <div className="lb-bg-particles">
                    {[...Array(20)].map((_,i) => <div key={i} className="lb-particle" style={{ '--i': i }}/>)}
                </div>
            </div>

            {/* ── Header ── */}
            <header className="lb-header">
                <div className="lb-header-left">
                    <button onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')} className="lb-back-btn">
                        <ArrowLeft size={18}/>
                    </button>
                    <div className="lb-brand">
                        <div className="lb-trophy-box">
                            <Trophy size={18} className="lb-trophy-icon"/>
                        </div>
                        <div>
                            <h1 className="lb-title">HALL OF FAME</h1>
                            <div className="lb-subtitle-row">
                                <span className="lb-pulse-dot"/>
                                <span className="lb-subtitle">GLOBAL RANKINGS · TOP 10</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lb-header-center">
                    <div className="lb-search-wrap">
                        <Search size={14} className="lb-search-icon"/>
                        <input type="text" placeholder="SEARCH OPERATIVES..."
                            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}/>
                        {searchQuery && <button className="lb-search-clear" onClick={() => setSearchQuery('')}><X size={13}/></button>}
                        <div className="lb-search-line"/>
                    </div>
                </div>

                <div className="lb-header-right">
                    {user && (
                        <div className="lb-me-chip">
                            <div className="lb-me-avatar">{user.username[0].toUpperCase()}</div>
                            <div>
                                <span className="lb-me-name">{user.username}</span>
                                <div className="lb-me-stats">
                                    <Zap size={10}/><span>{user.xp} XP</span>
                                    <span className="lb-dot"/>
                                    <Shield size={10}/><span>#{userRank || '--'}</span>
                                </div>
                            </div>
                        </div>
                    )}
                    <button className={`lb-refresh-btn ${isRefreshing ? 'spinning' : ''}`}
                        onClick={() => fetchRankings(true)} title="Refresh">
                        <RefreshCw size={16}/>
                    </button>
                </div>
            </header>

            <AnimatePresence>
                {dbError && (
                    <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }} className="lb-error-banner">
                        <Shield size={13}/> {dbError}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Branded Loading Overlay ── */}
            <AnimatePresence>
                {(loading || !minLoadingComplete) && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="lb-branded-loader"
                    >
                        <div className="lb-loader-content">
                            <motion.div
                                className="lb-loader-logo"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <Trophy size={64} className="lb-loader-icon" />
                            </motion.div>
                            <motion.h1
                                className="lb-loader-title"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.6 }}
                            >
                                BRIGHTCODE
                            </motion.h1>
                            <motion.p
                                className="lb-loader-subtitle"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5, duration: 0.6 }}
                            >
                                HALL OF FAME
                            </motion.p>
                            <motion.div
                                className="lb-loader-dots"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                {[0, 1, 2].map((i) => (
                                    <motion.div
                                        key={i}
                                        className="lb-loader-dot"
                                        animate={{
                                            scale: [1, 1.5, 1],
                                            opacity: [0.5, 1, 0.5]
                                        }}
                                        transition={{
                                            duration: 1.2,
                                            repeat: Infinity,
                                            delay: i * 0.2
                                        }}
                                    />
                                ))}
                            </motion.div>
                        </div>
                        <div className="lb-loader-bg">
                            <div className="lb-loader-grid" />
                            <div className="lb-loader-glow lb-loader-glow-1" />
                            <div className="lb-loader-glow lb-loader-glow-2" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="lb-main">

                {/* ── Podium ── */}
                <section className="lb-podium-section">
                    {loading ? (
                        <div className="lb-podium-skeleton">
                            {[160,220,120].map((h,i) => <div key={i} className="lb-ske-podium" style={{ height: h }}/>)}
                        </div>
                    ) : (
                        <div className="lb-podium-wrap">
                            {PODIUM_ORDER.map((cfg, idx) => {
                                const u = displayPodium[idx];
                                const lvl = u ? getLevelInfo(u.xp || 0) : null;
                                const isMe = user && u?.username === user.username;
                                return u ? (
                                    <motion.div key={u.username}
                                        initial={{ y: 80, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: cfg.delay, type: 'spring', stiffness: 70, damping: 14 }}
                                        className={`lb-podium-item lb-podium-${cfg.rank}${isMe ? ' lb-podium-me' : ''}`}
                                    >
                                        {cfg.isFirst && <Crown className="lb-crown" size={30}/>}
                                        <div className="lb-podium-medal">{cfg.medal}</div>

                                        <motion.div
                                            className={`lb-podium-avatar lb-avatar-${cfg.size}`}
                                            style={{ boxShadow: `0 0 30px ${lvl.glow}, 0 0 60px ${lvl.glow}33` }}
                                            whileHover={{ scale: 1.08 }}
                                        >
                                            {u.username?.charAt(0)?.toUpperCase()}
                                            {isMe && <div className="lb-podium-me-ring"/>}
                                        </motion.div>

                                        <h4 className="lb-podium-name">{u.username}</h4>
                                        <span className="lb-level-pill" style={{ background: lvl.bg, color: lvl.color, border: `1px solid ${lvl.border}` }}>
                                            {lvl.label}
                                        </span>
                                        <div className="lb-podium-xp">
                                            <Zap size={12} fill="#fbbf24" color="#fbbf24"/> {(u.xp||0).toLocaleString()} XP
                                        </div>

                                        <div className="lb-podium-actions">
                                            <button className="lb-visit-btn" onClick={() => navigate(`/u/${u.username}`)}>
                                                <Eye size={12}/> Profile
                                            </button>
                                            <FriendBtn u={u}/>
                                        </div>

                                        <div className="lb-podium-bar" style={{ height: cfg.barH,
                                            background: cfg.rank === 1
                                                ? 'linear-gradient(to bottom, rgba(var(--primary-rgb),0.55), rgba(var(--primary-rgb),0.03))'
                                                : cfg.rank === 2
                                                ? 'linear-gradient(to bottom, rgba(var(--primary-rgb),0.3), rgba(var(--primary-rgb),0.01))'
                                                : 'linear-gradient(to bottom, rgba(var(--primary-dark-rgb),0.35), rgba(var(--primary-dark-rgb),0.01))',
                                            borderTop: cfg.rank === 1 ? '2px solid rgba(var(--primary-rgb),0.8)'
                                                : cfg.rank === 2 ? '2px solid rgba(var(--primary-rgb),0.4)'
                                                : '2px solid rgba(var(--primary-dark-rgb),0.5)'
                                        }}/>
                                    </motion.div>
                                ) : (
                                    <div key={`empty-${idx}`} className={`lb-podium-item lb-podium-${cfg.rank} lb-podium-empty`}>
                                        <div className="lb-podium-medal" style={{ opacity: 0.2 }}>{cfg.medal}</div>
                                        <div className={`lb-podium-avatar lb-avatar-${cfg.size}`} style={{ opacity: 0.15 }}>?</div>
                                        <h4 className="lb-podium-name" style={{ color: '#333' }}>Unranked</h4>
                                        <div className="lb-podium-bar" style={{ height: cfg.barH, opacity: 0.1,
                                            background: 'linear-gradient(to bottom, rgba(var(--primary-rgb),0.5), transparent)' }}/>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ── Rank List ── */}
                <section className="lb-list-section">
                    <div className="lb-list-card">
                        <div className="lb-list-header">
                            <div className="lb-col lb-col-rank">RANK</div>
                            <div className="lb-col lb-col-user">OPERATIVE</div>
                            <div className="lb-col lb-col-level">MASTERY</div>
                            <div className="lb-col lb-col-xp">XP</div>
                            <div className="lb-col lb-col-bar">PROGRESS</div>
                            <div className="lb-col lb-col-actions">ACTIONS</div>
                        </div>

                        <div className="lb-list-body">
                            {loading ? (
                                [1,2,3,4,5].map(i => (
                                    <div key={i} className="lb-row lb-row-skeleton">
                                        {[30,120,80,60,100,80].map((w,j) => (
                                            <div key={j} className="lb-col"><div className="lb-ske" style={{ width: w }}/></div>
                                        ))}
                                    </div>
                                ))
                            ) : listUsers.map((u, idx) => {
                                const lvl = getLevelInfo(u?.xp || 0);
                                const isMe = user && u?.username === user.username;
                                const xpPct = Math.min(((u?.xp || 0) / 200) * 100, 100);
                                const rank = idx + 4;
                                return (
                                    <motion.div key={u?.username || idx}
                                        initial={{ opacity: 0, x: -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: idx * 0.05 }}
                                        className={`lb-row${isMe ? ' lb-row-me' : ''}`}
                                        style={isMe ? { '--row-glow': lvl.glow } : {}}
                                    >
                                        <div className="lb-col lb-col-rank">
                                            <span className="lb-rank-num">#{rank}</span>
                                        </div>
                                        <div className="lb-col lb-col-user">
                                            <div className="lb-mini-avatar" style={{ background: lvl.bg, border: `1px solid ${lvl.border}`, color: lvl.color }}>
                                                {u?.username?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div className="lb-user-info">
                                                <span className="lb-username">{u?.username}</span>
                                                {isMe && <span className="lb-you-badge">YOU</span>}
                                            </div>
                                        </div>
                                        <div className="lb-col lb-col-level">
                                            <span className="lb-level-pill" style={{ background: lvl.bg, color: lvl.color, border: `1px solid ${lvl.border}` }}>
                                                {lvl.label}
                                            </span>
                                        </div>
                                        <div className="lb-col lb-col-xp">
                                            <Zap size={12} className="lb-zap"/> {(u?.xp||0).toLocaleString()}
                                        </div>
                                        <div className="lb-col lb-col-bar">
                                            <div className="lb-bar-track">
                                                <motion.div className="lb-bar-fill"
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${xpPct}%` }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.8, delay: idx * 0.05 }}
                                                    style={{ background: `linear-gradient(90deg, ${lvl.color}99, ${lvl.color})` }}
                                                />
                                            </div>
                                        </div>
                                        <div className="lb-col lb-col-actions">
                                            <button className="lb-visit-btn sm" onClick={() => navigate(`/u/${u.username}`)}>
                                                <Eye size={11}/> View
                                            </button>
                                            <FriendBtn u={u}/>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {!loading && filteredRankers.length === 0 && (
                                <div className="lb-empty">
                                    <Trophy size={36} color="rgba(250,248,243,0.3)"/>
                                    <p>{searchQuery ? `No operatives matching "${searchQuery}"` : 'No engineers ranked yet.'}</p>
                                </div>
                            )}

                            {!loading && myRankOutsideTop10 && (() => {
                                const u = myRankOutsideTop10;
                                const lvl = getLevelInfo(u?.xp || 0);
                                const xpPct = Math.min(((u?.xp || 0) / 200) * 100, 100);
                                return (
                                    <>
                                        <div className="lb-your-rank-divider">
                                            <span>· · ·</span><span className="lb-divider-label">YOUR RANK</span><span>· · ·</span>
                                        </div>
                                        <motion.div initial={{ opacity:0, x:-20 }} animate={{ opacity:1, x:0 }} className="lb-row lb-row-me">
                                            <div className="lb-col lb-col-rank"><span className="lb-rank-num">#{userRank}</span></div>
                                            <div className="lb-col lb-col-user">
                                                <div className="lb-mini-avatar" style={{ background: lvl.bg, border: `1px solid ${lvl.border}`, color: lvl.color }}>
                                                    {u?.username?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="lb-user-info">
                                                    <span className="lb-username">{u?.username}</span>
                                                    <span className="lb-you-badge">YOU</span>
                                                </div>
                                            </div>
                                            <div className="lb-col lb-col-level">
                                                <span className="lb-level-pill" style={{ background: lvl.bg, color: lvl.color, border: `1px solid ${lvl.border}` }}>{lvl.label}</span>
                                            </div>
                                            <div className="lb-col lb-col-xp"><Zap size={12} className="lb-zap"/> {(u?.xp||0).toLocaleString()}</div>
                                            <div className="lb-col lb-col-bar">
                                                <div className="lb-bar-track">
                                                    <div className="lb-bar-fill" style={{ width: `${xpPct}%`, background: `linear-gradient(90deg, ${lvl.color}99, ${lvl.color})` }}/>
                                                </div>
                                            </div>
                                            <div className="lb-col lb-col-actions"/>
                                        </motion.div>
                                    </>
                                );
                            })()}
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Leaderboard;
