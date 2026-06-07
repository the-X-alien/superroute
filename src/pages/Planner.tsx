"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { ArrowRight, Zap, DollarSign, Leaf, Loader2, Sparkles, RefreshCw, AlertCircle, MapPin, Award } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { useRouteEngine, type RoutePreferences } from "@/hooks/useRouteEngine"
import type { ProviderOption, TransportMode } from "@/lib/providers"
import PlaceAutocomplete from "@/components/PlaceAutocomplete"
import RouteDetailModal from "@/components/RouteDetailModal"
import { formatDuration, formatDistance } from "@/lib/utils"
import type { GeocodingResult } from "@/lib/geocode"

function getModeColor(mode: TransportMode): string {
  switch (mode) {
    case "walking": return "text-emerald-400"
    case "cycling": return "text-sky-400"
    case "scooter": return "text-purple-400"
    case "transit": return "text-amber-400"
    case "rideshare": return "text-blue-400"
    case "taxi": return "text-orange-400"
    case "car_rental": return "text-rose-400"
    case "flight": return "text-[var(--color-primary)]"
  }
}

function getModeLabel(mode: TransportMode): string {
  switch (mode) {
    case "walking": return "Walk"
    case "cycling": return "Cycle"
    case "scooter": return "Scooter"
    case "transit": return "Transit"
    case "rideshare": return "Ride"
    case "taxi": return "Taxi"
    case "car_rental": return "Rental"
    case "flight": return "Flight"
  }
}

function modesIcon(mode: TransportMode): string {
  switch (mode) {
    case "walking": return "🚶"
    case "cycling": return "🚲"
    case "scooter": return "🛴"
    case "transit": return "🚌"
    case "rideshare": return "🚗"
    case "taxi": return "🚕"
    case "car_rental": return "🚙"
    case "flight": return "✈️"
  }
}

function ProviderCard({ provider, isBest }: { provider: ProviderOption; isBest: boolean }) {
  const d = provider.scoreBreakdown

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Card
          className={`cursor-pointer transition-all duration-300 group hover:border-[var(--color-primary)]/40 ${
            isBest ? "border-[var(--color-primary)]/50 gold-glow" : ""
          }`}
        >
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{provider.icon}</span>
                <div>
                  <p className="font-display text-lg leading-[0.93] flex items-center gap-2" style={{ letterSpacing: "-0.5px" }}>
                    {provider.name}
                    <span className={`text-xs font-sans font-medium ${getModeColor(provider.mode)}`}>
                      {getModeLabel(provider.mode).toUpperCase()}
                    </span>
                  </p>
                  <p className="text-xs text-[var(--color-muted-foreground)]">
                    {formatDuration(provider.duration)} &middot; {formatDistance(provider.distance)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <Badge variant={isBest ? "accent" : "secondary"}>{provider.score}</Badge>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">score</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-xl leading-[0.93]" style={{ letterSpacing: "-0.5px" }}>
                ${provider.price.toFixed(2)}
              </span>
              {provider.stops !== undefined && provider.stops > 0 && (
                <span className="text-xs text-[var(--color-muted-foreground)]">{provider.stops} stop{provider.stops > 1 ? "s" : ""}</span>
              )}
              {provider.departureTime && (
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {provider.departureTime} &rarr; {provider.arrivalTime}
                </span>
              )}
            </div>

            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Speed", value: d.speed, color: "text-[var(--color-primary)]" },
                { label: "Cost", value: d.cost, color: "text-[var(--color-muted-foreground)]" },
                { label: "Eco", value: d.eco, color: "text-[var(--color-muted-foreground)]" },
                { label: "Conv", value: d.convenience, color: "text-[var(--color-muted-foreground)]" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <div className="h-1 rounded-full bg-[var(--color-muted)] mb-1 overflow-hidden">
                    <div className="h-full rounded-full bg-[var(--color-primary)]" style={{ width: `${s.value}%` }} />
                  </div>
                  <p className={`text-xs ${s.color}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {provider.co2Saved > 0 && (
              <p className="text-xs text-[var(--color-muted-foreground)] mt-2">CO₂ saved: ~{provider.co2Saved}g</p>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      <RouteDetailModal provider={provider} />
    </Dialog>
  )
}

export default function Planner() {
  const { findRoutes, result, loading, error, setPrefs, prefs } = useRouteEngine()
  const [originName, setOriginName] = useState("")
  const [destName, setDestName] = useState("")
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null)
  const [destCoords, setDestCoords] = useState<[number, number] | null>(null)

  const handleSearch = useCallback(() => {
    if (!originCoords || !destCoords) return
    findRoutes(
      originName || "Selected location",
      destName || "Selected location",
      originCoords,
      destCoords,
      prefs,
    )
  }, [originName, destName, originCoords, destCoords, prefs, findRoutes])

  const handleRegenerate = useCallback(() => {
    handleSearch()
  }, [handleSearch])

  const modes: TransportMode[] = ["walking", "cycling", "scooter", "transit", "rideshare", "taxi", "car_rental", "flight"]

  const grouped = result
    ? Object.fromEntries(modes.map((m) => [m, result.allProviders.filter((p) => p.mode === m).sort((a, b) => b.score - a.score)]))
    : {}

  const activeModes = result ? modes.filter((m) => (grouped[m]?.length || 0) > 0) : []

  const canSearch = !!originCoords && !!destCoords

  return (
    <div className="min-h-screen pt-24 px-4 pb-32">
      <div className="max-w-6xl mx-auto">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
          <motion.div variants={fadeUp} className="text-center space-y-4">
            <span className="text-xs tracking-[3px] uppercase text-[var(--color-primary)]">Smart Routing Engine</span>
            <h1 className="font-display text-4xl md:text-5xl font-bold leading-[0.93] tracking-[-2px]">
              Find your <span className="text-gradient italic">SuperRoute</span>
            </h1>
            <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto">
              Compare every provider — rideshare, transit, taxi, rental, flights — and find the perfect balance.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="liquid-glass-strong">
              <CardHeader>
                <CardTitle>Trip Details</CardTitle>
                <CardDescription>Enter your start and destination</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-start">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-muted-foreground)]">From</label>
                    <PlaceAutocomplete
                      value={originName}
                      onChange={setOriginName}
                      onSelect={(r: GeocodingResult) => setOriginCoords([r.lng, r.lat])}
                      placeholder="e.g., San Francisco, CA"
                      icon="start"
                    />
                  </div>
                  <div className="flex items-center justify-center pt-8">
                    <ArrowRight className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-muted-foreground)]">To</label>
                    <PlaceAutocomplete
                      value={destName}
                      onChange={setDestName}
                      onSelect={(r: GeocodingResult) => setDestCoords([r.lng, r.lat])}
                      placeholder="e.g., Oakland, CA"
                      icon="end"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[var(--color-primary)]" /> Speed
                      </span>
                      <span className="text-sm font-display font-bold leading-[0.93]" style={{ color: "hsl(35 15% 92%)" }}>
                        {prefs.speed}%
                      </span>
                    </div>
                    <Slider
                      value={[prefs.speed]}
                      onValueChange={([v]) => setPrefs((p: RoutePreferences) => ({ ...p, speed: v }))}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[var(--color-muted-foreground)]" /> Cost
                      </span>
                      <span className="text-sm font-display font-bold leading-[0.93]" style={{ color: "hsl(35 15% 92%)" }}>
                        {prefs.cost}%
                      </span>
                    </div>
                    <Slider
                      value={[prefs.cost]}
                      onValueChange={([v]) => setPrefs((p: RoutePreferences) => ({ ...p, cost: v }))}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-[var(--color-muted-foreground)]" /> Eco
                      </span>
                      <span className="text-sm font-display font-bold leading-[0.93]" style={{ color: "hsl(35 15% 92%)" }}>
                        {prefs.eco}%
                      </span>
                    </div>
                    <Slider
                      value={[prefs.eco]}
                      onValueChange={([v]) => setPrefs((p: RoutePreferences) => ({ ...p, eco: v }))}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button size="lg" className="flex-1 gap-2" onClick={handleSearch} disabled={loading || !canSearch}>
                    {loading ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</>
                    ) : (
                      <><Sparkles className="w-4 h-4" /> Find my SuperRoute</>
                    )}
                  </Button>
                  {result && !loading && (
                    <Button size="lg" variant="outline" className="gap-2" onClick={handleRegenerate}>
                      <RefreshCw className="w-4 h-4" /> Regenerate
                    </Button>
                  )}
                </div>

                {!canSearch && !loading && (
                  <p className="text-xs text-[var(--color-muted-foreground)] text-center">
                    Select both origin and destination to find routes
                  </p>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {error && (
            <motion.div variants={fadeUp}>
              <Card className="border-red-500/30">
                <CardContent className="p-6 flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {result && !loading && (
            <motion.div variants={fadeUp} className="space-y-6">
              {result.bestOverall && (
                <div className="text-center">
                  <Badge variant="accent" className="px-4 py-2 text-sm gap-2">
                    <Award className="w-4 h-4" />
                    Best Overall: {result.bestOverall.name} &middot; Score {result.bestOverall.score} &middot;
                    ${result.bestOverall.price.toFixed(2)} &middot; {formatDuration(result.bestOverall.duration)}
                  </Badge>
                </div>
              )}

              <Tabs defaultValue="all">
                <TabsList className="w-full justify-start overflow-x-auto">
                  <TabsTrigger value="all">All ({result.allProviders.length})</TabsTrigger>
                  {activeModes.map((m) => (
                    <TabsTrigger key={m} value={m} className="gap-1.5">
                      <span className={getModeColor(m)}>{modesIcon(m)}</span>
                      {getModeLabel(m)} ({grouped[m].length})
                    </TabsTrigger>
                  ))}
                </TabsList>

                <TabsContent value="all">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                    {result.allProviders.slice(0, 30).map((p, i) => (
                      <ProviderCard key={p.id} provider={p} isBest={i === 0} />
                    ))}
                  </div>
                </TabsContent>

                {activeModes.map((m) => (
                  <TabsContent key={m} value={m}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {(grouped[m] || []).slice(0, 15).map((p, i) => (
                        <ProviderCard key={p.id} provider={p} isBest={i === 0} />
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
