/**
 * OIL & GAS TEMPLATE
 * 
 * For oil & gas exploration, production, and refining operations.
 * 
 * Based on engineer's questionnaire - includes ONLY the 5 essential parameters:
 * 1. pH
 * 2. SDT (Sólidos Disueltos Totales / TDS)
 * 3. Sólidos Suspendidos (TSS)
 * 4. Hidrocarburos (TPH - Total Petroleum Hydrocarbons)
 * 5. Metales Pesados (Heavy Metals)
 * 
 * Additional parameters (BOD, COD, chlorides, sulfates, etc.) are available
 * in parameter-library and can be added manually by user if needed.
 */

import type { TemplateConfig } from "../template-types"

export const OIL_GAS_TEMPLATE: TemplateConfig = {
  id: "industrial-oil-gas",
  name: "Industrial - Oil & Gas",
  description: "Oil & gas with 5 essential parameters per engineer's questionnaire",
  sector: "industrial",
  subsector: "oil_gas",
  extends: "base",  // ✅ Extends base directly (not industrial)
  complexity: "standard",
  estimatedTime: 20,
  tags: ["industrial", "oil", "gas", "petroleum", "hydrocarbons", "tph"],
  icon: "🛢️",
  
  sections: [
    {
      id: "water-quality",
      operation: "extend",
      
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ⭐ REMOVE non-essential fields from base template
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      removeFields: [
        "turbidity",    // Not in engineer's questionnaire
        "hardness",     // Not in engineer's questionnaire
        "temperature"   // Not in engineer's questionnaire
      ],
      
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ✅ ADD the essential fields per engineer's questionnaire
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      addFields: [
        // From base: pH ✅, TDS ✅ (already included)
        
        // Add Oil & Gas specific (per questionnaire):
        "tss",           // 3. Sólidos Suspendidos
        "tph",           // 4. Hidrocarburos (TPH)
        
        // 5. Metales Pesados (individual fields for better structure)
        "cadmium",       // Cd
        "chromium",      // Cr
        "lead",          // Pb
        "mercury"        // Hg
      ],
      
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Override defaults for oil & gas context
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      fieldOverrides: {
        "ph": {
          importance: "critical",
          required: true,
          description: "pH crítico para tratamiento y control de corrosión"
        },
        "tds": {
          importance: "critical",
          required: true,
          description: "SDT - Sólidos Disueltos Totales, muy alto en agua producida (brine)"
        },
        "tss": {
          importance: "critical",
          required: true,
          defaultValue: 250,
          description: "Sólidos Suspendidos del agua residual de oil & gas"
        },
        "tph": {
          importance: "critical",
          required: true,
          description: "Hidrocarburos Totales de Petróleo - requerimiento regulatorio"
        },
        "cadmium": {
          importance: "critical",
          required: false,
          description: "Cadmio - metal pesado altamente tóxico, estrictamente regulado"
        },
        "chromium": {
          importance: "critical",
          required: false,
          description: "Cromo total - incluye Cr(III) y Cr(VI)"
        },
        "lead": {
          importance: "critical",
          required: false,
          description: "Plomo - metal pesado tóxico, común en aguas industriales"
        },
        "mercury": {
          importance: "critical",
          required: false,
          description: "Mercurio - extremadamente tóxico y bioacumulativo"
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
          placeholder: "Oil & gas requiere permisos de descarga (EPA, SEMARNAT, NOM-001, etc.)"
        },
        "constraints": {
          importance: "critical",
          description: "Restricciones comunes: sensibilidad ambiental, ubicación remota, alto TDS"
        }
      }
    }
  ]
}

/**
 * RESULTING TEMPLATE for Oil & Gas:
 * 
 * Base (5 campos water quality)
 *   → Oil & Gas (-3: turbidity, hardness, temperature)
 *   → Oil & Gas (+6: tss, tph, cadmium, chromium, lead, mercury)
 * 
 * FINAL Water Quality section (8 parámetros):
 * ✅ pH - CRÍTICO
 * ✅ TDS (SDT - Sólidos Disueltos Totales) - CRÍTICO
 * ✅ TSS (Sólidos Suspendidos) - CRÍTICO
 * ✅ TPH (Hidrocarburos Totales de Petróleo) - CRÍTICO
 * ✅ Cadmium (Cd) - CRÍTICO
 * ✅ Chromium (Cr) - CRÍTICO
 * ✅ Lead (Pb) - CRÍTICO
 * ✅ Mercury (Hg) - CRÍTICO
 * 
 * ❌ Turbidity (removed - not in questionnaire)
 * ❌ Hardness (removed - not in questionnaire)
 * ❌ Temperature (removed - not in questionnaire)
 * 
 * = 8 water quality parameters (3 basic + 1 hydrocarbons + 4 heavy metals)
 * 
 * NOTE: Other parameters like BOD, COD, Chlorides, Sulfates, etc. are available
 * in parameter-library and can be added manually by user if needed for specific case.
 */
