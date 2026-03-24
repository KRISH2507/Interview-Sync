import { useEffect, useState } from "react";
import api, { getProfile, updateProfile } from "../services/api";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { useTheme } from "../contexts/theme-context";

import DashboardLayout from "./dashboard-layout";

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-lg border border-border bg-card p-2.5 text-foreground ${className}`}
      {...props}
    />
  );
}

export default function CandidateProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#CBD5E1" : "#475569";

  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    skills: [],
    education: [],
    experience: [],
    projects: [],
  });

  const [newSkill, setNewSkill] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await getProfile();
        const payload = res?.data?.data || {};
        setProfile({
          ...profile,
          ...payload,
          skills: payload.skills || [],
        });
      } catch (err) {
        console.error("Failed to load profile", err);
        setError(err.response?.data?.message || "Failed to load profile");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  const saveProfile = async () => {
    try {
      await updateProfile(profile);
      setIsEditing(false);
    } catch (err) {
      console.error("Failed to save profile", err);
      setError(err.response?.data?.message || "Failed to save profile");
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !profile.skills.includes(newSkill.trim())) {
      setProfile({
        ...profile,
        skills: [...profile.skills, newSkill.trim()],
      });
      setNewSkill("");
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile({
      ...profile,
      skills: profile.skills.filter((skill) => skill !== skillToRemove),
    });
  };

  if (loading) {
    return (
      <DashboardLayout role="candidate">
        <div className="text-center py-8">Loading profile...</div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout role="candidate">
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">{error}</p>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="candidate">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ color: textPrimary }}>
              My <span style={{ color: "#4F46E5" }}>Profile</span>
            </h1>
            <p className="mt-2" style={{ color: textSecondary }}>
              Manage your personal information and preferences
            </p>
          </div>
          <Button
            onClick={() => (isEditing ? saveProfile() : setIsEditing(true))}
            className={isEditing
              ? "bg-indigo-600 text-white hover:bg-indigo-700"
              : "border text-slate-700"}
            style={isEditing ? undefined : { borderColor, backgroundColor: cardBg, color: textSecondary }}
          >
            {isEditing ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Save Changes
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit Profile
              </span>
            )}
          </Button>
        </div>

        <Card className="border shadow-[0_4px_16px_rgba(0,0,0,0.04)]" style={{ borderColor, backgroundColor: cardBg }}>
          <CardHeader>
            <CardTitle className="text-[22px] font-semibold" style={{ color: textPrimary }}>Personal Information</CardTitle>
            <CardDescription style={{ color: textSecondary }}>Your basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label style={{ color: textPrimary }}>Full Name</Label>
                <Input
                  value={profile.name}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  className="rounded-lg border text-slate-900"
                  style={{ borderColor, backgroundColor: cardBg, color: textPrimary }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ color: textPrimary }}>Email</Label>
                <Input value={profile.email} disabled className="rounded-lg border text-slate-900" style={{ borderColor, backgroundColor: cardBg, color: textPrimary }} />
              </div>

              <div className="space-y-2">
                <Label style={{ color: textPrimary }}>Phone</Label>
                <Input
                  value={profile.phone}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                  className="rounded-lg border text-slate-900"
                  style={{ borderColor, backgroundColor: cardBg, color: textPrimary }}
                />
              </div>

              <div className="space-y-2">
                <Label style={{ color: textPrimary }}>Location</Label>
                <Input
                  value={profile.location}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                  className="rounded-lg border text-slate-900"
                  style={{ borderColor, backgroundColor: cardBg, color: textPrimary }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label style={{ color: textPrimary }}>Bio</Label>
              <Textarea
                rows={3}
                value={profile.bio}
                disabled={!isEditing}
                onChange={(e) =>
                  setProfile({ ...profile, bio: e.target.value })
                }
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-[0_4px_16px_rgba(0,0,0,0.04)]" style={{ borderColor, backgroundColor: cardBg }}>
          <CardHeader>
            <CardTitle className="text-[22px] font-semibold" style={{ color: textPrimary }}>Skills</CardTitle>
            <CardDescription style={{ color: textSecondary }}>Your technical skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full border px-4 py-1.5 text-sm font-medium transition-all"
                  style={{ borderColor, backgroundColor: isDark ? "#0F172A" : "#F8FAFC", color: textPrimary }}
                >
                  <span style={{ color: "#4F46E5" }}>●</span>
                  {skill}
                  {isEditing && (
                    <button
                      onClick={() => removeSkill(skill)}
                      className="ml-1 text-red-500 hover:text-red-700 font-bold transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </span>
              ))}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addSkill()}
                  className="rounded-lg border text-slate-900"
                  style={{ borderColor, backgroundColor: cardBg, color: textPrimary }}
                />
                <Button onClick={addSkill} className="bg-indigo-600 text-white hover:bg-indigo-700">Add</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
