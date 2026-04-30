# Testing Room Persistence

## Steps to Test

### 1. Check Server is Running
```bash
# Make sure server is running on port 5051
# If not, restart it
cd server
npm start
```

### 2. Create a Workspace
1. Go to http://localhost:5173/workspace (or your client port)
2. Click "Create Workspace"
3. Enter a name (e.g., "Test Workspace")
4. Click "Create Workspace"
5. Note the workspace ID (e.g., ws-abc123-def456)
6. Click "Enter Workspace"

### 3. Check Active Rooms
Open a new browser tab and go to:
```
http://localhost:5051/active-rooms
```

You should see an array with your workspace ID:
```json
["ws-abc123-def456"]
```

### 4. Check Room Status
Go to:
```
http://localhost:5051/room-status/YOUR_WORKSPACE_ID
```

Replace YOUR_WORKSPACE_ID with your actual workspace ID.

You should see:
```json
{
  "exists": true,
  "userCount": 1,
  "users": ["YourUsername"],
  "adminId": "socket-id-here",
  "owner": "YourUsername"
}
```

### 5. Leave the Workspace
1. In the workspace editor, click the "Leave" button
2. You should see toast: "Left workspace. You can resume anytime from workspace history."
3. You should be redirected to /workspace page

### 6. Check Active Rooms Again
Go back to:
```
http://localhost:5051/active-rooms
```

**EXPECTED**: You should still see your workspace ID in the array
```json
["ws-abc123-def456"]
```

**IF NOT**: The room was deleted (this is the bug)

### 7. Check Room Status After Leave
Go to:
```
http://localhost:5051/room-status/YOUR_WORKSPACE_ID
```

**EXPECTED**:
```json
{
  "exists": true,
  "userCount": 0,
  "users": [],
  "adminId": "socket-id-here",
  "owner": "YourUsername"
}
```

Note: userCount should be 0 but room should still exist

### 8. Check Workspace History
On the /workspace page, look at the "Recent Workspaces" table.

**EXPECTED**: Your workspace should show with a "Resume" button

**IF SHOWING "Session Ended"**: The activeRooms check is failing

## Debugging

### Check Server Console
Look for these log messages:
- `[USER LEFT] username left room ws-xxx (room still active, 0 users remaining)`
- `[ACTIVE ROOMS] Current active rooms: [...]`

### Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any errors when fetching /active-rooms

### Manual Test
In browser console on /workspace page:
```javascript
fetch('http://localhost:5051/active-rooms')
  .then(r => r.json())
  .then(data => console.log('Active rooms:', data));
```

## Common Issues

### Issue 1: Room is deleted when user leaves
**Symptom**: /active-rooms returns empty array after leaving
**Cause**: Server is deleting room on disconnect
**Fix**: Check server/index.js disconnecting handler - should NOT call rooms.delete()

### Issue 2: Room exists but not in active-rooms
**Symptom**: /room-status shows exists:true but /active-rooms doesn't include it
**Cause**: Mismatch in room ID or rooms Map corruption
**Fix**: Restart server, clear localStorage, try again

### Issue 3: Frontend not fetching active rooms
**Symptom**: Room exists on server but Resume button doesn't show
**Cause**: Frontend fetch failing or not refreshing
**Fix**: Check browser console for errors, verify fetch URL

### Issue 4: Workspace ID mismatch
**Symptom**: Different workspace ID in history vs server
**Cause**: Multiple workspaces with similar names
**Fix**: Use the exact workspace ID from history table
