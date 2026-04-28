# Implementation Plan: CodeVault Notes System

## Overview

This implementation plan breaks down the CodeVault notes system into discrete, actionable coding tasks. The plan follows an incremental approach where each task builds on previous work, ensuring continuous integration and early validation. The MVP focuses on core note management, folder organization, full-text search, tagging, and arcade integration.

**Technology Stack**: React 19, Node.js/Express, PostgreSQL, Monaco Editor, marked/react-markdown

**Implementation Order**: Database → Backend API → Frontend Components → Integration → Polish

## Tasks

- [x] 1. Set up database schema and migrations
  - Create PostgreSQL migration file for notes and folders tables
  - Implement notes table with full-text search vector
  - Implement folders table with hierarchical structure
  - Add indexes for performance (user_id, folder_id, tags, search_vector, challenge_id)
  - Create trigger for auto-updating updated_at timestamp
  - Test migration by running it against development database
  - _Requirements: 1.3, 1.5, 3.4, 3.7, 10.6_

- [ ]* 1.1 Write unit tests for database schema
  - Test table creation and constraints
  - Test full-text search vector generation
  - Test folder hierarchy constraints (unique names per parent)
  - Test cascade delete behavior
  - _Requirements: 1.3, 3.7_

- [x] 2. Implement backend API endpoints for notes CRUD
  - [x] 2.1 Create GET /api/notes endpoint with filtering
    - Implement query parameter support (folderId, tag, search)
    - Add authentication middleware check
    - Return notes sorted by updated_at descending
    - Exclude soft-deleted notes (deleted_at IS NULL)
    - _Requirements: 1.1, 1.3, 4.1, 4.2_

  - [x] 2.2 Create GET /api/notes/:id endpoint
    - Fetch single note by ID with user ownership check
    - Return 404 if note not found or doesn't belong to user
    - Include all note fields including content
    - _Requirements: 1.1, 1.3_

  - [x] 2.3 Create POST /api/notes endpoint
    - Implement request validation (title required, max lengths)
    - Create note with user_id from JWT token
    - Generate title from first line if not provided
    - Return created note with generated ID
    - _Requirements: 1.1, 1.2, 1.7_

  - [x] 2.4 Create PUT /api/notes/:id endpoint
    - Validate user ownership before update
    - Update title, content, tags, folderId fields
    - Auto-update updated_at via database trigger
    - Return updated note data
    - _Requirements: 1.3, 1.5_

  - [x] 2.5 Create DELETE /api/notes/:id endpoint
    - Implement soft delete by setting deleted_at timestamp
    - Validate user ownership before deletion
    - Return success confirmation
    - _Requirements: 1.3_

  - [ ]* 2.6 Write API integration tests for notes endpoints
    - Test CRUD operations with authentication
    - Test authorization (users can only access own notes)
    - Test validation errors (missing title, too long content)
    - Test filtering by folder, tag, search query
    - _Requirements: 1.1, 1.2, 1.3, 1.5, 1.7_

- [x] 3. Implement backend API endpoints for folders
  - [x] 3.1 Create GET /api/folders endpoint
    - Fetch all folders for authenticated user
    - Return hierarchical structure with parent-child relationships
    - Include note count for each folder
    - _Requirements: 3.4, 3.7_

  - [x] 3.2 Create POST /api/folders endpoint
    - Validate folder name (required, unique within parent)
    - Create folder with optional parentId
    - Return created folder with ID
    - _Requirements: 3.7_

  - [x] 3.3 Create PUT /api/folders/:id endpoint
    - Validate user ownership and new name uniqueness
    - Update folder name
    - Return updated folder data
    - _Requirements: 3.7_

  - [x] 3.4 Create DELETE /api/folders/:id endpoint
    - Move notes to parent folder or root before deletion
    - Delete folder and update child folders' parentId
    - Return success confirmation
    - _Requirements: 3.4_

  - [ ]* 3.5 Write API integration tests for folders endpoints
    - Test folder creation with and without parent
    - Test folder hierarchy retrieval
    - Test folder deletion with note migration
    - Test unique name constraint within parent
    - _Requirements: 3.4, 3.7_

- [x] 4. Implement search and tags API endpoints
  - [x] 4.1 Create GET /api/search endpoint
    - Implement full-text search using PostgreSQL ts_vector
    - Rank results by relevance using ts_rank
    - Return results with title and content highlights
    - Limit results to authenticated user's notes
    - Support pagination with limit parameter
    - _Requirements: 4.1, 4.2, 4.3, 10.2_

  - [x] 4.2 Create GET /api/tags endpoint
    - Extract all unique tags from user's notes
    - Return tags with usage count
    - Sort by usage count descending
    - _Requirements: 3.1, 3.2, 3.6_

  - [ ]* 4.3 Write integration tests for search and tags
    - Test full-text search with various queries
    - Test search result ranking and highlights
    - Test tag extraction and counting
    - Test search performance with large dataset
    - _Requirements: 4.1, 4.2, 4.3, 3.1, 3.2_

- [ ] 5. Checkpoint - Ensure backend tests pass
  - Run all backend tests and verify they pass
  - Test API endpoints manually using Postman or curl
  - Verify database schema is correctly applied
  - Ask the user if questions arise

- [x] 6. Create frontend folder structure and routing
  - Create client/src/pages/CodeVault.jsx main container
  - Create client/src/pages/CodeVault.css for styling
  - Create client/src/components/codevault/ directory for sub-components
  - Add /codevault route to App.jsx with authentication guard
  - Add CodeVault link to Navbar component
  - _Requirements: 7.1, 7.2_

- [x] 7. Implement CodeVault main container component
  - [x] 7.1 Create CodeVault.jsx with layout structure
    - Set up three-column layout (sidebar, notes list, editor)
    - Implement state management for activeNote, selectedFolder, searchQuery
    - Add keyboard shortcut listener for Ctrl+K (open search modal)
    - Integrate with AuthContext for user authentication
    - _Requirements: 1.1, 7.1, 7.5_

  - [x] 7.2 Create API service layer (client/src/services/notesService.js)
    - Implement fetchNotes, createNote, updateNote, deleteNote functions
    - Implement fetchFolders, createFolder, updateFolder, deleteFolder functions
    - Implement searchNotes and fetchTags functions
    - Add error handling and JWT token inclusion
    - _Requirements: 1.1, 1.3, 3.4, 4.1_

  - [ ]* 7.3 Write unit tests for CodeVault container
    - Test component renders without crashing
    - Test keyboard shortcut triggers search modal
    - Test state updates when note is selected
    - Test authentication redirect for unauthenticated users
    - _Requirements: 1.1, 7.1, 7.5_

- [ ] 8. Implement Sidebar component with folder tree
  - [x] 8.1 Create Sidebar.jsx component
    - Display "CodeVault" header with "New Note" button
    - Render folder tree with expand/collapse functionality
    - Show quick stats (total notes, total folders)
    - Handle folder selection and highlight active folder
    - _Requirements: 3.4, 7.3_

  - [x] 8.2 Create FolderTree.jsx sub-component
    - Render recursive folder hierarchy
    - Implement expand/collapse icons for folders with children
    - Show note count badge for each folder
    - Add context menu for folder actions (rename, delete)
    - _Requirements: 3.4, 3.5, 7.6_

  - [x] 8.3 Add folder creation modal
    - Create modal for new folder with name input
    - Validate folder name (required, no duplicates in parent)
    - Support creating nested folders by selecting parent
    - _Requirements: 3.7_

  - [ ]* 8.4 Write unit tests for Sidebar and FolderTree
    - Test folder tree rendering with nested structure
    - Test expand/collapse functionality
    - Test folder selection updates active state
    - Test new folder creation flow
    - _Requirements: 3.4, 3.5, 3.7_

- [ ] 9. Implement NotesList component
  - [ ] 9.1 Create NotesList.jsx component
    - Display grid of note cards with title, preview, and metadata
    - Implement local search filtering based on searchQuery prop
    - Show empty state when no notes exist
    - Highlight active note card
    - _Requirements: 1.1, 4.1, 7.3_

  - [ ] 9.2 Create NoteCard.jsx sub-component
    - Display note title, truncated content preview (first 100 chars)
    - Show tags as colored badges
    - Display last updated timestamp (relative time)
    - Add hover effect and click handler
    - Show folder location breadcrumb
    - _Requirements: 1.1, 3.1, 7.3_

  - [ ] 9.3 Add sort and filter controls
    - Implement sort dropdown (date, title, folder)
    - Add tag filter chips (click tag to filter)
    - Show active filters with clear button
    - _Requirements: 3.2, 4.1_

  - [ ]* 9.4 Write unit tests for NotesList and NoteCard
    - Test note cards render with correct data
    - Test filtering by search query
    - Test sorting by different criteria
    - Test active note highlighting
    - Test empty state display
    - _Requirements: 1.1, 3.1, 3.2, 4.1_

- [x] 10. Implement NoteEditor component with Monaco
  - [x] 10.1 Create NoteEditor.jsx component
    - Set up split-pane layout with resizable divider
    - Integrate Monaco Editor with markdown language mode
    - Set Monaco theme to vs-dark to match BrightCode design
    - Implement controlled input for note content
    - _Requirements: 1.1, 1.4, 1.6_

  - [x] 10.2 Create EditorHeader.jsx sub-component
    - Add editable title input field
    - Implement tag input with autocomplete from existing tags
    - Show save status indicator (saving, saved, error)
    - Add close button to return to notes list
    - Display folder location breadcrumb
    - _Requirements: 1.1, 3.1, 3.6_

  - [x] 10.3 Implement auto-save functionality
    - Use useEffect with 3-second debounce timer
    - Compare current content with saved content to avoid unnecessary saves
    - Call updateNote API when content changes
    - Update save status indicator during save operation
    - Handle save errors with retry logic
    - _Requirements: 1.5_

  - [ ]* 10.4 Write unit tests for NoteEditor
    - Test Monaco editor renders with correct content
    - Test title and tag editing updates state
    - Test auto-save triggers after 3 seconds of inactivity
    - Test save status indicator updates
    - Test error handling for failed saves
    - _Requirements: 1.1, 1.4, 1.5, 1.6_

- [x] 11. Implement MarkdownPreview component
  - [x] 11.1 Create MarkdownPreview.jsx component
    - Use marked library to parse markdown to HTML
    - Integrate highlight.js for code syntax highlighting
    - Configure marked options for tables, GFM, breaks
    - Render HTML safely using dangerouslySetInnerHTML
    - _Requirements: 1.2, 1.4_

  - [x] 11.2 Add syntax highlighting for code blocks
    - Auto-detect language from code fence (```language)
    - Apply highlight.js themes matching BrightCode dark theme
    - Support common languages (JavaScript, Python, Java, CSS, HTML, SQL)
    - Add copy button to code blocks
    - _Requirements: 1.2_

  - [x] 11.3 Style markdown preview
    - Apply BrightCode typography styles
    - Style headings, lists, blockquotes, tables
    - Add syntax highlighting theme CSS
    - Ensure responsive layout for mobile
    - _Requirements: 1.4_

  - [ ]* 11.4 Write unit tests for MarkdownPreview
    - Test markdown parsing for various syntax elements
    - Test code block syntax highlighting
    - Test table rendering
    - Test link rendering
    - _Requirements: 1.2, 1.4_

- [ ] 12. Checkpoint - Ensure frontend core features work
  - Test creating, editing, and deleting notes in UI
  - Test folder creation and organization
  - Test Monaco editor and markdown preview
  - Test auto-save functionality
  - Ask the user if questions arise

- [ ] 13. Implement SearchModal component
  - [ ] 13.1 Create SearchModal.jsx component
    - Create modal overlay with backdrop blur effect
    - Add search input with autofocus
    - Implement keyboard navigation (arrow keys, Enter, Escape)
    - Close modal on Escape or backdrop click
    - _Requirements: 4.5, 7.1_

  - [ ] 13.2 Create SearchResults.jsx sub-component
    - Display search results with highlighted matches
    - Show note title, folder, and content snippet
    - Implement keyboard navigation for result selection
    - Handle empty results with helpful message
    - Show recent notes when query is empty
    - _Requirements: 4.1, 4.3, 7.3_

  - [ ] 13.3 Implement instant search with debouncing
    - Debounce search input by 300ms to reduce API calls
    - Call searchNotes API with query
    - Display loading indicator during search
    - Handle search errors gracefully
    - _Requirements: 4.1, 4.5_

  - [ ]* 13.4 Write unit tests for SearchModal
    - Test modal opens and closes correctly
    - Test keyboard shortcuts (Escape to close)
    - Test search input triggers API call
    - Test result selection navigates to note
    - Test recent notes display when query is empty
    - _Requirements: 4.1, 4.5, 7.1, 7.3_

- [ ] 14. Implement arcade challenge integration
  - [ ] 14.1 Create POST /api/notes/from-challenge endpoint
    - Accept challengeId, challengeTitle, challengeModule in request body
    - Create note with pre-populated template
    - Template includes challenge title, module, link, and starter sections
    - Return created note ID
    - _Requirements: 5.1, 5.4, 5.7_

  - [ ] 14.2 Create GET /api/notes/related/:challengeId endpoint
    - Fetch all notes linked to specific challenge ID
    - Return notes sorted by updated_at
    - Include note metadata (title, tags, folder)
    - _Requirements: 5.2, 5.5_

  - [ ] 14.3 Add "Create Note" button to Arcade challenge pages
    - Add button to Arcade.jsx challenge detail view
    - Call createNoteFromChallenge API on click
    - Navigate to CodeVault with new note opened
    - Show success toast notification
    - _Requirements: 5.1, 5.7_

  - [ ] 14.4 Display related notes in Arcade challenge view
    - Fetch related notes when challenge is opened
    - Show list of linked notes in sidebar or bottom panel
    - Add click handler to open note in CodeVault
    - _Requirements: 5.2, 5.5_

  - [ ]* 14.5 Write integration tests for arcade integration
    - Test note creation from challenge
    - Test note template population
    - Test related notes retrieval
    - Test navigation from Arcade to CodeVault
    - _Requirements: 5.1, 5.2, 5.4, 5.5, 5.7_

- [ ] 15. Implement tagging system
  - [ ] 15.1 Add tag parsing to note content
    - Extract tags from content using regex (#tagname pattern)
    - Update tags array when content changes
    - Store tags in database on note save
    - _Requirements: 3.1, 3.6_

  - [ ] 15.2 Create TagInput component
    - Allow manual tag addition via input field
    - Show autocomplete suggestions from existing tags
    - Display tags as removable chips
    - Validate tag format (no spaces, alphanumeric)
    - _Requirements: 3.1, 3.6_

  - [ ] 15.3 Add tag filtering to NotesList
    - Show all tags in sidebar or filter panel
    - Click tag to filter notes by that tag
    - Support multiple tag selection (AND logic)
    - Show active tag filters with clear option
    - _Requirements: 3.2_

  - [ ]* 15.4 Write unit tests for tagging system
    - Test tag extraction from content
    - Test tag input and autocomplete
    - Test tag filtering in notes list
    - Test tag persistence in database
    - _Requirements: 3.1, 3.2, 3.6_

- [ ] 16. Add UI polish and animations
  - [ ] 16.1 Add Framer Motion animations
    - Animate note card entrance (stagger effect)
    - Animate modal open/close (fade + scale)
    - Animate folder expand/collapse
    - Add smooth transitions for layout changes
    - _Requirements: 1.1, 7.1_

  - [ ] 16.2 Implement loading states
    - Add skeleton loaders for notes list
    - Show spinner during search
    - Display loading indicator during save
    - Add progress bar for bulk operations
    - _Requirements: 10.7_

  - [ ] 16.3 Add empty states
    - Design empty state for no notes (with CTA to create first note)
    - Empty state for no search results (with suggestions)
    - Empty state for empty folder
    - _Requirements: 1.1, 4.7_

  - [ ] 16.4 Implement toast notifications
    - Show success toast on note created/updated/deleted
    - Show error toast on API failures
    - Show info toast for auto-save status
    - Use react-hot-toast or similar library
    - _Requirements: 1.3, 1.5_

  - [ ]* 16.5 Write visual regression tests
    - Test component rendering matches design
    - Test responsive layout on mobile
    - Test dark theme consistency
    - Test animation performance
    - _Requirements: 1.1, 7.1_

- [ ] 17. Implement error handling and validation
  - [ ] 17.1 Add frontend validation
    - Validate note title (required, max 200 chars)
    - Validate folder name (required, unique in parent)
    - Validate tag format (alphanumeric, no spaces)
    - Show inline validation errors
    - _Requirements: 1.1, 3.7_

  - [ ] 17.2 Add error boundary for CodeVault
    - Create CodeVaultErrorBoundary component
    - Catch and log React errors
    - Display user-friendly error fallback UI
    - Provide "Reload" button to recover
    - _Requirements: 1.1_

  - [ ] 17.3 Implement API error handling
    - Handle network errors (offline, timeout)
    - Handle authentication errors (redirect to login)
    - Handle validation errors (show field-specific messages)
    - Handle server errors (show generic error message)
    - _Requirements: 1.3, 1.5_

  - [ ]* 17.4 Write error handling tests
    - Test validation error display
    - Test error boundary catches errors
    - Test API error handling for different error types
    - Test offline behavior
    - _Requirements: 1.1, 1.3, 1.5_

- [ ] 18. Optimize performance
  - [ ] 18.1 Implement lazy loading for notes list
    - Use React.lazy for code splitting
    - Implement virtual scrolling for large note lists
    - Load notes on-demand as user scrolls
    - _Requirements: 10.1, 10.3_

  - [ ] 18.2 Add memoization for expensive renders
    - Use React.memo for NoteCard component
    - Use useMemo for filtered/sorted notes
    - Use useCallback for event handlers
    - _Requirements: 10.4_

  - [ ] 18.3 Optimize search performance
    - Debounce search input (300ms)
    - Cache search results in memory
    - Implement pagination for search results
    - _Requirements: 4.1, 10.2_

  - [ ]* 18.4 Write performance tests
    - Test rendering performance with 100+ notes
    - Test search response time
    - Test editor responsiveness with large notes
    - Measure and optimize bundle size
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [ ] 19. Add accessibility features
  - [ ] 19.1 Implement keyboard navigation
    - Add keyboard shortcuts documentation
    - Ensure all interactive elements are keyboard accessible
    - Implement focus trap in modals
    - Add skip links for main content
    - _Requirements: 7.1, 7.5_

  - [ ] 19.2 Add ARIA labels and semantic HTML
    - Add aria-label to icon buttons
    - Use semantic HTML (nav, main, aside, article)
    - Add role attributes where needed
    - Ensure proper heading hierarchy
    - _Requirements: 1.1_

  - [ ] 19.3 Ensure color contrast and focus indicators
    - Verify WCAG AA color contrast ratios
    - Add visible focus indicators to all interactive elements
    - Test with keyboard-only navigation
    - _Requirements: 1.1_

  - [ ]* 19.4 Write accessibility tests
    - Test keyboard navigation flows
    - Test screen reader compatibility
    - Test focus management in modals
    - Run axe-core accessibility audit
    - _Requirements: 1.1, 7.1, 7.5_

- [ ] 20. Final integration and testing
  - [ ] 20.1 Test complete user flows end-to-end
    - Create note → Edit → Save → Search → Find → Delete
    - Create folder → Move note → Verify location → Delete folder
    - Link note to challenge → View in Arcade → Navigate back
    - Test auto-save recovery after browser refresh
    - _Requirements: 1.1, 1.3, 1.5, 3.4, 4.1, 5.1_

  - [ ] 20.2 Test cross-browser compatibility
    - Test in Chrome, Firefox, Safari, Edge
    - Verify Monaco editor works in all browsers
    - Test responsive design on mobile devices
    - _Requirements: 1.1, 1.6_

  - [ ] 20.3 Perform security audit
    - Verify JWT authentication on all endpoints
    - Test authorization (users can only access own notes)
    - Check for XSS vulnerabilities in markdown rendering
    - Verify SQL injection protection (parameterized queries)
    - _Requirements: 1.3_

  - [ ]* 20.4 Write end-to-end tests
    - Test complete user journey with Playwright
    - Test authentication flow
    - Test note CRUD operations
    - Test search functionality
    - Test arcade integration
    - _Requirements: 1.1, 1.3, 1.5, 3.4, 4.1, 5.1_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Run all unit tests and verify they pass
  - Run all integration tests and verify they pass
  - Test manually in browser for any edge cases
  - Verify performance benchmarks are met
  - Ask the user if questions arise

## Notes

- Tasks marked with `*` are optional testing tasks and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation and allow for user feedback
- The implementation follows a bottom-up approach: database → backend → frontend → integration
- Auto-save functionality is critical for preventing data loss
- Search performance is a key metric (target: <100ms for 1000+ notes)
- Monaco Editor is already integrated in the project via @monaco-editor/react
- PostgreSQL full-text search provides powerful search capabilities without external dependencies
- All API endpoints require JWT authentication for security
- The design follows BrightCode's existing dark theme and red accent color scheme

## Success Criteria

- Users can create, edit, and delete notes with markdown support
- Notes are organized in folders with drag-and-drop functionality
- Full-text search returns relevant results in <100ms
- Auto-save prevents data loss during editing
- Notes can be linked to arcade challenges
- UI is responsive and accessible (WCAG AA)
- System handles 1000+ notes per user without performance degradation
