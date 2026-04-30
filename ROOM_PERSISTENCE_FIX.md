# Room Persistence Fix - Quick Guide

## Problem
When users leave a workspace, it shows "Session Ended" instead of "Resume" button, even though they didn't terminate the session.

## Root Cause
The server was not properly keeping rooms alive when users disconnected.

## Changes Made

### 1. Server Side (server/index.js)

#### Updated `leave-workspace` Handler
```javascript
socket.on('leave-workspace', ({ roomId, username }) => {
    const room = rooms.get(roomId);
    if (room) {
        const userIndex = room.users.findIndex(u => u.id === socket.id);
        if (userIndex !== -1) {
            room.users.splice(userIndex, 1);
            socket.to(roomId).emit('user-left', { id: socket.id, username });
            socket.leave(roomId);
            console.log(`[USER LEFT] ${username} left room ${roomId} (room still active, ${room.users.length} users remaining)`);
        }
        // IMPORTANT: Do NOT delete the room even if empty
        // Room should persist until explicitly ended by admin
    }
});
```

#### Updated `disconnecting` Handler
```javascript
socket.on('disconnecting', () => {
    socket.rooms.forEach(roomId => {
        // Skip the default socket.id room
        if (roomId === socket.id) return;
        
        const room = rooms.get(roomId);
        if (room) {
            // Remove user from room but keep room alive
            const userIndex = room.users.findIndex(u => u.id === socket.id);
            if (userIndex !== -1) {
                const user = room.users[userIndex];
                room.users.splice(userIndex, 1);
                socket.to(roomId).emit('user-left', { id: socket.id, username: user.username });
                console.log(`[USER DISCONNECTED] ${user.username} disconnected from room ${roomId} (room still active, ${room.users.length} users remaining)`);
            }
            // IMPORTANT: Do NOT delete the room
            // Room persists for resume functionality
        }
    });
});
```

#### Added Debug Endpoints
```javascript
// Enhanced active-rooms endpoint with logging
app.get('/active-rooms', (req, res) => {
    const roomsList = Array.from(rooms.keys());
    console.log('[ACTIVE ROOMS] Current active rooms:', roomsList);
    res.json(roomsList);
});

// New debug endpoint to check room status
app.get('/room-status/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);
    if (room) {
        res.json({
            exists: true,
            userCount: room.users.length,
            users: room.users.map(u => u.username),
            adminId: room.adminId,
            owner: room.owner
        });
    } else {
        res.json({ exists: false });
    }
});
```

## 🚨 CRITICAL: Restart Server

**The changes won't take effect until you restart the server!**

### How to Restart

#### Option 1: Stop and Start
```bash
# Stop the server (Ctrl+C in the terminal running it)
# Then start it again:
cd server
npm start
```

#### Option 2: Using nodemon (if installed)
```bash
# nodemon will auto-restart on file changes
cd server
npx nodemon index.js
```

#### Option 3: Kill and Restart
```bash
# Find the process
lsof -i :5051

# Kill it
kill -9 <PID>

# Start again
cd server
npm start
```

## Testing After Restart

### 1. Create a New Workspace
- Go to /workspace
- Create a new workspace
- Enter it

### 2. Check Active Rooms
Open: `http://localhost:5051/active-rooms`

Should see: `["ws-your-workspace-id"]`

### 3. Leave the Workspace
- Click "Leave" button
- Should see toast: "Left workspace. You can resume anytime from workspace history."

### 4. Verify Room Still Active
Open: `http://localhost:5051/active-rooms`

Should STILL see: `["ws-your-workspace-id"]`

### 5. Check Workspace History
- On /workspace page
- Look at "Recent Workspaces" table
- Should see "Resume" button (NOT "Session Ended")

### 6. Test Resume
- Click "Resume" button
- Should rejoin the workspace successfully

## Expected Behavior

### When User Leaves
✅ Room stays in `rooms` Map
✅ Room ID stays in active-rooms list
✅ User removed from room.users array
✅ Other users can continue working
✅ Files and state preserved
✅ "Resume" button shows in history

### When Admin Ends Session
❌ Room deleted from `rooms` Map
❌ Room ID removed from active-rooms list
❌ All users kicked out
❌ Files and state lost
❌ "Session Ended" label shows in history

## Troubleshooting

### Still Showing "Session Ended"

1. **Check server is restarted**
   ```bash
   # Look for this in server console:
   # "Server running on port 5051"
   ```

2. **Clear old workspaces**
   - Old workspaces created before the fix won't work
   - Create a NEW workspace after restarting server

3. **Check active-rooms endpoint**
   ```bash
   curl http://localhost:5051/active-rooms
   ```

4. **Check browser console**
   - Open DevTools (F12)
   - Look for fetch errors

5. **Check server console**
   - Should see: `[USER LEFT] username left room ws-xxx (room still active, 0 users remaining)`
   - Should see: `[ACTIVE ROOMS] Current active rooms: [...]`

### Room Not Persisting

If room is still being deleted:

1. **Verify code changes**
   - Open server/index.js
   - Search for "rooms.delete"
   - Should ONLY appear in `end-session` handler

2. **Check for multiple server instances**
   ```bash
   lsof -i :5051
   # Should show only ONE process
   ```

3. **Clear node cache**
   ```bash
   cd server
   rm -rf node_modules
   npm install
   npm start
   ```

## Summary

The fix ensures that:
1. Rooms persist when users leave
2. Rooms only deleted when admin explicitly ends session
3. Users can resume from workspace history
4. "Resume" button shows for active workspaces
5. "Session Ended" only shows for terminated workspaces

**Remember: You MUST restart the server for changes to take effect!**
