import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Folder, AlertCircle } from 'lucide-react';

const FolderModal = ({ folder, folders, onSubmit, onClose }) => {
  const [name, setName] = useState(folder?.name || '');
  const [parentId, setParentId] = useState(folder?.parent_id || null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!folder;

  useEffect(() => {
    // Focus input on mount
    const input = document.getElementById('folder-name-input');
    if (input) {
      input.focus();
      input.select();
    }
  }, []);

  const validateName = (value) => {
    if (!value || value.trim().length === 0) {
      return 'Folder name is required';
    }

    if (value.length > 100) {
      return 'Folder name must be less than 100 characters';
    }

    // Check for duplicate names in the same parent
    const siblings = folders.filter(f => 
      f.parent_id === parentId && 
      f.id !== folder?.id
    );

    if (siblings.some(f => f.name.toLowerCase() === value.trim().toLowerCase())) {
      return 'A folder with this name already exists in this location';
    }

    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = name.trim();
    const validationError = validateName(trimmedName);
    
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit({
        name: trimmedName,
        parentId: parentId || null
      });
    } catch (err) {
      setError(err.message || 'Failed to save folder');
      setIsSubmitting(false);
    }
  };

  const handleNameChange = (e) => {
    setName(e.target.value);
    if (error) {
      setError('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  // Build folder options for parent selection (exclude current folder and its descendants)
  const getAvailableParents = () => {
    if (!isEditing) {
      return folders;
    }

    // Exclude the folder being edited and all its descendants
    const excludeIds = new Set([folder.id]);
    
    const findDescendants = (folderId) => {
      folders.forEach(f => {
        if (f.parent_id === folderId && !excludeIds.has(f.id)) {
          excludeIds.add(f.id);
          findDescendants(f.id);
        }
      });
    };
    
    findDescendants(folder.id);
    
    return folders.filter(f => !excludeIds.has(f.id));
  };

  const availableParents = getAvailableParents();

  return (
    <AnimatePresence>
      <motion.div
        className="cv-modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="cv-modal"
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          onKeyDown={handleKeyDown}
        >
          <div className="cv-modal-header">
            <div className="cv-modal-title-wrapper">
              <Folder size={24} color="var(--cv-accent)" />
              <h2>{isEditing ? 'Rename Folder' : 'New Folder'}</h2>
            </div>
            <button className="cv-modal-close" onClick={onClose}>
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="cv-modal-body">
            <div className="cv-form-group">
              <label htmlFor="folder-name-input">Folder Name</label>
              <input
                id="folder-name-input"
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="Enter folder name..."
                className={error ? 'error' : ''}
                disabled={isSubmitting}
                maxLength={100}
              />
              {error && (
                <div className="cv-form-error">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
            </div>

            {!isEditing && availableParents.length > 0 && (
              <div className="cv-form-group">
                <label htmlFor="folder-parent-select">Parent Folder (Optional)</label>
                <select
                  id="folder-parent-select"
                  value={parentId || ''}
                  onChange={(e) => setParentId(e.target.value || null)}
                  disabled={isSubmitting}
                >
                  <option value="">Root (No Parent)</option>
                  {availableParents.map(f => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="cv-modal-actions">
              <button
                type="button"
                className="cv-btn-secondary"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="cv-btn-primary"
                disabled={isSubmitting || !name.trim()}
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Rename' : 'Create'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default FolderModal;
