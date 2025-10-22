"use client"

import { useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  CheckCircle2,
  TrendingUp,
  Clock,
  Building
} from "lucide-react"
import { useProjects } from "@/lib/stores"
import { cn } from "@/lib/utils"

export function SimplifiedStats() {
  const projects = useProjects()

  const stats = useMemo(() => {
    const total = projects.length
    const inPreparation = projects.filter(p => p.status === "In Preparation").length
    const generating = projects.filter(p => p.status === "Generating Proposal").length
    const ready = projects.filter(p => p.status === "Proposal Ready").length
    const completed = projects.filter(p => p.status === "Completed").length

    // Calculate efficiency metrics
    const avgProgress = total > 0
      ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / total)
      : 0

    const activeProjects = total - completed
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0

    return {
      total,
      inPreparation,
      generating,
      ready,
      completed,
      avgProgress,
      activeProjects,
      completionRate
    }
  }, [projects])

  const statCards = [
    {
      id: "active",
      title: "Active Projects",
      value: stats.activeProjects,
      description: "Require attention",
      icon: Building,
      color: "blue",
      priority: stats.inPreparation > 0 ? "high" : "normal"
    },
    {
      id: "ready",
      title: "Ready Proposals",
      value: stats.ready,
      description: "For review and delivery",
      icon: Zap,
      color: "green",
      priority: stats.ready > 0 ? "high" : "normal"
    },
    {
      id: "efficiency",
      title: "Average Progress",
      value: `${stats.avgProgress}%`,
      description: "Overall completion",
      icon: TrendingUp,
      color: "purple",
      priority: "normal"
    }
  ]

  if (stats.total === 0) {
    return null // Hero component handles empty state
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {statCards.map((stat) => {
        const Icon = stat.icon
        const colorClasses = {
          blue: {
            bg: "bg-gradient-to-br from-blue-500/10 to-blue-500/5 dark:from-blue-500/15 dark:to-blue-500/5",
            border: "border-blue-500/20 dark:border-blue-500/25",
            iconBg: "bg-blue-500/15 dark:bg-blue-500/20",
            iconColor: "text-blue-600 dark:text-blue-400",
            valueColor: "text-blue-900 dark:text-blue-100",
            descColor: "text-blue-700 dark:text-blue-300"
          },
          green: {
            bg: "bg-gradient-to-br from-green-500/10 to-green-500/5 dark:from-green-500/15 dark:to-green-500/5",
            border: "border-green-500/20 dark:border-green-500/25",
            iconBg: "bg-green-500/15 dark:bg-green-500/20",
            iconColor: "text-green-600 dark:text-green-400",
            valueColor: "text-green-900 dark:text-green-100",
            descColor: "text-green-700 dark:text-green-300"
          },
          purple: {
            bg: "bg-gradient-to-br from-purple-500/10 to-purple-500/5 dark:from-purple-500/15 dark:to-purple-500/5",
            border: "border-purple-500/20 dark:border-purple-500/25",
            iconBg: "bg-purple-500/15 dark:bg-purple-500/20",
            iconColor: "text-purple-600 dark:text-purple-400",
            valueColor: "text-purple-900 dark:text-purple-100",
            descColor: "text-purple-700 dark:text-purple-300"
          }
        }

        const colors = colorClasses[stat.color as keyof typeof colorClasses]

        return (
          <Card
            key={stat.id}
            className={cn(
              colors.bg,
              colors.border,
              "transition-all duration-200 hover:shadow-md",
              stat.priority === "high" && "ring-2 ring-primary/20 animate-pulse"
            )}
          >
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "h-12 w-12 rounded-xl flex items-center justify-center",
                  colors.iconBg
                )}>
                  <Icon className={cn("h-6 w-6", colors.iconColor)} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-medium">
                      {stat.title}
                    </p>
                    {stat.priority === "high" && (
                      <Badge variant="secondary" className="text-xs">
                        Action Required
                      </Badge>
                    )}
                  </div>
                  <p className={cn("text-3xl font-bold", colors.valueColor)}>
                    {stat.value}
                  </p>
                  <p className={cn("text-sm", colors.descColor)}>
                    {stat.description}
                  </p>
                </div>
              </div>

              {/* Additional context for each stat */}
              {stat.id === "active" && stats.inPreparation > 0 && (
                <div className="mt-4 pt-4 border-t border-blue-200/40">
                  <div className="flex items-center gap-2 text-xs text-blue-600">
                    <Clock className="h-3 w-3" />
                    <span>{stats.inPreparation} need to complete technical sheet</span>
                  </div>
                </div>
              )}

              {stat.id === "ready" && stats.generating > 0 && (
                <div className="mt-4 pt-4 border-t border-green-200/40">
                  <div className="flex items-center gap-2 text-xs text-green-600">
                    <Zap className="h-3 w-3" />
                    <span>{stats.generating} generating proposal...</span>
                  </div>
                </div>
              )}

              {stat.id === "efficiency" && (
                <div className="mt-4 pt-4 border-t border-purple-200/40">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-purple-600">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{stats.completed} completed</span>
                    </div>
                    <span className="text-purple-600 font-medium">
                      {stats.completionRate}% success rate
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}