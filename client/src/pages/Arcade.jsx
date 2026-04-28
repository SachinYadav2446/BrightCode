import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Gamepad2, ArrowLeft, Code2, Trophy, Zap, ArrowRight, Lock, 
    ChevronLeft, ChevronRight, RefreshCw, Activity, BookOpen,
    Layout, Server, GraduationCap, GitBranch, Database, Brain, Layers,
    CheckCircle2, AlertCircle, X
} from 'lucide-react';
import './Arcade.css';
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
const LibraryLobby = ({ sections, setActiveGame, setViewingSections, setCurrentLvlIdx }) => {
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
                                        onClick={() => { 
                                            setActiveGame(game.id); 
                                            setViewingSections(true);
                                        }}
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
                                                {pct >= 100 ? 'Review' : 'Enter'}
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
    const [logicInput, setLogicInput] = useState('');
    const [currentLvlIdx, setCurrentLvlIdx] = useState(0);
    const [showTheory, setShowTheory] = useState(false);
    const [viewingSections, setViewingSections] = useState(false);
    const [phasePage, setPhasePage] = useState(0);
    const phasesPerPage = 3;
    const [isWarping, setIsWarping] = useState(false);
    const [cssStatus, setCssStatus] = useState('neutral'); // 'neutral', 'correct', 'wrong'
    const [logicStatus, setLogicStatus] = useState('neutral'); // 'neutral', 'correct', 'wrong'
    const [phaseCompleteMessage, setPhaseCompleteMessage] = useState('');
    const [progressSidebarOpen, setProgressSidebarOpen] = useState(true);
    const [testResults, setTestResults] = useState(null); // For logic lab feedback
    const [showModal, setShowModal] = useState(false);
    const [modalConfig, setModalConfig] = useState({ type: 'success', title: '', message: '' });

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
        setPhasePage(0); // Reset pagination when switching modules
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

    // Calculate phase-relative level info
    const currentPhase = (SUBJECT_PHASES[activeGame] || []).find(p => currentLvlIdx >= p.start && currentLvlIdx <= p.end);
    const relativeLvlIdx = currentPhase ? currentLvlIdx - currentPhase.start + 1 : currentLvlIdx + 1;
    const totalInPhase = currentPhase ? currentPhase.end - currentPhase.start + 1 : levels.length;

    useEffect(() => {
        if (savedSolutions[currentLvlIdx]) {
            if (activeGame === 'css-odyssey') setCssInput(savedSolutions[currentLvlIdx]);
            else if (activeGame === 'logic-lab') setLogicInput(savedSolutions[currentLvlIdx]);
        } else {
            setCssInput('');
            setLogicInput(activeGame === 'logic-lab' && levelData?.syntax ? levelData.syntax : '');
        }
        // Reset states for new level
        setSelectedOption(null);
        setAnswerRevealed(false);
        setWrongSelection(null);
        setCssStatus('neutral');
        setLogicStatus('neutral');
        setTestResults(null);
    }, [currentLvlIdx, savedSolutions, activeGame]);

    const isLevelSolved = (levelIdx) => {
        return Boolean(savedSolutions[levelIdx]) || levelIdx < highestLevel;
    };

    const isLevelLocked = (levelIdx) => {
        if (levelIdx === 0) return false;
        return !isLevelSolved(levelIdx - 1);
    };

    const isPhaseLocked = (phaseIdx) => {
        if (phaseIdx === 0) return false;
        const phases = SUBJECT_PHASES[activeGame] || [];
        const prevPhase = phases[phaseIdx - 1];
        if (!prevPhase) return false;
        return !isLevelSolved(prevPhase.end);
    };

    const startPhase = (phase) => {
        const phases = SUBJECT_PHASES[activeGame] || [];
        const pIdx = phases.findIndex(p => p.name === phase.name);
        if (!isPhaseLocked(pIdx)) {
            // Find first unsolved level in this phase
            let startIdx = phase.start;
            for (let i = phase.start; i <= phase.end; i++) {
                if (!isLevelSolved(i)) {
                    startIdx = i;
                    break;
                }
            }
            setCurrentLvlIdx(startIdx);
            setViewingSections(false);
            if (activeGame !== 'react-quest') setShowTheory(true);
        }
    };

    const saveProgress = async (code) => {
        const isNewLevel = currentLvlIdx + 1 > highestLevel;
        const newHighest = Math.max(highestLevel, currentLvlIdx + 1);
        setHighestLevel(newHighest);
        const storageKey = `highest_${activeGame.replace(/-/g, '_')}_level`;
        localStorage.setItem(storageKey, newHighest);

        const updatedSolutions = { ...savedSolutions, [currentLvlIdx]: code };
        setSavedSolutions(updatedSolutions);
        localStorage.setItem(`${activeGame.replace(/-/g, '_')}_solutions`, JSON.stringify(updatedSolutions));

        // ── AWARD 10 XP FOR NEW SOLVE ───────────────────────────────────
        if (isNewLevel && user) {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.post('http://localhost:5051/add-xp', {
                    amount: 10,
                    module: activeGame,
                    level: currentLvlIdx + 1
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (response.data.success) {
                    const { xp, ...stats } = response.data;
                    updateXP(xp, stats);
                    console.log(`[XP] Awarded 10 XP for ${activeGame} Level ${currentLvlIdx + 1}`);
                }
            } catch (err) {
                console.error('[XP SYNC ERROR]', err);
            }
        }
    };

    const handleTryAgain = () => {
        setShowModal(false);
        setAnswerRevealed(false);
        setWrongSelection(null);
        setSelectedOption(null);
        setCssStatus('neutral');
        setLogicStatus('neutral');
        setTestResults(null);
    };

    const handleNextLevel = () => {
        if (currentLvlIdx < levels.length - 1 && !isLevelLocked(currentLvlIdx + 1)) {
            // Use warp animation if they just solved it
            if (answerRevealed && !wrongSelection) {
                setIsWarping(true);
                setTimeout(() => {
                    setIsWarping(false);
                    setCurrentLvlIdx(i => Math.min(levels.length - 1, i + 1));
                }, 1500);
            } else {
                setCurrentLvlIdx(i => Math.min(levels.length - 1, i + 1));
            }
        }
    };

    const triggerModal = (type, title, message) => {
        setModalConfig({ type, title, message });
        setShowModal(true);
    };

    const handleVictory = async (code) => {
        const isMCQ = levelData.options && levelData.answer !== undefined;
        
        if (isMCQ) {
            if (selectedOption === null) {
                triggerModal('error', 'Selection Required', 'Please select an option first!');
                return;
            }
            
            const userAnswer = parseInt(code);
            const isCorrect = userAnswer === levelData.answer;
            
            setAnswerRevealed(true);
            if (!isCorrect) {
                setWrongSelection(userAnswer);
                triggerModal('error', 'Incorrect Answer', 'That\'s not quite right. Try again!');
            } else {
                await saveProgress(code);
                triggerModal('success', 'Perfect! +10 XP', 'Great job! You\'ve selected the correct answer and earned 10 XP.');
            }
            // No automatic progression anymore - let user click "Next"
        } else if (activeGame === 'css-odyssey') {
            // CSS Validation Logic
            const input = code.toLowerCase().replace(/\s/g, '');
            const reqs = levelData.reqs || [];
            
            const isCorrect = reqs.every(req => {
                if (Array.isArray(req)) {
                    return req.some(r => input.includes(r.toLowerCase().replace(/\s/g, '')));
                }
                return input.includes(req.toLowerCase().replace(/\s/g, ''));
            });

            if (isCorrect) {
                setAnswerRevealed(true);
                setCssStatus('correct');
                await saveProgress(code);
                triggerModal('success', 'Requirements Met +10 XP', 'Fantastic! Your design meets all the requirements. You earned 10 XP!');
            } else {
                setCssStatus('wrong');
                triggerModal('error', 'Check Requirements', 'Some design requirements are missing or incorrect. Keep trying!');
            }
        } else if (activeGame === 'logic-lab') {
            // Logic Lab Validation with Async and DOM support
            const runLogicTest = async () => {
                try {
                    const results = [];
                    // Process test cases sequentially to handle async properly
                    for (const tc of levelData.testCases) {
                        const args = tc.slice(0, tc.length - 1);
                        const expected = tc[tc.length - 1];
                        let actual;
                        let error = null;

                        // Mock DOM setup if level requires it
                        let mockDoc = null;
                        let container = null;
                        if (levelData.isDOM) {
                            container = document.createElement('div');
                            container.innerHTML = levelData.mockDOM || '';
                            
                            // Scoped document mock
                            mockDoc = {
                                getElementById: (id) => container.querySelector(`#${id}`),
                                getElementsByClassName: (cls) => container.getElementsByClassName(cls),
                                getElementsByTagName: (tag) => container.getElementsByTagName(tag),
                                querySelector: (sel) => container.querySelector(sel),
                                querySelectorAll: (sel) => container.querySelectorAll(sel),
                                createElement: (tag) => document.createElement(tag),
                                body: container,
                                addEventListener: (type, fn) => container.addEventListener(type, fn),
                                removeEventListener: (type, fn) => container.removeEventListener(type, fn),
                                write: (txt) => container.innerHTML += txt,
                            };
                        }

                        const mockFetch = () => Promise.resolve({ 
                            status: 200, 
                            ok: true,
                            json: () => Promise.resolve({ data: "Success" }),
                            text: () => Promise.resolve("Success")
                        });

                        try {
                            const fnBody = `
                                try {
                                    ${code}
                                    if (typeof solution === 'function') {
                                        return solution(${levelData.params});
                                    }
                                    ${!code.includes('return') && !code.trim().startsWith('function') ? `return (${code})` : ''}
                                } catch (e) {
                                    throw e;
                                }
                            `;
                            
                            const params = [];
                            const values = [];
                            
                            if (levelData.isDOM) {
                                params.push('document');
                                values.push(mockDoc);
                            }
                            
                            params.push('mockFetch');
                            values.push(mockFetch);

                            // Add original params from levelData
                            const levelParams = levelData.params ? levelData.params.split(',').map(p => p.trim()).filter(Boolean) : [];
                            params.push(...levelParams);
                            values.push(...args);

                            // Use AsyncFunction if it's an async level
                            const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
                            const userFn = levelData.isAsync 
                                ? new AsyncFunction(...params, fnBody)
                                : new Function(...params, fnBody);
                            
                            actual = levelData.isAsync ? await userFn(...values) : userFn(...values);
                            
                            // Special case for DOM innerHTML checks if user modified the container
                            if (levelData.isDOM && levelData.id === 116 && actual === undefined) {
                                actual = container.innerHTML;
                            }
                        } catch (e) {
                            error = e.message;
                        }
                        
                        // Deep compare results
                        const isMatch = (a, b) => {
                            try {
                                return JSON.stringify(a) === JSON.stringify(b);
                            } catch {
                                return a === b;
                            }
                        };

                        results.push({ 
                            args, 
                            expected, 
                            actual, 
                            error,
                            passed: !error && isMatch(actual, expected) 
                        });
                    }

                    const allPassed = results.every(r => r.passed);
                    setTestResults(results);

                    if (allPassed) {
                        setAnswerRevealed(true);
                        setLogicStatus('correct');
                        await saveProgress(code);
                        triggerModal('success', 'Logic Correct +10 XP', 'Brilliant! All test cases passed successfully. You earned 10 XP!');
                    } else {
                        setLogicStatus('wrong');
                        triggerModal('error', 'Logic Failed', 'Some test cases failed. Check your logic and try again.');
                    }
                } catch (err) {
                    setLogicStatus('wrong');
                    triggerModal('error', 'Execution Error', err.message);
                }
            };

            runLogicTest();
        } else {
            // For other levels (if any)
            setAnswerRevealed(true);
            await saveProgress(code);
            triggerModal('success', 'Level Complete +10 XP', 'You\'ve successfully completed this level and earned 10 XP!');
        }
    };

    const proceedToNext = async (code) => {
        await saveProgress(code);

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
        <div className={`arcade-page ${activeGame ? 'no-navbar' : ''}`}>


            {!activeGame ? (
                <LibraryLobby 
                    sections={sections} 
                    setActiveGame={setActiveGame} 
                    setViewingSections={setViewingSections} 
                    setCurrentLvlIdx={setCurrentLvlIdx}
                />
            ) : viewingSections ? (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="phase-view-container"
                >
                    <div className="phase-view-header">
                        <button className="phase-back-btn" onClick={() => { setActiveGame(null); setViewingSections(false); }}>
                            Back
                        </button>
                        
                        <div className="phase-view-title-group">
                            <h1 className="phase-view-title">
                                {sections.flatMap(s => s.games).find(g => g.id === activeGame)?.title || 'Module'}
                                <span className="phase-title-accent"> — Phases</span>
                            </h1>
                            <p className="phase-view-subtitle">Select a phase to begin. Complete all levels in a phase to unlock the next one.</p>
                        </div>

                        <div className="phase-view-controls-row">
                            <div className="phase-view-left-controls">
                                {highestLevel > 0 && highestLevel < levels.length && (
                                    <motion.button 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="phase-resume-banner"
                                            onClick={() => {
                                                setCurrentLvlIdx(highestLevel);
                                                setViewingSections(false);
                                            }}
                                        >
                                            <Zap size={16} fill="#ef4444" color="#ef4444" />
                                            <span>Resume from where you left off (Level {highestLevel + 1})</span>
                                        </motion.button>
                                )}
                            </div>

                            {/* Pagination Controls */}
                            {(() => {
                                const allPhases = SUBJECT_PHASES[activeGame] || [];
                                const totalPages = Math.ceil(allPhases.length / phasesPerPage);
                                if (totalPages <= 1) return null;
                                
                                return (
                                    <div className="phase-pagination-controls">
                                        <button 
                                            className="phase-page-btn"
                                            disabled={phasePage === 0}
                                            onClick={() => setPhasePage(p => Math.max(0, p - 1))}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>
                                        <span className="phase-page-indicator">
                                            Page {phasePage + 1} of {totalPages}
                                        </span>
                                        <button 
                                            className="phase-page-btn"
                                            disabled={phasePage >= totalPages - 1}
                                            onClick={() => setPhasePage(p => Math.min(totalPages - 1, p + 1))}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                );
                            })()}
                        </div>
                    </div>

                    <div className="phase-cards-grid">
                        {(() => {
                            const allPhases = SUBJECT_PHASES[activeGame] || [];
                            const visiblePhases = allPhases.slice(phasePage * phasesPerPage, (phasePage + 1) * phasesPerPage);
                            
                            return visiblePhases.map((phase, localIdx) => {
                                const globalIdx = phasePage * phasesPerPage + localIdx;
                                const locked = isPhaseLocked(globalIdx);
                                const totalInPhase = phase.end - phase.start + 1;
                                const solvedInPhase = Array.from({ length: totalInPhase }, (_, i) => isLevelSolved(phase.start + i)).filter(Boolean).length;
                                const phasePct = Math.round((solvedInPhase / totalInPhase) * 100);

                                return (
                                    <motion.div
                                        key={globalIdx}
                                        className={`phase-card-new ${locked ? 'locked' : 'unlocked'}`}
                                        initial={{ opacity: 0, y: 24 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: localIdx * 0.07 }}
                                        whileHover={locked ? {} : { y: -4 }}
                                        onClick={() => !locked && startPhase(phase)}
                                    >
                                        <div className="phase-card-top">
                                            <div className="phase-card-num">Phase {String(globalIdx + 1).padStart(2, '0')}</div>
                                            {phasePct === 100 ? (
                                                <span className="phase-complete-badge">✓ Complete</span>
                                            ) : locked ? (
                                                <span className="phase-locked-badge"><Lock size={12} /> Locked</span>
                                            ) : null}
                                        </div>
                                        <h3 className="phase-card-title">{phase.label}</h3>
                                        <p className="phase-card-range">Levels {phase.start + 1} – {phase.end + 1}</p>
                                        <div className="phase-card-progress">
                                            <div className="phase-progress-bar">
                                                <motion.div
                                                    className="phase-progress-fill"
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${phasePct}%` }}
                                                    transition={{ duration: 0.8, ease: 'easeOut' }}
                                                    style={{ background: phasePct === 100 ? '#10b981' : (locked ? '#333' : '#ef4444') }}
                                                />
                                            </div>
                                            <span className="phase-progress-label">{solvedInPhase}/{totalInPhase}</span>
                                        </div>
                                        <div className="phase-card-cta">
                                            {locked ? (
                                                <>Locked <Lock size={14} /></>
                                            ) : (
                                                <>{phasePct === 100 ? 'Review' : phasePct > 0 ? 'Continue' : 'Start'}</>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            });
                        })()}
                    </div>
                </motion.div>
            ) : (
                <motion.div
                    className="game-view-container"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                >
                    {/* Top bar */}
                    <div className="game-top-strip">
                        <div className="game-top-left">
                            <button className="game-back-text-btn" onClick={() => setViewingSections(true)}>
                                Back
                            </button>
                            <div className="game-level-info">
                                <span className="game-module-tag">
                                    {sections.flatMap(s => s.games).find(g => g.id === activeGame)?.title}
                                </span>
                                <span className="game-level-sep">›</span>
                                <span className="game-level-tag">
                                    {currentPhase ? `${currentPhase.label}: ` : ''}
                                    Level {relativeLvlIdx} / {totalInPhase}
                                </span>
                            </div>
                        </div>
                        <div className="game-nav-btns hidden-top-nav">
                            <button
                                className="game-nav-btn"
                                disabled={currentLvlIdx === 0}
                                onClick={() => setCurrentLvlIdx(i => Math.max(0, i - 1))}
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                className="game-nav-btn"
                                disabled={currentLvlIdx >= levels.length - 1 || isLevelLocked(currentLvlIdx + 1)}
                                onClick={() => setCurrentLvlIdx(i => Math.min(levels.length - 1, i + 1))}
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Main content */}
                    <div className={`game-main-layout ${progressSidebarOpen ? '' : 'sidebar-collapsed'}`}>
                        {/* Left: Challenge Panel */}
                        <div className="game-challenge-panel">
                            <div className="game-challenge-header">
                                <div className="game-challenge-num">Challenge #{relativeLvlIdx}</div>
                                <h2 className="game-challenge-title">{levelData?.title || '🎉 All Done!'}</h2>
                                <p className="game-challenge-desc">{levelData?.desc || 'You completed all levels in this module.'}</p>
                            </div>

                            {levelData && (
                                <div className="game-challenge-body">
                                    {activeGame === 'css-odyssey' && (() => {
                                        // Parse CSS text to React style object
                                        const parseCss = (text) => {
                                            const style = {};
                                            text.split(';').forEach(rule => {
                                                const [prop, ...vals] = rule.split(':');
                                                if (prop && vals.length) {
                                                    const camel = prop.trim().replace(/-([a-z])/g, (_, l) => l.toUpperCase());
                                                    style[camel] = vals.join(':').trim();
                                                }
                                            });
                                            return style;
                                        };
                                        const liveStyle = parseCss(cssInput);
                                        const baseStyle = levelData.base || {};
                                        const parentBaseStyle = levelData.parentBase || {};
                                        const boxCount = levelData.multiBox || 1;
                                        return (
                                            <div className="css-forge-layout">
                                                {/* Left: Code Editor */}
                                                <div className="css-forge-editor">
                                                    <div className="game-code-label">
                                                        <Code2 size={13} /> Write your CSS
                                                    </div>
                                                    <textarea
                                                        className={`game-css-input css-forge-textarea ${cssStatus}`}
                                                        value={cssInput}
                                                        onChange={e => {
                                                            setCssInput(e.target.value);
                                                            if (cssStatus === 'wrong') setCssStatus('neutral');
                                                        }}
                                                        placeholder={`/* Type CSS here...\ne.g.\ndisplay: flex;\njustify-content: center;\n*/`}
                                                        spellCheck={false}
                                                        disabled={answerRevealed}
                                                    />
                                                    <div className="css-forge-hint">
                                                        <span>💡</span>
                                                        <span>Changes appear live in the preview →</span>
                                                    </div>
                                                </div>

                                                {/* Right: Live Preview */}
                                                <div className="css-forge-preview">
                                                    <div className="css-forge-preview-label">Live Preview</div>
                                                    <div className="css-forge-canvas">
                                                        {levelData.isParent ? (
                                                            <div style={{ ...parentBaseStyle, ...liveStyle, width: parentBaseStyle.width || '100%', minHeight: '80px' }}>
                                                                {Array.from({ length: boxCount }).map((_, i) => (
                                                                    <div key={i} style={{ ...baseStyle }}>
                                                                        {levelData.renderBoxText || ''}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div style={{ ...baseStyle, ...liveStyle }}>
                                                                {levelData.renderBoxText || ''}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="css-forge-props">
                                                        {Object.keys(parseCss(cssInput)).length > 0 && (
                                                            <>
                                                                <div className="css-forge-props-title">Applied Properties</div>
                                                                {Object.entries(parseCss(cssInput)).map(([k, v]) => (
                                                                    <div key={k} className="css-prop-row">
                                                                        <span className="css-prop-key">{k.replace(/([A-Z])/g, '-$1').toLowerCase()}</span>
                                                                        <span className="css-prop-colon">:</span>
                                                                        <span className="css-prop-val">{v}</span>
                                                                    </div>
                                                                ))}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {activeGame === 'logic-lab' && (
                                        <div className="logic-forge-layout">
                                            <div className="logic-forge-editor">
                                                <div className="game-code-label">
                                                    <Zap size={13} /> JavaScript Logic
                                                </div>
                                                <textarea
                                                    className={`game-logic-input logic-forge-textarea ${logicStatus}`}
                                                    value={logicInput}
                                                    onChange={e => {
                                                        setLogicInput(e.target.value);
                                                        if (logicStatus === 'wrong') setLogicStatus('neutral');
                                                    }}
                                                    placeholder={levelData.syntax || `function solution(${levelData.params}) {\n  // Your code here\n  return \n}`}
                                                    spellCheck={false}
                                                    disabled={answerRevealed}
                                                />
                                                <div className="logic-forge-hint">
                                                    <span>💡</span>
                                                    <span>Click Submit to run test cases.</span>
                                                </div>
                                            </div>

                                            {testResults && (
                                                <div className="logic-test-results">
                                                    <div className="logic-results-header">Test Results</div>
                                                    <div className="logic-results-list">
                                                        {testResults.map((res, i) => (
                                                            <div key={i} className={`logic-test-item ${res.passed ? 'passed' : 'failed'}`}>
                                                                <div className="logic-test-status">
                                                                    {res.passed ? '✓' : '✗'}
                                                                </div>
                                                                <div className="logic-test-details">
                                                                    <div className="logic-test-args">
                                                                        Input: ({res.args.join(', ')})
                                                                    </div>
                                                                    <div className="logic-test-comparison">
                                                                        {res.error ? (
                                                                            <span className="logic-error">Error: {res.error}</span>
                                                                        ) : (
                                                                            <>
                                                                                Expected: <span className="logic-val">{res.expected === undefined ? 'undefined' : JSON.stringify(res.expected)}</span> | 
                                                                                Actual: <span className="logic-val">{res.actual === undefined ? 'undefined' : JSON.stringify(res.actual)}</span>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {levelData.options && levelData.answer !== undefined && (
                                        <div className="game-options-list">
                                            {levelData.options.map((opt, i) => {
                                                const isCorrect = answerRevealed && i === levelData.answer;
                                                const isWrong = answerRevealed && wrongSelection === i;
                                                const isSelected = !answerRevealed && selectedOption === i;

                                                return (
                                                    <button
                                                        key={i}
                                                        className={`game-option-btn ${isSelected ? 'selected' : ''} ${isWrong ? 'wrong' : ''} ${isCorrect ? 'correct' : ''}`}
                                                        onClick={() => !answerRevealed && setSelectedOption(i)}
                                                        disabled={answerRevealed}
                                                    >
                                                        <span className="option-letter">{String.fromCharCode(65 + i)}</span>
                                                        <span>{opt}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    )}

                                    <div className="game-actions centered-actions">
                                        <button
                                            className="game-nav-btn action-nav-btn"
                                            disabled={currentLvlIdx === 0}
                                            onClick={() => setCurrentLvlIdx(i => Math.max(0, i - 1))}
                                            title="Previous Level"
                                        >
                                            <ChevronLeft size={20} />
                                        </button>

                                        <button
                                            className="game-submit-btn"
                                            onClick={() => {
                                                const input = levelData.options ? String(selectedOption) : 
                                                            (activeGame === 'css-odyssey' ? cssInput : logicInput);
                                                handleVictory(input);
                                            }}
                                            disabled={isWarping || answerRevealed}
                                        >
                                            {isWarping ? 'Warping...' : 'Submit'} 
                                            <ArrowRight size={15} />
                                        </button>

                                        <button
                                            className="game-nav-btn action-nav-btn"
                                            disabled={currentLvlIdx >= levels.length - 1 || isWarping}
                                            onClick={handleNextLevel}
                                            title="Next Level"
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {!levelData && (
                                <div className="game-victory-state">
                                    <div className="game-victory-icon">🏆</div>
                                    <h3>Module Complete!</h3>
                                    <p>You've mastered all levels in this module.</p>
                                    <button className="game-submit-btn" onClick={() => { setActiveGame(null); setViewingSections(false); }}>
                                        Back to Library <ArrowRight size={15} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Right: Progress sidebar */}
                        <motion.div
                            initial={false}
                            animate={{ width: progressSidebarOpen ? 260 : 44 }}
                            className={`game-progress-sidebar ${progressSidebarOpen ? '' : 'collapsed'}`}
                        >
                            <button
                                className="gps-toggle-btn"
                                onClick={() => setProgressSidebarOpen(o => !o)}
                                title={progressSidebarOpen ? 'Collapse' : 'Expand'}
                            >
                                {progressSidebarOpen ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
                            </button>

                            <div className="gps-header">
                                <span>{progressSidebarOpen ? 'Level Progress' : ''}</span>
                            </div>
                            {progressSidebarOpen && (
                                <div className="gps-body">
                                    <div className="gps-levels">
                                        {(() => {
                                            const visibleLevels = currentPhase 
                                                ? levels.slice(currentPhase.start, currentPhase.end + 1)
                                                : levels;
                                            
                                            return visibleLevels.map((lvl, localIdx) => {
                                                const globalIdx = currentPhase ? currentPhase.start + localIdx : localIdx;
                                                const solved = isLevelSolved(globalIdx);
                                                const current = globalIdx === currentLvlIdx;
                                                const locked = isLevelLocked(globalIdx);
                                                return (
                                                    <button
                                                        key={globalIdx}
                                                        className={`gps-level-dot ${current ? 'current' : ''} ${solved ? 'solved' : ''} ${locked ? 'locked' : ''}`}
                                                        onClick={() => !locked && setCurrentLvlIdx(globalIdx)}
                                                        title={locked ? 'Locked' : lvl.title}
                                                        disabled={locked}
                                                    >
                                                        {locked ? <Lock size={10} /> : localIdx + 1}
                                                    </button>
                                                );
                                            });
                                        })()}
                                    </div>
                                    <div className="gps-stat">
                                        {(() => {
                                            const phaseLevels = currentPhase 
                                                ? levels.slice(currentPhase.start, currentPhase.end + 1)
                                                : levels;
                                            const solvedInPhase = phaseLevels.filter((_, i) => {
                                                const globalIdx = currentPhase ? currentPhase.start + i : i;
                                                return isLevelSolved(globalIdx);
                                            }).length;
                                            return (
                                                <>
                                                    <span>{solvedInPhase}</span>
                                                    <span>/ {phaseLevels.length} solved</span>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </motion.div>
            )}

            {/* ── Custom Popup Modal ── */}
            <AnimatePresence>
                {showModal && (
                    <motion.div 
                        className="arcade-modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowModal(false)}
                    >
                        <motion.div 
                            className={`arcade-modal-card ${modalConfig.type}`}
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <div className="modal-icon-wrap">
                                    {modalConfig.type === 'success' ? (
                                        <CheckCircle2 size={32} color="#10b981" />
                                    ) : (
                                        <AlertCircle size={32} color="#ef4444" />
                                    )}
                                </div>
                                <button className="modal-close-btn" onClick={() => setShowModal(false)}>
                                    <X size={20} />
                                </button>
                            </div>
                            <div className="modal-body">
                                <h3 className="modal-title">{modalConfig.title}</h3>
                                <p className="modal-message">{modalConfig.message}</p>
                            </div>
                            <div className="modal-footer">
                                {modalConfig.type === 'success' ? (
                                    <>
                                        <button 
                                            className="modal-secondary-btn"
                                            onClick={() => setShowModal(false)}
                                        >
                                            Review
                                        </button>
                                        <button 
                                            className="modal-action-btn success"
                                            onClick={() => {
                                                setShowModal(false);
                                                handleNextLevel();
                                            }}
                                            disabled={currentLvlIdx >= levels.length - 1}
                                        >
                                            {currentLvlIdx >= levels.length - 1 ? 'Finish Module' : 'Next Level'}
                                            <ArrowRight size={18} style={{ marginLeft: '8px' }} />
                                        </button>
                                    </>
                                ) : (
                                    <button 
                                        className="modal-action-btn error"
                                        onClick={handleTryAgain}
                                    >
                                        Try Again
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Arcade;
