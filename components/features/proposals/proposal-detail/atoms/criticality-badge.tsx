/**
 * CriticalityBadge - Color-coded badge for equipment criticality
 *
 * Shows High/Medium/Low criticality with appropriate colors
 */

import { Badge } from '@/components/ui/badge'
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CriticalityBadgeProps } from '../types'

const CRITICALITY_CONFIG = {
  high: {
    label: 'High',
    icon: AlertTriangle,
    className: 'bg-red-500 hover:bg-red-600 text-white border-red-600',
  },
  medium: {
    label: 'Medium',
    icon: AlertCircle,
    className: 'bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600',
  },
  low: {
    label: 'Low',
    icon: CheckCircle,
    className: 'bg-green-500 hover:bg-green-600 text-white border-green-600',
  },
} as const

export function CriticalityBadge({
  level,
  showIcon = true,
  size = 'md',
}: CriticalityBadgeProps) {
  const config = CRITICALITY_CONFIG[level]
  const Icon = config.icon

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  return (
    <Badge
      variant="default"
      className={cn(
        config.className,
        sizeClasses[size],
        'font-medium'
      )}
    >
      {showIcon && <Icon className={cn(
        'mr-1',
        size === 'sm' && 'h-3 w-3',
        size === 'md' && 'h-3.5 w-3.5',
        size === 'lg' && 'h-4 w-4'
      )} />}
      {config.label}
    </Badge>
  )
}
