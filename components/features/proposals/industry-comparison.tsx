"use client"

/**
 * Industry Comparison - Minimalist Design
 * Clean comparison vs industry averages
 */

import { formatCurrency } from '@/lib/utils'
import type { ProvenCase, ProblemAnalysis, Project } from './types'

interface IndustryComparisonProps {
  provenCases: ProvenCase[]
  currentCapex: number
  currentFlowRate?: number
  problemAnalysis?: ProblemAnalysis
  project: Project
}

export function IndustryComparison({
  provenCases,
  currentCapex,
  project,
}: IndustryComparisonProps) {
  if (!provenCases || provenCases.length === 0) return null

  // Calculate average CAPEX
  const casesWithCapex = provenCases.filter((c) => c.capexUsd)
  const avgCapex = casesWithCapex.length > 0
    ? casesWithCapex.reduce((sum, c) => sum + (c.capexUsd || 0), 0) / casesWithCapex.length
    : 0

  const capexDiff = avgCapex > 0 ? ((currentCapex - avgCapex) / avgCapex) * 100 : null

  return (
    <div className="mb-12 py-8 border-y">
      <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-6">
        Comparación vs Industria
      </div>
      
      <div className="space-y-6">
        {/* CAPEX comparison - minimalist */}
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Tu CAPEX
            </div>
            <div className="text-3xl font-bold tracking-tight">
              {formatCurrency(currentCapex)}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              Promedio Industria
            </div>
            <div className="text-3xl font-bold tracking-tight text-muted-foreground">
              {formatCurrency(avgCapex)}
            </div>
            {capexDiff !== null && (
              <div className="text-sm mt-2">
                <span className={capexDiff < 0 ? 'text-green-600' : 'text-muted-foreground'}>
                  {capexDiff < 0 ? '↓ ' : '↑ '}{Math.abs(capexDiff).toFixed(0)}% vs promedio
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Validation note - subtle */}
        <div className="text-sm text-muted-foreground">
          Basado en {provenCases.length} proyectos similares
          {project.sector && ` en ${project.sector}`}
        </div>
      </div>
    </div>
  )
}
