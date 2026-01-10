import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const uploadResume = (formData) =>
  api.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const startInterview = (userId) =>
  api.post("/interview/start", { userId });

export const submitInterview = ({ interviewId, answers }) =>
  api.post("/interview/submit", { interviewId, answers });

export const getDashboard = (userId) =>
  api.get(`/dashboard/${userId}`);

export const getProfile = (userId) =>
  api.get(`/profile/${userId}`);

export const updateProfile = (userId, data) =>
  api.put(`/profile/${userId}`, data);


export default api;
