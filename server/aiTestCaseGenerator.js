/**
 * AI-Powered Test Case Generator
 * Generates test cases from problem descriptions using OpenAI/Claude
 */

const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');

class AITestCaseGenerator {
    constructor() {
        // Support multiple AI providers with fallback
        this.providers = {
            openai: {
                enabled: !!process.env.OPENAI_API_KEY,
                apiKey: process.env.OPENAI_API_KEY,
                model: 'gpt-4o-mini', // Fast and cheap
                endpoint: 'https://api.openai.com/v1/chat/completions',
                priority: 1 // Highest priority
            },
            anthropic: {
                enabled: !!process.env.ANTHROPIC_API_KEY,
                apiKey: process.env.ANTHROPIC_API_KEY,
                model: 'claude-3-haiku-20240307', // Fast and cheap
                endpoint: 'https://api.anthropic.com/v1/messages',
                priority: 2
            },
            gemini: {
                enabled: !!process.env.GEMINI_API_KEY,
                apiKey: process.env.GEMINI_API_KEY,
                model: 'gemini-1.5-flash-latest', // Updated model name
                endpoint: 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash-latest:generateContent',
                priority: 3
            },
            groq: {
                enabled: !!process.env.GROQ_API_KEY,
                apiKey: process.env.GROQ_API_KEY,
                model: 'llama-3.1-8b-instant', // Very fast, free tier
                endpoint: 'https://api.groq.com/openai/v1/chat/completions',
                priority: 4
            }
        };
        
        // Cache generated test cases
        this.cache = new Map(); // problemId -> testCases
        this.generationQueue = new Map(); // problemId -> Promise
        
        // Persistent storage path
        this.storageDir = path.join(__dirname, 'ai_test_cases');
        this.storageFile = path.join(this.storageDir, 'test_cases_db.json');
        
        // Track provider usage and failures
        this.providerStats = {
            openai: { success: 0, failures: 0 },
            anthropic: { success: 0, failures: 0 },
            gemini: { success: 0, failures: 0 },
            groq: { success: 0, failures: 0 }
        };
        
        // Initialize persistent storage
        this.initializeStorage();
        
        // Log enabled providers
        const enabled = Object.entries(this.providers)
            .filter(([_, p]) => p.enabled)
            .map(([name, p]) => `${name} (priority ${p.priority})`)
            .join(', ');
        
        if (enabled) {
            console.log(`[AI-TC] 🤖 Enabled AI providers: ${enabled}`);
        } else {
            console.warn('[AI-TC] ⚠️ No AI providers configured! Set API keys in .env');
        }
    }
    
    /**
     * Initialize persistent storage
     */
    async initializeStorage() {
        try {
            // Create directory if it doesn't exist
            await fs.mkdir(this.storageDir, { recursive: true });
            
            // Load existing test cases from file
            try {
                const data = await fs.readFile(this.storageFile, 'utf8');
                const stored = JSON.parse(data);
                
                // Load into cache
                for (const [problemId, entry] of Object.entries(stored)) {
                    this.cache.set(problemId, entry.testCases);
                }
                
                console.log(`[AI-TC] 💾 Loaded ${Object.keys(stored).length} test cases from persistent storage`);
            } catch (err) {
                // File doesn't exist yet, create it
                await fs.writeFile(this.storageFile, JSON.stringify({}), 'utf8');
                console.log(`[AI-TC] 💾 Created new persistent storage file`);
            }
        } catch (error) {
            console.error('[AI-TC] ❌ Failed to initialize storage:', error.message);
        }
    }
    
    /**
     * Save test cases to persistent storage
     */
    async saveToStorage(problemId, testCases, problemTitle) {
        try {
            // Read current storage
            let stored = {};
            try {
                const data = await fs.readFile(this.storageFile, 'utf8');
                stored = JSON.parse(data);
            } catch (err) {
                // File doesn't exist, start fresh
            }
            
            // Add new test cases
            stored[problemId] = {
                problemTitle: problemTitle,
                testCases: testCases,
                generatedAt: new Date().toISOString(),
                provider: this.getLastSuccessfulProvider()
            };
            
            // Write back to file
            await fs.writeFile(this.storageFile, JSON.stringify(stored, null, 2), 'utf8');
            
            console.log(`[AI-TC] 💾 Saved test cases for "${problemTitle}" to persistent storage`);
        } catch (error) {
            console.error(`[AI-TC] ❌ Failed to save to storage:`, error.message);
        }
    }
    
    /**
     * Load test cases from persistent storage
     */
    async loadFromStorage(problemId) {
        try {
            const data = await fs.readFile(this.storageFile, 'utf8');
            const stored = JSON.parse(data);
            
            if (stored[problemId]) {
                console.log(`[AI-TC] 💾 Loaded test cases for problem ${problemId} from persistent storage (generated ${stored[problemId].generatedAt})`);
                return stored[problemId].testCases;
            }
            
            return null;
        } catch (error) {
            return null;
        }
    }
    
    /**
     * Get last successful provider name
     */
    getLastSuccessfulProvider() {
        for (const [name, stats] of Object.entries(this.providerStats)) {
            if (stats.success > 0) {
                return name;
            }
        }
        return 'unknown';
    }

    /**
     * Generate test cases for a problem (async, non-blocking)
     * @param {Object} problem - Problem object with description
     * @returns {Promise<Array>} - Generated test cases
     */
    async generateTestCases(problem) {
        const cacheKey = problem.id;
        
        // Check in-memory cache first
        if (this.cache.has(cacheKey)) {
            console.log(`[AI-TC] ⚡ Using cached test cases for ${problem.title}`);
            return this.cache.get(cacheKey);
        }
        
        // Check persistent storage
        const storedTestCases = await this.loadFromStorage(cacheKey);
        if (storedTestCases) {
            this.cache.set(cacheKey, storedTestCases);
            return storedTestCases;
        }
        
        // Check if already generating
        if (this.generationQueue.has(cacheKey)) {
            console.log(`[AI-TC] Test case generation already in progress for ${problem.title}`);
            return this.generationQueue.get(cacheKey);
        }
        
        // Start generation
        console.log(`[AI-TC] 🤖 Generating test cases for: ${problem.title}`);
        
        const generationPromise = this._generateWithAI(problem)
            .then(async testCases => {
                this.cache.set(cacheKey, testCases);
                this.generationQueue.delete(cacheKey);
                
                // Save to persistent storage
                await this.saveToStorage(cacheKey, testCases, problem.title);
                
                console.log(`[AI-TC] ✅ Generated ${testCases.length} test cases for ${problem.title}`);
                return testCases;
            })
            .catch(error => {
                console.error(`[AI-TC] ❌ Failed to generate test cases for ${problem.title}:`, error.message);
                this.generationQueue.delete(cacheKey);
                // Return fallback test cases
                return this._getFallbackTestCases(problem);
            });
        
        this.generationQueue.set(cacheKey, generationPromise);
        return generationPromise;
    }

    /**
     * Generate test cases using AI with fallback chain
     */
    async _generateWithAI(problem) {
        // Get enabled providers sorted by priority
        const providers = Object.entries(this.providers)
            .filter(([_, config]) => config.enabled)
            .sort((a, b) => a[1].priority - b[1].priority)
            .map(([name, config]) => ({
                name,
                config,
                fn: () => this._generateWithProvider(name, config, problem)
            }));
        
        if (providers.length === 0) {
            throw new Error('No AI provider configured. Set OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, or GROQ_API_KEY in .env');
        }
        
        console.log(`[AI-TC] Available providers: ${providers.map(p => p.name).join(' → ')}`);
        
        // Try each provider in priority order
        const errors = [];
        for (let i = 0; i < providers.length; i++) {
            const provider = providers[i];
            try {
                console.log(`[AI-TC] Trying ${provider.name} (${i + 1}/${providers.length})...`);
                const result = await provider.fn();
                
                // Track success
                this.providerStats[provider.name].success++;
                
                console.log(`[AI-TC] ✅ ${provider.name} succeeded`);
                return result;
            } catch (error) {
                // Track failure
                this.providerStats[provider.name].failures++;
                
                console.warn(`[AI-TC] ⚠️ ${provider.name} failed: ${error.message}`);
                errors.push({ provider: provider.name, error: error.message });
                
                // Continue to next provider if available
                if (i < providers.length - 1) {
                    console.log(`[AI-TC] 🔄 Falling back to ${providers[i + 1].name}...`);
                }
            }
        }
        
        // All providers failed
        const errorMsg = errors.map(e => `${e.provider}: ${e.error}`).join('; ');
        throw new Error(`All AI providers failed: ${errorMsg}`);
    }
    
    /**
     * Generate with specific provider
     */
    async _generateWithProvider(name, config, problem) {
        switch (name) {
            case 'openai':
                return await this._generateWithOpenAI(problem);
            case 'anthropic':
                return await this._generateWithAnthropic(problem);
            case 'gemini':
                return await this._generateWithGemini(problem);
            case 'groq':
                return await this._generateWithGroq(problem);
            default:
                throw new Error(`Unknown provider: ${name}`);
        }
    }

    /**
     * Generate test cases using OpenAI
     */
    async _generateWithOpenAI(problem) {
        const prompt = this._buildPrompt(problem);
        
        try {
            const response = await axios.post(
                this.providers.openai.endpoint,
                {
                    model: this.providers.openai.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a test case generator for coding problems. Generate diverse, comprehensive test cases in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.providers.openai.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000 // 30 second timeout
                }
            );
            
            const content = response.data.choices[0].message.content;
            return this._parseTestCases(content);
        } catch (error) {
            console.error('[AI-TC] OpenAI error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generate test cases using Anthropic Claude
     */
    async _generateWithAnthropic(problem) {
        const prompt = this._buildPrompt(problem);
        
        try {
            const response = await axios.post(
                this.providers.anthropic.endpoint,
                {
                    model: this.providers.anthropic.model,
                    max_tokens: 2000,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                },
                {
                    headers: {
                        'x-api-key': this.providers.anthropic.apiKey,
                        'anthropic-version': '2023-06-01',
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
            
            const content = response.data.content[0].text;
            return this._parseTestCases(content);
        } catch (error) {
            console.error('[AI-TC] Anthropic error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generate test cases using Google Gemini
     */
    async _generateWithGemini(problem) {
        const prompt = this._buildPrompt(problem);
        
        try {
            // Use gemini-2.5-flash (latest stable model)
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${this.providers.gemini.apiKey}`;
            
            const response = await axios.post(
                url,
                {
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 2000
                    }
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
            
            const content = response.data.candidates[0].content.parts[0].text;
            return this._parseTestCases(content);
        } catch (error) {
            console.error('[AI-TC] Gemini error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Generate test cases using Groq (Llama)
     */
    async _generateWithGroq(problem) {
        const prompt = this._buildPrompt(problem);
        
        try {
            const response = await axios.post(
                this.providers.groq.endpoint,
                {
                    model: this.providers.groq.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a test case generator for coding problems. Generate diverse, comprehensive test cases in JSON format.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 2000
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.providers.groq.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );
            
            const content = response.data.choices[0].message.content;
            return this._parseTestCases(content);
        } catch (error) {
            console.error('[AI-TC] Groq error:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Build prompt for AI
     */
    _buildPrompt(problem) {
        return `Generate comprehensive test cases for this coding problem:

**Title:** ${problem.title}
**Difficulty:** ${problem.difficulty}
**Description:**
${problem.description}

${problem.examples ? `**Examples:**
${problem.examples.map((ex, i) => `Example ${i + 1}:
Input: ${ex.input}
Output: ${ex.output}
${ex.explanation ? `Explanation: ${ex.explanation}` : ''}`).join('\n\n')}` : ''}

${problem.methodSignature ? `**Method Signature:** ${problem.methodSignature}` : ''}

**Requirements:**
1. Generate 8-10 diverse test cases
2. Include edge cases (empty input, single element, large numbers, etc.)
3. Include normal cases (typical inputs)
4. Include boundary cases (min/max values)
5. Format as JSON array: [{"input": [...], "expected": "..."}, ...]

**Important:**
- "input" should be an array of parameters matching the method signature
- "expected" should be the expected output as a string
- For arrays, use format: [1,2,3]
- For strings, use format: "hello"
- For numbers, use format: 42
- For booleans, use format: true/false

Return ONLY the JSON array, no explanation.`;
    }

    /**
     * Parse test cases from AI response
     */
    _parseTestCases(content) {
        try {
            // Extract JSON from markdown code blocks if present
            let jsonStr = content.trim();
            
            // Remove markdown code blocks
            if (jsonStr.startsWith('```')) {
                jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
            }
            
            // Sometimes AI returns incomplete JSON, try to fix it
            if (!jsonStr.endsWith(']')) {
                // Find the last complete object
                const lastCompleteIndex = jsonStr.lastIndexOf('}');
                if (lastCompleteIndex > 0) {
                    jsonStr = jsonStr.substring(0, lastCompleteIndex + 1) + '\n]';
                }
            }
            
            // Parse JSON
            const testCases = JSON.parse(jsonStr);
            
            // Validate format
            if (!Array.isArray(testCases)) {
                throw new Error('Test cases must be an array');
            }
            
            // Validate each test case
            const validTestCases = [];
            for (const tc of testCases) {
                if (tc.input && tc.expected) {
                    if (!Array.isArray(tc.input)) {
                        console.warn('[AI-TC] Skipping test case: input must be an array');
                        continue;
                    }
                    validTestCases.push(tc);
                }
            }
            
            if (validTestCases.length === 0) {
                throw new Error('No valid test cases found');
            }
            
            console.log(`[AI-TC] ✅ Parsed ${validTestCases.length} valid test cases`);
            return validTestCases;
            
        } catch (error) {
            console.error('[AI-TC] Failed to parse test cases:', error.message);
            console.error('[AI-TC] Raw content:', content);
            throw new Error('Failed to parse AI response');
        }
    }

    /**
     * Get fallback test cases if AI fails
     */
    _getFallbackTestCases(problem) {
        console.log(`[AI-TC] Using fallback test cases for ${problem.title}`);
        
        // Use existing test cases if available
        if (problem.testCases && problem.testCases.length > 0) {
            return problem.testCases;
        }
        
        // Generate basic test cases from examples
        if (problem.examples && problem.examples.length > 0) {
            return problem.examples.map(ex => ({
                input: this._parseExampleInput(ex.input),
                expected: this._parseExampleOutput(ex.output)
            }));
        }
        
        // Last resort: empty test case
        return [{
            input: [],
            expected: 'No test cases available'
        }];
    }

    /**
     * Parse example input string to array
     */
    _parseExampleInput(inputStr) {
        try {
            // Try to extract values from string like "nums = [1,2,3], target = 5"
            const matches = inputStr.match(/=\s*(.+?)(?:,|$)/g);
            if (matches) {
                return matches.map(m => {
                    const value = m.replace(/=\s*/, '').replace(/,\s*$/, '').trim();
                    try {
                        return JSON.parse(value);
                    } catch {
                        return value;
                    }
                });
            }
            return [inputStr];
        } catch {
            return [inputStr];
        }
    }

    /**
     * Parse example output string
     */
    _parseExampleOutput(outputStr) {
        return outputStr.replace(/^["']|["']$/g, '').trim();
    }

    /**
     * Pregenerate test cases for multiple problems (batch)
     */
    async pregenerateTestCases(problems) {
        console.log(`[AI-TC] 🚀 Pregenerating test cases for ${problems.length} problems...`);
        
        const promises = problems.map(problem => 
            this.generateTestCases(problem).catch(err => {
                console.error(`[AI-TC] Failed to generate for ${problem.title}:`, err.message);
                return null;
            })
        );
        
        const results = await Promise.all(promises);
        const successful = results.filter(r => r !== null).length;
        
        console.log(`[AI-TC] ✅ Pregenerated test cases for ${successful}/${problems.length} problems`);
        return results;
    }

    /**
     * Get test cases (from cache or generate)
     */
    async getTestCases(problem) {
        // Check cache first
        if (this.cache.has(problem.id)) {
            return this.cache.get(problem.id);
        }
        
        // Check if generation is in progress
        if (this.generationQueue.has(problem.id)) {
            return await this.generationQueue.get(problem.id);
        }
        
        // Use existing test cases if available and valid
        if (problem.testCases && problem.testCases.length > 0) {
            const hasValidTestCases = problem.testCases.every(tc => 
                tc.input && tc.expected && 
                !tc.expected.includes('visit problem page')
            );
            
            if (hasValidTestCases) {
                console.log(`[AI-TC] Using existing test cases for ${problem.title}`);
                return problem.testCases;
            }
        }
        
        // Generate new test cases
        return await this.generateTestCases(problem);
    }

    /**
     * Clear cache
     */
    clearCache() {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`[AI-TC] Cleared cache (${size} problems)`);
    }

    /**
     * Get cache stats
     */
    getCacheStats() {
        const enabledProviders = Object.entries(this.providers)
            .filter(([_, p]) => p.enabled)
            .map(([name, p]) => ({ name, priority: p.priority, model: p.model }));
        
        return {
            cached: this.cache.size,
            generating: this.generationQueue.size,
            providers: {
                enabled: enabledProviders,
                stats: this.providerStats
            }
        };
    }
    
    /**
     * Get provider statistics
     */
    getProviderStats() {
        const stats = {};
        
        for (const [name, data] of Object.entries(this.providerStats)) {
            const total = data.success + data.failures;
            stats[name] = {
                enabled: this.providers[name].enabled,
                priority: this.providers[name].priority,
                model: this.providers[name].model,
                success: data.success,
                failures: data.failures,
                total: total,
                successRate: total > 0 ? ((data.success / total) * 100).toFixed(1) + '%' : 'N/A'
            };
        }
        
        return stats;
    }
    
    /**
     * Reset provider statistics
     */
    resetStats() {
        for (const name in this.providerStats) {
            this.providerStats[name] = { success: 0, failures: 0 };
        }
        console.log('[AI-TC] Provider statistics reset');
    }
}

// Singleton instance
let instance = null;

function getAITestCaseGenerator() {
    if (!instance) {
        instance = new AITestCaseGenerator();
    }
    return instance;
}

module.exports = { AITestCaseGenerator, getAITestCaseGenerator };
