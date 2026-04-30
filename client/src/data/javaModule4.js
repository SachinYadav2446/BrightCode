// JAVA MODULE 4: METHODS & RECURSION
// Structure: 10 MCQs + 30 Coding Questions (Easy, Medium, Advanced with Recursion)

export const JAVA_MODULE4_QUESTIONS = [];

// ═══════════════════════════════════════════════════════════
// 🧠 10 MCQs (Concept Building)
// ═══════════════════════════════════════════════════════════

const mcqs = [
  {
    id: 1,
    phase: 'Methods & Recursion',
    title: 'Method Definition',
    type: 'MCQ',
    question: 'What is a method?',
    options: ['Variable', 'Function in Java', 'Class', 'Object'],
    answer: 1,
    explanation: 'A method is a function in Java - a block of code that performs a specific task.'
  },
  {
    id: 2,
    phase: 'Methods & Recursion',
    title: 'Method Syntax',
    type: 'MCQ',
    question: 'Syntax of method?',
    options: ['returnType name() {}', 'name returnType {}', 'function name()', 'none'],
    answer: 0,
    explanation: 'Correct syntax: returnType methodName(parameters) { body }'
  },
  {
    id: 3,
    phase: 'Methods & Recursion',
    title: 'Return Keyword',
    type: 'MCQ',
    question: 'Which keyword returns value?',
    options: ['break', 'return', 'continue', 'exit'],
    answer: 1,
    explanation: 'The return keyword is used to return a value from a method.'
  },
  {
    id: 4,
    phase: 'Methods & Recursion',
    title: 'Void Method',
    type: 'MCQ',
    question: 'Method without return?',
    options: ['int', 'void', 'null', 'none'],
    answer: 1,
    explanation: 'void is used for methods that do not return any value.'
  },
  {
    id: 5,
    phase: 'Methods & Recursion',
    title: 'Recursion Definition',
    type: 'MCQ',
    question: 'What is recursion?',
    options: ['Loop', 'Method calling itself', 'Condition', 'none'],
    answer: 1,
    explanation: 'Recursion is when a method calls itself to solve a problem.'
  },
  {
    id: 6,
    phase: 'Methods & Recursion',
    title: 'Base Case',
    type: 'MCQ',
    question: 'Base case in recursion?',
    options: ['Loop', 'Stopping condition', 'Variable', 'none'],
    answer: 1,
    explanation: 'Base case is the stopping condition that prevents infinite recursion.'
  },
  {
    id: 7,
    phase: 'Methods & Recursion',
    title: 'Missing Base Case',
    type: 'MCQ',
    question: 'If no base case?',
    options: ['stops', 'infinite recursion', 'error', 'none'],
    answer: 1,
    explanation: 'Without a base case, recursion continues infinitely until stack overflow.'
  },
  {
    id: 8,
    phase: 'Methods & Recursion',
    title: 'Stack Memory',
    type: 'MCQ',
    question: 'Which uses stack memory?',
    options: ['Loop', 'Recursion', 'Array', 'none'],
    answer: 1,
    explanation: 'Recursion uses stack memory to store method calls and local variables.'
  },
  {
    id: 9,
    phase: 'Methods & Recursion',
    title: 'Method Overloading',
    type: 'MCQ',
    question: 'Method overloading means?',
    options: ['Same name, different parameters', 'Same name, same parameters', 'Different name', 'none'],
    answer: 0,
    explanation: 'Method overloading: multiple methods with same name but different parameters.'
  },
  {
    id: 10,
    phase: 'Methods & Recursion',
    title: 'Performance Comparison',
    type: 'MCQ',
    question: 'Which is faster generally?',
    options: ['Recursion', 'Iteration (loops)', 'Both same', 'none'],
    answer: 1,
    explanation: 'Iteration is generally faster as it avoids function call overhead and stack usage.'
  }
];

// ═══════════════════════════════════════════════════════════
// 💻 30 CODING QUESTIONS (Basic → Advanced)
// ═══════════════════════════════════════════════════════════

const codingQuestions = [
  // 🔹 EASY (1-10)
  {
    id: 11,
    phase: 'Methods & Recursion',
    title: 'Print Hello Method',
    type: 'CODING',
    desc: 'Create a method to print "Hello"',
    syntax: 'public static void printHello() {\n  // Write your code here\n}',
    params: '',
    testCases: [
      { input: [], expected: 'Hello' }
    ],
    explanation: 'Create a void method that prints "Hello" using System.out.println().'
  },
  {
    id: 12,
    phase: 'Methods & Recursion',
    title: 'Add Two Numbers',
    type: 'CODING',
    desc: 'Add two numbers using a method',
    syntax: 'public static int add(int a, int b) {\n  // Write your code here\n  return 0;\n}',
    params: 'a, b',
    testCases: [
      { input: [5, 10], expected: 15 },
      { input: [100, 200], expected: 300 },
      { input: [-5, 5], expected: 0 }
    ],
    explanation: 'Create a method that takes two integers and returns their sum.'
  },
  {
    id: 13,
    phase: 'Methods & Recursion',
    title: 'Find Square',
    type: 'CODING',
    desc: 'Find square of a number using method',
    syntax: 'public static int square(int num) {\n  // Write your code here\n  return 0;\n}',
    params: 'num',
    testCases: [
      { input: [5], expected: 25 },
      { input: [10], expected: 100 },
      { input: [7], expected: 49 }
    ],
    explanation: 'Create a method that returns the square of a number (num * num).'
  },
  {
    id: 14,
    phase: 'Methods & Recursion',
    title: 'Check Even/Odd',
    type: 'CODING',
    desc: 'Check if number is even or odd using method',
    syntax: 'public static boolean isEven(int num) {\n  // Write your code here\n  return false;\n}',
    params: 'num',
    testCases: [
      { input: [4], expected: true },
      { input: [7], expected: false },
      { input: [0], expected: true }
    ],
    explanation: 'Create a method that returns true if number is even, false if odd.'
  },
  {
    id: 15,
    phase: 'Methods & Recursion',
    title: 'Max of Two',
    type: 'CODING',
    desc: 'Find maximum of two numbers using method',
    syntax: 'public static int max(int a, int b) {\n  // Write your code here\n  return 0;\n}',
    params: 'a, b',
    testCases: [
      { input: [10, 20], expected: 20 },
      { input: [50, 30], expected: 50 },
      { input: [15, 15], expected: 15 }
    ],
    explanation: 'Create a method that returns the larger of two numbers.'
  },
  {
    id: 16,
    phase: 'Methods & Recursion',
    title: 'Swap Numbers',
    type: 'CODING',
    desc: 'Swap two numbers using method',
    syntax: 'public static int[] swap(int a, int b) {\n  // Write your code here\n  return new int[]{a, b};\n}',
    params: 'a, b',
    testCases: [
      { input: [5, 10], expected: [10, 5] },
      { input: [100, 200], expected: [200, 100] }
    ],
    explanation: 'Create a method that swaps two numbers and returns them as an array.'
  },
  {
    id: 17,
    phase: 'Methods & Recursion',
    title: 'Factorial Using Loop',
    type: 'CODING',
    desc: 'Calculate factorial using method with loop',
    syntax: 'public static int factorial(int n) {\n  // Write your code here\n  return 0;\n}',
    params: 'n',
    testCases: [
      { input: [5], expected: 120 },
      { input: [6], expected: 720 },
      { input: [0], expected: 1 }
    ],
    explanation: 'Create a method using a loop to calculate factorial.'
  },
  {
    id: 18,
    phase: 'Methods & Recursion',
    title: 'Reverse Number',
    type: 'CODING',
    desc: 'Reverse a number using method',
    syntax: 'public static int reverse(int num) {\n  // Write your code here\n  return 0;\n}',
    params: 'num',
    testCases: [
      { input: [123], expected: 321 },
      { input: [4567], expected: 7654 },
      { input: [100], expected: 1 }
    ],
    explanation: 'Create a method that reverses the digits of a number.'
  },
  {
    id: 19,
    phase: 'Methods & Recursion',
    title: 'Sum of Digits',
    type: 'CODING',
    desc: 'Calculate sum of digits using method',
    syntax: 'public static int sumOfDigits(int num) {\n  // Write your code here\n  return 0;\n}',
    params: 'num',
    testCases: [
      { input: [123], expected: 6 },
      { input: [9876], expected: 30 },
      { input: [505], expected: 10 }
    ],
    explanation: 'Create a method that returns the sum of all digits in a number.'
  },
  {
    id: 20,
    phase: 'Methods & Recursion',
    title: 'Palindrome Check',
    type: 'CODING',
    desc: 'Check if number is palindrome using method',
    syntax: 'public static boolean isPalindrome(int num) {\n  // Write your code here\n  return false;\n}',
    params: 'num',
    testCases: [
      { input: [121], expected: true },
      { input: [123], expected: false },
      { input: [1221], expected: true }
    ],
    explanation: 'Create a method that checks if a number is palindrome.'
  },

  // 🔹 MEDIUM (11-20)
  {
    id: 21,
    phase: 'Methods & Recursion',
    title: 'Fibonacci Using Loop',
    type: 'CODING',
    desc: 'Generate Fibonacci series using method with loop',
    syntax: 'public static void fibonacci(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [5], expected: '0 1 1 2 3' },
      { input: [8], expected: '0 1 1 2 3 5 8 13' }
    ],
    explanation: 'Create a method using loop to print Fibonacci series of n terms.'
  },
  {
    id: 22,
    phase: 'Methods & Recursion',
    title: 'Prime Check',
    type: 'CODING',
    desc: 'Check if number is prime using method',
    syntax: 'public static boolean isPrime(int num) {\n  // Write your code here\n  return false;\n}',
    params: 'num',
    testCases: [
      { input: [7], expected: true },
      { input: [10], expected: false },
      { input: [2], expected: true },
      { input: [1], expected: false }
    ],
    explanation: 'Create a method that checks if a number is prime.'
  },
  {
    id: 23,
    phase: 'Methods & Recursion',
    title: 'GCD Using Method',
    type: 'CODING',
    desc: 'Find GCD of two numbers using method',
    syntax: 'public static int gcd(int a, int b) {\n  // Write your code here\n  return 0;\n}',
    params: 'a, b',
    testCases: [
      { input: [12, 18], expected: 6 },
      { input: [24, 36], expected: 12 },
      { input: [7, 13], expected: 1 }
    ],
    explanation: 'Create a method to find GCD using Euclidean algorithm.'
  },
  {
    id: 24,
    phase: 'Methods & Recursion',
    title: 'LCM Using Method',
    type: 'CODING',
    desc: 'Find LCM of two numbers using method',
    syntax: 'public static int lcm(int a, int b) {\n  // Write your code here\n  return 0;\n}',
    params: 'a, b',
    testCases: [
      { input: [4, 6], expected: 12 },
      { input: [12, 18], expected: 36 },
      { input: [7, 13], expected: 91 }
    ],
    explanation: 'Create a method to find LCM. Formula: LCM = (a * b) / GCD(a, b)'
  },
  {
    id: 25,
    phase: 'Methods & Recursion',
    title: 'Method Overloading',
    type: 'CODING',
    desc: 'Implement method overloading for add (int and double)',
    syntax: 'public static int add(int a, int b) {\n  // Write your code here\n  return 0;\n}\n\npublic static double add(double a, double b) {\n  // Write your code here\n  return 0.0;\n}',
    params: 'a, b',
    testCases: [
      { input: [5, 10], expected: 15 },
      { input: [5.5, 10.5], expected: 16.0 }
    ],
    explanation: 'Create two add methods - one for int, one for double (method overloading).'
  },
  {
    id: 26,
    phase: 'Methods & Recursion',
    title: 'Count Digits',
    type: 'CODING',
    desc: 'Count digits in a number using method',
    syntax: 'public static int countDigits(int num) {\n  // Write your code here\n  return 0;\n}',
    params: 'num',
    testCases: [
      { input: [12345], expected: 5 },
      { input: [999], expected: 3 },
      { input: [7], expected: 1 }
    ],
    explanation: 'Create a method that counts the number of digits in a number.'
  },
  {
    id: 27,
    phase: 'Methods & Recursion',
    title: 'Armstrong Number',
    type: 'CODING',
    desc: 'Check if number is Armstrong using method',
    syntax: 'public static boolean isArmstrong(int num) {\n  // Write your code here\n  return false;\n}',
    params: 'num',
    testCases: [
      { input: [153], expected: true },
      { input: [370], expected: true },
      { input: [123], expected: false }
    ],
    explanation: 'Create a method to check Armstrong number (sum of cubes of digits equals number).'
  },
  {
    id: 28,
    phase: 'Methods & Recursion',
    title: 'Power of Number',
    type: 'CODING',
    desc: 'Calculate power of number using method with loop',
    syntax: 'public static int power(int base, int exp) {\n  // Write your code here\n  return 0;\n}',
    params: 'base, exp',
    testCases: [
      { input: [2, 3], expected: 8 },
      { input: [5, 2], expected: 25 },
      { input: [10, 0], expected: 1 }
    ],
    explanation: 'Create a method using loop to calculate base^exp.'
  },
  {
    id: 29,
    phase: 'Methods & Recursion',
    title: 'Menu-Driven Program',
    type: 'CODING',
    desc: 'Create menu-driven calculator using methods',
    syntax: 'public static double calculate(int choice, double a, double b) {\n  // Write your code here\n  return 0.0;\n}',
    params: 'choice, a, b',
    testCases: [
      { input: [1, 10, 5], expected: 15 },
      { input: [2, 10, 5], expected: 5 },
      { input: [3, 10, 5], expected: 50 },
      { input: [4, 10, 5], expected: 2 }
    ],
    explanation: 'Create a method that performs operations based on choice (1:Add, 2:Sub, 3:Mul, 4:Div).'
  },
  {
    id: 30,
    phase: 'Methods & Recursion',
    title: 'Pattern Using Methods',
    type: 'CODING',
    desc: 'Print right triangle pattern using method',
    syntax: 'public static void printPattern(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [4], expected: '*\n**\n***\n****' }
    ],
    explanation: 'Create a method that prints a right triangle star pattern.'
  },

  // 🔹 ADVANCED (21-30) — 🔥 RECURSION
  {
    id: 31,
    phase: 'Methods & Recursion',
    title: 'Factorial Using Recursion',
    type: 'CODING',
    desc: 'Calculate factorial using recursion',
    syntax: 'public static int factorialRecursive(int n) {\n  // Write your code here\n  return 0;\n}',
    params: 'n',
    testCases: [
      { input: [5], expected: 120 },
      { input: [6], expected: 720 },
      { input: [0], expected: 1 }
    ],
    explanation: 'Base case: if n == 0 or n == 1, return 1. Recursive: return n * factorial(n-1).'
  },
  {
    id: 32,
    phase: 'Methods & Recursion',
    title: 'Fibonacci Using Recursion',
    type: 'CODING',
    desc: 'Calculate nth Fibonacci number using recursion',
    syntax: 'public static int fibonacciRecursive(int n) {\n  // Write your code here\n  return 0;\n}',
    params: 'n',
    testCases: [
      { input: [0], expected: 0 },
      { input: [1], expected: 1 },
      { input: [5], expected: 5 },
      { input: [7], expected: 13 }
    ],
    explanation: 'Base: if n <= 1, return n. Recursive: return fib(n-1) + fib(n-2).'
  },
  {
    id: 33,
    phase: 'Methods & Recursion',
    title: 'Sum of N Numbers',
    type: 'CODING',
    desc: 'Calculate sum of first N numbers using recursion',
    syntax: 'public static int sumRecursive(int n) {\n  // Write your code here\n  return 0;\n}',
    params: 'n',
    testCases: [
      { input: [5], expected: 15 },
      { input: [10], expected: 55 },
      { input: [1], expected: 1 }
    ],
    explanation: 'Base: if n == 1, return 1. Recursive: return n + sum(n-1).'
  },
  {
    id: 34,
    phase: 'Methods & Recursion',
    title: 'Reverse Number Recursion',
    type: 'CODING',
    desc: 'Reverse a number using recursion',
    syntax: 'public static int reverseRecursive(int num, int rev) {\n  // Write your code here\n  return 0;\n}',
    params: 'num, rev',
    testCases: [
      { input: [123, 0], expected: 321 },
      { input: [4567, 0], expected: 7654 }
    ],
    explanation: 'Base: if num == 0, return rev. Recursive: reverseRecursive(num/10, rev*10 + num%10).'
  },
  {
    id: 35,
    phase: 'Methods & Recursion',
    title: 'Count Digits Recursion',
    type: 'CODING',
    desc: 'Count digits using recursion',
    syntax: 'public static int countDigitsRecursive(int num) {\n  // Write your code here\n  return 0;\n}',
    params: 'num',
    testCases: [
      { input: [12345], expected: 5 },
      { input: [999], expected: 3 },
      { input: [7], expected: 1 }
    ],
    explanation: 'Base: if num == 0, return 0. Recursive: return 1 + countDigits(num/10).'
  },
  {
    id: 36,
    phase: 'Methods & Recursion',
    title: 'Power Using Recursion',
    type: 'CODING',
    desc: 'Calculate power using recursion',
    syntax: 'public static int powerRecursive(int base, int exp) {\n  // Write your code here\n  return 0;\n}',
    params: 'base, exp',
    testCases: [
      { input: [2, 3], expected: 8 },
      { input: [5, 2], expected: 25 },
      { input: [10, 0], expected: 1 }
    ],
    explanation: 'Base: if exp == 0, return 1. Recursive: return base * power(base, exp-1).'
  },
  {
    id: 37,
    phase: 'Methods & Recursion',
    title: 'GCD Using Recursion',
    type: 'CODING',
    desc: 'Find GCD using recursion (Euclidean algorithm)',
    syntax: 'public static int gcdRecursive(int a, int b) {\n  // Write your code here\n  return 0;\n}',
    params: 'a, b',
    testCases: [
      { input: [12, 18], expected: 6 },
      { input: [24, 36], expected: 12 },
      { input: [7, 13], expected: 1 }
    ],
    explanation: 'Base: if b == 0, return a. Recursive: return gcd(b, a % b).'
  },
  {
    id: 38,
    phase: 'Methods & Recursion',
    title: 'Palindrome Recursion',
    type: 'CODING',
    desc: 'Check palindrome using recursion',
    syntax: 'public static boolean isPalindromeRecursive(String str, int start, int end) {\n  // Write your code here\n  return false;\n}',
    params: 'str, start, end',
    testCases: [
      { input: ['racecar', 0, 6], expected: true },
      { input: ['hello', 0, 4], expected: false },
      { input: ['madam', 0, 4], expected: true }
    ],
    explanation: 'Base: if start >= end, return true. Check first and last chars, recurse with start+1, end-1.'
  },
  {
    id: 39,
    phase: 'Methods & Recursion',
    title: 'Print 1 to N Recursion',
    type: 'CODING',
    desc: 'Print numbers from 1 to N using recursion',
    syntax: 'public static void printNumbers(int n) {\n  // Write your code here\n}',
    params: 'n',
    testCases: [
      { input: [5], expected: '1 2 3 4 5' },
      { input: [3], expected: '1 2 3' }
    ],
    explanation: 'Base: if n == 0, return. Recursive: printNumbers(n-1), then print n.'
  },
  {
    id: 40,
    phase: 'Methods & Recursion',
    title: 'Tower of Hanoi 🔥',
    type: 'CODING',
    desc: 'Solve Tower of Hanoi puzzle using recursion',
    syntax: 'public static void towerOfHanoi(int n, char from, char to, char aux) {\n  // Write your code here\n}',
    params: 'n, from, to, aux',
    testCases: [
      { input: [2, 'A', 'C', 'B'], expected: 'Move disk 1 from A to B\nMove disk 2 from A to C\nMove disk 1 from B to C' },
      { input: [3, 'A', 'C', 'B'], expected: 'Move disk 1 from A to C\nMove disk 2 from A to B\nMove disk 1 from C to B\nMove disk 3 from A to C\nMove disk 1 from B to A\nMove disk 2 from B to C\nMove disk 1 from A to C' }
    ],
    explanation: 'Classic recursion problem: Move n-1 disks to aux, move largest to destination, move n-1 from aux to destination.'
  }
];

// Combine MCQs and Coding Questions
JAVA_MODULE4_QUESTIONS.push(...mcqs, ...codingQuestions);

export const JAVA_MODULE4_PHASES = [
  { name: 'Methods & Recursion', start: 0, end: 39, label: 'Module 4: Methods & Recursion' }
];

export const JAVA_MODULE4_THEORIES = {
  'Methods & Recursion': {
    title: 'Methods & Recursion',
    content: [
      'Method Syntax: returnType methodName(parameters) { body }',
      'Method Types: void methods, return methods, static methods',
      'Method Parameters: pass by value in Java',
      'Method Overloading: same name, different parameters',
      'Recursion: method calling itself',
      'Base Case: stopping condition for recursion',
      'Recursive vs Iterative: trade-offs and use cases',
      'Stack Memory: how recursion uses the call stack',
      'Common Recursive Algorithms: factorial, Fibonacci, GCD, Tower of Hanoi',
      'Tail Recursion: optimization technique'
    ]
  }
};
