import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Zap, Eye, EyeOff, Mail, Lock,
  ArrowRight, ChevronRight, Brain,
  Activity, Shield
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

// ── Animated background stat card ─────────────────────────────
function BgCard({ icon: Icon, label, value, className }) {
  return (
    <div className={`absolute px-4 py-3 rounded-xl glass-card
                     flex items-center gap-3 ${className}`}>
      <div className="w-8 h-8 rounded-lg bg-green-muted flex items-center
                      justify-center flex-shrink-0">
        <Icon size={15} className="text-green" />
      </div>
      <div>
        <p className="font-display font-bold text-lg leading-none text-green">
          {value}
        </p>
        <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
          {label}
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  const [form,      setForm]      = useState({ email: "", password: "" })
  const [showPass,  setShowPass]  = useState(false)
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState("")
  const { setAuth }               = useAuthStore()
  const navigate                  = useNavigate()

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { data } = await api.post("/auth/login", form)
      setAuth(data.user, data.token)
      navigate(data.user.role === "coach" ? "/coach" : "/athlete")
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex overflow-hidden"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* ══════════════════════════════════════
          LEFT PANEL — Branding + visuals
      ══════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col
                      justify-between p-12 overflow-hidden"
           style={{ borderRight: "1px solid var(--glass-border)" }}>

        {/* Background blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.85, 0.5] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(57,255,20,0.13) 0%, transparent 65%)",
              filter:     "blur(60px)",
            }}
          />
          <motion.div
            animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 13, repeat: Infinity, ease: "easeInOut", delay: 4 }}
            className="absolute -bottom-32 -right-20 w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, rgba(57,255,20,0.08) 0%, transparent 65%)",
              filter:     "blur(60px)",
            }}
          />
          {/* Grid */}
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
          <div className="w-9 h-9 rounded-xl bg-green flex items-center
                          justify-center"
               style={{ boxShadow: "0 0 20px rgba(57,255,20,0.5)" }}>
            <Zap size={18} color="#080808" fill="#080808" />
          </div>
          <span className="font-display font-900 text-2xl uppercase tracking-widest"
                style={{ color: "var(--text)" }}>
            Free<span className="text-green">ko</span>
          </span>
        </div>

        {/* Center headline */}
        <div className="relative flex flex-col gap-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-display font-900 uppercase leading-[0.88]"
            style={{
              fontSize:      "clamp(3rem, 5vw, 5rem)",
              color:         "var(--text)",
              letterSpacing: "-0.01em",
            }}
          >
            TRAIN
            <br />
            <span className="text-green"
                  style={{ textShadow: "0 0 40px rgba(57,255,20,0.4)" }}>
              SMARTER.
            </span>
            <br />
            PEAK
            <br />
            FASTER.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.7 }}
            className="text-sm leading-relaxed max-w-xs"
            style={{ color: "var(--text-muted)" }}
          >
            Sign in to access your AI-powered training plan,
            track your progress, and chat with your coach.
          </motion.p>

          {/* Feature list */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.7 }}
            className="flex flex-col gap-3"
          >
            {[
              { icon: Brain,    text: "AI-generated periodized plans" },
              { icon: Activity, text: "Real-time anomaly detection"    },
              { icon: Shield,   text: "Weekly AI performance reports"  },
            ].map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-green-muted border
                                border-green/20 flex items-center justify-center
                                flex-shrink-0">
                  <Icon size={13} className="text-green" />
                </div>
                <span className="text-sm font-medium"
                      style={{ color: "var(--text-muted)" }}>
                  {text}
                </span>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Floating stat cards */}
        <div className="relative h-20">
          <BgCard icon={Activity} label="Sessions Logged" value="500k+"
                  className="bottom-0 left-0" />
          <BgCard icon={Brain} label="AI Plans Active" value="12k+"
                  className="bottom-0 right-0" />
        </div>
      </div>

      {/* ══════════════════════════════════════
          RIGHT PANEL — Login form
      ══════════════════════════════════════ */}
      <div className="w-full lg:w-1/2 flex items-center justify-center
                      px-4 sm:px-8 py-16 relative">

        {/* Mobile background blob */}
        <div className="lg:hidden absolute top-0 right-0 w-64 h-64 rounded-full
                        pointer-events-none"
             style={{
               background: "radial-gradient(circle, rgba(57,255,20,0.08) 0%, transparent 65%)",
               filter:     "blur(60px)",
             }} />

        <div className="w-full max-w-md relative">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="w-8 h-8 rounded-xl bg-green flex items-center
                            justify-center"
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
              — WELCOME BACK
            </p>
            <h1 className="font-display font-900 uppercase leading-[0.9]"
                style={{
                  fontSize:      "clamp(2.5rem, 5vw, 3.8rem)",
                  color:         "var(--text)",
                  letterSpacing: "-0.01em",
                }}>
              SIGN IN TO
              <br />
              <span className="text-green">FREEKO</span>
            </h1>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">

            {/* Email */}
            <motion.div custom={1} variants={fadeUp}
                        initial="hidden" animate="visible">
              <label className="block text-xs font-semibold tracking-widest mb-2"
                     style={{ color: "var(--text-muted)" }}>
                EMAIL ADDRESS
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2
                                           text-green pointer-events-none" />
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
            </motion.div>

            {/* Password */}
            <motion.div custom={2} variants={fadeUp}
                        initial="hidden" animate="visible">
              <label className="block text-xs font-semibold tracking-widest mb-2"
                     style={{ color: "var(--text-muted)" }}>
                PASSWORD
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2
                                           text-green pointer-events-none" />
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
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
            </motion.div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl text-sm font-medium"
                style={{
                  backgroundColor: "rgba(239,68,68,0.08)",
                  border:          "1px solid rgba(239,68,68,0.2)",
                  color:           "#f87171",
                }}
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.div custom={3} variants={fadeUp}
                        initial="hidden" animate="visible"
                        className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 text-sm btn-green flex items-center
                           justify-center gap-2 disabled:opacity-50
                           disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-black/30
                                    border-t-black animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In <ArrowRight size={16} />
                  </>
                )}
              </button>
            </motion.div>
          </form>

          {/* Divider */}
          <motion.div
            custom={4} variants={fadeUp}
            initial="hidden" animate="visible"
            className="flex items-center gap-4 my-6"
          >
            <div className="flex-1 h-px"
                 style={{ backgroundColor: "var(--glass-border)" }} />
            <span className="text-xs font-semibold tracking-widest"
                  style={{ color: "var(--text-muted)" }}>
              OR
            </span>
            <div className="flex-1 h-px"
                 style={{ backgroundColor: "var(--glass-border)" }} />
          </motion.div>

          {/* Register link */}
          <motion.div
            custom={5} variants={fadeUp}
            initial="hidden" animate="visible"
            className="text-center"
          >
            <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              Don't have an account yet?
            </p>
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-6 py-3 text-sm
                         btn-ghost-green w-full justify-center"
            >
              Create your account
              <ChevronRight size={15} />
            </Link>
          </motion.div>

          {/* Back to home */}
          <motion.div
            custom={6} variants={fadeUp}
            initial="hidden" animate="visible"
            className="text-center mt-6"
          >
            <Link to="/"
                  className="text-xs hover:text-green transition-colors"
                  style={{ color: "var(--text-muted)" }}>
              ← Back to home
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  )
}