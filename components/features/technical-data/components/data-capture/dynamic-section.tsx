"use client"

import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { TagInput } from "@/components/ui/tag-input"
import { ChevronDown, ChevronRight, Plus, X, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { TableField, TableSection, FieldType } from "@/lib/types/technical-data"
import { ALL_COMMON_UNITS } from "@/lib/constants"
import { FieldEditor } from "@/lib/components/field-editor"

interface DynamicSectionProps {
  section: TableSection
  onFieldChange: (sectionId: string, fieldId: string, value: string | number | string[], unit?: string, notes?: string) => void
  onAddField: (sectionId: string, field: Omit<TableField, "id">) => void
  onRemoveField: (sectionId: string, fieldId: string) => void
  onRemoveSection?: (sectionId: string) => void
  isCollapsible?: boolean
  defaultOpen?: boolean
  showAddField?: boolean
  showRemoveSection?: boolean
}

// ✅ REFACTOR: sourceConfig eliminado - ahora manejado por FieldEditor
// ✅ REFACTOR: EditableCell migrado a usar componente compartido FieldEditor
interface EditableCellProps {
  field: TableField
  sectionId: string
  onFieldChange: (sectionId: string, fieldId: string, value: string | number | string[], unit?: string, notes?: string) => void
  onRemoveField?: (sectionId: string, fieldId: string) => void
  showRemove?: boolean
}

function EditableCell({ field, sectionId, onFieldChange, onRemoveField, showRemove }: EditableCellProps) {
  return (
    <FieldEditor
      field={field}
      sectionId={sectionId}
      mode="inline"
      onSave={onFieldChange}
      {...(onRemoveField ? { onRemove: onRemoveField } : {})}
      {...(showRemove !== undefined ? { showRemove } : {})}
      showLabel
      showNotes
      autoSave
    />
  )
}

interface AddFieldDialogProps {
  onAddField: (field: Omit<TableField, "id">) => void
  trigger: React.ReactNode
}

function AddFieldDialog({ onAddField, trigger }: AddFieldDialogProps) {
  const [open, setOpen] = useState(false)
  const [label, setLabel] = useState("")
  const [type, setType] = useState<FieldType>("text")
  const [units, setUnits] = useState<string[]>([])
  const [selectOptions, setSelectOptions] = useState<string[]>([])
  const [description, setDescription] = useState("")
  const [required, setRequired] = useState(false)

  const handleSubmit = () => {
    if (!label.trim()) return

    // Validate based on field type
    if (type === "unit" && units.length === 0) {
      return // Could show toast notification
    }
    if (type === "select" && selectOptions.length === 0) {
      return // Could show toast notification
    }

    const field: Omit<TableField, "id"> = {
      label: label.trim(),
      value: "",
      type,
      source: "manual",
      required,
      ...(description && { description }),
      // For unit type: add first unit as default and all units for conversion
      ...(type === "unit" && units.length > 0 && {
        unit: units[0],
        units: units
      }),
      // For select type: add options and first option as default value
      ...(type === "select" && selectOptions.length > 0 && {
        options: selectOptions,
        value: selectOptions[0]
      })
    }

    onAddField(field)

    // Reset form
    setLabel("")
    setType("text")
    setUnits([])
    setSelectOptions([])
    setDescription("")
    setRequired(false)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Add Custom Field</DialogTitle>
          <DialogDescription>
            Create a new field to capture technical data
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Field name */}
          <div className="space-y-2">
            <Label htmlFor="label">Field Name *</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Design flow, pH, Turbidity..."
            />
          </div>

          {/* Field type */}
          <div className="space-y-2">
            <Label htmlFor="type">Field Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as FieldType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="text">📝 Text</SelectItem>
                <SelectItem value="number">🔢 Number</SelectItem>
                <SelectItem value="unit">📊 Number with Unit</SelectItem>
                <SelectItem value="select">📋 Dropdown List</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Units (for unit type) */}
          {type === "unit" && (
            <div className="space-y-2">
              <Label>Available Units *</Label>
              <TagInput
                tags={units}
                onChange={setUnits}
                placeholder="Type and press Enter or comma"
                suggestions={ALL_COMMON_UNITS}
              />
              <p className="text-xs text-muted-foreground">
                Add multiple units to allow conversion.
                Example: L/s, m³/h, m³/d
              </p>
            </div>
          )}

          {/* Options (for select type) */}
          {type === "select" && (
            <div className="space-y-2">
              <Label>Options *</Label>
              <TagInput
                tags={selectOptions}
                onChange={setSelectOptions}
                placeholder="Type an option and press Enter or comma"
              />
              <p className="text-xs text-muted-foreground">
                Define the options the user can select
              </p>
            </div>
          )}

          {/* Description (optional) */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Additional information about this field"
              rows={2}
            />
          </div>

          {/* Required field */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="required"
              checked={required}
              onCheckedChange={(checked) => setRequired(checked as boolean)}
            />
            <Label htmlFor="required" className="text-sm font-medium cursor-pointer">
              Required field
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!label.trim()}>
            Add Field
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function DynamicSection({
  section,
  onFieldChange,
  onAddField,
  onRemoveField,
  onRemoveSection,
  isCollapsible = true,
  defaultOpen = true,
  showAddField = true,
  showRemoveSection = false
}: DynamicSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // ✅ OPTIMIZACIÓN: Filtrar campos condicionales
  const visibleFields = section.fields.filter((field) => {
    // Si no tiene condición, siempre visible
    if (!field.conditional) return true
    
    // Buscar el campo del que depende
    const dependsOnField = section.fields.find(f => f.id === field.conditional!.field)
    if (!dependsOnField) return true  // If field not found, show anyway
    
    // Verificar si el valor cumple la condición
    const conditionValue = field.conditional.value
    if (Array.isArray(conditionValue)) {
      return conditionValue.includes(String(dependsOnField.value))
    }
    return String(dependsOnField.value) === String(conditionValue)
  })

  const content = (
    <div className="space-y-4">
      {/* Fields Grid - ✅ OPTIMIZACIÓN: Máximo 2 columnas para mejor legibilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 gap-y-4 auto-rows-min">
        {visibleFields.map((field) => (
          <div
            key={field.id}
            className={cn(
              // Multiline fields take full width
              field.multiline && "lg:col-span-2",
              // Tags take full width (multi-select needs space)
              field.type === "tags" && "lg:col-span-2",
              // Combobox with long options takes full width
              field.type === "combobox" && field.options && field.options.some(opt => opt.length > 30) && "lg:col-span-2"
            )}
          >
            <EditableCell
              field={field}
              sectionId={section.id}
              onFieldChange={onFieldChange}
              onRemoveField={onRemoveField}
              showRemove={showAddField} // Only show remove if we can add fields
            />
          </div>
        ))}
      </div>

      {/* Add Field Button */}
      {showAddField && (
        <AddFieldDialog
          onAddField={(field) => onAddField(section.id, field)}
          trigger={
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Field
            </Button>
          }
        />
      )}
    </div>
  )

  if (!isCollapsible) {
    return (
      <div className="space-y-4 p-6 border rounded-lg">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h3 className="text-lg font-serif font-semibold">{section.title}</h3>
            {section.description && (
              <p className="text-sm text-muted-foreground">{section.description}</p>
            )}
          </div>
          {showRemoveSection && onRemoveSection && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onRemoveSection(section.id)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
        {content}
      </div>
    )
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="border rounded-lg">
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 hover:bg-muted/50 cursor-pointer">
            <div className="flex items-center gap-2">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <div className="space-y-1">
                <h3 className="text-lg font-serif font-semibold">{section.title}</h3>
                {section.description && (
                  <p className="text-sm text-muted-foreground">{section.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {section.fields.length} campos
              </Badge>
              {showRemoveSection && onRemoveSection && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onRemoveSection(section.id)
                  }}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="p-4 pt-0 border-t">
            {content}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}