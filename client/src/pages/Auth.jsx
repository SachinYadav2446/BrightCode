import API_URL from '../config';
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
  Code2, Mail, Lock, User, ArrowRight, Trophy, 
  Users, Zap, Shield, ChevronLeft, Check, X, Loader
} from 'lucide-react';
import './Auth.css';

const API = API_URL;

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Username availability state
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'checking' | 'available' | 'taken' | 'invalid'
  const [usernameMsg, setUsernameMsg] = useState('');
  const usernameTimeout = useRef(null);
  
  const { login, register, sendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.mode === 'register') {
      setIsLogin(false);
    }
  }, [location.state]);

  // Live username availability check
  useEffect(() => {
    if (isLogin) return;
    if (usernameTimeout.current) clearTimeout(usernameTimeout.current);

    if (!username || username.length < 3) {
      setUsernameStatus(null);
      setUsernameMsg('');
      return;
    }

    setUsernameStatus('checking');
    usernameTimeout.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API}/check-username?username=${encodeURIComponent(username)}`);
        if (data.available) {
          setUsernameStatus('available');
          setUsernameMsg('Username is available!');
        } else {
          setUsernameStatus('taken');
          setUsernameMsg(data.reason || 'Username unavailable');
        }
      } catch (e) {
        setUsernameStatus(null);
        setUsernameMsg('');
      }
    }, 500);

    return () => clearTimeout(usernameTimeout.current);
  }, [username, isLogin]);

  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (usernameStatus === 'taken' || usernameStatus === 'invalid') {
      toast.error('Please choose a different username');
      return;
    }
    if (usernameStatus === 'checking') {
      toast.error('Please wait while we check your username');
      return;
    }

    setIsSubmitting(true);
    const res = await sendOTP(email, username, 'register');
    if (res.success) {
      toast.success(res.message || 'Verification code sent to your email', { duration: 6000 });
      setStep(2);
    } else {
      toast.error(res.error);
    }
    setIsSubmitting(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        if (isLogin) {
          const res = await login(email, password);
          if (res.success) {
            Object.keys(localStorage).forEach(key => {
                if (key.includes('highest_') || key.includes('_solutions') || key.includes('user_xp')) {
                    localStorage.removeItem(key);
                }
            });
            navigate('/hub');
          } else {
            toast.error(res.error);
          }
        } else {
          const res = await register(username, email, password, otp);
          if (res.success) {
            Object.keys(localStorage).forEach(key => {
                if (key.includes('highest_') || key.includes('_solutions') || key.includes('user_xp')) {
                    localStorage.removeItem(key);
                }
            });
            setTimeout(async () => {
                const autoLogin = await login(email, password);
                if (autoLogin.success) navigate('/hub');
            }, 1000);
          } else {
            toast.error(res.error);
          }
        }
    } catch (err) {
        toast.error("Authentication failed");
    } finally {
        setIsSubmitting(false);
    }
  };

  const UsernameStatusIcon = () => {
    if (usernameStatus === 'checking') return <Loader size={16} className="auth-username-spinner" />;
    if (usernameStatus === 'available') return <Check size={16} color="#22c55e" />;
    if (usernameStatus === 'taken') return <X size={16} color="#ef4444" />;
    return null;
  };

  return (
    <div className="auth-page">
      <div className="back-to-home-global" onClick={() => navigate('/')}>
        <ChevronLeft size={20} />
        <span>Back to Home</span>
      </div>

      <motion.div 
        layout 
        className="auth-container"
        transition={{ 
          layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } 
        }}
      >
        <div className="auth-form-side">
          <motion.div layout className="form-content">
            <div className="form-header">
              <motion.h2
                key={isLogin ? 'signin' : 'signup'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {isLogin ? "Sign In" : (step === 1 ? "Create Account" : "Verify Email")}
              </motion.h2>
              <motion.p
                key={isLogin ? 'signin-p' : 'signup-p'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {isLogin 
                  ? "Enter your credentials to continue" 
                  : (step === 1 ? "Fill in the details to register" : `We've sent a code to ${email}`)}
              </motion.p>
            </div>

            <form onSubmit={isLogin ? handleSubmit : (step === 1 ? handleSendOTP : handleSubmit)} className="auth-form">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <motion.div
                    key="login-fields"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="form-step"
                  >
                    <div className="input-group">
                      <label>Email Address</label>
                      <div className="input-wrapper">
                        <Mail className="input-icon" size={18} />
                        <input 
                          type="email" 
                          value={email} 
                          onChange={(e) => setEmail(e.target.value)} 
                          placeholder="engineer@codebright.io"
                          required
                        />
                      </div>
                    </div>

                    <div className="input-group">
                      <label>Password</label>
                      <div className="input-wrapper">
                        <Lock className="input-icon" size={18} />
                        <input 
                          type="password" 
                          value={password} 
                          onChange={(e) => setPassword(e.target.value)} 
                          placeholder="Enter your password"
                          required
                        />
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  step === 1 ? (
                    <motion.div
                      key="register-step-1"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="form-step"
                    >
                      {/* Username with live check */}
                      <div className="input-group">
                        <label>Username</label>
                        <div className={`input-wrapper ${usernameStatus === 'available' ? 'valid' : usernameStatus === 'taken' ? 'invalid' : ''}`}>
                          <User className="input-icon" size={18} />
                          <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value.replace(/\s/g, '').toLowerCase())} 
                            placeholder="your_username"
                            required
                            autoComplete="off"
                          />
                          <span className="input-status-icon"><UsernameStatusIcon /></span>
                        </div>
                        <AnimatePresence>
                          {usernameMsg && (
                            <motion.p
                              key={usernameStatus}
                              className={`username-hint ${usernameStatus}`}
                              initial={{ opacity: 0, y: -4 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0 }}
                            >
                              {usernameMsg}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      <div className="input-group">
                        <label>Email Address</label>
                        <div className="input-wrapper">
                          <Mail className="input-icon" size={18} />
                          <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder="engineer@codebright.io"
                            required
                          />
                        </div>
                      </div>

                      <div className="input-group">
                        <label>Password</label>
                        <div className="input-wrapper">
                          <Lock className="input-icon" size={18} />
                          <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Create a password"
                            required
                          />
                        </div>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="register-step-2"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="form-step"
                    >
                      <div className="otp-container">
                        <div className="input-group">
                          <label>Verification Code</label>
                          <div className="input-wrapper">
                            <Shield className="input-icon" size={18} />
                            <input 
                              type="text" 
                              value={otp} 
                              onChange={(e) => setOtp(e.target.value.trim())} 
                              placeholder="000000"
                              maxLength={6}
                              className="otp-input"
                              required
                            />
                          </div>
                          <p className="resend-text">
                            Didn't receive code? <span onClick={handleSendOTP}>Resend OTP</span>
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )
                )}
              </AnimatePresence>

              <button 
                type="submit" 
                className={`auth-submit-btn ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting || (!isLogin && step === 1 && (usernameStatus === 'taken' || usernameStatus === 'checking'))}
              >
                {isSubmitting ? 'Processing...' : (
                  <>
                    <span>{isLogin ? 'Sign In' : (step === 1 ? 'Get Verification Code' : 'Complete Registration')}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {/* Google OAuth Button */}
              {isLogin && (
                <button
                  type="button"
                  className="google-oauth-btn"
                  onClick={() => window.location.href = `${API}/auth/google`}
                  disabled={isSubmitting}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>Sign in with Google</span>
                </button>
              )}

            </form>

            {!isLogin && step === 2 && (
              <div className="auth-step-back">
                <button 
                  type="button" 
                  className="back-btn-link" 
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  <ChevronLeft size={14} />
                  <span>Edit registration details</span>
                </button>
              </div>
            )}

            {isLogin || step === 1 ? (
              <div className="auth-switch">
                <p>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button type="button" onClick={() => {
                    setIsLogin(!isLogin);
                    setStep(1);
                    setOtp('');
                    setUsernameStatus(null);
                    setUsernameMsg('');
                    setUsername('');
                  }}>
                    {isLogin ? 'Create one' : 'Sign in'}
                  </button>
                </p>
              </div>
            ) : null}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
