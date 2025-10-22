/**
 * SmartFlagsSystem - Priority-based red flags and assumptions with workflow
 *
 * Phase 1 redesign component that replaces separate RedFlagsSection and AssumptionsSection
 * with an intelligent priority system and resolution workflow.
 */

'use client'

import { useState } from 'react'
import { AlertTriangle, XCircle, CheckCircle2, ChevronDown, Plus } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { cn } from '@/lib/utils'
import type { Proposal } from '../types'

export interface SmartFlagsSystemProps {
  proposal: Proposal
  onFlagReviewed?: (flagId: string) => void
  onAddNote?: (flagId: string, note: string) => void
}

interface SmartFlag {
  id: string
  severity: 'critical' | 'high' | 'medium'
  title: string
  message: string
  impact?: string[]
  actions?: { id: string; label: string; completed?: boolean }[]
  reviewed?: boolean
}

export function SmartFlagsSystem({
  proposal,
  onFlagReviewed,
  onAddNote,
}: SmartFlagsSystemProps) {
  const [reviewedFlags, setReviewedFlags] = useState<Set<string>>(new Set())
  const flags = analyzeProposal(proposal)

  if (flags.length === 0) {
    return null // No issues, don't show anything
  }

  const criticalFlags = flags.filter(f => f.severity === 'critical')
  const highFlags = flags.filter(f => f.severity === 'high')
  const mediumFlags = flags.filter(f => f.severity === 'medium')

  const handleMarkReviewed = (flagId: string) => {
    setReviewedFlags(prev => new Set(prev).add(flagId))
    onFlagReviewed?.(flagId)
  }

  return (
    <div className="space-y-4">
      {/* Critical Flags - Always Expanded, Cannot Collapse */}
      {criticalFlags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold">Critical Issues Require Attention</h3>
            <Badge variant="destructive">{criticalFlags.length}</Badge>
          </div>

          {criticalFlags.map((flag) => (
            <SmartFlagCard
              key={flag.id}
              flag={flag}
              reviewed={reviewedFlags.has(flag.id)}
              onMarkReviewed={handleMarkReviewed}
              onAddNote={onAddNote}
              alwaysExpanded
            />
          ))}
        </div>
      )}

      {/* High Priority Flags - Expanded by Default */}
      {highFlags.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <h3 className="text-lg font-semibold">High Priority - Review Required</h3>
            <Badge variant="warning">{highFlags.length}</Badge>
          </div>

          {highFlags.map((flag) => (
            <SmartFlagCard
              key={flag.id}
              flag={flag}
              reviewed={reviewedFlags.has(flag.id)}
              onMarkReviewed={handleMarkReviewed}
              onAddNote={onAddNote}
              defaultExpanded
            />
          ))}
        </div>
      )}

      {/* Medium Priority Flags - Collapsed by Default */}
      {mediumFlags.length > 0 && (
        <Collapsible>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between hover:bg-accent">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Medium Priority - Recommendations</span>
                <Badge variant="secondary">{mediumFlags.length}</Badge>
              </div>
              <ChevronDown className="h-4 w-4 transition-transform ui-expanded:rotate-180" />
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="space-y-3 pt-3">
            {mediumFlags.map((flag) => (
              <SmartFlagCard
                key={flag.id}
                flag={flag}
                reviewed={reviewedFlags.has(flag.id)}
                onMarkReviewed={handleMarkReviewed}
                onAddNote={onAddNote}
              />
            ))}
          </CollapsibleContent>
        </Collapsible>
      )}

      {/* Footer Guidance */}
      <div className="mt-6 pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          <strong>Important:</strong> Address critical and high-priority issues before presenting to client.
          Your professional reputation depends on proposal accuracy.
        </p>
      </div>
    </div>
  )
}

interface SmartFlagCardProps {
  flag: SmartFlag
  reviewed: boolean
  onMarkReviewed: (flagId: string) => void
  onAddNote?: (flagId: string, note: string) => void
  alwaysExpanded?: boolean
  defaultExpanded?: boolean
}

function SmartFlagCard({
  flag,
  reviewed,
  onMarkReviewed,
  onAddNote,
  alwaysExpanded = false,
  defaultExpanded = false,
}: SmartFlagCardProps) {
  const [isExpanded, setIsExpanded] = useState(alwaysExpanded || defaultExpanded)
  const [actionStates, setActionStates] = useState<Record<string, boolean>>({})

  const severityConfig = {
    critical: {
      variant: 'destructive' as const,
      bgClass: 'border-red-500 bg-red-50 dark:bg-red-950/30',
      iconClass: 'text-red-600',
    },
    high: {
      variant: 'default' as const,
      bgClass: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30',
      iconClass: 'text-amber-600',
    },
    medium: {
      variant: 'secondary' as const,
      bgClass: 'border-blue-300 bg-blue-50/50 dark:bg-blue-950/20',
      iconClass: 'text-blue-600',
    },
  }

  const config = severityConfig[flag.severity]

  const handleActionToggle = (actionId: string) => {
    setActionStates(prev => ({
      ...prev,
      [actionId]: !prev[actionId],
    }))
  }

  return (
    <Alert variant={config.variant} className={cn('border-2', config.bgClass, reviewed && 'opacity-60')}>
      <AlertTriangle className={cn('h-5 w-5', config.iconClass)} />
      <AlertTitle className="flex items-center justify-between">
        <span>{flag.title}</span>
        {reviewed && (
          <Badge variant="outline" className="bg-green-50 border-green-600 text-green-700">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Reviewed
          </Badge>
        )}
      </AlertTitle>

      <AlertDescription>
        <p className="mt-2">{flag.message}</p>

        {/* Impact Analysis - Expandable */}
        {flag.impact && flag.impact.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 px-0 hover:bg-transparent"
                disabled={alwaysExpanded}
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 mr-1 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
                Impact Analysis
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2">
              <div className="rounded-lg border bg-card/50 p-3">
                <ul className="space-y-1 text-sm">
                  {flag.impact.map((impact, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-muted-foreground mt-0.5">•</span>
                      <span>{impact}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Recommended Actions - Checklist */}
        {flag.actions && flag.actions.length > 0 && (
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="mt-3 px-0 hover:bg-transparent"
                disabled={alwaysExpanded}
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 mr-1 transition-transform',
                    isExpanded && 'rotate-180'
                  )}
                />
                Recommended Actions
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent className="mt-2">
              <div className="rounded-lg border bg-card/50 p-3 space-y-2">
                {flag.actions.map((action) => (
                  <div key={action.id} className="flex items-start gap-2">
                    <Checkbox
                      id={action.id}
                      checked={actionStates[action.id] || action.completed}
                      onCheckedChange={() => handleActionToggle(action.id)}
                      className="mt-0.5"
                    />
                    <label
                      htmlFor={action.id}
                      className="text-sm cursor-pointer leading-relaxed"
                    >
                      {action.label}
                    </label>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Action Buttons */}
        {!reviewed && (
          <div className="flex gap-2 mt-4">
            <Button
              size="sm"
              onClick={() => onMarkReviewed(flag.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Mark as Reviewed
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onAddNote?.(flag.id, '')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
        )}
      </AlertDescription>
    </Alert>
  )
}

/**
 * Analyze proposal and generate smart flags
 */
function analyzeProposal(proposal: Proposal): SmartFlag[] {
  const flags: SmartFlag[] = []

  // CRITICAL: Compliance failure
  if (proposal.treatmentEfficiency?.overallCompliance === false) {
    flags.push({
      id: 'compliance-failure',
      severity: 'critical',
      title: 'COMPLIANCE FAILURE - Design Does Not Meet Regulatory Requirements',
      message: 'The proposed design does not achieve compliance with regulatory discharge limits.',
      impact: [
        'Project cannot proceed without modifications',
        'Client may face regulatory penalties',
        'Reputation risk for engineering firm',
      ],
      actions: [
        {
          id: 'action-compliance-1',
          label: 'Review Compliance Summary section and identify failing parameters',
        },
        {
          id: 'action-compliance-2',
          label: 'Verify regulatory limits with local authority',
        },
        {
          id: 'action-compliance-3',
          label: 'Regenerate proposal with stricter treatment requirements',
        },
      ],
    })
  }

  // CRITICAL: Low AI confidence
  if (proposal.aiMetadata?.confidenceLevel === 'Low') {
    flags.push({
      id: 'low-ai-confidence',
      severity: 'critical',
      title: 'LOW AI CONFIDENCE - Engineering Validation Strongly Recommended',
      message: 'AI has low confidence in this proposal. Manual engineering review is required.',
      impact: [
        'Design may underperform or fail to meet objectives',
        'Cost estimates may be inaccurate',
        'Timeline estimates may be unrealistic',
      ],
      actions: [
        {
          id: 'action-confidence-1',
          label: 'Review all assumptions and verify with actual data',
        },
        {
          id: 'action-confidence-2',
          label: 'Consult with senior engineer or specialist',
        },
        {
          id: 'action-confidence-3',
          label: 'Request vendor quotes to validate equipment specifications',
        },
      ],
    })
  }

  // HIGH: Excessive assumptions
  const assumptionsCount = proposal.aiMetadata?.assumptions?.length || 0
  if (assumptionsCount >= 5) {
    flags.push({
      id: 'high-assumptions',
      severity: 'high',
      title: `HIGH NUMBER OF DESIGN ASSUMPTIONS (${assumptionsCount})`,
      message: 'This proposal relies on multiple assumptions due to missing data. Verify carefully before presenting to client.',
      impact: [
        'Design accuracy depends on assumption validity',
        'Client may reject proposal if assumptions are incorrect',
        'May require redesign after actual data collection',
      ],
      actions: proposal.aiMetadata!.assumptions!.slice(0, 3).map((assumption, idx) => ({
        id: `action-assumption-${idx}`,
        label: `Verify: ${assumption}`,
      })),
    })
  }

  // HIGH: CAPEX anomaly
  const provenCases = proposal.aiMetadata?.provenCases || []
  if (provenCases.length > 0) {
    const validCapexCases = provenCases.filter(pc => pc.capexUsd && pc.capexUsd > 0)
    if (validCapexCases.length > 0) {
      const avgProvenCaseCapex = validCapexCases.reduce((sum, pc) => sum + (pc.capexUsd || 0), 0) / validCapexCases.length
      const capexRatio = proposal.capex / avgProvenCaseCapex

      if (capexRatio > 1.5 || capexRatio < 0.6) {
        flags.push({
          id: 'capex-anomaly',
          severity: 'high',
          title: `CAPEX ${capexRatio > 1.5 ? 'SIGNIFICANTLY HIGHER' : 'UNUSUALLY LOW'} vs Similar Projects`,
          message: `Proposal CAPEX is ${Math.round(capexRatio * 100)}% of similar projects average ($${Math.round(avgProvenCaseCapex).toLocaleString()}).`,
          impact: [
            capexRatio > 1.5
              ? 'Client may reject proposal as too expensive'
              : 'All equipment and installation costs may not be included',
            'Budget estimates may need revision',
            'Competitive disadvantage in bidding process',
          ],
          actions: [
            {
              id: 'action-capex-1',
              label: 'Review cost breakdown in Economics section',
            },
            {
              id: 'action-capex-2',
              label: 'Verify equipment costs with vendors',
            },
            {
              id: 'action-capex-3',
              label: 'Check if all civil works and installation costs are included',
            },
          ],
        })
      }
    }
  }

  // MEDIUM: No proven cases
  if (provenCases.length === 0 && proposal.aiMetadata) {
    flags.push({
      id: 'no-proven-cases',
      severity: 'medium',
      title: 'NO PROVEN CASES CONSULTED',
      message: 'AI did not find similar projects for reference. Design may be based on extrapolation.',
      impact: [
        'Technical approach may not be proven for this specific application',
        'Higher risk of design issues during implementation',
      ],
      actions: [
        {
          id: 'action-proven-1',
          label: 'Consult technical literature for similar applications',
        },
        {
          id: 'action-proven-2',
          label: 'Request vendor references for proposed equipment',
        },
      ],
    })
  }

  // MEDIUM: Low similarity to proven cases
  if (provenCases.length > 0) {
    const avgSimilarity = provenCases.reduce((sum, pc) => sum + (pc.similarityScore || 0), 0) / provenCases.length
    if (avgSimilarity < 0.7) {
      flags.push({
        id: 'low-similarity',
        severity: 'medium',
        title: `LOW SIMILARITY TO PROVEN CASES (${Math.round(avgSimilarity * 100)}% avg)`,
        message: 'This project has unique characteristics not well-represented in proven cases.',
        impact: [
          'Design recommendations may not be optimal for this specific case',
          'Consider consulting domain experts for validation',
        ],
        actions: [
          {
            id: 'action-similarity-1',
            label: 'Review proven cases in References tab',
          },
          {
            id: 'action-similarity-2',
            label: 'Identify key differences and assess impact on design',
          },
        ],
      })
    }
  }

  // Sort by severity: critical → high → medium
  const severityOrder = { critical: 1, high: 2, medium: 3 }
  return flags.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
}
