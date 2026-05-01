# Debug Guide: Room Not Showing Issue

## 🔍 Quick Debug Steps

### Step 1: Check Browser Console

Open browser console (F12) and look for these logs:

**When creating a room (Account 1):**
```
🏛️ User faction loaded: [Faction Name] ID: [faction-id]
🏗️ Creating room via socket...
✅ Room created via socket: { success: true, room: {...} }
📋 Requesting faction rooms via socket for faction: [faction-id]
📋 Received faction rooms: [array of rooms]
```

**When loading Code Wars Arena (Account 2):**
```
🏛️ User faction loaded: [Faction Name] ID: [faction-id]
📋 Loading faction rooms for: [faction-id]
📋 Requesting faction rooms via socket for faction: [faction-id]
📋 Received faction rooms: [array of rooms]
📋 Number of rooms: X
```

### Step 2: Check Server Console

Watch server terminal for:

**When room is created:**
```
🏗️ [CW Socket] Creating room - User: [username] (ID: [user-id]), Faction: [faction-id]
✅ [CW Socket] Room [ROOM_ID] created and joined
📊 [CW Socket] Total active rooms: 1
📊 [CW Socket] Room details: { id, name, isPrivate, factionId, ... }
```

**When faction rooms are requested:**
```
📋 [CW Socket] Getting rooms for faction [faction-id]
📋 [CW Socket] Found X public rooms for faction [faction-id]
📊 [CW Socket] Total active rooms in system: X
📊 [CW Socket] All rooms: [array showing all rooms with details]
```

### Step 3: Use Debug Button

1. Go to Code Wars Arena
2. Click the **"🔍 Debug Rooms"** button
3. Check browser console for:
   - Current faction info
   - Socket connection status
   - HTTP response with rooms
   - All rooms in system

### Step 4: Manual Checks

**In Browser Console, type:**
```javascript
// Check faction
window.myFactionDebug

// Check socket
window.socketDebug

// Check if socket is connected
window.socketDebug?.connected
```

## 🐛 Common Issues & Solutions

### Issue 1: "No rooms shown even after creating"

**Possible Causes:**
1. Room is private (won't show in public list)
2. Different factions (rooms only show for same faction)
3. Socket not connected
4. Faction ID mismatch

**Debug:**
```javascript
// In browser console
console.log('My Faction:', window.myFactionDebug);
console.log('Socket Connected:', window.socketDebug?.connected);

// Manually request rooms
window.socketDebug?.emit('cw-get-faction-rooms', { 
    factionId: window.myFactionDebug.id 
});
```

**Solution:**
- Ensure both accounts are in the **same faction**
- Ensure room is **Public** (not Private)
- Refresh the page
- Click "Refresh" button in room list

### Issue 2: "Room not found when joining"

**Possible Causes:**
1. Server restarted (rooms are in-memory)
2. Room was deleted
3. Room ID typo

**Solution:**
- Create a new room
- Copy room ID carefully
- Check server logs for room existence

### Issue 3: "Socket not connected"

**Possible Causes:**
1. Server not running
2. CORS issues
3. Socket.io version mismatch

**Solution:**
- Restart server
- Check server is running on port 5051
- Check browser console for socket errors

### Issue 4: "Faction ID undefined"

**Possible Causes:**
1. User not in a faction
2. Faction data not loaded

**Solution:**
- Join a faction first
- Refresh the page
- Check `window.myFactionDebug` in console

## 🔧 Manual Testing Commands

### Test Room Creation (Browser Console)
```javascript
// After creating a room, check if it exists
fetch('http://localhost:5051/code-wars/debug/all-rooms', {
    headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
    }
})
.then(r => r.json())
.then(data => console.log('All Rooms:', data));
```

### Test Faction Rooms (Browser Console)
```javascript
// Check what rooms are available for your faction
fetch('http://localhost:5051/code-wars/faction-rooms', {
    headers: { 
        'Authorization': `Bearer ${localStorage.getItem('token')}` 
    }
})
.then(r => r.json())
.then(data => console.log('Faction Rooms:', data));
```

### Test Socket Connection (Browser Console)
```javascript
// Check socket events
window.socketDebug?.on('cw-faction-rooms', (data) => {
    console.log('📋 Received rooms:', data);
});

// Request rooms
window.socketDebug?.emit('cw-get-faction-rooms', { 
    factionId: window.myFactionDebug.id 
});
```

## 📊 Expected Behavior

### Account 1 (Creator)
1. Creates room → Room appears in their lobby
2. Room is stored in server memory
3. Room appears in faction room list (if public)

### Account 2 (Joiner)
1. Opens Code Wars Arena
2. Sees Account 1's room in "Active Faction Rooms"
3. Clicks "Join Battle"
4. Joins successfully

## 🚨 Critical Checks

Before testing, verify:

- [ ] Both accounts logged in
- [ ] Both accounts in **SAME FACTION**
- [ ] Server running (`npm start` in server folder)
- [ ] Client running (`npm run dev` in client folder)
- [ ] No console errors
- [ ] Socket connected (check browser console)

## 📝 What to Report

If issue persists, provide:

1. **Browser Console Logs** (from both accounts)
2. **Server Console Logs**
3. **Faction IDs** (from both accounts)
4. **Room Details** (from debug button)
5. **Steps Taken**

### Example Report:
```
Account 1:
- Faction: "Code Warriors" (ID: abc123)
- Created room: "Test Battle" (ID: XYZ789)
- Room is Public
- Console shows: "Room created successfully"

Account 2:
- Faction: "Code Warriors" (ID: abc123)
- Opened Code Wars Arena
- No rooms shown in list
- Console shows: "Received faction rooms: []"

Server Console:
- Shows room created
- Shows 1 active room
- Room faction ID: abc123
```

## 🎯 Quick Fix Checklist

Try these in order:

1. **Refresh both browsers**
2. **Click "Refresh" button in room list**
3. **Click "🔍 Debug Rooms" button**
4. **Check both accounts are in same faction**
5. **Ensure room is Public (not Private)**
6. **Restart server** (if rooms were lost)
7. **Create new room** (if old room lost)
8. **Check browser console for errors**
9. **Check server console for errors**
10. **Try different browsers** (to rule out cache issues)

---

**Last Updated**: May 1, 2026
**Status**: Debugging in progress
