'use client'

import { useRef, useEffect, useState, RefObject } from 'react'
import { useInView } from 'react-intersection-observer'

/**
 * useScrollSpy - Track active section during scroll
 *
 * Returns the currently visible section based on intersection observer
 * Implements scroll-spy pattern for navigation highlighting
 */
export function useScrollSpy(
  sectionIds: string[],
  options?: {
    offset?: number
    threshold?: number | number[]
  }
): {
  activeSection: string | null
  sectionRefs: Map<string, RefObject<HTMLElement>>
} {
  const [activeSection, setActiveSection] = useState<string | null>(null)
  const sectionRefs = new Map<string, RefObject<HTMLElement>>()

  // Initialize refs for each section
  sectionIds.forEach((id) => {
    sectionRefs.set(id, useRef<HTMLElement>(null))
  })

  // Track which sections are in view
  const visibleSections = new Map<string, boolean>()

  sectionIds.forEach((sectionId) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { ref, inView } = useInView({
      threshold: options?.threshold ?? 0.3,
      rootMargin: `${options?.offset ?? -100}px 0px -66% 0px`,
    })

    // Store ref
    const existingRef = sectionRefs.get(sectionId)
    if (existingRef) {
      existingRef.current = ref as unknown as HTMLElement
    }

    visibleSections.set(sectionId, inView)
  })

  // Update active section based on visibility
  useEffect(() => {
    // Find the first visible section (from top to bottom)
    for (const [sectionId, isVisible] of visibleSections) {
      if (isVisible) {
        setActiveSection(sectionId)
        return
      }
    }

    // If no section is visible, don't change active section
    // (keeps last visible section highlighted)
  }, [visibleSections])

  return {
    activeSection,
    sectionRefs,
  }
}

/**
 * useScrollToSection - Smooth scroll to section by ID
 * Helper hook to scroll to a section with smooth behavior
 */
export function useScrollToSection() {
  return (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      })
    }
  }
}
