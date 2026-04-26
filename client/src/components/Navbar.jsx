import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import CodeBrightLogo from './CodeBrightLogo';
import './Navbar.css';

const Navbar = ({ currentPage }) => {
  const { user } = useAuth();

  return (
    <nav className="floating-nav">
      <div className="nav-container">
        <div className="logo-section">
          <CodeBrightLogo size="small" />
        </div>

        <div className="nav-links">
          <Link to="/hub" className={`nav-link-hover ${currentPage === 'home' ? 'active' : ''}`}>
            Home
          </Link>
          <Link to="/library" className={`nav-link-hover ${currentPage === 'library' ? 'active' : ''}`}>
            Library
          </Link>
          <Link to="/workspace" className={`nav-link-hover ${currentPage === 'workspace' ? 'active' : ''}`}>
            Workspace
          </Link>
          <Link to="/factions" className={`nav-link-hover ${currentPage === 'factions' ? 'active' : ''}`}>
            Factions
          </Link>
          
          {user ? (
              <Link to="/settings" className="user-profile-pill">
                <span className="profile-initial">
                  {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </span>
              </Link>
            ) : (
            <Link to="/auth" className="shiny-btn">
              Join Now
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
