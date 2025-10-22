import { TableSection, DataSource, TableField } from "@/lib/types/technical-data"
import { getParameterById } from "@/lib/parameter-library"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPER FUNCTIONS (must be defined before template)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Helper: Create field from parameter library
 * Extracts parameter definition and converts to TableField
 */
const fromLibrary = (parameterId: string): TableField | null => {
  const param = getParameterById(parameterId)
  
  if (!param) {
    console.error(`❌ Parameter "${parameterId}" NOT FOUND in library`)
    return null
  }
  
  const field: TableField = {
    id: parameterId,
    label: param.label,
    type: param.type,
    value: param.defaultValue ?? "",
    source: param.suggestedSource ?? ("manual" as DataSource),
    importance: param.importance ?? "optional"
  } as TableField
  
  // Add optional properties only if defined
  if (param.defaultUnit !== undefined) field.unit = param.defaultUnit
  if (param.availableUnits !== undefined) field.units = param.availableUnits
  if (param.required !== undefined) field.required = param.required
  if (param.description !== undefined) field.description = param.description
  if (param.validationRule !== undefined) field.validationRule = param.validationRule
  if (param.validationMessage !== undefined) field.validationMessage = param.validationMessage
  if (param.options !== undefined) field.options = param.options
  if (param.multiline !== undefined) field.multiline = param.multiline
  if (param.placeholder !== undefined) field.placeholder = param.placeholder
  
  return field
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// BASE TEMPLATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Creates initial technical sheet with complete sections
 * 
 * This template matches the original structure exactly.
 * Field Notes is ALWAYS the last section (no external function needed).
 * 
 * Sections (8 total):
 * 1. Project Information - Essential context
 * 2. Consumption & Operating Costs - Economic data
 * 3. Project Constraints - Limitations
 * 4. General Project Data - Design parameters
 * 5. Raw Water Parameters - Water quality
 * 6. Treatment Objectives - Quality goals (empty, add from library)
 * 7. Regulatory Compliance - Standards
 * 8. Field Notes - Engineer observations (ALWAYS LAST)
 */
export const createInitialTechnicalSheetData = (): TableSection[] => {
  return [
    // ========================================
    // SECTION 1: Project Information
    // ========================================
    {
      id: "project-information",
      title: "Project Information",
      description: "Essential project context and objectives",
      allowCustomFields: false,
      fields: [
        "water-source",
        "water-uses",
        "existing-system",
        "existing-system-description",
        "project-objective",
        "reuse-goals",
        "discharge-point"
      ].map(fromLibrary).filter((f): f is TableField => f !== null)
    },

    // ========================================
    // SECTION 2: Consumption & Costs
    // ========================================
    {
      id: "consumption-costs",
      title: "Consumption & Operating Costs",
      description: "Economic and operational data for ROI analysis",
      allowCustomFields: true,
      fields: [
        "water-cost",
        "water-consumption",
        "wastewater-generated",
        "people-served-daily",
        "people-served-exact"
      ].map(fromLibrary).filter((f): f is TableField => f !== null)
    },

    // ========================================
    // SECTION 3: Project Constraints
    // ========================================
    {
      id: "project-constraints",
      title: "Project Constraints",
      description: "Limitations and special considerations affecting design",
      allowCustomFields: true,
      fields: [
        "constraints"
      ].map(fromLibrary).filter((f): f is TableField => f !== null)
    },

    // ========================================
    // SECTION 4: General Data
    // ========================================
    {
      id: "general-data",
      title: "General Project Data",
      description: "Basic design parameters",
      allowCustomFields: true,
      fields: [
        "design-flow",
        "population-served",
        "operating-hours"
      ].map(fromLibrary).filter((f): f is TableField => f !== null)
    },

    // ========================================
    // SECTION 5: Raw Water Parameters
    // ========================================
    {
      id: "raw-water-parameters",
      title: "Raw Water Parameters",
      description: "Physical, chemical and bacteriological characteristics",
      allowCustomFields: true,
      fields: [
        "turbidity",
        "ph",
        "temperature",
        "tds",
        "hardness"
      ].map(fromLibrary).filter((f): f is TableField => f !== null)
    },

    // ========================================
    // SECTION 6: Treatment Objectives
    // ========================================
    {
      id: "treatment-objectives",
      title: "Treatment Objectives",
      description: "Required water quality goals",
      allowCustomFields: true,
      fields: []
    },

    // ========================================
    // SECTION 7: Regulatory Compliance
    // ========================================
    {
      id: "regulatory-compliance",
      title: "Regulatory Compliance",
      description: "Applicable standards and regulations",
      allowCustomFields: true,
      fields: [
        "drinking-water-standard",
        "discharge-standard",
        "permit-required",
        "seismic-code",
        "operation-manual"
      ].map(fromLibrary).filter((f): f is TableField => f !== null)
    },

    // ========================================
    // SECTION 8: Field Notes (ALWAYS LAST)
    // ========================================
    {
      id: "engineer-notes",
      title: "Field Notes",
      description: "Engineer observations, assumptions and detected risks on site",
      allowCustomFields: false,
      fields: [
        "field-notes"
      ].map(fromLibrary).filter((f): f is TableField => f !== null)
    }
  ]
}

// Re-export from parameter library
export { isFixedSection } from "@/lib/parameter-library"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// REHYDRATION - Restore functions and metadata from library
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Rehydrate sections with metadata from parameter library
 * 
 * When data is loaded from backend (JSON), it lacks JavaScript functions
 * like validationRule. This function restores them from the parameter library.
 * 
 * Process:
 * 1. For each field, get parameter definition from library
 * 2. Merge: stored value + library metadata
 * 3. Preserve user data (value, notes, timestamps)
 * 4. Restore functions (validationRule)
 * 
 * @param sections - Raw sections from backend (no functions)
 * @returns Rehydrated sections with functions and updated metadata
 */
export const rehydrateFieldsFromLibrary = (
  sections: TableSection[]
): TableSection[] => {
  return sections.map(section => ({
    ...section,
    fields: section.fields.map(field => {
      // Get fresh definition from library
      const param = getParameterById(field.id)
      
      // If not in library, use field as-is (backwards compatibility)
      // This handles custom fields and legacy fields from old template
      if (!param) {
        console.warn(`⚠️ Field "${field.id}" not in parameter library - using stored definition`)
        return field
      }
      
      // Merge: library metadata + stored values
      const rehydrated: TableField = {
        // Core properties from library
        id: field.id,
        label: param.label,
        type: param.type,
        
        // Preserved values from backend
        value: field.value, // Keep user's value
        source: field.source,
        importance: param.importance ?? field.importance,
        
        // Rehydrate functions (lost in JSON serialization)
        validationRule: param.validationRule,
        validationMessage: param.validationMessage,
        
        // Rehydrate options and metadata
        options: param.options,
        required: param.required,
        description: param.description,
        multiline: param.multiline,
        placeholder: param.placeholder,
      } as TableField
      
      // Add unit if present
      if (field.unit) rehydrated.unit = field.unit
      else if (param.defaultUnit) rehydrated.unit = param.defaultUnit
      
      if (param.availableUnits) rehydrated.units = param.availableUnits
      
      // Preserve user metadata
      if (field.notes) rehydrated.notes = field.notes
      if (field.lastUpdatedAt) rehydrated.lastUpdatedAt = field.lastUpdatedAt
      if (field.lastUpdatedBy) rehydrated.lastUpdatedBy = field.lastUpdatedBy
      if (field.suggestedValue !== undefined) rehydrated.suggestedValue = field.suggestedValue
      if (field.conditional) rehydrated.conditional = field.conditional
      
      return rehydrated
    })
  }))
}

// ========================================
// HELPER FUNCTIONS
// ========================================
// These functions are used throughout the app for:
// - Calculating completion percentages
// - Updating field values
// - Saving data to backend
// - Converting data for different UI components

export const getFieldValue = (sections: TableSection[], sectionId: string, fieldId: string) => {
  const section = sections.find(s => s.id === sectionId)
  const field = section?.fields.find(f => f.id === fieldId)
  return field?.value
}

export const calculateDerivedValues = (sections: TableSection[]) => {
  const designFlow = getFieldValue(sections, "general-data", "design-flow") as number
  const operationHours = getFieldValue(sections, "general-data", "operation-hours") as number
  const population = getFieldValue(sections, "general-data", "population-served") as number

  return {
    dailyVolume: designFlow * operationHours * 3.6, // m³/day
    perCapitaConsumption: population > 0 ? (designFlow * 86.4) / population : 0, // L/person/day
    peakFactor: 1.8,
    averageFlow: designFlow / 1.8 // L/s
  }
}

const storageKeyForProject = (projectId: string) => `technical-sheet-data:${projectId}`
const isBrowser = () => typeof window !== "undefined" && typeof window.localStorage !== "undefined"

/**
 * Save technical sheet data to localStorage and backend
 */
export const saveTechnicalSheetData = async (
  projectId: string,
  sections: TableSection[]
): Promise<void> => {
  if (!isBrowser()) return

  // Save to localStorage (immediate backup)
  try {
    window.localStorage.setItem(
      storageKeyForProject(projectId),
      JSON.stringify(sections)
    )
  } catch (error) {
    console.warn("⚠️ Unable to persist to localStorage:", error)
  }

  // Sync to backend (critical for AI agent)
  try {
    const { projectDataAPI } = await import("@/lib/api/project-data")
    await projectDataAPI.updateData(
      projectId,
      { technical_sections: sections },
      true
    )
  } catch (error) {
    console.error("❌ Failed to sync to backend:", error)
  }
}

export interface FieldUpdate {
  sectionId: string
  fieldId: string
  value: string | number
  unit?: string
  source?: DataSource
  notes?: string
}

export const updateFieldInSections = (
  sections: TableSection[],
  update: FieldUpdate
): TableSection[] => {
  return sections.map((section) => {
    if (section.id !== update.sectionId) return section
    return {
      ...section,
      fields: section.fields.map((field) => {
        if (field.id !== update.fieldId) return field
        return {
          ...field,
          value: update.value,
          ...(update.unit !== undefined ? { unit: update.unit } : {}),
          ...(update.source ? { source: update.source } : {}),
          ...(update.notes !== undefined ? { notes: update.notes } : {}),
        }
      })
    }
  })
}

export const applyFieldUpdates = (
  sections: TableSection[],
  updates: FieldUpdate[]
): TableSection[] => {
  return updates.reduce(
    (acc, update) => updateFieldInSections(acc, update),
    sections
  )
}

export const sectionCompletion = (section: TableSection) => {
  const total = section.fields.length
  const completed = section.fields.filter(
    (field) => field.value !== undefined && field.value !== "" && field.value !== null
  ).length
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0
  return { total, completed, percentage }
}

export const overallCompletion = (sections: TableSection[]) => {
  const totals = sections.reduce(
    (acc, section) => {
      const stats = sectionCompletion(section)
      return {
        total: acc.total + stats.total,
        completed: acc.completed + stats.completed,
      }
    },
    { total: 0, completed: 0 }
  )
  const percentage = totals.total > 0 ? Math.round((totals.completed / totals.total) * 100) : 0
  return { ...totals, percentage }
}

export interface SummaryRow {
  sectionId: string
  sectionTitle: string
  fieldId: string
  fieldLabel: string
  fieldType: string
  currentValue?: string | number | string[] | null
  unit?: string
  description?: string
  source?: DataSource
}

export const mapSectionsToSummaryRows = (sections: TableSection[]): SummaryRow[] => {
  return sections.flatMap((section) =>
    section.fields.map((field) => {
      const row: SummaryRow = {
        sectionId: section.id,
        sectionTitle: section.title,
        fieldId: field.id,
        fieldLabel: field.label,
        fieldType: field.type,
      }
      if (field.value !== undefined && field.value !== null) row.currentValue = field.value
      if (field.unit !== undefined) row.unit = field.unit
      if (field.description) row.description = field.description
      if (field.source) row.source = field.source
      return row
    })
  )
}

export const mapSectionsToTargetFields = (sections: TableSection[]) => {
  return sections.flatMap((section) =>
    section.fields.map((field) => ({
      id: field.id,
      label: field.label,
      section: section.title,
      type: field.type,
      currentValue: field.value,
      unit: field.unit,
      description: field.description,
    }))
  )
}

export const sourceBreakdown = (sections: TableSection[]) => {
  return sections.reduce(
    (acc, section) => {
      section.fields.forEach((field) => {
        const key = field.source || "manual"
        acc[key] = (acc[key] || 0) + (field.value ? 1 : 0)
      })
      return acc
    },
    {} as Record<DataSource, number>
  )
}
