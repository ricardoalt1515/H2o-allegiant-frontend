"use client"

import { useState } from "react"
import {
  Check,
  X,
  AlertCircle,
  Eye,
  Download,
  ArrowRight,
  FileText,
  Zap,
  Target,
  ArrowUpDown
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { ExtractedData, DetectedField } from "./file-uploader"

export interface FieldMapping {
  detectedField: DetectedField
  targetField: string | null
  isSelected: boolean
  confidence: number
}

export interface ImportPreviewProps {
  extractedData: ExtractedData[]
  availableTargetFields: TargetField[]
  onConfirmImport: (mappings: FieldMapping[]) => void
  onCancel: () => void
  className?: string
}

export interface TargetField {
  id: string
  label: string
  section: string
  type: "text" | "number" | "unit" | "select"
  currentValue?: any
  unit?: string
  description?: string
}

// Mock target fields for the technical sheet
const mockTargetFields: TargetField[] = [
  {
    id: "general-data.design-flow",
    label: "Caudal de Diseño",
    section: "Datos Generales",
    type: "unit",
    currentValue: 50,
    unit: "L/s"
  },
  {
    id: "general-data.population-served",
    label: "Población Servida",
    section: "Datos Generales",
    type: "unit",
    currentValue: 25000,
    unit: "habitantes"
  },
  {
    id: "raw-water-parameters.turbidity",
    label: "Turbiedad",
    section: "Parámetros del Agua Cruda",
    type: "unit",
    currentValue: 15,
    unit: "NTU"
  },
  {
    id: "raw-water-parameters.ph",
    label: "pH",
    section: "Parámetros del Agua Cruda",
    type: "number",
    currentValue: 7.2
  },
  {
    id: "raw-water-parameters.color",
    label: "Color Aparente",
    section: "Parámetros del Agua Cruda",
    type: "unit",
    currentValue: 25,
    unit: "UPC"
  },
  {
    id: "raw-water-parameters.iron",
    label: "Hierro Total",
    section: "Parámetros del Agua Cruda",
    type: "unit",
    currentValue: 0.8,
    unit: "mg/L"
  },
  {
    id: "raw-water-parameters.hardness",
    label: "Dureza Total",
    section: "Parámetros del Agua Cruda",
    type: "unit",
    currentValue: 180,
    unit: "mg/L CaCO₃"
  }
]

function FieldMappingRow({
  mapping,
  targetFields,
  onMappingChange
}: {
  mapping: FieldMapping
  targetFields: TargetField[]
  onMappingChange: (updatedMapping: FieldMapping) => void
}) {
  const currentTarget = targetFields.find(f => f.id === mapping.targetField)

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600 bg-green-50"
    if (confidence >= 0.6) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  const formatValue = (value: string | number, unit?: string) => {
    if (unit) return `${value} ${unit}`
    return value.toString()
  }

  return (
    <div className={cn(
      "grid grid-cols-1 md:grid-cols-5 gap-4 p-4 rounded-lg border",
      mapping.isSelected ? "bg-primary/5 border-primary/20" : "bg-muted/30"
    )}>
      {/* Selection Checkbox */}
      <div className="flex items-center space-x-2">
        <Checkbox
          checked={mapping.isSelected}
          onCheckedChange={(checked) =>
            onMappingChange({
              ...mapping,
              isSelected: !!checked
            })
          }
        />
        <div className="space-y-1">
          <p className="font-medium text-sm">{mapping.detectedField.parameter}</p>
          <Badge
            className={cn("text-xs", getConfidenceColor(mapping.detectedField.confidence))}
          >
            {Math.round(mapping.detectedField.confidence * 100)}%
          </Badge>
        </div>
      </div>

      {/* Detected Value */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Valor Detectado</Label>
        <p className="font-mono text-sm">
          {formatValue(mapping.detectedField.value, mapping.detectedField.unit)}
        </p>
        <p className="text-xs text-muted-foreground">
          {mapping.detectedField.sourceLocation}
        </p>
      </div>

      {/* Target Field Selection */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Campo Destino</Label>
        <Select
          value={mapping.targetField || ""}
          onValueChange={(value) =>
            onMappingChange({
              ...mapping,
              targetField: value || null
            })
          }
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Seleccionar campo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">No mapear</SelectItem>
            {targetFields.map(field => (
              <SelectItem key={field.id} value={field.id}>
                <div className="flex flex-col">
                  <span>{field.label}</span>
                  <span className="text-xs text-muted-foreground">{field.section}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Current Value */}
      <div className="space-y-1">
        <Label className="text-xs text-muted-foreground">Valor Actual</Label>
        {currentTarget ? (
          <p className="text-sm text-muted-foreground">
            {formatValue(currentTarget.currentValue, currentTarget.unit) || "Sin valor"}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground italic">No seleccionado</p>
        )}
      </div>

      {/* Action */}
      <div className="flex items-center">
        {mapping.isSelected && mapping.targetField ? (
          <div className="flex items-center space-x-1 text-green-600">
            <Check className="h-4 w-4" />
            <span className="text-xs">Listo</span>
          </div>
        ) : (
          <div className="flex items-center space-x-1 text-muted-foreground">
            <X className="h-4 w-4" />
            <span className="text-xs">Sin mapear</span>
          </div>
        )}
      </div>
    </div>
  )
}

function DataSourcePreview({ data }: { data: ExtractedData }) {
  const typeConfig = {
    laboratory: {
      icon: FileText,
      label: "Análisis de Laboratorio",
      color: "text-blue-600 bg-blue-50"
    },
    excel: {
      icon: FileText,
      label: "Archivo Excel",
      color: "text-green-600 bg-green-50"
    },
    pdf: {
      icon: FileText,
      label: "Documento PDF",
      color: "text-red-600 bg-red-50"
    },
    image: {
      icon: FileText,
      label: "Imagen",
      color: "text-purple-600 bg-purple-50"
    }
  }

  const config = typeConfig[data.type]
  const Icon = config.icon

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center space-x-3">
          <div className={cn("rounded-lg p-2", config.color)}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-lg">{config.label}</CardTitle>
            <p className="text-sm text-muted-foreground">{data.preview}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge variant="outline">
              {data.detectedFields.length} campos detectados
            </Badge>
            <Badge
              className={cn(
                data.confidence > 0.8 ? "text-green-600 bg-green-50" :
                data.confidence > 0.6 ? "text-yellow-600 bg-yellow-50" : "text-red-600 bg-red-50"
              )}
            >
              {Math.round(data.confidence * 100)}% confianza
            </Badge>
          </div>

          {/* Metadata */}
          {Object.keys(data.metadata).length > 0 && (
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Metadatos</Label>
              <div className="text-xs space-y-1">
                {Object.entries(data.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span className="text-muted-foreground">{key}:</span>
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function ImportPreview({
  extractedData,
  availableTargetFields = mockTargetFields,
  onConfirmImport,
  onCancel,
  className
}: ImportPreviewProps) {
  const allDetectedFields = extractedData.flatMap(data => data.detectedFields)

  const [fieldMappings, setFieldMappings] = useState<FieldMapping[]>(() =>
    allDetectedFields.map(field => ({
      detectedField: field,
      targetField: field.suggestedMapping || null,
      isSelected: !!field.suggestedMapping,
      confidence: field.confidence
    }))
  )

  const updateMapping = (index: number, updatedMapping: FieldMapping) => {
    setFieldMappings(prev =>
      prev.map((mapping, i) => i === index ? updatedMapping : mapping)
    )
  }

  const selectedMappings = fieldMappings.filter(m => m.isSelected && m.targetField)
  const highConfidenceCount = fieldMappings.filter(m => m.confidence >= 0.8).length
  const conflictCount = fieldMappings.filter(m => m.isSelected && m.targetField).length

  const handleSelectAll = (checked: boolean) => {
    setFieldMappings(prev =>
      prev.map(mapping => ({
        ...mapping,
        isSelected: checked && !!mapping.targetField
      }))
    )
  }

  const handleAutoMap = () => {
    setFieldMappings(prev =>
      prev.map(mapping => ({
        ...mapping,
        targetField: mapping.detectedField.suggestedMapping || mapping.targetField,
        isSelected: !!mapping.detectedField.suggestedMapping && mapping.confidence >= 0.7
      }))
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-serif font-semibold">Vista Previa de Importación</h2>
        <p className="text-muted-foreground">
          Revisa y mapea los datos detectados antes de importarlos a la ficha técnica
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-primary" />
              <div>
                <p className="text-2xl font-bold">{allDetectedFields.length}</p>
                <p className="text-xs text-muted-foreground">Campos detectados</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{highConfidenceCount}</p>
                <p className="text-xs text-muted-foreground">Alta confianza</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{selectedMappings.length}</p>
                <p className="text-xs text-muted-foreground">Para importar</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{extractedData.length}</p>
                <p className="text-xs text-muted-foreground">Fuentes de datos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="mapping" className="space-y-4">
        <TabsList>
          <TabsTrigger value="mapping">Mapeo de Campos</TabsTrigger>
          <TabsTrigger value="sources">Fuentes de Datos</TabsTrigger>
        </TabsList>

        <TabsContent value="mapping" className="space-y-4">
          {/* Actions */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                checked={selectedMappings.length === allDetectedFields.length}
                onCheckedChange={handleSelectAll}
              />
              <Label>Seleccionar todos</Label>
            </div>

            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleAutoMap}>
                <Zap className="mr-2 h-4 w-4" />
                Auto-mapear
              </Button>
            </div>
          </div>

          {/* Mapping Table Header */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 p-3 bg-muted/50 rounded-lg text-sm font-medium">
            <div>Campo Detectado</div>
            <div>Valor Detectado</div>
            <div>Campo Destino</div>
            <div>Valor Actual</div>
            <div>Estado</div>
          </div>

          {/* Field Mappings */}
          <ScrollArea className="max-h-96">
            <div className="space-y-2">
              {fieldMappings.map((mapping, index) => (
                <FieldMappingRow
                  key={index}
                  mapping={mapping}
                  targetFields={availableTargetFields}
                  onMappingChange={(updated) => updateMapping(index, updated)}
                />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {extractedData.map((data, index) => (
              <DataSourcePreview key={index} data={data} />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Import Summary */}
      {selectedMappings.length > 0 && (
        <Alert>
          <Check className="h-4 w-4" />
          <AlertDescription>
            Se importarán <strong>{selectedMappings.length}</strong> campos.
            Los valores existentes serán sobrescritos con los datos detectados.
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <div className="flex justify-between pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          onClick={() => onConfirmImport(selectedMappings)}
          disabled={selectedMappings.length === 0}
        >
          Importar {selectedMappings.length} Campos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}