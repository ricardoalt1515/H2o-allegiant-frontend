export interface DetectedField {
  originalName: string
  detectedType: "number" | "text" | "date" | "boolean"
  confidence: number // 0-100
  suggestedMapping?: string
  value: any
  unit?: string
  context?: string
}

export interface ImportAnalysis {
  fileName: string
  fileType: string
  totalFields: number
  detectedFields: DetectedField[]
  confidence: number
  suggestions: string[]
  warnings: string[]
}

export interface MappingRule {
  sourceField: string
  targetSectionId: string
  targetFieldId: string
  confidence: number
  transformation?: "unit_conversion" | "format_change" | "calculation"
  notes?: string
}

export interface ImportPreview {
  analysis: ImportAnalysis
  mappingRules: MappingRule[]
  previewData: Record<string, any>
  conflicts: Array<{
    field: string
    existingValue: any
    newValue: any
    recommendation: "keep_existing" | "use_new" | "merge"
  }>
}

// Engineering-aware field patterns
const FIELD_PATTERNS = {
  // Flow parameters (optional - for specific templates)
  caudal: {
    patterns: [/caud[ai]l/i, /flow/i, /q[\s_]*d/i, /gasto/i],
    targetField: "design-flow",
    section: "general-data", // Not in base template, used by specific templates
    units: ["L/s", "m³/d", "L/min", "m³/h"],
    confidence: 90
  },
  poblacion: {
    patterns: [/poblac/i, /population/i, /habitantes/i, /hab/i, /people/i],
    targetField: "population-served",
    section: "general-data", // Not in base template, used by Municipal templates
    units: ["hab", "personas"],
    confidence: 85
  },

  // Water quality parameters
  ph: {
    patterns: [/ph/i, /potencial.*hidrogeno/i],
    targetField: "ph",
    section: "water-quality",
    units: [""],
    confidence: 95
  },
  turbidez: {
    patterns: [/turbid/i, /turbiedad/i, /ntu/i],
    targetField: "turbidity",
    section: "water-quality",
    units: ["NTU", "mg/L"],
    confidence: 90
  },
  dbo: {
    patterns: [/dbo\s*5?/i, /bod\s*5?/i, /demanda.*oxigeno/i],
    targetField: "bod5",
    section: "water-quality",
    units: ["mg/L"],
    confidence: 90
  },
  dqo: {
    patterns: [/dqo/i, /cod/i, /demanda.*quimica/i],
    targetField: "cod",
    section: "water-quality",
    units: ["mg/L"],
    confidence: 90
  },
  sst: {
    patterns: [/sst/i, /tss/i, /solidos.*suspendidos/i, /suspended.*solids/i],
    targetField: "tss",
    section: "water-quality",
    units: ["mg/L"],
    confidence: 85
  },
  temperatura: {
    patterns: [/temp/i, /temperatura/i, /temperature/i],
    targetField: "temperature",
    section: "water-quality",
    units: ["°C", "°F"],
    confidence: 80
  },

  // Treatment objectives (can be added to any section dynamically)
  eficiencia: {
    patterns: [/eficienc/i, /removal/i, /remocion/i, /%/],
    targetField: "target-efficiency",
    section: "water-quality", // Can be added dynamically
    units: ["%"],
    confidence: 75
  }
}

export class SmartImportEngine {
  static analyzeFile(fileName: string, fileContent: string | Record<string, any>): ImportAnalysis {
    const fileType = this.getFileType(fileName)
    let detectedFields: DetectedField[] = []
    let suggestions: string[] = []
    let warnings: string[] = []

    if (typeof fileContent === "string") {
      detectedFields = this.parseTextContent(fileContent)
    } else {
      detectedFields = this.parseStructuredData(fileContent)
    }

    // Analyze detected fields for engineering context
    detectedFields = this.enhanceWithEngineeringContext(detectedFields)

    // Generate suggestions
    suggestions = this.generateSuggestions(detectedFields, fileType)
    warnings = this.generateWarnings(detectedFields)

    const overallConfidence = detectedFields.length > 0
      ? detectedFields.reduce((sum, field) => sum + field.confidence, 0) / detectedFields.length
      : 0

    return {
      fileName,
      fileType,
      totalFields: detectedFields.length,
      detectedFields,
      confidence: Math.round(overallConfidence),
      suggestions,
      warnings
    }
  }

  static generateMappingRules(analysis: ImportAnalysis): MappingRule[] {
    const rules: MappingRule[] = []

    analysis.detectedFields.forEach(field => {
      const mapping = this.findBestMapping(field)
      if (mapping) {
        rules.push({
          sourceField: field.originalName,
          targetSectionId: mapping.section,
          targetFieldId: mapping.targetField,
          confidence: mapping.confidence,
          transformation: this.needsTransformation(field, mapping) ? "unit_conversion" : undefined,
          notes: mapping.notes
        })
      }
    })

    return rules.sort((a, b) => b.confidence - a.confidence)
  }

  static createImportPreview(
    analysis: ImportAnalysis,
    existingData: Record<string, any>
  ): ImportPreview {
    const mappingRules = this.generateMappingRules(analysis)
    const previewData: Record<string, any> = {}
    const conflicts: ImportPreview["conflicts"] = []

    mappingRules.forEach(rule => {
      const sourceField = analysis.detectedFields.find(f => f.originalName === rule.sourceField)
      if (!sourceField) return

      const targetKey = `${rule.targetSectionId}.${rule.targetFieldId}`
      let value = sourceField.value

      // Apply transformations if needed
      if (rule.transformation === "unit_conversion") {
        value = this.convertUnits(value, sourceField.unit, targetKey)
      }

      previewData[targetKey] = value

      // Check for conflicts with existing data
      const existingValue = existingData[targetKey]
      if (existingValue && existingValue !== value) {
        conflicts.push({
          field: rule.targetFieldId,
          existingValue,
          newValue: value,
          recommendation: this.getConflictRecommendation(existingValue, value, rule.confidence)
        })
      }
    })

    return {
      analysis,
      mappingRules,
      previewData,
      conflicts
    }
  }

  private static getFileType(fileName: string): string {
    const extension = fileName.split('.').pop()?.toLowerCase()
    switch (extension) {
      case 'xlsx':
      case 'xls':
        return 'Excel'
      case 'pdf':
        return 'PDF'
      case 'csv':
        return 'CSV'
      case 'json':
        return 'JSON'
      default:
        return 'Unknown'
    }
  }

  private static parseTextContent(content: string): DetectedField[] {
    const fields: DetectedField[] = []
    const lines = content.split('\n')

    lines.forEach((line, index) => {
      // Look for key-value patterns
      const patterns = [
        /([^:=]+)[:=]\s*([^,\n]+)/g,
        /([A-Za-z\s]+)\s+(\d+\.?\d*)\s*([A-Za-z/%]*)/g
      ]

      patterns.forEach(pattern => {
        let match
        while ((match = pattern.exec(line)) !== null) {
          const [, key, value, unit] = match

          if (this.isValidParameter(key, value)) {
            fields.push({
              originalName: key.trim(),
              detectedType: this.detectValueType(value),
              confidence: 70,
              value: this.parseValue(value),
              unit: unit?.trim() || undefined,
              context: `Línea ${index + 1}: ${line.trim()}`
            })
          }
        }
      })
    })

    return fields
  }

  private static parseStructuredData(data: Record<string, any>): DetectedField[] {
    const fields: DetectedField[] = []

    const traverse = (obj: any, prefix = '') => {
      Object.entries(obj).forEach(([key, value]) => {
        const fullKey = prefix ? `${prefix}.${key}` : key

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          traverse(value, fullKey)
        } else if (this.isValidParameter(key, value)) {
          fields.push({
            originalName: fullKey,
            detectedType: this.detectValueType(value),
            confidence: 80,
            value: this.parseValue(value),
            context: `Estructura: ${fullKey}`
          })
        }
      })
    }

    traverse(data)
    return fields
  }

  private static enhanceWithEngineeringContext(fields: DetectedField[]): DetectedField[] {
    return fields.map(field => {
      const bestMatch = this.findBestPatternMatch(field.originalName)

      if (bestMatch) {
        return {
          ...field,
          suggestedMapping: `${bestMatch.section}.${bestMatch.targetField}`,
          confidence: Math.max(field.confidence, bestMatch.confidence),
          unit: field.unit || this.suggestUnit(bestMatch.targetField)
        }
      }

      return field
    })
  }

  private static findBestPatternMatch(fieldName: string) {
    let bestMatch: any = null
    let bestScore = 0

    Object.entries(FIELD_PATTERNS).forEach(([key, pattern]) => {
      pattern.patterns.forEach(regex => {
        if (regex.test(fieldName)) {
          const score = pattern.confidence
          if (score > bestScore) {
            bestScore = score
            bestMatch = pattern
          }
        }
      })
    })

    return bestMatch
  }

  private static findBestMapping(field: DetectedField) {
    if (field.suggestedMapping) {
      const [section, targetField] = field.suggestedMapping.split('.')
      return {
        section,
        targetField,
        confidence: field.confidence,
        notes: `Auto-detectado como ${field.originalName}`
      }
    }

    return null
  }

  private static needsTransformation(field: DetectedField, mapping: any): boolean {
    if (!field.unit) return false

    const expectedUnits = FIELD_PATTERNS[mapping.targetField]?.units || []
    return expectedUnits.length > 0 && !expectedUnits.includes(field.unit)
  }

  private static convertUnits(value: number, fromUnit?: string, targetField?: string): number {
    if (!fromUnit || !targetField) return value

    // Flow conversions
    if (targetField.includes('flow')) {
      if (fromUnit === 'm³/d' && targetField === 'design-flow') {
        return value / 86.4 // Convert m³/d to L/s
      }
      if (fromUnit === 'L/min') {
        return value / 60 // Convert L/min to L/s
      }
    }

    // Temperature conversions
    if (fromUnit === '°F') {
      return (value - 32) * 5/9 // Convert °F to °C
    }

    return value
  }

  private static getConflictRecommendation(
    existingValue: any,
    newValue: any,
    confidence: number
  ): "keep_existing" | "use_new" | "merge" {
    if (confidence > 85) return "use_new"
    if (Math.abs(existingValue - newValue) / existingValue < 0.1) return "merge"
    return "keep_existing"
  }

  private static isValidParameter(key: string, value: any): boolean {
    if (!key || key.length < 2) return false
    if (value === null || value === undefined || value === '') return false

    const numValue = parseFloat(value)
    if (!isNaN(numValue)) {
      // Reasonable ranges for water treatment parameters
      if (numValue < 0 || numValue > 100000) return false
    }

    return true
  }

  private static detectValueType(value: any): "number" | "text" | "date" | "boolean" {
    if (typeof value === 'boolean') return "boolean"
    if (!isNaN(parseFloat(value))) return "number"
    if (Date.parse(value)) return "date"
    return "text"
  }

  private static parseValue(value: any): any {
    if (typeof value === 'string') {
      const num = parseFloat(value)
      if (!isNaN(num)) return num

      if (value.toLowerCase() === 'true') return true
      if (value.toLowerCase() === 'false') return false
    }

    return value
  }

  private static suggestUnit(fieldId: string): string | undefined {
    const unitMap: Record<string, string> = {
      'design-flow': 'L/s',
      'ph': '',
      'turbidity': 'NTU',
      'dbo5': 'mg/L',
      'dqo': 'mg/L',
      'sst': 'mg/L',
      'temperature': '°C',
      'population-served': 'hab'
    }

    return unitMap[fieldId]
  }

  private static generateSuggestions(fields: DetectedField[], fileType: string): string[] {
    const suggestions: string[] = []

    const mappedFields = fields.filter(f => f.suggestedMapping).length
    const totalFields = fields.length

    if (mappedFields === 0) {
      suggestions.push("No se detectaron campos técnicos estándar. Verifica el formato del archivo.")
    } else if (mappedFields < totalFields * 0.5) {
      suggestions.push("Mapeo parcial detectado. Algunos campos pueden requerir mapeo manual.")
    } else {
      suggestions.push(`Excelente: ${mappedFields} de ${totalFields} campos mapeados automáticamente.`)
    }

    if (fileType === 'PDF') {
      suggestions.push("Para PDFs, verifica que el texto sea seleccionable (no imagen escaneada).")
    }

    return suggestions
  }

  private static generateWarnings(fields: DetectedField[]): string[] {
    const warnings: string[] = []

    const lowConfidenceFields = fields.filter(f => f.confidence < 60)
    if (lowConfidenceFields.length > 0) {
      warnings.push(`${lowConfidenceFields.length} campos con baja confianza de mapeo.`)
    }

    const missingUnits = fields.filter(f => f.detectedType === 'number' && !f.unit)
    if (missingUnits.length > 0) {
      warnings.push(`${missingUnits.length} valores numéricos sin unidades detectadas.`)
    }

    return warnings
  }
}