import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Search, Brain, CheckCheck,
  Zap, MoreVertical, Paperclip, X
} from "lucide-react"
import { useAuthStore } from "../../../store/authStore"
import api from "../../lib/axios"
import { io } from "socket.io-client"

// ── Message bubble ─────────────────────────────────────────────
function MessageBubble({ msg, currentUserId, athleteInitial }) {
  const isCoach = msg.senderId?._id === currentUserId ||
                  msg.senderId === currentUserId

  const time = msg.sentAt || msg.createdAt
    ? new Date(msg.sentAt || msg.createdAt).toLocaleTimeString("en-IN", {
        hour: "2-digit", minute: "2-digit"
      })
    : msg.time || ""

  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className={`flex ${isCoach ? "justify-end" : "justify-start"}`}
    >
      {/* Athlete avatar */}
      {!isCoach && (
        <div className="w-8 h-8 rounded-lg bg-green-muted border border-green/20
                        flex items-center justify-center flex-shrink-0 mr-2 mt-auto">
          <span className="text-xs font-bold text-green">{athleteInitial}</span>
        </div>
      )}

      <div className={`max-w-xs sm:max-w-sm lg:max-w-md flex flex-col
                       ${isCoach ? "items-end" : "items-start"}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isCoach
            ? "bg-green text-black font-medium rounded-br-sm"
            : "glass-card text-[var(--text)] rounded-bl-sm border"
          }`}
             style={isCoach
               ? { boxShadow: "0 0 20px rgba(57,255,20,0.25)" }
               : { borderColor: "var(--glass-border-bright)" }
             }>
          {msg.content}
        </div>
        <div className={`flex items-center gap-1 mt-1 px-1
                         ${isCoach ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-xs" style={{ color: "var(--text-muted)" }}>
            {time}
          </span>
          {isCoach && (
            <CheckCheck
              size={12}
              style={{ color: msg.readAt ? "var(--green)" : "var(--text-muted)" }}
            />
          )}
        </div>
      </div>
    </motion.div>
  )
}

// ── Typing indicator ───────────────────────────────────────────
function TypingDots({ name, initial }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-green-muted flex items-center
                      justify-center flex-shrink-0">
        <span className="text-xs font-bold text-green">{initial}</span>
      </div>
      <div className="px-4 py-3 rounded-2xl glass-card flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div key={i}
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              className="w-1.5 h-1.5 rounded-full bg-green"
            />
          ))}
        </div>
        <span className="text-xs" style={{ color: "var(--text-muted)" }}>
          {name} is typing...
        </span>
      </div>
    </div>
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

// ── AI Summary panel ───────────────────────────────────────────
function AiSummaryPanel({ planId, athleteId, weekNumber, onClose }) {
  const [loading,  setLoading]  = useState(true)
  const [summary,  setSummary]  = useState(null)
  const [error,    setError]    = useState(null)

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get(`/report/${planId}/${weekNumber}`)
        setSummary(res.data)
      } catch {
        // If no report yet, generate one on the fly
        try {
          const res = await api.post(`/report/generate`, {
            planId, weekNumber
          })
          setSummary(res.data)
        } catch (err) {
          setError("Could not load summary")
        }
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [planId, weekNumber])

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="border-b overflow-hidden"
      style={{ borderColor:     "rgba(57,255,20,0.2)",
               backgroundColor: "rgba(57,255,20,0.04)" }}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Brain size={14} className="text-green" />
            <span className="text-xs font-semibold text-green tracking-widest">
              AI WEEK SUMMARY · WEEK {weekNumber}
            </span>
          </div>
          <button onClick={onClose}
                  className="text-xs hover:text-green transition-colors"
                  style={{ color: "var(--text-muted)" }}>
            <X size={14} />
          </button>
        </div>

        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-green
                            border-t-transparent animate-spin" />
            <span className="text-xs text-green">Generating summary...</span>
          </div>
        ) : error ? (
          <p className="text-xs text-red-400">{error}</p>
        ) : summary ? (
          <div className="flex flex-col gap-2">
            {summary.summaryBullets?.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="flex items-start gap-2"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-green mt-1.5 flex-shrink-0" />
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>{b}</p>
              </motion.div>
            ))}
            {summary.anomalyInsights && (
              <div className="mt-2 px-3 py-2 rounded-xl"
                   style={{ backgroundColor: "rgba(255,200,0,0.06)",
                            border: "1px solid rgba(255,200,0,0.2)" }}>
                <p className="text-xs" style={{ color: "#FFC800" }}>
                  ⚠ {summary.anomalyInsights}
                </p>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </motion.div>
  )
}

// ── Main ───────────────────────────────────────────────────────
export default function CoachChat() {
  const { user, token }           = useAuthStore()
  const [athletes,    setAthletes]    = useState([])
  const [activeAthlete, setActive]    = useState(null)
  const [activePlanId,  setActivePlanId] = useState(null)
  const [messages,    setMessages]    = useState([])
  const [input,       setInput]       = useState("")
  const [search,      setSearch]      = useState("")
  const [typing,      setTyping]      = useState(null)
  const [showSummary, setShowSummary] = useState(false)
  const [loading,     setLoading]     = useState(true)
  const [msgLoading,  setMsgLoading]  = useState(false)
  const [currentWeek, setCurrentWeek] = useState(1)
  const bottomRef   = useRef(null)
  const socketRef   = useRef(null)
  const typingTimer = useRef(null)

  // ── Auto scroll ────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  // ── Fetch coach's athletes on mount ────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const { data: profiles } = await api.get(`/coach/${user.id}/athletes`)
        // console.log(profiles[0])
        const enriched = await Promise.all(
          profiles.map(async (ap) => {
            try {
              const { data: plans } = await api.get(
                `/plan/athlete/${ap._id}`
              )
              const active = plans.find((p) => p.status === "active") || plans[0]

              // Last message from chat
              let lastMsg = "No messages yet"
              let lastTime = ""
              let unread = 0

              return {
                id:      ap.userId._id,
                name:    ap.userId.name,
                email:   ap.userId.email,
                planId:  active?._id   || null,
                plan:    active?.title || "No plan",
                online:  false,          // updated via socket later
                lastMsg,
                time:    lastTime,
                unread,
              }
            } catch {
              return {
                id:     ap.userId._id,
                name:   ap.userId.name,
                email:  ap.userId.email,
                planId: null,
                plan:   "No plan",
                online: false,
                lastMsg: "No messages yet",
                time:    "",
                unread:  0,
              }
            }
          })
        )

        setAthletes(enriched)
        if (enriched.length > 0) {
          selectAthlete(enriched[0])
        }
      } catch (err) {
        console.error("Failed to load athletes:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user.id])

  // ── Connect socket when active athlete changes ─────────────
  useEffect(() => {
    if (!activeAthlete?.planId || !token) return

    // Disconnect previous socket
    if (socketRef.current) {
      socketRef.current.emit("leave_plan_room", activePlanId)
      socketRef.current.disconnect()
    }

    const socket = io(
      import.meta.env.VITE_SERVER_URL || "http://localhost:5000",
      { auth: { token } }
    )
    socketRef.current = socket

    socket.on("connect", () => {
      socket.emit("join_plan_room", activeAthlete.planId)
      socket.emit("get_messages", { planId: activeAthlete.planId, page: 1 })
    })

   socket.on("online_users", (onlineUserIds) => {

      console.log("ONLINE IDS:", onlineUserIds)

      setAthletes((prev) =>
          prev.map((a) => {
            const isOnline = onlineUserIds.includes(String(a.id))

            console.log(a.name, a.id, isOnline)

            return {
              ...a,
              online: isOnline,
            }
          })
        )

        setActive((prev) =>
          prev
            ? {
                ...prev,
                online: onlineUserIds.includes(String(prev.id)),
              }
            : prev
        )
    })

    socket.on("message_history", (msgs) => {
      setMessages(msgs)
      setMsgLoading(false)
    })

    socket.on("new_message", (msg) => {
      setMessages((prev) => [...prev, msg])
      // Mark as read since coach is viewing
      socket.emit("mark_read", {
        planId:   activeAthlete.planId,
        senderId: msg.senderId?._id || msg.senderId,
      })
      // Update sidebar last message
      setAthletes((prev) =>
        prev.map((a) =>
          a.id === activeAthlete.id
            ? { ...a, lastMsg: msg.content, time: "Just now", unread: 0 }
            : a
        )
      )
    })

    socket.on("user_typing", ({ name, userId }) => {
      if (userId !== user.id) setTyping(name)
    })
    socket.on("user_stop_typing", () => setTyping(null))

    socket.on("messages_read", () => {
      setMessages((prev) =>
        prev.map((m) =>
          m.senderId === user.id || m.senderId?._id === user.id
            ? { ...m, readAt: new Date().toISOString() }
            : m
        )
      )
    })

    return () => {
      socket.emit("leave_plan_room", activeAthlete.planId)
      socket.disconnect()
    }
  }, [activeAthlete?.planId, token])

  // ── Select athlete ─────────────────────────────────────────
  const selectAthlete = (athlete) => {
    setActive(athlete)
    setActivePlanId(athlete.planId)
    setMessages([])
    setShowSummary(false)
    setMsgLoading(true)

    // Calculate current week for this plan
    if (athlete.planId) {
      api.get(`/plan/${athlete.planId}`).then(({ data }) => {
        const startDate = new Date(data.plan?.startDate)
        const week = Math.max(
          1,
          Math.ceil(
            (Date.now() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)
          )
        )
        setCurrentWeek(week)
      }).catch(() => {})
    }

    // Clear unread for this athlete
    setAthletes((prev) =>
      prev.map((a) => a.id === athlete.id ? { ...a, unread: 0 } : a)
    )
  }

  // ── Send message ───────────────────────────────────────────
  const sendMessage = () => {
    const content = input.trim()
    if (!content || !socketRef.current || !activeAthlete) return

    socketRef.current.emit("send_message", {
      planId:     activeAthlete.planId,
      receiverId: activeAthlete.id,
      content,
    })
    socketRef.current.emit("stop_typing", { planId: activeAthlete.planId })
    clearTimeout(typingTimer.current)
    setInput("")
  }

  // ── Typing emit ────────────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (!socketRef.current || !activeAthlete?.planId) return
    socketRef.current.emit("typing", { planId: activeAthlete.planId })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", { planId: activeAthlete.planId })
    }, 1500)
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Group messages by date ─────────────────────────────────
  const grouped = messages.reduce((groups, msg) => {
    const date = msg.sentAt || msg.createdAt
      ? new Date(msg.sentAt || msg.createdAt).toLocaleDateString("en-IN", {
          weekday: "short", day: "numeric", month: "short"
        })
      : "Today"
    if (!groups[date]) groups[date] = []
    groups[date].push(msg)
    return groups
  }, {})

  const filtered = athletes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return (
    <div className="h-full flex items-center justify-center"
         style={{ backgroundColor: "var(--bg)" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-green
                        border-t-transparent animate-spin" />
        <p className="text-sm text-green">Loading conversations...</p>
      </div>
    </div>
  )

  return (
    <div className="h-full flex" style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Sidebar ────────────────────────────────────────── */}
      <div className="w-full sm:w-72 lg:w-80 flex-shrink-0 flex flex-col border-r"
           style={{ borderColor:     "var(--glass-border)",
                    backgroundColor: "var(--bg-alt)" }}>

        {/* Header */}
        <div className="px-4 pt-6 pb-4 border-b"
             style={{ borderColor: "var(--glass-border)" }}>
          <div className="flex items-center justify-between mb-4">
            <h1 className="font-display font-700 text-2xl uppercase tracking-tight"
                style={{ color: "var(--text)" }}>
              Messages
            </h1>
            <div className="w-2 h-2 rounded-full bg-green pulse-green" />
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search athletes..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
                         bg-transparent border outline-none transition-all
                         focus:border-green/50 focus:bg-white/5
                         placeholder-gray-600"
              style={{ borderColor: "var(--glass-border)", color: "var(--text)" }}
            />
          </div>
        </div>

        {/* Athlete list */}
        <div className="flex-1 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm py-8"
               style={{ color: "var(--text-muted)" }}>
              No athletes yet
            </p>
          ) : (
            filtered.map((athlete) => (
              <motion.button
                key={athlete.id}
                onClick={() => selectAthlete(athlete)}
                whileHover={{ x: 4 }}
                className={`w-full flex items-start gap-3 px-4 py-3.5
                            transition-all duration-200 border-l-2 text-left
                            ${activeAthlete?.id === athlete.id
                              ? "border-l-green bg-white/5"
                              : "border-l-transparent hover:bg-white/3"
                            }`}
              >
                {/* Avatar + online dot */}
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-green-muted border
                                  border-green/20 flex items-center justify-center">
                    <span className="font-display font-bold text-base text-green">
                      {athlete.name[0]}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3
                                  rounded-full border-2"
                       style={{
                         backgroundColor: athlete.online ? "var(--green)" : "#6b7280",
                         borderColor:     "var(--bg-alt)",
                       }} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-sm font-semibold truncate"
                          style={{ color: "var(--text)" }}>
                      {athlete.name}
                    </span>
                    <span className="text-xs flex-shrink-0"
                          style={{ color: "var(--text-muted)" }}>
                      {athlete.time}
                    </span>
                  </div>
                  <p className="text-xs truncate mb-1"
                     style={{ color: "var(--text-muted)" }}>
                    {athlete.lastMsg}
                  </p>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-green-muted
                                   text-green">
                    {athlete.plan}
                  </span>
                </div>

                {/* Unread badge */}
                {athlete.unread > 0 && (
                  <div className="w-5 h-5 rounded-full bg-green flex items-center
                                  justify-center flex-shrink-0 mt-1">
                    <span className="text-xs font-bold text-black">
                      {athlete.unread}
                    </span>
                  </div>
                )}
              </motion.button>
            ))
          )}
        </div>
      </div>

      {/* ── Main chat area ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* No athlete selected */}
        {!activeAthlete ? (
          <div className="flex-1 flex items-center justify-center"
               style={{ backgroundColor: "var(--bg)" }}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-muted border
                              border-green/20 flex items-center justify-center
                              mx-auto mb-4">
                <Brain size={28} className="text-green" />
              </div>
              <p className="font-display font-700 text-xl uppercase mb-2"
                 style={{ color: "var(--text)" }}>
                Select an athlete
              </p>
              <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                Choose from your roster to start messaging
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="flex items-center justify-between px-6 py-4 border-b"
                 style={{ borderColor:     "var(--glass-border)",
                          backgroundColor: "var(--bg-alt)" }}>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-xl bg-green-muted border
                                  border-green/20 flex items-center justify-center">
                    <span className="font-display font-bold text-base text-green">
                      {activeAthlete.name[0]}
                    </span>
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3
                                  rounded-full border-2"
                       style={{
                         backgroundColor: activeAthlete.online
                           ? "var(--green)" : "#6b7280",
                         borderColor: "var(--bg-alt)",
                       }} />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                    {activeAthlete.name}
                  </p>
                  <p className="text-xs"
                     style={{ color: activeAthlete.online
                       ? "var(--green)" : "var(--text-muted)" }}>
                    {activeAthlete.online ? "Online now" : "Offline"} ·{" "}
                    {activeAthlete.plan}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeAthlete.planId && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowSummary(!showSummary)}
                    className={`hidden sm:flex items-center gap-2 px-3 py-2
                                rounded-xl text-xs font-semibold transition-all
                                ${showSummary ? "btn-green" : "btn-glass"}`}
                  >
                    <Brain size={14} className={showSummary ? "" : "text-green"} />
                    AI Summary
                  </motion.button>
                )}
                <button className="w-9 h-9 rounded-xl glass-card flex items-center
                                   justify-center hover:border-green/40 transition-all"
                        style={{ color: "var(--text-muted)" }}>
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

            {/* AI Summary panel */}
            <AnimatePresence>
              {showSummary && activeAthlete.planId && (
                <AiSummaryPanel
                  planId={activeAthlete.planId}
                  athleteId={activeAthlete.id}
                  weekNumber={currentWeek}
                  onClose={() => setShowSummary(false)}
                />
              )}
            </AnimatePresence>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
              {msgLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-8 h-8 rounded-full border-2 border-green
                                    border-t-transparent animate-spin" />
                    <p className="text-xs text-green">Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center
                                py-16 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-green-muted border
                                  border-green/20 flex items-center justify-center
                                  mb-4">
                    <Zap size={24} className="text-green" />
                  </div>
                  <p className="font-display font-700 text-xl uppercase mb-2"
                     style={{ color: "var(--text)" }}>
                    Start the conversation
                  </p>
                  <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                    Send {activeAthlete.name} a message about their training
                  </p>
                </div>
              ) : (
                Object.entries(grouped).map(([date, msgs]) => (
                  <div key={date}>
                    <DateSep label={date} />
                    <div className="flex flex-col gap-3 mt-3">
                      {msgs.map((msg) => (
                        <MessageBubble
                          key={msg._id || msg.id}
                          msg={msg}
                          currentUserId={user.id}
                          athleteInitial={activeAthlete.name[0]}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                  >
                    <TypingDots
                      name={activeAthlete.name}
                      initial={activeAthlete.name[0]}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={bottomRef} />
            </div>

            {/* Input bar */}
            <div className="px-4 sm:px-6 py-4 border-t"
                 style={{ borderColor:     "var(--glass-border)",
                          backgroundColor: "var(--bg-alt)" }}>
              <div className="flex items-end gap-3">
                <div className="flex-1 flex items-end gap-2 px-4 py-3 rounded-2xl
                                glass-card border focus-within:border-green/40
                                transition-all duration-200"
                     style={{ borderColor: "var(--glass-border)" }}>
                  <textarea
                    value={input}
                    onChange={handleInputChange}
                    onKeyDown={handleKey}
                    placeholder={`Message ${activeAthlete.name}...`}
                    rows={1}
                    className="flex-1 bg-transparent outline-none text-sm
                               resize-none max-h-28 leading-relaxed
                               placeholder-gray-600"
                    style={{ color: "var(--text)" }}
                  />
                  <button className="flex-shrink-0 p-1 hover:text-green
                                     transition-colors"
                          style={{ color: "var(--text-muted)" }}>
                    <Paperclip size={16} />
                  </button>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={sendMessage}
                  disabled={!input.trim() || !activeAthlete.planId}
                  className="w-11 h-11 rounded-xl flex items-center justify-center
                             flex-shrink-0 btn-green disabled:opacity-40
                             disabled:cursor-not-allowed"
                >
                  <Send size={17} />
                </motion.button>
              </div>

              {!activeAthlete.planId && (
                <p className="text-xs mt-2 text-center"
                   style={{ color: "var(--text-muted)" }}>
                  Generate a plan for this athlete before messaging
                </p>
              )}

              {activeAthlete.planId && (
                <p className="text-xs mt-2 text-center"
                   style={{ color: "var(--text-dim)" }}>
                  <kbd className="px-1 py-0.5 rounded glass-card text-green text-xs">
                    Enter
                  </kbd>{" "}
                  to send ·{" "}
                  <kbd className="px-1 py-0.5 rounded glass-card text-green text-xs">
                    Shift+Enter
                  </kbd>{" "}
                  new line
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}