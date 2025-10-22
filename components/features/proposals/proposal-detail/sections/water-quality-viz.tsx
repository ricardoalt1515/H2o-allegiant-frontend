/**
 * WaterQualityViz - Visual display of water parameter transformations
 *
 * Shows before → after with parameter bars
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Droplets, Info } from 'lucide-react'
import { ParameterBar } from '../atoms'
import type { WaterQualityVizProps } from '../types'

export function WaterQualityViz({
  parameters,
  showTargets = true,
  compact = false,
}: WaterQualityVizProps) {
  if (!parameters || parameters.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          No se proporcionaron datos de eficiencia de tratamiento del agente.
        </AlertDescription>
      </Alert>
    )
  }

  // Filter out parameters with zero removal or missing data
  const validParameters = parameters.filter(
    p => p.removalEfficiencyPercent > 0 &&
         p.influentConcentration !== undefined &&
         p.effluentConcentration !== undefined
  )

  if (validParameters.length === 0) {
    return (
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Datos de transformación de agua incompletos del agente.
        </AlertDescription>
      </Alert>
    )
  }

  if (compact) {
    return (
      <div className="space-y-4">
        {validParameters.map((param) => (
          <ParameterBar
            key={param.parameterName}
            parameter={param.parameterName}
            influent={param.influentConcentration!}
            effluent={param.effluentConcentration!}
            removalPercent={param.removalEfficiencyPercent}
            unit={param.unit}
            showCompliance={false}
          />
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Droplets className="h-5 w-5 text-primary" />
          <CardTitle>Transformación de Calidad del Agua</CardTitle>
        </div>
        <CardDescription>
          Eficiencia de remoción de contaminantes del sistema propuesto
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {validParameters.map((param) => (
          <ParameterBar
            key={param.parameterName}
            parameter={param.parameterName}
            influent={param.influentConcentration!}
            effluent={param.effluentConcentration!}
            removalPercent={param.removalEfficiencyPercent}
            unit={param.unit}
            showCompliance={showTargets}
          />
        ))}

        {/* Summary note */}
        <div className="pt-4 border-t text-xs text-muted-foreground">
          ✓ Valores basados en análisis del agente de IA considerando características específicas del proyecto
        </div>
      </CardContent>
    </Card>
  )
}
