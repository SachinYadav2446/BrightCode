const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidV4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const { pool, sql, useMemoryDB: dbMemoryMode } = require('./db');
const { executeCode } = require('./codeExecutor');

const JWT_SECRET = process.env.JWT_SECRET || 'brightcode_secret_key_123';

let useMemoryDB = dbMemoryMode;

// ── Persistent JSON Files for Memory / Offline Mode ─────────────────────────
const ORGS_FILE = path.join(__dirname, 'organizations_db.json');
const EXAMS_FILE = path.join(__dirname, 'college_exams_db.json');
const RESULTS_FILE = path.join(__dirname, 'college_results_db.json');
const ASSIGNMENTS_FILE = path.join(__dirname, 'college_assignments_db.json');
const USERS_FILE = path.join(__dirname, 'users_db.json');
const MODULES_FILE = path.join(__dirname, 'college_modules_db.json');

let organizationsMemoryStore = [];
let collegeExamsMemoryStore = [];
let collegeResultsMemoryStore = [];
let collegeAssignmentsMemoryStore = [];
let collegeModulesMemoryStore = [];

// ── Default Seed Organization (Apex Institute of Technology) ────────────────
const DEFAULT_ORG = {
    id: 'demo_college',
    name: 'Apex Institute of Technology',
    code: 'APEX',
    contact_email: 'dean@apex.edu',
    plan: 'campus_enterprise',
    max_students: 300,
    created_at: '2026-01-01T00:00:00.000Z'
};

const DEFAULT_EXAM = {
    id: 'exam_apex_midterm_dsa',
    org_id: 'demo_college',
    title: 'Apex Midterm Lab Test: DSA & Algorithms',
    description: 'Official Semester Proctored Assessment for Computer Science & Engineering. Complete both problems within 60 minutes.',
    duration_minutes: 60,
    target_branch: 'ALL',
    target_batch: '2026',
    created_by: 'apex_faculty_admin_1',
    created_at: new Date().toISOString(),
    start_time: new Date().toISOString(),
    end_time: null,
    questions: [
        {
            id: 'q1',
            title: 'Array Reverse',
            difficulty: 'Easy',
            description: 'Given an array of integers, reverse the array in-place and output the elements separated by spaces.\n\nInput:\nFirst line contains integer N (size of array).\nSecond line contains N integers.\n\nOutput:\nReversed array elements separated by spaces.',
            constraints: '1 <= N <= 10^5\n-10^9 <= Arr[i] <= 10^9',
            testCases: [
                { input: '5\n1 2 3 4 5', expectedOutput: '5 4 3 2 1' },
                { input: '3\n10 20 30', expectedOutput: '30 20 10' }
            ]
        },
        {
            id: 'q2',
            title: 'Min and Max in Array',
            difficulty: 'Medium',
            description: 'Given an array A of size N of integers. Your task is to find the minimum and maximum elements in the array.\n\nInput:\nFirst line contains N.\nSecond line contains N integers.\n\nOutput:\nPrint min followed by max separated by space.',
            constraints: '1 <= N <= 10^5\n1 <= A[i] <= 10^12',
            testCases: [
                { input: '6\n3 2 1 56 10000 167', expectedOutput: '1 10000' }
            ]
        }
    ]
};


const DEFAULT_MODULE = {
    id: 'mod_apex_dsa_core',
    org_id: 'demo_college',
    title: 'Data Structures & Algorithms in C++',
    description: 'Core semester lab modules covering pointers, dynamic arrays, linked lists, and algorithm complexity.',
    category: 'Computer Science',
    color: '#ef4444',
    icon: 'Binary',
    target_branch: 'ALL',
    target_batch: '2026',
    created_by: 'apex_faculty_admin_1',
    is_published: true,
    created_at: '2026-01-01T00:00:00.000Z',
    published_at: '2026-01-01T00:00:00.000Z',
    topics: [
        {
            id: 'top_1',
            title: '1. Pointers & Dynamic Memory Management',
            content: '### Pointers in C++\nPointers are variables that store the memory address of another variable.\n\n```cpp\nint val = 42;\nint* ptr = &val;\ncout << *ptr << endl; // Prints 42\n```\n\n#### Key Rules:\n1. Always initialize pointers.\n2. Delete dynamically allocated memory with `delete` or `delete[]` to prevent memory leaks.\n3. Prefer smart pointers (`std::unique_ptr`, `std::shared_ptr`) in modern C++.',
            questions: [
                {
                    id: 'q1',
                    question: 'What is the output of *ptr when ptr points to int x = 100?',
                    options: ['100', 'Memory address of x', 'Compiler Error', 'Garbage value'],
                    answer: 0,
                    explanation: 'Dereferencing (*ptr) accesses the actual value stored at the address pointed to by ptr.'
                },
                {
                    id: 'q2',
                    question: 'Which operator is used to deallocate dynamic memory in C++?',
                    options: ['free()', 'delete', 'remove', 'dispose'],
                    answer: 1,
                    explanation: 'In C++, delete and delete[] are the operators used to release heap-allocated memory.'
                }
            ]
        },
        {
            id: 'top_2',
            title: '2. Array Traversals & Kadane\'s Algorithm',
            content: '### Kadane\'s Algorithm (Maximum Subarray Sum)\nKadane\'s algorithm operates in O(N) time and O(1) auxiliary space by keeping track of the current subarray sum and resetting it whenever it drops below zero.\n\n```cpp\nint maxSubArray(vector<int>& nums) {\n    int maxSum = nums[0], curSum = 0;\n    for (int x : nums) {\n        curSum = max(x, curSum + x);\n        maxSum = max(maxSum, curSum);\n    }\n    return maxSum;\n}\n```',
            questions: [
                {
                    id: 'q3',
                    question: 'What is the time complexity of Kadane\'s Algorithm?',
                    options: ['O(N)', 'O(N log N)', 'O(N^2)', 'O(1)'],
                    answer: 0,
                    explanation: 'Kadane\'s algorithm processes each array element in a single pass, resulting in linear O(N) complexity.'
                }
            ]
        }
    ]
};

const DEFAULT_ASSIGNMENT = {
    id: 'asgn_apex_sheet_1',
    org_id: 'demo_college',
    title: 'Lab Sheet 1: Core Array Mastery & Two Pointers',
    description: 'Weekly mandatory lab practical problems assigned by Prof. Sharma. Practice these in the Library or Workspace before the next lab evaluation.',
    target_branch: 'ALL',
    target_batch: '2026',
    created_by: 'apex_faculty_admin_1',
    due_date: '2026-11-15T23:59:59.000Z',
    created_at: new Date().toISOString(),
    problems: [
        { id: 'q1', title: 'Array Reverse', difficulty: 'Easy', slug: 'array_reverse' },
        { id: 'q4', title: 'Two Sum - Pairs with 0 Sum', difficulty: 'Easy', slug: 'two_sum_pairs_with_0_sum' },
        { id: 'q3', title: 'Kadane\'s Algorithm (Max Subarray)', difficulty: 'Medium', slug: 'kadanes_algorithm' }
    ]
};

// ── Store Loaders & Savers ──────────────────────────────────────────────────
const loadCollegeStores = () => {
    try {
        if (fs.existsSync(ORGS_FILE)) {
            organizationsMemoryStore = JSON.parse(fs.readFileSync(ORGS_FILE, 'utf8')) || [];
        }
        if (!organizationsMemoryStore.find(o => o.id === 'demo_college')) {
            organizationsMemoryStore.push(DEFAULT_ORG);
            saveOrganizations();
        }
        logger.info(`[COLLEGE] Loaded ${organizationsMemoryStore.length} organizations`);

        if (fs.existsSync(EXAMS_FILE)) {
            collegeExamsMemoryStore = JSON.parse(fs.readFileSync(EXAMS_FILE, 'utf8')) || [];
        }
        if (!collegeExamsMemoryStore.find(e => e.id === DEFAULT_EXAM.id)) {
            collegeExamsMemoryStore.push(DEFAULT_EXAM);
            saveExams();
        }
        logger.info(`[COLLEGE] Loaded ${collegeExamsMemoryStore.length} college exams`);

        if (fs.existsSync(ASSIGNMENTS_FILE)) {
            collegeAssignmentsMemoryStore = JSON.parse(fs.readFileSync(ASSIGNMENTS_FILE, 'utf8')) || [];
        }
        if (!collegeAssignmentsMemoryStore.find(a => a.id === DEFAULT_ASSIGNMENT.id)) {
            collegeAssignmentsMemoryStore.push(DEFAULT_ASSIGNMENT);
            saveAssignments();
        }
        logger.info(`[COLLEGE] Loaded ${collegeAssignmentsMemoryStore.length} college lab sheets / practice assignments`);

        if (fs.existsSync(RESULTS_FILE)) {
            collegeResultsMemoryStore = JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf8')) || [];
        }
        logger.info(`[COLLEGE] Loaded ${collegeResultsMemoryStore.length} exam results`);

        if (fs.existsSync(MODULES_FILE)) {
            collegeModulesMemoryStore = JSON.parse(fs.readFileSync(MODULES_FILE, 'utf8')) || [];
        }
        if (!collegeModulesMemoryStore.find(m => m.id === DEFAULT_MODULE.id)) {
            collegeModulesMemoryStore.push(DEFAULT_MODULE);
            saveModules();
        }
        logger.info(`[COLLEGE] Loaded ${collegeModulesMemoryStore.length} college library modules`);
    } catch (e) {
        logger.error('[COLLEGE] Error loading college JSON stores:', e.message);
    }
};

const saveOrganizations = () => {
    try {
        fs.writeFileSync(ORGS_FILE, JSON.stringify(organizationsMemoryStore, null, 2));
    } catch (e) { logger.error('[COLLEGE] Failed to save organizations:', e); }
};

const saveExams = () => {
    try {
        fs.writeFileSync(EXAMS_FILE, JSON.stringify(collegeExamsMemoryStore, null, 2));
    } catch (e) { logger.error('[COLLEGE] Failed to save exams:', e); }
};

const saveAssignments = () => {
    try {
        fs.writeFileSync(ASSIGNMENTS_FILE, JSON.stringify(collegeAssignmentsMemoryStore, null, 2));
    } catch (e) { logger.error('[COLLEGE] Failed to save assignments:', e); }
};

const saveModules = () => {
    try {
        fs.writeFileSync(MODULES_FILE, JSON.stringify(collegeModulesMemoryStore, null, 2));
    } catch (e) { logger.error('[COLLEGE] Failed to save modules:', e); }
};

const saveResults = () => {
    try {
        fs.writeFileSync(RESULTS_FILE, JSON.stringify(collegeResultsMemoryStore, null, 2));
    } catch (e) { logger.error('[COLLEGE] Failed to save results:', e); }
};

loadCollegeStores();


function getRankLevel(xp) {
    if (xp >= 10000) return { title: 'Grandmaster', badgeClass: 'lvl-grandmaster' };
    if (xp >= 5000) return { title: 'Expert', badgeClass: 'lvl-expert' };
    if (xp >= 2000) return { title: 'Advanced', badgeClass: 'lvl-advanced' };
    if (xp >= 500) return { title: 'Apprentice', badgeClass: 'lvl-apprentice' };
    return { title: 'Novice', badgeClass: 'lvl-novice' };
}

// ── Database Initialization (PostgreSQL) ────────────────────────────────────
async function initCollegeDB() {
    if (!pool || useMemoryDB) {
        ensureDemoAdminInMemory();
        return;
    }
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS organizations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                code TEXT UNIQUE NOT NULL,
                contact_email TEXT,
                plan TEXT DEFAULT 'campus_pro',
                max_students INTEGER DEFAULT 300,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS college_exams (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                questions JSONB DEFAULT '[]',
                duration_minutes INTEGER DEFAULT 60,
                start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                end_time TIMESTAMP WITH TIME ZONE,
                target_branch TEXT DEFAULT 'ALL',
                target_batch TEXT DEFAULT 'ALL',
                status TEXT DEFAULT 'published',
                created_by TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS college_exam_results (
                id TEXT PRIMARY KEY,
                exam_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                org_id TEXT NOT NULL,
                roll_no TEXT,
                name TEXT,
                score INTEGER DEFAULT 0,
                max_score INTEGER DEFAULT 100,
                problems_solved INTEGER DEFAULT 0,
                violations_count INTEGER DEFAULT 0,
                status TEXT DEFAULT 'in_progress',
                submitted_at TIMESTAMP WITH TIME ZONE,
                details JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(exam_id, user_id)
            );

            CREATE TABLE IF NOT EXISTS college_assignments (
                id TEXT PRIMARY KEY,
                org_id TEXT NOT NULL,
                title TEXT NOT NULL,
                description TEXT,
                problems JSONB DEFAULT '[]',
                target_branch TEXT DEFAULT 'ALL',
                target_batch TEXT DEFAULT 'ALL',
                due_date TIMESTAMP WITH TIME ZONE,
                created_by TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );

            CREATE INDEX IF NOT EXISTS idx_org_code ON organizations(LOWER(code));
            CREATE INDEX IF NOT EXISTS idx_ce_org ON college_exams(org_id);
            CREATE INDEX IF NOT EXISTS idx_cer_exam ON college_exam_results(exam_id);
            CREATE INDEX IF NOT EXISTS idx_cer_user ON college_exam_results(user_id);
            CREATE INDEX IF NOT EXISTS idx_ca_org ON college_assignments(org_id);
        `);

        // Seed default organization into PG if missing
        const { rows } = await pool.query('SELECT id FROM organizations WHERE id = $1', ['demo_college']);
        if (rows.length === 0) {
            await pool.query(`
                INSERT INTO organizations (id, name, code, contact_email, plan, max_students)
                VALUES ($1, $2, $3, $4, $5, $6)
            `, [DEFAULT_ORG.id, DEFAULT_ORG.name, DEFAULT_ORG.code, DEFAULT_ORG.contact_email, DEFAULT_ORG.plan, DEFAULT_ORG.max_students]);
            logger.info('[COLLEGE] ✅ Seeded default demo organization in PostgreSQL');
        }

        // Seed demo faculty admin user
        const adminCheck = await pool.query('SELECT id FROM users WHERE username = $1', ['prof_sharma']);
        if (adminCheck.rows.length === 0) {
            const hash = await bcrypt.hash('Admin@123', 10);
            await pool.query(`
                INSERT INTO users (id, username, email, password, role, org_id, roll_no, branch, batch, subscription)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'elite')
            `, [uuidV4(), 'prof_sharma', 'admin@apex.edu', hash, 'college_admin', 'demo_college', 'FACULTY01', 'CSE', 'FACULTY']);
            logger.info('[COLLEGE] ✅ Seeded demo faculty admin (prof_sharma / Admin@123) in PostgreSQL');
        }

        // Seed demo student user
        const studentCheck = await pool.query('SELECT id FROM users WHERE username = $1 OR roll_no = $2', ['apex_21cs001', '21CS001']);
        if (studentCheck.rows.length === 0) {
            const studentHash = await bcrypt.hash('Bright@21CS001', 10);
            await pool.query(`
                INSERT INTO users (id, username, email, password, role, org_id, roll_no, branch, batch, subscription, xp)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'campus_student', 150)
            `, [uuidV4(), 'apex_21cs001', '21cs001@apex.edu', studentHash, 'student', 'demo_college', '21CS001', 'CSE', '2026']);
            logger.info('[COLLEGE] ✅ Seeded demo student (21CS001 / Bright@21CS001) in PostgreSQL');
        }

        logger.info('[COLLEGE] ✅ PostgreSQL tables and demo seed ready');
    } catch (err) {
        logger.error('[COLLEGE] DB init failed, fallback to memory stores:', err.message);
        useMemoryDB = true;
        ensureDemoAdminInMemory();
    }
}

async function ensureDemoAdminInMemory() {
    try {
        let users = [];
        if (fs.existsSync(USERS_FILE)) {
            const data = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
            users = data.users || [];
        }

        let prof = users.find(u => u.username === 'prof_sharma');
        const adminHash = await bcrypt.hash('Admin@123', 10);
        if (!prof) {
            users.push({
                id: 'apex_faculty_admin_1',
                username: 'prof_sharma',
                email: 'admin@apex.edu',
                password: adminHash,
                role: 'college_admin',
                org_id: 'demo_college',
                roll_no: 'FACULTY01',
                branch: 'CSE',
                batch: 'FACULTY',
                subscription: 'elite',
                xp: 1000,
                created_at: new Date().toISOString()
            });
            logger.info('[COLLEGE] ✅ Seeded demo faculty admin in memory store');
        } else {
            prof.role = 'college_admin';
            prof.org_id = 'demo_college';
            prof.roll_no = 'FACULTY01';
            prof.branch = 'CSE';
            prof.batch = 'FACULTY';
            prof.subscription = 'elite';
            prof.password = adminHash;
        }

        let student = users.find(u => u.roll_no === '21CS001' || u.username === 'apex_21cs001');
        const studentHash = await bcrypt.hash('Bright@21CS001', 10);
        if (!student) {
            users.push({
                id: 'apex_demo_student_1',
                username: 'apex_21cs001',
                name: 'Aryan Sharma',
                email: '21cs001@apex.edu',
                password: studentHash,
                role: 'student',
                org_id: 'demo_college',
                roll_no: '21CS001',
                branch: 'CSE',
                batch: '2026',
                subscription: 'campus_student',
                xp: 150,
                is_temp_password: true,
                created_at: new Date().toISOString()
            });
            logger.info('[COLLEGE] ✅ Seeded demo student in memory store');
        } else {
            student.name = student.name || 'Aryan Sharma';
            student.email = student.email || '21cs001@apex.edu';
            student.password = studentHash;
            student.role = 'student';
            student.org_id = 'demo_college';
            student.roll_no = '21CS001';
            student.branch = 'CSE';
            student.batch = '2026';
            student.subscription = 'campus_student';
        }

        fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
    } catch (e) {
        logger.error('[COLLEGE] Error seeding demo admin in memory:', e);
    }
}

initCollegeDB();

// ── Auth Middleware ─────────────────────────────────────────────────────────
const auth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No authorization token provided' });
    try {
        req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
        next();
    } catch {
        return res.status(401).json({ error: 'Invalid or expired session token' });
    }
};

const requireCollegeAdmin = (req, res, next) => {
    if (req.user?.role !== 'college_admin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({ error: 'Access restricted: College Faculty / Coordinator privileges required.' });
    }
    next();
};

const requireStudent = (req, res, next) => {
    if (req.user?.role !== 'student' && req.user?.role !== 'college_admin' && req.user?.role !== 'super_admin') {
        return res.status(403).json({ error: 'Access restricted: Student account required.' });
    }
    next();
};

// ── Helper: Get Organization by ID or Code ──────────────────────────────────
const getOrg = async (identifier) => {
    if (!identifier) return null;
    const clean = identifier.trim().toLowerCase();
    if (useMemoryDB) {
        return organizationsMemoryStore.find(o => o.id.toLowerCase() === clean || o.code.toLowerCase() === clean) || null;
    }
    try {
        const { rows } = await pool.query(
            'SELECT * FROM organizations WHERE LOWER(id) = $1 OR LOWER(code) = $1 LIMIT 1',
            [clean]
        );
        return rows[0] || null;
    } catch (e) {
        return organizationsMemoryStore.find(o => o.id.toLowerCase() === clean || o.code.toLowerCase() === clean) || null;
    }
};

// ── Helper: Get Enrolled Student Count for Org ──────────────────────────────
const getEnrolledStudentCount = async (orgId) => {
    if (useMemoryDB) {
        let users = [];
        if (fs.existsSync(USERS_FILE)) {
            try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')).users || []; } catch (e) {}
        }
        return users.filter(u => u.org_id === orgId && u.role === 'student').length;
    }
    try {
        const { rows } = await pool.query(
            "SELECT COUNT(*)::int as cnt FROM users WHERE org_id = $1 AND role = 'student'",
            [orgId]
        );
        return rows[0]?.cnt || 0;
    } catch (e) {
        return 0;
    }
};

// ══════════════════════════════════════════════════════════════════════════════
// 1. PUBLIC ROUTES (College Discovery & Closed Student Login)
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/college/orgs/public - List of active colleges for login selector
router.get('/orgs/public', async (req, res) => {
    try {
        let orgs = [];
        if (useMemoryDB) {
            orgs = organizationsMemoryStore;
        } else {
            const { rows } = await pool.query('SELECT id, name, code, plan, max_students FROM organizations ORDER BY name ASC');
            orgs = rows;
        }
        res.json({
            success: true,
            organizations: orgs.map(o => ({
                id: o.id,
                name: o.name,
                code: o.code,
                maxStudents: o.max_students
            }))
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch organizations' });
    }
});

// POST /api/college/login - Closed institutional student & faculty login
// Supports Roll Number, College Email, or Username
router.post('/login', async (req, res) => {
    let orgCode = req.body.orgCode || req.body.collegeCode;
    let identifier = req.body.identifier || req.body.rollNo;
    let password = req.body.password;
    if (!orgCode || !identifier || !password) {
        return res.status(400).json({ error: 'College Code, Student Roll Number / Email, and Password are required.' });
    }

    orgCode = orgCode.trim();
    identifier = identifier.trim().toLowerCase();

    try {
        const org = await getOrg(orgCode);
        if (!org) {
            return res.status(404).json({ error: `College organization with code "${orgCode}" was not found.` });
        }

        let user = null;
        if (useMemoryDB) {
            let users = [];
            if (fs.existsSync(USERS_FILE)) {
                users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')).users || [];
            }
            user = users.find(u => 
                u.org_id === org.id && (
                    (u.roll_no && u.roll_no.toLowerCase() === identifier) ||
                    (u.email && u.email.toLowerCase() === identifier) ||
                    (u.username && u.username.toLowerCase() === identifier)
                )
            );
        } else {
            const { rows } = await pool.query(`
                SELECT * FROM users
                WHERE org_id = $1 AND (
                    LOWER(roll_no) = $2 OR
                    LOWER(email) = $2 OR
                    LOWER(username) = $2
                )
                LIMIT 1
            `, [org.id, identifier]);
            user = rows[0];
            if (!user) {
                let users = [];
                if (fs.existsSync(USERS_FILE)) {
                    try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')).users || []; } catch(e){}
                }
                user = users.find(u => 
                    u.org_id === org.id && (
                        (u.roll_no && u.roll_no.toLowerCase() === identifier) ||
                        (u.email && u.email.toLowerCase() === identifier) ||
                        (u.username && u.username.toLowerCase() === identifier)
                    )
                );
            }
        }

        if (!user) {
            return res.status(404).json({
                error: 'Account not found under this institution. Please verify your Roll Number or contact your college administrator.'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect password entered.' });
        }

        const token = jwt.sign({
            id: user.id,
            username: user.username,
            role: user.role || 'student',
            org_id: org.id,
            org_name: org.name,
            org_code: org.code,
            roll_no: user.roll_no || '',
            branch: user.branch || 'ALL',
            batch: user.batch || 'ALL'
        }, JWT_SECRET, { expiresIn: '7d' });

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                name: user.name || user.username,
                role: user.role || 'student',
                orgId: org.id,
                orgName: org.name,
                orgCode: org.code,
                rollNo: user.roll_no || '',
                branch: user.branch || '',
                batch: user.batch || '',
                isTempPassword: !!user.is_temp_password,
                subscription: user.subscription || 'campus_student'
            }
        });
    } catch (err) {
        logger.error('[COLLEGE LOGIN] Error:', err);
        res.status(500).json({ error: 'Server authentication fault' });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// 2. COLLEGE ADMIN ROUTES (Coordinator Dashboard, Bulk Onboarding, Exam Mgr)
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/college/stats - Dashboard analytics & seat quota check
router.get('/stats', auth, requireCollegeAdmin, async (req, res) => {
    try {
        const orgId = req.user.org_id || 'demo_college';
        const org = await getOrg(orgId);
        if (!org) return res.status(404).json({ error: 'Organization not found' });

        const enrolledCount = await getEnrolledStudentCount(org.id);
        const maxStudents = org.max_students || 300;
        const remainingSeats = Math.max(0, maxStudents - enrolledCount);

        let activeExamsCount = 0;
        let totalExamsCount = 0;
        let totalSubmissions = 0;
        let totalViolations = 0;

        if (useMemoryDB) {
            const orgExams = collegeExamsMemoryStore.filter(e => e.org_id === org.id);
            totalExamsCount = orgExams.length;
            const now = new Date();
            activeExamsCount = orgExams.filter(e => !e.end_time || new Date(e.end_time) > now).length;
            
            const orgResults = collegeResultsMemoryStore.filter(r => r.org_id === org.id);
            totalSubmissions = orgResults.filter(r => r.status === 'submitted').length;
            totalViolations = orgResults.reduce((acc, r) => acc + (r.violations_count || 0), 0);
        } else {
            const examsRes = await pool.query(
                'SELECT COUNT(*)::int as total, COUNT(CASE WHEN end_time IS NULL OR end_time > NOW() THEN 1 END)::int as active FROM college_exams WHERE org_id = $1',
                [org.id]
            );
            totalExamsCount = examsRes.rows[0]?.total || 0;
            activeExamsCount = examsRes.rows[0]?.active || 0;

            const resRes = await pool.query(
                "SELECT COUNT(CASE WHEN status = 'submitted' THEN 1 END)::int as submissions, COALESCE(SUM(violations_count), 0)::int as violations FROM college_exam_results WHERE org_id = $1",
                [org.id]
            );
            totalSubmissions = resRes.rows[0]?.submissions || 0;
            totalViolations = resRes.rows[0]?.violations || 0;
        }

        res.json({
            success: true,
            org: {
                id: org.id,
                name: org.name,
                code: org.code,
                plan: org.plan || 'campus_enterprise',
                maxStudents,
                enrolledCount,
                remainingSeats,
                usagePercent: Math.min(100, Math.round((enrolledCount / maxStudents) * 100))
            },
            metrics: {
                totalExams: totalExamsCount,
                activeExams: activeExamsCount,
                totalSubmissions,
                totalViolations,
                avgViolationsPerSubmission: totalSubmissions > 0 ? (totalViolations / totalSubmissions).toFixed(1) : '0.0',
                publishedModules: collegeModulesMemoryStore.filter(m => m.org_id === org.id && m.is_published).length,
                totalModules: collegeModulesMemoryStore.filter(m => m.org_id === org.id).length
            }
        });
    } catch (err) {
        logger.error('[COLLEGE STATS] Error:', err);
        res.status(500).json({ error: 'Failed to retrieve college stats' });
    }
});

// POST /api/college/students/bulk - 1-Click Bulk Student Account Generator
router.post('/students/bulk', auth, requireCollegeAdmin, async (req, res) => {
    const { students } = req.body;
    if (!Array.isArray(students) || students.length === 0) {
        return res.status(400).json({ error: 'A non-empty array of students is required.' });
    }

    try {
        const orgId = req.user.org_id || 'demo_college';
        const org = await getOrg(orgId);
        if (!org) return res.status(404).json({ error: 'Organization not found' });

        const currentEnrolled = await getEnrolledStudentCount(org.id);
        const maxStudents = org.max_students || 300;
        const availableSeats = maxStudents - currentEnrolled;

        if (students.length > availableSeats) {
            return res.status(400).json({
                error: `Quota exceeded: You are trying to add ${students.length} students, but only ${availableSeats} seats remain under your ${org.plan || 'Campus'} license (${currentEnrolled}/${maxStudents} used).`
            });
        }

        const createdCredentials = [];
        const orgCodeSlug = org.code.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (useMemoryDB) {
            let usersData = { users: [] };
            if (fs.existsSync(USERS_FILE)) {
                try { usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')); } catch (e) {}
            }
            usersData.users = usersData.users || [];

            for (const item of students) {
                if (!item.rollNo || !item.name) continue;
                const rollNo = item.rollNo.toString().trim().toUpperCase();
                const name = item.name.toString().trim();
                const branch = (item.branch || 'CSE').toString().trim().toUpperCase();
                const batch = (item.batch || '2026').toString().trim();
                const initialPass = item.password || `Bright@${rollNo}`;
                const hashedPassword = await bcrypt.hash(initialPass, 10);
                const rollSlug = rollNo.toLowerCase().replace(/[^a-z0-9]/g, '');
                const username = `${orgCodeSlug}_${rollSlug}`;
                const email = item.email ? item.email.trim().toLowerCase() : `${rollSlug}@${orgCodeSlug}.edu`;

                const existingIdx = usersData.users.findIndex(u => 
                    (u.org_id === org.id && u.roll_no === rollNo) || u.username === username
                );

                const studentObj = {
                    id: existingIdx !== -1 ? usersData.users[existingIdx].id : uuidV4(),
                    username,
                    email,
                    name,
                    password: hashedPassword,
                    role: 'student',
                    org_id: org.id,
                    roll_no: rollNo,
                    branch,
                    batch,
                    is_temp_password: true,
                    subscription: 'campus_student',
                    xp: 0,
                    created_at: new Date().toISOString()
                };

                if (existingIdx !== -1) {
                    usersData.users[existingIdx] = studentObj;
                } else {
                    usersData.users.push(studentObj);
                }

                createdCredentials.push({
                    rollNo,
                    name,
                    username,
                    email,
                    initialPassword: initialPass,
                    branch,
                    batch
                });
            }

            fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
        } else {
            for (const item of students) {
                if (!item.rollNo || !item.name) continue;
                const rollNo = item.rollNo.toString().trim().toUpperCase();
                const name = item.name.toString().trim();
                const branch = (item.branch || 'CSE').toString().trim().toUpperCase();
                const batch = (item.batch || '2026').toString().trim();
                const initialPass = item.password || `Bright@${rollNo}`;
                const hashedPassword = await bcrypt.hash(initialPass, 10);
                const rollSlug = rollNo.toLowerCase().replace(/[^a-z0-9]/g, '');
                const username = `${orgCodeSlug}_${rollSlug}`;
                const email = item.email ? item.email.trim().toLowerCase() : `${rollSlug}@${orgCodeSlug}.edu`;
                const id = uuidV4();

                await pool.query(`
                    INSERT INTO users (id, username, email, password, role, org_id, roll_no, branch, batch, is_temp_password, subscription)
                    VALUES ($1, $2, $3, $4, 'student', $5, $6, $7, $8, TRUE, 'campus_student')
                    ON CONFLICT (username)
                    DO UPDATE SET
                        password = EXCLUDED.password,
                        roll_no = EXCLUDED.roll_no,
                        branch = EXCLUDED.branch,
                        batch = EXCLUDED.batch,
                        org_id = EXCLUDED.org_id
                `, [id, username, email, hashedPassword, org.id, rollNo, branch, batch]);

                createdCredentials.push({
                    rollNo,
                    name,
                    username,
                    email,
                    initialPassword: initialPass,
                    branch,
                    batch
                });
            }
        }

        const csvHeader = "Roll Number,Full Name,Username,Email,Initial Password,Branch,Batch\n";
        const csvRows = createdCredentials.map(c => 
            `"${c.rollNo}","${c.name}","${c.username}","${c.email}","${c.initialPassword}","${c.branch}","${c.batch}"`
        ).join("\n");
        const credentialsCsv = csvHeader + csvRows;

        logger.info(`[COLLEGE] Successfully provisioned ${createdCredentials.length} student accounts for ${org.name}`);

        res.json({
            success: true,
            createdCount: createdCredentials.length,
            credentials: createdCredentials,
            credentialsCsv,
            message: `Successfully provisioned ${createdCredentials.length} student accounts.`
        });
    } catch (err) {
        logger.error('[COLLEGE BULK STUDENTS] Error:', err);
        res.status(500).json({ error: 'Failed to create bulk student accounts' });
    }
});

// GET /api/college/students - Student Directory
router.get('/students', auth, requireCollegeAdmin, async (req, res) => {
    try {
        const orgId = req.user.org_id || 'demo_college';
        const { search, branch, batch } = req.query;

        let students = [];
        if (useMemoryDB) {
            let users = [];
            if (fs.existsSync(USERS_FILE)) {
                try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')).users || []; } catch (e) {}
            }
            students = users.filter(u => u.org_id === orgId && u.role === 'student');
        } else {
            const { rows } = await pool.query(
                "SELECT id, username, email, roll_no, branch, batch, created_at, is_temp_password FROM users WHERE org_id = $1 AND role = 'student' ORDER BY roll_no ASC",
                [orgId]
            );
            students = rows;
        }

        if (branch && branch !== 'ALL') {
            students = students.filter(s => s.branch === branch);
        }
        if (batch && batch !== 'ALL') {
            students = students.filter(s => s.batch === batch);
        }
        if (search) {
            const q = search.toLowerCase();
            students = students.filter(s => 
                (s.roll_no && s.roll_no.toLowerCase().includes(q)) ||
                (s.username && s.username.toLowerCase().includes(q)) ||
                (s.email && s.email.toLowerCase().includes(q))
            );
        }

        res.json({
            success: true,
            total: students.length,
            students: students.map(s => {
                const xp = s.xp || 0;
                const rankInfo = getRankLevel(xp);
                return {
                    id: s.id,
                    rollNo: s.roll_no || '',
                    username: s.username,
                    name: s.name || s.username,
                    email: s.email,
                    branch: s.branch || 'CSE',
                    batch: s.batch || '2026',
                    xp,
                    rankLevel: rankInfo.title,
                    rankBadge: rankInfo.badgeClass,
                    problemsSolved: s.problems_solved || 0,
                    streak: s.streak || 0,
                    isTempPassword: !!s.is_temp_password,
                    createdAt: s.created_at
                };
            })
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch student directory' });
    }
});

// DELETE /api/college/students/:id - Delete student / free up seat
router.delete('/students/:id', auth, requireCollegeAdmin, async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.org_id || 'demo_college';

    try {
        if (useMemoryDB) {
            let usersData = { users: [] };
            if (fs.existsSync(USERS_FILE)) {
                usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
            }
            usersData.users = (usersData.users || []).filter(u => !(u.id === id && u.org_id === orgId));
            fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
        } else {
            await pool.query("DELETE FROM users WHERE id = $1 AND org_id = $2 AND role = 'student'", [id, orgId]);
        }
        res.json({ success: true, message: 'Student account deleted and seat released.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete student account' });
    }
});

// POST /api/college/students/:id/reset-password - Reset password
router.post('/students/:id/reset-password', auth, requireCollegeAdmin, async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.org_id || 'demo_college';
    const { newPassword } = req.body;

    try {
        let rollNo = 'STUDENT';
        if (useMemoryDB) {
            let usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
            const u = usersData.users.find(x => x.id === id && x.org_id === orgId);
            if (!u) return res.status(404).json({ error: 'Student not found' });
            rollNo = u.roll_no || 'STUDENT';
            const pass = newPassword || `Bright@${rollNo}`;
            u.password = await bcrypt.hash(pass, 10);
            u.is_temp_password = true;
            fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2));
            return res.json({ success: true, newPassword: pass });
        } else {
            const { rows } = await pool.query('SELECT roll_no FROM users WHERE id = $1 AND org_id = $2', [id, orgId]);
            if (rows.length === 0) return res.status(404).json({ error: 'Student not found' });
            rollNo = rows[0].roll_no || 'STUDENT';
            const pass = newPassword || `Bright@${rollNo}`;
            const hash = await bcrypt.hash(pass, 10);
            await pool.query('UPDATE users SET password = $1, is_temp_password = TRUE WHERE id = $2', [hash, id]);
            return res.json({ success: true, newPassword: pass });
        }
    } catch (err) {
        res.status(500).json({ error: 'Failed to reset student password' });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// 3. EXAM MANAGEMENT & LIVE PROCTORING
// ══════════════════════════════════════════════════════════════════════════════

// POST /api/college/exams - Create a timed proctored exam
router.post('/exams', auth, requireCollegeAdmin, async (req, res) => {
    const { title, description, durationMinutes, startTime, endTime, targetBranch, targetBatch, questions } = req.body;
    if (!title || !durationMinutes) {
        return res.status(400).json({ error: 'Exam Title and Duration are required.' });
    }

    const orgId = req.user.org_id || 'demo_college';
    const examId = uuidV4();

    const newExam = {
        id: examId,
        org_id: orgId,
        title: title.trim(),
        description: description ? description.trim() : '',
        questions: Array.isArray(questions) ? questions : [],
        duration_minutes: parseInt(durationMinutes) || 60,
        start_time: startTime ? new Date(startTime).toISOString() : new Date().toISOString(),
        end_time: endTime ? new Date(endTime).toISOString() : null,
        target_branch: (targetBranch || 'ALL').toUpperCase(),
        target_batch: (targetBatch || 'ALL').toUpperCase(),
        status: 'published',
        created_by: req.user.username || 'admin',
        created_at: new Date().toISOString()
    };

    try {
        if (useMemoryDB) {
            collegeExamsMemoryStore.push(newExam);
            saveExams();
        } else {
            await pool.query(`
                INSERT INTO college_exams (id, org_id, title, description, questions, duration_minutes, start_time, end_time, target_branch, target_batch, status, created_by)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            `, [
                newExam.id, newExam.org_id, newExam.title, newExam.description,
                JSON.stringify(newExam.questions), newExam.duration_minutes,
                newExam.start_time, newExam.end_time, newExam.target_branch,
                newExam.target_batch, newExam.status, newExam.created_by
            ]);
        }

        res.status(201).json({ success: true, exam: newExam });
    } catch (err) {
        logger.error('[COLLEGE CREATE EXAM] Error:', err);
        res.status(500).json({ error: 'Failed to create exam' });
    }
});

// GET /api/college/exams - List all exams for the college
router.get('/exams', auth, async (req, res) => {
    const orgId = req.user.org_id || 'demo_college';
    try {
        let exams = [];
        if (useMemoryDB) {
            exams = collegeExamsMemoryStore.filter(e => e.org_id === orgId);
        } else {
            const { rows } = await pool.query('SELECT * FROM college_exams WHERE org_id = $1 ORDER BY created_at DESC', [orgId]);
            exams = rows.map(r => ({
                ...r,
                questions: typeof r.questions === 'string' ? JSON.parse(r.questions) : r.questions
            }));
        }
        res.json({ success: true, exams });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exams' });
    }
});

// GET /api/college/exams/:id/live - Live Proctoring Grid
router.get('/exams/:id/live', auth, requireCollegeAdmin, async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.org_id || 'demo_college';

    try {
        let results = [];
        if (useMemoryDB) {
            results = collegeResultsMemoryStore.filter(r => r.exam_id === id && r.org_id === orgId);
        } else {
            const { rows } = await pool.query('SELECT * FROM college_exam_results WHERE exam_id = $1 AND org_id = $2', [id, orgId]);
            results = rows;
        }

        res.json({
            success: true,
            examId: id,
            activeCount: results.filter(r => r.status === 'in_progress').length,
            submittedCount: results.filter(r => r.status === 'submitted').length,
            flaggedCount: results.filter(r => (r.violations_count || 0) >= 3).length,
            participants: results.map(r => ({
                userId: r.user_id,
                rollNo: r.roll_no,
                name: r.name,
                status: r.status,
                score: r.score,
                violationsCount: r.violations_count || 0,
                submittedAt: r.submitted_at
            }))
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch live exam monitor' });
    }
});

// GET /api/college/exams/:id/results - Completed Results & 1-Click Excel CSV
router.get('/exams/:id/results', auth, requireCollegeAdmin, async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.org_id || 'demo_college';

    try {
        let exam = null;
        let results = [];

        if (useMemoryDB) {
            exam = collegeExamsMemoryStore.find(e => e.id === id && e.org_id === orgId);
            results = collegeResultsMemoryStore.filter(r => r.exam_id === id && r.org_id === orgId);
        } else {
            const exRes = await pool.query('SELECT * FROM college_exams WHERE id = $1 AND org_id = $2', [id, orgId]);
            exam = exRes.rows[0];
            const { rows } = await pool.query('SELECT * FROM college_exam_results WHERE exam_id = $1 AND org_id = $2 ORDER BY score DESC, violations_count ASC', [id, orgId]);
            results = rows;
        }

        if (!exam) return res.status(404).json({ error: 'Exam not found' });

        const csvHeader = "Roll Number,Student Name,Score,Max Score,Problems Solved,Violations (Tab Switches),Status,Submission Time\n";
        const csvRows = results.map(r => 
            `"${r.roll_no || ''}","${r.name || ''}",${r.score || 0},${r.max_score || 100},${r.problems_solved || 0},${r.violations_count || 0},"${r.status || 'in_progress'}","${r.submitted_at || 'Not submitted'}"`
        ).join("\n");
        const resultsCsv = csvHeader + csvRows;

        res.json({
            success: true,
            exam: {
                id: exam.id,
                title: exam.title,
                durationMinutes: exam.duration_minutes
            },
            totalSubmissions: results.length,
            results,
            resultsCsv
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exam results' });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// 4. STUDENT PORTAL ROUTES (Assigned Exams, Live Taking, Proctoring Submissions)
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/college/my-exams - Student's assigned institutional tests
router.get('/my-exams', auth, requireStudent, async (req, res) => {
    const orgId = req.user.org_id;
    const branch = (req.user.branch || 'CSE').toUpperCase();

    try {
        let exams = [];
        if (useMemoryDB) {
            exams = collegeExamsMemoryStore.filter(e => 
                e.org_id === orgId && 
                (e.target_branch === 'ALL' || e.target_branch === branch)
            );
        } else {
            const { rows } = await pool.query(`
                SELECT * FROM college_exams
                WHERE org_id = $1 AND (target_branch = 'ALL' OR target_branch = $2)
                ORDER BY created_at DESC
            `, [orgId, branch]);
            exams = rows.map(r => ({
                ...r,
                questions: typeof r.questions === 'string' ? JSON.parse(r.questions) : r.questions
            }));
        }

        const studentResults = useMemoryDB 
            ? collegeResultsMemoryStore.filter(r => r.user_id === req.user.id)
            : (await pool.query('SELECT exam_id, score, status, violations_count, submitted_at FROM college_exam_results WHERE user_id = $1', [req.user.id])).rows;

        const resultsMap = new Map();
        studentResults.forEach(r => resultsMap.set(r.exam_id, r));

        const enrichedExams = exams.map(e => ({
            id: e.id,
            title: e.title,
            description: e.description,
            durationMinutes: e.duration_minutes,
            questionsCount: Array.isArray(e.questions) ? e.questions.length : 0,
            startTime: e.start_time,
            endTime: e.end_time,
            targetBranch: e.target_branch,
            myResult: resultsMap.get(e.id) || null
        }));

        res.json({ success: true, exams: enrichedExams });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch student exams' });
    }
});

// GET /api/college/exams/:id - Get exam questions for starting test
router.get('/exams/:id', auth, requireStudent, async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.org_id;

    try {
        let exam = null;
        if (useMemoryDB) {
            exam = collegeExamsMemoryStore.find(e => e.id === id && e.org_id === orgId);
        } else {
            const { rows } = await pool.query('SELECT * FROM college_exams WHERE id = $1 AND org_id = $2', [id, orgId]);
            exam = rows[0];
            if (exam) {
                exam.questions = typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions;
            }
        }

        if (!exam) return res.status(404).json({ error: 'Exam not found or not assigned to your institution' });

        res.json({
            success: true,
            exam: {
                id: exam.id,
                title: exam.title,
                description: exam.description,
                durationMinutes: exam.duration_minutes,
                questions: exam.questions || [],
                startTime: exam.start_time,
                endTime: exam.end_time
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch exam details' });
    }
});

// POST /api/college/exams/:id/start - Student starts the exam
router.post('/exams/:id/start', auth, requireStudent, async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.org_id;
    const userId = req.user.id;
    const rollNo = req.user.roll_no || req.user.username;
    const name = req.user.name || req.user.username;

    try {
        const resultId = uuidV4();
        if (useMemoryDB) {
            const existing = collegeResultsMemoryStore.find(r => r.exam_id === id && r.user_id === userId);
            if (!existing) {
                collegeResultsMemoryStore.push({
                    id: resultId,
                    exam_id: id,
                    user_id: userId,
                    org_id: orgId,
                    roll_no: rollNo,
                    name,
                    score: 0,
                    max_score: 100,
                    problems_solved: 0,
                    violations_count: 0,
                    status: 'in_progress',
                    created_at: new Date().toISOString()
                });
                saveResults();
            }
        } else {
            await pool.query(`
                INSERT INTO college_exam_results (id, exam_id, user_id, org_id, roll_no, name, status)
                VALUES ($1, $2, $3, $4, $5, $6, 'in_progress')
                ON CONFLICT (exam_id, user_id) DO NOTHING
            `, [resultId, id, userId, orgId, rollNo, name]);
        }

        res.json({ success: true, message: 'Exam attempt started with anti-cheating tracking.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to start exam session' });
    }
});

// POST /api/college/exams/:id/violation - Record anti-cheat violation (tab switch, window exit)
router.post('/exams/:id/violation', auth, requireStudent, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    try {
        if (useMemoryDB) {
            const r = collegeResultsMemoryStore.find(x => x.exam_id === id && x.user_id === userId);
            if (r) {
                r.violations_count = (r.violations_count || 0) + 1;
                saveResults();
            }
        } else {
            await pool.query(`
                UPDATE college_exam_results
                SET violations_count = violations_count + 1
                WHERE exam_id = $1 AND user_id = $2
            `, [id, userId]);
        }

        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to record violation' });
    }
});

// POST /api/college/exams/:id/submit - Submit exam solutions and compute score
router.post('/exams/:id/submit', auth, requireStudent, async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const { submissions } = req.body;

    try {
        let exam = null;
        if (useMemoryDB) {
            exam = collegeExamsMemoryStore.find(e => e.id === id);
        } else {
            const { rows } = await pool.query('SELECT * FROM college_exams WHERE id = $1', [id]);
            exam = rows[0];
            if (exam) exam.questions = typeof exam.questions === 'string' ? JSON.parse(exam.questions) : exam.questions;
        }

        const questions = exam?.questions || [];
        let totalScore = 0;
        let problemsSolved = 0;
        const details = {};

        for (const q of questions) {
            const sub = (submissions || []).find(s => s.questionId === q.id || s.questionId === q.title);
            if (sub && sub.code) {
                const testCases = q.testCases || q.test_cases || [
                    { input: "1", expectedOutput: "1" }
                ];
                try {
                    const execResult = await executeCode(sub.code, sub.language || 'javascript', testCases);
                    const passed = execResult.testsPassed || 0;
                    const total = testCases.length;
                    const questionScore = total > 0 ? Math.round((passed / total) * (100 / Math.max(1, questions.length))) : 0;
                    totalScore += questionScore;
                    if (passed === total) problemsSolved++;

                    details[q.id || q.title] = {
                        passed,
                        total,
                        score: questionScore,
                        code: sub.code
                    };
                } catch (e) {
                    details[q.id || q.title] = { passed: 0, total: testCases.length, score: 0, error: e.message };
                }
            }
        }

        const finalScore = Math.min(100, totalScore);

        if (useMemoryDB) {
            const r = collegeResultsMemoryStore.find(x => x.exam_id === id && x.user_id === userId);
            if (r) {
                r.score = finalScore;
                r.problems_solved = problemsSolved;
                r.status = 'submitted';
                r.submitted_at = new Date().toISOString();
                r.details = details;
                saveResults();
            }
        } else {
            await pool.query(`
                UPDATE college_exam_results
                SET score = $1, problems_solved = $2, status = 'submitted', submitted_at = NOW(), details = $3
                WHERE exam_id = $4 AND user_id = $5
            `, [finalScore, problemsSolved, JSON.stringify(details), id, userId]);
        }

        res.json({
            success: true,
            score: finalScore,
            problemsSolved,
            totalProblems: questions.length,
            message: 'Exam submitted successfully! Results recorded for college evaluation.'
        });
    } catch (err) {
        logger.error('[COLLEGE EXAM SUBMIT] Error:', err);
        res.status(500).json({ error: 'Failed to submit exam' });
    }
});

// ══════════════════════════════════════════════════════════════════════════════
// 5. FACULTY PRACTICE ASSIGNMENTS & LAB SHEETS (Library Integration)
// ══════════════════════════════════════════════════════════════════════════════

// GET /api/college/assignments - List Faculty-Curated Practice Lab Sheets
router.get('/assignments', auth, async (req, res) => {
    const orgId = req.user.org_id || 'demo_college';
    const branch = (req.user.branch || 'ALL').toUpperCase();
    const isCoordinator = req.user.role === 'college_admin' || req.user.role === 'super_admin';

    try {
        let list = [];
        if (useMemoryDB) {
            list = collegeAssignmentsMemoryStore.filter(a => 
                a.org_id === orgId && 
                (isCoordinator || a.target_branch === 'ALL' || a.target_branch === branch)
            );
        } else {
            const { rows } = await pool.query(
                `SELECT * FROM college_assignments WHERE org_id = $1 AND ($2::boolean = true OR target_branch = 'ALL' OR target_branch = $3) ORDER BY created_at DESC`,
                [orgId, isCoordinator, branch]
            );
            list = rows.map(r => ({
                ...r,
                problems: typeof r.problems === 'string' ? JSON.parse(r.problems) : r.problems
            }));
        }

        res.json({ success: true, assignments: list });
    } catch (err) {
        logger.error('[COLLEGE ASSIGNMENTS] Error:', err);
        res.status(500).json({ error: 'Failed to fetch lab sheet assignments' });
    }
});

// POST /api/college/assignments - Faculty publishes a new curated practice lab sheet
router.post('/assignments', auth, requireCollegeAdmin, async (req, res) => {
    const { title, description, targetBranch, targetBatch, dueDate, problems } = req.body;
    const orgId = req.user.org_id || 'demo_college';

    if (!title || !problems || problems.length === 0) {
        return res.status(400).json({ error: 'Title and at least one problem are required.' });
    }

    try {
        const newAssignment = {
            id: `asgn_${uuidV4().slice(0, 8)}`,
            org_id: orgId,
            title: title.trim(),
            description: description?.trim() || '',
            target_branch: (targetBranch || 'ALL').toUpperCase(),
            target_batch: targetBatch || '2026',
            created_by: req.user.id,
            due_date: dueDate || null,
            created_at: new Date().toISOString(),
            problems: Array.isArray(problems) ? problems : []
        };

        if (useMemoryDB) {
            collegeAssignmentsMemoryStore.unshift(newAssignment);
            saveAssignments();
        } else {
            await pool.query(`
                INSERT INTO college_assignments (id, org_id, title, description, target_branch, target_batch, created_by, due_date, problems)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            `, [newAssignment.id, newAssignment.org_id, newAssignment.title, newAssignment.description, newAssignment.target_branch, newAssignment.target_batch, newAssignment.created_by, newAssignment.due_date, JSON.stringify(newAssignment.problems)]);
        }

        logger.info(`[COLLEGE] Published new lab assignment "${newAssignment.title}" for ${orgId}`);
        res.json({ success: true, assignment: newAssignment });
    } catch (err) {
        logger.error('[COLLEGE CREATE ASSIGNMENT] Error:', err);
        res.status(500).json({ error: 'Failed to create lab assignment' });
    }
});

// DELETE /api/college/assignments/:id - Delete a lab sheet
router.delete('/assignments/:id', auth, requireCollegeAdmin, async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.org_id || 'demo_college';

    try {
        if (useMemoryDB) {
            collegeAssignmentsMemoryStore = collegeAssignmentsMemoryStore.filter(a => !(a.id === id && a.org_id === orgId));
            saveAssignments();
        } else {
            await pool.query('DELETE FROM college_assignments WHERE id = $1 AND org_id = $2', [id, orgId]);
        }

        res.json({ success: true, message: 'Lab sheet assignment removed.' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete assignment' });
    }
});


// ── Campus Leaderboard ──────────────────────────────────────────────────────
router.get('/leaderboard', auth, requireCollegeAdmin, async (req, res) => {
    try {
        const orgId = req.user.org_id || 'demo_college';
        const { branch, batch } = req.query;

        let students = [];
        if (useMemoryDB) {
            let users = [];
            if (fs.existsSync(USERS_FILE)) {
                try { users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf8')).users || []; } catch (e) {}
            }
            students = users.filter(u => u.org_id === orgId && u.role === 'student');
        } else {
            const { rows } = await pool.query(
                "SELECT id, username, email, roll_no, branch, batch, xp, problems_solved, streak, name FROM users WHERE org_id = $1 AND role = 'student'",
                [orgId]
            );
            students = rows;
        }

        if (branch && branch !== 'ALL') students = students.filter(s => s.branch === branch);
        if (batch && batch !== 'ALL') students = students.filter(s => s.batch === batch);

        // Sort descending by XP, then problems solved
        students.sort((a, b) => (b.xp || 0) - (a.xp || 0) || (b.problems_solved || 0) - (a.problems_solved || 0));

        const leaderboard = students.map((s, index) => {
            const xp = s.xp || 0;
            const rankInfo = getRankLevel(xp);
            return {
                rank: index + 1,
                id: s.id,
                rollNo: s.roll_no || '',
                username: s.username,
                name: s.name || s.username,
                email: s.email,
                branch: s.branch || 'CSE',
                batch: s.batch || '2026',
                xp,
                rankLevel: rankInfo.title,
                rankBadge: rankInfo.badgeClass,
                problemsSolved: s.problems_solved || 0,
                streak: s.streak || 0
            };
        });

        res.json({
            success: true,
            total: leaderboard.length,
            leaderboard
        });
    } catch (err) {
        logger.error('[COLLEGE LEADERBOARD] Error:', err);
        res.status(500).json({ error: 'Failed to retrieve college leaderboard' });
    }
});

// ── Faculty Curriculum & Library Studio Endpoints ───────────────────────────

// GET /api/college/library/modules - Faculty lists all modules (drafts + published)
router.get('/library/modules', auth, requireCollegeAdmin, async (req, res) => {
    try {
        const orgId = req.user.org_id || 'demo_college';
        const modules = collegeModulesMemoryStore.filter(m => m.org_id === orgId);
        res.json({ success: true, count: modules.length, modules });
    } catch (err) {
        logger.error('[COLLEGE GET MODULES] Error:', err);
        res.status(500).json({ error: 'Failed to fetch library modules' });
    }
});

// POST /api/college/library/modules - Faculty creates new module
router.post('/library/modules', auth, requireCollegeAdmin, async (req, res) => {
    try {
        const orgId = req.user.org_id || 'demo_college';
        const { title, description, category, color, icon, target_branch, target_batch, topics, isPublished } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Module title is required' });
        }

        const newModule = {
            id: 'mod_' + uuidV4().substring(0, 8),
            org_id: orgId,
            title: title.trim(),
            description: (description || '').trim(),
            category: category || 'Computer Science',
            color: color || '#ef4444',
            icon: icon || 'BookOpen',
            target_branch: target_branch || 'ALL',
            target_batch: target_batch || 'ALL',
            created_by: req.user.id || 'faculty',
            is_published: !!isPublished,
            created_at: new Date().toISOString(),
            published_at: isPublished ? new Date().toISOString() : null,
            topics: Array.isArray(topics) ? topics : []
        };

        collegeModulesMemoryStore.unshift(newModule);
        saveModules();

        logger.info(`[COLLEGE] Created new library module "${newModule.title}" (${newModule.is_published ? 'PUBLISHED' : 'DRAFT'})`);
        res.json({ success: true, module: newModule });
    } catch (err) {
        logger.error('[COLLEGE CREATE MODULE] Error:', err);
        res.status(500).json({ error: 'Failed to create library module' });
    }
});

// PUT /api/college/library/modules/:id - Faculty updates existing module
router.put('/library/modules/:id', auth, requireCollegeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.org_id || 'demo_college';
        const modIndex = collegeModulesMemoryStore.findIndex(m => m.id === id && m.org_id === orgId);

        if (modIndex === -1) {
            return res.status(404).json({ error: 'Module not found' });
        }

        const existing = collegeModulesMemoryStore[modIndex];
        const { title, description, category, color, icon, target_branch, target_batch, topics, isPublished } = req.body;

        const updatedModule = {
            ...existing,
            title: title !== undefined ? title.trim() : existing.title,
            description: description !== undefined ? description.trim() : existing.description,
            category: category || existing.category,
            color: color || existing.color,
            icon: icon || existing.icon,
            target_branch: target_branch || existing.target_branch,
            target_batch: target_batch || existing.target_batch,
            topics: Array.isArray(topics) ? topics : existing.topics,
            is_published: isPublished !== undefined ? !!isPublished : existing.is_published,
            published_at: (isPublished && !existing.is_published) ? new Date().toISOString() : existing.published_at,
            updated_at: new Date().toISOString()
        };

        collegeModulesMemoryStore[modIndex] = updatedModule;
        saveModules();

        res.json({ success: true, module: updatedModule });
    } catch (err) {
        logger.error('[COLLEGE UPDATE MODULE] Error:', err);
        res.status(500).json({ error: 'Failed to update library module' });
    }
});

// PATCH /api/college/library/modules/:id/publish - Toggle publish state
router.patch('/library/modules/:id/publish', auth, requireCollegeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.org_id || 'demo_college';
        const mod = collegeModulesMemoryStore.find(m => m.id === id && m.org_id === orgId);

        if (!mod) {
            return res.status(404).json({ error: 'Module not found' });
        }

        const targetState = req.body.isPublished !== undefined ? !!req.body.isPublished : !mod.is_published;
        mod.is_published = targetState;
        mod.published_at = targetState ? new Date().toISOString() : null;
        mod.updated_at = new Date().toISOString();
        saveModules();

        logger.info(`[COLLEGE] Module "${mod.title}" is now ${mod.is_published ? 'PUBLISHED' : 'UNPUBLISHED'}`);
        res.json({ success: true, is_published: mod.is_published, module: mod });
    } catch (err) {
        logger.error('[COLLEGE PUBLISH MODULE] Error:', err);
        res.status(500).json({ error: 'Failed to update module publish status' });
    }
});

// DELETE /api/college/library/modules/:id - Faculty deletes module
router.delete('/library/modules/:id', auth, requireCollegeAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const orgId = req.user.org_id || 'demo_college';

        const beforeCount = collegeModulesMemoryStore.length;
        collegeModulesMemoryStore = collegeModulesMemoryStore.filter(m => !(m.id === id && m.org_id === orgId));

        if (collegeModulesMemoryStore.length === beforeCount) {
            return res.status(404).json({ error: 'Module not found' });
        }

        saveModules();
        res.json({ success: true, message: 'Library module removed' });
    } catch (err) {
        logger.error('[COLLEGE DELETE MODULE] Error:', err);
        res.status(500).json({ error: 'Failed to delete library module' });
    }
});

// GET /api/college/student/library-modules - Student gets published modules for their college
router.get('/student/library-modules', auth, async (req, res) => {
    try {
        const orgId = req.user.org_id;
        if (!orgId) {
            return res.json({ success: true, isCollegeStudent: false, modules: [] });
        }

        const studentBranch = req.user.branch || 'ALL';
        const studentBatch = req.user.batch || 'ALL';

        // Only return published modules targeting student's branch/batch
        const modules = collegeModulesMemoryStore.filter(m => {
            if (m.org_id !== orgId || !m.is_published) return false;
            if (m.target_branch && m.target_branch !== 'ALL' && studentBranch !== 'ALL' && m.target_branch !== studentBranch) return false;
            if (m.target_batch && m.target_batch !== 'ALL' && studentBatch !== 'ALL' && m.target_batch !== studentBatch) return false;
            return true;
        });

        res.json({
            success: true,
            isCollegeStudent: true,
            orgId,
            count: modules.length,
            modules
        });
    } catch (err) {
        logger.error('[COLLEGE STUDENT MODULES] Error:', err);
        res.status(500).json({ error: 'Failed to fetch college curriculum modules' });
    }
});

module.exports = router;
