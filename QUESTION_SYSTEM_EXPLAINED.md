# Code Wars Arena - Question System Explained

## 🎯 Overview

The Code Wars Arena uses **REAL test cases** with **actual Java compilation and execution**. This is not a fake system - it genuinely compiles and runs your Java code against predefined test cases!

---

## 📚 Question Database

### Location
`server/codeWarQuestions.js`

### Current Questions
The system currently has **6 curated coding challenges**:

#### Easy (3 questions)
1. **Two Sum** - Array manipulation (100 points)
2. **Palindrome Check** - String processing (80 points)
3. **Factorial Calculator** - Math/recursion (60 points)

#### Medium (2 questions)
4. **Valid Parentheses** - Stack data structure (200 points)
5. **Binary Search** - Algorithm implementation (250 points)

#### Hard (1 question)
6. **Merge K Sorted Lists** - Advanced data structures (400 points)

---

## 🔍 Question Structure

Each question contains:

```javascript
{
    id: 'cw_001',                    // Unique identifier
    title: 'Two Sum',                // Display name
    difficulty: 'easy',              // easy | medium | hard
    category: 'arrays',              // arrays | strings | math | algorithms | data_structures
    timeLimit: 300,                  // Time limit in seconds (5 minutes)
    points: 100,                     // Points awarded for solving
    
    description: "...",              // Problem description
    
    examples: [                      // Example inputs/outputs for understanding
        {
            input: "nums = [2,7,11,15], target = 9",
            output: "[0, 1]",
            explanation: "Because nums[0] + nums[1] = 2 + 7 = 9"
        }
    ],
    
    methodSignature: "public static int[] twoSum(int[] nums, int target)",
    
    testCases: [                     // REAL test cases for validation
        { input: [[2,7,11,15], 9], expected: "[0, 1]" },
        { input: [[3,2,4], 6], expected: "[1, 2]" },
        { input: [[3,3], 6], expected: "[0, 1]" },
        { input: [[1,2,3,4,5], 8], expected: "[2, 4]" },
        { input: [[5,5,5,5], 10], expected: "[0, 1]" }
    ],
    
    starterCode: "..."               // Template code to help users start
}
```

---

## ✅ Test Cases - REAL, Not Fake!

### How Test Cases Work

1. **User writes Java code** in the editor
2. **Code is sent to server** when submitted
3. **Server compiles the Java code** using `javac`
4. **Server runs the compiled code** against each test case
5. **Output is compared** with expected results
6. **Pass/Fail determined** based on exact match

### Example Test Case Execution

**Question**: Two Sum
```javascript
testCases: [
    { input: [[2,7,11,15], 9], expected: "[0, 1]" },
    { input: [[3,2,4], 6], expected: "[1, 2]" }
]
```

**What Happens:**

1. **Compilation Phase**:
   ```bash
   javac Solution.java
   ```
   - If compilation fails → User gets error message
   - If compilation succeeds → Proceed to execution

2. **Execution Phase** (for each test case):
   ```bash
   java Solution 0  # Run test case 0
   java Solution 1  # Run test case 1
   ```
   
3. **Validation**:
   - Test Case 1: `twoSum([2,7,11,15], 9)` → Output: `[0, 1]` → ✅ PASS
   - Test Case 2: `twoSum([3,2,4], 6)` → Output: `[1, 2]` → ✅ PASS

4. **Result**:
   - All tests pass → User gets points
   - Any test fails → User gets feedback

---

## 🔧 Java Compiler System

### Location
`server/javaCompiler.js`

### How It Works

```javascript
async function compileAndRunJava(userCode, testCases) {
    // 1. Create temporary Java file
    const javaFile = `Solution${uniqueId}.java`;
    
    // 2. Write user's code to file
    await fs.writeFile(javaFile, userCode);
    
    // 3. Compile with javac
    exec(`javac "${javaFile}"`, (error, stdout, stderr) => {
        if (error) {
            return { success: false, error: 'Compilation failed' };
        }
        
        // 4. Run each test case
        for (let testCase of testCases) {
            exec(`java Solution ${testCaseIndex}`, (error, stdout) => {
                const output = stdout.trim();
                const expected = testCase.expected;
                
                // 5. Compare output with expected
                if (output === expected) {
                    results.push({ passed: true });
                } else {
                    results.push({ 
                        passed: false,
                        expected: expected,
                        actual: output
                    });
                }
            });
        }
    });
    
    // 6. Return results
    return {
        success: allTestsPassed,
        results: results
    };
}
```

### Real Compilation Errors

The system catches real Java errors:

- **Syntax Errors**: Missing semicolons, braces
- **Type Errors**: Return type mismatch
- **Runtime Errors**: NullPointerException, ArrayIndexOutOfBounds
- **Logic Errors**: Wrong output (test case fails)

---

## 🎲 Question Selection

### How Questions Are Selected

When a game starts, questions are selected based on:

1. **Difficulty Setting**:
   - `easy` - Only easy questions
   - `medium` - Only medium questions
   - `hard` - Only hard questions
   - `mixed` - Mix of difficulties (recommended)

2. **Question Count**:
   - User chooses 1-10 questions
   - System randomly selects from available pool

3. **Mixed Difficulty Distribution**:
   ```javascript
   // For 3 questions (Quick Battle)
   - 60% Easy (2 questions)
   - 40% Medium (1 question)
   
   // For 5 questions (Standard War)
   - 40% Easy (2 questions)
   - 40% Medium (2 questions)
   - 20% Hard (1 question)
   
   // For 8 questions (Epic Siege)
   - 30% Easy (3 questions)
   - 40% Medium (3 questions)
   - 30% Hard (2 questions)
   ```

### Selection Code

```javascript
// From server/intraFactionArena.js
async generateQuestionsForRoom(room) {
    const questions = [];
    
    if (room.difficulty === 'mixed') {
        // Calculate difficulty distribution
        const difficulties = [];
        const count = room.questionCount;
        
        if (count <= 3) {
            difficulties.push(...Array(Math.ceil(count * 0.6)).fill('easy'));
            difficulties.push(...Array(Math.floor(count * 0.4)).fill('medium'));
        } else if (count <= 5) {
            difficulties.push(...Array(Math.ceil(count * 0.4)).fill('easy'));
            difficulties.push(...Array(Math.ceil(count * 0.4)).fill('medium'));
            difficulties.push(...Array(Math.floor(count * 0.2)).fill('hard'));
        } else {
            difficulties.push(...Array(Math.ceil(count * 0.3)).fill('easy'));
            difficulties.push(...Array(Math.ceil(count * 0.4)).fill('medium'));
            difficulties.push(...Array(Math.floor(count * 0.3)).fill('hard'));
        }
        
        // Shuffle and select
        for (const difficulty of difficulties) {
            const randomQuestions = getRandomQuestions(1, difficulty);
            questions.push(randomQuestions[0]);
        }
    } else {
        // Single difficulty
        const randomQuestions = getRandomQuestions(room.questionCount, room.difficulty);
        questions.push(...randomQuestions);
    }
    
    room.questions = questions;
}
```

---

## 🏆 Scoring System

### Points Per Question

- **Easy**: 60-100 points
- **Medium**: 200-250 points
- **Hard**: 400+ points

### How Points Are Awarded

1. **All test cases must pass** to get points
2. **Partial credit is NOT given** (all or nothing)
3. **First to solve gets the points**
4. **Team score = Sum of all player scores**

### Example Scoring

**Game with 3 questions:**
- Question 1 (Easy): 100 points
- Question 2 (Easy): 80 points
- Question 3 (Medium): 200 points

**Player A:**
- Solves Q1 → +100 points
- Solves Q2 → +80 points
- Fails Q3 → +0 points
- **Total: 180 points**

**Player B:**
- Fails Q1 → +0 points
- Solves Q2 → +80 points
- Solves Q3 → +200 points
- **Total: 280 points**

**Winner: Player B** 🏆

---

## 🔍 Test Case Validation

### Exact Match Required

Test cases use **exact string matching**:

```javascript
const passed = output.trim() === expected.trim();
```

**Examples:**

✅ **PASS**:
- Output: `[0, 1]` | Expected: `[0, 1]`
- Output: `true` | Expected: `true`
- Output: `120` | Expected: `120`

❌ **FAIL**:
- Output: `[0,1]` | Expected: `[0, 1]` (spacing matters)
- Output: `True` | Expected: `true` (case matters)
- Output: `120.0` | Expected: `120` (format matters)

### Multiple Test Cases

Each question has **5 test cases** on average:
- **Visible examples** (shown to user): 2-3
- **Hidden test cases** (not shown): 2-3

This prevents hardcoding solutions!

---

## 🚀 Adding New Questions

### How to Add Questions

1. **Open** `server/codeWarQuestions.js`

2. **Add new question object**:
```javascript
{
    id: 'cw_007',
    title: 'Your Question Title',
    difficulty: DIFFICULTY_LEVELS.MEDIUM,
    category: CATEGORIES.ALGORITHMS,
    timeLimit: 420,
    points: 200,
    description: "Your problem description...",
    examples: [
        {
            input: "example input",
            output: "example output",
            explanation: "why this is the answer"
        }
    ],
    methodSignature: "public static ReturnType methodName(params)",
    testCases: [
        { input: [arg1, arg2], expected: "expected output" },
        { input: [arg1, arg2], expected: "expected output" },
        // Add 5+ test cases
    ],
    starterCode: `public static ReturnType methodName(params) {
    // Your code here
    return defaultValue;
}`
}
```

3. **Test the question** by creating a room and solving it

4. **Verify test cases** work correctly

---

## 📊 Question Statistics

### Current Database Stats

- **Total Questions**: 6
- **Easy**: 3 (50%)
- **Medium**: 2 (33%)
- **Hard**: 1 (17%)

### Categories

- **Arrays**: 1 question
- **Strings**: 1 question
- **Math**: 1 question
- **Algorithms**: 1 question
- **Data Structures**: 2 questions

### Average Test Cases Per Question

- **5 test cases** per question
- **Total test cases**: 30

---

## ✨ Summary

### Is It Real?

**YES!** The Code Wars Arena uses:

✅ **Real Java compilation** with `javac`
✅ **Real code execution** with `java`
✅ **Real test cases** with actual inputs/outputs
✅ **Real validation** by comparing outputs
✅ **Real error messages** from Java compiler

### Not Fake!

❌ **NOT** simulated execution
❌ **NOT** fake test results
❌ **NOT** predetermined outcomes
❌ **NOT** client-side validation only

### How to Verify

1. **Submit wrong code** → You'll get real compilation errors
2. **Submit partially correct code** → Some tests pass, some fail
3. **Check server logs** → See actual `javac` and `java` commands
4. **Look at test results** → See actual vs expected outputs

---

## 🎓 For Developers

### Want to See It in Action?

**Server logs show real execution:**
```bash
[JAVA] Compiling: Solution12345.java
[JAVA] Running test case 0: java Solution12345 0
[JAVA] Output: [0, 1]
[JAVA] Expected: [0, 1]
[JAVA] Result: PASS ✅
```

### Want to Add More Questions?

1. Study existing questions in `codeWarQuestions.js`
2. Follow the same structure
3. Add comprehensive test cases
4. Test thoroughly before deploying

---

**Last Updated**: May 1, 2026
**Question Count**: 6 (expandable)
**Test Cases**: Real Java execution
**Status**: Production Ready ✅
