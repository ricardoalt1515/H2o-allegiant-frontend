/**
 * removeFields DEMO - Prueba práctica
 * 
 * Este archivo demuestra cómo removeFields funciona en templates reales.
 * 
 * Ejecutar:
 * npx ts-node lib/templates/__tests__/removeFields-demo.ts
 */

import { applyTemplate, createTemplateRegistry } from "../template-engine"

console.log("🧪 DEMO: removeFields en Templates\n")
console.log("=" .repeat(60))

// Crear registry con todos los templates
const registry = createTemplateRegistry()

console.log("\n📋 Templates disponibles:")
for (const [id, template] of registry) {
  console.log(`  - ${id}: ${template.name}`)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEMO 1: BASE TEMPLATE
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n" + "━".repeat(60))
console.log("📌 DEMO 1: BASE TEMPLATE (Universal)")
console.log("━".repeat(60))

const baseSections = applyTemplate("base", registry)
const baseWaterQuality = baseSections.find(s => s.id === "water-quality")

console.log("\n✅ Water Quality campos (BASE):")
baseWaterQuality?.fields.forEach(f => {
  console.log(`   - ${f.id.padEnd(20)} | ${f.importance}`)
})
console.log(`\n📊 Total: ${baseWaterQuality?.fields.length} campos`)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEMO 2: INDUSTRIAL TEMPLATE (extends base)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n" + "━".repeat(60))
console.log("📌 DEMO 2: INDUSTRIAL TEMPLATE (extends base)")
console.log("━".repeat(60))

const industrialSections = applyTemplate("industrial", registry)
const industrialWaterQuality = industrialSections.find(s => s.id === "water-quality")

console.log("\n✅ Water Quality campos (INDUSTRIAL):")
industrialWaterQuality?.fields.forEach(f => {
  console.log(`   - ${f.id.padEnd(20)} | ${f.importance}`)
})
console.log(`\n📊 Total: ${industrialWaterQuality?.fields.length} campos`)
console.log("   ↑ Base (5) + Industrial (+3: bod5, cod, tss) = 8 campos")

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEMO 3: FOOD & BEVERAGE (extends industrial + removeFields)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n" + "━".repeat(60))
console.log("📌 DEMO 3: FOOD & BEVERAGE (removeFields en acción)")
console.log("━".repeat(60))

const foodSections = applyTemplate("industrial-food", registry)
const foodWaterQuality = foodSections.find(s => s.id === "water-quality")

console.log("\n⚠️  removeFields especificados:")
console.log("   - tds")
console.log("   - hardness")
console.log("   - turbidity")
console.log("   - temperature")

console.log("\n✅ Water Quality campos (FOOD & BEVERAGE):")
foodWaterQuality?.fields.forEach(f => {
  const value = f.value !== "" ? ` = ${f.value}` : ""
  const required = f.required ? " [REQUIRED]" : ""
  console.log(`   - ${f.id.padEnd(25)} | ${f.importance}${required}${value}`)
})
console.log(`\n📊 Total: ${foodWaterQuality?.fields.length} campos`)
console.log("   ↑ Base (5) + Industrial (+3) - removeFields (-4) + Food (+3) = 7 campos")

console.log("\n🎯 Campos REMOVIDOS (no aparecen):")
console.log("   ❌ tds        - Not relevant for wastewater")
console.log("   ❌ hardness   - Not relevant for effluent")
console.log("   ❌ turbidity  - Less important than organics")
console.log("   ❌ temperature - Not critical")

console.log("\n✨ Campos AGREGADOS:")
console.log("   ✅ fats-oils-greases - CRITICAL for food industry")
console.log("   ✅ nitrogen-total")
console.log("   ✅ phosphorus-total")

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// DEMO 4: OIL & GAS (extends industrial + different removeFields)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n" + "━".repeat(60))
console.log("📌 DEMO 4: OIL & GAS (diferentes removeFields)")
console.log("━".repeat(60))

const oilGasSections = applyTemplate("industrial-oil-gas", registry)
const oilGasWaterQuality = oilGasSections.find(s => s.id === "water-quality")

console.log("\n⚠️  removeFields especificados:")
console.log("   - hardness")
console.log("   - temperature")

console.log("\n✅ Water Quality campos (OIL & GAS):")
oilGasWaterQuality?.fields.forEach(f => {
  const value = f.value !== "" ? ` = ${f.value}` : ""
  const required = f.required ? " [REQUIRED]" : ""
  console.log(`   - ${f.id.padEnd(25)} | ${f.importance}${required}${value}`)
})
console.log(`\n📊 Total: ${oilGasWaterQuality?.fields.length} campos`)
console.log("   ↑ Base (5) + Industrial (+3) - removeFields (-2) + Oil&Gas (+3) = 9 campos")

console.log("\n🎯 Campos REMOVIDOS (diferentes a Food):")
console.log("   ❌ hardness   - Not relevant for oil/gas wastewater")
console.log("   ❌ temperature - Not as critical")

console.log("\n🔍 Campos MANTENIDOS (diferentes a Food):")
console.log("   ✅ tds - CRITICAL for brine/produced water (can be 50,000+ mg/L)")
console.log("   ✅ turbidity - Important for process water")

console.log("\n✨ Campos AGREGADOS:")
console.log("   ✅ fats-oils-greases - Petroleum hydrocarbons")
console.log("   ✅ chlorides - CRITICAL for brine")
console.log("   ✅ sulfates - Sulfur compounds")

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// COMPARACIÓN LADO A LADO
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n" + "━".repeat(60))
console.log("📊 COMPARACIÓN: Water Quality por Template")
console.log("━".repeat(60))

const templates = [
  { name: "Base", sections: baseSections },
  { name: "Industrial", sections: industrialSections },
  { name: "Food", sections: foodSections },
  { name: "Oil&Gas", sections: oilGasSections }
]

const allFields = new Set<string>()
templates.forEach(t => {
  const wq = t.sections.find(s => s.id === "water-quality")
  wq?.fields.forEach(f => allFields.add(f.id))
})

console.log("\n" + " ".repeat(25) + "| Base | Indus | Food | Oil&Gas")
console.log("-".repeat(60))

Array.from(allFields).sort().forEach(fieldId => {
  const base = baseSections.find(s => s.id === "water-quality")?.fields.find(f => f.id === fieldId)
  const industrial = industrialSections.find(s => s.id === "water-quality")?.fields.find(f => f.id === fieldId)
  const food = foodSections.find(s => s.id === "water-quality")?.fields.find(f => f.id === fieldId)
  const oilGas = oilGasSections.find(s => s.id === "water-quality")?.fields.find(f => f.id === fieldId)
  
  const row = fieldId.padEnd(25) + "| " +
    (base ? "✅   " : "❌   ") + "| " +
    (industrial ? "✅    " : "❌    ") + "| " +
    (food ? "✅   " : "❌   ") + "| " +
    (oilGas ? "✅     " : "❌     ")
  
  console.log(row)
})

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// RESUMEN
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
console.log("\n\n" + "━".repeat(60))
console.log("✅ CONCLUSIÓN")
console.log("━".repeat(60))

console.log("\n1️⃣  removeFields permite ELIMINAR campos heredados")
console.log("2️⃣  Cada subsector puede tener campos DIFERENTES")
console.log("3️⃣  Food removió: tds, hardness, turbidity, temperature")
console.log("4️⃣  Oil&Gas removió: hardness, temperature (mantiene tds, turbidity)")
console.log("5️⃣  Templates optimizados para cada industria ✨")

console.log("\n🎯 Resultado:")
console.log("   Base:        5 campos (general)")
console.log("   Industrial:  8 campos (+3 wastewater)")
console.log("   Food:        7 campos (-4 +3 organic)")
console.log("   Oil&Gas:     9 campos (-2 +3 hydrocarbons)")

console.log("\n" + "=".repeat(60))
console.log("✅ DEMO COMPLETADO\n")
