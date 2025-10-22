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
  {
    id: "municipal-basic",
    name: "Municipal - Basic",
    description: "Base template for municipal systems (drinking water/wastewater)",
    sector: "Municipal",
    sections: [
      {
        id: "general-data",
        title: "General Project Data",
        fields: [
          unit("Design Flow", "design-flow", "L/s", 50),
          unit("Population Served", "population-served", "inhabitants", 25000),
          numberField("Peak Factor", "peak-factor", 1.8),
        ],
      },
      {
        id: "raw-water-parameters",
        title: "Raw Water Parameters",
        fields: [
          unit("Turbidity", "turbidity", "NTU", 15),
          numberField("pH", "ph", 7.2),
          unit("Temperature", "temperature", "°C", 20),
        ],
      },
    ],
    tags: ["municipal", "base"],
  },
  {
    id: "municipal-utility",
    name: "Municipal - Public Utility",
    description: "Drinking water system for large-scale public utilities",
    sector: "Municipal",
    subsector: "Public Utility",
    sections: [
      {
        id: "general-data",
        title: "General Project Data",
        fields: [
          unit("Design Flow", "design-flow", "L/s", 100),
          unit("Population Served", "population-served", "inhabitants", 50000),
          unit("Storage Capacity", "storage-capacity", "m³", 500),
        ],
      },
      {
        id: "raw-water-parameters",
        title: "Raw Water Parameters",
        fields: [
          unit("Turbidity", "turbidity", "NTU", 20),
          numberField("pH", "ph", 7.0),
          unit("Residual Chlorine", "chlorine-residual", "mg/L", 0.5),
          unit("Fluoride", "fluoride", "mg/L", 1.0),
          unit("Total Coliforms", "total-coliforms", "MPN/100ml", 0),
        ],
      },
    ],
    tags: ["municipal", "utility", "public"],
  },
  {
    id: "industrial-food",
    name: "Industrial - Food & Beverage",
    description: "High organic load (BOD/COD) and fats/oils",
    sector: "Industrial",
    subsector: "Food & Beverage",
    sections: [
      {
        id: "organic-load",
        title: "Organic Load",
        fields: [
          unit("BOD₅", "bod", "mg/L", 2500),
          unit("COD", "cod", "mg/L", 5000),
          unit("Fats, Oils and Greases", "fats-oils-greases", "mg/L", 200),
        ],
      },
      {
        id: "raw-water-parameters",
        title: "Raw Water Parameters",
        fields: [
          numberField("pH", "ph", 6.8),
          unit("Temperature", "temperature", "°C", 25),
        ],
      },
    ],
    tags: ["industrial", "food"],
  },
  {
    id: "industrial-textile",
    name: "Industrial - Textile",
    description: "Process water and effluents with dyes, metals and hardness",
    sector: "Industrial",
    subsector: "Textile",
    sections: [
      {
        id: "process-water",
        title: "Process Water",
        fields: [
          unit("Total Hardness", "total-hardness", "mg/L CaCO₃", 150),
          unit("Total Iron", "total-iron", "mg/L", 0.5),
          numberField("pH", "ph", 7.0),
          unit("Temperature", "temperature", "°C", 30),
        ],
      },
      {
        id: "effluent-parameters",
        title: "Effluent Parameters",
        fields: [
          unit("Color", "color", "Pt-Co", 500),
          unit("COD", "cod", "mg/L", 800),
          unit("TSS", "tss", "mg/L", 300),
          unit("Heavy Metals", "heavy-metals", "mg/L", 0.1),
        ],
      },
    ],
    tags: ["industrial", "textile", "effluent"],
  },
  {
    id: "commercial-hotel",
    name: "Commercial - Hotel",
    description: "Premium quality for guests and equipment protection",
    sector: "Commercial",
    subsector: "Hotel",
    sections: [
      {
        id: "general-data",
        title: "General Project Data",
        fields: [
          unit("Design Flow", "design-flow", "L/s", 30),
          unit("Number of Rooms", "room-count", "rooms", 100),
          unit("Average Occupancy", "occupancy", "%", 70),
        ],
      },
      {
        id: "water-quality",
        title: "Water Quality",
        fields: [
          unit("Total Hardness", "total-hardness", "mg/L CaCO₃", 100),
          unit("Residual Chlorine", "chlorine-residual", "mg/L", 0.3),
          unit("Iron", "iron", "mg/L", 0.1),
          numberField("pH", "ph", 7.5),
          unit("Temperature", "temperature", "°C", 22),
        ],
      },
    ],
    tags: ["commercial", "hotel", "hospitality"],
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
