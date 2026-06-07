export interface OSRMResponse {
  distance: number
  duration: number
  geometry: Array<[number, number]>
  steps: Array<{ instruction: string; distance: number; duration: number; name: string }>
}

const OSRM_BASE = "https://router.project-osrm.org/route/v1"

export async function fetchOSRM(
  origin: [number, number],
  destination: [number, number],
  profile: "driving" | "walking" | "cycling" = "driving",
): Promise<OSRMResponse | null> {
  const url = `${OSRM_BASE}/${profile}/${origin[0]},${origin[1]};${destination[0]},${destination[1]}?overview=full&steps=true&geometries=geojson`
  try {
    const res = await fetch(url)
    const data = await res.json()
    if (!data.routes?.length) return null
    const r = data.routes[0]
    return {
      distance: r.distance,
      duration: r.duration,
      geometry: r.geometry.coordinates as Array<[number, number]>,
      steps: r.legs[0]?.steps?.map((s: any) => ({
        instruction: s.maneuver?.instruction || s.name || "",
        distance: s.distance,
        duration: s.duration,
        name: s.name || "",
      })) || [],
    }
  } catch {
    return null
  }
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
