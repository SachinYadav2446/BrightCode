# Code Wars Arena - Testing Guide

## 🎯 Quick Test (2 Accounts, Same Faction)

### Prerequisites
- ✅ Both accounts must be in the **same faction**
- ✅ Server running on `http://localhost:5051`
- ✅ Client running on `http://localhost:5173`

---

## 📝 Step-by-Step Test

### Account 1 (Room Creator)

1. **Login**
   - Open browser (or incognito window)
   - Navigate to `http://localhost:5173`
   - Login with Account 1 credentials

2. **Navigate to Code Wars**
   - Click on your faction
   - Click "Code Wars Arena" button

3. **Create a Room**
   - Click "Create Room" button
   - Fill in room details:
     - Room Name: "Test Battle"
     - Privacy: **Public** (important for testing)
     - Team Size: 1v1
     - Questions: 3
     - Time Limit: 10 minutes
   - Click "Create Battle Room"

4. **Wait in Lobby**
   - You should see the room lobby
   - Room ID will be displayed (e.g., "ABC123")
   - You should see yourself in Team 1
   - **Start button should be disabled** (need 2 players)

---

### Account 2 (Room Joiner)

1. **Login**
   - Open a **different browser** or **incognito window**
   - Navigate to `http://localhost:5173`
   - Login with Account 2 credentials (same faction as Account 1)

2. **Navigate to Code Wars**
   - Click on your faction
   - Click "Code Wars Arena" button

3. **Find and Join Room**
   - Look for "Active Faction Rooms" section
   - You should see Account 1's room: "Test Battle"
   - Click "Join Battle" button

4. **Wait in Lobby**
   - You should join the room successfully
   - You should see both yourself and Account 1
   - Account 1 should see you join (toast notification)

---

### Account 1 (Start Game)

1. **Start the Game**
   - The "Start Game" button should now be **enabled**
   - Click "Start Game"

2. **Verify Game Started**
   - Both accounts should see the game interface
   - Timer should be counting down
   - Questions should be displayed

---

## ✅ Expected Results

### Room Creation
- ✅ Room created successfully
- ✅ Creator joins room automatically
- ✅ Room appears in "Active Faction Rooms" list

### Room Joining
- ✅ Account 2 sees Account 1's room in the list
- ✅ Account 2 can click "Join Battle"
- ✅ Account 2 joins successfully
- ✅ Both accounts see each other in the lobby

### Real-Time Sync
- ✅ Account 1 sees "Player joined" notification
- ✅ Player count updates (1/2 → 2/2)
- ✅ Start button becomes enabled for Account 1

### Game Start
- ✅ Both accounts transition to game screen
- ✅ Timer starts counting down
- ✅ Questions are displayed
- ✅ Code editor is available

---

## 🐛 Troubleshooting

### "Room not found" Error
**Cause**: Room was lost due to server restart
**Solution**: 
1. Click "Leave" button
2. Create a new room
3. Have Account 2 join the new room

### Room Not Appearing in List
**Cause**: Room might be private or faction mismatch
**Solution**:
1. Verify both accounts are in the **same faction**
2. Ensure room is set to **Public** (not Private)
3. Click "Refresh" button to reload room list
4. Check browser console for errors

### User ID Not Found
**Cause**: JWT token not properly decoded
**Solution**:
1. Logout and login again
2. Check browser console for authentication errors
3. Verify token is stored in localStorage

### Socket Not Connected
**Cause**: Socket.io connection failed
**Solution**:
1. Refresh the page
2. Check server is running
3. Check browser console for socket errors
4. Verify CORS settings

---

## 🔍 Debug Tools

### Browser Console
Open browser console (F12) and look for:
- `✅` - Successful operations
- `❌` - Errors
- `🏗️` - Room creation
- `🚪` - Room joining/leaving
- `🎮` - Game start
- `📋` - Room list updates

### Server Console
Watch server terminal for:
- `[CW Socket]` - Code Wars socket events
- User IDs and faction IDs
- Room creation/join/leave events
- Error messages

### Debug Buttons (Development Mode)
In the Code Wars Arena interface:
- **Debug Rooms**: Shows all rooms in console
- **Check Room**: Validates room exists on server
- **Refresh**: Manually refresh room list

---

## 📊 Test Scenarios

### Scenario 1: Public Room (Basic)
1. Account 1 creates public room
2. Account 2 joins from room list
3. Account 1 starts game
4. ✅ Both play together

### Scenario 2: Private Room
1. Account 1 creates private room with password "test123"
2. Account 2 clicks "Join with Code"
3. Account 2 enters room code and password
4. ✅ Both play together

### Scenario 3: Multiple Rooms
1. Account 1 creates Room A
2. Account 3 creates Room B
3. Account 2 sees both rooms in list
4. ✅ Account 2 can choose which to join

### Scenario 4: Leave and Rejoin
1. Account 1 creates room
2. Account 2 joins
3. Account 2 clicks "Leave"
4. Account 2 rejoins from room list
5. ✅ Works correctly

---

## 🎓 What to Look For

### Good Signs ✅
- Room appears in list immediately after creation
- Player count updates in real-time
- Toast notifications appear for join/leave events
- Start button enables/disables correctly
- Both users see the same room state

### Bad Signs ❌
- Room doesn't appear in list
- Player count doesn't update
- No toast notifications
- Start button always disabled
- Users see different room states

---

## 📞 Getting Help

If you encounter issues:

1. **Check Console Logs**
   - Browser console (F12)
   - Server terminal

2. **Verify Prerequisites**
   - Same faction for both accounts
   - Server running
   - Client running
   - Both logged in

3. **Try Basic Fixes**
   - Refresh page
   - Logout and login
   - Restart server
   - Clear browser cache

4. **Collect Debug Info**
   - Screenshot of error
   - Console logs
   - Server logs
   - Steps to reproduce

---

## ✨ Success Criteria

The system is working correctly if:
- ✅ Account 2 can see Account 1's room in the list
- ✅ Account 2 can join the room
- ✅ Both accounts see each other in the lobby
- ✅ Account 1 can start the game
- ✅ Both accounts enter the game together

---

**Happy Testing! 🎮**

If all tests pass, the Code Wars Arena is ready for production use!
