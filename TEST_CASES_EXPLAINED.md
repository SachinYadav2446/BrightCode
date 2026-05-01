# 🧪 Test Cases in Code Wars Arena - Complete Guide

## 📋 Overview

Your Code Wars Arena has **TWO sources** for test cases:

1. **Manual Test Cases** (Local) - You write them
2. **Automatic Test Cases** (LeetCode) - Fetched automatically

---

## 🎯 Current System Status

### ✅ What's Already Automatic

1. **LeetCode Integration** (3000+ problems)
   - Test cases are **automatically fetched** from LeetCode
   - Each problem comes with **real test cases**
   - No manual work needed for LeetCode problems

2. **Test Execution** (Fully Automatic)
   - Java compiler automatically runs all test cases
   - Compares output with expected results
   - Returns pass/fail for each test case

### ✏️ What Needs Manual Work

1. **Local Questions** (6 questions currently)
   - You need to write test cases manually
   - Stored in `server/codeWarQuestions.js`

---

## 📊 Test Case Structure

### Format
```javascript
testCases: [
    { 
        input: [arg1, arg2, ...],  // Arguments to pass to method
        expected: "result"          // Expected output as string
    }
]
```

### Example from Your Code
```javascript
{
    id: 'cw_001',
    title: 'Two Sum',
    testCases: [
        { input: [[2,7,11,15], 9], expected: "[0, 1]" },
        { input: [[3,2,4], 6], expected: "[1, 2]" },
        { input: [[3,3], 6], expected: "[0, 1]" },
        { input: [[1,2,3,4,5], 8], expected: "[2, 4]" },
        { input: [[5,5,5,5], 10], expected: "[0, 1]" }
    ]
}
```

---

## 🔄 How Test Cases Work

### 1. Question Selection
```javascript
// When game starts, questions are selected
const questions = await getRandomQuestionsWithGitHub(
    count,           // Number of questions
    difficulty,      // easy, medium, hard
    includeGitHub,   // false (not used yet)
    includeLeetCode  // true (ENABLED by default)
);
```

### 2. Test Case Sources

#### Source A: Local Questions (Manual)
```javascript
// In server/codeWarQuestions.js
const codeWarQuestions = [
    {
        id: 'cw_001',
        title: 'Two Sum',
        testCases: [
            // YOU WRITE THESE MANUALLY
            { input: [[2,7,11,15], 9], expected: "[0, 1]" }
        ]
    }
];
```

#### Source B: LeetCode (Automatic)
```javascript
// Automatically fetched from LeetCode API
const leetcodeProblems = await leetcodeAPI.getCachedProblems(difficulty, count);

// Each problem includes:
// - title
// - description
// - test cases (AUTOMATIC!)
// - expected outputs (AUTOMATIC!)
```

### 3. Test Execution (Automatic)
```javascript
// In server/javaCompiler.js
async function compileAndRunJava(userCode, testCases) {
    // 1. Compile user's code
    // 2. Run each test case
    // 3. Compare output with expected
    // 4. Return results
}
```

---

## 🎮 Current Question Distribution

### When Game Starts:
```javascript
// Example: 3 questions requested
// System tries to fetch from:

1. LeetCode API (ENABLED by default)
   ↓
   Fetches 3 problems with test cases
   ↓
   ✅ All test cases included automatically

2. If LeetCode fails (fallback):
   ↓
   Uses local questions
   ↓
   ⚠️ Uses manually written test cases
```

---

## 📝 Do You Need to Write Test Cases?

### ✅ NO - If Using LeetCode (Current Default)

**LeetCode is ENABLED by default** in your system:

```javascript
// In server/intraFactionArena.js (line ~300)
async generateQuestionsForRoom(room) {
    const includeLeetCode = true;  // ✅ ENABLED
    const includeGitHub = false;
    
    const questions = await getRandomQuestionsWithGitHub(
        room.questionCount,
        room.difficulty,
        includeGitHub,
        includeLeetCode  // ✅ LeetCode is used
    );
}
```

**Result**: You get 3000+ problems with **automatic test cases**!

### ✏️ YES - If Adding Custom Local Questions

If you want to add your own questions to the local database:

```javascript
// In server/codeWarQuestions.js
const codeWarQuestions = [
    // ... existing questions ...
    
    // YOUR NEW QUESTION
    {
        id: 'cw_007',
        title: 'Your Custom Problem',
        difficulty: DIFFICULTY_LEVELS.EASY,
        category: CATEGORIES.ARRAYS,
        timeLimit: 300,
        points: 100,
        description: 'Problem description here',
        
        // ⚠️ YOU MUST WRITE THESE
        testCases: [
            { input: [/* args */], expected: "result" },
            { input: [/* args */], expected: "result" },
            { input: [/* args */], expected: "result" }
        ],
        
        starterCode: `public static ReturnType methodName(params) {
            // Your code here
        }`
    }
];
```

---

## 🔍 How to Check What's Being Used

### Check Server Logs
When a game starts, you'll see:

```bash
# If using LeetCode:
[LEETCODE] Fetching 3 problems (difficulty: mixed)
[LEETCODE] Fetched 50 problems from LeetCode
[LEETCODE] Successfully added 6 LeetCode problems to pool
[ARENA] Final question set: 3 questions
  1. Two Sum (easy) - leetcode
  2. Valid Parentheses (medium) - leetcode
  3. Merge K Sorted Lists (hard) - leetcode

# If using local:
[ARENA] Final question set: 3 questions
  1. Two Sum (easy) - local
  2. Valid Parentheses (medium) - local
  3. Factorial Calculator (easy) - local
```

---

## 🛠️ How to Add Custom Questions with Test Cases

### Step 1: Open the Questions File
```bash
server/codeWarQuestions.js
```

### Step 2: Add Your Question
```javascript
{
    id: 'cw_007',  // Unique ID
    title: 'Reverse String',
    difficulty: DIFFICULTY_LEVELS.EASY,
    category: CATEGORIES.STRINGS,
    timeLimit: 240,
    points: 80,
    
    description: `Reverse a given string.`,
    
    examples: [
        {
            input: '"hello"',
            output: '"olleh"',
            explanation: "Reverse the string"
        }
    ],
    
    methodSignature: "public static String reverse(String s)",
    
    // ⚠️ WRITE TEST CASES HERE
    testCases: [
        { input: ["hello"], expected: "olleh" },
        { input: ["world"], expected: "dlrow" },
        { input: [""], expected: "" },
        { input: ["a"], expected: "a" },
        { input: ["12345"], expected: "54321" }
    ],
    
    starterCode: `public static String reverse(String s) {
    // Your code here
    return "";
}`
}
```

### Step 3: Test Your Question
```javascript
// In your code, test the question
const question = getQuestionById('cw_007');
console.log('Test cases:', question.testCases);
```

---

## 🎯 Best Practices for Writing Test Cases

### 1. Cover Edge Cases
```javascript
testCases: [
    { input: [[]],           expected: "[]" },        // Empty array
    { input: [[1]],          expected: "[1]" },       // Single element
    { input: [[1,2,3]],      expected: "[1, 2, 3]" }, // Normal case
    { input: [[1,1,1]],      expected: "[1, 1, 1]" }, // Duplicates
    { input: [[-1,-2,-3]],   expected: "[-1, -2, -3]" } // Negatives
]
```

### 2. Match Output Format Exactly
```javascript
// ❌ WRONG - Inconsistent spacing
{ input: [[1,2]], expected: "[1,2]" }
{ input: [[3,4]], expected: "[3, 4]" }  // Different spacing!

// ✅ CORRECT - Consistent format
{ input: [[1,2]], expected: "[1, 2]" }
{ input: [[3,4]], expected: "[3, 4]" }
```

### 3. Test Boundary Values
```javascript
testCases: [
    { input: [0],           expected: "1" },      // Minimum
    { input: [1],           expected: "1" },      // Base case
    { input: [5],           expected: "120" },    // Normal
    { input: [10],          expected: "3628800" }, // Large
    { input: [20],          expected: "2432902008176640000" } // Max
]
```

### 4. Include Typical Cases
```javascript
testCases: [
    { input: ["()"],        expected: "true" },   // Simple valid
    { input: ["()[]{}"],    expected: "true" },   // Multiple types
    { input: ["(]"],        expected: "false" },  // Mismatched
    { input: ["([)]"],      expected: "false" },  // Wrong order
    { input: ["{[]}"],      expected: "true" }    // Nested valid
]
```

---

## 🔧 Test Case Validation

Your system automatically validates test cases:

```javascript
// In server/codeWarQuestions.js
function validateQuestion(question) {
    const required = ['id', 'title', 'difficulty', 'description', 'testCases'];
    
    // Check required fields
    for (const field of required) {
        if (!question[field]) {
            console.warn(`Question missing required field: ${field}`);
            return false;
        }
    }
    
    // Check test cases exist
    if (!Array.isArray(question.testCases) || question.testCases.length === 0) {
        console.warn(`Question has no test cases`);
        return false;
    }
    
    return true;
}
```

---

## 📊 Test Case Execution Flow

```
User Submits Code
       ↓
Server receives submission
       ↓
Load question's test cases
       ↓
For each test case:
    ├─ Compile user code
    ├─ Run with test input
    ├─ Compare output with expected
    └─ Record pass/fail
       ↓
Return results to user
       ↓
Update score if all passed
```

---

## 🎮 Example: Complete Test Case Flow

### 1. Question Definition
```javascript
{
    id: 'cw_001',
    title: 'Two Sum',
    testCases: [
        { input: [[2,7,11,15], 9], expected: "[0, 1]" }
    ]
}
```

### 2. User Submits Code
```java
public static int[] twoSum(int[] nums, int target) {
    for (int i = 0; i < nums.length; i++) {
        for (int j = i + 1; j < nums.length; j++) {
            if (nums[i] + nums[j] == target) {
                return new int[]{i, j};
            }
        }
    }
    return new int[]{};
}
```

### 3. Test Execution (Automatic)
```javascript
// Server automatically:
1. Compiles the code
2. Runs: twoSum([2,7,11,15], 9)
3. Gets output: [0, 1]
4. Compares with expected: "[0, 1]"
5. Result: ✅ PASS
```

### 4. Response to User
```javascript
{
    success: true,
    results: [
        {
            passed: true,
            input: [[2,7,11,15], 9],
            expected: "[0, 1]",
            actual: "[0, 1]",
            error: null
        }
    ],
    message: "All test cases passed!",
    points: 100
}
```

---

## 🚀 Quick Answer to Your Question

### "Do we need to write test cases or is it automatic?"

**Answer**: **It depends on the question source:**

| Question Source | Test Cases | Your Work |
|----------------|------------|-----------|
| **LeetCode** (Default) | ✅ Automatic | ❌ None needed |
| **Local Questions** | ✏️ Manual | ✅ You write them |
| **GitHub** (Optional) | ✏️ Manual | ✅ You write them |

### Current Setup:
- ✅ **LeetCode is ENABLED** (default)
- ✅ **3000+ problems available**
- ✅ **All test cases automatic**
- ✅ **No manual work needed**

### If You Want Custom Questions:
- ✏️ Add to `server/codeWarQuestions.js`
- ✏️ Write test cases manually
- ✏️ Follow the format shown above

---

## 📝 Summary

### What's Automatic:
1. ✅ LeetCode problem fetching
2. ✅ LeetCode test cases
3. ✅ Test execution
4. ✅ Output comparison
5. ✅ Score calculation

### What's Manual:
1. ✏️ Custom local questions (optional)
2. ✏️ Test cases for custom questions (optional)

### Recommendation:
**Stick with LeetCode** (current default) - you get 3000+ problems with automatic test cases and don't need to write anything!

---

## 🔗 Related Files

- `server/codeWarQuestions.js` - Question database
- `server/leetcodeAPI.js` - LeetCode integration
- `server/javaCompiler.js` - Test execution
- `server/intraFactionArena.js` - Game logic

---

**Status**: ✅ Test cases are **mostly automatic** via LeetCode!  
**Your Work**: ❌ None needed unless adding custom questions
