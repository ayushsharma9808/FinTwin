"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BentoCard } from "@/components/cards/bento-card"
import { MoodAvatar } from "@/components/avatar/mood-avatar"
import { DigitalTwinSphere } from "@/components/3d/digital-twin-sphere"
import { RiskGauge } from "@/components/charts/risk-gauge"
import { PdfUpload } from "@/components/upload/pdf-upload"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Activity, Brain, Target, Zap, Upload, FileText } from "lucide-react"
import { formatINR } from "@/lib/format"

const statusCycle: Array<"synced" | "learning" | "predicting"> = ["synced", "learning", "predicting"]

const behaviorIndicators = [
  { label: "Spending Pattern", value: "Conservative", trend: "stable" },
  { label: "Saving Rate", value: "22%", trend: "up" },
  { label: "Investment Style", value: "Balanced", trend: "stable" },
  { label: "Risk Appetite", value: "Moderate", trend: "down" },
]

export default function DigitalTwinPage() {
  const [status, setStatus] = useState<"synced" | "learning" | "predicting">("synced")
  const [statusIndex, setStatusIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setStatusIndex((prev) => (prev + 1) % statusCycle.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setStatus(statusCycle[statusIndex])
  }, [statusIndex])

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

  const riskLevel = status === "synced" ? "low" : status === "learning" ? "medium" : "high"

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
        className="mb-6 flex items-center justify-between"
      >
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">AI Digital Twin</h2>
          <p className="text-muted-foreground">Your personalized financial model</p>
        </div>
        <button
          onClick={() => setShowUpload(!showUpload)}
          className="flex items-center gap-2 rounded-lg bg-muted px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
        >
          <Upload className="h-4 w-4" />
          Train Model
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
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-semibold">Upload Financial Data</h3>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Upload your bank statements to train your Digital Twin model for more accurate predictions.
              </p>
              <PdfUpload />
            </BentoCard>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {/* Main 3D Visualization */}
        <BentoCard colSpan={2} rowSpan={2} delay={0} className="flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold">Neural Financial Model</h3>
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
            {statusCycle.map((s, i) => (
              <button
                key={s}
                onClick={() => {
                  setStatusIndex(i)
                  setStatus(s)
                }}
                className={`rounded-full px-3 py-1 text-xs capitalize transition-colors ${
                  status === s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </BentoCard>

        {/* Risk Level Card */}
        <BentoCard delay={0.1}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Risk Level</h3>
          </div>
          <RiskGauge value={status === "synced" ? 28 : status === "learning" ? 45 : 68} size={130} />
        </BentoCard>

        {/* Avatar Mood */}
        <BentoCard delay={0.15}>
          <div className="flex items-center gap-2 mb-3">
            <Brain className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Avatar Mood</h3>
          </div>
          <div className="flex flex-col items-center gap-3">
            <MoodAvatar riskLevel={riskLevel} size="md" />
            <span className="text-sm text-muted-foreground capitalize">{riskLevel} Risk State</span>
          </div>
        </BentoCard>

        {/* Behavior Indicators */}
        <BentoCard colSpan={2} delay={0.2}>
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Behavior Indicators</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {behaviorIndicators.map((indicator, i) => (
              <motion.div
                key={indicator.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                className="rounded-lg bg-muted p-3"
              >
                <p className="text-xs text-muted-foreground">{indicator.label}</p>
                <div className="mt-1 flex items-center justify-between">
                  <span className="font-medium">{indicator.value}</span>
                  <span
                    className={`text-xs ${
                      indicator.trend === "up"
                        ? "text-chart-2"
                        : indicator.trend === "down"
                          ? "text-chart-5"
                          : "text-muted-foreground"
                    }`}
                  >
                    {indicator.trend === "up" ? "↑" : indicator.trend === "down" ? "↓" : "→"}
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
            <h3 className="font-semibold">Processing</h3>
          </div>
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Data Sync</span>
                <span>100%</span>
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
                <span>Model Training</span>
                <span>87%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-chart-3 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "87%" }}
                  transition={{ duration: 1, delay: 0.2 }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Predictions</span>
                <span>64%</span>
              </div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-chart-4 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "64%" }}
                  transition={{ duration: 1, delay: 0.4 }}
                />
              </div>
            </div>
          </div>
        </BentoCard>

        <BentoCard delay={0.3}>
          <h3 className="font-semibold mb-3">Twin Statistics</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Data Points</span>
              <span className="font-medium">24,847</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Accuracy</span>
              <span className="font-medium">94.2%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Last Update</span>
              <span className="font-medium">2 min ago</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Predicted Income</span>
              <span className="font-medium">{formatINR(145000)}/mo</span>
            </div>
          </div>
        </BentoCard>
      </div>
    </DashboardLayout>
  )
}
