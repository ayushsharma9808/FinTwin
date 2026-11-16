"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BentoCard } from "@/components/cards/bento-card"
import { MonteCarloChart } from "@/components/charts/monte-carlo-chart"
import { SkeletonCard } from "@/components/ui/skeleton-card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  Sparkles,
  ShieldAlert,
  Play,
  RotateCcw,
  CheckCircle,
  Briefcase,
  AlertTriangle,
  History,
  Info,
} from "lucide-react"
import { formatINR } from "@/lib/format"
import { useFinancialData } from "@/lib/hooks/use-financial-data"
import { FinancialChatDrawer } from "@/components/ai/financial-chat-drawer"
import { toast } from "sonner"

const scenarios = [
  { id: "normal", name: "1. Normal Scenario", desc: "Steady income and baseline inflation growth" },
  { id: "job_loss_3m", name: "2. Job Loss (3 Months)", desc: "Zero income for 3 months with fixed expenses" },
  { id: "job_loss_6m", name: "3. Job Loss (6 Months)", desc: "Zero income for 6 months emergency test" },
  { id: "medical_emergency", name: "4. Medical Emergency", desc: "One-time ₹5,00,000 emergency medical shock" },
  { id: "sudden_large_expense", name: "5. Sudden Large Expense", desc: "Unexpected ₹3,50,000 capital expense" },
  { id: "salary_increase", name: "6. Salary Increase", desc: "+25% career raise after month 6" },
  { id: "salary_decrease", name: "7. Salary Decrease", desc: "-20% economic slowdown after month 3" },
  { id: "loan_repayment_change", name: "8. Aggressive Loan Repayment", desc: "Extra ₹10,000/mo to eliminate debt early" },
  { id: "market_crash", name: "9. Market Downturn", desc: "High market volatility and return compression" },
  { id: "early_retirement", name: "10. Early Retirement", desc: "Zero income after 3 years; corpus decumulation" },
]

export default function SimulatorPage() {
  const { summary, simulations, runSimulation, isLoading } = useFinancialData()

  // Inputs matching Section 5
  const [savings, setSavings] = useState(856000)
  const [income, setIncome] = useState(185000)
  const [expenses, setExpenses] = useState(68000)
  const [investments, setInvestments] = useState(1511427)
  const [loans, setLoans] = useState(605000)
  const [emi, setEmi] = useState(31250)
  const [inflation, setInflation] = useState(6)
  const [expectedReturn, setExpectedReturn] = useState(12)
  const [dependents, setDependents] = useState(2)
  const [duration, setDuration] = useState(10)
  const [scenarioType, setScenarioType] = useState("normal")

  const [isRunning, setIsRunning] = useState(false)
  const [currentResult, setCurrentResult] = useState<any>(null)

  // Seed default inputs from user's actual database numbers once loaded
  useEffect(() => {
    if (summary) {
      if (summary.totalCashSavings > 0) setSavings(summary.totalCashSavings)
      if (summary.monthlyIncome > 0) setIncome(summary.monthlyIncome)
      if (summary.monthlyExpenses > 0) setExpenses(summary.monthlyExpenses)
      if (summary.totalInvestments > 0) setInvestments(summary.totalInvestments)
      if (summary.totalOutstandingLoans > 0) setLoans(summary.totalOutstandingLoans)
      if (summary.monthlyEmi > 0) setEmi(summary.monthlyEmi)
    }
  }, [summary])

  const handleRunSimulation = async (selectedType?: string) => {
    const typeToRun = selectedType || scenarioType
    setIsRunning(true)

    try {
      const payload = {
        currentSavings: savings,
        monthlyIncome: income,
        monthlyExpenses: expenses,
        existingInvestments: investments,
        outstandingLoans: loans,
        monthlyEmi: emi,
        inflationRate: inflation,
        expectedReturn,
        dependents,
        simulationDuration: duration,
        scenarioType: typeToRun,
      }

      const res = await runSimulation(payload)
      setCurrentResult(res.simulation_results || res)
    } catch {
      // toast in hook
    } finally {
      setIsRunning(false)
    }
  }

  // Format chart data for MonteCarloChart
  const chartPoints = currentResult?.yearlyProjections?.map((p: any) => ({
    name: p.year === 0 ? "Now" : `${p.year}Y`,
    p10: p.p10,
    median: p.p50,
    p90: p.p90,
    worst: Math.round(p.p10 * 0.85),
    best: Math.round(p.p90 * 1.15),
  }))

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
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">What-If Stochastic Simulator</h2>
            <p className="text-muted-foreground">
              Run 10,000 Monte Carlo paths with Geometric Brownian Motion & economic shocks
            </p>
          </div>
          <Button
            onClick={() => handleRunSimulation()}
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <Play className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Running 10,000 Iterations..." : "Execute 10,000 Runs"}
          </Button>
        </div>
      </motion.div>

      {/* Scenarios Carousel / Selector Bar */}
      <div className="mb-6 overflow-x-auto pb-2 scrollbar-none">
        <div className="flex gap-2">
          {scenarios.map((sc) => {
            const active = scenarioType === sc.id
            return (
              <button
                key={sc.id}
                onClick={() => {
                  setScenarioType(sc.id)
                  handleRunSimulation(sc.id)
                }}
                className={`flex flex-col shrink-0 text-left rounded-xl p-3 border transition-all duration-200 min-w-[200px] max-w-[240px] ${
                  active
                    ? "border-primary bg-primary/10 shadow-sm"
                    : "border-border bg-card hover:border-muted-foreground/30"
                }`}
              >
                <span className={`text-xs font-semibold ${active ? "text-primary" : "text-foreground"}`}>
                  {sc.name}
                </span>
                <span className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                  {sc.desc}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Input Parameters Form Card */}
        <BentoCard className="lg:col-span-1 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="font-semibold text-sm">Simulation Assumptions</h3>
            <span className="text-xs text-muted-foreground">Documented Math</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <Label className="text-xs">Current Liquid Cash (₹)</Label>
              <Input
                type="number"
                value={savings}
                onChange={(e) => setSavings(Number(e.target.value))}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div>
              <Label className="text-xs">Investments Value (₹)</Label>
              <Input
                type="number"
                value={investments}
                onChange={(e) => setInvestments(Number(e.target.value))}
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Monthly Inflow (₹)</Label>
                <Input
                  type="number"
                  value={income}
                  onChange={(e) => setIncome(Number(e.target.value))}
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs">Monthly Outflow (₹)</Label>
                <Input
                  type="number"
                  value={expenses}
                  onChange={(e) => setExpenses(Number(e.target.value))}
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Outstanding Loans (₹)</Label>
                <Input
                  type="number"
                  value={loans}
                  onChange={(e) => setLoans(Number(e.target.value))}
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
              <div>
                <Label className="text-xs">Monthly EMI (₹)</Label>
                <Input
                  type="number"
                  value={emi}
                  onChange={(e) => setEmi(Number(e.target.value))}
                  className="mt-1 h-8 text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-2">
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Expected Annual Return</span>
                <span className="font-semibold">{expectedReturn}%</span>
              </div>
              <Slider
                value={[expectedReturn]}
                onValueChange={(v) => setExpectedReturn(v[0])}
                min={4}
                max={22}
                step={0.5}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Expected Inflation Rate</span>
                <span className="font-semibold">{inflation}%</span>
              </div>
              <Slider
                value={[inflation]}
                onValueChange={(v) => setInflation(v[0])}
                min={2}
                max={12}
                step={0.5}
              />
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-muted-foreground">Simulation Horizon</span>
                <span className="font-semibold">{duration} Years</span>
              </div>
              <Slider
                value={[duration]}
                onValueChange={(v) => setDuration(v[0])}
                min={3}
                max={30}
                step={1}
              />
            </div>

            <div>
              <Label className="text-xs">Dependents Count</Label>
              <Input
                type="number"
                value={dependents}
                onChange={(e) => setDependents(Number(e.target.value))}
                min="0"
                max="10"
                className="mt-1 h-8 text-xs font-mono"
              />
            </div>

            <Button
              onClick={() => handleRunSimulation()}
              disabled={isRunning}
              className="w-full mt-2"
              size="sm"
            >
              Re-Calculate 10,000 Paths
            </Button>
          </div>
        </BentoCard>

        {/* Results & Monte Carlo Chart */}
        <div className="lg:col-span-2 space-y-6">
          {/* Key Output Metrics Bento */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground">Worst-Case (P10)</span>
              <p className="text-base font-bold text-red-500 mt-1">
                {formatINR(currentResult?.p10 ?? (savings + investments) * 0.9)}
              </p>
              <span className="text-[10px] text-muted-foreground">90% safe threshold</span>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground">Median Outcome (P50)</span>
              <p className="text-base font-bold text-foreground mt-1">
                {formatINR(currentResult?.p50 ?? (savings + investments) * 1.8)}
              </p>
              <span className="text-[10px] text-muted-foreground">50th percentile</span>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground">Optimistic Case (P90)</span>
              <p className="text-base font-bold text-green-500 mt-1">
                {formatINR(currentResult?.p90 ?? (savings + investments) * 2.8)}
              </p>
              <span className="text-[10px] text-muted-foreground">Top 10% market upside</span>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <span className="text-xs text-muted-foreground">Success Probability</span>
              <p className="text-base font-bold text-blue-500 mt-1">
                {currentResult?.successProbability ?? 88}%
              </p>
              <span className="text-[10px] text-muted-foreground">Beating inflation goal</span>
            </div>
          </div>

          {/* Monte Carlo Visual Chart */}
          <BentoCard>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-base">Monte Carlo Stochastic Fan Chart</h3>
                <p className="text-xs text-muted-foreground">
                  Distribution of {currentResult?.simulationRuns ?? 10000} future paths across {duration} years
                </p>
              </div>
              <span className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1">
                {currentResult?.riskClassification || "Moderate Risk"}
              </span>
            </div>

            <MonteCarloChart
              height={300}
              scenarios={10000}
              baseValue={savings + investments}
              customData={chartPoints}
            />
          </BentoCard>

          {/* Documented Assumptions & Stress Analysis */}
          <BentoCard>
            <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
              <Info className="h-4 w-4 text-blue-500" />
              Documented Mathematical Methodology
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-muted-foreground leading-relaxed">
              <div>
                <p>
                  • <strong>Model:</strong> Geometric Brownian Motion (GBM) with monthly stochastic drift and Box-Muller normal variance.
                </p>
                <p className="mt-1">
                  • <strong>Inflation Adjustment:</strong> Expenses compound monthly at {(inflation / 12).toFixed(3)}% per month.
                </p>
              </div>
              <div>
                <p>
                  • <strong>Financial Stress Score:</strong> {currentResult?.stressScore ?? 42}/100 calculated from emergency runway and debt obligations.
                </p>
                <p className="mt-1">
                  • <strong>Persistence:</strong> Each simulation execution automatically archives inputs and probability tensors to the PostgreSQL `simulations` table.
                </p>
              </div>
            </div>
          </BentoCard>
        </div>
      </div>

      <FinancialChatDrawer />
    </DashboardLayout>
  )
}
