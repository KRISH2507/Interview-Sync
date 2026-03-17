import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ScrollReveal } from "./animations/scroll-reveal";
import { useTheme } from "../contexts/theme-context";

const platformFeatures = [
  {
    number: "01",
    title: "Project-Based Stack Questions",
    description: "Practice role-focused, scenario-based technical rounds with stack-specific project questions.",
    tag: "Core Module",
  },
  {
    number: "02",
    title: "DSA MCQ Rounds",
    description: "Run timed DSA MCQ tests with topic-based sets to strengthen fundamentals before coding rounds.",
    tag: "Core Module",
  },
  {
    number: "03",
    title: "Compiler Practice Workspace",
    description: "Solve coding prompts inside an integrated compiler flow designed for interview-style problem solving.",
    tag: "Practice Engine",
  },
  {
    number: "04",
    title: "Live Admin Interview Portal",
    description: "One interviewer hosts the video session while candidates answer through a controlled evaluation flow.",
    tag: "Admin Module",
  },
  {
    number: "05",
    title: "Rating, Marks & Final Result",
    description: "Admins review submissions, assign marks, and publish final outcomes directly to candidates.",
    tag: "Evaluation",
  },
  {
    number: "06",
    title: "Lightweight Performance Design",
    description: "Modular architecture keeps the platform fast, maintainable, and optimized as features scale.",
    tag: "Optimization",
  },
];

const workflowSteps = [
  { step: "01", title: "Select Role",     desc: "Choose your target role and tech stack" },
  { step: "02", title: "Take Rounds",     desc: "Project-based and DSA question sets served" },
  { step: "03", title: "Code Solutions",  desc: "Integrated compiler practice workspace" },
  { step: "04", title: "Live Interview",  desc: "Admin-led video session and evaluation" },
  { step: "05", title: "Get Results",     desc: "Scorecards and final outcome delivered" },
];

const visualBoards = [
  {
    title: "Interview Operations",
    image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Coding & Evaluation Workspace",
    image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Focused Candidate Experience",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
];

const C = {
  indigo:      "#4F46E5",
  indigoHover: "#4338CA",
  indigoDark:  "#6366F1",
  violet:      "#7C3AED",
};

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  const bg          = isDark ? "#0F172A"  : "#F8FAFC";
  const cardBg      = isDark ? "#1E293B"  : "#FFFFFF";
  const innerBg     = isDark ? "#0F172A"  : "#F8FAFC";
  const heading     = isDark ? "#F1F5F9"  : "#0F172A";
  const body        = isDark ? "#94A3B8"  : "#475569";
  const muted       = "#64748B";
  const border      = isDark ? "#334155"  : "#E2E8F0";
  const primary     = isDark ? C.indigoDark : C.indigo;
  const cardShadow  = isDark
    ? "0 2px 8px rgba(0,0,0,0.35)"
    : "0 6px 20px rgba(0,0,0,0.05)";
  const cardShadowHover = isDark
    ? "0 8px 24px rgba(0,0,0,0.5)"
    : "0 10px 30px rgba(0,0,0,0.08)";
  const indigoBadgeBg    = isDark ? "rgba(79,70,229,0.12)" : "#EEF2FF";
  const indigoBadgeBorder = isDark ? "#312e81" : "#C7D2FE";

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ backgroundColor: bg, fontFamily: "'Inter', -apple-system, sans-serif" }}
    >
      {/* Soft radial glow */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(79,70,229,0.18) 0%, transparent 60%)"
            : "radial-gradient(ellipse 80% 40% at 50% -10%, rgba(79,70,229,0.07) 0%, transparent 60%)",
        }}
      />

      {/* ── NAVBAR ───────────────────────────────────────── */}
      <header
        className="sticky top-0 z-50 border-b backdrop-blur-md transition-all duration-200"
        style={{
          backgroundColor: isDark ? "rgba(15,23,42,0.92)" : "rgba(255,255,255,0.82)",
          borderColor: border,
          boxShadow: isDark ? "none" : "0 1px 4px rgba(0,0,0,0.04)",
        }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5">
            <div
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${C.indigo} 0%, ${C.violet} 100%)` }}
            >
              IS
            </div>
            <span className="text-[15px] font-semibold tracking-tight" style={{ color: heading }}>
              Interview<span style={{ color: primary }}>Sync</span>
            </span>
          </Link>

          {/* Nav links */}
          <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
            {[["#features", "Features"], ["#workflow", "Workflow"], ["#experience", "Experience"]].map(
              ([href, label]) => (
                <a
                  key={href}
                  href={href}
                  style={{ color: body, transition: "color 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = heading)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = body)}
                >
                  {label}
                </a>
              )
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-all duration-150"
              style={{ borderColor: border, backgroundColor: cardBg, color: body }}
            >
              {isDark ? "🌙 Dark" : "☀️ Light"}
            </button>
            <Link to="/auth">
              <button
                className="h-9 rounded-lg px-4 text-sm font-medium"
                style={{ color: body, transition: "color 0.15s ease" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = heading)}
                onMouseLeave={(e) => (e.currentTarget.style.color = body)}
              >
                Sign In
              </button>
            </Link>
            <Link to="/auth">
              <button
                className="h-9 rounded-lg px-4 text-sm font-semibold text-white"
                style={{
                  backgroundColor: primary,
                  boxShadow: "0 2px 8px rgba(79,70,229,0.25)",
                  transition: "background-color 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.indigoHover)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = primary)}
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────── */}
      <section
        className="px-6 pb-24 pt-20 md:pt-28"
        style={{
          background: isDark
            ? "linear-gradient(180deg, #0F172A 0%, #111827 100%)"
            : "linear-gradient(180deg, #F8FAFC 0%, #EEF2FF 100%)",
        }}
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            {/* Left — cleaner headline + CTA */}
            <ScrollReveal variant="fadeUp" delay={0.05}>
              <div>
                <h1
                  className="font-bold leading-[1.08] tracking-tight"
                  style={{ color: heading, fontSize: "clamp(42px, 5vw, 62px)" }}
                >
                  Crack interviews
                  <span
                    className="block"
                    style={{
                      background: `linear-gradient(135deg, ${C.indigo} 0%, ${C.violet} 100%)`,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    with focused practice
                  </span>
                </h1>

                <p
                  className="mt-5 max-w-lg leading-relaxed"
                  style={{ color: body, fontSize: "17px" }}
                >
                  One workspace for DSA, coding rounds, and live interview evaluation.
                </p>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/auth">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex h-11 items-center gap-2 rounded-[10px] px-6 text-[15px] font-semibold text-white"
                      style={{
                        backgroundColor: primary,
                        boxShadow: "0 4px 14px rgba(79,70,229,0.30)",
                        transition: "background-color 0.15s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = C.indigoHover)}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = primary)}
                    >
                      Start Practice
                      <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                        <path d="M2.5 7.5h10M9 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </motion.button>
                  </Link>
                  <a href="#features">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex h-11 items-center gap-2 rounded-[10px] border px-6 text-[15px] font-medium"
                      style={{
                        borderColor: border,
                        color: body,
                        backgroundColor: cardBg,
                        transition: "border-color 0.15s ease, color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = primary;
                        e.currentTarget.style.color = primary;
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = border;
                        e.currentTarget.style.color = body;
                      }}
                    >
                      Explore Platform
                    </motion.button>
                  </a>
                </div>
              </div>
            </ScrollReveal>

            {/* Right — abstract line structure */}
            <ScrollReveal variant="scaleIn" delay={0.1}>
              <div
                className="relative overflow-hidden rounded-2xl border p-6"
                style={{
                  backgroundColor: cardBg,
                  borderColor: border,
                  boxShadow: isDark
                    ? "0 0 0 1px rgba(99,102,241,0.1), 0 20px 40px rgba(0,0,0,0.35)"
                    : "0 8px 32px rgba(0,0,0,0.07), 0 0 0 1px rgba(79,70,229,0.05)",
                }}
              >
                <div
                  className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full"
                  style={{ background: "radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%)" }}
                />
                <div className="mb-5">
                  <p className="text-xs font-semibold tracking-[0.2em]" style={{ color: muted }}>
                    INTERVIEW FLOW MAP
                  </p>
                </div>
                <svg viewBox="0 0 420 260" className="w-full">
                  <defs>
                    <linearGradient id="heroLine" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor={C.indigo} stopOpacity="0.95" />
                      <stop offset="100%" stopColor={C.violet} stopOpacity="0.9" />
                    </linearGradient>
                  </defs>

                  {[50, 95, 140, 185, 230].map((y) => (
                    <line
                      key={y}
                      x1="20"
                      y1={y}
                      x2="400"
                      y2={y}
                      stroke={isDark ? "rgba(148,163,184,0.24)" : "rgba(100,116,139,0.25)"}
                      strokeWidth="1"
                    />
                  ))}

                  <path d="M30 50 C110 50, 120 140, 195 140 S300 95, 390 185" stroke="url(#heroLine)" strokeWidth="2.8" fill="none" strokeLinecap="round" />
                  <path d="M30 185 C120 185, 140 95, 215 95 S320 140, 390 50" stroke={isDark ? "rgba(99,102,241,0.65)" : "rgba(79,70,229,0.6)"} strokeWidth="2" fill="none" strokeLinecap="round" />

                  {[{ x: 30, y: 50 }, { x: 195, y: 140 }, { x: 390, y: 185 }, { x: 215, y: 95 }, { x: 390, y: 50 }].map((node, idx) => (
                    <g key={`${node.x}-${node.y}-${idx}`}>
                      <circle cx={node.x} cy={node.y} r="6.5" fill={cardBg} stroke={C.indigo} strokeWidth="2.2" />
                      <circle cx={node.x} cy={node.y} r="2.4" fill={C.violet} />
                    </g>
                  ))}
                </svg>

                <div className="mt-4 flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: C.indigo }} />
                  <span className="text-xs" style={{ color: muted }}>
                    Streamlined path from practice to final interview score
                  </span>
                </div>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal variant="fadeUp">
            <div className="mb-14 max-w-2xl">
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                style={{ borderColor: indigoBadgeBorder, backgroundColor: indigoBadgeBg }}
              >
                <span className="text-xs font-semibold" style={{ color: primary }}>02 — MODULES</span>
              </div>
              <h2
                className="font-bold tracking-tight"
                style={{ color: heading, fontSize: "clamp(32px, 4vw, 48px)" }}
              >
                Platform features
              </h2>
              <p className="mt-4 text-lg" style={{ color: body }}>
                Each module is implementation-ready and built for real evaluation workflows.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {platformFeatures.map((feature, index) => (
              <ScrollReveal key={feature.title} variant="fadeUp" delay={index * 0.07}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="flex h-full flex-col rounded-2xl border p-6"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: border,
                    boxShadow: cardShadow,
                    transition: "box-shadow 0.2s ease, border-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = cardShadowHover;
                    e.currentTarget.style.borderColor = isDark
                      ? "rgba(99,102,241,0.45)"
                      : "#C7D2FE";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = cardShadow;
                    e.currentTarget.style.borderColor = border;
                  }}
                >
                  <div className="mb-5 flex items-start justify-between gap-2">
                    <span
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                      style={{ background: `linear-gradient(135deg, ${C.indigo} 0%, ${C.violet} 100%)` }}
                    >
                      {feature.number}
                    </span>
                    <span
                      className="rounded-full border px-2.5 py-1 text-xs font-medium"
                      style={{ borderColor: border, color: muted }}
                    >
                      {feature.tag}
                    </span>
                  </div>
                  <h3 className="font-semibold leading-snug" style={{ color: heading, fontSize: "20px" }}>
                    {feature.title}
                  </h3>
                  <p className="mt-3 flex-1 leading-relaxed" style={{ color: body, fontSize: "15px" }}>
                    {feature.description}
                  </p>
                </motion.div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── WORKFLOW ─────────────────────────────────────── */}
      <section id="workflow" className="px-6 py-24">
        <div
          className="mx-auto max-w-7xl rounded-3xl border p-8 md:p-14"
          style={{
            backgroundColor: cardBg,
            borderColor: border,
            boxShadow: cardShadow,
          }}
        >
          <ScrollReveal variant="fadeUp">
            <div className="mb-12">
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                style={{ borderColor: indigoBadgeBorder, backgroundColor: indigoBadgeBg }}
              >
                <span className="text-xs font-semibold" style={{ color: primary }}>03 — WORKFLOW</span>
              </div>
              <h2
                className="font-bold tracking-tight"
                style={{ color: heading, fontSize: "clamp(32px, 4vw, 48px)" }}
              >
                Evaluation pipeline
              </h2>
              <p className="mt-3 max-w-2xl text-lg" style={{ color: body }}>
                Candidate journey and admin control flow in one coherent, end‑to‑end process.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-4 md:grid-cols-5">
            {workflowSteps.map((item, index) => (
              <ScrollReveal key={item.step} variant="fadeUp" delay={index * 0.07}>
                <div
                  className="flex h-full flex-col rounded-xl border p-5"
                  style={{
                    backgroundColor: innerBg,
                    borderColor: isDark ? "#2D3748" : "#F1F5F9",
                    boxShadow: isDark ? "none" : "0 2px 6px rgba(0,0,0,0.03)",
                  }}
                >
                  <div
                    className="mb-3 inline-flex h-9 w-9 items-center justify-center rounded-lg text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, ${C.indigo} 0%, ${C.violet} 100%)` }}
                  >
                    {item.step}
                  </div>
                  <p className="text-[15px] font-semibold" style={{ color: heading }}>{item.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed" style={{ color: muted }}>{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EXPERIENCE / VISUAL BOARDS ───────────────────── */}
      <section id="experience" className="px-6 py-24">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal variant="fadeUp">
            <div className="mb-14 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5"
                  style={{ borderColor: indigoBadgeBorder, backgroundColor: indigoBadgeBg }}
                >
                  <span className="text-xs font-semibold" style={{ color: primary }}>04 — EXPERIENCE</span>
                </div>
                <h2
                  className="font-bold tracking-tight"
                  style={{ color: heading, fontSize: "clamp(32px, 4vw, 48px)" }}
                >
                  Built for real interviews
                </h2>
              </div>
              <p className="max-w-sm" style={{ color: body, fontSize: "15px" }}>
                Clean, focused UI across all modules — from candidate practice to admin-led live sessions.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3">
            {visualBoards.map((board, index) => (
              <ScrollReveal key={board.title} variant="fadeUp" delay={index * 0.08}>
                <motion.article
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="group overflow-hidden rounded-2xl border"
                  style={{
                    backgroundColor: cardBg,
                    borderColor: border,
                    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
                    transition: "box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 12px 28px rgba(0,0,0,0.10)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.06)";
                  }}
                >
                  <div className="relative overflow-hidden" style={{ height: "220px" }}>
                    <img
                      src={board.image}
                      alt={board.title}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
                      style={{
                        filter: isDark
                          ? "brightness(0.72) contrast(1.05) saturate(0.85)"
                          : "saturate(0.82) contrast(0.97)",
                      }}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background: isDark
                          ? "linear-gradient(to top, rgba(15,23,42,0.65) 0%, transparent 55%)"
                          : "linear-gradient(to top, rgba(15,23,42,0.20) 0%, transparent 55%)",
                      }}
                    />
                  </div>
                  <div
                    className="border-t px-5 py-4"
                    style={{ borderColor: isDark ? "#334155" : "#F1F5F9" }}
                  >
                    <p className="text-xs font-semibold tracking-widest" style={{ color: muted }}>
                      0{index + 1}
                    </p>
                    <p className="mt-1 font-semibold" style={{ color: heading, fontSize: "16px" }}>
                      {board.title}
                    </p>
                  </div>
                </motion.article>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-4">
        <ScrollReveal variant="fadeUp">
          <div
            className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl p-10 text-center text-white md:p-16"
            style={{
              background: `linear-gradient(135deg, ${C.indigo} 0%, ${C.violet} 60%, #9333EA 100%)`,
              boxShadow: "0 20px 60px rgba(79,70,229,0.28)",
            }}
          >
            {/* Decorative blobs */}
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 20%, rgba(255,255,255,0.18) 0%, transparent 45%), radial-gradient(circle at 75% 80%, rgba(255,255,255,0.12) 0%, transparent 45%)",
              }}
            />
            <h2 className="relative text-3xl font-bold tracking-tight md:text-5xl">
              Ready to ace your next interview?
            </h2>
            <p className="relative mx-auto mt-5 max-w-2xl text-lg" style={{ opacity: 0.88 }}>
              Start with the full platform — DSA practice, coding workspace, admin-led sessions,
              and automated scoring in one place.
            </p>
            <div className="relative mt-9 flex flex-wrap justify-center gap-4">
              <Link to="/auth">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex h-12 items-center gap-2 rounded-[10px] bg-white px-8 text-[15px] font-semibold"
                  style={{ color: C.indigo, transition: "opacity 0.15s ease" }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.92")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  Start with InterviewSync
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M2.5 7.5h10M9 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </motion.button>
              </Link>
              <a href="#features">
                <button className="inline-flex h-12 items-center gap-2 rounded-[10px] border border-white/30 bg-white/10 px-8 text-[15px] font-medium text-white backdrop-blur-sm transition-colors duration-150 hover:bg-white/20">
                  View All Features
                </button>
              </a>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="border-t px-6 py-8" style={{ borderColor: border }}>
        <div
          className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 text-sm md:flex-row"
          style={{ color: muted }}
        >
          <div className="flex items-center gap-2">
            <div
              className="flex h-6 w-6 items-center justify-center rounded-md text-[10px] font-bold text-white"
              style={{ background: `linear-gradient(135deg, ${C.indigo} 0%, ${C.violet} 100%)` }}
            >
              IS
            </div>
            <span>InterviewSync</span>
          </div>
          <span>© 2026 InterviewSync · Structured interview preparation platform.</span>
          <nav className="flex gap-6">
            <a href="#features" className="transition-opacity duration-150 hover:opacity-70">Features</a>
            <a href="#workflow" className="transition-opacity duration-150 hover:opacity-70">Workflow</a>
            <Link to="/auth" className="transition-opacity duration-150 hover:opacity-70">Sign In</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
