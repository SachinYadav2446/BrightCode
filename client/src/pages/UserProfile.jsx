import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    ArrowLeft, Zap, Shield, Code2, Trophy, Flame,
    Calendar, UserPlus, Clock, X, Check,
    Terminal, Crosshair, Globe, Activity, Award, CheckCircle2,
    Palette, Atom, Coffee, Cpu, Boxes, ExternalLink, Code
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
    { key: 'css',    label: 'CSS Forge',    icon: Palette,      max: 50,  color: '#38bdf8' },
    { key: 'logic',  label: 'Logic Lab',    icon: Zap,          max: 150, color: '#a78bfa' },
    { key: 'react',  label: 'React Forge',  icon: Atom,         max: 500, color: '#34d399' },
    { key: 'mern',   label: 'MERN Stack',   icon: Code2,        max: 100, color: '#ef4444' },
    { key: 'java',   label: 'Java Master',  icon: Coffee,       max: 100, color: '#f97316' },
    { key: 'cpp',    label: 'C++ Master',   icon: Cpu,          max: 100, color: '#94a3b8' },
    { key: 'python', label: 'Python',       icon: Terminal,     max: 100, color: '#facc15' },
    { key: 'go',     label: 'Go Master',    icon: Boxes,        max: 100, color: '#06b6d4' },
];

const Heatmap = ({ activity = {} }) => {
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
                                title={`${day.date}: ${day.xp > 0 ? `${day.xp} XP` : 'No activity'}`}
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
    const avatarUrl = profile ? `https://api.dicebear.com/7.x/adventurer/svg?seed=${profile.avatarId || profile.username || 'Operative'}&backgroundColor=transparent` : '';

    if (loading) return (
        <div className="up-loading">
            <div className="up-loading-inner">
                <div className="up-loading-logo">
                    <span className="up-logo-bright">BRIGHT</span><span className="up-logo-code">CODE</span>
                </div>
                <div className="up-loading-bar-wrap">
                    <div className="up-loading-bar-fill" />
                </div>
                <p className="up-loading-label">LOADING OPERATIVE PROFILE...</p>
            </div>
        </div>
    );

    if (notFound) return (
        <div className="up-not-found">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="up-nf-card">
                <span className="up-nf-code">404</span>
                <h2>Player Not Found</h2>
                <p>No operative with callsign <strong>"{username}"</strong> exists in the database.</p>
                <button className="up-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={16} /> Return to Base
                </button>
            </motion.div>
        </div>
    );

    const BANNERS = {
        'crimson': 'linear-gradient(135deg, rgba(239, 68, 68, 0.18) 0%, rgba(18, 12, 12, 0.98) 100%)',
        'cyber': 'linear-gradient(135deg, rgba(56, 189, 248, 0.18) 0%, rgba(18, 12, 12, 0.98) 100%)',
        'toxic': 'linear-gradient(135deg, rgba(34, 197, 94, 0.18) 0%, rgba(18, 12, 12, 0.98) 100%)',
        'void': 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(18, 12, 12, 0.98) 100%)',
        'gold': 'linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(18, 12, 12, 0.98) 100%)',
    };
    
    const bannerId = profile?.bannerId || 'crimson';
    const bannerCss = BANNERS[bannerId] || BANNERS['crimson'];

    // Compute Activity Stats
    const activityMap = profile.activity || {};
    const activityEntries = Object.entries(activityMap);
    const activeDaysCount = activityEntries.filter(([_, xp]) => Number(xp) > 0).length;
    const totalAnnualXP = activityEntries.reduce((sum, [_, xp]) => sum + Number(xp), 0);
    const peakDailyXP = activityEntries.reduce((max, [_, xp]) => Math.max(max, Number(xp)), 0);

    // Sorted recent activity dates
    const recentActivities = activityEntries
        .filter(([_, xp]) => Number(xp) > 0)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .slice(0, 5);

    return (
        <div className="up-page">
            <div className="up-bg-glow" style={{ background: `radial-gradient(ellipse at center, ${levelCfg.glow} 0%, transparent 60%)` }} />

            <div className="up-content">
                <button className="up-back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={14} /> Back
                </button>

                {/* ── Hero Dossier Banner ── */}
                <motion.div
                    className="up-hero"
                    style={{ background: bannerCss }}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, type: 'spring' }}
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
                                <span className={`up-status-dot ${profile.online ? 'online' : 'offline'}`} />
                                {profile.online ? 'Online' : 'Offline'}
                            </div>
                        </div>

                        {profile.bio ? (
                            <p className="up-bio">"{profile.bio}"</p>
                        ) : (
                            <p className="up-bio empty">No operative bio provided yet.</p>
                        )}

                        {profile.stack?.length > 0 && (
                            <div className="up-stack">
                                {profile.stack.map((tech, i) => (
                                    <span key={i} className="up-stack-tag">{tech}</span>
                                ))}
                            </div>
                        )}
                        
                        {/* All External Links */}
                        <div className="up-social-links">
                            {profile.github && (
                                <a href={profile.github.startsWith('http') ? profile.github : `https://${profile.github}`} target="_blank" rel="noreferrer" className="social-link github">
                                    <Code size={13}/> <span>GitHub</span> <ExternalLink size={10} className="ext-icon" />
                                </a>
                            )}
                            {profile.leetcode && (
                                <a href={profile.leetcode.startsWith('http') ? profile.leetcode : `https://${profile.leetcode}`} target="_blank" rel="noreferrer" className="social-link leetcode">
                                    <Terminal size={13}/> <span>LeetCode</span> <ExternalLink size={10} className="ext-icon" />
                                </a>
                            )}
                            {profile.project1 && (
                                <a href={profile.project1.startsWith('http') ? profile.project1 : `https://${profile.project1}`} target="_blank" rel="noreferrer" className="social-link project">
                                    <Globe size={13}/> <span>Portfolio</span> <ExternalLink size={10} className="ext-icon" />
                                </a>
                            )}
                            {profile.project2 && (
                                <a href={profile.project2.startsWith('http') ? profile.project2 : `https://${profile.project2}`} target="_blank" rel="noreferrer" className="social-link project">
                                    <Layers size={13}/> <span>Project 2</span> <ExternalLink size={10} className="ext-icon" />
                                </a>
                            )}
                        </div>

                        {profile.joinedAt && (
                            <span className="up-joined-tag">
                                IDENT EST: {new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }).toUpperCase()}
                            </span>
                        )}
                    </div>

                    {/* Friend Action */}
                    {me && !isSelf && (
                        <div className="up-friend-action">
                            {friendStatus === 'none' && (
                                <button className="up-action-btn add" onClick={handleAddFriend} disabled={actionLoading}>
                                    <UserPlus size={15} /> Add Ally
                                </button>
                            )}
                            {friendStatus === 'pending' && (
                                <button className="up-action-btn pending" disabled>
                                    <Clock size={15} /> Request Sent
                                </button>
                            )}
                            {friendStatus === 'incoming' && (
                                <button className="up-action-btn accept" onClick={handleAccept} disabled={actionLoading}>
                                    <Check size={15} /> Accept Request
                                </button>
                            )}
                            {friendStatus === 'accepted' && (
                                <button className="up-action-btn remove" onClick={handleRemove} disabled={actionLoading}>
                                    <X size={15} /> Remove Ally
                                </button>
                            )}
                        </div>
                    )}
                    {isSelf && (
                        <Link to="/settings" className="up-action-btn configure">
                            Configure Profile
                        </Link>
                    )}
                </motion.div>

                {/* ── Key Metrics Stats Grid ── */}
                <motion.div
                    className="up-stats-row"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                >
                    {[
                        { id: 'xp', icon: <Zap size={18} />, label: 'Total XP', value: (profile.xp || 0).toLocaleString(), color: '#f59e0b' },
                        { id: 'challenges', icon: <Trophy size={18} />, label: 'Challenges Solved', value: profile.totalSolved || 0, color: '#a855f7' },
                        { id: 'streak', icon: <Flame size={18} />, label: 'Day Streak', value: `${profile.streak || 0}d`, color: '#ef4444' },
                        { id: 'rank', icon: <Shield size={18} />, label: 'Operative Rank', value: profile.level || 'Novice', color: levelCfg.color },
                    ].map((stat, i) => (
                        <motion.div
                            key={i}
                            className={`up-stat-card ${stat.id}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 + i * 0.08 }}
                            style={{ borderTopColor: stat.color }}
                        >
                            <div className="up-stat-head">
                                <span className="up-stat-icon" style={{ color: stat.color }}>{stat.icon}</span>
                                <span className="up-stat-label">{stat.label}</span>
                            </div>
                            <span className="up-stat-value" style={{ color: stat.color }}>{stat.value}</span>
                        </motion.div>
                    ))}
                </motion.div>

                {/* ── Activity Log Section (ALWAYS DISPLAYED) ── */}
                <motion.div 
                    className="up-section activity-section" 
                    initial={{ opacity: 0, y: 15 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: 0.3 }}
                >
                    <div className="up-section-hdr">
                        <div className="up-hdr-left">
                            <Terminal size={18} className="hdr-icon" />
                            <h3>Activity Log & Contribution Heatmap</h3>
                        </div>
                        <div className="up-activity-status-pill">
                            <Activity size={13} />
                            <span>{activeDaysCount > 0 ? `${activeDaysCount} Active Days` : 'Idle / Standby Mode'}</span>
                        </div>
                    </div>

                    {/* Activity Metrics Bar */}
                    <div className="up-activity-metrics-bar">
                        <div className="act-metric-item">
                            <span className="act-metric-val">{activeDaysCount}</span>
                            <span className="act-metric-lbl">Active Days</span>
                        </div>
                        <div className="act-metric-item">
                            <span className="act-metric-val">{totalAnnualXP.toLocaleString()} XP</span>
                            <span className="act-metric-lbl">Annual Activity</span>
                        </div>
                        <div className="act-metric-item">
                            <span className="act-metric-val">{peakDailyXP > 0 ? `${peakDailyXP} XP` : '0 XP'}</span>
                            <span className="act-metric-lbl">Peak Daily Record</span>
                        </div>
                        <div className="act-metric-item">
                            <span className="act-metric-val" style={{ color: activeDaysCount > 0 ? '#22c55e' : '#94a3b8' }}>
                                {activeDaysCount > 20 ? 'High' : activeDaysCount > 0 ? 'Moderate' : 'Idle'}
                            </span>
                            <span className="act-metric-lbl">Activity Rating</span>
                        </div>
                    </div>

                    {/* 365-Day Contribution Heatmap Grid */}
                    <Heatmap activity={activityMap} />

                    <div className="up-heatmap-legend">
                        <span>Less Active</span>
                        {[0,1,2,3,4].map(l => <div key={l} className={`up-heatmap-day level-${l}`} />)}
                        <span>More Active</span>
                    </div>

                    {/* Activity Stream Feed */}
                    <div className="up-activity-feed">
                        <div className="feed-title">
                            <Clock size={14} />
                            <span>Recent Activity Stream</span>
                        </div>

                        {recentActivities.length > 0 ? (
                            <div className="feed-list">
                                {recentActivities.map(([date, xp], idx) => (
                                    <div key={idx} className="feed-item">
                                        <div className="feed-icon-wrap">
                                            <CheckCircle2 size={15} className="feed-icon" />
                                        </div>
                                        <div className="feed-details">
                                            <span className="feed-action">Coding Activity & Match Contribution</span>
                                            <span className="feed-date">{new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        <span className="feed-xp-badge">+{xp} XP</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="feed-empty-state">
                                <Activity size={24} className="empty-feed-icon" />
                                <div className="empty-feed-text">
                                    <strong>No Activity Logs Recorded Yet</strong>
                                    <p>Operative <span>{profile.username}</span> has not recorded any coding submissions or arena battles yet. Standing by for future activity.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── Skill Mastery Matrix Section ── */}
                <motion.div 
                    className="up-section skills-section"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="up-section-hdr">
                        <div className="up-hdr-left">
                            <Award size={18} className="hdr-icon" />
                            <h3>Skill Mastery & Programming Runtimes</h3>
                        </div>
                    </div>

                    <div className="up-skills-grid">
                        {SKILL_META.map(skill => {
                            const val = profile.skills?.[skill.key] || 0;
                            const pct = Math.min(100, Math.round((val / skill.max) * 100));
                            const SkillIcon = skill.icon;
                            return (
                                <div key={skill.key} className="up-skill-card">
                                    <div className="skill-head">
                                        <div className="skill-icon-badge" style={{ color: skill.color, background: `${skill.color}18`, borderColor: `${skill.color}40` }}>
                                            <SkillIcon size={16} />
                                        </div>
                                        <span className="skill-label">{skill.label}</span>
                                        <span className="skill-pct" style={{ color: skill.color }}>{pct}%</span>
                                    </div>
                                    <div className="skill-bar-wrap">
                                        <div className="skill-bar-fill" style={{ width: `${pct}%`, background: skill.color }} />
                                    </div>
                                    <div className="skill-foot">
                                        <span>Level {val}</span>
                                        <span>{val} / {skill.max} Points</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

            </div>
        </div>
    );
}
