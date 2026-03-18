import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./dashboard-layout";
import { Button } from "./ui/button";
import { createInterviewRoom, getCurrentUser } from "../services/api";
import { useTheme } from "../contexts/theme-context";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#CBD5E1" : "#475569";

  const [candidateId, setCandidateId] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [interviewerId, setInterviewerId] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        if (mounted) {
          setInterviewerId(String(user?.id || ""));
        }
      } catch {
        if (mounted) {
          setInterviewerId("");
        }
      }
    };

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  const handleCreateRoom = async (event) => {
    event.preventDefault();
    if (!candidateId) {
      setError("Candidate ID is required");
      return;
    }
    if (!interviewerId) {
      setError("Recruiter session not found. Please sign in again.");
      return;
    }

    setCreating(true);
    setError("");
    try {
      const res = await createInterviewRoom({ candidateId, interviewerId });
      const nextRoomId = res.data?.room?.roomId || res.data?.roomId;
      if (!nextRoomId) {
        throw new Error("Interview room was created but no room ID was returned");
      }
      setCandidateId("");
      navigate(`/recruiter/interview/${nextRoomId}`);
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Failed to create interview room");
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout role="recruiter">
      <div className="mx-auto max-w-2xl space-y-6">
        <form
          onSubmit={handleCreateRoom}
          className="rounded-xl border p-6 space-y-5"
          style={{ borderColor, backgroundColor: cardBg }}
        >
          <div className="space-y-2">
            <h1 className="text-3xl font-bold" style={{ color: textPrimary }}>
              Start <span style={{ color: "#4F46E5" }}>Interview</span>
            </h1>
            <p style={{ color: textSecondary }}>
              Enter a candidate ID and open the interview room directly.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium" style={{ color: textPrimary }}>
              Candidate ID
            </label>
            <input
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              placeholder="Candidate ID"
              className="w-full rounded-md border px-3 py-3 text-sm"
              style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC", color: textPrimary }}
            />
          </div>

          <Button type="submit" disabled={creating} className="w-full sm:w-auto">
            {creating ? "Starting..." : "Start Interview"}
          </Button>

          {!interviewerId && (
            <p className="text-sm" style={{ color: textSecondary }}>
              Your recruiter ID could not be detected from the current session.
            </p>
          )}

          {error && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
