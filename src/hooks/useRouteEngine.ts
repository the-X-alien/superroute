import { useState, useCallback } from "react"
import { fetchOSRM, haversineKm } from "@/lib/routing"
import {
  getRideshareProviders,
  getRegionForCoords,
  generateFlightOptions,
  computeProviderScore,
  estimatePrice,
  estimateCo2,
  estimateDuration,
  type ProviderOption,
  type TransportMode,
} from "@/lib/providers"

export interface RoutePreferences {
  speed: number
  cost: number
  eco: number
}

export interface ComparisonResult {
  allProviders: ProviderOption[]
  groundProviders: ProviderOption[]
  flightProviders: ProviderOption[]
  bestOverall: ProviderOption | null
  bestGround: ProviderOption | null
  bestFlight: ProviderOption | null
}

export function useRouteEngine() {
  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [previousOrigin, setPreviousOrigin] = useState<string>("")
  const [previousDest, setPreviousDest] = useState<string>("")
  const [prefs, setPrefs] = useState<RoutePreferences>({ speed: 50, cost: 50, eco: 50 })

  const findRoutes = useCallback(
    async (
      originName: string,
      destinationName: string,
      origin: [number, number],
      destination: [number, number],
      prefs: RoutePreferences,
    ) => {
      setLoading(true)
      setError(null)
      setPreviousOrigin(originName)
      setPreviousDest(destinationName)

      try {
        let drivingData = await fetchOSRM(origin, destination, "driving")

        if (!drivingData || !drivingData.distance) {
          const fallbackDist = haversineKm(origin, destination) * 1000
          drivingData = {
            distance: fallbackDist,
            duration: (fallbackDist / 1000) * 120,
            geometry: [origin, destination],
            steps: [{ instruction: "Drive to destination", distance: fallbackDist, duration: (fallbackDist / 1000) * 120, name: "" }],
          }
        }

        const distKm = Math.max(1, drivingData.distance / 1000)
        const region = getRegionForCoords(origin[1], origin[0])
        const providers: ProviderOption[] = []

        const rid = Math.random() * 10000
        const baseSeconds = drivingData.duration

        const addWalk = distKm < 20
        const addCycle = distKm < 30

        if (addWalk) {
          providers.push({
            id: `walking-${rid}`,
            name: "Walking",
            mode: "walking",
            type: "walking",
            icon: "🚶",
            price: 0,
            priceCurrency: "USD",
            duration: estimateDuration(distKm, 5),
            distance: drivingData.distance,
            co2: 0,
            co2Saved: 300,
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: 5.0,
            availability: 1,
            details: `${distKm.toFixed(1)} km walk`,
          })
        }

        if (addCycle) {
          providers.push({
            id: `cycling-${rid}`,
            name: "Cycling",
            mode: "cycling",
            type: "cycling",
            icon: "🚲",
            price: 0,
            priceCurrency: "USD",
            duration: estimateDuration(distKm, 15),
            distance: drivingData.distance,
            co2: 0,
            co2Saved: 250,
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: 4.5,
            availability: 0.8,
            details: `${distKm.toFixed(1)} km ride`,
          })
        }

        for (const sp of region.providers.filter((p) => p.type === "scooter")) {
          if (distKm > 15) continue
          const s = rid + providers.length
          providers.push({
            id: `scooter-${sp.name.toLowerCase().replace(/\s/g, "-")}-${s}`,
            name: sp.name,
            mode: "scooter",
            type: "scooter",
            icon: sp.icon,
            price: estimatePrice(sp.basePrice, sp.pricePerKm, distKm, s),
            priceCurrency: "USD",
            duration: estimateDuration(distKm, sp.speedFactor),
            distance: drivingData.distance,
            co2: estimateCo2(sp.co2PerKm, distKm, s),
            co2Saved: Math.round(200 - estimateCo2(sp.co2PerKm, distKm, s)),
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: sp.rating,
            availability: 0.7,
            details: `${distKm.toFixed(1)} km via scooter`,
            vehicleType: "Electric Scooter",
          })
        }

        for (const rp of getRideshareProviders()) {
          const s = rid + providers.length
          const price = estimatePrice(rp.basePrice, rp.pricePerKm, distKm, s)
          const co2 = estimateCo2(rp.co2PerKm, distKm, s)
          providers.push({
            id: `ride-${rp.name.toLowerCase().replace(/[\s\/]/g, "-")}-${s}`,
            name: rp.name,
            mode: "rideshare",
            type: rp.name,
            icon: rp.icon,
            price,
            priceCurrency: "USD",
            duration: Math.max(estimateDuration(distKm, rp.speedFactor), Math.round(baseSeconds * 0.8)),
            distance: drivingData.distance,
            co2,
            co2Saved: Math.round(Math.max(0, 200 - co2)),
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: rp.rating,
            availability: 0.85 + (rid / 10000) * 0.15,
            details: `${rp.name} · est. $${price.toFixed(2)}`,
            vehicleType: rp.name.includes("XL") || rp.name === "Lyft Lux" || rp.name === "Uber Black" ? "Premium Vehicle" : "Standard Sedan",
          })
        }

        for (const tp of region.transit) {
          if (distKm > 100) continue
          const s = rid + providers.length
          const price = estimatePrice(tp.basePrice, tp.pricePerKm, distKm, s)
          const co2 = estimateCo2(tp.co2PerKm, distKm, s)
          providers.push({
            id: `transit-${tp.name.toLowerCase().replace(/[\s\/]/g, "-")}-${s}`,
            name: tp.name,
            mode: "transit",
            type: "transit",
            icon: tp.icon,
            price,
            priceCurrency: "USD",
            duration: Math.round(estimateDuration(distKm, tp.speedFactor) * (1 + (rid / 10000) * 0.15)),
            distance: drivingData.distance * 1.1,
            co2,
            co2Saved: Math.round(Math.max(0, 200 - co2)),
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: tp.rating,
            availability: 0.7 + (rid / 10000) * 0.2,
            details: `${tp.name} · $${price.toFixed(2)}`,
            vehicleType: "Public Transit",
          })
        }

        for (const tx of region.taxis) {
          const s = rid + providers.length
          const price = estimatePrice(tx.basePrice, tx.pricePerKm, distKm, s)
          const co2 = estimateCo2(tx.co2PerKm, distKm, s)
          providers.push({
            id: `taxi-${tx.name.toLowerCase().replace(/[\s\/]/g, "-")}-${s}`,
            name: tx.name,
            mode: "taxi",
            type: "taxi",
            icon: tx.icon,
            price,
            priceCurrency: "USD",
            duration: Math.max(estimateDuration(distKm, tx.speedFactor), Math.round(baseSeconds * 0.85)),
            distance: drivingData.distance,
            co2,
            co2Saved: Math.round(Math.max(0, 200 - co2)),
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: tx.rating,
            availability: 0.8 + (rid / 10000) * 0.15,
            details: `${tx.name} · est. $${price.toFixed(2)}`,
            vehicleType: "Taxi",
          })
        }

        for (const cr of region.carRentals) {
          const s = rid + providers.length
          const price = estimatePrice(cr.basePrice, cr.pricePerKm, distKm, s)
          const co2 = estimateCo2(cr.co2PerKm, distKm, s)
          providers.push({
            id: `car-${cr.name.toLowerCase().replace(/[\s\/]/g, "-")}-${s}`,
            name: `${cr.name} Rental`,
            mode: "car_rental",
            type: "car_rental",
            icon: cr.icon,
            price,
            priceCurrency: "USD",
            duration: Math.max(estimateDuration(distKm, cr.speedFactor), Math.round(baseSeconds * 0.85)),
            distance: drivingData.distance,
            co2,
            co2Saved: Math.round(Math.max(0, 200 - co2)),
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: cr.rating,
            availability: 0.4 + (rid / 10000) * 0.3,
            details: `${cr.name} · $${price.toFixed(2)} / day`,
            vehicleType: "Rental Car",
            bookingUrl: "#",
          })
        }

        const flightProviders = distKm >= 200 ? generateFlightOptions(origin, destination, region, 20) : []

        const pMin = (arr: ProviderOption[], k: "price" | "duration" | "co2") =>
          arr.length ? Math.min(...arr.map((x) => x[k])) : 0
        const pMax = (arr: ProviderOption[], k: "price" | "duration" | "co2") =>
          arr.length ? Math.max(...arr.map((x) => x[k])) : 0

        const scored = providers.map((p) => {
          const sc = computeProviderScore(p, pMin(providers, "price"), pMax(providers, "price"), pMin(providers, "duration"), pMax(providers, "duration"), pMin(providers, "co2"), pMax(providers, "co2"), prefs)
          return { ...p, score: sc.total, scoreBreakdown: sc }
        })

        const fScored = flightProviders.map((p) => {
          const sc = computeProviderScore(p, pMin(flightProviders, "price"), pMax(flightProviders, "price"), pMin(flightProviders, "duration"), pMax(flightProviders, "duration"), pMin(flightProviders, "co2"), pMax(flightProviders, "co2"), { speed: Math.min(100, prefs.speed + 30), cost: Math.max(0, prefs.cost - 10), eco: Math.max(0, prefs.eco - 10) })
          return { ...p, score: sc.total, scoreBreakdown: sc }
        })

        fScored.sort((a, b) => b.score - a.score)
        scored.sort((a, b) => b.score - a.score)
        const allProviders = [...scored, ...fScored].sort((a, b) => b.score - a.score)

        setResult({
          allProviders,
          groundProviders: scored,
          flightProviders: fScored,
          bestOverall: allProviders[0] || null,
          bestGround: scored[0] || null,
          bestFlight: fScored[0] || null,
        })
      } catch (e) {
        setError(`Could not find routes: ${e instanceof Error ? e.message : "Unknown error"}. Please try again.`)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { result, loading, error, findRoutes, previousOrigin, previousDest, prefs, setPrefs }
}
