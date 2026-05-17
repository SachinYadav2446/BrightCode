import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

// Helper function to decode JWT token
const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  console.log('[AuthContext] Provider rendering');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionValid, setSessionValid] = useState(false);
  const [navbarHidden, setNavbarHidden] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    const email = localStorage.getItem('email');
    const xp = localStorage.getItem('user_xp');
    const css = localStorage.getItem('css_level');
    const logic = localStorage.getItem('logic_level');
    const react = localStorage.getItem('react_level');
    const mern = localStorage.getItem('mern_level');
    const activity = localStorage.getItem('user_activity');
    const streak = localStorage.getItem('user_streak');
    const joinedCount = localStorage.getItem('joined_count');
    const createdCount = localStorage.getItem('created_count');
    const bio = localStorage.getItem('user_bio');
    const stack = localStorage.getItem('user_stack');
    const createdAt = localStorage.getItem('user_joined');
    const sessionStart = localStorage.getItem('session_start');

    if (token) {
      // Decode JWT to get user ID
      const decodedToken = decodeJWT(token);
      const userId = decodedToken?.id;
      
      // Check if session is still valid (within 1 week)
      const isSessionValid = sessionStart && (Date.now() - parseInt(sessionStart)) < SESSION_DURATION;
      setSessionValid(isSessionValid);

      // Set from localStorage immediately (avoids flash of unauthenticated UI)
      setUser({ 
        id: userId, // Add user ID from JWT token
        token, username, email, 
        xp: parseInt(xp || '0'),
        css_level: parseInt(css || '0'),
        logic_level: parseInt(logic || '0'),
        react_level: parseInt(react || '0'),
        mern_level: parseInt(mern || '0'),
        activity: activity ? JSON.parse(activity) : {},
        streak: parseInt(streak || '0'),
        joinedCount: parseInt(joinedCount || '0'),
        createdCount: parseInt(createdCount || '0'),
        bio: bio || '',
        stack: stack ? JSON.parse(stack) : [],
        createdAt: createdAt || null
      });

      // Then sync fresh XP from server (non-blocking)
      axios.get('http://localhost:5051/me', {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 4000
      }).then(res => {
        const d = res.data;
        if (d?.xp !== undefined) {
          localStorage.setItem('user_xp', d.xp);
          if (d.css_level !== undefined) localStorage.setItem('css_level', d.css_level);
          if (d.logic_level !== undefined) localStorage.setItem('logic_level', d.logic_level);
          if (d.react_level !== undefined) localStorage.setItem('react_level', d.react_level);
          if (d.mern_level !== undefined) localStorage.setItem('mern_level', d.mern_level);
          if (d.activity !== undefined) localStorage.setItem('user_activity', JSON.stringify(d.activity || {}));
          if (d.streak !== undefined) localStorage.setItem('user_streak', String(d.streak || 0));
          if (d.joinedCount !== undefined) localStorage.setItem('joined_count', String(d.joinedCount || 0));
          if (d.createdCount !== undefined) localStorage.setItem('created_count', String(d.createdCount || 0));
          if (d.bio !== undefined) localStorage.setItem('user_bio', d.bio || '');
          if (d.stack !== undefined) localStorage.setItem('user_stack', JSON.stringify(d.stack || []));
          if (d.createdAt !== undefined) localStorage.setItem('user_joined', d.createdAt);
          
          setUser(prev => prev ? { 
            ...prev, 
            id: d.id, // Add user ID from server response
            xp: d.xp, 
            css_level: d.css_level, 
            logic_level: d.logic_level, 
            react_level: d.react_level, 
            mern_level: d.mern_level,
            activity: d.activity || {}, 
            streak: d.streak || 0, 
            joinedCount: d.joinedCount || 0, 
            createdCount: d.createdCount || 0,
            bio: d.bio || '',
            stack: d.stack || [],
            createdAt: d.createdAt
          } : null);
        }
      }).catch(() => { /* silent — offline is fine */ });
    } else {
      setSessionValid(false);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { data } = await axios.post('http://localhost:5051/login', { email, password });
      
      // Decode JWT to get user ID
      const decodedToken = decodeJWT(data.token);
      const userId = decodedToken?.id;
      
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);
      localStorage.setItem('user_xp', data.xp || '0');
      localStorage.setItem('css_level', data.css_level || '0');
      localStorage.setItem('logic_level', data.logic_level || '0');
      localStorage.setItem('react_level', data.react_level || '0');
      localStorage.setItem('mern_level', data.mern_level || '0');
      localStorage.setItem('user_activity', JSON.stringify(data.activity || {}));
      localStorage.setItem('user_streak', String(data.streak || 0));
      localStorage.setItem('joined_count', String(data.joinedCount || 0));
      localStorage.setItem('created_count', String(data.createdCount || 0));
      localStorage.setItem('user_bio', data.bio || '');
      localStorage.setItem('user_stack', JSON.stringify(data.stack || []));
      localStorage.setItem('user_joined', data.createdAt || '');
      localStorage.setItem('session_start', String(Date.now())); // Set session start time

      setUser({ 
        id: userId, // Add user ID from JWT token
        token: data.token, 
        username: data.username, 
        email: data.email, 
        xp: data.xp,
        css_level: data.css_level,
        logic_level: data.logic_level,
        react_level: data.react_level,
        mern_level: data.mern_level,
        activity: data.activity || {},
        streak: data.streak || 0,
        joinedCount: data.joinedCount || 0,
        createdCount: data.createdCount || 0,
        bio: data.bio || '',
        stack: data.stack || [],
        createdAt: data.createdAt || null
      });
      setSessionValid(true);
      return { success: true };
    } catch (err) {
      if (!err.response) {
          return { success: false, error: 'CRITICAL: Backend Server unreachable.' };
      }
      return { success: false, error: err.response?.data?.error || 'Login failed' };
    }
  };

  const sendOTP = async (email, username = '', type = 'register') => {
    try {
      const { data } = await axios.post('http://localhost:5051/send-otp', 
        { email, username, type },
        { timeout: 40000 } // 40 seconds timeout
      );
      return { success: true, ...data };
    } catch (err) {
      if (err.code === 'ECONNABORTED') {
        return { success: false, error: 'Request timed out. Please check your connection or try again.' };
      }
      return { success: false, error: err.response?.data?.error || 'Failed to send OTP' };
    }
  };

  const register = async (username, email, password, otp) => {
    try {
      await axios.post('http://localhost:5051/register', { username, email, password, otp });
      return { success: true };
    } catch (err) {
      const serverError = err.response?.data;
      if (!err.response) {
          return { success: false, error: 'CRITICAL: Backend Server unreachable.' };
      }
      return { success: false, error: serverError?.error || 'Registration failed' };
    }
  };

  const updateProfile = async (updateData) => {
    try {
      const { data } = await axios.post('http://localhost:5051/update-profile',
        updateData,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);
      localStorage.setItem('email', data.email);
      localStorage.setItem('user_bio', data.bio || '');
      localStorage.setItem('user_stack', JSON.stringify(data.stack || []));
      
      setUser(prev => ({ 
        ...prev, 
        token: data.token, 
        username: data.username, 
        email: data.email,
        bio: data.bio || '',
        stack: data.stack || []
      }));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update profile' };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const { data } = await axios.post('http://localhost:5051/change-password',
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      return { success: true, message: data.message };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to change password' };
    }
  };

  const updateXP = (newXP, stats = {}) => {
    localStorage.setItem('user_xp', newXP);
    if (stats.css_level !== undefined) localStorage.setItem('css_level', stats.css_level);
    if (stats.logic_level !== undefined) localStorage.setItem('logic_level', stats.logic_level);
    if (stats.react_level !== undefined) localStorage.setItem('react_level', stats.react_level);
    if (stats.mern_level !== undefined) localStorage.setItem('mern_level', stats.mern_level);
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
    localStorage.removeItem('session_start');
    
    // Clear all game-specific progress to prevent leaking to other users
    Object.keys(localStorage).forEach(key => {
        if (key.includes('highest_') || key.includes('_solutions')) {
            localStorage.removeItem(key);
        }
    });

    setUser(null);
    setSessionValid(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, sendOTP, logout, updateProfile, changePassword, updateXP, loading, sessionValid, navbarHidden, setNavbarHidden }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
