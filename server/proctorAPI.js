/**
 * Proctored Interview/Assessment API Routes
 */

const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

const JWT_SECRET = process.env.JWT_SECRET || 'brightcode_secret_key_123';

// ── DB setup ────────────────────────────────────────────────────────────────────
let sql = null;
let useMemoryDB = true;
const memoryStore = { sessions: [], violations: [], submissions: [] };

if (process.env.DB_CONNECTION_STRING) {
    try {
        const { neon } = require('@neondatabase/serverless');
        sql = neon(process.env.DB_CONNECTION_STRING);
        useMemoryDB = false;
        logger.info('[PROCTOR] Using Neon DB');
    } catch (e) {
        logger.warn('[PROCTOR] DB init failed, falling back to memory store:', e.message);
    }
} else {
    logger.info('[PROCTOR] No DB_CONNECTION_STRING — using memory store');
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

// ── Helper: parse JSON fields from a DB row ──────────────────────────────────────
const parseRow = (row) => {
    if (!row) return null;
    return {
        ...row,
        questions:    safeParseJSON(row.questions,    []),
        participants: safeParseJSON(row.participants, []),
        settings:     safeParseJSON(row.settings,     {}),
        // camelCase aliases for snake_case DB cols
        creatorId:    row.creatorId    || row.creator_id,
        interviewerId:row.interviewerId|| row.interviewer_id,
        timeLimit:    row.timeLimit    ?? row.time_limit,
        createdAt:    row.createdAt    || row.created_at,
        startedAt:    row.startedAt    || row.started_at,
        completedAt:  row.completedAt  || row.completed_at,
        endReason:    row.endReason    || row.end_reason,
    };
};

const safeParseJSON = (val, fallback) => {
    if (Array.isArray(val) || (val && typeof val === 'object')) return val;
    try { return JSON.parse(val || 'null') ?? fallback; }
    catch { return fallback; }
};

// ── Sanitize for client ──────────────────────────────────────────────────────────
const sanitize = (s) => ({
    id:            s.id,
    title:         s.title,
    mode:          s.mode,
    timeLimit:     s.timeLimit    ?? s.time_limit    ?? 0,
    creatorId:     s.creatorId    || s.creator_id,
    interviewerId: s.interviewerId|| s.interviewer_id,
    status:        s.status,
    questions:     Array.isArray(s.questions)    ? s.questions    : safeParseJSON(s.questions,    []),
    participants:  Array.isArray(s.participants) ? s.participants : safeParseJSON(s.participants, []),
    settings:      (typeof s.settings === 'object' && s.settings !== null) ? s.settings : safeParseJSON(s.settings, {}),
    createdAt:     s.createdAt    || s.created_at,
    startedAt:     s.startedAt    || s.started_at,
    completedAt:   s.completedAt  || s.completed_at,
    endReason:     s.endReason    || s.end_reason,
    violationCount: s.violationCount ?? 0,
});

const getUserSubscription = async (userId) => {
    if (useMemoryDB) {
        const fs = require('fs');
        const path = require('path');
        const dbPath = path.join(__dirname, 'users_db.json');
        if (fs.existsSync(dbPath)) {
            try {
                const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
                const u = data.users?.find(x => x.id === userId);
                if (u?.username === 'admin') return 'elite';
                return u?.subscription || 'basic';
            } catch (e) {
                logger.error('[PROCTOR] Failed to parse users_db.json', e);
            }
        }
        return 'basic';
    } else {
        try {
            const rows = await sql`SELECT username, subscription FROM users WHERE id = ${userId}`;
            if (rows[0]?.username === 'admin') return 'elite';
            return rows[0]?.subscription || 'basic';
        } catch (e) {
            logger.error('[PROCTOR] Failed to query users subscription', e);
            return 'basic';
        }
    }
};

// ════════════════════════════════════════════════════════════════════════════════
// CREATE SESSION
// ════════════════════════════════════════════════════════════════════════════════
router.post('/create-session', auth, async (req, res) => {
    try {
        const sub = await getUserSubscription(req.user.id);
        if (sub === 'basic') {
            return res.status(403).json({
                error: 'Proctored sessions require a Pro Developer or Enterprise Elite subscription. Upgrade your account to activate exam surveillance.'
            });
        }

        const { title, mode, timeLimit, questions = [], participants = [], settings = {} } = req.body;
        if (!title || !mode || !timeLimit) return res.status(400).json({ error: 'title, mode and timeLimit are required' });

        const id = uuidv4();
        const session = {
            id,
            title,
            mode,
            timeLimit:     timeLimit * 60,
            creatorId:     req.user.id,
            interviewerId: req.user.id,
            status:        'created',
            questions,
            participants,
            settings: {
                requireCamera:     settings.requireCamera     ?? true,
                requireFullscreen: settings.requireFullscreen ?? true,
                requireMicrophone: settings.requireMicrophone ?? false,
                recordScreen:      settings.recordScreen      ?? false,
                allowTabSwitch:    settings.allowTabSwitch    ?? false,
                maxViolations:     settings.maxViolations     ?? 3,
                autoSubmit:        settings.autoSubmit        ?? true,
                accessCode:        settings.accessCode        || '',
                ...settings,
            },
            violations:     [],
            submissions:    [],
            violationCount: 0,
            createdAt:      new Date().toISOString(),
            startedAt:      null,
            completedAt:    null,
            endReason:      null,
        };

        if (useMemoryDB) {
            memoryStore.sessions.push(session);
        } else {
            await sql`
                INSERT INTO proctor_sessions
                  (id, title, mode, time_limit, creator_id, interviewer_id, status, questions, participants, settings, created_at)
                VALUES (
                  ${id}, ${title}, ${mode}, ${session.timeLimit},
                  ${req.user.id}, ${req.user.id}, 'created',
                  ${JSON.stringify(questions)}, ${JSON.stringify(participants)},
                  ${JSON.stringify(session.settings)}, ${session.createdAt}
                )
            `;
        }

        logger.info(`[PROCTOR] Session created: ${id} by ${req.user.id}`);
        res.json({ success: true, session: sanitize(session), sessionId: id });

    } catch (err) {
        logger.error('[PROCTOR] create-session error:', err);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// GET SESSION
// ════════════════════════════════════════════════════════════════════════════════
router.get('/session/:sessionId', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        let session;

        if (useMemoryDB) {
            session = memoryStore.sessions.find(s => s.id === sessionId);
        } else {
            const rows = await sql`SELECT * FROM proctor_sessions WHERE id = ${sessionId}`;
            session = parseRow(rows[0]);
        }

        if (!session) return res.status(404).json({ error: 'Session not found' });

        const uid        = req.user.id;
        const cId        = session.creatorId    || session.creator_id;
        const iId        = session.interviewerId|| session.interviewer_id;
        const parts      = Array.isArray(session.participants) ? session.participants : safeParseJSON(session.participants, []);
        const isOwner    = cId === uid || iId === uid;
        const isPart     = parts.some(p => p.id === uid);

        if (!isOwner && !isPart) return res.status(403).json({ error: 'Access denied' });

        res.json({ success: true, session: sanitize(session) });

    } catch (err) {
        logger.error('[PROCTOR] get-session error:', err);
        res.status(500).json({ error: 'Failed to get session' });
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// JOIN SESSION
// ════════════════════════════════════════════════════════════════════════════════
router.post('/join-session', auth, async (req, res) => {
    try {
        const { sessionId, accessCode } = req.body;
        if (!sessionId) return res.status(400).json({ error: 'sessionId required' });

        let session;
        if (useMemoryDB) {
            session = memoryStore.sessions.find(s => s.id === sessionId);
        } else {
            const rows = await sql`SELECT * FROM proctor_sessions WHERE id = ${sessionId}`;
            session = parseRow(rows[0]);
        }

        if (!session) return res.status(404).json({ error: 'Session not found' });
        if (!['created', 'lobby', 'active'].includes(session.status)) {
            return res.status(400).json({ error: 'Session is not available for joining' });
        }

        const settings = (typeof session.settings === 'object' && session.settings !== null)
            ? session.settings
            : safeParseJSON(session.settings, {});

        if (settings.accessCode && settings.accessCode !== accessCode) {
            return res.status(403).json({ error: 'Invalid access code' });
        }

        const participants = Array.isArray(session.participants)
            ? session.participants
            : safeParseJSON(session.participants, []);

        if (!participants.some(p => p.id === req.user.id)) {
            participants.push({
                id:       req.user.id,
                username: req.user.username,
                joinedAt: new Date().toISOString(),
                status:   'joined',
            });

            if (useMemoryDB) {
                const idx = memoryStore.sessions.findIndex(s => s.id === sessionId);
                if (idx !== -1) memoryStore.sessions[idx].participants = participants;
            } else {
                await sql`
                    UPDATE proctor_sessions SET participants = ${JSON.stringify(participants)}
                    WHERE id = ${sessionId}
                `;
            }
            session.participants = participants;
        }

        res.json({ success: true, session: sanitize(session) });

    } catch (err) {
        logger.error('[PROCTOR] join-session error:', err);
        res.status(500).json({ error: 'Failed to join session' });
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// START SESSION
// ════════════════════════════════════════════════════════════════════════════════
router.post('/start-session', auth, async (req, res) => {
    try {
        const { sessionId } = req.body;
        let session;

        if (useMemoryDB) {
            session = memoryStore.sessions.find(s => s.id === sessionId);
        } else {
            const rows = await sql`SELECT * FROM proctor_sessions WHERE id = ${sessionId}`;
            session = parseRow(rows[0]);
        }

        if (!session) return res.status(404).json({ error: 'Session not found' });

        const cId = session.creatorId || session.creator_id;
        const iId = session.interviewerId || session.interviewer_id;
        if (cId !== req.user.id && iId !== req.user.id) {
            return res.status(403).json({ error: 'Only the interviewer can start the session' });
        }

        const startedAt = new Date().toISOString();
        if (useMemoryDB) {
            const idx = memoryStore.sessions.findIndex(s => s.id === sessionId);
            if (idx !== -1) {
                memoryStore.sessions[idx].status    = 'active';
                memoryStore.sessions[idx].startedAt = startedAt;
                session = memoryStore.sessions[idx];
            }
        } else {
            await sql`
                UPDATE proctor_sessions SET status = 'active', started_at = ${startedAt}
                WHERE id = ${sessionId}
            `;
            session.status    = 'active';
            session.startedAt = startedAt;
        }

        logger.info(`[PROCTOR] Session started: ${sessionId}`);
        res.json({ success: true, session: sanitize(session) });

    } catch (err) {
        logger.error('[PROCTOR] start-session error:', err);
        res.status(500).json({ error: 'Failed to start session' });
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// END SESSION
// ════════════════════════════════════════════════════════════════════════════════
router.post('/end-session', auth, async (req, res) => {
    try {
        const { sessionId, reason } = req.body;
        let session;

        if (useMemoryDB) {
            session = memoryStore.sessions.find(s => s.id === sessionId);
        } else {
            const rows = await sql`SELECT * FROM proctor_sessions WHERE id = ${sessionId}`;
            session = parseRow(rows[0]);
        }

        if (!session) return res.status(404).json({ error: 'Session not found' });

        const cId  = session.creatorId || session.creator_id;
        const iId  = session.interviewerId || session.interviewer_id;
        const parts= Array.isArray(session.participants)
            ? session.participants : safeParseJSON(session.participants, []);
        const ok   = cId === req.user.id || iId === req.user.id || parts.some(p => p.id === req.user.id);
        if (!ok) return res.status(403).json({ error: 'Not authorized' });

        const newStatus   = reason === 'VIOLATIONS' ? 'terminated' : 'completed';
        const completedAt = new Date().toISOString();

        if (useMemoryDB) {
            const idx = memoryStore.sessions.findIndex(s => s.id === sessionId);
            if (idx !== -1) {
                memoryStore.sessions[idx].status      = newStatus;
                memoryStore.sessions[idx].completedAt = completedAt;
                memoryStore.sessions[idx].endReason   = reason;
                session = memoryStore.sessions[idx];
            }
        } else {
            await sql`
                UPDATE proctor_sessions
                SET status = ${newStatus}, completed_at = ${completedAt}, end_reason = ${reason || 'COMPLETED'}
                WHERE id = ${sessionId}
            `;
            session.status      = newStatus;
            session.completedAt = completedAt;
            session.endReason   = reason;
        }

        logger.info(`[PROCTOR] Session ended: ${sessionId}, reason: ${reason}`);
        res.json({ success: true, session: sanitize(session) });

    } catch (err) {
        logger.error('[PROCTOR] end-session error:', err);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// DELETE SESSION
// ════════════════════════════════════════════════════════════════════════════════
router.delete('/session/:sessionId', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        if (useMemoryDB) {
            const idx = memoryStore.sessions.findIndex(s => s.id === sessionId);
            if (idx === -1) return res.status(404).json({ error: 'Session not found' });
            const session = memoryStore.sessions[idx];
            if (session.creatorId !== req.user.id) {
                return res.status(403).json({ error: 'Only the creator can delete a session' });
            }
            // Allow deleting any non-active session
            if (session.status === 'active') {
                return res.status(400).json({ error: 'Cannot delete an active session — end it first' });
            }
            memoryStore.sessions.splice(idx, 1);
        } else {
            // Prevent deleting active sessions
            const rows = await sql`SELECT status, creator_id FROM proctor_sessions WHERE id = ${sessionId}`;
            if (!rows[0]) return res.status(404).json({ error: 'Session not found' });
            if (rows[0].creator_id !== req.user.id) return res.status(403).json({ error: 'Only the creator can delete a session' });
            if (rows[0].status === 'active') return res.status(400).json({ error: 'Cannot delete an active session — end it first' });
            await sql`DELETE FROM proctor_sessions WHERE id = ${sessionId} AND creator_id = ${req.user.id}`;
        }
        res.json({ success: true });
    } catch (err) {
        logger.error('[PROCTOR] delete-session error:', err);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// REPORT VIOLATION
// ════════════════════════════════════════════════════════════════════════════════
router.post('/report-violation', auth, async (req, res) => {
    try {
        const { sessionId, type, description, severity, metadata } = req.body;
        if (!sessionId || !type || !description) return res.status(400).json({ error: 'Missing fields' });

        const violation = {
            id:          uuidv4(),
            sessionId,
            userId:      req.user.id,
            type,
            description,
            severity:    severity || 'MEDIUM',
            metadata:    metadata || {},
            timestamp:   new Date().toISOString(),
        };

        if (useMemoryDB) {
            memoryStore.violations.push(violation);
        } else {
            await sql`
                INSERT INTO proctor_violations (id, session_id, user_id, type, description, severity, metadata, timestamp)
                VALUES (${violation.id}, ${sessionId}, ${req.user.id}, ${type}, ${description},
                        ${violation.severity}, ${JSON.stringify(violation.metadata)}, ${violation.timestamp})
            `;
        }

        res.json({ success: true, violation });
    } catch (err) {
        logger.error('[PROCTOR] report-violation error:', err);
        res.status(500).json({ error: 'Failed to report violation' });
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// GET VIOLATIONS
// ════════════════════════════════════════════════════════════════════════════════
router.get('/session/:sessionId/violations', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        let violations;

        if (useMemoryDB) {
            violations = memoryStore.violations.filter(v => v.sessionId === sessionId);
        } else {
            violations = await sql`SELECT * FROM proctor_violations WHERE session_id = ${sessionId} ORDER BY timestamp ASC`;
            violations = violations.map(v => ({ ...v, metadata: safeParseJSON(v.metadata, {}) }));
        }

        res.json({ success: true, violations });
    } catch (err) {
        logger.error('[PROCTOR] get-violations error:', err);
        res.status(500).json({ error: 'Failed to get violations' });
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// SUBMIT CODE
// ════════════════════════════════════════════════════════════════════════════════
router.post('/submit-code', auth, async (req, res) => {
    try {
        const { sessionId, questionId, code, language, timestamp } = req.body;
        if (!sessionId || !code) return res.status(400).json({ error: 'sessionId and code are required' });

        const submission = {
            id:          uuidv4(),
            sessionId,
            userId:      req.user.id,
            questionId:  questionId || 'open',
            code,
            language:    language || 'javascript',
            timestamp:   timestamp || new Date().toISOString(),
            submittedAt: new Date().toISOString(),
        };

        if (useMemoryDB) {
            memoryStore.submissions.push(submission);
        } else {
            await sql`
                INSERT INTO proctor_submissions (id, session_id, user_id, question_id, code, language, timestamp, submitted_at)
                VALUES (${submission.id}, ${sessionId}, ${req.user.id}, ${submission.questionId},
                        ${code}, ${submission.language}, ${submission.timestamp}, ${submission.submittedAt})
            `;
        }

        res.json({ success: true, submission });
    } catch (err) {
        logger.error('[PROCTOR] submit-code error:', err);
        res.status(500).json({ error: 'Failed to submit code' });
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// GET SUBMISSIONS
// ════════════════════════════════════════════════════════════════════════════════
router.get('/session/:sessionId/submissions', auth, async (req, res) => {
    try {
        const { sessionId } = req.params;
        let submissions;

        if (useMemoryDB) {
            submissions = memoryStore.submissions.filter(s => s.sessionId === sessionId);
        } else {
            submissions = await sql`SELECT * FROM proctor_submissions WHERE session_id = ${sessionId} ORDER BY submitted_at ASC`;
        }

        res.json({ success: true, submissions });
    } catch (err) {
        logger.error('[PROCTOR] get-submissions error:', err);
        res.status(500).json({ error: 'Failed to get submissions' });
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// MY SESSIONS  (fixed — no broken JSON LIKE query)
// ════════════════════════════════════════════════════════════════════════════════
router.get('/my-sessions', auth, async (req, res) => {
    try {
        let sessions;

        if (useMemoryDB) {
            sessions = memoryStore.sessions.filter(s => {
                const cId   = s.creatorId    || s.creator_id;
                const iId   = s.interviewerId|| s.interviewer_id;
                const parts = Array.isArray(s.participants) ? s.participants : safeParseJSON(s.participants, []);
                return cId === req.user.id || iId === req.user.id || parts.some(p => p.id === req.user.id);
            });
        } else {
            // Only fetch sessions where user is creator/interviewer — avoid broken LIKE on JSON
            const rows = await sql`
                SELECT * FROM proctor_sessions
                WHERE creator_id = ${req.user.id} OR interviewer_id = ${req.user.id}
                ORDER BY created_at DESC
            `;
            sessions = rows.map(parseRow);
        }

        res.json({ success: true, sessions: sessions.map(sanitize) });

    } catch (err) {
        logger.error('[PROCTOR] my-sessions error:', err);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
});

// ════════════════════════════════════════════════════════════════════════════════
// DB INIT  (create tables if using Neon)
// ════════════════════════════════════════════════════════════════════════════════
async function initDB() {
    if (useMemoryDB) return;
    try {
        await sql`
            CREATE TABLE IF NOT EXISTS proctor_sessions (
                id              VARCHAR(36) PRIMARY KEY,
                title           VARCHAR(255) NOT NULL,
                mode            VARCHAR(50)  NOT NULL,
                time_limit      INTEGER      NOT NULL,
                creator_id      VARCHAR(36)  NOT NULL,
                interviewer_id  VARCHAR(36)  NOT NULL,
                status          VARCHAR(50)  NOT NULL DEFAULT 'created',
                questions       TEXT,
                participants    TEXT,
                settings        TEXT,
                created_at      TIMESTAMPTZ  DEFAULT NOW(),
                started_at      TIMESTAMPTZ,
                completed_at    TIMESTAMPTZ,
                end_reason      VARCHAR(100)
            )
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS proctor_violations (
                id          VARCHAR(36) PRIMARY KEY,
                session_id  VARCHAR(36) NOT NULL,
                user_id     VARCHAR(36) NOT NULL,
                type        VARCHAR(100) NOT NULL,
                description TEXT         NOT NULL,
                severity    VARCHAR(20)  DEFAULT 'MEDIUM',
                metadata    TEXT,
                timestamp   TIMESTAMPTZ  DEFAULT NOW()
            )
        `;
        await sql`
            CREATE TABLE IF NOT EXISTS proctor_submissions (
                id           VARCHAR(36) PRIMARY KEY,
                session_id   VARCHAR(36) NOT NULL,
                user_id      VARCHAR(36) NOT NULL,
                question_id  VARCHAR(36),
                code         TEXT        NOT NULL,
                language     VARCHAR(50) DEFAULT 'javascript',
                timestamp    TIMESTAMPTZ,
                submitted_at TIMESTAMPTZ DEFAULT NOW()
            )
        `;
        await sql`CREATE INDEX IF NOT EXISTS idx_ps_creator   ON proctor_sessions(creator_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_ps_status    ON proctor_sessions(status)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_pv_session   ON proctor_violations(session_id)`;
        await sql`CREATE INDEX IF NOT EXISTS idx_psub_session ON proctor_submissions(session_id)`;
        logger.info('[PROCTOR] DB tables ready');
    } catch (err) {
        logger.error('[PROCTOR] DB init failed — switching to memory store:', err.message);
        useMemoryDB = true;
    }
}

initDB();

module.exports = router;
