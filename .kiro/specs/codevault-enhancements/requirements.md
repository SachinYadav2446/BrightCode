
# CodeVault Enhancements - Requirements

## Overview
Enhance the CodeVault notes-taking application with advanced features to make it a world-class note-taking experience while maintaining the clean, VS Code-inspired UI.

## Core Principles
- **UI First**: Never compromise the clean, minimal UI
- **Performance**: Keep the app fast and responsive
- **User Experience**: Make features discoverable but not intrusive
- **Progressive Enhancement**: Add features that enhance, not complicate

---

## Phase 1: Essential Features (Quick Wins)

### 1. Trash/Recycle Bin
**Priority**: Critical
**User Story**: As a user, I want to recover accidentally deleted notes

**Acceptance Criteria**:
- Notes are soft-deleted (not permanently removed)
- "Trash" section in sidebar shows deleted notes
- Restore button to recover notes
- Permanent delete option in trash
- Auto-purge trash after 30 days
- Trash icon shows count of deleted items

**UI Changes**:
- Add "Trash" section at bottom of sidebar
- Trash icon with badge count
- Restore and permanent delete buttons on hover

---

### 2. Favorites/Starred Notes
**Priority**: High
**User Story**: As a user, I want to quickly access my most important notes

**Acceptance Criteria**:
- Star icon to favorite/unfavorite notes
- "Favorites" section at top of sidebar
- Favorites persist across sessions
- Quick toggle from file list and editor
- Visual indicator (star icon) on favorited notes

**UI Changes**:
- Star icon in file list (appears on hover)
- Star icon in editor header
- "Favorites" section in sidebar (collapsible)
- Gold/yellow star color when favorited

---

### 3. Recent Notes
**Priority**: High
**User Story**: As a user, I want to quickly return to notes I was recently working on

**Acceptance Criteria**:
- Track last 10 opened notes
- "Recent" section in sidebar
- Update on note open
- Show last opened time
- Clear recent history option

**UI Changes**:
- "Recent" section in sidebar (collapsible)
- Clock icon with relative time ("2 min ago")
- Limit to 10 most recent

---

### 4. Rich Text Toolbar
**Priority**: High
**User Story**: As a user, I want easy formatting options without memorizing markdown

**Acceptance Criteria**:
- Toolbar with common formatting buttons
- Bold, Italic, Strikethrough, Code
- Headers (H1-H6 dropdown)
- Lists (bullet, numbered, checkbox)
- Link insertion
- Image upload
- Keyboard shortcuts work
- Toolbar appears above editor

**UI Changes**:
- Floating toolbar above Monaco editor
- Icon buttons with tooltips
- Subtle, minimal design
- Hide when in preview mode

---

### 5. Split View (Side-by-Side Preview)
**Priority**: High
**User Story**: As a user, I want to see markdown preview while editing

**Acceptance Criteria**:
- Toggle split view mode
- Editor on left, preview on right
- Synchronized scrolling
- Resizable split pane
- Remember user preference
- Works with all markdown features

**UI Changes**:
- Split view toggle button in editor header
- Vertical divider (resizable)
- Preview pane with same styling as full preview

---

### 6. Keyboard Shortcuts
**Priority**: Medium
**User Story**: As a power user, I want keyboard shortcuts for common actions

**Acceptance Criteria**:
- `Ctrl+N` - New note (in selected repo)
- `Ctrl+K` - Quick search (already exists)
- `Ctrl+B` - Bold
- `Ctrl+I` - Italic
- `Ctrl+E` - Toggle preview
- `Ctrl+D` - Duplicate note
- `Ctrl+/` - Show shortcuts help
- `Esc` - Close modals/panels
- Works across the app

**UI Changes**:
- Keyboard shortcuts help modal (`Ctrl+/` or `?`)
- Show shortcuts in tooltips
- Visual feedback when shortcut used

---

### 7. Note Statistics
**Priority**: Low
**User Story**: As a writer, I want to see word count and character count

**Acceptance Criteria**:
- Real-time word count
- Character count
- Reading time estimate
- Line count
- Show in editor footer

**UI Changes**:
- Stats bar at bottom of editor
- Minimal, subtle design
- Updates in real-time

---

### 8. Export Functionality
**Priority**: Medium
**User Story**: As a user, I want to export my notes to other formats

**Acceptance Criteria**:
- Export as Markdown (.md)
- Export as PDF
- Export as HTML
- Export single note or entire repository
- Preserve formatting
- Include metadata (title, date, tags)

**UI Changes**:
- Export button in editor header (dropdown)
- Export options: Markdown, PDF, HTML
- Progress indicator for large exports

---

### 9. Duplicate Note
**Priority**: Low
**User Story**: As a user, I want to quickly copy a note as a template

**Acceptance Criteria**:
- Duplicate button creates copy
- Copy has "(Copy)" suffix
- Preserves all content and tags
- Opens duplicated note
- Works from file list and editor

**UI Changes**:
- Duplicate button in file actions (hover)
- Duplicate option in editor menu

---

### 10. Note Templates
**Priority**: Medium
**User Story**: As a user, I want pre-made templates for common note types

**Acceptance Criteria**:
- Template library (meeting notes, daily journal, project plan, etc.)
- Create note from template
- Custom templates (save note as template)
- Template variables (date, time, user)
- Template preview

**UI Changes**:
- "New from Template" button
- Template picker modal
- Template management page

---

## Phase 2: Power User Features

### 11. Note Linking (Wiki-style)
**Priority**: High
**User Story**: As a user, I want to link notes together

**Acceptance Criteria**:
- `[[Note Title]]` syntax creates links
- Autocomplete note titles
- Click link to open note
- Backlinks panel (shows notes linking to current)
- Broken link detection
- Link preview on hover

**UI Changes**:
- Backlinks panel in editor sidebar
- Link styling in preview
- Autocomplete dropdown

---

### 12. Advanced Search
**Priority**: Medium
**User Story**: As a user, I want powerful search with filters

**Acceptance Criteria**:
- Search by content, title, tags
- Filter by repository, date range, favorites
- Search operators (AND, OR, NOT)
- Search in trash
- Search history
- Highlight search results

**UI Changes**:
- Enhanced search modal
- Filter chips
- Search results with context

---

### 13. Drag & Drop
**Priority**: Medium
**User Story**: As a user, I want to reorganize notes by dragging

**Acceptance Criteria**:
- Drag notes between repositories
- Drag to reorder in file list
- Drag files to upload
- Visual feedback during drag
- Undo move action

**UI Changes**:
- Drag handle on file items
- Drop zone indicators
- Smooth animations

---

### 14. Version History
**Priority**: Low
**User Story**: As a user, I want to see previous versions of my notes

**Acceptance Criteria**:
- Auto-save versions on significant changes
- View version history
- Restore previous version
- Compare versions (diff view)
- Limit to last 50 versions

**UI Changes**:
- History button in editor
- Timeline view of versions
- Diff viewer

---

### 15. Attachments
**Priority**: Medium
**User Story**: As a user, I want to attach files to notes

**Acceptance Criteria**:
- Upload files (images, PDFs, etc.)
- Drag & drop upload
- File preview
- Download attachments
- File size limits (10MB per file)
- Storage quota per user

**UI Changes**:
- Attachments panel in editor
- Upload button
- File list with icons

---

## Phase 3: Collaboration & Sharing

### 16. Share Notes
**Priority**: Medium
**User Story**: As a user, I want to share notes with others

**Acceptance Criteria**:
- Generate shareable link
- Read-only or edit permissions
- Password protection option
- Expiration date
- Revoke access
- Track views

**UI Changes**:
- Share button in editor
- Share settings modal
- Copy link button

---

### 17. Real-time Collaboration
**Priority**: Low
**User Story**: As a team, we want to edit notes together

**Acceptance Criteria**:
- Multiple users edit simultaneously
- See other users' cursors
- Conflict resolution
- User presence indicators
- Chat/comments

**UI Changes**:
- User avatars in editor
- Cursor indicators
- Comments sidebar

---

## Phase 4: Advanced Organization

### 18. Nested Folders
**Priority**: Medium
**User Story**: As a user, I want to organize notes in sub-folders

**Acceptance Criteria**:
- Create folders within folders
- Unlimited nesting depth
- Move folders
- Collapse/expand all
- Breadcrumb navigation

**UI Changes**:
- Indented folder tree
- Expand/collapse icons
- Breadcrumbs in editor header

---

### 19. Tag Improvements
**Priority**: Medium
**User Story**: As a user, I want better tag management

**Acceptance Criteria**:
- Tag autocomplete
- Tag colors
- Tag hierarchy (#work/project1)
- Tag management page
- Bulk tag operations
- Tag suggestions

**UI Changes**:
- Tag color picker
- Tag management modal
- Tag hierarchy in sidebar

---

### 20. Bulk Operations
**Priority**: Low
**User Story**: As a user, I want to perform actions on multiple notes

**Acceptance Criteria**:
- Multi-select notes (Ctrl+Click)
- Bulk move to repository
- Bulk tag
- Bulk delete
- Bulk export
- Select all in repository

**UI Changes**:
- Checkboxes on file items
- Bulk action toolbar
- Selection count indicator

---

## Technical Requirements

### Database Schema Changes
- Add `is_favorite`, `last_opened_at`, `view_count` to notes table
- Add `deleted_at` for soft delete (already exists)
- Add `versions` table for version history
- Add `attachments` table
- Add `shares` table for sharing
- Add `templates` table

### API Endpoints Needed
- `PATCH /api/notes/:id/favorite` - Toggle favorite
- `GET /api/notes/recent` - Get recent notes
- `GET /api/notes/favorites` - Get favorited notes
- `GET /api/notes/trash` - Get deleted notes
- `POST /api/notes/:id/restore` - Restore from trash
- `DELETE /api/notes/:id/permanent` - Permanent delete
- `POST /api/notes/:id/duplicate` - Duplicate note
- `POST /api/notes/:id/export` - Export note
- `GET /api/templates` - Get templates
- `POST /api/templates` - Create template
- `POST /api/notes/:id/versions` - Save version
- `GET /api/notes/:id/versions` - Get version history

### Performance Considerations
- Lazy load file lists (virtual scrolling)
- Debounce search (300ms)
- Optimize markdown rendering
- Cache frequently accessed notes
- Pagination for large repositories

### Security
- Validate file uploads
- Sanitize markdown output
- Rate limit API calls
- Encrypt sensitive data
- Audit log for important actions

---

## Success Metrics
- User retention increases by 30%
- Average session time increases by 50%
- Note creation rate increases by 40%
- User satisfaction score > 4.5/5
- Zero critical bugs in production

---

## Out of Scope (Future Considerations)
- Mobile apps (iOS/Android)
- AI features (summarization, writing assistant)
- Calendar integration
- Email to note
- Browser extension
- Offline mode
- End-to-end encryption
- Custom themes/CSS
