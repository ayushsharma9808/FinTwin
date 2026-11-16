"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BentoCard } from "@/components/cards/bento-card"
import { MoodAvatar } from "@/components/avatar/mood-avatar"
import { DigitalTwinSphere } from "@/components/3d/digital-twin-sphere"
import { RiskGauge } from "@/components/charts/risk-gauge"
import { PdfUpload } from "@/components/upload/pdf-upload"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Brain, Target, Zap, Upload, FileText, CheckCircle2 } from "lucide-react"
import { formatINR } from "@/lib/format"
import { useAuth } from "@/lib/auth-context"
import { useFinancialData } from "@/lib/hooks/use-financial-data"
import { FinancialChatDrawer } from "@/components/ai/financial-chat-drawer"

const statusCycle: Array<"synced" | "learning" | "predicting"> = ["synced", "learning", "predicting"]

export default function DigitalTwinPage() {
  const { profile } = useAuth()
  const { summary, accounts, expenses, income, isLoading, refreshData } = useFinancialData()
  const [status, setStatus] = useState<"synced" | "learning" | "predicting">("synced")
  const [showUpload, setShowUpload] = useState(false)

  const savingRate = useMemo(() => {
    if (!summary.monthlyIncome || summary.monthlyIncome <= 0) return 25
    const rate = Math.round((summary.monthlyCashFlow / summary.monthlyIncome) * 100)
    return Math.max(Math.min(rate, 90), 5)
  }, [summary.monthlyCashFlow, summary.monthlyIncome])

  const spendingPattern = useMemo(() => {
    const ratio = summary.monthlyExpenses / (summary.monthlyIncome || 1)
    if (ratio < 0.4) return "Frugal / High Saver"
    if (ratio < 0.65) return "Balanced & Controlled"
    return "High Outflow / Needs Attention"
  }, [summary.monthlyExpenses, summary.monthlyIncome])

  const riskLevel: "low" | "medium" | "high" =
    summary.riskScore < 35 ? "low" : summary.riskScore < 65 ? "medium" : "high"

  const behaviorIndicators = [
    { label: "Spending Pattern", value: spendingPattern, trend: "stable" },
    { label: "Effective Savings Rate", value: `${savingRate}%`, trend: savingRate >= 20 ? "up" : "down" },
    { label: "Emergency Runway", value: `${summary.emergencyRunwayMonths} Months`, trend: summary.emergencyRunwayMonths >= 6 ? "up" : "stable" },
    { label: "Risk Tolerance Profile", value: profile?.risk_tolerance || "Moderate", trend: "stable" },
  ]

  const getStatusColor = () => {
    switch (status) {
      case "synced":
        return "bg-chart-2"
      case "learning":
        return "bg-chart-4"
      case "predicting":
        return "bg-chart-3"
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-5 w-56 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
          <SkeletonCard variant="chart" className="md:col-span-2 md:row-span-2" />
          <SkeletonCard />
          <SkeletonCard variant="avatar" />
          <SkeletonCard className="md:col-span-2" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">AI Financial Digital Twin</h2>
          <p className="text-muted-foreground">
            Personalized mathematical clone of your financial life • {accounts.length} active data streams
          </p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Upload className="h-4 w-4" />
          {showUpload ? "Hide Trainer" : "Train Twin With Statement"}
        </button>
      </motion.div>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <BentoCard>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold text-sm">Upload Financial Data for Twin Training</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Feed real PDF or CSV bank statements to calibrate the Monte Carlo parameters, risk tolerance, and spending propensity models.
              </p>
              <PdfUpload onDataParsed={() => refreshData()} />
            </BentoCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Main 3D Visualization */}
        <BentoCard colSpan={2} rowSpan={2} delay={0} className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Neural Twin Model</h3>
              <p className="text-xs text-muted-foreground">3D Stochastic Field Visualization</p>
            </div>
            <AnimatePresence mode="wait">
              <motion.span
                key={status}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium capitalize"
              >
                <span className={`h-1.5 w-1.5 animate-pulse rounded-full ${getStatusColor()}`} />
                {status}
              </motion.span>
            </AnimatePresence>
          </div>
          <div className="flex flex-1 items-center justify-center">
            <DigitalTwinSphere status={status} className="h-[350px] w-full" />
          </div>
          <div className="mt-4 flex justify-center gap-2">
            {statusCycle.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                  status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {s} State
              </button>
            ))}
          </div>
        </BentoCard>

        {/* Risk Level Card */}
        <BentoCard delay={0.1}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold text-sm">Risk Calibration</h3>
            </div>
            <span className="text-xs font-mono text-muted-foreground">{summary.riskScore}/100</span>
          </div>
          <div className="flex justify-center">
            <RiskGauge value={summary.riskScore} size={130} />
          </div>
        </BentoCard>

        {/* Avatar Mood */}
        <BentoCard delay={0.15}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Digital Twin Avatar</h3>
          </div>
          <div className="flex flex-col items-center gap-3">
            <MoodAvatar riskLevel={riskLevel} size="md" />
            <div className="text-center">
              <span className="text-sm font-medium capitalize text-foreground">{riskLevel} Risk State</span>
              <p className="text-xs text-muted-foreground mt-0.5">
                {riskLevel === "low"
                  ? "Resilient financial health"
                  : riskLevel === "medium"
                  ? "Balanced financial structure"
                  : "Elevated financial exposure"}
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Real Behavior Indicators */}
        <BentoCard colSpan={2} delay={0.2}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Behavioral Finance Indicators</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {behaviorIndicators.map((indicator, i) => (
              <motion.div
                key={indicator.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="rounded-lg bg-muted/50 p-3 border border-border/50"
              >
                <p className="text-xs text-muted-foreground">{indicator.label}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-semibold text-sm">{indicator.value}</span>
                  <span
                    className={`text-xs ${
                      indicator.trend === "up"
                        ? "text-chart-2"
                        : indicator.trend === "down"
                          ? "text-chart-5"
                          : "text-muted-foreground"
                    }`}
                  >
                    {indicator.trend === "up" ? "↑ Healthy" : indicator.trend === "down" ? "↓ Attention" : "→ Stable"}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </BentoCard>

        {/* Processing Status */}
        <BentoCard delay={0.25}>
          <div className="flex items-center gap-2 mb-3">
            <Zap className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">Digital Twin Convergence</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Account Synchronization</span>
                <span className="font-mono">100%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-chart-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 1 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Cash Flow Stability</span>
                <span className="font-mono">92%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-chart-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "92%" }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Stochastic Goal Feasibility</span>
                <span className="font-mono">84%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-chart-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "84%" }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </div>
          </div>
        </BentoCard>

        {/* Real Twin Statistics */}
        <BentoCard delay={0.3}>
          <h3 className="font-semibold text-sm mb-3">Twin Telemetry</h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tracked Inflow</span>
              <span className="font-mono font-medium">{formatINR(summary.monthlyIncome)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tracked Outflow</span>
              <span className="font-mono font-medium">{formatINR(summary.monthlyExpenses)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Debt EMI</span>
              <span className="font-mono font-medium">{formatINR(summary.monthlyEmi)}/mo</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Net Liquid Surplus</span>
              <span className="font-mono font-semibold text-chart-2">+{formatINR(summary.monthlyCashFlow)}/mo</span>
            </div>
          </div>
        </BentoCard>
      </div>

      <FinancialChatDrawer />
    </DashboardLayout>
  )
}
