/**
 * ReferencesTab (formerly AIValidationTab) - AI transparency and reasoning
 *
 * Shows: Usage Stats, Alternatives Considered, Technology Justifications, Recommendations
 * Note: Assumptions moved to Overview, Proven Cases moved to Technical
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Brain,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Info,
} from 'lucide-react'
import type { AIValidationTabProps } from '../types'

export function AIValidationTab({ proposal }: AIValidationTabProps) {
  const aiMetadata = proposal.aiMetadata

  if (!aiMetadata) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No AI metadata available for this proposal.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This section shows the AI agent&apos;s reasoning, alternatives considered, and generation statistics.
          <strong className="ml-1">Assumptions and proven cases</strong> are in the Overview and Technical tabs respectively.
        </AlertDescription>
      </Alert>

      {/* Alternatives Rejected */}
      {aiMetadata.alternatives && aiMetadata.alternatives.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-amber-500" />
              <CardTitle>Alternatives Considered but Rejected</CardTitle>
            </div>
            <CardDescription>
              Technologies evaluated that were not selected
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiMetadata.alternatives.map((alternative, index) => (
                <Alert
                  key={index}
                  variant="default"
                  className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20"
                >
                  <XCircle className="h-4 w-4 text-amber-500" />
                  <AlertTitle className="text-sm font-semibold text-amber-900 dark:text-amber-100">
                    {alternative.technology}
                  </AlertTitle>
                  <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                    <strong>Reason:</strong> {alternative.reasonRejected}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Technology Justifications */}
      {aiMetadata.technologyJustification && aiMetadata.technologyJustification.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <CardTitle>Technical Justifications by Stage</CardTitle>
            </div>
            <CardDescription>
              Technical reasoning for each technology selection
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {aiMetadata.technologyJustification.map((justification, index) => (
                <div
                  key={index}
                  className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="default">{justification.stage}</Badge>
                    <span className="font-medium text-sm">{justification.technology}</span>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {justification.justification}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {aiMetadata.recommendations && aiMetadata.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-blue-600" />
              Additional Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {aiMetadata.recommendations.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      {aiMetadata.usageStats && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              <CardTitle>Generation Statistics</CardTitle>
            </div>
            <CardDescription>
              Information about the AI generation process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Model</p>
                <p className="font-medium">{aiMetadata.usageStats.modelUsed}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Tokens</p>
                <p className="font-medium">{aiMetadata.usageStats.totalTokens.toLocaleString()}</p>
              </div>
              {aiMetadata.usageStats.costEstimate != null && (
                <div>
                  <p className="text-muted-foreground">Estimated Cost</p>
                  <p className="font-medium">${aiMetadata.usageStats.costEstimate.toFixed(2)}</p>
                </div>
              )}
              {aiMetadata.usageStats.generationTimeSeconds != null && (
                <div>
                  <p className="text-muted-foreground">Time</p>
                  <p className="font-medium">{aiMetadata.usageStats.generationTimeSeconds}s</p>
                </div>
              )}
            </div>
            <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
              Generated: {new Date(aiMetadata.generatedAt).toLocaleString('en-US')}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
