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
      {/* Floating Background Orbs - Modern clean aesthetic */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <FloatingOrb color="primary" size="xl" delay={0} className="top-0 left-0" />
        <FloatingOrb color="accent" size="lg" delay={2} className="top-1/4 right-0" />
        <FloatingOrb color="success" size="md" delay={4} className="bottom-1/4 left-1/4" />
        <FloatingOrb color="emerald" size="sm" delay={6} className="bottom-0 right-1/4" />
      </div>

      {/* ================= HEADER / NAVBAR ================= */}
      <header className="sticky top-0 z-50 glass border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <motion.div
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary font-bold text-white shadow-md"
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
            >
              IS
            </motion.div>
            <span className="text-lg font-bold">
              Interview<GradientText gradient="primary">Sync</GradientText>
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
            <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">
              Features
            </a>
            <a href="#how" className="text-muted-foreground hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </a>
          </nav>

          {/* Auth Buttons + Theme Toggle */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link to="/auth">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" variant="default">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SECTION ================= */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-royal-500/5 via-purple-500/5 to-pink-500/5 animate-gradient-xy" />

        {/* Particle effect */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.2, 0.8, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        <div className="mx-auto max-w-7xl px-6 py-20 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Animated badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-block mb-6"
            >
              <div className="px-4 py-2 rounded-full bg-gradient-to-r from-royal-500/10 to-purple-500/10 border border-royal-500/20 backdrop-blur-sm">
                <span className="text-sm font-semibold bg-gradient-to-r from-royal-600 to-purple-600 bg-clip-text text-transparent">
                  ✨ AI-Powered Interview Preparation Platform
                </span>
              </div>
            </motion.div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight max-w-5xl mx-auto">
              Master interviews with{" "}
              <span className="relative inline-block">
                <GradientText gradient="primary">AI-powered practice</GradientText>
                <motion.span
                  className="absolute -bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-royal-500 to-purple-500 rounded-full"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                />
              </span>
            </h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
            >
              Get personalized interview prep. Upload your resume, practice with AI, get instant feedback, and land your dream role.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-10 flex flex-wrap gap-4 justify-center"
            >
              <Link to="/auth">
                <Button size="lg" variant="default" className="group relative overflow-hidden shadow-xl shadow-royal-500/20 hover:shadow-2xl hover:shadow-royal-500/30 transition-all">
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Practice
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 to-royal-600"
                    initial={{ x: "-100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                </Button>
              </Link>

            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Free forever plan</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>10K+ happy users</span>
              </div>
            </motion.div>
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
                  <GradientText gradient="primary">{value}</GradientText>
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
              Powerful <GradientText gradient="accent">Features</GradientText>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to prepare, practice, and succeed in your interviews.
            </p>
          </ScrollReveal>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                title: "Resume Analysis",
                desc: "Upload your resume and extract key skills automatically.",
                icon: "📄",
                color: "from-cyan-500 to-cyan-600"
              },
              {
                title: "AI Interview Questions",
                desc: "Get personalized questions based on your unique skills.",
                icon: "🤖",
                color: "from-teal-500 to-teal-600"
              },
              {
                title: "Instant Feedback",
                desc: "Get real-time AI feedback to improve your performance.",
                icon: "⚡",
                color: "from-violet-500 to-violet-600"
              },
              {
                title: "Analytics Dashboard",
                desc: "Track your progress with detailed performance insights.",
                icon: "📊",
                color: "from-emerald-500 to-emerald-600"
              },
            ].map((feature, i) => (
              <ScrollReveal key={feature.title} variant="fadeUp" delay={i * 0.15}>
                <motion.div
                  whileHover={{ y: -8, scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <GlassCard className="h-full group hover:border-primary/60 transition-all relative overflow-hidden">
                    {/* Hover gradient effect */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                    />

                    <div className="relative z-10">
                      <motion.div
                        className={`inline-block p-3 rounded-lg bg-gradient-to-br ${feature.color} mb-4 shadow-lg`}
                        whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                      >
                        <div className="text-3xl">{feature.icon}</div>
                      </motion.div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">{feature.desc}</p>
                    </div>
                  </GlassCard>
                </motion.div>
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
              How it <GradientText gradient="success">Works</GradientText>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              A simple and effective 4-step process to success
            </p>
          </ScrollReveal>

          <div className="mt-16 grid gap-6 md:grid-cols-4">
            {[
              { step: "01", title: "Upload Resume", desc: "Share your resume", icon: "📤" },
              { step: "02", title: "Analyze Skills", desc: "AI extracts skills", icon: "🔍" },
              { step: "03", title: "Practice", desc: "Answer interview questions", icon: "💬" },
              { step: "04", title: "Improve", desc: "Get AI feedback", icon: "✨" },
            ].map((item, i) => (
              <ScrollReveal key={item.step} variant="fadeUp" delay={i * 0.1}>
                <div className="relative">
                  {i < 3 && <div className="hidden md:block absolute top-1/3 -right-3 w-6 h-0.5 bg-gradient-to-r from-primary to-transparent" />}
                  <GlassCard className="text-center h-full">
                    <div className="text-4xl mb-3">{item.icon}</div>
                    <div className="text-2xl font-bold text-primary mb-1">{item.step}</div>
                    <p className="font-semibold text-foreground">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                  </GlassCard>
                </div>
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
              Simple <GradientText gradient="accent">Pricing</GradientText>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Choose the perfect plan for your interview prep journey
            </p>
          </ScrollReveal>

          <div className="mt-16 grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <ScrollReveal variant="fadeUp">
              <GlassCard className="h-full">
                <h3 className="text-2xl font-bold">Free Plan</h3>
                <p className="mt-2 text-muted-foreground text-sm">Perfect to start</p>
                <p className="mt-6 text-5xl font-bold">
                  <GradientText gradient="primary">$0</GradientText>
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-primary">✓</span> 5 practice sessions
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-primary">✓</span> Basic feedback
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="text-primary">✓</span> Resume analysis
                  </li>
                </ul>
                <Button variant="outline" className="w-full mt-6">Get Started</Button>
              </GlassCard>
            </ScrollReveal>

            <ScrollReveal variant="fadeUp" delay={0.1}>
              <GlassCard className="h-full border-2 border-primary/50 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-primary text-white text-xs font-bold">
                    MOST POPULAR
                  </span>
                </div>
                <h3 className="text-2xl font-bold mt-2">Pro Plan</h3>
                <p className="mt-2 text-muted-foreground text-sm">Advanced features</p>
                <p className="mt-6 text-5xl font-bold">
                  <GradientText gradient="accent">$9.99</GradientText>
                  <span className="text-lg text-muted-foreground font-normal">/month</span>
                </p>
                <ul className="mt-6 space-y-3 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="text-accent">✓</span> Unlimited sessions
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">✓</span> AI feedback
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">✓</span> Performance tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-accent">✓</span> Priority support
                  </li>
                </ul>
                <Button size="default" className="w-full mt-6" variant="default">Upgrade Now</Button>
              </GlassCard>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <ScrollReveal variant="fadeUp">
        <section className="px-6 py-32 bg-gradient-to-b from-transparent via-accent/5 to-transparent">
          <div className="mx-auto max-w-7xl">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold">
                Loved by <GradientText gradient="accent">thousands</GradientText>
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                See what our users have to say about their success
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  name: "Sarah Chen",
                  role: "Software Engineer at Google",
                  content: "InterviewSync helped me land my dream job! The AI-powered questions were spot-on and the feedback was invaluable.",
                  avatar: "👩‍💻",
                  rating: 5
                },
                {
                  name: "Michael Rodriguez",
                  role: "Product Manager at Meta",
                  content: "The practice sessions boosted my confidence tremendously. I went from nervous to prepared in just 2 weeks!",
                  avatar: "👨‍💼",
                  rating: 5
                },
                {
                  name: "Emily Watson",
                  role: "Data Scientist at Amazon",
                  content: "Best interview prep tool I've used. The analytics dashboard helped me identify and improve my weak areas.",
                  avatar: "👩‍🔬",
                  rating: 5
                }
              ].map((testimonial, i) => (
                <ScrollReveal key={testimonial.name} variant="fadeUp" delay={i * 0.1}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <GlassCard className="h-full p-6 hover:border-accent/50 transition-colors">
                      <div className="flex items-center gap-1 mb-4">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <svg key={i} className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <p className="text-foreground mb-6 italic">"{testimonial.content}"</p>
                      <div className="flex items-center gap-3">
                        <div className="text-4xl">{testimonial.avatar}</div>
                        <div>
                          <p className="font-semibold text-foreground">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      </ScrollReveal>

      {/* ================= CTA ================= */}
      <ScrollReveal variant="scaleIn">
        <section className="px-6 py-32">
          <GlassCard className="mx-auto max-w-4xl p-12 md:p-16 text-center shadow-lg hover:shadow-glow transition-shadow relative overflow-hidden">
            {/* Animated background gradient */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-br from-royal-500/10 via-purple-500/10 to-pink-500/10 -z-10"
              animate={{
                backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              }}
              transition={{
                duration: 10,
                repeat: Infinity,
                ease: "linear"
              }}
            />

            <h2 className="text-4xl md:text-5xl font-bold leading-tight">
              Ready to ace your <GradientText gradient="accent">next interview?</GradientText>
            </h2>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of successful candidates who've used InterviewSync to land their dream roles.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 justify-center">
              <Link to="/auth">
                <Button size="lg" variant="default" className="shadow-xl shadow-royal-500/20 hover:shadow-2xl hover:shadow-royal-500/30">
                  Start Practicing Now
                </Button>
              </Link>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </GlassCard>
        </section>
      </ScrollReveal>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-border px-6 py-12 text-center">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm text-muted-foreground">
            © 2025 InterviewSync. Empower your interview journey. Built with ❤️ for success.
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Terms</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
