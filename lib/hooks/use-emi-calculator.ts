import { useState, useCallback } from "react"
import { EMICalculatorAPI } from "@/lib/api/emi-calculator"

interface EMIParams {
  principal: number
  rate: number
  tenure: number
  tenureType: 'months' | 'years'
}

interface EMIResult {
  emi: number
  emi_breakdown: Array<{
    year: number
    yearly_emi: number
    yearly_principal: number
    yearly_interest: number
    monthly_breakdown: Array<{
      month: number
      monthly_emi: number
      monthly_principal: number
      monthly_interest: number
      remaining_loan_amount: number
    }>
  }>
}

export function useEMICalculator() {
  const [result, setResult] = useState<EMIResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>("")

  const calculate = useCallback(async (params: EMIParams) => {
    setLoading(true)
    setError("")

    try {
      const response = await EMICalculatorAPI.calculateEMI(params)
      setResult(response)
    } catch (err) {
      setError("Failed to calculate EMI. Please try again.")
      setResult(null)
    } finally {
      setLoading(false)
    }
  }, [])

  const reset = useCallback(() => {
    setResult(null)
    setError("")
    setLoading(false)
  }, [])

  return {
    result,
    loading,
    error,
    calculate,
    reset
  }
}