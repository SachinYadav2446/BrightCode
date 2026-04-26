import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, Mail, Lock, User, ArrowRight, Trophy, 
  Users, Zap, Shield, ChevronLeft
} from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login, register, sendOTP } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (location.state?.mode === 'register') {
      setIsLogin(false);
    }
  }, [location.state]);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const res = await sendOTP(email, username, 'register');
    if (res.success) {
      toast.success('Verification code sent to your email');
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
            toast.success('System Authenticated.');
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
            toast.success('Account Created!');
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
                          placeholder="••••••••••••"
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
                      <div className="input-group">
                        <label>Username</label>
                        <div className="input-wrapper">
                          <User className="input-icon" size={18} />
                          <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="architect_null"
                            required
                          />
                        </div>
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
                            placeholder="••••••••••••"
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
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : (
                  <>
                    <span>{isLogin ? 'Sign In' : (step === 1 ? 'Get Verification Code' : 'Complete Registration')}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>

              {!isLogin && step === 2 && (
                <button 
                  type="button" 
                  className="back-btn" 
                  onClick={() => setStep(1)}
                  disabled={isSubmitting}
                >
                  Edit Details
                </button>
              )}
            </form>

            {isLogin || step === 1 ? (
              <div className="auth-switch">
                <p>
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button type="button" onClick={() => {
                    setIsLogin(!isLogin);
                    setStep(1);
                    setOtp('');
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
