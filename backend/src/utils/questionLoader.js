import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Load all questions for a given category from /data/questions/<category>.json
 * @param {"dsa"|"mern"|"pern"} category
 * @returns {Array} array of question objects
 */
export function loadQuestions(category) {
    const filePath = join(__dirname, "..", "..", "data", "questions", `${category}.json`);
    const raw = readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
}

/**
 * Fisher-Yates shuffle — returns a new shuffled array
 */
function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

/**
 * Load and randomly sample `count` questions from a category.
 * If the file has fewer than `count` questions, all are returned.
 * @param {"dsa"|"mern"|"pern"} category
 * @param {number} count
 * @returns {Array}
 */
export function sampleQuestions(category, count) {
    const all = loadQuestions(category);
    return shuffle(all).slice(0, count);
}
