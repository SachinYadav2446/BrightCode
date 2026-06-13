import API_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Crown, ArrowLeft, Zap, Search, Shield, X, UserPlus, Eye, Clock, Check, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';
import axios from 'axios';
import './Leaderboard.css';

const PAGE_SIZE = 20;

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

    const [podiumUsers, setPodiumUsers]       = useState([]);
    const [rankers, setRankers]               = useState([]);
    const [total, setTotal]                   = useState(0);
    const [currentPage, setCurrentPage]       = useState(1);
    const [loading, setLoading]               = useState(true);
    const [listLoading, setListLoading]       = useState(false);
    const [minLoadingComplete, setMinLoadingComplete] = useState(false);
    const [dbError, setDbError]               = useState(null);
    const [searchQuery, setSearchQuery]       = useState('');
    const [friendStatuses, setFriendStatuses] = useState({});
    const [actionLoading, setActionLoading]   = useState({});
    const socketRef = useRef(null);

    const fetchPodium = async () => {
        try {
            const res = await axios.get(`${API_URL}/leaderboard?page=1&limit=3`, { timeout: 8000 });
            const data = res.data?.data || res.data || [];
            setPodiumUsers(Array.isArray(data) ? data : []);
        } catch {}
    };

    const fetchPage = async (page) => {
        setListLoading(true);
        try {
            const res = await axios.get(`${API_URL}/leaderboard?page=${page}&limit=${PAGE_SIZE}`, { timeout: 8000 });
            const payload = res.data;
            const rows = Array.isArray(payload) ? payload : (payload.data || []);
            const tot  = payload.total ?? rows.length;
            setRankers(rows);
            setTotal(tot);
            setDbError(null);
        } catch {
            setDbError('Server unreachable. Showing last cached state.');
        } finally {
            setListLoading(false);
            setLoading(false);
        }
    };

    const syncMyXP = async () => {
        const token = localStorage.getItem('token');
        if (!token) return;
        try {
            const res = await axios.get(`${API_URL}/me`, { headers: { Authorization: `Bearer ${token}` }, timeout: 4000 });
            if (res.data?.xp !== undefined) updateXP(res.data.xp, res.data);
        } catch {}
    };

    const fetchFriendStatuses = async (users) => {
        const token = localStorage.getItem('token');
        if (!token || !user) return;
        try {
            const res = await axios.get(`${API_URL}/friends/search?q=`, { headers: { Authorization: `Bearer ${token}` } });
            const map = {};
            (res.data || []).forEach(u => { map[u.username] = u.friendStatus || 'none'; });
            setFriendStatuses(map);
        } catch {}
    };

    useEffect(() => {
        window.scrollTo(0, 0);
        fetchPodium();
        fetchPage(1);
        syncMyXP();
        const minTimer = setTimeout(() => setMinLoadingComplete(true), 2500);
        const socket = io(`${API_URL}`, { transports: ['websocket'] });
        socketRef.current = socket;
        socket.on('leaderboard-update', (freshData) => {
            if (Array.isArray(freshData) && freshData.length > 0) setPodiumUsers(freshData.slice(0, 3));
            if (currentPage === 1) setRankers(Array.isArray(freshData) ? freshData.slice(0, PAGE_SIZE) : []);
        });
        return () => { clearTimeout(minTimer); socket.disconnect(); socketRef.current = null; };
    }, []);

    useEffect(() => { if (rankers.length > 0) fetchFriendStatuses(rankers); }, [rankers]);

    const goToPage = (page) => {
        setCurrentPage(page);
        fetchPage(page);
        document.querySelector('.lb-list-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const totalPages = Math.ceil(total / PAGE_SIZE);
    const filteredRankers = rankers.filter(r => r?.username?.toLowerCase().includes(searchQuery.toLowerCase()));
    const listRows = currentPage === 1 ? filteredRankers.slice(3) : filteredRankers;
    const displayPodium = [podiumUsers[1] || null, podiumUsers[0] || null, podiumUsers[2] || null];

    const sendRequest = async (targetUser) => {
        const token = localStorage.getItem('token');
        if (!token) return;
        setActionLoading(p => ({ ...p, [targetUser.username]: true }));
        try {
            await axios.post(`${API_URL}/friends/request`, { recipientId: targetUser.id }, { headers: { Authorization: `Bearer ${token}` } });
            setFriendStatuses(p => ({ ...p, [targetUser.username]: 'pending' }));
        } catch {}
        finally { setActionLoading(p => ({ ...p, [targetUser.username]: false })); }
    };

    const FriendBtn = ({ u }) => {
        if (!user || u?.username === user?.username) return null;
        const status = friendStatuses[u?.username] || 'none';
        const busy   = actionLoading[u?.username];
        if (status === 'accepted') return <span className="lb-friend-chip allies"><UserCheck size={11}/> Allies</span>;
        if (status === 'pending')  return <span className="lb-friend-chip pending"><Clock size={11}/> Sent</span>;
        if (status === 'incoming') return <span className="lb-friend-chip incoming"><Check size={11}/> Accept</span>;
        return (
            <button className="lb-add-btn" onClick={() => sendRequest(u)} disabled={busy} title="Send friend request">
                <UserPlus size={13}/>
            </button>
        );
    };

    return (
        <div className="lb-page">

            {/* ── background ── */}
            <div className="lb-bg">
                <div className="lb-bg-grid"/>
                <div className="lb-bg-glow lb-glow-1"/>
                <div className="lb-bg-glow lb-glow-2"/>
                <div className="lb-bg-glow lb-glow-3"/>
                <div className="lb-bg-particles">
                    {[...Array(20)].map((_,i) => <div key={i} className="lb-particle" style={{'--i':i}}/>)}
                </div>
            </div>

            {/* ── sticky header: back | centered title | search ── */}
            <div className="lb-topbar">
                <div className="lb-topbar-row">
                    {/* left */}
                    <div className="lb-topbar-left">
                        <button
                            className="lb-back-btn"
                            onClick={() => window.history.length > 1 ? navigate(-1) : navigate('/')}
                            aria-label="Go back"
                        >
                            <ArrowLeft size={18}/>
                        </button>
                    </div>

                    {/* centre — absolutely positioned so it's truly centred */}
                    <div className="lb-topbar-center">
                        <h1 className="lb-header-title">
                            <Trophy size={28} className="lb-hero-trophy"/>
                            Hall of Fame
                        </h1>
                    </div>

                    {/* right */}
                    <div className="lb-topbar-right">
                        <div className="lb-search-wrap">
                            <Search size={14} className="lb-search-icon"/>
                            <input
                                type="text"
                                placeholder="Search operatives..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                            {searchQuery && (
                                <button className="lb-search-clear" onClick={() => setSearchQuery('')}>
                                    <X size={11}/>
                                </button>
                            )}
                            <div className="lb-search-line"/>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── error banner ── */}
            <AnimatePresence>
                {dbError && (
                    <motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="lb-error-banner">
                        <Shield size={13}/> {dbError}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── loading overlay ── */}
            <AnimatePresence>
                {(loading || !minLoadingComplete) && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="lb-branded-loader">
                        <div className="lb-loader-content">
                            <motion.div className="lb-loader-logo"
                                initial={{scale:0,rotate:-180}} animate={{scale:1,rotate:0}}
                                transition={{duration:0.8,ease:'easeOut'}}>
                                <Trophy size={64} className="lb-loader-icon"/>
                            </motion.div>
                            <motion.h1 className="lb-loader-title"
                                initial={{y:20,opacity:0}} animate={{y:0,opacity:1}}
                                transition={{delay:0.3,duration:0.6}}>
                                BRIGHTCODE
                            </motion.h1>
                            <motion.p className="lb-loader-subtitle"
                                initial={{y:20,opacity:0}} animate={{y:0,opacity:1}}
                                transition={{delay:0.5,duration:0.6}}>
                                HALL OF FAME
                            </motion.p>
                            <motion.div className="lb-loader-dots" initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.7}}>
                                {[0,1,2].map(i => (
                                    <motion.div key={i} className="lb-loader-dot"
                                        animate={{scale:[1,1.5,1],opacity:[0.5,1,0.5]}}
                                        transition={{duration:1.2,repeat:Infinity,delay:i*0.2}}/>
                                ))}
                            </motion.div>
                        </div>
                        <div className="lb-loader-bg">
                            <div className="lb-loader-grid"/>
                            <div className="lb-loader-glow lb-loader-glow-1"/>
                            <div className="lb-loader-glow lb-loader-glow-2"/>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <main className="lb-main">

                {/* ── podium ── */}
                <section className="lb-podium-section">
                    {loading ? (
                        <div className="lb-podium-skeleton">
                            {[160,220,120].map((h,i) => <div key={i} className="lb-ske-podium" style={{height:h}}/>)}
                        </div>
                    ) : (
                        <div className="lb-podium-wrap">
                            {PODIUM_ORDER.map((cfg, idx) => {
                                const u = displayPodium[idx];
                                const lvl = u ? getLevelInfo(u.xp || 0) : null;
                                const isMe = user && u?.username === user.username;
                                return u ? (
                                    <motion.div key={u.username}
                                        initial={{y:80,opacity:0}} animate={{y:0,opacity:1}}
                                        transition={{delay:cfg.delay,type:'spring',stiffness:70,damping:14}}
                                        className={`lb-podium-item lb-podium-${cfg.rank}${isMe?' lb-podium-me':''}`}
                                    >
                                        {cfg.isFirst && <Crown className="lb-crown" size={30}/>}
                                        <div className="lb-podium-medal">{cfg.medal}</div>
                                        <motion.div
                                            className={`lb-podium-avatar lb-avatar-${cfg.size}`}
                                            style={{boxShadow:`0 0 30px ${lvl.glow}, 0 0 60px ${lvl.glow}33`}}
                                            whileHover={{scale:1.08}}
                                        >
                                            {u.username?.charAt(0)?.toUpperCase()}
                                            {isMe && <div className="lb-podium-me-ring"/>}
                                        </motion.div>
                                        <h4 className="lb-podium-name">{u.username}</h4>
                                        <span className="lb-level-pill" style={{background:lvl.bg,color:lvl.color,border:`1px solid ${lvl.border}`}}>
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
                                        <div className="lb-podium-bar" style={{height:cfg.barH}}/>
                                    </motion.div>
                                ) : (
                                    <div key={`empty-${idx}`} className={`lb-podium-item lb-podium-${cfg.rank} lb-podium-empty`}>
                                        <div className="lb-podium-medal" style={{opacity:0.2}}>{cfg.medal}</div>
                                        <div className={`lb-podium-avatar lb-avatar-${cfg.size}`} style={{opacity:0.15}}>?</div>
                                        <h4 className="lb-podium-name" style={{color:'#333'}}>Unranked</h4>
                                        <div className="lb-podium-bar" style={{height:cfg.barH,opacity:0.08}}/>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>

                {/* ── rank list ── */}
                <section className="lb-list-section">
                    <div className="lb-list-card">
                        {/* column headers */}
                        <div className="lb-list-header">
                            <div className="lb-col lb-col-rank">RANK</div>
                            <div className="lb-col lb-col-user">PLAYER</div>
                            <div className="lb-col lb-col-level">TIER</div>
                            <div className="lb-col lb-col-xp">XP EARNED</div>
                            <div className="lb-col lb-col-bar">PROGRESS</div>
                            <div className="lb-col lb-col-actions"/>
                        </div>

                        <div className="lb-list-body">
                            {listLoading ? (
                                [1,2,3,4,5,6,7].map(i => (
                                    <div key={i} className="lb-row lb-row-skeleton">
                                        {[40,220,100,80,140,70].map((w,j) => (
                                            <div key={j} className="lb-col"><div className="lb-ske" style={{width:w}}/></div>
                                        ))}
                                    </div>
                                ))
                            ) : listRows.map((u, idx) => {
                                const lvl = getLevelInfo(u?.xp || 0);
                                const isMe = user && u?.username === user.username;
                                const xpPct = Math.min(((u?.xp || 0) / 2000) * 100, 100);
                                const globalRank = currentPage === 1 ? idx + 4 : (currentPage - 1) * PAGE_SIZE + idx + 1;
                                return (
                                    <motion.div key={u?.username || idx}
                                        initial={{opacity:0,y:6}} whileInView={{opacity:1,y:0}}
                                        viewport={{once:true}} transition={{delay:idx*0.025}}
                                        className={`lb-row${isMe?' lb-row-me':''}`}
                                        style={{'--lvl-color': lvl.color, '--lvl-glow': lvl.glow}}
                                    >
                                        {/* rank */}
                                        <div className="lb-col lb-col-rank">
                                            <span className="lb-rank-num">
                                                {globalRank <= 3
                                                    ? ['🥇','🥈','🥉'][globalRank - 1]
                                                    : `#${globalRank}`
                                                }
                                            </span>
                                        </div>

                                        {/* player — avatar + name */}
                                        <div className="lb-col lb-col-user">
                                            <div className="lb-avatar-block" style={{'--c': lvl.color, '--b': lvl.border}}>
                                                <span className="lb-avatar-letter">{u?.username?.charAt(0)?.toUpperCase()}</span>
                                            </div>
                                            <div className="lb-user-info">
                                                <span className="lb-username">{u?.username}</span>
                                                {isMe && <span className="lb-you-badge">YOU</span>}
                                            </div>
                                        </div>

                                        {/* tier badge */}
                                        <div className="lb-col lb-col-level">
                                            <span className="lb-tier-badge" style={{'--c': lvl.color, '--bg': lvl.bg, '--b': lvl.border}}>
                                                <span className="lb-tier-dot"/>
                                                {lvl.label}
                                            </span>
                                        </div>

                                        {/* xp */}
                                        <div className="lb-col lb-col-xp">
                                            <span className="lb-xp-val">{(u?.xp||0).toLocaleString()}</span>
                                            <span className="lb-xp-unit">XP</span>
                                        </div>

                                        {/* progress bar with % */}
                                        <div className="lb-col lb-col-bar">
                                            <div className="lb-bar-outer">
                                                <div className="lb-bar-track">
                                                    <motion.div className="lb-bar-fill"
                                                        initial={{width:0}} whileInView={{width:`${xpPct}%`}}
                                                        viewport={{once:true}}
                                                        transition={{duration:1,delay:idx*0.03,ease:[0.16,1,0.3,1]}}
                                                        style={{background:`linear-gradient(90deg,${lvl.color}55,${lvl.color})`}}
                                                    />
                                                </div>
                                                <span className="lb-bar-pct" style={{color: xpPct > 0 ? lvl.color : undefined}}>
                                                    {Math.round(xpPct)}%
                                                </span>
                                            </div>
                                        </div>

                                        {/* actions */}
                                        <div className="lb-col lb-col-actions">
                                            <button className="lb-action-btn" onClick={() => navigate(`/u/${u.username}`)}>
                                                <Eye size={13}/>
                                            </button>
                                            <FriendBtn u={u}/>
                                        </div>
                                    </motion.div>
                                );
                            })}

                            {!listLoading && filteredRankers.length === 0 && (
                                <div className="lb-empty">
                                    <Trophy size={36} color="rgba(250,248,243,0.2)"/>
                                    <p>{searchQuery ? `No match for "${searchQuery}"` : 'No engineers ranked yet.'}</p>
                                </div>
                            )}
                        </div>

                        {/* pagination */}
                        {!searchQuery && totalPages > 1 && (
                            <div className="lb-pagination">
                                <button className="lb-page-btn" onClick={() => goToPage(currentPage-1)} disabled={currentPage===1}>
                                    <ChevronLeft size={15}/>
                                </button>
                                <div className="lb-page-nums">
                                    {(() => {
                                        const pages = [];
                                        const delta = 2;
                                        for (let i = 1; i <= totalPages; i++) {
                                            if (i===1||i===totalPages||(i>=currentPage-delta&&i<=currentPage+delta)) pages.push(i);
                                            else if (i===currentPage-delta-1||i===currentPage+delta+1) pages.push('...');
                                        }
                                        return pages.filter((p,i,arr)=>!(p==='...'&&arr[i-1]==='...')).map((p,i) =>
                                            p==='...' ? <span key={`e-${i}`} className="lb-page-ellipsis">…</span> : (
                                                <button key={p} className={`lb-page-num-btn${currentPage===p?' active':''}`} onClick={()=>goToPage(p)}>{p}</button>
                                            )
                                        );
                                    })()}
                                </div>
                                <button className="lb-page-btn" onClick={() => goToPage(currentPage+1)} disabled={currentPage===totalPages}>
                                    <ChevronRight size={15}/>
                                </button>
                                <span className="lb-page-info">{(currentPage-1)*PAGE_SIZE+1}–{Math.min(currentPage*PAGE_SIZE,total)} of {total}</span>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default Leaderboard;
