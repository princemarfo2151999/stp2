"use client"

const statusData = [
  { label: "Available", count: 42, color: "bg-primary" },
  { label: "Charging", count: 18, color: "bg-chart-2" },
  { label: "Offline", count: 4, color: "bg-destructive" },
  { label: "Reserved", count: 8, color: "bg-warning" },
]

const total = statusData.reduce((sum, item) => sum + item.count, 0)

export function StationStatusChart() {
  return (
    <div className="space-y-6">
      {/* Progress bar visualization */}
      <div className="h-4 rounded-full overflow-hidden flex bg-muted">
        {statusData.map((item) => (
          <div
            key={item.label}
            className={`${item.color} transition-all`}
            style={{ width: `${(item.count / total) * 100}%` }}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-4">
        {statusData.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div className={`h-3 w-3 rounded-full ${item.color}`} />
            <div className="flex-1">
              <p className="text-sm text-foreground">{item.label}</p>
              <p className="text-lg font-semibold text-foreground">{item.count}</p>
            </div>
            <span className="text-sm text-muted-foreground">
              {Math.round((item.count / total) * 100)}%
            </span>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="pt-4 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Total Connectors</span>
          <span className="text-lg font-bold text-foreground">{total}</span>
        </div>
      </div>
    </div>
  )
}
