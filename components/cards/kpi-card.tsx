"use client"

import type React from "react"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface KpiCardProps {
  title: string
  value: string
  change?: number
  icon?: React.ReactNode
  delay?: number
}

export function KpiCard({ title, value, change, icon, delay = 0 }: KpiCardProps) {
  const getTrendIcon = () => {
    if (!change) return <Minus className="h-3 w-3" />
    return change > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
  }

  const getTrendColor = () => {
    if (!change) return "text-muted-foreground"
    return change > 0 ? "text-chart-2" : "text-chart-5"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <motion.p
            className="text-2xl font-semibold tracking-tight"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: delay + 0.2 }}
          >
            {value}
          </motion.p>
        </div>
        {icon && <div className="rounded-lg bg-muted p-2">{icon}</div>}
      </div>
      {change !== undefined && (
        <div className={cn("mt-3 flex items-center gap-1 text-sm", getTrendColor())}>
          {getTrendIcon()}
          <span>{Math.abs(change)}%</span>
          <span className="text-muted-foreground">vs last month</span>
        </div>
      )}
    </motion.div>
  )
}
