"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { Plus, MessageCircle, MapPin, Send, Users, ArrowLeft, LogIn } from "lucide-react"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/AuthContext"
import AuthModal from "@/components/AuthModal"
import { supabase } from "@/lib/supabase"
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js"

interface Trip {
  id: string
  name: string
  origin_name: string | null
  dest_name: string | null
  created_by: string
  status: string
}

interface Message {
  id: number
  trip_id: string
  user_id: string
  content: string
  created_at: string
}

const mockTrips: Trip[] = [
  { id: "t1", name: "SF to Oakland Commute", origin_name: "San Francisco", dest_name: "Oakland", created_by: "", status: "planning" },
  { id: "t2", name: "Weekend Hike Trip", origin_name: "Golden Gate Bridge", dest_name: "Muir Woods", created_by: "", status: "voting" },
  { id: "t3", name: "Downtown Dinner", origin_name: "SoMa", dest_name: "North Beach", created_by: "", status: "confirmed" },
]

function TripChat({ tripId }: { tripId: string }) {
  const { user } = useAuth()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const sb = supabase
    if (!sb) return

    sb
      .from("trip_messages")
      .select("*")
      .eq("trip_id", tripId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[])
      })

    const sub = sb
      .channel(`trip-${tripId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trip_messages", filter: `trip_id=eq.${tripId}` }, (payload: RealtimePostgresChangesPayload<Message>) => {
        setMessages((prev) => [...prev, payload.new as Message])
      })
      .subscribe()

    return () => { sb.removeChannel(sub) }
  }, [tripId])

  const send = async () => {
    const sb = supabase
    if (!input.trim() || !sb || !user) return
    await sb.from("trip_messages").insert({ trip_id: tripId, user_id: user.id, content: input.trim() })
    setInput("")
  }

  return (
    <div className="flex flex-col h-[400px]">
      <div className="flex-1 overflow-y-auto space-y-2 p-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.user_id === user?.id ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] p-3 rounded-lg text-sm ${m.user_id === user?.id ? "bg-[var(--color-primary)]/20" : "bg-[var(--color-muted)]"}`}>
              <p>{m.content}</p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      <div className="flex gap-2 p-4 border-t border-[var(--color-border)]">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder={user ? "Type a message..." : "Sign in to chat"}
          disabled={!user}
          className="flex-1 h-10 px-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)] disabled:opacity-50"
        />
        <Button size="icon" disabled={!user || !input.trim()} onClick={send}>
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

export default function Trips() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [authOpen, setAuthOpen] = useState(false)
  const [activeTrip, setActiveTrip] = useState<string | null>(null)
  const [showCreate, setShowCreate] = useState(false)

  const trips = user ? mockTrips : mockTrips.slice(0, 2)

  return (
    <div className="min-h-screen pt-24 px-4 pb-32">
      <div className="max-w-5xl mx-auto">
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
          <motion.div variants={fadeUp} className="flex items-center justify-between">
            <div>
              <button onClick={() => navigate("/")} className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors mb-2 flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" /> Back
              </button>
              <h1 className="font-display text-4xl font-bold leading-[0.93] tracking-[-2px]">
                Group <span className="text-gradient italic">Trips</span>
              </h1>
              <p className="text-[var(--color-muted-foreground)] text-sm">Plan routes together with real-time chat</p>
            </div>
            <div className="flex gap-3">
              {!user && (
                <Button variant="outline" className="gap-2" onClick={() => setAuthOpen(true)}>
                  <LogIn className="w-4 h-4" /> Sign in to create
                </Button>
              )}
              {user && (
                <Button className="gap-2" onClick={() => setShowCreate(!showCreate)}>
                  <Plus className="w-4 h-4" /> New Trip
                </Button>
              )}
            </div>
          </motion.div>

          {showCreate && user && (
            <motion.div variants={fadeUp}>
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-[var(--color-muted-foreground)]">Trip Name</label>
                    <input placeholder="e.g., Friday Night Out" className="w-full h-10 px-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm text-[var(--color-muted-foreground)]">Origin</label>
                      <input placeholder="e.g., SoMa" className="w-full h-10 px-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm text-[var(--color-muted-foreground)]">Destination</label>
                      <input placeholder="e.g., North Beach" className="w-full h-10 px-4 rounded-[var(--radius)] bg-[var(--color-muted)] border border-[var(--color-border)] text-[var(--color-foreground)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-ring)]" />
                    </div>
                  </div>
                  <Button className="w-full">Create Trip</Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div variants={fadeUp} className="space-y-4">
              {trips.map((trip) => (
                <Card
                  key={trip.id}
                  className={`cursor-pointer transition-all duration-200 hover:border-[var(--color-primary)]/40 ${
                    activeTrip === trip.id ? "border-[var(--color-primary)]/50" : ""
                  }`}
                  onClick={() => setActiveTrip(activeTrip === trip.id ? null : trip.id)}
                >
                  <CardContent className="p-5 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-display text-lg leading-[0.93]" style={{ letterSpacing: "-0.5px" }}>{trip.name}</h3>
                      <Badge variant={trip.status === "confirmed" ? "accent" : trip.status === "voting" ? "secondary" : "default"}>
                        {trip.status}
                      </Badge>
                    </div>
                    {trip.origin_name && (
                      <div className="flex items-center gap-2 text-sm text-[var(--color-muted-foreground)]">
                        <MapPin className="w-3.5 h-3.5" />
                        {trip.origin_name} &rarr; {trip.dest_name}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-xs text-[var(--color-muted-foreground)]">
                      <Users className="w-3.5 h-3.5" />
                      {activeTrip === trip.id ? "Hide chat" : "Click to open chat"}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="w-5 h-5 text-[var(--color-primary)]" />
                    {activeTrip ? mockTrips.find((t) => t.id === activeTrip)?.name || "Chat" : "Trip Chat"}
                  </CardTitle>
                </CardHeader>
                {activeTrip ? (
                  <TripChat tripId={activeTrip} />
                ) : (
                  <CardContent>
                    <p className="text-sm text-[var(--color-muted-foreground)] text-center py-8">
                      Select a trip to start chatting
                    </p>
                  </CardContent>
                )}
              </Card>
            </motion.div>
          </div>
        </motion.div>
      </div>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  )
}
