import openai from "../services/openai.js";
import geminiClient from "../config/ai.js";

/**
 * Safely extract JSON array from text
 */
function extractJSONArray(text) {
  const start = text.indexOf("[");
  const end = text.lastIndexOf("]");
  if (start === -1 || end === -1) return null;

  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

/**
 * Generate resume-specific questions using simple text analysis (NO AI REQUIRED)
 */
function generateQuestionsFromResume(resumeText) {
  const textLower = resumeText.toLowerCase();
  const questions = [];
  
  // Skill-based question bank
  const skillQuestions = {
    javascript: {
      question: "What is event delegation in JavaScript?",
      options: [
        "Calling events from child to parent",
        "Handling events on parent using event bubbling",
        "Creating custom events",
        "Preventing default events"
      ],
      correctAnswerIndex: 1,
      difficulty: "medium",
      topic: "javascript"
    },
    react: {
      question: "What causes unnecessary re-renders in React?",
      options: [
        "Using props correctly",
        "Creating new object/array references in render",
        "Using React.memo",
        "Using keys in lists"
      ],
      correctAnswerIndex: 1,
      difficulty: "medium",
      topic: "react"
    },
    node: {
      question: "How would you handle high load in a Node.js API?",
      options: [
        "Increase server RAM only",
        "Use clustering, caching, and load balancing",
        "Restart the server frequently",
        "Add more console.log statements"
      ],
      correctAnswerIndex: 1,
      difficulty: "medium",
      topic: "backend"
    },
    python: {
      question: "What is the difference between list and tuple in Python?",
      options: [
        "No difference",
        "Lists are mutable, tuples are immutable",
        "Tuples are faster for all operations",
        "Lists cannot contain numbers"
      ],
      correctAnswerIndex: 1,
      difficulty: "easy",
      topic: "python"
    },
    sql: {
      question: "When should you use a database index?",
      options: [
        "On every column",
        "On frequently queried columns with high cardinality",
        "Never, they slow down queries",
        "Only on primary keys"
      ],
      correctAnswerIndex: 1,
      difficulty: "medium",
      topic: "database"
    },
    mongodb: {
      question: "What is the benefit of MongoDB's document model?",
      options: [
        "Enforces strict schema",
        "Flexible schema and embedded documents reduce joins",
        "Faster than all SQL databases",
        "Requires less storage"
      ],
      correctAnswerIndex: 1,
      difficulty: "medium",
      topic: "database"
    },
    aws: {
      question: "What is the purpose of AWS Lambda?",
      options: [
        "Store files",
        "Run serverless functions without managing servers",
        "Host databases",
        "Monitor applications"
      ],
      correctAnswerIndex: 1,
      difficulty: "medium",
      topic: "cloud"
    },
    docker: {
      question: "What problem does Docker solve?",
      options: [
        "Makes code run faster",
        "Ensures consistent environments across development and production",
        "Replaces version control",
        "Automatically fixes bugs"
      ],
      correctAnswerIndex: 1,
      difficulty: "medium",
      topic: "devops"
    },
    git: {
      question: "What is the purpose of git rebase?",
      options: [
        "Delete all commits",
        "Rewrite commit history to create a linear timeline",
        "Create a new branch",
        "Push to remote"
      ],
      correctAnswerIndex: 1,
      difficulty: "medium",
      topic: "version-control"
    },
    api: {
      question: "What is idempotency in REST APIs?",
      options: [
        "Fast API responses",
        "Same request produces same result when called multiple times",
        "API security",
        "API versioning"
      ],
      correctAnswerIndex: 1,
      difficulty: "medium",
      topic: "api"
    }
  };
  
  // Match skills from resume and add relevant questions
  for (const [skill, question] of Object.entries(skillQuestions)) {
    if (textLower.includes(skill)) {
      questions.push(question);
    }
  }
  
  // Add generic questions if not enough skill-specific questions
  const genericQuestions = [
    {
      question: "What is the CAP theorem in distributed systems?",
      options: [
        "Consistency, Availability, Partition tolerance - pick 2",
        "Code, API, Performance",
        "Create, Add, Partition",
        "Cache, API, Protocol"
      ],
      correctAnswerIndex: 0,
      difficulty: "hard",
      topic: "system-design"
    },
    {
      question: "What causes race conditions in concurrent programming?",
      options: [
        "Slow internet",
        "Multiple threads accessing shared state without synchronization",
        "Using async/await",
        "Having multiple functions"
      ],
      correctAnswerIndex: 1,
      difficulty: "medium",
      topic: "concurrency"
    },
    {
      question: "What is the difference between authentication and authorization?",
      options: [
        "They are the same",
        "Authentication verifies identity, authorization grants permissions",
        "Authentication is for APIs only",
        "Authorization is faster"
      ],
      correctAnswerIndex: 1,
      difficulty: "easy",
      topic: "security"
    }
  ];
  
  // Ensure we have at least 5 questions
  while (questions.length < 5) {
    const randomQuestion = genericQuestions[Math.floor(Math.random() * genericQuestions.length)];
    if (!questions.includes(randomQuestion)) {
      questions.push(randomQuestion);
    }
  }
  
  // Shuffle and return exactly 5 questions
  return questions
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);
}

export async function generateInterviewQuestions(resumeText) {
  try {
    // 1️⃣ Try OpenAI first if API key is available and client is initialized
    if (openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE') {
      try {
        console.log("🤖 Trying OpenAI for question generation...");
        
        const response = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: "You are an expert technical interviewer. Generate interview questions based on the candidate's resume."
            },
            {
              role: "user",
              content: `Generate exactly 5 technical interview questions based on this resume.
Return ONLY a JSON array with this exact structure:
[
  {
    "question": "string",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswerIndex": 0,
    "difficulty": "medium",
    "topic": "relevant-topic"
  }
]

Resume:
${resumeText.slice(0, 2000)}

Return ONLY the JSON array, no other text.`
            }
          ],
          temperature: 0.7
        });

        let jsonText = response.choices[0].message.content.trim();
        
        // Clean up markdown code blocks
        if (jsonText.includes('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.includes('```')) {
          jsonText = jsonText.replace(/```\n?/g, '');
        }
        
        const parsed = JSON.parse(jsonText.trim());
        
        if (Array.isArray(parsed) && parsed.length >= 5) {
          console.log("✅ OpenAI generated questions successfully");
          return parsed.slice(0, 5);
        }
      } catch (openaiError) {
        console.log("⚠️ OpenAI failed:", openaiError.message);
      }
    }

    // 2️⃣ Try Gemini AI as fallback if available
    if (geminiClient) {
      try {
        console.log("🤖 Trying Gemini AI for question generation...");
        
        const prompt = `Generate exactly 5 technical interview questions based on this resume.
Return ONLY a JSON array with this exact structure:
[
  {
    "question": "string",
    "options": ["option1", "option2", "option3", "option4"],
    "correctAnswerIndex": 0,
    "difficulty": "medium",
    "topic": "relevant-topic"
  }
]

Resume:
${resumeText.slice(0, 2000)}

Return ONLY the JSON array, no other text.`;

        const response = await geminiClient.generateContent(prompt);
        let jsonText = response.trim();
        
        // Clean up markdown code blocks
        if (jsonText.includes('```json')) {
          jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
        } else if (jsonText.includes('```')) {
          jsonText = jsonText.replace(/```\n?/g, '');
        }
        
        const parsed = JSON.parse(jsonText.trim());
        
        if (Array.isArray(parsed) && parsed.length >= 5) {
          console.log("✅ Gemini AI generated questions successfully");
          return parsed.slice(0, 5);
        }
      } catch (aiError) {
        console.log("⚠️ Gemini AI failed:", aiError.message);
      }
    }
    
    // 3️⃣ Final Fallback: Generate questions from resume content (NO AI REQUIRED)
    console.log("📚 Using intelligent fallback - generating resume-specific questions");
    return generateQuestionsFromResume(resumeText);
    
  } catch (err) {
    console.error("Question generation error:", err.message);
    // Final fallback
    return generateQuestionsFromResume(resumeText);
  }
}
