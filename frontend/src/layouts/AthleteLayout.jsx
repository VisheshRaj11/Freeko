import { useState } from "react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, TrendingUp,
  MessageSquare, LogOut, ChevronLeft, ChevronRight
} from "lucide-react"
import { useAuthStore } from "../../store/authStore"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/athlete" },
  { icon: TrendingUp,      label: "Progress",  to: "/athlete/progress" },
  { icon: MessageSquare,   label: "Chat",      to: "/athlete/chat/select" },
]

export default function AthleteLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const { user, logout }          = useAuthStore()
  const navigate                  = useNavigate()

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="flex h-screen overflow-hidden"
         style={{ backgroundColor: "var(--dark)" }}>

      {/* ── Sidebar ──────────────────────────────────────────── */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="relative flex flex-col border-r z-40 overflow-hidden flex-shrink-0"
        style={{
          borderColor:     "var(--border)",
          backgroundColor: "var(--surface)",
        }}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b flex-shrink-0"
             style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-sm rotate-12 flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="font-display text-xl tracking-wider whitespace-nowrap"
                  style={{ color: "var(--text)" }}
                >
                  F<span className="text-accent">reeko</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-6 px-2 flex flex-col gap-1">
          {navItems.map(({ icon: Icon, label, to }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/athlete"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200
                 group relative overflow-hidden
                 ${isActive
                   ? "bg-accent text-black"
                   : "hover:bg-white/5 text-[var(--text-muted)] hover:text-[var(--text)]"
                 }`
              }
            >
              <Icon size={20} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="text-sm font-medium whitespace-nowrap"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>

              {collapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 rounded-lg text-xs
                                font-medium whitespace-nowrap opacity-0 group-hover:opacity-100
                                pointer-events-none transition-opacity z-50"
                     style={{
                       backgroundColor: "var(--card)",
                       color:           "var(--text)",
                       border:          "1px solid var(--border)",
                     }}>
                  {label}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="p-3 border-t flex-shrink-0"
             style={{ borderColor: "var(--border)" }}>
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40
                            flex items-center justify-center flex-shrink-0">
              <span className="text-accent text-xs font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </span>
            </div>
            <AnimatePresence>
              {!collapsed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-semibold truncate"
                     style={{ color: "var(--text)" }}>
                    {user?.name}
                  </p>
                  <p className="text-xs capitalize"
                     style={{ color: "var(--text-muted)" }}>
                    {user?.role}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            <button
              onClick={handleLogout}
              className="w-7 h-7 flex items-center justify-center rounded-lg
                         text-red-400 hover:bg-red-500/10 transition-all flex-shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-20 w-6 h-6 rounded-full border
                     flex items-center justify-center z-50 transition-all
                     hover:border-accent hover:text-accent"
          style={{
            backgroundColor: "var(--surface)",
            borderColor:     "var(--border)",
            color:           "var(--text-muted)",
          }}
        >
          {collapsed
            ? <ChevronRight size={12} />
            : <ChevronLeft  size={12} />
          }
        </button>
      </motion.aside>

      {/* ── Main content ─────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}