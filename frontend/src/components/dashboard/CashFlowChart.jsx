import { Card, CardHeader, CardTitle, CardContent } from "../shared/ui"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

export function CashFlowChart({ data }) {
  // Generate sample cash flow data based on the analysis
  const dailyLow = data.daily_sales_range[0]
  const dailyHigh = data.daily_sales_range[1]
  const dailyMid = (dailyLow + dailyHigh) / 2

  // Create 30 days of projected data with some variance
  const chartData = Array.from({ length: 30 }, (_, i) => {
    const variance = (Math.random() - 0.5) * (dailyHigh - dailyLow) * 0.6
    const weekendFactor = (i % 7 === 0 || i % 7 === 6) ? 1.15 : 1
    return {
      day: `D${i + 1}`,
      sales: Math.round((dailyMid + variance) * weekendFactor),
      low: dailyLow,
      high: dailyHigh,
    }
  })

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border border-border bg-card p-3 shadow-lg">
          <p className="mb-1 text-xs font-medium text-muted-foreground">{label}</p>
          <p className="font-mono text-sm font-semibold text-foreground">
            {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base">
          <span className="flex h-6 w-6 items-center justify-center rounded bg-accent/10 font-mono text-xs font-medium text-accent">
            CF
          </span>
          Real-Time Cash Flow Estimate
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis 
                dataKey="day" 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                interval={4}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 10 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sales"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorSales)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Daily Low</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(dailyLow)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Daily Average</p>
            <p className="font-mono text-sm font-semibold text-accent">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(dailyMid)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Daily High</p>
            <p className="font-mono text-sm font-semibold text-foreground">
              {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(dailyHigh)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
