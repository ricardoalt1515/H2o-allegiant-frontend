"use client"

/**
 * Treatment Train Flow - Minimalist Design
 * Clean process flow visualization
 */

import { cn } from '@/lib/utils'
import type { EquipmentSpec } from './types'

interface TreatmentTrainFlowProps {
  equipmentList: EquipmentSpec[]
}

const STAGE_ORDER = {
  primary: 1,
  secondary: 2,
  tertiary: 3,
  auxiliary: 4,
} as const

export function TreatmentTrainFlow({ equipmentList }: TreatmentTrainFlowProps) {
  if (!equipmentList || equipmentList.length === 0) return null

  const processEquipment = equipmentList
    .filter((eq) => ['primary', 'secondary', 'tertiary'].includes(eq.stage))
    .sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage])

  if (processEquipment.length === 0) return null

  return (
    <div className="mb-12">
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-6">
        Tren de Tratamiento
      </div>
      
      {/* Minimalist flow - horizontal */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2">
        {processEquipment.map((equipment, idx, arr) => (
          <div key={`${equipment.type}-${idx}`} className="flex items-center gap-4 flex-shrink-0">
            {/* Equipment block - clean */}
            <div className="min-w-[140px]">
              <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                {equipment.stage}
              </div>
              <div className="font-medium text-sm leading-tight">
                {equipment.type}
              </div>
              <div className="text-xs text-muted-foreground mt-1 font-mono">
                {equipment.capacityM3Day.toLocaleString()} m³/d
              </div>
            </div>
            
            {/* Arrow connector */}
            {idx < arr.length - 1 && (
              <div className="flex-shrink-0 text-muted-foreground/30">
                →
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
