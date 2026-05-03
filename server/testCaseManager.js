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
     * Generate comprehensive test case distribution for a problem
     * Returns a balanced set of test cases across all categories
     */
    async generateTestCaseDistribution(problem, aiGenerator) {
        const problemId = problem.id || this.generateProblemId(problem);
        
        // Define distribution
        const distribution = {
            [this.CATEGORIES.SAMPLE]: { count: 3, weight: 20 },    // 20% of score
            [this.CATEGORIES.HIDDEN]: { count: 4, weight: 40 },    // 40% of score
            [this.CATEGORIES.EDGE]: { count: 3, weight: 20 },      // 20% of score
            [this.CATEGORIES.STRESS]: { count: 3, weight: 15 },    // 15% of score
            [this.CATEGORIES.RANDOM]: { count: 2, weight: 5 }      // 5% of score
        };
        
        const totalCases = Object.values(distribution).reduce((sum, d) => sum + d.count, 0);
        console.log(`[TC-Manager] 🎯 Generating ${totalCases} test cases for ${problem.title}`);
        
        // Generate test cases for each category
        for (const [category, config] of Object.entries(distribution)) {
            try {
                const testCases = await aiGenerator.generateTestCases(problem, {
                    count: config.count,
                    category: category,
                    difficulty: problem.difficulty
                });
                
                if (testCases && testCases.length > 0) {
                    await this.storeTestCases(problem, testCases, category);
                }
            } catch (error) {
                console.error(`[TC-Manager] ❌ Failed to generate ${category} test cases:`, error.message);
            }
        }
        
        return {
            problemId,
            distribution,
            totalCases
        };
    }
    
    /**
     * Get test cases with scoring weights
     */
    async getTestCasesWithWeights(problemId) {
        const allTestCases = await this.getTestCases(problemId);
        
        if (!allTestCases || allTestCases.length === 0) {
            return null;
        }
        
        // Add weight to each test case based on category
        const weights = {
            [this.CATEGORIES.SAMPLE]: 20,
            [this.CATEGORIES.HIDDEN]: 40,
            [this.CATEGORIES.EDGE]: 20,
            [this.CATEGORIES.STRESS]: 15,
            [this.CATEGORIES.RANDOM]: 5
        };
        
        const testCasesWithWeights = allTestCases.map(tc => ({
            ...tc,
            weight: weights[tc.category] || 0,
            categoryName: this.getCategoryDisplayName(tc.category)
        }));
        
        return testCasesWithWeights;
    }
    
    /**
     * Calculate score based on passed test cases
     */
    calculateScore(testResults) {
        let totalWeight = 0;
        let earnedWeight = 0;
        let passedByCategory = {};
        let totalByCategory = {};
        
        for (const result of testResults) {
            const category = result.category;
            const weight = result.weight || 0;
            
            totalWeight += weight;
            
            if (!totalByCategory[category]) {
                totalByCategory[category] = 0;
                passedByCategory[category] = 0;
            }
            
            totalByCategory[category]++;
            
            if (result.passed) {
                earnedWeight += weight;
                passedByCategory[category]++;
            }
        }
        
        const totalCases = testResults.length;
        const passedCases = testResults.filter(r => r.passed).length;
        const scorePercentage = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
        
        return {
            score: scorePercentage,
            passed: passedCases,
            total: totalCases,
            passedByCategory,
            totalByCategory,
            allPassed: passedCases === totalCases
        };
    }
    
    /**
     * Get display name for category
     */
    getCategoryDisplayName(category) {
        const names = {
            [this.CATEGORIES.SAMPLE]: 'Sample Cases',
            [this.CATEGORIES.HIDDEN]: 'Hidden Cases',
            [this.CATEGORIES.EDGE]: 'Edge Cases',
            [this.CATEGORIES.STRESS]: 'Stress Tests',
            [this.CATEGORIES.RANDOM]: 'Random Tests'
        };
        return names[category] || category;
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
