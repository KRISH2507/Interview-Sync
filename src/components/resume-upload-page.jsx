import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { uploadResume } from "../services/api";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

import DashboardLayout from "./dashboard-layout";

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // ✅ Frontend validation
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      alert("Only PDF or DOCX files are allowed");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      alert("File size must be under 5MB");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a resume file first");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    let interval;

    try {
      // 🔄 Fake progress (safe)
      interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? prev : prev + 10));
      }, 150);

      const formData = new FormData();
      formData.append("resume", file);
      formData.append("name", "Krish");
      formData.append("email", "krish@test.com");

      const res = await uploadResume(formData);

      clearInterval(interval);
      setUploadProgress(100);

      // Save userId for interview flow
      localStorage.setItem("userId", res.data.userId);

      setTimeout(() => {
        setIsUploading(false);
        navigate("/practice");
      }, 400);
    } catch (err) {
      clearInterval(interval);
      setIsUploading(false);
      setUploadProgress(0);

      console.error(err);

      alert(
        err.response?.data?.message ||
          "Resume upload failed. Please try again."
      );
    }
  };

  return (
    <DashboardLayout role="candidate">
      <div className="mx-auto max-w-2xl space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Upload Resume
          </h1>
          <p className="mt-2 text-muted-foreground">
            Upload your resume to get personalized interview preparation
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Resume Upload</CardTitle>
            <CardDescription>
              Supported formats: PDF, DOCX (Max size: 5MB)
            </CardDescription>
          </CardHeader>

          <CardContent>
            {!isUploading ? (
              <>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx"
                  className="hidden"
                  onChange={handleFileSelect}
                />

                <div
                  onClick={() => fileInputRef.current.click()}
                  className="flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card hover:border-primary/50 hover:bg-muted/50"
                >
                  <p className="text-sm font-medium text-foreground">
                    {file ? file.name : "Click to select resume"}
                  </p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    PDF or DOCX
                  </p>
                </div>

                <button
                  onClick={handleUpload}
                  className="mt-4 w-full rounded-lg bg-primary py-2 text-primary-foreground"
                >
                  Upload & Analyze
                </button>
              </>
            ) : (
              <div className="space-y-4 py-8">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted border-t-primary" />
                  <p className="text-sm font-medium">
                    Uploading and analyzing your resume…
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {uploadProgress}%
                  </p>
                </div>

                <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
