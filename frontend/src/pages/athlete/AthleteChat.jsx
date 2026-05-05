import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Brain, CheckCheck, Paperclip,
  Dumbbell, TrendingUp, Calendar, ChevronRight,
  Zap, Activity, Target, Info, X,
  Mic, Smile, MoreVertical, Phone
} from "lucide-react"
import { useAuthStore } from "../../../store/authStore"

// ── Mock data ──────────────────────────────────────────────────
const MOCK_COACH = {
  name:   "Coach Priya",
  role:   "coach",
  online: true,
  plan:   "Strength Block · Week 8 of 12",
}

const MOCK_MESSAGES = [
  {
    id: 1,
    content: "Good morning Rahul! How are you feeling going into today's push session?",
    role:    "coach",
    time:    "09:00",
    read:    true,
  },
  {
    id: 2,
    content: "Feeling strong coach! Slept well. Ready to hit that bench PR.",
    role:    "athlete",
    time:    "09:15",
    read:    true,
  },
  {
    id: 3,
    content: "Perfect. Remember — controlled descent on bench, 2 seconds down. Don't rush the eccentric. Aim for 85kg today.",
    role:    "coach",
    time:    "09:17",
    read:    true,
  },
  {
    id: 4,
    content: "Got it. Should I warm up with 60% then 75% before working sets?",
    role:    "athlete",
    time:    "09:20",
    read:    true,
  },
  {
    id: 5,
    content: "Exactly. 60% × 5, 75% × 3, then straight into your working sets. Don't fatigue yourself in warmups.",
    role:    "coach",
    time:    "09:22",
    read:    true,
  },
  {
    id: 6,
    content: "Coach my knee is feeling a bit sore after squats yesterday. Should I still do the leg accessory work today?",
    role:    "athlete",
    time:    "10:45",
    read:    true,
  },
  {
    id: 7,
    content: "Skip the heavy leg press today. Replace with leg extensions at light weight — 3×15. Focus on the pump not the load. Ice the knee post-session for 15 mins.",
    role:    "coach",
    time:    "10:52",
    read:    true,
  },
  {
    id: 8,
    content: "Bench felt great today! Hit 85kg for 4 sets of 8! 🔥",
    role:    "athlete",
    time:    "13:30",
    read:    true,
  },
]

const PLAN_CONTEXT = {
  currentWeek:    8,
  totalWeeks:     12,
  blockName:      "Strength Block",
  progress:       65,
  todaySession:   "Push Day — Bench · OHP · Triceps",
  nextSession:    "Pull Day — Deadlift · Rows · Curls",
  weeklyTarget:   "16 sets chest · 18 sets back · 20 sets legs",
  anomalyStatus:  null,
}

const QUICK_REPLIES = [
  "Feeling strong today 💪",
  "My knee is a bit sore",
  "What should I eat post-workout?",
  "Can I swap an exercise?",
  "Session completed ✅",
]

// ── Message bubble ─────────────────────────────────────────────
function MessageBubble({ msg, isLatest }) {
  const isAthlete = msg.role === "athlete"

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-end gap-2.5
                  ${isAthlete ? "justify-end" : "justify-start"}`}
    >
      {/* Coach avatar */}
      {!isAthlete && (
        <div className="w-8 h-8 rounded-xl bg-green-muted border border-green/30
                        flex items-center justify-center flex-shrink-0 mb-1">
          <span className="text-xs font-bold text-green">P</span>
        </div>
      )}

      <div className={`flex flex-col gap-1
                       ${isAthlete ? "items-end" : "items-start"}`}
           style={{ maxWidth: "min(75%, 480px)" }}>

        {/* Bubble */}
        <div className={`px-4 py-3 text-sm leading-relaxed
          ${isAthlete
            ? "bg-green text-black font-medium rounded-2xl rounded-br-sm"
            : "glass-card-bright text-[var(--text)] rounded-2xl rounded-bl-sm border"
          }`}
             style={isAthlete
               ? { boxShadow: "0 0 24px rgba(57,255,20,0.28)" }
               : { borderColor: "var(--glass-border-bright)" }
             }>
          {msg.content}
        </div>

        {/* Time + read */}
        <div className={`flex items-center gap-1.5 px-1
                         ${isAthlete ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {msg.time}
          </span>
          {isAthlete && (
            <CheckCheck
              size={13}
              style={{ color: msg.read ? "var(--green)" : "var(--text-dim)" }}
            />
          )}
        </div>
      </div>

      {/* Athlete avatar */}
      {isAthlete && (
        <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10
                        flex items-center justify-center flex-shrink-0 mb-1">
          <span className="text-xs font-bold" style={{ color: "var(--text)" }}>R</span>
        </div>
      )}
    </motion.div>
  )
}

// ── Typing indicator ───────────────────────────────────────────
function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-2.5"
    >
      <div className="w-8 h-8 rounded-xl bg-green-muted border border-green/30
                      flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-green">P</span>
      </div>
      <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm glass-card-bright
                      border flex items-center gap-1.5"
           style={{ borderColor: "var(--glass-border-bright)" }}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
            transition={{
              duration:   0.7,
              repeat:     Infinity,
              delay:      i * 0.15,
              ease:       "easeInOut",
            }}
            className="w-1.5 h-1.5 rounded-full bg-green"
          />
        ))}
      </div>
    </motion.div>
  )
}

// ── Date separator ─────────────────────────────────────────────
function DateSep({ label }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--glass-border)" }} />
      <span className="text-xs px-3 py-1 rounded-full glass-card"
            style={{ color: "var(--text-muted)" }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ backgroundColor: "var(--glass-border)" }} />
    </div>
  )
}

// ── Plan context panel ─────────────────────────────────────────
function PlanPanel({ onClose }) {
  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0,       opacity: 1 }}
      exit={{ x: "100%",     opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-0 top-0 bottom-0 w-72 border-l flex flex-col z-30"
      style={{
        backgroundColor: "var(--bg-alt)",
        borderColor:     "var(--glass-border)",
      }}
    >
      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-4 border-b"
           style={{ borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-green" />
          <span className="text-xs font-semibold tracking-widest text-green">
            ACTIVE PLAN
          </span>
        </div>
        <button
          onClick={onClose}
          className="w-7 h-7 rounded-lg flex items-center justify-center
                     hover:bg-white/5 transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">

        {/* Block + week */}
        <div>
          <p className="font-display font-700 text-xl uppercase text-green mb-1">
            {PLAN_CONTEXT.blockName}
          </p>
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            Week {PLAN_CONTEXT.currentWeek} of {PLAN_CONTEXT.totalWeeks}
          </p>

          {/* Progress bar */}
          <div className="mt-3 h-1.5 rounded-full overflow-hidden"
               style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${PLAN_CONTEXT.progress}%` }}
              transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
              className="h-full rounded-full bg-green"
              style={{ boxShadow: "0 0 8px rgba(57,255,20,0.5)" }}
            />
          </div>
          <p className="text-xs mt-1.5 text-green font-semibold">
            {PLAN_CONTEXT.progress}% complete
          </p>
        </div>

        {/* Today + tomorrow */}
        <div className="flex flex-col gap-2.5">
          <div className="px-3 py-3 rounded-xl"
               style={{
                 backgroundColor: "rgba(57,255,20,0.06)",
                 border:          "1px solid rgba(57,255,20,0.15)",
               }}>
            <p className="text-xs text-green font-semibold mb-1">TODAY</p>
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
              {PLAN_CONTEXT.todaySession}
            </p>
          </div>
          <div className="px-3 py-3 rounded-xl glass-card">
            <p className="text-xs font-semibold mb-1"
               style={{ color: "var(--text-muted)" }}>
              NEXT SESSION
            </p>
            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
              {PLAN_CONTEXT.nextSession}
            </p>
          </div>
        </div>

        {/* Weekly targets */}
        <div>
          <p className="text-xs font-semibold tracking-widest mb-3"
             style={{ color: "var(--text-muted)" }}>
            WEEKLY TARGETS
          </p>
          {[
            { muscle: "Chest",  sets: 16, done: 16 },
            { muscle: "Back",   sets: 18, done: 14 },
            { muscle: "Legs",   sets: 20, done: 10 },
            { muscle: "Shoulders", sets: 12, done: 12 },
            { muscle: "Arms",   sets: 10, done: 8  },
          ].map(({ muscle, sets, done }) => {
            const pct = Math.round((done / sets) * 100)
            return (
              <div key={muscle} className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs" style={{ color: "var(--text-muted)" }}>
                    {muscle}
                  </span>
                  <span className="text-xs font-semibold"
                        style={{ color: pct >= 100
                          ? "var(--green)"
                          : "var(--text-muted)" }}>
                    {done}/{sets} sets
                  </span>
                </div>
                <div className="h-1 rounded-full overflow-hidden"
                     style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width:           `${Math.min(pct, 100)}%`,
                      backgroundColor: pct >= 100
                        ? "var(--green)"
                        : "rgba(57,255,20,0.4)",
                      boxShadow:       pct >= 100
                        ? "0 0 6px rgba(57,255,20,0.5)"
                        : "none",
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* AI status */}
        <div className="px-3 py-3 rounded-xl"
             style={{
               backgroundColor: "rgba(57,255,20,0.04)",
               border:          "1px solid rgba(57,255,20,0.12)",
             }}>
          <div className="flex items-center gap-2 mb-2">
            <Brain size={13} className="text-green" />
            <span className="text-xs font-semibold text-green tracking-widest">
              AI STATUS
            </span>
          </div>
          <p className="text-xs leading-relaxed"
             style={{ color: "var(--text-muted)" }}>
            No anomalies detected this week. Progression on track. Deload week scheduled next.
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function AthleteChat() {
  const { planId }                = useParams()
  const { user }                  = useAuthStore()
  const [messages, setMessages]   = useState(MOCK_MESSAGES)
  const [input, setInput]         = useState("")
  const [typing, setTyping]       = useState(false)
  const [showPlan, setShowPlan]   = useState(false)
  const [showQuick, setShowQuick] = useState(false)
  const bottomRef                 = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  const sendMessage = (text) => {
    const content = text || input.trim()
    if (!content) return

    const msg = {
      id:      Date.now(),
      content,
      role:    "athlete",
      time:    new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit"
      }),
      read: false,
    }

    setMessages((prev) => [...prev, msg])
    setInput("")
    setShowQuick(false)

    // Simulate coach typing → reply
    setTimeout(() => setTyping(true), 600)
    setTimeout(() => {
      setTyping(false)
      setMessages((prev) => [
        ...prev,
        {
          id:      Date.now() + 1,
          content: "Got it! I'll review and get back to you shortly. Keep it up 💪",
          role:    "coach",
          time:    new Date().toLocaleTimeString("en-IN", {
            hour: "2-digit", minute: "2-digit"
          }),
          read: false,
        },
      ])
    }, 2800)
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="h-full flex flex-col relative overflow-hidden"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Background glow ──────────────────────────────────── */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full pointer-events-none"
           style={{
             background: "radial-gradient(circle, rgba(57,255,20,0.04) 0%, transparent 70%)",
             filter:     "blur(60px)",
           }} />

      {/* ── Chat header ──────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 sm:px-6 py-4 border-b
                   flex-shrink-0 relative z-10"
        style={{
          borderColor:     "var(--glass-border)",
          backgroundColor: "var(--bg-alt)",
        }}
      >
        {/* Coach info */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-green-muted border border-green/30
                            flex items-center justify-center">
              <span className="font-display font-bold text-lg text-green">P</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5
                            rounded-full bg-green border-2"
                 style={{ borderColor: "var(--bg-alt)" }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                {MOCK_COACH.name}
              </p>
              <span className="text-xs px-2 py-0.5 rounded-md bg-green-muted
                               text-green font-semibold">
                COACH
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green pulse-green" />
              <p className="text-xs text-green">
                Online · {MOCK_COACH.plan}
              </p>
            </div>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPlan(!showPlan)}
            className={`hidden sm:flex items-center gap-2 px-3 py-2 text-xs
                        font-semibold rounded-xl transition-all duration-200
                        ${showPlan
                          ? "btn-green"
                          : "btn-glass"
                        }`}
          >
            <Target size={13} />
            My Plan
          </motion.button>

          <button
            className="w-9 h-9 rounded-xl glass-card flex items-center
                       justify-center hover:border-green/40 transition-all"
            style={{ color: "var(--text-muted)" }}
          >
            <MoreVertical size={16} />
          </button>
        </div>
      </motion.div>

      {/* ── Body: messages + optional plan panel ─────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6
                        flex flex-col gap-3 relative"
             style={{ paddingRight: showPlan ? "1.5rem" : undefined }}>

          {/* Week banner */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-2 px-4 py-2.5 rounded-2xl glass-card
                       flex items-center gap-3"
            style={{ border: "1px solid rgba(57,255,20,0.12)" }}
          >
            <div className="w-7 h-7 rounded-lg bg-green-muted flex items-center
                            justify-center flex-shrink-0">
              <Calendar size={13} className="text-green" />
            </div>
            <div>
              <p className="text-xs font-semibold text-green">
                STRENGTH BLOCK — WEEK 8
              </p>
              <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                Today: Push Day · Bench · OHP · Triceps
              </p>
            </div>
            <div className="ml-auto flex items-center gap-1 text-xs text-green
                            font-semibold">
              65% <TrendingUp size={12} />
            </div>
          </motion.div>

          <DateSep label="Today" />

          {/* Messages */}
          {messages.map((msg, i) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              isLatest={i === messages.length - 1}
            />
          ))}

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && <TypingIndicator />}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Plan panel — desktop slide-in */}
        <AnimatePresence>
          {showPlan && (
            <div className="hidden sm:block relative w-72 flex-shrink-0">
              <PlanPanel onClose={() => setShowPlan(false)} />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Mobile plan panel — bottom sheet ─────────────────── */}
      <AnimatePresence>
        {showPlan && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="sm:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-3xl
                       border-t overflow-hidden"
            style={{
              maxHeight:       "70vh",
              backgroundColor: "var(--bg-alt)",
              borderColor:     "var(--glass-border)",
            }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full"
                   style={{ backgroundColor: "var(--glass-border-bright)" }} />
            </div>
            <PlanPanel onClose={() => setShowPlan(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Quick replies ─────────────────────────────────────── */}
      <AnimatePresence>
        {showQuick && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.22 }}
            className="flex-shrink-0 px-4 sm:px-6 pb-2 flex flex-wrap gap-2"
          >
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply}
                onClick={() => sendMessage(reply)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
                           text-xs font-medium glass-card border
                           hover:border-green/40 hover:text-green
                           transition-all duration-200"
                style={{
                  borderColor: "var(--glass-border)",
                  color:       "var(--text-muted)",
                }}
              >
                {reply}
                <ChevronRight size={11} className="text-green" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Input bar ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-shrink-0 px-4 sm:px-6 py-4 border-t"
        style={{
          borderColor:     "var(--glass-border)",
          backgroundColor: "var(--bg-alt)",
        }}
      >
        <div className="flex items-end gap-3">

          {/* Quick reply toggle */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowQuick(!showQuick)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center
                        flex-shrink-0 transition-all duration-200
                        ${showQuick
                          ? "bg-green text-black"
                          : "glass-card hover:border-green/40"
                        }`}
            style={showQuick ? {} : { color: "var(--text-muted)" }}
          >
            <Zap size={16} />
          </motion.button>

          {/* Text input */}
          <div className="flex-1 flex items-end gap-2 px-4 py-3 rounded-2xl
                          glass-card border focus-within:border-green/40
                          transition-all duration-200 min-h-[46px]"
               style={{ borderColor: "var(--glass-border)" }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Message Coach Priya..."
              rows={1}
              className="flex-1 bg-transparent outline-none text-sm resize-none
                         max-h-28 leading-relaxed placeholder-gray-600"
              style={{ color: "var(--text)" }}
            />
            <div className="flex items-center gap-1 flex-shrink-0">
              <button className="p-1 hover:text-green transition-colors"
                      style={{ color: "var(--text-muted)" }}>
                <Paperclip size={15} />
              </button>
            </div>
          </div>

          {/* Plan button — mobile */}
          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.92 }}
            onClick={() => setShowPlan(!showPlan)}
            className="sm:hidden w-10 h-10 rounded-xl flex items-center
                       justify-center flex-shrink-0 glass-card
                       hover:border-green/40 transition-all"
            style={{ color: "var(--text-muted)" }}
          >
            <Target size={16} />
          </motion.button>

          {/* Send */}
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => sendMessage()}
            disabled={!input.trim()}
            className="w-10 h-10 rounded-xl flex items-center justify-center
                       flex-shrink-0 btn-green disabled:opacity-40
                       disabled:cursor-not-allowed"
          >
            <Send size={16} />
          </motion.button>
        </div>

        {/* Shortcut hint */}
        <p className="text-xs mt-2.5 text-center"
           style={{ color: "var(--text-dim)" }}>
          <kbd className="px-1.5 py-0.5 rounded-md glass-card text-green text-xs
                          border" style={{ borderColor: "var(--glass-border)" }}>
            Enter
          </kbd>{" "}
          to send ·{" "}
          <kbd className="px-1.5 py-0.5 rounded-md glass-card text-green text-xs
                          border" style={{ borderColor: "var(--glass-border)" }}>
            ⚡
          </kbd>{" "}
          for quick replies ·{" "}
          <kbd className="px-1.5 py-0.5 rounded-md glass-card text-green text-xs
                          border" style={{ borderColor: "var(--glass-border)" }}>
            Plan
          </kbd>{" "}
          to see your week
        </p>
      </motion.div>
    </div>
  )
}