/**
 * CostBreakdownSection - CAPEX/OPEX breakdown with validation
 *
 * Shows detailed cost breakdown with sum validation
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Progress } from '@/components/ui/progress'
import { AlertTriangle, DollarSign, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { CostBreakdownSectionProps, CostBreakdown, OperationalCosts } from '../types'

export function CostBreakdownSection({
  type,
  breakdown,
  total,
  validateSum = true,
}: CostBreakdownSectionProps) {
  if (!breakdown) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          {type} breakdown not provided by the agent.
        </AlertDescription>
      </Alert>
    )
  }

  // Calculate sum from breakdown
  const breakdownValues = Object.values(breakdown).filter(v => typeof v === 'number') as number[]
  const calculatedSum = breakdownValues.reduce((sum, val) => sum + val, 0)
  const discrepancy = Math.abs(calculatedSum - total)
  const hasDiscrepancy = validateSum && discrepancy > 1 // $1 tolerance for rounding

  // Prepare breakdown items based on type
  const items = type === 'CAPEX'
    ? [
        { label: 'Equipment', value: (breakdown as CostBreakdown).equipmentCost, key: 'equipmentCost' },
        { label: 'Civil Works', value: (breakdown as CostBreakdown).civilWorks, key: 'civilWorks' },
        { label: 'Installation & Piping', value: (breakdown as CostBreakdown).installationPiping, key: 'installationPiping' },
        { label: 'Engineering & Supervision', value: (breakdown as CostBreakdown).engineeringSupervision, key: 'engineeringSupervision' },
        { label: 'Contingencies', value: (breakdown as CostBreakdown).contingency, key: 'contingency' },
      ]
    : [
        { label: 'Electrical Energy', value: (breakdown as OperationalCosts).electricalEnergy, key: 'electricalEnergy' },
        { label: 'Chemicals', value: (breakdown as OperationalCosts).chemicals, key: 'chemicals' },
        { label: 'Personnel', value: (breakdown as OperationalCosts).personnel, key: 'personnel' },
        { label: 'Maintenance & Spare Parts', value: (breakdown as OperationalCosts).maintenanceSpareParts, key: 'maintenanceSpareParts' },
      ]

  // Filter out undefined/null values
  const validItems = items.filter(item => item.value !== undefined && item.value !== null)

  if (validItems.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Incomplete {type} breakdown from the agent.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-primary" />
          <CardTitle>{type} Breakdown</CardTitle>
        </div>
        <CardDescription>
          {type === 'CAPEX' ? 'Initial investment' : 'Annual operational costs'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Validation warning */}
        {hasDiscrepancy && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              ⚠️ Inconsistency detected: Sum of breakdown ({formatCurrency(calculatedSum)})
              does not match total ({formatCurrency(total)}).
              Difference: {formatCurrency(discrepancy)}
            </AlertDescription>
          </Alert>
        )}

        {/* Breakdown items */}
        <div className="space-y-4">
          {validItems.map((item) => {
            const percentage = total > 0 ? (item.value! / total) * 100 : 0
            return (
              <div key={item.key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{item.label}</span>
                  <div className="text-right">
                    <span className="font-bold">{formatCurrency(item.value!)}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <Progress value={percentage} className="h-2" />
              </div>
            )
          })}
        </div>

        {/* Total */}
        <div className="mt-6 pt-4 border-t flex items-center justify-between">
          <span className="font-semibold">Total {type}:</span>
          <span className="text-2xl font-bold text-primary">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Validation note */}
        {!hasDiscrepancy && validateSum && (
          <div className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
            ✓ Sum validated correctly
          </div>
        )}
      </CardContent>
    </Card>
  )
}
