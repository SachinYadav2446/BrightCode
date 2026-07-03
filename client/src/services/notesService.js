import API_URL from '../config';
// API_URL imported from config.js

// Helper to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper to create headers with auth token
const getHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : '',
  };
};

// Notes API
export const fetchNotes = async (filters = {}) => {
  const { folderId, tag, search } = filters;
  const params = new URLSearchParams();
  
  if (folderId) params.append('folderId', folderId);
  if (tag) params.append('tag', tag);
  if (search) params.append('search', search);
  
  const queryString = params.toString();
  const url = `${API_URL}/api/notes${queryString ? `?${queryString}` : ''}`;
  
  const response = await fetch(url, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Session expired. Please log out and log in again.');
    }
    throw new Error('Failed to fetch notes');
  }
  
  return response.json();
};

export const fetchNote = async (id) => {
  const response = await fetch(`${API_URL}/api/notes/${id}`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch note');
  }
  
  return response.json();
};

export const createNote = async (noteData) => {
  const response = await fetch(`${API_URL}/api/notes`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(noteData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

export const updateNote = async (id, noteData) => {
  const response = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(noteData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update note');
  }
  
  return response.json();
};

export const deleteNote = async (id) => {
  const response = await fetch(`${API_URL}/api/notes/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete note');
  }
  
  return response.json();
};

// Folders API
export const fetchFolders = async () => {
  const response = await fetch(`${API_URL}/api/folders`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch folders');
  }
  
  return response.json();
};

export const createFolder = async (folderData) => {
  const response = await fetch(`${API_URL}/api/folders`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(folderData),
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};

export const updateFolder = async (id, folderData) => {
  const response = await fetch(`${API_URL}/api/folders/${id}`, {
    method: 'PUT',
    headers: getHeaders(),
    body: JSON.stringify(folderData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to update folder');
  }
  
  return response.json();
};

export const deleteFolder = async (id) => {
  const response = await fetch(`${API_URL}/api/folders/${id}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete folder');
  }
  
  return response.json();
};

// Search API
export const searchNotes = async (query, limit = 20) => {
  const params = new URLSearchParams({ q: query, limit });
  const response = await fetch(`${API_URL}/api/search?${params}`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Search failed');
  }
  
  return response.json();
};

// Tags API
export const fetchTags = async () => {
  const response = await fetch(`${API_URL}/api/tags`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch tags');
  }
  
  return response.json();
};

// Challenge Integration API
export const createNoteFromChallenge = async (challengeData) => {
  const response = await fetch(`${API_URL}/api/notes/from-challenge`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(challengeData),
  });
  
  if (!response.ok) {
    throw new Error('Failed to create note from challenge');
  }
  
  return response.json();
};

export const fetchRelatedNotes = async (challengeId) => {
  const response = await fetch(`${API_URL}/api/notes/related/${challengeId}`, {
    headers: getHeaders(),
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch related notes');
  }
  
  return response.json();
};
