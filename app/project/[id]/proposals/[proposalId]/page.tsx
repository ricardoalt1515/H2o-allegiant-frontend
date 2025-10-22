/**
 * Proposal Detail Page - Next.js 15 App Router page
 *
 * Simplified to use the modular ProposalDetail component.
 * Handles data fetching and delegates UI rendering to the component.
 */

'use client'

import { use, useState, useEffect } from 'react'
import { notFound } from 'next/navigation'
import { useCurrentProject, useProjectActions } from '@/lib/stores'
import { ProposalsAPI } from '@/lib/api/proposals'
import { ProposalDetail } from '@/components/features/proposals'
import type { Proposal } from '@/components/features/proposals/proposal-detail/types'

interface PageProps {
  params: Promise<{ id: string; proposalId: string }>
}

export default function ProposalDetailPage({ params }: PageProps) {
  const { id: projectId, proposalId } = use(params)
  const project = useCurrentProject()
  const { updateProposalStatus } = useProjectActions()
  const [proposal, setProposal] = useState<Proposal | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch proposal data
  useEffect(() => {
    if (!project) return

    // Try to find in store first (faster)
    const storeProposal = project.proposals?.find(p => p.id === proposalId)

    if (storeProposal) {
      setProposal(storeProposal as Proposal)
      setLoading(false)
    } else {
      // Fallback to API if not in store
      ProposalsAPI.getProposal(projectId, proposalId)
        .then(apiProposal => {
          setProposal(apiProposal as Proposal)
          setLoading(false)
        })
        .catch(error => {
          console.error('❌ Failed to load proposal:', error)
          setLoading(false)
        })
    }
  }, [project, projectId, proposalId])

  // Loading state
  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando propuesta...</p>
        </div>
      </div>
    )
  }

  // 404 if proposal not found
  if (!proposal) {
    notFound()
  }

  /**
   * Handle status change (set as current, archive, etc.)
   */
  const handleStatusChange = (proposalId: string, status: Proposal['status']) => {
    updateProposalStatus(projectId, proposalId, status)
  }

  /**
   * Handle PDF download
   */
  const handleDownloadPDF = async (proposalId: string) => {
    const blob = await ProposalsAPI.downloadProposalPDF(projectId, proposalId)

    // Create download link
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `Proposal_${proposal.version}_${project.name.replace(/\s+/g, '_')}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Cleanup
    URL.revokeObjectURL(url)
  }

  return (
    <ProposalDetail
      proposal={proposal}
      projectName={project.name}
      projectId={projectId}
      onStatusChange={handleStatusChange}
      onDownloadPDF={handleDownloadPDF}
    />
  )
}
