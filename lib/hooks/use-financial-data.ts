"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { toast } from "sonner"
import type {
  FinancialAccount,
  IncomeTransaction,
  Expense,
  Investment,
  Loan,
  FinancialGoal,
  AIInsight,
  SimulationRecord,
} from "@/lib/types/database"

export function useFinancialData() {
  const [accounts, setAccounts] = useState<FinancialAccount[]>([])
  const [income, setIncome] = useState<IncomeTransaction[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loans, setLoans] = useState<Loan[]>([])
  const [goals, setGoals] = useState<FinancialGoal[]>([])
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [simulations, setSimulations] = useState<SimulationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchAll = useCallback(async () => {
    try {
      setIsLoading(true)
      const [accRes, incRes, expRes, invRes, loanRes, goalRes, insRes, simRes] = await Promise.all([
        fetch("/api/accounts").then((r) => r.json()),
        fetch("/api/income").then((r) => r.json()),
        fetch("/api/expenses").then((r) => r.json()),
        fetch("/api/investments").then((r) => r.json()),
        fetch("/api/loans").then((r) => r.json()),
        fetch("/api/goals").then((r) => r.json()),
        fetch("/api/ai/insights").then((r) => r.json()),
        fetch("/api/simulations").then((r) => r.json()),
      ])

      if (Array.isArray(accRes)) setAccounts(accRes)
      if (Array.isArray(incRes)) setIncome(incRes)
      if (Array.isArray(expRes)) setExpenses(expRes)
      if (Array.isArray(invRes)) setInvestments(invRes)
      if (Array.isArray(loanRes)) setLoans(loanRes)
      if (Array.isArray(goalRes)) setGoals(goalRes)
      if (Array.isArray(insRes)) setInsights(insRes)
      if (Array.isArray(simRes)) setSimulations(simRes)
    } catch (e) {
      console.error("Failed to load financial data:", e)
      toast.error("Failed to sync financial data")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  // Computed financial KPIs
  const summary = useMemo(() => {
    const totalCashSavings = accounts.reduce((acc, a) => acc + Number(a.current_balance || 0), 0)
    const totalInvestments = investments.reduce((acc, i) => acc + Number(i.current_value || 0), 0)
    const totalOutstandingLoans = loans.reduce((acc, l) => acc + Number(l.outstanding_amount || 0), 0)
    const netWorth = totalCashSavings + totalInvestments - totalOutstandingLoans

    const monthlyIncome = income.reduce((acc, i) => acc + Number(i.amount || 0), 0) || 185000
    const monthlyExpenses = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0) || 68000
    const monthlyEmi = loans.reduce((acc, l) => acc + Number(l.monthly_emi || 0), 0) || 31250
    const monthlyCashFlow = monthlyIncome - monthlyExpenses - monthlyEmi

    const totalSpend = monthlyExpenses + monthlyEmi
    const emergencyRunwayMonths = totalSpend > 0 ? Number((totalCashSavings / totalSpend).toFixed(1)) : 12

    // Risk score 0 to 100
    let riskScore = 42
    if (emergencyRunwayMonths >= 6) riskScore -= 15
    else if (emergencyRunwayMonths < 3) riskScore += 25

    if (totalOutstandingLoans > totalCashSavings + totalInvestments) riskScore += 30
    riskScore = Math.min(Math.max(riskScore, 10), 95)

    return {
      totalCashSavings,
      totalInvestments,
      totalOutstandingLoans,
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      monthlyEmi,
      monthlyCashFlow,
      emergencyRunwayMonths,
      riskScore,
    }
  }, [accounts, investments, loans, income, expenses])

  // Account CRUD
  const addAccount = async (account: Omit<FinancialAccount, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(account),
      })
      if (!res.ok) throw new Error("Failed to add account")
      const newAcc = await res.json()
      setAccounts((prev) => [newAcc, ...prev])
      toast.success("Account connected successfully")
      return newAcc
    } catch (err: any) {
      toast.error(err.message || "Failed to add account")
      throw err
    }
  }

  const deleteAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/accounts?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete account")
      setAccounts((prev) => prev.filter((a) => a.id !== id))
      toast.success("Account disconnected")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete account")
    }
  }

  // Expense CRUD
  const addExpense = async (expense: Omit<Expense, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const res = await fetch("/api/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(expense),
      })
      if (!res.ok) throw new Error("Failed to log expense")
      const newExp = await res.json()
      setExpenses((prev) => [newExp, ...prev])
      toast.success("Expense recorded")
      return newExp
    } catch (err: any) {
      toast.error(err.message || "Failed to add expense")
      throw err
    }
  }

  const deleteExpense = async (id: string) => {
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete expense")
      setExpenses((prev) => prev.filter((e) => e.id !== id))
      toast.success("Expense removed")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete expense")
    }
  }

  // Income CRUD
  const addIncome = async (inc: Omit<IncomeTransaction, "id" | "user_id" | "created_at">) => {
    try {
      const res = await fetch("/api/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inc),
      })
      if (!res.ok) throw new Error("Failed to add income")
      const newInc = await res.json()
      setIncome((prev) => [newInc, ...prev])
      toast.success("Income logged successfully")
      return newInc
    } catch (err: any) {
      toast.error(err.message || "Failed to add income")
      throw err
    }
  }

  const deleteIncome = async (id: string) => {
    try {
      const res = await fetch(`/api/income?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete income")
      setIncome((prev) => prev.filter((i) => i.id !== id))
      toast.success("Income deleted")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete income")
    }
  }

  // Investment CRUD
  const addInvestment = async (inv: Omit<Investment, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const res = await fetch("/api/investments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(inv),
      })
      if (!res.ok) throw new Error("Failed to add investment")
      const newInv = await res.json()
      setInvestments((prev) => [newInv, ...prev])
      toast.success("Investment added to portfolio")
      return newInv
    } catch (err: any) {
      toast.error(err.message || "Failed to add investment")
      throw err
    }
  }

  const deleteInvestment = async (id: string) => {
    try {
      const res = await fetch(`/api/investments?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete investment")
      setInvestments((prev) => prev.filter((i) => i.id !== id))
      toast.success("Investment removed")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete investment")
    }
  }

  // Loans CRUD
  const addLoan = async (loan: Omit<Loan, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loan),
      })
      if (!res.ok) throw new Error("Failed to record liability")
      const newLoan = await res.json()
      setLoans((prev) => [newLoan, ...prev])
      toast.success("Loan recorded")
      return newLoan
    } catch (err: any) {
      toast.error(err.message || "Failed to record loan")
      throw err
    }
  }

  const deleteLoan = async (id: string) => {
    try {
      const res = await fetch(`/api/loans?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete loan")
      setLoans((prev) => prev.filter((l) => l.id !== id))
      toast.success("Loan liability removed")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete loan")
    }
  }

  // Goals CRUD
  const addGoal = async (goal: Omit<FinancialGoal, "id" | "user_id" | "created_at" | "updated_at">) => {
    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(goal),
      })
      if (!res.ok) throw new Error("Failed to create goal")
      const newGoal = await res.json()
      setGoals((prev) => [newGoal, ...prev])
      toast.success("Financial goal set!")
      return newGoal
    } catch (err: any) {
      toast.error(err.message || "Failed to add goal")
      throw err
    }
  }

  const updateGoal = async (id: string, updates: Partial<FinancialGoal>) => {
    try {
      const res = await fetch("/api/goals", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      })
      if (!res.ok) throw new Error("Failed to update goal")
      const updated = await res.json()
      setGoals((prev) => prev.map((g) => (g.id === id ? updated : g)))
      toast.success("Goal progress updated")
      return updated
    } catch (err: any) {
      toast.error(err.message || "Failed to update goal")
      throw err
    }
  }

  const deleteGoal = async (id: string) => {
    try {
      const res = await fetch(`/api/goals?id=${id}`, { method: "DELETE" })
      if (!res.ok) throw new Error("Failed to delete goal")
      setGoals((prev) => prev.filter((g) => g.id !== id))
      toast.success("Goal removed")
    } catch (err: any) {
      toast.error(err.message || "Failed to delete goal")
    }
  }

  // Simulation execution
  const runSimulation = async (params: any) => {
    try {
      const res = await fetch("/api/simulations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })
      if (!res.ok) throw new Error("Failed to execute simulation")
      const sim = await res.json()
      setSimulations((prev) => [sim, ...prev])
      toast.success("Monte Carlo simulation completed (10,000 runs)")
      return sim
    } catch (err: any) {
      toast.error(err.message || "Simulation failed")
      throw err
    }
  }

  return {
    accounts,
    income,
    expenses,
    investments,
    loans,
    goals,
    insights,
    simulations,
    summary,
    isLoading,
    refreshData: fetchAll,
    addAccount,
    deleteAccount,
    addExpense,
    deleteExpense,
    addIncome,
    deleteIncome,
    addInvestment,
    deleteInvestment,
    addLoan,
    deleteLoan,
    addGoal,
    updateGoal,
    deleteGoal,
    runSimulation,
  }
}
