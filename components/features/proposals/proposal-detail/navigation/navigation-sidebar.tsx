'use client'

import { useCallback } from 'react'
import { CheckCircle2, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useScrollToSection } from '@/lib/hooks'
import type { ProposalDetailSection } from '../types'

interface NavigationSidebarProps {
  sections: ProposalDetailSection[]
  activeSection: string | null
  reviewedSections: string[]
  completionPercent: number
  onNavigate?: (sectionId: string) => void
}

const SECTION_ICONS: Record<string, string> = {
  'trust-dashboard': '✨',
  'red-flags': '🚨',
  'technical-dive': '🔧',
  'economic': '💰',
  'ai-transparency': '🤖',
  'executive-summary': '📋',
}

export function NavigationSidebar({
  sections,
  activeSection,
  reviewedSections,
  completionPercent,
  onNavigate,
}: NavigationSidebarProps) {
  const scrollToSection = useScrollToSection()

  const handleSectionClick = useCallback(
    (sectionId: string) => {
      scrollToSection(sectionId)
      onNavigate?.(sectionId)
    },
    [scrollToSection, onNavigate]
  )

  return (
    <aside className="hidden lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-48 lg:border-r lg:bg-background/50 lg:backdrop-blur-sm lg:flex lg:flex-col lg:z-40">
      {/* Sticky header */}
      <div className="sticky top-0 border-b bg-background/95 backdrop-blur-sm p-4 space-y-4">
        <h3 className="font-semibold text-sm">Review Progress</h3>

        {/* Progress Ring */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 flex-shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="8"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeDasharray={`${(completionPercent / 100) * 283} 283`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold">{completionPercent}%</span>
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Completed</p>
            <p className="text-sm font-semibold">
              {reviewedSections.length} of {sections.length}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 overflow-y-auto space-y-1 p-3">
        {sections.map((section) => {
          const isActive = activeSection === section.id
          const isReviewed = reviewedSections.includes(section.id)
          const icon = SECTION_ICONS[section.id] || '📍'

          return (
            <Button
              key={section.id}
              variant="ghost"
              size="sm"
              className={cn(
                'w-full justify-start text-left h-auto py-2 px-3 relative group',
                isActive && 'bg-primary/10 text-primary',
                !isActive && 'hover:bg-accent/50'
              )}
              onClick={() => handleSectionClick(section.id)}
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                {/* Icon */}
                <span className="text-base flex-shrink-0">{icon}</span>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{section.label}</p>
                  {section.description && (
                    <p className="text-xs text-muted-foreground truncate group-hover:text-foreground transition-colors">
                      {section.description}
                    </p>
                  )}
                </div>

                {/* Reviewed indicator */}
                {isReviewed && (
                  <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
              </div>

              {/* Active indicator line */}
              {isActive && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 h-1 w-1 bg-primary rounded-full" />
              )}
            </Button>
          )
        })}
      </nav>

      {/* Footer note */}
      <div className="border-t bg-background/50 p-3">
        <p className="text-xs text-muted-foreground text-center">
          Scroll sections automatically track your progress
        </p>
      </div>
    </aside>
  )
}
