import API_URL from '../config';
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { initSocket } from '../socket';
import {
    Users, Search, UserPlus, UserCheck, UserX, X,
    Clock, Zap, Check, ChevronDown, ChevronUp,
    MessageSquare, Swords, Send, ArrowLeft
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
    const navigate = useNavigate();
    const socketRef = useRef(null);

    const [tab, setTab] = useState('friends'); // 'friends' | 'search'
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
    
    // Whisper / Challenge State
    const [chatTarget, setChatTarget] = useState(null);
    const [chatHistory, setChatHistory] = useState({});
    const chatHistoryLoaded = useRef(false);

    useEffect(() => {
        if (user?.id && !chatHistoryLoaded.current) {
            try {
                const saved = localStorage.getItem(`fd_chat_${user.id}`);
                if (saved) setChatHistory(JSON.parse(saved));
            } catch (e) {}
            chatHistoryLoaded.current = true;
        }
    }, [user?.id]);

    useEffect(() => {
        if (user?.id && chatHistoryLoaded.current) {
            localStorage.setItem(`fd_chat_${user.id}`, JSON.stringify(chatHistory));
        }
    }, [chatHistory, user?.id]);
    const [chatMsg, setChatMsg] = useState('');
    const [unreadDms, setUnreadDms] = useState(new Set());

    const chatTargetRef = useRef(chatTarget);
    useEffect(() => { chatTargetRef.current = chatTarget; }, [chatTarget]);
    const openRef = useRef(open);
    useEffect(() => { openRef.current = open; }, [open]);

    const authHeader = { headers: { Authorization: `Bearer ${user?.token}` } };

    // Load friends list
    const loadFriends = useCallback(async () => {
        if (!user?.token) return;
        setLoading(true);
        try {
            const { data } = await axios.get(`${API}/friends`, authHeader);
            setFriends(data.friends || []);
            setIncoming(data.incoming || []);
            setOutgoing(data.outgoing || []);
        } catch (e) {
            console.error('[FriendsDrawer] Load error:', e.message);
        } finally {
            setLoading(false);
        }
    }, [user?.token]);

    // Socket presence setup
    useEffect(() => {
        if (!user?.id) return;
        const socket = initSocket();
        socketRef.current = socket;
        
        const joinPresence = () => {
            console.log("Emitting presence:join for", user.id);
            socket.emit('presence:join', user.id);
        };

        // If already connected, join immediately
        if (socket.connected) {
            joinPresence();
        }
        
        // Always join on (re)connect
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
        const handleDmReceive = (msg) => {
            console.log("DM Received:", msg);
            setChatHistory(prev => ({
                ...prev,
                [msg.fromId]: [...(prev[msg.fromId] || []), msg]
            }));
            
            if (!openRef.current || chatTargetRef.current?.id !== msg.fromId) {
                if (onUnread) onUnread();
                setUnreadDms(prev => {
                    const next = new Set(prev);
                    next.add(msg.fromId);
                    return next;
                });
            }
        };
        const handleArenaChallengeReceived = (data) => {
            // Inject a system challenge message into the chat so user can accept/decline inline
            setChatHistory(prev => ({
                ...prev,
                [data.fromId]: [...(prev[data.fromId] || []), {
                    type: 'challenge',
                    fromId: data.fromId,
                    fromUsername: data.fromUsername,
                    roomId: data.roomId,
                    timestamp: data.timestamp
                }]
            }));
            // Also notify if drawer is not focused on this chat
            if (!openRef.current || chatTargetRef.current?.id !== data.fromId) {
                if (onUnread) onUnread();
                setUnreadDms(prev => { const n = new Set(prev); n.add(data.fromId); return n; });
            }
        };
        const handleArenaChallengeAccepted = (data) => {
            setNotification({ msg: `${data.fromUsername} accepted! Warping to Arena...`, type: 'success' });
            setTimeout(() => navigate(`/workspace/${data.roomId}`), 1000);
        };

        socket.on('friend:online', handleFriendOnline);
        socket.on('friend:offline', handleFriendOffline);
        socket.on('friend:request', handleFriendRequest);
        socket.on('friend:accepted', handleFriendAccepted);
        socket.on('dm:receive', handleDmReceive);
        socket.on('arena:challenge_received', handleArenaChallengeReceived);
        socket.on('arena:challenge_accepted', handleArenaChallengeAccepted);

        return () => {
            socket.off('connect', joinPresence);
            socket.off('friend:online', handleFriendOnline);
            socket.off('friend:offline', handleFriendOffline);
            socket.off('friend:request', handleFriendRequest);
            socket.off('friend:accepted', handleFriendAccepted);
            socket.off('dm:receive', handleDmReceive);
            socket.off('arena:challenge_received', handleArenaChallengeReceived);
            socket.off('arena:challenge_accepted', handleArenaChallengeAccepted);
        };
    }, [user?.id]);

    // Load on open or when user token becomes available (e.g. after refresh)
    useEffect(() => { 
        if (open && user?.token) loadFriends(); 
    }, [open, user?.token, loadFriends]);

    // Auto-dismiss notification
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
                console.error('[FriendsDrawer] Search error:', e.response?.data || e.message);
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 400);
    }, [searchQ]);

    const sendRequest = async (recipientId) => {
        try {
            await axios.post(`${API}/friends/request`, { recipientId }, authHeader);
            setSearchResults(prev => prev.map(u => u.id === recipientId ? { ...u, friendStatus: 'pending' } : u));
        } catch (e) {}
    };

    const acceptRequest = async (requesterId) => {
        await axios.post(`${API}/friends/accept`, { requesterId }, authHeader);
        loadFriends();
    };

    const removeOrReject = async (id) => {
        try {
            await axios.delete(`${API}/friends/${id}`, authHeader);
            loadFriends();
        } catch (e) {
            console.error('Remove error', e);
        }
    };

    // Send Whisper
    const sendWhisper = (e) => {
        e.preventDefault();
        if (!chatMsg.trim() || !chatTarget || !socketRef.current) return;
        
        const msgObj = {
            toId: chatTarget.id,
            fromId: user.id,
            fromUsername: user.username,
            message: chatMsg
        };
        socketRef.current.emit('dm:send', msgObj);
        
        // Add to our own history
        setChatHistory(prev => ({
            ...prev,
            [chatTarget.id]: [...(prev[chatTarget.id] || []), { ...msgObj, timestamp: Date.now() }]
        }));
        setChatMsg('');
    };

    // Send Challenge
    const sendChallenge = (target) => {
        if (!socketRef.current || !target) return;
        const roomId = `arena_${user.id}_${target.id}_${Date.now()}`;
        socketRef.current.emit('arena:challenge', {
            toId: target.id,
            fromId: user.id,
            fromUsername: user.username,
            roomId
        });
        // Inject a system challenge message into our own chat
        setChatHistory(prev => ({
            ...prev,
            [target.id]: [...(prev[target.id] || []), {
                type: 'challenge',
                fromId: user.id,
                fromUsername: user.username,
                roomId,
                timestamp: Date.now()
            }]
        }));
    };

    const openChat = (target) => {
        setChatTarget(target);
        setTab('chat');
        setUnreadDms(prev => {
            const next = new Set(prev);
            next.delete(target.id);
            return next;
        });
    };

    const onlineFriends = friends.filter(f => f.online);
    const offlineFriends = friends.filter(f => !f.online);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fd-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Drawer */}
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
                                <Users size={18} color="var(--primary)" />
                                <span>Allies</span>
                                {friends.length > 0 && (
                                    <span className="fd-count">{friends.length}</span>
                                )}
                            </div>
                            <button className="fd-close" onClick={onClose}><X size={18} /></button>
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

                        {/* Tabs */}
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
                            {/* â”€â”€ FRIENDS TAB â”€â”€ */}
                            {tab === 'friends' && (
                                <>
                                    {/* Incoming Requests */}
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
                                                            <span className="fd-level">{XP_LEVEL(req.xp)} Â· {req.xp} XP</span>
                                                        </div>
                                                        <div className="fd-actions">
                                                            <button
                                                                className="fd-btn accept"
                                                                title="Accept"
                                                                onClick={() => acceptRequest(req.requesterId)}
                                                            ><Check size={14} /></button>
                                                            <button
                                                                className="fd-btn reject"
                                                                title="Reject"
                                                                onClick={() => removeOrReject(req.id)}
                                                            ><X size={14} /></button>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </div>
                                    )}

                                    {/* Online Friends */}
                                    {onlineFriends.length > 0 && (
                                        <div className="fd-section">
                                            <div className="fd-section-hdr static">
                                                <span className="fd-dot online-dot" />
                                                Online ” {onlineFriends.length}
                                            </div>
                                            {onlineFriends.map(f => (
                                                <FriendRow 
                                                    key={f.id} 
                                                    friend={f} 
                                                    onRemove={removeOrReject} 
                                                    onClose={onClose}
                                                    onWhisper={openChat}
                                                    onChallenge={sendChallenge}
                                                    unread={unreadDms.has(f.id)}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Offline Friends */}
                                    {offlineFriends.length > 0 && (
                                        <div className="fd-section">
                                            <div className="fd-section-hdr static">
                                                <span className="fd-dot offline-dot" />
                                                Offline ” {offlineFriends.length}
                                            </div>
                                            {offlineFriends.map(f => (
                                                <FriendRow 
                                                    key={f.id} 
                                                    friend={f} 
                                                    onRemove={removeOrReject} 
                                                    onClose={onClose}
                                                    onWhisper={openChat}
                                                    onChallenge={sendChallenge}
                                                    unread={unreadDms.has(f.id)}
                                                />
                                            ))}
                                        </div>
                                    )}

                                    {/* Empty */}
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

                            {/* â”€â”€ SEARCH TAB â”€â”€ */}
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
                                                <span className="fd-level">{XP_LEVEL(u.xp)} Â· {u.xp} XP</span>
                                            </div>
                                            <div className="fd-actions">
                                                {u.friendStatus === 'none' && (
                                                    <button className="fd-btn add" onClick={() => sendRequest(u.id)} title="Add friend">
                                                        <UserPlus size={14} />
                                                    </button>
                                                )}
                                                {u.friendStatus === 'pending' && (
                                                    <span className="fd-status-chip pending"><Clock size={11} /> Sent</span>
                                                )}
                                                {u.friendStatus === 'incoming' && (
                                                    <button className="fd-btn accept" onClick={() => acceptRequest(u.id)} title="Accept">
                                                        <Check size={14} />
                                                    </button>
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

                            {/* â–  CHAT TAB â–  */}
                            {tab === 'chat' && chatTarget && (
                                <div className="fd-chat-tab">
                                    <div className="fd-chat-header">
                                        <button className="fd-btn-icon" onClick={() => setTab('friends')}>
                                            <ArrowLeft size={16} />
                                        </button>
                                        <Avatar username={chatTarget.username} size={28} online={chatTarget.online} />
                                        <span>{chatTarget.username}</span>
                                        {chatTarget.online && (
                                            <button
                                                className="fd-duel-btn"
                                                title="Challenge to Duel"
                                                onClick={() => sendChallenge(chatTarget)}
                                            >
                                                <Swords size={13} /> Duel
                                            </button>
                                        )}
                                    </div>
                                    
                                    <div className="fd-chat-history">
                                        {!(chatHistory[chatTarget.id]?.length) ? (
                                            <div className="fd-chat-empty">
                                                <MessageSquare size={30} opacity={0.2} />
                                                <p>Secure Comm-Link Established</p>
                                                <span>Send a whisper to begin.</span>
                                            </div>
                                        ) : (
                                            chatHistory[chatTarget.id].map((m, i) => {
                                                if (m.type === 'challenge') {
                                                    const isMine = String(m.fromId) === String(user.id);
                                                    return (
                                                        <div key={i} className="fd-challenge-msg">
                                                            <Swords size={16} />
                                                            {isMine
                                                                ? <span>You challenged <b>{chatTarget.username}</b> to a duel!</span>
                                                                : <span><b>{m.fromUsername}</b> challenged you to a duel!</span>
                                                            }
                                                            {!isMine && (
                                                                <button
                                                                    className="fd-accept-duel-btn"
                                                                    onClick={() => {
                                                                        socketRef.current.emit('arena:accept', {
                                                                            toId: m.fromId,
                                                                            fromId: user.id,
                                                                            fromUsername: user.username,
                                                                            roomId: m.roomId
                                                                        });
                                                                        navigate(`/workspace/${m.roomId}`);
                                                                    }}
                                                                >
                                                                    âš”ï¸ Accept Duel
                                                                </button>
                                                            )}
                                                        </div>
                                                    );
                                                }
                                                return (
                                                    <div key={i} className={`fd-msg-bubble ${String(m.fromId) === String(user.id) ? 'sent' : 'received'}`}>
                                                        {m.message}
                                                    </div>
                                                );
                                            })
                                        )}
                                    </div>
                                    
                                    <form className="fd-chat-input" onSubmit={sendWhisper}>
                                        <input 
                                            autoFocus
                                            type="text" 
                                            placeholder={`Whisper to ${chatTarget.username}...`}
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

const FriendRow = ({ friend, onRemove, onClose, onWhisper, onChallenge, unread }) => {
    const [hovering, setHovering] = useState(false);
    return (
        <div
            className="fd-user-row"
            onMouseEnter={() => setHovering(true)}
            onMouseLeave={() => setHovering(false)}
        >
            <Avatar username={friend.username} online={friend.online} />
            <div className="fd-user-info">
                <Link to={`/u/${friend.username}`} className="fd-username">{friend.username}</Link>
                <span className="fd-level">{XP_LEVEL(friend.xp)} Â· {friend.xp} XP</span>
            </div>
            {unread && <div className="fd-unread-indicator" style={{ marginLeft: 'auto', marginRight: '5px' }}></div>}
            {hovering && (
                <div className="fd-actions-hover" style={{ display: 'flex', gap: '4px', marginLeft: unread ? '0' : 'auto' }}>
                    <button
                        className="fd-btn whisper"
                        title={friend.online ? "Whisper" : "Ally is offline"}
                        onClick={() => friend.online && onWhisper(friend)}
                        style={{ opacity: friend.online ? 1 : 0.3, cursor: friend.online ? 'pointer' : 'not-allowed' }}
                        disabled={!friend.online}
                    >
                        <MessageSquare size={13} />
                    </button>
                    <button
                        className="fd-btn reject"
                        title="Remove ally"
                        onClick={() => onRemove(friend.id)}
                    >
                        <UserX size={13} />
                    </button>
                </div>
            )}
        </div>
    );
};
