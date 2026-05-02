"use client"

import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"

import { Card } from "@wongdigital/ui"
import { formatPrice } from "@/lib/format"

type RevenueDataPoint = {
  date: string
  revenue: number
}

type RevenueChartProps = {
  data: RevenueDataPoint[]
  totalRevenue: number
}

export function RevenueChart({ data, totalRevenue }: RevenueChartProps) {
  return (
    <Card className="flex flex-col h-full">
      <div className="border-b border-[--border] px-5 sm:px-6 py-4 flex items-start justify-between">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[--text-muted] mb-2">
            Revenue trend / 30 days
          </p>
          <p className="text-2xl sm:text-3xl font-display font-semibold tracking-tight tabular-nums text-[--text-primary]">
            {formatPrice(totalRevenue.toString())}
          </p>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-[--accent-strong]">
          Live
        </span>
      </div>

      <div className="relative flex-grow min-h-[260px] w-full p-4 sm:p-5">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border)"
            />
            <XAxis
              dataKey="date"
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => {
                const d = new Date(val)
                return d.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              }}
              minTickGap={20}
            />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => `$${val}`}
              width={40}
            />
            <Tooltip
              cursor={{ stroke: "var(--text-primary)", strokeWidth: 1, strokeDasharray: "2 2" }}
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-[--radius-inner] border border-[--text-primary] bg-[--bg-card] p-3 shadow-[--shadow-md]">
                      <p className="mb-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[--text-muted]">
                        {label
                          ? new Date(label).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : ""}
                      </p>
                      <p className="font-display text-lg font-semibold tabular-nums text-[--text-primary]">
                        {formatPrice(String(payload[0]?.value || 0))}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              strokeWidth={2}
              stroke="var(--text-primary)"
              dot={false}
              activeDot={{
                r: 5,
                fill: "var(--accent)",
                stroke: "var(--text-primary)",
                strokeWidth: 1.5,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
