"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { authAPI, type User, apiClient } from "@/lib/api"
import { toast } from "sonner"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, firstName: string, lastName: string, company?: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/", "/login", "/register"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Initialize auth on mount
  useEffect(() => {
    // ✅ FIX: Set up global 401 handler ONCE (not dependent on router)
    apiClient.setUnauthorizedHandler(() => {
      console.warn('🚨 Global 401 handler: Clearing session')
      authAPI.logout()
      setUser(null)
      localStorage.removeItem('h2o-project-store')
      localStorage.removeItem('h2o-technical-data-store')
      
      // ✅ FIX: Only redirect if NOT already on login page (prevents loop)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    })

    const initAuth = async () => {
      const hasToken = authAPI.initializeAuth()

      if (hasToken) {
        try {
          // Validate session and get user info
          const response = await authAPI.validateSession()
          if (response.valid && response.user) {
            setUser(response.user)
          } else {
            // Token invalid, clear it
            authAPI.logout()
          }
        } catch (error) {
          console.error("Auth initialization error:", error)
          authAPI.logout()
        }
      }

      setIsLoading(false)
    }

    initAuth()
    // ✅ FIX: Empty dependency array - run ONLY on mount
  }, [])

  // Redirect logic
  useEffect(() => {
    if (isLoading) return // Don't redirect while loading

    const isPublicRoute = PUBLIC_ROUTES.includes(pathname)

    if (!user && !isPublicRoute) {
      // Not authenticated and trying to access private route
      // ✅ FIX: Use replace to avoid adding history entries
      router.replace("/login")
    } else if (user && (pathname === "/login" || pathname === "/register")) {
      // Authenticated and trying to access auth pages
      // ✅ FIX: Use replace to avoid adding history entries
      router.replace("/dashboard")
    }
    // ✅ FIX: Removed 'router' from dependencies to prevent re-execution loops
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, pathname])

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await authAPI.login({ email, password })
      setUser(response.user)
      toast.success("Login successful")
      router.push("/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      toast.error("Login failed. Please check your credentials.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    company?: string
  ) => {
    try {
      setIsLoading(true)
      const response = await authAPI.register({
        email,
        password,
        name: `${firstName} ${lastName}`,
        ...(company && { company }),
      })
      setUser(response.user)
      toast.success("Registration successful")
      router.push("/dashboard")
    } catch (error) {
      console.error("Register error:", error)
      toast.error("Registration failed. Try with another email.")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const logout = () => {
    authAPI.logout()
    setUser(null)

    // Clear all persisted stores to avoid residual data
    localStorage.removeItem('h2o-project-store')
    localStorage.removeItem('h2o-technical-data-store')

    toast.success("Session closed")
    router.push("/login")
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
