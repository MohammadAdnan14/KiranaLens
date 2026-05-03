import { Card } from "../shared/ui"
import { Camera, MapPin, LineChart, ArrowRight } from "lucide-react"

const steps = [
  {
    icon: Camera,
    label: "01",
    title: "Vision Capture",
    description: "Upload 3-5 store photographs. Our Vision AI analyzes shelf density, SKU diversity, inventory value, and store organization.",
  },
  {
    icon: MapPin,
    label: "02",
    title: "Geo-Validation",
    description: "GPS coordinates enable real-time analysis of footfall potential, competition density, and market saturation within 800m radius.",
  },
  {
    icon: LineChart,
    label: "03",
    title: "Cash Flow Analysis",
    description: "Fusion model combines vision and geo signals to generate credit-ready cash flow estimates with confidence scoring.",
  },
]

export function ProcessFlow() {
  return (
    <section id="process" className="border-t border-border/50 bg-card/30 py-24">
      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-medium uppercase tracking-widest text-accent">
            Underwriting Process
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Three-Step Intelligence Pipeline
          </h2>
        </div>

        {/* Process Steps */}
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-1/2 left-0 right-0 hidden h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-border to-transparent lg:block" />

          <div className="grid gap-8 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.label} className="relative">
                <Card className="relative h-full p-8 transition-all hover:border-accent/30">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8 rounded-full border border-border bg-background px-3 py-1">
                    <span className="font-mono text-xs font-medium text-accent">
                      {step.label}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-accent/20 bg-accent/10">
                    <step.icon className="h-6 w-6 text-accent" />
                  </div>

                  {/* Content */}
                  <h3 className="mb-3 text-xl font-semibold text-foreground">
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>

                  {/* Arrow to next step */}
                  {index < steps.length - 1 && (
                    <div className="absolute -right-4 top-1/2 hidden -translate-y-1/2 lg:block">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                  )}
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
