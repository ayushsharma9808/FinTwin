"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BentoCard } from "@/components/cards/bento-card"
import { RiskGauge } from "@/components/charts/risk-gauge"
import { AllocationChart } from "@/components/charts/allocation-chart"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, Shield, TrendingDown, Activity, PieChart, Zap } from "lucide-react"
import { formatINR } from "@/lib/format"

const allocationData = [
  { name: "Stocks", value: 45 },
  { name: "Mutual Funds", value: 25 },
  { name: "Fixed Deposits", value: 15 },
  { name: "Gold", value: 10 },
  { name: "Crypto", value: 5 },
]

const stressTests = [
  { id: "recession", label: "Recession", impact: -18, icon: TrendingDown },
  { id: "inflation", label: "High Inflation", impact: -12, icon: AlertTriangle },
  { id: "crash", label: "Market Crash", impact: -35, icon: Zap },
]

export default function RiskPortfolioPage() {
  const [activeTest, setActiveTest] = useState<string | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [riskScore, setRiskScore] = useState(42)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const runStressTest = async (testId: string) => {
    setIsRunning(true)
    setActiveTest(testId)

    const test = stressTests.find((t) => t.id === testId)
    if (test) {
      await new Promise((r) => setTimeout(r, 1500))
      setRiskScore(Math.min(95, 42 + Math.abs(test.impact)))
    }

    setIsRunning(false)
  }

  const resetTest = () => {
    setActiveTest(null)
    setRiskScore(42)
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-5 w-64 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <SkeletonCard variant="chart" className="md:col-span-2" />
          <SkeletonCard variant="chart" className="md:col-span-2" />
          <SkeletonCard className="md:col-span-2" />
          <SkeletonCard className="md:col-span-2" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Risk & Portfolio</h2>
        <p className="text-muted-foreground">Analyze your risk exposure and asset allocation</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Risk Gauge - Large */}
        <BentoCard colSpan={2} delay={0}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Overall Risk Assessment</h3>
          </div>
          <div className="flex flex-col items-center py-4">
            <RiskGauge value={riskScore} size={220} label="Portfolio Risk Score" />
            <AnimatePresence>
              {activeTest && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-4 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    Stress Test: <span className="font-medium text-foreground capitalize">{activeTest}</span>
                  </p>
                  <Button variant="ghost" size="sm" className="mt-2" onClick={resetTest}>
                    Reset
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </BentoCard>

        {/* Asset Allocation */}
        <BentoCard colSpan={2} delay={0.1}>
          <div className="flex items-center gap-2 mb-4">
            <PieChart className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Asset Allocation</h3>
          </div>
          <AllocationChart data={allocationData} size={180} />
        </BentoCard>

        {/* Stress Test Buttons */}
        <BentoCard colSpan={2} delay={0.2}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Stress Tests</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Simulate different market conditions to see how your portfolio would perform.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {stressTests.map((test) => (
              <Button
                key={test.id}
                variant={activeTest === test.id ? "default" : "outline"}
                className="flex flex-col h-auto py-4 gap-2"
                onClick={() => runStressTest(test.id)}
                disabled={isRunning}
              >
                <test.icon className="h-5 w-5" />
                <span className="text-xs">{test.label}</span>
                <span className={`text-xs ${test.impact < -20 ? "text-destructive" : "text-muted-foreground"}`}>
                  {test.impact}%
                </span>
              </Button>
            ))}
          </div>
          {isRunning && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 text-center text-sm text-muted-foreground"
            >
              Running simulation...
            </motion.div>
          )}
        </BentoCard>

        {/* Risk Breakdown */}
        <BentoCard colSpan={2} delay={0.25}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Risk Breakdown</h3>
          </div>
          <div className="space-y-4">
            {[
              { label: "Market Risk", value: 35, color: "bg-chart-1" },
              { label: "Credit Risk", value: 22, color: "bg-chart-2" },
              { label: "Liquidity Risk", value: 18, color: "bg-chart-3" },
              { label: "Currency Risk", value: 12, color: "bg-chart-4" },
              { label: "Interest Rate Risk", value: 28, color: "bg-chart-5" },
            ].map((risk, i) => (
              <motion.div
                key={risk.label}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">{risk.label}</span>
                  <span className="font-medium">{risk.value}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${risk.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${risk.value}%` }}
                    transition={{ duration: 0.8, delay: 0.4 + i * 0.1 }}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </BentoCard>

        {/* Portfolio Health */}
        <BentoCard delay={0.3}>
          <h3 className="font-semibold mb-3">Portfolio Health</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Diversification</span>
              <span className="text-sm font-medium text-chart-2">Good</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Volatility</span>
              <span className="text-sm font-medium text-chart-4">Moderate</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Correlation</span>
              <span className="text-sm font-medium text-chart-2">Low</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Beta</span>
              <span className="text-sm font-medium">0.85</span>
            </div>
          </div>
        </BentoCard>

        {/* Recommendations */}
        <BentoCard delay={0.35}>
          <h3 className="font-semibold mb-3">AI Recommendations</h3>
          <div className="space-y-3">
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                Consider reducing crypto exposure by 2% to lower overall volatility.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-3">
              <p className="text-xs text-muted-foreground">
                Your mutual fund allocation provides good downside protection.
              </p>
            </div>
          </div>
        </BentoCard>

        <BentoCard colSpan={2} delay={0.4}>
          <h3 className="font-semibold mb-4">Historical Stress Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-normal">Event</th>
                  <th className="text-right py-2 text-muted-foreground font-normal">Market</th>
                  <th className="text-right py-2 text-muted-foreground font-normal">Your Portfolio</th>
                  <th className="text-right py-2 text-muted-foreground font-normal">Impact</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { event: "2020 COVID Crash", market: -34, portfolio: -22, impact: -528000 },
                  { event: "2022 Rate Hikes", market: -18, portfolio: -12, impact: -288000 },
                  { event: "2023 Bank Crisis", market: -8, portfolio: -5, impact: -120000 },
                ].map((row) => (
                  <tr key={row.event} className="border-b border-border/50">
                    <td className="py-3">{row.event}</td>
                    <td className="py-3 text-right text-chart-5">{row.market}%</td>
                    <td className="py-3 text-right text-chart-4">{row.portfolio}%</td>
                    <td className="py-3 text-right text-chart-5">{formatINR(row.impact)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </BentoCard>
      </div>
    </DashboardLayout>
  )
}
