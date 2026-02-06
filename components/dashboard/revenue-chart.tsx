"use client"

const revenueData = [
  { month: "Aug", revenue: 28500 },
  { month: "Sep", revenue: 32100 },
  { month: "Oct", revenue: 35800 },
  { month: "Nov", revenue: 38200 },
  { month: "Dec", revenue: 42100 },
  { month: "Jan", revenue: 45230 },
]

const maxRevenue = Math.max(...revenueData.map((d) => d.revenue))

export function RevenueChart() {
  return (
    <div className="space-y-4">
      {/* Bar chart */}
      <div className="flex items-end justify-between gap-2 h-48">
        {revenueData.map((item) => (
          <div key={item.month} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex flex-col items-center justify-end h-40">
              <span className="text-xs text-muted-foreground mb-1">
                {(item.revenue / 1000).toFixed(1)}k
              </span>
              <div
                className="w-full max-w-12 bg-primary rounded-t-md transition-all hover:bg-primary/80"
                style={{ height: `${(item.revenue / maxRevenue) * 100}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{item.month}</span>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
        <div>
          <p className="text-xs text-muted-foreground">Total Revenue</p>
          <p className="text-lg font-semibold text-foreground">221,930 MAD</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Avg. Monthly</p>
          <p className="text-lg font-semibold text-foreground">36,988 MAD</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Growth</p>
          <p className="text-lg font-semibold text-primary">+58.7%</p>
        </div>
      </div>
    </div>
  )
}
