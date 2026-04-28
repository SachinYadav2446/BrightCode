import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Layers, FolderPlus } from 'lucide-react';
import FolderTree from './FolderTree';
import FolderModal from './FolderModal';
import './Sidebar.css';

const Sidebar = ({ 
  folders, 
  notes,
  selectedFolder, 
  onFolderSelect, 
  onCreateNote,
  onFolderCreate,
  onFolderRename,
  onFolderDelete
}) => {
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);

  const handleNewFolder = () => {
    setEditingFolder(null);
    setShowFolderModal(true);
  };

  const handleFolderModalSubmit = async (folderData) => {
    if (editingFolder) {
      await onFolderRename(editingFolder.id, folderData.name);
    } else {
      await onFolderCreate(folderData);
    }
    setShowFolderModal(false);
    setEditingFolder(null);
  };

  const handleFolderRename = (folder) => {
    setEditingFolder(folder);
    setShowFolderModal(true);
  };

  return (
    <>
      <aside className="cv-sidebar">
        <div className="cv-sidebar-header">
          <motion.h2 
            initial={{ x: -20, opacity: 0 }} 
            animate={{ x: 0, opacity: 1 }}
          >
            CODE VAULT
          </motion.h2>
          <button className="cv-btn-new-note" onClick={onCreateNote}>
            <Plus size={18} />
            <span>New Note</span>
          </button>
        </div>
        
        <div className="cv-sidebar-content">
          <div className="cv-sidebar-section">
            <h3>Quick Stats</h3>
            <div className="cv-stats-grid">
              <motion.div className="cv-stat-item" whileHover={{ scale: 1.05 }}>
                <span className="cv-stat-value">{notes.length}</span>
                <span className="cv-stat-label">Notes</span>
              </motion.div>
              <motion.div className="cv-stat-item" whileHover={{ scale: 1.05 }}>
                <span className="cv-stat-value">{folders.length}</span>
                <span className="cv-stat-label">Folders</span>
              </motion.div>
            </div>
          </div>
          
          <div className="cv-sidebar-section">
            <div className="cv-section-header">
              <h3>Directory</h3>
              <button 
                className="cv-btn-icon" 
                onClick={handleNewFolder}
                title="New Folder"
              >
                <FolderPlus size={16} />
              </button>
            </div>
            <div className="cv-folder-list">
              <button 
                className={`cv-folder-item ${!selectedFolder ? 'active' : ''}`}
                onClick={() => onFolderSelect(null)}
              >
                <Layers size={16} />
                <span>All Repositories</span>
                <span className="cv-folder-count">{notes.length}</span>
              </button>
              <FolderTree 
                folders={folders}
                notes={notes}
                selectedFolder={selectedFolder}
                onFolderSelect={onFolderSelect}
                onFolderRename={handleFolderRename}
                onFolderDelete={onFolderDelete}
              />
            </div>
          </div>
        </div>
      </aside>

      {showFolderModal && (
        <FolderModal
          folder={editingFolder}
          folders={folders}
          onSubmit={handleFolderModalSubmit}
          onClose={() => {
            setShowFolderModal(false);
            setEditingFolder(null);
          }}
        />
      )}
    </>
  );
};

export default Sidebar;
