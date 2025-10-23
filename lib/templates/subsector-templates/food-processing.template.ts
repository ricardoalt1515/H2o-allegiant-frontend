/**
 * FOOD PROCESSING / FOOD & BEVERAGE TEMPLATE
 * 
 * For food processing plants and beverage facilities.
 * 
 * Key characteristics:
 * - HIGH organic load (BOD, COD)
 * - Fats, oils, and grease (FOG) - CRITICAL
 * - pH control important
 * - Less concerned with hardness/TDS (not potable water focus)
 * 
 * ⭐ DEMONSTRATES removeFields:
 * Removes TDS, hardness, turbidity from base (not relevant for wastewater)
 * Adds BOD, COD, FOG, TSS (organic wastewater parameters)
 */

import type { TemplateConfig } from "../template-types"

export const FOOD_PROCESSING_TEMPLATE: TemplateConfig = {
  id: "industrial-food",
  name: "Industrial - Food & Beverage",
  description: "Food processing and beverage production facilities with high organic load",
  sector: "industrial",
  subsector: "food_processing",
  extends: "industrial",  // ✅ Extends industrial (which extends base)
  complexity: "advanced",
  estimatedTime: 25,
  tags: ["industrial", "food", "beverage", "organic-load", "FOG"],
  
  sections: [
    {
      id: "water-quality",
      operation: "extend",
      
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ⭐ REMOVE fields from base that aren't relevant
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      removeFields: [
        "tds",        // Total Dissolved Solids - not critical for wastewater
        "hardness",   // Hardness - not relevant for effluent
        "turbidity",  // Turbidity - less important than organic load
        "temperature" // Temperature - less critical
      ],
      
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // ✅ ADD fields specific to food & beverage wastewater
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      addFields: [
        // Organic load parameters (CRITICAL for food industry)
        // Note: BOD, COD, TSS already added by industrial template
        "fats-oils-greases",  // ⭐ FOG - CRITICAL for food processing
        "nitrogen-total",
        "phosphorus-total"
      ],
      
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      // Override defaults for food industry context
      // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      fieldOverrides: {
        "ph": {
          importance: "critical",
          required: true,
          description: "pH control critical for biological treatment"
        },
        "bod5": {
          defaultValue: 2500,  // High for food processing
          importance: "critical",
          required: true,
          description: "BOD typically 2000-5000 mg/L in food processing"
        },
        "cod": {
          defaultValue: 5000,  // High for food processing
          importance: "critical",
          required: true,
          description: "COD typically 3000-8000 mg/L in food processing"
        },
        "fats-oils-greases": {
          defaultValue: 200,
          importance: "critical",
          required: true,
          description: "FOG is critical parameter in food industry wastewater"
        },
        "tss": {
          defaultValue: 250,
          importance: "critical",
          description: "TSS from food particles and suspended organic matter"
        }
      }
    }
  ]
}

/**
 * RESULTING TEMPLATE for Food & Beverage:
 * 
 * Base (20 campos) 
 *   → Industrial (+3 campos: operating-hours, bod5, cod, tss)
 *     → Food (-4 campos: tds, hardness, turbidity, temperature)
 *       → Food (+3 campos: fats-oils-greases, nitrogen-total, phosphorus-total)
 * 
 * FINAL Water Quality section:
 * ✅ pH (from base, overridden)
 * ✅ BOD5 (from industrial, overridden)
 * ✅ COD (from industrial, overridden)
 * ✅ TSS (from industrial, overridden)
 * ✅ FOG (added, overridden)
 * ✅ Nitrogen (added)
 * ✅ Phosphorus (added)
 * 
 * ❌ TDS (removed)
 * ❌ Hardness (removed)
 * ❌ Turbidity (removed)
 * ❌ Temperature (removed)
 * 
 * = 7 water quality parameters optimized for food industry
 */
