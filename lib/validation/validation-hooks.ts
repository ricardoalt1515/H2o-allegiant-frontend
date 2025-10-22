import { useCallback, useMemo, useState } from "react"
import { validateField, validateFields } from "./field-validators"
import {
  validateProjectCreation,
  validateTechnicalField,
  validateCriticalFields,
  type CreateProjectInput,
  type TechnicalField,
  type CriticalFields
} from "./project-schemas"

// Hook for individual field validation
export function useFieldValidation(fieldId: string, context?: Record<string, any>) {
  const [error, setError] = useState<string | null>(null)
  const [isValid, setIsValid] = useState(true)

  const validate = useCallback((value: any) => {
    const result = validateField(fieldId, value, context)

    if (result.success) {
      setError(null)
      setIsValid(true)
      return { isValid: true, value: result.value }
    } else {
      setError(result.error || "Valor inválido")
      setIsValid(false)
      return { isValid: false, error: result.error }
    }
  }, [fieldId, context])

  const clearError = useCallback(() => {
    setError(null)
    setIsValid(true)
  }, [])

  return {
    error,
    isValid,
    validate,
    clearError
  }
}

// Hook for form validation
export function useFormValidation<T extends Record<string, any>>(
  initialData: T,
  validator: (data: unknown) => { success: boolean; data?: T; error?: any }
) {
  const [data, setData] = useState<T>(initialData)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isValid, setIsValid] = useState(false)

  const validateForm = useCallback((formData?: T) => {
    const dataToValidate = formData || data
    const result = validator(dataToValidate)

    if (result.success) {
      setErrors({})
      setIsValid(true)
      return { isValid: true, data: result.data }
    } else {
      const newErrors: Record<string, string> = {}

      if (result.error?.issues) {
        result.error.issues.forEach((issue: any) => {
          const path = issue.path.join('.')
          newErrors[path] = issue.message
        })
      }

      setErrors(newErrors)
      setIsValid(false)
      return { isValid: false, errors: newErrors }
    }
  }, [data, validator])

  const updateField = useCallback((field: keyof T, value: any) => {
    const newData = { ...data, [field]: value }
    setData(newData)

    // Validate immediately for better UX
    setTimeout(() => validateForm(newData), 100)
  }, [data, validateForm])

  const reset = useCallback(() => {
    setData(initialData)
    setErrors({})
    setIsValid(false)
  }, [initialData])

  return {
    data,
    errors,
    isValid,
    validateForm,
    updateField,
    reset,
    setData
  }
}

// Hook for project creation form
export function useProjectCreationForm(initialData?: Partial<CreateProjectInput>) {
  const defaultData: CreateProjectInput = {
    name: "",
    client: "",
    sector: "Municipal",
    location: "",
    subsector: "",
    description: "",
    budget: undefined,
    tags: []
  }

  return useFormValidation(
    { ...defaultData, ...initialData },
    validateProjectCreation
  )
}

// Hook for technical field validation with real-time feedback
export function useTechnicalFieldForm(field: TechnicalField) {
  const [value, setValue] = useState(field.value)
  const [error, setError] = useState<string | null>(null)
  const [isDirty, setIsDirty] = useState(false)

  const validate = useCallback((newValue?: any) => {
    const valueToValidate = newValue !== undefined ? newValue : value
    const result = validateTechnicalField({
      ...field,
      value: valueToValidate
    })

    if (result.success) {
      setError(null)
      return true
    } else {
      const errorMessage = result.error?.issues?.[0]?.message || "Valor inválido"
      setError(errorMessage)
      return false
    }
  }, [field, value])

  const updateValue = useCallback((newValue: any) => {
    setValue(newValue)
    setIsDirty(true)

    // Debounced validation for better performance
    const timeoutId = setTimeout(() => {
      validate(newValue)
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [validate])

  const reset = useCallback(() => {
    setValue(field.value)
    setError(null)
    setIsDirty(false)
  }, [field.value])

  return {
    value,
    error,
    isDirty,
    isValid: !error,
    updateValue,
    validate,
    reset
  }
}

// Hook for critical fields validation (conceptual proposal readiness)
export function useCriticalFieldsValidation() {
  const [fields, setFields] = useState<Partial<CriticalFields>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validation = useMemo(() => {
    return validateCriticalFields(fields)
  }, [fields])

  const isReady = validation.success

  const updateField = useCallback((key: keyof CriticalFields, value: any) => {
    setFields(prev => ({
      ...prev,
      [key]: value
    }))

    // Clear specific error when field is updated
    if (errors[key]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[key]
        return newErrors
      })
    }
  }, [errors])

  const validateAllFields = useCallback(() => {
    const result = validateCriticalFields(fields)

    if (!result.success && result.error?.issues) {
      const newErrors: Record<string, string> = {}
      result.error.issues.forEach((issue: any) => {
        const path = issue.path.join('.')
        newErrors[path] = issue.message
      })
      setErrors(newErrors)
    } else {
      setErrors({})
    }

    return result.success
  }, [fields])

  return {
    fields,
    errors,
    isReady,
    updateField,
    validateAllFields,
    requiredFields: ['designFlow', 'populationServed', 'treatmentType', 'operationHours'] as (keyof CriticalFields)[]
  }
}

// Hook for batch field validation (technical sections)
export function useBatchFieldValidation() {
  const [validationResults, setValidationResults] = useState<Record<string, any>>({})

  const validateSection = useCallback((fields: Record<string, any>) => {
    const results = validateFields(fields)
    setValidationResults(results)

    const hasErrors = Object.values(results).some(result => !result.success)
    return !hasErrors
  }, [])

  const getFieldError = useCallback((fieldId: string) => {
    return validationResults[fieldId]?.error || null
  }, [validationResults])

  const isFieldValid = useCallback((fieldId: string) => {
    return validationResults[fieldId]?.success !== false
  }, [validationResults])

  return {
    validateSection,
    getFieldError,
    isFieldValid,
    validationResults
  }
}