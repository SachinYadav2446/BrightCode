import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Layout, Swords, LifeBuoy, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './MobileBottomNav.css';

const MobileBottomNav = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Hide bottom nav on specific routes (e.g. editor, auth, landing)
    const hiddenRoutes = ['/auth', '/editor', '/proctor', '/build'];
    const isLanding = location.pathname === '/';
    const shouldHide = hiddenRoutes.some(route => location.pathname.startsWith(route)) || isLanding;

    if (shouldHide || !user) return null;

    const navItems = [
        { path: '/hub', icon: <Home size={22} />, label: 'Home' },
        { path: '/workspace', icon: <Layout size={22} />, label: 'Workspace' },
        { path: '/code-wars', icon: <Swords size={22} />, label: 'Arena' },
        { path: '/nexus', icon: <LifeBuoy size={22} />, label: 'Nexus' },
        { path: `/u/${user.username}`, icon: <User size={22} />, label: 'Profile' },
    ];

    return (
        <div className="mobile-bottom-nav">
            <div className="mobile-bottom-nav-inner">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path || 
                                     (item.path !== '/hub' && location.pathname.startsWith(item.path));
                    
                    return (
                        <button
                            key={item.label}
                            className={`mobile-nav-btn ${isActive ? 'active' : ''}`}
                            onClick={() => navigate(item.path)}
                        >
                            <div className="mobile-nav-icon">
                                {item.icon}
                                {isActive && <div className="mobile-nav-indicator" />}
                            </div>
                            <span className="mobile-nav-label">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default MobileBottomNav;
