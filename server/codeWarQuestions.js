// Code Wars Arena - Question Database
// Curated coding challenges for faction battles

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
    getQuestionsByDifficulty,
    getQuestionsByCategory,
    getRandomQuestions,
    getQuestionById
};