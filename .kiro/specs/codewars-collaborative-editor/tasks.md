# Implementation Plan: Code Wars Collaborative Editor

## Overview

This implementation plan converts the collaborative editor design into actionable coding tasks. The feature enables real-time collaborative code editing for team-based battles in Code Wars Arena, with code synchronization, multi-cursor display, and teammate presence indicators.

The implementation follows a 5-phase approach: Backend Foundation → Frontend Editor → Multi-Cursor & Presence → Integration & Testing → Performance & Security. Each task builds incrementally on previous work, with checkpoints to validate progress.

## Tasks

### Phase 1: Backend Foundation

- [x] 1. Extend IntraFactionArena class with collaborative editor state management
  - Add `teamEditorStates` Map property (roomId → teamId → questionId → EditorState)
  - Add `activeEditorSessions` Map property (roomId → teamId → questionId → Set<userId>)
  - Add `cursorPositions` Map property (roomId → teamId → questionId → userId → position)
  - Create file `server/IntraFactionArena.js` or modify existing class location
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 2. Implement core IntraFactionArena collaborative methods
  - [x] 2.1 Implement `joinTeamEditor(roomId, teamId, questionId, userId, username)` method
    - Validate user belongs to team
    - Add user to activeEditorSessions
    - Initialize editor state if not exists
    - Return current editor state (code, cursors, lastEdit, timestamp)
    - _Requirements: 3.1, 5.4_
  
  - [x] 2.2 Implement `leaveTeamEditor(roomId, teamId, questionId, userId)` method
    - Remove user from activeEditorSessions
    - Remove user's cursor position
    - Return success status
    - _Requirements: 3.2, 5.7_
  
  - [x] 2.3 Implement `updateTeamCode(roomId, teamId, questionId, code, userId, cursorPosition, timestamp)` method
    - Validate timestamp for conflict resolution (Last-Write-Wins)
    - Update editor state with new code and timestamp
    - Store cursor position
    - Return success/conflict status
    - _Requirements: 1.2, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 2.4 Implement `getTeamEditorState(roomId, teamId, questionId)` method
    - Return { code, cursors, lastEdit, timestamp }
    - Return empty state if not exists
    - _Requirements: 5.4_
  
  - [x] 2.5 Implement `updateCursorPosition(roomId, teamId, questionId, userId, position)` method
    - Store cursor position in cursorPositions Map
    - No persistence needed (ephemeral data)
    - _Requirements: 2.1_
  
  - [x] 2.6 Implement `broadcastToTeam(roomId, teamId, questionId, event, data, excludeUserId)` helper
    - Construct team-specific room name: `cw-${roomId}-team-${teamId}-q-${questionId}`
    - Emit event to team room, excluding specified user if provided
    - _Requirements: 4.2_

- [ ] 3. Implement socket event handlers in server/index.js
  - [x] 3.1 Implement `cw-join-team-editor` event handler
    - Extract roomId, teamId, questionId, userId from event data
    - Validate user belongs to team (check room.teams)
    - Call `intraFactionArena.joinTeamEditor()`
    - Join socket to team-specific room: `cw-${roomId}-team-${teamId}-q-${questionId}`
    - Emit `cw-editor-sync` event to joining user with current state
    - Broadcast `cw-teammate-joined-editor` to other team members
    - _Requirements: 3.1, 4.1, 4.3, 9.1, 9.5, 9.8_
  
  - [x] 3.2 Implement `cw-code-change` event handler
    - Extract roomId, teamId, questionId, code, cursorPosition, userId, timestamp from event data
    - Validate user belongs to team
    - Call `intraFactionArena.updateTeamCode()`
    - Broadcast `cw-teammate-code-update` to team members (exclude sender)
    - Include userId, username, code, cursorPosition, timestamp in broadcast
    - _Requirements: 1.1, 1.2, 4.2, 9.2, 9.6_
  
  - [x] 3.3 Implement `cw-cursor-move` event handler
    - Extract roomId, teamId, questionId, position, userId from event data
    - Validate user belongs to team
    - Call `intraFactionArena.updateCursorPosition()`
    - Broadcast `cw-teammate-cursor-update` to team members (exclude sender)
    - Include userId, username, position in broadcast
    - _Requirements: 2.1, 2.2, 9.3, 9.7_
  
  - [x] 3.4 Implement `cw-submit-solution` event handler enhancement
    - Extract roomId, teamId, questionId, code, userId from event data
    - Validate user belongs to team
    - Get current team code from editor state
    - Evaluate code against test cases
    - Award points to team if correct
    - Broadcast success/failure to all team members
    - Disable editor for team during evaluation
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_
  
  - [x] 3.5 Implement socket disconnect cleanup
    - On socket disconnect, call `leaveTeamEditor()` for all active sessions
    - Remove user from all team rooms
    - Broadcast departure to teammates
    - _Requirements: 10.7_

- [ ]* 4. Write unit tests for backend collaborative logic
  - Test IntraFactionArena editor state initialization
  - Test joinTeamEditor adds user to active sessions
  - Test updateTeamCode applies Last-Write-Wins correctly (newer timestamp wins)
  - Test updateTeamCode discards updates with older timestamps
  - Test team isolation (team_1 cannot access team_2 state)
  - Test broadcastToTeam only reaches team members
  - Test socket room naming convention
  - _Requirements: 4.1, 4.4, 4.5, 6.1, 6.3, 6.4_

- [x] 5. Checkpoint - Backend foundation complete
  - Ensure all tests pass, ask the user if questions arise.

### Phase 2: Frontend Editor Component

- [ ] 6. Create CollaborativeCodeEditor component structure
  - Create file `client/src/components/codewars/CollaborativeCodeEditor.jsx`
  - Create file `client/src/components/codewars/CollaborativeCodeEditor.css`
  - Define component props interface (roomId, teamId, questionId, userId, username, socket, initialCode, language, onSubmit, disabled)
  - Define component state (code, localCursorPosition, teammateCursors Map, isConnected, isSyncing, lastSyncTimestamp)
  - Set up basic component structure with editor container
  - _Requirements: 11.1, 11.2_

- [ ] 7. Integrate code editor library (CodeMirror or Monaco)
  - [ ] 7.1 Install code editor dependency
    - Choose CodeMirror (lightweight) or Monaco (feature-rich)
    - Run `npm install @uiw/react-codemirror` or `npm install @monaco-editor/react`
    - Install language support packages
  
  - [ ] 7.2 Integrate editor into CollaborativeCodeEditor component
    - Import and render editor component
    - Configure syntax highlighting for JavaScript, Python, Java
    - Configure line numbers, auto-completion, bracket matching
    - Set up onChange handler for code changes
    - Set up onCursorActivity handler for cursor movements
    - _Requirements: 11.5_

- [ ] 8. Implement real-time code synchronization
  - [ ] 8.1 Implement `handleCodeChange(newCode)` method with debouncing
    - Update local state immediately (optimistic update)
    - Debounce broadcast to 100ms using lodash debounce
    - Emit `cw-code-change` socket event with roomId, teamId, questionId, code, cursorPosition, userId, timestamp
    - _Requirements: 1.1, 8.1, 8.4_
  
  - [ ] 8.2 Implement `applyRemoteCodeUpdate(update)` method
    - Check if update.timestamp > state.lastSyncTimestamp
    - If newer, apply update.code to editor state
    - Update lastSyncTimestamp
    - If older, discard update
    - Preserve local cursor position when possible
    - _Requirements: 1.2, 6.3, 6.4, 6.5_
  
  - [ ] 8.3 Set up socket event listener for `cw-teammate-code-update`
    - Call applyRemoteCodeUpdate() when event received
    - Handle updates from all teammates
    - _Requirements: 1.2_
  
  - [ ] 8.4 Implement `joinEditorSession()` method
    - Emit `cw-join-team-editor` socket event on component mount
    - Listen for `cw-editor-sync` response
    - Initialize editor with synced code and cursors
    - Set isSyncing state during sync
    - _Requirements: 1.4, 3.1_

- [ ] 9. Implement cursor position tracking and broadcasting
  - [ ] 9.1 Implement `handleCursorMove(position)` method with throttling
    - Throttle broadcast to 50ms using lodash throttle
    - Emit `cw-cursor-move` socket event with roomId, teamId, questionId, position, userId
    - Update local cursor position in state
    - _Requirements: 2.1, 8.2_
  
  - [ ] 9.2 Set up socket event listener for `cw-teammate-cursor-update`
    - Update teammateCursors Map with new position
    - Include username from event data
    - _Requirements: 2.2_

- [ ] 10. Implement connection status and error handling
  - [ ] 10.1 Add connection status indicator
    - Display "Connected" / "Reconnecting..." / "Disconnected" status
    - Update based on socket connection state
    - _Requirements: 10.1_
  
  - [ ] 10.2 Implement reconnection logic
    - Listen for socket reconnect event
    - Automatically call joinEditorSession() on reconnect
    - Request full state sync
    - _Requirements: 10.2_
  
  - [ ] 10.3 Implement error handling for failed updates
    - Catch errors in applyRemoteCodeUpdate()
    - Log error to console
    - Request full state sync from server
    - Display non-intrusive error notification
    - _Requirements: 10.3, 10.5_

- [ ]* 11. Write unit tests for CollaborativeCodeEditor component
  - Test component renders with initial code
  - Test handleCodeChange debounces to 100ms
  - Test applyRemoteCodeUpdate applies newer timestamps
  - Test applyRemoteCodeUpdate discards older timestamps
  - Test joinEditorSession emits correct socket event
  - Test socket event listeners are registered
  - _Requirements: 1.1, 6.3, 6.4, 8.1_

- [ ] 12. Checkpoint - Frontend editor component complete
  - Ensure all tests pass, ask the user if questions arise.

### Phase 3: Multi-Cursor & Presence

- [ ] 13. Create TeammateCursor component
  - Create file `client/src/components/codewars/TeammateCursor.jsx`
  - Create file `client/src/components/codewars/TeammateCursor.css`
  - Define props interface (username, position, color, isVisible)
  - Render colored cursor indicator at specified position
  - Render username label above cursor
  - Implement smooth position transitions (100ms) using CSS transitions or Framer Motion
  - _Requirements: 2.2, 2.3, 2.4, 2.7_

- [ ] 14. Implement cursor auto-fade behavior
  - [ ] 14.1 Add inactivity timer to TeammateCursor
    - Track last cursor movement timestamp
    - Start 3-second timer on each movement
    - Fade out cursor opacity after 3 seconds of inactivity
    - _Requirements: 2.5_
  
  - [ ] 14.2 Restore cursor visibility on movement
    - Reset opacity to full when new position received
    - Restart inactivity timer
    - _Requirements: 2.6_

- [ ] 15. Integrate TeammateCursor into CollaborativeCodeEditor
  - Map over teammateCursors state to render TeammateCursor components
  - Assign unique color to each teammate from palette (blue, green, purple, orange)
  - Position cursors using absolute positioning based on line/ch coordinates
  - Convert editor line/ch to pixel coordinates for rendering
  - _Requirements: 2.2, 2.3_

- [ ] 16. Create TeammatePresence component
  - Create file `client/src/components/codewars/TeammatePresence.jsx`
  - Create file `client/src/components/codewars/TeammatePresence.css`
  - Define props interface (teammates array, currentUserId, currentQuestionId)
  - Render list of teammates with username and online status
  - Display "(You)" label for current user
  - Display current question indicator for each teammate
  - Display "Typing..." status when teammate is actively editing
  - _Requirements: 3.3, 3.4, 3.5, 3.7_

- [ ] 17. Implement presence tracking logic
  - [ ] 17.1 Set up socket listener for `cw-teammate-joined-editor`
    - Add teammate to presence list
    - Update UI to show new teammate
    - _Requirements: 3.1_
  
  - [ ] 17.2 Set up socket listener for `cw-teammate-left-editor`
    - Remove teammate from presence list
    - Update UI to remove teammate
    - _Requirements: 3.2_
  
  - [ ] 17.3 Implement typing status detection
    - Track last code change timestamp per teammate
    - Show "Typing..." if code change within last 2 seconds
    - Clear typing status after 2 seconds of inactivity
    - _Requirements: 3.5_

- [ ] 18. Integrate TeammatePresence into CollaborativeCodeEditor
  - Render TeammatePresence component above editor area
  - Pass teammates data from component state
  - Update teammates list based on socket events
  - _Requirements: 11.3_

- [ ]* 19. Write unit tests for cursor and presence components
  - Test TeammateCursor renders at correct position
  - Test TeammateCursor fades after 3 seconds
  - Test TeammateCursor restores opacity on movement
  - Test TeammatePresence displays all teammates
  - Test TeammatePresence shows "(You)" for current user
  - Test TeammatePresence updates on join/leave events
  - _Requirements: 2.5, 2.6, 3.1, 3.2, 3.7_

- [ ] 19. Checkpoint - Multi-cursor and presence complete
  - Ensure all tests pass, ask the user if questions arise.

### Phase 4: Integration & Testing

- [ ] 20. Integrate CollaborativeCodeEditor into CodeWarsArena page
  - [ ] 20.1 Import CollaborativeCodeEditor into CodeWarsArena.jsx
    - Add import statement for CollaborativeCodeEditor
    - Add import statement for TeammatePresence
  
  - [ ] 20.2 Add conditional rendering logic for solo vs team mode
    - Check if room.teamSize > 1 (team mode)
    - Render CollaborativeCodeEditor for team mode
    - Render standard editor for solo mode (teamSize === 1)
    - _Requirements: 11.6, 11.7_
  
  - [ ] 20.3 Pass required props to CollaborativeCodeEditor
    - Pass roomId from currentRoom.id
    - Pass teamId from user's team assignment
    - Pass questionId from current question
    - Pass userId and username from user context
    - Pass socket instance
    - Pass onSubmit handler for solution submission
    - Pass disabled prop based on game state
    - _Requirements: 11.1_

- [ ] 21. Implement solution submission integration
  - [ ] 21.1 Create `handleSubmitSolution(code)` callback in GameInterface
    - Emit `cw-submit-solution` socket event
    - Disable editor during evaluation
    - Show loading indicator
    - _Requirements: 7.1, 7.6_
  
  - [ ] 21.2 Handle submission response events
    - Listen for solution success/failure events
    - Display success toast with points awarded
    - Display failure toast with error details
    - Re-enable editor after evaluation
    - _Requirements: 7.4, 7.5, 7.7_

- [ ] 22. Implement editor state cleanup
  - [ ] 22.1 Clean up on component unmount
    - Emit `cw-leave-team-editor` when component unmounts
    - Remove socket event listeners
    - Clear local state
    - _Requirements: 3.2_
  
  - [ ] 22.2 Clean up on game end
    - Clear all editor states when game ends
    - Remove all active sessions
    - _Requirements: 5.6_

- [ ] 23. Add loading states and error notifications
  - Display loading spinner during initial editor sync
  - Display error notification for connection failures
  - Display warning for rate limit exceeded
  - Display reconnection status during network issues
  - _Requirements: 10.1, 10.5_

- [ ]* 24. Write integration tests for collaborative editing flow
  - Test complete join → edit → leave flow
  - Test 2 users editing simultaneously
  - Test code synchronization between users
  - Test cursor position updates between users
  - Test presence indicators update correctly
  - Test solution submission from team member
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 3.1, 3.2, 7.1_

- [ ]* 25. Perform manual testing scenarios
  - Test 2 users editing same line simultaneously
  - Test user disconnect and reconnect during editing
  - Test rapid typing from multiple users
  - Test submission while teammate is typing
  - Test team switching in lobby
  - Test 5 users (max team size) editing together
  - _Requirements: 1.3, 6.1, 10.1, 10.2_

- [ ] 26. Checkpoint - Integration and testing complete
  - Ensure all tests pass, ask the user if questions arise.

### Phase 5: Performance & Security

- [ ] 27. Implement rate limiting on server
  - [ ] 27.1 Create rate limiter utility
    - Create file `server/utils/rateLimiter.js`
    - Implement `checkRateLimit(userId, eventType, maxPerSecond)` function
    - Use Map to track events per user with timestamps
    - Remove events older than 1 second
    - Return true/false for rate limit check
    - _Requirements: 12.1, 12.2_
  
  - [ ] 27.2 Apply rate limiting to code change events
    - Call checkRateLimit() in `cw-code-change` handler
    - Limit to 20 events per second per user
    - Drop excess events and emit warning
    - _Requirements: 12.1, 12.3_
  
  - [ ] 27.3 Apply rate limiting to cursor move events
    - Call checkRateLimit() in `cw-cursor-move` handler
    - Limit to 50 events per second per user
    - Drop excess events silently
    - _Requirements: 12.2, 12.3_

- [ ] 28. Implement security validations
  - [ ] 28.1 Add input sanitization for code content
    - Sanitize code before broadcasting to prevent script injection
    - Validate code size limit (50KB)
    - Reject oversized payloads with error
    - _Requirements: 8.5, 8.6, 12.4_
  
  - [ ] 28.2 Add access control validations
    - Verify user belongs to team before allowing editor operations
    - Verify room exists and is active
    - Verify question exists in room
    - Emit error event for unauthorized access attempts
    - Log unauthorized attempts
    - _Requirements: 4.3, 4.4, 4.6, 12.5, 12.6_
  
  - [ ] 28.3 Add authentication check
    - Verify JWT token on socket connection
    - Store authenticated user ID in socket session
    - Reject unauthenticated connections
    - _Requirements: 12.6_

- [ ] 29. Optimize client-side performance
  - [ ] 29.1 Verify debouncing and throttling parameters
    - Confirm code changes debounced to 100ms
    - Confirm cursor moves throttled to 50ms
    - Adjust if needed based on testing
    - _Requirements: 8.1, 8.2_
  
  - [ ] 29.2 Implement lazy loading for editor states
    - Only sync editor state for currently active question
    - Don't load all questions' states upfront
    - Load on-demand when user switches questions
    - _Requirements: 8.3_
  
  - [ ] 29.3 Optimize cursor rendering
    - Use CSS transforms for cursor positioning (better performance)
    - Debounce cursor render updates if needed
    - Limit number of visible cursors if team size > 5

- [ ] 30. Implement state cleanup and memory management
  - [ ] 30.1 Add inactive session cleanup
    - Remove editor sessions inactive for 5 minutes
    - Clear cursor positions for inactive users
    - _Requirements: 5.7_
  
  - [ ] 30.2 Add game end cleanup
    - Clear all editor states when game ends
    - Clear all active sessions
    - Clear all cursor positions
    - _Requirements: 5.6_

- [ ]* 31. Perform load testing
  - Test 10+ concurrent team battles
  - Test 5 users editing simultaneously per team
  - Test rapid code updates (100 updates/sec)
  - Measure latency (target: <100ms for code updates)
  - Measure memory usage over 30-minute session
  - Verify no memory leaks
  - _Requirements: 1.1, 8.4_

- [ ]* 32. Write security tests
  - Test cross-team access is blocked
  - Test unauthorized socket connections are rejected
  - Test rate limiting enforcement
  - Test code sanitization prevents injection
  - Test oversized payloads are rejected
  - _Requirements: 4.4, 4.5, 4.6, 12.1, 12.2, 12.4_

- [ ] 33. Final checkpoint - Performance and security complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation at the end of each phase
- The implementation uses JavaScript/React as specified in the design document
- Socket.io is used for real-time communication (already in project)
- Lodash is used for debounce/throttle utilities
- CodeMirror or Monaco Editor will be chosen during Phase 2 implementation
- All collaborative editing logic reuses existing IntraFactionArena infrastructure
- Team isolation is enforced through Socket.io room namespaces
- Conflict resolution uses Last-Write-Wins strategy with timestamps
- Rate limiting prevents abuse and ensures system stability
- Security validations protect against unauthorized access and injection attacks

## Success Criteria

- Code updates appear within 100ms for teammates (95% of updates)
- Multi-cursor display updates within 50ms
- Teammates can edit simultaneously without data loss
- Team isolation prevents cross-team code visibility
- System supports 5 users editing per team without lag
- System supports 10+ concurrent team battles
- All security validations pass
- All unit and integration tests pass
