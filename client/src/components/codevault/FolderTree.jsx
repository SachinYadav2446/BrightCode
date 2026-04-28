import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Folder, ChevronRight, ChevronDown, MoreVertical, Edit2, Trash2 } from 'lucide-react';

const FolderTreeItem = ({ 
  folder, 
  notes,
  selectedFolder, 
  onFolderSelect,
  onFolderRename,
  onFolderDelete,
  level = 0 
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showContextMenu, setShowContextMenu] = useState(false);

  // Calculate note count for this folder (including subfolders)
  const getNoteCount = (folderId) => {
    return notes.filter(note => note.folder_id === folderId).length;
  };

  const noteCount = getNoteCount(folder.id);
  const hasChildren = folder.children && folder.children.length > 0;
  const isActive = selectedFolder === folder.id;

  const handleToggle = (e) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const handleContextMenu = (e) => {
    e.stopPropagation();
    setShowContextMenu(!showContextMenu);
  };

  const handleRename = (e) => {
    e.stopPropagation();
    setShowContextMenu(false);
    onFolderRename(folder);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setShowContextMenu(false);
    if (window.confirm(`Delete folder "${folder.name}"? Notes will be moved to the parent folder.`)) {
      onFolderDelete(folder.id);
    }
  };

  return (
    <div className="cv-folder-tree-item" style={{ paddingLeft: `${level * 16}px` }}>
      <button
        className={`cv-folder-item ${isActive ? 'active' : ''}`}
        onClick={() => onFolderSelect(folder.id)}
      >
        {hasChildren && (
          <span className="cv-folder-toggle" onClick={handleToggle}>
            {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </span>
        )}
        {!hasChildren && <span className="cv-folder-spacer" />}
        <Folder size={16} />
        <span className="cv-folder-name">{folder.name}</span>
        {noteCount > 0 && <span className="cv-folder-count">{noteCount}</span>}
        <button 
          className="cv-folder-menu-btn"
          onClick={handleContextMenu}
          title="Folder actions"
        >
          <MoreVertical size={14} />
        </button>
      </button>

      <AnimatePresence>
        {showContextMenu && (
          <motion.div
            className="cv-context-menu"
            initial={{ opacity: 0, scale: 0.95, y: -5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
          >
            <button className="cv-context-menu-item" onClick={handleRename}>
              <Edit2 size={14} />
              <span>Rename</span>
            </button>
            <button className="cv-context-menu-item danger" onClick={handleDelete}>
              <Trash2 size={14} />
              <span>Delete</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            {folder.children.map(child => (
              <FolderTreeItem
                key={child.id}
                folder={child}
                notes={notes}
                selectedFolder={selectedFolder}
                onFolderSelect={onFolderSelect}
                onFolderRename={onFolderRename}
                onFolderDelete={onFolderDelete}
                level={level + 1}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const FolderTree = ({ 
  folders, 
  notes,
  selectedFolder, 
  onFolderSelect,
  onFolderRename,
  onFolderDelete
}) => {
  // Build hierarchical structure
  const buildTree = (folders) => {
    const folderMap = {};
    const rootFolders = [];

    // Create a map of all folders
    folders.forEach(folder => {
      folderMap[folder.id] = { ...folder, children: [] };
    });

    // Build the tree structure
    folders.forEach(folder => {
      if (folder.parent_id && folderMap[folder.parent_id]) {
        folderMap[folder.parent_id].children.push(folderMap[folder.id]);
      } else {
        rootFolders.push(folderMap[folder.id]);
      }
    });

    return rootFolders;
  };

  const folderTree = buildTree(folders);

  if (folderTree.length === 0) {
    return (
      <div className="cv-folder-empty">
        <p>No folders yet. Create one to organize your notes.</p>
      </div>
    );
  }

  return (
    <div className="cv-folder-tree">
      {folderTree.map(folder => (
        <FolderTreeItem
          key={folder.id}
          folder={folder}
          notes={notes}
          selectedFolder={selectedFolder}
          onFolderSelect={onFolderSelect}
          onFolderRename={onFolderRename}
          onFolderDelete={onFolderDelete}
        />
      ))}
    </div>
  );
};

export default FolderTree;
