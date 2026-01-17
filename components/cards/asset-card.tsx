"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { formatINR } from "@/lib/format"
import { TrendingUp, Coins, Bitcoin, Smartphone, CreditCard } from "lucide-react"

interface AssetCardProps {
  type: "bank" | "demat" | "gold" | "crypto" | "digital"
  name: string
  value: number
  change?: number
  details?: string
  delay?: number
  className?: string
}

const assetIcons = {
  bank: CreditCard,
  demat: TrendingUp,
  gold: Coins,
  crypto: Bitcoin,
  digital: Smartphone,
}

const assetColors = {
  bank: "text-chart-2 bg-chart-2/10",
  demat: "text-chart-3 bg-chart-3/10",
  gold: "text-chart-4 bg-chart-4/10",
  crypto: "text-chart-5 bg-chart-5/10",
  digital: "text-chart-1 bg-chart-1/10",
}

export function AssetCard({ type, name, value, change, details, delay = 0, className }: AssetCardProps) {
  const Icon = assetIcons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className={cn("rounded-lg p-2", assetColors[type])}>
          <Icon className="h-4 w-4" />
        </div>
        {change !== undefined && (
          <span className={cn("text-xs font-medium", change >= 0 ? "text-chart-2" : "text-chart-5")}>
            {change >= 0 ? "+" : ""}
            {change}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-xs text-muted-foreground">{name}</p>
        <p className="mt-1 text-lg font-semibold">{formatINR(value)}</p>
        {details && <p className="mt-1 text-xs text-muted-foreground">{details}</p>}
      </div>
    </motion.div>
  )
}
