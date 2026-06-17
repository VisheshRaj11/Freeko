import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  FileText, Brain, ChevronDown, ChevronUp,
  TrendingUp, TrendingDown, AlertTriangle,
  CheckCircle, Calendar, Download, Filter,
  BarChart3, Activity, Users, Loader2
} from "lucide-react"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area
} from "recharts"
import { useAuthStore } from "../../../store/authStore"
import api from "../../lib/axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import html2canvas from "html2canvas"
import { useRef } from "react"

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  },
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

// ── Tooltip ────────────────────────────────────────────────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="px-3 py-2 rounded-xl glass-card text-xs"
         style={{ border: "1px solid var(--glass-border-bright)" }}>
      <p className="text-green font-semibold mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: "var(--text-muted)" }}>
          {p.name}:{" "}
          <span style={{ color: "var(--text)" }}>
            {p.value}{p.unit || ""}
          </span>
        </p>
      ))}
    </div>
  )
}

// ── Report card ────────────────────────────────────────────────
function ReportCard({ report }) {
  const [open, setOpen] = useState(false)
  const chartRef = useRef(null)
  const hasAnomaly = report.anomalyFlags?.length > 0 ||
                     report.anomalyInsights?.toLowerCase().includes("detected") ||
                     report.anomalyInsights?.toLowerCase().includes("flag")

  // Build daily volume from sessions for this week
  const dayOrder = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
  const performanceData = dayOrder.map((day) => {
    const session = report.sessions?.find((s) =>
      s.dayLabel?.toLowerCase().includes(day.toLowerCase())
    )
    if (!session || session.status !== "completed") {
      return { day, volume: 0, rpe: 0 }
    }
    const totalSets = session.exercises?.reduce(
      (t, e) => t + (e.sets || 0), 0
    ) || 0
    const avgRpe = session.exercises?.length
      ? parseFloat(
          (session.exercises.reduce((t, e) => t + (e.rpe || 0), 0) /
            session.exercises.length).toFixed(1)
        )
      : 0
    return { day, volume: totalSets, rpe: avgRpe }
  })

  const downloadPDF = async () => {

  const doc = new jsPDF()

  // ---------- TITLE ----------

  doc.setTextColor(57,255,20)

  doc.setFontSize(24)

  doc.text(
    "GYM AI WEEKLY REPORT",
    14,
    20
  )

  doc.setTextColor(0,0,0)

  // ---------- ATHLETE INFO ----------

  doc.setFontSize(12)

  doc.text(
    `Athlete : ${report.athleteName}`,
    14,
    40
  )

  doc.text(
    `Week : ${report.weekNumber}`,
    14,
    48
  )

  doc.text(
    `Plan : ${report.planTitle}`,
    14,
    56
  )

  doc.text(
    `Generated : ${
      new Date(
        report.generatedAt
      ).toLocaleDateString()
    }`,
    14,
    64
  )

  // ---------- SUMMARY ----------

  let y = 80

  doc.setFontSize(18)

  doc.text(
    "Week Summary",
    14,
    y
  )

  y += 10

  report.summaryBullets?.forEach((bullet)=>{

    doc.setFontSize(11)

    doc.text(

      `• ${bullet}`,

      18,

      y

    )

    y += 8

  })


  // ---------- COMPLIANCE ----------

  y += 8

  doc.setFontSize(18)

  doc.text(
    "Compliance",
    14,
    y
  )

  y += 10

  const compliance = Math.round(

    (
      report.sessionsCompleted /

      Math.max(
        report.sessionsTotal,
        1
      )

    ) * 100

  )

  doc.setFontSize(11)

  doc.text(

    `Completed Sessions : ${report.sessionsCompleted}`,

    18,

    y

  )

  y += 8

  doc.text(

    `Total Sessions : ${report.sessionsTotal}`,

    18,

    y

  )

  y += 8

  doc.text(

    `Compliance : ${compliance}%`,

    18,

    y

  )


  // ---------- ANOMALIES ----------

  y += 20

  doc.setFontSize(18)

  doc.text(

    "AI Anomalies",

    14,

    y

  )

  y += 10


  if(report.anomalyFlags?.length){

    report.anomalyFlags.forEach((flag)=>{

      doc.setFontSize(11)

      doc.text(

        `• ${flag}`,

        18,

        y

      )

      y += 8

    })

  }

  else{

    doc.text(

      "No anomalies detected",

      18,

      y

    )

  }


  // ---------- AI INSIGHTS ----------

  y += 20

  doc.setFontSize(18)

  doc.text(

    "AI Insights",

    14,

    y

  )

  y += 10


  const text = doc.splitTextToSize(

    report.anomalyInsights ||

    "No insights available",

    180

  )


  doc.setFontSize(11)

  doc.text(

    text,

    18,

    y

  )


  // ---------- DAILY CHART ----------

  if(chartRef.current){

    const canvas = await html2canvas(

      chartRef.current

    )

    const img = canvas.toDataURL(

      "image/png"

    )

    doc.addPage()

    doc.setFontSize(18)

    doc.text(

      "Daily Volume Graph",

      14,

      20

    )

    doc.addImage(

      img,

      "PNG",

      10,

      30,

      190,

      100

    )

  }


  // ---------- FOOTER ----------

  const pageHeight = doc.internal.pageSize.height

  doc.setFontSize(10)

  doc.text(

    "Generated by Gym AI System",

    14,

    pageHeight - 10

  )


  // ---------- SAVE ----------

  doc.save(

    `${report.athleteName}_week_${report.weekNumber}.pdf`

  )

} 

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
      {/* Header */}

      <div
        onClick={() => setOpen(!open)}
        className="w-full flex items-start sm:items-center
                  justify-between gap-4 p-5
                  hover:bg-white/5
                  transition-all
                  text-left
                  cursor-pointer"
      >

        <div className="flex items-start sm:items-center gap-4">

          <div
            className={`w-11 h-11 rounded-xl flex items-center
                        justify-center flex-shrink-0
                        ${
                          hasAnomaly
                            ? "bg-yellow-500/10 border border-yellow-500/20"
                            : "bg-green-muted border border-green/20"
                        }`}
          >

            {hasAnomaly ? (

              <AlertTriangle
                size={18}
                style={{ color:"#FFC800" }}
              />

            ) : (

              <CheckCircle
                size={18}
                className="text-green"
              />

            )}

          </div>

          <div>

            <div className="flex flex-wrap items-center gap-2 mb-1">

              <span
                className="font-display font-700 text-lg uppercase tracking-tight"
                style={{ color:"var(--text)" }}
              >

                {report.athleteName}

              </span>

              <span
                className="text-xs px-2.5 py-1 rounded-lg bg-green-muted text-green"
              >

                WEEK {report.weekNumber}

              </span>

              {hasAnomaly && (

                <span
                  className="text-xs px-2.5 py-1 rounded-lg font-semibold"
                  style={{
                    backgroundColor:"rgba(255,200,0,0.12)",
                    color:"#FFC800"
                  }}
                >

                  ANOMALY

                </span>

              )}

            </div>

            <div
              className="flex flex-wrap items-center gap-3 text-xs"
              style={{ color:"var(--text-muted)" }}
            >

              <span className="flex items-center gap-1">

                <BarChart3 size={11} />

                {report.planTitle}

              </span>

              <span className="flex items-center gap-1">

                <Calendar size={11} />

                {report.generatedAt
                  ? new Date(report.generatedAt)
                      .toLocaleDateString(
                        "en-IN",
                        {
                          day:"numeric",
                          month:"short",
                          year:"numeric"
                        }
                      )
                  : "—"}

              </span>

              <span className="flex items-center gap-1">

                <Brain
                  size={11}
                  className="text-green"
                />

                AI Generated

              </span>

            </div>

          </div>

        </div>

        <div
          className="flex items-center gap-3 flex-shrink-0"
        >

          <button

            onClick={(e)=>{

              e.stopPropagation()

              // PDF download logic here
               downloadPDF();

            }}

            className="hidden sm:flex items-center
                      gap-1.5 px-3 py-1.5
                      text-xs btn-glass"

          >

            <Download size={12} />

            PDF

          </button>

          {open

            ? <ChevronUp
                size={16}
                style={{
                  color:"var(--text-muted)"
                }}
              />

            : <ChevronDown
                size={16}
                style={{
                  color:"var(--text-muted)"
                }}
              />

          }

        </div>

      </div>

      {/* Expanded */}
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
                  {report.summaryBullets?.length > 0
                    ? report.summaryBullets.map((b, i) => (
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
                                          flex-shrink-0" />
                          <p className="text-sm leading-relaxed"
                             style={{ color: "var(--text-muted)" }}>
                            {b}
                          </p>
                        </motion.div>
                      ))
                    : (
                      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                        No summary available yet
                      </p>
                    )
                  }
                </div>

                {/* Anomaly insight */}
                {report.anomalyInsights && (
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
                )}

                {/* Session compliance */}
                <div className="mt-4 flex items-center gap-3 text-xs"
                     style={{ color: "var(--text-muted)" }}>
                  <CheckCircle size={12} className="text-green" />
                  {report.sessionsCompleted} of {report.sessionsTotal} sessions
                  completed this week
                </div>
              </div>

              {/* Daily volume chart — real data */}
             <div ref={chartRef}>
                <p className="text-xs font-semibold tracking-widest text-green mb-4">
                  DAILY VOLUME (SETS)
                </p>
                <div className="h-44 rounded-xl p-3"
                     style={{ backgroundColor: "rgba(57,255,20,0.03)",
                              border: "1px solid rgba(57,255,20,0.08)" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={performanceData}>
                      <defs>
                        <linearGradient id={`g-${report._id}`}
                                        x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#39FF14" stopOpacity={0.3} />
                          <stop offset="100%" stopColor="#39FF14" stopOpacity={0}   />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3"
                                     stroke="rgba(255,255,255,0.04)" />
                      <XAxis dataKey="day"
                             tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                             axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                             axisLine={false} tickLine={false} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="volume"
                            stroke="#39FF14" strokeWidth={2}
                            fill={`url(#g-${report._id})`} />
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

// ── Lift trend chart ───────────────────────────────────────────
function LiftTrendChart({ trendData, athleteName }) {
  if (!trendData || trendData.length === 0) return (
    <div className="h-52 flex items-center justify-center">
      <p className="text-sm" style={{ color: "var(--text-muted)" }}>
        No progression data yet
      </p>
    </div>
  )

  return (
    <div className="h-52">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={trendData}>
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
                activeDot={{ r: 6, fill: "#39FF14" }} />
          <Line type="monotone" dataKey="squat"
                stroke="#3B5BDB" strokeWidth={2.5}
                dot={{ fill: "#3B5BDB", r: 4, strokeWidth: 0 }} />
          <Line type="monotone" dataKey="deadlift"
                stroke="#FFC800" strokeWidth={2.5}
                dot={{ fill: "#FFC800", r: 4, strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function CoachReports() {
  const { user }                            = useAuthStore()
  const [loading,       setLoading]         = useState(true)
  const [reports,       setReports]         = useState([])
  const [athletes,      setAthletes]        = useState([])
  const [selectedAthlete, setSelectedAthlete] = useState(null)
  const [trendData,     setTrendData]       = useState([])
  const [trendLoading,  setTrendLoading]    = useState(false)
  const [stats,         setStats]           = useState({
    totalReports: 0, athletesReviewed: 0,
    anomaliesDetected: 0, avgCompliance: 0,
  })

  // ── Load all data on mount ─────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        // 1. Fetch coach's athletes
        const { data: profiles } = await api.get(`/coach/${user.id}/athletes`)
        // console.log(profiles)
        setAthletes(profiles)

        const allReports = []
        let totalAnomalies = 0
        let totalCompliance = 0
        let complianceCount = 0

        // 2. For each athlete fetch their plans + sessions + reports
        await Promise.all(
          profiles.map(async (ap) => {
            const athleteId = ap._id
            const athleteName = ap.userId.name
            // console.log(athleteName)

            try {
              // Fetch active plan
              const { data: plans } = await api.get(
                `/plan/athlete/${athleteId}`
              )
              const active = plans.find((p) => p.status === "active") || plans[0]
              // console.log(active);

              if (!active) return

              // Fetch full plan (for mesocycle context)
              const { data: fullPlan } = await api.get(`/plan/${active._id}`)
              // console.log(fullPlan)

              // Current week number
              const currentWeek = Math.min(
                Math.ceil(
                  (Date.now() - new Date(active.startDate).getTime()) /
                  (7 * 24 * 60 * 60 * 1000)
                ),
                active.totalWeeks
              )
              // console.log(currentWeek)

              // Fetch sessions for this athlete
              const { data: sessions } = await api.get(
                `/workout/athlete/${athleteId}`
              )
              // console.log(sessions);
              // Get this week's sessions
              const planStart = new Date(active.startDate)
              const weekSessions = sessions.filter((s) => {

            // Prefer loggedAt, otherwise fallback to createdAt
            const sessionDate = new Date(

              s.loggedAt ||

              s.createdAt

            )

            if (isNaN(sessionDate)) {

              return false

            }

            const sessWeek = Math.min(

              active.totalWeeks,

              Math.max(

                1,

                Math.floor(

                  (sessionDate - planStart) /

                  (7 * 24 * 60 * 60 * 1000)

                ) + 1

              )

            )

            return sessWeek === currentWeek

          })
              console.log(weekSessions)
              const completed = weekSessions.filter(
                (s) => s.status === "completed"
              ).length
              console.log(completed);
              const total = weekSessions.length || 1
              const compliance = Math.round((completed / total) * 100)
              console.log(compliance);
              console.log(compliance);
              totalCompliance += compliance
              complianceCount++

              // Fetch weekly reports from DB
              // console.log(active._id);
              const { data: weekReports } = await api.get(
                `/report/${active._id}`
              )
              // console.log(weekReports);
              // Get anomaly sessions this week
              const anomalySessions = weekSessions.filter(
                (s) => s.aiAnomalyReport?.detected
              )
              totalAnomalies += anomalySessions.length

              // Build report objects
              if (weekReports.length > 0) {
                // Use saved reports from DB
                weekReports.forEach((r) => {
                  allReports.push({
                    _id:               r._id,
                    athleteName,
                    athleteId,
                    planTitle:         active.title,
                    weekNumber:        r.weekNumber,
                    generatedAt:       r.generatedAt,
                    summaryBullets:    r.summaryBullets || [],
                    anomalyInsights:   r.anomalyInsights || "",
                    anomalyFlags:      anomalySessions.flatMap(
                      (s) => s.aiAnomalyReport?.flags || []
                    ),
                    sessions:          weekSessions,
                    sessionsCompleted: completed,
                    sessionsTotal:     total,
                  })
                })
              } else {
                // No saved report yet — build a live summary from sessions
                const anomalyFlags = anomalySessions.flatMap(
                  (s) => s.aiAnomalyReport?.flags || []
                )
                const liveBullets = buildLiveBullets(
                  weekSessions, athleteName, currentWeek
                )
                const liveInsight = anomalySessions.length > 0
                  ? anomalySessions[0].aiAnomalyReport?.summary || ""
                  : "No anomalies detected this week."

                allReports.push({
                  _id:               `live-${athleteId}-${currentWeek}`,
                  athleteName,
                  athleteId,
                  planTitle:         active.title,
                  weekNumber:        currentWeek,
                  generatedAt:       new Date().toISOString(),
                  summaryBullets:    liveBullets,
                  anomalyInsights:   liveInsight,
                  anomalyFlags,
                  sessions:          weekSessions,
                  sessionsCompleted: completed,
                  sessionsTotal:     total,
                })
              }
            } catch (err) {
              console.error(`Error loading data for ${athleteName}:`, err.message)
            }
          })
        )

        setReports(allReports.sort(
          (a, b) => new Date(b.generatedAt) - new Date(a.generatedAt)
        ))

        setStats({
          totalReports:      allReports.length,
          athletesReviewed:  profiles.length,
          anomaliesDetected: totalAnomalies,
          avgCompliance:     complianceCount > 0
            ? Math.round(totalCompliance / complianceCount)
            : 0,
        })

        // Default: show trend for first athlete
        if (profiles.length > 0) {

          setSelectedAthlete(profiles[0].userId)
          await loadTrend(profiles[0]._id)
        }
      } catch (err) {
        console.error("CoachReports load error:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  // ── Build live summary bullets from real sessions ──────────
  const buildLiveBullets = (sessions, athleteName, week) => {
    const bullets = []
    const completed = sessions.filter((s) => s.status === "completed")
    const skipped   = sessions.filter((s) => s.status === "skipped")
    const total     = sessions.length

    bullets.push(
      `${completed.length} of ${total} sessions completed this week`
    )

    if (skipped.length > 0) {
      bullets.push(
        `${skipped.length} session(s) skipped: ${
          skipped.map((s) => s.dayLabel?.split("—")[0]?.trim()).join(", ")
        }`
      )
    }

    // Find any PRs (weight increase vs what was logged)
    completed.forEach((s) => {
      const topEx = s.exercises?.reduce((best, ex) =>
        (ex.weight || 0) > (best?.weight || 0) ? ex : best,
        null
      )
      if (topEx?.weight > 0) {
        bullets.push(
          `${s.dayLabel}: top lift ${topEx.name} at ${topEx.weight}kg`
        )
      }
    })

    // Anomaly flags
    const anomalySess = sessions.filter((s) => s.aiAnomalyReport?.detected)
    if (anomalySess.length > 0) {
      const flags = anomalySess.flatMap((s) => s.aiAnomalyReport?.flags || [])
      bullets.push(`AI flagged: ${[...new Set(flags)].join(", ")}`)
    }

    return bullets.slice(0, 6)
  }

  // ── Load lift trend for selected athlete ───────────────────
  const loadTrend = async (athleteId) => {
    setTrendLoading(true)
    console.log(athleteId)
    try {
      const { data: sessions } = await api.get(`/workout/athlete/${athleteId}`)
      // console.log(sessions)
      const { data: plans }    = await api.get(`/plan/athlete/${athleteId}`)
      // console.log(plans);
      const active = plans.find((p) => p.status === "active") || plans[0]
      if (!active) return

      const planStart = new Date(active.startDate)
      const byWeek    = {}

      sessions
        .filter((s) => s.status === "completed")
        .forEach((s) => {
          const weekNum = Math.max(
            1,
            Math.ceil(
              (new Date(s.loggedAt) - planStart) /
              (7 * 24 * 60 * 60 * 1000)
            )
          )
          const label = `Wk ${weekNum}`
          if (!byWeek[label]) {
            byWeek[label] = { week: label, bench: 0, squat: 0, deadlift: 0 }
          }

          s.exercises?.forEach((ex) => {

            const name = ex.name?.toLowerCase().trim() || ""

            const weight = Number(ex.weight) || 0

            if (weight <= 0) return


            // ---------- BENCH ----------

            const isBench =

              name.includes("bench") ||

              name.includes("bench press")


            // ---------- SQUAT ----------

            const isSquat =

              name.includes("squat") ||

              name.includes("back squat") ||

              name.includes("front squat") ||

              name.includes("box squat")


            // ---------- DEADLIFT ----------

            const isDeadlift =

              name.includes("deadlift") ||

              name.includes("sumo") ||

              name.includes("romanian") ||

              name.includes("rdl")


            if (isBench) {

              byWeek[label].bench = Math.max(
                byWeek[label].bench,
                weight
              )

            }

            if (isSquat) {

              byWeek[label].squat = Math.max(
                byWeek[label].squat,
                weight
              )

            }

            if (isDeadlift) {

              byWeek[label].deadlift = Math.max(
                byWeek[label].deadlift,
                weight
              )

            }

          })
        })

      const sorted = Object.values(byWeek).sort((a, b) => {
        const na = parseInt(a.week.replace("Wk ", ""))
        const nb = parseInt(b.week.replace("Wk ", ""))
        return na - nb
      })

      setTrendData(sorted)
    } catch (err) {
      console.error("Trend load error:", err)
    } finally {
      setTrendLoading(false)
    }
  }

  const handleAthleteSelect = async (athlete) => {
    setSelectedAthlete(athlete)
    console.log(athlete);
    await loadTrend(athlete._id)
  }

  if (loading) return (
    <div className="flex items-center justify-center h-full min-h-screen"
         style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-green-muted border border-green/30
                        flex items-center justify-center">
          <Loader2 size={22} className="text-green animate-spin" />
        </div>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Loading reports...
        </p>
      </div>
    </div>
  )

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
              Auto-generated every Sunday · {reports.length} total reports
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

      {/* ── Stats row — real data ───────────────────────────── */}
      <motion.div
        variants={stagger}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
      >
        {[
          { icon: FileText,      label: "Reports",          value: stats.totalReports,      sub: "Generated"         },
          { icon: Users,         label: "Athletes",          value: stats.athletesReviewed,  sub: "Active plans"      },
          { icon: AlertTriangle, label: "Anomalies",         value: stats.anomaliesDetected, sub: "This week"         },
          { icon: Activity,      label: "Avg Compliance",    value: `${stats.avgCompliance}%`, sub: "Sessions done"   },
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
            </div>
            <p className="font-display font-900 text-3xl text-green mb-0.5">
              {value}
            </p>
            <p className="text-xs font-semibold mb-0.5"
               style={{ color: "var(--text-muted)" }}>
              {label}
            </p>
            <p className="text-xs" style={{ color: "var(--text-dim)" }}>
              {sub}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* ── Lift trend chart — real data ────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-2xl p-6 mb-8 border"
        style={{ borderColor: "var(--glass-border)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold tracking-widest text-green mb-1">
              PROGRESSION OVERVIEW
            </p>
            <h2 className="font-display font-700 text-xl uppercase"
                style={{ color: "var(--text)" }}>
              {selectedAthlete?.name || "Select athlete"}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Athlete selector */}
            <div className="flex items-center gap-2 flex-wrap">
              {athletes.map((ap) => (
                <button
                  key={ap.userId._id}
                  onClick={() => handleAthleteSelect(ap.userId)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold
                              transition-all duration-200
                              ${selectedAthlete?._id === ap.userId._id
                                ? "btn-green"
                                : "btn-glass"
                              }`}
                >
                  {ap.userId.name.split(" ")[0]}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-xs"
                 style={{ color: "var(--text-muted)" }}>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-green" /> Bench
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-0.5" style={{ backgroundColor: "#3B5BDB" }} />
                Squat
              </span>
              <span className="flex items-center gap-1.5">
                <div className="w-3 h-0.5" style={{ backgroundColor: "#FFC800" }} />
                Deadlift
              </span>
            </div>
          </div>
        </div>

        {trendLoading ? (
          <div className="h-52 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-6 h-6 rounded-full border-2 border-green
                              border-t-transparent animate-spin" />
              <p className="text-xs text-green">Loading progression...</p>
            </div>
          </div>
        ) : (
          <LiftTrendChart
            trendData={trendData}
            athleteName={selectedAthlete?.name}
          />
        )}
      </motion.div>

      {/* ── Report cards — real data ────────────────────────── */}
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
            LATEST REPORTS — {reports.length} total
          </p>
        </motion.div>

        {reports.length === 0 ? (
          <motion.div
            variants={fadeUp}
            className="glass-card rounded-2xl p-12 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-muted border border-green/20
                            flex items-center justify-center mx-auto mb-4">
              <FileText size={28} className="text-green" />
            </div>
            <p className="font-display font-700 text-xl uppercase mb-2"
               style={{ color: "var(--text)" }}>
              No Reports Yet
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Reports are auto-generated every Sunday. Check back after
              your athletes complete their first week.
            </p>
          </motion.div>
        ) : (
          reports.map((report) => (
            <ReportCard key={report._id} report={report} />
          ))
        )}
      </motion.div>
    </div>
  )
}