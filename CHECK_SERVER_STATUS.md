# Server Status Check

## Is your server running?

### Quick Check:

1. **Open a new terminal/command prompt**

2. **Navigate to server directory:**
   ```bash
   cd server
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

4. **You should see:**
   ```
   Server running on port 5051
   ```

### If you see errors:

#### "Cannot find module" error:
```bash
npm install
npm start
```

#### "Port 5051 is already in use":
```bash
# Windows - Find what's using the port
netstat -ano | findstr :5051

# Kill the process (replace XXXX with PID from above)
taskkill /PID XXXX /F

# Start server again
npm start
```

### Verify server is working:

**Method 1: Browser**
- Open: http://localhost:5051/factions
- You should see JSON data

**Method 2: Terminal**
```bash
curl http://localhost:5051/factions
```

**Method 3: Test HTML file**
- Open `test-server-connection.html` in your browser
- Check if tests pass

---

## Common Issues:

### 1. Server not starting at all
**Symptoms:** Nothing happens when you run `npm start`

**Solution:**
```bash
cd server
npm install
node index.js
```

### 2. Server crashes immediately
**Symptoms:** Server starts then stops

**Check server logs for errors:**
- Missing environment variables
- Database connection issues
- Port conflicts

### 3. Server running but socket won't connect
**Symptoms:** Server logs show "Server running on port 5051" but client can't connect

**Solutions:**
1. Check firewall settings
2. Try accessing http://localhost:5051 in browser
3. Check if CORS is properly configured
4. Restart both server and client

### 4. Socket connects but Code Wars doesn't work
**Symptoms:** Socket shows as connected but features don't work

**Check:**
1. Are you logged in?
2. Are you a member of a faction?
3. Check browser console for errors
4. Check server console for errors

---

## Debug Commands

### In Browser Console (F12):

```javascript
// Check if socket exists
window.socketDebug

// Check if socket is connected
window.socketDebug?.connected

// Check faction data
window.myFactionDebug

// Manually test socket
window.socketDebug?.emit('cw-get-faction-rooms', { 
    factionId: window.myFactionDebug?.id 
});
```

### In Server Terminal:

Look for these logs when client connects:
```
Socket client connected: [socket-id]
📋 [CW Socket] Getting rooms for faction [faction-id]
```

If you don't see these logs, the socket is not connecting to the server.

---

## Still Not Working?

### Step-by-step reset:

1. **Stop everything:**
   - Stop server (Ctrl+C)
   - Stop client (Ctrl+C)
   - Close all browser tabs

2. **Clear everything:**
   ```bash
   # In server directory
   rm -rf node_modules package-lock.json
   npm install
   
   # In client directory
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Start fresh:**
   ```bash
   # Terminal 1 - Server
   cd server
   npm start
   
   # Terminal 2 - Client
   cd client
   npm run dev
   ```

4. **Clear browser cache:**
   - Open DevTools (F12)
   - Right-click refresh button
   - "Empty Cache and Hard Reload"

5. **Try again:**
   - Log in
   - Join a faction (if not already)
   - Go to Code Wars Arena

---

## Expected Console Output

### When everything is working:

**Browser Console:**
```
🔌 Setting up socket connection...
✅ Socket connected successfully, ID: abc123
🎮 Initializing Code Wars Arena...
👤 User: yourname ID: user-id
🔌 Socket connected: true
📡 Fetching factions from server...
✅ Factions response: [...]
🏛️ User faction loaded: FactionName ID: faction-id
📋 Loading faction rooms for: faction-id
📋 Received faction rooms: []
✅ Arena initialization complete
```

**Server Console:**
```
Server running on port 5051
Socket client connected: abc123
📋 [CW Socket] Getting rooms for faction faction-id
Sending 0 rooms to client
```

If you see these logs, everything is working correctly!
