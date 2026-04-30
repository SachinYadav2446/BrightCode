# Leave vs End - Visual Guide

## Button Layout

```
┌─────────────────────────────────────────────────────────┐
│                    SIDEBAR FOOTER                        │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [🔗]    [← Leave]              [× End]                 │
│  Share    Exit but              Terminate               │
│           keep active           permanently             │
│                                 (Admin only)            │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🚪 Leave Button Flow

```
┌─────────────────────────────────────────────────────────┐
│  USER CLICKS "LEAVE"                                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  ✅ Toast Notification                                   │
│  "Left workspace. You can resume anytime from           │
│   workspace history."                                    │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  REDIRECT TO /workspace                                  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  WORKSPACE HISTORY TABLE                                 │
├─────────────────────────────────────────────────────────┤
│  Role    Name         ID              Last Visited       │
│  ────────────────────────────────────────────────────   │
│  Admin   My Project   ws-abc123...    2m ago   [Resume] │
│                                                  ↑       │
│                                            Can rejoin!   │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  WORKSPACE STILL ACTIVE                                  │
│  • Other users continue working                          │
│  • Files preserved                                       │
│  • State maintained                                      │
│  • Can resume anytime                                    │
└─────────────────────────────────────────────────────────┘
```

---

## ❌ End Button Flow (Admin Only)

```
┌─────────────────────────────────────────────────────────┐
│  ADMIN CLICKS "END"                                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  ⚠️ CONFIRMATION DIALOG                                  │
│  ┌───────────────────────────────────────────────────┐  │
│  │ End Session Permanently?                          │  │
│  │                                                   │  │
│  │ This will:                                        │  │
│  │ • Terminate the workspace for all users          │  │
│  │ • Remove it from active sessions                 │  │
│  │ • Cannot be resumed                              │  │
│  │                                                   │  │
│  │ Are you sure?                                     │  │
│  │                                                   │  │
│  │         [Cancel]        [Confirm]                │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓
                   [Confirm]
                        ↓
┌─────────────────────────────────────────────────────────┐
│  ALL USERS RECEIVE NOTIFICATION                          │
│  ┌───────────────────────────────────────────────────┐  │
│  │ ⚠️ Workspace Terminated                           │  │
│  │                                                   │  │
│  │ The workspace owner has permanently ended this    │  │
│  │ session. All unsaved work will be lost.          │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  ALL USERS REDIRECTED TO /workspace                      │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  WORKSPACE HISTORY TABLE                                 │
├─────────────────────────────────────────────────────────┤
│  Role    Name         ID              Last Visited       │
│  ────────────────────────────────────────────────────   │
│  Admin   My Project   ws-abc123...    5m ago   [Session │
│                                                  Ended]  │
│                                                  ↑       │
│                                          Cannot resume!  │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│  WORKSPACE PERMANENTLY DELETED                           │
│  • Removed from active rooms                             │
│  • All files lost                                        │
│  • Cannot be recovered                                   │
│  • All users disconnected                                │
└─────────────────────────────────────────────────────────┘
```

---

## Side-by-Side Comparison

```
┌──────────────────────────────┬──────────────────────────────┐
│         LEAVE BUTTON         │         END BUTTON           │
├──────────────────────────────┼──────────────────────────────┤
│                              │                              │
│  [← Leave]                   │  [× End]                     │
│                              │                              │
│  • All users can use         │  • Admin only                │
│  • No confirmation           │  • Requires confirmation     │
│  • Workspace stays active    │  • Workspace deleted         │
│  • Can resume                │  • Cannot resume             │
│  • Files preserved           │  • Files lost                │
│  • Others continue working   │  • Everyone kicked out       │
│                              │                              │
│  ✅ Temporary exit            │  ❌ Permanent termination     │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

---

## User Perspective

### Regular User View
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR FOOTER                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [🔗 Share]              [← Leave]                       │
│                                                          │
│  Note: No "End" button visible                           │
│        (Not admin)                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Admin View
```
┌─────────────────────────────────────────────────────────┐
│  SIDEBAR FOOTER                                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  [🔗 Share]    [← Leave]              [× End]            │
│                                                          │
│  Note: "End" button visible                              │
│        (Admin privileges)                                │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Workspace History States

### Active Workspace (Can Resume)
```
┌─────────────────────────────────────────────────────────┐
│  🟢 ACTIVE                                               │
├─────────────────────────────────────────────────────────┤
│  Role:    Admin                                          │
│  Name:    My Awesome Project                             │
│  ID:      ws-abc123-def456                               │
│  Visited: 2 minutes ago                                  │
│                                                          │
│  [Resume →]  ← Click to rejoin                           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Ended Workspace (Cannot Resume)
```
┌─────────────────────────────────────────────────────────┐
│  ⚫ TERMINATED                                            │
├─────────────────────────────────────────────────────────┤
│  Role:    Admin                                          │
│  Name:    Old Project                                    │
│  ID:      ws-xyz789-ghi012                               │
│  Visited: 1 hour ago                                     │
│                                                          │
│  [Session Ended]  ← Cannot rejoin                        │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Multi-User Scenario

### Scenario: 3 Users in Workspace

```
┌─────────────────────────────────────────────────────────┐
│  WORKSPACE: "Team Project"                               │
│  Users: Alice (Admin), Bob, Charlie                      │
└─────────────────────────────────────────────────────────┘
```

#### Case 1: Bob Leaves
```
Bob clicks "Leave"
    ↓
┌─────────────────────────────────────────────────────────┐
│  WORKSPACE: "Team Project"                               │
│  Users: Alice (Admin), Charlie                           │
│                                                          │
│  • Bob sees: "Left workspace. Can resume anytime."       │
│  • Alice & Charlie see: "Bob left"                       │
│  • Workspace still active                                │
│  • Bob can click Resume to rejoin                        │
└─────────────────────────────────────────────────────────┘
```

#### Case 2: Alice (Admin) Ends Session
```
Alice clicks "End" → Confirms
    ↓
┌─────────────────────────────────────────────────────────┐
│  ALL USERS KICKED OUT                                    │
│                                                          │
│  • Alice sees: "Workspace session ended permanently."    │
│  • Bob sees: "⚠️ Workspace Terminated"                   │
│  • Charlie sees: "⚠️ Workspace Terminated"               │
│  • All redirected to /workspace                          │
│  • Workspace deleted                                     │
│  • Cannot resume                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Button Styling

### Leave Button
```
┌──────────────────────┐
│  ← Leave             │  ← Gray background
│                      │    White text
│  Hover: Lighter gray │    Subtle border
└──────────────────────┘
```

### End Button (Admin Only)
```
┌──────────────────────┐
│  × End               │  ← Red background
│                      │    White text
│  Hover: Darker red   │    Glowing shadow
└──────────────────────┘
```

---

## Toast Notifications

### Leave Success
```
┌─────────────────────────────────────────────────────────┐
│  ✅ Left workspace. You can resume anytime from          │
│     workspace history.                                   │
└─────────────────────────────────────────────────────────┘
```

### End Success (Admin)
```
┌─────────────────────────────────────────────────────────┐
│  ❌ Workspace session ended permanently.                 │
└─────────────────────────────────────────────────────────┘
```

### End Notification (Other Users)
```
┌─────────────────────────────────────────────────────────┐
│  ⚠️ Workspace Terminated                                 │
│                                                          │
│  The workspace owner has permanently ended this          │
│  session. All unsaved work will be lost.                │
└─────────────────────────────────────────────────────────┘
```

---

## Decision Tree

```
                    User wants to exit
                           |
                           |
            ┌──────────────┴──────────────┐
            |                             |
      Temporary exit?              Permanent end?
            |                             |
            |                             |
      Click "Leave"                 Click "End"
            |                             |
            |                             |
    ✅ Workspace active              ⚠️ Are you sure?
    ✅ Can resume                         |
    ✅ Others continue            ┌───────┴───────┐
            |                     |               |
            |                   Cancel         Confirm
            |                     |               |
            |                  No action      ❌ Deleted
            |                                 ❌ All kicked
            |                                 ❌ Cannot resume
            |
    Navigate to /workspace
            |
    See "Resume" button
```

---

## Summary Icons

```
🚪 LEAVE                          ❌ END
├─ 🟢 Workspace active            ├─ 🔴 Workspace deleted
├─ 👥 Others continue             ├─ 👥 Everyone kicked
├─ 💾 Files saved                 ├─ 🗑️ Files lost
├─ 🔄 Can resume                  ├─ 🚫 Cannot resume
└─ ⏱️ Temporary                   └─ ♾️ Permanent
```

This visual guide helps users understand the clear distinction between temporarily leaving and permanently ending a workspace session.
