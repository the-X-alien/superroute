import { useState, useCallback } from "react"
import { fetchOSRM, haversineKm } from "@/lib/mapbox"
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
        const OSRM_DRIVING_TIMEOUT = 5000
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), OSRM_DRIVING_TIMEOUT)

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

        const distKm = drivingData.distance / 1000
        const region = getRegionForCoords(origin[1], origin[0])
        const providers: ProviderOption[] = []

        const rid = Math.random() * 10000
        const baseSeconds = drivingData.duration

        // Walking
        const walkDuration = estimateDuration(distKm, 5)
        if (distKm < 20) {
          providers.push({
            id: `walking-${rid}`,
            name: "Walking",
            mode: "walking",
            type: "walking",
            icon: "🚶",
            price: 0,
            priceCurrency: "USD",
            duration: walkDuration,
            distance: drivingData.distance,
            co2: 0,
            co2Saved: 300,
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: 5.0,
            availability: 1,
            details: `${(distKm).toFixed(1)} km walk`,
          })
        }

        // Cycling
        const cycleDuration = estimateDuration(distKm, 15)
        if (distKm < 30) {
          providers.push({
            id: `cycling-${rid}`,
            name: "Cycling",
            mode: "cycling",
            type: "cycling",
            icon: "🚲",
            price: 0,
            priceCurrency: "USD",
            duration: cycleDuration,
            distance: drivingData.distance,
            co2: 0,
            co2Saved: 250,
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: 4.5,
            availability: 0.8,
            details: `${(distKm).toFixed(1)} km ride`,
          })
        }

        // Scooters
        for (const sp of region.providers.filter((p) => p.type === "scooter")) {
          if (distKm > 15) continue
          const s = rid + providers.length
          const price = estimatePrice(sp.basePrice, sp.pricePerKm, distKm, s)
          const dur = estimateDuration(distKm, sp.speedFactor)
          const co2 = estimateCo2(sp.co2PerKm, distKm, s)
          providers.push({
            id: `scooter-${sp.name.toLowerCase().replace(/\s/g, "-")}-${s}`,
            name: sp.name,
            mode: "scooter",
            type: "scooter",
            icon: sp.icon,
            price,
            priceCurrency: "USD",
            duration: dur,
            distance: drivingData.distance,
            co2,
            co2Saved: Math.round(200 - co2),
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: sp.rating,
            availability: 0.7,
            details: `${(distKm).toFixed(1)} km via scooter`,
            vehicleType: "Electric Scooter",
          })
        }

        // Rideshare
        for (const rp of getRideshareProviders()) {
          const s = rid + providers.length
          const price = estimatePrice(rp.basePrice, rp.pricePerKm, distKm, s)
          const dur = estimateDuration(distKm, rp.speedFactor)
          const co2 = estimateCo2(rp.co2PerKm, distKm, s)
          providers.push({
            id: `ride-${rp.name.toLowerCase().replace(/[\s\/]/g, "-")}-${s}`,
            name: rp.name,
            mode: "rideshare",
            type: rp.name,
            icon: rp.icon,
            price,
            priceCurrency: "USD",
            duration: Math.max(dur, Math.round(baseSeconds * 0.8)),
            distance: drivingData.distance,
            co2,
            co2Saved: Math.round(Math.max(0, 200 - co2)),
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: rp.rating,
            availability: 0.85 + Math.random() * 0.15,
            details: `${rp.name} · est. ${price}`,
            vehicleType: rp.name.includes("XL") || rp.name === "Lyft Lux" || rp.name === "Uber Black" ? "Premium Vehicle" : "Standard Sedan",
          })
        }

        // Transit
        for (const tp of region.transit) {
          if (distKm > 100) continue
          const s = rid + providers.length
          const price = estimatePrice(tp.basePrice, tp.pricePerKm, distKm, s)
          const dur = estimateDuration(distKm, tp.speedFactor)
          const co2 = estimateCo2(tp.co2PerKm, distKm, s)
          providers.push({
            id: `transit-${tp.name.toLowerCase().replace(/[\s\/]/g, "-")}-${s}`,
            name: tp.name,
            mode: "transit",
            type: "transit",
            icon: tp.icon,
            price,
            priceCurrency: "USD",
            duration: Math.round(dur * (1 + Math.random() * 0.15)),
            distance: drivingData.distance * 1.1,
            co2,
            co2Saved: Math.round(Math.max(0, 200 - co2)),
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: tp.rating,
            availability: 0.7 + Math.random() * 0.2,
            details: `${tp.name} · $${price.toFixed(2)}`,
            vehicleType: "Public Transit",
          })
        }

        // Taxi
        for (const tx of region.taxis) {
          const s = rid + providers.length
          const price = estimatePrice(tx.basePrice, tx.pricePerKm, distKm, s)
          const dur = estimateDuration(distKm, tx.speedFactor)
          const co2 = estimateCo2(tx.co2PerKm, distKm, s)
          providers.push({
            id: `taxi-${tx.name.toLowerCase().replace(/[\s\/]/g, "-")}-${s}`,
            name: tx.name,
            mode: "taxi",
            type: "taxi",
            icon: tx.icon,
            price,
            priceCurrency: "USD",
            duration: Math.max(dur, Math.round(baseSeconds * 0.85)),
            distance: drivingData.distance,
            co2,
            co2Saved: Math.round(Math.max(0, 200 - co2)),
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: tx.rating,
            availability: 0.8 + Math.random() * 0.15,
            details: `${tx.name} · est. $${price.toFixed(2)}`,
            vehicleType: "Taxi",
          })
        }

        // Car Rental
        for (const cr of region.carRentals) {
          const s = rid + providers.length
          const price = estimatePrice(cr.basePrice, cr.pricePerKm, distKm, s)
          const dur = estimateDuration(distKm, cr.speedFactor)
          const co2 = estimateCo2(cr.co2PerKm, distKm, s)
          providers.push({
            id: `car-${cr.name.toLowerCase().replace(/[\s\/]/g, "-")}-${s}`,
            name: `${cr.name} Rental`,
            mode: "car_rental",
            type: "car_rental",
            icon: cr.icon,
            price,
            priceCurrency: "USD",
            duration: Math.max(dur, Math.round(baseSeconds * 0.85)),
            distance: drivingData.distance,
            co2,
            co2Saved: Math.round(Math.max(0, 200 - co2)),
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: cr.rating,
            availability: 0.4 + Math.random() * 0.3,
            details: `${cr.name} · $${price.toFixed(2)} / day`,
            vehicleType: "Rental Car",
            bookingUrl: "#",
          })
        }

        // Flights
        const flightProviders = generateFlightOptions(origin, destination, region, 20)

        const minPrice = Math.min(...providers.map((p) => p.price))
        const maxPrice = Math.max(...providers.map((p) => p.price))
        const minDur = Math.min(...providers.map((p) => p.duration))
        const maxDur = Math.max(...providers.map((p) => p.duration))
        const minCo2 = Math.min(...providers.map((p) => p.co2))
        const maxCo2 = Math.max(...providers.map((p) => p.co2))

        const scored = providers.map((p) => {
          const sc = computeProviderScore(p, minPrice, maxPrice, minDur, maxDur, minCo2, maxCo2, prefs)
          return { ...p, score: sc.total, scoreBreakdown: sc }
        })

        const fMinPrice = flightProviders.length ? Math.min(...flightProviders.map((p) => p.price)) : 0
        const fMaxPrice = flightProviders.length ? Math.max(...flightProviders.map((p) => p.price)) : 0
        const fMinDur = flightProviders.length ? Math.min(...flightProviders.map((p) => p.duration)) : 0
        const fMaxDur = flightProviders.length ? Math.max(...flightProviders.map((p) => p.duration)) : 0
        const fMinCo2 = flightProviders.length ? Math.min(...flightProviders.map((p) => p.co2)) : 0
        const fMaxCo2 = flightProviders.length ? Math.max(...flightProviders.map((p) => p.co2)) : 0

        const fScored = flightProviders.map((p) => {
          const sc = computeProviderScore(
            p,
            fMinPrice, fMaxPrice,
            fMinDur, fMaxDur,
            fMinCo2, fMaxCo2,
            { speed: prefs.speed + 30, cost: prefs.cost - 10, eco: prefs.eco - 10 },
          )
          return { ...p, score: sc.total, scoreBreakdown: sc }
        })

        fScored.sort((a, b) => b.score - a.score)
        scored.sort((a, b) => b.score - a.score)

        const allProviders = [...scored, ...fScored]
        allProviders.sort((a, b) => b.score - a.score)

        setResult({
          allProviders,
          groundProviders: scored,
          flightProviders: fScored,
          bestOverall: allProviders[0] || null,
          bestGround: scored[0] || null,
          bestFlight: fScored[0] || null,
        })
      } catch (e) {
        setError("Could not find routes. Please try again.")
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return { result, loading, error, findRoutes, previousOrigin, previousDest }
}
