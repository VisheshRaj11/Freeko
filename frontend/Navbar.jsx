import { useState, useEffect } from "react"
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import {
  Menu, X, Zap, LogOut,
  LayoutDashboard, ChevronRight,
  Brain, Dumbbell, BarChart3, MessageSquare
} from "lucide-react"
import { useAuthStore } from "./store/authStore"

const NAV_LINKS = [
  { label: "Home",     href: "/"          },
  { label: "Features", href: "#features"  },
  { label: "How it Works", href: "#how"   },
  // { label: "Exercise", href: "#exercise"  },
]

const DRAWER_FEATURES = [
  { icon: Brain,         label: "AI Plan Builder",     href: "#features" },
  { icon: Zap,           label: "Anomaly Detective",   href: "#features" },
  { icon: BarChart3,     label: "Weekly Reports",      href: "#features" },
  { icon: MessageSquare, label: "Coach Chat",          href: "#how"      },
]

export default function Navbar() {
  const [scrolled,   setScrolled]   = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { user, token, logout }     = useAuthStore()
  const navigate                    = useNavigate()
  const location                    = useLocation()
  const isLanding                   = location.pathname === "/"

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [drawerOpen])

  const handleLogout = () => {
    logout(); navigate("/"); setDrawerOpen(false)
  }

  return (
    <>
      <motion.header
        initial={{ y: -72, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-300
          ${scrolled ? "glass-nav" : "bg-transparent"}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8
                        h-16 flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group cursor-pointer">
            <motion.div
              whileHover={{ rotate: 15, scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className="w-8 h-8 rounded-lg bg-green flex items-center
                         justify-center glow-green"
              style={{ boxShadow: "0 0 16px rgba(57,255,20,0.5)" }}
            >
              {/* <Zap size={16} color="#080808" fill="#080808" /> */}
              <img src="./logo.png" className="rounded" alt="" />
            </motion.div>
            <span className="font-display font-800 text-2xl tracking-tight uppercase"
                  style={{ color: "var(--text)", letterSpacing: "0.04em" }}>
              Free<span className="text-green">ko</span>
            </span>
          </Link>

          {/* Desktop links */}
          {isLanding && (
            <nav className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium rounded-lg
                             transition-all duration-200 hover:text-green
                             hover:bg-white/5"
                  style={{ color: "var(--text-muted)" }}
                >
                  {link.label}
                </a>
              ))}
            </nav>
          )}

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-3">
            {token ? (
              <>
                <Link
                  to={user?.role === "coach" ? "/coach" : "/athlete"}
                  className="flex items-center gap-2 px-4 py-2 text-sm btn-glass"
                >
                  <LayoutDashboard size={15} />
                  Dashboard
                </Link>
                <button onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm
                                   rounded-lg font-semibold text-red-400
                                   hover:bg-red-500/10 border border-red-500/20
                                   hover:border-red-500/40 transition-all">
                  <LogOut size={15} /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login"
                      className="px-5 py-2 text-sm btn-glass">
                  Sign in
                </Link>
                <Link to="/register"
                      className="px-5 py-2 text-sm btn-green">
                  Get Started →
                </Link>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="md:hidden w-10 h-10 flex items-center justify-center
                       rounded-lg glass-card border border-white/10
                       hover:border-green/50 transition-all"
            style={{ color: "var(--text)" }}
          >
            <Menu size={20} />
          </button>
        </div>
      </motion.header>

      {/* Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              key="bd"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 md:hidden"
              style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
            />

           <motion.aside
  key="drawer"
  initial={{ x: "-100%" }}
  animate={{ x: 0 }}
  exit={{ x: "-100%" }}
  transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
  className="fixed top-0 left-0 bottom-0 z-50 w-72 md:hidden
             flex flex-col overflow-hidden glass-nav"
>

  {/* Header */}

  <div className="flex items-center justify-between px-4 py-5">

    <div className="flex items-center gap-2">

      <div
        className="w-8 h-8 rounded-lg bg-green flex
                   items-center justify-center"
      >

        <img
          src="./logo.png"
          className="rounded"
          alt=""
        />

      </div>

      <span
        className="font-display font-800 text-2xl uppercase"
        style={{
          color:"var(--text)"
        }}
      >

        Free

        <span className="text-green">

          ko

        </span>

      </span>

    </div>

    <button

      onClick={() => setDrawerOpen(false)}

      className="w-10 h-10 rounded-lg

                 flex items-center

                 justify-center

                 hover:bg-white/5"

    >

      <X size={20} />

    </button>

  </div>


  <div

    className="flex-1 overflow-y-auto

               px-4 pb-6

               flex flex-col"

  >

    {/* Landing links */}

    {isLanding && (

      <div className="mb-5">

        {NAV_LINKS.map(

          (link, i) => (

            <motion.div

              key={link.label}

              initial={{

                opacity:0,

                x:-16

              }}

              animate={{

                opacity:1,

                x:0

              }}

              transition={{

                delay:0.05*i

              }}

            >

              <a

                href={link.href}

                onClick={() =>

                  setDrawerOpen(false)

                }

                className="flex items-center

                           justify-between

                           px-3 py-3

                           rounded-lg

                           text-sm

                           font-medium

                           hover:bg-white/5

                           hover:text-green

                           group"

                style={{

                  color:"var(--text-muted)"

                }}

              >

                {link.label}

                <ChevronRight

                  size={14}

                  className="opacity-0

                            group-hover:opacity-100

                            transition-opacity

                            text-green"

                />

              </a>

            </motion.div>

          )

        )}

      </div>

    )}

    {/* Account section */}

    <div

      className="mt-auto

                 pt-5

                 border-t"

      style={{

        borderColor:

        "rgba(255,255,255,0.08)"

      }}

    >

      {token ? (

        <div

          className="flex flex-col gap-3"

        >

          <Link

            to={

              user?.role === "coach"

              ? "/coach"

              : "/athlete"

            }

            onClick={() =>

              setDrawerOpen(false)

            }

            className="flex items-center

                       gap-3

                       px-4 py-3

                       rounded-xl

                       btn-glass"

          >

            <LayoutDashboard

              size={18}

            />

            Dashboard

          </Link>


          <button

            onClick={handleLogout}

            className="flex items-center

                       gap-3

                       px-4 py-3

                       rounded-xl

                       font-semibold

                       border

                       transition-all

                       hover:bg-red-500/10"

            style={{

              color:"#ef4444",

              borderColor:

              "rgba(239,68,68,0.25)"

            }}

          >

            <LogOut size={18} />

            Logout

          </button>

        </div>

      ) : (

        <div

          className="flex flex-col gap-3"

        >

          <Link

            to="/login"

            onClick={() =>

              setDrawerOpen(false)

            }

            className="w-full

                       px-4 py-3

                       text-center

                       btn-glass"

          >

            Sign In

          </Link>


          <Link

            to="/register"

            onClick={() =>

              setDrawerOpen(false)

            }

            className="w-full

                       px-4 py-3

                       text-center

                       btn-green"

          >

            Get Started →

          </Link>

        </div>

      )}

    </div>

  </div>

</motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}