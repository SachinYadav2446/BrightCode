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
    const activity = localStorage.getItem('user_activity');
    const streak = localStorage.getItem('user_streak');
    const joinedCount = localStorage.getItem('joined_count');
    const createdCount = localStorage.getItem('created_count');

    if (token) {
      // Set from localStorage immediately (avoids flash of unauthenticated UI)
      setUser({ 
        token, username, email, 
        xp: parseInt(xp || '0'),
        css_level: parseInt(css || '0'),
        logic_level: parseInt(logic || '0'),
        react_level: parseInt(react || '0'),
        activity: activity ? JSON.parse(activity) : {},
        streak: parseInt(streak || '0'),
        joinedCount: parseInt(joinedCount || '0'),
        createdCount: parseInt(createdCount || '0')
      });

      // Then sync fresh XP from server (non-blocking)
      axios.get('http://localhost:5050/me', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 4000
      }).then(res => {
        const d = res.data;
        if (d?.xp !== undefined) {
          localStorage.setItem('user_xp', d.xp);
          if (d.css_level !== undefined) localStorage.setItem('css_level', d.css_level);
          if (d.logic_level !== undefined) localStorage.setItem('logic_level', d.logic_level);
          if (d.react_level !== undefined) localStorage.setItem('react_level', d.react_level);
          if (d.activity !== undefined) localStorage.setItem('user_activity', JSON.stringify(d.activity || {}));
          if (d.streak !== undefined) localStorage.setItem('user_streak', String(d.streak || 0));
          if (d.joinedCount !== undefined) localStorage.setItem('joined_count', String(d.joinedCount || 0));
          if (d.createdCount !== undefined) localStorage.setItem('created_count', String(d.createdCount || 0));
          setUser(prev => prev ? { ...prev, xp: d.xp, css_level: d.css_level, logic_level: d.logic_level, react_level: d.react_level, activity: d.activity || {}, streak: d.streak || 0, joinedCount: d.joinedCount || 0, createdCount: d.createdCount || 0 } : null);
        }
      }).catch(() => { /* silent — offline is fine */ });
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5050/login', { email, password });
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);
      localStorage.setItem('user_xp', data.xp || '0');
      localStorage.setItem('css_level', data.css_level || '0');
      localStorage.setItem('logic_level', data.logic_level || '0');
      localStorage.setItem('react_level', data.react_level || '0');
      localStorage.setItem('user_activity', JSON.stringify(data.activity || {}));
      localStorage.setItem('user_streak', String(data.streak || 0));
      localStorage.setItem('joined_count', String(data.joinedCount || 0));
      localStorage.setItem('created_count', String(data.createdCount || 0));

      setUser({ 
        token: data.token, 
        username: data.username, 
        email: data.email, 
        xp: data.xp,
        css_level: data.css_level,
        logic_level: data.logic_level,
        react_level: data.react_level,
        activity: data.activity || {},
        streak: data.streak || 0,
        joinedCount: data.joinedCount || 0,
        createdCount: data.createdCount || 0
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
      await axios.post('http://localhost:5050/register', { username, email, password });
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
      const { data } = await axios.post('http://localhost:5050/update-profile',
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

  const updateXP = (newXP, stats = {}) => {
    localStorage.setItem('user_xp', newXP);
    if (stats.css_level !== undefined) localStorage.setItem('css_level', stats.css_level);
    if (stats.logic_level !== undefined) localStorage.setItem('logic_level', stats.logic_level);
    if (stats.react_level !== undefined) localStorage.setItem('react_level', stats.react_level);
    if (stats.activity) localStorage.setItem('user_activity', JSON.stringify(stats.activity));
    if (stats.streak !== undefined) localStorage.setItem('user_streak', String(stats.streak));
    if (stats.joinedCount !== undefined) localStorage.setItem('joined_count', String(stats.joinedCount));
    if (stats.createdCount !== undefined) localStorage.setItem('created_count', String(stats.createdCount));

    setUser(prev => prev ? { 
        ...prev, 
        xp: newXP, 
        ...stats 
    } : null);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('email');
    localStorage.removeItem('user_xp');
    localStorage.removeItem('user_activity');
    localStorage.removeItem('user_streak');
    localStorage.removeItem('joined_count');
    localStorage.removeItem('created_count');
    
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
