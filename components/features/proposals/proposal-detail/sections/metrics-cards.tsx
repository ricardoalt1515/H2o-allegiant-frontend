/**
 * MetricsCards - Key metrics display (CAPEX, OPEX, Timeline, Area)
 *
 * Composable section using MetricCard atoms
 */

import { DollarSign, TrendingDown, Clock, Ruler } from 'lucide-react'
import { MetricCard } from '../atoms'
import { formatCurrency } from '@/lib/utils'
import type { MetricsCardsProps } from '../types'

export function MetricsCards({
  capex,
  opex,
  implementationMonths,
  requiredAreaM2,
  loading = false,
}: MetricsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <MetricCard
        label="CAPEX Total"
        value={formatCurrency(capex)}
        icon={<DollarSign className="h-5 w-5 text-primary" />}
        loading={loading}
      />

      <MetricCard
        label="OPEX Anual"
        value={formatCurrency(opex)}
        icon={<TrendingDown className="h-5 w-5 text-amber-500" />}
        loading={loading}
      />

      {implementationMonths !== undefined && implementationMonths > 0 && (
        <MetricCard
          label="Implementación"
          value={implementationMonths}
          unit={implementationMonths === 1 ? 'mes' : 'meses'}
          icon={<Clock className="h-5 w-5 text-blue-500" />}
          loading={loading}
        />
      )}

      {requiredAreaM2 !== undefined && requiredAreaM2 > 0 && (
        <MetricCard
          label="Área Requerida"
          value={requiredAreaM2.toFixed(0)}
          unit="m²"
          icon={<Ruler className="h-5 w-5 text-green-500" />}
          loading={loading}
        />
      )}
    </div>
  )
}
