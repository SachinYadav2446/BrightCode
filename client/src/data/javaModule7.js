// JAVA MODULE 7: OOP CORE (Classes, Objects, Encapsulation)
// Structure: 10 MCQs + 30 Coding Questions (Easy, Medium, Advanced)

export const JAVA_MODULE7_QUESTIONS = [];

// ═══════════════════════════════════════════════════════════
// 🧠 10 MCQs (Concept Building)
// ═══════════════════════════════════════════════════════════

const mcqs = [
  {
    id: 1,
    phase: 'OOP Core',
    title: 'OOP Definition',
    type: 'MCQ',
    question: 'OOP stands for?',
    options: ['Object Oriented Programming', 'Order Oriented Programming', 'Object Order Process', 'none'],
    answer: 0,
    explanation: 'OOP stands for Object Oriented Programming - a programming paradigm based on objects.'
  },
  {
    id: 2,
    phase: 'OOP Core',
    title: 'Class Definition',
    type: 'MCQ',
    question: 'Class is?',
    options: ['Object', 'Blueprint of object', 'Method', 'Variable'],
    answer: 1,
    explanation: 'A class is a blueprint or template from which objects are created.'
  },
  {
    id: 3,
    phase: 'OOP Core',
    title: 'Object Definition',
    type: 'MCQ',
    question: 'Object is?',
    options: ['Class', 'Instance of class', 'Method', 'none'],
    answer: 1,
    explanation: 'An object is an instance of a class with actual values.'
  },
  {
    id: 4,
    phase: 'OOP Core',
    title: 'Object Creation',
    type: 'MCQ',
    question: 'Which keyword creates object?',
    options: ['create', 'new', 'object', 'make'],
    answer: 1,
    explanation: 'The new keyword is used to create objects in Java.'
  },
  {
    id: 5,
    phase: 'OOP Core',
    title: 'Encapsulation',
    type: 'MCQ',
    question: 'Encapsulation means?',
    options: ['Hiding data', 'Inheritance', 'Polymorphism', 'none'],
    answer: 0,
    explanation: 'Encapsulation is wrapping data and methods together and hiding internal details.'
  },
  {
    id: 6,
    phase: 'OOP Core',
    title: 'Access Modifier',
    type: 'MCQ',
    question: 'Access modifier for private data?',
    options: ['public', 'private', 'protected', 'default'],
    answer: 1,
    explanation: 'private access modifier restricts access to within the same class only.'
  },
  {
    id: 7,
    phase: 'OOP Core',
    title: 'Constructor',
    type: 'MCQ',
    question: 'Constructor is?',
    options: ['Method', 'Special method for initialization', 'Variable', 'none'],
    answer: 1,
    explanation: 'Constructor is a special method called when an object is created to initialize it.'
  },
  {
    id: 8,
    phase: 'OOP Core',
    title: 'Default Constructor',
    type: 'MCQ',
    question: 'Default constructor?',
    options: ['No arguments constructor', 'With arguments', 'Static', 'none'],
    answer: 0,
    explanation: 'Default constructor has no parameters and is provided by Java if no constructor is defined.'
  },
  {
    id: 9,
    phase: 'OOP Core',
    title: 'this Keyword',
    type: 'MCQ',
    question: 'this keyword refers to?',
    options: ['Class', 'Current object', 'Method', 'none'],
    answer: 1,
    explanation: 'this keyword refers to the current object instance.'
  },
  {
    id: 10,
    phase: 'OOP Core',
    title: 'OOP Principles',
    type: 'MCQ',
    question: 'Which is not OOP principle?',
    options: ['Encapsulation', 'Inheritance', 'Compilation', 'Polymorphism'],
    answer: 2,
    explanation: 'The 4 OOP principles are: Encapsulation, Inheritance, Polymorphism, and Abstraction.'
  }
];

// ═══════════════════════════════════════════════════════════
// 💻 30 CODING QUESTIONS (Basic → Advanced)
// ═══════════════════════════════════════════════════════════

const codingQuestions = [
  // 🔹 EASY (1-10)
  {
    id: 11,
    phase: 'OOP Core',
    title: 'Create Class and Object',
    type: 'CODING',
    desc: 'Create a simple class and create an object of it',
    syntax: 'class Person {\n  String name;\n}\n\npublic static void main(String[] args) {\n  // Create object here\n}',
    params: '',
    testCases: [],
    explanation: 'Use new keyword to create object: Person p = new Person();'
  },
  {
    id: 12,
    phase: 'OOP Core',
    title: 'Print Object Data',
    type: 'CODING',
    desc: 'Create class with attributes and print object data',
    syntax: 'class Person {\n  String name;\n  int age;\n  \n  void display() {\n    // Print data\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Access object attributes using dot operator and print them.'
  },
  {
    id: 13,
    phase: 'OOP Core',
    title: 'Class with Attributes',
    type: 'CODING',
    desc: 'Create class with name and age attributes',
    syntax: 'class Person {\n  // Define attributes\n}',
    params: '',
    testCases: [],
    explanation: 'Declare instance variables inside the class.'
  },
  {
    id: 14,
    phase: 'OOP Core',
    title: 'Constructor Initialization',
    type: 'CODING',
    desc: 'Use constructor to initialize object values',
    syntax: 'class Person {\n  String name;\n  int age;\n  \n  // Create constructor\n}',
    params: '',
    testCases: [],
    explanation: 'Constructor has same name as class and initializes object state.'
  },
  {
    id: 15,
    phase: 'OOP Core',
    title: 'Multiple Objects',
    type: 'CODING',
    desc: 'Create multiple objects of same class',
    syntax: 'class Person {\n  String name;\n}\n\npublic static void main(String[] args) {\n  // Create multiple objects\n}',
    params: '',
    testCases: [],
    explanation: 'Each object is independent with its own copy of instance variables.'
  },
  {
    id: 16,
    phase: 'OOP Core',
    title: 'Use this Keyword',
    type: 'CODING',
    desc: 'Demonstrate use of this keyword',
    syntax: 'class Person {\n  String name;\n  \n  Person(String name) {\n    // Use this keyword\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'this.name = name; differentiates instance variable from parameter.'
  },
  {
    id: 17,
    phase: 'OOP Core',
    title: 'Method Inside Class',
    type: 'CODING',
    desc: 'Create method inside class to perform operation',
    syntax: 'class Calculator {\n  int add(int a, int b) {\n    // Write code\n    return 0;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Methods define behavior of objects.'
  },
  {
    id: 18,
    phase: 'OOP Core',
    title: 'Call Method Using Object',
    type: 'CODING',
    desc: 'Create object and call its method',
    syntax: 'class Calculator {\n  int add(int a, int b) {\n    return a + b;\n  }\n}\n\npublic static void main(String[] args) {\n  // Create object and call method\n}',
    params: '',
    testCases: [],
    explanation: 'Use object.methodName() to call methods.'
  },
  {
    id: 19,
    phase: 'OOP Core',
    title: 'Student Details Class',
    type: 'CODING',
    desc: 'Create Student class with name, rollNo, marks',
    syntax: 'class Student {\n  // Define attributes and methods\n}',
    params: '',
    testCases: [],
    explanation: 'Model real-world entity with appropriate attributes and methods.'
  },
  {
    id: 20,
    phase: 'OOP Core',
    title: 'Rectangle Class',
    type: 'CODING',
    desc: 'Create Rectangle class with area and perimeter methods',
    syntax: 'class Rectangle {\n  int length, width;\n  \n  int area() {\n    // Calculate area\n    return 0;\n  }\n  \n  int perimeter() {\n    // Calculate perimeter\n    return 0;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Area = length * width, Perimeter = 2 * (length + width)'
  },

  // 🔹 MEDIUM (11-20)
  {
    id: 21,
    phase: 'OOP Core',
    title: 'Constructor Overloading',
    type: 'CODING',
    desc: 'Create multiple constructors with different parameters',
    syntax: 'class Person {\n  String name;\n  int age;\n  \n  // Create multiple constructors\n}',
    params: '',
    testCases: [],
    explanation: 'Constructor overloading allows multiple ways to initialize objects.'
  },
  {
    id: 22,
    phase: 'OOP Core',
    title: 'Method Overloading',
    type: 'CODING',
    desc: 'Create overloaded methods with different parameters',
    syntax: 'class Calculator {\n  // Create overloaded add methods\n}',
    params: '',
    testCases: [],
    explanation: 'Method overloading: same name, different parameters.'
  },
  {
    id: 23,
    phase: 'OOP Core',
    title: 'Encapsulation with Getters/Setters',
    type: 'CODING',
    desc: 'Implement encapsulation using private variables and public methods',
    syntax: 'class Person {\n  private String name;\n  private int age;\n  \n  // Create getters and setters\n}',
    params: '',
    testCases: [],
    explanation: 'Getters return private data, setters modify it with validation.'
  },
  {
    id: 24,
    phase: 'OOP Core',
    title: 'Bank Account Class',
    type: 'CODING',
    desc: 'Create BankAccount class with deposit and withdraw methods',
    syntax: 'class BankAccount {\n  private double balance;\n  \n  void deposit(double amount) {\n    // Add to balance\n  }\n  \n  void withdraw(double amount) {\n    // Subtract from balance\n  }\n  \n  double getBalance() {\n    return balance;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Encapsulate balance and provide methods for transactions.'
  },
  {
    id: 25,
    phase: 'OOP Core',
    title: 'Employee Class with Salary',
    type: 'CODING',
    desc: 'Create Employee class with salary calculation',
    syntax: 'class Employee {\n  String name;\n  double basicSalary;\n  \n  double calculateTotalSalary() {\n    // Calculate with allowances\n    return 0;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Add HRA, DA, and other allowances to basic salary.'
  },
  {
    id: 26,
    phase: 'OOP Core',
    title: 'Static Variable',
    type: 'CODING',
    desc: 'Demonstrate static variable shared across objects',
    syntax: 'class Counter {\n  static int count = 0;\n  \n  Counter() {\n    count++;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Static variables belong to class, shared by all objects.'
  },
  {
    id: 27,
    phase: 'OOP Core',
    title: 'Static Method',
    type: 'CODING',
    desc: 'Create and use static method',
    syntax: 'class MathUtils {\n  static int square(int n) {\n    return n * n;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Static methods can be called without creating object.'
  },
  {
    id: 28,
    phase: 'OOP Core',
    title: 'Count Objects Created',
    type: 'CODING',
    desc: 'Use static variable to count number of objects created',
    syntax: 'class Person {\n  static int count = 0;\n  \n  Person() {\n    // Increment count\n  }\n  \n  static int getCount() {\n    return count;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Increment static counter in constructor.'
  },
  {
    id: 29,
    phase: 'OOP Core',
    title: 'Library System Basic',
    type: 'CODING',
    desc: 'Create Book class with title, author, ISBN',
    syntax: 'class Book {\n  private String title;\n  private String author;\n  private String isbn;\n  \n  // Constructor, getters, setters\n}',
    params: '',
    testCases: [],
    explanation: 'Model a book with appropriate attributes and encapsulation.'
  },
  {
    id: 30,
    phase: 'OOP Core',
    title: 'Student Grading System',
    type: 'CODING',
    desc: 'Create Student class with grade calculation',
    syntax: 'class Student {\n  String name;\n  int[] marks;\n  \n  double calculateAverage() {\n    // Calculate average\n    return 0;\n  }\n  \n  String getGrade() {\n    // Return grade based on average\n    return "";\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Calculate average and assign grade (A, B, C, D, F).'
  },

  // 🔹 ADVANCED (21-30)
  {
    id: 31,
    phase: 'OOP Core',
    title: 'Car System Design',
    type: 'CODING',
    desc: 'Design Car class with brand, model, year, price',
    syntax: 'class Car {\n  private String brand;\n  private String model;\n  private int year;\n  private double price;\n  \n  // Constructor, getters, setters, display method\n}',
    params: '',
    testCases: [],
    explanation: 'Complete car system with encapsulation and methods.'
  },
  {
    id: 32,
    phase: 'OOP Core',
    title: 'Inventory Management',
    type: 'CODING',
    desc: 'Create Product class for inventory management',
    syntax: 'class Product {\n  private int productId;\n  private String name;\n  private int quantity;\n  private double price;\n  \n  void addStock(int qty) {\n    // Add to quantity\n  }\n  \n  void removeStock(int qty) {\n    // Remove from quantity\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Manage product inventory with stock operations.'
  },
  {
    id: 33,
    phase: 'OOP Core',
    title: 'ATM System Using OOP',
    type: 'CODING',
    desc: 'Create ATM class with balance, withdraw, deposit',
    syntax: 'class ATM {\n  private double balance;\n  private String accountNumber;\n  \n  boolean withdraw(double amount) {\n    // Check balance and withdraw\n    return false;\n  }\n  \n  void deposit(double amount) {\n    // Add to balance\n  }\n  \n  double checkBalance() {\n    return balance;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Implement ATM operations with validation.'
  },
  {
    id: 34,
    phase: 'OOP Core',
    title: 'E-commerce Product Class',
    type: 'CODING',
    desc: 'Design Product class for e-commerce',
    syntax: 'class Product {\n  private String productId;\n  private String name;\n  private double price;\n  private String category;\n  private int rating;\n  \n  double getDiscountedPrice(double discountPercent) {\n    // Calculate discounted price\n    return 0;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'E-commerce product with pricing and discount logic.'
  },
  {
    id: 35,
    phase: 'OOP Core',
    title: 'Student Management System',
    type: 'CODING',
    desc: 'Create comprehensive Student management class',
    syntax: 'class Student {\n  private int rollNo;\n  private String name;\n  private String course;\n  private double[] marks;\n  \n  double calculatePercentage() {\n    // Calculate percentage\n    return 0;\n  }\n  \n  String getGrade() {\n    // Return grade\n    return "";\n  }\n  \n  void displayDetails() {\n    // Display all details\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Complete student management with all operations.'
  },
  {
    id: 36,
    phase: 'OOP Core',
    title: 'Immutable Class',
    type: 'CODING',
    desc: 'Create an immutable class',
    syntax: 'final class ImmutablePerson {\n  private final String name;\n  private final int age;\n  \n  // Constructor and getters only (no setters)\n}',
    params: '',
    testCases: [],
    explanation: 'Immutable class: final class, final fields, no setters, defensive copying.'
  },
  {
    id: 37,
    phase: 'OOP Core',
    title: 'Singleton Class 🔥',
    type: 'CODING',
    desc: 'Implement Singleton design pattern',
    syntax: 'class Singleton {\n  private static Singleton instance;\n  \n  private Singleton() {\n    // Private constructor\n  }\n  \n  public static Singleton getInstance() {\n    // Return single instance\n    return null;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Singleton ensures only one instance exists. Private constructor, static getInstance().'
  },
  {
    id: 38,
    phase: 'OOP Core',
    title: 'Complex Numbers Class',
    type: 'CODING',
    desc: 'Create Complex class with add and multiply operations',
    syntax: 'class Complex {\n  private double real;\n  private double imaginary;\n  \n  Complex add(Complex other) {\n    // Add two complex numbers\n    return null;\n  }\n  \n  Complex multiply(Complex other) {\n    // Multiply two complex numbers\n    return null;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Complex number operations: (a+bi) + (c+di) = (a+c) + (b+d)i'
  },
  {
    id: 39,
    phase: 'OOP Core',
    title: 'Class with Validation Rules',
    type: 'CODING',
    desc: 'Create class with input validation in setters',
    syntax: 'class Person {\n  private String email;\n  private int age;\n  \n  void setEmail(String email) {\n    // Validate email format\n  }\n  \n  void setAge(int age) {\n    // Validate age range\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Add validation logic in setters to ensure data integrity.'
  },
  {
    id: 40,
    phase: 'OOP Core',
    title: 'School Management System',
    type: 'CODING',
    desc: 'Mini project: Create School class managing students and teachers',
    syntax: 'class School {\n  private String name;\n  private List<Student> students;\n  private List<Teacher> teachers;\n  \n  void addStudent(Student s) {\n    // Add student\n  }\n  \n  void addTeacher(Teacher t) {\n    // Add teacher\n  }\n  \n  void displayAll() {\n    // Display all data\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Comprehensive system managing multiple entities.'
  }
];

// Combine MCQs and Coding Questions
JAVA_MODULE7_QUESTIONS.push(...mcqs, ...codingQuestions);

export const JAVA_MODULE7_PHASES = [
  { name: 'OOP Core', start: 0, end: 39, label: 'Module 7: OOP Core' }
];

export const JAVA_MODULE7_THEORIES = {
  'OOP Core': {
    title: 'OOP Core Concepts',
    content: [
      'Class & Object: Blueprint and instance',
      'Constructor: Special method for initialization',
      'this keyword: Reference to current object',
      'Encapsulation: Data hiding using private and getters/setters',
      'Access Modifiers: public, private, protected, default',
      'Static: Class-level variables and methods',
      'Method Overloading: Same name, different parameters',
      'Constructor Overloading: Multiple constructors',
      'Design Patterns: Singleton pattern',
      'Immutability: Creating immutable classes'
    ]
  }
};
