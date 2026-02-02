import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// =========================
// JWT INTERCEPTOR
// =========================
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// =========================
// API FUNCTIONS (JWT BASED)
// =========================

export const uploadResume = (formData) =>
  api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const startInterview = () =>
  api.post("/interview/start"); // ❌ no userId

export const submitInterview = (interviewId, answers) =>
  api.post("/interview/submit", { interviewId, answers });

export const getDashboard = () =>
  api.get("/dashboard"); // ❌ no userId

export const getProfile = () =>
  api.get("/profile");

export const updateProfile = (data) =>
  api.put("/profile", data);

export default api;
