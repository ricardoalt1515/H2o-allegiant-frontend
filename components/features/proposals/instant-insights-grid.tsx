/**
 * Instant Insights Grid
 * 4-card grid showing key proposal metrics at a glance
 * 
 * TIER 1 - CRITICAL COMPONENT
 * This is the engagement hook that shows value immediately
 */

"use client"

import React from 'react'
import {
  CheckCircle,
  DollarSign,
  Calendar,
  TrendingUp,
  AlertCircle,
  XCircle,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, formatCurrency } from '@/lib/utils'
import { calculateCompliance, type Proposal } from '@/lib/proposal-data-helpers'

interface InstantInsightsGridProps {
  proposal: Proposal
  industryAvgCapex?: number
  industryAvgOpex?: number
}

interface InsightCardProps {
  icon: React.ElementType
  title: string
  value: string | React.ReactNode
  details: string[]
  variant?: 'success' | 'warning' | 'error' | 'default'
  badge?: string
}

function InsightCard({
  icon: Icon,
  title,
  value,
  details,
  variant = 'default',
  badge,
}: InsightCardProps) {
  const variantStyles = {
    success: 'border-green-500/50 bg-green-500/5',
    warning: 'border-amber-500/50 bg-amber-500/5',
    error: 'border-red-500/50 bg-red-500/5',
    default: 'border-border',
  }

  const iconStyles = {
    success: 'text-green-600 dark:text-green-400',
    warning: 'text-amber-600 dark:text-amber-400',
    error: 'text-red-600 dark:text-red-400',
    default: 'text-primary',
  }

  return (
    <Card className={cn('relative overflow-hidden', variantStyles[variant])}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <Icon className={cn('h-5 w-5', iconStyles[variant])} />
          {badge && (
            <Badge variant="secondary" className="text-xs">
              {badge}
            </Badge>
          )}
        </div>
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <div className="space-y-1">
          {details.map((detail, idx) => (
            <div key={idx} className="text-xs text-muted-foreground">
              {detail}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export function InstantInsightsGrid({
  proposal,
  industryAvgCapex,
  industryAvgOpex,
}: InstantInsightsGridProps) {
  // Calculate compliance
  const compliance = calculateCompliance(proposal)
  const isCompliant = compliance?.overallCompliance ?? false
  const complianceChecks = compliance?.checks.length ?? 0

  // Calculate cost comparison
  const capexDiff = industryAvgCapex
    ? ((proposal.capex - industryAvgCapex) / industryAvgCapex) * 100
    : null

  const opexDiff = industryAvgOpex
    ? ((proposal.opex - industryAvgOpex) / industryAvgOpex) * 100
    : null

  // Get timeline data
  const implementationMonths =
    proposal.aiMetadata?.technicalData?.implementationMonths
  const designMonths = implementationMonths ? Math.ceil(implementationMonths * 0.3) : null
  const procurementMonths = implementationMonths ? Math.ceil(implementationMonths * 0.2) : null
  const installMonths = implementationMonths ? Math.ceil(implementationMonths * 0.5) : null

  // Get ROI data
  const paybackYears = proposal.aiMetadata?.technicalData?.paybackYears
  const roiPercent = proposal.aiMetadata?.technicalData?.roiPercent
  const annualSavings = proposal.aiMetadata?.technicalData?.annualSavingsUsd

  return (
    <div className="mb-12">
      <div className="mb-6">
        <h3 className="text-lg font-semibold">Executive Summary</h3>
        <p className="text-sm text-muted-foreground">
          Key metrics from AI-generated proposal
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 1. Compliance Card */}
        <InsightCard
          icon={isCompliant ? CheckCircle : XCircle}
          title="Regulatory Compliance"
          value={isCompliant ? '✅ Compliant' : '⚠️ Review'}
          details={
            compliance
              ? [
                  `${complianceChecks} parameters evaluated`,
                  isCompliant
                    ? 'All limits met'
                    : 'Some parameters out of range',
                ]
              : ['Insufficient data to evaluate']
          }
          variant={isCompliant ? 'success' : 'warning'}
        />

        {/* 2. Cost Card */}
        <InsightCard
          icon={DollarSign}
          title="Total Investment"
          value={formatCurrency(proposal.capex)}
          details={[
            `Annual OPEX: ${formatCurrency(proposal.opex)}`,
            capexDiff !== null
              ? `${capexDiff < 0 ? '↓' : '↑'} ${Math.abs(capexDiff).toFixed(0)}% vs industry`
              : 'Comparison unavailable',
          ]}
          variant={capexDiff && capexDiff < 0 ? 'success' : 'default'}
          {...(capexDiff && capexDiff < 0 ? { badge: 'Below average' } : {})}
        />

        {/* 3. Timeline Card */}
        <InsightCard
          icon={Calendar}
          title="Implementation Timeline"
          value={
            implementationMonths
              ? `${implementationMonths} months`
              : 'To be determined'
          }
          details={
            implementationMonths
              ? [
                  `Design: ${designMonths}m`,
                  `Procurement: ${procurementMonths}m`,
                  `Installation: ${installMonths}m`,
                ]
              : ['Data unavailable']
          }
        />

        {/* 4. ROI Card */}
        <InsightCard
          icon={TrendingUp}
          title="Return on Investment"
          value={
            paybackYears ? `${paybackYears.toFixed(1)} years` : 'To be calculated'
          }
          details={
            roiPercent && annualSavings
              ? [
                  `ROI: ${roiPercent.toFixed(0)}%`,
                  `Annual savings: ${formatCurrency(annualSavings)}`,
                ]
              : ['Data unavailable']
          }
          variant={paybackYears && paybackYears < 5 ? 'success' : 'default'}
          {...(paybackYears && paybackYears < 3 ? { badge: 'Excellent ROI' } : {})}
        />
      </div>

      {/* Warning if data incomplete */}
      {(!compliance || !implementationMonths || !paybackYears) && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3">
          <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div className="text-xs text-amber-700 dark:text-amber-300">
            <strong>Incomplete data:</strong> Some metrics are not
            available. The AI agent may need more technical information
            to calculate them.
          </div>
        </div>
      )}
    </div>
  )
}
