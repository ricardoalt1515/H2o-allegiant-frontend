import type { TableSection, TableField } from "@/lib/types/technical-data"

export interface TechnicalTemplate {
  id: string
  name: string
  description?: string
  sector?: string
  subsector?: string
  sections: TableSection[]
  tags?: string[]
}

const unit = (label: string, id: string, unit: string, suggestedValue?: number): TableField => ({
  id,
  label,
  type: "unit",
  unit,
  units: [unit],
  value: "",
  source: "manual",
  ...(suggestedValue !== undefined ? { suggestedValue } as any : {}),
}) as any

const numberField = (label: string, id: string, suggestedValue?: number): TableField => ({
  id,
  label,
  type: "number",
  value: "",
  source: "manual",
  ...(suggestedValue !== undefined ? { suggestedValue } as any : {}),
}) as any

export const TECHNICAL_TEMPLATES: TechnicalTemplate[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // MUNICIPAL TEMPLATES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "municipal-utility",
    name: "Municipal - Public Utility",
    description: "Drinking water system for large-scale public utilities",
    sector: "Municipal",
    subsector: "Public Utility",
    sections: [
      // Extends base template + adds municipal-specific fields
      {
        id: "economics-scale",
        title: "Economics & Scale",
        fields: [
          // Additional fields for municipal scale
          unit("Population Served", "population-served", "inhabitants", 50000),
          unit("Storage Capacity", "storage-capacity", "m³", 500),
        ],
      },
      {
        id: "water-quality",
        title: "Water Quality",
        fields: [
          // Additional fields for potable water requirements
          unit("Total Coliforms", "total-coliforms", "MPN/100ml", 0),
          unit("Fecal Coliforms", "fecal-coliforms", "MPN/100ml", 0),
          unit("E. Coli", "ecoli", "MPN/100ml", 0),
          unit("Fluoride", "fluoride", "mg/L", 1.0),
          unit("Residual Chlorine", "chlorine-residual", "mg/L", 0.5),
        ],
      },
    ],
    tags: ["municipal", "utility", "public", "potable"],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // INDUSTRIAL TEMPLATES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "industrial-food",
    name: "Industrial - Food & Beverage",
    description: "High organic load (BOD/COD) and fats/oils",
    sector: "Industrial",
    subsector: "Food & Beverage",
    sections: [
      // Extends base template + adds organic load parameters
      {
        id: "water-quality",
        title: "Water Quality",
        fields: [
          // Additional fields for food industry wastewater
          unit("BOD₅ (Biochemical Oxygen Demand)", "bod5", "mg/L", 2500),
          unit("COD (Chemical Oxygen Demand)", "cod", "mg/L", 5000),
          unit("Fats, Oils and Grease (FOG)", "fats-oils-greases", "mg/L", 200),
          unit("Total Suspended Solids (TSS)", "tss", "mg/L", 250),
        ],
      },
    ],
    tags: ["industrial", "food", "beverage", "organic-load"],
  },
  {
    id: "industrial-textile",
    name: "Industrial - Textile",
    description: "Process water and effluents with dyes, metals and color",
    sector: "Industrial",
    subsector: "Textile",
    sections: [
      // Extends base template + adds textile-specific parameters
      {
        id: "water-quality",
        title: "Water Quality",
        fields: [
          // Additional fields for textile effluents
          unit("Color", "color", "Pt-Co", 500),
          unit("COD (Chemical Oxygen Demand)", "cod", "mg/L", 800),
          unit("BOD₅ (Biochemical Oxygen Demand)", "bod5", "mg/L", 400),
          unit("Total Suspended Solids (TSS)", "tss", "mg/L", 300),
          unit("Heavy Metals", "heavy-metals", "mg/L", 0.1),
        ],
      },
    ],
    tags: ["industrial", "textile", "effluent", "dyes"],
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // COMMERCIAL TEMPLATES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "commercial-hotel",
    name: "Commercial - Hotel",
    description: "Premium quality for guests and equipment protection",
    sector: "Commercial",
    subsector: "Hotel",
    sections: [
      // Extends base template + adds hotel-specific parameters
      {
        id: "water-quality",
        title: "Water Quality",
        fields: [
          // Additional fields for hotel water quality
          unit("Residual Chlorine", "chlorine-residual", "mg/L", 0.3),
          unit("Total Iron", "iron", "mg/L", 0.1),
          unit("Silica", "silica", "mg/L", 20),
        ],
      },
    ],
    tags: ["commercial", "hotel", "hospitality", "premium"],
  },
]

/**
 * Get recommended template by sector/subsector
 */
export function getTemplateForProject(sector?: string, subsector?: string): TechnicalTemplate | null {
  if (!sector) return null

  // Try exact match first (sector + subsector)
  if (subsector) {
    const exactMatch = TECHNICAL_TEMPLATES.find(
      t => t.sector === sector && t.subsector === subsector
    )
    if (exactMatch) return exactMatch
  }

  // Fallback to sector-only match
  const sectorMatch = TECHNICAL_TEMPLATES.find(t => t.sector === sector && !t.subsector)
  if (sectorMatch) return sectorMatch

  // Default to first template of sector
  return TECHNICAL_TEMPLATES.find(t => t.sector === sector) || null
}
