// JAVA MODULE 5: ARRAYS
// Structure: 10 MCQs + 30 Coding Questions (Easy, Medium, Advanced DSA Level)

export const JAVA_MODULE5_QUESTIONS = [];

// ═══════════════════════════════════════════════════════════
// 🧠 10 MCQs (Concept Building)
// ═══════════════════════════════════════════════════════════

const mcqs = [
  {
    id: 1,
    phase: 'Arrays',
    title: 'Array Definition',
    type: 'MCQ',
    question: 'What is an array?',
    options: ['Collection of variables', 'Collection of same type elements', 'Object', 'Method'],
    answer: 1,
    explanation: 'An array is a collection of elements of the same data type stored in contiguous memory.'
  },
  {
    id: 2,
    phase: 'Arrays',
    title: 'Array Indexing',
    type: 'MCQ',
    question: 'Indexing in Java arrays starts from?',
    options: ['1', '0', '-1', 'depends'],
    answer: 1,
    explanation: 'Java arrays are zero-indexed, meaning the first element is at index 0.'
  },
  {
    id: 3,
    phase: 'Arrays',
    title: 'Array Size',
    type: 'MCQ',
    question: 'Size of array is?',
    options: ['Dynamic', 'Fixed after creation', 'Random', 'none'],
    answer: 1,
    explanation: 'Once an array is created in Java, its size is fixed and cannot be changed.'
  },
  {
    id: 4,
    phase: 'Arrays',
    title: 'Array Declaration',
    type: 'MCQ',
    question: 'Syntax to declare array?',
    options: ['int arr[] = new int[5];', 'int arr = new int[];', 'array int arr[5];', 'none'],
    answer: 0,
    explanation: 'Correct syntax: int arr[] = new int[5]; or int[] arr = new int[5];'
  },
  {
    id: 5,
    phase: 'Arrays',
    title: 'Default Values',
    type: 'MCQ',
    question: 'Default value of int array?',
    options: ['1', '0', 'null', 'undefined'],
    answer: 1,
    explanation: 'Integer arrays are initialized with 0 by default in Java.'
  },
  {
    id: 6,
    phase: 'Arrays',
    title: 'Element Access',
    type: 'MCQ',
    question: 'Access element?',
    options: ['arr(i)', 'arr[i]', 'arr{i}', 'arr<i>'],
    answer: 1,
    explanation: 'Array elements are accessed using square brackets: arr[i]'
  },
  {
    id: 7,
    phase: 'Arrays',
    title: 'Array Length',
    type: 'MCQ',
    question: 'Length of array?',
    options: ['size()', 'length()', 'length', 'count'],
    answer: 2,
    explanation: 'Array length is accessed using the length property (not a method): arr.length'
  },
  {
    id: 8,
    phase: 'Arrays',
    title: 'Index Out of Bounds',
    type: 'MCQ',
    question: 'Array index out of bounds gives?',
    options: ['error', 'exception', 'warning', 'none'],
    answer: 1,
    explanation: 'Accessing invalid index throws ArrayIndexOutOfBoundsException.'
  },
  {
    id: 9,
    phase: 'Arrays',
    title: 'Array Type Homogeneity',
    type: 'MCQ',
    question: 'Can array store different data types?',
    options: ['Yes', 'No', 'Sometimes', 'none'],
    answer: 1,
    explanation: 'Arrays in Java can only store elements of the same data type.'
  },
  {
    id: 10,
    phase: 'Arrays',
    title: 'Multi-dimensional Arrays',
    type: 'MCQ',
    question: 'Multi-dimensional array example?',
    options: ['int a[]', 'int a[][]', 'int a', 'none'],
    answer: 1,
    explanation: 'Multi-dimensional arrays use multiple brackets: int a[][] = new int[3][4];'
  }
];

// ═══════════════════════════════════════════════════════════
// 💻 30 CODING QUESTIONS (Basic → Advanced)
// ═══════════════════════════════════════════════════════════

const codingQuestions = [
  // 🔹 EASY (1-10)
  {
    id: 11,
    phase: 'Arrays',
    title: 'Print Array Elements',
    type: 'CODING',
    desc: 'Print all elements of an array',
    syntax: 'public static void printArray(int[] arr) {\n  // Write your code here\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: '1 2 3 4 5' }
    ],
    explanation: 'Loop through array and print each element.'
  },
  {
    id: 12,
    phase: 'Arrays',
    title: 'Sum of Array',
    type: 'CODING',
    desc: 'Calculate sum of all array elements',
    syntax: 'public static int sumArray(int[] arr) {\n  // Write your code here\n  return 0;\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 15 },
      { input: [[10, 20, 30]], expected: 60 }
    ],
    explanation: 'Initialize sum to 0, loop through array and add each element to sum.'
  },
  {
    id: 13,
    phase: 'Arrays',
    title: 'Find Maximum',
    type: 'CODING',
    desc: 'Find maximum element in array',
    syntax: 'public static int findMax(int[] arr) {\n  // Write your code here\n  return 0;\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 5, 3, 9, 2]], expected: 9 },
      { input: [[10, 20, 5]], expected: 20 }
    ],
    explanation: 'Initialize max with first element, compare with each element and update max.'
  },
  {
    id: 14,
    phase: 'Arrays',
    title: 'Find Minimum',
    type: 'CODING',
    desc: 'Find minimum element in array',
    syntax: 'public static int findMin(int[] arr) {\n  // Write your code here\n  return 0;\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 5, 3, 9, 2]], expected: 1 },
      { input: [[10, 20, 5]], expected: 5 }
    ],
    explanation: 'Initialize min with first element, compare with each element and update min.'
  },
  {
    id: 15,
    phase: 'Arrays',
    title: 'Count Even & Odd',
    type: 'CODING',
    desc: 'Count even and odd numbers in array',
    syntax: 'public static int[] countEvenOdd(int[] arr) {\n  // Write your code here\n  return new int[]{0, 0}; // [even, odd]\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [2, 3] },
      { input: [[2, 4, 6, 8]], expected: [4, 0] }
    ],
    explanation: 'Count elements where num % 2 == 0 (even) and num % 2 != 0 (odd).'
  },
  {
    id: 16,
    phase: 'Arrays',
    title: 'Reverse Array',
    type: 'CODING',
    desc: 'Reverse an array in-place',
    syntax: 'public static void reverseArray(int[] arr) {\n  // Write your code here\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [5, 4, 3, 2, 1] },
      { input: [[10, 20, 30]], expected: [30, 20, 10] }
    ],
    explanation: 'Use two pointers: swap elements from start and end, move pointers toward center.'
  },
  {
    id: 17,
    phase: 'Arrays',
    title: 'Copy Array',
    type: 'CODING',
    desc: 'Copy one array to another',
    syntax: 'public static int[] copyArray(int[] arr) {\n  // Write your code here\n  return new int[0];\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 2, 3]], expected: [1, 2, 3] }
    ],
    explanation: 'Create new array of same size and copy each element.'
  },
  {
    id: 18,
    phase: 'Arrays',
    title: 'Find Average',
    type: 'CODING',
    desc: 'Calculate average of array elements',
    syntax: 'public static double findAverage(int[] arr) {\n  // Write your code here\n  return 0.0;\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: 3.0 },
      { input: [[10, 20, 30]], expected: 20.0 }
    ],
    explanation: 'Sum all elements and divide by array length.'
  },
  {
    id: 19,
    phase: 'Arrays',
    title: 'Linear Search',
    type: 'CODING',
    desc: 'Search for an element in array (return index or -1)',
    syntax: 'public static int linearSearch(int[] arr, int target) {\n  // Write your code here\n  return -1;\n}',
    params: 'arr, target',
    testCases: [
      { input: [[1, 2, 3, 4, 5], 3], expected: 2 },
      { input: [[10, 20, 30], 40], expected: -1 }
    ],
    explanation: 'Loop through array, return index if element found, else return -1.'
  },
  {
    id: 20,
    phase: 'Arrays',
    title: 'Count Frequency',
    type: 'CODING',
    desc: 'Count frequency of a specific element',
    syntax: 'public static int countFrequency(int[] arr, int element) {\n  // Write your code here\n  return 0;\n}',
    params: 'arr, element',
    testCases: [
      { input: [[1, 2, 2, 3, 2, 4], 2], expected: 3 },
      { input: [[5, 5, 5, 5], 5], expected: 4 }
    ],
    explanation: 'Loop through array and count occurrences of the element.'
  },

  // 🔹 MEDIUM (11-20)
  {
    id: 21,
    phase: 'Arrays',
    title: 'Second Largest',
    type: 'CODING',
    desc: 'Find second largest element in array',
    syntax: 'public static int secondLargest(int[] arr) {\n  // Write your code here\n  return 0;\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 5, 3, 9, 2]], expected: 5 },
      { input: [[10, 20, 30]], expected: 20 }
    ],
    explanation: 'Track largest and second largest while traversing array.'
  },
  {
    id: 22,
    phase: 'Arrays',
    title: 'Remove Duplicates',
    type: 'CODING',
    desc: 'Remove duplicates from sorted array (return new length)',
    syntax: 'public static int removeDuplicates(int[] arr) {\n  // Write your code here\n  return 0;\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 1, 2, 2, 3]], expected: 3 },
      { input: [[1, 2, 3, 4]], expected: 4 }
    ],
    explanation: 'Use two pointers: one for unique elements, one for traversal.'
  },
  {
    id: 23,
    phase: 'Arrays',
    title: 'Bubble Sort',
    type: 'CODING',
    desc: 'Sort array using bubble sort',
    syntax: 'public static void bubbleSort(int[] arr) {\n  // Write your code here\n}',
    params: 'arr',
    testCases: [
      { input: [[5, 2, 8, 1, 9]], expected: [1, 2, 5, 8, 9] }
    ],
    explanation: 'Compare adjacent elements and swap if in wrong order, repeat n times.'
  },
  {
    id: 24,
    phase: 'Arrays',
    title: 'Selection Sort',
    type: 'CODING',
    desc: 'Sort array using selection sort',
    syntax: 'public static void selectionSort(int[] arr) {\n  // Write your code here\n}',
    params: 'arr',
    testCases: [
      { input: [[5, 2, 8, 1, 9]], expected: [1, 2, 5, 8, 9] }
    ],
    explanation: 'Find minimum element and place it at beginning, repeat for remaining array.'
  },
  {
    id: 25,
    phase: 'Arrays',
    title: 'Left Rotate by 1',
    type: 'CODING',
    desc: 'Left rotate array by 1 position',
    syntax: 'public static void leftRotate(int[] arr) {\n  // Write your code here\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [2, 3, 4, 5, 1] }
    ],
    explanation: 'Store first element, shift all elements left by 1, place first at end.'
  },
  {
    id: 26,
    phase: 'Arrays',
    title: 'Right Rotate by 1',
    type: 'CODING',
    desc: 'Right rotate array by 1 position',
    syntax: 'public static void rightRotate(int[] arr) {\n  // Write your code here\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: [5, 1, 2, 3, 4] }
    ],
    explanation: 'Store last element, shift all elements right by 1, place last at start.'
  },
  {
    id: 27,
    phase: 'Arrays',
    title: 'Merge Two Arrays',
    type: 'CODING',
    desc: 'Merge two sorted arrays',
    syntax: 'public static int[] mergeArrays(int[] arr1, int[] arr2) {\n  // Write your code here\n  return new int[0];\n}',
    params: 'arr1, arr2',
    testCases: [
      { input: [[1, 3, 5], [2, 4, 6]], expected: [1, 2, 3, 4, 5, 6] }
    ],
    explanation: 'Use two pointers to merge sorted arrays in sorted order.'
  },
  {
    id: 28,
    phase: 'Arrays',
    title: 'Find Missing Number',
    type: 'CODING',
    desc: 'Find missing number in array containing 1 to n',
    syntax: 'public static int findMissing(int[] arr, int n) {\n  // Write your code here\n  return 0;\n}',
    params: 'arr, n',
    testCases: [
      { input: [[1, 2, 4, 5], 5], expected: 3 },
      { input: [[1, 3, 4, 5], 5], expected: 2 }
    ],
    explanation: 'Use formula: sum of 1 to n minus sum of array elements.'
  },
  {
    id: 29,
    phase: 'Arrays',
    title: 'Find Duplicates',
    type: 'CODING',
    desc: 'Find all duplicate elements in array',
    syntax: 'public static int[] findDuplicates(int[] arr) {\n  // Write your code here\n  return new int[0];\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 2, 2, 3, 3, 4]], expected: [2, 3] }
    ],
    explanation: 'Use frequency counting or set to identify duplicates.'
  },
  {
    id: 30,
    phase: 'Arrays',
    title: 'Check Sorted',
    type: 'CODING',
    desc: 'Check if array is sorted in ascending order',
    syntax: 'public static boolean isSorted(int[] arr) {\n  // Write your code here\n  return false;\n}',
    params: 'arr',
    testCases: [
      { input: [[1, 2, 3, 4, 5]], expected: true },
      { input: [[1, 3, 2, 4]], expected: false }
    ],
    explanation: 'Check if each element is less than or equal to next element.'
  },

  // 🔹 ADVANCED (21-30) — 🔥 DSA LEVEL
  {
    id: 31,
    phase: 'Arrays',
    title: 'Two Sum Problem',
    type: 'CODING',
    desc: 'Find two numbers that add up to target (return indices)',
    syntax: 'public static int[] twoSum(int[] arr, int target) {\n  // Write your code here\n  return new int[]{-1, -1};\n}',
    params: 'arr, target',
    testCases: [
      { input: [[2, 7, 11, 15], 9], expected: [0, 1] },
      { input: [[3, 2, 4], 6], expected: [1, 2] }
    ],
    explanation: 'Use HashMap to store complements and find pair in O(n) time.'
  },
  {
    id: 32,
    phase: 'Arrays',
    title: 'Kadane\'s Algorithm 🔥',
    type: 'CODING',
    desc: 'Find maximum sum of contiguous subarray',
    syntax: 'public static int maxSubarraySum(int[] arr) {\n  // Write your code here\n  return 0;\n}',
    params: 'arr',
    testCases: [
      { input: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
      { input: [[1, 2, 3, 4]], expected: 10 }
    ],
    explanation: 'Track current sum and max sum. Reset current if negative. Classic DP problem.'
  },
  {
    id: 33,
    phase: 'Arrays',
    title: 'Stock Buy and Sell',
    type: 'CODING',
    desc: 'Find maximum profit from buying and selling stock once',
    syntax: 'public static int maxProfit(int[] prices) {\n  // Write your code here\n  return 0;\n}',
    params: 'prices',
    testCases: [
      { input: [[7, 1, 5, 3, 6, 4]], expected: 5 },
      { input: [[7, 6, 4, 3, 1]], expected: 0 }
    ],
    explanation: 'Track minimum price and maximum profit while traversing.'
  },
  {
    id: 34,
    phase: 'Arrays',
    title: 'Move Zeros to End',
    type: 'CODING',
    desc: 'Move all zeros to end while maintaining order of non-zeros',
    syntax: 'public static void moveZeros(int[] arr) {\n  // Write your code here\n}',
    params: 'arr',
    testCases: [
      { input: [[0, 1, 0, 3, 12]], expected: [1, 3, 12, 0, 0] }
    ],
    explanation: 'Use two pointers: one for non-zero position, one for traversal.'
  },
  {
    id: 35,
    phase: 'Arrays',
    title: 'Intersection of Arrays',
    type: 'CODING',
    desc: 'Find intersection of two arrays',
    syntax: 'public static int[] intersection(int[] arr1, int[] arr2) {\n  // Write your code here\n  return new int[0];\n}',
    params: 'arr1, arr2',
    testCases: [
      { input: [[1, 2, 2, 1], [2, 2]], expected: [2] }
    ],
    explanation: 'Use HashSet to find common elements.'
  },
  {
    id: 36,
    phase: 'Arrays',
    title: 'Union of Arrays',
    type: 'CODING',
    desc: 'Find union of two arrays (unique elements)',
    syntax: 'public static int[] union(int[] arr1, int[] arr2) {\n  // Write your code here\n  return new int[0];\n}',
    params: 'arr1, arr2',
    testCases: [
      { input: [[1, 2, 3], [2, 3, 4]], expected: [1, 2, 3, 4] }
    ],
    explanation: 'Use HashSet to collect all unique elements from both arrays.'
  },
  {
    id: 37,
    phase: 'Arrays',
    title: 'Majority Element',
    type: 'CODING',
    desc: 'Find element appearing more than n/2 times (Boyer-Moore)',
    syntax: 'public static int majorityElement(int[] arr) {\n  // Write your code here\n  return 0;\n}',
    params: 'arr',
    testCases: [
      { input: [[3, 2, 3]], expected: 3 },
      { input: [[2, 2, 1, 1, 1, 2, 2]], expected: 2 }
    ],
    explanation: 'Boyer-Moore Voting Algorithm: candidate and count approach.'
  },
  {
    id: 38,
    phase: 'Arrays',
    title: 'Rotate Array by K',
    type: 'CODING',
    desc: 'Rotate array to right by k steps',
    syntax: 'public static void rotateByK(int[] arr, int k) {\n  // Write your code here\n}',
    params: 'arr, k',
    testCases: [
      { input: [[1, 2, 3, 4, 5], 2], expected: [4, 5, 1, 2, 3] }
    ],
    explanation: 'Reverse entire array, reverse first k elements, reverse remaining elements.'
  },
  {
    id: 39,
    phase: 'Arrays',
    title: 'Subarray with Given Sum',
    type: 'CODING',
    desc: 'Find subarray with given sum (return start and end indices)',
    syntax: 'public static int[] subarraySum(int[] arr, int target) {\n  // Write your code here\n  return new int[]{-1, -1};\n}',
    params: 'arr, target',
    testCases: [
      { input: [[1, 2, 3, 7, 5], 12], expected: [1, 3] }
    ],
    explanation: 'Use sliding window technique with two pointers.'
  },
  {
    id: 40,
    phase: 'Arrays',
    title: 'Longest Consecutive Sequence',
    type: 'CODING',
    desc: 'Find length of longest consecutive elements sequence',
    syntax: 'public static int longestConsecutive(int[] arr) {\n  // Write your code here\n  return 0;\n}',
    params: 'arr',
    testCases: [
      { input: [[100, 4, 200, 1, 3, 2]], expected: 4 },
      { input: [[0, 3, 7, 2, 5, 8, 4, 6, 0, 1]], expected: 9 }
    ],
    explanation: 'Use HashSet to check for consecutive elements in O(n) time.'
  }
];

// Combine MCQs and Coding Questions
JAVA_MODULE5_QUESTIONS.push(...mcqs, ...codingQuestions);

export const JAVA_MODULE5_PHASES = [
  { name: 'Arrays', start: 0, end: 39, label: 'Module 5: Arrays' }
];

export const JAVA_MODULE5_THEORIES = {
  'Arrays': {
    title: 'Arrays',
    content: [
      'Array Basics: Declaration, initialization, access',
      'Array Traversal: for loop, for-each loop',
      'Searching: Linear search, Binary search',
      'Sorting: Bubble sort, Selection sort, Insertion sort',
      'Array Rotation: Left and right rotation',
      'Two Pointer Technique: For array problems',
      'Sliding Window: For subarray problems',
      'DSA Patterns: Two sum, Kadane\'s algorithm, Boyer-Moore',
      'Time Complexity: Understanding O(n), O(n²), O(log n)',
      'Space Complexity: In-place vs extra space'
    ]
  }
};
