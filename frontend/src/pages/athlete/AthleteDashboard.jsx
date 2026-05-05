import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Dumbbell, TrendingUp, Brain, CheckCircle,
  ChevronRight, Flame, Target, Calendar,
  Zap, Activity, AlertTriangle, Clock,
  Play, MessageSquare, BarChart3, Shield
} from "lucide-react"
import { useAuthStore } from "../../../store/authStore"

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

// ── Mock data ──────────────────────────────────────────────────
const PLAN = {
  title:        "Road to Nationals 2025",
  block:        "Strength Block",
  week:         8,
  totalWeeks:   12,
  progress:     65,
  coach:        "Coach Priya",
  status:       "active",
  competitionDate: "Apr 6, 2025",
}

const TODAY = {
  label:     "Monday — Push Day",
  sessions: [
    { name: "Bench Press", sets: 4, reps: 8,  weight: 85, rpe: 7, done: true  },
    { name: "OHP",         sets: 3, reps: 10, weight: 50, rpe: 7, done: true  },
    { name: "Incline DB",  sets: 3, reps: 12, weight: 30, rpe: 8, done: false },
    { name: "Cable Fly",   sets: 3, reps: 15, weight: 15, rpe: 7, done: false },
    { name: "Tricep Dips", sets: 3, reps: 12, weight: 0,  rpe: 6, done: false },
  ],
}

const WEEK_SESSIONS = [
  { day: "Mon", label: "Push",      done: true,    active: false },
  { day: "Tue", label: "Pull",      done: false,   active: true  },
  { day: "Wed", label: "Rest",      done: false,   active: false, rest: true },
  { day: "Thu", label: "Legs",      done: false,   active: false },
  { day: "Fri", label: "Push",      done: false,   active: false },
  { day: "Sat", label: "Full Body", done: false,   active: false },
  { day: "Sun", label: "Rest",      done: false,   active: false, rest: true },
]

const STATS = [
  { icon: Flame,    label: "Streak",    value: "12",   unit: "days",    color: "#FF6B35" },
  { icon: Dumbbell, label: "Sessions",  value: "47",   unit: "total",   color: "var(--green)" },
  { icon: TrendingUp, label: "PRs Set", value: "8",    unit: "this month", color: "#3B82F6" },
  { icon: Target,   label: "Compliance",value: "89",   unit: "%",       color: "var(--green)" },
]

const ANOMALY = {
  detected: true,
  flags:    ["shoulder_fatigue"],
  summary:  "Bench press dropped 10kg over 3 sessions while shoulder RPE is trending high.",
  suggestion: "Reduce pressing volume by 30% and add 2 sets of face pulls today.",
}

const RECENT = [
  { date: "Fri Jan 17",  label: "Pull Day",  exercises: 5, sets: 18, highlight: "Deadlift 120kg" },
  { date: "Thu Jan 16",  label: "Legs",      exercises: 6, sets: 22, highlight: "Squat 105kg"    },
  { date: "Wed Jan 15",  label: "Push Day",  exercises: 5, sets: 17, highlight: "Bench 85kg PR"  },
]

// ── Week strip ─────────────────────────────────────────────────
function WeekStrip() {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {WEEK_SESSIONS.map((s, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.05 * i }}
          className={`flex-shrink-0 flex flex-col items-center gap-1.5
                      px-3 py-3 rounded-xl border transition-all duration-200
                      ${s.active
                        ? "border-green bg-green-muted"
                        : s.done
                          ? "border-green/20 bg-green/5"
                          : s.rest
                            ? "border-white/5 opacity-50"
                            : "glass-card"
                      }`}
          style={{ minWidth: "64px" }}
        >
          <span className="text-xs font-bold tracking-widest"
                style={{ color: s.active ? "var(--green)"
                  : s.done ? "var(--green)"
                  : "var(--text-muted)" }}>
            {s.day}
          </span>
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center
            ${s.done
              ? "bg-green"
              : s.active
                ? "border border-green bg-green-muted"
                : "border border-white/10"
            }`}>
            {s.done
              ? <CheckCircle size={14} color="#080808" fill="#080808" />
              : s.rest
                ? <span className="text-xs" style={{ color: "var(--text-dim)" }}>—</span>
                : <Dumbbell size={12} style={{ color: s.active
                    ? "var(--green)" : "var(--text-dim)" }} />
            }
          </div>
          <span className="text-xs"
                style={{ color: s.active ? "var(--green)" : "var(--text-dim)" }}>
            {s.label}
          </span>
        </motion.div>
      ))}
    </div>
  )
}

// ── Exercise row ───────────────────────────────────────────────
function ExRow({ ex, index }) {
  const [done, setDone] = useState(ex.done)
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.05 * index }}
      onClick={() => setDone(!done)}
      className={`flex items-center justify-between px-4 py-3.5 rounded-xl
                  border cursor-pointer transition-all duration-200 group
                  ${done
                    ? "border-green/25 bg-green/5"
                    : "glass-card hover:border-green/20"
                  }`}
      style={{ borderColor: done ? "rgba(57,255,20,0.25)" : "var(--glass-border)" }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                         flex-shrink-0 transition-all duration-200
                         ${done ? "bg-green" : "bg-green-muted border border-green/20"}`}>
          {done
            ? <CheckCircle size={14} color="#080808" />
            : <Dumbbell size={13} className="text-green" />
          }
        </div>
        <span className={`text-sm font-medium transition-colors
                          ${done ? "line-through" : ""}`}
              style={{ color: done ? "var(--text-muted)" : "var(--text)" }}>
          {ex.name}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs"
           style={{ color: "var(--text-muted)" }}>
        <span className="px-2 py-1 rounded-lg glass-card">
          {ex.sets}×{ex.reps}
        </span>
        {ex.weight > 0 && (
          <span className="px-2 py-1 rounded-lg"
                style={{
                  backgroundColor: done ? "rgba(57,255,20,0.1)" : "rgba(255,255,255,0.04)",
                  color: done ? "var(--green)" : "var(--text-muted)",
                }}>
            {ex.weight}kg
          </span>
        )}
        <span className="px-2 py-1 rounded-lg glass-card">
          RPE {ex.rpe}
        </span>
      </div>
    </motion.div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function AthleteDashboard() {
  const { user } = useAuthStore()
  const doneSessions = TODAY.sessions.filter((s) => s.done).length
  const totalSessions = TODAY.sessions.length
  const sessionProgress = Math.round((doneSessions / totalSessions) * 100)

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Background glow ────────────────────────────────── */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-64
                      pointer-events-none"
           style={{
             background: "radial-gradient(ellipse, rgba(57,255,20,0.05) 0%, transparent 70%)",
             filter:     "blur(60px)",
           }} />

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-start justify-between gap-4"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green pulse-green" />
            <span className="text-xs font-semibold tracking-widest text-green">
              ATHLETE DASHBOARD
            </span>
          </div>
          <h1 className="font-display font-900 text-4xl sm:text-5xl uppercase
                         tracking-tight"
              style={{ color: "var(--text)" }}>
            GM, {user?.name?.split(" ")[0] || "Athlete"} 💪
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {PLAN.block} · Week {PLAN.week} of {PLAN.totalWeeks} ·{" "}
            <span className="text-green">{PLAN.coach}</span>
          </p>
        </div>

        <Link to={`/athlete/chat/plan-1`}
              className="flex items-center gap-2 px-4 py-2.5 text-sm btn-glass">
          <MessageSquare size={15} className="text-green" />
          Message Coach
        </Link>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >

        {/* ── LEFT COLUMN ──────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Plan progress card */}
          <motion.div variants={fadeUp}
                      className="glass-card rounded-2xl p-5 border"
                      style={{ borderColor: "var(--glass-border)" }}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-green font-semibold tracking-widest mb-1">
                  ACTIVE PROGRAM
                </p>
                <h2 className="font-display font-700 text-2xl uppercase"
                    style={{ color: "var(--text)" }}>
                  {PLAN.title}
                </h2>
              </div>
              <div className="text-right">
                <p className="font-display font-900 text-4xl text-green">
                  {PLAN.progress}%
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  complete
                </p>
              </div>
            </div>

            {/* Big progress bar */}
            <div className="h-2 rounded-full overflow-hidden mb-3"
                 style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${PLAN.progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full bg-green"
                style={{ boxShadow: "0 0 12px rgba(57,255,20,0.6)" }}
              />
            </div>

            <div className="flex items-center justify-between text-xs"
                 style={{ color: "var(--text-muted)" }}>
              <span>Week {PLAN.week} of {PLAN.totalWeeks}</span>
              <span className="flex items-center gap-1">
                <Calendar size={11} /> Competition: {PLAN.competitionDate}
              </span>
            </div>

            {/* Week strip */}
            <div className="mt-5 pt-5 border-t"
                 style={{ borderColor: "var(--glass-border)" }}>
              <p className="text-xs font-semibold tracking-widest mb-3"
                 style={{ color: "var(--text-muted)" }}>
                THIS WEEK
              </p>
              <WeekStrip />
            </div>
          </motion.div>

          {/* Anomaly alert */}
          {ANOMALY.detected && (
            <motion.div
              variants={fadeUp}
              className="rounded-2xl p-5 border"
              style={{
                backgroundColor: "rgba(255,200,0,0.05)",
                borderColor:     "rgba(255,200,0,0.25)",
              }}
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center
                                flex-shrink-0"
                     style={{ backgroundColor: "rgba(255,200,0,0.15)" }}>
                  <AlertTriangle size={18} style={{ color: "#FFC800" }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-semibold"
                       style={{ color: "#FFC800" }}>
                      Anomaly Detected
                    </p>
                    <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                          style={{
                            backgroundColor: "rgba(255,200,0,0.15)",
                            color:           "#FFC800",
                          }}>
                      SHOULDER FATIGUE
                    </span>
                  </div>
                  <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                    {ANOMALY.summary}
                  </p>
                  <div className="flex items-start gap-2 px-3 py-2 rounded-xl"
                       style={{
                         backgroundColor: "rgba(255,200,0,0.08)",
                         border:          "1px solid rgba(255,200,0,0.15)",
                       }}>
                    <Brain size={13} style={{ color: "#FFC800" }}
                           className="flex-shrink-0 mt-0.5" />
                    <p className="text-xs" style={{ color: "#FFC800" }}>
                      AI Suggestion: {ANOMALY.suggestion}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Today's session */}
          <motion.div variants={fadeUp}
                      className="glass-card rounded-2xl p-5 border"
                      style={{ borderColor: "var(--glass-border)" }}>
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs text-green font-semibold tracking-widest mb-1">
                  TODAY'S SESSION
                </p>
                <h3 className="font-display font-700 text-xl uppercase"
                    style={{ color: "var(--text)" }}>
                  {TODAY.label}
                </h3>
              </div>
              <div className="text-right">
                <p className="font-display font-900 text-2xl text-green">
                  {doneSessions}/{totalSessions}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  exercises done
                </p>
              </div>
            </div>

            {/* Session progress */}
            <div className="h-1.5 rounded-full overflow-hidden mb-5"
                 style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${sessionProgress}%` }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                className="h-full rounded-full bg-green"
                style={{ boxShadow: "0 0 8px rgba(57,255,20,0.5)" }}
              />
            </div>

            {/* Exercises */}
            <div className="flex flex-col gap-2">
              {TODAY.sessions.map((ex, i) => (
                <ExRow key={i} ex={ex} index={i} />
              ))}
            </div>

            {/* Log button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-5 w-full py-3.5 rounded-xl btn-green flex items-center
                         justify-center gap-2 text-sm font-bold"
            >
              <Play size={15} fill="currentColor" />
              Log Full Session
            </motion.button>
          </motion.div>

          {/* Recent sessions */}
          <motion.div variants={fadeUp}
                      className="glass-card rounded-2xl p-5 border"
                      style={{ borderColor: "var(--glass-border)" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs text-green font-semibold tracking-widest">
                RECENT SESSIONS
              </p>
              <Link to="/athlete/progress"
                    className="flex items-center gap-1 text-xs
                               hover:text-green transition-colors"
                    style={{ color: "var(--text-muted)" }}>
                View all <ChevronRight size={12} />
              </Link>
            </div>

            <div className="flex flex-col gap-3">
              {RECENT.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center gap-4 px-4 py-3.5 rounded-xl
                             glass-card border hover:border-green/20 transition-all
                             cursor-pointer group"
                  style={{ borderColor: "var(--glass-border)" }}
                >
                  <div className="w-10 h-10 rounded-xl bg-green-muted border
                                  border-green/20 flex items-center justify-center
                                  flex-shrink-0">
                    <Dumbbell size={17} className="text-green" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate"
                       style={{ color: "var(--text)" }}>
                      {s.label}
                    </p>
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                      {s.date} · {s.exercises} exercises · {s.sets} sets
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-semibold text-green">
                      {s.highlight}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-0.5">
                      <CheckCircle size={11} className="text-green" />
                      <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Done
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Stats grid */}
          <motion.div variants={fadeUp}
                      className="grid grid-cols-2 gap-3">
            {STATS.map(({ icon: Icon, label, value, unit, color }) => (
              <div key={label}
                   className="glass-card rounded-2xl p-4 border hover:border-green/20
                              transition-all duration-300"
                   style={{ borderColor: "var(--glass-border)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center
                                mb-3"
                     style={{ backgroundColor: `${color}15` }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <p className="font-display font-900 text-3xl"
                   style={{ color }}>
                  {value}
                </p>
                <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
                  {unit}
                </p>
                <p className="text-xs font-semibold mt-1"
                   style={{ color: "var(--text-muted)" }}>
                  {label}
                </p>
              </div>
            ))}
          </motion.div>

          {/* Volume targets */}
          <motion.div variants={fadeUp}
                      className="glass-card rounded-2xl p-5 border"
                      style={{ borderColor: "var(--glass-border)" }}>
            <p className="text-xs text-green font-semibold tracking-widest mb-4">
              WEEKLY VOLUME
            </p>
            {[
              { muscle: "Chest",     done: 16, target: 16 },
              { muscle: "Back",      done: 14, target: 18 },
              { muscle: "Legs",      done: 10, target: 20 },
              { muscle: "Shoulders", done: 12, target: 12 },
              { muscle: "Arms",      done: 8,  target: 10 },
              { muscle: "Core",      done: 6,  target: 8  },
            ].map(({ muscle, done, target }) => {
              const pct = Math.min(Math.round((done / target) * 100), 100)
              const hit = pct >= 100
              return (
                <div key={muscle} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium"
                          style={{ color: "var(--text-muted)" }}>
                      {muscle}
                    </span>
                    <span className="text-xs font-bold"
                          style={{ color: hit ? "var(--green)" : "var(--text-muted)" }}>
                      {done}/{target}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden"
                       style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8, ease: "easeOut", delay: 0.4 }}
                      className="h-full rounded-full transition-all"
                      style={{
                        backgroundColor: hit
                          ? "var(--green)"
                          : "rgba(57,255,20,0.45)",
                        boxShadow: hit ? "0 0 6px rgba(57,255,20,0.5)" : "none",
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </motion.div>

          {/* Quick actions */}
          <motion.div variants={fadeUp}
                      className="glass-card rounded-2xl p-5 border"
                      style={{ borderColor: "var(--glass-border)" }}>
            <p className="text-xs text-green font-semibold tracking-widest mb-4">
              QUICK ACTIONS
            </p>
            <div className="flex flex-col gap-2">
              {[
                { icon: MessageSquare, label: "Message Coach",    to: "/athlete/chat/plan-1",  color: "var(--green)"  },
                { icon: BarChart3,     label: "View Progress",    to: "/athlete/progress",      color: "#3B82F6"       },
                { icon: Shield,        label: "Anomaly History",  to: "/athlete/progress",      color: "#FFC800"       },
                { icon: Calendar,      label: "Full Schedule",    to: "/athlete/progress",      color: "var(--green)"  },
              ].map(({ icon: Icon, label, to, color }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl
                             border hover:border-green/30 transition-all duration-200
                             group"
                  style={{ borderColor: "var(--glass-border)" }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center
                                  justify-center flex-shrink-0"
                       style={{ backgroundColor: `${color}12` }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <span className="text-sm font-medium flex-1"
                        style={{ color: "var(--text-muted)" }}>
                    {label}
                  </span>
                  <ChevronRight size={13}
                                className="opacity-0 group-hover:opacity-100
                                           transition-opacity text-green" />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* AI status card */}
          <motion.div variants={fadeUp}
                      className="rounded-2xl p-5 border"
                      style={{
                        backgroundColor: "rgba(57,255,20,0.04)",
                        borderColor:     "rgba(57,255,20,0.18)",
                      }}>
            <div className="flex items-center gap-2 mb-3">
              <Brain size={15} className="text-green" />
              <span className="text-xs font-semibold tracking-widest text-green">
                AI COACH STATUS
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-3"
               style={{ color: "var(--text-muted)" }}>
              Your program is on track. Deload week scheduled for Week 9 to
              allow recovery before the final peak phase.
            </p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green pulse-green" />
              <span className="text-xs text-green font-medium">
                Gemini AI monitoring your progress
              </span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}