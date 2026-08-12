/**
 * notify.js — Silent, non-intrusive notification system
 * Replaces react-hot-toast with a bottom status bar approach.
 * Only surfaces genuinely critical errors to the user via a sleek panel.
 */

// Internal event bus
const listeners = new Set();
let currentTimer = null;

export const notify = {
  /**
   * Show a subtle status message (bottom bar, auto-dismisses in 2.5s)
   * Use for: success confirmations, info messages
   */
  show(message, type = 'info', duration = 2500) {
    const event = { message, type, id: Date.now() };
    listeners.forEach(fn => fn(event));
    if (currentTimer) clearTimeout(currentTimer);
    currentTimer = setTimeout(() => {
      listeners.forEach(fn => fn(null)); // dismiss
    }, duration);
  },

  success(message, duration = 2500) {
    this.show(message, 'success', duration);
  },

  error(message, duration = 4000) {
    this.show(message, 'error', duration);
  },

  info(message, duration = 2000) {
    this.show(message, 'info', duration);
  },

  // Silent no-op — swallows messages we don't want to surface at all
  silent() {},

  subscribe(fn) {
    listeners.add(fn);
    return () => listeners.delete(fn);
  }
};

export default notify;
