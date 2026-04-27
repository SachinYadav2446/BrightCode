import React, { useState, useEffect } from 'react';
import { ArrowRight, Plus, Users, X, Copy, Check, Clock, Crown, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import './Workspace.css';

// Generate unique workspace ID
const generateWorkspaceId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 6);
  return `ws-${timestamp}-${random}`;
};

const Workspace = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [workspaceName, setWorkspaceName] = useState('');
  const [joinId, setJoinId] = useState('');
  const [createdWorkspace, setCreatedWorkspace] = useState(null);
  const [copied, setCopied] = useState(false);
  const [workspaceHistory, setWorkspaceHistory] = useState([]);
  const [activeRooms, setActiveRooms] = useState([]);

  // Force scroll to top on mount to prevent jumping to history
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Load workspace history and active rooms on mount
  useEffect(() => {
    const historyKey = `workspaceHistory_${user?.username || 'guest'}`;
    const history = JSON.parse(localStorage.getItem(historyKey) || '[]');
    setWorkspaceHistory(history);

    // Fetch active rooms from server
    const fetchActiveRooms = async () => {
      try {
        const response = await fetch('http://localhost:5050/active-rooms');
        const data = await response.json();
        setActiveRooms(data);
      } catch (err) {
        console.error('Failed to fetch active rooms:', err);
      }
    };

    fetchActiveRooms();
    // Refresh every 10 seconds to keep the list updated
    const interval = setInterval(fetchActiveRooms, 10000);
    return () => clearInterval(interval);
  }, []);

  // Save workspace to history
  const saveToHistory = (workspaceId, workspaceName, isAdmin) => {
    const newEntry = {
      id: workspaceId,
      name: workspaceName,
      lastVisited: new Date().toISOString(),
      isAdmin: isAdmin,
      visitCount: 1
    };

    const historyKey = `workspaceHistory_${user?.username || 'guest'}`;
    const existingHistory = JSON.parse(localStorage.getItem(historyKey) || '[]');
    
    // Remove if already exists
    const filteredHistory = existingHistory.filter(item => item.id !== workspaceId);
    
    // Add new entry at the beginning
    const updatedHistory = [newEntry, ...filteredHistory].slice(0, 10);
    
    localStorage.setItem(historyKey, JSON.stringify(updatedHistory));
    setWorkspaceHistory(updatedHistory);
  };

  // Format time ago
  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleCreateWorkspace = () => {
    if (!workspaceName.trim()) return;
    
    // Generate unique workspace ID
    const workspaceId = generateWorkspaceId();
    
    // Get current user info
    const currentUser = localStorage.getItem('username') || 'User-' + Math.random().toString(36).substr(2, 4);
    
    // Store workspace info in localStorage
    const workspaceData = {
      id: workspaceId,
      name: workspaceName,
      createdAt: new Date().toISOString(),
      admin: currentUser,
      members: [currentUser]
    };
    
    // Save to localStorage
    const existingWorkspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
    existingWorkspaces.push(workspaceData);
    localStorage.setItem('workspaces', JSON.stringify(existingWorkspaces));
    
    // Set current workspace and admin status
    localStorage.setItem('currentWorkspace', workspaceId);
    localStorage.setItem(`workspace_${workspaceId}_isAdmin`, 'true');
    localStorage.setItem(`workspace_${workspaceId}_userRole`, 'admin');
    
    // Show created workspace info
    setCreatedWorkspace(workspaceData);
  };

  const handleCopyId = () => {
    if (createdWorkspace) {
      navigator.clipboard.writeText(createdWorkspace.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleEnterWorkspace = () => {
    if (createdWorkspace) {
      saveToHistory(createdWorkspace.id, createdWorkspace.name, true);
      navigate(`/editor/${createdWorkspace.id}`);
    }
  };

  const handleJoinWorkspace = () => {
    if (!joinId.trim()) return;
    
    // Check if workspace exists
    const existingWorkspaces = JSON.parse(localStorage.getItem('workspaces') || '[]');
    const workspace = existingWorkspaces.find(ws => ws.id === joinId.trim());
    
    if (workspace) {
      // Get current user
      const currentUser = localStorage.getItem('username') || 'User-' + Math.random().toString(36).substr(2, 4);
      
      // Add user to workspace members if not already present
      if (!workspace.members.includes(currentUser)) {
        workspace.members.push(currentUser);
        localStorage.setItem('workspaces', JSON.stringify(existingWorkspaces));
      }
      
      // Set current workspace and member status
      localStorage.setItem('currentWorkspace', joinId.trim());
      localStorage.setItem(`workspace_${joinId.trim()}_isAdmin`, 'false');
      localStorage.setItem(`workspace_${joinId.trim()}_userRole`, 'member');
      
      // Navigate to editor
      saveToHistory(workspace.id, workspace.name, false);
      navigate(`/editor/${joinId.trim()}`);
    } else {
      alert('Workspace not found. Please check the ID and try again.');
    }
  };

  return (
    <div className="workspace-page">
      <Navbar currentPage="workspace" />
      
      {/* Hero Section */}
      <section className="workspace-hero">
        <div className="hero-content">
          <h1>Build Your <span className="highlight">Dream Project</span></h1>
          <p>The ultimate cloud-based workspace for modern developers</p>
          <div className="cta-buttons">
            <button className="cta-button primary" onClick={() => {setShowCreateModal(true); setWorkspaceName(''); setCreatedWorkspace(null);}}>
              <Plus size={20} /> Create Workspace
            </button>
            <button className="cta-button secondary" onClick={() => {setShowJoinModal(true); setJoinId('');}}>
              <Users size={20} /> Join Workspace
            </button>
          </div>
        </div>
      </section>

      {/* Create Workspace Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowCreateModal(false)}>
              <X size={20} />
            </button>
            {!createdWorkspace ? (
              <>
                <h3 className="modal-title">Create New Workspace</h3>
                <p className="modal-desc">Give your workspace a name to get started</p>
                <input
                  type="text"
                  className="modal-input"
                  placeholder="My Awesome Project"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreateWorkspace()}
                  autoFocus
                />
                <button 
                  className="modal-button primary" 
                  onClick={handleCreateWorkspace}
                  disabled={!workspaceName.trim()}
                >
                  Create Workspace
                </button>
              </>
            ) : (
              <>
                <div className="modal-success">
                  <Check size={48} className="success-icon" />
                </div>
                <h3 className="modal-title">Workspace Created!</h3>
                <p className="modal-desc">Share this ID with your team to collaborate</p>
                <div className="workspace-id-box">
                  <code className="workspace-id">{createdWorkspace.id}</code>
                  <button className="copy-button" onClick={handleCopyId}>
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <button className="modal-button primary" onClick={handleEnterWorkspace}>
                  Enter Workspace <ArrowRight size={18} />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Join Workspace Modal */}
      {showJoinModal && (
        <div className="modal-overlay" onClick={() => setShowJoinModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowJoinModal(false)}>
              <X size={20} />
            </button>
            <h3 className="modal-title">Join Workspace</h3>
            <p className="modal-desc">Enter the workspace ID shared by your teammate</p>
            <input
              type="text"
              className="modal-input"
              placeholder="ws-abc123-def456"
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleJoinWorkspace()}
              autoFocus
            />
            <button 
              className="modal-button secondary" 
              onClick={handleJoinWorkspace}
              disabled={!joinId.trim()}
            >
              Join Workspace
            </button>
          </div>
        </div>
      )}

      {/* Workspace History Section */}
      <section className="workspace-history">
        <div className="history-container">
          <h2 className="history-title">Recent Workspaces</h2>
          <p className="history-subtitle">Quick access to your recent projects</p>
          
          {workspaceHistory.length > 0 ? (
            <div className="history-table-wrap">
              <table className="history-table">
                <thead>
                    <tr>
                      <th>Role</th>
                      <th>Name</th>
                      <th>Workspace ID</th>
                      <th>Last Visited</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workspaceHistory.map((workspace) => (
                      <tr key={workspace.id}>
                        <td>
                          <span className={`table-role ${workspace.isAdmin ? 'admin' : 'member'}`}>
                            {workspace.isAdmin ? <Crown size={14} /> : <User size={14} />}
                            {workspace.isAdmin ? 'Admin' : 'Member'}
                          </span>
                        </td>
                        <td className="table-name">{workspace.name}</td>
                        <td><code className="table-id">{workspace.id}</code></td>
                        <td className="table-time">
                          <Clock size={14} />
                          <span>{formatTimeAgo(workspace.lastVisited)}</span>
                        </td>
                        <td>
                          {activeRooms.includes(workspace.id) ? (
                            <button 
                              className="table-action-btn" 
                              onClick={() => navigate(`/editor/${workspace.id}`)}
                            >
                              Resume <ArrowRight size={14} />
                            </button>
                          ) : (
                            <span className="session-ended-label">
                              Session Ended
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
              </table>
            </div>
          ) : (
            <div className="history-empty">
              <Clock size={48} className="empty-clock-icon" />
              <h3>No workspaces yet</h3>
              <p>Create or join a workspace to get started. Your recent workspaces will appear here.</p>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default Workspace;
