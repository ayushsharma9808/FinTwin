"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Calculator, TrendingUp, DollarSign, Calendar, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEMICalculator } from "@/lib/hooks/use-emi-calculator"
import { formatCurrency } from "@/lib/format"
import { EMIBreakdownTable } from "./emi-breakdown-table"

interface EMIResult {
  emi: number
  totalAmount: number
  totalInterest: number
}

interface SmartEMICalculatorProps {
  onBack: () => void
}

export function SmartEMICalculator({ onBack }: SmartEMICalculatorProps) {
  const [principal, setPrincipal] = useState<string>("")
  const [rate, setRate] = useState<string>("")
  const [tenure, setTenure] = useState<string>("")
  const [tenureType, setTenureType] = useState<"months" | "years">("years")
  const { result, loading, error, calculate, reset } = useEMICalculator()

  const handleCalculate = async () => {
    if (!principal || !rate || !tenure) {
      return
    }

    const principalNum = parseFloat(principal)
    const rateNum = parseFloat(rate)
    const tenureNum = parseInt(tenure)

    if (principalNum <= 0 || rateNum <= 0 || tenureNum <= 0) {
      return
    }

    await calculate({
      principal: principalNum,
      rate: rateNum,
      tenure: tenureNum,
      tenureType
    })
  }

  const handleReset = () => {
    setPrincipal("")
    setRate("")
    setTenure("")
    setTenureType("years")
    reset()
  }

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
          <h2 className="text-2xl font-semibold tracking-tight">Smart EMI Calculator</h2>
          <p className="text-muted-foreground">Calculate loan EMI with AI-powered insights</p>
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
            <Calculator className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold">Loan Details</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="principal">Loan Amount (₹)</Label>
              <Input
                id="principal"
                type="number"
                placeholder="e.g., 1000000"
                value={principal}
                onChange={(e) => setPrincipal(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="rate">Interest Rate (% per annum)</Label>
              <Input
                id="rate"
                type="number"
                step="0.1"
                placeholder="e.g., 8.5"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="tenure">Tenure</Label>
                <Input
                  id="tenure"
                  type="number"
                  placeholder="e.g., 20"
                  value={tenure}
                  onChange={(e) => setTenure(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="tenure-type">Type</Label>
                <Select value={tenureType} onValueChange={(value: "months" | "years") => setTenureType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="years">Years</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleCalculate} disabled={loading} className="flex-1">
                {loading ? "Calculating..." : "Calculate EMI"}
              </Button>
              <Button variant="outline" onClick={handleReset}>
                Reset
              </Button>
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
                  <h3 className="font-semibold">Monthly EMI</h3>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(result.emi)}
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold">Total Payment</h3>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Amount</span>
                    <span className="font-semibold">{formatCurrency(result.emi * (parseInt(tenure) * 12))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Interest</span>
                    <span className="font-semibold text-orange-600">{formatCurrency((result.emi * (parseInt(tenure) * 12)) - parseInt(principal))}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal</span>
                    <span className="font-semibold">{formatCurrency(parseInt(principal))}</span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  <h3 className="font-semibold">Loan Summary</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span>{rate}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tenure</span>
                    <span>{tenure} {tenureType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest vs Principal</span>
                    <span>{(((result.emi * (parseInt(tenure) * 12)) - parseInt(principal)) / parseInt(principal) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="rounded-xl border bg-card p-6 text-center">
              <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">Enter Loan Details</h3>
              <p className="text-muted-foreground text-sm">
                Fill in the loan amount, interest rate, and tenure to calculate your EMI
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* EMI Breakdown Table */}
      {result && result.emi_breakdown && result.emi_breakdown.length > 0 && (
        <EMIBreakdownTable breakdown={result.emi_breakdown} />
      )}
    </div>
  )
}