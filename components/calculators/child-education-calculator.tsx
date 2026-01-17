"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { GraduationCap, DollarSign, Calendar, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { formatCurrency } from "@/lib/format"
import { FinancialCalculations } from "@/lib/utils/financial-calculations"
import { DashboardLayout } from "@/components/layout/dashboard-layout"

export default function ChildEducationCalculator() {
  const [childCurrentAge, setChildCurrentAge] = useState<string>("5")
  const [educationStartAge, setEducationStartAge] = useState<string>("18")
  const [currentEducationCost, setCurrentEducationCost] = useState<string>("1500000")
  const [educationInflationRate, setEducationInflationRate] = useState<string>("8")
  const [expectedInvestmentReturn, setExpectedInvestmentReturn] = useState<string>("12")
  const [investmentType, setInvestmentType] = useState<"SIP" | "Lumpsum">("SIP")
  const [result, setResult] = useState<any>(null)

  const calculate = () => {
    if (!childCurrentAge || !educationStartAge || !currentEducationCost || !educationInflationRate || !expectedInvestmentReturn) return
    
    const childAge = parseInt(childCurrentAge)
    const eduAge = parseInt(educationStartAge)
    const cost = parseFloat(currentEducationCost)
    const inflation = parseFloat(educationInflationRate)
    const returns = parseFloat(expectedInvestmentReturn)
    
    if (childAge <= 0 || eduAge <= childAge || cost <= 0 || inflation < 0 || returns <= 0) return
    
    try {
      const calculation = FinancialCalculations.calculateChildEducationPlanning(
        childAge, eduAge, cost, inflation, returns, investmentType
      )
      setResult(calculation)
    } catch (error) {
      console.error("Calculation error:", error)
      setResult(null)
    }
  }

  useEffect(() => {
    calculate()
  }, [childCurrentAge, educationStartAge, currentEducationCost, educationInflationRate, expectedInvestmentReturn, investmentType])

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold tracking-tight flex items-center justify-center gap-2">
            <GraduationCap className="h-6 w-6 text-blue-500" />
            Child Education Planning Calculator
          </h2>
          <p className="text-muted-foreground mt-2">Plan and save for your child's future education expenses</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-xl border bg-card p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold">Education Planning Details</h3>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="childCurrentAge">Child's Current Age</Label>
                  <Input
                    id="childCurrentAge"
                    type="number"
                    placeholder="e.g., 5"
                    value={childCurrentAge}
                    onChange={(e) => setChildCurrentAge(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="educationStartAge">Education Start Age</Label>
                  <Input
                    id="educationStartAge"
                    type="number"
                    placeholder="e.g., 18"
                    value={educationStartAge}
                    onChange={(e) => setEducationStartAge(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="currentEducationCost">Current Education Cost (₹)</Label>
                <Input
                  id="currentEducationCost"
                  type="number"
                  placeholder="e.g., 1500000"
                  value={currentEducationCost}
                  onChange={(e) => setCurrentEducationCost(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="educationInflationRate">Education Inflation (%)</Label>
                  <Input
                    id="educationInflationRate"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 8"
                    value={educationInflationRate}
                    onChange={(e) => setEducationInflationRate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="expectedInvestmentReturn">Expected Return (%)</Label>
                  <Input
                    id="expectedInvestmentReturn"
                    type="number"
                    step="0.5"
                    placeholder="e.g., 12"
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
                    <h3 className="font-semibold">Future Education Cost</h3>
                  </div>
                  <div className="text-3xl font-bold text-red-600">
                    {formatCurrency(result.futureEducationCost)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    in {result.yearsToEducation} years
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
                    <div className="text-yellow-600 font-medium text-sm">💡 Key Insight</div>
                  </div>
                  <p className="text-sm text-yellow-700 mt-1">
                    To fund your child's education at age {educationStartAge}, you will need {formatCurrency(result.futureEducationCost)}, requiring a {investmentType === "SIP" ? `monthly SIP of ${formatCurrency(result.monthlySIPRequired)}` : `lump sum of ${formatCurrency(result.lumpsumRequired)}`}.
                  </p>
                </div>
              </>
            ) : (
              <div className="rounded-xl border bg-card p-6 text-center">
                <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">Enter Education Details</h3>
                <p className="text-muted-foreground text-sm">
                  Fill in your child's details and education cost to see planning projections
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
                <div className="text-right">Invested Amount</div>
                <div className="text-right">Portfolio Value</div>
              </div>
              <div className="space-y-2">
                {result.yearlyBreakdown.map((year: any) => (
                  <div key={year.year} className="grid grid-cols-3 gap-4 text-sm py-2 hover:bg-muted/50 rounded">
                    <div className="font-medium">Year {year.year}</div>
                    <div className="text-right">{formatCurrency(year.investedAmount)}</div>
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