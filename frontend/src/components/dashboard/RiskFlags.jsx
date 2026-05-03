import { Card, CardHeader, CardTitle, CardContent, Badge } from "../shared/ui"
import { AlertTriangle } from "lucide-react"
import { cn } from "../../lib/utils"

const FLAG_INFO = {
  inventory_footfall_mismatch: { label: "Inventory-Footfall Mismatch", severity: "high", description: "High inventory value in low-footfall area" },
  low_sku_diversity_high_inventory: { label: "Low SKU, High Inventory", severity: "medium", description: "Concentrated stock may indicate slow-movers" },
  high_competition_low_demand: { label: "High Competition, Low Demand", severity: "medium", description: "Competitive saturation reduces revenue potential" },
  underutilized_space: { label: "Underutilized Space", severity: "low", description: "Shelf density below 40% — store may be inactive" },
  limited_product_range: { label: "Limited Product Range", severity: "low", description: "Fewer than 3 distinct SKU categories" },
  poor_image_quality: { label: "Poor Image Quality", severity: "low", description: "Insufficient visual data for accurate analysis" },
  possible_staged_inventory: { label: "Possible Staged Inventory", severity: "high", description: "Overstocking pattern inconsistent with natural demand" },
  staged_inspection_likely: { label: "Staged Inspection Likely", severity: "critical", description: "Strong multi-signal fraud pattern detected" },
  inventory_store_size_mismatch: { label: "Inventory-Store Size Mismatch", severity: "high", description: "Inventory value disproportionate to store size" },
  suspiciously_perfect_scores: { label: "Suspiciously Perfect Scores", severity: "high", description: "Unrealistically high scores across all metrics" },
  high_competition_area_risk: { label: "High Competition Area Risk", severity: "medium", description: "Saturated market may constrain growth" },
  sdi_store_size_mismatch: { label: "SDI-Store Size Mismatch", severity: "medium", description: "Shelf density inconsistent with reported store size" },
}

const SEVERITY_STYLES = {
  critical: { badge: "danger", dot: "bg-danger" },
  high: { badge: "danger", dot: "bg-danger" },
  medium: { badge: "warning", dot: "bg-warning" },
  low: { badge: "secondary", dot: "bg-muted-foreground" },
}

export function RiskFlags({ flags }) {
  return (
    <Card className="border-danger/20 bg-danger/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base text-danger">
          <AlertTriangle className="h-5 w-5" />
          Risk Flags Detected ({flags.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {flags.map((flag, index) => {
          const info = FLAG_INFO[flag] || { 
            label: flag.replace(/_/g, " "), 
            severity: "low", 
            description: "Anomalous signal detected" 
          }
          const styles = SEVERITY_STYLES[info.severity] || SEVERITY_STYLES.low

          return (
            <div
              key={index}
              className="flex items-start gap-4 rounded-lg border border-danger/10 bg-card p-4"
            >
              <div className={cn("mt-1.5 h-2 w-2 flex-shrink-0 rounded-full", styles.dot)} />
              <div className="flex-1">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="font-medium text-foreground">{info.label}</span>
                  <Badge variant={styles.badge} className="uppercase">
                    {info.severity}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{info.description}</p>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
