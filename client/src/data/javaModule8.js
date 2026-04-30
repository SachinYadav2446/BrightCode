// JAVA MODULE 8: OOP ADVANCED (Inheritance, Polymorphism, Abstraction)
// Structure: 10 MCQs + 30 Coding Questions (Easy, Medium, Advanced)

export const JAVA_MODULE8_QUESTIONS = [];

// ═══════════════════════════════════════════════════════════
// 🧠 10 MCQs (Concept Building)
// ═══════════════════════════════════════════════════════════

const mcqs = [
  {
    id: 1,
    phase: 'OOP Advanced',
    title: 'Inheritance Definition',
    type: 'MCQ',
    question: 'Inheritance means?',
    options: ['Copy class', 'One class acquires properties of another', 'Create object', 'none'],
    answer: 1,
    explanation: 'Inheritance allows a class to inherit properties and methods from another class.'
  },
  {
    id: 2,
    phase: 'OOP Advanced',
    title: 'Inheritance Keyword',
    type: 'MCQ',
    question: 'Keyword for inheritance?',
    options: ['implements', 'extends', 'inherits', 'using'],
    answer: 1,
    explanation: 'The extends keyword is used to inherit from a class in Java.'
  },
  {
    id: 3,
    phase: 'OOP Advanced',
    title: 'Multiple Inheritance',
    type: 'MCQ',
    question: 'Java supports multiple inheritance?',
    options: ['Yes', 'No (via classes)', 'Always', 'none'],
    answer: 1,
    explanation: 'Java does not support multiple inheritance through classes, but supports it through interfaces.'
  },
  {
    id: 4,
    phase: 'OOP Advanced',
    title: 'Parent Class',
    type: 'MCQ',
    question: 'Parent class is called?',
    options: ['Child', 'Superclass', 'Subclass', 'Object'],
    answer: 1,
    explanation: 'The parent class is called superclass or base class.'
  },
  {
    id: 5,
    phase: 'OOP Advanced',
    title: 'Child Class',
    type: 'MCQ',
    question: 'Child class is called?',
    options: ['Superclass', 'Subclass', 'Parent', 'none'],
    answer: 1,
    explanation: 'The child class is called subclass or derived class.'
  },
  {
    id: 6,
    phase: 'OOP Advanced',
    title: 'Polymorphism Definition',
    type: 'MCQ',
    question: 'Polymorphism means?',
    options: ['One form', 'Many forms', 'No form', 'none'],
    answer: 1,
    explanation: 'Polymorphism means "many forms" - same method behaves differently based on object.'
  },
  {
    id: 7,
    phase: 'OOP Advanced',
    title: 'Method Overriding',
    type: 'MCQ',
    question: 'Method overriding happens in?',
    options: ['Same class', 'Different class (inheritance)', 'Static class', 'none'],
    answer: 1,
    explanation: 'Method overriding occurs when a subclass provides specific implementation of a method from superclass.'
  },
  {
    id: 8,
    phase: 'OOP Advanced',
    title: 'super Keyword',
    type: 'MCQ',
    question: 'super keyword refers to?',
    options: ['Child class', 'Parent class', 'Object', 'Method'],
    answer: 1,
    explanation: 'super keyword refers to the parent class and is used to access parent class members.'
  },
  {
    id: 9,
    phase: 'OOP Advanced',
    title: 'Compile-time Polymorphism',
    type: 'MCQ',
    question: 'Compile-time polymorphism?',
    options: ['Overriding', 'Overloading', 'Inheritance', 'none'],
    answer: 1,
    explanation: 'Method overloading is compile-time polymorphism (static binding).'
  },
  {
    id: 10,
    phase: 'OOP Advanced',
    title: 'Runtime Polymorphism',
    type: 'MCQ',
    question: 'Runtime polymorphism?',
    options: ['Overloading', 'Overriding', 'Encapsulation', 'none'],
    answer: 1,
    explanation: 'Method overriding is runtime polymorphism (dynamic binding).'
  }
];

// ═══════════════════════════════════════════════════════════
// 💻 30 CODING QUESTIONS (Basic → Advanced)
// ═══════════════════════════════════════════════════════════

const codingQuestions = [
  // 🔹 EASY (1-10)
  {
    id: 11,
    phase: 'OOP Advanced',
    title: 'Create Parent and Child Class',
    type: 'CODING',
    desc: 'Create a parent class and a child class that inherits from it',
    syntax: 'class Parent {\n  void display() {\n    System.out.println("Parent");\n  }\n}\n\nclass Child extends Parent {\n  // Child class\n}',
    params: '',
    testCases: [],
    explanation: 'Use extends keyword to create inheritance relationship.'
  },
  {
    id: 12,
    phase: 'OOP Advanced',
    title: 'Use extends Keyword',
    type: 'CODING',
    desc: 'Demonstrate use of extends keyword',
    syntax: 'class Animal {\n  String name;\n}\n\nclass Dog extends Animal {\n  // Dog inherits from Animal\n}',
    params: '',
    testCases: [],
    explanation: 'extends establishes IS-A relationship between classes.'
  },
  {
    id: 13,
    phase: 'OOP Advanced',
    title: 'Access Parent Class Methods',
    type: 'CODING',
    desc: 'Access parent class methods from child class',
    syntax: 'class Parent {\n  void show() {\n    System.out.println("Parent method");\n  }\n}\n\nclass Child extends Parent {\n  void display() {\n    // Call parent method\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Child class can directly call inherited methods.'
  },
  {
    id: 14,
    phase: 'OOP Advanced',
    title: 'Override a Method',
    type: 'CODING',
    desc: 'Override parent class method in child class',
    syntax: 'class Parent {\n  void show() {\n    System.out.println("Parent");\n  }\n}\n\nclass Child extends Parent {\n  @Override\n  void show() {\n    // Override implementation\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Method overriding provides specific implementation in child class.'
  },
  {
    id: 15,
    phase: 'OOP Advanced',
    title: 'Use super Keyword',
    type: 'CODING',
    desc: 'Demonstrate use of super keyword',
    syntax: 'class Parent {\n  int value = 10;\n}\n\nclass Child extends Parent {\n  int value = 20;\n  \n  void display() {\n    // Use super to access parent value\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'super keyword accesses parent class members.'
  },
  {
    id: 16,
    phase: 'OOP Advanced',
    title: 'Call Parent Constructor',
    type: 'CODING',
    desc: 'Call parent class constructor from child class',
    syntax: 'class Parent {\n  Parent(String name) {\n    System.out.println("Parent: " + name);\n  }\n}\n\nclass Child extends Parent {\n  Child(String name) {\n    // Call parent constructor\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Use super() to call parent constructor.'
  },
  {
    id: 17,
    phase: 'OOP Advanced',
    title: 'Demonstrate Method Overloading',
    type: 'CODING',
    desc: 'Show method overloading in inheritance',
    syntax: 'class Calculator {\n  int add(int a, int b) {\n    return a + b;\n  }\n  \n  // Add overloaded methods\n}',
    params: '',
    testCases: [],
    explanation: 'Method overloading: same name, different parameters.'
  },
  {
    id: 18,
    phase: 'OOP Advanced',
    title: 'Demonstrate Method Overriding',
    type: 'CODING',
    desc: 'Show method overriding with inheritance',
    syntax: 'class Animal {\n  void sound() {\n    System.out.println("Animal sound");\n  }\n}\n\nclass Dog extends Animal {\n  @Override\n  void sound() {\n    // Override with dog sound\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Method overriding: same signature, different implementation.'
  },
  {
    id: 19,
    phase: 'OOP Advanced',
    title: 'Multilevel Inheritance',
    type: 'CODING',
    desc: 'Create multilevel inheritance (A → B → C)',
    syntax: 'class A {\n  void methodA() {\n    System.out.println("A");\n  }\n}\n\nclass B extends A {\n  void methodB() {\n    System.out.println("B");\n  }\n}\n\nclass C extends B {\n  // C inherits from B which inherits from A\n}',
    params: '',
    testCases: [],
    explanation: 'Multilevel inheritance: chain of inheritance.'
  },
  {
    id: 20,
    phase: 'OOP Advanced',
    title: 'Hierarchical Inheritance',
    type: 'CODING',
    desc: 'Create hierarchical inheritance (A ← B, A ← C)',
    syntax: 'class Animal {\n  void eat() {\n    System.out.println("Eating");\n  }\n}\n\nclass Dog extends Animal {\n  // Dog inherits from Animal\n}\n\nclass Cat extends Animal {\n  // Cat also inherits from Animal\n}',
    params: '',
    testCases: [],
    explanation: 'Hierarchical inheritance: multiple children from one parent.'
  },

  // 🔹 MEDIUM (11-20)
  {
    id: 21,
    phase: 'OOP Advanced',
    title: 'Animal Class with Sound Override',
    type: 'CODING',
    desc: 'Create Animal hierarchy with sound method override',
    syntax: 'class Animal {\n  void sound() {\n    System.out.println("Animal sound");\n  }\n}\n\nclass Dog extends Animal {\n  @Override\n  void sound() {\n    System.out.println("Bark");\n  }\n}\n\nclass Cat extends Animal {\n  @Override\n  void sound() {\n    System.out.println("Meow");\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Polymorphism: same method, different behavior.'
  },
  {
    id: 22,
    phase: 'OOP Advanced',
    title: 'Shape Class with Area Polymorphism',
    type: 'CODING',
    desc: 'Create Shape hierarchy with area calculation',
    syntax: 'class Shape {\n  double area() {\n    return 0;\n  }\n}\n\nclass Circle extends Shape {\n  double radius;\n  \n  @Override\n  double area() {\n    // Calculate circle area\n    return 0;\n  }\n}\n\nclass Rectangle extends Shape {\n  double length, width;\n  \n  @Override\n  double area() {\n    // Calculate rectangle area\n    return 0;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Polymorphism in action: different shapes, different area calculations.'
  },
  {
    id: 23,
    phase: 'OOP Advanced',
    title: 'Employee Hierarchy',
    type: 'CODING',
    desc: 'Create Employee, Manager, Developer hierarchy',
    syntax: 'class Employee {\n  String name;\n  double salary;\n  \n  void work() {\n    System.out.println("Working");\n  }\n}\n\nclass Manager extends Employee {\n  @Override\n  void work() {\n    // Manager specific work\n  }\n}\n\nclass Developer extends Employee {\n  @Override\n  void work() {\n    // Developer specific work\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Model real-world hierarchy with inheritance.'
  },
  {
    id: 24,
    phase: 'OOP Advanced',
    title: 'Bank System Using Inheritance',
    type: 'CODING',
    desc: 'Create Account, SavingsAccount, CurrentAccount hierarchy',
    syntax: 'class Account {\n  protected double balance;\n  \n  void deposit(double amount) {\n    balance += amount;\n  }\n  \n  void withdraw(double amount) {\n    // Basic withdraw\n  }\n}\n\nclass SavingsAccount extends Account {\n  double interestRate;\n  \n  void addInterest() {\n    // Add interest\n  }\n}\n\nclass CurrentAccount extends Account {\n  double overdraftLimit;\n  \n  @Override\n  void withdraw(double amount) {\n    // Allow overdraft\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Banking system with specialized account types.'
  },
  {
    id: 25,
    phase: 'OOP Advanced',
    title: 'Use Protected Access Modifier',
    type: 'CODING',
    desc: 'Demonstrate protected access modifier',
    syntax: 'class Parent {\n  protected int value = 10;\n  \n  protected void display() {\n    System.out.println("Protected method");\n  }\n}\n\nclass Child extends Parent {\n  void show() {\n    // Access protected members\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'protected allows access in subclasses and same package.'
  },
  {
    id: 26,
    phase: 'OOP Advanced',
    title: 'Override toString() Method',
    type: 'CODING',
    desc: 'Override toString() method for custom string representation',
    syntax: 'class Person {\n  String name;\n  int age;\n  \n  @Override\n  public String toString() {\n    // Return custom string\n    return "";\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'toString() provides string representation of object.'
  },
  {
    id: 27,
    phase: 'OOP Advanced',
    title: 'Dynamic Method Dispatch',
    type: 'CODING',
    desc: 'Demonstrate dynamic method dispatch (runtime polymorphism)',
    syntax: 'class Animal {\n  void sound() {\n    System.out.println("Animal sound");\n  }\n}\n\nclass Dog extends Animal {\n  @Override\n  void sound() {\n    System.out.println("Bark");\n  }\n}\n\npublic static void main(String[] args) {\n  Animal a = new Dog(); // Parent reference, child object\n  a.sound(); // Calls Dog\'s sound()\n}',
    params: '',
    testCases: [],
    explanation: 'Method called is determined at runtime based on object type.'
  },
  {
    id: 28,
    phase: 'OOP Advanced',
    title: 'Use instanceof Keyword',
    type: 'CODING',
    desc: 'Use instanceof to check object type',
    syntax: 'class Animal {}\nclass Dog extends Animal {}\n\npublic static void main(String[] args) {\n  Animal a = new Dog();\n  \n  if (a instanceof Dog) {\n    System.out.println("It\'s a Dog");\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'instanceof checks if object is instance of a class.'
  },
  {
    id: 29,
    phase: 'OOP Advanced',
    title: 'Abstract Class Basic Example',
    type: 'CODING',
    desc: 'Create abstract class with abstract method',
    syntax: 'abstract class Shape {\n  abstract double area();\n  \n  void display() {\n    System.out.println("This is a shape");\n  }\n}\n\nclass Circle extends Shape {\n  double radius;\n  \n  @Override\n  double area() {\n    return Math.PI * radius * radius;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Abstract class cannot be instantiated, must be extended.'
  },
  {
    id: 30,
    phase: 'OOP Advanced',
    title: 'Interface Implementation',
    type: 'CODING',
    desc: 'Create and implement an interface',
    syntax: 'interface Drawable {\n  void draw();\n}\n\nclass Circle implements Drawable {\n  @Override\n  public void draw() {\n    System.out.println("Drawing circle");\n  }\n}\n\nclass Rectangle implements Drawable {\n  @Override\n  public void draw() {\n    System.out.println("Drawing rectangle");\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Interface defines contract, classes provide implementation.'
  },

  // 🔹 ADVANCED (21-30)
  {
    id: 31,
    phase: 'OOP Advanced',
    title: 'Payment System 🔥',
    type: 'CODING',
    desc: 'Create payment system with UPI, Card, NetBanking',
    syntax: 'abstract class Payment {\n  abstract void processPayment(double amount);\n  \n  void printReceipt() {\n    System.out.println("Payment successful");\n  }\n}\n\nclass UPI extends Payment {\n  @Override\n  void processPayment(double amount) {\n    System.out.println("UPI payment: " + amount);\n  }\n}\n\nclass Card extends Payment {\n  @Override\n  void processPayment(double amount) {\n    System.out.println("Card payment: " + amount);\n  }\n}\n\nclass NetBanking extends Payment {\n  @Override\n  void processPayment(double amount) {\n    System.out.println("NetBanking payment: " + amount);\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Real-world payment system using polymorphism.'
  },
  {
    id: 32,
    phase: 'OOP Advanced',
    title: 'Vehicle System',
    type: 'CODING',
    desc: 'Create Vehicle hierarchy (Car, Bike, Truck)',
    syntax: 'abstract class Vehicle {\n  String brand;\n  abstract void start();\n  abstract void stop();\n}\n\nclass Car extends Vehicle {\n  @Override\n  void start() {\n    System.out.println("Car starting");\n  }\n  \n  @Override\n  void stop() {\n    System.out.println("Car stopping");\n  }\n}\n\nclass Bike extends Vehicle {\n  @Override\n  void start() {\n    System.out.println("Bike starting");\n  }\n  \n  @Override\n  void stop() {\n    System.out.println("Bike stopping");\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Vehicle system demonstrating abstraction and polymorphism.'
  },
  {
    id: 33,
    phase: 'OOP Advanced',
    title: 'Online Shopping System',
    type: 'CODING',
    desc: 'Create shopping system using polymorphism',
    syntax: 'interface Product {\n  double getPrice();\n  String getName();\n}\n\nclass Electronics implements Product {\n  private String name;\n  private double price;\n  \n  @Override\n  public double getPrice() {\n    return price * 1.18; // Add GST\n  }\n  \n  @Override\n  public String getName() {\n    return name;\n  }\n}\n\nclass Clothing implements Product {\n  private String name;\n  private double price;\n  \n  @Override\n  public double getPrice() {\n    return price * 1.12; // Different GST\n  }\n  \n  @Override\n  public String getName() {\n    return name;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'E-commerce system with different product types.'
  },
  {
    id: 34,
    phase: 'OOP Advanced',
    title: 'Notification System',
    type: 'CODING',
    desc: 'Create notification system (Email, SMS, Push)',
    syntax: 'interface Notification {\n  void send(String message);\n}\n\nclass EmailNotification implements Notification {\n  @Override\n  public void send(String message) {\n    System.out.println("Email: " + message);\n  }\n}\n\nclass SMSNotification implements Notification {\n  @Override\n  public void send(String message) {\n    System.out.println("SMS: " + message);\n  }\n}\n\nclass PushNotification implements Notification {\n  @Override\n  public void send(String message) {\n    System.out.println("Push: " + message);\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Notification system using interface polymorphism.'
  },
  {
    id: 35,
    phase: 'OOP Advanced',
    title: 'Game Character System',
    type: 'CODING',
    desc: 'Create game character hierarchy with abilities',
    syntax: 'abstract class Character {\n  String name;\n  int health;\n  \n  abstract void attack();\n  abstract void defend();\n  \n  void displayStats() {\n    System.out.println(name + " - Health: " + health);\n  }\n}\n\nclass Warrior extends Character {\n  @Override\n  void attack() {\n    System.out.println("Sword attack!");\n  }\n  \n  @Override\n  void defend() {\n    System.out.println("Shield block!");\n  }\n}\n\nclass Mage extends Character {\n  @Override\n  void attack() {\n    System.out.println("Magic spell!");\n  }\n  \n  @Override\n  void defend() {\n    System.out.println("Magic barrier!");\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Game character system with different abilities.'
  },
  {
    id: 36,
    phase: 'OOP Advanced',
    title: 'Abstract + Interface Combination',
    type: 'CODING',
    desc: 'Combine abstract class and interface',
    syntax: 'interface Flyable {\n  void fly();\n}\n\nabstract class Bird {\n  abstract void eat();\n  \n  void sleep() {\n    System.out.println("Sleeping");\n  }\n}\n\nclass Eagle extends Bird implements Flyable {\n  @Override\n  void eat() {\n    System.out.println("Eating meat");\n  }\n  \n  @Override\n  public void fly() {\n    System.out.println("Flying high");\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Combining abstract class and interface for flexible design.'
  },
  {
    id: 37,
    phase: 'OOP Advanced',
    title: 'Strategy Design Pattern 🔥',
    type: 'CODING',
    desc: 'Implement Strategy design pattern',
    syntax: 'interface SortStrategy {\n  void sort(int[] array);\n}\n\nclass BubbleSort implements SortStrategy {\n  @Override\n  public void sort(int[] array) {\n    // Bubble sort implementation\n  }\n}\n\nclass QuickSort implements SortStrategy {\n  @Override\n  public void sort(int[] array) {\n    // Quick sort implementation\n  }\n}\n\nclass Sorter {\n  private SortStrategy strategy;\n  \n  void setStrategy(SortStrategy strategy) {\n    this.strategy = strategy;\n  }\n  \n  void sort(int[] array) {\n    strategy.sort(array);\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Strategy pattern: define family of algorithms, make them interchangeable.'
  },
  {
    id: 38,
    phase: 'OOP Advanced',
    title: 'Factory Pattern 🔥',
    type: 'CODING',
    desc: 'Implement Factory design pattern',
    syntax: 'interface Shape {\n  void draw();\n}\n\nclass Circle implements Shape {\n  @Override\n  public void draw() {\n    System.out.println("Drawing Circle");\n  }\n}\n\nclass Rectangle implements Shape {\n  @Override\n  public void draw() {\n    System.out.println("Drawing Rectangle");\n  }\n}\n\nclass ShapeFactory {\n  public Shape getShape(String type) {\n    if (type.equals("CIRCLE")) {\n      return new Circle();\n    } else if (type.equals("RECTANGLE")) {\n      return new Rectangle();\n    }\n    return null;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Factory pattern: create objects without specifying exact class.'
  },
  {
    id: 39,
    phase: 'OOP Advanced',
    title: 'Plugin System Using Interfaces',
    type: 'CODING',
    desc: 'Create extensible plugin system',
    syntax: 'interface Plugin {\n  void execute();\n  String getName();\n}\n\nclass LoggerPlugin implements Plugin {\n  @Override\n  public void execute() {\n    System.out.println("Logging...");\n  }\n  \n  @Override\n  public String getName() {\n    return "Logger";\n  }\n}\n\nclass PluginManager {\n  private List<Plugin> plugins = new ArrayList<>();\n  \n  void registerPlugin(Plugin plugin) {\n    plugins.add(plugin);\n  }\n  \n  void executeAll() {\n    for (Plugin p : plugins) {\n      p.execute();\n    }\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Plugin architecture using interfaces for extensibility.'
  },
  {
    id: 40,
    phase: 'OOP Advanced',
    title: 'Online Booking System',
    type: 'CODING',
    desc: 'Mini project: Create online booking system',
    syntax: 'abstract class Booking {\n  String bookingId;\n  String customerName;\n  double amount;\n  \n  abstract void confirmBooking();\n  abstract void cancelBooking();\n  \n  void printDetails() {\n    System.out.println("Booking: " + bookingId);\n  }\n}\n\nclass FlightBooking extends Booking {\n  String flightNumber;\n  \n  @Override\n  void confirmBooking() {\n    System.out.println("Flight booking confirmed");\n  }\n  \n  @Override\n  void cancelBooking() {\n    System.out.println("Flight booking cancelled");\n  }\n}\n\nclass HotelBooking extends Booking {\n  String hotelName;\n  \n  @Override\n  void confirmBooking() {\n    System.out.println("Hotel booking confirmed");\n  }\n  \n  @Override\n  void cancelBooking() {\n    System.out.println("Hotel booking cancelled");\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Complete booking system with different booking types.'
  }
];

// Combine MCQs and Coding Questions
JAVA_MODULE8_QUESTIONS.push(...mcqs, ...codingQuestions);

export const JAVA_MODULE8_PHASES = [
  { name: 'OOP Advanced', start: 0, end: 39, label: 'Module 8: OOP Advanced' }
];

export const JAVA_MODULE8_THEORIES = {
  'OOP Advanced': {
    title: 'OOP Advanced Concepts',
    content: [
      'Inheritance: Code reusability through parent-child relationship',
      'extends keyword: Inherit from class',
      'super keyword: Access parent class members',
      'Method Overriding: Runtime polymorphism',
      'Method Overloading: Compile-time polymorphism',
      'Abstract Classes: Cannot be instantiated, must be extended',
      'Interfaces: Contract for classes to implement',
      'Polymorphism: Same method, different behavior',
      'Design Patterns: Strategy, Factory patterns',
      'Dynamic Method Dispatch: Runtime method resolution'
    ]
  }
};
