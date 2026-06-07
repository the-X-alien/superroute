import { useState, useCallback } from "react"
import { fetchOSRM, haversineKm } from "@/lib/routing"
import {
  getRegionForCoords,
  computeProviderScore,
  estimatePrice,
  estimateCo2,
  estimateDuration,
  type ProviderOption,
} from "@/lib/providers"
import {
  getLyftEstimates,
  getUberEstimates,
  getFlightOffers,
  getTransitAgenciesByLocation,
  getCarRentalOffers,
} from "@/lib/leaf"

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
        const region = await getRegionForCoords(origin[1], origin[0])
        const providers: ProviderOption[] = []

        const rid = Math.random() * 10000
        const baseSeconds = drivingData.duration

        // 1. Walking & Cycling
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
            origin,
            destination,
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
            origin,
            destination,
          })
        }

        // 2. Rideshare
        const [lyftEstimates, uberEstimates] = await Promise.all([
          getLyftEstimates(origin[1], origin[0], destination[1], destination[0]),
          getUberEstimates(origin[1], origin[0], destination[1], destination[0])
        ])

        lyftEstimates.forEach((est, i) => {
          providers.push({
            id: `lyft-${i}-${rid}`,
            name: est.displayName,
            mode: "rideshare",
            type: "Lyft",
            icon: "🚕",
            price: est.price,
            priceCurrency: "USD",
            duration: est.duration,
            distance: est.distance,
            co2: estimateCo2(160, est.distance / 1000, i),
            co2Saved: 40,
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: 4.5,
            availability: 0.9,
            details: `Lyft · ${est.displayName}`,
            origin,
            destination,
          })
        })

        uberEstimates.forEach((est, i) => {
          providers.push({
            id: `uber-${i}-${rid}`,
            name: est.displayName,
            mode: "rideshare",
            type: "Uber",
            icon: "🚕",
            price: est.price,
            priceCurrency: "USD",
            duration: est.duration,
            distance: est.distance,
            co2: estimateCo2(170, est.distance / 1000, i),
            co2Saved: 30,
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: 4.6,
            availability: 0.95,
            details: `Uber · ${est.displayName}`,
            origin,
            destination,
          })
        })

        // 3. Transit (only for distances < 200km)
        if (distKm < 200) {
          const transitAgencies = await getTransitAgenciesByLocation(origin[1], origin[0])
          transitAgencies.slice(0, 3).forEach((agency, i) => {
            const s = rid + i
            providers.push({
              id: `transit-${agency.onestopId}-${s}`,
              name: agency.name,
              mode: "transit",
              type: "transit",
              icon: "🚌",
              price: 2.50,
              priceCurrency: "USD",
              duration: Math.round(baseSeconds * 1.5),
              distance: drivingData.distance * 1.1,
              co2: 30,
              co2Saved: 170,
              score: 0,
              scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
              rating: 4.0,
              availability: 0.8,
              details: `Transit via ${agency.name}`,
              origin,
              destination,
            })
          })
        }

        // 4. Car Rental (only for distances < 500km)
        if (distKm < 500) {
          const carRentals = await getCarRentalOffers(origin[1], origin[0], new Date().toISOString(), new Date(Date.now() + 86400000).toISOString())
          carRentals.forEach((rental, i) => {
            providers.push({
              id: `car-rental-${i}-${rid}`,
              name: rental.company,
              mode: "car_rental",
              type: "car_rental",
              icon: "🚗",
              price: rental.price,
              priceCurrency: "USD",
              duration: baseSeconds,
              distance: drivingData.distance,
              co2: 160,
              co2Saved: 40,
              score: 0,
              scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
              rating: 4.2,
              availability: 0.7,
              details: `${rental.carName} from ${rental.company}`,
              bookingUrl: rental.bookingUrl,
              origin,
              destination,
            })
          })
        }

        // 5. Flights
        let flightProviders: ProviderOption[] = []
        if (distKm >= 300) {
          const originAirport = region.airports[0]?.code || "SFO"
          const destRegion = await getRegionForCoords(destination[1], destination[0])
          const destAirport = destRegion.airports[0]?.code || "LAX"
          
          const flightOffers = await getFlightOffers(originAirport, destAirport, new Date(Date.now() + 86400000).toISOString().split('T')[0])
          flightProviders = flightOffers.map((offer) => ({
            id: `flight-${offer.id}`,
            name: offer.airlineName,
            mode: "flight",
            type: "flight",
            icon: "✈️",
            price: offer.price,
            priceCurrency: offer.currency,
            duration: 3600 * 2,
            distance: haversineKm(origin, destination) * 1000,
            co2: 250,
            co2Saved: -50,
            score: 0,
            scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
            rating: 4.5,
            availability: 1,
            details: `${offer.airlineName} · ${offer.stops === 0 ? "Non-stop" : offer.stops + " stops"}`,
            bookingUrl: offer.bookingUrl,
            origin,
            destination,
          }))
        }

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