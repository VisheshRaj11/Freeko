import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Plus, Search, Filter,
  Dumbbell, ClipboardList, MessageSquare,
  ChevronRight, X, Brain, AlertTriangle,
  CheckCircle, Clock, Zap, Mail,
  TrendingUp, MoreVertical, Trash2,
  UserPlus, RefreshCw
} from "lucide-react"
import { useAuthStore } from "../../../store/authStore"
import api from "../../lib/axios"

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.05, duration: 0.5, ease: [0.22, 1, 0.36, 1] }
  }),
}

// ── Status badge ──────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    active:    { color: "var(--green)",  bg: "rgba(57,255,20,0.10)",  border: "rgba(57,255,20,0.25)"  },
    draft:     { color: "#f59e0b",       bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.25)" },
    completed: { color: "#6b7280",       bg: "rgba(107,114,128,0.10)",border: "rgba(107,114,128,0.25)"},
    archived:  { color: "#6b7280",       bg: "rgba(107,114,128,0.10)",border: "rgba(107,114,128,0.25)"},
  }
  const s = map[status] || map.draft
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-semibold
                     px-2.5 py-1 rounded-lg capitalize"
          style={{
            color:           s.color,
            backgroundColor: s.bg,
            border:          `1px solid ${s.border}`,
          }}>
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: s.color }} />
      {status || "No plan"}
    </span>
  )
}

// ── Generate Plan Modal ───────────────────────────────────────
function GeneratePlanModal({ athlete, onClose, onSuccess }) {
  const [form, setForm] = useState({
    title:      `${athlete.name}'s Training Plan`,
    totalWeeks: 12,
    startDate:  new Date().toISOString().split("T")[0],
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    try {
      await api.post("/plan/generate", {
        athleteId:  athlete.id,
        title:      form.title,
        totalWeeks: Number(form.totalWeeks),
        startDate:  form.startDate,
      })
      onSuccess()
      onClose()
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate plan.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: "rgba(0,0,0,0.75)",
               backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl p-6 relative overflow-hidden"
        style={{
          backgroundColor: "var(--surface)",
          border:          "1px solid var(--glass-border-bright)",
          boxShadow:       "0 24px 80px rgba(0,0,0,0.8)",
        }}
      >
        {/* Green top strip */}
        <div className="absolute top-0 inset-x-0 h-0.5"
             style={{ background: "linear-gradient(90deg, var(--green), transparent)" }} />

        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Brain size={16} className="text-green" />
              <span className="text-xs font-semibold tracking-widest text-green">
                AI PLAN GENERATOR
              </span>
            </div>
            <h2 className="font-display font-900 text-2xl uppercase"
                style={{ color: "var(--text)" }}>
              Generate Plan
            </h2>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              For <span className="text-green font-semibold">{athlete.name}</span>
            </p>
          </div>
          <button onClick={onClose}
                  className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center
                             justify-center transition-colors"
                  style={{ color: "var(--text-muted)" }}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Plan title */}
          <div>
            <label className="block text-xs font-semibold tracking-widest mb-2"
                   style={{ color: "var(--text-muted)" }}>
              PLAN TITLE
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                         transition-all placeholder:text-[var(--text-dim)]
                         focus:border-green/60
                         focus:shadow-[0_0_0_3px_rgba(57,255,20,0.10)]"
              style={{
                backgroundColor: "var(--glass-1)",
                border:          "1px solid var(--glass-border-bright)",
                color:           "var(--text)",
              }}
            />
          </div>

          {/* Total weeks */}
          <div>
            <label className="block text-xs font-semibold tracking-widest mb-2"
                   style={{ color: "var(--text-muted)" }}>
              TOTAL WEEKS
            </label>
            <div className="flex gap-3">
              {[8, 12, 14, 16].map((w) => (
                <button
                  key={w}
                  type="button"
                  onClick={() => setForm((p) => ({ ...p, totalWeeks: w }))}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold
                             transition-all duration-200"
                  style={{
                    backgroundColor: form.totalWeeks === w
                      ? "rgba(57,255,20,0.12)"
                      : "var(--glass-1)",
                    border:          form.totalWeeks === w
                      ? "1px solid rgba(57,255,20,0.4)"
                      : "1px solid var(--glass-border-bright)",
                    color:           form.totalWeeks === w
                      ? "var(--green)"
                      : "var(--text-muted)",
                    boxShadow:       form.totalWeeks === w
                      ? "0 0 12px rgba(57,255,20,0.1)"
                      : "none",
                  }}
                >
                  {w}wk
                </button>
              ))}
            </div>
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
              onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              required
              className="w-full px-4 py-3 rounded-xl text-sm outline-none
                         transition-all focus:border-green/60
                         focus:shadow-[0_0_0_3px_rgba(57,255,20,0.10)]"
              style={{
                backgroundColor: "var(--glass-1)",
                border:          "1px solid var(--glass-border-bright)",
                color:           "var(--text)",
                colorScheme:     "dark",
              }}
            />
          </div>

          {/* AI note */}
          <div className="flex items-start gap-3 px-4 py-3 rounded-xl"
               style={{
                 backgroundColor: "rgba(57,255,20,0.05)",
                 border:          "1px solid rgba(57,255,20,0.15)",
               }}>
            <Brain size={14} className="text-green flex-shrink-0 mt-0.5" />
            <p className="text-xs leading-relaxed"
               style={{ color: "var(--text-muted)" }}>
              Gemini AI will read the athlete's goals, weaknesses, fitness level
              and competition date to build a full periodized program automatically.
            </p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl text-sm"
                 style={{
                   backgroundColor: "rgba(239,68,68,0.08)",
                   border:          "1px solid rgba(239,68,68,0.2)",
                   color:           "#f87171",
                 }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 mt-2">
            <button type="button" onClick={onClose}
                    className="px-5 py-3 text-sm btn-glass flex-shrink-0">
              Cancel
            </button>
            <button type="submit" disabled={loading}
                    className="flex-1 py-3 text-sm btn-green flex items-center
                               justify-center gap-2 disabled:opacity-50">
              {loading ? (
                <>
                  <RefreshCw size={15} className="animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Brain size={15} /> Generate Plan
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}

// ── Athlete full card ─────────────────────────────────────────
function AthleteCard({ athlete, onGeneratePlan, delay }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const progress = athlete.progress || 0

  return (
    <motion.div
      custom={delay}
      variants={fadeUp}
      initial="hidden"
      animate="visible"
      className="relative rounded-2xl glass-card overflow-hidden group
                 hover:border-green/20 transition-all duration-300"
    >
      {/* Green top line on hover */}
      <div className="absolute inset-x-0 top-0 h-px opacity-0
                      group-hover:opacity-100 transition-opacity duration-500"
           style={{ background: "linear-gradient(90deg, transparent, var(--green), transparent)" }} />

      {/* Card top */}
      <div className="p-5 border-b"
           style={{ borderColor: "var(--glass-border)" }}>
        <div className="flex items-start gap-4">
          {/* Big avatar */}
          <div className="w-14 h-14 rounded-2xl bg-green-muted border border-green/25
                          flex items-center justify-center flex-shrink-0">
            <span className="font-display font-900 text-2xl text-green">
              {athlete.name?.[0]?.toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-display font-700 text-xl uppercase
                               tracking-tight leading-none mb-1"
                   style={{ color: "var(--text)" }}>
                  {athlete.name}
                </p>
                <div className="flex items-center gap-1.5 text-xs"
                     style={{ color: "var(--text-muted)" }}>
                  <Mail size={11} />
                  <span className="truncate max-w-[180px]">{athlete.email}</span>
                </div>
              </div>

              {/* Menu */}
              <div className="relative flex-shrink-0">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="w-8 h-8 rounded-lg hover:bg-white/5 flex items-center
                             justify-center transition-colors"
                  style={{ color: "var(--text-muted)" }}
                >
                  <MoreVertical size={16} />
                </button>
                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9, y: -8 }}
                      animate={{ opacity: 1, scale: 1,   y: 0  }}
                      exit={{ opacity: 0, scale: 0.9, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-10 z-20 py-1 rounded-xl
                                 min-w-[140px] overflow-hidden"
                      style={{
                        backgroundColor: "var(--surface)",
                        border:          "1px solid var(--glass-border-bright)",
                        boxShadow:       "0 8px 32px rgba(0,0,0,0.6)",
                      }}
                    >
                      {[
                        { icon: ClipboardList, label: "View Plan",
                          action: () => setMenuOpen(false),
                          disabled: !athlete.planId },
                        { icon: Brain, label: "Generate Plan",
                          action: () => { setMenuOpen(false); onGeneratePlan(athlete) } },
                        { icon: MessageSquare, label: "Chat",
                          action: () => setMenuOpen(false),
                          disabled: !athlete.planId },
                      ].map(({ icon: Icon, label, action, disabled }) => (
                        <button
                          key={label}
                          onClick={action}
                          disabled={disabled}
                          className="w-full flex items-center gap-2.5 px-3 py-2.5
                                     text-sm transition-colors hover:bg-white/5
                                     disabled:opacity-40 disabled:cursor-not-allowed"
                          style={{ color: "var(--text-muted)" }}
                        >
                          <Icon size={13} /> {label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mt-3">
              <span className="text-xs px-2 py-0.5 rounded-md font-medium capitalize"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      border:          "1px solid var(--glass-border)",
                      color:           "var(--text-muted)",
                    }}>
                {athlete.fitnessLevel || "beginner"}
              </span>
              {athlete.goals?.slice(0, 2).map((g) => (
                <span key={g}
                      className="text-xs px-2 py-0.5 rounded-md font-medium"
                      style={{
                        backgroundColor: "rgba(57,255,20,0.07)",
                        border:          "1px solid rgba(57,255,20,0.15)",
                        color:           "var(--green)",
                      }}>
                  {g}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Plan section */}
      <div className="p-5">
        {athlete.planId ? (
          <>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Dumbbell size={13} className="text-green" />
                <span className="text-xs font-semibold truncate max-w-[160px]"
                      style={{ color: "var(--text)" }}>
                  {athlete.planTitle}
                </span>
              </div>
              <StatusBadge status={athlete.planStatus} />
            </div>

            {/* Progress */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Plan progress
                </span>
                <span className="text-xs font-bold text-green">{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden"
                   style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ delay: delay * 0.05 + 0.5, duration: 0.9, ease: "easeOut" }}
                  className="h-full rounded-full"
                  style={{
                    background: "var(--green)",
                    boxShadow:  progress > 0 ? "0 0 8px rgba(57,255,20,0.5)" : "none",
                  }}
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <Link to={`/coach/plan/${athlete.planId}`}
                    className="flex-1 flex items-center justify-center gap-1.5
                               py-2 rounded-xl text-xs font-semibold transition-all
                               btn-glass">
                <ClipboardList size={13} /> View Plan
              </Link>
              <Link to={`/coach/chat/${athlete.planId}`}
                    className="flex-1 flex items-center justify-center gap-1.5
                               py-2 rounded-xl text-xs font-semibold transition-all
                               btn-glass">
                <MessageSquare size={13} /> Chat
              </Link>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <p className="text-xs" style={{ color: "var(--text-muted)" }}>
              No active plan yet
            </p>
            <button
              onClick={() => onGeneratePlan(athlete)}
              className="flex items-center gap-2 px-4 py-2 text-xs btn-green"
            >
              <Brain size={13} /> Generate AI Plan
            </button>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ── Main page ─────────────────────────────────────────────────
export default function CoachAthletes() {
  const { user }              = useAuthStore()
  const [athletes, setAthletes] = useState([])
  const [filtered, setFiltered] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [search,   setSearch]   = useState("")
  const [filter,   setFilter]   = useState("all")
  const [modal,    setModal]    = useState(null)  // athlete to generate plan for

  const fetchAthletes = async () => {
    setLoading(true)
    try {
      const { data: profiles } = await api.get(`/coach/${user.id}/athletes`)

      const enriched = await Promise.all(
        profiles.map(async (ap) => {
          try {
            const { data: plans } = await api.get(
              `/plan/athlete/${ap.userId._id}`
            )
            const active = plans.find((p) => p.status === "active") || plans[0]
            let progress = 0
            if (active) {
              const elapsed = Date.now() - new Date(active.startDate).getTime()
              const total   = new Date(active.endDate).getTime() -
                              new Date(active.startDate).getTime()
              progress = Math.min(100, Math.round((elapsed / total) * 100))
            }
            return {
              id:           ap.userId._id,
              name:         ap.userId.name,
              email:        ap.userId.email,
              fitnessLevel: ap.fitnessLevel,
              goals:        ap.goals,
              weaknesses:   ap.weaknesses,
              planId:       active?._id     || null,
              planTitle:    active?.title   || null,
              planStatus:   active?.status  || null,
              progress,
            }
          } catch {
            return {
              id:           ap.userId._id,
              name:         ap.userId.name,
              email:        ap.userId.email,
              fitnessLevel: ap.fitnessLevel,
              goals:        ap.goals || [],
              weaknesses:   ap.weaknesses || [],
              planId:       null,
              planTitle:    null,
              planStatus:   null,
              progress:     0,
            }
          }
        })
      )

      setAthletes(enriched)
      setFiltered(enriched)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAthletes() }, [user.id])

  // Search + filter
  useEffect(() => {
    let list = [...athletes]
    if (search)
      list = list.filter(
        (a) =>
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.email.toLowerCase().includes(search.toLowerCase())
      )
    if (filter === "active")   list = list.filter((a) => a.planStatus === "active")
    if (filter === "no-plan")  list = list.filter((a) => !a.planId)
    setFiltered(list)
  }, [search, filter, athletes])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-green-muted border border-green/30
                          flex items-center justify-center">
            <Users size={22} className="text-green animate-pulse" />
          </div>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Loading athletes...
          </p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-full p-6 lg:p-8"
           style={{ backgroundColor: "var(--bg)" }}>

        {/* Background blob */}
        <div className="fixed top-0 right-0 w-96 h-96 rounded-full
                        pointer-events-none -z-10"
             style={{
               background: "radial-gradient(circle, rgba(57,255,20,0.04) 0%, transparent 65%)",
               filter:     "blur(80px)",
             }} />

        {/* ── Header ── */}
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
                ATHLETE MANAGEMENT
              </span>
            </div>
            <h1 className="font-display font-900 uppercase leading-[0.9]"
                style={{
                  fontSize:      "clamp(1.8rem, 4vw, 2.8rem)",
                  color:         "var(--text)",
                  letterSpacing: "-0.01em",
                }}>
              YOUR ATHLETES
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {athletes.length} athletes · {athletes.filter((a) => a.planStatus === "active").length} active plans
            </p>
          </div>

          <button
            onClick={() => alert("Invite athlete by email — coming soon!")}
            className="flex items-center gap-2 px-5 py-2.5 text-sm btn-green
                       flex-shrink-0 self-start sm:self-auto"
          >
            <UserPlus size={16} /> Invite Athlete
          </button>
        </motion.div>

        {/* ── Search + Filter bar ── */}
        <motion.div
          custom={1} variants={fadeUp}
          initial="hidden" animate="visible"
          className="flex flex-col sm:flex-row gap-3 mb-8"
        >
          {/* Search */}
          <div className="relative flex-1">
            <Search size={15}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-green
                               pointer-events-none" />
            <input
              type="text"
              placeholder="Search athletes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-xl text-sm outline-none
                         transition-all placeholder:text-[var(--text-dim)]
                         focus:border-green/50
                         focus:shadow-[0_0_0_3px_rgba(57,255,20,0.08)]"
              style={{
                backgroundColor: "var(--glass-1)",
                border:          "1px solid var(--glass-border-bright)",
                color:           "var(--text)",
              }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2
                                 hover:text-green transition-colors"
                      style={{ color: "var(--text-muted)" }}>
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2 glass-card rounded-xl p-1.5">
            {[
              { key: "all",     label: "All",      count: athletes.length },
              { key: "active",  label: "Active",   count: athletes.filter((a) => a.planStatus === "active").length },
              { key: "no-plan", label: "No Plan",  count: athletes.filter((a) => !a.planId).length },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm
                           font-semibold transition-all duration-200"
                style={{
                  backgroundColor: filter === key ? "var(--green)" : "transparent",
                  color:           filter === key ? "#080808"      : "var(--text-muted)",
                  boxShadow:       filter === key
                    ? "0 0 12px rgba(57,255,20,0.3)" : "none",
                }}
              >
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-md font-bold
                                  ${filter === key
                                    ? "bg-black/20 text-black"
                                    : "bg-white/5 text-[var(--text-dim)]"}`}>
                  {count}
                </span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* ── Athletes grid ── */}
        {filtered.length === 0 ? (
          <motion.div
            custom={2} variants={fadeUp}
            initial="hidden" animate="visible"
            className="glass-card rounded-2xl p-16 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-green-muted border border-green/20
                            flex items-center justify-center mx-auto mb-4">
              <Users size={28} className="text-green" />
            </div>
            <p className="font-display font-700 text-xl uppercase mb-2"
               style={{ color: "var(--text)" }}>
              {search ? "No Results Found" : "No Athletes Yet"}
            </p>
            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
              {search
                ? `No athletes match "${search}"`
                : "Invite an athlete to get started."}
            </p>
          </motion.div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((a, i) => (
              <AthleteCard
                key={a.id}
                athlete={a}
                delay={i + 2}
                onGeneratePlan={(athlete) => setModal(athlete)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Generate Plan Modal ── */}
      <AnimatePresence>
        {modal && (
          <GeneratePlanModal
            athlete={modal}
            onClose={() => setModal(null)}
            onSuccess={fetchAthletes}
          />
        )}
      </AnimatePresence>
    </>
  )
}