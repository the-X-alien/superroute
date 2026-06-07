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
import type { ProviderOption } from "@/lib/providers"
import { formatDuration, formatDistance } from "@/lib/utils"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { Clock, DollarSign, Leaf, Navigation, Share2, Save, Star, Award, Map, Zap } from "lucide-react"

export default function RouteDetailModal({ provider }: { provider: ProviderOption }) {
  const d = provider.scoreBreakdown

  return (
    <DialogContent className="sm:max-w-4xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-3">
          {provider.icon} {provider.name}
          <Badge variant="accent" className="ml-2">
            Score: {provider.score}
          </Badge>
        </DialogTitle>
        <DialogDescription>
          {provider.type} &middot; {provider.details}
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
              { icon: Clock, label: "Duration", value: formatDuration(provider.duration), color: "text-[var(--color-primary)]" },
              { icon: Navigation, label: "Distance", value: formatDistance(provider.distance), color: "text-[var(--color-muted-foreground)]" },
              { icon: DollarSign, label: "Price", value: `$${provider.price.toFixed(2)}`, color: "text-[var(--color-muted-foreground)]" },
              { icon: Leaf, label: "CO₂", value: `${provider.co2}g`, color: "text-[var(--color-muted-foreground)]" },
            ].map((s) => (
              <div key={s.label} className="liquid-glass rounded-[var(--radius)] p-4 text-center">
                <s.icon className={`w-5 h-5 ${s.color} mx-auto mb-2`} />
                <p className="font-display text-lg font-bold leading-[0.93]">{s.value}</p>
                <p className="text-xs text-[var(--color-muted-foreground)]">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            <h4 className="text-sm uppercase tracking-[3px] text-[var(--color-primary)]">
              Score Breakdown
            </h4>
            <div className="space-y-2">
              {[
                { label: "Speed", value: d.speed, icon: Zap, color: "bg-[var(--color-primary)]" },
                { label: "Cost Efficiency", value: d.cost, icon: DollarSign, color: "bg-[var(--color-accent)]" },
                { label: "Eco Friendliness", value: d.eco, icon: Leaf, color: "bg-[var(--color-muted-foreground)]" },
                { label: "Convenience", value: d.convenience, icon: Award, color: "bg-[var(--color-secondary)]" },
              ].map((s) => (
                <div key={s.label} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center gap-1.5 text-[var(--color-muted-foreground)]">
                      <s.icon className="w-3.5 h-3.5" />
                      {s.label}
                    </span>
                    <span className="font-display font-bold leading-[0.93]">{s.value}/100</span>
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

          <div className="space-y-2">
            <h4 className="text-sm uppercase tracking-[3px] text-[var(--color-primary)]">
              Details
            </h4>
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Provider</span>
                <span>{provider.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Type</span>
                <span className="capitalize">{provider.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Rating</span>
                <span>{provider.rating.toFixed(1)} / 5.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-muted-foreground)]">Availability</span>
                <span>{Math.round(provider.availability * 100)}%</span>
              </div>
              {provider.vehicleType && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-foreground)]">Vehicle</span>
                  <span>{provider.vehicleType}</span>
                </div>
              )}
              {provider.departureTime && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-foreground)]">Departure</span>
                  <span>{provider.departureTime}</span>
                </div>
              )}
              {provider.arrivalTime && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-foreground)]">Arrival</span>
                  <span>{provider.arrivalTime}</span>
                </div>
              )}
              {provider.stops !== undefined && (
                <div className="flex justify-between">
                  <span className="text-[var(--color-muted-foreground)]">Stops</span>
                  <span>{provider.stops}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <div className="aspect-square rounded-[var(--radius)] overflow-hidden liquid-glass flex items-center justify-center">
            <div className="text-center space-y-3">
              <Map className="w-12 h-12 text-[var(--color-primary)] mx-auto" />
              <p className="text-sm text-[var(--color-muted-foreground)]">Route visualization</p>
              <p className="text-xs text-[var(--color-muted-foreground)/60]">
                {provider.mode === "flight" ? "Flight path" : "Road route"} &middot; {formatDistance(provider.distance)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button className="flex-1 gap-2">
              <Save className="w-4 h-4" /> Book via {provider.name.split(" ")[0]}
            </Button>
            <Button variant="secondary" className="flex-1 gap-2">
              <Share2 className="w-4 h-4" /> Share
            </Button>
            <Button variant="outline" className="flex-1 gap-2">
              <Navigation className="w-4 h-4" /> Navigate
            </Button>
          </div>

          <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
            <Star className="w-4 h-4 text-[var(--color-primary)]" />
            <span>Rate this provider to improve recommendations</span>
          </div>
        </motion.div>
      </motion.div>
    </DialogContent>
  )
}
