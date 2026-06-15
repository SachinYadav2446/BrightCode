const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const STORE_DIR = path.join(__dirname, 'workspace_store');

function ensureStoreDir() {
    if (!fs.existsSync(STORE_DIR)) {
        fs.mkdirSync(STORE_DIR, { recursive: true });
    }
}

function getStorePath(roomId) {
    return path.join(STORE_DIR, `${roomId}.json`);
}

function saveRoomState(roomId, { owner, snapshots, workspaceName }) {
    if (!roomId) return;
    try {
        ensureStoreDir();
        const existing = loadRoomState(roomId) || {};
        const payload = {
            roomId,
            owner: owner || existing.owner,
            snapshots: snapshots ?? existing.snapshots ?? [],
            workspaceName: workspaceName || existing.workspaceName || null,
            savedAt: new Date().toISOString(),
        };
        fs.writeFileSync(getStorePath(roomId), JSON.stringify(payload, null, 2));
    } catch (err) {
        logger.warn(`[PERSIST] Failed to save room ${roomId}:`, err.message);
    }
}

function loadRoomState(roomId) {
    const storePath = getStorePath(roomId);
    if (!fs.existsSync(storePath)) return null;
    try {
        return JSON.parse(fs.readFileSync(storePath, 'utf8'));
    } catch (err) {
        logger.warn(`[PERSIST] Failed to load room ${roomId}:`, err.message);
        return null;
    }
}

function deleteRoomState(roomId) {
    const storePath = getStorePath(roomId);
    if (fs.existsSync(storePath)) {
        try {
            fs.unlinkSync(storePath);
        } catch (err) {
            logger.warn(`[PERSIST] Failed to delete room state ${roomId}:`, err.message);
        }
    }
}

function deleteRoomFiles(roomId) {
    const buildsDir = path.join(__dirname, 'tmp_builds', roomId);
    if (fs.existsSync(buildsDir)) {
        try {
            fs.rmSync(buildsDir, { recursive: true, force: true });
        } catch (err) {
            logger.warn(`[PERSIST] Failed to delete room files ${roomId}:`, err.message);
        }
    }
}

module.exports = {
    saveRoomState,
    loadRoomState,
    deleteRoomState,
    deleteRoomFiles,
};
