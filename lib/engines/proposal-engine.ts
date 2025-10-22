import type { ProjectSector } from "@/lib/project-types"

export interface ProposalGenerationStep {
  id: string
  title: string
  description: string
  duration: number // milliseconds
  status: "pending" | "running" | "completed" | "error"
}

export interface TechnologyOption {
  name: string
  type: "primary" | "secondary" | "tertiary"
  description: string
  pros: string[]
  cons: string[]
  efficiency: number // %
  complexity: "low" | "medium" | "high"
  footprint: "small" | "medium" | "large"
  energy: "low" | "medium" | "high"
}

export interface CostBreakdown {
  equipment: number
  construction: number
  engineering: number
  permits: number
  contingency: number
  total: number
}

export interface OperationalCost {
  energy: number
  chemicals: number
  labor: number
  maintenance: number
  total: number
}

export interface IntelligentProposal {
  id: string
  version: string
  reasoning: string[]
  selectedTechnology: TechnologyOption[]
  capex: CostBreakdown
  opex: OperationalCost
  timeline: {
    design: number // months
    construction: number
    commissioning: number
    total: number
  }
  assumptions: string[]
  risks: Array<{
    category: "technical" | "financial" | "regulatory" | "operational"
    risk: string
    probability: "low" | "medium" | "high"
    impact: "low" | "medium" | "high"
    mitigation: string
  }>
  performanceTargets: {
    parameter: string
    influent: number
    effluent: number
    removal: number
    unit: string
  }[]
  diagrams: {
    flowDiagram: string // SVG or description
    layout: string
  }
}

// Technology database
const TECHNOLOGY_CATALOG: Record<ProjectSector, TechnologyOption[]> = {
  Municipal: [
    {
      name: "Lodos Activados Convencional",
      type: "primary",
      description: "Sistema biológico aerobio con reactor de mezcla completa",
      pros: ["High efficiency", "Proven technology", "Flexible to variations"],
      cons: ["High energy consumption", "Requires specialized operator", "Produces biosolids"],
      efficiency: 95,
      complexity: "medium",
      footprint: "large",
      energy: "high"
    },
    {
      name: "Reactor UASB + Lodos Activados",
      type: "primary",
      description: "Anaerobic treatment followed by aerobic polishing",
      pros: ["Lower energy consumption", "Produces methane", "Lower sludge production"],
      cons: ["Temperature sensitive", "Slow startup", "Requires post-treatment"],
      efficiency: 90,
      complexity: "high",
      footprint: "medium",
      energy: "medium"
    },
    {
      name: "Lagunas Facultativas",
      type: "primary",
      description: "Sistema natural de lagunas en serie",
      pros: ["Bajo costo operativo", "Mínimo mantenimiento", "Robusto"],
      cons: ["Gran requerimiento de área", "Sensible al clima", "Menor eficiencia"],
      efficiency: 80,
      complexity: "low",
      footprint: "large",
      energy: "low"
    }
  ],
  Industrial: [
    {
      name: "Físico-Químico + Biológico",
      type: "primary",
      description: "Coagulation-flocculation followed by biological treatment",
      pros: ["Treats wide range of contaminants", "Flexible", "High efficiency"],
      cons: ["Alto costo químicos", "Produce lodos químicos", "Operación compleja"],
      efficiency: 92,
      complexity: "high",
      footprint: "medium",
      energy: "high"
    },
    {
      name: "Reactor SBR",
      type: "primary",
      description: "Reactor secuencial discontinuo",
      pros: ["Flexible operacionalmente", "Buena remoción nutrientes", "Compacto"],
      cons: ["Requiere automatización", "Operación compleja", "Inversión inicial alta"],
      efficiency: 88,
      complexity: "high",
      footprint: "small",
      energy: "medium"
    }
  ],
  Residential: [
    {
      name: "Reactor MBR",
      type: "primary",
      description: "Reactor biológico con membrana sumergida",
      pros: ["Excelente calidad efluente", "Compacto", "Apto para reuso"],
      cons: ["Alto costo membranas", "Ensuciamiento", "Consumo energético"],
      efficiency: 98,
      complexity: "high",
      footprint: "small",
      energy: "high"
    },
    {
      name: "Tanque Imhoff + Filtro",
      type: "primary",
      description: "Sedimentación y digestión seguida de filtración",
      pros: ["Simple operación", "Bajo costo", "Mínima electricidad"],
      cons: ["Eficiencia limitada", "Requiere área", "Olores potenciales"],
      efficiency: 75,
      complexity: "low",
      footprint: "medium",
      energy: "low"
    }
  ],
  Commercial: [
    {
      name: "Lodos Activados Compacto",
      type: "primary",
      description: "Sistema aerobio de alta carga en configuración compacta",
      pros: ["Eficiencia alta", "Relativamente compacto", "Operación estable"],
      cons: ["Consumo energético", "Requiere mantenimiento", "Produce lodos"],
      efficiency: 90,
      complexity: "medium",
      footprint: "small",
      energy: "medium"
    }
  ]
}

// Cost calculation engine
export class CostCalculationEngine {
  static calculateCAPEX(
    flow: number, // m3/d
    technology: TechnologyOption[],
    sector: ProjectSector
  ): CostBreakdown {
    const baseUnitCosts = {
      Municipal: { equipment: 800, construction: 1200 }, // USD/m3/d
      Industrial: { equipment: 1200, construction: 1800 },
      Residential: { equipment: 1500, construction: 2000 },
      Commercial: { equipment: 1000, construction: 1500 }
    }

    const costs = baseUnitCosts[sector]
    const complexity = technology.some(t => t.complexity === "high") ? 1.3 :
                     technology.some(t => t.complexity === "medium") ? 1.1 : 1.0

    const equipment = flow * costs.equipment * complexity
    const construction = flow * costs.construction * complexity
    const engineering = (equipment + construction) * 0.15
    const permits = (equipment + construction) * 0.05
    const contingency = (equipment + construction + engineering + permits) * 0.15

    const total = equipment + construction + engineering + permits + contingency

    return {
      equipment: Math.round(equipment),
      construction: Math.round(construction),
      engineering: Math.round(engineering),
      permits: Math.round(permits),
      contingency: Math.round(contingency),
      total: Math.round(total)
    }
  }

  static calculateOPEX(
    flow: number, // m3/d
    technology: TechnologyOption[],
    sector: ProjectSector
  ): OperationalCost {
    const energyIntensity = technology.some(t => t.energy === "high") ? 2.5 :
                           technology.some(t => t.energy === "medium") ? 1.5 : 0.8 // kWh/m3

    const energy = flow * energyIntensity * 365 * 0.12 // USD/year (0.12 USD/kWh)

    const chemicals = sector === "Industrial" ? flow * 365 * 0.8 : flow * 365 * 0.3 // USD/year

    const laborDays = technology.some(t => t.complexity === "high") ? 2 :
                      technology.some(t => t.complexity === "medium") ? 1 : 0.5
    const labor = laborDays * 365 * 50 // USD/year (50 USD/day)

    const maintenance = energy * 0.3 // 30% of energy cost

    const total = energy + chemicals + labor + maintenance

    return {
      energy: Math.round(energy),
      chemicals: Math.round(chemicals),
      labor: Math.round(labor),
      maintenance: Math.round(maintenance),
      total: Math.round(total)
    }
  }
}

// Intelligent proposal generator
export class IntelligentProposalGenerator {
  private sector: ProjectSector
  private technicalData: Record<string, any>

  constructor(sector: ProjectSector, technicalData: Record<string, any>) {
    this.sector = sector
    this.technicalData = technicalData
  }

  async generateProposal(): Promise<IntelligentProposal> {
    const reasoning: string[] = []
    const selectedTechnology: TechnologyOption[] = []

    // Analyze requirements
    const flow = this.technicalData.designFlow || 1000 // m3/d
    const dbo = this.technicalData.dbo || 250
    const population = this.technicalData.population

    reasoning.push(`Analyzing design flow: ${flow} m³/d`)
    reasoning.push(`Organic load (BOD): ${dbo} mg/L`)

    // Select primary technology
    const availableTech = TECHNOLOGY_CATALOG[this.sector]
    let primaryTech: TechnologyOption

    if (this.sector === "Municipal") {
      if (population && population > 50000) {
        primaryTech = availableTech.find(t => t.name.includes("Lodos Activados"))!
        reasoning.push("Población > 50,000 hab: recomendado lodos activados por eficiencia y confiabilidad")
      } else if (flow < 500) {
        primaryTech = availableTech.find(t => t.name.includes("Lagunas"))!
        reasoning.push("Caudal bajo: lagunas facultativas por bajo costo operativo")
      } else {
        primaryTech = availableTech.find(t => t.name.includes("UASB"))!
        reasoning.push("Caudal medio: UASB + aerobio por eficiencia energética")
      }
    } else if (this.sector === "Industrial") {
      if (dbo > 800) {
        primaryTech = availableTech.find(t => t.name.includes("Físico-Químico"))!
        reasoning.push("High BOD: physicochemical pretreatment necessary")
      } else {
        primaryTech = availableTech.find(t => t.name.includes("SBR"))!
        reasoning.push("DBO moderado: SBR por flexibilidad operacional")
      }
    } else if (this.sector === "Residential") {
      if (flow < 100) {
        primaryTech = availableTech.find(t => t.name.includes("Tanque Imhoff"))!
        reasoning.push("Caudal bajo residencial: Tanque Imhoff por simplicidad")
      } else {
        primaryTech = availableTech.find(t => t.name.includes("MBR"))!
        reasoning.push("Requerimiento alta calidad: MBR para posible reuso")
      }
    } else {
      primaryTech = availableTech[0]!
      reasoning.push("Standard technology for commercial sector")
    }

    selectedTechnology.push(primaryTech)

    // Add secondary treatment if needed
    if (dbo > 400 || this.technicalData.targetEfficiency > 90) {
      reasoning.push("Adding tertiary treatment due to strict requirements")
    }

    // Calculate costs
    const capex = CostCalculationEngine.calculateCAPEX(flow, selectedTechnology, this.sector)
    const opex = CostCalculationEngine.calculateOPEX(flow, selectedTechnology, this.sector)

    // Generate timeline
    const timeline = {
      design: Math.max(2, Math.ceil(flow / 1000) * 1.5),
      construction: Math.max(4, Math.ceil(flow / 500) * 2),
      commissioning: 2,
      total: 0
    }
    timeline.total = timeline.design + timeline.construction + timeline.commissioning

    reasoning.push(`Timeline estimado: ${timeline.total} meses total`)

    // Generate assumptions
    const assumptions = [
      "Análisis de laboratorio representativos del agua residual",
      "Disponibilidad de servicios básicos en sitio (electricidad, agua)",
      "Permisos ambientales gestionados por el cliente",
      `Operación 24 horas, factor de carga: 0.8`,
      "Costos en USD, año base 2024",
      "No incluye costo del terreno"
    ]

    // Generate risks
    const risks = [
      {
        category: "technical" as const,
        risk: "Variabilidad en calidad del agua residual",
        probability: "medium" as const,
        impact: "medium" as const,
        mitigation: "Tanque de ecualización y monitoreo continuo"
      },
      {
        category: "financial" as const,
        risk: "Incremento en costos de construcción",
        probability: "medium" as const,
        impact: "high" as const,
        mitigation: "Contingencia del 15% incluida en presupuesto"
      }
    ]

    // Performance targets
    const performanceTargets = [
      {
        parameter: "DBO5",
        influent: dbo,
        effluent: 20,
        removal: ((dbo - 20) / dbo) * 100,
        unit: "mg/L"
      },
      {
        parameter: "SST",
        influent: this.technicalData.sst || 200,
        effluent: 30,
        removal: 85,
        unit: "mg/L"
      }
    ]

    return {
      id: `prop_${Date.now()}`,
      version: "v1.0",
      reasoning,
      selectedTechnology,
      capex,
      opex,
      timeline,
      assumptions,
      risks,
      performanceTargets,
      diagrams: {
        flowDiagram: this.generateFlowDiagram(selectedTechnology),
        layout: "Preliminary layout available in detailed design stage"
      }
    }
  }

  private generateFlowDiagram(technology: TechnologyOption[]): string {
    const steps = [
      "Agua Residual Cruda",
      "Pretreatment (screens, grit chamber)",
      ...technology.map(t => t.name),
      "Desinfección",
      "Efluente Tratado"
    ]

    return steps.join(" → ")
  }

  static getGenerationSteps(): ProposalGenerationStep[] {
    return [
      {
        id: "analysis",
        title: "Analyzing technical data",
        description: "Evaluating flows, loads and treatment objectives",
        duration: 2000,
        status: "pending"
      },
      {
        id: "technology",
        title: "Selecting technologies",
        description: "Comparing options based on technical and economic criteria",
        duration: 3000,
        status: "pending"
      },
      {
        id: "calculations",
        title: "Ejecutando cálculos deterministas",
        description: "Dimensionamiento hidráulico y estimación de costos",
        duration: 2500,
        status: "pending"
      },
      {
        id: "optimization",
        title: "Optimizing configuration",
        description: "Adjusting design for optimal efficiency and cost",
        duration: 2000,
        status: "pending"
      },
      {
        id: "documentation",
        title: "Generando documentación",
        description: "Preparando memoria técnica y especificaciones",
        duration: 1500,
        status: "pending"
      }
    ]
  }
}