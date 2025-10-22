"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import {
  Upload,
  FileText,
  AlertCircle,
  CheckCircle,
  X,
  FileSpreadsheet,
  FileImage,
  Eye,
  Download,
  ArrowRight,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { cn } from "@/lib/utils"

export interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: "uploading" | "analyzing" | "ready" | "error"
  progress: number
  url?: string
  extractedData?: ExtractedData
  error?: string
}

export interface ExtractedData {
  type: "laboratory" | "excel" | "pdf" | "image"
  confidence: number
  detectedFields: DetectedField[]
  preview: string
  metadata: Record<string, any>
}

export interface DetectedField {
  parameter: string
  value: string | number
  unit?: string
  confidence: number
  sourceLocation: string
  suggestedMapping?: string
}

interface FileUploaderProps {
  onFilesChange: (files: UploadedFile[]) => void
  onDataExtracted: (extractedData: ExtractedData[]) => void
  acceptedTypes?: string[]
  maxFiles?: number
  maxSize?: number
  className?: string
}

const defaultAcceptedTypes = [
  "application/pdf",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "text/csv"
]

const fileIcons = {
  "application/pdf": FileText,
  "application/vnd.ms-excel": FileSpreadsheet,
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": FileSpreadsheet,
  "text/csv": FileSpreadsheet,
  "image/jpeg": FileImage,
  "image/png": FileImage,
  default: FileText
}

// Mock function to simulate file processing
const processFile = async (file: File): Promise<ExtractedData> => {
  // Simulate processing time
  await new Promise(resolve => setTimeout(resolve, 2000 + Math.random() * 3000))

  // Mock extracted data based on file type
  if (file.type.includes("excel") || file.type.includes("spreadsheet") || file.name.includes("lab")) {
    return {
      type: "laboratory",
      confidence: 0.92,
      preview: "Análisis de laboratorio detectado - Aguas del Río San José",
      metadata: {
        sampleDate: "2024-01-15",
        laboratory: "LACOMET",
        samplePoint: "Captación Principal"
      },
      detectedFields: [
        {
          parameter: "Turbiedad",
          value: 15.2,
          unit: "NTU",
          confidence: 0.95,
          sourceLocation: "Hoja1, Celda B5",
          suggestedMapping: "raw-water-parameters.turbidity"
        },
        {
          parameter: "pH",
          value: 7.1,
          confidence: 0.98,
          sourceLocation: "Hoja1, Celda B8",
          suggestedMapping: "raw-water-parameters.ph"
        },
        {
          parameter: "Color Aparente",
          value: 28,
          unit: "UPC",
          confidence: 0.87,
          sourceLocation: "Hoja1, Celda B12",
          suggestedMapping: "raw-water-parameters.color"
        },
        {
          parameter: "Hierro Total",
          value: 0.85,
          unit: "mg/L",
          confidence: 0.91,
          sourceLocation: "Hoja1, Celda B15",
          suggestedMapping: "raw-water-parameters.iron"
        },
        {
          parameter: "Dureza Total",
          value: 185,
          unit: "mg/L CaCO₃",
          confidence: 0.89,
          sourceLocation: "Hoja1, Celda B18",
          suggestedMapping: "raw-water-parameters.hardness"
        }
      ]
    }
  } else if (file.type.includes("pdf")) {
    return {
      type: "pdf",
      confidence: 0.78,
      preview: "Documento técnico - Especificaciones del proyecto",
      metadata: {
        pages: 12,
        documentType: "technical_specification"
      },
      detectedFields: [
        {
          parameter: "Caudal de Diseño",
          value: 45,
          unit: "L/s",
          confidence: 0.82,
          sourceLocation: "Página 3, Párrafo 2",
          suggestedMapping: "general-data.design-flow"
        },
        {
          parameter: "Población Servida",
          value: 22000,
          unit: "habitantes",
          confidence: 0.76,
          sourceLocation: "Página 1, Tabla 1",
          suggestedMapping: "general-data.population-served"
        }
      ]
    }
  } else {
    return {
      type: "image",
      confidence: 0.65,
      preview: "Imagen procesada - Posibles datos técnicos detectados",
      metadata: {
        dimensions: "1920x1080",
        format: file.type
      },
      detectedFields: [
        {
          parameter: "Valor detectado",
          value: "25.5",
          confidence: 0.65,
          sourceLocation: "Esquina superior derecha",
          suggestedMapping: "unknown"
        }
      ]
    }
  }
}

function FileUploadZone({
  onDrop,
  isDragActive,
  acceptedTypes
}: {
  onDrop: (files: File[]) => void
  isDragActive: boolean
  acceptedTypes: string[]
}) {
  return (
    <div
      className={cn(
        "relative border-2 border-dashed rounded-lg p-8 text-center transition-colors",
        isDragActive
          ? "border-primary bg-primary/5"
          : "border-muted-foreground/25 hover:border-primary/50"
      )}
    >
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-primary/10 p-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-2">
          <p className="text-lg font-medium">
            {isDragActive ? "Suelta los archivos aquí" : "Arrastra archivos o haz clic"}
          </p>
          <p className="text-sm text-muted-foreground">
            Soporta PDF, Excel, CSV e imágenes (máx. 10MB cada uno)
          </p>
        </div>
        <Button variant="outline">
          Seleccionar Archivos
        </Button>
      </div>
    </div>
  )
}

function FilePreview({
  file,
  onRemove
}: {
  file: UploadedFile
  onRemove: (fileId: string) => void
}) {
  const FileIcon = fileIcons[file.type as keyof typeof fileIcons] || fileIcons.default

  const getStatusColor = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading": return "text-blue-600"
      case "analyzing": return "text-yellow-600"
      case "ready": return "text-green-600"
      case "error": return "text-red-600"
      default: return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
      case "analyzing":
        return <Loader2 className="h-4 w-4 animate-spin" />
      case "ready":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <Card className="relative">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FileIcon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {(file.size / 1024 / 1024).toFixed(1)} MB
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onRemove(file.id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-3">
          {/* Status */}
          <div className="flex items-center space-x-2">
            <div className={getStatusColor(file.status)}>
              {getStatusIcon(file.status)}
            </div>
            <span className={cn("text-sm", getStatusColor(file.status))}>
              {file.status === "uploading" && "Subiendo archivo..."}
              {file.status === "analyzing" && "Analizando contenido..."}
              {file.status === "ready" && "Listo para importar"}
              {file.status === "error" && (file.error || "Error al procesar")}
            </span>
          </div>

          {/* Progress Bar */}
          {(file.status === "uploading" || file.status === "analyzing") && (
            <Progress value={file.progress} className="h-2" />
          )}

          {/* Extracted Data Preview */}
          {file.status === "ready" && file.extractedData && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="secondary" className="text-xs">
                  {file.extractedData.detectedFields.length} campos detectados
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    file.extractedData.confidence > 0.8 ? "text-green-600" :
                    file.extractedData.confidence > 0.6 ? "text-yellow-600" : "text-red-600"
                  )}
                >
                  {Math.round(file.extractedData.confidence * 100)}% confianza
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {file.extractedData.preview}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export function FileUploader({
  onFilesChange,
  onDataExtracted,
  acceptedTypes = defaultAcceptedTypes,
  maxFiles = 5,
  maxSize = 10 * 1024 * 1024, // 10MB
  className
}: FileUploaderProps) {
  const [files, setFiles] = useState<UploadedFile[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles = acceptedFiles.slice(0, maxFiles - files.length).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: "uploading" as const,
      progress: 0
    }))

    setFiles(prev => [...prev, ...newFiles])
    onFilesChange([...files, ...newFiles])

    // Process each file
    for (const newFile of newFiles) {
      try {
        // Simulate upload progress
        const updateProgress = (progress: number) => {
          setFiles(prev => prev.map(f =>
            f.id === newFile.id ? { ...f, progress } : f
          ))
        }

        // Upload simulation
        for (let i = 0; i <= 100; i += 10) {
          updateProgress(i)
          await new Promise(resolve => setTimeout(resolve, 100))
        }

        // Change to analyzing status
        setFiles(prev => prev.map(f =>
          f.id === newFile.id
            ? { ...f, status: "analyzing", progress: 0 }
            : f
        ))

        // Analyze file
        const originalFile = acceptedFiles.find(f => f.name === newFile.name)
        if (originalFile) {
          const extractedData = await processFile(originalFile)

          setFiles(prev => prev.map(f =>
            f.id === newFile.id
              ? { ...f, status: "ready", progress: 100, extractedData }
              : f
          ))
        }
      } catch (error) {
        setFiles(prev => prev.map(f =>
          f.id === newFile.id
            ? { ...f, status: "error", error: "Error al procesar el archivo" }
            : f
        ))
      }
    }
  }, [files, maxFiles, onFilesChange])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => {
      acc[type] = []
      return acc
    }, {} as Record<string, string[]>),
    maxSize,
    multiple: true
  })

  const removeFile = (fileId: string) => {
    const updatedFiles = files.filter(f => f.id !== fileId)
    setFiles(updatedFiles)
    onFilesChange(updatedFiles)
  }

  const readyFiles = files.filter(f => f.status === "ready")
  const extractedDataArray = readyFiles
    .map(f => f.extractedData)
    .filter(Boolean) as ExtractedData[]

  return (
    <div className={cn("space-y-6", className)}>
      {/* Upload Zone */}
      <div {...getRootProps()}>
        <input {...getInputProps()} />
        <FileUploadZone
          onDrop={onDrop}
          isDragActive={isDragActive}
          acceptedTypes={acceptedTypes}
        />
      </div>

      {/* Files List */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Archivos Subidos</h3>
            <Badge variant="outline">
              {files.length} / {maxFiles}
            </Badge>
          </div>

          <div className="grid gap-3">
            {files.map(file => (
              <FilePreview
                key={file.id}
                file={file}
                onRemove={removeFile}
              />
            ))}
          </div>
        </div>
      )}

      {/* Import Actions */}
      {readyFiles.length > 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>
              {readyFiles.length} archivo(s) listo(s) para importar datos
            </span>
            <Button
              size="sm"
              onClick={() => onDataExtracted(extractedDataArray)}
            >
              Importar Datos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}