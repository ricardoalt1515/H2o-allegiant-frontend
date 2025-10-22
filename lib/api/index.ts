// Main API exports
export { apiClient, APIClient, APIClientError } from './client'
export { AuthAPI, authAPI } from './auth'
export { ProjectsAPI, projectsAPI } from './projects'
export { ProjectDataAPI, projectDataAPI } from './project-data'
export { AIAPI, aiAPI } from './ai'

// Re-export common types
export type { APIError, RequestConfig } from './client'
export type { User, LoginRequest, LoginResponse, RegisterRequest } from './auth'
export type { ProjectData, QualityParameter, CustomSection } from './project-data'

// API initialization and configuration
export const initializeAPI = () => {
  // Initialize auth tokens from localStorage
  authAPI.initializeAuth()

  // Set up auto-refresh token logic
  const refreshInterval = setInterval(async () => {
    const token = localStorage.getItem('access_token')
    if (token) {
      // Check if token is about to expire (you'd need to decode JWT for this)
      // For now, just attempt refresh every 30 minutes
      await authAPI.autoRefreshToken()
    }
  }, 30 * 60 * 1000) // 30 minutes

  // Return cleanup function
  return () => {
    clearInterval(refreshInterval)
  }
}

// Environment configuration
export const getAPIConfig = () => ({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000',
  wsURL: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  environment: process.env.NODE_ENV || 'development',
  version: process.env.NEXT_PUBLIC_API_VERSION || 'v1'
})

// Error handling utilities
export const handleAPIError = (error: unknown): string => {
  if (error instanceof APIClientError) {
    return error.message
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred'
}

// Response type helpers
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
  pages: number
}

export interface APIResponse<T> {
  data: T
  message?: string
  timestamp: string
}

export interface ErrorResponse {
  error: {
    code: string
    message: string
    details?: Record<string, any>
  }
  timestamp: string
}