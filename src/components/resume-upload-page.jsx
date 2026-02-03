import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { uploadResume } from "../services/api";

import { GlassCard } from "./ui/glass-card";
import { Button } from "./ui/button";
import { GradientText } from "./ui/gradient-text";
import { FloatingOrb } from "./ui/floating-orb";
import { CircularProgress } from "./ui/circular-progress";
import DashboardLayout from "./dashboard-layout";

import { fadeUp, scaleIn } from "../utils/animation-variants";

export default function ResumeUploadPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

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

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const selectedFile = e.dataTransfer.files[0];
    validateAndSetFile(selectedFile);
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
      interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) return prev;
          return prev + Math.floor(Math.random() * 10) + 1;
        });
      }, 500);

      const formData = new FormData();
      formData.append("resume", file);

      await uploadResume(formData);

      clearInterval(interval);
      setUploadProgress(100);

      setTimeout(() => {
        setIsUploading(false);
        navigate("/practice");
      }, 800);
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
      <FloatingOrb color="emerald" size="lg" className="top-20 right-20" />
      <FloatingOrb color="royal" size="md" className="bottom-10 left-10" delay={2} />

      <div className="mx-auto max-w-3xl space-y-8 relative z-10">
        <motion.div
          className="text-center space-y-2"
          variants={fadeUp}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-4xl font-bold tracking-tight">
            <GradientText variant="emerald">Upload Your Resume</GradientText>
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            We'll analyze your resume to create a personalized interview practice plan tailored to your profile.
          </p>
        </motion.div>

        <motion.div
          variants={scaleIn}
          initial="initial"
          animate="animate"
          transition={{ delay: 0.2 }}
        >
          <GlassCard className="p-10 relative overflow-hidden">

            <AnimatePresence mode="wait">
              {!isUploading ? (
                <motion.div
                  key="upload-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx"
                    className="hidden"
                    onChange={handleFileSelect}
                  />

                  <motion.div
                    onClick={() => fileInputRef.current.click()}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      relative group cursor-pointer rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300
                      ${isDragging
                        ? "border-emerald-500 bg-emerald-500/10 scale-[1.02]"
                        : "border-slate-700 bg-slate-800/30 hover:border-emerald-500/50 hover:bg-slate-800/50"
                      }
                    `}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div className="flex flex-col items-center gap-4">
                      <div className={`p-4 rounded-full transition-colors ${file ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-emerald-500/10'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                      </div>

                      <div className="space-y-1">
                        <p className="text-lg font-medium text-foreground">
                          {file ? file.name : "Click to upload or drag and drop"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          PDF or DOCX (Max 5MB)
                        </p>
                      </div>

                      {file && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute top-4 right-4 text-emerald-400"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                        </motion.div>
                      )}
                    </div>
                  </motion.div>

                  <div className="flex justify-center">
                    <Button
                      onClick={handleUpload}
                      disabled={!file}
                      size="lg"
                      className={`min-w-[200px] font-semibold transition-all ${file
                          ? "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-lg shadow-emerald-500/20"
                          : ""
                        }`}
                    >
                      {file ? "Analyze Resume" : "Select File"}
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="uploading"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex flex-col items-center justify-center py-12 space-y-8"
                >
                  <div className="relative">
                    <CircularProgress
                      value={uploadProgress}
                      size={120}
                      strokeWidth={8}
                      variant="emerald"
                      showValue={true}
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-0 animate-ping rounded-full bg-emerald-500/10 duration-1000" />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-foreground">Analyzing Profile...</h3>
                    <p className="text-muted-foreground">AI is scanning your resume to generate questions</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

          </GlassCard>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
