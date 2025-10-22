/**
 * RedFlagsSection - Critical issues detection and alerting
 *
 * Proactively surfaces issues that could compromise engineer's professional reputation
 * Analyzes: compliance failures, low AI confidence, excessive assumptions, cost anomalies
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertTriangle, XCircle } from 'lucide-react'
import type { Proposal } from '../types'

interface RedFlag {
  severity: 'critical' | 'warning'
  message: string
  action?: string
}

export interface RedFlagsSectionProps {
  proposal: Proposal
}

export function RedFlagsSection({ proposal }: RedFlagsSectionProps) {
  const redFlags: RedFlag[] = []

  // CRITICAL: Compliance failure
  if (proposal.treatmentEfficiency?.overallCompliance === false) {
    redFlags.push({
      severity: 'critical',
      message: 'Proposed design does not meet regulatory compliance requirements',
      action: 'Review the Compliance Summary section and verify with local regulations'
    })
  }

  // CRITICAL: Low AI confidence
  if (proposal.aiMetadata?.confidenceLevel === 'Low') {
    redFlags.push({
      severity: 'critical',
      message: 'AI has low confidence in this proposal - engineering validation strongly recommended',
      action: 'Review all assumptions and verify equipment specifications with proven cases'
    })
  }

  // WARNING: High number of assumptions (≥5)
  const assumptionsCount = proposal.aiMetadata?.assumptions?.length || 0
  if (assumptionsCount >= 5) {
    redFlags.push({
      severity: 'warning',
      message: `High number of design assumptions (${assumptionsCount}) detected`,
      action: 'Verify each assumption carefully before presenting to client'
    })
  }

  // WARNING: CAPEX significantly higher than proven cases average
  const provenCases = proposal.aiMetadata?.provenCases || []
  if (provenCases.length > 0) {
    const validCapexCases = provenCases.filter(pc => pc.capexUsd && pc.capexUsd > 0)
    if (validCapexCases.length > 0) {
      const avgProvenCaseCapex = validCapexCases.reduce((sum, pc) => sum + (pc.capexUsd || 0), 0) / validCapexCases.length
      const capexRatio = proposal.capex / avgProvenCaseCapex

      if (capexRatio > 1.5) {
        redFlags.push({
          severity: 'warning',
          message: `CAPEX is ${Math.round(capexRatio * 100)}% of similar projects average`,
          action: `Verify cost estimates (Proposal: $${proposal.capex.toLocaleString()} vs. Avg: $${Math.round(avgProvenCaseCapex).toLocaleString()})`
        })
      } else if (capexRatio < 0.6) {
        redFlags.push({
          severity: 'warning',
          message: `CAPEX is unusually low (${Math.round(capexRatio * 100)}% of similar projects)`,
          action: 'Verify all equipment and installation costs are included'
        })
      }
    }
  }

  // WARNING: No proven cases found (low confidence in AI recommendations)
  if (provenCases.length === 0 && proposal.aiMetadata) {
    redFlags.push({
      severity: 'warning',
      message: 'No proven cases were consulted for this proposal',
      action: 'AI may be extrapolating - verify technical approach with literature or consultants'
    })
  }

  // WARNING: Low similarity scores in proven cases
  if (provenCases.length > 0) {
    const avgSimilarity = provenCases.reduce((sum, pc) => sum + (pc.similarityScore || 0), 0) / provenCases.length
    if (avgSimilarity < 0.7) {
      redFlags.push({
        severity: 'warning',
        message: `Low similarity to proven cases (avg: ${Math.round(avgSimilarity * 100)}%)`,
        action: 'This project may have unique characteristics - verify with domain experts'
      })
    }
  }

  // WARNING: Missing critical parameters in treatment efficiency
  const parameters = proposal.treatmentEfficiency?.parameters || []
  const criticalParams = proposal.treatmentEfficiency?.criticalParameters || []
  if (criticalParams.length > 0) {
    redFlags.push({
      severity: 'warning',
      message: `${criticalParams.length} critical parameter${criticalParams.length > 1 ? 's' : ''} require special attention: ${criticalParams.join(', ')}`,
      action: 'Verify treatment performance for these parameters meets discharge limits'
    })
  }

  // No issues found
  if (redFlags.length === 0) return null

  const criticalFlags = redFlags.filter(f => f.severity === 'critical')
  const warningFlags = redFlags.filter(f => f.severity === 'warning')

  return (
    <Alert
      variant={criticalFlags.length > 0 ? 'destructive' : 'default'}
      className={criticalFlags.length > 0
        ? 'border-2 border-red-500 bg-red-50 dark:bg-red-950/30'
        : 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30'
      }
    >
      <AlertTriangle className="h-5 w-5" />
      <AlertTitle className="text-lg font-bold flex items-center gap-2">
        {criticalFlags.length > 0 ? (
          <>
            <XCircle className="h-5 w-5" />
            Critical Issues Require Attention
          </>
        ) : (
          'Warnings - Review Required'
        )}
      </AlertTitle>
      <AlertDescription className="mt-3">
        <div className="space-y-4">
          {/* Critical Issues */}
          {criticalFlags.length > 0 && (
            <div className="space-y-3">
              {criticalFlags.map((flag, i) => (
                <div key={i} className="rounded-lg border-2 border-red-600 bg-red-100/50 dark:bg-red-900/20 p-3">
                  <div className="flex items-start gap-2 mb-2">
                    <XCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-red-600" />
                    <span className="text-sm font-semibold text-red-900 dark:text-red-100">{flag.message}</span>
                  </div>
                  {flag.action && (
                    <p className="text-xs text-red-700 dark:text-red-300 ml-7">
                      <strong>Action:</strong> {flag.action}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Warnings */}
          {warningFlags.length > 0 && (
            <div className="space-y-2">
              {criticalFlags.length > 0 && <div className="text-sm font-semibold mt-4 mb-2">Additional Warnings:</div>}
              {warningFlags.map((flag, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50/50 dark:bg-amber-900/10 p-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600" />
                  <div className="flex-1">
                    <span className="text-sm">{flag.message}</span>
                    {flag.action && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {flag.action}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer guidance */}
          <div className="mt-4 pt-3 border-t text-xs text-muted-foreground">
            <strong>Important:</strong> Address these issues before presenting to client. Your professional reputation depends on proposal accuracy.
          </div>
        </div>
      </AlertDescription>
    </Alert>
  )
}
