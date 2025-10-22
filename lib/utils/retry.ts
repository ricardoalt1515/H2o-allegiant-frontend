/**
 * Retry utility with exponential backoff.
 * Useful for handling transient network errors and API failures.
 */

export interface RetryOptions {
  /**
   * Maximum number of retry attempts.
   * @default 3
   */
  maxRetries?: number

  /**
   * Initial delay in milliseconds before the first retry.
   * @default 1000
   */
  initialDelay?: number

  /**
   * Maximum delay in milliseconds between retries.
   * @default 10000
   */
  maxDelay?: number

  /**
   * Factor by which the delay increases after each retry.
   * @default 2 (exponential backoff)
   */
  backoffFactor?: number

  /**
   * Optional function to determine if an error should trigger a retry.
   * Return true to retry, false to throw immediately.
   *
   * @example
   * // Only retry on network errors
   * shouldRetry: (error) => error.message.includes('network')
   */
  shouldRetry?: (error: Error) => boolean

  /**
   * Optional callback invoked on each retry attempt.
   */
  onRetry?: (error: Error, attempt: number, delay: number) => void
}

/**
 * Executes an async function with retry logic and exponential backoff.
 *
 * @param fn - Async function to execute
 * @param options - Retry configuration options
 * @returns Promise that resolves with the function result
 * @throws The last error if all retry attempts fail
 *
 * @example
 * ```typescript
 * // Basic usage
 * const data = await retryWithBackoff(
 *   () => fetch('/api/data').then(r => r.json())
 * )
 *
 * // With custom options
 * const result = await retryWithBackoff(
 *   () => apiCall(),
 *   {
 *     maxRetries: 5,
 *     initialDelay: 500,
 *     shouldRetry: (error) => error.message.includes('timeout'),
 *     onRetry: (error, attempt) => {
 *       console.log(`Retry attempt ${attempt}: ${error.message}`)
 *     }
 *   }
 * )
 * ```
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2,
    shouldRetry = () => true,
    onRetry
  } = options

  let lastError: Error
  let delay = initialDelay

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      // Don't retry if this is the last attempt
      if (attempt === maxRetries) {
        break
      }

      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        throw lastError
      }

      // Notify about retry
      if (onRetry) {
        onRetry(lastError, attempt + 1, delay)
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay))

      // Increase delay for next attempt (exponential backoff)
      delay = Math.min(delay * backoffFactor, maxDelay)
    }
  }

  // All retries failed
  throw lastError!
}

/**
 * Creates a retryable version of an async function.
 *
 * @param fn - Async function to wrap with retry logic
 * @param options - Retry configuration options
 * @returns Function that executes with retry logic
 *
 * @example
 * ```typescript
 * const fetchWithRetry = withRetry(
 *   (url: string) => fetch(url).then(r => r.json()),
 *   { maxRetries: 3 }
 * )
 *
 * const data = await fetchWithRetry('/api/data')
 * ```
 */
export function withRetry<TArgs extends any[], TResult>(
  fn: (...args: TArgs) => Promise<TResult>,
  options: RetryOptions = {}
): (...args: TArgs) => Promise<TResult> {
  return (...args: TArgs) => retryWithBackoff(() => fn(...args), options)
}

/**
 * Utility to determine if an HTTP error should be retried.
 *
 * @param statusCode - HTTP status code
 * @returns true if the error is retryable
 *
 * @example
 * ```typescript
 * shouldRetry: (error) => {
 *   if (error.name === 'APIClientError') {
 *     const statusCode = parseInt(error.code?.replace('HTTP_', '') || '0')
 *     return isRetryableHttpError(statusCode)
 *   }
 *   return true
 * }
 * ```
 */
export function isRetryableHttpError(statusCode: number): boolean {
  // Retry on:
  // - 408 Request Timeout
  // - 429 Too Many Requests
  // - 500 Internal Server Error
  // - 502 Bad Gateway
  // - 503 Service Unavailable
  // - 504 Gateway Timeout
  const retryableStatusCodes = [408, 429, 500, 502, 503, 504]
  return retryableStatusCodes.includes(statusCode)
}

/**
 * Utility to check if an error is a network error.
 *
 * @param error - Error to check
 * @returns true if the error is network-related
 */
export function isNetworkError(error: Error): boolean {
  const networkErrorMessages = [
    'network error',
    'fetch failed',
    'failed to fetch',
    'networkerror',
    'network request failed',
    'ECONNREFUSED',
    'ETIMEDOUT',
    'ENOTFOUND'
  ]

  const errorMessage = error.message.toLowerCase()
  return networkErrorMessages.some(msg => errorMessage.includes(msg))
}
