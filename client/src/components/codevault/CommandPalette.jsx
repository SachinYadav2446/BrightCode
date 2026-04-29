import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Command, Search, FileText, FolderOpen, Plus, Hash,
  ArrowRight, Clock, Trash2, Download, Share2, Lock
} from 'lucide-react';
import './CommandPalette.css';

const ACTIONS = [
  { id: 'new-note', label: 'New Note', icon: <Plus size={14} />, group: 'Actions', shortcut: 'N' },
  { id: 'new-folder', label: 'New Folder', icon: <FolderOpen size={14} />, group: 'Actions', shortcut: 'F' },
  { id: 'export-pdf', label: 'Export as PDF', icon: <Download size={14} />, group: 'Actions' },
  { id: 'export-md', label: 'Export as Markdown', icon: <Download size={14} />, group: 'Actions' },
  { id: 'share-note', label: 'Share Note (Read-only link)', icon: <Share2 size={14} />, group: 'Actions' },
  { id: 'lock-folder', label: 'Lock/Unlock Folder', icon: <Lock size={14} />, group: 'Actions' },
];

const CommandPalette = ({ isOpen, onClose, notes, folders, onSelectNote, onAction }) => {
  const [query, setQuery] = useState('');
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Strip HTML tags for preview text
  const stripHtml = (html) => html?.replace(/<[^>]*>/g, '') || '';

  const filteredNotes = query.trim()
    ? notes.filter(n =>
      n.title?.toLowerCase().includes(query.toLowerCase()) ||
      stripHtml(n.content)?.toLowerCase().includes(query.toLowerCase()) ||
      n.tags?.some(t => t.toLowerCase().includes(query.toLowerCase()))
    ).slice(0, 8)
    : notes.slice(0, 5);

  const filteredActions = ACTIONS.filter(a =>
    !query.trim() || a.label.toLowerCase().includes(query.toLowerCase())
  );

  const allItems = [
    ...filteredNotes.map(n => ({ type: 'note', data: n })),
    ...filteredActions.map(a => ({ type: 'action', data: a })),
  ];

  useEffect(() => { if (isOpen) { setQuery(''); setCursor(0); setTimeout(() => inputRef.current?.focus(), 50); } }, [isOpen]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor(c => Math.min(c + 1, allItems.length - 1)); }
    if (e.key === 'ArrowUp') { e.preventDefault(); setCursor(c => Math.max(c - 1, 0)); }
    if (e.key === 'Enter') {
      const item = allItems[cursor];
      if (!item) return;
      if (item.type === 'note') { onSelectNote(item.data); onClose(); }
      if (item.type === 'action') { onAction(item.data.id); onClose(); }
    }
    if (e.key === 'Escape') onClose();
  }, [allItems, cursor, onSelectNote, onAction, onClose]);

  useEffect(() => { setCursor(0); }, [query]);

  // Scroll cursor item into view
  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-idx="${cursor}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  const formatDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="cp-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="cp-modal"
            initial={{ scale: 0.94, y: -20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.94, y: -20, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search bar */}
            <div className="cp-search-bar">
              <Search size={18} className="cp-search-icon" />
              <input
                ref={inputRef}
                className="cp-search-input"
                placeholder="Search notes, run actions…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className="cp-esc-hint">ESC</span>
            </div>

            {/* Results */}
            <div className="cp-results" ref={listRef}>
              {allItems.length === 0 && (
                <div className="cp-empty">No results for "{query}"</div>
              )}

              {/* Notes section */}
              {filteredNotes.length > 0 && (
                <div className="cp-group">
                  <div className="cp-group-label"><FileText size={11} /> Notes</div>
                  {filteredNotes.map((note, i) => {
                    const idx = i;
                    const preview = stripHtml(note.content).slice(0, 80);
                    return (
                      <button
                        key={note.id}
                        data-idx={idx}
                        className={`cp-item ${cursor === idx ? 'cp-item-active' : ''}`}
                        onMouseEnter={() => setCursor(idx)}
                        onClick={() => { onSelectNote(note); onClose(); }}
                      >
                        <FileText size={14} className="cp-item-icon" />
                        <div className="cp-item-body">
                          <span className="cp-item-title">{note.title || 'Untitled'}</span>
                          {preview && <span className="cp-item-preview">{preview}</span>}
                        </div>
                        <div className="cp-item-meta">
                          {note.tags?.slice(0, 2).map(t => (
                            <span key={t} className="cp-tag">#{t}</span>
                          ))}
                          <span className="cp-date"><Clock size={10} /> {formatDate(note.updated_at)}</span>
                        </div>
                        <ArrowRight size={12} className="cp-item-arrow" />
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Actions section */}
              {filteredActions.length > 0 && (
                <div className="cp-group">
                  <div className="cp-group-label"><Command size={11} /> Actions</div>
                  {filteredActions.map((action, i) => {
                    const idx = filteredNotes.length + i;
                    return (
                      <button
                        key={action.id}
                        data-idx={idx}
                        className={`cp-item ${cursor === idx ? 'cp-item-active' : ''}`}
                        onMouseEnter={() => setCursor(idx)}
                        onClick={() => { onAction(action.id); onClose(); }}
                      >
                        <span className="cp-item-icon">{action.icon}</span>
                        <div className="cp-item-body">
                          <span className="cp-item-title">{action.label}</span>
                        </div>
                        {action.shortcut && (
                          <kbd className="cp-kbd">{action.shortcut}</kbd>
                        )}
                        <ArrowRight size={12} className="cp-item-arrow" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="cp-footer">
              <span><kbd>↑↓</kbd> Navigate</span>
              <span><kbd>Enter</kbd> Select</span>
              <span><kbd>Esc</kbd> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
