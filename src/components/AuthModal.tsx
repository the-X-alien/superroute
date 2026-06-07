"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X, Globe, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/contexts/AuthContext"

export default function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { user, signInWithGoogle, signInWithGitHub, signOut, ready } = useAuth()

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
                  <>
                    <Button className="w-full gap-2" onClick={() => { signInWithGoogle(); onClose() }}>
                      <Globe className="w-4 h-4" /> Continue with Google
                    </Button>
                    <Button variant="outline" className="w-full gap-2" onClick={() => { signInWithGitHub(); onClose() }}>
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg> Continue with GitHub
                    </Button>
                  </>
                ) : (
                  <div className="text-center space-y-2">
                    <p className="text-[var(--color-muted-foreground)] text-sm">
                      Auth unavailable — set <code className="text-[var(--color-primary)]">VITE_SUPABASE_URL</code> and <code className="text-[var(--color-primary)]">VITE_SUPABASE_ANON_KEY</code>.
                    </p>
                    <p className="text-xs text-[var(--color-muted-foreground)/60]">
                      Browse as a guest for now.
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
