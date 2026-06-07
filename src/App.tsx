"use client"

import { useSmoothScroll } from "@/hooks/useSmoothScroll"
import { useRouteEngine } from "@/hooks/useRouteEngine"
import Hero from "@/components/Hero"
import RoutePlanner from "@/components/RoutePlanner"
import Gamification from "@/components/Gamification"
import CollaborativeTrips from "@/components/CollaborativeTrips"
import Footer from "@/components/Footer"
import { syncOfflineData } from "@/lib/db"
import { useEffect } from "react"

export default function App() {
  useSmoothScroll()
  const { routes, bestRoute, loading, findRoutes } = useRouteEngine()

  useEffect(() => {
    const handleOnline = () => { syncOfflineData() }
    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [])

  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-light">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full cyan-gradient flex items-center justify-center">
            <span className="text-xs font-bold text-black">SR</span>
          </div>
          <span className="font-display font-semibold text-lg">SuperRoute</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-[var(--color-muted-foreground)]">
          <a href="#route-planner" className="hover:text-[var(--color-foreground)] transition-colors">Plan</a>
          <a href="#" className="hover:text-[var(--color-foreground)] transition-colors">Leaderboard</a>
          <a href="#" className="hover:text-[var(--color-foreground)] transition-colors">Trips</a>
        </nav>
      </div>

      <Hero />
      <RoutePlanner
        onFindRoutes={findRoutes}
        routes={routes}
        bestRoute={bestRoute}
        loading={loading}
      />
      <Gamification />
      <CollaborativeTrips />
      <Footer />
    </main>
  )
}
