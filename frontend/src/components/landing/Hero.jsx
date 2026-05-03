import { Link } from "react-router-dom"
import { Button } from "../shared/ui"
import { ArrowRight, Shield, Zap, BarChart3 } from "lucide-react"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20">
      {/* Background gradient */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 rounded-full bg-accent/5 blur-3xl" />
        <div className="absolute top-1/4 right-0 h-[600px] w-[600px] rounded-full bg-accent/3 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="mx-auto max-w-4xl text-center">
          {/* Headline */}
          <h1 className="mb-6 text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Institutional-Grade Underwriting for the{" "}
            <span className="text-accent">Unorganized Retail Sector</span>
          </h1>

          {/* Sub-headline */}
          <p className="mx-auto mb-10 max-w-2xl text-pretty text-lg text-muted-foreground">
            Leveraging Vision AI and Geo-Intelligence to bridge the credit gap for Kirana stores. 
            Transform store imagery and location data into actionable credit decisions in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/dashboard">
              <Button size="lg" className="gap-2">
                Start Underwriting
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#process">
              <Button variant="outline" size="lg">
                View Process Flow
              </Button>
            </a>
          </div>

          {/* Trust Indicators */}
          <div className="mt-16 flex flex-wrap items-center justify-center gap-8 border-t border-border/50 pt-8">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4 text-accent" />
              <span>Bank-Grade Security</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Zap className="h-4 w-4 text-accent" />
              <span>30-Second Analysis</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <BarChart3 className="h-4 w-4 text-accent" />
              <span>11-Point Fraud Detection</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
