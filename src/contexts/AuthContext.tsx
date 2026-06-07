import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { AuthError, User } from "@supabase/supabase-js"
import { supabase, isSupabaseReady } from "@/lib/supabase"

interface AuthContextValue {
  user: User | null
  loading: boolean
  signInWithGoogle: () => Promise<{ error: AuthError | null }>
  signInWithGitHub: () => Promise<{ error: AuthError | null }>
  signInWithEmail: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null }>
  signOut: () => Promise<void>
  ready: boolean
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signInWithGoogle: async () => ({ error: null }),
  signInWithGitHub: async () => ({ error: null }),
  signInWithEmail: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  ready: false,
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const ready = isSupabaseReady()

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (!session) setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const value: AuthContextValue = {
    user,
    loading,
    ready,
    signInWithGoogle: async () => {
      if (!supabase) return { error: new Error("Supabase not configured") as AuthError & { message: string } }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin },
      })
      return { error }
    },
    signInWithGitHub: async () => {
      if (!supabase) return { error: new Error("Supabase not configured") as AuthError & { message: string } }
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: { redirectTo: window.location.origin },
      })
      return { error }
    },
    signInWithEmail: async (email: string, password: string) => {
      if (!supabase) return { error: new Error("Supabase not configured") as AuthError & { message: string } }
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    },
    signUp: async (email: string, password: string) => {
      if (!supabase) return { error: new Error("Supabase not configured") as AuthError & { message: string } }
      const { error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
      return { error }
    },
    signOut: async () => {
      if (!supabase) return
      await supabase.auth.signOut()
      setUser(null)
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
