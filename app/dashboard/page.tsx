"use client"

import React, { useMemo, memo, useCallback } from "react"
import { ProjectCard, EnhancedEmptyState, DashboardHero, SimplifiedStats, ProjectPipeline, SmartNotifications, PremiumProjectWizard } from "@/components/features/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Filter,
  Search,
} from "lucide-react"
import ClientOnly from "@/components/shared/common/client-only"
import { EmptyState } from "@/components/ui/empty-state"
import { useEnsureProjectsLoaded, useProjects, useProjectLoading } from "@/lib/stores"
import { PROJECT_STATUS_GROUPS } from "@/lib/project-status"
import type { ProjectSummary, ProjectStatus } from "@/lib/project-types"
import { useDashboardFilters, type DashboardFilterKey } from "@/hooks/use-dashboard-filters"


// Memoized Project List Component
const ProjectList = memo(function ProjectList({
  projects,
  loading,
  totalProjects,
  hasActiveFilters,
  onCreateProject,
  onClearFilters,
}: {
  projects: ProjectSummary[]
  loading: boolean
  totalProjects: number
  hasActiveFilters: boolean
  onCreateProject?: () => void
  onClearFilters?: () => void
}) {
  if (loading) {
    return <DashboardSkeleton />
  }

  if (projects.length === 0) {
    // No projects at all - first time user
    if (totalProjects === 0) {
      return (
        <EnhancedEmptyState
          {...(onCreateProject ? { onCreateProject } : {})}
        />
      )
    }

    // Has projects but none match filters
    return (
      <EmptyState
        icon={Search}
        title="No projects match"
        description={hasActiveFilters
          ? "Adjust search filters to see more projects."
          : "Try other search terms."
        }
        {...(hasActiveFilters && onClearFilters
          ? { action: { label: "Clear filters", onClick: onClearFilters, variant: "outline" as const } }
          : {})}
      />
    )
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3 animate-stagger">
      {projects.map((project) => (
        <ProjectCard key={project.id} {...project} />
      ))}
    </div>
  )
})

const DashboardContent = memo(function DashboardContent() {
  const {
    filter,
    searchTerm,
    hasActiveFilters,
    setFilter,
    setSearchTerm,
    clearFilters,
  } = useDashboardFilters()
  const [createModalOpen, setCreateModalOpen] = React.useState(false)
  const projects = useProjects()
  const loading = useProjectLoading()
  useEnsureProjectsLoaded()

  const filteredProjectsList = useMemo(() => {
    const allowedStatuses: ProjectStatus[] = (PROJECT_STATUS_GROUPS as Record<DashboardFilterKey, ProjectStatus[]>)[filter] || []
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return projects.filter((project) => {
      const matchesSearch =
        normalizedSearch === "" ||
        project.name.toLowerCase().includes(normalizedSearch) ||
        project.client.toLowerCase().includes(normalizedSearch) ||
        project.location.toLowerCase().includes(normalizedSearch)

      const matchesFilter = allowedStatuses.includes(project.status)
      return matchesSearch && matchesFilter
    })
  }, [projects, filter, searchTerm])

  const filterOptions = React.useMemo(
    () => (
      Object.entries(PROJECT_STATUS_GROUPS).map(([value, group]) => ({
        value: value as DashboardFilterKey,
        label:
          value === "all"
            ? "All"
            : value === "active"
              ? "Active"
              : value === "completed"
                ? "Completed"
                : value === "onhold"
                  ? "On Hold"
                  : group.join(", "),
      }))
    ),
    []
  )

  const handleSearchChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }, [setSearchTerm])

  const handleFilterChange = useCallback((value: DashboardFilterKey) => {
    setFilter(value)
  }, [setFilter])

  const handleClearFilters = useCallback(() => {
    clearFilters()
  }, [clearFilters])

  const handleOpenCreateModal = useCallback(() => {
    setCreateModalOpen(true)
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="animate-fade-in-up">
        <DashboardHero onCreateProject={handleOpenCreateModal} />
      </div>

      {/* Pipeline Overview */}
      <div className="animate-fade-in-up" style={{animationDelay: "200ms"}}>
        <ProjectPipeline />
      </div>

      {/* Enhanced Stats Grid */}
      <div className="animate-fade-in-up grid grid-cols-1 lg:grid-cols-3 gap-6" style={{animationDelay: "300ms"}}>
        <div className="lg:col-span-2">
          <SimplifiedStats />
        </div>
        <div>
          <SmartNotifications />
        </div>
      </div>

      {/* Header with search */}
      <div className="animate-slide-in-left" style={{animationDelay: "500ms"}}>
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            All Projects
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage and filter all your water treatment projects.
          </p>
          <div className="flex items-center gap-2 pt-2">
            <p className="text-xs text-muted-foreground">
              Use <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">⌘K</kbd> for advanced search
            </p>
          </div>
        </div>
        </header>
      </div>

      <section className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-semibold">Your Projects</CardTitle>
            <CardDescription>
              Filter by status and search by name, client, or location.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search projects or clients"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-9"
                autoComplete="off"
              />
            </div>
            <div className="flex w-full gap-2 sm:w-auto">
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-48">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value as keyof typeof PROJECT_STATUS_GROUPS}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <ProjectList
          projects={filteredProjectsList}
          loading={loading}
          totalProjects={projects.length}
          hasActiveFilters={hasActiveFilters}
          onCreateProject={handleOpenCreateModal}
          onClearFilters={handleClearFilters}
        />
      </section>

      <PremiumProjectWizard
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onProjectCreated={(projectId) => {
          // Project creation handled by wizard
          console.log('Project created:', projectId)
        }}
      />
    </div>
  )
})

// Dashboard Skeleton Component
function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-12" />
              <Skeleton className="h-4 w-36" />
            </CardHeader>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-48" />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} className="h-64">
            <CardHeader className="space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
              <Skeleton className="h-3 w-28" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-10 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Main Dashboard Page Component
export default function DashboardPage() {
  return (
    <ClientOnly fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </ClientOnly>
  )
}