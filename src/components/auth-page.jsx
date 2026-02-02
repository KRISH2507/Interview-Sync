import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import api from "../services/api";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { GlassCard } from "./ui/glass-card";
import { FloatingOrb } from "./ui/floating-orb";
import { GradientText } from "./ui/gradient-text";

export default function AuthPage() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("candidate");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  // =========================
  // GOOGLE SIGN-IN SETUP
  // =========================
  useEffect(() => {
    /* global google */
    const initGoogleSignIn = async () => {
      try {
        // Wait for google library to load
        let attempts = 0;
        while (!window.google && attempts < 20) {
          await new Promise((resolve) => setTimeout(resolve, 250));
          attempts++;
        }

        if (!window.google) {
          console.error("Google Sign-in library failed to load");
          setGoogleError("Google Sign-in temporarily unavailable");
          return;
        }

        if (!import.meta.env.VITE_GOOGLE_CLIENT_ID) {
          console.error("Google Client ID not configured");
          setGoogleError("Google Sign-in not configured");
          return;
        }

        // Initialize Google Sign-In
        google.accounts.id.initialize({
          client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
          callback: handleGoogleLogin,
        });

        // Render the button
        const googleBtnElement = document.getElementById("google-btn");
        if (googleBtnElement) {
          // Clear previous button if exists
          googleBtnElement.innerHTML = "";
          
          google.accounts.id.renderButton(googleBtnElement, {
            theme: "outline",
            size: "large",
            width: "100%",
            shape: "pill",
            text: "signin_with",
          });
        }
      } catch (error) {
        console.error("Google Sign-in initialization error:", error);
        setGoogleError("Google Sign-in is not available");
      }
    };

    initGoogleSignIn();
  }, [isLogin]); // Re-render button when mode changes

  const handleGoogleLogin = async (response) => {
    // Prevent multiple simultaneous requests
    if (googleLoading) return;

    // Validate response
    if (!response || !response.credential) {
      console.error("Invalid Google response");
      setGoogleError("Failed to get Google credentials");
      return;
    }

    setGoogleLoading(true);
    setGoogleError("");

    try {
      const res = await api.post("/auth/google", {
        credential: response.credential,
      });

      // Validate response data
      if (!res.data || !res.data.token) {
        throw new Error("Invalid response from server");
      }

      // Store authentication data safely
      localStorage.setItem("token", res.data.token);
      if (res.data.user?.id) {
        localStorage.setItem("userId", res.data.user.id);
      }

      // Determine route based on user role
      const redirectRoute =
        res.data.user?.role === "recruiter"
          ? "/recruiter/dashboard"
          : "/candidate/dashboard";

      // Use a small delay to ensure state updates complete
      setTimeout(() => {
        navigate(redirectRoute);
      }, 100);
    } catch (err) {
      console.error("Google login failed:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Google Sign-in failed. Please try again.";
      setGoogleError(errorMessage);
      setGoogleLoading(false);
    }
  };

  // =========================
  // EMAIL / PASSWORD LOGIN & REGISTER
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? "/auth/login" : "/auth/register";
      const payload = { ...formData };

      // Include role for registration
      if (!isLogin) {
        payload.role = role;
      }

      const res = await api.post(endpoint, payload);

      // Store token
      localStorage.setItem("token", res.data.token);

      // Redirect based on role
      if (role === "candidate") {
        navigate("/candidate/dashboard");
      } else {
        navigate("/recruiter/dashboard");
      }
    } catch (err) {
      console.error("Authentication failed:", err.response?.data?.message || err.message);
      alert(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <FloatingOrb color="primary" size="xl" className="-top-20 -right-20" delay={0} />
      <FloatingOrb color="accent" size="lg" className="bottom-0 left-0" delay={2} />
      <FloatingOrb color="success" size="md" className="top-1/3 -left-10" delay={4} />

      {/* Animated particles */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-primary/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <motion.div
              className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary shadow-glow transition-transform group-hover:scale-110"
              whileHover={{ rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="font-mono text-xl font-bold text-white">
                IS
              </span>
            </motion.div>
            <span className="text-3xl font-bold tracking-tight">
              Interview<GradientText gradient="primary">Sync</GradientText>
            </span>
          </Link>
        </div>

        <GlassCard className="overflow-hidden border border-border backdrop-blur-xl shadow-2xl hover:shadow-glow transition-shadow">
          <div className="p-8">
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-foreground">
                {isLogin ? (
                  <>
                    Welcome <GradientText gradient="primary">back</GradientText>
                  </>
                ) : (
                  <>
                    Create <GradientText gradient="primary">account</GradientText>
                  </>
                )}
              </h2>
              <p className="mt-2 text-muted-foreground text-sm">
                {isLogin
                  ? "Sign in to access your dashboard"
                  : "Start your journey to interview mastery"}
              </p>
            </motion.div>

            {/* ===== GOOGLE SIGN-IN BUTTON ===== */}
            <div className="mb-6">
              {googleLoading && (
                <div className="flex items-center justify-center p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent mr-2" />
                  <span className="text-sm text-blue-600 dark:text-blue-400">
                    Signing in with Google...
                  </span>
                </div>
              )}
              {!googleLoading && (
                <>
                  <div id="google-btn" className="w-full min-h-[40px]" />
                </>
              )}
            </div>

            {/* Google Error Display */}
            {googleError && !googleLoading && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-600 dark:text-red-400 text-sm"
              >
                {googleError}
              </motion.div>
            )}

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 overflow-hidden"
                  >
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required={!isLogin}
                      className="bg-card border-border focus:border-primary/50 focus:ring-primary/20"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  required
                  className="bg-card border-border focus:border-primary/50 focus:ring-primary/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a href="#" className="text-xs text-primary hover:text-primary/80 transition-colors">
                      Forgot password?
                    </a>
                  )}
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  required
                  className="bg-card border-border focus:border-primary/50 focus:ring-primary/20"
                />
              </div>

              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-2 pt-2 overflow-hidden"
                  >
                    <Label>I am a</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          variant="ghost"
                          className={`h-auto p-4 border-2 transition-all w-full ${role === "candidate"
                            ? "border-royal-500 bg-gradient-to-br from-royal-500/20 to-purple-500/20 text-foreground shadow-lg shadow-royal-500/20"
                            : "border-slate-200 dark:border-slate-700 bg-card text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-royal-400/50"
                            }`}
                          onClick={() => setRole("candidate")}
                        >
                          <div className="text-left w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">👤</span>
                              <div className="text-sm font-semibold">Candidate</div>
                            </div>
                            <div className="mt-1 text-xs opacity-70">
                              Looking for jobs
                            </div>
                          </div>
                        </Button>
                      </motion.div>

                      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                        <Button
                          type="button"
                          variant="ghost"
                          className={`h-auto p-4 border-2 transition-all w-full ${role === "recruiter"
                            ? "border-royal-500 bg-gradient-to-br from-royal-500/20 to-purple-500/20 text-foreground shadow-lg shadow-royal-500/20"
                            : "border-slate-200 dark:border-slate-700 bg-card text-muted-foreground hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-royal-400/50"
                            }`}
                          onClick={() => setRole("recruiter")}
                        >
                          <div className="text-left w-full">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">💼</span>
                              <div className="text-sm font-semibold">Recruiter</div>
                            </div>
                            <div className="mt-1 text-xs opacity-70">
                              Hiring talent
                            </div>
                          </div>
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-royal-600 to-purple-600 hover:from-royal-500 hover:to-purple-500 hover:shadow-xl hover:shadow-royal-500/30 text-white shadow-lg shadow-royal-500/20 h-11 mt-4 font-semibold transition-all"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Please wait...
                  </div>
                ) : (
                  <span className="flex items-center gap-2">
                    {isLogin ? "Sign In" : "Create Account"}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "New to InterviewSync? " : "Already have an account? "}
              </span>
              <button
                type="button"
                className="font-semibold text-primary hover:text-primary/80 transition-colors"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Footer simple links */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-foreground transition-colors">Help</a>
        </div>
      </div>
    </div>
  );
}
