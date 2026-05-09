import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Users, Search, Plus, ChevronRight,
  Dumbbell, Brain, TrendingUp, Clock,
  CheckCircle, UserPlus, Filter, X,
  Target, Activity, Calendar
} from "lucide-react"
import { useAuthStore } from "../../../store/authStore"
import api from "../../lib/axios"

const fadeUp = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] }
  },
}
const stagger = { visible: { transition: { staggerChildren: 0.07 } } }

// ── Athlete card ───────────────────────────────────────────────
function AthleteCard({ athlete, onGeneratePlan }) {
  const profile = athlete.userId ? athlete : { userId: athlete }
  const user    = profile.userId

  return (
    <motion.div
      variants={fadeUp}
      whileHover={{ y: -4 }}
      className="glass-card rounded-2xl border overflow-hidden
                 hover:border-green/25 transition-all duration-300 group"
      style={{ borderColor: "var(--glass-border)" }}
    >
      {/* Green top strip */}
      <div className="h-0.5 w-full"
           style={{
             background: "linear-gradient(90deg, var(--green), transparent)"
           }} />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-green-muted border border-green/25
                          flex items-center justify-center flex-shrink-0">
            <span className="font-display font-bold text-xl text-green">
              {(user?.name || "?")[0].toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-700 text-lg uppercase truncate"
               style={{ color: "var(--text)" }}>
              {user?.name || "Unknown"}
            </p>
            <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
              {user?.email}
            </p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-lg font-bold flex-shrink-0
                            ${athlete.fitnessLevel === "advanced"
                              ? "bg-red-500/10 text-red-400"
                              : athlete.fitnessLevel === "intermediate"
                                ? "bg-yellow-500/10 text-yellow-400"
                                : "bg-green-muted text-green"
                            }`}>
            {(athlete.fitnessLevel || "beginner").toUpperCase()}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {[
            { label: "Weight",  value: athlete.weight ? `${athlete.weight}kg` : "—" },
            { label: "Height",  value: athlete.height ? `${athlete.height}cm` : "—" },
            { label: "Goals",   value: `${athlete.goals?.length || 0}` },
          ].map(({ label, value }) => (
            <div key={label}
                 className="flex flex-col items-center gap-0.5 px-2 py-2 rounded-xl"
                 style={{ backgroundColor: "rgba(57,255,20,0.04)",
                          border: "1px solid rgba(57,255,20,0.08)" }}>
              <span className="font-display font-700 text-base text-green">
                {value}
              </span>
              <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Goals tags */}
        {athlete.goals?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {athlete.goals.slice(0, 3).map((g) => (
              <span key={g}
                    className="text-xs px-2 py-0.5 rounded-lg"
                    style={{
                      backgroundColor: "rgba(255,255,255,0.05)",
                      color:           "var(--text-muted)",
                    }}>
                {g}
              </span>
            ))}
            {athlete.goals.length > 3 && (
              <span className="text-xs px-2 py-0.5 rounded-lg"
                    style={{ color: "var(--text-dim)" }}>
                +{athlete.goals.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Competition date */}
        {athlete.competitionDate && (
          <div className="flex items-center gap-2 mb-4 text-xs"
               style={{ color: "var(--text-muted)" }}>
            <Calendar size={11} className="text-green" />
            Competition:{" "}
            {new Date(athlete.competitionDate).toLocaleDateString("en-IN", {
              day: "numeric", month: "short", year: "numeric"
            })}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onGeneratePlan(athlete)}
            className="flex-1 flex items-center justify-center gap-2
                       py-2.5 rounded-xl btn-green text-xs font-bold"
          >
            <Brain size={13} />
            Generate Plan
          </motion.button>
          <Link
            to={`/coach/chat/plan-${athlete._id}`}
            className="flex items-center justify-center px-3 py-2.5 rounded-xl
                       btn-glass text-xs"
          >
            <ChevronRight size={15} className="text-green" />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

// ── Unassigned athlete row ─────────────────────────────────────
function UnassignedRow({ athlete, onAssign, assigning }) {
  const user = athlete.userId
  return (
    <motion.div
      variants={fadeUp}
      className="flex items-center gap-4 px-5 py-4 rounded-2xl glass-card
                 border hover:border-green/20 transition-all"
      style={{ borderColor: "var(--glass-border)" }}
    >
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10
                      flex items-center justify-center flex-shrink-0">
        <span className="font-display font-bold text-base"
              style={{ color: "var(--text-muted)" }}>
          {(user?.name || "?")[0].toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate"
           style={{ color: "var(--text)" }}>
          {user?.name}
        </p>
        <p className="text-xs truncate" style={{ color: "var(--text-muted)" }}>
          {user?.email} · {athlete.fitnessLevel || "beginner"}
        </p>
      </div>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => onAssign(athlete._id)}
        disabled={assigning === athlete._id}
        className="flex items-center gap-2 px-4 py-2 rounded-xl btn-green
                   text-xs font-bold flex-shrink-0 disabled:opacity-50"
      >
        {assigning === athlete._id ? (
          <div className="w-3 h-3 rounded-full border-2 border-black
                          border-t-transparent animate-spin" />
        ) : (
          <UserPlus size={13} />
        )}
        Add to Roster
      </motion.button>
    </motion.div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function CoachAthletes() {
  const { user }                        = useAuthStore()
  const [roster,     setRoster]         = useState([])
  const [unassigned, setUnassigned]     = useState([])
  const [loading,    setLoading]        = useState(true)
  const [tab,        setTab]            = useState("roster")
  const [search,     setSearch]         = useState("")
  const [assigning,  setAssigning]      = useState(null)
  const [showPlanModal, setShowPlanModal] = useState(false)
  const [selectedAthlete, setSelectedAthlete] = useState(null)

  // Fetch roster
  const fetchRoster = async () => {
    try {
      const res = await api.get(`/coach/${user.id}/athletes`)
      setRoster(res.data)
    } catch { setRoster([]) }
  }

  // Fetch unassigned athletes
  const fetchUnassigned = async () => {
    try {
      const res = await api.get("/athlete/unassigned");
      setUnassigned(res.data.athletes);
      console.log(res.data.athletes);
    } catch { setUnassigned([]) }
  }

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      await Promise.all([fetchRoster(), fetchUnassigned()])
      setLoading(false)
    }
    load()
  }, [])

  const handleAssign = async (athleteId) => {
    setAssigning(athleteId)
    console.log(user.id);
    try {
      await api.patch(`/athlete/${athleteId}`, {
        assignedCoachId: user.id
      })
      await Promise.all([fetchRoster(), fetchUnassigned()]);
      console.log("Athlete Added");
    } catch { }
    finally { setAssigning(null) }
  }

  const handleGeneratePlan = (athlete) => {
    setSelectedAthlete(athlete)
    setShowPlanModal(true)
  }

  const filteredRoster = roster.filter((a) =>
    (a.userId?.name || "").toLowerCase().includes(search.toLowerCase())
  )

  const filteredUnassigned = unassigned.filter((a) =>
    (a.userId?.name || "").toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="h-full flex items-center justify-center"
         style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-green
                        border-t-transparent animate-spin" />
        <p className="text-sm text-green">Loading athletes...</p>
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
        <p className="text-xs text-green font-semibold tracking-widest mb-1">
          ATHLETE MANAGEMENT
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display font-900 text-4xl sm:text-5xl uppercase
                           tracking-tight"
                style={{ color: "var(--text)" }}>
              Athletes
            </h1>
            <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
              {roster.length} in roster · {unassigned.length} waiting
            </p>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={14}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search athletes..."
              className="pl-9 pr-4 py-2.5 rounded-xl text-sm glass-card border
                         outline-none transition-all focus:border-green/50
                         w-56 placeholder-gray-600"
              style={{ borderColor: "var(--glass-border)",
                       color: "var(--text)" }}
            />
          </div>
        </div>
      </motion.div>

      {/* ── Stats row ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8"
      >
        {[
          { icon: Users,    label: "In Roster",    value: roster.length,     color: "var(--green)" },
          { icon: Clock,    label: "Awaiting",     value: unassigned.length, color: "#FFC800"      },
          { icon: Brain,    label: "Active Plans", value: roster.length,     color: "var(--green)" },
          { icon: Activity, label: "This Week",    value: "—",               color: "#3B82F6"      },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label}
               className="glass-card rounded-2xl p-4 border hover:border-green/20
                          transition-all"
               style={{ borderColor: "var(--glass-border)" }}>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3"
                 style={{ backgroundColor: `${color}15` }}>
              <Icon size={16} style={{ color }} />
            </div>
            <p className="font-display font-900 text-3xl"
               style={{ color }}>
              {value}
            </p>
            <p className="text-xs mt-0.5" style={{ color: "var(--text-muted)" }}>
              {label}
            </p>
          </div>
        ))}
      </motion.div>

      {/* ── Tabs ───────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6">
        {[
          { id: "roster",     label: `My Roster (${roster.length})` },
          { id: "unassigned", label: `Add Athletes (${unassigned.length})` },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 rounded-xl text-sm font-semibold
                        transition-all duration-200
                        ${tab === t.id ? "btn-green" : "btn-glass"}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Roster tab ─────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {tab === "roster" && (
          <motion.div
            key="roster"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {filteredRoster.length === 0 ? (
              <motion.div
                variants={fadeUp}
                className="text-center py-20"
              >
                <div className="w-16 h-16 rounded-2xl bg-green-muted border
                                border-green/20 flex items-center justify-center
                                mx-auto mb-4">
                  <Users size={28} className="text-green" />
                </div>
                <p className="font-display font-700 text-xl uppercase mb-2"
                   style={{ color: "var(--text)" }}>
                  No Athletes Yet
                </p>
                <p className="text-sm mb-6"
                   style={{ color: "var(--text-muted)" }}>
                  Switch to "Add Athletes" tab to onboard your first athlete
                </p>
                <button
                  onClick={() => setTab("unassigned")}
                  className="px-6 py-3 rounded-xl btn-green text-sm flex
                             items-center gap-2 mx-auto"
                >
                  <UserPlus size={15} /> Add Athletes
                </button>
              </motion.div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredRoster.map((athlete) => (
                  <AthleteCard
                    key={athlete._id}
                    athlete={athlete}
                    onGeneratePlan={handleGeneratePlan}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* ── Unassigned tab ───────────────────────────────── */}
        {tab === "unassigned" && (
          <motion.div
            key="unassigned"
            variants={stagger}
            initial="hidden"
            animate="visible"
          >
            {filteredUnassigned.length === 0 ? (
              <motion.div variants={fadeUp}
                          className="text-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-green-muted border
                                border-green/20 flex items-center justify-center
                                mx-auto mb-4">
                  <CheckCircle size={28} className="text-green" />
                </div>
                <p className="font-display font-700 text-xl uppercase mb-2"
                   style={{ color: "var(--text)" }}>
                  All Athletes Assigned
                </p>
                <p className="text-sm"
                   style={{ color: "var(--text-muted)" }}>
                  No athletes waiting for a coach right now
                </p>
              </motion.div>
            ) : (
              <div className="flex flex-col gap-3 max-w-2xl">
                <motion.p variants={fadeUp}
                          className="text-xs font-semibold tracking-widest"
                          style={{ color: "var(--text-muted)" }}>
                  ATHLETES WITHOUT A COACH — {filteredUnassigned.length} available
                </motion.p>
                {filteredUnassigned.map((athlete) => (
                  <UnassignedRow
                    key={athlete._id}
                    athlete={athlete}
                    onAssign={handleAssign}
                    assigning={assigning}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Plan Modal ─────────────────────────────────────── */}
      <AnimatePresence>
        {showPlanModal && selectedAthlete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4"
            style={{ backgroundColor: "rgba(0,0,0,0.8)",
                     backdropFilter: "blur(12px)" }}
            onClick={() => setShowPlanModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1,   opacity: 1, y: 0  }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md glass-card-bright rounded-2xl border p-6"
              style={{ borderColor: "var(--glass-border-bright)" }}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-xs text-green font-semibold tracking-widest mb-1">
                    GENERATE PLAN FOR
                  </p>
                  <p className="font-display font-700 text-2xl uppercase"
                     style={{ color: "var(--text)" }}>
                    {selectedAthlete.userId?.name}
                  </p>
                </div>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="w-9 h-9 rounded-xl glass-card flex items-center
                             justify-center hover:border-green/40 transition-all"
                  style={{ color: "var(--text-muted)" }}
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex items-center gap-3 px-4 py-3 rounded-xl mb-5"
                   style={{ backgroundColor: "rgba(57,255,20,0.05)",
                            border: "1px solid rgba(57,255,20,0.15)" }}>
                <Brain size={14} className="text-green flex-shrink-0" />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  AI will use this athlete's profile — fitness level,
                  goals, and weaknesses — to build the program.
                </p>
              </div>

             <div className="flex flex-col gap-2">
               <Link
                to={`/coach/plan/${selectedAthlete._id}`}
                onClick={() => setShowPlanModal(false)}
                className="w-full flex items-center justify-center gap-2
                           py-3.5 rounded-xl btn-green text-sm font-bold"
              >
                <Brain size={15} />
                Open Plan Builder
                <ChevronRight size={15} />
              </Link>
              <Link
                to={`/coach/plan/${selectedAthlete._id}/plans`}
                onClick={() => setShowPlanModal(false)}
                className="w-full flex items-center justify-center gap-2
                           py-3.5 rounded-xl btn-green text-sm font-bold"
              >
                <Activity size={15} />
                  Open Exiting Plans
                <ChevronRight size={15} />
              </Link>
             </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}