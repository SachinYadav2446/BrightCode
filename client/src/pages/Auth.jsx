import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import './Auth.css';

const API = API_URL;

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [typedCode, setTypedCode] = useState("");

  const codeSnippet = `// Active Arena Duel //
function resolveConflict(factionA, factionB) {
  const union = new Set([...factionA, ...factionB]);
  return Array.from(union).sort((a, b) => b.xp - a.xp);
}`;

  // Live code typing simulation resembling actual Monaco editor workspaces
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < codeSnippet.length) {
        setTypedCode(codeSnippet.substring(0, index + 1));
        index++;
      } else {
        // Hold on completed state, then loop back
        clearInterval(interval);
        setTimeout(() => {
          index = 0;
          setTypedCode("");
        }, 4000);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [typedCode]);

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
  }, [location.search, navigate]);

  return (
    <div className="auth-page-centered">
      {/* Back to Home Button */}
      <div className="back-to-home-global" onClick={() => navigate('/')}>
        <ChevronLeft size={16} />
        <span>Back to Home</span>
      </div>

      {/* Elegant Radial Background Orbs */}
      <div className="auth-glow-bg">
        <div className="glow-orb orb-1"></div>
        <div className="glow-orb orb-2"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="auth-glass-card"
      >
        {/* Left Side: Product Demo Simulator */}
        <div className="auth-card-left">
          <div className="left-inner">
            <div className="brand-badge-mini">BRIGHTCODE PLATFORM</div>
            <h1 className="left-hero-title">
              Code. Compete.<br />
              <span className="scarlet-flare-text">Dominate.</span>
            </h1>
            <p className="left-hero-desc">
              Connect to the multiplayer coding core. Engage in speed battles, collaborate in real-time Monaco workspaces, and climb the ranks.
            </p>

            {/* Premium Minimalist Editor Simulator */}
            <div className="premium-editor-sim">
              <div className="sim-editor-header">
                <div className="mac-dots">
                  <span className="mac-dot red"></span>
                  <span className="mac-dot yellow"></span>
                  <span className="mac-dot green"></span>
                </div>
                <span className="sim-tab-active">resolve_duel.js</span>
              </div>
              <div className="sim-editor-content">
                <pre>
                  <code>
                    {typedCode}
                    <span className="cursor-blink">|</span>
                  </code>
                </pre>
              </div>
              <div className="sim-editor-footer">
                <span className="footer-status-text">✓ Ready to compile</span>
                <span className="footer-xp-pill">+150 XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Portal */}
        <div className="auth-card-right">
          <div className="right-inner">
            <div className="auth-logo-header">
              <div className="brand-logo-text">Bright<span>Code</span></div>
              <p className="brand-subtitle">THE MULTIPLAYER CODING ARENA</p>
            </div>

            <div className="auth-intro-text">
              <h2>Access Gateway</h2>
              <p>Authorize your developer profile to enter workspaces, document projects, and fight in duels.</p>
            </div>

            <div className="social-actions-list">
              <button
                type="button"
                className="classy-social-btn google"
                onClick={() => window.location.href = `${API}/api/auth/google`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="provider-icon">
                  <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.41 0-6.19-2.78-6.19-6.19s2.78-6.19 6.19-6.19c1.7 0 3.25.69 4.38 1.81l3.02-3.02C19.14 1.76 15.91 0 12.24 0 5.58 0 0 5.58 0 12.24s5.58 12.24 12.24 12.24c6.98 0 12.24-4.8 12.24-12.24 0-.78-.07-1.53-.2-2.255H12.24z"/>
                </svg>
                <span>Sign in with Google</span>
              </button>

              <button
                type="button"
                className="classy-social-btn github"
                onClick={() => window.location.href = `${API}/api/auth/github`}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="provider-icon">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.11.82-.26.82-.577v-2.234c-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.372.82 1.102.82 2.222v3.293c0 .319.22.694.825.576C20.565 21.795 24 17.3 24 12c0-6.63-5.37-12-12-12z"/>
                </svg>
                <span>Sign in with GitHub</span>
              </button>
            </div>

            <div className="auth-card-footer">
              <p>Secure authentication powered by OAuth 2.0 protocol.</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
