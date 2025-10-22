'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from '@/components/ui/carousel'
import { Factory, Droplet, Zap, DollarSign, Percent } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { ProvenCase } from '../types'

interface ProvenCasesCarouselProps {
  cases: ProvenCase[]
  compact?: boolean
}

const SECTOR_ICONS: Record<string, React.ReactNode> = {
  'Food & Beverage': <Factory className="h-5 w-5" />,
  'Textile': <Factory className="h-5 w-5" />,
  'Municipal': <Droplet className="h-5 w-5" />,
  'Pharmaceutical': <Factory className="h-5 w-5" />,
  'Chemical': <Factory className="h-5 w-5" />,
  'Brewery': <Factory className="h-5 w-5" />,
  'Dairy': <Factory className="h-5 w-5" />,
  'Default': <Factory className="h-5 w-5" />,
}

export function ProvenCasesCarousel({ cases, compact = false }: ProvenCasesCarouselProps) {
  const [selectedCase, setSelectedCase] = useState<ProvenCase | null>(null)

  if (!cases || cases.length === 0) {
    return null
  }

  const getSectorIcon = (sector: string): React.ReactNode => {
    return SECTOR_ICONS[sector] || SECTOR_ICONS['Default']
  }

  const getSimilarityColor = (score?: number): string => {
    if (!score) return 'bg-muted'
    if (score >= 0.85) return 'bg-green-500'
    if (score >= 0.70) return 'bg-amber-500'
    return 'bg-red-500'
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🏭 Proven Projects Consulted
          </CardTitle>
          <CardDescription>
            Real projects the AI used as reference for this design ({cases.length} cases)
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Carousel className="w-full">
            <CarouselContent className="-ml-2 md:-ml-4">
              {cases.map((caseItem, index) => (
                <CarouselItem key={`case-${index}`} className="pl-2 md:pl-4 md:basis-1/3">
                  <CaseCard
                    caseItem={caseItem}
                    onViewDetails={() => setSelectedCase(caseItem)}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:inline-flex -left-12" />
            <CarouselNext className="hidden md:inline-flex -right-12" />
          </Carousel>

          {/* Mobile navigation hint */}
          <p className="text-xs text-muted-foreground text-center mt-4 md:hidden">
            Swipe to explore more cases
          </p>
        </CardContent>
      </Card>

      {/* Case Detail Modal */}
      <Dialog open={!!selectedCase} onOpenChange={() => setSelectedCase(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getSectorIcon(selectedCase?.applicationType || '')}
              {selectedCase?.applicationType || 'Project Case Study'}
            </DialogTitle>
            <DialogDescription>
              {selectedCase?.treatmentTrain || 'Water treatment project'}
            </DialogDescription>
          </DialogHeader>

          {selectedCase && (
            <div className="space-y-6">
              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Flow Rate</p>
                  <p className="text-lg font-semibold">
                    {selectedCase.flowRate?.toLocaleString() || selectedCase.flowRange || 'N/A'} m³/day
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Treatment Train</p>
                  <p className="text-lg font-semibold">{selectedCase.treatmentTrain || 'Unknown'}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">CAPEX</p>
                  <p className="text-lg font-semibold">
                    {selectedCase.capexUsd ? formatCurrency(selectedCase.capexUsd) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Similarity to This Project</p>
                  <div className="flex items-center gap-2">
                    <Progress value={(selectedCase.similarityScore || 0) * 100} className="flex-1 h-2" />
                    <p className="text-lg font-semibold whitespace-nowrap">
                      {Math.round((selectedCase.similarityScore || 0) * 100)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Why This Case Matters */}
              <div className="bg-primary/5 rounded-lg p-4 border">
                <h4 className="font-semibold mb-2">Why This Case Matters</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This {selectedCase.applicationType} project demonstrates a similar treatment approach
                  ({selectedCase.treatmentTrain}) with comparable flow rates and requirements. The AI
                  used this as a reference point to validate equipment sizing, cost estimates, and
                  treatment train feasibility for your project.
                </p>
              </div>

              {/* Key Learnings */}
              <div>
                <h4 className="font-semibold mb-3">Key Data Points</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Application Type:</span>
                    <Badge variant="outline">{selectedCase.applicationType}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Treatment Train:</span>
                    <span className="font-medium">{selectedCase.treatmentTrain}</span>
                  </div>
                  {selectedCase.flowRate && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Design Flow:</span>
                      <span className="font-medium">{selectedCase.flowRate.toLocaleString()} m³/day</span>
                    </div>
                  )}
                  {selectedCase.capexUsd && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Project CAPEX:</span>
                      <span className="font-medium">{formatCurrency(selectedCase.capexUsd)}</span>
                    </div>
                  )}
                  {selectedCase.similarityScore && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Similarity Score:</span>
                      <span className="font-medium">{Math.round(selectedCase.similarityScore * 100)}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Confidence Note */}
              <div className="text-xs text-muted-foreground bg-muted/50 rounded-lg p-3 border">
                <strong>Transparency Note:</strong> This proven case was automatically selected by the AI
                based on similarity to your project parameters. The AI consulted multiple cases to validate
                its recommendations.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

/**
 * Individual case card component
 */
function CaseCard({
  caseItem,
  onViewDetails,
}: {
  caseItem: ProvenCase
  onViewDetails: () => void
}) {
  const similarityPercent = Math.round((caseItem.similarityScore || 0) * 100)

  return (
    <Card className="h-full cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all" onClick={onViewDetails}>
      <CardContent className="p-4 space-y-4 h-full flex flex-col">
        {/* Header */}
        <div>
          <Badge variant="secondary" className="mb-2">
            {caseItem.applicationType || 'Project'}
          </Badge>
          <h3 className="font-semibold text-sm line-clamp-2">{caseItem.treatmentTrain || 'Treatment Project'}</h3>
        </div>

        {/* Flow Rate */}
        <div>
          <p className="text-xs text-muted-foreground mb-1">Flow Rate</p>
          <p className="text-sm font-medium">
            {caseItem.flowRate?.toLocaleString() || caseItem.flowRange || 'N/A'} m³/day
          </p>
        </div>

        {/* CAPEX */}
        {caseItem.capexUsd && (
          <div>
            <p className="text-xs text-muted-foreground mb-1">CAPEX</p>
            <p className="text-sm font-medium">{formatCurrency(caseItem.capexUsd)}</p>
          </div>
        )}

        {/* Similarity Score */}
        <div className="mt-auto pt-2 border-t">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-muted-foreground">Match</p>
            <span className="text-xs font-semibold">{similarityPercent}%</span>
          </div>
          <Progress
            value={similarityPercent}
            className="h-2"
          />
        </div>

        {/* CTA */}
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-2"
          onClick={(e) => {
            e.stopPropagation()
            onViewDetails()
          }}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
