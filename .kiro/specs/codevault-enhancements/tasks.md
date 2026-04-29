# CodeVault Enhancements - Implementation Tasks

## Phase 1: Essential Features (Quick Wins)

### Task 1: Database Schema Updates
- [x] 1.1 Create migration file `002_add_notes_features.sql`
- [x] 1.2 Add `is_favorite` column to notes table
- [x] 1.3 Add `last_opened_at` column to notes table
- [x] 1.4 Add `view_count` column to notes table
- [x] 1.5 Add `word_count` column to notes table
- [x] 1.6 Create indexes for favorites and recent notes
- [ ] 1.7 Test migration on development database

### Task 2: Trash/Recycle Bin
- [ ] 2.1 Update DELETE endpoint to soft delete (set `deleted_at`)
- [ ] 2.2 Create `GET /api/notes/trash` endpoint
- [ ] 2.3 Create `POST /api/notes/:id/restore` endpoint
- [ ] 2.4 Create `DELETE /api/notes/:id/permanent` endpoint
- [ ] 2.5 Add TrashSection component to sidebar
- [ ] 2.6 Add trash icon with badge count
- [ ] 2.7 Add restore and permanent delete buttons
- [ ] 2.8 Add confirmation dialogs
- [ ] 2.9 Style trash section
- [ ] 2.10 Test trash functionality

### Task 3: Favorites System
- [ ] 3.1 Create `PATCH /api/notes/:id/favorite` endpoint
- [ ] 3.2 Create `GET /api/notes/favorites` endpoint
- [ ] 3.3 Add FavoritesSection component to sidebar
- [ ] 3.4 Add star icon to file items (hover state)
- [ ] 3.5 Add star icon to editor header
- [ ] 3.6 Implement toggle favorite functionality
- [ ] 3.7 Style favorite indicators (gold star)
- [ ] 3.8 Add collapse/expand for favorites section
- [ ] 3.9 Test favorite functionality
- [ ] 3.10 Add keyboard shortcut (Ctrl+Shift+F)

### Task 4: Recent Notes
- [ ] 4.1 Create `PATCH /api/notes/:id/open` endpoint
- [ ] 4.2 Create `GET /api/notes/recent` endpoint
- [ ] 4.3 Add RecentSection component to sidebar
- [ ] 4.4 Track note opens in CodeVault.jsx
- [ ] 4.5 Display relative time ("2 min ago")
- [ ] 4.6 Limit to 10 most recent
- [ ] 4.7 Add collapse/expand for recent section
- [ ] 4.8 Style recent section
- [ ] 4.9 Add clear recent history option
- [ ] 4.10 Test recent notes functionality

### Task 5: Rich Text Toolbar
- [ ] 5.1 Create RichTextToolbar component
- [ ] 5.2 Add Bold button with Ctrl+B handler
- [ ] 5.3 Add Italic button with Ctrl+I handler
- [ ] 5.4 Add Strikethrough button
- [ ] 5.5 Add Inline code button
- [ ] 5.6 Add Headers dropdown (H1-H6)
- [ ] 5.7 Add Bullet list button
- [ ] 5.8 Add Numbered list button
- [ ] 5.9 Add Checkbox list button
- [ ] 5.10 Add Link insertion button with modal
- [ ] 5.11 Add Image upload button
- [ ] 5.12 Integrate toolbar with Monaco editor
- [ ] 5.13 Add tooltips with keyboard shortcuts
- [ ] 5.14 Style toolbar (minimal, subtle)
- [ ] 5.15 Hide toolbar in preview mode
- [ ] 5.16 Test all formatting options

### Task 6: Split View
- [ ] 6.1 Install react-split-pane library
- [ ] 6.2 Create SplitView component
- [ ] 6.3 Add split view toggle button to editor header
- [ ] 6.4 Implement vertical split (editor left, preview right)
- [ ] 6.5 Add resizable divider
- [ ] 6.6 Implement synchronized scrolling
- [ ] 6.7 Save split view preference to localStorage
- [ ] 6.8 Style split view
- [ ] 6.9 Test split view functionality
- [ ] 6.10 Add keyboard shortcut (Ctrl+\\)

### Task 7: Keyboard Shortcuts
- [ ] 7.1 Create KeyboardShortcutsModal component
- [ ] 7.2 Implement global keyboard event listener
- [ ] 7.3 Add Ctrl+N for new note
- [ ] 7.4 Add Ctrl+B for bold
- [ ] 7.5 Add Ctrl+I for italic
- [ ] 7.6 Add Ctrl+E for toggle preview
- [ ] 7.7 Add Ctrl+D for duplicate note
- [ ] 7.8 Add Ctrl+/ or ? for shortcuts help
- [ ] 7.9 Add Esc for close modals
- [ ] 7.10 Display shortcuts in tooltips
- [ ] 7.11 Style shortcuts modal
- [ ] 7.12 Test all keyboard shortcuts

### Task 8: Note Statistics
- [ ] 8.1 Create StatsBar component
- [ ] 8.2 Calculate word count in real-time
- [ ] 8.3 Calculate character count
- [ ] 8.4 Calculate reading time estimate
- [ ] 8.5 Calculate line count
- [ ] 8.6 Add stats bar to editor footer
- [ ] 8.7 Style stats bar (minimal, subtle)
- [ ] 8.8 Optimize performance with useMemo
- [ ] 8.9 Test stats calculations
- [ ] 8.10 Add toggle to show/hide stats

### Task 9: Export Functionality
- [ ] 9.1 Create exportService.js
- [ ] 9.2 Implement Markdown export
- [ ] 9.3 Implement HTML export (with styling)
- [ ] 9.4 Implement PDF export (using jsPDF or similar)
- [ ] 9.5 Create `POST /api/notes/:id/export` endpoint
- [ ] 9.6 Create ExportModal component
- [ ] 9.7 Add export button to editor header (dropdown)
- [ ] 9.8 Add export options (Markdown, HTML, PDF)
- [ ] 9.9 Add progress indicator for exports
- [ ] 9.10 Add repository export (zip all notes)
- [ ] 9.11 Style export modal
- [ ] 9.12 Test all export formats

### Task 10: Duplicate Note
- [ ] 10.1 Create `POST /api/notes/:id/duplicate` endpoint
- [ ] 10.2 Add duplicate button to file actions
- [ ] 10.3 Add duplicate option to editor menu
- [ ] 10.4 Append "(Copy)" to duplicated note title
- [ ] 10.5 Open duplicated note after creation
- [ ] 10.6 Test duplicate functionality
- [ ] 10.7 Add keyboard shortcut (Ctrl+D)

---

## Phase 2: Power User Features

### Task 11: Note Templates
- [ ] 11.1 Create templates table in database
- [ ] 11.2 Create `GET /api/templates` endpoint
- [ ] 11.3 Create `POST /api/templates` endpoint
- [ ] 11.4 Create `POST /api/notes/from-template` endpoint
- [ ] 11.5 Create TemplatePickerModal component
- [ ] 11.6 Add system templates (meeting, journal, project)
- [ ] 11.7 Add "New from Template" button
- [ ] 11.8 Add "Save as Template" option
- [ ] 11.9 Implement template variables ({{date}}, {{time}})
- [ ] 11.10 Add template preview
- [ ] 11.11 Style template picker
- [ ] 11.12 Test template functionality

### Task 12: Note Linking (Wiki-style)
- [ ] 12.1 Implement [[Note Title]] parser
- [ ] 12.2 Add autocomplete for note titles
- [ ] 12.3 Create clickable links in preview
- [ ] 12.4 Create BacklinksPanel component
- [ ] 12.5 Create `GET /api/notes/:id/backlinks` endpoint
- [ ] 12.6 Detect broken links
- [ ] 12.7 Add link preview on hover
- [ ] 12.8 Style note links
- [ ] 12.9 Test note linking
- [ ] 12.10 Add keyboard shortcut (Ctrl+K for link)

### Task 13: Advanced Search
- [ ] 13.1 Enhance search modal UI
- [ ] 13.2 Add filter chips (repository, date, tags)
- [ ] 13.3 Implement search operators (AND, OR, NOT)
- [ ] 13.4 Add search in trash option
- [ ] 13.5 Add search history
- [ ] 13.6 Highlight search results in preview
- [ ] 13.7 Add search results with context snippets
- [ ] 13.8 Optimize search performance
- [ ] 13.9 Style enhanced search modal
- [ ] 13.10 Test advanced search

### Task 14: Drag & Drop
- [ ] 14.1 Install react-beautiful-dnd library
- [ ] 14.2 Implement drag notes between repositories
- [ ] 14.3 Implement drag to reorder in file list
- [ ] 14.4 Implement drag files to upload
- [ ] 14.5 Add visual feedback during drag
- [ ] 14.6 Add drop zone indicators
- [ ] 14.7 Implement undo move action
- [ ] 14.8 Style drag & drop
- [ ] 14.9 Test drag & drop functionality
- [ ] 14.10 Add keyboard alternative (Ctrl+X, Ctrl+V)

### Task 15: Version History
- [ ] 15.1 Create note_versions table
- [ ] 15.2 Create `POST /api/notes/:id/versions` endpoint
- [ ] 15.3 Create `GET /api/notes/:id/versions` endpoint
- [ ] 15.4 Auto-save versions on significant changes
- [ ] 15.5 Create VersionHistoryPanel component
- [ ] 15.6 Add history button to editor
- [ ] 15.7 Display timeline view of versions
- [ ] 15.8 Implement restore previous version
- [ ] 15.9 Add diff viewer (compare versions)
- [ ] 15.10 Limit to last 50 versions
- [ ] 15.11 Style version history panel
- [ ] 15.12 Test version history

### Task 16: Attachments
- [ ] 16.1 Create attachments table
- [ ] 16.2 Create `POST /api/notes/:id/attachments` endpoint
- [ ] 16.3 Create `GET /api/notes/:id/attachments` endpoint
- [ ] 16.4 Create `DELETE /api/attachments/:id` endpoint
- [ ] 16.5 Implement file upload (multer)
- [ ] 16.6 Add file size validation (10MB limit)
- [ ] 16.7 Create AttachmentsPanel component
- [ ] 16.8 Implement drag & drop upload
- [ ] 16.9 Add file preview (images, PDFs)
- [ ] 16.10 Add download button
- [ ] 16.11 Style attachments panel
- [ ] 16.12 Test attachments functionality

---

## Phase 3: Collaboration & Sharing

### Task 17: Share Notes
- [ ] 17.1 Create shares table
- [ ] 17.2 Create `POST /api/notes/:id/share` endpoint
- [ ] 17.3 Create `GET /api/shares/:shareId` endpoint (public)
- [ ] 17.4 Create `DELETE /api/shares/:shareId` endpoint
- [ ] 17.5 Generate shareable links
- [ ] 17.6 Implement read-only vs edit permissions
- [ ] 17.7 Add password protection option
- [ ] 17.8 Add expiration date option
- [ ] 17.9 Track view count
- [ ] 17.10 Create ShareModal component
- [ ] 17.11 Add share button to editor
- [ ] 17.12 Style share modal
- [ ] 17.13 Test sharing functionality

### Task 18: Real-time Collaboration (Future)
- [ ] 18.1 Integrate WebSocket (Socket.io)
- [ ] 18.2 Implement operational transformation (OT)
- [ ] 18.3 Add user presence indicators
- [ ] 18.4 Show other users' cursors
- [ ] 18.5 Implement conflict resolution
- [ ] 18.6 Add comments/chat sidebar
- [ ] 18.7 Test real-time collaboration

---

## Phase 4: Advanced Organization

### Task 19: Nested Folders
- [ ] 19.1 Update folders table schema (parent_id already exists)
- [ ] 19.2 Update folder tree rendering (recursive)
- [ ] 19.3 Add create subfolder option
- [ ] 19.4 Implement move folder
- [ ] 19.5 Add collapse/expand all
- [ ] 19.6 Add breadcrumb navigation
- [ ] 19.7 Style nested folders (indentation)
- [ ] 19.8 Test nested folders

### Task 20: Tag Improvements
- [ ] 20.1 Add tag autocomplete
- [ ] 20.2 Implement tag colors
- [ ] 20.3 Support tag hierarchy (#work/project1)
- [ ] 20.4 Create TagManagementModal component
- [ ] 20.5 Add bulk tag operations
- [ ] 20.6 Add tag suggestions (AI-based)
- [ ] 20.7 Style tag improvements
- [ ] 20.8 Test tag features

### Task 21: Bulk Operations
- [ ] 21.1 Add multi-select (Ctrl+Click)
- [ ] 21.2 Add checkboxes to file items
- [ ] 21.3 Create bulk action toolbar
- [ ] 21.4 Implement bulk move
- [ ] 21.5 Implement bulk tag
- [ ] 21.6 Implement bulk delete
- [ ] 21.7 Implement bulk export
- [ ] 21.8 Add select all in repository
- [ ] 21.9 Style bulk operations UI
- [ ] 21.10 Test bulk operations

---

## Testing Tasks

### Unit Tests
- [ ] Test notesService.js functions
- [ ] Test exportService.js functions
- [ ] Test templateService.js functions
- [ ] Test utility functions (word count, etc.)
- [ ] Test component rendering

### Integration Tests
- [ ] Test create/edit/delete note flow
- [ ] Test favorites functionality
- [ ] Test trash and restore
- [ ] Test search functionality
- [ ] Test export functionality

### E2E Tests
- [ ] Test complete user journey
- [ ] Test keyboard shortcuts
- [ ] Test drag & drop
- [ ] Test collaboration features
- [ ] Cross-browser testing

---

## Documentation Tasks
- [ ] Update API documentation
- [ ] Create user guide
- [ ] Create keyboard shortcuts reference
- [ ] Create developer documentation
- [ ] Add inline code comments

---

## Deployment Tasks
- [ ] Run database migrations
- [ ] Update environment variables
- [ ] Deploy backend changes
- [ ] Deploy frontend changes
- [ ] Monitor for errors
- [ ] Gather user feedback

---

## Priority Legend
- **Critical**: Must have for MVP
- **High**: Important for good UX
- **Medium**: Nice to have
- **Low**: Future enhancement

## Estimated Timeline
- **Phase 1**: 2-3 weeks (Quick Wins)
- **Phase 2**: 2-3 weeks (Power User Features)
- **Phase 3**: 2-3 weeks (Collaboration)
- **Phase 4**: 1-2 weeks (Advanced Organization)
- **Total**: 7-11 weeks for complete implementation
