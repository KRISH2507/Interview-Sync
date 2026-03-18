import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.NEXT_PUBLIC_API_URL ||
  "https://interview-sync-ldw4.onrender.com/api";

const normalizeBaseUrl = (url) => String(url || "").replace(/\/$/, "");

export const getApiBaseUrl = () => normalizeBaseUrl(API_BASE_URL);
export const getBackendBaseUrl = () => getApiBaseUrl().replace(/\/api\/?$/, "");
export const getGoogleOAuthStartUrl = () => {
  const startUrl = new URL(`${getApiBaseUrl()}/auth/google`);
  if (typeof window !== "undefined" && window.location?.origin) {
    startUrl.searchParams.set("frontend_origin", window.location.origin);
  }
  return startUrl.toString();
};

const isValidRole = (role) => ["candidate", "recruiter"].includes(String(role || "").toLowerCase());

const isValidEmail = (email) => {
  const normalized = String(email || "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
};

const validateSendOtpPayload = (payload = {}) => {
  const name = String(payload.name || "").trim();
  const email = String(payload.email || "").trim();
  const password = String(payload.password || "");
  const role = String(payload.role || "candidate").toLowerCase();

  if (!name) {
    throw new Error("Name is required");
  }

  if (!isValidEmail(email)) {
    throw new Error("Please enter a valid email address");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  if (!isValidRole(role)) {
    throw new Error("Role must be candidate or recruiter");
  }

  return {
    name,
    email,
    password,
    role,
  };
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  withCredentials: true,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

const isAuthRefreshRoute = (url = "") => String(url).includes("/auth/refresh-token");
const isAuthLoginRoute = (url = "") => String(url).includes("/auth/login");
const isCsrfTokenRoute = (url = "") => String(url).includes("/auth/csrf-token");
const MUTATING_METHODS = new Set(["post", "put", "patch", "delete"]);

let refreshPromise = null;
let csrfTokenInMemory = "";
let csrfPromise = null;

const refreshAccessToken = async () => {
  if (!refreshPromise) {
    refreshPromise = axios
      .post(`${getApiBaseUrl()}/auth/refresh-token`, {}, { withCredentials: true })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const setCsrfToken = (token) => {
  csrfTokenInMemory = String(token || "").trim();
  return csrfTokenInMemory;
};

export const getCsrfToken = () => csrfTokenInMemory;

export const fetchCsrfToken = async ({ force = false } = {}) => {
  if (!force && csrfTokenInMemory) {
    return csrfTokenInMemory;
  }

  if (!csrfPromise) {
    csrfPromise = api
      .get("/auth/csrf-token")
      .then((res) => {
        const token =
          res?.data?.data?.csrfToken ||
          res?.data?.csrfToken ||
          "";
        return setCsrfToken(token);
      })
      .finally(() => {
        csrfPromise = null;
      });
  }

  return csrfPromise;
};

export const initializeAuthSecurity = async () => {
  try {
    await fetchCsrfToken();
  } catch {
    return;
  }
};

api.interceptors.request.use(async (config) => {
  const method = String(config?.method || "get").toLowerCase();
  const isMutating = MUTATING_METHODS.has(method);
  const isCsrfRequest = isCsrfTokenRoute(config?.url);

  if (!isMutating || isCsrfRequest) {
    return config;
  }

  if (!csrfTokenInMemory) {
    await fetchCsrfToken();
  }

  if (!config.headers) {
    config.headers = {};
  }

  if (csrfTokenInMemory) {
    config.headers["X-CSRF-Token"] = csrfTokenInMemory;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config || {};
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error?.message || "Request failed";
    const responseCode = String(error?.response?.data?.code || "");

    if (
      status === 403 &&
      responseCode === "EBADCSRFTOKEN" &&
      !originalRequest?._csrfRetry &&
      !isCsrfTokenRoute(originalRequest?.url)
    ) {
      originalRequest._csrfRetry = true;
      await fetchCsrfToken({ force: true });

      if (!originalRequest.headers) {
        originalRequest.headers = {};
      }

      if (csrfTokenInMemory) {
        originalRequest.headers["X-CSRF-Token"] = csrfTokenInMemory;
      }

      return api(originalRequest);
    }

    if (
      status === 401 &&
      !originalRequest?._retry &&
      !isAuthRefreshRoute(originalRequest?.url) &&
      !isAuthLoginRoute(originalRequest?.url)
    ) {
      originalRequest._retry = true;
      try {
        await refreshAccessToken();
        return api(originalRequest);
      } catch {
        return Promise.reject(error);
      }
    }

    console.error("[API] Request failed", {
      url: error?.config?.url,
      method: error?.config?.method,
      status,
      message,
      data: error?.response?.data,
    });
    return Promise.reject(error);
  }
);

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
  api.post("/auth/send-otp", validateSendOtpPayload(payload));

export const verifyRegistrationOtp = ({ email, otp }) =>
  api.post("/auth/register", { email, otp });

export const loginUser = ({ email, password }) =>
  api.post("/auth/login", { email, password });

export const refreshAuthToken = () =>
  api.post("/auth/refresh-token");

export const getCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res?.data?.data?.user || res?.data?.user || null;
};

export const logoutUser = () =>
  api.post("/auth/logout");

export const logoutAllSessions = () =>
  api.post("/auth/logout-all");

export const getApiErrorMessage = (error, fallback = "Request failed") =>
  error?.response?.data?.message || error?.response?.data?.error || error?.message || fallback;

export default api;
