import React, { useState, useEffect } from 'react';
import { notify } from '../services/notify';
import './StatusBar.css';

const ICONS = {
  success: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  ),
  error: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  info: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
};

const StatusBar = () => {
  const [notification, setNotification] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const unsub = notify.subscribe((event) => {
      if (!event) {
        // Dismiss
        setVisible(false);
        setTimeout(() => setNotification(null), 300);
        return;
      }
      setNotification(event);
      setVisible(true);
    });
    return unsub;
  }, []);

  if (!notification) return null;

  return (
    <div className={`status-bar status-bar--${notification.type} ${visible ? 'status-bar--visible' : ''}`}>
      <span className={`status-bar__icon status-bar__icon--${notification.type}`}>
        {ICONS[notification.type] || ICONS.info}
      </span>
      <span className="status-bar__message">{notification.message}</span>
      <button
        className="status-bar__dismiss"
        onClick={() => { setVisible(false); setTimeout(() => setNotification(null), 300); }}
        aria-label="Dismiss"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
};

export default StatusBar;
