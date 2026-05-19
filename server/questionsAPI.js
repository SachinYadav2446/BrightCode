/**
 * Questions API Routes
 * Serves thousands of questions from database with filtering, pagination, and search
 */

const express = require('express');
const router = express.Router();
const { 
    loadFromFile, 
    getQuestions, 
    getRandomQuestions, 
    getQuestionById, 
    getStatistics,
    questionsDB 
} = require('./seedQuestions');

// Load questions on startup
let questionsLoaded = false;

async function ensureQuestionsLoaded() {
    if (!questionsLoaded) {
        console.log('[QUESTIONS API] Loading questions from database...');
        const loaded = await loadFromFile();
        if (loaded) {
            Object.assign(questionsDB, loaded);
            questionsLoaded = true;
            console.log(`[QUESTIONS API] ✅ Loaded ${questionsDB.metadata.totalQuestions} questions`);
        } else {
            console.log('[QUESTIONS API] ⚠️  No questions found. Run: node server/seedQuestions.js');
        }
    }
}

// Middleware to ensure questions are loaded
router.use(async (req, res, next) => {
    await ensureQuestionsLoaded();
    next();
});

/**
 * GET /api/questions
 * Get questions with filtering and pagination
 * 
 * Query params:
 * - difficulty: easy, medium, hard
 * - category: algorithms, data_structures, etc.
 * - minRating: minimum Codeforces rating
 * - maxRating: maximum Codeforces rating
 * - tags: comma-separated tags (dp,greedy,math)
 * - page: page number (default: 1)
 * - limit: items per page (default: 20)
 */
router.get('/', (req, res) => {
    try {
        const filters = {
            difficulty: req.query.difficulty,
            category: req.query.category,
            minRating: req.query.minRating ? parseInt(req.query.minRating) : undefined,
            maxRating: req.query.maxRating ? parseInt(req.query.maxRating) : undefined,
            tags: req.query.tags ? req.query.tags.split(',') : undefined,
            page: req.query.page ? parseInt(req.query.page) : 1,
            limit: req.query.limit ? parseInt(req.query.limit) : 20
        };

        const result = getQuestions(filters);
        
        res.json({
            success: true,
            data: result.questions,
            pagination: {
                page: result.page,
                limit: filters.limit,
                total: result.total,
                totalPages: result.totalPages
            }
        });
    } catch (error) {
        console.error('[QUESTIONS API] Error fetching questions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch questions'
        });
    }
});

/**
 * GET /api/questions/random
 * Get random questions
 * 
 * Query params:
 * - count: number of questions (default: 10)
 * - difficulty: easy, medium, hard
 * - category: algorithms, data_structures, etc.
 * - minRating: minimum rating
 * - maxRating: maximum rating
 * - tags: comma-separated tags
 */
router.get('/random', (req, res) => {
    try {
        const count = req.query.count ? parseInt(req.query.count) : 10;
        const filters = {
            difficulty: req.query.difficulty,
            category: req.query.category,
            minRating: req.query.minRating ? parseInt(req.query.minRating) : undefined,
            maxRating: req.query.maxRating ? parseInt(req.query.maxRating) : undefined,
            tags: req.query.tags ? req.query.tags.split(',') : undefined
        };

        const questions = getRandomQuestions(count, filters);
        
        res.json({
            success: true,
            data: questions,
            count: questions.length
        });
    } catch (error) {
        console.error('[QUESTIONS API] Error fetching random questions:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch random questions'
        });
    }
});

/**
 * GET /api/questions/stats
 * Get question statistics
 */
router.get('/stats', (req, res) => {
    try {
        const stats = getStatistics();
        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('[QUESTIONS API] Error fetching statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch statistics'
        });
    }
});

/**
 * GET /api/questions/:id
 * Get single question by ID
 */
router.get('/:id', (req, res) => {
    try {
        const question = getQuestionById(req.params.id);
        
        if (!question) {
            return res.status(404).json({
                success: false,
                error: 'Question not found'
            });
        }

        res.json({
            success: true,
            data: question
        });
    } catch (error) {
        console.error('[QUESTIONS API] Error fetching question:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch question'
        });
    }
});

/**
 * GET /api/questions/tags/list
 * Get all available tags
 */
router.get('/tags/list', (req, res) => {
    try {
        const tags = new Set();
        questionsDB.questions.forEach(q => {
            if (q.tags) {
                q.tags.forEach(tag => tags.add(tag));
            }
        });

        res.json({
            success: true,
            data: Array.from(tags).sort()
        });
    } catch (error) {
        console.error('[QUESTIONS API] Error fetching tags:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch tags'
        });
    }
});

/**
 * GET /api/questions/categories/list
 * Get all available categories
 */
router.get('/categories/list', (req, res) => {
    try {
        const categories = new Set();
        questionsDB.questions.forEach(q => {
            if (q.category) {
                categories.add(q.category);
            }
        });

        res.json({
            success: true,
            data: Array.from(categories).sort()
        });
    } catch (error) {
        console.error('[QUESTIONS API] Error fetching categories:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch categories'
        });
    }
});

module.exports = router;
