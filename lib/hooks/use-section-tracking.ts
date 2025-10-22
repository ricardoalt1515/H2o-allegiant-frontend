'use client'

import { useCallback, useMemo } from 'react'
import { useLocalStorage } from './use-local-storage'

/**
 * useSectionTracking - Track reviewed sections with progress percentage
 *
 * Manages which sections have been reviewed by the user
 * Persists to localStorage with proposalId key
 * Returns completion percentage for progress indicators
 */
export function useSectionTracking(
  proposalId: string,
  totalSections: number
) {
  const storageKey = `h2o_proposal_${proposalId}_reviewed_sections`

  const [reviewedSections, setReviewedSections] = useLocalStorage<string[]>(
    storageKey,
    []
  )

  // Mark a section as reviewed when user scrolls into it
  const markAsReviewed = useCallback(
    (sectionId: string) => {
      setReviewedSections((prev) => {
        // Only add if not already present (avoid duplicates)
        if (!prev.includes(sectionId)) {
          return [...prev, sectionId]
        }
        return prev
      })
    },
    [setReviewedSections]
  )

  // Calculate completion percentage
  const completionPercent = useMemo(() => {
    if (totalSections === 0) return 0
    return Math.round((reviewedSections.length / totalSections) * 100)
  }, [reviewedSections.length, totalSections])

  // Reset progress (clear localStorage)
  const resetProgress = useCallback(() => {
    setReviewedSections([])
  }, [setReviewedSections])

  return {
    reviewedSections,
    markAsReviewed,
    completionPercent,
    resetProgress,
  }
}

/**
 * Helper to check if section has been reviewed
 */
export function isSectionReviewed(
  sectionId: string,
  reviewedSections: string[]
): boolean {
  return reviewedSections.includes(sectionId)
}
