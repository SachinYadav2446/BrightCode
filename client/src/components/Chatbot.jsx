import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Maximize2, Minimize2, Mic, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import './Chatbot.css';


const Chatbot = ({ context = {} }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState(() => {
    const savedHistory = sessionStorage.getItem('chatbotHistory');
    return savedHistory ? JSON.parse(savedHistory) : [
      { id: 1, type: 'bot', text: "Hey! I'm Pal, your coding companion. I'm here to help you with anything coding-related, whether it's debugging, learning new concepts, or navigating BrightCode. What can I help you with today?" }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(() => {
    const saved = localStorage.getItem('palVoiceEnabled');
    return saved ? JSON.parse(saved) : true;
  });
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);
  const synthRef = useRef(window.speechSynthesis);
  const shouldKeepListeningRef = useRef(false); // Use ref instead of state for immediate updates

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

  // Save voice preference
  useEffect(() => {
    localStorage.setItem('palVoiceEnabled', JSON.stringify(voiceEnabled));
  }, [voiceEnabled]);

  // Initialize Speech Recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true; // Keep listening continuously
      recognitionRef.current.interimResults = true; // Show interim results
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.maxAlternatives = 1;

      recognitionRef.current.onstart = () => {
        console.log('🎤 Speech recognition started');
        setIsListening(true);
        toast.success('🎤 Listening... Click mic again to stop', { duration: 3000 });
      };

      recognitionRef.current.onresult = (event) => {
        console.log('📝 Speech result received:', event.results);
        
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          console.log(`Result ${i}: "${transcript}", isFinal: ${event.results[i].isFinal}`);
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        console.log('Final transcript:', finalTranscript);
        console.log('Interim transcript:', interimTranscript);

        // Update input with final transcript (append to existing)
        if (finalTranscript) {
          setInputValue(prev => {
            const newValue = (prev + ' ' + finalTranscript).trim();
            console.log('Setting input value to:', newValue);
            return newValue;
          });
        }
        
        // Show interim results in real-time (replace last interim)
        if (interimTranscript && !finalTranscript) {
          setInputValue(prev => {
            // If there's already text, append interim
            // Otherwise just show interim
            const newValue = prev ? prev + ' ' + interimTranscript : interimTranscript;
            console.log('Setting interim value to:', newValue);
            return newValue.trim();
          });
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        
        // Don't stop on no-speech or network errors, just continue
        if (event.error === 'no-speech' || event.error === 'network') {
          console.log(`${event.error} error, but continuing to listen...`);
          return;
        }
        
        // For other errors, stop listening
        setIsListening(false);
        shouldKeepListeningRef.current = false;
        
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please enable it in your browser settings.');
        } else if (event.error === 'aborted') {
          // User stopped it, don't show error
          console.log('Speech recognition aborted by user');
        } else {
          toast.error(`Voice input error: ${event.error}`);
        }
      };

      recognitionRef.current.onend = () => {
        console.log('🛑 Speech recognition ended, shouldKeepListening:', shouldKeepListeningRef.current);
        
        // If we should keep listening, restart immediately
        if (shouldKeepListeningRef.current) {
          console.log('🔄 Restarting speech recognition in 100ms...');
          setTimeout(() => {
            if (shouldKeepListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch (e) {
                console.error('Failed to restart recognition:', e);
                setIsListening(false);
                shouldKeepListeningRef.current = false;
              }
            }
          }, 100); // Small delay before restart
        } else {
          // User stopped it intentionally
          setIsListening(false);
        }
      };
    }

    return () => {
      shouldKeepListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.log('Recognition already stopped');
        }
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []); // Only run once on mount

  // Speak text using Speech Synthesis
  const speak = (text) => {
    if (!voiceEnabled || !synthRef.current) return;

    // Cancel any ongoing speech
    synthRef.current.cancel();

    // Clean text for better speech (remove emojis and special characters)
    const cleanText = text
      .replace(/[🎮🏛️✅❌🚀💡🔥⚡🎯🏆👋😊💪🤔😅🎉📚🔍]/g, '')
      .replace(/\n\n/g, '. ')
      .replace(/\n/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Configure voice settings
    utterance.rate = 1.0; // Normal speed
    utterance.pitch = 1.0; // Normal pitch
    utterance.volume = 1.0; // Full volume

    // Try to use a more natural voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Google') || 
      voice.name.includes('Natural') ||
      voice.name.includes('Enhanced')
    ) || voices.find(voice => voice.lang.startsWith('en'));
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      setIsSpeaking(false);
    };

    synthRef.current.speak(utterance);
  };

  // Toggle voice input
  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast.error('Voice input not supported in your browser. Try Chrome or Edge.');
      return;
    }

    if (isListening) {
      // Stop listening
      console.log('🛑 User clicked to stop listening');
      shouldKeepListeningRef.current = false; // Tell it not to restart
      try {
        recognitionRef.current.stop();
        setIsListening(false);
        toast.success('✅ Stopped listening', { duration: 1500 });
      } catch (error) {
        console.error('Failed to stop recognition:', error);
        setIsListening(false);
        shouldKeepListeningRef.current = false;
      }
    } else {
      // Start listening
      console.log('🎤 User clicked to start listening');
      shouldKeepListeningRef.current = true; // Tell it to keep restarting if it ends
      try {
        recognitionRef.current.start();
      } catch (error) {
        console.error('Failed to start recognition:', error);
        
        // If already started, stop and restart
        if (error.message && error.message.includes('already started')) {
          recognitionRef.current.stop();
          setTimeout(() => {
            try {
              recognitionRef.current.start();
            } catch (e) {
              toast.error('Failed to start voice input. Please try again.');
              shouldKeepListeningRef.current = false;
            }
          }, 100);
        } else {
          toast.error('Failed to start voice input. Please try again.');
          shouldKeepListeningRef.current = false;
        }
      }
    }
  };

  // Toggle voice output
  const toggleVoiceOutput = () => {
    const newState = !voiceEnabled;
    setVoiceEnabled(newState);
    
    if (!newState && synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
    
    toast.success(newState ? '🔊 Voice output enabled' : '🔇 Voice output disabled', { duration: 2000 });
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    // Stop any ongoing speech
    stopSpeaking();

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      console.log('📤 Sending message, stopping voice input');
      shouldKeepListeningRef.current = false; // Don't restart
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.log('Recognition already stopped');
      }
    }

    const userMsg = { id: Date.now(), type: 'user', text: inputValue };
    const updatedMessages = [...messages, userMsg];
    
    setMessages(updatedMessages);
    setInputValue('');
    setIsTyping(true);

    try {
      // Send the conversation history and context to the backend API
      const response = await axios.post('http://localhost:5051/api/chat', { 
        messages: updatedMessages,
        context: context // Pass context about current page, problem, user, etc.
      });

      if (response.data && response.data.text) {
        let cleanedText = response.data.text;
        
        // Remove any remaining markdown formatting
        cleanedText = cleanedText.replace(/\*\*(.*?)\*\*/g, '$1');
        cleanedText = cleanedText.replace(/\*(.*?)\*/g, '$1');
        cleanedText = cleanedText.replace(/^#+\s/gm, '');
        cleanedText = cleanedText.replace(/`([^`]+)`/g, '$1');
        
        // Split into paragraphs for better readability
        const paragraphs = cleanedText.split('\n\n');
        const formattedText = paragraphs.map(p => p.trim()).filter(p => p).join('\n\n');
        
        const aiResponse = { id: Date.now() + 1, type: 'bot', text: formattedText };
        setMessages(prev => [...prev, aiResponse]);

        // Speak the response if voice is enabled
        if (voiceEnabled) {
          // Small delay to let the message render
          setTimeout(() => speak(formattedText), 300);
        }
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
      
      if (voiceEnabled) {
        setTimeout(() => speak(errorMsg.text), 300);
      }
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
                {isSpeaking && (
                  <motion.span 
                    className="speaking-indicator"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                  >
                    🔊
                  </motion.span>
                )}
              </div>
              <div className="chatbot-header-actions">
                <button 
                  onClick={toggleVoiceOutput} 
                  className={`chatbot-action-btn ${voiceEnabled ? 'active' : ''}`}
                  title={voiceEnabled ? 'Disable voice output' : 'Enable voice output'}
                >
                  {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                </button>
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
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`chatbot-voice-btn ${isListening ? 'listening' : ''}`}
                title={isListening ? 'Stop listening' : 'Start voice input'}
                disabled={isTyping}
              >
                {isListening ? (
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                  >
                    <Mic size={18} />
                  </motion.div>
                ) : (
                  <Mic size={18} />
                )}
              </button>
              <input
                type="text"
                placeholder={isListening ? "🎤 Listening... (click mic to stop)" : "Ask me anything about coding..."}
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
