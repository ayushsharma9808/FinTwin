"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { TrendingUp, DollarSign, Calendar, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/format"
import { FinancialCalculations } from "@/lib/utils/financial-calculations"

interface StepUpSIPCalculatorProps {
  onBack: () => void
}

export function StepUpSIPCalculator({ onBack }: StepUpSIPCalculatorProps) {
  const [initialSIP, setInitialSIP] = useState<string>("5000")
  const [stepUpPercent, setStepUpPercent] = useState<string>("10")
  const [annualRate, setAnnualRate] = useState<string>("12")
  const [years, setYears] = useState<string>("15")
  const [result, setResult] = useState<any>(null)

  const calculateStepUpSIP = () => {
    if (!initialSIP || !stepUpPercent || !annualRate || !years) return
    
    const sipAmount = parseFloat(initialSIP)
    const stepUp = parseFloat(stepUpPercent)
    const rate = parseFloat(annualRate)
    const duration = parseInt(years)
    
    if (sipAmount <= 0 || stepUp < 0 || rate <= 0 || duration <= 0) return
    
    const calculation = FinancialCalculations.calculateStepUpSIP(sipAmount, stepUp, rate, duration)
    setResult(calculation)
  }

  useEffect(() => {
    calculateStepUpSIP()
  }, [initialSIP, stepUpPercent, annualRate, years])

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
          <h2 className="text-2xl font-semibold tracking-tight">Step-Up SIP Calculator</h2>
          <p className="text-muted-foreground">SIP with annual increment for better returns</p>
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
            <TrendingUp className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Step-Up SIP Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="initialSIP">Initial Monthly SIP (₹)</Label>
              <Input
                id="initialSIP"
                type="number"
                placeholder="e.g., 5000"
                value={initialSIP}
                onChange={(e) => setInitialSIP(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="stepUpPercent">Annual Step-Up (%)</Label>
              <Input
                id="stepUpPercent"
                type="number"
                step="0.1"
                placeholder="e.g., 10"
                value={stepUpPercent}
                onChange={(e) => setStepUpPercent(e.target.value)}
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

            <div>
              <Label htmlFor="years">Investment Period (Years)</Label>
              <Input
                id="years"
                type="number"
                placeholder="e.g., 15"
                value={years}
                onChange={(e) => setYears(e.target.value)}
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
                  <h3 className="font-semibold">Maturity Value</h3>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(result.maturityValue)}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Investment Summary</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Investment</span>
                    <span className="font-semibold">{formatCurrency(result.totalInvestment)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Returns</span>
                    <span className="font-semibold text-green-600">{formatCurrency(result.totalReturns)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Return Multiple</span>
                    <span className="font-semibold">{(result.maturityValue / result.totalInvestment).toFixed(2)}x</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold mb-2">Step-Up Benefits</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• Starting SIP: {formatCurrency(parseInt(initialSIP))}</p>
                  <p>• Annual increase: {stepUpPercent}%</p>
                  <p>• Final year SIP: {formatCurrency(parseInt(initialSIP) * Math.pow(1 + parseFloat(stepUpPercent) / 100, parseInt(years) - 1))}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border bg-card p-6 text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Enter Step-Up SIP Details</h3>
              <p className="text-muted-foreground text-sm">
                Configure your step-up SIP parameters to see enhanced returns
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Yearly Breakdown Table */}
      {result && result.yearlyBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-4">Year-wise Step-Up Breakdown</h3>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-5 gap-2 text-xs font-medium text-muted-foreground mb-2">
              <div>Year</div>
              <div className="text-right">Annual SIP</div>
              <div className="text-right">Returns</div>
              <div className="text-right">Total Value</div>
              <div className="text-right">Cumulative</div>
            </div>
            <div className="space-y-1">
              {result.yearlyBreakdown.map((year: any) => (
                <div key={year.year} className="grid grid-cols-5 gap-2 text-sm py-1">
                  <div className="font-medium">Year {year.year}</div>
                  <div className="text-right">{formatCurrency(year.investment)}</div>
                  <div className="text-right text-green-600">{formatCurrency(year.returns)}</div>
                  <div className="text-right font-semibold">{formatCurrency(year.totalValue)}</div>
                  <div className="text-right">{formatCurrency(year.cumulativeInvestment)}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}