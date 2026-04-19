import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const xp = localStorage.getItem('user_xp');
    const css = localStorage.getItem('css_level');
    const logic = localStorage.getItem('logic_level');
    const react = localStorage.getItem('react_level');

    if (token) {
      // Set from localStorage immediately (avoids flash of unauthenticated UI)
      setUser({ 
        token, username, email, 
        xp: parseInt(xp || '0'),
        css_level: parseInt(css || '0'),
        logic_level: parseInt(logic || '0'),
        react_level: parseInt(react || '0')
      });

      // Then sync fresh XP from server (non-blocking)
      axios.get('http://localhost:5000/me', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 4000
      }).then(res => {
        const d = res.data;
        if (d?.xp !== undefined) {
          localStorage.setItem('user_xp', d.xp);
          if (d.css_level !== undefined) localStorage.setItem('css_level', d.css_level);
          if (d.logic_level !== undefined) localStorage.setItem('logic_level', d.logic_level);
          if (d.react_level !== undefined) localStorage.setItem('react_level', d.react_level);
          setUser(prev => prev ? { ...prev, xp: d.xp, css_level: d.css_level, logic_level: d.logic_level, react_level: d.react_level } : null);
        }
      }).catch(() => { /* silent — offline is fine */ });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5000/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);
      localStorage.setItem('user_xp', data.xp || '0');
      localStorage.setItem('css_level', data.css_level || '0');
      localStorage.setItem('logic_level', data.logic_level || '0');
      localStorage.setItem('react_level', data.react_level || '0');

      setUser({ 
        token: data.token, 
        username: data.username, 
        email: data.email, 
        xp: data.xp,
        css_level: data.css_level,
        logic_level: data.logic_level,
        react_level: data.react_level
      });
      return { success: true };
    } catch (err) {
      if (!err.response) {
          return { success: false, error: 'CRITICAL: Backend Server unreachable. Ensure Port 5000 is open.' };
      }
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const register = async (username, email, password) => {
    try {
      await axios.post('http://localhost:5000/register', { username, email, password });
      return { success: true };
    } catch (err) {
      const serverError = err.response?.data;
      if (!err.response) {
          return { success: false, error: 'CRITICAL: Backend Server unreachable. Please ensure the server is running on Port 5000.' };
      }
      console.dir(serverError);
      const displayError = serverError?.details ? `DB FIX: ${serverError.details}` : (serverError?.error || 'Registration failed');
      return { success: false, error: displayError };
    }
  };

  const updateProfile = async (newUsername) => {
    try {
      const { data } = await axios.post('http://localhost:5000/update-profile', 
        { username: newUsername },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);
      setUser({ token: data.token, username: data.username, email: data.email });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update profile' };
    }
  };

  const updateXP = (newXP, levels = {}) => {
    localStorage.setItem('user_xp', newXP);
    if (levels.css_level !== undefined) localStorage.setItem('css_level', levels.css_level);
    if (levels.logic_level !== undefined) localStorage.setItem('logic_level', levels.logic_level);
    if (levels.react_level !== undefined) localStorage.setItem('react_level', levels.react_level);

    setUser(prev => prev ? { 
        ...prev, 
        xp: newXP, 
        ...levels 
    } : null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('user_xp');
    
    // Clear all game-specific progress to prevent leaking to other users
    Object.keys(localStorage).forEach(key => {
        if (key.includes('highest_') || key.includes('_solutions')) {
            localStorage.removeItem(key);
        }
    });

    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateProfile, updateXP, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
