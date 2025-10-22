/**
 * Error handling and logging utilities
 */

import { APP_CONFIG } from "@/lib/constants"

export interface AppError extends Error {
  code?: string
  context?: Record<string, any>
  timestamp?: string
  userAgent?: string
  url?: string
}

/**
 * Error types for categorization
 */
export const ERROR_TYPES = {
  VALIDATION: 'VALIDATION_ERROR',
  NETWORK: 'NETWORK_ERROR',
  PERMISSION: 'PERMISSION_ERROR',
  NOT_FOUND: 'NOT_FOUND_ERROR',
  SERVER: 'SERVER_ERROR',
  CLIENT: 'CLIENT_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
} as const

export type ErrorType = typeof ERROR_TYPES[keyof typeof ERROR_TYPES]

/**
 * Create a structured error with additional context
 */
export function createAppError(
  message: string,
  type: ErrorType = ERROR_TYPES.UNKNOWN,
  context?: Record<string, any>
): AppError {
  const error = new Error(message) as AppError
  error.code = type
  error.context = context
  error.timestamp = new Date().toISOString()
  error.userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
  error.url = typeof window !== 'undefined' ? window.location.href : 'server'

  return error
}

/**
 * Log error to console (and external service in production)
 */
export function logError(error: Error | AppError, context?: Record<string, any>) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context: context || (error as AppError).context,
    code: (error as AppError).code,
    url: typeof window !== 'undefined' ? window.location.href : 'server',
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server'
  }

  if (APP_CONFIG.IS_DEVELOPMENT) {
    console.group('🚨 Error logged:')
    console.error('Message:', error.message)
    console.error('Stack:', error.stack)
    console.error('Context:', errorData.context)
    console.groupEnd()
  } else {
    console.error('Error:', errorData.message)
    // In production, send to error reporting service
    // sendToErrorService(errorData)
  }

  return errorData
}

/**
 * Safe function execution with error handling
 */
export async function withErrorHandling<T>(
  fn: () => Promise<T> | T,
  fallback?: T,
  onError?: (error: Error) => void
): Promise<T | undefined> {
  try {
    return await fn()
  } catch (error) {
    const appError = error instanceof Error ? error : new Error(String(error))
    logError(appError)
    onError?.(appError)
    return fallback
  }
}

/**
 * Validation error creator
 */
export function createValidationError(field: string, value: any, rule: string) {
  return createAppError(
    `Validation failed for field "${field}"`,
    ERROR_TYPES.VALIDATION,
    { field, value, rule }
  )
}

/**
 * Network error creator
 */
export function createNetworkError(url: string, status?: number, statusText?: string) {
  return createAppError(
    `Network request failed: ${status} ${statusText}`,
    ERROR_TYPES.NETWORK,
    { url, status, statusText }
  )
}

/**
 * Permission error creator
 */
export function createPermissionError(action: string, resource: string) {
  return createAppError(
    `Permission denied for action "${action}" on "${resource}"`,
    ERROR_TYPES.PERMISSION,
    { action, resource }
  )
}

/**
 * Error boundary error reporter
 */
export function reportErrorBoundaryError(error: Error, errorInfo: any) {
  const errorData = {
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    timestamp: new Date().toISOString(),
    type: 'ERROR_BOUNDARY'
  }

  logError(error, errorData)

  // In production, send to error reporting service
  // sendToErrorService(errorData)
}

/**
 * Performance monitoring
 */
export function measurePerformance<T>(
  name: string,
  fn: () => T | Promise<T>
): T | Promise<T> {
  if (!APP_CONFIG.IS_DEVELOPMENT) return fn()

  const start = performance.now()
  const result = fn()

  if (result instanceof Promise) {
    return result.finally(() => {
      const end = performance.now()
      console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`)
    })
  } else {
    const end = performance.now()
    console.log(`⏱️ ${name} took ${(end - start).toFixed(2)}ms`)
    return result
  }
}

/**
 * Retry mechanism with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt === maxRetries) {
        logError(lastError, { attempts: attempt + 1 })
        throw lastError
      }

      const delay = baseDelay * Math.pow(2, attempt)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  throw lastError!
}