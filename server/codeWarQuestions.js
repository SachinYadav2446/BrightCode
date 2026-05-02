// Code Wars Arena - Question Database
// Curated coding challenges for faction battles

const axios = require('axios');
const { CachedLeetCodeAPI } = require('./leetcodeAPI');
const { CachedCodeforcesAPI } = require('./codeforcesAPI');
const { CachedExercismAPI } = require('./exercismAPI');

// Initialize APIs
const leetcodeAPI = new CachedLeetCodeAPI();
const codeforcesAPI = new CachedCodeforcesAPI();
const exercismAPI = new CachedExercismAPI();

const DIFFICULTY_LEVELS = {
    EASY: 'easy',
    MEDIUM: 'medium',
    HARD: 'hard'
};

const CATEGORIES = {
    ARRAYS: 'arrays',
    STRINGS: 'strings',
    MATH: 'math',
    ALGORITHMS: 'algorithms',
    DATA_STRUCTURES: 'data_structures'
};

// ═══ GITHUB QUESTION SOURCES ═══
const GITHUB_SOURCES = {
    // Example: Fetch from a GitHub repo with questions
    LEETCODE_PATTERNS: 'https://raw.githubusercontent.com/SachinYadav2446/BrightCode/main/questions/leetcode-patterns.json',
    CUSTOM_CHALLENGES: 'https://raw.githubusercontent.com/SachinYadav2446/BrightCode/main/questions/custom-challenges.json'
};

// ═══ LOCAL QUESTION DATABASE ═══
const codeWarQuestions = [
    // ═══ EASY QUESTIONS ═══
    {
        id: 'cw_001',
        title: 'Two Sum',
        difficulty: DIFFICULTY_LEVELS.EASY,
        category: CATEGORIES.ARRAYS,
        timeLimit: 300, // 5 minutes
        points: 100,
        description: `Given an array of integers and a target sum, return the indices of two numbers that add up to the target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.`,
        
        examples: [
            {
                input: "nums = [2,7,11,15], target = 9",
                output: "[0, 1]",
                explanation: "Because nums[0] + nums[1] = 2 + 7 = 9"
            },
            {
                input: "nums = [3,2,4], target = 6", 
                output: "[1, 2]",
                explanation: "Because nums[1] + nums[2] = 2 + 4 = 6"
            }
        ],
        
        methodSignature: "public static int[] twoSum(int[] nums, int target)",
        
        testCases: [
            { input: [[2,7,11,15], 9], expected: "[0, 1]" },
            { input: [[3,2,4], 6], expected: "[1, 2]" },
            { input: [[3,3], 6], expected: "[0, 1]" },
            { input: [[1,2,3,4,5], 8], expected: "[2, 4]" },
            { input: [[5,5,5,5], 10], expected: "[0, 1]" }
        ],
        
        starterCode: `public static int[] twoSum(int[] nums, int target) {
    // Your code here
    return new int[]{0, 0};
}`
    },
    
    {
        id: 'cw_002',
        title: 'Palindrome Check',
        difficulty: DIFFICULTY_LEVELS.EASY,
        category: CATEGORIES.STRINGS,
        timeLimit: 240, // 4 minutes
        points: 80,
        description: `Check if a given string is a palindrome (reads the same forwards and backwards).
        
Ignore spaces, punctuation, and case. Only consider alphanumeric characters.`,
        
        examples: [
            {
                input: '"A man a plan a canal Panama"',
                output: "true",
                explanation: "Ignoring spaces and case: 'amanaplanacanalpanama' is a palindrome"
            },
            {
                input: '"race a car"',
                output: "false", 
                explanation: "Ignoring spaces: 'raceacar' is not a palindrome"
            }
        ],
        
        methodSignature: "public static boolean isPalindrome(String s)",
        
        testCases: [
            { input: ["A man a plan a canal Panama"], expected: "true" },
            { input: ["race a car"], expected: "false" },
            { input: [""], expected: "true" },
            { input: ["Madam"], expected: "true" },
            { input: ["No 'x' in Nixon"], expected: "true" }
        ],
        
        starterCode: `public static boolean isPalindrome(String s) {
    // Your code here
    return false;
}`
    },

    {
        id: 'cw_003',
        title: 'Factorial Calculator',
        difficulty: DIFFICULTY_LEVELS.EASY,
        category: CATEGORIES.MATH,
        timeLimit: 180, // 3 minutes
        points: 60,
        description: `Calculate the factorial of a non-negative integer n.
        
Factorial of n (n!) is the product of all positive integers less than or equal to n.
By definition, 0! = 1.`,
        
        examples: [
            {
                input: "5",
                output: "120",
                explanation: "5! = 5 × 4 × 3 × 2 × 1 = 120"
            },
            {
                input: "0",
                output: "1",
                explanation: "0! = 1 by definition"
            }
        ],
        
        methodSignature: "public static long factorial(int n)",
        
        testCases: [
            { input: [0], expected: "1" },
            { input: [1], expected: "1" },
            { input: [5], expected: "120" },
            { input: [7], expected: "5040" },
            { input: [10], expected: "3628800" }
        ],
        
        starterCode: `public static long factorial(int n) {
    // Your code here
    return 1;
}`
    },

    // ═══ MEDIUM QUESTIONS ═══
    {
        id: 'cw_004',
        title: 'Valid Parentheses',
        difficulty: DIFFICULTY_LEVELS.MEDIUM,
        category: CATEGORIES.DATA_STRUCTURES,
        timeLimit: 420, // 7 minutes
        points: 200,
        description: `Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets
2. Open brackets must be closed in the correct order
3. Every close bracket has a corresponding open bracket of the same type`,
        
        examples: [
            {
                input: '"()"',
                output: "true",
                explanation: "Valid parentheses"
            },
            {
                input: '"()[]{}"',
                output: "true",
                explanation: "All brackets are properly matched"
            },
            {
                input: '"(]"',
                output: "false",
                explanation: "Mismatched bracket types"
            }
        ],
        
        methodSignature: "public static boolean isValid(String s)",
        
        testCases: [
            { input: ["()"], expected: "true" },
            { input: ["()[]{}"], expected: "true" },
            { input: ["(]"], expected: "false" },
            { input: ["([)]"], expected: "false" },
            { input: ["{[]}"], expected: "true" },
            { input: [""], expected: "true" }
        ],
        
        starterCode: `public static boolean isValid(String s) {
    // Hint: Use a stack data structure
    return false;
}`
    },

    {
        id: 'cw_005',
        title: 'Binary Search',
        difficulty: DIFFICULTY_LEVELS.MEDIUM,
        category: CATEGORIES.ALGORITHMS,
        timeLimit: 480, // 8 minutes
        points: 250,
        description: `Implement binary search on a sorted array.

Given a sorted array of integers and a target value, return the index of the target if found, otherwise return -1.

Your algorithm's runtime complexity must be O(log n).`,
        
        examples: [
            {
                input: "nums = [-1,0,3,5,9,12], target = 9",
                output: "4",
                explanation: "9 exists in nums and its index is 4"
            },
            {
                input: "nums = [-1,0,3,5,9,12], target = 2",
                output: "-1",
                explanation: "2 does not exist in nums so return -1"
            }
        ],
        
        methodSignature: "public static int search(int[] nums, int target)",
        
        testCases: [
            { input: [[-1,0,3,5,9,12], 9], expected: "4" },
            { input: [[-1,0,3,5,9,12], 2], expected: "-1" },
            { input: [[5], 5], expected: "0" },
            { input: [[1,3,5,7,9], 7], expected: "3" },
            { input: [[1,2,3,4,5,6], 1], expected: "0" }
        ],
        
        starterCode: `public static int search(int[] nums, int target) {
    // Implement binary search here
    return -1;
}`
    },

    // ═══ HARD QUESTIONS ═══
    {
        id: 'cw_006',
        title: 'Merge K Sorted Lists',
        difficulty: DIFFICULTY_LEVELS.HARD,
        category: CATEGORIES.DATA_STRUCTURES,
        timeLimit: 900, // 15 minutes
        points: 400,
        description: `You are given an array of k linked-lists, each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.

Note: For this challenge, represent lists as arrays for simplicity.`,
        
        examples: [
            {
                input: "lists = [[1,4,5],[1,3,4],[2,6]]",
                output: "[1,1,2,3,4,4,5,6]",
                explanation: "Merging all sorted arrays into one sorted array"
            }
        ],
        
        methodSignature: "public static int[] mergeKLists(int[][] lists)",
        
        testCases: [
            { input: [[[1,4,5],[1,3,4],[2,6]]], expected: "[1, 1, 2, 3, 4, 4, 5, 6]" },
            { input: [[]], expected: "[]" },
            { input: [[[1],[2],[3]]], expected: "[1, 2, 3]" },
            { input: [[[1,2,3],[4,5,6]]], expected: "[1, 2, 3, 4, 5, 6]" }
        ],
        
        starterCode: `public static int[] mergeKLists(int[][] lists) {
    // Implement merge k sorted lists
    return new int[0];
}`
    },

    // ═══ MORE EASY QUESTIONS ═══
    {
        id: 'cw_007',
        title: 'Reverse String',
        difficulty: DIFFICULTY_LEVELS.EASY,
        category: CATEGORIES.STRINGS,
        timeLimit: 180,
        points: 60,
        description: `Write a function that reverses a string.

The input string is given as a character array. You must do this by modifying the input array in-place.`,
        
        examples: [
            {
                input: '"hello"',
                output: '"olleh"',
                explanation: "Reverse the string"
            }
        ],
        
        methodSignature: "public static String reverseString(String s)",
        
        testCases: [
            { input: ["hello"], expected: "olleh" },
            { input: ["world"], expected: "dlrow" },
            { input: ["a"], expected: "a" },
            { input: [""], expected: "" },
            { input: ["racecar"], expected: "racecar" }
        ],
        
        starterCode: `public static String reverseString(String s) {
    // Your code here
    return "";
}`
    },

    {
        id: 'cw_008',
        title: 'FizzBuzz',
        difficulty: DIFFICULTY_LEVELS.EASY,
        category: CATEGORIES.ALGORITHMS,
        timeLimit: 240,
        points: 80,
        description: `Write a program that returns "Fizz" for multiples of 3, "Buzz" for multiples of 5, "FizzBuzz" for multiples of both, and the number itself otherwise.

Given an integer n, return the FizzBuzz value for that number.`,
        
        examples: [
            {
                input: "3",
                output: '"Fizz"',
                explanation: "3 is divisible by 3"
            },
            {
                input: "5",
                output: '"Buzz"',
                explanation: "5 is divisible by 5"
            },
            {
                input: "15",
                output: '"FizzBuzz"',
                explanation: "15 is divisible by both 3 and 5"
            }
        ],
        
        methodSignature: "public static String fizzBuzz(int n)",
        
        testCases: [
            { input: [3], expected: "Fizz" },
            { input: [5], expected: "Buzz" },
            { input: [15], expected: "FizzBuzz" },
            { input: [7], expected: "7" },
            { input: [30], expected: "FizzBuzz" }
        ],
        
        starterCode: `public static String fizzBuzz(int n) {
    // Your code here
    return "";
}`
    },

    {
        id: 'cw_009',
        title: 'Find Maximum',
        difficulty: DIFFICULTY_LEVELS.EASY,
        category: CATEGORIES.ARRAYS,
        timeLimit: 180,
        points: 60,
        description: `Given an array of integers, find and return the maximum value.

The array will have at least one element.`,
        
        examples: [
            {
                input: "[1, 5, 3, 9, 2]",
                output: "9",
                explanation: "9 is the largest number"
            }
        ],
        
        methodSignature: "public static int findMax(int[] nums)",
        
        testCases: [
            { input: [[1,5,3,9,2]], expected: "9" },
            { input: [[10]], expected: "10" },
            { input: [[-5,-2,-10,-1]], expected: "-1" },
            { input: [[100,200,50,75]], expected: "200" },
            { input: [[7,7,7,7]], expected: "7" }
        ],
        
        starterCode: `public static int findMax(int[] nums) {
    // Your code here
    return 0;
}`
    },

    // ═══ MORE MEDIUM QUESTIONS ═══
    {
        id: 'cw_010',
        title: 'Longest Common Prefix',
        difficulty: DIFFICULTY_LEVELS.MEDIUM,
        category: CATEGORIES.STRINGS,
        timeLimit: 420,
        points: 200,
        description: `Write a function to find the longest common prefix string amongst an array of strings.

If there is no common prefix, return an empty string "".`,
        
        examples: [
            {
                input: '["flower","flow","flight"]',
                output: '"fl"',
                explanation: "The longest common prefix is 'fl'"
            },
            {
                input: '["dog","racecar","car"]',
                output: '""',
                explanation: "There is no common prefix"
            }
        ],
        
        methodSignature: "public static String longestCommonPrefix(String[] strs)",
        
        testCases: [
            { input: [["flower","flow","flight"]], expected: "fl" },
            { input: [["dog","racecar","car"]], expected: "" },
            { input: [["test"]], expected: "test" },
            { input: [["abc","abc","abc"]], expected: "abc" },
            { input: [["a","ab","abc"]], expected: "a" }
        ],
        
        starterCode: `public static String longestCommonPrefix(String[] strs) {
    // Your code here
    return "";
}`
    },

    {
        id: 'cw_011',
        title: 'Remove Duplicates',
        difficulty: DIFFICULTY_LEVELS.MEDIUM,
        category: CATEGORIES.ARRAYS,
        timeLimit: 360,
        points: 180,
        description: `Given a sorted array, remove the duplicates in-place and return the new length.

Do not allocate extra space - you must modify the input array in-place.

For this challenge, return a string representation of the unique elements.`,
        
        examples: [
            {
                input: "[1,1,2,2,3]",
                output: "[1, 2, 3]",
                explanation: "Remove duplicates, keep unique elements"
            }
        ],
        
        methodSignature: "public static String removeDuplicates(int[] nums)",
        
        testCases: [
            { input: [[1,1,2]], expected: "[1, 2]" },
            { input: [[1,1,2,2,3]], expected: "[1, 2, 3]" },
            { input: [[1,2,3]], expected: "[1, 2, 3]" },
            { input: [[5,5,5,5]], expected: "[5]" },
            { input: [[1]], expected: "[1]" }
        ],
        
        starterCode: `public static String removeDuplicates(int[] nums) {
    // Your code here
    return "";
}`
    }
];

// Utility functions for question management
const getQuestionsByDifficulty = (difficulty) => {
    return codeWarQuestions.filter(q => q.difficulty === difficulty);
};

const getQuestionsByCategory = (category) => {
    return codeWarQuestions.filter(q => q.category === category);
};

const getRandomQuestions = (count, difficulty = null) => {
    let pool = codeWarQuestions;
    if (difficulty) {
        pool = getQuestionsByDifficulty(difficulty);
    }
    
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const getQuestionById = (id) => {
    return codeWarQuestions.find(q => q.id === id);
};

// ═══ FETCH QUESTIONS FROM GITHUB ═══

/**
 * Fetch questions from a GitHub repository
 * @param {string} url - Raw GitHub URL to JSON file
 * @returns {Promise<Array>} - Array of questions
 */
async function fetchQuestionsFromGitHub(url) {
    try {
        console.log(`[GITHUB] Fetching questions from: ${url}`);
        const response = await axios.get(url, { timeout: 5000 });
        
        if (response.data && Array.isArray(response.data)) {
            console.log(`[GITHUB] Successfully fetched ${response.data.length} questions`);
            return response.data;
        } else if (response.data && response.data.questions) {
            console.log(`[GITHUB] Successfully fetched ${response.data.questions.length} questions`);
            return response.data.questions;
        }
        
        console.log(`[GITHUB] Invalid format from ${url}`);
        return [];
    } catch (error) {
        console.error(`[GITHUB] Failed to fetch from ${url}:`, error.message);
        return [];
    }
}

/**
 * Fetch questions from multiple GitHub sources
 * @returns {Promise<Array>} - Combined array of questions
 */
async function fetchAllGitHubQuestions() {
    const allQuestions = [];
    
    for (const [source, url] of Object.entries(GITHUB_SOURCES)) {
        const questions = await fetchQuestionsFromGitHub(url);
        allQuestions.push(...questions);
    }
    
    return allQuestions;
}

/**
 * Get all available questions (local + GitHub)
 * @param {boolean} includeGitHub - Whether to fetch from GitHub
 * @returns {Promise<Array>} - All questions
 */
async function getAllQuestions(includeGitHub = false) {
    let allQuestions = [...codeWarQuestions];
    
    if (includeGitHub) {
        const githubQuestions = await fetchAllGitHubQuestions();
        allQuestions.push(...githubQuestions);
    }
    
    return allQuestions;
}

/**
 * Fetch questions from a custom URL
 * @param {string} url - URL to JSON file
 * @returns {Promise<Array>} - Array of questions
 */
async function fetchQuestionsFromURL(url) {
    try {
        console.log(`[CUSTOM] Fetching questions from: ${url}`);
        const response = await axios.get(url, { timeout: 5000 });
        
        if (response.data && Array.isArray(response.data)) {
            console.log(`[CUSTOM] Successfully fetched ${response.data.length} questions`);
            return response.data;
        } else if (response.data && response.data.questions) {
            console.log(`[CUSTOM] Successfully fetched ${response.data.questions.length} questions`);
            return response.data.questions;
        }
        
        return [];
    } catch (error) {
        console.error(`[CUSTOM] Failed to fetch from ${url}:`, error.message);
        return [];
    }
}

/**
 * Validate question format
 * @param {Object} question - Question object to validate
 * @returns {boolean} - Whether question is valid
 */
function validateQuestion(question) {
    const required = ['id', 'title', 'difficulty', 'description'];
    
    for (const field of required) {
        if (!question[field]) {
            console.warn(`[VALIDATION] Question "${question.title || 'unknown'}" missing required field: ${field}`);
            return false;
        }
    }
    
    // Check test cases - this is critical
    if (!question.testCases || !Array.isArray(question.testCases) || question.testCases.length === 0) {
        console.warn(`[VALIDATION] Question "${question.title}" has no test cases - REJECTED`);
        console.warn(`[VALIDATION] Question data:`, {
            id: question.id,
            title: question.title,
            source: question.source,
            hasTestCases: !!question.testCases,
            testCaseCount: question.testCases ? question.testCases.length : 0
        });
        return false;
    }
    
    // Validate test case structure
    for (let i = 0; i < question.testCases.length; i++) {
        const testCase = question.testCases[i];
        if (!testCase.input || !testCase.expected) {
            console.warn(`[VALIDATION] Question "${question.title}" test case ${i + 1} missing input or expected`);
            return false;
        }
    }
    
    console.log(`[VALIDATION] ✅ Question "${question.title}" validated successfully (${question.testCases.length} test cases)`);
    return true;
}

/**
 * Get random questions with LeetCode support
 * @param {number} count - Number of questions
 * @param {string} difficulty - Difficulty level
 * @param {boolean} includeGitHub - Whether to include GitHub questions
 * @param {boolean} includeLeetCode - Whether to include LeetCode questions
 * @returns {Promise<Array>} - Random questions
 */
async function getRandomQuestionsWithGitHub(count, difficulty = null, includeGitHub = false, includeLeetCode = false, includeCodeforces = true, includeExercism = true) {
    let pool = [...codeWarQuestions]; // Start with local questions
    
    console.log(`[QUESTIONS] Fetching ${count} questions (difficulty: ${difficulty || 'mixed'})`);
    console.log(`[QUESTIONS] Sources: LeetCode=${includeLeetCode}, Codeforces=${includeCodeforces}, Exercism=${includeExercism}`);
    
    // Add GitHub questions if enabled
    if (includeGitHub) {
        const githubQuestions = await fetchAllGitHubQuestions();
        pool.push(...githubQuestions);
    }
    
    // Add Codeforces problems if enabled (RECOMMENDED - Most reliable)
    if (includeCodeforces) {
        try {
            console.log(`[CODEFORCES] Fetching problems...`);
            const cfProblems = await codeforcesAPI.getRandomProblems(difficulty || 'medium', Math.min(count * 2, 20));
            console.log(`[CODEFORCES] Fetched ${cfProblems.length} problems`);
            
            for (const problem of cfProblems) {
                if (validateQuestion(problem)) {
                    pool.push(problem);
                    console.log(`[CODEFORCES] ✅ Added ${problem.title}`);
                }
            }
        } catch (error) {
            console.error(`[CODEFORCES] Failed to fetch problems:`, error.message);
        }
    }
    
    // Add Exercism exercises if enabled (RECOMMENDED - Has test cases)
    if (includeExercism) {
        try {
            console.log(`[EXERCISM] Fetching exercises...`);
            const exExercises = await exercismAPI.getRandomExercises(difficulty || 'medium', Math.min(count * 2, 15));
            console.log(`[EXERCISM] Fetched ${exExercises.length} exercises`);
            
            for (const exercise of exExercises) {
                if (validateQuestion(exercise)) {
                    pool.push(exercise);
                    console.log(`[EXERCISM] ✅ Added ${exercise.title}`);
                }
            }
        } catch (error) {
            console.error(`[EXERCISM] Failed to fetch exercises:`, error.message);
        }
    }
    
    // Add LeetCode questions if enabled (Less reliable due to test case parsing)
    if (includeLeetCode) {
        try {
            console.log(`[LEETCODE] Fetching ${count * 3} problems (difficulty: ${difficulty || 'all'})`);
            
            // Fetch more than needed to have options after filtering
            const leetcodeProblems = await leetcodeAPI.getCachedProblems(difficulty, count * 3);
            
            console.log(`[LEETCODE] Fetched ${leetcodeProblems.length} problems from LeetCode`);
            
            // Convert a subset to our format (to avoid too many API calls)
            const selectedProblems = leetcodeProblems.slice(0, Math.min(count * 2, leetcodeProblems.length));
            
            for (const problem of selectedProblems) {
                try {
                    console.log(`[LEETCODE] Converting problem: ${problem.title} (${problem.titleSlug})`);
                    const converted = await leetcodeAPI.getCachedProblemDetails(problem.titleSlug);
                    
                    if (converted) {
                        console.log(`[LEETCODE] Converted ${problem.title}:`, {
                            id: converted.id,
                            testCaseCount: converted.testCases ? converted.testCases.length : 0,
                            hasMethodSignature: !!converted.methodSignature,
                            hasStarterCode: !!converted.starterCode
                        });
                        
                        if (validateQuestion(converted)) {
                            pool.push(converted);
                            console.log(`[LEETCODE] ✅ Added ${problem.title} to pool`);
                        } else {
                            console.warn(`[LEETCODE] ❌ ${problem.title} failed validation - skipping`);
                        }
                    } else {
                        console.warn(`[LEETCODE] ❌ Failed to convert ${problem.title} - returned null`);
                    }
                } catch (error) {
                    console.error(`[LEETCODE] ❌ Failed to convert ${problem.title}:`, error.message);
                }
            }
            
            console.log(`[LEETCODE] Successfully added ${pool.length - codeWarQuestions.length} LeetCode problems to pool`);
        } catch (error) {
            console.error(`[LEETCODE] Failed to fetch problems:`, error.message);
        }
    }
    
    // Filter by difficulty if specified
    if (difficulty) {
        pool = pool.filter(q => q.difficulty === difficulty);
    }
    
    // Validate questions
    pool = pool.filter(q => validateQuestion(q));
    
    console.log(`[QUESTIONS] Total pool size: ${pool.length} questions`);
    console.log(`[QUESTIONS] Sources breakdown:`, {
        local: codeWarQuestions.length,
        codeforces: pool.filter(q => q.source === 'codeforces').length,
        exercism: pool.filter(q => q.source === 'exercism').length,
        leetcode: pool.filter(q => q.source === 'leetcode').length
    });
    
    // Shuffle and select
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

/**
 * Fetch LeetCode problems by difficulty
 * @param {string} difficulty - easy, medium, or hard
 * @param {number} limit - Number of problems to fetch
 * @returns {Promise<Array>} - Array of LeetCode problems
 */
async function fetchLeetCodeProblems(difficulty = null, limit = 50) {
    try {
        console.log(`[LEETCODE] Fetching ${limit} ${difficulty || 'all'} problems...`);
        const problems = await leetcodeAPI.getCachedProblems(difficulty, limit);
        console.log(`[LEETCODE] Successfully fetched ${problems.length} problems`);
        return problems;
    } catch (error) {
        console.error(`[LEETCODE] Error:`, error.message);
        return [];
    }
}

/**
 * Get a specific LeetCode problem by title slug
 * @param {string} titleSlug - LeetCode problem slug (e.g., "two-sum")
 * @returns {Promise<Object>} - Converted problem in our format
 */
async function getLeetCodeProblem(titleSlug) {
    try {
        console.log(`[LEETCODE] Fetching problem: ${titleSlug}`);
        const problem = await leetcodeAPI.getCachedProblemDetails(titleSlug);
        
        if (problem && validateQuestion(problem)) {
            console.log(`[LEETCODE] Successfully fetched: ${problem.title}`);
            return problem;
        }
        
        console.warn(`[LEETCODE] Problem ${titleSlug} failed validation`);
        return null;
    } catch (error) {
        console.error(`[LEETCODE] Error fetching ${titleSlug}:`, error.message);
        return null;
    }
}

/**
 * Prefetch and cache popular LeetCode problems
 * @returns {Promise<void>}
 */
async function prefetchLeetCodeProblems() {
    console.log('[LEETCODE] Prefetching popular problems...');
    
    const popularSlugs = [
        'two-sum', 'add-two-numbers', 'longest-substring-without-repeating-characters',
        'median-of-two-sorted-arrays', 'longest-palindromic-substring', 'reverse-integer',
        'palindrome-number', 'container-with-most-water', 'integer-to-roman',
        'roman-to-integer', 'longest-common-prefix', 'three-sum', 'letter-combinations-of-a-phone-number',
        'remove-nth-node-from-end-of-list', 'valid-parentheses', 'merge-two-sorted-lists',
        'generate-parentheses', 'merge-k-sorted-lists', 'swap-nodes-in-pairs',
        'reverse-nodes-in-k-group', 'remove-duplicates-from-sorted-array'
    ];
    
    let cached = 0;
    for (const slug of popularSlugs) {
        try {
            await leetcodeAPI.getCachedProblemDetails(slug);
            cached++;
        } catch (error) {
            console.error(`[LEETCODE] Failed to cache ${slug}`);
        }
    }
    
    console.log(`[LEETCODE] Prefetched ${cached}/${popularSlugs.length} problems`);
}

// Game mode configurations
const GAME_MODES = {
    QUICK_BATTLE: {
        name: 'Quick Battle',
        duration: 600, // 10 minutes
        questionCount: 3,
        difficulties: [DIFFICULTY_LEVELS.EASY, DIFFICULTY_LEVELS.EASY, DIFFICULTY_LEVELS.MEDIUM]
    },
    STANDARD_WAR: {
        name: 'Standard War',
        duration: 1200, // 20 minutes
        questionCount: 5,
        difficulties: [
            DIFFICULTY_LEVELS.EASY, 
            DIFFICULTY_LEVELS.EASY, 
            DIFFICULTY_LEVELS.MEDIUM, 
            DIFFICULTY_LEVELS.MEDIUM, 
            DIFFICULTY_LEVELS.HARD
        ]
    },
    EPIC_SIEGE: {
        name: 'Epic Siege',
        duration: 1800, // 30 minutes
        questionCount: 8,
        difficulties: [
            DIFFICULTY_LEVELS.EASY, 
            DIFFICULTY_LEVELS.EASY, 
            DIFFICULTY_LEVELS.EASY,
            DIFFICULTY_LEVELS.MEDIUM, 
            DIFFICULTY_LEVELS.MEDIUM, 
            DIFFICULTY_LEVELS.MEDIUM,
            DIFFICULTY_LEVELS.HARD,
            DIFFICULTY_LEVELS.HARD
        ]
    }
};

module.exports = {
    codeWarQuestions,
    DIFFICULTY_LEVELS,
    CATEGORIES,
    GAME_MODES,
    GITHUB_SOURCES,
    leetcodeAPI,
    getQuestionsByDifficulty,
    getQuestionsByCategory,
    getRandomQuestions,
    getQuestionById,
    fetchQuestionsFromGitHub,
    fetchAllGitHubQuestions,
    getAllQuestions,
    fetchQuestionsFromURL,
    validateQuestion,
    getRandomQuestionsWithGitHub,
    fetchLeetCodeProblems,
    getLeetCodeProblem,
    prefetchLeetCodeProblems
};