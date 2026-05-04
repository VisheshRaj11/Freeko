import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap, Eye, EyeOff, Mail, Lock,
  User, ArrowRight, ChevronRight,
  Dumbbell, Users, CheckCircle
} from "lucide-react"
import { useAuthStore } from "../../store/authStore"
import api from "../lib/axios"

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.07, duration: 0.55, ease: [0.22, 1, 0.36, 1] }
  }),
}

// ── Role card ──────────────────────────────────────────────────
function RoleCard({ role, icon: Icon, title, description,
                   perks, selected, onSelect }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(role)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="relative w-full text-left p-5 rounded-2xl transition-all
                 duration-300 overflow-hidden"
      style={{
        backgroundColor: selected ? "rgba(57,255,20,0.07)" : "var(--glass-1)",
        border:          selected
          ? "1.5px solid rgba(57,255,20,0.5)"
          : "1px solid var(--glass-border-bright)",
        boxShadow:       selected
          ? "0 0 24px rgba(57,255,20,0.12)"
          : "none",
      }}
    >
      {/* Selected glow */}
      {selected && (
        <div className="absolute inset-0 pointer-events-none rounded-2xl"
             style={{
               background: "radial-gradient(circle at 20% 20%, rgba(57,255,20,0.08) 0%, transparent 65%)"
             }} />
      )}

      <div className="relative flex items-start gap-4">
        {/* Icon */}
        <div className="w-11 h-11 rounded-xl flex items-center justify-center
                        flex-shrink-0 transition-all duration-300"
             style={{
               backgroundColor: selected ? "rgba(57,255,20,0.15)" : "rgba(255,255,255,0.04)",
               border:          selected ? "1px solid rgba(57,255,20,0.3)" : "1px solid var(--glass-border)",
             }}>
          <Icon size={20} style={{ color: selected ? "var(--green)" : "var(--text-muted)" }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <p className="font-display font-700 text-base uppercase tracking-tight"
               style={{ color: selected ? "var(--green)" : "var(--text)" }}>
              {title}
            </p>
            {/* Checkmark */}
            <div className={`w-5 h-5 rounded-full flex items-center justify-center
                             transition-all duration-300 flex-shrink-0
                             ${selected ? "bg-green" : "border border-[var(--glass-border-bright)]"}`}>
              {selected && <CheckCircle size={12} color="#080808" fill="#080808" />}
            </div>
          </div>
          <p className="text-xs leading-relaxed mb-3"
             style={{ color: "var(--text-muted)" }}>
            {description}
          </p>
          {/* Perks */}
          <div className="flex flex-col gap-1">
            {perks.map((perk) => (
              <div key={perk} className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full flex-shrink-0"
                     style={{ backgroundColor: selected ? "var(--green)" : "var(--text-dim)" }} />
                <span className="text-xs"
                      style={{ color: selected ? "var(--text-muted)" : "var(--text-dim)" }}>
                  {perk}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

export default function RegisterPage() {
  const [step,     setStep]     = useState(1)  // 1 = role, 2 = details
  const [form,     setForm]     = useState({
    name: "", email: "", password: "", role: ""
  })
  const [showPass, setShowPass] = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState("")
  const { setAuth }             = useAuthStore()
  const navigate                = useNavigate()

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleRoleSelect = (role) => {
    setForm((p) => ({ ...p, role }))
  }

  const handleNext = (e) => {
    e.preventDefault()
    if (!form.role) { setError("Please select a role to continue."); return }
    setError("")
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      // console.log(form);
      const { data } = await api.post("/auth/register", {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role:     form.role,
      })
      setAuth(data.user, data.token)
      navigate(data.user.role === "coach" ? "/coach" : "/athlete")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* ══════════════════════════════════════
          LEFT PANEL
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col
                      justify-between p-12 overflow-hidden"
           style={{ borderRight: "1px solid var(--glass-border)" }}>

        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(57,255,20,0.12) 0%, transparent 65%)",
              filter:     "blur(60px)",
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.06, 1], opacity: [0.3, 0.55, 0.3] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut", delay: 5 }}
            className="absolute -bottom-24 -right-16 w-[380px] h-[380px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(57,255,20,0.07) 0%, transparent 65%)",
              filter:     "blur(50px)",
            }}
          />
          <div className="absolute inset-0"
               style={{
                 backgroundImage: `
                   linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)
                 `,
                 backgroundSize: "40px 40px",
               }} />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-green flex items-center justify-center"
               style={{ boxShadow: "0 0 20px rgba(57,255,20,0.5)" }}>
            <Zap size={18} color="#080808" fill="#080808" />
          </div>
          <span className="font-display font-900 text-2xl uppercase tracking-widest"
                style={{ color: "var(--text)" }}>
            Free<span className="text-green">ko</span>
          </span>
        </div>

        {/* Center content */}
        <div className="relative flex flex-col gap-8">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-900 uppercase leading-[0.88]"
            style={{
              fontSize:      "clamp(3rem, 5vw, 4.8rem)",
              color:         "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            JOIN THE
            <br />
            <span className="text-green"
                  style={{ textShadow: "0 0 40px rgba(57,255,20,0.4)" }}>
              FREEKO
            </span>
            <br />
            FAMILY.
          </motion.h2>

          {/* Step progress indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="flex flex-col gap-4"
          >
            {[
              { n: "01", label: "Choose your role" },
              { n: "02", label: "Fill in your details" },
              { n: "03", label: "Start training" },
            ].map(({ n, label }, i) => {
              const done    = (i === 0 && step >= 1 && form.role) ||
                              (i === 1 && step === 2) || i < step - 1
              const current = (i === 0 && step === 1) || (i === 1 && step === 2)
              return (
                <div key={n} className="flex items-center gap-4">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center
                                   font-display font-bold text-sm transition-all duration-300
                                   ${current
                                     ? "bg-green text-black shadow-[0_0_16px_rgba(57,255,20,0.5)]"
                                     : done
                                     ? "bg-green/20 border border-green/40 text-green"
                                     : "border border-[var(--glass-border)] text-[var(--text-muted)]"
                                   }`}>
                    {done && !current ? <CheckCircle size={15} /> : n}
                  </div>
                  <span className={`text-sm font-medium transition-colors duration-300
                                   ${current ? "text-green" : done
                                     ? "text-[var(--text-muted)]"
                                     : "text-[var(--text-dim)]"}`}>
                    {label}
                  </span>
                </div>
              )
            })}
          </motion.div>
        </div>

        {/* Bottom quote */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="relative px-5 py-4 rounded-2xl glass-card border-l-2"
          style={{ borderLeftColor: "var(--green)" }}
        >
          <p className="text-sm italic leading-relaxed"
             style={{ color: "var(--text-muted)" }}>
            "The only bad workout is the one that didn't happen."
          </p>
          <p className="text-xs mt-2 font-semibold text-green">
            — Freeko AI Coach
          </p>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — Form
      ══════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center
                      px-4 sm:px-8 py-12 relative overflow-hidden">

        {/* Mobile blob */}
        <div className="lg:hidden absolute top-0 right-0 w-64 h-64 rounded-full
                        pointer-events-none"
             style={{
               background: "radial-gradient(circle, rgba(57,255,20,0.07) 0%, transparent 65%)",
               filter:     "blur(60px)",
             }} />

        <div className="w-full max-w-md relative">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-xl bg-green flex items-center justify-center"
                 style={{ boxShadow: "0 0 16px rgba(57,255,20,0.5)" }}>
              <Zap size={15} color="#080808" fill="#080808" />
            </div>
            <span className="font-display font-900 text-2xl uppercase tracking-widest"
                  style={{ color: "var(--text)" }}>
              Free<span className="text-green">ko</span>
            </span>
          </div>

          {/* Heading */}
          <motion.div
            custom={0} variants={fadeUp}
            initial="hidden" animate="visible"
            className="mb-8"
          >
            <p className="text-xs font-semibold tracking-widest text-green mb-2">
              — {step === 1 ? "STEP 01 OF 02" : "STEP 02 OF 02"}
            </p>
            <h1 className="font-display font-900 uppercase leading-[0.9]"
                style={{
                  fontSize:      "clamp(2.2rem, 5vw, 3.5rem)",
                  color:         "var(--text)",
                  letterSpacing: "-0.01em",
                }}>
              {step === 1 ? (
                <>
                  CHOOSE
                  <br />
                  <span className="text-green">YOUR ROLE</span>
                </>
              ) : (
                <>
                  YOUR
                  <br />
                  <span className="text-green">DETAILS</span>
                </>
              )}
            </h1>
          </motion.div>

          {/* ── Step 1: Role selection ── */}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.form
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleNext}
                className="flex flex-col gap-4"
              >
                <RoleCard
                  role="athlete"
                  icon={Dumbbell}
                  title="I'm an Athlete"
                  description="I want a coach to guide my training with AI-powered plans."
                  perks={[
                    "Access your personalized periodized plan",
                    "Log workouts and get anomaly alerts",
                    "Chat with your coach in real time",
                  ]}
                  selected={form.role === "athlete"}
                  onSelect={handleRoleSelect}
                />
                <RoleCard
                  role="coach"
                  icon={Users}
                  title="I'm a Coach"
                  description="I want to manage athletes and build AI-powered programs."
                  perks={[
                    "Generate plans for multiple athletes",
                    "Monitor anomalies across all athletes",
                    "Get weekly AI-written performance reports",
                  ]}
                  selected={form.role === "coach"}
                  onSelect={handleRoleSelect}
                />

                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.08)",
                      border:          "1px solid rgba(239,68,68,0.2)",
                      color:           "#f87171",
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                <button type="submit"
                        className="w-full py-3.5 text-sm btn-green flex items-center
                                   justify-center gap-2 mt-2">
                  Continue <ArrowRight size={16} />
                </button>

                <p className="text-center text-sm"
                   style={{ color: "var(--text-muted)" }}>
                  Already have an account?{" "}
                  <Link to="/login" className="text-green font-semibold
                                               hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.form>
            )}

            {/* ── Step 2: Details ── */}
            {step === 2 && (
              <motion.form
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                {/* Selected role badge */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl
                                w-fit"
                     style={{
                       backgroundColor: "rgba(57,255,20,0.08)",
                       border:          "1px solid rgba(57,255,20,0.2)",
                     }}>
                  {form.role === "athlete"
                    ? <Dumbbell size={13} className="text-green" />
                    : <Users    size={13} className="text-green" />
                  }
                  <span className="text-xs font-semibold text-green capitalize">
                    {form.role}
                  </span>
                  <button type="button" onClick={() => setStep(1)}
                          className="text-xs ml-1 hover:underline"
                          style={{ color: "var(--text-muted)" }}>
                    Change
                  </button>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                         style={{ color: "var(--text-muted)" }}>
                    FULL NAME
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-4 top-1/2
                                               -translate-y-1/2 text-green
                                               pointer-events-none" />
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Rahul Sharma"
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm
                                 outline-none transition-all duration-200
                                 placeholder:text-[var(--text-dim)]
                                 focus:border-green/60
                                 focus:shadow-[0_0_0_3px_rgba(57,255,20,0.10)]"
                      style={{
                        backgroundColor: "var(--glass-1)",
                        border:          "1px solid var(--glass-border-bright)",
                        color:           "var(--text)",
                      }}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                         style={{ color: "var(--text-muted)" }}>
                    EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-4 top-1/2
                                               -translate-y-1/2 text-green
                                               pointer-events-none" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      required
                      className="w-full pl-11 pr-4 py-3.5 rounded-xl text-sm
                                 outline-none transition-all duration-200
                                 placeholder:text-[var(--text-dim)]
                                 focus:border-green/60
                                 focus:shadow-[0_0_0_3px_rgba(57,255,20,0.10)]"
                      style={{
                        backgroundColor: "var(--glass-1)",
                        border:          "1px solid var(--glass-border-bright)",
                        color:           "var(--text)",
                      }}
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                         style={{ color: "var(--text-muted)" }}>
                    PASSWORD
                  </label>
                  <div className="relative">
                    <Lock size={16} className="absolute left-4 top-1/2
                                               -translate-y-1/2 text-green
                                               pointer-events-none" />
                    <input
                      type={showPass ? "text" : "password"}
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      placeholder="Min 8 characters"
                      required
                      minLength={8}
                      className="w-full pl-11 pr-12 py-3.5 rounded-xl text-sm
                                 outline-none transition-all duration-200
                                 placeholder:text-[var(--text-dim)]
                                 focus:border-green/60
                                 focus:shadow-[0_0_0_3px_rgba(57,255,20,0.10)]"
                      style={{
                        backgroundColor: "var(--glass-1)",
                        border:          "1px solid var(--glass-border-bright)",
                        color:           "var(--text)",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4 top-1/2 -translate-y-1/2
                                 hover:text-green transition-colors"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Password strength bar */}
                {form.password && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-1.5"
                  >
                    {[...Array(4)].map((_, i) => (
                      <div key={i}
                           className="flex-1 h-1 rounded-full transition-all duration-300"
                           style={{
                             backgroundColor:
                               form.password.length > i * 2 + 4
                                 ? i < 2 ? "#ef4444"
                                 : i < 3 ? "#f59e0b"
                                 : "var(--green)"
                                 : "var(--glass-border)",
                           }} />
                    ))}
                  </motion.div>
                )}

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="px-4 py-3 rounded-xl text-sm"
                    style={{
                      backgroundColor: "rgba(239,68,68,0.08)",
                      border:          "1px solid rgba(239,68,68,0.2)",
                      color:           "#f87171",
                    }}
                  >
                    {error}
                  </motion.div>
                )}

                {/* Buttons */}
                <div className="flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-3.5 text-sm btn-glass flex-shrink-0"
                  >
                    ← Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-3.5 text-sm btn-green flex items-center
                               justify-center gap-2 disabled:opacity-50
                               disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 rounded-full border-2 border-black/30
                                        border-t-black animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create Account <ArrowRight size={16} />
                      </>
                    )}
                  </button>
                </div>

                {/* Login link */}
                <p className="text-center text-sm"
                   style={{ color: "var(--text-muted)" }}>
                  Already have an account?{" "}
                  <Link to="/login" className="text-green font-semibold hover:underline">
                    Sign in
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Back to home */}
          <div className="text-center mt-6">
            <Link to="/"
                  className="text-xs hover:text-green transition-colors"
                  style={{ color: "var(--text-muted)" }}>
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}