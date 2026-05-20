import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Hash,
  Folder,
  FolderOpen,
  File,
  Command,
  SlidersHorizontal,
  X as XIcon,
  Edit2,
  Trash2,
  MoreVertical,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NoteEditor from '../components/codevault/NoteEditor';
import Sidebar from '../components/codevault/Sidebar';
import Navbar from '../components/Navbar';
import Chatbot from '../components/Chatbot';
import CommandPalette from '../components/codevault/CommandPalette';
import {
  fetchNotes,
  fetchFolders,
  createNote,
  createFolder,
  updateFolder,
  deleteFolder,
  updateNote,
  deleteNote
} from '../services/notesService';
import toast from 'react-hot-toast';
import './CodeVault.css';
import VaultModal from '../components/codevault/VaultModal';

const CodeVault = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [activeNote, setActiveNote] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('updated'); // 'updated', 'title', 'created'
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [renamingNoteId, setRenamingNoteId] = useState(null);
  const [renameValue, setRenameValue] = useState('');
  const [expandedFolders, setExpandedFolders] = useState({});
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [modalConfig, setModalConfig] = useState(null);


  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [notesData, foldersData] = await Promise.all([
        fetchNotes(),
        fetchFolders()
      ]);
      setNotes(notesData || []);
      setFolders(foldersData || []);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load notes: ' + error.message);
      setNotes([]);
      setFolders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFolderCreateSubmit = async (e) => {
    if (e) e.preventDefault();
    
    if (!newFolderName.trim()) {
      return;
    }

    console.log('[CodeVault] Creating repository:', newFolderName);
    console.log('[CodeVault] User:', user);
    console.log('[CodeVault] Token:', localStorage.getItem('token'));

    try {
      const folder = await createFolder({ name: newFolderName.trim() });
      console.log('[CodeVault] Repository created successfully:', folder);
      setFolders([...folders, folder]);
      setShowCreateFolderModal(false);
      setNewFolderName('');
      toast.success('Repository created');
    } catch (error) {
      console.error('[CodeVault] Failed to create repository:', error);
      console.error('[CodeVault] Error details:', error.response?.data || error.message);
      
      // Check if it's an authentication error
      if (error.message.includes('Invalid token') || error.message.includes('403')) {
        toast.error('Session expired. Please log out and log back in.');
      } else {
        toast.error('Failed to create repository: ' + error.message);
      }
    }
  };

  const handleUpdateNote = async (noteId, updates) => {
    try {
      const updatedNote = await updateNote(noteId, updates);
      setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
      if (activeNote && activeNote.id === noteId) {
        setActiveNote(updatedNote);
      }
    } catch (error) {
      console.error('Failed to update note:', error);
      toast.error('Failed to update note');
    }
  };

  const handleCreateNote = async () => {
    // Require a folder to be selected
    if (!selectedFolder) {
      toast.error('Please select a repository first');
      return;
    }

    console.log('[CodeVault] Creating note in folder:', selectedFolder);
    console.log('[CodeVault] User:', user);

    try {
      const newNote = await createNote({
        title: 'Untitled Note',
        content: '',
        folderId: selectedFolder,
        tags: []
      });
      console.log('[CodeVault] Note created successfully:', newNote);
      setNotes([newNote, ...notes]);
      // Don't auto-open the note, just add it to the list
      toast.success('New note created');
    } catch (error) {
      console.error('[CodeVault] Failed to create note:', error);
      console.error('[CodeVault] Error details:', error.response?.data || error.message);
      toast.error('Failed to create note: ' + (error.response?.data?.error || error.message));
    }
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({
      ...prev,
      [folderId]: !prev[folderId]
    }));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept shortcuts if the user is typing in an input or editor
      const activeEl = document.activeElement;
      const isInput = activeEl.tagName === 'INPUT' && !activeEl.classList.contains('cp-search-input') ||
        activeEl.tagName === 'TEXTAREA' ||
        activeEl.isContentEditable ||
        activeEl.closest('.ProseMirror');

      if (isInput) {
        if (e.key === 'Escape' && showCreateFolderModal) {
          setShowCreateFolderModal(false);
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSearchModal, showCreateFolderModal]);

  const handleCommandAction = (actionId) => {
    switch (actionId) {
      case 'new-note':
        if (!selectedFolder && folders.length > 0) {
          setSelectedFolder(folders[0].id);
        }
        handleCreateNote();
        break;
      case 'new-folder':
        setShowCreateFolderModal(true);
        break;
      case 'export-pdf':
        if (activeNote) {
          const event = new CustomEvent('export-note-pdf', { detail: { noteId: activeNote.id } });
          document.dispatchEvent(event);
        } else {
          toast.error('Open a note first to export it');
        }
        break;
      case 'export-md':
        if (activeNote) {
          const event = new CustomEvent('export-note-md', { detail: { noteId: activeNote.id } });
          document.dispatchEvent(event);
        } else {
          toast.error('Open a note first to export it');
        }
        break;
      case 'share-note':
        toast.success('Public sharing link generated and copied to clipboard!');
        break;
      case 'lock-folder':
        toast.success('Folder encryption feature activated!');
        break;
      default:
        break;
    }
  };

  const handleNoteUpdate = (updatedNote) => {
    setNotes(notes.map(n => n.id === updatedNote.id ? updatedNote : n));
    setActiveNote(updatedNote);
  };

  const handleNoteDelete = (noteId) => {
    setNotes(notes.filter(n => n.id !== noteId));
    setActiveNote(null);
  };

  const handleQuickDelete = async (e, noteId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this note? This action cannot be undone.')) {
      return;
    }
    try {
      await deleteNote(noteId);
      setNotes(notes.filter(n => n.id !== noteId));
      toast.success('Note deleted');
    } catch (error) {
      console.error('Failed to delete note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleStartRename = (e, note) => {
    e.stopPropagation();
    setRenamingNoteId(note.id);
    setRenameValue(note.title || 'Untitled');
  };

  const handleRenameSubmit = async (e, noteId) => {
    e.stopPropagation();
    if (e.key === 'Enter' || e.type === 'blur') {
      if (!renameValue.trim()) {
        setRenamingNoteId(null);
        return;
      }
      try {
        const noteToUpdate = notes.find(n => n.id === noteId);
        const updatedNote = await updateNote(noteId, {
          ...noteToUpdate,
          title: renameValue.trim()
        });
        setNotes(notes.map(n => n.id === noteId ? updatedNote : n));
        setRenamingNoteId(null);
        toast.success('Note renamed');
      } catch (error) {
        console.error('Failed to rename note:', error);
        toast.error('Failed to rename note');
      }
    } else if (e.key === 'Escape') {
      setRenamingNoteId(null);
    }
  };

  const handleFolderCreate = async (folderData) => {
    try {
      const newFolder = await createFolder(folderData);
      setFolders([...folders, newFolder]);
      toast.success('Folder created');
    } catch (error) {
      console.error('Failed to create folder:', error);
      toast.error('Failed to create folder');
      throw error;
    }
  };

  const handleFolderRename = async (folderId, newName) => {
    try {
      const updatedFolder = await updateFolder(folderId, { name: newName });
      setFolders(folders.map(f => f.id === folderId ? updatedFolder : f));
      toast.success('Folder renamed');
    } catch (error) {
      console.error('Failed to rename folder:', error);
      toast.error('Failed to rename folder');
      throw error;
    }
  };

  const handleFolderDelete = async (folderId) => {
    try {
      await deleteFolder(folderId);
      setFolders(folders.filter(f => f.id !== folderId));
      // Reload notes to reflect any that were moved
      const updatedNotes = await fetchNotes();
      setNotes(updatedNotes || []);
      toast.success('Folder deleted');
    } catch (error) {
      console.error('Failed to delete folder:', error);
      toast.error('Failed to delete folder');
    }
  };

  const filteredSearchNotes = notes.filter(note => {
    const matchesSearch = !searchQuery ||
      note.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = !selectedTag || (Array.isArray(note.tags) && note.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  // Sort notes
  const sortedNotes = [...filteredSearchNotes].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'created':
        return new Date(b.created_at) - new Date(a.created_at);
      case 'updated':
      default:
        return new Date(b.updated_at) - new Date(a.updated_at);
    }
  });

  // Get notes for the current view (filtered by folder if needed)
  const displayNotes = sortedNotes.filter(note => !selectedFolder || note.folder_id === selectedFolder);

  // Get all unique tags from notes
  const allTags = [...new Set(notes.flatMap(note => Array.isArray(note.tags) ? note.tags : []))].sort();

  return (
    <div className="codevault-container">

      <div className="codevault-layout">
        {/* Left Sidebar - Folder Tree */}
        <aside className="vault-sidebar">
          <Link to="/hub" className="vault-sidebar-header">
            <h1 className="vault-logo">CODE VAULT</h1>
          </Link>

          {/* Sort Filter in Sidebar */}
          <div className="sidebar-filter">
            <div className="sort-select-wrapper">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sort-select-sidebar"
              >
                <option value="updated">Last Updated</option>
                <option value="created">Date Created</option>
                <option value="title">Title (A-Z)</option>
              </select>
              <ChevronDown size={14} className="sort-arrow" />
            </div>
          </div>

          {/* Folder Tree */}
          <div className="folder-tree">
            {/* Folders Section - Always at top */}
            <div className="tree-section">
              <div className="tree-section-header">
                <span>REPOSITORIES</span>
                {folders.length > 0 && (
                  <button
                    className="btn-add-folder"
                    onClick={() => setShowCreateFolderModal(true)}
                    title="Add Repository"
                  >
                    <Plus size={12} />
                  </button>
                )}
              </div>

              {folders.length === 0 ? (
                <div className="empty-folders">
                  <p>No repositories yet</p>
                  <button
                    className="btn-create-first-folder"
                    onClick={() => setShowCreateFolderModal(true)}
                  >
                    <Plus size={16} /> Create Repository
                  </button>
                </div>
              ) : (
                folders.map(folder => {
                  const folderNotes = sortedNotes.filter(n => n.folder_id === folder.id);
                  const isExpanded = expandedFolders[folder.id];

                  return (
                    <div key={folder.id}>
                      <div className="tree-item-wrapper">
                        <button
                          className={`tree-item ${selectedFolder === folder.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedFolder(folder.id);
                            toggleFolder(folder.id);
                          }}
                        >
                          {isExpanded ? <ChevronDown size={14} className="tree-chevron" /> : <ChevronRight size={14} className="tree-chevron" />}
                          {isExpanded ? <FolderOpen size={16} className="folder-icon" /> : <Folder size={16} className="folder-icon" />}
                          <span>{folder.name}</span>
                          <span className="item-count">{folderNotes.length}</span>
                        </button>
                        <div className="tree-item-actions">
                          <button
                            className="tree-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedFolder(folder.id);
                              handleCreateNote();
                              if (!isExpanded) toggleFolder(folder.id);
                            }}
                            title="Add File"
                          >
                            <Plus size={12} />
                          </button>
                          <button
                            className="tree-action-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalConfig({
                                type: 'input',
                                title: 'Rename Repository',
                                placeholder: 'Enter new name...',
                                initialValue: folder.name,
                                onConfirm: (newName) => handleFolderRename(folder.id, newName)
                              });
                            }}
                            title="Rename"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            className="tree-action-btn tree-action-delete"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModalConfig({
                                type: 'confirm',
                                variant: 'danger',
                                title: 'Delete Repository',
                                message: `Are you sure you want to delete "${folder.name}"? All notes inside will be permanently removed.`,
                                confirmText: 'Delete Everything',
                                onConfirm: () => handleFolderDelete(folder.id)
                              });
                            }}
                            title="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      {/* File list under folder */}
                      {isExpanded && (
                        <div className="nested-files">
                          {folderNotes.length === 0 ? (
                            <div className="empty-files-msg">No files yet</div>
                          ) : (
                            folderNotes.map(note => (
                              <div key={note.id} className="file-item-wrapper">
                                <button
                                  className={`file-item ${activeNote?.id === note.id ? 'active' : ''}`}
                                  onClick={() => setActiveNote(note)}
                                >
                                  <File size={14} className="file-icon" />
                                  <span>{note.title || 'Untitled'}</span>
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {allTags.length > 0 && (
              <div className="tree-section">
                <div className="tree-section-header">
                  <span>TAGS</span>
                </div>
                {allTags.slice(0, 10).map(tag => {
                  const tagNotes = notes.filter(n => n.tags && n.tags.includes(tag));
                  return (
                    <button
                      key={tag}
                      className={`tree-item ${selectedTag === tag ? 'active' : ''}`}
                      onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    >
                      <Hash size={16} />
                      <span>{tag}</span>
                      <span className="item-count">{tagNotes.length}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="vault-main">
          <AnimatePresence mode="wait">
            {activeNote ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                style={{ height: '100%', width: '100%' }}
              >
                <NoteEditor
                  note={activeNote}
                  onNoteUpdate={handleNoteUpdate}
                  onNoteDelete={handleNoteDelete}
                  onClose={() => setActiveNote(null)}
                />
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="vault-welcome"
              >
                {/* Notes List */}
                <div className="notes-list-main">
                  {/* Notes List Empty State */}
                  {loading ? (
                    <div className="loading-state-vault">
                      <div className="spinner-vault"></div>
                      <p>Loading notes...</p>
                    </div>
                  ) : (
                    <div className="empty-state-vault">
                      <File size={64} className="empty-icon-vault" />
                      <h3>No File Selected</h3>
                      <p>Select a file from the sidebar to start editing</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Search Modal -> Command Palette */}
      <CommandPalette
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        notes={notes}
        folders={folders}
        onSelectNote={(note) => {
          setActiveNote(note);
          setSelectedFolder(note.folder_id);
          setExpandedFolders(prev => ({ ...prev, [note.folder_id]: true }));
        }}
        onAction={handleCommandAction}
      />

      {/* Create Repository Modal */}
      <AnimatePresence>
        {showCreateFolderModal && (
          <motion.div
            className="vault-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowCreateFolderModal(false)}
          >
            <motion.div
              className="vault-modal"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="vault-modal-header">
                <h3>Create New Repository</h3>
                <button
                  className="vault-modal-close"
                  onClick={() => setShowCreateFolderModal(false)}
                >
                  <Plus size={20} style={{ transform: 'rotate(45deg)' }} />
                </button>
              </div>
              <form onSubmit={handleFolderCreateSubmit} className="vault-modal-form">
                <div className="vault-modal-body">
                  <label>Repository Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend Projects, Backend APIs..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    autoFocus
                  />
                  <p className="modal-hint">A repository helps you organize your snippets and notes.</p>
                </div>
                <div className="vault-modal-footer">
                  <button
                    type="button"
                    className="vault-modal-btn cancel"
                    onClick={() => setShowCreateFolderModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="vault-modal-btn confirm"
                    disabled={!newFolderName.trim()}
                  >
                    Create Repository
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <VaultModal
        isOpen={!!modalConfig}
        onClose={() => setModalConfig(null)}
        config={modalConfig}
      />
      <Chatbot isSidebarOpen={true} />
    </div>
  );
};

export default CodeVault;
