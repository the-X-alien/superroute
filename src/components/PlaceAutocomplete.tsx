"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapPin, Search } from "lucide-react"
import { autocomplete, type GeocodingResult } from "@/lib/geocode"

interface PlaceAutocompleteProps {
  value: string
  onChange: (val: string) => void
  onSelect: (result: GeocodingResult) => void
  placeholder?: string
  icon?: "start" | "end"
}

let debounceTimer: ReturnType<typeof setTimeout>

export default function PlaceAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Search location...",
  icon = "start",
}: PlaceAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([])
  const [open, setOpen] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)

  const doSearch = useCallback(async (q: string) => {
    if (q.length < 2) {
      setSuggestions([])
      setOpen(false)
      return
    }
    const results = await autocomplete(q)
    setSuggestions(results)
    setOpen(results.length > 0)
    setActiveIdx(-1)
  }, [])

  const debouncedSearch = useCallback((q: string) => {
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => doSearch(q), 400)
  }, [doSearch])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <MapPin
          className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${
            icon === "start" ? "text-[var(--color-primary)]" : "text-[var(--color-accent)]"
          }`}
        />
        <input
          value={value}
          onChange={(e) => {
            const v = e.target.value
            onChange(v)
            debouncedSearch(v)
          }}
          onFocus={() => { if (suggestions.length > 0) setOpen(true) }}
          onKeyDown={(e) => {
            if (!open) return
            if (e.key === "ArrowDown") {
              e.preventDefault()
              setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1))
            } else if (e.key === "ArrowUp") {
              e.preventDefault()
              setActiveIdx((i) => Math.max(i - 1, 0))
            } else if (e.key === "Enter" && activeIdx >= 0) {
              e.preventDefault()
              const sel = suggestions[activeIdx]
              onSelect(sel)
              onChange(sel.displayName)
              setOpen(false)
            } else if (e.key === "Escape") {
              setOpen(false)
            }
          }}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)/50] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] transition-all text-sm"
        />
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 rounded-[var(--radius)] border border-[var(--color-border)] bg-[var(--color-card)] shadow-xl z-50 max-h-60 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={`${s.lat}-${s.lng}-${i}`}
              className={`w-full text-left px-4 py-3 text-sm border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)] transition-colors ${
                i === activeIdx ? "bg-[var(--color-muted)]" : ""
              }`}
              onClick={() => {
                onSelect(s)
                onChange(s.displayName)
                setOpen(false)
              }}
            >
              <span className="block truncate">{s.displayName}</span>
              <span className="text-xs text-[var(--color-muted-foreground)] capitalize">{s.type}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
