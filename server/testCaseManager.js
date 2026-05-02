/**
 * Enterprise-Grade Test Case Management System
 * Handles thousands of test cases with LeetCode/Codeforces-style architecture
 */

const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class TestCaseManager {
    constructor(options = {}) {
        this.baseDir = options.baseDir || path.join(__dirname, 'test_cases');
        this.metadataFile = path.join(this.baseDir, 'metadata.json');
        this.cache = new Map(); // problemId -> { metadata, testCases }
        this.cacheSize = options.cacheSize || 100; // Max problems in cache
        
        // Test case categories
        this.CATEGORIES = {
            SAMPLE: 'sample',      // Show to user, visible input/output
            HIDDEN: 'hidden',      // Hidden from user, used for grading
            EDGE: 'edge',          // Edge cases (empty, single, max)
            STRESS: 'stress',      // Large inputs for performance
            RANDOM: 'random'       // Randomized test cases
        };

        this.initializeStorage();
    }

    async initializeStorage() {
        // Create directory structure
        await fs.mkdir(this.baseDir, { recursive: true });
        
        // Create category subdirectories
        for (const category of Object.values(this.CATEGORIES)) {
            await fs.mkdir(path.join(this.baseDir, category), { recursive: true });
        }

        // Load metadata
        try {
            const metadata = await fs.readFile(this.metadataFile, 'utf8');
            this.metadata = JSON.parse(metadata);
        } catch {
            this.metadata = {
                problems: {},
                totalTestCases: 0,
                lastUpdated: null
            };
        }

        console.log('[TC-Manager] 📦 Test Case Manager initialized');
        console.log(`[TC-Manager] 📊 ${Object.keys(this.metadata.problems).length} problems in library`);
    }

    async saveMetadata() {
        this.metadata.lastUpdated = new Date().toISOString();
        await fs.writeFile(this.metadataFile, JSON.stringify(this.metadata, null, 2));
    }

    /**
     * Generate a unique problem ID hash
     */
    generateProblemId(problem) {
        const content = `${problem.title}-${problem.description?.substring(0, 100) || ''}`;
        return crypto.createHash('md5').update(content).digest('hex').substring(0, 12);
    }

    /**
     * Store test cases for a problem
     * @param {Object} problem - Problem object
     * @param {Array} testCases - Array of test cases
     * @param {String} category - Test case category
     */
    async storeTestCases(problem, testCases, category = this.CATEGORIES.HIDDEN) {
        const problemId = problem.id || this.generateProblemId(problem);
        const categoryDir = path.join(this.baseDir, category);
        const testCaseFile = path.join(categoryDir, `${problemId}.json`);

        // Enhance test cases with metadata
        const enhancedTestCases = testCases.map((tc, index) => ({
            id: `${problemId}_${category}_${index}`,
            input: tc.input,
            expected: tc.expected,
            difficulty: this.estimateTestCaseDifficulty(tc),
            size: this.calculateTestCaseSize(tc),
            createdAt: new Date().toISOString()
        }));

        // Store test cases
        await fs.writeFile(testCaseFile, JSON.stringify(enhancedTestCases, null, 2));

        // Update metadata
        if (!this.metadata.problems[problemId]) {
            this.metadata.problems[problemId] = {
                title: problem.title,
                categories: {},
                totalTestCases: 0
            };
        }

        this.metadata.problems[problemId].categories[category] = {
            count: enhancedTestCases.length,
            file: `${category}/${problemId}.json`,
            lastUpdated: new Date().toISOString()
        };

        this.metadata.problems[problemId].totalTestCases += enhancedTestCases.length;
        this.metadata.totalTestCases += enhancedTestCases.length;

        await this.saveMetadata();

        // Cache it
        this.addToCache(problemId, {
            metadata: this.metadata.problems[problemId],
            testCases: { [category]: enhancedTestCases }
        });

        console.log(`[TC-Manager] 💾 Stored ${enhancedTestCases.length} ${category} test cases for ${problem.title}`);
        return problemId;
    }

    /**
     * Get test cases for a problem (lazy loading)
     * @param {String} problemId - Problem ID
     * @param {Array} categories - Categories to load (defaults to all)
     * @param {Object} options - Loading options
     */
    async getTestCases(problemId, categories = null, options = {}) {
        const { 
            loadSampleOnly = false, 
            maxTestCases = null,
            randomize = false 
        } = options;

        // Check cache first
        if (this.cache.has(problemId)) {
            const cached = this.cache.get(problemId);
            return this.filterTestCases(cached.testCases, categories, { loadSampleOnly, maxTestCases, randomize });
        }

        // Check metadata
        if (!this.metadata.problems[problemId]) {
            return null;
        }

        const problemMeta = this.metadata.problems[problemId];
        const testCases = {};

        // Determine which categories to load
        const targetCategories = categories || Object.keys(problemMeta.categories);
        const categoriesToLoad = loadSampleOnly 
            ? targetCategories.filter(c => c === this.CATEGORIES.SAMPLE)
            : targetCategories;

        // Load each category
        for (const category of categoriesToLoad) {
            if (problemMeta.categories[category]) {
                const filePath = path.join(this.baseDir, problemMeta.categories[category].file);
                try {
                    const data = await fs.readFile(filePath, 'utf8');
                    testCases[category] = JSON.parse(data);
                } catch (error) {
                    console.warn(`[TC-Manager] ⚠️ Failed to load ${category} test cases for ${problemId}`);
                }
            }
        }

        // Cache the result
        this.addToCache(problemId, {
            metadata: problemMeta,
            testCases
        });

        return this.filterTestCases(testCases, categories, { loadSampleOnly, maxTestCases, randomize });
    }

    /**
     * Filter and flatten test cases
     */
    filterTestCases(testCasesByCategory, categories, options) {
        const { maxTestCases, randomize } = options;
        
        let flattened = [];
        const targetCategories = categories || Object.keys(testCasesByCategory);

        for (const category of targetCategories) {
            if (testCasesByCategory[category]) {
                flattened = flattened.concat(
                    testCasesByCategory[category].map(tc => ({ ...tc, category }))
                );
            }
        }

        // Randomize if requested
        if (randomize) {
            flattened = this.shuffleArray(flattened);
        }

        // Limit if requested
        if (maxTestCases && flattened.length > maxTestCases) {
            flattened = flattened.slice(0, maxTestCases);
        }

        return flattened;
    }

    /**
     * Get all test cases as a flat array (for submission testing)
     */
    async getAllTestCasesForSubmission(problemId) {
        const testCases = await this.getTestCases(problemId);
        return testCases || [];
    }

    /**
     * Get sample test cases only (for user preview)
     */
    async getSampleTestCases(problemId) {
        return await this.getTestCases(problemId, [this.CATEGORIES.SAMPLE]);
    }

    /**
     * Estimate test case difficulty
     */
    estimateTestCaseDifficulty(testCase) {
        const input = JSON.stringify(testCase.input);
        const size = input.length;
        
        if (size < 50) return 'easy';
        if (size < 200) return 'medium';
        if (size < 1000) return 'hard';
        return 'extreme';
    }

    /**
     * Calculate test case size in bytes
     */
    calculateTestCaseSize(testCase) {
        return Buffer.from(JSON.stringify(testCase)).length;
    }

    /**
     * Add to cache with LRU eviction
     */
    addToCache(problemId, data) {
        if (this.cache.size >= this.cacheSize) {
            // Remove oldest entry
            const oldestKey = this.cache.keys().next().value;
            this.cache.delete(oldestKey);
        }
        this.cache.set(problemId, data);
    }

    /**
     * Shuffle array (Fisher-Yates)
     */
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    /**
     * Validate test case format
     */
    validateTestCase(testCase) {
        const errors = [];
        
        if (!testCase.input) {
            errors.push('Missing input field');
        }
        
        if (!testCase.expected && testCase.expected !== '' && testCase.expected !== 0) {
            errors.push('Missing expected field');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }

    /**
     * Get statistics
     */
    getStats() {
        const problemCount = Object.keys(this.metadata.problems).length;
        const categoryStats = {};
        
        for (const cat of Object.values(this.CATEGORIES)) {
            categoryStats[cat] = 0;
        }
        
        for (const problem of Object.values(this.metadata.problems)) {
            for (const [cat, data] of Object.entries(problem.categories)) {
                categoryStats[cat] += data.count;
            }
        }
        
        return {
            problems: problemCount,
            totalTestCases: this.metadata.totalTestCases,
            byCategory: categoryStats,
            lastUpdated: this.metadata.lastUpdated
        };
    }

    /**
     * Export test cases for backup
     */
    async exportTestCases(problemId) {
        if (!this.metadata.problems[problemId]) {
            return null;
        }

        const allTestCases = await this.getTestCases(problemId);
        return {
            problemId,
            metadata: this.metadata.problems[problemId],
            testCases: allTestCases,
            exportedAt: new Date().toISOString()
        };
    }

    /**
     * Import test cases from export
     */
    async importTestCases(exportData) {
        const { problemId, metadata, testCases } = exportData;
        
        // Group by category
        const byCategory = {};
        for (const tc of testCases) {
            const cat = tc.category || this.CATEGORIES.HIDDEN;
            if (!byCategory[cat]) byCategory[cat] = [];
            byCategory[cat].push(tc);
        }

        // Store each category
        for (const [category, tcs] of Object.entries(byCategory)) {
            await this.storeTestCases(
                { id: problemId, title: metadata.title },
                tcs,
                category
            );
        }

        console.log(`[TC-Manager] 📥 Imported ${testCases.length} test cases for ${metadata.title}`);
    }

    /**
     * Clear cache
     */
    clearCache() {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`[TC-Manager] 🧹 Cache cleared (${size} entries)`);
    }
}

// Singleton instance
let instance = null;

function getTestCaseManager(options = {}) {
    if (!instance) {
        instance = new TestCaseManager(options);
    }
    return instance;
}

module.exports = { TestCaseManager, getTestCaseManager };
