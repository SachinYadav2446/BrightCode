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

// Helper to shuffle options and answer
function shuffleOptionsAndAnswer(opts, correctIdx) {
    if (!opts || opts.length === 0) return { options: [], answer: 0 };
    const items = opts.map((opt, idx) => ({ opt, isCorrect: idx === correctIdx }));
    // Shuffle using Fisher-Yates
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [items[i], items[j]] = [items[j], items[i]];
    }
    return {
        options: items.map(x => x.opt),
        answer: items.findIndex(x => x.isCorrect)
    };
}

// Build Java MCQ Levels (100 total: 10 modules * 10 MCQs)
let javaLevelId = 1;

// Module 1 Basics (10 MCQs)
javaMCQs.forEach((mcq, index) => {
    const shuffled = shuffleOptionsAndAnswer(mcq.opts, mcq.ans);
    JAVA_LEVELS.push({
        id: javaLevelId++,
        title: `Java Basics ${index + 1}`,
        type: 'MCQ',
        question: mcq.q,
        options: shuffled.options,
        answer: shuffled.answer,
        explanation: `Java fundamental concept`,
        phase: 'Module 1: Basics'
    });
});

// Helper function to push module MCQs
function addJavaModuleMCQs(moduleName, questionList) {
    // Filter only MCQ questions
    const mcqs = questionList.filter(q => q.type === 'MCQ');
    mcqs.forEach((q, index) => {
        const shuffled = shuffleOptionsAndAnswer(q.options, q.answer);
        JAVA_LEVELS.push({
            id: javaLevelId++,
            title: q.title || `${moduleName} Q${index + 1}`,
            type: 'MCQ',
            question: q.question,
            options: shuffled.options,
            answer: shuffled.answer,
            explanation: q.explanation || `${moduleName} fundamental concept`,
            phase: moduleName
        });
    });
}

addJavaModuleMCQs('Module 2: Operators & Control Flow', JAVA_MODULE2_QUESTIONS);
addJavaModuleMCQs('Module 3: Loops & Pattern Printing', JAVA_MODULE3_QUESTIONS);
addJavaModuleMCQs('Module 4: Methods & Recursion', JAVA_MODULE4_QUESTIONS);
addJavaModuleMCQs('Module 5: Arrays', JAVA_MODULE5_QUESTIONS);
addJavaModuleMCQs('Module 6: Strings', JAVA_MODULE6_QUESTIONS);
addJavaModuleMCQs('Module 7: OOP Core', JAVA_MODULE7_QUESTIONS);
addJavaModuleMCQs('Module 8: OOP Advanced', JAVA_MODULE8_QUESTIONS);
addJavaModuleMCQs('Module 9: Collections Framework', JAVA_MODULE9_QUESTIONS);
addJavaModuleMCQs('Module 10: Exception Handling & File I/O', JAVA_MODULE10_QUESTIONS);
// ── C++ LEVELS (50 total MCQs) ──────────────────────────────────
export const CPP_LEVELS = [];

const cppQuestions = [
    { q: 'What is a pointer?', opts: ['A variable that stores address', 'A function', 'A loop', 'A data type'], ans: 0 },
    { q: 'Which operator is used to access value at pointer address?', opts: ['&', '*', '->', '.'], ans: 1 },
    { q: 'What does STL stand for?', opts: ['Standard Template Library', 'Simple Template Library', 'Standard Type Library', 'None'], ans: 0 },
    { q: 'Which is a valid loop?', opts: ['for(int i=0;i<10;i++)', 'loop(i=0; i<10)', 'repeat(10)', 'for i in 1..10'], ans: 0 },
    { q: 'What is a class?', opts: ['Blueprint for objects', 'A function', 'A variable', 'A loop'], ans: 0 },
    { q: 'Which access specifier makes members private by default?', opts: ['struct', 'class', 'union', 'enum'], ans: 1 },
    { q: 'What is inheritance?', opts: ['Acquiring properties of another class', 'Creating a new function', 'Declaring variables', 'Using pointers'], ans: 0 },
    { q: 'Which is a valid comment in C++?', opts: ['// This is a comment', '/* This is a comment */', 'Both', 'None'], ans: 2 },
    { q: 'What is the size of char in C++?', opts: ['1 byte', '2 bytes', '4 bytes', '8 bytes'], ans: 0 },
    { q: 'Which function is used to print output?', opts: ['cout', 'print', 'echo', 'console.log'], ans: 0 },
    { q: 'Which operator is used for input?', opts: ['>>', '<<', '<', '>'], ans: 0 },
    { q: 'What is a reference?', opts: ['An alias for a variable', 'A pointer', 'A function', 'A data type'], ans: 0 },
    { q: 'Which is a correct array declaration?', opts: ['int arr[10];', 'int arr = new int[10];', 'int[] arr;', 'All of the above'], ans: 3 },
    { q: 'What is function overloading?', opts: ['Multiple functions with same name but different parameters', 'Functions with same name and parameters', 'Functions that call themselves', 'None'], ans: 0 },
    { q: 'Which keyword is used to allocate memory dynamically?', opts: ['new', 'malloc', 'alloc', 'create'], ans: 0 },
    { q: 'What is polymorphism?', opts: ['Many forms', 'One form', 'No forms', 'None'], ans: 0 },
    { q: 'Which is a valid constructor?', opts: ['ClassName() {}', 'void ClassName() {}', 'int ClassName() {}', 'None'], ans: 0 },
    { q: 'What is a destructor?', opts: ['Function called when object is destroyed', 'Function to create objects', 'Function to delete variables', 'None'], ans: 0 },
    { q: 'Which operator is used to access member of a class using pointer?', opts: ['->', '.', '*', '&'], ans: 0 },
    { q: 'What is a namespace?', opts: ['Scope for identifiers', 'A class', 'A function', 'A variable'], ans: 0 },
    { q: 'Which header file is needed for vector?', opts: ['#include <vector>', '#include <array>', '#include <list>', '#include <stack>'], ans: 0 },
    { q: 'What is a template?', opts: ['Generic data type', 'A function', 'A class', 'A variable'], ans: 0 },
    { q: 'Which is a valid string declaration?', opts: ['string s = "hello";', 'char s[] = "hello";', 'Both', 'None'], ans: 2 },
    { q: 'What is recursion?', opts: ['Function calling itself', 'Loop', 'Condition', 'None'], ans: 0 },
    { q: 'Which keyword is used to prevent inheritance?', opts: ['final', 'static', 'const', 'private'], ans: 0 },
    { q: 'What is encapsulation?', opts: ['Wrapping data and methods together', 'Inheritance', 'Polymorphism', 'None'], ans: 0 },
    { q: 'Which is a valid if statement?', opts: ['if(x > 10) {}', 'if x > 10 {}', 'if(x > 10); {}', 'None'], ans: 0 },
    { q: 'What is a switch statement?', opts: ['Multi-way branch', 'Loop', 'Function', 'Variable'], ans: 0 },
    { q: 'Which loop executes at least once?', opts: ['do-while', 'while', 'for', 'None'], ans: 0 },
    { q: 'What is the size of float in C++?', opts: ['4 bytes', '8 bytes', '2 bytes', 'Depends on compiler'], ans: 0 },
    { q: 'Which is a valid boolean value?', opts: ['true', 'True', 'TRUE', 'All'], ans: 0 },
    { q: 'What is an enum?', opts: ['User-defined data type', 'A class', 'A function', 'A variable'], ans: 0 },
    { q: 'Which operator is used for bitwise AND?', opts: ['&', '&&', '|', '||'], ans: 0 },
    { q: 'What is the size of double?', opts: ['8 bytes', '4 bytes', '2 bytes', '1 byte'], ans: 0 },
    { q: 'Which header is for input/output?', opts: ['#include <iostream>', '#include <stdio.h>', '#include <conio.h>', '#include <stdlib.h>'], ans: 0 },
    { q: 'What is a virtual function?', opts: ['Function that can be overridden', 'Static function', 'Constant function', 'None'], ans: 0 },
    { q: 'Which keyword is used to override a function?', opts: ['override', 'overload', 'virtual', 'None'], ans: 0 },
    { q: 'What is a friend function?', opts: ['Function that can access private members', 'Member function', 'Static function', 'None'], ans: 0 },
    { q: 'Which is a valid operator overloading?', opts: ['operator+() {}', 'overload+() {}', '+operator() {}', 'None'], ans: 0 },
    { q: 'What is the scope resolution operator?', opts: ['::', ':', '.', '->'], ans: 0 },
    { q: 'Which is a valid exception handling keyword?', opts: ['try', 'catch', 'throw', 'All'], ans: 3 },
    { q: 'What is RAII?', opts: ['Resource Acquisition Is Initialization', 'Random Access Initialization', 'Resource Allocation Is Input', 'None'], ans: 0 },
    { q: 'Which is a smart pointer?', opts: ['unique_ptr', 'shared_ptr', 'weak_ptr', 'All'], ans: 3 },
    { q: 'What is a lambda?', opts: ['Anonymous function', 'Named function', 'Member function', 'None'], ans: 0 },
    { q: 'Which is C++ version 11?', opts: ['C++11', 'C++0x', 'Both', 'None'], ans: 2 },
    { q: 'What is auto keyword?', opts: ['Automatic type deduction', 'Automatic variable', 'Automatic function', 'None'], ans: 0 }
];

cppQuestions.forEach((template, index) => {
    const shuffled = shuffleOptionsAndAnswer(template.opts, template.ans);
    CPP_LEVELS.push({
        id: index + 1,
        title: `C++ Concept ${index + 1}`,
        type: 'MCQ',
        question: template.q,
        options: shuffled.options,
        answer: shuffled.answer,
        explanation: `C++ fundamental: ${template.q}`
    });
});

// ── PYTHON LEVELS (50 total MCQs) ──────────────────────────────────
export const PYTHON_LEVELS = [];

const pythonQuestions = [
    { q: 'Which is the correct way to declare a variable?', opts: ['x = 10', 'int x = 10', 'x := 10', 'var x = 10'], ans: 0 },
    { q: 'Which data type is immutable?', opts: ['list', 'tuple', 'dict', 'set'], ans: 1 },
    { q: 'Which function is used to get length?', opts: ['len()', 'length()', 'size()', 'count()'], ans: 0 },
    { q: 'Which operator is used for exponentiation?', opts: ['**', '^', '^^', '*'], ans: 0 },
    { q: 'What is the output of print(2 + 3 * 2)?', opts: ['10', '8', '7', '5'], ans: 1 },
    { q: 'Which is a valid list?', opts: ['[1, 2, 3]', '(1, 2, 3)', '{1, 2, 3}', 'dict(1,2,3)'], ans: 0 },
    { q: 'Which keyword defines a function?', opts: ['def', 'function', 'fn', 'func'], ans: 0 },
    { q: 'Which loop is used for iterating over a sequence?', opts: ['for', 'while', 'do-while', 'foreach'], ans: 0 },
    { q: 'What is the output of print("Hello" * 3)?', opts: ['HelloHelloHello', 'Hello 3', 'Error', 'HelloHello'], ans: 0 },
    { q: 'Which is a valid comment in Python?', opts: ['# This is a comment', '/* This is a comment */', '// This is a comment', '-- This is a comment'], ans: 0 },
    { q: 'What is the index of the first element in a list?', opts: ['0', '1', '-1', 'First'], ans: 0 },
    { q: 'Which method adds an element to the end of a list?', opts: ['append()', 'add()', 'insert()', 'push()'], ans: 0 },
    { q: 'Which is a valid dictionary?', opts: ['{"key": "value"}', '("key": "value")', '["key": "value"]', '{"key", "value"}'], ans: 0 },
    { q: 'What is the output of bool(0)?', opts: ['True', 'False', '0', 'None'], ans: 1 },
    { q: 'Which operator checks for equality?', opts: ['==', '=', '===', 'equals'], ans: 0 },
    { q: 'Which is used to import a module?', opts: ['import', 'include', 'require', 'load'], ans: 0 },
    { q: 'What is the type of None?', opts: ['NoneType', 'null', 'undefined', 'None'], ans: 0 },
    { q: 'Which function converts a string to integer?', opts: ['int()', 'str()', 'float()', 'integer()'], ans: 0 },
    { q: 'Which is a valid set?', opts: ['{1, 2, 3}', '[1, 2, 3]', '(1, 2, 3)', 'dict(1,2,3)'], ans: 0 },
    { q: 'Which method removes the last element from a list?', opts: ['pop()', 'remove()', 'delete()', 'discard()'], ans: 0 },
    { q: 'What is the output of print(10 % 3)?', opts: ['1', '3', '0', '10'], ans: 0 },
    { q: 'Which is a valid string?', opts: ['"Hello"', "'Hello'", 'Both', 'None'], ans: 2 },
    { q: 'Which function gets user input?', opts: ['input()', 'scan()', 'read()', 'get()'], ans: 0 },
    { q: 'What is slicing in Python?', opts: ['Accessing parts of sequences', 'Cutting strings', 'Removing elements', 'None'], ans: 0 },
    { q: 'Which operator checks membership?', opts: ['in', 'contains', 'is in', 'member'], ans: 0 },
    { q: 'What is the output of print(list(range(5)))?', opts: ['[0,1,2,3,4]', '[1,2,3,4,5]', '(0,1,2,3,4)', '{0,1,2,3,4}'], ans: 0 },
    { q: 'Which keyword defines a class?', opts: ['class', 'Class', 'struct', 'type'], ans: 0 },
    { q: 'What is self in Python?', opts: ['Reference to current instance', 'Class variable', 'Static variable', 'None'], ans: 0 },
    { q: 'Which is a valid exception handling?', opts: ['try-except', 'try-catch', 'catch-try', 'except-try'], ans: 0 },
    { q: 'Which function opens a file?', opts: ['open()', 'file()', 'read()', 'load()'], ans: 0 },
    { q: 'What is a lambda function?', opts: ['Anonymous function', 'Named function', 'Recursive function', 'None'], ans: 0 },
    { q: 'Which method joins list elements into a string?', opts: ['join()', 'concat()', 'merge()', 'combine()'], ans: 0 },
    { q: 'What is the output of print("hello".upper())?', opts: ['HELLO', 'hello', 'Hello', 'Error'], ans: 0 },
    { q: 'Which is a valid tuple?', opts: ['(1, 2, 3)', '[1, 2, 3]', '{1, 2, 3}', 'dict(1,2,3)'], ans: 0 },
    { q: 'Which operator is used for floor division?', opts: ['//', '/', '\\', 'div'], ans: 0 },
    { q: 'What is the output of print(not True)?', opts: ['False', 'True', 'Not', 'Error'], ans: 0 },
    { q: 'Which is a list comprehension?', opts: ['[x*2 for x in range(5)]', '(x*2 for x in range(5))', '{x*2 for x in range(5)}', 'All'], ans: 0 },
    { q: 'Which function returns the maximum value?', opts: ['max()', 'maximum()', 'largest()', 'biggest()'], ans: 0 },
    { q: 'What is the output of print(type(5))?', opts: ['<class \'int\'>', 'int', 'integer', '5'], ans: 0 },
    { q: 'Which is used to create a generator?', opts: ['yield', 'return', 'generator', 'gen'], ans: 0 },
    { q: 'What is a decorator?', opts: ['Modifies function behavior', 'Decorates text', 'Adds comments', 'None'], ans: 0 },
    { q: 'Which module is for mathematical functions?', opts: ['math', 'maths', 'mathematics', 'calc'], ans: 0 },
    { q: 'What is the output of print(3 > 2 > 1)?', opts: ['True', 'False', 'Error', '3'], ans: 0 },
    { q: 'Which is a valid way to create a set from a list?', opts: ['set([1,2,3])', 'make_set([1,2,3])', 'create_set([1,2,3])', 'All'], ans: 0 },
    { q: 'What is the output of print("Python"[-1])?', opts: ['n', 'P', 'o', 'Error'], ans: 0 },
    { q: 'Which keyword is used to define a constant?', opts: ['const', 'constant', 'final', 'Python has no constants'], ans: 3 },
    { q: 'What is the output of print(len([]))?', opts: ['0', '1', 'None', 'Error'], ans: 0 },
    { q: 'Which method sorts a list in place?', opts: ['sort()', 'sorted()', 'order()', 'arrange()'], ans: 0 },
    { q: 'What is the output of print(5 // 2)?', opts: ['2', '2.5', '3', '5'], ans: 0 }
];

for (let i = 1; i <= 50; i++) {
    const template = pythonQuestions[(i - 1) % pythonQuestions.length];
    const shuffled = shuffleOptionsAndAnswer(template.opts, template.ans);
    PYTHON_LEVELS.push({
        id: i,
        title: `Python Concept ${i}`,
        type: 'MCQ',
        question: template.q,
        options: shuffled.options,
        answer: shuffled.answer,
        explanation: `Python fundamental: ${template.q}`
    });
}

// ── GO LEVELS (50 total MCQs) ──────────────────────────────────
export const GO_LEVELS = [];

const goQuestions = [
    { q: 'Which is the correct way to declare a variable?', opts: ['var x int = 10', 'x := 10', 'Both', 'None'], ans: 2 },
    { q: 'Which keyword is used to define a function?', opts: ['func', 'function', 'fn', 'def'], ans: 0 },
    { q: 'What is the package main used for?', opts: ['Executable program', 'Library', 'Test', 'None'], ans: 0 },
    { q: 'Which is a valid loop?', opts: ['for i := 0; i < 10; i++', 'while(i < 10)', 'do-while', 'foreach'], ans: 0 },
    { q: 'Which operator is used to declare and initialize?', opts: [':=', '=', '==', ':=:'], ans: 0 },
    { q: 'What is a goroutine?', opts: ['Lightweight thread', 'Heavy thread', 'Process', 'None'], ans: 0 },
    { q: 'Which is used for channel operations?', opts: ['<-', '->', '<>', '--'], ans: 0 },
    { q: 'What is the default value of an int variable?', opts: ['0', 'null', 'undefined', 'None'], ans: 0 },
    { q: 'Which keyword is used to handle errors?', opts: ['error', 'try', 'catch', 'throw'], ans: 0 },
    { q: 'Which is a valid slice?', opts: ['[]int{1, 2, 3}', '[1, 2, 3]', 'Array(1,2,3)', 'slice{1,2,3}'], ans: 0 },
    { q: 'Which function prints output?', opts: ['fmt.Println()', 'print()', 'echo()', 'console.log()'], ans: 0 },
    { q: 'What is a struct?', opts: ['User-defined type', 'Function', 'Interface', 'None'], ans: 0 },
    { q: 'Which keyword is used to define an interface?', opts: ['interface', 'Interface', 'type interface', 'interface type'], ans: 0 },
    { q: 'What is defer used for?', opts: ['Execute function at end', 'Delay execution', 'Loop', 'None'], ans: 0 },
    { q: 'Which is a valid array declaration?', opts: ['[5]int', 'int[5]', 'array(5, int)', 'All'], ans: 0 },
    { q: 'What is a pointer in Go?', opts: ['Variable that holds memory address', 'Reference', 'Index', 'None'], ans: 0 },
    { q: 'Which operator is used to get address of a variable?', opts: ['&', '*', '->', '@'], ans: 0 },
    { q: 'What is a map?', opts: ['Key-value pair', 'List', 'Set', 'None'], ans: 0 },
    { q: 'Which keyword is used to create a goroutine?', opts: ['go', 'goroutine', 'routine', 'thread'], ans: 0 },
    { q: 'What is the zero value for a string?', opts: ['""', 'null', 'nil', 'None'], ans: 0 },
    { q: 'Which package is for I/O functions?', opts: ['fmt', 'io', 'os', 'All'], ans: 3 },
    { q: 'What is a method in Go?', opts: ['Function with receiver', 'Member function', 'Static function', 'None'], ans: 0 },
    { q: 'Which is a valid switch statement?', opts: ['switch x { ... }', 'switch (x) { ... }', 'Both', 'None'], ans: 2 },
    { q: 'What is the type of nil?', opts: ['Untyped', 'nil', 'Null', 'None'], ans: 0 },
    { q: 'Which is used for type assertion?', opts: ['.(type)', 'assert()', 'type()', 'cast()'], ans: 0 },
    { q: 'What is a receiver?', opts: ['Parameter for method', 'Function parameter', 'Return value', 'None'], ans: 0 },
    { q: 'Which keyword is used to import packages?', opts: ['import', 'include', 'require', 'load'], ans: 0 },
    { q: 'What is a slice?', opts: ['Dynamic array', 'Static array', 'Linked list', 'None'], ans: 0 },
    { q: 'Which function gets length of slice?', opts: ['len()', 'length()', 'size()', 'count()'], ans: 0 },
    { q: 'What is capacity of a slice?', opts: ['Max length without reallocating', 'Current length', 'Total elements', 'None'], ans: 0 },
    { q: 'Which is a valid range loop?', opts: ['for i, v := range slice', 'for range slice', 'Both', 'None'], ans: 2 },
    { q: 'What is a closure?', opts: ['Function that references variables from outside', 'Anonymous function', 'Recursive function', 'None'], ans: 0 },
    { q: 'Which keyword is used for constants?', opts: ['const', 'constant', 'final', 'let'], ans: 0 },
    { q: 'What is iota?', opts: ['Counter for constants', 'Loop variable', 'Index', 'None'], ans: 0 },
    { q: 'Which is a valid way to create a map?', opts: ['make(map[string]int)', 'map[string]int{}', 'Both', 'None'], ans: 2 },
    { q: 'What is the select statement used for?', opts: ['Choose between channels', 'Switch on types', 'Loop', 'None'], ans: 0 },
    { q: 'Which is a valid error handling?', opts: ['if err != nil { ... }', 'try-catch', 'throw', 'All'], ans: 0 },
    { q: 'What is a buffered channel?', opts: ['Channel with capacity', 'Unbuffered channel', 'Channel with buffer', 'None'], ans: 0 },
    { q: 'Which package is for HTTP?', opts: ['net/http', 'http', 'web', 'server'], ans: 0 },
    { q: 'What is the empty interface?', opts: ['interface{}', 'Interface{}', 'Empty', 'None'], ans: 0 },
    { q: 'Which is used for type switching?', opts: ['switch x.(type)', 'type switch', 'Both', 'None'], ans: 0 },
    { q: 'What is a variadic function?', opts: ['Function with variable number of parameters', 'Function with fixed parameters', 'Function with no parameters', 'None'], ans: 0 },
    { q: 'Which operator is used to dereference a pointer?', opts: ['*', '&', '->', '@'], ans: 0 },
    { q: 'What is the package for JSON?', opts: ['encoding/json', 'json', 'serialize', 'marshaler'], ans: 0 },
    { q: 'Which function marshals a struct to JSON?', opts: ['json.Marshal()', 'json.Encode()', 'json.Serialize()', 'All'], ans: 0 },
    { q: 'What is a struct tag?', opts: ['Metadata for struct fields', 'Comment', 'Decoration', 'None'], ans: 0 },
    { q: 'Which is a valid struct tag?', opts: ['`json:"name"`', '\'json:"name"\'', '"json:name"', 'None'], ans: 0 },
    { q: 'What is a mutex?', opts: ['Mutual exclusion lock', 'Channel', 'Goroutine', 'None'], ans: 0 },
    { q: 'Which package provides sync primitives?', opts: ['sync', 'sync/atomic', 'Both', 'None'], ans: 2 },
    { q: 'What is WaitGroup used for?', opts: ['Wait for goroutines to finish', 'Wait for channels', 'Wait for loops', 'None'], ans: 0 },
    { q: 'Which is a valid way to create a channel?', opts: ['make(chan int)', 'chan int{}', 'Both', 'None'], ans: 0 }
];

for (let i = 1; i <= 50; i++) {
    const template = goQuestions[(i - 1) % goQuestions.length];
    const shuffled = shuffleOptionsAndAnswer(template.opts, template.ans);
    GO_LEVELS.push({
        id: i,
        title: `Go Concept ${i}`,
        type: 'MCQ',
        question: template.q,
        options: shuffled.options,
        answer: shuffled.answer,
        explanation: `Go fundamental: ${template.q}`
    });
}

// ── PHASES (for each language) ──────────────────────────────────
export const LANGUAGE_PHASES = {
    java: [
        { name: 'Module 1: Basics', start: 0, end: 9, label: 'Module 1: Java Basics' },
        { name: 'Module 2: Operators & Control Flow', start: 10, end: 19, label: 'Module 2: Operators & Control Flow' },
        { name: 'Module 3: Loops & Pattern Printing', start: 20, end: 29, label: 'Module 3: Loops & Pattern Printing' },
        { name: 'Module 4: Methods & Recursion', start: 30, end: 39, label: 'Module 4: Methods & Recursion' },
        { name: 'Module 5: Arrays', start: 40, end: 49, label: 'Module 5: Arrays' },
        { name: 'Module 6: Strings', start: 50, end: 59, label: 'Module 6: Strings' },
        { name: 'Module 7: OOP Core', start: 60, end: 69, label: 'Module 7: OOP Core' },
        { name: 'Module 8: OOP Advanced', start: 70, end: 79, label: 'Module 8: OOP Advanced' },
        { name: 'Module 9: Collections Framework', start: 80, end: 89, label: 'Module 9: Collections Framework' },
        { name: 'Module 10: Exception Handling & File I/O', start: 90, end: 99, label: 'Module 10: Exception Handling & File I/O' }
    ],
    cpp: [
        { name: 'Basics', start: 0, end: 11, label: 'Phase 1: C++ Basics' },
        { name: 'Pointers', start: 12, end: 24, label: 'Phase 2: Pointers & Memory' },
        { name: 'STL', start: 25, end: 36, label: 'Phase 3: STL & Templates' },
        { name: 'Advanced', start: 37, end: 49, label: 'Phase 4: Advanced C++' }
    ],
    python: [
        { name: 'Basics', start: 0, end: 11, label: 'Phase 1: Python Basics' },
        { name: 'Data Structures', start: 12, end: 24, label: 'Phase 2: Data Structures' },
        { name: 'Advanced', start: 25, end: 36, label: 'Phase 3: Advanced Python' },
        { name: 'Expert', start: 37, end: 49, label: 'Phase 4: Expert Level' }
    ],
    go: [
        { name: 'Basics', start: 0, end: 11, label: 'Phase 1: Go Basics' },
        { name: 'Concurrency', start: 12, end: 24, label: 'Phase 2: Goroutines & Channels' },
        { name: 'Advanced', start: 25, end: 36, label: 'Phase 3: Advanced Go' },
        { name: 'Expert', start: 37, end: 49, label: 'Phase 4: Expert Level' }
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
