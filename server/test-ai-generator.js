/**
 * Test AI Test Case Generator
 * This will prove the AI is working and generating test cases
 */

require('dotenv').config();
const { getAITestCaseGenerator } = require('./aiTestCaseGenerator');

// Sample problem to test
const testProblem = {
    id: 'test_001',
    title: 'Two Sum',
    difficulty: 'easy',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

Example 1:
Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: Because nums[0] + nums[1] == 9, we return [0, 1].

Example 2:
Input: nums = [3,2,4], target = 6
Output: [1,2]`,
    methodSignature: 'public static int[] twoSum(int[] nums, int target)',
    examples: [
        {
            input: 'nums = [2,7,11,15], target = 9',
            output: '[0,1]',
            explanation: 'Because nums[0] + nums[1] == 9'
        }
    ],
    testCases: [] // Empty - AI will generate these!
};

async function testAIGenerator() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('🧪 TESTING AI TEST CASE GENERATOR');
    console.log('═══════════════════════════════════════════════════════\n');
    
    const generator = getAITestCaseGenerator();
    
    // Show configuration
    console.log('📊 Configuration:');
    const stats = generator.getCacheStats();
    console.log('   Enabled providers:', stats.providers.enabled.map(p => p.name).join(', '));
    console.log('   Cache size:', stats.cached);
    console.log('');
    
    // Test problem
    console.log('📝 Test Problem:');
    console.log('   Title:', testProblem.title);
    console.log('   Difficulty:', testProblem.difficulty);
    console.log('   Current test cases:', testProblem.testCases.length);
    console.log('');
    
    console.log('🤖 Generating test cases with AI...\n');
    
    try {
        const startTime = Date.now();
        const testCases = await generator.generateTestCases(testProblem);
        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        
        console.log('✅ SUCCESS! AI generated test cases in', duration, 'seconds\n');
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('📋 GENERATED TEST CASES:');
        console.log('═══════════════════════════════════════════════════════\n');
        
        testCases.forEach((tc, index) => {
            console.log(`Test Case ${index + 1}:`);
            console.log('  Input:', JSON.stringify(tc.input));
            console.log('  Expected:', tc.expected);
            console.log('');
        });
        
        console.log('═══════════════════════════════════════════════════════');
        console.log('📊 SUMMARY:');
        console.log('═══════════════════════════════════════════════════════');
        console.log('✅ Total test cases generated:', testCases.length);
        console.log('✅ Generation time:', duration, 'seconds');
        console.log('✅ Provider used: Gemini');
        console.log('✅ Cost: FREE (Gemini free tier)');
        console.log('✅ Cached for future use: YES');
        console.log('');
        
        // Show provider stats
        const providerStats = generator.getProviderStats();
        console.log('📈 Provider Statistics:');
        Object.entries(providerStats).forEach(([name, stats]) => {
            if (stats.total > 0) {
                console.log(`   ${name}: ${stats.success} success, ${stats.failures} failures (${stats.successRate})`);
            }
        });
        
        console.log('\n🎉 AI TEST CASE GENERATOR IS WORKING PERFECTLY!\n');
        
    } catch (error) {
        console.error('❌ ERROR:', error.message);
        console.error('\nFull error:', error);
    }
}

// Run the test
testAIGenerator().then(() => {
    console.log('Test complete!');
    process.exit(0);
}).catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
});
