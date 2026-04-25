import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Code2, Mail, Lock, User, ArrowRight, Sparkles, 
  ShieldCheck, Cpu, Database, Activity, Terminal 
} from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const { login, register } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({
        x: (e.clientX / window.innerWidth - 0.5) * 20,
        y: (e.clientY / window.innerHeight - 0.5) * 20
      });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
        if (isLogin) {
          const res = await login(email, password);
          if (res.success) {
            // DEEP CLEAN: Ensure no progress leaks from previous users
            Object.keys(localStorage).forEach(key => {
                if (key.includes('highest_') || key.includes('_solutions') || key.includes('user_xp')) {
                    localStorage.removeItem(key);
                }
            });
            toast.success('System Authenticated. Entering Hub...');
            navigate('/hub');
          } else {
            toast.error(res.error);
          }
        } else {
          const res = await register(username, email, password);
          if (res.success) {
            // DEEP CLEAN: Prepare fresh workspace
            Object.keys(localStorage).forEach(key => {
                if (key.includes('highest_') || key.includes('_solutions') || key.includes('user_xp')) {
                    localStorage.removeItem(key);
                }
            });
            toast.success('Account Created! Initializing environment...');
            setTimeout(async () => {
                const autoLogin = await login(email, password);
                if (autoLogin.success) navigate('/hub');
            }, 1000);
          } else {
            toast.error(res.error);
          }
        }
    } catch (err) {
        toast.error("Bridge Link Failure");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-background">
        <motion.div 
            className="gradient-blob g1"
            animate={{ x: mousePos.x, y: mousePos.y }}
        />
        <motion.div 
            className="gradient-blob g2"
            animate={{ x: -mousePos.x, y: -mousePos.y }}
        />
        <div className="grid-overlay"></div>
        <div className="noise-texture"></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "circOut" }}
        className="auth-container"
      >
        <div className="auth-side-branding">
           <div className="brand-header">
              <div className="brand-logo">
                <Code2 size={24} />
              </div>
              <span className="brand-name">Code Sight</span>
           </div>

           <div className="tech-visual-stack">
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="visual-item">
                 <div className="v-icon"><Cpu size={18} /></div>
                 <div className="v-info">
                    <h4>Neural Engine</h4>
                    <p>Processing Active...</p>
                 </div>
              </motion.div>
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="visual-item">
                 <div className="v-icon"><Database size={18} /></div>
                 <div className="v-info">
                    <h4>Data Sync</h4>
                    <p>PostgreSQL Secure</p>
                 </div>
              </motion.div>
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="visual-item">
                 <div className="v-icon"><Activity size={18} /></div>
                 <div className="v-info">
                    <h4>Core Status</h4>
                    <p>Optimal Performance</p>
                 </div>
              </motion.div>
           </div>

           <div className="brand-footer">
              <p>v2.4.0 High-Availability Node</p>
           </div>
        </div>

        <div className="auth-content">
          <div className="auth-header">
            <motion.div 
                key={isLogin ? 'login-icon' : 'signup-icon'}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                className="header-icon"
            >
                {isLogin ? <ShieldCheck size={40} color="#fbbf24" opacity={0.8} /> : <Terminal size={40} color="#fbbf24" opacity={0.8} />}
            </motion.div>
            <h2>{isLogin ? 'Welcome Back' : 'Create Identity'}</h2>
            <p className="subtitle">{isLogin ? 'Resume your engineering workflow.' : 'Register your cryptographic profile.'}</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form-v2">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  key="user-grp"
                  initial={{ opacity: 0, y: -20, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: 'auto' }}
                  exit={{ opacity: 0, y: -20, height: 0 }}
                  style={{ overflow: 'hidden' }}
                  className="input-group"
                >
                  <label>CODENAME</label>
                  <div className="input-container">
                    <User className="input-icon" size={20} />
                    <input 
                        type="text" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} 
                        placeholder="architect_null"
                        required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-group">
              <label>CREDENTIAL HUB</label>
              <div className="input-container">
                <Mail className="input-icon" size={20} />
                <input 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="engineer@codesight.io"
                    required
                />
              </div>
            </div>

            <div className="input-group">
              <label>SECURITY KEY</label>
              <div className="input-container">
                <Lock className="input-icon" size={20} />
                <input 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="••••••••••••"
                    required
                />
              </div>
            </div>

            <button 
                type="submit" 
                className={`auth-btn-v2 ${isSubmitting ? 'loading' : ''}`}
                disabled={isSubmitting}
            >
              {isSubmitting ? 'Authorizing...' : (
                <>
                  {isLogin ? 'Launch Environment' : 'Confirm Identity'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              {isLogin ? "Need a new profile?" : "Already verified?"}
              <button type="button" onClick={() => setIsLogin(!isLogin)} className="toggle-btn">
                {isLogin ? 'Initiate Registration' : 'Return to Login'}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
