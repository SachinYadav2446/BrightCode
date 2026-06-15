import React, { useState, useEffect } from 'react';
import { Calendar, Trophy, HelpCircle, Info, ChevronLeft, ChevronRight } from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ currentPage = 'home', onCollapse }) => {
  const [activeSection, setActiveSection] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
    if (onCollapse) {
      onCollapse(!isCollapsed);
    }
  };

  const navigationItems = {
    home: [
      { id: 'timeline', label: 'Timeline', icon: Calendar },
      { id: 'daily-hunt', label: 'Daily Hunt', icon: Trophy },
      { id: 'hall-of-fame', label: 'Hall of Fame', icon: Trophy },
      { id: 'about', label: 'About', icon: Info },
    ],
    workspace: [
      { id: 'projects', label: 'Projects', icon: Calendar },
      { id: 'editor', label: 'Editor', icon: Calendar },
      { id: 'resources', label: 'Resources', icon: Calendar },
      { id: 'about', label: 'About', icon: Info },
    ],
    library: [
      { id: 'browse', label: 'Browse', icon: Calendar },
      { id: 'saved', label: 'Saved', icon: Calendar },
      { id: 'history', label: 'History', icon: Calendar },
      { id: 'about', label: 'About', icon: Info },
    ],
    guild: [
      { id: 'members', label: 'Members', icon: Calendar },
      { id: 'missions', label: 'Missions', icon: Trophy },
      { id: 'ranking', label: 'Ranking', icon: Trophy },
      { id: 'about', label: 'About', icon: Info },
    ],
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(sectionId);
    }
  };

  // Update active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = navigationItems[currentPage] || [];
      let currentSection = '';

      sections.forEach((item) => {
        const element = document.getElementById(item.id);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            currentSection = item.id;
          }
        }
      });

      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [currentPage]);

  const currentItems = navigationItems[currentPage] || navigationItems.home;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        {!isCollapsed && <span className="sidebar-title">Navigation</span>}
        <button className="sidebar-toggle" onClick={toggleSidebar}>
          {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
      <nav className="sidebar-nav">
        <ul className="sidebar-nav-list">
          {currentItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.id} className="sidebar-nav-item">
                <button
                  className={`sidebar-nav-button ${activeSection === item.id ? 'active' : ''}`}
                  onClick={() => scrollToSection(item.id)}
                  title={isCollapsed ? item.label : ''}
                >
                  <Icon size={18} />
                  {!isCollapsed && <span>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
