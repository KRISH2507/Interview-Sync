import Interview from "../models/Interview.js";
import Resume from "../models/Resume.js";
import InterviewRoom from "../models/InterviewRoom.js";
import InterviewResult from "../models/InterviewResult.js";
import InterviewRequest from "../models/InterviewRequest.js";
import openai from "../services/openai.js";
import { getRedisClient } from "../config/redis.js";
import { getPublicRandomCodeQuestion } from "./codeController.js";
import { generateInterviewQuestions } from "../services/interviewAIService.js";
import { normalizeQuestions } from "../utils/questionValidator.js";
import { invalidateDashboardCache } from "../utils/cache.js";
import crypto from "crypto";

const INTERVIEW_ROOM_DRAFT_TTL_SECONDS = Number(process.env.REDIS_INTERVIEW_DRAFT_TTL || 7 * 24 * 60 * 60);

const getInterviewRoomDraftKey = (roomId) => `draft:interview-room:${roomId}`;

const isRoomMember = (room, userId) =>
  String(room?.candidateId) === String(userId) || String(room?.interviewerId) === String(userId);

const buildInitialRoomDraft = (roomId) => {
  const question = getPublicRandomCodeQuestion("medium");
  if (!question) {
    return null;
  }

  return {
    roomId,
    question,
    language: "javascript",
    code: question?.starterCode?.javascript || "",
    input: "",
    updatedAt: new Date().toISOString(),
  };
};

function generateRoomId() {
  return `room_${crypto.randomUUID().replace(/-/g, "").slice(0, 12)}`;
}

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

export const startInterview = async (req, res) => {
  try {
    const userId = req.user.id;

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

    let questions = await generateInterviewQuestions(resume.rawText);

    if (Array.isArray(questions) && questions.length >= 5) {
      console.log("✅ Using AI-generated questions");
    } else {
      console.log("⚠️ AI generation failed or returned invalid questions, using preseeded fallback");
      questions = null;
    }

    if (!questions) {
      console.log("📚 Using preseeded fallback questions");
      questions = FALLBACK_QUESTIONS
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
    }

    console.log(`Questions prepared: ${questions.length} questions`);

    const normalized = normalizeQuestions(questions);

    console.log("Questions normalized, creating interview...");

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

    await invalidateDashboardCache(interview.user);

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

export const createInterviewRoom = async (req, res) => {
  try {
    const { candidateId, interviewerId } = req.body;

    if (!candidateId || !interviewerId) {
      return res.status(400).json({ message: "candidateId and interviewerId are required" });
    }

    const roomId = generateRoomId();

    const room = await InterviewRoom.create({
      candidateId,
      interviewerId,
      roomId,
      status: "scheduled",
    });

    res.status(201).json({
      roomId: room.roomId,
      room,
    });
  } catch (err) {
    console.error("createInterviewRoom error:", err);
    res.status(500).json({ message: "Failed to create interview room", error: err.message });
  }
};

export const requestInterview = async (req, res) => {
  try {
    const candidateId = req.user.id;

    const existingRequest = await InterviewRequest.findOne({
      candidateId,
      status: { $in: ["pending", "scheduled"] },
    })
      .sort({ createdAt: -1 })
      .lean();

    if (existingRequest) {
      return res.json({
        message: "Interview request already exists",
        request: existingRequest,
      });
    }

    const request = await InterviewRequest.create({
      candidateId,
      status: "pending",
    });

    res.status(201).json({
      message: "Interview request created",
      request,
    });
  } catch (err) {
    console.error("requestInterview error:", err);
    res.status(500).json({ message: "Failed to create interview request", error: err.message });
  }
};

export const getMyInterviewRequests = async (req, res) => {
  try {
    const requests = await InterviewRequest.find({ candidateId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    res.json({ requests });
  } catch (err) {
    console.error("getMyInterviewRequests error:", err);
    res.status(500).json({ message: "Failed to fetch interview requests", error: err.message });
  }
};

export const listInterviewRequests = async (_req, res) => {
  try {
    const requests = await InterviewRequest.find({ status: { $in: ["pending", "scheduled"] } })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ requests });
  } catch (err) {
    console.error("listInterviewRequests error:", err);
    res.status(500).json({ message: "Failed to fetch interview requests", error: err.message });
  }
};

export const startInterviewFromRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const interviewerId = req.user.id;

    const request = await InterviewRequest.findById(requestId);
    if (!request) {
      return res.status(404).json({ message: "Interview request not found" });
    }

    if (request.roomId) {
      const existingRoom = await InterviewRoom.findOne({ roomId: request.roomId }).lean();
      return res.json({ request, room: existingRoom || null });
    }

    const roomId = generateRoomId();
    const room = await InterviewRoom.create({
      candidateId: request.candidateId,
      interviewerId,
      roomId,
      status: "scheduled",
    });

    request.interviewerId = interviewerId;
    request.roomId = room.roomId;
    request.status = "scheduled";
    await request.save();

    res.status(201).json({
      message: "Interview room created from request",
      request,
      room,
    });
  } catch (err) {
    console.error("startInterviewFromRequest error:", err);
    res.status(500).json({ message: "Failed to start interview from request", error: err.message });
  }
};

export const getInterviewRoomDraft = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await InterviewRoom.findOne({ roomId }).lean();

    if (!room) {
      return res.status(404).json({ message: "Interview room not found" });
    }

    if (!isRoomMember(room, req.user.id)) {
      return res.status(403).json({ message: "Not authorized to access this room draft" });
    }

    const redis = await getRedisClient();
    if (!redis) {
      const fallbackDraft = buildInitialRoomDraft(roomId);
      if (!fallbackDraft) {
        return res.status(404).json({ message: "No coding question available for this room" });
      }

      return res.json({ draft: fallbackDraft, persisted: false });
    }

    const cacheKey = getInterviewRoomDraftKey(roomId);
    const storedDraft = await redis.get(cacheKey);
    if (storedDraft) {
      return res.json({ draft: JSON.parse(storedDraft), persisted: true });
    }

    const initialDraft = buildInitialRoomDraft(roomId);
    if (!initialDraft) {
      return res.status(404).json({ message: "No coding question available for this room" });
    }

    await redis.set(cacheKey, JSON.stringify(initialDraft), { EX: INTERVIEW_ROOM_DRAFT_TTL_SECONDS });

    return res.json({ draft: initialDraft, persisted: true });
  } catch (err) {
    console.error("getInterviewRoomDraft error:", err);
    return res.status(500).json({ message: "Failed to fetch interview room draft", error: err.message });
  }
};

export const saveInterviewRoomDraft = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await InterviewRoom.findOne({ roomId }).lean();

    if (!room) {
      return res.status(404).json({ message: "Interview room not found" });
    }

    if (String(room.candidateId) !== String(req.user.id)) {
      return res.status(403).json({ message: "Only the candidate can update the room draft" });
    }

    const { question, language, code, input, updatedAt } = req.body;
    if (!question?.id) {
      return res.status(400).json({ message: "A valid question is required to save draft" });
    }

    const redis = await getRedisClient();
    if (!redis) {
      return res.status(503).json({ message: "Draft persistence is temporarily unavailable" });
    }

    const draftPayload = {
      roomId,
      question,
      language: language || "javascript",
      code: String(code || ""),
      input: String(input || ""),
      updatedAt: updatedAt || new Date().toISOString(),
    };

    await redis.set(getInterviewRoomDraftKey(roomId), JSON.stringify(draftPayload), {
      EX: INTERVIEW_ROOM_DRAFT_TTL_SECONDS,
    });

    return res.json({ message: "Draft saved", draft: draftPayload });
  } catch (err) {
    console.error("saveInterviewRoomDraft error:", err);
    return res.status(500).json({ message: "Failed to save interview room draft", error: err.message });
  }
};

export const getInterviewRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const room = await InterviewRoom.findOne({ roomId });

    if (!room) {
      return res.status(404).json({ message: "Interview room not found" });
    }

    if (room.status === "scheduled") {
      room.status = "active";
      await room.save();
    }

    res.json({ room });
  } catch (err) {
    console.error("getInterviewRoom error:", err);
    res.status(500).json({ message: "Failed to fetch interview room", error: err.message });
  }
};

export const listInterviewRooms = async (_req, res) => {
  try {
    const rooms = await InterviewRoom.find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ rooms });
  } catch (err) {
    console.error("listInterviewRooms error:", err);
    res.status(500).json({ message: "Failed to fetch interview rooms", error: err.message });
  }
};

export const submitInterviewResult = async (req, res) => {
  try {
    const { candidateId, interviewerId, roomId, ratings, overallScore, feedback } = req.body;

    if (!candidateId || !interviewerId || !roomId || !ratings) {
      return res.status(400).json({ message: "candidateId, interviewerId, roomId and ratings are required" });
    }

    const normalizedRatings = {
      technical: Number(ratings.technical ?? ratings.coding),
      behavior: Number(ratings.behavior ?? ratings.communication),
      communication: Number(ratings.communication),
      problemSolving: Number(ratings.problemSolving),
      confidence: Number(ratings.confidence),
    };

    const ratingValues = Object.values(normalizedRatings);
    const hasInvalid = ratingValues.some((value) => Number.isNaN(value) || value < 1 || value > 10);
    if (hasInvalid) {
      return res.status(400).json({ message: "Ratings must be numbers between 1 and 10" });
    }

    const average = ratingValues.reduce((sum, value) => sum + value, 0) / ratingValues.length;
    const computedOverallScore = Math.round((average / 10) * 100);

    const result = await InterviewResult.create({
      candidateId,
      interviewerId,
      roomId,
      ratings: normalizedRatings,
      overallScore: Number.isFinite(Number(overallScore)) ? Number(overallScore) : computedOverallScore,
      feedback: feedback || "",
    });

    await InterviewRoom.findOneAndUpdate({ roomId }, { status: "completed" });
    await InterviewRequest.findOneAndUpdate({ roomId }, { status: "completed", interviewerId });

    await invalidateDashboardCache(candidateId);

    res.status(201).json({
      message: "Interview evaluation saved",
      result,
    });
  } catch (err) {
    console.error("submitInterviewResult error:", err);
    res.status(500).json({ message: "Failed to submit interview result", error: err.message });
  }
};

export const submitInterviewEvaluation = async (req, res) => {
  return submitInterviewResult(req, res);
};

export const getMyInterviewResults = async (req, res) => {
  try {
    const results = await InterviewResult.find({ candidateId: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    res.json(results);
  } catch (err) {
    console.error("getMyInterviewResults error:", err);
    res.status(500).json({ error: err.message });
  }
};

export const getInterviewResultsForCandidate = async (req, res) => {
  try {
    const candidateId = req.params.candidateId || req.user.id;

    const results = await InterviewResult.find({ candidateId })
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    res.json({ results });
  } catch (err) {
    console.error("getInterviewResultsForCandidate error:", err);
    res.status(500).json({ message: "Failed to fetch interview results", error: err.message });
  }
};

export const analyzeResumeWithAI = async (resumeText) => {
  try {
    if (openai && process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'YOUR_OPENAI_API_KEY_HERE') {
      try {
        console.log("🤖 Using OpenAI for resume analysis...");
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
        
        console.log("✅ OpenAI resume analysis successful");
        return response.choices[0].message.content;
      } catch (openaiError) {
        console.log("⚠️ OpenAI failed for resume analysis:", openaiError.message);
      }
    }
    
    console.log("📚 Using fallback resume analysis");
    return generateBasicResumeAnalysis(resumeText);
  } catch (error) {
    console.error("Resume analysis error:", error);
    return generateBasicResumeAnalysis(resumeText);
  }
};

function generateBasicResumeAnalysis(resumeText) {
  const textLower = resumeText.toLowerCase();
  
  const skills = [];
  const skillKeywords = ['javascript', 'python', 'java', 'react', 'node', 'angular', 'vue', 
    'mongodb', 'sql', 'aws', 'azure', 'docker', 'kubernetes', 'git', 'api', 'rest'];
  
  skillKeywords.forEach(skill => {
    if (textLower.includes(skill)) {
      skills.push(skill.toUpperCase());
    }
  });
  
  const yearMatches = resumeText.match(/(\d+)\s*(years?|yrs?)/gi) || [];
  const totalYears = yearMatches.reduce((sum, match) => {
    const num = parseInt(match.match(/\d+/)[0]);
    return sum + num;
  }, 0);
  
  const analysis = `
**Resume Analysis**

**Skills Identified:** ${skills.length > 0 ? skills.join(', ') : 'No specific technical skills mentioned'}

**Experience Level:** ${totalYears > 0 ? `Approximately ${totalYears} years` : 'Entry to Mid level'}

**Strengths:**
- Multiple technology stack exposure
- Full-stack development capabilities
${skills.includes('AWS') || skills.includes('AZURE') ? '- Cloud platform experience' : ''}
${skills.includes('DOCKER') || skills.includes('KUBERNETES') ? '- DevOps knowledge' : ''}

**Recommendations:**
- Continue building projects to showcase practical skills
- Focus on system design and scalability concepts
- Strengthen problem-solving abilities through coding practice
`;
  
  return analysis;
}
