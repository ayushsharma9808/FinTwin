"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client"
import type { Profile, NotificationItem } from "@/lib/types/database"

export interface AuthUser {
  id: string
  name: string
  email: string
  avatar?: string
}

interface AuthContextType {
  user: AuthUser | null
  profile: Profile | null
  isAuthenticated: boolean
  isLoading: boolean
  isFirstLogin: boolean
  notifications: NotificationItem[]
  login: (email: string, password?: string) => Promise<{ error?: string }>
  signup: (name: string, email: string, password?: string) => Promise<{ error?: string }>
  logout: () => Promise<void>
  refreshProfile: () => Promise<void>
  markNotificationRead: (id: string) => Promise<void>
  clearNotifications: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const DEFAULT_DEMO_USER: AuthUser = {
  id: "demo-user-fintwin-uuid",
  name: "Ayush Sharma",
  email: "ayush@fintwin.com",
}

const DEFAULT_DEMO_PROFILE: Profile = {
  id: "demo-user-fintwin-uuid",
  full_name: "Ayush Sharma",
  email: "ayush@fintwin.com",
  phone_number: "+91 98765 43210",
  date_of_birth: "1996-05-14",
  occupation: "Senior Software Engineer",
  monthly_income: 185000,
  monthly_expenses: 68000,
  financial_goal: "Financial Independence by 40 & Home Purchase",
  risk_tolerance: "moderate",
  dependents: 2,
  currency: "INR",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const DEFAULT_DEMO_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    user_id: "demo-user-fintwin-uuid",
    title: "Monthly Surplus Detected",
    message: "You saved ₹35,650 more than projected this month. Would you like to allocate it to your Home Down Payment goal?",
    notification_type: "success",
    is_read: false,
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "notif-2",
    user_id: "demo-user-fintwin-uuid",
    title: "Upcoming Car Loan EMI",
    message: "₹19,450 will be auto-debited from HDFC Bank on the 5th.",
    notification_type: "info",
    is_read: false,
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "notif-3",
    user_id: "demo-user-fintwin-uuid",
    title: "Quarterly Portfolio Rebalance",
    message: "Digital Twin detected a 4.2% drift in your gold allocation due to recent rally.",
    notification_type: "alert",
    is_read: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])

  const supabase = createClient()
  const isConfigured = isSupabaseConfigured()

  const fetchProfile = async (userId: string) => {
    if (!isConfigured) {
      setProfile(DEFAULT_DEMO_PROFILE)
      return
    }

    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single()

      if (data && !error) {
        setProfile(data as Profile)
      } else {
        setProfile(DEFAULT_DEMO_PROFILE)
      }
    } catch {
      setProfile(DEFAULT_DEMO_PROFILE)
    }
  }

  const fetchNotifications = async (userId: string) => {
    if (!isConfigured) {
      setNotifications(DEFAULT_DEMO_NOTIFICATIONS)
      return
    }

    try {
      const { data } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (data && data.length > 0) {
        setNotifications(data as NotificationItem[])
      } else {
        setNotifications(DEFAULT_DEMO_NOTIFICATIONS)
      }
    } catch {
      setNotifications(DEFAULT_DEMO_NOTIFICATIONS)
    }
  }

  useEffect(() => {
    async function initAuth() {
      if (!isConfigured) {
        const stored = typeof window !== "undefined" ? localStorage.getItem("fintwin_user") : null
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            setUser(parsed)
          } catch {
            setUser(DEFAULT_DEMO_USER)
          }
        } else {
          setUser(DEFAULT_DEMO_USER)
        }
        setProfile(DEFAULT_DEMO_PROFILE)
        setNotifications(DEFAULT_DEMO_NOTIFICATIONS)
        setIsLoading(false)
        return
      }

      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
          }
          setUser(authUser)
          await fetchProfile(session.user.id)
          await fetchNotifications(session.user.id)
        } else {
          const stored = typeof window !== "undefined" ? localStorage.getItem("fintwin_user") : null
          if (stored) {
            setUser(JSON.parse(stored))
            setProfile(DEFAULT_DEMO_PROFILE)
            setNotifications(DEFAULT_DEMO_NOTIFICATIONS)
          } else {
            setUser(DEFAULT_DEMO_USER)
            setProfile(DEFAULT_DEMO_PROFILE)
            setNotifications(DEFAULT_DEMO_NOTIFICATIONS)
          }
        }
      } catch (err) {
        console.warn("Supabase auth check fallback to demo user:", err)
        setUser(DEFAULT_DEMO_USER)
        setProfile(DEFAULT_DEMO_PROFILE)
        setNotifications(DEFAULT_DEMO_NOTIFICATIONS)
      } finally {
        setIsLoading(false)
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            name: session.user.user_metadata?.full_name || session.user.email?.split("@")[0] || "User",
            email: session.user.email || "",
          }
          setUser(authUser)
          await fetchProfile(session.user.id)
          await fetchNotifications(session.user.id)
        }
      })

      return () => {
        subscription.unsubscribe()
      }
    }

    initAuth()
  }, [isConfigured])

  const login = async (email: string, password?: string) => {
    if (isConfigured && password) {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          name: data.user.user_metadata?.full_name || email.split("@")[0],
          email,
        }
        setUser(authUser)
        await fetchProfile(data.user.id)
        await fetchNotifications(data.user.id)
        return {}
      }
    }

    const authUser: AuthUser = {
      id: "demo-user-fintwin-uuid",
      name: email.split("@")[0],
      email,
    }
    setUser(authUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("fintwin_user", JSON.stringify(authUser))
      document.cookie = "fintwin_demo_session=true; path=/; max-age=86400"
    }
    setProfile(DEFAULT_DEMO_PROFILE)
    setNotifications(DEFAULT_DEMO_NOTIFICATIONS)
    return {}
  }

  const signup = async (name: string, email: string, password?: string) => {
    if (isConfigured && password) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      })

      if (error) {
        return { error: error.message }
      }

      if (data.user) {
        const authUser: AuthUser = {
          id: data.user.id,
          name,
          email,
        }
        setUser(authUser)
        setIsFirstLogin(true)
        await fetchProfile(data.user.id)
        await fetchNotifications(data.user.id)
        return {}
      }
    }

    const authUser: AuthUser = {
      id: "demo-user-fintwin-uuid",
      name,
      email,
    }
    setUser(authUser)
    setIsFirstLogin(true)
    if (typeof window !== "undefined") {
      localStorage.setItem("fintwin_user", JSON.stringify(authUser))
      document.cookie = "fintwin_demo_session=true; path=/; max-age=86400"
    }
    setProfile({
      ...DEFAULT_DEMO_PROFILE,
      full_name: name,
      email,
    })
    return {}
  }

  const logout = async () => {
    if (isConfigured) {
      await supabase.auth.signOut().catch(() => {})
    }
    setUser(null)
    setProfile(null)
    setNotifications([])
    if (typeof window !== "undefined") {
      localStorage.removeItem("fintwin_user")
      document.cookie = "fintwin_demo_session=; path=/; max-age=0"
    }
  }

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id)
    }
  }

  const markNotificationRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    )
    if (isConfigured) {
      await supabase.from("notifications").update({ is_read: true }).eq("id", id)
    }
  }

  const clearNotifications = async () => {
    setNotifications([])
    if (isConfigured && user?.id) {
      await supabase.from("notifications").delete().eq("user_id", user.id)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        isFirstLogin,
        notifications,
        login,
        signup,
        logout,
        refreshProfile,
        markNotificationRead,
        clearNotifications,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
