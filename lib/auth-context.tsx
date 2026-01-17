"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isFirstLogin: boolean
  notifications: Notification[]
  login: (email: string) => void
  logout: () => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isFirstLogin, setIsFirstLogin] = useState(true)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Check for existing session (mocked)
    const savedUser = localStorage.getItem("fintwin_user")
    if (savedUser) {
      setUser(JSON.parse(savedUser))
      setIsFirstLogin(false)
    }
  }, [])

  const login = (email: string) => {
    const newUser: User = {
      id: "1",
      name: email.split("@")[0],
      email,
      avatar: undefined,
    }
    setUser(newUser)
    localStorage.setItem("fintwin_user", JSON.stringify(newUser))

    // Add welcome notification
    const welcomeNotification: Notification = {
      id: "welcome-1",
      title: "Welcome to FinTwin",
      message: "We help you plan your financial future with AI-powered insights.",
      timestamp: new Date(),
      read: false,
    }
    setNotifications([welcomeNotification])
    setIsFirstLogin(true)
  }

  const logout = () => {
    setUser(null)
    setNotifications([])
    localStorage.removeItem("fintwin_user")
  }

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isFirstLogin,
        notifications,
        login,
        logout,
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
