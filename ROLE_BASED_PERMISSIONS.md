# Role-Based Permission System

## Overview
Implemented a comprehensive 3-tier role-based permission system for collaborative workspaces.

## Roles

### 1. **Admin** (Workspace Creator)
- Full control over the workspace
- Can create, edit, and delete files
- Can manage user permissions
- Can kick users from workspace
- Automatically assigned to workspace creator
- Cannot be changed or removed

### 2. **Writer**
- Can create, edit, and delete files
- Can run code
- Cannot manage other users
- Assigned by admin

### 3. **Viewer** (Default for new users)
- Read-only access to all files
- Cannot create, edit, or delete files
- Cannot run code
- Can view all workspace content
- Default role for all joining users

## Features

### Admin Controls
- **Role Toggle Button**: Admins see an edit icon button next to each user
  - Click to toggle between Writer and Viewer
  - Green when user is a Writer
  - Gray when user is a Viewer
- **Kick Button**: Red X button to remove users from workspace

### Visual Indicators
- **Role Badges**: Color-coded badges show each user's role
  - Red badge: ADMIN
  - Green badge: WRITER
  - Gray badge: VIEWER
- **"(You)" Tag**: Current user sees their name marked with "(You)"

### Permission Enforcement

#### Viewers Cannot:
- Edit code in the Monaco editor (read-only mode)
- Create new files or folders
- Rename files or folders
- Delete files or folders
- See file/folder action buttons
- Run code

#### Writers Can:
- Edit code freely
- Create, rename, and delete files/folders
- Run code
- All file operations

#### Admins Can:
- Everything writers can do
- Change user permissions
- Kick users from workspace

## Technical Implementation

### Client-Side (EditorPage.jsx)
- Added `canWrite` computed property: `isAdmin || myPermission === 'writer'`
- Added `isViewer` computed property: `myPermission === 'viewer' && !isAdmin`
- Conditional rendering of file operation buttons based on `canWrite`
- Monaco editor `readOnly` option set to `!canWrite`
- Role management UI in collaborators sidebar

### Server-Side (server/index.js)
- Default permission for new users: `'viewer'`
- New `change-permission` socket event handler
- Permission validation on all file operations
- Role tracking in user data structure

### Styling (EditorPage.css)
- `.role-badge` with variants: `.admin`, `.writer`, `.viewer`
- `.role-toggle-btn` with active state
- `.user-actions` container for action buttons
- Color-coded badges matching the theme

## Usage

### For Admins:
1. View collaborators in the sidebar
2. Click the edit icon next to a user to toggle Writer/Viewer
3. Click the X icon to remove a user

### For Users:
- Your role badge shows your current permissions
- UI elements automatically hide/show based on your role
- Editor becomes read-only if you're a Viewer

## Security
- All permission checks enforced on server-side
- Socket events validate admin status before executing
- Cannot change admin's own permissions
- Cannot kick the admin
