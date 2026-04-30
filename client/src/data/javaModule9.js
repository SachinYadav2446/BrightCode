// JAVA MODULE 9: COLLECTIONS FRAMEWORK
// Structure: 10 MCQs + 30 Coding Questions (Easy, Medium, Advanced)

export const JAVA_MODULE9_QUESTIONS = [];

// ═══════════════════════════════════════════════════════════
// 🧠 10 MCQs (Concept Building)
// ═══════════════════════════════════════════════════════════

const mcqs = [
  {
    id: 1,
    phase: 'Collections Framework',
    title: 'Collections Framework Definition',
    type: 'MCQ',
    question: 'Collections Framework is?',
    options: ['Class', 'Set of classes & interfaces', 'Method', 'none'],
    answer: 1,
    explanation: 'Collections Framework is a unified architecture for representing and manipulating collections.'
  },
  {
    id: 2,
    phase: 'Collections Framework',
    title: 'Not Part of Collection',
    type: 'MCQ',
    question: 'Which is NOT part of Collection?',
    options: ['List', 'Set', 'Map', 'Array'],
    answer: 3,
    explanation: 'Array is not part of Collections Framework. Map is also not part of Collection interface but is part of Collections Framework.'
  },
  {
    id: 3,
    phase: 'Collections Framework',
    title: 'List Characteristics',
    type: 'MCQ',
    question: 'List allows?',
    options: ['Unique elements', 'Duplicate elements', 'No elements', 'Sorted only'],
    answer: 1,
    explanation: 'List allows duplicate elements and maintains insertion order.'
  },
  {
    id: 4,
    phase: 'Collections Framework',
    title: 'Set Characteristics',
    type: 'MCQ',
    question: 'Set allows?',
    options: ['Duplicates', 'Unique elements only', 'Ordered', 'none'],
    answer: 1,
    explanation: 'Set stores only unique elements, no duplicates allowed.'
  },
  {
    id: 5,
    phase: 'Collections Framework',
    title: 'Map Storage',
    type: 'MCQ',
    question: 'Map stores?',
    options: ['Single values', 'Key-value pairs', 'Only keys', 'none'],
    answer: 1,
    explanation: 'Map stores data in key-value pairs for efficient lookup.'
  },
  {
    id: 6,
    phase: 'Collections Framework',
    title: 'Dynamic Array',
    type: 'MCQ',
    question: 'Which is dynamic array?',
    options: ['Array', 'ArrayList', 'HashSet', 'Map'],
    answer: 1,
    explanation: 'ArrayList is a resizable array implementation.'
  },
  {
    id: 7,
    phase: 'Collections Framework',
    title: 'Fastest for Search',
    type: 'MCQ',
    question: 'Which is fastest for search?',
    options: ['ArrayList', 'LinkedList', 'HashSet / HashMap', 'Stack'],
    answer: 2,
    explanation: 'HashSet and HashMap provide O(1) average time complexity for search.'
  },
  {
    id: 8,
    phase: 'Collections Framework',
    title: 'LinkedList Structure',
    type: 'MCQ',
    question: 'LinkedList uses?',
    options: ['Array', 'Nodes with pointers', 'Hashing', 'none'],
    answer: 1,
    explanation: 'LinkedList uses doubly-linked nodes with pointers to next and previous elements.'
  },
  {
    id: 9,
    phase: 'Collections Framework',
    title: 'Insertion Order',
    type: 'MCQ',
    question: 'Which maintains insertion order?',
    options: ['HashSet', 'LinkedHashSet', 'TreeSet', 'none'],
    answer: 1,
    explanation: 'LinkedHashSet maintains insertion order using a linked list.'
  },
  {
    id: 10,
    phase: 'Collections Framework',
    title: 'TreeSet Storage',
    type: 'MCQ',
    question: 'TreeSet stores?',
    options: ['Random', 'Sorted elements', 'Duplicates', 'none'],
    answer: 1,
    explanation: 'TreeSet stores elements in sorted (natural or custom) order.'
  }
];

// ═══════════════════════════════════════════════════════════
// 💻 30 CODING QUESTIONS (Basic → Advanced)
// ═══════════════════════════════════════════════════════════

const codingQuestions = [
  // 🔹 EASY (1-10)
  {
    id: 11,
    phase: 'Collections Framework',
    title: 'Create ArrayList and Add Elements',
    type: 'CODING',
    desc: 'Create ArrayList and add elements to it',
    syntax: 'import java.util.ArrayList;\n\npublic static void main(String[] args) {\n  ArrayList<Integer> list = new ArrayList<>();\n  // Add elements\n}',
    params: '',
    testCases: [],
    explanation: 'Use add() method to add elements to ArrayList.'
  },
  {
    id: 12,
    phase: 'Collections Framework',
    title: 'Print ArrayList Elements',
    type: 'CODING',
    desc: 'Print all elements of ArrayList',
    syntax: 'import java.util.ArrayList;\n\npublic static void printList(ArrayList<Integer> list) {\n  // Print elements\n}',
    params: '',
    testCases: [],
    explanation: 'Use for-each loop or iterator to print elements.'
  },
  {
    id: 13,
    phase: 'Collections Framework',
    title: 'Remove Element from List',
    type: 'CODING',
    desc: 'Remove element from ArrayList',
    syntax: 'import java.util.ArrayList;\n\npublic static void removeElement(ArrayList<Integer> list, int value) {\n  // Remove element\n}',
    params: '',
    testCases: [],
    explanation: 'Use remove() method with index or object.'
  },
  {
    id: 14,
    phase: 'Collections Framework',
    title: 'Check Element Exists',
    type: 'CODING',
    desc: 'Check if element exists in ArrayList',
    syntax: 'import java.util.ArrayList;\n\npublic static boolean contains(ArrayList<Integer> list, int value) {\n  // Check if exists\n  return false;\n}',
    params: '',
    testCases: [],
    explanation: 'Use contains() method to check existence.'
  },
  {
    id: 15,
    phase: 'Collections Framework',
    title: 'Iterate List Using Loop',
    type: 'CODING',
    desc: 'Iterate ArrayList using different loop types',
    syntax: 'import java.util.ArrayList;\n\npublic static void iterateList(ArrayList<Integer> list) {\n  // Iterate using for, for-each, iterator\n}',
    params: '',
    testCases: [],
    explanation: 'Multiple ways: for loop, for-each, iterator, forEach.'
  },
  {
    id: 16,
    phase: 'Collections Framework',
    title: 'Create HashSet and Add Elements',
    type: 'CODING',
    desc: 'Create HashSet and add elements',
    syntax: 'import java.util.HashSet;\n\npublic static void main(String[] args) {\n  HashSet<String> set = new HashSet<>();\n  // Add elements\n}',
    params: '',
    testCases: [],
    explanation: 'HashSet automatically removes duplicates.'
  },
  {
    id: 17,
    phase: 'Collections Framework',
    title: 'Remove Duplicates Using Set',
    type: 'CODING',
    desc: 'Remove duplicates from array using Set',
    syntax: 'import java.util.*;\n\npublic static List<Integer> removeDuplicates(int[] arr) {\n  // Use Set to remove duplicates\n  return null;\n}',
    params: '',
    testCases: [],
    explanation: 'Convert array to Set, then back to List.'
  },
  {
    id: 18,
    phase: 'Collections Framework',
    title: 'Create HashMap and Add Key-Value',
    type: 'CODING',
    desc: 'Create HashMap and add key-value pairs',
    syntax: 'import java.util.HashMap;\n\npublic static void main(String[] args) {\n  HashMap<String, Integer> map = new HashMap<>();\n  // Add key-value pairs\n}',
    params: '',
    testCases: [],
    explanation: 'Use put() method to add entries to HashMap.'
  },
  {
    id: 19,
    phase: 'Collections Framework',
    title: 'Get Value by Key',
    type: 'CODING',
    desc: 'Get value from HashMap using key',
    syntax: 'import java.util.HashMap;\n\npublic static Integer getValue(HashMap<String, Integer> map, String key) {\n  // Get value\n  return null;\n}',
    params: '',
    testCases: [],
    explanation: 'Use get() method to retrieve value by key.'
  },
  {
    id: 20,
    phase: 'Collections Framework',
    title: 'Iterate HashMap',
    type: 'CODING',
    desc: 'Iterate through HashMap entries',
    syntax: 'import java.util.HashMap;\n\npublic static void iterateMap(HashMap<String, Integer> map) {\n  // Iterate entries\n}',
    params: '',
    testCases: [],
    explanation: 'Use entrySet(), keySet(), or values() to iterate.'
  },

  // 🔹 MEDIUM (11-20)
  {
    id: 21,
    phase: 'Collections Framework',
    title: 'Count Frequency Using HashMap',
    type: 'CODING',
    desc: 'Count frequency of elements in array using HashMap',
    syntax: 'import java.util.HashMap;\n\npublic static HashMap<Integer, Integer> countFrequency(int[] arr) {\n  HashMap<Integer, Integer> freq = new HashMap<>();\n  // Count frequency\n  return freq;\n}',
    params: '',
    testCases: [],
    explanation: 'Use HashMap to store element as key and count as value.'
  },
  {
    id: 22,
    phase: 'Collections Framework',
    title: 'Find First Non-Repeating Element',
    type: 'CODING',
    desc: 'Find first non-repeating element in array',
    syntax: 'import java.util.*;\n\npublic static int firstNonRepeating(int[] arr) {\n  // Use LinkedHashMap to maintain order\n  return -1;\n}',
    params: '',
    testCases: [],
    explanation: 'Use LinkedHashMap to maintain insertion order while counting.'
  },
  {
    id: 23,
    phase: 'Collections Framework',
    title: 'Sort ArrayList',
    type: 'CODING',
    desc: 'Sort ArrayList in ascending and descending order',
    syntax: 'import java.util.*;\n\npublic static void sortList(ArrayList<Integer> list) {\n  // Sort list\n}',
    params: '',
    testCases: [],
    explanation: 'Use Collections.sort() or list.sort().'
  },
  {
    id: 24,
    phase: 'Collections Framework',
    title: 'Reverse List',
    type: 'CODING',
    desc: 'Reverse ArrayList',
    syntax: 'import java.util.*;\n\npublic static void reverseList(ArrayList<Integer> list) {\n  // Reverse list\n}',
    params: '',
    testCases: [],
    explanation: 'Use Collections.reverse() or manual reversal.'
  },
  {
    id: 25,
    phase: 'Collections Framework',
    title: 'Merge Two Lists',
    type: 'CODING',
    desc: 'Merge two ArrayLists',
    syntax: 'import java.util.*;\n\npublic static ArrayList<Integer> mergeLists(ArrayList<Integer> list1, ArrayList<Integer> list2) {\n  // Merge lists\n  return null;\n}',
    params: '',
    testCases: [],
    explanation: 'Use addAll() method to merge lists.'
  },
  {
    id: 26,
    phase: 'Collections Framework',
    title: 'Find Intersection of Two Lists',
    type: 'CODING',
    desc: 'Find common elements in two lists',
    syntax: 'import java.util.*;\n\npublic static List<Integer> intersection(List<Integer> list1, List<Integer> list2) {\n  // Find intersection\n  return null;\n}',
    params: '',
    testCases: [],
    explanation: 'Use retainAll() or HashSet for intersection.'
  },
  {
    id: 27,
    phase: 'Collections Framework',
    title: 'Remove Duplicates from List',
    type: 'CODING',
    desc: 'Remove duplicates while maintaining order',
    syntax: 'import java.util.*;\n\npublic static List<Integer> removeDuplicates(List<Integer> list) {\n  // Remove duplicates\n  return null;\n}',
    params: '',
    testCases: [],
    explanation: 'Use LinkedHashSet to maintain order.'
  },
  {
    id: 28,
    phase: 'Collections Framework',
    title: 'Group Elements Using Map',
    type: 'CODING',
    desc: 'Group elements by some criteria using Map',
    syntax: 'import java.util.*;\n\npublic static Map<Integer, List<Integer>> groupByDigitCount(List<Integer> numbers) {\n  // Group by number of digits\n  return null;\n}',
    params: '',
    testCases: [],
    explanation: 'Use HashMap with List as value to group elements.'
  },
  {
    id: 29,
    phase: 'Collections Framework',
    title: 'Convert Array to List',
    type: 'CODING',
    desc: 'Convert array to ArrayList',
    syntax: 'import java.util.*;\n\npublic static List<Integer> arrayToList(int[] arr) {\n  // Convert array to list\n  return null;\n}',
    params: '',
    testCases: [],
    explanation: 'Use Arrays.asList() or manual conversion.'
  },
  {
    id: 30,
    phase: 'Collections Framework',
    title: 'Find Top K Frequent Elements',
    type: 'CODING',
    desc: 'Find k most frequent elements in array',
    syntax: 'import java.util.*;\n\npublic static List<Integer> topKFrequent(int[] arr, int k) {\n  // Find top k frequent\n  return null;\n}',
    params: '',
    testCases: [],
    explanation: 'Use HashMap for frequency and PriorityQueue or sorting.'
  },

  // 🔹 ADVANCED (21-30)
  {
    id: 31,
    phase: 'Collections Framework',
    title: 'LRU Cache 🔥',
    type: 'CODING',
    desc: 'Implement LRU Cache using LinkedHashMap',
    syntax: 'import java.util.LinkedHashMap;\nimport java.util.Map;\n\nclass LRUCache extends LinkedHashMap<Integer, Integer> {\n  private int capacity;\n  \n  public LRUCache(int capacity) {\n    super(capacity, 0.75f, true);\n    this.capacity = capacity;\n  }\n  \n  @Override\n  protected boolean removeEldestEntry(Map.Entry<Integer, Integer> eldest) {\n    return size() > capacity;\n  }\n  \n  public int get(int key) {\n    return super.getOrDefault(key, -1);\n  }\n  \n  public void put(int key, int value) {\n    super.put(key, value);\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'LRU Cache: Least Recently Used cache with O(1) operations.'
  },
  {
    id: 32,
    phase: 'Collections Framework',
    title: 'Implement Stack Using ArrayList',
    type: 'CODING',
    desc: 'Implement stack operations using ArrayList',
    syntax: 'import java.util.ArrayList;\n\nclass MyStack {\n  private ArrayList<Integer> list = new ArrayList<>();\n  \n  void push(int value) {\n    // Add to stack\n  }\n  \n  int pop() {\n    // Remove and return top\n    return -1;\n  }\n  \n  int peek() {\n    // Return top without removing\n    return -1;\n  }\n  \n  boolean isEmpty() {\n    return list.isEmpty();\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Stack: LIFO data structure using ArrayList.'
  },
  {
    id: 33,
    phase: 'Collections Framework',
    title: 'Implement Queue Using LinkedList',
    type: 'CODING',
    desc: 'Implement queue operations using LinkedList',
    syntax: 'import java.util.LinkedList;\n\nclass MyQueue {\n  private LinkedList<Integer> list = new LinkedList<>();\n  \n  void enqueue(int value) {\n    // Add to queue\n  }\n  \n  int dequeue() {\n    // Remove and return front\n    return -1;\n  }\n  \n  int peek() {\n    // Return front without removing\n    return -1;\n  }\n  \n  boolean isEmpty() {\n    return list.isEmpty();\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Queue: FIFO data structure using LinkedList.'
  },
  {
    id: 34,
    phase: 'Collections Framework',
    title: 'Design HashMap (Basic)',
    type: 'CODING',
    desc: 'Implement basic HashMap functionality',
    syntax: 'class MyHashMap {\n  private static final int SIZE = 100;\n  private LinkedList<Entry>[] buckets;\n  \n  static class Entry {\n    int key;\n    int value;\n    Entry(int key, int value) {\n      this.key = key;\n      this.value = value;\n    }\n  }\n  \n  public MyHashMap() {\n    buckets = new LinkedList[SIZE];\n  }\n  \n  public void put(int key, int value) {\n    // Implement put\n  }\n  \n  public int get(int key) {\n    // Implement get\n    return -1;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Basic HashMap using array of LinkedLists (chaining).'
  },
  {
    id: 35,
    phase: 'Collections Framework',
    title: 'Frequency Sort',
    type: 'CODING',
    desc: 'Sort array by frequency of elements',
    syntax: 'import java.util.*;\n\npublic static int[] frequencySort(int[] arr) {\n  // Sort by frequency (descending)\n  return null;\n}',
    params: '',
    testCases: [],
    explanation: 'Use HashMap for frequency and custom comparator for sorting.'
  },
  {
    id: 36,
    phase: 'Collections Framework',
    title: 'Sliding Window Problems',
    type: 'CODING',
    desc: 'Find longest substring without repeating characters',
    syntax: 'import java.util.*;\n\npublic static int lengthOfLongestSubstring(String s) {\n  // Use HashMap/HashSet for sliding window\n  return 0;\n}',
    params: '',
    testCases: [],
    explanation: 'Sliding window with HashMap to track characters.'
  },
  {
    id: 37,
    phase: 'Collections Framework',
    title: 'PriorityQueue (Min/Max Heap)',
    type: 'CODING',
    desc: 'Use PriorityQueue for heap operations',
    syntax: 'import java.util.PriorityQueue;\n\npublic static int findKthLargest(int[] arr, int k) {\n  PriorityQueue<Integer> minHeap = new PriorityQueue<>();\n  // Find kth largest using min heap\n  return -1;\n}',
    params: '',
    testCases: [],
    explanation: 'PriorityQueue implements min heap by default.'
  },
  {
    id: 38,
    phase: 'Collections Framework',
    title: 'Median from Data Stream',
    type: 'CODING',
    desc: 'Find median from continuous data stream',
    syntax: 'import java.util.*;\n\nclass MedianFinder {\n  PriorityQueue<Integer> maxHeap; // Lower half\n  PriorityQueue<Integer> minHeap; // Upper half\n  \n  public MedianFinder() {\n    maxHeap = new PriorityQueue<>(Collections.reverseOrder());\n    minHeap = new PriorityQueue<>();\n  }\n  \n  public void addNum(int num) {\n    // Add number\n  }\n  \n  public double findMedian() {\n    // Find median\n    return 0.0;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Use two heaps to maintain median efficiently.'
  },
  {
    id: 39,
    phase: 'Collections Framework',
    title: 'Group Anagrams',
    type: 'CODING',
    desc: 'Group anagrams together using HashMap',
    syntax: 'import java.util.*;\n\npublic static List<List<String>> groupAnagrams(String[] strs) {\n  // Group anagrams\n  return null;\n}',
    params: '',
    testCases: [],
    explanation: 'Use sorted string as key in HashMap to group anagrams.'
  },
  {
    id: 40,
    phase: 'Collections Framework',
    title: 'Contact Manager System',
    type: 'CODING',
    desc: 'Mini project: Create contact manager using Collections',
    syntax: 'import java.util.*;\n\nclass Contact {\n  String name;\n  String phone;\n  String email;\n}\n\nclass ContactManager {\n  private HashMap<String, Contact> contacts = new HashMap<>();\n  \n  void addContact(Contact contact) {\n    // Add contact\n  }\n  \n  Contact getContact(String name) {\n    // Get contact\n    return null;\n  }\n  \n  void deleteContact(String name) {\n    // Delete contact\n  }\n  \n  List<Contact> searchByName(String query) {\n    // Search contacts\n    return null;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Complete contact management system using HashMap and ArrayList.'
  }
];

// Combine MCQs and Coding Questions
JAVA_MODULE9_QUESTIONS.push(...mcqs, ...codingQuestions);

export const JAVA_MODULE9_PHASES = [
  { name: 'Collections Framework', start: 0, end: 39, label: 'Module 9: Collections Framework' }
];

export const JAVA_MODULE9_THEORIES = {
  'Collections Framework': {
    title: 'Collections Framework Mastery',
    content: [
      'List: ArrayList, LinkedList (ordered, allows duplicates)',
      'Set: HashSet, LinkedHashSet, TreeSet (unique elements)',
      'Map: HashMap, LinkedHashMap, TreeMap (key-value pairs)',
      'Queue: LinkedList, PriorityQueue (FIFO, priority-based)',
      'Stack: LIFO operations',
      'Time Complexity: ArrayList O(1) access, HashMap O(1) search',
      'Iteration: for-each, iterator, forEach',
      'Sorting: Collections.sort(), Comparator',
      'Hashing: HashMap, HashSet for O(1) operations',
      'Advanced: LRU Cache, Heap operations, Sliding window'
    ]
  }
};
