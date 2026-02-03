import axios from "axios";

const api = axios.create({
  baseURL: "https://interview-sync-ldw4.onrender.com/api",
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

export const getDashboard = () =>
  api.get("/dashboard");

export const getProfile = () =>
  api.get("/profile");

export const updateProfile = (data) =>
  api.put("/profile", data);

export default api;
