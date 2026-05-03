import { Link } from "react-router-dom"
import { Button } from "../shared/ui"
import { Scan, ArrowRight } from "lucide-react"

export function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent">
            <Scan className="h-5 w-5 text-accent-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight text-foreground">
            KiranaLens
          </span>
        </Link>

        {/* Navigation */}
        <div className="hidden items-center gap-8 md:flex">
          <a href="#process" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Process
          </a>
          <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Features
          </a>
          <a href="#metrics" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
            Metrics
          </a>
        </div>

        {/* CTA */}
        <div className="flex items-center gap-3">
          <Link to="/dashboard">
            <Button size="sm" className="gap-2">
              Open Platform
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}
