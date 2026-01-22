import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ThemeToggle } from "./ui/theme-toggle";
import { GradientText } from "./ui/gradient-text";
import { FloatingOrb } from "./ui/floating-orb";
import { GlassCard } from "./ui/glass-card";
import { ScrollReveal } from "./animations/scroll-reveal";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden relative">
      {/* Floating Background Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <FloatingOrb color="royal" size="xl" delay={0} className="top-0 left-0" />
        <FloatingOrb color="indigo" size="lg" delay={2} className="top-1/4 right-0" />
        <FloatingOrb color="emerald" size="md" delay={4} className="bottom-1/4 left-1/4" />
        <FloatingOrb color="gold" size="sm" delay={6} className="bottom-0 right-1/4" />
      </div>

      {/* ================= HEADER / NAVBAR ================= */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-royal font-bold text-white shadow-glow"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              IS
            </motion.div>
            <span className="text-xl font-bold">
              Interview<GradientText>Sync</GradientText>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#how" className="text-muted-foreground hover:text-foreground transition-colors">
              How it works
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </a>
          </nav>

          {/* Auth Buttons + Theme Toggle */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight max-w-5xl mx-auto">
              Ace your next interview with AI-powered preparation
            </h1>

            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              InterviewSync analyzes your resume, identifies key skills, and
              generates personalized interview questions with instant feedback.
            </p>

            <div className="mt-10 flex flex-wrap gap-4 justify-center">
              <Link to="/auth">
                <Button size="xl" className="group">
                  Start Practicing
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Button>
              </Link>

              <Button variant="glass" size="xl">
                Watch Demo
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <ScrollReveal variant="fadeUp">
        <section className="border-y border-border bg-gradient-to-b from-transparent via-primary/5 to-transparent">
          <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-6 py-16 md:grid-cols-4">
            {[
              ["10K+", "Active Users"],
              ["50K+", "Practice Sessions"],
              ["95%", "Success Rate"],
              ["4.9/5", "User Rating"],
            ].map(([value, label], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl font-bold">
                  <GradientText>{value}</GradientText>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">{label}</div>
              </motion.div>
            ))}
          </div>
        </section>
      </ScrollReveal>

      {/* ================= FEATURES ================= */}
      <section id="features" className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal variant="fadeUp" className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold">
              Powerful <GradientText>Features</GradientText>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to prepare, practice, and succeed in your interviews.
            </p>
          </ScrollReveal>

          <div className="mt-16 grid gap-8 md:grid-cols-3">
            {[
              {
                title: "Resume Analysis",
                desc: "Upload your resume and extract key skills automatically with AI.",
                icon: "📄",
                gradient: "royal"
              },
              {
                title: "AI Interview Questions",
                desc: "Get personalized questions based on your unique skill set.",
                icon: "🤖",
                gradient: "emerald"
              },
              {
                title: "Performance Tracking",
                desc: "Track your progress and improvement over time with detailed analytics.",
                icon: "📊",
                gradient: "gold"
              },
            ].map((feature, i) => (
              <ScrollReveal key={feature.title} variant="fadeUp" delay={i * 0.2}>
                <GlassCard className="h-full group">
                  <div className="text-5xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold mb-3">
                    <GradientText gradient={feature.gradient}>{feature.title}</GradientText>
                  </h3>
                  <p className="text-muted-foreground">{feature.desc}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how" className="px-6 py-32 bg-gradient-to-b from-transparent via-primary/5 to-transparent">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal variant="fadeUp" className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold">
              How it <GradientText>Works</GradientText>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A simple and effective 4-step process
            </p>
          </ScrollReveal>

          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {[
              { step: "1", title: "Upload Resume", icon: "⬆️" },
              { step: "2", title: "Analyze Skills", icon: "🔍" },
              { step: "3", title: "Practice Interviews", icon: "💬" },
              { step: "4", title: "Get Feedback", icon: "✨" },
            ].map((item, i) => (
              <ScrollReveal key={item.step} variant="scaleIn" delay={i * 0.15}>
                <GlassCard className="text-center">
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <div className="text-3xl font-bold mb-2">
                    <GradientText>{item.step}</GradientText>
                  </div>
                  <p className="font-semibold">{item.title}</p>
                </GlassCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="pricing" className="px-6 py-32">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal variant="fadeUp" className="text-center">
            <h2 className="text-4xl md:text-5xl font-bold">
              Simple <GradientText>Pricing</GradientText>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the plan that works for you
            </p>
          </ScrollReveal>

          <div className="mt-16 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <ScrollReveal variant="fadeLeft">
              <GlassCard className="h-full">
                <h3 className="text-2xl font-bold">Free</h3>
                <p className="mt-2 text-muted-foreground">Basic interview practice</p>
                <p className="mt-6 text-5xl font-bold">
                  <GradientText>₹0</GradientText>
                </p>
                <Button variant="outline" className="w-full mt-6">Get Started</Button>
              </GlassCard>
            </ScrollReveal>

            <ScrollReveal variant="fadeRight">
              <GlassCard className="h-full border-2 border-primary/50 shadow-glow">
                <div className="inline-block px-3 py-1 rounded-full bg-gradient-royal text-white text-xs font-bold mb-4">
                  POPULAR
                </div>
                <h3 className="text-2xl font-bold">Pro</h3>
                <p className="mt-2 text-muted-foreground">
                  AI feedback & advanced analytics
                </p>
                <p className="mt-6 text-5xl font-bold">
                  <GradientText>₹299</GradientText>
                  <span className="text-lg text-muted-foreground">/mo</span>
                </p>
                <Button className="w-full mt-6">Upgrade Now</Button>
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <ScrollReveal variant="scaleIn">
        <section className="px-6 py-32">
          <GlassCard className="mx-auto max-w-4xl p-16 text-center shadow-glow-lg">
            <h2 className="text-4xl md:text-5xl font-bold">
              Ready to ace your <GradientText>interview</GradientText>?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of candidates improving their interview skills.
            </p>

            <div className="mt-8">
              <Link to="/auth">
                <Button size="xl">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </GlassCard>
        </section>
      </ScrollReveal>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        © 2025 InterviewSync. All rights reserved.
      </footer>
    </div>
  );
}
