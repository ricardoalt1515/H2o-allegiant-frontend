'use client'

import { useState, useEffect, useCallback } from 'react'

/**
 * useLocalStorage - Generic hook for localStorage with SSR safety
 *
 * Safely reads/writes to localStorage with:
 * - SSR safety (no errors during server render)
 * - JSON serialization/deserialization
 * - Type safety with TypeScript generics
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void] {
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isHydrated, setIsHydrated] = useState(false)

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value

        setStoredValue(valueToStore)

        // Check if window is defined (SSR safety)
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore))
        }
      } catch (error) {
        console.warn(`Error storing value in localStorage for key "${key}":`, error)
      }
    },
    [key, storedValue]
  )

  // Value from localStorage is loaded into state in useEffect
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key)
        if (item) {
          setStoredValue(JSON.parse(item) as T)
        }
      }
    } catch (error) {
      console.warn(`Error reading from localStorage for key "${key}":`, error)
    } finally {
      setIsHydrated(true)
    }
  }, [key])

  // Return hydrated state to prevent hydration mismatch
  return isHydrated ? [storedValue, setValue] : [initialValue, setValue]
}
