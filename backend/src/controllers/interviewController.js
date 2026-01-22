import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import openai from "../services/openai.js";
import { generateInterviewQuestions } from "../services/interviewAIService.js";
import { normalizeQuestions } from "../utils/questionValidator.js";

/* ================= FALLBACK QUESTIONS ================= */

const FALLBACK_QUESTIONS = [
  {
    question: "How would you diagnose high latency in a Node.js API?",
    options: [
      "Increase server memory",
      "Profile database queries and async calls",
      "Restart the server",
      "Rewrite the frontend",
    ],
    correctAnswerIndex: 1,
    difficulty: "medium",
    topic: "backend",
  },
  {
    question: "What causes unnecessary re-renders in React?",
    options: [
      "Using props correctly",
      "Changing state references",
      "Using memoization",
      "Using keys in lists",
    ],
    correctAnswerIndex: 1,
    difficulty: "medium",
    topic: "react",
  },
  {
    question: "When should you use database transactions?",
    options: [
      "For read-only queries",
      "For dependent write operations",
      "For caching",
      "For indexing",
    ],
    correctAnswerIndex: 1,
    difficulty: "medium",
    topic: "database",
  },
  {
    question: "Why would you use a message queue in a backend system?",
    options: [
      "To speed up UI rendering",
      "To handle async background tasks",
      "To replace REST APIs",
      "To store logs",
    ],
    correctAnswerIndex: 1,
    difficulty: "medium",
    topic: "architecture",
  },
  {
    question: "What leads to memory leaks in Node.js applications?",
    options: [
      "Async/await usage",
      "Uncleared event listeners",
      "REST APIs",
      "Promises",
    ],
    correctAnswerIndex: 1,
    difficulty: "medium",
    topic: "node",
  },
];

/* ================= START INTERVIEW ================= */

export const startInterview = async (req, res) => {
  try {
    const userId = req.user.id; // ✅ JWT-based

    console.log("Starting interview for user:", userId);

    const resume = await Resume.findOne({ user: userId }).sort({
      createdAt: -1,
    });

    if (!resume) {
      return res.status(400).json({ message: "No resume found. Please upload a resume first." });
    }

    if (!resume.rawText || resume.rawText.trim().length === 0) {
      return res.status(400).json({ message: "Resume is empty. Please upload a valid resume." });
    }

    console.log("Resume found, generating questions...");

    // 1️⃣ Try AI first
    let questions = await generateInterviewQuestions(resume.rawText);

    // 2️⃣ Validate AI output
    if (Array.isArray(questions) && questions.length >= 5) {
      console.log("✅ Using AI-generated questions");
    } else {
      console.log("⚠️ AI generation failed or returned invalid questions, using preseeded fallback");
      questions = null;
    }

    // 3️⃣ Fallback if AI fails
    if (!questions) {
      console.log("📚 Using preseeded fallback questions");
      questions = FALLBACK_QUESTIONS
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
    }

    console.log(`Questions prepared: ${questions.length} questions`);

    // 4️⃣ Normalize structure
    const normalized = normalizeQuestions(questions);

    console.log("Questions normalized, creating interview...");

    // 5️⃣ Save interview
    const interview = await Interview.create({
      user: userId,
      resume: resume._id,
      questions: normalized,
      status: "in-progress",
      totalQuestions: normalized.length,
    });

    console.log("Interview created:", interview._id);

    res.status(201).json({
      interviewId: interview._id,
      questions: normalized.map(({ correctAnswer, ...q }) => q),
    });
  } catch (err) {
    console.error("Start interview error:", err);
    res.status(500).json({ message: "Failed to start interview", error: err.message });
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

    interview.overallScore = Math.round(
      (totalScore / (interview.questions.length * 10)) * 100
    );

    interview.status = "completed";
    await interview.save();

    res.json({
      message: "Interview completed",
      overallScore: interview.overallScore,
      questions: interview.questions,
    });
  } catch (err) {
    console.error("Submit interview error:", err);
    res.status(500).json({ message: "Failed to submit interview" });
  }
};

/* ================= RESUME ANALYSIS (AI) ================= */

export const analyzeResumeWithAI = async (resumeText) => {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an expert resume reviewer.",
      },
      {
        role: "user",
        content: `Analyze this resume and extract skills, experience, and strengths:\n${resumeText}`,
      },
    ],
  });

  return response.choices[0].message.content;
};
