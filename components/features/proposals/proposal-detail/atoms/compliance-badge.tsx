/**
 * ComplianceBadge - Shows compliance status (pass/fail)
 *
 * Simple badge for indicating regulatory compliance
 */

import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ComplianceBadgeProps } from '../types'

export function ComplianceBadge({ passes, compact = false }: ComplianceBadgeProps) {
  if (compact) {
    return (
      <Badge
        variant={passes ? 'default' : 'destructive'}
        className={cn(
          passes && 'bg-success text-success-foreground'
        )}
      >
        {passes ? '✓' : '✗'}
      </Badge>
    )
  }

  return (
    <Badge
      variant={passes ? 'default' : 'destructive'}
      className={cn(
        'font-medium',
        passes && 'bg-success text-success-foreground'
      )}
    >
      {passes ? (
        <>
          <CheckCircle className="mr-1.5 h-3.5 w-3.5" />
          Cumple
        </>
      ) : (
        <>
          <XCircle className="mr-1.5 h-3.5 w-3.5" />
          No cumple
        </>
      )}
    </Badge>
  )
}
