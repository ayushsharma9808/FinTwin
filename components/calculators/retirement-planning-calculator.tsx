"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Users, DollarSign, Calendar, ArrowLeft, TrendingUp, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency, formatINR } from "@/lib/format"
import { FinancialCalculations } from "@/lib/utils/financial-calculations"

interface RetirementPlanningCalculatorProps {
  onBack: () => void
}

export function RetirementPlanningCalculator({ onBack }: RetirementPlanningCalculatorProps) {
  const [currentAge, setCurrentAge] = useState<string>("30")
  const [retirementAge, setRetirementAge] = useState<string>("60")
  const [lifeExpectancy, setLifeExpectancy] = useState<string>("85")
  const [currentMonthlyExpense, setCurrentMonthlyExpense] = useState<string>("40000")
  const [expectedInflationRate, setExpectedInflationRate] = useState<string>("6")
  const [preRetirementReturn, setPreRetirementReturn] = useState<string>("12")
  const [postRetirementReturn, setPostRetirementReturn] = useState<string>("8")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>("")
  const [warning, setWarning] = useState<string>("")

  const calculateRetirement = () => {
    if (!currentAge || !retirementAge || !lifeExpectancy || !currentMonthlyExpense || !expectedInflationRate || !preRetirementReturn || !postRetirementReturn) return
    
    const currAge = parseInt(currentAge)
    const retAge = parseInt(retirementAge)
    const lifeExp = parseInt(lifeExpectancy)
    const monthlyExp = parseFloat(currentMonthlyExpense)
    const inflationRate = parseFloat(expectedInflationRate)
    const preReturn = parseFloat(preRetirementReturn)
    const postReturn = parseFloat(postRetirementReturn)
    
    if (currAge <= 0 || retAge <= 0 || lifeExp <= 0 || monthlyExp <= 0 || inflationRate < 0 || preReturn <= 0 || postReturn <= 0) {
      setError("Please enter valid positive numbers")
      return
    }
    
    if (retAge <= currAge) {
      setError("Retirement age must be greater than current age")
      return
    }
    
    if (lifeExp <= retAge) {
      setError("Life expectancy must be greater than retirement age")
      return
    }
    
    if (inflationRate >= postReturn) {
      setWarning("Warning: Inflation rate is higher than or equal to post-retirement return. This may affect corpus sustainability.")
    } else {
      setWarning("")
    }
    
    setError("")
    
    try {
      const calculation = FinancialCalculations.calculateRetirementPlanning(
        currAge, retAge, lifeExp, monthlyExp, inflationRate, preReturn, postReturn
      )
      setResult(calculation)
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    calculateRetirement()
  }, [currentAge, retirementAge, lifeExpectancy, currentMonthlyExpense, expectedInflationRate, preRetirementReturn, postRetirementReturn])

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4"
      >
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Retirement Planning Calculator</h2>
          <p className="text-muted-foreground">Estimate corpus needed for comfortable retirement</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="rounded-xl border bg-card p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Retirement Parameters</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="currentAge">Current Age</Label>
                <Input
                  id="currentAge"
                  type="number"
                  placeholder="e.g., 30"
                  value={currentAge}
                  onChange={(e) => setCurrentAge(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="retirementAge">Retirement Age</Label>
                <Input
                  id="retirementAge"
                  type="number"
                  placeholder="e.g., 60"
                  value={retirementAge}
                  onChange={(e) => setRetirementAge(e.target.value)}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="lifeExpectancy">Life Expectancy</Label>
              <Input
                id="lifeExpectancy"
                type="number"
                placeholder="e.g., 85"
                value={lifeExpectancy}
                onChange={(e) => setLifeExpectancy(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="currentMonthlyExpense">Current Monthly Expense (₹)</Label>
              <Input
                id="currentMonthlyExpense"
                type="number"
                placeholder="e.g., 40000"
                value={currentMonthlyExpense}
                onChange={(e) => setCurrentMonthlyExpense(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="expectedInflationRate">Expected Inflation Rate (%)</Label>
              <Input
                id="expectedInflationRate"
                type="number"
                step="0.1"
                placeholder="e.g., 6"
                value={expectedInflationRate}
                onChange={(e) => setExpectedInflationRate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="preRetirementReturn">Pre-Retirement Return (%)</Label>
                <Input
                  id="preRetirementReturn"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 12"
                  value={preRetirementReturn}
                  onChange={(e) => setPreRetirementReturn(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="postRetirementReturn">Post-Retirement Return (%)</Label>
                <Input
                  id="postRetirementReturn"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 8"
                  value={postRetirementReturn}
                  onChange={(e) => setPostRetirementReturn(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            {warning && (
              <div className="text-sm text-orange-500 bg-orange-50 p-2 rounded flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                {warning}
              </div>
            )}
          </div>
        </motion.div>

        {/* Results */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-4"
        >
          {result ? (
            <>
              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold">Required Retirement Corpus</h3>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {formatINR(result.retirementCorpusRequired)}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Retirement Summary</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Expense at Retirement</span>
                    <span className="font-semibold">{formatCurrency(result.futureMonthlyExpenseAtRetirement)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Annual Expense at Retirement</span>
                    <span className="font-semibold">{formatCurrency(result.annualExpenseAtRetirement)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Retirement Duration</span>
                    <span className="font-semibold">{result.retirementYears} years</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-blue-800">Key Insight</h3>
                </div>
                <p className="text-sm text-blue-700">
                  At your current lifestyle, you will need <strong>{formatINR(result.retirementCorpusRequired)}</strong> to retire comfortably for {result.retirementYears} years, accounting for inflation.
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border bg-card p-6 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Enter Retirement Details</h3>
              <p className="text-muted-foreground text-sm">
                Configure your retirement parameters to calculate required corpus
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Year-wise Breakdown Table */}
      {result && result.yearlyBreakdown && result.yearlyBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-4">Retirement Expense & Corpus Breakdown</h3>
          <div className="overflow-x-auto max-h-96">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-card">
              <div>Age</div>
              <div className="text-right">Annual Expense</div>
              <div className="text-right">Remaining Corpus</div>
              <div className="text-right">Corpus Status</div>
            </div>
            <div className="space-y-1">
              {result.yearlyBreakdown.slice(0, 25).map((year: any) => (
                <div key={year.year} className="grid grid-cols-4 gap-2 text-sm py-1">
                  <div className="font-medium">{year.year}</div>
                  <div className="text-right text-red-600">{formatCurrency(year.annualExpense)}</div>
                  <div className="text-right font-semibold">{formatCurrency(year.remainingCorpus)}</div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${
                      year.remainingCorpus > year.annualExpense * 5 
                        ? 'bg-green-100 text-green-800' 
                        : year.remainingCorpus > 0 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {year.remainingCorpus > year.annualExpense * 5 
                        ? 'Healthy' 
                        : year.remainingCorpus > 0 
                        ? 'Low' 
                        : 'Depleted'
                      }
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}