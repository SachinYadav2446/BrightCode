# Submissions Tab Map Error Fix

## Error
```
TypeError: room.submissions?.get is not a function
```

## Root Cause
The `room.submissions` is a `Map` object on the server side, but when sent to the client via socket, it gets serialized to a plain JavaScript object by the `sanitizeRoomForClient()` method.

### Server-Side (intraFactionArena.js)
```javascript
sanitizeRoomForClient(room) {
    // ...
    if (sanitized.submissions instanceof Map) {
        sanitized.submissions = Object.fromEntries(sanitized.submissions);
    }
    // ...
}
```

This converts:
- `Map { userId1 => [...], userId2 => [...] }`
- To: `{ userId1: [...], userId2: [...] }`

### Client-Side Issue
The Submissions tab code was trying to use Map methods on a plain object:
```javascript
// ❌ WRONG - .get() doesn't exist on plain objects
room.submissions?.get(user.id)

// ✅ CORRECT - Use bracket notation for objects
room.submissions?.[user.id]
```

## Fix Applied

Changed all instances of `room.submissions.get(user.id)` to `room.submissions[user.id]` in the Submissions tab:

**File**: `client/src/pages/CodeWarsArena.jsx`

### Before
```javascript
{room.submissions?.get(user.id)?.filter(s => s.questionId === currentQuestion.id).length || 0} submissions

{room.submissions?.get(user.id)?.filter(s => s.questionId === currentQuestion.id).length > 0 ? (
    room.submissions.get(user.id)
        .filter(s => s.questionId === currentQuestion.id)
        .reverse()
        .map((submission, index) => (
```

### After
```javascript
{room.submissions?.[user.id]?.filter(s => s.questionId === currentQuestion.id).length || 0} submissions

{room.submissions?.[user.id]?.filter(s => s.questionId === currentQuestion.id).length > 0 ? (
    room.submissions[user.id]
        .filter(s => s.questionId === currentQuestion.id)
        .reverse()
        .map((submission, index) => (
```

## Why This Happened
When implementing the Submissions tab feature, the code was written assuming `room.submissions` would be a Map (like it is on the server), but didn't account for the serialization that happens when sending data over sockets.

## Testing
1. Start a CodeWars contest
2. Submit a solution to a question
3. Click on the "Submissions" tab
4. Should now see the submissions list without errors

## Related Files
- `client/src/pages/CodeWarsArena.jsx` - Fixed Map.get() calls
- `server/intraFactionArena.js` - Contains sanitizeRoomForClient() method
- `SUBMISSIONS_TAB_FEATURE.md` - Original feature documentation
