"use client"

/**
 * ROI Metrics Cards - Minimalist Design
 * Clean financial metrics display
 */

import { formatCurrency } from '@/lib/utils'
import type { TechnicalData } from './types'

interface ROIMetricsCardsProps {
  technicalData?: TechnicalData
}

export function ROIMetricsCards({ technicalData }: ROIMetricsCardsProps) {
  if (!technicalData) return null

  const { paybackYears, annualSavingsUsd, roiPercent } = technicalData

  if (!paybackYears && !annualSavingsUsd && !roiPercent) return null

  return (
    <div className="grid md:grid-cols-3 gap-8 mb-12 py-8 border-y">
      {paybackYears && (
        <div className="space-y-2">
          <div className="text-4xl font-bold tracking-tighter">
            {paybackYears.toFixed(1)}
            <span className="text-2xl text-muted-foreground ml-1">años</span>
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">
            Payback Period
          </div>
        </div>
      )}
      
      {annualSavingsUsd && (
        <div className="space-y-2">
          <div className="text-4xl font-bold tracking-tighter">
            {formatCurrency(annualSavingsUsd)}
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">
            Ahorro Anual
          </div>
        </div>
      )}
      
      {roiPercent && (
        <div className="space-y-2">
          <div className="text-4xl font-bold tracking-tighter">
            {roiPercent.toFixed(0)}
            <span className="text-2xl text-muted-foreground ml-1">%</span>
          </div>
          <div className="text-sm text-muted-foreground uppercase tracking-wide">
            ROI Proyectado
          </div>
        </div>
      )}
    </div>
  )
}
