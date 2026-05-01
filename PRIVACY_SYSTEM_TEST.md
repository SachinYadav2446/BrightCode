# Privacy System Test Guide 🔒

## Test Scenarios for Private/Public Rooms

### 🧪 **Test 1: Public Room Creation**
1. **Create Public Room**:
   - Go to Code Wars Arena
   - Click "Create Room"
   - Select "Public" (🌐 Globe icon)
   - Fill room name: "Test Public Room"
   - Leave password field empty (should not appear)
   - Click "Create Battle Room"

2. **Expected Results**:
   - ✅ Room created successfully
   - ✅ Room appears in faction room list
   - ✅ Other faction members can see the room
   - ✅ Room shows green "Public" badge
   - ✅ Join button says "Join Battle"

### 🔐 **Test 2: Private Room Creation**
1. **Create Private Room**:
   - Go to Code Wars Arena
   - Click "Create Room"
   - Select "Private" (🔒 Lock icon)
   - Fill room name: "Test Private Room"
   - Password field should appear
   - Enter password: "secret123"
   - Click "Create Battle Room"

2. **Expected Results**:
   - ✅ Room created successfully
   - ✅ Room does NOT appear in public faction room list
   - ✅ Room shows orange "Private" badge in lobby
   - ✅ Success message mentions "Private room created"

### 🚫 **Test 3: Private Room Validation**
1. **Try Creating Private Room Without Password**:
   - Select "Private"
   - Leave password field empty
   - Try to click "Create Battle Room"

2. **Expected Results**:
   - ✅ Create button should be disabled
   - ✅ Cannot create room without password

### 🔍 **Test 4: Private Room Invisibility**
1. **Check Room Visibility**:
   - User A creates private room with password
   - User B (same faction) refreshes room list
   - User B should NOT see the private room

2. **Expected Results**:
   - ✅ Private rooms hidden from public browsing
   - ✅ Only public rooms visible in faction list
   - ✅ Room count shows only public rooms

### 🔑 **Test 5: Private Room Access - Correct Password**
1. **Join Private Room with Correct Password**:
   - User A creates private room: "SECRET" with password "test123"
   - User A shares room code (e.g., "ABC123") with User B
   - User B clicks "Join with Code"
   - Enters room code: "ABC123"
   - Enters password: "test123"
   - Clicks "Join Battle"

2. **Expected Results**:
   - ✅ User B joins room successfully
   - ✅ Success message: "Joined room as player!"
   - ✅ User B appears in room lobby

### ❌ **Test 6: Private Room Access - Wrong Password**
1. **Join Private Room with Wrong Password**:
   - User B tries to join same room
   - Enters room code: "ABC123"
   - Enters wrong password: "wrongpass"
   - Clicks "Join Battle"

2. **Expected Results**:
   - ❌ Error message: "Wrong password. Please check with the room creator."
   - ❌ User B does not join room
   - ❌ Room lobby unchanged

### 🚪 **Test 7: Private Room Access - No Password**
1. **Join Private Room Without Password**:
   - User B tries to join private room
   - Enters room code: "ABC123"
   - Leaves password field empty
   - Clicks "Join Battle"

2. **Expected Results**:
   - ❌ Error message: "This is a private room. Password required to join."
   - ❌ User B does not join room

### 🔄 **Test 8: Room Type Switching**
1. **Switch Between Public/Private During Creation**:
   - Start creating room
   - Select "Private" → password field appears
   - Enter password
   - Switch to "Public" → password field disappears
   - Switch back to "Private" → password field reappears (empty)

2. **Expected Results**:
   - ✅ Password field shows/hides correctly
   - ✅ Form validation updates appropriately
   - ✅ No errors during switching

## 🛠️ **Debug Tools**

### **Development Debug Button**
- In development mode, a "🔍 Debug" button appears
- Click to see all rooms (including private ones) in console
- Shows total room count and privacy breakdown

### **Debug API Endpoint**
```bash
GET /code-wars/debug/all-rooms
Authorization: Bearer <token>
```

**Response Example**:
```json
{
  "factionId": "faction-uuid",
  "factionName": "Test Faction",
  "totalRooms": 3,
  "publicRooms": 2,
  "privateRooms": 1,
  "rooms": [
    {
      "id": "ABC123",
      "name": "Public Room",
      "isPrivate": false,
      // ... other room data
    },
    {
      "id": "XYZ789",
      "name": "Secret Room",
      "isPrivate": true,
      // ... other room data (password removed)
    }
  ]
}
```

## 🔧 **Database/Storage Verification**

### **Room Storage Structure**
```javascript
// In-memory storage structure
activeRooms: Map {
  "ABC123" => {
    id: "ABC123",
    name: "Test Room",
    password: "secret123",  // Only for private rooms
    isPrivate: true,        // Boolean flag
    factionId: "faction-id",
    // ... other properties
  }
}
```

### **Key Privacy Logic Points**
1. **Room Creation**: `isPrivate = !!password` (private if password exists)
2. **Room Filtering**: Public rooms only in `getRoomsByFaction()`
3. **Password Validation**: Strict checking in `joinRoom()`
4. **Data Sanitization**: Password removed in `sanitizeRoomForClient()`

## ✅ **Expected System Behavior**

### **Public Rooms**
- ✅ Visible to all faction members
- ✅ No password required
- ✅ Green "Public" badge
- ✅ "Join Battle" button text

### **Private Rooms**
- ✅ Hidden from public room lists
- ✅ Password required to join
- ✅ Orange "Private" badge
- ✅ "Join Private" button text
- ✅ Accessible only via room code + password

### **Error Handling**
- ✅ Clear error messages for wrong passwords
- ✅ Validation prevents creating private rooms without passwords
- ✅ Appropriate feedback for all failure scenarios

### **Security**
- ✅ Passwords not sent to client in room data
- ✅ Server-side password validation
- ✅ Room access properly restricted
- ✅ No private room data leakage

## 🚨 **Common Issues to Check**

1. **Private rooms appearing in public lists** → Check `getRoomsByFaction()` filter
2. **Password validation not working** → Check `joinRoom()` password logic
3. **Room creation without password** → Check frontend form validation
4. **Password visible in client data** → Check `sanitizeRoomForClient()`
5. **Wrong error messages** → Check error handling in join process

## 🎯 **Success Criteria**

- ✅ Private rooms completely hidden from public browsing
- ✅ Password required and validated for private room access
- ✅ Clear visual indicators for room privacy status
- ✅ Proper error messages for all failure scenarios
- ✅ No password data leakage to client
- ✅ Smooth UX for both public and private room workflows

Run through all test scenarios to ensure the privacy system is working correctly! 🔒✨