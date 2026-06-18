import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp, TrendingDown, Dumbbell, Brain,
  AlertTriangle, CheckCircle, ChevronDown,
  ChevronUp, Target, Filter, Loader2,
  Shield
} from "lucide-react"
import {
  AreaChart, Area, BarChart, Bar, RadarChart,
  Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer
} from "recharts"
import { useAuthStore } from "../../../store/authStore"
import api from "../../lib/axios"

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

const LIFT_COLORS = {
  bench:    "#39FF14",
  squat:    "#3B82F6",
  deadlift: "#FFC800",
}
const LIFT_LABELS = {
  bench: "Bench Press", squat: "Squat", deadlift: "Deadlift"
}
const LIFTS = ["bench", "squat", "deadlift"]

// ── Tooltip ────────────────────────────────────────────────────
const GreenTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2.5 rounded-xl glass-card text-xs"
         style={{ border: "1px solid var(--glass-border-bright)" }}>
      <p className="text-green font-bold mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: "var(--text-muted)" }}>
          {p.name}:{" "}
          <span style={{ color: "var(--text)" }}>
            {p.value}kg
          </span>
        </p>
      ))}
    </div>
  )
}

// ── Session row ────────────────────────────────────────────────
function SessionRow({ session }) {
  const [open, setOpen] = useState(false)
  const hasAnomaly = session.aiAnomalyReport?.detected
  const completed  = session.status === "completed"
  const skipped    = session.status === "skipped"
  const planned    = session.status === "planned"

  const totalSets = session.exercises?.reduce(
    (t, e) => t + (e.sets || 0), 0
  ) || 0
  const avgRpe = session.exercises?.length
    ? (session.exercises.reduce((t, e) => t + (e.rpe || 0), 0) /
       session.exercises.length).toFixed(1)
    : 0

  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl overflow-hidden border transition-all duration-200"
      style={{
        borderColor: hasAnomaly
          ? "rgba(255,200,0,0.25)"
          : skipped
            ? "rgba(255,80,80,0.2)"
            : "var(--glass-border)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-4 px-5 py-4
                   hover:bg-white/5 transition-all text-left"
        style={{
          backgroundColor: hasAnomaly
            ? "rgba(255,200,0,0.04)"
            : "var(--glass-1)",
        }}
      >
        {/* Status icon */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                         flex-shrink-0
                         ${skipped
                           ? "border border-red-500/20 bg-red-500/10"
                           : hasAnomaly
                             ? "border border-yellow-500/20 bg-yellow-500/10"
                             : "bg-green-muted border border-green/20"
                         }`}>
          {completed
            ? <CheckCircle size={16} className="text-blue-400" />
            : hasAnomaly
              ? <AlertTriangle size={16} style={{ color: "#FFC800" }} />
              : skipped ?
               <CheckCircle size={16} className="text-green" /> : <Shield Shieldsize={16} className="text-green" />
          }
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-0.5">
            <span className="font-display font-700 text-base uppercase"
                  style={{ color: "var(--text)" }}>
              {session.dayLabel}
            </span>
            {skipped && (
              <span className="text-xs px-2 py-0.5 rounded-lg font-bold
                               text-red-400 bg-red-500/10 border border-red-500/20">
                SKIPPED
              </span>
            )}
            {hasAnomaly && session.aiAnomalyReport.flags?.map((f) => (
              <span key={f}
                    className="text-xs px-2 py-0.5 rounded-lg font-bold"
                    style={{ backgroundColor: "rgba(255,200,0,0.12)",
                             color: "#FFC800" }}>
                {f.replace(/_/g, " ").toUpperCase()}
              </span>
            ))}
          </div>
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            {session.loggedAt
              ? new Date(session.loggedAt).toLocaleDateString("en-IN", {
                  weekday: "short", day: "numeric", month: "short"
                })
              : "Not logged"
            }
            {completed && totalSets > 0 &&
              ` · ${totalSets} sets · Avg RPE ${avgRpe}`
            }
          </p>
        </div>

        {open
          ? <ChevronUp  size={15} style={{ color: "var(--text-muted)" }} />
          : <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />
        }
      </button>

      <AnimatePresence>
        {open && completed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden border-t px-5 py-4"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <div className="flex flex-col gap-2 mb-3">
              {session.exercises?.map((ex, i) => (
                <div key={i}
                     className="flex items-center justify-between text-xs"
                     style={{ color: "var(--text-muted)" }}>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-green flex-shrink-0" />
                    <span style={{ color: "var(--text)" }}>{ex.name}</span>
                  </div>
                  <span>
                    {ex.sets}×{ex.reps}
                    {ex.weight > 0 && ` @ ${ex.weight}kg`}
                    {ex.rpe > 0 && ` · RPE ${ex.rpe}`}
                  </span>
                </div>
              ))}
            </div>

            {/* Anomaly insight */}
            {hasAnomaly && (
              <div className="px-3 py-2.5 rounded-xl mt-2"
                   style={{
                     backgroundColor: "rgba(255,200,0,0.06)",
                     border:          "1px solid rgba(255,200,0,0.2)",
                   }}>
                <div className="flex items-start gap-2">
                  <Brain size={12} style={{ color: "#FFC800" }}
                         className="flex-shrink-0 mt-0.5" />
                  <p className="text-xs" style={{ color: "#FFC800" }}>
                    {session.aiAnomalyReport.summary}
                    {session.aiAnomalyReport.suggestion &&
                      ` — ${session.aiAnomalyReport.suggestion}`
                    }
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function AthleteProgress() {
  const { user }        = useAuthStore()
  const [athleteData, setAthleteData] = useState(null);
  const [loading,       setLoading]       = useState(true)
  const [sessions,      setSessions]      = useState([])
  const [activeLift,    setActiveLift]    = useState("bench")
  const [planInfo,      setPlanInfo]      = useState(null)

  useEffect(() => {
    const load = async () => {
      try {

        const {data: athleteData} = await api.get(`/athlete/${user.id}`)
        setAthleteData(athleteData);
        // console.log(athleteData)

        // 1. Fetch all sessions
        const { data: allSessions } = await api.get(
          `/workout/athlete/${athleteData._id}`
        )
        // console.log(allSessions);
        setSessions(allSessions)

        // 2. Fetch active plan for context
        const { data: plans } = await api.get(`/plan/athlete/${athleteData._id}`)
        // console.log(plans);
        const active = plans.find((p) => (p.status === "active" && p.coachId !== null)) || plans[0]
        // console.log(active)
        if (active) setPlanInfo(active)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  // ── Derive lift progression from real sessions ─────────────
  const buildLiftHistory = (keyword) => {
    // Group completed sessions by week number (relative to plan start)
    const planStart = planInfo?.startDate
      ? new Date(planInfo.startDate)
      : null

    const completed = sessions.filter((s) => s.status === "completed")

    // Group by week
    const byWeek = {}
    completed.forEach((s) => {
      const weekNum = planStart
        ? Math.ceil(
            (new Date(s.loggedAt) - planStart) /
            (7 * 24 * 60 * 60 * 1000)
          )
        : 1
      const label = `W${Math.max(1, weekNum)}`
      if (!byWeek[label]) byWeek[label] = []

      // Find matching exercise
      s.exercises?.forEach((ex) => {
        if (ex.name.toLowerCase().includes(keyword) && ex.weight > 0) {
          byWeek[label].push(ex.weight)
        }
      })
    })

    // Build chart array — max weight per week
    return Object.entries(byWeek)
      .filter(([, weights]) => weights.length > 0)
      .sort(([a], [b]) => {
        const numA = parseInt(a.replace("W", ""))
        const numB = parseInt(b.replace("W", ""))
        return numA - numB
      })
      .map(([week, weights]) => ({
        week,
        kg: Math.max(...weights),
      }))
  }

  const LIFT_KEYWORDS = { bench: "bench", squat: "squat", deadlift: "deadlift" }
  const liftData = buildLiftHistory(LIFT_KEYWORDS[activeLift])

  const first    = liftData[0]?.kg || 0
  const last     = liftData[liftData.length - 1]?.kg || 0
  const diff     = last - first
  const trending = diff >= 0

  // ── PRs — best weight ever per lift ───────────────────────
  const calcPR = (keyword) => {
    let best = null
    let bestDate = null
    let prev = 0

    sessions
      .filter((s) => s.status === "completed")
      .sort((a, b) => new Date(a.loggedAt) - new Date(b.loggedAt))
      .forEach((s) => {
        s.exercises?.forEach((ex) => {
          if (ex.name.toLowerCase().includes(keyword) && ex.weight > 0) {
            if (!best || ex.weight > best) {
              prev = best || ex.weight
              best = ex.weight
              bestDate = s.loggedAt
            }
          }
        })
      })

    return {
      value:       best ? `${best}kg` : "—",
      date:        bestDate
        ? new Date(bestDate).toLocaleDateString("en-IN", {
            day: "numeric", month: "short"
          })
        : "—",
      improvement: best && prev && best !== prev
        ? `+${best - prev}kg`
        : best ? "First PR" : "—",
    }
  }

  const PRs = [
    { lift: "Bench Press", ...calcPR("bench")    },
    { lift: "Deadlift",    ...calcPR("deadlift")  },
    { lift: "Squat",       ...calcPR("squat")     },
    { lift: "OHP",         ...calcPR("ohp")       },
  ]

  // ── Weekly volume per muscle (last 4 weeks) ────────────────
  const buildVolumeData = () => {
    const planStart = planInfo?.startDate
      ? new Date(planInfo.startDate)
      : null

    const completed = sessions.filter((s) => s.status === "completed")
    const byWeek = {}

    completed.forEach((s) => {
      const weekNum = planStart
        ? Math.ceil(
            (new Date(s.loggedAt) - planStart) /
            (7 * 24 * 60 * 60 * 1000)
          )
        : 1
      const label = `W${Math.max(1, weekNum)}`
      if (!byWeek[label]) {
        byWeek[label] = { week: label, chest: 0, back: 0, legs: 0, shoulders: 0 }
      }

      s.exercises?.forEach((ex) => {
        const name = ex.name.toLowerCase()
        const sets = ex.sets || 0
        if (name.includes("bench") || name.includes("fly") || name.includes("chest"))
          byWeek[label].chest += sets
        else if (name.includes("row") || name.includes("pull") || name.includes("deadlift"))
          byWeek[label].back += sets
        else if (name.includes("squat") || name.includes("leg") || name.includes("lunge"))
          byWeek[label].legs += sets
        else if (name.includes("shoulder") || name.includes("ohp") || name.includes("press"))
          byWeek[label].shoulders += sets
      })
    })

    return Object.values(byWeek)
      .sort((a, b) => {
        const na = parseInt(a.week.replace("W", ""))
        const nb = parseInt(b.week.replace("W", ""))
        return na - nb
      })
      .slice(-4) // last 4 weeks
  }

  const volumeData = buildVolumeData()

  // ── Radar — strength balance (% of target) ────────────────
  const buildRadarData = () => {
    const muscles = {
      Chest: 0, Back: 0, Legs: 0, Shoulders: 0, Arms: 0, Core: 0
    }
    const counts = { ...muscles }

    sessions
      .filter((s) => s.status === "completed")
      .forEach((s) => {
        s.exercises?.forEach((ex) => {
          const name = ex.name.toLowerCase()
          const wt   = ex.weight || 0
          if (name.includes("bench") || name.includes("fly") || name.includes("chest"))
            { muscles.Chest += wt; counts.Chest++ }
          else if (name.includes("row") || name.includes("pull") || name.includes("deadlift"))
            { muscles.Back += wt; counts.Back++ }
          else if (name.includes("squat") || name.includes("leg") || name.includes("lunge"))
            { muscles.Legs += wt; counts.Legs++ }
          else if (name.includes("shoulder") || name.includes("ohp"))
            { muscles.Shoulders += wt; counts.Shoulders++ }
          else if (name.includes("curl") || name.includes("tricep"))
            { muscles.Arms += wt; counts.Arms++ }
          else if (name.includes("core") || name.includes("ab") || name.includes("plank"))
            { muscles.Core += wt; counts.Core++ }
        })
      })

    // Normalize to 0–100
    const vals = Object.values(muscles)
    const max  = Math.max(...vals, 1)
    return Object.entries(muscles).map(([subject, val]) => ({
      subject,
      A: Math.round((val / max) * 100),
    }))
  }

  const radarData = buildRadarData()

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-screen"
         style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-green-muted border border-green/30
                        flex items-center justify-center">
          <Loader2 size={22} className="text-green animate-spin" />
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Loading your performance data...
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* Background blob */}
      <div className="fixed top-0 right-0 w-96 h-96 pointer-events-none -z-10"
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
            {planInfo
              ? `${planInfo.title} · ${sessions.filter(
                  (s) => s.status === "completed"
                ).length} sessions logged`
              : `${sessions.filter((s) => s.status === "completed").length} sessions logged`
            }
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >

        {/* ── PRs ─────────────────────────────────────────── */}
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
                {date !== "—" && (
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    · {date}
                  </span>
                )}
              </div>
            </div>
          ))}
        </motion.div>

        {/* ── Lift progression ─────────────────────────────── */}
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
              {liftData.length > 1 ? (
                <div className="flex items-center gap-2 mt-1">
                  {trending
                    ? <TrendingUp  size={14} className="text-green" />
                    : <TrendingDown size={14} className="text-red-400" />
                  }
                  <span className={`text-sm font-bold
                                    ${trending ? "text-green" : "text-red-400"}`}>
                    {trending ? "+" : ""}{diff}kg over {liftData.length} weeks
                  </span>
                </div>
              ) : (
                <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                  {liftData.length === 0
                    ? "No data yet — log sessions to see progression"
                    : "Log more sessions to see trend"
                  }
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              {LIFTS.map((lift) => (
                <button
                  key={lift}
                  onClick={() => setActiveLift(lift)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold
                              transition-all duration-200
                              ${activeLift === lift ? "btn-green" : "btn-glass"}`}
                >
                  {LIFT_LABELS[lift].split(" ")[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="h-52 sm:h-64">
            {liftData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  No {LIFT_LABELS[activeLift]} data logged yet
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liftData}>
                  <defs>
                    <linearGradient id="liftGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%"   stopColor={LIFT_COLORS[activeLift]}
                            stopOpacity={0.25} />
                      <stop offset="100%" stopColor={LIFT_COLORS[activeLift]}
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
                        activeDot={{ r: 7, fill: LIFT_COLORS[activeLift], strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* ── Volume + Radar ───────────────────────────────── */}
        <div className="grid lg:grid-cols-2 gap-5">

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
              {volumeData.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    No volume data yet
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={volumeData} barSize={6} barGap={3}>
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
              )}
            </div>
            <div className="flex items-center gap-4 mt-3 flex-wrap">
              {[
                { label: "Chest", color: "#39FF14" },
                { label: "Back",  color: "#3B82F6" },
                { label: "Legs",  color: "#FFC800" },
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
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.07)" />
                  <PolarAngleAxis dataKey="subject"
                                  tick={{ fontSize: 11, fill: "var(--text-muted)" }} />
                  <PolarRadiusAxis tick={false} axisLine={false} domain={[0, 100]} />
                  <Radar name="Strength" dataKey="A"
                         stroke="#39FF14" strokeWidth={2}
                         fill="#39FF14" fillOpacity={0.12} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* ── Session log — real data ───────────────────────── */}
        <motion.div variants={fadeUp}>
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-green font-semibold tracking-widest">
              SESSION LOG — {sessions.length} total
            </p>
            <div className="flex items-center gap-3 text-xs"
                 style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1">
                <Shield size={11} className="text-green" /> Planned
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle size={11} className="text-blue-400" /> Completed
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle size={11} style={{ color: "#FFC800" }} /> Anomaly
              </span>
              <span className="flex items-center gap-1">
                <Target size={11} className="text-red-400" /> Skipped
              </span>
              {/* {sessions} */}
            </div>
          </div>

          {sessions.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center"
                 style={{ borderColor: "var(--glass-border)" }}>
              <Dumbbell size={28} className="text-green mx-auto mb-3" />
              <p className="font-display font-700 text-xl uppercase mb-2"
                 style={{ color: "var(--text)" }}>
                No Sessions Yet
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Start logging your workouts to track progress
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sessions.slice(0, 10).map((session) => (
                <SessionRow key={session._id} session={session} />
              ))}
            </div>
          )}
        </motion.div>
      </motion.div>
    </div>
  )
}