# Design Document: CodeVault Notes System

## Overview

CodeVault is an integrated knowledge management system for the BrightCode platform that enables developers to create, organize, and connect learning notes with their coding journey. The system provides an Obsidian-like experience with markdown editing, bidirectional linking, tagging, and seamless integration with arcade challenges.

### Core Philosophy

- **Developer-First**: Optimized for technical documentation with code syntax highlighting
- **Connected Learning**: Links notes to challenges, modules, and concepts
- **Frictionless Capture**: Quick access from anywhere in the platform
- **Progressive Enhancement**: Start with core features, expand to advanced visualizations

### MVP Scope

Phase 1 focuses on essential functionality:
- Note creation and editing with markdown support
- Folder-based organization
- Full-text search with quick access (Ctrl+K)
- Basic tagging system
- Integration with arcade challenges

Phase 2 (Future):
- Bidirectional linking with [[wikilinks]]
- Knowledge graph visualization
- Advanced export formats
- Real-time collaboration

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     BrightCode Platform                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Arcade   │  │  Workspace │  │    Home    │            │
│  └─────┬──────┘  └─────┬──────┘  └─────┬──────┘            │
│        │                │                │                    │
│        └────────────────┼────────────────┘                    │
│                         │                                     │
│              ┌──────────▼──────────┐                         │
│              │  CodeVault Router   │                         │
│              └──────────┬──────────┘                         │
│                         │                                     │
│        ┌────────────────┼────────────────┐                   │
│        │                │                │                   │
│   ┌────▼─────┐    ┌────▼─────┐    ┌────▼─────┐             │
│   │  Notes   │    │  Search  │    │  Folders │             │
│   │  Editor  │    │  Engine  │    │  Manager │             │
│   └────┬─────┘    └────┬─────┘    └────┬─────┘             │
│        │               │               │                     │
│        └───────────────┼───────────────┘                     │
│                        │                                     │
│              ┌─────────▼─────────┐                           │
│              │   Notes Service   │                           │
│              └─────────┬─────────┘                           │
│                        │                                     │
│              ┌─────────▼─────────┐                           │
│              │  PostgreSQL DB    │                           │
│              └───────────────────┘                           │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Frontend:**
- React 19 with Hooks
- Monaco Editor (already integrated via @monaco-editor/react)
- Framer Motion for animations
- Lucide React for icons
- React Router for navigation

**Backend:**
- Node.js + Express (existing server)
- PostgreSQL for persistent storage
- JWT authentication (already implemented)

**Libraries:**
- marked or react-markdown for markdown parsing
- highlight.js or Prism for syntax highlighting
- fuse.js for fuzzy search

### Integration Points

1. **Authentication**: Uses existing JWT-based auth system
2. **User Context**: Integrates with AuthContext for user data
3. **Navigation**: Extends existing Navbar and routing
4. **Styling**: Follows BrightCode design system (red accent, dark theme)

## Components and Interfaces

### Frontend Components

#### 1. CodeVault Main Container (`CodeVault.jsx`)

```javascript
// Main container component
const CodeVault = () => {
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  
  return (
    <div className="codevault-container">
      <Navbar currentPage="codevault" />
      <div className="codevault-layout">
        <Sidebar />
        <NotesList />
        <NoteEditor />
      </div>
    </div>
  );
};
```

**Responsibilities:**
- Manages global state for active note, search, folders
- Coordinates between sidebar, list, and editor
- Handles keyboard shortcuts (Ctrl+K for search)

#### 2. Sidebar Component (`Sidebar.jsx`)

```javascript
const Sidebar = ({ folders, onFolderSelect, onCreateFolder }) => {
  return (
    <aside className="codevault-sidebar">
      <div className="sidebar-header">
        <h2>CodeVault</h2>
        <button onClick={onCreateNote}>New Note</button>
      </div>
      <FolderTree folders={folders} onSelect={onFolderSelect} />
      <QuickStats />
    </aside>
  );
};
```

**Features:**
- Folder tree navigation
- New note/folder creation
- Quick stats (total notes, tags)
- Collapsible sections

#### 3. Notes List Component (`NotesList.jsx`)

```javascript
const NotesList = ({ notes, activeNote, onNoteSelect, searchQuery }) => {
  const filteredNotes = useMemo(() => 
    filterNotes(notes, searchQuery), 
    [notes, searchQuery]
  );
  
  return (
    <div className="notes-list">
      <SearchBar value={searchQuery} onChange={setSearchQuery} />
      <div className="notes-grid">
        {filteredNotes.map(note => (
          <NoteCard 
            key={note.id} 
            note={note} 
            active={note.id === activeNote?.id}
            onClick={() => onNoteSelect(note)}
          />
        ))}
      </div>
    </div>
  );
};
```

**Features:**
- Search bar with instant filtering
- Note cards with preview
- Sort options (date, title, folder)
- Empty state handling

#### 4. Note Editor Component (`NoteEditor.jsx`)

```javascript
const NoteEditor = ({ note, onSave, onClose }) => {
  const [content, setContent] = useState(note?.content || '');
  const [title, setTitle] = useState(note?.title || '');
  const [tags, setTags] = useState(note?.tags || []);
  
  // Auto-save every 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== note?.content) {
        onSave({ ...note, content, title, tags });
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [content, title, tags]);
  
  return (
    <div className="note-editor">
      <EditorHeader 
        title={title} 
        onTitleChange={setTitle}
        tags={tags}
        onTagsChange={setTags}
      />
      <div className="editor-layout">
        <MonacoEditor 
          value={content}
          onChange={setContent}
          language="markdown"
          theme="vs-dark"
        />
        <MarkdownPreview content={content} />
      </div>
    </div>
  );
};
```

**Features:**
- Split-pane editor with live preview
- Auto-save functionality
- Title and tag editing
- Syntax highlighting for code blocks
- Resizable panes

#### 5. Search Modal Component (`SearchModal.jsx`)

```javascript
const SearchModal = ({ isOpen, onClose, onNoteSelect }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  
  useEffect(() => {
    if (query.length > 0) {
      const searchResults = searchNotes(query);
      setResults(searchResults);
    }
  }, [query]);
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div className="search-modal-overlay">
          <div className="search-modal">
            <input 
              type="text"
              placeholder="Search notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <SearchResults results={results} onSelect={onNoteSelect} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

**Features:**
- Keyboard-driven interface
- Instant search results
- Highlighted matches
- Recent notes fallback

#### 6. Markdown Preview Component (`MarkdownPreview.jsx`)

```javascript
const MarkdownPreview = ({ content }) => {
  const html = useMemo(() => {
    return marked(content, {
      highlight: (code, lang) => {
        return hljs.highlight(code, { language: lang }).value;
      }
    });
  }, [content]);
  
  return (
    <div 
      className="markdown-preview"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
```

**Features:**
- Real-time markdown rendering
- Code syntax highlighting
- Table support
- Safe HTML rendering

### Backend API Endpoints

#### Notes API

```javascript
// GET /api/notes - Get all notes for user
app.get('/api/notes', authenticateToken, async (req, res) => {
  const { folderId, tag, search } = req.query;
  // Returns filtered notes
});

// GET /api/notes/:id - Get single note
app.get('/api/notes/:id', authenticateToken, async (req, res) => {
  // Returns note with full content
});

// POST /api/notes - Create new note
app.post('/api/notes', authenticateToken, async (req, res) => {
  const { title, content, folderId, tags } = req.body;
  // Creates note and returns ID
});

// PUT /api/notes/:id - Update note
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
  const { title, content, tags, folderId } = req.body;
  // Updates note and returns updated data
});

// DELETE /api/notes/:id - Delete note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
  // Soft delete or hard delete
});
```

#### Folders API

```javascript
// GET /api/folders - Get folder tree
app.get('/api/folders', authenticateToken, async (req, res) => {
  // Returns hierarchical folder structure
});

// POST /api/folders - Create folder
app.post('/api/folders', authenticateToken, async (req, res) => {
  const { name, parentId } = req.body;
  // Creates folder and returns ID
});

// PUT /api/folders/:id - Rename folder
app.put('/api/folders/:id', authenticateToken, async (req, res) => {
  const { name } = req.body;
  // Updates folder name
});

// DELETE /api/folders/:id - Delete folder
app.delete('/api/folders/:id', authenticateToken, async (req, res) => {
  // Deletes folder and moves notes to parent or root
});
```

#### Search API

```javascript
// GET /api/search - Full-text search
app.get('/api/search', authenticateToken, async (req, res) => {
  const { q, limit = 20 } = req.query;
  // Returns ranked search results with highlights
});

// GET /api/tags - Get all tags
app.get('/api/tags', authenticateToken, async (req, res) => {
  // Returns list of all tags with usage count
});
```

#### Integration API

```javascript
// POST /api/notes/from-challenge - Create note from challenge
app.post('/api/notes/from-challenge', authenticateToken, async (req, res) => {
  const { challengeId, challengeTitle, module } = req.body;
  // Creates pre-populated note linked to challenge
});

// GET /api/notes/related/:challengeId - Get notes for challenge
app.get('/api/notes/related/:challengeId', authenticateToken, async (req, res) => {
  // Returns notes linked to specific challenge
});
```

## Data Models

### Database Schema

```sql
-- Notes table
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
    tags TEXT[] DEFAULT '{}',
    challenge_id TEXT,  -- Link to arcade challenge
    challenge_module TEXT,  -- css-odyssey, logic-lab, etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP WITH TIME ZONE,  -- Soft delete
    
    -- Full-text search
    search_vector tsvector GENERATED ALWAYS AS (
        to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, ''))
    ) STORED
);

-- Folders table
CREATE TABLE folders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(user_id, parent_id, name)  -- Prevent duplicate names in same folder
);

-- Indexes for performance
CREATE INDEX idx_notes_user_id ON notes(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_folder_id ON notes(folder_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_notes_tags ON notes USING GIN(tags);
CREATE INDEX idx_notes_search ON notes USING GIN(search_vector);
CREATE INDEX idx_notes_challenge ON notes(challenge_id) WHERE challenge_id IS NOT NULL;
CREATE INDEX idx_folders_user_id ON folders(user_id);
CREATE INDEX idx_folders_parent_id ON folders(parent_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_notes_updated_at 
    BEFORE UPDATE ON notes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

### TypeScript Interfaces

```typescript
interface Note {
  id: string;
  userId: string;
  title: string;
  content: string;
  folderId: string | null;
  tags: string[];
  challengeId?: string;
  challengeModule?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

interface Folder {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  createdAt: string;
  children?: Folder[];  // Populated on frontend
  noteCount?: number;   // Computed
}

interface SearchResult {
  note: Note;
  score: number;
  highlights: {
    title?: string;
    content?: string;
  };
}

interface NoteMetadata {
  totalNotes: number;
  totalFolders: number;
  tags: Array<{ name: string; count: number }>;
  recentNotes: Note[];
}
```

## Error Handling

### Frontend Error Handling

```javascript
// Custom error boundary for CodeVault
class CodeVaultErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('CodeVault Error:', error, errorInfo);
    toast.error('Something went wrong. Please refresh the page.');
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// API error handling
const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error
    const message = error.response.data?.error || 'Server error';
    toast.error(message);
  } else if (error.request) {
    // No response received
    toast.error('Network error. Please check your connection.');
  } else {
    // Request setup error
    toast.error('An unexpected error occurred.');
  }
};
```

### Backend Error Handling

```javascript
// Validation middleware
const validateNote = (req, res, next) => {
  const { title, content } = req.body;
  
  if (!title || title.trim().length === 0) {
    return res.status(400).json({ error: 'Title is required' });
  }
  
  if (title.length > 200) {
    return res.status(400).json({ error: 'Title too long (max 200 characters)' });
  }
  
  if (content && content.length > 1000000) {
    return res.status(400).json({ error: 'Content too large (max 1MB)' });
  }
  
  next();
};

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ error: err.message });
  }
  
  if (err.code === '23505') {  // PostgreSQL unique violation
    return res.status(409).json({ error: 'Resource already exists' });
  }
  
  res.status(500).json({ error: 'Internal server error' });
});
```

### Graceful Degradation

1. **Offline Support**: Cache notes in localStorage when offline
2. **Auto-save Recovery**: Store drafts in localStorage to prevent data loss
3. **Search Fallback**: Use client-side search if server search fails
4. **Memory Fallback**: Support JSON file storage if PostgreSQL is unavailable

## Testing Strategy

### Why Property-Based Testing Does NOT Apply

CodeVault is primarily a UI-heavy feature with database operations, real-time interactions, and external integrations. The system involves:

- **UI Rendering**: Markdown editor, preview panes, folder trees
- **Database CRUD**: Simple create, read, update, delete operations
- **File I/O**: Export and import functionality
- **Real-time Sync**: WebSocket-based synchronization
- **External Integration**: Links to arcade challenges

These characteristics make property-based testing inappropriate. Instead, we use:

### Unit Testing Strategy

**Frontend Unit Tests** (using React Testing Library + Vitest):

1. **Component Rendering Tests**
   - Verify components render without crashing
   - Test conditional rendering based on props
   - Validate accessibility attributes

2. **User Interaction Tests**
   - Test button clicks, form submissions
   - Verify keyboard shortcuts (Ctrl+K for search)
   - Test drag-and-drop for folder organization

3. **State Management Tests**
   - Test note creation, editing, deletion
   - Verify folder selection and navigation
   - Test search filtering logic

4. **Markdown Parsing Tests**
   - Verify code block syntax highlighting
   - Test table rendering
   - Validate link parsing

**Backend Unit Tests** (using Jest):

1. **API Endpoint Tests**
   - Test CRUD operations for notes and folders
   - Verify authentication middleware
   - Test input validation

2. **Database Query Tests**
   - Test note retrieval with filters
   - Verify full-text search functionality
   - Test folder hierarchy queries

3. **Business Logic Tests**
   - Test auto-save logic
   - Verify tag extraction from content
   - Test soft delete functionality

### Integration Testing Strategy

1. **End-to-End User Flows**
   - Create note → Edit → Save → Search → Find
   - Create folder → Move note → Verify location
   - Link note to challenge → Verify in arcade

2. **Database Integration**
   - Test PostgreSQL connection and queries
   - Verify transaction handling
   - Test concurrent updates

3. **API Integration**
   - Test frontend-backend communication
   - Verify error handling across layers
   - Test authentication flow

4. **Search Integration**
   - Test full-text search with PostgreSQL
   - Verify search result ranking
   - Test tag-based filtering

### Manual Testing Checklist

- [ ] Create, edit, and delete notes
- [ ] Organize notes in folders
- [ ] Search notes with various queries
- [ ] Test auto-save functionality
- [ ] Verify markdown rendering
- [ ] Test code syntax highlighting
- [ ] Create notes from arcade challenges
- [ ] Test keyboard shortcuts
- [ ] Verify responsive design
- [ ] Test with large notes (>10,000 words)
- [ ] Test with many notes (>100)
- [ ] Verify performance with complex searches

### Performance Testing

1. **Load Testing**
   - Test with 1000+ notes per user
   - Measure search response time
   - Test concurrent user operations

2. **Frontend Performance**
   - Measure initial load time
   - Test editor responsiveness
   - Verify smooth scrolling with large notes

3. **Database Performance**
   - Test query performance with indexes
   - Verify full-text search speed
   - Test folder tree retrieval

### Test Coverage Goals

- **Frontend**: 70% code coverage minimum
- **Backend**: 80% code coverage minimum
- **Critical Paths**: 100% coverage (auth, CRUD, search)

### Testing Tools

- **Frontend**: Vitest, React Testing Library, @testing-library/user-event
- **Backend**: Jest, Supertest
- **E2E**: Playwright (optional for critical flows)
- **Performance**: Lighthouse, Chrome DevTools

## Implementation Notes

### Phase 1 MVP Features

1. **Core Note Management** (Week 1)
   - Database schema and migrations
   - Basic CRUD API endpoints
   - Note editor with Monaco
   - Markdown preview

2. **Organization System** (Week 2)
   - Folder creation and management
   - Drag-and-drop organization
   - Tag parsing and display
   - Folder tree navigation

3. **Search Functionality** (Week 3)
   - Full-text search implementation
   - Quick search modal (Ctrl+K)
   - Search result highlighting
   - Tag filtering

4. **Integration & Polish** (Week 4)
   - Arcade challenge integration
   - Auto-save implementation
   - Error handling and validation
   - UI polish and animations

### Future Enhancements (Phase 2)

1. **Bidirectional Linking**
   - [[wikilink]] syntax parsing
   - Backlink tracking
   - Link suggestions
   - Broken link detection

2. **Knowledge Graph**
   - D3.js or Cytoscape.js visualization
   - Interactive node exploration
   - Clustering algorithms
   - Export graph as image

3. **Advanced Export**
   - PDF generation with styling
   - HTML export with assets
   - Bulk export with folder structure
   - Import from Markdown files

4. **Collaboration**
   - Real-time collaborative editing
   - Note sharing with permissions
   - Comments and annotations
   - Version history

### Security Considerations

1. **Authentication**: All API endpoints require JWT token
2. **Authorization**: Users can only access their own notes
3. **Input Sanitization**: Validate and sanitize all user input
4. **XSS Prevention**: Use DOMPurify for markdown HTML output
5. **SQL Injection**: Use parameterized queries exclusively
6. **Rate Limiting**: Implement rate limits on API endpoints

### Performance Optimizations

1. **Lazy Loading**: Load notes on-demand, not all at once
2. **Debounced Search**: Debounce search input to reduce API calls
3. **Memoization**: Use React.memo and useMemo for expensive renders
4. **Database Indexes**: Proper indexing for fast queries
5. **Pagination**: Implement pagination for large note lists
6. **Caching**: Cache frequently accessed notes in memory

### Accessibility

1. **Keyboard Navigation**: Full keyboard support for all features
2. **Screen Reader**: Proper ARIA labels and semantic HTML
3. **Focus Management**: Logical focus order and visible focus indicators
4. **Color Contrast**: WCAG AA compliant color contrast ratios
5. **Alternative Text**: Descriptive labels for all interactive elements

## Conclusion

CodeVault provides a comprehensive note-taking solution integrated seamlessly into the BrightCode platform. The MVP focuses on core functionality with a clear path for future enhancements. The architecture is designed for scalability, maintainability, and excellent user experience.

The system leverages existing BrightCode infrastructure (authentication, database, styling) while introducing new capabilities that enhance the learning experience. By connecting notes to arcade challenges and learning modules, CodeVault becomes an essential tool for developers to document and organize their coding journey.
