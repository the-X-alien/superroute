"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Users, Plus, MessageCircle, MapPin, ChevronRight } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const mockTrips = [
  {
    id: "t1",
    name: "SF to Oakland Commute",
    members: [
      { name: "Alice", initials: "AL" },
      { name: "Bob", initials: "BO" },
      { name: "You", initials: "YO" },
    ],
    score: 92,
    preview: "Let's take BART today, it's 95% on time",
  },
  {
    id: "t2",
    name: "Weekend Hike Trip",
    members: [
      { name: "Carol", initials: "CA" },
      { name: "You", initials: "YO" },
    ],
    score: 78,
    preview: "The consensus route goes through Muir Woods",
  },
  {
    id: "t3",
    name: "Downtown Dinner",
    members: [
      { name: "Dave", initials: "DA" },
      { name: "Eve", initials: "EV" },
      { name: "Frank", initials: "FR" },
      { name: "You", initials: "YO" },
    ],
    score: 85,
    preview: "AI suggests we share a rideshare - $4 each",
  },
]

export default function CollaborativeTrips() {
  const [showForm, setShowForm] = useState(false)

  return (
    <section className="relative py-32 px-4">
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(175,95%,48%,0.05) 0%, transparent 70%)",
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
            <h2 className="font-display text-4xl md:text-5xl font-bold">
              Travel <span className="text-gradient">Together</span>
            </h2>
            <p className="text-[var(--color-muted-foreground)] max-w-xl mx-auto">
              Plan group trips with AI-powered consensus routing and real-time chat.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex justify-center">
            <Button
              size="lg"
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Create New Trip
            </Button>
          </motion.div>

          {showForm && (
            <motion.div
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="max-w-md mx-auto"
            >
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-muted-foreground)]">
                      Trip Name
                    </label>
                    <input
                      placeholder="e.g., Friday Night Out"
                      className="w-full h-10 px-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-[var(--color-muted-foreground)]">
                      Invite via email
                    </label>
                    <input
                      placeholder="friend@email.com"
                      className="w-full h-10 px-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]"
                    />
                  </div>
                  <Button className="w-full">Create Trip</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <div className="grid md:grid-cols-3 gap-6">
              {mockTrips.map((trip) => (
                <Card
                  key={trip.id}
                  className="group cursor-pointer hover:border-[var(--color-primary)]/40 transition-all duration-300"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="font-display font-semibold text-lg">{trip.name}</h3>
                      <Badge variant="secondary" className="flex-shrink-0">
                        {trip.score}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {trip.members.map((m) => (
                          <Avatar key={m.name} className="w-8 h-8 border-2 border-[var(--color-background)]">
                            <AvatarFallback className="text-[10px] bg-[var(--color-muted)]">
                              {m.initials}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                      <span className="text-xs text-[var(--color-muted-foreground)]">
                        {trip.members.length} members
                      </span>
                    </div>

                    <div className="flex items-start gap-2 p-3 rounded-lg bg-[var(--color-muted)]/50">
                      <MessageCircle className="w-4 h-4 text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-[var(--color-muted-foreground)] italic">
                        "{trip.preview}"
                      </p>
                    </div>

                    <div className="flex items-center justify-between text-sm text-[var(--color-muted-foreground)] group-hover:text-[var(--color-primary)] transition-colors">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        View consensus route
                      </span>
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
