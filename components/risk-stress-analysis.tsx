"use client"

import React, { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from "recharts"
import { motion } from "framer-motion"
import { Shield, TrendingDown, AlertTriangle, Target, Clock, DollarSign, Activity, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { formatINR, formatINRCompact } from "@/lib/format"
import { RiskAnalysisEngine, type FinancialData, type RiskAnalysis } from "@/lib/utils/risk-analysis-engine"

// Mock financial data - in real app, this would come from user profile and Monte Carlo results
const mockFinancialData: FinancialData = {
  currentAge: 30,
  retirementAge: 60,
  monthlyIncome: 90000,
  monthlyExpenses: 55000,
  currentSavings: 800000,
  monthlyInvestment: 20000,
  expectedReturn: 11,
  volatility: 15,
  inflation: 6,
  monteCarloResults: Array.from({ length: 10000 }, () => 
    Math.random() * 10000000 + 2000000 + (Math.random() - 0.5) * 5000000
  ),
  baselineMedian: 4500000,
  scenarioMedian: 4200000,
  successProbability: 0.85
}

interface ScoreCardProps {
  title: string
  score: number
  icon: React.ElementType
  description: string
}

function ScoreCard({ title, score, icon: Icon, description }: ScoreCardProps) {
  const getScoreColor = (score: number) => {
    if (score >= 75) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 75) return "bg-green-50 dark:bg-green-950"
    if (score >= 50) return "bg-yellow-50 dark:bg-yellow-950"
    return "bg-red-50 dark:bg-red-950"
  }

  return (
    <Card className={getScoreBg(score)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Icon className={`h-5 w-5 ${getScoreColor(score)}`} />
          <span className={`text-2xl font-bold ${getScoreColor(score)}`}>{score}</span>
        </div>
        <h3 className="font-semibold text-sm mb-1">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

interface RiskGaugeProps {
  score: number
  label: string
  size?: number
}

function RiskGauge({ score, label, size = 120 }: RiskGaugeProps) {
  const getColor = (score: number) => {
    if (score >= 75) return "#16a34a"
    if (score >= 50) return "#ca8a04"
    return "#dc2626"
  }

  const circumference = 2 * Math.PI * 45
  const strokeDasharray = circumference
  const strokeDashoffset = circumference - (score / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={45}
            stroke="currentColor"
            strokeWidth="8"
            fill="transparent"
            className="text-muted-foreground/20"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={45}
            stroke={getColor(score)}
            strokeWidth="8"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color: getColor(score) }}>
            {score}
          </span>
          <span className="text-xs text-muted-foreground">Score</span>
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-center">{label}</p>
    </div>
  )
}

export function RiskStressAnalysisPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [analysis, setAnalysis] = useState<RiskAnalysis | null>(null)

  useEffect(() => {
    // Simulate loading and analysis
    const timer = setTimeout(() => {
      const result = RiskAnalysisEngine.analyzeFinancialRisk(mockFinancialData)
      setAnalysis(result)
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Generate distribution data for Monte Carlo visualization
  const distributionData = useMemo(() => {
    if (!analysis) return []
    
    const results = mockFinancialData.monteCarloResults
    const bins = 20
    const min = Math.min(...results)
    const max = Math.max(...results)
    const binWidth = (max - min) / bins
    
    const histogram = Array(bins).fill(0).map((_, i) => ({
      range: `₹${Math.round((min + i * binWidth) / 100000)}L`,
      count: 0,
      value: min + i * binWidth
    }))
    
    results.forEach(result => {
      const binIndex = Math.min(Math.floor((result - min) / binWidth), bins - 1)
      histogram[binIndex].count++
    })
    
    return histogram
  }, [analysis])

  // Generate stress timeline data
  const stressTimelineData = useMemo(() => {
    if (!analysis) return []
    
    return Array.from({ length: 10 }, (_, i) => ({
      year: 2024 + i,
      baseline: mockFinancialData.baselineMedian * Math.pow(1.08, i) / 100000,
      scenario: mockFinancialData.scenarioMedian * Math.pow(1.08, i) / 100000,
      recovery: i >= 3 ? mockFinancialData.baselineMedian * Math.pow(1.08, i) / 100000 : mockFinancialData.scenarioMedian * Math.pow(1.08, i) / 100000
    }))
  }, [analysis])

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  if (!analysis) return null

  const verdictIcon = {
    SAFE: CheckCircle,
    CAUTION: AlertCircle,
    HIGH_RISK: XCircle
  }[analysis.composite.verdict]

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Risk & Stress Analysis</h1>
          <p className="text-muted-foreground">Comprehensive financial health assessment</p>
        </div>
      </div>

      {/* SECTION 1: Overall Health */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Health Overview</CardTitle>
          <CardDescription>Your overall risk and stress assessment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-3">
            <RiskGauge score={analysis.composite.riskScore} label="Risk Score" />
            <RiskGauge score={analysis.composite.stressScore} label="Stress Score" />
            <div className="flex flex-col items-center justify-center">
              <div className={`flex items-center gap-2 mb-2 ${analysis.composite.verdictColor}`}>
                {React.createElement(verdictIcon, { className: "h-8 w-8" })}
                <span className="text-2xl font-bold">{analysis.composite.verdict.replace('_', ' ')}</span>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {analysis.composite.verdict === 'SAFE' && "Your financial profile is well-balanced"}
                {analysis.composite.verdict === 'CAUTION' && "Some areas need attention"}
                {analysis.composite.verdict === 'HIGH_RISK' && "Immediate action recommended"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 2: Detailed Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Risk & Stress Breakdown</CardTitle>
          <CardDescription>Individual component scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <ScoreCard
              title="Income Stability"
              score={analysis.scores.incomeStability}
              icon={DollarSign}
              description={`${analysis.emergencyBuffer.toFixed(1)} months emergency buffer`}
            />
            <ScoreCard
              title="Expense Stress"
              score={analysis.scores.expenseStress}
              icon={TrendingDown}
              description={`${analysis.expenseRatio.toFixed(0)}% of income spent`}
            />
            <ScoreCard
              title="Investment Risk"
              score={analysis.scores.investmentRisk}
              icon={Activity}
              description={`${mockFinancialData.volatility}% portfolio volatility`}
            />
            <ScoreCard
              title="Portfolio Resilience"
              score={analysis.scores.portfolioResilience}
              icon={Shield}
              description="Distribution consistency"
            />
            <ScoreCard
              title="Goal Success Rate"
              score={analysis.scores.goalFailureRisk}
              icon={Target}
              description={`${(mockFinancialData.successProbability * 100).toFixed(0)}% success probability`}
            />
            <ScoreCard
              title="Recovery Speed"
              score={analysis.scores.stressRecoveryTime}
              icon={Clock}
              description="Time to recover from stress"
            />
          </div>
        </CardContent>
      </Card>

      {/* SECTION 3: Monte Carlo Risk View */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Outcome Distribution</CardTitle>
            <CardDescription>Monte Carlo simulation results</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
                <XAxis 
                  dataKey="range" 
                  className="text-muted-foreground" 
                  fontSize={10}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis className="text-muted-foreground" fontSize={11} />
                <Tooltip 
                  formatter={(value: number) => [value, "Frequency"]}
                  labelFormatter={(label) => `Range: ${label}`}
                />
                <Bar dataKey="count" fill="var(--color-primary)" opacity={0.8} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SECTION 4: Stress Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Recovery Timeline</CardTitle>
            <CardDescription>Projected recovery from stress scenarios</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stressTimelineData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
                <XAxis dataKey="year" className="text-muted-foreground" fontSize={11} />
                <YAxis 
                  className="text-muted-foreground" 
                  fontSize={11}
                  tickFormatter={(value) => `₹${value}L`}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [`₹${value.toFixed(1)}L`, name]}
                />
                <Line 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="var(--color-primary)" 
                  strokeWidth={2}
                  name="Baseline"
                />
                <Line 
                  type="monotone" 
                  dataKey="scenario" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Stress Scenario"
                />
                <Line 
                  type="monotone" 
                  dataKey="recovery" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Recovery Path"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 5: AI Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            AI Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analysis.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
              >
                <div className="text-sm">{insight}</div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}