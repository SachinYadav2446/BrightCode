import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertTriangle, Edit3 } from 'lucide-react';
import './VaultModal.css';

const VaultModal = ({ isOpen, onClose, config }) => {
  const [inputValue, setInputValue] = useState('');

  useEffect(() => {
    if (isOpen && config?.initialValue !== undefined) {
      setInputValue(config.initialValue);
    }
  }, [isOpen, config]);

  const handleConfirm = () => {
    if (config?.type === 'input') {
      if (inputValue.trim()) {
        config.onConfirm(inputValue.trim());
        onClose();
      }
    } else {
      config.onConfirm();
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleConfirm();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!config) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="vault-modal-overlay">
          <motion.div 
            className="vault-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div 
            className="vault-modal-container"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            <div className="vault-modal-header">
              <div className="modal-header-icon">
                {config.type === 'input' ? <Edit3 size={18} /> : <AlertTriangle size={18} />}
              </div>
              <h3>{config.title}</h3>
              <button className="modal-close-btn" onClick={onClose}>
                <X size={18} />
              </button>
            </div>

            <div className="vault-modal-body">
              {config.message && <p className="modal-message">{config.message}</p>}
              
              {config.type === 'input' && (
                <div className="modal-input-wrapper">
                  <input
                    type="text"
                    autoFocus
                    placeholder={config.placeholder || 'Enter value...'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    className="modal-text-input"
                  />
                  <div className="input-focus-line" />
                </div>
              )}
            </div>

            <div className="vault-modal-footer">
              <button className="modal-btn-cancel" onClick={onClose}>
                Cancel
              </button>
              <button 
                className={`modal-btn-confirm ${config.variant === 'danger' ? 'btn-danger' : 'btn-primary'}`}
                onClick={handleConfirm}
              >
                {config.confirmText || (config.type === 'input' ? 'Save Changes' : 'Confirm')}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VaultModal;
