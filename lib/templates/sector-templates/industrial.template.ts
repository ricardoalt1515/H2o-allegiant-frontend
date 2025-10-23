/**
 * INDUSTRIAL SECTOR TEMPLATE
 * 
 * Base template for industrial projects (manufacturing, processing plants).
 * 
 * Extends base with:
 * - Operating hours and peak factor (more critical)
 * - Discharge regulations (usually stricter)
 * - Basic wastewater parameters (BOD, COD, TSS)
 * 
 * Subsector templates further customize this for specific industries.
 */

import type { TemplateConfig } from "../template-types"

export const INDUSTRIAL_TEMPLATE: TemplateConfig = {
  id: "industrial",
  name: "Industrial - General",
  description: "For manufacturing plants and industrial processes",
  sector: "industrial",
  extends: "base",
  complexity: "standard",
  estimatedTime: 20,
  tags: ["industrial", "manufacturing", "wastewater"],
  
  sections: [
    {
      id: "economics-scale",
      operation: "extend",
      addFields: [
        "operating-hours",  // Critical for industrial (continuous operation)
      ],
      fieldOverrides: {
        "peak-factor": {
          importance: "critical",  // More critical for industrial sizing
          defaultValue: 2.0  // Higher peaks in industrial
        }
      }
    },
    {
      id: "project-constraints",
      operation: "extend",
      fieldOverrides: {
        "regulatory-requirements": {
          importance: "critical",
          required: true,
          placeholder: "Industrial discharge often requires permits (NOM-001, EPA, etc.)"
        }
      }
    },
    {
      id: "water-quality",
      operation: "extend",
      addFields: [
        // Basic wastewater parameters (common to most industrial)
        "bod5",
        "cod",
        "tss"
      ],
      fieldOverrides: {
        "ph": {
          importance: "critical",
          required: true
        }
      }
    }
  ]
}
