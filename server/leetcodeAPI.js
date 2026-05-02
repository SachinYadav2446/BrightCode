// LeetCode API Integration for Code Wars Arena
// Note: This is for educational purposes - respect LeetCode's terms of service

const axios = require('axios');

class LeetCodeAPI {
    constructor() {
        this.baseURL = 'https://leetcode.com/graphql';
        this.headers = {
            'Content-Type': 'application/json',
            'User-Agent': 'CodeWars-Arena/1.0'
        };
    }

    // Get problem list with filters
    async getProblems(difficulty = null, limit = 20) {
        const query = `
            query problemsetQuestionList($categorySlug: String, $limit: Int, $skip: Int, $filters: QuestionListFilterInput) {
                problemsetQuestionList: questionList(
                    categorySlug: $categorySlug
                    limit: $limit
                    skip: $skip
                    filters: $filters
                ) {
                    total: totalNum
                    questions: data {
                        acRate
                        difficulty
                        freqBar
                        frontendQuestionId: questionFrontendId
                        isFavor
                        paidOnly: isPaidOnly
                        status
                        title
                        titleSlug
                        topicTags {
                            name
                            id
                            slug
                        }
                        hasSolution
                        hasVideoSolution
                    }
                }
            }
        `;

        const variables = {
            categorySlug: "",
            skip: 0,
            limit: limit,
            filters: {}
        };

        if (difficulty) {
            variables.filters.difficulty = difficulty.toUpperCase();
        }

        try {
            const response = await axios.post(this.baseURL, {
                query,
                variables
            }, { headers: this.headers });

            return response.data.data.problemsetQuestionList.questions
                .filter(q => !q.paidOnly) // Only free problems
                .map(q => ({
                    id: q.frontendQuestionId,
                    title: q.title,
                    titleSlug: q.titleSlug,
                    difficulty: q.difficulty.toLowerCase(),
                    acceptance: q.acRate,
                    topics: q.topicTags.map(tag => tag.name)
                }));
        } catch (error) {
            console.error('Error fetching LeetCode problems:', error.message);
            return [];
        }
    }

    // Get detailed problem information
    async getProblemDetails(titleSlug) {
        const query = `
            query questionData($titleSlug: String!) {
                question(titleSlug: $titleSlug) {
                    questionId
                    questionFrontendId
                    title
                    titleSlug
                    content
                    difficulty
                    likes
                    dislikes
                    isLiked
                    similarQuestions
                    exampleTestcases
                    categoryTitle
                    contributors {
                        username
                        profileUrl
                        avatarUrl
                        __typename
                    }
                    topicTags {
                        name
                        slug
                        translatedName
                        __typename
                    }
                    companyTagStats
                    codeSnippets {
                        lang
                        langSlug
                        code
                        __typename
                    }
                    stats
                    hints
                    solution {
                        id
                        canSeeDetail
                        paidOnly
                        hasVideoSolution
                        paidOnlyVideo
                        __typename
                    }
                    status
                    sampleTestCase
                    metaData
                    judgerAvailable
                    judgeType
                    mysqlSchemas
                    enableRunCode
                    enableTestMode
                    enableDebugger
                    envInfo
                    libraryUrl
                    adminUrl
                    challengeQuestion {
                        id
                        date
                        incompleteChallengeCount
                        streakCount
                        type
                        __typename
                    }
                    __typename
                }
            }
        `;

        try {
            const response = await axios.post(this.baseURL, {
                query,
                variables: { titleSlug }
            }, { headers: this.headers });

            const question = response.data.data.question;
            
            // Extract Java code template
            const javaSnippet = question.codeSnippets.find(snippet => 
                snippet.langSlug === 'java'
            );

            return {
                id: question.questionFrontendId,
                title: question.title,
                difficulty: question.difficulty.toLowerCase(),
                content: this.cleanHTML(question.content),
                hints: question.hints || [],
                javaTemplate: javaSnippet ? javaSnippet.code : null,
                sampleTestCase: question.sampleTestCase,
                exampleTestcases: question.exampleTestcases,
                topics: question.topicTags.map(tag => tag.name)
            };
        } catch (error) {
            console.error('Error fetching problem details:', error.message);
            return null;
        }
    }

    // Clean HTML content to plain text
    cleanHTML(html) {
        if (!html) return '';
        
        return html
            .replace(/<[^>]*>/g, '') // Remove HTML tags
            .replace(/&nbsp;/g, ' ')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/&quot;/g, '"')
            .trim();
    }

    // Convert LeetCode problem to our format
    async convertToCodeWarFormat(titleSlug) {
        const details = await this.getProblemDetails(titleSlug);
        if (!details) return null;

        // Extract method signature first (needed for test case parsing)
        const methodSignature = this.extractMethodSignature(details.javaTemplate);
        
        // Parse test cases with method signature for better parsing
        const testCases = this.parseTestCases(
            details.exampleTestcases, 
            methodSignature,
            details.sampleTestCase
        );

        return {
            id: `lc_${details.id}`,
            title: details.title,
            difficulty: details.difficulty,
            category: this.mapTopicsToCategory(details.topics),
            timeLimit: this.getTimeLimit(details.difficulty),
            points: this.getPoints(details.difficulty),
            description: details.content,
            methodSignature: methodSignature,
            testCases: testCases,
            starterCode: details.javaTemplate || '',
            source: 'leetcode',
            examples: this.extractExamples(details.content) // Extract examples from description
        };
    }

    // Helper methods
    parseTestCases(exampleTestcases, methodSignature, sampleTestCase) {
        if (!exampleTestcases) {
            console.warn('[LEETCODE] No example test cases provided');
            return [];
        }
        
        try {
            console.log('[LEETCODE] Parsing test cases:', exampleTestcases);
            console.log('[LEETCODE] Method signature:', methodSignature);
            
            // LeetCode format: Each line is an input parameter, alternating with expected output
            // Example for "two-sum":
            // [2,7,11,15]
            // 9
            // [3,2,4]
            // 6
            // etc.
            
            const lines = exampleTestcases.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            const testCases = [];
            
            // Determine number of parameters from method signature
            const paramCount = this.getParameterCount(methodSignature);
            console.log('[LEETCODE] Detected parameter count:', paramCount);
            
            // Group lines into test cases
            // Format: param1, param2, ..., paramN, expected_output (repeat)
            const linesPerTest = paramCount + 1; // params + expected output
            
            for (let i = 0; i < lines.length; i += linesPerTest) {
                if (i + linesPerTest <= lines.length) {
                    const inputs = [];
                    
                    // Parse input parameters
                    for (let j = 0; j < paramCount; j++) {
                        const inputLine = lines[i + j];
                        inputs.push(this.parseValue(inputLine));
                    }
                    
                    // Parse expected output
                    const expectedLine = lines[i + paramCount];
                    const expected = this.parseValue(expectedLine);
                    
                    testCases.push({
                        input: inputs,
                        expected: String(expected)
                    });
                    
                    console.log(`[LEETCODE] Parsed test case ${testCases.length}:`, {
                        input: inputs,
                        expected: String(expected)
                    });
                }
            }
            
            if (testCases.length === 0) {
                console.warn('[LEETCODE] No test cases could be parsed');
                // Try fallback: use sample test case if available
                if (sampleTestCase) {
                    console.log('[LEETCODE] Attempting to use sample test case:', sampleTestCase);
                    const fallbackCases = this.parseSampleTestCase(sampleTestCase, paramCount);
                    if (fallbackCases.length > 0) {
                        testCases.push(...fallbackCases);
                    }
                }
            }
            
            console.log(`[LEETCODE] Successfully parsed ${testCases.length} test cases`);
            return testCases;
            
        } catch (error) {
            console.error('[LEETCODE] Error parsing test cases:', error);
            return [];
        }
    }
    
    /**
     * Get parameter count from method signature
     */
    getParameterCount(methodSignature) {
        if (!methodSignature) return 1; // Default to 1 parameter
        
        try {
            // Extract parameters from signature: "public ReturnType methodName(Type1 param1, Type2 param2)"
            const match = methodSignature.match(/\(([^)]*)\)/);
            if (!match || !match[1].trim()) return 0; // No parameters
            
            const params = match[1].split(',').filter(p => p.trim().length > 0);
            return params.length;
        } catch (error) {
            console.warn('[LEETCODE] Could not parse parameter count, defaulting to 1');
            return 1;
        }
    }
    
    /**
     * Parse a value from string to appropriate type
     */
    parseValue(valueStr) {
        if (!valueStr || valueStr === 'null') return null;
        
        const trimmed = valueStr.trim();
        
        // Boolean
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;
        
        // Array (e.g., [1,2,3] or ["a","b","c"])
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            try {
                // Use JSON.parse for proper array parsing
                return JSON.parse(trimmed);
            } catch (error) {
                console.warn('[LEETCODE] Could not parse array:', trimmed);
                return trimmed;
            }
        }
        
        // String (quoted)
        if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
            (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
            return trimmed.slice(1, -1);
        }
        
        // Number
        if (!isNaN(trimmed) && !isNaN(parseFloat(trimmed))) {
            return parseFloat(trimmed);
        }
        
        // Default: return as string
        return trimmed;
    }
    
    /**
     * Parse sample test case as fallback
     */
    parseSampleTestCase(sampleTestCase, paramCount) {
        try {
            const lines = sampleTestCase.split('\n').map(line => line.trim()).filter(line => line.length > 0);
            const testCases = [];
            
            // Assume first half is inputs, second half is outputs
            const midpoint = Math.floor(lines.length / 2);
            
            for (let i = 0; i < midpoint; i++) {
                const inputs = [];
                
                // Try to split input line by parameter count
                const inputLine = lines[i];
                const values = inputLine.split(/\s+/);
                
                for (let j = 0; j < Math.min(paramCount, values.length); j++) {
                    inputs.push(this.parseValue(values[j]));
                }
                
                // Get corresponding output
                if (i + midpoint < lines.length) {
                    const expected = this.parseValue(lines[i + midpoint]);
                    testCases.push({
                        input: inputs,
                        expected: String(expected)
                    });
                }
            }
            
            return testCases;
        } catch (error) {
            console.error('[LEETCODE] Error parsing sample test case:', error);
            return [];
        }
    }

    mapTopicsToCategory(topics) {
        const topicMap = {
            'Array': 'arrays',
            'String': 'strings',
            'Math': 'math',
            'Dynamic Programming': 'algorithms',
            'Tree': 'data_structures',
            'Graph': 'algorithms',
            'Hash Table': 'data_structures'
        };

        for (const topic of topics) {
            if (topicMap[topic]) {
                return topicMap[topic];
            }
        }
        return 'algorithms';
    }

    getTimeLimit(difficulty) {
        const timeMap = {
            'easy': 300,    // 5 minutes
            'medium': 600,  // 10 minutes
            'hard': 900     // 15 minutes
        };
        return timeMap[difficulty] || 300;
    }

    getPoints(difficulty) {
        const pointMap = {
            'easy': 100,
            'medium': 200,
            'hard': 400
        };
        return pointMap[difficulty] || 100;
    }

    extractMethodSignature(javaTemplate) {
        if (!javaTemplate) return '';
        
        const match = javaTemplate.match(/public\s+[\w<>\[\]]+\s+\w+\s*\([^)]*\)/);
        return match ? match[0] : '';
    }
    
    /**
     * Extract examples from problem description HTML
     */
    extractExamples(htmlContent) {
        if (!htmlContent) return [];
        
        try {
            const examples = [];
            
            // Look for Example patterns in HTML
            // LeetCode uses <strong>Example 1:</strong> format
            const exampleRegex = /<strong>Example\s+\d+:<\/strong>([\s\S]*?)(?=<strong>Example|\<strong>Constraints|$)/gi;
            const matches = htmlContent.matchAll(exampleRegex);
            
            for (const match of matches) {
                const exampleText = match[1];
                
                // Extract Input and Output
                const inputMatch = exampleText.match(/<strong>Input:<\/strong>\s*([^<]+)/i);
                const outputMatch = exampleText.match(/<strong>Output:<\/strong>\s*([^<]+)/i);
                const explanationMatch = exampleText.match(/<strong>Explanation:<\/strong>\s*([^<]+)/i);
                
                if (inputMatch && outputMatch) {
                    examples.push({
                        input: inputMatch[1].trim(),
                        output: outputMatch[1].trim(),
                        explanation: explanationMatch ? explanationMatch[1].trim() : null
                    });
                }
            }
            
            console.log(`[LEETCODE] Extracted ${examples.length} examples from description`);
            return examples;
            
        } catch (error) {
            console.error('[LEETCODE] Error extracting examples:', error);
            return [];
        }
    }
}

// Usage example and caching
class CachedLeetCodeAPI extends LeetCodeAPI {
    constructor() {
        super();
        this.cache = new Map();
        this.cacheExpiry = 24 * 60 * 60 * 1000; // 24 hours
    }

    async getCachedProblems(difficulty, limit) {
        const key = `problems_${difficulty}_${limit}`;
        const cached = this.cache.get(key);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        const problems = await this.getProblems(difficulty, limit);
        this.cache.set(key, {
            data: problems,
            timestamp: Date.now()
        });

        return problems;
    }

    async getCachedProblemDetails(titleSlug) {
        const cached = this.cache.get(titleSlug);
        
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }

        const details = await this.convertToCodeWarFormat(titleSlug);
        if (details) {
            this.cache.set(titleSlug, {
                data: details,
                timestamp: Date.now()
            });
        }

        return details;
    }
}

module.exports = { LeetCodeAPI, CachedLeetCodeAPI };