require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const { v4: uuidV4 } = require('uuid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');
const pty = require('node-pty');
const os = require('os');
const FileSystem = require('./fileSystem');
const { saveRoomState, loadRoomState, deleteRoomState, deleteRoomFiles } = require('./workspacePersistence');
const { compileAndRunJava } = require('./javaCompiler');
const CodeWarsArena = require('./codeWarsArena');
const IntraFactionArena = require('./intraFactionArena');
const rateLimiter = require('./utils/rateLimiter');
const chatbotAPI = require('./chatbotAPI');
const questionsAPI = require('./questionsAPI');
const proctorAPI = require('./proctorAPI');
const contributeAPI = require('./contributeAPI');
const { injectIntoQuestionsDB } = require('./localQuestionsLoader');
const ProctorSocket = require('./proctorSocket');
const logger = require('./logger');

const { pool, useMemoryDB: dbMemoryMode } = require('./db');
let useMemoryDB = dbMemoryMode;

const FRONTEND_URL = process.env.FRONTEND_URL || '*';
const JWT_SECRET = process.env.JWT_SECRET || 'brightcode_secret_key_123';

const app = express();
const server = http.createServer(app);

// Configure Socket.io with PostgreSQL adapter for multi-instance support
let io;
if (process.env.NODE_ENV === 'production' && pool) {
    const { createAdapter } = require('@socket.io/postgres-adapter');

    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                const allowedOrigins = [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:3000'];
                if (!origin || allowedOrigins.includes(origin) || FRONTEND_URL === '*') {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        allowUpgrades: true,
        pingTimeout: 60000,
        pingInterval: 25000,
        adapter: createAdapter(pool),
    });
    logger.info('[SOCKET] Using PostgreSQL adapter for multi-instance support (FREE)');
} else {
    io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                const allowedOrigins = [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:3000'];
                if (!origin || allowedOrigins.includes(origin) || FRONTEND_URL === '*') {
                    callback(null, true);
                } else {
                    callback(new Error('Not allowed by CORS'));
                }
            },
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            credentials: true,
        },
        transports: ['websocket', 'polling'],
        allowUpgrades: true,
        pingTimeout: 60000,
        pingInterval: 25000,
    });
    logger.info('[SOCKET] Using in-memory adapter (single instance)');
}

// Chat History Store: roomId -> Array of messages
const roomMessages = new Map();

// Interactive Terminal Store: roomId -> ptyProcess
const roomTerminals = new Map();
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash';

app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = [FRONTEND_URL, 'http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:5177', 'http://localhost:3000'];
        if (!origin || allowedOrigins.includes(origin) || FRONTEND_URL === '*') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express.json({ limit: '20mb' }));

// ── Mount Chatbot API ───────────────────────────────────────
app.use('/api/chat', chatbotAPI);

// ── Mount Questions API ─────────────────────────────────────
app.use('/api/questions', questionsAPI);

// ── Mount Proctor API ───────────────────────────────────────
app.use('/api/proctor', proctorAPI);

// ── Mount Contribute API ────────────────────────────────────
app.use('/api/contribute', contributeAPI);

// Memory Fallback (for when PostgreSQL is offline)
let memoryStore = { users: [] };

// In-memory CodeVault store (used when PostgreSQL is unavailable)
let notesMemoryStore = [];
let foldersMemoryStore = [];
const { v4: uuidV4Notes } = require('uuid');
const DB_FILE = path.join(__dirname, 'users_db.json');
const NOTES_DB_FILE = path.join(__dirname, 'notes_db.json');

const loadNotesStore = () => {
    if (fs.existsSync(NOTES_DB_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(NOTES_DB_FILE, 'utf8'));
            notesMemoryStore.push(...(data.notes || []));
            foldersMemoryStore.push(...(data.folders || []));
            logger.info(`[NOTES PERSISTENCE] Loaded ${notesMemoryStore.length} notes and ${foldersMemoryStore.length} folders from notes_db.json`);
        } catch (e) {
            logger.error('[NOTES PERSISTENCE] Error loading notes DB file:', e);
        }
    }
};

const saveNotesStore = () => {
    try {
        fs.writeFileSync(NOTES_DB_FILE, JSON.stringify({ notes: notesMemoryStore, folders: foldersMemoryStore }, null, 2));
    } catch (e) {
        logger.error('[NOTES PERSISTENCE] Error saving notes DB file:', e);
    }
};

const normalizeMemoryUser = (user) => {
    if (!user) return user;
    if (user.bio === undefined) user.bio = '';
    if (!Array.isArray(user.stack)) user.stack = [];
    if (!user.created_at && user.joinedAt) user.created_at = user.joinedAt;
    if (!user.joinedAt && user.created_at) user.joinedAt = user.created_at;
    if (user.username === 'admin') {
        user.subscription = 'elite';
    } else if (user.subscription === undefined) {
        user.subscription = 'basic';
    }
    return user;
};

const loadStore = () => {
    if (fs.existsSync(DB_FILE)) {
        try {
            memoryStore = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            memoryStore.users = (memoryStore.users || []).map(normalizeMemoryUser);
            logger.info(`[PERSISTENCE] Loaded ${memoryStore.users.length} users from users_db.json`);
        } catch (e) {
            logger.error('[PERSISTENCE] Error loading memory DB file:', e);
        }
    }
};

const saveStore = () => {
    if (!useMemoryDB) return;
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2));
    } catch (e) {
        logger.error('[PERSISTENCE] Error saving memory DB file:', e);
    }
};

// ── Persistent Factions Store ────────────────────────────────
const FACTIONS_FILE = path.join(__dirname, 'factions_db.json');
const factions = new Map();

const loadFactions = () => {
    if (fs.existsSync(FACTIONS_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(FACTIONS_FILE, 'utf8'));
            (data || []).forEach(f => factions.set(f.id, f));
            logger.info(`[FACTIONS] Loaded ${factions.size} factions from factions_db.json`);
        } catch (e) { logger.error('[FACTIONS] Load error:', e); }
    }
};

const saveFactions = () => {
    try {
        fs.writeFileSync(FACTIONS_FILE, JSON.stringify(Array.from(factions.values()), null, 2));
    } catch (e) { logger.error('[FACTIONS] Save error:', e); }
};

loadFactions();

// ── Initialize Code Wars Arena ──────────────────────────────────────────────
const codeWarsArena = new CodeWarsArena(io, factions);
const intraFactionArena = new IntraFactionArena(io, factions, memoryStore, useMemoryDB);
const proctorSocket = new ProctorSocket(io);

// ── Inject local GFG questions into the question pool ──────────────────────
// Must be done after questionsAPI mounts (which loads questionsDB from file).
// We pull questionsDB directly from seedQuestions and prepend our 24 questions.
{
    const { questionsDB } = require('./seedQuestions');
    const injected = injectIntoQuestionsDB(questionsDB);
    logger.info(`[STARTUP] ✅ ${injected} local GFG questions injected into question pool`);
}

// Prefetch popular LeetCode problems on server start
// const { prefetchLeetCodeProblems } = require('./codeWarQuestions');
// prefetchLeetCodeProblems().then(() => {
//     console.log('[LEETCODE] Prefetch complete - ready for battles!');
// }).catch(err => {
//     console.error('[LEETCODE] Prefetch failed:', err.message);
// });

// ── XP → Level computation (matches client-side) ─────────────
const computeLevel = (xp) => {
    if (xp >= 10000) return 'Grandmaster';
    if (xp >= 5000) return 'Expert';
    if (xp >= 2000) return 'Advanced';
    if (xp >= 500) return 'Apprentice';
    return 'Novice';
};

const getLocalDateKey = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
};

const computeStreakFromActivity = (activity = {}) => {
    if (!activity || typeof activity !== 'object') return 0;

    const activeDates = new Set(
        Object.entries(activity)
            .filter(([, value]) => Number(value || 0) > 0)
            .map(([date]) => date)
    );
    if (activeDates.size === 0) return 0;

    const today = new Date();
    const cursor = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    let streak = 0;

    while (true) {
        const y = cursor.getFullYear();
        const m = String(cursor.getMonth() + 1).padStart(2, '0');
        const d = String(cursor.getDate()).padStart(2, '0');
        const key = `${y}-${m}-${d}`;
        if (!activeDates.has(key)) break;
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
    }

    return streak;
};

// Initialize Database
const initDB = async () => {
    if (!pool || useMemoryDB) {
        logger.warn('[DB] Skipping database initialization — no pool or memory mode active');
        return;
    }
    try {
        logger.info('[DB] Starting database initialization...');
        
        // Create users table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                xp INTEGER DEFAULT 0,
                css_level INTEGER DEFAULT 0,
                logic_level INTEGER DEFAULT 0,
                react_level INTEGER DEFAULT 0,
                mern_level INTEGER DEFAULT 0,
                java_level INTEGER DEFAULT 0,
                cpp_level INTEGER DEFAULT 0,
                python_level INTEGER DEFAULT 0,
                go_level INTEGER DEFAULT 0,
                level TEXT DEFAULT 'Apprentice',
                activity JSONB DEFAULT '{}',
                created_count INTEGER DEFAULT 0,
                joined_count INTEGER DEFAULT 0,
                avatar TEXT,
                bio TEXT DEFAULT '',
                stack JSONB DEFAULT '[]',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        try {
            await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS session_id TEXT;');
        } catch (e) {
            logger.warn('[DB] Note: Could not add session_id column, it may already exist or there was an error.');
        }

        try {
            await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT;');
            await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS github_id TEXT;');
        } catch (e) {
            logger.warn('[DB] Note: Could not add google_id/github_id columns.');
        }

        try {
            await pool.query("ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription TEXT DEFAULT 'basic';");
        } catch (e) {
            logger.warn('[DB] Note: Could not add subscription column.');
        }

        logger.info('[DB] ✅ Users table created');

        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS contributed_problems (
                    id TEXT PRIMARY KEY,
                    title TEXT NOT NULL,
                    difficulty TEXT NOT NULL,
                    category TEXT DEFAULT 'algorithms',
                    tags JSONB DEFAULT '[]',
                    description TEXT NOT NULL,
                    starter_code TEXT DEFAULT '',
                    test_cases JSONB DEFAULT '[]',
                    contributor_id TEXT NOT NULL,
                    contributor_username TEXT NOT NULL,
                    status TEXT DEFAULT 'pending',
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
                );
            `);
            logger.info('[DB] ✅ Contributed problems table created');
        } catch (e) {
            logger.warn('[DB] Note: Could not create contributed_problems table:', e.message);
        }
        
        // Initialize CodeVault notes and folders tables (we'll handle migrations manually for now)
        logger.info('[DB] PostgreSQL Tables Initialized');
        logger.info('[DB] Database initialization complete!');
    } catch (err) {
        logger.error('DATABASE INIT ERROR:', err);
        logger.error('Full error:', err.stack);
        logger.warn('--- SWAPPING TO MEMORY FALLBACK MODE (USING PERSISTENT users_db.json + notes_db.json) ---');
        useMemoryDB = true;
        loadStore();
        loadNotesStore();
    }
};
initDB();

// --- AUTHENTICATION REWRITE ---
const otps = new Map(); // Store OTPs: email -> { otp, userData, expires }

// Use SMTP (nodemailer) for email service
logger.info("[MAIL] SMTP_USER present:", { present: !!process.env.SMTP_USER });
let transporter = null;
const smtpUser = process.env.SMTP_USER || '';
const smtpPass = process.env.SMTP_PASS || '';

if (smtpUser && smtpPass) {
    logger.info(`[MAIL] Attempting connection for: ${smtpUser}`);
    transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, // use SSL
        auth: {
            user: smtpUser,
            pass: smtpPass
        },
        connectionTimeout: 20000,
        greetingTimeout: 20000,
        socketTimeout: 20000
    });
    transporter.verify(function (error, success) {
        if (error) {
            logger.error("[MAIL] Connection Error:", error);
        } else {
            logger.info("[MAIL] Server is ready to take our messages");
        }
    });
} else {
    logger.warn("[MAIL] SMTP credentials not configured. Email features will not work.");
}

app.post('/support', async (req, res) => {
    const { email, subject, message, username } = req.body;

    if (!email || !message) {
        return res.status(400).json({ error: 'Email and message are required' });
    }

    try {
        if (!transporter) {
            throw new Error('SMTP email service not configured');
        }

        const mailOptions = {
            from: '"BrightCode Support" <codebrightlim@gmail.com>',
            to: 'codebrightlim@gmail.com',
            subject: `[SUPPORT INQUIRY] ${subject || 'New Message'}`,
            html: `
                <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb; background: #000; color: #fff;">
                    <h2 style="color: #ef4444; text-align: center; border-bottom: 2px solid #ef4444; padding-bottom: 10px;">Support Inquiry</h2>
                    <div style="padding: 20px;">
                        <p style="margin-bottom: 10px;"><strong style="color: #ef4444;">From:</strong> ${username || 'User'} (${email})</p>
                        <p style="margin-bottom: 10px;"><strong style="color: #ef4444;">Subject:</strong> ${subject || 'No Subject'}</p>
                        <div style="background: #111; padding: 15px; border-radius: 8px; border: 1px solid #333; margin-top: 20px;">
                            <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
                        </div>
                    </div>
                    <hr style="border: none; border-top: 1px solid #333; margin: 20px 0;">
                    <p style="text-align: center; color: #666; font-size: 12px;">&copy; 2026 BrightCode Command Center.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: "Your message has been sent to our support team." });
    } catch (err) {
        logger.error('SUPPORT MAIL ERROR:', err);
        res.status(500).json({ error: 'Failed to send support message' });
    }
});

// ── Health Check (used by Render deployment) ────────────────────────────────
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Standard response helper
const sendError = (res, status, message, details = null) => {
    return res.status(status).json({ error: message, details });
};

// ── Username Availability Check ────────────────────────────────────────────
app.get('/check-username', async (req, res) => {
    const { username } = req.query;
    if (!username || username.trim().length < 3) {
        return res.json({ available: false, reason: 'Username must be at least 3 characters' });
    }
    const clean = username.trim().toLowerCase();
    // Basic format validation
    if (!/^[a-z0-9_]+$/.test(clean)) {
        return res.json({ available: false, reason: 'Only letters, numbers, and underscores allowed' });
    }
    try {
        if (useMemoryDB) {
            const taken = memoryStore.users.some(u => u.username?.toLowerCase() === clean);
            return res.json({ available: !taken, reason: taken ? 'Username already exists.' : null });
        }
        const { rows } = await pool.query('SELECT id FROM users WHERE LOWER(username) = $1', [clean]);
        const taken = rows.length > 0;
        return res.json({ available: !taken, reason: taken ? 'Username already exists.' : null });
    } catch (e) {
        return res.json({ available: true, reason: null }); // silent fail - server validates on register
    }
});

app.post('/send-otp', async (req, res) => {
    let { email, username, type } = req.body;

    if (!email) return sendError(res, 400, "Email required");
    email = email.toLowerCase().trim();

    try {
        // Check if user already exists for registration
        if (type === 'register') {
            if (!username) return sendError(res, 400, "Username required");

            if (useMemoryDB) {
                const emailExists = memoryStore.users.find(u => u.email === email);
                if (emailExists) return sendError(res, 400, "This account is registered.");
                
                const usernameExists = memoryStore.users.find(u => u.username === username);
                if (usernameExists) return sendError(res, 400, "Username already exists.");
            } else {
                const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
                if (emailCheck.rows.length > 0) return sendError(res, 400, "This account is registered.");
                
                const usernameCheck = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
                if (usernameCheck.rows.length > 0) return sendError(res, 400, "Username already exists.");
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        otps.set(email, { otp, expires });

        logger.info(`[OTP] Verification Code for ${email}: ${otp}`);

        logger.info(`[MAIL] Attempting to send email to ${email}...`);

        try {
            if (!transporter) {
                throw new Error('SMTP email service not configured');
            }

            const mailOptions = {
                from: '"CodeBright" <codebrightlim@gmail.com>',
                to: email,
                subject: 'Verify your CodeBright Account',
                html: `
                    <div style="font-family: 'Poppins', sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e5e7eb;">
                        <h2 style="color: #ef4444; text-align: center;">Welcome to CodeBright</h2>
                        <p>Hello <strong>${username || 'Engineer'}</strong>,</p>
                        <p>Your verification code is:</p>
                        <div style="background: #f3f4f6; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827; border: 1px solid #e5e7eb;">
                            ${otp}
                        </div>
                        <p style="margin-top: 20px; color: #6b7280; font-size: 14px;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
                        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
                        <p style="text-align: center; color: #9ca3af; font-size: 12px;">&copy; 2026 BrightCode. Built for the Architect.</p>
                    </div>
                `
            };
            await transporter.sendMail(mailOptions);
            logger.info(`[MAIL] Email sent successfully to ${email}`);
            res.json({ message: "Verification code sent to your email." });
        } catch (mailErr) {
            logger.error(`[MAIL] Failed to send email:`, mailErr.message);
            try {
                fs.appendFileSync(path.join(__dirname, 'mail-error.log'), `[${new Date().toISOString()}] To: ${email} Error: ${mailErr.message}\n`);
            } catch (e) {}
            // Send back the SMTP error so the user knows what went wrong
            return sendError(res, 500, "Failed to send email", mailErr.message);
        }
    } catch (err) {
        sendError(res, 500, "Server error", err.message);
    }
});

app.post('/register', async (req, res) => {
    let { username, email, password, otp } = req.body;

    if (!username || !email || !password || !otp) {
        return sendError(res, 400, "Missing credentials", "All fields are required including OTP.");
    }

    email = email.toLowerCase().trim();
    otp = otp.toString().trim();

    logger.info(`[AUTH] Registering ${email} with OTP: ${otp}`);
    const record = otps.get(email);
    logger.debug(`[AUTH] Found Record:`, record);

    if (!record || record.otp !== otp) {
        logger.warn(`[AUTH] OTP Mismatch: Expected ${record?.otp}, Got ${otp}`);
        return sendError(res, 400, "Invalid OTP", "The verification code is incorrect.");
    }

    if (Date.now() > record.expires) {
        otps.delete(email);
        return sendError(res, 400, "OTP Expired", "Please request a new code.");
    }

    otps.delete(email); // OTP used

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuidV4();

        // 1. Check Memory Mode
        if (useMemoryDB) {
            const emailExists = memoryStore.users.find(u => u.email === email);
            if (emailExists) return sendError(res, 400, "This account is registered.");
            
            const usernameExists = memoryStore.users.find(u => u.username === username);
            if (usernameExists) return sendError(res, 400, "Username already exists.");

            memoryStore.users.push(normalizeMemoryUser({
                id, username, email, password: hashedPassword,
                xp: 0, css_level: 0, logic_level: 0, react_level: 0, mern_level: 0,
                activity: {},
                bio: '',
                stack: [],
                joinedAt: new Date().toISOString()
            }));
            saveStore();
            return res.status(201).json({
                message: "Registered in Persistent Memory Mode",
                mode: 'memory',
                xp: 0, css_level: 0, logic_level: 0, react_level: 0, mern_level: 0
            });
        }

        // 2. Check PostgreSQL
        const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
        if (emailCheck.rows.length > 0) return sendError(res, 400, "This account is registered.");
        
        const usernameCheck = await pool.query('SELECT id FROM users WHERE username = $1', [username]);
        if (usernameCheck.rows.length > 0) return sendError(res, 400, "Username already exists.");

        await pool.query(
            'INSERT INTO users (id, username, email, password, xp) VALUES ($1, $2, $3, $4, 0)',
            [id, username, email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered in PostgreSQL",
            xp: 0,
            css_level: 0,
            logic_level: 0,
            react_level: 0,
            mern_level: 0
        });
    } catch (err) {
        logger.error('SERVER REGISTER ERROR:', err);
        sendError(res, 500, "Database fault", err.message);
    }
});

app.post('/login', async (req, res) => {
    let { email, password } = req.body;
    if (email) email = email.toLowerCase().trim();

    try {
        let user;
        if (useMemoryDB) {
            user = memoryStore.users.find(u => u.email === email);
        } else {
            const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
            user = result.rows[0];
        }

        if (!user) {
            return sendError(res, 404, "This account does not exist.");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return sendError(res, 401, "Entered password is wrong.");
        }

        const sessionId = uuidV4();
        if (useMemoryDB) {
            user.session_id = sessionId;
            saveStore();
        } else {
            await pool.query('UPDATE users SET session_id = $1 WHERE id = $2', [sessionId, user.id]);
        }

        const token = jwt.sign({ id: user.id, username: user.username, sessionId }, JWT_SECRET, { expiresIn: '1d' });
        const activity = user.activity || {};
        res.json({
            token,
            username: user.username,
            email: user.email,
            xp: user.xp || 0,
            css_level: user.css_level || 0,
            logic_level: user.logic_level || 0,
            react_level: user.react_level || 0,
            mern_level: user.mern_level || 0,
            activity,
            streak: computeStreakFromActivity(activity),
            createdCount: user.created_count || 0,
            joinedCount: user.joined_count || 0,
            bio: user.bio || '',
            stack: Array.isArray(user.stack) ? user.stack : [],
            subscription: user.subscription || 'basic',
            avatarId: user.avatarId || user.avatar_id || 'Sniper',
            bannerId: user.bannerId || user.banner_id || 'crimson',
            github: user.github || '',
            leetcode: user.leetcode || '',
            project1: user.project1 || '',
            project2: user.project2 || '',
            createdAt: user.created_at || user.joinedAt || null
        });
    } catch (err) {
        logger.error('SERVER LOGIN ERROR:', err);
        sendError(res, 500, "Login failed", err.message);
    }
});

// --- GOOGLE & GITHUB SOCIAL AUTHENTICATION ---

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';
const GITHUB_OAUTH_CLIENT_ID = process.env.GITHUB_OAUTH_CLIENT_ID || process.env.GITHUB_CLIENT_ID || '';
const GITHUB_OAUTH_CLIENT_SECRET = process.env.GITHUB_OAUTH_CLIENT_SECRET || process.env.GITHUB_CLIENT_SECRET || '';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5051';

function getMockOAuthPage(provider, callbackUrl) {
    const providerName = provider === 'google' ? 'Google' : 'GitHub';
    const accentColor = provider === 'google' ? '#ea4335' : '#24292e';
    const bgGlow = provider === 'google' ? 'rgba(234, 67, 53, 0.15)' : 'rgba(255, 255, 255, 0.1)';
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mock ${providerName} Authentication Portal</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&family=JetBrains+Mono&display=swap" rel="stylesheet">
        <style>
            :root {
                --bg: #0a0a0a;
                --surface: #121212;
                --border: rgba(255, 255, 255, 0.08);
                --text: #e0e0e0;
                --text-muted: #666;
                --accent: ${accentColor};
            }
            body {
                background-color: var(--bg);
                color: var(--text);
                font-family: 'Outfit', sans-serif;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                overflow: hidden;
                position: relative;
            }
            body::before {
                content: '';
                position: absolute;
                width: 300px;
                height: 300px;
                background: radial-gradient(circle, ${bgGlow} 0%, transparent 70%);
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                z-index: 0;
                pointer-events: none;
            }
            .card {
                background: var(--surface);
                border: 1px solid var(--border);
                border-radius: 16px;
                padding: 40px;
                width: 100%;
                max-width: 400px;
                text-align: center;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
                position: relative;
                z-index: 1;
            }
            .badge {
                display: inline-block;
                background: rgba(251, 191, 36, 0.1);
                border: 1px solid rgba(251, 191, 36, 0.2);
                color: #fbbf24;
                font-size: 0.72rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 1px;
                padding: 4px 10px;
                border-radius: 20px;
                margin-bottom: 24px;
            }
            h1 {
                font-size: 1.8rem;
                font-weight: 800;
                margin: 0 0 8px 0;
                letter-spacing: -0.5px;
            }
            p {
                font-size: 0.9rem;
                color: var(--text-muted);
                line-height: 1.5;
                margin: 0 0 32px 0;
            }
            .input-group {
                text-align: left;
                margin-bottom: 24px;
            }
            label {
                display: block;
                font-size: 0.75rem;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                margin-bottom: 8px;
                color: #888;
            }
            input {
                width: 100%;
                box-sizing: border-box;
                background: rgba(255, 255, 255, 0.02);
                border: 1px solid var(--border);
                color: #fff;
                padding: 12px 16px;
                border-radius: 8px;
                font-family: inherit;
                font-size: 0.95rem;
                outline: none;
                transition: border-color 0.2s;
            }
            input:focus {
                border-color: var(--accent);
            }
            .btn {
                width: 100%;
                background: var(--accent);
                color: #fff;
                border: none;
                border-radius: 8px;
                padding: 14px;
                font-size: 0.95rem;
                font-weight: 600;
                cursor: pointer;
                transition: opacity 0.2s, transform 0.1s;
            }
            .btn:hover {
                opacity: 0.9;
            }
            .btn:active {
                transform: translateY(1px);
            }
            .footer-info {
                font-family: 'JetBrains Mono', monospace;
                font-size: 0.7rem;
                color: #444;
                margin-top: 32px;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="badge">Developer Sandbox</div>
            <h1>${providerName} Auth Portal</h1>
            <p>Real OAuth credentials are not configured in .env. Use this developer sandbox to simulate a social login.</p>
            
            <form action="${callbackUrl}" method="GET">
                <input type="hidden" name="provider" value="${provider}">
                <div class="input-group">
                    <label>Mock Full Name</label>
                    <input type="text" name="name" value="Demo Developer" required>
                </div>
                <div class="input-group">
                    <label>Mock Email Address</label>
                    <input type="email" name="email" value="developer@brightcode.io" required>
                </div>
                <input type="hidden" name="provider" value="${provider}">
                <button type="submit" class="btn">Authorize Sandbox Session</button>
            </form>
            
            <div class="footer-info">
                Redirect Callback: ${callbackUrl}
            </div>
        </div>
    </body>
    </html>
    `;
}

const handleSocialAuthSuccess = async (res, email, name, provider, providerId) => {
    email = email.toLowerCase().trim();
    const defaultUsername = email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'user';
    
    try {
        let user;
        // 1. Look up user by Google/GitHub ID first (already linked/verified)
        if (useMemoryDB) {
            user = memoryStore.users.find(u => provider === 'google' ? u.google_id === providerId : u.github_id === providerId);
        } else {
            const querySelect = provider === 'google' 
                ? 'SELECT * FROM users WHERE google_id = $1'
                : 'SELECT * FROM users WHERE github_id = $1';
            const resultSelect = await pool.query(querySelect, [providerId]);
            user = resultSelect.rows[0];
        }
        
        // 2. If user doesn't exist by social ID, check if they exist by email (conflict block)
        if (!user) {
            let emailUser;
            if (useMemoryDB) {
                emailUser = memoryStore.users.find(u => u.email === email);
            } else {
                const resultSelect = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
                emailUser = resultSelect.rows[0];
            }

            if (emailUser) {
                // Security Breakout Block: Email already exists, redirect to login page with warning
                logger.warn(`[AUTH] Blocking auto-login. Email ${email} matches existing account but social account is not linked.`);
                return res.redirect(`${FRONTEND_URL}/auth?error=social_email_taken`);
            }

            // 3. New user signup flow: sign a temporary token to prompt password setting on frontend
            logger.info(`[AUTH] Initiating social registration for ${email} (${provider})`);
            const tempToken = jwt.sign({ email, provider, providerId }, JWT_SECRET, { expiresIn: '10m' });
            return res.redirect(`${FRONTEND_URL}/auth?social_signup=true&email=${encodeURIComponent(email)}&username=${encodeURIComponent(defaultUsername)}&temp_token=${tempToken}`);
        }
        
        // 4. User exists and is linked: proceed with normal login
        const sessionId = uuidV4();
        if (useMemoryDB) {
            user.session_id = sessionId;
            saveStore();
        } else {
            await pool.query('UPDATE users SET session_id = $1 WHERE id = $2', [sessionId, user.id]);
        }
        
        const token = jwt.sign({ id: user.id, username: user.username, sessionId }, JWT_SECRET, { expiresIn: '1d' });
        const activity = user.activity || {};
        
        const params = new URLSearchParams({
            token,
            username: user.username,
            email: user.email,
            xp: String(user.xp || 0),
            css_level: String(user.css_level || 0),
            logic_level: String(user.logic_level || 0),
            react_level: String(user.react_level || 0),
            mern_level: String(user.mern_level || 0),
            activity: JSON.stringify(activity),
            streak: String(computeStreakFromActivity(activity)),
            createdCount: String(user.created_count || 0),
            joinedCount: String(user.joined_count || 0),
            bio: user.bio || '',
            stack: JSON.stringify(Array.isArray(user.stack) ? user.stack : []),
            subscription: user.subscription || 'basic',
            avatarId: user.avatarId || user.avatar_id || 'Sniper',
            bannerId: user.bannerId || user.banner_id || 'crimson',
            github: user.github || '',
            leetcode: user.leetcode || '',
            project1: user.project1 || '',
            project2: user.project2 || '',
            createdAt: user.created_at || user.joinedAt || ''
        });
        
        return res.redirect(`${FRONTEND_URL}/auth?${params}`);
    } catch (err) {
        logger.error('SOCIAL AUTH SUCCESS ERROR:', err);
        return res.redirect(`${FRONTEND_URL}/auth?error=social_auth_failed`);
    }
};

// Complete Social Signup Endpoint (creates account & links social ID after choosing a password)
app.post('/api/auth/complete-social-signup', async (req, res) => {
    const { username, password, temp_token } = req.body;
    if (!username || !password || !temp_token) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const decoded = jwt.verify(temp_token, JWT_SECRET);
        const { email, provider, providerId } = decoded;

        if (!email || !provider || !providerId) {
            return res.status(400).json({ error: 'Invalid token payload' });
        }

        const cleanEmail = email.toLowerCase().trim();
        const cleanUsername = username.toLowerCase().trim();

        if (cleanUsername.length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }

        // Check if username/email conflicts exist
        if (useMemoryDB) {
            const emailExists = memoryStore.users.find(u => u.email === cleanEmail);
            if (emailExists) return res.status(400).json({ error: 'This account is registered.' });
            
            const usernameExists = memoryStore.users.find(u => u.username === cleanUsername);
            if (usernameExists) return res.status(400).json({ error: 'Username already exists.' });
        } else {
            const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [cleanEmail]);
            if (emailCheck.rows.length > 0) return res.status(400).json({ error: 'This account is registered.' });
            
            const usernameCheck = await pool.query('SELECT id FROM users WHERE username = $1', [cleanUsername]);
            if (usernameCheck.rows.length > 0) return res.status(400).json({ error: 'Username already exists.' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuidV4();
        let user;

        if (useMemoryDB) {
            user = normalizeMemoryUser({
                id,
                username: cleanUsername,
                email: cleanEmail,
                password: hashedPassword,
                xp: 0,
                css_level: 0,
                logic_level: 0,
                react_level: 0,
                mern_level: 0,
                activity: {},
                bio: `Signed up via ${provider === 'google' ? 'Google' : 'GitHub'}`,
                stack: [],
                joinedAt: new Date().toISOString()
            });

            if (provider === 'google') user.google_id = providerId;
            else user.github_id = providerId;

            memoryStore.users.push(user);
            saveStore();
        } else {
            const googleIdVal = provider === 'google' ? providerId : null;
            const githubIdVal = provider === 'github' ? providerId : null;

            await pool.query(
                'INSERT INTO users (id, username, email, password, xp, google_id, github_id, bio) VALUES ($1, $2, $3, $4, 0, $5, $6, $7)',
                [id, cleanUsername, cleanEmail, hashedPassword, googleIdVal, githubIdVal, `Signed up via ${provider === 'google' ? 'Google' : 'GitHub'}`]
            );

            const freshSelect = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
            user = freshSelect.rows[0];
        }

        const sessionId = uuidV4();
        if (useMemoryDB) {
            user.session_id = sessionId;
            saveStore();
        } else {
            await pool.query('UPDATE users SET session_id = $1 WHERE id = $2', [sessionId, user.id]);
        }

        const token = jwt.sign({ id: user.id, username: user.username, sessionId }, JWT_SECRET, { expiresIn: '1d' });
        const activity = user.activity || {};

        res.json({
            token,
            username: user.username,
            email: user.email,
            xp: user.xp || 0,
            css_level: user.css_level || 0,
            logic_level: user.logic_level || 0,
            react_level: user.react_level || 0,
            mern_level: user.mern_level || 0,
            activity,
            streak: 0,
            createdCount: user.created_count || 0,
            joinedCount: user.joined_count || 0,
            bio: user.bio || '',
            stack: user.stack || [],
            subscription: user.subscription || 'basic',
            avatarId: user.avatarId || user.avatar_id || 'Sniper',
            bannerId: user.bannerId || user.banner_id || 'crimson',
            github: user.github || '',
            leetcode: user.leetcode || '',
            project1: user.project1 || '',
            project2: user.project2 || '',
            createdAt: user.created_at || user.joinedAt || ''
        });
    } catch (err) {
        logger.error('[COMPLETE SOCIAL SIGNUP ERROR]:', err);
        res.status(400).json({ error: 'Invalid or expired temporary signup token' });
    }
});

// ── Google OAuth Routes ──
app.get('/api/auth/google', (req, res) => {
    if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
        return res.send(getMockOAuthPage('google', `${process.env.BACKEND_URL || BACKEND_URL}/api/auth/google/callback`));
    }
    const scopes = 'email profile';
    const redirectUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${process.env.BACKEND_URL || BACKEND_URL}/api/auth/google/callback&response_type=code&scope=${encodeURIComponent(scopes)}`;
    res.redirect(redirectUrl);
});

app.get('/api/auth/google/callback', async (req, res) => {
    const { code, provider, email, name } = req.query;
    
    if (provider === 'google' && email && name) {
        const mockSub = 'mock_google_id_' + email.replace(/[^a-zA-Z0-9]/g, '');
        return handleSocialAuthSuccess(res, email, name, 'google', mockSub);
    }
    
    if (!code) {
        return res.redirect(`${FRONTEND_URL}/auth?error=no_auth_code`);
    }
    
    try {
        const tokenRes = await axios.post('https://oauth2.googleapis.com/token', {
            code,
            client_id: GOOGLE_CLIENT_ID,
            client_secret: GOOGLE_CLIENT_SECRET,
            redirect_uri: `${process.env.BACKEND_URL || BACKEND_URL}/api/auth/google/callback`,
            grant_type: 'authorization_code'
        });
        
        const { access_token } = tokenRes.data;
        
        const userRes = await axios.get('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${access_token}` }
        });
        
        const { email: googleEmail, name: googleName, sub } = userRes.data;
        if (!googleEmail) {
            throw new Error('Google did not return an email address');
        }
        
        return handleSocialAuthSuccess(res, googleEmail, googleName || 'Google User', 'google', sub);
    } catch (err) {
        logger.error('GOOGLE CALLBACK ERROR:', err.message);
        return res.redirect(`${FRONTEND_URL}/auth?error=google_auth_failed`);
    }
});

// ── GitHub OAuth Routes ──
app.get('/api/auth/github', (req, res) => {
    if (!GITHUB_OAUTH_CLIENT_ID || !GITHUB_OAUTH_CLIENT_SECRET) {
        return res.send(getMockOAuthPage('github', `${process.env.BACKEND_URL || BACKEND_URL}/api/auth/github/callback`));
    }
    const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${GITHUB_OAUTH_CLIENT_ID}&redirect_uri=${process.env.BACKEND_URL || BACKEND_URL}/api/auth/github/callback&scope=user:email`;
    res.redirect(redirectUrl);
});

app.get('/api/auth/github/callback', async (req, res) => {
    const { code, provider, email, name } = req.query;
    
    if (provider === 'github' && email && name) {
        const mockSub = 'mock_github_id_' + email.replace(/[^a-zA-Z0-9]/g, '');
        return handleSocialAuthSuccess(res, email, name, 'github', mockSub);
    }
    
    if (!code) {
        return res.redirect(`${FRONTEND_URL}/auth?error=no_auth_code`);
    }
    
    try {
        const tokenRes = await axios.post('https://github.com/login/oauth/access_token', {
            client_id: GITHUB_OAUTH_CLIENT_ID,
            client_secret: GITHUB_OAUTH_CLIENT_SECRET,
            code,
            redirect_uri: `${process.env.BACKEND_URL || BACKEND_URL}/api/auth/github/callback`
        }, {
            headers: { Accept: 'application/json' }
        });
        
        const { access_token } = tokenRes.data;
        if (!access_token) {
            throw new Error('Failed to retrieve GitHub access token');
        }
        
        const userRes = await axios.get('https://api.github.com/user', {
            headers: { Authorization: `token ${access_token}` }
        });
        
        const { id, name: githubName, login } = userRes.data;
        
        const emailsRes = await axios.get('https://api.github.com/user/emails', {
            headers: { Authorization: `token ${access_token}` }
        });
        
        const primaryEmailObj = emailsRes.data.find(e => e.primary && e.verified) || emailsRes.data[0];
        const githubEmail = primaryEmailObj?.email;
        
        if (!githubEmail) {
            throw new Error('GitHub did not return a verified email address');
        }
        
        return handleSocialAuthSuccess(res, githubEmail, githubName || login || 'GitHub User', 'github', String(id));
    } catch (err) {
        logger.error('GITHUB CALLBACK ERROR:', err.message);
        return res.redirect(`${FRONTEND_URL}/auth?error=github_auth_failed`);
    }
});

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Access denied' });
    const token = authHeader.split(' ')[1];
    
    try {
        const user = jwt.verify(token, JWT_SECRET);
        
        // Concurrent login check
        let currentSessionId = null;
        if (useMemoryDB) {
            const memUser = memoryStore.users.find(u => u.id === user.id);
            if (memUser) currentSessionId = memUser.session_id;
        } else {
            try {
                const { rows } = await pool.query('SELECT session_id FROM users WHERE id = $1', [user.id]);
                if (rows.length > 0) currentSessionId = rows[0].session_id;
            } catch (e) {
                logger.error('[AUTH] DB error fetching session_id', e);
            }
        }
        
        // If currentSessionId exists in DB and user token has a sessionId, and they don't match -> invalidate
        if (currentSessionId && user.sessionId && currentSessionId !== user.sessionId) {
            return res.status(401).json({ error: 'Logged in from another device. Session invalidated.', code: 'CONCURRENT_LOGIN' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
    }
};

// ── FRIENDS SYSTEM ─────────────────────────────────────────────────────────

// In-memory friends store (used as fallback when PostgreSQL is offline)
let friendsMemoryStore = []; // { id, requester_id, recipient_id, status, created_at }
const FRIENDS_FILE = path.join(__dirname, 'friends_db.json');

const loadFriendsStore = () => {
    if (fs.existsSync(FRIENDS_FILE)) {
        try {
            friendsMemoryStore = JSON.parse(fs.readFileSync(FRIENDS_FILE, 'utf8')) || [];
        } catch (e) { friendsMemoryStore = []; }
    }
};
const saveFriendsStore = () => {
    try { fs.writeFileSync(FRIENDS_FILE, JSON.stringify(friendsMemoryStore, null, 2)); } catch (e) {}
};
loadFriendsStore();

// Migrate friends table in PostgreSQL
const initFriendsTable = async () => {
    if (useMemoryDB) return;
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS friends (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                requester_id TEXT NOT NULL,
                recipient_id TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(requester_id, recipient_id)
            );
        `);
        logger.info('[FRIENDS] Friends table ready');
    } catch (e) {
        logger.error('[FRIENDS] Table init error:', e.message);
    }
};
initFriendsTable();

// Online presence: userId -> Set of socketIds
const onlineUsers = new Map();

// Helper: get a user's basic public profile
const getUserPublicProfile = async (userId) => {
    if (useMemoryDB) {
        const u = memoryStore.users.find(u => u.id === userId);
        if (!u) return null;
        return { id: u.id, username: u.username, xp: u.xp || 0, level: u.level || 'Novice' };
    }
    try {
        const { rows } = await pool.query('SELECT id, username, xp, level FROM users WHERE id = $1', [userId]);
        return rows[0] || null;
    } catch (e) { return null; }
};

// Search users by username (excluding self and existing friends)
app.get('/friends/search', authenticateToken, async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) return res.json([]);
    const myId = req.user.id;
    logger.debug(`[FRIENDS SEARCH] q="${q}" myId="${myId}" useMemoryDB=${useMemoryDB} totalUsers=${memoryStore.users.length}`);
    try {
        let users;
        if (useMemoryDB) {
            users = memoryStore.users
                .filter(u => u.id !== myId && u.username?.toLowerCase().includes(q.toLowerCase()))
                .slice(0, 10)
                .map(u => ({ id: u.id, username: u.username, xp: u.xp || 0, level: u.level || 'Novice' }));
            logger.debug(`[FRIENDS SEARCH] Memory filter found ${users.length} users`);
        } else {
            const { rows } = await pool.query(
                `SELECT id, username, xp, level FROM users WHERE id != $1 AND username ILIKE $2 LIMIT 10`,
                [myId, `%${q}%`]
            );
            users = rows;
        }
        // Attach friendship status for each result
        const results = await Promise.all(users.map(async (u) => {
            let friendStatus = 'none';
            if (useMemoryDB) {
                const rel = friendsMemoryStore.find(f =>
                    (f.requester_id === myId && f.recipient_id === u.id) ||
                    (f.requester_id === u.id && f.recipient_id === myId)
                );
                if (rel) friendStatus = rel.requester_id === myId ? rel.status : (rel.status === 'pending' ? 'incoming' : rel.status);
            } else {
                const { rows } = await pool.query(
                    `SELECT status, requester_id FROM friends WHERE (requester_id=$1 AND recipient_id=$2) OR (requester_id=$2 AND recipient_id=$1)`,
                    [myId, u.id]
                );
                if (rows[0]) {
                    friendStatus = rows[0].requester_id === myId ? rows[0].status : (rows[0].status === 'pending' ? 'incoming' : rows[0].status);
                }
            }
            return { ...u, friendStatus, online: onlineUsers.has(u.id) };
        }));
        res.json(results);
    } catch (e) {
        logger.error('[FRIENDS] Search error:', e.message);
        res.status(500).json({ error: 'Search failed' });
    }
});

// Send a friend request
app.post('/friends/request', authenticateToken, async (req, res) => {
    const { recipientId } = req.body;
    const myId = req.user.id;
    if (!recipientId || recipientId === myId) return res.status(400).json({ error: 'Invalid recipient' });
    try {
        if (useMemoryDB) {
            const exists = friendsMemoryStore.find(f =>
                (f.requester_id === myId && f.recipient_id === recipientId) ||
                (f.requester_id === recipientId && f.recipient_id === myId)
            );
            if (exists) return res.status(409).json({ error: 'Request already exists' });
            const newReq = { id: uuidV4(), requester_id: myId, recipient_id: recipientId, status: 'pending', created_at: new Date().toISOString() };
            friendsMemoryStore.push(newReq);
            saveFriendsStore();
            // Notify recipient in real-time
            const requesterUser = memoryStore.users.find(u => u.id === myId);
            io.to(`user:${recipientId}`).emit('friend:request', { from: { id: myId, username: requesterUser?.username } });
            return res.json({ success: true });
        }
        await pool.query(
            `INSERT INTO friends (requester_id, recipient_id, status) VALUES ($1, $2, 'pending') ON CONFLICT DO NOTHING`,
            [myId, recipientId]
        );
        const requester = await getUserPublicProfile(myId);
        io.to(`user:${recipientId}`).emit('friend:request', { from: requester });
        res.json({ success: true });
    } catch (e) {
        logger.error('[FRIENDS] Request error:', e.message);
        res.status(500).json({ error: 'Failed to send request' });
    }
});

// Accept a friend request
app.post('/friends/accept', authenticateToken, async (req, res) => {
    const { requesterId } = req.body;
    const myId = req.user.id;
    try {
        if (useMemoryDB) {
            const idx = friendsMemoryStore.findIndex(f => f.requester_id === requesterId && f.recipient_id === myId && f.status === 'pending');
            if (idx === -1) return res.status(404).json({ error: 'No pending request found' });
            friendsMemoryStore[idx].status = 'accepted';
            saveFriendsStore();
            const accepter = memoryStore.users.find(u => u.id === myId);
            io.to(`user:${requesterId}`).emit('friend:accepted', { by: { id: myId, username: accepter?.username } });
            return res.json({ success: true });
        }
        await pool.query(
            `UPDATE friends SET status='accepted' WHERE requester_id=$1 AND recipient_id=$2 AND status='pending'`,
            [requesterId, myId]
        );
        const accepter = await getUserPublicProfile(myId);
        io.to(`user:${requesterId}`).emit('friend:accepted', { by: accepter });
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to accept' });
    }
});

// Reject / cancel / remove a friend
app.post('/friends/remove', authenticateToken, async (req, res) => {
    const { otherId } = req.body;
    const myId = req.user.id;
    try {
        if (useMemoryDB) {
            friendsMemoryStore = friendsMemoryStore.filter(f =>
                !((f.requester_id === myId && f.recipient_id === otherId) ||
                  (f.requester_id === otherId && f.recipient_id === myId))
            );
            saveFriendsStore();
            return res.json({ success: true });
        }
        await pool.query(
            `DELETE FROM friends WHERE (requester_id=$1 AND recipient_id=$2) OR (requester_id=$2 AND recipient_id=$1)`,
            [myId, otherId]
        );
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: 'Failed to remove' });
    }
});

// Get my friends list (accepted) + pending incoming requests
app.get('/friends', authenticateToken, async (req, res) => {
    const myId = req.user.id;
    try {
        let accepted = [], incoming = [], outgoing = [];
        if (useMemoryDB) {
            const myRels = friendsMemoryStore.filter(f => f.requester_id === myId || f.recipient_id === myId);
            for (const rel of myRels) {
                const otherId = rel.requester_id === myId ? rel.recipient_id : rel.requester_id;
                const other = memoryStore.users.find(u => u.id === otherId);
                if (!other) continue;
                const profile = { id: other.id, username: other.username, xp: other.xp || 0, level: other.level || 'Novice', online: onlineUsers.has(other.id) };
                if (rel.status === 'accepted') accepted.push(profile);
                else if (rel.status === 'pending' && rel.recipient_id === myId) incoming.push({ ...profile, requesterId: rel.requester_id });
                else if (rel.status === 'pending' && rel.requester_id === myId) outgoing.push(profile);
            }
        } else {
            const { rows } = await pool.query(
                `SELECT f.*, 
                    CASE WHEN f.requester_id=$1 THEN f.recipient_id ELSE f.requester_id END as other_id
                 FROM friends f WHERE f.requester_id=$1 OR f.recipient_id=$1`,
                [myId]
            );
            for (const rel of rows) {
                const profile = await getUserPublicProfile(rel.other_id);
                if (!profile) continue;
                profile.online = onlineUsers.has(rel.other_id);
                if (rel.status === 'accepted') accepted.push(profile);
                else if (rel.status === 'pending' && rel.recipient_id === myId) incoming.push({ ...profile, requesterId: rel.requester_id });
                else if (rel.status === 'pending' && rel.requester_id === myId) outgoing.push(profile);
            }
        }
        res.json({ friends: accepted, incoming, outgoing });
    } catch (e) {
        logger.error('[FRIENDS] Get error:', e.message);
        res.status(500).json({ error: 'Failed to get friends' });
    }
});

app.post('/update-profile', authenticateToken, async (req, res) => {
    const { username, bio, stack, avatarId, bannerId, github, leetcode, project1, project2 } = req.body;
    if (!username) return res.status(400).json({ error: 'Username cannot be empty' });

    const parsedStack = Array.isArray(stack) ? stack : [];

    try {
        if (useMemoryDB) {
            const taken = memoryStore.users.find(u => u.username === username && u.id !== req.user.id);
            if (taken) return res.status(400).json({ error: 'Username is already taken' });

            const user = memoryStore.users.find(u => u.id === req.user.id);
            if (!user) return res.status(404).json({ error: 'User not found' });

            user.username = username;
            user.bio = bio || '';
            user.stack = parsedStack;
            if (avatarId !== undefined) user.avatarId = avatarId;
            if (bannerId !== undefined) user.bannerId = bannerId;
            if (github !== undefined) user.github = github;
            if (leetcode !== undefined) user.leetcode = leetcode;
            if (project1 !== undefined) user.project1 = project1;
            if (project2 !== undefined) user.project2 = project2;
            normalizeMemoryUser(user);
            saveStore();

            const token = jwt.sign({ id: user.id, username }, JWT_SECRET, { expiresIn: '1d' });
            return res.json({
                token,
                username: user.username,
                email: user.email,
                xp: user.xp || 0,
                bio: user.bio || '',
                stack: user.stack || [],
                avatarId: user.avatarId || 'Sniper',
                bannerId: user.bannerId || 'crimson',
                github: user.github || '',
                leetcode: user.leetcode || '',
                project1: user.project1 || '',
                project2: user.project2 || '',
                createdAt: user.created_at || user.joinedAt || null
            });
        }

        const existing = await pool.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, req.user.id]);
        if (existing.rows.length > 0) return res.status(400).json({ error: 'Username is already taken' });

        const stackJson = JSON.stringify(parsedStack);

        const result = await pool.query(
            'UPDATE users SET username = $1, bio = $2, stack = $3::jsonb WHERE id = $4 RETURNING email, xp, bio, stack, created_at',
            [username, bio || '', stackJson, req.user.id]
        );

        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        const stackOut = typeof user.stack === 'string' ? JSON.parse(user.stack) : (user.stack || []);

        const token = jwt.sign({ id: req.user.id, username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            username,
            email: user.email,
            xp: user.xp,
            bio: user.bio,
            stack: stackOut,
            createdAt: user.created_at
        });
    } catch (err) {
        logger.error('UPDATE PROFILE ERROR:', err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

// Change password endpoint (simple version without OTP)
app.post('/change-password', authenticateToken, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current and new passwords are required' });
    }
    
    if (newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }
    
    try {
        let user;
        
        // Memory mode
        if (useMemoryDB) {
            user = memoryStore.users.find(u => u.id === req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            
            // Verify current password
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
            
            // Hash new password
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            
            // Update password in memory
            user.password = hashedPassword;
            saveStore();
            
            return res.json({ success: true, message: 'Password changed successfully' });
        }
        
        // PostgreSQL mode
        const userResult = await pool.query('SELECT password FROM users WHERE id = $1', [req.user.id]);
        if (userResult.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        
        user = userResult.rows[0];
        
        // Verify current password
        const isValid = await bcrypt.compare(currentPassword, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }
        
        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        
        // Update password
        await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashedPassword, req.user.id]);
        
        res.json({ success: true, message: 'Password changed successfully' });
    } catch (err) {
        logger.error('CHANGE PASSWORD ERROR:', err);
        res.status(500).json({ error: 'Database error: ' + err.message });
    }
});

app.delete('/delete-user/:username', async (req, res) => {
    const { username } = req.params;
    try {
        if (useMemoryDB) {
            const initialCount = memoryStore.users.length;
            memoryStore.users = memoryStore.users.filter(u => u.username !== username);
            return res.json({ success: memoryStore.users.length < initialCount, message: `Deleted ${username} from Memory` });
        }

        const result = await pool.query('DELETE FROM users WHERE username = $1', [username]);
        res.json({ success: result.rowCount > 0, message: `Deleted ${username} from Database` });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// ── GET /me — always returns fresh XP for current user ─────────
app.get('/me', authenticateToken, async (req, res) => {
    try {
        if (useMemoryDB) {
            let u = memoryStore.users.find(u => u.id === req.user.id);
            if (!u) {
                // Self-heal: user missing from memory due to server restart
                u = normalizeMemoryUser({
                    id: req.user.id,
                    username: req.user.username,
                    email: `${req.user.username}@brightcode.memory`,
                    password: 'memory_migrated',
                    xp: 0, css_level: 0, logic_level: 0, react_level: 0, mern_level: 0,
                    bio: '',
                    stack: [],
                    joinedAt: new Date().toISOString()
                });
                memoryStore.users.push(u);
                saveStore();
            }
            normalizeMemoryUser(u);
            return res.json({
                id: u.id,
                username: u.username,
                email: u.email,
                xp: u.xp || 0,
                level: computeLevel(u.xp || 0),
                css_level: u.css_level || 0,
                logic_level: u.logic_level || 0,
                react_level: u.react_level || 0,
                mern_level: u.mern_level || 0,
                joinedAt: u.joinedAt || u.created_at || null,
                activity: u.activity || {},
                streak: computeStreakFromActivity(u.activity || {}),
                createdCount: u.created_count || 0,
                joinedCount: u.joined_count || 0,
                bio: u.bio || '',
                stack: u.stack || [],
                subscription: u.subscription || 'basic',
                createdAt: u.created_at || u.joinedAt || null
            });
        }
        const result = await pool.query(
            'SELECT id, username, email, xp, css_level, logic_level, react_level, mern_level, activity, created_count, joined_count, bio, stack, subscription, created_at FROM users WHERE id = $1',
            [req.user.id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
        const u = result.rows[0];
        res.json({
            ...u,
            xp: u.xp || 0,
            level: computeLevel(u.xp || 0),
            activity: u.activity || {},
            streak: computeStreakFromActivity(u.activity || {}),
            createdCount: u.created_count || 0,
            joinedCount: u.joined_count || 0,
            subscription: u.subscription || 'basic',
            bio: u.bio || '',
            stack: u.stack || [],
            createdAt: u.created_at
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

// ── SUBSCRIPTION & RAZORPAY BILLING ROUTES ──────────────────────────────────
app.post('/api/subscription/create-order', authenticateToken, async (req, res) => {
    const { plan } = req.body;
    if (!['pro', 'elite'].includes(plan)) {
        return res.status(400).json({ error: 'Invalid plan selected' });
    }

    // Amount in INR Paisa (Pro: ₹999 -> 99900, Elite: ₹2999 -> 299900)
    const amount = plan === 'pro' ? 99900 : 299900;
    const isSandbox = !process.env.RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_dummy');

    try {
        if (isSandbox) {
            logger.info(`[BILLING] Creating Sandbox Order for plan: ${plan}`);
            return res.json({
                id: `order_mock_${Math.random().toString(36).substr(2, 9)}`,
                amount,
                currency: 'INR',
                key_id: 'rzp_test_dummy_key_id',
                sandbox: true
            });
        }

        logger.info(`[BILLING] Connecting to Razorpay for order: ${plan}`);
        const Razorpay = require('razorpay');
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET
        });

        const order = await razorpay.orders.create({
            amount,
            currency: 'INR',
            receipt: `receipt_sub_${req.user.id}_${Date.now()}`
        });

        res.json({
            id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID,
            sandbox: false
        });
    } catch (err) {
        logger.error('[BILLING] Order Creation Error:', err);
        res.status(500).json({ error: 'Failed to initiate checkout order' });
    }
});

app.post('/api/subscription/verify-payment', authenticateToken, async (req, res) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, plan } = req.body;
    if (!['pro', 'elite'].includes(plan)) {
        return res.status(400).json({ error: 'Invalid plan selected' });
    }

    const isSandbox = !process.env.RAZORPAY_KEY_ID || 
                      process.env.RAZORPAY_KEY_ID.startsWith('rzp_test_dummy') || 
                      (razorpay_order_id && razorpay_order_id.startsWith('order_mock_'));

    try {
        let verified = false;

        if (isSandbox) {
            logger.info(`[BILLING] Verifying Sandbox Payment for plan: ${plan}`);
            verified = true;
        } else {
            logger.info(`[BILLING] Verifying Razorpay Signature for payment: ${razorpay_payment_id}`);
            const crypto = require('crypto');
            const text = razorpay_order_id + "|" + razorpay_payment_id;
            const generated_signature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(text)
                .digest('hex');
            verified = generated_signature === razorpay_signature;
        }

        if (!verified) {
            return res.status(400).json({ error: 'Payment signature verification failed' });
        }

        // Apply Upgrade
        if (useMemoryDB) {
            const u = memoryStore.users.find(x => x.id === req.user.id);
            if (u) {
                u.subscription = plan;
                saveStore();
            }
        } else {
            await pool.query('UPDATE users SET subscription = $1 WHERE id = $2', [plan, req.user.id]);
        }

        logger.info(`[BILLING] User ${req.user.username} upgraded to ${plan}`);
        res.json({ success: true, subscription: plan });
    } catch (err) {
        logger.error('[BILLING] Payment Verification Error:', err);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
});

app.post('/api/subscription/cancel', authenticateToken, async (req, res) => {
    try {
        if (useMemoryDB) {
            const u = memoryStore.users.find(x => x.id === req.user.id);
            if (u) {
                u.subscription = 'basic';
                saveStore();
            }
        } else {
            await pool.query("UPDATE users SET subscription = 'basic' WHERE id = $1", [req.user.id]);
        }
        logger.info(`[BILLING] User ${req.user.username} reverted to basic plan`);
        res.json({ success: true, subscription: 'basic' });
    } catch (err) {
        logger.error('[BILLING] Subscription Cancel Error:', err);
        res.status(500).json({ error: 'Failed to cancel subscription' });
    }
});

// ── Public User Profile (by username) ─────────────────────────────────────
app.get('/profile/:username', async (req, res) => {
    const { username } = req.params;
    if (!username) return res.status(400).json({ error: 'Username required' });
    try {
        let user;
        if (useMemoryDB) {
            user = memoryStore.users.find(u => u.username?.toLowerCase() === username.toLowerCase());
        } else {
            const { rows } = await pool.query(
                `SELECT id, username, xp, level, bio, stack, activity, css_level, logic_level, react_level, 
                        mern_level, java_level, cpp_level, python_level, go_level, created_at
                 FROM users WHERE LOWER(username) = LOWER($1)`,
                [username]
            );
            user = rows[0];
        }
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Compute level from XP
        const computedLevel = computeLevel(user.xp || 0);

        // Total challenges solved (sum of all game levels)
        const totalSolved = (user.css_level || 0) + (user.logic_level || 0) + (user.react_level || 0) +
                            (user.mern_level || 0) + (user.java_level || 0) + (user.cpp_level || 0) +
                            (user.python_level || 0) + (user.go_level || 0);

        // Streak from activity
        const streak = computeStreakFromActivity(user.activity || {});
        const isOnline = onlineUsers.has(user.id);

        res.json({
            id: user.id,
            username: user.username,
            xp: user.xp || 0,
            level: computedLevel,
            bio: user.bio || '',
            stack: user.stack || [],
            avatarId: user.avatarId || user.avatar_id || 'Sniper',
            bannerId: user.bannerId || user.banner_id || 'crimson',
            github: user.github || '',
            leetcode: user.leetcode || '',
            project1: user.project1 || '',
            project2: user.project2 || '',
            activity: user.activity || {},
            streak,
            totalSolved,
            skills: {
                css: user.css_level || 0,
                logic: user.logic_level || 0,
                react: user.react_level || 0,
                mern: user.mern_level || 0,
                java: user.java_level || 0,
                cpp: user.cpp_level || 0,
                python: user.python_level || 0,
                go: user.go_level || 0,
            },
            joinedAt: user.created_at || user.joinedAt || null,
            online: isOnline,
        });
    } catch (e) {
        logger.error('[PROFILE] Error:', e.message);
        res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

app.get('/leaderboard', async (req, res) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const offset = (page - 1) * limit;

        if (useMemoryDB) {
            const sorted = [...memoryStore.users]
                .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                .map(u => ({ username: u.username, xp: u.xp || 0, level: computeLevel(u.xp || 0) }));
            return res.json({
                data: sorted.slice(offset, offset + limit),
                total: sorted.length,
                page,
                limit
            });
        }

        const countResult = await pool.query('SELECT COUNT(*) FROM users');
        const total = parseInt(countResult.rows[0].count);

        const result = await pool.query(
            'SELECT username, xp, css_level, logic_level, react_level FROM users ORDER BY xp DESC LIMIT $1 OFFSET $2',
            [limit, offset]
        );
        const rows = result.rows.map(u => ({
            username: u.username,
            xp: u.xp || 0,
            level: computeLevel(u.xp || 0),
            css_level: u.css_level || 0,
            logic_level: u.logic_level || 0,
            react_level: u.react_level || 0
        }));
        res.json({ data: rows, total, page, limit });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
});

const getUserSubscription = async (userId) => {
    if (useMemoryDB) {
        const u = memoryStore.users.find(x => x.id === userId);
        if (u?.username === 'admin') return 'elite';
        return u?.subscription || 'basic';
    }
    try {
        const { rows } = await pool.query('SELECT username, subscription FROM users WHERE id = $1', [userId]);
        if (rows[0]?.username === 'admin') return 'elite';
        return rows[0]?.subscription || 'basic';
    } catch (e) {
        return 'basic';
    }
};

const getNoteCountForUser = async (userId) => {
    if (useMemoryDB) {
        return (notesMemoryStore || []).filter(n => n.user_id === userId && !n.deleted_at).length;
    }
    const { rows } = await pool.query('SELECT COUNT(*)::int as count FROM notes WHERE user_id = $1 AND deleted_at IS NULL', [userId]);
    return rows[0]?.count || 0;
};

// ── CodeVault Notes API ──────────────────────────────────────────────────────

// GET /api/notes - Get all notes for user with filtering
app.get('/api/notes', authenticateToken, async (req, res) => {
    const { folderId, tag, search } = req.query;

    if (useMemoryDB) {
        let results = notesMemoryStore.filter(n => n.user_id === req.user.id && !n.deleted_at);
        if (folderId) results = results.filter(n => n.folder_id === folderId);
        if (tag) results = results.filter(n => (n.tags || []).includes(tag));
        if (search) {
            const q = search.toLowerCase();
            results = results.filter(n =>
                n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
            );
        }
        results.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
        return res.json(results.map(({ deleted_at, ...n }) => n));
    }

    try {
        let query = 'SELECT id, title, content, folder_id, tags, challenge_id, challenge_module, created_at, updated_at FROM notes WHERE user_id = $1 AND deleted_at IS NULL';
        const params = [req.user.id];
        let paramIndex = 2;

        if (folderId) { query += ` AND folder_id = $${paramIndex}`; params.push(folderId); paramIndex++; }
        if (tag) { query += ` AND $${paramIndex} = ANY(tags)`; params.push(tag); paramIndex++; }
        if (search) {
            query += ` AND (title ILIKE $${paramIndex} OR content ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }
        query += ' ORDER BY updated_at DESC';

        const result = await pool.query(query, params);
        const notes = result.rows.map(n => ({
            ...n,
            tags: Array.isArray(n.tags) ? n.tags : []
        }));
        res.json(notes);
    } catch (err) {
        logger.error('GET /api/notes ERROR:', err);
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

// GET /api/notes/related/:challengeId - Get notes related to a challenge (must be before /api/notes/:id)
app.get('/api/notes/related/:challengeId', authenticateToken, async (req, res) => {
    if (useMemoryDB) {
        const results = notesMemoryStore
            .filter(n => n.user_id === req.user.id && n.challenge_id === req.params.challengeId && !n.deleted_at)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .map(({ id, title, tags, folder_id, updated_at }) => ({ id, title, tags, folder_id, updated_at }));
        return res.json(results);
    }
    try {
        const result = await pool.query(
            `SELECT id, title, tags, folder_id, updated_at FROM notes WHERE user_id = $1 AND challenge_id = $2 AND deleted_at IS NULL ORDER BY updated_at DESC`,
            [req.user.id, req.params.challengeId]
        );
        res.json(result.rows);
    } catch (err) {
        logger.error('GET /api/notes/related/:challengeId ERROR:', err);
        res.status(500).json({ error: 'Failed to fetch related notes' });
    }
});

// GET /api/notes/:id - Get single note
app.get('/api/notes/:id', authenticateToken, async (req, res) => {
    if (useMemoryDB) {
        const note = notesMemoryStore.find(n => n.id === req.params.id && n.user_id === req.user.id && !n.deleted_at);
        if (!note) return res.status(404).json({ error: 'Note not found' });
        const { deleted_at, ...safeNote } = note;
        return res.json(safeNote);
    }
    try {
        const result = await pool.query(
            'SELECT * FROM notes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.user.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
        res.json(result.rows[0]);
    } catch (err) {
        logger.error('GET /api/notes/:id ERROR:', err);
        res.status(500).json({ error: 'Failed to fetch note' });
    }
});

// POST /api/notes - Create new note
app.post('/api/notes', authenticateToken, async (req, res) => {
    const sub = await getUserSubscription(req.user.id);
    const noteCount = await getNoteCountForUser(req.user.id);
    const noteLimit = sub === 'elite' ? 99999 : (sub === 'pro' ? 500 : 30);
    if (noteCount >= noteLimit) {
        return res.status(403).json({
            error: `CodeVault file limit (${noteLimit}) reached under the ${sub === 'basic' ? 'Basic (Free)' : 'Pro'} plan. Please upgrade your subscription to add more files.`
        });
    }

    let { title, content, folderId, tags, challengeId, challengeModule } = req.body;

    if (!title || title.trim().length === 0) {
        if (content && content.trim().length > 0) {
            title = content.trim().split('\n')[0].substring(0, 50).trim() || 'Untitled Note';
        } else {
            title = 'Untitled Note';
        }
    }
    if (title.length > 200) return res.status(400).json({ error: 'Title too long (max 200 characters)' });
    if (content && content.length > 20000000) return res.status(400).json({ error: 'Content too large (max 20MB)' });

    if (useMemoryDB) {
        const now = new Date().toISOString();
        const newNote = {
            id: uuidV4Notes(),
            user_id: req.user.id,
            title,
            content: content || '',
            folder_id: folderId || null,
            tags: tags || [],
            challenge_id: challengeId || null,
            challenge_module: challengeModule || null,
            created_at: now,
            updated_at: now,
            deleted_at: null
        };
        notesMemoryStore.push(newNote);
        saveNotesStore();
        const { deleted_at, user_id, ...safeNote } = newNote;
        return res.status(201).json(safeNote);
    }

    try {
        const result = await pool.query(
            `INSERT INTO notes (user_id, title, content, folder_id, tags, challenge_id, challenge_module)
             VALUES ($1, $2, $3, $4, $5, $6, $7)
             RETURNING id, title, content, folder_id, tags, challenge_id, challenge_module, created_at, updated_at`,
            [req.user.id, title, content || '', folderId || null, tags || [], challengeId || null, challengeModule || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        logger.error('POST /api/notes ERROR:', err);
        res.status(500).json({ error: 'Failed to create note' });
    }
});

// PUT /api/notes/:id - Update note
app.put('/api/notes/:id', authenticateToken, async (req, res) => {
    const { title, content, tags, folderId } = req.body;
    if (title && title.length > 200) return res.status(400).json({ error: 'Title too long (max 200 characters)' });
    if (content && content.length > 20000000) return res.status(400).json({ error: 'Content too large (max 20MB)' });

    if (useMemoryDB) {
        const idx = notesMemoryStore.findIndex(n => n.id === req.params.id && n.user_id === req.user.id && !n.deleted_at);
        if (idx === -1) return res.status(404).json({ error: 'Note not found' });
        if (title !== undefined) notesMemoryStore[idx].title = title;
        if (content !== undefined) notesMemoryStore[idx].content = content;
        if (tags !== undefined) notesMemoryStore[idx].tags = tags;
        if (folderId !== undefined) notesMemoryStore[idx].folder_id = folderId || null;
        notesMemoryStore[idx].updated_at = new Date().toISOString();
        saveNotesStore();
        const { deleted_at, user_id, ...safeNote } = notesMemoryStore[idx];
        return res.json(safeNote);
    }

    try {
        const checkResult = await pool.query(
            'SELECT id FROM notes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.user.id]
        );
        if (checkResult.rows.length === 0) return res.status(404).json({ error: 'Note not found' });

        const result = await pool.query(
            `UPDATE notes
             SET title = COALESCE($1, title),
                 content = COALESCE($2, content),
                 tags = COALESCE($3, tags),
                 folder_id = COALESCE($4, folder_id)
             WHERE id = $5 AND user_id = $6
             RETURNING id, title, content, folder_id, tags, challenge_id, challenge_module, created_at, updated_at`,
            [title, content, tags, folderId, req.params.id, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        logger.error('PUT /api/notes/:id ERROR:', err);
        res.status(500).json({ error: 'Failed to update note' });
    }
});

// DELETE /api/notes/:id - Soft delete note
app.delete('/api/notes/:id', authenticateToken, async (req, res) => {
    if (useMemoryDB) {
        const idx = notesMemoryStore.findIndex(n => n.id === req.params.id && n.user_id === req.user.id && !n.deleted_at);
        if (idx === -1) return res.status(404).json({ error: 'Note not found' });
        notesMemoryStore[idx].deleted_at = new Date().toISOString();
        saveNotesStore();
        return res.json({ message: 'Note deleted successfully' });
    }
    try {
        const checkResult = await pool.query(
            'SELECT id FROM notes WHERE id = $1 AND user_id = $2 AND deleted_at IS NULL',
            [req.params.id, req.user.id]
        );
        if (checkResult.rows.length === 0) return res.status(404).json({ error: 'Note not found' });
        await pool.query(
            'UPDATE notes SET deleted_at = CURRENT_TIMESTAMP WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        res.json({ message: 'Note deleted successfully' });
    } catch (err) {
        logger.error('DELETE /api/notes/:id ERROR:', err);
        res.status(500).json({ error: 'Failed to delete note' });
    }
});

// ── CodeVault Folders API ────────────────────────────────────────────────────

// GET /api/folders - Get folder tree for user
app.get('/api/folders', authenticateToken, async (req, res) => {
    if (useMemoryDB) {
        const userFolders = foldersMemoryStore.filter(f => f.user_id === req.user.id);
        const results = userFolders.map(f => ({
            ...f,
            note_count: notesMemoryStore.filter(n => n.folder_id === f.id && n.user_id === req.user.id && !n.deleted_at).length
        }));
        return res.json(results);
    }
    try {
        const result = await pool.query(
            `SELECT f.id, f.name, f.parent_id, f.created_at,
                    COUNT(n.id) as note_count
             FROM folders f
             LEFT JOIN notes n ON f.id = n.folder_id AND n.deleted_at IS NULL
             WHERE f.user_id = $1
             GROUP BY f.id, f.name, f.parent_id, f.created_at
             ORDER BY f.created_at ASC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        logger.error('GET /api/folders ERROR:', err);
        res.status(500).json({ error: 'Failed to fetch folders' });
    }
});

// POST /api/folders - Create new folder
app.post('/api/folders', authenticateToken, async (req, res) => {
    const { name, parentId } = req.body;
    if (!name || name.trim().length === 0) return res.status(400).json({ error: 'Folder name is required' });

    if (useMemoryDB) {
        const duplicate = foldersMemoryStore.find(
            f => f.user_id === req.user.id && f.name === name.trim() && f.parent_id === (parentId || null)
        );
        if (duplicate) return res.status(400).json({ error: 'A folder with this name already exists in this location' });
        const now = new Date().toISOString();
        const newFolder = {
            id: uuidV4Notes(),
            user_id: req.user.id,
            name: name.trim(),
            parent_id: parentId || null,
            created_at: now
        };
        foldersMemoryStore.push(newFolder);
        saveNotesStore();
        const { user_id, ...safeFolder } = newFolder;
        return res.status(201).json(safeFolder);
    }

    try {
        const duplicateCheck = await pool.query(
            'SELECT id FROM folders WHERE user_id = $1 AND name = $2 AND parent_id IS NOT DISTINCT FROM $3',
            [req.user.id, name.trim(), parentId || null]
        );
        if (duplicateCheck.rows.length > 0) return res.status(400).json({ error: 'A folder with this name already exists in this location' });

        const result = await pool.query(
            'INSERT INTO folders (user_id, name, parent_id) VALUES ($1, $2, $3) RETURNING id, name, parent_id, created_at',
            [req.user.id, name.trim(), parentId || null]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        logger.error('POST /api/folders ERROR:', err);
        res.status(500).json({ error: 'Failed to create folder' });
    }
});

// PUT /api/folders/:id - Rename folder
app.put('/api/folders/:id', authenticateToken, async (req, res) => {
    const { name } = req.body;
    if (!name || name.trim().length === 0) return res.status(400).json({ error: 'Folder name is required' });

    if (useMemoryDB) {
        const idx = foldersMemoryStore.findIndex(f => f.id === req.params.id && f.user_id === req.user.id);
        if (idx === -1) return res.status(404).json({ error: 'Folder not found' });
        const duplicate = foldersMemoryStore.find(
            f => f.user_id === req.user.id && f.name === name.trim() &&
                f.parent_id === foldersMemoryStore[idx].parent_id && f.id !== req.params.id
        );
        if (duplicate) return res.status(400).json({ error: 'A folder with this name already exists in this location' });
        foldersMemoryStore[idx].name = name.trim();
        saveNotesStore();
        const { user_id, ...safeFolder } = foldersMemoryStore[idx];
        return res.json(safeFolder);
    }

    try {
        const checkResult = await pool.query(
            'SELECT id, parent_id FROM folders WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (checkResult.rows.length === 0) return res.status(404).json({ error: 'Folder not found' });
        const folder = checkResult.rows[0];
        const duplicateCheck = await pool.query(
            'SELECT id FROM folders WHERE user_id = $1 AND name = $2 AND parent_id IS NOT DISTINCT FROM $3 AND id != $4',
            [req.user.id, name.trim(), folder.parent_id, req.params.id]
        );
        if (duplicateCheck.rows.length > 0) return res.status(400).json({ error: 'A folder with this name already exists in this location' });
        const result = await pool.query(
            'UPDATE folders SET name = $1 WHERE id = $2 AND user_id = $3 RETURNING id, name, parent_id, created_at',
            [name.trim(), req.params.id, req.user.id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        logger.error('PUT /api/folders/:id ERROR:', err);
        res.status(500).json({ error: 'Failed to rename folder' });
    }
});

// DELETE /api/folders/:id - Delete folder (moves its notes/children to parent)
app.delete('/api/folders/:id', authenticateToken, async (req, res) => {
    if (useMemoryDB) {
        const idx = foldersMemoryStore.findIndex(f => f.id === req.params.id && f.user_id === req.user.id);
        if (idx === -1) return res.status(404).json({ error: 'Folder not found' });
        const parentId = foldersMemoryStore[idx].parent_id;
        // Move notes to parent
        notesMemoryStore.forEach(n => { if (n.folder_id === req.params.id) n.folder_id = parentId; });
        // Move child folders to parent
        foldersMemoryStore.forEach(f => { if (f.parent_id === req.params.id) f.parent_id = parentId; });
        foldersMemoryStore.splice(idx, 1);
        saveNotesStore();
        return res.json({ message: 'Folder deleted successfully' });
    }
    try {
        const checkResult = await pool.query(
            'SELECT id, parent_id FROM folders WHERE id = $1 AND user_id = $2',
            [req.params.id, req.user.id]
        );
        if (checkResult.rows.length === 0) return res.status(404).json({ error: 'Folder not found' });
        const folder = checkResult.rows[0];
        await pool.query('UPDATE notes SET folder_id = $1 WHERE folder_id = $2 AND user_id = $3', [folder.parent_id, req.params.id, req.user.id]);
        await pool.query('UPDATE folders SET parent_id = $1 WHERE parent_id = $2 AND user_id = $3', [folder.parent_id, req.params.id, req.user.id]);
        await pool.query('DELETE FROM folders WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id]);
        res.json({ message: 'Folder deleted successfully' });
    } catch (err) {
        logger.error('DELETE /api/folders/:id ERROR:', err);
        res.status(500).json({ error: 'Failed to delete folder' });
    }
});

// ── CodeVault Search and Tags API ───────────────────────────────────────────

// GET /api/search - Search notes
app.get('/api/search', authenticateToken, async (req, res) => {
    const { q, limit = 20 } = req.query;
    if (!q || q.trim().length === 0) return res.status(400).json({ error: 'Search query is required' });

    if (useMemoryDB) {
        const query = q.trim().toLowerCase();
        const results = notesMemoryStore
            .filter(n => n.user_id === req.user.id && !n.deleted_at &&
                (n.title.toLowerCase().includes(query) || n.content.toLowerCase().includes(query)))
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, parseInt(limit))
            .map(({ deleted_at, user_id, ...n }) => n);
        return res.json(results);
    }

    try {
        const result = await pool.query(
            `SELECT id, title, content, folder_id, tags, challenge_id, challenge_module, created_at, updated_at
             FROM notes
             WHERE user_id = $1 AND deleted_at IS NULL
               AND (title ILIKE $2 OR content ILIKE $2)
             ORDER BY updated_at DESC
             LIMIT $3`,
            [req.user.id, `%${q.trim()}%`, parseInt(limit)]
        );
        res.json(result.rows);
    } catch (err) {
        logger.error('GET /api/search ERROR:', err);
        res.status(500).json({ error: 'Search failed' });
    }
});

// GET /api/tags - Get all tags with usage count
app.get('/api/tags', authenticateToken, async (req, res) => {
    if (useMemoryDB) {
        const tagCount = {};
        notesMemoryStore
            .filter(n => n.user_id === req.user.id && !n.deleted_at)
            .forEach(n => (n.tags || []).forEach(tag => { tagCount[tag] = (tagCount[tag] || 0) + 1; }));
        const results = Object.entries(tagCount)
            .map(([tag, count]) => ({ tag, count }))
            .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
        return res.json(results);
    }
    try {
        const result = await pool.query(
            `SELECT unnest(tags) as tag, COUNT(*) as count
             FROM notes WHERE user_id = $1 AND deleted_at IS NULL
             GROUP BY tag ORDER BY count DESC, tag ASC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        logger.error('GET /api/tags ERROR:', err);
        res.status(500).json({ error: 'Failed to fetch tags' });
    }
});

// POST /api/notes/from-challenge - Create note from arcade challenge
app.post('/api/notes/from-challenge', authenticateToken, async (req, res) => {
    const sub = await getUserSubscription(req.user.id);
    const noteCount = await getNoteCountForUser(req.user.id);
    const noteLimit = sub === 'elite' ? 99999 : (sub === 'pro' ? 500 : 30);
    if (noteCount >= noteLimit) {
        return res.status(403).json({
            error: `CodeVault file limit (${noteLimit}) reached under the ${sub === 'basic' ? 'Basic (Free)' : 'Pro'} plan. Please upgrade your subscription to add more files.`
        });
    }

    const { challengeId, challengeTitle, challengeModule } = req.body;
    if (!challengeId || !challengeTitle) return res.status(400).json({ error: 'Challenge ID and title are required' });

    const title = `${challengeTitle} - Notes`;
    const content = `# ${challengeTitle}\n\n**Module:** ${challengeModule || 'Unknown'}\n**Challenge ID:** ${challengeId}\n\n## Key Concepts\n\n- \n\n## My Solution\n\n\`\`\`javascript\n// Your code here\n\`\`\`\n\n## Learnings\n\n- \n\n## Questions\n\n- \n`;

    if (useMemoryDB) {
        const now = new Date().toISOString();
        const newNote = {
            id: uuidV4Notes(),
            user_id: req.user.id,
            title,
            content,
            folder_id: null,
            tags: [challengeModule || 'challenge'],
            challenge_id: challengeId,
            challenge_module: challengeModule || null,
            created_at: now,
            updated_at: now,
            deleted_at: null
        };
        notesMemoryStore.push(newNote);
        saveNotesStore();
        const { deleted_at, user_id, ...safeNote } = newNote;
        return res.status(201).json(safeNote);
    }

    try {
        const result = await pool.query(
            `INSERT INTO notes (user_id, title, content, challenge_id, challenge_module, tags)
             VALUES ($1, $2, $3, $4, $5, $6)
             RETURNING id, title, content, folder_id, tags, challenge_id, challenge_module, created_at, updated_at`,
            [req.user.id, title, content, challengeId, challengeModule, [challengeModule || 'challenge']]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('POST /api/notes/from-challenge ERROR:', err);
        res.status(500).json({ error: 'Failed to create note from challenge' });
    }
});



// ── Factions API ─────────────────────────────────────────────────────────────

// Helper: Sync member XP from the latest user data
const syncFactionMemberXP = async (faction) => {
    if (!faction) return;
    for (const member of faction.members) {
        try {
            if (useMemoryDB) {
                const u = memoryStore.users.find(u => u.id === member.id);
                if (u) {
                    member.xp = u.xp || 0;
                    member.activity = u.activity || {};
                }
            } else {
                const r = await pool.query('SELECT xp, activity FROM users WHERE id = $1', [member.id]);
                if (r.rows[0]) {
                    member.xp = r.rows[0].xp || 0;
                    member.activity = r.rows[0].activity || {};
                }
            }
        } catch { }
    }
};

// GET all factions (with live XP sync)
app.get('/factions', async (req, res) => {
    try {
        const allFactions = Array.from(factions.values());
        // Sync XP for all members from live user data
        await Promise.all(allFactions.map(f => syncFactionMemberXP(f)));
        saveFactions();
        const list = allFactions
            .map(f => ({ ...f, totalXp: (f.members || []).reduce((sum, m) => sum + (m.xp || 0), 0) }))
            .sort((a, b) => b.totalXp - a.totalXp);
        res.json(list);
    } catch (err) {
        console.error('[FACTIONS GET]', err);
        res.status(500).json({ error: 'Failed to fetch factions' });
    }
});

// GET single faction
app.get('/factions/:id', async (req, res) => {
    const faction = factions.get(req.params.id);
    if (!faction) return res.status(404).json({ error: 'Faction not found' });
    await syncFactionMemberXP(faction);
    res.json({ ...faction, totalXp: (faction.members || []).reduce((s, m) => s + (m.xp || 0), 0) });
});

// Helper to get member limit based on guild level
const getMemberLimit = (xp) => {
    if (xp >= 8000) return 50;  // Level 5
    if (xp >= 5500) return 40;  // Level 4
    if (xp >= 3000) return 30;  // Level 3
    if (xp >= 1000) return 22;  // Level 2
    return 15;                  // Level 1
};

// POST create a faction
const FACTION_CREATE_MIN_XP = 0; // Temporarily 0 for testing
app.post('/factions/create', authenticateToken, async (req, res) => {
    const { name, description, emblem, isPublic } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Faction name is required' });
    // Check duplicate name
    for (const f of factions.values()) {
        if (f.name.toLowerCase() === name.trim().toLowerCase())
            return res.status(400).json({ error: 'A faction with this name already exists.' });
    }
    // Check if user already IN any faction
    for (const f of factions.values()) {
        if (f.members.find(m => m.id === req.user.id))
            return res.status(400).json({ error: 'Leave your current faction before founding a new one.' });
    }
    // Get current XP of founder
    let founderXP = 0;
    try {
        if (useMemoryDB) {
            const u = memoryStore.users.find(u => u.id === req.user.id);
            founderXP = u?.xp || 0;
        } else {
            const r = await pool.query('SELECT xp FROM users WHERE id = $1', [req.user.id]);
            founderXP = r.rows[0]?.xp || 0;
        }
    } catch { }
    // ── XP Gate: Apprentice badge (500 XP) required ───────────────
    if (founderXP < FACTION_CREATE_MIN_XP) {
        const needed = FACTION_CREATE_MIN_XP - founderXP;
        return res.status(403).json({
            error: `🛡️ You need ${needed} more XP to found a faction. Reach the Apprentice badge (500 XP) first!`
        });
    }
    const id = uuidV4();
    const newFaction = {
        id, name: name.trim(),
        description: description || '',
        emblem: emblem || '⚔️',
        ownerId: req.user.id,
        ownerName: req.user.username,
        members: [{ id: req.user.id, username: req.user.username, xp: founderXP, role: 'leader' }],
        pendingMembers: [],
        isPublic: isPublic !== undefined ? isPublic : true,
        totalXp: founderXP, // Added totalXp field to match frontend expectation
        createdAt: new Date().toISOString()
    };
    factions.set(id, newFaction);
    saveFactions();
    res.status(201).json({ id, name: newFaction.name, message: `Faction "${name}" established!` });
});


// POST join a faction
app.post('/factions/join/:id', authenticateToken, async (req, res) => {
    const faction = factions.get(req.params.id);
    if (!faction) return res.status(404).json({ error: 'Faction not found' });

    // 1. Check Capacity Limit
    const totalXP = faction.members.reduce((sum, m) => sum + (m.xp || 0), 0);
    const limit = getMemberLimit(totalXP);
    if (faction.members.length >= limit) {
        return res.status(400).json({ error: `Faction is full. Limit for Level ${Math.floor(Math.sqrt(totalXP / 100)) + 1} is ${limit} members.` });
    }

    // 2. Check already in any faction
    for (const f of factions.values()) {
        if (f.members.find(m => m.id === req.user.id))
            return res.status(400).json({ error: 'Already in a faction. Leave your current faction first.' });
        if (f.pendingMembers?.find(m => m.id === req.user.id))
            return res.status(400).json({ error: 'Already have a pending request for another faction.' });
    }

    // 3. Get current XP
    let xp = 0;
    try {
        if (useMemoryDB) {
            const u = memoryStore.users.find(u => u.id === req.user.id);
            xp = u?.xp || 0;
        } else {
            const r = await pool.query('SELECT xp FROM users WHERE id = $1', [req.user.id]);
            xp = r.rows[0]?.xp || 0;
        }
    } catch { }

    // 4. Handle Public vs Private
    if (faction.isPublic) {
        faction.members.push({ id: req.user.id, username: req.user.username, xp, role: 'member' });
        saveFactions();
        return res.json({ message: `Joined "${faction.name}"`, factionName: faction.name });
    } else {
        if (!faction.pendingMembers) faction.pendingMembers = [];
        faction.pendingMembers.push({ id: req.user.id, username: req.user.username, xp, requestedAt: new Date().toISOString() });
        saveFactions();
        return res.json({ message: `Request sent to "${faction.name}". Waiting for approval.`, pending: true });
    }
});

// Approval Endpoints
app.post('/factions/:id/approve', authenticateToken, (req, res) => {
    const { userId } = req.body;
    const faction = factions.get(req.params.id);
    if (!faction) return res.status(404).json({ error: 'Faction not found' });
    if (faction.ownerId !== req.user.id) return res.status(403).json({ error: 'Only leader can approve members.' });

    const requestIndex = (faction.pendingMembers || []).findIndex(m => m.id === userId);
    if (requestIndex === -1) return res.status(404).json({ error: 'Request not found' });

    const memberData = faction.pendingMembers[requestIndex];

    // Final Capacity Check
    const totalXP = faction.members.reduce((sum, m) => sum + (m.xp || 0), 0);
    if (faction.members.length >= getMemberLimit(totalXP)) return res.status(400).json({ error: 'Faction is already full.' });

    faction.members.push({ id: memberData.id, username: memberData.username, xp: memberData.xp, role: 'member' });
    faction.pendingMembers.splice(requestIndex, 1);
    saveFactions();
    res.json({ success: true, message: `Approved ${memberData.username}` });
});

app.post('/factions/:id/decline', authenticateToken, (req, res) => {
    const { userId } = req.body;
    const faction = factions.get(req.params.id);
    if (!faction) return res.status(404).json({ error: 'Faction not found' });
    if (faction.ownerId !== req.user.id) return res.status(403).json({ error: 'Only leader can decline members.' });

    const requestIndex = (faction.pendingMembers || []).findIndex(m => m.id === userId);
    if (requestIndex === -1) return res.status(404).json({ error: 'Request not found' });

    faction.pendingMembers.splice(requestIndex, 1);
    saveFactions();
    res.json({ success: true, message: 'Request declined.' });
});

// POST kick a member (leader only)
app.post('/factions/:id/kick', authenticateToken, (req, res) => {
    const { userId } = req.body;
    const faction = factions.get(req.params.id);
    if (!faction) return res.status(404).json({ error: 'Faction not found' });
    if (faction.ownerId !== req.user.id) return res.status(403).json({ error: 'Only leader can kick members.' });
    if (userId === req.user.id) return res.status(400).json({ error: 'You cannot kick yourself.' });

    faction.members = faction.members.filter(m => m.id !== userId);
    saveFactions();
    res.json({ success: true, message: 'Member removed from syndicate.' });
});

// POST toggle privacy
app.post('/factions/:id/toggle-privacy', authenticateToken, (req, res) => {
    const faction = factions.get(req.params.id);
    if (!faction) return res.status(404).json({ error: 'Faction not found' });
    if (faction.ownerId !== req.user.id) return res.status(403).json({ error: 'Only leader can change settings.' });

    faction.isPublic = !faction.isPublic;
    saveFactions();
    res.json({ success: true, isPublic: faction.isPublic, message: `Syndicate is now ${faction.isPublic ? 'Public' : 'Private'}` });
});

// POST leave a faction
app.post('/factions/leave/:id', authenticateToken, (req, res) => {
    const faction = factions.get(req.params.id);
    if (!faction) return res.status(404).json({ error: 'Faction not found' });
    const isOwner = faction.ownerId === req.user.id;
    const memberCount = faction.members.length;
    if (isOwner && memberCount > 1) {
        return res.status(400).json({ error: 'You are the leader. Disband the faction or transfer leadership first.' });
    }
    faction.members = faction.members.filter(m => m.id !== req.user.id);
    if (faction.members.length === 0 || isOwner) {
        factions.delete(req.params.id);
    }
    saveFactions();
    res.json({ message: 'You have left the faction.' });
});

// POST disband (leader only)
app.post('/factions/disband/:id', authenticateToken, (req, res) => {
    const faction = factions.get(req.params.id);
    if (!faction) return res.status(404).json({ error: 'Faction not found' });
    if (faction.ownerId !== req.user.id) return res.status(403).json({ error: 'Only the faction leader can disband.' });
    factions.delete(req.params.id);
    saveFactions();
    res.json({ message: `Faction "${faction.name}" has been disbanded.` });
});

app.post('/add-xp', authenticateToken, async (req, res) => {
    const { amount, module, level } = req.body;
    try {
        // 1. Check Memory Mode
        if (useMemoryDB) {
            let userIndex = memoryStore.users.findIndex(u => u.id === req.user.id);

            // ── Self-heal: user missing from memory (server restarted) ──
            if (userIndex === -1) {
                memoryStore.users.push({
                    id: req.user.id,
                    username: req.user.username,
                    email: `${req.user.username}@codesight.memory`,
                    password: 'memory_migrated',
                    xp: 0, css_level: 0, logic_level: 0, react_level: 0, mern_level: 0
                });
                userIndex = memoryStore.users.length - 1;
            }

            const user = memoryStore.users[userIndex];
            user.xp = (user.xp || 0) + amount;

            if (module && level !== undefined) {
                const key = module === 'css-odyssey' ? 'css_level' :
                    module === 'logic-lab' ? 'logic_level' :
                        module === 'react-quest' ? 'react_level' :
                            module === 'mern-mastery' ? 'mern_level' :
                                module === 'java-master' ? 'java_level' :
                                    module === 'cpp-master' ? 'cpp_level' :
                                        module === 'python-master' ? 'python_level' :
                                            module === 'go-master' ? 'go_level' : null;
                if (key) user[key] = Math.max(user[key] || 0, level);
            }

            // ── Track daily activity ─────────────────────────────────
            const today = getLocalDateKey();
            if (!user.activity) user.activity = {};
            user.activity[today] = (user.activity[today] || 0) + amount;

            // ── Broadcast live leaderboard update (memory mode) ──────
            const memLb = [...memoryStore.users]
                .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                .slice(0, 25)
                .map(u => ({ username: u.username, xp: u.xp || 0, level: computeLevel(u.xp || 0) }));
            io.emit('leaderboard-update', memLb);
            saveStore();

            return res.json({
                success: true,
                xp: user.xp,
                activity: user.activity || {},
                streak: computeStreakFromActivity(user.activity || {}),
                css_level: user.css_level || 0,
                logic_level: user.logic_level || 0,
                react_level: user.react_level || 0,
                mern_level: user.mern_level || 0,
                java_level: user.java_level || 0,
                cpp_level: user.cpp_level || 0,
                python_level: user.python_level || 0,
                go_level: user.go_level || 0
            });
        }

        // 2. PostgreSQL Mode
        const today = getLocalDateKey();
        let query = `
            UPDATE users SET 
                xp = xp + $1,
                activity = jsonb_set(
                    COALESCE(activity, '{}'::jsonb), 
                    path := array[$3], 
                    replacement := (COALESCE((activity->>$3)::int, 0) + $1)::text::jsonb, 
                    create_if_missing := true
                )
        `;
        let params = [amount, req.user.id, today];

        if (module && level !== undefined) {
            const col = module === 'css-odyssey' ? 'css_level' :
                module === 'logic-lab' ? 'logic_level' :
                    module === 'react-quest' ? 'react_level' :
                        module === 'mern-mastery' ? 'mern_level' :
                            module === 'java-master' ? 'java_level' :
                                module === 'cpp-master' ? 'cpp_level' :
                                    module === 'python-master' ? 'python_level' :
                                        module === 'go-master' ? 'go_level' : null;
            if (col) {
                query += `, ${col} = GREATEST(${col}, $4) `;
                params.push(level);
            }
        }

        query += 'WHERE id = $2 RETURNING xp, css_level, logic_level, react_level, mern_level, java_level, cpp_level, python_level, go_level, activity';

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            // Self-healing: Create user in SQL with full stats if they exist in JWT but not in DB
            const selfHealRes = await pool.query(
                `INSERT INTO users (id, username, email, password, xp, activity, css_level, logic_level, react_level, mern_level) 
                 VALUES ($1, $2, $3, $4, $5, jsonb_build_object($10::text, $5), $6, $7, $8, $9)
                 RETURNING xp, activity, css_level, logic_level, react_level, mern_level`,
                [
                    req.user.id,
                    req.user.username,
                    `user_${req.user.id.slice(0, 8)}@example.com`,
                    'oauth_migrated',
                    amount,
                    module === 'css-odyssey' ? level : 0,
                    module === 'logic-lab' ? level : 0,
                    module === 'react-quest' ? level : 0,
                    module === 'mern-mastery' ? level : 0,
                    today
                ]
            );
            return res.json({
                success: true,
                xp: selfHealRes.rows[0].xp,
                activity: selfHealRes.rows[0].activity,
                streak: computeStreakFromActivity(selfHealRes.rows[0].activity || {}),
                css_level: selfHealRes.rows[0].css_level,
                logic_level: selfHealRes.rows[0].logic_level,
                react_level: selfHealRes.rows[0].react_level,
                mern_level: selfHealRes.rows[0].mern_level,
                java_level: selfHealRes.rows[0].java_level || 0,
                cpp_level: selfHealRes.rows[0].cpp_level || 0,
                python_level: selfHealRes.rows[0].python_level || 0,
                go_level: selfHealRes.rows[0].go_level || 0
            });
        }

        // ── Broadcast leaderboard update so Hall of Fame refreshes live
        try {
            const lb = await pool.query(
                'SELECT username, xp FROM users ORDER BY xp DESC LIMIT 25'
            );
            io.emit('leaderboard-update', lb.rows.map(u => ({
                username: u.username, xp: u.xp || 0, level: computeLevel(u.xp || 0)
            })));
        } catch { }

        res.json({
            success: true,
            xp: result.rows[0].xp,
            activity: result.rows[0].activity,
            streak: computeStreakFromActivity(result.rows[0].activity || {}),
            css_level: result.rows[0].css_level,
            logic_level: result.rows[0].logic_level,
            react_level: result.rows[0].react_level,
            mern_level: result.rows[0].mern_level,
            java_level: result.rows[0].java_level,
            cpp_level: result.rows[0].cpp_level,
            python_level: result.rows[0].python_level,
            go_level: result.rows[0].go_level
        });

    } catch (err) {
        console.error('XP Sync Error:', err);
        res.status(500).json({ error: 'Failed to update XP' });
    }
});

app.post('/increment-session', authenticateToken, async (req, res) => {
    const { type } = req.body; // 'created' or 'joined'
    if (!['created', 'joined'].includes(type)) return res.status(400).json({ error: 'Invalid session type' });

    try {
        const column = type === 'created' ? 'created_count' : 'joined_count';

        if (useMemoryDB) {
            const user = memoryStore.users.find(u => u.id === req.user.id);
            if (user) {
                user[column] = (user[column] || 0) + 1;
                saveStore();
            }
            return res.json({ success: true, [type === 'created' ? 'createdCount' : 'joinedCount']: user[column] });
        }

        const result = await pool.query(
            `UPDATE users SET ${column} = ${column} + 1 WHERE id = $1 RETURNING created_count, joined_count`,
            [req.user.id]
        );

        res.json({
            success: true,
            createdCount: result.rows[0].created_count,
            joinedCount: result.rows[0].joined_count
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update session telemetry' });
    }
});

// ── GET /activity — user's 52-week contribution heatmap ─────────
app.get('/activity', authenticateToken, async (req, res) => {
    try {
        if (useMemoryDB) {
            const u = memoryStore.users.find(u => u.id === req.user.id);
            return res.json({ activity: u?.activity || {}, joinedAt: u?.joinedAt || null });
        }
        // PostgreSQL mode: activity column not yet added; return empty
        return res.json({ activity: {}, joinedAt: null });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch activity' });
    }
});

app.get('/active-rooms', (req, res) => {
    // Only return rooms that have at least one connected user
    const liveRooms = Array.from(rooms.entries())
        .filter(([, room]) => room.users && room.users.length > 0)
        .map(([id]) => id);
    console.log('[ACTIVE ROOMS] Live rooms (with users):', liveRooms);
    res.json(liveRooms);
});

// Bulk status check — POST with { roomIds: [...] }, returns map of id → { live, userCount, owner }
app.post('/rooms-status', (req, res) => {
    const { roomIds } = req.body;
    if (!Array.isArray(roomIds)) return res.status(400).json({ error: 'roomIds must be an array' });

    const result = {};
    for (const id of roomIds) {
        const room = rooms.get(id);
        if (!room) {
            result[id] = { live: false, userCount: 0, owner: null };
        } else {
            result[id] = {
                live: room.users && room.users.length > 0,
                userCount: room.users ? room.users.length : 0,
                owner: room.owner || null,
            };
        }
    }
    res.json(result);
});

// Debug endpoint to check room details
app.get('/room-status/:roomId', (req, res) => {
    const { roomId } = req.params;
    const room = rooms.get(roomId);
    if (room) {
        res.json({
            exists: true,
            userCount: room.users.length,
            users: room.users.map(u => u.username),
            adminId: room.adminId,
            owner: room.owner
        });
    } else {
        res.json({ exists: false });
    }
});

// Workspace metadata storage (in-memory for now)
const workspaceMetadata = new Map();

// Rooms Management — declared early so workspace routes can reference it
const rooms = new Map();

// ── Mount Git API (needs rooms + io) ────────────────────────────────────────
const createGitRouter = require('./gitAPI');
app.use('/api/git', createGitRouter({ rooms, io, pool, useMemoryDB, authenticateToken }));

const getUserSubscriptionByUsername = async (username) => {
    if (!username) return 'basic';
    if (username.toLowerCase() === 'admin') return 'elite';
    if (useMemoryDB) {
        const u = memoryStore.users.find(x => x.username?.toLowerCase() === username.toLowerCase());
        return u?.subscription || 'basic';
    }
    try {
        const { rows } = await pool.query('SELECT subscription FROM users WHERE LOWER(username) = LOWER($1)', [username]);
        return rows[0]?.subscription || 'basic';
    } catch (e) {
        return 'basic';
    }
};

const getWorkspaceCountForUser = (username) => {
    if (!username) return 0;
    let count = 0;
    const storeDir = path.join(__dirname, 'workspace_store');
    if (fs.existsSync(storeDir)) {
        try {
            const files = fs.readdirSync(storeDir);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    try {
                        const data = JSON.parse(fs.readFileSync(path.join(storeDir, file), 'utf8'));
                        if (data.owner?.toLowerCase() === username.toLowerCase()) {
                            count++;
                        }
                    } catch (e) {}
                }
            }
        } catch (e) {}
    }
    return count;
};

// Create workspace endpoint
app.post('/create-workspace', async (req, res) => {
    const { workspaceId, name, admin } = req.body;
    
    if (!workspaceId || !name || !admin) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const sub = await getUserSubscriptionByUsername(admin);
        const count = getWorkspaceCountForUser(admin);
        const limit = sub === 'elite' ? 99999 : (sub === 'pro' ? 50 : 10);
        if (count >= limit) {
            return res.status(403).json({
                error: `Workspace limit (${limit}) reached under the ${sub === 'basic' ? 'Basic (Free)' : 'Pro'} plan. Please upgrade your subscription to create more workspaces.`
            });
        }
    } catch (err) {
        logger.error('[WORKSPACE] Subscription limit check error:', err);
    }
    
    workspaceMetadata.set(workspaceId, {
        id: workspaceId,
        name,
        admin,
        createdAt: new Date().toISOString(),
        members: [admin]
    });

    saveRoomState(workspaceId, { owner: admin, snapshots: [], workspaceName: name });
    
    res.json({ success: true, workspace: workspaceMetadata.get(workspaceId) });
});

// Get workspace info endpoint
app.get('/workspace/:id', (req, res) => {
    const { id } = req.params;
    const workspace = workspaceMetadata.get(id);
    
    if (!workspace) {
        // If workspace doesn't exist in metadata but might exist as active room
        if (rooms.has(id)) {
            const room = rooms.get(id);
            return res.json({
                id,
                name: `Workspace ${id.slice(0, 12)}...`,
                admin: room.owner,
                exists: true,
                isActive: true
            });
        }
        return res.status(404).json({ error: 'Workspace not found' });
    }
    
    res.json({ ...workspace, exists: true, isActive: rooms.has(id) });
});

// Grace period for transient disconnects (network blips, page refreshes)
// Maps username → { timer, roomId, userData }
const pendingDisconnects = new Map();
const DISCONNECT_GRACE_MS = 5000; // 5 seconds to reconnect without being removed

function persistRoom(roomId) {
    const room = rooms.get(roomId);
    if (!room) return;
    const meta = workspaceMetadata.get(roomId);
    saveRoomState(roomId, {
        owner: room.owner,
        snapshots: room.snapshots || [],
        workspaceName: meta?.name || null,
    });
}

function hydrateRoomFromDisk(room) {
    if (!room?.fs) return {};
    const diskFiles = room.fs.loadFromDisk();
    room.files = diskFiles;
    return diskFiles;
}

io.on('connection', (socket) => {
    // ── Presence tracking ──────────────────────────────────────────────
    socket.on('presence:join', (userId) => {
        console.log(`[SOCKET] presence:join for userId: ${userId}, socket.id: ${socket.id}`);
        if (!userId) return;
        socket.data.userId = userId;
        socket.join(`user:${userId}`);
        if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
        onlineUsers.get(userId).add(socket.id);
        // Broadcast to all friends of this user that they are now online
        io.emit('friend:online', { userId });
    });

    // ── Advanced Allies Systems (Whisper & Arena) ──────────────────────
    socket.on('dm:send', ({ toId, fromId, fromUsername, message }) => {
        console.log(`[SOCKET] dm:send from ${fromUsername}(${fromId}) to user:${toId} | msg: ${message}`);
        console.log(`Rooms available:`, io.sockets.adapter.rooms);
        io.to(`user:${toId}`).emit('dm:receive', { fromId, fromUsername, message, timestamp: Date.now() });
    });

    socket.on('arena:challenge', ({ toId, fromId, fromUsername }) => {
        io.to(`user:${toId}`).emit('arena:challenge_received', { fromId, fromUsername, timestamp: Date.now() });
    });

    socket.on('arena:accept', ({ toId, fromId, fromUsername, roomId }) => {
        io.to(`user:${toId}`).emit('arena:challenge_accepted', { fromId, fromUsername, roomId });
    });

    socket.on('disconnect', () => {
        const userId = socket.data.userId;
        if (userId && onlineUsers.has(userId)) {
            onlineUsers.get(userId).delete(socket.id);
            if (onlineUsers.get(userId).size === 0) {
                onlineUsers.delete(userId);
                io.emit('friend:offline', { userId });
            }
        }
    });
    // ──────────────────────────────────────────────────────────────────

    socket.on('join-room', ({ roomId, username }) => {
        socket.join(roomId);
        socket.data.username = username; // store for end-session auth fallback

        const persisted = loadRoomState(roomId);

        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                adminId: socket.id,
                owner: persisted?.owner || username,
                users: [],
                permissions: {},
                files: {},
                snapshots: persisted?.snapshots || []
            });
            // Restore workspace metadata from disk if server restarted
            if (persisted && !workspaceMetadata.has(roomId)) {
                workspaceMetadata.set(roomId, {
                    id: roomId,
                    name: persisted.workspaceName || persisted.owner,
                    admin: persisted.owner,
                    createdAt: persisted.savedAt,
                    members: [persisted.owner],
                });
            }
        }
        const room = rooms.get(roomId);

        // Initialize robust FileSystem if not present
        if (!room.fs) {
            room.fs = new FileSystem(roomId, room.files || {});
        }

        // Restore files from disk (survives leave/rejoin and server restarts)
        const diskFiles = hydrateRoomFromDisk(room);
        const fileCount = Object.keys(diskFiles).length;
        if (fileCount > 0) {
            console.log(`[JOIN-ROOM] Restored ${fileCount} files from disk for room ${roomId}`);
        }

        // If the joining user is the original owner, they reclaim Admin rights
        if (room.owner === username) {
            room.adminId = socket.id;
        }

        // Safety check for legacy or corrupted room objects
        if (!room.snapshots) room.snapshots = [];
        if (!room.permissions) room.permissions = {};

        // Ensure disk has latest in-memory files (for any files created before disk sync)
        const roomDir = path.join(__dirname, 'tmp_builds', roomId);
        if (!fs.existsSync(roomDir)) {
            fs.mkdirSync(roomDir, { recursive: true });
        }
        Object.entries(room.files).forEach(([fileName, fileData]) => {
            const filePath = path.join(roomDir, fileName);
            const dir = path.dirname(filePath);
            if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
            if (!fs.existsSync(filePath)) {
                fs.writeFileSync(filePath, fileData.content || '');
            }
        });

        // ── INITIALIZE INTERACTIVE TERMINAL ──────────────────────
        if (!roomTerminals.has(roomId)) {
            const ptyProcess = pty.spawn(shell, [], {
                name: 'xterm-color',
                cols: 80,
                rows: 24,
                cwd: roomDir,
                env: process.env
            });

            ptyProcess.onData((data) => {
                io.in(roomId).emit('terminal-output', data);
            });

            roomTerminals.set(roomId, ptyProcess);
        }

        // --- Prevent Ghost Duplicate Users on Refresh ---
        // Cancel any pending disconnect grace period for this user (they reconnected!)
        const wasReconnecting = pendingDisconnects.has(username);
        if (wasReconnecting) {
            clearTimeout(pendingDisconnects.get(username).timer);
            pendingDisconnects.delete(username);
            console.log(`[RECONNECT] ${username} reconnected within grace period — canceling removal`);
        }

        // If this user is already in the room with an old stale socket, swap it silently.
        const staleIndex = room.users.findIndex(u => u.username === username && u.id !== socket.id);
        if (staleIndex !== -1) {
            const staleId = room.users[staleIndex].id;
            room.users.splice(staleIndex, 1);
            delete room.permissions[staleId];
            // Only broadcast user-left if this is NOT a grace-period reconnect
            if (!wasReconnecting) {
                socket.to(roomId).emit('user-left', { id: staleId, username });
            }
        }

        // ── 3-Tier Role System: admin | writer | viewer ──────────────
        const isCreator = room.owner === username;
        const role = isCreator ? 'admin' : 'viewer';
        const permission = isCreator ? 'admin' : 'viewer'; // Default to viewer
        room.permissions[socket.id] = permission;

        const userData = { id: socket.id, username, role, permission };
        room.users.push(userData);

        // Get workspace name from metadata
        const workspaceMeta = workspaceMetadata.get(roomId);
        const workspaceName = workspaceMeta?.name || room.owner;

        // Send files from the authoritative FileSystem instance
        const filesToSend = room.fs ? room.fs.getFiles() : room.files;
        const fileNames = Object.keys(filesToSend || {});
        console.log(`[JOIN-ROOM] Sending initial-data to ${username} in room ${roomId}: ${fileNames.length} files:`, fileNames);

        socket.emit('initial-data', {
            files: filesToSend,
            users: room.users,
            adminId: room.adminId,
            yourId: socket.id,
            snapshots: room.snapshots,
            workspaceOwner: room.owner,
            workspaceName: workspaceName
        });

        // Only broadcast user-joined if this is NOT a grace-period reconnect
        if (!wasReconnecting) {
            socket.to(roomId).emit('user-joined', { socketId: socket.id, username, role, permission });
        }

        // --- ADMIN ACTIONS: Role Management ---

        // Handle explicit room-state requests (safety net for missed initial-data)
        socket.on('request-room-state', ({ roomId: reqRoomId }) => {
            const reqRoom = rooms.get(reqRoomId);
            if (!reqRoom) return;
            if (reqRoom.fs) hydrateRoomFromDisk(reqRoom);
            const reqFiles = reqRoom.fs ? reqRoom.fs.getFiles() : reqRoom.files;
            console.log(`[REQUEST-STATE] Sending room state to ${socket.id} for room ${reqRoomId}: ${Object.keys(reqFiles || {}).length} files`);
            socket.emit('initial-data', {
                files: reqFiles,
                users: reqRoom.users,
                adminId: reqRoom.adminId,
                yourId: socket.id,
                snapshots: reqRoom.snapshots,
                workspaceOwner: reqRoom.owner,
                workspaceName: workspaceMetadata.get(reqRoomId)?.name || reqRoom.owner
            });
        });
        socket.on('set-role', ({ targetId, newRole }) => {
            if (socket.id !== room.adminId) return; // Only admin can change roles
            if (targetId === room.adminId) return;   // Can't change own admin role

            // Map role to permission
            const permMap = { 'writer': 'writer', 'viewer': 'viewer', 'admin': 'admin' };
            const newPermission = permMap[newRole] || 'read';

            // Enforce Single Writer Rule
            if (newPermission === 'write') {
                Object.keys(room.permissions).forEach(id => {
                    if (id !== targetId && id !== room.adminId) {
                        room.permissions[id] = 'read';
                        const userToDowngrade = room.users.find(u => u.id === id);
                        if (userToDowngrade) {
                            userToDowngrade.role = 'reviewer';
                            userToDowngrade.permission = 'read';
                            io.to(id).emit('role-changed', { role: 'reviewer', permission: 'read' });
                            io.in(roomId).emit('user-role-updated', { targetId: id, role: 'reviewer', permission: 'read' });
                        }
                    }
                });
            }

            room.permissions[targetId] = newPermission;

            // Update user in room list
            const userInRoom = room.users.find(u => u.id === targetId);
            if (userInRoom) {
                userInRoom.role = newRole;
                userInRoom.permission = newPermission;
            }

            // Notify the target user of their new role
            io.to(targetId).emit('role-changed', { role: newRole, permission: newPermission });
            // Notify everyone in room to refresh user list
            io.in(roomId).emit('user-role-updated', { targetId, role: newRole, permission: newPermission });
        });

        // New permission system handler
        socket.on('change-permission', ({ targetId, permission }) => {
            if (socket.id !== room.adminId) return; // Only admin can change permissions
            if (targetId === room.adminId) return;   // Can't change admin's permission

            // Update permission
            room.permissions[targetId] = permission;
            const userInRoom = room.users.find(u => u.id === targetId);
            if (userInRoom) {
                userInRoom.permission = permission;
                userInRoom.role = permission === 'admin' ? 'admin' : permission === 'writer' ? 'writer' : 'viewer';
            }

            // Notify the target user
            io.to(targetId).emit('permission-changed', { permission });
            // Notify all users in the room
            io.in(roomId).emit('user-status-updated', { targetId, permission });
        });

        // Legacy support — still works for toggle
        socket.on('update-permissions', ({ targetId, permission }) => {
            if (socket.id !== room.adminId) return;

            // Map old permission names to new ones
            const newPermission = permission === 'write' ? 'writer' : permission === 'read' ? 'viewer' : permission;

            room.permissions[targetId] = newPermission;
            const userInRoom = room.users.find(u => u.id === targetId);
            if (userInRoom) {
                userInRoom.role = newPermission === 'writer' ? 'writer' : 'viewer';
                userInRoom.permission = newPermission;
            }
            io.to(targetId).emit('permission-changed', { permission: newPermission });
            io.in(roomId).emit('user-status-updated', { targetId, permission: newPermission });
        });

        socket.on('kick-user', ({ targetId }) => {
            if (socket.id !== room.adminId) return;
            io.to(targetId).emit('get-kicked');
        });

        // --- WARP DRIVE LOGIC ---
        socket.on('take-snapshot', ({ name }) => {
            if (!room) return;
            const newSnapshot = {
                id: uuidV4(),
                name: name || `Snapshot ${room.snapshots.length + 1}`,
                timestamp: new Date().toISOString(),
                files: JSON.parse(JSON.stringify(room.fs ? room.fs.getFiles() : room.files)),
                creator: username
            };
            room.snapshots.push(newSnapshot);
            persistRoom(roomId);
            io.in(roomId).emit('snapshot-captured', newSnapshot);
        });

        socket.on('warp-to-snapshot', ({ snapshotId }) => {
            if (!room) return;
            const snapshot = room.snapshots.find(s => s.id === snapshotId);
            if (snapshot) {
                const warpedFiles = JSON.parse(JSON.stringify(snapshot.files));
                room.files = warpedFiles;
                if (room.fs) {
                    room.fs.files = warpedFiles;
                    Object.entries(warpedFiles).forEach(([name, data]) => {
                        room.fs.syncFileToDisk(name);
                    });
                }
                persistRoom(roomId);
                io.in(roomId).emit('files-warped', {
                    files: room.files,
                    warpedBy: username,
                    snapshotName: snapshot.name
                });
            }
        });

        // --- BUILT-IN TERMINAL CORE ---
        socket.on('terminal-input', ({ input }) => {
            const ptyProcess = roomTerminals.get(roomId);
            if (ptyProcess) {
                ptyProcess.write(input);
            }
        });

        socket.on('terminal-command', ({ command }) => {
            const ptyProcess = roomTerminals.get(roomId);
            if (ptyProcess && command) {
                ptyProcess.write(command + '\r\n');
            }
        });

        socket.on('terminal-resize', ({ cols, rows }) => {
            const ptyProcess = roomTerminals.get(roomId);
            if (ptyProcess) {
                try {
                    ptyProcess.resize(cols, rows);
                } catch (e) {
                    console.error('Resize failed:', e);
                }
            }
        });

        // ── WebRTC Multi-User Video Call Signaling ────────────────────────
        // Relay offer to a specific peer
        socket.on('webrtc-offer', ({ roomId: rId, offer, targetId }) => {
            socket.to(targetId).emit('webrtc-offer', { offer, from: socket.id });
        });

        // Relay answer to a specific peer
        socket.on('webrtc-answer', ({ roomId: rId, answer, targetId }) => {
            socket.to(targetId).emit('webrtc-answer', { answer, from: socket.id });
        });

        // Relay ICE candidate to a specific peer
        socket.on('webrtc-ice-candidate', ({ roomId: rId, candidate, targetId }) => {
            socket.to(targetId).emit('webrtc-ice-candidate', { candidate, from: socket.id });
        });

        // User joined the video call — notify everyone else in the room
        socket.on('video-call-join', ({ roomId: rId, username }) => {
            socket.to(rId).emit('video-call-user-joined', { socketId: socket.id, username });
            console.log(`[VIDEO] ${username} joined video call in room ${rId}`);
        });

        // User left the video call — notify everyone else
        socket.on('video-call-leave', ({ roomId: rId, username }) => {
            socket.to(rId).emit('video-call-user-left', { socketId: socket.id, username });
            console.log(`[VIDEO] ${username} left video call in room ${rId}`);
        });

        // Broadcast mute/video toggle state to all peers
        socket.on('video-call-state', ({ roomId: rId, isMuted, isVideoOn, username }) => {
            socket.to(rId).emit('video-call-peer-state', { socketId: socket.id, isMuted, isVideoOn, username });
        });

        socket.on('end-call', ({ roomId: rId }) => {
            socket.to(rId).emit('call-ended');
        });
    });

    socket.on('code-change', ({ roomId, fileName, content }) => {
        const room = rooms.get(roomId);
        if (room && room.fs && room.fs.updateFileContent(fileName, content)) {
            socket.to(roomId).emit('code-update', { fileName, content, socketId: socket.id });
        }
    });

    // Chat message handler
    socket.on('chat-message', ({ roomId, username, message, timestamp }) => {
        // Broadcast chat message to all users in the room including sender
        io.in(roomId).emit('chat-message', { username, message, timestamp });
    });

    socket.on('cursor-change', ({ roomId, fileName, cursor, username }) => {
        socket.to(roomId).emit('cursor-update', { socketId: socket.id, fileName, cursor, username });
    });

    socket.on('typing-start', ({ roomId, username }) => {
        socket.to(roomId).emit('typing-start', { username });
    });

    socket.on('typing-stop', ({ roomId }) => {
        socket.to(roomId).emit('typing-stop');
    });

    socket.on('file-create', ({ roomId, fileName, language }) => {
        const room = rooms.get(roomId);
        if (room && room.fs) {
            // Check if it's a folder (no extension)
            let result;
            if (!fileName.includes('.')) {
                result = room.fs.createFolder(fileName);
            } else {
                // Use default snippets for new files
                const defaultSnippets = {
                    javascript: "// JavaScript\nconsole.log('Hello!');\n",
                    typescript: "// TypeScript\nconst greet = (name: string): string => {\n  return `Hello, ${name}!`;\n};\n",
                    html: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>\n",
                    css: "/* Styles */\n* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n",
                    json: "{\n  \"name\": \"\",\n  \"version\": \"1.0.0\"\n}\n",
                    python: "# Python\nprint('Hello!')\n",
                    cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello!\" << std::endl;\n    return 0;\n}\n",
                    java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello!\");\n    }\n}\n",
                    markdown: "# Title\n\nWrite your documentation here.\n",
                    yaml: "# YAML Configuration\nname: my-app\nversion: 1.0.0\n",
                    sql: "-- SQL\nSELECT * FROM table_name;\n",
                    plaintext: "",
                    shell: "#!/bin/bash\necho \"Hello!\"\n",
                };
                const content = defaultSnippets[language] || '';
                result = room.fs.createFile(fileName, content, language);
            }

            if (result) {
                room.files = room.fs.getFiles();
                persistRoom(roomId);
                io.in(roomId).emit('file-created', result);
            }
        }
    });

    socket.on('files-batch-create', ({ roomId, files }) => {
        const room = rooms.get(roomId);
        if (room && room.fs) {
            const createdFiles = [];
            files.forEach(({ fileName, language }) => {
                let result;
                if (!fileName.includes('.')) {
                    result = room.fs.createFolder(fileName);
                } else {
                    const defaultSnippets = {
                        javascript: "// JavaScript\nconsole.log('Hello!');\n",
                        typescript: "// TypeScript\nconst greet = (name: string): string => {\n  return `Hello, ${name}!`;\n};\n",
                        html: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Document</title>\n</head>\n<body>\n  \n</body>\n</html>\n",
                        css: "/* Styles */\n* {\n  box-sizing: border-box;\n  margin: 0;\n  padding: 0;\n}\n",
                        json: "{\n  \"name\": \"\",\n  \"version\": \"1.0.0\"\n}\n",
                        python: "# Python\nprint('Hello!')\n",
                        cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello!\" << std::endl;\n    return 0;\n}\n",
                        java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello!\");\n    }\n}\n",
                        markdown: "# Title\n\nWrite your documentation here.\n",
                        yaml: "# YAML Configuration\nname: my-app\nversion: 1.0.0\n",
                        sql: "-- SQL\nSELECT * FROM table_name;\n",
                        plaintext: "",
                        shell: "#!/bin/bash\necho \"Hello!\"\n",
                    };
                    const content = defaultSnippets[language] || '';
                    result = room.fs.createFile(fileName, content, language);
                }
                if (result) createdFiles.push(result);
            });
            if (createdFiles.length > 0) {
                room.files = room.fs.getFiles();
                persistRoom(roomId);
                io.in(roomId).emit('files-batch-created', { files: createdFiles });
            }
        }
    });

    socket.on('file-delete', ({ roomId, fileName }) => {
        const room = rooms.get(roomId);
        if (room && room.fs && room.fs.deleteFile(fileName)) {
            room.files = room.fs.getFiles();
            persistRoom(roomId);
            io.in(roomId).emit('file-deleted', { fileName });
        }
    });

    socket.on('file-rename', ({ roomId, oldName, newName }) => {
        const room = rooms.get(roomId);
        if (room && room.fs) {
            const result = room.fs.renameFile(oldName, newName);
            if (result) {
                room.files = room.fs.getFiles();
                persistRoom(roomId);
                io.in(roomId).emit('file-renamed', result);
            }
        }
    });

    socket.on('folder-delete', ({ roomId, folderPath }) => {
        const room = rooms.get(roomId);
        if (room && room.fs) {
            const deletedFiles = room.fs.deleteFolder(folderPath);
            if (deletedFiles) {
                room.files = room.fs.getFiles();
                persistRoom(roomId);
                io.in(roomId).emit('folder-deleted', { folderPath, deletedFiles });
            }
        }
    });

    socket.on('folder-rename', ({ roomId, oldPath, newPath }) => {
        const room = rooms.get(roomId);
        if (room && room.fs) {
            const renamedMap = room.fs.renameFolder(oldPath, newPath);
            if (renamedMap) {
                room.files = room.fs.getFiles();
                persistRoom(roomId);
                io.in(roomId).emit('folder-renamed', { oldPath, newPath, renamedMap });
            }
        }
    });

    socket.on('end-session', ({ roomId }) => {
        const room = rooms.get(roomId);
        // Allow end-session if socket is the current adminId OR if the username matches the room owner
        const isAdmin = room && (socket.id === room.adminId || socket.data?.username === room.owner);
        if (room && isAdmin) {
            // 1. Notify everyone inside the editor room
            io.in(roomId).emit('session-ended', { 
                roomId,
                message: 'The workspace owner has permanently ended this session.' 
            });

            // 2. Broadcast globally so Workspace page listeners (not inside the room) also update
            io.emit('session-terminated-global', { roomId });
            
            // Delete the room from active rooms
            rooms.delete(roomId);
            
            // Delete workspace metadata
            workspaceMetadata.delete(roomId);

            // Only wipe persisted files when admin explicitly ends the session
            deleteRoomState(roomId);
            deleteRoomFiles(roomId);
            
            console.log(`[SESSION ENDED] Room ${roomId} permanently terminated by admin`);
        } else if (room && !isAdmin) {
            socket.emit('error', { message: 'Only the workspace owner can end the session.' });
        }
    });

    // Handle explicit leave (keeps room active)
    socket.on('leave-workspace', ({ roomId, username }) => {
        const room = rooms.get(roomId);
        if (room) {
            const userIndex = room.users.findIndex(u => u.id === socket.id);
            if (userIndex !== -1) {
                room.users.splice(userIndex, 1);
                socket.to(roomId).emit('user-left', { id: socket.id, username });
                socket.leave(roomId);
                console.log(`[USER LEFT] ${username} left room ${roomId} (room still active, ${room.users.length} users remaining)`);
            }
            // IMPORTANT: Do NOT delete the room even if empty
            // Room should persist until explicitly ended by admin
            persistRoom(roomId);
        }
    });



    socket.on('disconnecting', () => {
        socket.rooms.forEach(roomId => {
            if (roomId === socket.id) return;
            
            const room = rooms.get(roomId);
            if (room) {
                const userIndex = room.users.findIndex(u => u.id === socket.id);
                if (userIndex !== -1) {
                    const userData = room.users[userIndex];
                    const username = userData.username;

                    // Cancel any existing grace-period timer for this user
                    if (pendingDisconnects.has(username)) {
                        clearTimeout(pendingDisconnects.get(username).timer);
                    }

                    // Schedule removal after grace period
                    const timer = setTimeout(() => {
                        pendingDisconnects.delete(username);
                        const currentRoom = rooms.get(roomId);
                        if (currentRoom) {
                            const idx = currentRoom.users.findIndex(u => u.username === username);
                            if (idx !== -1) {
                                currentRoom.users.splice(idx, 1);
                                io.to(roomId).emit('user-left', { id: socket.id, username });
                                console.log(`[USER DISCONNECTED] ${username} removed from room ${roomId} after grace period (${currentRoom.users.length} users remaining)`);
                                if (currentRoom.users.length === 0) persistRoom(roomId);
                            }
                        }
                    }, DISCONNECT_GRACE_MS);

                    pendingDisconnects.set(username, { timer, roomId, userData });
                    console.log(`[USER DISCONNECTING] ${username} disconnected from room ${roomId} — grace period ${DISCONNECT_GRACE_MS / 1000}s started`);
                }
            }
        });
    });

    socket.on('disconnect', () => {
        // Basic cleanup handled by disconnecting but kept for consistency
    });

    // ── Code Wars Arena Socket Handlers ──────────────────────────────────
    socket.on('cw-create-room', async ({ roomConfig, userId, username, factionId }) => {
        try {
            console.log(`🏗️ [CW Socket] Creating room - User: ${username} (ID: ${userId}), Faction: ${factionId}`);
            console.log(`🏗️ [CW Socket] Room config:`, roomConfig);
            
            const room = intraFactionArena.createRoom(userId, username, factionId, roomConfig);
            
            // Join the socket room immediately
            socket.join(room.id);
            
            console.log(`✅ [CW Socket] Room ${room.id} created and joined`);
            console.log(`📊 [CW Socket] Total active rooms: ${intraFactionArena.activeRooms.size}`);
            console.log(`📊 [CW Socket] Room details:`, {
                id: room.id,
                name: room.name,
                isPrivate: room.isPrivate,
                factionId: room.factionId,
                creatorId: room.creatorId,
                status: room.status,
                teams: room.teams.map(t => ({ id: t.id, players: t.players.length }))
            });
            
            // Verify room was stored
            const verifyRoom = intraFactionArena.getRoomById(room.id);
            if (verifyRoom) {
                console.log(`✅ [CW Socket] Room ${room.id} verified in storage`);
            } else {
                console.error(`❌ [CW Socket] Room ${room.id} NOT found in storage after creation!`);
            }
            
            // Send success response
            socket.emit('cw-room-created', {
                success: true,
                room: intraFactionArena.sanitizeRoomForClient(room)
            });
            
            // Broadcast to faction that a new room is available (if public)
            if (!room.isPrivate) {
                io.emit('cw-room-list-updated', {
                    factionId: room.factionId
                });
            }
            
        } catch (error) {
            console.error(`❌ [CW Socket] Create room error:`, error.message);
            console.error(`❌ [CW Socket] Stack:`, error.stack);
            socket.emit('cw-error', { error: error.message });
        }
    });

    socket.on('cw-join-room', async ({ roomId, userId, username, factionId, password }) => {
        try {
            console.log(`🚪 [CW Socket] User ${username} (ID: ${userId}) attempting to join room ${roomId}`);
            console.log(`🚪 [CW Socket] Faction: ${factionId}, Has password: ${!!password}`);
            console.log(`📊 [CW Socket] Current active rooms: ${intraFactionArena.activeRooms.size}`);
            
            // Debug: List all room IDs
            if (intraFactionArena.activeRooms.size > 0) {
                const roomIds = Array.from(intraFactionArena.activeRooms.keys());
                console.log(`📊 [CW Socket] Available room IDs:`, roomIds);
            }
            
            // Check if room exists
            const roomExists = intraFactionArena.getRoomById(roomId);
            if (!roomExists) {
                console.error(`❌ [CW Socket] Room ${roomId} not found!`);
                console.log(`📊 [CW Socket] Searched for: "${roomId}" (length: ${roomId.length})`);
                socket.emit('cw-error', { error: `Room ${roomId} not found. It may have expired or been deleted.` });
                return;
            }
            
            console.log(`✅ [CW Socket] Room ${roomId} found! Status: ${roomExists.status}, Players: ${roomExists.teams.reduce((sum, t) => sum + t.players.length, 0)}`);
            
            const result = intraFactionArena.joinRoom(userId, username, factionId, roomId, password);
            
            // Join the socket room (use simple roomId like workspace)
            socket.join(roomId);
            
            console.log(`✅ [CW Socket] User ${username} joined room ${roomId} as ${result.role}`);
            console.log(`✅ [CW Socket] Team: ${result.teamId || 'spectator'}`);
            
            // Notify everyone in the room
            socket.to(roomId).emit('cw-player-joined', {
                userId,
                username,
                role: result.role,
                teamId: result.teamId
            });
            
            // Send success response to joiner
            socket.emit('cw-room-joined', {
                success: true,
                room: intraFactionArena.sanitizeRoomForClient(result.room),
                role: result.role
            });
            
            // Broadcast updated room to all players
            io.to(roomId).emit('cw-room-update', {
                room: intraFactionArena.sanitizeRoomForClient(result.room)
            });
            
        } catch (error) {
            console.error(`❌ [CW Socket] Join room error:`, error.message);
            console.error(`❌ [CW Socket] Stack:`, error.stack);
            socket.emit('cw-error', { error: error.message });
        }
    });

    socket.on('cw-leave-room', ({ roomId, userId, username }) => {
        try {
            console.log(`🚪 [CW Socket] User ${username} (ID: ${userId}) leaving room ${roomId}`);
            
            const room = intraFactionArena.getRoomById(roomId);
            
            if (!room) {
                socket.emit('cw-left-room', { success: true });
                return;
            }

            // Check if game is in progress BEFORE removing player
            const isGameInProgress = room.status === 'in-progress';
            
            // Find which team the user belongs to BEFORE removing
            let leavingTeam = null;
            let leavingTeamCopy = null;
            for (const team of room.teams) {
                if (team.players.some(p => p.id === userId)) {
                    leavingTeam = team;
                    // Make a copy of team data before removal
                    leavingTeamCopy = {
                        id: team.id,
                        name: team.name,
                        players: [...team.players]
                    };
                    break;
                }
            }
            
            // Count teams BEFORE removing player
            const totalTeams = room.teams.length;
            const teamsWithPlayers = room.teams.filter(t => t.players.length > 0).length;
            
            console.log(`📊 [CW Socket] Before leave - Total teams: ${totalTeams}, Teams with players: ${teamsWithPlayers}, Game in progress: ${isGameInProgress}`);
            
            // If game is in progress and this is a 2-team match, handle forfeit BEFORE removing
            if (isGameInProgress && leavingTeamCopy && totalTeams === 2) {
                const winningTeam = room.teams.find(t => t.id !== leavingTeamCopy.id);
                
                if (winningTeam) {
                    console.log(`🏆 [CW Socket] Team ${leavingTeamCopy.name} forfeiting. Team ${winningTeam.name} wins!`);
                    
                    // Create game results
                    const gameResults = {
                        winner: {
                            teamId: winningTeam.id,
                            teamName: winningTeam.name,
                            score: room.scores?.[winningTeam.id] || 0
                        },
                        rankings: [
                            {
                                teamId: winningTeam.id,
                                teamName: winningTeam.name,
                                score: room.scores?.[winningTeam.id] || 0,
                                players: winningTeam.players
                            },
                            {
                                teamId: leavingTeamCopy.id,
                                teamName: leavingTeamCopy.name,
                                score: room.scores?.[leavingTeamCopy.id] || 0,
                                players: leavingTeamCopy.players,
                                forfeited: true
                            }
                        ],
                        gameStats: {
                            totalQuestions: room.questions?.length || 0,
                            gameDuration: room.timeLimit || 0,
                            totalPlayers: room.teams.reduce((sum, team) => sum + team.players.length, 0)
                        },
                        reason: 'forfeit',
                        forfeitedTeam: leavingTeamCopy.name
                    };
                    
                    // Update room status
                    room.status = 'completed';
                    room.gameResults = gameResults;
                    
                    console.log(`📤 [CW Socket] Sending game-ended event to all players in room ${roomId}`);
                    
                    // Notify ALL players in the room FIRST (including the one leaving)
                    io.to(roomId).emit('cw-game-ended', {
                        room: intraFactionArena.sanitizeRoomForClient(room),
                        results: gameResults,
                        reason: 'forfeit'
                    });
                    
                    // Also send to the leaving player's socket directly to ensure they get it
                    socket.emit('cw-game-ended', {
                        room: intraFactionArena.sanitizeRoomForClient(room),
                        results: gameResults,
                        reason: 'forfeit'
                    });
                    
                    console.log(`📤 [CW Socket] Game-ended event sent to room and leaving player`);
                    console.log(`📤 [CW Socket] NOT sending cw-left-room - client will handle navigation from results page`);
                    
                    // Now remove the player from the room
                    socket.leave(roomId);
                    intraFactionArena.leaveRoom(userId);
                    
                    // DON'T send cw-left-room here - let the client handle navigation after seeing results
                    // The client will show results page and user can click "Back to Menu" when ready
                    
                    console.log(`✅ [CW Socket] Forfeit handled, player removed from room, returning early`);
                    return;
                }
            }
            
            // For multi-team or non-game scenarios, proceed normally
            const success = intraFactionArena.leaveRoom(userId);
            
            if (success) {
                // Leave the socket room
                socket.leave(roomId);
                
                console.log(`✅ [CW Socket] User ${username} left room ${roomId}`);
                
                // If game is in progress with multiple teams, notify others
                if (isGameInProgress && leavingTeamCopy && totalTeams > 2) {
                    console.log(`📢 [CW Socket] Team ${leavingTeamCopy.name} left the match`);
                    
                    io.to(roomId).emit('cw-team-forfeited', {
                        teamId: leavingTeamCopy.id,
                        teamName: leavingTeamCopy.name,
                        remainingTeams: teamsWithPlayers - 1
                    });
                    
                    // Update room
                    const updatedRoom = intraFactionArena.getRoomById(roomId);
                    if (updatedRoom) {
                        io.to(roomId).emit('cw-room-update', {
                            room: intraFactionArena.sanitizeRoomForClient(updatedRoom)
                        });
                    }
                } else {
                    // Not in game, just notify others
                    socket.to(roomId).emit('cw-player-left', { userId, username });
                    
                    // Broadcast updated room
                    const updatedRoom = intraFactionArena.getRoomById(roomId);
                    if (updatedRoom) {
                        io.to(roomId).emit('cw-room-update', {
                            room: intraFactionArena.sanitizeRoomForClient(updatedRoom)
                        });
                    } else {
                        console.log(`ℹ️ [CW Socket] Room ${roomId} was deleted (no players left)`);
                    }
                }
            }
            
            socket.emit('cw-left-room', { success: true });
            
        } catch (error) {
            console.error(`❌ [CW Socket] Leave room error:`, error.message);
            socket.emit('cw-error', { error: error.message });
        }
    });

    socket.on('cw-start-game', async ({ roomId, userId }) => {
        try {
            console.log(`🎮 [CW Socket] Starting game - Room: ${roomId}, User: ${userId}`);
            
            const room = await intraFactionArena.startGame(roomId, userId);
            
            console.log(`✅ [CW Socket] Game started for room ${roomId}`);
            
            // Notify all players
            io.to(roomId).emit('cw-game-started', {
                room: intraFactionArena.sanitizeRoomForClient(room)
            });
            
        } catch (error) {
            console.error(`❌ [CW Socket] Start game error:`, error.message);
            socket.emit('cw-error', { error: error.message });
        }
    });
    
    // End player's contest early
    socket.on('cw-end-contest', ({ roomId, userId, username }) => {
        try {
            console.log(`🏁 [CW Socket] User ${username} ending contest in room ${roomId}`);
            
            const result = intraFactionArena.endPlayerContest(roomId, userId);
            
            console.log(`✅ [CW Socket] Player finished: ${result.finishedCount}/${result.totalPlayers}`);
            
            // Notify the player
            socket.emit('cw-contest-ended', {
                success: true,
                ...result
            });
            
            // If all players finished, game will end automatically
            // Otherwise, just update room state
            if (!result.allFinished) {
                const room = intraFactionArena.getRoomById(roomId);
                if (room) {
                    io.to(roomId).emit('cw-room-update', {
                        room: intraFactionArena.sanitizeRoomForClient(room)
                    });
                }
            }
            
        } catch (error) {
            console.error(`❌ [CW Socket] End contest error:`, error.message);
            socket.emit('cw-error', { error: error.message });
        }
    });
    
    // Get faction rooms (for refreshing room list)
    socket.on('cw-get-faction-rooms', ({ factionId }) => {
        try {
            console.log(`📋 [CW Socket] Getting rooms for faction ${factionId}`);
            const rooms = intraFactionArena.getRoomsByFaction(factionId);
            console.log(`📋 [CW Socket] Found ${rooms.length} public rooms for faction ${factionId}`);
            
            // Debug: Show all active rooms
            console.log(`📊 [CW Socket] Total active rooms in system: ${intraFactionArena.activeRooms.size}`);
            if (intraFactionArena.activeRooms.size > 0) {
                console.log(`📊 [CW Socket] All rooms:`, Array.from(intraFactionArena.activeRooms.values()).map(r => ({
                    id: r.id,
                    name: r.name,
                    factionId: r.factionId,
                    isPrivate: r.isPrivate,
                    status: r.status,
                    players: r.teams.reduce((sum, t) => sum + t.players.length, 0)
                })));
            }
            
            socket.emit('cw-faction-rooms', { rooms });
        } catch (error) {
            console.error(`❌ [CW Socket] Get faction rooms error:`, error.message);
            socket.emit('cw-error', { error: error.message });
        }
    });

    socket.on('join-code-wars-room', ({ roomId, userId }) => {
        console.log(`🎮 User ${userId} joining Code Wars room ${roomId}`);
        socket.join(`room_${roomId}`);
        
        // Notify room about socket connection
        socket.to(`room_${roomId}`).emit('player-connected', { userId });
    });

    socket.on('leave-code-wars-room', ({ roomId, userId }) => {
        console.log(`🚪 User ${userId} leaving Code Wars room ${roomId}`);
        socket.leave(`room_${roomId}`);
        
        // Notify room about socket disconnection
        socket.to(`room_${roomId}`).emit('player-disconnected', { userId });
    });

    // ── Chat Real-Time Handlers ──────────────────────────────────────────
    socket.on('join-chat-room', ({ roomId }) => {
        socket.join(roomId);
        // Send history to the joiner
        const history = roomMessages.get(roomId) || [];
        socket.emit('chat-history', { messages: history });
    });

    socket.on('send-chat-message', (messageData) => {
        const { roomId } = messageData;
        if (!roomId) return;

        const fullMessage = {
            ...messageData,
            id: uuidV4(),
            timestamp: new Date().toISOString()
        };

        // Store in memory
        if (!roomMessages.has(roomId)) {
            roomMessages.set(roomId, []);
        }
        const history = roomMessages.get(roomId);
        history.push(fullMessage);
        if (history.length > 100) history.shift();

        // Standardized broadcast to all in room
        io.to(roomId).emit('new-chat-message', fullMessage);
    });

    // ── Code Wars Room Handlers ──────────────────────────────────────────
    socket.on('join-code-wars-room', ({ roomId }) => {
        socket.join(`room_${roomId}`);
        console.log(`[CODE WARS] User joined room ${roomId}`);
    });

    socket.on('leave-code-wars-room', ({ roomId }) => {
        socket.leave(`room_${roomId}`);
        console.log(`[CODE WARS] User left room ${roomId}`);
    });

    // ── Collaborative Editor Socket Handlers ──────────────────────────────
    
    // Task 3.1: Join team editor session
    socket.on('cw-join-team-editor', ({ roomId, teamId, questionId, userId, username }) => {
        try {
            console.log(`📝 [CW Editor] User ${username} joining team editor - Room: ${roomId}, Team: ${teamId}, Question: ${questionId}`);
            
            // Validate user belongs to team and get current editor state
            const editorState = intraFactionArena.joinTeamEditor(roomId, teamId, questionId, userId, username);
            
            // Join team-specific socket room
            const teamEditorRoom = `cw-${roomId}-team-${teamId}-q-${questionId}`;
            socket.join(teamEditorRoom);
            
            console.log(`✅ [CW Editor] User ${username} joined team editor room: ${teamEditorRoom}`);
            
            // Emit current editor state to joining user (Requirement 9.5)
            socket.emit('cw-editor-sync', {
                teamId,
                questionId,
                code: editorState.code,
                cursors: editorState.cursors,
                lastEdit: editorState.lastEdit,
                timestamp: editorState.timestamp
            });
            
            // Broadcast to other team members that a teammate joined (Requirement 9.8)
            socket.to(teamEditorRoom).emit('cw-teammate-joined-editor', {
                userId,
                username,
                questionId
            });
            
        } catch (error) {
            console.error(`❌ [CW Editor] Join team editor error:`, error.message);
            socket.emit('cw-error', { error: error.message });
        }
    });
    
    // Task 3.2: Handle code changes with rate limiting and security (Tasks 27.2, 28.1, 28.2)
    socket.on('cw-code-change', ({ roomId, teamId, questionId, code, cursorPosition, userId, timestamp }) => {
        try {
            // Task 27.2: Rate limiting - 20 events per second per user
            if (!rateLimiter.checkRateLimit(userId, 'code-change', 20)) {
                socket.emit('cw-error', { 
                    error: 'Rate limit exceeded for code changes',
                    code: 'RATE_LIMIT_EXCEEDED'
                });
                return;
            }
            
            // Task 28.1: Input sanitization - validate code size (50KB limit)
            if (code && code.length > 50 * 1024) {
                socket.emit('cw-error', { 
                    error: 'Code size exceeds 50KB limit',
                    code: 'PAYLOAD_TOO_LARGE'
                });
                console.log(`⚠️ [CW Editor] Oversized code payload rejected from user ${userId}`);
                return;
            }
            
            // Task 28.2: Access control validations
            const room = intraFactionArena.getRoomById(roomId);
            if (!room) {
                socket.emit('cw-error', { 
                    error: 'Room not found',
                    code: 'ROOM_NOT_FOUND'
                });
                console.log(`⚠️ [CW Editor] Unauthorized access attempt - room not found: ${roomId}`);
                return;
            }
            
            // Verify room is active
            if (room.status !== 'active') {
                socket.emit('cw-error', { 
                    error: 'Room is not active',
                    code: 'ROOM_NOT_ACTIVE'
                });
                return;
            }
            
            // Find player to get username and verify team membership
            const team = room.teams.find(t => t.id === teamId);
            if (!team) {
                socket.emit('cw-error', { 
                    error: 'Team not found',
                    code: 'TEAM_NOT_FOUND'
                });
                console.log(`⚠️ [CW Editor] Unauthorized access attempt - team not found: ${teamId}`);
                return;
            }
            
            const player = team.players.find(p => p.id === userId);
            if (!player) {
                socket.emit('cw-error', { 
                    error: 'User does not belong to this team',
                    code: 'UNAUTHORIZED_ACCESS'
                });
                console.log(`⚠️ [CW Editor] Unauthorized access attempt - user ${userId} not in team ${teamId}`);
                return;
            }
            
            // Verify question exists in room
            const question = room.questions.find(q => q.id === questionId);
            if (!question) {
                socket.emit('cw-error', { 
                    error: 'Question not found in room',
                    code: 'QUESTION_NOT_FOUND'
                });
                return;
            }
            
            // Update team code with conflict resolution (Requirement 1.2)
            const result = intraFactionArena.updateTeamCode(
                roomId, 
                teamId, 
                questionId, 
                code, 
                userId, 
                cursorPosition, 
                timestamp
            );
            
            if (result.success) {
                // Broadcast to team members (exclude sender) (Requirement 9.6)
                const teamEditorRoom = `cw-${roomId}-team-${teamId}-q-${questionId}`;
                socket.to(teamEditorRoom).emit('cw-teammate-code-update', {
                    userId,
                    username: player.username,
                    code,
                    cursorPosition,
                    timestamp
                });
                
                console.log(`✅ [CW Editor] Code updated by ${player.username} in room ${roomId}`);
            } else if (result.conflict) {
                // Notify sender of conflict (older timestamp rejected)
                socket.emit('cw-code-conflict', {
                    message: result.message,
                    serverTimestamp: result.timestamp
                });
                console.log(`⚠️ [CW Editor] Code conflict detected for ${player.username} - update rejected`);
            }
            
        } catch (error) {
            console.error(`❌ [CW Editor] Code change error:`, error.message);
            socket.emit('cw-error', { error: error.message });
        }
    });
    
    // Task 3.3: Handle cursor movements with rate limiting (Task 27.3)
    socket.on('cw-cursor-move', ({ roomId, teamId, questionId, position, userId }) => {
        try {
            // Task 27.3: Rate limiting - 50 events per second per user
            if (!rateLimiter.checkRateLimit(userId, 'cursor-move', 50)) {
                // Drop excess events silently (cursor moves are non-critical)
                return;
            }
            
            // Get room to find username
            const room = intraFactionArena.getRoomById(roomId);
            if (!room) {
                return; // Silently fail for cursor moves
            }
            
            // Find player to get username
            const team = room.teams.find(t => t.id === teamId);
            if (!team) {
                return; // Silently fail
            }
            
            const player = team.players.find(p => p.id === userId);
            if (!player) {
                return; // Silently fail
            }
            
            // Update cursor position (Requirement 2.2)
            intraFactionArena.updateCursorPosition(roomId, teamId, questionId, userId, position);
            
            // Broadcast to team members (exclude sender) (Requirement 9.7)
            const teamEditorRoom = `cw-${roomId}-team-${teamId}-q-${questionId}`;
            socket.to(teamEditorRoom).emit('cw-teammate-cursor-update', {
                userId,
                username: player.username,
                position
            });
            
        } catch (error) {
            // Don't emit error for cursor moves - they're high frequency and non-critical
            // Just log for debugging
            if (process.env.NODE_ENV === 'development') {
                console.error(`❌ [CW Editor] Cursor move error:`, error.message);
            }
        }
    });
    
    // Task 3.4: Enhanced submit solution with team collaboration
    socket.on('cw-submit-solution', async ({ roomId, teamId, questionId, code, userId, language = 'java' }) => {
        try {
            console.log(`🚀 [CW Editor] Solution submission - Room: ${roomId}, Team: ${teamId}, Question: ${questionId}, Language: ${language}`);
            
            // Get room to find username
            const room = intraFactionArena.getRoomById(roomId);
            if (!room) {
                throw new Error('Room not found');
            }
            
            // Find player to get username
            const team = room.teams.find(t => t.id === teamId);
            if (!team) {
                throw new Error('Team not found');
            }
            
            const player = team.players.find(p => p.id === userId);
            if (!player) {
                throw new Error('User does not belong to this team');
            }
            
            // Get current team code from editor state (Requirement 7.1)
            const editorState = intraFactionArena.getTeamEditorState(roomId, teamId, questionId);
            const codeToSubmit = editorState.code || code;
            
            // Disable editor for team during evaluation (Requirement 7.6)
            const teamEditorRoom = `cw-${roomId}-team-${teamId}-q-${questionId}`;
            io.to(teamEditorRoom).emit('cw-editor-disabled', {
                questionId,
                reason: 'Evaluating solution...'
            });
            
            // Submit solution (Requirement 7.3)
            const result = await intraFactionArena.submitSolution(roomId, userId, questionId, codeToSubmit, language);
            
            // Re-enable editor for team
            io.to(teamEditorRoom).emit('cw-editor-enabled', {
                questionId
            });
            
            // Broadcast result to all team members (Requirement 7.4, 7.5)
            if (result.success) {
                io.to(teamEditorRoom).emit('cw-solution-success', {
                    userId,
                    username: player.username,
                    questionId,
                    points: result.points,
                    totalScore: result.totalScore,
                    result: result.result
                });
                console.log(`✅ [CW Editor] Solution accepted for team ${teamId} - ${result.points} points`);
            } else {
                io.to(teamEditorRoom).emit('cw-solution-failure', {
                    userId,
                    username: player.username,
                    questionId,
                    error: result.error || 'Solution failed test cases',
                    result: result.result
                });
                console.log(`❌ [CW Editor] Solution rejected for team ${teamId}`);
            }
            
        } catch (error) {
            console.error(`❌ [CW Editor] Submit solution error:`, error.message);
            socket.emit('cw-error', { error: error.message });
            
            // Re-enable editor on error
            const teamEditorRoom = `cw-${roomId}-team-${teamId}-q-${questionId}`;
            io.to(teamEditorRoom).emit('cw-editor-enabled', {
                questionId
            });
        }
    });
    
    // Task 3.5: Socket disconnect cleanup
    socket.on('disconnect', () => {
        try {
            // Find all rooms this socket was in
            const socketRooms = Array.from(socket.rooms);
            
            // Filter for team editor rooms (format: cw-{roomId}-team-{teamId}-q-{questionId})
            const editorRooms = socketRooms.filter(room => room.startsWith('cw-') && room.includes('-team-'));
            
            editorRooms.forEach(editorRoom => {
                // Parse room name to extract roomId, teamId, questionId
                const match = editorRoom.match(/^cw-(.+)-team-(.+)-q-(.+)$/);
                if (match) {
                    const [, roomId, teamId, questionId] = match;
                    
                    // Get room to find userId from socket
                    const room = intraFactionArena.getRoomById(roomId);
                    if (room) {
                        // Find which user this socket belongs to by checking team players
                        const team = room.teams.find(t => t.id === teamId);
                        if (team) {
                            // We need to track socket.id to userId mapping
                            // For now, we'll broadcast a generic departure
                            // The client will handle cleanup based on their own userId
                            
                            console.log(`🚪 [CW Editor] Socket disconnected from editor room: ${editorRoom}`);
                            
                            // Broadcast departure to teammates (Requirement 10.7)
                            socket.to(editorRoom).emit('cw-teammate-left-editor', {
                                questionId,
                                socketId: socket.id
                            });
                        }
                    }
                }
            });
            
        } catch (error) {
            console.error(`❌ [CW Editor] Disconnect cleanup error:`, error.message);
        }
    });
});

// ── Local Code Execution Engine ─────────────────────────────────────────────
app.post('/execute', async (req, res) => {
    const { language, files } = req.body;
    if (!files || files.length === 0) return res.status(400).json({ error: 'No files provided' });

    const code = files[0]?.content || '';
    const os = require('os');
    const tmpDir = os.tmpdir();
    const timestamp = Date.now();

    // helper to map language to Piston standard names
    const mapToPistonLanguage = (lang) => {
        const map = {
            'js': 'javascript',
            'javascript': 'javascript',
            'py': 'python',
            'python': 'python',
            'python3': 'python',
            'cpp': 'c++',
            'c++': 'c++',
            'c': 'c',
            'java': 'java',
            'rust': 'rust',
            'rs': 'rust',
            'go': 'go',
            'ruby': 'ruby',
            'rb': 'ruby'
        };
        return map[lang.toLowerCase()] || lang;
    };

    const runPistonFallback = async () => {
        const pistonLang = mapToPistonLanguage(language);
        console.log(`[COMPILER] Falling back to Piston API for ${pistonLang}`);
        const pistonStartTime = process.hrtime();
        try {
            const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
                language: pistonLang,
                version: '*',
                files: [{
                    name: files[0]?.name || (pistonLang === 'java' ? 'Main.java' : `solution.${language}`),
                    content: code
                }]
            }, { timeout: 10000 });
            
            const run = response.data.run;
            const diff = process.hrtime(pistonStartTime);
            const executionTimeMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
            
            return res.json({
                run: {
                    stdout: run.stdout || '',
                    stderr: run.stderr || '',
                    code: run.code || 0,
                    executionTime: executionTimeMs,
                    source: 'piston'
                }
            });
        } catch (err) {
            console.error('[COMPILER] Piston API error:', err.message);
            const diff = process.hrtime(pistonStartTime);
            const executionTimeMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);
            return res.json({
                run: {
                    stdout: '',
                    stderr: `Sandbox Execution Error: ${err.message}`,
                    code: 1,
                    executionTime: executionTimeMs,
                    source: 'piston-error'
                }
            });
        }
    };

    try {
        let cmd = '';
        let tmpFile = '';

        if (language === 'javascript' || language === 'js') {
            tmpFile = path.join(tmpDir, `cs_${timestamp}.js`);
            fs.writeFileSync(tmpFile, code);
            cmd = `node "${tmpFile}"`;

        } else if (language === 'python' || language === 'py' || language === 'python3') {
            tmpFile = path.join(tmpDir, `cs_${timestamp}.py`);
            fs.writeFileSync(tmpFile, code);
            cmd = `python "${tmpFile}"`;

        } else if (language === 'cpp' || language === 'c++' || language === 'c') {
            const buildsDir = path.join(__dirname, 'tmp_builds');
            if (!fs.existsSync(buildsDir)) fs.mkdirSync(buildsDir, { recursive: true });

            const ext = language === 'c' ? 'c' : 'cpp';
            const compiler = language === 'c' ? 'gcc' : 'g++';
            const srcFile = path.join(buildsDir, `cs_${timestamp}.${ext}`);
            const outFile = path.join(buildsDir, `cs_${timestamp}.exe`);
            fs.writeFileSync(srcFile, code);
            cmd = `${compiler} "${srcFile}" -o "${outFile}" && "${outFile}"`;
            tmpFile = srcFile;

        } else if (language === 'java') {
            tmpFile = path.join(tmpDir, `CS_${timestamp}.java`);
            fs.writeFileSync(tmpFile, code);
            cmd = `java "${tmpFile}"`;

        } else if (language === 'rust' || language === 'rs') {
            const srcFile = path.join(tmpDir, `cs_${timestamp}.rs`);
            const outFile = path.join(tmpDir, `cs_${timestamp}.exe`);
            fs.writeFileSync(srcFile, code);
            cmd = `rustc "${srcFile}" -o "${outFile}" && "${outFile}"`;
            tmpFile = srcFile;

        } else if (language === 'go') {
            tmpFile = path.join(tmpDir, `cs_${timestamp}.go`);
            fs.writeFileSync(tmpFile, code);
            cmd = `go run "${tmpFile}"`;

        } else if (language === 'ruby' || language === 'rb') {
            tmpFile = path.join(tmpDir, `cs_${timestamp}.rb`);
            fs.writeFileSync(tmpFile, code);
            cmd = `ruby "${tmpFile}"`;

        } else {
            return await runPistonFallback();
        }

        console.log(`[COMPILER] Running ${language} locally: ${cmd}`);
        const startTime = process.hrtime();

        exec(cmd, { timeout: 10000, maxBuffer: 1024 * 512 }, async (err, stdout, stderr) => {
            // Cleanup temp files
            try { if (tmpFile) fs.unlinkSync(tmpFile); } catch (_) { }

            const diff = process.hrtime(startTime);
            const executionTimeMs = Math.round((diff[0] * 1e9 + diff[1]) / 1e6);

            // Check if local binary execution failed entirely (e.g. command not found)
            const isLocalMissing = err && (
                err.code === 'ENOENT' || 
                err.message.includes('not found') || 
                err.message.includes('not recognized') || 
                err.message.includes('is not recognized')
            );

            if (isLocalMissing) {
                return await runPistonFallback();
            }

            res.json({
                run: {
                    stdout: stdout || '',
                    stderr: stderr || (err?.message || ''),
                    code: err ? (err.code || 1) : 0,
                    executionTime: executionTimeMs,
                    source: 'local'
                }
            });
        });

    } catch (err) {
        console.error('LOCAL EXECUTION ERROR, falling back:', err.message);
        await runPistonFallback();
    }
});

// ── AI Sentinel Diagnostic Helper ───────────────────────────────────────────
const fallbackSentinel = (mode, code, language, filename, lastUserMessage) => {
    const text = (lastUserMessage || '').toLowerCase();
    
    if (mode === 'optimize' || text.includes('optimize') || text.includes('speed') || text.includes('performance')) {
        let tips = [];
        if (code.includes('for') || code.includes('while')) {
            tips.push("- **Loop Optimization**: Detected loops. Ensure that array lookups (like `.length`) are cached if loops run frequently, or consider replacing nested loops with hash map lookups to reduce complexity from O(N²) to O(N).");
        }
        if (code.includes('var ')) {
            tips.push("- **Scope Allocation**: Consider replacing `var` with `let` or `const` to prevent hoisting side effects and keep memory block-scoped.");
        }
        if (code.includes('function') && (language === 'javascript' || language === 'js')) {
            tips.push("- **Closure Memory**: Check if inner functions can be declared outside the main loop to avoid rebuilding closures on every iteration.");
        }
        if (tips.length === 0) {
            tips.push("- **General Optimization**: Ensure you are using appropriate data structures (e.g. Set/Map for constant-time lookups) and avoid redundant calculations.");
        }
        
        return `### ⚡ Sentinel Optimization Diagnostic
Detected environment: **${filename || 'Untitled'}** (${language || 'unknown'}).

Here are optimization recommendations based on static analysis:
${tips.join('\n')}

**Proposed Refactoring Strategy**:
\`\`\`${language || ''}
// Use modern constructs & cached structures
// Example: Avoid nested operations inside loops.
\`\`\``;
    }

    if (mode === 'explain' || text.includes('explain') || text.includes('how') || text.includes('what')) {
        const lines = code.split('\n');
        const functionCount = (code.match(/function\s+\w+|const\s+\w+\s*=\s*\([^)]*\)\s*=>|def\s+\w+|public\s+\w+\s+\w+/g) || []).length;
        const loops = (code.match(/for\s*\(|while\s*\(|for\s+\w+\s+in|for\s+\w+\s+of/g) || []).length;
        
        return `### 🔍 Sentinel Code Architecture Analysis
Active File: **${filename || 'buffer'}**
Language Mode: **${language || 'plaintext'}**

Here is a breakdown of the editor contents:
- **Structure**: Contains ${lines.length} lines of code.
- **Complexity**: Identified ${functionCount} function definition(s) and ${loops} loop block(s).
- **Execution Flow**:
  1. The program initializes scope-level declarations.
  2. Sequential execution flows through the defined control paths.
  3. Returns output or state modification depending on standard operations.

*Tip: Highlight a specific block of code or ask details about a function to get a deeper explanation.*`;
    }

    if (mode === 'fix' || text.includes('fix') || text.includes('bug') || text.includes('error') || text.includes('wrong')) {
        let issues = [];
        if (language === 'javascript' || language === 'js' || language === 'typescript') {
            if (code.includes('==') && !code.includes('===')) {
                issues.push("- **Loose Comparison**: Found loose comparison (\`==\`). Recommend strict comparison (\`===\`) to prevent unexpected type coercion bugs.");
            }
        }
        if (code.includes('try') && !code.includes('catch')) {
            issues.push("- **Exception Handling**: Found \`try\` block without a corresponding \`catch\` or \`finally\` block, which causes compilation/runtime errors.");
        }
        if (issues.length === 0) {
            issues.push("- **Static Check**: No obvious syntax issues found. Double-check function argument counts and handle potential null/undefined values.");
        }
        
        return `### 🛡️ Sentinel Watchdog Diagnostic
Analyzing syntax stability in **${filename || 'active buffer'}**...

**Identified Warnings**:
${issues.join('\n')}

*To run tests and see exact output, use the 'Run' panel at the bottom.*`;
    }

    return `### 🤖 Sentinel Workspace Companion
Active File: **${filename || 'No file selected'}**
Language: **${language}**

I am monitoring your workspace. How can I assist you?
- Ask me to **explain** the code to walk through the logic.
- Ask me to **optimize** to speed up execution or reduce complexity.
- Ask me to **fix** or check for bugs to identify warnings.`;
};

app.post('/api/sentinel', async (req, res) => {
    try {
        const { messages, code, language, filename, mode } = req.body;
        const lastUserMessage = messages && messages.length > 0 ? messages[messages.length - 1].content : '';

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            const fallbackResponse = fallbackSentinel(mode, code || '', language || 'plaintext', filename || '', lastUserMessage);
            return res.json({ text: fallbackResponse });
        }

        const systemPrompt = `You are "The Sentinel" - an advanced, context-aware AI coding assistant integrated inside the BrightCode IDE.
The user is working on a file named "${filename || 'unnamed'}" written in "${language || 'plaintext'}".
Here is their current code buffer:
\`\`\`${language || ''}
${code || ''}
\`\`\`

YOUR RULES:
1. Provide expert, precise, and professional technical advice.
2. Structure your replies using clean markdown headers (e.g. "### ⚡ Optimization Protocol").
3. When requested to optimize, explain, or fix bugs, focus directly on the code buffer. Provide concrete code diffs or refactored snippets.
4. Keep explanations clear, and avoid excessive introductory/concluding chatter.
5. If the user asks general questions or chat, answer as a smart developer assistant.
`;

        const formattedMessages = [
            {
                role: 'user',
                parts: [{ text: systemPrompt }]
            },
            {
                role: 'model',
                parts: [{ text: "Hello! I am your AI Sentinel. How can I assist you with your code today?" }]
            },
            ...messages.slice(0, -1).map(msg => ({
                role: msg.role === 'ai' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            })),
            {
                role: 'user',
                parts: [{ text: `[Mode: ${mode || 'chat'}] User query: ${lastUserMessage}` }]
            }
        ];

        const payload = {
            contents: formattedMessages,
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 2500,
                topP: 0.95
            }
        };

        let response;
        try {
            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
            response = await axios.post(endpoint, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });
        } catch (error) {
            console.warn('[Sentinel] gemini-2.5-flash failed, trying fallback...', error.message);
            const fallbackEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
            response = await axios.post(fallbackEndpoint, payload, {
                headers: { 'Content-Type': 'application/json' },
                timeout: 30000
            });
        }

        if (response.data && response.data.candidates && response.data.candidates.length > 0) {
            const aiResponse = response.data.candidates[0].content.parts[0].text;
            res.json({ text: aiResponse });
        } else {
            throw new Error('Empty response from Gemini API');
        }

    } catch (error) {
        console.error('[Sentinel Error]:', error.message);
        const fallbackResponse = fallbackSentinel(
            req.body.mode, 
            req.body.code || '', 
            req.body.language || 'plaintext', 
            req.body.filename || '', 
            req.body.messages?.[req.body.messages?.length - 1]?.content || ''
        );
        res.json({ text: fallbackResponse });
    }
});

// ═══ CODE WARS ARENA API ═══════════════════════════════════════════════════

// ── INTRA-FACTION BATTLES ──────────────────────────────────────────────────

// Create a custom room
app.post('/code-wars/create-room', authenticateToken, async (req, res) => {
    const { 
        name, 
        isPrivate = false,
        password, 
        gameMode = 'QUICK_BATTLE',
        teamSize = 1, 
        maxTeams = 2,
        questionCount = 3,
        timeLimit = 600,
        difficulty = 'mixed',
        allowSpectators = true,
        autoStart = false,
        showLeaderboard = true
    } = req.body;
    
    console.log(`🏗️ Creating room - User: ${req.user.username} (${req.user.id}), Name: ${name}, Private: ${isPrivate}`);
    
    try {
        // Get user's faction
        const userFaction = Array.from(factions.values()).find(f => 
            f.members?.some(m => m.id === req.user.id)
        );
        
        if (!userFaction) {
            console.log(`❌ User ${req.user.username} not in any faction`);
            return res.status(400).json({ error: 'You must be in a faction to create a room' });
        }
        
        console.log(`✅ User is in faction: ${userFaction.name} (${userFaction.id})`);
        
        // Validate private room requirements
        if (isPrivate && (!password || password.trim().length === 0)) {
            console.log(`❌ Private room without password`);
            return res.status(400).json({ error: 'Private rooms must have a password' });
        }
        
        const roomConfig = {
            name,
            password: isPrivate ? password.trim() : null,
            gameMode,
            teamSize: Math.min(Math.max(teamSize, 1), 5), // 1-5 players per team
            maxTeams: Math.min(Math.max(maxTeams, 2), 4), // 2-4 teams max
            questionCount: Math.min(Math.max(questionCount, 1), 10), // 1-10 questions
            timeLimit: Math.min(Math.max(timeLimit, 300), 3600), // 5min - 1hour
            difficulty,
            allowSpectators,
            autoStart,
            showLeaderboard
        };
        
        const room = intraFactionArena.createRoom(
            req.user.id,
            req.user.username,
            userFaction.id,
            roomConfig
        );
        
        console.log(`✅ Room created successfully: ${room.id}`);
        console.log(`📊 Total active rooms now: ${intraFactionArena.activeRooms.size}`);
        console.log(`📋 Active room IDs:`, Array.from(intraFactionArena.activeRooms.keys()));
        
        res.json({
            success: true,
            room: room,
            message: `${isPrivate ? 'Private' : 'Public'} room ${room.id} created successfully!`
        });
        
    } catch (error) {
        console.error(`❌ Error creating room:`, error);
        res.status(500).json({ error: error.message });
    }
});

// Join a room
app.post('/code-wars/join-room', authenticateToken, async (req, res) => {
    const { roomId, password } = req.body;
    
    if (!roomId) {
        return res.status(400).json({ error: 'Room ID is required' });
    }
    
    try {
        // Get user's faction
        const userFaction = Array.from(factions.values()).find(f => 
            f.members?.some(m => m.id === req.user.id)
        );
        
        if (!userFaction) {
            return res.status(400).json({ error: 'You must be in a faction to join a room' });
        }
        
        const result = intraFactionArena.joinRoom(
            req.user.id,
            req.user.username,
            userFaction.id,
            roomId.toUpperCase(),
            password
        );
        
        // Notify other players in the room about the new player
        intraFactionArena.notifyRoomUpdate(result.room, 'player-joined', {
            userId: req.user.id,
            username: req.user.username,
            role: result.role,
            teamId: result.teamId
        });
        
        res.json({
            success: true,
            ...result,
            message: `Joined room ${roomId} as ${result.role}`
        });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Leave current room
app.post('/code-wars/leave-room', authenticateToken, (req, res) => {
    try {
        // Get the room before leaving to notify other players
        const room = intraFactionArena.getPlayerRoom(req.user.id);
        const success = intraFactionArena.leaveRoom(req.user.id);
        
        if (success && room) {
            // Notify other players in the room about the player leaving
            intraFactionArena.notifyRoomUpdate(room, 'player-left', {
                userId: req.user.id,
                username: req.user.username
            });
            
            res.json({ success: true, message: 'Left room successfully' });
        } else {
            res.status(404).json({ error: 'Not in any room' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Start game (room creator only)
app.post('/code-wars/start-game', authenticateToken, async (req, res) => {
    const { roomId } = req.body;
    
    console.log(`🎮 Start game request - Room: ${roomId}, User: ${req.user.id} (${req.user.username})`);
    
    try {
        // Check if room exists first
        const room = intraFactionArena.getRoomById(roomId);
        if (!room) {
            console.log(`❌ Room ${roomId} not found in active rooms`);
            console.log(`📊 Active rooms:`, Array.from(intraFactionArena.activeRooms.keys()));
            return res.status(404).json({ error: 'Room not found. The room may have expired or been deleted.' });
        }
        
        console.log(`✅ Room ${roomId} found, attempting to start game`);
        const startedRoom = await intraFactionArena.startGame(roomId, req.user.id);
        
        res.json({
            success: true,
            room: startedRoom,
            message: 'Game started!'
        });
    } catch (error) {
        console.error(`❌ Start game error for room ${roomId}:`, error.message);
        res.status(400).json({ error: error.message });
    }
});

// Submit solution (updated for rooms)
app.post('/code-wars/submit-solution', authenticateToken, async (req, res) => {
    console.log('[API] 📝 Submit solution request received');
    console.log('[API] User ID:', req.user?.id);
    console.log('[API] Request body:', { questionId: req.body.questionId, codeLength: req.body.code?.length, language: req.body.language });
    
    const { questionId, code, language = 'java' } = req.body;
    
    if (!questionId || !code) {
        console.error('[API] ❌ Missing required fields');
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const playerRoom = intraFactionArena.getPlayerRoom(req.user.id);
        console.log('[API] Player room:', playerRoom?.id || 'NOT FOUND');
        
        if (!playerRoom) {
            console.error('[API] ❌ Player not in any active game');
            return res.status(404).json({ error: 'Not in any active game' });
        }
        
        console.log('[API] ✅ Calling submitSolution...');
        const result = await intraFactionArena.submitSolution(
            playerRoom.id,
            req.user.id,
            questionId,
            code,
            language
        );
        
        console.log('[API] ✅ Submit solution successful');
        console.log('[API] Result:', { success: result.success, points: result.points, score: result.scorePercentage });
        res.json(result);
        
    } catch (error) {
        console.error('[API] ❌ Submit solution error:', error.message);
        console.error('[API] Error stack:', error.stack);
        res.status(400).json({ error: error.message });
    }
});

// Get language templates and examples
app.get('/code-wars/language-templates', (req, res) => {
    const { getAvailableLanguages, getSyntaxExample } = require('./languageTemplates');
    
    const languages = getAvailableLanguages();
    const templates = {};
    
    languages.forEach(lang => {
        templates[lang.id] = {
            name: lang.name,
            extension: lang.extension,
            examples: {
                basic: getSyntaxExample(lang.id, 'basic'),
                array: getSyntaxExample(lang.id, 'array'),
                string: getSyntaxExample(lang.id, 'string')
            }
        };
    });
    
    res.json({
        languages,
        templates
    });
});

// Get starter code for a specific language
app.get('/code-wars/starter-code/:language', (req, res) => {
    const { language } = req.params;
    const { problemType = 'function' } = req.query;
    const { getStarterCode } = require('./languageTemplates');
    
    const starterCode = getStarterCode(language, problemType, {
        functionName: 'solution',
        returnType: language === 'python' ? '' : 'int',
        params: language === 'python' ? 'n' : 'int n'
    });
    
    res.json({ starterCode });
});

// Get my current room
app.get('/code-wars/my-room', authenticateToken, (req, res) => {
    const room = intraFactionArena.getPlayerRoom(req.user.id);
    if (room) {
        res.json(room);
    } else {
        res.status(404).json({ error: 'Not in any room' });
    }
});

// Get faction rooms (public rooms in my faction)
app.get('/code-wars/faction-rooms', authenticateToken, (req, res) => {
    try {
        // Get user's faction
        const userFaction = Array.from(factions.values()).find(f => 
            f.members?.some(m => m.id === req.user.id)
        );
        
        if (!userFaction) {
            return res.status(400).json({ error: 'You must be in a faction' });
        }
        
        console.log(`📋 Getting faction rooms for faction: ${userFaction.name} (${userFaction.id})`);
        console.log(`📊 Total active rooms: ${intraFactionArena.activeRooms.size}`);
        
        const rooms = intraFactionArena.getRoomsByFaction(userFaction.id);
        console.log(`🏠 Found ${rooms.length} public rooms for faction ${userFaction.name}`);
        
        res.json(rooms);
        
    } catch (error) {
        console.error('❌ Error getting faction rooms:', error);
        res.status(500).json({ error: error.message });
    }
});

// Switch team in room
app.post('/code-wars/switch-team', authenticateToken, (req, res) => {
    const { teamId } = req.body;
    
    try {
        const playerRoom = intraFactionArena.getPlayerRoom(req.user.id);
        if (!playerRoom) {
            return res.status(404).json({ error: 'Not in any room' });
        }
        
        const updatedRoom = intraFactionArena.switchTeam(req.user.id, playerRoom.id, teamId);
        res.json({
            success: true,
            room: updatedRoom,
            message: `Switched to ${teamId}`
        });
        
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Debug endpoint to check all rooms (including private) - for testing
app.get('/code-wars/debug/all-rooms', authenticateToken, (req, res) => {
    try {
        // Get user's faction
        const userFaction = Array.from(factions.values()).find(f => 
            f.members?.some(m => m.id === req.user.id)
        );
        
        if (!userFaction) {
            return res.status(400).json({ error: 'You must be in a faction' });
        }
        
        const allRooms = intraFactionArena.getAllRoomsForFaction(userFaction.id, true);
        res.json({
            factionId: userFaction.id,
            factionName: userFaction.name,
            totalRooms: allRooms.length,
            publicRooms: allRooms.filter(r => !r.isPrivate).length,
            privateRooms: allRooms.filter(r => r.isPrivate).length,
            rooms: allRooms
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to check room status
app.get('/code-wars/debug/room/:roomId', authenticateToken, (req, res) => {
    const { roomId } = req.params;
    
    try {
        const room = intraFactionArena.getRoomById(roomId);
        const playerRoom = intraFactionArena.getPlayerRoom(req.user.id);
        
        res.json({
            roomExists: !!room,
            room: room ? intraFactionArena.sanitizeRoomForClient(room) : null,
            userInRoom: !!playerRoom,
            userRoomId: playerRoom?.id || null,
            allActiveRooms: Array.from(intraFactionArena.activeRooms.keys()),
            playerRoomMappings: Array.from(intraFactionArena.playerRooms.entries())
        });
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to get question history stats
app.get('/code-wars/debug/question-history/:factionId', authenticateToken, (req, res) => {
    const { factionId } = req.params;
    
    try {
        const stats = intraFactionArena.getQuestionHistoryStats(factionId);
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Debug endpoint to clear question history
app.post('/code-wars/debug/clear-history/:factionId', authenticateToken, (req, res) => {
    const { factionId } = req.params;
    
    try {
        const result = intraFactionArena.clearQuestionHistory(factionId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ── INTER-FACTION BATTLES (Original System) ────────────────────────────────

// Join game queue
app.post('/code-wars/create-room', authenticateToken, async (req, res) => {
    const { factionId, settings } = req.body;
    
    if (!factionId) {
        return res.status(400).json({ error: 'Faction ID is required' });
    }
    
    try {
        // Verify user is member of the faction
        const faction = factions.get(factionId);
        if (!faction || !faction.members.find(m => m.id === req.user.id)) {
            return res.status(403).json({ error: 'You must be a member of this faction' });
        }
        
        const room = codeWarsArena.createPrivateRoom(
            req.user.id,
            req.user.username,
            factionId,
            settings || {}
        );
        
        res.json({
            success: true,
            room: codeWarsArena.sanitizeRoomForClient(room),
            message: `Room ${room.id} created successfully`
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Join private room
app.post('/code-wars/join-room', authenticateToken, async (req, res) => {
    const { roomId, password, asSpectator = false } = req.body;
    
    if (!roomId) {
        return res.status(400).json({ error: 'Room ID is required' });
    }
    
    try {
        const room = codeWarsArena.joinPrivateRoom(
            roomId,
            req.user.id,
            req.user.username,
            password,
            asSpectator
        );
        
        res.json({
            success: true,
            room: codeWarsArena.sanitizeRoomForClient(room),
            message: 'Joined room successfully'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Leave private room (Inter-faction system - different endpoint)
app.post('/code-wars/leave-private-room', authenticateToken, (req, res) => {
    const { roomId } = req.body;
    
    if (!roomId) {
        return res.status(400).json({ error: 'Room ID is required' });
    }
    
    try {
        const success = codeWarsArena.leavePrivateRoom(roomId, req.user.id);
        res.json({
            success,
            message: success ? 'Left room successfully' : 'Room not found'
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Toggle ready status
app.post('/code-wars/toggle-ready', authenticateToken, (req, res) => {
    const { roomId } = req.body;
    
    if (!roomId) {
        return res.status(400).json({ error: 'Room ID is required' });
    }
    
    try {
        const room = codeWarsArena.togglePlayerReady(roomId, req.user.id);
        res.json({
            success: true,
            room: codeWarsArena.sanitizeRoomForClient(room)
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get room details
app.get('/code-wars/room/:roomId', authenticateToken, (req, res) => {
    const { roomId } = req.params;
    
    try {
        const room = codeWarsArena.getPrivateRoom(roomId);
        if (!room) {
            return res.status(404).json({ error: 'Room not found' });
        }
        
        // Check if user has access to this room
        const isPlayer = room.players.some(p => p.userId === req.user.id);
        const isSpectator = room.spectators.some(s => s.userId === req.user.id);
        const isFactionMember = factions.get(room.factionId)?.members.some(m => m.id === req.user.id);
        
        if (!isPlayer && !isSpectator && !isFactionMember) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        res.json({
            success: true,
            room: codeWarsArena.sanitizeRoomForClient(room)
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get faction rooms
app.get('/code-wars/faction-rooms/:factionId', authenticateToken, (req, res) => {
    const { factionId } = req.params;
    
    try {
        // Verify user is member of the faction
        const faction = factions.get(factionId);
        if (!faction || !faction.members.find(m => m.id === req.user.id)) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        const rooms = codeWarsArena.getFactionRooms(factionId);
        res.json({
            success: true,
            rooms
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Join game queue (for inter-faction battles - keeping this for future use)
app.post('/code-wars/join-queue', authenticateToken, async (req, res) => {
    const { factionId, gameMode = 'QUICK_BATTLE' } = req.body;
    
    try {
        const result = await codeWarsArena.joinQueue(
            factionId, 
            req.user.id, 
            req.user.username, 
            gameMode
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Leave game queue
app.post('/code-wars/leave-queue', authenticateToken, (req, res) => {
    const { factionId } = req.body;
    
    try {
        codeWarsArena.leaveQueue(factionId, req.user.id);
        res.json({ success: true, message: 'Left queue successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Get active games
app.get('/code-wars/active-games', (req, res) => {
    const activeGames = codeWarsArena.getActiveGames();
    res.json(activeGames);
});

// Get player's current game
app.get('/code-wars/my-game', authenticateToken, (req, res) => {
    const game = codeWarsArena.getPlayerGame(req.user.id);
    if (game) {
        res.json(game);
    } else {
        res.status(404).json({ error: 'Not in any active game' });
    }
});

// Get game details
app.get('/code-wars/game/:gameId', authenticateToken, (req, res) => {
    const game = codeWarsArena.getGameById(req.params.gameId);
    if (game) {
        // Only return game if user is a participant
        const isParticipant = game.participants.some(p => p.userId === req.user.id);
        if (isParticipant) {
            res.json(game);
        } else {
            res.status(403).json({ error: 'Not authorized to view this game' });
        }
    } else {
        res.status(404).json({ error: 'Game not found' });
    }
});

// Submit solution
app.post('/code-wars/submit', authenticateToken, async (req, res) => {
    const { gameId, questionId, code } = req.body;
    
    if (!gameId || !questionId || !code) {
        return res.status(400).json({ error: 'Missing required fields' });
    }
    
    try {
        const result = await codeWarsArena.submitSolution(
            gameId, 
            req.user.id, 
            questionId, 
            code
        );
        res.json(result);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Start a custom game (admin only for testing)
app.post('/code-wars/create-game', authenticateToken, async (req, res) => {
    const { factionIds, gameMode = 'QUICK_BATTLE', questionSource = 'builtin' } = req.body;
    
    if (!factionIds || factionIds.length < 2) {
        return res.status(400).json({ error: 'Need at least 2 factions' });
    }
    
    try {
        const gameSession = codeWarsArena.createGameSession(factionIds, gameMode, questionSource);
        await codeWarsArena.generateQuestionsForGame(gameSession);
        res.json(gameSession);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 5051;
server.listen(PORT, () => logger.info(`Server running on port ${PORT}`));


// ── Java Compilation & Execution Endpoint ─────────────────────────────────────
app.post('/compile-java', async (req, res) => {
    const { code, testCases } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'No code provided' });
    }

    try {
        const result = await compileAndRunJava(code, testCases);
        res.json(result);
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            error: error.message || 'Compilation failed' 
        });
    }
});
