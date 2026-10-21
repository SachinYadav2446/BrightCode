import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  ChevronLeft, 
  GraduationCap, 
  ShieldCheck, 
  Code2, 
  Building2, 
  User, 
  Lock, 
  ArrowRight, 
  Sparkles 
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Auth.css';

const API = API_URL;

const Auth = ({ defaultTab = 'student' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setSessionUser } = useAuth();
  
  // Tab state: 'student' | 'faculty' | 'dev'
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [orgs, setOrgs] = useState([]);
  const [selectedOrgCode, setSelectedOrgCode] = useState('APEX');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  // A simple syntax highlighter for the simulated Monaco preview
  const highlightCode = (rawCode) => {
    if (!rawCode) return null;
    const lines = rawCode.split("\n");
    return lines.map((line, idx) => {
      if (line.trim().startsWith("//")) {
        return <div key={idx} className="code-line comment">{line}</div>;
      }
      return (
        <div key={idx} className="code-line">
          {line.split(/(\s+)/).map((word, wIdx) => {
            const cleanWord = word.trim();
            if (["function", "const", "return", "new"].includes(cleanWord)) {
              return <span key={wIdx} className="token-keyword">{word}</span>;
            }
            if (["Set", "Array", "sort", "from"].includes(cleanWord)) {
              return <span key={wIdx} className="token-builtin">{word}</span>;
            }
            if (cleanWord.startsWith("resolveConflict")) {
              return <span key={wIdx} className="token-function">{word}</span>;
            }
            return word;
          })}
        </div>
      );
    });
  };

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

  // Sync tab with URL parameters if provided (e.g. /auth?tab=student or ?tab=faculty)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabParam = params.get('tab') || params.get('role');
    if (tabParam && ['student', 'faculty', 'dev'].includes(tabParam.toLowerCase())) {
      setActiveTab(tabParam.toLowerCase());
    } else if (defaultTab) {
      setActiveTab(defaultTab);
    }
  }, [location.search, defaultTab]);

  // Fetch list of registered institutions
  useEffect(() => {
    fetch(`${API}/api/college/orgs/public`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.organizations?.length > 0) {
          setOrgs(data.organizations);
          const params = new URLSearchParams(location.search);
          const orgParam = params.get('org');
          if (orgParam) {
            setSelectedOrgCode(orgParam.toUpperCase());
          } else {
            setSelectedOrgCode(data.organizations[0].code);
          }
        }
      })
      .catch(() => {});
  }, [location.search]);

  // Quick autofill for demo testing
  const handleDemoFill = (type) => {
    setSelectedOrgCode('APEX');
    if (type === 'faculty') {
      setActiveTab('faculty');
      setIdentifier('prof_sharma');
      setPassword('Admin@123');
      toast.success('Filled Demo Faculty Coordinator (prof_sharma)');
    } else {
      setActiveTab('student');
      setIdentifier('21CS001');
      setPassword('Bright@21CS001');
      toast.success('Filled Demo Student (21CS001)');
    }
  };

  // Institutional student and faculty authentication
  const handleInstitutionalLogin = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      toast.error('Please enter your credentials and password');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/api/college/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgCode: selectedOrgCode,
          identifier: identifier.trim(),
          password: password.trim()
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      // Persist auth tokens & institutional fields
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.user.username);
      localStorage.setItem('email', data.user.email);
      localStorage.setItem('user_role', data.user.role);
      localStorage.setItem('college_org_id', data.user.orgId);
      localStorage.setItem('college_org_name', data.user.orgName);
      localStorage.setItem('college_org_code', data.user.orgCode);
      localStorage.setItem('college_roll_no', data.user.rollNo || '');
      localStorage.setItem('college_branch', data.user.branch || '');
      localStorage.setItem('college_batch', data.user.batch || '');
      localStorage.setItem('user_subscription', data.user.subscription || 'campus_student');
      localStorage.setItem('session_start', String(Date.now()));

      if (setSessionUser) {
        setSessionUser({
          id: data.user.id,
          _id: data.user.id,
          token: data.token,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role,
          subscription: data.user.subscription || 'campus_student',
          orgId: data.user.orgId,
          orgName: data.user.orgName,
          orgCode: data.user.orgCode,
          rollNo: data.user.rollNo,
          branch: data.user.branch,
          batch: data.user.batch
        });
      }

      toast.success(`Welcome back, ${data.user.name || data.user.username}!`);

      if (data.user.role === 'college_admin' || data.user.role === 'super_admin') {
        navigate('/college-admin');
      } else {
        navigate('/hub');
      }
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-centered">
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
          {/* Back to Home Button inside Card */}
          <div className="back-to-home-card" onClick={() => navigate('/')}>
            <ChevronLeft size={14} />
            <span>Back to Home</span>
          </div>

          <div className="left-inner">
            <h1 className="left-hero-title">
              Code. Compete.<br />
              <span className="scarlet-flare-text">Dominate.</span>
            </h1>
            <p className="left-hero-desc">
              Connect to the multiplayer coding core. Engage in speed battles, collaborate in real-time Monaco workspaces, and climb the ranks.
            </p>

            {/* Elegant Stats Grid */}
            <div className="left-stats-grid">
              <div className="left-stat-pill">
                <span className="pill-value">1v1 / 2v2 / 4v4</span>
                <span className="pill-label">ARENA MODES</span>
              </div>
              <div className="left-stat-pill">
                <span className="pill-value">Sub-10ms</span>
                <span className="pill-label">SYNC LATENCY</span>
              </div>
            </div>

            {/* Premium Minimalist Editor Simulator */}
            <div className="premium-editor-sim">
              <div className="sim-editor-header">
                <div className="mac-dots">
                  <span className="mac-dot red"></span>
                  <span className="mac-dot yellow"></span>
                  <span className="mac-dot green"></span>
                </div>
                <div className="sim-tabs-list">
                  <span className="tab-item active">resolve_duel.js</span>
                  <span className="tab-item">duel_system.cpp</span>
                </div>
              </div>
              <div className="sim-editor-content">
                <pre>
                  <code>
                    {highlightCode(typedCode)}
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

        {/* Right Side: Hybrid Authentication Portal */}
        <div className="auth-card-right">
          <div className="right-inner">
            <div className="auth-logo-header">
              <div className="brand-logo-text">Bright<span>Code</span></div>
              <p className="brand-subtitle">THE MULTIPLAYER CODING ARENA & CAMPUS HUB</p>
            </div>

            {/* Segmented Tab Switcher */}
            <div className="hybrid-tabs-container">
              <button
                type="button"
                className={`hybrid-tab-btn ${activeTab === 'student' ? 'active' : ''}`}
                onClick={() => { setActiveTab('student'); setIdentifier(''); setPassword(''); }}
              >
                <GraduationCap size={15} />
                <span>Student</span>
              </button>
              <button
                type="button"
                className={`hybrid-tab-btn ${activeTab === 'faculty' ? 'active' : ''}`}
                onClick={() => { setActiveTab('faculty'); setIdentifier(''); setPassword(''); }}
              >
                <ShieldCheck size={15} />
                <span>Faculty</span>
              </button>
              <button
                type="button"
                className={`hybrid-tab-btn ${activeTab === 'dev' ? 'active' : ''}`}
                onClick={() => { setActiveTab('dev'); }}
              >
                <Code2 size={15} />
                <span>Individual</span>
              </button>
            </div>

            {/* TAB 1: CAMPUS STUDENT */}
            {activeTab === 'student' && (
              <div className="hybrid-tab-content">
                <div className="auth-intro-text">
                  <h2>Campus Student Portal</h2>
                  <p>Enter your roll number or college email to access institutional exams, lab tests, and multiplayer duels.</p>
                </div>

                <form onSubmit={handleInstitutionalLogin} className="hybrid-auth-form">
                  <div className="auth-field-group">
                    <label className="auth-field-label">College / Institution</label>
                    <div className="auth-input-wrap">
                      <Building2 size={15} className="auth-field-icon" />
                      <select
                        className="auth-field-select"
                        value={selectedOrgCode}
                        onChange={e => setSelectedOrgCode(e.target.value)}
                      >
                        {orgs.map(org => (
                          <option key={org.code} value={org.code}>
                            {org.name} ({org.code})
                          </option>
                        ))}
                        {orgs.length === 0 && (
                          <option value="APEX">Apex Institute of Technology (APEX)</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-field-label">Roll Number or College Email</label>
                    <div className="auth-input-wrap">
                      <User size={15} className="auth-field-icon" />
                      <input
                        type="text"
                        className="auth-field-input"
                        placeholder="e.g. 21CS001"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-field-label">Password</label>
                    <div className="auth-input-wrap">
                      <Lock size={15} className="auth-field-icon" />
                      <input
                        type="password"
                        className="auth-field-input"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-quick-actions">
                    <button
                      type="button"
                      className="auth-demo-pill"
                      onClick={() => handleDemoFill('student')}
                    >
                      <Sparkles size={12} />
                      <span>Fill Demo Student (21CS001)</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="classy-submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Authenticating...' : 'Sign In as Student'}
                    {!loading && <ArrowRight size={15} />}
                  </button>
                </form>

                <div className="auth-card-footer">
                  <p>Pre-enrolled by institution. No external registration required.</p>
                </div>
              </div>
            )}

            {/* TAB 2: FACULTY ADMIN */}
            {activeTab === 'faculty' && (
              <div className="hybrid-tab-content">
                <div className="auth-intro-text">
                  <h2>Faculty Administrator</h2>
                  <p>Sign in to orchestrate live coding tests, monitor anti-cheat proctoring, and manage batch rosters.</p>
                </div>

                <form onSubmit={handleInstitutionalLogin} className="hybrid-auth-form">
                  <div className="auth-field-group">
                    <label className="auth-field-label">College / Institution</label>
                    <div className="auth-input-wrap">
                      <Building2 size={15} className="auth-field-icon" />
                      <select
                        className="auth-field-select"
                        value={selectedOrgCode}
                        onChange={e => setSelectedOrgCode(e.target.value)}
                      >
                        {orgs.map(org => (
                          <option key={org.code} value={org.code}>
                            {org.name} ({org.code})
                          </option>
                        ))}
                        {orgs.length === 0 && (
                          <option value="APEX">Apex Institute of Technology (APEX)</option>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-field-label">Faculty ID or Username</label>
                    <div className="auth-input-wrap">
                      <ShieldCheck size={15} className="auth-field-icon" />
                      <input
                        type="text"
                        className="auth-field-input"
                        placeholder="e.g. prof_sharma"
                        value={identifier}
                        onChange={e => setIdentifier(e.target.value)}
                        autoComplete="username"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-field-group">
                    <label className="auth-field-label">Password</label>
                    <div className="auth-input-wrap">
                      <Lock size={15} className="auth-field-icon" />
                      <input
                        type="password"
                        className="auth-field-input"
                        placeholder="••••••••••••"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                      />
                    </div>
                  </div>

                  <div className="auth-quick-actions">
                    <button
                      type="button"
                      className="auth-demo-pill"
                      onClick={() => handleDemoFill('faculty')}
                    >
                      <Sparkles size={12} />
                      <span>Fill Demo Faculty (prof_sharma)</span>
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="classy-submit-btn"
                    disabled={loading}
                  >
                    {loading ? 'Authenticating...' : 'Sign In to Faculty Portal'}
                    {!loading && <ArrowRight size={15} />}
                  </button>
                </form>

                <div className="auth-card-footer">
                  <p>Designated for authorized department heads and lab instructors.</p>
                </div>
              </div>
            )}

            {/* TAB 3: INDEPENDENT DEV */}
            {activeTab === 'dev' && (
              <div className="hybrid-tab-content">
                <div className="auth-intro-text">
                  <h2>Independent Developer</h2>
                  <p>Authorize your developer profile with OAuth to enter global multiplayer duels, workspaces, and factions.</p>
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
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
