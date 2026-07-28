import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Swords, Code2, ArrowLeft, Users, Clock, Zap, Trophy, Lock, Globe, UserCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import './ArenaLobby.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ArenaLobby = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const gameId = searchParams.get('game');
  
  const [activeTab, setActiveTab] = useState('create'); // 'create' or 'join'
  const [createForm, setCreateForm] = useState({
    name: '',
    players: '1v1',
    duration: '15',
    difficulty: 'medium',
    language: 'javascript',
    timeLimit: '300'
  });

  // Active arenas from API
  const [activeArenas, setActiveArenas] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch active arenas when Join tab is selected
  useEffect(() => {
    if (activeTab === 'join') {
      fetchActiveArenas();
    }
  }, [activeTab, gameId]);

  const fetchActiveArenas = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/arena/active`, {
        params: { game: gameId }
      });
      setActiveArenas(response.data.arenas || []);
    } catch (error) {
      console.error('Error fetching active arenas:', error);
      toast.error('Failed to load active arenas');
      setActiveArenas([]);
    } finally {
      setLoading(false);
    }
  };

  const games = {
    'syntax-showdown': {
      title: 'Syntax Showdown',
      icon: Swords,
      gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      players: ['1v1', '2v2', '4v4'],
      durations: ['5', '15', '30', '60'],
      difficulties: ['easy', 'medium', 'hard']
    },
    'algorithm-duel': {
      title: 'Algorithm Duel',
      icon: Zap,
      gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      players: ['1v1'],
      durations: ['10', '20'],
      difficulties: ['medium', 'hard']
    },
    'hackathon-hub': {
      title: 'Hackathon Hub',
      icon: Trophy,
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      players: ['2v2', '4v4'],
      durations: ['20', '30', '60'],
      difficulties: ['easy', 'medium', 'hard']
    },
    'faction-wars': {
      title: 'Faction Wars',
      icon: Users,
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      players: ['4v4'],
      durations: ['30', '60'],
      difficulties: ['medium', 'hard']
    }
  };

  const currentGame = games[gameId] || games['syntax-showdown'];
  const Icon = currentGame.icon;

  useEffect(() => {
    // Initialize form with game-specific defaults
    setCreateForm(prev => ({
      ...prev,
      players: currentGame.players[0],
      duration: currentGame.durations[0],
      difficulty: currentGame.difficulties[0]
    }));
  }, [gameId]);

  const handleCreateArena = (e) => {
    e.preventDefault();
    // TODO: API call to create arena
    console.log('Creating arena:', { game: gameId, ...createForm });
    
    // Make API call to create arena
    axios.post(`${API_URL}/arena/create`, {
      game: gameId,
      ...createForm,
      creatorId: user._id,
      creatorUsername: user.username
    })
    .then(response => {
      toast.success('Arena created successfully!');
      navigate(`/code-wars?arena=${response.data.arenaId || gameId}`);
    })
    .catch(error => {
      console.error('Error creating arena:', error);
      toast.error(error.response?.data?.message || 'Failed to create arena');
    });
  };

  const handleJoinArena = (e) => {
    e.preventDefault();
    const arenaCode = e.target.arenaCode.value;
    
    // Make API call to join arena by code
    axios.post(`${API_URL}/arena/join`, {
      arenaCode,
      userId: user._id,
      username: user.username
    })
    .then(response => {
      toast.success('Joined arena successfully!');
      navigate(`/code-wars?join=${arenaCode}`);
    })
    .catch(error => {
      console.error('Error joining arena:', error);
      toast.error(error.response?.data?.message || 'Failed to join arena');
    });
  };

  const handleJoinArenaById = (arenaId, arenaCode) => {
    // Make API call to join arena by ID
    axios.post(`${API_URL}/arena/join`, {
      arenaId,
      arenaCode,
      userId: user._id,
      username: user.username
    })
    .then(response => {
      toast.success('Joined arena successfully!');
      navigate(`/code-wars?join=${arenaCode}`);
    })
    .catch(error => {
      console.error('Error joining arena:', error);
      toast.error(error.response?.data?.message || 'Failed to join arena');
    });
  };

  return (
    <div className="arena-lobby-page">
      {/* Background */}
      <div className="lobby-bg">
        <div className="lobby-grid"></div>
        <div className="lobby-glow"></div>
      </div>

      {/* Header */}
      <header className="lobby-header">
        <button className="back-btn" onClick={() => navigate('/battle-arena')}>
          <ArrowLeft size={20} />
          <span>Back to Arena</span>
        </button>
        <div className="game-badge" style={{ background: currentGame.gradient }}>
          <Icon size={20} />
          <span>{currentGame.title}</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="lobby-content">
        <div className="lobby-container">
          {/* Tab Switcher */}
          <div className="tab-switcher">
            <button 
              className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
              onClick={() => setActiveTab('create')}
              style={activeTab === 'create' ? { background: currentGame.gradient } : {}}
            >
              <Swords size={18} />
              <span>Create Arena</span>
            </button>
            <button 
              className={`tab-btn ${activeTab === 'join' ? 'active' : ''}`}
              onClick={() => setActiveTab('join')}
              style={activeTab === 'join' ? { background: currentGame.gradient } : {}}
            >
              <Code2 size={18} />
              <span>Join Arena</span>
            </button>
          </div>

          {/* Create Arena Form */}
          {activeTab === 'create' && (
            <form className="lobby-form" onSubmit={handleCreateArena}>
              <h2 className="form-title">Setup Your Battle Arena</h2>
              
              <div className="form-group">
                <label>Arena Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  placeholder="e.g., Epic Battle Arena"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Players</label>
                  <select
                    value={createForm.players}
                    onChange={(e) => setCreateForm({...createForm, players: e.target.value})}
                  >
                    {currentGame.players.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (min)</label>
                  <select
                    value={createForm.duration}
                    onChange={(e) => setCreateForm({...createForm, duration: e.target.value})}
                  >
                    {currentGame.durations.map(d => (
                      <option key={d} value={d}>{d} min</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Difficulty</label>
                  <select
                    value={createForm.difficulty}
                    onChange={(e) => setCreateForm({...createForm, difficulty: e.target.value})}
                  >
                    {currentGame.difficulties.map(d => (
                      <option key={d} value={d}>{d.charAt(0).toUpperCase() + d.slice(1)}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Language</label>
                  <select
                    value={createForm.language}
                    onChange={(e) => setCreateForm({...createForm, language: e.target.value})}
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="go">Go</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Time Limit per Problem (seconds)</label>
                <input
                  type="number"
                  value={createForm.timeLimit}
                  onChange={(e) => setCreateForm({...createForm, timeLimit: e.target.value})}
                  min="60"
                  max="600"
                />
              </div>

              <button type="submit" className="submit-btn" style={{ background: currentGame.gradient }}>
                <Swords size={20} /> Create Arena
              </button>
            </form>
          )}

          {/* Join Arena Form */}
          {activeTab === 'join' && (
            <div className="lobby-form join-section">
              <h2 className="form-title">Join an Arena</h2>
              
              {/* Join by Code */}
              <form onSubmit={handleJoinArena} className="join-by-code">
                <div className="form-group">
                  <label>Have an Arena Code?</label>
                  <div className="code-input-group">
                    <input
                      type="text"
                      name="arenaCode"
                      placeholder="e.g., ABC-123-XYZ"
                      required
                      autoComplete="off"
                      className="arena-code-input"
                    />
                    <button type="submit" className="code-submit-btn" style={{ background: currentGame.gradient }}>
                      <Code2 size={18} /> Join
                    </button>
                  </div>
                  <small>Enter the code shared by the arena creator</small>
                </div>
              </form>

              {/* Divider */}
              <div className="join-divider">
                <span>or browse active arenas</span>
              </div>

              {/* Active Arenas List */}
              <div className="active-arenas-list">
                {loading ? (
                  <div className="no-arenas">
                    <Users size={32} />
                    <p>Loading arenas...</p>
                  </div>
                ) : activeArenas.length === 0 ? (
                  <div className="no-arenas">
                    <Users size={32} />
                    <p>No active arenas found</p>
                    <small>Create one or check back later!</small>
                  </div>
                ) : (
                  activeArenas.map(arena => (
                    <div key={arena._id || arena.id} className="arena-card">
                      <div className="arena-card-header">
                        <div className="arena-info">
                          <h3>{arena.name}</h3>
                          <span className="arena-creator">by {arena.creatorUsername || arena.creator}</span>
                        </div>
                        {arena.isPrivate ? (
                          <div className="privacy-badge private">
                            <Lock size={14} />
                            <span>Private</span>
                          </div>
                        ) : (
                          <div className="privacy-badge public">
                            <Globe size={14} />
                            <span>Public</span>
                          </div>
                        )}
                      </div>

                      <div className="arena-details">
                        <div className="arena-detail-item">
                          <Users size={16} />
                          <span>{arena.players}</span>
                        </div>
                        <div className="arena-detail-item">
                          <Zap size={16} />
                          <span>{arena.difficulty}</span>
                        </div>
                        <div className="arena-detail-item">
                          <Code2 size={16} />
                          <span>{arena.language}</span>
                        </div>
                      </div>

                      <div className="arena-card-footer">
                        <div className="member-count">
                          <UserCheck size={18} />
                          <span>{arena.activeMembers || arena.participants?.length || 0}/{arena.maxMembers} Active</span>
                        </div>
                        <button 
                          className="join-arena-card-btn"
                          onClick={() => handleJoinArenaById(arena._id || arena.id, arena.code || arena.arenaCode)}
                          disabled={(arena.activeMembers || arena.participants?.length || 0) >= arena.maxMembers}
                          style={(arena.activeMembers || arena.participants?.length || 0) < arena.maxMembers ? { background: currentGame.gradient } : {}}
                        >
                          {(arena.activeMembers || arena.participants?.length || 0) >= arena.maxMembers ? 'Full' : 'Join'}
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ArenaLobby;
