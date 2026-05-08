import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap, ArrowRight, ArrowLeft, CheckCircle,
  Target, Dumbbell, Scale, Ruler, Calendar,
  Trophy, Plus, X, Brain
} from "lucide-react"
import api from "../../lib/axios"
import { useAuthStore } from "../../../store/authStore"

// ── Tag input for goals/weaknesses ────────────────────────────
function TagInput({ label, placeholder, tags, setTags, suggestions }) {
  const [input, setInput] = useState("")
  const [showSug, setShowSug] = useState(false)

  const add = (val) => {
    const v = val.trim()
    if (v && !tags.includes(v)) setTags([...tags, v])
    setInput("")
    setShowSug(false)
  }

  const remove = (i) => setTags(tags.filter((_, idx) => idx !== i))

  const filtered = suggestions.filter(
    (s) => s.toLowerCase().includes(input.toLowerCase()) && !tags.includes(s)
  )

  return (
    <div>
      <label className="block text-xs font-semibold tracking-widest mb-2"
             style={{ color: "var(--text-muted)" }}>
        {label}
      </label>

      {/* Tags display */}
      <div className="flex flex-wrap gap-2 mb-2">
        {tags.map((tag, i) => (
          <motion.span
            key={tag}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs
                       font-semibold"
            style={{
              backgroundColor: "rgba(57,255,20,0.12)",
              border:          "1px solid rgba(57,255,20,0.25)",
              color:           "var(--green)",
            }}
          >
            {tag}
            <button onClick={() => remove(i)}>
              <X size={11} />
            </button>
          </motion.span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          value={input}
          onChange={(e) => { setInput(e.target.value); setShowSug(true) }}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.preventDefault(); add(input) }
          }}
          onFocus={() => setShowSug(true)}
          onBlur={() => setTimeout(() => setShowSug(false), 150)}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl text-sm glass-card border
                     outline-none transition-all duration-200
                     focus:border-green/50 placeholder-gray-600"
          style={{ borderColor: "var(--glass-border)", color: "var(--text)" }}
        />
        <button
          type="button"
          onClick={() => add(input)}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6
                     rounded-lg bg-green flex items-center justify-center"
        >
          <Plus size={12} color="#080808" />
        </button>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {showSug && filtered.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.18 }}
              className="absolute top-full left-0 right-0 mt-1 rounded-xl
                         overflow-hidden z-20"
              style={{
                backgroundColor: "var(--surface)",
                border:          "1px solid var(--glass-border-bright)",
                boxShadow:       "var(--shadow-card)",
              }}
            >
              {filtered.slice(0, 5).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => add(s)}
                  className="w-full px-4 py-2.5 text-left text-sm
                             hover:bg-white/5 transition-all flex items-center
                             gap-2"
                  style={{ color: "var(--text-muted)" }}
                >
                  <Plus size={12} className="text-green" />
                  {s}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Step definitions ───────────────────────────────────────────
const STEPS = [
  { id: 1, label: "Fitness Level",   icon: Target  },
  { id: 2, label: "Goals",           icon: Trophy  },
  { id: 3, label: "Weaknesses",      icon: Brain   },
  { id: 4, label: "Body Stats",      icon: Scale   },
  { id: 5, label: "Competition",     icon: Calendar },
]

const GOAL_SUGGESTIONS = [
  "Build muscle", "Lose fat", "Increase strength",
  "Improve endurance", "Increase squat 1RM",
  "Improve bench press", "Athletic performance",
  "Body recomposition", "Powerlifting competition",
]

const WEAKNESS_SUGGESTIONS = [
  "Lower back", "Rear delts", "Hamstrings", "Hip mobility",
  "Core strength", "Shoulder stability", "Grip strength",
  "Knee pain", "Upper back", "Calves", "Wrist mobility",
]

const FITNESS_LEVELS = [
  {
    value: "beginner",
    label: "Beginner",
    desc:  "Less than 1 year of consistent training",
    color: "#39FF14",
  },
  {
    value: "intermediate",
    label: "Intermediate",
    desc:  "1–3 years, comfortable with main lifts",
    color: "#FFC800",
  },
  {
    value: "advanced",
    label: "Advanced",
    desc:  "3+ years, training for competition or peak performance",
    color: "#FF6B35",
  },
]

export default function AthleteOnboarding() {
  const navigate    = useNavigate()
  const { user }    = useAuthStore()

  const [step,    setStep]    = useState(1)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const [form, setForm] = useState({
    fitnessLevel:    "",
    goals:           [],
    weaknesses:      [],
    weight:          "",
    height:          "",
    dateOfBirth:     "",
    competitionDate: "",
  })

  const canNext = () => {
    if (step === 1) return !!form.fitnessLevel
    if (step === 2) return form.goals.length > 0
    if (step === 3) return true   // weaknesses optional
    if (step === 4) return !!form.weight && !!form.height
    return true
  }

  const handleNext = () => {
    if (step < STEPS.length) setStep(step + 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      await api.patch(`/athlete/${user.id}`, {
        fitnessLevel:    form.fitnessLevel,
        goals:           form.goals,
        weaknesses:      form.weaknesses,
        weight:          Number(form.weight),
        height:          Number(form.height),
        dateOfBirth:     form.dateOfBirth || undefined,
        competitionDate: form.competitionDate || undefined,
      })
      navigate("/athlete")
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save profile")
    } finally {
      setLoading(false)
    }
  }

  const progress = ((step - 1) / (STEPS.length - 1)) * 100

  return (
    <div className="min-h-screen flex flex-col items-center justify-center
                    px-4 py-12 relative overflow-hidden"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full"
             style={{
               background: "radial-gradient(circle, rgba(57,255,20,0.07) 0%, transparent 65%)",
               filter:     "blur(60px)",
             }} />
        <div className="absolute inset-0"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(57,255,20,0.025) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(57,255,20,0.025) 1px, transparent 1px)
               `,
               backgroundSize: "48px 48px",
             }} />
      </div>

      <div className="relative w-full max-w-lg">

        {/* Logo + greeting */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="flex items-center justify-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-green flex items-center
                            justify-center"
                 style={{ boxShadow: "0 0 20px rgba(57,255,20,0.4)" }}>
              <Zap size={18} color="#080808" fill="#080808" />
            </div>
            <span className="font-display font-800 text-2xl tracking-wider uppercase"
                  style={{ color: "var(--text)" }}>
              Free<span className="text-green">ko</span>
            </span>
          </div>
          <p className="text-xs text-green font-semibold tracking-widest mb-2">
            ATHLETE SETUP
          </p>
          <h1 className="font-display font-900 text-3xl sm:text-4xl uppercase
                         tracking-tight mb-2"
              style={{ color: "var(--text)" }}>
            Let's Build Your Profile
          </h1>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            This helps your coach and AI generate the perfect program
          </p>
        </motion.div>

        {/* Progress bar + steps */}
        <div className="mb-8">
          {/* Step labels */}
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s) => {
              const done   = step > s.id
              const active = step === s.id
              return (
                <div key={s.id}
                     className={`flex flex-col items-center gap-1
                                 ${active || done ? "" : "opacity-40"}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center
                                   justify-center transition-all duration-300
                                   ${done
                                     ? "bg-green"
                                     : active
                                       ? "bg-green-muted border border-green/50"
                                       : "glass-card border border-white/10"
                                   }`}>
                    {done
                      ? <CheckCircle size={14} color="#080808" />
                      : <s.icon size={14}
                                className={active ? "text-green" : ""}
                                style={{ color: active
                                  ? "var(--green)"
                                  : "var(--text-dim)" }} />
                    }
                  </div>
                  <span className="text-xs hidden sm:block font-medium"
                        style={{ color: active
                          ? "var(--green)"
                          : "var(--text-dim)" }}>
                    {s.label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Progress line */}
          <div className="h-1 rounded-full overflow-hidden"
               style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <motion.div
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="h-full rounded-full bg-green"
              style={{ boxShadow: "0 0 8px rgba(57,255,20,0.5)" }}
            />
          </div>
        </div>

        {/* Step content card */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border mb-5"
             style={{ borderColor: "var(--glass-border)" }}>
          <AnimatePresence mode="wait">

            {/* Step 1 — Fitness level */}
            {step === 1 && (
              <motion.div
                key="s1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="font-display font-700 text-2xl uppercase mb-1"
                    style={{ color: "var(--text)" }}>
                  Your Fitness Level
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  Be honest — this shapes your entire program
                </p>

                <div className="flex flex-col gap-3">
                  {FITNESS_LEVELS.map((level) => (
                    <motion.button
                      key={level.value}
                      type="button"
                      onClick={() => setForm({ ...form, fitnessLevel: level.value })}
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl
                                  border text-left transition-all duration-200
                                  ${form.fitnessLevel === level.value
                                    ? "border-green/50 bg-green/5"
                                    : "glass-card hover:border-white/20"
                                  }`}
                      style={{
                        borderColor: form.fitnessLevel === level.value
                          ? "rgba(57,255,20,0.5)"
                          : "var(--glass-border)"
                      }}
                    >
                      {/* Color dot */}
                      <div className="w-4 h-4 rounded-full flex-shrink-0"
                           style={{
                             backgroundColor: level.color,
                             boxShadow: form.fitnessLevel === level.value
                               ? `0 0 12px ${level.color}60`
                               : "none",
                           }} />
                      <div className="flex-1">
                        <p className="font-display font-700 text-lg uppercase"
                           style={{ color: form.fitnessLevel === level.value
                             ? "var(--green)" : "var(--text)" }}>
                          {level.label}
                        </p>
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {level.desc}
                        </p>
                      </div>
                      {form.fitnessLevel === level.value && (
                        <CheckCircle size={18} className="text-green flex-shrink-0" />
                      )}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2 — Goals */}
            {step === 2 && (
              <motion.div
                key="s2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="font-display font-700 text-2xl uppercase mb-1"
                    style={{ color: "var(--text)" }}>
                  Your Goals
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  Add at least 1 goal — type or pick from suggestions
                </p>

                <TagInput
                  label="TRAINING GOALS"
                  placeholder="e.g. Build muscle, Increase squat..."
                  tags={form.goals}
                  setTags={(v) => setForm({ ...form, goals: v })}
                  suggestions={GOAL_SUGGESTIONS}
                />

                {/* Quick pick */}
                <div className="mt-4">
                  <p className="text-xs mb-2"
                     style={{ color: "var(--text-muted)" }}>
                    Quick picks:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {GOAL_SUGGESTIONS
                      .filter((g) => !form.goals.includes(g))
                      .slice(0, 5)
                      .map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() =>
                            setForm({ ...form, goals: [...form.goals, g] })
                          }
                          className="px-3 py-1.5 rounded-xl text-xs font-medium
                                     glass-card border hover:border-green/40
                                     hover:text-green transition-all"
                          style={{
                            borderColor: "var(--glass-border)",
                            color:       "var(--text-muted)",
                          }}
                        >
                          + {g}
                        </button>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 3 — Weaknesses */}
            {step === 3 && (
              <motion.div
                key="s3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="font-display font-700 text-2xl uppercase mb-1"
                    style={{ color: "var(--text)" }}>
                  Weaknesses
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  Areas to focus on — skip if none (optional)
                </p>

                <TagInput
                  label="WEAK POINTS / FOCUS AREAS"
                  placeholder="e.g. Lower back, Rear delts..."
                  tags={form.weaknesses}
                  setTags={(v) => setForm({ ...form, weaknesses: v })}
                  suggestions={WEAKNESS_SUGGESTIONS}
                />

                <div className="mt-4">
                  <p className="text-xs mb-2"
                     style={{ color: "var(--text-muted)" }}>
                    Common focus areas:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {WEAKNESS_SUGGESTIONS
                      .filter((w) => !form.weaknesses.includes(w))
                      .slice(0, 6)
                      .map((w) => (
                        <button
                          key={w}
                          type="button"
                          onClick={() =>
                            setForm({
                              ...form,
                              weaknesses: [...form.weaknesses, w],
                            })
                          }
                          className="px-3 py-1.5 rounded-xl text-xs font-medium
                                     glass-card border hover:border-green/40
                                     hover:text-green transition-all"
                          style={{
                            borderColor: "var(--glass-border)",
                            color:       "var(--text-muted)",
                          }}
                        >
                          + {w}
                        </button>
                      ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 4 — Body stats */}
            {step === 4 && (
              <motion.div
                key="s4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="font-display font-700 text-2xl uppercase mb-1"
                    style={{ color: "var(--text)" }}>
                  Body Stats
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  Used by AI to calibrate your program
                </p>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Weight */}
                  <div>
                    <label className="block text-xs font-semibold tracking-widest mb-2"
                           style={{ color: "var(--text-muted)" }}>
                      WEIGHT (KG)
                    </label>
                    <div className="relative">
                      <Scale size={15}
                             className="absolute left-3 top-1/2 -translate-y-1/2"
                             style={{ color: "var(--text-muted)" }} />
                      <input
                        type="number"
                        value={form.weight}
                        onChange={(e) => setForm({ ...form, weight: e.target.value })}
                        placeholder="75"
                        required
                        className="w-full pl-9 pr-4 py-3.5 rounded-xl text-sm
                                   glass-card border outline-none transition-all
                                   focus:border-green/50 placeholder-gray-600"
                        style={{ borderColor: "var(--glass-border)",
                                 color: "var(--text)" }}
                      />
                    </div>
                  </div>

                  {/* Height */}
                  <div>
                    <label className="block text-xs font-semibold tracking-widest mb-2"
                           style={{ color: "var(--text-muted)" }}>
                      HEIGHT (CM)
                    </label>
                    <div className="relative">
                      <Ruler size={15}
                             className="absolute left-3 top-1/2 -translate-y-1/2"
                             style={{ color: "var(--text-muted)" }} />
                      <input
                        type="number"
                        value={form.height}
                        onChange={(e) => setForm({ ...form, height: e.target.value })}
                        placeholder="175"
                        required
                        className="w-full pl-9 pr-4 py-3.5 rounded-xl text-sm
                                   glass-card border outline-none transition-all
                                   focus:border-green/50 placeholder-gray-600"
                        style={{ borderColor: "var(--glass-border)",
                                 color: "var(--text)" }}
                      />
                    </div>
                  </div>
                </div>

                {/* Date of birth */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                         style={{ color: "var(--text-muted)" }}>
                    DATE OF BIRTH
                  </label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl text-sm glass-card
                               border outline-none transition-all
                               focus:border-green/50"
                    style={{ borderColor: "var(--glass-border)",
                             color: "var(--text)",
                             colorScheme: "dark" }}
                  />
                </div>
              </motion.div>
            )}

            {/* Step 5 — Competition */}
            {step === 5 && (
              <motion.div
                key="s5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35 }}
              >
                <h2 className="font-display font-700 text-2xl uppercase mb-1"
                    style={{ color: "var(--text)" }}>
                  Competition Date
                </h2>
                <p className="text-sm mb-6" style={{ color: "var(--text-muted)" }}>
                  Optional — if you're competing, AI will build your program
                  to peak on this date
                </p>

                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                         style={{ color: "var(--text-muted)" }}>
                    COMPETITION / TARGET DATE (OPTIONAL)
                  </label>
                  <input
                    type="date"
                    value={form.competitionDate}
                    onChange={(e) =>
                      setForm({ ...form, competitionDate: e.target.value })
                    }
                    className="w-full px-4 py-3.5 rounded-xl text-sm glass-card
                               border outline-none transition-all
                               focus:border-green/50"
                    style={{ borderColor: "var(--glass-border)",
                             color: "var(--text)",
                             colorScheme: "dark" }}
                  />
                </div>

                {/* Summary preview */}
                <div className="mt-6 p-5 rounded-2xl border"
                     style={{
                       backgroundColor: "rgba(57,255,20,0.04)",
                       borderColor:     "rgba(57,255,20,0.15)",
                     }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Brain size={14} className="text-green" />
                    <p className="text-xs font-semibold text-green tracking-widest">
                      PROFILE SUMMARY
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="mb-0.5"
                         style={{ color: "var(--text-muted)" }}>
                        Level
                      </p>
                      <p className="font-semibold capitalize text-green">
                        {form.fitnessLevel || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="mb-0.5"
                         style={{ color: "var(--text-muted)" }}>
                        Weight / Height
                      </p>
                      <p className="font-semibold"
                         style={{ color: "var(--text)" }}>
                        {form.weight ? `${form.weight}kg` : "—"} /{" "}
                        {form.height ? `${form.height}cm` : "—"}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="mb-1"
                         style={{ color: "var(--text-muted)" }}>
                        Goals
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {form.goals.length > 0
                          ? form.goals.map((g) => (
                              <span key={g}
                                    className="px-2 py-0.5 rounded-lg text-green"
                                    style={{
                                      backgroundColor: "rgba(57,255,20,0.1)",
                                    }}>
                                {g}
                              </span>
                            ))
                          : <span style={{ color: "var(--text-muted)" }}>—</span>
                        }
                      </div>
                    </div>
                    {form.weaknesses.length > 0 && (
                      <div className="col-span-2">
                        <p className="mb-1"
                           style={{ color: "var(--text-muted)" }}>
                          Focus Areas
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {form.weaknesses.map((w) => (
                            <span key={w}
                                  className="px-2 py-0.5 rounded-lg"
                                  style={{
                                    backgroundColor: "rgba(255,200,0,0.1)",
                                    color:           "#FFC800",
                                  }}>
                              {w}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-4 px-4 py-3 rounded-xl text-sm text-red-400"
                    style={{ backgroundColor: "rgba(255,80,80,0.08)",
                             border: "1px solid rgba(255,80,80,0.2)" }}
                  >
                    {error}
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation buttons */}
        <div className="flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-2 px-5 py-3.5 rounded-xl
                         btn-glass text-sm"
            >
              <ArrowLeft size={15} /> Back
            </button>
          )}

          <motion.button
            whileHover={canNext() ? { scale: 1.02 } : {}}
            whileTap={canNext() ? { scale: 0.98 } : {}}
            onClick={step === STEPS.length ? handleSubmit : handleNext}
            disabled={!canNext() || loading}
            className="flex-1 py-3.5 rounded-xl btn-green flex items-center
                       justify-center gap-2 text-sm font-bold
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-black
                                border-t-transparent animate-spin" />
                Saving...
              </>
            ) : step === STEPS.length ? (
              <>
                <CheckCircle size={16} />
                Complete Setup
              </>
            ) : (
              <>
                Continue <ArrowRight size={16} />
              </>
            )}
          </motion.button>
        </div>

        {/* Skip option */}
        {step === 3 && (
          <button
            onClick={handleNext}
            className="w-full mt-3 text-xs text-center hover:text-green
                       transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Skip this step — I'll add weaknesses later
          </button>
        )}
        {step === 5 && (
          <button
            onClick={handleSubmit}
            className="w-full mt-3 text-xs text-center hover:text-green
                       transition-colors"
            style={{ color: "var(--text-muted)" }}
          >
            Skip — I don't have a competition date
          </button>
        )}
      </div>
    </div>
  )
}