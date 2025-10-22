/**
 * EquipmentTable - Display equipment list with criticality indicators
 *
 * Supports grouping by stage and criticality color-coding
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Wrench, Info } from 'lucide-react'
import { CriticalityBadge } from '../atoms'
import { formatCurrency } from '@/lib/utils'
import type { EquipmentTableProps } from '../types'

const STAGE_ORDER = {
  primary: 1,
  secondary: 2,
  tertiary: 3,
  auxiliary: 4,
} as const

const STAGE_LABELS = {
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  auxiliary: 'Auxiliary',
} as const

export function EquipmentTable({
  equipment,
  showCriticality = true,
  groupByStage = true,
  compact = false,
}: EquipmentTableProps) {
  if (!equipment || equipment.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No equipment list provided by the agent.
        </AlertDescription>
      </Alert>
    )
  }

  // Sort equipment by stage
  const sortedEquipment = [...equipment].sort((a, b) =>
    STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage]
  )

  // Group by stage if requested
  const groupedEquipment = groupByStage
    ? sortedEquipment.reduce((acc, eq) => {
        const stage = eq.stage
        if (!acc[stage]) {
          acc[stage] = []
        }
        acc[stage].push(eq)
        return acc
      }, {} as Record<string, typeof equipment>)
    : { all: sortedEquipment }

  const renderEquipmentCard = (eq: typeof equipment[0]) => (
    <div
      key={`${eq.type}-${eq.capacityM3Day}`}
      className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{eq.type}</h4>
            {showCriticality && eq.criticality && (
              <CriticalityBadge level={eq.criticality} size="sm" />
            )}
          </div>
          {eq.justification && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {eq.justification}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="text-muted-foreground">Capacity</p>
          <p className="font-medium">{eq.capacityM3Day.toLocaleString()} m³/day</p>
        </div>
        <div>
          <p className="text-muted-foreground">Power</p>
          <p className="font-medium">{eq.powerConsumptionKw} kW</p>
        </div>
        <div>
          <p className="text-muted-foreground">Dimensions</p>
          <p className="font-medium">{eq.dimensions || 'TBD'}</p>
        </div>
        <div>
          <p className="text-muted-foreground">CAPEX</p>
          <p className="font-medium">{formatCurrency(eq.capexUsd)}</p>
        </div>
      </div>

      {eq.specifications && !compact && (
        <div className="mt-3 pt-3 border-t">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium">Specifications:</span> {eq.specifications}
          </p>
        </div>
      )}
    </div>
  )

  if (compact || !groupByStage) {
    return (
      <div className="space-y-3">
        {sortedEquipment.map(renderEquipmentCard)}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5 text-primary" />
          <CardTitle>Equipment Specifications</CardTitle>
        </div>
        <CardDescription>
          List of main equipment in the treatment system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible defaultValue="primary">
          {Object.entries(groupedEquipment).map(([stage, eqList]) => (
            <AccordionItem key={stage} value={stage}>
              <AccordionTrigger className="hover:no-underline">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="font-normal">
                    {STAGE_LABELS[stage as keyof typeof STAGE_LABELS] || stage}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {eqList.length} equipment{eqList.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-3 pt-2">
                  {eqList.map(renderEquipmentCard)}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Total equipment cost */}
        <div className="mt-6 pt-4 border-t flex items-center justify-between">
          <span className="text-sm font-medium">Total Equipment:</span>
          <span className="text-lg font-bold text-primary">
            {formatCurrency(equipment.reduce((sum, eq) => sum + eq.capexUsd, 0))}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
