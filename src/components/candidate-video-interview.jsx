import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "./dashboard-layout";
import { Button } from "./ui/button";
import { getMyInterviewRequests, requestInterview } from "../services/api";
import { useTheme } from "../contexts/theme-context";

export default function CandidateVideoInterview() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#CBD5E1" : "#475569";
  const candidateId = localStorage.getItem("userId") || "Not available";

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    setError("");
    try {
      const res = await getMyInterviewRequests();
      setRequests(res.data?.requests || []);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load interview requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
    
    // Auto-refresh every 2 seconds to detect when recruiter accepts request
    const interval = setInterval(() => {
      loadRequests();
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  const activeRequest = useMemo(
    () => requests.find((item) => item.status === "scheduled" || item.status === "pending") || null,
    [requests]
  );

  const handleRequestInterview = async () => {
    setRequesting(true);
    setError("");
    try {
      const res = await requestInterview();
      const nextRequest = res.data?.request;
      if (nextRequest) {
        setRequests((prev) => {
          const existing = prev.filter((item) => item._id !== nextRequest._id);
          return [nextRequest, ...existing];
        });
      } else {
        await loadRequests();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to request interview");
    } finally {
      setRequesting(false);
    }
  };

  const statusText = activeRequest?.status === "scheduled"
    ? "Interview scheduled"
    : activeRequest?.status === "pending"
      ? "Waiting for recruiter"
      : "No active request";

  return (
    <DashboardLayout role="candidate">
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: textPrimary }}>
            Video <span style={{ color: "#4F46E5" }}>Interview</span>
          </h1>
          <p className="mt-2" style={{ color: textSecondary }}>
            Request a live interview and join as soon as a recruiter schedules it.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border p-6 space-y-4" style={{ borderColor, backgroundColor: cardBg }}>
            <div>
              <p className="text-sm font-medium" style={{ color: textSecondary }}>Candidate ID</p>
              <p className="mt-1 text-xl font-semibold break-all" style={{ color: textPrimary }}>
                {candidateId}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium" style={{ color: textSecondary }}>Current Status</p>
              <p className="mt-1 text-base font-semibold" style={{ color: textPrimary }}>
                {loading ? "Loading..." : statusText}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleRequestInterview}
                disabled={requesting || activeRequest?.status === "pending" || activeRequest?.status === "scheduled"}
              >
                {requesting ? "Requesting..." : activeRequest ? "Request Sent" : "Request Interview"}
              </Button>

              {activeRequest?.status === "pending" && (
                <Button variant="outline" disabled className="animate-pulse">
                  ⏳ Waiting for recruiter...
                </Button>
              )}

              {activeRequest?.status === "scheduled" && activeRequest?.roomId && (
                <Link to={`/candidate/interview/${activeRequest.roomId}`}>
                  <Button className="bg-green-600 hover:bg-green-700">
                    ✓ Join Interview Now
                  </Button>
                </Link>
              )}
            </div>

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}
          </div>

          <div className="rounded-xl border p-6" style={{ borderColor, backgroundColor: cardBg }}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold" style={{ color: textPrimary }}>Interview Requests</h2>
              <Button size="sm" variant="outline" onClick={loadRequests}>
                Refresh
              </Button>
            </div>

            <div className="space-y-3">
              {requests.map((request) => (
                <div
                  key={request._id}
                  className="rounded-lg border p-4"
                  style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC" }}
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-semibold capitalize" style={{ color: textPrimary }}>{request.status}</p>
                    <span className="text-xs" style={{ color: textSecondary }}>
                      {new Date(request.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {request.roomId && (
                    <p className="mt-2 text-sm" style={{ color: textSecondary }}>
                      Room ID: {request.roomId}
                    </p>
                  )}
                </div>
              ))}

              {!loading && requests.length === 0 && (
                <p className="text-sm" style={{ color: textSecondary }}>
                  No interview requests yet.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}