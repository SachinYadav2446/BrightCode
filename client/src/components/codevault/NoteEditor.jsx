import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Eye,
  Edit3,
  X,
  Check,
  RefreshCw,
  AlertCircle,
  Tag as TagIcon,
  Trash2,
  ArrowLeft,
  Download,
  Share2
} from 'lucide-react';
import html2pdf from 'html2pdf.js';
import TurndownService from 'turndown';
import RichEditor from './RichEditor';
import MarkdownPreview from './MarkdownPreview';
import { updateNote, deleteNote } from '../../services/notesService';
import toast from 'react-hot-toast';
import './NoteEditor.css';

const NoteEditor = ({ note, onNoteUpdate, onClose, onNoteDelete }) => {
  const [title, setTitle] = useState(note?.title || '');
  const [content, setContent] = useState(note?.content || '');
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const saveTimeoutRef = useRef(null);

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content || '');
      setSaveStatus('saved');
    }
  }, [note?.id]);

  const handleExportPDF = useCallback(() => {
    if (!content) return toast.error('Nothing to export');
    toast.loading('Generating PDF...', { id: 'pdf-export' });
    const element = document.createElement('div');
    element.innerHTML = `<h1>${title || 'Untitled'}</h1>` + content;
    element.className = 'rich-editor-content'; // Apply some styling
    element.style.padding = '20px';
    element.style.color = 'black'; // Force black text for PDF
    element.style.background = 'white';

    const opt = {
      margin: 10,
      filename: `${title || 'note'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save().then(() => {
      toast.success('PDF Downloaded!', { id: 'pdf-export' });
    }).catch(() => {
      toast.error('Failed to generate PDF', { id: 'pdf-export' });
    });
  }, [title, content]);

  const handleExportMD = useCallback(() => {
    if (!content) return toast.error('Nothing to export');
    const turndownService = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
    const markdown = `# ${title || 'Untitled'}\n\n` + turndownService.turndown(content);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'note'}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown Downloaded!');
  }, [title, content]);

  // Listen for command palette events
  useEffect(() => {
    const onPdf = (e) => { if (e.detail.noteId === note?.id) handleExportPDF(); };
    const onMd = (e) => { if (e.detail.noteId === note?.id) handleExportMD(); };
    document.addEventListener('export-note-pdf', onPdf);
    document.addEventListener('export-note-md', onMd);
    return () => {
      document.removeEventListener('export-note-pdf', onPdf);
      document.removeEventListener('export-note-md', onMd);
    };
  }, [note?.id, handleExportPDF, handleExportMD]);

  // Auto-save on content changes
  useEffect(() => {
    if (!note) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    if (title === note.title && content === note.content) {
      return;
    }

    setSaveStatus('saving');

    saveTimeoutRef.current = setTimeout(async () => {
      try {
        const updatedNote = await updateNote(note.id, { title, content });
        setSaveStatus('saved');
        if (onNoteUpdate) onNoteUpdate(updatedNote);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setSaveStatus('error');
        toast.error('Failed to save note');
      }
    }, 1500);

    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
  }, [title, content, note]);

  const handleDelete = async () => {
    if (!window.confirm(`Delete note "${note.title}"? This action cannot be undone.`)) return;
    try {
      await deleteNote(note.id);
      toast.success('Note deleted');
      if (onNoteDelete) onNoteDelete(note.id);
      if (onClose) onClose();
    } catch (error) {
      toast.error('Failed to delete note');
    }
  };

  if (!note) {
    return (
      <div className="note-editor-empty">
        <p>No note selected</p>
      </div>
    );
  }

  return (
    <div className="note-editor-container">
      <div className="editor-header-compact">
        <div className="editor-header-top">
          {onClose && (
            <button className="btn-icon-back" onClick={onClose} title="Back to Vault">
              <ArrowLeft size={18} />
            </button>
          )}

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="editor-title-input compact-title"
            placeholder="Untitled Note"
          />

          <div className="editor-actions-inline">
            <div className="save-status">
              {saveStatus === 'saving' && (
                <span className="status-saving">
                  <RefreshCw size={10} className="spin" style={{ marginRight: 4 }} />
                  Saving...
                </span>
              )}
              {saveStatus === 'saved' && (
                <span className="status-saved">
                  <Check size={10} style={{ marginRight: 4 }} />
                  Saved
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="status-error">
                  <AlertCircle size={10} style={{ marginRight: 4 }} />
                  Error
                </span>
              )}
            </div>

            <div className="action-divider"></div>

            <button className="btn-action-icon" onClick={handleExportPDF} title="Export to PDF">
              <Download size={13} /> PDF
            </button>
            <button className="btn-action-icon" onClick={handleExportMD} title="Export to Markdown">
              <Download size={13} /> MD
            </button>
            <button className="btn-delete-note" onClick={handleDelete} title="Delete Note">
              <Trash2 size={13} />
            </button>
          </div>
        </div>
      </div>

      <div
        className="editor-content"
        onKeyDown={(e) => e.stopPropagation()}
      >
        <RichEditor
          content={content}
          onChange={setContent}
          editable={true}
        />
      </div>
    </div>
  );
};

export default NoteEditor;
