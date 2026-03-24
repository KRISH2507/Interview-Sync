import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import Editor from "@monaco-editor/react";
import DashboardLayout from "./dashboard-layout";
import { Button } from "./ui/button";
import {
  getCurrentUser,
  getInterviewRoom,
  getInterviewRoomDraft,
  getRandomCodeQuestion,
  runCode,
  saveInterviewRoomDraft,
  submitCode,
  submitInterviewEvaluation,
} from "../services/api";
import { useTheme } from "../contexts/theme-context";

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript", monaco: "javascript" },
  { value: "python", label: "Python", monaco: "python" },
  { value: "java", label: "Java", monaco: "java" },
  { value: "cpp", label: "C++", monaco: "cpp" },
];

const INTERVIEW_ROOM_DRAFT_PREFIX = "interview-room-draft";

function getInterviewDraftLocalKey(roomId) {
  return `${INTERVIEW_ROOM_DRAFT_PREFIX}:${roomId}`;
}

function readInterviewDraftFromLocal(roomId) {
  try {
    const raw = localStorage.getItem(getInterviewDraftLocalKey(roomId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeInterviewDraftToLocal(roomId, draft) {
  try {
    localStorage.setItem(getInterviewDraftLocalKey(roomId), JSON.stringify(draft));
  } catch {
    // ignore storage errors
  }
}

function toTimestamp(value) {
  const timestamp = new Date(value || 0).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function pickLatestDraft(localDraft, remoteDraft) {
  if (!localDraft) return remoteDraft;
  if (!remoteDraft) return localDraft;
  return toTimestamp(localDraft.updatedAt) >= toTimestamp(remoteDraft.updatedAt)
    ? localDraft
    : remoteDraft;
}

function getSocketBaseUrl() {
  const envBase = import.meta.env.VITE_API_BASE_URL || import.meta.env.NEXT_PUBLIC_API_URL || "";
  if (envBase) return envBase.replace(/\/api\/?$/, "");
  return window.location.origin;
}

export default function InterviewRoom({ viewRole }) {
  const { roomId } = useParams();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#CBD5E1" : "#475569";

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const draftSaveTimeoutRef = useRef(null);

  const [room, setRoom] = useState(null);
  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [ratings, setRatings] = useState({
    technical: 7,
    problemSolving: 7,
    behavior: 7,
    communication: 7,
    confidence: 7,
  });
  const [feedback, setFeedback] = useState("");
  const [savingResult, setSavingResult] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [draftStatus, setDraftStatus] = useState("");
  const [currentUser, setCurrentUser] = useState({ id: "", role: "candidate" });
  const [authLoading, setAuthLoading] = useState(true);

  const currentUserId = currentUser.id;
  const userRole = currentUser.role;
  
  // Determine role: if user has "candidate" role=in token and is candidate in room, show candidate view
  // If user has "recruiter" role, or is the interviewer, show recruiter view
  const isEvaluator = useMemo(() => {
    if (viewRole === "recruiter") return true;
    if (viewRole === "candidate") return false;

    if (!room || !currentUserId) return false;
    
    // If user has recruiter role in their token, they are an evaluator
    if (userRole === "recruiter") {
      return true;
    }
    
    // If user is the candidate in this room, they're NOT an evaluator
    if (String(room.candidateId) === String(currentUserId)) {
      return false;
    }
    
    // If user is the interviewer, they ARE an evaluator
    if (String(room.interviewerId) === String(currentUserId)) {
      return true;
    }
    
    // Default to candidate view if unclear
    return false;
  }, [room, currentUserId, userRole, viewRole]);

  const selectedLanguage = useMemo(
    () => LANGUAGE_OPTIONS.find((option) => option.value === language) || LANGUAGE_OPTIONS[0],
    [language]
  );

  useEffect(() => {
    let mounted = true;

    const loadCurrentUser = async () => {
      try {
        const user = await getCurrentUser();
        if (mounted) {
          setCurrentUser({
            id: String(user?.id || ""),
            role: String(user?.role || "candidate"),
          });
        }
      } catch {
        if (mounted) {
          setCurrentUser({ id: "", role: "candidate" });
        }
      } finally {
        if (mounted) {
          setAuthLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      mounted = false;
    };
  }, []);

  const applyDraft = (draft) => {
    if (!draft) return;
    setQuestion(draft.question || null);
    setLanguage(draft.language || "javascript");
    setCode(draft.code || draft.question?.starterCode?.[draft.language || "javascript"] || "");
    setInput(draft.input || "");
  };

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage);
    if (question?.starterCode?.[nextLanguage]) {
      setCode(question.starterCode[nextLanguage]);
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit("ice-candidate", {
          roomId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current && remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    return pc;
  };

  useEffect(() => {
    if (authLoading || !currentUserId) {
      return undefined;
    }

    let isMounted = true;

    async function initialize() {
      try {
        setLoading(true);
        setError("");

        const roomRes = await getInterviewRoom(roomId);
        if (!isMounted) return;
        setRoom(roomRes.data?.data?.room || null);

        const localDraft = readInterviewDraftFromLocal(roomId);
        let remoteDraft = null;

        try {
          const draftRes = await getInterviewRoomDraft(roomId);
          remoteDraft = draftRes.data?.data?.draft || null;
        } catch (draftError) {
          console.error("Failed to fetch room draft:", draftError);
        }

        let nextDraft = pickLatestDraft(localDraft, remoteDraft);

        if (!nextDraft) {
          const questionRes = await getRandomCodeQuestion("medium");
          const nextQuestion = questionRes.data?.data?.question || null;
          nextDraft = {
            roomId,
            question: nextQuestion || null,
            language: "javascript",
            code: nextQuestion?.starterCode?.javascript || "",
            input: "",
            updatedAt: new Date().toISOString(),
          };
        }

        if (!isMounted) return;
        applyDraft(nextDraft);
        writeInterviewDraftToLocal(roomId, nextDraft);

        if (!isEvaluator && localDraft && nextDraft === localDraft && (!remoteDraft || toTimestamp(localDraft.updatedAt) > toTimestamp(remoteDraft.updatedAt))) {
          saveInterviewRoomDraft(roomId, nextDraft).catch((draftError) => {
            console.error("Failed to sync local room draft:", draftError);
          });
        }

        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        if (!isMounted) return;
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const socket = io(getSocketBaseUrl(), {
          transports: ["websocket", "polling"],
        });
        socketRef.current = socket;

        const peerConnection = createPeerConnection();
        peerConnectionRef.current = peerConnection;

        socket.emit("join-room", { roomId, userId: currentUserId });

        socket.on("peer-joined", async () => {
          if (!peerConnectionRef.current) return;
          const offer = await peerConnectionRef.current.createOffer();
          await peerConnectionRef.current.setLocalDescription(offer);
          socket.emit("offer", { roomId, offer });
        });

        socket.on("offer", async ({ offer }) => {
          if (!peerConnectionRef.current) return;
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(offer));
          const answer = await peerConnectionRef.current.createAnswer();
          await peerConnectionRef.current.setLocalDescription(answer);
          socket.emit("answer", { roomId, answer });
        });

        socket.on("answer", async ({ answer }) => {
          if (!peerConnectionRef.current) return;
          await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        });

        socket.on("ice-candidate", async ({ candidate }) => {
          if (!peerConnectionRef.current || !candidate) return;
          try {
            await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
          } catch {
            // ignore transient ICE errors
          }
        });
      } catch (err) {
        if (!isMounted) return;
        setError(err.response?.data?.message || err.message || "Failed to initialize interview room");
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initialize();

    return () => {
      isMounted = false;
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [roomId, currentUserId, authLoading]);

  useEffect(() => {
    if (!authLoading && !currentUserId) {
      setLoading(false);
      setError("Session expired. Please sign in again.");
    }
  }, [authLoading, currentUserId]);

  useEffect(() => {
    if (isEvaluator || !roomId || !question) {
      return undefined;
    }

    const draftPayload = {
      roomId,
      question,
      language,
      code,
      input,
      updatedAt: new Date().toISOString(),
    };

    writeInterviewDraftToLocal(roomId, draftPayload);
    setDraftStatus("Saving draft...");

    if (draftSaveTimeoutRef.current) {
      clearTimeout(draftSaveTimeoutRef.current);
    }

    draftSaveTimeoutRef.current = setTimeout(async () => {
      try {
        await saveInterviewRoomDraft(roomId, draftPayload);
        setDraftStatus("Draft saved");
      } catch (draftError) {
        console.error("Failed to save room draft:", draftError);
        setDraftStatus("Saved locally");
      }
    }, 1200);

    return () => {
      if (draftSaveTimeoutRef.current) {
        clearTimeout(draftSaveTimeoutRef.current);
      }
    };
  }, [roomId, isEvaluator, question, language, code, input]);

  const handleRunCode = async () => {
    try {
      setError("");
      const res = await runCode({ code, language, input });
      setRunResult(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.message || "Failed to run code");
    }
  };

  const handleSubmitCode = async () => {
    if (!question?.id) {
      setError("Question unavailable for submit");
      return;
    }
    try {
      setError("");
      const res = await submitCode({ questionId: question.id, code, language });
      setSubmitResult(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit code");
    }
  };

  const handleSaveResult = async () => {
    if (!room) return;
    setSavingResult(true);
    setError("");
    try {
      const score = Math.round((Object.values(ratings).reduce((sum, value) => sum + value, 0) / 5) * 10);

      await submitInterviewEvaluation({
        candidateId: room.candidateId,
        interviewerId: room.interviewerId,
        roomId: room.roomId,
        ratings,
        overallScore: score,
        feedback,
      });
      setResultSaved(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit interview result");
    } finally {
      setSavingResult(false);
    }
  };

  return (
    <DashboardLayout role={viewRole || (isEvaluator ? "recruiter" : "candidate")}>
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: textPrimary }}>
            Live Interview <span style={{ color: "#4F46E5" }}>Room</span>
          </h1>
          <p className="mt-1 text-sm" style={{ color: textSecondary }}>
            Room ID: {roomId}
          </p>
        </div>

        {loading && (
          <div className="rounded-xl border p-4" style={{ borderColor, backgroundColor: cardBg }}>
            <p style={{ color: textSecondary }}>Initializing interview room...</p>
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border p-4" style={{ borderColor, backgroundColor: cardBg }}>
            <h2 className="mb-3 text-lg font-semibold" style={{ color: textPrimary }}>Video Streams</h2>
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <p className="mb-2 text-xs" style={{ color: textSecondary }}>You</p>
                <video
                  ref={localVideoRef}
                  autoPlay
                  muted
                  playsInline
                  className="h-56 w-full rounded-lg border object-cover"
                  style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC" }}
                />
              </div>
              <div>
                <p className="mb-2 text-xs" style={{ color: textSecondary }}>Peer</p>
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="h-56 w-full rounded-lg border object-cover"
                  style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC" }}
                />
              </div>
            </div>
          </div>

          <div className="rounded-xl border overflow-hidden" style={{ borderColor, backgroundColor: cardBg }}>
            <div className="flex items-center justify-between border-b p-3" style={{ borderColor }}>
              <div>
                <p className="text-sm font-semibold" style={{ color: textPrimary }}>
                  Coding Editor {question?.title ? `• ${question.title}` : ""}
                </p>
              </div>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="rounded-md border px-3 py-1.5 text-sm"
                style={{ borderColor, backgroundColor: cardBg, color: textPrimary }}
              >
                {LANGUAGE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <Editor
              height="420px"
              language={selectedLanguage.monaco}
              value={code}
              onChange={isEvaluator ? undefined : (value) => setCode(value ?? "")}
              theme={isDark ? "vs-dark" : "light"}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                scrollBeyondLastLine: false,
                readOnly: isEvaluator,
              }}
            />

            <div className="border-t p-3 space-y-3" style={{ borderColor }}>
              {!isEvaluator && (
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  rows={3}
                  placeholder="Custom input"
                  className="w-full rounded-md border p-2 text-sm"
                  style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC", color: textPrimary }}
                />
              )}
              {!isEvaluator && (
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleRunCode}>Run Code</Button>
                  <Button variant="accent" onClick={handleSubmitCode}>Submit Code</Button>
                </div>
              )}
              {!isEvaluator && draftStatus && (
                <p className="text-xs" style={{ color: textSecondary }}>{draftStatus}</p>
              )}
              {isEvaluator && (
                <p className="text-xs italic" style={{ color: textSecondary }}>Viewing candidate's code (read-only). Refresh keeps the latest saved draft.</p>
              )}
              {runResult && (
                <pre className="rounded-md border p-2 text-xs" style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC", color: textPrimary }}>
{runResult.output || runResult.executionOutput || "(no output)"}
                </pre>
              )}
              {submitResult && (
                <div className="rounded-md border p-2" style={{ borderColor }}>
                  <p className="text-sm font-semibold" style={{ color: textPrimary }}>
                    Passed {submitResult.passedCount ?? submitResult.passedTests}/{submitResult.totalCount ?? submitResult.totalTests}
                  </p>
                  <div className="mt-2 space-y-1">
                    {(submitResult.results || []).map((item, index) => (
                      <p key={index} className="text-xs" style={{ color: item.passed ? "#16A34A" : "#DC2626" }}>
                        Case #{index + 1} {item.passed ? "✓ Passed" : "✗ Failed"}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {isEvaluator && (
          <div className="rounded-xl border p-4 space-y-3" style={{ borderColor, backgroundColor: cardBg }}>
            <div>
              <h2 className="text-lg font-semibold" style={{ color: textPrimary }}>Interview Rating</h2>
              <p className="mt-1 text-sm" style={{ color: textSecondary }}>
                Add ratings and feedback before finishing the interview.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
              {[
                ["technical", "Technical Skills"],
                ["problemSolving", "Problem Solving"],
                ["behavior", "Behavior"],
                ["communication", "Communication"],
                ["confidence", "Confidence"],
              ].map(([key, label]) => (
                <label key={key} className="text-sm" style={{ color: textSecondary }}>
                  {label}
                  <select
                    className="mt-1 w-full rounded-md border px-2 py-2"
                    value={ratings[key]}
                    onChange={(e) => setRatings((prev) => ({ ...prev, [key]: Number(e.target.value) }))}
                    style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC", color: textPrimary }}
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((value) => (
                      <option key={value} value={value}>{value}</option>
                    ))}
                  </select>
                </label>
              ))}
            </div>

            <div className="rounded-md border p-3" style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC" }}>
              <p className="text-sm" style={{ color: textSecondary }}>Overall Score</p>
              <p className="text-xl font-semibold" style={{ color: textPrimary }}>
                {Math.round((Object.values(ratings).reduce((sum, value) => sum + value, 0) / 5) * 10)}%
              </p>
            </div>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={4}
              placeholder="Overall feedback"
              className="w-full rounded-md border p-3 text-sm"
              style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC", color: textPrimary }}
            />

            <div className="flex items-center gap-3">
              <Button onClick={handleSaveResult} disabled={savingResult || resultSaved}>
                {savingResult ? "Saving..." : resultSaved ? "Saved" : "Submit Interview Result"}
              </Button>
              {resultSaved && <span className="text-sm" style={{ color: "#16A34A" }}>Evaluation saved successfully</span>}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
