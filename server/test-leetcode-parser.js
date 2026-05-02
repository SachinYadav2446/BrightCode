/**
 * Test script for LeetCode test case parser
 * Run with: node test-leetcode-parser.js
 */

const { CachedLeetCodeAPI } = require('./leetcodeAPI');

async function testParser() {
    console.log('🧪 Testing LeetCode Test Case Parser\n');
    
    const api = new CachedLeetCodeAPI();
    
    // Test with a simple problem first
    const testProblem = {
        name: 'Two Sum',
        titleSlug: 'two-sum'
    };
    
    console.log(`${'='.repeat(60)}`);
    console.log(`Testing: ${testProblem.name}`);
    console.log(`${'='.repeat(60)}\n`);
    
    try {
        console.log('Fetching problem details from LeetCode...');
        const problem = await api.getCachedProblemDetails(testProblem.titleSlug);
        
        if (!problem) {
            console.error(`❌ Failed to fetch problem: ${testProblem.name}`);
            console.log('\nThis could be due to:');
            console.log('1. Network issues');
            console.log('2. LeetCode API rate limiting');
            console.log('3. Problem not found');
            return;
        }
        
        console.log(`✅ Problem fetched: ${problem.title}`);
        console.log(`   Difficulty: ${problem.difficulty}`);
        console.log(`   Points: ${problem.points}`);
        console.log(`   Method Signature: ${problem.methodSignature || 'N/A'}`);
        console.log(`   Test Cases: ${problem.testCases ? problem.testCases.length : 0}`);
        
        if (problem.testCases && problem.testCases.length > 0) {
            console.log(`\n   📋 Test Cases:`);
            problem.testCases.forEach((tc, i) => {
                console.log(`   ${i + 1}. Input: ${JSON.stringify(tc.input)}`);
                console.log(`      Expected: ${tc.expected}`);
            });
            console.log(`\n   ✅ Test cases parsed successfully!`);
        } else {
            console.log(`\n   ❌ No test cases found!`);
            console.log('   This means the parser needs improvement for this problem type.');
        }
        
        if (problem.examples && problem.examples.length > 0) {
            console.log(`\n   📖 Examples from description:`);
            problem.examples.forEach((ex, i) => {
                console.log(`   ${i + 1}. Input: ${ex.input}`);
                console.log(`      Output: ${ex.output}`);
                if (ex.explanation) {
                    console.log(`      Explanation: ${ex.explanation}`);
                }
            });
        }
        
        console.log(`\n${'='.repeat(60)}`);
        console.log('🎉 Test Complete!');
        console.log(`${'='.repeat(60)}\n`);
        
    } catch (error) {
        console.error(`❌ Error testing ${testProblem.name}:`, error.message);
        console.error('\nFull error:', error);
    }
}

// Run tests
console.log('Starting LeetCode parser test...\n');
testParser().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
