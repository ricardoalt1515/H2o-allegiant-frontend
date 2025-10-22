"use client"

import { FlexibleDataCapture } from "./flexible-data-capture"
import { TechnicalDataSummary } from "./technical-data-summary"
import type { TableSection } from "@/lib/types/technical-data"
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable"
import { Card } from "@/components/ui/card"

interface ResizableDataLayoutProps {
  sections: TableSection[]
  onFieldChange: (
    sectionId: string,
    fieldId: string,
    value: any,
    unit?: string,
    source?: "manual" | "imported" | "ai"
  ) => void
  projectId?: string | null
  onAddSection?: (section: Omit<TableSection, "id">) => void
  onRemoveSection?: (sectionId: string) => void
  onAddField?: (sectionId: string, field: any) => void
  onRemoveField?: (sectionId: string, fieldId: string) => void
  onSave?: () => void
  autoSave?: boolean
  focusSectionId?: string | null
  onFocusSectionFromSummary?: (sectionId: string) => void
  onFocusFieldFromSummary?: (sectionId: string, fieldId: string) => void
  onUpdateSectionNotes?: (sectionId: string, notes: string) => void
}

export function ResizableDataLayout({
  sections,
  onFieldChange,
  projectId,
  onAddSection,
  onRemoveSection,
  onAddField,
  onRemoveField,
  onSave,
  autoSave = true,
  focusSectionId,
  onFocusSectionFromSummary,
  onFocusFieldFromSummary,
  onUpdateSectionNotes,
}: ResizableDataLayoutProps) {
  return (
    <Card className="h-full overflow-hidden rounded-3xl border-none bg-card/80 shadow-sm">
      <ResizablePanelGroup direction="horizontal" className="h-full">
        <ResizablePanel defaultSize={70} minSize={50} className="min-w-[360px]">
          <FlexibleDataCapture
            sections={sections}
            onFieldChange={onFieldChange}
            {...(projectId !== undefined ? { projectId } : {})}
            {...(onAddSection ? { onAddSection } : {})}
            {...(onRemoveSection ? { onRemoveSection } : {})}
            {...(onAddField ? { onAddField } : {})}
            {...(onRemoveField ? { onRemoveField } : {})}
            {...(onSave ? { onSave } : {})}
            autoSave={autoSave}
            className="h-full overflow-y-auto px-6 py-5"
            showConfiguration
            focusSectionId={focusSectionId ?? null}
            {...(onUpdateSectionNotes ? { onUpdateSectionNotes } : {})}
          />
        </ResizablePanel>
        <ResizableHandle withHandle className="bg-border/60" />
        <ResizablePanel defaultSize={30} minSize={28} className="hidden min-w-[280px] lg:block">
          <div className="h-full overflow-y-auto px-5 py-5 surface-muted">
            <TechnicalDataSummary
              sections={sections}
              {...(onFocusSectionFromSummary ? { onFocusSection: onFocusSectionFromSummary } : {})}
              {...(onFocusFieldFromSummary ? { onFocusField: onFocusFieldFromSummary } : {})}
            />
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </Card>
  )
}