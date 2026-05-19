/**
 * Question Database Seeder
 * Fetches thousands of questions from Codeforces and stores them in database
 * 
 * Usage: node server/seedQuestions.js
 */

const { CachedCodeforcesAPI } = require('./codeforcesAPI');
const fs = require('fs').promises;
const path = require('path');

const codeforcesAPI = new CachedCodeforcesAPI();

// In-memory storage (you can replace this with MongoDB/PostgreSQL)
const questionsDB = {
    questions: [],
    metadata: {
        totalQuestions: 0,
        lastUpdated: null,
        sources: {
            codeforces: 0
        }
    }
};

/**
 * Fetch and store all Codeforces problems
 */
async function seedCodeforcesQuestions() {
    console.log('\n🚀 Starting Codeforces question seeding...\n');
    
    try {
        // Fetch all problems from Codeforces
        console.log('[SEED] Fetching all Codeforces problems...');
        const allProblems = await codeforcesAPI.getAllProblems();
        console.log(`[SEED] ✅ Fetched ${allProblems.length} problems from Codeforces\n`);

        // Filter valid programming problems
        const validProblems = allProblems.filter(p => 
            p.type === 'PROGRAMMING' && 
            p.rating && 
            p.contestId && 
            p.index
        );
        console.log(`[SEED] ✅ Filtered to ${validProblems.length} valid programming problems\n`);

        // Convert problems in batches to avoid memory issues
        const batchSize = 100;
        let converted = 0;
        let failed = 0;

        for (let i = 0; i < validProblems.length; i += batchSize) {
            const batch = validProblems.slice(i, i + batchSize);
            console.log(`[SEED] Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validProblems.length / batchSize)}...`);

            for (const problem of batch) {
                try {
                    const convertedProblem = await codeforcesAPI.convertToOurFormat(problem);
                    if (convertedProblem) {
                        questionsDB.questions.push(convertedProblem);
                        converted++;
                    } else {
                        failed++;
                    }
                } catch (error) {
                    console.error(`[SEED] ❌ Failed to convert ${problem.name}:`, error.message);
                    failed++;
                }
            }

            // Progress update
            console.log(`[SEED] Progress: ${converted} converted, ${failed} failed\n`);
        }

        // Update metadata
        questionsDB.metadata.totalQuestions = questionsDB.questions.length;
        questionsDB.metadata.lastUpdated = new Date().toISOString();
        questionsDB.metadata.sources.codeforces = questionsDB.questions.length;

        console.log('\n✅ Seeding complete!');
        console.log(`📊 Total questions stored: ${questionsDB.metadata.totalQuestions}`);
        console.log(`📅 Last updated: ${questionsDB.metadata.lastUpdated}\n`);

        // Save to JSON file
        await saveToFile();

        return questionsDB;
    } catch (error) {
        console.error('[SEED] ❌ Fatal error during seeding:', error);
        throw error;
    }
}

/**
 * Save questions to JSON file
 */
async function saveToFile() {
    const filePath = path.join(__dirname, 'questionsDB.json');
    
    try {
        console.log('[SEED] 💾 Saving questions to file...');
        await fs.writeFile(
            filePath, 
            JSON.stringify(questionsDB, null, 2),
            'utf8'
        );
        console.log(`[SEED] ✅ Saved to ${filePath}`);
        
        // Also save a compressed version
        const compressedPath = path.join(__dirname, 'questionsDB.min.json');
        await fs.writeFile(
            compressedPath,
            JSON.stringify(questionsDB),
            'utf8'
        );
        console.log(`[SEED] ✅ Saved compressed version to ${compressedPath}`);
    } catch (error) {
        console.error('[SEED] ❌ Failed to save to file:', error);
        throw error;
    }
}

/**
 * Load questions from file
 */
async function loadFromFile() {
    const filePath = path.join(__dirname, 'questionsDB.json');
    
    try {
        const data = await fs.readFile(filePath, 'utf8');
        const loaded = JSON.parse(data);
        console.log(`[SEED] ✅ Loaded ${loaded.metadata.totalQuestions} questions from file`);
        return loaded;
    } catch (error) {
        console.log('[SEED] ℹ️  No existing questions file found');
        return null;
    }
}

/**
 * Get questions by filters
 */
function getQuestions(filters = {}) {
    let filtered = [...questionsDB.questions];

    // Filter by difficulty
    if (filters.difficulty) {
        filtered = filtered.filter(q => q.difficulty === filters.difficulty);
    }

    // Filter by category
    if (filters.category) {
        filtered = filtered.filter(q => q.category === filters.category);
    }

    // Filter by rating range
    if (filters.minRating || filters.maxRating) {
        filtered = filtered.filter(q => {
            const rating = q.rating || 0;
            const min = filters.minRating || 0;
            const max = filters.maxRating || 9999;
            return rating >= min && rating <= max;
        });
    }

    // Filter by tags
    if (filters.tags && filters.tags.length > 0) {
        filtered = filtered.filter(q => {
            if (!q.tags) return false;
            return filters.tags.some(tag => q.tags.includes(tag));
        });
    }

    // Pagination
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return {
        questions: filtered.slice(startIndex, endIndex),
        total: filtered.length,
        page: page,
        totalPages: Math.ceil(filtered.length / limit)
    };
}

/**
 * Get random questions
 */
function getRandomQuestions(count = 10, filters = {}) {
    const { questions } = getQuestions({ ...filters, limit: 9999 });
    const shuffled = questions.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Get question by ID
 */
function getQuestionById(id) {
    return questionsDB.questions.find(q => q.id === id);
}

/**
 * Get statistics
 */
function getStatistics() {
    const stats = {
        total: questionsDB.questions.length,
        byDifficulty: {
            easy: 0,
            medium: 0,
            hard: 0
        },
        byCategory: {},
        byRating: {
            '800-1200': 0,
            '1200-1600': 0,
            '1600-2000': 0,
            '2000+': 0
        },
        lastUpdated: questionsDB.metadata.lastUpdated
    };

    questionsDB.questions.forEach(q => {
        // Count by difficulty
        if (q.difficulty) {
            stats.byDifficulty[q.difficulty]++;
        }

        // Count by category
        if (q.category) {
            stats.byCategory[q.category] = (stats.byCategory[q.category] || 0) + 1;
        }

        // Count by rating
        const rating = q.rating || 0;
        if (rating < 1200) stats.byRating['800-1200']++;
        else if (rating < 1600) stats.byRating['1200-1600']++;
        else if (rating < 2000) stats.byRating['1600-2000']++;
        else stats.byRating['2000+']++;
    });

    return stats;
}

// Run seeding if executed directly
if (require.main === module) {
    console.log('╔════════════════════════════════════════╗');
    console.log('║   BrightCode Question Database Seeder  ║');
    console.log('╚════════════════════════════════════════╝\n');

    seedCodeforcesQuestions()
        .then(() => {
            console.log('\n✨ Seeding completed successfully!');
            console.log('\n📊 Statistics:');
            console.log(JSON.stringify(getStatistics(), null, 2));
            process.exit(0);
        })
        .catch(error => {
            console.error('\n❌ Seeding failed:', error);
            process.exit(1);
        });
}

module.exports = {
    seedCodeforcesQuestions,
    loadFromFile,
    getQuestions,
    getRandomQuestions,
    getQuestionById,
    getStatistics,
    questionsDB
};
