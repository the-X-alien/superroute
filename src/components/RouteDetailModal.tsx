"use client"

import { motion } from "framer-motion"
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import ThroutteGlobe from "./ThreeGlobe"
import type { RouteOption } from "@/hooks/useRouteEngine"
import { formatDuration, formatDistance } from "@/lib/utils"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { Clock, DollarSign, Leaf, Navigation, Share2, Save, Star } from "lucide-react"

export default function RouteDetailModal({ route }: { route: RouteOption }) {
  const mockCoords: [number, number][] = [
    [-122.4194, 37.7749],
    [-122.4, 37.78],
    [-122.38, 37.79],
    [-122.35, 37.8],
    [-122.32, 37.8],
    [-122.3, 37.8],
    [-122.2711, 37.8044],
  ]

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          {route.icon} {route.label}
          <Badge variant="accent" className="ml-2">
            SuperScore: {route.score.total}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          Detailed route information and 3D preview
        </DialogDescription>
      </DialogHeader>

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid md:grid-cols-2 gap-6"
      >
        <motion.div variants={fadeUp} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Clock, label: "Duration", value: formatDuration(route.route.duration), color: "text-[var(--color-primary)]" },
              { icon: Navigation, label: "Distance", value: formatDistance(route.route.distance), color: "text-[var(--color-secondary)]" },
              { icon: DollarSign, label: "Est. Cost", value: `$${(route.route.distance * 0.002).toFixed(2)}`, color: "text-[var(--color-accent)]" },
              { icon: Leaf, label: "CO₂ Saved", value: `${route.co2Saved}g`, color: "text-green-400" },
            ].map((s) => (
              <div key={s.label} className="liquid-glass rounded-[var(--radius)] p-4 text-center">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                <p className="font-display text-lg font-bold">{s.value}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Route Score Breakdown
            </h4>
            <div className="space-y-2">
              {[
                { label: "Speed", value: route.score.speed, color: "bg-[var(--color-primary)]" },
                { label: "Cost Efficiency", value: route.score.cost, color: "bg-[var(--color-accent)]" },
                { label: "Eco Friendliness", value: route.score.eco, color: "bg-green-400" },
                { label: "Enjoyability", value: route.score.enjoyability, color: "bg-[var(--color-secondary)]" },
              ].map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-[var(--color-muted-foreground)]">{s.label}</span>
                    <span className="font-display font-bold">{s.value}/100</span>
                  </div>
                  <div className="h-2 rounded-full bg-[var(--color-muted)] overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${s.color}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${s.value}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-semibold text-sm uppercase tracking-wider text-[var(--color-muted-foreground)]">
              Directions
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
              {route.route.steps.map((step, i) => (
                <div key={i} className="flex items-start gap-3 p-2 rounded-lg hover:bg-[var(--color-muted)]/50 transition-colors">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-[var(--color-primary)]/20 text-[var(--color-primary)] flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm">{step.instruction}</p>
                    <p className="text-xs text-[var(--color-muted-foreground)]">
                      {step.name} &middot; {formatDistance(step.distance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <div className="aspect-square rounded-[var(--radius)] overflow-hidden liquid-glass">
            <ThroutteGlobe
              className="w-full h-full"
              routeCoords={mockCoords}
              autoRotate={false}
            />
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="flex-1 gap-2">
              <Save className="w-4 h-4" /> Save Route
            </Button>
            <Button variant="secondary" className="flex-1 gap-2">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Navigation className="w-4 h-4" /> Navigate
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <Star className="w-4 h-4 text-[var(--color-accent)]" />
            <span>Rate this route to improve future recommendations</span>
          </div>
        </motion.div>
      </motion.div>
    </DialogContent>
  )
}
