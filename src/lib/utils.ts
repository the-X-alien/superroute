import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}h ${m}m`
  return `${m} min`
}

export function formatDistance(meters: number): string {
  const km = meters / 1000
  if (km < 1) return `${Math.round(meters)} m`
  return `${km.toFixed(1)} km`
}

export function formatPoints(pts: number): string {
  return pts.toLocaleString()
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 11)
}
