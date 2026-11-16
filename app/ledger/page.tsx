"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BentoCard } from "@/components/cards/bento-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowDownRight,
  ArrowUpRight,
  Plus,
  Trash2,
  Upload,
  Receipt,
  Filter,
  CreditCard,
  Calendar,
  DollarSign,
  TrendingUp,
} from "lucide-react"
import { useFinancialData } from "@/lib/hooks/use-financial-data"
import { formatINR } from "@/lib/format"
import { AddTransactionModal } from "@/components/modals/add-transaction-modal"
import { PdfUpload } from "@/components/upload/pdf-upload"
import { FinancialChatDrawer } from "@/components/ai/financial-chat-drawer"

export default function LedgerPage() {
  const { expenses, income, summary, isLoading, addExpense, deleteExpense, addIncome, deleteIncome, refreshData } =
    useFinancialData()

  const [activeTab, setActiveTab] = useState<"expenses" | "income">("expenses")
  const [modalType, setModalType] = useState<"expense" | "income" | null>(null)
  const [showUpload, setShowUpload] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredExpenses = expenses.filter((e) => {
    const matchesCategory = categoryFilter === "all" || e.category === categoryFilter
    const matchesSearch =
      (e.merchant || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredIncome = income.filter((i) => {
    const matchesCategory = categoryFilter === "all" || i.category === categoryFilter
    const matchesSearch =
      (i.source || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (i.description || "").toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

  // Category summary map
  const categoryTotals = expenses.reduce((acc: Record<string, number>, e) => {
    acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
    return acc
  }, {})

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Ledger & Expense Tracker</h2>
            <p className="text-muted-foreground">
              Review real financial transactions, categorize outflows, and log income
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowUpload(!showUpload)}
              className="flex items-center gap-1.5"
            >
              <Upload className="h-4 w-4" />
              {showUpload ? "Close Import" : "Import Statement"}
            </Button>
            <Button
              size="sm"
              onClick={() => setModalType(activeTab === "expenses" ? "expense" : "income")}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              {activeTab === "expenses" ? "Add Expense" : "Add Income"}
            </Button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <PdfUpload onDataParsed={() => refreshData()} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Monthly Inflow</span>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xl font-bold font-mono text-green-500">+{formatINR(summary.monthlyIncome)}</p>
          <span className="text-[11px] text-muted-foreground">{income.length} income sources</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Monthly Outflow</span>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </div>
          <p className="text-xl font-bold font-mono text-red-500">-{formatINR(summary.monthlyExpenses)}</p>
          <span className="text-[11px] text-muted-foreground">{expenses.length} tracked expenses</span>
        </div>

        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="text-xs font-medium">Net Monthly Cash Flow</span>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-bold font-mono text-foreground">
            {summary.monthlyCashFlow >= 0 ? "+" : ""}{formatINR(summary.monthlyCashFlow)}
          </p>
          <span className="text-[11px] text-muted-foreground">After ₹{formatINR(summary.monthlyEmi)} EMI obligations</span>
        </div>
      </div>

      {/* Main Ledger Table Card */}
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {/* Tab Controls and Search */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-border">
          <div className="flex rounded-lg bg-muted p-1">
            <button
              onClick={() => {
                setActiveTab("expenses")
                setCategoryFilter("all")
              }}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTab === "expenses"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Expenses ({expenses.length})
            </button>
            <button
              onClick={() => {
                setActiveTab("income")
                setCategoryFilter("all")
              }}
              className={`rounded-md px-3.5 py-1.5 text-xs font-medium transition-all ${
                activeTab === "income"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Income Transactions ({income.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <Input
              placeholder="Search merchant or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 h-8 text-xs"
            />
          </div>
        </div>

        {/* Expense Category Chips */}
        {activeTab === "expenses" && (
          <div className="flex gap-1.5 overflow-x-auto py-3 scrollbar-none border-b border-border">
            <button
              onClick={() => setCategoryFilter("all")}
              className={`rounded-full px-3 py-1 text-xs transition ${
                categoryFilter === "all"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "bg-muted text-muted-foreground hover:bg-accent"
              }`}
            >
              All Categories
            </button>
            {Object.keys(categoryTotals).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs transition ${
                  categoryFilter === cat
                    ? "bg-primary text-primary-foreground font-semibold"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                <span>{cat}</span>
                <span className="font-mono text-[10px] opacity-80">({formatINR(categoryTotals[cat])})</span>
              </button>
            ))}
          </div>
        )}

        {/* Transactions Table */}
        <div className="mt-4 overflow-x-auto">
          {activeTab === "expenses" ? (
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Merchant / Payee</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Payment Method</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No expenses found. Click &quot;Add Expense&quot; or upload a bank statement.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 whitespace-nowrap text-muted-foreground font-mono">
                        {exp.transaction_date}
                      </td>
                      <td className="p-3 font-medium text-foreground">{exp.merchant || "Direct Payee"}</td>
                      <td className="p-3">
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium">
                          {exp.category}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">{exp.payment_method || "UPI"}</td>
                      <td className="p-3 text-muted-foreground max-w-xs truncate">{exp.description || "—"}</td>
                      <td className="p-3 text-right font-mono font-semibold text-red-500 whitespace-nowrap">
                        -{formatINR(exp.amount)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete expense"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Income Source</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Recurring</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-right">Amount</th>
                  <th className="p-3 text-center w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredIncome.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      No income transactions recorded yet. Click &quot;Add Income&quot; to log.
                    </td>
                  </tr>
                ) : (
                  filteredIncome.map((inc) => (
                    <tr key={inc.id} className="hover:bg-muted/40 transition-colors">
                      <td className="p-3 whitespace-nowrap text-muted-foreground font-mono">
                        {inc.transaction_date}
                      </td>
                      <td className="p-3 font-medium text-foreground">{inc.source}</td>
                      <td className="p-3">
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium">
                          {inc.category}
                        </span>
                      </td>
                      <td className="p-3 text-muted-foreground">
                        {inc.recurring ? (
                          <span className="text-green-500 font-medium">Monthly Recurring</span>
                        ) : (
                          "One-off"
                        )}
                      </td>
                      <td className="p-3 text-muted-foreground max-w-xs truncate">{inc.description || "—"}</td>
                      <td className="p-3 text-right font-mono font-semibold text-green-500 whitespace-nowrap">
                        +{formatINR(inc.amount)}
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteIncome(inc.id)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          title="Delete income"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <FinancialChatDrawer />

      {modalType && (
        <AddTransactionModal
          isOpen={!!modalType}
          onClose={() => setModalType(null)}
          type={modalType}
          onSubmit={async (data) => {
            if (modalType === "expense") {
              await addExpense(data)
            } else {
              await addIncome(data)
            }
          }}
        />
      )}
    </DashboardLayout>
  )
}
