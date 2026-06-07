export interface GeocodingResult {
  displayName: string
  lat: number
  lng: number
  type: string
}

const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"

let lastRequestTime = 0

export async function autocomplete(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 2) return []

  const now = Date.now()
  const wait = Math.max(0, 1100 - (now - lastRequestTime))
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))

  lastRequestTime = Date.now()

  try {
    const url = `${NOMINATIM_URL}?q=${encodeURIComponent(query)}&format=json&limit=5&addressdetails=1`
    const res = await fetch(url, { headers: { "Accept-Language": "en" } })
    if (!res.ok) return []
    const data = await res.json()
    return data.map((item: any) => ({
      displayName: item.display_name,
      lat: parseFloat(item.lat),
      lng: parseFloat(item.lon),
      type: item.type || "unknown",
    }))
  } catch {
    return []
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    const res = await fetch(url, { headers: { "Accept-Language": "en" } })
    if (!res.ok) return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
    const data = await res.json()
    return data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  } catch {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
  }
}
