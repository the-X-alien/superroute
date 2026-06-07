"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { MapPin, ArrowRight, Zap, DollarSign, Leaf, Loader2, Sparkles, AlertCircle } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import type { RoutePreferences, ComparisonResult } from "@/hooks/useRouteEngine"
import type { ProviderOption, TransportMode } from "@/lib/providers"
import RouteDetailModal from "./RouteDetailModal"
import { formatDuration, formatDistance } from "@/lib/utils"

interface RoutePlannerProps {
  result: ComparisonResult | null
  loading: boolean
  error: string | null
  onFindRoutes: (
    originName: string,
    destName: string,
    origin: [number, number],
    dest: [number, number],
    prefs: RoutePreferences,
  ) => void
}

const SF_CENTER: [number, number] = [-122.4194, 37.7749]

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
                <Badge variant={isBest ? "accent" : "secondary"}>
                  {provider.score}
                </Badge>
                <p className="text-xs text-[var(--color-muted-foreground)] mt-1">score</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-3">
              <span className="font-display text-xl leading-[0.93]" style={{ letterSpacing: "-0.5px" }}>
                ${provider.price.toFixed(2)}
              </span>
              {provider.stops !== undefined && provider.stops > 0 && (
                <span className="text-xs text-[var(--color-muted-foreground)]">
                  {provider.stops} stop{provider.stops > 1 ? "s" : ""}
                </span>
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
                    <div className={`h-full rounded-full bg-[var(--color-primary)]`} style={{ width: `${s.value}%` }} />
                  </div>
                  <p className={`text-xs ${s.color}`}>{s.label}</p>
                </div>
              ))}
            </div>

            {provider.co2Saved > 0 && (
              <p className="text-xs text-[var(--color-muted-foreground)] mt-2">
                CO₂ saved: ~{provider.co2Saved}g
              </p>
            )}
          </CardContent>
        </Card>
      </DialogTrigger>
      <RouteDetailModal provider={provider} />
    </Dialog>
  )
}

export default function RoutePlanner({ result, loading, error, onFindRoutes }: RoutePlannerProps) {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [prefs, setPrefs] = useState<RoutePreferences>({ speed: 50, cost: 50, eco: 50 })

  const handleFind = useCallback(() => {
    const fromCoords: [number, number] = SF_CENTER
    const toCoords: [number, number] = [-122.2711, 37.8044]
    onFindRoutes(origin || "Current Location", destination || "Oakland", fromCoords, toCoords, prefs)
  }, [origin, destination, prefs, onFindRoutes])

  const modes: TransportMode[] = ["walking", "cycling", "scooter", "transit", "rideshare", "taxi", "car_rental", "flight"]

  const grouped = result
    ? Object.fromEntries(
        modes.map((m) => [
          m,
          result.allProviders.filter((p) => p.mode === m).sort((a, b) => b.score - a.score),
        ]),
      )
    : {}

  const activeModes = result
    ? modes.filter((m) => (grouped[m]?.length || 0) > 0)
    : []

  return (
    <section id="route-planner" className="relative py-32 px-4">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          <motion.div variants={fadeUp} className="text-center space-y-4">
            <span className="text-xs tracking-[3px] uppercase text-[var(--color-primary)]">
              Smart Routing Engine
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-[0.93] tracking-[-2px] mt-3">
              Find your <span className="text-gradient italic">SuperRoute</span>
            </h2>
            <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto">
              Compare every provider — rideshare, transit, taxi, rental, flights — and find the perfect balance.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card className="liquid-glass-strong">
              <CardHeader>
                <CardTitle>Route Planner</CardTitle>
                <CardDescription>Enter your trip details below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-muted-foreground)] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--color-primary)]" />
                      From
                    </label>
                    <input
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      placeholder="e.g., San Francisco, CA or current location"
                      className="w-full h-10 px-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)/50] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-center pb-2">
                    <ArrowRight className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-muted-foreground)] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--color-accent)]" />
                      To
                    </label>
                    <input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="e.g., Oakland, CA or airport code"
                      className="w-full h-10 px-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)/50] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-6 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Zap className="w-4 h-4 text-[var(--color-primary)]" />
                        Speed
                      </span>
                      <span className="text-sm font-display font-bold leading-[0.93]" style={{ color: "hsl(35 15% 92%)" }}>
                        {prefs.speed}%
                      </span>
                    </div>
                    <Slider value={[prefs.speed]} onValueChange={([v]) => setPrefs((p) => ({ ...p, speed: v }))} max={100} step={1} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                        Cost
                      </span>
                      <span className="text-sm font-display font-bold leading-[0.93]" style={{ color: "hsl(35 15% 92%)" }}>
                        {prefs.cost}%
                      </span>
                    </div>
                    <Slider value={[prefs.cost]} onValueChange={([v]) => setPrefs((p) => ({ ...p, cost: v }))} max={100} step={1} />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-[var(--color-muted-foreground)]" />
                        Eco
                      </span>
                      <span className="text-sm font-display font-bold leading-[0.93]" style={{ color: "hsl(35 15% 92%)" }}>
                        {prefs.eco}%
                      </span>
                    </div>
                    <Slider value={[prefs.eco]} onValueChange={([v]) => setPrefs((p) => ({ ...p, eco: v }))} max={100} step={1} />
                  </div>
                </div>

                <div className="pt-2">
                  <Button size="lg" className="w-full gap-2" onClick={handleFind} disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching {getRideshareCount()}+ providers...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Find my SuperRoute
                      </>
                    )}
                  </Button>
                </div>
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
            <motion.div variants={fadeUp} className="space-y-8">
              {result.bestOverall && (
                <div className="text-center">
                  <Badge variant="accent" className="px-4 py-2 text-sm gap-2">
                    <Sparkles className="w-4 h-4" />
                    Best Overall: {result.bestOverall.name} &middot; Score {result.bestOverall.score} &middot; ${result.bestOverall.price.toFixed(2)} &middot; {formatDuration(result.bestOverall.duration)}
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
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {result.allProviders.slice(0, 30).map((p, i) => (
                      <ProviderCard key={p.id} provider={p} isBest={i === 0} />
                    ))}
                  </div>
                </TabsContent>

                {activeModes.map((m) => (
                  <TabsContent key={m} value={m}>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
    </section>
  )
}

function getRideshareCount(): number {
  return 30
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
