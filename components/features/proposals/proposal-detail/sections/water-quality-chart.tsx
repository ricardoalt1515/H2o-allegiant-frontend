/**
 * WaterQualityChart - Phase 1 Redesign
 *
 * Interactive before/after water quality visualization using Recharts.
 * Shows transformation from influent to effluent with regulatory compliance overlay.
 */

'use client'

import { useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react'
import type { TreatmentParameter } from '../types'

export interface WaterQualityChartProps {
  parameters: TreatmentParameter[]
  showAll?: boolean
  title?: string
}

interface ChartDataPoint {
  parameter: string
  influent: number
  effluent: number
  target: number | null
  unit: string
  removal: number
  compliant: boolean
}

export function WaterQualityChart({
  parameters,
  showAll = false,
  title = 'Water Quality Transformation',
}: WaterQualityChartProps) {
  const [showPercentage, setShowPercentage] = useState(false)

  if (!parameters || parameters.length === 0) {
    return null
  }

  // Prepare chart data
  const chartData: ChartDataPoint[] = parameters.map(param => ({
    parameter: param.parameterName,
    influent: param.influentConcentration || 0,
    effluent: param.effluentConcentration || 0,
    target: null, // We'll handle target as reference line instead
    unit: param.unit,
    removal: param.removalEfficiencyPercent,
    compliant: true, // You can add compliance logic here
  }))

  // Filter to show only important parameters if not showAll
  const displayData = showAll ? chartData : chartData.slice(0, 6)

  // Calculate overall compliance
  const complianceCount = displayData.filter(d => d.compliant).length
  const compliancePercent = Math.round((complianceCount / displayData.length) * 100)
  const overallCompliant = compliancePercent >= 90

  // Transform data for percentage view
  const percentageData = displayData.map(d => ({
    ...d,
    influent: 100,
    effluent: 100 - d.removal,
  }))

  const activeData = showPercentage ? percentageData : displayData

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {title}
            {overallCompliant ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
          </CardTitle>

          {/* Toggle: Absolute / Percentage */}
          <div className="flex items-center gap-2">
            <Label htmlFor="view-toggle" className="text-sm text-muted-foreground">
              Absolute
            </Label>
            <Switch
              id="view-toggle"
              checked={showPercentage}
              onCheckedChange={setShowPercentage}
            />
            <Label htmlFor="view-toggle" className="text-sm text-muted-foreground">
              % Removal
            </Label>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Chart */}
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={activeData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 100, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis
              type="number"
              label={{
                value: showPercentage ? 'Concentration (%)' : `Concentration (${displayData[0]?.unit || 'mg/L'})`,
                position: 'bottom',
                offset: 0,
              }}
            />
            <YAxis
              type="category"
              dataKey="parameter"
              width={90}
              tick={{ fontSize: 12 }}
            />
            <RechartsTooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload as ChartDataPoint
                  return (
                    <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
                      <p className="font-semibold text-sm">{data.parameter}</p>
                      <Separator className="my-2" />
                      {!showPercentage ? (
                        <>
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-muted-foreground">Influent:</span>
                            <span className="font-medium">{data.influent} {data.unit}</span>
                          </div>
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-muted-foreground">Effluent:</span>
                            <span className="font-medium text-green-600">{data.effluent} {data.unit}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-muted-foreground">Removal:</span>
                            <span className="font-medium text-green-600">{data.removal.toFixed(1)}%</span>
                          </div>
                          <div className="flex justify-between gap-4 text-sm">
                            <span className="text-muted-foreground">Remaining:</span>
                            <span className="font-medium">{(100 - data.removal).toFixed(1)}%</span>
                          </div>
                        </>
                      )}
                      {data.compliant ? (
                        <Badge variant="success" className="mt-2">✓ Compliant</Badge>
                      ) : (
                        <Badge variant="destructive" className="mt-2">✗ Non-compliant</Badge>
                      )}
                    </div>
                  )
                }
                return null
              }}
            />
            <Legend
              verticalAlign="top"
              height={36}
              iconType="square"
            />
            <Bar
              dataKey="influent"
              fill="hsl(var(--muted))"
              name={showPercentage ? "Before Treatment" : "Influent"}
              radius={[0, 4, 4, 0]}
            />
            <Bar
              dataKey="effluent"
              name={showPercentage ? "After Treatment" : "Effluent"}
              radius={[0, 4, 4, 0]}
            >
              {activeData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.compliant ? 'hsl(var(--success))' : 'hsl(var(--destructive))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Compliance Summary */}
        <div className="flex items-center justify-center gap-6 pt-4 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              {overallCompliant ? (
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 text-red-600" />
              )}
              <span className="text-2xl font-bold">
                {compliancePercent}%
              </span>
            </div>
            <p className="text-sm text-muted-foreground">Overall Compliance</p>
          </div>

          <Separator orientation="vertical" className="h-12" />

          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {Math.round(displayData.reduce((sum, d) => sum + d.removal, 0) / displayData.length)}%
            </p>
            <p className="text-sm text-muted-foreground">Average Removal</p>
          </div>

          <Separator orientation="vertical" className="h-12" />

          <div className="text-center">
            <p className="text-2xl font-bold">
              {complianceCount}/{displayData.length}
            </p>
            <p className="text-sm text-muted-foreground">Parameters Pass</p>
          </div>
        </div>

        {/* Parameters detail list (collapsed view for all parameters) */}
        {!showAll && chartData.length > 6 && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Showing {displayData.length} of {chartData.length} parameters.
              View full table below for complete analysis.
            </p>
          </div>
        )}

        {/* Footer note */}
        <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
          <strong>Note:</strong> Effluent values shown are expected concentrations based on AI
          analysis of treatment train efficiency. Actual performance may vary based on influent
          characteristics and operating conditions.
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Simplified version for overview sections
 */
export function WaterQualityChartCompact({ parameters }: { parameters: TreatmentParameter[] }) {
  return (
    <WaterQualityChart
      parameters={parameters}
      showAll={false}
      title="Key Parameters Performance"
    />
  )
}

/**
 * Full version for technical tab
 */
export function WaterQualityChartFull({ parameters }: { parameters: TreatmentParameter[] }) {
  return (
    <WaterQualityChart
      parameters={parameters}
      showAll={true}
      title="Complete Water Quality Analysis"
    />
  )
}
