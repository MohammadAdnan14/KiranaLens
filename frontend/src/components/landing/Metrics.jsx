import { Card } from "../shared/ui"

const metrics = [
  { value: "<30s", label: "Analysis Time", description: "End-to-end processing" },
  { value: "11", label: "Fraud Signals", description: "Cross-validation points" },
  { value: "5", label: "Credit Tiers", description: "Recommendation levels" },
  { value: "2", label: "AI Models", description: "Vision + Geo fusion" },
]

export function Metrics() {
  return (
    <section id="metrics" className="border-t border-border/50 bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
            Performance Metrics
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Built for Scale
          </h2>
        </div>

        {/* Metrics Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {metrics.map((metric) => (
            <Card key={metric.label} className="p-8 text-center">
              <p className="mb-2 font-mono text-4xl font-bold text-accent">
                {metric.value}
              </p>
              <p className="mb-1 text-sm font-medium text-foreground">
                {metric.label}
              </p>
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
