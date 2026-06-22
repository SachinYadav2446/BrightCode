import API_URL from '../config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { initSocket } from '../socket';
import {
    Users, Search, UserPlus, UserCheck, UserX, X,
    Clock, Zap, Check, ChevronDown, ChevronUp,
    MessageSquare, Send, ArrowLeft
} from 'lucide-react';
import './FriendsDrawer.css';

const API = API_URL;

const XP_LEVEL = (xp) => {
    if (xp >= 10000) return 'Grandmaster';
    if (xp >= 5000) return 'Expert';
    if (xp >= 2000) return 'Advanced';
    if (xp >= 500) return 'Apprentice';
    return 'Novice';
};

const formatTime = (ts) => {
    if (!ts) return '';
    const d = new Date(ts);
    const now = new Date();
    const isToday = d.toDateString() === now.toDateString();
    if (isToday) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
        d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Avatar = ({ username, size = 36, online }) => (
    <div className="fd-avatar" style={{ width: size, height: size, fontSize: size * 0.4 }}>
        {username?.charAt(0).toUpperCase() || '?'}
        {online !== undefined && (
            <span className={`fd-presence ${online ? 'online' : 'offline'}`} />
        )}
    </div>
);

export default function FriendsDrawer({ open, onClose, onUnread }) {
    const { user } = useAuth();
    const socketRef = useRef(null);

    const [tab, setTab] = useState('friends'); // 'friends' | 'search' | 'chat'
    const [friends, setFriends] = useState([]);
    const [incoming, setIncoming] = useState([]);
    const [outgoing, setOutgoing] = useState([]);
    const [searchQ, setSearchQ] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);
    const [showIncoming, setShowIncoming] = useState(true);
    const searchTimeout = useRef(null);

    // Chat state
    const [chatTarget, setChatTarget] = useState(null);
    const [chatMessages, setChatMessages] = useState([]); // messages for current chat
    const [chatMsg, setChatMsg] = useState('');
    const [chatLoading, setChatLoading] = useState(false);
    const [unreadDms, setUnreadDms] = useState(new Set()); // set of fromIds with unread msgs
    const chatBottomRef = useRef(null);

    const chatTargetRef = useRef(chatTarget);
    useEffect(() => { chatTargetRef.current = chatTarget; }, [chatTarget]);
    const openRef = useRef(open);
    useEffect(() => { openRef.current = open; }, [open]);

    const authHeader = useCallback(() => ({
        headers: { Authorization: `Bearer ${user?.token || localStorage.getItem('token')}` }
    }), [user?.token]);

    // Load friends list
    const loadFriends = useCallback(async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/friends`, authHeader());
            setFriends(data.friends || []);
            setIncoming(data.incoming || []);
            setOutgoing(data.outgoing || []);
        } catch (e) {
            console.error('[FriendsDrawer] Load error:', e.message);
        } finally {
            setLoading(false);
        }
    }, [user?.token]);

    // Fetch message history for a conversation
    const loadChatHistory = useCallback(async (friendId) => {
        if (!friendId) return;
        setChatLoading(true);
        try {
            const { data } = await axios.get(`${API}/messages/${friendId}`, authHeader());
            // Normalize server format { from_id, to_id } to component format { fromId, toId }
            const normalized = data.map(m => ({
                id: m.id,
                fromId: m.from_id || m.fromId,
                toId: m.to_id || m.toId,
                fromUsername: m.fromUsername || '',
                message: m.message,
                timestamp: m.timestamp,
                type: m.type || 'text'
            }));
            setChatMessages(normalized);
        } catch (e) {
            console.error('[FriendsDrawer] Chat history error:', e.message);
        } finally {
            setChatLoading(false);
        }
    }, [authHeader]);

    // Scroll to bottom of chat
    useEffect(() => {
        if (tab === 'chat') {
            chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [chatMessages, tab]);

    // Socket setup
    useEffect(() => {
        if (!user?.id) return;
        const socket = initSocket();
        socketRef.current = socket;

        const joinPresence = () => {
            socket.emit('presence:join', user.id);
        };
        if (socket.connected) joinPresence();
        socket.on('connect', joinPresence);

        const handleFriendOnline = ({ userId }) => {
            setFriends(prev => prev.map(f => f.id === userId ? { ...f, online: true } : f));
        };
        const handleFriendOffline = ({ userId }) => {
            setFriends(prev => prev.map(f => f.id === userId ? { ...f, online: false } : f));
        };
        const handleFriendRequest = ({ from }) => {
            setNotification({ msg: `${from.username} sent you a friend request!`, type: 'info' });
            loadFriends();
        };
        const handleFriendAccepted = ({ by }) => {
            setNotification({ msg: `${by.username} accepted your request!`, type: 'success' });
            loadFriends();
        };

        // Real-time incoming DM
        const handleDmReceive = (msg) => {
            const senderId = msg.fromId || msg.from_id;
            const normalized = {
                id: msg.id,
                fromId: senderId,
                fromUsername: msg.fromUsername,
                message: msg.message,
                timestamp: msg.timestamp,
                type: 'text'
            };
            // If chat is open with this sender, append directly
            if (chatTargetRef.current?.id === senderId) {
                setChatMessages(prev => [...prev, normalized]);
            }
            // Mark unread if chat not focused on sender
            if (!openRef.current || chatTargetRef.current?.id !== senderId) {
                if (onUnread) onUnread();
                setUnreadDms(prev => { const n = new Set(prev); n.add(senderId); return n; });
            }
        };

        // Server tells us we have unread messages from these senders (offline delivery)
        const handleDmUnread = ({ senderIds }) => {
            if (!senderIds?.length) return;
            if (onUnread) onUnread();
            setUnreadDms(prev => {
                const n = new Set(prev);
                senderIds.forEach(id => {
                    // Only mark unread if we are not currently chatting with that person
                    if (chatTargetRef.current?.id !== id) n.add(id);
                });
                return n;
            });
        };

        const handleArenaChallengeReceived = (data) => {
            // challenge feature removed
        };
        const handleArenaChallengeAccepted = (data) => {
            // challenge feature removed
        };

        socket.on('friend:online', handleFriendOnline);
        socket.on('friend:offline', handleFriendOffline);
        socket.on('friend:request', handleFriendRequest);
        socket.on('friend:accepted', handleFriendAccepted);
        socket.on('dm:receive', handleDmReceive);
        socket.on('dm:unread', handleDmUnread);
        socket.on('arena:challenge_received', handleArenaChallengeReceived);
        socket.on('arena:challenge_accepted', handleArenaChallengeAccepted);

        return () => {
            socket.off('connect', joinPresence);
            socket.off('friend:online', handleFriendOnline);
            socket.off('friend:offline', handleFriendOffline);
            socket.off('friend:request', handleFriendRequest);
            socket.off('friend:accepted', handleFriendAccepted);
            socket.off('dm:receive', handleDmReceive);
            socket.off('dm:unread', handleDmUnread);
            socket.off('arena:challenge_received', handleArenaChallengeReceived);
            socket.off('arena:challenge_accepted', handleArenaChallengeAccepted);
        };
    }, [user?.id]);

    useEffect(() => {
        if (open && user?.token) loadFriends();
    }, [open, user?.token, loadFriends]);

    useEffect(() => {
        if (notification) {
            const t = setTimeout(() => setNotification(null), 3500);
            return () => clearTimeout(t);
        }
    }, [notification]);

    // Live search
    useEffect(() => {
        if (searchTimeout.current) clearTimeout(searchTimeout.current);
        if (!searchQ.trim() || searchQ.length < 2) { setSearchResults([]); return; }
        setSearching(true);
        searchTimeout.current = setTimeout(async () => {
            try {
                const token = localStorage.getItem('token');
                const { data } = await axios.get(`${API}/friends/search?q=${encodeURIComponent(searchQ)}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setSearchResults(Array.isArray(data) ? data : []);
            } catch (e) {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 400);
    }, [searchQ]);

    const sendRequest = async (recipientId) => {
        try {
            await axios.post(`${API}/friends/request`, { recipientId }, authHeader());
            setSearchResults(prev => prev.map(u => u.id === recipientId ? { ...u, friendStatus: 'pending' } : u));
        } catch (e) {}
    };

    const acceptRequest = async (requesterId) => {
        await axios.post(`${API}/friends/accept`, { requesterId }, authHeader());
        loadFriends();
    };

    const removeOrReject = async (id) => {
        try {
            await axios.post(`${API}/friends/remove`, { otherId: id }, authHeader());
            loadFriends();
        } catch (e) {
            console.error('Remove error', e);
        }
    };

    // Open chat with a friend
    const openChat = (target) => {
        setChatTarget(target);
        setChatMessages([]);
        setTab('chat');
        setUnreadDms(prev => { const n = new Set(prev); n.delete(target.id); return n; });
        loadChatHistory(target.id);
    };

    // Send a message (works for both online and offline friends)
    const sendWhisper = (e) => {
        e.preventDefault();
        if (!chatMsg.trim() || !chatTarget || !socketRef.current) return;
        const msgObj = {
            toId: chatTarget.id,
            fromId: user.id,
            fromUsername: user.username,
            message: chatMsg.trim()
        };
        socketRef.current.emit('dm:send', msgObj);
        // Optimistically add to local chat
        setChatMessages(prev => [...prev, {
            id: `local_${Date.now()}`,
            fromId: user.id,
            fromUsername: user.username,
            toId: chatTarget.id,
            message: chatMsg.trim(),
            timestamp: Date.now(),
            type: 'text'
        }]);
        setChatMsg('');
    };

    const onlineFriends = friends.filter(f => f.online);
    const offlineFriends = friends.filter(f => !f.online);

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        className="fd-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />
                    <motion.aside
                        className="fd-drawer"
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 35 }}
                    >
                        {/* Header */}
                        <div className="fd-header">
                            <div className="fd-header-left">
                                {tab === 'chat' && chatTarget ? (
                                    <>
                                        <button className="fd-btn-icon" onClick={() => { setTab('friends'); setChatTarget(null); }}>
                                            <ArrowLeft size={16} />
                                        </button>
                                        <Avatar username={chatTarget.username} size={26} online={chatTarget.online} />
                                        <span style={{ fontSize: '0.9rem' }}>{chatTarget.username}</span>
                                        {!chatTarget.online && (
                                            <span className="fd-offline-label">offline</span>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        <Users size={18} color="var(--primary)" />
                                        <span>Allies</span>
                                        {friends.length > 0 && <span className="fd-count">{friends.length}</span>}
                                    </>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button className="fd-close" onClick={onClose}><X size={18} /></button>
                            </div>
                        </div>

                        {/* Notification Toast */}
                        <AnimatePresence>
                            {notification && (
                                <motion.div
                                    className={`fd-toast ${notification.type}`}
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                >
                                    {notification.type === 'success' ? <Check size={14} /> : <Zap size={14} />}
                                    {notification.msg}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Tabs — hidden in chat view */}
                        {tab !== 'chat' && (
                            <div className="fd-tabs">
                                <button
                                    className={`fd-tab ${tab === 'friends' ? 'active' : ''}`}
                                    onClick={() => setTab('friends')}
                                >
                                    Friends
                                    {incoming.length > 0 && <span className="fd-badge">{incoming.length}</span>}
                                </button>
                                <button
                                    className={`fd-tab ${tab === 'search' ? 'active' : ''}`}
                                    onClick={() => setTab('search')}
                                >
                                    Add Allies
                                </button>
                            </div>
                        )}

                        <div className="fd-body">
                            {/* ── FRIENDS TAB ── */}
                            {tab === 'friends' && (
                                <>
                                    {incoming.length > 0 && (
                                        <div className="fd-section">
                                            <button
                                                className="fd-section-hdr"
                                                onClick={() => setShowIncoming(p => !p)}
                                            >
                                                <span>Pending Requests <span className="fd-badge">{incoming.length}</span></span>
                                                {showIncoming ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                            </button>
                                            <AnimatePresence>
                                                {showIncoming && incoming.map(req => (
                                                    <motion.div
                                                        key={req.id}
                                                        className="fd-user-row incoming"
                                                        initial={{ opacity: 0, height: 0 }}
                                                        animate={{ opacity: 1, height: 'auto' }}
                                                        exit={{ opacity: 0, height: 0 }}
                                                    >
                                                        <Avatar username={req.username} />
                                                        <div className="fd-user-info">
                                                            <Link to={`/u/${req.username}`} className="fd-username">{req.username}</Link>
                                                            <span className="fd-level">{XP_LEVEL(req.xp)} · {req.xp} XP</span>
                                                        </div>
                                                        <div className="fd-actions">
                                                            <button className="fd-btn accept" title="Accept" onClick={() => acceptRequest(req.requesterId)}><Check size={14} /></button>
                                                            <button className="fd-btn reject" title="Reject" onClick={() => removeOrReject(req.id)}><X size={14} /></button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}

                                    {onlineFriends.length > 0 && (
                                        <div className="fd-section">
                                            <div className="fd-section-hdr static">
                                                <span className="fd-dot online-dot" />
                                                Online — {onlineFriends.length}
                                            </div>
                                            {onlineFriends.map(f => (
                                                <FriendRow key={f.id} friend={f} onRemove={removeOrReject} onClose={onClose}
                                                    onWhisper={openChat} unread={unreadDms.has(f.id)} />
                                            ))}
                                        </div>
                                    )}

                                    {offlineFriends.length > 0 && (
                                        <div className="fd-section">
                                            <div className="fd-section-hdr static">
                                                <span className="fd-dot offline-dot" />
                                                Offline — {offlineFriends.length}
                                            </div>
                                            {offlineFriends.map(f => (
                                                <FriendRow key={f.id} friend={f} onRemove={removeOrReject} onClose={onClose}
                                                    onWhisper={openChat} unread={unreadDms.has(f.id)} />
                                            ))}
                                        </div>
                                    )}

                                    {!loading && friends.length === 0 && incoming.length === 0 && (
                                        <div className="fd-empty">
                                            <Users size={40} color="rgba(255,255,255,0.1)" />
                                            <p>No allies yet</p>
                                            <span>Search for coders and add them!</span>
                                            <button className="fd-add-btn" onClick={() => setTab('search')}>
                                                <UserPlus size={14} /> Find Allies
                                            </button>
                                        </div>
                                    )}
                                    {loading && <div className="fd-loading"><div className="fd-spinner" /></div>}
                                </>
                            )}

                            {/* ── SEARCH TAB ── */}
                            {tab === 'search' && (
                                <div className="fd-search-tab">
                                    <div className="fd-search-box">
                                        <Search size={15} color="rgba(255,255,255,0.4)" />
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder="Search by username..."
                                            value={searchQ}
                                            onChange={e => setSearchQ(e.target.value)}
                                        />
                                        {searchQ && (
                                            <button onClick={() => { setSearchQ(''); setSearchResults([]); }}>
                                                <X size={13} />
                                            </button>
                                        )}
                                    </div>
                                    {searching && <div className="fd-loading"><div className="fd-spinner" /></div>}
                                    {searchResults.map(u => (
                                        <div key={u.id} className="fd-user-row">
                                            <Avatar username={u.username} online={u.online} />
                                            <div className="fd-user-info">
                                                <Link to={`/u/${u.username}`} className="fd-username">{u.username}</Link>
                                                <span className="fd-level">{XP_LEVEL(u.xp)} · {u.xp} XP</span>
                                            </div>
                                            <div className="fd-actions">
                                                {u.friendStatus === 'none' && (
                                                    <button className="fd-btn add" onClick={() => sendRequest(u.id)} title="Add friend"><UserPlus size={14} /></button>
                                                )}
                                                {u.friendStatus === 'pending' && (
                                                    <span className="fd-status-chip pending"><Clock size={11} /> Sent</span>
                                                )}
                                                {u.friendStatus === 'incoming' && (
                                                    <button className="fd-btn accept" onClick={() => acceptRequest(u.id)} title="Accept"><Check size={14} /></button>
                                                )}
                                                {u.friendStatus === 'accepted' && (
                                                    <span className="fd-status-chip friends"><UserCheck size={11} /> Allies</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                    {searchQ.length >= 2 && !searching && searchResults.length === 0 && (
                                        <div className="fd-empty">
                                            <p>No users found</p>
                                            <span>Try a different username</span>
                                        </div>
                                    )}
                                    {!searchQ && (
                                        <div className="fd-search-hint">
                                            <Search size={36} color="rgba(255,255,255,0.07)" />
                                            <span>Type at least 2 characters to search</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── CHAT TAB ── */}
                            {tab === 'chat' && chatTarget && (
                                <div className="fd-chat-tab">
                                    <div className="fd-chat-history">
                                        {chatLoading ? (
                                            <div className="fd-loading"><div className="fd-spinner" /></div>
                                        ) : chatMessages.length === 0 ? (
                                            <div className="fd-chat-empty">
                                                <MessageSquare size={30} opacity={0.2} />
                                                <p>Secure Comm-Link Established</p>
                                                <span>Send a message to begin.</span>
                                            </div>
                                        ) : (
                                            chatMessages.map((m, i) => {
                                                const isMine = String(m.fromId) === String(user.id);
                                                return (
                                                    <div key={m.id || i} className={`fd-msg-wrap ${isMine ? 'sent' : 'received'}`}>
                                                        <div className={`fd-msg-bubble ${isMine ? 'sent' : 'received'}`}>
                                                            {m.message}
                                                        </div>
                                                        <span className="fd-msg-time">{formatTime(m.timestamp)}</span>
                                                    </div>
                                                );
                                            })
                                        )}
                                        <div ref={chatBottomRef} />
                                    </div>

                                    <form className="fd-chat-input" onSubmit={sendWhisper}>
                                        <input
                                            autoFocus
                                            type="text"
                                            placeholder={`Message ${chatTarget.username}...`}
                                            value={chatMsg}
                                            onChange={e => setChatMsg(e.target.value)}
                                        />
                                        <button type="submit" disabled={!chatMsg.trim()}>
                                            <Send size={14} />
                                        </button>
                                    </form>
                                </div>
                            )}
                        </div>
                    </motion.aside>
                </>
            )}
        </AnimatePresence>
    );
}

const FriendRow = ({ friend, onRemove, onClose, onWhisper, unread }) => {
    const [hovering, setHovering] = useState(false);
    return (
        <div
            className="fd-user-row"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            <Avatar username={friend.username} online={friend.online} />
            <div className="fd-user-info">
                <Link to={`/u/${friend.username}`} className="fd-username" onClick={onClose}>
                    {friend.username}
                </Link>
                <span className="fd-level">{XP_LEVEL(friend.xp)} · {friend.xp} XP</span>
            </div>
            {unread && !hovering && (
                <div className="fd-unread-indicator" title="Unread messages" />
            )}
            {hovering && (
                <div className="fd-actions-hover">
                    <button
                        className="fd-btn whisper"
                        title="Message"
                        onClick={() => onWhisper(friend)}
                    >
                        <MessageSquare size={13} />
                        {unread && <span className="fd-unread-dot" />}
                    </button>
                    <button className="fd-btn reject" title="Remove ally" onClick={() => onRemove(friend.id)}>
                        <UserX size={13} />
                    </button>
                </div>
            )}
        </div>
    );
};
