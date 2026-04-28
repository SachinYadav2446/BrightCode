import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Gamepad2, ArrowLeft, Code2, Trophy, Zap, ArrowRight, Lock, 
    ChevronLeft, ChevronRight, RefreshCw, Activity, BookOpen,
    Layout, Server, GraduationCap, GitBranch, Database, Brain, Layers
} from 'lucide-react';
import './Arcade.css';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

import { 
    CSS_LEVELS, LOGIC_LEVELS, REACT_LEVELS, 
    SUBJECT_PHASES, PHASE_THEORIES, ALL_QUOTES 
} from '../data/arcadeData';

// ── SIDEBAR TABS CONFIG ───────────────────────────────────────────────
const SIDEBAR_TABS = [
    { id: 'frontend', label: 'Frontend', icon: Layout, active: true },
    { id: 'backend', label: 'Backend', icon: Server, active: true },
    { id: 'curriculum', label: 'Curriculum', icon: GraduationCap, active: false },
    { id: 'open-source', label: 'Open Source', icon: GitBranch, active: false },
    { id: 'data-science', label: 'Data Science', icon: Database, active: false },
    { id: 'ml', label: 'ML', icon: Brain, active: false },
];

// ── LIBRARY LOBBY (Sidebar + Content) ─────────────────────────────────
const LibraryLobby = ({ sections, setActiveGame, setViewingSections }) => {
    const [activeTab, setActiveTab] = useState('frontend');

    // Map sidebar tab id → sections array id
    const tabToSection = { frontend: 'frontend', backend: 'backend' };
    const currentSection = sections.find(s => s.id === tabToSection[activeTab]);
    const hasContent = Boolean(currentSection && currentSection.games.length > 0);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="library-lobby"
        >
            {/* ── Sidebar ── */}
            <aside className="library-sidebar">
                <div className="sidebar-brand">
                    <Layers size={18} color="#ef4444" />
                    <span>SKILL TRACKS</span>
                </div>
                <nav className="sidebar-nav">
                    {SIDEBAR_TABS.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                className={`sidebar-tab ${isActive ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon size={16} />
                                <span>{tab.label}</span>
                                {!tab.active && <span className="tab-soon-pill">Soon</span>}
                                {isActive && <motion.div className="tab-active-bar" layoutId="activeBar" />}
                            </button>
                        );
                    })}
                </nav>
                <div className="sidebar-footer">
                    <div className="sidebar-stat">
                        <span className="sstat-val">{sections.flatMap(s => s.games).length}</span>
                        <span className="sstat-label">Active Modules</span>
                    </div>
                    <div className="sidebar-stat">
                        <span className="sstat-val">
                            {sections.flatMap(s => s.games).reduce((acc, g) => acc + g.total, 0)}
                        </span>
                        <span className="sstat-label">Total Challenges</span>
                    </div>
                </div>
            </aside>

            {/* ── Content Panel ── */}
            <div className="library-content">
                <div className="library-content-header">
                    <div>
                        <h1 className="lib-title">
                            {SIDEBAR_TABS.find(t => t.id === activeTab)?.label}
                            <span className="lib-title-accent"> Track</span>
                        </h1>
                        <p className="lib-subtitle">
                            {currentSection?.description || 'Specialized modules coming to BrightCode soon.'}
                        </p>
                    </div>
                    <div className="lib-header-badge">
                        {hasContent ? `${currentSection.games.length} MODULE${currentSection.games.length > 1 ? 'S' : ''}` : 'COMING SOON'}
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {hasContent ? (
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.3 }}
                            className="lib-modules-grid"
                        >
                            {currentSection.games.map((game, idx) => {
                                const sKey = `${game.id.replace(/-/g, '_')}_solutions`;
                                const solutions = JSON.parse(localStorage.getItem(sKey)) || {};
                                const solvedCount = Object.keys(solutions).length;
                                
                                const highestVal = parseInt(localStorage.getItem(game.progressKey)) || 0;
                                const progValue = Math.max(solvedCount, highestVal);
                                const pct = Math.round((progValue / game.total) * 100);

                                return (
                                    <motion.div
                                        key={game.id}
                                        className="lib-module-card"
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08 }}
                                        whileHover={{ y: -6 }}
                                        onClick={() => { setActiveGame(game.id); setViewingSections(true); }}
                                    >
                                        <div className="lib-module-top">
                                            <div className="lib-module-icon">
                                                {React.cloneElement(game.icon, { size: 32, color: '#ef4444' })}
                                            </div>
                                            <div className="lib-module-badge">{game.subtitle}</div>
                                        </div>
                                        <h3 className="lib-module-title">{game.title}</h3>
                                        <p className="lib-module-desc">{game.desc}</p>
                                        <div className="lib-module-footer">
                                            <div className="lib-progress-wrap">
                                                <div className="lib-progress-header">
                                                    <span>{pct}% Mastery</span>
                                                    <span>{progValue}/{game.total} Levels</span>
                                                </div>
                                                <div className="lib-progress-bar">
                                                    <motion.div
                                                        className="lib-progress-fill"
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${pct}%` }}
                                                        transition={{ duration: 1, ease: 'easeOut' }}
                                                        style={{ 
                                                            background: pct >= 100 ? '#10b981' : '#ef4444',
                                                            boxShadow: pct >= 100 ? '0 0 10px rgba(16, 185, 129, 0.4)' : '0 0 10px rgba(239, 68, 68, 0.3)'
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                            <button className="lib-enter-btn">
                                                {pct >= 100 ? 'Review' : 'Enter'} <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeTab + '-soon'}
                            initial={{ opacity: 0, y: 16 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -16 }}
                            transition={{ duration: 0.3 }}
                            className="lib-coming-soon"
                        >
                            <div className="lib-soon-icon">
                                {React.createElement(SIDEBAR_TABS.find(t => t.id === activeTab)?.icon || Lock, { size: 48, color: '#ef4444' })}
                            </div>
                            <h2>Coming Soon</h2>
                            <p>We're engineering world-class <strong>{SIDEBAR_TABS.find(t => t.id === activeTab)?.label}</strong> challenges.<br />Stay tuned — this track is being forged.</p>
                            <div className="lib-soon-chips">
                                {['Challenges', 'Projects', 'Quizzes', 'Labs'].map(c => (
                                    <span key={c} className="lib-soon-chip">{c}</span>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
};

const Arcade = () => {
    const auth = useAuth();
    const user = auth?.user;
    const updateXP = auth?.updateXP;
    
    const navigate = useNavigate();
    const goBackPreserveScroll = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate('/hub');
    };

    const [activeGame, setActiveGame] = useState(null);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answerRevealed, setAnswerRevealed] = useState(false);
    const [wrongSelection, setWrongSelection] = useState(null);
    const [cssInput, setCssInput] = useState('');
    const [currentLvlIdx, setCurrentLvlIdx] = useState(0);
    const [showTheory, setShowTheory] = useState(false);
    const [viewingSections, setViewingSections] = useState(false);
    const [isWarping, setIsWarping] = useState(false);
    const [phaseCompleteMessage, setPhaseCompleteMessage] = useState('');

    const gameMap = {
        'css-odyssey': CSS_LEVELS,
        'logic-lab': LOGIC_LEVELS,
        'react-quest': REACT_LEVELS
    };

    const sections = [
        {
            id: 'frontend',
            name: 'Frontend Development',
            description: 'Master the art of building beautiful, responsive user interfaces and logical core.',
            games: [
                { id: 'css-odyssey', title: 'CSS Forge', subtitle: 'Advanced Layouts', desc: 'Master layouts, grids, and complex animations in a high-fidelity simulator.', icon: <Code2 />, progressKey: 'highest_css_odyssey_level', total: CSS_LEVELS.length },
                { id: 'logic-lab', title: 'Logic Forge', subtitle: 'Logic Systems', desc: 'Conquer 100 levels of JavaScript puzzles, from control flow to advanced patterns.', icon: <Zap />, progressKey: 'highest_logic_lab_level', total: LOGIC_LEVELS.length },
                { id: 'react-quest', title: 'React Forge', subtitle: 'Architecture Lab', desc: 'Theoretical MCQ challenges designed to push your React knowledge to its limits.', icon: <RefreshCw />, progressKey: 'highest_react_quest_level', total: REACT_LEVELS.length }
            ]
        },
        { id: 'backend', name: 'Backend Development', description: 'Build robust server-side applications and APIs', games: [] },
        { id: 'data-science', name: 'Data Science', description: 'Analyze data and build intelligent systems', games: [] }
    ];

    const [highestLevel, setHighestLevel] = useState(0);
    const [savedSolutions, setSavedSolutions] = useState({});

    useEffect(() => {
        if (!activeGame || !user) return;
        let dbLevel = 0;
        if (activeGame === 'css-odyssey') dbLevel = user.css_level || 0;
        else if (activeGame === 'logic-lab') dbLevel = user.logic_level || 0;
        else if (activeGame === 'react-quest') dbLevel = user.react_level || 0;

        const hKey = `highest_${activeGame.replace(/-/g, '_')}_level`;
        const sKey = `${activeGame.replace(/-/g, '_')}_solutions`;
        const localLevel = parseInt(localStorage.getItem(hKey)) || 0;
        const finalLevel = Math.max(dbLevel, localLevel);
        setHighestLevel(finalLevel);
        setSavedSolutions(JSON.parse(localStorage.getItem(sKey)) || {});
    }, [activeGame, user]);

    const levels = gameMap[activeGame] || [];
    const levelData = levels[currentLvlIdx];

    useEffect(() => {
        if (savedSolutions[currentLvlIdx]) {
            setCssInput(savedSolutions[currentLvlIdx]);
        } else {
            setCssInput('');
        }
    }, [currentLvlIdx, savedSolutions, activeGame]);

    const isLevelSolved = (levelIdx) => {
        return Boolean(savedSolutions[levelIdx]) || levelIdx < highestLevel;
    };

    const isPhaseUnlocked = (phaseIdx) => {
        if (phaseIdx <= 0) return true;
        const phases = SUBJECT_PHASES[activeGame] || [];
        for (let i = 0; i < phaseIdx; i++) {
            const phase = phases[i];
            for (let levelIdx = phase.start; levelIdx <= phase.end; levelIdx++) {
                if (!isLevelSolved(levelIdx)) return false;
            }
        }
        return true;
    };

    const startPhase = (phase) => {
        const phases = SUBJECT_PHASES[activeGame] || [];
        const pIdx = phases.findIndex(p => p.name === phase.name);
        if (isPhaseUnlocked(pIdx)) {
            setCurrentLvlIdx(phase.start);
            setViewingSections(false);
            if (activeGame !== 'react-quest') setShowTheory(true);
        }
    };

    const handleVictory = (code) => {
        const newHighest = Math.max(highestLevel, currentLvlIdx + 1);
        setHighestLevel(newHighest);
        const storageKey = `highest_${activeGame.replace(/-/g, '_')}_level`;
        localStorage.setItem(storageKey, newHighest);

        const updatedSolutions = { ...savedSolutions, [currentLvlIdx]: code };
        setSavedSolutions(updatedSolutions);
        localStorage.setItem(`${activeGame.replace(/-/g, '_')}_solutions`, JSON.stringify(updatedSolutions));

        setIsWarping(true);
        setTimeout(() => {
            setIsWarping(false);
            if (currentLvlIdx < levels.length - 1) {
                setCurrentLvlIdx(currentLvlIdx + 1);
            } else {
                setCurrentLvlIdx('WIN');
            }
        }, 2000);
    };

    return (
        <div className="arcade-page">
            <Navbar currentPage="library" />

            {!activeGame ? (
                <LibraryLobby sections={sections} setActiveGame={setActiveGame} setViewingSections={setViewingSections} />
            ) : viewingSections ? (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="active-game-container" style={{
                    marginTop: '50px', height: 'calc(100vh - 50px)', background: '#0a0a0a', padding: '40px'
                }}>
                    <button className="lib-enter-btn" onClick={() => { setActiveGame(null); setViewingSections(false); }}>
                        <ArrowLeft size={16} /> BACK TO LIBRARY
                    </button>
                    <div className="phase-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px', marginTop: '40px' }}>
                        {(SUBJECT_PHASES[activeGame] || []).map((phase, idx) => {
                            const unlocked = isPhaseUnlocked(idx);
                            return (
                                <motion.div key={idx} className={`phase-card ${unlocked ? 'unlocked' : 'locked'}`} style={{
                                    padding: '24px', borderRadius: '16px', background: unlocked ? 'rgba(239,68,68,0.1)' : 'rgba(255,255,255,0.05)',
                                    border: unlocked ? '1px solid #ef4444' : '1px solid #333', cursor: unlocked ? 'pointer' : 'not-allowed'
                                }} onClick={() => unlocked && startPhase(phase)}>
                                    <h3>{phase.label}</h3>
                                    {!unlocked && <Lock size={16} />}
                                </motion.div>
                            );
                        })}
                    </div>
                </motion.div>
            ) : (
                <div className="game-view" style={{ marginTop: '50px', padding: '40px', color: 'white' }}>
                    <h2>{levelData?.title || 'Victory!'}</h2>
                    <p>{levelData?.desc}</p>
                    <button className="lib-enter-btn" onClick={() => handleVictory('solved')}>Complete Level</button>
                    <button className="lib-enter-btn" style={{ marginLeft: '10px' }} onClick={() => setViewingSections(true)}>Select Phase</button>
                </div>
            )}

        </div>
    );
};

export default Arcade;
