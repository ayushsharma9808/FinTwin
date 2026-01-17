"use client"

import { useMemo } from "react"
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"
import { motion } from "framer-motion"
import { formatINRCompact } from "@/lib/format"

interface TrendChartProps {
  data: Array<{
    name: string
    actual: number | null
    predicted?: number | null
  }>
  showPrediction?: boolean
  height?: number
}

export function TrendChart({ data, showPrediction = true, height = 200 }: TrendChartProps) {
  const chartData = useMemo(() => data, [data])

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full">
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-1)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="var(--color-chart-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-chart-3)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--color-chart-3)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
          <XAxis dataKey="name" className="text-muted-foreground" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis
            className="text-muted-foreground"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => formatINRCompact(value)}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-card)",
              border: "1px solid var(--color-border)",
              borderRadius: "8px",
              fontSize: "12px",
            }}
            labelStyle={{ color: "var(--color-foreground)" }}
            formatter={(value: number) => [formatINRCompact(value)]}
          />
          <Area
            type="monotone"
            dataKey="actual"
            stroke="var(--color-chart-1)"
            strokeWidth={2}
            fill="url(#actualGradient)"
            name="Actual"
            connectNulls={false}
          />
          {showPrediction && (
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="var(--color-chart-3)"
              strokeWidth={2}
              strokeDasharray="5 5"
              fill="url(#predictedGradient)"
              name="Predicted"
              connectNulls={false}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  )
}
