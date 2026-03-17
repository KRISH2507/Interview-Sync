import express from "express";
import {
  startInterview,
  submitInterview,
  createInterviewRoom,
  getInterviewRoom,
  getInterviewRoomDraft,
  listInterviewRooms,
  requestInterview,
  saveInterviewRoomDraft,
  getMyInterviewRequests,
  listInterviewRequests,
  startInterviewFromRequest,
  submitInterviewResult,
  submitInterviewEvaluation,
  getInterviewResultsForCandidate,
  getMyInterviewResults,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", protect, startInterview);
router.post("/submit", protect, submitInterview);
router.post("/create", protect, createInterviewRoom);
router.post("/request", protect, requestInterview);
router.get("/rooms", protect, listInterviewRooms);
router.get("/room/:roomId", protect, getInterviewRoom);
router.get("/room/:roomId/draft", protect, getInterviewRoomDraft);
router.put("/room/:roomId/draft", protect, saveInterviewRoomDraft);
router.get("/requests", protect, listInterviewRequests);
router.get("/my-requests", protect, getMyInterviewRequests);
router.post("/requests/:requestId/start", protect, startInterviewFromRequest);
router.post("/result", protect, submitInterviewResult);
router.post("/evaluate", protect, submitInterviewEvaluation);
router.get("/results", protect, getInterviewResultsForCandidate);
router.get("/results/:candidateId", protect, getInterviewResultsForCandidate);
router.get("/my-results", protect, getMyInterviewResults);

export default router;
