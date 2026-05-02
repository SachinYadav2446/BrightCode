# 🎯 Question Deduplication System - Complete Guide

## 🚫 Problem Solved

**Before**: Same questions appeared repeatedly in contests
- ❌ Same question could appear multiple times in one contest
- ❌ Same questions appeared in consecutive contests
- ❌ Players saw the same problems over and over

**After**: Smart deduplication system
- ✅ No duplicate questions within a single contest
- ✅ No repeated questions across recent contests (last 50)
- ✅ Fresh questions every time
- ✅ Per-faction history tracking

---

## 🔧 How It Works

### 1. Dual-Level Deduplication

```javascript
// Level 1: Within Contest (usedQuestionIds)
const usedQuestionIds = new Set();
// Prevents: Q1, Q2, Q1 ❌

// Level 2: Across Contests (factionHistory)
const factionHistory = this.questionHistory.get(factionId);
// Prevents: Contest 1: Q1, Q2, Q3
//           Contest 2: Q1, Q4, Q5 ❌
```

### 2. Per-Faction History

Each faction has its own question history:
```javascript
this.questionHistory = new Map();
// Structure:
// factionId1 -> Set([q1, q2, q3, ...])
// factionId2 -> Set([q5, q6, q7, ...])
// factionId3 -> Set([q9, q10, q11, ...])
```

**Why per-faction?**
- Different factions can have same questions
- History doesn't interfere between factions
- Each faction gets fresh experience

### 3. Rolling History (Last 50 Questions)

```javascript
this.maxHistorySize = 50;

// When history exceeds 50:
if (factionHistory.size > 50) {
    // Remove oldest questions
    // Keep most recent 50
}
```

**Why 50?**
- With 3000+ LeetCode problems
- 50 questions = ~1.6% of total pool
- Enough to prevent immediate repeats
- Not too large to exhaust question pool

---

## 📊 Question Selection Process

### Step-by-Step Flow

```
1. Room Created
   ↓
2. Generate Questions Needed (e.g., 3 questions)
   ↓
3. Load Faction History
   ├─ Get Set of last 50 question IDs
   └─ Create empty Set for this contest
   ↓
4. For Each Question Needed:
   ├─ Fetch 10-30 candidate questions from LeetCode
   ├─ Filter out:
   │  ├─ Questions already in THIS contest
   │  └─ Questions in faction history
   ├─ Pick random from remaining
   ├─ Add to contest
   ├─ Add to faction history
   └─ Add to contest's used IDs
   ↓
5. Trim History if > 50
   ↓
6. Return Unique Questions
```

### Example Execution

```javascript
// Contest 1 (3 questions needed)
Fetch: [Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10]
History: [] (empty)
Used: []

Pick Q3 → Used: [Q3], History: [Q3]
Pick Q7 → Used: [Q3, Q7], History: [Q3, Q7]
Pick Q2 → Used: [Q3, Q7, Q2], History: [Q3, Q7, Q2]

Result: [Q3, Q7, Q2] ✅

// Contest 2 (3 questions needed)
Fetch: [Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9, Q10]
History: [Q3, Q7, Q2]
Used: []

Filter: [Q1, Q4, Q5, Q6, Q8, Q9, Q10] (removed Q2, Q3, Q7)
Pick Q5 → Used: [Q5], History: [Q3, Q7, Q2, Q5]
Pick Q9 → Used: [Q5, Q9], History: [Q3, Q7, Q2, Q5, Q9]
Pick Q1 → Used: [Q5, Q9, Q1], History: [Q3, Q7, Q2, Q5, Q9, Q1]

Result: [Q5, Q9, Q1] ✅ (No repeats!)
```

---

## 🎮 Features

### 1. No Duplicates Within Contest
```javascript
// Before
Contest: [Two Sum, Palindrome, Two Sum] ❌

// After
Contest: [Two Sum, Palindrome, Valid Parentheses] ✅
```

### 2. No Repeats Across Recent Contests
```javascript
// Before
Contest 1: [Two Sum, Palindrome, Factorial]
Contest 2: [Two Sum, Merge Lists, Binary Search] ❌

// After
Contest 1: [Two Sum, Palindrome, Factorial]
Contest 2: [Reverse String, Merge Lists, Binary Search] ✅
```

### 3. Automatic History Management
```javascript
// History grows
Contest 1: History = [Q1, Q2, Q3]
Contest 2: History = [Q1, Q2, Q3, Q4, Q5, Q6]
Contest 3: History = [Q1, Q2, Q3, Q4, Q5, Q6, Q7, Q8, Q9]
...
Contest 17: History = [Q1...Q51] (51 questions)

// Automatic trim
History = [Q2...Q51] (removed Q1, kept last 50)
```

### 4. Intelligent Fetching
```javascript
// Fetch MORE than needed to have options
Need: 3 questions
Fetch: 10-30 questions
Filter: Remove duplicates
Select: Pick 3 from remaining
```

---

## 🔍 Implementation Details

### Constructor Changes
```javascript
class IntraFactionArena {
    constructor(io, factions) {
        this.io = io;
        this.factions = factions;
        this.activeRooms = new Map();
        this.playerRooms = new Map();
        
        // NEW: Question history tracking
        this.questionHistory = new Map(); // factionId -> Set(questionIds)
        this.maxHistorySize = 50;         // Remember last 50
    }
}
```

### Question Generation Changes
```javascript
async generateQuestionsForRoom(room) {
    // NEW: Track used IDs in this contest
    const usedQuestionIds = new Set();
    
    // NEW: Get faction history
    if (!this.questionHistory.has(room.factionId)) {
        this.questionHistory.set(room.factionId, new Set());
    }
    const factionHistory = this.questionHistory.get(room.factionId);
    
    // For each question needed:
    for (const difficulty of difficulties) {
        // Fetch MORE questions (10-30 instead of 1)
        const fetchCount = Math.max(10, room.questionCount * 3);
        const randomQuestions = await getRandomQuestionsWithGitHub(
            fetchCount, 
            difficulty, 
            includeGitHub,
            includeLeetCode
        );
        
        // NEW: Filter out duplicates
        const availableQuestions = randomQuestions.filter(q => 
            !usedQuestionIds.has(q.id) &&      // Not in this contest
            !factionHistory.has(q.id)          // Not in recent history
        );
        
        // Pick random from available
        const selectedQuestion = availableQuestions[
            Math.floor(Math.random() * availableQuestions.length)
        ];
        
        // NEW: Track the selection
        usedQuestionIds.add(selectedQuestion.id);
        factionHistory.add(selectedQuestion.id);
    }
    
    // NEW: Trim history if too large
    if (factionHistory.size > this.maxHistorySize) {
        const historyArray = Array.from(factionHistory);
        const toRemove = historyArray.slice(0, historyArray.length - this.maxHistorySize);
        toRemove.forEach(id => factionHistory.delete(id));
    }
}
```

---

## 🛠️ Debug Tools

### 1. Check Question History
```javascript
// GET /code-wars/debug/question-history/:factionId

Response:
{
    factionId: "faction_123",
    historySize: 15,
    maxSize: 50,
    questionIds: [
        "cw_001",
        "leetcode_two-sum",
        "leetcode_valid-parentheses",
        ...
    ]
}
```

### 2. Clear Question History
```javascript
// POST /code-wars/debug/clear-history/:factionId

Response:
{
    success: true,
    cleared: 15  // Number of questions removed
}
```

### 3. View in Console
```javascript
// Server logs show:
[ARENA] Generating 3 questions (difficulty: mixed)
[ARENA] Faction history size: 15 questions
[ARENA] Added easy question: Two Sum (ID: leetcode_two-sum)
[ARENA] Added medium question: Valid Parentheses (ID: leetcode_valid-parentheses)
[ARENA] Added medium question: Binary Search (ID: leetcode_binary-search)
[ARENA] Final question set: 3 unique questions
[ARENA] Used question IDs: leetcode_two-sum, leetcode_valid-parentheses, leetcode_binary-search
```

---

## 📈 Statistics

### With 3000+ LeetCode Problems

**History Size: 50 questions**
- Percentage of pool: 1.6%
- Questions available: 2950+
- Chance of repeat: ~0%

**Example Faction Usage**:
```
Contest 1:  3 questions → History: 3
Contest 2:  3 questions → History: 6
Contest 3:  5 questions → History: 11
Contest 4:  3 questions → History: 14
Contest 5:  3 questions → History: 17
...
Contest 17: 3 questions → History: 51 → Trim to 50
Contest 18: 3 questions → History: 50 (oldest removed)
```

**After 100 Contests**:
- Total questions used: ~300
- Questions in history: 50 (most recent)
- Questions available: 2700+
- Still plenty of fresh questions!

---

## 🎯 Benefits

### For Players
1. ✅ **Fresh Experience** - New questions every contest
2. ✅ **Fair Competition** - No one has seen the questions before
3. ✅ **Skill Development** - Diverse problem exposure
4. ✅ **No Boredom** - Variety keeps it interesting

### For System
1. ✅ **Scalable** - Works with 3000+ questions
2. ✅ **Efficient** - O(1) duplicate checking with Sets
3. ✅ **Automatic** - No manual management needed
4. ✅ **Per-Faction** - Isolated histories

### For Admins
1. ✅ **Debug Tools** - Check and clear history
2. ✅ **Logging** - See what's happening
3. ✅ **Configurable** - Adjust maxHistorySize
4. ✅ **Transparent** - Clear console output

---

## 🔧 Configuration

### Adjust History Size
```javascript
// In IntraFactionArena constructor
this.maxHistorySize = 50;  // Default

// Options:
this.maxHistorySize = 30;  // Smaller (more repeats sooner)
this.maxHistorySize = 100; // Larger (fewer repeats, more memory)
```

### Adjust Fetch Count
```javascript
// In generateQuestionsForRoom
const fetchCount = Math.max(10, room.questionCount * 3);

// Options:
const fetchCount = Math.max(20, room.questionCount * 5); // More options
const fetchCount = Math.max(5, room.questionCount * 2);  // Fewer options
```

---

## 🧪 Testing

### Test Scenario 1: No Duplicates in Contest
```javascript
// Create room with 3 questions
// Check: All 3 questions have different IDs
// Expected: ✅ Pass

const questionIds = room.questions.map(q => q.id);
const uniqueIds = new Set(questionIds);
console.assert(questionIds.length === uniqueIds.size, "Duplicates found!");
```

### Test Scenario 2: No Repeats Across Contests
```javascript
// Contest 1: Get question IDs
const contest1Ids = room1.questions.map(q => q.id);

// Contest 2: Get question IDs
const contest2Ids = room2.questions.map(q => q.id);

// Check: No overlap
const overlap = contest1Ids.filter(id => contest2Ids.includes(id));
console.assert(overlap.length === 0, "Repeats found!");
```

### Test Scenario 3: History Trimming
```javascript
// Create 20 contests (60 questions)
// Check: History size = 50 (not 60)
// Expected: ✅ Pass

const stats = intraFactionArena.getQuestionHistoryStats(factionId);
console.assert(stats.historySize === 50, "History not trimmed!");
```

---

## 📊 Performance

### Time Complexity
- **Duplicate Check**: O(1) - Set lookup
- **History Trim**: O(n) - Only when size > 50
- **Question Selection**: O(n) - Filter array

### Space Complexity
- **Per Faction**: O(50) - 50 question IDs
- **Total**: O(50 * numFactions)
- **Example**: 10 factions = 500 IDs stored

### Memory Usage
- **Per Question ID**: ~50 bytes (string)
- **50 IDs**: ~2.5 KB
- **10 Factions**: ~25 KB
- **Negligible** compared to other data

---

## 🎉 Summary

### What Changed
1. ✅ Added `questionHistory` Map to track per-faction history
2. ✅ Added `usedQuestionIds` Set to track within-contest usage
3. ✅ Modified question fetching to get MORE questions
4. ✅ Added filtering to remove duplicates
5. ✅ Added automatic history trimming
6. ✅ Added debug endpoints for management

### What's Better
1. ✅ No duplicate questions in same contest
2. ✅ No repeated questions across recent contests
3. ✅ Fresh experience for players
4. ✅ Automatic management (no manual work)
5. ✅ Scalable to thousands of questions
6. ✅ Per-faction isolation

### What to Expect
- **First Contest**: All new questions
- **Second Contest**: All different from first
- **Third Contest**: All different from first two
- **...continuing...**
- **After 50 questions**: Oldest questions can reappear
- **But**: With 3000+ questions, very unlikely to see repeats soon!

---

**Status**: ✅ **Fully Implemented and Ready**  
**Testing**: ⏳ **Ready for multi-contest testing**  
**Impact**: 🎯 **Significantly improved player experience**
