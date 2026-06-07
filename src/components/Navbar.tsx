"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { LogIn, User, Menu, X } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import AuthModal from "./AuthModal"

const links = [
  { to: "/", label: "Home" },
  { to: "/planner", label: "Planner" },
  { to: "/trips", label: "Trips" },
  { to: "/profile", label: "Profile" },
]

export default function Navbar() {
  const { user, loading } = useAuth()
  const location = useLocation()
  const [authOpen, setAuthOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 py-3 glass-light">
        <Link to="/" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color: "hsl(30 10% 4%)" }}>SR</span>
          </div>
          <span className="font-display text-lg text-[var(--color-foreground)]" style={{ letterSpacing: "-0.5px" }}>SuperRoute</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--color-muted-foreground)]">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`hover:text-[var(--color-foreground)] transition-colors ${location.pathname === l.to ? "text-[var(--color-foreground)]" : ""}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setAuthOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-all"
          >
            {loading ? (
              <span className="w-5 h-5 rounded-full border-2 border-[var(--color-muted-foreground)] border-t-transparent animate-spin" />
            ) : user ? (
              <>
                {user.user_metadata?.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="" className="w-6 h-6 rounded-full" />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="hidden md:inline">{user.user_metadata?.full_name || user.email?.split("@")[0] || "Account"}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span className="hidden md:inline">Sign In</span>
              </>
            )}
          </button>

          <button
            className="md:hidden text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="fixed top-14 left-0 right-0 z-40 glass-strong md:hidden">
          <nav className="flex flex-col p-4 gap-2 text-sm">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMobileOpen(false)}
                className={`px-4 py-3 rounded-lg transition-colors ${location.pathname === l.to ? "bg-[var(--color-muted)] text-[var(--color-foreground)]" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]"}`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}
