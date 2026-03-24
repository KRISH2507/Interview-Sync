import { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import DashboardLayout from "./dashboard-layout";
import { Button } from "./ui/button";
import { getRandomCodeQuestion, runCode, submitCode } from "../services/api";
import { useTheme } from "../contexts/theme-context";

const LANGUAGE_OPTIONS = [
  { value: "javascript", label: "JavaScript", monaco: "javascript" },
  { value: "python", label: "Python", monaco: "python" },
  { value: "java", label: "Java", monaco: "java" },
  { value: "cpp", label: "C++", monaco: "cpp" },
];

const DIFFICULTIES = ["easy", "medium", "hard"];
const CODE_PRACTICE_DRAFT_PREFIX = "code-practice-draft";

function getCodePracticeDraftKey(questionId, language) {
  return `${CODE_PRACTICE_DRAFT_PREFIX}:${questionId}:${language}`;
}

function readCodePracticeDraft(questionId, language) {
  try {
    const raw = localStorage.getItem(getCodePracticeDraftKey(questionId, language));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeCodePracticeDraft(questionId, language, draft) {
  try {
    localStorage.setItem(getCodePracticeDraftKey(questionId, language), JSON.stringify(draft));
  } catch {
    // ignore storage errors
  }
}

export default function CodePractice() {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [difficulty, setDifficulty] = useState("easy");
  const [question, setQuestion] = useState(null);
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [runResult, setRunResult] = useState(null);
  const [submitResult, setSubmitResult] = useState(null);
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [runningCode, setRunningCode] = useState(false);
  const [submittingCode, setSubmittingCode] = useState(false);
  const [error, setError] = useState("");
  const [draftMessage, setDraftMessage] = useState("");

  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#CBD5E1" : "#475569";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const cardBg = isDark ? "#111827" : "#FFFFFF";

  const selectedLanguage = useMemo(
    () => LANGUAGE_OPTIONS.find((option) => option.value === language) || LANGUAGE_OPTIONS[0],
    [language]
  );

  const loadQuestion = async (selectedDifficulty = difficulty) => {
    setLoadingQuestion(true);
    setError("");
    setRunResult(null);
    setSubmitResult(null);

    try {
      const res = await getRandomCodeQuestion(selectedDifficulty);
      const payload = res.data?.data || {};
      const nextQuestion = payload.question || null;
      setQuestion(nextQuestion || null);
      const savedDraft = nextQuestion?.id ? readCodePracticeDraft(nextQuestion.id, language) : null;
      if (savedDraft) {
        setCode(savedDraft.code || nextQuestion?.starterCode?.[language] || "");
        setInput(savedDraft.input || "");
        setDraftMessage("Draft restored");
      } else {
        setCode(nextQuestion?.starterCode?.[language] || "");
        setInput("");
        setDraftMessage("");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load coding question");
      setQuestion(null);
      setCode("");
    } finally {
      setLoadingQuestion(false);
    }
  };

  useEffect(() => {
    loadQuestion(difficulty);
  }, [difficulty]);

  useEffect(() => {
    if (!question?.id) {
      return;
    }

    const savedDraft = readCodePracticeDraft(question.id, language);
    if (savedDraft) {
      setCode(savedDraft.code || question?.starterCode?.[language] || "");
      setInput(savedDraft.input || "");
      setDraftMessage("Draft restored");
      return;
    }

    if (question?.starterCode?.[language]) {
      setCode(question.starterCode[language]);
      setDraftMessage("");
    }
  }, [language, question]);

  useEffect(() => {
    if (!question?.id) {
      return;
    }

    writeCodePracticeDraft(question.id, language, {
      code,
      input,
      updatedAt: new Date().toISOString(),
    });
  }, [question, language, code, input]);

  const handleRunCode = async () => {
    if (!code.trim()) {
      setError("Please write or paste code before running.");
      return;
    }

    setRunningCode(true);
    setError("");
    setRunResult(null);

    try {
      const res = await runCode({ code, language, input });
      setRunResult(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.details || err.response?.data?.message || "Failed to run code");
    } finally {
      setRunningCode(false);
    }
  };

  const handleSubmitCode = async () => {
    if (!question?.id) {
      setError("No active question to submit.");
      return;
    }
    if (!code.trim()) {
      setError("Please write code before submitting.");
      return;
    }

    setSubmittingCode(true);
    setError("");
    setSubmitResult(null);

    try {
      const res = await submitCode({
        questionId: question.id,
        code,
        language,
      });
      setSubmitResult(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit code");
    } finally {
      setSubmittingCode(false);
    }
  };

  return (
    <DashboardLayout role="candidate">
      <div className="mx-auto max-w-7xl space-y-6">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold" style={{ color: textPrimary }}>
            Coding <span style={{ color: "#4F46E5" }}>Practice</span>
          </h1>
          <p className="mt-2" style={{ color: textSecondary }}>
            Pick a difficulty, solve a random interview problem, run your code, and submit against test cases.
          </p>
        </motion.div>

        <div className="flex flex-wrap items-center gap-3 rounded-xl border p-4" style={{ borderColor, backgroundColor: cardBg }}>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold" style={{ color: textSecondary }}>Difficulty:</span>
            {DIFFICULTIES.map((level) => {
              const isActive = difficulty === level;
              return (
                <Button
                  key={level}
                  size="sm"
                  variant={isActive ? "default" : "outline"}
                  onClick={() => setDifficulty(level)}
                  style={!isActive ? { borderColor, color: textPrimary } : undefined}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </Button>
              );
            })}
          </div>

          <div className="ml-auto">
            <Button size="sm" variant="secondary" onClick={() => loadQuestion(difficulty)} disabled={loadingQuestion}>
              {loadingQuestion ? "Loading..." : "New Random Question"}
            </Button>
          </div>
        </div>

        {question && (
          <div className="rounded-xl border p-5" style={{ borderColor, backgroundColor: cardBg }}>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
                {question.difficulty}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                {question.topic}
              </span>
            </div>

            <h2 className="text-2xl font-bold" style={{ color: textPrimary }}>{question.title}</h2>
            <p className="mt-3 whitespace-pre-line" style={{ color: textSecondary }}>{question.description}</p>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-4" style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC" }}>
                <h3 className="mb-2 font-semibold" style={{ color: textPrimary }}>Examples</h3>
                <p className="whitespace-pre-line text-sm" style={{ color: textSecondary }}>{question.examples}</p>
              </div>
              <div className="rounded-lg border p-4" style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC" }}>
                <h3 className="mb-2 font-semibold" style={{ color: textPrimary }}>Constraints</h3>
                <p className="whitespace-pre-line text-sm" style={{ color: textSecondary }}>{question.constraints}</p>
              </div>
            </div>

            <div className="mt-4 rounded-lg border p-4" style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC" }}>
              <h3 className="mb-3 font-semibold" style={{ color: textPrimary }}>Test Cases</h3>
              <div className="space-y-2">
                {(question.testCases || []).map((testCase, index) => (
                  <div
                    key={index}
                    className="rounded-md border p-3"
                    style={{ borderColor, backgroundColor: cardBg }}
                  >
                    <p className="text-xs font-semibold" style={{ color: textSecondary }}>Case #{index + 1}</p>
                    <p className="mt-1 text-sm" style={{ color: textPrimary }}>
                      <span className="font-semibold">Input:</span> {testCase.input}
                    </p>
                    <p className="text-sm" style={{ color: textPrimary }}>
                      <span className="font-semibold">Expected Output:</span> {testCase.output}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-xl border overflow-hidden" style={{ borderColor, backgroundColor: cardBg }}>
            <div className="flex items-center justify-between border-b p-3" style={{ borderColor }}>
              <p className="text-sm font-semibold" style={{ color: textPrimary }}>Code Editor</p>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
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

            {draftMessage && (
              <div className="border-b px-3 py-2 text-xs" style={{ borderColor, color: textSecondary }}>
                {draftMessage}
              </div>
            )}

            <Editor
              height="520px"
              language={selectedLanguage.monaco}
              value={code}
              onChange={(value) => setCode(value ?? "")}
              theme={isDark ? "vs-dark" : "light"}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                automaticLayout: true,
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          <div className="space-y-4">
            <div className="rounded-xl border p-4" style={{ borderColor, backgroundColor: cardBg }}>
              <h3 className="text-sm font-semibold" style={{ color: textPrimary }}>Custom Input</h3>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={7}
                placeholder="Paste custom stdin input here..."
                className="mt-3 w-full rounded-md border p-3 text-sm"
                style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC", color: textPrimary }}
              />

              <div className="mt-3 grid gap-2">
                <Button onClick={handleRunCode} disabled={runningCode}>
                  {runningCode ? "Running..." : "Run Code"}
                </Button>
                <Button variant="accent" onClick={handleSubmitCode} disabled={submittingCode}>
                  {submittingCode ? "Submitting..." : "Submit Solution"}
                </Button>
              </div>
            </div>

            {error && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}

            {runResult && (
              <div className="rounded-xl border p-4" style={{ borderColor, backgroundColor: cardBg }}>
                <h3 className="text-sm font-semibold" style={{ color: textPrimary }}>Run Output</h3>
                <pre className="mt-2 max-h-52 overflow-auto rounded-md border p-3 text-xs" style={{ borderColor, backgroundColor: isDark ? "#0B1220" : "#F8FAFC", color: textPrimary }}>
{runResult.output || runResult.executionOutput || "(no output)"}
                </pre>
                <p className="mt-2 text-xs" style={{ color: textSecondary }}>Runtime: {runResult.runtime ?? 0} ms</p>
              </div>
            )}

            {submitResult && (
              <div className="rounded-xl border p-4" style={{ borderColor, backgroundColor: cardBg }}>
                <h3 className="text-sm font-semibold" style={{ color: textPrimary }}>Submission Result</h3>
                <p className="mt-2 text-sm" style={{ color: textPrimary }}>
                  Passed {submitResult.passedCount ?? submitResult.passedTests}/{submitResult.totalCount ?? submitResult.totalTests}
                </p>
                <p className="text-xs" style={{ color: textSecondary }}>Runtime: {submitResult.runtime ?? 0} ms</p>

                <div className="mt-3 space-y-2 max-h-64 overflow-auto">
                  {(submitResult.results || submitResult.executionOutput || []).map((item, index) => (
                    <div
                      key={item.testCase || index + 1}
                      className="rounded-md border p-2 text-xs"
                      style={{
                        borderColor: item.passed ? "#16A34A" : "#DC2626",
                        backgroundColor: item.passed ? "rgba(34,197,94,0.08)" : "rgba(239,68,68,0.08)",
                        color: textPrimary,
                      }}
                    >
                      <p className="font-semibold">
                        Case #{item.testCase || index + 1} {item.passed ? "✓ Passed" : "✗ Failed"}
                      </p>
                      <p className="mt-1">Input: {item.input}</p>
                      <p>Expected: {item.expected}</p>
                      <p>Output: {item.output || item.actual}</p>
                      {!item.passed && (
                        <>
                          <p className="mt-1">Please review your function logic for this case.</p>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
