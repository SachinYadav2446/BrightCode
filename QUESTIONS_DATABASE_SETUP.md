# Questions Database Setup Guide

## Overview
This system fetches **8000+ coding questions** from Codeforces and stores them in a local database, allowing you to serve thousands of questions dynamically instead of hardcoding 10-11 questions.

## Features
- ✅ **8000+ Questions** from Codeforces
- ✅ **Multiple Difficulty Levels** (Easy, Medium, Hard)
- ✅ **Filtering** by difficulty, category, rating, tags
- ✅ **Pagination** for efficient loading
- ✅ **Random Question Selection**
- ✅ **Search by Tags** (dp, greedy, math, graphs, etc.)
- ✅ **Statistics Dashboard**

## Setup Instructions

### Step 1: Seed the Database

Run the seeding script to fetch and store all Codeforces questions:

```bash
node server/seedQuestions.js
```

This will:
1. Fetch 8000+ problems from Codeforces API
2. Convert them to BrightCode format
3. Save to `server/questionsDB.json`
4. Display statistics

**Expected Output:**
```
╔════════════════════════════════════════╗
║   BrightCode Question Database Seeder  ║
╚════════════════════════════════════════╝

🚀 Starting Codeforces question seeding...

[SEED] Fetching all Codeforces problems...
[SEED] ✅ Fetched 8247 problems from Codeforces

[SEED] ✅ Filtered to 7892 valid programming problems

[SEED] Processing batch 1/79...
[SEED] Progress: 100 converted, 0 failed

...

✅ Seeding complete!
📊 Total questions stored: 7892
📅 Last updated: 2026-05-19T12:30:00.000Z
```

**Note:** This process may take 10-30 minutes depending on your internet speed.

### Step 2: Add API Routes to Server

Add the questions API routes to your `server/index.js`:

```javascript
// Add this near the top with other requires
const questionsAPI = require('./questionsAPI');

// Add this with other routes
app.use('/api/questions', questionsAPI);
```

### Step 3: Restart Your Server

```bash
# Stop your current server (Ctrl+C)
# Start it again
node server/index.js
```

## API Endpoints

### 1. Get Questions with Filters
```
GET /api/questions?difficulty=medium&page=1&limit=20
```

**Query Parameters:**
- `difficulty`: easy, medium, hard
- `category`: algorithms, data_structures, graphs, etc.
- `minRating`: minimum Codeforces rating (800-3500)
- `maxRating`: maximum Codeforces rating
- `tags`: comma-separated (dp,greedy,math)
- `page`: page number (default: 1)
- `limit`: items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "cf_1234_A",
      "title": "Problem Name",
      "difficulty": "medium",
      "category": "algorithms",
      "rating": 1400,
      "tags": ["dp", "greedy"],
      "points": 80,
      "timeLimit": 300,
      "description": "...",
      "problemUrl": "https://codeforces.com/problemset/problem/1234/A"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3245,
    "totalPages": 163
  }
}
```

### 2. Get Random Questions
```
GET /api/questions/random?count=10&difficulty=medium
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### 3. Get Question by ID
```
GET /api/questions/cf_1234_A
```

### 4. Get Statistics
```
GET /api/questions/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 7892,
    "byDifficulty": {
      "easy": 2341,
      "medium": 3456,
      "hard": 2095
    },
    "byCategory": {
      "algorithms": 4523,
      "data_structures": 1234,
      "graphs": 892
    },
    "byRating": {
      "800-1200": 2341,
      "1200-1600": 2456,
      "1600-2000": 1895,
      "2000+": 1200
    },
    "lastUpdated": "2026-05-19T12:30:00.000Z"
  }
}
```

### 5. Get All Tags
```
GET /api/questions/tags/list
```

### 6. Get All Categories
```
GET /api/questions/categories/list
```

## Frontend Integration

### Example: Fetch Questions in React

```javascript
// Fetch questions with filters
const fetchQuestions = async (filters) => {
  const params = new URLSearchParams({
    difficulty: filters.difficulty || '',
    page: filters.page || 1,
    limit: filters.limit || 20
  });

  const response = await fetch(`http://localhost:5051/api/questions?${params}`);
  const data = await response.json();
  
  if (data.success) {
    setQuestions(data.data);
    setPagination(data.pagination);
  }
};

// Fetch random questions for a contest
const fetchRandomQuestions = async (count, difficulty) => {
  const response = await fetch(
    `http://localhost:5051/api/questions/random?count=${count}&difficulty=${difficulty}`
  );
  const data = await response.json();
  
  if (data.success) {
    setContestQuestions(data.data);
  }
};
```

## Update Existing Code Wars Arena

Replace the hardcoded questions in `server/intraFactionArena.js`:

```javascript
// OLD: Using hardcoded questions
const questions = await getRandomQuestionsWithGitHub(room.questionCount, room.difficulty);

// NEW: Using database questions
const { getRandomQuestions } = require('./seedQuestions');
const questions = getRandomQuestions(room.questionCount, {
  difficulty: room.difficulty
});
```

## Database Maintenance

### Re-seed Database (Update Questions)
```bash
node server/seedQuestions.js
```

### Check Database Stats
```bash
curl http://localhost:5051/api/questions/stats
```

### Backup Database
```bash
cp server/questionsDB.json server/questionsDB.backup.json
```

## Performance Tips

1. **Caching**: Questions are cached in memory after first load
2. **Pagination**: Always use pagination for large result sets
3. **Filtering**: Filter on server-side to reduce data transfer
4. **Lazy Loading**: Load questions on-demand, not all at once

## Troubleshooting

### Issue: "No questions found"
**Solution:** Run the seeding script first:
```bash
node server/seedQuestions.js
```

### Issue: Seeding takes too long
**Solution:** This is normal. Fetching 8000+ questions takes time. Let it complete.

### Issue: Out of memory during seeding
**Solution:** The script processes in batches of 100. If still failing, reduce batch size in `seedQuestions.js`:
```javascript
const batchSize = 50; // Reduce from 100 to 50
```

### Issue: API returns empty results
**Solution:** Check if questions are loaded:
```bash
curl http://localhost:5051/api/questions/stats
```

## Next Steps

1. ✅ Run seeding script
2. ✅ Add API routes to server
3. ✅ Update frontend to use new API
4. ✅ Remove hardcoded questions
5. ✅ Test with different filters
6. ✅ Deploy to production

## Benefits

### Before (Hardcoded)
- ❌ Only 10-11 questions
- ❌ Manual updates required
- ❌ No filtering/search
- ❌ Limited variety

### After (Database)
- ✅ 8000+ questions
- ✅ Automatic updates
- ✅ Advanced filtering
- ✅ Infinite variety
- ✅ Better user experience

## Support

If you encounter any issues, check:
1. Server logs for errors
2. Database file exists: `server/questionsDB.json`
3. API endpoints are accessible
4. Questions are loaded in memory

---

**Ready to scale to thousands of questions!** 🚀
