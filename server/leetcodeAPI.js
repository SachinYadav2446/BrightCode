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

        // Parse test cases from example (this is tricky and may need manual work)
        const testCases = this.parseTestCases(details.exampleTestcases);

        return {
            id: `lc_${details.id}`,
            title: details.title,
            difficulty: details.difficulty,
            category: this.mapTopicsToCategory(details.topics),
            timeLimit: this.getTimeLimit(details.difficulty),
            points: this.getPoints(details.difficulty),
            description: details.content,
            methodSignature: this.extractMethodSignature(details.javaTemplate),
            testCases: testCases,
            starterCode: details.javaTemplate || '',
            source: 'leetcode'
        };
    }

    // Helper methods
    parseTestCases(exampleTestcases) {
        // This is a simplified parser - real implementation would be more complex
        if (!exampleTestcases) return [];
        
        try {
            const lines = exampleTestcases.split('\n');
            const testCases = [];
            
            for (let i = 0; i < lines.length; i += 2) {
                if (i + 1 < lines.length) {
                    testCases.push({
                        input: [lines[i].trim()],
                        expected: lines[i + 1].trim()
                    });
                }
            }
            
            return testCases;
        } catch (error) {
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