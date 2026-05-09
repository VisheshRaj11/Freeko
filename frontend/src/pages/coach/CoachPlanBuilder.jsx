import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Brain, ChevronDown, ChevronRight, ChevronUp,
  Dumbbell, Zap, CheckCircle, Plus,
  Loader2, Sparkles, Target, Calendar,
  TrendingUp, AlertTriangle, Edit3, Save,
  Eye
} from "lucide-react"
import api from "../../lib/axios"

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}
const stagger = { visible: { transition: { staggerChildren: 0.07 } } }

// ── Intensity badge ────────────────────────────────────────────
function IntensityBadge({ level }) {
  const map = {
    low:      { label: "LOW",      color: "rgba(57,255,20,0.15)",  text: "var(--green)" },
    moderate: { label: "MODERATE", color: "rgba(255,200,0,0.15)",  text: "#FFC800"      },
    high:     { label: "HIGH",     color: "rgba(255,80,80,0.15)",  text: "#FF5050"      },
    peak:     { label: "PEAK",     color: "rgba(255,50,50,0.2)",   text: "#FF3232"      },
  }
  const cfg = map[level] || map.moderate
  return (
    <span className="text-xs font-bold tracking-widest px-2.5 py-1 rounded-lg"
          style={{ backgroundColor: cfg.color, color: cfg.text }}>
      {cfg.label}
    </span>
  )
}

// ── Exercise row ───────────────────────────────────────────────
function ExerciseRow({ ex }) {
  return (
    <div className="flex items-center justify-between px-3 py-2.5 rounded-xl
                    transition-all hover:bg-white/5 group"
         style={{ backgroundColor: "rgba(255,255,255,0.03)" }}>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-lg bg-green-muted flex items-center
                        justify-center flex-shrink-0">
          <Dumbbell size={13} className="text-green" />
        </div>
        <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
          {ex.name}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3 text-xs"
             style={{ color: "var(--text-muted)" }}>
          <span className="px-2 py-1 rounded-lg glass-card">{ex.sets} sets</span>
          <span className="px-2 py-1 rounded-lg glass-card">{ex.reps} reps</span>
          {ex.rpe && (
            <span className="px-2 py-1 rounded-lg glass-card">RPE {ex.rpe}</span>
          )}
        </div>
        <button className="opacity-0 group-hover:opacity-100 transition-opacity
                           p-1 hover:text-green"
                style={{ color: "var(--text-muted)" }}>
          <Edit3 size={13} />
        </button>
      </div>
    </div>
  )
}

// ── Session card ───────────────────────────────────────────────
function SessionCard({ session }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl border overflow-hidden"
         style={{ borderColor: "var(--glass-border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3
                   hover:bg-white/5 transition-all text-left"
        style={{ backgroundColor: "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-green
                          shadow-[0_0_6px_var(--green)]" />
          <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
            {session.day_label || session.dayLabel}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {session.exercises?.length || 0} exercises
          </span>
        </div>
        {open
          ? <ChevronUp size={15} style={{ color: "var(--text-muted)" }} />
          : <ChevronDown size={15} style={{ color: "var(--text-muted)" }} />
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden border-t px-3 py-3"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <div className="flex flex-col gap-1.5">
              {session.exercises?.map((ex, i) => (
                <ExerciseRow key={i} ex={ex} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Microcycle card ────────────────────────────────────────────
function MicrocycleCard({ micro }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-xl overflow-hidden border"
         style={{ borderColor: micro.is_deload || micro.isDeload
           ? "rgba(255,200,0,0.2)"
           : "var(--glass-border)" }}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3
                   hover:bg-white/5 transition-all text-left"
        style={{ backgroundColor: micro.is_deload || micro.isDeload
          ? "rgba(255,200,0,0.04)"
          : "rgba(255,255,255,0.02)" }}
      >
        <div className="flex items-center gap-3">
          <span className="font-display font-700 text-lg text-green">
            W{micro.week_number || micro.weekNumber}
          </span>
          <span className="text-sm font-medium" style={{ color: "var(--text)" }}>
            {micro.theme || "Training Week"}
          </span>
          {(micro.is_deload || micro.isDeload) && (
            <span className="text-xs px-2 py-0.5 rounded-lg font-semibold"
                  style={{ backgroundColor: "rgba(255,200,0,0.15)",
                           color: "#FFC800" }}>
              DELOAD
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {micro.sessions?.length || 0} sessions
          </span>
          {open
            ? <ChevronUp size={14} style={{ color: "var(--text-muted)" }} />
            : <ChevronDown size={14} style={{ color: "var(--text-muted)" }} />
          }
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden border-t px-4 py-4"
            style={{ borderColor: "var(--glass-border)" }}
          >
            {/* Volume targets */}
            {micro.volume_targets && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-4">
                {Object.entries(micro.volume_targets).map(([muscle, sets]) => (
                  <div key={muscle}
                       className="flex flex-col items-center gap-1 px-2 py-2
                                  rounded-lg text-center"
                       style={{ backgroundColor: "rgba(57,255,20,0.05)",
                                border: "1px solid rgba(57,255,20,0.1)" }}>
                    <span className="font-display font-bold text-base text-green">
                      {sets}
                    </span>
                    <span className="text-xs capitalize"
                          style={{ color: "var(--text-muted)" }}>
                      {muscle}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Sessions */}
            <div className="flex flex-col gap-2">
              {micro.sessions?.map((session, i) => (
                <SessionCard key={i} session={session} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Mesocycle block ────────────────────────────────────────────
function MesocycleBlock({ meso, index }) {
  const [open, setOpen] = useState(index === 0)
  return (
    <motion.div
      variants={fadeUp}
      className="rounded-2xl overflow-hidden glass-card border"
      style={{ borderColor: "var(--glass-border)" }}
    >
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5
                   hover:bg-white/5 transition-all text-left"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-muted border border-green/30
                          flex items-center justify-center font-display font-900
                          text-xl text-green">
            {index + 1}
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-display font-700 text-xl uppercase tracking-tight"
                  style={{ color: "var(--text)" }}>
                {meso.name}
              </h3>
              <IntensityBadge level={meso.intensity_level || meso.intensityLevel} />
            </div>
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              {meso.focus} · Weeks {meso.week_start || meso.weekStart}–
              {meso.week_end || meso.weekEnd} ·{" "}
              {meso.microcycles?.length || 0} weeks
            </p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }}
                    transition={{ duration: 0.25 }}>
          <ChevronDown size={18} style={{ color: "var(--text-muted)" }} />
        </motion.div>
      </button>

      {/* Content */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="overflow-hidden border-t px-6 py-5"
            style={{ borderColor: "var(--glass-border)" }}
          >
            <div className="flex flex-col gap-3">
              {meso.microcycles?.map((micro, i) => (
                <MicrocycleCard key={i} micro={micro} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function CoachPlanBuilder() {
  const { athleteId } = useParams();
  // console.log(athleteId);
  const [athleteInfo, setAthleteInfo] = useState(null);

  const [form, setForm] = useState({
    athleteId:  athleteInfo?._id || "",
    title:      "",
    startDate:  "",
    totalWeeks: 12,
    fitnessLevel: athleteInfo?.fitnessLevel || "intermediate",
    goals:      athleteInfo?.goals || "",
    weaknesses: athleteInfo?.weaknesses || "",
    competitionDate: athleteInfo?.competitionDate || "",
    weight: athleteInfo?.weight || "",
    height: athleteInfo?.height || "",
  })

  const [plan,      setPlan]      = useState(null)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState(null)
  const [step,      setStep]      = useState("form") // "form" | "plan"

  useEffect(() => {
    console.log(athleteId);
    const fetchAthleteInfo = async() => {
      const res = await api.get(`/athlete/${athleteId}`);
      console.log(res.data);
      setAthleteInfo(res.data);
    }

    fetchAthleteInfo();
  },[athleteId]);

  useEffect(() => {
  if (athleteInfo) {
    setForm({
      athleteId: athleteInfo._id || "",
      title: "",
      startDate: "",
      totalWeeks: 12,
      fitnessLevel: athleteInfo.fitnessLevel || "intermediate",
      goals: athleteInfo.goals || "",
      weaknesses: athleteInfo.weaknesses || "",
      competitionDate: athleteInfo.competitionDate.split('T')[0] || "",
      weight: athleteInfo.weight || "",
      height: athleteInfo.height || "",
    });
  }
}, [athleteInfo]);


  const handleGenerate = async () => {
    if (!form.title || !form.startDate) return
    setLoading(true)
    setError(null)

    try {
      const res = await api.post("/plan/generate", {
        athleteId:  form.athleteId || "demo-athlete-id",
        title:      form.title,
        startDate:  form.startDate,
        totalWeeks: Number(form.totalWeeks),
      })
      setPlan(res.data)
      setStep("plan")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate plan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-full p-4 sm:p-6 lg:p-8"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Page header ─────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold tracking-widest text-green">
            AI COACH
          </span>
        </div>
        <h1 className="font-display font-900 text-4xl sm:text-5xl uppercase
                       tracking-tight mb-2"
            style={{ color: "var(--text)" }}>
          Plan Builder
        </h1>
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Generate a complete periodized program using Gemini AI
        </p>
      </motion.div>

      {step === "form" && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-2xl"
        >
          {/* Form card */}
          <motion.div variants={fadeUp}
                      className="glass-card rounded-2xl p-6 sm:p-8 mb-6">

            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-green" />
              <h2 className="font-display font-700 text-xl uppercase tracking-tight"
                  style={{ color: "var(--text)" }}>
                Athlete & Plan Info
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {/* Plan title */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold tracking-widest mb-2"
                       style={{ color: "var(--text-muted)" }}>
                  PLAN TITLE
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Road to Nationals 2025"
                  className="w-full px-4 py-3 rounded-xl text-sm glass-card
                             border outline-none transition-all
                             focus:border-green/50 placeholder-gray-600"
                  style={{ borderColor: "var(--glass-border)",
                           color: "var(--text)" }}
                />
              </div>

              {/* Start date */}
              <div>
                <label className="block text-xs font-semibold tracking-widest mb-2"
                       style={{ color: "var(--text-muted)" }}>
                  START DATE
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm glass-card
                             border outline-none transition-all
                             focus:border-green/50"
                  style={{ borderColor: "var(--glass-border)",
                           color: "var(--text)",
                           colorScheme: "dark" }}
                />
              </div>

              {/* Total weeks */}
              <div>
                <label className="block text-xs font-semibold tracking-widest mb-2"
                       style={{ color: "var(--text-muted)" }}>
                  TOTAL WEEKS
                </label>
                <select
                  value={form.totalWeeks}
                  onChange={(e) => setForm({ ...form, totalWeeks: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm glass-card
                             border outline-none transition-all
                             focus:border-green/50"
                  style={{ borderColor: "var(--glass-border)",
                           color: "var(--text)",
                           backgroundColor: "transparent" }}
                >
                  {[8, 10, 12, 14, 16].map((w) => (
                    <option key={w} value={w}
                            style={{ backgroundColor: "#111" }}>
                      {w} weeks
                    </option>
                  ))}
                </select>
              </div>

              {/* Fitness level */}
              <div>
                <label className="block text-xs font-semibold tracking-widest mb-2"
                       style={{ color: "var(--text-muted)" }}>
                  FITNESS LEVEL
                </label>
                <select
                  value={form.fitnessLevel}
                  onChange={(e) => setForm({ ...form, fitnessLevel: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm glass-card
                             border outline-none transition-all focus:border-green/50"
                  style={{ borderColor: "var(--glass-border)",
                           color: "var(--text)",
                           backgroundColor: "transparent" }}
                >
                  {["beginner","intermediate","advanced"].map((l) => (
                    <option key={l} value={l}
                            style={{ backgroundColor: "#111" }}>
                      {l.charAt(0).toUpperCase() + l.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Competition date */}
              <div>
                <label className="block text-xs font-semibold tracking-widest mb-2"
                       style={{ color: "var(--text-muted)" }}>
                  COMPETITION DATE
                </label>
                <input
                  type="date"
                  value={form.competitionDate}
                  onChange={(e) => setForm({ ...form, competitionDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-sm glass-card
                             border outline-none transition-all focus:border-green/50"
                  style={{ borderColor: "var(--glass-border)",
                           color: "var(--text)",
                           colorScheme: "dark" }}
                />
              </div>

              {/* Goals */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold tracking-widest mb-2"
                       style={{ color: "var(--text-muted)" }}>
                  ATHLETE GOALS
                </label>
                <input
                  value={form.goals}
                  onChange={(e) => setForm({ ...form, goals: e.target.value })}
                  placeholder="e.g. build muscle, increase squat 1RM, lose fat"
                  className="w-full px-4 py-3 rounded-xl text-sm glass-card
                             border outline-none transition-all
                             focus:border-green/50 placeholder-gray-600"
                  style={{ borderColor: "var(--glass-border)",
                           color: "var(--text)" }}
                />
              </div>

              {/* Weaknesses */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold tracking-widest mb-2"
                       style={{ color: "var(--text-muted)" }}>
                  WEAKNESSES / FOCUS AREAS
                </label>
                <input
                  value={form.weaknesses}
                  onChange={(e) => setForm({ ...form, weaknesses: e.target.value })}
                  placeholder="e.g. rear delts, lower back, hip mobility"
                  className="w-full px-4 py-3 rounded-xl text-sm glass-card
                             border outline-none transition-all
                             focus:border-green/50 placeholder-gray-600"
                  style={{ borderColor: "var(--glass-border)",
                           color: "var(--text)" }}
                />
              </div>

              {/* Weight + Height */}
              <div>
                <label className="block text-xs font-semibold tracking-widest mb-2"
                       style={{ color: "var(--text-muted)" }}>
                  WEIGHT (KG)
                </label>
                <input
                  type="number"
                  value={form.weight}
                  onChange={(e) => setForm({ ...form, weight: e.target.value })}
                  placeholder="75"
                  className="w-full px-4 py-3 rounded-xl text-sm glass-card
                             border outline-none transition-all focus:border-green/50
                             placeholder-gray-600"
                  style={{ borderColor: "var(--glass-border)",
                           color: "var(--text)" }}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold tracking-widest mb-2"
                       style={{ color: "var(--text-muted)" }}>
                  HEIGHT (CM)
                </label>
                <input
                  type="number"
                  value={form.height}
                  onChange={(e) => setForm({ ...form, height: e.target.value })}
                  placeholder="175"
                  className="w-full px-4 py-3 rounded-xl text-sm glass-card
                             border outline-none transition-all focus:border-green/50
                             placeholder-gray-600"
                  style={{ borderColor: "var(--glass-border)",
                           color: "var(--text)" }}
                />
              </div>
            </div>

            {error && (
              <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl"
                   style={{ backgroundColor: "rgba(255,80,80,0.08)",
                            border: "1px solid rgba(255,80,80,0.2)" }}>
                <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
                <p className="text-sm text-red-400">{error}</p>
              </div>
            )}

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGenerate}
              disabled={loading || !form.title || !form.startDate}
              className="mt-6 w-full py-4 rounded-xl btn-green flex items-center
                         justify-center gap-3 text-sm disabled:opacity-50
                         disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={17} className="animate-spin" />
                  Generating with Gemini AI...
                </>
              ) : (
                <>
                  <Brain size={17} />
                  Generate Periodized Plan
                  <Zap size={15} />
                </>
              )}
            </motion.button>
          </motion.div>

          {/* Info chips */}
          <motion.div variants={fadeUp}
                      className="flex flex-wrap gap-3">
            {[
              { icon: Calendar, text: "12–16 week programs" },
              { icon: Target,   text: "Mesocycle splitting" },
              { icon: TrendingUp, text: "Progressive overload" },
              { icon: Zap,      text: "Deload auto-detection" },
            ].map(({ icon: Icon, text }) => (
              <div key={text}
                   className="flex items-center gap-2 px-3 py-2 rounded-xl
                              glass-card text-xs font-medium"
                   style={{ color: "var(--text-muted)" }}>
                <Icon size={13} className="text-green" />
                {text}
              </div>
            ))}
          </motion.div>
        </motion.div>
      )}

      {/* ── Generated plan view ──────────────────────────────── */}
      {step === "plan" && plan && (
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
        >
          {/* Plan summary bar */}
          <motion.div
            variants={fadeUp}
            className="glass-card rounded-2xl p-5 mb-6 flex flex-wrap
                       items-center justify-between gap-4"
          >
            <div>
              <p className="text-xs text-green font-semibold tracking-widest mb-1">
                GENERATED PLAN
              </p>
              <h2 className="font-display font-700 text-2xl uppercase"
                  style={{ color: "var(--text)" }}>
                {form.title}
              </h2>
              <p className="text-xs mt-1" style={{ color: "var(--text-muted)" }}>
                {plan.mesocycles?.length} mesocycles ·{" "}
                {form.totalWeeks} weeks · Starting {form.startDate}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("form")}
                className="px-4 py-2 text-sm btn-glass flex items-center gap-2"
              >
                <Edit3 size={14} />
                Rebuild
              </button>
              <Link
              to={`/coach/plan/fullPlan/${plan._id}`}
                className="px-4 py-2 text-sm btn-green flex items-center gap-2"
              >
                <Eye size={14} />
                View Full Plan
              </Link>
            </div>
          </motion.div>

          {/* Prompt used */}
          {plan.prompt_used && (
            <motion.div variants={fadeUp}
                        className="glass-card rounded-xl px-5 py-4 mb-6 flex
                                   items-start gap-3">
              <Brain size={15} className="text-green flex-shrink-0 mt-0.5" />
              <p className="text-sm italic"
                 style={{ color: "var(--text-muted)" }}>
                "{plan.prompt_used}"
              </p>
            </motion.div>
          )}

          {/* Mesocycles */}
          <div className="flex flex-col gap-4">
            {plan.mesocycles?.map((meso, i) => (
              <MesocycleBlock key={i} meso={meso} index={i} />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}