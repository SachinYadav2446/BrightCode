// JAVA MODULE 6: STRINGS
// Structure: 10 MCQs + 30 Coding Questions (Easy, Medium, Advanced Interview Level)

export const JAVA_MODULE6_QUESTIONS = [];

// ═══════════════════════════════════════════════════════════
// 🧠 10 MCQs (Concept Building)
// ═══════════════════════════════════════════════════════════

const mcqs = [
  {
    id: 1,
    phase: 'Strings',
    title: 'String Type',
    type: 'MCQ',
    question: 'String is?',
    options: ['Primitive', 'Class', 'Method', 'Array'],
    answer: 1,
    explanation: 'String is a class in Java, not a primitive data type.'
  },
  {
    id: 2,
    phase: 'Strings',
    title: 'String Immutability',
    type: 'MCQ',
    question: 'Strings in Java are?',
    options: ['Mutable', 'Immutable', 'Dynamic', 'Static'],
    answer: 1,
    explanation: 'Strings are immutable in Java - once created, their value cannot be changed.'
  },
  {
    id: 3,
    phase: 'Strings',
    title: 'String Length',
    type: 'MCQ',
    question: 'Which method gives length?',
    options: ['size()', 'length()', 'len()', 'count()'],
    answer: 1,
    explanation: 'String length is obtained using the length() method.'
  },
  {
    id: 4,
    phase: 'Strings',
    title: 'String Comparison',
    type: 'MCQ',
    question: 'Compare strings correctly?',
    options: ['==', 'equals()', 'compare()', 'match()'],
    answer: 1,
    explanation: 'Use equals() to compare string content. == compares references.'
  },
  {
    id: 5,
    phase: 'Strings',
    title: 'String Concatenation',
    type: 'MCQ',
    question: 'String concatenation operator?',
    options: ['&', '+', '*', '%'],
    answer: 1,
    explanation: 'The + operator is used for string concatenation in Java.'
  },
  {
    id: 6,
    phase: 'Strings',
    title: 'charAt Method',
    type: 'MCQ',
    question: 'charAt() does?',
    options: ['returns string', 'returns character', 'returns index', 'none'],
    answer: 1,
    explanation: 'charAt(index) returns the character at the specified index.'
  },
  {
    id: 7,
    phase: 'Strings',
    title: 'Substring Method',
    type: 'MCQ',
    question: 'substring(1,4) means?',
    options: ['1 to 4 inclusive', '1 to 4 exclusive of 4', '0 to 4', 'none'],
    answer: 1,
    explanation: 'substring(start, end) includes start index but excludes end index.'
  },
  {
    id: 8,
    phase: 'Strings',
    title: 'toUpperCase Method',
    type: 'MCQ',
    question: 'toUpperCase() returns?',
    options: ['modifies original', 'new string', 'error', 'none'],
    answer: 1,
    explanation: 'toUpperCase() returns a new string; original string remains unchanged (immutable).'
  },
  {
    id: 9,
    phase: 'Strings',
    title: 'StringBuilder',
    type: 'MCQ',
    question: 'StringBuilder is?',
    options: ['Immutable', 'Mutable', 'Static', 'none'],
    answer: 1,
    explanation: 'StringBuilder is mutable - can be modified without creating new objects.'
  },
  {
    id: 10,
    phase: 'Strings',
    title: 'Performance',
    type: 'MCQ',
    question: 'Which is faster?',
    options: ['String', 'StringBuilder', 'Both same', 'none'],
    answer: 1,
    explanation: 'StringBuilder is faster for multiple concatenations as it is mutable.'
  }
];

// ═══════════════════════════════════════════════════════════
// 💻 30 CODING QUESTIONS (Basic → Advanced)
// ═══════════════════════════════════════════════════════════

const codingQuestions = [
  // 🔹 EASY (1-10)
  {
    id: 11,
    phase: 'Strings',
    title: 'Print String',
    type: 'CODING',
    desc: 'Print a string',
    syntax: 'public static void printString(String str) {\n  // Write your code here\n}',
    params: 'str',
    testCases: [
      { input: ['Hello'], expected: 'Hello' }
    ],
    explanation: 'Simply print the string using System.out.println().'
  },
  {
    id: 12,
    phase: 'Strings',
    title: 'String Length',
    type: 'CODING',
    desc: 'Find length of a string',
    syntax: 'public static int getLength(String str) {\n  // Write your code here\n  return 0;\n}',
    params: 'str',
    testCases: [
      { input: ['Hello'], expected: 5 },
      { input: ['Java'], expected: 4 }
    ],
    explanation: 'Use the length() method to get string length.'
  },
  {
    id: 13,
    phase: 'Strings',
    title: 'Count Vowels and Consonants',
    type: 'CODING',
    desc: 'Count vowels and consonants in a string',
    syntax: 'public static int[] countVowelsConsonants(String str) {\n  // Write your code here\n  return new int[]{0, 0}; // [vowels, consonants]\n}',
    params: 'str',
    testCases: [
      { input: ['Hello'], expected: [2, 3] },
      { input: ['Java'], expected: [2, 2] }
    ],
    explanation: 'Check each character if it is a vowel (a,e,i,o,u) or consonant.'
  },
  {
    id: 14,
    phase: 'Strings',
    title: 'Reverse String',
    type: 'CODING',
    desc: 'Reverse a string',
    syntax: 'public static String reverseString(String str) {\n  // Write your code here\n  return "";\n}',
    params: 'str',
    testCases: [
      { input: ['Hello'], expected: 'olleH' },
      { input: ['Java'], expected: 'avaJ' }
    ],
    explanation: 'Use StringBuilder reverse() or loop from end to start.'
  },
  {
    id: 15,
    phase: 'Strings',
    title: 'Check Palindrome',
    type: 'CODING',
    desc: 'Check if string is palindrome',
    syntax: 'public static boolean isPalindrome(String str) {\n  // Write your code here\n  return false;\n}',
    params: 'str',
    testCases: [
      { input: ['racecar'], expected: true },
      { input: ['hello'], expected: false },
      { input: ['madam'], expected: true }
    ],
    explanation: 'Compare string with its reverse or use two pointers.'
  },
  {
    id: 16,
    phase: 'Strings',
    title: 'Convert to Uppercase',
    type: 'CODING',
    desc: 'Convert string to uppercase',
    syntax: 'public static String toUpper(String str) {\n  // Write your code here\n  return "";\n}',
    params: 'str',
    testCases: [
      { input: ['hello'], expected: 'HELLO' },
      { input: ['Java'], expected: 'JAVA' }
    ],
    explanation: 'Use toUpperCase() method or convert each character.'
  },
  {
    id: 17,
    phase: 'Strings',
    title: 'Convert to Lowercase',
    type: 'CODING',
    desc: 'Convert string to lowercase',
    syntax: 'public static String toLower(String str) {\n  // Write your code here\n  return "";\n}',
    params: 'str',
    testCases: [
      { input: ['HELLO'], expected: 'hello' },
      { input: ['Java'], expected: 'java' }
    ],
    explanation: 'Use toLowerCase() method or convert each character.'
  },
  {
    id: 18,
    phase: 'Strings',
    title: 'Count Words',
    type: 'CODING',
    desc: 'Count number of words in a string',
    syntax: 'public static int countWords(String str) {\n  // Write your code here\n  return 0;\n}',
    params: 'str',
    testCases: [
      { input: ['Hello World'], expected: 2 },
      { input: ['Java Programming Language'], expected: 3 }
    ],
    explanation: 'Split string by spaces and count tokens, or count spaces + 1.'
  },
  {
    id: 19,
    phase: 'Strings',
    title: 'Remove Spaces',
    type: 'CODING',
    desc: 'Remove all spaces from string',
    syntax: 'public static String removeSpaces(String str) {\n  // Write your code here\n  return "";\n}',
    params: 'str',
    testCases: [
      { input: ['Hello World'], expected: 'HelloWorld' },
      { input: ['Java  Programming'], expected: 'JavaProgramming' }
    ],
    explanation: 'Use replaceAll(" ", "") or loop and skip spaces.'
  },
  {
    id: 20,
    phase: 'Strings',
    title: 'Replace Character',
    type: 'CODING',
    desc: 'Replace all occurrences of a character',
    syntax: 'public static String replaceChar(String str, char oldChar, char newChar) {\n  // Write your code here\n  return "";\n}',
    params: 'str, oldChar, newChar',
    testCases: [
      { input: ['hello', 'l', 'x'], expected: 'hexxo' },
      { input: ['java', 'a', 'o'], expected: 'jovo' }
    ],
    explanation: 'Use replace() method or loop through and replace characters.'
  },

  // 🔹 MEDIUM (11-20)
  {
    id: 21,
    phase: 'Strings',
    title: 'Check Anagram',
    type: 'CODING',
    desc: 'Check if two strings are anagrams',
    syntax: 'public static boolean isAnagram(String str1, String str2) {\n  // Write your code here\n  return false;\n}',
    params: 'str1, str2',
    testCases: [
      { input: ['listen', 'silent'], expected: true },
      { input: ['hello', 'world'], expected: false }
    ],
    explanation: 'Sort both strings and compare, or use character frequency count.'
  },
  {
    id: 22,
    phase: 'Strings',
    title: 'Character Frequency',
    type: 'CODING',
    desc: 'Count frequency of each character',
    syntax: 'public static Map<Character, Integer> charFrequency(String str) {\n  // Write your code here\n  return new HashMap<>();\n}',
    params: 'str',
    testCases: [
      { input: ['hello'], expected: {h:1, e:1, l:2, o:1} }
    ],
    explanation: 'Use HashMap to store character counts.'
  },
  {
    id: 23,
    phase: 'Strings',
    title: 'Remove Duplicates',
    type: 'CODING',
    desc: 'Remove duplicate characters from string',
    syntax: 'public static String removeDuplicates(String str) {\n  // Write your code here\n  return "";\n}',
    params: 'str',
    testCases: [
      { input: ['hello'], expected: 'helo' },
      { input: ['programming'], expected: 'progamin' }
    ],
    explanation: 'Use HashSet to track seen characters or StringBuilder.'
  },
  {
    id: 24,
    phase: 'Strings',
    title: 'First Non-Repeating Character',
    type: 'CODING',
    desc: 'Find first non-repeating character',
    syntax: 'public static char firstNonRepeating(String str) {\n  // Write your code here\n  return \'\\0\';\n}',
    params: 'str',
    testCases: [
      { input: ['swiss'], expected: 'w' },
      { input: ['aabbcc'], expected: '\0' }
    ],
    explanation: 'Use frequency map, then find first character with count 1.'
  },
  {
    id: 25,
    phase: 'Strings',
    title: 'Longest Word',
    type: 'CODING',
    desc: 'Find longest word in a sentence',
    syntax: 'public static String longestWord(String str) {\n  // Write your code here\n  return "";\n}',
    params: 'str',
    testCases: [
      { input: ['The quick brown fox'], expected: 'quick' },
      { input: ['Java programming'], expected: 'programming' }
    ],
    explanation: 'Split by spaces and find word with maximum length.'
  },
  {
    id: 26,
    phase: 'Strings',
    title: 'Contains Substring',
    type: 'CODING',
    desc: 'Check if string contains substring',
    syntax: 'public static boolean containsSubstring(String str, String sub) {\n  // Write your code here\n  return false;\n}',
    params: 'str, sub',
    testCases: [
      { input: ['hello world', 'world'], expected: true },
      { input: ['java', 'python'], expected: false }
    ],
    explanation: 'Use contains() method or indexOf() != -1.'
  },
  {
    id: 27,
    phase: 'Strings',
    title: 'Toggle Case',
    type: 'CODING',
    desc: 'Toggle case of each character (upper to lower, lower to upper)',
    syntax: 'public static String toggleCase(String str) {\n  // Write your code here\n  return "";\n}',
    params: 'str',
    testCases: [
      { input: ['Hello'], expected: 'hELLO' },
      { input: ['JaVa'], expected: 'jAvA' }
    ],
    explanation: 'Check each character and toggle using Character methods.'
  },
  {
    id: 28,
    phase: 'Strings',
    title: 'Count Digits and Special Chars',
    type: 'CODING',
    desc: 'Count digits and special characters',
    syntax: 'public static int[] countDigitsSpecial(String str) {\n  // Write your code here\n  return new int[]{0, 0}; // [digits, special]\n}',
    params: 'str',
    testCases: [
      { input: ['Hello123!@'], expected: [3, 2] }
    ],
    explanation: 'Use Character.isDigit() and check for non-alphanumeric characters.'
  },
  {
    id: 29,
    phase: 'Strings',
    title: 'Sort Characters',
    type: 'CODING',
    desc: 'Sort characters in a string',
    syntax: 'public static String sortString(String str) {\n  // Write your code here\n  return "";\n}',
    params: 'str',
    testCases: [
      { input: ['dcba'], expected: 'abcd' },
      { input: ['java'], expected: 'aajv' }
    ],
    explanation: 'Convert to char array, sort, and convert back to string.'
  },
  {
    id: 30,
    phase: 'Strings',
    title: 'Reverse Words',
    type: 'CODING',
    desc: 'Reverse words in a sentence',
    syntax: 'public static String reverseWords(String str) {\n  // Write your code here\n  return "";\n}',
    params: 'str',
    testCases: [
      { input: ['Hello World'], expected: 'World Hello' },
      { input: ['Java Programming'], expected: 'Programming Java' }
    ],
    explanation: 'Split by spaces, reverse array of words, join back.'
  },

  // 🔹 ADVANCED (21-30) — 🔥 INTERVIEW LEVEL
  {
    id: 31,
    phase: 'Strings',
    title: 'Longest Substring Without Repeating 🔥',
    type: 'CODING',
    desc: 'Find length of longest substring without repeating characters',
    syntax: 'public static int lengthOfLongestSubstring(String str) {\n  // Write your code here\n  return 0;\n}',
    params: 'str',
    testCases: [
      { input: ['abcabcbb'], expected: 3 },
      { input: ['bbbbb'], expected: 1 },
      { input: ['pwwkew'], expected: 3 }
    ],
    explanation: 'Use sliding window with HashSet. Classic interview problem.'
  },
  {
    id: 32,
    phase: 'Strings',
    title: 'Valid Palindrome',
    type: 'CODING',
    desc: 'Check palindrome ignoring non-alphanumeric characters',
    syntax: 'public static boolean isPalindromeIgnoreSpecial(String str) {\n  // Write your code here\n  return false;\n}',
    params: 'str',
    testCases: [
      { input: ['A man, a plan, a canal: Panama'], expected: true },
      { input: ['race a car'], expected: false }
    ],
    explanation: 'Filter alphanumeric, convert to lowercase, check palindrome.'
  },
  {
    id: 33,
    phase: 'Strings',
    title: 'String Compression',
    type: 'CODING',
    desc: 'Compress string (aabcc → a2b1c2)',
    syntax: 'public static String compressString(String str) {\n  // Write your code here\n  return "";\n}',
    params: 'str',
    testCases: [
      { input: ['aabcccccaaa'], expected: 'a2b1c5a3' },
      { input: ['abc'], expected: 'a1b1c1' }
    ],
    explanation: 'Count consecutive characters and build compressed string.'
  },
  {
    id: 34,
    phase: 'Strings',
    title: 'Check String Rotation',
    type: 'CODING',
    desc: 'Check if one string is rotation of another',
    syntax: 'public static boolean isRotation(String str1, String str2) {\n  // Write your code here\n  return false;\n}',
    params: 'str1, str2',
    testCases: [
      { input: ['waterbottle', 'erbottlewat'], expected: true },
      { input: ['hello', 'lohel'], expected: true },
      { input: ['hello', 'world'], expected: false }
    ],
    explanation: 'Check if str2 is substring of str1 + str1.'
  },
  {
    id: 35,
    phase: 'Strings',
    title: 'Minimum Window Substring',
    type: 'CODING',
    desc: 'Find minimum window in str1 containing all characters of str2',
    syntax: 'public static String minWindow(String str1, String str2) {\n  // Write your code here\n  return "";\n}',
    params: 'str1, str2',
    testCases: [
      { input: ['ADOBECODEBANC', 'ABC'], expected: 'BANC' }
    ],
    explanation: 'Use sliding window with frequency maps. Hard problem.'
  },
  {
    id: 36,
    phase: 'Strings',
    title: 'Longest Common Prefix',
    type: 'CODING',
    desc: 'Find longest common prefix among array of strings',
    syntax: 'public static String longestCommonPrefix(String[] strs) {\n  // Write your code here\n  return "";\n}',
    params: 'strs',
    testCases: [
      { input: [['flower', 'flow', 'flight']], expected: 'fl' },
      { input: [['dog', 'racecar', 'car']], expected: '' }
    ],
    explanation: 'Compare characters at each position across all strings.'
  },
  {
    id: 37,
    phase: 'Strings',
    title: 'KMP Pattern Matching',
    type: 'CODING',
    desc: 'Implement KMP algorithm for pattern matching',
    syntax: 'public static int kmpSearch(String text, String pattern) {\n  // Write your code here\n  return -1;\n}',
    params: 'text, pattern',
    testCases: [
      { input: ['ababcabcabababd', 'ababd'], expected: 10 }
    ],
    explanation: 'Build LPS array and use it for efficient pattern matching.'
  },
  {
    id: 38,
    phase: 'Strings',
    title: 'Rabin-Karp Algorithm',
    type: 'CODING',
    desc: 'Implement Rabin-Karp for pattern matching using hashing',
    syntax: 'public static int rabinKarp(String text, String pattern) {\n  // Write your code here\n  return -1;\n}',
    params: 'text, pattern',
    testCases: [
      { input: ['hello world', 'world'], expected: 6 }
    ],
    explanation: 'Use rolling hash to find pattern in text efficiently.'
  },
  {
    id: 39,
    phase: 'Strings',
    title: 'Group Anagrams',
    type: 'CODING',
    desc: 'Group anagrams together from array of strings',
    syntax: 'public static List<List<String>> groupAnagrams(String[] strs) {\n  // Write your code here\n  return new ArrayList<>();\n}',
    params: 'strs',
    testCases: [
      { input: [['eat', 'tea', 'tan', 'ate', 'nat', 'bat']], expected: [['eat','tea','ate'],['tan','nat'],['bat']] }
    ],
    explanation: 'Use sorted string as key in HashMap to group anagrams.'
  },
  {
    id: 40,
    phase: 'Strings',
    title: 'Edit Distance (Levenshtein)',
    type: 'CODING',
    desc: 'Find minimum edit distance between two strings',
    syntax: 'public static int editDistance(String str1, String str2) {\n  // Write your code here\n  return 0;\n}',
    params: 'str1, str2',
    testCases: [
      { input: ['horse', 'ros'], expected: 3 },
      { input: ['intention', 'execution'], expected: 5 }
    ],
    explanation: 'Use dynamic programming. Classic DP problem for string manipulation.'
  }
];

// Combine MCQs and Coding Questions
JAVA_MODULE6_QUESTIONS.push(...mcqs, ...codingQuestions);

export const JAVA_MODULE6_PHASES = [
  { name: 'Strings', start: 0, end: 39, label: 'Module 6: Strings' }
];

export const JAVA_MODULE6_THEORIES = {
  'Strings': {
    title: 'Strings',
    content: [
      'String Basics: Immutability, String pool',
      'String Methods: length(), charAt(), substring(), indexOf()',
      'String Comparison: equals(), compareTo(), ==',
      'String Manipulation: concat(), replace(), split(), trim()',
      'StringBuilder & StringBuffer: Mutable alternatives',
      'String Algorithms: Palindrome, anagram, pattern matching',
      'Sliding Window: For substring problems',
      'Two Pointer: For string manipulation',
      'Advanced: KMP, Rabin-Karp, Edit distance',
      'Interview Patterns: Longest substring, string compression, rotation'
    ]
  }
};
