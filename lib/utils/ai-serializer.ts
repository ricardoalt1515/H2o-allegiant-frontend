/**
 * AI Data Serializer
 * 
 * Convierte los datos técnicos del frontend a un formato optimizado
 * para el agente de IA (backend Pydantic)
 */

import type { TableSection, TableField } from "@/lib/types/technical-data"

// Tipos para el agente IA
export interface AIParameter {
  id: string
  label: string
  value: string | number | boolean | null
  unit?: string
  category: string
  importance: "critical" | "recommended" | "optional"
  source: "manual" | "imported" | "ai" | "calculated"
}

export interface AITechnicalData {
  projectId: string
  timestamp: string
  sections: {
    id: string
    title: string
    parameters: AIParameter[]
  }[]
  summary: {
    totalFields: number
    completedFields: number
    completionPercentage: number
    criticalFields: {
      total: number
      completed: number
    }
  }
}

/**
 * Convierte TableSection[] a formato para agente IA
 */
export function serializeForAI(
  projectId: string,
  sections: TableSection[]
): AITechnicalData {
  const aiSections = sections.map((section) => ({
    id: section.id,
    title: section.title,
    parameters: section.fields
      .filter((field) => field.value !== null && field.value !== undefined && field.value !== "")
      .map((field) => fieldToAIParameter(field, section.id)),
  }))

  // Calcular estadísticas
  const allFields = sections.flatMap((s) => s.fields)
  const totalFields = allFields.length
  const completedFields = allFields.filter(
    (f) => f.value !== null && f.value !== undefined && f.value !== ""
  ).length

  const criticalFields = allFields.filter((f) => f.importance === "critical")
  const criticalCompleted = criticalFields.filter(
    (f) => f.value !== null && f.value !== undefined && f.value !== ""
  ).length

  return {
    projectId,
    timestamp: new Date().toISOString(),
    sections: aiSections,
    summary: {
      totalFields,
      completedFields,
      completionPercentage: totalFields > 0 ? Math.round((completedFields / totalFields) * 100) : 0,
      criticalFields: {
        total: criticalFields.length,
        completed: criticalCompleted,
      },
    },
  }
}

/**
 * Convierte un TableField a AIParameter
 */
function fieldToAIParameter(field: TableField, sectionId: string): AIParameter {
  const param: AIParameter = {
    id: `${sectionId}.${field.id}`,
    label: field.label,
    value: field.value,
    category: inferCategory(field, sectionId),
    importance: field.importance || "optional",
    source: field.source || "manual",
  }
  
  if (field.unit) {
    param.unit = field.unit
  }
  
  return param
}

/**
 * Infiere categoría del parámetro basado en el campo y sección
 */
function inferCategory(field: TableField, sectionId: string): string {
  // Categorías por sección (actualizado para nueva estructura)
  const sectionCategories: Record<string, string> = {
    // Nueva estructura (5 secciones)
    "project-context": "context",
    "economics-scale": "economics",
    "project-constraints": "constraints",
    "water-quality": "quality",
    "field-notes": "notes",

    // Legacy sections (para compatibilidad con plantillas específicas)
    "general-data": "design",
    "raw-water-parameters": "quality",
    "treatment-objectives": "regulatory",
    "regulatory-compliance": "regulatory",
    "engineer-notes": "notes",
  }

  if (sectionCategories[sectionId]) {
    return sectionCategories[sectionId]
  }

  // Categorías por palabras clave en el label
  const label = field.label.toLowerCase()
  
  if (label.includes("caudal") || label.includes("flow") || label.includes("volumen")) {
    return "hydraulic"
  }
  
  if (
    label.includes("dbo") ||
    label.includes("dqo") ||
    label.includes("bod") ||
    label.includes("cod") ||
    label.includes("sst") ||
    label.includes("tss") ||
    label.includes("ph")
  ) {
    return "quality"
  }
  
  if (
    label.includes("norma") ||
    label.includes("límite") ||
    label.includes("standard") ||
    label.includes("regulatory")
  ) {
    return "regulatory"
  }
  
  if (label.includes("proceso") || label.includes("process") || label.includes("operación")) {
    return "process"
  }

  return "general"
}

/**
 * Genera prompt context para el agente IA
 * 
 * Este formato es el que se enviará al agente de IA para generar la propuesta
 */
export function generatePromptContext(data: AITechnicalData): string {
  const sections = data.sections
    .filter((section) => section.parameters.length > 0)
    .map((section) => {
      const params = section.parameters
        .map((param) => {
          const value = param.unit ? `${param.value} ${param.unit}` : param.value
          return `  • ${param.label}: ${value}`
        })
        .join("\n")

      return `## ${section.title}\n${params}`
    })
    .join("\n\n")

  const summary = [
    `Completitud: ${data.summary.completionPercentage}%`,
    `Campos completados: ${data.summary.completedFields}/${data.summary.totalFields}`,
    `Campos críticos: ${data.summary.criticalFields.completed}/${data.summary.criticalFields.total}`,
  ].join(" | ")

  return `# Datos Técnicos del Proyecto

${summary}

${sections}

---
Datos generados: ${new Date(data.timestamp).toLocaleString("es-ES")}
`
}

/**
 * Genera JSON limpio para backend Pydantic
 */
export function serializeForBackend(data: AITechnicalData): string {
  return JSON.stringify(data, null, 2)
}

/**
 * Valida que hay suficientes datos para generar propuesta
 */
export function validateForProposal(sections: TableSection[]): {
  valid: boolean
  errors: string[]
  warnings: string[]
} {
  const errors: string[] = []
  const warnings: string[] = []

  // Verificar campos críticos
  const criticalFields = sections
    .flatMap((s) => s.fields)
    .filter((f) => f.importance === "critical")

  const criticalCompleted = criticalFields.filter(
    (f) => f.value !== null && f.value !== undefined && f.value !== ""
  ).length

  if (criticalCompleted === 0) {
    errors.push("No hay campos críticos completados")
  } else if (criticalCompleted < criticalFields.length) {
    warnings.push(
      `Solo ${criticalCompleted} de ${criticalFields.length} campos críticos están completados`
    )
  }

  // Verificar completitud mínima
  const allFields = sections.flatMap((s) => s.fields)
  const completed = allFields.filter(
    (f) => f.value !== null && f.value !== undefined && f.value !== ""
  ).length
  const percentage = allFields.length > 0 ? (completed / allFields.length) * 100 : 0

  if (percentage < 50) {
    errors.push(`Completitud muy baja (${Math.round(percentage)}%). Se requiere al menos 50%`)
  } else if (percentage < 70) {
    warnings.push(
      `Completitud aceptable (${Math.round(percentage)}%) pero se recomienda al menos 70%`
    )
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Extrae parámetros específicos por nombre para el agente
 */
export function extractKeyParameters(sections: TableSection[]): Record<string, any> {
  const keyParams: Record<string, any> = {}

  const findField = (fieldId: string, sectionId?: string) => {
    for (const section of sections) {
      if (sectionId && section.id !== sectionId) continue
      const field = section.fields.find((f) => f.id === fieldId)
      if (field && field.value) {
        return { value: field.value, unit: field.unit }
      }
    }
    return null
  }

  // Parámetros clave para el agente
  // design-flow: optional field in general-data (only in specific templates)
  const designFlow = findField("design-flow", "general-data") || findField("design-flow")
  if (designFlow) {
    keyParams.designFlow = designFlow.value
    keyParams.designFlowUnit = designFlow.unit
  }

  // population-served: optional field (Municipal templates add to economics-scale)
  const population = findField("population-served", "economics-scale") || findField("population-served", "general-data") || findField("population-served")
  if (population) {
    keyParams.population = population.value
  }

  // BOD: water-quality section (new structure) or fallback to any section
  const bod = findField("bod5", "water-quality") || findField("bod5") || findField("dbo5")
  if (bod) {
    keyParams.bod = bod.value
    keyParams.bodUnit = bod.unit
  }

  // COD: water-quality section (new structure) or fallback to any section
  const cod = findField("cod", "water-quality") || findField("cod") || findField("dqo")
  if (cod) {
    keyParams.cod = cod.value
    keyParams.codUnit = cod.unit
  }

  const ph = findField("ph")
  if (ph) {
    keyParams.ph = ph.value
  }

  return keyParams
}
