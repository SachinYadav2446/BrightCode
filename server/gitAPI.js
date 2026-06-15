/**
 * BrightCode Git API — GitHub OAuth, clone/push/pull, source control
 */

const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const logger = require('./logger');
const { GitService, validateRemoteUrl } = require('./gitService');
const { saveRoomState } = require('./workspacePersistence');

const JWT_SECRET = process.env.JWT_SECRET || 'brightcode_secret_key_123';
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '';
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || '';
const FRONTEND_URL = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
const BACKEND_URL = (process.env.BACKEND_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:5051').replace(/\/$/, '');

const oauthStates = new Map();
const tokenMemoryStore = new Map();

function encryptToken(token) {
    const key = crypto.createHash('sha256').update(JWT_SECRET).digest();
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    const encrypted = Buffer.concat([cipher.update(token, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;
}

function decryptToken(payload) {
    if (!payload) return null;
    const [ivHex, tagHex, dataHex] = payload.split(':');
    const key = crypto.createHash('sha256').update(JWT_SECRET).digest();
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    return Buffer.concat([decipher.update(Buffer.from(dataHex, 'hex')), decipher.final()]).toString('utf8');
}

function createGitRouter(deps) {
    const { rooms, io, pool, useMemoryDB, authenticateToken } = deps;
    const router = express.Router();
    let gitDbOk = !useMemoryDB && !!pool;

    const auth = (req, res, next) => authenticateToken(req, res, next);

    async function initGitTables() {
        if (!gitDbOk) return;
        try {
            await pool.query(`
                CREATE TABLE IF NOT EXISTS github_tokens (
                    user_id TEXT PRIMARY KEY,
                    access_token TEXT NOT NULL,
                    github_username TEXT,
                    github_id TEXT,
                    scope TEXT,
                    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );
            `);
            await pool.query(`
                CREATE TABLE IF NOT EXISTS workspace_git_links (
                    room_id TEXT PRIMARY KEY,
                    remote_url TEXT,
                    default_branch TEXT DEFAULT 'main',
                    linked_by TEXT,
                    linked_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
                );
            `);
        } catch (err) {
            gitDbOk = false;
            logger.warn('[GIT] Could not init git tables, using memory store:', err.message);
        }
    }
    initGitTables().catch(() => { gitDbOk = false; });

    async function saveToken(userId, tokenData) {
        const encrypted = encryptToken(tokenData.access_token);
        const memEntry = { ...tokenData, access_token: encrypted };
        if (!gitDbOk) {
            tokenMemoryStore.set(userId, memEntry);
            return;
        }
        try {
            await pool.query(`
                INSERT INTO github_tokens (user_id, access_token, github_username, github_id, scope, updated_at)
                VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
                ON CONFLICT (user_id) DO UPDATE SET
                    access_token = EXCLUDED.access_token,
                    github_username = EXCLUDED.github_username,
                    github_id = EXCLUDED.github_id,
                    scope = EXCLUDED.scope,
                    updated_at = CURRENT_TIMESTAMP
            `, [userId, encrypted, tokenData.github_username, tokenData.github_id, tokenData.scope || 'repo read:user']);
        } catch (err) {
            gitDbOk = false;
            logger.warn('[GIT] DB save failed, falling back to memory:', err.message);
            tokenMemoryStore.set(userId, memEntry);
        }
    }

    async function getToken(userId) {
        if (!gitDbOk) {
            const row = tokenMemoryStore.get(userId);
            if (!row) return null;
            return {
                access_token: decryptToken(row.access_token),
                github_username: row.github_username,
                github_id: row.github_id,
                scope: row.scope,
            };
        }
        try {
            const { rows } = await pool.query(
                'SELECT access_token, github_username, github_id, scope FROM github_tokens WHERE user_id = $1',
                [userId]
            );
            const row = rows[0] || null;
            if (!row) return null;
            return {
                access_token: decryptToken(row.access_token),
                github_username: row.github_username,
                github_id: row.github_id,
                scope: row.scope,
            };
        } catch (err) {
            gitDbOk = false;
            logger.warn('[GIT] DB read failed, falling back to memory:', err.message);
            const row = tokenMemoryStore.get(userId);
            if (!row) return null;
            return {
                access_token: decryptToken(row.access_token),
                github_username: row.github_username,
                github_id: row.github_id,
                scope: row.scope,
            };
        }
    }

    async function deleteToken(userId) {
        tokenMemoryStore.delete(userId);
        if (!gitDbOk) return;
        try {
            await pool.query('DELETE FROM github_tokens WHERE user_id = $1', [userId]);
        } catch (err) {
            gitDbOk = false;
            logger.warn('[GIT] DB delete failed:', err.message);
        }
    }

    function getRoomDir(roomId) {
        return require('path').join(__dirname, 'tmp_builds', roomId);
    }

    function getRoom(roomId) {
        return rooms.get(roomId);
    }

    function userInRoom(room, userId, username) {
        if (!room) return false;
        return room.users.some((u) => u.username === username);
    }

    function canWriteRoom(room, socketId) {
        if (!room) return false;
        if (room.adminId === socketId) return true;
        return room.permissions[socketId] === 'writer' || room.permissions[socketId] === 'admin';
    }

    function findUserSocketId(room, username) {
        const user = room.users.find((u) => u.username === username);
        return user?.id || null;
    }

    async function syncRoomFiles(roomId, room, actor) {
        if (!room?.fs) return null;
        const files = room.fs.loadFromDisk();
        room.files = files;
        saveRoomState(roomId, {
            owner: room.owner,
            snapshots: room.snapshots || [],
        });
        io.in(roomId).emit('git-sync', { files, actor });
        return files;
    }

    function gitError(res, err) {
        logger.error('[GIT]', err);
        return res.status(400).json({ error: err.message || 'Git operation failed' });
    }

    // ── OAuth ────────────────────────────────────────────────────────────────

    router.get('/oauth/status', auth, async (req, res) => {
        try {
            const token = await getToken(req.user.id);
            res.json({
                connected: !!token,
                githubUsername: token?.github_username || null,
                oauthConfigured: !!(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET),
            });
        } catch (err) {
            logger.error('[GIT] oauth/status error:', err.message);
            res.json({ connected: false, githubUsername: null, oauthConfigured: !!(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) });
        }
    });

    router.get('/oauth/authorize', auth, (req, res) => {
        if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
            return res.status(503).json({ error: 'GitHub OAuth is not configured on this server' });
        }
        const state = crypto.randomBytes(24).toString('hex');
        oauthStates.set(state, { userId: req.user.id, expires: Date.now() + 10 * 60 * 1000 });
        const params = new URLSearchParams({
            client_id: GITHUB_CLIENT_ID,
            redirect_uri: `${BACKEND_URL}/api/git/oauth/callback`,
            scope: 'repo read:user',
            state,
        });
        res.json({ url: `https://github.com/login/oauth/authorize?${params}` });
    });

    router.get('/oauth/callback', async (req, res) => {
        const { code, state } = req.query;
        if (!code || !state) {
            return res.redirect(`${FRONTEND_URL}/settings?git=error&reason=missing_params`);
        }
        const pending = oauthStates.get(state);
        oauthStates.delete(state);
        if (!pending || pending.expires < Date.now()) {
            return res.redirect(`${FRONTEND_URL}/settings?git=error&reason=invalid_state`);
        }
        try {
            const tokenRes = await axios.post(
                'https://github.com/login/oauth/access_token',
                {
                    client_id: GITHUB_CLIENT_ID,
                    client_secret: GITHUB_CLIENT_SECRET,
                    code,
                    redirect_uri: `${BACKEND_URL}/api/git/oauth/callback`,
                },
                { headers: { Accept: 'application/json' } }
            );
            const accessToken = tokenRes.data.access_token;
            if (!accessToken) throw new Error('No access token returned');

            const userRes = await axios.get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            await saveToken(pending.userId, {
                access_token: accessToken,
                github_username: userRes.data.login,
                github_id: String(userRes.data.id),
                scope: tokenRes.data.scope,
            });

            res.redirect(`${FRONTEND_URL}/settings?git=connected`);
        } catch (err) {
            logger.error('[GIT OAuth]', err.message);
            res.redirect(`${FRONTEND_URL}/settings?git=error&reason=oauth_failed`);
        }
    });

    router.post('/oauth/token', auth, async (req, res) => {
        const { token } = req.body;
        if (!token?.trim()) return res.status(400).json({ error: 'Personal access token is required' });
        try {
            const userRes = await axios.get('https://api.github.com/user', {
                headers: { Authorization: `Bearer ${token.trim()}` },
            });
            await saveToken(req.user.id, {
                access_token: token.trim(),
                github_username: userRes.data.login,
                github_id: String(userRes.data.id),
                scope: 'manual',
            });
            res.json({ connected: true, githubUsername: userRes.data.login });
        } catch {
            res.status(400).json({ error: 'Invalid GitHub token' });
        }
    });

    router.delete('/oauth/disconnect', auth, async (req, res) => {
        await deleteToken(req.user.id);
        res.json({ connected: false });
    });

    // ── Room Git operations ──────────────────────────────────────────────────

    router.get('/room/:roomId/status', auth, async (req, res) => {
        const room = getRoom(req.params.roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const git = new GitService(getRoomDir(req.params.roomId));
        try {
            const status = await git.status();
            const branches = status.isRepo ? await git.branches() : { current: null, branches: [], remotes: [] };
            const token = await getToken(req.user.id);
            res.json({ ...status, ...branches, githubConnected: !!token, githubUsername: token?.github_username });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.get('/room/:roomId/log', auth, async (req, res) => {
        const room = getRoom(req.params.roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const git = new GitService(getRoomDir(req.params.roomId));
        try {
            const commits = await git.log(Number(req.query.limit) || 20);
            res.json({ commits });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.get('/room/:roomId/diff', auth, async (req, res) => {
        const room = getRoom(req.params.roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const git = new GitService(getRoomDir(req.params.roomId));
        try {
            const diff = await git.diff(req.query.file, req.query.staged === 'true');
            res.json({ diff });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.post('/room/:roomId/init', auth, async (req, res) => {
        const { roomId } = req.params;
        const room = getRoom(roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const socketId = findUserSocketId(room, req.user.username);
        if (!canWriteRoom(room, socketId)) {
            return res.status(403).json({ error: 'Write access required' });
        }
        const git = new GitService(getRoomDir(roomId));
        try {
            await git.init();
            const files = await syncRoomFiles(roomId, room, req.user.username);
            res.json({ success: true, files });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.post('/room/:roomId/clone', auth, async (req, res) => {
        const { roomId } = req.params;
        const { url, branch } = req.body;
        const room = getRoom(roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const socketId = findUserSocketId(room, req.user.username);
        if (room.adminId !== socketId) {
            return res.status(403).json({ error: 'Only workspace admin can clone a repository' });
        }
        validateRemoteUrl(url);
        const token = await getToken(req.user.id);
        const git = new GitService(getRoomDir(roomId));
        try {
            await git.clone(url, token?.access_token, branch);
            const files = await syncRoomFiles(roomId, room, req.user.username);
            if (gitDbOk) {
                try {
                    await pool.query(`
                        INSERT INTO workspace_git_links (room_id, remote_url, default_branch, linked_by)
                        VALUES ($1, $2, $3, $4)
                        ON CONFLICT (room_id) DO UPDATE SET remote_url = EXCLUDED.remote_url, default_branch = EXCLUDED.default_branch, linked_by = EXCLUDED.linked_by, linked_at = CURRENT_TIMESTAMP
                    `, [roomId, url, branch || 'main', req.user.id]);
                } catch (dbErr) {
                    gitDbOk = false;
                    logger.warn('[GIT] Could not save workspace link:', dbErr.message);
                }
            }
            res.json({ success: true, files });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.post('/room/:roomId/stage', auth, async (req, res) => {
        const { roomId } = req.params;
        const room = getRoom(roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const socketId = findUserSocketId(room, req.user.username);
        if (!canWriteRoom(room, socketId)) {
            return res.status(403).json({ error: 'Write access required' });
        }
        const git = new GitService(getRoomDir(roomId));
        try {
            const status = await git.stage(req.body.files);
            res.json({ status });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.post('/room/:roomId/unstage', auth, async (req, res) => {
        const { roomId } = req.params;
        const room = getRoom(roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const socketId = findUserSocketId(room, req.user.username);
        if (!canWriteRoom(room, socketId)) {
            return res.status(403).json({ error: 'Write access required' });
        }
        const git = new GitService(getRoomDir(roomId));
        try {
            const status = await git.unstage(req.body.files);
            res.json({ status });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.post('/room/:roomId/commit', auth, async (req, res) => {
        const { roomId } = req.params;
        const room = getRoom(roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const socketId = findUserSocketId(room, req.user.username);
        if (!canWriteRoom(room, socketId)) {
            return res.status(403).json({ error: 'Write access required' });
        }
        const git = new GitService(getRoomDir(roomId));
        try {
            const author = {
                name: req.body.authorName || req.user.username,
                email: req.body.authorEmail || `${req.user.username}@brightcode.local`,
            };
            const result = await git.commit(req.body.message, author);
            io.in(roomId).emit('git-activity', { type: 'commit', message: req.body.message, actor: req.user.username });
            res.json(result);
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.post('/room/:roomId/checkout', auth, async (req, res) => {
        const { roomId } = req.params;
        const room = getRoom(roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const socketId = findUserSocketId(room, req.user.username);
        if (!canWriteRoom(room, socketId)) {
            return res.status(403).json({ error: 'Write access required' });
        }
        const git = new GitService(getRoomDir(roomId));
        try {
            await git.checkout(req.body.branch);
            const files = await syncRoomFiles(roomId, room, req.user.username);
            res.json({ success: true, branch: req.body.branch, files });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.post('/room/:roomId/branch', auth, async (req, res) => {
        const { roomId } = req.params;
        const room = getRoom(roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const socketId = findUserSocketId(room, req.user.username);
        if (!canWriteRoom(room, socketId)) {
            return res.status(403).json({ error: 'Write access required' });
        }
        const git = new GitService(getRoomDir(roomId));
        try {
            await git.createBranch(req.body.name);
            const files = await syncRoomFiles(roomId, room, req.user.username);
            res.json({ success: true, branch: req.body.name, files });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.post('/room/:roomId/push', auth, async (req, res) => {
        const { roomId } = req.params;
        const room = getRoom(roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const socketId = findUserSocketId(room, req.user.username);
        if (room.adminId !== socketId && !canWriteRoom(room, socketId)) {
            return res.status(403).json({ error: 'Write access required to push' });
        }
        const token = await getToken(req.user.id);
        if (!token?.access_token) {
            return res.status(401).json({ error: 'Connect GitHub in Settings or paste a personal access token' });
        }
        const git = new GitService(getRoomDir(roomId));
        try {
            const result = await git.push(token.access_token, req.body.remote || 'origin', req.body.branch);
            io.in(roomId).emit('git-activity', { type: 'push', branch: result.branch, actor: req.user.username });
            res.json({ success: true, ...result });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.post('/room/:roomId/pull', auth, async (req, res) => {
        const { roomId } = req.params;
        const room = getRoom(roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const socketId = findUserSocketId(room, req.user.username);
        if (!canWriteRoom(room, socketId)) {
            return res.status(403).json({ error: 'Write access required' });
        }
        const token = await getToken(req.user.id);
        const git = new GitService(getRoomDir(roomId));
        try {
            const result = await git.pull(token?.access_token, req.body.remote || 'origin', req.body.branch);
            const files = await syncRoomFiles(roomId, room, req.user.username);
            io.in(roomId).emit('git-activity', { type: 'pull', branch: result.branch, actor: req.user.username });
            res.json({ success: true, ...result, files });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.post('/room/:roomId/remote', auth, async (req, res) => {
        const { roomId } = req.params;
        const room = getRoom(roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const socketId = findUserSocketId(room, req.user.username);
        if (room.adminId !== socketId) {
            return res.status(403).json({ error: 'Only workspace admin can configure remotes' });
        }
        validateRemoteUrl(req.body.url);
        const git = new GitService(getRoomDir(roomId));
        try {
            const remotes = await git.addRemote(req.body.name || 'origin', req.body.url);
            res.json({ remotes });
        } catch (err) {
            return gitError(res, err);
        }
    });

    router.post('/room/:roomId/sync-from-disk', auth, async (req, res) => {
        const { roomId } = req.params;
        const room = getRoom(roomId);
        if (!userInRoom(room, req.user.id, req.user.username)) {
            return res.status(403).json({ error: 'Not in this workspace' });
        }
        const files = await syncRoomFiles(roomId, room, req.user.username);
        res.json({ files });
    });

    return router;
}

module.exports = createGitRouter;
