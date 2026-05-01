# 🎨 Test Cases - Visual Flow Diagram

## 🔄 Complete Test Case System Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    GAME STARTS                                   │
│              (Player clicks "Start Game")                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              QUESTION GENERATION                                 │
│                                                                  │
│  generateQuestionsForRoom(room)                                 │
│  ├─ questionCount: 3                                            │
│  ├─ difficulty: "mixed"                                         │
│  ├─ includeLeetCode: true  ✅ ENABLED                           │
│  └─ includeGitHub: false                                        │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  LEETCODE API    │          │  LOCAL QUESTIONS │
│  (Automatic)     │          │  (Manual)        │
├──────────────────┤          ├──────────────────┤
│ ✅ 3000+ problems│          │ ✏️ 6 problems    │
│ ✅ Auto test cases│         │ ✏️ Manual tests  │
│ ✅ Real problems │          │ ✏️ You write them│
└────────┬─────────┘          └────────┬─────────┘
         │                              │
         │    ┌─────────────────────────┘
         │    │
         ▼    ▼
┌─────────────────────────────────────────────────────────────────┐
│              QUESTION POOL CREATED                               │
│                                                                  │
│  [Question 1] Two Sum (easy) - leetcode                         │
│  [Question 2] Valid Parentheses (medium) - leetcode             │
│  [Question 3] Merge K Lists (hard) - leetcode                   │
│                                                                  │
│  Each question includes:                                         │
│  ├─ title                                                        │
│  ├─ description                                                  │
│  ├─ examples                                                     │
│  ├─ testCases ✅ (5-10 test cases per question)                 │
│  └─ starterCode                                                  │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                  GAME ACTIVE                                     │
│              (Players see questions)                             │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              PLAYER WRITES CODE                                  │
│                                                                  │
│  public static int[] twoSum(int[] nums, int target) {           │
│      // Player's solution here                                   │
│      return new int[]{0, 1};                                     │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              PLAYER CLICKS "SUBMIT"                              │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              SERVER RECEIVES SUBMISSION                          │
│                                                                  │
│  POST /code-wars/submit-solution                                │
│  {                                                               │
│    questionId: "cw_001",                                         │
│    code: "public static int[] twoSum(...) { ... }"              │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              LOAD QUESTION & TEST CASES                          │
│                                                                  │
│  const question = room.questions.find(q => q.id === questionId);│
│  const testCases = question.testCases;                          │
│                                                                  │
│  testCases = [                                                   │
│    { input: [[2,7,11,15], 9], expected: "[0, 1]" },            │
│    { input: [[3,2,4], 6], expected: "[1, 2]" },                │
│    { input: [[3,3], 6], expected: "[0, 1]" },                  │
│    { input: [[1,2,3,4,5], 8], expected: "[2, 4]" },            │
│    { input: [[5,5,5,5], 10], expected: "[0, 1]" }              │
│  ]                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              COMPILE & RUN TESTS                                 │
│              (javaCompiler.js)                                   │
│                                                                  │
│  compileAndRunJava(userCode, testCases)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  STEP 1: COMPILE │          │  STEP 2: RUN     │
├──────────────────┤          ├──────────────────┤
│ javac Solution.  │          │ For each test:   │
│ java             │          │                  │
│                  │          │ Test 1:          │
│ ✅ Success       │──────────▶│ Run with input   │
│ or               │          │ Get output       │
│ ❌ Syntax Error  │          │ Compare expected │
└──────────────────┘          │                  │
                              │ Test 2:          │
                              │ Run with input   │
                              │ Get output       │
                              │ Compare expected │
                              │                  │
                              │ ... (all tests)  │
                              └────────┬─────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────┐
│              TEST RESULTS                                        │
│                                                                  │
│  results = [                                                     │
│    {                                                             │
│      passed: true,                                               │
│      input: [[2,7,11,15], 9],                                   │
│      expected: "[0, 1]",                                         │
│      actual: "[0, 1]",                                           │
│      error: null                                                 │
│    },                                                            │
│    {                                                             │
│      passed: true,                                               │
│      input: [[3,2,4], 6],                                       │
│      expected: "[1, 2]",                                         │
│      actual: "[1, 2]",                                           │
│      error: null                                                 │
│    },                                                            │
│    ... (all 5 tests)                                             │
│  ]                                                               │
│                                                                  │
│  allPassed = results.every(r => r.passed)                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
         ▼                               ▼
┌──────────────────┐          ┌──────────────────┐
│  ALL PASSED ✅   │          │  SOME FAILED ❌  │
├──────────────────┤          ├──────────────────┤
│ success: true    │          │ success: false   │
│ points: +100     │          │ points: 0        │
│ message: "All    │          │ message: "Some   │
│ tests passed!"   │          │ tests failed"    │
└────────┬─────────┘          └────────┬─────────┘
         │                              │
         └───────────────┬──────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              RESPONSE TO PLAYER                                  │
│                                                                  │
│  {                                                               │
│    success: true/false,                                          │
│    results: [...],                                               │
│    points: 100,                                                  │
│    totalScore: 250                                               │
│  }                                                               │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              UPDATE GAME STATE                                   │
│                                                                  │
│  If success:                                                     │
│  ├─ player.score += points                                       │
│  ├─ player.questionsCompleted++                                  │
│  ├─ team.score += points                                         │
│  └─ Notify all players                                           │
│                                                                  │
│  If failed:                                                      │
│  └─ Show error message                                           │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              PLAYER SEES RESULT                                  │
│                                                                  │
│  ✅ "All test cases passed! +100 points"                        │
│  or                                                              │
│  ❌ "Test case 3 failed: Expected [1, 2] but got [2, 1]"       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🎯 Test Case Sources Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│                    LEETCODE (Automatic)                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✅ 3000+ problems available                                     │
│  ✅ Test cases included automatically                            │
│  ✅ Real-world problems                                          │
│  ✅ Multiple difficulty levels                                   │
│  ✅ No manual work needed                                        │
│                                                                  │
│  Example:                                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Problem: Two Sum                                        │    │
│  │ Test Cases (Automatic):                                 │    │
│  │   1. [2,7,11,15], 9 → [0, 1]                           │    │
│  │   2. [3,2,4], 6 → [1, 2]                               │    │
│  │   3. [3,3], 6 → [0, 1]                                 │    │
│  │   ... (10+ test cases)                                  │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Status: ✅ ENABLED by default                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│                    LOCAL QUESTIONS (Manual)                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ✏️ 6 problems currently                                         │
│  ✏️ Test cases written manually                                  │
│  ✏️ Custom problems                                              │
│  ✏️ You control everything                                       │
│  ✏️ Requires manual work                                         │
│                                                                  │
│  Example:                                                        │
│  ┌────────────────────────────────────────────────────────┐    │
│  │ Problem: Factorial Calculator                           │    │
│  │ Test Cases (Manual):                                    │    │
│  │   testCases: [                                          │    │
│  │     { input: [0], expected: "1" },      ← You write    │    │
│  │     { input: [5], expected: "120" },    ← You write    │    │
│  │     { input: [10], expected: "3628800" } ← You write   │    │
│  │   ]                                                     │    │
│  └────────────────────────────────────────────────────────┘    │
│                                                                  │
│  Status: ⚠️ Fallback only                                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Test Case Execution Detail

```
┌─────────────────────────────────────────────────────────────────┐
│              TEST CASE EXECUTION FLOW                            │
└─────────────────────────────────────────────────────────────────┘

Test Case: { input: [[2,7,11,15], 9], expected: "[0, 1]" }

Step 1: Generate Test Harness
┌────────────────────────────────────────────────────────────┐
│ public class Solution {                                     │
│     // User's code                                          │
│     public static int[] twoSum(int[] nums, int target) {   │
│         // ... player's solution ...                        │
│     }                                                       │
│                                                             │
│     // Auto-generated test harness                          │
│     public static void main(String[] args) {               │
│         int[] result = twoSum(                             │
│             new int[]{2,7,11,15},  ← From test case input  │
│             9                       ← From test case input  │
│         );                                                  │
│         System.out.println(Arrays.toString(result));       │
│     }                                                       │
│ }                                                           │
└────────────────────────────────────────────────────────────┘

Step 2: Compile
┌────────────────────────────────────────────────────────────┐
│ $ javac Solution.java                                       │
│                                                             │
│ ✅ Compilation successful                                   │
│ or                                                          │
│ ❌ Syntax Error: Missing semicolon                          │
└────────────────────────────────────────────────────────────┘

Step 3: Execute
┌────────────────────────────────────────────────────────────┐
│ $ java Solution                                             │
│                                                             │
│ Output: [0, 1]                                              │
└────────────────────────────────────────────────────────────┘

Step 4: Compare
┌────────────────────────────────────────────────────────────┐
│ Expected: "[0, 1]"                                          │
│ Actual:   "[0, 1]"                                          │
│                                                             │
│ Match? ✅ YES → Test PASSED                                 │
└────────────────────────────────────────────────────────────┘

Step 5: Repeat for All Test Cases
┌────────────────────────────────────────────────────────────┐
│ Test 1: ✅ PASS                                             │
│ Test 2: ✅ PASS                                             │
│ Test 3: ✅ PASS                                             │
│ Test 4: ✅ PASS                                             │
│ Test 5: ✅ PASS                                             │
│                                                             │
│ Result: ALL PASSED → Award points                          │
└────────────────────────────────────────────────────────────┘
```

---

## 🎮 Player Experience

```
┌─────────────────────────────────────────────────────────────────┐
│                    PLAYER VIEW                                   │
└─────────────────────────────────────────────────────────────────┘

1. Game Starts
   ↓
   Player sees: "Two Sum" problem
   Player sees: Description, examples, starter code
   Player DOESN'T see: Test cases (hidden)

2. Player Writes Code
   ↓
   public static int[] twoSum(int[] nums, int target) {
       // Solution here
   }

3. Player Clicks "Submit"
   ↓
   Loading... (Running tests)

4. Player Sees Result
   ↓
   ┌─────────────────────────────────────────────────────┐
   │ ✅ All test cases passed!                           │
   │                                                      │
   │ Test 1: ✅ PASS                                      │
   │ Test 2: ✅ PASS                                      │
   │ Test 3: ✅ PASS                                      │
   │ Test 4: ✅ PASS                                      │
   │ Test 5: ✅ PASS                                      │
   │                                                      │
   │ +100 points                                          │
   └─────────────────────────────────────────────────────┘

   or

   ┌─────────────────────────────────────────────────────┐
   │ ❌ Some test cases failed                           │
   │                                                      │
   │ Test 1: ✅ PASS                                      │
   │ Test 2: ✅ PASS                                      │
   │ Test 3: ❌ FAIL                                      │
   │   Input: [3, 3], 6                                  │
   │   Expected: [0, 1]                                   │
   │   Got: [1, 0]                                        │
   │                                                      │
   │ Try again!                                           │
   └─────────────────────────────────────────────────────┘
```

---

## 🔑 Key Takeaways

### ✅ What's Automatic:
```
┌─────────────────────────────────────────┐
│ 1. Question fetching from LeetCode      │
│ 2. Test case generation                 │
│ 3. Code compilation                     │
│ 4. Test execution                       │
│ 5. Output comparison                    │
│ 6. Score calculation                    │
│ 7. Result notification                  │
└─────────────────────────────────────────┘
```

### ✏️ What's Manual (Optional):
```
┌─────────────────────────────────────────┐
│ 1. Adding custom local questions        │
│ 2. Writing test cases for custom Qs     │
│ 3. Defining expected outputs            │
└─────────────────────────────────────────┘
```

### 🎯 Recommendation:
```
┌─────────────────────────────────────────┐
│ Use LeetCode (current default)          │
│ ✅ 3000+ problems                        │
│ ✅ Automatic test cases                  │
│ ✅ Zero manual work                      │
│ ✅ Production-ready                      │
└─────────────────────────────────────────┘
```

---

**Status**: ✅ Test cases are **mostly automatic**!  
**Your Work**: ❌ None needed for LeetCode problems  
**Manual Work**: ✏️ Only if adding custom questions
