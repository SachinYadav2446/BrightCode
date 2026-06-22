import API_URL from '../config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { initSocket } from '../socket';
import { Link } from 'react-router-dom';
import {
    Flame, Lightbulb, Code2, HelpCircle, Trophy,
    Send, X, ChevronDown, MessageSquare, Trash2,
    RefreshCw, Sparkles, Heart, Image, Zap, Star,
    TrendingUp, Users, BookOpen
} from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.min.css';
import './CodeFeed.css';

const API = API_URL;

const POST_TYPES = [
    { id: 'til',       label: 'TIL',           icon: Lightbulb, color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
    { id: 'roast',     label: 'Roast My Code', icon: Flame,     color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { id: 'challenge', label: 'Challenge',     icon: Code2,     color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
    { id: 'flex',      label: 'Flex',          icon: Trophy,    color: '#eab308', bg: 'rgba(234,179,8,0.1)'  },
    { id: 'ask',       label: 'Ask',           icon: HelpCircle,color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
];

const LANGS = ['javascript','python','java','cpp','c','typescript','go','rust','sql','bash'];
const typeInfo = (id) => POST_TYPES.find(t => t.id === id) || POST_TYPES[0];

const timeAgo = (ts) => {
    const s = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (s < 60)    return `${s}s ago`;
    if (s < 3600)  return `${Math.floor(s/60)}m ago`;
    if (s < 86400) return `${Math.floor(s/3600)}h ago`;
    return `${Math.floor(s/86400)}d ago`;
};

const getLevel = (xp) => {
    if (xp >= 10000) return { label: 'Grandmaster', color: '#ef4444', icon: '👑' };
    if (xp >= 5000)  return { label: 'Expert',      color: '#a855f7', icon: '⚡' };
    if (xp >= 2000)  return { label: 'Advanced',    color: '#3b82f6', icon: '🔷' };
    if (xp >= 500)   return { label: 'Apprentice',  color: '#22c55e', icon: '🌱' };
    return                  { label: 'Novice',      color: '#6b7280', icon: '🔹' };
};

/* ── Avatar ── */
const AVATAR_COLORS = ['#ef4444','#f97316','#eab308','#22c55e','#3b82f6','#a855f7','#ec4899'];
function getAvatarColor(name = '') {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function Avatar({ username, size = 40 }) {
    const color = getAvatarColor(username);
    return (
        <div className="cf-avatar" style={{
            width: size, height: size,
            fontSize: size * 0.38,
            background: `${color}18`,
            border: `2px solid ${color}40`,
            color,
        }}>
            {username?.charAt(0).toUpperCase() || '?'}
        </div>
    );
}

/* ── Syntax-highlighted code block ── */
function CodeBlock({ code, lang }) {
    const ref = useRef(null);
    useEffect(() => {
        if (!ref.current) return;
        ref.current.removeAttribute('data-highlighted');
        try { hljs.highlightElement(ref.current); } catch (_) {}
    }, [code, lang]);
    return (
        <div className="cf-code-wrap">
            <div className="cf-code-header">
                <div className="cf-code-dots">
                    <span /><span /><span />
                </div>
                <span className="cf-code-lang">{lang}</span>
            </div>
            <pre><code ref={ref} className={`language-${lang}`}>{code}</code></pre>
        </div>
    );
}

/* ── Composer ── */
function Composer({ onPost, user }) {
    const [body, setBody]           = useState('');
    const [type, setType]           = useState('til');
    const [title, setTitle]         = useState('');
    const [code, setCode]           = useState('');
    const [lang, setLang]           = useState('javascript');
    const [showCode, setShowCode]   = useState(false);
    const [expanded, setExpanded]   = useState(false);
    const [posting, setPosting]     = useState(false);
    const taRef = useRef(null);

    const reset = () => {
        setBody(''); setTitle(''); setCode('');
        setShowCode(false); setExpanded(false); setType('til');
    };

    const submit = async () => {
        if (!body.trim() || posting) return;
        setPosting(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API}/feed`,
                { type, title: title || null, body, code: code || null, lang },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onPost(data);
            reset();
        } catch (e) { console.error(e); }
        finally { setPosting(false); }
    };

    const selType = typeInfo(type);

    return (
        <div className="cf-composer">
            {/* Top row: avatar + input */}
            <div className="cf-composer-row">
                <Avatar username={user?.username} size={44} />
                <div className="cf-composer-field" onClick={() => { setExpanded(true); taRef.current?.focus(); }}>
                    <textarea
                        ref={taRef}
                        className="cf-composer-ta"
                        placeholder={`What's on your mind, ${user?.username?.split(' ')[0] || 'dev'}?`}
                        value={body}
                        onChange={e => { setBody(e.target.value); setExpanded(true); }}
                        onFocus={() => setExpanded(true)}
                        rows={expanded ? 3 : 1}
                    />
                </div>
            </div>

            <AnimatePresence>
            {expanded && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                >
                    <div className="cf-composer-expanded">
                        {/* Optional title */}
                        <input
                            className="cf-composer-title-input"
                            placeholder="Add a title (optional)"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            maxLength={120}
                        />

                        {/* Type selector */}
                        <div className="cf-type-selector">
                            <span className="cf-type-label">Post as</span>
                            <div className="cf-type-pills">
                                {POST_TYPES.map(t => (
                                    <button
                                        key={t.id}
                                        type="button"
                                        className={`cf-type-pill ${type === t.id ? 'active' : ''}`}
                                        style={type === t.id ? {
                                            color: t.color,
                                            borderColor: t.color,
                                            background: t.bg,
                                        } : {}}
                                        onClick={() => {
                                            setType(t.id);
                                            if (t.id === 'roast' || t.id === 'challenge') setShowCode(true);
                                        }}
                                    >
                                        <t.icon size={12} />
                                        {t.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Code block */}
                        {showCode ? (
                            <div className="cf-code-editor-wrap">
                                <div className="cf-ce-header">
                                    <select className="cf-lang-select" value={lang} onChange={e => setLang(e.target.value)}>
                                        {LANGS.map(l => <option key={l}>{l}</option>)}
                                    </select>
                                    <button type="button" className="cf-ce-remove" onClick={() => { setShowCode(false); setCode(''); }}>
                                        <X size={13} /> Remove code
                                    </button>
                                </div>
                                <textarea
                                    className="cf-ce-input"
                                    placeholder="// paste your code here…"
                                    value={code}
                                    onChange={e => setCode(e.target.value)}
                                    rows={8}
                                    spellCheck={false}
                                />
                            </div>
                        ) : (
                            <button type="button" className="cf-add-snippet" onClick={() => setShowCode(true)}>
                                <Code2 size={14} />
                                <span>Attach code snippet</span>
                            </button>
                        )}

                        {/* Footer actions */}
                        <div className="cf-composer-footer">
                            <span className="cf-xp-badge">
                                <Sparkles size={12} />
                                +10 XP for posting
                            </span>
                            <div className="cf-composer-btns">
                                <button className="cf-btn-cancel" onClick={reset}>Discard</button>
                                <button
                                    className="cf-btn-post"
                                    disabled={posting || !body.trim()}
                                    onClick={submit}
                                >
                                    {posting
                                        ? <RefreshCw size={14} className="cf-spin" />
                                        : <><Send size={14} /> Post</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}

/* ── Comments ── */
function Comments({ postId, count, user }) {
    const [open, setOpen]         = useState(false);
    const [comments, setComments] = useState([]);
    const [loaded, setLoaded]     = useState(false);
    const [body, setBody]         = useState('');
    const [sending, setSending]   = useState(false);
    const inputRef                = useRef(null);

    const load = async () => {
        if (loaded) return;
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API}/feed/${postId}/comments`,
                { headers: { Authorization: `Bearer ${token}` } });
            setComments(data);
            setLoaded(true);
        } catch (_) {}
    };

    const toggle = () => {
        const next = !open;
        setOpen(next);
        if (next) { load(); setTimeout(() => inputRef.current?.focus(), 300); }
    };

    const submit = async (e) => {
        e.preventDefault();
        if (!body.trim()) return;
        setSending(true);
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API}/feed/${postId}/comments`,
                { body }, { headers: { Authorization: `Bearer ${token}` } });
            setComments(prev => [...prev, data]);
            setBody('');
        } catch (_) {}
        finally { setSending(false); }
    };

    return (
        <div className="cf-comments">
            <button className={`cf-action-btn ${open ? 'active-action' : ''}`} onClick={toggle}>
                <MessageSquare size={15} />
                <span>{count > 0 ? count : ''} Comment{count !== 1 && count > 0 ? 's' : count === 0 ? '' : ''}</span>
            </button>

            <AnimatePresence>
            {open && (
                <motion.div
                    className="cf-comment-panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                >
                    {comments.length === 0 && (
                        <p className="cf-no-comments">No comments yet — be the first.</p>
                    )}
                    {comments.map(c => (
                        <div key={c.id} className="cf-comment-row">
                            <Avatar username={c.author_username} size={30} />
                            <div className="cf-comment-box">
                                <div className="cf-comment-top">
                                    <Link to={`/u/${c.author_username}`} className="cf-cmt-name">{c.author_username}</Link>
                                    <span className="cf-cmt-time">{timeAgo(c.created_at)}</span>
                                </div>
                                <p>{c.body}</p>
                            </div>
                        </div>
                    ))}

                    <form className="cf-reply-form" onSubmit={submit}>
                        <Avatar username={user?.username} size={30} />
                        <div className="cf-reply-input-wrap">
                            <input
                                ref={inputRef}
                                placeholder="Write a comment…"
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                maxLength={500}
                            />
                            <button type="submit" className="cf-reply-send" disabled={sending || !body.trim()}>
                                {sending ? <RefreshCw size={13} className="cf-spin" /> : <Send size={13} />}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
            </AnimatePresence>
        </div>
    );
}

/* ── Post Card ── */
function PostCard({ post, user, onDelete }) {
    const t           = typeInfo(post.type);
    const level       = getLevel(post.xp_at_post || 0);
    const isOwn       = String(post.author_id) === String(user?.id);

    const [liked, setLiked]               = useState((post.my_reactions || []).includes('fire'));
    const [likeCount, setLikeCount]       = useState(post.reactions?.fire || 0);
    const [commentCount, setCommentCount] = useState(post.comment_count || 0);
    const [deleting, setDeleting]         = useState(false);

    useEffect(() => { setCommentCount(post.comment_count || 0); }, [post.comment_count]);
    useEffect(() => { setLikeCount(post.reactions?.fire || 0); }, [post.reactions?.fire]);

    const toggleLike = async () => {
        const next = !liked;
        setLiked(next);
        setLikeCount(n => next ? n + 1 : Math.max(0, n - 1));
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API}/feed/${post.id}/react`, { reaction: 'fire' },
                { headers: { Authorization: `Bearer ${token}` } });
        } catch (_) {
            setLiked(!next);
            setLikeCount(n => next ? Math.max(0, n - 1) : n + 1);
        }
    };

    const handleDelete = async () => {
        setDeleting(true);
        await onDelete(post.id);
    };

    return (
        <motion.article
            className="cf-post"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, scale: 0.97 }}
            layout
        >
            {/* Coloured left accent bar */}
            <div className="cf-post-accent" style={{ background: t.color }} />

            {/* Post header */}
            <div className="cf-post-head">
                <Link to={`/u/${post.author_username}`} className="cf-author-link">
                    <Avatar username={post.author_username} size={42} />
                    <div className="cf-author-meta">
                        <span className="cf-author-name">{post.author_username}</span>
                        <div className="cf-author-sub">
                            <span style={{ color: level.color }} className="cf-level-badge">
                                {level.icon} {level.label}
                            </span>
                            <span className="cf-sep">·</span>
                            <span className="cf-post-ts">{timeAgo(post.created_at)}</span>
                        </div>
                    </div>
                </Link>

                <div className="cf-post-head-right">
                    {/* Type chip */}
                    <span className="cf-type-chip" style={{ color: t.color, background: t.bg, borderColor: `${t.color}35` }}>
                        <t.icon size={11} />
                        {t.label}
                    </span>
                    {isOwn && (
                        <button
                            className={`cf-delete-btn ${deleting ? 'deleting' : ''}`}
                            onClick={handleDelete}
                            title="Delete post"
                            disabled={deleting}
                        >
                            {deleting ? <RefreshCw size={13} className="cf-spin" /> : <Trash2 size={13} />}
                        </button>
                    )}
                </div>
            </div>

            {/* Post content */}
            <div className="cf-post-content">
                {post.title && <h3 className="cf-post-h3">{post.title}</h3>}
                <p className="cf-post-body">{post.body}</p>
                {post.code && <CodeBlock code={post.code} lang={post.lang || 'javascript'} />}
            </div>

            {/* Stats bar */}
            {(likeCount > 0 || commentCount > 0) && (
                <div className="cf-post-stats">
                    {likeCount > 0 && (
                        <span className="cf-stat-item">
                            <Heart size={12} style={{ fill: '#ef4444', color: '#ef4444' }} /> {likeCount}
                        </span>
                    )}
                    {commentCount > 0 && (
                        <span className="cf-stat-item">
                            <MessageSquare size={12} /> {commentCount} comment{commentCount !== 1 ? 's' : ''}
                        </span>
                    )}
                </div>
            )}

            {/* Action bar */}
            <div className="cf-post-actions">
                <button
                    className={`cf-action-btn ${liked ? 'liked' : ''}`}
                    onClick={toggleLike}
                >
                    <Heart size={16} className={liked ? 'cf-heart-on' : ''} />
                    <span>{liked ? 'Liked' : 'Like'}</span>
                </button>

                <Comments postId={post.id} count={commentCount} user={user} />

                <button className="cf-action-btn cf-share-btn">
                    <Zap size={15} />
                    <span>XP: {post.xp_at_post}</span>
                </button>
            </div>
        </motion.article>
    );
}

/* ── Main Page ── */
export default function CodeFeed() {
    const { user }                      = useAuth();
    const [posts, setPosts]             = useState([]);
    const [loading, setLoading]         = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [hasMore, setHasMore]         = useState(true);
    const [activeFilter, setActiveFilter] = useState('all');
    const socketRef   = useRef(null);
    const observerRef = useRef(null);
    const bottomRef   = useRef(null);

    const authHeader = useCallback(() => ({
        headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` }
    }), [user?.token]);

    const fetchPosts = useCallback(async (cursor = null) => {
        if (!cursor) setLoading(true); else setLoadingMore(true);
        try {
            const p = new URLSearchParams({ limit: '20' });
            if (cursor) p.set('cursor', cursor);
            const { data } = await axios.get(`${API}/feed?${p}`, authHeader());
            if (!cursor) setPosts(data);
            else setPosts(prev => {
                const ids = new Set(prev.map(x => x.id));
                return [...prev, ...data.filter(x => !ids.has(x.id))];
            });
            setHasMore(data.length === 20);
        } catch (e) { console.error(e); }
        finally { setLoading(false); setLoadingMore(false); }
    }, [authHeader]);

    useEffect(() => { fetchPosts(); }, []);

    /* infinite scroll */
    useEffect(() => {
        if (!bottomRef.current) return;
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loadingMore) {
                const last = posts[posts.length - 1];
                if (last) fetchPosts(new Date(last.created_at).getTime());
            }
        }, { threshold: 0.1 });
        observerRef.current.observe(bottomRef.current);
        return () => observerRef.current?.disconnect();
    }, [posts, hasMore, loadingMore, fetchPosts]);

    /* real-time */
    useEffect(() => {
        if (!user?.id) return;
        const socket = initSocket();
        socketRef.current = socket;
        socket.on('feed:new_post',    post => {
            if (String(post.author_id) === String(user.id)) return;
            setPosts(prev => prev.find(p => p.id === post.id) ? prev : [post, ...prev]);
        });
        socket.on('feed:reaction',    ({ postId, reactions }) =>
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, reactions } : p)));
        socket.on('feed:new_comment', ({ postId }) =>
            setPosts(prev => prev.map(p => p.id === postId ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p)));
        socket.on('feed:delete_post', ({ postId }) =>
            setPosts(prev => prev.filter(p => p.id !== postId)));
        return () => {
            socket.off('feed:new_post');
            socket.off('feed:reaction');
            socket.off('feed:new_comment');
            socket.off('feed:delete_post');
        };
    }, [user?.id]);

    const handlePost   = p  => setPosts(prev => [p, ...prev]);
    const handleDelete = async (id) => {
        try {
            await axios.delete(`${API}/feed/${id}`, authHeader());
            setPosts(prev => prev.filter(p => p.id !== id));
        } catch (_) {}
    };

    const filtered = activeFilter === 'all' ? posts : posts.filter(p => p.type === activeFilter);

    return (
        <div className="cf-page">
            {/* ── Page hero ── */}
            <div className="cf-page-hero">
                <div className="cf-hero-glow" />
                <div className="cf-hero-content">
                    <div className="cf-hero-eyebrow">
                        <span className="cf-eyebrow-dot" />
                        LIVE FEED
                    </div>
                    <h1 className="cf-hero-h1">
                        Code<span className="cf-hero-accent">Feed</span>
                    </h1>
                    <p className="cf-hero-desc">
                        The community brain dump — share discoveries, get roasted, flex wins, solve puzzles.
                    </p>
                    <div className="cf-hero-stats">
                        <span><Users size={14} /> {posts.length} posts</span>
                        <span><TrendingUp size={14} /> Real-time</span>
                        <span><Zap size={14} /> +10 XP per post</span>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className="cf-body">
                {/* Feed column */}
                <div className="cf-feed-col">
                    {/* Composer */}
                    <Composer onPost={handlePost} user={user} />

                    {/* Filter strip */}
                    <div className="cf-filter-strip">
                        <button
                            className={`cf-filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                        >
                            <Star size={12} /> All
                        </button>
                        {POST_TYPES.map(t => (
                            <button
                                key={t.id}
                                className={`cf-filter-pill ${activeFilter === t.id ? 'active' : ''}`}
                                style={activeFilter === t.id ? { color: t.color, borderColor: t.color, background: t.bg } : {}}
                                onClick={() => setActiveFilter(activeFilter === t.id ? 'all' : t.id)}
                            >
                                <t.icon size={12} /> {t.label}
                            </button>
                        ))}
                    </div>

                    {/* Posts */}
                    {loading ? (
                        <div className="cf-skeleton-list">
                            {[120, 180, 140, 160].map((h, i) => (
                                <div key={i} className="cf-skeleton" style={{ height: h }} />
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="cf-empty-state">
                            <div className="cf-empty-icon">
                                <BookOpen size={32} />
                            </div>
                            <p>{activeFilter === 'all' ? 'No posts yet' : `No ${typeInfo(activeFilter).label} posts yet`}</p>
                            <span>Be the first to share something</span>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filtered.map(p => (
                                <PostCard key={p.id} post={p} user={user} onDelete={handleDelete} />
                            ))}
                        </AnimatePresence>
                    )}

                    {loadingMore && (
                        <div className="cf-load-more">
                            <div className="cf-spinner" />
                        </div>
                    )}
                    <div ref={bottomRef} style={{ height: 1 }} />
                </div>

                {/* Sidebar */}
                <aside className="cf-sidebar">
                    <div className="cf-sidebar-block">
                        <h4><Zap size={14} /> Post types</h4>
                        {POST_TYPES.map(t => (
                            <button
                                key={t.id}
                                className="cf-sidebar-type-row"
                                onClick={() => setActiveFilter(t.id)}
                            >
                                <span className="cf-sb-icon" style={{ color: t.color, background: t.bg }}>
                                    <t.icon size={14} />
                                </span>
                                <div>
                                    <strong>{t.label}</strong>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="cf-sidebar-block cf-xp-block">
                        <Sparkles size={20} color="#eab308" />
                        <div>
                            <strong>Earn XP by posting</strong>
                            <p>Every post gives you +10 XP towards your rank.</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
