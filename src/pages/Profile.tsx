"use client"

import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Trophy, TrendingUp, Flame, Medal, Star, Award, Zap, LogIn, ArrowLeft, User, Leaf } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatPoints } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import AuthModal from "@/components/AuthModal"
import { useState } from "react"

const badges = [
  { label: "Eco Warrior", icon: Leaf, variant: "default" as const },
  { label: "Route Master", icon: Medal, variant: "secondary" as const },
  { label: "Streak King", icon: Flame, variant: "accent" as const },
  { label: "Explorer", icon: Star, variant: "default" as const },
  { label: "Speed Demon", icon: Zap, variant: "secondary" as const },
  { label: "Top Scorer", icon: Award, variant: "accent" as const },
]

const leaderboardUsers = [
  { name: "EcoRider42", points: 12500, rank: 1 },
  { name: "RouteNinja", points: 10800, rank: 2 },
  { name: "GreenCommuter", points: 9200, rank: 3 },
  { name: "TransitKing", points: 8100, rank: 4 },
  { name: "BikeLife", points: 7400, rank: 5 },
  { name: "UrbanGlider", points: 6800, rank: 6 },
  { name: "TrainFan", points: 6200, rank: 7 },
  { name: "WalkMore", points: 5800, rank: 8 },
]

export default function Profile() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-[var(--color-muted-foreground)] mx-auto" />
          <h1 className="font-display text-3xl font-bold leading-[0.93] tracking-[-2px]">Sign in to view your profile</h1>
          <p className="text-[var(--color-muted-foreground)]">Track your points, badges, and leaderboard rank.</p>
          <Button className="gap-2" onClick={() => setAuthOpen(true)}>
            <LogIn className="w-4 h-4" /> Sign In
          </Button>
          <Button variant="outline" className="ml-3" onClick={() => navigate("/")}>
            <ArrowLeft className="w-3 h-3 mr-1" /> Back
          </Button>
          <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 px-4 pb-32">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
          <motion.div variants={fadeUp}>
            <button onClick={() => navigate("/")} className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors mb-2 flex items-center gap-1">
              <ArrowLeft className="w-3 h-3" /> Back
            </button>
            <div className="flex items-center gap-6">
              {user.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="" className="w-16 h-16 rounded-full border-2 border-[var(--color-primary)]" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[var(--color-muted)] flex items-center justify-center border-2 border-[var(--color-primary)]">
                  <User className="w-8 h-8 text-[var(--color-muted-foreground)]" />
                </div>
              )}
              <div>
                <h1 className="font-display text-3xl font-bold leading-[0.93]" style={{ letterSpacing: "-1.5px" }}>{user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}</h1>
                <p className="text-sm text-[var(--color-muted-foreground)]">{user.email}</p>
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Trophy, label: "SuperPoints", value: formatPoints(2847), color: "text-[var(--color-primary)]" },
              { icon: TrendingUp, label: "Global Rank", value: "Top 12%", color: "text-[var(--color-primary)]" },
              { icon: Flame, label: "Streak", value: "7 days", color: "text-[var(--color-primary)]" },
            ].map((s) => (
              <Card key={s.label} className="text-center">
                <CardContent className="p-6 space-y-2">
                  <s.icon className={`w-8 h-8 ${s.color} mx-auto`} />
                  <p className="font-display text-2xl font-bold leading-[0.93]">{s.value}</p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">{s.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-[var(--color-primary)]" /> Badges
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
                    <Trophy className="w-5 h-5 text-[var(--color-primary)]" /> Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {leaderboardUsers.map((entry) => {
                      const userName = (user.user_metadata?.full_name || user.email?.split("@")[0] || "").toLowerCase()
                      const isYou = entry.name.toLowerCase().includes(userName.split(" ")[0]) || (entry.rank === 4 && !leaderboardUsers.find((u) => u.name === "You"))
                      return (
                        <div key={entry.rank} className={`flex items-center justify-between p-2.5 rounded-lg ${isYou ? "bg-[var(--color-primary)]/10" : "hover:bg-[var(--color-muted)]/50"} transition-colors`}>
                          <div className="flex items-center gap-3">
                            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                              entry.rank === 1 ? "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]"
                              : entry.rank === 2 ? "bg-[var(--color-muted)] text-[var(--color-foreground)]"
                              : entry.rank === 3 ? "bg-[var(--color-accent)]/50 text-[var(--color-primary)]"
                              : "text-[var(--color-muted-foreground)]"
                            }`}>{entry.rank}</span>
                            <span className="text-sm font-medium">{isYou ? "You" : entry.name}</span>
                          </div>
                          <span className="font-display font-bold text-sm leading-[0.93]">{formatPoints(entry.points)} pts</span>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
