/**
 * EconomicsTab - Financial analysis and ROI
 *
 * Composes: CAPEX/OPEX Breakdowns, ROI Metrics
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp } from 'lucide-react'
import { CostBreakdownSection } from '../sections'
import { formatCurrency } from '@/lib/utils'
import type { EconomicsTabProps } from '../types'

export function EconomicsTab({ proposal }: EconomicsTabProps) {
  const technicalData = proposal.aiMetadata?.technicalData
  const hasROIData = technicalData?.paybackYears || technicalData?.annualSavingsUsd || technicalData?.roiPercent

  return (
    <div className="space-y-8">
      {/* CAPEX Breakdown */}
      <CostBreakdownSection
        type="CAPEX"
        breakdown={proposal.snapshot?.costBreakdown}
        total={proposal.capex}
        validateSum={true}
      />

      {/* OPEX Breakdown */}
      <CostBreakdownSection
        type="OPEX"
        breakdown={proposal.aiMetadata?.technicalData?.opexBreakdown}
        total={proposal.opex}
        validateSum={true}
      />

      {/* ROI Metrics */}
      {hasROIData && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle>Retorno de Inversión (ROI)</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {technicalData?.paybackYears && (
                <div className="rounded-lg border bg-card p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Periodo de Recuperación</p>
                  <p className="text-4xl font-bold text-primary">
                    {technicalData.paybackYears.toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">años</p>
                </div>
              )}

              {technicalData?.annualSavingsUsd && (
                <div className="rounded-lg border bg-card p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Ahorro Anual</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(technicalData.annualSavingsUsd)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Descarga + Multas evitadas
                  </p>
                </div>
              )}

              {technicalData?.roiPercent && (
                <div className="rounded-lg border bg-card p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">ROI</p>
                  <p className="text-4xl font-bold text-primary">
                    {technicalData.roiPercent.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">retorno anual</p>
                </div>
              )}
            </div>

            {/* ROI Explanation */}
            <div className="mt-6 p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
              <p className="font-medium mb-2">Cómo se calcula el ROI:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Ahorro en costos de descarga de agua residual</li>
                <li>Multas ambientales evitadas</li>
                <li>Posible reutilización de agua tratada</li>
                <li>Reducción de costos de agua fresca</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Implementation Plan (if available) */}
      {proposal.snapshot?.implementationPlan && (
        <Card>
          <CardHeader>
            <CardTitle>📅 Plan de Implementación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {proposal.snapshot.implementationPlan.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risks (if available) */}
      {proposal.snapshot?.risks && proposal.snapshot.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>⚠️ Consideraciones y Riesgos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {proposal.snapshot.risks.map((risk, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">⚠️</span>
                  <span className="text-sm text-muted-foreground">{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
