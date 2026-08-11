const axios = require('axios');
const { compileAndRunJava } = require('./javaCompiler');
const { executeJudge0TestCases } = require('./judge0Service');
const logger = require('./logger');

const PISTON_API = 'https://emkc.org/api/v2/piston';

/**
 * Universal code executor supporting multiple languages
 * @param {string} code - User's code
 * @param {string} language - Programming language (java, python, javascript, cpp)
 * @param {Array} testCases - Array of test cases
 * @returns {Promise<Object>} - Execution results
 */
async function executeCode(code, language, testCases = []) {
    logger.info(`[CODE EXECUTOR] Executing ${language} code with ${testCases.length} test cases`);
    
    // Validate input
    if (!code || code.trim().length === 0) {
        logger.warn('[CODE EXECUTOR] Empty code submitted');
        return {
            success: false,
            error: 'Please write some code before submitting.',
            type: 'validation',
            testsPassed: 0,
            totalTests: 0
        };
    }

    if (!testCases || testCases.length === 0) {
        logger.warn('[CODE EXECUTOR] No test cases configured');
        return {
            success: false,
            error: 'This question has no test cases configured.',
            type: 'validation',
            testsPassed: 0,
            totalTests: 0
        };
    }

    // Try Judge0 Execution Engine as primary brain (unless explicitly disabled)
    if (process.env.USE_JUDGE0 !== 'false') {
        try {
            logger.info('[CODE EXECUTOR] Evaluating via Judge0 Brain...');
            const judge0Res = await executeJudge0TestCases(code, language, testCases, wrapCodeWithTestCase);
            if (judge0Res && judge0Res.results && judge0Res.results.some(r => r.error && r.error.includes('Judge0 execution error'))) {
                logger.warn('[CODE EXECUTOR] Judge0 returned API errors, falling back to Piston/Local execution');
            } else {
                logger.info(`[CODE EXECUTOR] Judge0 execution complete: ${judge0Res.testsPassed}/${testCases.length} tests passed`);
                return judge0Res;
            }
        } catch (jErr) {
            logger.warn(`[CODE EXECUTOR] Judge0 brain failed (${jErr.message}), falling back to standard engines`);
        }
    }

    // Fallback: Use existing Java compiler for Java
    if (language === 'java') {
        logger.debug('[CODE EXECUTOR] Using local Java compiler fallback');
        return await compileAndRunJava(code, testCases);
    }

    // Fallback: Use Piston API for other languages
    logger.debug('[CODE EXECUTOR] Using Piston API fallback');
    return await executePiston(code, language, testCases);
}

/**
 * Execute code using Piston API
 */
async function executePiston(code, language, testCases) {
    const languageMap = {
        python: 'python',
        javascript: 'javascript',
        cpp: 'c++'
    };

    const pistonLanguage = languageMap[language] || language;
    const results = [];

    try {
        logger.debug(`[CODE EXECUTOR] Running ${testCases.length} test cases via Piston API`);
        
        // Run each test case
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const wrappedCode = wrapCodeWithTestCase(code, language, testCase);

            try {
                const response = await axios.post(`${PISTON_API}/execute`, {
                    language: pistonLanguage,
                    version: '*',
                    files: [{
                        name: getFileName(language),
                        content: wrappedCode
                    }]
                }, {
                    timeout: 10000
                });

                const output = (response.data.run.stdout || '').trim();
                const stderr = (response.data.run.stderr || '').trim();
                const expected = String(testCase.expected).trim();

                if (stderr) {
                    results.push({
                        passed: false,
                        input: testCase.input,
                        expected,
                        actual: null,
                        error: stderr
                    });
                } else {
                    const passed = output === expected;
                    results.push({
                        passed,
                        input: testCase.input,
                        expected,
                        actual: output,
                        error: null
                    });
                }
            } catch (error) {
                results.push({
                    passed: false,
                    input: testCase.input,
                    expected: String(testCase.expected),
                    actual: null,
                    error: error.message || 'Execution failed'
                });
            }
        }

        const allPassed = results.every(r => r.passed);
        const testsPassed = results.filter(r => r.passed).length;

        logger.info(`[CODE EXECUTOR] Execution complete: ${testsPassed}/${results.length} tests passed`);
        
        return {
            success: allPassed,
            results,
            message: allPassed ? 'All test cases passed!' : 'Some test cases failed',
            testsPassed,
            totalTests: results.length
        };

    } catch (error) {
        logger.error('[CODE EXECUTOR] Piston API error:', error.message);
        return {
            success: false,
            error: error.message || 'Execution error',
            type: 'runtime',
            testsPassed: 0,
            totalTests: testCases.length
        };
    }
}

/**
 * Wrap user code with test case execution logic
 */
function wrapCodeWithTestCase(userCode, language, testCase) {
    const inputs = Array.isArray(testCase.input) ? testCase.input : (testCase.input !== undefined ? [testCase.input] : []);

    switch (language) {
        case 'python':
            return wrapPython(userCode, inputs);
        
        case 'javascript':
        case 'js':
            return wrapJavaScript(userCode, inputs);
        
        case 'cpp':
        case 'c++':
            return wrapCpp(userCode, inputs);
        
        case 'java':
            return wrapJava(userCode, inputs);
        
        default:
            return userCode;
    }
}

/**
 * Wrap Java code with test case execution
 */
function wrapJava(userCode, inputs) {
    const argsStr = inputs.map(input => {
        if (typeof input === 'string') return `"${input}"`;
        if (Array.isArray(input)) return `new int[]{${input.join(', ')}}`;
        return String(input);
    }).join(', ');

    if (userCode.includes('public static void main') || userCode.includes('static void main')) {
        return userCode;
    }

    if (userCode.includes('class Solution') || userCode.includes('public class Solution')) {
        return `
import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        try {
            Solution sol = new Solution();
            Object res = sol.solution(${argsStr});
            System.out.println(res);
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
        }
    }
}
`;
    }

    return `
import java.util.*;

public class Main {
    ${userCode}
    public static void main(String[] args) {
        try {
            Object res = solution(${argsStr});
            System.out.println(res);
        } catch (Exception e) {
            System.out.println("ERROR: " + e.getMessage());
        }
    }
}
`;
}

/**
 * Wrap Python code with test execution
 */
function wrapPython(userCode, inputs) {
    const argsStr = inputs.map(input => {
        if (typeof input === 'string') return `"${input}"`;
        if (Array.isArray(input)) return `[${input.join(', ')}]`;
        return String(input);
    }).join(', ');

    return `${userCode}

# Test execution
try:
    result = solution(${argsStr})
    print(result)
except Exception as e:
    print(f"ERROR: {e}")
`;
}

/**
 * Wrap JavaScript code with test execution
 */
function wrapJavaScript(userCode, inputs) {
    const argsStr = inputs.map(input => {
        if (typeof input === 'string') return `"${input}"`;
        if (Array.isArray(input)) return `[${input.join(', ')}]`;
        return String(input);
    }).join(', ');

    return `${userCode}

// Test execution
try {
    const result = solution(${argsStr});
    console.log(result);
} catch (e) {
    console.log("ERROR: " + e.message);
}
`;
}

/**
 * Wrap C++ code with test execution
 */
function wrapCpp(userCode, inputs) {
    // For C++, we'll need to parse the function signature and create a main function
    // This is a simplified version - you may need to enhance it based on your needs
    
    const argsStr = inputs.map(input => {
        if (typeof input === 'string') return `"${input}"`;
        if (Array.isArray(input)) {
            return `{${input.join(', ')}}`;
        }
        return String(input);
    }).join(', ');

    return `#include <iostream>
#include <vector>
#include <string>
using namespace std;

${userCode}

int main() {
    try {
        auto result = solution(${argsStr});
        cout << result << endl;
    } catch (const exception& e) {
        cout << "ERROR: " << e.what() << endl;
    }
    return 0;
}
`;
}

/**
 * Get appropriate filename for language
 */
function getFileName(language) {
    const fileNames = {
        python: 'solution.py',
        javascript: 'solution.js',
        cpp: 'solution.cpp',
        java: 'Solution.java'
    };
    return fileNames[language] || 'solution.txt';
}

module.exports = { executeCode };
