/**
 * HeroSection - Problem → Solution hero display
 *
 * Shows the challenge and proposed solution at a glance with confidence indicators
 */

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowRight, Droplet, Target, BookOpen, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { ConfidenceIndicator } from '../atoms'
import type { HeroSectionProps } from '../types'

export function HeroSection({ proposal, projectName }: HeroSectionProps) {
  // Extract key problem data
  const flowRate = proposal.aiMetadata?.technicalData?.flowRateM3Day ||
                   proposal.operationalData?.flowRateM3Day

  const parameters = proposal.treatmentEfficiency?.parameters || []
  const keyContaminants = parameters.slice(0, 3) // Top 3 parameters

  // Extract solution data
  const treatmentTrain = proposal.equipmentList
    ?.filter(eq => ['primary', 'secondary', 'tertiary'].includes(eq.stage))
    .sort((a, b) => {
      const order = { primary: 1, secondary: 2, tertiary: 3, auxiliary: 4 }
      return order[a.stage] - order[b.stage]
    })
    .map(eq => eq.type)
    .join(' → ')

  const overallRemoval = parameters.length > 0
    ? (parameters.reduce((sum, p) => sum + p.removalEfficiencyPercent, 0) / parameters.length).toFixed(0)
    : '0'

  // Calculate AI confidence indicators
  const provenCases = proposal.aiMetadata?.provenCases || []
  const assumptions = proposal.aiMetadata?.assumptions || []
  const avgSimilarity = provenCases.length > 0
    ? provenCases.reduce((sum, c) => sum + (c.similarityScore || 0), 0) / provenCases.length
    : 0
  const hasHighSimilarity = avgSimilarity >= 0.85
  const hasMultipleAssumptions = assumptions.length >= 3

  return (
    <div className="mb-12">
      {/* Title and confidence */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold mb-2">{proposal.title}</h2>
          <p className="text-muted-foreground">{projectName}</p>
        </div>
        {proposal.aiMetadata?.confidenceLevel && (
          <ConfidenceIndicator
            level={proposal.aiMetadata.confidenceLevel}
            compact
          />
        )}
      </div>

      {/* AI Confidence Indicators */}
      {proposal.aiMetadata && (
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Proven Cases Indicator */}
          {provenCases.length > 0 && (
            <Alert className={hasHighSimilarity ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20'}>
              <BookOpen className={`h-4 w-4 ${hasHighSimilarity ? 'text-green-600' : 'text-blue-600'}`} />
              <AlertDescription className={hasHighSimilarity ? 'text-green-700 dark:text-green-300' : 'text-blue-700 dark:text-blue-300'}>
                <strong>Based on {provenCases.length} proven case{provenCases.length !== 1 ? 's' : ''}</strong>
                {hasHighSimilarity && (
                  <span className="ml-1">(avg. similarity: {Math.round(avgSimilarity * 100)}%)</span>
                )}
              </AlertDescription>
            </Alert>
          )}

          {/* Assumptions Indicator - Interactive */}
          {assumptions.length > 0 && (
            <Alert
              className={`cursor-pointer transition-all hover:shadow-md ${
                hasMultipleAssumptions
                  ? 'border-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30 hover:border-amber-600'
                  : 'border-gray-500/50 bg-gray-50/50 dark:bg-gray-950/20 hover:border-gray-600'
              }`}
              onClick={() => {
                const element = document.getElementById('assumptions-section')
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  // Flash highlight after scroll
                  setTimeout(() => {
                    element.classList.add('ring-2', 'ring-amber-500', 'ring-offset-2')
                    setTimeout(() => {
                      element.classList.remove('ring-2', 'ring-amber-500', 'ring-offset-2')
                    }, 2000)
                  }, 500)
                }
              }}
            >
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${hasMultipleAssumptions ? 'text-amber-600 animate-pulse' : 'text-gray-600'}`} />
                  <AlertDescription className={hasMultipleAssumptions ? 'text-amber-900 dark:text-amber-100 font-medium' : 'text-gray-700 dark:text-gray-300'}>
                    <strong>{assumptions.length} design assumption{assumptions.length !== 1 ? 's' : ''}</strong>
                    {hasMultipleAssumptions && <span className="ml-1">- Requires review</span>}
                  </AlertDescription>
                </div>
                <div className="text-xs text-amber-700 dark:text-amber-300 font-medium flex items-center gap-1 ml-2">
                  Review
                  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </Alert>
          )}

          {/* Compliance Indicator */}
          {proposal.treatmentEfficiency?.overallCompliance !== undefined && (
            <Alert className={proposal.treatmentEfficiency.overallCompliance ? 'border-green-500/50 bg-green-50/50 dark:bg-green-950/20' : 'border-red-500/50 bg-red-50/50 dark:bg-red-950/20'}>
              <CheckCircle2 className={`h-4 w-4 ${proposal.treatmentEfficiency.overallCompliance ? 'text-green-600' : 'text-red-600'}`} />
              <AlertDescription className={proposal.treatmentEfficiency.overallCompliance ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}>
                <strong>
                  {proposal.treatmentEfficiency.overallCompliance
                    ? 'Meets compliance'
                    : 'Review compliance'}
                </strong>
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      {/* Problem → Solution Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Card */}
        <Card className="border-2 border-amber-200 dark:border-amber-800 bg-amber-50/30 dark:bg-amber-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Droplet className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold">Problem</h3>
            </div>

            <div className="space-y-3">
              {flowRate && (
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
                  Problem data not available from agent
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Arrow connector (only visible on large screens) */}
        <div className="hidden lg:flex items-center justify-center absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
          <div className="bg-background p-3 rounded-full border-2 border-primary shadow-lg">
            <ArrowRight className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Solution Card */}
        <Card className="border-2 border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold">Proposed Solution</h3>
            </div>

            <div className="space-y-3">
              {treatmentTrain && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Treatment train</p>
                  <p className="text-sm font-medium leading-relaxed">{treatmentTrain}</p>
                </div>
              )}

              {parameters.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Average removal</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold text-green-600">{overallRemoval}%</p>
                    <Badge variant="outline" className="border-green-600 text-green-600">
                      ✓ Compliance
                    </Badge>
                  </div>
                </div>
              )}

              {!treatmentTrain && !parameters.length && (
                <p className="text-sm text-muted-foreground">
                  Solution data not available from agent
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
