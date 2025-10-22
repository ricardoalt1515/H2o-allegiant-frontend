"use client"

import React, { useState, useEffect, useMemo } from "react"
import { CheckCircle, AlertTriangle, ArrowRight, Brain, Zap, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  SmartImportEngine,
  type ImportPreview,
  type MappingRule
} from "@/lib/engines/smart-import-engine"
import { useTechnicalDataActions, useTechnicalSections } from "@/lib/stores"
import { toast } from "sonner"

interface SmartImportPreviewProps {
  fileName: string
  fileContent: string | Record<string, any>
  projectId: string
  onImportComplete?: () => void
  onCancel?: () => void
}

export function SmartImportPreview({
  fileName,
  fileContent,
  projectId,
  onImportComplete,
  onCancel
}: SmartImportPreviewProps) {
  const [preview, setPreview] = useState<ImportPreview | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [selectedMappings, setSelectedMappings] = useState<MappingRule[]>([])
  const [conflictChoices, setConflictChoices] = useState<Record<string, "keep_existing" | "use_new" | "merge">>({})
  const [showSummary, setShowSummary] = useState(false)
  const [confirmApply, setConfirmApply] = useState(false)

  const { updateField } = useTechnicalDataActions()
  const sections = useTechnicalSections(projectId)

  const existingData = useMemo(() => {
    const map: Record<string, any> = {}
    sections.forEach(section => {
      section.fields.forEach(field => {
        if (field.value !== undefined && field.value !== null && field.value !== "") {
          map[`${section.id}.${field.id}`] = field.value
        }
      })
    })
    return map
  }, [sections])

  const plannedChanges = useMemo(() => {
    if (!preview) return [] as Array<{
      key: string
      sectionId: string
      fieldId: string
      existingValue: any
      proposedValue: any
      decision: "keep_existing" | "use_new" | "merge"
      finalValue: any
    }>

    return selectedMappings.map(m => {
      const key = `${m.targetSectionId}.${m.targetFieldId}`
      const existingValue = existingData[key]
      const proposedValue = preview.previewData[key]
      const decision = conflictChoices[key] ?? (existingValue !== undefined && existingValue !== proposedValue ? "use_new" : "use_new")
      let finalValue = proposedValue
      if (decision === "merge") {
        const a = typeof existingValue === "number" ? existingValue : Number(existingValue)
        const b = typeof proposedValue === "number" ? proposedValue : Number(proposedValue)
        if (!Number.isNaN(a) && !Number.isNaN(b)) {
          finalValue = Math.round(((a + b) / 2) * 100) / 100
        }
      }
      if (decision === "keep_existing") {
        finalValue = existingValue
      }
      return { key, sectionId: m.targetSectionId, fieldId: m.targetFieldId, existingValue, proposedValue, decision, finalValue }
    })
  }, [preview, selectedMappings, conflictChoices, existingData])

  // Start analysis immediately
  useEffect(() => {
    analyzeFile()
  }, [fileName, fileContent])

  const analyzeFile = async () => {
    setIsAnalyzing(true)

    // Simulate analysis time for better UX
    await new Promise(resolve => setTimeout(resolve, 1500))

    try {
      const analysis = SmartImportEngine.analyzeFile(fileName, fileContent)
      const importPreview = SmartImportEngine.createImportPreview(analysis, existingData)

      setPreview(importPreview)
      setSelectedMappings(importPreview.mappingRules.filter(rule => rule.confidence > 70))
      // Initialize conflict choices by rule key `${section}.${field}` if present
      const initialChoices: Record<string, "keep_existing" | "use_new" | "merge"> = {}
      importPreview.mappingRules.forEach(rule => {
        const key = `${rule.targetSectionId}.${rule.targetFieldId}`
        const conflict = importPreview.conflicts.find(c => c.field === rule.targetFieldId)
        if (conflict) {
          initialChoices[key] = conflict.recommendation
        }
      })
      setConflictChoices(initialChoices)
    } catch (error) {
      console.error("Error analyzing file:", error)
      toast.error("Error analyzing file")
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleApplyImport = async () => {
    if (!preview || selectedMappings.length === 0) return

    setIsImporting(true)

    try {
      // Apply each mapping
      for (const mapping of selectedMappings) {
        const key = `${mapping.targetSectionId}.${mapping.targetFieldId}`
        const proposed = preview.previewData[key]
        if (proposed === undefined) continue

        const choice = conflictChoices[key]
        if (choice === "keep_existing") continue

        let finalValue = proposed
        if (choice === "merge") {
          const existing = existingData[key]
          const a = typeof existing === "number" ? existing : Number(existing)
          const b = typeof proposed === "number" ? proposed : Number(proposed)
          if (!Number.isNaN(a) && !Number.isNaN(b)) {
            finalValue = Math.round(((a + b) / 2) * 100) / 100
          }
        }

        await updateField(
          projectId,
          {
            sectionId: mapping.targetSectionId,
            fieldId: mapping.targetFieldId,
            value: finalValue,
            source: "import",
          }
        )
      }

      toast.success(`${selectedMappings.length} fields imported successfully`)
      onImportComplete?.()
    } catch (error) {
      console.error("Error importing data:", error)
      toast.error("Error importing data")
    } finally {
      setIsImporting(false)
    }
  }

  const toggleMapping = (mapping: MappingRule) => {
    setSelectedMappings(prev => {
      const exists = prev.find(m => m.sourceField === mapping.sourceField)
      if (exists) {
        return prev.filter(m => m.sourceField !== mapping.sourceField)
      } else {
        return [...prev, mapping]
      }
    })
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 85) return "text-green-600 dark:text-green-400"
    if (confidence >= 70) return "text-blue-600 dark:text-blue-400"
    if (confidence >= 50) return "text-amber-600 dark:text-amber-400"
    return "text-red-600 dark:text-red-400"
  }

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 85) return "Muy Alta"
    if (confidence >= 70) return "Alta"
    if (confidence >= 50) return "Media"
    return "Baja"
  }

  if (isAnalyzing) {
    return (
      <Card className="aqua-panel">
        <CardContent className="p-8">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary animate-pulse" />
              <Zap className="h-6 w-6 text-yellow-500 animate-bounce" />
            </div>
            <h3 className="text-lg font-semibold">Analyzing File with AI</h3>
            <p className="text-sm text-muted-foreground text-center">
              Detecting technical fields and validating engineering parameters...
            </p>
            <Progress value={undefined} className="w-64" />
            <div className="space-y-1 text-xs text-muted-foreground text-center">
              <p>• Identifying water parameters</p>
              <p>• Validating technical ranges</p>
              <p>• Suggesting optimal mappings</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!preview) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Could not analyze file. Verify format and try again.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      {/* Analysis Summary */}
      <Card className="aqua-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-primary" />
            Intelligent Analysis Complete
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">
                {preview.analysis.detectedFields.length}
              </div>
              <div className="text-sm text-muted-foreground">Detected fields</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gradient">
                {preview.mappingRules.length}
              </div>
              <div className="text-sm text-muted-foreground">Suggested mappings</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${getConfidenceColor(preview.analysis.confidence)}`}>
                {preview.analysis.confidence}%
              </div>
              <div className="text-sm text-muted-foreground">Average confidence</div>
            </div>
          </div>

          {/* Suggestions */}
          {preview.analysis.suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">System suggestions:</h4>
              <ul className="space-y-1">
                {preview.analysis.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

      {/* Final Summary */}
      {showSummary && (
        <Card className="aqua-panel">
          <CardHeader>
            <CardTitle>Import Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="text-muted-foreground">Selected fields</div>
                <div className="text-xl font-semibold">{selectedMappings.length}</div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="text-muted-foreground">Conflicts</div>
                <div className="text-xl font-semibold">{preview.conflicts.length}</div>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <div className="text-muted-foreground">Decisions made</div>
                <div className="text-xl font-semibold">{Object.keys(conflictChoices).length}</div>
              </div>
            </div>

            <div>
              <div className="text-muted-foreground mb-2">Changes to apply (preview)</div>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Target</TableHead>
                      <TableHead>Current</TableHead>
                      <TableHead>New</TableHead>
                      <TableHead>Decision</TableHead>
                      <TableHead>Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {plannedChanges.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-6">No changes selected</TableCell>
                      </TableRow>
                    ) : (
                      plannedChanges.map((c) => (
                        <TableRow key={c.key}>
                          <TableCell className="font-medium">{c.sectionId}.{c.fieldId}</TableCell>
                          <TableCell className="text-muted-foreground">{String(c.existingValue ?? "—")}</TableCell>
                          <TableCell>{String(c.proposedValue ?? "—")}</TableCell>
                          <TableCell className="capitalize">{c.decision.replace("_", " ")}</TableCell>
                          <TableCell className="font-medium">{String(c.finalValue ?? "—")}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input id="confirm-apply" type="checkbox" checked={confirmApply} onChange={e => setConfirmApply(e.target.checked)} />
              <label htmlFor="confirm-apply" className="text-sm text-muted-foreground">I confirm applying the listed changes</label>
            </div>
          </CardContent>
        </Card>
      )}

          {/* Warnings */}
          {preview.analysis.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="space-y-1">
                  {preview.analysis.warnings.map((warning, index) => (
                    <div key={index}>• {warning}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Mapping Rules Table */}
      <Card className="aqua-panel">
        <CardHeader>
          <CardTitle>Detected Fields Mapping</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the fields you want to import to the technical sheet
          </p>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Import</TableHead>
                  <TableHead>Original Field</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Target Field</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Transformation</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {preview.mappingRules.map((mapping, index) => {
                  const sourceField = preview.analysis.detectedFields.find(
                    f => f.originalName === mapping.sourceField
                  )
                  const isSelected = selectedMappings.some(
                    m => m.sourceField === mapping.sourceField
                  )

                  return (
                    <TableRow key={index}>
                      <TableCell>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleMapping(mapping)}
                          className="rounded border-gray-300"
                        />
                      </TableCell>
                      <TableCell className="font-medium">
                        {mapping.sourceField}
                        {sourceField?.context && (
                          <div className="text-xs text-muted-foreground">
                            {sourceField.context}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span>{sourceField?.value}</span>
                          {sourceField?.unit && (
                            <Badge variant="outline" className="text-xs">
                              {sourceField.unit}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {mapping.targetSectionId} → {mapping.targetFieldId}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={getConfidenceColor(mapping.confidence)}
                        >
                          {getConfidenceLabel(mapping.confidence)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {mapping.transformation && (
                          <Badge variant="secondary" className="text-xs">
                            {mapping.transformation === "unit_conversion" && "Conversión unidades"}
                            {mapping.transformation === "format_change" && "Cambio formato"}
                            {mapping.transformation === "calculation" && "Cálculo"}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {preview.mappingRules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
              <p>No valid technical fields detected for mapping.</p>
              <p className="text-sm">Verify that the file contains water treatment parameters.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conflicts */}
      {preview.conflicts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <AlertTriangle className="h-5 w-5" />
              Detected Conflicts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {preview.conflicts.map((conflict, index) => {
                const key = Object.keys(preview.previewData).find(k => k.endsWith(`.${conflict.field}`)) || conflict.field
                const choice = conflictChoices[key] ?? conflict.recommendation
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-white/60 dark:bg-amber-950/40 rounded-lg gap-3">
                    <div className="min-w-0">
                      <p className="font-medium text-amber-900 dark:text-amber-100 truncate">
                        {conflict.field}
                      </p>
                      <p className="text-sm text-amber-700 dark:text-amber-300">
                        Existing: {conflict.existingValue} → New: {conflict.newValue}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant={choice === "use_new" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setConflictChoices(prev => ({ ...prev, [key]: "use_new" }))}
                      >
                        Use New
                      </Button>
                      <Button
                        variant={choice === "keep_existing" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setConflictChoices(prev => ({ ...prev, [key]: "keep_existing" }))}
                      >
                        Keep
                      </Button>
                      <Button
                        variant={choice === "merge" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setConflictChoices(prev => ({ ...prev, [key]: "merge" }))}
                      >
                        Merge
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>

        <div className="flex items-center gap-3">
          <div className="text-sm text-muted-foreground">
            {selectedMappings.length} of {preview.mappingRules.length} fields selected
          </div>
          {!showSummary ? (
            <Button
              onClick={() => setShowSummary(true)}
              disabled={selectedMappings.length === 0}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            >
              <ArrowRight className="mr-2 h-4 w-4" />
              Review and Confirm
            </Button>
          ) : (
            <Button
              onClick={handleApplyImport}
              disabled={selectedMappings.length === 0 || isImporting || !confirmApply}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            >
              {isImporting ? (
                <>
                  <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Importando...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Apply Import ({selectedMappings.length})
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}