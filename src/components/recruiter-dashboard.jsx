import { useState } from "react";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

import DashboardLayout from "./dashboard-layout";

export default function RecruiterDashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCandidate, setSelectedCandidate] = useState(null);

  const candidates = [
    {
      id: 1,
      name: "John Doe",
      role: "Full Stack Developer",
      status: "Interview Scheduled",
      score: 85,
      skills: ["React", "Node.js", "TypeScript"],
      experience: "5 years",
      email: "john.doe@example.com",
    },
    {
      id: 2,
      name: "Jane Smith",
      role: "Frontend Developer",
      status: "Under Review",
      score: 92,
      skills: ["React", "Vue.js", "CSS"],
      experience: "3 years",
      email: "jane.smith@example.com",
    },
    {
      id: 3,
      name: "Mike Johnson",
      role: "Backend Developer",
      status: "Offer Extended",
      score: 88,
      skills: ["Python", "Django", "PostgreSQL"],
      experience: "7 years",
      email: "mike.j@example.com",
    },
  ];

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "Interview Scheduled":
        return "border-primary/20 bg-primary/10 text-primary";
      case "Under Review":
        return "border-yellow-500/20 bg-yellow-500/10 text-yellow-500";
      case "Offer Extended":
        return "border-green-500/20 bg-green-500/10 text-green-500";
      default:
        return "border-border bg-muted text-muted-foreground";
    }
  };

  return (
    <DashboardLayout role="recruiter">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Recruiter Dashboard
          </h1>
          <p className="mt-2 text-muted-foreground">
            Manage candidates and track interview progress
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Total Candidates", 24],
            ["Interviews Scheduled", 8],
            ["Under Review", 12],
            ["Offers Extended", 4],
          ].map(([label, value]) => (
            <Card key={label}>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">
                  {value}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Candidates</CardTitle>
            <CardDescription>View and manage all candidates</CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">Filter</Button>
              </div>

              <div className="space-y-3">
                {filteredCandidates.map((candidate) => (
                  <div
                    key={candidate.id}
                    className="cursor-pointer rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/50"
                    onClick={() => setSelectedCandidate(candidate)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div>
                          <div className="font-medium text-foreground">
                            {candidate.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {candidate.role}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {candidate.skills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-2xl font-bold text-foreground">
                          {candidate.score}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Score
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(
                          candidate.status
                        )}`}
                      >
                        {candidate.status}
                      </span>
                      <Button size="sm" variant="ghost">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {selectedCandidate && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Feedback & Rating</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCandidate(null)}
                >
                  ✕
                </Button>
              </div>
              <CardDescription>
                Provide feedback for {selectedCandidate.name}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Rating
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      className="h-8 w-8 rounded text-muted-foreground hover:text-primary"
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Feedback
                </label>
                <textarea
                  className="h-32 w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground"
                  placeholder="Write your feedback here..."
                />
              </div>

              <Button className="w-full">Submit Feedback</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
