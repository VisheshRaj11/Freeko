import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Dumbbell, TrendingUp, Brain, CheckCircle,
  ChevronRight, Flame, Target, Calendar,
  Activity, AlertTriangle, Play,
  MessageSquare, BarChart3, Shield, Loader2,
  SkipForward,
  Check,
  BedDouble,
  BicepsFlexed
} from "lucide-react"
import { useAuthStore } from "../../../store/authStore"
import api from "../../lib/axios"
import { useWorkoutStore } from "../../../store/setStore"

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

// ── Week strip ─────────────────────────────────────────────────
function WeekStrip({ sessions }) {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
  const today = new Date().getDay() // 0=Sun,1=Mon...
  const todayIdx = today === 0 ? 6 : today - 1
  console.log(todayIdx);

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      {days.map((day, i) => {
        const session = sessions?.find((s) => {
          const d = new Date(s.loggedAt || s.createdAt)
          const sDay = d.getDay() === 0 ? 6 : d.getDay() - 1
          return sDay === i
        })
        const done   = session?.status === "completed"
        const active = i === todayIdx && !done
        const rest   = !session && i !== todayIdx

        return (
          <motion.div
            key={day}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 * i }}
            className={`flex-shrink-0 flex flex-col items-center gap-1.5
                        px-3 py-3 rounded-xl border transition-all duration-200
                        ${active
                          ? "border-green bg-green-muted"
                          : done
                            ? "border-green/20 bg-green/5"
                            : "glass-card opacity-60"
                        }`}
            style={{ minWidth: "64px" }}
          >
            <span className="text-xs font-bold tracking-widest"
                  style={{ color: active || done ? "var(--green)" : "var(--text-muted)" }}>
              {day}
            </span>
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center
              ${done
                ? "bg-green"
                : active
                  ? "border border-green bg-green-muted"
                  : "border border-white/10"
              }`}>
              {done
                ? <CheckCircle size={14} color="#080808" fill="#080808" />
                : <Dumbbell size={12} style={{ color: active
                    ? "var(--green)" : "var(--text-dim)" }} />
              }
            </div>
            <span className="text-xs truncate max-w-[56px] text-center"
                  style={{ color: active ? "var(--green)" : "var(--text-dim)" }}>
              {session?.dayLabel?.split("—")[1]?.trim() || (active ? "Today" : "—")}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

// ── Exercise row (read-only on dashboard) ──────────────────────
function ExRow({ ex, index }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3.5 rounded-xl
                  border transition-all duration-200
                  ${ex.completed
                    ? "border-green/25 bg-green/5"
                    : "glass-card"
                  }`}
      style={{ borderColor: ex.completed
        ? "rgba(57,255,20,0.25)"
        : "var(--glass-border)" }}
    >
      <div className="flex items-center gap-3">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center
                         flex-shrink-0
                         ${ex.completed ? "bg-green" : "bg-green-muted border border-green/20"}`}>
          {ex.completed
            ? <CheckCircle size={14} color="#080808" />
            : <Dumbbell size={13} className="text-green" />
          }
        </div>
        <span className={`text-sm font-medium ${ex.completed ? "line-through" : ""}`}
              style={{ color: ex.completed ? "var(--text-muted)" : "var(--text)" }}>
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
                  backgroundColor: ex.completed
                    ? "rgba(57,255,20,0.1)"
                    : "rgba(255,255,255,0.04)",
                  color: ex.completed ? "var(--green)" : "var(--text-muted)",
                }}>
            {ex.weight}kg
          </span>
        )}
        {ex.rpe > 0 && (
          <span className="px-2 py-1 rounded-lg glass-card">
            RPE {ex.rpe}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function AthleteDashboard() {
  const { user }   = useAuthStore()
  const navigate   = useNavigate()
  const [loading,  setLoading]  = useState(true)
  const [profile,  setProfile]  = useState(null)
  const [plan,     setPlan]     = useState(null)
  const [sessions, setSessions] = useState([])
  const [anomaly,  setAnomaly]  = useState(null)
  const [todaySession, setTodaySession] = useState(null);
  console.log(todaySession)
  // const {setCompletion, toggleSet, isExerciseCompleted} = useWorkoutStore();
  const [showSkipScreen, setShowSkipScreen] = useState(false)
  console.log(todaySession);

  const [stats,    setStats]    = useState({
    streak: 0, totalSessions: 0, compliance: 0
  });

  useEffect(() => {
    const load = async () => {
      try {
        // 1. Fetch athlete profile
        const { data: prof } = await api.get(`/athlete/${user.id}`);
        // console.log(prof);
        setProfile(prof)
        // console.log(profile)
  
        // 2. Fetch active plan
        const { data: plans } = await api.get(`/plan/athlete/${prof._id}`);
        // console.log(plans);
        const active = plans.find((p) => p.status === "active") || plans[0];
        // console.log(active)
        if (active) {
          // Fetch full nested plan
          const { data: fullPlan } = await api.get(`/plan/${active._id}`)
          setPlan(fullPlan)
        }
  
        // 3. Fetch recent workout sessions
        const { data: recentSessions } = await api.get(
          `/workout/athlete/${prof._id}`
        )
  
        console.log(recentSessions);
  
        setSessions(recentSessions)
  
        // 4. Find today's planned session
        // ✅ New — matches by actual date OR by weekday name only for planned sessions
        const today     = new Date()
        const todayName = today.toLocaleDateString("en-US", { weekday: "long" })

        const todaySess = recentSessions.find((s) => {
          // If session has a loggedAt date, check if it's actually today
          if (s.loggedAt) {
            const sessionDate = new Date(s.loggedAt)
            const isSameDay =
              sessionDate.getDate()     === today.getDate()     &&
              sessionDate.getMonth()    === today.getMonth()    &&
              sessionDate.getFullYear() === today.getFullYear()
            return isSameDay
          }

          // For planned sessions (no loggedAt yet), match by weekday name
          // BUT only if it's actually the right day of week
          if (s.status === "planned" || s.status === "in_progress") {
            return s.dayLabel?.toLowerCase().includes(todayName.toLowerCase())
          }

          return false
        })

        setTodaySession(todaySess || null)
  
        // 5. Fetch latest anomaly for this athlete
        const { data: anomalyData } = await api.get(
          `/anomaly/athlete/${user.id}`
        )
        if (anomalyData.length > 0) {
          const latest = anomalyData[0]
          if (latest.aiAnomalyReport?.detected) {
            setAnomaly(latest.aiAnomalyReport)
          }
        }
  
        // 6. Calculate real stats
        const completed = recentSessions.filter(
          (s) => s.status === "completed"
        )
        const planned   = recentSessions.filter(
          (s) => s.status !== "skipped"
        )
        const compliance = planned.length > 0
          ? Math.round((completed.length / planned.length) * 100)
          : 0
  
        // Streak — consecutive days with completed sessions
        // ── STREAK LOGIC ─────────────────────────

              // normalize date to midnight
              const normalizeDate = (date) => {
                const d = new Date(date)

                d.setHours(0, 0, 0, 0)

                return d.getTime()
              }

              // only completed sessions
              const completedSessions = recentSessions.filter(
                (s) => s.status === "completed"
              )

              // unique completed workout days
              const completedDays = [
                ...new Set(
                completedSessions.map((s) =>
                normalizeDate(
                  s.loggedAt || s.updatedAt || s.createdAt
                )
              )
            )
          ].sort((a, b) => b - a)

          let streak = 0

          const todayy = new Date()
          todayy.setHours(0, 0, 0, 0)

          // check consecutive days
          for (let i = 0; i < completedDays.length; i++) {

            const expected = new Date(todayy)

            expected.setDate(todayy.getDate() - i)

            if (
              completedDays[i] === expected.getTime()
            ) {
              streak++
            } else {
              break
            }
          }
          setStats({
            streak,
            totalSessions: completed.length,
            compliance,
          })
      } catch (err) {
        console.error("Dashboard load error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  
  if (showSkipScreen) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col
                 items-center justify-center
                 px-4 text-center"
      style={{ backgroundColor: "var(--bg)" }}
    >

      {/* glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2
                     -translate-x-1/2 -translate-y-1/2
                     w-[600px] h-[600px] rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(255,200,0,0.12) 0%, transparent 65%)",

            filter: "blur(60px)",
          }}
        />
      </div>

      {/* icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 200,
          delay: 0.2,
        }}
        className="w-24 h-24 rounded-3xl
                   flex items-center justify-center
                   mb-8"
        style={{
          backgroundColor: "#39FF14",
          boxShadow:
            "0 0 60px rgba(255,200,0,0.4)",
        }}
      >
        <SkipForward
          size={44}
          color="#080808"
        />
      </motion.div>

      {/* text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >

        <p
          className="text-xs font-semibold
                     tracking-widest mb-2"
          style={{ color: "#39FF14" }}
        >
          SESSION SKIPPED
        </p>

        <h1
          className="font-display font-900
                     text-5xl uppercase
                     tracking-tight mb-2"
          style={{
            color: "#39FF14",
            textShadow:
              "0 0 40px rgba(255,200,0,0.35)",
          }}
        >
          RECOVER WELL
        </h1>

        <p
          className="text-lg mb-8"
          style={{
            color: "var(--text-muted)"
          }}
        >
          Recovery matters too.
          Come back stronger tomorrow 
        </p>

      </motion.div>

      {/* button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => setShowSkipScreen(false)}
        className="px-10 py-4 rounded-2xl
                   btn-green text-base
                   font-bold flex items-center gap-2"
      >
        <Check size={18} />
        Back to Dashboard
      </motion.button>

    </motion.div>
  )
}

  const handleSkip = async (sessionId) => {
  try {

    await api.patch(
      `/workout/${sessionId}/skip`
    )

    // update UI instantly
    setTodaySession((prev) => ({
      ...prev,
      status: "skipped"
    }))

    setSessions((prev) =>
      prev.map((s) =>
        s._id === sessionId
          ? {
              ...s,
              status: "skipped"
            }
          : s
      )
    )

     setShowSkipScreen(true)

  } catch (error) {

    console.error(
      "Failed to skip session",
      error
    )

  }
}


  // ── Derived values ──────────────────────────────────────────
  const masterPlan = plan?.plan
  const mesocycles = plan?.mesocycles || []

  // Current week number
  const currentWeek = masterPlan
    ? Math.min(
        Math.ceil(
          (Date.now() - new Date(masterPlan.startDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
        ),
        masterPlan.totalWeeks
      )
    : 0

  // console.log(profile)
  // Progress %
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000

  const calculateProgress = (plan) => {
    if (!plan?.startDate || !plan?.totalWeeks) return 0

    const start = new Date(plan.startDate).getTime()
    const end = start + plan.totalWeeks * WEEK_MS

    return Math.min(
      Math.round(((Date.now() - start) / (end - start)) * 100),
      100
    )
  }

  const progress = calculateProgress(masterPlan)

  // Current mesocycle
  const currentMeso = mesocycles.find(
    (m) => currentWeek >= m.weekStart && currentWeek <= m.weekEnd
  )

  // This week's sessions (from all microcycles in current meso)
  const weekSessions = mesocycles
    .flatMap((m) => m.microcycles || [])
    .find((micro) => micro.weekNumber === currentWeek)
    ?.sessions || []

  // Recent completed sessions
  const recentCompleted = sessions
    .filter((s) => s.status === "completed")
    .slice(0, 3)

  // Weekly volume from current week sessions
  const volumeTargets = mesocycles
    .flatMap((m) => m.microcycles || [])
    .find((micro) => micro.weekNumber === currentWeek)
    ?.volumeTargets || {}

  // Actual sets done this week per muscle (approximate from completed sessions)
  const musclesDone = {
    chest:     0, back: 0, legs: 0,
    shoulders: 0, arms: 0, core: 0,
  }
  sessions
    .filter((s) => {
      const d = new Date(s.loggedAt)
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      return s.status === "completed" && d >= weekStart
    })
    .forEach((s) => {
      s.exercises?.forEach((ex) => {
        const name = ex.name.toLowerCase()
        if (name.includes("bench") || name.includes("fly") || name.includes("chest"))
          musclesDone.chest += ex.sets || 0
        else if (name.includes("row") || name.includes("pull") || name.includes("deadlift"))
          musclesDone.back += ex.sets || 0
        else if (name.includes("squat") || name.includes("leg") || name.includes("lunge"))
          musclesDone.legs += ex.sets || 0
        else if (name.includes("shoulder") || name.includes("ohp") || name.includes("delt"))
          musclesDone.shoulders += ex.sets || 0
        else if (name.includes("curl") || name.includes("tricep") || name.includes("arm"))
          musclesDone.arms += ex.sets || 0
        else if (name.includes("core") || name.includes("ab") || name.includes("plank"))
          musclesDone.core += ex.sets || 0
      })
    })

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-screen"
         style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-green-muted border border-green/30
                        flex items-center justify-center">
          <Brain size={22} className="text-green animate-pulse" />
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Loading your dashboard...
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* Background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-64
                      pointer-events-none -z-10"
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
                         tracking-tight flex items-center gap-2"
              style={{ color: "var(--text)" }}>
            GM, {user?.name?.split(" ")[0] || "Athlete"} <BicepsFlexed size={38} color="lightGreen"/>
          </h1>
          <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
            {currentMeso?.focus
              ? `${currentMeso.name} · Week ${currentWeek} of ${masterPlan?.totalWeeks}`
              : masterPlan
                ? `Week ${currentWeek} of ${masterPlan.totalWeeks}`
                : "No active plan yet"
            }
            {profile?.assignedCoachId && (
              <span className="text-green"> · Coach assigned</span>
            )}
          </p>
        </div>

        {masterPlan && (
          <Link
            to={`/athlete/chat/${masterPlan._id}`}
            className="flex items-center gap-2 px-4 py-2.5 text-sm btn-glass"
          >
            <MessageSquare size={15} className="text-green" />
            Message Coach
          </Link>
        )}
      </motion.div>

      {/* No plan state */}
      {!masterPlan && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-2xl p-12 text-center mb-8"
        >
          <div className="w-16 h-16 rounded-2xl bg-green-muted border border-green/20
                          flex items-center justify-center mx-auto mb-4">
            <Brain size={28} className="text-green" />
          </div>
          <p className="font-display font-700 text-xl uppercase mb-2"
             style={{ color: "var(--text)" }}>
            Waiting for Your Coach
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Your coach will generate your personalized AI plan soon.
            Make sure your profile is complete.
          </p>
        </motion.div>
      )}

      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-5"
      >
        {/* ── LEFT COLUMN ──────────────────────────────────── */}
        <div className="lg:col-span-2 flex flex-col gap-5">

          {/* Plan progress card */}
          {masterPlan && (
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
                    {masterPlan.title}
                  </h2>
                  {currentMeso && (
                    <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                      {currentMeso.name} · {currentMeso.intensityLevel} intensity
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-display font-900 text-4xl text-green">
                    {progress}%
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    complete
                  </p>
                </div>
              </div>

              <div className="h-2 rounded-full overflow-hidden mb-3"
                   style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
                  className="h-full rounded-full bg-green"
                  style={{ boxShadow: "0 0 12px rgba(57,255,20,0.6)" }}
                />
              </div>

              <div className="flex items-center justify-between text-xs"
                   style={{ color: "var(--text-muted)" }}>
                <span>Week {currentWeek} of {masterPlan.totalWeeks}</span>
                {masterPlan.endDate && (
                  <span className="flex items-center gap-1">
                    <Calendar size={11} />
                    Ends:{" "}
                    {new Date(masterPlan.endDate).toLocaleDateString("en-IN", {
                      day: "numeric", month: "short", year: "numeric"
                    })}
                  </span>
                )}
              </div>

              {/* Week strip */}
              <div className="mt-5 pt-5 border-t"
                   style={{ borderColor: "var(--glass-border)" }}>
                <p className="text-xs font-semibold tracking-widest mb-3"
                   style={{ color: "var(--text-muted)" }}>
                  THIS WEEK
                </p>
                <WeekStrip sessions={weekSessions} />
              </div>
            </motion.div>
          )}

          {/* Anomaly alert — real data */}
          {anomaly && (
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
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <p className="text-sm font-semibold"
                       style={{ color: "#FFC800" }}>
                      Anomaly Detected
                    </p>
                    {anomaly.flags?.map((f) => (
                      <span key={f}
                            className="text-xs px-2 py-0.5 rounded-lg font-bold"
                            style={{
                              backgroundColor: "rgba(255,200,0,0.15)",
                              color:           "#FFC800",
                            }}>
                        {f.replace(/_/g, " ").toUpperCase()}
                      </span>
                    ))}
                  </div>
                  <p className="text-sm mb-2" style={{ color: "var(--text-muted)" }}>
                    {anomaly.summary}
                  </p>
                  {anomaly.suggestion && (
                    <div className="flex items-start gap-2 px-3 py-2 rounded-xl"
                         style={{
                           backgroundColor: "rgba(255,200,0,0.08)",
                           border:          "1px solid rgba(255,200,0,0.15)",
                         }}>
                      <Brain size={13} style={{ color: "#FFC800" }}
                             className="flex-shrink-0 mt-0.5" />
                      <p className="text-xs" style={{ color: "#FFC800" }}>
                        AI Suggestion: {anomaly.suggestion}
                      </p>
                    </div>
                  )}
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
                  {todaySession
                    ? todaySession.dayLabel
                    : weekSessions[0]?.dayLabel || "No session today"
                  }
                </h3>
               
              </div>
              {todaySession && (
                <div className="text-right">
                  <p className="font-display font-900 text-2xl text-green">
                    {todaySession.exercises?.filter((e) => e.completed).length}/
                    {todaySession.exercises?.length}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    exercises done
                  </p>
                </div>
              )}
            </div>

            {/* Progress bar */}
            {todaySession && (
              <div className="h-1.5 rounded-full overflow-hidden mb-5"
              style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${Math.round(
                      ((todaySession.exercises?.filter((e) => e.completed).length || 0) /
                        (todaySession.exercises?.length || 1)) * 100
                      )}%`
                    }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.5 }}
                    className="h-full rounded-full bg-green"
                    style={{ boxShadow: "0 0 8px rgba(57,255,20,0.5)" }}
                    />
              </div>
            )}
           

            {/* Exercises list */}
            <div className="flex flex-col gap-2">
              {(todaySession?.exercises || weekSessions[0]?.exercises || [])
                .slice(0, 5)
                .map((ex, i) => (
                  <ExRow key={i} ex={ex} index={i} />
                ))}
            </div>

            {/* Start session button */}
            {todaySession && (
              <div className="flex flex-col md:flex-row md:gap-2">
                <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={todaySession.status === 'completed' || todaySession.status === 'skipped' }
                onClick={() => navigate(`/athlete/workout/${todaySession._id}`)}
                className="mt-5 w-full py-3.5 rounded-xl btn-green flex items-center
                           justify-center gap-2 text-sm font-bold"
              >
                <Play size={15} fill="currentColor" />
                {todaySession.status === "completed"
                  ? "Completed"
                  : todaySession.status === "skipped"
                    ? "Skipped"
                    : todaySession.status === "in_progress"
                      ? "Continue Session"
                      : "Start Session"
                }
              </motion.button>
              {todaySession.status !== 'completed' && todaySession.status !== 'skipped' &&
              (<motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSkip(todaySession._id)}
                className="mt-5 w-full py-3.5 rounded-xl btn-green flex items-center
                           justify-center gap-2 text-sm font-bold"
              >
                <SkipForward size={15} fill="currentColor" />
                Skip
              </motion.button>)}
              </div>
            )}

            {/* // ✅ New — shows different message depending on whether plan exists */}
            {!todaySession && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10
                                flex items-center justify-center">
                  <BedDouble size={20} style={{ color: "var(--text-dim)" }} />
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1"
                    style={{ color: "var(--text)" }}>
                    {masterPlan ? <> Rest Day</> : "No active plan yet"}
                  </p>
                  <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {masterPlan
                      ? "No session scheduled for today. Recover well and come back stronger."
                      : "Your coach will generate your personalized AI plan soon."
                    }
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Recent sessions — real data */}
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

            {recentCompleted.length === 0 ? (
              <p className="text-sm text-center py-6"
                 style={{ color: "var(--text-muted)" }}>
                No completed sessions yet. Start logging! 💪
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {recentCompleted.map((s, i) => {
                  // Find highest weight lifted in session
                  const topEx = s.exercises?.reduce((best, ex) =>
                    (ex.weight || 0) > (best?.weight || 0) ? ex : best,
                    null
                  )
                  return (
                    <motion.div
                      key={s._id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      className="flex items-center gap-4 px-4 py-3.5 rounded-xl
                                 glass-card border hover:border-green/20 transition-all
                                 cursor-pointer group"
                      style={{ borderColor: "var(--glass-border)" }}
                      onClick={() => navigate(`/athlete/workout/${s._id}`)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-green-muted border
                                      border-green/20 flex items-center justify-center
                                      flex-shrink-0">
                        <Dumbbell size={17} className="text-green" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate"
                           style={{ color: "var(--text)" }}>
                          {s.dayLabel}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {new Date(s.loggedAt).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short"
                          })} ·{" "}
                          {s.exercises?.length || 0} exercises ·{" "}
                          {s.exercises?.reduce((t, e) => t + (e.sets || 0), 0)} sets
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        {topEx && (
                          <p className="text-xs font-semibold text-green">
                            {topEx.name} {topEx.weight}kg
                          </p>
                        )}
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <CheckCircle size={11} className="text-green" />
                          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                            Done
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.div>
        </div>

        {/* ── RIGHT COLUMN ─────────────────────────────────── */}
        <div className="flex flex-col gap-5">

          {/* Real stats */}
          <motion.div variants={fadeUp}
                      className="grid grid-cols-2 gap-3">
            {[
              { icon: Flame,      label: "Streak",     value: stats.streak,        unit: "days",    color: "#FF6B35" },
              { icon: Dumbbell,   label: "Sessions",   value: stats.totalSessions, unit: "total",   color: "var(--green)" },
              // { icon: TrendingUp, label: "PRs",        value: "—",                 unit: "tracked", color: "#3B82F6" },
              { icon: Target,     label: "Compliance", value: `${stats.compliance}`,unit: "%",      color: "var(--green)" },
            ].map(({ icon: Icon, label, value, unit, color }) => (
              <div key={label}
                   className="glass-card rounded-2xl p-4 border hover:border-green/20
                              transition-all duration-300"
                   style={{ borderColor: "var(--glass-border)" }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                     style={{ backgroundColor: `${color}15` }}>
                  <Icon size={17} style={{ color }} />
                </div>
                <p className="font-display font-900 text-3xl" style={{ color }}>
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

          {/* Weekly volume — real data */}
          <motion.div variants={fadeUp}
                      className="glass-card rounded-2xl p-5 border"
                      style={{ borderColor: "var(--glass-border)" }}>
            <p className="text-xs text-green font-semibold tracking-widest mb-4">
              WEEKLY VOLUME
            </p>
            {Object.keys(musclesDone).map((muscle) => {
              const done   = musclesDone[muscle]
              const target = volumeTargets[muscle] || 12
              const pct    = Math.min(Math.round((done / target) * 100), 100)
              const hit    = pct >= 100
              return (
                <div key={muscle} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium capitalize"
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
                      className="h-full rounded-full"
                      style={{
                        backgroundColor: hit ? "var(--green)" : "rgba(57,255,20,0.45)",
                        boxShadow:       hit ? "0 0 6px rgba(57,255,20,0.5)" : "none",
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
                {
                  icon:  MessageSquare,
                  label: "Message Coach",
                  to:    masterPlan ? `/athlete/chat/${masterPlan._id}` : "/athlete",
                  color: "var(--green)",
                },
                { icon: BarChart3,  label: "View Progress",   to: "/athlete/progress", color: "#3B82F6" },
                { icon: Shield,     label: "Anomaly History",  to: "/athlete/progress", color: "#FFC800" },
                { icon: Calendar,   label: "Full Schedule",    to: "/athlete/progress", color: "var(--green)" },
              ].map(({ icon: Icon, label, to, color }) => (
                <Link key={label} to={to}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl
                                 border hover:border-green/30 transition-all
                                 duration-200 group"
                      style={{ borderColor: "var(--glass-border)" }}>
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

          {/* AI status — real plan context */}
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
              {anomaly
                ? `Anomaly detected in your last session. ${anomaly.suggestion}`
                : currentMeso
                  ? `${currentMeso.name} is on track. ${
                      currentMeso.intensityLevel === "low"
                        ? "This is a deload — keep it light."
                        : "Keep pushing progressively."
                    }`
                  : "Your Gemini AI plan is active and monitoring your sessions."
              }
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