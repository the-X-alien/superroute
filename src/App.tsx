"use client"

import { useEffect } from "react"
import { useSmoothScroll } from "@/hooks/useSmoothScroll"
import { useRouteEngine } from "@/hooks/useRouteEngine"
import Hero from "@/components/Hero"
import RoutePlanner from "@/components/RoutePlanner"
import Gamification from "@/components/Gamification"
import CollaborativeTrips from "@/components/CollaborativeTrips"
import Footer from "@/components/Footer"
import { syncOfflineData } from "@/lib/db"

export default function App() {
  useSmoothScroll()
  const { result, loading, error, findRoutes } = useRouteEngine()

  useEffect(() => {
    const handleOnline = () => { syncOfflineData() }
    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [])

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-light">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center">
            <span className="text-xs font-bold" style={{ color: "hsl(30 10% 4%)" }}>SR</span>
          </div>
          <span className="font-display text-lg text-[var(--color-foreground)]" style={{ letterSpacing: "-0.5px" }}>SuperRoute</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--color-muted-foreground)]">
          <a href="#route-planner" className="hover:text-[var(--color-foreground)] transition-colors">Plan</a>
          <a href="#" className="hover:text-[var(--color-foreground)] transition-colors">Leaderboard</a>
          <a href="#" className="hover:text-[var(--color-foreground)] transition-colors">Trips</a>
        </nav>
      </div>

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
