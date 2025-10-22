/**
 * ConfidenceIndicator - Shows AI confidence level with visual indicator
 *
 * Displays High/Medium/Low confidence from AI metadata
 */

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ConfidenceIndicatorProps } from '../types'

const CONFIDENCE_CONFIG = {
  High: {
    icon: CheckCircle2,
    label: 'High Confidence',
    className: 'bg-success text-success-foreground',
    iconColor: 'text-success',
    description: 'Strong engineering rationale based on proven cases',
  },
  Medium: {
    icon: AlertCircle,
    label: 'Medium Confidence',
    className: 'bg-amber-500 text-white',
    iconColor: 'text-amber-500',
    description: 'Good engineering basis with some assumptions',
  },
  Low: {
    icon: XCircle,
    label: 'Low Confidence',
    className: 'bg-destructive text-destructive-foreground',
    iconColor: 'text-destructive',
    description: 'Limited data - requires engineering validation',
  },
} as const

export function ConfidenceIndicator({
  level,
  showDetails = false,
  compact = false,
}: ConfidenceIndicatorProps) {
  const config = CONFIDENCE_CONFIG[level]
  const Icon = config.icon

  if (compact) {
    return (
      <Badge variant="default" className={cn(config.className, 'font-medium')}>
        <Icon className="mr-1.5 h-4 w-4" />
        {config.label}
      </Badge>
    )
  }

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        <Icon className={cn('h-5 w-5', config.iconColor)} />
        <div>
          <p className="font-medium text-sm">{config.label}</p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <Icon className={cn('h-6 w-6 mt-0.5', config.iconColor)} />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold">AI Confidence Level</p>
              <Badge className={config.className}>{level}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {config.description}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
