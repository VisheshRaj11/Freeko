import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Users, ClipboardList, Zap, FileText,
  TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, Clock, Plus, ArrowRight,
  Activity, Brain, ChevronRight, Dumbbell,
  BarChart3, MessageSquare
} from "lucide-react"
import { useAuthStore } from "../../../store/authStore"
import api from "../../lib/axios"
import {
  LineChart, Line, XAxis, YAxis,
  Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts"

// ── Animation variants ────────────────────────────────────────
const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }),
}

// ── Stat card ─────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, delay, trend }) {
  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3 }}
      className="relative p-5 rounded-2xl glass-card overflow-hidden group
                 hover:border-green/20 transition-all duration-300"
    >
      {/* Top glow on hover */}
      <div className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100
                      transition-opacity duration-500"
           style={{ background: "linear-gradient(90deg, transparent, var(--green), transparent)" }} />

      <div className="flex items-start justify-between mb-4">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
             style={{ backgroundColor: `${color}15` }}>
          <Icon size={18} style={{ color }} />
        </div>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-xs font-semibold px-2 py-1
                           rounded-lg ${trend >= 0
                             ? "bg-green/10 text-green"
                             : "bg-red-500/10 text-red-400"}`}>
            {trend >= 0
              ? <TrendingUp size={11} />
              : <TrendingDown size={11} />
            }
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <p className="font-display font-900 text-3xl leading-none mb-1"
         style={{ color: "var(--text)" }}>
        {value}
      </p>
      <p className="text-sm font-semibold mb-1"
         style={{ color: "var(--text-muted)" }}>
        {label}
      </p>
      {sub && (
        <p className="text-xs" style={{ color: "var(--text-dim)" }}>
          {sub}
        </p>
      )}
    </motion.div>
  )
}

// ── Athlete row card ──────────────────────────────────────────
function AthleteCard({ athlete, delay }) {
  const progress = athlete.progress || 0
  const statusColor = {
    active:    "var(--green)",
    draft:     "#f59e0b",
    completed: "#6b7280",
  }[athlete.planStatus] || "#6b7280"

  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      whileHover={{ y: -3 }}
      className="relative p-5 rounded-2xl glass-card group overflow-hidden
                 hover:border-green/25 transition-all duration-300 cursor-pointer"
    >
      <div className="absolute inset-x-0 top-0 h-px opacity-0
                      group-hover:opacity-100 transition-opacity duration-500"
           style={{ background: "linear-gradient(90deg, transparent, var(--green), transparent)" }} />

      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div className="w-11 h-11 rounded-xl bg-green-muted border border-green/25
                        flex items-center justify-center flex-shrink-0">
          <span className="font-display font-bold text-lg text-green">
            {athlete.name?.[0]?.toUpperCase()}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-0.5">
            <p className="font-semibold text-sm truncate"
               style={{ color: "var(--text)" }}>
              {athlete.name}
            </p>
            <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
              <div className="w-1.5 h-1.5 rounded-full"
                   style={{ backgroundColor: statusColor }} />
              <span className="text-xs capitalize font-medium"
                    style={{ color: statusColor }}>
                {athlete.planStatus || "No plan"}
              </span>
            </div>
          </div>
          <p className="text-xs mb-3" style={{ color: "var(--text-muted)" }}>
            {athlete.email}
          </p>

          {/* Progress bar */}
          {athlete.planTitle && (
            <>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs truncate max-w-[60%]"
                      style={{ color: "var(--text-muted)" }}>
                  {athlete.planTitle}
                </span>
                <span className="text-xs font-bold text-green">
                  {progress}%
                </span>
              </div>
              <div className="h-1 rounded-full overflow-hidden"
                   style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: delay * 0.06 + 0.5, duration: 0.8, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background:  "var(--green)",
                    boxShadow:   progress > 0 ? "0 0 6px rgba(57,255,20,0.5)" : "none",
                  }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2 mt-4 pt-4 border-t"
           style={{ borderColor: "var(--glass-border)" }}>
        {athlete.planId && (
          <Link to={`/coach/plan/fullPlan/${athlete.planId}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                           text-xs font-semibold transition-all hover:bg-green/10
                           hover:text-green border border-transparent
                           hover:border-green/20"
                style={{ color: "var(--text-muted)" }}>
            <ClipboardList size={12} /> View Plan
          </Link>
        )}
        {athlete.planId && (
          <Link to={`/coach/chat`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                           text-xs font-semibold transition-all hover:bg-green/10
                           hover:text-green border border-transparent
                           hover:border-green/20"
                style={{ color: "var(--text-muted)" }}>
            <MessageSquare size={12} /> Chat
          </Link>
        )}
        <Link to="/coach/athletes"
              className="ml-auto flex items-center gap-1 text-xs
                         font-semibold text-green hover:underline">
          Profile <ChevronRight size={12} />
        </Link>
      </div>
    </motion.div>
  )
}

// ── Anomaly flag card ─────────────────────────────────────────
function AnomalyCard({ anomaly, delay }) {
  const flagColors = {
    bench_drop:       "#ef4444",
    shoulder_fatigue: "#f59e0b",
    overtraining:     "#ef4444",
    high_rpe_trend:   "#f59e0b",
    volume_drop:      "#6b7280",
    squat_drop:       "#ef4444",
    muscle_imbalance: "#f59e0b",
  }

  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="flex items-start gap-4 p-4 rounded-xl transition-all duration-200
                 hover:bg-white/3 group"
      style={{ borderBottom: "1px solid var(--glass-border)" }}
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center
                      flex-shrink-0 bg-red-500/10">
        <AlertTriangle size={16} className="text-red-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <p className="text-sm font-semibold truncate"
             style={{ color: "var(--text)" }}>
            {anomaly.athleteName}
          </p>
          <span className="text-xs ml-2 flex-shrink-0"
                style={{ color: "var(--text-muted)" }}>
            {anomaly.time}
          </span>
        </div>
        <p className="text-xs leading-relaxed mb-2"
           style={{ color: "var(--text-muted)" }}>
          {anomaly.summary}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {anomaly.flags?.map((flag) => (
            <span key={flag}
                  className="text-xs px-2 py-0.5 rounded-md font-semibold"
                  style={{
                    backgroundColor: `${flagColors[flag] || "#6b7280"}15`,
                    color:           flagColors[flag] || "#6b7280",
                    border:          `1px solid ${flagColors[flag] || "#6b7280"}30`,
                  }}>
              {flag.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ── Custom recharts tooltip ───────────────────────────────────
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl glass-card-bright text-xs"
         style={{ border: "1px solid var(--glass-border-bright)" }}>
      <p className="font-semibold mb-1 text-green">{label}</p>
      <p style={{ color: "var(--text-muted)" }}>
        Sessions: <span style={{ color: "var(--text)" }}>{payload[0]?.value}</span>
      </p>
    </div>
  )
}

// ── Main Dashboard ────────────────────────────────────────────
export default function CoachDashboard() {
  const { user }   = useAuthStore()
  const [athletes, setAthletes] = useState([])
  const [anomalies,setAnomalies]= useState([])
  const [loading,  setLoading]  = useState(true)

  const sessionCounts = {}
  const weeks = ["Wk 1","Wk 2","Wk 3","Wk 4","Wk 5","Wk 6","Wk 7","Wk 8"]
  weeks.forEach((w) => { sessionCounts[w] = 0 })

  const [chartData,     setChartData]     = useState([])
  const [totalSessions, setTotalSessions] = useState(0)
  const [roster,     setRoster]         = useState([])
  
    // Fetch roster
  useEffect(() => {
    const fetchRoster = async () => {
    try {
      const res = await api.get(`/coach/${user.id}/athletes`)
      setRoster(res.data)
    } catch { setRoster([]) }
  }
  fetchRoster();
  },[user.id])
  useEffect(() => {
    const load = async () => {
      try {
        // Fetch athletes assigned to this coach
        const { data: athleteProfiles } = await api.get(
          `/coach/${user.id}/athletes`
        )
        // console.log(athleteProfiles[0])

        // For each athlete, try to fetch their active plan
        const enriched = await Promise.all(
          athleteProfiles.map(async (ap) => {
            // console.log(ap);
            try {
              const { data: plans } = await api.get(
                `/plan/athlete/${ap._id}`
              )
              // console.log(plans)
              const active = plans.find((p) => p.status === "active") || plans[0]
              console.log(active)

              // Calculate rough progress
              // Calculate progress based on completed workouts

              // Calculate progress based on completed exercises

// Calculate progress from completed workout sessions

              let progress = 0

              if (active) {

                try {

                  const { data: sessions } = await api.get(
                    `/workout/athlete/${ap._id}`
                  )

                  // Count completed sessions
                  const completedSessions = sessions.filter(
                    session => session.status === "completed"
                  ).length

                  // Change this if athletes don't train every day
                  const DAYS_PER_WEEK = 7

                  const expectedSessions =
                    (active.totalWeeks || 0) * DAYS_PER_WEEK

                  if (expectedSessions > 0) {

                    progress = Math.round(
                      (completedSessions / expectedSessions) * 100
                    )

                    }

                    progress = Math.min(100, progress)

                  }

                  catch (err) {

                    console.error(err)

                    progress = 0

                  }

                }

              return {
                id:         ap._id,
                name:       ap.userId.name,
                email:      ap.userId.email,
                planId:     active?._id     || null,
                planTitle:  active?.title   || null,
                planStatus: active?.status  || "No plan",
                progress,
              }
            } catch {
              return {
                id:         ap.userId._id,
                name:       ap.userId.name,
                email:      ap.userId.email,
                planId:     null,
                planTitle:  null,
                planStatus: "No plan",
                progress:   0,
              }
            }
          })
        )

        setAthletes(enriched);

        await Promise.all(
        enriched.map(async (a) => {
          try {
            // console.log(a)
            const { data: sessions } = await api.get(`/workout/athlete/${a.id}`)
            console.log(sessions)
            sessions.forEach((s) => {
              if (s.status !== "completed") return
              const date    = new Date(s.loggedAt)
              const now     = new Date()
              const diffMs  = now - date
              const diffDays= Math.floor(diffMs / (1000 * 60 * 60 * 24))
              const weekIdx = Math.floor(diffDays / 7)
              // Map to last 8 weeks (0 = this week, 7 = oldest)
              const label   = weeks[Math.min(7 - weekIdx, 7)]
              if (label) sessionCounts[label]++
            })
          } catch { }
        })
      )

      const realChartData = weeks.map((w) => ({
        week:     w,
        sessions: sessionCounts[w],
      }))
      setChartData(realChartData)

      // Real total sessions count
      const totalSessions = Object.values(sessionCounts).reduce((a, b) => a + b, 0)
      setTotalSessions(totalSessions)

        // Fetch anomaly reports for all athletes
        const anomalyResults = await Promise.all(
          enriched.map(async (a) => {
            try {
              const { data } = await api.get(`/anomaly/athlete/${a.id}`)
              return data.slice(0, 2).map((s) => ({
                athleteName: a.name,
                summary:     s.aiAnomalyReport.summary,
                flags:       s.aiAnomalyReport.flags,
                time:        new Date(s.loggedAt).toLocaleDateString(),
              }))
            } catch { return [] }
          })
        )
        setAnomalies(anomalyResults.flat().slice(0, 6))
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  const activeCount   = athletes.filter((a) => a.planStatus === "active").length
  const anomalyCount  = anomalies.length
  const totalAthletes = athletes.length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-muted border border-green/30
                          flex items-center justify-center">
            <Brain size={22} className="text-green animate-pulse" />
          </div>
          <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-full p-6 lg:p-8"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Background blob ── */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full pointer-events-none -z-10"
           style={{
             background: "radial-gradient(circle, rgba(57,255,20,0.05) 0%, transparent 65%)",
             filter:     "blur(80px)",
           }} />

      {/* ══════════════════════════════════════
          HEADER
      ══════════════════════════════════════ */}
      <motion.div
        custom={0} variants={fadeUp}
        initial="hidden" animate="visible"
        className="flex flex-col sm:flex-row sm:items-center
                   justify-between gap-4 mb-8"
      >
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-green pulse-green" />
            <span className="text-xs font-semibold tracking-widest text-green">
              COACH DASHBOARD
            </span>
          </div>
          <h1 className="font-display font-900 uppercase leading-[0.9]"
              style={{
                fontSize:      "clamp(1.8rem, 4vw, 2.8rem)",
                color:         "var(--text)",
                letterSpacing: "-0.01em",
              }}>
            WELCOME BACK,
            <br />
            <span className="text-green">
              {user?.name?.split(" ")[0].toUpperCase()}
            </span>
          </h1>
          <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
            Here's what's happening with your athletes today.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <Link to="/coach/athletes"
                className="flex items-center gap-2 px-4 py-2.5 text-sm btn-glass">
            <Users size={15} /> Athletes
          </Link>
          <Link to="/coach/athletes"
                className="flex items-center gap-2 px-4 py-2.5 text-sm btn-green">
            <Plus size={15} /> New Plan
          </Link>
        </div>
      </motion.div>

      {/* ══════════════════════════════════════
          STATS ROW
      ══════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Athletes"
          value={totalAthletes}
          sub="Under your coaching"
          color="var(--green)"
          delay={1}
          trend={12}
        />
        <StatCard
          icon={Activity}
          label="Active Plans"
          value={roster.length}
          sub={`${totalAthletes - activeCount} pending`}
          color="#3b82f6"
          delay={2}
          trend={8}
        />
        <StatCard
          icon={AlertTriangle}
          label="Anomalies"
          value={anomalyCount}
          sub="This week"
          color="#ef4444"
          delay={3}
          trend={anomalyCount > 0 ? -5 : 0}
        />
        <StatCard
          icon={FileText}
          label="Reports"
          value="Auto"
          sub="Every Sunday"
          color="#8b5cf6"
          delay={4}
        />
      </div>

      {/* ══════════════════════════════════════
          MAIN GRID
      ══════════════════════════════════════ */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ── Left: Athletes (2/3 width) ── */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Athletes header */}
          <motion.div
            custom={5} variants={fadeUp}
            initial="hidden" animate="visible"
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-muted border border-green/20
                              flex items-center justify-center">
                <Users size={15} className="text-green" />
              </div>
              <h2 className="font-display font-700 text-xl uppercase tracking-tight"
                  style={{ color: "var(--text)" }}>
                Your Athletes
              </h2>
            </div>
            <Link to="/coach/athletes"
                  className="flex items-center gap-1 text-xs font-semibold
                             text-green hover:underline">
              View all <ArrowRight size={13} />
            </Link>
          </motion.div>

          {/* Athletes grid */}
          {athletes.length === 0 ? (
            <motion.div
              custom={6} variants={fadeUp}
              initial="hidden" animate="visible"
              className="glass-card rounded-2xl p-12 text-center"
            >
              <div className="w-16 h-16 rounded-2xl bg-green-muted border border-green/20
                              flex items-center justify-center mx-auto mb-4">
                <Users size={28} className="text-green" />
              </div>
              <p className="font-display font-700 text-xl uppercase mb-2"
                 style={{ color: "var(--text)" }}>
                No Athletes Yet
              </p>
              <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                Add your first athlete and generate their AI plan.
              </p>
              <Link to="/coach/athletes"
                    className="inline-flex items-center gap-2 px-5 py-2.5
                               text-sm btn-green">
                <Plus size={15} /> Add Athlete
              </Link>
            </motion.div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-4">
              {athletes.slice(0, 6).map((a, i) => (
                <AthleteCard key={a.id} athlete={a} delay={6 + i} />
              ))}
            </div>
          )}

          {/* ── Sessions chart ── */}
          <motion.div
            custom={12} variants={fadeUp}
            initial="hidden" animate="visible"
            className="glass-card rounded-2xl p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-muted border border-green/20
                                flex items-center justify-center">
                  <BarChart3 size={15} className="text-green" />
                </div>
                <div>
                  <h3 className="font-display font-700 text-lg uppercase tracking-tight"
                      style={{ color: "var(--text)" }}>
                    Sessions This Month
                  </h3>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Across all athletes
                  </p>
                </div>
              </div>
              <span className="text-2xl font-display font-900 text-green">
                 {totalSessions}
              </span>
            </div>

            {chartData.length === 0 ? (
              <div className="h-40 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-green
                                  border-t-transparent animate-spin" />
                  <p className="text-xs text-green">Loading session data...</p>
                </div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={160}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(255,255,255,0.04)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="week"
                    tick={{ fill: "var(--text-muted)", fontSize: 11,
                            fontFamily: "Space Grotesk" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "var(--text-muted)", fontSize: 11,
                            fontFamily: "Space Grotesk" }}
                    axisLine={false}
                    tickLine={false}
                    width={28}
                    allowDecimals={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="sessions"
                    stroke="var(--green)"
                    strokeWidth={2}
                    dot={{ fill: "var(--green)", r: 3, strokeWidth: 0 }}
                    activeDot={{
                      r: 5, fill: "var(--green)",
                      stroke: "rgba(57,255,20,0.3)",
                      strokeWidth: 4,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </motion.div>
        </div>

        {/* ── Right: Anomalies + Quick actions (1/3 width) ── */}
        <div className="flex flex-col gap-6">

          {/* Anomaly feed */}
          <motion.div
            custom={6} variants={fadeUp}
            initial="hidden" animate="visible"
            className="glass-card rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b"
                 style={{ borderColor: "var(--glass-border)" }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center
                                justify-center">
                  <AlertTriangle size={15} className="text-red-400" />
                </div>
                <h3 className="font-display font-700 text-lg uppercase tracking-tight"
                    style={{ color: "var(--text)" }}>
                  Anomalies
                </h3>
              </div>
              {anomalyCount > 0 && (
                <span className="text-xs font-bold px-2 py-1 rounded-lg
                                 bg-red-500/10 text-red-400 border border-red-500/20">
                  {anomalyCount} flagged
                </span>
              )}
            </div>

            {/* List */}
            <div className="divide-y"
                 style={{ divideColor: "var(--glass-border)" }}>
              {anomalies.length === 0 ? (
                <div className="px-5 py-10 text-center">
                  <CheckCircle size={28} className="text-green mx-auto mb-3" />
                  <p className="text-sm font-semibold"
                     style={{ color: "var(--text)" }}>
                    All Clear
                  </p>
                  <p className="text-xs mt-1"
                     style={{ color: "var(--text-muted)" }}>
                    No anomalies detected this week
                  </p>
                </div>
              ) : (
                anomalies.map((a, i) => (
                  <AnomalyCard key={i} anomaly={a} delay={7 + i} />
                ))
              )}
            </div>
          </motion.div>

          {/* Quick actions card */}
          <motion.div
            custom={8} variants={fadeUp}
            initial="hidden" animate="visible"
            className="glass-card rounded-2xl p-5"
          >
            <h3 className="font-display font-700 text-lg uppercase tracking-tight mb-4"
                style={{ color: "var(--text)" }}>
              Quick Actions
            </h3>
            <div className="flex flex-col gap-2">
              {[
                { icon: Plus,          label: "Generate New Plan",    to: "/coach/athletes",   color: "var(--green)"   },
                { icon: Users,         label: "Manage Athletes",      to: "/coach/athletes",   color: "#3b82f6"        },
                { icon: FileText,      label: "View All Reports",     to: "/coach/reports",    color: "#8b5cf6"        },
                { icon: MessageSquare, label: "Open Chat",            to: "/coach/chat",color: "#f59e0b"        },
              ].map(({ icon: Icon, label, to, color }) => (
                <Link key={label} to={to}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl
                                 transition-all duration-200 hover:bg-white/5 group"
                      style={{ border: "1px solid var(--glass-border)" }}>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center
                                  flex-shrink-0 transition-all duration-200
                                  group-hover:scale-110"
                       style={{ backgroundColor: `${color}12` }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                  <span className="text-sm font-medium flex-1"
                        style={{ color: "var(--text-muted)" }}>
                    {label}
                  </span>
                  <ChevronRight size={14}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color }} />
                </Link>
              ))}
            </div>
          </motion.div>

          {/* AI status card */}
          <motion.div
            custom={9} variants={fadeUp}
            initial="hidden" animate="visible"
            className="rounded-2xl p-5 overflow-hidden relative"
            style={{
              background: "linear-gradient(135deg, rgba(57,255,20,0.08) 0%, rgba(57,255,20,0.03) 100%)",
              border:     "1px solid rgba(57,255,20,0.2)",
            }}
          >
            <div className="absolute top-0 right-0 w-32 h-32 rounded-full
                            pointer-events-none"
                 style={{
                   background: "radial-gradient(circle, rgba(57,255,20,0.1) 0%, transparent 70%)",
                   filter:     "blur(20px)",
                 }} />
            <div className="relative flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-green/20 border border-green/30
                              flex items-center justify-center flex-shrink-0">
                <Brain size={18} className="text-green" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-display font-700 text-base uppercase"
                     style={{ color: "var(--text)" }}>
                    AI Status
                  </p>
                  <div className="w-1.5 h-1.5 rounded-full bg-green pulse-green" />
                </div>
                <p className="text-xs leading-relaxed"
                   style={{ color: "var(--text-muted)" }}>
                  Gemini AI is active. Next weekly report generates automatically
                  this Sunday at midnight.
                </p>
                <div className="flex items-center gap-2 mt-3 text-xs font-semibold text-green">
                  <Clock size={12} />
                  Sunday 00:00 · Auto-scheduled
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}