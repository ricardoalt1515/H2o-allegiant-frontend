"use client"

/**
 * Equipment Capacity Progress Component
 * Visual indicator of equipment utilization/capacity
 */

import { Progress } from '@/components/ui/progress'
import { TechnicalTermTooltip } from './technical-term-tooltip'
import { cn } from '@/lib/utils'

interface EquipmentCapacityProgressProps {
  /** Equipment type/name */
  equipmentType: string
  /** Design flow rate (m³/day) */
  designFlowM3Day: number
  /** Equipment capacity (m³/day) */
  capacityM3Day: number
  /** Show detailed breakdown */
  showDetails?: boolean
  /** Custom className */
  className?: string
}

export function EquipmentCapacityProgress({
  equipmentType,
  designFlowM3Day,
  capacityM3Day,
  showDetails = true,
  className,
}: EquipmentCapacityProgressProps) {
  // Calculate utilization percentage
  const utilization = (designFlowM3Day / capacityM3Day) * 100
  const utilizationClamped = Math.min(Math.max(utilization, 0), 100)

  // Determine status and color
  const status = getUtilizationStatus(utilization)
  
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header with utilization percentage */}
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">
          Capacity utilization
        </span>
        <div className="flex items-baseline gap-2">
          <span className={cn(
            'text-xl font-bold tabular-nums',
            status.color
          )}>
            {utilizationClamped.toFixed(0)}%
          </span>
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            status.badgeClass
          )}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <Progress
        value={utilizationClamped}
        className={cn("h-3", status.progressClass)}
      />

      {/* Details breakdown */}
      {showDetails && (
        <div className="flex justify-between text-xs">
          <div className="text-muted-foreground">
            <span className="font-medium">Design flow:</span>{' '}
            <span className="tabular-nums">{designFlowM3Day.toLocaleString()}</span> m³/d
          </div>
          <div className="text-muted-foreground">
            <span className="font-medium">Capacity:</span>{' '}
            <span className="tabular-nums">{capacityM3Day.toLocaleString()}</span> m³/d
          </div>
        </div>
      )}

      {/* Buffer/Safety factor */}
      {showDetails && (
        <div className="text-xs text-muted-foreground">
          <TechnicalTermTooltip term="Buffer" className="font-medium">
            Safety factor:
          </TechnicalTermTooltip>{' '}
          <span className={cn(
            'tabular-nums font-medium',
            utilization > 90 ? 'text-destructive' :
            utilization > 75 ? 'text-amber-600' :
            'text-green-600'
          )}>
            {((capacityM3Day - designFlowM3Day) / designFlowM3Day * 100).toFixed(0)}%
          </span>
          {' '}({(capacityM3Day - designFlowM3Day).toLocaleString()} m³/d available)
        </div>
      )}

      {/* Warning message for high utilization */}
      {utilization > 90 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="text-destructive text-xs leading-relaxed">
            ⚠️ <strong>High utilization:</strong> Equipment operating near capacity limit.
            Consider additional capacity if future growth is expected.
          </div>
        </div>
      )}

      {/* Info message for low utilization */}
      {utilization < 60 && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-muted/50 border border-border">
          <div className="text-muted-foreground text-xs leading-relaxed">
            ℹ️ <strong>Oversized:</strong> Equipment has ample buffer for
            future growth or load peaks.
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Compact version for equipment lists
 */
interface CompactCapacityProgressProps {
  utilization: number
  showPercentage?: boolean
}

export function CompactCapacityProgress({
  utilization,
  showPercentage = true,
}: CompactCapacityProgressProps) {
  const status = getUtilizationStatus(utilization)
  const utilizationClamped = Math.min(Math.max(utilization, 0), 100)

  return (
    <div className="flex items-center gap-3">
      <Progress
        value={utilizationClamped}
        className={cn("h-2 flex-1", status.progressClass)}
      />
      {showPercentage && (
        <span className={cn(
          'text-sm font-medium tabular-nums w-12 text-right',
          status.color
        )}>
          {utilizationClamped.toFixed(0)}%
        </span>
      )}
    </div>
  )
}

/**
 * Determine utilization status and styling
 */
function getUtilizationStatus(utilization: number) {
  if (utilization > 90) {
    return {
      label: 'High load',
      color: 'text-destructive',
      badgeClass: 'bg-destructive/10 text-destructive',
      progressClass: 'bg-destructive',
    }
  }

  if (utilization > 75) {
    return {
      label: 'Optimal',
      color: 'text-amber-600 dark:text-amber-500',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-500',
      progressClass: 'bg-amber-500',
    }
  }

  return {
    label: 'Oversized',
    color: 'text-green-600 dark:text-green-500',
    badgeClass: 'bg-green-500/10 text-green-600 dark:text-green-500',
    progressClass: 'bg-green-600',
  }
}

/**
 * Helper to calculate utilization from equipment data
 */
export function calculateUtilization(
  designFlow: number,
  capacity: number
): number {
  if (capacity <= 0) return 0
  return (designFlow / capacity) * 100
}

/**
 * Multi-equipment capacity overview
 */
interface EquipmentCapacityOverviewProps {
  equipmentList: Array<{
    type: string
    designFlowM3Day: number
    capacityM3Day: number
  }>
}

export function EquipmentCapacityOverview({
  equipmentList,
}: EquipmentCapacityOverviewProps) {
  const avgUtilization = equipmentList.reduce((acc, eq) => {
    return acc + calculateUtilization(eq.designFlowM3Day, eq.capacityM3Day)
  }, 0) / equipmentList.length

  const highLoadCount = equipmentList.filter(eq => 
    calculateUtilization(eq.designFlowM3Day, eq.capacityM3Day) > 90
  ).length

  const status = getUtilizationStatus(avgUtilization)

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">System Average Utilization</h4>
        <span className={cn('text-2xl font-bold tabular-nums', status.color)}>
          {avgUtilization.toFixed(0)}%
        </span>
      </div>

      <Progress
        value={avgUtilization}
        className={cn("h-2", status.progressClass)}
      />

      <div className="grid grid-cols-3 gap-4 pt-2 border-t text-center">
        <div>
          <div className="text-xl font-bold">{equipmentList.length}</div>
          <div className="text-xs text-muted-foreground">Total equipment</div>
        </div>
        <div>
          <div className="text-xl font-bold text-destructive">{highLoadCount}</div>
          <div className="text-xs text-muted-foreground">High load</div>
        </div>
        <div>
          <div className={cn('text-xl font-bold', status.color)}>
            {status.label}
          </div>
          <div className="text-xs text-muted-foreground">Overall status</div>
        </div>
      </div>
    </div>
  )
}
