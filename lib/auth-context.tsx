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
  signup: (name: string, email: string, password: string) => void
  logout: () => void
  markNotificationRead: (id: string) => void
  clearNotifications: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // TEMPORARY: Authentication disabled - always authenticated with mock user
  const [user, setUser] = useState<User>({
    id: "temp-user",
    name: "Demo User",
    email: "demo@fintwin.com",
    avatar: undefined,
  })
  const [isFirstLogin, setIsFirstLogin] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // TEMPORARY: Skip authentication checks
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

  const signup = (name: string, email: string, password: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      email,
      avatar: undefined,
    }
    setUser(newUser)
    localStorage.setItem("fintwin_user", JSON.stringify(newUser))

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
        isAuthenticated: true, // TEMPORARY: Always authenticated
        isFirstLogin,
        notifications,
        login,
        signup,
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
