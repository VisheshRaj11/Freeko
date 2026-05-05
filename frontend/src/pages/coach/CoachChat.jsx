import { useState, useEffect, useRef } from "react"
import { useParams } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send, Search, Brain, ChevronDown,
  CheckCheck, Clock, Zap, MoreVertical,
  Paperclip, Smile, Phone, Video
} from "lucide-react"
import { useAuthStore } from "../../../store/authStore"
import api from "../../lib/axios"
import { io } from "socket.io-client"

// ── Mock conversations for UI demo ────────────────────────────
const MOCK_ATHLETES = [
  { id: "1", name: "Rahul Sharma",  role: "athlete", plan: "Strength Block · Wk 8",
    lastMsg: "Bench felt great today!", time: "2m",  unread: 2, online: true  },
  { id: "2", name: "Priya Verma",   role: "athlete", plan: "Hypertrophy · Wk 4",
    lastMsg: "Should I do cardio tomorrow?", time: "1h", unread: 0, online: true  },
  { id: "3", name: "Amit Singh",    role: "athlete", plan: "Peak Phase · Wk 12",
    lastMsg: "Feeling strong this week 💪", time: "3h", unread: 1, online: false },
  { id: "4", name: "Sneha Patil",   role: "athlete", plan: "Hypertrophy · Wk 2",
    lastMsg: "Got it, reducing volume", time: "1d", unread: 0, online: false },
]

const MOCK_MESSAGES = {
  "1": [
    { id: 1, content: "Coach, my knee is feeling a bit sore after squats yesterday",
      role: "athlete", time: "09:00", read: true },
    { id: 2, content: "Okay, lets reduce squat volume this week. Replace leg press with leg extensions to protect the knee.",
      role: "coach", time: "10:30", read: true },
    { id: 3, content: "Bench felt great today! Hit 85kg for 4 sets of 8!",
      role: "athlete", time: "18:00", read: true },
    { id: 4, content: "Great work! That's a 5kg PR. Next week will be a deload — enjoy the lighter sessions.",
      role: "coach", time: "18:45", read: true },
    { id: 5, content: "Bench felt great today!", role: "athlete", time: "Just now", read: false },
  ],
  "2": [
    { id: 1, content: "Should I do cardio tomorrow?", role: "athlete", time: "1h ago", read: false },
  ],
}

export default function CoachChat() {
  const { planId }              = useParams()
  const { user, token }         = useAuthStore()
  const [athletes]              = useState(MOCK_ATHLETES)
  const [activeAthlete, setActive] = useState(MOCK_ATHLETES[0])
  const [messages, setMessages] = useState(MOCK_MESSAGES["1"] || [])
  const [input, setInput]       = useState("")
  const [search, setSearch]     = useState("")
  const [typing, setTyping]     = useState(false)
  const [aiSummary, setAiSummary] = useState(null)
  const [showSummary, setShowSummary] = useState(false)
  const bottomRef               = useRef(null)
  const socketRef               = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const selectAthlete = (athlete) => {
    setActive(athlete)
    setMessages(MOCK_MESSAGES[athlete.id] || [])
  }

  const sendMessage = () => {
    if (!input.trim()) return
    const msg = {
      id:      Date.now(),
      content: input.trim(),
      role:    "coach",
      time:    "Just now",
      read:    false,
    }
    setMessages((prev) => [...prev, msg])
    setInput("")
  }

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const fetchAiSummary = () => {
    setShowSummary(true)
    setTimeout(() => {
      setAiSummary([
        "Athlete reported knee soreness — coach adjusted leg volume",
        "Bench press hit 85kg PR — 5kg improvement this week",
        "Deload week confirmed for next week",
        "Overall compliance: 4/5 sessions completed",
      ])
    }, 1200)
  }

  const filtered = athletes.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="h-full flex" style={{ backgroundColor: "var(--bg)" }}>

      {/* ── Sidebar: athlete list ─────────────────────────────── */}
      <div className="w-full sm:w-72 lg:w-80 flex-shrink-0 flex flex-col border-r"
           style={{ borderColor: "var(--glass-border)",
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

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search athletes..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm
                         bg-transparent border outline-none transition-all
                         focus:border-green/50 focus:bg-white/5"
              style={{
                borderColor: "var(--glass-border)",
                color:       "var(--text)",
              }}
            />
          </div>
        </div>

        {/* Athlete list */}
        <div className="flex-1 overflow-y-auto py-2">
          {filtered.map((athlete) => (
            <motion.button
              key={athlete.id}
              onClick={() => selectAthlete(athlete)}
              whileHover={{ x: 4 }}
              className={`w-full flex items-start gap-3 px-4 py-3.5
                          transition-all duration-200 border-l-2 text-left
                          ${activeAthlete.id === athlete.id
                            ? "border-l-green bg-white/5"
                            : "border-l-transparent hover:bg-white/3"
                          }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <div className="w-10 h-10 rounded-xl bg-green-muted border
                                border-green/20 flex items-center justify-center">
                  <span className="font-display font-bold text-base text-green">
                    {athlete.name[0]}
                  </span>
                </div>
                {athlete.online && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3
                                  rounded-full bg-green border-2"
                       style={{ borderColor: "var(--bg-alt)" }} />
                )}
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
          ))}
        </div>
      </div>

      {/* ── Main Chat Area ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Chat header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
             style={{
               borderColor:     "var(--glass-border)",
               backgroundColor: "var(--bg-alt)",
             }}>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-green-muted border
                              border-green/20 flex items-center justify-center">
                <span className="font-display font-bold text-base text-green">
                  {activeAthlete.name[0]}
                </span>
              </div>
              {activeAthlete.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3
                                rounded-full bg-green border-2"
                     style={{ borderColor: "var(--bg-alt)" }} />
              )}
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
                {activeAthlete.name}
              </p>
              <p className="text-xs text-green">
                {activeAthlete.online ? "Online now" : "Last seen 3h ago"} ·{" "}
                {activeAthlete.plan}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* AI Summary button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchAiSummary}
              className="hidden sm:flex items-center gap-2 px-3 py-2
                         rounded-xl text-xs font-semibold btn-glass"
            >
              <Brain size={14} className="text-green" />
              AI Summary
            </motion.button>
            <button className="w-9 h-9 rounded-xl glass-card flex items-center
                               justify-center hover:border-green/40 transition-all"
                    style={{ color: "var(--text-muted)" }}>
              <MoreVertical size={16} />
            </button>
          </div>
        </div>

        {/* AI Summary panel */}
        <AnimatePresence>
          {showSummary && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="border-b overflow-hidden"
              style={{ borderColor: "rgba(57,255,20,0.2)",
                       backgroundColor: "rgba(57,255,20,0.04)" }}
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Brain size={14} className="text-green" />
                    <span className="text-xs font-semibold text-green tracking-widest">
                      AI WEEK SUMMARY
                    </span>
                  </div>
                  <button onClick={() => setShowSummary(false)}
                          className="text-xs" style={{ color: "var(--text-muted)" }}>
                    Close
                  </button>
                </div>
                {aiSummary ? (
                  <div className="flex flex-col gap-2">
                    {aiSummary.map((b, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="flex items-start gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-green mt-1.5
                                        flex-shrink-0" />
                        <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                          {b}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full border-2 border-green
                                    border-t-transparent animate-spin" />
                    <span className="text-xs text-green">
                      Generating summary...
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 flex flex-col gap-4">
          {messages.map((msg, i) => {
            const isCoach = msg.role === "coach"
            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 12, scale: 0.97 }}
                animate={{ opacity: 1, y: 0,  scale: 1    }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className={`flex ${isCoach ? "justify-end" : "justify-start"}`}
              >
                {/* Athlete avatar */}
                {!isCoach && (
                  <div className="w-8 h-8 rounded-lg bg-green-muted border
                                  border-green/20 flex items-center justify-center
                                  flex-shrink-0 mr-2 mt-auto">
                    <span className="text-xs font-bold text-green">
                      {activeAthlete.name[0]}
                    </span>
                  </div>
                )}

                <div className={`max-w-xs sm:max-w-sm lg:max-w-md flex flex-col
                                 ${isCoach ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${isCoach
                      ? "bg-green text-black font-medium rounded-br-sm"
                      : "glass-card text-[var(--text)] rounded-bl-sm"
                    }`}
                       style={isCoach ? {
                         boxShadow: "0 0 20px rgba(57,255,20,0.25)"
                       } : {}}>
                    {msg.content}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-xs"
                          style={{ color: "var(--text-muted)" }}>
                      {msg.time}
                    </span>
                    {isCoach && (
                      <CheckCheck size={12}
                                  className={msg.read ? "text-green" : ""}
                                  style={{ color: msg.read
                                    ? "var(--green)"
                                    : "var(--text-muted)" }} />
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Typing indicator */}
          {typing && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-green-muted flex items-center
                              justify-center">
                <span className="text-xs font-bold text-green">
                  {activeAthlete.name[0]}
                </span>
              </div>
              <div className="px-4 py-3 rounded-2xl glass-card flex items-center gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.div key={i}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                    className="w-1.5 h-1.5 rounded-full bg-green"
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="px-4 sm:px-6 py-4 border-t"
             style={{
               borderColor:     "var(--glass-border)",
               backgroundColor: "var(--bg-alt)",
             }}>
          <div className="flex items-end gap-3">
            <div className="flex-1 flex items-end gap-2 px-4 py-3 rounded-2xl
                            glass-card border focus-within:border-green/40
                            transition-all duration-200">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Type a message..."
                rows={1}
                className="flex-1 bg-transparent outline-none text-sm resize-none
                           max-h-28 leading-relaxed"
                style={{ color: "var(--text)" }}
              />
              <button className="flex-shrink-0 p-1 hover:text-green transition-colors"
                      style={{ color: "var(--text-muted)" }}>
                <Paperclip size={16} />
              </button>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={sendMessage}
              disabled={!input.trim()}
              className="w-11 h-11 rounded-xl flex items-center justify-center
                         flex-shrink-0 btn-green disabled:opacity-40
                         disabled:cursor-not-allowed"
            >
              <Send size={17} />
            </motion.button>
          </div>

          <p className="text-xs mt-2 text-center"
             style={{ color: "var(--text-muted)" }}>
            Press <kbd className="px-1 py-0.5 rounded text-green glass-card text-xs">
              Enter
            </kbd> to send ·{" "}
            <kbd className="px-1 py-0.5 rounded text-green glass-card text-xs">
              Shift+Enter
            </kbd> for new line
          </p>
        </div>
      </div>
    </div>
  )
}