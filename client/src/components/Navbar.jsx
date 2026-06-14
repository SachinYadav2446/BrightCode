import API_URL from '../config';
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useLocation } from 'react-router-dom';
import CodeBrightLogo from './CodeBrightLogo';
import FriendsDrawer from './FriendsDrawer';
import axios from 'axios';
import { Users } from 'lucide-react';
import './Navbar.css';
import './FriendsDrawer.css';

const API = API_URL;

const Navbar = () => {
  const { user, friendsDrawerOpen, setFriendsDrawerOpen } = useAuth();
  const location = useLocation();
  const [pendingCount, setPendingCount] = useState(0);
  const [hasUnread, setHasUnread] = useState(false);

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
      <nav className="floating-nav">
        <div className="nav-container">

          {/* LEFT: Logo */}
          <div className="nav-left">
            <CodeBrightLogo size="small" />
          </div>

          {/* CENTER: Nav links */}
          <div className="nav-center">
            <Link to="/hub"       className={`nav-link-hover ${currentPage === 'home'      ? 'active' : ''}`}>Home</Link>
            <Link to="/library"   className={`nav-link-hover ${currentPage === 'library'   ? 'active' : ''}`}>Library</Link>
            <Link to="/workspace" className={`nav-link-hover ${currentPage === 'workspace' ? 'active' : ''}`}>Workspace</Link>
            <Link to="/codevault" className={`nav-link-hover ${currentPage === 'codevault' ? 'active' : ''}`}>Vault</Link>
            <Link to="/factions"  className={`nav-link-hover ${currentPage === 'factions'  ? 'active' : ''}`}>Factions</Link>
          </div>

          {/* RIGHT: Actions */}
          <div className="nav-right">
            {user && (
              <button
                className={`fd-nav-btn ${(pendingCount > 0 || hasUnread) ? 'has-requests' : ''}`}
                onClick={() => { setFriendsDrawerOpen(true); setHasUnread(false); }}
                title="Allies"
              >
                <Users size={15} />
                {(pendingCount > 0 || hasUnread) && <span className="fd-nav-dot" />}
              </button>
            )}

            {user ? (
              <Link to="/settings" className="user-profile-pill">
                <span className="profile-initial">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </span>
              </Link>
            ) : (
              <Link to="/auth" className="shiny-btn">Join Now</Link>
            )}
          </div>

        </div>
      </nav>

      <FriendsDrawer open={friendsDrawerOpen} onClose={() => setFriendsDrawerOpen(false)} onUnread={() => { if (!friendsDrawerOpen) setHasUnread(true); }} />
    </>
  );
};

export default Navbar;
