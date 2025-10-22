/**
 * ProposalDetail - Main component for proposal detail view
 *
 * Single-page scroll with navigation sidebar, progress tracking, and interactive visualizations.
 * Replaces tabs system with 6 zones that scroll together.
 */

'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { useInView } from 'react-intersection-observer'
import { useSectionTracking } from '@/lib/hooks/use-section-tracking'
import {
  NavigationSidebar,
  NavigationMobile,
} from './navigation'
import {
  CostBreakdownDonut,
  OpexProjectionChart,
  ProvenCasesCarousel,
} from './visualizations'
import {
  CommandCenterHeader,
  HeroSection,
  AssumptionsSection,
  MetricsCards,
  EquipmentTable,
  TreatmentTrainInteractive,
  WaterQualityChart,
  RedFlagsSection,
} from './sections'
import { StickyDecisionPanel } from '@/components/features/proposals'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import type { ProposalDetailProps, ProposalDetailSection } from './types'

const SECTIONS: ProposalDetailSection[] = [
  { id: 'trust-dashboard', label: 'Trust Dashboard', description: 'Overview & key metrics' },
  { id: 'red-flags', label: 'Red Flags', description: 'Critical issues' },
  { id: 'technical-dive', label: 'Technical', description: 'Equipment & specs' },
  { id: 'economic', label: 'Economics', description: 'Costs & ROI' },
  { id: 'ai-transparency', label: 'AI References', description: 'Proven cases' },
  { id: 'executive-summary', label: 'Summary', description: 'Client-ready view' },
]

export function ProposalDetail({
  proposal,
  projectName,
  projectId,
  onStatusChange,
  onDownloadPDF,
}: ProposalDetailProps) {
  const router = useRouter()
  const [isDownloadingPDF, setIsDownloadingPDF] = useState(false)
  const [activeSection, setActiveSection] = useState<string | null>(null)

  // Section tracking and scroll-spy
  const { reviewedSections, markAsReviewed, completionPercent } = useSectionTracking(
    proposal.id,
    SECTIONS.length
  )

  // Intersection observers for each section
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({})

  // Track visible section
  const handleSectionInView = (sectionId: string) => {
    setActiveSection(sectionId)
    markAsReviewed(sectionId)
  }

  // Render ref callback
  const registerSectionRef = (sectionId: string) => (el: HTMLElement | null) => {
    if (el) {
      sectionRefs.current[sectionId] = el
    }
  }

  /**
   * Handle PDF download
   */
  const handleDownloadPDF = async () => {
    if (!onDownloadPDF) return

    try {
      setIsDownloadingPDF(true)
      await onDownloadPDF(proposal.id)
    } catch (error) {
      console.error('PDF download failed:', error)
      toast.error('Error al descargar PDF', {
        description: error instanceof Error ? error.message : 'Intenta nuevamente'
      })
    } finally {
      setIsDownloadingPDF(false)
    }
  }

  /**
   * Handle copy link
   */
  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href)
    toast.success('Enlace copiado al portapapeles')
  }

  /**
   * Handle approve
   */
  const handleApprove = () => {
    if (onStatusChange) {
      onStatusChange(proposal.id, 'Current')
      toast.success('Propuesta aprobada y marcada como actual')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Components */}
      <NavigationSidebar
        sections={SECTIONS}
        activeSection={activeSection}
        reviewedSections={reviewedSections}
        completionPercent={completionPercent}
      />

      <NavigationMobile
        sections={SECTIONS}
        activeSection={activeSection}
        reviewedSections={reviewedSections}
        completionPercent={completionPercent}
      />

      {/* Main Content */}
      <main className="lg:pl-48 bg-background">
        {/* Back button */}
        <div className="mx-auto max-w-[1600px] px-8 pt-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al proyecto
          </Button>
        </div>

        {/* ZONE 1: Trust Dashboard */}
        <section
          id="trust-dashboard"
          ref={registerSectionRef('trust-dashboard')}
          data-section-id="trust-dashboard"
          className="mx-auto max-w-[1600px] px-8 py-12 space-y-8"
        >
          <CommandCenterHeader
            proposal={proposal}
            projectName={projectName}
            onDownloadPDF={handleDownloadPDF}
            onShare={handleCopyLink}
            onApprove={handleApprove}
            isDownloadingPDF={isDownloadingPDF}
          />
          <InViewTracker sectionId="trust-dashboard" onInView={handleSectionInView} />
        </section>

        {/* ZONE 2: Red Flags (Conditional) */}
        {proposal.treatmentEfficiency?.overallCompliance === false ||
        proposal.aiMetadata?.confidenceLevel === 'Low' ||
        (proposal.aiMetadata?.assumptions?.length || 0) >= 5 ? (
          <section
            id="red-flags"
            ref={registerSectionRef('red-flags')}
            data-section-id="red-flags"
            className="mx-auto max-w-[1600px] px-8 py-12"
          >
            <RedFlagsSection proposal={proposal} />
            <InViewTracker sectionId="red-flags" onInView={handleSectionInView} />
          </section>
        ) : null}

        {/* ZONE 3: Technical Deep Dive */}
        <section
          id="technical-dive"
          ref={registerSectionRef('technical-dive')}
          data-section-id="technical-dive"
          className="mx-auto max-w-[1600px] px-8 py-12 space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Technical Deep Dive</h2>
            <p className="text-lg text-muted-foreground">
              Equipment specifications and water quality transformation
            </p>
          </div>

          {proposal.equipmentList && proposal.equipmentList.length > 0 && (
            <>
              <TreatmentTrainInteractive equipmentList={proposal.equipmentList} />
              <Separator className="my-8" />
            </>
          )}

          {proposal.treatmentEfficiency?.parameters && (
            <>
              <WaterQualityChart parameters={proposal.treatmentEfficiency.parameters} showAll={true} />
              <Separator className="my-8" />
            </>
          )}

          {proposal.equipmentList && proposal.equipmentList.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Equipment Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <EquipmentTable equipment={proposal.equipmentList} showCriticality={true} groupByStage={true} />
              </CardContent>
            </Card>
          )}

          <InViewTracker sectionId="technical-dive" onInView={handleSectionInView} />
        </section>

        {/* ZONE 4: Economic Validation */}
        <section
          id="economic"
          ref={registerSectionRef('economic')}
          data-section-id="economic"
          className="mx-auto max-w-[1600px] px-8 py-12 space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Economic Validation</h2>
            <p className="text-lg text-muted-foreground">
              Capital and operational cost breakdown
            </p>
          </div>

          <CostBreakdownDonut
            breakdown={proposal.snapshot?.costBreakdown}
            total={proposal.capex}
            type="CAPEX"
          />

          {proposal.aiMetadata?.technicalData?.opexBreakdown && (
            <OpexProjectionChart
              annualOpex={proposal.opex}
              breakdown={proposal.aiMetadata.technicalData.opexBreakdown}
            />
          )}

          <InViewTracker sectionId="economic" onInView={handleSectionInView} />
        </section>

        {/* ZONE 5: AI Transparency */}
        <section
          id="ai-transparency"
          ref={registerSectionRef('ai-transparency')}
          data-section-id="ai-transparency"
          className="mx-auto max-w-[1600px] px-8 py-12 space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">AI Transparency</h2>
            <p className="text-lg text-muted-foreground">
              Proven cases and AI reasoning
            </p>
          </div>

          <ProvenCasesCarousel cases={proposal.aiMetadata?.provenCases || []} />

          <InViewTracker sectionId="ai-transparency" onInView={handleSectionInView} />
        </section>

        {/* ZONE 6: Executive Summary */}
        <section
          id="executive-summary"
          ref={registerSectionRef('executive-summary')}
          data-section-id="executive-summary"
          className="mx-auto max-w-[1600px] px-8 py-12 space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-foreground">Executive Summary</h2>
            <p className="text-lg text-muted-foreground">
              Client-ready project overview
            </p>
          </div>

          {proposal.snapshot?.executiveSummary && (
            <Card>
              <CardHeader>
                <CardTitle>Project Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {proposal.snapshot.executiveSummary}
                </p>
              </CardContent>
            </Card>
          )}

          <InViewTracker sectionId="executive-summary" onInView={handleSectionInView} />
        </section>

        {/* Spacing for sticky panel */}
        <div className="h-24" />
      </main>

      {/* Sticky Decision Panel */}
      <StickyDecisionPanel
        project={{ id: projectId, name: projectName } as any}
        proposal={proposal as any}
        isDownloadingPDF={isDownloadingPDF}
        onDownloadPDF={handleDownloadPDF}
      />
    </div>
  )
}

/**
 * Helper component for tracking section visibility
 */
function InViewTracker({
  sectionId,
  onInView,
}: {
  sectionId: string
  onInView: (sectionId: string) => void
}) {
  const { ref } = useInView({
    threshold: 0.3,
    onChange: (inView) => {
      if (inView) {
        onInView(sectionId)
      }
    },
  })

  return <div ref={ref} className="h-1" aria-hidden="true" />
}

export default ProposalDetail
