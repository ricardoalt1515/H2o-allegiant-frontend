"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  FileText,
  Brain,
  CheckCircle,
  Clock,
  ArrowRight,
  AlertTriangle,
  Zap,
  TrendingUp
} from "lucide-react"
import { useProjects } from "@/lib/stores"
import type { ProjectSummary } from "@/lib/project-types"
import { cn } from "@/lib/utils"
import { routes } from "@/lib/routes"

interface PipelineStage {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  statuses: string[]
}

const PIPELINE_STAGES: PipelineStage[] = [
  {
    id: "preparation",
    title: "Preparation",
    description: "Technical data capture",
    icon: FileText,
    color: "blue",
    statuses: ["In Preparation"]
  },
  {
    id: "analysis",
    title: "Analysis",
    description: "AI processing",
    icon: Brain,
    color: "purple",
    statuses: ["Generating Proposal", "In Development"]
  },
  {
    id: "ready",
    title: "Ready",
    description: "Proposal generated",
    icon: CheckCircle,
    color: "green",
    statuses: ["Proposal Ready"]
  },
  {
    id: "completed",
    title: "Completed",
    description: "Project finalized",
    icon: Zap,
    color: "gray",
    statuses: ["Completed"]
  }
]

export function ProjectPipeline() {
  const projects = useProjects()
  const router = useRouter()

  const pipelineData = useMemo(() => {
    const stageData = PIPELINE_STAGES.map(stage => {
      const stageProjects = projects.filter(p =>
        stage.statuses.includes(p.status)
      )

      const avgProgress = stageProjects.length > 0
        ? Math.round(stageProjects.reduce((sum, p) => sum + p.progress, 0) / stageProjects.length)
        : 0

      // Find most urgent project in this stage
      const urgentProject = stageProjects.sort((a, b) => {
        const aUpdated = new Date(a.updatedAt).getTime()
        const bUpdated = new Date(b.updatedAt).getTime()
        return bUpdated - aUpdated
      })[0]

      return {
        ...stage,
        count: stageProjects.length,
        projects: stageProjects,
        avgProgress,
        urgentProject,
        isBottleneck: stageProjects.length > 3 // Flag bottlenecks
      }
    })

    // Calculate flow metrics
    const totalActive = projects.filter(p => p.status !== "Completed").length
    const throughput = projects.filter(p => p.status === "Completed").length
    const avgCycleTime = "6.2 weeks" // Mock - would be calculated from real data

    return {
      stages: stageData,
      metrics: {
        totalActive,
        throughput,
        avgCycleTime,
        bottleneck: stageData.find(s => s.isBottleneck)?.title || null
      }
    }
  }, [projects])

  const getStageColors = (color: string) => {
    const colorMap = {
      blue: {
        bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
        border: "border-blue-200/60 dark:border-blue-800/30",
        text: "text-blue-900 dark:text-blue-100",
        accent: "text-blue-600 dark:text-blue-400",
        badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
      },
      purple: {
        bg: "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
        border: "border-purple-200/60 dark:border-purple-800/30",
        text: "text-purple-900 dark:text-purple-100",
        accent: "text-purple-600 dark:text-purple-400",
        badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300"
      },
      green: {
        bg: "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
        border: "border-green-200/60 dark:border-green-800/30",
        text: "text-green-900 dark:text-green-100",
        accent: "text-green-600 dark:text-green-400",
        badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
      },
      gray: {
        bg: "bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-950/20 dark:to-gray-900/10",
        border: "border-gray-200/60 dark:border-gray-800/30",
        text: "text-gray-900 dark:text-gray-100",
        accent: "text-gray-600 dark:text-gray-400",
        badge: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300"
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.gray
  }

  if (projects.length === 0) {
    return null // Hidden when no projects
  }

  return (
    <div className="space-y-6">
      {/* Pipeline Overview */}
      <Card className="aqua-panel">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Proyect pipeline
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Flow and status of all your active projects
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-primary">
                {pipelineData.metrics.totalActive}
              </p>
              <p className="text-xs text-muted-foreground">active</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Stage Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {pipelineData.stages.map((stage, index) => {
              const colors = getStageColors(stage.color)
              const Icon = stage.icon

              return (
                <div key={stage.id} className="relative">
                  <Card className={cn(
                    colors.bg,
                    colors.border,
                    "transition-all duration-200 hover:shadow-md",
                    stage.isBottleneck && "ring-2 ring-amber-400/50 animate-pulse"
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center",
                          colors.badge
                        )}>
                          <Icon className={cn("h-4 w-4", colors.accent)} />
                        </div>
                        <div className="flex-1">
                          <h3 className={cn("font-medium text-sm", colors.text)}>
                            {stage.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {stage.description}
                          </p>
                        </div>
                        {stage.isBottleneck && (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        )}
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            Proyectos
                          </span>
                          <Badge className={colors.badge}>
                            {stage.count}
                          </Badge>
                        </div>

                        {stage.count > 0 && (
                          <>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-muted-foreground">
                                Progreso prom.
                              </span>
                              <span className={cn("text-xs font-medium", colors.accent)}>
                                {stage.avgProgress}%
                              </span>
                            </div>
                            <Progress
                              value={stage.avgProgress}
                              className="h-1.5"
                            />
                          </>
                        )}

                        {stage.urgentProject && (
                          <div className="pt-2 border-t border-white/10">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-between h-auto p-2 text-xs"
                              onClick={() => router.push(routes.project.detail(stage.urgentProject!.id))}
                            >
                              <span className="truncate">
                                {stage.urgentProject.name}
                              </span>
                              <ArrowRight className="h-3 w-3 ml-1 flex-shrink-0" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Flow Arrow */}
                  {index < pipelineData.stages.length - 1 && (
                    <div className="hidden md:block absolute top-1/2 -right-2 z-10">
                      <div className="h-4 w-4 bg-background border border-border rounded-full flex items-center justify-center">
                        <ArrowRight className="h-2 w-2 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <Separator />

          {/* Flow Metrics */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary">
                {pipelineData.metrics.throughput}
              </p>
              <p className="text-xs text-muted-foreground">
                Complete projects
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-primary">
                {pipelineData.metrics.avgCycleTime}
              </p>
              <p className="text-xs text-muted-foreground">
                Average time
              </p>
            </div>
            <div className="text-center">
              {pipelineData.metrics.bottleneck ? (
                <>
                  <p className="text-2xl font-semibold text-amber-600">
                    {pipelineData.metrics.bottleneck}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Bottleneck
                  </p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-semibold text-green-600">
                    Fluent
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No bottlenecks
                  </p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
