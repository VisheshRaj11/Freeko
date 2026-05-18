import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Play, Pause, Square, CheckCircle, Plus,
  Minus, ChevronRight, ChevronLeft, Dumbbell,
  Brain, Zap, Timer, Flame, RotateCcw,
  AlertTriangle, TrendingUp, Check, X,
  ChevronUp, ChevronDown, Save, Trophy
} from "lucide-react"
import api from "../../lib/axios"
import { useWorkoutStore } from "../../../store/setStore"

// ── Mock session data ──────────────────────────────────────────
// const MOCK_SESSION = {
//   id:       "session-001",
//   dayLabel: "Monday — Push Day",
//   week:     8,
//   block:    "Strength Block",
//   exercises: [
//     {
//       id:       1,
//       name:     "Bench Press",
//       sets:     4,
//       reps:     8,
//       weight:   85,
//       rpe:      7,
//       notes:    "Controlled descent, 2 sec eccentric",
//       completed: false,
//       sets_logged: [],
//     },
//     {
//       id:       2,
//       name:     "Overhead Press",
//       sets:     3,
//       reps:     10,
//       weight:   50,
//       rpe:      7,
//       notes:    "Brace core, don't hyperextend lower back",
//       completed: false,
//       sets_logged: [],
//     },
//     {
//       id:       3,
//       name:     "Incline DB Press",
//       sets:     3,
//       reps:     12,
//       weight:   30,
//       rpe:      8,
//       notes:    "Full stretch at bottom",
//       completed: false,
//       sets_logged: [],
//     },
//     {
//       id:       4,
//       name:     "Cable Fly",
//       sets:     3,
//       reps:     15,
//       weight:   15,
//       rpe:      7,
//       notes:    "Squeeze at peak contraction",
//       completed: false,
//       sets_logged: [],
//     },
//     {
//       id:       5,
//       name:     "Tricep Pushdown",
//       sets:     3,
//       reps:     15,
//       weight:   25,
//       rpe:      6,
//       notes:    "Keep elbows tucked",
//       completed: false,
//       sets_logged: [],
//     },
//   ],
// }

// ── Rest timer ─────────────────────────────────────────────────
function RestTimer({ seconds, onDone }) {
  const [remaining, setRemaining] = useState(seconds)
  const [running,   setRunning]   = useState(true)

  useEffect(() => {
    if (!running) return
    if (remaining <= 0) { onDone?.(); return }
    const t = setTimeout(() => setRemaining((r) => r - 1), 1000)
    return () => clearTimeout(t)
  }, [remaining, running, onDone])

  const pct = ((seconds - remaining) / seconds) * 100
  const min  = Math.floor(remaining / 60)
  const sec  = remaining % 60

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(8,8,8,0.92)",
               backdropFilter: "blur(24px)" }}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Circle timer */}
        <div className="relative w-44 h-44">
          <svg className="absolute inset-0 -rotate-90 w-full h-full">
            <circle cx="88" cy="88" r="80"
                    fill="none" stroke="rgba(57,255,20,0.1)"
                    strokeWidth="6" />
            <circle cx="88" cy="88" r="80"
                    fill="none" stroke="#39FF14"
                    strokeWidth="6"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 80}`}
                    strokeDashoffset={`${2 * Math.PI * 80 * (1 - pct / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s linear",
                             filter: "drop-shadow(0 0 8px rgba(57,255,20,0.6))" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-display font-900 text-5xl text-green">
              {min}:{sec.toString().padStart(2, "0")}
            </p>
            <p className="text-xs tracking-widest"
               style={{ color: "var(--text-muted)" }}>
              REST TIME
            </p>
          </div>
        </div>

        <p className="font-display font-700 text-2xl uppercase text-green">
          Recovery in Progress
        </p>
        <p className="text-sm text-center max-w-xs"
           style={{ color: "var(--text-muted)" }}>
          Take a breath. Shake out your hands.
          Next set incoming.
        </p>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setRunning(!running)}
            className="flex items-center gap-2 px-5 py-3 rounded-xl btn-glass text-sm"
          >
            {running ? <Pause size={15} /> : <Play size={15} />}
            {running ? "Pause" : "Resume"}
          </button>
          <button
            onClick={onDone}
            className="flex items-center gap-2 px-5 py-3 rounded-xl
                       btn-green text-sm"
          >
            <Check size={15} /> Skip Rest
          </button>
        </div>
      </div>
    </motion.div>
  )
}

// ── Set logger row ─────────────────────────────────────────────
function SetRow({ setNum, planned,setIndex, onLog }) {
  const [weight, setWeight] = useState(planned.weight)
  const [reps,   setReps]   = useState(planned.reps)
  const [rpe,    setRpe]    = useState(planned.rpe)
  const [logged, setLogged] = useState(false)
  const { toggleSet } = useWorkoutStore()

  const handleLog = () => {
    setLogged(true)
    toggleSet(planned.name, setIndex, planned.sets)
    onLog({ set: setNum, weight, reps, rpe })
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: setNum * 0.06 }}
      className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl border
                  transition-all duration-300
                  ${logged
                    ? "border-green/30 bg-green/5"
                    : "glass-card border-white/7"
                  }`}
    >
      {/* Set number */}
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                       flex-shrink-0 font-display font-900 text-base
                       transition-all duration-300
                       ${logged
                         ? "bg-green text-black"
                         : "bg-white/5 border border-white/10 text-[var(--text-muted)]"
                       }`}>
        {logged ? <Check size={14} /> : setNum}
      </div>

      {/* Weight control */}
      <div className="flex items-center gap-1.5 flex-1">
        <button
          onClick={() => !logged && setWeight((w) => Math.max(0, w - 2.5))}
          className="w-7 h-7 rounded-lg glass-card flex items-center justify-center
                     hover:border-green/40 transition-all disabled:opacity-40"
          disabled={logged}
        >
          <Minus size={11} style={{ color: "var(--text-muted)" }} />
        </button>
        <div className="flex flex-col items-center min-w-[52px]">
          <span className={`font-display font-900 text-xl leading-none
                            ${logged ? "text-green" : ""}`}
                style={{ color: logged ? "var(--green)" : "var(--text)" }}>
            {weight}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>kg</span>
        </div>
        <button
          onClick={() => !logged && setWeight((w) => w + 2.5)}
          className="w-7 h-7 rounded-lg glass-card flex items-center justify-center
                     hover:border-green/40 transition-all disabled:opacity-40"
          disabled={logged}
        >
          <Plus size={11} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* Reps control */}
      <div className="flex items-center gap-1.5 flex-1">
        <button
          onClick={() => !logged && setReps((r) => Math.max(1, r - 1))}
          className="w-7 h-7 rounded-lg glass-card flex items-center justify-center
                     hover:border-green/40 transition-all disabled:opacity-40"
          disabled={logged}
        >
          <Minus size={11} style={{ color: "var(--text-muted)" }} />
        </button>
        <div className="flex flex-col items-center min-w-[44px]">
          <span className={`font-display font-900 text-xl leading-none`}
                style={{ color: logged ? "var(--green)" : "var(--text)" }}>
            {reps}
          </span>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>reps</span>
        </div>
        <button
          onClick={() => !logged && setReps((r) => r + 1)}
          className="w-7 h-7 rounded-lg glass-card flex items-center justify-center
                     hover:border-green/40 transition-all disabled:opacity-40"
          disabled={logged}
        >
          <Plus size={11} style={{ color: "var(--text-muted)" }} />
        </button>
      </div>

      {/* RPE */}
      <div className="flex flex-col items-center min-w-[36px]">
        <div className="flex items-center gap-1">
          <button onClick={() => !logged && setRpe((r) => Math.max(1, r - 1))}
                  className="text-[10px]" style={{ color: "var(--text-dim)" }}
                  disabled={logged}>
            <ChevronDown size={12} />
          </button>
          <span className="font-display font-700 text-base"
                style={{ color: logged ? "var(--green)" : "var(--text)" }}>
            {rpe}
          </span>
          <button onClick={() => !logged && setRpe((r) => Math.min(10, r + 1))}
                  className="text-[10px]" style={{ color: "var(--text-dim)" }}
                  disabled={logged}>
            <ChevronUp size={12} />
          </button>
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>RPE</span>
      </div>

      {/* Log button */}
      <motion.button
        whileHover={!logged ? { scale: 1.08 } : {}}
        whileTap={!logged ? { scale: 0.92 } : {}}
        onClick={!logged ? handleLog : undefined}
        className={`w-10 h-10 rounded-xl flex items-center justify-center
                    flex-shrink-0 transition-all duration-300
                    ${logged
                      ? "bg-green/10 border border-green/25 cursor-default"
                      : "btn-green cursor-pointer"
                    }`}
      >
        {logged
          ? <CheckCircle size={16} className="text-green" />
          : <Check size={16} />
        }
      </motion.button>
    </motion.div>
  )
}

// ── Exercise card ──────────────────────────────────────────────
function ExerciseCard({ ex, isActive, onComplete, index }) {
  const [setsLogged, setSetsLogged] = useState([])
  const [showRest,   setShowRest]   = useState(false)
  const [expanded,   setExpanded]   = useState(isActive)
  const {setCompletion, toggleSet, isExerciseCompleted} = useWorkoutStore();

  useEffect(() => {
    setExpanded(isActive)
  }, [isActive])

  const handleSetLog = (setData) => {
    const updated = [...setsLogged, setData]
    setSetsLogged(updated)
    if (updated.length < ex.sets) {
      setShowRest(true)
    } else {
      // All sets done
      setTimeout(() => onComplete(updated), 400)
    }
  }

  const progress = setsLogged.length / ex.sets
  const allDone  =   isExerciseCompleted(ex.name, ex.sets)

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`rounded-2xl border overflow-hidden transition-all duration-300
                  ${isActive
                    ? "border-green/40"
                    : allDone
                      ? "border-green/20 opacity-70"
                      : "glass-card"
                  }`}
      style={{
        borderColor: isActive
          ? "rgba(57,255,20,0.4)"
          : allDone
            ? "rgba(57,255,20,0.2)"
            : "var(--glass-border)",
        backgroundColor: isActive
          ? "rgba(57,255,20,0.04)"
          : "var(--glass-1)",
      }}
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left
                   hover:bg-white/5 transition-all"
      >
        {/* Exercise icon */}
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center
                         flex-shrink-0 transition-all duration-300
                         ${allDone
                           ? "bg-green"
                           : isActive
                             ? "bg-green-muted border border-green/40"
                             : "glass-card border border-white/10"
                         }`}>
          {allDone
            ? <CheckCircle size={20} color="#080808" />
            : <Dumbbell size={18} className={isActive ? "text-green" : ""}
                        style={{ color: isActive
                          ? "var(--green)"
                          : "var(--text-muted)" }} />
          }
        </div>

        {/* Name + progress */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-display font-700 text-xl uppercase tracking-tight
                            truncate
                            ${isActive ? "text-green" : ""}`}
                style={{ color: isActive ? "var(--green)" : "var(--text)" }}>
              {ex.name}
            </h3>
            {isActive && (
              <span className="text-xs px-2 py-0.5 rounded-lg bg-green/10
                               text-green font-bold border border-green/20
                               flex-shrink-0">
                ACTIVE
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: "var(--text-muted)" }}>
              {ex.sets} × {ex.reps} @ {ex.weight}kg · RPE {ex.rpe}
            </span>
            <span className="text-xs font-bold"
                  style={{ color: allDone ? "var(--green)" : "var(--text-muted)" }}>
              {setsLogged.length}/{ex.sets} sets
            </span>
          </div>

          {/* Progress bar */}
          {(isActive || setsLogged.length > 0) && (
            <div className="mt-2 h-1 rounded-full overflow-hidden"
                 style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              <motion.div
                animate={{ width: `${progress * 100}%` }}
                transition={{ duration: 0.4 }}
                className="h-full rounded-full bg-green"
                style={{ boxShadow: "0 0 6px rgba(57,255,20,0.5)" }}
              />
            </div>
          )}
        </div>

        {expanded
          ? <ChevronUp size={16} style={{ color: "var(--text-muted)" }} />
          : <ChevronDown size={16} style={{ color: "var(--text-muted)" }} />
        }
      </button>

      {/* Sets */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden border-t px-5 py-4"
            style={{ borderColor: "var(--glass-border)" }}
          >
            {/* Coach notes */}
            {ex.notes && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl mb-4"
                   style={{
                     backgroundColor: "rgba(57,255,20,0.05)",
                     border:          "1px solid rgba(57,255,20,0.12)",
                   }}>
                <Brain size={12} className="text-green flex-shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed"
                   style={{ color: "var(--text-muted)" }}>
                  <span className="text-green font-semibold">Coach: </span>
                  {ex.notes}
                </p>
              </div>
            )}

            {/* Column headers */}
            <div className="flex items-center gap-3 px-4 mb-2">
              <div className="w-8" />
              <div className="flex-1 text-center">
                <span className="text-xs tracking-widest font-semibold"
                      style={{ color: "var(--text-dim)" }}>
                  WEIGHT
                </span>
              </div>
              <div className="flex-1 text-center">
                <span className="text-xs tracking-widest font-semibold"
                      style={{ color: "var(--text-dim)" }}>
                  REPS
                </span>
              </div>
              <div className="min-w-[36px] text-center">
                <span className="text-xs tracking-widest font-semibold"
                      style={{ color: "var(--text-dim)" }}>
                  RPE
                </span>
              </div>
              <div className="w-10" />
            </div>

            {/* Set rows */}
            <div className="flex flex-col gap-2">
              {Array.from({ length: ex.sets }).map((_, i) => (
                <SetRow
                  key={i}
                  setNum={i + 1}
                  setIndex={i}
                  planned={ex}
                  onLog={handleSetLog}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rest timer overlay */}
      <AnimatePresence>
        {showRest && (
          <RestTimer
            seconds={90}
            onDone={() => setShowRest(false)}
            // ex, isActive, onComplete, index
            // onClick={() => toggleSet(ex.name, index, ex.sets)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ── Completion screen ──────────────────────────────────────────
function CompletionScreen({ session, elapsed, anomaly, onDone }) {
  const min = Math.floor(elapsed / 60)
  const sec = elapsed % 60

  useEffect(() => {
    const markedCompleted = async() => {
       await api.patch(`/workout/${session._id}/complete`)
    }
    markedCompleted();
  },[session._id]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-full flex flex-col items-center justify-center
                 px-4 py-12 text-center"
      style={{ backgroundColor: "var(--bg)" }}
    >
      {/* Confetti-ish green glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full"
             style={{
               background: "radial-gradient(circle, rgba(57,255,20,0.12) 0%, transparent 65%)",
               filter:     "blur(60px)",
             }} />
      </div>

      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
        className="w-24 h-24 rounded-3xl bg-green flex items-center justify-center
                   mb-8"
        style={{ boxShadow: "0 0 60px rgba(57,255,20,0.5)" }}
      >
        <Trophy size={44} color="#080808" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <p className="text-xs text-green font-semibold tracking-widest mb-2">
          SESSION COMPLETE
        </p>
        <h1 className="font-display font-900 text-5xl sm:text-6xl uppercase
                       tracking-tight text-green mb-2"
            style={{ textShadow: "0 0 40px rgba(57,255,20,0.4)" }}>
          CRUSHED IT!
        </h1>
        <p className="text-lg mb-8" style={{ color: "var(--text-muted)" }}>
          {session.dayLabel}
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="grid grid-cols-3 gap-4 mb-8 w-full max-w-sm"
      >
        {[
          { label: "Duration",  value: `${min}m ${sec}s`, icon: Timer    },
          { label: "Exercises", value: session?.exercises.length, icon: Dumbbell },
          { label: "Total Sets",
            value: session?.exercises.reduce((a, e) => a + e.sets, 0),
            icon: Flame },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label}
               className="glass-card rounded-2xl p-4 border"
               style={{ borderColor: "rgba(57,255,20,0.2)" }}>
            <Icon size={16} className="text-green mx-auto mb-2" />
            <p className="font-display font-900 text-2xl text-green">
              {value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* Anomaly result */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="w-full max-w-sm mb-8"
      >
        {anomaly?.anomaly_detected ? (
          <div className="px-5 py-4 rounded-2xl border text-left"
               style={{
                 backgroundColor: "rgba(255,200,0,0.05)",
                 borderColor:     "rgba(255,200,0,0.25)",
               }}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle size={15} style={{ color: "#FFC800" }} />
              <span className="text-sm font-semibold"
                    style={{ color: "#FFC800" }}>
                AI Anomaly Detected
              </span>
            </div>
            <p className="text-sm mb-2"
               style={{ color: "var(--text-muted)" }}>
              {anomaly.summary}
            </p>
            <p className="text-xs text-green">
              💡 {anomaly.suggestion}
            </p>
          </div>
        ) : (
          <div className="px-5 py-4 rounded-2xl border text-left"
               style={{
                 backgroundColor: "rgba(57,255,20,0.05)",
                 borderColor:     "rgba(57,255,20,0.2)",
               }}>
            <div className="flex items-center gap-2 mb-1">
              <Brain size={15} className="text-green" />
              <span className="text-sm font-semibold text-green">
                AI Analysis — All Clear
              </span>
            </div>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              No anomalies detected. Progression is on track.
              Great session!
            </p>
          </div>
        )}
      </motion.div>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.85 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={onDone}
        className="px-10 py-4 rounded-2xl btn-green text-base font-bold
                   flex items-center gap-2"
      >
        <Check size={18} /> Back to Dashboard
      </motion.button>
    </motion.div>
  )
}

// ── Live workout timer ─────────────────────────────────────────
function WorkoutTimer({ running }) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(t)
  }, [running])

  const min = Math.floor(elapsed / 60)
  const sec = elapsed % 60

  return { display: `${min}:${sec.toString().padStart(2, "0")}`, elapsed }
}

// ── Main ───────────────────────────────────────────────────────
export default function AthleteWorkout() {
  const { id }     = useParams()
  const navigate   = useNavigate()
  const [session, setSession]  = useState(null)
  console.log(session);
  const [exercises, setExercises] = useState([])
  // console.log(exercises);
  const [activeIdx,   setActiveIdx]   = useState(0)
  const [sessionState, setSessionState] = useState("idle") // idle | running | done
  const [anomaly,     setAnomaly]     = useState(null)
  const [submitting,  setSubmitting]  = useState(false)
  const timerRef = useRef(null)
  const [elapsed, setElapsed]         = useState(0)
  const {setCompletion, toggleSet, isExerciseCompleted} = useWorkoutStore();

  useEffect(() => {
    const fetchSession = async() => {
      const {data: sess} = await api.get(`/workout/session/${id}`)
      setSession(sess);
      setExercises(sess.exercises);
    }
    fetchSession();
  },[id])

  // Start timer
  useEffect(() => {
    if (sessionState !== "running") return
    timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    return () => clearInterval(timerRef.current)
  }, [sessionState])

  const min = Math.floor(elapsed / 60)
  const sec = elapsed % 60

  const completedCount = exercises.filter((e) => e.completed).length
 const totalProgress =
  exercises.length > 0
    ? completedCount / exercises.length
    : 0

  const handleExerciseComplete = async(index, setsData) => {

    const exercise = exercises[index]

    setExercises((prev) =>
      prev.map((e, i) =>
        i === index ? { ...e, completed: true, logged_sets: setsData } : e
      )
    )

    try {

    await api.patch(
      `/workout/${session._id}/exercise/${exercise._id}`
    )

  } catch (err) {

    console.error(err)

  }
    // Move to next exercise
    const nextIdx = exercises.findIndex((e, i) => i > index && !e.completed)
    if (nextIdx !== -1) setActiveIdx(nextIdx)
  }

  const handleFinish = async () => {
    setSubmitting(true)
    clearInterval(timerRef.current)

    try {
      // Call Node.js which calls FastAPI anomaly detection
      const res = await api.post(`/workout/${session._id}/log`, {
        exercises: exercises.map((e) => ({
          name:      e.name,
          sets:      e.sets,
          reps:      e.reps,
          weight:    e.weight,
          rpe:       e.rpe,
          completed: e.completed,
        })),
      })
      setAnomaly(res.data.anomalyReport)
    } catch {
      // Fallback mock anomaly for demo
      setAnomaly({
        anomaly_detected: false,
        summary:          "",
        suggestion:       "",
        flags:            [],
      })
    } finally {
      setSubmitting(false)
      setSessionState("done")
    }
  }

  if (sessionState === "done") {
    return (
      <CompletionScreen
        session={session}
        elapsed={elapsed}
        anomaly={anomaly}
        onDone={() => navigate("/athlete")}
      />
    )
  }

  return (
    <div className="min-h-full flex flex-col"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Sticky header ─────────────────────────────────── */}
      <div className="sticky top-0 z-40 border-b"
           style={{
             borderColor:     "var(--glass-border)",
             backgroundColor: "rgba(8,8,8,0.90)",
             backdropFilter:  "blur(24px)",
           }}>
        <div className="px-4 sm:px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            {/* Session info */}
            <div>
              <p className="text-xs text-green font-semibold tracking-widest">
                WEEK {session?.microcycleId?.weekNumber}
              </p>
              <h1 className="font-display font-900 text-2xl sm:text-3xl uppercase
                             tracking-tight"
                  style={{ color: "var(--text)" }}>
                {session?.dayLabel}
              </h1>
            </div>

            {/* Timer + state */}
            <div className="flex items-center gap-3">
              {/* Live timer */}
              {sessionState === "running" && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl
                             glass-card border border-green/20"
                >
                  <div className="w-2 h-2 rounded-full bg-green pulse-green" />
                  <span className="font-display font-700 text-xl text-green
                                   tabular-nums">
                    {min}:{sec.toString().padStart(2, "0")}
                  </span>
                </motion.div>
              )}

              {/* Start / Finish button */}
              {session === "idle" ? (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setSessionState("running")}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                             btn-green text-sm font-bold"
                >
                  <Play size={15} fill="currentColor" />
                  Start Session
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={handleFinish}
                  disabled={submitting || completedCount === 0}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl
                             text-sm font-bold transition-all disabled:opacity-40"
                  style={{
                    backgroundColor: completedCount === exercises.length
                      ? "var(--green)"
                      : "rgba(57,255,20,0.2)",
                    color: completedCount === exercises.length
                      ? "#080808"
                      : "var(--green)",
                    border: "1px solid rgba(57,255,20,0.4)",
                  }}
                >
                  {submitting ? (
                    <>
                      <Brain size={15} className="animate-pulse" />
                      Analysing...
                    </>
                  ) : (
                    <>
                      <Save size={15} />
                      Finish Session
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </div>

          {/* Overall progress bar */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-1.5 rounded-full overflow-hidden"
                 style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              <motion.div
                animate={{ width: `${totalProgress * 100}%` }}
                transition={{ duration: 0.5 }}
                className="h-full rounded-full bg-green"
                style={{ boxShadow: "0 0 8px rgba(57,255,20,0.5)" }}
              />
            </div>
            <span className="text-xs font-semibold text-green tabular-nums
                             flex-shrink-0">
              {completedCount}/{exercises.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── Idle state — tap to start ──────────────────────── */}
      <AnimatePresence>
        {sessionState === "idle" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-4 sm:mx-6 mt-5 px-5 py-4 rounded-2xl border
                       flex items-center gap-3"
            style={{
              backgroundColor: "rgba(57,255,20,0.04)",
              borderColor:     "rgba(57,255,20,0.2)",
            }}
          >
            <Zap size={16} className="text-green flex-shrink-0" />
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Press{" "}
              <span className="text-green font-semibold">Start Session</span>
              {" "}to begin logging. Your timer will start and
              each set can be logged individually.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Exercise list ──────────────────────────────────── */}
      <div className="flex-1 px-4 sm:px-6 py-5 flex flex-col gap-3
                      max-w-2xl w-full mx-auto">
        {exercises.map((ex, i) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            index={i}
            isActive={
              sessionState === "running" &&
              i === activeIdx &&
              !ex.completed
            }
            onComplete={(setsData) => handleExerciseComplete(i, setsData)}
          />
        ))}

        {/* Skip session */}
        {sessionState === "running" && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            onClick={() => navigate("/athlete")}
            className="mt-2 w-full py-3.5 rounded-xl btn-glass text-sm
                       flex items-center justify-center gap-2"
            style={{ color: "var(--text-muted)" }}
          >
            <X size={15} /> Skip Session
          </motion.button>
        )}
      </div>
    </div>
  )
}