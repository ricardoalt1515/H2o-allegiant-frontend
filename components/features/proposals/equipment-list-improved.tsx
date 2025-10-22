"use client"

/**
 * Equipment List Improved Component
 * 
 * Displays equipment with capacity progress bars and technical tooltips.
 * Smart prioritization shows critical equipment first.
 * 
 * @module EquipmentListImproved
 */

import { useState } from 'react'
import { ChevronDown, ChevronUp, AlertCircle, AlertTriangle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/utils'
import { EquipmentCapacityProgress, EquipmentCapacityOverview, calculateUtilization } from './equipment-capacity-progress'
import { TechnicalTermTooltip, InlineTerm } from './technical-term-tooltip'
import { getDesignFlowRate, calculateEquipmentUtilization } from '@/lib/proposal-data-helpers'
import type { EquipmentSpec, Proposal } from './types'

interface EquipmentListImprovedProps {
  equipmentList: EquipmentSpec[]
  proposal: Proposal // Need full proposal to get design flow from agent
}

const STAGE_LABELS = {
  primary: 'Primary',
  secondary: 'Secondary',
  tertiary: 'Tertiary',
  auxiliary: 'Auxiliary',
} as const

const CRITICALITY_CONFIG = {
  high: {
    label: 'Critical',
    badgeVariant: 'destructive' as const,
    borderColor: 'border-red-300 bg-red-50 dark:border-red-800 dark:bg-red-950/20',
  },
  medium: {
    label: 'Medium',
    badgeVariant: 'secondary' as const,
    borderColor: 'border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/20',
  },
  low: {
    label: 'Low',
    badgeVariant: 'outline' as const,
    borderColor: 'border-primary/30 bg-primary/5',
  },
} as const

export function EquipmentListImproved({ equipmentList, proposal }: EquipmentListImprovedProps) {
  const [showAll, setShowAll] = useState(false)
  
  if (!equipmentList || equipmentList.length === 0) return null

  // Get design flow rate from AI agent (NEVER hardcode)
  const designFlowM3Day = getDesignFlowRate(proposal)
  const hasDesignFlow = designFlowM3Day !== null && designFlowM3Day > 0

  // Sort by criticality and stage
  const sortedEquipment = [...equipmentList].sort((a, b) => {
    const criticalityOrder = { high: 1, medium: 2, low: 3 }
    const critDiff = criticalityOrder[a.criticality] - criticalityOrder[b.criticality]
    if (critDiff !== 0) return critDiff
    
    // Secondary sort by stage
    const stageOrder = { primary: 1, secondary: 2, tertiary: 3, auxiliary: 4 }
    return stageOrder[a.stage] - stageOrder[b.stage]
  })

  // Critical equipment (always shown)
  const criticalEquipment = sortedEquipment.filter(eq => eq.criticality === 'high')
  const nonCriticalEquipment = sortedEquipment.filter(eq => eq.criticality !== 'high')
  
  // Show top 3 critical, then 2 non-critical by default
  const defaultVisible = [
    ...criticalEquipment.slice(0, 3),
    ...nonCriticalEquipment.slice(0, 2)
  ]
  
  const visibleEquipment = showAll ? sortedEquipment : defaultVisible
  const hiddenCount = sortedEquipment.length - defaultVisible.length

  // Prepare data for overview (only if we have design flow from agent)
  const equipmentWithCapacity = hasDesignFlow
    ? equipmentList
        .filter(eq => eq.capacityM3Day && eq.capacityM3Day > 0)
        .map(eq => ({
          type: eq.type,
          designFlowM3Day: designFlowM3Day, // From AI agent, not hardcoded
          capacityM3Day: eq.capacityM3Day,
        }))
    : []

  // Calculate total CAPEX
  const totalCapex = equipmentList.reduce((sum, eq) => sum + eq.capexUsd, 0)

  return (
    <div className="space-y-6">
      {/* Warning if no design flow from agent */}
      {!hasDesignFlow && (
        <Alert variant="default" className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-sm">
            <strong>Limited agent data:</strong> Design flow rate not found.
            Utilization metrics cannot be calculated.
          </AlertDescription>
        </Alert>
      )}

      {/* Equipment Capacity Overview (only if we have data) */}
      {hasDesignFlow && equipmentWithCapacity.length > 0 && (
        <EquipmentCapacityOverview equipmentList={equipmentWithCapacity} />
      )}

      <Card className="aqua-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Main Equipment
            <Badge variant="secondary" className="ml-auto">
              {equipmentList.length} items
            </Badge>
          </CardTitle>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 text-center text-sm">
            <div>
              <div className="text-2xl font-bold text-destructive">
                {criticalEquipment.length}
              </div>
              <div className="text-xs text-muted-foreground">Critical</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {formatCurrency(totalCapex)}
              </div>
              <div className="text-xs text-muted-foreground">Total CAPEX</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {equipmentList.reduce((sum, eq) => sum + eq.powerConsumptionKw, 0).toFixed(0)}
              </div>
              <div className="text-xs text-muted-foreground">Total kW</div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
        {visibleEquipment.map((equipment, idx) => {
          const config = CRITICALITY_CONFIG[equipment.criticality]
          
          // Calculate utilization using REAL design flow from agent
          const utilization = calculateEquipmentUtilization(equipment, designFlowM3Day)
          
          return (
            <Collapsible key={`${equipment.type}-${idx}`} defaultOpen={equipment.criticality === 'high'}>
              <Card className={cn('overflow-hidden', config.borderColor)}>
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {STAGE_LABELS[equipment.stage]}
                          </Badge>
                          <Badge variant={config.badgeVariant} className="text-xs">
                            {config.label}
                          </Badge>
                        </div>
                        <CardTitle className="text-base">{equipment.type}</CardTitle>
                      </div>
                      
                      {/* Quick metrics visible always */}
                      <div className="flex items-center gap-4 text-sm">
                        <div className="text-right">
                          <div className="font-medium">{equipment.capacityM3Day.toLocaleString()} m³/d</div>
                          <div className="text-xs text-muted-foreground">Capacity</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(equipment.capexUsd)}</div>
                          <div className="text-xs text-muted-foreground">CAPEX</div>
                        </div>
                        <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    {/* Capacity Progress (only if we have design flow from agent) */}
                    {hasDesignFlow && designFlowM3Day && equipment.capacityM3Day > 0 && (
                      <EquipmentCapacityProgress
                        equipmentType={equipment.type}
                        designFlowM3Day={designFlowM3Day} // From agent, not hardcoded
                        capacityM3Day={equipment.capacityM3Day}
                        showDetails={true}
                      />
                    )}
                    
                    {/* Warning if no design flow */}
                    {!hasDesignFlow && (
                      <Alert variant="default" className="border-muted">
                        <AlertDescription className="text-xs text-muted-foreground">
                          Utilization metrics unavailable without design flow rate from agent.
                        </AlertDescription>
                      </Alert>
                    )}

                    {/* Specs grid */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground text-xs mb-1">
                          <TechnicalTermTooltip term="Capacity">
                            Capacity
                          </TechnicalTermTooltip>
                        </div>
                        <div className="font-medium font-mono">
                          {equipment.capacityM3Day.toLocaleString()} m³/d
                        </div>
                      </div>

                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Power</div>
                        <div className="font-medium font-mono">{equipment.powerConsumptionKw} kW</div>
                      </div>

                      <div>
                        <div className="text-muted-foreground text-xs mb-1">Dimensions</div>
                        <div className="font-medium text-xs font-mono">{equipment.dimensions}</div>
                      </div>

                      <div>
                        <div className="text-muted-foreground text-xs mb-1">
                          Risk Factor
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="font-medium">
                            {((equipment.riskFactor || 0.5) * 100).toFixed(0)}%
                          </div>
                          {(equipment.riskFactor || 0) > 0.7 && (
                            <AlertCircle className="h-3 w-3 text-amber-600" />
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Justification */}
                    {equipment.justification && (
                      <div className="pt-3 border-t">
                        <div className="text-xs text-muted-foreground leading-relaxed">
                          💡 <strong>Justification:</strong> {equipment.justification}
                        </div>
                      </div>
                    )}

                    {/* Technical specs (collapsible) */}
                    {equipment.specifications && (
                      <details className="group">
                        <summary className="text-xs text-primary cursor-pointer hover:underline flex items-center gap-1">
                          <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
                          View full technical specifications
                        </summary>
                        <div className="mt-2 text-xs text-muted-foreground p-3 bg-muted/30 rounded-lg leading-relaxed">
                          {equipment.specifications}
                        </div>
                      </details>
                    )}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          )
        })}

        {hiddenCount > 0 && (
          <Button
            variant="outline"
            className="w-full mt-2"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show {hiddenCount} additional equipment
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
    </div>
  )
}
