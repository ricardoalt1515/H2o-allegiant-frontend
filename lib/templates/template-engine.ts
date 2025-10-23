/**
 * TEMPLATE ENGINE - Smart merge and materialization system
 * 
 * Converts template configurations into complete TableSection[] ready for use.
 * 
 * Features:
 * - Template inheritance (base → sector → subsector)
 * - Intelligent section merging
 * - Field deduplication
 * - Override application
 * - Lazy field materialization from parameter-library
 * 
 * Flow:
 * 1. Resolve template chain (e.g., hotel → commercial → base)
 * 2. Merge section configs (extend/replace/remove operations)
 * 3. Materialize fields (convert IDs → TableField with metadata)
 * 4. Return complete sections ready for use
 */

import type { TableSection, TableField } from "@/lib/types/technical-data"
import type { TemplateConfig, SectionConfig, FieldOverride, TemplateRegistry } from "./template-types"
import { getParameterById } from "@/lib/parameter-library"

/**
 * Convert parameter ID to TableField using parameter library
 * 
 * @param parameterId - Parameter ID from library
 * @param overrides - Optional field-level overrides
 * @returns Complete TableField or null if parameter not found
 */
function fromLibrary(parameterId: string, overrides?: FieldOverride): TableField | null {
  const param = getParameterById(parameterId)
  
  if (!param) {
    console.error(`❌ Parameter "${parameterId}" NOT FOUND in library`)
    return null
  }
  
  // Build field from library metadata
  const field: TableField = {
    id: parameterId,
    label: param.label,
    type: param.type,
    value: overrides?.defaultValue ?? param.defaultValue ?? "",
    source: param.suggestedSource ?? "manual",
    importance: overrides?.importance ?? param.importance ?? "optional",
  } as TableField
  
  // Add optional properties from library
  if (param.defaultUnit) field.unit = param.defaultUnit
  if (param.availableUnits) field.units = param.availableUnits
  
  // Override required flag
  if (overrides?.required !== undefined) {
    field.required = overrides.required
  } else if (param.required) {
    field.required = param.required
  }
  
  // Add metadata
  if (overrides?.description) {
    field.description = overrides.description
  } else if (param.description) {
    field.description = param.description
  }
  
  if (param.validationRule) field.validationRule = param.validationRule
  if (param.validationMessage) field.validationMessage = param.validationMessage
  if (param.options) field.options = param.options
  if (param.multiline) field.multiline = param.multiline
  
  // Override placeholder
  if (overrides?.placeholder) {
    field.placeholder = overrides.placeholder
  } else if (param.placeholder) {
    field.placeholder = param.placeholder
  }
  
  return field
}

/**
 * Resolve template inheritance chain
 * 
 * Walks up the "extends" chain to build ordered list of templates.
 * Returns templates in order: [base, sector, subsector]
 * 
 * @param template - Starting template
 * @param registry - Registry of all templates
 * @returns Ordered array of templates (base first)
 */
function resolveTemplateChain(
  template: TemplateConfig,
  registry: TemplateRegistry
): TemplateConfig[] {
  const chain: TemplateConfig[] = []
  const visited = new Set<string>()
  let current: TemplateConfig | undefined = template
  
  // Walk up the chain
  while (current) {
    // Prevent infinite loops
    if (visited.has(current.id)) {
      console.error(`❌ Circular template inheritance detected: ${current.id}`)
      break
    }
    
    visited.add(current.id)
    chain.unshift(current)  // Add to front (base first)
    
    // Move to parent
    current = current.extends ? registry.get(current.extends) : undefined
  }
  
  return chain
}

/**
 * Merge section configs from template chain
 * 
 * Applies extend/replace/remove operations to build final section configs.
 * 
 * @param chain - Ordered template chain (base first)
 * @returns Map of merged section configs
 */
function mergeSectionConfigs(chain: TemplateConfig[]): Map<string, SectionConfig> {
  const mergedSections = new Map<string, SectionConfig>()
  
  for (const template of chain) {
    for (const section of template.sections) {
      const existing = mergedSections.get(section.id)
      const operation = section.operation ?? "extend"
      
      if (operation === "remove") {
        // Remove section entirely
        mergedSections.delete(section.id)
        continue
      }
      
      if (!existing || operation === "replace") {
        // New section or replace operation
        mergedSections.set(section.id, { ...section })
        continue
      }
      
      // Extend operation - merge fields
      const addFields = [
        ...(existing.addFields ?? []),
        ...(section.addFields ?? [])
      ]
      
      // Deduplicate fields (preserves order, keeps first occurrence)
      const seenFields = new Set<string>()
      const uniqueFields = addFields.filter(fieldId => {
        if (seenFields.has(fieldId)) return false
        seenFields.add(fieldId)
        return true
      })
      
      // Apply removeFields
      const removeSet = new Set(section.removeFields ?? [])
      const finalFields = uniqueFields.filter(f => !removeSet.has(f))
      
      // Merge field overrides (later templates override earlier ones)
      const fieldOverrides = {
        ...(existing.fieldOverrides ?? {}),
        ...(section.fieldOverrides ?? {})
      }
      
      // Merge section properties (later templates override)
      mergedSections.set(section.id, {
        ...existing,
        ...section,
        addFields: finalFields,
        fieldOverrides: Object.keys(fieldOverrides).length > 0 ? fieldOverrides : undefined
      })
    }
  }
  
  return mergedSections
}

/**
 * Materialize sections - convert configs to actual TableSection[]
 * 
 * Converts field IDs to complete TableField objects using parameter library.
 * 
 * @param sectionConfigs - Merged section configs
 * @returns Complete TableSection[] ready for use
 */
function materializeSections(
  sectionConfigs: Map<string, SectionConfig>
): TableSection[] {
  const sections: TableSection[] = []
  
  for (const [sectionId, config] of sectionConfigs) {
    const fields: TableField[] = []
    
    // Materialize each field
    for (const fieldId of config.addFields ?? []) {
      const override = config.fieldOverrides?.[fieldId]
      const field = fromLibrary(fieldId, override)
      
      if (field) {
        fields.push(field)
      } else {
        console.warn(`⚠️ Field "${fieldId}" in section "${sectionId}" not found in parameter library`)
      }
    }
    
    // Only add section if it has fields or explicit metadata
    if (fields.length > 0 || config.title) {
      sections.push({
        id: sectionId,
        title: config.title ?? sectionId,
        description: config.description,
        allowCustomFields: config.allowCustomFields ?? true,
        fields
      })
    }
  }
  
  return sections
}

/**
 * Apply template - Main entry point
 * 
 * Converts a template ID into complete TableSection[] ready for use.
 * 
 * @param templateId - ID of template to apply
 * @param registry - Registry of all available templates
 * @returns Complete sections or empty array if template not found
 * 
 * @example
 * ```typescript
 * const registry = new Map([["base", BASE_TEMPLATE]])
 * const sections = applyTemplate("base", registry)
 * ```
 */
export function applyTemplate(
  templateId: string,
  registry: TemplateRegistry
): TableSection[] {
  const template = registry.get(templateId)
  
  if (!template) {
    console.error(`❌ Template "${templateId}" not found in registry`)
    return []
  }
  
  console.log(`📋 Applying template: ${template.name}`)
  
  // 1. Resolve inheritance chain
  const chain = resolveTemplateChain(template, registry)
  
  if (chain.length > 1) {
    console.log(`   Inheritance: ${chain.map(t => t.name).join(" → ")}`)
  }
  
  // 2. Merge section configs
  const mergedSections = mergeSectionConfigs(chain)
  
  // 3. Materialize fields
  const sections = materializeSections(mergedSections)
  
  const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0)
  console.log(`✅ Template applied: ${totalFields} fields across ${sections.length} sections`)
  
  return sections
}

/**
 * Create default template registry
 * 
 * Returns a Map with all available templates:
 * - Base template (universal)
 * - Sector templates (municipal, industrial, commercial, residential)
 * - Subsector templates (food-processing, oil-gas, hotel, etc.)
 * 
 * @returns Template registry with all templates
 */
export function createTemplateRegistry(): TemplateRegistry {
  const registry: TemplateRegistry = new Map()
  
  // Base template
  const { BASE_TEMPLATE } = require("./base-template")
  registry.set(BASE_TEMPLATE.id, BASE_TEMPLATE)
  
  // Sector templates
  try {
    const { INDUSTRIAL_TEMPLATE } = require("./sector-templates/industrial.template")
    registry.set(INDUSTRIAL_TEMPLATE.id, INDUSTRIAL_TEMPLATE)
  } catch (e) {
    // Sector template not yet created
  }
  
  // Subsector templates
  try {
    const { FOOD_PROCESSING_TEMPLATE } = require("./subsector-templates/food-processing.template")
    registry.set(FOOD_PROCESSING_TEMPLATE.id, FOOD_PROCESSING_TEMPLATE)
  } catch (e) {
    // Subsector template not yet created
  }
  
  try {
    const { OIL_GAS_TEMPLATE } = require("./subsector-templates/oil-gas.template")
    registry.set(OIL_GAS_TEMPLATE.id, OIL_GAS_TEMPLATE)
  } catch (e) {
    // Subsector template not yet created
  }
  
  return registry
}

/**
 * Get template by sector/subsector
 * 
 * Selection logic:
 * 1. Try exact match (sector + subsector)
 * 2. Fallback to sector-only match
 * 3. Default to base template
 * 
 * @param sector - Target sector (optional)
 * @param subsector - Target subsector (optional)
 * @param registry - Template registry
 * @returns Best matching template or null
 */
export function getTemplateForProject(
  sector?: string,
  subsector?: string,
  registry?: TemplateRegistry
): TemplateConfig | null {
  const reg = registry ?? createTemplateRegistry()
  
  // No sector → use base
  if (!sector) {
    return reg.get("base") || null
  }
  
  // Try exact match (sector + subsector)
  if (subsector) {
    for (const template of reg.values()) {
      if (template.sector === sector && template.subsector === subsector) {
        return template
      }
    }
  }
  
  // Fallback to sector-only match
  for (const template of reg.values()) {
    if (template.sector === sector && !template.subsector) {
      return template
    }
  }
  
  // Default to base
  return reg.get("base") || null
}
