import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// Public pages
import LandingPage from "./components/landing-page";
import AuthPage from "./components/auth-page";

// Candidate pages
import CandidateDashboard from "./components/candidate-dashboard";
import CandidateProfile from "./components/candidate-profile";
import InterviewPractice from "./components/interview-practice";
import ResumeUploadPage from "./components/resume-upload-page";

// Recruiter pages
import RecruiterDashboard from "./components/recruiter-dashboard";

function App() {
  return (
    <Router>
      <Routes>
        {/* ===== PUBLIC ===== */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* ===== CANDIDATE ===== */}
        <Route
          path="/candidate/dashboard"
          element={<CandidateDashboard />}
        />
        <Route path="/profile" element={<CandidateProfile />} />
        <Route path="/practice" element={<InterviewPractice />} />
        <Route path="/upload" element={<ResumeUploadPage />} />

        {/* ===== RECRUITER ===== */}
        <Route
          path="/recruiter/dashboard"
          element={<RecruiterDashboard />}
        />
        <Route path = "/dashboard" element={<CandidateDashboard />}/>
      </Routes>
    </Router>
  );
}

export default App;
