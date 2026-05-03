import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from "../shared/ui"
import { Download, RefreshCw, Clock, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { CashFlowChart } from "./CashFlowChart"
import { GeoMap } from "./GeoMap"
import { VisionAnalysis } from "./VisionAnalysis"
import { FraudScore } from "./FraudScore"
import { RiskFlags } from "./RiskFlags"
import { fmt, fmtR } from "../../lib/utils"

// Credit recommendation configurations
const RECOMMENDATIONS = {
  approve: {
    label: "APPROVE",
    color: "success",
    icon: TrendingUp,
    description: "Strong candidate. Proceed with standard terms.",
  },
  approve_with_conditions: {
    label: "APPROVE WITH CONDITIONS",
    color: "success",
    icon: TrendingUp,
    description: "Eligible with minor verification recommended.",
  },
  needs_verification: {
    label: "NEEDS VERIFICATION",
    color: "warning",
    icon: Minus,
    description: "Signals present but require field verification.",
  },
  needs_manual_review: {
    label: "NEEDS MANUAL REVIEW",
    color: "warning",
    icon: Minus,
    description: "Mixed signals. Escalate to credit officer.",
  },
  reject: {
    label: "REJECT",
    color: "danger",
    icon: TrendingDown,
    description: "Insufficient or suspicious signals detected.",
  },
}

export function StoreProfile({ data, onReset }) {
  const rec = RECOMMENDATIONS[data.recommendation] || RECOMMENDATIONS.needs_verification
  const RecIcon = rec.icon
  const confidencePct = Math.round((data.confidence_score || 0) * 100)

  const downloadJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `kirana-report-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Store Intelligence Profile</h2>
          <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>Analysis completed at {new Date().toLocaleTimeString()}</span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={downloadJSON} className="gap-2">
            <Download className="h-4 w-4" />
            Export JSON
          </Button>
          <Button variant="outline" size="sm" onClick={onReset} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            New Analysis
          </Button>
        </div>
      </div>

      {/* Credit Recommendation Hero */}
      <Card className={`border-${rec.color}/30 bg-${rec.color}/5`}>
        <CardContent className="flex flex-wrap items-center gap-6 p-6">
          {/* Icon */}
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl border border-${rec.color}/30 bg-${rec.color}/10`}>
            <RecIcon className={`h-7 w-7 text-${rec.color}`} />
          </div>

          {/* Content */}
          <div className="flex-1">
            <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Credit Recommendation
            </p>
            <h3 className={`text-2xl font-bold text-${rec.color}`}>{rec.label}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{rec.description}</p>
            {data.confidence_reason && (
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                {data.confidence_reason}
              </p>
            )}
          </div>

          {/* Confidence Score */}
          <div className="text-right">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Confidence
            </p>
            <p className={`font-mono text-4xl font-bold text-${rec.color}`}>{confidencePct}%</p>
            <div className="mt-2 h-1.5 w-24 overflow-hidden rounded-full bg-border">
              <div
                className={`h-full rounded-full bg-${rec.color} transition-all duration-1000`}
                style={{ width: `${confidencePct}%` }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics - Bento Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Daily Sales Range
          </p>
          <p className="text-2xl font-bold text-foreground">
            {fmtR(data.daily_sales_range[0], data.daily_sales_range[1])}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Estimated gross daily</p>
        </Card>

        <Card className="p-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monthly Revenue
          </p>
          <p className="text-2xl font-bold text-foreground">
            {fmtR(data.monthly_revenue_range[0], data.monthly_revenue_range[1])}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">~26 business days/mo</p>
        </Card>

        <Card className="p-6">
          <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Monthly Income
          </p>
          <p className="text-2xl font-bold text-accent">
            {fmtR(data.monthly_income_range[0], data.monthly_income_range[1])}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">Net margin 12-18%</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CashFlowChart data={data} />
        <FraudScore score={data.fraud_score} />
      </div>

      {/* Risk Flags */}
      {data.risk_flags?.length > 0 && <RiskFlags flags={data.risk_flags} />}

      {/* Vision Analysis */}
      {data.vision_breakdown && <VisionAnalysis breakdown={data.vision_breakdown} />}

      {/* Geo Map placeholder */}
      <GeoMap lat={data.lat} lng={data.lng} geoBreakdown={data.geo_breakdown} />
    </div>
  )
}
