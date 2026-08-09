"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { login as apiLogin, logout as apiLogout } from "@/lib/api/auth"
import { getToken, saveToken } from "@/lib/api/client"
import type { AuthUser } from "@/lib/types"

const SESSION_STORAGE_KEY = "lacak-session"

interface StoredSession {
  user: AuthUser
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  isHydrating: boolean
  login: (identifier: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function readStoredSession(): AuthUser | null {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as StoredSession
    return parsed.user ?? null
  } catch {
    return null
  }
}

function persistSession(user: AuthUser | null) {
  if (typeof window === "undefined") return
  if (user) {
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ user } satisfies StoredSession))
  } else {
    window.localStorage.removeItem(SESSION_STORAGE_KEY)
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isHydrating, setIsHydrating] = useState(true)

  useEffect(() => {
    const storedToken = getToken()
    const storedUser = storedToken ? readStoredSession() : null

    if (storedToken && !storedUser) {
      // Token ada tanpa data user: sesi tidak lengkap, bersihkan.
      saveToken(null)
      persistSession(null)
    } else {
      setUser(storedUser)
    }
    setIsHydrating(false)
  }, [])

  const login = useCallback(
    async (identifier: string, password: string): Promise<AuthUser> => {
      const result = await apiLogin(identifier, password)
      saveToken(result.token)
      persistSession(result.user)
      setUser(result.user)
      return result.user
    },
    []
  )

  const logout = useCallback(async () => {
    await apiLogout()
    persistSession(null)
    setUser(null)
    router.replace("/login")
  }, [router])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,
      isHydrating,
      login,
      logout,
    }),
    [user, isHydrating, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth harus digunakan di dalam AuthProvider")
  return context
}
