import { useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useScroll, useTransform } from "framer-motion"
import {
  ArrowRight, Brain, Zap, FileText,
  Users, Trophy, Activity, TrendingUp,
  CheckCircle, ChevronRight, Timer,
  Dumbbell, MessageSquare, BarChart3,
  Shield, Target, Cpu
} from "lucide-react"
import Navbar from "../../Navbar"
import { useAuthStore } from "../../store/authStore"

const fadeUp = {
  hidden:  { opacity: 0, y: 36 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] }
  },
}
const stagger = {
  visible: { transition: { staggerChildren: 0.09 } }
}

// ── Floating stat pill ─────────────────────────────────────────
function StatPill({ icon: Icon, label, value, delay, className }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1,   y: 0  }}
      transition={{ delay, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -5, scale: 1.04 }}
      className={`absolute flex items-center gap-3 px-4 py-3
                  rounded-xl glass-card z-20 ${className}`}
    >
      <div className="w-9 h-9 rounded-lg bg-green-muted flex items-center
                      justify-center flex-shrink-0">
        <Icon size={17} className="text-green" />
      </div>
      <div>
        <p className="font-display font-bold text-xl leading-none text-green">
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
      </div>
    </motion.div>
  )
}

// ── Feature card ───────────────────────────────────────────────
function FeatureCard({ icon: Icon, title, description, tag }) {
  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -6, scale: 1.01 }}
      className="relative p-6 rounded-2xl glass-card group overflow-hidden
                 cursor-default transition-all duration-300
                 hover:border-green/30"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100
                      transition-opacity duration-500 pointer-events-none rounded-2xl"
           style={{
             background: "radial-gradient(circle at 30% 0%, rgba(57,255,20,0.07) 0%, transparent 65%)"
           }} />

      {/* Tag */}
      <span className="inline-block text-xs font-semibold tracking-widest
                       px-2.5 py-1 rounded-md bg-green-muted text-green mb-4">
        {tag}
      </span>

      <div className="w-11 h-11 rounded-xl bg-green-muted border border-green/20
                      flex items-center justify-center mb-4
                      group-hover:border-green/50 transition-colors">
        <Icon size={20} className="text-green" />
      </div>

      <h3 className="font-display font-700 text-xl tracking-tight mb-3
                     uppercase" style={{ color: "var(--text)" }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed"
         style={{ color: "var(--text-muted)" }}>
        {description}
      </p>

      <div className="mt-5 flex items-center gap-1 text-sm font-semibold
                      text-green opacity-0 group-hover:opacity-100
                      transition-all duration-300 translate-y-1
                      group-hover:translate-y-0">
        Explore feature <ChevronRight size={14} />
      </div>
    </motion.div>
  )
}

// ── Step item ──────────────────────────────────────────────────
function Step({ number, icon: Icon, title, description, isLast }) {
  return (
    <motion.div variants={fadeUp} className="flex gap-5 group">
      <div className="flex-shrink-0 flex flex-col items-center">
        <div className="w-12 h-12 rounded-xl glass-card border border-green/30
                        flex items-center justify-center font-display font-900
                        text-xl text-green transition-all duration-300
                        group-hover:bg-green group-hover:text-black
                        group-hover:border-green group-hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]">
          {number}
        </div>
        {!isLast && (
          <div className="w-px flex-1 mt-3 min-h-[48px]"
               style={{ background: "linear-gradient(to bottom, rgba(57,255,20,0.3), transparent)" }} />
        )}
      </div>
      <div className={`${isLast ? "pb-0" : "pb-10"}`}>
        <div className="flex items-center gap-2 mb-2">
          <Icon size={15} className="text-green" />
          <h4 className="font-display font-700 text-lg uppercase tracking-tight"
              style={{ color: "var(--text)" }}>
            {title}
          </h4>
        </div>
        <p className="text-sm leading-relaxed"
           style={{ color: "var(--text-muted)" }}>
          {description}
        </p>
      </div>
    </motion.div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target:  heroRef,
    offset:  ["start start", "end start"],
  })
  const heroY  = useTransform(scrollYProgress, [0, 1], ["0%",  "20%"])
  const heroOp = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  const {user} = useAuthStore();

  return (
    <div style={{ backgroundColor: "var(--bg)" }} className="overflow-x-hidden">
      <Navbar />

      {/* ════════════════════════════════════════
          HERO
      ════════════════════════════════════════ */}
      <section ref={heroRef}
               className="relative min-h-screen flex items-center overflow-hidden pt-16">

        {/* ── Background effects ── */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Green radial — top left */}
          <motion.div
            animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-48 -left-48 w-[640px] h-[640px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(57,255,20,0.12) 0%, transparent 65%)",
              filter:     "blur(60px)",
            }}
          />
          {/* White radial — center */}
          <motion.div
            animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
            className="absolute top-1/4 left-1/3 w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(255,255,255,0.04) 0%, transparent 65%)",
              filter:     "blur(80px)",
            }}
          />
          {/* Green radial — bottom right */}
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.08, 1] }}
            transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            className="absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(57,255,20,0.09) 0%, transparent 65%)",
              filter:     "blur(60px)",
            }}
          />

          {/* Grid */}
          <div className="absolute inset-0"
               style={{
                 backgroundImage: `
                   linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)
                 `,
                 backgroundSize: "48px 48px",
               }} />

          {/* Vignette */}
          <div className="absolute inset-0"
               style={{
                 background: "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 40%, rgba(8,8,8,0.85) 100%)"
               }} />
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOp }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                     py-20 lg:py-28 w-full"
        >
          <div className="grid lg:grid-cols-2 gap-14 lg:gap-20 items-center">

            {/* ── Left: copy ── */}
            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="flex flex-col gap-7"
            >
              {/* Live badge */}
              <motion.div variants={fadeUp}>
                <div className="inline-flex items-center gap-2.5 px-4 py-2
                                rounded-lg glass-card border border-green/20">
                  <span className="w-2 h-2 rounded-full bg-green pulse-green
                                   flex-shrink-0" />
                  <span className="text-xs font-semibold tracking-widest text-green">
                    AI-POWERED GYM COACHING
                  </span>
                  <span className="text-xs px-2 py-0.5 rounded bg-green/10 text-green">
                    LIVE
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.div variants={fadeUp}>
                <h1 className="font-display font-900 uppercase leading-[0.88]"
                    style={{
                      fontSize:      "clamp(4rem, 9vw, 8rem)",
                      letterSpacing: "-0.01em",
                      color:         "var(--text)",
                    }}>
                  SCULPT
                  <br />
                  <span className="text-green"
                        style={{ textShadow: "0 0 40px rgba(57,255,20,0.4)" }}>
                    YOUR
                  </span>
                  <br />
                  BODY
                  <span className="text-green">.</span>
                </h1>
                <h2 className="font-display font-700 uppercase leading-[0.88] mt-2"
                    style={{
                      fontSize:         "clamp(2rem, 5vw, 4rem)",
                      letterSpacing:    "-0.01em",
                      WebkitTextStroke: "1px rgba(255,255,255,0.35)",
                      color:            "transparent",
                    }}>
                  ELEVATE YOUR SPIRIT
                </h2>
              </motion.div>

              {/* Sub */}
              <motion.p variants={fadeUp}
                        className="text-base leading-relaxed max-w-md"
                        style={{ color: "var(--text-muted)" }}>
                Freeko combines AI periodization, real-time anomaly detection,
                and intelligent coach-athlete communication — so you peak at
                exactly the right moment.
              </motion.p>

              {/* CTAs */}
              {
                !user && (<motion.div variants={fadeUp}
                          className="flex flex-wrap items-center gap-3">
                <Link to="/register"
                      className="flex items-center gap-2 px-7 py-3.5 text-sm btn-green cursor-pointer">
                  Let's Start <ArrowRight size={16} />
                </Link>
                <Link to="/login"
                      className="flex items-center gap-2 px-7 py-3.5 text-sm btn-glass cursor-pointer">
                  Sign In
                </Link>
              </motion.div>)
              }

              {/* Social proof */}
              <motion.div variants={fadeUp}
                          className="flex items-center gap-5 pt-2">
                <div className="flex -space-x-2.5">
                  {["A","R","M","V","S"].map((l, i) => (
                    <div key={i}
                         className="w-9 h-9 rounded-full border-2 flex items-center
                                    justify-center text-xs font-bold"
                         style={{
                           borderColor:     "var(--bg)",
                           backgroundColor: i % 2 === 0 ? "var(--green)" : "#1a1a1a",
                           color:           i % 2 === 0 ? "#080808" : "var(--green)",
                         }}>
                      {l}
                    </div>
                  ))}
                </div>
                <div className="border-l pl-5"
                     style={{ borderColor: "var(--glass-border)" }}>
                  <p className="font-display font-bold text-2xl text-green">
                    12k+
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Happy Athletes
                  </p>
                </div>
              </motion.div>
            </motion.div>

            {/* ── Right: Hero card ── */}
            {/* ── Right: Hero Image ── */}
<motion.div
  initial={{ opacity: 0, x: 60, scale: 0.96 }}
  animate={{ opacity: 1, x: 0, scale: 1 }}
  transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1], delay: 0.25 }}
  className="relative flex items-center justify-center"
>
  <div className="relative w-full max-w-xl mx-auto">

    {/* Glow effect (keeps your theme consistent) */}
    <div
      className="absolute inset-0 rounded-2xl blur-3xl opacity-30"
      style={{
        background: "radial-gradient(circle, rgba(57,255,20,0.25), transparent 70%)"
      }}
    />

    {/* Image */}
    <img
      src="/hero.png"  // <-- place your generated image in public folder
      alt="Freeko Gym Coaching"
      className="relative w-full h-auto object-contain rounded-2xl"
    />

  </div>
</motion.div>
          </div>
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          STATS BAR
      ════════════════════════════════════════ */}
      <section className="py-14 border-y"
               style={{ borderColor: "var(--glass-border)",
                        backgroundColor: "var(--bg-alt)" }}>
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-5xl mx-auto px-4 sm:px-6
                     grid grid-cols-2 md:grid-cols-4 gap-10"
        >
          {[
            { icon: Users,    value: "12k+",  label: "Happy Athletes"  },
            { icon: Trophy,   value: "98%",   label: "Success Rate"    },
            { icon: Activity, value: "500k+", label: "Sessions Logged" },
            { icon: Cpu,      value: "3",     label: "AI Features"     },
          ].map(({ icon: Icon, value, label }) => (
            <motion.div key={label} variants={fadeUp}
                        className="flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-muted border border-green/20
                              flex items-center justify-center">
                <Icon size={20} className="text-green" />
              </div>
              <span className="font-display font-900 text-4xl text-green">
                {value}
              </span>
              <span className="text-sm" style={{ color: "var(--text-muted)" }}>
                {label}
              </span>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ════════════════════════════════════════
          FEATURES
      ════════════════════════════════════════ */}
      <section id="features" className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div variants={stagger} initial="hidden"
                      whileInView="visible" viewport={{ once: true }}
                      className="mb-16">
            <motion.p variants={fadeUp}
                      className="text-xs font-semibold tracking-widest text-green mb-3">
              — FEATURES
            </motion.p>
            <motion.h2 variants={fadeUp}
                       className="font-display font-900 uppercase leading-[0.9] mb-5"
                       style={{
                         fontSize:      "clamp(2.5rem, 5.5vw, 5rem)",
                         color:         "var(--text)",
                         letterSpacing: "-0.01em",
                       }}>
              THREE AI POWERS
            </motion.h2>
            <motion.p variants={fadeUp}
                      className="text-base max-w-xl leading-relaxed"
                      style={{ color: "var(--text-muted)" }}>
              Every feature is powered by Gemini AI and LangChain —
              built to make coaching smarter, not harder.
            </motion.p>
          </motion.div>

          <motion.div variants={stagger} initial="hidden"
                      whileInView="visible" viewport={{ once: true }}
                      className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={Brain}
              tag="FEATURE 01"
              title="Periodization Architect"
              description="Coach inputs athlete goals and competition date — Gemini AI builds a complete 12–16 week periodized program broken into mesocycles and microcycles automatically."
            />
            <FeatureCard
              icon={Zap}
              tag="FEATURE 02"
              title="Anomaly Detective"
              description="A LangGraph 2-agent pipeline monitors every workout log. Agent 1 collects data trends, Agent 2 reasons and flags performance anomalies before they become injuries."
            />
            <FeatureCard
              icon={FileText}
              tag="FEATURE 03"
              title="Weekly Summarizer"
              description="Every Sunday, AI reads the week's coach-athlete chat and all workout sessions, then auto-generates a structured report with bullet points and insights."
            />
          </motion.div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          HOW IT WORKS
      ════════════════════════════════════════ */}
      <section id="how" className="py-24 lg:py-32 border-t"
               style={{ borderColor: "var(--glass-border)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">

            {/* Steps */}
            <motion.div variants={stagger} initial="hidden"
                        whileInView="visible" viewport={{ once: true }}>
              <motion.p variants={fadeUp}
                        className="text-xs font-semibold tracking-widest text-green mb-3">
                — HOW IT WORKS
              </motion.p>
              <motion.h2 variants={fadeUp}
                         className="font-display font-900 uppercase leading-[0.9] mb-12"
                         style={{
                           fontSize:      "clamp(2rem, 4.5vw, 4rem)",
                           color:         "var(--text)",
                           letterSpacing: "-0.01em",
                         }}>
                FROM ZERO TO
                <br />
                <span className="text-green">PEAK PERFORMANCE</span>
              </motion.h2>

              <Step number="01" icon={Brain}
                    title="Coach creates your plan"
                    description="Coach enters your goals, weaknesses, and competition date. Gemini AI generates your complete periodized program in seconds." />
              <Step number="02" icon={Dumbbell}
                    title="You log every session"
                    description="After each workout, log your sets, reps, and weight. The Anomaly Detective agent instantly checks for performance drops or injury risk." />
              <Step number="03" icon={MessageSquare}
                    title="Chat with your coach"
                    description="Real-time messaging with your coach inside the platform. Every conversation is tied to your active training plan." />
              <Step number="04" icon={BarChart3}
                    title="Get your weekly report"
                    description="Every Sunday, AI reads your week's chat and workouts and delivers a structured report to your coach dashboard automatically."
                    isLast />
            </motion.div>

            {/* Report card */}
            <motion.div
              initial={{ opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
              className="lg:sticky lg:top-28"
            >
              {/* Stacked bg cards */}
              <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-2xl"
                   style={{ border: "1px solid rgba(57,255,20,0.08)",
                            background: "rgba(57,255,20,0.02)" }} />
              <div className="absolute inset-0 translate-x-1.5 translate-y-1.5 rounded-2xl"
                   style={{ border: "1px solid rgba(57,255,20,0.12)",
                            background: "rgba(255,255,255,0.02)" }} />

              {/* Main report card */}
              <div className="relative rounded-2xl glass-card-bright p-6 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-0.5"
                     style={{
                       background: "linear-gradient(90deg, var(--green), transparent)"
                     }} />

                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs font-semibold tracking-widest text-green mb-1">
                      AI WEEKLY REPORT
                    </p>
                    <p className="font-display font-700 text-2xl uppercase"
                       style={{ color: "var(--text)" }}>
                      Week 8 Summary
                    </p>
                  </div>
                  <span className="text-xs px-3 py-1.5 rounded-lg font-semibold
                                   bg-green-muted text-green border border-green/20">
                    AUTO-GEN
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 mb-6">
                  {[
                    "4 of 5 sessions completed this week",
                    "Bench press progressed 80kg → 85kg",
                    "Shoulder fatigue flagged on Tuesday",
                    "Volume targets hit for chest and back",
                    "Deload confirmed by coach next week",
                  ].map((text, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -14 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.35 + i * 0.08 }}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl"
                      style={{ backgroundColor: "rgba(57,255,20,0.04)",
                               border: "1px solid rgba(57,255,20,0.08)" }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green mt-1.5 flex-shrink-0
                                      shadow-[0_0_6px_var(--green)]" />
                      <p className="text-sm leading-relaxed"
                         style={{ color: "var(--text-muted)" }}>
                        {text}
                      </p>
                    </motion.div>
                  ))}
                </div>

                <div className="flex items-center gap-2.5 pt-4 border-t"
                     style={{ borderColor: "var(--glass-border)" }}>
                  <div className="w-2 h-2 rounded-full bg-green animate-pulse
                                  shadow-[0_0_6px_var(--green)]" />
                  <span className="text-xs font-medium"
                        style={{ color: "var(--text-muted)" }}>
                    Generated by Gemini AI · Sunday 00:00
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════
          CTA
      ════════════════════════════════════════ */}
      <section className="py-24 lg:py-32 relative overflow-hidden border-t"
               style={{ borderColor: "var(--glass-border)" }}>
        {/* Green radial center */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                          w-[700px] h-[400px] rounded-full"
               style={{
                 background: "radial-gradient(ellipse, rgba(57,255,20,0.08) 0%, transparent 70%)",
                 filter:     "blur(80px)",
               }} />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative">
          <motion.div variants={stagger} initial="hidden"
                      whileInView="visible" viewport={{ once: true }}>
            <motion.p variants={fadeUp}
                      className="text-xs font-semibold tracking-widest text-green mb-4">
              — GET STARTED TODAY
            </motion.p>
            <motion.h2 variants={fadeUp}
                       className="font-display font-900 uppercase leading-[0.88] mb-6"
                       style={{
                         fontSize:      "clamp(3.5rem, 8vw, 7rem)",
                         color:         "var(--text)",
                         letterSpacing: "-0.02em",
                       }}>
              READY TO
              <br />
              <span className="text-green"
                    style={{ textShadow: "0 0 60px rgba(57,255,20,0.3)" }}>
                FREEKO?
              </span>
            </motion.h2>
            <motion.p variants={fadeUp}
                      className="text-base mb-10 max-w-lg mx-auto leading-relaxed"
                      style={{ color: "var(--text-muted)" }}>
              Join thousands of athletes and coaches already using AI to train
              smarter, recover better, and peak at the right time.
            </motion.p>

            {
              !user && (
                <motion.div variants={fadeUp}
                        className="flex flex-wrap items-center justify-center gap-4">
              <Link to="/register"
                    className="flex items-center gap-2 px-8 py-4 text-base btn-green">
                Start for Free <ArrowRight size={18} />
              </Link>
              <Link to="/login"
                    className="flex items-center gap-2 px-8 py-4 text-base btn-glass">
                I have an account
              </Link>
            </motion.div>
              )
            }
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t"
              style={{ borderColor: "var(--glass-border)",
                       backgroundColor: "var(--bg-alt)" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6
                        flex flex-col sm:flex-row items-center
                        justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-green flex items-center justify-center"
                 style={{ boxShadow: "0 0 12px rgba(57,255,20,0.4)" }}>
              <Zap size={13} color="#080808" fill="#080808" />
            </div>
            <span className="font-display font-800 text-xl uppercase tracking-wider"
                  style={{ color: "var(--text)" }}>
              Free<span className="text-green">ko</span>
            </span>
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            © 2025 Freeko · Built with LangChain + Gemini AI
          </p>
          <div className="flex items-center gap-6">
            {["Privacy","Terms","Contact"].map((l) => (
              <a key={l} href="#"
                 className="text-sm hover:text-green transition-colors duration-200"
                 style={{ color: "var(--text-muted)" }}>
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}