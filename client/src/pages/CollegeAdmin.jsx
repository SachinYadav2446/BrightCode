import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, FileText, ShieldAlert, Download, Plus, Search,
  RefreshCw, Trash2, KeyRound, Play, CheckCircle2, AlertTriangle,
  UploadCloud, FileSpreadsheet, Sparkles, School, BarChart3, Clock,
  LogOut, ArrowRight, Check, Copy, Eye, Award, BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';
import API_URL from '../config';
import './CollegeAdmin.css';

const SAMPLE_CSV = `21CS003,Ishaan Verma,ishaan@apex.edu,CSE,2026
21CS004,Ananya Gupta,ananya@apex.edu,CSE,2026
21CS005,Rohan Sharma,rohan@apex.edu,CSE,2026
21IT001,Priya Nair,priya@apex.edu,IT,2026
21IT002,Aditya Rao,aditya@apex.edu,IT,2026`;

const CURATED_QUESTIONS = [
  { id: 'q1', title: 'Array Reverse', difficulty: 'Easy', timeLimit: '1.0s', testCases: [{ input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1' }] },
  { id: 'q2', title: 'Min and Max in Array', difficulty: 'Medium', timeLimit: '1.0s', testCases: [{ input: '6\n3 2 1 56 10000 167', expectedOutput: '1 10000' }] },
  { id: 'q3', title: 'Kadane\'s Algorithm', difficulty: 'Medium', timeLimit: '1.0s', testCases: [{ input: '5\n1 2 3 -2 5', expectedOutput: '9' }] },
  { id: 'q4', title: 'Two Sum - Pairs with 0 Sum', difficulty: 'Easy', timeLimit: '1.0s', testCases: [{ input: '5\n-1 0 1 2 -1 -4', expectedOutput: '-1 1' }] },
  { id: 'q5', title: 'Merge Intervals', difficulty: 'Medium', timeLimit: '1.0s', testCases: [{ input: '4\n1 3 2 6 8 10 15 18', expectedOutput: '1 6 8 10 15 18' }] }
];

const CollegeAdmin = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'students' | 'exams' | 'live'
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Student Onboarding States
  const [studentsList, setStudentsList] = useState([]);
  const [bulkInputText, setBulkInputText] = useState('');
  const [generatingAccounts, setGeneratingAccounts] = useState(false);
  const [lastGeneratedCredentials, setLastGeneratedCredentials] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBranch, setFilterBranch] = useState('ALL');

  // Exam Creator States
  const [exams, setExams] = useState([]);
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [examDuration, setExamDuration] = useState('60');
  const [targetBranch, setTargetBranch] = useState('ALL');
  const [targetBatch, setTargetBatch] = useState('2026');
  const [selectedQuestions, setSelectedQuestions] = useState(['q1', 'q2']);
  const [creatingExam, setCreatingExam] = useState(false);

  // Lab Sheets & Assignments State
  const [assignments, setAssignments] = useState([]);
  const [asgnTitle, setAsgnTitle] = useState('');
  const [asgnDesc, setAsgnDesc] = useState('');
  const [asgnBranch, setAsgnBranch] = useState('ALL');
  const [asgnBatch, setAsgnBatch] = useState('2026');
  const [asgnQuestions, setAsgnQuestions] = useState(['q1', 'q4', 'q3']);
  const [creatingAsgn, setCreatingAsgn] = useState(false);

  // Live Proctoring States
  const [selectedExamId, setSelectedExamId] = useState('');
  const [liveData, setLiveData] = useState(null);
  const [examResults, setExamResults] = useState(null);

  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Faculty Coordinator';
  const orgName = localStorage.getItem('college_org_name') || 'Apex Institute of Technology';
  const orgCode = localStorage.getItem('college_org_code') || 'APEX';

  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  // Fetch Stats & Initial Data
  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/college/stats`, { headers: authHeaders });
      if (res.status === 401 || res.status === 403) {
        toast.error('Session expired or unauthorized. Please log in.');
        navigate('/portal');
        return;
      }
      const data = await res.json();
      if (data.success) {
        setStats(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/college/students?branch=${filterBranch}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setStudentsList(data.students);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch(`${API_URL}/api/college/exams`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setExams(data.exams);
        if (data.exams.length > 0 && !selectedExamId) {
          setSelectedExamId(data.exams[0].id);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLiveMonitor = async (examId) => {
    if (!examId) return;
    try {
      const res = await fetch(`${API_URL}/api/college/exams/${examId}/live`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setLiveData(data);
      }
      // Also fetch results
      const resResults = await fetch(`${API_URL}/api/college/exams/${examId}/results`, { headers: authHeaders });
      const dataResults = await resResults.json();
      if (dataResults.success) {
        setExamResults(dataResults);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/college/assignments`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setAssignments(data.assignments);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    if (!asgnTitle.trim()) {
      toast.error('Please enter a Lab Sheet title');
      return;
    }
    if (asgnQuestions.length === 0) {
      toast.error('Please select at least one problem for this lab sheet');
      return;
    }

    setCreatingAsgn(true);
    try {
      const selectedProblemObjects = CURATED_QUESTIONS
        .filter(q => asgnQuestions.includes(q.id))
        .map(q => ({ id: q.id, title: q.title, difficulty: q.difficulty, slug: q.id }));

      const res = await fetch(`${API_URL}/api/college/assignments`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: asgnTitle,
          description: asgnDesc,
          targetBranch: asgnBranch,
          targetBatch: asgnBatch,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
          problems: selectedProblemObjects
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to publish lab sheet');

      toast.success(`Published "${data.assignment.title}" to student library!`);
      setAsgnTitle('');
      setAsgnDesc('');
      fetchAssignments();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreatingAsgn(false);
    }
  };

  const handleDeleteAssignment = async (id) => {
    if (!window.confirm('Are you sure you want to remove this lab sheet?')) return;
    try {
      const res = await fetch(`${API_URL}/api/college/assignments/${id}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Lab sheet removed');
        fetchAssignments();
      }
    } catch (err) {
      toast.error('Failed to delete lab sheet');
    }
  };

  useEffect(() => {
    fetchStats();
    fetchStudents();
    fetchExams();
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') fetchStudents();
    if (activeTab === 'exams') fetchExams();
    if (activeTab === 'assignments') fetchAssignments();
    if (activeTab === 'live' && selectedExamId) {
      fetchLiveMonitor(selectedExamId);
      const interval = setInterval(() => fetchLiveMonitor(selectedExamId), 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedExamId, filterBranch]);

  // Handle Bulk Parse & Account Generation
  const handleGenerateAccounts = async () => {
    if (!bulkInputText.trim()) {
      toast.error('Please paste student details or click "Load Sample CSV"');
      return;
    }

    const lines = bulkInputText.trim().split('\n');
    const parsedStudents = [];

    for (const line of lines) {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        parsedStudents.push({
          rollNo: parts[0],
          name: parts[1],
          email: parts[2] || '',
          branch: parts[3] || 'CSE',
          batch: parts[4] || '2026'
        });
      }
    }

    if (parsedStudents.length === 0) {
      toast.error('Could not parse any valid student lines. Format: RollNo, Full Name, Email, Branch, Batch');
      return;
    }

    setGeneratingAccounts(true);
    try {
      const res = await fetch(`${API_URL}/api/college/students/bulk`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ students: parsedStudents })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to generate accounts');
      }

      toast.success(data.message || `Generated ${data.createdCount} student accounts!`);
      setLastGeneratedCredentials(data.credentials);
      setBulkInputText('');
      fetchStats();
      fetchStudents();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGeneratingAccounts(false);
    }
  };

  // 1-Click CSV Download Handler
  const downloadCSV = (content, filename) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloaded ${filename}`);
  };

  const handleDownloadCredentials = () => {
    if (!lastGeneratedCredentials || lastGeneratedCredentials.length === 0) return;
    const header = "Roll Number,Full Name,Username,Email,Initial Password,Branch,Batch\n";
    const rows = lastGeneratedCredentials.map(c => 
      `"${c.rollNo}","${c.name}","${c.username}","${c.email}","${c.initialPassword}","${c.branch}","${c.batch}"`
    ).join("\n");
    downloadCSV(header + rows, `${orgCode}_Student_Credentials.csv`);
  };

  const handleDownloadMarksheet = () => {
    if (!examResults?.resultsCsv) {
      toast.error('No results available yet to export');
      return;
    }
    downloadCSV(examResults.resultsCsv, `${orgCode}_Exam_${selectedExamId}_Marksheet.csv`);
  };

  // Create Exam Handler
  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      toast.error('Exam title is required');
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least 1 coding problem');
      return;
    }

    const examQuestions = CURATED_QUESTIONS.filter(q => selectedQuestions.includes(q.id));

    setCreatingExam(true);
    try {
      const res = await fetch(`${API_URL}/api/college/exams`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: examTitle.trim(),
          description: examDesc.trim(),
          durationMinutes: parseInt(examDuration) || 60,
          targetBranch,
          targetBatch,
          questions: examQuestions
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create exam');
      }

      toast.success('Exam published successfully to college portal!');
      setExamTitle('');
      setExamDesc('');
      fetchExams();
      fetchStats();
      setActiveTab('live');
      setSelectedExamId(data.exam.id);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreatingExam(false);
    }
  };

  const handleResetPassword = async (studentId, rollNo) => {
    try {
      const res = await fetch(`${API_URL}/api/college/students/${studentId}/reset-password`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({})
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Reset password for ${rollNo} to ${data.newPassword}`);
      }
    } catch (e) {
      toast.error('Failed to reset password');
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Delete this student account and release the license seat?')) return;
    try {
      const res = await fetch(`${API_URL}/api/college/students/${studentId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Account deleted & seat freed');
        fetchStudents();
        fetchStats();
      }
    } catch (e) {
      toast.error('Failed to delete student');
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    toast.success('Signed out of Faculty Console');
    navigate('/portal');
  };

  const filteredStudents = studentsList.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.rollNo?.toLowerCase().includes(q) ||
      s.username?.toLowerCase().includes(q) ||
      s.email?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="college-admin-app">
      {/* ── Top Bar ────────────────────────────────────────── */}
      <header className="ca-header">
        <div className="ca-brand-block">
          <div className="ca-logo">Bright<span>Code</span></div>
          <span className="ca-sep">/</span>
          <div className="ca-college-title">
            <School size={18} className="ca-college-icon" />
            <span className="ca-college-name">{orgName}</span>
            <span className="ca-pill-code">{orgCode}</span>
          </div>
        </div>

        <div className="ca-header-right">
          <div className="ca-quota-badge">
            <span className="ca-quota-label">LICENSE CAPACITY:</span>
            <span className="ca-quota-val">
              {stats?.org?.enrolledCount || 0} / {stats?.org?.maxStudents || 300} Seats
            </span>
            <div className="ca-quota-bar">
              <div 
                className="ca-quota-fill" 
                style={{ width: `${stats?.org?.usagePercent || 0}%` }} 
              />
            </div>
          </div>

          <div className="ca-user-pill">
            <div className="ca-avatar">F</div>
            <div className="ca-user-info">
              <span className="ca-user-name">{username}</span>
              <span className="ca-user-role">Department Coordinator</span>
            </div>
            <button className="ca-logout-btn" title="Sign Out" onClick={handleLogout}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Navigation Tabs ──────────────────────────── */}
      <nav className="ca-tabs-bar">
        <button 
          className={`ca-nav-tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <BarChart3 size={16} />
          <span>Overview</span>
        </button>
        <button 
          className={`ca-nav-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={16} />
          <span>Student Onboarding & Directory</span>
          <span className="ca-tab-count">{stats?.org?.enrolledCount || 0}</span>
        </button>
        <button 
          className={`ca-nav-tab ${activeTab === 'exams' ? 'active' : ''}`}
          onClick={() => setActiveTab('exams')}
        >
          <FileText size={16} />
          <span>Exam & Test Creator</span>
          <span className="ca-tab-count">{exams.length}</span>
        </button>
        <button 
          className={`ca-nav-tab ${activeTab === 'assignments' ? 'active' : ''}`}
          onClick={() => setActiveTab('assignments')}
        >
          <BookOpen size={16} />
          <span>Lab Sheets & Practice Sets</span>
          <span className="ca-tab-count">{assignments.length}</span>
        </button>
        <button 
          className={`ca-nav-tab ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          <ShieldAlert size={16} />
          <span>Live Proctoring & Marksheets</span>
          <span className="ca-tab-pill-live">LIVE</span>
        </button>
      </nav>

      {/* ── Main Content Area ──────────────────────────────── */}
      <main className="ca-main-content">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="ca-tab-pane">
            <div className="ca-hero-card">
              <div className="ca-hero-left">
                <span className="ca-badge-inst">Institutional Console Active</span>
                <h2>Welcome to {orgName} Assessment Hub</h2>
                <p>
                  Provision student accounts in 1-click via CSV, schedule proctored lab exams with anti-cheating tracking, and export verified university marksheets.
                </p>
                <div className="ca-hero-actions">
                  <button className="ca-btn-primary" onClick={() => setActiveTab('students')}>
                    <Users size={16} /> <span>Bulk Onboard Students</span>
                  </button>
                  <button className="ca-btn-secondary" onClick={() => setActiveTab('exams')}>
                    <Plus size={16} /> <span>Schedule New Exam</span>
                  </button>
                </div>
              </div>
              <div className="ca-hero-stats">
                <div className="ca-mini-stat">
                  <span className="val">{stats?.org?.enrolledCount || 0}</span>
                  <span className="lbl">Enrolled Students</span>
                </div>
                <div className="ca-mini-stat">
                  <span className="val">{stats?.org?.remainingSeats || 300}</span>
                  <span className="lbl">Seats Available</span>
                </div>
                <div className="ca-mini-stat">
                  <span className="val">{stats?.metrics?.activeExams || 0}</span>
                  <span className="lbl">Active Exams</span>
                </div>
                <div className="ca-mini-stat">
                  <span className="val">{stats?.metrics?.totalSubmissions || 0}</span>
                  <span className="lbl">Total Submissions</span>
                </div>
              </div>
            </div>

            {/* Quick Flow Visual */}
            <div className="ca-quick-flow-grid">
              <div className="ca-flow-step" onClick={() => setActiveTab('students')}>
                <div className="ca-step-num">01</div>
                <h4>Upload Student List</h4>
                <p>Paste or drag-and-drop your class roll numbers. Accounts are auto-created with zero student signup hassle.</p>
                <span className="ca-step-link">Manage Roster <ArrowRight size={14} /></span>
              </div>
              <div className="ca-flow-step" onClick={() => setActiveTab('exams')}>
                <div className="ca-step-num">02</div>
                <h4>Select Questions & Time</h4>
                <p>Pick coding challenges from the library, set time limit, and assign to CSE, IT, or all branches.</p>
                <span className="ca-step-link">Create Test <ArrowRight size={14} /></span>
              </div>
              <div className="ca-flow-step" onClick={() => setActiveTab('live')}>
                <div className="ca-step-num">03</div>
                <h4>Live Proctor & Export</h4>
                <p>Monitor students live for tab switches and copy-paste. Download final grade sheets in 1-click Excel.</p>
                <span className="ca-step-link">View Proctor Grid <ArrowRight size={14} /></span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENTS ONBOARDING & DIRECTORY */}
        {activeTab === 'students' && (
          <div className="ca-tab-pane">
            
            {/* Bulk Generator Card */}
            <div className="ca-section-card">
              <div className="ca-section-header">
                <div>
                  <h3>1-Click Bulk Student Account Generator</h3>
                  <p>Paste student details below. Accounts will be instantly generated and locked to this institution.</p>
                </div>
                <button 
                  type="button" 
                  className="ca-btn-sample"
                  onClick={() => setBulkInputText(SAMPLE_CSV)}
                >
                  <Sparkles size={14} /> <span>Load Sample 5 Students</span>
                </button>
              </div>

              <div className="ca-csv-input-wrapper">
                <textarea
                  className="ca-csv-textarea"
                  rows={5}
                  placeholder="Format: RollNumber, Full Name, Email, Branch, Batch&#10;Example:&#10;21CS001, Aarav Sharma, aarav@apex.edu, CSE, 2026&#10;21CS002, Diya Patel, diya@apex.edu, CSE, 2026"
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                />
              </div>

              <div className="ca-generator-footer">
                <div className="ca-gen-note">
                  <CheckCircle2 size={16} className="text-green" />
                  <span>Default passwords are auto-generated as <code>Bright@&lt;RollNo&gt;</code></span>
                </div>
                <button
                  type="button"
                  className="ca-btn-primary"
                  onClick={handleGenerateAccounts}
                  disabled={generatingAccounts}
                >
                  {generatingAccounts ? 'Generating Accounts...' : 'Generate & Provision Accounts'}
                </button>
              </div>

              {/* Download Credentials Box (if just generated) */}
              {lastGeneratedCredentials && lastGeneratedCredentials.length > 0 && (
                <div className="ca-credentials-alert-box">
                  <div className="ca-cred-info">
                    <CheckCircle2 size={24} className="text-green" />
                    <div>
                      <strong>Accounts Generated Successfully!</strong>
                      <p>Download the credentials CSV file to share login credentials with your students.</p>
                    </div>
                  </div>
                  <button className="ca-btn-download-csv" onClick={handleDownloadCredentials}>
                    <Download size={16} /> <span>Download Student Credentials (CSV)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Student Directory Table */}
            <div className="ca-section-card">
              <div className="ca-table-header-row">
                <div className="ca-table-title-box">
                  <h3>Enrolled Students Roster</h3>
                  <span className="ca-table-sub">({filteredStudents.length} students found)</span>
                </div>
                <div className="ca-table-actions">
                  <div className="ca-search-input">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Search Roll No, Name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <select 
                    className="ca-select-filter"
                    value={filterBranch}
                    onChange={(e) => setFilterBranch(e.target.value)}
                  >
                    <option value="ALL">All Branches</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>
              </div>

              <div className="ca-table-container">
                <table className="ca-data-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Branch</th>
                      <th>Batch</th>
                      <th>Initial Pass</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((st) => (
                        <tr key={st.id}>
                          <td><strong>{st.rollNo}</strong></td>
                          <td><code>{st.username}</code></td>
                          <td>{st.email}</td>
                          <td><span className="ca-pill-branch">{st.branch}</span></td>
                          <td>{st.batch}</td>
                          <td><span className="ca-pill-pass">Bright@{st.rollNo}</span></td>
                          <td>
                            <div className="ca-action-cell">
                              <button 
                                className="ca-btn-icon" 
                                title="Reset Password"
                                onClick={() => handleResetPassword(st.id, st.rollNo)}
                              >
                                <KeyRound size={14} />
                              </button>
                              <button 
                                className="ca-btn-icon danger" 
                                title="Delete & Release Seat"
                                onClick={() => handleDeleteStudent(st.id)}
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="ca-empty-cell">
                          No students found. Use the Bulk Generator above to add your student roster.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: EXAM CREATOR */}
        {activeTab === 'exams' && (
          <div className="ca-tab-pane">
            <div className="ca-section-card">
              <h3>Schedule a Proctored Coding Exam</h3>
              <p>Configure exam parameters and select problems. The exam will appear in the Student Portal for targeted batches.</p>

              <form className="ca-exam-form" onSubmit={handleCreateExam}>
                <div className="ca-form-grid-2">
                  <div className="ca-form-group">
                    <label>Exam Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Mid-Term Lab Exam: Data Structures"
                      value={examTitle}
                      onChange={(e) => setExamTitle(e.target.value)}
                      required
                    />
                  </div>
                  <div className="ca-form-group">
                    <label>Time Limit (Minutes) *</label>
                    <input
                      type="number"
                      min={10}
                      max={180}
                      value={examDuration}
                      onChange={(e) => setExamDuration(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="ca-form-grid-2">
                  <div className="ca-form-group">
                    <label>Target Branch</label>
                    <select value={targetBranch} onChange={(e) => setTargetBranch(e.target.value)}>
                      <option value="ALL">All Branches</option>
                      <option value="CSE">Computer Science (CSE)</option>
                      <option value="IT">Information Tech (IT)</option>
                      <option value="ECE">Electronics (ECE)</option>
                    </select>
                  </div>
                  <div className="ca-form-group">
                    <label>Target Batch</label>
                    <select value={targetBatch} onChange={(e) => setTargetBatch(e.target.value)}>
                      <option value="ALL">All Batches</option>
                      <option value="2026">Batch of 2026</option>
                      <option value="2027">Batch of 2027</option>
                    </select>
                  </div>
                </div>

                <div className="ca-form-group">
                  <label>Instructions & Syllabus</label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Fullscreen is mandatory. Any tab switches will be logged as violation flags. Passing all testcases is required."
                    value={examDesc}
                    onChange={(e) => setExamDesc(e.target.value)}
                  />
                </div>

                {/* Question Selector */}
                <div className="ca-form-group">
                  <label>Select Coding Problems ({selectedQuestions.length} selected)</label>
                  <div className="ca-questions-selector-grid">
                    {CURATED_QUESTIONS.map((q) => {
                      const isSelected = selectedQuestions.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`ca-q-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedQuestions(selectedQuestions.filter(id => id !== q.id));
                            } else {
                              setSelectedQuestions([...selectedQuestions, q.id]);
                            }
                          }}
                        >
                          <div className="ca-q-check">
                            {isSelected ? <CheckCircle2 size={18} className="text-green" /> : <div className="ca-q-circle" />}
                          </div>
                          <div className="ca-q-details">
                            <span className="ca-q-title">{q.title}</span>
                            <div className="ca-q-tags">
                              <span className={`ca-diff-pill ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                              <span className="ca-time-pill">{q.testCases.length} Test cases</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" className="ca-btn-primary" disabled={creatingExam}>
                  {creatingExam ? 'Publishing Exam...' : 'Publish Proctored Exam'}
                </button>
              </form>
            </div>

            {/* Existing Exams Table */}
            <div className="ca-section-card">
              <h3>Existing College Exams</h3>
              <div className="ca-table-container">
                <table className="ca-data-table">
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Duration</th>
                      <th>Target</th>
                      <th>Problems</th>
                      <th>Created</th>
                      <th>Live Proctor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exams.length > 0 ? (
                      exams.map((ex) => (
                        <tr key={ex.id}>
                          <td><strong>{ex.title}</strong></td>
                          <td>{ex.duration_minutes || 60} mins</td>
                          <td><span className="ca-pill-branch">{ex.target_branch || 'ALL'}</span></td>
                          <td>{Array.isArray(ex.questions) ? ex.questions.length : 0} problems</td>
                          <td>{new Date(ex.created_at).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="ca-btn-sm-monitor"
                              onClick={() => {
                                setSelectedExamId(ex.id);
                                setActiveTab('live');
                              }}
                            >
                              <Eye size={14} /> Monitor & Results
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="ca-empty-cell">No exams scheduled yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB: LAB SHEETS & PRACTICE SETS */}
        {activeTab === 'assignments' && (
          <div className="ca-tab-pane">
            <div className="ca-card-split">
              {/* Creator Form */}
              <div className="ca-section-card ca-creator-card">
                <div className="ca-card-head">
                  <div className="ca-icon-circle blue">
                    <BookOpen size={18} />
                  </div>
                  <div>
                    <h3>Publish Practice Lab Sheet</h3>
                    <p>Curate problems from BrightCode's library for student homework & practicals</p>
                  </div>
                </div>

                <form onSubmit={handleCreateAssignment} className="ca-exam-form">
                  <div className="ca-form-group">
                    <label>Lab Sheet Title *</label>
                    <input
                      type="text"
                      placeholder="e.g. Lab Sheet 2: Linked Lists & Recursion"
                      value={asgnTitle}
                      onChange={(e) => setAsgnTitle(e.target.value)}
                      required
                    />
                  </div>

                  <div className="ca-form-row">
                    <div className="ca-form-group">
                      <label>Target Branch</label>
                      <select value={asgnBranch} onChange={(e) => setAsgnBranch(e.target.value)}>
                        <option value="ALL">All Departments</option>
                        <option value="CSE">CSE</option>
                        <option value="IT">IT</option>
                        <option value="ECE">ECE</option>
                      </select>
                    </div>
                    <div className="ca-form-group">
                      <label>Target Batch</label>
                      <select value={asgnBatch} onChange={(e) => setAsgnBatch(e.target.value)}>
                        <option value="2026">Batch of 2026</option>
                        <option value="2027">Batch of 2027</option>
                      </select>
                    </div>
                  </div>

                  <div className="ca-form-group">
                    <label>Description & Objectives</label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Mandatory homework problems for Week 3. Practice before lab."
                      value={asgnDesc}
                      onChange={(e) => setAsgnDesc(e.target.value)}
                    />
                  </div>

                  {/* Problem Selector */}
                  <div className="ca-form-group">
                    <label>Curate Problems ({asgnQuestions.length} selected)</label>
                    <div className="ca-questions-selector-grid">
                      {CURATED_QUESTIONS.map((q) => {
                        const isSelected = asgnQuestions.includes(q.id);
                        return (
                          <div
                            key={q.id}
                            className={`ca-q-card ${isSelected ? 'selected' : ''}`}
                            onClick={() => {
                              if (isSelected) {
                                setAsgnQuestions(asgnQuestions.filter(id => id !== q.id));
                              } else {
                                setAsgnQuestions([...asgnQuestions, q.id]);
                              }
                            }}
                          >
                            <div className="ca-q-top">
                              <span className="ca-q-title">{q.title}</span>
                              <span className={`diff-badge diff-${q.difficulty.toLowerCase()}`}>
                                {q.difficulty}
                              </span>
                            </div>
                            <div className="ca-q-meta">
                              <span>Selected: {isSelected ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <button type="submit" className="ca-btn-primary full-width" disabled={creatingAsgn}>
                    <Plus size={16} />
                    <span>{creatingAsgn ? 'Publishing...' : 'Publish to Student Library'}</span>
                  </button>
                </form>
              </div>

              {/* Published Lab Sheets List */}
              <div className="ca-section-card ca-exams-list-card">
                <div className="ca-card-head">
                  <h3>Active Lab Sheets ({assignments.length})</h3>
                  <button className="ca-btn-icon-refresh" onClick={fetchAssignments}>
                    <RefreshCw size={14} />
                  </button>
                </div>

                <div className="ca-table-wrapper">
                  <table className="ca-table">
                    <thead>
                      <tr>
                        <th>Title</th>
                        <th>Branch</th>
                        <th>Problems</th>
                        <th>Published</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.length > 0 ? (
                        assignments.map((asgn) => (
                          <tr key={asgn.id}>
                            <td>
                              <strong>{asgn.title}</strong>
                              {asgn.description && <div className="ca-sub-text">{asgn.description.slice(0, 45)}...</div>}
                            </td>
                            <td><span className="ca-pill-branch">{asgn.target_branch || 'ALL'}</span></td>
                            <td>{Array.isArray(asgn.problems) ? asgn.problems.length : 0} problems</td>
                            <td>{new Date(asgn.created_at).toLocaleDateString()}</td>
                            <td>
                              <button 
                                className="ca-action-btn delete"
                                title="Remove lab sheet"
                                onClick={() => handleDeleteAssignment(asgn.id)}
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="ca-empty-cell">No lab sheets published yet.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: LIVE PROCTORING MONITOR & MARKSHEET */}
        {activeTab === 'live' && (
          <div className="ca-tab-pane">
            <div className="ca-section-card">
              <div className="ca-live-header-row">
                <div>
                  <h3>Live Exam Proctoring & Automated Marksheet</h3>
                  <p>Real-time monitor of student activity, violations, and instant Excel grade export.</p>
                </div>
                <div className="ca-live-actions">
                  <select 
                    className="ca-select-exam"
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                  >
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                  <button className="ca-btn-export-excel" onClick={handleDownloadMarksheet}>
                    <FileSpreadsheet size={16} /> <span>1-Click Download Marksheet (CSV)</span>
                  </button>
                </div>
              </div>

              {/* Status Counters */}
              <div className="ca-live-stat-grid">
                <div className="ca-live-stat-box active">
                  <span className="count">{liveData?.activeCount || 0}</span>
                  <span className="label">Currently Writing</span>
                </div>
                <div className="ca-live-stat-box submitted">
                  <span className="count">{liveData?.submittedCount || 0}</span>
                  <span className="label">Submitted Tests</span>
                </div>
                <div className="ca-live-stat-box flagged">
                  <span className="count">{liveData?.flaggedCount || 0}</span>
                  <span className="label">Cheating / Violation Flags</span>
                </div>
              </div>

              {/* Results Marksheet Table */}
              <div className="ca-table-container">
                <table className="ca-data-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Score</th>
                      <th>Problems Solved</th>
                      <th>Violations (Tab Switches)</th>
                      <th>Status</th>
                      <th>Submitted At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examResults?.results && examResults.results.length > 0 ? (
                      examResults.results.map((r) => {
                        const hasHighViolations = (r.violations_count || 0) >= 3;
                        return (
                          <tr key={r.id} className={hasHighViolations ? 'ca-row-violation' : ''}>
                            <td><strong>{r.roll_no}</strong></td>
                            <td>{r.name}</td>
                            <td>
                              <span className="ca-score-badge">{r.score || 0} / 100</span>
                            </td>
                            <td>{r.problems_solved || 0} solved</td>
                            <td>
                              {hasHighViolations ? (
                                <span className="ca-violation-badge red">
                                  <AlertTriangle size={12} /> {r.violations_count} Violations (Flagged)
                                </span>
                              ) : r.violations_count > 0 ? (
                                <span className="ca-violation-badge yellow">
                                  {r.violations_count} Tab switches
                                </span>
                              ) : (
                                <span className="ca-violation-badge green">0 Clean</span>
                              )}
                            </td>
                            <td>
                              <span className={`ca-status-pill ${r.status || 'in_progress'}`}>
                                {r.status === 'submitted' ? 'Submitted' : 'In Progress'}
                              </span>
                            </td>
                            <td>
                              {r.submitted_at ? new Date(r.submitted_at).toLocaleTimeString() : 'Active'}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={7} className="ca-empty-cell">
                          No student submissions for this exam yet. Students can log in at <code>/portal</code> to take the test.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default CollegeAdmin;
