/**
 * PARAMETER LIBRARY - Single Source of Truth
 * Central repository for all water treatment system parameters
 */

import type { FieldType, DataSource, FieldImportance } from "@/lib/types/technical-data"
import type { Sector, Subsector } from "@/lib/sectors-config"

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// TYPES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export type ParameterCategory =
  | "design"
  | "physical"
  | "chemical-inorganic"
  | "chemical-organic"
  | "bacteriological"
  | "operational"
  | "regulatory"

export interface ParameterDefinition {
  id: string
  label: string
  category: ParameterCategory
  targetSection: string
  relevantSectors: Sector[]
  relevantSubsectors?: Subsector[]
  importance: FieldImportance
  type: FieldType
  defaultUnit?: string
  availableUnits?: string[]
  defaultValue?: string | number | string[]
  typicalRange?: { min: number; max: number }
  description: string
  tags: string[]
  suggestedSource?: DataSource
  validationRule?: (value: unknown) => boolean
  validationMessage?: string
  options?: string[]
  required?: boolean
  multiline?: boolean
  placeholder?: string
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CONSTANTS
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const CORE_SECTIONS = [
  "project-information",
  "consumption-costs",
  "project-constraints",
  "general-data",
  "raw-water-parameters",
  "treatment-objectives",
  "regulatory-compliance",
  "engineer-notes"
] as const

export function isFixedSection(sectionId: string): boolean {
  return CORE_SECTIONS.includes(sectionId as any)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// PARAMETER LIBRARY
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const PARAMETER_LIBRARY: ParameterDefinition[] = [
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROJECT INFORMATION FIELDS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "water-source",
    label: "Primary Water Source",
    category: "design",
    targetSection: "project-information",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "select",
    defaultValue: "",
    description: "Main water source - determines treatment strategy",
    tags: ["water", "source", "origin"],
    suggestedSource: "manual",
    required: true,
    options: [
      "Municipal Network",
      "Private Well",
      "Surface Water (river, lake)",
      "Rainwater Harvesting",
      "Internal Purification System",
      "Other"
    ]
  },
  {
    id: "water-uses",
    label: "Main Water Uses",
    category: "design",
    targetSection: "project-information",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "tags",
    defaultValue: [],
    description: "How water will be used in the operation (can select multiple)",
    tags: ["uses", "application", "purpose"],
    suggestedSource: "manual",
    required: true,
    options: [
      "Potable Water / Human Consumption",
      "Industrial Processes",
      "Cleaning and Sanitation",
      "Cooling / HVAC",
      "Steam Generation (boilers)",
      "Irrigation",
      "Pools and SPA",
      "Laundry",
      "Kitchens / Food Preparation",
      "Other"
    ]
  },
  {
    id: "existing-system",
    label: "Existing Treatment System?",
    category: "design",
    targetSection: "project-information",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "select",
    defaultValue: "",
    description: "Determines if this is an upgrade or new installation",
    tags: ["existing", "upgrade", "retrofit"],
    suggestedSource: "manual",
    required: true,
    options: ["Yes", "No"]
  },
  {
    id: "existing-system-description",
    label: "Current System Description",
    category: "design",
    targetSection: "project-information",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "recommended",
    type: "text",
    defaultValue: "",
    multiline: true,
    description: "Current technologies and processes (if applicable)",
    tags: ["existing", "system", "description"],
    suggestedSource: "manual",
    placeholder: "e.g., Sand Filter + Reverse Osmosis, Activated Sludge, MBR, etc."
  },
  {
    id: "project-objective",
    label: "Main Project Objective",
    category: "design",
    targetSection: "project-information",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "select",
    defaultValue: "",
    description: "Primary priority that will guide the design",
    tags: ["objective", "goal", "priority"],
    suggestedSource: "manual",
    required: true,
    options: [
      "Comply with discharge regulations",
      "Reduce environmental footprint / Sustainability",
      "Save costs / ROI",
      "Ensure water availability",
      "Other"
    ]
  },
  {
    id: "reuse-goals",
    label: "Reuse or Discharge Goals",
    category: "design",
    targetSection: "project-information",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "tags",
    defaultValue: [],
    description: "Final use of treated water (can select multiple)",
    tags: ["reuse", "discharge", "effluent"],
    suggestedSource: "manual",
    required: true,
    options: [
      "Landscape Irrigation",
      "Toilet Flushing",
      "Industrial Process Reuse",
      "Cleaning Operations",
      "Comply with discharge regulations only",
      "Aquifer Recharge",
      "Other"
    ]
  },
  {
    id: "discharge-point",
    label: "Current Discharge Point",
    category: "design",
    targetSection: "project-information",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "recommended",
    type: "select",
    defaultValue: "",
    description: "Where wastewater is currently discharged",
    tags: ["discharge", "effluent", "outlet"],
    suggestedSource: "manual",
    options: [
      "Municipal Sewer",
      "Natural Water Body (river, lake, sea)",
      "Absorption Well / Infiltration",
      "No Discharge (evaporation or total reuse)",
      "Other"
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // CONSUMPTION & COSTS FIELDS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "water-cost",
    label: "Current Water Cost",
    category: "operational",
    targetSection: "consumption-costs",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "unit",
    defaultUnit: "USD/m³",
    availableUnits: ["USD/m³", "EUR/m³", "USD/L", "EUR/L", "USD/gal", "CRC/m³"],
    defaultValue: "",
    description: "Current water tariff (for ROI and economic feasibility)",
    tags: ["cost", "tariff", "economics"],
    suggestedSource: "manual",
    required: true,
    validationRule: (value) => Number(value) >= 0,
    validationMessage: "Cost must be greater than or equal to 0"
  },
  {
    id: "water-consumption",
    label: "Water Consumption",
    category: "operational",
    targetSection: "consumption-costs",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "unit",
    defaultUnit: "m³/day",
    availableUnits: ["m³/day", "m³/month", "L/day", "gal/day", "gal/month"],
    defaultValue: "",
    description: "Average water consumption",
    tags: ["consumption", "usage", "demand"],
    suggestedSource: "manual",
    required: true,
    validationRule: (value) => Number(value) > 0,
    validationMessage: "Consumption must be greater than 0"
  },
  {
    id: "wastewater-generated",
    label: "Wastewater Generated",
    category: "operational",
    targetSection: "consumption-costs",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "unit",
    defaultUnit: "m³/day",
    availableUnits: ["m³/day", "m³/month", "L/day", "gal/day", "gal/month"],
    defaultValue: "",
    description: "Volume of wastewater requiring treatment",
    tags: ["wastewater", "effluent", "discharge"],
    suggestedSource: "manual",
    required: true,
    validationRule: (value) => Number(value) >= 0,
    validationMessage: "Volume must be greater than or equal to 0"
  },
  {
    id: "people-served-daily",
    label: "People Served Daily",
    category: "operational",
    targetSection: "consumption-costs",
    relevantSectors: ["Municipal", "Comercial", "Residencial"],
    importance: "recommended",
    type: "select",
    defaultValue: "",
    description: "Employees, customers, residents served daily",
    tags: ["people", "population", "users"],
    suggestedSource: "manual",
    options: [
      "< 20",
      "20 - 50",
      "50 - 200",
      "200 - 500",
      "500 - 1,000",
      "1,000 - 2,000",
      "2,000 - 5,000",
      "> 5,000"
    ]
  },
  {
    id: "people-served-exact",
    label: "Exact Number of People (Optional)",
    category: "operational",
    targetSection: "consumption-costs",
    relevantSectors: ["Municipal", "Comercial", "Residencial"],
    importance: "optional",
    type: "number",
    defaultValue: "",
    description: "If you prefer to give an exact number instead of the range",
    tags: ["people", "population", "exact"],
    suggestedSource: "manual",
    validationRule: (value) => !value || Number(value) > 0,
    validationMessage: "Number must be greater than 0"
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // PROJECT CONSTRAINTS FIELDS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "constraints",
    label: "Main Constraints",
    category: "design",
    targetSection: "project-constraints",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "tags",
    defaultValue: [],
    description: "Factors that limit or condition the system design (select all that apply)",
    tags: ["constraints", "limitations", "restrictions"],
    suggestedSource: "manual",
    required: true,
    options: [
      "Limited space for installation",
      "Very strict regulations",
      "Complex water quality (high hardness, salinity, metals)",
      "Limited or unstable electrical supply",
      "Complicated sludge/waste management",
      "Critical OPEX (minimize energy, chemicals, labor)",
      "No significant restrictions"
    ],
    placeholder: "Select all applicable constraints"
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // REGULATORY COMPLIANCE FIELDS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "drinking-water-standard",
    label: "Drinking Water Standard",
    category: "regulatory",
    targetSection: "regulatory-compliance",
    relevantSectors: ["Municipal", "Comercial", "Residencial"],
    importance: "critical",
    type: "select",
    defaultValue: "",
    description: "Applicable potable water quality standard",
    tags: ["standard", "regulation", "drinking-water"],
    suggestedSource: "manual",
    options: [
      "RTCR 25991-S (Costa Rica)",
      "NOM-127-SSA1-2021 (Mexico - Drinking Water)",
      "WHO Guidelines for Drinking Water Quality",
      "EPA NPDWR (USA)",
      "EU Drinking Water Directive 2020/2184",
      "Not Applicable",
      "Other"
    ],
    placeholder: "Select the applicable standard"
  },
  {
    id: "discharge-standard",
    label: "Discharge / Effluent Standard",
    category: "regulatory",
    targetSection: "regulatory-compliance",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "select",
    defaultValue: "",
    description: "Applicable wastewater discharge standard",
    tags: ["standard", "regulation", "discharge", "effluent"],
    suggestedSource: "manual",
    options: [
      "Reglamento de Vertido (Costa Rica)",
      "NOM-001-CONAGUA-2011 (Mexico - Wastewater Discharge)",
      "NOM-002-CNA-1995 (Mexico - Discharge to Rivers)",
      "NOM-003-CNA-1996 (Mexico - Wastewater Reuse)",
      "EPA Clean Water Act (USA)",
      "EU Urban Wastewater Directive 91/271/EEC",
      "Not Applicable",
      "Other"
    ],
    placeholder: "Select the applicable standard"
  },
  {
    id: "permit-required",
    label: "Environmental Permit Required",
    category: "regulatory",
    targetSection: "regulatory-compliance",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "recommended",
    type: "select",
    defaultValue: "",
    description: "Whether environmental permit is required for operation",
    tags: ["permit", "authorization", "compliance"],
    suggestedSource: "manual",
    options: [
      "Yes - In Process",
      "Yes - Already Obtained",
      "No",
      "Unknown"
    ]
  },
  {
    id: "seismic-code",
    label: "Seismic Design Code",
    category: "regulatory",
    targetSection: "regulatory-compliance",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "optional",
    type: "select",
    defaultValue: "",
    description: "Seismic code for structural design (if applicable)",
    tags: ["seismic", "earthquake", "structural"],
    suggestedSource: "manual",
    options: [
      "CSCR-2010 (Costa Rica)",
      "CFE (Mexico)",
      "IBC 2018 (USA)",
      "UBC 1997 (USA)",
      "Eurocode 8 (Europe)",
      "Not applicable",
      "Other"
    ]
  },
  {
    id: "operation-manual",
    label: "Operation & Maintenance Manual",
    category: "regulatory",
    targetSection: "regulatory-compliance",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "optional",
    type: "select",
    defaultValue: "",
    description: "O&M manual requirements",
    tags: ["manual", "documentation", "O&M"],
    suggestedSource: "manual",
    options: [
      "Included in project",
      "Separate deliverable",
      "Not required",
      "Client will provide"
    ]
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // FIELD NOTES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "field-notes",
    label: "Engineer Notes",
    category: "operational",
    targetSection: "engineer-notes",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "recommended",
    type: "text",
    defaultValue: "",
    multiline: true,
    description: "These notes will appear in the proposal context to justify technical decisions",
    tags: ["notes", "observations", "remarks"],
    suggestedSource: "manual",
    placeholder: "Record site findings, identified risks, client agreements, relevant technical assumptions..."
  },

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // DESIGN PARAMETERS (Existing)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  {
    id: "design-flow",
    label: "Design Flow",
    category: "design",
    targetSection: "general-data",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "unit",
    defaultUnit: "L/s",
    availableUnits: ["L/s", "m³/h", "m³/d", "GPM", "MGD"],
    defaultValue: 50,
    typicalRange: { min: 1, max: 10000 },
    description: "Maximum flow rate the system must process",
    tags: ["flow", "design", "capacity"],
    suggestedSource: "manual",
    required: true,
    validationRule: (value) => Number(value) > 0,
    validationMessage: "Flow must be greater than 0"
  },
  {
    id: "population-served",
    label: "Population Served",
    category: "design",
    targetSection: "general-data",
    relevantSectors: ["Municipal", "Residencial"],
    importance: "critical",
    type: "unit",
    defaultUnit: "inhabitants",
    availableUnits: ["inhabitants"],
    defaultValue: 25000,
    description: "Number of people served by the system",
    tags: ["population", "demographics"],
    suggestedSource: "manual",
    required: true
  },
  {
    id: "peak-factor",
    label: "Peak Factor",
    category: "design",
    targetSection: "general-data",
    relevantSectors: ["Municipal", "Comercial", "Residencial"],
    importance: "recommended",
    type: "number",
    defaultValue: 1.8,
    typicalRange: { min: 1.2, max: 3.5 },
    description: "Ratio between maximum and average flow",
    tags: ["factor", "peak", "design"],
    suggestedSource: "ai"
  },
  {
    id: "storage-capacity",
    label: "Storage Capacity",
    category: "design",
    targetSection: "general-data",
    relevantSectors: ["Municipal", "Comercial", "Industrial"],
    importance: "optional",
    type: "unit",
    defaultUnit: "m³",
    availableUnits: ["m³", "L", "gal"],
    description: "Storage tank capacity",
    tags: ["storage", "tank", "capacity"],
    suggestedSource: "manual"
  },

  // Physical Parameters
  {
    id: "turbidity",
    label: "Turbidity",
    category: "physical",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial", "Industrial"],
    importance: "critical",
    type: "unit",
    defaultUnit: "NTU",
    availableUnits: ["NTU", "FAU", "FTU"],
    defaultValue: 15,
    typicalRange: { min: 0, max: 100 },
    description: "Measure of water clarity - suspended particles",
    tags: ["turbidity", "clarity", "filtration"],
    suggestedSource: "imported",
    required: true,
    validationRule: (value) => Number(value) >= 0,
    validationMessage: "Turbidity must be ≥ 0"
  },
  {
    id: "color",
    label: "Apparent Color",
    category: "physical",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial", "Industrial"],
    relevantSubsectors: ["Textile"],
    importance: "recommended",
    type: "unit",
    defaultUnit: "UPC",
    availableUnits: ["UPC", "Pt-Co", "Hazen"],
    defaultValue: 25,
    typicalRange: { min: 0, max: 500 },
    description: "Color intensity in water",
    tags: ["color", "aesthetic"],
    suggestedSource: "imported"
  },
  {
    id: "temperature",
    label: "Temperature",
    category: "physical",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial", "Industrial"],
    importance: "recommended",
    type: "unit",
    defaultUnit: "°C",
    availableUnits: ["°C", "°F"],
    defaultValue: 25,
    typicalRange: { min: 0, max: 40 },
    description: "Water temperature",
    tags: ["temperature", "thermal"],
    suggestedSource: "imported"
  },
  {
    id: "tss",
    label: "Total Suspended Solids (TSS)",
    category: "physical",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Industrial"],
    importance: "recommended",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    defaultValue: 250,
    typicalRange: { min: 0, max: 1000 },
    description: "Suspended solids concentration",
    tags: ["solids", "suspended", "filtration"],
    suggestedSource: "imported"
  },
  {
    id: "tds",
    label: "Total Dissolved Solids (TDS)",
    category: "physical",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial", "Industrial"],
    importance: "recommended",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    defaultValue: 500,
    typicalRange: { min: 0, max: 5000 },
    description: "Dissolved solids concentration",
    tags: ["solids", "dissolved", "salinity"],
    suggestedSource: "imported"
  },
  {
    id: "conductivity",
    label: "Conductivity",
    category: "physical",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial", "Industrial"],
    importance: "optional",
    type: "unit",
    defaultUnit: "µS/cm",
    availableUnits: ["µS/cm", "mS/cm"],
    defaultValue: 800,
    typicalRange: { min: 0, max: 5000 },
    description: "Electrical conductivity",
    tags: ["conductivity", "electrical"],
    suggestedSource: "imported"
  },

  // Chemical Inorganic Parameters
  {
    id: "ph",
    label: "pH",
    category: "chemical-inorganic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    importance: "critical",
    type: "number",
    defaultValue: 7.2,
    typicalRange: { min: 0, max: 14 },
    description: "Water acidity or alkalinity",
    tags: ["ph", "acidity", "chemical"],
    suggestedSource: "imported",
    required: true,
    validationRule: (value) => Number(value) >= 0 && Number(value) <= 14,
    validationMessage: "pH must be between 0 and 14"
  },
  {
    id: "alkalinity",
    label: "Total Alkalinity",
    category: "chemical-inorganic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial", "Industrial"],
    importance: "recommended",
    type: "unit",
    defaultUnit: "mg/L CaCO₃",
    availableUnits: ["mg/L CaCO₃", "ppm"],
    defaultValue: 120,
    typicalRange: { min: 0, max: 500 },
    description: "Water buffer capacity",
    tags: ["alkalinity", "buffer"],
    suggestedSource: "imported"
  },
  {
    id: "hardness",
    label: "Total Hardness",
    category: "chemical-inorganic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial", "Industrial", "Residencial"],
    relevantSubsectors: ["Hotel", "Food & Beverage"],
    importance: "recommended",
    type: "unit",
    defaultUnit: "mg/L CaCO₃",
    availableUnits: ["mg/L CaCO₃", "ppm", "°dH"],
    defaultValue: 180,
    typicalRange: { min: 0, max: 500 },
    description: "Calcium and magnesium concentration",
    tags: ["hardness", "calcium", "magnesium", "scaling"],
    suggestedSource: "imported"
  },
  {
    id: "iron",
    label: "Total Iron",
    category: "chemical-inorganic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial", "Industrial"],
    importance: "optional",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm", "µg/L"],
    defaultValue: 0.8,
    typicalRange: { min: 0, max: 5 },
    description: "Dissolved and particulate iron concentration",
    tags: ["iron", "metals", "staining"],
    suggestedSource: "imported"
  },
  {
    id: "manganese",
    label: "Manganese",
    category: "chemical-inorganic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial"],
    importance: "optional",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm", "µg/L"],
    defaultValue: 0.15,
    typicalRange: { min: 0, max: 2 },
    description: "Manganese concentration",
    tags: ["manganese", "metals", "staining"],
    suggestedSource: "imported"
  },
  {
    id: "chlorides",
    label: "Chlorides",
    category: "chemical-inorganic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Industrial"],
    importance: "optional",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    defaultValue: 150,
    typicalRange: { min: 0, max: 1000 },
    description: "Chloride concentration - indicates salinity",
    tags: ["chlorides", "salinity", "corrosion"],
    suggestedSource: "imported"
  },
  {
    id: "sulfates",
    label: "Sulfates",
    category: "chemical-inorganic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Industrial"],
    importance: "optional",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    defaultValue: 100,
    typicalRange: { min: 0, max: 500 },
    description: "Sulfate concentration",
    tags: ["sulfates", "scaling"],
    suggestedSource: "imported"
  },
  {
    id: "silica",
    label: "Silica",
    category: "chemical-inorganic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Industrial"],
    importance: "optional",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    defaultValue: 20,
    typicalRange: { min: 0, max: 200 },
    description: "Silica concentration - causes boiler scaling",
    tags: ["silica", "scaling", "boiler"],
    suggestedSource: "imported"
  },

  // Chemical Organic Parameters
  {
    id: "bod5",
    label: "BOD₅ (Biochemical Oxygen Demand)",
    category: "chemical-organic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Industrial", "Municipal"],
    relevantSubsectors: ["Food & Beverage"],
    importance: "critical",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    defaultValue: 300,
    typicalRange: { min: 0, max: 5000 },
    description: "Oxygen consumed by microorganisms in 5 days",
    tags: ["bod", "organic", "biodegradable"],
    suggestedSource: "imported",
    required: true
  },
  {
    id: "cod",
    label: "COD (Chemical Oxygen Demand)",
    category: "chemical-organic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Industrial", "Municipal"],
    relevantSubsectors: ["Food & Beverage", "Textile"],
    importance: "critical",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    defaultValue: 600,
    typicalRange: { min: 0, max: 10000 },
    description: "Oxygen required for chemical oxidation",
    tags: ["cod", "organic", "oxidation"],
    suggestedSource: "imported",
    required: true
  },
  {
    id: "fats-oils-greases",
    label: "Fats, Oils and Grease (FOG)",
    category: "chemical-organic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Industrial"],
    relevantSubsectors: ["Food & Beverage"],
    importance: "critical",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    defaultValue: 150,
    typicalRange: { min: 0, max: 1000 },
    description: "FOG content - critical in food industry",
    tags: ["fats", "oils", "grease", "fog"],
    suggestedSource: "imported"
  },
  {
    id: "nitrogen-total",
    label: "Total Nitrogen",
    category: "chemical-organic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Industrial"],
    importance: "recommended",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    defaultValue: 40,
    typicalRange: { min: 0, max: 200 },
    description: "Total nitrogen concentration",
    tags: ["nitrogen", "nutrients"],
    suggestedSource: "imported"
  },
  {
    id: "phosphorus-total",
    label: "Total Phosphorus",
    category: "chemical-organic",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Industrial"],
    importance: "recommended",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    defaultValue: 8,
    typicalRange: { min: 0, max: 50 },
    description: "Total phosphorus concentration",
    tags: ["phosphorus", "nutrients"],
    suggestedSource: "imported"
  },

  // Bacteriological Parameters
  {
    id: "total-coliforms",
    label: "Total Coliforms",
    category: "bacteriological",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial"],
    importance: "critical",
    type: "unit",
    defaultUnit: "MPN/100ml",
    availableUnits: ["MPN/100ml", "CFU/100ml"],
    defaultValue: 0,
    description: "General microbiological contamination indicator",
    tags: ["coliforms", "bacteria", "safety"],
    suggestedSource: "imported",
    required: true
  },
  {
    id: "fecal-coliforms",
    label: "Fecal Coliforms",
    category: "bacteriological",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial"],
    importance: "critical",
    type: "unit",
    defaultUnit: "MPN/100ml",
    availableUnits: ["MPN/100ml", "CFU/100ml"],
    defaultValue: 0,
    description: "Fecal contamination indicator",
    tags: ["coliforms", "fecal", "bacteria"],
    suggestedSource: "imported",
    required: true
  },
  {
    id: "ecoli",
    label: "E. Coli",
    category: "bacteriological",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial"],
    importance: "critical",
    type: "unit",
    defaultUnit: "MPN/100ml",
    availableUnits: ["MPN/100ml", "CFU/100ml"],
    defaultValue: 0,
    description: "Recent fecal contamination indicator",
    tags: ["ecoli", "bacteria", "pathogen"],
    suggestedSource: "imported",
    required: true
  },

  // Operational Parameters
  {
    id: "operating-hours",
    label: "Operating Hours",
    category: "operational",
    targetSection: "general-data",
    relevantSectors: ["Municipal", "Comercial", "Industrial"],
    importance: "recommended",
    type: "unit",
    defaultUnit: "h/day",
    availableUnits: ["h/day"],
    defaultValue: 24,
    typicalRange: { min: 1, max: 24 },
    description: "Daily operating hours",
    tags: ["operation", "schedule"],
    suggestedSource: "manual",
    validationRule: (value) => Number(value) > 0 && Number(value) <= 24,
    validationMessage: "Hours must be between 1 and 24"
  },
  {
    id: "retention-time",
    label: "Hydraulic Retention Time",
    category: "operational",
    targetSection: "treatment-system",
    relevantSectors: ["Municipal", "Industrial"],
    importance: "recommended",
    type: "unit",
    defaultUnit: "h",
    availableUnits: ["h", "min", "days"],
    defaultValue: 8,
    typicalRange: { min: 0.5, max: 72 },
    description: "Average water residence time",
    tags: ["retention", "hydraulic", "hrt"],
    suggestedSource: "ai"
  },
  {
    id: "chlorine-residual",
    label: "Chlorine Residual",
    category: "operational",
    targetSection: "raw-water-parameters",
    relevantSectors: ["Municipal", "Comercial"],
    importance: "critical",
    type: "unit",
    defaultUnit: "mg/L",
    availableUnits: ["mg/L", "ppm"],
    defaultValue: 0.5,
    typicalRange: { min: 0, max: 5 },
    description: "Free chlorine residual for disinfection",
    tags: ["chlorine", "disinfection", "residual"],
    suggestedSource: "manual"
  },
]

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// HELPERS - Only Essential Ones
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * Get parameter by ID
 */
export function getParameterById(id: string): ParameterDefinition | undefined {
  return PARAMETER_LIBRARY.find(p => p.id === id)
}

/**
 * Get parameters for a specific section, optionally filtered by sector
 */
export function getParametersForSection(
  sectionId: string,
  sector?: Sector,
  subsector?: Subsector
): ParameterDefinition[] {
  let params = PARAMETER_LIBRARY.filter(p => p.targetSection === sectionId)
  
  if (sector) {
    params = params.filter(p => p.relevantSectors.includes(sector))
  }
  
  if (subsector) {
    params = params.filter(p => 
      !p.relevantSubsectors || 
      p.relevantSubsectors.length === 0 || 
      p.relevantSubsectors.includes(subsector)
    )
  }
  
  return params
}

/**
 * Filter out parameters that are already added
 */
export function filterOutExisting(
  params: ParameterDefinition[],
  existingIds: string[]
): ParameterDefinition[] {
  return params.filter(p => !existingIds.includes(p.id))
}

/**
 * Search parameters by term (label, description, tags)
 */
export function searchParameters(term: string): ParameterDefinition[] {
  if (!term) return PARAMETER_LIBRARY
  
  const searchLower = term.toLowerCase()
  return PARAMETER_LIBRARY.filter(p =>
    p.label.toLowerCase().includes(searchLower) ||
    p.description.toLowerCase().includes(searchLower) ||
    p.tags.some(tag => tag.toLowerCase().includes(searchLower))
  )
}
