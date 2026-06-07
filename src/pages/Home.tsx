"use client"

import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Globe, Users, Trophy } from "lucide-react"

const features = [
  { icon: Zap, title: "AI-Powered Routing", desc: "Real OSRM data meets smart scoring across speed, cost, and eco." },
  { icon: Globe, title: "Multi-Provider", desc: "Compare rideshare, transit, taxi, rental cars, and flights in one view." },
  { icon: Users, title: "Group Planning", desc: "Collaborate with friends on shared trips with real-time consensus." },
  { icon: Trophy, title: "Gamification", desc: "Earn points and climb the leaderboard for sustainable choices." },
]

export default function Home() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen">
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(30,10%,4%)] via-[hsl(30,8%,6%)] to-[hsl(30,10%,4%)]" />
        <div
          className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(40,90%,52%,0.06) 0%, transparent 70%)", filter: "blur(60px)" }}
        />

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-8">
            <motion.div variants={fadeUp}>
              <span className="inline-block px-4 py-1.5 text-xs tracking-[3px] uppercase text-[var(--color-primary)] mb-6">
                Routes that learn. Journeys that inspire.
              </span>
            </motion.div>
            <motion.h1 variants={fadeUp} className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-[0.93] tracking-[-2.5px]">
              Every route is a
              <br />
              <span className="text-gradient italic">SuperRoute</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-[var(--color-muted-foreground)] max-w-2xl mx-auto leading-relaxed">
              AI-powered routing that balances speed, cost, and sustainability.
              Compare every provider and find your perfect journey.
            </motion.p>
            <motion.div variants={fadeUp} className="flex flex-wrap items-center justify-center gap-4 pt-4">
              <Button size="lg" onClick={() => navigate("/planner")} className="gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate("/trips")}>
                Group Trips
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid md:grid-cols-4 gap-6"
          >
            {features.map((f) => (
              <motion.div key={f.title} variants={fadeUp} className="liquid-glass rounded-[var(--radius)] p-6 text-center space-y-3">
                <f.icon className="w-8 h-8 text-[var(--color-primary)] mx-auto" />
                <h3 className="font-display text-lg leading-[0.93]" style={{ letterSpacing: "-0.5px" }}>{f.title}</h3>
                <p className="text-sm text-[var(--color-muted-foreground)]">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  )
}
