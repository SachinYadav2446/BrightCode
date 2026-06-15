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

  // Social registration flow states
  const [showSocialModal, setShowSocialModal] = useState(false);
  const [socialEmail, setSocialEmail] = useState('');
  const [socialUsername, setSocialUsername] = useState('');
  const [socialPassword, setSocialPassword] = useState('');
  const [socialConfirmPassword, setSocialConfirmPassword] = useState('');
  const [socialTempToken, setSocialTempToken] = useState('');
  const [socialUsernameStatus, setSocialUsernameStatus] = useState(null);
  const [socialUsernameMsg, setSocialUsernameMsg] = useState('');
  const socialUsernameTimeout = useRef(null);
  
  const { login, register, sendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.mode === 'register') {
      setIsLogin(false);
    }
  }, [location.state]);

  // Handle OAuth success callback parameters & errors
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const oauthToken = params.get('token');
    if (oauthToken) {
      localStorage.setItem('token', oauthToken);
      localStorage.setItem('username', params.get('username') || '');
      localStorage.setItem('email', params.get('email') || '');
      localStorage.setItem('user_xp', params.get('xp') || '0');
      localStorage.setItem('css_level', params.get('css_level') || '0');
      localStorage.setItem('logic_level', params.get('logic_level') || '0');
      localStorage.setItem('react_level', params.get('react_level') || '0');
      localStorage.setItem('mern_level', params.get('mern_level') || '0');
      localStorage.setItem('user_activity', params.get('activity') || '{}');
      localStorage.setItem('user_streak', params.get('streak') || '0');
      localStorage.setItem('joined_count', params.get('joinedCount') || '0');
      localStorage.setItem('created_count', params.get('createdCount') || '0');
      localStorage.setItem('user_bio', params.get('bio') || '');
      localStorage.setItem('user_stack', params.get('stack') || '[]');
      localStorage.setItem('user_avatar_id', params.get('avatarId') || 'Sniper');
      localStorage.setItem('user_banner_id', params.get('bannerId') || 'crimson');
      localStorage.setItem('user_github', params.get('github') || '');
      localStorage.setItem('user_leetcode', params.get('leetcode') || '');
      localStorage.setItem('user_project1', params.get('project1') || '');
      localStorage.setItem('user_project2', params.get('project2') || '');
      localStorage.setItem('user_joined', params.get('createdAt') || '');
      localStorage.setItem('session_start', String(Date.now()));
      localStorage.setItem('user_subscription', params.get('subscription') || 'basic');
      
      toast.success('Successfully authenticated with Social Login!');
      // Force page reload to hub so AuthContext pulls values
      window.location.href = '/hub';
      return;
    }

    const error = params.get('error');
    if (error === 'social_email_taken') {
      toast.error('An account with this email already exists using email/password login. Please login with password or use a different account.', { duration: 6000 });
      navigate('/auth', { replace: true });
      return;
    }

    if (error === 'session_expired') {
      toast.error('Your session has expired or your account no longer exists. Please sign in again.');
      navigate('/auth', { replace: true });
      return;
    }

    if (error === 'concurrent_login') {
      toast.error('You have been logged out because another session was started.');
      navigate('/auth', { replace: true });
      return;
    }

    const socialSignup = params.get('social_signup');
    if (socialSignup === 'true') {
      const emailParam = params.get('email') || '';
      const usernameParam = params.get('username') || '';
      const tempTokenParam = params.get('temp_token') || '';
      
      setSocialEmail(emailParam);
      setSocialUsername(usernameParam);
      setSocialTempToken(tempTokenParam);
      setShowSocialModal(true);
      
      navigate('/auth', { replace: true });
    }
  }, [location.search, navigate]);

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

  // Live social username availability check
  useEffect(() => {
    if (!showSocialModal) return;
    if (socialUsernameTimeout.current) clearTimeout(socialUsernameTimeout.current);

    if (!socialUsername || socialUsername.length < 3) {
      setSocialUsernameStatus(null);
      setSocialUsernameMsg('');
      return;
    }

    setSocialUsernameStatus('checking');
    socialUsernameTimeout.current = setTimeout(async () => {
      try {
        const { data } = await axios.get(`${API}/check-username?username=${encodeURIComponent(socialUsername)}`);
        if (data.available) {
          setSocialUsernameStatus('available');
          setSocialUsernameMsg('Username is available!');
        } else {
          setSocialUsernameStatus('taken');
          setSocialUsernameMsg(data.reason || 'Username unavailable');
        }
      } catch (e) {
        setSocialUsernameStatus(null);
        setSocialUsernameMsg('');
      }
    }, 500);

    return () => clearTimeout(socialUsernameTimeout.current);
  }, [socialUsername, showSocialModal]);

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

  const handleSocialSignupSubmit = async (e) => {
    e.preventDefault();
    if (socialPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }
    if (socialPassword !== socialConfirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (socialUsernameStatus === 'taken' || socialUsernameStatus === 'invalid') {
      toast.error('Please choose a different username');
      return;
    }
    if (socialUsernameStatus === 'checking') {
      toast.error('Please wait while we check your username');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post(`${API}/api/auth/complete-social-signup`, {
        username: socialUsername,
        password: socialPassword,
        temp_token: socialTempToken
      });
      
      const { data } = response;
      if (data && data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('username', data.username || '');
        localStorage.setItem('email', data.email || '');
        localStorage.setItem('user_xp', String(data.xp || '0'));
        localStorage.setItem('css_level', String(data.css_level || '0'));
        localStorage.setItem('logic_level', String(data.logic_level || '0'));
        localStorage.setItem('react_level', String(data.react_level || '0'));
        localStorage.setItem('mern_level', String(data.mern_level || '0'));
        localStorage.setItem('user_activity', JSON.stringify(data.activity || {}));
        localStorage.setItem('user_streak', String(data.streak || '0'));
        localStorage.setItem('joined_count', String(data.joinedCount || '0'));
        localStorage.setItem('created_count', String(data.createdCount || '0'));
        localStorage.setItem('user_bio', data.bio || '');
        localStorage.setItem('user_stack', JSON.stringify(Array.isArray(data.stack) ? data.stack : []));
        localStorage.setItem('user_avatar_id', data.avatarId || 'Sniper');
        localStorage.setItem('user_banner_id', data.bannerId || 'crimson');
        localStorage.setItem('user_github', data.github || '');
        localStorage.setItem('user_leetcode', data.leetcode || '');
        localStorage.setItem('user_project1', data.project1 || '');
        localStorage.setItem('user_project2', data.project2 || '');
        localStorage.setItem('user_joined', data.createdAt || '');
        localStorage.setItem('session_start', String(Date.now()));
        localStorage.setItem('user_subscription', data.subscription || 'basic');

        toast.success('Registration completed successfully! Welcome to BrightCode.');
        setShowSocialModal(false);
        // Force page reload to hub so AuthContext pulls values
        window.location.href = '/hub';
      } else {
        toast.error('Failed to complete signup: no token returned.');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
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
        <ChevronLeft size={16} />
        <span>Back to Home</span>
      </div>

      <motion.div
        layout
        className="auth-container"
        transition={{ layout: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } }}
      >
        {/* ── Left branding panel ── */}
        <div className="auth-left">
          <div className="auth-brand">
            <div className="auth-brand-name">Bright<span>Code</span></div>
            <div className="auth-brand-tag">Developer Platform</div>
          </div>

          <div className="auth-left-headline">
            <h1>
              Code. Compete.<br />
              <span>Dominate.</span>
            </h1>
            <p>
              Join thousands of developers sharpening their skills,
              competing in real-time battles, and building in collaborative workspaces.
            </p>
          </div>

          <div className="auth-stats">
            {[
              { icon: <Users size={16} />, value: "Active community", label: "Developers worldwide" },
              { icon: <Trophy size={16} />, value: "Daily challenges", label: "Logic Lab & Code Wars" },
              { icon: <Zap size={16} />,   value: "Real-time editor",  label: "Sub-10ms sync latency" },
              { icon: <Shield size={16} />, value: "Ranked system",    label: "XP, levels & factions" },
            ].map((s, i) => (
              <motion.div
                key={i}
                className="auth-stat"
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
              >
                <div className="auth-stat-icon">{s.icon}</div>
                <div className="auth-stat-text">
                  <span className="auth-stat-value">{s.value}</span>
                  <span className="auth-stat-label">{s.label}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Right form panel ── */}
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

            {(isLogin || step === 1) && (
              <>
                <div className="auth-divider">
                  <span>or continue with</span>
                </div>
                <div className="social-login-group">
                  <button
                    type="button"
                    className="social-btn google-btn"
                    onClick={() => window.location.href = `${API}/api/auth/google`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.7 0 3.25.69 4.38 1.81l3.02-3.02C19.14 1.76 15.91 0 12.24 0 5.58 0 0 5.58 0 12.24s5.58 12.24 12.24 12.24c6.98 0 12.24-4.8 12.24-12.24 0-.78-.07-1.53-.2-2.255H12.24z"/>
                    </svg>
                    <span>Google</span>
                  </button>
                  <button
                    type="button"
                    className="social-btn github-btn"
                    onClick={() => window.location.href = `${API}/api/auth/github`}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                  </button>
                </div>
              </>
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
        </div>   {/* auth-form-side */}
      </motion.div>

      {/* ── Social Signup Modal Overlay ── */}
      <AnimatePresence>
        {showSocialModal && (
          <motion.div 
            className="social-signup-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="social-signup-modal-content"
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 250 }}
            >
              <div className="modal-header">
                <h2>Complete Registration</h2>
                <p>Configure a username and password to finalize your social account setup.</p>
                <button className="modal-close-btn" onClick={() => setShowSocialModal(false)}>
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSocialSignupSubmit} className="auth-form">
                <div className="input-group">
                  <label>Email Address</label>
                  <div className="input-wrapper disabled-wrapper">
                    <Mail className="input-icon" size={18} />
                    <input 
                      type="email" 
                      value={socialEmail} 
                      disabled 
                      readOnly
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Username</label>
                  <div className={`input-wrapper ${socialUsernameStatus === 'available' ? 'valid' : socialUsernameStatus === 'taken' ? 'invalid' : ''}`}>
                    <User className="input-icon" size={18} />
                    <input 
                      type="text" 
                      value={socialUsername} 
                      onChange={(e) => setSocialUsername(e.target.value.replace(/\s/g, '').toLowerCase())} 
                      placeholder="choose_username"
                      required
                      autoComplete="off"
                    />
                    <span className="input-status-icon">
                      {socialUsernameStatus === 'checking' && <Loader size={16} className="auth-username-spinner" />}
                      {socialUsernameStatus === 'available' && <Check size={16} color="#22c55e" />}
                      {socialUsernameStatus === 'taken' && <X size={16} color="#ef4444" />}
                    </span>
                  </div>
                  <AnimatePresence>
                    {socialUsernameMsg && (
                      <motion.p
                        key={socialUsernameStatus}
                        className={`username-hint ${socialUsernameStatus}`}
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                      >
                        {socialUsernameMsg}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="input-group">
                  <label>Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input 
                      type="password" 
                      value={socialPassword} 
                      onChange={(e) => setSocialPassword(e.target.value)} 
                      placeholder="Choose a password (min. 6 chars)"
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Confirm Password</label>
                  <div className="input-wrapper">
                    <Lock className="input-icon" size={18} />
                    <input 
                      type="password" 
                      value={socialConfirmPassword} 
                      onChange={(e) => setSocialConfirmPassword(e.target.value)} 
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className={`auth-submit-btn ${isSubmitting ? 'loading' : ''}`}
                  disabled={isSubmitting || socialUsernameStatus === 'taken' || socialUsernameStatus === 'checking' || socialUsername.length < 3}
                >
                  {isSubmitting ? 'Finalizing Setup...' : (
                    <>
                      <span>Finalize Registration</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Auth;
