const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const TEMP_DIR = path.join(__dirname, 'temp_exec');

// Ensure temp directory exists
async function ensureTempDir() {
    try {
        await fs.mkdir(TEMP_DIR, { recursive: true });
    } catch (err) {
        console.error('Failed to create temp directory:', err);
    }
}

ensureTempDir();

/**
 * Compile and execute Java code with test cases
 * @param {string} userCode - User's Java method code or complete program
 * @param {Array} testCases - Array of test cases [{ input: [...], expected: ... }, ...]
 * @returns {Promise<Object>} - Execution results
 */
async function compileAndRunJava(userCode, testCases = []) {
    const sessionId = uuidv4().replace(/-/g, '');
    const className = `Solution${sessionId}`;
    const javaFile = path.join(TEMP_DIR, `${className}.java`);
    const classFile = path.join(TEMP_DIR, `${className}.class`);

    try {
        // Validate input
        if (!userCode || userCode.trim().length === 0) {
            return {
                success: false,
                error: 'Please write some code before submitting.',
                type: 'validation',
                testsPassed: 0,
                totalTests: 0
            };
        }

        // Check if test cases exist
        if (!testCases || testCases.length === 0) {
            console.warn('⚠️ No test cases provided for this question!');
            return {
                success: false,
                error: 'This question has no test cases configured. Please contact support.',
                type: 'validation',
                testsPassed: 0,
                totalTests: 0
            };
        }

        // Check if this is a complete program (has main method) or just a method
        const hasMainMethod = userCode.includes('public static void main');
        
        if (hasMainMethod) {
            // Module 1 style - complete program with main method
            // Replace class name and run with output validation
            const javaCode = userCode.replace(/class\s+\w+/, `class ${className}`);
            await fs.writeFile(javaFile, javaCode, 'utf8');

            // Compile
            const compileResult = await new Promise((resolve) => {
                exec(`javac "${javaFile}"`, { timeout: 5000 }, (error, stdout, stderr) => {
                    if (error) {
                        if (error.message.includes('not recognized') || error.message.includes('command not found')) {
                            resolve({ 
                                success: false, 
                                error: 'Java JDK is not installed. Please install Java JDK and restart the server.',
                                type: 'system'
                            });
                        } else {
                            const errorMsg = stderr || error.message;
                            let cleanError = 'Compilation failed. Check your syntax.';
                            
                            if (errorMsg.includes("';' expected")) {
                                cleanError = 'Syntax Error: Missing semicolon (;)';
                            } else if (errorMsg.includes('cannot find symbol')) {
                                cleanError = 'Error: Undefined variable or method';
                            } else if (errorMsg.includes('incompatible types')) {
                                cleanError = 'Type Error: Return type mismatch';
                            } else if (errorMsg.includes('reached end of file')) {
                                cleanError = 'Syntax Error: Missing closing brace }';
                            }
                            
                            resolve({ success: false, error: cleanError, type: 'compilation' });
                        }
                    } else {
                        resolve({ success: true });
                    }
                });
            });

            if (!compileResult.success) {
                return compileResult;
            }

            // Run and validate output
            const results = [];
            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                const expected = String(testCase.expected).trim();

                const runResult = await new Promise((resolve) => {
                    exec(
                        `java -cp "${TEMP_DIR}" ${className}`,
                        { timeout: 3000 },
                        (error, stdout, stderr) => {
                            const output = stdout.trim();
                            
                            if (error) {
                                resolve({
                                    passed: false,
                                    input: testCase.input || [],
                                    expected,
                                    actual: null,
                                    error: 'Runtime error or timeout'
                                });
                            } else {
                                const passed = output === expected;
                                resolve({
                                    passed,
                                    input: testCase.input || [],
                                    expected,
                                    actual: output,
                                    error: null
                                });
                            }
                        }
                    );
                });

                results.push(runResult);
            }

            const allPassed = results.every(r => r.passed);
            
            return {
                success: allPassed,
                results,
                message: allPassed ? 'All test cases passed!' : 'Some test cases failed'
            };
        }

        // Module 2+ style - method with test harness
        // Extract method signature from user code
        const methodMatch = userCode.match(/public\s+static\s+(\w+)\s+(\w+)\s*\(([^)]*)\)/);
        if (!methodMatch) {
            return {
                success: false,
                error: 'Invalid method signature. Please write: public static ReturnType methodName(params) { ... }',
                type: 'validation'
            };
        }

        const returnType = methodMatch[1];
        const methodName = methodMatch[2];
        const params = methodMatch[3];
        
        // Log method info for debugging
        console.log(`📝 Detected method: ${returnType} ${methodName}(${params})`);

        // Build complete Java program with test harness
        const javaCode = `
public class ${className} {
    ${userCode}
    
    public static void main(String[] args) {
        // Test case index from command line
        if (args.length == 0) {
            System.out.println("ERROR: No test case specified");
            return;
        }
        
        int testIndex = Integer.parseInt(args[0]);
        
        try {
            switch(testIndex) {
${testCases.map((tc, idx) => {
    const inputs = tc.input || [];
    const argsStr = inputs.map(input => {
        if (typeof input === 'string') return `"${input}"`;
        if (typeof input === 'boolean') return input.toString();
        if (Array.isArray(input)) return `new int[]{${input.join(', ')}}`;
        return input.toString();
    }).join(', ');
    
    return `                case ${idx}:
                    ${returnType === 'void' ? '' : `${returnType} result${idx} = `}${methodName}(${argsStr});
                    ${returnType === 'void' ? '' : `System.out.println(result${idx});`}
                    break;`;
}).join('\n')}
                default:
                    System.out.println("ERROR: Invalid test case index");
            }
        } catch (Exception e) {
            System.out.println("RUNTIME_ERROR: " + e.getMessage());
        }
    }
}`;

        // Write Java file
        await fs.writeFile(javaFile, javaCode, 'utf8');

        // Compile
        const compileResult = await new Promise((resolve) => {
            exec(`javac "${javaFile}"`, { timeout: 5000 }, (error, stdout, stderr) => {
                if (error) {
                    if (error.message.includes('not recognized') || error.message.includes('command not found')) {
                        resolve({ 
                            success: false, 
                            error: 'Java JDK is not installed. Please install Java JDK and restart the server.',
                            type: 'system'
                        });
                    } else {
                        // Parse compilation error
                        const errorMsg = stderr || error.message;
                        let cleanError = 'Compilation failed. Check your syntax.';
                        
                        if (errorMsg.includes("';' expected")) {
                            cleanError = 'Syntax Error: Missing semicolon (;)';
                        } else if (errorMsg.includes('cannot find symbol')) {
                            cleanError = 'Error: Undefined variable or method';
                        } else if (errorMsg.includes('incompatible types')) {
                            cleanError = 'Type Error: Return type mismatch';
                        } else if (errorMsg.includes('reached end of file')) {
                            cleanError = 'Syntax Error: Missing closing brace }';
                        }
                        
                        resolve({ success: false, error: cleanError, type: 'compilation' });
                    }
                } else {
                    resolve({ success: true });
                }
            });
        });

        if (!compileResult.success) {
            return compileResult;
        }

        // Run all test cases
        const results = [];
        for (let i = 0; i < testCases.length; i++) {
            const testCase = testCases[i];
            const expected = String(testCase.expected);

            const runResult = await new Promise((resolve) => {
                exec(
                    `java -cp "${TEMP_DIR}" ${className} ${i}`,
                    { timeout: 3000 },
                    (error, stdout, stderr) => {
                        const output = stdout.trim();
                        
                        if (output.startsWith('RUNTIME_ERROR:')) {
                            resolve({
                                passed: false,
                                input: testCase.input,
                                expected,
                                actual: null,
                                error: output.replace('RUNTIME_ERROR: ', '')
                            });
                        } else if (output.startsWith('ERROR:')) {
                            resolve({
                                passed: false,
                                input: testCase.input,
                                expected,
                                actual: null,
                                error: 'Execution error'
                            });
                        } else if (error) {
                            resolve({
                                passed: false,
                                input: testCase.input,
                                expected,
                                actual: null,
                                error: 'Runtime error or timeout'
                            });
                        } else {
                            const passed = output === expected;
                            resolve({
                                passed,
                                input: testCase.input,
                                expected,
                                actual: output,
                                error: null
                            });
                        }
                    }
                );
            });

            results.push(runResult);
        }

        const allPassed = results.every(r => r.passed);
        const testsPassed = results.filter(r => r.passed).length;
        const totalTests = results.length;
        
        // Create detailed error message if tests failed
        let detailedMessage = allPassed ? 'All test cases passed!' : 'Some test cases failed';
        if (!allPassed) {
            const failedTests = results.filter(r => !r.passed);
            const firstFailed = failedTests[0];
            const failedIndex = results.indexOf(firstFailed);
            
            detailedMessage = `Test case ${failedIndex + 1} failed:\n`;
            detailedMessage += `Input: ${JSON.stringify(firstFailed.input)}\n`;
            detailedMessage += `Expected: ${firstFailed.expected}\n`;
            detailedMessage += `Got: ${firstFailed.actual || 'error'}\n`;
            if (firstFailed.error) {
                detailedMessage += `Error: ${firstFailed.error}`;
            }
        }
        
        return {
            success: allPassed,
            results,
            message: detailedMessage,
            methodName: methodName, // Include method name for debugging
            testsPassed: results.filter(r => r.passed).length,
            totalTests: results.length
        };

    } catch (error) {
        return {
            success: false,
            error: error.message || 'Unexpected error occurred',
            type: 'runtime'
        };
    } finally {
        // Cleanup
        try {
            await fs.unlink(javaFile).catch(() => {});
            await fs.unlink(classFile).catch(() => {});
        } catch (err) {
            // Ignore cleanup errors
        }
    }
}

module.exports = { compileAndRunJava };
