"use client"

import { EnhancedFileUploader } from "./enhanced-file-uploader"

interface FilesTabEnhancedProps {
  projectId: string
  onDataImported?: () => void
}

export function FilesTabEnhanced({ projectId, onDataImported }: FilesTabEnhancedProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-gradient">Gestión de Archivos</h2>
        <p className="text-muted-foreground">
          Sube análisis de laboratorio, reportes técnicos o documentos para extraer datos automáticamente con IA.
        </p>
      </div>

      <EnhancedFileUploader
        projectId={projectId}
        onImportComplete={onDataImported}
      />
    </div>
  )
}