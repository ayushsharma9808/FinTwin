"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BentoCard } from "@/components/cards/bento-card"
import { KpiCard } from "@/components/cards/kpi-card"
import { MoodAvatar } from "@/components/avatar/mood-avatar"
import { TrendChart } from "@/components/charts/trend-chart"
import { RiskGauge } from "@/components/charts/risk-gauge"
import { DigitalTwinSphere } from "@/components/3d/digital-twin-sphere"
import { AssetCard } from "@/components/cards/asset-card"
import { PdfUpload } from "@/components/upload/pdf-upload"
import { SkeletonBentoGrid } from "@/components/ui/skeleton-card"
import { TrendingUp, Shield, Sparkles, Upload } from "lucide-react"
import { formatINR } from "@/lib/format"
import { motion, AnimatePresence } from "framer-motion"
import { useAuth } from "@/lib/auth-context"

const trendData = [
  { name: "Jan", actual: 3750000, predicted: 3830000 },
  { name: "Feb", actual: 4330000, predicted: 4410000 },
  { name: "Mar", actual: 3990000, predicted: 4160000 },
  { name: "Apr", actual: 5080000, predicted: 5160000 },
  { name: "May", actual: 4580000, predicted: 4830000 },
  { name: "Jun", actual: 5580000, predicted: 5830000 },
  { name: "Jul", actual: 5990000, predicted: 6240000 },
  { name: "Aug", actual: null, predicted: 6490000 },
  { name: "Sep", actual: null, predicted: 6830000 },
]

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [riskLevel] = useState<"low" | "medium" | "high">("medium")
  const [isLoading, setIsLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    const timer = setTimeout(() => setIsLoading(false), 1500)
    return () => clearTimeout(timer)
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <div className="h-8 w-32 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-5 w-48 animate-pulse rounded-md bg-muted" />
        </div>
        <SkeletonBentoGrid />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">Your financial overview at a glance</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Upload className="h-4 w-4" />
          Upload Statement
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
            <PdfUpload onDataParsed={(data) => console.log("Parsed:", data)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Hero Card - AI Digital Twin Visualization */}
        <BentoCard colSpan={2} rowSpan={2} delay={0} className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">AI Digital Twin</h3>
              <p className="text-sm text-muted-foreground">Real-time financial visualization</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-chart-2" />
              Synced
            </span>
          </div>
          <div className="relative flex flex-1 items-center justify-center">
            <DigitalTwinSphere status="synced" className="h-[280px] w-full" />
            <div className="absolute bottom-4 right-4">
              <MoodAvatar riskLevel={riskLevel} size="sm" />
            </div>
          </div>
        </BentoCard>

        <KpiCard
          title="Net Worth"
          value={formatINR(2367427)}
          change={12.5}
          icon={<span className="text-lg">₹</span>}
          delay={0.1}
        />
        <KpiCard
          title="Monthly Cash Flow"
          value={`+${formatINR(35650)}`}
          change={8.2}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          delay={0.15}
        />

        {/* Risk Score Gauge */}
        <BentoCard delay={0.2}>
          <h3 className="mb-3 font-semibold">Risk Score</h3>
          <div className="flex justify-center">
            <RiskGauge value={42} size={140} />
          </div>
        </BentoCard>

        {/* AI Insights */}
        <BentoCard delay={0.25}>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Sparkles className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">AI Insight</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Based on current trends, consider increasing your emergency fund by ₹50,000 over the next quarter.
              </p>
            </div>
          </div>
        </BentoCard>

        {/* Trend Chart */}
        <BentoCard colSpan={2} delay={0.3}>
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Financial Trend</h3>
              <p className="text-sm text-muted-foreground">Past performance vs AI prediction</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-4 rounded-full bg-chart-1" />
                <span className="text-muted-foreground">Actual</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-4 rounded-full border border-dashed border-chart-3" />
                <span className="text-muted-foreground">Predicted</span>
              </div>
            </div>
          </div>
          <TrendChart data={trendData} height={180} />
        </BentoCard>

        {/* Security Status */}
        <BentoCard delay={0.35}>
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-muted p-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h3 className="font-semibold">Security Status</h3>
              <p className="mt-1 text-sm text-muted-foreground">All accounts protected</p>
              <p className="mt-2 text-xs text-chart-2">Last scan: 2 hours ago</p>
            </div>
          </div>
        </BentoCard>

        {/* Quick Actions */}
        <BentoCard delay={0.4}>
          <h3 className="mb-3 font-semibold">Quick Actions</h3>
          <div className="space-y-2">
            <button className="w-full rounded-lg bg-muted px-3 py-2 text-left text-sm transition-colors hover:bg-accent">
              Run Simulation
            </button>
            <button className="w-full rounded-lg bg-muted px-3 py-2 text-left text-sm transition-colors hover:bg-accent">
              View Portfolio
            </button>
          </div>
        </BentoCard>

        <BentoCard colSpan={2} delay={0.45}>
          <h3 className="mb-4 font-semibold">Asset Overview</h3>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <AssetCard type="bank" name="Bank Accounts" value={856000} change={2.3} />
            <AssetCard type="demat" name="Stocks & MFs" value={1250000} change={8.5} delay={0.05} />
            <AssetCard type="gold" name="Gold" value={185000} change={4.2} delay={0.1} />
            <AssetCard type="crypto" name="Crypto" value={76427} change={-12.4} delay={0.15} />
          </div>
        </BentoCard>
      </div>
    </DashboardLayout>
  )
}
