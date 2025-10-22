/**
 * AssumptionsSection - Critical design assumptions with review tracking
 *
 * Shows AI-generated assumptions prominently in Overview tab
 * Supports interactive review workflow (future: checkbox acknowledgment)
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, Info, Lightbulb } from 'lucide-react'

export interface AssumptionsSectionProps {
  assumptions: string[]
  compact?: boolean
  showReviewPrompt?: boolean
}

export function AssumptionsSection({
  assumptions,
  compact = false,
  showReviewPrompt = true
}: AssumptionsSectionProps) {
  if (!assumptions || assumptions.length === 0) {
    return null
  }

  const hasMultipleAssumptions = assumptions.length >= 3

  if (compact) {
    return (
      <Alert className="border-amber-500/50 bg-amber-50/50 dark:bg-amber-950/20">
        <AlertTriangle className="h-4 w-4 text-amber-600" />
        <AlertTitle className="text-amber-900 dark:text-amber-100">
          {assumptions.length} design assumption{assumptions.length !== 1 ? 's' : ''}
        </AlertTitle>
        <AlertDescription className="text-amber-700 dark:text-amber-300">
          Review assumptions in the References section to validate they align with your project.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className="border-amber-200 dark:border-amber-800">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-amber-500" />
            <CardTitle>Design Assumptions</CardTitle>
            <Badge variant="outline" className="border-amber-500 text-amber-700">
              {assumptions.length} assumption{assumptions.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </div>
        <CardDescription>
          The AI agent made these assumptions during analysis. Verify they align with your project&apos;s specific conditions.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Assumptions List */}
        <ul className="space-y-3">
          {assumptions.map((assumption, index) => (
            <li
              key={index}
              className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-6 w-6 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <span className="text-xs font-medium text-amber-700 dark:text-amber-400">
                    {index + 1}
                  </span>
                </div>
              </div>
              <span className="text-sm leading-relaxed flex-1">{assumption}</span>
            </li>
          ))}
        </ul>

        {/* Review Prompt */}
        {showReviewPrompt && hasMultipleAssumptions && (
          <Alert className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-200/50 dark:border-blue-800/50">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm">
              <strong>Important:</strong> These assumptions affect technical design and costs. Ensure they reflect your project&apos;s actual conditions before presenting to the client.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
