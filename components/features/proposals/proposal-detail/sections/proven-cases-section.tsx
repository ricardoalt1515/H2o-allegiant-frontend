/**
 * ProvenCasesSection - Display proven cases consulted by AI
 *
 * Shows similar projects that the AI used as references for the proposal
 * Includes similarity scores and key metrics
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { BookOpen, Info } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { ProvenCase } from '../types'

export interface ProvenCasesSectionProps {
  cases: ProvenCase[]
  compact?: boolean
}

export function ProvenCasesSection({ cases, compact = false }: ProvenCasesSectionProps) {
  if (!cases || cases.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No proven cases consulted for this proposal.
        </AlertDescription>
      </Alert>
    )
  }

  // Calculate average similarity
  const avgSimilarity = cases.reduce((sum, c) => sum + (c.similarityScore || 0), 0) / cases.length
  const hasHighSimilarity = avgSimilarity >= 0.85

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Proven Cases Consulted</CardTitle>
            <Badge variant="outline">
              {cases.length} case{cases.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          {hasHighSimilarity && (
            <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              High similarity ({Math.round(avgSimilarity * 100)}%)
            </Badge>
          )}
        </div>
        <CardDescription>
          Similar projects used as reference by the AI agent
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className={compact ? 'space-y-2' : 'space-y-4'}>
          {cases.map((provenCase, index) => (
            <div
              key={provenCase.caseId || `case-${index}`}
              className="rounded-lg border bg-card p-4 hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{provenCase.applicationType}</Badge>
                  <span className="text-xs text-muted-foreground">Case #{index + 1}</span>
                </div>
                {provenCase.similarityScore !== undefined && (
                  <Badge
                    variant={provenCase.similarityScore >= 0.9 ? 'default' : 'secondary'}
                    className={
                      provenCase.similarityScore >= 0.9
                        ? 'bg-success text-success-foreground'
                        : ''
                    }
                  >
                    {Math.round(provenCase.similarityScore * 100)}% similar
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Treatment Train:</p>
                  <p className="text-muted-foreground">{provenCase.treatmentTrain}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <p className="text-muted-foreground text-xs">Flow Rate</p>
                    <p className="font-medium">
                      {provenCase.flowRate
                        ? `${provenCase.flowRate.toLocaleString()} m³/día`
                        : provenCase.flowRange || 'N/A'}
                    </p>
                  </div>
                  {provenCase.capexUsd !== undefined && (
                    <div>
                      <p className="text-muted-foreground text-xs">CAPEX</p>
                      <p className="font-medium">{formatCurrency(provenCase.capexUsd)}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
