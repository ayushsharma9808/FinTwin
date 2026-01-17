"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

interface RiskGaugeProps {
  value: number // 0-100
  size?: number
  label?: string
}

export function RiskGauge({ value, size = 160, label = "Risk Score" }: RiskGaugeProps) {
  const normalizedValue = Math.min(100, Math.max(0, value))

  const { color, level } = useMemo(() => {
    if (normalizedValue < 35) return { color: "var(--color-chart-2)", level: "Low" }
    if (normalizedValue < 65) return { color: "var(--color-chart-4)", level: "Medium" }
    return { color: "var(--color-chart-5)", level: "High" }
  }, [normalizedValue])

  const strokeDasharray = 283 // circumference of circle with r=45
  const strokeDashoffset = strokeDasharray - (strokeDasharray * normalizedValue) / 100

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size * 0.6} viewBox="0 0 120 72">
        {/* Background arc */}
        <path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          className="stroke-muted"
          strokeWidth="10"
          strokeLinecap="round"
        />

        {/* Value arc */}
        <motion.path
          d="M 10 60 A 50 50 0 0 1 110 60"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: normalizedValue / 100 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        {/* Center text */}
        <text
          x="60"
          y="55"
          textAnchor="middle"
          className="fill-foreground text-2xl font-bold"
          style={{ fontSize: "24px" }}
        >
          {normalizedValue}
        </text>
        <text x="60" y="68" textAnchor="middle" className="fill-muted-foreground" style={{ fontSize: "10px" }}>
          {level}
        </text>
      </svg>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  )
}
