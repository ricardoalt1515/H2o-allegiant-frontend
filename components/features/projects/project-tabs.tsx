"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProjectOverview } from "./project-overview"
import { TechnicalDataSheet } from "./technical-data-sheet"
import { ProposalsTab } from "./proposals-tab"
import { FilesTabEnhanced } from "./files-tab-enhanced"
import { useCurrentProject, useLoadProjectAction } from "@/lib/stores"
import type { ProjectDetail, ProjectSummary } from "@/lib/project-types"

type ProjectTabsInput = ProjectSummary | ProjectDetail

interface ProjectTabsProps {
  project: ProjectTabsInput
}

export function ProjectTabs({ project }: ProjectTabsProps) {
  const storeProject = useCurrentProject()
  const loadProject = useLoadProjectAction()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const TAB_VALUES = ["overview", "technical", "proposals", "files"] as const
  type TabValue = (typeof TAB_VALUES)[number]

  const getValidTab = useCallback(
    (value: string | null): TabValue =>
      value && TAB_VALUES.includes(value as TabValue) ? (value as TabValue) : "overview",
    []
  )

  const initialTab = getValidTab(searchParams.get("tab"))
  const [activeTab, setActiveTab] = useState<TabValue>(initialTab)

  const tabParam = searchParams.get("tab")

  useEffect(() => {
    const nextTab = getValidTab(tabParam)
    setActiveTab((current) => (current === nextTab ? current : nextTab))
  }, [getValidTab, tabParam])

  const handleTabChange = useCallback(
    (value: string) => {
      const nextTab = getValidTab(value)
      setActiveTab(nextTab)

      const params = new URLSearchParams(searchParams.toString())

      if (nextTab === "overview") {
        params.delete("tab")
      } else {
        params.set("tab", nextTab)
      }

      const queryString = params.toString()
      const target = queryString ? `${pathname}?${queryString}` : pathname

      router.replace(target, { scroll: false })
    },
    [getValidTab, pathname, router, searchParams]
  )

  useEffect(() => {
    const currentId = storeProject?.id
    if (currentId !== project.id) {
      loadProject(project.id)
    }
  }, [project.id, storeProject?.id, loadProject])

  const projectData = useMemo<ProjectDetail | ProjectSummary>(() => {
    if (storeProject && storeProject.id === project.id) {
      return storeProject
    }
    return project
  }, [storeProject, project])

  const overviewProject = useMemo(() => {
    const base = projectData as ProjectSummary
    const detail = projectData as Partial<ProjectDetail>

    return {
      id: base.id,
      name: base.name,
      client: base.client,
      location: base.location,
      status: base.status,
      progress: base.progress,
      type: base.type,
      description: base.description,
      budget: base.budget,
      scheduleSummary: base.scheduleSummary,
      // timeline intentionally omitted to avoid type mismatch (ProjectDetail has TimelineEvent[])
      updatedAt: base.updatedAt,
      team: (detail as any)?.team ?? undefined,
    }
  }, [projectData])

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex flex-wrap gap-2">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="technical">Technical Data</TabsTrigger>
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProjectOverview
            project={overviewProject}
            onNavigateToTechnical={() => handleTabChange("technical")}
          />
        </TabsContent>

        <TabsContent value="technical" className="mt-6">
          <TechnicalDataSheet projectId={project.id} />
        </TabsContent>

        <TabsContent value="proposals" className="mt-6">
          <ProposalsTab project={projectData} />
        </TabsContent>

        <TabsContent value="files" className="mt-6">
          <FilesTabEnhanced projectId={project.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
