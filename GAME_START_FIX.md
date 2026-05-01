# Game Start Fix - Map Serialization Issue

## 🐛 Problem

When starting the game, both players got an error:
```
TypeError: room.scores.get is not a function
```

## 🔍 Root Cause

The server uses JavaScript `Map` objects for `room.scores` and `room.submissions`:

```javascript
// Server side (intraFactionArena.js)
scores: new Map(), // teamId -> score
submissions: new Map(), // playerId -> submissions array
```

However, when these are sent via Socket.io, Maps are **not properly serialized** and become empty objects `{}` on the client side. This causes `.get()` method to fail because plain objects don't have a `.get()` method.

## ✅ Solution

### 1. **Server Side: Convert Maps to Objects**

Modified `sanitizeRoomForClient()` in `server/intraFactionArena.js`:

```javascript
sanitizeRoomForClient(room) {
    // Remove sensitive data and convert Maps to objects before sending to client
    const sanitized = { ...room };
    delete sanitized.password; // Don't send password to clients
    
    // Convert Map objects to plain objects for JSON serialization
    if (sanitized.scores instanceof Map) {
        sanitized.scores = Object.fromEntries(sanitized.scores);
    }
    if (sanitized.submissions instanceof Map) {
        sanitized.submissions = Object.fromEntries(sanitized.submissions);
    }
    
    return sanitized;
}
```

**What this does:**
- Converts `Map` to plain object using `Object.fromEntries()`
- Example: `Map { 'team_1' => 100 }` becomes `{ 'team_1': 100 }`

### 2. **Client Side: Use Object Property Access**

Changed from Map methods to object property access in `client/src/pages/CodeWarsArena.jsx`:

**Before:**
```javascript
room.scores.get(team.id)
```

**After:**
```javascript
room.scores?.[team.id]
```

**Why `?.` (optional chaining)?**
- Safely handles cases where `scores` might be undefined
- Prevents errors if room data is incomplete

## 📋 Changes Made

### Files Modified:

1. **`server/intraFactionArena.js`**
   - Enhanced `sanitizeRoomForClient()` method
   - Converts Maps to objects before sending to client

2. **`client/src/pages/CodeWarsArena.jsx`**
   - Changed `room.scores.get(team.id)` to `room.scores?.[team.id]`
   - Updated in 2 locations (spectator view and game interface)

## 🧪 Testing

### Test Steps:

1. **Create Room** (Account 1)
   - Login and create a public room
   - Wait for Account 2 to join

2. **Join Room** (Account 2)
   - Login and join Account 1's room

3. **Start Game** (Account 1)
   - Click "Start Game" button
   - ✅ Both players should see game interface
   - ✅ No error messages
   - ✅ Timer counting down
   - ✅ Questions displayed
   - ✅ Team scores showing as "0"

### Expected Behavior:

- ✅ Game starts successfully for both players
- ✅ No "room.scores.get is not a function" error
- ✅ Team scores display correctly (initially 0)
- ✅ Timer works
- ✅ Questions are visible
- ✅ Code editor is functional

## 🎓 Technical Details

### Why Maps Don't Serialize Well

JavaScript Maps are not JSON-serializable by default:

```javascript
// Server
const scores = new Map([['team_1', 100]]);
JSON.stringify(scores); // Returns: "{}"  ❌

// After conversion
const scoresObj = Object.fromEntries(scores);
JSON.stringify(scoresObj); // Returns: '{"team_1":100}' ✅
```

### Socket.io Serialization

Socket.io uses JSON serialization under the hood:
1. Server sends data → JSON.stringify()
2. Network transfer
3. Client receives → JSON.parse()

Maps lose their structure in this process, so we must convert them to plain objects.

## 🔮 Future Improvements

1. **Consistent Data Structures**
   - Consider using plain objects throughout instead of Maps
   - Or implement custom serialization/deserialization

2. **Type Safety**
   - Add TypeScript for better type checking
   - Prevent Map/Object confusion at compile time

3. **Validation**
   - Add runtime validation for room data structure
   - Ensure scores object exists before accessing

## ✨ Status

**FIXED** ✅

The game now starts successfully for both players without errors. Team scores are properly displayed and updated during gameplay.

---

**Last Updated**: May 1, 2026
**Issue**: TypeError: room.scores.get is not a function
**Status**: Resolved
