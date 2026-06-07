"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Globe, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signInWithGoogle, signOut, ready } = useAuth()

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-sm"
        >
          <div className="liquid-glass-strong rounded-[var(--radius)] p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl leading-[0.93]" style={{ letterSpacing: "-0.5px" }}>
                {user ? "Profile" : "Sign In"}
              </h2>
              <button onClick={onClose} className="text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {user.user_metadata?.avatar_url ? (
                    <img src={user.user_metadata.avatar_url} alt="" className="w-12 h-12 rounded-full" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[var(--color-muted)] flex items-center justify-center">
                      <User className="w-6 h-6 text-[var(--color-muted-foreground)]" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium">{user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}</p>
                    <p className="text-sm text-[var(--color-muted-foreground)]">{user.email}</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full gap-2" onClick={() => { signOut(); onClose() }}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {ready ? (
                  <Button className="w-full gap-2" onClick={() => { signInWithGoogle(); onClose() }}>
                    <Globe className="w-4 h-4" /> Continue with Google
                  </Button>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-[var(--color-muted-foreground)] text-sm">
                      Auth requires a Firebase project. Set <code className="text-[var(--color-primary)]">VITE_FIREBASE_CONFIG</code>.
                    </p>
                    <p className="text-xs text-[var(--color-muted-foreground)/60]">
                      For now, browse as a guest. Leaderboard data is demo-only.
                    </p>
                    <Button variant="secondary" className="mt-2" onClick={onClose}>
                      Continue as Guest
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
