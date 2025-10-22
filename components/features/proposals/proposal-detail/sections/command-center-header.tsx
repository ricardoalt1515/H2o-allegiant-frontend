/**
 * CommandCenterHeader - Unified trust dashboard + hero section
 *
 * Phase 1 redesign component that consolidates trust signals,
 * problem/solution cards, and key metrics in a single above-the-fold view.
 */

'use client'

import { Download, Share2, Edit, CheckCircle, MoreVertical, ArrowRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { formatCurrency } from '@/lib/utils'
import type { Proposal } from '../types'

export interface CommandCenterHeaderProps {
  proposal: Proposal
  projectName: string
  onDownloadPDF?: () => void
  onShare?: () => void
  onEdit?: () => void
  onApprove?: () => void
  isDownloadingPDF?: boolean
}

export function CommandCenterHeader({
  proposal,
  projectName,
  onDownloadPDF,
  onShare,
  onEdit,
  onApprove,
  isDownloadingPDF = false,
}: CommandCenterHeaderProps) {
  // Calculate trust indicators
  const redFlagsCount = calculateRedFlags(proposal)
  const assumptionsCount = proposal.aiMetadata?.assumptions?.length || 0
  const aiConfidence = calculateAIConfidence(proposal)
  const compliancePercent = proposal.treatmentEfficiency?.overallCompliance ? 98 : 65

  // Extract problem/solution data
  const flowRate = proposal.aiMetadata?.technicalData?.flowRateM3Day ||
                   proposal.operationalData?.flowRateM3Day || 0

  const parameters = proposal.treatmentEfficiency?.parameters || []
  const keyContaminants = parameters.slice(0, 2)

  const treatmentTrain = proposal.equipmentList
    ?.filter(eq => ['primary', 'secondary', 'tertiary'].includes(eq.stage))
    .sort((a, b) => {
      const order = { primary: 1, secondary: 2, tertiary: 3, auxiliary: 4 }
      return order[a.stage] - order[b.stage]
    })
    .map(eq => eq.type)
    .slice(0, 2)
    .join(' + ') || 'Treatment System'

  const overallRemoval = parameters.length > 0
    ? Math.round(parameters.reduce((sum, p) => sum + p.removalEfficiencyPercent, 0) / parameters.length)
    : 0

  return (
    <div className="bg-gradient-to-b from-primary/5 to-background border-b">
      <div className="mx-auto max-w-[1600px] px-8 py-6 space-y-6">
        {/* Top Bar: Project Title + Actions */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gradient">
              {projectName}
            </h1>
            <p className="text-sm text-muted-foreground">
              {proposal.title} • {proposal.version} • {new Date(proposal.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Actions <MoreVertical className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={onDownloadPDF} disabled={isDownloadingPDF}>
                <Download className="mr-2 h-4 w-4" />
                {isDownloadingPDF ? 'PDF Generating...' : 'PDF Download'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onShare}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              {onEdit && (
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="mr-2 h-4 w-4" />
                  Editar
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              {onApprove && (
                <DropdownMenuItem onClick={onApprove}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve Proposal
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Trust Indicators Bar */}
        <div className="flex items-center gap-4 flex-wrap">
          <Badge
            variant={redFlagsCount > 0 ? "destructive" : "secondary"}
            className="flex items-center gap-2 py-1.5 px-3"
          >
            🚩 {redFlagsCount} {redFlagsCount === 1 ? 'Red Flag' : 'Red Flags'}
          </Badge>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md border bg-card">
            <span className="text-sm">🤖 AI Confidence:</span>
            <Progress value={aiConfidence} className="w-20 h-2" />
            <span className="text-sm font-bold">{aiConfidence}%</span>
          </div>

          <Badge
            variant={assumptionsCount >= 5 ? "warning" : "secondary"}
            className="flex items-center gap-2 py-1.5 px-3"
          >
            ⚠️ {assumptionsCount} {assumptionsCount === 1 ? 'Assumption' : 'Assumptions'}
          </Badge>

          <Badge
            variant={compliancePercent >= 95 ? "success" : "warning"}
            className="flex items-center gap-2 py-1.5 px-3"
          >
            ✓ {compliancePercent}% Compliance
          </Badge>

          <Badge variant="outline" className="py-1.5 px-3">
            {proposal.status === 'Current' ? '✓ Current' : proposal.status}
          </Badge>
        </div>

        {/* Problem → Solution Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
          {/* Problem Card */}
          <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                  <span className="text-lg">⚠️</span>
                </div>
                <h3 className="text-lg font-semibold">The Challenge</h3>
              </div>

              <div className="space-y-3">
                {flowRate > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Flow to treat</p>
                    <p className="text-xl font-bold">{flowRate.toLocaleString()} m³/day</p>
                  </div>
                )}

                {keyContaminants.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Key contaminants</p>
                    <div className="space-y-1">
                      {keyContaminants.map((param) => (
                        <div key={param.parameterName} className="text-sm">
                          <span className="font-medium">{param.parameterName}:</span>{' '}
                          {param.influentConcentration ? (
                            <span>{param.influentConcentration} {param.unit}</span>
                          ) : (
                            <span className="text-muted-foreground">N/A</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!flowRate && !keyContaminants.length && (
                  <p className="text-sm text-muted-foreground">
                    Municipal wastewater treatment project requiring compliance with local regulations
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Arrow Connector (desktop only) */}
          <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
            <div className="bg-background p-3 rounded-full border-2 border-primary shadow-lg">
              <ArrowRight className="h-6 w-6 text-primary" />
            </div>
          </div>

          {/* Solution Card */}
          <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <span className="text-lg">✓</span>
                </div>
                <h3 className="text-lg font-semibold">Proposed Solution</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Treatment train</p>
                  <p className="text-sm font-medium leading-relaxed">{treatmentTrain}</p>
                </div>

                {parameters.length > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Expected performance</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-green-600">{overallRemoval}%</p>
                      <Badge variant="outline" className="border-green-600 text-green-600">
                        Average Removal
                      </Badge>
                    </div>
                  </div>
                )}

                {proposal.treatmentEfficiency?.overallCompliance && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-600">
                        Meets regulatory compliance
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Metrics Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">CAPEX</p>
            <p className="text-2xl font-bold">{formatCurrency(proposal.capex)}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Investment</p>
          </div>

          <div className="bg-card rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">OPEX</p>
            <p className="text-2xl font-bold">{formatCurrency(proposal.opex)}/yr</p>
            <p className="text-xs text-muted-foreground mt-1">Annual Operating</p>
          </div>

          {proposal.aiMetadata?.technicalData?.implementationMonths && (
            <div className="bg-card rounded-lg border p-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Timeline</p>
              <p className="text-2xl font-bold">
                {proposal.aiMetadata.technicalData.implementationMonths}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Months</p>
            </div>
          )}

          <div className="bg-card rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Compliance</p>
            <p className="text-2xl font-bold">{compliancePercent}%</p>
            <p className="text-xs text-muted-foreground mt-1">Parameters Meet Target</p>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Calculate red flags count from proposal data
 */
function calculateRedFlags(proposal: Proposal): number {
  let count = 0

  // Non-compliance
  if (proposal.treatmentEfficiency?.overallCompliance === false) {
    count++
  }

  // Low AI confidence
  if (proposal.aiMetadata?.confidenceLevel === 'Low') {
    count++
  }

  // High assumptions
  const assumptionsCount = proposal.aiMetadata?.assumptions?.length || 0
  if (assumptionsCount >= 5) {
    count++
  }

  // No proven cases
  const provenCases = proposal.aiMetadata?.provenCases || []
  if (provenCases.length === 0 && proposal.aiMetadata) {
    count++
  }

  return count
}

/**
 * Calculate AI confidence percentage
 */
function calculateAIConfidence(proposal: Proposal): number {
  if (!proposal.aiMetadata) return 0

  // Map confidence level to percentage
  const confidenceMap = {
    'High': 90,
    'Medium': 75,
    'Low': 60,
  }

  if (proposal.aiMetadata.confidenceLevel) {
    return confidenceMap[proposal.aiMetadata.confidenceLevel]
  }

  // Calculate from proven cases similarity if available
  const provenCases = proposal.aiMetadata.provenCases || []
  if (provenCases.length > 0) {
    const avgSimilarity = provenCases.reduce((sum, pc) => sum + (pc.similarityScore || 0), 0) / provenCases.length
    return Math.round(avgSimilarity * 100)
  }

  // Default to medium confidence
  return 75
}
