import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, Zap, Shield, Code2, Trophy, Flame,
    Calendar, UserPlus, UserCheck, Clock, X, Check,
    Layers, Terminal, Cpu, Crosshair, Globe
} from 'lucide-react';
import './UserProfile.css';

const API = API_URL;

const LEVEL_CONFIG = {
    'Grandmaster': { color: '#f59e0b', glow: 'rgba(245,158,11,0.5)', rank: 5 },
    'Expert':      { color: '#a855f7', glow: 'rgba(168,85,247,0.5)', rank: 4 },
    'Advanced':    { color: '#3b82f6', glow: 'rgba(59,130,246,0.5)', rank: 3 },
    'Apprentice':  { color: '#22c55e', glow: 'rgba(34,197,94,0.5)',  rank: 2 },
    'Novice':      { color: '#94a3b8', glow: 'rgba(148,163,184,0.3)',rank: 1 },
};

const SKILL_META = [
    { key: 'css',    label: 'CSS Forge',    icon: 'ðŸŽ¨', max: 50,  color: '#38bdf8' },
    { key: 'logic',  label: 'Logic Lab',    icon: 'âš¡', max: 150, color: '#a78bfa' },
    { key: 'react',  label: 'React Forge',  icon: 'âš›ï¸', max: 500, color: '#34d399' },
    { key: 'mern',   label: 'MERN Stack',   icon: 'ðŸ”§', max: 100, color: '#f97316' },
    { key: 'java',   label: 'Java Master',  icon: 'â˜•', max: 100, color: '#ef4444' },
    { key: 'cpp',    label: 'C++ Master',   icon: 'ðŸ”©', max: 100, color: '#64748b' },
    { key: 'python', label: 'Python',       icon: 'ðŸ', max: 100, color: '#facc15' },
    { key: 'go',     label: 'Go Master',    icon: 'ðŸ¹', max: 100, color: '#06b6d4' },
];

const Heatmap = ({ activity }) => {
    const generateHeatmapData = () => {
        const data = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        const startDate = new Date(currentYear, 0, 1);
        startDate.setDate(startDate.getDate() - startDate.getDay());

        for (let i = 0; i < 53; i++) {
            const week = [];
            for (let j = 0; j < 7; j++) {
                const currentDate = new Date(startDate);
                currentDate.setDate(startDate.getDate() + (i * 7 + j));
                
                const dateKey = currentDate.toISOString().split('T')[0];
                const xp = activity[dateKey] || 0;
                let level = 0;
                if (xp > 0) {
                    if (xp < 50) level = 1;
                    else if (xp < 150) level = 2;
                    else if (xp < 300) level = 3;
                    else level = 4;
                }
                week.push({ date: dateKey, xp, level });
            }
            data.push(week);
        }
        return data;
    };

    const heatmapData = generateHeatmapData();

    const getMonthLabels = () => {
        if (!heatmapData || heatmapData.length === 0) return [];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const labels = [];
        let lastMonth = -1;
        let lastLabelIndex = -2;

        heatmapData.forEach((week, i) => {
            if (!week || week.length === 0) return;
            const firstDayOfWeek = new Date(week[0].date);
            const currentMonth = firstDayOfWeek.getMonth();
            if (currentMonth !== lastMonth) {
                if (i - lastLabelIndex >= 3) {
                    labels.push({ month: months[currentMonth], index: i });
                    lastLabelIndex = i;
                }
                lastMonth = currentMonth;
            }
        });
        return labels;
    };

    const monthLabels = getMonthLabels();

    return (
        <div className="up-heatmap-container">
            <div className="up-heatmap-months">
                {monthLabels.map((label, idx) => (
                    <span
                        key={idx}
                        className="up-month-label"
                        style={{ gridColumnStart: label.index + 1 }}
                    >
                        {label.month}
                    </span>
                ))}
            </div>
            <div className="up-heatmap">
                {heatmapData.map((week, wi) => (
                    <div key={wi} className="up-heatmap-week">
                        {week.map((day, di) => (
                            <div
                                key={di}
                                className={`up-heatmap-day level-${day.level}`}
                                title={`${day.date}: ${day.xp} XP`}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default function UserProfile() {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user: me } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [friendStatus, setFriendStatus] = useState('none');
    const [actionLoading, setActionLoading] = useState(false);

    const token = localStorage.getItem('token');
    const authHeader = { headers: { Authorization: `Bearer ${token}` } };
    const isSelf = me?.username?.toLowerCase() === username?.toLowerCase();

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            setNotFound(false);
            try {
                const { data } = await axios.get(`${API}/profile/${username}`);
                setProfile(data);
            } catch (e) {
                if (e.response?.status === 404) setNotFound(true);
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, [username]);

    useEffect(() => {
        if (!token || isSelf || !profile) return;
        const check = async () => {
            try {
                const { data } = await axios.get(`${API}/friends/search?q=${encodeURIComponent(username)}`, authHeader);
                const match = data.find(u => u.username?.toLowerCase() === username.toLowerCase());
                if (match) setFriendStatus(match.friendStatus || 'none');
            } catch (e) {}
        };
        check();
    }, [profile, token]);

    const handleAddFriend = async () => {
        if (!profile || !token) return;
        setActionLoading(true);
        try {
            await axios.post(`${API}/friends/request`, { recipientId: profile.id }, authHeader);
            setFriendStatus('pending');
        } catch (e) {}
        finally { setActionLoading(false); }
    };

    const handleAccept = async () => {
        if (!profile || !token) return;
        setActionLoading(true);
        try {
            await axios.post(`${API}/friends/accept`, { requesterId: profile.id }, authHeader);
            setFriendStatus('accepted');
        } catch (e) {}
        finally { setActionLoading(false); }
    };

    const handleRemove = async () => {
        if (!profile || !token) return;
        setActionLoading(true);
        try {
            await axios.post(`${API}/friends/remove`, { otherId: profile.id }, authHeader);
            setFriendStatus('none');
        } catch (e) {}
        finally { setActionLoading(false); }
    };

    const levelCfg = LEVEL_CONFIG[profile?.level] || LEVEL_CONFIG['Novice'];
    const activeSkills = SKILL_META.filter(s => profile?.skills?.[s.key] > 0);
    // DiceBear Adventurer Avatar
    const avatarUrl = profile ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.avatarId || 'Sniper'}&backgroundColor=transparent` : '';

    if (loading) return (
        <div className="up-loading">
            <div className="up-loading-inner">
                <div className="up-loading-logo">
                    <span className="up-logo-bright">BRIGHT</span><span className="up-logo-code">CODE</span>
                </div>
                <div className="up-loading-bar-wrap">
                    <div className="up-loading-bar-fill" />
                </div>
                <p className="up-loading-label">LOADING OPERATIVE DATA...</p>
            </div>
        </div>
    );

    if (notFound) return (
        <div className="up-not-found">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="up-nf-card">
                <span className="up-nf-code">M.I.A</span>
                <h2>Player Not Found</h2>
                <p>No operative with callsign <strong>"{username}"</strong> exists in the database.</p>
                <button className="up-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Retreat
                </button>
            </motion.div>
        </div>
    );

    const BANNERS = {
        'crimson': 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(17, 17, 19, 0.98) 100%)',
        'cyber': 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(17, 17, 19, 0.98) 100%)',
        'toxic': 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(17, 17, 19, 0.98) 100%)',
        'void': 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(17, 17, 19, 0.98) 100%)',
        'gold': 'linear-gradient(135deg, rgba(201, 168, 76, 0.12) 0%, rgba(17, 17, 19, 0.98) 100%)',
    };
    
    const bannerId = profile?.bannerId || 'crimson';
    const bannerCss = BANNERS[bannerId] || BANNERS['crimson'];

    return (
        <div className="up-page">
            <div className="up-bg-glow" style={{ background: `radial-gradient(ellipse at center, ${levelCfg.glow} 0%, transparent 60%)` }} />

            <div className="up-content">
                <button className="up-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={14} /> Back
                </button>

                {/* â”€â”€ Hero Dossier â”€â”€ */}
                <motion.div
                    className="up-hero"
                    style={{ background: bannerCss }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, type: 'spring' }}
                >
                    <div className="up-hero-overlay" />
                    <div className="up-avatar-wrap">
                        <div className="up-avatar-hex" style={{ borderColor: levelCfg.color }}>
                            <img src={avatarUrl} alt={profile.username} />
                        </div>
                        <div className="up-level-badge" style={{ color: levelCfg.color, borderColor: levelCfg.color }}>
                            LVL {Math.floor((profile?.xp || 0) / 1000) + 1}
                        </div>
                    </div>

                    <div className="up-identity">
                        <div className="up-name-row">
                            <h1 className="up-username">{profile.username}</h1>
                            <div className="up-online-status">
                                <span className="up-status-dot" style={{ color: profile.online ? '#22c55e' : '#6b7280' }} />
                                {profile.online ? 'Online' : 'Offline'}
                            </div>
                        </div>

                        {profile.bio && <p className="up-bio">"{profile.bio}"</p>}

                        {profile.stack?.length > 0 && (
                            <div className="up-stack">
                                {profile.stack.map((tech, i) => (
                                    <span key={i} className="up-stack-tag">{tech}</span>
                                ))}
                            </div>
                        )}
                        
                        {/* Links section */}
                        <div className="up-social-links">
                            {profile.github && <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} target="_blank" rel="noreferrer" className="social-link"><Globe size={14}/> GitHub</a>}
                            {profile.leetcode && <a href={profile.leetcode.startsWith('http') ? profile.leetcode : `https://${profile.leetcode}`} target="_blank" rel="noreferrer" className="social-link"><Globe size={14}/> LeetCode</a>}
                            {profile.project1 && <a href={profile.project1.startsWith('http') ? profile.project1 : `https://${profile.project1}`} target="_blank" rel="noreferrer" className="social-link"><Globe size={14}/> Project 1</a>}
                            {profile.project2 && <a href={profile.project2.startsWith('http') ? profile.project2 : `https://${profile.project2}`} target="_blank" rel="noreferrer" className="social-link"><Globe size={14}/> Project 2</a>}
                        </div>

                        {profile.joinedAt && (
                            <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 1 }}>
                                IDENT EST: {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                        )}
                    </div>

                    {/* Friend Action */}
                    {me && !isSelf && (
                        <div className="up-friend-action">
                            {friendStatus === 'none' && (
                                <button className="up-action-btn add" onClick={handleAddFriend} disabled={actionLoading}>
                                    <Crosshair size={16} /> Add Ally
                                </button>
                            )}
                            {friendStatus === 'pending' && (
                                <button className="up-action-btn" disabled>
                                    <Clock size={16} /> Request Sent
                                </button>
                            )}
                            {friendStatus === 'incoming' && (
                                <button className="up-action-btn accept" onClick={handleAccept} disabled={actionLoading}>
                                    <Check size={16} /> Accept
                                </button>
                            )}
                            {friendStatus === 'accepted' && (
                                <button className="up-action-btn remove" onClick={handleRemove} disabled={actionLoading}>
                                    <X size={16} /> Remove Ally
                                </button>
                            )}
                        </div>
                    )}
                    {isSelf && (
                        <Link to="/settings" className="up-action-btn">
                            Configure Profile
                        </Link>
                    )}
                </motion.div>

                {/* â”€â”€ Stats Row â”€â”€ */}
                <motion.div
                    className="up-stats-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    {[
                        { id: 'xp', icon: <Zap size={20} />, label: 'Total XP', value: profile.xp.toLocaleString(), color: '#f59e0b' },
                        { id: 'challenges', icon: <Trophy size={20} />, label: 'Challenges', value: profile.totalSolved, color: '#a855f7' },
                        { id: 'streak', icon: <Flame size={20} />, label: 'Day Streak', value: `${profile.streak}d`, color: '#ef4444' },
                        { id: 'rank', icon: <Shield size={20} />, label: 'Rank', value: profile.level, color: levelCfg.color },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            className={`up-stat-card ${stat.id}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3 + i * 0.1 }}
                            style={{ borderTopColor: stat.color }}
                        >
                            <span className="up-stat-icon" style={{ color: stat.color }}>{stat.icon}</span>
                            <span className="up-stat-value" style={{ color: stat.color }}>{stat.value}</span>
                            <span className="up-stat-label">{stat.label}</span>
                        </motion.div>
                    ))}
                </motion.div>



                {/* â”€â”€ Activity Heatmap â”€â”€ */}
                {Object.keys(profile.activity || {}).length > 0 && (
                    <motion.div className="up-section" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                        <div className="up-section-hdr">
                            <Terminal size={20} color="var(--primary)" /> Activity Log (Past Year)
                        </div>
                        <Heatmap activity={profile.activity} />
                        <div className="up-heatmap-legend">
                            <span>Idle</span>
                            {[0,1,2,3,4].map(l => <div key={l} className={`up-heatmap-day level-${l}`} />)}
                            <span>Active</span>
                        </div>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
