const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'brightcode_secret_key_123';

// ── DB / Neon Setup ─────────────────────────────────────────────────────────────
let sql = null;
let useMemoryDB = true;
let contributedMemoryStore = [];
const CONTRIBUTED_DB_FILE = path.join(__dirname, 'contributed_db.json');

if (process.env.DB_CONNECTION_STRING) {
    try {
        const { neon } = require('@neondatabase/serverless');
        sql = neon(process.env.DB_CONNECTION_STRING);
        useMemoryDB = false;
        logger.info('[CONTRIBUTE] Using Neon DB');
    } catch (e) {
        logger.warn('[CONTRIBUTE] DB connection failed, falling back to memory JSON store:', e.message);
    }
} else {
    logger.info('[CONTRIBUTE] No DB_CONNECTION_STRING — using memory JSON store');
}

// ── Auth middleware ──────────────────────────────────────────────────────────────
const auth = (req, res, next) => {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' });
    try {
        req.user = jwt.verify(header.split(' ')[1], JWT_SECRET);
        next();
    } catch {
        res.status(401).json({ error: 'Invalid token' });
    }
};

// ── Memory Loader / Saver ────────────────────────────────────────────────────────
const loadMemoryStore = () => {
    if (!useMemoryDB) return;
    try {
        if (fs.existsSync(CONTRIBUTED_DB_FILE)) {
            const fileContent = fs.readFileSync(CONTRIBUTED_DB_FILE, 'utf8');
            if (fileContent.trim()) {
                contributedMemoryStore = JSON.parse(fileContent) || [];
            }
        }
    } catch (e) {
        logger.error('[CONTRIBUTE] Error loading memory store:', e.message);
    }
};

const saveMemoryStore = () => {
    if (!useMemoryDB) return;
    try {
        fs.writeFileSync(CONTRIBUTED_DB_FILE, JSON.stringify(contributedMemoryStore, null, 2));
    } catch (e) {
        logger.error('[CONTRIBUTE] Error saving memory store:', e.message);
    }
};

// Load memory DB on launch
loadMemoryStore();

// ── DB Table init ────────────────────────────────────────────────────────────────
async function initDB() {
    if (useMemoryDB) return;
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS contributed_problems (
                id                   TEXT PRIMARY KEY,
                title                TEXT NOT NULL,
                difficulty           TEXT NOT NULL,
                category             TEXT DEFAULT 'algorithms',
                tags                 JSONB DEFAULT '[]',
                description          TEXT NOT NULL,
                starter_code         TEXT DEFAULT '',
                test_cases           JSONB DEFAULT '[]',
                contributor_id       TEXT NOT NULL,
                contributor_username TEXT NOT NULL,
                status               TEXT DEFAULT 'pending',
                created_at           TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `;
        logger.info('[CONTRIBUTE] ✅ Contributed problems table verified/created in Neon DB');
    } catch (e) {
        logger.error('[CONTRIBUTE] Failed to initialize database tables:', e.message);
    }
}
initDB();

// ── Endpoints ────────────────────────────────────────────────────────────────────

// 1. Submit a challenge
router.post('/submit', auth, async (req, res) => {
    const { title, difficulty, category, tags, description, starterCode, testCases } = req.body;
    if (!title || !difficulty || !description || !testCases || !Array.isArray(testCases)) {
        return res.status(400).json({ error: 'Missing required problem fields or testCases array' });
    }

    const uniqueId = `contrib_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const newProblem = {
        id: uniqueId,
        title: title.trim(),
        difficulty: difficulty.toLowerCase(),
        category: category || 'algorithms',
        tags: Array.isArray(tags) ? tags : [],
        description: description.trim(),
        starter_code: starterCode || '',
        test_cases: testCases,
        contributor_id: req.user.id,
        contributor_username: req.user.username,
        status: 'pending',
        created_at: new Date().toISOString()
    };

    try {
        if (useMemoryDB) {
            contributedMemoryStore.push(newProblem);
            saveMemoryStore();
        } else {
            await sql`
                INSERT INTO contributed_problems (
                    id, title, difficulty, category, tags, description, starter_code, test_cases, contributor_id, contributor_username, status, created_at
                ) VALUES (
                    ${newProblem.id}, ${newProblem.title}, ${newProblem.difficulty}, ${newProblem.category}, 
                    ${JSON.stringify(newProblem.tags)}, ${newProblem.description}, ${newProblem.starter_code}, 
                    ${JSON.stringify(newProblem.test_cases)}, ${newProblem.contributor_id}, ${newProblem.contributor_username}, 
                    ${newProblem.status}, ${newProblem.created_at}
                )
            `;
        }
        res.json({ success: true, message: 'Challenge submitted successfully to review queue.', problemId: uniqueId });
    } catch (err) {
        logger.error('[CONTRIBUTE] Submit Error:', err);
        res.status(500).json({ error: 'Failed to save contribution' });
    }
});

// 2. Fetch my contributions
router.get('/my', auth, async (req, res) => {
    try {
        let list = [];
        if (useMemoryDB) {
            list = contributedMemoryStore.filter(x => x.contributor_id === req.user.id);
        } else {
            const rows = await sql`
                SELECT id, title, difficulty, category, tags, description, starter_code as "starterCode", test_cases as "testCases", contributor_id, contributor_username, status, created_at
                FROM contributed_problems
                WHERE contributor_id = ${req.user.id}
                ORDER BY created_at DESC
            `;
            list = rows;
        }
        res.json({ success: true, contributions: list });
    } catch (err) {
        logger.error('[CONTRIBUTE] Fetch my list Error:', err);
        res.status(500).json({ error: 'Failed to retrieve contributions' });
    }
});

// 3. Fetch pending submissions (Admin only)
router.get('/pending', auth, async (req, res) => {
    if (req.user.username !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Administrators only' });
    }

    try {
        let list = [];
        if (useMemoryDB) {
            list = contributedMemoryStore.filter(x => x.status === 'pending');
        } else {
            const rows = await sql`
                SELECT id, title, difficulty, category, tags, description, starter_code as "starterCode", test_cases as "testCases", contributor_id, contributor_username, status, created_at
                FROM contributed_problems
                WHERE status = 'pending'
                ORDER BY created_at ASC
            `;
            list = rows;
        }
        res.json({ success: true, pending: list });
    } catch (err) {
        logger.error('[CONTRIBUTE] Fetch pending list Error:', err);
        res.status(500).json({ error: 'Failed to retrieve pending submissions' });
    }
});

// 4. Review a challenge (Admin only - approve/reject)
router.post('/review/:id', auth, async (req, res) => {
    if (req.user.username !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Administrators only' });
    }

    const { action, points, timeLimit, editTitle, editDifficulty, editCategory, editTags, editDescription, editStarterCode, editTestCases } = req.body;
    const problemId = req.params.id;

    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid review action. Must be "approve" or "reject".' });
    }

    try {
        let prob = null;
        if (useMemoryDB) {
            prob = contributedMemoryStore.find(x => x.id === problemId);
        } else {
            const rows = await sql`SELECT * FROM contributed_problems WHERE id = ${problemId}`;
            prob = rows[0];
        }

        if (!prob) {
            return res.status(404).json({ error: 'Contributed problem not found' });
        }

        if (prob.status !== 'pending') {
            return res.status(400).json({ error: 'Problem has already been reviewed' });
        }

        if (action === 'reject') {
            if (useMemoryDB) {
                prob.status = 'rejected';
                saveMemoryStore();
            } else {
                await sql`UPDATE contributed_problems SET status = 'rejected' WHERE id = ${problemId}`;
            }
            return res.json({ success: true, message: 'Contribution rejected' });
        }

        // Action is 'approve'
        // Construct final problem object for our questions list
        const finalTags = Array.isArray(editTags || prob.tags) ? (editTags || prob.tags) : JSON.parse(prob.tags || '[]');
        const finalTestCases = Array.isArray(editTestCases || prob.test_cases) ? (editTestCases || prob.test_cases) : JSON.parse(prob.test_cases || '[]');

        const approvedProblem = {
            id: problemId,
            title: (editTitle || prob.title).trim(),
            difficulty: (editDifficulty || prob.difficulty).toLowerCase(),
            category: editCategory || prob.category || 'algorithms',
            timeLimit: parseInt(timeLimit) || 300,
            points: parseInt(points) || 100,
            description: (editDescription || prob.description).trim(),
            tags: finalTags,
            testCases: finalTestCases,
            starterCode: editStarterCode || prob.starter_code || '',
            source: 'community',
            contributor: prob.contributor_username || 'anonymous'
        };

        // Merge to questionsDB.json
        const { questionsDB, saveToFile } = require('./seedQuestions');
        // Ensure questions are loaded first
        if (!questionsDB.questions || questionsDB.questions.length === 0) {
            const loaded = await require('./seedQuestions').loadFromFile();
            if (loaded) {
                Object.assign(questionsDB, loaded);
            }
        }

        // Add to array
        questionsDB.questions.push(approvedProblem);
        questionsDB.metadata.totalQuestions = questionsDB.questions.length;
        questionsDB.metadata.lastUpdated = new Date().toISOString();
        if (!questionsDB.metadata.sources) questionsDB.metadata.sources = {};
        questionsDB.metadata.sources.community = (questionsDB.metadata.sources.community || 0) + 1;

        // Save active questions database file
        await saveToFile();

        // Update status in submissions list
        if (useMemoryDB) {
            prob.status = 'approved';
            saveMemoryStore();

            // Reward the user in memory users store (+500 XP & created_count + 1)
            const usersDbPath = path.join(__dirname, 'users_db.json');
            if (fs.existsSync(usersDbPath)) {
                try {
                    const data = JSON.parse(fs.readFileSync(usersDbPath, 'utf8'));
                    const contributorUser = data.users?.find(x => x.id === prob.contributor_id || x.username === prob.contributor_username);
                    if (contributorUser) {
                        contributorUser.xp = (contributorUser.xp || 0) + 500;
                        contributorUser.created_count = (contributorUser.created_count || 0) + 1;
                        fs.writeFileSync(usersDbPath, JSON.stringify(data, null, 2));
                        logger.info(`[CONTRIBUTE] User ${contributorUser.username} rewarded +500 XP in memory database`);
                    }
                } catch (e) {
                    logger.error('[CONTRIBUTE] Error rewarding contributor in memory store:', e.message);
                }
            }
        } else {
            await sql`UPDATE contributed_problems SET status = 'approved' WHERE id = ${problemId}`;

            // Reward the user in SQL (+500 XP & created_count + 1)
            await sql`
                UPDATE users 
                SET xp = xp + 500, 
                    created_count = created_count + 1
                WHERE id = ${prob.contributor_id} OR username = ${prob.contributor_username}
            `;
            logger.info(`[CONTRIBUTE] User ID ${prob.contributor_id} rewarded +500 XP in Neon DB`);
        }

        res.json({ success: true, message: 'Contribution approved and published to the live challenge deck!' });
    } catch (err) {
        logger.error('[CONTRIBUTE] Review Error:', err);
        res.status(500).json({ error: 'Failed to complete review action' });
    }
});

module.exports = router;
