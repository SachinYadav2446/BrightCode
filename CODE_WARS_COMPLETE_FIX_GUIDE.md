# Code Wars Arena - Complete Fix & Verification Guide 🎮

## 🔍 **System Check - Start Here**

### **Step 1: Verify Server is Running**
```bash
# Check if server is running
# Look for process on port 5051
netstat -ano | findstr :5051

# If not running, start it:
cd server
node index.js
```

### **Step 2: Test Basic API Endpoints**
Open browser and test these URLs:
1. `http://localhost:5051/factions` - Should return faction list
2. `http://localhost:5051/active-rooms` - Should return room list

### **Step 3: Check Database Connection**
Look at server console when it starts:
- ✅ `PostgreSQL Tables Initialized` - Database working
- ❌ `SWAPPING TO MEMORY FALLBACK MODE` - Using JSON files (okay for testing)

## 🛠️ **Complete System Reset**

### **Option 1: Restart Everything Fresh**
```bash
# 1. Stop server (Ctrl+C)
# 2. Clear any cached data
rm server/notes_db.json
rm server/users_db.json
rm server/factions_db.json

# 3. Restart server
cd server
node index.js

# 4. Refresh both browser windows
# 5. Login again on both accounts
```

### **Option 2: Keep Data, Just Restart**
```bash
# 1. Stop server (Ctrl+C)
# 2. Restart server
cd server
node index.js

# 3. Refresh both browser windows
```

## 🧪 **Step-by-Step Testing**

### **Test 1: Create Room (Admin Account)**
1. **Login as aryan1**
2. **Go to Factions** → Click your faction
3. **Click "Code Wars Arena"**
4. **Click "Create Room"**
5. **Fill details:**
   - Name: "Test Room"
   - Keep PUBLIC (no password)
   - Team Size: 1v1
   - Questions: 3
   - Time: 10m
6. **Click "Create Battle Room"**
7. **IMPORTANT: Note the room code** (e.g., "ABC123")

**Expected Result:**
- ✅ Success message: "Room ABC123 created!"
- ✅ You see the room lobby with your name in Team 1
- ✅ Room code is displayed at top

**Check Server Console:**
```
🏗️ Creating room - User: aryan1
✅ Room created successfully: ABC123
📊 Total active rooms now: 1
```

### **Test 2: Verify Room Exists**
1. **Click "🔍 Debug Room" button** (if in dev mode)
2. **Check browser console:**
   ```
   roomExists: true
   userInRoom: true
   allActiveRooms: ['ABC123']
   ```

**If roomExists is false:**
- ❌ Room creation failed
- Check server console for errors
- Try creating room again

### **Test 3: Join Room (Second Account)**
1. **Login as Soham** (different browser/incognito)
2. **Go to same faction**
3. **Click "Code Wars Arena"**
4. **You should see "Test Room" in Active Faction Rooms**
5. **Click "Join Battle" button on the room card**

**Expected Result:**
- ✅ Success message: "Joined room as player!"
- ✅ You see the room lobby
- ✅ Both players visible (aryan1 in Team 1, Soham in Team 2)

**Check Browser Console:**
```
🚪 Joining room: { roomId: 'ABC123', hasPassword: false }
✅ Join room response: { success: true, role: 'player' }
```

**If join fails:**
- Check exact error message
- Verify both users are in same faction
- Check server console for join request logs

### **Test 4: Start Game**
1. **As aryan1 (room creator)**
2. **Verify you see "Start Game" button** (green)
3. **Click "Start Game"**

**Expected Result:**
- ✅ Game starts
- ✅ Both players see game interface
- ✅ Questions are displayed

**Check Server Console:**
```
🎮 Start game request - Room: ABC123, User: aryan1
✅ Room ABC123 found, attempting to start game
```

## 🚨 **Common Issues & Fixes**

### **Issue 1: Room Not Found After Creation**
**Symptoms:**
- Room created successfully
- But "Room not found" when trying to start/join

**Cause:** Server restarted and cleared memory

**Fix:**
```bash
# Stop any auto-reload tools
# Use plain node instead of nodemon
cd server
node index.js  # NOT npm run dev
```

### **Issue 2: Can't Join Room**
**Symptoms:**
- Room visible in list
- "Room not found" when clicking Join

**Possible Causes:**
1. **Different factions** - Both users must be in SAME faction
2. **Room expired** - Room was deleted
3. **Server restarted** - Room data lost

**Fix:**
```javascript
// Check in browser console:
console.log('My faction:', user.faction);
console.log('Room faction:', room.factionId);
// These must match!
```

### **Issue 3: Start Game Fails**
**Symptoms:**
- Both players in room
- "Room not found" when clicking Start Game

**Fix:**
1. **Check room still exists:**
   - Click "🔄 Check Room" button
   - If expired, create new room
2. **Verify you're the creator:**
   - Only room creator can start game
   - Check debug info shows "IsCreator: YES"

### **Issue 4: No Rooms Showing**
**Symptoms:**
- "No active rooms" message
- But you just created a room

**Fix:**
1. **Click "Refresh" button**
2. **Check server console:**
   ```
   📋 Getting faction rooms for faction: YourFaction
   📊 Total active rooms: 0  ← Should be 1 or more
   ```
3. **If 0 rooms, server has no rooms - create new one**

## 📋 **Verification Checklist**

Before testing, verify:
- [ ] Server is running (`node server/index.js`)
- [ ] No errors in server console
- [ ] Both users logged in
- [ ] Both users in SAME faction
- [ ] Browser consoles open (F12) for debugging

During room creation:
- [ ] Success message appears
- [ ] Room code is displayed
- [ ] Room appears in Active Faction Rooms list
- [ ] Server console shows room creation logs

During room join:
- [ ] Room is visible in list for second user
- [ ] Join button is clickable (not disabled)
- [ ] Success message after clicking Join
- [ ] Both players visible in room lobby

During game start:
- [ ] Start Game button visible for creator
- [ ] Both players have 2+ total
- [ ] No "Room not found" errors
- [ ] Game interface loads for both players

## 🎯 **Quick Success Path**

**Follow these exact steps:**

1. **Stop server** (Ctrl+C)
2. **Start server fresh:**
   ```bash
   cd server
   node index.js
   ```
3. **Wait for:** `Server running on port 5051`
4. **Browser 1 (aryan1):**
   - Login
   - Go to Factions → Your Faction → Code Wars Arena
   - Create Room → Name: "Quick Test", Public, 1v1, 3 questions
   - Note the room code
5. **Browser 2 (Soham):**
   - Login
   - Go to Factions → Same Faction → Code Wars Arena
   - See "Quick Test" in Active Faction Rooms
   - Click "Join Battle"
6. **Browser 1 (aryan1):**
   - See Soham joined
   - Click "Start Game"
7. **Both browsers:**
   - Should see game interface with questions

## 🔧 **If Nothing Works**

### **Nuclear Option - Complete Reset:**
```bash
# 1. Stop server
# 2. Delete all data files
cd server
del notes_db.json
del users_db.json  
del factions_db.json

# 3. Restart server
node index.js

# 4. Re-register both accounts
# 5. Create faction
# 6. Both join same faction
# 7. Try Code Wars Arena again
```

### **Check Server Logs:**
Every operation should log to server console:
- Room creation: `🏗️ Creating room`
- Room join: `🚪 User joining room`
- Game start: `🎮 Start game request`

**If you don't see these logs, the requests aren't reaching the server!**

## 📞 **Debug Information to Share**

If still not working, share:
1. **Server console output** when creating room
2. **Browser console output** when joining room
3. **Exact error messages** (screenshots)
4. **Server startup logs** (first 20 lines)
5. **Are both users in same faction?** (yes/no)

---

**Status**: 🔧 **READY FOR COMPLETE SYSTEM TEST**  
**Next Action**: Follow "Quick Success Path" step by step