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
const { Pool } = require('pg');
const { exec } = require('child_process');
const nodemailer = require('nodemailer');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
});

// Chat History Store: roomId -> Array of messages
const roomMessages = new Map();

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'codebright_secret_key_123';

// Memory Fallback (for when PostgreSQL is offline)
let memoryStore = { users: [] };
let useMemoryDB = false;
const DB_FILE = path.join(__dirname, 'users_db.json');

const loadStore = () => {
    if (fs.existsSync(DB_FILE)) {
        try {
            memoryStore = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
            console.log(`[PERSISTENCE] Loaded ${memoryStore.users.length} users from users_db.json`);
        } catch (e) {
            console.error('[PERSISTENCE] Error loading memory DB file:', e);
        }
    }
};

const saveStore = () => {
    if (!useMemoryDB) return;
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(memoryStore, null, 2));
    } catch (e) {
        console.error('[PERSISTENCE] Error saving memory DB file:', e);
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
            console.log(`[FACTIONS] Loaded ${factions.size} factions from factions_db.json`);
        } catch (e) { console.error('[FACTIONS] Load error:', e); }
    }
};

const saveFactions = () => {
    try {
        fs.writeFileSync(FACTIONS_FILE, JSON.stringify(Array.from(factions.values()), null, 2));
    } catch (e) { console.error('[FACTIONS] Save error:', e); }
};

loadFactions();

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

// PostgreSQL Configuration
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'postgres', // Changed to 'postgres' for better out-of-the-box compatibility
    password: process.env.DB_PASSWORD || 'postgres',
    port: process.env.DB_PORT || 5432,
});

// Initialize Database
const initDB = async () => {
    try {
        // Force drop if there is a type mismatch (Development Only)
        // await pool.query('DROP TABLE IF EXISTS users CASCADE;'); 

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
                level TEXT DEFAULT 'Apprentice',
                activity JSONB DEFAULT '{}',
                created_count INTEGER DEFAULT 0,
                joined_count INTEGER DEFAULT 0,
                avatar TEXT,
                bio TEXT DEFAULT '',
                stack JSONB DEFAULT '[]',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            
            -- Safe migration for existing tables
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='bio') THEN
                    ALTER TABLE users ADD COLUMN bio TEXT DEFAULT '';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='stack') THEN
                    ALTER TABLE users ADD COLUMN stack JSONB DEFAULT '[]';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_at') THEN
                    ALTER TABLE users ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
                END IF;
            END $$;
            
            -- Safe migration for existing tables missing the activity column
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='activity') THEN
                    ALTER TABLE users ADD COLUMN activity JSONB DEFAULT '{}';
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='created_count') THEN
                    ALTER TABLE users ADD COLUMN created_count INTEGER DEFAULT 0;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='joined_count') THEN
                    ALTER TABLE users ADD COLUMN joined_count INTEGER DEFAULT 0;
                END IF;
            END $$;
        `);
        console.log('PostgreSQL Tables Initialized & Migrated');
    } catch (err) {
        console.error('DATABASE INIT ERROR:', err.message);
        console.log('--- SWAPPING TO MEMORY FALLBACK MODE (USING PERSISTENT users_db.json) ---');
        useMemoryDB = true;
        loadStore();
    }
};
initDB();

// --- AUTHENTICATION REWRITE ---
const otps = new Map(); // Store OTPs: email -> { otp, userData, expires }

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // Use STARTTLS
    auth: {
        user: 'codebrightlim@gmail.com',
        pass: 'dzoe alqy ocyw gije'
    },
    tls: {
        rejectUnauthorized: false
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000
});

// Verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        console.log("[MAIL] Connection Error:", error);
    } else {
        console.log("[MAIL] Server is ready to take our messages");
    }
});

app.post('/support', async (req, res) => {
    const { email, subject, message, username } = req.body;

    if (!email || !message) {
        return res.status(400).json({ error: 'Email and message are required' });
    }

    const mailOptions = {
        from: '"CodeBright Support" <codebrightlim@gmail.com>',
        to: 'codebrightlim@gmail.com', // Your email for receiving inquiries
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
                <p style="text-align: center; color: #666; font-size: 12px;">&copy; 2026 CodeBright Command Center.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ message: "Your message has been sent to our support team." });
    } catch (err) {
        console.error('SUPPORT MAIL ERROR:', err);
        res.status(500).json({ error: 'Failed to send support message' });
    }
});

// Standard response helper
const sendError = (res, status, message, details = null) => {
    return res.status(status).json({ error: message, details });
};

app.post('/send-otp', async (req, res) => {
    let { email, username, type } = req.body;

    if (!email) return sendError(res, 400, "Email required");
    email = email.toLowerCase().trim();

    try {
        // Check if user already exists for registration
        if (type === 'register') {
            if (!username) return sendError(res, 400, "Username required");

            if (useMemoryDB) {
                const exists = memoryStore.users.find(u => u.email === email || u.username === username);
                if (exists) return sendError(res, 400, "User exists", "Name or Email is already taken.");
            } else {
                const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
                if (existing.rows.length > 0) return sendError(res, 400, "User exists", "Name or Email is already taken.");
            }
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

        otps.set(email, { otp, expires });

        console.log(`\n[OTP] Verification Code for ${email}: ${otp}\n`);

        console.log(`[MAIL] Attempting to send email to ${email}...`);

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
                    <p style="text-align: center; color: #9ca3af; font-size: 12px;">&copy; 2026 CodeBright. Built for the Architect.</p>
                </div>
            `
        };

        try {
            await Promise.race([
                transporter.sendMail(mailOptions),
                new Promise((_, reject) => setTimeout(() => reject(new Error('Mail Timeout')), 8000))
            ]);
            console.log(`[MAIL] Email sent successfully to ${email}`);
            res.json({ message: "OTP sent to your email address" });
        } catch (mailErr) {
            console.error(`[MAIL] Failed to send email:`, mailErr.message);
            // Even if mail fails, we respond with success in "Developer Mode" 
            // so the user can see the OTP in the console and continue testing.
            res.json({
                message: "OTP generated (Email delivery failed, check server console)",
                devMode: true
            });
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

    console.log(`[AUTH] Registering ${email} with OTP: ${otp}`);
    const record = otps.get(email);
    console.log(`[AUTH] Found Record:`, record);

    if (!record || record.otp !== otp) {
        console.log(`[AUTH] OTP Mismatch: Expected ${record?.otp}, Got ${otp}`);
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
            const exists = memoryStore.users.find(u => u.email === email || u.username === username);
            if (exists) return sendError(res, 400, "User exists", "Name or Email is already taken.");

            memoryStore.users.push({
                id, username, email, password: hashedPassword,
                xp: 0, css_level: 0, logic_level: 0, react_level: 0,
                activity: {},
                joinedAt: new Date().toISOString()
            });
            saveStore();
            return res.status(201).json({
                message: "Registered in Persistent Memory Mode",
                mode: 'memory',
                xp: 0, css_level: 0, logic_level: 0, react_level: 0
            });
        }

        // 2. Check PostgreSQL
        const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (existing.rows.length > 0) return sendError(res, 400, "User exists", "Name or Email is already taken.");

        await pool.query(
            'INSERT INTO users (id, username, email, password, xp) VALUES ($1, $2, $3, $4, 0)',
            [id, username, email, hashedPassword]
        );

        res.status(201).json({
            message: "User registered in PostgreSQL",
            xp: 0,
            css_level: 0,
            logic_level: 0,
            react_level: 0
        });
    } catch (err) {
        console.error('SERVER REGISTER ERROR:', err);
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

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return sendError(res, 401, "Invalid credentials", "Please check your email and password.");
        }

        const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' });
        const activity = user.activity || {};
        res.json({
            token,
            username: user.username,
            email: user.email,
            xp: user.xp || 0,
            css_level: user.css_level || 0,
            logic_level: user.logic_level || 0,
            react_level: user.react_level || 0,
            activity,
            streak: computeStreakFromActivity(activity),
            createdCount: user.created_count || 0,
            joinedCount: user.joined_count || 0,
            bio: user.bio || '',
            stack: user.stack || [],
            createdAt: user.created_at || new Date().toISOString()
        });
    } catch (err) {
        console.error('SERVER LOGIN ERROR:', err);
        sendError(res, 500, "Login failed", err.message);
    }
});

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ error: 'Access denied' });
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

app.post('/update-profile', authenticateToken, async (req, res) => {
    const { username, bio, stack } = req.body;
    if (!username) return res.status(400).json({ error: 'Username cannot be empty' });

    try {
        const existing = await pool.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, req.user.id]);
        if (existing.rows.length > 0) return res.status(400).json({ error: 'Username is already taken' });

        const result = await pool.query(
            'UPDATE users SET username = $1, bio = $2, stack = $3 WHERE id = $4 RETURNING email, xp, bio, stack, created_at',
            [username, bio || '', JSON.stringify(stack || []), req.user.id]
        );

        const user = result.rows[0];
        if (!user) return res.status(404).json({ error: 'User not found' });

        const token = jwt.sign({ id: req.user.id, username: username }, JWT_SECRET, { expiresIn: '1d' });
        res.json({
            token,
            username,
            email: user.email,
            xp: user.xp,
            bio: user.bio,
            stack: user.stack || [],
            createdAt: user.created_at
        });
    } catch (err) {
        console.error('UPDATE PROFILE ERROR:', err);
        res.status(500).json({ error: 'Database error' });
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
                u = {
                    id: req.user.id,
                    username: req.user.username,
                    email: `${req.user.username}@codebright.memory`,
                    password: 'memory_migrated',
                    xp: 0, css_level: 0, logic_level: 0, react_level: 0
                };
                memoryStore.users.push(u);
            }
            return res.json({
                id: u.id,
                username: u.username,
                email: u.email,
                xp: u.xp || 0,
                level: computeLevel(u.xp || 0),
                css_level: u.css_level || 0,
                logic_level: u.logic_level || 0,
                react_level: u.react_level || 0,
                joinedAt: u.joinedAt || null,
                activity: u.activity || {},
                streak: computeStreakFromActivity(u.activity || {}),
                createdCount: u.created_count || 0,
                joinedCount: u.joined_count || 0
            });
        }
        const result = await pool.query(
            'SELECT id, username, email, xp, css_level, logic_level, react_level, activity, created_count, joined_count, bio, stack, created_at FROM users WHERE id = $1',
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
            bio: u.bio || '',
            stack: u.stack || [],
            createdAt: u.created_at
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user data' });
    }
});

app.get('/leaderboard', async (req, res) => {
    try {
        if (useMemoryDB) {
            const sortedUsers = [...memoryStore.users]
                .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                .slice(0, 25)
                .map(u => ({ username: u.username, xp: u.xp || 0, level: computeLevel(u.xp || 0) }));
            return res.json(sortedUsers);
        }

        const result = await pool.query(
            'SELECT username, xp, css_level, logic_level, react_level FROM users ORDER BY xp DESC LIMIT 25'
        );
        const rows = result.rows.map(u => ({
            username: u.username,
            xp: u.xp || 0,
            level: computeLevel(u.xp || 0), // always recompute from XP
            css_level: u.css_level || 0,
            logic_level: u.logic_level || 0,
            react_level: u.react_level || 0
        }));
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
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
const FACTION_CREATE_MIN_XP = 500; // 🛡️ Apprentice badge required
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
                    xp: 0, css_level: 0, logic_level: 0, react_level: 0
                });
                userIndex = memoryStore.users.length - 1;
            }

            const user = memoryStore.users[userIndex];
            user.xp = (user.xp || 0) + amount;

            if (module && level !== undefined) {
                const key = module === 'css-odyssey' ? 'css_level' :
                    module === 'logic-lab' ? 'logic_level' :
                        module === 'react-quest' ? 'react_level' : null;
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
                react_level: user.react_level || 0
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
                    module === 'react-quest' ? 'react_level' : null;
            if (col) {
                query += `, ${col} = GREATEST(${col}, $4) `;
                params.push(level);
            }
        }

        query += 'WHERE id = $2 RETURNING xp, css_level, logic_level, react_level, activity';

        const result = await pool.query(query, params);

        if (result.rows.length === 0) {
            // Self-healing: Create user in SQL with full stats if they exist in JWT but not in DB
            const selfHealRes = await pool.query(
                `INSERT INTO users (id, username, email, password, xp, activity, css_level, logic_level, react_level) 
                 VALUES ($1, $2, $3, $4, $5, jsonb_build_object($9::text, $5), $6, $7, $8)
                 RETURNING xp, activity, css_level, logic_level, react_level`,
                [
                    req.user.id,
                    req.user.username,
                    `user_${req.user.id.slice(0, 8)}@example.com`,
                    'oauth_migrated',
                    amount,
                    module === 'css-odyssey' ? level : 0,
                    module === 'logic-lab' ? level : 0,
                    module === 'react-quest' ? level : 0,
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
                react_level: selfHealRes.rows[0].react_level
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
            react_level: result.rows[0].react_level
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
    res.json(Array.from(rooms.keys()));
});

// Rooms Management
const rooms = new Map();

io.on('connection', (socket) => {
    socket.on('join-room', ({ roomId, username }) => {
        socket.join(roomId);
        if (!rooms.has(roomId)) {
            rooms.set(roomId, {
                adminId: socket.id,
                owner: username, // Track original creator by username
                users: [],
                permissions: {},
                files: { 'script.js': { content: '// CodeBright Workspace\nconsole.log("Connect & Code!");', language: 'javascript' } },
                snapshots: []
            });
        }
        const room = rooms.get(roomId);

        // If the joining user is the original owner, they reclaim Admin rights
        if (room.owner === username) {
            room.adminId = socket.id;
        }

        // Safety check for legacy or corrupted room objects
        if (!room.snapshots) room.snapshots = [];
        if (!room.permissions) room.permissions = {};

        // --- Prevent Ghost Duplicate Users on Refresh ---
        // If this user is already in the room with an old stale socket, remove the old one.
        const staleIndex = room.users.findIndex(u => u.username === username);
        if (staleIndex !== -1) {
            const staleId = room.users[staleIndex].id;
            room.users.splice(staleIndex, 1);
            delete room.permissions[staleId];
            // Tell everyone the old ghost connection left
            socket.to(roomId).emit('user-left', { id: staleId, username });
        }

        // ── 3-Tier Role System: admin | writer | reviewer ──────────────
        const isCreator = room.owner === username;
        const role = isCreator ? 'admin' : 'viewer';
        const permission = isCreator ? 'admin' : 'read';
        room.permissions[socket.id] = permission;

        const userData = { id: socket.id, username, role, permission };
        room.users.push(userData);

        socket.emit('initial-data', {
            files: room.files,
            users: room.users,
            adminId: room.adminId,
            yourId: socket.id,
            snapshots: room.snapshots
        });

        socket.to(roomId).emit('user-joined', { socketId: socket.id, username, role, permission });

        // --- ADMIN ACTIONS: Role Management ---
        socket.on('set-role', ({ targetId, newRole }) => {
            if (socket.id !== room.adminId) return; // Only admin can change roles
            if (targetId === room.adminId) return;   // Can't change own admin role

            // Map role to permission
            const permMap = { 'writer': 'write', 'reviewer': 'read', 'admin': 'admin' };
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

        // Legacy support — still works for toggle
        socket.on('update-permissions', ({ targetId, permission }) => {
            if (socket.id !== room.adminId) return;

            // Enforce Single Writer Rule
            if (permission === 'write') {
                Object.keys(room.permissions).forEach(id => {
                    if (id !== targetId && id !== room.adminId) {
                        room.permissions[id] = 'read';
                        const userToDowngrade = room.users.find(u => u.id === id);
                        if (userToDowngrade) {
                            userToDowngrade.role = 'reviewer';
                            userToDowngrade.permission = 'read';
                            io.to(id).emit('permission-changed', { permission: 'read' });
                            io.in(roomId).emit('user-status-updated', { targetId: id, permission: 'read' });
                        }
                    }
                });
            }

            room.permissions[targetId] = permission;
            const userInRoom = room.users.find(u => u.id === targetId);
            if (userInRoom) {
                userInRoom.role = permission === 'write' ? 'writer' : 'reviewer';
                userInRoom.permission = permission;
            }
            io.to(targetId).emit('permission-changed', { permission });
            io.in(roomId).emit('user-status-updated', { targetId, permission });
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
                files: JSON.parse(JSON.stringify(room.files)),
                creator: username
            };
            room.snapshots.push(newSnapshot);
            io.in(roomId).emit('snapshot-captured', newSnapshot);
        });

        socket.on('warp-to-snapshot', ({ snapshotId }) => {
            if (!room) return;
            const snapshot = room.snapshots.find(s => s.id === snapshotId);
            if (snapshot) {
                room.files = JSON.parse(JSON.stringify(snapshot.files));
                io.in(roomId).emit('files-warped', {
                    files: room.files,
                    warpedBy: username,
                    snapshotName: snapshot.name
                });
            }
        });

        // --- BUILT-IN TERMINAL CORE ---
        socket.on('terminal-command', ({ command }) => {
            if (!command) return;
            exec(command, { cwd: path.resolve(__dirname) }, (error, stdout, stderr) => {
                const output = stdout || stderr || (error ? error.message : 'Command executed with no output.');
                io.in(roomId).emit('terminal-output', {
                    command, output: output.trim(), isError: !!error || !!stderr
                });
            });
        });

        // ── WebRTC Hologram Comms Signaling ────────────────────────
        socket.on('webrtc-offer', ({ roomId: rId, offer, targetId }) => {
            socket.to(targetId).emit('webrtc-offer', { offer, from: socket.id });
        });

        socket.on('webrtc-answer', ({ roomId: rId, answer, targetId }) => {
            socket.to(targetId).emit('webrtc-answer', { answer, from: socket.id });
        });

        socket.on('webrtc-ice-candidate', ({ roomId: rId, candidate, targetId }) => {
            socket.to(targetId).emit('webrtc-ice-candidate', { candidate, from: socket.id });
        });

        socket.on('end-call', ({ roomId: rId }) => {
            socket.to(rId).emit('call-ended');
        });
    });

    socket.on('code-change', ({ roomId, fileName, content }) => {
        const room = rooms.get(roomId);
        if (room && room.files[fileName]) {
            room.files[fileName].content = content;
            socket.to(roomId).emit('code-update', { fileName, content });
        }
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
        if (room) {
            const defaultSnippets = {
                javascript: "// JavaScript Initialized\nconsole.log('Hello from CodeBright!');\n",
                javascriptreact: "// React Component Initialized\nimport React from 'react';\n\nconst App = () => {\n  return <div>Hello React!</div>;\n};\n",
                html: "<!DOCTYPE html>\n<html>\n<head>\n  <title>New Page</title>\n</head>\n<body>\n  <h1>Hello from CodeBright!</h1>\n</body>\n</html>\n",
                css: "/* Style Initialized */\nbody {\n  margin: 0;\n  padding: 0;\n}\n",
                python: "print('Hello from CodeBright!')\n",
                cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello from CodeBright!\" << std::endl;\n    return 0;\n}\n",
                java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello from CodeBright!\");\n    }\n}\n",
                plaintext: "Welcome to CodeBright Notepad.\nWrite anything here...\n"
            };
            const content = defaultSnippets[language] || '';
            room.files[fileName] = { content, language };
            io.in(roomId).emit('file-created', { fileName, language, content });
        }
    });

    socket.on('file-delete', ({ roomId, fileName }) => {
        console.log(`[FILE_DELETE] Room: ${roomId}, File: ${fileName}`);
        const room = rooms.get(roomId);
        if (room && room.files[fileName]) {
            delete room.files[fileName];
            io.in(roomId).emit('file-deleted', { fileName });
            console.log(`[FILE_DELETE] Success: ${fileName}`);
        } else {
            console.warn(`[FILE_DELETE] Failed: File not found or room invalid`);
        }
    });

    socket.on('file-rename', ({ roomId, oldName, newName }) => {
        const room = rooms.get(roomId);
        if (room && room.files[oldName] && !room.files[newName]) {
            room.files[newName] = room.files[oldName];
            delete room.files[oldName];
            io.in(roomId).emit('file-renamed', { oldName, newName });
        }
    });

    socket.on('folder-delete', ({ roomId, folderPath }) => {
        const room = rooms.get(roomId);
        if (room) {
            const folderPrefix = folderPath + '/';
            const deletedFiles = [];
            Object.keys(room.files).forEach(fileName => {
                if (fileName.startsWith(folderPrefix)) {
                    delete room.files[fileName];
                    deletedFiles.push(fileName);
                }
            });
            io.in(roomId).emit('folder-deleted', { folderPath, deletedFiles });
        }
    });

    socket.on('folder-rename', ({ roomId, oldPath, newPath }) => {
        const room = rooms.get(roomId);
        if (room) {
            const oldPrefix = oldPath + '/';
            const newPrefix = newPath + '/';
            const renamedMap = {};
            Object.keys(room.files).forEach(fileName => {
                if (fileName.startsWith(oldPrefix)) {
                    const newName = fileName.replace(oldPrefix, newPrefix);
                    room.files[newName] = room.files[fileName];
                    delete room.files[fileName];
                    renamedMap[fileName] = newName;
                }
            });
            io.in(roomId).emit('folder-renamed', { oldPath, newPath, renamedMap });
        }
    });

    socket.on('end-session', ({ roomId }) => {
        const room = rooms.get(roomId);
        if (room && socket.id === room.adminId) {
            io.in(roomId).emit('session-ended', { message: 'The workspace owner has ended this session permanently.' });
            rooms.delete(roomId);
        }
    });



    socket.on('disconnecting', () => {
        socket.rooms.forEach(roomId => {
            const room = rooms.get(roomId);
            if (room) {
                // If the admin is leaving, we keep the room alive so they can resume later
                // Only removing from users list
                const userIndex = room.users.findIndex(u => u.id === socket.id);
                if (userIndex !== -1) {
                    const user = room.users[userIndex];
                    room.users.splice(userIndex, 1);
                    socket.to(roomId).emit('user-left', { id: socket.id, username: user.username });
                }
            }
        });
    });

    socket.on('disconnect', () => {
        // Basic cleanup handled by disconnecting but kept for consistency
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
});

// ── Local Code Execution Engine ─────────────────────────────────────────────
app.post('/execute', async (req, res) => {
    const { language, files } = req.body;
    if (!files || files.length === 0) return res.status(400).json({ error: 'No files provided' });

    const code = files[0]?.content || '';
    const os = require('os');
    const tmpDir = os.tmpdir();
    const timestamp = Date.now();

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
            // Use a local builds dir instead of system temp — avoids Windows Device Guard blocks on temp .exe files
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
            // Java 11+ allows running single source files directly
            cmd = `java "${tmpFile}"`;

        } else if (language === 'rust' || language === 'rs') {
            const srcFile = path.join(tmpDir, `cs_${timestamp}.rs`);
            const outFile = path.join(tmpDir, `cs_${timestamp}.exe`);
            fs.writeFileSync(srcFile, code);
            cmd = `rustc "${srcFile}" -o "${outFile}" && "${outFile}"`;
            tmpFile = srcFile; // Only tracking src for cleanup, but let's try to clean exe too later if needed

        } else if (language === 'go') {
            tmpFile = path.join(tmpDir, `cs_${timestamp}.go`);
            fs.writeFileSync(tmpFile, code);
            cmd = `go run "${tmpFile}"`;

        } else if (language === 'ruby' || language === 'rb') {
            tmpFile = path.join(tmpDir, `cs_${timestamp}.rb`);
            fs.writeFileSync(tmpFile, code);
            cmd = `ruby "${tmpFile}"`;

        } else {
            return res.status(400).json({ run: { stdout: '', stderr: `Unsupported language: ${language}`, code: 1 } });
        }

        console.log(`[COMPILER] Running ${language}: ${cmd}`);

        exec(cmd, { timeout: 10000, maxBuffer: 1024 * 512 }, (err, stdout, stderr) => {
            // Cleanup temp files
            try { if (tmpFile) fs.unlinkSync(tmpFile); } catch (_) { }

            if (err && !stdout && !stderr) {
                return res.json({ run: { stdout: '', stderr: err.message, code: err.code || 1 } });
            }

            res.json({
                run: {
                    stdout: stdout || '',
                    stderr: stderr || (err?.message || ''),
                    code: err ? (err.code || 1) : 0
                }
            });
        });

    } catch (err) {
        console.error('EXECUTION ERROR:', err.message);
        res.status(500).json({ run: { stdout: '', stderr: `Server error: ${err.message}`, code: 1 } });
    }
});

const PORT = process.env.PORT || 5050;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
