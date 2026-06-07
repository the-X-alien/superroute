"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Trophy, TrendingUp, Flame, Star, Medal, Award, Zap, LogIn } from "lucide-react"
import { fadeUp, staggerContainer, staggerChild, counterAnimation } from "@/lib/animations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPoints } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import AuthModal from "./AuthModal"

const stats = [
  { icon: Trophy, label: "Total SuperPoints", value: 2847, color: "text-[var(--color-primary)]" },
  { icon: TrendingUp, label: "Global Rank", value: "Top 12%", color: "text-[var(--color-primary)]" },
  { icon: Flame, label: "Streak", value: "7 days", color: "text-[var(--color-primary)]" },
]

const badges = [
  { label: "Eco Warrior", icon: Leaf, variant: "default" as const },
  { label: "Route Master", icon: Medal, variant: "secondary" as const },
  { label: "Streak King", icon: Flame, variant: "accent" as const },
  { label: "Explorer", icon: Star, variant: "default" as const },
  { label: "Speed Demon", icon: Zap, variant: "secondary" as const },
  { label: "Top Scorer", icon: Award, variant: "accent" as const },
]

function Leaf(props: any) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M11 20A7 7 0 0 1 9.8 6.9C15.5 4.9 17 3.5 19 2c1 2 2 4.5 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}

export default function Gamification() {
  const { user } = useAuth()
  const [authOpen, setAuthOpen] = useState(false)

  const leaderboardUsers = user
    ? [
        { name: "EcoRider42", points: 12500, rank: 1 },
        { name: "RouteNinja", points: 10800, rank: 2 },
        { name: "GreenCommuter", points: 9200, rank: 3 },
        { name: user.displayName || "You", points: 8100, rank: 4 },
        { name: "TransitKing", points: 7900, rank: 5 },
        { name: "BikeLife", points: 7400, rank: 6 },
      ]
    : [
        { name: "EcoRider42", points: 12500, rank: 1 },
        { name: "RouteNinja", points: 10800, rank: 2 },
        { name: "GreenCommuter", points: 9200, rank: 3 },
        { name: "???", points: 0, rank: 4, locked: true },
        { name: "TransitKing", points: 7900, rank: 5 },
        { name: "BikeLife", points: 7400, rank: 6 },
      ]

  return (
    <section id="gamification" className="relative py-32 px-4">
      <div
        className="absolute top-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(40,90%,52%,0.04) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="max-w-5xl mx-auto">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="space-y-16"
        >
          <motion.div variants={fadeUp} className="text-center space-y-4">
            <span className="text-xs tracking-[3px] uppercase text-[var(--color-primary)]">
              Gamification
            </span>
            <h2 className="font-display text-4xl md:text-5xl font-bold leading-[0.93] tracking-[-2px] mt-3">
              Your <span className="text-gradient italic">SuperScore</span> Journey
            </h2>
            <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto">
              Every eco-friendly choice earns you points. Climb the ranks and unlock achievements.
            </p>
          </motion.div>

          <motion.div variants={fadeUp}>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              {stats.map((s) => (
                <Card key={s.label} className="text-center">
                  <CardContent className="p-6">
                    <motion.div
                      variants={counterAnimation}
                      className="flex flex-col items-center gap-3"
                    >
                      <s.icon className={`w-8 h-8 ${s.color}`} />
                      <p className="font-display text-3xl font-bold leading-[0.93]">{s.value}</p>
                      <p className="text-sm text-[var(--color-muted-foreground)]">{s.label}</p>
                    </motion.div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[var(--color-primary)]" />
                    Recent Badges
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    {badges.map((b) => (
                      <Badge key={b.label} variant={b.variant} className="px-3 py-1.5 text-sm gap-1.5">
                        <b.icon className="w-3.5 h-3.5" />
                        {b.label}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-[var(--color-primary)]" />
                    Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {leaderboardUsers.map((entry) => (
                      <div
                        key={entry.rank}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-[var(--color-muted)]/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              entry.rank === 1
                                ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                                : entry.rank === 2
                                  ? "bg-[var(--color-muted)] text-[var(--color-foreground)]"
                                  : entry.rank === 3
                                    ? "bg-[var(--color-accent)]/50 text-[var(--color-primary)]"
                                    : "text-[var(--color-muted-foreground)]"
                            }`}
                          >
                            {entry.rank}
                          </span>
                          <span className={`text-sm font-medium ${(entry as any).locked ? "text-[var(--color-muted-foreground)]" : ""}`}>
                            {entry.name}
                          </span>
                        </div>
                        {(entry as any).locked ? (
                          <button
                            onClick={() => setAuthOpen(true)}
                            className="flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline"
                          >
                            <LogIn className="w-3 h-3" /> Sign in to claim
                          </button>
                        ) : (
                          <span className="font-display font-bold text-sm leading-[0.93]">
                            {formatPoints(entry.points)} pts
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
