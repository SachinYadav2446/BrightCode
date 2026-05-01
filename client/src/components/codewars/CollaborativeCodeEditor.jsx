import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import TeammateCursor from './TeammateCursor';
import TeammatePresence from './TeammatePresence';
import './CollaborativeCodeEditor.css';

/**
 * CollaborativeCodeEditor Component
 * 
 * Real-time collaborative code editor for Code Wars Arena team battles.
 * Supports multi-user editing with code synchronization, cursor tracking,
 * and teammate presence indicators.
 * 
 * @param {Object} props
 * @param {string} props.roomId - Code Wars room identifier
 * @param {string} props.teamId - Team identifier (team_1 or team_2)
 * @param {string} props.questionId - Current question identifier
 * @param {string} props.userId - Current user's ID
 * @param {string} props.username - Current user's username
 * @param {Object} props.socket - Socket.io client instance
 * @param {string} props.initialCode - Initial code content
 * @param {string} props.language - Programming language (javascript, python, java)
 * @param {Function} props.onSubmit - Callback for solution submission
 * @param {boolean} props.disabled - Whether editor is disabled
 */
const CollaborativeCodeEditor = ({
  roomId,
  teamId,
  questionId,
  userId,
  username,
  socket,
  initialCode = '',
  language = 'javascript',
  onSubmit,
  disabled = false
}) => {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  
  // Code content state
  const [code, setCode] = useState(initialCode);
  
  // Local cursor position (line, ch)
  const [localCursorPosition, setLocalCursorPosition] = useState({ line: 0, ch: 0 });
  
  // Teammate cursors Map: userId -> { username, position: { line, ch }, color, lastUpdate }
  const [teammateCursors, setTeammateCursors] = useState(new Map());
  
  // Teammates list for presence indicator
  const [teammates, setTeammates] = useState([]);
  
  // Connection status
  const [isConnected, setIsConnected] = useState(false);
  
  // Reconnecting status
  const [isReconnecting, setIsReconnecting] = useState(false);
  
  // Syncing status (during initial load)
  const [isSyncing, setIsSyncing] = useState(true);
  
  // Last sync timestamp for conflict resolution
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(Date.now());
  
  // ============================================================================
  // REFS
  // ============================================================================
  
  // Editor instance ref (will be set when editor library is integrated)
  const editorRef = useRef(null);
  
  // Debounce/throttle timer refs
  const codeChangeDebounceRef = useRef(null);
  const cursorMoveThrottleRef = useRef(null);
  
  // ============================================================================
  // LIFECYCLE METHODS (Placeholders for Phase 2 implementation)
  // ============================================================================
  
  /**
   * Join editor session on component mount
   * Implements Task 8.4
   */
  const joinEditorSession = useCallback(() => {
    if (!socket || !roomId || !teamId || !questionId || !userId) {
      console.warn('[CollaborativeCodeEditor] Cannot join - missing required data');
      return;
    }
    
    console.log('[CollaborativeCodeEditor] Joining editor session', {
      roomId,
      teamId,
      questionId,
      userId,
      username
    });
    
    setIsSyncing(true);
    
    // Emit join event
    socket.emit('cw-join-team-editor', {
      roomId,
      teamId,
      questionId,
      userId,
      username
    });
    
    // Set up one-time listener for sync response
    const handleEditorSync = (data) => {
      console.log('[CollaborativeCodeEditor] Received editor sync', data);
      
      // Initialize editor with synced state
      if (data.code !== undefined) {
        setCode(data.code);
      }
      
      if (data.timestamp) {
        setLastSyncTimestamp(data.timestamp);
      }
      
      // Initialize teammate cursors if provided
      if (data.cursors) {
        const cursorsMap = new Map();
        Object.entries(data.cursors).forEach(([uid, cursorData]) => {
          if (uid !== userId) {
            cursorsMap.set(uid, cursorData);
          }
        });
        setTeammateCursors(cursorsMap);
      }
      
      setIsSyncing(false);
      setIsConnected(true);
      
      console.log('[CollaborativeCodeEditor] Editor sync complete');
    };
    
    // Listen for sync response (will be cleaned up in effect)
    socket.once('cw-editor-sync', handleEditorSync);
    
    // Timeout fallback if sync doesn't arrive
    setTimeout(() => {
      setIsSyncing(false);
      setIsConnected(socket.connected);
    }, 5000);
  }, [roomId, teamId, questionId, userId, username, socket]);
  
  /**
   * Handle cursor movements with throttling
   * Implements Task 9.1
   */
  const handleCursorMove = useCallback((position) => {
    // Update local cursor position immediately
    setLocalCursorPosition(position);
    
    // Clear existing throttle timer
    if (cursorMoveThrottleRef.current) {
      return; // Still in throttle period, skip this update
    }
    
    // Throttle broadcast to 50ms
    cursorMoveThrottleRef.current = setTimeout(() => {
      if (socket && roomId && teamId && questionId && userId) {
        socket.emit('cw-cursor-move', {
          roomId,
          teamId,
          questionId,
          position,
          userId
        });
        
        console.log('[CollaborativeCodeEditor] Cursor position broadcasted', {
          position
        });
      }
      
      // Clear throttle timer
      cursorMoveThrottleRef.current = null;
    }, 50); // 50ms throttle
  }, [roomId, teamId, questionId, userId, socket]);
  
  /**
   * Handle editor mount - store editor instance
   */
  const handleEditorDidMount = useCallback((editor, monaco) => {
    editorRef.current = editor;
    
    // Set up cursor position tracking
    editor.onDidChangeCursorPosition((e) => {
      const position = {
        line: e.position.lineNumber,
        ch: e.position.column
      };
      setLocalCursorPosition(position);
      handleCursorMove(position);
    });
    
    console.log('[CollaborativeCodeEditor] Editor mounted');
  }, [handleCursorMove]);
  
  /**
   * Handle code changes with debouncing
   * Implements Task 8.1
   */
  const handleCodeChange = useCallback((newCode) => {
    // Update local state immediately (optimistic update)
    setCode(newCode);
    
    // Clear existing debounce timer
    if (codeChangeDebounceRef.current) {
      clearTimeout(codeChangeDebounceRef.current);
    }
    
    // Debounce broadcast to 100ms
    codeChangeDebounceRef.current = setTimeout(() => {
      if (socket && roomId && teamId && questionId && userId) {
        const timestamp = Date.now();
        
        socket.emit('cw-code-change', {
          roomId,
          teamId,
          questionId,
          code: newCode,
          cursorPosition: localCursorPosition,
          userId,
          timestamp
        });
        
        // Update last sync timestamp
        setLastSyncTimestamp(timestamp);
        
        console.log('[CollaborativeCodeEditor] Code change broadcasted', {
          roomId,
          teamId,
          questionId,
          codeLength: newCode.length,
          timestamp
        });
      }
    }, 100); // 100ms debounce
  }, [roomId, teamId, questionId, userId, socket, localCursorPosition]);
  
  /**
   * Apply remote code updates from teammates
   * Implements Task 8.2 - Last-Write-Wins conflict resolution
   */
  const applyRemoteCodeUpdate = useCallback((update) => {
    const { code: remoteCode, timestamp, userId: remoteUserId, username: remoteUsername } = update;
    
    // Check if update is newer than our last sync (Last-Write-Wins)
    if (timestamp > lastSyncTimestamp) {
      console.log('[CollaborativeCodeEditor] Applying remote code update', {
        from: remoteUsername,
        timestamp,
        lastSyncTimestamp,
        codeLength: remoteCode.length
      });
      
      // Store current cursor position
      const currentPosition = editorRef.current?.getPosition();
      
      // Apply remote code
      setCode(remoteCode);
      
      // Update last sync timestamp
      setLastSyncTimestamp(timestamp);
      
      // Try to preserve cursor position if possible
      if (editorRef.current && currentPosition) {
        // Use setTimeout to ensure the editor has updated
        setTimeout(() => {
          try {
            editorRef.current?.setPosition(currentPosition);
          } catch (error) {
            console.warn('[CollaborativeCodeEditor] Could not restore cursor position', error);
          }
        }, 0);
      }
    } else {
      // Discard older update
      console.log('[CollaborativeCodeEditor] Discarding older code update', {
        from: remoteUsername,
        timestamp,
        lastSyncTimestamp,
        reason: 'Older timestamp'
      });
    }
  }, [lastSyncTimestamp]);
  
  /**
   * Handle teammate cursor updates
   * Implements Task 9.2
   */
  const handleTeammateCursorUpdate = useCallback((data) => {
    const { userId: remoteUserId, username: remoteUsername, position } = data;
    
    // Don't update for our own cursor
    if (remoteUserId === userId) {
      return;
    }
    
    console.log('[CollaborativeCodeEditor] Received teammate cursor update', {
      from: remoteUsername,
      position
    });
    
    // Update teammate cursors map
    setTeammateCursors(prev => {
      const updated = new Map(prev);
      updated.set(remoteUserId, {
        username: remoteUsername,
        position,
        lastUpdate: Date.now()
      });
      return updated;
    });
  }, [userId]);
  
  /**
   * Handle teammate code updates
   * Implements Task 8.3 & 17.3 (typing status)
   */
  const handleTeammateCodeUpdate = useCallback((data) => {
    console.log('[CollaborativeCodeEditor] Received teammate code update', {
      from: data.username,
      userId: data.userId,
      timestamp: data.timestamp
    });
    
    // Apply the remote update using conflict resolution
    applyRemoteCodeUpdate(data);
    
    // Update teammate's last code change timestamp for typing indicator
    setTeammates(prev => prev.map(teammate => 
      teammate.userId === data.userId
        ? { ...teammate, lastCodeChange: Date.now() }
        : teammate
    ));
  }, [applyRemoteCodeUpdate]);
  
  // ============================================================================
  // EFFECTS
  // ============================================================================
  
  /**
   * Initialize editor session on mount
   */
  useEffect(() => {
    if (socket && roomId && teamId && questionId && userId) {
      joinEditorSession();
    }
    
    // Cleanup on unmount
    return () => {
      // Clear timers
      if (codeChangeDebounceRef.current) {
        clearTimeout(codeChangeDebounceRef.current);
      }
      if (cursorMoveThrottleRef.current) {
        clearTimeout(cursorMoveThrottleRef.current);
      }
      
      // Leave editor session
      if (socket) {
        socket.emit('cw-leave-team-editor', {
          roomId,
          teamId,
          questionId,
          userId
        });
      }
    };
  }, [socket, roomId, teamId, questionId, userId, joinEditorSession]);
  
  /**
   * Set up socket event listeners
   * Includes Tasks 10.1, 10.2, 10.3, 17.1, 17.2
   */
  useEffect(() => {
    if (!socket) return;
    
    // Listen for teammate code updates
    socket.on('cw-teammate-code-update', handleTeammateCodeUpdate);
    
    // Listen for teammate cursor updates
    socket.on('cw-teammate-cursor-update', handleTeammateCursorUpdate);
    
    // Listen for editor sync response
    socket.on('cw-editor-sync', (data) => {
      console.log('[CollaborativeCodeEditor] Received editor sync', data);
      setIsSyncing(false);
      setIsConnected(true);
    });
    
    // Task 17.1: Teammate joined editor
    socket.on('cw-teammate-joined-editor', (data) => {
      console.log('[CollaborativeCodeEditor] Teammate joined', data);
      
      setTeammates(prev => {
        // Check if teammate already exists
        const exists = prev.some(t => t.userId === data.userId);
        if (exists) return prev;
        
        return [...prev, {
          userId: data.userId,
          username: data.username,
          isOnline: true,
          currentQuestion: questionId,
          lastCodeChange: null
        }];
      });
    });
    
    // Task 17.2: Teammate left editor
    socket.on('cw-teammate-left-editor', (data) => {
      console.log('[CollaborativeCodeEditor] Teammate left', data);
      
      setTeammates(prev => prev.filter(t => t.userId !== data.userId));
      
      // Remove teammate's cursor
      setTeammateCursors(prev => {
        const updated = new Map(prev);
        updated.delete(data.userId);
        return updated;
      });
    });
    
    // Task 10.1 & 10.2: Connection status and reconnection logic
    socket.on('connect', () => {
      console.log('[CollaborativeCodeEditor] Socket connected');
      setIsConnected(true);
    });
    
    socket.on('disconnect', () => {
      console.log('[CollaborativeCodeEditor] Socket disconnected');
      setIsConnected(false);
      setIsReconnecting(true);
    });
    
    socket.on('reconnect', () => {
      console.log('[CollaborativeCodeEditor] Socket reconnected - rejoining session');
      setIsConnected(true);
      setIsReconnecting(false);
      // Automatically rejoin editor session on reconnect
      joinEditorSession();
    });
    
    // Task 10.3: Error handling for failed updates
    socket.on('cw-error', (error) => {
      console.error('[CollaborativeCodeEditor] Socket error:', error);
      
      // Request full state sync on error
      if (error.code === 'SYNC_ERROR' || error.code === 'UPDATE_FAILED') {
        console.log('[CollaborativeCodeEditor] Requesting full state sync due to error');
        joinEditorSession();
      }
    });
    
    // Cleanup listeners on unmount
    return () => {
      socket.off('cw-teammate-code-update', handleTeammateCodeUpdate);
      socket.off('cw-teammate-cursor-update', handleTeammateCursorUpdate);
      socket.off('cw-editor-sync');
      socket.off('cw-teammate-joined-editor');
      socket.off('cw-teammate-left-editor');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('reconnect');
      socket.off('cw-error');
    };
  }, [socket, handleTeammateCodeUpdate, handleTeammateCursorUpdate, joinEditorSession, questionId]);
  
  /**
   * Update code when initialCode prop changes
   */
  useEffect(() => {
    setCode(initialCode);
  }, [initialCode]);
  
  /**
   * Get teammate color from predefined palette
   */
  const getTeammateColor = useCallback((userId) => {
    const colors = ['#667eea', '#4caf50', '#9c27b0', '#ff9800', '#f44336'];
    // Use userId hash to consistently assign colors
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
  }, []);
  
  /**
   * Get Monaco language identifier from language prop
   */
  const getMonacoLanguage = useCallback(() => {
    const languageMap = {
      javascript: 'javascript',
      python: 'python',
      java: 'java',
      typescript: 'typescript',
      cpp: 'cpp',
      c: 'c'
    };
    return languageMap[language] || 'javascript';
  }, [language]);
  
  // ============================================================================
  // RENDER
  // ============================================================================
  
  return (
    <div className="collaborative-code-editor">
      {/* Teammate Presence Indicator */}
      <TeammatePresence
        teammates={[
          // Add current user to the list
          {
            userId,
            username,
            isOnline: true,
            currentQuestion: questionId,
            lastCodeChange: null
          },
          ...teammates
        ]}
        currentUserId={userId}
        currentQuestionId={questionId}
      />
      
      {/* Connection Status Indicator */}
      <div className="editor-status-bar">
        <div className={`connection-status ${isReconnecting ? 'reconnecting' : isConnected ? 'connected' : 'disconnected'}`}>
          <span className="status-indicator"></span>
          <span className="status-text">
            {isSyncing ? 'Syncing...' : isReconnecting ? 'Reconnecting...' : isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
        
        {/* Language Indicator */}
        <div className="language-indicator">
          {language.toUpperCase()}
        </div>
      </div>
      
      {/* Editor Container */}
      <div className="editor-container">
        {/* Monaco Editor */}
        <Editor
          height="100%"
          language={getMonacoLanguage()}
          value={code}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            readOnly: disabled || !isConnected,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            suggest: {
              enabled: true
            },
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false
            },
            parameterHints: { enabled: true },
            formatOnPaste: true,
            formatOnType: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            smoothScrolling: true
          }}
          loading={
            <div className="editor-loading">
              <div className="loading-spinner"></div>
              <p>Loading editor...</p>
            </div>
          }
        />
        
        {/* Teammate Cursors Container */}
        <div className="teammate-cursors">
          {Array.from(teammateCursors.entries()).map(([teammateId, cursorData]) => (
            <TeammateCursor
              key={teammateId}
              username={cursorData.username}
              position={cursorData.position}
              color={getTeammateColor(teammateId)}
              isVisible={true}
            />
          ))}
        </div>
      </div>
      
      {/* Submit Button */}
      {onSubmit && (
        <div className="editor-actions">
          <button
            className="submit-solution-btn"
            onClick={() => onSubmit(code)}
            disabled={disabled || !isConnected || isSyncing}
          >
            Submit Solution
          </button>
        </div>
      )}
      
      {/* Loading Overlay */}
      {isSyncing && (
        <div className="editor-loading-overlay">
          <div className="loading-spinner"></div>
          <p>Syncing editor state...</p>
        </div>
      )}
    </div>
  );
};

export default CollaborativeCodeEditor;
