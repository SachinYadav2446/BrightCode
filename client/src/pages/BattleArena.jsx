import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, Users, Zap, ArrowLeft, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './BattleArena.css';

const BattleArena = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedGame, setSelectedGame] = useState('syntax-showdown');

  const games = [
    {
      id: 'syntax-showdown',
      title: 'Syntax Showdown',
      description: 'Real-time competitive coding battles where you face off against opponents in timed challenges.',
      icon: Swords,
      status: 'COMING SOON',
      players: ['1v1', '2v2', '4v4'],
      durations: ['5', '15', '30', '60'],
      difficulties: ['easy', 'medium', 'hard'],
      gradient: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      features: [
        'Live coding battles with real-time sync',
        'AI-generated test cases',
        'Real-time leaderboard',
        'Multiple languages (JS, Python, Java, C++, Go)'
      ]
    },
    {
      id: 'algorithm-duel',
      title: 'Algorithm Duel',
      description: 'Head-to-head algorithm optimization challenges. Compete for the fastest and most efficient solution.',
      icon: Zap,
      status: 'COMING SOON',
      players: ['1v1'],
      durations: ['10', '20'],
      difficulties: ['medium', 'hard'],
      gradient: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
      features: [
        'Performance optimization challenges',
        'Time complexity battles',
        'Memory efficiency scoring',
        'Algorithm visualization'
      ]
    },
    {
      id: 'hackathon-hub',
      title: 'Hackathon Hub',
      description: 'Multi-question coding marathons. Build complete solutions in team-based matches.',
      icon: Trophy,
      status: 'COMING SOON',
      players: ['2v2', '4v4'],
      durations: ['20', '30', '60'],
      difficulties: ['easy', 'medium', 'hard'],
      gradient: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      features: [
        'Multi-question marathon',
        'Team collaboration workspace',
        'Judge0 automated testing',
        'Team standings dashboard'
      ]
    },
    {
      id: 'faction-wars',
      title: 'Faction Wars',
      description: 'Epic faction vs faction tournaments. Fight for territory and faction supremacy.',
      icon: Users,
      status: 'COMING SOON',
      players: ['4v4'],
      durations: ['30', '60'],
      difficulties: ['medium', 'hard'],
      gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      features: [
        'Faction-based tournaments',
        'Collective scoring',
        'Weekly championships',
        'Exclusive faction badges'
      ]
    }
  ];

  const selectedGameData = games.find(g => g.id === selectedGame);
  const Icon = selectedGameData?.icon;

  const handleEnterArena = () => {
    if (selectedGameData.status === 'READY') {
      navigate(`/arena-lobby?game=${selectedGame}`);
    }
  };

  return (
    <div className="battle-arena-page">
      {/* Background Effects */}
      <div className="arena-bg">
        <div className="arena-grid"></div>
        <div className="arena-glow"></div>
      </div>

      {/* Sidebar */}
      <aside className="arena-sidebar">
        <header className="sidebar-header">
          <h2>Battle Arena</h2>
        </header>

        <nav className="sidebar-contests">
          {games.map((game) => {
            const GameIcon = game.icon;
            return (
              <button
                key={game.id}
                className={`sidebar-contest-item ${selectedGame === game.id ? 'active' : ''}`}
                onClick={() => setSelectedGame(game.id)}
              >
                <div className="sidebar-icon" style={{ background: game.gradient }}>
                  <GameIcon size={18} />
                </div>
                <span className="sidebar-contest-name">{game.title}</span>
                <span className="live-badge">{game.status}</span>
              </button>
            );
          })}
        </nav>

        <footer className="sidebar-footer">
          <button className="sidebar-btn back-btn-full" onClick={() => navigate('/factions')}>
            <ArrowLeft size={18} />
            <span>Back to Factions</span>
          </button>
        </footer>
      </aside>

      {/* Main Content */}
      <main className="arena-main-content">
        {selectedGameData && (
          <div className="contest-detail">
            <div className="contest-layout">
              {/* Left Column - Game Info */}
              <div className="contest-left">
                <div className="contest-icon-large" style={{ background: selectedGameData.gradient }}>
                  <Icon size={48} />
                </div>
                
                <h1 className="contest-title">{selectedGameData.title}</h1>
                <p className="contest-description">{selectedGameData.description}</p>

                <div className="contest-meta-grid">
                  <div className="meta-card">
                    <span className="meta-card-label">PLAYERS</span>
                    <span className="meta-card-value">{selectedGameData.players.join(', ')}</span>
                  </div>
                  <div className="meta-card">
                    <span className="meta-card-label">DURATION</span>
                    <span className="meta-card-value">{selectedGameData.durations[0]} - {selectedGameData.durations[selectedGameData.durations.length - 1]} min</span>
                  </div>
                  <div className="meta-card">
                    <span className="meta-card-label">DIFFICULTY</span>
                    <span className="meta-card-value">{selectedGameData.difficulties.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Features & Buttons */}
              <div className="contest-right">
                <div className="contest-features">
                  <h3 className="features-title">Features</h3>
                  <ul className="features-list">
                    {selectedGameData.features.map((feature, index) => (
                      <li key={index} className="feature-item">
                        <CheckCircle2 size={16} className="feature-bullet-icon" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="arena-actions">
                  {selectedGameData.status === 'READY' ? (
                    <button 
                      className="enter-arena-btn"
                      onClick={handleEnterArena}
                      style={{ background: selectedGameData.gradient }}
                    >
                      <Swords size={20} /> Enter Arena
                    </button>
                  ) : (
                    <div className="coming-soon-message">
                      <Clock size={24} />
                      <h3>Coming Soon</h3>
                      <p>This game mode is under development and will be available soon!</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BattleArena;
