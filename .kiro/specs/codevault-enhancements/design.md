# CodeVault Enhancements - Design Document

## Architecture Overview

### Current Architecture
```
Client (React)
├── CodeVault.jsx (Main container)
├── NoteEditor.jsx (Monaco editor + preview)
├── Sidebar.jsx (Folder tree)
└── Services
    └── notesService.js (API calls)

Server (Express + PostgreSQL)
├── Notes API
├── Folders API
└── Search API
```

### Enhanced Architecture
```
Client (React)
├── CodeVault.jsx (Main container + state management)
├── NoteEditor.jsx (Enhanced editor)
│   ├── RichTextToolbar.jsx (NEW)
│   ├── SplitView.jsx (NEW)
│   └── StatsBar.jsx (NEW)
├── Sidebar.jsx (Enhanced sidebar)
│   ├── FavoritesSection.jsx (NEW)
│   ├── RecentSection.jsx (NEW)
│   └── TrashSection.jsx (NEW)
├── Modals
│   ├── KeyboardShortcutsModal.jsx (NEW)
│   ├── ExportModal.jsx (NEW)
│   └── TemplatePickerModal.jsx (NEW)
└── Services
    ├── notesService.js (Enhanced)
    ├── exportService.js (NEW)
    └── templateService.js (NEW)

Server (Express + PostgreSQL)
├── Notes API (Enhanced)
├── Folders API
├── Favorites API (NEW)
├── Trash API (NEW)
├── Export API (NEW)
└── Templates API (NEW)
```

---

## Database Design

### Enhanced Notes Table
```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY,
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    folder_id UUID,
    tags TEXT[],
    
    -- NEW COLUMNS
    is_favorite BOOLEAN DEFAULT FALSE,
    last_opened_at TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    word_count INTEGER DEFAULT 0,
    
    -- Existing
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP  -- Soft delete
);
```

### New Tables

#### Versions Table
```sql
CREATE TABLE note_versions (
    id UUID PRIMARY KEY,
    note_id UUID REFERENCES notes(id),
    content TEXT NOT NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMP,
    created_by TEXT
);
```

#### Templates Table
```sql
CREATE TABLE templates (
    id UUID PRIMARY KEY,
    user_id TEXT,  -- NULL for system templates
    name TEXT NOT NULL,
    description TEXT,
    content TEXT NOT NULL,
    category TEXT,  -- meeting, journal, project, etc.
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP
);
```

#### Attachments Table
```sql
CREATE TABLE attachments (
    id UUID PRIMARY KEY,
    note_id UUID REFERENCES notes(id),
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    mime_type TEXT,
    uploaded_at TIMESTAMP
);
```

---

## Component Design

### 1. Enhanced Sidebar

**Layout**:
```
┌─────────────────────────┐
│ CODE VAULT              │
├─────────────────────────┤
│ [Search...]             │
├─────────────────────────┤
│ ⭐ FAVORITES (3)        │
│   ├─ Important Note     │
│   └─ Project Plan       │
├─────────────────────────┤
│ 🕐 RECENT (5)           │
│   ├─ Meeting Notes      │
│   └─ Daily Journal      │
├─────────────────────────┤
│ 📁 REPOSITORIES         │
│   ├─ Work [+][✏️][🗑️]   │
│   │   ├─ file1.md       │
│   │   └─ file2.md       │
│   └─ Personal           │
├─────────────────────────┤
│ 🏷️ TAGS                 │
│   ├─ #important (5)     │
│   └─ #work (12)         │
├─────────────────────────┤
│ 🗑️ TRASH (2)            │
└─────────────────────────┘
```

**State Management**:
```javascript
const [favorites, setFavorites] = useState([]);
const [recentNotes, setRecentNotes] = useState([]);
const [trashedNotes, setTrashedNotes] = useState([]);
const [expandedSections, setExpandedSections] = useState({
  favorites: true,
  recent: true,
  repositories: true,
  tags: false,
  trash: false
});
```

---

### 2. Rich Text Toolbar

**Layout**:
```
┌────────────────────────────────────────────────────────┐
│ [B] [I] [S] [</>] | [H▼] | [•] [1.] [☐] | [🔗] [📷] │
└────────────────────────────────────────────────────────┘
```

**Buttons**:
- **B** - Bold (`Ctrl+B`)
- **I** - Italic (`Ctrl+I`)
- **S** - Strikethrough
- **</>** - Inline code
- **H▼** - Headers dropdown (H1-H6)
- **•** - Bullet list
- **1.** - Numbered list
- **☐** - Checkbox list
- **🔗** - Insert link
- **📷** - Insert image

**Implementation**:
```javascript
const RichTextToolbar = ({ editor, onFormat }) => {
  const applyFormat = (format) => {
    const selection = editor.getSelection();
    const text = editor.getModel().getValueInRange(selection);
    
    switch(format) {
      case 'bold':
        editor.executeEdits('', [{
          range: selection,
          text: `**${text}**`
        }]);
        break;
      // ... other formats
    }
  };
  
  return (
    <div className="rich-text-toolbar">
      <button onClick={() => applyFormat('bold')} title="Bold (Ctrl+B)">
        <Bold size={16} />
      </button>
      {/* ... other buttons */}
    </div>
  );
};
```

---

### 3. Split View

**Layout**:
```
┌──────────────────┬──────────────────┐
│                  │                  │
│   EDITOR         │    PREVIEW       │
│   (Monaco)       │    (Markdown)    │
│                  │                  │
│                  │                  │
└──────────────────┴──────────────────┘
```

**Implementation**:
```javascript
const [splitView, setSplitView] = useState(false);
const [splitRatio, setSplitRatio] = useState(50); // 50% each

return (
  <div className="editor-container">
    {splitView ? (
      <SplitPane
        split="vertical"
        defaultSize={`${splitRatio}%`}
        onChange={(size) => setSplitRatio(size)}
      >
        <MonacoEditor {...editorProps} />
        <MarkdownPreview content={content} />
      </SplitPane>
    ) : (
      showPreview ? 
        <MarkdownPreview content={content} /> :
        <MonacoEditor {...editorProps} />
    )}
  </div>
);
```

---

### 4. Stats Bar

**Layout**:
```
┌────────────────────────────────────────────────────────┐
│ 1,234 words | 6,789 characters | 5 min read | 45 lines│
└────────────────────────────────────────────────────────┘
```

**Implementation**:
```javascript
const StatsBar = ({ content }) => {
  const stats = useMemo(() => {
    const words = content.trim().split(/\s+/).length;
    const chars = content.length;
    const lines = content.split('\n').length;
    const readTime = Math.ceil(words / 200); // 200 wpm
    
    return { words, chars, lines, readTime };
  }, [content]);
  
  return (
    <div className="stats-bar">
      <span>{stats.words} words</span>
      <span>{stats.chars} characters</span>
      <span>{stats.readTime} min read</span>
      <span>{stats.lines} lines</span>
    </div>
  );
};
```

---

### 5. Keyboard Shortcuts Modal

**Layout**:
```
┌─────────────────────────────────────┐
│  Keyboard Shortcuts                 │
├─────────────────────────────────────┤
│  General                            │
│  Ctrl+K        Quick Search         │
│  Ctrl+N        New Note             │
│  Ctrl+/        Show Shortcuts       │
│                                     │
│  Editing                            │
│  Ctrl+B        Bold                 │
│  Ctrl+I        Italic               │
│  Ctrl+E        Toggle Preview       │
│                                     │
│  Navigation                         │
│  Esc           Close Modal          │
│  ↑/↓           Navigate Files       │
└─────────────────────────────────────┘
```

---

## API Design

### Favorites API

```javascript
// Toggle favorite
PATCH /api/notes/:id/favorite
Response: { id, is_favorite }

// Get favorites
GET /api/notes/favorites
Response: [{ id, title, ... }]
```

### Recent Notes API

```javascript
// Update last opened
PATCH /api/notes/:id/open
Body: { timestamp }
Response: { id, last_opened_at }

// Get recent
GET /api/notes/recent?limit=10
Response: [{ id, title, last_opened_at, ... }]
```

### Trash API

```javascript
// Get trash
GET /api/notes/trash
Response: [{ id, title, deleted_at, ... }]

// Restore note
POST /api/notes/:id/restore
Response: { id, deleted_at: null }

// Permanent delete
DELETE /api/notes/:id/permanent
Response: { success: true }
```

### Export API

```javascript
// Export note
POST /api/notes/:id/export
Body: { format: 'markdown' | 'pdf' | 'html' }
Response: { downloadUrl }

// Export repository
POST /api/folders/:id/export
Body: { format: 'zip' }
Response: { downloadUrl }
```

### Templates API

```javascript
// Get templates
GET /api/templates
Response: [{ id, name, description, category, ... }]

// Create from template
POST /api/notes/from-template
Body: { templateId, folderId }
Response: { id, title, content, ... }

// Save as template
POST /api/templates
Body: { name, description, content, category }
Response: { id, ... }
```

---

## UI/UX Design Principles

### 1. **Minimal & Clean**
- No clutter
- Icons over text where possible
- Subtle colors
- Consistent spacing

### 2. **Discoverable**
- Tooltips on all buttons
- Keyboard shortcuts in tooltips
- Help modal accessible
- Empty states guide users

### 3. **Responsive**
- Instant feedback
- Loading states
- Optimistic updates
- Smooth animations

### 4. **Accessible**
- Keyboard navigation
- ARIA labels
- Focus indicators
- Screen reader support

---

## Color Scheme

```css
:root {
  --cv-bg: #1a1a1a;
  --cv-sidebar-bg: #0f0f0f;
  --cv-surface: #222;
  --cv-border: #333;
  --cv-accent: #ef4444;  /* Red */
  --cv-accent-hover: #dc2626;
  --cv-text-primary: #fff;
  --cv-text-secondary: #ccc;
  --cv-text-muted: #888;
  
  /* NEW COLORS */
  --cv-favorite: #fbbf24;  /* Gold for favorites */
  --cv-success: #10b981;   /* Green for success */
  --cv-warning: #f59e0b;   /* Orange for warnings */
  --cv-info: #3b82f6;      /* Blue for info */
}
```

---

## Performance Optimizations

### 1. **Lazy Loading**
```javascript
// Load notes on demand
const [visibleNotes, setVisibleNotes] = useState([]);
const observer = useRef();

const lastNoteRef = useCallback(node => {
  if (observer.current) observer.current.disconnect();
  observer.current = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && hasMore) {
      loadMoreNotes();
    }
  });
  if (node) observer.current.observe(node);
}, [hasMore]);
```

### 2. **Debounced Search**
```javascript
const debouncedSearch = useMemo(
  () => debounce((query) => {
    performSearch(query);
  }, 300),
  []
);
```

### 3. **Memoization**
```javascript
const sortedNotes = useMemo(() => {
  return notes.sort((a, b) => {
    // sorting logic
  });
}, [notes, sortBy]);
```

### 4. **Virtual Scrolling**
```javascript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={notes.length}
  itemSize={50}
>
  {({ index, style }) => (
    <div style={style}>
      <NoteItem note={notes[index]} />
    </div>
  )}
</FixedSizeList>
```

---

## Error Handling

### User-Facing Errors
```javascript
try {
  await deleteNote(id);
  toast.success('Note deleted');
} catch (error) {
  if (error.status === 404) {
    toast.error('Note not found');
  } else if (error.status === 403) {
    toast.error('Permission denied');
  } else {
    toast.error('Failed to delete note');
  }
}
```

### Fallback UI
```javascript
<ErrorBoundary
  fallback={
    <div className="error-state">
      <AlertCircle size={48} />
      <h3>Something went wrong</h3>
      <button onClick={reload}>Reload</button>
    </div>
  }
>
  <CodeVault />
</ErrorBoundary>
```

---

## Testing Strategy

### Unit Tests
- Component rendering
- State management
- Utility functions
- API service methods

### Integration Tests
- User flows (create, edit, delete note)
- Search functionality
- Favorites/trash operations
- Export functionality

### E2E Tests
- Complete user journeys
- Cross-browser testing
- Performance testing
- Accessibility testing

---

## Deployment Strategy

### Phase 1: Quick Wins (Week 1-2)
- Trash bin
- Favorites
- Recent notes
- Rich text toolbar
- Stats bar

### Phase 2: Enhanced Editing (Week 3-4)
- Split view
- Keyboard shortcuts
- Export functionality
- Duplicate note
- Templates

### Phase 3: Advanced Features (Week 5-6)
- Note linking
- Advanced search
- Drag & drop
- Version history
- Attachments

### Phase 4: Collaboration (Week 7-8)
- Sharing
- Real-time collaboration
- Comments

---

## Success Criteria

### Performance
- Page load < 2s
- Search results < 500ms
- Note open < 300ms
- Auto-save < 100ms

### Quality
- Zero critical bugs
- < 5 minor bugs
- 90%+ test coverage
- Lighthouse score > 90

### User Experience
- User satisfaction > 4.5/5
- Feature adoption > 60%
- Retention increase > 30%
- Session time increase > 50%
