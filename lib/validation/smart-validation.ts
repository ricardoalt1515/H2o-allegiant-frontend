import type { ProjectSector } from "@/lib/project-types"

export interface ValidationResult {
  isValid: boolean
  level: "error" | "warning" | "info"
  message: string
  suggestion?: string
}

export interface SmartValidationContext {
  sector: ProjectSector
  treatmentType?: string
  population?: number
  existingData: Record<string, any>
}

// Engineering ranges and typical values by sector
const ENGINEERING_RANGES = {
  Municipal: {
    designFlow: { min: 50, max: 500, unit: "L/hab/d", typical: 200 },
    dbo: { min: 150, max: 400, unit: "mg/L", typical: 250 },
    dqo: { min: 300, max: 800, unit: "mg/L", typical: 500 },
    sst: { min: 100, max: 300, unit: "mg/L", typical: 200 },
    ph: { min: 6.5, max: 8.5, unit: "", typical: 7.2 },
    population: { min: 100, max: 1000000, unit: "hab", typical: 10000 }
  },
  Industrial: {
    designFlow: { min: 10, max: 10000, unit: "m³/d", typical: 1000 },
    dbo: { min: 200, max: 5000, unit: "mg/L", typical: 800 },
    dqo: { min: 500, max: 15000, unit: "mg/L", typical: 1500 },
    sst: { min: 50, max: 2000, unit: "mg/L", typical: 400 },
    ph: { min: 4.0, max: 12.0, unit: "", typical: 8.0 },
    temperature: { min: 20, max: 80, unit: "°C", typical: 35 }
  },
  Residential: {
    designFlow: { min: 150, max: 300, unit: "L/hab/d", typical: 200 },
    dbo: { min: 150, max: 300, unit: "mg/L", typical: 220 },
    dqo: { min: 300, max: 600, unit: "mg/L", typical: 400 },
    sst: { min: 100, max: 250, unit: "mg/L", typical: 180 },
    ph: { min: 6.8, max: 8.2, unit: "", typical: 7.0 },
    population: { min: 50, max: 5000, unit: "hab", typical: 500 }
  },
  Commercial: {
    designFlow: { min: 100, max: 2000, unit: "L/d", typical: 500 },
    dbo: { min: 200, max: 800, unit: "mg/L", typical: 350 },
    dqo: { min: 400, max: 1200, unit: "mg/L", typical: 600 },
    sst: { min: 80, max: 400, unit: "mg/L", typical: 200 },
    ph: { min: 6.5, max: 8.5, unit: "", typical: 7.0 }
  }
}

// Smart validation functions
export function validateDesignFlow(value: number, context: SmartValidationContext): ValidationResult {
  const ranges = ENGINEERING_RANGES[context.sector]
  if (!ranges?.designFlow) {
    return { isValid: true, level: "info", message: "No ranges defined for this sector" }
  }

  const { min, max, unit, typical } = ranges.designFlow

  if (value < min) {
    return {
      isValid: false,
      level: "error",
      message: `Design flow too low for ${context.sector} sector (minimum: ${min} ${unit})`,
      suggestion: `Typical value: ${typical} ${unit}`
    }
  }

  if (value > max) {
    return {
      isValid: false,
      level: "warning",
      message: `Design flow too high for ${context.sector} sector (typical maximum: ${max} ${unit})`,
      suggestion: "Verify if correct or consider phased treatment"
    }
  }

  // Check consistency with population
  if (context.sector === "Municipal" && context.existingData.population) {
    const perCapita = value / context.existingData.population
    if (perCapita < 100 || perCapita > 600) {
      return {
        isValid: true,
        level: "warning",
        message: `Per capita flow: ${perCapita.toFixed(0)} L/cap/d (typical: 150-300)`,
        suggestion: "Verify if includes infiltration or industrial flows"
      }
    }
  }

  return { isValid: true, level: "info", message: "Design flow within typical range" }
}

export function validatePH(value: number, context: SmartValidationContext): ValidationResult {
  const ranges = ENGINEERING_RANGES[context.sector]
  if (!ranges?.ph) {
    return { isValid: true, level: "info", message: "No ranges defined for this sector" }
  }

  const { min, max } = ranges.ph

  if (value < min || value > max) {
    const isExtreme = value < 4 || value > 11
    return {
      isValid: !isExtreme,
      level: isExtreme ? "error" : "warning",
      message: isExtreme
        ? `Extreme pH (${value}) - verify measurement`
        : `pH outside typical range for ${context.sector} (${min}-${max})`,
      suggestion: isExtreme
        ? "Extreme pH requires special pretreatment"
        : "Consider neutralization in design"
    }
  }

  return { isValid: true, level: "info", message: "pH within acceptable range" }
}

export function validateDBO(value: number, context: SmartValidationContext): ValidationResult {
  const ranges = ENGINEERING_RANGES[context.sector]
  if (!ranges?.dbo) {
    return { isValid: true, level: "info", message: "No ranges defined for this sector" }
  }

  const { min, max, typical } = ranges.dbo

  if (value < min / 2) {
    return {
      isValid: true,
      level: "info",
      message: "BOD5 very low - verify if treatment is required",
      suggestion: "Low BOD may indicate already treated water or specific industrial type"
    }
  }

  if (value > max * 2) {
    return {
      isValid: true,
      level: "warning",
      message: `BOD5 very high (${value} mg/L) - extreme organic load`,
      suggestion: "Consider pretreatment or anaerobic treatment"
    }
  }

  // Check DBO/DQO ratio if DQO exists
  if (context.existingData.dqo && context.existingData.dqo > 0) {
    const ratio = value / context.existingData.dqo
    if (ratio > 0.8) {
      return {
        isValid: true,
        level: "warning",
        message: `BOD/COD ratio high (${ratio.toFixed(2)}) - verify values`,
        suggestion: "Typical ratio: 0.3-0.7 for wastewater"
      }
    }
    if (ratio < 0.2) {
      return {
        isValid: true,
        level: "info",
        message: `BOD/COD ratio low (${ratio.toFixed(2)}) - low biodegradability`,
        suggestion: "Consider physical-chemical treatment"
      }
    }
  }

  return { isValid: true, level: "info", message: "BOD5 within expected range" }
}

export function validateConsistency(allData: Record<string, any>, context: SmartValidationContext): ValidationResult[] {
  const results: ValidationResult[] = []

  // DBO vs DQO consistency
  if (allData.dbo && allData.dqo) {
    if (allData.dbo > allData.dqo) {
      results.push({
        isValid: false,
        level: "error",
        message: "BOD5 cannot be greater than COD",
        suggestion: "Verify values - physically impossible"
      })
    }
  }

  // Population vs flow consistency for municipal
  if (context.sector === "Municipal" && allData.population && allData.designFlow) {
    const perCapita = allData.designFlow / allData.population
    if (perCapita > 1000) {
      results.push({
        isValid: true,
        level: "warning",
        message: "Design flow excessively high for declared population",
        suggestion: "Verify units or include industrial flows"
      })
    }
  }

  // Temperature vs biological treatment
  if (allData.temperature && allData.temperature > 45) {
    results.push({
      isValid: true,
      level: "warning",
      message: "High temperature may affect biological treatment",
      suggestion: "Consider pre-cooling or physical-chemical treatment"
    })
  }

  return results
}

// Smart suggestions based on data patterns
export function getSmartSuggestions(data: Record<string, any>, context: SmartValidationContext): string[] {
  const suggestions: string[] = []

  // Suggest missing critical parameters
  if (!data.designFlow) {
    const typical = ENGINEERING_RANGES[context.sector]?.designFlow?.typical
    if (typical) {
      suggestions.push(`Valor típico de caudal para ${context.sector}: ${typical} ${ENGINEERING_RANGES[context.sector]?.designFlow?.unit}`)
    }
  }

  // Technology suggestions based on data
  if (data.dbo && data.dbo > 500) {
    suggestions.push("Para DBO alto, considerar: Lodos activados, UASB, o lagunas facultativas")
  }

  if (context.sector === "Industrial" && data.dqo && data.dbo) {
    const ratio = data.dbo / data.dqo
    if (ratio < 0.3) {
      suggestions.push("Baja biodegradabilidad: considerar tratamiento físico-químico previo")
    }
  }

  if (data.sst && data.sst > 300) {
    suggestions.push("Alto contenido de sólidos: incluir sedimentador primario")
  }

  return suggestions
}

// Main validation function
export function validateField(
  fieldId: string,
  value: any,
  context: SmartValidationContext
): ValidationResult {
  if (value === null || value === undefined || value === "") {
    return { isValid: true, level: "info", message: "Field empty" }
  }

  const numValue = typeof value === "number" ? value : parseFloat(value)
  if (isNaN(numValue)) {
    return {
      isValid: false,
      level: "error",
      message: "Value must be numeric",
      suggestion: "Enter a valid number"
    }
  }

  switch (fieldId) {
    case "design-flow":
      return validateDesignFlow(numValue, context)
    case "ph":
      return validatePH(numValue, context)
    case "dbo":
      return validateDBO(numValue, context)
    default:
      return { isValid: true, level: "info", message: "Field valid" }
  }
}