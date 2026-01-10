import { useEffect, useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";

import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

import DashboardLayout from "./dashboard-layout";

/* TEMP Progress component */
function Progress({ value }) {
  return (
    <div className="h-2 w-full rounded bg-slate-800">
      <div
        className="h-2 rounded bg-blue-600"
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

export default function CandidateDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) return;

    async function loadDashboard() {
      try {
        const res = await api.get(`/dashboard/${userId}`);
        setDashboard(res.data);
      } catch (err) {
        console.error("Failed to load dashboard", err);
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="text-center">Loading dashboard...</div>
      </DashboardLayout>
    );
  }

  const profileCompletion = dashboard?.profileCompletion || 0;
  const resumeScore = dashboard?.resumeScore || 0;
  const totalSessions = dashboard?.totalSessions || 0;
  const interviewReadiness = dashboard?.interviewReadiness || "Beginner";

  return (
    <DashboardLayout role="candidate">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-2 text-muted-foreground">
            Track your progress and continue your interview preparation
          </p>
        </div>

        {resumeScore === 0 && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Upload your resume to unlock personalized interview preparation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/upload">
                <Button>Upload Resume</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Profile Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {profileCompletion}%
                </div>
                <Progress value={profileCompletion} />
                <p className="text-xs text-muted-foreground">
                  Keep practicing to improve your profile
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Resume Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {resumeScore}/100
                </div>
                <Progress value={resumeScore} />
                <p className="text-xs text-muted-foreground">
                  Interview Readiness: {interviewReadiness}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Practice Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-foreground">
                  {totalSessions}
                </div>
                <p className="text-xs text-muted-foreground">Total sessions</p>
                <Link to="/practice">
                  <Button className="w-full" variant="outline">
                    Start Practice
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
