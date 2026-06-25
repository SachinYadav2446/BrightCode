import API_URL from '../config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { initSocket } from '../socket';
import { Link } from 'react-router-dom';
import {
    Flame, Lightbulb, Code2, HelpCircle, Trophy,
    X, MessageSquare, Trash2,
    RefreshCw, Sparkles, Zap,
    Users, BookOpen, Search,
    Heart, Copy, Check,
    Hash, Terminal
} from 'lucide-react';
import hljs from 'highlight.js';
import 'highlight.js/styles/atom-one-dark.min.css';
import './CodeFeed.css';

const API = API_URL;
const MAX_CHARS = 500;

const POST_TYPES = [
    { id: 'til',       label: 'TIL',           icon: Lightbulb, color: '#22c55e', bg: 'rgba(34,197,94,0.1)'  },
    { id: 'roast',     label: 'Roast My Code', icon: Flame,     color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
    { id: 'challenge', label: 'Challenge',     icon: Code2,     color: '#a855f7', bg: 'rgba(168,85,247,0.1)' },
    { id: 'flex',      label: 'Flex',          icon: Trophy,    color: '#eab308', bg: 'rgba(234,179,8,0.1)'  },
    { id: 'ask',       label: 'Ask',           icon: HelpCircle,color: '#38bdf8', bg: 'rgba(56,189,248,0.1)' },
];

// All 5 backend reactions — styled with SVG icons, NO plain emojis
const REACTIONS = [
    { id: 'fire',    label: '🔥', title: 'Fire',     activeColor: '#f97316' },
    { id: 'clever',  label: '💡', title: 'Clever',   activeColor: '#eab308' },
    { id: 'bigbrain',label: '🧠', title: 'Big Brain',activeColor: '#a855f7' },
    { id: 'brute',   label: '⚡', title: 'Brute',    activeColor: '#38bdf8' },
    { id: 'cursed',  label: '💀', title: 'Cursed',   activeColor: '#ef4444' },
];

const LANGS = ['javascript','python','java','cpp','c','typescript','go','rust','sql','bash','ruby','swift','kotlin'];

const typeInfo = (id) => POST_TYPES.find(t => t.id === id) || POST_TYPES[0];

const timeAgo = (ts) => {
    const s = Math.floor((Date.now() - new Date(ts)) / 1000);
    if (s < 60)    return `${s}s`;
    if (s < 3600)  return `${Math.floor(s/60)}m`;
    if (s < 86400) return `${Math.floor(s/3600)}h`;
    return `${Math.floor(s/86400)}d`;
};

const getLevel = (xp) => {
    if (xp >= 10000) return { label: 'Grandmaster', color: '#ef4444' };
    if (xp >= 5000)  return { label: 'Expert',      color: '#a855f7' };
    if (xp >= 2000)  return { label: 'Advanced',    color: '#3b82f6' };
    if (xp >= 500)   return { label: 'Apprentice',  color: '#22c55e' };
    return                  { label: 'Novice',      color: '#6b7280' };
};

// Parse hashtags from text
function parseBody(text, onHashtagClick) {
    if (!text) return null;
    const parts = text.split(/(#[\w]+)/g);
    return parts.map((part, i) => {
        if (/^#[\w]+$/.test(part)) {
            return (
                <span
                    key={i}
                    className="df-hashtag"
                    onClick={(e) => { e.stopPropagation(); onHashtagClick && onHashtagClick(part); }}
                >
                    {part}
                </span>
            );
        }
        return part;
    });
}

function extractHashtags(text) {
    return [...(text.match(/#[\w]+/g) || [])];
}

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
        <div className="df-avatar" style={{
            width: size, height: size,
            fontSize: size * 0.4,
            background: `${color}18`,
            border: `2px solid ${color}40`,
            color,
        }}>
            {username?.charAt(0).toUpperCase() || '?'}
        </div>
    );
}

/* ── Circular Character Counter ── */
function CharRing({ count, max }) {
    const pct = Math.min(count / max, 1);
    const r = 14;
    const circ = 2 * Math.PI * r;
    const dash = circ * pct;
    const remaining = max - count;
    const warn = count >= max * 0.8;
    const danger = count >= max * 0.95;
    const strokeColor = danger ? '#ef4444' : warn ? '#f97316' : '#1d9bf0';
    if (count === 0) return null;
    return (
        <div className="df-char-ring">
            <svg width="32" height="32" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r={r} fill="none" stroke="#1e1e1e" strokeWidth="2.5" />
                <circle
                    cx="18" cy="18" r={r}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.5"
                    strokeDasharray={`${dash} ${circ}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dasharray 0.15s, stroke 0.25s' }}
                />
            </svg>
            {danger && (
                <span className={`df-char-ring-label danger`}>
                    {remaining}
                </span>
            )}
        </div>
    );
}

/* ── Code Block with Copy ── */
function CodeBlock({ code, lang }) {
    const ref = useRef(null);
    const [copied, setCopied] = useState(false);
    useEffect(() => {
        if (!ref.current) return;
        ref.current.removeAttribute('data-highlighted');
        try { hljs.highlightElement(ref.current); } catch (_) {}
    }, [code, lang]);

    const handleCopy = (e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(code).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="df-code-block" onClick={e => e.stopPropagation()}>
            <div className="df-code-block-header">
                <div className="df-code-dots"><span /><span /><span /></div>
                <span className="df-code-lang-label">{lang}</span>
                <button className={`df-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
                    {copied ? <><Check size={11} /> Copied!</> : <><Copy size={11} /> Copy</>}
                </button>
            </div>
            <pre><code ref={ref} className={`language-${lang}`}>{code}</code></pre>
        </div>
    );
}


/* ── Comments (Twitter thread style) ── */
function Comments({ postId, count, user, isOpen, setIsOpen }) {
    const [comments, setComments]   = useState([]);
    const [loaded, setLoaded]       = useState(false);
    const [body, setBody]           = useState('');
    const [sending, setSending]     = useState(false);
    const inputRef                  = useRef(null);

    const load = useCallback(async () => {
        if (loaded) return;
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.get(`${API}/feed/${postId}/comments`,
                { headers: { Authorization: `Bearer ${token}` } });
            setComments(data);
            setLoaded(true);
        } catch (_) {}
    }, [loaded, postId]);

    useEffect(() => {
        if (isOpen) { load(); setTimeout(() => inputRef.current?.focus(), 300); }
    }, [isOpen]);

    const submit = async (e) => {
        e.preventDefault();
        e.stopPropagation();
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
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="df-comments-panel"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    style={{ overflow: 'hidden' }}
                    onClick={e => e.stopPropagation()}
                >
                    {comments.length === 0 && loaded && (
                        <p className="df-no-comments">No replies yet — start the conversation</p>
                    )}

                    {comments.map((c, i) => (
                        <div key={c.id} className="df-comment-item">
                            <Avatar username={c.author_username} size={32} />
                            <div className="df-comment-main">
                                <div className="df-comment-header">
                                    <Link
                                        to={`/u/${c.author_username}`}
                                        className="df-comment-author"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        {c.author_username}
                                    </Link>
                                    <span className="df-comment-handle">@{c.author_username}</span>
                                    <span className="df-comment-time">· {timeAgo(c.created_at)}</span>
                                </div>
                                <p className="df-comment-body">{c.body}</p>
                            </div>
                        </div>
                    ))}

                    <form className="df-reply-row" onSubmit={submit}>
                        <Avatar username={user?.username} size={32} />
                        <div className="df-reply-input-wrap">
                            <input
                                ref={inputRef}
                                placeholder="Write a reply…"
                                value={body}
                                onChange={e => setBody(e.target.value)}
                                maxLength={280}
                            />
                            <button type="submit" className="df-reply-send" disabled={sending || !body.trim()}>
                                {sending ? <RefreshCw size={13} className="df-spin-inline" /> : 'Reply'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

/* ── Quote Post Card ── */
function QuoteCard({ quote }) {
    if (!quote) return null;
    return (
        <div className="df-quote-card">
            <div className="df-quote-header">
                <Avatar username={quote.author_username} size={20} />
                <Link to={`/u/${quote.author_username}`} className="df-quote-author" onClick={e => e.stopPropagation()}>
                    {quote.author_username}
                </Link>
                <span className="df-quote-handle">@{quote.author_username}</span>
            </div>
            {quote.title && <p style={{ fontSize: '0.82rem', fontWeight: 700, color: '#ccc', margin: '0 0 4px' }}>{quote.title}</p>}
            <p className="df-quote-body">{quote.body}</p>
        </div>
    );
}

/* ── Post Card ── */
function PostCard({ post, user, onDelete, onHashtagClick, showThread = false }) {
    const t         = typeInfo(post.type);
    const level     = getLevel(post.xp_at_post || 0);
    const isOwn     = String(post.author_id) === String(user?.id);

    const [myReactions, setMyReactions]   = useState(post.my_reactions || []);
    const [reactions, setReactions]       = useState(post.reactions || {});
    const [commentCount, setCommentCount] = useState(post.comment_count || 0);
    const [deleting, setDeleting]         = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);

    useEffect(() => { setCommentCount(post.comment_count || 0); }, [post.comment_count]);
    useEffect(() => { setReactions(post.reactions || {}); }, [post.reactions]);

    const handleReact = async (reactionId) => {
        const wasActive = myReactions.includes(reactionId);
        // Optimistic update
        setMyReactions(prev => wasActive ? prev.filter(r => r !== reactionId) : [...prev, reactionId]);
        setReactions(prev => ({
            ...prev,
            [reactionId]: Math.max(0, (prev[reactionId] || 0) + (wasActive ? -1 : 1))
        }));
        try {
            const token = localStorage.getItem('token');
            const { data } = await axios.post(`${API}/feed/${post.id}/react`,
                { reaction: reactionId },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setReactions(data.reactions);
            setMyReactions(data.my_reactions);
        } catch (_) {
            // Rollback
            setMyReactions(prev => wasActive ? [...prev, reactionId] : prev.filter(r => r !== reactionId));
            setReactions(prev => ({
                ...prev,
                [reactionId]: Math.max(0, (prev[reactionId] || 0) + (wasActive ? 1 : -1))
            }));
        }
    };

    const handleDelete = async (e) => {
        e.stopPropagation();
        setDeleting(true);
        await onDelete(post.id);
    };

    // Try to parse quote post
    let quoteData = null;
    if (post.title?.startsWith('__QUOTE__')) {
        try { quoteData = JSON.parse(post.body.slice('__QUOTE_BODY__'.length)); } catch (_) {}
    }

    const totalReactsCount = Object.keys(reactions)
        .filter(k => k !== '_user_map')
        .reduce((sum, k) => sum + (reactions[k] || 0), 0);

    return (
        <motion.article
            className="df-post"
            data-type={post.type}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            layout
        >
            {/* Post inner — type header + content */}
            <div className="df-post-inner">

                {/* ── Type badge row ── */}
                <div className="df-post-type-row">
                    <span
                        className="df-post-type-badge"
                        style={{ color: t.color, background: `${t.color}14`, borderLeft: `3px solid ${t.color}` }}
                    >
                        <t.icon size={11} />
                        {t.label}
                    </span>
                    <div className="df-post-meta-top">
                        <span className="df-post-time-top">{timeAgo(post.created_at)}</span>
                        {isOwn && (
                            <button
                                className="df-delete-btn"
                                onClick={handleDelete}
                                disabled={deleting}
                                title="Delete post"
                            >
                                {deleting ? <RefreshCw size={12} className="df-spin-inline" /> : <Trash2 size={12} />}
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Title ── */}
                {post.title && !post.title.startsWith('__QUOTE__') && (
                    <h3 className="df-post-title">{post.title}</h3>
                )}

                {/* ── Body ── */}
                {quoteData ? (
                    <>
                        <p className="df-post-body">{post.body.split('\n')[0]}</p>
                        <QuoteCard quote={quoteData} />
                    </>
                ) : (
                    <p className="df-post-body">
                        {parseBody(post.body, onHashtagClick)}
                    </p>
                )}

                {/* ── Code block as hero ── */}
                {post.code && <CodeBlock code={post.code} lang={post.lang || 'javascript'} />}
            </div>

            {/* ── Footer: author left · actions right ── */}
            <div className="df-post-footer">
                <Link
                    to={`/u/${post.author_username}`}
                    className="df-post-author-link"
                    onClick={e => e.stopPropagation()}
                >
                    <Avatar username={post.author_username} size={30} />
                    <div className="df-post-author-info">
                        <span className="df-post-author-name">{post.author_username}</span>
                        <div className="df-post-author-sub">
                            <span className="df-post-level-dot" style={{ background: level.color }} />
                            <span className="df-post-level-text" style={{ color: level.color }}>{level.label}</span>
                            <span className="df-post-time-footer">· {post.xp_at_post} XP</span>
                        </div>
                    </div>
                </Link>

                <div className="df-actions">
                    <button
                        className={`df-action comment ${commentsOpen ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setCommentsOpen(v => !v); }}
                        title="Discuss"
                    >
                        <MessageSquare size={15} />
                        {commentCount > 0 && <span>{commentCount}</span>}
                    </button>

                    <button
                        className={`df-action like ${myReactions.includes('clever') ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); handleReact('clever'); }}
                        title={myReactions.includes('clever') ? 'Unlike' : 'Like'}
                    >
                        <Terminal size={15} />
                        {totalReactsCount > 0 && <span>{totalReactsCount}</span>}
                    </button>

                    <button className="df-action xp" title="XP earned">
                        <Zap size={14} />
                    </button>
                </div>
            </div>

            {/* ── Comments panel ── */}
            <Comments
                postId={post.id}
                count={commentCount}
                user={user}
                isOpen={commentsOpen}
                setIsOpen={setCommentsOpen}
            />
        </motion.article>
    );
}

/* ── Composer ── */
function Composer({ onPost, user, quotePost = null, onQuoteDone = null }) {
    const [body, setBody]         = useState('');
    const [type, setType]         = useState('til');
    const [title, setTitle]       = useState('');
    const [code, setCode]         = useState('');
    const [lang, setLang]         = useState('javascript');
    const [showCode, setShowCode] = useState(false);
    const [posting, setPosting]   = useState(false);
    const taRef                   = useRef(null);

    const reset = () => {
        setBody(''); setTitle(''); setCode(''); setShowCode(false); setType('til');
        if (onQuoteDone) onQuoteDone();
    };

    const submit = async () => {
        if (!body.trim() || posting) return;
        setPosting(true);
        try {
            const token = localStorage.getItem('token');
            let postTitle = title || null;
            let postBody  = body;
            if (quotePost) {
                postTitle = `__QUOTE__`;
                postBody  = `${body}\n__QUOTE_BODY__${JSON.stringify({
                    id: quotePost.id,
                    author_username: quotePost.author_username,
                    title: quotePost.title,
                    body: quotePost.body.slice(0, 200),
                })}`;
            }
            const { data } = await axios.post(`${API}/feed`,
                { type, title: postTitle, body: postBody, code: code || null, lang },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onPost(data);
            reset();
        } catch (e) { console.error(e); }
        finally { setPosting(false); }
    };

    const remaining = MAX_CHARS - body.length;
    const overLimit = remaining < 0;

    return (
        <div className="df-composer">
            <div className="df-composer-header">
                <Avatar username={user?.username} size={28} />
                <span className="df-composer-username">{user?.username || 'dev'}</span>
                <span className="df-composer-meta">is sharing a post</span>
            </div>

            <textarea
                ref={taRef}
                className="df-composer-ta"
                placeholder={quotePost ? 'Add a comment…' : `What's on your mind, ${user?.username?.split(' ')[0] || 'dev'}?`}
                value={body}
                onChange={e => setBody(e.target.value.slice(0, MAX_CHARS + 10))}
                rows={3}
            />

            {/* Quote preview */}
            {quotePost && (
                <div style={{ marginBottom: 10 }}>
                    <QuoteCard quote={quotePost} />
                </div>
            )}

            <div className="df-composer-extras">
                {/* Type chips */}
                <div className="df-type-row">
                    <span className="df-type-label">Post as</span>
                    {POST_TYPES.map(t => (
                        <button
                            key={t.id}
                            type="button"
                            className={`df-type-chip ${type === t.id ? 'active' : ''}`}
                            style={type === t.id ? { color: t.color, borderColor: t.color, background: t.bg } : {}}
                            onClick={() => { setType(t.id); if (t.id === 'roast' || t.id === 'challenge') setShowCode(true); }}
                        >
                            <t.icon size={11} />
                            {t.label}
                        </button>
                    ))}
                </div>

                {/* Code */}
                {showCode ? (
                    <div className="df-snippet-wrap">
                        <div className="df-snippet-header">
                            <select className="df-lang-select" value={lang} onChange={e => setLang(e.target.value)}>
                                {LANGS.map(l => <option key={l}>{l}</option>)}
                            </select>
                            <button className="df-snippet-remove" type="button" onClick={() => { setShowCode(false); setCode(''); }}>
                                <X size={12} /> Remove
                            </button>
                        </div>
                        <textarea
                            className="df-snippet-ta"
                            placeholder="// paste your code here…"
                            value={code}
                            onChange={e => setCode(e.target.value)}
                            rows={6}
                            spellCheck={false}
                        />
                    </div>
                ) : (
                    <button type="button" className="df-add-snippet-btn" onClick={() => setShowCode(true)}>
                        <Code2 size={13} /> Attach code
                    </button>
                )}

                {/* Footer */}
                <div className="df-composer-footer">
                    <div className="df-composer-actions">
                        <span className="df-xp-badge-inline">
                            <Sparkles size={12} style={{ color: '#c9a84c' }} /> +10 XP per post
                        </span>
                    </div>
                    <div className="df-composer-right-actions">
                        {body.length > 0 && (
                            <>
                                <CharRing count={body.length} max={MAX_CHARS} />
                                <div className="df-divider-v" />
                            </>
                        )}
                        {quotePost && (
                            <button className="df-post-btn" style={{ background: 'transparent', color: '#555', border: '1px solid #222' }} onClick={reset}>
                                Cancel
                            </button>
                        )}
                        <button
                            className="df-post-btn"
                            disabled={posting || !body.trim() || overLimit}
                            onClick={submit}
                        >
                            {posting ? <RefreshCw size={14} className="df-spin-inline" /> : 'Post'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/* ── Trending sidebar ── */
function TrendingSidebar({ posts, onHashtagClick }) {
    const counts = {};
    posts.forEach(p => {
        extractHashtags(p.body || '').forEach(tag => {
            counts[tag] = (counts[tag] || 0) + 1;
        });
    });
    const trending = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);

    return (
        <div className="df-sidebar-card">
            <div className="df-sidebar-title">Trending for devs</div>
            {trending.length === 0 ? (
                <div style={{ padding: '16px 18px', fontSize: '0.82rem', color: '#555' }}>
                    Post with #hashtags to see trends
                </div>
            ) : (
                trending.map(([tag, count], i) => (
                    <div key={tag} className="df-trending-row" onClick={() => onHashtagClick(tag)}>
                        <span className="df-trending-cat">Trending #{i + 1}</span>
                        <span className="df-trending-tag">{tag}</span>
                        <span className="df-trending-count">{count} post{count !== 1 ? 's' : ''}</span>
                    </div>
                ))
            )}
        </div>
    );
}

/* ── Leaderboard sidebar ── */
function LeaderboardSidebar() {
    const [lb, setLb] = useState([]);

    useEffect(() => {
        axios.get(`${API}/leaderboard?limit=5`).then(r => {
            setLb(r.data?.data || []);
        }).catch(() => {});
    }, []);

    const rankClass = (i) => i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';

    return (
        <div className="df-sidebar-card">
            <div className="df-sidebar-title">Top Devs 🏆</div>
            {lb.map((u, i) => {
                const level = getLevel(u.xp);
                return (
                    <Link key={u.username} className="df-lb-row" to={`/u/${u.username}`}>
                        <span className={`df-lb-rank ${rankClass(i)}`}>#{i + 1}</span>
                        <Avatar username={u.username} size={34} />
                        <div className="df-lb-info">
                            <div className="df-lb-username">{u.username}</div>
                            <div className="df-lb-xp" style={{ color: level.color }}>{level.label} · {u.xp.toLocaleString()} XP</div>
                        </div>
                    </Link>
                );
            })}
            {lb.length === 0 && (
                <div style={{ padding: '16px 18px', fontSize: '0.82rem', color: '#555' }}>
                    No rankings yet
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════
   MAIN PAGE
══════════════════════════════════════════════ */
export default function CodeFeed() {
    const { user }                          = useAuth();
    const [posts, setPosts]                 = useState([]);
    const [friends, setFriends]             = useState([]);
    const [loading, setLoading]             = useState(true);
    const [loadingMore, setLoadingMore]     = useState(false);
    const [hasMore, setHasMore]             = useState(true);
    const [tab, setTab]                     = useState('foryou');      // 'foryou' | 'following'
    const [activeFilter, setActiveFilter]   = useState('all');
    const [searchQuery, setSearchQuery]     = useState('');
    const [hashtagFilter, setHashtagFilter] = useState('');
    const [quoteTarget, setQuoteTarget]     = useState(null);
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

    // Load friends for "Following" tab
    const fetchFriends = useCallback(async () => {
        try {
            const { data } = await axios.get(`${API}/friends`, authHeader());
            const ids = (data.friends || []).map(f => f.id);
            setFriends([...ids, user?.id]);
        } catch (_) {}
    }, [authHeader, user?.id]);

    useEffect(() => { fetchPosts(); fetchFriends(); }, []);

    /* Infinite scroll */
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

    /* Real-time socket */
    useEffect(() => {
        if (!user?.id) return;
        const socket = initSocket();
        socketRef.current = socket;
        socket.on('feed:new_post', post => {
            if (String(post.author_id) === String(user.id)) return;
            setPosts(prev => prev.find(p => p.id === post.id) ? prev : [post, ...prev]);
        });
        socket.on('feed:reaction', ({ postId, reactions }) =>
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

    const handleHashtagClick = (tag) => {
        setHashtagFilter(prev => prev === tag ? '' : tag);
        setSearchQuery('');
    };

    // Filter logic
    let filtered = posts;
    if (tab === 'following' && friends.length > 0) {
        filtered = filtered.filter(p => friends.includes(String(p.author_id)));
    }
    if (activeFilter !== 'all') {
        filtered = filtered.filter(p => p.type === activeFilter);
    }
    if (hashtagFilter) {
        filtered = filtered.filter(p => (p.body || '').toLowerCase().includes(hashtagFilter.toLowerCase()));
    }
    if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        filtered = filtered.filter(p =>
            (p.body || '').toLowerCase().includes(q) ||
            (p.title || '').toLowerCase().includes(q) ||
            (p.author_username || '').toLowerCase().includes(q)
        );
    }

    return (
        <div className="df-page">
            <div className="df-layout">

                {/* ── Center feed — 2-col layout, no left nav ── */}
                <main className="df-center-col">

                    {/* Stream tabs */}
                    <div className="df-tabs">
                        <button className={`df-tab ${tab === 'foryou' ? 'active' : ''}`} onClick={() => setTab('foryou')}>
                            All Posts
                        </button>
                        <button className={`df-tab ${tab === 'following' ? 'active' : ''}`} onClick={() => setTab('following')}>
                            My Network
                        </button>
                    </div>

                    {/* Composer */}
                    {quoteTarget ? (
                        <Composer onPost={handlePost} user={user} quotePost={quoteTarget} onQuoteDone={() => setQuoteTarget(null)} />
                    ) : (
                        <Composer onPost={handlePost} user={user} />
                    )}

                    {/* IDE-style type switcher */}
                    <div className="df-type-switcher">
                        <button
                            className={`df-type-tab ${activeFilter === 'all' ? 'active' : ''}`}
                            onClick={() => setActiveFilter('all')}
                            style={activeFilter === 'all' ? { borderBottomColor: 'var(--df-gold)', color: 'var(--df-gold)' } : {}}
                        >
                            <span className="df-type-dot" style={{ background: activeFilter === 'all' ? 'var(--df-gold)' : 'var(--df-muted)' }} />
                            All
                        </button>
                        {POST_TYPES.map(t => (
                            <button
                                key={t.id}
                                className={`df-type-tab ${activeFilter === t.id ? 'active' : ''}`}
                                onClick={() => setActiveFilter(prev => prev === t.id ? 'all' : t.id)}
                                style={activeFilter === t.id ? { borderBottomColor: t.color, color: t.color } : {}}
                            >
                                <span className="df-type-dot" style={{ background: activeFilter === t.id ? t.color : 'var(--df-muted)' }} />
                                {t.label}
                            </button>
                        ))}
                        <div className="df-switcher-search">
                            <Search size={12} className="df-switcher-search-icon" />
                            <input
                                type="text"
                                placeholder="Search posts…"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Active hashtag filter */}
                    {hashtagFilter && (
                        <button className="df-hashtag-chip" onClick={() => setHashtagFilter('')}>
                            <Hash size={11} /> {hashtagFilter} <X size={10} />
                        </button>
                    )}

                    {/* Posts */}
                    {loading ? (
                        <div className="df-skeleton-feed">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="df-skeleton-post">
                                    <div className="df-skel" style={{ height: 11, width: '22%' }} />
                                    <div className="df-skel" style={{ height: 16, width: '75%' }} />
                                    <div className="df-skel" style={{ height: 13, width: '90%' }} />
                                    <div className="df-skel" style={{ height: 13, width: '60%' }} />
                                </div>
                            ))}
                        </div>
                    ) : filtered.length === 0 ? (
                        <div className="df-empty-state">
                            <div className="df-empty-icon">
                                {tab === 'following' ? <Users size={26} /> : <BookOpen size={26} />}
                            </div>
                            <p className="df-empty-title">
                                {tab === 'following' ? 'Nothing from your network yet' : 'No posts yet'}
                            </p>
                            <p className="df-empty-sub">
                                {tab === 'following'
                                    ? 'Connect with devs and their posts will appear here'
                                    : 'Drop a TIL, challenge, or code snippet to get started'}
                            </p>
                        </div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {filtered.map(p => (
                                <PostCard
                                    key={p.id}
                                    post={p}
                                    user={user}
                                    onDelete={handleDelete}
                                    onHashtagClick={handleHashtagClick}
                                />
                            ))}
                        </AnimatePresence>
                    )}

                    {loadingMore && (
                        <div className="df-load-more"><div className="df-spinner" /></div>
                    )}
                    <div ref={bottomRef} style={{ height: 1 }} />
                </main>

                {/* Right sidebar */}
                <aside className="df-right-col">
                    <TrendingSidebar posts={posts} onHashtagClick={handleHashtagClick} />
                    <LeaderboardSidebar />
                </aside>

            </div>
        </div>
    );
}
