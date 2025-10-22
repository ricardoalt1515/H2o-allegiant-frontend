'use client'

import { useState, useCallback } from 'react'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useScrollToSection } from '@/lib/hooks'
import type { ProposalDetailSection } from '../types'

interface NavigationMobileProps {
  sections: ProposalDetailSection[]
  activeSection: string | null
  reviewedSections?: string[]
  completionPercent?: number
}

const SECTION_ICONS: Record<string, string> = {
  'trust-dashboard': '✨',
  'red-flags': '🚨',
  'technical-dive': '🔧',
  'economic': '💰',
  'ai-transparency': '🤖',
  'executive-summary': '📋',
}

export function NavigationMobile({
  sections,
  activeSection,
  reviewedSections = [],
  completionPercent = 0,
}: NavigationMobileProps) {
  const [isOpen, setIsOpen] = useState(false)
  const scrollToSection = useScrollToSection()

  const handleSectionClick = useCallback(
    (sectionId: string) => {
      scrollToSection(sectionId)
      setIsOpen(false)
    },
    [scrollToSection]
  )

  return (
    <>
      {/* Floating button (mobile only) */}
      <div className="lg:hidden fixed bottom-20 right-4 z-40">
        <Button
          size="lg"
          className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-all"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}

          {/* Progress badge */}
          {completionPercent > 0 && completionPercent < 100 && (
            <Badge
              variant="secondary"
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold"
            >
              {completionPercent}
            </Badge>
          )}
        </Button>
      </div>

      {/* Navigation sheet */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-lg">
          <SheetHeader className="space-y-3">
            <SheetTitle>Review Progress</SheetTitle>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {reviewedSections.length} of {sections.length} reviewed
                </span>
                <span className="font-semibold">{completionPercent}%</span>
              </div>
              <Progress value={completionPercent} className="h-2" />
            </div>
          </SheetHeader>

          {/* Sections list */}
          <nav className="mt-6 space-y-2 max-h-[calc(70vh-150px)] overflow-y-auto">
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
                    'w-full justify-start text-left h-auto py-3 px-3',
                    isActive && 'bg-primary/10 text-primary font-semibold'
                  )}
                  onClick={() => handleSectionClick(section.id)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Icon */}
                    <span className="text-lg">{icon}</span>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{section.label}</p>
                      {section.description && (
                        <p className="text-xs text-muted-foreground">
                          {section.description}
                        </p>
                      )}
                    </div>

                    {/* Status */}
                    {isReviewed ? (
                      <Badge variant="secondary" className="text-xs">
                        ✓ Done
                      </Badge>
                    ) : isActive ? (
                      <Badge variant="default" className="text-xs">
                        Viewing
                      </Badge>
                    ) : null}
                  </div>
                </Button>
              )
            })}
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
