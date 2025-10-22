/**
 * IntelligentProposalGenerator Component
 * Real AI-powered proposal generation with live progress tracking
 *
 * Architecture:
 * - Uses useProposalGeneration hook for API communication
 * - Real-time progress updates from backend AI agent
 * - Automatic polling with exponential backoff
 * - Error handling with retry capability
 */

"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Zap,
  Brain,
  Cog,
  FileText,
  CheckCircle,
  Loader2,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"

import { useProposalGeneration } from "@/lib/hooks/use-proposal-generation"
import { useCurrentProject } from "@/lib/stores"
import { useTechnicalSummaryData } from "@/lib/stores/technical-data-store"
import type { ProjectDetail } from "@/lib/project-types"

interface IntelligentProposalGeneratorProps {
  projectId: string
  onProposalGenerated?: (proposalId: string) => void
  onGenerationStart?: () => void
  onGenerationEnd?: () => void
}

export function IntelligentProposalGeneratorComponent({
  projectId,
  onProposalGenerated,
  onGenerationStart,
  onGenerationEnd,
}: IntelligentProposalGeneratorProps) {
  const router = useRouter()
  const storeProject = useCurrentProject()
  const { completion: completeness } = useTechnicalSummaryData(projectId)

  // State
  const [showProgress, setShowProgress] = useState(false)
  const [proposalType, setProposalType] = useState<'Conceptual' | 'Technical' | 'Detailed'>('Conceptual')

  // Project validation
  const project: ProjectDetail | null = useMemo(() => {
    return storeProject && storeProject.id === projectId
      ? (storeProject as ProjectDetail)
      : null
  }, [storeProject, projectId])

  // Check if can generate (70% minimum)
  const canGenerate = completeness.percentage >= 70

  // Use proposal generation hook
  const {
    generate,
    cancel,
    progress,
    currentStep,
    isGenerating,
    error,
    reasoning,
  } = useProposalGeneration({
    projectId,
    onComplete: async (proposalId) => {
      toast.success('Proposal generated successfully!', {
        description: 'Loading proposal...',
      })

      try {
        // Reload project to get the new proposal in store
        console.log('🔄 Reloading project to include new proposal...')
        await fetch(`/api/projects/${projectId}`, { cache: 'no-store' })
        
        // Wait a bit to ensure store updates
        await new Promise(resolve => setTimeout(resolve, 500))
        
        onProposalGenerated?.(proposalId)
        router.push(`/project/${projectId}/proposals/${proposalId}`)
      } catch (error) {
        console.error('Error reloading project:', error)
        // Still navigate even if reload fails
        router.push(`/project/${projectId}/proposals/${proposalId}`)
      }
    },
    onError: (errorMsg) => {
      toast.error('Error en la generación', {
        description: errorMsg,
      })
      onGenerationEnd?.()
    },
    onProgress: (progressValue, step) => {
      // Progress updates handled by hook state
      onGenerationStart?.()
    },
  })

  /**
   * Handle start generation button click
   */
  const handleStartGeneration = async () => {
    console.log('🔴 [Component] handleStartGeneration called!')
    console.log('🔴 [Component] Project:', { id: project?.id, name: project?.name })
    console.log('🔴 [Component] Can generate:', canGenerate, `(${completeness.percentage}%)`)
    
    if (!project) {
      toast.error('Error', {
        description: 'No se pudo cargar el proyecto. Intenta recargar la página.',
      })
      return
    }

    if (!canGenerate) {
      toast.warning('Insufficient data', {
        description: `Complete at least 70% of technical data (currently: ${completeness.percentage}%)`,
      })
      return
    }

    console.log('🔴 [Component] About to show progress dialog')
    // Show progress dialog
    setShowProgress(true)
    onGenerationStart?.()

    try {
      console.log('🔴 [Component] About to call generate()')
      // Start generation
      await generate({
        proposalType,
        preferences: {
          focusAreas: ['cost-optimization', 'sustainability'],
          constraints: {
            max_duration_months: 12,
          },
        },
      })
      console.log('✅ [Component] generate() completed successfully')
    } catch (error) {
      console.error('❌ [Component] Error in handleStartGeneration:', error)
      toast.error('Error generating proposal', {
        description: error instanceof Error ? error.message : 'Unknown error',
      })
      onGenerationEnd?.()
    }
  }

  /**
   * Handle cancel generation
   */
  const handleCancel = () => {
    cancel()
    setShowProgress(false)
    onGenerationEnd?.()
    toast.info('Generación cancelada')
  }

  /**
   * Handle retry after error
   */
  const handleRetry = () => {
    generate({ proposalType })
  }

  return (
    <>
      {/* Main Card */}
      <Card className="aqua-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Intelligent AI Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Completeness Badge */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Technical Data Completeness</p>
              <p className="text-xs text-muted-foreground">
                Minimum 70% to generate proposal
              </p>
            </div>
            <Badge
              variant={canGenerate ? "default" : "secondary"}
              className={canGenerate ? "bg-success text-success-foreground" : ""}
            >
              {completeness.percentage}%
            </Badge>
          </div>

          <Progress value={completeness.percentage} className="h-2" />

          {/* Warning if insufficient data */}
          {!canGenerate && (
            <Alert className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20 dark:border-amber-800/50">
              <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-xs text-amber-700 dark:text-amber-300">
                ⚠️ Complete more technical data to enable intelligent generation.
                Approximately {Math.ceil((70 - completeness.percentage) * completeness.total / 100)} fields remaining.
              </AlertDescription>
            </Alert>
          )}

          {/* Proposal Type Selector */}
          {canGenerate && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Proposal Type</p>
              <div className="grid grid-cols-3 gap-2">
                {(['Conceptual', 'Technical', 'Detailed'] as const).map((type) => (
                  <Button
                    key={type}
                    variant={proposalType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setProposalType(type)}
                    disabled={isGenerating}
                  >
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleStartGeneration}
            disabled={isGenerating || !canGenerate}
            size="lg"
            className={
              canGenerate
                ? "w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg hover:shadow-xl transition-all duration-300 text-base font-semibold"
                : "w-full bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed"
            }
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generando... ({progress}%)
              </>
            ) : (
              <>
                <Zap className="mr-2 h-5 w-5" />
                Generate {proposalType} Proposal
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Progress Dialog */}
      <Dialog open={showProgress} onOpenChange={setShowProgress}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Generating Proposal with AI
            </DialogTitle>
            <DialogDescription>
              The AI agent is analyzing the technical data and generating a professional proposal.
              This process may take 1-2 minutes.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">{currentStep}</span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            {/* Status Icons */}
            <div className="flex items-center justify-center gap-8">
              {[
                { icon: FileText, label: 'Analizando', threshold: 20 },
                { icon: Cog, label: 'Calculando', threshold: 50 },
                { icon: Brain, label: 'Optimizando', threshold: 75 },
                { icon: CheckCircle, label: 'Finalizando', threshold: 95 },
              ].map(({ icon: Icon, label, threshold }) => (
                <div
                  key={label}
                  className={`flex flex-col items-center gap-2 transition-all duration-300 ${
                    progress >= threshold
                      ? 'text-primary scale-110'
                      : 'text-muted-foreground opacity-50'
                  }`}
                >
                  <Icon
                    className={`h-8 w-8 ${
                      progress >= threshold && progress < threshold + 25
                        ? 'animate-pulse'
                        : ''
                    }`}
                  />
                  <span className="text-xs font-medium">{label}</span>
                </div>
              ))}
            </div>

            {/* AI Reasoning Log */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <p className="text-xs font-medium mb-2 text-muted-foreground">
                Proceso del Agente IA:
              </p>
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {reasoning.map((line, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      {line}
                    </p>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  <p className="font-medium">Error en la generación:</p>
                  <p className="text-sm">{error}</p>
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              {error ? (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowProgress(false)}
                    className="flex-1"
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={handleRetry}
                    className="flex-1"
                  >
                    Reintentar
                  </Button>
                </>
              ) : isGenerating ? (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="w-full"
                >
                  Cancelar
                </Button>
              ) : (
                <Button
                  onClick={() => setShowProgress(false)}
                  className="w-full"
                >
                  Cerrar
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}