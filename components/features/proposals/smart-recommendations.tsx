/**
 * Smart Recommendations Component
 * AI-powered suggestions based on alternatives analysis
 * 
 * TIER 1 - CRITICAL
 * Shows AI transparency and creates engagement through optimization opportunities
 */

"use client"

import React, { useState } from 'react'
import { Lightbulb, TrendingDown, Zap, ChevronDown, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn, formatCurrency } from '@/lib/utils'

interface Alternative {
  technology: string
  reason_rejected: string
}

interface SmartRecommendationsProps {
  alternatives: Alternative[]
  currentCapex: number
  onExploreAlternative?: (alternative: Alternative) => void
  className?: string
}

interface RecommendationType {
  type: 'cost_optimization' | 'quality_improvement' | 'timeline_acceleration'
  icon: React.ElementType
  color: string
  bgColor: string
  borderColor: string
}

const RECOMMENDATION_TYPES = {
  cost_optimization: {
    type: 'cost_optimization' as const,
    icon: TrendingDown,
    color: 'text-green-700 dark:text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/50',
  },
  quality_improvement: {
    type: 'quality_improvement' as const,
    icon: Zap,
    color: 'text-blue-700 dark:text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/50',
  },
  timeline_acceleration: {
    type: 'timeline_acceleration' as const,
    icon: Zap,
    color: 'text-purple-700 dark:text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/50',
  },
} as const

function analyzeAlternative(
  alternative: Alternative,
  currentCapex: number
): {
  recommendationType: RecommendationType
  title: string
  savings?: number
  benefits: string[]
  confidence: number
} {
  const reason = alternative.reason_rejected.toLowerCase()

  // Cost optimization detection
  if (
    reason.includes('cost') ||
    reason.includes('expensive') ||
    reason.includes('opex') ||
    reason.includes('capex')
  ) {
    return {
      recommendationType: RECOMMENDATION_TYPES.cost_optimization,
      title: `Consider ${alternative.technology} to reduce costs`,
      savings: currentCapex * 0.2, // Estimate 20% savings
      benefits: [
        'Lower initial investment',
        'Reduced operating costs',
        'Same treatment level',
      ],
      confidence: 85,
    }
  }

  // Quality improvement detection
  if (
    reason.includes('efficiency') ||
    reason.includes('quality') ||
    reason.includes('performance')
  ) {
    return {
      recommendationType: RECOMMENDATION_TYPES.quality_improvement,
      title: `${alternative.technology} could improve effluent quality`,
      benefits: [
        'Higher removal efficiency',
        'Better effluent quality',
        'Greater reliability',
      ],
      confidence: 75,
    }
  }

  // Timeline detection
  if (
    reason.includes('time') ||
    reason.includes('installation') ||
    reason.includes('startup')
  ) {
    return {
      recommendationType: RECOMMENDATION_TYPES.timeline_acceleration,
      title: `${alternative.technology} could accelerate implementation`,
      benefits: [
        'Faster installation',
        'Shorter startup time',
        'Earlier delivery',
      ],
      confidence: 70,
    }
  }

  // Default
  return {
    recommendationType: RECOMMENDATION_TYPES.cost_optimization,
    title: `Alternative evaluated: ${alternative.technology}`,
    benefits: ['Option considered by AI agent'],
    confidence: 60,
  }
}

interface RecommendationCardProps {
  alternative: Alternative
  analysis: ReturnType<typeof analyzeAlternative>
  onExplore?: () => void
  onDismiss: () => void
}

function RecommendationCard({
  alternative,
  analysis,
  onExplore,
  onDismiss,
}: RecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { recommendationType, title, savings, benefits, confidence } = analysis
  const Icon = recommendationType.icon

  return (
    <Card
      className={cn(
        'border-l-4 transition-all hover:shadow-md',
        recommendationType.borderColor,
        recommendationType.bgColor
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon className={cn('h-5 w-5', recommendationType.color)} />
            <Badge variant="secondary" className="text-xs">
              {confidence}% confidence
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {savings && (
          <div className="rounded-lg bg-background p-3">
            <div className="text-sm font-medium text-muted-foreground">
              Potential savings
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {formatCurrency(savings)}
            </div>
          </div>
        )}

        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-between"
            >
              <span className="text-xs font-medium">
                {isExpanded ? 'Hide details' : 'View details'}
              </span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 transition-transform',
                  isExpanded && 'rotate-180'
                )}
              />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3 pt-3">
            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Benefits:
              </div>
              <ul className="space-y-1">
                {benefits.map((benefit, idx) => (
                  <li key={idx} className="text-sm">
                    • {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="mb-2 text-xs font-medium text-muted-foreground">
                Original rejection reason:
              </div>
              <p className="text-xs text-muted-foreground">
                {alternative.reason_rejected}
              </p>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <div className="flex gap-2">
          {onExplore && (
            <Button
              variant="outline"
              size="sm"
              onClick={onExplore}
              className="flex-1"
            >
              Explore Alternative
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="flex-1"
          >
            Dismiss
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function SmartRecommendations({
  alternatives,
  currentCapex,
  onExploreAlternative,
  className,
}: SmartRecommendationsProps) {
  const [dismissedIndices, setDismissedIndices] = useState<Set<number>>(
    new Set()
  )

  if (!alternatives || alternatives.length === 0) {
    return null
  }

  // Analyze alternatives and filter dismissed ones
  const recommendations = alternatives
    .map((alt, idx) => ({
      alternative: alt,
      analysis: analyzeAlternative(alt, currentCapex),
      index: idx,
    }))
    .filter((rec) => !dismissedIndices.has(rec.index))
    .sort((a, b) => b.analysis.confidence - a.analysis.confidence) // Sort by confidence

  if (recommendations.length === 0) {
    return null
  }

  const handleDismiss = (index: number) => {
    setDismissedIndices((prev) => new Set(prev).add(index))
  }

  return (
    <div className={cn('mb-12', className)}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            Smart Recommendations
          </h3>
          <p className="text-sm text-muted-foreground">
            The AI agent identified {recommendations.length} optimization opportunit
            {recommendations.length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
        <Badge variant="secondary">{recommendations.length} found</Badge>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec) => (
          <RecommendationCard
            key={rec.index}
            alternative={rec.alternative}
            analysis={rec.analysis}
            {...(onExploreAlternative
              ? { onExplore: () => onExploreAlternative(rec.alternative) }
              : {})}
            onDismiss={() => handleDismiss(rec.index)}
          />
        ))}
      </div>

      {recommendations.length > 0 && (
        <Alert className="mt-4 border-blue-500/50 bg-blue-500/10">
          <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-xs text-blue-700 dark:text-blue-300">
            <strong>AI Transparency:</strong> These recommendations are based on
            alternatives the agent considered but discarded. You can
            explore them if your priorities are different.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
