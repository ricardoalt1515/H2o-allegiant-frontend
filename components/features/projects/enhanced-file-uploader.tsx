"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Upload, FileText, Brain, CheckCircle, AlertTriangle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { SmartImportPreview } from "./smart-import-preview"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

type FileContent = string | Record<string, string | number>

interface UploadedFile {
  id: string
  file: File
  status: "uploading" | "analyzing" | "ready" | "error"
  progress: number
  content?: FileContent
  error?: string
}

interface EnhancedFileUploaderProps {
  projectId: string
  onImportComplete?: (() => void) | undefined
}

export function EnhancedFileUploader({ projectId, onImportComplete }: EnhancedFileUploaderProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [currentPreview, setCurrentPreview] = useState<{
    fileName: string
    content: FileContent
  } | null>(null)

  const downloadExcelTemplate = () => {
    const csv = [
      "Parametro,Valor,Unidad",
      "pH,7.2,",
      "Turbidez,45,NTU",
      "DBO5,280,mg/L",
      "DQO,520,mg/L",
      "SST,220,mg/L",
      "Temperatura,25,°C",
      "Caudal,150,L/s",
      "HorasOperacion,24,h/día"
    ].join("\n")

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "plantilla-municipal-v1.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach(file => {
      const fileId = crypto.randomUUID()

      setUploadedFiles(prev => [...prev, {
        id: fileId,
        file,
        status: "uploading",
        progress: 0
      }])

      // Simulate upload process
      processFile(file, fileId)
    })
  }, [])

  const processFile = async (file: File, fileId: string) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200))
        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, progress } : f
        ))
      }

      // Change to analyzing status
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId ? { ...f, status: "analyzing", progress: 0 } : f
      ))

      // Simulate analysis
      for (let progress = 0; progress <= 100; progress += 25) {
        await new Promise(resolve => setTimeout(resolve, 300))
        setUploadedFiles(prev => prev.map(f =>
          f.id === fileId ? { ...f, progress } : f
        ))
      }

      // Extract content based on file type
      const content = await extractFileContent(file)

      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId ? {
          ...f,
          status: "ready",
          progress: 100,
          content
        } : f
      ))

      toast.success(`${file.name} analizado exitosamente`)

    } catch (error) {
      console.error("Error processing file:", error)
      setUploadedFiles(prev => prev.map(f =>
        f.id === fileId ? {
          ...f,
          status: "error",
          error: "Error al procesar el archivo"
        } : f
      ))
      toast.error(`Error al procesar ${file.name}`)
    }
  }

  const extractFileContent = async (file: File): Promise<FileContent> => {
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    if (fileType === "application/json") {
      const text = await file.text()
      return JSON.parse(text)
    }

    if (fileType === "text/csv" || fileName.endsWith('.csv')) {
      const text = await file.text()
      return parseCsvToObject(text)
    }

    if (fileType === "application/pdf") {
      // Mock PDF extraction - in real implementation would use PDF parser
      return generateMockPdfContent()
    }

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      // Mock Excel extraction - in real implementation would use Excel parser
      return generateMockExcelContent()
    }

    // For other text files
    return await file.text()
  }

  const parseCsvToObject = (csvText: string): Record<string, string | number> => {
    const rows = csvText.split('\n').map(l => l.trim()).filter(l => l.length > 0)
    if (rows.length === 0) return {}
    const headerLine = rows[0] ?? ''
    const headers = headerLine.split(',').map(h => h.trim())
    const data: Record<string, string | number> = {}

    const h0 = headers[0] ?? ''
    const h1 = headers[1] ?? ''
    const isTemplate = headers.length >= 2 && /parametro/i.test(h0) && /valor/i.test(h1)

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i] ?? ''
      const values = row.split(',')
      if (isTemplate) {
        const key = (values[0] ?? '').trim()
        const raw = (values[1] ?? '').trim()
        if (!key) continue
        const normalized = raw.replace(/\s+/g, '').replace(',', '.')
        const num = Number(normalized)
        data[key] = Number.isFinite(num) ? num : raw
      } else {
        // Fallback: last-wins per header
        headers.forEach((header, index) => {
          if (values[index]) {
            data[header] = values[index].trim()
          }
        })
      }
    }

    return data
  }

  const generateMockPdfContent = (): string => {
    return `REPORTE DE ANÁLISIS DE AGUA RESIDUAL

Parámetro: pH, Valor: 7.2
Parámetro: Turbidez, Valor: 45, Unidad: NTU
Parámetro: DBO5, Valor: 280, Unidad: mg/L
Parámetro: DQO, Valor: 520, Unidad: mg/L
Parámetro: SST, Valor: 220, Unidad: mg/L
Parámetro: Temperatura, Valor: 25, Unidad: °C
Caudal promedio: 150, Unidad: L/s
Población servida: 10000, Unidad: habitantes`
  }

  const generateMockExcelContent = (): Record<string, number> => {
    return {
      "pH": 7.2,
      "Turbidez (NTU)": 45,
      "DBO5 (mg/L)": 280,
      "DQO (mg/L)": 520,
      "SST (mg/L)": 220,
      "Temperatura (°C)": 25,
      "Caudal (L/s)": 150,
      "Población": 10000
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
      'application/json': ['.json'],
      'text/plain': ['.txt']
    },
    maxFiles: 5
  })

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handlePreviewFile = (file: UploadedFile) => {
    if (file.status === "ready" && file.content) {
      setCurrentPreview({
        fileName: file.file.name,
        content: file.content
      })
    }
  }

  const getStatusIcon = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return <Upload className="h-4 w-4 animate-pulse" />
      case "analyzing":
        return <Brain className="h-4 w-4 animate-pulse text-blue-500" />
      case "ready":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusLabel = (status: UploadedFile["status"]) => {
    switch (status) {
      case "uploading":
        return "Subiendo..."
      case "analyzing":
        return "Analizando con IA..."
      case "ready":
        return "Listo para importar"
      case "error":
        return "Error"
    }
  }

  // Show preview if one is selected
  if (currentPreview) {
    return (
      <SmartImportPreview
        fileName={currentPreview.fileName}
        fileContent={currentPreview.content}
        projectId={projectId}
        onImportComplete={() => {
          setCurrentPreview(null)
          onImportComplete?.()
        }}
        onCancel={() => setCurrentPreview(null)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Template and guidance */}
      <Card className="aqua-panel">
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-muted-foreground">
            Usa la plantilla oficial para acelerar la importación de parámetros técnicos (Municipal v1).
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={downloadExcelTemplate}>
              Descargar plantilla Excel (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upload Area */}
      <Card className="aqua-panel">
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              "relative cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/25"
            )}
          >
            <input {...getInputProps()} />

            <div className="mx-auto flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <Brain className="h-6 w-6 text-primary" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isDragActive ? "Suelta los archivos aquí" : "Importación Inteligente"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  Arrastra archivos o haz clic para seleccionar
                </p>
                <p className="text-xs text-muted-foreground">
                  Formatos soportados: PDF, Excel, CSV, JSON, TXT
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center text-xs text-muted-foreground">
                <Badge variant="outline">Análisis de laboratorio</Badge>
                <Badge variant="outline">Reportes técnicos</Badge>
                <Badge variant="outline">Datos estructurados</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="aqua-panel">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Archivos Procesados</h3>
            <div className="space-y-4">
              {uploadedFiles.map((uploadedFile) => (
                <div
                  key={uploadedFile.id}
                  className="flex items-center justify-between p-4 rounded-lg border bg-card/50"
                >
                  <div className="flex items-center space-x-3 flex-1">
                    {getStatusIcon(uploadedFile.status)}

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {uploadedFile.file.name}
                      </p>
                      <div className="flex items-center space-x-2">
                        <p className="text-xs text-muted-foreground">
                          {getStatusLabel(uploadedFile.status)}
                        </p>
                        {uploadedFile.status === "error" && uploadedFile.error && (
                          <p className="text-xs text-red-500">
                            {uploadedFile.error}
                          </p>
                        )}
                      </div>

                      {(uploadedFile.status === "uploading" || uploadedFile.status === "analyzing") && (
                        <Progress value={uploadedFile.progress} className="mt-2 h-1.5" />
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {uploadedFile.status === "ready" && (
                      <Button
                        size="sm"
                        onClick={() => handlePreviewFile(uploadedFile)}
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                      >
                        <Brain className="mr-2 h-4 w-4" />
                        Analizar e Importar
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(uploadedFile.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}