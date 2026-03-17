import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import DSAQuestion from "../src/models/DSAQuestion.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, "../.env") });

const questions = [
    // ARRAYS
    {
        question: "What is the time complexity of accessing an element by index in an array?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
        correctAnswer: 2,
        topic: "arrays",
        difficulty: "easy",
    },
    {
        question: "Which algorithm finds the maximum subarray sum in O(n) time?",
        options: ["Merge Sort", "Kadane's Algorithm", "Binary Search", "Depth First Search"],
        correctAnswer: 1,
        topic: "arrays",
        difficulty: "medium",
    },
    {
        question: "Given an unsorted array, what is the best-case time complexity for finding a specific element?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: 0,
        topic: "arrays",
        difficulty: "easy",
    },
    {
        question: "Which data structure is used to implement a two-pointer technique most efficiently?",
        options: ["Hash Map", "Stack", "Sorted Array", "Linked List"],
        correctAnswer: 2,
        topic: "arrays",
        difficulty: "medium",
    },
    // STRINGS
    {
        question: "What is the time complexity of the KMP (Knuth-Morris-Pratt) string matching algorithm?",
        options: ["O(n²)", "O(n + m)", "O(n log n)", "O(m log n)"],
        correctAnswer: 1,
        topic: "strings",
        difficulty: "hard",
    },
    {
        question: "Which of the following is NOT a valid way to reverse a string?",
        options: ["Two-pointer approach", "Stack", "Recursion", "Binary search"],
        correctAnswer: 3,
        topic: "strings",
        difficulty: "easy",
    },
    {
        question: "A palindrome is a string that reads the same forwards and backwards. What is the minimum number of deletions needed to make 'abcba' a palindrome?",
        options: ["0", "1", "2", "3"],
        correctAnswer: 0,
        topic: "strings",
        difficulty: "easy",
    },
    // TREES
    {
        question: "What is the height of a complete binary tree with n nodes?",
        options: ["O(n)", "O(log n)", "O(n log n)", "O(√n)"],
        correctAnswer: 1,
        topic: "trees",
        difficulty: "medium",
    },
    {
        question: "In a Binary Search Tree, the in-order traversal gives nodes in which order?",
        options: ["Random order", "Decreasing order", "Increasing order", "Level order"],
        correctAnswer: 2,
        topic: "trees",
        difficulty: "easy",
    },
    {
        question: "Which traversal visits the root node last?",
        options: ["Pre-order", "In-order", "Level-order", "Post-order"],
        correctAnswer: 3,
        topic: "trees",
        difficulty: "easy",
    },
    {
        question: "What property must a binary tree satisfy to be a valid max-heap?",
        options: ["Left child > Parent", "Parent >= both children", "All nodes have two children", "Leaves are at depth n"],
        correctAnswer: 1,
        topic: "trees",
        difficulty: "medium",
    },
    // GRAPHS
    {
        question: "Which algorithm is used to find the shortest path in an unweighted graph?",
        options: ["DFS", "BFS", "Dijkstra's", "Bellman-Ford"],
        correctAnswer: 1,
        topic: "graphs",
        difficulty: "easy",
    },
    {
        question: "What is the time complexity of Dijkstra's shortest path algorithm using a min-heap?",
        options: ["O(V²)", "O(E log V)", "O(V + E)", "O(VE)"],
        correctAnswer: 1,
        topic: "graphs",
        difficulty: "hard",
    },
    {
        question: "Which algorithm detects negative cycles in a weighted graph?",
        options: ["Dijkstra's", "BFS", "Bellman-Ford", "Floyd-Warshall"],
        correctAnswer: 2,
        topic: "graphs",
        difficulty: "hard",
    },
    {
        question: "A directed acyclic graph (DAG) can be ordered using which algorithm?",
        options: ["BFS", "DFS", "Topological Sort", "Prim's"],
        correctAnswer: 2,
        topic: "graphs",
        difficulty: "medium",
    },
    // DYNAMIC PROGRAMMING
    {
        question: "What is the time complexity of the classic 0/1 Knapsack problem with n items and capacity W?",
        options: ["O(n)", "O(n + W)", "O(n × W)", "O(n²)"],
        correctAnswer: 2,
        topic: "dp",
        difficulty: "medium",
    },
    {
        question: "The Longest Common Subsequence (LCS) of two strings of lengths m and n has time complexity:",
        options: ["O(m + n)", "O(m × n)", "O(m log n)", "O(2^n)"],
        correctAnswer: 1,
        topic: "dp",
        difficulty: "medium",
    },
    {
        question: "Which of these is NOT a characteristic of dynamic programming?",
        options: ["Optimal substructure", "Overlapping subproblems", "Greedy choice property", "Memoization"],
        correctAnswer: 2,
        topic: "dp",
        difficulty: "medium",
    },
    {
        question: "The minimum number of coins needed to make change is an example of which DP variant?",
        options: ["Top-down with memoization", "Bottom-up tabulation", "Both are applicable", "Neither applies"],
        correctAnswer: 2,
        topic: "dp",
        difficulty: "easy",
    },
    // SORTING
    {
        question: "Which sorting algorithm has the best average-case time complexity?",
        options: ["Bubble Sort — O(n²)", "Insertion Sort — O(n²)", "Merge Sort — O(n log n)", "Selection Sort — O(n²)"],
        correctAnswer: 2,
        topic: "sorting",
        difficulty: "easy",
    },
    {
        question: "Quick Sort is worst-case O(n²). When does this worst case occur?",
        options: ["When the array is randomly shuffled", "When pivot is always median", "When the array is already sorted", "When all elements are distinct"],
        correctAnswer: 2,
        topic: "sorting",
        difficulty: "medium",
    },
    {
        question: "Which sorting algorithm is stable AND in-place?",
        options: ["Quick Sort", "Merge Sort", "Insertion Sort", "Heap Sort"],
        correctAnswer: 2,
        topic: "sorting",
        difficulty: "medium",
    },
    {
        question: "What is the best-case time complexity of Bubble Sort?",
        options: ["O(n²)", "O(n log n)", "O(n)", "O(1)"],
        correctAnswer: 2,
        topic: "sorting",
        difficulty: "easy",
    },
    // SEARCHING
    {
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(n²)", "O(log n)", "O(1)"],
        correctAnswer: 2,
        topic: "searching",
        difficulty: "easy",
    },
    {
        question: "Binary search requires that the input array is:",
        options: ["Unsorted", "Sorted", "Containing unique elements", "Of even length"],
        correctAnswer: 1,
        topic: "searching",
        difficulty: "easy",
    },
    // LINKED LISTS
    {
        question: "What is the time complexity of inserting an element at the beginning of a singly linked list?",
        options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
        correctAnswer: 2,
        topic: "linked-lists",
        difficulty: "easy",
    },
    {
        question: "How do you detect a cycle in a linked list efficiently?",
        options: ["Sort and compare adjacent nodes", "Use a hash set to track visited nodes", "Floyd's slow and fast pointer (tortoise and hare)", "Reverse the list and compare"],
        correctAnswer: 2,
        topic: "linked-lists",
        difficulty: "medium",
    },
    // STACKS & QUEUES
    {
        question: "Which data structure uses LIFO (Last In, First Out)?",
        options: ["Queue", "Priority Queue", "Stack", "Deque"],
        correctAnswer: 2,
        topic: "stacks",
        difficulty: "easy",
    },
    {
        question: "A stack can be implemented using which of the following?",
        options: ["Only arrays", "Only linked lists", "Both arrays and linked lists", "Neither arrays nor linked lists"],
        correctAnswer: 2,
        topic: "stacks",
        difficulty: "easy",
    },
    {
        question: "Which data structure is best for implementing a BFS traversal?",
        options: ["Stack", "Queue", "Priority Queue", "Array"],
        correctAnswer: 1,
        topic: "queues",
        difficulty: "easy",
    },
];

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        await DSAQuestion.deleteMany({});
        console.log("🗑️  Cleared existing DSA questions");

        const inserted = await DSAQuestion.insertMany(questions);
        console.log(`✅ Seeded ${inserted.length} DSA questions successfully`);

        await mongoose.disconnect();
        process.exit(0);
    } catch (err) {
        console.error("❌ Seeding failed:", err.message);
        process.exit(1);
    }
}

seed();
