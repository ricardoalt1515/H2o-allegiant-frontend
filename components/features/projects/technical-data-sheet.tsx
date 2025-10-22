"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  Gauge,
  Layers,
  RefreshCcw,
  Sparkles,
  UploadCloud,
  Workflow,
  Table,
  BarChart3,
  History,
} from "lucide-react"

import {
  useTechnicalDataStore,
  useTechnicalSections,
  useTechnicalVersions,
  useTechnicalDataActions,
  useProjects,
  useEnsureProjectsLoaded,
} from "@/lib/stores"
import {
  overallCompletion,
  sectionCompletion,
  sourceBreakdown,
} from "@/lib/technical-sheet-data"
import type { DataSource, TableField, TableSection } from "@/lib/types/technical-data"
import { ResizableDataLayout, EngineeringDataTable } from "@/components/features/technical-data"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import { TECHNICAL_TEMPLATES } from "@/lib/templates/technical-templates"
import type { VersionSource } from "@/lib/project-types"
import { TechnicalFormSkeleton } from "@/components/ui/loading-states"

interface TechnicalDataSheetProps {
  projectId: string
}

export function TechnicalDataSheet({ projectId }: TechnicalDataSheetProps) {
  const router = useRouter()
  const pathname = usePathname()
  const sections = useTechnicalSections(projectId)
  const versions = useTechnicalVersions(projectId)
  const loading = useTechnicalDataStore((state) => state.loading)
  const error = useTechnicalDataStore((state) => state.error)

  const {
    setActiveProject,
    loadTechnicalData,
    updateField,
    addCustomSection,
    removeSection,
    addField,
    removeField,
    duplicateField,
    updateFieldLabel,
    resetToInitial,
    applyTemplate,
    copyFromProject,
  } = useTechnicalDataActions()

  const [activeTab, setActiveTab] = useState("capture")
  const [focusSectionId, setFocusSectionId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [copyOpen, setCopyOpen] = useState(false)

  // Load projects for copy-from dialog
  const projects = useProjects()
  useEnsureProjectsLoaded()

  useEffect(() => {
    setActiveProject(projectId)
    loadTechnicalData(projectId)
  }, [projectId, setActiveProject, loadTechnicalData])

  const completion = useMemo(() => overallCompletion(sections), [sections])
  const perSectionStats = useMemo(
    () => sections.map((section) => ({ section, stats: sectionCompletion(section) })),
    [sections]
  )
  const sourceStats = useMemo(() => sourceBreakdown(sections), [sections])

  const readinessThreshold = 70
  const prioritizedGaps = useMemo(
    () =>
      perSectionStats
        .filter(({ stats }) => stats.total > 0 && stats.completed < stats.total)
        .sort((a, b) => a.stats.percentage - b.stats.percentage)
        .slice(0, 3),
    [perSectionStats]
  )

  const mapDataSourceToVersionSource = (source: DataSource): VersionSource => {
    switch (source) {
      case "imported":
        return "import"
      case "ai":
        return "ai"
      case "manual":
      default:
        return "manual"
    }
  }

  const handleFieldChange = useCallback(
    (sectionId: string, fieldId: string, value: any, unit?: string, source?: DataSource) => {
      const payload: { sectionId: string; fieldId: string; value: any; unit?: string; source?: VersionSource } = {
        sectionId,
        fieldId,
        value,
        source: mapDataSourceToVersionSource(source ?? "manual"),
      }
      if (unit !== undefined) {
        payload.unit = unit
      }

      // Show saving indicator
      setIsSaving(true)
      updateField(projectId, payload)

      // Simulate save delay and show "saved" state
      setTimeout(() => {
        setIsSaving(false)
        setLastSaved(new Date())
      }, 800)
    },
    [projectId, updateField]
  )

  const handleAddSection = useCallback(
    (sectionInput: Omit<TableSection, "id">) => {
      const section: TableSection = {
        ...sectionInput,
        id: crypto.randomUUID(),
        fields: sectionInput.fields ?? [],
      }

      addCustomSection(projectId, section)
    },
    [addCustomSection, projectId]
  )

  const handleRemoveSection = useCallback(
    (sectionId: string) => {
      removeSection(projectId, sectionId)
    },
    [projectId, removeSection]
  )

  const handleAddField = useCallback(
    (sectionId: string, fieldInput: Omit<TableField, "id">) => {
      const field: TableField = {
        ...fieldInput,
        id: crypto.randomUUID(),
        source: fieldInput.source ?? "manual",
      }

      addField(projectId, sectionId, field)
    },
    [addField, projectId]
  )

  const handleRemoveField = useCallback(
    (sectionId: string, fieldId: string) => {
      removeField(projectId, sectionId, fieldId)
    },
    [projectId, removeField]
  )

  const handleReset = useCallback(() => {
    resetToInitial(projectId)
  }, [projectId, resetToInitial])

  if (loading) {
    return <TechnicalFormSkeleton />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              Project Technical Data Sheet
            </CardTitle>
            <CardDescription>
              Capture, version and control all technical information required for project phases.
            </CardDescription>
            {error && (
              <Alert variant="destructive" className="mt-2">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Autosave indicator */}
            {isSaving ? (
              <Badge variant="outline" className="text-xs bg-amber-50 border-amber-200 text-amber-700">
                <RefreshCcw className="mr-1 h-3 w-3 animate-spin" />
                Saving...
              </Badge>
            ) : lastSaved ? (
              <Badge variant="outline" className="text-xs bg-green-50 border-green-200 text-green-700">
                <CheckCircle2 className="mr-1 h-3 w-3" />
                Saved {new Date().getTime() - lastSaved.getTime() < 3000 ? 'now' : 'a moment ago'}
              </Badge>
            ) : null}

            <Badge variant="outline" className="text-xs">
              {completion.completed} / {completion.total} fields
            </Badge>
            <Badge variant={completion.percentage >= 80 ? "default" : "secondary"} className="text-xs">
              {completion.percentage}% complete
            </Badge>

            <Separator orientation="vertical" className="h-6" />

            {/* Quick Actions */}
            <Button variant="outline" size="sm" onClick={() => setTemplateOpen(true)}>
              <Layers className="mr-2 h-4 w-4" />
              Use Template
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCopyOpen(true)}>
              <History className="mr-2 h-4 w-4" />
              Copy from Project
            </Button>
            <Button variant="outline" size="sm" onClick={handleReset} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              Reset Data
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Templates Dialog */}
      <Dialog open={templateOpen} onOpenChange={setTemplateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Use Template</DialogTitle>
            <DialogDescription>Apply a template to accelerate initial data capture. You can merge with your data or replace it.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            {TECHNICAL_TEMPLATES.map((tpl) => (
              <div key={tpl.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{tpl.name}</p>
                  {tpl.description && (
                    <p className="text-xs text-muted-foreground">{tpl.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={async () => {
                    await applyTemplate(projectId, tpl.sections, 'merge', { label: `Template: ${tpl.name}` })
                    setTemplateOpen(false)
                  }}>Merge</Button>
                  <Button size="sm" onClick={async () => {
                    await applyTemplate(projectId, tpl.sections, 'replace', { label: `Template: ${tpl.name}` })
                    setTemplateOpen(false)
                  }}>Replace</Button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Copy From Project Dialog */}
      <Dialog open={copyOpen} onOpenChange={setCopyOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Copy from Another Project</DialogTitle>
            <DialogDescription>Select a project to copy its technical data sheet. You can merge or replace your data.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[320px] overflow-y-auto space-y-2">
            {projects.filter(p => p.id !== projectId).map(p => (
              <div key={p.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <p className="font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">{p.client} · {p.sector}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={async () => {
                    await copyFromProject(projectId, p.id, 'merge')
                    setCopyOpen(false)
                  }}>Merge</Button>
                  <Button size="sm" onClick={async () => {
                    await copyFromProject(projectId, p.id, 'replace')
                    setCopyOpen(false)
                  }}>Replace</Button>
                </div>
              </div>
            ))}
            {projects.filter(p => p.id !== projectId).length === 0 && (
              <p className="text-sm text-muted-foreground">No projects available to copy from.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {completion.percentage < readinessThreshold && (
        <Alert className="alert-warning-card">
          <Sparkles className="h-4 w-4" />
          <AlertDescription className="alert-description">
            <span className="font-semibold">Current progress: {completion.percentage}% complete.</span> At least {readinessThreshold}% is required to enable the intelligent generator.
            {prioritizedGaps.length > 0 && (
              <div className="mt-2 space-y-2 text-sm">
                <p className="font-medium">Suggestion: complete these sections first:</p>
                <ul className="space-y-1">
                  {prioritizedGaps.map(({ section, stats }) => (
                    <li key={section.id} className="flex items-center justify-between gap-2">
                      <span>
                        {section.title} · {stats.completed}/{stats.total} fields complete
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setActiveTab("capture")
                          setFocusSectionId(section.id)
                        }}
                      >
                        Go to Section
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </AlertDescription>
        </Alert>
      )}

      {completion.percentage >= readinessThreshold && (
        <Alert className="border-green-200 bg-green-50/80 dark:bg-green-950/20 dark:border-green-800/30">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertDescription>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-2">
                <p className="font-medium text-green-900 dark:text-green-100">
                  Technical data ready! ({completion.percentage}% complete)
                </p>
                <p className="text-sm text-green-700 dark:text-green-300">
                  Your technical data sheet has enough information to generate a professional proposal.
                  {completion.percentage < 100 && " You can generate now or complete more fields for greater accuracy."}
                </p>
              </div>
              <Button
                onClick={() => {
                  // Navigate to proposals tab using router
                  router.replace(`${pathname}?tab=proposals`, { scroll: false })
                }}
                className="bg-green-600 hover:bg-green-700 text-white shrink-0"
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Proposal
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="capture" className="flex items-center gap-2">
            <Layers className="h-4 w-4" />
            Capture
          </TabsTrigger>
          <TabsTrigger value="engineering" className="flex items-center gap-2">
            <Table className="h-4 w-4" />
            Table View
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Summary
          </TabsTrigger>
          <TabsTrigger value="versions" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Versions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="capture" className="mt-6">
          <ResizableDataLayout
            sections={sections}
            onFieldChange={handleFieldChange}
            projectId={projectId}
            onAddSection={handleAddSection}
            onRemoveSection={handleRemoveSection}
            onAddField={(sectionId, field) => handleAddField(sectionId, field)}
            onRemoveField={handleRemoveField}
            autoSave
            focusSectionId={focusSectionId}
            onFocusSectionFromSummary={(sectionId) => {
              setActiveTab('capture')
              setFocusSectionId(sectionId)
            }}
          />
        </TabsContent>

        <TabsContent value="engineering" className="mt-6">
          <EngineeringDataTable
            sections={sections}
            onFieldChange={handleFieldChange}
          />
        </TabsContent>

        <TabsContent value="summary" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-primary" />
                Progress by Section
              </CardTitle>
              <CardDescription>
                View the completion level and fields with information in each section of the data sheet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {perSectionStats.map(({ section, stats }) => (
                  <div key={section.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{section.title}</span>
                      <Badge variant="outline" className="text-xs">
                        {stats.completed} / {stats.total}
                      </Badge>
                    </div>
                    <Progress value={stats.percentage} className="h-2" />
                  </div>
                ))}
                {sections.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    You haven't configured sections for this project yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Workflow className="h-5 w-5 text-primary" />
                Data Source
              </CardTitle>
              <CardDescription>
                Track the traceability of fields captured manually, imported, or AI-assisted.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                {(["manual", "imported", "ai"] as const).map((source) => (
                  <Card key={source} className="border-dashed">
                    <CardContent className="flex flex-col gap-2 p-4">
                      <div className="flex items-center gap-2 text-sm font-medium capitalize">
                        {source === "manual" && <CheckCircle2 className="h-4 w-4 text-blue-600" />}
                        {source === "imported" && <UploadCloud className="h-4 w-4 text-green-600" />}
                        {source === "ai" && <Sparkles className="h-4 w-4 text-purple-600" />}
                        {source}
                      </div>
                      <div className="text-2xl font-semibold">
                        {sourceStats[source] ?? 0}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {source === "manual" && "Fields entered directly by your team."}
                        {source === "imported" && "Data from files or integrations."}
                        {source === "ai" && "Suggestions generated by AI agents."}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="versions" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-primary" />
                History and Versions
              </CardTitle>
              <CardDescription>
                Review the evolution of the technical data sheet and collaborate with your team with full traceability.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="max-h-[420px] pr-3">
                <div className="space-y-4">
                  {versions.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No versions have been recorded for this technical data sheet yet.
                    </p>
                  )}

                  {versions.map((version) => (
                    <Card key={version.id} className="border-muted/60">
                      <CardContent className="flex flex-col gap-3 p-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <div>
                            <p className="font-medium">{version.versionLabel}</p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(version.createdAt).toLocaleString("en-US")}
                              {version.source === "import" && " · Import"}
                              {version.source === "ai" && " · AI"}
                              {version.source === "rollback" && " · Rollback"}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {version.changes.length} changes
                          </Badge>
                        </div>
                        {version.notes && (
                          <p className="text-xs text-muted-foreground">{version.notes}</p>
                        )}
                        <div className="grid gap-2 text-xs">
                          {version.changes.slice(0, 4).map((change) => (
                            <div key={change.id} className="flex items-start justify-between gap-3 rounded-md bg-muted/50 p-2">
                              <div>
                                <p className="font-medium">{change.label}</p>
                                <p className="text-muted-foreground">
                                  {change.oldValue ?? "–"} → {change.newValue ?? "–"}
                                </p>
                              </div>
                              <Badge variant="outline" className="text-xs capitalize">
                                {change.changeType}
                              </Badge>
                            </div>
                          ))}
                          {version.changes.length > 4 && (
                            <p className="text-[11px] text-muted-foreground">
                              +{version.changes.length - 4} additional changes
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
