# Code Wars Arena Troubleshooting Guide

## Issue: "Failed to load Code Wars Arena" or Cannot Join Rooms

### Step 1: Check if Server is Running

Open a terminal and verify the server is running:

```bash
# Check if server process is running
# You should see output indicating the server is listening on port 5051
```

**Expected output:**
```
Server running on port 5051
Socket.IO initialized
```

If the server is not running, start it:
```bash
cd server
npm start
# or
node index.js
```

### Step 2: Check Browser Console

1. Open your browser's Developer Tools (F12)
2. Go to the **Console** tab
3. Look for these log messages when loading Code Wars Arena:

**Expected logs:**
```
🔌 Setting up socket connection...
✅ Socket connected successfully
🎮 Initializing Code Wars Arena...
👤 User: [your username] ID: [your user id]
🔌 Socket connected: true
📡 Fetching factions from server...
✅ Factions response: [array of factions]
🏛️ User faction loaded: [faction name] ID: [faction id]
📋 Loading faction rooms for: [faction id]
✅ Arena initialization complete
```

**Common error patterns:**

#### Error: "Socket connection error"
```
❌ Socket connection error: Error: xhr poll error
```
**Solution:** Server is not running or not accessible on port 5051

#### Error: "Network Error"
```
❌ Failed to initialize arena: Network Error
```
**Solution:** Backend server is not running. Start the server.

#### Error: "User not in any faction"
```
❌ User not in any faction
```
**Solution:** You need to join a faction first. Go to `/factions` page and join a faction.

#### Error: "Authentication failed"
```
❌ Failed to initialize arena: Request failed with status code 401
```
**Solution:** Your authentication token is invalid. Log out and log in again.

### Step 3: Check Network Tab

1. Open Developer Tools (F12)
2. Go to **Network** tab
3. Reload the Code Wars Arena page
4. Look for these requests:

**Expected requests:**
- `GET http://localhost:5051/factions` - Status: 200
- `GET http://localhost:5051/code-wars/my-room` - Status: 200 or 404 (404 is OK if not in a room)
- WebSocket connection to `ws://localhost:5051/socket.io/` - Status: 101 (Switching Protocols)

**If you see:**
- Status: Failed or (failed) - Server is not running
- Status: 401 - Authentication issue
- Status: 500 - Server error (check server logs)

### Step 4: Test Socket Connection Manually

Open browser console and run:

```javascript
// Check if socket is connected
window.socketDebug?.connected
// Should return: true

// Check if faction is loaded
window.myFactionDebug
// Should return: { id: '...', name: '...', ... }

// Manually request faction rooms
window.socketDebug?.emit('cw-get-faction-rooms', { 
    factionId: window.myFactionDebug.id 
});

// Check if rooms were received (wait a few seconds, then check console for):
// 📋 Received faction rooms: [...]
```

### Step 5: Check Server Logs

Look at your server terminal for these logs when you try to load Code Wars Arena:

**Expected server logs:**
```
📋 [CW Socket] Getting rooms for faction [faction-id]
Sending [X] rooms to client
```

**If you see errors:**
- Check if the `intraFactionArena` module is properly initialized
- Check if the database/data store is accessible

### Step 6: Verify User Authentication

In browser console:
```javascript
// Check if user is authenticated
localStorage.getItem('token')
// Should return a JWT token string

// Check user data
// (This depends on your auth implementation)
```

### Step 7: Common Solutions

#### Solution 1: Restart Everything
```bash
# Stop the server (Ctrl+C)
# Stop the client (Ctrl+C)

# Start server
cd server
npm start

# In another terminal, start client
cd client
npm run dev
```

#### Solution 2: Clear Browser Cache
1. Open Developer Tools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

#### Solution 3: Check Faction Membership
1. Navigate to `/factions` page
2. Verify you are a member of a faction
3. If not, join a faction
4. Return to Code Wars Arena

#### Solution 4: Re-authenticate
1. Log out of the application
2. Clear localStorage: `localStorage.clear()`
3. Log in again
4. Try accessing Code Wars Arena

### Step 8: Create a Test Room

If the arena loads but you can't join rooms, try creating a test room:

1. Click "Create Room"
2. Fill in the form:
   - Room Name: "Test Room"
   - Team Size: 1v1
   - Questions: 3
   - Time: 10 minutes
3. Click "Create Battle Room"
4. Check console for:
   ```
   🏗️ Creating room via socket...
   ✅ Room created via socket: { success: true, room: {...} }
   ```

### Debug Commands

Run these in browser console for detailed debugging:

```javascript
// 1. Check socket status
console.log('Socket connected:', window.socketDebug?.connected);
console.log('Socket ID:', window.socketDebug?.id);

// 2. Check faction data
console.log('My faction:', window.myFactionDebug);

// 3. Check user authentication
console.log('Auth token exists:', !!localStorage.getItem('token'));

// 4. Test socket emission
window.socketDebug?.emit('cw-get-faction-rooms', { 
    factionId: window.myFactionDebug?.id 
});

// 5. Listen for socket events
window.socketDebug?.on('cw-faction-rooms', (data) => {
    console.log('Received rooms:', data);
});

// 6. Check for socket errors
window.socketDebug?.on('cw-error', (error) => {
    console.error('Socket error:', error);
});
```

### Still Having Issues?

If none of the above solutions work:

1. **Check server console** for any error messages
2. **Check browser console** for JavaScript errors
3. **Verify all dependencies are installed:**
   ```bash
   cd client && npm install
   cd ../server && npm install
   ```
4. **Check if port 5051 is available:**
   ```bash
   # Windows
   netstat -ano | findstr :5051
   
   # Linux/Mac
   lsof -i :5051
   ```
5. **Try a different browser** to rule out browser-specific issues

### Quick Checklist

- [ ] Server is running on port 5051
- [ ] Client is running and accessible
- [ ] User is logged in
- [ ] User is a member of a faction
- [ ] Socket connection is established (check console)
- [ ] No JavaScript errors in console
- [ ] Network requests are successful (check Network tab)
- [ ] Browser cache is cleared

---

## Additional Notes

### Expected Flow for Joining a Room

1. User navigates to Code Wars Arena
2. Socket connects to server
3. User's faction is loaded from server
4. Faction rooms are requested via socket
5. Rooms are displayed in the UI
6. User clicks "Join Battle" on a room
7. Socket emits `cw-join-room` event
8. Server validates and adds user to room
9. Server emits `cw-room-joined` event back
10. Client updates UI to show room lobby

### Socket Events Reference

**Client → Server:**
- `cw-create-room` - Create a new room
- `cw-join-room` - Join an existing room
- `cw-leave-room` - Leave current room
- `cw-start-game` - Start the game
- `cw-get-faction-rooms` - Request faction room list

**Server → Client:**
- `cw-room-created` - Room creation confirmation
- `cw-room-joined` - Room join confirmation
- `cw-player-joined` - Another player joined
- `cw-player-left` - A player left
- `cw-game-started` - Game has started
- `cw-faction-rooms` - List of faction rooms
- `cw-error` - Error occurred
