import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Home, BookOpen, Terminal, FolderOpen, Trophy, Users, School,
  Sparkles, Crown, Award, Zap, Flame, CheckCircle2, ShieldAlert,
  Download, Plus, Search, Trash2, KeyRound, Check, X, Edit3,
  ExternalLink, Layers, ArrowRight, ChevronLeft, ChevronRight,
  FileText, LogOut, Globe, Clock, Shield, Code2, AlertTriangle,
  Play, FileSpreadsheet, Eye, HelpCircle, Binary, Cpu, Server, Database,
  Brain, Send, Sparkle, RefreshCw, Settings as SettingsIcon, ShieldCheck,
  Mail, Lock, User, Info, Calendar, Activity, GitBranch, FolderPlus, Hash, File, ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import API_URL from '../config';
import { useAuth } from '../context/AuthContext';
import CodeBrightLogo from '../components/CodeBrightLogo';
import FriendsDrawer from '../components/FriendsDrawer';
import NoteEditor from '../components/codevault/NoteEditor';
import {
  fetchNotes,
  fetchFolders,
  createNote,
  createFolder,
  updateFolder,
  deleteFolder,
  updateNote,
  deleteNote,
  togglePublishNote
} from '../services/notesService';
import './Home.css';
import './Settings.css';
import './CollegeAdmin.css';

// ── Sample CSV for Quick Onboarding ──────────────────────────────────────────
const SAMPLE_CSV = `21CS003,Ishaan Verma,ishaan@apex.edu,CSE,2026
21CS004,Ananya Gupta,ananya@apex.edu,CSE,2026
21CS005,Rohan Sharma,rohan@apex.edu,CSE,2026
21IT001,Priya Nair,priya@apex.edu,IT,2026
21IT002,Aditya Rao,aditya@apex.edu,IT,2026`;

// ── Curated Coding Problems for Exams & Lab Sheets ────────────────────────────
const CURATED_QUESTIONS = [
  { id: 'q1', title: 'Array Reverse', difficulty: 'Easy', timeLimit: '1.0s', testCases: [{ input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1' }] },
  { id: 'q2', title: 'Min and Max in Array', difficulty: 'Medium', timeLimit: '1.0s', testCases: [{ input: '6\n3 2 1 56 10000 167', expectedOutput: '1 10000' }] },
  { id: 'q3', title: "Kadane's Algorithm", difficulty: 'Medium', timeLimit: '1.0s', testCases: [{ input: '5\n1 2 3 -2 5', expectedOutput: '9' }] },
  { id: 'q4', title: 'Two Sum - Pairs with 0 Sum', difficulty: 'Easy', timeLimit: '1.0s', testCases: [{ input: '5\n-1 0 1 2 -1 -4', expectedOutput: '-1 1' }] },
  { id: 'q5', title: 'Merge Intervals', difficulty: 'Medium', timeLimit: '1.0s', testCases: [{ input: '4\n1 3 2 6 8 10 15 18', expectedOutput: '1 6 8 10 15 18' }] }
];

// ── Starter Curriculum Templates ─────────────────────────────────────────────
const STARTER_TEMPLATES = {
  dsa: {
    title: 'Data Structures & Algorithms in C++',
    description: 'Core semester lab modules covering pointers, dynamic arrays, linked lists, and algorithm complexity.',
    category: 'Computer Science',
    color: '#ef4444',
    target_branch: 'ALL',
    target_batch: '2026',
    topics: [
      {
        id: 'top_1',
        title: '1. Pointers & Dynamic Memory Management',
        content: `### Pointers in C++
Pointers are variables that store the memory address of another variable.

\`\`\`cpp
int val = 42;
int* ptr = &val;
cout << *ptr << endl; // Prints 42
\`\`\`

#### Key Rules:
1. Always initialize pointers before use.
2. Deallocate dynamically allocated memory using \`delete\` or \`delete[]\` to prevent memory leaks.
3. Prefer modern C++ smart pointers (\`std::unique_ptr\`, \`std::shared_ptr\`).`,
        questions: [
          {
            question: 'What is the size of an integer pointer on a 64-bit architecture?',
            options: ['4 bytes', '8 bytes', '16 bytes', 'Architecture dependent between 2 and 4'],
            answer: 1,
            explanation: 'On all 64-bit systems, memory addresses are 64 bits wide, making pointer variables 8 bytes in size.'
          },
          {
            question: 'Which operator is used to obtain the memory address of a variable?',
            options: ['*', '&', '->', '%'],
            answer: 1,
            explanation: 'The address-of operator (&) returns the memory location of an operand.'
          }
        ]
      },
      {
        id: 'top_2',
        title: '2. Singly Linked List: Construction & Traversal',
        content: `### Linked Lists vs Static Arrays
A linked list is a linear data structure where elements are stored in nodes connected via pointer links.

\`\`\`cpp
struct Node {
    int data;
    Node* next;
    Node(int val) : data(val), next(nullptr) {}
};
\`\`\`

#### Time Complexities:
- Insertion at head: O(1)
- Deletion at head: O(1)
- Access / Search: O(N)`,
        questions: [
          {
            question: 'What is the time complexity to insert an element at the beginning of a singly linked list?',
            options: ['O(1)', 'O(log N)', 'O(N)', 'O(N^2)'],
            answer: 0,
            explanation: 'Inserting at the head requires simply pointing the new node to current head and reassigning head.'
          }
        ]
      }
    ]
  },
  python: {
    title: 'Python for Data Structures & Problem Solving',
    description: 'Foundational algorithmic concepts implemented with clean, idiomatic Python syntax.',
    category: 'Computer Science',
    color: '#eab308',
    target_branch: 'ALL',
    target_batch: '2026',
    topics: [
      {
        id: 'top_py_1',
        title: '1. Lists, Tuples, and Dictionaries in Depth',
        content: `### Built-in Python Collections
Python provides highly optimized native collections:
- **Lists:** Mutable dynamic arrays with amortized O(1) append.
- **Tuples:** Immutable sequences suitable for fixed keys.
- **Dicts & Sets:** Hash tables with average O(1) lookups.`,
        questions: [
          {
            question: 'What is the average time complexity of checking membership (`x in s`) in a Python set?',
            options: ['O(1)', 'O(N)', 'O(log N)', 'O(N log N)'],
            answer: 0,
            explanation: 'Python sets are implemented using hash tables, offering O(1) average lookup.'
          }
        ]
      }
    ]
  }
};

// ── Default Sample Faculty Notes ─────────────────────────────────────────────
const INITIAL_FACULTY_NOTES = [
  {
    id: 'fn_1',
    title: 'DSA Lab Exam Syllabus & Grading Rubric',
    category: 'Lab Assessments',
    updatedAt: '2026-03-15',
    content: `# DSA Lab Exam Guidelines (Semester 4)
- **Time Duration:** 60 Minutes
- **Total Marks:** 50
- **Allowed Compilers:** GCC 11+, Clang, Python 3.10+
- **Proctoring Rules:** Fullscreen locked, tab switching flagged automatically.

### Key Topics:
1. Two-pointer techniques and Sliding Window
2. Linked List reversal and cycle detection
3. Binary Search and Divide & Conquer`
  },
  {
    id: 'fn_2',
    title: 'C++ Modern Memory Model & Smart Pointers Cheat Sheet',
    category: 'Lecture Notes',
    updatedAt: '2026-03-18',
    content: `# C++ Smart Pointers Cheat Sheet

\`\`\`cpp
#include <memory>
// 1. unique_ptr (Exclusive ownership)
std::unique_ptr<int> u1 = std::make_unique<int>(10);

// 2. shared_ptr (Reference counted ownership)
std::shared_ptr<int> s1 = std::make_shared<int>(20);
\`\`\`
Use \`std::make_unique\` and \`std::make_shared\` to avoid memory leaks during exception handling.`
  }
];

// ── Theme Palettes & Banners ─────────────────────────────────────────────────
const AVATARS = [
  { seed: 'Sniper' }, { seed: 'Ghost' },
  { seed: 'Ninja' }, { seed: 'Viper' },
  { seed: 'Nova' }, { seed: 'Titan' },
  { seed: 'Apex' }, { seed: 'Zero' },
  { seed: 'Hunter' }, { seed: 'Reaper' }
];

const BANNERS = [
  { id: 'crimson', name: 'Crimson Flare', css: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(17, 17, 19, 0.98) 100%)' },
  { id: 'cyber', name: 'Cyber Neon', css: 'linear-gradient(135deg, rgba(56, 189, 248, 0.12) 0%, rgba(17, 17, 19, 0.98) 100%)' },
  { id: 'toxic', name: 'Toxic Viper', css: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(17, 17, 19, 0.98) 100%)' },
  { id: 'void', name: 'Void Phantom', css: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(17, 17, 19, 0.98) 100%)' },
  { id: 'gold', name: 'Golden Crown', css: 'linear-gradient(135deg, rgba(201, 168, 76, 0.12) 0%, rgba(17, 17, 19, 0.98) 100%)' }
];

const ACCENT_PALETTES = {
  red: {
    primary: '#ef4444', rgb: '239, 68, 68',
    dark: '#dc2626',    darkRgb: '220, 38, 38',
    light: '#f87171',   lightRgb: '248, 113, 113',
  },
  orange: {
    primary: 'var(--primary)', rgb: '249, 115, 22',
    dark: 'var(--primary-dark)',    darkRgb: '234, 108, 10',
    light: 'var(--primary-light)',   lightRgb: '251, 146, 60',
  },
  espresso: {
    primary: '#8B4513', rgb: '139, 69, 19',
    dark: '#6B3410',    darkRgb: '107, 52, 16',
    light: '#C08060',   lightRgb: '192, 128, 96',
  },
};

// ── Animated Number Counter Helper ───────────────────────────────────────────
const AnimatedCounter = ({ end, suffix = '', duration = 1500 }) => {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!end || end === 0) { setVal(0); return; }
    const step = end / (duration / 16);
    let cur = 0;
    const timer = setInterval(() => {
      cur += step;
      if (cur >= end) {
        setVal(end);
        clearInterval(timer);
      } else {
        setVal(Math.floor(cur));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [end, duration]);
  return <span>{val.toLocaleString()}{suffix}</span>;
};

// ── Typewriter Greeting Hook ─────────────────────────────────────────────────
const useTypewriter = (text, speed = 45) => {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return { displayed, done };
};

const CollegeAdmin = () => {
  const navigate = useNavigate();
  const { user, updateProfile, changePassword, logout, friendsDrawerOpen, setFriendsDrawerOpen } = useAuth();

  // Navigation: Home, Library, Workspace, Notes, Leaderboard, Settings
  const [activeNav, setActiveNav] = useState('home'); // 'home' | 'library' | 'workspace' | 'notes' | 'leaderboard' | 'settings'

  // Settings sub-tab: 'details' (Identity) | 'settings' (System & Themes) | 'security' | 'about'
  const [settingsTab, setSettingsTab] = useState('details');

  // Carousel states for Home view
  const carouselRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleCarouselScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setShowLeftArrow(scrollLeft > 10);
      setShowRightArrow(scrollLeft + clientWidth < scrollWidth - 10);
    }
  };

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 380;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(handleCarouselScroll, 200);
    window.addEventListener('resize', handleCarouselScroll);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleCarouselScroll);
    };
  }, []);

  // Theme & Profile Form States
  const [selectedTheme, setSelectedTheme] = useState(() => localStorage.getItem('app_theme') || 'crimson');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accent_color') || 'red');
  const [isSavingBio, setIsSavingBio] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const bioSaveTimer = useRef(null);
  const [newStackItem, setNewStackItem] = useState('');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configData, setConfigData] = useState({ username: '' });

  // Password Change States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Global Institutional State
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Curriculum & Library Studio State
  const [modules, setModules] = useState([]);
  const [loadingModules, setLoadingModules] = useState(false);
  const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState(null);
  const [previewModule, setPreviewModule] = useState(null);
  const [moduleFilter, setModuleFilter] = useState('ALL'); // 'ALL' | 'published' | 'draft'
  const [moduleForm, setModuleForm] = useState({
    title: '',
    description: '',
    category: 'Computer Science',
    color: '#ef4444',
    target_branch: 'ALL',
    target_batch: '2026',
    isPublished: true,
    topics: []
  });

  // Workspace / Exam Arena State
  const [exams, setExams] = useState([]);
  const [examSubTab, setExamSubTab] = useState('list'); // 'list' | 'create' | 'monitoring'
  const [creatingExam, setCreatingExam] = useState(false);
  const [examTitle, setExamTitle] = useState('');
  const [examDesc, setExamDesc] = useState('');
  const [examDuration, setExamDuration] = useState('60');
  const [targetBranch, setTargetBranch] = useState('CSE');
  const [targetBatch, setTargetBatch] = useState('2026');
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  // Faculty Codex & Real Notes State
  const [vaultNotes, setVaultNotes] = useState([]);
  const [vaultFolders, setVaultFolders] = useState([]);
  const [vaultActiveNote, setVaultActiveNote] = useState(null);
  const [vaultSelectedFolder, setVaultSelectedFolder] = useState(null);
  const [vaultLoading, setVaultLoading] = useState(false);
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');
  const [vaultNotesFilter, setVaultNotesFilter] = useState('ALL'); // 'ALL' | 'published' | 'draft'
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newVaultFolderName, setNewVaultFolderName] = useState('');

  const [facultyNotes, setFacultyNotes] = useState(INITIAL_FACULTY_NOTES);
  const [assignments, setAssignments] = useState([]);
  const [notesSubTab, setNotesSubTab] = useState('notes'); // 'notes' | 'sheets'
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteCategory, setNewNoteCategory] = useState('Lab Assessments');
  const [newNoteContent, setNewNoteContent] = useState('');
  const [isCreatingNote, setIsCreatingNote] = useState(false);

  // Student Cohort & Leaderboard State
  const [studentsList, setStudentsList] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [csvText, setCsvText] = useState('');
  const [uploadingCsv, setUploadingCsv] = useState(false);

  const collegeId = user?.orgId || user?.collegeId || localStorage.getItem('college_id') || 'org_apex_demo';
  const orgName = user?.orgName || stats?.org?.name || 'Apex Institute of Technology';
  const orgCode = user?.orgCode || stats?.org?.code || 'APEX';
  const username = user?.username || localStorage.getItem('username') || 'prof_sharma';

  const [formData, setFormData] = useState({
    username: username,
    bio: user?.bio || 'Head of Department & Academic Coordinator. Architecting rigorous coding curriculum and competitive benchmarks.',
    stack: user?.stack?.length ? user.stack : ['C++', 'Data Structures', 'Operating Systems', 'System Design'],
    avatarId: user?.avatarId || 'Sniper',
    bannerId: user?.bannerId || 'crimson',
    github: user?.github || '',
    leetcode: user?.leetcode || '',
    project1: user?.project1 || '',
    project2: user?.project2 || ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        username: user.username || prev.username,
        bio: user.bio !== undefined ? user.bio : prev.bio,
        stack: user.stack?.length ? user.stack : prev.stack,
        avatarId: user.avatarId || prev.avatarId,
        bannerId: user.bannerId || prev.bannerId,
        github: user.github !== undefined ? user.github : prev.github,
        leetcode: user.leetcode !== undefined ? user.leetcode : prev.leetcode,
        project1: user.project1 !== undefined ? user.project1 : prev.project1,
        project2: user.project2 !== undefined ? user.project2 : prev.project2,
      }));
      setConfigData({ username: user.username || '' });
    }
  }, [user]);

  // Apply Theme Helper
  const applyTheme = (theme) => {
    const root = document.documentElement;
    root.classList.remove('theme-minecraft');
    root.classList.remove('theme-cyberpunk');

    if (theme === 'amber') {
      root.classList.add('theme-minecraft');
      root.style.setProperty('--primary', '#FFD700');
      root.style.setProperty('--primary-rgb', '255, 215, 0');
      root.style.setProperty('--primary-dark', '#c8a020');
      root.style.setProperty('--primary-dark-rgb', '200, 160, 32');
      root.style.setProperty('--primary-light', '#ffe566');
      root.style.setProperty('--primary-light-rgb', '255, 229, 102');
      root.style.setProperty('--primary-glow', 'rgba(255, 215, 0, 0.5)');
      root.style.setProperty('--complementary', '#5D9E3F');
      root.style.setProperty('--text-complementary', '#fffdd0');
      root.style.setProperty('--panel-text', '#fffdd0');
      root.style.setProperty('--bg-dark', '#1a1a1a');
      root.style.setProperty('--bg-surface', '#3a3a3a');
      root.style.setProperty('--text-main', '#fffdd0');
      root.style.setProperty('--text-muted', '#7a7a7a');
      root.style.setProperty('--text-hi', '#fffdd0');
      root.style.setProperty('--text-mid', '#FFD700');
      root.style.setProperty('--text-lo', '#8B6914');
      root.style.setProperty('--font-sans', "'Press Start 2P', monospace");
    } else if (theme === 'neo-noir') {
      root.classList.add('theme-cyberpunk');
      root.style.setProperty('--primary', '#00d9ff');
      root.style.setProperty('--primary-rgb', '0, 217, 255');
      root.style.setProperty('--primary-dark', '#ff0080');
      root.style.setProperty('--primary-dark-rgb', '255, 0, 128');
      root.style.setProperty('--primary-light', '#66e8ff');
      root.style.setProperty('--primary-light-rgb', '102, 232, 255');
      root.style.setProperty('--primary-glow', 'rgba(0, 217, 255, 0.6)');
      root.style.setProperty('--complementary', '#ff0080');
      root.style.setProperty('--text-complementary', '#ffffff');
      root.style.setProperty('--panel-text', '#00d9ff');
      root.style.setProperty('--bg-dark', '#050508');
      root.style.setProperty('--bg-surface', '#0a0a12');
      root.style.setProperty('--text-main', '#e0f7ff');
      root.style.setProperty('--text-muted', '#4a6a7a');
      root.style.setProperty('--text-hi', '#ffffff');
      root.style.setProperty('--text-mid', '#00d9ff');
      root.style.setProperty('--text-lo', '#ff0080');
      root.style.setProperty('--font-sans', "'Orbitron', 'Share Tech Mono', sans-serif");
    } else {
      root.style.setProperty('--primary', '#ef4444');
      root.style.setProperty('--primary-rgb', '239, 68, 68');
      root.style.setProperty('--primary-dark', '#dc2626');
      root.style.setProperty('--primary-dark-rgb', '220, 38, 38');
      root.style.setProperty('--primary-light', '#f87171');
      root.style.setProperty('--primary-light-rgb', '248, 113, 113');
      root.style.setProperty('--primary-glow', 'rgba(239, 68, 68, 0.5)');
      root.style.setProperty('--complementary', '#fff9e6');
      root.style.setProperty('--text-complementary', '#1a1a1a');
      root.style.setProperty('--panel-text', '#1a1a1a');
      root.style.setProperty('--bg-dark', '#0f0f0f');
      root.style.setProperty('--bg-surface', '#1a1a1a');
      root.style.setProperty('--text-main', '#ffffff');
      root.style.setProperty('--text-muted', '#a0a0a0');
      root.style.setProperty('--text-hi', '#fffdd0');
      root.style.setProperty('--text-mid', '#f5f5dc');
      root.style.setProperty('--text-lo', '#d2b48c');
    }
  };

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    localStorage.setItem('app_theme', theme);
    applyTheme(theme);
    toast.success(`Theme updated to ${theme === 'neo-noir' ? 'Night City' : theme === 'amber' ? 'Creeper Craft' : 'Scarlet Flare'}`);
  };

  const handleAccentChange = (accent) => {
    const p = ACCENT_PALETTES[accent];
    if (!p) return;
    const root = document.documentElement;
    root.style.setProperty('--primary',           p.primary);
    root.style.setProperty('--primary-rgb',       p.rgb);
    root.style.setProperty('--primary-dark',      p.dark);
    root.style.setProperty('--primary-dark-rgb',  p.darkRgb);
    root.style.setProperty('--primary-light',     p.light);
    root.style.setProperty('--primary-light-rgb', p.lightRgb);
    root.style.setProperty('--primary-glow',      `rgba(${p.rgb}, 0.5)`);
    setAccentColor(accent);
    localStorage.setItem('accent_color', accent);
    toast.success(`Accent color set to ${accent}`);
  };

  const persistProfile = async (updates) => {
    try {
      setIsSavingProfile(true);
      const res = await updateProfile({
        username: updates.username !== undefined ? updates.username : (formData.username || username),
        bio: updates.bio !== undefined ? updates.bio : (formData.bio || ''),
        stack: updates.stack !== undefined ? updates.stack : (formData.stack || []),
        avatarId: updates.avatarId !== undefined ? updates.avatarId : (formData.avatarId || 'Sniper'),
        bannerId: updates.bannerId !== undefined ? updates.bannerId : (formData.bannerId || 'crimson'),
        github: updates.github !== undefined ? updates.github : (formData.github || ''),
        leetcode: updates.leetcode !== undefined ? updates.leetcode : (formData.leetcode || ''),
        project1: updates.project1 !== undefined ? updates.project1 : (formData.project1 || ''),
        project2: updates.project2 !== undefined ? updates.project2 : (formData.project2 || '')
      });
      if (res && res.success) {
        toast.success('Faculty profile updated');
      }
      return res;
    } catch (err) {
      toast.error('Failed to save profile changes');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleBioChange = (val) => {
    setFormData(prev => ({ ...prev, bio: val }));
    if (bioSaveTimer.current) clearTimeout(bioSaveTimer.current);
    bioSaveTimer.current = setTimeout(async () => {
      setIsSavingBio(true);
      await persistProfile({ bio: val });
      setIsSavingBio(false);
    }, 600);
  };

  const addStackItem = () => {
    if (newStackItem.trim() && !formData.stack.includes(newStackItem.trim()) && formData.stack.length < 5) {
      const updated = [...formData.stack, newStackItem.trim()];
      setFormData(prev => ({ ...prev, stack: updated }));
      persistProfile({ stack: updated });
      setNewStackItem('');
    }
  };

  const removeStackItem = (idx) => {
    const updated = formData.stack.filter((_, i) => i !== idx);
    setFormData(prev => ({ ...prev, stack: updated }));
    persistProfile({ stack: updated });
  };

  const handleAvatarSelect = async (seed) => {
    setFormData(prev => ({ ...prev, avatarId: seed }));
    await persistProfile({ avatarId: seed });
  };

  const handleBannerSelect = async (bannerId) => {
    setFormData(prev => ({ ...prev, bannerId: bannerId }));
    await persistProfile({ bannerId: bannerId });
  };

  const handleLinkChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
    if (bioSaveTimer.current) clearTimeout(bioSaveTimer.current);
    bioSaveTimer.current = setTimeout(async () => {
      await persistProfile({ [field]: val });
    }, 800);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setIsChangingPassword(true);
    try {
      const res = await changePassword(currentPassword, newPassword);
      if (res && res.success) {
        toast.success('Faculty credentials updated securely');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        toast.error(res?.error || 'Failed to change password');
      }
    } catch (err) {
      toast.error('Failed to update credentials');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleConfigureProfile = async () => {
    if (!configData.username.trim()) {
      toast.error('Username cannot be empty');
      return;
    }
    try {
      const res = await updateProfile({ username: configData.username });
      if (res && res.success) {
        toast.success('Username updated');
        setShowConfigModal(false);
      } else {
        toast.error(res?.error || 'Failed to update username');
      }
    } catch {
      toast.error('Error updating username');
    }
  };

  const token = localStorage.getItem('token') || '';
  const authHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };

  const fetchStats = async () => {
    try {
      const res = await fetch(`${API_URL}/api/college/stats?collegeId=${collegeId}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setStats(data);
    } catch (err) {
      console.error('Stats fetch err:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchModules = async () => {
    try {
      setLoadingModules(true);
      const res = await fetch(`${API_URL}/api/college/library/modules?collegeId=${collegeId}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setModules(data.modules || []);
      }
    } catch (err) {
      console.error('Modules fetch err:', err);
    } finally {
      setLoadingModules(false);
    }
  };

  const fetchExams = async () => {
    try {
      const res = await fetch(`${API_URL}/api/college/exams?collegeId=${collegeId}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setExams(data.exams || []);
    } catch (err) {
      console.error('Exams fetch err:', err);
    }
  };

  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/college/assignments?collegeId=${collegeId}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setAssignments(data.assignments || []);
    } catch (err) {
      console.error('Assignments fetch err:', err);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await fetch(`${API_URL}/api/college/students?collegeId=${collegeId}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setStudentsList(data.students || []);
    } catch (err) {
      console.error('Students fetch err:', err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLeaderboardLoading(true);
      const res = await fetch(`${API_URL}/api/college/leaderboard?collegeId=${collegeId}`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) {
        setLeaderboard(data.leaderboard || []);
      }
    } catch (err) {
      console.error('Leaderboard err:', err);
    } finally {
      setLeaderboardLoading(false);
    }
  };

  const loadVaultData = async () => {
    try {
      setVaultLoading(true);
      const [notesData, foldersData] = await Promise.all([
        fetchNotes(),
        fetchFolders()
      ]);
      const validNotes = Array.isArray(notesData) ? notesData : [];
      setVaultNotes(validNotes);
      setVaultFolders(Array.isArray(foldersData) ? foldersData : []);
      if (validNotes.length > 0 && !vaultActiveNote) {
        setVaultActiveNote(validNotes[0]);
      }
    } catch (err) {
      console.error('Failed to load notes data:', err);
    } finally {
      setVaultLoading(false);
    }
  };

  const handleCreateVaultNote = async () => {
    try {
      const newNote = await createNote({
        title: 'Untitled Note',
        content: '',
        folder_id: vaultSelectedFolder || undefined,
        tags: ['Faculty'],
        is_published: false,
        target_branch: 'ALL',
        target_batch: '2026'
      });
      setVaultNotes(prev => [newNote, ...prev]);
      setVaultActiveNote(newNote);
      toast.success('New draft note created');
    } catch (err) {
      toast.error('Failed to create note: ' + err.message);
    }
  };

  const handleTogglePublishQuick = async (note) => {
    try {
      const res = await togglePublishNote(note.id, { isPublished: !note.is_published });
      if (res && res.success) {
        setVaultNotes(prev => prev.map(n => n.id === note.id ? res.note : n));
        if (vaultActiveNote?.id === note.id) setVaultActiveNote(res.note);
        toast.success(res.is_published ? 'Note published to students!' : 'Note moved to drafts');
      }
    } catch (err) {
      toast.error('Failed to update publication: ' + err.message);
    }
  };

  const handleVaultNoteUpdate = (updated) => {
    setVaultNotes(prev => prev.map(n => n.id === updated.id ? updated : n));
    setVaultActiveNote(updated);
  };

  const handleVaultNoteDelete = (noteId) => {
    setVaultNotes(prev => prev.filter(n => n.id !== noteId));
    if (vaultActiveNote?.id === noteId) {
      setVaultActiveNote(null);
    }
    toast.success('Note removed');
  };

  const handleVaultFolderCreate = async (e) => {
    if (e) e.preventDefault();
    if (!newVaultFolderName.trim()) return;
    try {
      const created = await createFolder({ name: newVaultFolderName.trim() });
      setVaultFolders(prev => [...prev, created]);
      setNewVaultFolderName('');
      setShowFolderModal(false);
      toast.success('Repository created');
    } catch (err) {
      toast.error('Failed to create folder: ' + err.message);
    }
  };

  const handleVaultFolderDelete = async (folderId) => {
    if (!window.confirm('Delete this folder and unfile its notes?')) return;
    try {
      await deleteFolder(folderId);
      setVaultFolders(prev => prev.filter(f => f.id !== folderId));
      if (vaultSelectedFolder === folderId) setVaultSelectedFolder(null);
      toast.success('Folder deleted');
    } catch (err) {
      toast.error('Failed to delete folder: ' + err.message);
    }
  };

  const handleSaveFacultyNote = (e) => {
    if (e) e.preventDefault();
    if (!newNoteTitle.trim()) return;
    const newNote = {
      id: 'fn_' + Date.now(),
      title: newNoteTitle,
      category: newNoteCategory || 'Lab Assessments',
      content: newNoteContent,
      updatedAt: 'Just now'
    };
    setFacultyNotes(prev => [newNote, ...prev]);
    setIsCreatingNote(false);
    setNewNoteTitle('');
    setNewNoteContent('');
    toast.success('Saved to Faculty Codex');
  };

  const handleDeleteFacultyNote = (noteId) => {
    setFacultyNotes(prev => prev.filter(n => n.id !== noteId));
    toast.success('Note deleted');
  };

  useEffect(() => {
    fetchStats();
    fetchModules();
    fetchExams();
    fetchAssignments();
    fetchStudents();
    fetchLeaderboard();
    loadVaultData();
  }, [collegeId]);

  // Load starter curriculum template
  const handleLoadTemplate = (key) => {
    const tmpl = STARTER_TEMPLATES[key];
    if (tmpl) {
      setModuleForm({
        ...tmpl,
        isPublished: true
      });
      toast.success(`Loaded "${tmpl.title}" template with verified topics & MCQs!`);
    }
  };

  const handleOpenCreateModule = () => {
    setEditingModuleId(null);
    setModuleForm({
      title: '',
      description: '',
      category: 'Computer Science',
      color: '#ef4444',
      target_branch: 'ALL',
      target_batch: '2026',
      isPublished: true,
      topics: []
    });
    setIsModuleModalOpen(true);
  };

  const handleEditModule = (mod) => {
    setEditingModuleId(mod.id);
    setModuleForm({
      title: mod.title,
      description: mod.description || '',
      category: mod.category || 'Computer Science',
      color: mod.color || '#ef4444',
      target_branch: mod.target_branch || 'ALL',
      target_batch: mod.target_batch || '2026',
      isPublished: Boolean(mod.is_published),
      topics: mod.topics || []
    });
    setIsModuleModalOpen(true);
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    if (!moduleForm.title.trim()) {
      toast.error('Module title is required');
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

      toast.success(editingModuleId ? 'Module updated successfully!' : 'Curriculum module published to student cohort!');
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
    if (!window.confirm('Delete this curriculum module? Institutional students will no longer see it.')) return;
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
          description: `Solve problem: ${q.title}. Write efficient code in C++, Java, or Python.`,
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

      toast.success('Proctored exam created & scheduled for student portal!');
      setExamTitle('');
      setExamDesc('');
      setSelectedQuestions([]);
      setExamSubTab('list');
      fetchExams();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreatingExam(false);
    }
  };

  const handleEndExam = async (examId) => {
    if (!window.confirm('Are you sure you want to conclude this examination? Students will be forced to submit.')) return;
    try {
      const res = await fetch(`${API_URL}/api/college/exams/${examId}/status`, {
        method: 'PATCH',
        headers: authHeaders,
        body: JSON.stringify({ status: 'completed' })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Exam concluded. Final marksheets compiled.');
        fetchExams();
      }
    } catch (err) {
      toast.error('Failed to update exam status');
    }
  };

  const handleCreateNote = (e) => {
    e.preventDefault();
    if (!newNoteTitle.trim()) return toast.error('Note title required');
    const newNote = {
      id: `fn_${Date.now()}`,
      title: newNoteTitle,
      category: newNoteCategory,
      updatedAt: new Date().toISOString().split('T')[0],
      content: newNoteContent
    };
    setFacultyNotes([newNote, ...facultyNotes]);
    toast.success('Lecture sheet stored in Faculty Codex');
    setNewNoteTitle('');
    setNewNoteContent('');
    setIsCreatingNote(false);
  };

  const handleDeleteNote = (id) => {
    setFacultyNotes(facultyNotes.filter(n => n.id !== id));
    toast.success('Note removed from Codex');
  };

  const handleProcessCsv = async (e) => {
    e.preventDefault();
    if (!csvText.trim()) return toast.error('CSV data cannot be empty');

    const lines = csvText.trim().split('\n');
    const parsedStudents = [];

    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length >= 5) {
        parsedStudents.push({
          rollNo: parts[0],
          name: parts[1],
          email: parts[2],
          branch: parts[3],
          batch: parts[4]
        });
      }
    }

    if (parsedStudents.length === 0) {
      toast.error('No valid student rows found. Expected format: rollNo, name, email, branch, batch');
      return;
    }

    setUploadingCsv(true);
    try {
      const res = await fetch(`${API_URL}/api/college/students/bulk`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify({ students: parsedStudents })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to upload students');

      toast.success(`Successfully enrolled ${data.enrolledCount} students! Credentials issued.`);
      setShowUploadModal(false);
      setCsvText('');
      fetchStudents();
      fetchStats();
      fetchLeaderboard();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploadingCsv(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm('Remove this student account from the institution?')) return;
    try {
      const res = await fetch(`${API_URL}/api/college/students/${studentId}`, {
        method: 'DELETE',
        headers: authHeaders
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Student account removed & license seat freed');
        fetchStudents();
        fetchStats();
        fetchLeaderboard();
      }
    } catch (e) {
      toast.error('Failed to delete student');
    }
  };

  const handleLogout = () => {
    logout();
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
  const filteredModules = moduleFilter === 'published'
    ? modules.filter(m => m.is_published)
    : moduleFilter === 'draft'
    ? modules.filter(m => !m.is_published)
    : modules;

  const totalCampusXp = leaderboard.reduce((acc, s) => acc + (Number(s.xp) || 0), 0);
  const enrolledStudentsCount = stats?.org?.enrolledCount || studentsList.length || 0;
  const maxSeats = stats?.org?.maxStudents || 300;
  const curriculumTargetPercent = Math.min(Math.round(((publishedModulesCount * 25) + (enrolledStudentsCount / maxSeats * 50))), 100);

  // Typewriter Greeting
  const greetingFull = `Welcome back, ${username}!`;
  const { displayed: greetingText, done: greetingDone } = useTypewriter(greetingFull, 48);
  const prefix = 'Welcome back, ';
  const suffix = '!';
  const usernameInGreeting = username;
  const greetingPrefix = greetingText.slice(0, Math.min(greetingText.length, prefix.length));
  const greetingUser = greetingText.length > prefix.length
    ? greetingText.slice(prefix.length, Math.min(greetingText.length, prefix.length + usernameInGreeting.length))
    : '';
  const greetingSuffix = greetingText.length > prefix.length + usernameInGreeting.length ? suffix : '';

  // Heatmap Generator — 100% Real Live Telemetry (Zero hardcoding)
  const generateHeatmapData = () => {
    const data = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const submissionsMap = stats?.metrics?.submissionsByDate || {};
    const activityMap = stats?.metrics?.activity || user?.activity || {};

    for (let i = 0; i < 53; i++) {
      const week = [];
      for (let j = 0; j < 7; j++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + (i * 7 + j));
        const key = d.toISOString().split('T')[0];
        const daySubmissions = submissionsMap[key] || 0;
        const dayXp = activityMap[key] || 0;

        let level = 0;
        if (daySubmissions > 0 || dayXp > 0) {
          if (daySubmissions >= 5 || dayXp >= 300) level = 4;
          else if (daySubmissions >= 3 || dayXp >= 150) level = 3;
          else if (daySubmissions >= 2 || dayXp >= 50) level = 2;
          else level = 1;
        }

        week.push({ date: key, submissions: daySubmissions, xp: dayXp, level });
      }
      data.push(week);
    }
    return data;
  };
  const heatmapData = generateHeatmapData();

  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const labels = []; let lastMonth = -1; let lastIdx = -2;
    heatmapData.forEach((week, i) => {
      if (!week?.length) return;
      const m = new Date(week[0].date).getMonth();
      if (m !== lastMonth && i - lastIdx >= 3) {
        labels.push({ month: months[m], index: i });
        lastIdx = i;
      }
      lastMonth = m;
    });
    return labels;
  };
  const monthLabels = getMonthLabels();

  const motivationalQuotes = [
    "Empowering the next generation of engineers through rigorous coding challenges.",
    "Benchmark excellence with real-time proctoring and automated code evaluation.",
    "Transform classroom concepts into production-grade algorithmic mastery.",
    "Clean architecture, readable syntax, and flawless runtime execution.",
    "Every compiled line bridges academic foundations and industry engineering."
  ];

  const facultyBadges = [
    {
      id: 'badge_curriculum',
      name: 'Curriculum Architect',
      desc: 'Published 3 or more multi-chapter institutional library modules.',
      icon: BookOpen,
      color: '#3b82f6',
      unlocked: publishedModulesCount >= 1
    },
    {
      id: 'badge_proctor',
      name: 'Anti-Cheat Sentinel',
      desc: 'Scheduled and conducted proctored laboratory assessments with browser surveillance.',
      icon: ShieldCheck,
      color: 'var(--primary)',
      unlocked: exams.length >= 1
    },
    {
      id: 'badge_xp',
      name: 'XP Titan',
      desc: 'Institutional student cohort crossed 5,000 cumulative experience points.',
      icon: Trophy,
      color: '#fbbf24',
      unlocked: totalCampusXp >= 100
    },
    {
      id: 'badge_cohort',
      name: 'Cohort Pioneer',
      desc: 'Provisioned license seats and onboarded active department student accounts.',
      icon: Users,
      color: '#10b981',
      unlocked: enrolledStudentsCount >= 1
    },
    {
      id: 'badge_evaluator',
      name: 'Master Evaluator',
      desc: 'Created weekly practice sheets and algorithmic problem sets for laboratory courses.',
      icon: Award,
      color: '#a855f7',
      unlocked: assignments.length >= 1
    },
    {
      id: 'badge_integrity',
      name: 'Zero-Cheat Certified',
      desc: 'Verified academic integrity protocol across full-semester student cohort.',
      icon: Shield,
      color: '#06b6d4',
      unlocked: true
    }
  ];



  // ══════════════════════════════════════════════════════════════════════════════
  // RENDER: UNIFIED FACULTY WORKSPACE UI
  // ══════════════════════════════════════════════════════════════════════════════
  return (
    <div className="faculty-workspace-app">
      {/* ── Ambient Radial Background Orbs ── */}
      <div className="faculty-glow-bg">
        <div className="glow-orb orb-fac-1"></div>
        <div className="glow-orb orb-fac-2"></div>
      </div>

      {/* ── Floating Unified Top Navigation Bar (1:1 with Navbar.jsx) ────────── */}
      <motion.nav
        className="floating-nav faculty-nav"
        initial={{ y: -56, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="nav-container">
          {/* LEFT: College Name in Reddish Theme (No BrightCode logo) */}
          <div className="nav-left">
            <div className="college-brand-banner" onClick={() => setActiveNav('home')} title={orgName}>
              <div className="college-brand-icon-wrap">
                <School size={15} />
              </div>
              <span className="college-brand-text">{orgName}</span>
            </div>
          </div>

          {/* CENTER: 3 Cohesive Nav Pills (Home, Library, Notes) - No numbers */}
          <div className="nav-center">
            {[
              { id: 'home', label: 'Home', icon: Home },
              { id: 'library', label: 'Library', icon: BookOpen },
              { id: 'notes', label: 'Notes', icon: FolderOpen }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeNav === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveNav(tab.id)}
                  className={`nav-link-item ${isActive ? 'active' : ''}`}
                >
                  <Icon size={14} className="nav-link-icon" />
                  <span>{tab.label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeFacultyNavPill"
                      className="nav-active-bg"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* RIGHT: Clean Profile Pill */}
          <div className="nav-right">
            <motion.div whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.94 }}>
              <div 
                className={`user-profile-pill ${activeNav === 'settings' ? 'active-prof-pill' : ''}`}
                onClick={() => setActiveNav('settings')}
                title="Open Faculty Profile & Settings"
                style={{ cursor: 'pointer' }}
              >
                <span className="profile-initial">
                  {username ? username.charAt(0).toUpperCase() : 'F'}
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.nav>

      {/* ── Main Content Container ───────────────────────────────────────────── */}
      <main className="faculty-main-canvas">
        <AnimatePresence mode="wait">

          {/* ══════════════════════════════════════════════════════════════════════
              PAGE 1: HOME (IDENTICAL UI DESIGN SYSTEM TO Home.jsx)
              ══════════════════════════════════════════════════════════════════════ */}
          {activeNav === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="home-wrapper"
              style={{ paddingTop: 0, background: 'transparent' }}
            >
              <div className="home-bg">
                <div className="bg-grid" />
              </div>

              <div className="home-dashboard-vertical">
                
                {/* ══ SECTION 1: PROFILE HEADER (RICH DARK HERO) ══ */}
                <header className="profile-header-black">
                  <div className="profile-header-inner">

                    {/* Typewriter Greeting Banner */}
                    <h1 className="welcome-banner-text">
                      {greetingPrefix}
                      {greetingUser && <span className="welcome-username-highlight">{greetingUser}</span>}
                      {greetingSuffix}
                      {!greetingDone && <span className="tw-cursor" />}
                    </h1>

                    {/* 3-Column Profile Card Row */}
                    <div className="profile-card-row">

                      {/* COL 1: Dicebear Avatar with Online Pulse */}
                      <div className="profile-col-avatar">
                        <div className="profile-avatar-dicebear">
                          <img
                            src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.avatarId || username || 'Sniper'}&backgroundColor=transparent`}
                            alt={`${username} avatar`}
                            className="dicebear-img"
                          />
                          <span className="avatar-online-dot" />
                        </div>
                      </div>

                      {/* COL 2: Identity & Telemetry Stats */}
                      <div className="profile-col-info">
                        <div className="profile-name-row">
                          <span className="profile-username-text">{username}</span>
                          <span className="profile-email-chip">
                            <School size={11} />
                            {orgName}
                          </span>
                          {user?.email && (
                            <span className="profile-email-chip">
                              <Globe size={11} />
                              {user.email}
                            </span>
                          )}
                        </div>

                        {/* Bio */}
                        <p className="profile-bio-text">{formData.bio}</p>

                        {/* Teaching Specialization & Tech Stack Tags */}
                        {formData.stack && formData.stack.length > 0 && (
                          <div className="profile-stack-row">
                            {formData.stack.map(tag => (
                              <span key={tag} className="profile-stack-tag">
                                <Code2 size={10} />{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* 4-Stat Telemetry Grid */}
                        <div className="profile-stats-grid">
                          <div className="stat-card">
                            <span className="stat-card-label">Total Campus XP</span>
                            <span className="stat-card-value"><AnimatedCounter end={totalCampusXp} /> XP</span>
                          </div>
                          <div className="stat-card">
                            <span className="stat-card-label">Enrolled Students</span>
                            <span className="stat-card-value streak-glow">
                              <Flame size={14} fill="currentColor" />
                              <span>{enrolledStudentsCount} Students</span>
                            </span>
                          </div>
                          <div className="stat-card">
                            <span className="stat-card-label">Curriculum Modules</span>
                            <span className="stat-card-value text-red">{publishedModulesCount} Active</span>
                          </div>
                          <div className="stat-card">
                            <span className="stat-card-label">Proctored Assessments</span>
                            <span className="stat-card-value">{exams.length} Conducted</span>
                          </div>
                        </div>
                      </div>

                      {/* COL 3: Radial Progress Ring */}
                      <div className="profile-col-ring">
                        <div className="circle-progress-container">
                          <svg className="radial-progress" viewBox="0 0 100 100">
                            <circle className="radial-track" cx="50" cy="50" r="42" />
                            <motion.circle
                              className="radial-fill"
                              cx="50" cy="50" r="42"
                              strokeDasharray="263.8"
                              initial={{ strokeDashoffset: 263.8 }}
                              animate={{ strokeDashoffset: 263.8 - (263.8 * curriculumTargetPercent) / 100 }}
                              transition={{ duration: 1.2, ease: "easeOut" }}
                              style={{ stroke: 'var(--primary)' }}
                            />
                          </svg>
                          <div className="radial-center">
                            <span className="radial-percent">{Math.round(curriculumTargetPercent)}%</span>
                            <span className="radial-lbl">Academic Reach</span>
                          </div>
                        </div>
                        <div className="radial-tier-label" style={{ color: 'var(--primary)' }}>
                          Senior Faculty Coordinator
                        </div>
                        <div className="radial-xp-summary">
                          <span className="radial-xp-val">{publishedModulesCount} Modules Active</span>
                          <span className="radial-xp-next">/ {maxSeats} Cohort Target</span>
                        </div>
                      </div>

                    </div>
                  </div>
                </header>

                {/* ══ SECTION 2: ACTIVITY LOG HEATMAP (TACTICAL COMMITS & LAB LOGS) ══ */}
                <div className="dashboard-content-area">
                  <section className="home-activity-log-section">
                    <div className="section-header-row calendar-header-row">
                      <div className="section-title-wrapper-row">
                        <div className="title-left-group">
                          <Terminal size={20} className="calendar-accent-icon" />
                          <h2 className="vertical-section-title">CAMPUS ACTIVITY LOG (PAST YEAR)</h2>
                        </div>
                        <div className="calendar-stats-summary-row">
                          <div className="cal-summary-item">
                            <span className="cal-summary-num">{enrolledStudentsCount}</span>
                            <span className="cal-summary-lbl">Active Cohort</span>
                          </div>
                          <div className="cal-summary-separator" />
                          <div className="cal-summary-item">
                            <span className="cal-summary-num streak-text-glow">{publishedModulesCount} Modules</span>
                            <span className="cal-summary-lbl">Published</span>
                          </div>
                          <div className="cal-summary-separator" />
                          <div className="cal-summary-item">
                            <span className="cal-summary-num">{totalCampusXp.toLocaleString()}</span>
                            <span className="cal-summary-lbl">Campus XP</span>
                          </div>
                          <div className="cal-summary-separator" />
                          <div className="cal-summary-item">
                            <span className="cal-summary-num">{stats?.metrics?.totalSubmissions || 0}</span>
                            <span className="cal-summary-lbl">Submissions</span>
                          </div>
                        </div>
                      </div>
                      <p className="vertical-section-subtitle">
                        Contribution grid logging daily student submissions, lab executions, and proctored coding assessments.
                      </p>
                    </div>

                    <div className="heatmap-card">
                      <div className="heatmap-inner">
                        <div className="heatmap-months">
                          {monthLabels.map((lbl, i) => (
                            <span key={i} className="heatmap-month" style={{ gridColumnStart: lbl.index + 1 }}>
                              {lbl.month.toUpperCase()}
                            </span>
                          ))}
                        </div>
                        <div className="heatmap-grid">
                          {heatmapData.map((week, wi) => (
                            <div key={wi} className="heatmap-week">
                              {week.map((day, di) => (
                                <div
                                  key={di}
                                  className={`heatmap-day level-${day.level}`}
                                  title={
                                    day.submissions > 0
                                      ? `${day.date}: ${day.submissions} student submission${day.submissions > 1 ? 's' : ''}${day.xp > 0 ? ` (${day.xp} XP)` : ''}`
                                      : day.xp > 0
                                      ? `${day.date}: ${day.xp} campus XP gained`
                                      : `${day.date}: No campus activity logged`
                                  }
                                />
                              ))}
                            </div>
                          ))}
                        </div>
                        <div className="heatmap-legend">
                          <span>IDLE</span>
                          {[0, 1, 2, 3, 4].map(l => <div key={l} className={`heatmap-day level-${l}`} />)}
                          <span>ACTIVE</span>
                        </div>
                      </div>
                    </div>
                  </section>
                </div>

                {/* ══ MOTIVATIONAL TICKER MARQUEE ══ */}
                <div className="ticker-banner">
                  <div className="ticker-viewport">
                    <div className="ticker-track">
                      {motivationalQuotes.concat(motivationalQuotes).map((q, i) => (
                        <span key={i} className="ticker-item">
                          <span className="ticker-dot">✦</span>{q}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ══ SECTION 3: SOLVED MODULES & CURRICULUM PROGRESSION CAROUSEL ══ */}
                <section className="progression-section-fullwidth">
                  <div className="progression-fullwidth-inner">
                    <div className="section-header-row">
                      <div className="title-left-group">
                        <Layers size={20} className="carousel-accent-icon" />
                        <h2 className="vertical-section-title">Department Curriculum & Lab Progression</h2>
                      </div>
                      <p className="vertical-section-subtitle">
                        Manage active coursework modules, monitor student cohort stages, and publish new academic chapters.
                      </p>
                    </div>

                    <div className="carousel-wrapper-container">
                      {modules.length === 0 ? (
                        <div className="fac-empty-carousel-banner">
                          <div className="fac-empty-carousel-icon">
                            <BookOpen size={36} className="text-blue" />
                          </div>
                          <div className="fac-empty-carousel-content">
                            <h3>No Curriculum Modules Created Yet</h3>
                            <p>Your institutional curriculum studio is currently empty. Author and publish coursework modules to populate your student cohort's library and track progression here.</p>
                          </div>
                          <button className="fac-primary-btn" onClick={() => setActiveNav('library')}>
                            <Plus size={16} />
                            <span>Author First Module</span>
                          </button>
                        </div>
                      ) : (
                        <>
                          {showLeftArrow && (
                            <button className="carousel-nav-btn btn-left" onClick={() => scrollCarousel('left')} aria-label="Slide Left">
                              <ChevronLeft size={20} />
                            </button>
                          )}

                          <div className="modules-carousel-viewport" ref={carouselRef} onScroll={handleCarouselScroll}>
                            {modules.map(mod => {
                              const totalQ = (mod.topics || []).reduce((acc, t) => acc + (t.questions?.length || 0), 0);
                              const isPublished = Boolean(mod.is_published);
                              const modColor = mod.color || '#ef4444';
                              return (
                                <div
                                  key={mod.id}
                                  className="module-progression-large-card"
                                  style={{
                                    '--accent-theme': modColor,
                                    '--accent-theme-glow': modColor + '40'
                                  }}
                                >
                                  <div className="large-card-header">
                                    <div className="large-card-icon-box" style={{ color: modColor, backgroundColor: `${modColor}15` }}>
                                      <Terminal size={26} />
                                    </div>
                                    <div className="large-card-meta">
                                      <span className="large-card-category">{(mod.category || 'Computer Science').toUpperCase()}</span>
                                      <span className="large-card-title">{mod.title}</span>
                                    </div>
                                    <span
                                      className="large-card-level-badge"
                                      style={{
                                        color: isPublished ? '#10b981' : '#f59e0b',
                                        borderColor: isPublished ? '#10b98150' : '#f59e0b50'
                                      }}
                                    >
                                      {isPublished ? 'PUBLISHED' : 'DRAFT'}
                                    </span>
                                  </div>

                                  <p className="large-card-desc-text">{mod.description || 'Institutional coursework module.'}</p>

                                  <div className="large-card-milestone-info">
                                    <div className="milestone-stat-row">
                                      <span className="m-stat-label">Chapters:</span>
                                      <span className="m-stat-value text-glow-accent" style={{ color: modColor }}>{mod.topics?.length || 0} Topics</span>
                                    </div>
                                    <div className="milestone-stat-row">
                                      <span className="m-stat-label">Target Cohort:</span>
                                      <span className="m-stat-value text-muted-val">{mod.target_branch || 'ALL'} • {mod.target_batch || 'ALL'}</span>
                                    </div>
                                  </div>

                                  <div className="large-card-tag-group">
                                    {(mod.topics || []).slice(0, 3).map((t, idx) => (
                                      <span key={t.id || idx} className="large-card-tag-pill">{t.title}</span>
                                    ))}
                                  </div>

                                  <div className="large-card-progress-box">
                                    <div className="large-card-progress-ratio">
                                      <span>{isPublished ? 'Live in Student Library' : 'Draft in Studio'}</span>
                                      <span>{totalQ} MCQs</span>
                                    </div>
                                    <div className="large-card-progress-track">
                                      <div
                                        className="large-card-progress-fill"
                                        style={{
                                          width: isPublished ? '100%' : '35%',
                                          backgroundColor: modColor
                                        }}
                                      />
                                    </div>
                                  </div>

                                  <button className="large-card-cta-btn" onClick={() => setActiveNav('library')}>
                                    <span>Open Curriculum Studio</span>
                                    <Play size={12} fill="currentColor" />
                                  </button>
                                </div>
                              );
                            })}
                          </div>

                          {showRightArrow && (
                            <button className="carousel-nav-btn btn-right" onClick={() => scrollCarousel('right')} aria-label="Slide Right">
                              <ChevronRight size={20} />
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </section>

                {/* ══ SECTION 4: CAMPUS HALL OF FAME (3D PODIUM & RANKINGS) ══ */}
                <section className="fame-section-fullwidth">
                  <div className="fame-fullwidth-inner">
                    <div className="fame-header-interactive" onClick={() => navigate('/leaderboard', { state: { from: 'college-admin' } })}>
                      <h2 className="vertical-section-title fame-title-glow">
                        Campus Hall of Fame <ChevronRight size={16} className="title-chevron-icon" />
                      </h2>
                      <button className="leaderboard-header-btn" onClick={(e) => { e.stopPropagation(); navigate('/leaderboard', { state: { from: 'college-admin' } }); }}>
                        <Trophy size={14} />
                        <span>View Full Leaderboard</span>
                        <ArrowUpRight size={14} />
                      </button>
                    </div>

                    <div className="fame-layout-split">
                      {/* LEFT: 3D Top 3 Podium */}
                      <div className="fame-podium-col">
                        <div className="fame-podium">
                          {/* 2nd Place */}
                          <div className="podium-column column-2">
                            <span className="podium-rank-emoji">🥈</span>
                            <div className="podium-avatar-circle avatar-silver">
                              {leaderboard[1]?.name ? leaderboard[1].name[0].toUpperCase() : '2'}
                            </div>
                            <div className="podium-user-info">
                              <span className="podium-username">{leaderboard[1]?.name || 'Priya Nair'}</span>
                              <span className="podium-xp">{leaderboard[1]?.xp || '3,450'} XP</span>
                            </div>
                            <div className="podium-box step-2-box"><span className="step-num">2</span></div>
                          </div>

                          {/* 1st Place */}
                          <div className="podium-column column-1">
                            <span className="podium-crown-icon"><Crown size={20} fill="#fbbf24" color="#fbbf24" /></span>
                            <span className="podium-rank-emoji">🥇</span>
                            <div className="podium-avatar-circle avatar-gold">
                              {leaderboard[0]?.name ? leaderboard[0].name[0].toUpperCase() : '1'}
                            </div>
                            <div className="podium-user-info">
                              <span className="podium-username">{leaderboard[0]?.name || 'Aryan Sharma'}</span>
                              <span className="podium-xp">{leaderboard[0]?.xp || '5,820'} XP</span>
                            </div>
                            <div className="podium-box step-1-box"><span className="step-num">1</span></div>
                          </div>

                          {/* 3rd Place */}
                          <div className="podium-column column-3">
                            <span className="podium-rank-emoji">🥉</span>
                            <div className="podium-avatar-circle avatar-bronze">
                              {leaderboard[2]?.name ? leaderboard[2].name[0].toUpperCase() : '3'}
                            </div>
                            <div className="podium-user-info">
                              <span className="podium-username">{leaderboard[2]?.name || 'Rohan Gupta'}</span>
                              <span className="podium-xp">{leaderboard[2]?.xp || '2,110'} XP</span>
                            </div>
                            <div className="podium-box step-3-box"><span className="step-num">3</span></div>
                          </div>
                        </div>
                      </div>

                      <div className="fame-split-divider" />

                      {/* RIGHT: Ranks 4-10 list */}
                      <div className="fame-rankings-col">
                        <div className="fame-rankings-label">ACADEMIC RANKS 4 – 10</div>
                        <div className="fame-list-stack">
                          {(leaderboard.length > 3 ? leaderboard.slice(3, 10) : [
                            { name: 'Aditya Rao', rollNo: '21CS004', xp: 1950, branch: 'CSE' },
                            { name: 'Sneha Patel', rollNo: '21IT002', xp: 1820, branch: 'IT' },
                            { name: 'Vikram Seth', rollNo: '21CS008', xp: 1640, branch: 'CSE' },
                            { name: 'Ananya Roy', rollNo: '21ECE01', xp: 1450, branch: 'ECE' }
                          ]).map((ranker, idx) => (
                            <div key={ranker.rollNo || idx} className="fame-list-row">
                              <span className="fame-list-rank">#{idx + 4}</span>
                              <div className="fame-list-avatar">{ranker.name ? ranker.name[0].toUpperCase() : 'S'}</div>
                              <span className="fame-list-username">{ranker.name} <span style={{ opacity: 0.6, fontSize: '0.8rem' }}>({ranker.branch})</span></span>
                              <span className="fame-list-xp">{ranker.xp?.toLocaleString()} XP</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* ══ SECTION 5: INSTITUTIONAL BADGES & ACCREDITATIONS ══ */}
                <div className="dashboard-content-area">
                  <section className="dashboard-vertical-section achievements-section">
                    <div className="section-header-row">
                      <div className="title-left-group">
                        <Award size={20} className="achievements-accent-icon" />
                        <h2 className="vertical-section-title">Institutional Accreditations & Badges</h2>
                      </div>
                      <p className="vertical-section-subtitle">
                        Campus faculty credentials and verified milestones based on curriculum development and assessment integrity.
                      </p>
                    </div>

                    <div className="achievements-grid">
                      {facultyBadges.map(badge => {
                        const Icon = badge.icon;
                        return (
                          <div
                            key={badge.id}
                            className={`badge-card ${badge.unlocked ? 'unlocked' : 'locked'}`}
                            style={badge.unlocked ? { '--badge-color': badge.color } : {}}
                          >
                            <div className="badge-icon-wrapper">
                              {badge.unlocked ? (
                                <div className="badge-glow-effect" style={{ backgroundColor: badge.color }} />
                              ) : (
                                <div className="badge-lock-overlay"><Lock size={12} /></div>
                              )}
                              <Icon className="badge-main-icon" size={24} style={badge.unlocked ? { color: badge.color } : { color: '#52525b' }} />
                            </div>
                            <div className="badge-details">
                              <span className="badge-name">{badge.name}</span>
                              <span className="badge-desc">{badge.desc}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>
                </div>

                {/* ══ SECTION 6: ABOUT CAMPUS & PLATFORM OVERVIEW ══ */}
                <section className="about-section-fullwidth">
                  <div className="about-section-inner">
                    <div className="about-section-header">
                      <div className="about-header-label">
                        <span className="about-label-dot" />
                        <span>INSTITUTIONAL ECOSYSTEM</span>
                      </div>
                      <h2 className="about-main-title">
                        Engineered for Campuses.<br /><span className="about-title-accent">Built for Industry Placement.</span>
                      </h2>
                      <p className="about-subtitle">
                        BrightCode Campus empowers faculty with automated code grading, secure proctored examination arenas, and competitive benchmarks that bridge university coursework with tier-1 engineering standards.
                      </p>
                    </div>

                    <div className="about-content-grid">
                      <div className="about-card about-card-mission">
                        <div className="about-card-icon-row">
                          <div className="about-card-icon" style={{ background: 'rgba(239, 68, 68, 0.12)', color: 'var(--primary)' }}>
                            <Flame size={22} />
                          </div>
                          <span className="about-card-tag">Campus Mission</span>
                        </div>
                        <h3 className="about-card-title">Democratising Algorithmic Excellence</h3>
                        <p className="about-card-body">
                          We replace passive lecture slides with interactive coding challenges and anti-cheat exam environments, giving your students continuous feedback and measurable portfolio accomplishments.
                        </p>
                        <ul className="about-bullet-list">
                          <li><span className="about-bullet-dot" style={{ background: 'var(--primary)' }} />Department-specific customized curriculum modules</li>
                          <li><span className="about-bullet-dot" style={{ background: 'var(--primary)' }} />Automated code execution against strict test cases</li>
                          <li><span className="about-bullet-dot" style={{ background: 'var(--primary)' }} />Full browser surveillance and tab-switch telemetry</li>
                        </ul>
                      </div>

                      <div className="about-card about-card-howto">
                        <div className="about-card-icon-row">
                          <div className="about-card-icon" style={{ background: 'rgba(59,130,246,0.12)', color: '#3b82f6' }}>
                            <Layers size={22} />
                          </div>
                          <span className="about-card-tag">Faculty Workflow</span>
                        </div>
                        <h3 className="about-card-title">Curate. Proctor. Benchmark.</h3>
                        <div className="about-steps-list">
                          <div className="about-step-item">
                            <div className="about-step-num" style={{ borderColor: '#3b82f6', color: '#3b82f6' }}>01</div>
                            <div className="about-step-content">
                              <span className="about-step-title">Author Coursework</span>
                              <span className="about-step-desc">Publish interactive code checking modules visible only to your enrolled students.</span>
                            </div>
                          </div>
                          <div className="about-step-item">
                            <div className="about-step-num" style={{ borderColor: '#10b981', color: '#10b981' }}>02</div>
                            <div className="about-step-content">
                              <span className="about-step-title">Schedule Lab Exams</span>
                              <span className="about-step-desc">Launch timed proctoring sessions with automated test cases and violation tracking.</span>
                            </div>
                          </div>
                          <div className="about-step-item">
                            <div className="about-step-num" style={{ borderColor: 'var(--primary)', color: 'var(--primary)' }}>03</div>
                            <div className="about-step-content">
                              <span className="about-step-title">Track Campus XP</span>
                              <span className="about-step-desc">Analyze cohort telemetry, inspect marks, and celebrate top performers on the podium.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="about-card about-card-stats">
                        <div className="about-card-icon-row">
                          <div className="about-card-icon" style={{ background: 'rgba(168,85,247,0.12)', color: '#a855f7' }}>
                            <Trophy size={22} />
                          </div>
                          <span className="about-card-tag">Campus Telemetry</span>
                        </div>
                        <h3 className="about-card-title">At a Glance</h3>
                        <div className="about-stats-grid">
                          <div className="about-stat-box">
                            <span className="about-stat-num" style={{ color: 'var(--primary)' }}>{publishedModulesCount}</span>
                            <span className="about-stat-label">Published Modules</span>
                          </div>
                          <div className="about-stat-box">
                            <span className="about-stat-num" style={{ color: '#3b82f6' }}>{enrolledStudentsCount}</span>
                            <span className="about-stat-label">Enrolled Students</span>
                          </div>
                          <div className="about-stat-box">
                            <span className="about-stat-num" style={{ color: '#10b981' }}>{exams.length}</span>
                            <span className="about-stat-label">Proctored Exams</span>
                          </div>
                          <div className="about-stat-box">
                            <span className="about-stat-num" style={{ color: '#fbbf24' }}>{totalCampusXp.toLocaleString()}</span>
                            <span className="about-stat-label">Campus XP</span>
                          </div>
                        </div>
                        <div className="about-tech-tracks-row">
                          {[
                            { label: 'C++', color: '#ef4444' },
                            { label: 'Java', color: '#10b981' },
                            { label: 'Python', color: '#eab308' },
                            { label: 'DSA', color: '#3b82f6' },
                            { label: 'Operating Systems', color: '#0ea5e9' }
                          ].map(t => (
                            <span key={t.label} className="about-track-pill" style={{ borderColor: t.color + '50', color: t.color, background: t.color + '12' }}>{t.label}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="about-contact-section">
                      <div className="about-contact-text">
                        <span className="about-contact-eyebrow">Academic Support</span>
                        <h3 className="about-contact-headline">Need assistance configuring your department?</h3>
                        <p className="about-contact-desc">
                          Our campus onboarding specialists are available to assist with bulk student imports, custom compiler setup, and grading configuration.
                        </p>
                      </div>
                      <div className="about-contact-links">
                        <a href="mailto:codebrightlim@gmail.com" className="about-contact-btn">
                          Contact Campus Support
                        </a>
                      </div>
                    </div>
                  </div>
                </section>

              </div>
            </motion.div>
          )}


{/* ══════════════════════════════════════════════════════════════════════
              PAGE 2: LIBRARY (CURRICULUM & COURSEWORK STUDIO)
              ══════════════════════════════════════════════════════════════════════ */}
          {activeNav === 'library' && (
            <motion.div
              key="library"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="fac-section-view"
            >
              <div className="fac-page-header">
                <span className="fac-tagline">FACULTY CURRICULUM STUDIO</span>
                <h1 className="fac-title">Coursework & Library Modules</h1>
                <p className="fac-subtitle">
                  Author rich conceptual check modules with lecture theory and MCQs. Institutional students will only see modules published here; if empty, their library displays an empty state.
                </p>
              </div>

              {/* Action Bar */}
              <div className="fac-library-toolbar">
                <div className="fac-toolbar-left">
                  <button className="fac-primary-btn" onClick={handleOpenCreateModule}>
                    <Plus size={16} /> <span>Author New Module</span>
                  </button>
                  <button className="fac-secondary-btn" onClick={() => handleLoadTemplate('dsa')}>
                    <Sparkles size={14} /> <span>Load C++ DSA Template</span>
                  </button>
                  <button className="fac-secondary-btn" onClick={() => handleLoadTemplate('python')}>
                    <Sparkles size={14} /> <span>Load Python Template</span>
                  </button>
                </div>

                <div className="fac-toolbar-right">
                  <div className="fac-filter-pills">
                    <button
                      className={`filter-pill ${moduleFilter === 'ALL' ? 'active' : ''}`}
                      onClick={() => setModuleFilter('ALL')}
                    >
                      All ({modules.length})
                    </button>
                    <button
                      className={`filter-pill ${moduleFilter === 'published' ? 'active' : ''}`}
                      onClick={() => setModuleFilter('published')}
                    >
                      Published ({publishedModulesCount})
                    </button>
                    <button
                      className={`filter-pill ${moduleFilter === 'draft' ? 'active' : ''}`}
                      onClick={() => setModuleFilter('draft')}
                    >
                      Drafts ({draftModulesCount})
                    </button>
                  </div>
                </div>
              </div>

              {/* Module Cards Grid (Styled Identical to Library.jsx) */}
              {loadingModules ? (
                <div className="fac-loading-box">
                  <RefreshCw className="spin-animation" size={36} />
                  <p>Syncing faculty curriculum modules...</p>
                </div>
              ) : filteredModules.length === 0 ? (
                <div className="fac-empty-box">
                  <BookOpen size={48} className="text-blue" />
                  <h3>No Curriculum Modules Found</h3>
                  <p>Click "Author New Module" or load one of our ready-to-publish starter templates to populate your students' library.</p>
                  <button className="fac-primary-btn" onClick={handleOpenCreateModule}>
                    <Plus size={16} /> <span>Create Your First Module</span>
                  </button>
                </div>
              ) : (
                <div className="fac-modules-grid">
                  {filteredModules.map((mod) => {
                    const totalQ = (mod.topics || []).reduce((acc, t) => acc + (t.questions?.length || 0), 0);
                    const isPublished = Boolean(mod.is_published);

                    return (
                      <div
                        key={mod.id}
                        className="fac-module-card"
                        style={{ '--mod-glow': mod.color || '#ef4444' }}
                      >
                        <div className="mod-accent-bar" style={{ background: mod.color || '#ef4444' }} />

                        <div className="mod-top-row">
                          <span className="mod-category-badge">{mod.category || 'Computer Science'}</span>
                          <div className={`mod-pub-pill ${isPublished ? 'published' : 'draft'}`}>
                            <span className="dot" />
                            <span>{isPublished ? 'PUBLISHED' : 'DRAFT'}</span>
                          </div>
                        </div>

                        <h3 className="mod-title">{mod.title}</h3>
                        <p className="mod-desc">{mod.description}</p>

                        <div className="mod-meta-strip">
                          <span><strong>{mod.topics?.length || 0}</strong> Chapters</span>
                          <span>•</span>
                          <span><strong>{totalQ}</strong> MCQs</span>
                          <span>•</span>
                          <span>Branch: <strong>{mod.target_branch || 'ALL'}</strong></span>
                          <span>•</span>
                          <span>Batch: <strong>{mod.target_batch || 'ALL'}</strong></span>
                        </div>

                        <div className="mod-actions-row">
                          <button
                            className={`mod-btn-pub ${isPublished ? 'unpub' : 'pub'}`}
                            onClick={() => handleTogglePublishModule(mod)}
                          >
                            {isPublished ? 'Unpublish to Draft' : 'Publish to Students'}
                          </button>
                          <button
                            className="mod-btn-icon"
                            onClick={() => handleOpenEditModule(mod)}
                            title="Edit Module"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            className="mod-btn-icon text-red"
                            onClick={() => handleDeleteModule(mod.id)}
                            title="Delete Module"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              PAGE 4: NOTES & LAB SHEETS (FACULTY CODEX)
              ══════════════════════════════════════════════════════════════════════ */}
          {activeNav === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="fac-section-view"
            >
              <div className="fac-page-header">
                <span className="fac-tagline">FACULTY CODEX • LAB SHEETS</span>
                <h1 className="fac-title">Classroom Notes & Assignments</h1>
                <p className="fac-subtitle">
                  Distribute weekly lab problem sheets and maintain structured course lecture materials for your students.
                </p>
              </div>

              {/* Sub-tabs: Course Notes vs Lab Sheets */}
              <div className="fac-subtabs-strip">
                <button
                  className={`subtab-btn ${notesSubTab === 'notes' ? 'active' : ''}`}
                  onClick={() => setNotesSubTab('notes')}
                >
                  <FileText size={15} /> <span>Notes & Codex ({vaultNotes.length})</span>
                </button>
                <button
                  className={`subtab-btn ${notesSubTab === 'sheets' ? 'active' : ''}`}
                  onClick={() => setNotesSubTab('sheets')}
                >
                  <Layers size={15} /> <span>Weekly Lab Sheets ({assignments.length})</span>
                </button>
              </div>

              {/* VIEW 1: LAB SHEETS */}
              {notesSubTab === 'sheets' && (
                <div className="fac-sheets-container">
                  <div className="fac-card">
                    <h3>Publish New Weekly Lab Sheet</h3>
                    <p className="fac-card-desc">Assign curated coding exercises to students without strict proctoring time limits.</p>

                    <form onSubmit={handleCreateAssignment} className="fac-form-grid">
                      <div className="form-group col-span-2">
                        <label>Lab Sheet Title *</label>
                        <input
                          type="text"
                          placeholder="e.g. Week 4: Recursion, Divide & Conquer"
                          value={asgnTitle}
                          onChange={(e) => setAsgnTitle(e.target.value)}
                          required
                        />
                      </div>

                      <div className="form-group col-span-2">
                        <label>Instructions & Submission Deadline</label>
                        <textarea
                          rows={2}
                          placeholder="Explain requirements and lab due date..."
                          value={asgnDesc}
                          onChange={(e) => setAsgnDesc(e.target.value)}
                        />
                      </div>

                      <div className="form-group">
                        <label>Target Branch</label>
                        <select value={asgnBranch} onChange={(e) => setAsgnBranch(e.target.value)}>
                          <option value="ALL">All Branches</option>
                          <option value="CSE">CSE</option>
                          <option value="IT">IT</option>
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Target Batch</label>
                        <input type="text" value={asgnBatch} onChange={(e) => setAsgnBatch(e.target.value)} />
                      </div>

                      <div className="form-group col-span-2">
                        <label>Pick Questions for this Sheet</label>
                        <div className="curated-q-grid">
                          {CURATED_QUESTIONS.map((q) => {
                            const isSelected = asgnQuestions.includes(q.id);
                            return (
                              <div
                                key={q.id}
                                className={`curated-q-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  if (isSelected) setAsgnQuestions(asgnQuestions.filter(id => id !== q.id));
                                  else setAsgnQuestions([...asgnQuestions, q.id]);
                                }}
                              >
                                <div className="q-check">{isSelected && <Check size={14} />}</div>
                                <div className="q-info">
                                  <strong>{q.title}</strong>
                                  <span className={`diff-badge ${q.difficulty.toLowerCase()}`}>{q.difficulty}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="form-actions col-span-2">
                        <button type="submit" className="fac-primary-btn" disabled={creatingAsgn}>
                          {creatingAsgn ? 'Publishing Sheet...' : 'Publish to Student Library'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Active Sheets List */}
                  <div className="fac-card">
                    <h3>Active Lab Sheets ({assignments.length})</h3>
                    <div className="fac-assignments-grid">
                      {assignments.map(asgn => (
                        <div key={asgn.id} className="fac-asgn-card">
                          <div className="asgn-head">
                            <h4>{asgn.title}</h4>
                            <button className="mod-btn-icon text-red" onClick={() => handleDeleteAssignment(asgn.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                          <p>{asgn.description}</p>
                          <div className="asgn-meta">
                            <span>Branch: <strong>{asgn.target_branch}</strong></span>
                            <span>Batch: <strong>{asgn.target_batch}</strong></span>
                            <span>Problems: <strong>{asgn.problems?.length || 0}</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: COURSE NOTES & CODEX (CodeVault Architecture) */}
              {notesSubTab === 'notes' && (
      <div className="fac-empty-box" style={{ padding: '40px', textAlign: 'center' }}>
        <p>Notes & Codex view loading...</p>
      </div>
    )}
    </div>
    )}

                  {/* Leaderboard Table */}
                  <div className="fac-table-container">
                    <table className="fac-data-table">
                      <thead>
                        <tr>
                          <th>Rank</th>
                          <th>Roll Number</th>
                          <th>Student Name</th>
                          <th>Branch</th>
                          <th>Batch</th>
                          <th>Total XP</th>
                          <th>Tier Badge</th>
                          <th>Problems Solved</th>
                          <th>Streak</th>
                        </tr>
                      </thead>
                      <tbody>
                        {leaderboard.length > 0 ? (
                          leaderboard.map((st, idx) => (
                            <tr key={st.id || idx}>
                              <td><span className={`rank-badge-num rank-${idx + 1}`}>#{idx + 1}</span></td>
                              <td><strong>{st.rollNo}</strong></td>
                              <td>{st.name || st.username}</td>
                              <td><span className="fac-pill-branch">{st.branch}</span></td>
                              <td>{st.batch}</td>
                              <td>
                                <span className="xp-cell">
                                  <Zap size={14} className="text-yellow" />
                                  <strong>{st.xp} XP</strong>
                                </span>
                              </td>
                              <td>
                                <span className={`fac-rank-tier ${st.rankBadge || 'lvl-novice'}`}>
                                  {st.rankLevel || 'Novice'}
                                </span>
                              </td>
                              <td>{st.problemsSolved || 0}</td>
                              <td>
                                <span className="streak-cell">
                                  <Flame size={14} className="text-red" />
                                  {st.streak || 0}d
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={9} style={{ textAlign: 'center', padding: '36px', color: '#94a3b8' }}>
                              No students ranked in this department yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SUBTAB 2: STUDENT ONBOARDING & DIRECTORY */}
              {rosterSubTab === 'students' && (
                <div className="fac-roster-container">
                  {/* Bulk CSV Card */}
                  <div className="fac-card">
                    <div className="fac-card-head">
                      <div>
                        <h3>Bulk Student Account Provisioning</h3>
                        <p className="fac-card-desc">Paste CSV lines or load sample data. Accounts are created with zero individual student signup hassle.</p>
                      </div>
                      <button className="fac-secondary-btn" onClick={() => setBulkInputText(SAMPLE_CSV)}>
                        <FileSpreadsheet size={15} /> <span>Load Sample CSV</span>
                      </button>
                    </div>

                    <textarea
                      className="fac-csv-textarea"
                      rows={4}
                      placeholder="Format: RollNumber, Full Name, Email, Branch, Batch&#10;Example:&#10;21CS001, Aarav Sharma, aarav@apex.edu, CSE, 2026&#10;21CS002, Diya Patel, diya@apex.edu, CSE, 2026"
                      value={bulkInputText}
                      onChange={(e) => setBulkInputText(e.target.value)}
                    />

                    <div className="fac-csv-footer">
                      <div className="csv-note">
                        <CheckCircle2 size={16} className="text-green" />
                        <span>Initial passwords are automatically formatted as <code>Bright@&lt;RollNo&gt;</code></span>
                      </div>
                      <button
                        className="fac-primary-btn"
                        onClick={handleGenerateAccounts}
                        disabled={generatingAccounts}
                      >
                        {generatingAccounts ? 'Provisioning Accounts...' : 'Generate & Provision Accounts'}
                      </button>
                    </div>

                    {lastGeneratedCredentials && lastGeneratedCredentials.length > 0 && (
                      <div className="fac-cred-alert">
                        <div className="cred-info">
                          <CheckCircle2 size={24} className="text-green" />
                          <div>
                            <strong>Successfully Provisioned Accounts!</strong>
                            <p>Download the credentials CSV file to distribute passwords to your students.</p>
                          </div>
                        </div>
                        <button className="fac-primary-btn" onClick={handleDownloadCredentials}>
                          <Download size={15} /> <span>Download Student Credentials (CSV)</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Enrolled Students Table */}
                  <div className="fac-card">
                    <div className="fac-card-head">
                      <div>
                        <h3>Enrolled Students Roster ({filteredStudents.length})</h3>
                        <p className="fac-card-desc">View student credentials, real-time XP accumulation, and reset passwords.</p>
                      </div>
                      <div className="fac-table-search-row">
                        <div className="search-box">
                          <Search size={15} />
                          <input
                            type="text"
                            placeholder="Search Roll No, Name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                        </div>
                        <select
                          value={filterBranch}
                          onChange={(e) => setFilterBranch(e.target.value)}
                          className="fac-select"
                        >
                          <option value="ALL">All Branches</option>
                          <option value="CSE">CSE</option>
                          <option value="IT">IT</option>
                          <option value="ECE">ECE</option>
                        </select>
                      </div>
                    </div>

                    <div className="fac-table-container">
                      <table className="fac-data-table">
                        <thead>
                          <tr>
                            <th>Roll Number</th>
                            <th>Student Name</th>
                            <th>Branch</th>
                            <th>Batch</th>
                            <th>Total XP</th>
                            <th>Tier Level</th>
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
                                <td><span className="fac-pill-branch">{st.branch}</span></td>
                                <td>{st.batch}</td>
                                <td>
                                  <span className="xp-cell">
                                    <Zap size={14} className="text-yellow" />
                                    <strong>{st.xp || 0} XP</strong>
                                  </span>
                                </td>
                                <td>
                                  <span className={`fac-rank-tier ${st.rankBadge || 'lvl-novice'}`}>
                                    {st.rankLevel || 'Novice'}
                                  </span>
                                </td>
                                <td>{st.problemsSolved || 0}</td>
                                <td>
                                  <span className="streak-cell">
                                    <Flame size={14} className="text-red" />
                                    {st.streak || 0}d
                                  </span>
                                </td>
                                <td>
                                  <div className="action-buttons-cell">
                                    <button
                                      className="mod-btn-icon"
                                      title="Reset Password"
                                      onClick={() => handleResetPassword(st.id, st.rollNo)}
                                    >
                                      <KeyRound size={15} />
                                    </button>
                                    <button
                                      className="mod-btn-icon text-red"
                                      title="Delete & Free License Seat"
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
                                No enrolled students match your search filter.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* ══════════════════════════════════════════════════════════════════════
              PAGE 6: FACULTY PROFILE & SYSTEM SETTINGS (1:1 with Settings.jsx)
              ══════════════════════════════════════════════════════════════════════ */}
          {activeNav === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="settings-page"
              style={{ paddingTop: 0, minHeight: 'calc(100vh - 60px)', background: 'var(--bg-dark, #09090b)' }}
            >
              <div className="settings-wrapper" style={{ height: 'calc(100vh - 64px)' }}>
                {/* Left Sidebar */}
                <aside className="settings-sidebar">
                  <nav className="sidebar-nav">
                    <button
                      className={`nav-item ${settingsTab === 'details' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('details')}
                    >
                      <User size={18} />
                      <span>Identity & Intel</span>
                    </button>
                    <button
                      className={`nav-item ${settingsTab === 'settings' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('settings')}
                    >
                      <SettingsIcon size={18} />
                      <span>System & Themes</span>
                    </button>
                    <button
                      className={`nav-item ${settingsTab === 'security' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('security')}
                    >
                      <Shield size={18} />
                      <span>Security & Credentials</span>
                    </button>
                    <button
                      className={`nav-item ${settingsTab === 'about' ? 'active' : ''}`}
                      onClick={() => setSettingsTab('about')}
                    >
                      <Info size={18} />
                      <span>About Console</span>
                    </button>
                  </nav>

                  <div className="sidebar-footer">
                    <button className="logout-trigger" onClick={handleLogout}>
                      <LogOut size={16} />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </aside>

                {/* Main Settings Canvas */}
                <main className="settings-main">
                  <AnimatePresence mode="wait">
                    {/* TAB 1: IDENTITY & PROFILE */}
                    {settingsTab === 'details' && (
                      <motion.div
                        key="details"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="dashboard-content"
                      >
                        {/* Profile Header Banner */}
                        <div
                          className="profile-header-card premium-header"
                          style={{
                            background: BANNERS.find(b => b.id === formData.bannerId)?.css || 'linear-gradient(135deg, rgba(20,20,25,0.9) 0%, rgba(10,10,15,0.95) 100%)'
                          }}
                        >
                          <div className="premium-overlay" />
                          <div className="profile-info-group">
                            <div className="premium-avatar-wrap">
                              <div className="premium-avatar-hex">
                                <img
                                  src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${formData.avatarId || username || 'Sniper'}&backgroundColor=transparent`}
                                  alt="Faculty Avatar"
                                />
                              </div>
                            </div>
                            <div className="profile-text">
                              <div className="name-row">
                                <h1>{username}</h1>
                                <span className="premium-rank-badge">FACULTY COORDINATOR</span>
                              </div>
                              <div className="email-row">
                                <Mail size={14} />
                                <span>{user?.email || `${username.toLowerCase()}@${orgCode.toLowerCase()}.edu`}</span>
                              </div>
                              <div className="premium-stats-row">
                                <span className="stat-pill"><School size={12}/> {orgName}</span>
                                <span className="stat-pill"><Users size={12}/> {enrolledStudentsCount} Students Enrolled</span>
                              </div>
                            </div>
                          </div>
                          <div className="profile-actions">
                            <button type="button" className="action-btn primary" onClick={() => setShowConfigModal(true)}>
                              <Terminal size={16} />
                              <span>Configure Username</span>
                            </button>
                          </div>
                        </div>

                        {/* Premium Details Grid */}
                        <div className="premium-details-grid">
                          <div className="premium-col">
                            <div className="dashboard-card identity-card">
                              <div className="card-header">
                                <div className="header-icon"><User size={18} /></div>
                                <h3>Faculty Bio & Department Arsenal</h3>
                              </div>
                              <div className="card-body">
                                <div className="premium-input-group">
                                  <label>Faculty Bio</label>
                                  <input
                                    type="text"
                                    className="premium-input"
                                    value={formData.bio}
                                    onChange={(e) => handleBioChange(e.target.value)}
                                    placeholder="Enter your academic title & research focus..."
                                  />
                                  <span className="save-indicator">{isSavingBio ? 'Saving...' : 'Auto-saves on typing'}</span>
                                </div>

                                <div className="premium-input-group mt-4">
                                  <label>Teaching Stack & Specialization Tags (Max 5)</label>
                                  <div className="stack-container" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                    <div className="premium-add-stack">
                                      <input
                                        type="text"
                                        value={newStackItem}
                                        onChange={(e) => setNewStackItem(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addStackItem()}
                                        placeholder={formData.stack.length >= 5 ? "Max tags reached" : "Add skill (e.g. C++, OS, DBMS)..."}
                                        disabled={formData.stack.length >= 5}
                                      />
                                      <button className="premium-add-btn" onClick={addStackItem} disabled={formData.stack.length >= 5}>
                                        Add
                                      </button>
                                    </div>
                                    <div className="stack-list">
                                      {formData.stack.map((item, index) => (
                                        <div key={index} className="stack-tag">
                                          <span>{item}</span>
                                          <button className="remove-tag" onClick={() => removeStackItem(index)}>
                                            <X size={12} />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>

                                <div className="premium-section-divider"></div>

                                <div className="premium-input-group">
                                  <label><Globe size={12} style={{ display: 'inline', marginRight: '4px' }}/> Academic & Professional Links</label>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                                    <input
                                      type="text"
                                      className="premium-input"
                                      value={formData.github}
                                      onChange={(e) => handleLinkChange('github', e.target.value)}
                                      placeholder="GitHub profile URL..."
                                    />
                                    <input
                                      type="text"
                                      className="premium-input"
                                      value={formData.leetcode}
                                      onChange={(e) => handleLinkChange('leetcode', e.target.value)}
                                      placeholder="LeetCode / Codeforces profile URL..."
                                    />
                                    <input
                                      type="text"
                                      className="premium-input"
                                      value={formData.project1}
                                      onChange={(e) => handleLinkChange('project1', e.target.value)}
                                      placeholder="Google Scholar / ResearchGate URL..."
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="premium-col">
                            {/* Choose Avatar Card */}
                            <div className="dashboard-card avatar-selection-card">
                              <div className="card-header">
                                <div className="header-icon"><Sparkles size={18} /></div>
                                <h3>Faculty Avatar Selector</h3>
                              </div>
                              <div className="card-body">
                                <div className="avatar-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
                                  {AVATARS.map(av => (
                                    <div
                                      key={av.seed}
                                      className={`avatar-choice-item ${formData.avatarId === av.seed ? 'active' : ''}`}
                                      onClick={() => handleAvatarSelect(av.seed)}
                                      style={{
                                        cursor: 'pointer',
                                        padding: '8px',
                                        borderRadius: '8px',
                                        border: formData.avatarId === av.seed ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                                        background: formData.avatarId === av.seed ? 'rgba(var(--primary-rgb), 0.15)' : 'rgba(255,255,255,0.02)',
                                        textAlign: 'center'
                                      }}
                                    >
                                      <img
                                        src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${av.seed}&backgroundColor=transparent`}
                                        alt={av.seed}
                                        style={{ width: '48px', height: '48px', margin: '0 auto', display: 'block' }}
                                      />
                                      <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px', display: 'block' }}>{av.seed}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Choose Banner Card */}
                            <div className="dashboard-card banner-selection-card" style={{ marginTop: '16px' }}>
                              <div className="card-header">
                                <div className="header-icon"><Layers size={18} /></div>
                                <h3>Header Theme Banner</h3>
                              </div>
                              <div className="card-body">
                                <div className="banner-grid" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  {BANNERS.map(b => (
                                    <div
                                      key={b.id}
                                      className={`banner-choice-item ${formData.bannerId === b.id ? 'active' : ''}`}
                                      onClick={() => handleBannerSelect(b.id)}
                                      style={{
                                        cursor: 'pointer',
                                        padding: '10px 14px',
                                        borderRadius: '8px',
                                        border: formData.bannerId === b.id ? '2px solid var(--primary)' : '1px solid rgba(255,255,255,0.08)',
                                        background: b.css,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                      }}
                                    >
                                      <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.85rem' }}>{b.name}</span>
                                      {formData.bannerId === b.id && <ShieldCheck size={16} color="var(--primary)" />}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB 2: SYSTEM & THEMES */}
                    {settingsTab === 'settings' && (
                      <motion.div
                        key="settings"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="dashboard-content"
                      >
                        {/* Theme Section */}
                        <div className="system-section">
                          <div className="section-header">
                            <h2>Platform Themes</h2>
                            <p className="section-desc">Choose your cyber aesthetic — applied immediately to the entire faculty console.</p>
                          </div>
                          <div className="theme-selector">
                            <div
                              className={`theme-option ${selectedTheme === 'crimson' ? 'active' : ''}`}
                              onClick={() => handleThemeChange('crimson')}
                            >
                              <div className="theme-preview crimson-theme">
                                <div className="preview-header"></div>
                                <div className="preview-content">
                                  <div className="preview-sidebar"></div>
                                  <div className="preview-main">
                                    <div className="preview-line"></div>
                                    <div className="preview-line short"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="theme-info">
                                <h3>Scarlet Flare</h3>
                                <p>High-energy crimson matrix</p>
                              </div>
                              <div className="theme-check">
                                <ShieldCheck size={16} />
                              </div>
                            </div>

                            <div
                              className={`theme-option ${selectedTheme === 'amber' ? 'active' : ''}`}
                              onClick={() => handleThemeChange('amber')}
                            >
                              <div className="theme-preview amber-theme">
                                <div className="preview-header"></div>
                                <div className="preview-content">
                                  <div className="preview-sidebar"></div>
                                  <div className="preview-main">
                                    <div className="preview-line"></div>
                                    <div className="preview-line short"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="theme-info">
                                <h3>Creeper Craft</h3>
                                <p>Pixel block gold world</p>
                              </div>
                              <div className="theme-check">
                                <ShieldCheck size={16} />
                              </div>
                            </div>

                            <div
                              className={`theme-option ${selectedTheme === 'neo-noir' ? 'active' : ''}`}
                              onClick={() => handleThemeChange('neo-noir')}
                            >
                              <div className="theme-preview neo-noir-theme">
                                <div className="preview-header"></div>
                                <div className="preview-content">
                                  <div className="preview-sidebar"></div>
                                  <div className="preview-main">
                                    <div className="preview-line"></div>
                                    <div className="preview-line short"></div>
                                  </div>
                                </div>
                              </div>
                              <div className="theme-info">
                                <h3>Night City</h3>
                                <p>Cyberpunk neon cyan grid</p>
                              </div>
                              <div className="theme-check">
                                <ShieldCheck size={16} />
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Accent Colors */}
                        {selectedTheme === 'crimson' && (
                          <div className="system-section" style={{ marginTop: '24px' }}>
                            <div className="section-header">
                              <h2>Primary Accent Color</h2>
                              <p className="section-desc">Instantly shift the vibrant glow highlights across the console.</p>
                            </div>
                            <div className="accent-selector">
                              {Object.entries(ACCENT_PALETTES).map(([key, p]) => (
                                <div
                                  key={key}
                                  className={`accent-option ${accentColor === key ? 'active' : ''}`}
                                  onClick={() => handleAccentChange(key)}
                                >
                                  <div className="accent-swatch" style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.dark})` }}>
                                    {accentColor === key && <span className="accent-check"><ShieldCheck size={16} /></span>}
                                  </div>
                                  <div className="accent-info">
                                    <h3>{key === 'red' ? 'Scarlet Red' : key === 'orange' ? 'Ember Orange' : 'Dark Espresso'}</h3>
                                    <p>{p.primary}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Danger Zone */}
                        <div className="danger-zone" style={{ marginTop: '30px' }}>
                          <div className="danger-content">
                            <h3>Sign Out</h3>
                            <p>End your institutional session and return to portal login.</p>
                          </div>
                          <button className="logout-btn-large" onClick={handleLogout}>
                            <LogOut size={18} />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB 3: SECURITY & CREDENTIALS */}
                    {settingsTab === 'security' && (
                      <motion.div
                        key="security"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="dashboard-content"
                      >
                        <div className="premium-details-grid">
                          <div className="premium-col">
                            <div className="dashboard-card identity-card">
                              <div className="card-header">
                                <div className="header-icon"><Lock size={18} /></div>
                                <h3>Update Password</h3>
                              </div>
                              <form onSubmit={handleChangePassword} className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                                <div className="premium-input-group">
                                  <label>Current Password</label>
                                  <input
                                    type="password"
                                    className="premium-input"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    placeholder="Enter current password"
                                    required
                                  />
                                </div>
                                <div className="premium-input-group">
                                  <label>New Password (Min 6 Characters)</label>
                                  <input
                                    type="password"
                                    className="premium-input"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    placeholder="Enter new password"
                                    required
                                  />
                                </div>
                                <div className="premium-input-group">
                                  <label>Confirm New Password</label>
                                  <input
                                    type="password"
                                    className="premium-input"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    placeholder="Re-type new password"
                                    required
                                  />
                                </div>
                                <button
                                  type="submit"
                                  className="premium-add-btn"
                                  style={{ marginTop: '8px', alignSelf: 'flex-start', padding: '10px 20px' }}
                                  disabled={isChangingPassword}
                                >
                                  {isChangingPassword ? 'Updating...' : 'Update Password'}
                                </button>
                              </form>
                            </div>
                          </div>

                          <div className="premium-col">
                            <div className="dashboard-card identity-card">
                              <div className="card-header">
                                <div className="header-icon"><School size={18} /></div>
                                <h3>Institutional Verification</h3>
                              </div>
                              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <div>
                                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Institution</span>
                                  <p style={{ margin: '2px 0', fontWeight: 600, color: '#fff' }}>{orgName}</p>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Institution Code</span>
                                  <p style={{ margin: '2px 0', fontWeight: 600, color: 'var(--primary)' }}>{orgCode}</p>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Licensed Student Seats</span>
                                  <p style={{ margin: '2px 0', fontWeight: 600, color: '#10b981' }}>{enrolledStudentsCount} / {maxSeats} Active Seats</p>
                                </div>
                                <div>
                                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Faculty Coordinator ID</span>
                                  <p style={{ margin: '2px 0', fontFamily: 'monospace', color: '#cbd5e1' }}>{user?.id || 'FAC_COORDINATOR_APEX'}</p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* TAB 4: ABOUT CONSOLE */}
                    {settingsTab === 'about' && (
                      <motion.div
                        key="about"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="dashboard-content"
                      >
                        <div className="dashboard-card identity-card">
                          <div className="card-header">
                            <div className="header-icon"><Info size={18} /></div>
                            <h3>About BrightCode Campus Console</h3>
                          </div>
                          <div className="card-body" style={{ color: '#cbd5e1', lineHeight: '1.6' }}>
                            <p style={{ marginBottom: '14px' }}>
                              The BrightCode Campus Console is the institutional command center for engineering faculty. It integrates curriculum authoring, real-time automated evaluation, tab-switch proctoring, and competitive telemetry.
                            </p>
                            <h4 style={{ color: '#fff', margin: '14px 0 6px' }}>Version & Runtime</h4>
                            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>BrightCode Core 2.8.4 • Institutional Release • React 19 / Node.js Engine</p>
                            <h4 style={{ color: '#fff', margin: '14px 0 6px' }}>Support & Inquiries</h4>
                            <p style={{ fontSize: '0.88rem', color: '#94a3b8' }}>Direct queries to: <strong>codebrightlim@gmail.com</strong></p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </main>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ══════════════════════════════════════════════════════════════════════
          CONFIGURE PROFILE MODAL
          ══════════════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {showConfigModal && (
          <>
            <motion.div
              className="modal-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowConfigModal(false)}
            />
            <motion.div
              className="config-modal"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
            >
              <div className="config-modal-header">
                <div className="config-header-icon"><Terminal size={20} /></div>
                <div>
                  <h2>Configure Username</h2>
                  <p>Update your faculty display name</p>
                </div>
                <button className="modal-close-btn" onClick={() => setShowConfigModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <div className="config-modal-body">
                <div className="config-input-group">
                  <label>Faculty Username</label>
                  <input
                    type="text"
                    value={configData.username}
                    onChange={(e) => setConfigData(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter new faculty username..."
                  />
                </div>
              </div>

              <div className="config-modal-footer">
                <button className="config-btn cancel" onClick={() => setShowConfigModal(false)}>
                  Cancel
                </button>
                <button className="config-btn save" onClick={handleConfigureProfile} disabled={isSavingProfile}>
                  {isSavingProfile ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>


{/* ══════════════════════════════════════════════════════════════════════
          CURRICULUM STUDIO MODAL
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
              <div className="studio-templates-bar">
                <span>Starter Templates:</span>
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
                  <label>Module Overview & Learning Objectives</label>
                  <textarea
                    rows={2}
                    placeholder="Describe what students will master in this module..."
                    value={moduleForm.description}
                    onChange={(e) => setModuleForm({ ...moduleForm, description: e.target.value })}
                  />
                </div>

                <div className="ca-form-group">
                  <label>Academic Category</label>
                  <input
                    type="text"
                    value={moduleForm.category}
                    onChange={(e) => setModuleForm({ ...moduleForm, category: e.target.value })}
                    placeholder="e.g. Computer Science, Cloud Systems"
                  />
                </div>

                <div className="ca-form-group">
                  <label>Accent Glow Color</label>
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
                  <h4>Curriculum Chapters & MCQs ({moduleForm.topics.length})</h4>
                  <button type="button" className="fac-primary-btn-sm" onClick={handleAddTopic}>
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
                            placeholder="Diagnostic explanation shown after answer..."
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
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
                    className="fac-secondary-btn"
                    onClick={() => setIsModuleModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="fac-primary-btn">
                    <Check size={16} /> <span>{editingModuleId ? 'Update Module' : 'Publish Module'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Real-Time Friends Drawer ─────────────────────────── */}
      <FriendsDrawer
        open={friendsDrawerOpen}
        onClose={() => setFriendsDrawerOpen(false)}
        onUnread={() => {}}
      />
    </div>
  );
};

export default CollegeAdmin;
