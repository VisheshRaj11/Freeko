import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  Zap, Eye, EyeOff, ArrowRight, AlertCircle
} from "lucide-react"
import api from "../lib/axios"
import { useAuthStore } from "../../store/authStore"

export default function LoginPage() {
  const navigate    = useNavigate()
  const { setAuth } = useAuthStore()

  const [form,    setForm]    = useState({ email: "", password: "" })
  const [showPw,  setShowPw]  = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await api.post("/auth/login", form)
      setAuth(res.data.user, res.data.token)
      navigate(res.data.user.role === "coach" ? "/coach" : "/athlete")
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12
                    relative overflow-hidden"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full"
             style={{
               background: "radial-gradient(circle, rgba(57,255,20,0.07) 0%, transparent 65%)",
               filter:     "blur(80px)",
             }} />
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

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="glass-card rounded-2xl p-8 border"
          style={{ borderColor: "var(--glass-border)" }}
        >
          {/* Header */}
          <div className="mb-8">
            <p className="text-xs text-green font-semibold tracking-widest mb-2">
              WELCOME BACK
            </p>
            <h1 className="font-display font-900 text-4xl uppercase tracking-tight mb-2"
                style={{ color: "var(--text)" }}>
              Sign In
            </h1>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              Continue your training journey
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

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
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold tracking-widest"
                       style={{ color: "var(--text-muted)" }}>
                  PASSWORD
                </label>
                <button type="button"
                        className="text-xs text-green hover:underline">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Your password"
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
                         justify-center gap-2 text-sm font-bold
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-black
                                  border-t-transparent animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In <ArrowRight size={16} />
                </>
              )}
            </motion.button>

            <p className="text-center text-sm"
               style={{ color: "var(--text-muted)" }}>
              Don't have an account?{" "}
              <Link to="/register"
                    className="text-green font-semibold hover:underline">
                Create one
              </Link>
            </p>
          </form>
        </motion.div>

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

        {/* Demo credentials hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-4 px-4 py-3 rounded-xl text-center"
          style={{ backgroundColor: "rgba(57,255,20,0.04)",
                   border: "1px solid rgba(57,255,20,0.1)" }}
        >
          <p className="text-xs" style={{ color: "var(--text-muted)" }}>
            <span className="text-green font-semibold">Demo:</span>{" "}
            coach@freeko.com / athlete@freeko.com · password: demo123
          </p>
        </motion.div>
      </div>
    </div>
  )
}