/**
 * MetricCard - Atomic component for displaying key metrics
 *
 * Reusable card for showing single metric with icon, label, value and optional trend
 */

import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { MetricCardProps } from '../types'

export function MetricCard({
  label,
  value,
  icon,
  unit,
  trend,
  className,
  loading = false,
}: MetricCardProps) {
  if (loading) {
    return (
      <Card className={cn('aqua-metric-tile', className)}>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-24" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('aqua-metric-tile hover:shadow-lg transition-shadow', className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-muted-foreground">{icon}</div>
          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-medium',
              trend === 'up' && 'text-green-600',
              trend === 'down' && 'text-red-600',
              trend === 'neutral' && 'text-gray-600'
            )}>
              {trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend === 'down' && <TrendingDown className="h-3 w-3" />}
              {trend === 'neutral' && <Minus className="h-3 w-3" />}
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <div className="flex items-baseline gap-1">
            <p className="text-2xl font-bold text-gradient">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            {unit && (
              <span className="text-sm text-muted-foreground">{unit}</span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * MetricCardSkeleton - Loading state for MetricCard
 */
export function MetricCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('aqua-metric-tile', className)}>
      <CardContent className="p-6">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-8 w-24" />
      </CardContent>
    </Card>
  )
}
