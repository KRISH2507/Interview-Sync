import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import openai from "../config/ai.js";

/* ================= UTIL ================= */

const KNOWN_SKILLS = [
  "react",
  "node",
  "express",
  "mongodb",
  "javascript",
  "typescript",
  "python",
  "java",
  "sql",
  "mysql",
  "postgresql",
  "aws",
  "docker",
  "git",
  "rest",
  "api",
];

const FALLBACK_QUESTIONS = {
  react: {
    question: "Which React hook is used to manage component state?",
    options: ["useRef", "useEffect", "useState", "useMemo"],
    correctAnswerIndex: 2,
    difficulty: "easy",
    topic: "react",
  },
  node: {
    question: "Which Node.js module is used to create an HTTP server?",
    options: ["http", "fs", "path", "os"],
    correctAnswerIndex: 0,
    difficulty: "easy",
    topic: "node",
  },
  javascript: {
    question: "Which keyword is used to declare a constant in JavaScript?",
    options: ["var", "let", "const", "static"],
    correctAnswerIndex: 2,
    difficulty: "easy",
    topic: "javascript",
  },
  mongodb: {
    question: "Which MongoDB method inserts a document?",
    options: ["find()", "insertOne()", "update()", "delete()"],
    correctAnswerIndex: 1,
    difficulty: "easy",
    topic: "mongodb",
  },
  sql: {
    question: "Which SQL command retrieves data?",
    options: ["INSERT", "UPDATE", "DELETE", "SELECT"],
    correctAnswerIndex: 3,
    difficulty: "easy",
    topic: "sql",
  },
};

/* ================= START INTERVIEW ================= */

export const startInterview = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const resume = await Resume.findOne({ user: userId }).sort({ createdAt: -1 });
    if (!resume || !resume.rawText) {
      return res.status(400).json({
        message: "Resume text missing. Upload resume again.",
      });
    }

    const resumeLower = resume.rawText.toLowerCase();

    let detectedSkills = KNOWN_SKILLS.filter((skill) =>
      resumeLower.includes(skill)
    );

    // ✅ NEVER BLOCK INTERVIEW
    if (detectedSkills.length === 0) {
      detectedSkills = ["javascript", "node", "sql"];
    }

    let questionsFromAI = [];

    try {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `
Generate MCQ interview questions for a Computer Science candidate.

Rules:
- Focus ONLY on software development topics
- Prefer these skills: ${detectedSkills.join(", ")}
- No general knowledge or trivia
- 4 options, 1 correct answer
- Return ONLY valid JSON
            `,
          },
          {
            role: "user",
            content: resume.rawText.slice(0, 3000),
          },
        ],
      });

      const raw = aiResponse.choices[0].message.content;
      const cleaned = raw.replace(/```json|```/g, "").trim();
      questionsFromAI = JSON.parse(cleaned);
    } catch {
      questionsFromAI = [];
    }

    const validated = questionsFromAI.filter((q) =>
      detectedSkills.some(
        (s) =>
          q.topic?.toLowerCase().includes(s) ||
          q.question.toLowerCase().includes(s)
      )
    );

    let finalQuestions = validated.slice(0, 5);

    if (finalQuestions.length < 5) {
      finalQuestions = detectedSkills
        .map((s) => FALLBACK_QUESTIONS[s])
        .filter(Boolean)
        .slice(0, 5);
    }

    const questions = finalQuestions.map((q) => ({
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswerIndex,
      difficulty: q.difficulty || "easy",
      topic: q.topic,
    }));

    const interview = await Interview.create({
      user: userId,
      resume: resume._id,
      questions,
      status: "in-progress",
    });

    res.status(201).json({
      interviewId: interview._id,
      questions: questions.map((q) => ({
        question: q.question,
        options: q.options,
        difficulty: q.difficulty,
        topic: q.topic,
      })),
    });
  } catch (err) {
    console.error("Start interview error:", err);
    res.status(500).json({ message: "Failed to start interview" });
  }
};

/* ================= SUBMIT INTERVIEW ================= */

export const submitInterview = async (req, res) => {
  try {
    const { interviewId, answers } = req.body;

    const interview = await Interview.findById(interviewId);
    if (!interview) {
      return res.status(404).json({ message: "Interview not found" });
    }

    let totalScore = 0;

    interview.questions.forEach((q, index) => {
      const userAnswer = answers[index];
      q.userAnswer = userAnswer;

      if (userAnswer === q.correctAnswer) {
        q.score = 10;
        q.feedback = "Correct answer";
      } else {
        q.score = 0;
        q.feedback = "Incorrect answer";
      }

      totalScore += q.score;
    });

    interview.averageScore = Math.round(
      (totalScore / (interview.questions.length * 10)) * 100
    );

    interview.status = "completed";
    await interview.save();

    res.json({
      message: "Interview completed",
      averageScore: interview.averageScore,
      questions: interview.questions,
    });
  } catch (err) {
    console.error("Submit interview error:", err);
    res.status(500).json({ message: "Failed to submit interview" });
  }
};
