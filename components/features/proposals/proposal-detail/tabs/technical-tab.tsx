/**
 * TechnicalTab - Detailed technical specifications
 *
 * Composes: Equipment Table, Proven Cases, Water Quality Viz, Design Parameters
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Info, Settings } from 'lucide-react'
import { EquipmentTable, WaterQualityViz, ProvenCasesSection } from '../sections'
import type { TechnicalTabProps } from '../types'

export function TechnicalTab({ proposal }: TechnicalTabProps) {
  const designParams = proposal.aiMetadata?.technicalData?.designParameters
  const provenCases = proposal.aiMetadata?.provenCases || []

  return (
    <div className="space-y-8">
      {/* Proven Cases - Context first: What did AI learn from? */}
      {provenCases.length > 0 && (
        <>
          <ProvenCasesSection cases={provenCases} />
          <Separator />
        </>
      )}

      {/* Equipment Specifications - Then: Recommended equipment based on proven cases */}
      <EquipmentTable
        equipment={proposal.equipmentList || []}
        showCriticality={true}
        groupByStage={true}
      />

      {/* Water Quality Transformation */}
      {proposal.treatmentEfficiency?.parameters && (
        <WaterQualityViz
          parameters={proposal.treatmentEfficiency.parameters}
          showTargets={true}
        />
      )}

      {/* Design Parameters */}
      {designParams && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle>Design Parameters</CardTitle>
            </div>
            <CardDescription>
              Technical criteria applied by the AI agent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Peak Factor</p>
                <p className="text-2xl font-bold">{designParams.peakFactor}×</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Additional capacity for peak flows
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Safety Factor</p>
                <p className="text-2xl font-bold">{designParams.safetyFactor}×</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Regulatory safety margin
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Operating Hours</p>
                <p className="text-2xl font-bold">{designParams.operatingHours}h/day</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Based on client operations
                </p>
              </div>

              <div className="rounded-lg border bg-card p-4">
                <p className="text-sm text-muted-foreground">Design Life</p>
                <p className="text-2xl font-bold">{designParams.designLifeYears} years</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Expected system lifespan
                </p>
              </div>
            </div>

            {/* Regulatory margin */}
            {designParams.regulatoryMarginPercent && (
              <Alert className="mt-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Regulatory margin applied: {designParams.regulatoryMarginPercent}% above minimum limits
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Technical Approach (if available) */}
      {proposal.snapshot?.technicalApproach && (
        <Card>
          <CardHeader>
            <CardTitle>🔧 Technical Approach</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              {proposal.snapshot.technicalApproach.split('\n\n').map((paragraph, i) => (
                <p key={i} className="mb-3">{paragraph}</p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
