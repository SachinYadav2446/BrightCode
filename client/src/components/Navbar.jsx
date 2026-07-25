import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import CodeBrightLogo from './CodeBrightLogo';
import FriendsDrawer from './FriendsDrawer';
import axios from 'axios';
import { motion } from 'framer-motion';
import { 
  Users, 
  Menu,
  X,
  Home,
  BookOpen,
  Terminal,
  Lock,
  Shield,
  Compass
} from 'lucide-react';
import './Navbar.css';
import './FriendsDrawer.css';

const API = API_URL;

const NAV_ITEMS = [
  { id: 'home', label: 'Home', path: '/hub', icon: Home },
  { id: 'library', label: 'Library', path: '/library', icon: BookOpen },
  { id: 'workspace', label: 'Workspace', path: '/workspace', icon: Terminal },
  { id: 'codevault', label: 'Vault', path: '/codevault', icon: Lock },
  { id: 'factions', label: 'Factions', path: '/factions', icon: Shield },
  { id: 'nexus', label: 'The Nexus', path: '/nexus', icon: Compass },
];

const Navbar = () => {
  const { user, friendsDrawerOpen, setFriendsDrawerOpen } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    sessionStorage.setItem('drawerOpen', friendsDrawerOpen);
  }, [friendsDrawerOpen]);

  const getActivePage = () => {
    const path = location.pathname;
    if (path.startsWith('/hub')) return 'home';
    if (path.startsWith('/library')) return 'library';
    if (path.startsWith('/workspace') || path.startsWith('/proctor')) return 'workspace';
    if (path.startsWith('/codevault')) return 'codevault';
    if (path.startsWith('/factions')) return 'factions';
    if (path.startsWith('/contribute')) return 'contribute';
    if (path.startsWith('/nexus')) return 'nexus';
    if (path.startsWith('/user-guide')) return 'guide';
    return '';
  };

  const currentPage = getActivePage();

  // Poll for incoming friend requests count
  useEffect(() => {
    if (!user?.token) return;
    const fetchPending = async () => {
      try {
        const { data } = await axios.get(`${API}/friends`, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        setPendingCount((data.incoming || []).length);
      } catch (e) {}
    };
    fetchPending();
    const interval = setInterval(fetchPending, 30000);
    return () => clearInterval(interval);
  }, [user?.token]);

  return (
    <>
      <motion.nav 
        className="floating-nav"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="nav-container">

          {/* LEFT: Logo */}
          <div className="nav-left">
            <CodeBrightLogo size="small" />
          </div>

          {/* CENTER: Nav links with spring sliding indicator */}
          <div className="nav-center">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Link
                  key={item.id}
                  to={item.path}
                  className={`nav-link-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={14} className="nav-link-icon" />
                  <span>{item.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeNavPill"
                      className="nav-active-bg"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </Link>
              );
            })}
          </div>

          {/* RIGHT: Actions */}
          <div className="nav-right">
            {user && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.94 }}
                className={`fd-nav-btn ${(pendingCount > 0 || hasUnread) ? 'has-requests' : ''}`}
                onClick={() => { setFriendsDrawerOpen(true); setHasUnread(false); }}
                title="Allies"
              >
                <Users size={15} />
                {(pendingCount > 0 || hasUnread) && <span className="fd-nav-dot" />}
              </motion.button>
            )}

            {user ? (
              <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
                <Link to="/settings" className="user-profile-pill">
                  <span className="profile-initial">
                    {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                  </span>
                </Link>
              </motion.div>
            ) : (
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link to="/auth" className="shiny-btn">Join Now</Link>
              </motion.div>
            )}

            {/* Mobile Hamburger toggle */}
            <button
              className="nav-mobile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>

        {/* Mobile menu dropdown drawer */}
        {menuOpen && (
          <div className="nav-mobile-menu">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              return (
                <Link 
                  key={item.id}
                  to={item.path} 
                  className={`nav-mobile-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={16} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </motion.nav>

      <FriendsDrawer open={friendsDrawerOpen} onClose={() => setFriendsDrawerOpen(false)} onUnread={() => { if (!friendsDrawerOpen) setHasUnread(true); }} />
    </>
  );
};

export default Navbar;
