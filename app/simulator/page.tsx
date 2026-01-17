"use client"

import { useState, useMemo, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BentoCard } from "@/components/cards/bento-card"
import { TrendChart } from "@/components/charts/trend-chart"
import { MonteCarloChart } from "@/components/charts/monte-carlo-chart"
import { ScenarioCards } from "@/components/scenarios/scenario-cards"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import { Calculator, TrendingUp, TrendingDown, ArrowRight, Sparkles } from "lucide-react"
import { formatINR } from "@/lib/format"

type Scenario = "bull" | "bear" | "crash"

const scenarioMultipliers: Record<Scenario, number> = {
  bull: 1.15,
  bear: 0.92,
  crash: 0.7,
}

export default function SimulatorPage() {
  const [income, setIncome] = useState(125000)
  const [expenses, setExpenses] = useState(75000)
  const [investment, setInvestment] = useState(20)
  const [scenario, setScenario] = useState<Scenario>("bull")
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLifeEvent, setSelectedLifeEvent] = useState<any>(null)

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200)
    return () => clearTimeout(timer)
  }, [])

  const projectedData = useMemo(() => {
    const monthly = income - expenses
    const investmentAmount = monthly * (investment / 100)
    const savingsAmount = monthly - investmentAmount
    const multiplier = scenarioMultipliers[scenario]
    const eventImpact = selectedLifeEvent ? 1 + selectedLifeEvent.impact / 100 : 1

    const baseValue = 2500000
    const months = ["Now", "3M", "6M", "9M", "12M", "18M", "24M"]

    return months.map((name, i) => {
      const growth = Math.pow(1 + (multiplier - 1) / 12, i * (i < 5 ? 3 : 6))
      const investmentGrowth = investmentAmount * i * (i < 5 ? 3 : 6) * growth * eventImpact
      const savings = savingsAmount * i * (i < 5 ? 3 : 6)
      return {
        name,
        actual: i === 0 ? baseValue : null,
        predicted: Math.round((baseValue + investmentGrowth + savings) * eventImpact),
      }
    })
  }, [income, expenses, investment, scenario, selectedLifeEvent])

  const summary = useMemo(() => {
    const monthly = income - expenses
    const yearly = monthly * 12
    const investmentYearly = yearly * (investment / 100) * scenarioMultipliers[scenario]
    const finalValue = projectedData[projectedData.length - 1].predicted
    const growth = (((finalValue! - 2500000) / 2500000) * 100).toFixed(1)

    return {
      monthlySavings: monthly,
      yearlyProjection: yearly,
      investmentReturn: Math.round(investmentYearly),
      totalGrowth: growth,
      finalValue,
    }
  }, [income, expenses, investment, scenario, projectedData])

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="mb-6">
          <div className="h-8 w-40 animate-pulse rounded-md bg-muted" />
          <div className="mt-2 h-5 w-56 animate-pulse rounded-md bg-muted" />
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <SkeletonCard className="md:col-span-1" />
          <SkeletonCard variant="chart" className="md:col-span-2" />
          <SkeletonCard variant="chart" className="md:col-span-3" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">What-If Simulator</h2>
        <p className="text-muted-foreground">Explore different financial scenarios with Monte Carlo analysis</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* Controls Panel */}
        <BentoCard delay={0} className="md:col-span-1">
          <div className="flex items-center gap-2 mb-6">
            <Calculator className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Adjust Parameters</h3>
          </div>

          <div className="space-y-6">
            {/* Income Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-muted-foreground">Monthly Income</label>
                <span className="text-sm font-medium">{formatINR(income)}</span>
              </div>
              <Slider
                value={[income]}
                onValueChange={(v) => setIncome(v[0])}
                min={50000}
                max={500000}
                step={5000}
                className="w-full"
              />
            </div>

            {/* Expenses Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-muted-foreground">Monthly Expenses</label>
                <span className="text-sm font-medium">{formatINR(expenses)}</span>
              </div>
              <Slider
                value={[expenses]}
                onValueChange={(v) => setExpenses(v[0])}
                min={25000}
                max={300000}
                step={5000}
                className="w-full"
              />
            </div>

            {/* Investment Slider */}
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm text-muted-foreground">Investment Rate</label>
                <span className="text-sm font-medium">{investment}%</span>
              </div>
              <Slider
                value={[investment]}
                onValueChange={(v) => setInvestment(v[0])}
                min={0}
                max={80}
                step={5}
                className="w-full"
              />
            </div>

            {/* Scenario Dropdown */}
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Market Scenario</label>
              <Select value={scenario} onValueChange={(v) => setScenario(v as Scenario)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bull">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-chart-2" />
                      Bull Market (+15%)
                    </span>
                  </SelectItem>
                  <SelectItem value="bear">
                    <span className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-chart-4" />
                      Bear Market (-8%)
                    </span>
                  </SelectItem>
                  <SelectItem value="crash">
                    <span className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4 text-chart-5" />
                      Market Crash (-30%)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </BentoCard>

        {/* Chart */}
        <BentoCard colSpan={2} delay={0.1}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Projected Outcome</h3>
              <p className="text-sm text-muted-foreground">24-month projection</p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium capitalize ${
                scenario === "bull"
                  ? "bg-chart-2/20 text-chart-2"
                  : scenario === "bear"
                    ? "bg-chart-4/20 text-chart-4"
                    : "bg-chart-5/20 text-chart-5"
              }`}
            >
              {scenario} Market
            </span>
          </div>
          <TrendChart data={projectedData} height={280} />
        </BentoCard>

        {/* Summary Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Monthly Savings</p>
            <p className="text-xl font-semibold mt-1">{formatINR(summary.monthlySavings)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Investment Return (Yr)</p>
            <p className="text-xl font-semibold mt-1">{formatINR(summary.investmentReturn)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Growth</p>
            <p
              className={`text-xl font-semibold mt-1 ${
                Number.parseFloat(summary.totalGrowth) > 0 ? "text-chart-2" : "text-chart-5"
              }`}
            >
              {Number.parseFloat(summary.totalGrowth) > 0 ? "+" : ""}
              {summary.totalGrowth}%
            </p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Final Value (24M)</p>
            <p className="text-xl font-semibold mt-1">{formatINR(summary.finalValue || 0)}</p>
          </div>
        </motion.div>

        <BentoCard colSpan={3} delay={0.25}>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Monte Carlo Simulation</h3>
          </div>
          <MonteCarloChart scenarios={10000} height={280} baseValue={2500000} />
        </BentoCard>

        <BentoCard colSpan={3} delay={0.3}>
          <ScenarioCards onScenarioSelect={setSelectedLifeEvent} />
        </BentoCard>

        {/* Insights */}
        <BentoCard colSpan={3} delay={0.35}>
          <h3 className="font-semibold mb-3">AI Scenario Analysis</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <ArrowRight className="h-4 w-4" />
                Current Path
              </div>
              <p className="text-xs text-muted-foreground">
                At your current savings rate of {(((income - expenses) / income) * 100).toFixed(0)}%, you're building a
                strong financial foundation.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <TrendingUp className="h-4 w-4" />
                Optimization Tip
              </div>
              <p className="text-xs text-muted-foreground">
                Increasing your investment rate by 10% could yield an additional{" "}
                {formatINR(Math.round(summary.investmentReturn * 0.1))} annually.
              </p>
            </div>
            <div className="rounded-lg bg-muted p-4">
              <div className="flex items-center gap-2 text-sm font-medium mb-2">
                <Calculator className="h-4 w-4" />
                Risk Assessment
              </div>
              <p className="text-xs text-muted-foreground">
                In a {scenario} market scenario, your portfolio shows
                {scenario === "bull"
                  ? " strong growth potential"
                  : scenario === "bear"
                    ? " moderate resilience"
                    : " significant vulnerability"}
                .
              </p>
            </div>
          </div>
        </BentoCard>
      </div>
    </DashboardLayout>
  )
}
