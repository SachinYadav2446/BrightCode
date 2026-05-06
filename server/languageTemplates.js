/**
 * Language-specific code templates and starter code
 */

const LANGUAGE_TEMPLATES = {
    java: {
        name: 'Java',
        extension: '.java',
        comment: '//',
        multiLineComment: { start: '/*', end: '*/' },
        
        // Template for different problem types
        templates: {
            function: `public static {returnType} {functionName}({params}) {
    // Write your solution here
    
}`,
            
            array: `public static {returnType} {functionName}(int[] arr) {
    // Write your solution here
    
}`,
            
            twoArrays: `public static {returnType} {functionName}(int[] arr1, int[] arr2) {
    // Write your solution here
    
}`,
            
            string: `public static {returnType} {functionName}(String str) {
    // Write your solution here
    
}`,
            
            matrix: `public static {returnType} {functionName}(int[][] matrix) {
    // Write your solution here
    
}`
        },
        
        examples: {
            basic: `// Example: Sum of two numbers
public static int sum(int a, int b) {
    return a + b;
}`,
            array: `// Example: Find maximum in array
public static int findMax(int[] arr) {
    int max = arr[0];
    for (int num : arr) {
        if (num > max) max = num;
    }
    return max;
}`,
            string: `// Example: Reverse a string
public static String reverse(String str) {
    return new StringBuilder(str).reverse().toString();
}`
        }
    },
    
    python: {
        name: 'Python',
        extension: '.py',
        comment: '#',
        multiLineComment: { start: '"""', end: '"""' },
        
        templates: {
            function: `def {functionName}({params}):
    # Write your solution here
    pass`,
            
            array: `def {functionName}(arr):
    # Write your solution here
    pass`,
            
            twoArrays: `def {functionName}(arr1, arr2):
    # Write your solution here
    pass`,
            
            string: `def {functionName}(s):
    # Write your solution here
    pass`,
            
            matrix: `def {functionName}(matrix):
    # Write your solution here
    pass`
        },
        
        examples: {
            basic: `# Example: Sum of two numbers
def sum(a, b):
    return a + b`,
            array: `# Example: Find maximum in array
def find_max(arr):
    return max(arr)`,
            string: `# Example: Reverse a string
def reverse(s):
    return s[::-1]`
        }
    },
    
    javascript: {
        name: 'JavaScript',
        extension: '.js',
        comment: '//',
        multiLineComment: { start: '/*', end: '*/' },
        
        templates: {
            function: `function {functionName}({params}) {
    // Write your solution here
    
}`,
            
            array: `function {functionName}(arr) {
    // Write your solution here
    
}`,
            
            twoArrays: `function {functionName}(arr1, arr2) {
    // Write your solution here
    
}`,
            
            string: `function {functionName}(str) {
    // Write your solution here
    
}`,
            
            matrix: `function {functionName}(matrix) {
    // Write your solution here
    
}`
        },
        
        examples: {
            basic: `// Example: Sum of two numbers
function sum(a, b) {
    return a + b;
}`,
            array: `// Example: Find maximum in array
function findMax(arr) {
    return Math.max(...arr);
}`,
            string: `// Example: Reverse a string
function reverse(str) {
    return str.split('').reverse().join('');
}`
        }
    },
    
    cpp: {
        name: 'C++',
        extension: '.cpp',
        comment: '//',
        multiLineComment: { start: '/*', end: '*/' },
        
        templates: {
            function: `{returnType} {functionName}({params}) {
    // Write your solution here
    
}`,
            
            array: `{returnType} {functionName}(vector<int>& arr) {
    // Write your solution here
    
}`,
            
            twoArrays: `{returnType} {functionName}(vector<int>& arr1, vector<int>& arr2) {
    // Write your solution here
    
}`,
            
            string: `{returnType} {functionName}(string str) {
    // Write your solution here
    
}`,
            
            matrix: `{returnType} {functionName}(vector<vector<int>>& matrix) {
    // Write your solution here
    
}`
        },
        
        examples: {
            basic: `// Example: Sum of two numbers
int sum(int a, int b) {
    return a + b;
}`,
            array: `// Example: Find maximum in array
int findMax(vector<int>& arr) {
    return *max_element(arr.begin(), arr.end());
}`,
            string: `// Example: Reverse a string
string reverse(string str) {
    reverse(str.begin(), str.end());
    return str;
}`
        }
    }
};

/**
 * Get starter code for a specific language and problem type
 */
function getStarterCode(language, problemType = 'function', metadata = {}) {
    const langTemplate = LANGUAGE_TEMPLATES[language];
    if (!langTemplate) {
        return `// Write your solution here in ${language}`;
    }
    
    let template = langTemplate.templates[problemType] || langTemplate.templates.function;
    
    // Replace placeholders with actual values
    if (metadata.functionName) {
        template = template.replace(/{functionName}/g, metadata.functionName);
    }
    if (metadata.returnType) {
        template = template.replace(/{returnType}/g, metadata.returnType);
    }
    if (metadata.params) {
        template = template.replace(/{params}/g, metadata.params);
    }
    
    return template;
}

/**
 * Get syntax example for a language
 */
function getSyntaxExample(language, exampleType = 'basic') {
    const langTemplate = LANGUAGE_TEMPLATES[language];
    if (!langTemplate || !langTemplate.examples) {
        return '';
    }
    
    return langTemplate.examples[exampleType] || langTemplate.examples.basic;
}

/**
 * Get all available languages
 */
function getAvailableLanguages() {
    return Object.keys(LANGUAGE_TEMPLATES).map(key => ({
        id: key,
        name: LANGUAGE_TEMPLATES[key].name,
        extension: LANGUAGE_TEMPLATES[key].extension
    }));
}

/**
 * Convert problem description to appropriate starter code
 */
function generateStarterCodeFromProblem(language, problemDescription) {
    // This is a simplified version - you can enhance it to parse problem descriptions
    // and generate more accurate starter code
    
    const metadata = {
        functionName: 'solution',
        returnType: language === 'python' ? '' : 'int',
        params: language === 'python' ? 'n' : 'int n'
    };
    
    // Detect problem type from description
    let problemType = 'function';
    if (problemDescription.toLowerCase().includes('array')) {
        problemType = 'array';
        metadata.params = language === 'python' ? 'arr' : 'int[] arr';
    } else if (problemDescription.toLowerCase().includes('string')) {
        problemType = 'string';
        metadata.params = language === 'python' ? 's' : 'String s';
    } else if (problemDescription.toLowerCase().includes('matrix')) {
        problemType = 'matrix';
    }
    
    return getStarterCode(language, problemType, metadata);
}

module.exports = {
    LANGUAGE_TEMPLATES,
    getStarterCode,
    getSyntaxExample,
    getAvailableLanguages,
    generateStarterCodeFromProblem
};
