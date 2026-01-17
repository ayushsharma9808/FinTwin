"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { BarChart3, DollarSign, Calendar, ArrowLeft, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { formatCurrency } from "@/lib/format"
import { FinancialCalculations } from "@/lib/utils/financial-calculations"

interface SWPCalculatorProps {
  onBack: () => void
}

export function SWPCalculator({ onBack }: SWPCalculatorProps) {
  const [initialInvestment, setInitialInvestment] = useState<string>("1000000")
  const [monthlyWithdrawal, setMonthlyWithdrawal] = useState<string>("10000")
  const [annualRate, setAnnualRate] = useState<string>("8")
  const [years, setYears] = useState<string>("15")
  const [result, setResult] = useState<any>(null)

  const calculateSWP = () => {
    if (!initialInvestment || !monthlyWithdrawal || !annualRate || !years) return
    
    const investment = parseFloat(initialInvestment)
    const withdrawal = parseFloat(monthlyWithdrawal)
    const rate = parseFloat(annualRate)
    const duration = parseInt(years)
    
    if (investment <= 0 || withdrawal <= 0 || rate <= 0 || duration <= 0) return
    
    const calculation = FinancialCalculations.calculateSWP(investment, withdrawal, rate, duration)
    setResult(calculation)
  }

  useEffect(() => {
    calculateSWP()
  }, [initialInvestment, monthlyWithdrawal, annualRate, years])

  const getWithdrawalSustainability = () => {
    if (!result) return null
    
    const monthsLasted = result.monthlyBreakdown.length
    const totalMonths = parseInt(years) * 12
    
    if (monthsLasted >= totalMonths) {
      return { status: "sustainable", message: "Withdrawal is sustainable for the entire period" }
    } else {
      const yearsLasted = Math.floor(monthsLasted / 12)
      const monthsRemaining = monthsLasted % 12
      return { 
        status: "unsustainable", 
        message: `Corpus will be exhausted in ${yearsLasted} years and ${monthsRemaining} months` 
      }
    }
  }

  const sustainability = getWithdrawalSustainability()

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
          <h2 className="text-2xl font-semibold tracking-tight">SWP Calculator</h2>
          <p className="text-muted-foreground">Plan systematic withdrawals from your investment corpus</p>
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
            <BarChart3 className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">SWP Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="initialInvestment">Initial Investment (₹)</Label>
              <Input
                id="initialInvestment"
                type="number"
                placeholder="e.g., 1000000"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="monthlyWithdrawal">Monthly Withdrawal (₹)</Label>
              <Input
                id="monthlyWithdrawal"
                type="number"
                placeholder="e.g., 10000"
                value={monthlyWithdrawal}
                onChange={(e) => setMonthlyWithdrawal(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="annualRate">Expected Annual Return (%)</Label>
              <Input
                id="annualRate"
                type="number"
                step="0.1"
                placeholder="e.g., 8"
                value={annualRate}
                onChange={(e) => setAnnualRate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="years">Withdrawal Period (Years)</Label>
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
                  <h3 className="font-semibold">Remaining Balance</h3>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(result.remainingBalance)}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingDown className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Withdrawal Summary</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Withdrawn</span>
                    <span className="font-semibold">{formatCurrency(result.totalWithdrawn)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly Amount</span>
                    <span className="font-semibold">{formatCurrency(parseInt(monthlyWithdrawal))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Withdrawal Rate</span>
                    <span className="font-semibold">{((parseInt(monthlyWithdrawal) * 12 / parseInt(initialInvestment)) * 100).toFixed(2)}%</span>
                  </div>
                </div>
              </div>

              {sustainability && (
                <div className={`rounded-xl border bg-card p-6 ${sustainability.status === 'unsustainable' ? 'border-red-200' : 'border-green-200'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className={`h-5 w-5 ${sustainability.status === 'unsustainable' ? 'text-red-500' : 'text-green-500'}`} />
                    <h3 className="font-semibold">Sustainability Analysis</h3>
                  </div>
                  <p className={`text-sm ${sustainability.status === 'unsustainable' ? 'text-red-600' : 'text-green-600'}`}>
                    {sustainability.message}
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border bg-card p-6 text-center">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Enter SWP Details</h3>
              <p className="text-muted-foreground text-sm">
                Configure your systematic withdrawal plan parameters
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Monthly Breakdown Table */}
      {result && result.monthlyBreakdown && result.monthlyBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-4">Monthly Withdrawal Schedule</h3>
          <div className="overflow-x-auto max-h-96">
            <div className="grid grid-cols-6 gap-2 text-xs font-medium text-muted-foreground mb-2 sticky top-0 bg-card">
              <div>Month</div>
              <div className="text-right">Year</div>
              <div className="text-right">Withdrawal</div>
              <div className="text-right">Returns</div>
              <div className="text-right">Balance</div>
              <div className="text-right">Status</div>
            </div>
            <div className="space-y-1">
              {result.monthlyBreakdown.slice(0, 60).map((month: any) => (
                <div key={month.month} className="grid grid-cols-6 gap-2 text-sm py-1">
                  <div className="font-medium">{month.month}</div>
                  <div className="text-right">{month.year}</div>
                  <div className="text-right text-red-600">{formatCurrency(parseInt(monthlyWithdrawal))}</div>
                  <div className="text-right text-green-600">{formatCurrency(month.returns)}</div>
                  <div className="text-right font-semibold">{formatCurrency(month.balance)}</div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-1 rounded ${month.balance > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {month.balance > 0 ? 'Active' : 'Depleted'}
                    </span>
                  </div>
                </div>
              ))}
              {result.monthlyBreakdown.length > 60 && (
                <div className="text-center text-sm text-muted-foreground py-2">
                  ... and {result.monthlyBreakdown.length - 60} more months
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Year-wise Summary */}
      {result && result.chartData && result.chartData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border bg-card p-6"
        >
          <h3 className="font-semibold mb-4">Year-wise Balance Summary</h3>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-4 gap-2 text-xs font-medium text-muted-foreground mb-2">
              <div>Year</div>
              <div className="text-right">Annual Withdrawal</div>
              <div className="text-right">Year-end Balance</div>
              <div className="text-right">Depletion %</div>
            </div>
            <div className="space-y-1">
              {result.chartData.map((year: any) => (
                <div key={year.year} className="grid grid-cols-4 gap-2 text-sm py-1">
                  <div className="font-medium">Year {year.year}</div>
                  <div className="text-right text-red-600">{formatCurrency(year.withdrawn)}</div>
                  <div className="text-right font-semibold">{formatCurrency(year.balance)}</div>
                  <div className="text-right">
                    {(((parseInt(initialInvestment) - year.balance) / parseInt(initialInvestment)) * 100).toFixed(1)}%
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