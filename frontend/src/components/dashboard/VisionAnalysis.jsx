import { useState } from "react"
import { Card, CardHeader, CardTitle, CardContent, Badge } from "../shared/ui"
import { Eye, ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../../lib/utils"

export function VisionAnalysis({ breakdown }) {
  const [isExpanded, setIsExpanded] = useState(true)

  const metrics = [
    { 
      label: "Shelf Density Index", 
      value: `${breakdown.shelf_density_index}/100`, 
      progress: breakdown.shelf_density_index,
      description: "Measure of shelf utilization and stock levels"
    },
    { 
      label: "SKU Diversity Score", 
      value: `${breakdown.sku_diversity_score}/10`, 
      progress: breakdown.sku_diversity_score * 10,
      description: "Variety of product categories detected"
    },
    { 
      label: "Store Size", 
      value: breakdown.store_size, 
      progress: null,
      description: "Estimated store footprint classification"
    },
    { 
      label: "Refill Signal", 
      value: breakdown.refill_signal?.replace(/_/g, " "), 
      progress: null,
      description: "Inventory restocking pattern detection"
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex w-full items-center justify-between"
        >
          <CardTitle className="flex items-center gap-2 text-base">
            <Eye className="h-5 w-5 text-accent" />
            Vision AI Analysis
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </span>
        </button>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-border bg-background p-4"
              >
                <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {metric.label}
                </p>
                <p className="mb-1 text-xl font-bold text-foreground">
                  {metric.value}
                </p>
                <p className="mb-2 text-xs text-muted-foreground">
                  {metric.description}
                </p>
                {metric.progress !== null && (
                  <div className="h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        metric.progress >= 70 ? "bg-success" : 
                        metric.progress >= 40 ? "bg-warning" : "bg-danger"
                      )}
                      style={{ width: `${metric.progress}%` }}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Category Mix */}
          {breakdown.category_mix?.length > 0 && (
            <div>
              <p className="mb-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Category Mix Detected
              </p>
              <div className="flex flex-wrap gap-2">
                {breakdown.category_mix.map((category, index) => (
                  <Badge key={index} variant="outline" className="font-mono">
                    {category}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Inventory Value */}
          {breakdown.estimated_inventory_value && (
            <div className="rounded-lg border border-accent/20 bg-accent/5 p-4">
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Estimated Inventory Value
              </p>
              <p className="font-mono text-2xl font-bold text-accent">
                {new Intl.NumberFormat("en-IN", { 
                  style: "currency", 
                  currency: "INR", 
                  maximumFractionDigits: 0 
                }).format(breakdown.estimated_inventory_value)}
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  )
}
