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

  // =========================
  // GOOGLE SIGN-IN SETUP
  // =========================
  useEffect(() => {
    /* global google */
    if (window.google) {
      google.accounts.id.initialize({
        client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
        callback: handleGoogleLogin,
      });

      google.accounts.id.renderButton(
        document.getElementById("google-btn"),
        {
          theme: "outline",
          size: "large",
          width: "100%",
          shape: "pill"
        }
      );
    }
  }, [isLogin]); // Re-render button when mode changes

  const handleGoogleLogin = async (response) => {
    try {
      const res = await api.post("/auth/google", {
        credential: response.credential,
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);

      navigate("/candidate/dashboard");
    } catch (err) {
      console.error("Google login failed", err);
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
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0f] p-4 relative overflow-hidden">
      {/* Background Ambience */}
      <FloatingOrb color="purple" size="lg" className="-top-20 -right-20" />
      <FloatingOrb color="royal" size="md" className="bottom-0 left-0" delay={2} />
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-royal-500 to-purple-600 shadow-glow transition-transform group-hover:scale-110">
              <span className="font-mono text-xl font-bold text-white">
                IS
              </span>
            </div>
            <span className="text-3xl font-bold tracking-tight">
              <GradientText variant="royal">InterviewSync</GradientText>
            </span>
          </Link>
        </div>

        <GlassCard className="overflow-hidden border-2 border-white/5 backdrop-blur-xl">
          <div className="p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-bold tracking-tight text-white">
                {isLogin ? "Welcome back" : "Create account"}
              </h2>
              <p className="mt-2 text-muted-foreground">
                {isLogin
                  ? "Sign in to access your dashboard"
                  : "Start your journey to interview mastery"}
              </p>
            </div>

            {/* ===== GOOGLE SIGN-IN BUTTON ===== */}
            <div className="mb-6">
              <div id="google-btn" className="w-full" />
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[#12121a] px-2 text-muted-foreground">
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
                      className="bg-slate-900/50 border-white/10 focus:border-royal-500/50 focus:ring-royal-500/20"
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
                  className="bg-slate-900/50 border-white/10 focus:border-royal-500/50 focus:ring-royal-500/20"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  {isLogin && (
                    <a href="#" className="text-xs text-royal-400 hover:text-royal-300">
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
                  className="bg-slate-900/50 border-white/10 focus:border-royal-500/50 focus:ring-royal-500/20"
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
                      <Button
                        type="button"
                        variant="ghost"
                        className={`h-auto p-4 border transition-all ${role === "candidate"
                            ? "border-royal-500 bg-royal-500/10 text-white shadow-glow"
                            : "border-white/10 bg-slate-900/50 text-muted-foreground hover:bg-slate-800"
                          }`}
                        onClick={() => setRole("candidate")}
                      >
                        <div className="text-left">
                          <div className="text-sm font-semibold">Candidate</div>
                          <div className="mt-1 text-xs opacity-70">
                            Looking for jobs
                          </div>
                        </div>
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        className={`h-auto p-4 border transition-all ${role === "recruiter"
                            ? "border-royal-500 bg-royal-500/10 text-white shadow-glow"
                            : "border-white/10 bg-slate-900/50 text-muted-foreground hover:bg-slate-800"
                          }`}
                        onClick={() => setRole("recruiter")}
                      >
                        <div className="text-left">
                          <div className="text-sm font-semibold">Recruiter</div>
                          <div className="mt-1 text-xs opacity-70">
                            Hiring talent
                          </div>
                        </div>
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-royal-600 to-purple-600 hover:from-royal-500 hover:to-purple-500 text-white shadow-lg shadow-royal-500/25 h-11 mt-4"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Please wait...
                  </div>
                ) : (
                  isLogin ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-muted-foreground">
                {isLogin ? "New to InterviewSync? " : "Already have an account? "}
              </span>
              <button
                type="button"
                className="font-semibold text-royal-400 hover:text-royal-300 transition-colors"
                onClick={() => setIsLogin(!isLogin)}
              >
                {isLogin ? "Create an account" : "Sign in"}
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Footer simple links */}
        <div className="mt-8 flex justify-center gap-6 text-xs text-muted-foreground">
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Help</a>
        </div>
      </div>
    </div>
  );
}
