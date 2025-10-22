"use client"

/**
 * Technical Term Tooltip Component
 * Shows explanation of technical terms with typical ranges and validation
 */

import { CheckCircle2, AlertCircle, Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { getTechnicalTerm, isInTypicalRange } from '@/lib/technical-glossary'
import { cn } from '@/lib/utils'

interface TechnicalTermTooltipProps {
  /** Technical term (e.g., "HRT", "MLSS") */
  term: string
  /** Current value (optional, for validation) */
  value?: number
  /** Unit override (optional) */
  unit?: string
  /** Children to wrap (if not provided, uses term as display) */
  children?: React.ReactNode
  /** Custom className for trigger */
  className?: string
}

export function TechnicalTermTooltip({
  term,
  value,
  unit,
  children,
  className,
}: TechnicalTermTooltipProps) {
  const termInfo = getTechnicalTerm(term)
  
  // If term not found in glossary, render without tooltip
  if (!termInfo) {
    return <span className={className}>{children || term}</span>
  }

  const inRange = value !== undefined ? isInTypicalRange(term, value, unit) : null

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={cn(
              'border-b border-dotted border-muted-foreground/50 cursor-help transition-colors hover:border-primary',
              className
            )}
          >
            {children || term}
          </span>
        </TooltipTrigger>
        
        <TooltipContent
          side="top"
          align="center"
          className="max-w-[340px] bg-popover p-4 text-sm shadow-lg"
          sideOffset={5}
        >
          <div className="space-y-3">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary shrink-0" />
                <p className="font-semibold text-foreground">
                  {termInfo.fullNameEs}
                </p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {termInfo.fullName} ({termInfo.term})
              </p>
            </div>

            {/* Explanation */}
            <p className="text-muted-foreground leading-relaxed">
              {termInfo.explanation}
            </p>

            {/* Typical Range & Validation */}
            {termInfo.typicalRange && (
              <div className="pt-2 border-t space-y-1.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Rango típico:</span>
                  <span className="font-medium text-foreground">
                    {termInfo.typicalRange}
                  </span>
                </div>

                {/* Show validation if value provided */}
                {value !== undefined && inRange !== null && (
                  <div className="flex items-center gap-2">
                    {inRange ? (
                      <>
                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                        <span className="text-xs text-green-600 font-medium">
                          Valor dentro del rango óptimo
                        </span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                        <span className="text-xs text-amber-600 font-medium">
                          Fuera del rango típico
                        </span>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Category badge */}
            <div className="pt-2 border-t">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {getCategoryLabel(termInfo.category)}
              </span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Helper to get category label in Spanish
 */
function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    hydraulic: 'Hidráulico',
    biological: 'Biológico',
    chemical: 'Químico',
    physical: 'Físico',
    operational: 'Operacional',
  }
  return labels[category] || category
}

/**
 * Convenience component for wrapping multiple terms in a paragraph
 */
interface TechnicalTextProps {
  /** Text with technical terms */
  text: string
  /** Map of term values for validation */
  values?: Record<string, number>
  /** Custom className */
  className?: string
}

export function TechnicalText({ text, values, className }: TechnicalTextProps) {
  // Find and wrap technical terms
  // This is a simple implementation - could be enhanced with regex
  const processedText: React.ReactNode[] = [text]
  
  // For now, return as is - implement term detection if needed
  return <span className={className}>{text}</span>
}

/**
 * Inline term with tooltip (for use in forms/specs)
 */
interface InlineTermProps {
  term: string
  value: number | string
  unit?: string
  label?: string
}

export function InlineTerm({ term, value, unit, label }: InlineTermProps) {
  const numericValue = typeof value === 'string' ? parseFloat(value) : value
  const displayValue = typeof value === 'number' ? value.toLocaleString() : value

  return (
    <div className="flex items-baseline gap-2">
      <TechnicalTermTooltip
        term={term}
        value={numericValue}
        unit={unit || undefined}
        className="text-sm font-medium"
      >
        {label || term}:
      </TechnicalTermTooltip>
      <span className="text-sm">
        {displayValue} {unit || ''}
      </span>
    </div>
  )
}
