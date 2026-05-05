import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Brain, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, Calendar, Download, Filter,
  BarChart3, Activity, Zap, Users
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts"

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  },
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

// ── Mock data ──────────────────────────────────────────────────
const MOCK_REPORTS = [
  {
    id: 1,
    athlete: "Rahul Sharma",
    weekNumber: 8,
    plan: "Strength Block",
    generatedAt: "2025-01-19",
    summaryBullets: [
      "4 of 5 sessions completed — Friday full body skipped",
      "Bench press progressed from 80kg to 85kg on Wednesday",
      "Coach adjusted squat volume after athlete reported knee soreness",
      "Volume targets hit for chest and back muscle groups",
      "Deload week confirmed for next week by coach in chat",
    ],
    anomalyInsights: "Athlete reported knee discomfort mid-week. Coach proactively reduced squat volume and substituted leg press with leg extensions. Monitor knee health during upcoming deload before resuming full leg volume.",
    anomalyFlags: ["knee_discomfort"],
    performance: [
      { day: "Mon", volume: 85, rpe: 7 },
      { day: "Tue", volume: 78, rpe: 8 },
      { day: "Wed", volume: 92, rpe: 7 },
      { day: "Thu", volume: 0,  rpe: 0 },
      { day: "Fri", volume: 0,  rpe: 0 },
    ],
  },
  {
    id: 2,
    athlete: "Priya Verma",
    weekNumber: 4,
    plan: "Hypertrophy Block",
    generatedAt: "2025-01-19",
    summaryBullets: [
      "All 5 sessions completed — 100% compliance this week",
      "Squat improved from 60kg to 65kg — consistent progression",
      "Asked coach about cardio — agreed on 2x low intensity sessions",
      "Volume targets exceeded for legs and back",
      "Energy levels reported as high throughout the week",
    ],
    anomalyInsights: "No anomalies detected this week. Athlete is progressing well across all lifts with no signs of fatigue or overtraining. Excellent compliance.",
    anomalyFlags: [],
    performance: [
      { day: "Mon", volume: 88, rpe: 7 },
      { day: "Tue", volume: 82, rpe: 6 },
      { day: "Wed", volume: 91, rpe: 7 },
      { day: "Thu", volume: 86, rpe: 7 },
      { day: "Fri", volume: 79, rpe: 6 },
    ],
  },
]

const WEEKLY_TREND = [
  { week: "Wk 5", bench: 75, squat: 100, deadlift: 110 },
  { week: "Wk 6", bench: 78, squat: 105, deadlift: 115 },
  { week: "Wk 7", bench: 80, squat: 107, deadlift: 118 },
  { week: "Wk 8", bench: 85, squat: 105, deadlift: 120 },
]

// ── Custom chart tooltip ───────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl glass-card-bright text-xs"
         style={{ border: "1px solid var(--glass-border-bright)" }}>
      <p className="text-green font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: "var(--text-muted)" }}>
          {p.name}: <span style={{ color: "var(--text)" }}>{p.value}kg</span>
        </p>
      ))}
    </div>
  )
}

// ── Report card ────────────────────────────────────────────────
function ReportCard({ report }) {
  const [open, setOpen] = useState(false)
  const hasAnomaly = report.anomalyFlags?.length > 0

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl glass-card overflow-hidden border transition-all
                 duration-300 hover:border-green/20"
      style={{ borderColor: hasAnomaly
        ? "rgba(255,200,0,0.2)"
        : "var(--glass-border)" }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-start sm:items-center justify-between
                   gap-4 p-5 hover:bg-white/5 transition-all text-left"
      >
        <div className="flex items-start sm:items-center gap-4">
          {/* Icon */}
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center
                           flex-shrink-0 ${hasAnomaly
                             ? "bg-yellow-500/10 border border-yellow-500/20"
                             : "bg-green-muted border border-green/20"}`}>
            {hasAnomaly
              ? <AlertTriangle size={18} style={{ color: "#FFC800" }} />
              : <CheckCircle size={18} className="text-green" />
            }
          </div>

          {/* Info */}
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-display font-700 text-lg uppercase tracking-tight"
                    style={{ color: "var(--text)" }}>
                {report.athlete}
              </span>
              <span className="text-xs px-2.5 py-1 rounded-lg bg-green-muted text-green">
                WEEK {report.weekNumber}
              </span>
              {hasAnomaly && (
                <span className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                      style={{ backgroundColor: "rgba(255,200,0,0.12)",
                               color: "#FFC800" }}>
                  ANOMALY
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs"
                 style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1">
                <BarChart3 size={11} /> {report.plan}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={11} /> {report.generatedAt}
              </span>
              <span className="flex items-center gap-1">
                <Brain size={11} className="text-green" />
                AI Generated
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <button
            onClick={(e) => e.stopPropagation()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5
                       text-xs btn-glass"
          >
            <Download size={12} /> PDF
          </button>
          {open
            ? <ChevronUp size={16} style={{ color: "var(--text-muted)" }} />
            : <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
          }
        </div>
      </button>

      {/* Expanded content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden border-t"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <div className="p-5 grid lg:grid-cols-2 gap-6">

              {/* Summary bullets */}
              <div>
                <p className="text-xs font-semibold tracking-widest text-green mb-4">
                  WEEK SUMMARY
                </p>
                <div className="flex flex-col gap-2.5">
                  {report.summaryBullets.map((b, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.07 }}
                      className="flex items-start gap-3 px-4 py-3 rounded-xl"
                      style={{
                        backgroundColor: "rgba(57,255,20,0.04)",
                        border:          "1px solid rgba(57,255,20,0.08)",
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green mt-1.5
                                      flex-shrink-0 shadow-[0_0_4px_var(--green)]" />
                      <p className="text-sm leading-relaxed"
                         style={{ color: "var(--text-muted)" }}>
                        {b}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Anomaly insight */}
                <div className={`mt-4 px-4 py-3 rounded-xl flex items-start gap-3
                  ${hasAnomaly
                    ? "border border-yellow-500/20"
                    : "border border-green/15"}`}
                     style={{
                       backgroundColor: hasAnomaly
                         ? "rgba(255,200,0,0.05)"
                         : "rgba(57,255,20,0.03)"
                     }}>
                  <Brain size={14}
                         style={{ color: hasAnomaly ? "#FFC800" : "var(--green)" }}
                         className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed"
                     style={{ color: "var(--text-muted)" }}>
                    {report.anomalyInsights}
                  </p>
                </div>
              </div>

              {/* Mini performance chart */}
              <div>
                <p className="text-xs font-semibold tracking-widest text-green mb-4">
                  DAILY VOLUME
                </p>
                <div className="h-44 rounded-xl p-3"
                     style={{ backgroundColor: "rgba(57,255,20,0.03)",
                              border: "1px solid rgba(57,255,20,0.08)" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={report.performance}>
                      <defs>
                        <linearGradient id={`g-${report.id}`}
                                        x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#39FF14" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#39FF14" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3"
                                     stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="day" tick={{ fontSize: 11,
                             fill: "var(--text-muted)" }} axisLine={false}
                             tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                             axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="volume"
                            stroke="#39FF14" strokeWidth={2}
                            fill={`url(#g-${report.id})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function CoachReports() {
  const [filterWeek, setFilterWeek] = useState("all")

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <p className="text-xs font-semibold tracking-widest text-green mb-1">
          AI REPORTS
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-900 text-4xl sm:text-5xl uppercase
                           tracking-tight mb-2"
                style={{ color: "var(--text)" }}>
              Weekly Reports
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Auto-generated every Sunday by Gemini AI
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm btn-glass">
              <Filter size={14} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm btn-green">
              <Download size={14} /> Export All
            </button>
          </div>
        </div>
      </motion.div>

      {/* ── Stats row ──────────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { icon: FileText,  label: "Reports Generated", value: "24",  sub: "This month"    },
          { icon: Users,     label: "Athletes Reviewed",  value: "4",   sub: "Active plans"  },
          { icon: AlertTriangle, label: "Anomalies Detected", value: "3", sub: "Last 4 weeks" },
          { icon: Activity,  label: "Avg Compliance",    value: "89%", sub: "Sessions done"  },
        ].map(({ icon: Icon, label, value, sub }) => (
          <motion.div
            key={label}
            variants={fadeUp}
            className="glass-card rounded-2xl p-4 border hover:border-green/20
                       transition-all duration-300"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-xl bg-green-muted border border-green/20
                              flex items-center justify-center">
                <Icon size={16} className="text-green" />
              </div>
              <span className="text-xs font-semibold tracking-widest"
                    style={{ color: "var(--text-muted)" }}>
                {label.toUpperCase()}
              </span>
            </div>
            <p className="font-display font-900 text-3xl text-green mb-0.5">
              {value}
            </p>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {sub}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Trend chart ────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 mb-8"
        style={{ borderColor: "var(--glass-border)" }}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-green mb-1">
              PROGRESSION OVERVIEW
            </p>
            <h2 className="font-display font-700 text-xl uppercase"
                style={{ color: "var(--text)" }}>
              Rahul Sharma · Last 4 Weeks
            </h2>
          </div>
          <div className="flex items-center gap-4 text-xs"
               style={{ color: "var(--text-muted)" }}>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-green" /> Bench
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-0.5"
                   style={{ backgroundColor: "#3B5BDB" }} /> Squat
            </span>
            <span className="flex items-center gap-1.5">
              <div className="w-3 h-0.5"
                   style={{ backgroundColor: "#FFC800" }} /> Deadlift
            </span>
          </div>
        </div>

        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={WEEKLY_TREND}>
              <CartesianGrid strokeDasharray="3 3"
                             stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="week"
                     tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                     axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "var(--text-muted)" }}
                     axisLine={false} tickLine={false} unit="kg" />
              <Tooltip content={<ChartTooltip />} />
              <Line type="monotone" dataKey="bench"
                    stroke="#39FF14" strokeWidth={2.5}
                    dot={{ fill: "#39FF14", r: 4, strokeWidth: 0 }}
                    activeDot={{ r: 6, fill: "#39FF14",
                                 boxShadow: "0 0 12px var(--green)" }} />
              <Line type="monotone" dataKey="squat"
                    stroke="#3B5BDB" strokeWidth={2.5}
                    dot={{ fill: "#3B5BDB", r: 4, strokeWidth: 0 }} />
              <Line type="monotone" dataKey="deadlift"
                    stroke="#FFC800" strokeWidth={2.5}
                    dot={{ fill: "#FFC800", r: 4, strokeWidth: 0 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* ── Report cards ───────────────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-4"
      >
        <motion.div variants={fadeUp}
                    className="flex items-center justify-between">
          <p className="text-xs font-semibold tracking-widest"
             style={{ color: "var(--text-muted)" }}>
            LATEST REPORTS — {MOCK_REPORTS.length} total
          </p>
        </motion.div>

        {MOCK_REPORTS.map((report) => (
          <ReportCard key={report.id} report={report} />
        ))}
      </motion.div>
    </div>
  )
}