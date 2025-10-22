/**
 * Next Steps CTA Component
 * THE MOST CRITICAL COMPONENT - The $7,500 conversion button
 * 
 * TIER 1 - CRITICAL
 * This is where we convert users from free proposal to paid engineering
 */

"use client"

import React from 'react'
import {
  Rocket,
  FileText,
  Package,
  Calculator,
  Wrench,
  CheckCircle,
  CreditCard,
  Shield,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn, formatCurrency } from '@/lib/utils'

interface NextStepsCTAProps {
  capex: number
  provenCasesCount?: number
  estimatedSavings?: number
  onApprove: () => void
  onRequestChanges?: () => void
  onShare?: () => void
  className?: string
}

export function NextStepsCTA({
  capex,
  provenCasesCount = 0,
  estimatedSavings,
  onApprove,
  onRequestChanges,
  onShare,
  className,
}: NextStepsCTAProps) {
  // Calculate engineering price (5% of CAPEX, min $5,000, max $15,000)
  const engineeringPrice = Math.min(
    Math.max(capex * 0.05, 5000),
    15000
  )

  // Calculate estimated savings if not provided
  const savings = estimatedSavings || capex * 0.3 // Default: 30% savings

  const deliverables = [
    { icon: FileText, label: 'Complete P&IDs' },
    { icon: Package, label: 'BOM with exact specifications' },
    { icon: Calculator, label: 'Certified engineering calculations' },
    { icon: Wrench, label: 'Detailed technical specifications' },
    { icon: FileText, label: 'Installation drawings' },
    { icon: Package, label: 'Equipment quotation (free)' },
  ]

  return (
    <Card
      className={cn(
        'border-2 border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 shadow-lg',
        className
      )}
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <Badge className="bg-green-600 text-white hover:bg-green-700">
            ⭐ Most Popular
          </Badge>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>48-hour delivery</span>
          </div>
        </div>
        <CardTitle className="flex items-center gap-2 text-2xl">
          <Rocket className="h-6 w-6 text-primary" />
          Ready to continue?
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Turn this conceptual proposal into detailed engineering ready for
          construction
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Main Offer */}
        <div className="rounded-lg border-2 border-primary/30 bg-background p-6">
          <div className="mb-4 flex items-baseline justify-between">
            <div>
              <h3 className="text-lg font-semibold">Detailed Engineering</h3>
              <p className="text-xs text-muted-foreground">
                Complete engineering package
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-primary">
                {formatCurrency(engineeringPrice)}
              </div>
              <div className="text-xs text-muted-foreground">
                {((engineeringPrice / capex) * 100).toFixed(1)}% of CAPEX
              </div>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Deliverables Grid */}
          <div className="mb-6">
            <div className="mb-3 text-sm font-medium">What you'll receive:</div>
            <div className="grid gap-2 sm:grid-cols-2">
              {deliverables.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Value Props */}
          <div className="space-y-2 rounded-lg bg-green-500/10 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span>Included added value:</span>
            </div>
            <ul className="ml-6 space-y-1 text-xs text-green-700 dark:text-green-400">
              <li>• Estimated savings: {formatCurrency(savings)}+ on equipment</li>
              <li>• Vendor quotation at no additional cost</li>
              <li>• Technical support during construction</li>
              {provenCasesCount > 0 && (
                <li>
                  • Validated with {provenCasesCount} similar projects
                </li>
              )}
            </ul>
          </div>

          {/* CTA Button */}
          <Button
            size="lg"
            onClick={onApprove}
            className="mt-6 w-full bg-gradient-to-r from-green-600 to-green-700 text-base font-semibold shadow-lg hover:from-green-700 hover:to-green-800 hover:shadow-xl"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            Approve and Generate Engineering →
          </Button>

          {/* Trust Signals */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <CreditCard className="h-3 w-3" />
              <span>Secure payment</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              <span>Satisfaction guarantee</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>48h delivery</span>
            </div>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-wrap gap-2">
          {onRequestChanges && (
            <Button
              variant="outline"
              onClick={onRequestChanges}
              className="flex-1"
            >
              Request Changes
            </Button>
          )}
          {onShare && (
            <Button variant="outline" onClick={onShare} className="flex-1">
              Share with Team
            </Button>
          )}
        </div>

        {/* Fine Print */}
        <div className="text-center text-xs text-muted-foreground">
          <p>
            Upon approval, you will receive a secure payment link. Work begins
            immediately after confirmation.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
