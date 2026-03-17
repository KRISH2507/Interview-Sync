import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "https://interview-sync-ldw4.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadResume = (formData) =>
  api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const startInterview = () =>
  api.post("/interview/start");

export const submitInterview = (interviewId, answers) =>
  api.post("/interview/submit", { interviewId, answers });

export const createInterviewRoom = ({ candidateId, interviewerId }) =>
  api.post("/interview/create", { candidateId, interviewerId });

export const requestInterview = () =>
  api.post("/interview/request");

export const getMyInterviewRequests = () =>
  api.get("/interview/my-requests");

export const getInterviewRequests = () =>
  api.get("/interview/requests");

export const startInterviewFromRequest = (requestId) =>
  api.post(`/interview/requests/${requestId}/start`);

export const getInterviewRooms = () =>
  api.get("/interview/rooms");

export const getInterviewRoom = (roomId) =>
  api.get(`/interview/room/${roomId}`);

export const getInterviewRoomDraft = (roomId) =>
  api.get(`/interview/room/${roomId}/draft`);

export const saveInterviewRoomDraft = (roomId, payload) =>
  api.put(`/interview/room/${roomId}/draft`, payload);

export const submitInterviewResult = ({ candidateId, interviewerId, roomId, ratings, feedback }) =>
  api.post("/interview/result", { candidateId, interviewerId, roomId, ratings, feedback });

export const submitInterviewEvaluation = ({ candidateId, interviewerId, roomId, ratings, overallScore, feedback }) =>
  api.post("/interview/evaluate", { candidateId, interviewerId, roomId, ratings, overallScore, feedback });

export const getMyInterviewResults = () =>
  api.get("/interview/my-results");

export const getInterviewResults = (candidateId) =>
  candidateId ? api.get(`/interview/results/${candidateId}`) : api.get("/interview/results");

export const startPractice = () =>
  api.post("/practice/start");

export const submitPractice = (sessionId, answers) =>
  api.post("/practice/submit", { sessionId, answers });

export const getRandomCodeQuestion = (difficulty) =>
  api.get("/code/question", {
    params: difficulty ? { difficulty } : undefined,
  });

export const runCode = ({ code, language, input }) =>
  api.post("/code/run", { code, language, input });

export const submitCode = ({ questionId, code, language }) =>
  api.post("/code/submit", { questionId, code, language });

export const getDashboard = () =>
  api.get("/dashboard");

export const getProfile = () =>
  api.get("/profile");

export const updateProfile = (data) =>
  api.put("/profile", data);

export const sendRegistrationOtp = (payload) =>
  api.post("/auth/send-otp", payload);

export const verifyRegistrationOtp = ({ email, otp }) =>
  api.post("/auth/register", { email, otp });

export const logoutUser = () =>
  api.post("/auth/logout");

export default api;
