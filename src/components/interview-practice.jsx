import { useEffect, useState } from "react";
import { startInterview, submitInterview } from "../services/api";
import DashboardLayout from "./dashboard-layout";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useNavigate } from "react-router-dom";

export default function InterviewPractice() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [current, setCurrent] = useState(0);
  const [interviewId, setInterviewId] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    async function loadInterview() {
      try {
        const res = await startInterview(userId);
        setQuestions(res.data.questions);
        setInterviewId(res.data.interviewId);
        setAnswers(new Array(res.data.questions.length).fill(null));
      } catch {
        alert("Failed to start interview");
      } finally {
        setLoading(false);
      }
    }

    loadInterview();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="text-center">Preparing your interview...</div>
      </DashboardLayout>
    );
  }

  const question = questions[current];

  return (
    <DashboardLayout role="candidate">
      <div className="mx-auto max-w-3xl space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>
              Question {current + 1} of {questions.length}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-lg font-medium">{question.question}</p>

            <div className="space-y-2">
              {question.options.map((opt, idx) => (
                <button
                  key={idx}
                  className={`w-full rounded border p-3 text-left ${
                    answers[current] === idx
                      ? "border-blue-500 bg-blue-500/10"
                      : "border-border"
                  }`}
                  onClick={() => {
                    const copy = [...answers];
                    copy[current] = idx;
                    setAnswers(copy);
                  }}
                >
                  {opt}
                </button>
              ))}
            </div>

            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent(current + 1)}>
                Next Question
              </Button>
            ) : (
              <Button
                onClick={async () => {
                  try {
                    await submitInterview({ interviewId, answers });
                    navigate("/dashboard");
                  } catch {
                    alert("Failed to submit interview");
                  }
                }}
              >
                Finish Practice
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
