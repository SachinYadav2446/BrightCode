/**
 * Codeforces API Integration
 * Official API: https://codeforces.com/apiHelp
 * 
 * Features:
 * - 8000+ problems
 * - Multiple difficulty levels (800-3500 rating)
 * - Tags (dp, greedy, math, etc.)
 * - Test cases available
 * - No authentication required
 */

const axios = require('axios');

class CodeforcesAPI {
    constructor() {
        this.baseURL = 'https://codeforces.com/api';
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Get all problems from Codeforces
     * @returns {Promise<Array>} - Array of problems
     */
    async getAllProblems() {
        const cacheKey = 'all_problems';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            console.log('[CODEFORCES] Using cached problems');
            return cached.data;
        }

        try {
            console.log('[CODEFORCES] Fetching all problems...');
            const response = await axios.get(`${this.baseURL}/problemset.problems`);
            
            if (response.data.status !== 'OK') {
                throw new Error('Codeforces API returned error status');
            }

            const problems = response.data.result.problems;
            console.log(`[CODEFORCES] Fetched ${problems.length} problems`);

            this.cache.set(cacheKey, {
                data: problems,
                timestamp: Date.now()
            });

            return problems;
        } catch (error) {
            console.error('[CODEFORCES] Error fetching problems:', error.message);
            return [];
        }
    }

    /**
     * Get problems by difficulty rating
     * @param {number} minRating - Minimum rating (800-3500)
     * @param {number} maxRating - Maximum rating
     * @param {number} limit - Number of problems to return
     * @returns {Promise<Array>} - Filtered problems
     */
    async getProblemsByRating(minRating = 800, maxRating = 1600, limit = 50) {
        const allProblems = await this.getAllProblems();
        
        const filtered = allProblems.filter(p => 
            p.rating >= minRating && 
            p.rating <= maxRating &&
            p.type === 'PROGRAMMING' // Only programming problems
        );

        // Shuffle and limit
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
    }

    /**
     * Get problems by tags
     * @param {Array<string>} tags - Tags to filter by (e.g., ['dp', 'greedy'])
     * @param {number} limit - Number of problems
     * @returns {Promise<Array>} - Filtered problems
     */
    async getProblemsByTags(tags, limit = 50) {
        const allProblems = await this.getAllProblems();
        
        const filtered = allProblems.filter(p => {
            if (!p.tags || p.tags.length === 0) return false;
            return tags.some(tag => p.tags.includes(tag));
        });

        const shuffled = filtered.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
    }

    /**
     * Convert Codeforces problem to our format
     * @param {Object} cfProblem - Codeforces problem object
     * @returns {Promise<Object>} - Converted problem
     */
    async convertToOurFormat(cfProblem) {
        try {
            // Fetch problem statement from Codeforces website
            const problemUrl = `https://codeforces.com/problemset/problem/${cfProblem.contestId}/${cfProblem.index}`;
            
            console.log(`[CODEFORCES] Converting problem: ${cfProblem.name}`);

            // Map Codeforces rating to our difficulty
            const difficulty = this.mapRatingToDifficulty(cfProblem.rating);
            
            // Generate test cases from problem examples
            const testCases = await this.generateTestCases(cfProblem);

            return {
                id: `cf_${cfProblem.contestId}_${cfProblem.index}`,
                title: cfProblem.name,
                difficulty: difficulty,
                category: this.mapTagsToCategory(cfProblem.tags),
                timeLimit: 300, // 5 minutes default
                points: this.getPoints(difficulty),
                description: this.formatDescription(cfProblem),
                problemUrl: problemUrl,
                tags: cfProblem.tags || [],
                rating: cfProblem.rating,
                testCases: testCases,
                starterCode: this.generateStarterCode(cfProblem),
                source: 'codeforces',
                contestId: cfProblem.contestId,
                index: cfProblem.index
            };
        } catch (error) {
            console.error(`[CODEFORCES] Error converting problem ${cfProblem.name}:`, error.message);
            return null;
        }
    }

    /**
     * Map Codeforces rating to difficulty
     */
    mapRatingToDifficulty(rating) {
        if (!rating) return 'medium';
        if (rating <= 1200) return 'easy';
        if (rating <= 1800) return 'medium';
        return 'hard';
    }

    /**
     * Map tags to category
     */
    mapTagsToCategory(tags) {
        if (!tags || tags.length === 0) return 'algorithms';
        
        const tagMap = {
            'dp': 'dynamic_programming',
            'greedy': 'algorithms',
            'math': 'math',
            'implementation': 'algorithms',
            'data structures': 'data_structures',
            'graphs': 'graphs',
            'trees': 'data_structures',
            'strings': 'strings',
            'sortings': 'algorithms',
            'binary search': 'algorithms'
        };

        for (const tag of tags) {
            if (tagMap[tag]) return tagMap[tag];
        }
        
        return 'algorithms';
    }

    /**
     * Get points based on difficulty
     */
    getPoints(difficulty) {
        const pointMap = {
            'easy': 100,
            'medium': 200,
            'hard': 400
        };
        return pointMap[difficulty] || 100;
    }

    /**
     * Format problem description
     */
    formatDescription(cfProblem) {
        let description = `# ${cfProblem.name}\n\n`;
        description += `**Difficulty:** ${this.mapRatingToDifficulty(cfProblem.rating)}\n`;
        description += `**Rating:** ${cfProblem.rating || 'N/A'}\n`;
        description += `**Tags:** ${cfProblem.tags ? cfProblem.tags.join(', ') : 'None'}\n\n`;
        description += `**Problem Link:** [View on Codeforces](https://codeforces.com/problemset/problem/${cfProblem.contestId}/${cfProblem.index})\n\n`;
        description += `## Problem Statement\n\n`;
        description += `This is a Codeforces problem. Please visit the problem link above to read the full problem statement, input/output format, and examples.\n\n`;
        description += `**Note:** Solve this problem using Java. Write a complete solution that reads from standard input and writes to standard output.`;
        
        return description;
    }

    /**
     * Generate test cases (basic implementation)
     * Note: Codeforces doesn't provide test cases via API
     * We'll need to scrape or use sample inputs
     */
    async generateTestCases(cfProblem) {
        // For now, return empty array
        // In production, you'd scrape the problem page or use sample inputs
        console.log(`[CODEFORCES] Test cases need to be scraped from problem page`);
        
        // Return basic test case structure
        return [
            {
                input: ['Sample input (visit problem page)'],
                expected: 'Sample output (visit problem page)'
            }
        ];
    }

    /**
     * Generate starter code for Java
     */
    generateStarterCode(cfProblem) {
        return `import java.util.*;
import java.io.*;

public class Solution {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        
        // Read input
        // String line = br.readLine();
        
        // Solve the problem
        
        // Print output
        // System.out.println(result);
    }
}`;
    }

    /**
     * Get random problems for a contest
     * @param {string} difficulty - easy, medium, or hard
     * @param {number} count - Number of problems
     * @returns {Promise<Array>} - Array of converted problems
     */
    async getRandomProblems(difficulty, count = 5) {
        const ratingMap = {
            'easy': { min: 800, max: 1200 },
            'medium': { min: 1200, max: 1800 },
            'hard': { min: 1800, max: 2500 }
        };

        const range = ratingMap[difficulty] || ratingMap['medium'];
        const problems = await this.getProblemsByRating(range.min, range.max, count * 3);

        // Convert to our format
        const converted = [];
        for (const problem of problems.slice(0, count)) {
            const convertedProblem = await this.convertToOurFormat(problem);
            if (convertedProblem) {
                converted.push(convertedProblem);
            }
        }

        console.log(`[CODEFORCES] Converted ${converted.length} problems`);
        return converted;
    }
}

// Cached version
class CachedCodeforcesAPI extends CodeforcesAPI {
    constructor() {
        super();
        this.problemCache = new Map();
    }

    async getCachedProblem(contestId, index) {
        const key = `${contestId}_${index}`;
        const cached = this.problemCache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        const allProblems = await this.getAllProblems();
        const problem = allProblems.find(p => 
            p.contestId === contestId && p.index === index
        );

        if (problem) {
            const converted = await this.convertToOurFormat(problem);
            this.problemCache.set(key, {
                data: converted,
                timestamp: Date.now()
            });
            return converted;
        }

        return null;
    }
}

module.exports = { CodeforcesAPI, CachedCodeforcesAPI };
