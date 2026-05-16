const axios = require('axios');
const { compileAndRunJava } = require('./javaCompiler');

const PISTON_API = 'https://emkc.org/api/v2/piston';

/**
 * Universal code executor supporting multiple languages
 * @param {string} code - User's code
 * @param {string} language - Programming language (java, python, javascript, cpp)
 * @param {Array} testCases - Array of test cases
 * @returns {Promise<Object>} - Execution results
 */
async function executeCode(code, language, testCases = []) {
    // Validate input
    if (!code || code.trim().length === 0) {
        return {
            success: false,
            error: 'Please write some code before submitting.',
            type: 'validation',
            testsPassed: 0,
            totalTests: 0
        };
    }

    if (!testCases || testCases.length === 0) {
        return {
            success: false,
            error: 'This question has no test cases configured.',
            type: 'validation',
            testsPassed: 0,
            totalTests: 0
        };
    }

    // Use existing Java compiler for Java
    if (language === 'java') {
        return await compileAndRunJava(code, testCases);
    }

    // Use Piston API for other languages
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

        return {
            success: allPassed,
            results,
            message: allPassed ? 'All test cases passed!' : 'Some test cases failed',
            testsPassed,
            totalTests: results.length
        };

    } catch (error) {
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
    const inputs = testCase.input || [];

    switch (language) {
        case 'python':
            return wrapPython(userCode, inputs);
        
        case 'javascript':
            return wrapJavaScript(userCode, inputs);
        
        case 'cpp':
            return wrapCpp(userCode, inputs);
        
        default:
            return userCode;
    }
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
