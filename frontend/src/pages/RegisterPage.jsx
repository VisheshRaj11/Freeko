import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Zap, Eye, EyeOff, ArrowRight,
  Dumbbell, Users, CheckCircle, AlertCircle
} from "lucide-react"
import api from "../lib/axios"
import { useAuthStore } from "../../store/authStore"

const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  },
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

export default function RegisterPage() {
  const navigate        = useNavigate()
  const { setAuth }     = useAuthStore()

  const [step,    setStep]    = useState(1)   // 1 = role, 2 = details
  const [role,    setRole]    = useState(null) // "coach" | "athlete"
  const [form,    setForm]    = useState({ name: "", email: "", password: "", confirm: "" })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleRoleSelect = (r) => {
    setRole(r)
    setTimeout(() => setStep(2), 320)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.password !== form.confirm) {
      setError("Passwords do not match")
      return
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const res = await api.post("/auth/register", {
        name:     form.name,
        email:    form.email,
        password: form.password,
        role,
      })
      setAuth(res.data.user, res.data.token)

      // Coach → dashboard, Athlete → onboarding
      if (role === "coach") navigate("/coach")
      else                   navigate("/athlete/onboarding")
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12
                    relative overflow-hidden"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full"
             style={{
               background: "radial-gradient(circle, rgba(57,255,20,0.08) 0%, transparent 65%)",
               filter:     "blur(60px)",
             }} />
        <div className="absolute -bottom-32 -right-32 w-[400px] h-[400px] rounded-full"
             style={{
               background: "radial-gradient(circle, rgba(57,255,20,0.05) 0%, transparent 65%)",
               filter:     "blur(60px)",
             }} />
        {/* Grid */}
        <div className="absolute inset-0"
             style={{
               backgroundImage: `
                 linear-gradient(rgba(57,255,20,0.03) 1px, transparent 1px),
                 linear-gradient(90deg, rgba(57,255,20,0.03) 1px, transparent 1px)
               `,
               backgroundSize: "48px 48px",
             }} />
      </div>

      <div className="relative w-full max-w-md">

        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2.5 mb-10"
        >
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-green flex items-center
                            justify-center"
                 style={{ boxShadow: "0 0 20px rgba(57,255,20,0.4)" }}>
              <Zap size={18} color="#080808" fill="#080808" />
            </div>
            <span className="font-display font-800 text-2xl tracking-wider uppercase"
                  style={{ color: "var(--text)" }}>
              Free<span className="text-green">ko</span>
            </span>
          </Link>
        </motion.div>

        <AnimatePresence mode="wait">

          {/* ── Step 1: Role selector ──────────────────────── */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="text-center mb-8">
                <p className="text-xs text-green font-semibold tracking-widest mb-2">
                  STEP 1 OF 2
                </p>
                <h1 className="font-display font-900 text-4xl uppercase tracking-tight
                               mb-2"
                    style={{ color: "var(--text)" }}>
                  I am a...
                </h1>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  Choose your role to get started
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Coach card */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRoleSelect("coach")}
                  className="flex flex-col items-center gap-4 p-8 rounded-2xl
                             glass-card border hover:border-green/50 transition-all
                             duration-300 group cursor-pointer"
                  style={{ borderColor: "var(--glass-border)" }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-green-muted border
                                  border-green/30 flex items-center justify-center
                                  group-hover:bg-green transition-all duration-300">
                    <Users size={28}
                           className="text-green group-hover:text-black
                                      transition-colors duration-300" />
                  </div>
                  <div className="text-center">
                    <p className="font-display font-700 text-xl uppercase text-green mb-1">
                      Coach
                    </p>
                    <p className="text-xs leading-relaxed"
                       style={{ color: "var(--text-muted)" }}>
                      Build programs, track athletes, generate AI plans
                    </p>
                  </div>
                </motion.button>

                {/* Athlete card */}
                <motion.button
                  whileHover={{ scale: 1.03, y: -4 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleRoleSelect("athlete")}
                  className="flex flex-col items-center gap-4 p-8 rounded-2xl
                             glass-card border hover:border-green/50 transition-all
                             duration-300 group cursor-pointer"
                  style={{ borderColor: "var(--glass-border)" }}
                >
                  <div className="w-16 h-16 rounded-2xl bg-green-muted border
                                  border-green/30 flex items-center justify-center
                                  group-hover:bg-green transition-all duration-300">
                    <Dumbbell size={28}
                              className="text-green group-hover:text-black
                                         transition-colors duration-300" />
                  </div>
                  <div className="text-center">
                    <p className="font-display font-700 text-xl uppercase text-green mb-1">
                      Athlete
                    </p>
                    <p className="text-xs leading-relaxed"
                       style={{ color: "var(--text-muted)" }}>
                      Follow your plan, log workouts, chat with coach
                    </p>
                  </div>
                </motion.button>
              </div>

              <p className="text-center text-sm mt-8"
                 style={{ color: "var(--text-muted)" }}>
                Already have an account?{" "}
                <Link to="/login" className="text-green font-semibold
                                             hover:underline">
                  Sign in
                </Link>
              </p>
            </motion.div>

            
          )}

           <motion.div
            custom={6} 
            initial="hidden" animate="visible"
            className="text-center mt-6"
          >
            <Link to="/"
                  className="text-xs hover:text-green transition-colors"
                  style={{ color: "var(--text-muted)" }}>
              ← Back to home
            </Link>
          </motion.div>

          {/* ── Step 2: Details form ───────────────────────── */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Header */}
              <div className="text-center mb-8">
                <p className="text-xs text-green font-semibold tracking-widest mb-2">
                  STEP 2 OF 2 · {role?.toUpperCase()}
                </p>
                <h1 className="font-display font-900 text-4xl uppercase tracking-tight
                               mb-2"
                    style={{ color: "var(--text)" }}>
                  Create Account
                </h1>
                <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                  {role === "coach"
                    ? "Set up your coaching profile"
                    : "Start your fitness journey"
                  }
                </p>
              </div>

              {/* Role badge */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl
                                bg-green-muted border border-green/20">
                  {role === "coach"
                    ? <Users size={14} className="text-green" />
                    : <Dumbbell size={14} className="text-green" />
                  }
                  <span className="text-xs font-bold text-green uppercase tracking-wider">
                    {role}
                  </span>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-xs hover:text-green transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  ← Change role
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                         style={{ color: "var(--text-muted)" }}>
                    FULL NAME
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Rahul Sharma"
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm glass-card
                               border outline-none transition-all duration-200
                               focus:border-green/50 placeholder-gray-600"
                    style={{ borderColor: "var(--glass-border)",
                             color: "var(--text)" }}
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                         style={{ color: "var(--text-muted)" }}>
                    EMAIL
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="rahul@example.com"
                    required
                    className="w-full px-4 py-3.5 rounded-xl text-sm glass-card
                               border outline-none transition-all duration-200
                               focus:border-green/50 placeholder-gray-600"
                    style={{ borderColor: "var(--glass-border)",
                             color: "var(--text)" }}
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                         style={{ color: "var(--text-muted)" }}>
                    PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      placeholder="Min 6 characters"
                      required
                      className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm
                                 glass-card border outline-none transition-all
                                 duration-200 focus:border-green/50 placeholder-gray-600"
                      style={{ borderColor: "var(--glass-border)",
                               color: "var(--text)" }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-4 top-1/2 -translate-y-1/2
                                 hover:text-green transition-colors"
                      style={{ color: "var(--text-muted)" }}
                    >
                      {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Password strength bar */}
                  {form.password && (
                    <div className="mt-2 flex gap-1">
                      {[1,2,3,4].map((i) => (
                        <div key={i} className="flex-1 h-1 rounded-full transition-all"
                             style={{
                               backgroundColor:
                                 form.password.length >= i * 2
                                   ? form.password.length >= 8
                                     ? "var(--green)"
                                     : "#FFC800"
                                   : "rgba(255,255,255,0.06)"
                             }} />
                      ))}
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div>
                  <label className="block text-xs font-semibold tracking-widest mb-2"
                         style={{ color: "var(--text-muted)" }}>
                    CONFIRM PASSWORD
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      placeholder="Re-enter password"
                      required
                      className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm
                                 glass-card border outline-none transition-all
                                 duration-200 focus:border-green/50 placeholder-gray-600"
                      style={{
                        borderColor: form.confirm && form.confirm !== form.password
                          ? "rgba(255,80,80,0.4)"
                          : form.confirm && form.confirm === form.password
                            ? "rgba(57,255,20,0.4)"
                            : "var(--glass-border)",
                        color: "var(--text)",
                      }}
                    />
                    {form.confirm && (
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {form.confirm === form.password
                          ? <CheckCircle size={16} className="text-green" />
                          : <AlertCircle size={16} className="text-red-400" />
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 px-4 py-3 rounded-xl"
                    style={{
                      backgroundColor: "rgba(255,80,80,0.08)",
                      border:          "1px solid rgba(255,80,80,0.2)",
                    }}
                  >
                    <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                    <p className="text-sm text-red-400">{error}</p>
                  </motion.div>
                )}

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={!loading ? { scale: 1.02 } : {}}
                  whileTap={!loading ? { scale: 0.98 } : {}}
                  className="w-full py-4 rounded-xl btn-green flex items-center
                             justify-center gap-2 text-sm font-bold mt-2
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 rounded-full border-2 border-black
                                      border-t-transparent animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={16} />
                    </>
                  )}
                </motion.button>

                <p className="text-center text-sm"
                   style={{ color: "var(--text-muted)" }}>
                  Already have an account?{" "}
                  <Link to="/login" className="text-green font-semibold
                                               hover:underline">
                    Sign in
                  </Link>
                </p>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}