/**
 * Migration Script: Move existing test cases to new TestCaseManager system
 */

const fs = require('fs').promises;
const path = require('path');
const { getTestCaseManager } = require('./testCaseManager');

async function migrateTestCases() {
    console.log('🔄 Starting test case migration...');
    
    const tcManager = getTestCaseManager();
    
    // Path to old test cases
    const oldTestCasesPath = path.join(__dirname, 'ai_test_cases', 'test_cases_db.json');
    
    try {
        // Read old test cases
        const oldData = await fs.readFile(oldTestCasesPath, 'utf8');
        const oldTestCases = JSON.parse(oldData);
        
        console.log(`📦 Found ${Object.keys(oldTestCases).length} problems to migrate`);
        
        // Migrate each problem
        for (const [problemId, data] of Object.entries(oldTestCases)) {
            console.log(`\nMigrating: ${data.problemTitle} (${problemId})`);
            
            const problem = {
                id: problemId,
                title: data.problemTitle
            };
            
            // Split into sample (first 3) and hidden (remaining)
            const testCases = data.testCases;
            const sampleCount = Math.min(3, testCases.length);
            
            const sampleTestCases = testCases.slice(0, sampleCount);
            const hiddenTestCases = testCases.slice(sampleCount);
            
            // Store in new system
            if (sampleTestCases.length > 0) {
                await tcManager.storeTestCases(problem, sampleTestCases, 'sample');
            }
            
            if (hiddenTestCases.length > 0) {
                await tcManager.storeTestCases(problem, hiddenTestCases, 'hidden');
            }
            
            console.log(`✅ Migrated: ${testCases.length} test cases (${sampleTestCases.length} sample, ${hiddenTestCases.length} hidden)`);
        }
        
        // Show final stats
        const stats = tcManager.getStats();
        console.log('\n🎉 Migration Complete!');
        console.log('─────────────────────────────────');
        console.log(`Problems: ${stats.problems}`);
        console.log(`Total Test Cases: ${stats.totalTestCases}`);
        console.log(`By Category:`, stats.byCategory);
        console.log('─────────────────────────────────');
        
    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error('Stack:', error.stack);
    }
}

// Run migration
migrateTestCases();
