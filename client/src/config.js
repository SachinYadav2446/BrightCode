// Central API & Socket configuration
// Set VITE_BACKEND_URL in your .env file for production deployments.
const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5051';

export default API_URL;
