/**
 * TreatmentTrainInteractive - Phase 1 Redesign
 *
 * Interactive treatment train flow with tooltips, modals, and criticality indicators.
 * Replaces the static text-based flow with a visual, explorable diagram.
 */

'use client'

import { useState } from 'react'
import { Info, Zap, DollarSign, Droplet } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { formatCurrency } from '@/lib/utils'
import { CriticalityBadge } from '../atoms'
import type { EquipmentSpec } from '../types'

export interface TreatmentTrainInteractiveProps {
  equipmentList: EquipmentSpec[]
}

const STAGE_ORDER = {
  primary: 1,
  secondary: 2,
  tertiary: 3,
  auxiliary: 4,
} as const

const STAGE_COLORS = {
  primary: 'border-blue-300 bg-blue-50 dark:bg-blue-950/20',
  secondary: 'border-green-300 bg-green-50 dark:bg-green-950/20',
  tertiary: 'border-purple-300 bg-purple-50 dark:bg-purple-950/20',
  auxiliary: 'border-gray-300 bg-gray-50 dark:bg-gray-950/20',
} as const

export function TreatmentTrainInteractive({ equipmentList }: TreatmentTrainInteractiveProps) {
  const [selectedEquipment, setSelectedEquipment] = useState<EquipmentSpec | null>(null)

  if (!equipmentList || equipmentList.length === 0) return null

  const processEquipment = equipmentList
    .filter((eq) => ['primary', 'secondary', 'tertiary'].includes(eq.stage))
    .sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage])

  if (processEquipment.length === 0) return null

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Treatment Process Flow</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Click for details</span>
          </div>
        </div>

        {/* Interactive flow - horizontal scrollable */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 scroll-smooth">
          {/* Influent */}
          <div className="flex-shrink-0 text-center min-w-[80px]">
            <Droplet className="h-8 w-8 mx-auto mb-2 text-gray-500" />
            <p className="text-xs font-medium text-muted-foreground">Influent</p>
          </div>

          {/* Equipment nodes */}
          {processEquipment.map((equipment, idx, arr) => (
            <div key={`${equipment.type}-${idx}`} className="flex items-center gap-3 flex-shrink-0">
              {/* Arrow */}
              <div className="flex-shrink-0 text-2xl text-muted-foreground/40">→</div>

              {/* Equipment card */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Card
                      className={`
                        min-w-[160px] max-w-[160px] cursor-pointer transition-all
                        hover:shadow-lg hover:-translate-y-1 active:scale-95
                        ${STAGE_COLORS[equipment.stage]}
                      `}
                      onClick={() => setSelectedEquipment(equipment)}
                    >
                      <CardContent className="p-4 relative">
                        {/* Criticality badge */}
                        {equipment.criticality && (
                          <div className="absolute top-2 right-2">
                            <Badge
                              variant={
                                equipment.criticality === 'high' ? 'destructive' :
                                equipment.criticality === 'medium' ? 'warning' : 'secondary'
                              }
                              className="h-5 px-1.5 text-[10px]"
                            >
                              {equipment.criticality}
                            </Badge>
                          </div>
                        )}

                        {/* Equipment info */}
                        <div className="space-y-2">
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
                            {equipment.stage}
                          </div>
                          <div className="font-semibold text-sm leading-tight line-clamp-2">
                            {equipment.type}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {equipment.capacityM3Day.toLocaleString()} m³/d
                          </div>
                        </div>

                        {/* Quick stats */}
                        <div className="mt-3 pt-2 border-t border-current/10 flex items-center justify-between text-[10px] text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {equipment.powerConsumptionKw}kW
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {Math.round(equipment.capexUsd / 1000)}K
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TooltipTrigger>

                  {/* Tooltip with quick preview */}
                  <TooltipContent side="top" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{equipment.type}</p>
                      <p className="text-xs text-muted-foreground">{equipment.specifications}</p>
                      <Separator className="my-2" />
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-muted-foreground">Power:</span>{' '}
                          {equipment.powerConsumptionKw}kW
                        </div>
                        <div>
                          <span className="text-muted-foreground">Cost:</span>{' '}
                          {formatCurrency(equipment.capexUsd)}
                        </div>
                      </div>
                      <p className="text-xs text-primary mt-2">Click for full details</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Arrow after (except last) */}
              {idx < arr.length - 1 && (
                <div className="flex-shrink-0 text-2xl text-muted-foreground/40">→</div>
              )}
            </div>
          ))}

          {/* Final arrow */}
          <div className="flex-shrink-0 text-2xl text-muted-foreground/40">→</div>

          {/* Effluent */}
          <div className="flex-shrink-0 text-center min-w-[80px]">
            <Droplet className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-xs font-medium text-muted-foreground">Effluent</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground border-t pt-3">
          <span className="font-medium">Legend:</span>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded border-2 border-blue-300 bg-blue-50"></div>
            <span>Primary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded border-2 border-green-300 bg-green-50"></div>
            <span>Secondary</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded border-2 border-purple-300 bg-purple-50"></div>
            <span>Tertiary</span>
          </div>
          <Separator orientation="vertical" className="h-4" />
          <CriticalityBadge level="high" size="sm" showIcon={false} />
          <span className="text-xs">= Critical Equipment</span>
        </div>
      </div>

      {/* Equipment Detail Modal */}
      <Dialog open={!!selectedEquipment} onOpenChange={() => setSelectedEquipment(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedEquipment?.type}
              {selectedEquipment?.criticality && (
                <CriticalityBadge level={selectedEquipment.criticality} size="sm" />
              )}
            </DialogTitle>
            <DialogDescription>
              <Badge variant="outline" className="mt-2">
                {selectedEquipment?.stage} Treatment
              </Badge>
            </DialogDescription>
          </DialogHeader>

          {selectedEquipment && (
            <div className="space-y-6">
              {/* Key Specifications */}
              <div>
                <h4 className="font-semibold mb-3">Key Specifications</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Capacity</p>
                    <p className="font-medium">{selectedEquipment.capacityM3Day.toLocaleString()} m³/day</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Power Consumption</p>
                    <p className="font-medium">{selectedEquipment.powerConsumptionKw} kW</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Dimensions</p>
                    <p className="font-medium">{selectedEquipment.dimensions || 'TBD'}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">CAPEX</p>
                    <p className="font-medium">{formatCurrency(selectedEquipment.capexUsd)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Technical Details */}
              <div>
                <h4 className="font-semibold mb-3">Technical Details</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {selectedEquipment.specifications}
                </p>
              </div>

              {/* Justification */}
              {selectedEquipment.justification && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">AI Justification</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedEquipment.justification}
                    </p>
                  </div>
                </>
              )}

              {/* Criticality Explanation */}
              {selectedEquipment.criticality && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      Criticality Assessment
                      <CriticalityBadge level={selectedEquipment.criticality} size="sm" />
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {getCriticalityExplanation(selectedEquipment.criticality, selectedEquipment.stage)}
                    </p>
                  </div>
                </>
              )}

              {/* Risk Factor */}
              {selectedEquipment.riskFactor !== undefined && (
                <>
                  <Separator />
                  <div>
                    <h4 className="font-semibold mb-3">Risk Assessment</h4>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              selectedEquipment.riskFactor > 0.7 ? 'bg-red-500' :
                              selectedEquipment.riskFactor > 0.4 ? 'bg-amber-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${selectedEquipment.riskFactor * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-medium">
                        {Math.round(selectedEquipment.riskFactor * 100)}%
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Get criticality explanation based on level and stage
 */
function getCriticalityExplanation(level: 'high' | 'medium' | 'low', stage: string): string {
  if (level === 'high') {
    return `This is a mission-critical equipment for ${stage} treatment. System performance heavily depends on this component. Failure or underperformance would compromise overall treatment effectiveness and regulatory compliance.`
  } else if (level === 'medium') {
    return `This equipment plays an important role in ${stage} treatment. While not mission-critical, its performance significantly impacts overall system efficiency and treatment quality.`
  } else {
    return `This is a supporting equipment for ${stage} treatment. While important for system optimization, its failure would not critically compromise treatment objectives.`
  }
}
