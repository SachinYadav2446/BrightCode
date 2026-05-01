# Code Wars Arena - Collaborative Editor Specification

## Overview
Implement real-time collaborative code editing for team-based battles, allowing teammates to work together on the same problem simultaneously.

---

## Goals
1. Enable real-time code synchronization between teammates
2. Show teammate presence and cursor positions
3. Maintain separate editor states per team per question
4. Reuse existing Workspace collaborative infrastructure
5. Ensure smooth, conflict-free editing experience

---

## Architecture

### Data Structure
```javascript
// Room State Enhancement
{
  id: "room-123",
  teams: [
    {
      id: "team-a",
      name: "Team Alpha",
      players: ["user1", "user2"],
      editorStates: {
        "question-1": {
          code: "function solution() {...}",
          language: "javascript",
          cursors: {
            "user1": { line: 5, ch: 10 },
            "user2": { line: 8, ch: 3 }
          },
          lastEdit: "user1",
          timestamp: 1234567890
        },
        "question-2": { ... }
      }
    },
    {
      id: "team-b",
      name: "Team Beta",
      players: ["user3", "user4"],
      editorStates: { ... }
    }
  ]
}
```

---

## Socket Events

### Client → Server

#### 1. Join Team Editor Room
```javascript
socket.emit('cw-join-team-editor', {
  roomId: string,
  teamId: string,
  questionId: string,
  userId: string
});
```

#### 2. Code Change
```javascript
socket.emit('cw-code-change', {
  roomId: string,
  teamId: string,
  questionId: string,
  code: string,
  cursorPosition: { line: number, ch: number },
  userId: string,
  timestamp: number
});
```

#### 3. Cursor Move
```javascript
socket.emit('cw-cursor-move', {
  roomId: string,
  teamId: string,
  questionId: string,
  position: { line: number, ch: number },
  userId: string
});
```

#### 4. Submit Solution (Team)
```javascript
socket.emit('cw-submit-solution', {
  roomId: string,
  teamId: string,
  questionId: string,
  code: string,
  userId: string // Who submitted
});
```

### Server → Client

#### 1. Editor State Sync
```javascript
socket.emit('cw-editor-sync', {
  teamId: string,
  questionId: string,
  code: string,
  cursors: { [userId]: { line, ch } },
  lastEdit: string
});
```

#### 2. Teammate Code Update
```javascript
socket.emit('cw-teammate-code-update', {
  userId: string,
  username: string,
  code: string,
  cursorPosition: { line, ch },
  timestamp: number
});
```

#### 3. Teammate Cursor Update
```javascript
socket.emit('cw-teammate-cursor-update', {
  userId: string,
  username: string,
  position: { line, ch }
});
```

#### 4. Teammate Joined Editor
```javascript
socket.emit('cw-teammate-joined-editor', {
  userId: string,
  username: string,
  questionId: string
});
```

#### 5. Teammate Left Editor
```javascript
socket.emit('cw-teammate-left-editor', {
  userId: string,
  username: string,
  questionId: string
});
```

---

## Frontend Components

### 1. CollaborativeCodeEditor Component
```jsx
<CollaborativeCodeEditor
  roomId={string}
  teamId={string}
  questionId={string}
  userId={string}
  username={string}
  socket={Socket}
  onSubmit={(code) => void}
  disabled={boolean}
/>
```

**Features:**
- Real-time code synchronization
- Multi-cursor display
- Teammate presence indicators
- Typing indicators
- Conflict resolution

### 2. TeammatePresence Component
```jsx
<TeammatePresence
  teammates={Array<{id, username, active, cursor}>}
  currentQuestionId={string}
/>
```

**Features:**
- Show who's online
- Show who's editing which question
- Show typing status

### 3. TeammateCursor Component
```jsx
<TeammateCursor
  username={string}
  position={{ line, ch }}
  color={string}
/>
```

**Features:**
- Colored cursor with username label
- Smooth position transitions
- Auto-hide when inactive

---

## Backend Implementation

### 1. IntraFactionArena Class Updates

```javascript
class IntraFactionArena {
  // Existing properties...
  
  // New: Team editor states
  teamEditorStates = new Map(); // roomId -> teamId -> questionId -> state
  
  // New: Active editor sessions
  activeEditorSessions = new Map(); // roomId -> teamId -> questionId -> Set<userId>
  
  // New methods
  joinTeamEditor(roomId, teamId, questionId, userId) { }
  leaveTeamEditor(roomId, teamId, questionId, userId) { }
  updateTeamCode(roomId, teamId, questionId, code, userId, cursor) { }
  getTeamEditorState(roomId, teamId, questionId) { }
  broadcastToTeam(roomId, teamId, event, data, excludeUserId) { }
}
```

### 2. Socket Handler Updates (server/index.js)

```javascript
// Join team editor
socket.on('cw-join-team-editor', async (data) => {
  const { roomId, teamId, questionId, userId } = data;
  
  // Join team-specific room
  const teamRoom = `cw-${roomId}-team-${teamId}-q-${questionId}`;
  socket.join(teamRoom);
  
  // Get current editor state
  const editorState = intraFactionArena.getTeamEditorState(roomId, teamId, questionId);
  
  // Send current state to joining user
  socket.emit('cw-editor-sync', editorState);
  
  // Notify teammates
  socket.to(teamRoom).emit('cw-teammate-joined-editor', {
    userId,
    username: socket.username,
    questionId
  });
});

// Code change
socket.on('cw-code-change', async (data) => {
  const { roomId, teamId, questionId, code, cursorPosition, userId } = data;
  
  // Update team editor state
  intraFactionArena.updateTeamCode(roomId, teamId, questionId, code, userId, cursorPosition);
  
  // Broadcast to teammates only
  const teamRoom = `cw-${roomId}-team-${teamId}-q-${questionId}`;
  socket.to(teamRoom).emit('cw-teammate-code-update', {
    userId,
    username: socket.username,
    code,
    cursorPosition,
    timestamp: Date.now()
  });
});

// Cursor move
socket.on('cw-cursor-move', async (data) => {
  const { roomId, teamId, questionId, position, userId } = data;
  
  const teamRoom = `cw-${roomId}-team-${teamId}-q-${questionId}`;
  socket.to(teamRoom).emit('cw-teammate-cursor-update', {
    userId,
    username: socket.username,
    position
  });
});
```

---

## UI/UX Design

### Editor Layout
```
┌─────────────────────────────────────────────────────┐
│ Question 1: Two Sum                    [Submit]     │
├─────────────────────────────────────────────────────┤
│ Teammates: 👤 Alice (You)  👤 Bob (Editing...)     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  1  function twoSum(nums, target) {                │
│  2    // Alice's cursor ▌                          │
│  3    const map = new Map();                       │
│  4    for (let i = 0; i < nums.length; i++) {     │
│  5      const complement = target - nums[i];       │
│  6      if (map.has(complement)) {                 │
│  7        return [map.get(complement), i];         │
│  8      }                                           │
│  9      map.set(nums[i], i);  // Bob's cursor ▌   │
│ 10    }                                             │
│ 11    return [];                                    │
│ 12  }                                               │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Teammate Cursors
- **Different colors per teammate**
  - Alice: Blue (#3b82f6)
  - Bob: Green (#22c55e)
  - Charlie: Purple (#a855f7)
  - Diana: Orange (#f59e0b)

- **Cursor label**: Username above cursor
- **Fade out**: After 3 seconds of inactivity
- **Smooth transitions**: Animate cursor movements

### Presence Indicators
```
┌─────────────────────────────────────┐
│ 👤 Alice (You) - Question 1         │
│ 👤 Bob - Question 1 (Typing...)     │
└─────────────────────────────────────┘
```

---

## Conflict Resolution

### Strategy: Last Write Wins (LWW)
- Use timestamps to resolve conflicts
- Throttle updates to 100ms to reduce conflicts
- Show warning if code diverges significantly

### Optimistic Updates
1. User types → Update local state immediately
2. Send to server → Broadcast to teammates
3. If conflict → Server resolves and syncs all clients

---

## Performance Optimizations

1. **Throttle Code Updates**: 100-200ms debounce
2. **Diff-based Sync**: Only send changed portions
3. **Cursor Throttle**: 50ms for cursor movements
4. **Lazy Load**: Only sync active question editors
5. **Cleanup**: Remove inactive editor sessions after 5 minutes

---

## Security Considerations

1. **Team Isolation**: Ensure teams can't see each other's code
2. **Validation**: Verify user is in team before allowing edits
3. **Rate Limiting**: Prevent spam of code updates
4. **Sanitization**: Clean code before broadcasting

---

## Testing Strategy

### Unit Tests
- Editor state management
- Cursor position calculations
- Conflict resolution logic

### Integration Tests
- Socket event flow
- Multi-user editing scenarios
- Team isolation verification

### Manual Testing Scenarios
1. Two users editing same line simultaneously
2. One user submits while other is editing
3. User disconnects and reconnects
4. Rapid typing from multiple users

---

## Implementation Phases

### Phase 1: Backend Foundation (Day 1)
- [ ] Update IntraFactionArena class with editor state management
- [ ] Implement socket handlers for code sync
- [ ] Add team-specific socket rooms
- [ ] Test basic code synchronization

### Phase 2: Frontend Editor Component (Day 2)
- [ ] Create CollaborativeCodeEditor component
- [ ] Implement real-time code sync
- [ ] Add cursor position tracking
- [ ] Test with 2 users

### Phase 3: Multi-Cursor & Presence (Day 3)
- [ ] Implement teammate cursor rendering
- [ ] Add presence indicators
- [ ] Show typing status
- [ ] Add cursor colors and labels

### Phase 4: Polish & Optimization (Day 4)
- [ ] Add throttling and debouncing
- [ ] Implement conflict resolution
- [ ] Add animations and transitions
- [ ] Performance testing

### Phase 5: Testing & Bug Fixes (Day 5)
- [ ] End-to-end testing
- [ ] Fix edge cases
- [ ] Load testing with multiple teams
- [ ] Documentation

---

## Success Metrics

1. **Latency**: Code updates appear within 100ms
2. **Reliability**: 99.9% message delivery rate
3. **Usability**: Users can edit simultaneously without conflicts
4. **Performance**: No lag with 4 users editing same code

---

## Future Enhancements

1. **Voice Chat Integration**: Built-in team voice chat
2. **Code Comments**: Inline comments for team discussion
3. **Undo/Redo Sync**: Synchronized undo/redo across team
4. **Code Suggestions**: AI-powered suggestions visible to team
5. **Replay Mode**: Watch how team solved the problem

---

## Status: Ready for Implementation ✅

This spec provides a complete blueprint for implementing collaborative editing in Code Wars Arena. Ready to proceed with Phase 1!
