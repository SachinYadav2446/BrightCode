import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Maximize2, Minimize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(() => {
    const savedHistory = sessionStorage.getItem('chatbotHistory');
    return savedHistory ? JSON.parse(savedHistory) : [
      { id: 1, type: 'bot', text: "Hi! I'm the BrightCode AI Sentinel. Ask me anything about the project!" }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Save messages to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('chatbotHistory', JSON.stringify(messages));
  }, [messages]);

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
      // Send the conversation history to the backend API
      const response = await axios.post('http://localhost:5051/api/chat', { 
        messages: updatedMessages 
      });

      if (response.data && response.data.text) {
        let cleanedText = response.data.text;
        
        // Remove excessive bold formatting (**text**)
        cleanedText = cleanedText.replace(/\*\*(.*?)\*\*/g, '$1');
        
        // Truncate very long responses to max 3 sentences or 500 characters
        const sentences = cleanedText.split(/(?<=[.!?])\s+/);
        if (sentences.length > 3) {
          cleanedText = sentences.slice(0, 3).join(' ') + '...';
        } else if (cleanedText.length > 500) {
          cleanedText = cleanedText.substring(0, 500) + '...';
        }
        
        const aiResponse = { id: Date.now() + 1, type: 'bot', text: cleanedText };
        setMessages(prev => [...prev, aiResponse]);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Chatbot API Error:", error);
      const errorMsg = { 
        id: Date.now() + 1, 
        type: 'bot', 
        text: "I'm currently experiencing communication interference with the main server. Please try again later." 
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

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
                <span>AI Sentinel</span>
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
                    {msg.text}
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
                placeholder="Ask about BrightCode..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="chatbot-input"
              />
              <button type="submit" disabled={!inputValue.trim() || isTyping} className="chatbot-send-btn">
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
