/**
 * Technical Glossary for Water Treatment Terms
 * Provides tooltips with explanations, typical ranges, and validation
 */

export interface TechnicalTerm {
  /** Short term/acronym (e.g., "HRT") */
  term: string
  /** Full name in English */
  fullName: string
  /** Full name in Spanish */
  fullNameEs: string
  /** Explanation in Spanish for engineers */
  explanation: string
  /** Typical range for the parameter */
  typicalRange?: string
  /** Unit of measurement */
  unit?: string
  /** Category for grouping */
  category: 'hydraulic' | 'biological' | 'chemical' | 'physical' | 'operational'
}

export const TECHNICAL_GLOSSARY: Record<string, TechnicalTerm> = {
  // Hydraulic Parameters
  HRT: {
    term: 'HRT',
    fullName: 'Hydraulic Retention Time',
    fullNameEs: 'Tiempo de Retención Hidráulico',
    explanation: 'Tiempo promedio que el agua permanece en el reactor. Es crítico para garantizar que los microorganismos tengan suficiente tiempo para degradar los contaminantes.',
    typicalRange: '18-36 horas',
    unit: 'horas',
    category: 'hydraulic',
  },
  
  SRT: {
    term: 'SRT',
    fullName: 'Solids Retention Time',
    fullNameEs: 'Tiempo de Retención de Sólidos',
    explanation: 'Tiempo promedio que los lodos biológicos permanecen en el sistema. Controla el crecimiento y edad de los microorganismos. Mayor SRT = mejor nitrificación.',
    typicalRange: '10-30 días',
    unit: 'días',
    category: 'biological',
  },

  // Biological Parameters
  MLSS: {
    term: 'MLSS',
    fullName: 'Mixed Liquor Suspended Solids',
    fullNameEs: 'Sólidos Suspendidos en el Licor Mezclado',
    explanation: 'Concentración de microorganismos y materia orgánica en el reactor biológico. Mayor MLSS = mayor capacidad de tratamiento pero requiere más aireación.',
    typicalRange: '2,500-5,000 mg/L',
    unit: 'mg/L',
    category: 'biological',
  },

  'F/M': {
    term: 'F/M',
    fullName: 'Food to Microorganism Ratio',
    fullNameEs: 'Relación Alimento/Microorganismos',
    explanation: 'Ratio de carga orgánica vs biomasa. Indica si los microorganismos tienen suficiente alimento. F/M bajo = alta edad de lodos, buena nitrificación.',
    typicalRange: '0.1-0.4 kgBOD/kgMLSS·d',
    unit: 'kgBOD/kgMLSS·d',
    category: 'biological',
  },

  OLR: {
    term: 'OLR',
    fullName: 'Organic Loading Rate',
    fullNameEs: 'Carga Orgánica Volumétrica',
    explanation: 'Cantidad de materia orgánica que ingresa al reactor por unidad de volumen y tiempo. Determina el tamaño del reactor necesario.',
    typicalRange: '0.5-2.5 kgBOD/m³·d',
    unit: 'kgBOD/m³·d',
    category: 'biological',
  },

  DO: {
    term: 'DO',
    fullName: 'Dissolved Oxygen',
    fullNameEs: 'Oxígeno Disuelto',
    explanation: 'Concentración de oxígeno en el agua del reactor. Los microorganismos aerobios requieren DO >2 mg/L para funcionar correctamente.',
    typicalRange: '2-4 mg/L',
    unit: 'mg/L',
    category: 'operational',
  },

  // Physical Parameters
  TSS: {
    term: 'TSS',
    fullName: 'Total Suspended Solids',
    fullNameEs: 'Sólidos Suspendidos Totales',
    explanation: 'Partículas sólidas en suspensión en el agua. Principal parámetro para evaluar claridad del efluente.',
    typicalRange: '< 30 mg/L efluente',
    unit: 'mg/L',
    category: 'physical',
  },

  TDS: {
    term: 'TDS',
    fullName: 'Total Dissolved Solids',
    fullNameEs: 'Sólidos Disueltos Totales',
    explanation: 'Minerales y sales disueltas en el agua. No se remueven en tratamiento biológico convencional.',
    typicalRange: 'Variable',
    unit: 'mg/L',
    category: 'physical',
  },

  // Chemical Parameters
  BOD: {
    term: 'BOD',
    fullName: 'Biological Oxygen Demand',
    fullNameEs: 'Demanda Biológica de Oxígeno',
    explanation: 'Cantidad de oxígeno que los microorganismos necesitan para degradar la materia orgánica biodegradable. Principal indicador de contaminación orgánica.',
    typicalRange: '< 30 mg/L descarga',
    unit: 'mg/L',
    category: 'chemical',
  },

  COD: {
    term: 'COD',
    fullName: 'Chemical Oxygen Demand',
    fullNameEs: 'Demanda Química de Oxígeno',
    explanation: 'Cantidad de oxígeno necesaria para oxidar químicamente toda la materia orgánica (biodegradable y no biodegradable). Siempre mayor que BOD.',
    typicalRange: '< 100 mg/L descarga',
    unit: 'mg/L',
    category: 'chemical',
  },

  'BOD/COD': {
    term: 'BOD/COD',
    fullName: 'BOD to COD Ratio',
    fullNameEs: 'Relación BOD/COD',
    explanation: 'Indica biodegradabilidad del agua. Ratio >0.5 = muy biodegradable (ideal para tratamiento biológico). Ratio <0.3 = requiere pretratamiento.',
    typicalRange: '0.4-0.8',
    unit: '',
    category: 'chemical',
  },

  'N-NH₃': {
    term: 'N-NH₃',
    fullName: 'Ammonia Nitrogen',
    fullNameEs: 'Nitrógeno Amoniacal',
    explanation: 'Nitrógeno en forma de amonio/amoníaco. Tóxico para vida acuática. Requiere nitrificación (conversión a nitrato) en SRT altos.',
    typicalRange: '< 10 mg/L descarga',
    unit: 'mg N-NH₃/L',
    category: 'chemical',
  },

  'N-NO₃': {
    term: 'N-NO₃',
    fullName: 'Nitrate Nitrogen',
    fullNameEs: 'Nitrógeno en Nitratos',
    explanation: 'Producto final de la nitrificación. Menos tóxico que amonio pero puede causar eutrofización. Se remueve por desnitrificación.',
    typicalRange: '< 15 mg/L',
    unit: 'mg N-NO₃/L',
    category: 'chemical',
  },

  'P-PO₄': {
    term: 'P-PO₄',
    fullName: 'Phosphate',
    fullNameEs: 'Fósforo en Fosfatos',
    explanation: 'Principal forma de fósforo en aguas residuales. Nutriente limitante que puede causar eutrofización. Se remueve por precipitación química o biológica.',
    typicalRange: '< 2 mg/L',
    unit: 'mg P-PO₄/L',
    category: 'chemical',
  },

  pH: {
    term: 'pH',
    fullName: 'pH',
    fullNameEs: 'Potencial de Hidrógeno',
    explanation: 'Medida de acidez/alcalinidad. Los microorganismos requieren pH entre 6.5-8.5 para funcionar óptimamente. pH fuera de rango inhibe el tratamiento.',
    typicalRange: '6.5-8.5',
    unit: '',
    category: 'chemical',
  },

  // Operational Parameters
  'MCRT': {
    term: 'MCRT',
    fullName: 'Mean Cell Residence Time',
    fullNameEs: 'Tiempo Medio de Residencia Celular',
    explanation: 'Similar a SRT. Tiempo promedio que una célula microbiana permanece en el sistema antes de ser purgada.',
    typicalRange: '10-30 días',
    unit: 'días',
    category: 'operational',
  },

  'SVI': {
    term: 'SVI',
    fullName: 'Sludge Volume Index',
    fullNameEs: 'Índice Volumétrico de Lodos',
    explanation: 'Mide la sedimentabilidad de los lodos. SVI alto indica lodos esponjosos (bulking) que no sedimentan bien. SVI <100 es ideal.',
    typicalRange: '50-150 mL/g',
    unit: 'mL/g',
    category: 'operational',
  },

  'RAS': {
    term: 'RAS',
    fullName: 'Return Activated Sludge',
    fullNameEs: 'Lodo Activado de Retorno',
    explanation: 'Lodo que se recircula del clarificador al reactor para mantener la concentración de microorganismos (MLSS). Típicamente 50-100% del caudal.',
    typicalRange: '50-100% Q',
    unit: '% del caudal',
    category: 'operational',
  },

  'WAS': {
    term: 'WAS',
    fullName: 'Waste Activated Sludge',
    fullNameEs: 'Lodo Activado de Purga',
    explanation: 'Lodo que se purga del sistema para controlar el SRT. La cantidad purgada determina la edad de los lodos.',
    typicalRange: '1-3% Q',
    unit: '% del caudal',
    category: 'operational',
  },
}

/**
 * Get technical term information
 */
export function getTechnicalTerm(term: string): TechnicalTerm | undefined {
  return TECHNICAL_GLOSSARY[term]
}

/**
 * Check if a value is within typical range
 */
export function isInTypicalRange(
  term: string,
  value: number,
  unit?: string
): boolean {
  const termInfo = getTechnicalTerm(term)
  if (!termInfo?.typicalRange) return true

  // Parse typical range (e.g., "18-36 horas" or "< 30 mg/L")
  const rangeMatch = termInfo.typicalRange.match(/(\d+)-(\d+)/)
  if (rangeMatch) {
    const [, min, max] = rangeMatch
    return value >= parseFloat(min) && value <= parseFloat(max)
  }

  const lessThanMatch = termInfo.typicalRange.match(/<\s*(\d+)/)
  if (lessThanMatch) {
    const [, max] = lessThanMatch
    return value <= parseFloat(max)
  }

  const greaterThanMatch = termInfo.typicalRange.match(/>\s*(\d+)/)
  if (greaterThanMatch) {
    const [, min] = greaterThanMatch
    return value >= parseFloat(min)
  }

  return true
}

/**
 * Format typical range for display
 */
export function formatTypicalRange(term: string): string {
  const termInfo = getTechnicalTerm(term)
  if (!termInfo?.typicalRange) return ''
  
  return `Rango típico: ${termInfo.typicalRange}`
}

/**
 * Get all terms by category
 */
export function getTermsByCategory(
  category: TechnicalTerm['category']
): TechnicalTerm[] {
  return Object.values(TECHNICAL_GLOSSARY).filter(
    (term) => term.category === category
  )
}

/**
 * Search terms by keyword
 */
export function searchTerms(keyword: string): TechnicalTerm[] {
  const lowerKeyword = keyword.toLowerCase()
  return Object.values(TECHNICAL_GLOSSARY).filter(
    (term) =>
      term.term.toLowerCase().includes(lowerKeyword) ||
      term.fullName.toLowerCase().includes(lowerKeyword) ||
      term.fullNameEs.toLowerCase().includes(lowerKeyword) ||
      term.explanation.toLowerCase().includes(lowerKeyword)
  )
}
