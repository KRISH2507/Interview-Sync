import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "./dashboard-layout";
import { Button } from "./ui/button";
import { getInterviewRooms, getInterviewResults, getInterviewRequests, startInterviewFromRequest } from "../services/api";
import { useTheme } from "../contexts/theme-context";

export default function RecruiterInterviews() {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#CBD5E1" : "#475569";

  const [rooms, setRooms] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingRequestId, setStartingRequestId] = useState("");
  const [error, setError] = useState("");
  const [resultByRoomId, setResultByRoomId] = useState({});

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [roomsRes, requestsRes] = await Promise.all([
          getInterviewRooms(),
          getInterviewRequests(),
        ]);
        setRooms(roomsRes.data?.data?.rooms || []);
        setRequests(requestsRes.data?.data?.requests || []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load interviews");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const handleViewResult = async (candidateId) => {
    try {
      const res = await getInterviewResults(candidateId);
      const results = res.data?.data?.results || [];
      const map = {};
      for (const result of results) {
        map[result.roomId] = result;
      }
      setResultByRoomId((prev) => ({ ...prev, ...map }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load result");
    }
  };

  const handleStartInterview = async (requestId) => {
    try {
      setStartingRequestId(requestId);
      setError("");
      const res = await startInterviewFromRequest(requestId);
      const nextRoom = res.data?.data?.room;
      const nextRequest = res.data?.data?.request;

      if (nextRoom) {
        setRooms((prev) => {
          const existing = prev.filter((room) => room.roomId !== nextRoom.roomId);
          return [nextRoom, ...existing];
        });
      }

      if (nextRequest) {
        setRequests((prev) => prev.map((item) => (item._id === nextRequest._id ? nextRequest : item)));
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to start interview");
    } finally {
      setStartingRequestId("");
    }
  };

  return (
    <DashboardLayout role="recruiter">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: textPrimary }}>
            Recruiter <span style={{ color: "#4F46E5" }}>Interviews</span>
          </h1>
          <p className="mt-2" style={{ color: textSecondary }}>
            Review candidate requests, start video interviews, join rooms, and review results.
          </p>
        </div>

        <div className="rounded-xl border p-4" style={{ borderColor, backgroundColor: cardBg }}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: textPrimary }}>Interview Requests</h2>
            <span className="text-sm" style={{ color: textSecondary }}>
              {requests.length} active
            </span>
          </div>

          <div className="space-y-3">
            {requests.map((request) => (
              <div key={request._id} className="rounded-md border p-3" style={{ borderColor }}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold" style={{ color: textPrimary }}>
                      Candidate: {String(request.candidateId)}
                    </p>
                    <p className="text-xs capitalize" style={{ color: textSecondary }}>
                      Status: {request.status}
                    </p>
                    <p className="text-xs" style={{ color: textSecondary }}>
                      Requested: {new Date(request.createdAt).toLocaleString()}
                    </p>
                    {request.roomId && (
                      <p className="text-xs" style={{ color: textSecondary }}>Room: {request.roomId}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {request.status === "pending" && (
                      <Button size="sm" onClick={() => handleStartInterview(request._id)} disabled={startingRequestId === request._id}>
                        {startingRequestId === request._id ? "Starting..." : "Start Interview"}
                      </Button>
                    )}
                    {request.roomId && (
                      <Link to={`/recruiter/interview/${request.roomId}`}>
                        <Button size="sm" variant="outline">Join Interview</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {!loading && requests.length === 0 && (
              <p className="text-sm" style={{ color: textSecondary }}>
                No interview requests right now.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden" style={{ borderColor, backgroundColor: cardBg }}>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead style={{ backgroundColor: isDark ? "#0B1220" : "#F8FAFC" }}>
                <tr>
                  <th className="px-4 py-3 text-left" style={{ color: textSecondary }}>Candidate ID</th>
                  <th className="px-4 py-3 text-left" style={{ color: textSecondary }}>Role</th>
                  <th className="px-4 py-3 text-left" style={{ color: textSecondary }}>Status</th>
                  <th className="px-4 py-3 text-left" style={{ color: textSecondary }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room._id} className="border-t" style={{ borderColor }}>
                    <td className="px-4 py-3" style={{ color: textPrimary }}>{String(room.candidateId)}</td>
                    <td className="px-4 py-3" style={{ color: textPrimary }}>Candidate</td>
                    <td className="px-4 py-3" style={{ color: textPrimary }}>{room.status}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link to={`/recruiter/interview/${room.roomId}`}>
                          <Button size="sm">Join Interview</Button>
                        </Link>
                        <Button size="sm" variant="outline" onClick={() => handleViewResult(String(room.candidateId))}>
                          View Result
                        </Button>
                      </div>
                      {resultByRoomId[room.roomId] && (
                        <div className="mt-2 rounded-md border p-2 text-xs" style={{ borderColor, color: textPrimary }}>
                          <p className="font-semibold">Overall: {resultByRoomId[room.roomId].overallScore}%</p>
                          <p>{resultByRoomId[room.roomId].feedback || "No feedback"}</p>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                {!loading && rooms.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center" style={{ color: textSecondary }}>
                      No interviews found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {error && <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
      </div>
    </DashboardLayout>
  );
}
