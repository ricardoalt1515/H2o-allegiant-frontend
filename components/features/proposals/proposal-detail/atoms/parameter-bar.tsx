/**
 * ParameterBar - Visual representation of water parameter transformation
 *
 * Shows before → after with removal efficiency bar
 */

import { Badge } from '@/components/ui/badge'
import { CheckCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ParameterBarProps } from '../types'

export function ParameterBar({
  parameter,
  influent,
  effluent,
  removalPercent,
  unit,
  target,
  showCompliance = true,
}: ParameterBarProps) {
  const meetsTarget = target !== undefined ? effluent <= target : true
  const isHighRemoval = removalPercent >= 95

  return (
    <div className="space-y-2">
      {/* Parameter header */}
      <div className="flex items-center justify-between">
        <span className="font-semibold text-sm">{parameter}</span>
        <Badge
          variant={isHighRemoval ? 'default' : 'secondary'}
          className={cn(
            'text-xs',
            isHighRemoval && 'bg-success text-success-foreground'
          )}
        >
          {removalPercent.toFixed(1)}% removal
        </Badge>
      </div>

      {/* Visual bar - Before → After */}
      <div className="relative h-10 rounded-lg overflow-hidden bg-muted border">
        {/* Background (influent - red) */}
        <div className="absolute inset-0 bg-gradient-to-r from-red-200 to-red-300 dark:from-red-900/40 dark:to-red-800/40" />

        {/* Foreground (effluent - green) */}
        <div
          className="absolute inset-y-0 right-0 bg-gradient-to-r from-green-400 to-green-500 dark:from-green-600 dark:to-green-700 transition-all duration-500"
          style={{ width: `${Math.min(100 - removalPercent, 100)}%` }}
        />

        {/* Labels */}
        <div className="relative h-full flex items-center justify-between px-3 text-xs font-semibold">
          <span className="text-red-900 dark:text-red-100 drop-shadow">
            {influent} {unit}
          </span>
          <span className="text-green-900 dark:text-green-100 drop-shadow">
            {effluent} {unit}
          </span>
        </div>
      </div>

      {/* Compliance indicator */}
      {showCompliance && target !== undefined && (
        <div className={cn(
          'flex items-center gap-1.5 text-xs',
          meetsTarget ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
        )}>
          {meetsTarget && (
            <>
              <CheckCircle className="h-3 w-3" />
              <span>Meets target (≤ {target} {unit})</span>
            </>
          )}
          {!meetsTarget && (
            <span>⚠️ Above target ({target} {unit})</span>
          )}
        </div>
      )}
    </div>
  )
}

/**
 * SimpleParameterBar - Compact version without compliance
 */
export function SimpleParameterBar({
  parameter,
  removalPercent,
}: {
  parameter: string
  removalPercent: number
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-medium min-w-[80px]">{parameter}</span>
      <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
          style={{ width: `${removalPercent}%` }}
        />
      </div>
      <span className="text-sm font-medium text-muted-foreground min-w-[50px] text-right">
        {removalPercent.toFixed(1)}%
      </span>
    </div>
  )
}
