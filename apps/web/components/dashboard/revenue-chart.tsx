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

import { Card, CardContent } from "@wongdigital/ui"
import { formatPrice } from "@/lib/format"
import { TrendingUp, Calendar } from "lucide-react"

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
      <CardContent className="p-4 sm:p-6 flex flex-col h-full">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 text-[--text-muted]">
              <TrendingUp size={16} />
              <h3 className="text-xs uppercase tracking-[0.2em] font-semibold">Revenue Trend</h3>
            </div>
            <p className="text-2xl sm:text-3xl font-display font-medium tracking-tight text-[--text-primary]">
              {formatPrice(totalRevenue.toString())}
            </p>
            <p className="text-sm text-[--text-secondary] mt-1">
              Last 30 Days
            </p>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[--accent-tint-soft] text-[--accent]">
            <Calendar size={18} />
          </div>
        </div>

        <div className="relative flex-grow min-h-[250px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="color-mix(in_srgb, var(--border) 60%, transparent)" />
              <XAxis
                dataKey="date"
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => {
                  const d = new Date(val)
                  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
                }}
                minTickGap={20}
              />
              <YAxis
                stroke="var(--text-muted)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(val) => `$${val}`}
                width={50}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-lg border border-[--border] bg-[color-mix(in_srgb,var(--bg-card)_80%,transparent)] p-3 shadow-xl backdrop-blur-xl">
                        <p className="mb-1 text-xs text-[--text-secondary]">
                          {label ? new Date(label).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : ""}
                        </p>
                        <p className="text-lg font-bold text-[--text-primary]">
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
                strokeWidth={3}
                stroke="var(--accent)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "var(--accent)",
                  stroke: "var(--bg-card)",
                  strokeWidth: 2,
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
