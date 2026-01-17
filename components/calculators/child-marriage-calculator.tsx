"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Heart, DollarSign, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/format"
import { FinancialCalculations } from "@/lib/utils/financial-calculations"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function ChildMarriageCalculator() {
  const [childCurrentAge, setChildCurrentAge] = useState<string>("10")
  const [expectedMarriageAge, setExpectedMarriageAge] = useState<string>("25")
  const [currentMarriageCost, setCurrentMarriageCost] = useState<string>("2000000")
  const [marriageInflationRate, setMarriageInflationRate] = useState<string>("7")
  const [expectedInvestmentReturn, setExpectedInvestmentReturn] = useState<string>("11")
  const [investmentType, setInvestmentType] = useState<"SIP" | "Lumpsum">("SIP")
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    if (!childCurrentAge || !expectedMarriageAge || !currentMarriageCost || !marriageInflationRate || !expectedInvestmentReturn) return
    
    const childAge = parseInt(childCurrentAge)
    const marriageAge = parseInt(expectedMarriageAge)
    const cost = parseFloat(currentMarriageCost)
    const inflation = parseFloat(marriageInflationRate)
    const returns = parseFloat(expectedInvestmentReturn)
    
    if (childAge <= 0 || marriageAge <= childAge || cost <= 0 || inflation < 0 || returns <= 0) return
    
    try {
      const calculation = FinancialCalculations.calculateChildMarriagePlanning(
        childAge, marriageAge, cost, inflation, returns, investmentType
      )
      setResult(calculation)
    } catch (error) {
      console.error("Calculation error:", error)
      setResult(null)
    }
  }

  useEffect(() => {
    calculate()
  }, [childCurrentAge, expectedMarriageAge, currentMarriageCost, marriageInflationRate, expectedInvestmentReturn, investmentType])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold tracking-tight flex items-center justify-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            Child Marriage Planning Calculator
          </h2>
          <p className="text-muted-foreground mt-2">Plan and save for your child's future marriage expenses</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-pink-500" />
              <h3 className="font-semibold">Marriage Planning Details</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childCurrentAge">Child's Current Age</Label>
                  <Input
                    id="childCurrentAge"
                    type="number"
                    placeholder="e.g., 10"
                    value={childCurrentAge}
                    onChange={(e) => setChildCurrentAge(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedMarriageAge">Expected Marriage Age</Label>
                  <Input
                    id="expectedMarriageAge"
                    type="number"
                    placeholder="e.g., 25"
                    value={expectedMarriageAge}
                    onChange={(e) => setExpectedMarriageAge(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="currentMarriageCost">Current Marriage Cost (₹)</Label>
                <Input
                  id="currentMarriageCost"
                  type="number"
                  placeholder="e.g., 2000000"
                  value={currentMarriageCost}
                  onChange={(e) => setCurrentMarriageCost(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="marriageInflationRate">Marriage Inflation (%)</Label>
                  <Input
                    id="marriageInflationRate"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 7"
                    value={marriageInflationRate}
                    onChange={(e) => setMarriageInflationRate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedInvestmentReturn">Expected Return (%)</Label>
                  <Input
                    id="expectedInvestmentReturn"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 11"
                    value={expectedInvestmentReturn}
                    onChange={(e) => setExpectedInvestmentReturn(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="investmentType">Investment Type</Label>
                <Select value={investmentType} onValueChange={(value: "SIP" | "Lumpsum") => setInvestmentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SIP">Monthly SIP</SelectItem>
                    <SelectItem value="Lumpsum">Lump Sum</SelectItem>
                  </SelectContent>
                </Select>
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
                    <DollarSign className="h-5 w-5 text-red-500" />
                    <h3 className="font-semibold">Future Marriage Cost</h3>
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    {formatCurrency(result.futureMarriageCost)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    in {result.yearsToMarriage} years
                  </p>
                </div>

                <div className="rounded-xl border bg-card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-green-500" />
                    <h3 className="font-semibold">Required Investment</h3>
                  </div>
                  {investmentType === "SIP" ? (
                    <>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(result.monthlySIPRequired)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">per month</p>
                      {result.monthlySIPRequired < 1000 && (
                        <p className="text-xs text-orange-600 mt-2">💡 Consider minimum ₹1,000 SIP</p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="text-3xl font-bold text-green-600">
                        {formatCurrency(result.lumpsumRequired)}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">one-time investment</p>
                    </>
                  )}
                </div>

                <div className="rounded-xl border bg-yellow-50 border-yellow-200 p-4">
                  <div className="flex items-start gap-2">
                    <div className="text-yellow-600 font-medium text-sm">💡 Smart Insight</div>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    To meet a future marriage expense of {formatCurrency(result.futureMarriageCost)} in {result.yearsToMarriage} years, you need to invest {investmentType === "SIP" ? `₹${result.monthlySIPRequired.toLocaleString()} per month through SIP` : `${formatCurrency(result.lumpsumRequired)} as lump sum`} at {expectedInvestmentReturn}% returns.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-xl border bg-card p-6 text-center">
                <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Enter Marriage Details</h3>
                <p className="text-muted-foreground text-sm">
                  Fill in your child's details and marriage cost to see planning projections
                </p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Year-wise Breakdown Table */}
        {result && result.yearlyBreakdown && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border bg-card p-6"
          >
            <h3 className="font-semibold mb-4">Year-wise Investment Growth</h3>
            <div className="overflow-x-auto">
              <div className="grid grid-cols-3 gap-4 text-sm font-medium text-muted-foreground mb-2 pb-2 border-b">
                <div>Year</div>
                <div className="text-right">Total Invested</div>
                <div className="text-right">Portfolio Value</div>
              </div>
              <div className="space-y-2">
                {result.yearlyBreakdown.map((year: any) => (
                  <div key={year.year} className="grid grid-cols-3 gap-4 text-sm py-2 hover:bg-muted/50 rounded">
                    <div className="font-medium">Year {year.year}</div>
                    <div className="text-right">{formatCurrency(year.totalInvested)}</div>
                    <div className="text-right font-semibold text-green-600">{formatCurrency(year.portfolioValue)}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  )
}