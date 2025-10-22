"use client"

/**
 * Technical Approach Collapsed Component
 * 
 * Displays technical approach in a collapsible format to avoid
 * wall of text. Shows summary by default, full text on expand.
 * 
 * @module TechnicalApproachCollapsed
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface TechnicalApproachCollapsedProps {
  content: string
  maxPreviewChars?: number
}

export function TechnicalApproachCollapsed({ 
  content, 
  maxPreviewChars = 300 
}: TechnicalApproachCollapsedProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!content) return null

  const shouldCollapse = content.length > maxPreviewChars
  const preview = shouldCollapse ? content.slice(0, maxPreviewChars) + '...' : content

  return (
    <Card className="aqua-panel">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Technical Approach
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <div className={`whitespace-pre-wrap ${!isExpanded && shouldCollapse ? 'line-clamp-6' : ''}`}>
            {isExpanded || !shouldCollapse ? content : preview}
          </div>
        </div>

        {shouldCollapse && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 w-full"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Read more ({Math.ceil(content.length / 1000)}k chars)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
