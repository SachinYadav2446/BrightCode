import React, { useState, useEffect } from 'react';
import { BookOpen, ChevronLeft, ArrowRight, Award, Brain, Database, Server, Cpu, Check, X, ShieldAlert, Loader, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';
import { JAVA_LEVELS, CPP_LEVELS, PYTHON_LEVELS, GO_LEVELS } from '../data/languageData';
import { REACT_LEVELS } from '../data/arcadeData';
import './Library.css';

// Helper to preprocess static local questions for old modules
const getLocalQuestionsForModule = (modId) => {
  let rawList = [];
  let prefix = "";
  if (modId === 'java-master') {
    rawList = JAVA_LEVELS;
    prefix = "java";
  } else if (modId === 'cpp-master') {
    rawList = CPP_LEVELS;
    prefix = "cpp";
  } else if (modId === 'python-master') {
    rawList = PYTHON_LEVELS;
    prefix = "python";
  } else if (modId === 'go-master') {
    rawList = GO_LEVELS;
    prefix = "go";
  } else if (modId === 'react-quest') {
    rawList = REACT_LEVELS;
    prefix = "react";
  } else {
    return null;
  }

  const total = rawList.length;
  return rawList.map((q, idx) => {
    // Distribute flat array into 4 balanced difficulties
    let difficulty = "Basic";
    if (idx >= Math.floor(total * 0.75)) difficulty = "Expert";
    else if (idx >= Math.floor(total * 0.50)) difficulty = "Advanced";
    else if (idx >= Math.floor(total * 0.25)) difficulty = "Intermediate";

    return {
      id: `${prefix}_${q.id || idx + 1}`,
      difficulty,
      question: q.question,
      options: q.options || q.opts || [],
      answer: q.answer !== undefined ? q.answer : q.ans,
      explanation: q.explanation || `Concept mastery check for ${modId.replace('-master', '').replace('-quest', '')} fundamentals.`
    };
  });
};

const Library = ({ initialModule = null, onBack = null }) => {
  const { user, updateXP } = useAuth();
  const [libraryQuestions, setLibraryQuestions] = useState({});
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  const [activeModule, setActiveModule] = useState(initialModule); // 'nodejs' | 'express' | 'mongodb' | 'sql' | 'database' | 'react-quest' | ...
  const [activeDifficulty, setActiveDifficulty] = useState('Basic'); // 'Basic' | 'Intermediate' | 'Advanced' | 'Expert'
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null); // null | index
  const [solvedState, setSolvedState] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('library_solved_state') || '{}');
    } catch (e) {
      return {};
    }
  }); // { [questionId]: { selected, isCorrect } }

  const modules = [
    {
      id: 'nodejs',
      name: 'Node.js Core Runtime',
      icon: <Cpu size={32} />,
      desc: 'Master the event loop, streams, buffer management, cluster configurations, and Libuv thread pool operations.',
      color: '#339933',
      lightColor: 'rgba(51, 153, 51, 0.15)',
      glowColor: 'rgba(51, 153, 51, 0.4)'
    },
    {
      id: 'express',
      name: 'Express.js Framework',
      icon: <Server size={32} />,
      desc: 'Build scalable APIs. Deep dive into middleware routing pipelines, advanced async handlers, rate limiting, and core layer design.',
      color: '#828282',
      lightColor: 'rgba(130, 130, 130, 0.15)',
      glowColor: 'rgba(130, 130, 130, 0.4)'
    },
    {
      id: 'mongodb',
      name: 'MongoDB Document DB',
      icon: <Database size={32} />,
      desc: 'Tune aggregation pipelines, structure sharding keys, configure replica sets, WiredTiger MVCC, and ODM validation layers.',
      color: '#47A248',
      lightColor: 'rgba(71, 162, 72, 0.15)',
      glowColor: 'rgba(71, 162, 72, 0.4)'
    },
    {
      id: 'sql',
      name: 'SQL Relational Engines',
      icon: <Brain size={32} />,
      desc: 'Optimize joins, configure transaction isolation levels, resolve deadlocks, parse recursive CTEs, and write-ahead log recovery.',
      color: '#00758F',
      lightColor: 'rgba(0, 117, 143, 0.15)',
      glowColor: 'rgba(0, 117, 143, 0.4)'
    },
    {
      id: 'database',
      name: 'Database Systems',
      icon: <Award size={32} />,
      desc: 'Deep dive into transactional ACID properties, MVCC, write-ahead logs, CAP theorem, normal forms, and LSM-tree structures.',
      color: '#e28743',
      lightColor: 'rgba(226, 135, 67, 0.15)',
      glowColor: 'rgba(226, 135, 67, 0.4)'
    }
  ];

  // Fetch library questions from the backend API
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        // Prioritize local static data for legacy modules
        const localData = getLocalQuestionsForModule(activeModule);
        if (localData) {
          setLibraryQuestions(prev => ({
            ...prev,
            [activeModule]: localData
          }));
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_URL}/api/library/questions`);
        if (!response.ok) {
          throw new Error('Failed to fetch from backend library node.');
        }
        const json = await response.json();
        if (json.success) {
          setLibraryQuestions(json.data);
        } else {
          throw new Error(json.error || 'Server rejected request');
        }
      } catch (err) {
        console.error('[LIBRARY] Fetch error:', err);
        setErrorMsg('Failed to synchronize tactical archives from server core.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [activeModule]);

  // Persist solved state to localStorage on modification
  useEffect(() => {
    try {
      localStorage.setItem('library_solved_state', JSON.stringify(solvedState));
    } catch (e) {
      console.error('[LIBRARY] Error persisting solved state:', e);
    }
  }, [solvedState]);

  // Self-heal: Pre-populate solvedState from DB user progress levels for legacy modules
  useEffect(() => {
    if (activeModule && ['java-master', 'cpp-master', 'python-master', 'go-master', 'react-quest'].includes(activeModule) && user) {
      let dbLevel = 0;
      let prefix = "";
      if (activeModule === 'java-master') { dbLevel = user.java_level || 0; prefix = "java"; }
      else if (activeModule === 'cpp-master') { dbLevel = user.cpp_level || 0; prefix = "cpp"; }
      else if (activeModule === 'python-master') { dbLevel = user.python_level || 0; prefix = "python"; }
      else if (activeModule === 'go-master') { dbLevel = user.go_level || 0; prefix = "go"; }
      else if (activeModule === 'react-quest') { dbLevel = user.react_level || 0; prefix = "react"; }

      if (dbLevel > 0) {
        setSolvedState(prev => {
          const updated = { ...prev };
          let changed = false;
          for (let i = 1; i <= dbLevel; i++) {
            const qId = `${prefix}_${i}`;
            if (!updated[qId]) {
              updated[qId] = { selected: -1, isCorrect: true };
              changed = true;
            }
          }
          return changed ? updated : prev;
        });
      }
    }
  }, [activeModule, user]);

  const handleSelectModule = (modId) => {
    setActiveModule(modId);
    setActiveDifficulty('Basic');
    setCurrentQuestionIdx(0);
    setSelectedOption(null);
  };

  const handleBackToModules = () => {
    if (onBack) {
      onBack();
    } else {
      setActiveModule(null);
    }
  };

  const getFilteredQuestions = () => {
    if (!activeModule || !libraryQuestions[activeModule]) return [];
    return libraryQuestions[activeModule].filter(q => q.difficulty === activeDifficulty);
  };

  const questions = getFilteredQuestions();
  const currentQuestion = questions[currentQuestionIdx];

  const handleOptionClick = async (optionIdx) => {
    if (selectedOption !== null || (currentQuestion && solvedState[currentQuestion.id])) return;
    
    setSelectedOption(optionIdx);
    const isCorrect = optionIdx === currentQuestion.answer;
    const isFirstSolve = !solvedState[currentQuestion.id] && isCorrect;
    
    setSolvedState(prev => ({
      ...prev,
      [currentQuestion.id]: {
        selected: optionIdx,
        isCorrect
      }
    }));

    // Award 10 XP on backend + update local state if first solve
    if (isFirstSolve && user) {
      try {
        const token = localStorage.getItem('token');
        const levelIndex = (libraryQuestions[activeModule] || []).findIndex(q => q.id === currentQuestion.id) + 1;
        
        const response = await fetch(`${API_URL}/add-xp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: 10,
            module: activeModule,
            level: levelIndex > 0 ? levelIndex : 1
          })
        });
        
        const json = await response.json();
        if (json.success) {
          const { xp, ...stats } = json;
          updateXP(xp, stats);
        }
      } catch (err) {
        console.error('[LIBRARY XP SYNC ERROR]', err);
      }
    }
  };

  const handleNext = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
    }
  };

  const handlePrev = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
      setSelectedOption(null);
    }
  };

  // Stats calculation
  const getModuleStats = (modId) => {
    const allQuestions = libraryQuestions[modId] || [];
    const solved = allQuestions.filter(q => solvedState[q.id]);
    const correct = solved.filter(q => solvedState[q.id].isCorrect);
    return {
      total: allQuestions.length,
      solvedCount: solved.length,
      correctCount: correct.length,
      progressPercent: Math.round((solved.length / allQuestions.length) * 100) || 0
    };
  };

  return (
    <div className="library-page">
      <Navbar />

      <div className="library-glow-bg">
        <div className="glow-orb orb-lib-1"></div>
        <div className="glow-orb orb-lib-2"></div>
      </div>

      <div className="library-container">
        {loading ? (
          <div className="library-loader-wrap">
            <Loader className="spin-animation" size={48} />
            <p>Syncing tactical codex library...</p>
          </div>
        ) : errorMsg ? (
          <div className="library-error-wrap">
            <ShieldAlert size={64} style={{ color: '#ef4444' }} />
            <h1>Synchronicity Error</h1>
            <p>{errorMsg}</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {!activeModule ? (
              // MODULE SELECTION SCREEN (Fallback in case accessed directly via /library route)
              <motion.div
                key="selection"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="selection-layout"
              >
                <div className="library-header-section">
                  <span className="library-tagline">TACTICAL CODEX</span>
                  <h1 className="library-title">System Libraries</h1>
                  <p className="library-subtitle">
                    Choose a domain to solve interactive conceptual check modules from Basic to Expert levels. Track your precision and unlock master titles.
                  </p>
                </div>

                <div className="modules-grid">
                  {modules.map((mod) => {
                    const stats = getModuleStats(mod.id);
                    return (
                      <motion.div
                        key={mod.id}
                        whileHover={{ y: -6, scale: 1.01 }}
                        className="module-card"
                        style={{ '--card-glow-color': mod.glowColor }}
                        onClick={() => handleSelectModule(mod.id)}
                      >
                        <div className="card-accent-border" style={{ background: mod.color }}></div>
                        <div className="card-top">
                          <div className="module-icon-wrap" style={{ color: mod.color, background: mod.lightColor }}>
                            {mod.icon}
                          </div>
                          <span className="q-count">{stats.total} MCQs</span>
                        </div>
                        
                        <h2 className="module-name">{mod.name}</h2>
                        <p className="module-desc">{mod.desc}</p>

                        <div className="module-progress-section">
                          <div className="progress-label-row">
                            <span>Progress</span>
                            <span>{stats.progressPercent}%</span>
                          </div>
                          <div className="progress-bar-bg">
                            <div 
                              className="progress-bar-fill" 
                              style={{ width: `${stats.progressPercent}%`, background: mod.color }}
                            ></div>
                          </div>
                          <div className="precision-pill">
                            Precision: {stats.solvedCount > 0 ? Math.round((stats.correctCount / stats.solvedCount) * 100) : 0}% ({stats.correctCount}/{stats.solvedCount} Solved)
                          </div>
                        </div>

                        <div className="enter-action">
                          <span>Enter Module</span>
                          <ArrowRight size={14} />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              // INTERACTIVE MCQ PLAY SCREEN
              <motion.div
                key="player"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="player-layout"
              >
                {/* Back Header */}
                <div className="player-back-bar">
                  <button className="back-btn-theme" onClick={handleBackToModules}>
                    <ChevronLeft size={16} />
                    <span>Back to Libraries</span>
                  </button>
                  <div className="active-module-indicator">
                    {activeModule === 'react-quest' ? 'React Forge' :
                     activeModule === 'java-master' ? 'Java Mastery' :
                     activeModule === 'cpp-master' ? 'C++ Mastery' :
                     activeModule === 'python-master' ? 'Python Mastery' :
                     activeModule === 'go-master' ? 'Go Mastery' :
                     modules.find(m => m.id === activeModule)?.name}
                  </div>
                </div>

                {/* Progress and Difficulty navigation */}
                <div className="difficulty-tabs-strip">
                  {['Basic', 'Intermediate', 'Advanced', 'Expert'].map((diff) => {
                    const isActive = activeDifficulty === diff;
                    const totalDiffQ = (libraryQuestions[activeModule] || []).filter(q => q.difficulty === diff).length;
                    const solvedDiffQ = (libraryQuestions[activeModule] || [])
                      .filter(q => q.difficulty === diff && solvedState[q.id]).length;
                    
                    return (
                      <button
                        key={diff}
                        className={`diff-tab-btn ${isActive ? 'active' : ''}`}
                        onClick={() => {
                          setActiveDifficulty(diff);
                          setCurrentQuestionIdx(0);
                          setSelectedOption(null);
                        }}
                      >
                        <span className="diff-name">{diff}</span>
                        <span className="diff-stats">{solvedDiffQ}/{totalDiffQ}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Main Quiz Hub */}
                {questions.length > 0 ? (
                  <div className="quiz-main-container">
                    <div className="quiz-left-panel">
                      <div className="q-status-badge">
                        <span>QUESTION {currentQuestionIdx + 1} of {questions.length}</span>
                        <span className="diff-badge" data-difficulty={activeDifficulty}>{activeDifficulty}</span>
                      </div>

                      <h2 className="main-question-text">{currentQuestion.question}</h2>

                      {/* Options list */}
                      <div className="options-grid">
                        {currentQuestion.options.map((option, idx) => {
                          const state = solvedState[currentQuestion.id];
                          const isAnswered = !!state;
                          const isCurrentOptionSelected = state?.selected === idx;
                          const isCorrectAnswer = currentQuestion.answer === idx;

                          let optionClass = "";
                          if (isAnswered) {
                            if (isCorrectAnswer) {
                              optionClass = "correct";
                            } else if (isCurrentOptionSelected) {
                              optionClass = "wrong";
                            } else {
                              optionClass = "disabled";
                            }
                          } else if (selectedOption === idx) {
                            optionClass = "selected";
                          }

                          return (
                            <div
                              key={idx}
                              className={`option-row ${optionClass}`}
                              onClick={() => handleOptionClick(idx)}
                            >
                              <span className="option-letter">
                                {String.fromCharCode(65 + idx)}
                              </span>
                              <span className="option-text">{option}</span>
                              <div className="status-marker">
                                {isAnswered && isCorrectAnswer && <Check size={16} />}
                                {isAnswered && isCurrentOptionSelected && !isCorrectAnswer && <X size={16} />}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanations section */}
                      {(solvedState[currentQuestion.id] || selectedOption !== null) && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="explanation-box"
                        >
                          <div className="exp-header">
                            <Award size={16} style={{ color: '#fbbf24' }} />
                            <span>System Diagnostic Explanation</span>
                          </div>
                          <p className="exp-text">{currentQuestion.explanation}</p>
                        </motion.div>
                      )}

                      {/* Navigation Buttons */}
                      <div className="quiz-nav-row">
                        <button 
                          className="nav-btn prev" 
                          disabled={currentQuestionIdx === 0}
                          onClick={handlePrev}
                        >
                          Previous
                        </button>
                        <button 
                          className="nav-btn next" 
                          disabled={currentQuestionIdx === questions.length - 1}
                          onClick={handleNext}
                        >
                          Next
                        </button>
                      </div>
                    </div>

                    {/* Sidebar stats panel */}
                    <div className="quiz-right-sidebar">
                      <div className="stat-module-box">
                        <h3>Difficulty Progress</h3>
                        <div className="radial-metric-row">
                          <div className="metric-val">
                            {questions.filter(q => solvedState[q.id]).length} / {questions.length}
                          </div>
                          <span className="metric-lbl">COMPLETED</span>
                        </div>
                        <div className="diff-progress-bar">
                          <div 
                            className="diff-bar-fill" 
                            style={{ 
                              width: `${(questions.filter(q => solvedState[q.id]).length / questions.length) * 100}%` 
                            }}
                          ></div>
                        </div>
                      </div>

                      <div className="stat-module-box secondary">
                        <h3>Tactical Score</h3>
                        <div className="score-rows">
                          <div className="score-row">
                            <span>Total Solved:</span>
                            <span className="stat-highlight">
                              {Object.keys(solvedState).filter(id => id.startsWith(activeModule === 'react-quest' ? 'react_' :
                                                                                 activeModule === 'java-master' ? 'java_' :
                                                                                 activeModule === 'cpp-master' ? 'cpp_' :
                                                                                 activeModule === 'python-master' ? 'python_' :
                                                                                 activeModule === 'go-master' ? 'go_' : activeModule)).length}
                            </span>
                          </div>
                          <div className="score-row">
                            <span>Accuracy Rate:</span>
                            <span className="stat-highlight">
                              {(() => {
                                const modPrefix = activeModule === 'react-quest' ? 'react_' :
                                                  activeModule === 'java-master' ? 'java_' :
                                                  activeModule === 'cpp-master' ? 'cpp_' :
                                                  activeModule === 'python-master' ? 'python_' :
                                                  activeModule === 'go-master' ? 'go_' : activeModule;
                                const moduleSolves = Object.keys(solvedState).filter(id => id.startsWith(modPrefix));
                                const corrects = moduleSolves.filter(id => solvedState[id].isCorrect);
                                return moduleSolves.length > 0 ? `${Math.round((corrects.length / moduleSolves.length) * 100)}%` : '0%';
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="empty-difficulty">
                    <ShieldAlert size={48} />
                    <h3>Diagnostic Mode Locked</h3>
                    <p>Database queries for this section are compiling.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export default Library;
