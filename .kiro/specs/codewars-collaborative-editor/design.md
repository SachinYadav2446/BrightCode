# Design Document: Code Wars Collaborative Editor

## Overview

The Code Wars Collaborative Editor feature enables real-time collaborative code editing for team-based battles in the Code Wars Arena. This system allows teammates (1-5 members per team) to work together on the same coding problem simultaneously, with real-time code synchronization, multi-cursor display, and teammate presence indicators.

The implementation leverages Socket.io for real-time communication and integrates seamlessly with the existing IntraFactionArena infrastructure. The design prioritizes team isolation, conflict-free editing, and low-latency synchronization to provide a smooth collaborative experience.

### Key Design Goals

1. **Real-Time Synchronization**: Code changes appear within 100ms for all teammates
2. **Team Isolation**: Strict separation ensures teams cannot see each other's code
3. **Conflict-Free Editing**: Last-Write-Wins strategy with timestamps prevents data loss
4. **Scalability**: Support up to 5 teammates editing simultaneously per question
5. **Seamless Integration**: Reuse existing socket infrastructure and room management

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
├─────────────────────────────────────────────────────────────┤
│  CollaborativeCodeEditor                                     │
│  ├─ CodeMirror/Monaco Editor Integration                    │
│  ├─ Local State Management                                   │
│  ├─ Optimistic Updates                                       │
│  └─ Socket Event Handlers                                    │
│                                                              │
│  TeammatePresence Component                                  │
│  ├─ Active Users Display                                     │
│  ├─ Typing Indicators                                        │
│  └─ Question Location Tracking                               │
│                                                              │
│  TeammateCursor Component                                    │
│  ├─ Cursor Rendering                                         │
│  ├─ Position Animations                                      │
│  └─ Username Labels                                          │
└─────────────────────────────────────────────────────────────┘
                            ↕ Socket.io
┌─────────────────────────────────────────────────────────────┐
│                     Server Layer                             │
├─────────────────────────────────────────────────────────────┤
│  IntraFactionArena (Enhanced)                                │
│  ├─ teamEditorStates: Map<roomId, Map<teamId, Map<...>>>   │
│  ├─ activeEditorSessions: Map<roomId, Map<teamId, Set>>    │
│  ├─ joinTeamEditor()                                         │
│  ├─ leaveTeamEditor()                                        │
│  ├─ updateTeamCode()                                         │
│  ├─ getTeamEditorState()                                     │
│  └─ broadcastToTeam()                                        │
│                                                              │
│  Socket Event Handlers (server/index.js)                     │
│  ├─ cw-join-team-editor                                      │
│  ├─ cw-code-change                                           │
│  ├─ cw-cursor-move                                           │
│  └─ cw-submit-solution                                       │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User Types Code**
   - Local editor updates immediately (optimistic)
   - Debounced broadcast (100ms) to server
   - Server validates and broadcasts to team
   - Teammates receive and apply update

2. **Cursor Movement**
   - Throttled broadcast (50ms) to server
   - Server broadcasts to team members only
   - Teammates render cursor at new position

3. **Join Editor Session**
   - Client requests current editor state
   - Server sends full sync (code + all cursors)
   - Client initializes editor with synced state
   - Server notifies teammates of new participant

---

## Components and Interfaces

### Frontend Components

#### 1. CollaborativeCodeEditor

**Purpose**: Main editor component with real-time synchronization

**Props**:
```typescript
interface CollaborativeCodeEditorProps {
  roomId: string;
  teamId: string;
  questionId: string;
  userId: string;
  username: string;
  socket: Socket;
  initialCode?: string;
  language: string;
  onSubmit: (code: string) => void;
  disabled: boolean;
}
```

**State**:
```typescript
interface EditorState {
  code: string;
  localCursorPosition: { line: number; ch: number };
  teammateCursors: Map<string, { line: number; ch: number; username: string }>;
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncTimestamp: number;
}
```

**Key Methods**:
- `handleCodeChange(newCode: string)`: Debounced code update broadcaster
- `handleCursorMove(position: CursorPosition)`: Throttled cursor broadcaster
- `applyRemoteCodeUpdate(update: CodeUpdate)`: Apply teammate's code change
- `syncEditorState()`: Request full state sync from server
- `joinEditorSession()`: Initialize collaborative session

#### 2. TeammatePresence

**Purpose**: Display active teammates and their current activities

**Props**:
```typescript
interface TeammatePresenceProps {
  teammates: Array<{
    id: string;
    username: string;
    isActive: boolean;
    currentQuestion: string | null;
    isTyping: boolean;
  }>;
  currentUserId: string;
  currentQuestionId: string;
}
```

**Features**:
- Real-time online/offline status
- Current question indicator
- Typing status animation
- "(You)" label for current user

#### 3. TeammateCursor

**Purpose**: Render teammate cursor positions in the editor

**Props**:
```typescript
interface TeammateCursorProps {
  username: string;
  position: { line: number; ch: number };
  color: string;
  isVisible: boolean;
}
```

**Features**:
- Smooth position transitions (100ms)
- Auto-fade after 3 seconds of inactivity
- Username label above cursor
- Unique color per teammate

### Backend Enhancements

#### IntraFactionArena Class Extensions

**New Properties**:
```javascript
class IntraFactionArena {
  // Existing properties...
  
  // Editor state: roomId -> teamId -> questionId -> EditorState
  teamEditorStates = new Map();
  
  // Active sessions: roomId -> teamId -> questionId -> Set<userId>
  activeEditorSessions = new Map();
  
  // Cursor positions: roomId -> teamId -> questionId -> userId -> position
  cursorPositions = new Map();
}
```

**New Methods**:

```javascript
// Join a team's editor session for a specific question
joinTeamEditor(roomId, teamId, questionId, userId, username) {
  // Validate user belongs to team
  // Add to active sessions
  // Return current editor state
}

// Leave editor session
leaveTeamEditor(roomId, teamId, questionId, userId) {
  // Remove from active sessions
  // Broadcast departure to team
}

// Update team's code for a question
updateTeamCode(roomId, teamId, questionId, code, userId, cursorPosition, timestamp) {
  // Validate timestamp (conflict resolution)
  // Update editor state
  // Return success/conflict status
}

// Get current editor state
getTeamEditorState(roomId, teamId, questionId) {
  // Return { code, cursors, lastEdit, timestamp }
}

// Broadcast event to team members only
broadcastToTeam(roomId, teamId, questionId, event, data, excludeUserId) {
  // Emit to team-specific socket room
}

// Update cursor position
updateCursorPosition(roomId, teamId, questionId, userId, position) {
  // Store cursor position
  // No persistence needed (ephemeral)
}
```

---

## Data Models

### Editor State Structure

```javascript
{
  roomId: "ABC123",
  teamId: "team_1",
  questionId: "question-1",
  editorState: {
    code: "function solution() {\n  // Team code here\n}",
    language: "javascript",
    cursors: {
      "user-1": { line: 2, ch: 10, username: "Alice" },
      "user-2": { line: 5, ch: 3, username: "Bob" }
    },
    lastEdit: "user-1",
    timestamp: 1704067200000
  }
}
```

### Socket Room Naming Convention

```javascript
// Team-specific editor room for a question
const teamEditorRoom = `cw-${roomId}-team-${teamId}-q-${questionId}`;

// Example: "cw-ABC123-team-team_1-q-question-1"
```

### Code Update Message

```javascript
{
  roomId: "ABC123",
  teamId: "team_1",
  questionId: "question-1",
  code: "function solution() {...}",
  cursorPosition: { line: 5, ch: 10 },
  userId: "user-1",
  username: "Alice",
  timestamp: 1704067200000
}
```

### Cursor Update Message

```javascript
{
  roomId: "ABC123",
  teamId: "team_1",
  questionId: "question-1",
  position: { line: 8, ch: 15 },
  userId: "user-2",
  username: "Bob"
}
```

---

## Testing Strategy

### Unit Tests

The collaborative editor feature involves real-time UI interactions, WebSocket communication, and external service dependencies (Socket.io server). Property-based testing is **not appropriate** for this feature because:

1. **Real-Time UI Interactions**: Testing cursor rendering, typing indicators, and presence displays requires specific UI state verification, not universal properties
2. **WebSocket Communication**: Socket events are side-effect-only operations with no return values to assert properties on
3. **External Dependencies**: The feature relies heavily on Socket.io server behavior, which is already tested by the library authors
4. **State Synchronization**: While synchronization logic exists, it's tightly coupled to socket events and UI updates, making it unsuitable for pure property-based testing

**Unit Test Coverage**:

1. **Editor State Management**
   - Test initial state setup
   - Test code update application
   - Test cursor position updates
   - Test teammate join/leave handling

2. **Debouncing and Throttling**
   - Test code change debouncing (100ms)
   - Test cursor move throttling (50ms)
   - Test that rapid updates are properly batched

3. **Conflict Resolution**
   - Test Last-Write-Wins with older timestamp (should discard)
   - Test Last-Write-Wins with newer timestamp (should apply)
   - Test concurrent edits to different code sections

4. **Team Isolation**
   - Test that socket room names are team-specific
   - Test that broadcasts only reach team members
   - Test that cross-team access is rejected

5. **Error Handling**
   - Test reconnection logic
   - Test invalid event payload handling
   - Test missing user/team validation

**Example Unit Tests**:

```javascript
describe('CollaborativeCodeEditor', () => {
  test('applies remote code update with newer timestamp', () => {
    const editor = new CollaborativeCodeEditor(props);
    editor.state.lastSyncTimestamp = 1000;
    
    const update = {
      code: 'new code',
      timestamp: 2000,
      userId: 'user-2'
    };
    
    editor.applyRemoteCodeUpdate(update);
    expect(editor.state.code).toBe('new code');
    expect(editor.state.lastSyncTimestamp).toBe(2000);
  });
  
  test('discards remote code update with older timestamp', () => {
    const editor = new CollaborativeCodeEditor(props);
    editor.state.code = 'current code';
    editor.state.lastSyncTimestamp = 2000;
    
    const update = {
      code: 'old code',
      timestamp: 1000,
      userId: 'user-2'
    };
    
    editor.applyRemoteCodeUpdate(update);
    expect(editor.state.code).toBe('current code');
  });
  
  test('debounces code changes to 100ms', async () => {
    const mockBroadcast = jest.fn();
    const editor = new CollaborativeCodeEditor({ ...props, broadcast: mockBroadcast });
    
    editor.handleCodeChange('a');
    editor.handleCodeChange('ab');
    editor.handleCodeChange('abc');
    
    expect(mockBroadcast).not.toHaveBeenCalled();
    
    await new Promise(resolve => setTimeout(resolve, 150));
    expect(mockBroadcast).toHaveBeenCalledTimes(1);
    expect(mockBroadcast).toHaveBeenCalledWith('abc');
  });
});

describe('IntraFactionArena - Collaborative Editing', () => {
  test('creates team-specific editor state', () => {
    const arena = new IntraFactionArena(io, factions);
    arena.joinTeamEditor('room1', 'team_1', 'q1', 'user1', 'Alice');
    
    const state = arena.getTeamEditorState('room1', 'team_1', 'q1');
    expect(state).toBeDefined();
    expect(state.code).toBe('');
    expect(state.cursors).toEqual({});
  });
  
  test('isolates teams - team_1 cannot access team_2 state', () => {
    const arena = new IntraFactionArena(io, factions);
    arena.updateTeamCode('room1', 'team_1', 'q1', 'team 1 code', 'user1', {}, Date.now());
    arena.updateTeamCode('room1', 'team_2', 'q1', 'team 2 code', 'user2', {}, Date.now());
    
    const team1State = arena.getTeamEditorState('room1', 'team_1', 'q1');
    const team2State = arena.getTeamEditorState('room1', 'team_2', 'q1');
    
    expect(team1State.code).toBe('team 1 code');
    expect(team2State.code).toBe('team 2 code');
    expect(team1State.code).not.toBe(team2State.code);
  });
});
```

### Integration Tests

1. **Socket Event Flow**
   - Test complete join → edit → leave flow
   - Test multi-user editing scenarios
   - Test reconnection and state sync

2. **End-to-End Collaboration**
   - Test 2 users editing simultaneously
   - Test 5 users (max team size) editing
   - Test rapid typing from multiple users

3. **Performance Tests**
   - Test latency under load (100 updates/sec)
   - Test memory usage with long editing sessions
   - Test cleanup after session ends

### Manual Testing Scenarios

1. **Concurrent Editing**
   - Two users edit the same line simultaneously
   - Verify Last-Write-Wins resolves correctly
   - Verify no data loss

2. **Network Issues**
   - Disconnect one user mid-edit
   - Verify reconnection syncs state
   - Verify other users continue unaffected

3. **Submission During Editing**
   - One user submits while another is typing
   - Verify submission uses latest code
   - Verify editor locks for all teammates

4. **Team Switching**
   - User switches teams in lobby
   - Verify they leave old team's editor sessions
   - Verify they can join new team's sessions

---

## Error Handling

### Client-Side Error Handling

1. **Connection Loss**
   - Display "Reconnecting..." indicator
   - Attempt automatic reconnection
   - Request full state sync on reconnect
   - Show error if reconnection fails after 30 seconds

2. **Invalid Updates**
   - Log error to console
   - Request full state sync
   - Display non-intrusive notification to user

3. **Rate Limit Exceeded**
   - Display warning notification
   - Temporarily disable broadcasting
   - Resume after cooldown period

### Server-Side Error Handling

1. **Invalid Event Payloads**
   - Validate all required fields
   - Emit error event to sender with descriptive message
   - Log validation failure for monitoring

2. **Unauthorized Access**
   - Verify user belongs to team
   - Reject join/update requests
   - Log unauthorized attempt
   - Emit error event to user

3. **Room/Team Not Found**
   - Return descriptive error
   - Suggest user refresh or rejoin room

4. **Timestamp Conflicts**
   - Apply Last-Write-Wins strategy
   - Log conflict for monitoring
   - Continue operation (no user-facing error)

### Error Recovery Strategies

1. **State Desynchronization**
   - Client detects mismatch (e.g., unexpected code)
   - Automatically request full sync
   - Apply synced state
   - Resume normal operation

2. **Socket Disconnect**
   - Client attempts reconnection (exponential backoff)
   - On reconnect, rejoin all editor sessions
   - Request state sync for each session
   - Notify teammates of reconnection

3. **Server Restart**
   - All editor states lost (in-memory)
   - Clients detect disconnect
   - On reconnect, initialize fresh editor states
   - Teams start with empty code (acceptable for in-progress games)

---

## Security Considerations

### Team Isolation

1. **Socket Room Namespaces**
   - Use team-specific room names: `cw-${roomId}-team-${teamId}-q-${questionId}`
   - Socket.io automatically isolates broadcasts to room members only
   - Server validates user belongs to team before joining room

2. **Access Control**
   - Verify user is in team before allowing editor operations
   - Check room status (must be active)
   - Validate question exists in room

3. **Data Sanitization**
   - Sanitize code content before broadcasting (prevent script injection)
   - Validate cursor positions are within valid ranges
   - Limit code size to 50KB per update

### Rate Limiting

1. **Code Change Events**
   - Maximum 20 events per second per user
   - Enforced at server level
   - Excess events dropped with warning

2. **Cursor Move Events**
   - Maximum 50 events per second per user
   - Enforced at server level
   - Excess events dropped silently

3. **Rate Limit Enforcement**
   ```javascript
   const rateLimits = new Map(); // userId -> { codeChanges: [], cursorMoves: [] }
   
   function checkRateLimit(userId, eventType, maxPerSecond) {
     const now = Date.now();
     const userLimits = rateLimits.get(userId) || { codeChanges: [], cursorMoves: [] };
     
     // Remove events older than 1 second
     userLimits[eventType] = userLimits[eventType].filter(t => now - t < 1000);
     
     if (userLimits[eventType].length >= maxPerSecond) {
       return false; // Rate limit exceeded
     }
     
     userLimits[eventType].push(now);
     rateLimits.set(userId, userLimits);
     return true;
   }
   ```

### Authentication

1. **Socket Authentication**
   - Verify JWT token on socket connection
   - Store authenticated user ID in socket session
   - Reject unauthenticated socket connections

2. **Event Authorization**
   - Verify user ID matches socket session
   - Verify user belongs to specified team
   - Verify user is in specified room

---

## Performance Optimizations

### Client-Side Optimizations

1. **Debouncing Code Updates**
   - Debounce broadcasts to 100ms
   - Reduces network traffic by ~90% during typing
   - Implementation:
   ```javascript
   const debouncedBroadcast = debounce((code) => {
     socket.emit('cw-code-change', {
       roomId, teamId, questionId, code,
       cursorPosition, userId, timestamp: Date.now()
     });
   }, 100);
   ```

2. **Throttling Cursor Updates**
   - Throttle broadcasts to 50ms
   - Reduces cursor update traffic
   - Implementation:
   ```javascript
   const throttledCursorBroadcast = throttle((position) => {
     socket.emit('cw-cursor-move', {
       roomId, teamId, questionId, position, userId
     });
   }, 50);
   ```

3. **Optimistic Updates**
   - Apply local changes immediately
   - Don't wait for server confirmation
   - Provides instant feedback to user

4. **Lazy Loading**
   - Only sync editor state for active question
   - Don't load all questions' editor states upfront
   - Load on-demand when user switches questions

### Server-Side Optimizations

1. **In-Memory State Storage**
   - Store editor states in memory (Map structures)
   - No database writes for ephemeral editor state
   - Fast read/write operations

2. **Efficient Broadcasting**
   - Use Socket.io rooms for targeted broadcasts
   - Only send to team members, not entire room
   - Reduces unnecessary network traffic

3. **State Cleanup**
   - Remove inactive editor sessions after 5 minutes
   - Clear editor states when game ends
   - Prevent memory leaks

4. **Payload Size Limits**
   - Limit code updates to 50KB
   - Reject oversized payloads
   - Prevents bandwidth abuse

### Network Optimizations

1. **Binary Protocol**
   - Socket.io uses binary protocol for efficiency
   - Reduces overhead compared to HTTP polling

2. **Compression**
   - Enable Socket.io compression for large payloads
   - Reduces bandwidth usage

3. **Connection Pooling**
   - Reuse existing socket connections
   - Avoid connection overhead

---

## Implementation Phases

### Phase 1: Backend Foundation (Days 1-2)

**Tasks**:
1. Extend IntraFactionArena class with editor state management
2. Implement socket event handlers (join, code-change, cursor-move)
3. Add team-specific socket room creation
4. Implement conflict resolution (Last-Write-Wins)
5. Add rate limiting for code and cursor events
6. Write unit tests for backend logic

**Deliverables**:
- Enhanced IntraFactionArena class
- Socket event handlers in server/index.js
- Unit tests for state management and conflict resolution

### Phase 2: Frontend Editor Component (Days 3-4)

**Tasks**:
1. Create CollaborativeCodeEditor component
2. Integrate with CodeMirror or Monaco Editor
3. Implement real-time code synchronization
4. Add cursor position tracking and broadcasting
5. Implement optimistic updates
6. Add debouncing and throttling
7. Write unit tests for editor component

**Deliverables**:
- CollaborativeCodeEditor component
- Real-time code sync functionality
- Unit tests for editor logic

### Phase 3: Multi-Cursor & Presence (Days 5-6)

**Tasks**:
1. Create TeammateCursor component
2. Implement cursor rendering with colors and labels
3. Add cursor position animations
4. Create TeammatePresence component
5. Implement presence indicators and typing status
6. Add auto-fade for inactive cursors
7. Write unit tests for cursor and presence components

**Deliverables**:
- TeammateCursor component
- TeammatePresence component
- Visual indicators for teammate activity

### Phase 4: Integration & Testing (Days 7-8)

**Tasks**:
1. Integrate collaborative editor into CodeWarsArena page
2. Add conditional rendering (solo vs team mode)
3. Implement error handling and reconnection logic
4. Add loading states and error notifications
5. Write integration tests
6. Perform manual testing with multiple users
7. Fix bugs and edge cases

**Deliverables**:
- Fully integrated collaborative editor
- Integration tests
- Bug fixes and polish

### Phase 5: Performance & Security (Days 9-10)

**Tasks**:
1. Optimize debouncing and throttling parameters
2. Add performance monitoring
3. Implement security validations
4. Add rate limiting enforcement
5. Perform load testing
6. Optimize network payload sizes
7. Final testing and documentation

**Deliverables**:
- Performance optimizations
- Security hardening
- Load test results
- Complete documentation

---

## Success Metrics

1. **Latency**: Code updates appear within 100ms for 95% of updates
2. **Reliability**: 99.9% message delivery rate
3. **Usability**: Users can edit simultaneously without conflicts
4. **Performance**: No lag with 5 users editing same code
5. **Scalability**: Support 10+ concurrent team battles
6. **Security**: Zero cross-team data leaks

---

## Future Enhancements

1. **Operational Transform (OT)**
   - Replace Last-Write-Wins with OT algorithm
   - Better conflict resolution for simultaneous edits
   - Preserve all user intentions

2. **Voice Chat Integration**
   - Built-in team voice chat during battles
   - WebRTC-based communication
   - Push-to-talk or always-on modes

3. **Code Comments**
   - Inline comments visible to team
   - Threaded discussions on specific lines
   - Resolve/unresolve comment threads

4. **Synchronized Undo/Redo**
   - Team-wide undo/redo history
   - Preserve edit history across teammates
   - Conflict-free undo operations

5. **AI Code Suggestions**
   - AI-powered code completion
   - Suggestions visible to entire team
   - Accept/reject suggestions collaboratively

6. **Replay Mode**
   - Record editing session
   - Replay how team solved problem
   - Educational tool for learning

7. **Code Review Mode**
   - Post-game code review
   - Annotate and discuss solutions
   - Compare with other teams' solutions

---

## Dependencies

### Frontend Dependencies

- **React**: UI framework (already in project)
- **Socket.io-client**: WebSocket communication (already in project)
- **CodeMirror** or **Monaco Editor**: Code editor component
- **Framer Motion**: Animations (already in project)
- **Lodash**: Debounce and throttle utilities

### Backend Dependencies

- **Socket.io**: WebSocket server (already in project)
- **UUID**: Generate unique IDs (already in project)
- **Express**: HTTP server (already in project)

### Development Dependencies

- **Jest**: Unit testing (already in project)
- **React Testing Library**: Component testing
- **Socket.io-mock**: Mock socket connections for testing

---

## Risks and Mitigation

### Risk 1: Network Latency

**Impact**: High latency could make collaboration feel sluggish

**Mitigation**:
- Implement optimistic updates for instant local feedback
- Use debouncing and throttling to reduce network traffic
- Display latency indicator if connection is slow

### Risk 2: State Desynchronization

**Impact**: Teammates see different code versions

**Mitigation**:
- Implement robust conflict resolution (Last-Write-Wins)
- Add automatic state sync on reconnection
- Provide manual "Sync" button for users

### Risk 3: Security Vulnerabilities

**Impact**: Teams could potentially see each other's code

**Mitigation**:
- Use team-specific socket rooms with strict isolation
- Validate all access control on server side
- Add comprehensive security tests

### Risk 4: Performance Degradation

**Impact**: System slows down with many concurrent users

**Mitigation**:
- Implement rate limiting
- Use efficient in-memory data structures
- Add performance monitoring and alerts

### Risk 5: Browser Compatibility

**Impact**: Feature may not work on all browsers

**Mitigation**:
- Test on major browsers (Chrome, Firefox, Safari, Edge)
- Use polyfills for older browsers
- Provide fallback to non-collaborative editor if needed

---

## Conclusion

The Code Wars Collaborative Editor design provides a comprehensive blueprint for implementing real-time collaborative code editing in team-based battles. The architecture leverages existing infrastructure (Socket.io, IntraFactionArena) while adding new components for synchronization, presence, and multi-cursor support.

The design prioritizes:
- **Low latency** through optimistic updates and efficient broadcasting
- **Team isolation** through socket room namespaces and access control
- **Conflict-free editing** through Last-Write-Wins strategy
- **Scalability** through in-memory state management and rate limiting
- **Security** through validation, sanitization, and authentication

The phased implementation approach allows for incremental development and testing, with clear deliverables at each stage. The testing strategy focuses on unit tests and integration tests, as property-based testing is not suitable for this real-time UI and WebSocket-based feature.

This design is ready for implementation and will significantly enhance the collaborative experience in Code Wars Arena battles.
