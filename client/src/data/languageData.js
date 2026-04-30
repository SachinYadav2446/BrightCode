// ═══════════════════════════════════════════════════════════
// LANGUAGE MODULES - Java, C++, Python, Go
// Each module: 100 levels (50 MCQ + 50 Coding)
// ═══════════════════════════════════════════════════════════

// Import Module 2-10 questions
import { JAVA_MODULE2_QUESTIONS } from './javaModule2.js';
import { JAVA_MODULE3_QUESTIONS } from './javaModule3.js';
import { JAVA_MODULE4_QUESTIONS } from './javaModule4.js';
import { JAVA_MODULE5_QUESTIONS } from './javaModule5.js';
import { JAVA_MODULE6_QUESTIONS } from './javaModule6.js';
import { JAVA_MODULE7_QUESTIONS } from './javaModule7.js';
import { JAVA_MODULE8_QUESTIONS } from './javaModule8.js';
import { JAVA_MODULE9_QUESTIONS } from './javaModule9.js';
import { JAVA_MODULE10_QUESTIONS } from './javaModule10.js';

// ── JAVA LEVELS (100 total: 10 MCQ + 30 Coding + 60 Advanced) ──────────────────────────────────
export const JAVA_LEVELS = [];

const javaMCQs = [
    { q: 'Which is the correct way to declare a variable?', opts: ['int x = 10;', 'x int = 10;', 'int = x 10;', 'declare int x'], ans: 0 },
    { q: 'Default value of int?', opts: ['0', 'null', 'undefined', '1'], ans: 0 },
    { q: 'Size of int in Java?', opts: ['2 bytes', '4 bytes', '8 bytes', 'depends'], ans: 1 },
    { q: 'Which is NOT a primitive type?', opts: ['int', 'float', 'String', 'char'], ans: 2 },
    { q: 'JVM stands for?', opts: ['Java Variable Machine', 'Java Virtual Machine', 'Java Verified Method', 'None'], ans: 1 },
    { q: 'Which is entry point?', opts: ['start()', 'main()', 'run()', 'init()'], ans: 1 },
    { q: 'Which keyword is used for constants?', opts: ['static', 'const', 'final', 'fixed'], ans: 2 },
    { q: 'Output of: System.out.println(5+5+"Java");', opts: ['10Java', 'Java10', '5+5Java', 'Error'], ans: 0 },
    { q: 'Which type stores decimal?', opts: ['int', 'double', 'char', 'boolean'], ans: 1 },
    { q: 'Which symbol ends statement?', opts: ['.', ',', ';', ':'], ans: 2 }
];

const javaCodingProblems = [
    // EASY (1-10)
    { 
        title: 'Print "Hello World"', 
        desc: 'Print the text "Hello World" to the console.\n\nInstructions:\n- Use System.out.println() to print\n- Output should be exactly: Hello World', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n        // Use: System.out.println("Hello World");\n    }\n}',
        testCases: [{ input: [], expected: 'Hello World' }]
    },
    { 
        title: 'Print your name', 
        desc: 'Print your name to the console.\n\nInstructions:\n- Use System.out.println() to print your name\n- For this exercise, print: John Doe\n\nExample Output:\nJohn Doe', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n        // Use: System.out.println("John Doe");\n    }\n}',
        testCases: [{ input: [], expected: 'John Doe' }]
    },
    { 
        title: 'Add two numbers', 
        desc: 'Add two numbers and print the result.\n\nGiven:\n- int a = 5;\n- int b = 10;\n\nTask:\n- Calculate sum = a + b\n- Print the sum\n\nExample Output:\n15', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int a = 5;\n        int b = 10;\n        // Calculate sum and print it\n    }\n}',
        testCases: [{ input: [], expected: '15' }]
    },
    { 
        title: 'Find square of number', 
        desc: 'Calculate and print the square of a number.\n\nGiven:\n- int n = 7;\n\nTask:\n- Calculate square = n * n\n- Print the square\n\nExample Output:\n49', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = 7;\n        // Calculate square and print it\n    }\n}',
        testCases: [{ input: [], expected: '49' }]
    },
    { 
        title: 'Check even/odd', 
        desc: 'Check if a number is even or odd.\n\nGiven:\n- int num = 10;\n\nTask:\n- If num is even, print "Even"\n- If num is odd, print "Odd"\n- Hint: Use num % 2 == 0 to check\n\nExample Output:\nEven', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int num = 10;\n        // Check if even or odd and print result\n    }\n}',
        testCases: [{ input: [], expected: 'Even' }]
    },
    { 
        title: 'Swap two numbers', 
        desc: 'Swap two numbers and print them.\n\nGiven:\n- int a = 5;\n- int b = 10;\n\nTask:\n- Swap the values (a becomes 10, b becomes 5)\n- Print both numbers after swapping on separate lines\n- Hint: Use a temporary variable\n\nExample Output:\n10\n5', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int a = 5;\n        int b = 10;\n        // Swap a and b, then print them\n    }\n}',
        testCases: [{ input: [], expected: '10\n5' }]
    },
    { 
        title: 'Find largest of 2 numbers', 
        desc: 'Find and print the largest of two numbers.\n\nGiven:\n- int a = 15;\n- int b = 20;\n\nTask:\n- Compare a and b\n- Print the larger number\n- Hint: Use if-else\n\nExample Output:\n20', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int a = 15;\n        int b = 20;\n        // Find and print the largest number\n    }\n}',
        testCases: [{ input: [], expected: '20' }]
    },
    { 
        title: 'Convert Celsius → Fahrenheit', 
        desc: 'Convert temperature from Celsius to Fahrenheit.\n\nGiven:\n- double celsius = 25.0;\n\nTask:\n- Use formula: fahrenheit = (celsius * 9/5) + 32\n- Print the fahrenheit value\n\nExample Output:\n77.0', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        double celsius = 25.0;\n        // Convert to fahrenheit and print\n    }\n}',
        testCases: [{ input: [], expected: '77.0' }]
    },
    { 
        title: 'Input and print number', 
        desc: 'For this exercise, just print the number 42.\n\nTask:\n- Print the number 42\n\nExample Output:\n42', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        // Print 42\n    }\n}',
        testCases: [{ input: [], expected: '42' }]
    },
    { 
        title: 'Print ASCII value', 
        desc: 'Print the ASCII value of a character.\n\nGiven:\n- char c = \'A\';\n\nTask:\n- Convert char to int to get ASCII value\n- Print the ASCII value\n\nExample Output:\n65', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        char c = \'A\';\n        // Print ASCII value of c\n    }\n}',
        testCases: [{ input: [], expected: '65' }]
    },
    
    // MEDIUM (11-20)
    { 
        title: 'Find largest of 3 numbers', 
        desc: 'Find and print the largest of three numbers.\n\nGiven:\n- int a = 10;\n- int b = 25;\n- int c = 15;\n\nTask:\n- Compare all three numbers\n- Print the largest one\n\nExample Output:\n25', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int a = 10;\n        int b = 25;\n        int c = 15;\n        // Find and print the largest\n    }\n}',
        testCases: [{ input: [], expected: '25' }]
    },
    { 
        title: 'Check positive/negative', 
        desc: 'Check if a number is positive, negative, or zero.\n\nGiven:\n- int n = -5;\n\nTask:\n- If n > 0, print "Positive"\n- If n < 0, print "Negative"\n- If n == 0, print "Zero"\n\nExample Output:\nNegative', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = -5;\n        // Check and print result\n    }\n}',
        testCases: [{ input: [], expected: 'Negative' }]
    },
    { 
        title: 'Simple interest', 
        desc: 'Calculate simple interest.\n\nGiven:\n- double principal = 1000;\n- double rate = 5;\n- double time = 2;\n\nTask:\n- Formula: SI = (principal * rate * time) / 100\n- Print the simple interest\n\nExample Output:\n100.0', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        double principal = 1000;\n        double rate = 5;\n        double time = 2;\n        // Calculate and print SI\n    }\n}',
        testCases: [{ input: [], expected: '100.0' }]
    },
    { 
        title: 'Area of circle', 
        desc: 'Calculate area of a circle.\n\nGiven:\n- double radius = 7.0;\n\nTask:\n- Formula: area = π * radius * radius\n- Use Math.PI for π\n- Print the area\n\nExample Output:\n153.93804002589985', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        double radius = 7.0;\n        // Calculate and print area\n    }\n}',
        testCases: [{ input: [], expected: '153.93804002589985' }]
    },
    { 
        title: 'Reverse number', 
        desc: 'Reverse the digits of a number.\n\nGiven:\n- int n = 1234;\n\nTask:\n- Reverse the number (1234 → 4321)\n- Print the reversed number\n\nHint: Use % 10 to get last digit, / 10 to remove it\n\nExample Output:\n4321', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = 1234;\n        // Reverse and print\n    }\n}',
        testCases: [{ input: [], expected: '4321' }]
    },
    { 
        title: 'Count digits', 
        desc: 'Count the number of digits in a number.\n\nGiven:\n- int n = 12345;\n\nTask:\n- Count how many digits are in n\n- Print the count\n\nHint: Keep dividing by 10 until n becomes 0\n\nExample Output:\n5', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = 12345;\n        // Count and print digits\n    }\n}',
        testCases: [{ input: [], expected: '5' }]
    },
    { 
        title: 'Sum of digits', 
        desc: 'Find the sum of all digits in a number.\n\nGiven:\n- int n = 1234;\n\nTask:\n- Add all digits (1 + 2 + 3 + 4 = 10)\n- Print the sum\n\nHint: Use % 10 to get each digit\n\nExample Output:\n10', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = 1234;\n        // Calculate and print sum\n    }\n}',
        testCases: [{ input: [], expected: '10' }]
    },
    { 
        title: 'Palindrome number', 
        desc: 'Check if a number is a palindrome.\n\nGiven:\n- int n = 121;\n\nTask:\n- Check if number reads same forwards and backwards\n- Print "Palindrome" or "Not Palindrome"\n\nExample Output:\nPalindrome', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = 121;\n        // Check and print result\n    }\n}',
        testCases: [{ input: [], expected: 'Palindrome' }]
    },
    { 
        title: 'Power of number', 
        desc: 'Calculate power of a number.\n\nGiven:\n- int base = 2;\n- int exp = 3;\n\nTask:\n- Calculate base^exp (2^3 = 8)\n- Print the result\n\nHint: Use loop or Math.pow()\n\nExample Output:\n8', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int base = 2;\n        int exp = 3;\n        // Calculate and print power\n    }\n}',
        testCases: [{ input: [], expected: '8' }]
    },
    { 
        title: 'Check leap year', 
        desc: 'Check if a year is a leap year.\n\nGiven:\n- int year = 2024;\n\nTask:\n- A year is leap if:\n  • Divisible by 4 AND not by 100\n  • OR divisible by 400\n- Print "Leap Year" or "Not Leap Year"\n\nExample Output:\nLeap Year', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int year = 2024;\n        // Check and print result\n    }\n}',
        testCases: [{ input: [], expected: 'Leap Year' }]
    },
    
    // ADVANCED (21-30)
    { 
        title: 'Armstrong number', 
        desc: 'Check if a number is an Armstrong number.\n\nGiven:\n- int n = 153;\n\nTask:\n- Armstrong number: sum of cubes of digits equals the number\n- Example: 153 = 1³ + 5³ + 3³ = 1 + 125 + 27 = 153\n- Print "Armstrong" or "Not Armstrong"\n\nExample Output:\nArmstrong', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = 153;\n        // Check and print result\n    }\n}',
        testCases: [{ input: [], expected: 'Armstrong' }]
    },
    { 
        title: 'Fibonacci series (n terms)', 
        desc: 'Print first n terms of Fibonacci series.\n\nGiven:\n- int n = 7;\n\nTask:\n- Print first 7 Fibonacci numbers separated by spaces\n- Series: 0, 1, 1, 2, 3, 5, 8, ...\n- Each number is sum of previous two\n\nExample Output:\n0 1 1 2 3 5 8', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = 7;\n        // Print Fibonacci series\n    }\n}',
        testCases: [{ input: [], expected: '0 1 1 2 3 5 8' }]
    },
    { 
        title: 'Prime number check', 
        desc: 'Check if a number is prime.\n\nGiven:\n- int n = 17;\n\nTask:\n- Prime number: divisible only by 1 and itself\n- Print "Prime" or "Not Prime"\n\nHint: Check divisibility from 2 to √n\n\nExample Output:\nPrime', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = 17;\n        // Check and print result\n    }\n}',
        testCases: [{ input: [], expected: 'Prime' }]
    },
    { 
        title: 'Sum of N numbers', 
        desc: 'Find sum of first N natural numbers.\n\nGiven:\n- int n = 10;\n\nTask:\n- Calculate 1 + 2 + 3 + ... + 10\n- Print the sum\n\nHint: Use loop or formula n*(n+1)/2\n\nExample Output:\n55', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = 10;\n        // Calculate and print sum\n    }\n}',
        testCases: [{ input: [], expected: '55' }]
    },
    { 
        title: 'Factorial', 
        desc: 'Calculate factorial of a number.\n\nGiven:\n- int n = 5;\n\nTask:\n- Factorial: 5! = 5 × 4 × 3 × 2 × 1 = 120\n- Print the factorial\n\nExample Output:\n120', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = 5;\n        // Calculate and print factorial\n    }\n}',
        testCases: [{ input: [], expected: '120' }]
    },
    { 
        title: 'GCD of two numbers', 
        desc: 'Find GCD (Greatest Common Divisor) of two numbers.\n\nGiven:\n- int a = 48;\n- int b = 18;\n\nTask:\n- Find largest number that divides both\n- Print the GCD\n\nHint: Use Euclidean algorithm\n\nExample Output:\n6', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int a = 48;\n        int b = 18;\n        // Find and print GCD\n    }\n}',
        testCases: [{ input: [], expected: '6' }]
    },
    { 
        title: 'LCM', 
        desc: 'Find LCM (Least Common Multiple) of two numbers.\n\nGiven:\n- int a = 12;\n- int b = 18;\n\nTask:\n- Find smallest number divisible by both\n- Formula: LCM = (a * b) / GCD(a, b)\n- Print the LCM\n\nExample Output:\n36', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int a = 12;\n        int b = 18;\n        // Calculate and print LCM\n    }\n}',
        testCases: [{ input: [], expected: '36' }]
    },
    { 
        title: 'Binary to decimal', 
        desc: 'Convert binary number to decimal.\n\nGiven:\n- String binary = "1010";\n\nTask:\n- Convert binary to decimal\n- 1010 (binary) = 10 (decimal)\n- Print the decimal value\n\nExample Output:\n10', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        String binary = "1010";\n        // Convert and print decimal\n    }\n}',
        testCases: [{ input: [], expected: '10' }]
    },
    { 
        title: 'Decimal to binary', 
        desc: 'Convert decimal number to binary.\n\nGiven:\n- int decimal = 10;\n\nTask:\n- Convert decimal to binary\n- 10 (decimal) = 1010 (binary)\n- Print the binary value\n\nExample Output:\n1010', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int decimal = 10;\n        // Convert and print binary\n    }\n}',
        testCases: [{ input: [], expected: '1010' }]
    },
    { 
        title: 'Number pattern (basic)', 
        desc: 'Print a number pattern.\n\nGiven:\n- int n = 4;\n\nTask:\n- Print pattern:\n  1\n  1 2\n  1 2 3\n  1 2 3 4\n\nExample Output:\n1\n1 2\n1 2 3\n1 2 3 4', 
        syntax: 'class Solution {\n    public static void main(String[] args) {\n        int n = 4;\n        // Print pattern\n    }\n}',
        testCases: [{ input: [], expected: '1\n1 2\n1 2 3\n1 2 3 4' }]
    }
];

// Generate 400 levels: Module 1-10 (40 each)
for (let i = 1; i <= 400; i++) {
    if (i <= 10) {
        // First 10: MCQ Questions
        const mcq = javaMCQs[i - 1];
        JAVA_LEVELS.push({
            id: i,
            title: `Java Basics ${i}`,
            type: 'MCQ',
            question: mcq.q,
            options: mcq.opts,
            answer: mcq.ans,
            explanation: `Java fundamental concept`,
            phase: 'Module 1: Basics'
        });
    } else if (i <= 40) {
        // Next 30: Coding Problems (11-40)
        const problem = javaCodingProblems[i - 11];
        JAVA_LEVELS.push({
            id: i,
            title: problem.title,
            type: 'CODING',
            desc: problem.desc,
            syntax: problem.syntax,
            params: '',
            testCases: problem.testCases || [],
            explanation: problem.desc,
            phase: 'Module 1: Basics'
        });
    } else if (i <= 80) {
        // Module 2: Operators & Control Flow (41-80)
        const module2Question = JAVA_MODULE2_QUESTIONS[i - 41];
        if (module2Question) {
            JAVA_LEVELS.push({
                id: i,
                title: module2Question.title,
                type: module2Question.type,
                question: module2Question.question,
                options: module2Question.options,
                answer: module2Question.answer,
                desc: module2Question.desc,
                syntax: module2Question.syntax,
                params: module2Question.params,
                testCases: module2Question.testCases,
                explanation: module2Question.explanation,
                phase: 'Module 2: Operators & Control Flow'
            });
        }
    } else if (i <= 120) {
        // Module 3: Loops & Pattern Printing (81-120)
        const module3Question = JAVA_MODULE3_QUESTIONS[i - 81];
        if (module3Question) {
            JAVA_LEVELS.push({
                id: i,
                title: module3Question.title,
                type: module3Question.type,
                question: module3Question.question,
                options: module3Question.options,
                answer: module3Question.answer,
                desc: module3Question.desc,
                syntax: module3Question.syntax,
                params: module3Question.params,
                testCases: module3Question.testCases,
                explanation: module3Question.explanation,
                phase: 'Module 3: Loops & Pattern Printing'
            });
        }
    } else if (i <= 160) {
        // Module 4: Methods & Recursion (121-160)
        const module4Question = JAVA_MODULE4_QUESTIONS[i - 121];
        if (module4Question) {
            JAVA_LEVELS.push({
                id: i,
                title: module4Question.title,
                type: module4Question.type,
                question: module4Question.question,
                options: module4Question.options,
                answer: module4Question.answer,
                desc: module4Question.desc,
                syntax: module4Question.syntax,
                params: module4Question.params,
                testCases: module4Question.testCases,
                explanation: module4Question.explanation,
                phase: 'Module 4: Methods & Recursion'
            });
        }
    } else if (i <= 200) {
        // Module 5: Arrays (161-200)
        const module5Question = JAVA_MODULE5_QUESTIONS[i - 161];
        if (module5Question) {
            JAVA_LEVELS.push({
                id: i,
                title: module5Question.title,
                type: module5Question.type,
                question: module5Question.question,
                options: module5Question.options,
                answer: module5Question.answer,
                desc: module5Question.desc,
                syntax: module5Question.syntax,
                params: module5Question.params,
                testCases: module5Question.testCases,
                explanation: module5Question.explanation,
                phase: 'Module 5: Arrays'
            });
        }
    } else if (i <= 240) {
        // Module 6: Strings (201-240)
        const module6Question = JAVA_MODULE6_QUESTIONS[i - 201];
        if (module6Question) {
            JAVA_LEVELS.push({
                id: i,
                title: module6Question.title,
                type: module6Question.type,
                question: module6Question.question,
                options: module6Question.options,
                answer: module6Question.answer,
                desc: module6Question.desc,
                syntax: module6Question.syntax,
                params: module6Question.params,
                testCases: module6Question.testCases,
                explanation: module6Question.explanation,
                phase: 'Module 6: Strings'
            });
        }
    } else if (i <= 280) {
        // Module 7: OOP Core (241-280)
        const module7Question = JAVA_MODULE7_QUESTIONS[i - 241];
        if (module7Question) {
            JAVA_LEVELS.push({
                id: i,
                title: module7Question.title,
                type: module7Question.type,
                question: module7Question.question,
                options: module7Question.options,
                answer: module7Question.answer,
                desc: module7Question.desc,
                syntax: module7Question.syntax,
                params: module7Question.params,
                testCases: module7Question.testCases,
                explanation: module7Question.explanation,
                phase: 'Module 7: OOP Core'
            });
        }
    } else if (i <= 320) {
        // Module 8: OOP Advanced (281-320)
        const module8Question = JAVA_MODULE8_QUESTIONS[i - 281];
        if (module8Question) {
            JAVA_LEVELS.push({
                id: i,
                title: module8Question.title,
                type: module8Question.type,
                question: module8Question.question,
                options: module8Question.options,
                answer: module8Question.answer,
                desc: module8Question.desc,
                syntax: module8Question.syntax,
                params: module8Question.params,
                testCases: module8Question.testCases,
                explanation: module8Question.explanation,
                phase: 'Module 8: OOP Advanced'
            });
        }
    } else if (i <= 360) {
        // Module 9: Collections Framework (321-360)
        const module9Question = JAVA_MODULE9_QUESTIONS[i - 321];
        if (module9Question) {
            JAVA_LEVELS.push({
                id: i,
                title: module9Question.title,
                type: module9Question.type,
                question: module9Question.question,
                options: module9Question.options,
                answer: module9Question.answer,
                desc: module9Question.desc,
                syntax: module9Question.syntax,
                params: module9Question.params,
                testCases: module9Question.testCases,
                explanation: module9Question.explanation,
                phase: 'Module 9: Collections Framework'
            });
        }
    } else if (i <= 400) {
        // Module 10: Exception Handling & File I/O (361-400)
        const module10Question = JAVA_MODULE10_QUESTIONS[i - 361];
        if (module10Question) {
            JAVA_LEVELS.push({
                id: i,
                title: module10Question.title,
                type: module10Question.type,
                question: module10Question.question,
                options: module10Question.options,
                answer: module10Question.answer,
                desc: module10Question.desc,
                syntax: module10Question.syntax,
                params: module10Question.params,
                testCases: module10Question.testCases,
                explanation: module10Question.explanation,
                phase: 'Module 10: Exception Handling & File I/O'
            });
        }
    }
}

// ── C++ LEVELS (100 total) ──────────────────────────────────
export const CPP_LEVELS = [];

const cppQuestions = [
    { q: 'What is a pointer?', opts: ['Integer variable', 'Memory address variable', 'String variable', 'Boolean variable'], ans: 1 },
    { q: 'Which operator accesses pointer value?', opts: ['&', '*', '->', '.'], ans: 1 },
    { q: 'What is a reference?', opts: ['Copy of variable', 'Alias to variable', 'Pointer to variable', 'New variable'], ans: 1 },
    { q: 'Which header for input/output?', opts: ['stdio.h', 'iostream', 'conio.h', 'fstream'], ans: 1 },
    { q: 'What is a class?', opts: ['Built-in type', 'User-defined type', 'Primitive type', 'Abstract type'], ans: 1 },
    { q: 'Which keyword for dynamic memory?', opts: ['malloc', 'new', 'alloc', 'create'], ans: 1 },
    { q: 'What is a destructor?', opts: ['Constructor', 'Cleanup function', 'Member function', 'Friend function'], ans: 1 },
    { q: 'Which loop is entry-controlled?', opts: ['do-while', 'while', 'goto', 'switch'], ans: 1 },
    { q: 'What is STL?', opts: ['System Template Library', 'Standard Template Library', 'String Template Library', 'Static Template Library'], ans: 1 },
    { q: 'Which container is LIFO?', opts: ['queue', 'vector', 'stack', 'list'], ans: 2 },
    { q: 'What is inheritance?', opts: ['Code hiding', 'Code reusability', 'Code duplication', 'Code deletion'], ans: 1 },
    { q: 'Which operator deallocates memory?', opts: ['free', 'delete', 'remove', 'clear'], ans: 1 },
    { q: 'What is a virtual function?', opts: ['Static function', 'Runtime polymorphism', 'Compile-time function', 'Inline function'], ans: 1 },
    { q: 'Which keyword prevents inheritance?', opts: ['static', 'final', 'sealed', 'const'], ans: 1 },
    { q: 'What is operator overloading?', opts: ['Creating new operators', 'Redefining operator behavior', 'Deleting operators', 'Hiding operators'], ans: 1 },
    { q: 'Which access specifier is default for class?', opts: ['public', 'private', 'protected', 'default'], ans: 1 },
    { q: 'What is a friend function?', opts: ['Member function', 'Non-member with access', 'Static function', 'Virtual function'], ans: 1 },
    { q: 'Which container is associative?', opts: ['vector', 'map', 'array', 'list'], ans: 1 },
    { q: 'What is multiple inheritance?', opts: ['One base class', 'Multiple base classes', 'No base class', 'Abstract base'], ans: 1 },
    { q: 'Which keyword makes variable constant?', opts: ['final', 'const', 'static', 'readonly'], ans: 1 },
    { q: 'What is a template?', opts: ['Specific type', 'Generic programming', 'Abstract class', 'Interface'], ans: 1 },
    { q: 'Which operator is scope resolution?', opts: ['.', '->', '::', '->*'], ans: 2 },
    { q: 'What is exception handling?', opts: ['Compile errors', 'Runtime error management', 'Syntax errors', 'Logic errors'], ans: 1 },
    { q: 'Which keyword throws exception?', opts: ['throws', 'throw', 'try', 'catch'], ans: 1 },
    { q: 'What is a namespace?', opts: ['Class scope', 'Scope for identifiers', 'Function scope', 'Block scope'], ans: 1 },
    { q: 'Which loop checks condition last?', opts: ['while', 'for', 'do-while', 'foreach'], ans: 2 },
    { q: 'What is encapsulation?', opts: ['Data hiding', 'Data exposure', 'Data duplication', 'Data deletion'], ans: 0 },
    { q: 'Which keyword for inline function?', opts: ['static', 'inline', 'virtual', 'const'], ans: 1 },
    { q: 'What is polymorphism?', opts: ['One form', 'Many forms', 'No form', 'Static form'], ans: 1 },
    { q: 'Which container is sequential?', opts: ['map', 'set', 'vector', 'unordered_map'], ans: 2 },
    { q: 'What is abstraction?', opts: ['Showing details', 'Hiding complexity', 'Code duplication', 'Code deletion'], ans: 1 },
    { q: 'Which keyword for static member?', opts: ['const', 'static', 'final', 'virtual'], ans: 1 },
    { q: 'What is a pure virtual function?', opts: ['Has implementation', 'No implementation', 'Static function', 'Inline function'], ans: 1 },
    { q: 'Which operator is member access?', opts: ['::', '->', '.', '->*'], ans: 2 },
    { q: 'What is constructor overloading?', opts: ['One constructor', 'Multiple constructors', 'No constructor', 'Virtual constructor'], ans: 1 },
    { q: 'Which keyword for constant pointer?', opts: ['const', 'static', 'final', 'readonly'], ans: 0 },
    { q: 'What is a copy constructor?', opts: ['Default constructor', 'Copies object', 'Destructor', 'Static constructor'], ans: 1 },
    { q: 'Which container is ordered?', opts: ['unordered_map', 'map', 'unordered_set', 'hash_map'], ans: 1 },
    { q: 'What is function overloading?', opts: ['Same name, different parameters', 'Different name, same parameters', 'Same signature', 'Virtual function'], ans: 0 },
    { q: 'Which keyword for abstract class?', opts: ['abstract', 'virtual', 'pure', 'interface'], ans: 1 },
    { q: 'What is RAII?', opts: ['Resource Acquisition Is Initialization', 'Random Access Is Initialization', 'Resource Allocation Is Important', 'Runtime Access Is Initialization'], ans: 0 },
    { q: 'Which container is FIFO?', opts: ['stack', 'queue', 'vector', 'list'], ans: 1 },
    { q: 'What is a smart pointer?', opts: ['Raw pointer', 'Automatic memory management', 'Manual pointer', 'Static pointer'], ans: 1 },
    { q: 'Which keyword for type casting?', opts: ['cast', 'static_cast', 'convert', 'change'], ans: 1 },
    { q: 'What is move semantics?', opts: ['Copy data', 'Transfer ownership', 'Delete data', 'Duplicate data'], ans: 1 },
    { q: 'Which container allows duplicates?', opts: ['set', 'map', 'multiset', 'unordered_set'], ans: 2 },
    { q: 'What is a lambda expression?', opts: ['Named function', 'Anonymous function', 'Static function', 'Virtual function'], ans: 1 },
    { q: 'Which keyword for compile-time constant?', opts: ['const', 'constexpr', 'static', 'final'], ans: 1 },
    { q: 'What is the auto keyword?', opts: ['Manual type', 'Type inference', 'Static type', 'Dynamic type'], ans: 1 },
    { q: 'Which standard is C++11?', opts: ['Old standard', 'Modern C++ standard', 'Future standard', 'Deprecated standard'], ans: 1 }
];

for (let i = 1; i <= 100; i++) {
    if (i <= 50) {
        const template = cppQuestions[i - 1];
        CPP_LEVELS.push({
            id: i,
            title: `C++ Concept ${i}`,
            type: 'MCQ',
            question: template.q,
            options: template.opts,
            answer: template.ans,
            explanation: `C++ fundamental: ${template.q}`
        });
    } else {
        CPP_LEVELS.push({
            id: i,
            title: `C++ Coding ${i}`,
            type: 'CODING',
            desc: `Write a C++ function to solve problem ${i - 50}`,
            syntax: 'int solution() {\n    // Your code here\n    return 0;\n}',
            params: '',
            testCases: [],
            explanation: 'Implement the solution in C++'
        });
    }
}

// ── PYTHON LEVELS (100 total) ──────────────────────────────────
export const PYTHON_LEVELS = [];

const pythonQuestions = [
    { q: 'What is a list?', opts: ['Mutable sequence', 'Immutable sequence', 'Dictionary', 'Set'], ans: 0, type: 'MCQ' },
    { q: 'Which keyword defines function?', opts: ['def', 'function', 'func', 'define'], ans: 0, type: 'MCQ' },
    { q: 'What is a tuple?', opts: ['Immutable sequence', 'Mutable sequence', 'Dictionary', 'Set'], ans: 0, type: 'MCQ' },
    { q: 'Which method adds to list?', opts: ['append', 'add', 'insert', 'push'], ans: 0, type: 'MCQ' },
    { q: 'What is a dictionary?', opts: ['Key-value pairs', 'Ordered list', 'Unordered list', 'Tuple'], ans: 0, type: 'MCQ' },
    { q: 'Which loop iterates sequences?', opts: ['for', 'while', 'do-while', 'foreach'], ans: 0, type: 'MCQ' },
    { q: 'What is list comprehension?', opts: ['Concise list creation', 'List method', 'List function', 'List class'], ans: 0, type: 'MCQ' },
    { q: 'Which keyword handles exceptions?', opts: ['try', 'catch', 'throw', 'error'], ans: 0, type: 'MCQ' },
    { q: 'What is a lambda?', opts: ['Anonymous function', 'Named function', 'Class method', 'Module'], ans: 0, type: 'MCQ' },
    { q: 'Which method removes from list?', opts: ['remove', 'delete', 'pop', 'clear'], ans: 0, type: 'MCQ' },
];

for (let i = 1; i <= 100; i++) {
    if (i <= 50) {
        const template = pythonQuestions[(i - 1) % pythonQuestions.length];
        PYTHON_LEVELS.push({
            id: i,
            title: `Python Concept ${i}`,
            type: 'MCQ',
            question: template.q,
            options: template.opts,
            answer: template.ans,
            explanation: `Python fundamental: ${template.q}`
        });
    } else {
        PYTHON_LEVELS.push({
            id: i,
            title: `Python Coding ${i}`,
            type: 'CODING',
            desc: `Write a Python function to solve problem ${i - 50}`,
            syntax: 'def solution():\n    # Your code here\n    return 0',
            params: '',
            testCases: [[42]],
            explanation: 'Implement the solution in Python'
        });
    }
}

// ── GO LEVELS (100 total) ──────────────────────────────────
export const GO_LEVELS = [];

const goQuestions = [
    { q: 'What is a goroutine?', opts: ['Lightweight thread', 'Heavy thread', 'Process', 'Function'], ans: 0, type: 'MCQ' },
    { q: 'Which keyword starts goroutine?', opts: ['go', 'start', 'run', 'thread'], ans: 0, type: 'MCQ' },
    { q: 'What is a channel?', opts: ['Communication pipe', 'Data structure', 'Function', 'Variable'], ans: 0, type: 'MCQ' },
    { q: 'Which keyword declares variable?', opts: ['var', 'let', 'const', 'define'], ans: 0, type: 'MCQ' },
    { q: 'What is a slice?', opts: ['Dynamic array', 'Static array', 'Map', 'Struct'], ans: 0, type: 'MCQ' },
    { q: 'Which keyword defines function?', opts: ['func', 'function', 'def', 'fn'], ans: 0, type: 'MCQ' },
    { q: 'What is a struct?', opts: ['Custom type', 'Built-in type', 'Interface', 'Channel'], ans: 0, type: 'MCQ' },
    { q: 'Which keyword for constants?', opts: ['const', 'final', 'static', 'readonly'], ans: 0, type: 'MCQ' },
    { q: 'What is defer?', opts: ['Delayed execution', 'Immediate execution', 'Async execution', 'Sync execution'], ans: 0, type: 'MCQ' },
    { q: 'Which loop exists in Go?', opts: ['for', 'while', 'do-while', 'foreach'], ans: 0, type: 'MCQ' },
];

for (let i = 1; i <= 100; i++) {
    if (i <= 50) {
        const template = goQuestions[(i - 1) % goQuestions.length];
        GO_LEVELS.push({
            id: i,
            title: `Go Concept ${i}`,
            type: 'MCQ',
            question: template.q,
            options: template.opts,
            answer: template.ans,
            explanation: `Go fundamental: ${template.q}`
        });
    } else {
        GO_LEVELS.push({
            id: i,
            title: `Go Coding ${i}`,
            type: 'CODING',
            desc: `Write a Go function to solve problem ${i - 50}`,
            syntax: 'func solution() int {\n    // Your code here\n    return 0\n}',
            params: '',
            testCases: [[42]],
            explanation: 'Implement the solution in Go'
        });
    }
}

// ── PHASES (for each language) ──────────────────────────────────
export const LANGUAGE_PHASES = {
    java: [
        { name: 'Module 1: Basics', start: 0, end: 39, label: 'Module 1: Java Basics' },
        { name: 'Module 2: Operators & Control Flow', start: 40, end: 79, label: 'Module 2: Operators & Control Flow' },
        { name: 'Module 3: Loops & Pattern Printing', start: 80, end: 119, label: 'Module 3: Loops & Pattern Printing' },
        { name: 'Module 4: Methods & Recursion', start: 120, end: 159, label: 'Module 4: Methods & Recursion' },
        { name: 'Module 5: Arrays', start: 160, end: 199, label: 'Module 5: Arrays' },
        { name: 'Module 6: Strings', start: 200, end: 239, label: 'Module 6: Strings' },
        { name: 'Module 7: OOP Core', start: 240, end: 279, label: 'Module 7: OOP Core' },
        { name: 'Module 8: OOP Advanced', start: 280, end: 319, label: 'Module 8: OOP Advanced' },
        { name: 'Module 9: Collections Framework', start: 320, end: 359, label: 'Module 9: Collections Framework' },
        { name: 'Module 10: Exception Handling & File I/O', start: 360, end: 399, label: 'Module 10: Exception Handling & File I/O' }
    ],
    cpp: [
        { name: 'Basics', start: 0, end: 24, label: 'Phase 1: C++ Basics' },
        { name: 'Pointers', start: 25, end: 49, label: 'Phase 2: Pointers & Memory' },
        { name: 'STL', start: 50, end: 74, label: 'Phase 3: STL & Templates' },
        { name: 'Advanced', start: 75, end: 99, label: 'Phase 4: Advanced C++' }
    ],
    python: [
        { name: 'Basics', start: 0, end: 24, label: 'Phase 1: Python Basics' },
        { name: 'Data Structures', start: 25, end: 49, label: 'Phase 2: Data Structures' },
        { name: 'Advanced', start: 50, end: 74, label: 'Phase 3: Advanced Python' },
        { name: 'Expert', start: 75, end: 99, label: 'Phase 4: Expert Level' }
    ],
    go: [
        { name: 'Basics', start: 0, end: 24, label: 'Phase 1: Go Basics' },
        { name: 'Concurrency', start: 25, end: 49, label: 'Phase 2: Goroutines & Channels' },
        { name: 'Advanced', start: 50, end: 74, label: 'Phase 3: Advanced Go' },
        { name: 'Expert', start: 75, end: 99, label: 'Phase 4: Expert Level' }
    ]
};

// ── THEORIES (for each language) ──────────────────────────────────
export const LANGUAGE_THEORIES = {
    java: { 
        title: 'Java Mastery', 
        content: [
            'Module 1: Variables, Data Types, Input/Output',
            'Module 2: Operators & Control Flow (if, switch, ternary)',
            'Module 3: Loops & Pattern Printing (for, while, do-while, patterns)',
            'Module 4: Methods & Recursion (functions, method overloading, recursion)',
            'Module 5: Arrays (traversal, searching, sorting, DSA patterns)',
            'Module 6: Strings (immutability, manipulation, interview patterns)',
            'Module 7: OOP Core (classes, objects, encapsulation, constructors)',
            'Module 8: OOP Advanced (inheritance, polymorphism, abstraction, design patterns)',
            'Module 9: Collections Framework (List, Set, Map, Queue, LRU Cache)',
            'Module 10: Exception Handling & File I/O (try-catch, custom exceptions, file operations)'
        ] 
    },
    cpp: { title: 'C++ Mastery', content: ['Memory Management', 'Pointers & References', 'STL Containers', 'Templates'] },
    python: { title: 'Python Mastery', content: ['Data Structures', 'List Comprehensions', 'Decorators', 'Generators'] },
    go: { title: 'Go Mastery', content: ['Goroutines', 'Channels', 'Interfaces', 'Concurrency Patterns'] }
};
