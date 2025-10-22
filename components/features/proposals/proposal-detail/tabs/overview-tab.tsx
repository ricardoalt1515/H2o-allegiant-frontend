/**
 * OverviewTab - First impression view of proposal
 *
 * Composes: Hero, Critical Assumptions, Metrics, Treatment Train, Compliance Summary
 * Prioritizes critical review items (assumptions) for engineer validation
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { HeroSection, MetricsCards, AssumptionsSection, RedFlagsSection } from '../sections'
import { TreatmentTrainFlow } from '@/components/features/proposals'
import { ComplianceBadge } from '../atoms'
import { calculateCompliance } from '@/lib/proposal-data-helpers'
import type { OverviewTabProps } from '../types'

export function OverviewTab({ proposal, projectName }: OverviewTabProps) {
  const compliance = calculateCompliance(proposal)
  const assumptions = proposal.aiMetadata?.assumptions || []

  return (
    <div className="space-y-8">
      {/* CRITICAL: Red Flags - Must be first for immediate visibility */}
      <RedFlagsSection proposal={proposal} />

      {/* Hero Section with Confidence Indicators */}
      <HeroSection proposal={proposal} projectName={projectName} />

      {/* CRITICAL: Design Assumptions - Must be immediately after Hero for visibility */}
      {assumptions.length > 0 && (
        <>
          <div id="assumptions-section">
            <AssumptionsSection
              assumptions={assumptions}
              showReviewPrompt={true}
            />
          </div>
          <Separator className="my-8" />
        </>
      )}

      {/* Key Metrics Cards */}
      <MetricsCards
        capex={proposal.capex}
        opex={proposal.opex}
        implementationMonths={proposal.aiMetadata?.technicalData?.implementationMonths}
        requiredAreaM2={proposal.operationalData?.requiredAreaM2}
      />

      {/* Treatment Train Flow */}
      {proposal.equipmentList && proposal.equipmentList.length > 0 && (
        <TreatmentTrainFlow equipmentList={proposal.equipmentList} />
      )}

      {/* Compliance Summary */}
      {compliance && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              🛡️ Regulatory Compliance
              <ComplianceBadge passes={compliance.overallCompliance} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {compliance.checks.map((check, i) => (
                <div
                  key={i}
                  className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{check.parameter}</span>
                    <ComplianceBadge passes={check.passes} compact />
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>Target: ≤ {check.targetValue} {check.unit}</div>
                    <div className={check.passes ? 'text-green-600' : 'text-red-600'}>
                      Effluent: {check.effluentValue} {check.unit}
                    </div>
                    <div>Removal: {check.removalPercent.toFixed(1)}%</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              ✅ AI agent data based on project analysis and local regulations.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Executive Summary (if available) */}
      {proposal.snapshot?.executiveSummary && (
        <Card>
          <CardHeader>
            <CardTitle>📋 Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {proposal.snapshot.executiveSummary}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
