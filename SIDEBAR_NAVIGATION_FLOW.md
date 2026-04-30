# Sidebar Navigation Flow - Visual Guide

## Navigation Structure

```
┌─────────────────────────────────────────────────────────────┐
│                    WORKSPACE SIDEBAR                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  VIEW 1: FILES (Default)                                     │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │         EXPLORER                          [→]         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  📁 WORKSPACE                                                │
│    ├─ 📄 index.js                                           │
│    ├─ 📄 App.jsx                                            │
│    └─ 📁 components                                         │
│       ├─ 📄 Header.jsx                                      │
│       └─ 📄 Footer.jsx                                      │
│                                                              │
│  [Click → to view Collaborators]                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    Click Right Arrow
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  VIEW 2: COLLABORATORS                                       │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [←]         COLLABORATORS                [→]         │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 Alice                              [OWNER]        │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 Bob                                               │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🟢 Charlie                                           │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Click ← to go back | Click → to open Chat]                │
└─────────────────────────────────────────────────────────────┘
                            ↓
                    Click Right Arrow
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  VIEW 3: CHAT                                                │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────────────────────────────────────────────────┐  │
│  │  [←]              TEAM CHAT                           │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Alice                              10:30 AM          │   │
│  │ Hey team, how's the progress?                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Bob                                10:31 AM          │   │
│  │ Working on the header component!                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ You                                10:32 AM          │   │
│  │ Great! I'll review it soon.                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ [Type a message...]                          [Send]  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                              │
│  [Click ← to go back to Collaborators]                      │
└─────────────────────────────────────────────────────────────┘
```

## Navigation Buttons

### Right Arrow Button (→)
- **Appears in**: Files view, Collaborators view
- **Action**: Moves to the next view
- **Styling**: 
  - Default: Light gray with subtle border
  - Hover: Red accent color with scale effect
  - Active: Slightly smaller scale

### Left Arrow Button (←)
- **Appears in**: Collaborators view, Chat view
- **Action**: Moves to the previous view
- **Styling**: Same as right arrow

## View Transitions

```
Files View
  └─→ Shows: File explorer tree
  └─→ Arrow: Right only
  └─→ Action: Click → to see Collaborators

Collaborators View
  └─→ Shows: List of online team members
  └─→ Arrows: Left and Right
  └─→ Actions: 
      ├─→ Click ← to return to Files
      └─→ Click → to open Chat

Chat View
  └─→ Shows: Real-time team chat
  └─→ Arrow: Left only
  └─→ Action: Click ← to return to Collaborators
```

## Chat Features

### Message Display
```
┌─────────────────────────────────────────────────────┐
│ Username                           Timestamp         │
│ Message content here...                             │
└─────────────────────────────────────────────────────┘
```

### Own Messages (Highlighted)
```
┌─────────────────────────────────────────────────────┐
│ You                                10:32 AM          │
│ Your message appears with red accent                │
└─────────────────────────────────────────────────────┘
```

### Empty State
```
┌─────────────────────────────────────────────────────┐
│                                                      │
│                    📤                                │
│              No messages yet                         │
│         Start the conversation!                      │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## User Interaction Flow

1. **User opens workspace** → Sees Files view by default
2. **User clicks right arrow** → Slides to Collaborators view
3. **User sees team members** → Can go back or continue forward
4. **User clicks right arrow again** → Slides to Chat view
5. **User types message** → Presses Enter or clicks Send
6. **Message appears** → All collaborators see it in real-time
7. **User clicks left arrow** → Returns to Collaborators
8. **User clicks left arrow again** → Returns to Files

## Key Benefits

✅ **No Tab Clutter**: Clean header with just the view title
✅ **Intuitive Navigation**: Natural left-to-right flow
✅ **Visual Feedback**: Arrows show available directions
✅ **Real-time Chat**: Instant message delivery
✅ **Smooth Transitions**: Professional sliding effect
✅ **Consistent Design**: Matches app's red accent theme

## Technical Notes

- Navigation state managed by `sidebarView` state variable
- Chat messages stored in `chatMessages` array
- Real-time updates via Socket.io
- Auto-scroll to latest messages
- Timestamps formatted for readability
- Own messages visually distinguished
