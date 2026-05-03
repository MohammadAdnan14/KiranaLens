import { Card, CardHeader, CardTitle, CardContent } from "../shared/ui"
import { cn } from "../../lib/utils"

export function FraudScore({ score }) {
  const pct = score || 0
  const circumference = 2 * Math.PI * 45
  const strokeDashoffset = circumference * (1 - pct / 100)

  const getColor = () => {
    if (pct >= 50) return "text-danger"
    if (pct >= 25) return "text-warning"
    return "text-success"
  }

  const getStrokeColor = () => {
    if (pct >= 50) return "#ef4444"
    if (pct >= 25) return "#f59e0b"
    return "#10b981"
  }

  const getRiskLevel = () => {
    if (pct >= 60) return { label: "HIGH RISK", description: "Multiple strong fraud signals detected. Manual field verification strongly advised." }
    if (pct >= 30) return { label: "MODERATE RISK", description: "Some inconsistencies found. Cross-check flagged signals before proceeding." }
    return { label: "LOW RISK", description: "No major fraud signals. Data appears consistent across vision and geo inputs." }
  }

  const risk = getRiskLevel()

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-accent/10 font-mono text-xs font-medium text-accent">
            FR
          </span>
          Fraud Risk Assessment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          {/* Circular Progress */}
          <div className="relative flex-shrink-0">
            <svg width="120" height="120" viewBox="0 0 120 120" className="-rotate-90">
              {/* Background circle */}
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="10"
                className="text-border"
              />
              {/* Progress circle */}
              <circle
                cx="60"
                cy="60"
                r="45"
                fill="none"
                stroke={getStrokeColor()}
                strokeWidth="10"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={cn("font-mono text-3xl font-bold", getColor())}>{pct}</span>
              <span className="text-xs text-muted-foreground">/100</span>
            </div>
          </div>

          {/* Risk Details */}
          <div className="flex-1">
            <p className={cn("mb-2 text-lg font-semibold", getColor())}>{risk.label}</p>
            <p className="text-sm leading-relaxed text-muted-foreground">{risk.description}</p>
          </div>
        </div>

        {/* Risk Breakdown Bar */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Risk Distribution</span>
            <span className={cn("font-mono font-medium", getColor())}>{pct}%</span>
          </div>
          <div className="flex h-2 overflow-hidden rounded-full bg-border">
            <div className="bg-success" style={{ width: "25%" }} />
            <div className="bg-warning" style={{ width: "25%" }} />
            <div className="bg-danger" style={{ width: "50%" }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0 - Low</span>
            <span>25 - Moderate</span>
            <span>50 - High</span>
            <span>100</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
