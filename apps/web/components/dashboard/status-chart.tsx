"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

import { Card } from "@wongdigital/ui"

type StatusDataPoint = {
  status: string
  count: number
}

type StatusChartProps = {
  data: StatusDataPoint[]
}

const COLORS: Record<string, string> = {
  pending: "var(--color-warning)",
  processing: "var(--color-info)",
  completed: "var(--color-success)",
  delivered: "var(--accent)",
  cancelled: "var(--color-danger)",
}

export function StatusChart({ data }: StatusChartProps) {
  const filteredData = data.filter((d) => d.count > 0)

  return (
    <Card className="flex flex-col h-full">
      <div className="border-b border-[--border] px-5 sm:px-6 py-4 flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted] mb-2">
            Orders by status
          </p>
          <p className="font-display text-xl font-semibold tracking-tight text-[--text-primary]">
            Distribution
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--text-muted]">
          {data.reduce((sum, d) => sum + d.count, 0)} total
        </span>
      </div>

      <div className="relative flex-grow min-h-[260px] w-full p-4 sm:p-5">
        {filteredData.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-[--text-muted]">
            No order data available.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-[--radius-inner] border border-[--text-primary] bg-[--bg-card] p-3 shadow-[--shadow-md]">
                        <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[--text-muted]">
                          {payload[0]?.name}
                        </p>
                        <p className="font-display text-lg font-semibold tabular-nums text-[--text-primary]">
                          {payload[0]?.value} Orders
                        </p>
                      </div>
                    )
                  }
                  return null
                }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="square"
                formatter={(value) => (
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[--text-secondary] ml-1.5">
                    {value}
                  </span>
                )}
              />
              <Pie
                data={filteredData}
                cx="50%"
                cy="45%"
                innerRadius={56}
                outerRadius={82}
                paddingAngle={2}
                dataKey="count"
                nameKey="status"
                stroke="var(--bg-card)"
                strokeWidth={2}
              >
                {filteredData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={
                      COLORS[entry.status as keyof typeof COLORS] ||
                      "var(--text-muted)"
                    }
                  />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  )
}
