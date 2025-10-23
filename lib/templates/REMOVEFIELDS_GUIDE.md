# 🗑️ removeFields - Guía Completa

**Feature**: Remover campos heredados en templates especializados

---

## 🎯 ¿Por qué removeFields?

### **Problema**

Cada sector/subsector tiene parámetros **diferentes** para calidad del agua:

| Template | Parámetros Relevantes |
|----------|----------------------|
| **Base (potable)** | pH, turbidity, TDS, hardness, temperature |
| **Food & Beverage** | pH, BOD, COD, FOG, TSS |
| **Oil & Gas** | pH, turbidity, TDS, oil-grease, chlorides |
| **Municipal** | pH, coliforms, chlorine, fluoride |

**Sin removeFields**: Templates heredarían TODOS los campos base (aunque no sean relevantes)

**Con removeFields**: ✅ Templates pueden eliminar campos irrelevantes

---

## 📝 Sintaxis

```typescript
{
  id: "water-quality",
  operation: "extend",
  
  // ❌ Quitar campos del base template
  removeFields: [
    "tds",
    "hardness",
    "turbidity"
  ],
  
  // ✅ Agregar campos nuevos
  addFields: [
    "bod5",
    "cod",
    "fats-oils-greases"
  ]
}
```

---

## 🔄 Cómo Funciona

### **Orden de Operaciones**

```
1. Hereda campos de template padre (base → sector → subsector)
2. Agrega nuevos campos (addFields)
3. Deduplica automáticamente
4. Remueve campos especificados (removeFields) ← ⭐
5. Resultado final
```

### **Ejemplo: Food & Beverage**

```typescript
// PASO 1: Base template
Water Quality: ["ph", "turbidity", "tds", "hardness", "temperature"]

// PASO 2: Industrial template (extends base)
Water Quality: ["ph", "turbidity", "tds", "hardness", "temperature"] 
             + ["bod5", "cod", "tss"]
= ["ph", "turbidity", "tds", "hardness", "temperature", "bod5", "cod", "tss"]

// PASO 3: Food template (extends industrial)
Water Quality: ["ph", "turbidity", "tds", "hardness", "temperature", "bod5", "cod", "tss"]
             + ["fats-oils-greases", "nitrogen-total", "phosphorus-total"]
             - ["tds", "hardness", "turbidity", "temperature"]  // ← removeFields
             
= ["ph", "bod5", "cod", "tss", "fats-oils-greases", "nitrogen-total", "phosphorus-total"]
✅ 7 campos optimizados para food industry
```

---

## 🎓 Casos de Uso

### **Caso 1: Agua Residual vs Potable**

```typescript
// Base template: Enfocado en agua potable
addFields: ["ph", "turbidity", "tds", "hardness", "chlorine-residual"]

// Industrial wastewater: NO necesita chlorine ni hardness
removeFields: ["chlorine-residual", "hardness"]
addFields: ["bod5", "cod", "tss"]
```

### **Caso 2: Parámetros por Industria**

```typescript
// Food & Beverage: Orgánicos, no minerales
removeFields: ["tds", "hardness", "iron", "manganese"]
addFields: ["bod5", "cod", "fats-oils-greases"]

// Textil: Color y químicos, no orgánicos
removeFields: ["bod5", "cod"]
addFields: ["color", "heavy-metals", "sulfates"]

// Oil & Gas: Hidrocarburos, no hardness
removeFields: ["hardness", "temperature"]
addFields: ["oil-grease", "chlorides", "sulfates"]
```

### **Caso 3: Escala del Proyecto**

```typescript
// Residential: Simple, parámetros básicos
removeFields: ["conductivity", "alkalinity", "silica"]
addFields: ["iron", "nitrates"]

// Industrial: Complejo, parámetros avanzados
removeFields: [] // Mantiene todos
addFields: ["heavy-metals", "sulfides", "phenols"]
```

---

## ⚠️ Reglas y Limitaciones

### **✅ Permitido**

```typescript
// Remover campos heredados del padre
removeFields: ["tds", "hardness"]  // ✅

// Remover y agregar diferentes campos
removeFields: ["turbidity"]
addFields: ["color"]  // ✅

// Remover en cualquier nivel de herencia
base → sector → subsector
                ↑ puede remover campos de base o sector
```

### **❌ No Permitido / No Necesario**

```typescript
// Remover un campo que no existe en el padre
removeFields: ["campo-inexistente"]  // ⚠️ No hace nada, pero no causa error

// Remover y luego agregar el mismo campo
removeFields: ["ph"]
addFields: ["ph"]  // ❌ Contradictorio, no hagas esto
// Mejor: usa fieldOverrides para cambiar comportamiento

// Remover campo y luego override
removeFields: ["ph"]
fieldOverrides: { "ph": { ... } }  // ❌ No tiene sentido
```

---

## 💡 Best Practices

### **1. Documenta por qué remueves**

```typescript
// ✅ BUENO: Explica el razonamiento
removeFields: [
  "hardness",    // Not relevant for wastewater treatment
  "turbidity",   // Less important than organic load
  "temperature"  // Not critical for biological treatment
],

// ❌ MALO: Sin contexto
removeFields: ["hardness", "turbidity", "temperature"],
```

### **2. Remueve solo lo REALMENTE irrelevante**

```typescript
// ✅ BUENO: Remueve solo campos sin valor
// Food industry: hardness no afecta biological treatment
removeFields: ["hardness", "tds"]

// ❌ MALO: Remueve demasiado
// pH es universal, NO remover
removeFields: ["ph", "hardness", "tds"]  // ❌ pH siempre es importante
```

### **3. Considera usar fieldOverrides en vez de remove**

```typescript
// Si un campo es MENOS importante, pero no irrelevante:

// ✅ MEJOR: Mantén el campo pero baja importancia
fieldOverrides: {
  "turbidity": {
    importance: "optional"  // En vez de "recommended"
  }
}

// ❌ Remover completamente
removeFields: ["turbidity"]  // Solo si REALMENTE no sirve
```

### **4. Agrupa removes por razón**

```typescript
removeFields: [
  // Drinking water parameters (not relevant for wastewater)
  "chlorine-residual",
  "fluoride",
  
  // Aesthetic parameters (less critical than organics)
  "color",
  "odor",
  
  // Mineral parameters (not priority for biological treatment)
  "hardness",
  "iron",
  "manganese"
],
```

---

## 🔍 Debugging

### **Ver qué campos se removieron**

El Template Engine muestra logs:

```typescript
const sections = applyTemplate("industrial-food", registry)

// Console output:
// 📋 Applying template: Industrial - Food & Beverage
//    Inheritance: Base Template → Industrial - General → Industrial - Food & Beverage
//    Section "water-quality": 
//      - Inherited: 5 fields from base
//      - Added: 6 fields from chain
//      - Removed: 4 fields (tds, hardness, turbidity, temperature)
//      - Final: 7 fields
// ✅ Template applied: 24 fields across 5 sections
```

### **Verificar campos finales**

```typescript
const registry = createTemplateRegistry()
const sections = applyTemplate("industrial-food", registry)

const waterQuality = sections.find(s => s.id === "water-quality")
console.log("Water Quality fields:", waterQuality?.fields.map(f => f.id))

// Output:
// ["ph", "bod5", "cod", "tss", "fats-oils-greases", "nitrogen-total", "phosphorus-total"]
```

---

## 🧪 Ejemplos Reales

### **Food & Beverage Template**

```typescript
{
  id: "water-quality",
  operation: "extend",
  
  // Wastewater focus: Remove drinking water parameters
  removeFields: [
    "tds",        // Dissolved solids not priority vs organics
    "hardness",   // Scaling not relevant for effluent
    "turbidity",  // Less important than BOD/COD
    "temperature" // Not critical for biological treatment
  ],
  
  // Add organic load parameters
  addFields: [
    "fats-oils-greases",  // Critical for food industry
    "nitrogen-total",
    "phosphorus-total"
  ]
}
```

**Resultado**: 7 campos optimizados para wastewater orgánico

---

### **Oil & Gas Template**

```typescript
{
  id: "water-quality",
  operation: "extend",
  
  // Focus on hydrocarbons and brine, not hardness
  removeFields: [
    "hardness",    // Not relevant for oil/gas wastewater
    "temperature"  // Not as critical as other parameters
  ],
  
  // Add oil & gas specific parameters
  addFields: [
    "fats-oils-greases",  // Petroleum hydrocarbons
    "chlorides",          // Brine from formation
    "sulfates"            // Sulfur compounds
  ]
}
```

**Resultado**: 9 campos optimizados para oil & gas

---

### **Hotel Template** (ejemplo futuro)

```typescript
{
  id: "water-quality",
  operation: "extend",
  
  // Drinking water focus: Remove wastewater parameters
  removeFields: [
    "bod5",  // Not relevant for potable water
    "cod",   // Not relevant for potable water
    "tss"    // Not relevant for potable water
  ],
  
  // Add premium quality parameters
  addFields: [
    "chlorine-residual",  // Guest comfort
    "iron",               // Staining prevention
    "silica"              // Boiler protection
  ]
}
```

**Resultado**: Parámetros de agua potable premium

---

## 📊 Comparación: Con vs Sin removeFields

### **Sin removeFields** (heredar todo)

```typescript
Food & Beverage tendría:
✅ pH, BOD, COD, FOG (relevante)
❌ TDS, hardness, turbidity, temperature (no relevante)
= 11 campos (4 innecesarios)
```

**Problema**: Ingenieros confundidos por campos irrelevantes

### **Con removeFields** (optimizado)

```typescript
Food & Beverage tiene:
✅ pH, BOD, COD, FOG (relevante)
= 7 campos (100% relevantes)
```

**Beneficio**: Formulario limpio y enfocado

---

## 🎯 Conclusión

`removeFields` es **esencial** para templates especializados porque:

1. ✅ **Cada industria necesita parámetros diferentes**
2. ✅ **Reduce ruido** (menos campos = más claro)
3. ✅ **Mejora UX** (solo campos relevantes)
4. ✅ **Mantiene herencia** (extend + remove = flexible)

**Regla de Oro**: 
> Remueve campos que **definitivamente NO son relevantes** para el subsector.
> Si hay duda, usa `fieldOverrides` para bajar importancia en vez de remover.

---

**Referencias**:
- Template Engine: `lib/templates/template-engine.ts` (línea 145-165)
- Ejemplo Food: `subsector-templates/food-processing.template.ts`
- Ejemplo Oil & Gas: `subsector-templates/oil-gas.template.ts`
