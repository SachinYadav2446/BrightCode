// JAVA MODULE 10: EXCEPTION HANDLING + FILE I/O
// Structure: 10 MCQs + 30 Coding Questions (Easy, Medium, Advanced)

export const JAVA_MODULE10_QUESTIONS = [];

// ═══════════════════════════════════════════════════════════
// 🧠 10 MCQs (Concept Building)
// ═══════════════════════════════════════════════════════════

const mcqs = [
  {
    id: 1,
    phase: 'Exception Handling & File I/O',
    title: 'Exception Definition',
    type: 'MCQ',
    question: 'Exception means?',
    options: ['Syntax error', 'Runtime error', 'Compile error', 'none'],
    answer: 1,
    explanation: 'Exception is an event that disrupts normal program flow at runtime.'
  },
  {
    id: 2,
    phase: 'Exception Handling & File I/O',
    title: 'Exception Handling Block',
    type: 'MCQ',
    question: 'Which block handles exception?',
    options: ['try', 'catch', 'throw', 'final'],
    answer: 1,
    explanation: 'catch block handles exceptions thrown in try block.'
  },
  {
    id: 3,
    phase: 'Exception Handling & File I/O',
    title: 'Finally Block',
    type: 'MCQ',
    question: 'Which block always executes?',
    options: ['try', 'catch', 'finally', 'throw'],
    answer: 2,
    explanation: 'finally block always executes whether exception occurs or not.'
  },
  {
    id: 4,
    phase: 'Exception Handling & File I/O',
    title: 'throw Keyword',
    type: 'MCQ',
    question: 'throw keyword does?',
    options: ['Handles exception', 'Throws exception', 'Catches exception', 'none'],
    answer: 1,
    explanation: 'throw keyword is used to explicitly throw an exception.'
  },
  {
    id: 5,
    phase: 'Exception Handling & File I/O',
    title: 'Checked Exceptions',
    type: 'MCQ',
    question: 'Checked exceptions are?',
    options: ['Compile-time checked', 'Runtime', 'Logical', 'none'],
    answer: 0,
    explanation: 'Checked exceptions are checked at compile-time (e.g., IOException).'
  },
  {
    id: 6,
    phase: 'Exception Handling & File I/O',
    title: 'Unchecked Exceptions',
    type: 'MCQ',
    question: 'Unchecked exceptions?',
    options: ['Compile-time', 'Runtime', 'Syntax', 'none'],
    answer: 1,
    explanation: 'Unchecked exceptions occur at runtime (e.g., NullPointerException).'
  },
  {
    id: 7,
    phase: 'Exception Handling & File I/O',
    title: 'File Class Package',
    type: 'MCQ',
    question: 'File class belongs to?',
    options: ['java.util', 'java.io', 'java.lang', 'none'],
    answer: 1,
    explanation: 'File class is in java.io package for file operations.'
  },
  {
    id: 8,
    phase: 'Exception Handling & File I/O',
    title: 'Read File Class',
    type: 'MCQ',
    question: 'Read file class?',
    options: ['FileWriter', 'FileReader', 'File', 'none'],
    answer: 1,
    explanation: 'FileReader is used to read character files.'
  },
  {
    id: 9,
    phase: 'Exception Handling & File I/O',
    title: 'Write File Class',
    type: 'MCQ',
    question: 'Write file class?',
    options: ['FileReader', 'FileWriter', 'Scanner', 'none'],
    answer: 1,
    explanation: 'FileWriter is used to write character files.'
  },
  {
    id: 10,
    phase: 'Exception Handling & File I/O',
    title: 'Not an Exception',
    type: 'MCQ',
    question: 'Which is NOT exception?',
    options: ['IOException', 'NullPointerException', 'ArithmeticException', 'System.out.println'],
    answer: 3,
    explanation: 'System.out.println is a method, not an exception.'
  }
];

// ═══════════════════════════════════════════════════════════
// 💻 30 CODING QUESTIONS (Basic → Advanced)
// ═══════════════════════════════════════════════════════════

const codingQuestions = [
  // 🔹 EASY (1-10)
  {
    id: 11,
    phase: 'Exception Handling & File I/O',
    title: 'Basic try-catch Example',
    type: 'CODING',
    desc: 'Write basic try-catch block',
    syntax: 'public static void main(String[] args) {\n  try {\n    // Code that may throw exception\n  } catch (Exception e) {\n    // Handle exception\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'try-catch handles exceptions gracefully.'
  },
  {
    id: 12,
    phase: 'Exception Handling & File I/O',
    title: 'Handle Divide by Zero',
    type: 'CODING',
    desc: 'Handle ArithmeticException for divide by zero',
    syntax: 'public static int divide(int a, int b) {\n  try {\n    return a / b;\n  } catch (ArithmeticException e) {\n    // Handle divide by zero\n    return 0;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'ArithmeticException occurs when dividing by zero.'
  },
  {
    id: 13,
    phase: 'Exception Handling & File I/O',
    title: 'Multiple Catch Blocks',
    type: 'CODING',
    desc: 'Use multiple catch blocks for different exceptions',
    syntax: 'public static void main(String[] args) {\n  try {\n    // Code\n  } catch (ArithmeticException e) {\n    // Handle arithmetic exception\n  } catch (NullPointerException e) {\n    // Handle null pointer\n  } catch (Exception e) {\n    // Handle any other exception\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Multiple catch blocks handle different exception types.'
  },
  {
    id: 14,
    phase: 'Exception Handling & File I/O',
    title: 'finally Block Example',
    type: 'CODING',
    desc: 'Demonstrate finally block usage',
    syntax: 'public static void main(String[] args) {\n  try {\n    // Code\n  } catch (Exception e) {\n    // Handle exception\n  } finally {\n    // Always executes\n    System.out.println("Finally block");\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'finally block executes regardless of exception.'
  },
  {
    id: 15,
    phase: 'Exception Handling & File I/O',
    title: 'Throw Custom Exception',
    type: 'CODING',
    desc: 'Throw custom exception using throw keyword',
    syntax: 'public static void checkAge(int age) {\n  if (age < 18) {\n    throw new IllegalArgumentException("Age must be 18+");\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'throw keyword explicitly throws an exception.'
  },
  {
    id: 16,
    phase: 'Exception Handling & File I/O',
    title: 'Read Input Using Scanner',
    type: 'CODING',
    desc: 'Read user input using Scanner',
    syntax: 'import java.util.Scanner;\n\npublic static void main(String[] args) {\n  Scanner sc = new Scanner(System.in);\n  // Read input\n  sc.close();\n}',
    params: '',
    testCases: [],
    explanation: 'Scanner reads input from various sources.'
  },
  {
    id: 17,
    phase: 'Exception Handling & File I/O',
    title: 'Create a File',
    type: 'CODING',
    desc: 'Create a new file using File class',
    syntax: 'import java.io.File;\nimport java.io.IOException;\n\npublic static void createFile(String filename) {\n  try {\n    File file = new File(filename);\n    if (file.createNewFile()) {\n      System.out.println("File created");\n    }\n  } catch (IOException e) {\n    e.printStackTrace();\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'File.createNewFile() creates a new file.'
  },
  {
    id: 18,
    phase: 'Exception Handling & File I/O',
    title: 'Check File Exists',
    type: 'CODING',
    desc: 'Check if file exists',
    syntax: 'import java.io.File;\n\npublic static boolean fileExists(String filename) {\n  File file = new File(filename);\n  return file.exists();\n}',
    params: '',
    testCases: [],
    explanation: 'File.exists() checks if file exists.'
  },
  {
    id: 19,
    phase: 'Exception Handling & File I/O',
    title: 'Write to File',
    type: 'CODING',
    desc: 'Write text to file using FileWriter',
    syntax: 'import java.io.FileWriter;\nimport java.io.IOException;\n\npublic static void writeToFile(String filename, String content) {\n  try (FileWriter writer = new FileWriter(filename)) {\n    writer.write(content);\n  } catch (IOException e) {\n    e.printStackTrace();\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'FileWriter writes character data to file.'
  },
  {
    id: 20,
    phase: 'Exception Handling & File I/O',
    title: 'Read from File',
    type: 'CODING',
    desc: 'Read text from file using FileReader',
    syntax: 'import java.io.FileReader;\nimport java.io.IOException;\n\npublic static String readFromFile(String filename) {\n  try (FileReader reader = new FileReader(filename)) {\n    // Read file content\n  } catch (IOException e) {\n    e.printStackTrace();\n  }\n  return "";\n}',
    params: '',
    testCases: [],
    explanation: 'FileReader reads character data from file.'
  },

  // 🔹 MEDIUM (11-20)
  {
    id: 21,
    phase: 'Exception Handling & File I/O',
    title: 'Handle ArrayIndexOutOfBounds',
    type: 'CODING',
    desc: 'Handle ArrayIndexOutOfBoundsException',
    syntax: 'public static int getElement(int[] arr, int index) {\n  try {\n    return arr[index];\n  } catch (ArrayIndexOutOfBoundsException e) {\n    System.out.println("Invalid index");\n    return -1;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'ArrayIndexOutOfBoundsException occurs with invalid array index.'
  },
  {
    id: 22,
    phase: 'Exception Handling & File I/O',
    title: 'Nested try-catch',
    type: 'CODING',
    desc: 'Demonstrate nested try-catch blocks',
    syntax: 'public static void main(String[] args) {\n  try {\n    // Outer try\n    try {\n      // Inner try\n    } catch (Exception e) {\n      // Inner catch\n    }\n  } catch (Exception e) {\n    // Outer catch\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Nested try-catch for handling exceptions at different levels.'
  },
  {
    id: 23,
    phase: 'Exception Handling & File I/O',
    title: 'Custom Exception Class',
    type: 'CODING',
    desc: 'Create custom exception class',
    syntax: 'class InvalidAgeException extends Exception {\n  public InvalidAgeException(String message) {\n    super(message);\n  }\n}\n\npublic static void checkAge(int age) throws InvalidAgeException {\n  if (age < 18) {\n    throw new InvalidAgeException("Age must be 18+");\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Custom exceptions extend Exception class.'
  },
  {
    id: 24,
    phase: 'Exception Handling & File I/O',
    title: 'Read File Line by Line',
    type: 'CODING',
    desc: 'Read file line by line using BufferedReader',
    syntax: 'import java.io.*;\n\npublic static void readFileLines(String filename) {\n  try (BufferedReader br = new BufferedReader(new FileReader(filename))) {\n    String line;\n    while ((line = br.readLine()) != null) {\n      System.out.println(line);\n    }\n  } catch (IOException e) {\n    e.printStackTrace();\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'BufferedReader efficiently reads file line by line.'
  },
  {
    id: 25,
    phase: 'Exception Handling & File I/O',
    title: 'Append Data to File',
    type: 'CODING',
    desc: 'Append text to existing file',
    syntax: 'import java.io.FileWriter;\nimport java.io.IOException;\n\npublic static void appendToFile(String filename, String content) {\n  try (FileWriter writer = new FileWriter(filename, true)) {\n    writer.write(content);\n  } catch (IOException e) {\n    e.printStackTrace();\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'FileWriter with append mode (true) appends to file.'
  },
  {
    id: 26,
    phase: 'Exception Handling & File I/O',
    title: 'Count Words in File',
    type: 'CODING',
    desc: 'Count number of words in file',
    syntax: 'import java.io.*;\n\npublic static int countWords(String filename) {\n  int count = 0;\n  try (BufferedReader br = new BufferedReader(new FileReader(filename))) {\n    String line;\n    while ((line = br.readLine()) != null) {\n      String[] words = line.split("\\\\s+");\n      count += words.length;\n    }\n  } catch (IOException e) {\n    e.printStackTrace();\n  }\n  return count;\n}',
    params: '',
    testCases: [],
    explanation: 'Split lines by whitespace and count words.'
  },
  {
    id: 27,
    phase: 'Exception Handling & File I/O',
    title: 'Copy File Content',
    type: 'CODING',
    desc: 'Copy content from one file to another',
    syntax: 'import java.io.*;\n\npublic static void copyFile(String source, String dest) {\n  try (BufferedReader br = new BufferedReader(new FileReader(source));\n       BufferedWriter bw = new BufferedWriter(new FileWriter(dest))) {\n    String line;\n    while ((line = br.readLine()) != null) {\n      bw.write(line);\n      bw.newLine();\n    }\n  } catch (IOException e) {\n    e.printStackTrace();\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Read from source and write to destination file.'
  },
  {
    id: 28,
    phase: 'Exception Handling & File I/O',
    title: 'Exception Propagation',
    type: 'CODING',
    desc: 'Demonstrate exception propagation',
    syntax: 'public static void method1() throws IOException {\n  throw new IOException("Error in method1");\n}\n\npublic static void method2() throws IOException {\n  method1(); // Exception propagates\n}\n\npublic static void main(String[] args) {\n  try {\n    method2();\n  } catch (IOException e) {\n    System.out.println("Caught: " + e.getMessage());\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Exceptions propagate up the call stack.'
  },
  {
    id: 29,
    phase: 'Exception Handling & File I/O',
    title: 'Use throws Keyword',
    type: 'CODING',
    desc: 'Use throws keyword to declare exceptions',
    syntax: 'import java.io.IOException;\n\npublic static void readFile(String filename) throws IOException {\n  // Method that may throw IOException\n  // Caller must handle it\n}',
    params: '',
    testCases: [],
    explanation: 'throws declares that method may throw exception.'
  },
  {
    id: 30,
    phase: 'Exception Handling & File I/O',
    title: 'Handle Multiple Exceptions',
    type: 'CODING',
    desc: 'Handle multiple exceptions in single catch (Java 7+)',
    syntax: 'public static void main(String[] args) {\n  try {\n    // Code\n  } catch (IOException | SQLException e) {\n    // Handle both exceptions\n    e.printStackTrace();\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Multi-catch handles multiple exception types in one block.'
  },

  // 🔹 ADVANCED (21-30)
  {
    id: 31,
    phase: 'Exception Handling & File I/O',
    title: 'Banking System with Exceptions',
    type: 'CODING',
    desc: 'Create banking system with exception handling',
    syntax: 'class InsufficientFundsException extends Exception {\n  public InsufficientFundsException(String message) {\n    super(message);\n  }\n}\n\nclass BankAccount {\n  private double balance;\n  \n  public void withdraw(double amount) throws InsufficientFundsException {\n    if (amount > balance) {\n      throw new InsufficientFundsException("Insufficient funds");\n    }\n    balance -= amount;\n  }\n  \n  public void deposit(double amount) {\n    if (amount <= 0) {\n      throw new IllegalArgumentException("Invalid amount");\n    }\n    balance += amount;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Banking system with custom exceptions for validation.'
  },
  {
    id: 32,
    phase: 'Exception Handling & File I/O',
    title: 'Login System with Validation',
    type: 'CODING',
    desc: 'Create login system with exception validation',
    syntax: 'class InvalidCredentialsException extends Exception {\n  public InvalidCredentialsException(String message) {\n    super(message);\n  }\n}\n\nclass LoginSystem {\n  public void login(String username, String password) throws InvalidCredentialsException {\n    if (username == null || username.isEmpty()) {\n      throw new InvalidCredentialsException("Username cannot be empty");\n    }\n    if (password == null || password.length() < 8) {\n      throw new InvalidCredentialsException("Password must be 8+ characters");\n    }\n    // Validate credentials\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Login validation using custom exceptions.'
  },
  {
    id: 33,
    phase: 'Exception Handling & File I/O',
    title: 'File Encryption/Decryption',
    type: 'CODING',
    desc: 'Basic file encryption and decryption',
    syntax: 'import java.io.*;\n\npublic static void encryptFile(String input, String output, int key) {\n  try (BufferedReader br = new BufferedReader(new FileReader(input));\n       BufferedWriter bw = new BufferedWriter(new FileWriter(output))) {\n    int ch;\n    while ((ch = br.read()) != -1) {\n      bw.write(ch + key); // Simple Caesar cipher\n    }\n  } catch (IOException e) {\n    e.printStackTrace();\n  }\n}\n\npublic static void decryptFile(String input, String output, int key) {\n  try (BufferedReader br = new BufferedReader(new FileReader(input));\n       BufferedWriter bw = new BufferedWriter(new FileWriter(output))) {\n    int ch;\n    while ((ch = br.read()) != -1) {\n      bw.write(ch - key);\n    }\n  } catch (IOException e) {\n    e.printStackTrace();\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Basic file encryption using Caesar cipher.'
  },
  {
    id: 34,
    phase: 'Exception Handling & File I/O',
    title: 'Log Errors to File',
    type: 'CODING',
    desc: 'Create error logging system',
    syntax: 'import java.io.*;\nimport java.time.LocalDateTime;\n\nclass Logger {\n  private static final String LOG_FILE = "error.log";\n  \n  public static void logError(Exception e) {\n    try (BufferedWriter bw = new BufferedWriter(new FileWriter(LOG_FILE, true))) {\n      bw.write("[" + LocalDateTime.now() + "] ");\n      bw.write(e.getClass().getName() + ": " + e.getMessage());\n      bw.newLine();\n    } catch (IOException ex) {\n      ex.printStackTrace();\n    }\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Log exceptions to file with timestamp.'
  },
  {
    id: 35,
    phase: 'Exception Handling & File I/O',
    title: 'Retry Mechanism',
    type: 'CODING',
    desc: 'Implement retry mechanism using exceptions',
    syntax: 'public static void executeWithRetry(int maxRetries) {\n  int attempts = 0;\n  while (attempts < maxRetries) {\n    try {\n      // Operation that may fail\n      performOperation();\n      break; // Success, exit loop\n    } catch (Exception e) {\n      attempts++;\n      if (attempts >= maxRetries) {\n        System.out.println("Max retries reached");\n        throw e;\n      }\n      System.out.println("Retry " + attempts);\n    }\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Retry failed operations with exception handling.'
  },
  {
    id: 36,
    phase: 'Exception Handling & File I/O',
    title: 'CSV File Reader',
    type: 'CODING',
    desc: 'Read and parse CSV file',
    syntax: 'import java.io.*;\nimport java.util.*;\n\npublic static List<String[]> readCSV(String filename) {\n  List<String[]> data = new ArrayList<>();\n  try (BufferedReader br = new BufferedReader(new FileReader(filename))) {\n    String line;\n    while ((line = br.readLine()) != null) {\n      String[] values = line.split(",");\n      data.add(values);\n    }\n  } catch (IOException e) {\n    e.printStackTrace();\n  }\n  return data;\n}',
    params: '',
    testCases: [],
    explanation: 'Parse CSV file into list of arrays.'
  },
  {
    id: 37,
    phase: 'Exception Handling & File I/O',
    title: 'JSON File Parser (Basic)',
    type: 'CODING',
    desc: 'Basic JSON file reading',
    syntax: 'import java.io.*;\nimport java.nio.file.*;\n\npublic static String readJSON(String filename) {\n  try {\n    return new String(Files.readAllBytes(Paths.get(filename)));\n  } catch (IOException e) {\n    e.printStackTrace();\n    return null;\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Read JSON file content as string.'
  },
  {
    id: 38,
    phase: 'Exception Handling & File I/O',
    title: 'Try-with-resources 🔥',
    type: 'CODING',
    desc: 'Demonstrate try-with-resources for automatic resource management',
    syntax: 'import java.io.*;\n\npublic static void readFile(String filename) {\n  // Try-with-resources automatically closes resources\n  try (BufferedReader br = new BufferedReader(new FileReader(filename));\n       BufferedWriter bw = new BufferedWriter(new FileWriter("output.txt"))) {\n    String line;\n    while ((line = br.readLine()) != null) {\n      bw.write(line);\n      bw.newLine();\n    }\n  } catch (IOException e) {\n    e.printStackTrace();\n  }\n  // Resources automatically closed, no need for finally\n}',
    params: '',
    testCases: [],
    explanation: 'Try-with-resources automatically closes AutoCloseable resources.'
  },
  {
    id: 39,
    phase: 'Exception Handling & File I/O',
    title: 'Multi-thread File Reading',
    type: 'CODING',
    desc: 'Read file using multiple threads (basic)',
    syntax: 'import java.io.*;\n\nclass FileReaderThread extends Thread {\n  private String filename;\n  \n  public FileReaderThread(String filename) {\n    this.filename = filename;\n  }\n  \n  @Override\n  public void run() {\n    try (BufferedReader br = new BufferedReader(new FileReader(filename))) {\n      String line;\n      while ((line = br.readLine()) != null) {\n        System.out.println(Thread.currentThread().getName() + ": " + line);\n      }\n    } catch (IOException e) {\n      e.printStackTrace();\n    }\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Basic multi-threaded file reading.'
  },
  {
    id: 40,
    phase: 'Exception Handling & File I/O',
    title: 'File-based Student System',
    type: 'CODING',
    desc: 'Mini project: Student management system with file storage',
    syntax: 'import java.io.*;\nimport java.util.*;\n\nclass Student implements Serializable {\n  String name;\n  int rollNo;\n  double marks;\n}\n\nclass StudentManager {\n  private static final String FILE = "students.dat";\n  \n  public void saveStudents(List<Student> students) {\n    try (ObjectOutputStream oos = new ObjectOutputStream(new FileOutputStream(FILE))) {\n      oos.writeObject(students);\n    } catch (IOException e) {\n      e.printStackTrace();\n    }\n  }\n  \n  public List<Student> loadStudents() {\n    try (ObjectInputStream ois = new ObjectInputStream(new FileInputStream(FILE))) {\n      return (List<Student>) ois.readObject();\n    } catch (IOException | ClassNotFoundException e) {\n      e.printStackTrace();\n      return new ArrayList<>();\n    }\n  }\n}',
    params: '',
    testCases: [],
    explanation: 'Complete student system with file persistence using serialization.'
  }
];

// Combine MCQs and Coding Questions
JAVA_MODULE10_QUESTIONS.push(...mcqs, ...codingQuestions);

export const JAVA_MODULE10_PHASES = [
  { name: 'Exception Handling & File I/O', start: 0, end: 39, label: 'Module 10: Exception Handling & File I/O' }
];

export const JAVA_MODULE10_THEORIES = {
  'Exception Handling & File I/O': {
    title: 'Exception Handling & File I/O Mastery',
    content: [
      'Exceptions: Runtime errors that disrupt program flow',
      'try-catch-finally: Exception handling blocks',
      'throw: Explicitly throw exception',
      'throws: Declare method may throw exception',
      'Checked vs Unchecked: Compile-time vs Runtime',
      'Custom Exceptions: Extend Exception class',
      'File I/O: FileReader, FileWriter, BufferedReader, BufferedWriter',
      'Try-with-resources: Automatic resource management',
      'Serialization: Object persistence',
      'Best Practices: Specific exceptions, proper cleanup, logging'
    ]
  }
};
