import { useState, useEffect } from 'react';
import './TeammateCursor.css';

/**
 * TeammateCursor Component
 * 
 * Displays a colored cursor indicator for a teammate in the collaborative editor.
 * Shows the teammate's username and cursor position with smooth transitions.
 * Auto-fades after 3 seconds of inactivity.
 * 
 * @param {Object} props
 * @param {string} props.username - Teammate's username
 * @param {Object} props.position - Cursor position { line, ch }
 * @param {string} props.color - Cursor color (hex or CSS color name)
 * @param {boolean} props.isVisible - Whether cursor should be visible
 */
const TeammateCursor = ({ username, position, color, isVisible = true }) => {
  // Track cursor visibility for auto-fade
  const [isActive, setIsActive] = useState(true);
  
  // Inactivity timer ref
  const inactivityTimerRef = useState(null);
  
  /**
   * Reset inactivity timer when position changes
   * Implements Task 14.1 & 14.2
   */
  useEffect(() => {
    // Show cursor immediately when position updates
    setIsActive(true);
    
    // Clear existing timer
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }
    
    // Start 3-second inactivity timer
    inactivityTimerRef.current = setTimeout(() => {
      setIsActive(false);
    }, 3000); // 3 seconds
    
    // Cleanup on unmount
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [position]);
  
  // Don't render if not visible
  if (!isVisible) {
    return null;
  }
  
  return (
    <div
      className={`teammate-cursor ${isActive ? 'active' : 'inactive'}`}
      style={{
        '--cursor-color': color,
        top: `${position.line * 20}px`, // Approximate line height
        left: `${position.ch * 8}px`    // Approximate character width
      }}
    >
      {/* Cursor line indicator */}
      <div className="cursor-line" style={{ backgroundColor: color }}></div>
      
      {/* Username label */}
      <div className="cursor-label" style={{ backgroundColor: color }}>
        {username}
      </div>
    </div>
  );
};

export default TeammateCursor;
