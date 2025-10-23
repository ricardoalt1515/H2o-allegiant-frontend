/**
 * Template Engine Tests
 * 
 * Validates template system functionality
 */

import { applyTemplate, createTemplateRegistry, getTemplateForProject } from "../template-engine"
import { BASE_TEMPLATE } from "../base-template"
import type { TemplateConfig } from "../template-types"

describe("Template Engine", () => {
  describe("applyTemplate", () => {
    it("should apply base template correctly", () => {
      const registry = createTemplateRegistry()
      const sections = applyTemplate("base", registry)
      
      // Should have 5 sections
      expect(sections).toHaveLength(5)
      
      // Verify section IDs
      expect(sections[0].id).toBe("project-context")
      expect(sections[1].id).toBe("economics-scale")
      expect(sections[2].id).toBe("project-constraints")
      expect(sections[3].id).toBe("water-quality")
      expect(sections[4].id).toBe("field-notes")
      
      // Verify field counts (20 total)
      expect(sections[0].fields).toHaveLength(7)  // Project Context
      expect(sections[1].fields).toHaveLength(5)  // Economics & Scale
      expect(sections[2].fields).toHaveLength(2)  // Constraints
      expect(sections[3].fields).toHaveLength(5)  // Water Quality
      expect(sections[4].fields).toHaveLength(1)  // Field Notes
      
      // Total fields
      const totalFields = sections.reduce((sum, s) => sum + s.fields.length, 0)
      expect(totalFields).toBe(20)
    })
    
    it("should return empty array for non-existent template", () => {
      const registry = createTemplateRegistry()
      const sections = applyTemplate("non-existent", registry)
      
      expect(sections).toEqual([])
    })
    
    it("should materialize fields with metadata from parameter library", () => {
      const registry = createTemplateRegistry()
      const sections = applyTemplate("base", registry)
      
      // Find pH field in water-quality section
      const waterQualitySection = sections.find(s => s.id === "water-quality")
      const phField = waterQualitySection?.fields.find(f => f.id === "ph")
      
      expect(phField).toBeDefined()
      expect(phField?.label).toBe("pH")
      expect(phField?.type).toBe("number")
      expect(phField?.importance).toBe("critical")
      expect(phField?.required).toBe(true)
      expect(phField?.validationRule).toBeDefined()
    })
  })
  
  describe("createTemplateRegistry", () => {
    it("should create registry with base template", () => {
      const registry = createTemplateRegistry()
      
      expect(registry.size).toBeGreaterThanOrEqual(1)
      expect(registry.has("base")).toBe(true)
      expect(registry.get("base")).toEqual(BASE_TEMPLATE)
    })
  })
  
  describe("getTemplateForProject", () => {
    it("should return base template when no sector specified", () => {
      const registry = createTemplateRegistry()
      const template = getTemplateForProject(undefined, undefined, registry)
      
      expect(template).toEqual(BASE_TEMPLATE)
    })
    
    it("should return base template as fallback", () => {
      const registry = createTemplateRegistry()
      const template = getTemplateForProject("municipal", undefined, registry)
      
      // Should fallback to base since no municipal template exists yet
      expect(template).toEqual(BASE_TEMPLATE)
    })
  })
  
  describe("Template Inheritance (future)", () => {
    it("should support template inheritance when sector templates are added", () => {
      // TODO: Test when sector templates are implemented
      // This test will validate:
      // - Base → Sector inheritance
      // - Base → Sector → Subsector inheritance
      // - Field deduplication
      // - Override application
      
      expect(true).toBe(true)  // Placeholder
    })
  })
  
  describe("Section Operations (future)", () => {
    it("should support extend operation", () => {
      // TODO: Test extend operation
      // Should merge fields from base + extension
      
      expect(true).toBe(true)  // Placeholder
    })
    
    it("should support replace operation", () => {
      // TODO: Test replace operation
      // Should completely replace section
      
      expect(true).toBe(true)  // Placeholder
    })
    
    it("should support remove operation", () => {
      // TODO: Test remove operation
      // Should remove section from final output
      
      expect(true).toBe(true)  // Placeholder
    })
  })
})
