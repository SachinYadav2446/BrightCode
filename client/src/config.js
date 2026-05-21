// Central API & Socket configuration
// Set VITE_BACKEND_URL in your .env file for production deployments.
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5051';

// Ensure HTTPS/WSS in production
const PROTOCOL = window.location.protocol === 'https:' ? 'https:' : 'http:';
const WS_PROTOCOL = window.location.protocol === 'https:' ? 'wss:' : 'ws:';

// If backend URL is not set, try to derive it from current location
const getBackendUrl = () => {
    if (import.meta.env.VITE_BACKEND_URL) {
        return import.meta.env.VITE_BACKEND_URL;
    }
    // Fallback: use current origin with backend port
    const origin = window.location.origin;
    return origin.replace(/:\d+$/, '') + ':5051';
};

export default getBackendUrl();
export { PROTOCOL, WS_PROTOCOL };
