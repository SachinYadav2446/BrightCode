import { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { 
  Eye, 
  Edit3, 
  X, 
  Check, 
  RefreshCw, 
  AlertCircle,
  Tag as TagIcon,
  Trash2,
  ArrowLeft
} from 'lucide-react';
import MarkdownPreview from './MarkdownPreview';
import { updateNote, deleteNote } from '../../services/notesService';
import toast from 'react-hot-toast';
import './NoteEditor.css';

const NoteEditor = ({ note, onNoteUpdate, onClose, onNoteDelete }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [tags, setTags] = useState(note?.tags || []);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [showPreview, setShowPreview] = useState(false);
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags || []);
      setSaveStatus('saved');
    }
  }, [note?.id]);

  useEffect(() => {
    if (!note) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (title === note.title && content === note.content && JSON.stringify(tags) === JSON.stringify(note.tags)) {
      return;
    }

    setSaveStatus('saving');

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const updatedNote = await updateNote(note.id, {
          title,
          content,
          tags
        });
        setSaveStatus('saved');
        if (onNoteUpdate) {
          onNoteUpdate(updatedNote);
        }
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('error');
        toast.error('Failed to save record');
      }
    }, 2000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [title, content, tags, note]);

  const handleEditorChange = (value) => {
    setContent(value || '');
  };

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      const newTag = e.target.value.trim().replace(/^#/, '');
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      e.target.value = '';
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete note "${note.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteNote(note.id);
      toast.success('Note deleted');
      if (onNoteDelete) {
        onNoteDelete(note.id);
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    }
  };

  if (!note) {
    return (
      <div className="note-editor-empty">
        <p>No transmission selected</p>
      </div>
    );
  }

  return (
    <div className="note-editor-container">
      <div className="editor-header">
        {onClose && (
          <button className="btn-back-to-vault" onClick={onClose} title="Back to Vault">
            <ArrowLeft size={18} />
            <span>Back to Vault</span>
          </button>
        )}

        <div className="editor-actions">
          <button
            className={`btn-toggle-preview ${showPreview ? 'active' : ''}`}
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <Edit3 size={12} /> : <Eye size={12} />}
            <span>{showPreview ? 'Edit' : 'Preview'}</span>
          </button>
          <button 
            className="btn-delete-note" 
            onClick={handleDelete}
            title="Delete Note"
          >
            <Trash2 size={12} />
          </button>
        </div>

        <div className="editor-title-section">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="editor-title-input"
            placeholder="Record Designation..."
          />
          <div className="save-status">
            {saveStatus === 'saving' && (
              <span className="status-saving">
                <RefreshCw size={9} className="spin" style={{marginRight: 4}} />
                Encrypting...
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="status-saved">
                <Check size={9} style={{marginRight: 4}} />
                Secured
              </span>
            )}
            {saveStatus === 'error' && (
              <span className="status-error">
                <AlertCircle size={9} style={{marginRight: 4}} />
                Sync Failure
              </span>
            )}
          </div>
        </div>

        <div className="editor-tags">
          <TagIcon size={12} color="var(--cv-text-muted)" style={{marginRight: 2}} />
          {tags.map(tag => (
            <span key={tag} className="tag-chip">
              #{tag}
              <button onClick={() => handleRemoveTag(tag)} className="tag-remove">
                <X size={9} />
              </button>
            </span>
          ))}
          <input
            type="text"
            placeholder="Add classification..."
            onKeyDown={handleAddTag}
            className="tag-input"
          />
        </div>
      </div>

      <div 
        className="editor-content"
        onKeyDown={(e) => {
          // 'Bubble Shield': Stops the event from reaching global listeners/extensions
          // if they are listening on the bubble phase.
          e.stopPropagation();
        }}
      >
        {!showPreview ? (
          <Editor
            height="100%"
            defaultLanguage="markdown"
            value={content}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              lineNumbers: 'on',
              wordWrap: 'on',
              scrollBeyondLastLine: false,
              automaticLayout: true,
              padding: { top: 24, bottom: 24 },
              fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
              cursorSmoothCaretAnimation: "on",
              smoothScrolling: true
            }}
          />
        ) : (
          <MarkdownPreview content={content} />
        )}
      </div>
    </div>
  );
};

export default NoteEditor;
