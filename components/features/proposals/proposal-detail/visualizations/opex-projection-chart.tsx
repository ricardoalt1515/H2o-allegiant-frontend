'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'

interface OPEXBreakdown {
  electricalEnergy?: number
  chemicals?: number
  personnel?: number
  maintenanceSpareParts?: number
}

interface OpexProjectionChartProps {
  annualOpex: number
  breakdown?: OPEXBreakdown
  projectionYears?: number
}

const CATEGORY_COLORS = {
  electricalEnergy: '#f59e0b',      // amber
  chemicals: '#06b6d4',              // cyan
  personnel: '#8b5cf6',              // purple
  maintenanceSpareParts: '#ef4444', // red
}

const CATEGORY_LABELS = {
  electricalEnergy: 'Electrical Energy',
  chemicals: 'Chemicals',
  personnel: 'Personnel',
  maintenanceSpareParts: 'Maintenance & Spare Parts',
}

export function OpexProjectionChart({
  annualOpex,
  breakdown,
  projectionYears = 5,
}: OpexProjectionChartProps) {
  const chartData = useMemo(() => {
    const data = []
    const categories = Object.entries(breakdown || {})
      .filter(([, value]) => value && value > 0)
      .map(([key]) => key)

    for (let year = 1; year <= projectionYears; year++) {
      const dataPoint: any = {
        year: `Year ${year}`,
        total: annualOpex * year,
      }

      // Add category breakdowns (assume constant annual cost)
      categories.forEach((category) => {
        dataPoint[category] = (breakdown?.[category as keyof OPEXBreakdown] || 0) * year
      })

      data.push(dataPoint)
    }

    return data
  }, [annualOpex, breakdown, projectionYears])

  if (!breakdown || Object.values(breakdown).every((v) => !v || v === 0)) {
    return null
  }

  const categories = Object.entries(breakdown)
    .filter(([, value]) => value && value > 0)
    .map(([key]) => key)

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 space-y-2">
        <p className="font-semibold text-sm">{payload[0]?.payload.year}</p>
        {payload
          .sort((a: any, b: any) => b.value - a.value)
          .map((entry: any, index: number) => (
            <div key={index} className="text-sm">
              <span style={{ color: entry.color }} className="font-medium">
                {entry.name}:
              </span>
              <span className="ml-2">{formatCurrency(entry.value)}</span>
            </div>
          ))}
        <div className="border-t pt-1 mt-2">
          <p className="font-semibold text-sm">
            Total: {formatCurrency(payload[0]?.payload.total)}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>OPEX Projection ({projectionYears}-Year)</CardTitle>
        <CardDescription>
          Annual operational costs: <span className="font-bold text-foreground">{formatCurrency(annualOpex)}/yr</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Stacked Bar Chart */}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="year" />
            <YAxis
              label={{ value: 'Annual Cost (USD)', angle: -90, position: 'insideLeft' }}
              tickFormatter={(value) => `$${Math.round(value / 1000)}K`}
            />
            <RechartsTooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              formatter={(value) =>
                CATEGORY_LABELS[value as keyof typeof CATEGORY_LABELS] || value
              }
            />

            {categories.map((category, index) => (
              <Bar
                key={category}
                dataKey={category}
                stackId="opex"
                fill={CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]}
                name={CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                radius={index === categories.length - 1 ? [8, 8, 0, 0] : undefined}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>

        {/* Category Breakdown */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-semibold text-sm">Annual Cost Breakdown</h4>
          <div className="space-y-2">
            {categories.map((category, index) => {
              const value = breakdown[category as keyof OPEXBreakdown] || 0
              const percent = ((value / annualOpex) * 100).toFixed(1)
              return (
                <div key={`category-${index}`} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{
                      backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">
                        {CATEGORY_LABELS[category as keyof typeof CATEGORY_LABELS]}
                      </span>
                      <span className="text-sm font-semibold text-muted-foreground">{percent}%</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS],
                        }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {formatCurrency(value)}/yr
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* 5-year total */}
        <div className="bg-primary/5 rounded-lg p-4 border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">5-Year Total OPEX Cost</p>
              <p className="text-2xl font-bold">
                {formatCurrency(annualOpex * projectionYears)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground mb-1">Average per Year</p>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(annualOpex)}/yr
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
