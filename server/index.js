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

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
});

app.use(cors());
app.use(express.json());

const JWT_SECRET = 'codesight_secret_key_123';

// Memory Fallback (for when PostgreSQL is offline)
let memoryStore = { users: [] };
let useMemoryDB = false;

// ── In-Memory Factions Store ──────────────────────────────────
const factions = new Map();

// ── XP → Level computation (matches client-side) ─────────────
const computeLevel = (xp) => {
    if (xp >= 10000) return 'Grandmaster';
    if (xp >= 5000)  return 'Expert';
    if (xp >= 2000)  return 'Advanced';
    if (xp >= 500)   return 'Apprentice';
    return 'Initiate';
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
                avatar TEXT
            );
        `);
        console.log('PostgreSQL Tables Initialized (Safe Mode)');
    } catch (err) {
        console.error('DATABASE INIT ERROR:', err.message);
        console.log('--- SWAPPING TO MEMORY FALLBACK MODE (PROGRESS WILL NOT BE PERSISTENT) ---');
        useMemoryDB = true;
    }
};
initDB();

// --- AUTHENTICATION REWRITE ---

// Standard response helper
const sendError = (res, status, message, details = null) => {
    return res.status(status).json({ error: message, details });
};

app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return sendError(res, 400, "Missing credentials", "All fields are required.");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const id = uuidV4();

        // 1. Check Memory Mode
        if (useMemoryDB) {
            const exists = memoryStore.users.find(u => u.email === email || u.username === username);
            if (exists) return sendError(res, 400, "User exists", "Name or Email is already taken.");
            
            memoryStore.users.push({ 
                id, username, email, password: hashedPassword, 
                xp: 0, css_level: 0, logic_level: 0, react_level: 0 
            });
            return res.status(201).json({ 
                message: "Registered in Memory Mode", 
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
    const { email, password } = req.body;

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
        res.json({ 
            token, 
            username: user.username, 
            email: user.email, 
            xp: user.xp || 0,
            css_level: user.css_level || 0,
            logic_level: user.logic_level || 0,
            react_level: user.react_level || 0
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
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username cannot be empty' });

  try {
      const existing = await pool.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, req.user.id]);
      if (existing.rows.length > 0) return res.status(400).json({ error: 'Username is already taken' });

      const result = await pool.query(
          'UPDATE users SET username = $1 WHERE id = $2 RETURNING email, xp',
          [username, req.user.id]
      );
      
      const user = result.rows[0];
      if (!user) return res.status(404).json({ error: 'User not found' });

      const token = jwt.sign({ id: req.user.id, username: username }, JWT_SECRET, { expiresIn: '1d' });
      res.json({ token, username, email: user.email, xp: user.xp });
  } catch (err) {
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
                    email: `${req.user.username}@codesight.memory`,
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
                react_level: u.react_level || 0
            });
        }
        const result = await pool.query(
            'SELECT id, username, email, xp, css_level, logic_level, react_level FROM users WHERE id = $1',
            [req.user.id]
        );
        if (!result.rows[0]) return res.status(404).json({ error: 'User not found' });
        const u = result.rows[0];
        res.json({ ...u, xp: u.xp || 0, level: computeLevel(u.xp || 0) });
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

// ── Factions API ───────────────────────────────────────────────
app.get('/factions', (req, res) => {
    const list = Array.from(factions.values())
        .map(f => ({
            ...f,
            totalXp: (f.members || []).reduce((sum, m) => sum + (m.xp || 0), 0)
        }))
        .sort((a, b) => b.totalXp - a.totalXp);
    res.json(list);
});

app.get('/factions/:id', (req, res) => {
    const faction = factions.get(req.params.id);
    if (!faction) return res.status(404).json({ error: 'Faction not found' });
    res.json({ ...faction, totalXp: (faction.members || []).reduce((s, m) => s + (m.xp || 0), 0) });
});

app.post('/factions/create', authenticateToken, (req, res) => {
    const { name, description, emblem } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ error: 'Faction name is required' });
    // Check if user already owns a faction
    for (const f of factions.values()) {
        if (f.ownerId === req.user.id) return res.status(400).json({ error: 'You already lead a faction' });
    }
    const id = uuidV4();
    factions.set(id, {
        id, name: name.trim(),
        description: description || '',
        emblem: emblem || '⚔️',
        ownerId: req.user.id,
        ownerName: req.user.username,
        members: [{ id: req.user.id, username: req.user.username, xp: 0, role: 'leader' }],
        createdAt: new Date().toISOString()
    });
    res.status(201).json({ id, name, message: `Faction "${name}" established` });
});

app.post('/factions/join/:id', authenticateToken, async (req, res) => {
    const faction = factions.get(req.params.id);
    if (!faction) return res.status(404).json({ error: 'Faction not found' });
    // Check already in any faction
    for (const f of factions.values()) {
        if (f.members.find(m => m.id === req.user.id)) {
            return res.status(400).json({ error: 'Already in a faction. Leave current faction first.' });
        }
    }
    let xp = 0;
    if (!useMemoryDB) {
        try {
            const r = await pool.query('SELECT xp FROM users WHERE id = $1', [req.user.id]);
            xp = r.rows[0]?.xp || 0;
        } catch {}
    }
    faction.members.push({ id: req.user.id, username: req.user.username, xp, role: 'member' });
    res.json({ message: `Joined "${faction.name}"`, factionName: faction.name });
});

app.post('/factions/leave/:id', authenticateToken, (req, res) => {
    const faction = factions.get(req.params.id);
    if (!faction) return res.status(404).json({ error: 'Faction not found' });
    if (faction.ownerId === req.user.id && faction.members.length > 1) {
        return res.status(400).json({ error: 'Transfer leadership before leaving, or disband the faction.' });
    }
    faction.members = faction.members.filter(m => m.id !== req.user.id);
    if (faction.members.length === 0) factions.delete(req.params.id);
    res.json({ message: 'Left faction' });
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

            // ── Broadcast live leaderboard update (memory mode) ──────
            const memLb = [...memoryStore.users]
                .sort((a, b) => (b.xp || 0) - (a.xp || 0))
                .slice(0, 25)
                .map(u => ({ username: u.username, xp: u.xp || 0, level: computeLevel(u.xp || 0) }));
            io.emit('leaderboard-update', memLb);
            
            return res.json({ 
                success: true, 
                xp: user.xp,
                css_level: user.css_level || 0,
                logic_level: user.logic_level || 0,
                react_level: user.react_level || 0
            });
        }

        // 2. PostgreSQL Mode
        let query = 'UPDATE users SET xp = xp + $1 ';
        let params = [amount, req.user.id];
        
        if (module && level !== undefined) {
           const col = module === 'css-odyssey' ? 'css_level' : 
                       module === 'logic-lab' ? 'logic_level' : 
                       module === 'react-quest' ? 'react_level' : null;
           if (col) {
               query += `, ${col} = GREATEST(${col}, $3) `;
               params.push(level);
           }
        }
        
        query += 'WHERE id = $2 RETURNING xp, css_level, logic_level, react_level';
        
        const result = await pool.query(query, params);
        
        if (result.rows.length === 0) {
            // Self-healing: Create user in SQL with full stats if they exist in JWT but not in DB
            await pool.query(
                `INSERT INTO users (id, username, email, password, xp, css_level, logic_level, react_level) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                [
                    req.user.id, 
                    req.user.username, 
                    `user_${req.user.id.slice(0,8)}@example.com`, 
                    'oauth_migrated', 
                    amount,
                    module === 'css-odyssey' ? level : 0,
                    module === 'logic-lab' ? level : 0,
                    module === 'react-quest' ? level : 0
                ]
            );
            return res.json({ 
                success: true, 
                xp: amount,
                css_level: module === 'css-odyssey' ? level : 0,
                logic_level: module === 'logic-lab' ? level : 0,
                react_level: module === 'react-quest' ? level : 0
            });
        }
        
        res.json({ 
            success: true, 
            xp: result.rows[0].xp,
            css_level: result.rows[0].css_level,
            logic_level: result.rows[0].logic_level,
            react_level: result.rows[0].react_level
        });

        // ── Broadcast leaderboard update so Hall of Fame refreshes live
        try {
            const lb = await pool.query(
                'SELECT username, xp FROM users ORDER BY xp DESC LIMIT 25'
            );
            io.emit('leaderboard-update', lb.rows.map(u => ({ 
                username: u.username, xp: u.xp || 0, level: computeLevel(u.xp || 0) 
            })));
        } catch {}

    } catch (err) {
        console.error('XP Sync Error:', err);
        res.status(500).json({ error: 'Failed to update XP' });
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
        users: [],
        permissions: {},
        files: { 'index.js': { content: '// Code Sight Workspace\nconsole.log("Connect & Code!");', language: 'javascript' } },
        snapshots: []
      });
    }
    const room = rooms.get(roomId);
    
    // Safety check for legacy or corrupted room objects
    if (!room.snapshots) room.snapshots = [];
    if (!room.permissions) room.permissions = {};
    if (!room.adminId) room.adminId = socket.id;

    const role = room.adminId === socket.id ? 'admin' : 'collaborator';
    room.permissions[socket.id] = 'write';
    
    const userData = { id: socket.id, username, role, permission: 'write' };
    room.users.push(userData);
    
    socket.emit('initial-data', { 
        files: room.files, 
        users: room.users, 
        adminId: room.adminId, 
        yourId: socket.id,
        snapshots: room.snapshots
    });
    
    socket.to(roomId).emit('user-joined', { socketId: socket.id, username, role, permission: 'write' });

    // --- ADMIN ACTIONS ---
    socket.on('update-permissions', ({ targetId, permission }) => {
        if (socket.id !== room.adminId) return; // Non-admins can't change permissions
        room.permissions[targetId] = permission;
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

  socket.on('file-create', ({ roomId, fileName, language }) => {
    const room = rooms.get(roomId);
    if (room) {
      const defaultSnippets = {
        javascript: "console.log('Hello from Code Sight!');\n",
        python: "print('Hello from Code Sight!')\n",
        cpp: "#include <iostream>\n\nint main() {\n    std::cout << \"Hello from Code Sight!\" << std::endl;\n    return 0;\n}\n",
        java: "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello from Code Sight!\");\n    }\n}\n"
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

  socket.on('disconnecting', () => {
    socket.rooms.forEach(roomId => {
      const room = rooms.get(roomId);
      if (room) {
        // If the admin is leaving, kill the session and wipe the room
        if (room.adminId === socket.id) {
          socket.to(roomId).emit('session-ended', { message: 'The admin has left. This workspace is now closed.' });
          rooms.delete(roomId);
        } else {
          // Normal user leaving
          const userIndex = room.users.findIndex(u => u.id === socket.id);
          if (userIndex !== -1) {
            const user = room.users[userIndex];
            room.users.splice(userIndex, 1);
            socket.to(roomId).emit('user-left', { id: socket.id, username: user.username });
          }
        }
      }
    });
  });

  socket.on('disconnect', () => {
    // Basic cleanup handled by disconnecting but kept for consistency
  });
});

// Compiler (Using Piston API for multi-language support)
app.post('/execute', async (req, res) => {
  const { language, files } = req.body;
  if (!files || files.length === 0) return res.status(400).json({ error: 'No files provided' });
  
  try {
    const langMap = {
      'javascript': 'js',
      'js': 'js',
      'python': 'python3',
      'python3': 'python3',
      'py': 'python3',
      'cpp': 'cpp',
      'java': 'java'
    };

    const pistonLang = langMap[language.toLowerCase()] || language.toLowerCase();
    
    // Piston API allowed running code in high-fidelity environments
    const response = await axios.post('https://emkc.org/api/v2/piston/execute', {
        language: pistonLang,
        version: '*', 
        files: files.map(f => ({
            name: f.name,
            content: f.content
        }))
    }, { timeout: 15000 }); 

    if (response.data.message) {
        throw new Error(response.data.message);
    }

    res.json(response.data);
  } catch (err) {
    console.error('EXECUTION ERROR:', err.message);
    res.status(500).json({ 
        run: { 
            stdout: '', 
            stderr: `Execution System Error: ${err.message}`, 
            code: 1 
        } 
    });
  }
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
