"use client"

import { useMemo } from "react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { motion } from "framer-motion"
import { formatINRCompact } from "@/lib/format"

interface MonteCarloChartProps {
  scenarios?: number
  height?: number
  baseValue?: number
  customData?: Array<{
    name: string
    p10: number
    p25?: number
    median: number
    p75?: number
    p90: number
    worst?: number
    best?: number
  }>
}

export function MonteCarloChart({ scenarios = 10000, height = 300, baseValue = 2500000, customData }: MonteCarloChartProps) {
  const chartData = useMemo(() => {
    if (customData && customData.length > 0) {
      return customData
    }
    // Generate probability distribution data for Monte Carlo visualization
    const years = ["Now", "1Y", "2Y", "3Y", "5Y", "10Y"]

    return years.map((year, i) => {
      const time = i === 0 ? 0 : i <= 3 ? i : i === 4 ? 5 : 10
      const growthRate = 0.08 // 8% average
      const volatility = 0.15 // 15% standard deviation

      const median = baseValue * Math.pow(1 + growthRate, time)
      const p10 = median * Math.pow(1 - volatility, Math.sqrt(time) * 1.28)
      const p25 = median * Math.pow(1 - volatility * 0.5, Math.sqrt(time) * 0.84)
      const p75 = median * Math.pow(1 + volatility * 0.5, Math.sqrt(time) * 0.84)
      const p90 = median * Math.pow(1 + volatility, Math.sqrt(time) * 1.28)
      const worst = median * Math.pow(1 - volatility * 1.5, Math.sqrt(time) * 1.65)
      const best = median * Math.pow(1 + volatility * 1.5, Math.sqrt(time) * 1.65)

      return {
        name: year,
        p10: Math.round(p10),
        p25: Math.round(p25),
        median: Math.round(median),
        p75: Math.round(p75),
        p90: Math.round(p90),
        worst: Math.round(worst),
        best: Math.round(best),
      }
    })
  }, [baseValue])

  const finalMedian = chartData[chartData.length - 1].median
  const finalP10 = chartData[chartData.length - 1].p10
  const finalP90 = chartData[chartData.length - 1].p90

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="w-full">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-sm bg-muted-foreground/10" />
            <span className="text-muted-foreground">90% Confidence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2 w-4 rounded-sm bg-muted-foreground/20" />
            <span className="text-muted-foreground">50% Confidence</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-0.5 w-4 bg-foreground" />
            <span className="text-muted-foreground">Median</span>
          </div>
        </div>
        <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
          {scenarios.toLocaleString()} simulations
        </span>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="p90Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-muted-foreground)" stopOpacity={0.1} />
              <stop offset="95%" stopColor="var(--color-muted-foreground)" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="p50Gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-muted-foreground)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="var(--color-muted-foreground)" stopOpacity={0.05} />
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
            formatter={(value: number, name: string) => {
              const labels: Record<string, string> = {
                p90: "90th Percentile",
                p75: "75th Percentile",
                median: "Median",
                p25: "25th Percentile",
                p10: "10th Percentile",
              }
              return [formatINRCompact(value), labels[name] || name]
            }}
          />
          {/* 90% confidence band */}
          <Area type="monotone" dataKey="p90" stroke="none" fill="url(#p90Gradient)" name="p90" />
          <Area type="monotone" dataKey="p10" stroke="none" fill="var(--color-background)" name="p10" />
          {/* 50% confidence band */}
          <Area type="monotone" dataKey="p75" stroke="none" fill="url(#p50Gradient)" name="p75" />
          <Area type="monotone" dataKey="p25" stroke="none" fill="var(--color-background)" name="p25" />
          {/* Median line */}
          <Area
            type="monotone"
            dataKey="median"
            stroke="var(--color-foreground)"
            strokeWidth={2}
            fill="none"
            name="median"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Pessimistic (10%)</p>
          <p className="mt-1 text-sm font-semibold">{formatINRCompact(finalP10)}</p>
        </div>
        <div className="rounded-lg bg-primary/10 p-3">
          <p className="text-xs text-muted-foreground">Expected (50%)</p>
          <p className="mt-1 text-sm font-semibold">{formatINRCompact(finalMedian)}</p>
        </div>
        <div className="rounded-lg bg-muted p-3">
          <p className="text-xs text-muted-foreground">Optimistic (90%)</p>
          <p className="mt-1 text-sm font-semibold">{formatINRCompact(finalP90)}</p>
        </div>
      </div>
    </motion.div>
  )
}
