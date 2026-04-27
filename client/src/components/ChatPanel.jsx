import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import './ChatPanel.css';

// messages & onSend are managed by parent (Factions.jsx)
// so listeners stay alive regardless of which tab is open
const ChatPanel = ({ socket, roomId, user, title, messages = [], onSend }) => {
    const [input, setInput] = useState('');
    const chatContainerRef = useRef(null);

    // Scroll inside the box only, never the page
    useEffect(() => {
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = (e) => {
        e.preventDefault();
        if (!input.trim() || !socket) return;

        const messageData = {
            roomId,
            text: input,
            sender: user?.username || 'Unknown',
            timestamp: new Date().toISOString(),
            avatar: user?.username?.charAt(0).toUpperCase() || '?',
        };

        socket.emit('send-chat-message', messageData);
        if (onSend) onSend(messageData);
        setInput('');
    };

    return (
        <div className="chat-panel-container">
            <div className="chat-header">
                <div className="chat-title-info">
                    <MessageSquare size={16} className="chat-icon-accent" />
                    <span className="chat-title-text">{title || 'Comm Center'}</span>
                </div>
                <div className="chat-status-dot"></div>
            </div>

            <div className="chat-messages-area" ref={chatContainerRef}>
                {messages.length === 0 && (
                    <div className="chat-empty-state">
                        <MessageSquare size={32} />
                        <p>No transmissions yet.<br />Secure line established.</p>
                    </div>
                )}
                {messages.map((msg, i) => {
                    const isMe = msg.sender === user?.username;
                    const prevMsg = messages[i - 1];
                    const isCompact = prevMsg && prevMsg.sender === msg.sender;

                    return (
                        <div key={msg.id || i} className={`chat-msg-wrapper ${isMe ? 'me' : ''} ${isCompact ? 'compact' : ''}`}>
                            {!isMe && !isCompact && (
                                <div className="chat-msg-avatar">{msg.avatar}</div>
                            )}
                            <div className="chat-msg-content">
                                {!isCompact && (
                                    <div className="chat-msg-meta">
                                        <span className="chat-msg-sender">{msg.sender}</span>
                                        <span className="chat-msg-time">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                )}
                                <div className="chat-msg-bubble">{msg.text}</div>
                            </div>
                            {isMe && !isCompact && (
                                <div className="chat-msg-avatar me">{msg.avatar}</div>
                            )}
                        </div>
                    );
                })}
            </div>

            <form className="chat-input-area" onSubmit={sendMessage}>
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Broadcast message..."
                    className="chat-text-input"
                />
                <button type="submit" className="chat-send-btn" disabled={!input.trim()}>
                    <Send size={18} />
                </button>
            </form>
        </div>
    );
};

export default ChatPanel;
