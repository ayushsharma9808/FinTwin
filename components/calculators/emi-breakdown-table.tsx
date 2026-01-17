"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { ChevronDown, ChevronRight, Calendar, TrendingUp } from "lucide-react"
import { formatCurrency } from "@/lib/format"

interface MonthlyBreakdown {
  month: number
  monthly_emi: number
  monthly_principal: number
  monthly_interest: number
  remaining_loan_amount: number
}

interface YearlyBreakdown {
  year: number
  yearly_emi: number
  yearly_principal: number
  yearly_interest: number
  monthly_breakdown: MonthlyBreakdown[]
}

interface EMIBreakdownTableProps {
  breakdown: YearlyBreakdown[]
}

export function EMIBreakdownTable({ breakdown }: EMIBreakdownTableProps) {
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set())

  const toggleYear = (year: string) => {
    const newExpanded = new Set(expandedYears)
    if (newExpanded.has(year)) {
      newExpanded.delete(year)
    } else {
      newExpanded.add(year)
    }
    setExpandedYears(newExpanded)
  }

  if (!breakdown || breakdown.length === 0) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border bg-card p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="h-5 w-5 text-blue-500" />
        <h3 className="font-semibold">Payment Schedule</h3>
      </div>

      <div className="space-y-2">
        {breakdown.map((yearData) => (
          <div key={yearData.year} className="border rounded-lg">
            <button
              onClick={() => toggleYear(yearData.year)}
              className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                {expandedYears.has(yearData.year) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
                <span className="font-medium">Year {yearData.year}</span>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-right">
                  <div className="text-muted-foreground">Yearly EMI</div>
                  <div className="font-medium">{formatCurrency(yearData.yearly_emi)}</div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground">Principal</div>
                  <div className="font-medium text-green-600">{formatCurrency(yearData.yearly_principal)}</div>
                </div>
                <div className="text-right">
                  <div className="text-muted-foreground">Interest</div>
                  <div className="font-medium text-orange-600">{formatCurrency(yearData.yearly_interest)}</div>
                </div>
              </div>
            </button>

            {expandedYears.has(yearData.year) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t bg-muted/20"
              >
                <div className="p-4">
                  <div className="grid grid-cols-6 gap-2 text-xs font-medium text-muted-foreground mb-2">
                    <div>Month</div>
                    <div className="text-right">EMI</div>
                    <div className="text-right">Principal</div>
                    <div className="text-right">Interest</div>
                    <div className="text-right">Balance</div>
                    <div className="text-right">-</div>
                  </div>
                  <div className="space-y-1">
                    {yearData.monthly_breakdown.map((month) => (
                      <div key={month.month} className="grid grid-cols-6 gap-2 text-sm py-1">
                        <div className="font-medium">Month {month.month}</div>
                        <div className="text-right">{formatCurrency(month.monthly_emi)}</div>
                        <div className="text-right text-green-600">{formatCurrency(month.monthly_principal)}</div>
                        <div className="text-right text-orange-600">{formatCurrency(month.monthly_interest)}</div>
                        <div className="text-right">{formatCurrency(month.remaining_loan_amount)}</div>
                        <div className="text-right text-muted-foreground">-</div>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}