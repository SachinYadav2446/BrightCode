import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2, Users, FileText, ShieldAlert, Download, Plus, Search,
  RefreshCw, Trash2, KeyRound, Play, CheckCircle2, AlertTriangle,
  UploadCloud, FileSpreadsheet, Sparkles, School, BarChart3, Clock,
  LogOut, ArrowRight, Check, Copy, Eye, Award, BookOpen, Trophy,
  Flame, Zap, Crown, Layers, Send, Edit3, ExternalLink, Globe,
  MessageSquare, FolderPlus, X, HelpCircle, Compass
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';
import FriendsDrawer from '../components/FriendsDrawer';
import './CollegeAdmin.css';

const SAMPLE_CSV = `21CS003,Ishaan Verma,ishaan@apex.edu,CSE,2026
21CS004,Ananya Gupta,ananya@apex.edu,CSE,2026
21CS005,Rohan Sharma,rohan@apex.edu,CSE,2026
21IT001,Priya Nair,priya@apex.edu,IT,2026
21IT002,Aditya Rao,aditya@apex.edu,IT,2026`;

const CURATED_QUESTIONS = [
  { id: 'q1', title: 'Array Reverse', difficulty: 'Easy', timeLimit: '1.0s', testCases: [{ input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1' }] },
  { id: 'q2', title: 'Min and Max in Array', difficulty: 'Medium', timeLimit: '1.0s', testCases: [{ input: '6\n3 2 1 56 10000 167', expectedOutput: '1 10000' }] },
  { id: 'q3', title: "Kadane's Algorithm", difficulty: 'Medium', timeLimit: '1.0s', testCases: [{ input: '5\n1 2 3 -2 5', expectedOutput: '9' }] },
  { id: 'q4', title: 'Two Sum - Pairs with 0 Sum', difficulty: 'Easy', timeLimit: '1.0s', testCases: [{ input: '5\n-1 0 1 2 -1 -4', expectedOutput: '-1 1' }] },
  { id: 'q5', title: 'Merge Intervals', difficulty: 'Medium', timeLimit: '1.0s', testCases: [{ input: '4\n1 3 2 6 8 10 15 18', expectedOutput: '1 6 8 10 15 18' }] }
];

const STARTER_TEMPLATES = {
  dsa: {
    title: 'Data Structures & Algorithms in C++',
    description: 'Core semester lab modules covering pointers, dynamic arrays, linked lists, and algorithm complexity.',
    category: 'Computer Science',
    color: '#3b82f6',
    target_branch: 'ALL',
    target_batch: '2026',
    topics: [
      {
        id: 'top_1',
        title: '1. Pointers & Dynamic Memory Management',
        content: '### Pointers in C++\nPointers are variables that store the memory address of another variable.\n\n```cpp\nint val = 42;\nint* ptr = &val;\ncout << *ptr << endl; // Prints 42\n```\n\n#### Key Rules:\n1. Always initialize pointers before use.\n2. Deallocate dynamically allocated memory using `delete` or `delete[]` to prevent memory leaks.\n3. Prefer modern C++ smart pointers (`std::unique_ptr`, `std::shared_ptr`).',
        questions: [
          {
            id: 'q_ptr_1',
            question: 'What is the output of *ptr when ptr points to int x = 100?',
            options: ['100', 'Memory address of x', 'Compiler Error', 'Garbage value'],
            answer: 0,
            explanation: 'Dereferencing (*ptr) accesses the actual value stored at the memory address.'
          },
          {
            id: 'q_ptr_2',
            question: 'Which operator is used to deallocate dynamic memory allocated with new in C++?',
            options: ['free()', 'delete', 'remove', 'dispose'],
            answer: 1,
            explanation: 'The delete operator releases memory allocated on the free store (heap) via new.'
          }
        ]
      },
      {
        id: 'top_2',
        title: '2. Singly Linked Lists & Node Traversal',
        content: '### Singly Linked Lists\nA sequence of nodes where each node contains data and a pointer to the next node in sequence.\n\n```cpp\nstruct Node {\n    int data;\n    Node* next;\n    Node(int val) : data(val), next(nullptr) {}\n};\n```\n\nTime Complexity for traversal is O(N), insertion at head is O(1).',
        questions: [
          {
            id: 'q_ll_1',
            question: 'What is the time complexity to insert a new node at the head of a singly linked list?',
            options: ['O(1)', 'O(N)', 'O(log N)', 'O(N^2)'],
            answer: 0,
            explanation: 'Inserting at the head simply requires updating the new node’s next pointer and moving the head pointer, taking O(1) constant time.'
          }
        ]
      }
    ]
  },
  python: {
    title: 'Python for Data Structures & Problem Solving',
    description: 'Comprehensive Python curriculum covering list comprehensions, generators, dictionaries, and recursion.',
    category: 'Software Engineering',
    color: '#10b981',
    target_branch: 'ALL',
    target_batch: '2026',
    topics: [
      {
        id: 'py_top_1',
        title: '1. Python Lists, Sets & Hash Maps',
        content: '### Python Data Structures\nPython provides high-performance built-in types:\n- Lists: Dynamic contiguous arrays with O(1) amortized append.\n- Dictionaries: Hash maps with O(1) average lookup time.\n- Sets: Hash-based collections of unique items.',
        questions: [
          {
            id: 'py_q_1',
            question: 'What is the average time complexity for checking membership in a Python set ("x in s")?',
            options: ['O(1)', 'O(N)', 'O(log N)', 'O(N log N)'],
            answer: 0,
            explanation: 'Python sets are implemented using hash tables, offering O(1) average lookup.'
          }
        ]
      }
    ]
  }
};

const CollegeAdmin = () => {
  const navigate = useNavigate();
  const { friendsDrawerOpen, setFriendsDrawerOpen } = useAuth();

  // Tab State: 'overview' | 'modules' | 'leaderboard' | 'students' | 'exams' | 'assignments' | 'live'
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Curriculum & Library Studio States
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    category: 'Computer Science',
    color: '#3b82f6',
    target_branch: 'ALL',
    target_batch: '2026',
    isPublished: true,
    topics: []
  });

  // Campus Leaderboard States
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(false);
  const [leaderboardFilter, setLeaderboardFilter] = useState('ALL');

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

  // ══════════════════════════════════════════════════════════════════════════════
  // DATA FETCHING
  // ══════════════════════════════════════════════════════════════════════════════
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

  const fetchModules = async () => {
    try {
      setLoadingModules(true);
      const res = await fetch(`${API_URL}/api/college/library/modules`, { headers: authHeaders });
      const data = await res.json();
      if (data.success && Array.isArray(data.modules)) {
        setModules(data.modules);
      }
    } catch (e) {
      console.error('[COLLEGE] Modules fetch error:', e);
    } finally {
      setLoadingModules(false);
    }
  };

  const fetchLeaderboard = async (branch = 'ALL') => {
    try {
      setLoadingLeaderboard(true);
      const url = branch !== 'ALL'
        ? `${API_URL}/api/college/leaderboard?branch=${branch}`
        : `${API_URL}/api/college/leaderboard`;
      const res = await fetch(url, { headers: authHeaders });
      const data = await res.json();
      if (data.success && Array.isArray(data.leaderboard)) {
        setLeaderboard(data.leaderboard);
      }
    } catch (e) {
      console.error('[COLLEGE] Leaderboard fetch error:', e);
    } finally {
      setLoadingLeaderboard(false);
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

  useEffect(() => {
    fetchStats();
    fetchStudents();
    fetchModules();
    fetchLeaderboard();
    fetchExams();
    fetchAssignments();
  }, []);

  useEffect(() => {
    if (activeTab === 'students') fetchStudents();
    if (activeTab === 'modules') fetchModules();
    if (activeTab === 'leaderboard') fetchLeaderboard(leaderboardFilter);
    if (activeTab === 'exams') fetchExams();
    if (activeTab === 'assignments') fetchAssignments();
    if (activeTab === 'live' && selectedExamId) {
      fetchLiveMonitor(selectedExamId);
      const interval = setInterval(() => fetchLiveMonitor(selectedExamId), 5000);
      return () => clearInterval(interval);
    }
  }, [activeTab, selectedExamId, filterBranch, leaderboardFilter]);

  // ══════════════════════════════════════════════════════════════════════════════
  // CURRICULUM & MODULE STUDIO ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  const handleOpenCreateModule = () => {
    setEditingModuleId(null);
    setModuleForm({
      title: '',
      description: '',
      category: 'Computer Science',
      color: '#3b82f6',
      target_branch: 'ALL',
      target_batch: '2026',
      isPublished: true,
      topics: [
        {
          id: 'top_' + Date.now(),
          title: '1. Core Concepts & Overview',
          content: '### Topic Notes\nAdd faculty lecture notes, theory, and code examples here...',
          questions: [
            {
              id: 'q_' + Date.now(),
              question: 'Sample check question?',
              options: ['Option A', 'Option B', 'Option C', 'Option D'],
              answer: 0,
              explanation: 'Detailed explanation for correct answer.'
            }
          ]
        }
      ]
    });
    setIsModuleModalOpen(true);
  };

  const handleOpenEditModule = (mod) => {
    setEditingModuleId(mod.id);
    setModuleForm({
      title: mod.title || '',
      description: mod.description || '',
      category: mod.category || 'Computer Science',
      color: mod.color || '#3b82f6',
      target_branch: mod.target_branch || 'ALL',
      target_batch: mod.target_batch || '2026',
      isPublished: mod.is_published !== false,
      topics: mod.topics || []
    });
    setIsModuleModalOpen(true);
  };

  const handleLoadTemplate = (templateKey) => {
    const tmpl = STARTER_TEMPLATES[templateKey];
    if (!tmpl) return;
    setModuleForm(prev => ({
      ...prev,
      title: tmpl.title,
      description: tmpl.description,
      category: tmpl.category,
      color: tmpl.color,
      topics: JSON.parse(JSON.stringify(tmpl.topics))
    }));
    toast.success(`Loaded ${tmpl.title} template!`);
  };

  const handleAddTopic = () => {
    setModuleForm(prev => ({
      ...prev,
      topics: [
        ...prev.topics,
        {
          id: 'top_' + Date.now(),
          title: `${prev.topics.length + 1}. New Chapter`,
          content: '### Chapter Notes\nEnter concept lecture breakdown...',
          questions: [
            {
              id: 'q_' + Date.now(),
              question: 'Enter question text...',
              options: ['Option 1', 'Option 2', 'Option 3', 'Option 4'],
              answer: 0,
              explanation: 'Explanation for students.'
            }
          ]
        }
      ]
    }));
  };

  const handleRemoveTopic = (tIdx) => {
    setModuleForm(prev => ({
      ...prev,
      topics: prev.topics.filter((_, idx) => idx !== tIdx)
    }));
  };

  const handleAddQuestionToTopic = (tIdx) => {
    setModuleForm(prev => {
      const updatedTopics = [...prev.topics];
      const targetTopic = { ...updatedTopics[tIdx] };
      targetTopic.questions = [
        ...(targetTopic.questions || []),
        {
          id: 'q_' + Date.now(),
          question: 'New conceptual check question?',
          options: ['Option A', 'Option B', 'Option C', 'Option D'],
          answer: 0,
          explanation: 'Reasoning behind the solution.'
        }
      ];
      updatedTopics[tIdx] = targetTopic;
      return { ...prev, topics: updatedTopics };
    });
  };

  const handleRemoveQuestionFromTopic = (tIdx, qIdx) => {
    setModuleForm(prev => {
      const updatedTopics = [...prev.topics];
      const targetTopic = { ...updatedTopics[tIdx] };
      targetTopic.questions = targetTopic.questions.filter((_, idx) => idx !== qIdx);
      updatedTopics[tIdx] = targetTopic;
      return { ...prev, topics: updatedTopics };
    });
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleForm.title.trim()) {
      toast.error('Module Title is required');
      return;
    }

    try {
      const url = editingModuleId
        ? `${API_URL}/api/college/library/modules/${editingModuleId}`
        : `${API_URL}/api/college/library/modules`;
      const method = editingModuleId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: authHeaders,
        body: JSON.stringify(moduleForm)
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to save module');

      toast.success(editingModuleId ? 'Module updated successfully!' : 'Curriculum module created!');
      setIsModuleModalOpen(false);
      fetchModules();
      fetchStats();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleTogglePublishModule = async (mod) => {
    try {
      const res = await fetch(`${API_URL}/api/college/library/modules/${mod.id}/publish`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ isPublished: !mod.is_published })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.is_published ? `Published "${mod.title}" to students!` : `Moved "${mod.title}" to Drafts.`);
        fetchModules();
        fetchStats();
      }
    } catch (err) {
      toast.error('Failed to change publish status');
    }
  };

  const handleDeleteModule = async (modId) => {
    if (!window.confirm('Are you sure you want to delete this curriculum module? Institutional students will no longer see it.')) return;
    try {
      const res = await fetch(`${API_URL}/api/college/library/modules/${modId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Curriculum module deleted');
        fetchModules();
        fetchStats();
      }
    } catch (err) {
      toast.error('Failed to delete module');
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // STUDENT ONBOARDING & CSV GENERATION
  // ══════════════════════════════════════════════════════════════════════════════
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
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to generate student accounts');

      toast.success(`Successfully provisioned ${data.created?.length || 0} student accounts!`);
      setLastGeneratedCredentials(data.created || []);
      setBulkInputText('');
      fetchStudents();
      fetchStats();
      fetchLeaderboard();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setGeneratingAccounts(false);
    }
  };

  const handleDownloadCredentials = () => {
    if (!lastGeneratedCredentials || lastGeneratedCredentials.length === 0) return;
    const header = 'Roll Number,Full Name,Username,Email,Temporary Password\n';
    const rows = lastGeneratedCredentials.map(s =>
      `"${s.rollNo}","${s.name}","${s.username}","${s.email}","${s.tempPassword}"`
    ).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `brightcode_credentials_${orgCode}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Downloaded credentials CSV');
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
        fetchLeaderboard();
      }
    } catch (e) {
      toast.error('Failed to delete student');
    }
  };

  // ══════════════════════════════════════════════════════════════════════════════
  // EXAM & ASSIGNMENT ACTIONS
  // ══════════════════════════════════════════════════════════════════════════════
  const handleCreateExam = async (e) => {
    e.preventDefault();
    if (!examTitle.trim()) {
      toast.error('Please enter an exam title');
      return;
    }
    if (selectedQuestions.length === 0) {
      toast.error('Please select at least one coding question');
      return;
    }

    setCreatingExam(true);
    try {
      const selectedQuestionObjects = CURATED_QUESTIONS
        .filter(q => selectedQuestions.includes(q.id))
        .map(q => ({
          id: q.id,
          title: q.title,
          difficulty: q.difficulty,
          description: `Solve the problem ${q.title}. Implement the solution in either C++, Python, or Java.`,
          testCases: q.testCases
        }));

      const res = await fetch(`${API_URL}/api/college/exams`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({
          title: examTitle,
          description: examDesc,
          durationMinutes: parseInt(examDuration) || 60,
          targetBranch,
          targetBatch,
          questions: selectedQuestionObjects
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to create exam');

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
      s.email?.toLowerCase().includes(q) ||
      s.name?.toLowerCase().includes(q)
    );
  });

  const publishedModulesCount = modules.filter(m => m.is_published).length;
  const draftModulesCount = modules.length - publishedModulesCount;

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
          {/* Faculty Community & Friends Drawer Trigger */}
          <button
            className="ca-btn-community"
            onClick={() => setFriendsDrawerOpen(true)}
            title="Open Faculty Lounge & Friends"
          >
            <Users size={16} />
            <Sparkles size={14} className="sparkle-gold" />
            <span>Faculty Lounge & Friends</span>
          </button>

          <div className="ca-quota-badge">
            <span className="ca-quota-label">CAMPUS SEAT LICENSE:</span>
            <span className="ca-quota-val">
              {stats?.org?.enrolledCount || 0} / {stats?.org?.maxStudents || 300} Active
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
              <span className="ca-user-role">Department Professor</span>
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
          <span>Dashboard Overview</span>
        </button>

        <button
          className={`ca-nav-tab ${activeTab === 'modules' ? 'active' : ''}`}
          onClick={() => setActiveTab('modules')}
        >
          <BookOpen size={16} />
          <span>Curriculum Studio</span>
          <span className="ca-tab-count">{modules.length}</span>
        </button>

        <button
          className={`ca-nav-tab ${activeTab === 'leaderboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          <Trophy size={16} />
          <span>Campus Leaderboard & XP</span>
          <span className="ca-tab-pill-pulse">LIVE</span>
        </button>

        <button
          className={`ca-nav-tab ${activeTab === 'students' ? 'active' : ''}`}
          onClick={() => setActiveTab('students')}
        >
          <Users size={16} />
          <span>Student Directory & XP</span>
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
          <Layers size={16} />
          <span>Lab Sheets & Practice</span>
          <span className="ca-tab-count">{assignments.length}</span>
        </button>

        <button
          className={`ca-nav-tab ${activeTab === 'live' ? 'active' : ''}`}
          onClick={() => setActiveTab('live')}
        >
          <ShieldAlert size={16} />
          <span>Live Proctoring</span>
          <span className="ca-tab-pill-live">SECURE</span>
        </button>
      </nav>

      {/* ── Main Content Area ──────────────────────────────── */}
      <main className="ca-main-content">

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 1: DASHBOARD OVERVIEW
            ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'overview' && (
          <div className="ca-tab-pane">
            <div className="ca-hero-card">
              <div className="ca-hero-left">
                <span className="ca-badge-inst">Faculty Command Console</span>
                <h2>Welcome, {username}</h2>
                <p>
                  Author custom library modules, monitor real-time student XP telemetry, schedule proctored exams, and collaborate with colleagues across BrightCode.
                </p>
                <div className="ca-hero-actions">
                  <button className="ca-btn-primary" onClick={() => setActiveTab('modules')}>
                    <BookOpen size={16} /> <span>Curriculum Studio</span>
                  </button>
                  <button className="ca-btn-secondary" onClick={() => setActiveTab('leaderboard')}>
                    <Trophy size={16} /> <span>Campus Leaderboard</span>
                  </button>
                  <button className="ca-btn-community-alt" onClick={() => setFriendsDrawerOpen(true)}>
                    <Users size={16} /> <span>Open Faculty Lounge</span>
                  </button>
                </div>
              </div>
              <div className="ca-hero-stats">
                <div className="ca-mini-stat">
                  <span className="val">{stats?.org?.enrolledCount || 0}</span>
                  <span className="lbl">Enrolled Students</span>
                </div>
                <div className="ca-mini-stat">
                  <span className="val" style={{ color: '#4ade80' }}>{publishedModulesCount}</span>
                  <span className="lbl">Published Modules</span>
                </div>
                <div className="ca-mini-stat">
                  <span className="val">{stats?.metrics?.activeExams || 0}</span>
                  <span className="lbl">Active Exams</span>
                </div>
                <div className="ca-mini-stat">
                  <span className="val">{leaderboard.reduce((a, s) => a + (s.xp || 0), 0)}</span>
                  <span className="lbl">Total Campus XP</span>
                </div>
              </div>
            </div>

            {/* Quick Launchpad Grid */}
            <div className="ca-quick-flow-grid">
              <div className="ca-flow-step" onClick={() => setActiveTab('modules')}>
                <div className="ca-step-num">01</div>
                <h4>Curriculum & Library Studio</h4>
                <p>Author tailored coursework modules. Students will only see what you publish; until published, their library is empty.</p>
                <span className="ca-step-link">Manage Modules <ArrowRight size={14} /></span>
              </div>
              <div className="ca-flow-step" onClick={() => setActiveTab('leaderboard')}>
                <div className="ca-step-num">02</div>
                <h4>Student XP & Podium</h4>
                <p>Track real-time XP accumulation, problem-solving streaks, and view the Gold, Silver, and Bronze student champions.</p>
                <span className="ca-step-link">View Rankings <ArrowRight size={14} /></span>
              </div>
              <div className="ca-flow-step" onClick={() => setActiveTab('students')}>
                <div className="ca-step-num">03</div>
                <h4>Bulk Student Roster</h4>
                <p>Quickly import class lists via CSV. Auto-generate student accounts with zero individual signup friction.</p>
                <span className="ca-step-link">Onboard Students <ArrowRight size={14} /></span>
              </div>
            </div>

            {/* Top 3 Podium Preview */}
            {leaderboard.length > 0 && (
              <div className="ca-section-card ca-podium-preview-card">
                <div className="ca-card-head-row">
                  <div>
                    <h3>Campus Podium Leaders</h3>
                    <p className="ca-card-desc">Top students driving academic excellence in {orgName}</p>
                  </div>
                  <button className="ca-btn-link" onClick={() => setActiveTab('leaderboard')}>
                    Full Leaderboard <ArrowRight size={14} />
                  </button>
                </div>

                <div className="ca-mini-podium-grid">
                  {leaderboard.slice(0, 3).map((student, idx) => {
                    const isGold = idx === 0;
                    const isSilver = idx === 1;
                    const isBronze = idx === 2;
                    return (
                      <div key={student.id} className={`ca-podium-slot slot-${idx + 1}`}>
                        <div className="ca-podium-rank-tag">
                          {isGold ? <Crown size={20} className="gold-icon" /> :
                           isSilver ? <Award size={18} className="silver-icon" /> :
                           <Award size={18} className="bronze-icon" />}
                          <span>Rank #{idx + 1}</span>
                        </div>
                        <div className="ca-podium-avatar">{student.name?.charAt(0) || student.rollNo?.charAt(0)}</div>
                        <h4>{student.name || student.rollNo}</h4>
                        <span className="ca-podium-roll">{student.rollNo} • {student.branch}</span>
                        <div className="ca-podium-xp-pill">
                          <Zap size={14} /> <strong>{student.xp} XP</strong>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 2: CURRICULUM & LIBRARY STUDIO
            ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'modules' && (
          <div className="ca-tab-pane">
            <div className="ca-studio-header-card">
              <div className="studio-hero-info">
                <span className="ca-badge-inst">Institutional Curriculum Core</span>
                <h2>Coursework & Library Studio</h2>
                <p>
                  Create, publish, and curate interactive modules with conceptual theory and MCQs.
                  Institutional students only see published modules for their branch. Until published, their library is empty.
                </p>
              </div>
              <div className="studio-hero-cta">
                <button className="ca-btn-primary" onClick={handleOpenCreateModule}>
                  <FolderPlus size={16} /> <span>Create New Module</span>
                </button>
              </div>
            </div>

            {/* Metrics Bar */}
            <div className="ca-studio-metrics-bar">
              <div className="studio-metric-box">
                <span className="metric-val">{publishedModulesCount}</span>
                <span className="metric-lbl">Live for Students</span>
              </div>
              <div className="studio-metric-box">
                <span className="metric-val" style={{ color: '#fbbf24' }}>{draftModulesCount}</span>
                <span className="metric-lbl">Unpublished Drafts</span>
              </div>
              <div className="studio-metric-box">
                <span className="metric-val">{modules.reduce((a, m) => a + (m.topics?.length || 0), 0)}</span>
                <span className="metric-lbl">Total Topics / Chapters</span>
              </div>
              <div className="studio-metric-box">
                <span className="metric-val">
                  {modules.reduce((a, m) => a + (m.topics || []).reduce((acc, t) => acc + (t.questions?.length || 0), 0), 0)}
                </span>
                <span className="metric-lbl">Total Question Checks</span>
              </div>
            </div>

            {/* Modules Grid */}
            <div className="ca-modules-grid">
              {modules.map((mod) => {
                const totalQ = (mod.topics || []).reduce((acc, t) => acc + (t.questions?.length || 0), 0);
                const isPublished = Boolean(mod.is_published);

                return (
                  <div key={mod.id} className="ca-mod-card" style={{ '--mod-accent': mod.color || '#3b82f6' }}>
                    <div className="ca-mod-accent-bar" style={{ background: mod.color || '#3b82f6' }}></div>
                    <div className="ca-mod-top">
                      <span className="ca-mod-category">{mod.category || 'Computer Science'}</span>
                      <div className={`ca-publish-pill ${isPublished ? 'published' : 'draft'}`}>
                        <span className="status-dot"></span>
                        <span>{isPublished ? 'PUBLISHED' : 'DRAFT'}</span>
                      </div>
                    </div>

                    <h3 className="ca-mod-title">{mod.title}</h3>
                    <p className="ca-mod-desc">{mod.description}</p>

                    <div className="ca-mod-specs">
                      <span><strong>{mod.topics?.length || 0}</strong> Topics</span>
                      <span>•</span>
                      <span><strong>{totalQ}</strong> MCQs</span>
                      <span>•</span>
                      <span>Branch: <strong>{mod.target_branch || 'ALL'}</strong></span>
                    </div>

                    <div className="ca-mod-actions">
                      <button
                        className={`ca-btn-toggle-pub ${isPublished ? 'unpublish' : 'publish'}`}
                        onClick={() => handleTogglePublishModule(mod)}
                      >
                        {isPublished ? 'Unpublish to Draft' : 'Publish to Students'}
                      </button>
                      <button className="ca-btn-edit-mod" onClick={() => handleOpenEditModule(mod)} title="Edit Module">
                        <Edit3 size={15} />
                      </button>
                      <button className="ca-btn-del-mod" onClick={() => handleDeleteModule(mod.id)} title="Delete Module">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 3: CAMPUS LEADERBOARD & XP TELEMETRY
            ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'leaderboard' && (
          <div className="ca-tab-pane">
            <div className="ca-section-card">
              <div className="ca-leaderboard-header">
                <div>
                  <span className="ca-badge-inst">Live Academic Telemetry</span>
                  <h2>{orgName} Campus Leaderboard</h2>
                  <p>Real-time XP counts and problem-solving metrics across all departments.</p>
                </div>
                <div className="ca-lb-filters">
                  <select
                    className="ca-select-filter"
                    value={leaderboardFilter}
                    onChange={(e) => setLeaderboardFilter(e.target.value)}
                  >
                    <option value="ALL">All Departments</option>
                    <option value="CSE">CSE Department</option>
                    <option value="IT">IT Department</option>
                    <option value="ECE">ECE Department</option>
                  </select>
                </div>
              </div>

              {/* Podium Visual (Top 3) */}
              {leaderboard.length >= 1 && (
                <div className="ca-grand-podium">
                  {/* Rank 2 - Silver */}
                  {leaderboard[1] && (
                    <div className="podium-pillar silver">
                      <div className="podium-badge"><Award size={20} /> #2</div>
                      <div className="podium-avatar">{leaderboard[1].name?.charAt(0) || '2'}</div>
                      <div className="podium-name">{leaderboard[1].name}</div>
                      <div className="podium-roll">{leaderboard[1].rollNo} ({leaderboard[1].branch})</div>
                      <div className="podium-xp"><Zap size={14} /> {leaderboard[1].xp} XP</div>
                      <div className="pillar-block block-silver">2nd Place</div>
                    </div>
                  )}

                  {/* Rank 1 - Gold */}
                  {leaderboard[0] && (
                    <div className="podium-pillar gold">
                      <div className="podium-badge crown"><Crown size={24} /> #1</div>
                      <div className="podium-avatar gold-avatar">{leaderboard[0].name?.charAt(0) || '1'}</div>
                      <div className="podium-name">{leaderboard[0].name}</div>
                      <div className="podium-roll">{leaderboard[0].rollNo} ({leaderboard[0].branch})</div>
                      <div className="podium-xp gold-xp"><Zap size={15} /> {leaderboard[0].xp} XP</div>
                      <div className="pillar-block block-gold">CAMPUS CHAMPION</div>
                    </div>
                  )}

                  {/* Rank 3 - Bronze */}
                  {leaderboard[2] && (
                    <div className="podium-pillar bronze">
                      <div className="podium-badge"><Award size={20} /> #3</div>
                      <div className="podium-avatar">{leaderboard[2].name?.charAt(0) || '3'}</div>
                      <div className="podium-name">{leaderboard[2].name}</div>
                      <div className="podium-roll">{leaderboard[2].rollNo} ({leaderboard[2].branch})</div>
                      <div className="podium-xp"><Zap size={14} /> {leaderboard[2].xp} XP</div>
                      <div className="pillar-block block-bronze">3rd Place</div>
                    </div>
                  )}
                </div>
              )}

              {/* Leaderboard Table */}
              <div className="ca-table-container">
                <table className="ca-data-table">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Branch</th>
                      <th>Batch</th>
                      <th>Total XP</th>
                      <th>Rank Tier</th>
                      <th>Problems Solved</th>
                      <th>Streak</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard.length > 0 ? (
                      leaderboard.map((st, idx) => (
                        <tr key={st.id || idx}>
                          <td>
                            <span className={`ca-rank-circle rank-${idx + 1}`}>#{idx + 1}</span>
                          </td>
                          <td><strong>{st.rollNo}</strong></td>
                          <td>{st.name || st.username}</td>
                          <td><span className="ca-pill-branch">{st.branch}</span></td>
                          <td>{st.batch}</td>
                          <td>
                            <span className="ca-xp-cell">
                              <Zap size={14} className="text-yellow" />
                              <strong>{st.xp} XP</strong>
                            </span>
                          </td>
                          <td>
                            <span className={`ca-rank-badge ${st.rankBadge || 'lvl-novice'}`}>
                              {st.rankLevel || 'Novice'}
                            </span>
                          </td>
                          <td>{st.problemsSolved || 0}</td>
                          <td>
                            <span className="ca-streak-cell">
                              <Flame size={14} className="text-red" />
                              {st.streak || 0} Days
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                          No students ranked in this branch yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 4: STUDENT DIRECTORY & ONBOARDING
            ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'students' && (
          <div className="ca-tab-pane">
            {/* Bulk Onboarding Box */}
            <div className="ca-section-card">
              <div className="ca-card-head-row">
                <div>
                  <h3>Bulk Onboard Student Accounts</h3>
                  <p className="ca-card-desc">
                    Paste student details as comma-separated values (CSV) or load our sample roster.
                  </p>
                </div>
                <button
                  type="button"
                  className="ca-btn-secondary"
                  onClick={() => setBulkInputText(SAMPLE_CSV)}
                >
                  <FileSpreadsheet size={15} /> <span>Load Sample CSV</span>
                </button>
              </div>

              <div className="ca-csv-input-wrapper">
                <textarea
                  className="ca-csv-textarea"
                  rows={4}
                  placeholder="Format: RollNumber, Full Name, Email, Branch, Batch&#10;Example:&#10;21CS001, Aarav Sharma, aarav@apex.edu, CSE, 2026&#10;21CS002, Diya Patel, diya@apex.edu, CSE, 2026"
                  value={bulkInputText}
                  onChange={(e) => setBulkInputText(e.target.value)}
                />
              </div>

              <div className="ca-generator-footer">
                <div className="ca-gen-note">
                  <CheckCircle2 size={16} className="text-green" />
                  <span>Initial passwords are automatically formatted as <code>Bright@&lt;RollNo&gt;</code></span>
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

              {lastGeneratedCredentials && lastGeneratedCredentials.length > 0 && (
                <div className="ca-credentials-alert-box">
                  <div className="ca-cred-info">
                    <CheckCircle2 size={24} className="text-green" />
                    <div>
                      <strong>Accounts Provisioned Successfully!</strong>
                      <p>Download the credentials CSV file to distribute passwords to your class.</p>
                    </div>
                  </div>
                  <button className="ca-btn-download-csv" onClick={handleDownloadCredentials}>
                    <Download size={16} /> <span>Download Student Credentials (CSV)</span>
                  </button>
                </div>
              )}
            </div>

            {/* Enrolled Students Table with XP */}
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
                      placeholder="Search Roll No, Name, Username..."
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
                      <th>Student Name</th>
                      <th>Branch</th>
                      <th>Batch</th>
                      <th>Total XP</th>
                      <th>Rank Level</th>
                      <th>Solved</th>
                      <th>Streak</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((st) => (
                        <tr key={st.id}>
                          <td><strong>{st.rollNo}</strong></td>
                          <td>{st.name || st.username}</td>
                          <td><span className="ca-pill-branch">{st.branch}</span></td>
                          <td>{st.batch}</td>
                          <td>
                            <span className="ca-xp-cell">
                              <Zap size={14} className="text-yellow" />
                              <strong>{st.xp || 0} XP</strong>
                            </span>
                          </td>
                          <td>
                            <span className={`ca-rank-badge ${st.rankBadge || 'lvl-novice'}`}>
                              {st.rankLevel || 'Novice'}
                            </span>
                          </td>
                          <td>{st.problemsSolved || 0}</td>
                          <td>
                            <span className="ca-streak-cell">
                              <Flame size={14} className="text-red" />
                              {st.streak || 0}d
                            </span>
                          </td>
                          <td>
                            <div className="ca-action-cell">
                              <button
                                className="ca-action-icon"
                                title="Reset Password"
                                onClick={() => handleResetPassword(st.id, st.rollNo)}
                              >
                                <KeyRound size={15} />
                              </button>
                              <button
                                className="ca-action-icon text-red"
                                title="Delete & Release Seat"
                                onClick={() => handleDeleteStudent(st.id)}
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                          No students found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 5: EXAM CREATOR
            ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'exams' && (
          <div className="ca-tab-pane">
            <div className="ca-section-card">
              <h3>Create Proctored Lab Exam</h3>
              <p className="ca-card-desc">
                Schedule a coding test with full anti-cheating tab-switch detection and code execution tests.
              </p>

              <form onSubmit={handleCreateExam} className="ca-form-grid">
                <div className="ca-form-group full-width">
                  <label>Exam Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Midterm Lab Assessment: Data Structures & Algorithms"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="ca-form-group full-width">
                  <label>Instructions & Description</label>
                  <textarea
                    rows={3}
                    placeholder="Provide exam rules, allowed compilers, and proctoring constraints..."
                    value={examDesc}
                    onChange={(e) => setExamDesc(e.target.value)}
                  />
                </div>

                <div className="ca-form-group">
                  <label>Duration (Minutes) *</label>
                  <input
                    type="number"
                    min="15"
                    max="180"
                    value={examDuration}
                    onChange={(e) => setExamDuration(e.target.value)}
                    required
                  />
                </div>

                <div className="ca-form-group">
                  <label>Target Branch</label>
                  <select value={targetBranch} onChange={(e) => setTargetBranch(e.target.value)}>
                    <option value="ALL">All Branches</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>

                <div className="ca-form-group">
                  <label>Target Batch</label>
                  <input
                    type="text"
                    value={targetBatch}
                    onChange={(e) => setTargetBatch(e.target.value)}
                    placeholder="e.g. 2026"
                  />
                </div>

                <div className="ca-form-group full-width">
                  <label>Select Coding Challenges for this Exam *</label>
                  <div className="ca-curated-q-grid">
                    {CURATED_QUESTIONS.map((q) => {
                      const isSelected = selectedQuestions.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`ca-curated-q-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            if (isSelected) {
                              setSelectedQuestions(selectedQuestions.filter(id => id !== q.id));
                            } else {
                              setSelectedQuestions([...selectedQuestions, q.id]);
                            }
                          }}
                        >
                          <div className="ca-q-check">{isSelected && <Check size={14} />}</div>
                          <div className="ca-q-info">
                            <strong>{q.title}</strong>
                            <span className={`diff-badge ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="ca-form-actions full-width">
                  <button type="submit" className="ca-btn-primary" disabled={creatingExam}>
                    {creatingExam ? 'Scheduling Exam...' : 'Publish Proctored Exam'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 6: LAB SHEETS & ASSIGNMENTS
            ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'assignments' && (
          <div className="ca-tab-pane">
            <div className="ca-section-card">
              <h3>Publish Weekly Lab Sheet / Practice Set</h3>
              <p className="ca-card-desc">Assign non-timed curated question sets directly to your students' dashboard.</p>

              <form onSubmit={handleCreateAssignment} className="ca-form-grid">
                <div className="ca-form-group full-width">
                  <label>Lab Sheet Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Week 4: Dynamic Programming & Greedy Practice"
                    value={asgnTitle}
                    onChange={(e) => setAsgnTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="ca-form-group full-width">
                  <label>Instructions & Submission Deadline</label>
                  <textarea
                    rows={2}
                    placeholder="Instructions for students regarding due date and submission..."
                    value={asgnDesc}
                    onChange={(e) => setAsgnDesc(e.target.value)}
                  />
                </div>

                <div className="ca-form-group">
                  <label>Target Branch</label>
                  <select value={asgnBranch} onChange={(e) => setAsgnBranch(e.target.value)}>
                    <option value="ALL">All Branches</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                  </select>
                </div>

                <div className="ca-form-group">
                  <label>Target Batch</label>
                  <input
                    type="text"
                    value={asgnBatch}
                    onChange={(e) => setAsgnBatch(e.target.value)}
                  />
                </div>

                <div className="ca-form-group full-width">
                  <label>Pick Questions for this Sheet</label>
                  <div className="ca-curated-q-grid">
                    {CURATED_QUESTIONS.map((q) => {
                      const isSelected = asgnQuestions.includes(q.id);
                      return (
                        <div
                          key={q.id}
                          className={`ca-curated-q-card ${isSelected ? 'selected' : ''}`}
                          onClick={() => {
                            if (isSelected) {
                              setAsgnQuestions(asgnQuestions.filter(id => id !== q.id));
                            } else {
                              setAsgnQuestions([...asgnQuestions, q.id]);
                            }
                          }}
                        >
                          <div className="ca-q-check">{isSelected && <Check size={14} />}</div>
                          <div className="ca-q-info">
                            <strong>{q.title}</strong>
                            <span className={`diff-badge ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="ca-form-actions full-width">
                  <button type="submit" className="ca-btn-primary" disabled={creatingAsgn}>
                    {creatingAsgn ? 'Publishing Sheet...' : 'Publish Lab Sheet'}
                  </button>
                </div>
              </form>
            </div>

            {/* List of Active Assignments */}
            <div className="ca-section-card">
              <h3>Active Lab Sheets ({assignments.length})</h3>
              <div className="ca-asgn-grid">
                {assignments.map(asgn => (
                  <div key={asgn.id} className="ca-asgn-card">
                    <div className="ca-asgn-head">
                      <h4>{asgn.title}</h4>
                      <button className="ca-btn-del-sm" onClick={() => handleDeleteAssignment(asgn.id)}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p>{asgn.description}</p>
                    <div className="ca-asgn-meta">
                      <span>Branch: <strong>{asgn.target_branch}</strong></span>
                      <span>Problems: <strong>{asgn.problems?.length || 0}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════════
            TAB 7: LIVE PROCTORING & MARKSHEETS
            ══════════════════════════════════════════════════════════════════════ */}
        {activeTab === 'live' && (
          <div className="ca-tab-pane">
            <div className="ca-section-card">
              <div className="ca-live-header">
                <div>
                  <h3>Live Exam Proctoring Console</h3>
                  <p className="ca-card-desc">Real-time anti-cheat telemetry and code test results.</p>
                </div>
                <div className="ca-live-selector">
                  <label>Select Exam:</label>
                  <select
                    value={selectedExamId}
                    onChange={(e) => setSelectedExamId(e.target.value)}
                  >
                    {exams.map(e => (
                      <option key={e.id} value={e.id}>{e.title}</option>
                    ))}
                  </select>
                </div>
              </div>

              {liveData && (
                <div className="ca-live-stat-grid">
                  <div className="ca-live-stat-box active">
                    <span className="count">{liveData.activeStudents || 0}</span>
                    <span className="label">Currently Solving</span>
                  </div>
                  <div className="ca-live-stat-box submitted">
                    <span className="count">{liveData.submittedCount || 0}</span>
                    <span className="label">Submissions Received</span>
                  </div>
                  <div className="ca-live-stat-box flagged">
                    <span className="count">{liveData.flaggedCount || 0}</span>
                    <span className="label">Cheating Violations Flagged</span>
                  </div>
                </div>
              )}

              {/* Live Student Table */}
              <div className="ca-table-container">
                <table className="ca-data-table">
                  <thead>
                    <tr>
                      <th>Roll Number</th>
                      <th>Student Name</th>
                      <th>Status</th>
                      <th>Score</th>
                      <th>Tab Switches</th>
                      <th>Violations Flagged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {liveData?.records && liveData.records.length > 0 ? (
                      liveData.records.map((rec) => (
                        <tr key={rec.id} className={rec.violationsCount > 2 ? 'ca-row-violation' : ''}>
                          <td><strong>{rec.rollNo}</strong></td>
                          <td>{rec.name}</td>
                          <td>
                            <span className={`ca-status-pill ${rec.status}`}>{rec.status}</span>
                          </td>
                          <td>
                            <span className="ca-score-badge">{rec.score} / {rec.totalPoints}</span>
                          </td>
                          <td>{rec.tabSwitches || 0}</td>
                          <td>
                            <span className={`ca-violation-badge ${rec.violationsCount > 2 ? 'red' : rec.violationsCount > 0 ? 'yellow' : 'green'}`}>
                              {rec.violationsCount > 0 ? `${rec.violationsCount} Suspicious Events` : 'Clean'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                          No student telemetry detected for this exam yet.
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

      {/* ══════════════════════════════════════════════════════════════════════
          CURRICULUM MODULE STUDIO MODAL
          ══════════════════════════════════════════════════════════════════════ */}
      {isModuleModalOpen && (
        <div className="ca-modal-overlay">
          <div className="ca-studio-modal">
            <div className="ca-modal-head">
              <div className="ca-modal-title-wrap">
                <BookOpen size={20} className="text-blue" />
                <h3>{editingModuleId ? 'Edit Curriculum Module' : 'Curriculum & Library Studio'}</h3>
              </div>
              <button className="ca-modal-close" onClick={() => setIsModuleModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveModule} className="ca-studio-form">
              {/* Starter Templates Bar */}
              <div className="studio-templates-bar">
                <span>Quick Starter Templates:</span>
                <button
                  type="button"
                  className="studio-tmpl-pill"
                  onClick={() => handleLoadTemplate('dsa')}
                >
                  <Sparkles size={13} /> C++ Data Structures
                </button>
                <button
                  type="button"
                  className="studio-tmpl-pill"
                  onClick={() => handleLoadTemplate('python')}
                >
                  <Sparkles size={13} /> Python Essentials
                </button>
              </div>

              <div className="ca-form-grid">
                <div className="ca-form-group full-width">
                  <label>Module Title *</label>
                  <input
                    type="text"
                    placeholder="e.g. Data Structures & Algorithms in C++"
                    value={moduleForm.title}
                    onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                    required
                  />
                </div>

                <div className="ca-form-group full-width">
                  <label>Module Overview & Objectives</label>
                  <textarea
                    rows={2}
                    placeholder="Describe what students will master in this module..."
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  />
                </div>

                <div className="ca-form-group">
                  <label>Academic Domain / Category</label>
                  <input
                    type="text"
                    value={moduleForm.category}
                    onChange={(e) => setModuleForm({ ...moduleForm, category: e.target.value })}
                    placeholder="e.g. Computer Science, Cloud Systems"
                  />
                </div>

                <div className="ca-form-group">
                  <label>Accent Color</label>
                  <input
                    type="color"
                    value={moduleForm.color}
                    onChange={(e) => setModuleForm({ ...moduleForm, color: e.target.value })}
                  />
                </div>

                <div className="ca-form-group">
                  <label>Target Branch</label>
                  <select
                    value={moduleForm.target_branch}
                    onChange={(e) => setModuleForm({ ...moduleForm, target_branch: e.target.value })}
                  >
                    <option value="ALL">All Branches</option>
                    <option value="CSE">CSE</option>
                    <option value="IT">IT</option>
                    <option value="ECE">ECE</option>
                  </select>
                </div>

                <div className="ca-form-group">
                  <label>Target Batch</label>
                  <input
                    type="text"
                    value={moduleForm.target_batch}
                    onChange={(e) => setModuleForm({ ...moduleForm, target_batch: e.target.value })}
                    placeholder="e.g. 2026"
                  />
                </div>
              </div>

              {/* Topics / Chapters Editor */}
              <div className="studio-topics-container">
                <div className="topics-head-row">
                  <h4>Curriculum Chapters & Concept Checks ({moduleForm.topics.length})</h4>
                  <button type="button" className="ca-btn-secondary-sm" onClick={handleAddTopic}>
                    <Plus size={14} /> <span>Add Chapter</span>
                  </button>
                </div>

                {moduleForm.topics.map((topic, tIdx) => (
                  <div key={topic.id || tIdx} className="studio-topic-card">
                    <div className="topic-card-head">
                      <div className="topic-title-field">
                        <input
                          type="text"
                          value={topic.title}
                          onChange={(e) => {
                            const newTopics = [...moduleForm.topics];
                            newTopics[tIdx].title = e.target.value;
                            setModuleForm({ ...moduleForm, topics: newTopics });
                          }}
                          placeholder="Chapter Title..."
                        />
                      </div>
                      <button
                        type="button"
                        className="ca-btn-del-sm"
                        onClick={() => handleRemoveTopic(tIdx)}
                        title="Remove Topic"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    <div className="topic-content-field">
                      <label>Faculty Lecture Notes & Theory (Markdown supported)</label>
                      <textarea
                        rows={3}
                        value={topic.content}
                        onChange={(e) => {
                          const newTopics = [...moduleForm.topics];
                          newTopics[tIdx].content = e.target.value;
                          setModuleForm({ ...moduleForm, topics: newTopics });
                        }}
                        placeholder="Explain concepts, syntax rules, code examples..."
                      />
                    </div>

                    {/* Questions inside this topic */}
                    <div className="topic-q-section">
                      <div className="topic-q-header">
                        <h5>Practice MCQs ({topic.questions?.length || 0})</h5>
                        <button
                          type="button"
                          className="ca-btn-link"
                          onClick={() => handleAddQuestionToTopic(tIdx)}
                        >
                          <Plus size={13} /> Add MCQ
                        </button>
                      </div>

                      {(topic.questions || []).map((q, qIdx) => (
                        <div key={q.id || qIdx} className="studio-q-box">
                          <div className="studio-q-head">
                            <span>Question #{qIdx + 1}</span>
                            <button
                              type="button"
                              className="ca-btn-del-sm"
                              onClick={() => handleRemoveQuestionFromTopic(tIdx, qIdx)}
                            >
                              <X size={13} />
                            </button>
                          </div>

                          <input
                            type="text"
                            className="studio-q-input"
                            value={q.question}
                            onChange={(e) => {
                              const newTopics = [...moduleForm.topics];
                              newTopics[tIdx].questions[qIdx].question = e.target.value;
                              setModuleForm({ ...moduleForm, topics: newTopics });
                            }}
                            placeholder="Enter MCQ prompt..."
                          />

                          <div className="studio-opts-grid">
                            {(q.options || []).map((opt, oIdx) => (
                              <div key={oIdx} className="studio-opt-row">
                                <input
                                  type="radio"
                                  name={`correct_${tIdx}_${qIdx}`}
                                  checked={q.answer === oIdx}
                                  onChange={() => {
                                    const newTopics = [...moduleForm.topics];
                                    newTopics[tIdx].questions[qIdx].answer = oIdx;
                                    setModuleForm({ ...moduleForm, topics: newTopics });
                                  }}
                                  title="Mark as correct answer"
                                />
                                <span className="opt-lbl">{String.fromCharCode(65 + oIdx)}:</span>
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) => {
                                    const newTopics = [...moduleForm.topics];
                                    newTopics[tIdx].questions[qIdx].options[oIdx] = e.target.value;
                                    setModuleForm({ ...moduleForm, topics: newTopics });
                                  }}
                                  placeholder={`Option ${String.fromCharCode(65 + oIdx)}`}
                                />
                              </div>
                            ))}
                          </div>

                          <input
                            type="text"
                            className="studio-exp-input"
                            value={q.explanation || ''}
                            onChange={(e) => {
                              const newTopics = [...moduleForm.topics];
                              newTopics[tIdx].questions[qIdx].explanation = e.target.value;
                              setModuleForm({ ...moduleForm, topics: newTopics });
                            }}
                            placeholder="Explanation shown after student answers..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Publish Toggle & Save Buttons */}
              <div className="ca-modal-footer">
                <label className="studio-pub-checkbox">
                  <input
                    type="checkbox"
                    checked={moduleForm.isPublished}
                    onChange={(e) => setModuleForm({ ...moduleForm, isPublished: e.target.checked })}
                  />
                  <span>Publish immediately to student cohort</span>
                </label>
                <div className="ca-modal-footer-btns">
                  <button
                    type="button"
                    className="ca-btn-secondary"
                    onClick={() => setIsModuleModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="ca-btn-primary">
                    <Check size={16} /> <span>{editingModuleId ? 'Update Module' : 'Save Module'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Real-Time Friends & Faculty Lounge Drawer ─────────── */}
      <FriendsDrawer
        open={friendsDrawerOpen}
        onClose={() => setFriendsDrawerOpen(false)}
        onUnread={() => {}}
      />
    </div>
  );
};

export default CollegeAdmin;
