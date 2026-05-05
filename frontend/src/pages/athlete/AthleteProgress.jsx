import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp, TrendingDown, Dumbbell, Brain,
  Calendar, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, Target, Flame,
  BarChart3, Activity, Filter, ChevronRight
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis
} from "recharts"

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

// ── Mock data ──────────────────────────────────────────────────
const LIFT_HISTORY = {
  bench: [
    { week: "W1", kg: 70 }, { week: "W2", kg: 72 }, { week: "W3", kg: 75 },
    { week: "W4", kg: 73 }, { week: "W5", kg: 77 }, { week: "W6", kg: 78 },
    { week: "W7", kg: 80 }, { week: "W8", kg: 85 },
  ],
  squat: [
    { week: "W1", kg: 90 }, { week: "W2", kg: 92 }, { week: "W3", kg: 95 },
    { week: "W4", kg: 93 }, { week: "W5", kg: 98 }, { week: "W6", kg: 100 },
    { week: "W7", kg: 107 }, { week: "W8", kg: 105 },
  ],
  deadlift: [
    { week: "W1", kg: 100 }, { week: "W2", kg: 105 }, { week: "W3", kg: 108 },
    { week: "W4", kg: 106 }, { week: "W5", kg: 110 }, { week: "W6", kg: 115 },
    { week: "W7", kg: 118 }, { week: "W8", kg: 120 },
  ],
}

const VOLUME_DATA = [
  { week: "W5", chest: 14, back: 16, legs: 18, shoulders: 10 },
  { week: "W6", chest: 16, back: 18, legs: 20, shoulders: 12 },
  { week: "W7", chest: 18, back: 20, legs: 22, shoulders: 14 },
  { week: "W8", chest: 16, back: 14, legs: 10, shoulders: 12 },
]

const RADAR_DATA = [
  { subject: "Chest",     A: 85 },
  { subject: "Back",      A: 78 },
  { subject: "Legs",      A: 65 },
  { subject: "Shoulders", A: 90 },
  { subject: "Arms",      A: 72 },
  { subject: "Core",      A: 60 },
]

const SESSION_LOG = [
  {
    date:      "Mon Jan 20",
    label:     "Push Day",
    sets:      18,
    rpe:       7.2,
    exercises: ["Bench Press 85kg×4×8", "OHP 50kg×3×10", "Incline DB 30kg×3×12"],
    anomaly:   null,
    completed: true,
  },
  {
    date:      "Fri Jan 17",
    label:     "Pull Day",
    sets:      20,
    rpe:       7.8,
    exercises: ["Deadlift 120kg×4×5", "Barbell Row 70kg×3×10", "Lat Pulldown 60kg×3×12"],
    anomaly:   { flag: "shoulder_fatigue", severity: "medium" },
    completed: true,
  },
  {
    date:      "Thu Jan 16",
    label:     "Leg Day",
    sets:      22,
    rpe:       8.1,
    exercises: ["Squat 105kg×5×5", "Leg Press 140kg×3×12", "RDL 80kg×3×10"],
    anomaly:   null,
    completed: true,
  },
  {
    date:      "Mon Jan 13",
    label:     "Push Day",
    sets:      17,
    rpe:       7.0,
    exercises: ["Bench Press 80kg×4×8", "OHP 48kg×3×10", "Cable Fly 20kg×3×15"],
    anomaly:   null,
    completed: true,
  },
  {
    date:      "Fri Jan 10",
    label:     "Full Body",
    sets:      0,
    rpe:       0,
    exercises: [],
    anomaly:   null,
    completed: false,
  },
]

const PRs = [
  { lift: "Bench Press",  value: "85kg",  date: "Jan 20", improvement: "+5kg" },
  { lift: "Deadlift",     value: "120kg", date: "Jan 17", improvement: "+5kg" },
  { lift: "Squat",        value: "107kg", date: "Jan 14", improvement: "+7kg" },
  { lift: "OHP",          value: "55kg",  date: "Dec 30", improvement: "+2.5kg" },
]

// ── Custom chart tooltip ───────────────────────────────────────
const GreenTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2.5 rounded-xl glass-card-bright text-xs"
         style={{ border: "1px solid var(--glass-border-bright)" }}>
      <p className="text-green font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: "var(--text-muted)" }}>
          {p.name}:{" "}
          <span style={{ color: "var(--text)" }}>
            {p.value}{p.unit || "kg"}
          </span>
        </p>
      ))}
    </div>
  )
}

// ── Lift selector ──────────────────────────────────────────────
const LIFTS = ["bench", "squat", "deadlift"]
const LIFT_COLORS = {
  bench:    "#39FF14",
  squat:    "#3B82F6",
  deadlift: "#FFC800",
}
const LIFT_LABELS = {
  bench: "Bench Press", squat: "Squat", deadlift: "Deadlift"
}

// ── Session row ────────────────────────────────────────────────
function SessionRow({ session, index }) {
  const [open, setOpen] = useState(false)
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl overflow-hidden border transition-all duration-200"
      style={{
        borderColor: session.anomaly
          ? "rgba(255,200,0,0.25)"
          : session.completed
            ? "var(--glass-border)"
            : "rgba(255,80,80,0.2)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4
                   hover:bg-white/5 transition-all text-left"
        style={{
          backgroundColor: session.anomaly
            ? "rgba(255,200,0,0.04)"
            : "var(--glass-1)",
        }}
      >
        {/* Status icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                         flex-shrink-0
                         ${!session.completed
                           ? "border border-red-500/20 bg-red-500/10"
                           : session.anomaly
                             ? "border border-yellow-500/20 bg-yellow-500/10"
                             : "bg-green-muted border border-green/20"
                         }`}>
          {!session.completed
            ? <Target size={16} className="text-red-400" />
            : session.anomaly
              ? <AlertTriangle size={16} style={{ color: "#FFC800" }} />
              : <CheckCircle size={16} className="text-green" />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-display font-700 text-base uppercase"
                  style={{ color: "var(--text)" }}>
              {session.label}
            </span>
            {!session.completed && (
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold
                               text-red-400 bg-red-500/10 border border-red-500/20">
                SKIPPED
              </span>
            )}
            {session.anomaly && (
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold"
                    style={{ backgroundColor: "rgba(255,200,0,0.12)",
                             color: "#FFC800" }}>
                {session.anomaly.flag.replace("_", " ").toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {session.date}
            {session.completed && ` · ${session.sets} sets · Avg RPE ${session.rpe}`}
          </p>
        </div>

        {open
          ? <ChevronUp size={15} style={{ color: "var(--text-muted)" }} />
          : <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />
        }
      </button>

      <AnimatePresence>
        {open && session.completed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden border-t px-5 py-4"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <div className="flex flex-col gap-2">
              {session.exercises.map((ex, i) => (
                <div key={i}
                     className="flex items-center gap-2 text-sm"
                     style={{ color: "var(--text-muted)" }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
                  {ex}
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function AthleteProgress() {
  const [activeLift, setActiveLift] = useState("bench")
  const liftData = LIFT_HISTORY[activeLift]
  const first    = liftData[0].kg
  const last     = liftData[liftData.length - 1].kg
  const diff     = last - first
  const trending = diff >= 0

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Background blob ─────────────────────────────────── */}
      <div className="fixed top-0 right-0 w-96 h-96 pointer-events-none"
           style={{
             background: "radial-gradient(circle, rgba(57,255,20,0.04) 0%, transparent 70%)",
             filter:     "blur(80px)",
           }} />

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="text-xs text-green font-semibold tracking-widest mb-1">
            MY PROGRESS
          </p>
          <h1 className="font-display font-900 text-4xl sm:text-5xl uppercase
                         tracking-tight"
              style={{ color: "var(--text)" }}>
            Performance
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            Strength Block · Weeks 1–8 overview
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2.5 text-sm btn-glass">
          <Filter size={14} /> Filter
        </button>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >

        {/* ── PRs row ─────────────────────────────────────── */}
        <motion.div variants={fadeUp}
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {PRs.map(({ lift, value, date, improvement }) => (
            <div key={lift}
                 className="glass-card rounded-2xl p-4 border hover:border-green/25
                            transition-all duration-300"
                 style={{ borderColor: "var(--glass-border)" }}>
              <p className="text-xs font-semibold tracking-widest mb-2"
                 style={{ color: "var(--text-muted)" }}>
                {lift.toUpperCase()}
              </p>
              <p className="font-display font-900 text-3xl text-green mb-0.5">
                {value}
              </p>
              <div className="flex items-center gap-1.5">
                <TrendingUp size={11} className="text-green" />
                <span className="text-xs text-green font-semibold">
                  {improvement}
                </span>
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  · {date}
                </span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Lift progression chart ───────────────────────── */}
        <motion.div variants={fadeUp}
                    className="glass-card rounded-2xl p-5 sm:p-6 border"
                    style={{ borderColor: "var(--glass-border)" }}>
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <p className="text-xs text-green font-semibold tracking-widest mb-1">
                LIFT PROGRESSION
              </p>
              <h2 className="font-display font-700 text-2xl uppercase"
                  style={{ color: "var(--text)" }}>
                {LIFT_LABELS[activeLift]}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                {trending
                  ? <TrendingUp size={14} className="text-green" />
                  : <TrendingDown size={14} className="text-red-400" />
                }
                <span className={`text-sm font-bold
                                  ${trending ? "text-green" : "text-red-400"}`}>
                  {trending ? "+" : ""}{diff}kg over 8 weeks
                </span>
              </div>
            </div>

            {/* Lift selector */}
            <div className="flex items-center gap-2">
              {LIFTS.map((lift) => (
                <button
                  key={lift}
                  onClick={() => setActiveLift(lift)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold
                              transition-all duration-200
                              ${activeLift === lift
                                ? "btn-green"
                                : "btn-glass"
                              }`}
                >
                  {LIFT_LABELS[lift].split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="h-52 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={liftData}>
                <defs>
                  <linearGradient id="liftGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"
                          stopColor={LIFT_COLORS[activeLift]}
                          stopOpacity={0.25} />
                    <stop offset="100%"
                          stopColor={LIFT_COLORS[activeLift]}
                          stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3"
                               stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="week"
                       tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                       axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                       axisLine={false} tickLine={false} unit="kg"
                       domain={["auto", "auto"]} />
                <Tooltip content={<GreenTooltip />} />
                <Area type="monotone" dataKey="kg"
                      stroke={LIFT_COLORS[activeLift]}
                      strokeWidth={2.5}
                      fill="url(#liftGrad)"
                      dot={{ fill: LIFT_COLORS[activeLift], r: 4, strokeWidth: 0 }}
                      activeDot={{ r: 7, fill: LIFT_COLORS[activeLift],
                                   strokeWidth: 0 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* ── Volume + Radar row ───────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Volume chart */}
          <motion.div variants={fadeUp}
                      className="glass-card rounded-2xl p-5 border"
                      style={{ borderColor: "var(--glass-border)" }}>
            <p className="text-xs text-green font-semibold tracking-widest mb-1">
              WEEKLY VOLUME
            </p>
            <h3 className="font-display font-700 text-xl uppercase mb-4"
                style={{ color: "var(--text)" }}>
              Sets Per Muscle
            </h3>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={VOLUME_DATA} barSize={6} barGap={3}>
                  <CartesianGrid strokeDasharray="3 3"
                                 stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="week"
                         tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                         axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                         axisLine={false} tickLine={false} />
                  <Tooltip content={<GreenTooltip />} />
                  <Bar dataKey="chest"     fill="#39FF14" radius={[4,4,0,0]} />
                  <Bar dataKey="back"      fill="#3B82F6" radius={[4,4,0,0]} />
                  <Bar dataKey="legs"      fill="#FFC800" radius={[4,4,0,0]} />
                  <Bar dataKey="shoulders" fill="#FF6B35" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {[
                { label: "Chest",     color: "#39FF14" },
                { label: "Back",      color: "#3B82F6" },
                { label: "Legs",      color: "#FFC800" },
                { label: "Shoulders", color: "#FF6B35" },
              ].map(({ label, color }) => (
                <div key={label}
                     className="flex items-center gap-1.5 text-xs"
                     style={{ color: "var(--text-muted)" }}>
                  <div className="w-2.5 h-2.5 rounded-sm"
                       style={{ backgroundColor: color }} />
                  {label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Radar chart */}
          <motion.div variants={fadeUp}
                      className="glass-card rounded-2xl p-5 border"
                      style={{ borderColor: "var(--glass-border)" }}>
            <p className="text-xs text-green font-semibold tracking-widest mb-1">
              MUSCLE BALANCE
            </p>
            <h3 className="font-display font-700 text-xl uppercase mb-2"
                style={{ color: "var(--text)" }}>
              Strength Profile
            </h3>
            <div className="h-52">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={RADAR_DATA}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="subject"
                                  tick={{ fontSize: 11,
                                          fill: "var(--text-muted)" }} />
                  <PolarRadiusAxis tick={false} axisLine={false}
                                   domain={[0, 100]} />
                  <Radar name="Strength" dataKey="A"
                         stroke="#39FF14" strokeWidth={2}
                         fill="#39FF14" fillOpacity={0.12} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ── Session log ──────────────────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-green font-semibold tracking-widest">
              SESSION LOG — Last 5
            </p>
            <div className="flex items-center gap-3 text-xs"
                 style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1">
                <CheckCircle size={11} className="text-green" /> Completed
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle size={11} style={{ color: "#FFC800" }} /> Anomaly
              </span>
              <span className="flex items-center gap-1">
                <Target size={11} className="text-red-400" /> Skipped
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            {SESSION_LOG.map((session, i) => (
              <SessionRow key={i} session={session} index={i} />
            ))}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}