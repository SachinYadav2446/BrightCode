const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const { sql: dbSql, useMemoryDB } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'brightcode_secret_key_123';

// ── Database setup ──────────────────────────────────────────────────────────
let sql = dbSql;
let neonAvailable = !useMemoryDB;
let contributedMemoryStore = [];
const CONTRIBUTED_DB_FILE = path.join(__dirname, 'contributed_db.json');

// ── Auth middleware ──────────────────────────────────────────────────────────
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

// ── Memory store helpers ─────────────────────────────────────────────────────
const loadMemoryStore = () => {
    try {
        if (fs.existsSync(CONTRIBUTED_DB_FILE)) {
            const content = fs.readFileSync(CONTRIBUTED_DB_FILE, 'utf8').trim();
            if (content) contributedMemoryStore = JSON.parse(content) || [];
        } else {
            // Create empty file so future writes work
            fs.writeFileSync(CONTRIBUTED_DB_FILE, '[]', 'utf8');
        }
        logger.info(`[CONTRIBUTE] Loaded ${contributedMemoryStore.length} contributed problems from JSON store`);
    } catch (e) {
        logger.error('[CONTRIBUTE] Error loading memory store:', e.message);
        contributedMemoryStore = [];
    }
};

const saveMemoryStore = () => {
    try {
        fs.writeFileSync(CONTRIBUTED_DB_FILE, JSON.stringify(contributedMemoryStore, null, 2), 'utf8');
    } catch (e) {
        logger.error('[CONTRIBUTE] Error saving memory store:', e.message);
    }
};

// ── Try a Neon query, fall back to memory on error ──────────────────────────
const trySQL = async (queryFn, fallbackFn) => {
    if (sql && neonAvailable !== false) {
        try {
            const result = await queryFn();
            neonAvailable = true;
            return result;
        } catch (e) {
            if (e.message?.includes('fetch failed') || e.message?.includes('ECONNREFUSED') || e.code === 'ENOTFOUND') {
                neonAvailable = false;
                logger.warn('[CONTRIBUTE] Neon unreachable, switching to JSON store permanently for this session');
            } else {
                // Re-throw real SQL errors (syntax etc.)
                throw e;
            }
        }
    }
    return fallbackFn();
};

// Load memory store on startup
loadMemoryStore();

// ── Init DB table if Neon is available ──────────────────────────────────────
(async () => {
    if (!sql) return;
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
        neonAvailable = true;
        logger.info('[CONTRIBUTE] ✅ Contributed problems table verified/created in Neon DB');
    } catch (e) {
        neonAvailable = false;
        logger.warn('[CONTRIBUTE] Neon DB not available, using JSON memory store:', e.message);
    }
})();

// ═══════════════════════════════════════════════════════════════
//  ENDPOINTS
// ═══════════════════════════════════════════════════════════════

// 1. Submit a challenge
router.post('/submit', auth, async (req, res) => {
    const { title, difficulty, category, tags, description, starterCode, testCases } = req.body;
    if (!title || !difficulty || !description || !testCases || !Array.isArray(testCases)) {
        return res.status(400).json({ error: 'Missing required fields or testCases array' });
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
        await trySQL(
            async () => {
                await sql`
                    INSERT INTO contributed_problems (
                        id, title, difficulty, category, tags, description,
                        starter_code, test_cases, contributor_id, contributor_username,
                        status, created_at
                    ) VALUES (
                        ${newProblem.id}, ${newProblem.title}, ${newProblem.difficulty},
                        ${newProblem.category}, ${JSON.stringify(newProblem.tags)},
                        ${newProblem.description}, ${newProblem.starter_code},
                        ${JSON.stringify(newProblem.test_cases)}, ${newProblem.contributor_id},
                        ${newProblem.contributor_username}, ${newProblem.status}, ${newProblem.created_at}
                    )
                `;
            },
            () => {
                contributedMemoryStore.push(newProblem);
                saveMemoryStore();
            }
        );
        logger.info(`[CONTRIBUTE] New problem submitted by ${req.user.username}: ${newProblem.title}`);
        res.json({ success: true, message: 'Challenge submitted successfully to review queue.', problemId: uniqueId });
    } catch (err) {
        logger.error('[CONTRIBUTE] Submit Error:', err.message);
        res.status(500).json({ error: 'Failed to save contribution' });
    }
});

// 2. Fetch my contributions
router.get('/my', auth, async (req, res) => {
    try {
        const list = await trySQL(
            async () => {
                const rows = await sql`
                    SELECT id, title, difficulty, category, tags, description,
                           starter_code, test_cases, contributor_id,
                           contributor_username, status, created_at
                    FROM contributed_problems
                    WHERE contributor_id = ${req.user.id}
                    ORDER BY created_at DESC
                `;
                return rows;
            },
            () => {
                return contributedMemoryStore
                    .filter(x => x.contributor_id === req.user.id)
                    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            }
        );
        res.json({ success: true, contributions: list || [] });
    } catch (err) {
        logger.error('[CONTRIBUTE] Fetch my list Error:', err.message);
        // Return empty array instead of 500 — page should still load
        res.json({ success: true, contributions: [] });
    }
});

// 3. Fetch pending (admin only)
router.get('/pending', auth, async (req, res) => {
    if (req.user.username !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Administrators only' });
    }
    try {
        const list = await trySQL(
            async () => {
                const rows = await sql`
                    SELECT id, title, difficulty, category, tags, description,
                           starter_code, test_cases, contributor_id,
                           contributor_username, status, created_at
                    FROM contributed_problems
                    WHERE status = 'pending'
                    ORDER BY created_at ASC
                `;
                return rows;
            },
            () => contributedMemoryStore.filter(x => x.status === 'pending')
        );
        res.json({ success: true, pending: list || [] });
    } catch (err) {
        logger.error('[CONTRIBUTE] Fetch pending Error:', err.message);
        res.json({ success: true, pending: [] });
    }
});

// 4. Review (admin approve / reject)
router.post('/review/:id', auth, async (req, res) => {
    if (req.user.username !== 'admin') {
        return res.status(403).json({ error: 'Access denied: Administrators only' });
    }

    const { action, points, timeLimit, editTitle, editDifficulty, editCategory,
            editTags, editDescription, editStarterCode, editTestCases } = req.body;
    const problemId = req.params.id;

    if (!['approve', 'reject'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action. Must be "approve" or "reject".' });
    }

    try {
        // Find the problem
        let prob = null;
        await trySQL(
            async () => {
                const rows = await sql`SELECT * FROM contributed_problems WHERE id = ${problemId}`;
                prob = rows[0];
            },
            () => {
                prob = contributedMemoryStore.find(x => x.id === problemId);
            }
        );

        if (!prob) return res.status(404).json({ error: 'Contribution not found' });
        if (prob.status !== 'pending') return res.status(400).json({ error: 'Already reviewed' });

        if (action === 'reject') {
            await trySQL(
                async () => sql`UPDATE contributed_problems SET status = 'rejected' WHERE id = ${problemId}`,
                () => { prob.status = 'rejected'; saveMemoryStore(); }
            );
            return res.json({ success: true, message: 'Contribution rejected.' });
        }

        // ── APPROVE: build the merged problem and save to live deck ──────────
        const safeTags = Array.isArray(editTags) ? editTags : (Array.isArray(prob.tags) ? prob.tags : []);
        const safeTestCases = Array.isArray(editTestCases) && editTestCases.length > 0
            ? editTestCases
            : (Array.isArray(prob.test_cases) ? prob.test_cases : []);

        const approvedProblem = {
            id: problemId,
            title: (editTitle || prob.title).trim(),
            difficulty: (editDifficulty || prob.difficulty).toLowerCase(),
            category: editCategory || prob.category || 'algorithms',
            timeLimit: parseInt(timeLimit) || 300,
            points: parseInt(points) || 100,
            description: (editDescription || prob.description).trim(),
            tags: safeTags,
            testCases: safeTestCases,
            starterCode: editStarterCode || prob.starter_code || '',
            source: 'community',
            contributor: prob.contributor_username || 'anonymous'
        };

        // Merge into live questionsDB.json
        try {
            const { questionsDB, saveToFile, loadFromFile } = require('./seedQuestions');
            if (!questionsDB.questions || questionsDB.questions.length === 0) {
                const loaded = await loadFromFile();
                if (loaded) Object.assign(questionsDB, loaded);
            }
            // Avoid duplicates
            const exists = questionsDB.questions.some(q => q.id === problemId);
            if (!exists) {
                questionsDB.questions.push(approvedProblem);
                questionsDB.metadata = questionsDB.metadata || {};
                questionsDB.metadata.totalQuestions = questionsDB.questions.length;
                questionsDB.metadata.lastUpdated = new Date().toISOString();
                questionsDB.metadata.sources = questionsDB.metadata.sources || {};
                questionsDB.metadata.sources.community = (questionsDB.metadata.sources.community || 0) + 1;
                await saveToFile();
                logger.info(`[CONTRIBUTE] ✅ Problem "${approvedProblem.title}" merged to live deck`);
            }
        } catch (mergeErr) {
            logger.error('[CONTRIBUTE] Could not merge to questionsDB:', mergeErr.message);
            // Don't fail the entire approve — still mark as approved and reward XP
        }

        // Update status to approved
        await trySQL(
            async () => sql`UPDATE contributed_problems SET status = 'approved' WHERE id = ${problemId}`,
            () => { prob.status = 'approved'; saveMemoryStore(); }
        );

        // ── Award +500 XP to contributor ─────────────────────────────────────
        let xpAwarded = false;
        try {
            await trySQL(
                async () => {
                    await sql`
                        UPDATE users
                        SET xp = xp + 500, created_count = created_count + 1
                        WHERE id = ${prob.contributor_id} OR username = ${prob.contributor_username}
                    `;
                    xpAwarded = true;
                },
                () => {
                    // Memory store reward
                    const usersDbPath = path.join(__dirname, 'users_db.json');
                    if (fs.existsSync(usersDbPath)) {
                        const data = JSON.parse(fs.readFileSync(usersDbPath, 'utf8'));
                        const contributor = (data.users || []).find(
                            u => u.id === prob.contributor_id || u.username === prob.contributor_username
                        );
                        if (contributor) {
                            contributor.xp = (contributor.xp || 0) + 500;
                            contributor.created_count = (contributor.created_count || 0) + 1;
                            fs.writeFileSync(usersDbPath, JSON.stringify(data, null, 2), 'utf8');
                            logger.info(`[CONTRIBUTE] ✅ +500 XP awarded to ${contributor.username} (total: ${contributor.xp})`);
                            xpAwarded = true;
                        }
                    }
                }
            );
        } catch (xpErr) {
            logger.error('[CONTRIBUTE] XP award failed:', xpErr.message);
        }

        logger.info(`[CONTRIBUTE] ✅ Problem approved: "${approvedProblem.title}" by @${prob.contributor_username}`);
        res.json({
            success: true,
            message: `Problem approved and published! ${xpAwarded ? '+500 XP awarded to @' + prob.contributor_username : '(XP reward pending)'}`
        });
    } catch (err) {
        logger.error('[CONTRIBUTE] Review Error:', err.message);
        res.status(500).json({ error: 'Failed to complete review action: ' + err.message });
    }
});

module.exports = router;
