'use client'

import { useMemo } from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip as RechartsTooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import type { CostBreakdown } from '../types'

interface CostBreakdownDonutProps {
  breakdown: CostBreakdown | null | undefined
  total: number
  type?: 'CAPEX' | 'OPEX'
}

const CAPEX_COLORS = {
  equipment: '#3b82f6',      // blue
  civilWorks: '#10b981',    // green
  installationPiping: '#f59e0b', // amber
  engineeringSupervision: '#8b5cf6', // purple
  contingency: '#ef4444',    // red
}

export function CostBreakdownDonut({
  breakdown,
  total,
  type = 'CAPEX',
}: CostBreakdownDonutProps) {
  const chartData = useMemo(() => {
    if (!breakdown) return []

    const items = [
      { name: 'Equipment', value: breakdown.equipmentCost || 0, key: 'equipmentCost' },
      { name: 'Civil Works', value: breakdown.civilWorks || 0, key: 'civilWorks' },
      { name: 'Installation & Piping', value: breakdown.installationPiping || 0, key: 'installationPiping' },
      { name: 'Engineering & Supervision', value: breakdown.engineeringSupervision || 0, key: 'engineeringSupervision' },
      { name: 'Contingency', value: breakdown.contingency || 0, key: 'contingency' },
    ]

    // Filter out zero values and sort by value
    return items
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value)
  }, [breakdown])

  if (!breakdown || chartData.length === 0) {
    return null
  }

  // Get color for each segment
  const getColor = (dataKey: string): string => {
    const colorMap: Record<string, string> = {
      equipment: CAPEX_COLORS.equipment,
      civilWorks: CAPEX_COLORS.civilWorks,
      installationPiping: CAPEX_COLORS.installationPiping,
      engineeringSupervision: CAPEX_COLORS.engineeringSupervision,
      contingency: CAPEX_COLORS.contingency,
    }
    return colorMap[dataKey] || '#94a3b8'
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null
    const { value, name } = payload[0]
    const percent = ((value / total) * 100).toFixed(1)
    return (
      <div className="bg-background border rounded-lg shadow-lg p-3 space-y-1">
        <p className="font-semibold text-sm">{name}</p>
        <p className="text-sm">{formatCurrency(value)}</p>
        <p className="text-xs text-muted-foreground">{percent}% of total</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{type} Breakdown</CardTitle>
        <CardDescription>
          Total {type}: <span className="font-bold text-foreground">{formatCurrency(total)}</span>
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Donut Chart */}
        <div className="flex items-center justify-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getColor(entry.key)} />
                ))}
              </Pie>
              <RechartsTooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => <span className="text-sm">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Itemized Breakdown */}
        <div className="space-y-3 border-t pt-4">
          <h4 className="font-semibold text-sm">Itemized Breakdown</h4>
          <div className="space-y-2">
            {chartData.map((item, index) => {
              const percent = ((item.value / total) * 100).toFixed(1)
              return (
                <div key={`breakdown-${index}`} className="flex items-center gap-3">
                  {/* Color indicator */}
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: getColor(item.key) }}
                  />
                  {/* Item info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium truncate">{item.name}</span>
                      <span className="text-sm font-semibold text-muted-foreground">{percent}%</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden mt-1">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${percent}%`,
                          backgroundColor: getColor(item.key),
                        }}
                      />
                    </div>
                  </div>
                  {/* Amount */}
                  <span className="text-sm font-medium text-foreground whitespace-nowrap">
                    {formatCurrency(item.value)}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3 border-t pt-4 text-sm">
          <div className="text-center">
            <p className="text-muted-foreground text-xs mb-1">Largest Item</p>
            <p className="font-semibold">{chartData[0]?.name}</p>
          </div>
          <div className="text-center border-l border-r">
            <p className="text-muted-foreground text-xs mb-1">Items</p>
            <p className="font-semibold">{chartData.length}</p>
          </div>
          <div className="text-center">
            <p className="text-muted-foreground text-xs mb-1">Total</p>
            <p className="font-semibold">{formatCurrency(total)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
