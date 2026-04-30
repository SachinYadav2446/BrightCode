# Leave vs End Workspace Functionality

## Overview
Implemented two distinct actions for exiting a workspace: **Leave** (temporary) and **End** (permanent).

---

## 🚪 Leave Button (All Users)

### Behavior
- **Temporary exit** from the workspace
- **Workspace remains active** for other users
- **Can resume anytime** from workspace history
- User is removed from active collaborators list
- Files and workspace state are preserved

### User Flow
1. User clicks "Leave" button
2. Confirmation toast appears: "Left workspace. You can resume anytime from workspace history."
3. User is redirected to `/workspace` page
4. Socket connection is gracefully closed
5. Other users see notification: "[Username] left"

### Technical Implementation

#### Client Side (EditorPage.jsx)
```javascript
<button className="action-btn-leave" onClick={() => {
    // Leave workspace but keep it active
    if (socketRef.current) {
        socketRef.current.emit('leave-workspace', { 
            roomId, 
            username: user?.username 
        });
        socketRef.current.disconnect();
    }
    toast.success('Left workspace. You can resume anytime from workspace history.');
    navigate('/workspace');
}}>
    <LogOut size={16} />
    <span>Leave</span>
</button>
```

#### Server Side (index.js)
```javascript
socket.on('leave-workspace', ({ roomId, username }) => {
    const room = rooms.get(roomId);
    if (room) {
        const userIndex = room.users.findIndex(u => u.id === socket.id);
        if (userIndex !== -1) {
            room.users.splice(userIndex, 1);
            socket.to(roomId).emit('user-left', { id: socket.id, username });
            socket.leave(roomId);
            console.log(`[USER LEFT] ${username} left room ${roomId} (room still active)`);
        }
    }
});
```

### What Happens
✅ User disconnects from workspace
✅ Workspace stays in active rooms list
✅ Other users can continue working
✅ Files and state are preserved
✅ User can rejoin using "Resume" button
✅ Workspace history is updated with last visited time

---

## ❌ End Button (Admin Only)

### Behavior
- **Permanent termination** of the workspace
- **All users are kicked out** immediately
- **Cannot be resumed** - workspace is deleted
- All files and state are lost
- Workspace removed from active rooms

### User Flow
1. Admin clicks "End" button
2. Confirmation dialog appears:
   ```
   ⚠️ End Session Permanently?
   
   This will:
   • Terminate the workspace for all users
   • Remove it from active sessions
   • Cannot be resumed
   
   Are you sure?
   ```
3. If confirmed:
   - All users receive termination notification
   - Everyone is redirected to workspace page
   - Workspace is deleted from server
   - Toast message: "Workspace session ended permanently."

### Technical Implementation

#### Client Side (EditorPage.jsx)
```javascript
{isAdmin && (
    <button className="action-btn-end" onClick={() => {
        if (window.confirm("⚠️ End Session Permanently?\n\nThis will:\n• Terminate the workspace for all users\n• Remove it from active sessions\n• Cannot be resumed\n\nAre you sure?")) {
            socketRef.current?.emit('end-session', { roomId });
            toast.error('Workspace session ended permanently.');
            navigate('/workspace');
        }
    }}>
        <Plus size={18} style={{ transform: 'rotate(45deg)' }} />
        <span>End</span>
    </button>
)}
```

#### Server Side (index.js)
```javascript
socket.on('end-session', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room && socket.id === room.adminId) {
        // Notify all users that the session is ending permanently
        io.in(roomId).emit('session-ended', { 
            message: '⚠️ Workspace Terminated\n\nThe workspace owner has permanently ended this session.\nAll unsaved work will be lost.' 
        });
        
        // Delete the room from active rooms
        rooms.delete(roomId);
        
        // Delete workspace metadata
        workspaceMetadata.delete(roomId);
        
        console.log(`[SESSION ENDED] Room ${roomId} permanently terminated by admin`);
    } else if (room && socket.id !== room.adminId) {
        // Non-admin tried to end session
        socket.emit('error', { message: 'Only the workspace owner can end the session.' });
    }
});
```

### What Happens
❌ Workspace is permanently deleted
❌ All users are disconnected
❌ Files and state are lost
❌ Cannot be resumed
❌ Removed from active rooms list
❌ Workspace history shows "Session Ended"

---

## 📊 Comparison Table

| Feature | Leave | End |
|---------|-------|-----|
| **Who can use** | All users | Admin only |
| **Workspace state** | Remains active | Permanently deleted |
| **Other users** | Can continue working | All kicked out |
| **Files** | Preserved | Lost |
| **Can resume** | ✅ Yes | ❌ No |
| **Appears in history** | ✅ Yes (with Resume button) | ❌ No (shows "Session Ended") |
| **Confirmation** | Toast notification | Confirmation dialog |
| **Reversible** | ✅ Yes | ❌ No |

---

## 🔄 Resume Functionality

### Workspace History Page
When a user leaves a workspace, it appears in their workspace history with a "Resume" button.

#### Resume Button Logic (Workspace.jsx)
```javascript
{activeRooms.includes(workspace.id) ? (
    <button 
        className="table-action-btn" 
        onClick={() => navigate(`/editor/${workspace.id}`)}
    >
        Resume <ArrowRight size={14} />
    </button>
) : (
    <span className="session-ended-label">
        Session Ended
    </span>
)}
```

### How It Works
1. **Active Rooms Check**: Server maintains list of active room IDs
2. **Resume Button**: Shows if workspace is in active rooms
3. **Session Ended Label**: Shows if workspace was terminated
4. **Rejoin**: Clicking Resume navigates back to editor with same workspace ID

---

## 🎯 Use Cases

### When to Use Leave
- Taking a break but want to come back later
- Switching to another task temporarily
- Letting others continue working
- Need to check something else quickly
- Want to preserve workspace state

### When to Use End
- Project is complete
- No longer need the workspace
- Want to clean up resources
- Ending a temporary collaboration session
- Security: removing access for all users

---

## 🔒 Security & Permissions

### Leave Button
- ✅ Available to all users
- ✅ No special permissions required
- ✅ Cannot affect other users
- ✅ Graceful disconnect

### End Button
- 🔐 Admin/Owner only
- 🔐 Requires confirmation
- 🔐 Affects all users
- 🔐 Irreversible action
- 🔐 Server validates admin status

### Server-Side Validation
```javascript
if (room && socket.id === room.adminId) {
    // Allow end session
} else if (room && socket.id !== room.adminId) {
    // Deny - not admin
    socket.emit('error', { message: 'Only the workspace owner can end the session.' });
}
```

---

## 📱 User Experience

### Leave Experience
```
User clicks Leave
    ↓
Toast: "Left workspace. You can resume anytime from workspace history."
    ↓
Redirect to /workspace
    ↓
Workspace appears in history with "Resume" button
    ↓
User can click Resume to rejoin
```

### End Experience (Admin)
```
Admin clicks End
    ↓
Confirmation dialog appears
    ↓
Admin confirms
    ↓
All users see: "⚠️ Workspace Terminated"
    ↓
Everyone redirected to /workspace
    ↓
Workspace removed from active rooms
    ↓
History shows "Session Ended" (no Resume button)
```

---

## 🐛 Edge Cases Handled

### Leave Button
- ✅ Socket already disconnected → Graceful handling
- ✅ User is last person → Workspace stays active
- ✅ Network error → Fallback to local disconnect
- ✅ Multiple rapid clicks → Debounced

### End Button
- ✅ Non-admin tries to end → Server rejects with error
- ✅ Room doesn't exist → No error thrown
- ✅ User cancels confirmation → No action taken
- ✅ Socket disconnected → Handled gracefully

---

## 🧪 Testing Checklist

### Leave Functionality
- [ ] User clicks Leave button
- [ ] Toast notification appears
- [ ] User redirected to /workspace
- [ ] Workspace appears in history
- [ ] "Resume" button is visible
- [ ] Other users see "[User] left" notification
- [ ] Other users can continue working
- [ ] Files are preserved
- [ ] User can click Resume and rejoin
- [ ] User rejoins with same permissions

### End Functionality
- [ ] Only admin sees End button
- [ ] Non-admin doesn't see End button
- [ ] Confirmation dialog appears
- [ ] Cancel works correctly
- [ ] Confirm terminates workspace
- [ ] All users receive notification
- [ ] All users redirected
- [ ] Workspace removed from active rooms
- [ ] History shows "Session Ended"
- [ ] No Resume button available
- [ ] Cannot rejoin terminated workspace

---

## 🚀 Future Enhancements

### Potential Improvements
1. **Auto-save before leave**: Save workspace state to cloud
2. **Leave message**: Let users leave a note when leaving
3. **Rejoin notification**: Notify others when user resumes
4. **Workspace timeout**: Auto-end after X hours of inactivity
5. **Archive instead of delete**: Keep workspace in archived state
6. **Transfer ownership**: Allow admin to transfer before leaving
7. **Scheduled end**: Set a time for automatic termination
8. **Export before end**: Automatically export files before deletion

---

## 📝 Summary

The Leave/End functionality provides:
- **Flexibility**: Users can temporarily leave without disrupting others
- **Control**: Admins can permanently terminate when needed
- **Safety**: Confirmation dialogs prevent accidental termination
- **Clarity**: Clear distinction between temporary and permanent actions
- **Resumability**: Easy to rejoin active workspaces
- **User Experience**: Intuitive buttons with clear feedback

This implementation balances user convenience with workspace management, allowing for both temporary exits and permanent cleanup.
