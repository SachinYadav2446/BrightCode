/**
 * Library Codex API Routes
 * Serves technical MCQs for Node.js, Express, MongoDB, SQL, and General Database Systems
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const DB_PATH = path.join(__dirname, 'libraryQuestionsDB.json');

// Helper to load questions from database file
function loadQuestions() {
    try {
        if (!fs.existsSync(DB_PATH)) {
            logger.warn('[LIBRARY API] libraryQuestionsDB.json does not exist. Creating default.');
            return {};
        }
        const data = fs.readFileSync(DB_PATH, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        logger.error('[LIBRARY API] Error reading library questions database:', error);
        return {};
    }
}

/**
 * GET /api/library/questions
 * Get all library questions grouped by module
 */
router.get('/questions', (req, res) => {
    try {
        const questions = loadQuestions();
        res.json({
            success: true,
            data: questions
        });
    } catch (error) {
        logger.error('[LIBRARY API] Failed to fetch questions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch library questions'
        });
    }
});

/**
 * GET /api/library/questions/:module
 * Get questions for a specific learning module (e.g. nodejs, express, mongodb, sql, database)
 */
router.get('/questions/:module', (req, res) => {
    try {
        const { module } = req.params;
        const questions = loadQuestions();
        
        if (!questions[module]) {
            return res.status(404).json({
                success: false,
                error: `Module '${module}' not found. Available modules: nodejs, express, mongodb, sql, database`
            });
        }

        res.json({
            success: true,
            module: module,
            count: questions[module].length,
            data: questions[module]
        });
    } catch (error) {
        logger.error(`[LIBRARY API] Failed to fetch questions for module ${req.params.module}:`, error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch module questions'
        });
    }
});

module.exports = router;
