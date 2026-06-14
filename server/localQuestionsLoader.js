/**
 * Local Questions Loader
 * Loads BrightCode's 24 curated DSA questions from JSON files
 * and injects them into the questionsDB for the arena to use.
 *
 * These questions have real test cases (not Codeforces stub "visit page" cases),
 * so they take priority in the question pool.
 */

const fs = require('fs');
const path = require('path');

// Path to the JSON files (served from client/public/data/)
const DATA_DIR = path.join(__dirname, '..', 'client', 'public', 'data');

// All 24 question file names
const QUESTION_FILES = [
    'array_reverse.json',
    'min_max_in_array.json',
    'kth_smallest_full.json',
    'sort_0s_1s_2s_full.json',
    'union_of_arrays_with_duplicates_full.json',
    'rotate_array_by_one_full.json',
    'kadanes_algorithm_full.json',
    'minimize_heights_ii_full.json',
    'minimum_jumps_full.json',
    'find_duplicate_number_full.json',
    'merge_intervals_full.json',
    'next_permutation_full.json',
    'count_inversions_full.json',
    'best_time_to_buy_sell_stock_full.json',
    'two_sum_pairs_with_0_sum_full.json',
    'common_in_3_sorted_arrays_full.json',
    'alternate_positive_negative_full.json',
    'subarray_with_0_sum_full.json',
    'factorials_of_large_numbers_full.json',
    'median_of_an_array_full.json',
    'array_with_all_palindromes_full.json',
    'trapping_rain_water_full.json',
    'longest_consecutive_subsequence_full.json',
    'maximum_product_subarray_full.json',
];

/**
 * Map difficulty string to arena's format (lowercase)
 */
function normalizeDifficulty(diff) {
    if (!diff) return 'medium';
    const d = diff.toLowerCase();
    if (d === 'easy') return 'easy';
    if (d === 'hard') return 'hard';
    return 'medium';
}

/**
 * Assign points based on difficulty
 */
function getPoints(difficulty) {
    switch (difficulty) {
        case 'easy':   return 100;
        case 'medium': return 200;
        case 'hard':   return 350;
        default:       return 150;
    }
}

/**
 * Assign time limit (seconds) based on difficulty
 */
function getTimeLimit(difficulty) {
    switch (difficulty) {
        case 'easy':   return 300;   // 5 min
        case 'medium': return 480;   // 8 min
        case 'hard':   return 720;   // 12 min
        default:       return 480;
    }
}

/**
 * Convert a structured input object into a flat array of values.
 * Ordering rules:
 *   - { arr, ...rest }          → [arr, ...rest values]
 *   - { A, B, C }               → [A, B, C]  (3-array problems)
 *   - { N }  or  { n }          → [N]         (single scalar)
 *   - plain scalar (number/etc) → [value]
 */
function flattenInput(inputObj) {
    if (inputObj === null || inputObj === undefined) return [];
    if (typeof inputObj !== 'object' || Array.isArray(inputObj)) return [inputObj];

    const keys = Object.keys(inputObj);
    const result = [];

    // Standard array param first
    if ('arr' in inputObj) {
        result.push(inputObj.arr);
        for (const key of keys) {
            if (key !== 'arr') result.push(inputObj[key]);
        }
        return result;
    }

    // 3-array problems: A, B, C
    if ('A' in inputObj && 'B' in inputObj && 'C' in inputObj) {
        return [inputObj.A, inputObj.B, inputObj.C];
    }

    // Single scalar like { N: 5 } or { n: 5 }
    if (keys.length === 1) {
        return [inputObj[keys[0]]];
    }

    // Default: preserve key order
    for (const key of keys) {
        result.push(inputObj[key]);
    }
    return result;
}

/**
 * Convert expected output to a canonical string for comparison.
 * Arrays are serialised as "[1, 2, 3]" matching Java's Arrays.toString() style.
 */
function expectedToString(expected) {
    if (Array.isArray(expected)) {
        return '[' + expected.join(', ') + ']';
    }
    return String(expected);
}

/**
 * Convert test cases from JSON format to arena format.
 * Only include concrete test cases (skip generator stubs).
 */
function convertTestCases(rawTestCases) {
    if (!rawTestCases || !Array.isArray(rawTestCases)) return [];

    return rawTestCases
        .filter(tc => tc.input && !tc.generator) // skip stress-test generator stubs
        .map(tc => ({
            input: flattenInput(tc.input),
            expected: expectedToString(tc.expected)
        }));
}

/**
 * Build a description string from the JSON question data
 */
function buildDescription(q) {
    let desc = `## ${q.name}\n\n`;
    desc += `**Platform:** ${q.platform || 'GFG'}  |  **Topic:** ${q.topic || 'Array'}\n\n`;
    desc += `### Problem Statement\n\n${q.statement}\n\n`;

    if (q.constraints) {
        desc += `### Constraints\n\n`;
        for (const [key, val] of Object.entries(q.constraints)) {
            desc += `- ${val}\n`;
        }
        desc += '\n';
    }

    if (q.examples && q.examples.length > 0) {
        desc += `### Examples\n\n`;
        q.examples.forEach((ex, i) => {
            const inp = JSON.stringify(ex.input);
            const out = JSON.stringify(ex.output !== undefined ? ex.output : ex.expected);
            desc += `**Example ${i + 1}:**\n- Input: \`${inp}\`\n- Output: \`${out}\`\n\n`;
        });
    }

    return desc;
}

/**
 * Generate a safe slug ID from a name
 */
function nameToId(name) {
    return 'gfg_' + name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}

/**
 * Convert a JSON question file to the arena's internal question format
 */
function convertQuestion(raw, filename) {
    const difficulty = normalizeDifficulty(raw.difficulty);
    const testCases = convertTestCases(raw.testCases);

    if (testCases.length === 0) {
        console.warn(`[LOCAL QUESTIONS] ⚠️  ${filename} has no usable concrete test cases — skipped`);
        return null;
    }

    const id = raw.problemId
        ? `gfg_${raw.problemId}`
        : nameToId(raw.name || filename.replace('.json', ''));

    return {
        id,
        title: raw.name || filename.replace('.json', '').replace(/_/g, ' '),
        difficulty,
        category: 'arrays',
        topic: raw.topic || 'array',
        platform: raw.platform || 'GFG',
        timeLimit: getTimeLimit(difficulty),
        points: getPoints(difficulty),
        description: buildDescription(raw),
        statement: raw.statement || '',
        examples: raw.examples || [],
        constraints: raw.constraints || {},
        testCases,                         // concrete test cases only
        source: 'local_gfg',
        starterCode: generateStarterCode(raw),
    };
}

/**
 * Generate multi-language starter code based on the question's input structure
 */
function generateStarterCode(q) {
    const name = q.name || 'solution';
    const firstInput = q.testCases && q.testCases[0] && q.testCases[0].input;

    let params = 'arr';
    if (firstInput && typeof firstInput === 'object' && !Array.isArray(firstInput)) {
        const keys = Object.keys(firstInput);
        if ('A' in firstInput && 'B' in firstInput && 'C' in firstInput) {
            params = 'A, B, C';
        } else if ('arr' in firstInput && keys.length > 1) {
            params = keys.join(', ');
        } else if (!('arr' in firstInput) && keys.length === 1) {
            params = keys[0];
        } else if (!('arr' in firstInput)) {
            params = keys.join(', ');
        }
    }

    return `// ${name}
// Write your solution below

function solution(${params}) {
    // your code here
}`;
}

/**
 * Load all 24 questions synchronously at startup.
 * Returns array of converted question objects.
 */
function loadLocalQuestions() {
    const loaded = [];
    let skipped = 0;

    for (const filename of QUESTION_FILES) {
        const filepath = path.join(DATA_DIR, filename);
        try {
            if (!fs.existsSync(filepath)) {
                console.warn(`[LOCAL QUESTIONS] ⚠️  File not found: ${filename}`);
                skipped++;
                continue;
            }

            const raw = JSON.parse(fs.readFileSync(filepath, 'utf8'));
            const converted = convertQuestion(raw, filename);

            if (converted) {
                loaded.push(converted);
                console.log(`[LOCAL QUESTIONS] ✅ Loaded: ${converted.title} (${converted.difficulty}, ${converted.testCases.length} test cases)`);
            } else {
                skipped++;
            }
        } catch (err) {
            console.error(`[LOCAL QUESTIONS] ❌ Failed to load ${filename}:`, err.message);
            skipped++;
        }
    }

    console.log(`[LOCAL QUESTIONS] 📦 Loaded ${loaded.length} questions, ${skipped} skipped`);
    return loaded;
}

/**
 * Inject local questions into the questionsDB from seedQuestions.js
 * Call this once at server startup after loadFromFile().
 *
 * @param {Object} questionsDB - The questionsDB object from seedQuestions.js
 */
function injectIntoQuestionsDB(questionsDB) {
    const localQuestions = loadLocalQuestions();

    // Remove any existing local_gfg entries (avoid duplicates on hot reload)
    questionsDB.questions = questionsDB.questions.filter(q => q.source !== 'local_gfg');

    // Prepend so they appear first in the pool
    questionsDB.questions.unshift(...localQuestions);

    // Update metadata
    questionsDB.metadata.totalQuestions = questionsDB.questions.length;
    questionsDB.metadata.sources = questionsDB.metadata.sources || {};
    questionsDB.metadata.sources.local_gfg = localQuestions.length;

    console.log(`[LOCAL QUESTIONS] 🎯 Injected ${localQuestions.length} GFG questions into pool (total: ${questionsDB.questions.length})`);
    return localQuestions.length;
}

module.exports = { loadLocalQuestions, injectIntoQuestionsDB };
