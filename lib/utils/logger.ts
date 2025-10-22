// Production-safe logger service
// Replaces direct console.log/warn/error calls

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  data?: unknown
  context?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private logBuffer: LogEntry[] = []
  private maxBufferSize = 100

  /**
   * Debug level - development only
   */
  debug(message: string, data?: unknown, context?: string): void {
    this.log('debug', message, data, context)
  }

  /**
   * Info level - general information
   */
  info(message: string, data?: unknown, context?: string): void {
    this.log('info', message, data, context)
  }

  /**
   * Warning level - something unexpected but not critical
   */
  warn(message: string, data?: unknown, context?: string): void {
    this.log('warn', message, data, context)
  }

  /**
   * Error level - critical issues
   */
  error(message: string, error?: unknown, context?: string): void {
    this.log('error', message, error, context)

    // In production, send to error tracking service
    if (!this.isDevelopment) {
      this.sendToErrorService(message, error, context)
    }
  }

  /**
   * Internal log method
   */
  private log(level: LogLevel, message: string, data?: unknown, context?: string): void {
    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      data,
      context,
    }

    // Add to buffer for debugging
    this.logBuffer.push(entry)
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift()
    }

    // Console output in development
    if (this.isDevelopment) {
      const prefix = context ? `[${context}]` : ''
      const logMethod = this.getConsoleMethod(level)

      if (data !== undefined) {
        logMethod(`${prefix} ${message}`, data)
      } else {
        logMethod(`${prefix} ${message}`)
      }
    }
  }

  /**
   * Get appropriate console method
   */
  private getConsoleMethod(level: LogLevel): typeof console.log {
    switch (level) {
      case 'debug':
      case 'info':
        return console.log
      case 'warn':
        return console.warn
      case 'error':
        return console.error
      default:
        return console.log
    }
  }

  /**
   * Send errors to external service (Sentry, LogRocket, etc.)
   */
  private sendToErrorService(message: string, error?: unknown, context?: string): void {
    if (typeof window === 'undefined') return

    try {
      // Check if Sentry is available
      if ((window as any).Sentry) {
        const Sentry = (window as any).Sentry

        if (error instanceof Error) {
          Sentry.captureException(error, {
            tags: {
              context: context || 'unknown',
              source: 'logger'
            },
            contexts: {
              logger: {
                message,
                timestamp: new Date().toISOString()
              }
            }
          })
        } else {
          Sentry.captureMessage(message, {
            level: 'error',
            tags: {
              context: context || 'unknown',
              source: 'logger'
            },
            extra: {
              error
            }
          })
        }
      } else {
        // Fallback: Send to API endpoint for centralized logging
        // Uncomment when backend logging endpoint is ready
        /*
        fetch('/api/logs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'error',
            message,
            error: error instanceof Error ? {
              name: error.name,
              message: error.message,
              stack: error.stack
            } : error,
            context,
            timestamp: new Date().toISOString()
          })
        }).catch(() => {}) // Fail silently
        */
      }
    } catch (e) {
      // Fail silently to avoid recursive errors
      console.error('Logger: Failed to send to error service', e)
    }
  }

  /**
   * Set user context for error tracking
   */
  setUserContext(userId: string, email?: string) {
    if (typeof window === 'undefined') return

    try {
      if ((window as any).Sentry) {
        const Sentry = (window as any).Sentry
        Sentry.setUser({
          id: userId,
          email
        })
      }
    } catch (e) {
      console.error('Logger: Failed to set user context', e)
    }
  }

  /**
   * Clear user context
   */
  clearUserContext() {
    if (typeof window === 'undefined') return

    try {
      if ((window as any).Sentry) {
        const Sentry = (window as any).Sentry
        Sentry.setUser(null)
      }
    } catch (e) {
      console.error('Logger: Failed to clear user context', e)
    }
  }

  /**
   * Get recent logs (for debugging)
   */
  getRecentLogs(limit = 50): LogEntry[] {
    return this.logBuffer.slice(-limit)
  }

  /**
   * Clear log buffer
   */
  clearLogs(): void {
    this.logBuffer = []
  }

  /**
   * Export logs as JSON (for support/debugging)
   */
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2)
  }
}

// Singleton instance
export const logger = new Logger()

// Convenience exports
export const log = {
  debug: (msg: string, data?: unknown, ctx?: string) => logger.debug(msg, data, ctx),
  info: (msg: string, data?: unknown, ctx?: string) => logger.info(msg, data, ctx),
  warn: (msg: string, data?: unknown, ctx?: string) => logger.warn(msg, data, ctx),
  error: (msg: string, err?: unknown, ctx?: string) => logger.error(msg, err, ctx),
}

// Export for direct use
export default logger
