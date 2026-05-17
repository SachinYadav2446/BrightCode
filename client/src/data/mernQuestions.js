// MERN STACK - 200 Questions (5 Modules × 40 Questions)
// Structure per module: 10 MCQ + 10 Short Answer + 20 Coding

export const MERN_LEVELS = [];

// Helper to generate questions
const generateQuestions = () => {
  const modules = [
    { name: 'React', start: 1, end: 40 },
    { name: 'NodeJS', start: 41, end: 80 },
    { name: 'Express', start: 81, end: 120 },
    { name: 'MongoDB', start: 121, end: 160 },
    { name: 'Integration', start: 161, end: 200 }
  ];

  modules.forEach(module => {
    const { name, start, end } = module;
    
    // 10 MCQ Questions (1-10)
    for (let i = 0; i < 10; i++) {
      MERN_LEVELS.push({
        id: start + i,
        phase: name,
        title: ${name} MCQ ,
        type: 'MCQ',
        question: What is the core concept  in ?,
        options: [Correct answer for , 'Wrong option A', 'Wrong option B', 'Wrong option C'],
        answer: 0,
        explanation: ${name} concept explanation 
      });
    }
    
    // 10 Short Answer Questions (11-20)
    for (let i = 10; i < 20; i++) {
      MERN_LEVELS.push({
        id: start + i,
        phase: name,
        title: ${name} Short Answer ,
        type: 'CODING',
        desc: Complete the  syntax for concept ,
        syntax: const result = /* Fill in the  code */;,
        params: '',
        testCases: [[${name.toLowerCase()}_keyword]],
        explanation: ${name} short answer explanation 
      });
    }
    
    // 20 Coding Questions (21-40)
    for (let i = 20; i < 40; i++) {
      MERN_LEVELS.push({
        id: start + i,
        phase: name,
        title: ${name} Coding ,
        type: 'CODING',
        desc: Implement  functionality ,
        syntax: unction solution() {\n  // Write your  code here\n  return result;\n},
        params: '',
        testCases: [['expected_output']],
        explanation: ${name} coding challenge explanation 
      });
    }
  });
};

generateQuestions();

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
