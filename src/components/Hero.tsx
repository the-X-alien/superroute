"use client"

import { useRef } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import { fadeUp, staggerContainer } from "@/lib/animations"
import { Button } from "@/components/ui/button"
import ThreeGlobe from "./ThreeGlobe"

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  const opacity = useTransform(scrollYProgress, [0, 0.6], [1, 0])
  const scale = useTransform(scrollYProgress, [0, 0.6], [1, 0.9])
  const y = useTransform(scrollYProgress, [0, 0.6], [0, -100])

  const scrollToPlanner = () => {
    document.getElementById("route-planner")?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[hsl(240,15%,6%)] via-[hsl(240,12%,8%)] to-[hsl(240,15%,6%)]" />
      <div
        className="absolute bottom-0 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, hsl(175,95%,48%,0.08) 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <motion.div
        className="absolute inset-0 z-0"
        style={{ opacity: useTransform(scrollYProgress, [0, 0.5], [0.4, 0]), scale }}
      >
        <ThreeGlobe className="w-full h-full" />
      </motion.div>

      <motion.div
        style={{ opacity, y }}
        className="relative z-10 text-center px-4 max-w-4xl mx-auto"
      >
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.div variants={fadeUp}>
            <span className="inline-block px-4 py-1.5 text-xs font-semibold tracking-widest uppercase rounded-full border border-[var(--color-primary)]/30 bg-[var(--color-primary)]/5 text-[var(--color-primary)] mb-6">
              Built for Milpitas Hacks 3.0
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            className="font-display text-5xl md:text-7xl lg:text-8xl font-bold leading-tight"
          >
            Every route is a
            <br />
            <span className="text-gradient">SuperRoute</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-[var(--color-muted-foreground)] max-w-2xl mx-auto leading-relaxed"
          >
            Routes that learn. Journeys that inspire. AI-powered routing that balances
            speed, cost, and sustainability — all wrapped in a breathtaking cinematic experience.
          </motion.p>

          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center justify-center gap-4 pt-4"
          >
            <Button size="lg" onClick={scrollToPlanner}>
              Get Started
            </Button>
            <Button size="lg" variant="outline" onClick={() => {
              document.getElementById("demo-video")?.classList.remove("hidden")
            }}>
              Watch Demo
            </Button>
          </motion.div>
        </motion.div>
      </motion.div>

      <div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
        onClick={scrollToPlanner}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-[var(--color-muted-foreground)] cursor-pointer hover:text-[var(--color-primary)] transition-colors"
        >
          <path d="M7 13l5 5 5-5M7 6l5 5 5-5" />
        </svg>
      </div>
    </section>
  )
}
