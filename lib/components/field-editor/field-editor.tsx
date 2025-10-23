"use client"

import React, { useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { TagInput } from "@/components/ui/tag-input"
import { Combobox } from "@/components/ui/combobox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Edit3, MessageSquare, Info, X, Save, AlertCircle, CheckCircle2, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFieldEditor } from "@/lib/hooks/use-field-editor"
import { useClickOutside } from "@/lib/hooks/use-click-outside"
import { TableField, DataSource } from "@/lib/types/technical-data"

/**
 * ✅ Componente compartido para editar campos técnicos
 * Soporta: text, number, select, combobox, unit, tags, multiline
 * Modos: inline (dynamic-section), table (engineering-table), dialog (futuro)
 */

interface FieldEditorProps {
  field: TableField
  sectionId: string
  mode?: 'inline' | 'table'
  onSave: (sectionId: string, fieldId: string, value: string | number | string[], unit?: string, notes?: string) => void
  onRemove?: (sectionId: string, fieldId: string) => void | undefined
  showRemove?: boolean
  showLabel?: boolean
  showNotes?: boolean
  autoSave?: boolean
  className?: string
}

const sourceConfig: Record<DataSource, {
  label: string
  variant: "default" | "secondary" | "destructive" | "outline"
  icon: React.ComponentType<{ className?: string }>
  color: string
}> = {
  manual: {
    label: "Manual",
    variant: "outline",
    icon: Edit3,
    color: "text-blue-600"
  },
  imported: {
    label: "Importado",
    variant: "secondary",
    icon: ({ className }) => <span className={className}>📁</span>,
    color: "text-green-600"
  },
  ai: {
    label: "IA",
    variant: "default",
    icon: ({ className }) => <span className={className}>🤖</span>,
    color: "text-purple-600"
  }
}

export function FieldEditor({
  field,
  sectionId,
  mode = 'inline',
  onSave,
  onRemove,
  showRemove = false,
  showLabel = true,
  showNotes = true,
  autoSave = true,
  className
}: FieldEditorProps) {
  const { state, validationStatus, actions } = useFieldEditor({
    field,
    autoSave,
    onSave: (value, unit, notes) => onSave(sectionId, field.id, value, unit, notes)
  })

  const sourceInfo = sourceConfig[field.source]

  // ✅ Click outside to save and close editing mode
  const editorRef = useRef<HTMLDivElement>(null)
  useClickOutside(
    editorRef as React.RefObject<HTMLElement>,
    () => {
      if (state.mode === 'editing' && autoSave) {
        actions.save()
      }
    },
    state.mode === 'editing'
  )

  // ✅ Keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !field.multiline) {
      e.preventDefault()
      actions.save()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      actions.cancel()
    }
  }

  // ✅ Renderizar input según tipo de campo
  const renderInput = () => {
    switch (field.type) {
      case "select":
        return (
          <Select
            value={state.value.toString()}
            onValueChange={(v) => actions.updateValue(v)}
          >
            <SelectTrigger className={mode === 'table' ? "h-8" : "h-8"}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map(option => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case "combobox":
        return (
          <Combobox
            value={state.value.toString()}
            onChange={(v) => actions.updateValue(v)}
            options={field.options || []}
            placeholder={field.placeholder || "Select or type..."}
            className={mode === 'table' ? "h-8" : "h-8"}
          />
        )

      case "unit":
        return (
          <div className="flex gap-1">
            <Input
              value={state.value}
              onChange={(e) => actions.updateValue(e.target.value)}
              className={mode === 'table' ? "h-8 flex-1" : "h-8 flex-1"}
              type="number"
              step="any"
              onKeyDown={handleKeyDown}
            />
            {field.units && field.units.length > 0 && (
              <Select
                value={state.unit}
                onValueChange={(v) => actions.updateUnit(v)}
              >
                <SelectTrigger className="h-8 w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {field.units.map(unit => (
                    <SelectItem key={unit} value={unit}>
                      {unit}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )

      case "tags":
        return (
          <TagInput
            tags={Array.isArray(state.value) ? state.value : []}
            onChange={(tags) => actions.updateValue(tags)}
            placeholder={field.placeholder || "Seleccione opciones..."}
            suggestions={field.options || []}
            className="min-h-[32px]"
          />
        )

      default:
        return field.multiline ? (
          <Textarea
            value={state.value.toString()}
            onChange={(e) => actions.updateValue(e.target.value)}
            rows={6}
            placeholder={field.placeholder}
            className="resize-none"
          />
        ) : (
          <Input
            value={state.value}
            onChange={(e) => actions.updateValue(e.target.value)}
            className={mode === 'table' ? "h-8" : "h-8"}
            type={field.type === "number" ? "number" : "text"}
            step={field.type === "number" ? "any" : undefined}
            placeholder={field.placeholder}
            onKeyDown={handleKeyDown}
          />
        )
    }
  }

  // ✅ Display value para modo viewing
  const displayValue = React.useMemo(() => {
    if (field.type === "unit" && field.unit) {
      return field.value ? `${field.value} ${field.unit}` : ""
    }
    if (field.type === "tags" && Array.isArray(field.value)) {
      return field.value.length > 0 ? field.value.join(", ") : "Sin seleccionar"
    }
    return field.value || field.value === 0 ? field.value.toString() : ""
  }, [field.value, field.type, field.unit])

  // ✅ MODE: TABLE - Vista compacta para tabla
  if (mode === 'table') {
    if (state.mode === 'editing') {
      return (
        <div className={cn("flex items-center gap-2 min-w-0", className)}>
          {renderInput()}
          <div className="flex gap-1">
            <Button type="button" size="sm" variant="ghost" onClick={() => actions.save()} className="h-8 w-8 p-0">
              <Check className="h-4 w-4 text-green-600" />
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => actions.cancel()} className="h-8 w-8 p-0">
              <X className="h-4 w-4 text-red-600" />
            </Button>
          </div>
        </div>
      )
    }

    return (
      <div
        className={cn(
          "flex items-center gap-2 cursor-pointer hover:bg-muted/50 p-1 rounded min-h-8",
          className
        )}
        onClick={() => actions.startEdit()}
      >
        <span className="flex-1 text-sm truncate">
          {displayValue}
        </span>
        {!displayValue && (
          <span className="text-muted-foreground text-xs italic">Click to edit</span>
        )}
      </div>
    )
  }

  // ✅ MODE: INLINE - Vista completa para dynamic-section
  return (
    <div ref={editorRef} className={cn("group space-y-2", className)}>
      {/* Header */}
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Label className="text-sm font-medium">
              {field.label}
              {field.required && <span className="text-red-500">*</span>}
            </Label>
            {field.description && (
              <Button type="button" variant="ghost" size="sm" className="h-4 w-4 p-0" title={field.description}>
                <Info className="h-3 w-3 text-muted-foreground" />
              </Button>
            )}
            {showNotes && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-4 w-4 p-0"
                onClick={() => actions.startNotes()}
                title={field.notes ? "Ver/editar notas" : "Agregar notas"}
              >
                <MessageSquare
                  className={cn(
                    "h-3 w-3",
                    field.notes ? "text-primary fill-primary/20" : "text-muted-foreground"
                  )}
                />
              </Button>
            )}
          </div>
          {showRemove && onRemove && (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => actions.startDelete()}
              >
                <X className="h-3 w-3" />
              </Button>
              <AlertDialog open={state.mode === 'deleting'} onOpenChange={(open) => !open && actions.cancel()}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar campo?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Estás a punto de eliminar el campo "<strong>{field.label}</strong>".
                      Esta acción no se puede deshacer.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onRemove?.(sectionId, field.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      )}

      {/* Editing Mode */}
      {state.mode === 'editing' ? (
        <div
          className={cn(
            "space-y-2 transition-all",
            validationStatus === 'invalid' && "ring-2 ring-destructive rounded-md p-2 animate-pulse",
            // ✅ FIX: Solo mostrar borde verde si NO hay autoSave (manual mode)
            validationStatus === 'valid' && !autoSave && "ring-1 ring-green-500 rounded-md p-2"
          )}
          onKeyDown={handleKeyDown}
        >
          {renderInput()}
          {/* Validation feedback */}
          {state.error && (
            <div className="flex items-center gap-1.5 text-xs text-destructive bg-destructive/10 px-2 py-1.5 rounded">
              <AlertCircle className="h-3 w-3 flex-shrink-0" />
              <span className="font-medium">{state.error}</span>
            </div>
          )}
          {/* ✅ FIX: Solo mostrar "Válido" si NO hay autoSave */}
          {validationStatus === 'valid' && !state.error && !autoSave && (
            <div className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-3 w-3" />
              <span>Válido</span>
            </div>
          )}
          {!autoSave && (
            <div className="flex gap-1 justify-end">
              <Button type="button" size="sm" variant="ghost" onClick={() => actions.cancel()} title="Esc para cancelar">
                <X className="h-3 w-3" />
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => actions.save()}
                title="Enter para guardar"
                disabled={validationStatus === 'invalid'}
              >
                <Edit3 className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Viewing Mode */
        <div
          className={cn(
            "px-3 py-2 rounded hover:bg-muted/50 cursor-pointer transition-colors",
            field.multiline ? "min-h-[120px]" : "min-h-8 flex items-center justify-between gap-2",
            field.required && !field.value && field.value !== 0 && "border-2 border-red-300 bg-red-50/50 dark:border-red-800 dark:bg-red-950/20"
          )}
          onClick={() => actions.startEdit()}
          title="Click to edit"
        >
          {field.multiline ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant={sourceInfo.variant} className="h-5 text-xs px-1.5">
                  <sourceInfo.icon className="h-3 w-3 mr-1" />
                  {sourceInfo.label}
                </Badge>
                <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {displayValue ? (
                <p className="text-sm whitespace-pre-wrap text-foreground leading-relaxed">
                  {displayValue}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  {field.required && !field.value && field.value !== 0
                    ? "⚠️ Required field - Click to edit"
                    : field.placeholder || "Click to add..."}
                </p>
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 flex-1">
                <span className={cn(
                  "text-sm",
                  !field.value && field.value !== 0 && (field.required ? "text-red-600 dark:text-red-400 font-medium" : "text-muted-foreground italic")
                )}>
                  {displayValue || (field.required && !field.value && field.value !== 0 ? "⚠️ Required field - Click to edit" : "Click to edit")}
                </span>
                <Badge variant={sourceInfo.variant} className="h-5 text-xs px-1.5">
                  <sourceInfo.icon className="h-3 w-3 mr-1" />
                  {sourceInfo.label}
                </Badge>
              </div>
              <Edit3 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </>
          )}
        </div>
      )}

      {/* Notes Editor */}
      {showNotes && state.mode === 'notes' && (
        <div className="space-y-2 pt-2 border-t">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium">Notas del campo</Label>
            <span className="text-xs text-muted-foreground">Contexto, supuestos, fuente</span>
          </div>
          <Textarea
            value={state.notes}
            onChange={(e) => actions.updateNotes(e.target.value)}
            placeholder="Example: The client mentioned that this value may vary by ±20% during peak season."
            rows={3}
            className="text-xs"
          />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => actions.cancel()}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={() => actions.saveNotes()}
              disabled={state.notes === field.notes}
            >
              <Save className="h-3 w-3 mr-1" />
              Guardar
            </Button>
          </div>
        </div>
      )}

      {/* Notes Preview */}
      {showNotes && field.notes && state.mode === 'viewing' && (
        <div className="flex items-start gap-2 px-3 py-2 bg-muted/50 rounded-md text-xs">
          <MessageSquare className="h-3 w-3 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-muted-foreground line-clamp-2">{field.notes}</p>
        </div>
      )}
    </div>
  )
}
