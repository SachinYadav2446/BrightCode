import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Swords, Trophy, Users, Zap, ArrowLeft, Settings, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './BattleArena.css';

const BattleArena = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedContest, setSelectedContest] = useState('code-wars');

  const contests = [
    {
      id: 'code-wars',
      title: 'Syntax Showdown',
      description: 'Real-time competitive coding battles where you face off against opponents in timed challenges. Test your skills, solve problems under pressure, and climb the leaderboard.',
      icon: Swords,
      status: 'active',
      players: '2-8 Players',
      duration: '5 min - 1 hr',
      difficulty: 'All Levels',
      features: [
        'Live coding battles with real-time synchronization',
        'AI-generated test cases for dynamic challenges',
        'Real-time leaderboard and ranking system',
        'Team collaboration and pair programming',
        'Multiple programming languages supported',
        'Instant feedback and code execution'
      ],
      gradient: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)',
      route: '/code-wars'
    },
    {
      id: 'algorithm-duel',
      title: 'Algorithm Duel',
      description: 'Head-to-head algorithm optimization challenges where you compete for the fastest and most efficient solution. Master time and space complexity.',
      icon: Zap,
      status: 'coming-soon',
      players: '1v1',
      duration: '20 min',
      difficulty: 'Advanced',
      features: [
        'Performance optimization challenges',
        'Time complexity battles and analysis',
        'Memory efficiency scoring system',
        'Real-time performance metrics',
        'Algorithm visualization tools',
        'Competitive ranking system'
      ],
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
      id: 'hackathon-hub',
      title: 'Hackathon Hub',
      description: 'Multi-day coding marathons where you build complete projects from scratch. Collaborate with your team and compete for glory.',
      icon: Trophy,
      status: 'coming-soon',
      players: 'Teams 2-4',
      duration: '24-72 hrs',
      difficulty: 'All Levels',
      features: [
        'Full-stack development challenges',
        'Team collaboration workspace',
        'Project showcase and presentation',
        'Expert judging and feedback',
        'Prize pools and rewards',
        'Networking opportunities'
      ],
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
    },
    {
      id: 'faction-wars',
      title: 'Faction Wars',
      description: 'Epic faction vs faction tournaments where you represent your team in massive coding battles. Compete for faction supremacy.',
      icon: Users,
      status: 'coming-soon',
      players: 'Faction-wide',
      duration: '1 week',
      difficulty: 'All Levels',
      features: [
        'Faction-based tournament system',
        'Collective scoring and rankings',
        'Weekly championship events',
        'Exclusive faction rewards',
        'Team strategy and coordination',
        'Global faction leaderboard'
      ],
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    }
  ];

  const selectedContestData = contests.find(c => c.id === selectedContest);
  const Icon = selectedContestData?.icon;

  const handleEnterArena = () => {
    if (selectedContestData?.status === 'active') {
      navigate(selectedContestData.route);
    }
  };

  // Check if user is admin
  const isAdmin = user?.username === 'admin';

  if (!isAdmin) {
    return (
      <div className="battle-arena-page coming-soon-page">
        <div className="arena-bg">
          <div className="arena-grid"></div>
          <div className="arena-glow"></div>
        </div>
        <div className="coming-soon-container">
          <Lock size={64} />
          <h1>Battle Arena</h1>
          <p>Coming soon! Stay tuned for epic coding battles!</p>
          <button className="enter-arena-btn" onClick={() => navigate('/')}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

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
          {contests.map((contest) => {
            const ContestIcon = contest.icon;
            return (
              <button
                key={contest.id}
                className={`sidebar-contest-item ${selectedContest === contest.id ? 'active' : ''}`}
                onClick={() => setSelectedContest(contest.id)}
              >
                <div className="sidebar-icon" style={{ background: contest.gradient }}>
                  <ContestIcon size={20} />
                </div>
                <span className="sidebar-contest-name">{contest.title}</span>
                {contest.status === 'coming-soon' && (
                  <span className="soon-badge">soon</span>
                )}
              </button>
            );
          })}
        </nav>

        <footer className="sidebar-footer">
          <button className="sidebar-btn" onClick={() => navigate('/factions')}>
            <ArrowLeft size={18} />
            <span>Back</span>
          </button>
          <button className="sidebar-btn">
            <Settings size={18} />
            <span>Settings</span>
          </button>
        </footer>
      </aside>

      {/* Main Content */}
      <main className="arena-main-content">
        {selectedContestData && (
          <div className="contest-detail">
            <div className="contest-layout">
              {/* Left Column - Contest Info */}
              <div className="contest-left">
                <div className="contest-icon-large" style={{ background: selectedContestData.gradient }}>
                  <Icon size={48} />
                </div>
                
                <h1 className="contest-title">{selectedContestData.title}</h1>
                <p className="contest-description">{selectedContestData.description}</p>

                <div className="contest-meta-grid">
                  <div className="meta-card">
                    <span className="meta-card-label">Players</span>
                    <span className="meta-card-value">{selectedContestData.players}</span>
                  </div>
                  <div className="meta-card">
                    <span className="meta-card-label">Duration</span>
                    <span className="meta-card-value">{selectedContestData.duration}</span>
                  </div>
                  <div className="meta-card">
                    <span className="meta-card-label">Difficulty</span>
                    <span className="meta-card-value">{selectedContestData.difficulty}</span>
                  </div>
                </div>
              </div>

              {/* Right Column - Features & Button */}
              <div className="contest-right">
                <div className="contest-features">
                  <h3 className="features-title">Features</h3>
                  <ul className="features-list">
                    {selectedContestData.features.map((feature, index) => (
                      <li key={index} className="feature-item">
                        <span className="feature-bullet">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  className={`enter-arena-btn ${selectedContestData.status === 'coming-soon' ? 'disabled' : ''}`}
                  onClick={handleEnterArena}
                  disabled={selectedContestData.status === 'coming-soon'}
                >
                  {selectedContestData.status === 'active' ? 'Enter Arena' : 'Coming Soon'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default BattleArena;
