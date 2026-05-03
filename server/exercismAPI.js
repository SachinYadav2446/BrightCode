/**
 * Exercism API Integration
 * Official API: https://exercism.org/docs/using/api
 * 
 * Features:
 * - 3000+ exercises across 60+ languages
 * - Complete test suites
 * - Mentorship and learning tracks
 * - Open source and free
 * - Well-structured problems
 */

const axios = require('axios');

class ExercismAPI {
    constructor() {
        this.baseURL = 'https://exercism.org/api/v2';
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    }

    /**
     * Get all exercises for Java track
     * @returns {Promise<Array>} - Array of exercises
     */
    async getJavaExercises() {
        const cacheKey = 'java_exercises';
        const cached = this.cache.get(cacheKey);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            console.log('[EXERCISM] Using cached exercises');
            return cached.data;
        }

        try {
            console.log('[EXERCISM] Fetching Java exercises...');
            const response = await axios.get(`${this.baseURL}/tracks/java/exercises`);
            
            const exercises = response.data.exercises;
            console.log(`[EXERCISM] Fetched ${exercises.length} Java exercises`);

            this.cache.set(cacheKey, {
                data: exercises,
                timestamp: Date.now()
            });

            return exercises;
        } catch (error) {
            console.error('[EXERCISM] Error fetching exercises:', error.message);
            return [];
        }
    }

    /**
     * Get exercise details
     * @param {string} slug - Exercise slug (e.g., 'two-fer')
     * @returns {Promise<Object>} - Exercise details
     */
    async getExerciseDetails(slug) {
        try {
            console.log(`[EXERCISM] Fetching exercise details: ${slug}`);
            const response = await axios.get(`${this.baseURL}/tracks/java/exercises/${slug}`);
            return response.data.exercise;
        } catch (error) {
            console.error(`[EXERCISM] Error fetching ${slug}:`, error.message);
            return null;
        }
    }

    /**
     * Get exercises by difficulty
     * @param {string} difficulty - easy, medium, hard
     * @param {number} limit - Number of exercises
     * @returns {Promise<Array>} - Filtered exercises
     */
    async getExercisesByDifficulty(difficulty, limit = 10) {
        const allExercises = await this.getJavaExercises();
        
        // Exercism uses difficulty levels 1-10
        const difficultyMap = {
            'easy': { min: 1, max: 3 },
            'medium': { min: 4, max: 7 },
            'hard': { min: 8, max: 10 }
        };

        const range = difficultyMap[difficulty] || difficultyMap['medium'];
        
        const filtered = allExercises.filter(ex => 
            ex.difficulty >= range.min && ex.difficulty <= range.max
        );

        // Shuffle and limit
        const shuffled = filtered.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, limit);
    }

    /**
     * Convert Exercism exercise to our format
     * @param {Object} exercise - Exercism exercise object
     * @returns {Promise<Object>} - Converted exercise
     */
    async convertToOurFormat(exercise) {
        try {
            console.log(`[EXERCISM] Converting exercise: ${exercise.title}`);

            // Get full details
            const details = await this.getExerciseDetails(exercise.slug);
            
            if (!details) {
                console.warn(`[EXERCISM] Could not fetch details for ${exercise.slug}`);
                return null;
            }

            // Map Exercism difficulty to our format
            const difficulty = this.mapDifficulty(exercise.difficulty);

            return {
                id: `ex_${exercise.slug}`,
                title: exercise.title,
                difficulty: difficulty,
                category: this.mapTopicsToCategory(exercise.topics || []),
                timeLimit: 600, // 10 minutes default
                points: this.getPoints(difficulty),
                description: this.formatDescription(details),
                blurb: exercise.blurb,
                topics: exercise.topics || [],
                testCases: this.parseTestCases(details),
                starterCode: this.getStarterCode(details),
                source: 'exercism',
                slug: exercise.slug,
                exercismUrl: `https://exercism.org/tracks/java/exercises/${exercise.slug}`,
                hints: this.extractHints(details)
            };
        } catch (error) {
            console.error(`[EXERCISM] Error converting ${exercise.title}:`, error.message);
            return null;
        }
    }

    /**
     * Map Exercism difficulty (1-10) to our format
     */
    mapDifficulty(difficulty) {
        if (difficulty <= 3) return 'easy';
        if (difficulty <= 7) return 'medium';
        return 'hard';
    }

    /**
     * Map topics to category
     */
    mapTopicsToCategory(topics) {
        if (!topics || topics.length === 0) return 'algorithms';
        
        const topicMap = {
            'arrays': 'arrays',
            'strings': 'strings',
            'math': 'math',
            'recursion': 'algorithms',
            'loops': 'algorithms',
            'conditionals': 'algorithms',
            'classes': 'oop',
            'inheritance': 'oop',
            'interfaces': 'oop'
        };

        for (const topic of topics) {
            if (topicMap[topic]) return topicMap[topic];
        }
        
        return 'algorithms';
    }

    /**
     * Get points based on difficulty
     */
    getPoints(difficulty) {
        const pointMap = {
            'easy': 50,
            'medium': 80,
            'hard': 150
        };
        return pointMap[difficulty] || 50;
    }

    /**
     * Format exercise description
     */
    formatDescription(details) {
        let description = `# ${details.title}\n\n`;
        
        if (details.blurb) {
            description += `${details.blurb}\n\n`;
        }
        
        if (details.instructions) {
            description += `## Instructions\n\n${details.instructions}\n\n`;
        }
        
        if (details.introduction) {
            description += `## Introduction\n\n${details.introduction}\n\n`;
        }
        
        description += `\n**Source:** [Exercism - Java Track](https://exercism.org/tracks/java/exercises/${details.slug})`;
        
        return description;
    }

    /**
     * Parse test cases from Exercism tests
     * Note: Exercism provides test files, we'll need to parse them
     */
    parseTestCases(details) {
        // Exercism provides test files in their API
        // For now, return basic structure
        // In production, you'd parse the actual test file
        
        console.log(`[EXERCISM] Test cases available in exercise files`);
        
        return [
            {
                input: ['See exercise description'],
                expected: 'See test file'
            }
        ];
    }

    /**
     * Get starter code from exercise
     */
    getStarterCode(details) {
        // Exercism provides starter files
        if (details.files && details.files.solution) {
            return details.files.solution[0]?.content || this.getDefaultStarterCode();
        }
        
        return this.getDefaultStarterCode();
    }

    /**
     * Default starter code template
     */
    getDefaultStarterCode() {
        return `public class Solution {
    // Write your solution here
    
}`;
    }

    /**
     * Extract hints from exercise
     */
    extractHints(details) {
        const hints = [];
        
        if (details.hints) {
            hints.push(...details.hints);
        }
        
        return hints;
    }

    /**
     * Get random exercises for a contest
     * @param {string} difficulty - easy, medium, or hard
     * @param {number} count - Number of exercises
     * @returns {Promise<Array>} - Array of converted exercises
     */
    async getRandomExercises(difficulty, count = 5) {
        const exercises = await this.getExercisesByDifficulty(difficulty, count * 2);

        // Convert to our format
        const converted = [];
        for (const exercise of exercises.slice(0, count)) {
            const convertedExercise = await this.convertToOurFormat(exercise);
            if (convertedExercise) {
                converted.push(convertedExercise);
            }
        }

        console.log(`[EXERCISM] Converted ${converted.length} exercises`);
        return converted;
    }
}

// Cached version
class CachedExercismAPI extends ExercismAPI {
    constructor() {
        super();
        this.exerciseCache = new Map();
    }

    async getCachedExercise(slug) {
        const cached = this.exerciseCache.get(slug);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        const allExercises = await this.getJavaExercises();
        const exercise = allExercises.find(ex => ex.slug === slug);

        if (exercise) {
            const converted = await this.convertToOurFormat(exercise);
            this.exerciseCache.set(slug, {
                data: converted,
                timestamp: Date.now()
            });
            return converted;
        }

        return null;
    }
}

module.exports = { ExercismAPI, CachedExercismAPI };
