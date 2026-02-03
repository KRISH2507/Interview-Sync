import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";

import LandingPage from "./components/landing-page";
import AuthPage from "./components/auth-page";

import CandidateDashboard from "./components/candidate-dashboard";
import CandidateProfile from "./components/candidate-profile";
import InterviewPractice from "./components/interview-practice";
import ResumeUploadPage from "./components/resume-upload-page";
import RecruiterDashboard from "./components/recruiter-dashboard";
import QuizHistory from "./components/quiz-history";
import { QuizCompletion } from "./components/quiz-completion";

import PrivateRoute from "./components/PrivateRoute";

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
          path="/practice"
          element={
            <PrivateRoute>
              <InterviewPractice />
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
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  );
}

export default App;
