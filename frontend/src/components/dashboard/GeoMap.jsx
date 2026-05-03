import { Card, CardHeader, CardTitle, CardContent, Badge } from "../shared/ui"
import { MapPin, Users, Store, TrendingUp } from "lucide-react"
import { cn } from "../../lib/utils"

export function GeoMap({ lat, lng, geoBreakdown }) {
  // Default breakdown if not provided
  const breakdown = geoBreakdown || {
    footfall_score: 65,
    competition_density: "moderate",
    demand_signal: "stable",
    nearby_competitors: 4,
  }

  const metrics = [
    {
      icon: Users,
      label: "Footfall Score",
      value: `${breakdown.footfall_score || 65}/100`,
      progress: breakdown.footfall_score || 65,
    },
    {
      icon: Store,
      label: "Competition Density",
      value: breakdown.competition_density || "Moderate",
      badge: true,
    },
    {
      icon: TrendingUp,
      label: "Demand Signal",
      value: breakdown.demand_signal || "Stable",
      badge: true,
    },
    {
      icon: MapPin,
      label: "Nearby Competitors",
      value: `${breakdown.nearby_competitors || 4} stores`,
      sublabel: "within 800m radius",
    },
  ]

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <MapPin className="h-5 w-5 text-accent" />
          Geo-Intelligence Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Map Placeholder - Grayscale style */}
          <div className="relative overflow-hidden rounded-lg border border-border bg-card">
            <div className="aspect-video">
              {/* Grayscale map visualization */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
                {/* Grid overlay */}
                <div 
                  className="absolute inset-0 opacity-20"
                  style={{
                    backgroundImage: `
                      linear-gradient(to right, #475569 1px, transparent 1px),
                      linear-gradient(to bottom, #475569 1px, transparent 1px)
                    `,
                    backgroundSize: "40px 40px",
                  }}
                />
                
                {/* Center pin */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                  <div className="relative">
                    <div className="h-4 w-4 rounded-full bg-accent shadow-lg" />
                    <div className="absolute inset-0 animate-ping rounded-full bg-accent opacity-75" />
                  </div>
                </div>

                {/* Radius circle */}
                <div 
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-dashed border-accent/30"
                  style={{ width: "200px", height: "200px" }}
                />

                {/* Competitor dots */}
                {[
                  { x: "30%", y: "40%" },
                  { x: "70%", y: "35%" },
                  { x: "65%", y: "65%" },
                  { x: "25%", y: "60%" },
                ].map((pos, i) => (
                  <div
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-warning/70"
                    style={{ left: pos.x, top: pos.y }}
                  />
                ))}
              </div>

              {/* Coordinates overlay */}
              <div className="absolute bottom-3 left-3 rounded border border-border bg-card/90 px-2 py-1 font-mono text-xs text-muted-foreground">
                {lat?.toFixed(4) || "21.1458"}, {lng?.toFixed(4) || "79.0882"}
              </div>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid gap-3 sm:grid-cols-2">
            {metrics.map((metric) => (
              <div
                key={metric.label}
                className="rounded-lg border border-border bg-background p-4"
              >
                <div className="mb-2 flex items-center gap-2">
                  <metric.icon className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {metric.label}
                  </span>
                </div>
                {metric.badge ? (
                  <Badge variant="outline" className="font-medium capitalize">
                    {metric.value}
                  </Badge>
                ) : (
                  <>
                    <p className="text-lg font-bold text-foreground">{metric.value}</p>
                    {metric.sublabel && (
                      <p className="text-xs text-muted-foreground">{metric.sublabel}</p>
                    )}
                  </>
                )}
                {metric.progress && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-border">
                    <div
                      className={cn(
                        "h-full rounded-full",
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
        </div>
      </CardContent>
    </Card>
  )
}
