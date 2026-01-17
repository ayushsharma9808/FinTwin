"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts"
import { motion, AnimatePresence } from "framer-motion"
import { Calculator, TrendingUp, AlertTriangle, Target, Zap } from "lucide-react"
import { formatINR, formatINRCompact } from "@/lib/format"
import { MonteCarloEngine, SCENARIO_DEFINITIONS, type ScenarioInput, type ScenarioComparison } from "@/lib/utils/monte-carlo-engine"

export function WhatIfScenarioCalculator() {
  const [input, setInput] = useState<ScenarioInput>({
    currentAge: 30,
    retirementAge: 60,
    currentSavings: 800000,
    monthlyIncome: 90000,
    monthlyExpenses: 55000,
    monthlyInvestment: 20000,
    expectedReturn: 11,
    returnVolatility: 15,
    inflationRate: 6,
    scenarioType: "QUIT_JOB_6_MONTHS",
    simulationRuns: 10000
  })

  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<ScenarioComparison | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

  // Filter scenarios based on search
  const filteredScenarios = useMemo(() => {
    return Object.entries(SCENARIO_DEFINITIONS).filter(([key, scenario]) =>
      scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      scenario.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [searchTerm])

  const runSimulation = async () => {
    setIsCalculating(true)
    
    try {
      const comparison = await MonteCarloEngine.compareScenarios(input)
      setResults(comparison)
    } catch (error) {
      console.error("Simulation error:", error)
    } finally {
      setIsCalculating(false)
    }
  }

  const updateInput = (field: keyof ScenarioInput, value: number | string) => {
    setInput(prev => ({ ...prev, [field]: value }))
  }

  // Generate histogram data
  const histogramData = useMemo(() => {
    if (!results?.scenario?.simulationResults) return []
    return MonteCarloEngine.generateHistogramData(results.scenario.simulationResults, 30)
  }, [results])

  // Generate confidence band data
  const confidenceBandData = useMemo(() => {
    if (!results) return []
    
    const years = Array.from({ length: Math.min(input.retirementAge - input.currentAge, 10) }, (_, i) => i + 1)
    return years.map(year => {
      // Use baseline results for confidence bands
      const baseMedian = results.baseline.medianOutcome
      const baseP10 = results.baseline.percentiles.p10
      const baseP90 = results.baseline.percentiles.p90
      
      // Project growth over time
      const growthFactor = Math.pow(1 + input.expectedReturn / 100, year / (input.retirementAge - input.currentAge))
      
      return {
        year: input.currentAge + year,
        p10: Math.round(baseP10 * growthFactor * 0.8),
        p25: Math.round(baseMedian * growthFactor * 0.9),
        median: Math.round(baseMedian * growthFactor),
        p75: Math.round(baseMedian * growthFactor * 1.1),
        p90: Math.round(baseP90 * growthFactor * 0.9)
      }
    })
  }, [results, input])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
          <Calculator className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">What-If Scenario Calculator</h1>
          <p className="text-muted-foreground">Analyze 10,000 possible financial futures</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* CARD 1 - Scenario Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Scenario Selection
              </CardTitle>
              <CardDescription>Choose a life scenario to analyze</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="scenario-search">Search Scenarios</Label>
                <Input
                  id="scenario-search"
                  placeholder="Search scenarios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mt-1"
                />
              </div>
              
              <div>
                <Label>Select Scenario</Label>
                <Select value={input.scenarioType} onValueChange={(value) => updateInput('scenarioType', value)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredScenarios.map(([key, scenario]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-xs text-muted-foreground">{scenario.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2 - Input Parameters */}
          <Card>
            <CardHeader>
              <CardTitle>Input Parameters</CardTitle>
              <CardDescription>Adjust your financial details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="current-age">Current Age</Label>
                  <Input
                    id="current-age"
                    type="number"
                    value={input.currentAge}
                    onChange={(e) => updateInput('currentAge', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="retirement-age">Retirement Age</Label>
                  <Input
                    id="retirement-age"
                    type="number"
                    value={input.retirementAge}
                    onChange={(e) => updateInput('retirementAge', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="current-savings">Current Savings (₹)</Label>
                <Input
                  id="current-savings"
                  type="number"
                  value={input.currentSavings}
                  onChange={(e) => updateInput('currentSavings', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="monthly-income">Monthly Income (₹)</Label>
                  <Input
                    id="monthly-income"
                    type="number"
                    value={input.monthlyIncome}
                    onChange={(e) => updateInput('monthlyIncome', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="monthly-expenses">Monthly Expenses (₹)</Label>
                  <Input
                    id="monthly-expenses"
                    type="number"
                    value={input.monthlyExpenses}
                    onChange={(e) => updateInput('monthlyExpenses', parseInt(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="monthly-investment">Monthly Investment (₹)</Label>
                <Input
                  id="monthly-investment"
                  type="number"
                  value={input.monthlyInvestment}
                  onChange={(e) => updateInput('monthlyInvestment', parseInt(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="expected-return">Expected Return (%)</Label>
                  <Input
                    id="expected-return"
                    type="number"
                    step="0.1"
                    value={input.expectedReturn}
                    onChange={(e) => updateInput('expectedReturn', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="volatility">Volatility (%)</Label>
                  <Input
                    id="volatility"
                    type="number"
                    step="0.1"
                    value={input.returnVolatility}
                    onChange={(e) => updateInput('returnVolatility', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="inflation">Inflation (%)</Label>
                  <Input
                    id="inflation"
                    type="number"
                    step="0.1"
                    value={input.inflationRate}
                    onChange={(e) => updateInput('inflationRate', parseFloat(e.target.value))}
                    className="mt-1"
                  />
                </div>
              </div>

              <Button onClick={runSimulation} disabled={isCalculating} className="w-full">
                {isCalculating ? "Running 10,000 Simulations..." : "Calculate Scenarios"}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* CARD 3 - Key Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-4 w-4" />
                Key Results
              </CardTitle>
              <CardDescription>Probabilistic outcomes from 10,000 simulations</CardDescription>
            </CardHeader>
            <CardContent>
              {isCalculating ? (
                <div className="space-y-4">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : results ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-primary/10 p-4">
                      <p className="text-sm text-muted-foreground">Median Outcome</p>
                      <p className="text-xl font-bold">{formatINRCompact(results.scenario.medianOutcome)}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-4">
                      <p className="text-sm text-muted-foreground">Success Probability</p>
                      <p className="text-xl font-bold">{results.scenario.probabilityOfSuccess}%</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
                      <p className="text-sm text-muted-foreground">Best Case (95th)</p>
                      <p className="text-lg font-semibold text-green-700 dark:text-green-300">
                        {formatINRCompact(results.scenario.bestCase)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-red-50 p-4 dark:bg-red-950">
                      <p className="text-sm text-muted-foreground">Worst Case (5th)</p>
                      <p className="text-lg font-semibold text-red-700 dark:text-red-300">
                        {formatINRCompact(results.scenario.worstCase)}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <h4 className="font-semibold mb-2">Impact vs Baseline</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Required Corpus:</span>
                        <span className="font-medium">{formatINRCompact(results.scenario.requiredCorpus)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Median Difference:</span>
                        <span className={results.impactAnalysis.medianDifference >= 0 ? "text-green-600" : "text-red-600"}>
                          {results.impactAnalysis.medianDifference >= 0 ? "+" : ""}{formatINRCompact(results.impactAnalysis.medianDifference)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Success Rate Change:</span>
                        <span className={results.impactAnalysis.successProbabilityChange >= 0 ? "text-green-600" : "text-red-600"}>
                          {results.impactAnalysis.successProbabilityChange >= 0 ? "+" : ""}{results.impactAnalysis.successProbabilityChange}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center text-muted-foreground">
                  Run simulation to see results
                </div>
              )}
            </CardContent>
          </Card>

          {/* CARD 5 - AI Insight */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                AI Insight
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results ? (
                <div className="space-y-3">
                  <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900 dark:text-blue-100">
                          {SCENARIO_DEFINITIONS[input.scenarioType as keyof typeof SCENARIO_DEFINITIONS].name}
                        </p>
                        <p className="mt-1 text-blue-700 dark:text-blue-300">
                          {results.impactAnalysis.successProbabilityChange >= 0 
                            ? `This scenario improves your success probability by ${Math.abs(results.impactAnalysis.successProbabilityChange)}%, increasing your median outcome by ${formatINRCompact(Math.abs(results.impactAnalysis.medianDifference))}.`
                            : `This scenario reduces your success probability by ${Math.abs(results.impactAnalysis.successProbabilityChange)}%, decreasing your median outcome by ${formatINRCompact(Math.abs(results.impactAnalysis.medianDifference))}.`
                          }
                        </p>
                        <p className="mt-2 text-blue-600 dark:text-blue-400 text-xs">
                          Recovery timeline: {results.impactAnalysis.recoveryYears} years
                        </p>
                        {input.returnVolatility > 25 && (
                          <p className="mt-2 text-orange-600 dark:text-orange-400 text-xs font-medium">
                            ⚠️ High volatility detected ({input.returnVolatility}%). Results may be unrealistic.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">AI insights will appear after running the simulation</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CARD 4 - Charts */}
      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Visualization</CardTitle>
            <CardDescription>Distribution and confidence analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Histogram */}
              <div>
                <h4 className="font-semibold mb-4">Outcome Distribution</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={histogramData}>
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
              </div>

              {/* Confidence Bands */}
              <div>
                <h4 className="font-semibold mb-4">Confidence Bands Over Time</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={confidenceBandData}>
                    <defs>
                      <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.1} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
                    <XAxis dataKey="year" className="text-muted-foreground" fontSize={11} />
                    <YAxis 
                      className="text-muted-foreground" 
                      fontSize={11}
                      tickFormatter={(value) => formatINRCompact(value)}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => [formatINRCompact(value), name]}
                    />
                    <Area type="monotone" dataKey="p90" stroke="none" fill="url(#confidenceGradient)" />
                    <Area type="monotone" dataKey="p10" stroke="none" fill="var(--color-background)" />
                    <Area type="monotone" dataKey="median" stroke="var(--color-primary)" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Comparison Bar */}
              <div>
                <h4 className="font-semibold mb-4">Baseline vs Scenario</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    {
                      name: 'Baseline',
                      median: results.baseline.medianOutcome,
                      success: results.baseline.probabilityOfSuccess
                    },
                    {
                      name: 'Scenario',
                      median: results.scenario.medianOutcome,
                      success: results.scenario.probabilityOfSuccess
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" opacity={0.3} />
                    <XAxis dataKey="name" className="text-muted-foreground" fontSize={11} />
                    <YAxis 
                      className="text-muted-foreground" 
                      fontSize={11}
                      tickFormatter={(value) => formatINRCompact(value)}
                    />
                    <Tooltip 
                      formatter={(value: number, name: string) => {
                        if (name === 'success') return [`${value}%`, 'Success Rate']
                        return [formatINRCompact(value), 'Median Outcome']
                      }}
                    />
                    <Bar dataKey="median" fill="var(--color-primary)" opacity={0.8} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}