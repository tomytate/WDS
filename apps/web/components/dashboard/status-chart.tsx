"use client"

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts"

import { Card, CardContent } from "@wongdigital/ui"
import { PieChart as PieChartIcon } from "lucide-react"

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
  delivered: "#2da86c",
  cancelled: "var(--color-danger)",
}

export function StatusChart({ data }: StatusChartProps) {
  // Filter out zero counts
  const filteredData = data.filter((d) => d.count > 0)

  return (
    <Card className="flex flex-col h-full">
      <CardContent className="p-4 sm:p-6 flex flex-col h-full">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[--text-muted]">
              <PieChartIcon size={16} />
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">Orders by Status</h3>
            </div>
          </div>
        </div>

        <div className="relative flex-grow min-h-[250px] w-full">
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
                        <div className="rounded-lg border border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_80%,transparent)] p-3 shadow-xl backdrop-blur-xl">
                          <p className="mb-1 text-xs uppercase tracking-[0.1em] text-[--text-secondary]">
                            {payload[0]?.name}
                          </p>
                          <p className="text-lg font-bold text-[--text-primary]">
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
                  iconType="circle"
                  formatter={(value) => <span className="text-[--text-secondary] text-xs uppercase tracking-[0.1em] ml-1">{value}</span>}
                />
                <Pie
                  data={filteredData}
                  cx="50%"
                  cy="45%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                  nameKey="status"
                  stroke="none"
                >
                  {filteredData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.status as keyof typeof COLORS] || "var(--text-muted)"}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
