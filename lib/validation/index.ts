// Schema exports
export * from './project-schemas'

// Field validators exports
export * from './field-validators'

// Validation hooks exports
export * from './validation-hooks'

// Common validation utilities
export const ValidationUtils = {
  // Check if value is empty
  isEmpty: (value: any): boolean => {
    if (value === null || value === undefined) return true
    if (typeof value === 'string') return value.trim() === ''
    if (typeof value === 'number') return isNaN(value)
    if (Array.isArray(value)) return value.length === 0
    return false
  },

  // Format validation error message
  formatErrorMessage: (fieldName: string, error: string): string => {
    return `${fieldName}: ${error}`
  },

  // Check if all required fields are present
  hasRequiredFields: (data: Record<string, any>, requiredFields: string[]): boolean => {
    return requiredFields.every(field => !ValidationUtils.isEmpty(data[field]))
  },

  // Get completion percentage based on filled fields
  getCompletionPercentage: (data: Record<string, any>, totalFields: string[]): number => {
    if (totalFields.length === 0) return 0

    const filledFields = totalFields.filter(field => !ValidationUtils.isEmpty(data[field]))
    return Math.round((filledFields.length / totalFields.length) * 100)
  },

  // Sanitize string input
  sanitizeString: (value: string): string => {
    return value?.trim().replace(/\s+/g, ' ') || ''
  },

  // Normalize numeric input
  normalizeNumber: (value: any): number | undefined => {
    if (value === null || value === undefined || value === '') return undefined
    const num = Number(value)
    return isNaN(num) ? undefined : num
  }
}