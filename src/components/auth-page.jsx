import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  getApiErrorMessage,
  getCurrentUser,
  getGoogleOAuthStartUrl,
  loginUser,
  sendRegistrationOtp,
  verifyRegistrationOtp,
} from "../services/api";
import { useTheme } from "../contexts/theme-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ThemeToggle } from "./ui/theme-toggle";

function normalizeUserRole(role) {
  const normalized = String(role || "candidate").trim().toLowerCase();
  return normalized === "recruiter" ? "recruiter" : "candidate";
}

function getRedirectRouteByRole(role) {
  const normalizedRole = normalizeUserRole(role);
  return normalizedRole === "recruiter" ? "/admin/dashboard" : "/candidate/dashboard";
}

export default function AuthPage() {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isDark = theme === "dark";
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("candidate");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");
  const [authChecking, setAuthChecking] = useState(true);

  // OTP state
  const [otpStep, setOtpStep] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [otpSentMessage, setOtpSentMessage] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [pendingUserData, setPendingUserData] = useState(null);
  const otpRefs = useRef([]);

  const pageBg = isDark
    ? "linear-gradient(180deg, #0F172A 0%, #111827 100%)"
    : "linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)";
  const cardBg = isDark ? "#111827" : "#FFFFFF";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const textPrimary = isDark ? "#F1F5F9" : "#0F172A";
  const textSecondary = isDark ? "#CBD5E1" : "#475569";

  useEffect(() => {
    let mounted = true;

    const finishWithRedirect = async (fallbackRole = "") => {
      try {
        const user = await getCurrentUser();
        if (!mounted || !user) return;
        navigate(getRedirectRouteByRole(user.role), { replace: true });
      } catch {
        if (!mounted) return;
        if (fallbackRole) {
          navigate(getRedirectRouteByRole(fallbackRole), { replace: true });
        }
      }
    };

    const run = async () => {
      setAuthChecking(true);

    const params = new URLSearchParams(window.location.search);
    const roleFromQuery = params.get("role");
    const googleErrorFromQuery = params.get("google_error");
    const hasGoogleCallbackQuery =
      params.has("token") || params.has("userId") || params.has("role") || params.has("google_error");

    if (googleErrorFromQuery) {
      setGoogleError(googleErrorFromQuery);
      window.history.replaceState({}, "", window.location.pathname);
      if (mounted) {
        setAuthChecking(false);
      }
      return;
    }

    if (hasGoogleCallbackQuery) {
      window.history.replaceState({}, "", window.location.pathname);
      await finishWithRedirect(normalizeUserRole(roleFromQuery));
      if (mounted) {
        setAuthChecking(false);
      }
      return;
    }

    try {
      const user = await getCurrentUser();
      if (mounted && user) {
        navigate(getRedirectRouteByRole(user.role), { replace: true });
      }
    } catch {
      // user is not logged in yet
    } finally {
      if (mounted) {
        setAuthChecking(false);
      }
    }
    };

    run();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  // ── OTP helpers ──────────────────────────────────────────────────────────────
  const startResendCooldown = (seconds = 60) => {
    setResendCooldown(seconds);
    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join("");
    if (otp.length !== 6) { setOtpError("Please enter all 6 digits."); return; }
    setOtpLoading(true);
    try {
      const res = await verifyRegistrationOtp({
        email: pendingUserData?.email,
        otp,
      });

      const user = res?.data?.data?.user || res?.data?.user || (await getCurrentUser());
      const redirectRoute = getRedirectRouteByRole(user?.role);
      navigate(redirectRoute);
    } catch (err) {
      setOtpError(getApiErrorMessage(err, "Registration failed. Please try again."));
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const response = await sendRegistrationOtp(pendingUserData);
      setOtpDigits(["", "", "", "", "", ""]);
      setOtpError("");
      setOtpSentMessage(response.data?.message || "A new OTP has been sent to your email.");
      startResendCooldown(response.data?.resendAfter || 60);
      otpRefs.current[0]?.focus();
    } catch (err) {
      console.error("[OTP] Resend OTP error:", err);
      const msg = err?.response?.data?.message || err?.message || "Failed to resend OTP. Please try again.";
      setOtpError(msg);
    }
  };

  const handleOtpDigitChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);
    setOtpError("");
    if (value && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) {
      const newDigits = ["", "", "", "", "", ""];
      pasted.split("").forEach((char, i) => { if (i < 6) newDigits[i] = char; });
      setOtpDigits(newDigits);
      otpRefs.current[Math.min(pasted.length, 5)]?.focus();
    }
  };
  // ─────────────────────────────────────────────────────────────────────────────

  const handleGoogleLogin = () => {
    if (googleLoading) return;

    setGoogleLoading(true);
    setGoogleError("");

    window.location.href = getGoogleOAuthStartUrl();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    setFormError("");
    try {
      if (!isLogin) {
        const response = await sendRegistrationOtp({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role,
        });

        setPendingUserData({ ...formData, role });
        setOtpSentMessage(response.data?.message || `OTP sent to ${formData.email}. Check your inbox.`);
        setOtpStep(true);
        startResendCooldown(response.data?.resendAfter || 60);
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        const res = await loginUser({
          email: formData.email,
          password: formData.password,
        });
        const user = res?.data?.data?.user || res?.data?.user || (await getCurrentUser());
        const redirectRoute = getRedirectRouteByRole(user?.role);
        navigate(redirectRoute);
      }
    } catch (err) {
      console.error("[Auth] Error:", err);
      const message = getApiErrorMessage(err, "Something went wrong. Please try again.");

      if (!isLogin) {
        const normalizedMessage = String(message || "").toLowerCase();
        if (normalizedMessage.includes("already exists")) {
          setIsLogin(true);
          setOtpStep(false);
          setPendingUserData(null);
          setOtpDigits(["", "", "", "", "", ""]);
          setFormError(message);
          return;
        }
      }

      setFormError(message);
    } finally {
      setLoading(false);
    }
  };

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ background: pageBg }}>
        <div className="flex items-center gap-3 text-sm" style={{ color: textSecondary }}>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
          Verifying session...
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center p-4"
      style={{ background: pageBg }}
    >
      <div className="absolute right-4 top-4 z-20">
        <ThemeToggle />
      </div>
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link to="/" className="inline-flex items-center gap-3">
            <div
              className="flex h-11 w-11 items-center justify-center rounded-xl text-lg font-bold text-white"
              style={{ background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)" }}
            >
              IS
            </div>
            <span className="text-4xl font-bold tracking-tight" style={{ color: textPrimary }}>
              Interview<span style={{ color: "#4F46E5" }}>Sync</span>
            </span>
          </Link>
        </div>

        <div
          className="overflow-hidden rounded-[14px] border bg-white shadow-sm"
          style={{ borderColor, boxShadow: "0 6px 20px rgba(0,0,0,0.05)", backgroundColor: cardBg }}
        >
          <div className="p-8">
            {/* ── Title ──────────────────────────────────────────────── */}
            <motion.div
              className="mb-8 text-center"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2
                className="text-5xl font-bold tracking-tight"
                style={{ fontSize: "56px", lineHeight: 1.05, color: textPrimary }}
              >
                {otpStep ? (
                  <>
                    Verify <span style={{ color: "#4F46E5" }}>email</span>
                  </>
                ) : isLogin ? (
                  <>
                    Welcome <span style={{ color: "#4F46E5" }}>back</span>
                  </>
                ) : (
                  <>
                    Create <span style={{ color: "#4F46E5" }}>account</span>
                  </>
                )}
              </h2>
              <p className="mt-3 text-base" style={{ color: textSecondary, fontSize: "18px" }}>
                {otpStep
                  ? `We sent a 6-digit code to ${pendingUserData?.email}`
                  : isLogin
                  ? "Sign in to access your dashboard"
                  : "Start your journey to interview mastery"}
              </p>
            </motion.div>

            {/* ── Google button + OR divider (hidden during OTP step) ── */}
            {!otpStep && (
              <>
                <div className="mb-6">
                  {googleLoading && (
                    <div
                      className="flex items-center justify-center rounded-lg border p-3"
                      style={{ backgroundColor: "#EEF2FF", borderColor: "#C7D2FE" }}
                    >
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                      <span className="text-sm text-indigo-700">Signing in with Google...</span>
                    </div>
                  )}
                  {!googleLoading && (
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 w-full rounded-full border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                      onClick={handleGoogleLogin}
                    >
                      <span className="mr-2">🔐</span>
                      Continue with Google
                    </Button>
                  )}
                </div>

                {googleError && !googleLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                  >
                    {googleError}
                  </motion.div>
                )}

                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" style={{ borderColor: "#E2E8F0" }} />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span
                      className="px-2"
                      style={{ color: isDark ? "#94A3B8" : "#64748B", backgroundColor: cardBg }}
                    >
                      Or continue with
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* ── OTP step / Normal form ─────────────────────────────── */}
            <AnimatePresence mode="wait">
              {otpStep ? (
                <motion.div
                  key="otp-step"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Success message */}
                  {otpSentMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700 text-center"
                    >
                      {otpSentMessage}
                    </motion.div>
                  )}

                  {/* 6-digit input boxes */}
                  <div className="flex justify-center gap-3">
                    {otpDigits.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        className="h-14 w-12 rounded-xl border-2 text-center text-xl font-bold transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        style={{
                          borderColor: otpError ? "#EF4444" : digit ? "#4F46E5" : borderColor,
                          backgroundColor: cardBg,
                          color: textPrimary,
                        }}
                      />
                    ))}
                  </div>

                  {otpError && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-center text-sm text-red-500"
                    >
                      {otpError}
                    </motion.p>
                  )}

                  <Button
                    type="button"
                    className="h-11 w-full rounded-[10px] text-white shadow-sm transition-all duration-200 hover:shadow-md"
                    style={{ backgroundColor: "#4F46E5" }}
                    onClick={handleVerifyOtp}
                    disabled={otpLoading}
                  >
                    {otpLoading ? (
                      <div className="flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Verifying...
                      </div>
                    ) : (
                      "Verify OTP"
                    )}
                  </Button>

                  <div className="text-center text-sm">
                    <span style={{ color: textSecondary }}>Didn&apos;t receive the code? </span>
                    <button
                      type="button"
                      className="font-semibold transition-colors"
                      style={{
                        color: resendCooldown > 0 ? textSecondary : "#4F46E5",
                        cursor: resendCooldown > 0 ? "not-allowed" : "pointer",
                      }}
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0}
                    >
                      {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : "Resend OTP"}
                    </button>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm transition-colors"
                      style={{ color: textSecondary }}
                      onClick={() => {
                        setOtpStep(false);
                        setOtpDigits(["", "", "", "", "", ""]);
                        setOtpError("");
                        setOtpSentMessage("");
                      }}
                    >
                      ← Back to registration
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="auth-form" initial={{ opacity: 1 }} animate={{ opacity: 1 }}>
                  {/* Form-level error */}
                  {formError && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mb-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600"
                    >
                      {formError}
                    </motion.div>
                  )}

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
                            className="h-11 rounded-[10px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
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
                        className="h-11 rounded-[10px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        {isLogin && (
                          <a
                            href="#"
                            className="text-xs transition-colors"
                            style={{ color: "#64748B" }}
                          >
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
                        className="h-11 rounded-[10px] border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"
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
                                className={`h-auto w-full border-2 p-4 transition-all ${
                                  role === "candidate"
                                    ? "border-indigo-500 bg-indigo-50 text-slate-900"
                                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                }`}
                                onClick={() => setRole("candidate")}
                              >
                                <div className="text-left w-full">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">👤</span>
                                    <div className="text-sm font-semibold">Candidate</div>
                                  </div>
                                  <div className="mt-1 text-xs opacity-70">Looking for jobs</div>
                                </div>
                              </Button>
                            </motion.div>

                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                              <Button
                                type="button"
                                variant="ghost"
                                className={`h-auto w-full border-2 p-4 transition-all ${
                                  role === "recruiter"
                                    ? "border-indigo-500 bg-indigo-50 text-slate-900"
                                    : "border-slate-200 bg-white text-slate-500 hover:bg-slate-50"
                                }`}
                                onClick={() => setRole("recruiter")}
                              >
                                <div className="text-left w-full">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">💼</span>
                                    <div className="text-sm font-semibold">Recruiter</div>
                                  </div>
                                  <div className="mt-1 text-xs opacity-70">Hiring talent</div>
                                </div>
                              </Button>
                            </motion.div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      className="mt-4 h-11 w-full rounded-[10px] text-white shadow-sm transition-all duration-200 hover:shadow-md"
                      style={{ backgroundColor: "#4F46E5" }}
                      disabled={loading}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          {isLogin ? "Signing in..." : "Sending OTP..."}
                        </div>
                      ) : (
                        <span className="flex items-center gap-2">
                          {isLogin ? "Sign In" : "Continue"}
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 7l5 5m0 0l-5 5m5-5H6"
                            />
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
                      className="font-semibold transition-colors"
                      style={{ color: "#4F46E5" }}
                      onClick={() => setIsLogin(!isLogin)}
                    >
                      {isLogin ? "Create an account" : "Sign in"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-6 text-xs" style={{ color: "#64748B" }}>
          <a href="#" className="transition-colors hover:text-slate-900">Privacy Policy</a>
          <a href="#" className="transition-colors hover:text-slate-900">Terms of Service</a>
          <a href="#" className="transition-colors hover:text-slate-900">Help</a>
        </div>
      </div>
    </div>
  );
}
