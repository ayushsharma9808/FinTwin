"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Target, DollarSign, Calendar, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/format"
import { FinancialCalculations } from "@/lib/utils/financial-calculations"

interface GoalSIPCalculatorProps {
  onBack: () => void
}

export function GoalSIPCalculator({ onBack }: GoalSIPCalculatorProps) {
  const [targetAmount, setTargetAmount] = useState<string>("1000000")
  const [years, setYears] = useState<string>("10")
  const [annualRate, setAnnualRate] = useState<string>("12")
  const [result, setResult] = useState<any>(null)

  const calculateGoalSIP = () => {
    if (!targetAmount || !years || !annualRate) return
    
    const target = parseFloat(targetAmount)
    const duration = parseInt(years)
    const rate = parseFloat(annualRate)
    
    if (target <= 0 || duration <= 0 || rate <= 0) return
    
    const calculation = FinancialCalculations.calculateGoalSIP(target, duration, rate)
    setResult(calculation)
  }

  useEffect(() => {
    calculateGoalSIP()
  }, [targetAmount, years, annualRate])

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
          <h2 className="text-2xl font-semibold tracking-tight">Goal SIP Calculator</h2>
          <p className="text-muted-foreground">Calculate SIP needed to achieve your financial goal</p>
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
            <Target className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Goal Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="targetAmount">Target Amount (₹)</Label>
              <Input
                id="targetAmount"
                type="number"
                placeholder="e.g., 1000000"
                value={targetAmount}
                onChange={(e) => setTargetAmount(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="years">Time Horizon (Years)</Label>
              <Input
                id="years"
                type="number"
                placeholder="e.g., 10"
                value={years}
                onChange={(e) => setYears(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="annualRate">Expected Annual Return (%)</Label>
              <Input
                id="annualRate"
                type="number"
                step="0.1"
                placeholder="e.g., 12"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
              />
            </div>
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
                  <h3 className="font-semibold">Required Monthly SIP</h3>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(result.requiredSIP)}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Goal Summary</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Target Amount</span>
                    <span className="font-semibold">{formatCurrency(result.targetAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Investment</span>
                    <span className="font-semibold">{formatCurrency(result.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Expected Returns</span>
                    <span className="font-semibold text-green-600">{formatCurrency(result.totalReturns)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return Multiple</span>
                    <span className="font-semibold">{(result.targetAmount / result.totalInvestment).toFixed(2)}x</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-2">Investment Strategy</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Invest {formatCurrency(result.requiredSIP)} monthly for {years} years</p>
                  <p>• Total investment: {formatCurrency(result.totalInvestment)}</p>
                  <p>• Expected wealth creation: {formatCurrency(result.totalReturns)}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border bg-card p-6 text-center">
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Set Your Financial Goal</h3>
              <p className="text-muted-foreground text-sm">
                Enter your target amount and time horizon to calculate required SIP
              </p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}