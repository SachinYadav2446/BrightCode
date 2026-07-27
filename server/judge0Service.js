const axios = require('axios');
const logger = require('./logger');

// Official Judge0 Language IDs
const JUDGE0_LANGUAGES = {
    'javascript': 63,
    'js': 63,
    'node': 63,
    'python': 71,
    'py': 71,
    'python3': 71,
    'c++': 54,
    'cpp': 54,
    'c': 50,
    'java': 62,
    'go': 60,
    'golang': 60,
    'rust': 73,
    'rs': 73,
    'ruby': 72,
    'rb': 72,
    'typescript': 74,
    'ts': 74,
    'csharp': 51,
    'cs': 51,
    'php': 68,
    'swift': 83,
    'kotlin': 78
};

const getJudge0Url = () => {
    return process.env.JUDGE0_URL || process.env.JUDGE0_HOST || 'https://ce.judge0.com';
};

const getHeaders = () => {
    const headers = { 'Content-Type': 'application/json' };
    if (process.env.RAPIDAPI_KEY || process.env.JUDGE0_API_KEY) {
        headers['x-rapidapi-key'] = process.env.RAPIDAPI_KEY || process.env.JUDGE0_API_KEY;
        headers['x-rapidapi-host'] = process.env.RAPIDAPI_HOST || 'judge0-ce.p.rapidapi.com';
    }
    return headers;
};

/**
 * Execute code using Judge0 API
 */
async function executeJudge0(code, language, stdin = '') {
    const langKey = String(language).toLowerCase();
    const languageId = JUDGE0_LANGUAGES[langKey] || 63;
    const baseUrl = getJudge0Url();
    const headers = getHeaders();

    logger.info(`[JUDGE0] Submitting code for language: ${language} (ID: ${languageId}) to ${baseUrl}`);

    try {
        const response = await axios.post(`${baseUrl}/submissions?base64_encoded=false&wait=true`, {
            source_code: code,
            language_id: languageId,
            stdin: stdin || ''
        }, {
            headers,
            timeout: 15000
        });

        const data = response.data;
        const stdout = data.stdout || '';
        const stderr = data.stderr || data.compile_output || '';
        const statusId = data.status?.id || 3;
        const exitCode = statusId === 3 ? 0 : 1;

        return {
            stdout: stdout.trim(),
            stderr: stderr.trim(),
            code: exitCode,
            executionTime: Math.round(parseFloat(data.time || '0') * 1000),
            memoryKb: data.memory || 0,
            status: data.status?.description || 'Executed',
            source: 'judge0'
        };
    } catch (err) {
        logger.error(`[JUDGE0] API Execution Error: ${err.message}`);
        throw err;
    }
}

/**
 * Execute test cases via Judge0
 */
async function executeJudge0TestCases(code, language, testCases = [], wrapCodeFn) {
    const results = [];
    for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        const wrappedCode = wrapCodeFn ? wrapCodeFn(code, language, testCase) : code;
        const expected = String(testCase.expected).trim();

        try {
            const execRes = await executeJudge0(
                wrappedCode, 
                language, 
                Array.isArray(testCase.input) ? testCase.input.join('\n') : (testCase.input || '')
            );
            
            if (execRes.stderr) {
                results.push({
                    passed: false,
                    input: testCase.input,
                    expected,
                    actual: null,
                    error: execRes.stderr
                });
            } else {
                const passed = execRes.stdout.trim() === expected;
                results.push({
                    passed,
                    input: testCase.input,
                    expected,
                    actual: execRes.stdout.trim(),
                    error: null
                });
            }
        } catch (err) {
            results.push({
                passed: false,
                input: testCase.input,
                expected,
                actual: null,
                error: err.message || 'Judge0 execution error'
            });
        }
    }

    const allPassed = results.every(r => r.passed);
    const testsPassed = results.filter(r => r.passed).length;

    return {
        success: allPassed,
        results,
        message: allPassed ? 'All test cases passed via Judge0!' : 'Some test cases failed',
        testsPassed,
        totalTests: results.length,
        engine: 'judge0'
    };
}

module.exports = {
    executeJudge0,
    executeJudge0TestCases,
    JUDGE0_LANGUAGES
};
