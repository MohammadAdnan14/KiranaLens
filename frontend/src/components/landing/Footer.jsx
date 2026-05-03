import { Link } from "react-router-dom"
import { Scan } from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background py-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent">
              <Scan className="h-4 w-4 text-accent-foreground" />
            </div>
            <span className="font-semibold text-foreground">KiranaLens</span>
          </div>

          {/* Info */}
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Built for CRP TenzorX 2026 | Poonawalla Fincorp National AI Hackathon
            </p>
          </div>

          {/* Credits */}
          <div className="text-right">
            <p className="text-sm text-muted-foreground">
              Mohammad Adnan Dalal & Aymaan Khan
            </p>
            <p className="text-xs text-muted-foreground">RCOEM Nagpur</p>
          </div>
        </div>

        {/* Timestamp */}
        <div className="mt-8 border-t border-border/30 pt-6 text-center">
          <p className="font-mono text-xs text-muted-foreground">
            {new Date().toISOString().split("T")[0]} | Remote Cash Flow Underwriting Platform
          </p>
        </div>
      </div>
    </footer>
  )
}
