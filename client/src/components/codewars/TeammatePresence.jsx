import { useState, useEffect } from 'react';
import './TeammatePresence.css';

/**
 * TeammatePresence Component
 * 
 * Displays a list of teammates currently in the editor session.
 * Shows online status, current question, and typing indicators.
 * 
 * @param {Object} props
 * @param {Array} props.teammates - Array of teammate objects
 * @param {string} props.currentUserId - Current user's ID
 * @param {string} props.currentQuestionId - Current question ID
 */
const TeammatePresence = ({ teammates = [], currentUserId, currentQuestionId }) => {
  // Track typing status for each teammate
  const [typingStatus, setTypingStatus] = useState(new Map());
  
  /**
   * Update typing status based on teammate activity
   * Implements Task 17.3
   */
  useEffect(() => {
    const timers = new Map();
    
    teammates.forEach(teammate => {
      // Check if teammate has recent activity (within 2 seconds)
      const isTyping = teammate.lastCodeChange && 
                      (Date.now() - teammate.lastCodeChange < 2000);
      
      if (isTyping) {
        setTypingStatus(prev => {
          const updated = new Map(prev);
          updated.set(teammate.userId, true);
          return updated;
        });
        
        // Clear typing status after 2 seconds
        const timer = setTimeout(() => {
          setTypingStatus(prev => {
            const updated = new Map(prev);
            updated.delete(teammate.userId);
            return updated;
          });
        }, 2000);
        
        timers.set(teammate.userId, timer);
      }
    });
    
    // Cleanup timers
    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [teammates]);
  
  /**
   * Get teammate color from predefined palette
   */
  const getTeammateColor = (index) => {
    const colors = ['#667eea', '#4caf50', '#9c27b0', '#ff9800', '#f44336'];
    return colors[index % colors.length];
  };
  
  return (
    <div className="teammate-presence">
      <div className="presence-header">
        <span className="presence-title">Team Members</span>
        <span className="presence-count">{teammates.length}</span>
      </div>
      
      <div className="presence-list">
        {teammates.map((teammate, index) => {
          const isCurrentUser = teammate.userId === currentUserId;
          const isOnline = teammate.isOnline !== false; // Default to online
          const isTyping = typingStatus.get(teammate.userId);
          const color = getTeammateColor(index);
          
          return (
            <div
              key={teammate.userId}
              className={`presence-item ${isCurrentUser ? 'current-user' : ''} ${isOnline ? 'online' : 'offline'}`}
            >
              {/* Status indicator */}
              <div
                className="presence-indicator"
                style={{ backgroundColor: isOnline ? color : '#666' }}
              ></div>
              
              {/* Username */}
              <div className="presence-info">
                <span className="presence-username">
                  {teammate.username}
                  {isCurrentUser && <span className="you-label"> (You)</span>}
                </span>
                
                {/* Typing indicator or question info */}
                {isTyping ? (
                  <span className="presence-status typing">
                    <span className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </span>
                    Typing...
                  </span>
                ) : teammate.currentQuestion ? (
                  <span className="presence-status">
                    {teammate.currentQuestion === currentQuestionId
                      ? 'On this question'
                      : `On question ${teammate.currentQuestion}`}
                  </span>
                ) : (
                  <span className="presence-status">In editor</span>
                )}
              </div>
            </div>
          );
        })}
        
        {teammates.length === 0 && (
          <div className="presence-empty">
            <p>No teammates online</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeammatePresence;
