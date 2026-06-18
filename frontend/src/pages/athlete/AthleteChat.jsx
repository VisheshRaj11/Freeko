import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Brain, CheckCheck, Paperclip,
  TrendingUp, Calendar, ChevronRight,
  Zap, Target, X, MoreVertical
} from "lucide-react"
import { useAuthStore } from "../../../store/authStore"
import { io } from "socket.io-client"
import api from "../../lib/axios"

const QUICK_REPLIES = [
  "Feeling strong today 💪",
  "My knee is a bit sore",
  "What should I eat post-workout?",
  "Can I swap an exercise?",
  "Session completed ✅",
]

// ── Message bubble ─────────────────────────────────────────────
function MessageBubble({ msg, currentUserId }) {
  const isMe = msg.senderId?._id === currentUserId ||
               msg.senderId === currentUserId

  const time = msg.sentAt || msg.createdAt
    ? new Date(msg.sentAt || msg.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit"
      })
    : msg.time || ""

  const senderName = msg.senderId?.name || "Coach"
  const initial    = senderName[0]?.toUpperCase()

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className={`flex items-end gap-2.5
                  ${isMe ? "justify-end" : "justify-start"}`}
    >
      {/* Other person avatar */}
      {!isMe && (
        <div className="w-8 h-8 rounded-xl bg-green-muted border border-green/30
                        flex items-center justify-center flex-shrink-0 mb-1">
          <span className="text-xs font-bold text-green">{initial}</span>
        </div>
      )}

      <div className={`flex flex-col gap-1
                       ${isMe ? "items-end" : "items-start"}`}
           style={{ maxWidth: "min(75%, 480px)" }}>
        <div className={`px-4 py-3 text-sm leading-relaxed
          ${isMe
            ? "bg-green text-black font-medium rounded-2xl rounded-br-sm"
            : "glass-card text-[var(--text)] rounded-2xl rounded-bl-sm border"
          }`}
             style={isMe
               ? { boxShadow: "0 0 24px rgba(57,255,20,0.28)" }
               : { borderColor: "var(--glass-border-bright)" }
             }>
          {msg.content}
        </div>

        <div className={`flex items-center gap-1.5 px-1
                         ${isMe ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {time}
          </span>
          {isMe && (
            <CheckCheck
              size={13}
              style={{ color: msg.readAt ? "var(--green)" : "var(--text-dim)" }}
            />
          )}
        </div>
      </div>

      {/* My avatar */}
      {isMe && (
        <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/10
                        flex items-center justify-center flex-shrink-0 mb-1">
          <span className="text-xs font-bold" style={{ color: "var(--text)" }}>
            Me
          </span>
        </div>
      )}
    </motion.div>
  )
}

// ── Typing indicator ───────────────────────────────────────────
function TypingIndicator({ name }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="flex items-end gap-2.5"
    >
      <div className="w-8 h-8 rounded-xl bg-green-muted border border-green/30
                      flex items-center justify-center flex-shrink-0">
        <span className="text-xs font-bold text-green">
          {name?.[0]?.toUpperCase() || "C"}
        </span>
      </div>
      <div className="px-4 py-3.5 rounded-2xl rounded-bl-sm glass-card border
                      flex flex-col gap-1"
           style={{ borderColor: "var(--glass-border-bright)" }}>
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.7, repeat: Infinity,
                            delay: i * 0.15, ease: "easeInOut" }}
              className="w-1.5 h-1.5 rounded-full bg-green"
            />
          ))}
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {name} is typing...
        </span>
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

// ── Plan panel ─────────────────────────────────────────────────
function PlanPanel({ plan, sessions, onClose }) {
  const masterPlan = plan?.plan
  const mesocycles = plan?.mesocycles || []

  const currentWeek = masterPlan
    ? Math.min(
        Math.ceil(
          (Date.now() - new Date(masterPlan.startDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
        ),
        masterPlan.totalWeeks
      )
    : 0

  const progress = masterPlan
    ? Math.min(
        Math.round(
          ((Date.now() - new Date(masterPlan.startDate).getTime()) /
            (new Date(masterPlan.endDate).getTime() -
              new Date(masterPlan.startDate).getTime())) * 100
        ),
        100
      )
    : 0

  const currentMeso = mesocycles.find(
    (m) => currentWeek >= m.weekStart && currentWeek <= m.weekEnd
  )

  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" })
  const todaySess = sessions.find(
    (s) => s.status === "planned" &&
           s.dayLabel?.toLowerCase().includes(todayName.toLowerCase())
  )

  // Volume targets from current week microcycle
  const volumeTargets = mesocycles
    .flatMap((m) => m.microcycles || [])
    .find((micro) => micro.weekNumber === currentWeek)
    ?.volumeTargets || {}

  // Actual sets done this week per muscle
  const weekStart = new Date()
  weekStart.setDate(weekStart.getDate() - weekStart.getDay())
  const musclesDone = { chest: 0, back: 0, legs: 0, shoulders: 0, arms: 0 }

  sessions
    .filter((s) => {
      const d = new Date(s.loggedAt)
      return s.status === "completed" && d >= weekStart
    })
    .forEach((s) => {
      s.exercises?.forEach((ex) => {
        const name = ex.name.toLowerCase()
        if (name.includes("bench") || name.includes("chest"))
          musclesDone.chest += ex.sets || 0
        else if (name.includes("row") || name.includes("pull") || name.includes("deadlift"))
          musclesDone.back += ex.sets || 0
        else if (name.includes("squat") || name.includes("leg"))
          musclesDone.legs += ex.sets || 0
        else if (name.includes("shoulder") || name.includes("ohp"))
          musclesDone.shoulders += ex.sets || 0
        else if (name.includes("curl") || name.includes("tricep"))
          musclesDone.arms += ex.sets || 0
      })
    })

  return (
    <motion.div
      initial={{ x: "100%", opacity: 0 }}
      animate={{ x: 0,       opacity: 1 }}
      exit={{ x: "100%",     opacity: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="absolute right-0 top-0 bottom-0 w-72 border-l flex flex-col z-30"
      style={{ backgroundColor: "var(--bg-alt)",
               borderColor:     "var(--glass-border)" }}
    >
      <div className="flex items-center justify-between px-4 py-4 border-b"
           style={{ borderColor: "var(--glass-border)" }}>
        <div className="flex items-center gap-2">
          <Zap size={14} className="text-green" />
          <span className="text-xs font-semibold tracking-widest text-green">
            ACTIVE PLAN
          </span>
        </div>
        <button onClick={onClose}
                className="w-7 h-7 rounded-lg flex items-center justify-center
                           hover:bg-white/5 transition-colors"
                style={{ color: "var(--text-muted)" }}>
          <X size={15} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-5">

        {/* Block + progress */}
        {masterPlan ? (
          <div>
            <p className="font-display font-700 text-xl uppercase text-green mb-1">
              {currentMeso?.name || masterPlan.title}
            </p>
            <p className="text-sm mb-3" style={{ color: "var(--text-muted)" }}>
              Week {currentWeek} of {masterPlan.totalWeeks}
            </p>
            <div className="h-1.5 rounded-full overflow-hidden"
                 style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="h-full rounded-full bg-green"
                style={{ boxShadow: "0 0 8px rgba(57,255,20,0.5)" }}
              />
            </div>
            <p className="text-xs mt-1.5 text-green font-semibold">
              {progress}% complete
            </p>
          </div>
        ) : (
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No active plan yet
          </p>
        )}

        {/* Today's session */}
        {todaySess && (
          <div className="px-3 py-3 rounded-xl"
               style={{ backgroundColor: "rgba(57,255,20,0.06)",
                        border: "1px solid rgba(57,255,20,0.15)" }}>
            <p className="text-xs text-green font-semibold mb-1">TODAY</p>
            <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
              {todaySess.dayLabel}
            </p>
          </div>
        )}

        {/* Weekly volume targets */}
        {Object.keys(volumeTargets).length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-widest mb-3"
               style={{ color: "var(--text-muted)" }}>
              WEEKLY TARGETS
            </p>
            {Object.entries(volumeTargets).map(([muscle, target]) => {
              const done = musclesDone[muscle] || 0
              const pct  = Math.min(Math.round((done / target) * 100), 100)
              const hit  = pct >= 100
              return (
                <div key={muscle} className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs capitalize"
                          style={{ color: "var(--text-muted)" }}>
                      {muscle}
                    </span>
                    <span className="text-xs font-semibold"
                          style={{ color: hit ? "var(--green)" : "var(--text-muted)" }}>
                      {done}/{target}
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden"
                       style={{ backgroundColor: "rgba(255,255,255,0.06)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                         style={{
                           width:           `${pct}%`,
                           backgroundColor: hit ? "var(--green)" : "rgba(57,255,20,0.4)",
                           boxShadow:       hit ? "0 0 6px rgba(57,255,20,0.5)" : "none",
                         }} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* AI status */}
        <div className="px-3 py-3 rounded-xl"
             style={{ backgroundColor: "rgba(57,255,20,0.04)",
                      border: "1px solid rgba(57,255,20,0.12)" }}>
          <div className="flex items-center gap-2 mb-2">
            <Brain size={13} className="text-green" />
            <span className="text-xs font-semibold text-green tracking-widest">
              AI STATUS
            </span>
          </div>
          <p className="text-xs leading-relaxed"
             style={{ color: "var(--text-muted)" }}>
            {currentMeso
              ? `${currentMeso.name} active. ${
                  currentMeso.intensityLevel === "low"
                    ? "Deload week — keep it light."
                    : "Keep progression on track."
                }`
              : "Gemini AI monitoring your progress."
            }
          </p>
        </div>
      </div>
    </motion.div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function AthleteChat() {
  // const [plan, setPlan]          = useState(null);
  const { user, token }          = useAuthStore()
  const [messages,  setMessages] = useState([])
  const [input,     setInput]    = useState("")
  const [typing,    setTyping]   = useState(null)  // name of who's typing
  const [showPlan,  setShowPlan] = useState(false)
  const [showQuick, setShowQuick]= useState(false)
  const [plan,      setPlan]     = useState(null)
  const [planId, setPlanId] = useState('');
  const [sessions,  setSessions] = useState([])
  const [athleteInfo, setAthleteInfo] = useState(null);
  const [coach,     setCoach]    = useState(null)
  const [loading,   setLoading]  = useState(true)
  const [online,    setOnline]   = useState(false)
  const bottomRef                = useRef(null)
  const socketRef                = useRef(null)
  const typingTimer              = useRef(null)
  // console.log(coach);

  useEffect(() => {
    const athleteInfo = async() => {
      const {data: info} = await api.get(`/athlete/${user.id}`);
      // console.log(info);
      setAthleteInfo(info);
      // console.log(`${athleteInfo.assignedCoachId}/${athleteInfo._id}`)
      const {data: res} = await api.get(`/plan/get-microPlans/${info.assignedCoachId}/${info._id}`)
      const fetchedPlan = res.plan[0];
      setPlan(fetchedPlan);
      setPlanId(fetchedPlan._id);
    }
    athleteInfo()
  },[user.id])

  // ── Auto-scroll ────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  // ── Fetch initial data + connect socket ────────────────────
  useEffect(() => {
    // console.log(planId)
    if (!planId || !token) return

    const init = async () => {
      try {
        // 1. Fetch full plan data
        const { data: fullPlan } = await api.get(`/plan/${planId}`)
        setPlan(fullPlan)

        // 2. Fetch athlete profile to get coach info
        const { data: profile } = await api.get(`/athlete/${user.id}`)
        // console.log(profile)
        if (profile.assignedCoachId) {
          const {data: coachInfo} = await api.get(`/coach/${profile?.assignedCoachId}`)
          // console.log(coachInfo);
          setCoach(coachInfo);
        }

        // 3. Fetch workout sessions for plan panel
        const { data: sess } = await api.get(`/workout/athlete/${profile._id}`)
        setSessions(sess);
        // console.log(sess);
      } catch (err) {
        console.error("Chat init error:", err)
      } finally {
        setLoading(false)
      }
    }

    init()

    // ── Connect Socket.io ───────────────────────────────────
    const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000", {
      auth: { token },
    })
    socketRef.current = socket

    socket.on("connect", () => {
      // Join the plan room
      socket.emit("join_plan_room", planId)
      // Fetch message history
      socket.emit("get_messages", { planId, page: 1 })
    })

    // Receive message history
    socket.on("message_history", (msgs) => {
      setMessages(msgs.map(normalizeMsg))
    })

    // Receive new message in real time
    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, normalizeMsg(msg)])
      // Mark as read if from someone else
      if (msg.senderId?._id !== user.id && msg.senderId !== user.id) {
        socket.emit("mark_read", { planId, senderId: msg.senderId?._id || msg.senderId })
      }
    })

    // Typing events
    socket.on("user_typing", ({ name, userId }) => {
      if (userId !== user.id) setTyping(name)
    })
    socket.on("user_stop_typing", () => setTyping(null))

    // Read receipts
    socket.on("messages_read", () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user.id || m.senderId?._id === user.id
            ? { ...m, readAt: new Date().toISOString() }
            : m
        )
      )
    })

    // Online status (basic — emit presence)
    socket.on("connect",    () => setOnline(true))
    socket.on("disconnect", () => setOnline(false))

    return () => {
      socket.emit("leave_plan_room", planId)
      socket.disconnect()
    }
  }, [planId, token])

  // ── Normalize message shape from server ────────────────────
  const normalizeMsg = (msg) => ({
    ...msg,
    id:      msg._id || msg.id || Date.now(),
    content: msg.content,
    senderId: msg.senderId,
    time:    msg.sentAt || msg.createdAt
      ? new Date(msg.sentAt || msg.createdAt).toLocaleTimeString("en-IN", {
          hour: "2-digit", minute: "2-digit"
        })
      : "",
    readAt: msg.readAt || null,
  })

  // ── Send message ───────────────────────────────────────────
  const sendMessage = (text) => {
    const content = (text || input).trim()
    if (!content || !socketRef.current) return

    socketRef.current.emit("send_message", {
      planId,
      receiverId: coach?._id,
      content,
    })

    // Stop typing indicator
    socketRef.current.emit("stop_typing", { planId })
    clearTimeout(typingTimer.current)
    setInput("")
    setShowQuick(false)
  }

  // ── Typing indicator emit ──────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (!socketRef.current) return

    socketRef.current.emit("typing", { planId })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { planId })
    }, 1500)
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Group messages by date ─────────────────────────────────
  const groupedMessages = messages.reduce((groups, msg) => {
    const date = msg.sentAt || msg.createdAt
      ? new Date(msg.sentAt || msg.createdAt).toLocaleDateString("en-IN", {
          weekday: "long", day: "numeric", month: "short"
        })
      : "Today"
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {})

  // ── Plan info for header ───────────────────────────────────
  const masterPlan  = plan?.plan
  // console.log(masterPlan)

  const mesocycles  = plan?.mesocycles || []
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000

  const endDate = masterPlan?.startDate
    ? new Date(
        new Date(masterPlan.startDate).getTime() +
        masterPlan.totalWeeks * WEEK_MS
      )
  : null
  const currentWeek = masterPlan
    ? Math.min(
        Math.ceil(
          (Date.now() - new Date(masterPlan.startDate).getTime()) /
          (7 * 24 * 60 * 60 * 1000)
        ),
        masterPlan.totalWeeks
      )
    : 0
  const progress = masterPlan
    ? Math.min(
        Math.round(
          ((Date.now() - new Date(masterPlan.startDate).getTime()) /
            (new Date(endDate).getTime() -
              new Date(masterPlan.startDate).getTime())) * 100
        ),
        100
      )
    : 0
  const currentMeso = mesocycles.find(
    (m) => currentWeek >= m.weekStart && currentWeek <= m.weekEnd
  )

  if (loading) return (
    <div className="h-full flex items-center justify-center"
         style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-green
                        border-t-transparent animate-spin" />
        <p className="text-sm text-green">Connecting to chat...</p>
      </div>
    </div>
  )

  return (
    <div className="h-full flex flex-col relative overflow-hidden"
         style={{ backgroundColor: "var(--bg)" }}>

      {/* Background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full
                      pointer-events-none"
           style={{
             background: "radial-gradient(circle, rgba(57,255,20,0.04) 0%, transparent 70%)",
             filter:     "blur(60px)",
           }} />

      {/* ── Header ─────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between px-4 sm:px-6 py-4 border-b
                   flex-shrink-0 relative z-10"
        style={{ borderColor:     "var(--glass-border)",
                 backgroundColor: "var(--bg-alt)" }}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-11 h-11 rounded-xl bg-green-muted border border-green/30
                            flex items-center justify-center">
              <span className="font-display font-bold text-lg text-green">
                {coach?.userId.name?.[0]?.toUpperCase() || "C"}
              </span>
            </div>
            <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5
                             rounded-full border-2`}
                 style={{
                   backgroundColor: online ? "var(--green)" : "#6b7280",
                   borderColor:     "var(--bg-alt)",
                 }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                {coach?.userId.name || "Your Coach"}
              </p>
              <span className="text-xs px-2 py-0.5 rounded-md bg-green-muted
                               text-green font-semibold">
                COACH
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <div className={`w-1.5 h-1.5 rounded-full ${online ? "bg-green pulse-green" : ""}`}
                   style={{ backgroundColor: online ? "var(--green)" : "#6b7280" }} />
              <p className="text-xs" style={{ color: online ? "var(--green)" : "var(--text-muted)" }}>
                {online ? "Online" : "Offline"}
                {currentMeso && ` · ${currentMeso.name}`}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowPlan(!showPlan)}
            className={`hidden sm:flex items-center gap-2 px-3 py-2 text-xs
                        font-semibold rounded-xl transition-all duration-200
                        ${showPlan ? "btn-green" : "btn-glass"}`}
          >
            <Target size={13} /> My Plan
          </motion.button>
          <button className="w-9 h-9 rounded-xl glass-card flex items-center
                             justify-center hover:border-green/40 transition-all"
                  style={{ color: "var(--text-muted)" }}>
            <MoreVertical size={16} />
          </button>
        </div>
      </motion.div>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6
                        flex flex-col gap-3">

          {/* Week context banner */}
          {masterPlan && (
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
                  {currentMeso?.name?.toUpperCase() || masterPlan.title.toUpperCase()}
                  {currentWeek > 0 && ` — WEEK ${currentWeek}`}
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  {masterPlan.title}
                </p>
              </div>
              <div className="ml-auto flex items-center gap-1 text-xs text-green
                              font-semibold">
                {progress}% <TrendingUp size={12} />
              </div>
            </motion.div>
          )}

          {/* Messages grouped by date */}
          {messages.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center
                            py-16 text-center">
              <div className="w-14 h-14 rounded-2xl bg-green-muted border
                              border-green/20 flex items-center justify-center mb-4">
                <Brain size={24} className="text-green" />
              </div>
              <p className="font-display font-700 text-xl uppercase mb-2"
                 style={{ color: "var(--text)" }}>
                Start the conversation
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Ask your coach anything about your training
              </p>
            </div>
          ) : (
            Object.entries(groupedMessages).map(([date, msgs]) => (
              <div key={date}>
                <DateSep label={date} />
                <div className="flex flex-col gap-3 mt-3">
                  {msgs.map((msg) => (
                    <MessageBubble
                      key={msg.id || msg._id}
                      msg={msg}
                      currentUserId={user.id}
                    />
                  ))}
                </div>
              </div>
            ))
          )}

          {/* Typing indicator */}
          <AnimatePresence>
            {typing && <TypingIndicator name={typing} />}
          </AnimatePresence>

          <div ref={bottomRef} />
        </div>

        {/* Plan panel — desktop */}
        <AnimatePresence>
          {showPlan && (
            <div className="hidden sm:block relative w-72 flex-shrink-0">
              <PlanPanel
                plan={plan}
                sessions={sessions}
                onClose={() => setShowPlan(false)}
              />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile plan panel — bottom sheet */}
      <AnimatePresence>
        {showPlan && (
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
            className="sm:hidden fixed inset-x-0 bottom-0 z-50 rounded-t-3xl
                       border-t overflow-hidden"
            style={{ maxHeight: "70vh",
                     backgroundColor: "var(--bg-alt)",
                     borderColor:     "var(--glass-border)" }}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-10 h-1 rounded-full"
                   style={{ backgroundColor: "var(--glass-border-bright)" }} />
            </div>
            <PlanPanel
              plan={plan}
              sessions={sessions}
              onClose={() => setShowPlan(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick replies */}
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
                style={{ borderColor: "var(--glass-border)",
                         color:       "var(--text-muted)" }}
              >
                {reply}
                <ChevronRight size={11} className="text-green" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex-shrink-0 px-4 sm:px-6 py-4 border-t"
        style={{ borderColor:     "var(--glass-border)",
                 backgroundColor: "var(--bg-alt)" }}
      >
        <div className="flex items-end gap-3">
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

          <div className="flex-1 flex items-end gap-2 px-4 py-3 rounded-2xl
                          glass-card border focus-within:border-green/40
                          transition-all duration-200 min-h-[46px]"
               style={{ borderColor: "var(--glass-border)" }}>
            <textarea
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKey}
              placeholder={`Message ${coach?.userId.name || "your coach"}...`}
              rows={1}
              className="flex-1 bg-transparent outline-none text-sm resize-none
                         max-h-28 leading-relaxed placeholder-gray-600"
              style={{ color: "var(--text)" }}
            />
            <button className="p-1 hover:text-green transition-colors flex-shrink-0"
                    style={{ color: "var(--text-muted)" }}>
              <Paperclip size={15} />
            </button>
          </div>

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

        <p className="text-xs mt-2.5 text-center"
           style={{ color: "var(--text-dim)" }}>
          <kbd className="px-1.5 py-0.5 rounded-md glass-card text-green text-xs border"
               style={{ borderColor: "var(--glass-border)" }}>
            Enter
          </kbd>{" "}
          send ·{" "}
          <kbd className="px-1.5 py-0.5 rounded-md glass-card text-green text-xs border"
               style={{ borderColor: "var(--glass-border)" }}>
            ⚡
          </kbd>{" "}
          quick replies ·{" "}
          <kbd className="px-1.5 py-0.5 rounded-md glass-card text-green text-xs border"
               style={{ borderColor: "var(--glass-border)" }}>
            Plan
          </kbd>{" "}
          week view
        </p>
      </motion.div>
    </div>
  )
}