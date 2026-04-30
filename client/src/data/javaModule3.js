// JAVA MODULE 3: LOOPS & PATTERN PRINTING
// Structure: 10 MCQs + 30 Coding Questions (Easy, Medium, Advanced with Patterns)

export const JAVA_MODULE3_QUESTIONS = [];

// ═══════════════════════════════════════════════════════════
// 🧠 10 MCQs (Concept Building)
// ═══════════════════════════════════════════════════════════

const mcqs = [
  {
    id: 1,
    phase: 'Loops & Pattern Printing',
    title: 'Loop Execution',
    type: 'MCQ',
    question: 'Which loop executes at least once?',
    options: ['for', 'while', 'do-while', 'none'],
    answer: 2,
    explanation: 'do-while loop checks the condition after executing the body, so it always runs at least once.'
  },
  {
    id: 2,
    phase: 'Loops & Pattern Printing',
    title: 'For Loop Syntax',
    type: 'MCQ',
    question: 'Syntax of for loop?',
    options: ['for(init; condition; update)', 'for(condition; init; update)', 'for(update; condition; init)', 'none'],
    answer: 0,
    explanation: 'The correct syntax is: for(initialization; condition; update) { body }'
  },
  {
    id: 3,
    phase: 'Loops & Pattern Printing',
    title: 'For Loop Output',
    type: 'MCQ',
    question: 'Output: for(int i=0; i<3; i++) → ?',
    options: ['0 1 2', '1 2 3', '0 1 2 3', 'infinite'],
    answer: 0,
    explanation: 'Loop starts at 0, runs while i<3, so it prints 0, 1, 2.'
  },
  {
    id: 4,
    phase: 'Loops & Pattern Printing',
    title: 'Loop Selection',
    type: 'MCQ',
    question: 'Which loop is best when iterations unknown?',
    options: ['for', 'while', 'do-while', 'none'],
    answer: 1,
    explanation: 'while loop is best when the number of iterations is not known beforehand.'
  },
  {
    id: 5,
    phase: 'Loops & Pattern Printing',
    title: 'Break Statement',
    type: 'MCQ',
    question: 'break does?',
    options: ['skip iteration', 'exit loop', 'continue loop', 'none'],
    answer: 1,
    explanation: 'break statement exits the loop immediately.'
  },
  {
    id: 6,
    phase: 'Loops & Pattern Printing',
    title: 'Continue Statement',
    type: 'MCQ',
    question: 'continue does?',
    options: ['stop loop', 'exit program', 'skip current iteration', 'none'],
    answer: 2,
    explanation: 'continue statement skips the current iteration and moves to the next one.'
  },
  {
    id: 7,
    phase: 'Loops & Pattern Printing',
    title: 'Infinite Loop',
    type: 'MCQ',
    question: 'Infinite loop example?',
    options: ['while(true)', 'for(i=0;i<10;i++)', 'do-while', 'none'],
    answer: 0,
    explanation: 'while(true) creates an infinite loop as the condition is always true.'
  },
  {
    id: 8,
    phase: 'Loops & Pattern Printing',
    title: 'Nested Loop',
    type: 'MCQ',
    question: 'Nested loop means?',
    options: ['loop inside loop', 'loop outside', 'infinite loop', 'none'],
    answer: 0,
    explanation: 'A nested loop is a loop inside another loop.'
  },
  {
    id: 9,
    phase: 'Loops & Pattern Printing',
    title: 'While Loop Condition',
    type: 'MCQ',
    question: 'Output: while(0)?',
    options: ['runs once', 'error', 'never runs', 'infinite'],
    answer: 2,
    explanation: 'while(0) or while(false) never executes as the condition is false from the start.'
  },
  {
    id: 10,
    phase: 'Loops & Pattern Printing',
    title: 'Return Statement',
    type: 'MCQ',
    question: 'Which keyword stops entire program?',
    options: ['break', 'continue', 'return', 'exit'],
    answer: 2,
    explanation: 'return exits the current method/function. System.exit() stops the entire program.'
  }
];

// ═══════════════════════════════════════════════════════════
// 💻 30 CODING QUESTIONS (Basic → Advanced)
// ═══════════════════════════════════════════════════════════

const codingQuestions = [
  // 🔹 EASY (1-10)
  {
    id: 11,
    phase: 'Loops & Pattern Printing',
    title: 'Print Numbers 1 to 10',
    type: 'CODING',
    desc: 'Print numbers from 1 to 10',
    syntax: 'public static void printNumbers() {\n  // Write your code here\n}',
    params: '',
    testCases: [
      { input: [], expected: '1 2 3 4 5 6 7 8 9 10' }
    ],
    explanation: 'Use a for loop from 1 to 10 and print each number.'
  },
  {
    id: 12,
    phase: 'Loops & Pattern Printing',
    title: 'Print Even Numbers',
    type: 'CODING',
    desc: 'Print even numbers from 1 to N',
    syntax: 'public static void printEven(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [10], expected: '2 4 6 8 10' },
      { input: [20], expected: '2 4 6 8 10 12 14 16 18 20' }
    ],
    explanation: 'Loop from 1 to N and print numbers where i % 2 == 0.'
  },
  {
    id: 13,
    phase: 'Loops & Pattern Printing',
    title: 'Print Odd Numbers',
    type: 'CODING',
    desc: 'Print odd numbers from 1 to N',
    syntax: 'public static void printOdd(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [10], expected: '1 3 5 7 9' },
      { input: [15], expected: '1 3 5 7 9 11 13 15' }
    ],
    explanation: 'Loop from 1 to N and print numbers where i % 2 != 0.'
  },
  {
    id: 14,
    phase: 'Loops & Pattern Printing',
    title: 'Sum of First N Numbers',
    type: 'CODING',
    desc: 'Calculate sum of first N natural numbers',
    syntax: 'public static int sumOfN(int n) {\n  // Write your code here\n  return 0;\n}',
    params: 'n',
    testCases: [
      { input: [5], expected: 15 },
      { input: [10], expected: 55 },
      { input: [100], expected: 5050 }
    ],
    explanation: 'Use a loop to add numbers from 1 to N, or use formula: n*(n+1)/2'
  },
  {
    id: 15,
    phase: 'Loops & Pattern Printing',
    title: 'Multiplication Table',
    type: 'CODING',
    desc: 'Print multiplication table of a number',
    syntax: 'public static void printTable(int num) {\n  // Write your code here\n}',
    params: 'num',
    testCases: [
      { input: [5], expected: '5 10 15 20 25 30 35 40 45 50' },
      { input: [3], expected: '3 6 9 12 15 18 21 24 27 30' }
    ],
    explanation: 'Loop from 1 to 10 and print num * i for each iteration.'
  },
  {
    id: 16,
    phase: 'Loops & Pattern Printing',
    title: 'Factorial',
    type: 'CODING',
    desc: 'Calculate factorial of a number',
    syntax: 'public static int factorial(int n) {\n  // Write your code here\n  return 0;\n}',
    params: 'n',
    testCases: [
      { input: [5], expected: 120 },
      { input: [6], expected: 720 },
      { input: [0], expected: 1 }
    ],
    explanation: 'Multiply all numbers from 1 to n. Factorial of 0 is 1.'
  },
  {
    id: 17,
    phase: 'Loops & Pattern Printing',
    title: 'Reverse Number',
    type: 'CODING',
    desc: 'Reverse the digits of a number',
    syntax: 'public static int reverse(int num) {\n  // Write your code here\n  return 0;\n}',
    params: 'num',
    testCases: [
      { input: [123], expected: 321 },
      { input: [4567], expected: 7654 },
      { input: [100], expected: 1 }
    ],
    explanation: 'Extract last digit using % 10, build reversed number, remove last digit using / 10.'
  },
  {
    id: 18,
    phase: 'Loops & Pattern Printing',
    title: 'Count Digits',
    type: 'CODING',
    desc: 'Count the number of digits in a number',
    syntax: 'public static int countDigits(int num) {\n  // Write your code here\n  return 0;\n}',
    params: 'num',
    testCases: [
      { input: [12345], expected: 5 },
      { input: [999], expected: 3 },
      { input: [7], expected: 1 }
    ],
    explanation: 'Keep dividing by 10 and count iterations until num becomes 0.'
  },
  {
    id: 19,
    phase: 'Loops & Pattern Printing',
    title: 'Sum of Digits',
    type: 'CODING',
    desc: 'Calculate sum of digits of a number',
    syntax: 'public static int sumOfDigits(int num) {\n  // Write your code here\n  return 0;\n}',
    params: 'num',
    testCases: [
      { input: [123], expected: 6 },
      { input: [9876], expected: 30 },
      { input: [505], expected: 10 }
    ],
    explanation: 'Extract each digit using % 10, add to sum, remove digit using / 10.'
  },
  {
    id: 20,
    phase: 'Loops & Pattern Printing',
    title: 'Palindrome Number',
    type: 'CODING',
    desc: 'Check if a number is palindrome',
    syntax: 'public static boolean isPalindrome(int num) {\n  // Write your code here\n  return false;\n}',
    params: 'num',
    testCases: [
      { input: [121], expected: true },
      { input: [123], expected: false },
      { input: [1221], expected: true }
    ],
    explanation: 'Reverse the number and check if it equals the original.'
  },

  // 🔹 MEDIUM (11-20)
  {
    id: 21,
    phase: 'Loops & Pattern Printing',
    title: 'Fibonacci Series',
    type: 'CODING',
    desc: 'Print Fibonacci series of n terms',
    syntax: 'public static void fibonacci(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [5], expected: '0 1 1 2 3' },
      { input: [8], expected: '0 1 1 2 3 5 8 13' }
    ],
    explanation: 'Start with 0 and 1, then each term is sum of previous two terms.'
  },
  {
    id: 22,
    phase: 'Loops & Pattern Printing',
    title: 'Prime Number Check',
    type: 'CODING',
    desc: 'Check if a number is prime',
    syntax: 'public static boolean isPrime(int num) {\n  // Write your code here\n  return false;\n}',
    params: 'num',
    testCases: [
      { input: [7], expected: true },
      { input: [10], expected: false },
      { input: [2], expected: true },
      { input: [1], expected: false }
    ],
    explanation: 'Check if number has any divisors from 2 to sqrt(num). 1 is not prime.'
  },
  {
    id: 23,
    phase: 'Loops & Pattern Printing',
    title: 'Print All Primes',
    type: 'CODING',
    desc: 'Print all prime numbers from 1 to N',
    syntax: 'public static void printPrimes(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [10], expected: '2 3 5 7' },
      { input: [20], expected: '2 3 5 7 11 13 17 19' }
    ],
    explanation: 'Loop from 2 to N and check if each number is prime.'
  },
  {
    id: 24,
    phase: 'Loops & Pattern Printing',
    title: 'Armstrong Number',
    type: 'CODING',
    desc: 'Check if a number is Armstrong number (sum of cubes of digits equals number)',
    syntax: 'public static boolean isArmstrong(int num) {\n  // Write your code here\n  return false;\n}',
    params: 'num',
    testCases: [
      { input: [153], expected: true },
      { input: [370], expected: true },
      { input: [123], expected: false }
    ],
    explanation: 'Armstrong: 153 = 1³ + 5³ + 3³ = 1 + 125 + 27 = 153'
  },
  {
    id: 25,
    phase: 'Loops & Pattern Printing',
    title: 'Strong Number',
    type: 'CODING',
    desc: 'Check if a number is Strong number (sum of factorials of digits equals number)',
    syntax: 'public static boolean isStrong(int num) {\n  // Write your code here\n  return false;\n}',
    params: 'num',
    testCases: [
      { input: [145], expected: true },
      { input: [123], expected: false }
    ],
    explanation: 'Strong: 145 = 1! + 4! + 5! = 1 + 24 + 120 = 145'
  },
  {
    id: 26,
    phase: 'Loops & Pattern Printing',
    title: 'Perfect Number',
    type: 'CODING',
    desc: 'Check if a number is Perfect number (sum of divisors equals number)',
    syntax: 'public static boolean isPerfect(int num) {\n  // Write your code here\n  return false;\n}',
    params: 'num',
    testCases: [
      { input: [6], expected: true },
      { input: [28], expected: true },
      { input: [12], expected: false }
    ],
    explanation: 'Perfect: 6 = 1 + 2 + 3 (divisors of 6 excluding itself)'
  },
  {
    id: 27,
    phase: 'Loops & Pattern Printing',
    title: 'GCD Using Loop',
    type: 'CODING',
    desc: 'Find GCD of two numbers using loop',
    syntax: 'public static int gcd(int a, int b) {\n  // Write your code here\n  return 0;\n}',
    params: 'a, b',
    testCases: [
      { input: [12, 18], expected: 6 },
      { input: [24, 36], expected: 12 },
      { input: [7, 13], expected: 1 }
    ],
    explanation: 'Use Euclidean algorithm: repeatedly replace larger number with remainder.'
  },
  {
    id: 28,
    phase: 'Loops & Pattern Printing',
    title: 'LCM Using Loop',
    type: 'CODING',
    desc: 'Find LCM of two numbers using loop',
    syntax: 'public static int lcm(int a, int b) {\n  // Write your code here\n  return 0;\n}',
    params: 'a, b',
    testCases: [
      { input: [4, 6], expected: 12 },
      { input: [12, 18], expected: 36 },
      { input: [7, 13], expected: 91 }
    ],
    explanation: 'LCM = (a * b) / GCD(a, b)'
  },
  {
    id: 29,
    phase: 'Loops & Pattern Printing',
    title: 'Binary to Decimal',
    type: 'CODING',
    desc: 'Convert binary number to decimal',
    syntax: 'public static int binaryToDecimal(String binary) {\n  // Write your code here\n  return 0;\n}',
    params: 'binary',
    testCases: [
      { input: ['1010'], expected: 10 },
      { input: ['1111'], expected: 15 },
      { input: ['1001'], expected: 9 }
    ],
    explanation: 'Multiply each bit by 2^position and sum them up.'
  },
  {
    id: 30,
    phase: 'Loops & Pattern Printing',
    title: 'Decimal to Binary',
    type: 'CODING',
    desc: 'Convert decimal number to binary',
    syntax: 'public static String decimalToBinary(int decimal) {\n  // Write your code here\n  return "";\n}',
    params: 'decimal',
    testCases: [
      { input: [10], expected: '1010' },
      { input: [15], expected: '1111' },
      { input: [9], expected: '1001' }
    ],
    explanation: 'Repeatedly divide by 2 and collect remainders in reverse order.'
  },

  // 🔹 ADVANCED (21-30) — 🔥 PATTERN PRINTING
  {
    id: 31,
    phase: 'Loops & Pattern Printing',
    title: 'Right Triangle Star Pattern',
    type: 'CODING',
    desc: 'Print right triangle star pattern:\n*\n**\n***\n****',
    syntax: 'public static void pattern1(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [4], expected: '*\n**\n***\n****' }
    ],
    explanation: 'Outer loop for rows, inner loop prints i stars in row i.'
  },
  {
    id: 32,
    phase: 'Loops & Pattern Printing',
    title: 'Inverted Right Triangle',
    type: 'CODING',
    desc: 'Print inverted right triangle:\n****\n***\n**\n*',
    syntax: 'public static void pattern2(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [4], expected: '****\n***\n**\n*' }
    ],
    explanation: 'Outer loop for rows, inner loop prints (n-i+1) stars in row i.'
  },
  {
    id: 33,
    phase: 'Loops & Pattern Printing',
    title: 'Right-Aligned Triangle',
    type: 'CODING',
    desc: 'Print right-aligned triangle:\n   *\n  **\n ***\n****',
    syntax: 'public static void pattern3(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [4], expected: '   *\n  **\n ***\n****' }
    ],
    explanation: 'Print (n-i) spaces, then i stars for each row i.'
  },
  {
    id: 34,
    phase: 'Loops & Pattern Printing',
    title: 'Inverted Right-Aligned Triangle',
    type: 'CODING',
    desc: 'Print inverted right-aligned triangle:\n****\n ***\n  **\n   *',
    syntax: 'public static void pattern4(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [4], expected: '****\n ***\n  **\n   *' }
    ],
    explanation: 'Print (i-1) spaces, then (n-i+1) stars for each row i.'
  },
  {
    id: 35,
    phase: 'Loops & Pattern Printing',
    title: 'Full Pyramid',
    type: 'CODING',
    desc: 'Print full pyramid:\n   *\n  ***\n *****\n*******',
    syntax: 'public static void pattern5(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [4], expected: '   *\n  ***\n *****\n*******' }
    ],
    explanation: 'Print (n-i) spaces, then (2*i-1) stars for each row i.'
  },
  {
    id: 36,
    phase: 'Loops & Pattern Printing',
    title: 'Inverted Pyramid',
    type: 'CODING',
    desc: 'Print inverted pyramid:\n*******\n *****\n  ***\n   *',
    syntax: 'public static void pattern6(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [4], expected: '*******\n *****\n  ***\n   *' }
    ],
    explanation: 'Print (i-1) spaces, then (2*(n-i+1)-1) stars for each row i.'
  },
  {
    id: 37,
    phase: 'Loops & Pattern Printing',
    title: 'Diamond Pattern',
    type: 'CODING',
    desc: 'Print diamond pattern:\n   *\n  ***\n *****\n*******\n *****\n  ***\n   *',
    syntax: 'public static void pattern7(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [4], expected: '   *\n  ***\n *****\n*******\n *****\n  ***\n   *' }
    ],
    explanation: 'Combine full pyramid and inverted pyramid.'
  },
  {
    id: 38,
    phase: 'Loops & Pattern Printing',
    title: 'Number Triangle',
    type: 'CODING',
    desc: 'Print number triangle:\n1\n12\n123\n1234',
    syntax: 'public static void pattern8(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [4], expected: '1\n12\n123\n1234' }
    ],
    explanation: 'Print numbers from 1 to i in row i.'
  },
  {
    id: 39,
    phase: 'Loops & Pattern Printing',
    title: 'Repeated Number Pattern',
    type: 'CODING',
    desc: 'Print repeated number pattern:\n1\n22\n333\n4444',
    syntax: 'public static void pattern9(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [4], expected: '1\n22\n333\n4444' }
    ],
    explanation: 'Print row number i, i times in row i.'
  },
  {
    id: 40,
    phase: 'Loops & Pattern Printing',
    title: 'Floyd\'s Triangle',
    type: 'CODING',
    desc: 'Print Floyd\'s triangle:\n1\n2 3\n4 5 6\n7 8 9 10',
    syntax: 'public static void pattern10(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [4], expected: '1\n2 3\n4 5 6\n7 8 9 10' }
    ],
    explanation: 'Print consecutive numbers, with i numbers in row i.'
  }
];

// Combine MCQs and Coding Questions
JAVA_MODULE3_QUESTIONS.push(...mcqs, ...codingQuestions);

export const JAVA_MODULE3_PHASES = [
  { name: 'Loops & Pattern Printing', start: 0, end: 39, label: 'Module 3: Loops & Pattern Printing' }
];

export const JAVA_MODULE3_THEORIES = {
  'Loops & Pattern Printing': {
    title: 'Loops & Pattern Printing',
    content: [
      'for Loop: Initialization, Condition, Update',
      'while Loop: Entry-controlled loop',
      'do-while Loop: Exit-controlled loop (executes at least once)',
      'break Statement: Exit loop immediately',
      'continue Statement: Skip current iteration',
      'Nested Loops: Loop inside another loop',
      'Pattern Printing: Using nested loops for stars, numbers, pyramids',
      'Loop Control: Infinite loops, loop optimization',
      'Common Algorithms: Factorial, Fibonacci, Prime numbers, GCD/LCM'
    ]
  }
};
