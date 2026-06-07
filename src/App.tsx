"use client"

import { useEffect, useState } from "react"
import { useSmoothScroll } from "@/hooks/useSmoothScroll"
import { useRouteEngine } from "@/hooks/useRouteEngine"
import { AuthProvider, useAuth } from "@/contexts/AuthContext"
import Hero from "@/components/Hero"
import RoutePlanner from "@/components/RoutePlanner"
import Gamification from "@/components/Gamification"
import CollaborativeTrips from "@/components/CollaborativeTrips"
import Footer from "@/components/Footer"
import AuthModal from "@/components/AuthModal"
import { syncOfflineData } from "@/lib/db"
import { LogIn, User } from "lucide-react"

function Navbar() {
  const [authOpen, setAuthOpen] = useState(false)
  const { user, loading } = useAuth()

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-light">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color: "hsl(30 10% 4%)" }}>SR</span>
          </div>
          <span className="font-display text-lg text-[var(--color-foreground)]" style={{ letterSpacing: "-0.5px" }}>SuperRoute</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--color-muted-foreground)]">
          <a href="#route-planner" className="hover:text-[var(--color-foreground)] transition-colors">Plan</a>
          <a href="#gamification" className="hover:text-[var(--color-foreground)] transition-colors">Leaderboard</a>
          <a href="#" className="hover:text-[var(--color-foreground)] transition-colors">Trips</a>
        </nav>
        <button
          onClick={() => setAuthOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-all"
        >
          {loading ? (
            <span className="w-5 h-5 rounded-full border-2 border-[var(--color-muted-foreground)] border-t-transparent animate-spin" />
          ) : user ? (
            <>
              {user.photoURL ? (
                <img src={user.photoURL} alt="" className="w-6 h-6 rounded-full" />
              ) : (
                <User className="w-4 h-4" />
              )}
              <span className="hidden md:inline">{user.displayName || "Account"}</span>
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span className="hidden md:inline">Sign In</span>
            </>
          )}
        </button>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  )
}

function AppContent() {
  useSmoothScroll()
  const { result, loading, error, findRoutes } = useRouteEngine()

  useEffect(() => {
    const handleOnline = () => { syncOfflineData() }
    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [])

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <Navbar />

      <Hero />
      <RoutePlanner
        result={result}
        loading={loading}
        error={error}
        onFindRoutes={findRoutes}
      />
      <Gamification />
      <CollaborativeTrips />
      <Footer />
    </main>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
