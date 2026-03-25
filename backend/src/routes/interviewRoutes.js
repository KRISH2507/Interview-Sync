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
  enqueueInterviewQuestionsJob,
  getInterviewQuestionsJobStatus,
} from "../controllers/interviewController.js";
import { protect } from "../middleware/authMiddleware.js";
import { aiRouteLimiter } from "../middleware/routeRateLimitProfiles.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();

router.post("/start", aiRouteLimiter, protect, asyncHandler(startInterview));
router.post("/start-async", aiRouteLimiter, protect, asyncHandler(enqueueInterviewQuestionsJob));
router.get("/jobs/:jobId", protect, asyncHandler(getInterviewQuestionsJobStatus));
router.post("/submit", protect, asyncHandler(submitInterview));
router.post("/create", protect, asyncHandler(createInterviewRoom));
router.post("/request", protect, asyncHandler(requestInterview));
router.get("/rooms", protect, asyncHandler(listInterviewRooms));
router.get("/room/:roomId", protect, asyncHandler(getInterviewRoom));
router.get("/room/:roomId/draft", protect, asyncHandler(getInterviewRoomDraft));
router.put("/room/:roomId/draft", protect, asyncHandler(saveInterviewRoomDraft));
router.get("/requests", protect, asyncHandler(listInterviewRequests));
router.get("/my-requests", protect, asyncHandler(getMyInterviewRequests));
router.post("/requests/:requestId/start", protect, asyncHandler(startInterviewFromRequest));
router.post("/result", protect, asyncHandler(submitInterviewResult));
router.post("/evaluate", protect, asyncHandler(submitInterviewEvaluation));
router.get("/results", protect, asyncHandler(getInterviewResultsForCandidate));
router.get("/results/:candidateId", protect, asyncHandler(getInterviewResultsForCandidate));
router.get("/my-results", protect, asyncHandler(getMyInterviewResults));

export default router;
