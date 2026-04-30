// JAVA MODULE 2: OPERATORS & CONTROL FLOW
// Structure: 10 MCQs + 30 Coding Questions (Easy, Medium, Advanced)

export const JAVA_MODULE2_QUESTIONS = [];

// ═══════════════════════════════════════════════════════════
// 🧠 10 MCQs (Concept Building)
// ═══════════════════════════════════════════════════════════

const mcqs = [
  {
    id: 1,
    phase: 'Operators & Control Flow',
    title: 'Equality Operator',
    type: 'MCQ',
    question: 'Which operator is used for equality check?',
    options: ['=', '==', '===', '!='],
    answer: 1,
    explanation: 'The == operator is used for equality comparison in Java. The = operator is for assignment.'
  },
  {
    id: 2,
    phase: 'Operators & Control Flow',
    title: 'Integer Division',
    type: 'MCQ',
    question: 'Output of: 10 / 3 (int)?',
    options: ['3.33', '3', '4', 'Error'],
    answer: 1,
    explanation: 'Integer division in Java truncates the decimal part, so 10 / 3 = 3.'
  },
  {
    id: 3,
    phase: 'Operators & Control Flow',
    title: 'Logical AND',
    type: 'MCQ',
    question: 'Which is logical AND?',
    options: ['&', '&&', '||', '!'],
    answer: 1,
    explanation: '&& is the logical AND operator. & is bitwise AND.'
  },
  {
    id: 4,
    phase: 'Operators & Control Flow',
    title: 'Logical Expression',
    type: 'MCQ',
    question: 'Output of: 5 > 3 && 2 < 1',
    options: ['true', 'false', 'error', 'none'],
    answer: 1,
    explanation: '5 > 3 is true, but 2 < 1 is false. true && false = false.'
  },
  {
    id: 5,
    phase: 'Operators & Control Flow',
    title: 'Ternary Operator',
    type: 'MCQ',
    question: 'Ternary operator syntax?',
    options: ['if else', 'condition ? true : false', 'condition : true ? false', 'none'],
    answer: 1,
    explanation: 'The ternary operator syntax is: condition ? valueIfTrue : valueIfFalse'
  },
  {
    id: 6,
    phase: 'Operators & Control Flow',
    title: 'Assignment Operator',
    type: 'MCQ',
    question: 'Which is assignment operator?',
    options: ['==', '=', '!=', '<='],
    answer: 1,
    explanation: 'The = operator is used for assignment. == is for comparison.'
  },
  {
    id: 7,
    phase: 'Operators & Control Flow',
    title: 'Increment Operator',
    type: 'MCQ',
    question: 'Output: int x = 5; x++;',
    options: ['5', '6', 'error', 'none'],
    answer: 1,
    explanation: 'x++ increments x by 1, so x becomes 6.'
  },
  {
    id: 8,
    phase: 'Operators & Control Flow',
    title: 'Bitwise OR',
    type: 'MCQ',
    question: 'Which is bitwise OR?',
    options: ['||', '|', '&', '^'],
    answer: 1,
    explanation: '| is the bitwise OR operator. || is logical OR.'
  },
  {
    id: 9,
    phase: 'Operators & Control Flow',
    title: 'Switch Statement',
    type: 'MCQ',
    question: 'Switch works with?',
    options: ['int', 'char', 'String', 'All of the above'],
    answer: 3,
    explanation: 'Switch statements in Java work with int, char, String, and enum types.'
  },
  {
    id: 10,
    phase: 'Operators & Control Flow',
    title: 'Control Statements',
    type: 'MCQ',
    question: 'Which is NOT a control statement?',
    options: ['if', 'for', 'class', 'switch'],
    answer: 2,
    explanation: 'class is a keyword for defining classes, not a control statement. if, for, and switch are control statements.'
  }
];

// ═══════════════════════════════════════════════════════════
// 💻 30 CODING QUESTIONS (Basic → Advanced)
// ═══════════════════════════════════════════════════════════

const codingQuestions = [
  // 🔹 EASY (1-10)
  {
    id: 11,
    phase: 'Operators & Control Flow',
    title: 'Even or Odd',
    type: 'CODING',
    desc: 'Check if a number is even or odd',
    syntax: 'public static String checkEvenOdd(int num) {\n  // Write your code here\n  return "";\n}',
    params: 'num',
    testCases: [
      { input: [4], expected: 'Even' },
      { input: [7], expected: 'Odd' },
      { input: [0], expected: 'Even' }
    ],
    explanation: 'Use the modulo operator (%) to check if num % 2 == 0 for even, else odd.'
  },
  {
    id: 12,
    phase: 'Operators & Control Flow',
    title: 'Largest of Two',
    type: 'CODING',
    desc: 'Find the largest of two numbers',
    syntax: 'public static int findLargest(int a, int b) {\n  // Write your code here\n  return 0;\n}',
    params: 'a, b',
    testCases: [
      { input: [10, 20], expected: 20 },
      { input: [50, 30], expected: 50 },
      { input: [15, 15], expected: 15 }
    ],
    explanation: 'Use an if-else statement or ternary operator to compare a and b.'
  },
  {
    id: 13,
    phase: 'Operators & Control Flow',
    title: 'Positive, Negative, or Zero',
    type: 'CODING',
    desc: 'Check if a number is positive, negative, or zero',
    syntax: 'public static String checkNumber(int num) {\n  // Write your code here\n  return "";\n}',
    params: 'num',
    testCases: [
      { input: [5], expected: 'Positive' },
      { input: [-3], expected: 'Negative' },
      { input: [0], expected: 'Zero' }
    ],
    explanation: 'Use if-else-if to check if num > 0, num < 0, or num == 0.'
  },
  {
    id: 14,
    phase: 'Operators & Control Flow',
    title: 'Voting Eligibility',
    type: 'CODING',
    desc: 'Check if a person is eligible to vote (age >= 18)',
    syntax: 'public static String checkVoting(int age) {\n  // Write your code here\n  return "";\n}',
    params: 'age',
    testCases: [
      { input: [20], expected: 'Eligible' },
      { input: [16], expected: 'Not Eligible' },
      { input: [18], expected: 'Eligible' }
    ],
    explanation: 'Check if age >= 18 to determine eligibility.'
  },
  {
    id: 15,
    phase: 'Operators & Control Flow',
    title: 'Max of Three',
    type: 'CODING',
    desc: 'Find the maximum of three numbers',
    syntax: 'public static int findMax(int a, int b, int c) {\n  // Write your code here\n  return 0;\n}',
    params: 'a, b, c',
    testCases: [
      { input: [10, 20, 15], expected: 20 },
      { input: [5, 5, 5], expected: 5 },
      { input: [100, 50, 75], expected: 100 }
    ],
    explanation: 'Use nested if-else or Math.max() to find the maximum value.'
  },
  {
    id: 16,
    phase: 'Operators & Control Flow',
    title: 'Simple Calculator',
    type: 'CODING',
    desc: 'Create a simple calculator for +, -, *, /',
    syntax: 'public static double calculate(double a, double b, char op) {\n  // Write your code here\n  return 0;\n}',
    params: 'a, b, op',
    testCases: [
      { input: [10, 5, '+'], expected: 15 },
      { input: [10, 5, '-'], expected: 5 },
      { input: [10, 5, '*'], expected: 50 },
      { input: [10, 5, '/'], expected: 2 }
    ],
    explanation: 'Use a switch statement to perform the operation based on the operator.'
  },
  {
    id: 17,
    phase: 'Operators & Control Flow',
    title: 'Divisible by 5 and 11',
    type: 'CODING',
    desc: 'Check if a number is divisible by both 5 and 11',
    syntax: 'public static boolean checkDivisible(int num) {\n  // Write your code here\n  return false;\n}',
    params: 'num',
    testCases: [
      { input: [55], expected: true },
      { input: [50], expected: false },
      { input: [110], expected: true }
    ],
    explanation: 'Check if num % 5 == 0 && num % 11 == 0.'
  },
  {
    id: 18,
    phase: 'Operators & Control Flow',
    title: 'Swap with Temp',
    type: 'CODING',
    desc: 'Swap two numbers using a temporary variable',
    syntax: 'public static int[] swapWithTemp(int a, int b) {\n  // Write your code here\n  return new int[]{a, b};\n}',
    params: 'a, b',
    testCases: [
      { input: [5, 10], expected: [10, 5] },
      { input: [100, 200], expected: [200, 100] }
    ],
    explanation: 'Use a temporary variable: temp = a; a = b; b = temp;'
  },
  {
    id: 19,
    phase: 'Operators & Control Flow',
    title: 'Swap without Temp',
    type: 'CODING',
    desc: 'Swap two numbers without using a temporary variable',
    syntax: 'public static int[] swapWithoutTemp(int a, int b) {\n  // Write your code here\n  return new int[]{a, b};\n}',
    params: 'a, b',
    testCases: [
      { input: [5, 10], expected: [10, 5] },
      { input: [100, 200], expected: [200, 100] }
    ],
    explanation: 'Use arithmetic: a = a + b; b = a - b; a = a - b; or XOR: a = a ^ b; b = a ^ b; a = a ^ b;'
  },
  {
    id: 20,
    phase: 'Operators & Control Flow',
    title: 'Vowel or Consonant',
    type: 'CODING',
    desc: 'Check if a character is a vowel or consonant',
    syntax: 'public static String checkVowel(char ch) {\n  // Write your code here\n  return "";\n}',
    params: 'ch',
    testCases: [
      { input: ['a'], expected: 'Vowel' },
      { input: ['b'], expected: 'Consonant' },
      { input: ['E'], expected: 'Vowel' }
    ],
    explanation: 'Check if ch is one of a, e, i, o, u (case-insensitive).'
  },

  // 🔹 MEDIUM (11-20)
  {
    id: 21,
    phase: 'Operators & Control Flow',
    title: 'Grade System',
    type: 'CODING',
    desc: 'Assign grades based on marks (A: 90+, B: 80-89, C: 70-79, D: 60-69, F: <60)',
    syntax: 'public static String assignGrade(int marks) {\n  // Write your code here\n  return "";\n}',
    params: 'marks',
    testCases: [
      { input: [95], expected: 'A' },
      { input: [85], expected: 'B' },
      { input: [75], expected: 'C' },
      { input: [65], expected: 'D' },
      { input: [50], expected: 'F' }
    ],
    explanation: 'Use if-else-if ladder to check mark ranges.'
  },
  {
    id: 22,
    phase: 'Operators & Control Flow',
    title: 'Leap Year',
    type: 'CODING',
    desc: 'Check if a year is a leap year',
    syntax: 'public static boolean isLeapYear(int year) {\n  // Write your code here\n  return false;\n}',
    params: 'year',
    testCases: [
      { input: [2020], expected: true },
      { input: [2021], expected: false },
      { input: [2000], expected: true },
      { input: [1900], expected: false }
    ],
    explanation: 'A year is a leap year if divisible by 4, except century years must be divisible by 400.'
  },
  {
    id: 23,
    phase: 'Operators & Control Flow',
    title: 'Electricity Bill',
    type: 'CODING',
    desc: 'Calculate electricity bill: 0-100 units: $0.50/unit, 101-200: $0.75/unit, 201+: $1.20/unit',
    syntax: 'public static double calculateBill(int units) {\n  // Write your code here\n  return 0.0;\n}',
    params: 'units',
    testCases: [
      { input: [50], expected: 25.0 },
      { input: [150], expected: 87.5 },
      { input: [250], expected: 210.0 }
    ],
    explanation: 'Use if-else to calculate bill based on unit ranges.'
  },
  {
    id: 24,
    phase: 'Operators & Control Flow',
    title: 'Profit or Loss',
    type: 'CODING',
    desc: 'Determine profit or loss given cost price and selling price',
    syntax: 'public static String profitOrLoss(double cp, double sp) {\n  // Write your code here\n  return "";\n}',
    params: 'cp, sp',
    testCases: [
      { input: [100, 120], expected: 'Profit' },
      { input: [100, 80], expected: 'Loss' },
      { input: [100, 100], expected: 'No Profit No Loss' }
    ],
    explanation: 'Compare sp with cp to determine profit, loss, or break-even.'
  },
  {
    id: 25,
    phase: 'Operators & Control Flow',
    title: 'Days in Month',
    type: 'CODING',
    desc: 'Return the number of days in a given month using switch',
    syntax: 'public static int daysInMonth(int month) {\n  // Write your code here\n  return 0;\n}',
    params: 'month',
    testCases: [
      { input: [1], expected: 31 },
      { input: [2], expected: 28 },
      { input: [4], expected: 30 }
    ],
    explanation: 'Use switch to return days for each month (assume non-leap year for Feb).'
  },
  {
    id: 26,
    phase: 'Operators & Control Flow',
    title: 'Menu-Driven Calculator',
    type: 'CODING',
    desc: 'Create a menu-driven calculator with switch (1:Add, 2:Sub, 3:Mul, 4:Div)',
    syntax: 'public static double menuCalculator(int choice, double a, double b) {\n  // Write your code here\n  return 0;\n}',
    params: 'choice, a, b',
    testCases: [
      { input: [1, 10, 5], expected: 15 },
      { input: [2, 10, 5], expected: 5 },
      { input: [3, 10, 5], expected: 50 },
      { input: [4, 10, 5], expected: 2 }
    ],
    explanation: 'Use switch on choice to perform the selected operation.'
  },
  {
    id: 27,
    phase: 'Operators & Control Flow',
    title: 'Triangle Type',
    type: 'CODING',
    desc: 'Check if a triangle is equilateral, isosceles, or scalene',
    syntax: 'public static String triangleType(int a, int b, int c) {\n  // Write your code here\n  return "";\n}',
    params: 'a, b, c',
    testCases: [
      { input: [5, 5, 5], expected: 'Equilateral' },
      { input: [5, 5, 3], expected: 'Isosceles' },
      { input: [3, 4, 5], expected: 'Scalene' }
    ],
    explanation: 'Equilateral: all sides equal. Isosceles: two sides equal. Scalene: all sides different.'
  },
  {
    id: 28,
    phase: 'Operators & Control Flow',
    title: 'Quadratic Roots',
    type: 'CODING',
    desc: 'Find the nature of roots of a quadratic equation (ax² + bx + c = 0)',
    syntax: 'public static String quadraticRoots(int a, int b, int c) {\n  // Write your code here\n  return "";\n}',
    params: 'a, b, c',
    testCases: [
      { input: [1, -3, 2], expected: 'Real and Distinct' },
      { input: [1, -2, 1], expected: 'Real and Equal' },
      { input: [1, 2, 5], expected: 'Imaginary' }
    ],
    explanation: 'Calculate discriminant D = b² - 4ac. D > 0: Real and Distinct, D = 0: Real and Equal, D < 0: Imaginary.'
  },
  {
    id: 29,
    phase: 'Operators & Control Flow',
    title: 'Uppercase or Lowercase',
    type: 'CODING',
    desc: 'Check if a character is uppercase or lowercase',
    syntax: 'public static String checkCase(char ch) {\n  // Write your code here\n  return "";\n}',
    params: 'ch',
    testCases: [
      { input: ['A'], expected: 'Uppercase' },
      { input: ['a'], expected: 'Lowercase' },
      { input: ['Z'], expected: 'Uppercase' }
    ],
    explanation: 'Check if ch is between A-Z (uppercase) or a-z (lowercase).'
  },
  {
    id: 30,
    phase: 'Operators & Control Flow',
    title: 'Bitwise Even/Odd',
    type: 'CODING',
    desc: 'Check if a number is even or odd using bitwise AND',
    syntax: 'public static String bitwiseEvenOdd(int num) {\n  // Write your code here\n  return "";\n}',
    params: 'num',
    testCases: [
      { input: [4], expected: 'Even' },
      { input: [7], expected: 'Odd' },
      { input: [0], expected: 'Even' }
    ],
    explanation: 'Use bitwise AND: if (num & 1) == 0, the number is even, else odd.'
  },

  // 🔹 ADVANCED (21-30)
  {
    id: 31,
    phase: 'Operators & Control Flow',
    title: 'Number Classification',
    type: 'CODING',
    desc: 'Check if a number is prime, even, and divisible by 3',
    syntax: 'public static String classifyNumber(int num) {\n  // Write your code here\n  return "";\n}',
    params: 'num',
    testCases: [
      { input: [6], expected: 'Even, Divisible by 3, Not Prime' },
      { input: [7], expected: 'Odd, Not Divisible by 3, Prime' },
      { input: [9], expected: 'Odd, Divisible by 3, Not Prime' }
    ],
    explanation: 'Check multiple conditions: even/odd, divisibility by 3, and prime number logic.'
  },
  {
    id: 32,
    phase: 'Operators & Control Flow',
    title: 'ATM Withdrawal',
    type: 'CODING',
    desc: 'Simulate ATM withdrawal with balance check and denomination validation',
    syntax: 'public static String atmWithdraw(int balance, int amount) {\n  // Write your code here\n  return "";\n}',
    params: 'balance, amount',
    testCases: [
      { input: [1000, 500], expected: 'Success' },
      { input: [1000, 1500], expected: 'Insufficient Balance' },
      { input: [1000, 350], expected: 'Invalid Denomination' }
    ],
    explanation: 'Check if amount <= balance and amount is a multiple of 100.'
  },
  {
    id: 33,
    phase: 'Operators & Control Flow',
    title: 'Traffic Light Simulation',
    type: 'CODING',
    desc: 'Simulate traffic light behavior (Red: Stop, Yellow: Wait, Green: Go)',
    syntax: 'public static String trafficLight(String color) {\n  // Write your code here\n  return "";\n}',
    params: 'color',
    testCases: [
      { input: ['Red'], expected: 'Stop' },
      { input: ['Yellow'], expected: 'Wait' },
      { input: ['Green'], expected: 'Go' }
    ],
    explanation: 'Use switch or if-else to return the appropriate action for each color.'
  },
  {
    id: 34,
    phase: 'Operators & Control Flow',
    title: 'Login System',
    type: 'CODING',
    desc: 'Validate username and password (username: "admin", password: "1234")',
    syntax: 'public static String login(String username, String password) {\n  // Write your code here\n  return "";\n}',
    params: 'username, password',
    testCases: [
      { input: ['admin', '1234'], expected: 'Login Successful' },
      { input: ['admin', 'wrong'], expected: 'Invalid Password' },
      { input: ['user', '1234'], expected: 'Invalid Username' }
    ],
    explanation: 'Check if both username and password match the expected values.'
  },
  {
    id: 35,
    phase: 'Operators & Control Flow',
    title: 'Discount System',
    type: 'CODING',
    desc: 'Calculate discount: <$100: 0%, $100-$500: 10%, $500-$1000: 20%, >$1000: 30%',
    syntax: 'public static double calculateDiscount(double amount) {\n  // Write your code here\n  return 0.0;\n}',
    params: 'amount',
    testCases: [
      { input: [50], expected: 50.0 },
      { input: [200], expected: 180.0 },
      { input: [700], expected: 560.0 },
      { input: [1500], expected: 1050.0 }
    ],
    explanation: 'Use nested if-else to apply the appropriate discount percentage.'
  },
  {
    id: 36,
    phase: 'Operators & Control Flow',
    title: 'Greatest of Four',
    type: 'CODING',
    desc: 'Find the greatest among four numbers',
    syntax: 'public static int findGreatest(int a, int b, int c, int d) {\n  // Write your code here\n  return 0;\n}',
    params: 'a, b, c, d',
    testCases: [
      { input: [10, 20, 15, 25], expected: 25 },
      { input: [5, 5, 5, 5], expected: 5 },
      { input: [100, 50, 75, 80], expected: 100 }
    ],
    explanation: 'Use nested if-else or Math.max() to find the maximum value among four numbers.'
  },
  {
    id: 37,
    phase: 'Operators & Control Flow',
    title: 'Temperature Converter',
    type: 'CODING',
    desc: 'Convert temperature (1: C to F, 2: F to C, 3: C to K)',
    syntax: 'public static double convertTemp(int choice, double temp) {\n  // Write your code here\n  return 0.0;\n}',
    params: 'choice, temp',
    testCases: [
      { input: [1, 0], expected: 32.0 },
      { input: [2, 32], expected: 0.0 },
      { input: [3, 0], expected: 273.15 }
    ],
    explanation: 'Use switch: 1: F = C * 9/5 + 32, 2: C = (F - 32) * 5/9, 3: K = C + 273.15'
  },
  {
    id: 38,
    phase: 'Operators & Control Flow',
    title: 'Tax Calculator',
    type: 'CODING',
    desc: 'Calculate tax: <$10k: 0%, $10k-$50k: 10%, $50k-$100k: 20%, >$100k: 30%',
    syntax: 'public static double calculateTax(double income) {\n  // Write your code here\n  return 0.0;\n}',
    params: 'income',
    testCases: [
      { input: [5000], expected: 0.0 },
      { input: [30000], expected: 3000.0 },
      { input: [75000], expected: 15000.0 },
      { input: [150000], expected: 45000.0 }
    ],
    explanation: 'Use if-else ladder to calculate tax based on income slabs.'
  },
  {
    id: 39,
    phase: 'Operators & Control Flow',
    title: 'Rock-Paper-Scissors',
    type: 'CODING',
    desc: 'Implement Rock-Paper-Scissors game logic (1: Rock, 2: Paper, 3: Scissors)',
    syntax: 'public static String rps(int player, int computer) {\n  // Write your code here\n  return "";\n}',
    params: 'player, computer',
    testCases: [
      { input: [1, 3], expected: 'Player Wins' },
      { input: [2, 1], expected: 'Player Wins' },
      { input: [1, 2], expected: 'Computer Wins' },
      { input: [1, 1], expected: 'Draw' }
    ],
    explanation: 'Rock beats Scissors, Scissors beats Paper, Paper beats Rock. Use nested if-else or switch.'
  },
  {
    id: 40,
    phase: 'Operators & Control Flow',
    title: 'Bit Manipulation',
    type: 'CODING',
    desc: 'Set, clear, and toggle a bit at position n (1: Set, 2: Clear, 3: Toggle)',
    syntax: 'public static int bitManipulation(int num, int pos, int operation) {\n  // Write your code here\n  return 0;\n}',
    params: 'num, pos, operation',
    testCases: [
      { input: [5, 1, 1], expected: 7 },
      { input: [7, 1, 2], expected: 5 },
      { input: [5, 0, 3], expected: 4 }
    ],
    explanation: 'Set: num | (1 << pos), Clear: num & ~(1 << pos), Toggle: num ^ (1 << pos)'
  }
];

// Combine MCQs and Coding Questions
JAVA_MODULE2_QUESTIONS.push(...mcqs, ...codingQuestions);

export const JAVA_MODULE2_PHASES = [
  { name: 'Operators & Control Flow', start: 0, end: 39, label: 'Module 2: Operators & Control Flow' }
];

export const JAVA_MODULE2_THEORIES = {
  'Operators & Control Flow': {
    title: 'Operators & Control Flow',
    content: [
      'Arithmetic, Relational, Logical, Bitwise, and Assignment Operators',
      'Conditional Statements: if, if-else, if-else-if, nested if, ternary operator',
      'Switch Statements: multi-way branching with int, char, String',
      'Operator Precedence and Associativity',
      'Short-circuit Evaluation in Logical Operators',
      'Bitwise Operations: AND, OR, XOR, NOT, Left Shift, Right Shift'
    ]
  }
};
