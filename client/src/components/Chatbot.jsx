import API_URL from '../config';
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import './Chatbot.css';

const Chatbot = ({ context = {}, isSidebarOpen = false }) => {
  const { friendsDrawerOpen } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    const saved = sessionStorage.getItem('palSessionId');
    return saved ? saved : Date.now();
  });
  const [messages, setMessages] = useState(() => {
    const savedHistory = sessionStorage.getItem('chatbotHistory');
    return savedHistory ? JSON.parse(savedHistory) : [
      { id: 1, type: 'bot', text: "Hey! I'm Pal, your coding companion. I'm here to help you with anything coding-related, whether it's debugging, learning new concepts, or navigating BrightCode. What can I help you with today?" }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    sessionStorage.setItem('chatbotHistory', JSON.stringify(messages));
  }, [messages]);

  // Save sessionId to sessionStorage
  useEffect(() => {
    sessionStorage.setItem('palSessionId', sessionId.toString());
  }, [sessionId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMsg = { id: Date.now(), type: 'user', text: inputValue };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await axios.post(`${API_URL}/api/chat`, { 
        messages: updatedMessages,
        sessionId: sessionId,
        context: context 
      });

      if (response.data && response.data.text) {
        // Update sessionId if server returned a new one
        if (response.data.sessionId) {
          setSessionId(response.data.sessionId);
        }
        
        let cleanedText = response.data.text;
        
        cleanedText = cleanedText.replace(/\*\*(.*?)\*\*/g, '$1');
        cleanedText = cleanedText.replace(/\*(.*?)\*/g, '$1');
        cleanedText = cleanedText.replace(/^#+\s/gm, '');
        cleanedText = cleanedText.replace(/`([^`]+)`/g, '$1');
        
        const paragraphs = cleanedText.split('\n\n');
        const formattedText = paragraphs.map(p => p.trim()).filter(p => p).join('\n\n');
        
        const aiResponse = { id: Date.now() + 1, type: 'bot', text: formattedText };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Pal API Error:", error);
      const errorMsg = { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: "I encountered a technical hiccup on my end. Could you try asking that again? If the issue persists, the server might be taking a quick break." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  if (isSidebarOpen || friendsDrawerOpen) {
    return null;
  }
  
  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="chatbot-fab"
            onClick={() => setIsOpen(true)}
            title="Chat with Pal"
          >
            <MessageSquare size={24} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className={`chatbot-window ${isExpanded ? 'expanded' : ''}`}
          >
            <div className="chatbot-header">
              <div className="chatbot-header-title">
                <Bot size={20} className="chatbot-header-icon" />
                <span>Pal</span>
                <span className="chatbot-status-dot"></span>
              </div>
              <div className="chatbot-header-actions">
                <button onClick={() => setIsExpanded(!isExpanded)} className="chatbot-action-btn">
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button onClick={() => setIsOpen(false)} className="chatbot-action-btn">
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="chatbot-messages">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`chatbot-message ${msg.type}`}
                >
                  <div className="chatbot-message-avatar">
                    {msg.type === 'bot' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className="chatbot-message-content">
                    {msg.text.split('\n').map((line, i) => (
                      <React.Fragment key={i}>
                        {line}
                        {i < msg.text.split('\n').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="chatbot-message bot">
                  <div className="chatbot-message-avatar">
                    <Bot size={16} />
                  </div>
                  <div className="chatbot-message-content typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            <form className="chatbot-input-form" onSubmit={handleSend}>
              <input
                type="text"
                placeholder="Ask me anything about coding..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="chatbot-input"
              />
              <button 
                type="submit" 
                disabled={!inputValue.trim() || isTyping} 
                className="chatbot-send-btn"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot;
