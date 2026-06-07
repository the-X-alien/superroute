"use client"

import { GitBranch } from "lucide-react"

export default function Footer() {
  return (
    <footer className="relative border-t border-[var(--color-border)] py-12 px-4">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full cyan-gradient flex items-center justify-center">
            <span className="text-xs font-bold text-black">SR</span>
          </div>
          <span className="font-display font-semibold text-lg">SuperRoute</span>
        </div>

        <p className="text-sm text-[var(--color-muted-foreground)] text-center">
          Built for <span className="font-semibold text-[var(--color-primary)]">Milpitas Hacks 3.0</span>
          {" · "}Routes that learn. Journeys that inspire.
        </p>

        <div className="flex items-center gap-4">
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors"
          >
            <GitBranch className="w-5 h-5" />
          </a>
          <a
            href="#"
            className="text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-primary)] transition-colors"
          >
            Privacy
          </a>
        </div>
      </div>

      <div className="mt-8 text-center">
        <p className="text-xs text-[var(--color-muted-foreground)]/60">
          &copy; {new Date().getFullYear()} SuperRoute. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
