"use client"

/**
 * Problem-Solution Hero Component
 * Minimalist design focused on data hierarchy
 */

import { CheckCircle, ArrowRight } from 'lucide-react'
import type { Proposal, Project } from './types'

interface ProblemSolutionHeroProps {
  proposal: Proposal
  project: Project
  techList: string[]
}

export function ProblemSolutionHero({ proposal, project, techList }: ProblemSolutionHeroProps) {
  const problemAnalysis = proposal.aiMetadata?.problemAnalysis
  
  if (!problemAnalysis && !proposal.treatmentEfficiency) return null

  return (
    <div className="mb-12">
      {/* Minimalist header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold tracking-tight mb-2">
          {project.name}
        </h2>
        <p className="text-muted-foreground">
          AI-generated conceptual proposal
        </p>
      </div>

      {/* Clean two-column layout */}
      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-8 items-start">
        {/* LEFT: Problem */}
        <div className="space-y-6">
          <div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Problem
            </div>
            
            {/* Key metrics - minimalist style */}
            <div className="space-y-3">
              {problemAnalysis?.influentCharacteristics?.flowRateM3Day && (
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold tracking-tight">
                    {problemAnalysis.influentCharacteristics.flowRateM3Day.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">m³/día</span>
                </div>
              )}
              
              {/* Contaminants - clean table */}
              {problemAnalysis?.influentCharacteristics?.parameters?.slice(0, 3).map((param) => (
                <div key={param.parameter} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground">{param.parameter}</span>
                  <span className="text-sm font-mono font-medium">
                    {param.value} {param.unit}
                  </span>
                </div>
              ))}
            </div>

            {/* Objectives - clean list */}
            {problemAnalysis?.qualityObjectives && problemAnalysis.qualityObjectives.length > 0 && (
              <div className="pt-4 border-t">
                <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
                  Objectives
                </div>
                <div className="text-sm leading-relaxed">
                  {problemAnalysis.qualityObjectives.join(', ')}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* CENTER: Arrow */}
        <div className="hidden md:flex items-center justify-center py-8">
          <ArrowRight className="h-6 w-6 text-muted-foreground/30" />
        </div>

        {/* RIGHT: Solution */}
        <div className="space-y-6">
          <div>
            <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-4">
              Solution
            </div>
            
            {/* Technology stack - minimalist */}
            <div className="space-y-3 mb-6">
              <div className="text-lg font-medium">
                {techList.join(' → ')}
              </div>
              
              {/* Compliance badge */}
              {proposal.treatmentEfficiency?.overallCompliance && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm font-medium">Meets regulations</span>
                </div>
              )}
            </div>

            {/* Key metrics - clean */}
            <div className="space-y-3">
              {proposal.operationalData?.requiredAreaM2 && (
                <div className="flex justify-between py-2 border-b border-border/50">
                  <span className="text-sm text-muted-foreground">Area</span>
                  <span className="text-sm font-mono font-medium">
                    {proposal.operationalData.requiredAreaM2.toLocaleString()} m²
                  </span>
                </div>
              )}

              {proposal.aiMetadata?.technicalData?.implementationMonths && (
                <div className="flex justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-muted-foreground">Timeline</span>
                  <span className="text-sm font-mono font-medium">
                    {proposal.aiMetadata.technicalData.implementationMonths} months
                  </span>
                </div>
              )}
            </div>

            {/* AI Confidence - subtle */}
            {proposal.aiMetadata?.confidenceLevel && (
              <div className="pt-4 border-t">
                <div className="text-xs text-muted-foreground">
                  AI Confidence: <span className="font-medium">{proposal.aiMetadata.confidenceLevel}</span>
                  {proposal.aiMetadata.provenCases?.length > 0 &&
                    ` · ${proposal.aiMetadata.provenCases.length} similar cases`
                  }
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
