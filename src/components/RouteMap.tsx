"use client"

import { useEffect, useRef } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

interface RouteMapProps {
  origin: [number, number]
  destination: [number, number]
  mode: string
}

const modeColors: Record<string, string> = {
  walking: "#10b981",
  cycling: "#0ea5e9",
  scooter: "#a855f7",
  transit: "#f59e0b",
  rideshare: "#3b82f6",
  taxi: "#f97316",
  car_rental: "#f43f5e",
  flight: "#eab308",
}

export default function RouteMap({ origin, destination, mode }: RouteMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<L.Map | null>(null)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const color = modeColors[mode] || "#eab308"

    const map = L.map(mapRef.current, {
      zoomControl: true,
      attributionControl: false,
    }).setView([(origin[0] + destination[0]) / 2, (origin[1] + destination[1]) / 2], 10)

    mapInstanceRef.current = map

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
    }).addTo(map)

    const startIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: ${color}; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })

    const endIcon = L.divIcon({
      className: "custom-marker",
      html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
      iconSize: [12, 12],
      iconAnchor: [6, 6],
    })

    L.marker([origin[0], origin[1]], { icon: startIcon }).addTo(map)
    L.marker([destination[0], destination[1]], { icon: endIcon }).addTo(map)

    if (mode === "flight") {
      const flightPath = L.polyline([origin, destination], {
        color,
        weight: 2,
        dashArray: "10, 10",
        opacity: 0.7,
      }).addTo(map)
      map.fitBounds(flightPath.getBounds(), { padding: [40, 40] })
    } else {
      const path = L.polyline([origin, destination], {
        color,
        weight: 4,
        opacity: 0.8,
      }).addTo(map)
      map.fitBounds(path.getBounds(), { padding: [40, 40] })
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [origin, destination, mode])

  return <div ref={mapRef} className="w-full h-full min-h-[250px]" />
}