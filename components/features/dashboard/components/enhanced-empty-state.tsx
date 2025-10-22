"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Droplets,
  FileText,
  Brain,
  Zap,
  ArrowRight,
  Clock,
  Target,
  Sparkles,
  Play,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedEmptyStateProps {
  onCreateProject?: () => void
  onViewDemo?: () => void
}

export function EnhancedEmptyState({ onCreateProject, onViewDemo }: EnhancedEmptyStateProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null)

  const workflowSteps = [
    {
      id: 1,
      title: "Basic Data",
      description: "Name, client, location and sector",
      icon: FileText,
      duration: "2 min",
      color: "blue"
    },
    {
      id: 2,
      title: "Technical Sheet",
      description: "Flow rates, water quality and objectives",
      icon: Target,
      duration: "15 min",
      color: "purple"
    },
    {
      id: 3,
      title: "AI + Proposal",
      description: "Automatic generation with reasoning",
      icon: Brain,
      duration: "2 min",
      color: "green"
    }
  ]

  const benefits = [
    {
      title: "Reduce Time >50%",
      description: "From weeks to minutes",
      icon: Clock
    },
    {
      title: "Specialized AI",
      description: "Senior engineer reasoning",
      icon: Brain
    },
    {
      title: "Complete Traceability",
      description: "Versions and changes",
      icon: CheckCircle
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <Card className="aqua-panel relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/5" />
        <div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-gradient-radial from-primary/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-gradient-radial from-accent/15 via-transparent to-transparent blur-3xl" />
        <CardContent className="relative p-8 lg:p-12 text-center">
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary/80 shadow-2xl flex items-center justify-center mb-6 animate-float">
            <Droplets className="h-10 w-10 text-primary-foreground" />
          </div>

          <div className="space-y-4 mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
              Welcome to H2O Allegiant!
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Your central hub for water treatment projects.
              <strong className="text-primary"> Reduce proposal preparation time from weeks to minutes.</strong>
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <Button
              size="lg"
              onClick={onCreateProject}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="h-5 w-5 mr-2" />
              Create First Project
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>

            {onViewDemo && (
              <Button variant="outline" size="lg" onClick={onViewDemo}>
                <Play className="h-4 w-4 mr-2" />
                View Demo (2 min)
              </Button>
            )}
          </div>

          <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
            🚀 You only need 4 basic pieces of data to start
          </Badge>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {workflowSteps.map((step, index) => {
          const Icon = step.icon
          const isActive = activeStep === step.id
          const colors = {
            blue: {
              bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
              border: "border-blue-200/60 dark:border-blue-800/30",
              icon: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
              number: "bg-blue-500 text-white"
            },
            purple: {
              bg: "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/20 dark:to-purple-900/10",
              border: "border-purple-200/60 dark:border-purple-800/30",
              icon: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
              number: "bg-purple-500 text-white"
            },
            green: {
              bg: "bg-gradient-to-br from-green-50 to-green-100/50 dark:from-green-950/20 dark:to-green-900/10",
              border: "border-green-200/60 dark:border-green-800/30",
              icon: "bg-green-500/10 text-green-600 dark:text-green-400",
              number: "bg-green-500 text-white"
            }
          }

          const colorScheme = colors[step.color as keyof typeof colors]

          return (
            <div key={step.id} className="relative">
              <Card
                className={cn(
                  colorScheme.bg,
                  colorScheme.border,
                  "transition-all duration-300 hover:shadow-lg cursor-pointer",
                  isActive && "ring-2 ring-primary/50 scale-105"
                )}
                onMouseEnter={() => setActiveStep(step.id)}
                onMouseLeave={() => setActiveStep(null)}
              >
                <CardContent className="p-6 text-center">
                  <div className="relative mb-4">
                    <div className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-3",
                      colorScheme.icon
                    )}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className={cn(
                      "absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                      colorScheme.number
                    )}>
                      {step.id}
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {step.description}
                  </p>
                  <Badge variant="secondary" className="text-xs">
                    ⏱️ {step.duration}
                  </Badge>
                </CardContent>
              </Card>

              {/* Flow Arrow */}
              {index < workflowSteps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-3 z-10">
                  <div className="h-6 w-6 bg-background border border-border rounded-full flex items-center justify-center shadow-sm">
                    <ArrowRight className="h-3 w-3 text-primary" />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Benefits Grid */}
      <Card className="aqua-panel">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Why H2O Allegiant?
            </h2>
            <p className="text-muted-foreground">
              Designed specifically for water treatment engineers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon

              return (
                <div key={index} className="text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>

          <Separator className="my-6" />

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              <strong className="text-foreground">💡 Tip:</strong> Start with basic data and gradually add technical information.
              AI will help you complete what's missing.
            </p>
            <Button
              onClick={onCreateProject}
              className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary"
            >
              <Zap className="h-4 w-4 mr-2" />
              Start Now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}