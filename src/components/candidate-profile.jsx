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

import DashboardLayout from "./dashboard-layout";

function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={`w-full rounded-md border border-border bg-background p-2 text-foreground ${className}`}
      {...props}
    />
  );
}

export default function CandidateProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        setProfile({
          ...profile,
          ...res.data,
          skills: res.data.skills || [],
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
            <h1 className="text-3xl font-bold">
              My <span className="bg-gradient-to-r from-royal-600 to-purple-600 bg-clip-text text-transparent">Profile</span>
            </h1>
            <p className="mt-2 text-muted-foreground">
              Manage your personal information and preferences
            </p>
          </div>
          <Button
            onClick={() => (isEditing ? saveProfile() : setIsEditing(true))}
            className={isEditing ? "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/20" : ""}
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

        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Your basic details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input
                  value={profile.name}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={profile.email} disabled />
              </div>

              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={profile.phone}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setProfile({ ...profile, phone: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  value={profile.location}
                  disabled={!isEditing}
                  onChange={(e) =>
                    setProfile({ ...profile, location: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
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

        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
            <CardDescription>Your technical skills</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 rounded-full border-2 border-royal-500/30 bg-gradient-to-r from-royal-500/10 to-purple-500/10 px-4 py-1.5 text-sm font-medium text-foreground hover:border-royal-500/50 hover:shadow-md transition-all"
                >
                  <span className="text-royal-600 dark:text-royal-400">●</span>
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
                />
                <Button onClick={addSkill}>Add</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
