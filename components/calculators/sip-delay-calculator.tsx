"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Clock, DollarSign, AlertTriangle, ArrowLeft, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency, formatINRCompact } from "@/lib/format"
import { FinancialCalculations } from "@/lib/utils/financial-calculations"

interface SIPDelayCalculatorProps {
  onBack: () => void
}

export function SIPDelayCalculator({ onBack }: SIPDelayCalculatorProps) {
  const [monthlySIP, setMonthlySIP] = useState<string>("5000")
  const [annualReturnRate, setAnnualReturnRate] = useState<string>("12")
  const [totalInvestmentYears, setTotalInvestmentYears] = useState<string>("10")
  const [delayYears, setDelayYears] = useState<string>("2")
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const calculateSIPDelay = () => {
    if (!monthlySIP || !annualReturnRate || !totalInvestmentYears || !delayYears) return
    
    const sipAmount = parseFloat(monthlySIP)
    const returnRate = parseFloat(annualReturnRate)
    const totalYears = parseInt(totalInvestmentYears)
    const delay = parseInt(delayYears)
    
    if (sipAmount <= 0 || returnRate <= 0 || totalYears <= 0 || delay < 0) {
      setError("Please enter valid positive numbers")
      return
    }
    
    if (delay >= totalYears) {
      setError("Delay years cannot be greater than or equal to total investment years")
      return
    }
    
    setError("")
    
    try {
      const calculation = FinancialCalculations.calculateSIPDelay(sipAmount, returnRate, totalYears, delay)
      setResult(calculation)
    } catch (err: any) {
      setError(err.message)
    }
  }

  useEffect(() => {
    calculateSIPDelay()
  }, [monthlySIP, annualReturnRate, totalInvestmentYears, delayYears])

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
          <h2 className="text-2xl font-semibold tracking-tight">SIP Cost Delay Calculator</h2>
          <p className="text-muted-foreground">See the impact of delaying your SIP investments</p>
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
            <Clock className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">SIP Delay Parameters</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="monthlySIP">Monthly SIP Amount (₹)</Label>
              <Input
                id="monthlySIP"
                type="number"
                placeholder="e.g., 5000"
                value={monthlySIP}
                onChange={(e) => setMonthlySIP(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="annualReturnRate">Expected Annual Return (%)</Label>
              <Input
                id="annualReturnRate"
                type="number"
                step="0.1"
                placeholder="e.g., 12"
                value={annualReturnRate}
                onChange={(e) => setAnnualReturnRate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="totalInvestmentYears">Total SIP Duration (Years)</Label>
              <Input
                id="totalInvestmentYears"
                type="number"
                placeholder="e.g., 10"
                value={totalInvestmentYears}
                onChange={(e) => setTotalInvestmentYears(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="delayYears">Delay Duration (Years)</Label>
              <Input
                id="delayYears"
                type="number"
                placeholder="e.g., 2"
                value={delayYears}
                onChange={(e) => setDelayYears(e.target.value)}
              />
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {error}
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
                  <TrendingDown className="h-5 w-5 text-red-500" />
                  <h3 className="font-semibold">Loss Due to Delay</h3>
                </div>
                <div className="text-3xl font-bold text-red-600">
                  {formatCurrency(result.lossDueToDelay)}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <DollarSign className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Comparison Summary</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">SIP Started Immediately</span>
                    <span className="font-semibold text-green-600">{formatCurrency(result.sipStartedImmediately.maturityValue)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">SIP Started After {delayYears} Years</span>
                    <span className="font-semibold">{formatCurrency(result.sipStartedAfterDelay.maturityValue)}</span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Opportunity Loss</span>
                      <span className="font-bold text-red-600">{formatCurrency(result.lossDueToDelay)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-orange-200 bg-orange-50 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-5 w-5 text-orange-500" />
                  <h3 className="font-semibold text-orange-800">Key Insight</h3>
                </div>
                <p className="text-sm text-orange-700">
                  Delaying your SIP by {delayYears} years can cost you <strong>{formatINRCompact(result.lossDueToDelay)}</strong> due to lost compounding benefits.
                </p>
              </div>
            </>
          ) : (
            <div className="rounded-xl border bg-card p-6 text-center">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Enter SIP Parameters</h3>
              <p className="text-muted-foreground text-sm">
                Configure your SIP details to see the cost of delay
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Year-wise Comparison Table */}
      {result && result.yearlyBreakdown && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-4">Year-wise Comparison</h3>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground mb-2">
              <div>Year</div>
              <div className="text-right">SIP Without Delay</div>
              <div className="text-right">SIP With Delay</div>
              <div className="text-right">Difference</div>
            </div>
            <div className="space-y-1">
              {result.yearlyBreakdown.map((year: any) => (
                <div key={year.year} className="grid grid-cols-4 gap-2 text-sm py-1">
                  <div className="font-medium">Year {year.year}</div>
                  <div className="text-right text-green-600 font-semibold">{formatCurrency(year.valueWithoutDelay)}</div>
                  <div className="text-right font-semibold">
                    {year.valueWithDelay > 0 ? formatCurrency(year.valueWithDelay) : "₹0"}
                  </div>
                  <div className="text-right text-red-600 font-semibold">
                    {formatCurrency(year.valueWithoutDelay - year.valueWithDelay)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Investment Summary */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          <div className="rounded-xl border bg-green-50 border-green-200 p-6">
            <h4 className="font-semibold text-green-800 mb-3">SIP Started Immediately</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-green-700">Total Investment:</span>
                <span className="font-semibold">{formatCurrency(result.sipStartedImmediately.totalInvestment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Maturity Value:</span>
                <span className="font-semibold">{formatCurrency(result.sipStartedImmediately.maturityValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-green-700">Returns:</span>
                <span className="font-semibold">{formatCurrency(result.sipStartedImmediately.maturityValue - result.sipStartedImmediately.totalInvestment)}</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-gray-50 border-gray-200 p-6">
            <h4 className="font-semibold text-gray-800 mb-3">SIP Started After {delayYears} Years</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Total Investment:</span>
                <span className="font-semibold">{formatCurrency(result.sipStartedAfterDelay.totalInvestment)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Maturity Value:</span>
                <span className="font-semibold">{formatCurrency(result.sipStartedAfterDelay.maturityValue)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Returns:</span>
                <span className="font-semibold">{formatCurrency(result.sipStartedAfterDelay.maturityValue - result.sipStartedAfterDelay.totalInvestment)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}