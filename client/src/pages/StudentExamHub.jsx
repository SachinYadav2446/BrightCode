import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { 
  Shield, AlertTriangle, Clock, CheckCircle2, XCircle, Play, 
  Send, School, User, Award, BookOpen, AlertOctagon, RefreshCw, 
  LogOut, ChevronRight, FileCode, Terminal, HelpCircle, Eye, EyeOff,
  Swords, Trophy, Code2, ExternalLink, Flame
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../config';
import './StudentExamHub.css';

// Starter templates for code editor
const STARTER_TEMPLATES = {
  javascript: `// Write your solution here\nfunction solve(input) {\n    // Parse input and return answer\n    return input;\n}\n\n// Read input from standard input\nconst fs = require('fs');\ntry {\n    const input = fs.readFileSync(0, 'utf-8').trim();\n    console.log(solve(input));\n} catch (e) {\n    // fallback\n}`,
  python: `# Write your solution here\nimport sys\n\ndef solve(input_data):\n    # Process input and return answer\n    return input_data\n\nif __name__ == '__main__':\n    input_data = sys.stdin.read().strip()\n    print(solve(input_data))`,
  cpp: `#include <iostream>\n#include <string>\nusing namespace std;\n\nint main() {\n    string s;\n    if (getline(cin, s)) {\n        cout << s << endl;\n    }\n    return 0;\n}`,
  java: `import java.util.Scanner;\n\npublic class Solution {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        if (sc.hasNextLine()) {\n            System.out.println(sc.nextLine());\n        }\n    }\n}`
};

const StudentExamHub = () => {
  const navigate = useNavigate();

  // Auth & Student Info
  const token = localStorage.getItem('token');
  const studentRollNo = localStorage.getItem('college_roll_no') || '21CS001';
  const studentName = localStorage.getItem('username') || 'Student';
  const orgName = localStorage.getItem('college_org_name') || 'Apex Institute of Technology';
  const orgCode = localStorage.getItem('college_org_code') || 'APEX';
  const branch = localStorage.getItem('college_branch') || 'CSE';
  const batch = localStorage.getItem('college_batch') || '2026';
  const userRole = localStorage.getItem('user_role') || 'student';

  // Dashboard state
  const [activeHubTab, setActiveHubTab] = useState('exams'); // 'exams' | 'assignments'
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [loadingAssignments, setLoadingAssignments] = useState(false);

  // Active Exam state
  const [activeExam, setActiveExam] = useState(null);
  const [activeQuestionIdx, setActiveQuestionIdx] = useState(0);
  const [submissions, setSubmissions] = useState({}); // { [questionId]: { code, language } }
  const [language, setLanguage] = useState('javascript');
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [violationsCount, setViolationsCount] = useState(0);
  const [showViolationModal, setShowViolationModal] = useState(false);
  const [violationAlertMsg, setViolationAlertMsg] = useState('');
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [examResult, setExamResult] = useState(null);

  // Test Runner state
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testOutput, setTestOutput] = useState(null);

  // Auth gate check
  useEffect(() => {
    if (!token) {
      navigate('/college-login');
      return;
    }
    fetchAssignedExams();
    fetchAssignments();
  }, [token, navigate]);

  const fetchAssignedExams = async () => {
    setLoadingExams(true);
    try {
      const res = await fetch(`${API_URL}/api/college/my-exams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setExams(data.exams || []);
      } else {
        toast.error(data.error || 'Failed to load assigned exams');
      }
    } catch (err) {
      console.error(err);
      toast.error('Network fault loading assigned exams');
    } finally {
      setLoadingExams(false);
    }
  };

  const fetchAssignments = async () => {
    setLoadingAssignments(true);
    try {
      const res = await fetch(`${API_URL}/api/college/assignments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAssignments(data.assignments || []);
      }
    } catch (err) {
      console.warn('Failed to load assignments:', err);
    } finally {
      setLoadingAssignments(false);
    }
  };

  // Start / Resume Exam Handler
  const handleStartExam = async (examSummary) => {
    try {
      toast.loading('Initializing proctored exam workspace...', { id: 'exam-init' });
      
      // 1. Mark exam started on server
      await fetch(`${API_URL}/api/college/exams/${examSummary.id}/start`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      // 2. Fetch full exam details with questions
      const res = await fetch(`${API_URL}/api/college/exams/${examSummary.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      toast.dismiss('exam-init');

      if (!res.ok || !data.success) {
        toast.error(data.error || 'Failed to start exam');
        return;
      }

      const examData = data.exam;
      setActiveExam(examData);
      setActiveQuestionIdx(0);
      setTimeLeft((examData.durationMinutes || 60) * 60);
      setViolationsCount(examSummary.myResult?.violations_count || 0);

      // Initialize code state for questions
      const initialSubs = {};
      (examData.questions || []).forEach((q, idx) => {
        const qKey = q.id || q.title || `q_${idx}`;
        initialSubs[qKey] = {
          code: q.initialCode || STARTER_TEMPLATES['javascript'],
          language: 'javascript'
        };
      });
      setSubmissions(initialSubs);
      setTestOutput(null);

      toast.success('Proctored session engaged. Anti-cheat shield is ACTIVE.', { duration: 4000 });
    } catch (err) {
      toast.dismiss('exam-init');
      toast.error('Failed to launch exam workspace: ' + err.message);
    }
  };

  // Log Violation Handler
  const recordViolation = useCallback(async (reason) => {
    if (!activeExam) return;

    setViolationsCount(prev => {
      const nextCount = prev + 1;
      setViolationAlertMsg(`Warning: ${reason} (Incident #${nextCount}). This event has been logged to your college coordinator.`);
      setShowViolationModal(true);
      return nextCount;
    });

    try {
      await fetch(`${API_URL}/api/college/exams/${activeExam.id}/violation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (e) {
      console.warn('Failed to report violation to server:', e);
    }
  }, [activeExam, token]);

  // Anti-Cheat Window / Tab Event Listeners
  useEffect(() => {
    if (!activeExam || examResult) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordViolation('Tab switched or browser minimized');
      }
    };

    const handleWindowBlur = () => {
      recordViolation('Focus shifted away from exam window');
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [activeExam, examResult, recordViolation]);

  // Countdown Timer
  useEffect(() => {
    if (!activeExam || examResult) return;

    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeExam, examResult]);

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Code editor updates
  const currentQuestion = activeExam?.questions?.[activeQuestionIdx] || null;
  const currentQuestionKey = currentQuestion ? (currentQuestion.id || currentQuestion.title || `q_${activeQuestionIdx}`) : '';
  const currentCode = submissions[currentQuestionKey]?.code ?? STARTER_TEMPLATES[language];

  const handleCodeChange = (newCode) => {
    if (!currentQuestionKey) return;
    setSubmissions(prev => ({
      ...prev,
      [currentQuestionKey]: {
        code: newCode || '',
        language
      }
    }));
  };

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang);
    if (!currentQuestionKey) return;
    
    // If current code is empty or matches starter, replace with new starter
    const existing = submissions[currentQuestionKey]?.code;
    const isStarter = Object.values(STARTER_TEMPLATES).includes(existing) || !existing;
    
    setSubmissions(prev => ({
      ...prev,
      [currentQuestionKey]: {
        code: isStarter ? STARTER_TEMPLATES[newLang] : existing,
        language: newLang
      }
    }));
  };

  // Test Code Execution against sample test case
  const handleRunSample = async () => {
    if (!currentQuestion) return;
    setIsRunningTest(true);
    setTestOutput(null);

    const sampleTest = (currentQuestion.testCases && currentQuestion.testCases[0]) || {
      input: "1",
      expectedOutput: "1"
    };

    try {
      const res = await fetch(`${API_URL}/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language,
          files: [{ content: currentCode }],
          stdin: sampleTest.input || ''
        })
      });

      const data = await res.json();
      const stdout = data.run?.stdout || (data.output ? data.output : '');
      const stderr = data.run?.stderr || data.error || '';

      const passed = stdout.trim() === (sampleTest.expectedOutput || '').trim();

      setTestOutput({
        status: passed ? 'PASSED' : 'MISMATCH',
        input: sampleTest.input,
        expected: sampleTest.expectedOutput,
        actual: stdout || stderr || '(No output)',
        error: stderr
      });

      if (passed) {
        toast.success('Sample Test Case Passed!');
      } else {
        toast.error('Sample Test Failed - Output does not match');
      }
    } catch (err) {
      setTestOutput({
        status: 'ERROR',
        actual: 'Execution failed: ' + err.message
      });
      toast.error('Execution error');
    } finally {
      setIsRunningTest(false);
    }
  };

  // Submit Final Exam
  const handleAutoSubmit = () => {
    toast('Time expired! Automatically submitting your exam...', { icon: '⏰' });
    handleSubmitExam();
  };

  const handleSubmitExam = async () => {
    if (!activeExam) return;
    setSubmitting(true);
    setShowSubmitModal(false);

    try {
      toast.loading('Evaluating code submissions against test suites...', { id: 'exam-eval' });

      // Package submissions into server format
      const submissionPayload = (activeExam.questions || []).map((q, idx) => {
        const qKey = q.id || q.title || `q_${idx}`;
        return {
          questionId: q.id || q.title,
          code: submissions[qKey]?.code || '',
          language: submissions[qKey]?.language || language
        };
      });

      const res = await fetch(`${API_URL}/api/college/exams/${activeExam.id}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          submissions: submissionPayload
        })
      });

      const data = await res.json();
      toast.dismiss('exam-eval');

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Submission failed');
      }

      setExamResult(data);
      toast.success('Exam submitted successfully! Score recorded.');
      // Refresh list in background
      fetchAssignedExams();
    } catch (err) {
      toast.dismiss('exam-eval');
      toast.error('Failed to submit exam: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleExitExamView = () => {
    setActiveExam(null);
    setExamResult(null);
    setTestOutput(null);
    fetchAssignedExams();
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Signed out of campus portal');
    navigate('/college-login');
  };

  // ════════════════════════════════════════════════════════════════════════════
  // 1. ACTIVE EXAM VIEW (Monitored Proctored Sandbox)
  // ════════════════════════════════════════════════════════════════════════════
  if (activeExam) {
    return (
      <div className="student-portal-container exam-active-mode">
        {/* Anti-cheat violation modal */}
        {showViolationModal && (
          <div className="violation-modal-backdrop">
            <div className="violation-modal-box">
              <div className="violation-modal-header">
                <AlertOctagon size={32} className="violation-modal-icon" />
                <h3>Proctoring Alert: Tab Switch Detected</h3>
              </div>
              <p className="violation-modal-text">{violationAlertMsg}</p>
              <div className="violation-status-pill">
                <span>Violations Recorded: <strong>{violationsCount}</strong></span>
                {violationsCount >= 3 && <span className="pill-danger">FLAGGED FOR FACULTY REVIEW</span>}
              </div>
              <button 
                className="violation-modal-btn"
                onClick={() => setShowViolationModal(false)}
              >
                I Understand & Return to Exam
              </button>
            </div>
          </div>
        )}

        {/* Submit Confirmation Modal */}
        {showSubmitModal && (
          <div className="violation-modal-backdrop">
            <div className="violation-modal-box">
              <div className="violation-modal-header">
                <Send size={28} style={{ color: 'var(--primary)' }} />
                <h3>Final Exam Submission</h3>
              </div>
              <p className="violation-modal-text">
                Are you ready to submit your exam? Your code for all {activeExam.questions?.length} questions will be graded and logged to your faculty marksheet.
              </p>
              <div className="submit-modal-stats">
                <div>Duration Left: <strong>{formatTimer(timeLeft)}</strong></div>
                <div>Violations Logged: <strong style={{ color: violationsCount > 0 ? '#ef4444' : '#10b981' }}>{violationsCount}</strong></div>
              </div>
              <div className="submit-modal-actions">
                <button 
                  className="modal-secondary-btn"
                  onClick={() => setShowSubmitModal(false)}
                >
                  Continue Coding
                </button>
                <button 
                  className="modal-primary-btn"
                  onClick={handleSubmitExam}
                  disabled={submitting}
                >
                  {submitting ? 'Grading & Submitting...' : 'Yes, Submit Final Exam'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Final Exam Result Modal */}
        {examResult && (
          <div className="violation-modal-backdrop">
            <div className="result-modal-box">
              <div className="result-modal-header">
                <Award size={48} className="result-icon-gold" />
                <h2>Exam Evaluated & Recorded</h2>
                <p>Apex Institutional Testing Assessment Engine</p>
              </div>
              
              <div className="result-score-card">
                <div className="score-big">{examResult.score}<span className="score-denom">/100</span></div>
                <div className="score-label">Official Calculated Score</div>
              </div>

              <div className="result-breakdown-grid">
                <div className="result-item">
                  <span className="lbl">Problems Solved</span>
                  <span className="val">{examResult.problemsSolved} / {examResult.totalProblems}</span>
                </div>
                <div className="result-item">
                  <span className="lbl">Anti-Cheat Flags</span>
                  <span className={`val ${violationsCount >= 3 ? 'text-red' : 'text-green'}`}>{violationsCount} incidents</span>
                </div>
                <div className="result-item">
                  <span className="lbl">Status</span>
                  <span className="val text-green">SUBMITTED</span>
                </div>
              </div>

              <p className="result-footer-note">
                Your results and automated test suite breakdowns have been synced directly to your college coordinator's console.
              </p>

              <button className="result-done-btn" onClick={handleExitExamView}>
                Back to Student Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Proctored Top Navigation */}
        <header className="exam-proctor-header">
          <div className="header-left">
            <div className="org-badge">
              <School size={16} />
              <span>{orgName}</span>
            </div>
            <div className="exam-title-badge">
              <strong>{activeExam.title}</strong>
            </div>
          </div>

          <div className="header-center">
            <div className={`timer-box ${timeLeft < 300 ? 'timer-critical' : ''}`}>
              <Clock size={16} />
              <span className="timer-text">{formatTimer(timeLeft)}</span>
            </div>
          </div>

          <div className="header-right">
            <div className={`anti-cheat-pill ${violationsCount > 0 ? (violationsCount >= 3 ? 'pill-severe' : 'pill-warn') : 'pill-clean'}`}>
              <Shield size={14} />
              <span>Anti-Cheat Guard: {violationsCount} Violation{violationsCount !== 1 ? 's' : ''}</span>
            </div>
            <button className="submit-exam-top-btn" onClick={() => setShowSubmitModal(true)}>
              <Send size={14} />
              <span>Submit Exam</span>
            </button>
          </div>
        </header>

        {/* Dual-Pane Exam Runner Workbench */}
        <div className="exam-workbench">
          {/* LEFT: Problem Statement & Test Cases */}
          <div className="problem-panel">
            <div className="problem-tabs-header">
              {(activeExam.questions || []).map((q, idx) => (
                <button
                  key={idx}
                  className={`tab-btn ${activeQuestionIdx === idx ? 'active' : ''}`}
                  onClick={() => setActiveQuestionIdx(idx)}
                >
                  <FileCode size={14} />
                  <span>Problem {idx + 1}</span>
                </button>
              ))}
            </div>

            {currentQuestion ? (
              <div className="problem-content-scroll">
                <div className="problem-headline">
                  <h2>{currentQuestion.title}</h2>
                  <span className={`diff-badge diff-${(currentQuestion.difficulty || 'medium').toLowerCase()}`}>
                    {currentQuestion.difficulty || 'Medium'}
                  </span>
                </div>

                <div className="problem-body">
                  <p className="problem-desc">{currentQuestion.description || currentQuestion.problemStatement}</p>

                  {currentQuestion.constraints && (
                    <div className="problem-section">
                      <h4>Constraints</h4>
                      <pre className="code-snippet-box">{currentQuestion.constraints}</pre>
                    </div>
                  )}

                  <div className="problem-section">
                    <h4>Sample Test Cases</h4>
                    {(currentQuestion.testCases || [{ input: "1", expectedOutput: "1" }]).slice(0, 2).map((tc, idx) => (
                      <div key={idx} className="sample-case-box">
                        <div className="case-row">
                          <span className="case-tag">Input:</span>
                          <code>{tc.input}</code>
                        </div>
                        <div className="case-row">
                          <span className="case-tag">Expected Output:</span>
                          <code>{tc.expectedOutput}</code>
                        </div>
                      </div>
                    ))}
                  </div>

                  {testOutput && (
                    <div className="test-results-container">
                      <div className="test-results-head">
                        <h4>Execution Result</h4>
                        <span className={`test-status-tag ${testOutput.status === 'PASSED' ? 'tag-pass' : 'tag-fail'}`}>
                          {testOutput.status}
                        </span>
                      </div>
                      <div className="test-diff-grid">
                        <div>
                          <label>Expected</label>
                          <pre>{testOutput.expected || '(None)'}</pre>
                        </div>
                        <div>
                          <label>Your Output</label>
                          <pre>{testOutput.actual}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="no-question-placeholder">No questions loaded in this exam.</div>
            )}
          </div>

          {/* RIGHT: Monaco Code Editor & Actions */}
          <div className="editor-panel">
            <div className="editor-controls-bar">
              <div className="editor-left-tools">
                <Terminal size={15} />
                <span className="editor-label">Code Solution</span>
              </div>
              <div className="editor-right-tools">
                <select 
                  className="lang-select"
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                >
                  <option value="javascript">JavaScript (Node.js)</option>
                  <option value="python">Python 3</option>
                  <option value="cpp">C++ (GCC)</option>
                  <option value="java">Java 17</option>
                </select>

                <button 
                  className="run-test-btn"
                  onClick={handleRunSample}
                  disabled={isRunningTest}
                >
                  <Play size={13} />
                  <span>{isRunningTest ? 'Running...' : 'Run Sample'}</span>
                </button>
              </div>
            </div>

            <div className="monaco-wrapper">
              <Editor
                height="100%"
                language={language}
                value={currentCode}
                onChange={handleCodeChange}
                theme="vs-dark"
                options={{
                  fontSize: 14,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: 'on',
                  contextmenu: false,
                  lineNumbers: 'on',
                  padding: { top: 12 }
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ════════════════════════════════════════════════════════════════════════════
  // 2. DASHBOARD VIEW (Student Assigned Exams Hub)
  // ════════════════════════════════════════════════════════════════════════════
  return (
    <div className="student-portal-container">
      {/* Top Banner */}
      <div className="portal-header-bar">
        <div className="portal-brand">
          <div className="portal-logo-square">
            <School size={22} />
          </div>
          <div className="portal-title-block">
            <h1>Campus Student Assessment Portal</h1>
            <p>{orgName} • Institutional Testing Network</p>
          </div>
        </div>

        <div className="portal-header-right">
          <div className="student-badge-pill">
            <User size={15} />
            <span>Roll: <strong>{studentRollNo}</strong> ({branch})</span>
          </div>
          {userRole === 'college_admin' && (
            <button className="switch-console-btn" onClick={() => navigate('/college-admin')}>
              Faculty Admin
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout} title="Sign Out">
            <LogOut size={16} />
          </button>
        </div>
      </div>

      {/* Campus Ecosystem Sub-Header Navigation */}
      <div className="campus-ecosystem-strip">
        <div className="strip-tabs">
          <button 
            className={`strip-tab-btn ${activeHubTab === 'exams' ? 'active' : ''}`}
            onClick={() => setActiveHubTab('exams')}
          >
            <FileCode size={15} />
            <span>Proctored Lab Exams</span>
            {exams.length > 0 && <span className="tab-pill-counter">{exams.length}</span>}
          </button>

          <button 
            className={`strip-tab-btn ${activeHubTab === 'assignments' ? 'active' : ''}`}
            onClick={() => setActiveHubTab('assignments')}
          >
            <BookOpen size={15} />
            <span>Faculty Practice & Lab Sheets</span>
            {assignments.length > 0 && <span className="tab-pill-counter counter-green">{assignments.length}</span>}
          </button>
        </div>

        <div className="strip-quick-actions">
          <span className="quick-actions-lbl">BrightCode Hub:</span>
          <button className="strip-action-btn" onClick={() => navigate('/library')} title="Explore 2,500+ Practice Problems">
            <Code2 size={13} />
            <span>Practice Library</span>
          </button>
          <button className="strip-action-btn btn-arena-glow" onClick={() => navigate('/battle-arena')} title="1v1 Real-Time Speed Coding Duels">
            <Swords size={13} />
            <span>Esports Arena</span>
          </button>
          <button className="strip-action-btn" onClick={() => navigate('/workspace')} title="Multi-File Cloud Compiler & Lab IDE">
            <Terminal size={13} />
            <span>Cloud Workspace</span>
          </button>
          <button className="strip-action-btn" onClick={() => navigate('/leaderboard')} title="College & Batch Rankings">
            <Trophy size={13} />
            <span>Campus Rank</span>
          </button>
        </div>
      </div>

      <div className="portal-content-grid">
        {/* Left Column: Student Profile & Rules */}
        <div className="portal-sidebar-card">
          <div className="student-profile-summary">
            <div className="student-avatar-ring">
              {studentName.slice(0, 2).toUpperCase()}
            </div>
            <h3>{studentName}</h3>
            <span className="inst-badge">{orgName}</span>
          </div>

          <div className="student-details-list">
            <div className="detail-row">
              <span className="label">Roll Number</span>
              <span className="val">{studentRollNo}</span>
            </div>
            <div className="detail-row">
              <span className="label">Department / Branch</span>
              <span className="val">{branch}</span>
            </div>
            <div className="detail-row">
              <span className="label">Graduating Batch</span>
              <span className="val">{batch}</span>
            </div>
            <div className="detail-row">
              <span className="label">Account Status</span>
              <span className="val val-verified">Campus Verified</span>
            </div>
          </div>

          {/* BrightCode Community Hub Quick Card */}
          <div className="campus-hub-access-card">
            <div className="hub-card-head">
              <Flame size={16} style={{ color: '#f59e0b' }} />
              <h4>Campus Community & Esports</h4>
            </div>
            <p className="hub-card-sub">Access BrightCode's global learning & esports features with your verified campus ID:</p>
            <div className="hub-card-buttons">
              <button className="hub-nav-link" onClick={() => navigate('/library')}>
                <BookOpen size={13} />
                <span>Problem Library (2,500+)</span>
                <ChevronRight size={13} className="ml-auto" />
              </button>
              <button className="hub-nav-link" onClick={() => navigate('/battle-arena')}>
                <Swords size={13} />
                <span>1v1 Speed Battle Arena</span>
                <ChevronRight size={13} className="ml-auto" />
              </button>
              <button className="hub-nav-link" onClick={() => navigate('/workspace')}>
                <Terminal size={13} />
                <span>Cloud Multi-File IDE</span>
                <ChevronRight size={13} className="ml-auto" />
              </button>
              <button className="hub-nav-link" onClick={() => navigate('/leaderboard')}>
                <Trophy size={13} />
                <span>College Leaderboard</span>
                <ChevronRight size={13} className="ml-auto" />
              </button>
            </div>
          </div>

          <div className="proctoring-guidelines-box">
            <div className="guidelines-head">
              <Shield size={16} style={{ color: 'var(--primary)' }} />
              <h4>Proctoring Protocol</h4>
            </div>
            <ul>
              <li>Tests run in monitored fullscreen environments.</li>
              <li>Tab switches and window blur events are logged automatically.</li>
              <li>Exams auto-submit when the duration timer expires.</li>
              <li>Code evaluation runs against hidden server test cases.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Dynamic Tab Content */}
        <div className="portal-main-panel">
          {activeHubTab === 'exams' ? (
            /* ── TAB 1: PROCTORED EXAMS ── */
            <>
              <div className="panel-title-row">
                <div>
                  <h2>Assigned Exams & Lab Tests</h2>
                  <p>Official assessments scheduled by your faculty coordinators</p>
                </div>
                <button className="refresh-btn" onClick={fetchAssignedExams} disabled={loadingExams}>
                  <RefreshCw size={14} className={loadingExams ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingExams ? (
                <div className="loading-exams-state">
                  <RefreshCw size={28} className="spin" />
                  <p>Loading assigned examinations...</p>
                </div>
              ) : exams.length === 0 ? (
                <div className="empty-exams-state">
                  <BookOpen size={48} className="empty-icon" />
                  <h3>No Active Exams Found</h3>
                  <p>Your faculty coordinator has not assigned any pending lab tests for {branch} at this time.</p>
                </div>
              ) : (
                <div className="exams-card-list">
                  {exams.map(exam => {
                    const isSubmitted = exam.myResult?.status === 'submitted';
                    const isInProgress = exam.myResult?.status === 'in_progress';
                    const score = exam.myResult?.score ?? null;

                    return (
                      <div key={exam.id} className={`exam-card ${isSubmitted ? 'card-submitted' : ''}`}>
                        <div className="exam-card-main">
                          <div className="exam-header-line">
                            <div className="exam-title-group">
                              <h3>{exam.title}</h3>
                              <span className="branch-tag">{exam.targetBranch || 'ALL'}</span>
                            </div>
                            {isSubmitted ? (
                              <span className="exam-status-badge status-done">
                                <CheckCircle2 size={13} /> Completed
                              </span>
                            ) : isInProgress ? (
                              <span className="exam-status-badge status-prog">
                                In Progress
                              </span>
                            ) : (
                              <span className="exam-status-badge status-ready">
                                Ready
                              </span>
                            )}
                          </div>

                          <p className="exam-card-desc">{exam.description || 'Standard institutional coding test.'}</p>

                          <div className="exam-meta-pills">
                            <div className="meta-pill">
                              <Clock size={13} />
                              <span>{exam.durationMinutes} Minutes</span>
                            </div>
                            <div className="meta-pill">
                              <FileCode size={13} />
                              <span>{exam.questionsCount} Problems</span>
                            </div>
                            {isSubmitted && (
                              <div className="meta-pill meta-score">
                                <Award size={13} />
                                <span>Score: {score} / 100</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="exam-card-action">
                          {isSubmitted ? (
                            <div className="submitted-result-indicator">
                              <span className="sub-lbl">Grade Recorded</span>
                              <span className="sub-score">{score}/100</span>
                            </div>
                          ) : (
                            <button 
                              className="start-exam-btn"
                              onClick={() => handleStartExam(exam)}
                            >
                              <span>{isInProgress ? 'Resume Exam' : 'Enter Exam'}</span>
                              <ChevronRight size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          ) : (
            /* ── TAB 2: FACULTY PRACTICE & LAB SHEETS ── */
            <>
              <div className="panel-title-row">
                <div>
                  <h2>Faculty Practice & Lab Sheets</h2>
                  <p>Curated weekly assignments to practice in BrightCode Library & Cloud IDE</p>
                </div>
                <button className="refresh-btn" onClick={fetchAssignments} disabled={loadingAssignments}>
                  <RefreshCw size={14} className={loadingAssignments ? 'spin' : ''} />
                  <span>Refresh</span>
                </button>
              </div>

              {loadingAssignments ? (
                <div className="loading-exams-state">
                  <RefreshCw size={28} className="spin" />
                  <p>Loading curated lab sheets...</p>
                </div>
              ) : assignments.length === 0 ? (
                <div className="empty-exams-state">
                  <BookOpen size={48} className="empty-icon" />
                  <h3>No Lab Sheets Assigned Yet</h3>
                  <p>Your faculty coordinator will publish practice sets here. In the meantime, you can explore the general Library!</p>
                  <button className="start-exam-btn mt-4" onClick={() => navigate('/library')}>
                    <Code2 size={16} />
                    <span>Browse Problem Library</span>
                  </button>
                </div>
              ) : (
                <div className="exams-card-list">
                  {assignments.map(asgn => (
                    <div key={asgn.id} className="exam-card assignment-card">
                      <div className="exam-card-main">
                        <div className="exam-header-line">
                          <div className="exam-title-group">
                            <h3>{asgn.title}</h3>
                            <span className="branch-tag">{asgn.target_branch || 'ALL'}</span>
                          </div>
                          <span className="exam-status-badge status-ready">
                            <BookOpen size={12} /> Assigned Practice
                          </span>
                        </div>

                        <p className="exam-card-desc">{asgn.description}</p>

                        <div className="assignment-problems-grid">
                          {(asgn.problems || []).map((prob, pIdx) => (
                            <div key={prob.id || pIdx} className="asgn-problem-pill">
                              <span className="asgn-prob-num">#{pIdx + 1}</span>
                              <span className="asgn-prob-title">{prob.title}</span>
                              <span className={`diff-badge diff-${(prob.difficulty || 'medium').toLowerCase()}`}>
                                {prob.difficulty || 'Medium'}
                              </span>
                              <div className="asgn-prob-actions">
                                <button 
                                  className="asgn-solve-btn"
                                  onClick={() => navigate('/library')}
                                  title="Solve this problem in BrightCode Library"
                                >
                                  <span>Library</span>
                                  <ExternalLink size={12} />
                                </button>
                                <button 
                                  className="asgn-ide-btn"
                                  onClick={() => navigate('/workspace')}
                                  title="Open in Multi-File Cloud Compiler"
                                >
                                  <Terminal size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentExamHub;
