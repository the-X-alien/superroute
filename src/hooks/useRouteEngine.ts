import { useState, useCallback } from "react"
import { generateMockRoute, type RouteResponse } from "@/lib/mapbox"

export interface RoutePreferences {
  speed: number
  cost: number
  eco: number
}

export interface RouteScore {
  total: number
  speed: number
  cost: number
  eco: number
  enjoyability: number
}

export interface RouteOption {
  id: string
  mode: "walking" | "cycling" | "transit" | "rideshare" | "scooter"
  label: string
  icon: string
  route: RouteResponse
  score: RouteScore
  co2Saved: number
}

function computeScore(
  duration: number,
  distance: number,
  prefs: RoutePreferences,
): RouteScore {
  const speedScore = prefs.speed * 90 + Math.random() * 10
  const costScore = (1 - prefs.cost) * 80 + Math.random() * 20
  const ecoScore = prefs.eco * 85 + Math.random() * 15
  const enjoyability = Math.random() * 40 + 60
  const total = Math.round(
    (speedScore * prefs.speed +
      costScore * (1 - prefs.cost) +
      ecoScore * prefs.eco +
      enjoyability * 0.3) /
      (prefs.speed + (1 - prefs.cost) + prefs.eco + 0.3),
  )
  return {
    total: Math.min(100, total),
    speed: Math.round(speedScore),
    cost: Math.round(costScore),
    eco: Math.round(ecoScore),
    enjoyability: Math.round(enjoyability),
  }
}

const modes: Array<{ mode: RouteOption["mode"]; label: string; icon: string }> = [
  { mode: "walking", label: "Walking", icon: "🚶" },
  { mode: "cycling", label: "Cycling", icon: "🚲" },
  { mode: "transit", label: "Public Transit", icon: "🚌" },
  { mode: "rideshare", label: "Rideshare", icon: "🚗" },
  { mode: "scooter", label: "Scooter", icon: "🛴" },
]

export function useRouteEngine() {
  const [routes, setRoutes] = useState<RouteOption[]>([])
  const [bestRoute, setBestRoute] = useState<RouteOption | null>(null)
  const [loading, setLoading] = useState(false)

  const findRoutes = useCallback(
    (origin: [number, number], destination: [number, number], prefs: RoutePreferences) => {
      setLoading(true)

      setTimeout(() => {
        const results: RouteOption[] = modes.map((m) => {
          const route = generateMockRoute(origin, destination, prefs.speed, prefs.cost, prefs.eco)
          const score = computeScore(route.duration, route.distance, prefs)
          const co2Saved = m.mode === "walking" || m.mode === "cycling"
            ? Math.round(Math.random() * 3000 + 500)
            : Math.round(Math.random() * 500)
          return {
            id: `${m.mode}-${Date.now()}`,
            mode: m.mode,
            label: m.label,
            icon: m.icon,
            route,
            score,
            co2Saved,
          }
        })

        results.sort((a, b) => b.score.total - a.score.total)
        setRoutes(results)
        setBestRoute(results[0])
        setLoading(false)
      }, 1500)
    },
    [],
  )

  return { routes, bestRoute, loading, findRoutes }
}
