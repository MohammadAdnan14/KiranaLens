import { Card } from "../shared/ui"
import { 
  Eye, 
  MapPinned, 
  Gauge, 
  ShieldAlert,
  Layers,
  TrendingUp
} from "lucide-react"

const features = [
  {
    icon: Eye,
    title: "Vision AI Analysis",
    description: "Gemini 2.5 Flash processes store imagery to extract shelf density index, SKU diversity scores, and inventory health indicators.",
    metrics: ["Shelf Density Index", "SKU Diversity Score", "Refill Signal Detection"],
  },
  {
    icon: MapPinned,
    title: "Geo-Intelligence Engine",
    description: "Google Maps Places API scores location viability through footfall potential, competition mapping, and demand forecasting.",
    metrics: ["Footfall Score", "Competition Density", "Market Saturation"],
  },
  {
    icon: Gauge,
    title: "Real-Time Cash Flow",
    description: "Fusion model generates institutional-grade cash flow estimates with daily, monthly, and annual revenue projections.",
    metrics: ["Daily Sales Range", "Monthly Revenue", "Net Margin Estimate"],
  },
  {
    icon: ShieldAlert,
    title: "11-Point Fraud Detection",
    description: "Cross-signal fraud engine identifies staged inventory, mismatched signals, and suspicious scoring patterns.",
    metrics: ["Staged Inventory Check", "Signal Consistency", "Pattern Analysis"],
  },
  {
    icon: Layers,
    title: "Bento Data Visualization",
    description: "Clean, institutional dashboards present underwriting data in scannable bento grid layouts with drill-down capabilities.",
    metrics: ["Store Profile Cards", "Risk Matrices", "Trend Charts"],
  },
  {
    icon: TrendingUp,
    title: "Credit Recommendation",
    description: "Five-tier credit scoring system from Approve to Reject with confidence percentages and detailed reasoning.",
    metrics: ["5-Tier Scoring", "Confidence Index", "Audit Trail"],
  },
]

export function Features() {
  return (
    <section id="features" className="py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
            Platform Capabilities
          </p>
          <h2 className="mb-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Dual AI Engine Architecture
          </h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            Combining computer vision and geospatial intelligence for comprehensive store assessment
          </p>
        </div>

        {/* Features Grid - Bento Layout */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={feature.title}
              className={`group p-6 transition-all hover:border-accent/30 ${
                index === 0 ? "md:col-span-2 lg:col-span-1" : ""
              }`}
            >
              {/* Icon */}
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card transition-colors group-hover:border-accent/30 group-hover:bg-accent/10">
                <feature.icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-accent" />
              </div>

              {/* Content */}
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                {feature.title}
              </h3>
              <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
                {feature.description}
              </p>

              {/* Metrics */}
              <div className="flex flex-wrap gap-2">
                {feature.metrics.map((metric) => (
                  <span
                    key={metric}
                    className="rounded-md border border-border/50 bg-background px-2 py-1 font-mono text-xs text-muted-foreground"
                  >
                    {metric}
                  </span>
                ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
