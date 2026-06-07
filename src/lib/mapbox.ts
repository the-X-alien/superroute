type LineStringGeoJSON = {
  type: "LineString"
  coordinates: [number, number][]
}

const DEFAULT_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN as string | undefined

let cachedToken: string | null = null

export function getMapboxToken(): string {
  if (cachedToken) return cachedToken
  const token = DEFAULT_TOKEN || ""
  cachedToken = token
  return token
}

export function setMapboxToken(token: string) {
  cachedToken = token
}

export function hasMapboxToken(): boolean {
  return !!getMapboxToken()
}

export interface RouteRequest {
  origin: [number, number]
  destination: [number, number]
  profile?: "driving-traffic" | "driving" | "walking" | "cycling"
}

export interface RouteResponse {
  distance: number
  duration: number
  geometry: LineStringGeoJSON
  steps: Array<{
    instruction: string
    distance: number
    duration: number
    name: string
  }>
}

export async function fetchRoute(req: RouteRequest): Promise<RouteResponse | null> {
  const token = getMapboxToken()
  if (!token) return null

  const profile = req.profile || "driving-traffic"
  const url = `https://api.mapbox.com/directions/v5/mapbox/${profile}/${req.origin[0]},${req.origin[1]};${req.destination[0]},${req.destination[1]}?geometries=geojson&overview=full&steps=true&access_token=${token}`

  try {
    const res = await fetch(url)
    const data = await res.json()
    if (!data.routes?.length) return null

    const route = data.routes[0]
    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      steps: route.legs[0]?.steps?.map((s: { maneuver?: { instruction?: string }; distance: number; duration: number; name: string }) => ({
        instruction: s.maneuver?.instruction || "",
        distance: s.distance,
        duration: s.duration,
        name: s.name || "",
      })) || [],
    }
  } catch {
    return null
  }
}

export function generateMockRoute(
  origin: [number, number],
  destination: [number, number],
  speedFactor = 0.5,
  costFactor = 0.5,
  ecoFactor = 0.5,
): RouteResponse {
  const dist = Math.random() * 15000 + 2000
  const baseDuration = dist / 10
  const speedAdjust = (1 - speedFactor) * 0.4
  const costAdjust = costFactor * 0.15
  const ecoAdjust = ecoFactor * 0.2
  const duration = baseDuration * (1 + speedAdjust + costAdjust + ecoAdjust)

  const coords: [number, number][] = [origin]
  const steps = []
  const numSteps = Math.floor(Math.random() * 6) + 3
  for (let i = 1; i <= numSteps; i++) {
    const t = i / (numSteps + 1)
    const lng = origin[0] + (destination[0] - origin[0]) * t + (Math.random() - 0.5) * 0.02
    const lat = origin[1] + (destination[1] - origin[1]) * t + (Math.random() - 0.5) * 0.02
    coords.push([lng, lat])
    steps.push({
      instruction: `Continue on route segment ${i}`,
      distance: dist / numSteps,
      duration: duration / numSteps,
      name: `Street ${i}`,
    })
  }
  coords.push(destination)

  return {
    distance: dist,
    duration,
    geometry: { type: "LineString", coordinates: coords },
    steps,
  }
}
