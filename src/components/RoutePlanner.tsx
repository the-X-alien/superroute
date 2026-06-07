"use client"

import { useState, useCallback } from "react"
import { motion } from "framer-motion"
import { MapPin, ArrowRight, Zap, DollarSign, Leaf, Loader2 } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import type { RouteOption } from "@/hooks/useRouteEngine"
import RouteDetailModal from "./RouteDetailModal"
import type { RoutePreferences } from "@/hooks/useRouteEngine"
import { formatDuration, formatDistance } from "@/lib/utils"

interface RoutePlannerProps {
  onFindRoutes: (origin: [number, number], dest: [number, number], prefs: RoutePreferences) => void
  routes: RouteOption[]
  bestRoute: RouteOption | null
  loading: boolean
}

const SF_CENTER: [number, number] = [-122.4194, 37.7749]
const OAKLAND: [number, number] = [-122.2711, 37.8044]

export default function RoutePlanner({ onFindRoutes, routes, bestRoute, loading }: RoutePlannerProps) {
  const [origin, setOrigin] = useState("")
  const [destination, setDestination] = useState("")
  const [prefs, setPrefs] = useState<RoutePreferences>({ speed: 50, cost: 50, eco: 50 })

  const handleFind = useCallback(() => {
    const from: [number, number] = origin ? SF_CENTER : SF_CENTER
    const to: [number, number] = destination ? OAKLAND : OAKLAND
    onFindRoutes(from, to, prefs)
  }, [origin, destination, prefs, onFindRoutes])

  return (
    <section id="route-planner" className="relative py-32 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          <motion.div variants={fadeUp} className="text-center space-y-4">
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Find your <span className="text-gradient">SuperRoute</span>
            </h2>
            <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto">
              Set your priorities and let AI find the perfect balance.
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
                      placeholder="Enter starting point..."
                      className="w-full h-10 px-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-center pb-2">
                    <ArrowRight className="w-5 h-5 text-[var(--color-primary)]" />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-muted-foreground)] flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[var(--color-secondary)]" />
                      To
                    </label>
                    <input
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      placeholder="Enter destination..."
                      className="w-full h-10 px-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] transition-all"
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
                      <span className="text-sm font-display font-bold text-[var(--color-primary)]">
                        {prefs.speed}%
                      </span>
                    </div>
                    <Slider
                      value={[prefs.speed]}
                      onValueChange={([v]) => setPrefs((p) => ({ ...p, speed: v }))}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-[var(--color-accent)]" />
                        Cost
                      </span>
                      <span className="text-sm font-display font-bold text-[var(--color-accent)]">
                        {prefs.cost}%
                      </span>
                    </div>
                    <Slider
                      value={[prefs.cost]}
                      onValueChange={([v]) => setPrefs((p) => ({ ...p, cost: v }))}
                      max={100}
                      step={1}
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-2">
                        <Leaf className="w-4 h-4 text-green-400" />
                        Eco
                      </span>
                      <span className="text-sm font-display font-bold text-green-400">
                        {prefs.eco}%
                      </span>
                    </div>
                    <Slider
                      value={[prefs.eco]}
                      onValueChange={([v]) => setPrefs((p) => ({ ...p, eco: v }))}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    size="lg"
                    className="w-full"
                    onClick={handleFind}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Finding routes...
                      </>
                    ) : (
                      "Find my SuperRoute"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {routes.length > 0 && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <h3 className="font-display text-2xl font-bold">
                Route Options
                {bestRoute && (
                  <Badge variant="accent" className="ml-3 align-middle">
                    SuperScore: {bestRoute.score.total}
                  </Badge>
                )}
              </h3>

              <Tabs defaultValue={bestRoute?.id || routes[0]?.id}>
                <TabsList className="w-full justify-start overflow-x-auto">
                  {routes.map((r) => (
                    <TabsTrigger key={r.id} value={r.id} className="gap-2">
                      {r.icon} {r.label}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {routes.map((r) => (
                  <TabsContent key={r.id} value={r.id}>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Card className="cursor-pointer hover:border-[var(--color-primary)]/40 transition-all duration-300 group">
                          <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl">{r.icon}</span>
                                <div>
                                  <p className="font-display font-semibold text-lg">{r.label}</p>
                                  <p className="text-sm text-[var(--color-muted-foreground)]">
                                    {formatDuration(r.route.duration)} &middot; {formatDistance(r.route.distance)}
                                  </p>
                                </div>
                              </div>
                              <Badge variant={r === bestRoute ? "accent" : "secondary"}>
                                Score: {r.score.total}
                              </Badge>
                            </div>

                            <div className="grid grid-cols-4 gap-3 mb-4">
                              {[
                                { label: "Speed", value: r.score.speed, color: "text-[var(--color-primary)]" },
                                { label: "Cost", value: r.score.cost, color: "text-[var(--color-accent)]" },
                                { label: "Eco", value: r.score.eco, color: "text-green-400" },
                                { label: "Enjoy", value: r.score.enjoyability, color: "text-[var(--color-secondary)]" },
                              ].map((s) => (
                                <div key={s.label} className="text-center">
                                  <p className={`text-xl font-display font-bold ${s.color}`}>{s.value}</p>
                                  <p className="text-xs text-[var(--color-muted-foreground)]">{s.label}</p>
                                </div>
                              ))}
                            </div>

                            {r.co2Saved > 0 && (
                              <p className="text-sm text-green-400/80">
                                Saves ~{r.co2Saved}g CO₂ vs driving
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </DialogTrigger>
                      <RouteDetailModal route={r} />
                    </Dialog>
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
