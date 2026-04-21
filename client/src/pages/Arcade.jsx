import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Gamepad2, ArrowLeft, Code2, Trophy, Zap, ArrowRight, Lock, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import './Arcade.css';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

import { 
    CSS_LEVELS, LOGIC_LEVELS, REACT_LEVELS, 
    SUBJECT_PHASES, PHASE_THEORIES, ALL_QUOTES 
} from '../data/arcadeData';

const Arcade = () => {
    const { user, updateXP } = useAuth();
    const navigate = useNavigate();
    const goBackPreserveScroll = () => {
        if (window.history.length > 1) navigate(-1);
        else navigate('/');
    };
    const [activeGame, setActiveGame] = useState(null);
    const [gameSliderIdx, setGameSliderIdx] = useState(0);
    const [selectedOption, setSelectedOption] = useState(null);
    const [answerRevealed, setAnswerRevealed] = useState(false);
    const [wrongSelection, setWrongSelection] = useState(null);
    const [cssInput, setCssInput] = useState('');
    const [currentLvlIdx, setCurrentLvlIdx] = useState(0);
    const [showTheory, setShowTheory] = useState(false);
    const [viewingSections, setViewingSections] = useState(false);
    const [isWarping, setIsWarping] = useState(false);
    const [showRetreatConfirm, setShowRetreatConfirm] = useState(false);
    const [phaseCompleteMessage, setPhaseCompleteMessage] = useState('');
    const [hoveredLockedPhase, setHoveredLockedPhase] = useState(null);
    
    // Mapping game IDs to their respective level arrays
    const gameMap = {
        'css-odyssey': CSS_LEVELS,
        'logic-lab': LOGIC_LEVELS,
        'react-quest': REACT_LEVELS
    };

    const [xp, setXP] = useState(() => {
        return parseInt(localStorage.getItem('user_xp')) || 0;
    });

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
        
        // Sync: If DB is ahead of local, or vice versa
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

    useEffect(() => {
        setSelectedOption(null);
        setAnswerRevealed(false);
        setWrongSelection(null);
    }, [currentLvlIdx, activeGame]);

    useEffect(() => {
        // Keep solved React MCQs locked with the correct answer on revisit.
        if (activeGame !== 'react-quest' || currentLvlIdx === 'WIN' || !levelData) return;
        if (savedSolutions[currentLvlIdx]) {
            setSelectedOption(levelData.answer);
            setAnswerRevealed(true);
        }
    }, [activeGame, currentLvlIdx, savedSolutions, levelData]);

    const isLevelSolved = (levelIdx) => {
        return Boolean(savedSolutions[levelIdx]) || levelIdx < highestLevel;
    };

    const isPhaseUnlocked = (phaseIdx) => {
        if (phaseIdx <= 0) return true;
        const phases = SUBJECT_PHASES[activeGame] || [];
        if (!phases.length) return true;

        // Strict progression: every previous section must be fully solved.
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
            // Prefer real solved entries in this phase; fallback to highestLevel.
            const solvedIdxInPhase = Object.keys(savedSolutions)
                .map((k) => Number(k))
                .filter((idx) => Number.isInteger(idx) && idx >= phase.start && idx <= phase.end)
                .sort((a, b) => b - a)[0];

            const fallbackIdx = highestLevel > 0 ? highestLevel - 1 : phase.start;
            const resumeBase = solvedIdxInPhase !== undefined ? solvedIdxInPhase : fallbackIdx;
            const resumeIdx = Math.min(Math.max(resumeBase, phase.start), phase.end);
            setCurrentLvlIdx(resumeIdx);
            setViewingSections(false);
            setSelectedOption(null);
            setAnswerRevealed(false);
            // Show theory for code games, hide for MCQ games initially
            if (activeGame === 'css-odyssey' || activeGame === 'logic-lab') setShowTheory(true);
            else setShowTheory(false);
        }
    };


    const checkCSSWin = (code) => {
        if (activeGame === 'logic-lab') {
            checkLogicWin(code);
            return;
        }
        if (!levelData) return;
        const cleanStr = code.replace(/\s+/g, '').replace(/;/g, '').toLowerCase();
        
        let allPassed = true;
        for (let reqItem of levelData.reqs) {
            let itemPassed = false;
            
            if (Array.isArray(reqItem)) {
                for (let alias of reqItem) {
                    const cleanReq = alias.replace(/\s+/g, '').replace(/;/g, '').toLowerCase();
                    if (cleanStr.includes(cleanReq)) {
                        itemPassed = true;
                        break;
                    }
                }
            } else {
                const cleanReq = reqItem.replace(/\s+/g, '').replace(/;/g, '').toLowerCase();
                if (cleanStr.includes(cleanReq)) itemPassed = true;
            }

            if (!itemPassed) {
                allPassed = false;
                break;
            }
        }

        if (allPassed) {
            handleVictory(code);
        } else {
            toast.error('Simulation Failed! Please check your CSS syntax.');
        }
    };

    const checkLogicWin = (code) => {
        try {
            const solveFunc = new Function(levelData.params, code + '; return solve(' + levelData.params + ');');
            let testsPassed = true;
            for (let test of levelData.testCases) {
                const actual = solveFunc(...test.slice(0, -1));
                const expected = test[test.length - 1];
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    testsPassed = false;
                    break;
                }
            }
            if (testsPassed) handleVictory(code);
            else toast.error('Logic Error: Test cases failed!');
        } catch(e) {
            toast.error('Syntax Error: ' + e.message);
        }
    };

    const checkReactWin = (idx) => {
        if (answerRevealed || wrongSelection !== null) return;
        
        if (idx === levelData.answer) {
            setSelectedOption(idx);
            setAnswerRevealed(true);
            toast.success('Correct! Neural link established.', {
                icon: '✅',
                style: { background: '#0a0a0a', color: '#10b981', border: '1px solid #10b981' }
            });
        } else {
            setWrongSelection(idx);
            setTimeout(() => {
                setWrongSelection(null);
            }, 1000);
        }
    };

    const playPhaseCompleteAudio = () => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const t0 = ctx.currentTime;

            const master = ctx.createGain();
            master.gain.setValueAtTime(0.0001, t0);
            master.gain.exponentialRampToValueAtTime(0.22, t0 + 0.05);
            master.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.2);
            master.connect(ctx.destination);

            // "Well done" style triad swell
            const notes = [392, 494, 587]; // G4 B4 D5
            notes.forEach((hz, i) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.type = 'triangle';
                o.frequency.setValueAtTime(hz, t0 + i * 0.08);
                g.gain.setValueAtTime(0.0001, t0 + i * 0.08);
                g.gain.exponentialRampToValueAtTime(0.18, t0 + i * 0.08 + 0.08);
                g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.9);
                o.connect(g).connect(master);
                o.start(t0 + i * 0.08);
                o.stop(t0 + 0.95);
            });

            // Unlock chime
            const chime = ctx.createOscillator();
            const chimeGain = ctx.createGain();
            chime.type = 'sine';
            chime.frequency.setValueAtTime(740, t0 + 0.75);
            chime.frequency.exponentialRampToValueAtTime(1100, t0 + 1.02);
            chimeGain.gain.setValueAtTime(0.0001, t0 + 0.72);
            chimeGain.gain.exponentialRampToValueAtTime(0.14, t0 + 0.8);
            chimeGain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.18);
            chime.connect(chimeGain).connect(master);
            chime.start(t0 + 0.72);
            chime.stop(t0 + 1.2);

            setTimeout(() => ctx.close().catch(() => {}), 1500);
        } catch {}
    };

    const handleVictory = (code, skipSolution = false) => {
        const alreadySolved = Boolean(savedSolutions[currentLvlIdx]);
        const newHighest = Math.max(highestLevel, currentLvlIdx + 1);
        setHighestLevel(newHighest);
        const storageKey = `highest_${activeGame.replace(/-/g, '_')}_level`;
        localStorage.setItem(storageKey, newHighest);

        // --- XP REWARD SYSTEM (Synced to DB) ---
        // Get the actual current highest level for this specific game from user object
        const dbHighest = activeGame === 'css-odyssey' ? (user?.css_level || 0) :
                         activeGame === 'logic-lab' ? (user?.logic_level || 0) :
                         activeGame === 'react-quest' ? (user?.react_level || 0) : 0;

        console.log(`[ARCADE] Validating Level: ${currentLvlIdx + 1} vs DB Highest: ${dbHighest}`);
        
        // Award XP on every successful challenge completion (Neural Pulse Reward)
        console.log('[ARCADE DEBUG] Awarding Neural Pulse XP...');
        let reward = alreadySolved ? 0 : 10; 
            // Standardized to 10 XP for all arcade types as per recent instruction

            const syncXp = async () => {
                try {
                    if (reward <= 0) return;
                    const token = localStorage.getItem('token');
                    const response = await axios.post('http://localhost:5050/add-xp', { 
                        amount: reward,
                        module: activeGame,
                        level: currentLvlIdx + 1
                    }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (response.data.success) {
                        const { xp, ...stats } = response.data;
                        updateXP(xp, stats);
                        localStorage.setItem('user_xp', xp);
                        
                        toast.success(`+${reward} XP EARNED (Synced)!`, {
                            icon: '⚡',
                            style: { background: '#1c1917', color: '#fbbf24', border: '1px solid #fbbf24' }
                        });
                    }
                } catch (err) {
                    console.error('XP Sync failed');
                    // Fallback to local
                    if (reward <= 0) return;
                    const newXP = xp + reward;
                    setXP(newXP);
                    localStorage.setItem('user_xp', newXP);
                    toast.success(`+${reward} XP EARNED (Local)!`);
                }
            };
            syncXp();

        const updatedSolutions = { ...savedSolutions, [currentLvlIdx]: skipSolution ? 'correct' : code };
        setSavedSolutions(updatedSolutions);
        localStorage.setItem(`${activeGame.replace(/-/g, '_')}_solutions`, JSON.stringify(updatedSolutions));

        const phases = SUBJECT_PHASES[activeGame] || [];
        const currentPhase = phases.find(p => currentLvlIdx >= p.start && currentLvlIdx <= p.end);
        const isEndOfSection = Boolean(currentPhase && currentLvlIdx === currentPhase.end);

        // On section completion, do not jump into next section level.
        if (isEndOfSection) {
            playPhaseCompleteAudio();
            const phaseNumber = phases.findIndex(p => p.name === currentPhase.name) + 1;
            const nextPhase = phases[phaseNumber];
            const msg = nextPhase
                ? `🔥 Phase ${phaseNumber} complete, fighter.\nWhen you entered this phase, you were just getting started.\nNow you have mastered its core topics and proved your grit.\n⚔️ Ahead, things get crazier — but you are a fighter.\nNext unlocked: ${nextPhase.label} 🔓`
                : `👑 Final phase complete, champion.\nYou were a learner when this journey began.\nNow you stand as a true arena warrior. 🩸`;
            setPhaseCompleteMessage(msg);
            setIsWarping(false);
            return;
        }

        setIsWarping(true);
        setTimeout(() => {
            setIsWarping(false);
            if (currentLvlIdx < levels.length - 1) {
                const nextLvl = levels[currentLvlIdx + 1];
                if ((activeGame === 'css-odyssey' || activeGame === 'logic-lab') && nextLvl.phase !== levelData.phase) {
                    setShowTheory(true);
                }
                setCurrentLvlIdx(currentLvlIdx + 1);
            } else {
                setCurrentLvlIdx('WIN');
            }
        }, 3500);
    };

    const resetProblem = () => {
        const updated = { ...savedSolutions };
        delete updated[currentLvlIdx];
        setSavedSolutions(updated);
        localStorage.setItem('css_solutions', JSON.stringify(updated));
        setCssInput('');
        toast.success('Simulation Purged & Reset');
    };

    return (
        <div className="arcade-page">
            <nav className="arcade-nav" style={{ 
                width: '100%',
                position: 'sticky',
                top: 0,
                zIndex: 1000,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '15px 40px',
                background: 'rgba(10, 10, 10, 0.8)',
                backdropFilter: 'blur(15px)',
                borderBottom: '1px solid rgba(251, 191, 36, 0.1)'
            }}>
                <div style={{ flex: 1 }}>
                    {!activeGame && (
                        <button 
                            className="back-home-btn" 
                            onClick={goBackPreserveScroll}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px', 
                                background: 'rgba(255,255,255,0.03)', 
                                border: '1px solid rgba(255,255,255,0.1)',
                                padding: '8px 16px',
                                borderRadius: '10px',
                                color: '#a8a29e',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#a8a29e'; }}
                        >
                            <ArrowLeft size={18} /> Back to Hub
                        </button>
                    )}
                </div>
                
                <div className="arcade-brand" style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
                    <Gamepad2 size={24} color="#ff3b3b" /> <span style={{ fontWeight: 800, color: 'white', fontSize: '1.2rem', marginLeft: '10px', letterSpacing: '0.5px' }}>Mega Training Arena</span>
                </div>

                <div style={{ flex: 1 }}></div>
            </nav>

            {!activeGame ? (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="arcade-container">
                    <div className="arcade-header">
                        <h1 style={{ fontSize: '3.5rem' }}>The Knowledge Matrix 🩸</h1>
                        <p>Progress through gated sections to reach the 100-level Absolute Mastery.</p>
                    </div>

                    <div style={{ position: 'relative', maxWidth: '850px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', padding: '0 40px' }}>
                        {/* Navigation Arrows */}
                        <button 
                            onClick={() => setGameSliderIdx(prev => (prev === 0 ? 8 : prev - 1))}
                            style={{ background: 'rgba(255,59,59,0.06)', border: '1px solid rgba(255,59,59,0.22)', color: 'white', padding: '15px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, transition: 'all 0.3s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,59,59,0.14)'; e.currentTarget.style.borderColor = 'rgba(255,59,59,0.35)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,59,59,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,59,59,0.22)'; }}
                        >
                            <ChevronLeft size={32} />
                        </button>

                        <div style={{ flex: 1, overflow: 'hidden', padding: '20px 0' }}>
                            <motion.div 
                                key={gameSliderIdx}
                                initial={{ opacity: 0, x: 60, filter: 'blur(10px)' }}
                                animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                                transition={{ type: 'spring', damping: 25, stiffness: 120 }}
                                style={{ width: '100%' }}
                            >
                                {(() => {
                                    const games = [
                                        { id: 'css-odyssey', title: 'CSS Odyssey', subtitle: 'Gated Masterclass', desc: 'Master layouts, grids, and complex animations in a high-fidelity simulator.', icon: <Code2 size={64} />, gradient: 'linear-gradient(135deg, #1a0000, #0b0000)', progressKey: 'highest_css_level', total: 50, btnColor: '#ef4444', accent: '#fca5a5' },
                                        { id: 'logic-lab', title: 'Logic Lab', subtitle: 'Algorithmic Forge', desc: 'Conquer 100 levels of JavaScript puzzles, from control flow to advanced patterns.', icon: <Zap size={64} />, gradient: 'linear-gradient(135deg, #240000, #090909)', progressKey: 'highest_logic_lab_level', total: 100, btnColor: '#dc2626', accent: '#f87171' },
                                        { id: 'react-quest', title: 'React Quest', subtitle: 'Component Crucible', desc: 'Theoretical MCQ challenges designed to push your React knowledge to its limits.', icon: <RefreshCw size={64} />, gradient: 'linear-gradient(135deg, #160000, #050505)', progressKey: 'highest_react_quest_level', total: 30, btnColor: '#b91c1c', accent: '#fca5a5' }
                                    ];
                                    const g = games[gameSliderIdx];
                                    const progValue = parseInt(localStorage.getItem(g.progressKey)) || 0;
                                    const pct = Math.round((progValue / g.total) * 100);

                                    return (
                                        <motion.div 
                                            className="game-card featured-game" 
                                            whileHover={{ y: -5 }}
                                            onClick={() => { setActiveGame(g.id); setViewingSections(true); }}
                                            style={{ minHeight: '380px', cursor: 'pointer', background: 'linear-gradient(180deg, rgba(24,0,0,0.7), rgba(8,0,0,0.88))', border: '1px solid rgba(255,90,90,0.28)', borderRadius: '32px', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.65)' }}
                                        >
                                            <div style={{ height: '220px', background: g.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                {/* Ambient Background Icon */}
                                                <div style={{ opacity: 0.05, position: 'absolute', top: '-10px', right: '-10px', scale: 2.5 }}>{g.icon}</div>
                                                
                                                <div style={{ textAlign: 'center' }}>
                                                    <motion.div 
                                                        animate={{ y: [0, -10, 0] }}
                                                        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                                        style={{ marginBottom: '15px', background: 'rgba(255,255,255,0.05)', width: '100px', height: '100px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 15px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                                                    >
                                                        {React.cloneElement(g.icon, { size: 48, color: g.accent })}
                                                    </motion.div>
                                                    <h2 style={{ color: 'white', fontSize: '2.2rem', fontWeight: 900, margin: 0, letterSpacing: '-1px' }}>{g.title}</h2>
                                                    <div style={{ color: g.accent, letterSpacing: '3px', textTransform: 'uppercase', fontSize: '0.7rem', fontWeight: 800, marginTop: '5px', opacity: 0.8 }}>{g.subtitle}</div>
                                                </div>
                                            </div>
                                            <div style={{ padding: '30px', flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                                <p style={{ color: '#a8a29e', fontSize: '1rem', lineHeight: 1.6, margin: 0, maxWidth: '95%' }}>{g.desc}</p>
                                                
                                                <div className="game-footer" style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid rgba(255,90,90,0.18)', paddingTop: '25px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: '1 1 0', minWidth: 0 }}>
                                                        <div style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
                                                            <span style={{ fontSize: '2rem', fontWeight: 900, color: 'white' }}>{pct}%</span>
                                                            <span style={{ color: '#666', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '1px' }}>MASTERY</span>
                                                        </div>
                                                        <div style={{ width: '100%', maxWidth: '240px', height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                                                            <motion.div 
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${pct}%` }}
                                                                style={{ height: '100%', background: g.btnColor, borderRadius: '2px' }} 
                                                            />
                                                        </div>
                                                    </div>
                                                    <button
                                                        className="primary-btn glow-btn"
                                                        style={{
                                                            background: g.btnColor,
                                                            padding: '12px 16px',
                                                            fontSize: '0.95rem',
                                                            borderRadius: '12px',
                                                            fontWeight: 800,
                                                            flex: '0 0 30%',
                                                            maxWidth: '220px',
                                                            width: '100%',
                                                            justifyContent: 'center',
                                                            boxShadow: 'none',
                                                            transform: 'none',
                                                            whiteSpace: 'nowrap'
                                                        }}
                                                    >
                                                        Enter Arena <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                                                    </button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })()}
                            </motion.div>
                        </div>

                        <button 
                            onClick={() => setGameSliderIdx(prev => (prev === 2 ? 0 : prev + 1))}
                            style={{ background: 'rgba(255,59,59,0.06)', border: '1px solid rgba(255,59,59,0.22)', color: 'white', padding: '15px', borderRadius: '50%', cursor: 'pointer', zIndex: 10, transition: 'all 0.3s' }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,59,59,0.14)'; e.currentTarget.style.borderColor = 'rgba(255,59,59,0.35)'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,59,59,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,59,59,0.22)'; }}
                        >
                            <ChevronRight size={32} />
                        </button>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '50px' }}>
                        {[...Array(3)].map((_, idx) => (
                            <motion.div 
                                key={idx}
                                onClick={() => setGameSliderIdx(idx)}
                                animate={{ 
                                    width: gameSliderIdx === idx ? 40 : 12,
                                    opacity: gameSliderIdx === idx ? 1 : 0.3
                                }}
                                style={{ 
                                    height: '12px', 
                                    background: gameSliderIdx === idx ? '#ff3b3b' : 'rgba(255,255,255,0.35)', 
                                    borderRadius: '6px',
                                    cursor: 'pointer'
                                }} 
                            />
                        ))}
                    </div>
                </motion.div>
            ) : viewingSections ? (
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="active-game-container" style={{ background: 'transparent' }}>
                    <div className="arcade-header" style={{ position: 'relative' }}>
                        <button 
                            className="back-to-hub-btn" 
                            style={{ 
                                position: 'absolute', 
                                left: '20px', 
                                top: '0', 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px', 
                                padding: '10px 20px',
                                background: 'rgba(220,38,38,0.08)',
                                border: '1px solid rgba(255,59,59,0.25)',
                                borderRadius: '12px',
                                color: '#a8a29e',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                            onClick={() => { setActiveGame(null); setViewingSections(false); }}
                            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,59,59,0.18)'; e.currentTarget.style.color = 'white'; }}
                            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(220,38,38,0.08)'; e.currentTarget.style.color = '#a8a29e'; }}
                        >
                            <ChevronLeft size={18} /> Back to Selection
                        </button>
                        <h1 style={{ fontSize: '2.5rem' }}>Select Phase</h1>
                        <p>Complete 80% of previous phases to unlock further training modules.</p>
                    </div>
                    
                    <div className="phase-map" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '25px', maxWidth: '1400px', margin: '0 auto', width: '100%', padding: '20px' }}>
                        {(SUBJECT_PHASES[activeGame] || []).map((phase, idx) => {
                            const unlocked = isPhaseUnlocked(idx);
                            const phaseLevels = levels.filter(l => l.phase === phase.name);
                            const completedInPhase = phaseLevels.filter(l => isLevelSolved(levels.indexOf(l))).length;
                            const prevPhase = idx > 0 ? (SUBJECT_PHASES[activeGame] || [])[idx - 1] : null;
                            const prevTotal = prevPhase ? (prevPhase.end - prevPhase.start + 1) : 0;
                            const prevCompleted = prevPhase
                                ? Array.from({ length: prevTotal }, (_, i) => prevPhase.start + i).filter(isLevelSolved).length
                                : 0;
                            const lockHint = !unlocked && prevPhase
                                ? `Complete ${prevPhase.label} first (${prevCompleted}/${prevTotal} solved)`
                                : '';
                            const tauntMessages = [
                                "You're not my level yet. Earn your scars first.",
                                "Come back stronger. Defeat the previous phase to face me.",
                                "This gate opens only for warriors, not spectators.",
                                "Train harder. I don't fight unfinished fighters."
                            ];
                            const taunt = tauntMessages[idx % tauntMessages.length];
                            const showTaunt = !unlocked && hoveredLockedPhase === idx;
                            const rawPhaseIcon = PHASE_THEORIES[phase.name]?.icon;
                            const themedPhaseIcon = React.isValidElement(rawPhaseIcon)
                                ? React.cloneElement(rawPhaseIcon, {
                                    color: unlocked ? '#f87171' : '#7f1d1d'
                                })
                                : <Activity size={40} color={unlocked ? '#f87171' : '#7f1d1d'} />;
                            
                            return (
                                <motion.div 
                                    key={idx} 
                                    whileHover={unlocked ? { scale: 1.02, y: -5 } : {}}
                                    className={`phase-button glass-morphism ${unlocked ? 'unlocked' : 'locked'}`}
                                    style={{ 
                                        padding: '40px', 
                                        borderRadius: '24px', 
                                        cursor: unlocked ? 'pointer' : 'not-allowed', 
                                        textAlign: 'center',
                                        border: unlocked ? '1px solid rgba(255,59,59,0.28)' : '1px solid rgba(255,255,255,0.05)',
                                        background: unlocked ? 'rgba(255,59,59,0.06)' : 'rgba(255,255,255,0.01)',
                                        opacity: unlocked ? 1 : 0.4,
                                        position: 'relative',
                                        transition: 'all 0.3s ease',
                                        transform: showTaunt ? 'perspective(900px) rotateY(7deg) scale(1.02)' : 'none',
                                        boxShadow: showTaunt ? '0 18px 36px -20px rgba(239,68,68,0.55)' : 'none'
                                    }}
                                    onClick={() => unlocked && startPhase(phase)}
                                    onMouseEnter={() => { if (!unlocked) setHoveredLockedPhase(idx); }}
                                    onMouseLeave={() => { if (!unlocked) setHoveredLockedPhase(null); }}
                                    title={lockHint || undefined}
                                >
                                    {!unlocked && <Lock size={20} style={{ position: 'absolute', top: '20px', right: '20px', color: '#666' }} />}
                                    {showTaunt ? (
                                        <div style={{ minHeight: '150px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                                            <div style={{ fontSize: '1.6rem' }}>💀</div>
                                            <div style={{ color: '#fecaca', fontSize: '0.92rem', fontWeight: 700, lineHeight: 1.45, maxWidth: '220px' }}>
                                                {taunt}
                                            </div>
                                            <div style={{ fontSize: '0.68rem', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>
                                                Beat previous phase to challenge me
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div style={{ marginBottom: '20px', opacity: unlocked ? 1 : 0.5, display: 'flex', justifyContent: 'center' }}>
                                                {themedPhaseIcon}
                                            </div>
                                            <h3 style={{ color: 'white', marginBottom: '8px', fontSize: '1.2rem', fontWeight: 800 }}>{phase.label}</h3>
                                            <div style={{ 
                                                display: 'inline-block', 
                                                padding: '5px 15px', 
                                                background: unlocked ? 'rgba(255,59,59,0.12)' : 'rgba(255,255,255,0.03)', 
                                                borderRadius: '10px', 
                                                fontSize: '0.75rem', 
                                                color: unlocked ? '#fecaca' : '#666',
                                                fontWeight: 800,
                                                marginTop: '10px',
                                                border: unlocked ? '1px solid rgba(255,59,59,0.22)' : 'none'
                                            }}>
                                                {completedInPhase} / {phaseLevels.length} MODULES
                                            </div>
                                            {!unlocked && lockHint && (
                                                <div style={{
                                                    marginTop: '12px',
                                                    fontSize: '0.68rem',
                                                    color: '#a8a29e',
                                                    lineHeight: 1.4,
                                                    fontWeight: 600
                                                }}>
                                                    {lockHint}
                                                </div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>

                </motion.div>
            ) : isWarping ? (
                <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="warp-overlay active-game-container"
                    style={{ justifyContent: 'center', alignItems: 'center', background: '#000', textAlign: 'center' }}
                >
                    <motion.div
                        animate={{ 
                            scale: [1, 1.2, 1],
                            opacity: [0.5, 1, 0.5]
                        }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at center, rgba(251, 191, 36, 0.1) 0%, transparent 70%)' }}
                    />
                    
                    <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
                        <div style={{ color: activeGame === 'css-odyssey' ? '#fbbf24' : activeGame === 'logic-lab' ? '#8b5cf6' : '#f87171', fontSize: '0.8rem', fontWeight: 800, letterSpacing: '4px', textTransform: 'uppercase', marginBottom: '10px' }}>Mission Success</div>
                        <h1 style={{ fontSize: '4rem', color: 'white', marginBottom: '30px' }}>Level {levelData.id} Cleared</h1>
                        
                        <div className="quote-container" style={{ maxWidth: '600px', margin: '0 auto', padding: '0 20px' }}>
                            <p style={{ color: '#a8a29e', fontSize: '1.25rem', fontStyle: 'italic', lineHeight: 1.6, position: 'relative' }}>
                                <span style={{ fontSize: '3rem', position: 'absolute', top: '-20px', left: '-20px', opacity: 0.2 }}>"</span>
                                { (ALL_QUOTES[activeGame] || ["Keep building."])[currentLvlIdx % (ALL_QUOTES[activeGame]?.length || 1)] }
                                <span style={{ fontSize: '3rem', position: 'absolute', bottom: '-40px', right: '-20px', opacity: 0.2 }}>"</span>
                            </p>
                        </div>

                        <div className="warp-progress-bar" style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.1)', margin: '60px auto 0', overflow: 'hidden' }}>
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '100%' }}
                                transition={{ duration: 3.5 }}
                                style={{ height: '100%', background: activeGame === 'css-odyssey' ? '#fbbf24' : activeGame === 'logic-lab' ? '#8b5cf6' : '#ef4444' }}
                            />
                        </div>
                        <p style={{ color: '#666', fontSize: '0.7rem', marginTop: '10px', textTransform: 'uppercase', letterSpacing: '2px' }}>Warping to Next Challenge...</p>
                    </motion.div>
                </motion.div>
            ) : showTheory && currentLvlIdx !== 'WIN' ? (
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="theory-overlay active-game-container"
                    style={{ justifyContent: 'center', alignItems: 'center', background: 'radial-gradient(circle at center, #1a0000 0%, #050505 100%)' }}
                >
                    <button
                        className="back-to-sections-btn"
                        onClick={() => { setShowTheory(false); setViewingSections(true); }}
                        style={{
                            position: 'fixed',
                            top: '84px',
                            left: '20px',
                            zIndex: 1200,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 16px',
                            background: 'rgba(255,59,59,0.08)',
                            border: '1px solid rgba(255,59,59,0.25)',
                            borderRadius: '12px',
                            color: '#fecaca',
                            fontSize: '0.8rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.25s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,59,59,0.18)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,59,59,0.08)'; e.currentTarget.style.color = '#fecaca'; }}
                    >
                        <ChevronLeft size={16} /> Back to Sections
                    </button>
                    <div className="theory-card glass-morphism" style={{ maxWidth: '600px', padding: '40px', borderRadius: '24px', textAlign: 'center', background: 'linear-gradient(180deg, rgba(20,0,0,0.72), rgba(0,0,0,0.88))', border: '1px solid rgba(255,59,59,0.26)', boxShadow: '0 22px 52px -34px rgba(255,59,59,0.2)' }}>
                        <div className="theory-icon-circle" style={{ margin: '0 auto 20px', width: '80px', height: '80px', background: 'rgba(255,59,59,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid rgba(255,59,59,0.24)' }}>
                            {PHASE_THEORIES[levelData.phase]?.icon || <BookOpen size={40} color="#ff6b6b" />}
                        </div>
                        <h1 style={{ color: 'white', marginBottom: '10px' }}>{PHASE_THEORIES[levelData.phase]?.title || 'Module Insight'}</h1>
                        <p style={{ color: '#fecaca', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', fontSize: '0.8rem', marginBottom: '30px' }}>Knowledge Drop Initiated</p>
                        
                        <div className="theory-list" style={{ textAlign: 'left', marginBottom: '40px' }}>
                            {(PHASE_THEORIES[levelData.phase]?.content || []).map((point, idx) => (
                                <div key={idx} style={{ display: 'flex', gap: '15px', color: '#a8a29e', marginBottom: '15px', lineHeight: 1.5 }}>
                                    <div style={{ color: '#ff6b6b', fontWeight: 900 }}>•</div>
                                    <div>{point}</div>
                                </div>
                            ))}
                        </div>

                        <button className="primary-btn glow-btn" 
                            style={{ 
                                width: '100%', 
                                justifyContent: 'center', 
                                padding: '16px',
                                background: activeGame === 'css-odyssey' ? '#dc2626' : activeGame === 'logic-lab' ? '#b91c1c' : '#991b1b',
                                color: '#fff',
                                border: '1px solid rgba(255,120,120,0.22)',
                                boxShadow: 'none'
                            }} 
                            onClick={() => setShowTheory(false)}>
                            Start Phase Challenges <ArrowRight size={18} style={{ marginLeft: '10px' }} />
                        </button>
                    </div>
                </motion.div>
            ) : (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="active-game-container">
                    <AnimatePresence>
                        {phaseCompleteMessage && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'fixed',
                                    inset: 0,
                                    background: 'radial-gradient(circle at center, rgba(40,0,0,0.95) 0%, rgba(0,0,0,0.98) 68%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1500,
                                    padding: '20px'
                                }}
                            >
                                <motion.div
                                    initial={{ y: 16, scale: 0.96, opacity: 0 }}
                                    animate={{ y: 0, scale: 1, opacity: 1 }}
                                    exit={{ y: 10, scale: 0.98, opacity: 0 }}
                                    style={{
                                        width: 'min(980px, 100%)',
                                        minHeight: '56vh',
                                        background: 'linear-gradient(180deg, rgba(20,0,0,0.72), rgba(0,0,0,0.92))',
                                        border: '1px solid rgba(248,113,113,0.34)',
                                        borderRadius: '22px',
                                        padding: '42px 36px',
                                        boxShadow: '0 36px 90px -35px rgba(255,59,59,0.5)',
                                        textAlign: 'center',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '18px'
                                    }}
                                >
                                    <div style={{ fontSize: '1rem', color: '#fca5a5', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 900 }}>
                                        Journey Milestone ✅
                                    </div>
                                    <div style={{ color: '#fff', fontSize: '1.32rem', lineHeight: 1.7, fontWeight: 500, fontFamily: "'Poppins', sans-serif", whiteSpace: 'pre-line', maxWidth: '820px' }}>
                                        {phaseCompleteMessage}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setPhaseCompleteMessage('');
                                            setShowTheory(false);
                                            setViewingSections(true);
                                        }}
                                        style={{
                                            marginTop: '10px',
                                            background: '#dc2626',
                                            border: '1px solid rgba(248,113,113,0.34)',
                                            color: '#fff',
                                            fontSize: '1rem',
                                            fontWeight: 800,
                                            padding: '12px 26px',
                                            borderRadius: '12px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Next →
                                    </button>
                                </motion.div>
                            </motion.div>
                        )}
                        {showRetreatConfirm && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    position: 'fixed',
                                    inset: 0,
                                    background: 'rgba(0,0,0,0.65)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 1400,
                                    padding: '20px'
                                }}
                            >
                                <motion.div
                                    initial={{ scale: 0.92, y: 10, opacity: 0 }}
                                    animate={{ scale: 1, y: 0, opacity: 1 }}
                                    exit={{ scale: 0.95, y: 8, opacity: 0 }}
                                    style={{
                                        width: 'min(520px, 100%)',
                                        background: 'linear-gradient(180deg, rgba(20,0,0,0.92), rgba(0,0,0,0.96))',
                                        border: '1px solid rgba(248,113,113,0.35)',
                                        borderRadius: '16px',
                                        padding: '24px',
                                        boxShadow: '0 30px 70px -35px rgba(255,59,59,0.35)'
                                    }}
                                >
                                    <h3 style={{ margin: '0 0 10px', color: '#fff', fontSize: '1.2rem' }}>Hold up, fighter ⚔️</h3>
                                    <p style={{ margin: 0, color: '#fecaca', lineHeight: 1.6 }}>
                                        Warriors don&apos;t quit mid-battle. You&apos;ve already come this far — one more push can change everything.
                                        Still want to retreat?
                                    </p>
                                    <div style={{ display: 'flex', gap: '10px', marginTop: '18px', justifyContent: 'flex-end' }}>
                                        <button
                                            onClick={() => setShowRetreatConfirm(false)}
                                            style={{
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(255,255,255,0.16)',
                                                background: 'rgba(255,255,255,0.04)',
                                                color: '#fff',
                                                fontWeight: 700,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Keep Fighting
                                        </button>
                                        <button
                                            onClick={() => {
                                                setShowRetreatConfirm(false);
                                                setViewingSections(true);
                                                setShowTheory(false);
                                            }}
                                            style={{
                                                padding: '10px 14px',
                                                borderRadius: '10px',
                                                border: '1px solid rgba(248,113,113,0.4)',
                                                background: '#b91c1c',
                                                color: '#fff',
                                                fontWeight: 800,
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Retreat Anyway
                                        </button>
                                    </div>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div className="game-top-bar">
                        <button 
                            className="exit-btn" 
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '8px',
                                padding: '8px 16px',
                                background: 'rgba(255,255,255,0.03)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '8px',
                                color: '#a8a29e',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                cursor: 'pointer'
                            }} 
                            onClick={() => setShowRetreatConfirm(true)}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(220, 38, 38, 0.1)';
                                e.currentTarget.style.borderColor = 'rgba(220, 38, 38, 0.4)';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.boxShadow = '0 0 15px rgba(220, 38, 38, 0.15)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                                e.currentTarget.style.color = '#a8a29e';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                        >
                            <ArrowLeft size={16} /> Retreat from Campaign
                        </button>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                            {(() => {
                                const phases = SUBJECT_PHASES[activeGame] || [];
                                const currentPhase = phases.find(p => currentLvlIdx >= p.start && currentLvlIdx <= p.end) || phases[0];
                                
                                return (
                                    <>
                                        <button 
                                            className="nav-level-btn"
                                            disabled={currentLvlIdx <= currentPhase.start}
                                            style={{ 
                                                background: 'rgba(255,255,255,0.03)', 
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                padding: '5px',
                                                borderRadius: '6px',
                                                cursor: currentLvlIdx > currentPhase.start ? 'pointer' : 'not-allowed',
                                                opacity: currentLvlIdx > currentPhase.start ? 1 : 0.3,
                                                color: 'white'
                                            }}
                                            onClick={() => {
                                                setCurrentLvlIdx(currentLvlIdx - 1);
                                                setCssInput('');
                                            }}
                                        >
                                            <ChevronLeft size={20} />
                                        </button>

                                        <div style={{ textAlign: 'center' }}>
                                            <h2 style={{ margin: 0, fontSize: '1rem' }}>{currentLvlIdx === 'WIN' ? 'Master' : `${levelData.phase} • Level ${levelData.id}`}</h2>
                                            <div style={{ fontSize: '0.7rem', color: '#f87171', fontWeight: 600 }}>{currentLvlIdx === 'WIN' ? 'MAX' : `${levelData.id} / ${(activeGame === 'css-odyssey' ? CSS_LEVELS : activeGame === 'logic-lab' ? LOGIC_LEVELS : REACT_LEVELS).length}`}</div>
                                        </div>

                                        <button 
                                            className="nav-level-btn"
                                            disabled={currentLvlIdx >= currentPhase.end || currentLvlIdx >= highestLevel}
                                            style={{ 
                                                background: 'rgba(255,255,255,0.03)', 
                                                border: '1px solid rgba(255,255,255,0.1)',
                                                padding: '5px',
                                                borderRadius: '6px',
                                                cursor: (currentLvlIdx < currentPhase.end && currentLvlIdx < highestLevel) ? 'pointer' : 'not-allowed',
                                                opacity: (currentLvlIdx < currentPhase.end && currentLvlIdx < highestLevel) ? 1 : 0.3,
                                                color: 'white'
                                            }}
                                            onClick={() => {
                                                setCurrentLvlIdx(currentLvlIdx + 1);
                                                setCssInput('');
                                            }}
                                        >
                                            <ChevronRight size={20} />
                                        </button>
                                    </>
                                );
                            })()}
                        </div>

                        <div className="empty-spacer" style={{ width: '160px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '15px' }}>
                            <div className="xp-badge" style={{ 
                                background: 'rgba(239, 68, 68, 0.12)', 
                                border: '1px solid rgba(248, 113, 113, 0.32)',
                                padding: '6px 12px',
                                borderRadius: '20px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: '#fca5a5',
                                fontWeight: 700,
                                fontSize: '0.8rem',
                                boxShadow: '0 0 14px rgba(239, 68, 68, 0.12)'
                            }}>
                                <Zap size={14} fill="#f87171" />
                                {xp} XP
                            </div>
                        </div>
                    </div>

                    {activeGame === 'react-quest' ? (
                        /* ── REACT QUEST: PREMIUM QUIZ UI ── */
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 20px' }}>
                            {currentLvlIdx === 'WIN' ? (
                                <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
                                    <Trophy size={100} color="#ef4444" />
                                    <h2 style={{ color: 'white', marginTop: '20px', fontSize: '2.5rem' }}>React Master!</h2>
                                    <p style={{ color: '#a8a29e' }}>You conquered all 30 React challenges.</p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key={currentLvlIdx}
                                    initial={{ opacity: 0, y: 24 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.35 }}
                                    style={{ width: '100%', maxWidth: '680px', display: 'flex', flexDirection: 'column', gap: '24px' }}
                                >
                                    {/* Progress bar */}
                                    <div style={{ width: '100%' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>{levelData.phase}</span>
                                            <span style={{ color: '#666', fontSize: '0.75rem', fontWeight: 600 }}>{levelData.id} / {REACT_LEVELS.length}</span>
                                        </div>
                                        <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '99px', overflow: 'hidden' }}>
                                            <div style={{ height: '100%', width: `${(levelData.id / REACT_LEVELS.length) * 100}%`, background: 'linear-gradient(90deg, #dc2626, #f87171)', borderRadius: '99px', transition: 'width 0.5s ease' }} />
                                        </div>
                                    </div>

                                    {/* Question card */}
                                    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '36px', position: 'relative', overflow: 'hidden' }}>
                                        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #dc2626, #f87171)' }} />
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
                                            <span style={{ background: 'linear-gradient(135deg, #dc2626, #f87171)', borderRadius: '8px', padding: '4px 12px', fontSize: '0.7rem', fontWeight: 800, color: 'white', letterSpacing: '1px', textTransform: 'uppercase' }}>Question {levelData.id}</span>
                                            <span style={{ color: '#a8a29e', fontSize: '0.8rem' }}>{levelData.title}</span>
                                        </div>
                                        <p style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.55, margin: 0 }}>{levelData.question}</p>
                                    </div>

                                    {/* Options */}
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {(levelData.options || []).map((opt, i) => {
                                            const isSelected = selectedOption === i;
                                            const isRight = levelData.answer === i;
                                            const isWrong = wrongSelection === i;

                                            let bg = 'rgba(255,255,255,0.03)';
                                            let border = '1px solid rgba(255,255,255,0.08)';
                                            let color = '#a8a29e';
                                            let labelBg = 'rgba(255,255,255,0.05)';
                                            let labelColor = '#666';

                                            if (answerRevealed && isRight) {
                                                bg = 'rgba(16, 185, 129, 0.1)';
                                                border = '1px solid rgba(16, 185, 129, 0.4)';
                                                color = '#10b981';
                                                labelBg = '#10b981';
                                                labelColor = 'white';
                                            } else if (isWrong) {
                                                bg = 'rgba(239, 68, 68, 0.1)';
                                                border = '1px solid rgba(239, 68, 68, 0.4)';
                                                color = '#ef4444';
                                                labelBg = '#ef4444';
                                                labelColor = 'white';
                                            } else if (isSelected && !answerRevealed) {
                                                bg = 'rgba(239, 68, 68, 0.12)';
                                                border = '1px solid rgba(248, 113, 113, 0.4)';
                                                color = '#f87171';
                                                labelBg = '#ef4444';
                                                labelColor = 'white';
                                            }
                                            return (
                                                <motion.button key={i}
                                                    whileHover={!answerRevealed ? { scale: 1.015 } : {}}
                                                    whileTap={!answerRevealed ? { scale: 0.985 } : {}}
                                                    disabled={answerRevealed}
                                                    onClick={() => checkReactWin(i)}
                                                    style={{ background: bg, border, color, padding: '16px 20px', borderRadius: '14px', textAlign: 'left', cursor: answerRevealed ? 'default' : 'pointer', transition: 'all 0.2s', fontFamily: 'var(--font-sans)', fontSize: '0.95rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '16px' }}
                                                >
                                                    <span style={{ background: labelBg, color: labelColor, borderRadius: '8px', padding: '4px 10px', fontSize: '0.75rem', fontWeight: 800, fontFamily: 'monospace', flexShrink: 0, minWidth: '28px', textAlign: 'center', transition: 'all 0.2s' }}>{['A','B','C','D'][i]}</span>
                                                    {opt}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* Next Level button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02, y: -2 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={!answerRevealed || selectedOption !== levelData.answer}
                                        onClick={() => handleVictory('', true)}
                                        style={{ 
                                            width: '100%', 
                                            padding: '16px', 
                                            background: (answerRevealed && selectedOption === levelData.answer) ? 'linear-gradient(135deg, #dc2626, #f87171)' : 'rgba(255,255,255,0.04)', 
                                            border: (answerRevealed && selectedOption === levelData.answer) ? 'none' : '1px solid rgba(255,255,255,0.08)', 
                                            borderRadius: '14px', 
                                            color: (answerRevealed && selectedOption === levelData.answer) ? 'white' : '#444', 
                                            fontWeight: 700, 
                                            fontSize: '1rem', 
                                            cursor: (answerRevealed && selectedOption === levelData.answer) ? 'pointer' : 'not-allowed', 
                                            transition: 'all 0.3s', 
                                            boxShadow: (answerRevealed && selectedOption === levelData.answer) ? '0 10px 30px rgba(239,68,68,0.28)' : 'none',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px'
                                        }}
                                    >
                                        {(answerRevealed && selectedOption === levelData.answer) ? (
                                            <>Proceed to Next Level <ArrowRight size={20} /></>
                                        ) : (
                                            <><Lock size={18} /> Correct Option Required</>
                                        )}
                                    </motion.button>
                                </motion.div>
                            )}
                        </div>
                    ) : (
                        /* ── CODE GAMES: ORIGINAL LAYOUT ── */
                        <div className="css-sniper-layout" style={{ height: '80vh', minHeight: '600px' }}>
                        <div className="css-editor-panel" style={{ display: 'flex', flexDirection: 'column' }}>
                            {/* LEVEL HEADER - FIXED TOP */}
                            <div className="instructions" style={{ padding: '15px 20px', background: 'rgba(239, 68, 68, 0.10)', borderBottom: '1px solid rgba(248, 113, 113, 0.2)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                    <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>{levelData.title}</h3>
                                    <span style={{ fontSize: '0.65rem', background: '#ef4444', color: '#fff', padding: '2px 6px', borderRadius: '4px', fontWeight: 900 }}>CHALLENGE</span>
                                </div>
                                {currentLvlIdx !== 'WIN' && (
                                    <div style={{ padding: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '8px' }}>
                                        <p style={{ color: '#fca5a5', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Primary Objective:</p>
                                        <p style={{ margin: 0, opacity: 0.9, fontSize: '0.85rem', lineHeight: 1.4 }}>{levelData.desc}</p>
                                    </div>
                                )}
                            </div>

                            <div style={{ background: '#0a0a0a', border: '1px solid #333', borderRadius: '8px', padding: '15px', fontFamily: 'var(--font-mono)', fontSize: '0.9rem', marginBottom: '15px' }}>
                                {activeGame === 'css-odyssey' ? (
                                    <div style={{ color: '#ec4899' }}>{currentLvlIdx !== 'WIN' && levelData.isParent ? '#game-board' : '#player-box'} {'{'}</div>
                                ) : (
                                    <div style={{ color: '#10b981' }}>function solve({levelData.params}) {'{'}</div>
                                )}
                                <textarea className="css-textarea" style={{ height: '140px', width: '100%', background: 'transparent', border: 'none', outline: 'none', color: activeGame === 'css-odyssey' ? '#fbbf24' : '#60a5fa', fontFamily: 'inherit', marginTop: '10px', resize: 'none' }}
                                    value={cssInput} onChange={(e) => setCssInput(e.target.value)}
                                    placeholder={activeGame === 'css-odyssey' ? "/* Write CSS properties here... */" : "// Write logic implementation here..."}
                                    autoFocus
                                />
                                <div style={{ color: '#ec4899' }}>{'}'}</div>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button className="primary-btn glow-btn" style={{ flex: 1, justifyContent: 'center', padding: '10px', background: '#dc2626', color: '#fff', border: '1px solid rgba(248,113,113,0.28)', boxShadow: 'none' }} onClick={() => checkCSSWin(cssInput)}>
                                    {activeGame === 'css-odyssey' ? 'Evaluate Simulation' : 'Run Logic Suite'}
                                </button>
                                <button className="secondary-btn" style={{ padding: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} onClick={resetProblem} title="Reset Problem">
                                    <RefreshCw size={18} />
                                </button>
                            </div>

                            <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
                                {currentLvlIdx !== 'WIN' && (
                                    <>
                                        <div style={{ marginBottom: '25px', background: 'rgba(255,255,255,0.02)', padding: '15px', borderRadius: '8px' }}>
                                            <p style={{ color: '#10b981', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>
                                                {activeGame === 'css-odyssey' ? 'Technical Constraints:' : 'Required Test Outputs:'}
                                            </p>
                                            <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '0.8rem', color: '#a8a29e' }}>
                                                {activeGame === 'css-odyssey' ? (
                                                    (levelData.reqs || []).map((req, i) => (<li key={i} style={{ marginBottom: '4px' }}>Target: <code>{Array.isArray(req) ? req[0] : req}</code></li>))
                                                ) : (
                                                    (levelData.testCases || []).map((test, i) => (<li key={i} style={{ marginBottom: '4px' }}>Input: <code>({test.slice(0,-1).join(', ')})</code> → Expect: <code>{JSON.stringify(test[test.length-1])}</code></li>))
                                                )}
                                            </ul>
                                        </div>
                                        <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '20px' }}>
                                            <p style={{ color: '#3b82f6', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '10px' }}>Quick Property Reference:</p>
                                            <div style={{ fontSize: '0.7rem', color: '#666', background: 'rgba(255,255,255,0.01)', padding: '6px', borderRadius: '4px' }}>
                                                {activeGame === 'css-odyssey' ? (<><strong>Flex Layout:</strong> justify-content, align-items, flex-direction, gap</>) : (<><strong>Logic Ops:</strong> &&, ||, !, Math.max(), .reverse(), .split()</>)}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {currentLvlIdx === 'WIN' && <p><strong>Campaign Completed!</strong> You have officially mastered CSS Architecture.</p>}
                            </div>
                        </div>

                        {activeGame !== 'react-quest' && (
                        <div className="css-preview-panel" style={{ background: '#1c1917', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {currentLvlIdx === 'WIN' ? (
                                <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} style={{ textAlign: 'center' }}>
                                    <Trophy size={100} color="#f59e0b" />
                                    <h2 style={{ color: 'white', marginTop: '20px' }}>{activeGame === 'css-odyssey' ? 'CSS God' : 'God-Tier Logic Maestro'}</h2>
                                </motion.div>
                            ) : activeGame === 'css-odyssey' ? (
                                <div id="game-board" style={generateDynamicStyles(true)}>
                                    {renderLevelBoxes()}
                                </div>
                            ) : (
                                <div className="logic-monitor" style={{ width: '100%', height: '100%', padding: '40px', display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ flex: 1, background: '#000', borderRadius: '16px', border: '1px solid #333', padding: '30px', display: 'flex', flexDirection: 'column' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid #222', paddingBottom: '10px' }}>
                                            <span style={{ color: '#10b981', fontWeight: 600 }}>LOGIC CONSOLE V2.0</span>
                                            <span style={{ color: '#666', fontSize: '0.7rem' }}>RUNTIME: STABLE</span>
                                        </div>
                                        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
                                            <div style={{ color: '#60a5fa' }}>// Initializing algorithmic suite...</div>
                                            <div style={{ color: '#fbbf24' }}>// Level {levelData.id}: {levelData.title}</div>
                                            <div style={{ color: '#a8a29e' }}>// Running on 100-level neural forge.</div>
                                            <div style={{ marginTop: 'auto', padding: '15px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                                                <div style={{ color: '#666', fontSize: '0.65rem', marginBottom: '10px' }}>AVAILABLE PARAMS</div>
                                                <div style={{ color: '#fff', fontSize: '1.1rem' }}>{levelData.params}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        )}
                    </div>
                    )}
                </motion.div>
            )}
        </div>
    );

    function generateDynamicStyles(isParentCheck) {
        if (!levelData) return {};
        
        let styles = isParentCheck ? { width: '100%', height: '100%', border: '1px dashed rgba(255,255,255,0.2)', ...levelData.parentBase } : { ...levelData.base };

        try {
            if ((isParentCheck && levelData.isParent) || (!isParentCheck && !levelData.isParent)) {
                const lines = cssInput.split(';');
                const userStyles = {};
                lines.forEach(line => {
                    const [prop, val] = line.split(':');
                    if (prop && val) {
                        const reactProp = prop.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
                        userStyles[reactProp] = val.trim();
                    }
                });
                styles = { ...styles, ...userStyles };
            }
        } catch(e) {}
        return styles;
    }

    function renderLevelBoxes() {
        if (!levelData) return null;
        
        if (levelData.isNavbarMock) {
            return (
                <>
                    <h3 style={{ color: 'white', margin: 0 }}>Logo</h3>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <span style={{ color: 'white' }}>Home</span>
                        <span style={{ color: 'white' }}>About</span>
                        <span style={{ color: 'white' }}>Contact</span>
                    </div>
                </>
            );
        }

        const boxes = [];
        const count = levelData.multiBox || 1;
        for (let i = 0; i < count; i++) {
            boxes.push(
                <div key={i} style={generateDynamicStyles(false)}>
                    {count === 1 && levelData.renderBoxText && <span style={{color:'white'}}>{levelData.renderBoxText}</span>}
                </div>
            );
        }
        return boxes;
    }
};

export default Arcade;
