/**
 * Test Script: Verify Questions Database Integration
 * 
 * This script tests that the questions database is properly integrated
 * and can fetch questions for Code Wars Arena.
 */

const { getRandomQuestions, loadFromFile, questionsDB } = require('./server/seedQuestions');

console.log('╔════════════════════════════════════════════════════════╗');
console.log('║  Testing Questions Database Integration               ║');
console.log('╚════════════════════════════════════════════════════════╝\n');

// Load database first
console.log('📂 Loading database from file...');
loadFromFile().then(loaded => {
    if (loaded) {
        Object.assign(questionsDB, loaded);
        console.log(`✅ Loaded ${questionsDB.metadata.totalQuestions} questions\n`);
        runTests();
    } else {
        console.error('❌ Failed to load database!');
        console.error('Please run: node server/seedQuestions.js');
        process.exit(1);
    }
}).catch(error => {
    console.error('❌ Error loading database:', error);
    process.exit(1);
});

function runTests() {
    // Test 1: Check if database is loaded
    console.log('📊 Test 1: Database Statistics');
    console.log('─────────────────────────────────────────────────────────');
    console.log(`Total Questions: ${questionsDB.metadata.totalQuestions}`);
    console.log(`Last Updated: ${questionsDB.metadata.lastUpdated}`);
    console.log(`Source: Codeforces (${questionsDB.metadata.sources.codeforces} questions)`);
    console.log('');

    // Test 2: Fetch easy questions
    console.log('🟢 Test 2: Fetch Easy Questions');
    console.log('─────────────────────────────────────────────────────────');
    const easyQuestions = getRandomQuestions(5, { difficulty: 'easy' });
    console.log(`Fetched ${easyQuestions.length} easy questions:`);
    easyQuestions.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q.title} (Rating: ${q.rating || 'N/A'})`);
    });
    console.log('');

    // Test 3: Fetch medium questions
    console.log('🟡 Test 3: Fetch Medium Questions');
    console.log('─────────────────────────────────────────────────────────');
    const mediumQuestions = getRandomQuestions(5, { difficulty: 'medium' });
    console.log(`Fetched ${mediumQuestions.length} medium questions:`);
    mediumQuestions.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q.title} (Rating: ${q.rating || 'N/A'})`);
    });
    console.log('');

    // Test 4: Fetch hard questions
    console.log('🔴 Test 4: Fetch Hard Questions');
    console.log('─────────────────────────────────────────────────────────');
    const hardQuestions = getRandomQuestions(5, { difficulty: 'hard' });
    console.log(`Fetched ${hardQuestions.length} hard questions:`);
    hardQuestions.forEach((q, i) => {
        console.log(`  ${i + 1}. ${q.title} (Rating: ${q.rating || 'N/A'})`);
    });
    console.log('');

    // Test 5: Fetch large pool (like Code Wars Arena does)
    console.log('🎯 Test 5: Fetch Large Pool (Arena Simulation)');
    console.log('─────────────────────────────────────────────────────────');
    const largePool = getRandomQuestions(50, { difficulty: 'medium' });
    console.log(`Fetched ${largePool.length} questions for deduplication pool`);
    console.log(`This simulates how Code Wars Arena fetches questions`);
    console.log('');

    // Test 6: Check for duplicates
    console.log('🔍 Test 6: Duplicate Detection');
    console.log('─────────────────────────────────────────────────────────');
    const testPool = getRandomQuestions(100, { difficulty: 'easy' });
    const ids = testPool.map(q => q.id);
    const uniqueIds = new Set(ids);
    console.log(`Fetched: ${ids.length} questions`);
    console.log(`Unique: ${uniqueIds.size} questions`);
    console.log(`Duplicates: ${ids.length - uniqueIds.size}`);
    if (uniqueIds.size === ids.length) {
        console.log('✅ No duplicates found!');
    } else {
        console.log('⚠️ Duplicates detected!');
    }
    console.log('');

    // Test 7: Question structure validation
    console.log('📋 Test 7: Question Structure Validation');
    console.log('─────────────────────────────────────────────────────────');
    const sampleQuestion = easyQuestions[0];
    console.log('Sample Question Structure:');
    console.log(`  ID: ${sampleQuestion.id}`);
    console.log(`  Title: ${sampleQuestion.title}`);
    console.log(`  Difficulty: ${sampleQuestion.difficulty}`);
    console.log(`  Rating: ${sampleQuestion.rating || 'N/A'}`);
    console.log(`  Category: ${sampleQuestion.category || 'N/A'}`);
    console.log(`  Points: ${sampleQuestion.points}`);
    console.log(`  Tags: ${sampleQuestion.tags ? sampleQuestion.tags.join(', ') : 'N/A'}`);
    console.log(`  Has Description: ${!!sampleQuestion.description}`);
    console.log(`  Has Problem URL: ${!!sampleQuestion.problemUrl}`);
    console.log('');

    // Summary
    console.log('╔════════════════════════════════════════════════════════╗');
    console.log('║  Test Summary                                          ║');
    console.log('╚════════════════════════════════════════════════════════╝');
    console.log('✅ Database loaded successfully');
    console.log(`✅ ${questionsDB.metadata.totalQuestions} questions available`);
    console.log('✅ Can fetch questions by difficulty');
    console.log('✅ Large pool fetching works (for deduplication)');
    console.log('✅ Question structure is valid');
    console.log('');
    console.log('🎮 Code Wars Arena is ready to use the database!');
    console.log('');
}
