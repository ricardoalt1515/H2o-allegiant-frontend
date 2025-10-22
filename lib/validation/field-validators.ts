import { z } from "zod"

// Specific field validators with contextual error messages
export const fieldValidators = {
  // Water quality parameters
  ph: z
    .number()
    .min(0, "pH cannot be less than 0")
    .max(14, "pH cannot be greater than 14")
    .refine((val) => val >= 6 && val <= 9, {
      message: "pH outside typical range for water (6-9). Verify the value."
    }),

  turbidity: z
    .number()
    .min(0, "Turbidity cannot be negative")
    .max(1000, "Exceptionally high turbidity value. Verify measurement."),

  dbo5: z
    .number()
    .min(0, "BOD5 cannot be negative")
    .max(10000, "Very high BOD5 value. Verify measurement."),

  dqo: z
    .number()
    .min(0, "COD cannot be negative")
    .max(50000, "Very high COD value. Verify measurement.")
    .refine((val, ctx) => {
      const dbo5 = ctx?.dbo5 as number
      if (dbo5 && val < dbo5) {
        return false
      }
      return true
    }, {
      message: "DQO debe ser mayor o igual a DBO5"
    }),

  sst: z
    .number()
    .min(0, "TSS cannot be negative")
    .max(5000, "Very high TSS value. Verify measurement."),

  // Flow parameters
  designFlow: z
    .number()
    .positive("Design flow must be greater than 0")
    .max(10000, "Exceptionally high flow. Verify the unit of measurement."),

  averageFlow: z
    .number()
    .positive("Average flow must be greater than 0")
    .refine((val, ctx) => {
      const designFlow = ctx?.designFlow as number
      if (designFlow && val > designFlow) {
        return false
      }
      return true
    }, {
      message: "Average flow must not exceed design flow"
    }),

  // Population and capacity
  populationServed: z
    .number()
    .int("Population must be an integer")
    .positive("Population must be greater than 0")
    .max(10000000, "Exceptionally high population"),

  // Operational parameters
  operationHours: z
    .number()
    .min(1, "Operating hours must be at least 1")
    .max(24, "Operating hours cannot exceed 24"),

  redundancy: z
    .number()
    .min(0, "Redundancy cannot be negative")
    .max(100, "Redundancy cannot exceed 100%"),

  // Treatment efficiency
  removalEfficiency: z
    .number()
    .min(0, "Efficiency cannot be negative")
    .max(100, "Efficiency cannot exceed 100%"),

  // Economic parameters
  budget: z
    .number()
    .positive("Budget must be greater than 0")
    .max(1000000000, "Exceptionally high budget"),

  // String validators with business rules
  treatmentType: z
    .string()
    .min(1, "Treatment type required")
    .refine((val) => {
      const validTypes = [
        "Conventional",
        "Advanced",
        "Compact",
        "Modular",
        "Direct Filtration",
        "Activated Sludge",
        "SBR",
        "UASB",
        "Ponds",
        "Wetlands"
      ]
      return validTypes.includes(val)
    }, {
      message: "Select a valid treatment type"
    }),

  regulatoryStandard: z
    .string()
    .min(1, "Regulatory standard required")
    .refine((val) => {
      const validStandards = [
        "WHO Guidelines",
        "EPA Standards",
        "EU Directive",
        "Local Standards",
        "ISO 14046",
        "CONAGUA Mexico",
        "AyA Costa Rica"
      ]
      return validStandards.some(std => val.includes(std))
    }, {
      message: "Specify a recognized regulatory standard"
    })
}

// Composite validators for related fields
export const compositeValidators = {
  flowConsistency: (data: { designFlow?: number; averageFlow?: number; peakFlow?: number }) => {
    const { designFlow, averageFlow, peakFlow } = data

    if (averageFlow && designFlow && averageFlow > designFlow) {
      return { success: false, error: "Average flow must not exceed design flow" }
    }

    if (peakFlow && designFlow && peakFlow > designFlow * 3) {
      return { success: false, error: "Peak flow unusually high compared to design" }
    }

    return { success: true }
  },

  waterQualityConsistency: (data: { dbo5?: number; dqo?: number; sst?: number }) => {
    const { dbo5, dqo, sst } = data

    if (dbo5 && dqo && dqo < dbo5) {
      return { success: false, error: "COD must be greater than or equal to BOD5" }
    }

    if (dbo5 && sst && sst > dbo5 * 2 && dbo5 > 100) {
      return { success: false, error: "Unusual TSS/BOD5 ratio for wastewater" }
    }

    return { success: true }
  }
}

// Field validation helper
export const validateField = (
  fieldId: string,
  value: any,
  context?: Record<string, any>
) => {
  const validator = fieldValidators[fieldId as keyof typeof fieldValidators]

  if (!validator) {
    // Generic validation for unknown fields
    if (typeof value === 'string' && value.trim() === '') {
      return { success: false, error: "Required field" }
    }
    if (typeof value === 'number' && (isNaN(value) || !isFinite(value))) {
      return { success: false, error: "Invalid numeric value" }
    }
    return { success: true }
  }

  try {
    const result = validator.parse(value)
    return { success: true, value: result }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message || "Invalid value"
      }
    }
    return { success: false, error: "Validation error" }
  }
}

// Batch validation for multiple fields
export const validateFields = (
  fields: Record<string, any>,
  context?: Record<string, any>
) => {
  const results: Record<string, { success: boolean; error?: string; value?: any }> = {}

  for (const [fieldId, value] of Object.entries(fields)) {
    results[fieldId] = validateField(fieldId, value, { ...context, ...fields })
  }

  // Run composite validations
  const flowResult = compositeValidators.flowConsistency(fields)
  if (!flowResult.success) {
    results._flowConsistency = flowResult
  }

  const qualityResult = compositeValidators.waterQualityConsistency(fields)
  if (!qualityResult.success) {
    results._qualityConsistency = qualityResult
  }

  return results
}