import { z } from "zod"

// Base schemas for common fields
export const positiveNumberSchema = z
  .number()
  .positive("Value must be greater than 0")

export const optionalPositiveNumberSchema = z
  .number()
  .positive("Value must be greater than 0")
  .optional()

export const nonEmptyStringSchema = z
  .string()
  .min(1, "This field is required")
  .trim()

export const optionalStringSchema = z
  .string()
  .trim()
  .optional()

// Project creation schema
export const createProjectSchema = z.object({
  name: nonEmptyStringSchema.max(100, "Project name cannot exceed 100 characters"),
  client: nonEmptyStringSchema.max(100, "Client name cannot exceed 100 characters"),
  sector: z.enum(["municipal", "industrial", "residential", "commercial", "other"], {
    errorMap: () => ({ message: "Select a valid sector" })
  }),
  subsector: z
    .string()
    .trim()
    .max(50, "Subsector cannot exceed 50 characters")
    .optional(),
  location: nonEmptyStringSchema.max(100, "Location cannot exceed 100 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),
  budget: optionalPositiveNumberSchema,
  tags: z.array(z.string()).optional().default([])
})

// Technical field schemas
export const technicalFieldSchema = z.object({
  id: z.string(),
  label: nonEmptyStringSchema,
  value: z.union([z.string(), z.number(), z.boolean()]).optional(),
  unit: optionalStringSchema,
  type: z.enum(["text", "number", "select", "textarea", "checkbox"]),
  required: z.boolean().default(false),
  source: z.enum(["manual", "import", "ai"]).default("manual"),
  options: z.array(z.string()).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    message: optionalStringSchema
  }).optional()
})

// Technical section schema
export const technicalSectionSchema = z.object({
  id: z.string(),
  title: nonEmptyStringSchema.max(100, "Title cannot exceed 100 characters"),
  fields: z.array(technicalFieldSchema),
  order: z.number().default(0),
  required: z.boolean().default(false)
})

// Critical fields validation (for conceptual proposal readiness)
export const criticalFieldsSchema = z.object({
  designFlow: positiveNumberSchema,
  populationServed: positiveNumberSchema,
  treatmentType: nonEmptyStringSchema,
  operationHours: positiveNumberSchema.min(1).max(24, "Operating hours cannot exceed 24")
})

// Water parameters schema
export const waterParametersSchema = z.object({
  ph: z.number().min(0).max(14, "pH must be between 0 and 14").optional(),
  turbidity: optionalPositiveNumberSchema,
  dbo5: optionalPositiveNumberSchema,
  dqo: optionalPositiveNumberSchema,
  sst: optionalPositiveNumberSchema,
  flow: positiveNumberSchema,
  temperature: z.number().min(-10).max(100, "Temperature out of valid range").optional(),
  conductivity: optionalPositiveNumberSchema,
  alkalinity: optionalPositiveNumberSchema,
  hardness: optionalPositiveNumberSchema
})

// Proposal generation schema
export const proposalGenerationSchema = z.object({
  projectId: z.string().min(1, "Project ID required"),
  includeNotes: z.boolean().default(true),
  detailLevel: z.enum(["conceptual", "detailed"]).default("conceptual"),
  templateId: optionalStringSchema,
  customParameters: z.record(z.any()).optional()
})

// Export types for use in components
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type TechnicalField = z.infer<typeof technicalFieldSchema>
export type TechnicalSection = z.infer<typeof technicalSectionSchema>
export type CriticalFields = z.infer<typeof criticalFieldsSchema>
export type WaterParameters = z.infer<typeof waterParametersSchema>
export type ProposalGenerationInput = z.infer<typeof proposalGenerationSchema>

// Validation helpers
export const validateProjectCreation = (data: unknown) => {
  return createProjectSchema.safeParse(data)
}

export const validateTechnicalField = (data: unknown) => {
  return technicalFieldSchema.safeParse(data)
}

export const validateCriticalFields = (data: unknown) => {
  return criticalFieldsSchema.safeParse(data)
}

export const validateWaterParameters = (data: unknown) => {
  return waterParametersSchema.safeParse(data)
}