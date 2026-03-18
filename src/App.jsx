import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { useEffect } from "react";

import LandingPage from "./components/landing-page";
import AuthPage from "./components/auth-page";

import CandidateDashboard from "./components/candidate-dashboard";
import CandidateVideoInterview from "./components/candidate-video-interview";
import CandidateProfile from "./components/candidate-profile";
import InterviewPractice from "./components/interview-practice";
import ResumeUploadPage from "./components/resume-upload-page";
import RecruiterDashboard from "./components/recruiter-dashboard";
import AdminDashboard from "./components/admin-dashboard";
import RecruiterInterviews from "./components/recruiter-interviews";
import QuizHistory from "./components/quiz-history";
import CodePractice from "./components/code-practice";
import InterviewRoom from "./components/interview-room";
import { QuizCompletion } from "./components/quiz-completion";

import PrivateRoute from "./components/PrivateRoute";
import { initializeAuthSecurity } from "./services/api";

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        <Route
          path="/candidate/dashboard"
          element={
            <PrivateRoute>
              <CandidateDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <CandidateProfile />
            </PrivateRoute>
          }
        />

        <Route
          path="/candidate/video-interview"
          element={
            <PrivateRoute>
              <CandidateVideoInterview />
            </PrivateRoute>
          }
        />

        <Route
          path="/practice"
          element={
            <PrivateRoute>
              <InterviewPractice />
            </PrivateRoute>
          }
        />

        <Route
          path="/practice/code"
          element={
            <PrivateRoute>
              <CodePractice />
            </PrivateRoute>
          }
        />

        <Route
          path="/completion"
          element={
            <PrivateRoute>
              <QuizCompletion />
            </PrivateRoute>
          }
        />

        <Route
          path="/upload"
          element={
            <PrivateRoute>
              <ResumeUploadPage />
            </PrivateRoute>
          }
        />

        <Route
          path="/history"
          element={
            <PrivateRoute>
              <QuizHistory />
            </PrivateRoute>
          }
        />

        <Route
          path="/recruiter/dashboard"
          element={
            <PrivateRoute>
              <RecruiterDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/recruiter/interviews"
          element={
            <PrivateRoute>
              <RecruiterInterviews />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/candidate/interview/:roomId"
          element={
            <PrivateRoute>
              <InterviewRoom viewRole="candidate" />
            </PrivateRoute>
          }
        />

        <Route
          path="/recruiter/interview/:roomId"
          element={
            <PrivateRoute>
              <InterviewRoom viewRole="recruiter" />
            </PrivateRoute>
          }
        />

        <Route
          path="/interview/:roomId"
          element={
            <PrivateRoute>
              <InterviewRoom />
            </PrivateRoute>
          }
        />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  useEffect(() => {
    initializeAuthSecurity();
  }, []);

  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
