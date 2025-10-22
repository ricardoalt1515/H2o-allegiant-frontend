"use client"

/**
 * Sticky Decision Panel - Minimalist Design
 * Clean, always-visible CTAs
 */

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import type { Project, Proposal } from './types'

interface StickyDecisionPanelProps {
  project: Project
  proposal: Proposal
  isDownloadingPDF: boolean
  onDownloadPDF: () => void
  onGetEngineering?: () => void
}

export function StickyDecisionPanel({
  project,
  proposal,
  isDownloadingPDF,
  onDownloadPDF,
  onGetEngineering,
}: StickyDecisionPanelProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1600px] px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Project info - minimal */}
          <div className="hidden sm:block text-sm">
            <span className="font-medium">{formatCurrency(proposal.capex)}</span>
            <span className="text-muted-foreground ml-2">CAPEX</span>
          </div>
          
          {/* CTAs - clean buttons */}
          <div className="flex items-center gap-3 ml-auto">
            <Button
              variant="ghost"
              onClick={onDownloadPDF}
              disabled={isDownloadingPDF}
              className="text-sm"
            >
              <Download className="mr-2 h-4 w-4" />
              {isDownloadingPDF ? 'Generating...' : 'PDF'}
            </Button>

            <Button
              onClick={onGetEngineering}
              disabled={!onGetEngineering}
              className="bg-foreground text-background hover:bg-foreground/90"
            >
              Generate Engineering
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
