export type TransportMode = "walking" | "cycling" | "transit" | "rideshare" | "taxi" | "car_rental" | "scooter" | "flight"

export interface ProviderOption {
  id: string
  name: string
  mode: TransportMode
  type: string
  icon: string
  price: number
  priceCurrency: string
  duration: number
  distance: number
  co2: number
  co2Saved: number
  score: number
  scoreBreakdown: { speed: number; cost: number; eco: number; convenience: number }
  rating: number
  availability: number
  details: string
  vehicleType?: string
  departureTime?: string
  arrivalTime?: string
  stops?: number
  bookingUrl?: string
}

export interface RegionContext {
  name: string
  country: string
  currency: string
  providers: ProviderTemplate[]
  airports: Array<{ code: string; name: string; lat: number; lng: number }>
  airlines: AirlineTemplate[]
  taxis: ProviderTemplate[]
  carRentals: ProviderTemplate[]
  transit: ProviderTemplate[]
}

interface ProviderTemplate {
  name: string
  type: string
  basePrice: number
  pricePerKm: number
  speedFactor: number
  co2PerKm: number
  rating: number
  icon: string
}

interface AirlineTemplate {
  name: string
  iata: string
  basePrice: number
  pricePerKm: number
  rating: number
  co2PerKm: number
  alliance: string
}

const SILICON_VALLEY: RegionContext = {
  name: "Silicon Valley / Bay Area",
  country: "US",
  currency: "USD",
  providers: [
    { name: "Walking", type: "walking", basePrice: 0, pricePerKm: 0, speedFactor: 5, co2PerKm: 0, rating: 5, icon: "🚶" },
    { name: "Cycling", type: "cycling", basePrice: 0, pricePerKm: 0, speedFactor: 15, co2PerKm: 0, rating: 4.5, icon: "🚲" },
    { name: "Scooter (Lime)", type: "scooter", basePrice: 1, pricePerKm: 0.35, speedFactor: 20, co2PerKm: 5, rating: 4.2, icon: "🛴" },
    { name: "Scooter (Bird)", type: "scooter", basePrice: 1, pricePerKm: 0.39, speedFactor: 20, co2PerKm: 5, rating: 4.0, icon: "🛴" },
  ],
  transit: [
    { name: "VTA Bus", type: "transit", basePrice: 2.50, pricePerKm: 0, speedFactor: 25, co2PerKm: 30, rating: 3.8, icon: "🚌" },
    { name: "VTA Light Rail", type: "transit", basePrice: 2.50, pricePerKm: 0, speedFactor: 30, co2PerKm: 20, rating: 4.0, icon: "🚋" },
    { name: "BART", type: "transit", basePrice: 3.20, pricePerKm: 0.15, speedFactor: 55, co2PerKm: 15, rating: 4.3, icon: "🚇" },
    { name: "Caltrain", type: "transit", basePrice: 3.50, pricePerKm: 0.12, speedFactor: 50, co2PerKm: 18, rating: 4.1, icon: "🚆" },
    { name: "AC Transit", type: "transit", basePrice: 2.25, pricePerKm: 0, speedFactor: 22, co2PerKm: 35, rating: 3.5, icon: "🚌" },
    { name: "SamTrans", type: "transit", basePrice: 2.00, pricePerKm: 0, speedFactor: 24, co2PerKm: 32, rating: 3.6, icon: "🚌" },
    { name: "Muni", type: "transit", basePrice: 2.50, pricePerKm: 0, speedFactor: 20, co2PerKm: 28, rating: 3.4, icon: "🚌" },
  ],
  taxis: [
    { name: "Yellow Cab", type: "taxi", basePrice: 3.50, pricePerKm: 2.20, speedFactor: 40, co2PerKm: 180, rating: 3.8, icon: "🚕" },
    { name: "Green Cab", type: "taxi", basePrice: 3.00, pricePerKm: 2.00, speedFactor: 40, co2PerKm: 170, rating: 3.9, icon: "🚕" },
    { name: "Luxor Cab", type: "taxi", basePrice: 4.00, pricePerKm: 2.50, speedFactor: 42, co2PerKm: 190, rating: 4.1, icon: "🚕" },
  ],
  carRentals: [
    { name: "Enterprise", type: "car_rental", basePrice: 45, pricePerKm: 0.10, speedFactor: 45, co2PerKm: 160, rating: 4.2, icon: "🚗" },
    { name: "Hertz", type: "car_rental", basePrice: 50, pricePerKm: 0.12, speedFactor: 47, co2PerKm: 165, rating: 4.0, icon: "🚗" },
    { name: "Avis", type: "car_rental", basePrice: 48, pricePerKm: 0.11, speedFactor: 46, co2PerKm: 162, rating: 3.9, icon: "🚗" },
    { name: "Budget", type: "car_rental", basePrice: 35, pricePerKm: 0.09, speedFactor: 44, co2PerKm: 158, rating: 3.7, icon: "🚗" },
    { name: "Zipcar", type: "car_rental", basePrice: 12, pricePerKm: 0.15, speedFactor: 45, co2PerKm: 160, rating: 4.1, icon: "🚗" },
  ],
  airports: [
    { code: "SFO", name: "San Francisco International", lat: 37.6213, lng: -122.3790 },
    { code: "SJC", name: "San Jose International", lat: 37.3639, lng: -121.9289 },
    { code: "OAK", name: "Oakland International", lat: 37.7112, lng: -122.2215 },
  ],
  airlines: [
    { name: "Southwest Airlines", iata: "WN", basePrice: 49, pricePerKm: 0.08, rating: 4.2, co2PerKm: 85, alliance: "None" },
    { name: "United Airlines", iata: "UA", basePrice: 59, pricePerKm: 0.10, rating: 4.0, co2PerKm: 88, alliance: "Star Alliance" },
    { name: "Delta Air Lines", iata: "DL", basePrice: 65, pricePerKm: 0.11, rating: 4.3, co2PerKm: 82, alliance: "SkyTeam" },
    { name: "American Airlines", iata: "AA", basePrice: 62, pricePerKm: 0.10, rating: 4.0, co2PerKm: 86, alliance: "oneworld" },
    { name: "Alaska Airlines", iata: "AS", basePrice: 55, pricePerKm: 0.09, rating: 4.4, co2PerKm: 80, alliance: "oneworld" },
    { name: "JetBlue", iata: "B6", basePrice: 45, pricePerKm: 0.07, rating: 4.1, co2PerKm: 78, alliance: "None" },
    { name: "Spirit Airlines", iata: "NK", basePrice: 29, pricePerKm: 0.05, rating: 3.2, co2PerKm: 90, alliance: "None" },
    { name: "Frontier Airlines", iata: "F9", basePrice: 32, pricePerKm: 0.05, rating: 3.4, co2PerKm: 88, alliance: "None" },
    { name: "Hawaiian Airlines", iata: "HA", basePrice: 78, pricePerKm: 0.12, rating: 4.5, co2PerKm: 75, alliance: "None" },
    { name: "Sun Country", iata: "SY", basePrice: 38, pricePerKm: 0.06, rating: 3.8, co2PerKm: 84, alliance: "None" },
    { name: "British Airways", iata: "BA", basePrice: 120, pricePerKm: 0.15, rating: 4.2, co2PerKm: 80, alliance: "oneworld" },
    { name: "Lufthansa", iata: "LH", basePrice: 110, pricePerKm: 0.14, rating: 4.3, co2PerKm: 78, alliance: "Star Alliance" },
    { name: "Emirates", iata: "EK", basePrice: 150, pricePerKm: 0.18, rating: 4.6, co2PerKm: 85, alliance: "None" },
    { name: "Singapore Airlines", iata: "SQ", basePrice: 140, pricePerKm: 0.17, rating: 4.7, co2PerKm: 75, alliance: "Star Alliance" },
    { name: "Cathay Pacific", iata: "CX", basePrice: 130, pricePerKm: 0.16, rating: 4.4, co2PerKm: 77, alliance: "oneworld" },
    { name: "ANA", iata: "NH", basePrice: 135, pricePerKm: 0.16, rating: 4.5, co2PerKm: 73, alliance: "Star Alliance" },
    { name: "Qatar Airways", iata: "QR", basePrice: 145, pricePerKm: 0.17, rating: 4.6, co2PerKm: 80, alliance: "oneworld" },
    { name: "Turkish Airlines", iata: "TK", basePrice: 95, pricePerKm: 0.12, rating: 3.9, co2PerKm: 82, alliance: "Star Alliance" },
    { name: "Air France", iata: "AF", basePrice: 105, pricePerKm: 0.13, rating: 4.1, co2PerKm: 79, alliance: "SkyTeam" },
    { name: "KLM", iata: "KL", basePrice: 100, pricePerKm: 0.13, rating: 4.1, co2PerKm: 79, alliance: "SkyTeam" },
  ],
}

export function getRegionForCoords(lat: number, lng: number): RegionContext {
  return SILICON_VALLEY
}

export function getRideshareProviders(): Array<{ name: string; type: string; basePrice: number; pricePerKm: number; speedFactor: number; co2PerKm: number; rating: number; icon: string }> {
  return [
    { name: "UberX", type: "rideshare", basePrice: 2.00, pricePerKm: 1.50, speedFactor: 42, co2PerKm: 155, rating: 4.2, icon: "🚗" },
    { name: "UberXL", type: "rideshare", basePrice: 4.00, pricePerKm: 2.20, speedFactor: 42, co2PerKm: 200, rating: 4.0, icon: "🚙" },
    { name: "Uber Comfort", type: "rideshare", basePrice: 3.50, pricePerKm: 1.80, speedFactor: 42, co2PerKm: 160, rating: 4.5, icon: "🚗" },
    { name: "Uber Black", type: "rideshare", basePrice: 8.00, pricePerKm: 3.00, speedFactor: 42, co2PerKm: 200, rating: 4.7, icon: "🚘" },
    { name: "Uber Green", type: "rideshare", basePrice: 2.50, pricePerKm: 1.60, speedFactor: 40, co2PerKm: 80, rating: 4.3, icon: "♻️" },
    { name: "Lyft", type: "rideshare", basePrice: 2.00, pricePerKm: 1.45, speedFactor: 41, co2PerKm: 155, rating: 4.3, icon: "🚗" },
    { name: "Lyft XL", type: "rideshare", basePrice: 4.00, pricePerKm: 2.15, speedFactor: 41, co2PerKm: 200, rating: 4.1, icon: "🚙" },
    { name: "Lyft Lux", type: "rideshare", basePrice: 7.50, pricePerKm: 2.90, speedFactor: 42, co2PerKm: 195, rating: 4.6, icon: "🚘" },
    { name: "Wingz", type: "rideshare", basePrice: 3.00, pricePerKm: 1.75, speedFactor: 40, co2PerKm: 150, rating: 4.4, icon: "🚗" },
    { name: "Ola", type: "rideshare", basePrice: 1.50, pricePerKm: 1.20, speedFactor: 40, co2PerKm: 155, rating: 4.0, icon: "🚗" },
    { name: "Via", type: "rideshare", basePrice: 1.00, pricePerKm: 0.80, speedFactor: 35, co2PerKm: 130, rating: 3.8, icon: "🚐" },
  ]
}

export function computeProviderScore(
  provider: { price: number; duration: number; co2: number; rating: number },
  minPrice: number, maxPrice: number,
  minDuration: number, maxDuration: number,
  minCo2: number, maxCo2: number,
  prefs: { speed: number; cost: number; eco: number },
): { total: number; speed: number; cost: number; eco: number; convenience: number } {
  const normPrice = maxPrice > minPrice ? 1 - (provider.price - minPrice) / (maxPrice - minPrice) : 1
  const normDuration = maxDuration > minDuration ? 1 - (provider.duration - minDuration) / (maxDuration - minDuration) : 1
  const normCo2 = maxCo2 > minCo2 ? 1 - (provider.co2 - minCo2) / (maxCo2 - minCo2) : 1
  const normRating = provider.rating / 5

  const wSpeed = prefs.speed / 100
  const wCost = prefs.cost / 100
  const wEco = prefs.eco / 100
  const totalW = wSpeed + wCost + wEco + 0.3

  const speedScore = Math.round(normDuration * 90 + 10)
  const costScore = Math.round(normPrice * 90 + 10)
  const ecoScore = Math.round(normCo2 * 90 + 10)
  const convenience = Math.round(normRating * 90 + 10)

  const total = Math.round(
    (speedScore * wSpeed + costScore * wCost + ecoScore * wEco + convenience * 0.3) / totalW,
  )

  return {
    total: Math.min(100, total),
    speed: speedScore,
    cost: costScore,
    eco: ecoScore,
    convenience,
  }
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297
  return x - Math.floor(x)
}

export function estimatePrice(base: number, perKm: number, distanceKm: number, seed: number): number {
  const jitter = 1 + (seededRandom(seed) - 0.5) * 0.1
  return parseFloat(((base + perKm * distanceKm) * jitter).toFixed(2))
}

export function estimateCo2(co2PerKm: number, distanceKm: number, seed: number): number {
  const jitter = 1 + (seededRandom(seed + 100) - 0.5) * 0.05
  return Math.round(co2PerKm * distanceKm * jitter)
}

export function estimateDuration(distanceKm: number, speedKmh: number): number {
  return Math.round((distanceKm / speedKmh) * 3600)
}

export function generateFlightOptions(
  origin: [number, number],
  destination: [number, number],
  region: RegionContext,
  count: number,
): ProviderOption[] {
  const distKm = haversineKm(origin, destination)
  if (distKm < 200) return []

  const results: ProviderOption[] = []
  const shuffled = [...region.airlines].sort(() => Math.random() - 0.5)
  const numAirlines = Math.min(count, shuffled.length)

  const airports = region.airports
  if (!airports.length) return []

  for (let i = 0; i < numAirlines; i++) {
    const airline = shuffled[i]
    const depAirport = airports[Math.floor(seededRandom(i * 7) * airports.length)]
    const seed = i * 31 + distKm
    const price = estimatePrice(airline.basePrice, airline.pricePerKm, distKm, seed)
    const duration = estimateDuration(distKm, 800) + Math.floor(seededRandom(seed + 5) * 5400)
    const co2 = estimateCo2(airline.co2PerKm, distKm, seed + 10)
    const stops = seededRandom(seed + 20) > 0.6 ? 1 : 0
    const hours = Math.floor(duration / 3600)
    const mins = Math.floor((duration % 3600) / 60)
    const depHour = 6 + Math.floor(seededRandom(seed + 30) * 16)
    const arrHour = (depHour + hours) % 24

    results.push({
      id: `flight-${airline.iata}-${i}`,
      name: airline.name,
      mode: "flight",
      type: `Flight ${airline.iata}${100 + i}`,
      icon: "✈️",
      price,
      priceCurrency: "USD",
      duration,
      distance: distKm * 1000,
      co2,
      co2Saved: Math.max(0, 200 - co2),
      score: 0,
      scoreBreakdown: { speed: 0, cost: 0, eco: 0, convenience: 0 },
      rating: airline.rating,
      availability: 0.8 + seededRandom(seed + 40) * 0.2,
      details: `${depAirport.code} → Nonstop` + (stops ? " (1 stop)" : ""),
      vehicleType: `Boeing / Airbus`,
      departureTime: `${String(depHour).padStart(2, "0")}:${String(Math.floor(seededRandom(seed + 50) * 60)).padStart(2, "0")}`,
      arrivalTime: `${String(arrHour).padStart(2, "0")}:${String(Math.floor(seededRandom(seed + 60) * 60)).padStart(2, "0")}`,
      stops,
      bookingUrl: "#",
    })
  }

  return results
}

export function haversineKm(origin: [number, number], dest: [number, number]): number {
  const R = 6371
  const dLat = ((dest[1] - origin[1]) * Math.PI) / 180
  const dLng = ((dest[0] - origin[0]) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((origin[1] * Math.PI) / 180) *
      Math.cos((dest[1] * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
