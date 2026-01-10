import { Link } from "react-router-dom";
import { Button } from "./ui/button";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* ================= HEADER / NAVBAR ================= */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 font-bold">
              IS
            </div>
            <span className="text-lg font-semibold">InterviewSync</span>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm text-white/70">
            <a href="#features" className="hover:text-white">
              Features
            </a>
            <a href="#how" className="hover:text-white">
              How it works
            </a>
            <a href="#pricing" className="hover:text-white">
              Pricing
            </a>
          </nav>

          {/* Auth Buttons */}
          <div className="flex gap-3">
            <Link to="/auth">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative">
        {/* Glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-[-20%] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-blue-600/30 blur-[120px]" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-32">
          <h1 className="max-w-4xl text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
            Ace your next interview with{" "}
            <span className="text-blue-500">AI-powered</span> preparation
          </h1>

          <p className="mt-6 max-w-2xl text-lg text-white/70">
            InterviewSync analyzes your resume, identifies key skills, and
            generates personalized interview questions with instant feedback.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link to="/auth">
              <Button className="px-8 py-3 text-base">
                Start Practicing
              </Button>
            </Link>

            <Button variant="outline" className="px-8 py-3 text-base">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="border-t border-white/10">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-20 md:grid-cols-4">
          {[
            ["10K+", "Active Users"],
            ["50K+", "Practice Sessions"],
            ["95%", "Success Rate"],
            ["4.9/5", "User Rating"],
          ].map(([value, label]) => (
            <div key={label}>
              <div className="text-4xl font-bold">{value}</div>
              <div className="mt-2 text-sm text-white/60">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="px-6 py-32">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-bold">Features</h2>
          <p className="mt-4 text-white/70">
            Everything you need to prepare, practice, and succeed.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              ["Resume Analysis", "Upload your resume and extract key skills."],
              ["AI Interview Questions", "Personalized questions based on skills."],
              ["Performance Tracking", "Track progress and improvement."],
            ].map(([title, desc]) => (
              <div
                key={title}
                className="rounded-2xl border border-white/10 bg-white/5 p-8"
              >
                <h3 className="text-xl font-semibold">{title}</h3>
                <p className="mt-3 text-sm text-white/60">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="px-6 py-32 bg-white/5">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-bold">How it works</h2>
          <p className="mt-4 text-white/70">
            A simple and effective 4-step process.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {[
              "Upload Resume",
              "Analyze Skills",
              "Practice Interviews",
              "Get Feedback",
            ].map((step, i) => (
              <div key={step} className="rounded-xl border border-white/10 bg-black p-6">
                <div className="text-2xl font-bold text-blue-500">
                  {i + 1}
                </div>
                <p className="mt-3 text-white/70">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="pricing" className="px-6 py-32">
        <div className="mx-auto max-w-7xl text-center">
          <h2 className="text-4xl font-bold">Pricing</h2>
          <p className="mt-4 text-white/70">
            Simple plans for every candidate.
          </p>

          <div className="mt-16 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-8">
              <h3 className="text-xl font-semibold">Free</h3>
              <p className="mt-2 text-white/60">Basic interview practice</p>
              <p className="mt-6 text-4xl font-bold">₹0</p>
            </div>

            <div className="rounded-2xl border border-blue-600 bg-blue-600/10 p-8">
              <h3 className="text-xl font-semibold">Pro</h3>
              <p className="mt-2 text-white/80">
                AI feedback & advanced analytics
              </p>
              <p className="mt-6 text-4xl font-bold">₹299/mo</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="px-6 py-32">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/5 p-16 text-center backdrop-blur">
          <h2 className="text-4xl font-bold">
            Ready to ace your interview?
          </h2>
          <p className="mt-4 text-white/70">
            Join thousands of candidates improving their interview skills.
          </p>

          <div className="mt-8">
            <Link to="/auth">
              <Button className="px-10 py-3 text-base">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-white/10 px-6 py-8 text-center text-sm text-white/50">
        © 2025 InterviewSync. All rights reserved.
      </footer>
    </div>
  );
}
