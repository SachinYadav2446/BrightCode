import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Users, Crown, Shield, Swords, Clock, Copy, Check, X, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import API_URL from '../config';
import './ArenaWaitingRoom.css';

const ArenaWaitingRoom = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const arenaId = searchParams.get('arena');
  
  const [arena, setArena] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    if (arenaId) {
      fetchArenaDetails();
      // Poll for updates every 2 seconds
      const interval = setInterval(fetchArenaDetails, 2000);
      return () => clearInterval(interval);
    }
  }, [arenaId]);

  const fetchArenaDetails = async () => {
    try {
      // First check if this is a temp arena in sessionStorage
      if (arenaId && arenaId.startsWith('temp_')) {
        const storedArena = sessionStorage.getItem(`arena_${arenaId}`);
        if (storedArena) {
          const arenaData = JSON.parse(storedArena);
          setArena(arenaData);
          setLoading(false);
          
          // Check if arena is full and should start countdown
          const maxPlayers = parseInt(arenaData.players?.split('v').reduce((a, b) => parseInt(a) + parseInt(b), 0)) || 2;
          const currentPlayers = arenaData.participants?.length || 0;
          if (currentPlayers >= maxPlayers && !countdown) {
            startCountdown();
          }
          return;
        }
      }

      // Otherwise fetch from API
      const response = await axios.get(`${API_URL}/arena/${arenaId}`);
      setArena(response.data);
      setLoading(false);
      
      // Check if arena is full and should start countdown
      if (response.data.isFull && !countdown) {
        startCountdown();
      }
    } catch (error) {
      console.error('Error fetching arena:', error);
      
      // If API fails, try sessionStorage as fallback
      if (arenaId) {
        const storedArena = sessionStorage.getItem(`arena_${arenaId}`);
        if (storedArena) {
          const arenaData = JSON.parse(storedArena);
          setArena(arenaData);
          setLoading(false);
          return;
        }
      }
      
      toast.error('Failed to load arena details');
      setLoading(false);
    }
  };

  const startCountdown = () => {
    let count = 10;
    setCountdown(count);
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        // Navigate to actual battle
        navigate(`/code-wars?arena=${arenaId}&start=true`);
      }
    }, 1000);
  };

  const handleCopyCode = () => {
    if (arena?.code) {
      navigator.clipboard.writeText(arena.code);
      setCopied(true);
      toast.success('Arena code copied!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleLeaveArena = () => {
    // TODO: API call to leave arena
    toast.success('Left arena');
    navigate('/battle-arena');
  };

  const handleStartMatch = () => {
    // Only creator can start manually
    if (user?.username === arena?.creator) {
      navigate(`/code-wars?arena=${arenaId}&start=true`);
    }
  };

  if (loading) {
    return (
      <div className="waiting-room-page">
        <div className="waiting-loader">
          <div className="loader-spinner"></div>
          <p>Loading arena...</p>
        </div>
      </div>
    );
  }

  if (!arena) {
    return (
      <div className="waiting-room-page">
        <div className="waiting-error">
          <p>Arena not found</p>
          <button onClick={() => navigate('/battle-arena')}>Back to Arena</button>
        </div>
      </div>
    );
  }

  const teams = arena.teams || [];
  const maxPlayers = parseInt(arena.players?.split('v').reduce((a, b) => parseInt(a) + parseInt(b), 0)) || 2;
  const currentPlayers = arena.participants?.length || 0;

  return (
    <div className="waiting-room-page">
      {/* Background */}
      <div className="waiting-bg">
        <div className="waiting-grid"></div>
      </div>

      {/* Header */}
      <header className="waiting-header">
        <div className="waiting-header-left">
          <Shield size={24} className="arena-icon" />
          <div>
            <h1 className="arena-name">{arena.name}</h1>
            <div className="arena-meta">
              <span className="meta-item">{arena.players}</span>
              <span className="meta-divider">•</span>
              <span className="meta-item">{arena.difficulty}</span>
              <span className="meta-divider">•</span>
              <span className="meta-item">{arena.duration} min</span>
            </div>
          </div>
        </div>
        
        <div className="waiting-header-right">
          {arena.isPrivate && (
            <div className="arena-code-display">
              <span className="code-label">Code:</span>
              <span className="code-value">{arena.code}</span>
              <button className="code-copy-btn" onClick={handleCopyCode}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
          )}
          <button className="leave-btn" onClick={handleLeaveArena}>
            <LogOut size={18} />
            Leave
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="waiting-content">
        {/* Countdown Banner */}
        {countdown !== null && (
          <div className="countdown-banner">
            <Swords size={24} />
            <span>Match starting in {countdown} seconds...</span>
          </div>
        )}

        {/* Players Grid */}
        <div className="waiting-grid-container">
          <div className="players-header">
            <Users size={20} />
            <h2>Players ({currentPlayers}/{maxPlayers})</h2>
          </div>

          <div className="teams-container">
            {teams.map((team, teamIndex) => (
              <div key={teamIndex} className="team-box">
                <div className="team-header">
                  <h3>Team {teamIndex + 1}</h3>
                  <span className="team-count">{team.members?.length || 0}/{maxPlayers / teams.length}</span>
                </div>
                
                <div className="team-members">
                  {team.members?.map((member, idx) => (
                    <div key={member.id} className="member-card">
                      <div className="member-avatar">
                        {member.username?.charAt(0).toUpperCase()}
                      </div>
                      <div className="member-info">
                        <span className="member-name">{member.username}</span>
                        {member.username === arena.creator && (
                          <Crown size={14} className="creator-icon" />
                        )}
                      </div>
                      <div className={`member-status ${member.ready ? 'ready' : 'waiting'}`}>
                        {member.ready ? 'Ready' : 'Waiting'}
                      </div>
                    </div>
                  )) || <div className="empty-slot">Empty slot</div>}
                  
                  {/* Empty Slots */}
                  {Array.from({ length: (maxPlayers / teams.length) - (team.members?.length || 0) }).map((_, idx) => (
                    <div key={`empty-${idx}`} className="member-card empty">
                      <div className="member-avatar empty-avatar">
                        <Users size={18} />
                      </div>
                      <div className="member-info">
                        <span className="member-name empty-text">Waiting for player...</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="waiting-footer">
          <div className="waiting-status">
            {currentPlayers < maxPlayers ? (
              <>
                <Clock size={20} />
                <span>Waiting for {maxPlayers - currentPlayers} more player{maxPlayers - currentPlayers !== 1 ? 's' : ''}...</span>
              </>
            ) : (
              <>
                <Check size={20} />
                <span>All players joined!</span>
              </>
            )}
          </div>

          {user?.username === arena.creator && currentPlayers >= 2 && (
            <button className="start-match-btn" onClick={handleStartMatch}>
              <Swords size={20} />
              Start Match
            </button>
          )}
        </div>
      </main>
    </div>
  );
};

export default ArenaWaitingRoom;
