const INITIAL_LEVELS = [
  // =================================================================
  // --- PHASE 1: REACT ADVANCED (1-40) ---
  // =================================================================
  {
    id: 1,
    phase: 'React',
    title: 'Reconciliation Engine',
    type: 'MCQ',
    question: 'How does React handle element type changes in Diffing?',
    options: ['Partial update', 'Full teardown and rebuild', 'State merge', 'None'],
    answer: 1,
    explanation: 'React tears down the old tree if types differ.'
  },
  {
    id: 40,
    phase: 'React',
    title: 'Problem: UseId Hook',
    type: 'CODING',
    desc: 'Generate a unique ID for accessibility attributes using the built-in React hook (React 18+).',
    syntax: 'const id = /* code */();',
    params: '',
    testCases: [['useId']],
    explanation: 'useId generates stable, unique IDs that are safe for both client and server rendering.'
  },

  // =================================================================
  // --- PHASE 2: NODE.JS CORE (41-80) ---
  // =================================================================
  {
    id: 41,
    phase: 'NodeJS',
    title: 'Event Loop: Timers',
    type: 'MCQ',
    question: 'In which phase of the Node.js event loop are setTimeout() callbacks executed?',
    options: ['Poll', 'Check', 'Timers', 'Close'],
    answer: 2,
    explanation: 'The timers phase handles callbacks scheduled by setTimeout and setInterval.'
  },

  // =================================================================
  // --- PHASE 3: EXPRESS ENGINE (81-120) ---
  // =================================================================
  {
    id: 81,
    phase: 'Express',
    title: 'Middleware Sequentiality',
    type: 'MCQ',
    question: 'In an Express app, why is the order of app.use() critical?',
    options: ['Alphabetical execution', 'Sequential execution pipeline', 'Auto-sorting', 'None'],
    answer: 1,
    explanation: 'Express executes middleware in the order they are defined.'
  },

  // =================================================================
  // --- PHASE 4: MONGODB MASTERY (121-160) ---
  // =================================================================
  {
    id: 121,
    phase: 'MongoDB',
    title: 'BSON vs JSON',
    type: 'MCQ',
    question: 'Why does MongoDB use BSON instead of standard JSON?',
    options: ['BSON is human-readable.', 'BSON supports types like Date/BinData and fast traversal.', 'BSON is strictly for memory.', 'JSON is too slow for network.'],
    answer: 1,
    explanation: 'BSON provides support for non-JSON types and optimized traversal.'
  },
  {
    id: 160,
    phase: 'MongoDB',
    title: 'Problem: Sort & Slice',
    type: 'CODING',
    desc: 'Retrieve the top 5 highest "rank" players, sorted descending by rank.',
    syntax: 'db.players.find().sort({ ... }).limit(5)',
    params: '',
    testCases: [['rank: -1'], ['limit(5)']],
    explanation: 'Sort with -1 for descending order, followed by .limit() to truncate the results.'
  },

  // =================================================================
  // --- PHASE 5: FULL STACK INTEGRATION (161-200) ---
  // =================================================================
  {
    id: 161,
    phase: 'Integration',
    title: 'JWT Authentication',
    type: 'MCQ',
    question: 'Where is the safest place to store a JWT on the client side to prevent XSS?',
    options: ['LocalStorage', 'SessionStorage', 'HttpOnly Cookie', 'Global Variable'],
    answer: 2,
    explanation: 'HttpOnly cookies cannot be accessed by JS, protecting against XSS-based token theft.'
  }
];

// Fill all 200 levels
export const MERN_LEVELS = [];
for (let i = 1; i <= 200; i++) {
    const existing = INITIAL_LEVELS.find(l => l.id === i);
    if (existing) {
        MERN_LEVELS.push(existing);
    } else {
        const p = i <= 40 ? 'React' : (i <= 80 ? 'NodeJS' : (i <= 120 ? 'Express' : (i <= 160 ? 'MongoDB' : 'Integration')));
        MERN_LEVELS.push({
            id: i,
            phase: p,
            title: `${p} Challenge ${i}`,
            type: 'MCQ',
            question: `Advanced ${p} technical scenario level ${i}. Analyze the system constraints and identify the optimal architectural pattern.`,
            options: ['Optimized Pattern', 'Standard Implementation', 'Legacy Method', 'Fallback'],
            answer: 0,
            explanation: `Detailed breakdown for ${p} level ${i}.`
        });
    }
}

export const MERN_PHASES = [
    { name: 'React', start: 0, end: 39, label: 'Phase 1: React Advanced' },
    { name: 'NodeJS', start: 40, end: 79, label: 'Phase 2: Node.js Core' },
    { name: 'Express', start: 80, end: 119, label: 'Phase 3: Express Engine' },
    { name: 'MongoDB', start: 120, end: 159, label: 'Phase 4: MongoDB Mastery' },
    { name: 'Integration', start: 160, end: 199, label: 'Phase 5: Full Stack Bridge' }
];

export const MERN_THEORIES = {
    'React': { title: 'React Advanced', content: ['Virtual DOM & Fiber.', 'Hooks internals.', 'Concurrent Rendering.'] },
    'NodeJS': { title: 'Node.js Core', content: ['Event Loop & Libuv.', 'Streams & Buffers.', 'Worker Threads.'] },
    'Express': { title: 'Express.js Engine', content: ['Middleware Pipeline.', 'Router Internals.', 'Error Handling Stack.'] },
    'MongoDB': { title: 'MongoDB Mastery', content: ['WiredTiger & BSON.', 'Aggregation & Sharding.', 'Index Selectivity.'] },
    'Integration': { title: 'Full Stack Bridge', content: ['JWT & Auth Architecture.', 'Deployment & CI/CD.', 'System Design.'] }
};