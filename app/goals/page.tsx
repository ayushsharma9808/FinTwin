"use client"

import { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { BentoCard } from "@/components/cards/bento-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import {
  Target,
  TrendingUp,
  CreditCard,
  Plus,
  Trash2,
  CheckCircle2,
  Calendar,
  DollarSign,
  AlertCircle,
  Percent,
  Clock,
  Shield,
  Loader2,
  X,
} from "lucide-react"
import { useFinancialData } from "@/lib/hooks/use-financial-data"
import { formatINR } from "@/lib/format"
import { FinancialChatDrawer } from "@/components/ai/financial-chat-drawer"

export default function GoalsAndWealthPage() {
  const {
    goals,
    investments,
    loans,
    summary,
    addGoal,
    updateGoal,
    deleteGoal,
    addInvestment,
    deleteInvestment,
    addLoan,
    deleteLoan,
  } = useFinancialData()

  const [activeSection, setActiveSection] = useState<"goals" | "investments" | "loans">("goals")
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showInvModal, setShowInvModal] = useState(false)
  const [showLoanModal, setShowLoanModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Goal form
  const [goalName, setGoalName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [currentAmount, setCurrentAmount] = useState("")
  const [targetDate, setTargetDate] = useState("2028-12-31")
  const [monthlyContribution, setMonthlyContribution] = useState("")
  const [priority, setPriority] = useState<"high" | "medium" | "low">("medium")

  // Investment form
  const [assetName, setAssetName] = useState("")
  const [assetType, setAssetType] = useState<any>("Mutual Funds")
  const [investedAmount, setInvestedAmount] = useState("")
  const [currentValue, setCurrentValue] = useState("")
  const [quantity, setQuantity] = useState("1")
  const [riskCategory, setRiskCategory] = useState<any>("moderate")

  // Loan form
  const [lenderName, setLenderName] = useState("")
  const [loanType, setLoanType] = useState<any>("Personal Loan")
  const [principalAmount, setPrincipalAmount] = useState("")
  const [outstandingAmount, setOutstandingAmount] = useState("")
  const [interestRate, setInterestRate] = useState("9.5")
  const [monthlyEmi, setMonthlyEmi] = useState("")
  const [remainingTenure, setRemainingTenure] = useState("24")

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addGoal({
        goal_name: goalName,
        target_amount: Number(targetAmount),
        current_amount: Number(currentAmount || 0),
        target_date: targetDate,
        monthly_contribution: Number(monthlyContribution || 0),
        priority,
        status: "in_progress",
      })
      setShowGoalModal(false)
      setGoalName("")
      setTargetAmount("")
      setCurrentAmount("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addInvestment({
        asset_name: assetName,
        asset_type: assetType,
        invested_amount: Number(investedAmount),
        current_value: Number(currentValue),
        quantity: Number(quantity || 1),
        purchase_date: new Date().toISOString().split("T")[0],
        risk_category: riskCategory,
      })
      setShowInvModal(false)
      setAssetName("")
      setInvestedAmount("")
      setCurrentValue("")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addLoan({
        lender_name: lenderName,
        loan_type: loanType,
        principal_amount: Number(principalAmount),
        outstanding_amount: Number(outstandingAmount),
        interest_rate: Number(interestRate),
        monthly_emi: Number(monthlyEmi),
        remaining_tenure: Number(remainingTenure),
      })
      setShowLoanModal(false)
      setLenderName("")
      setPrincipalAmount("")
      setOutstandingAmount("")
      setMonthlyEmi("")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Goals & Wealth Management</h2>
            <p className="text-muted-foreground">
              Track life targets, investment holdings, and amortize loan liabilities
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => {
                if (activeSection === "goals") setShowGoalModal(true)
                else if (activeSection === "investments") setShowInvModal(true)
                else setShowLoanModal(true)
              }}
              className="flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              {activeSection === "goals"
                ? "Add Financial Goal"
                : activeSection === "investments"
                ? "Add Investment"
                : "Add Loan Liability"}
            </Button>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex rounded-lg bg-muted p-1 mb-6 max-w-md">
        <button
          onClick={() => setActiveSection("goals")}
          className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
            activeSection === "goals" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Financial Goals ({goals.length})
        </button>
        <button
          onClick={() => setActiveSection("investments")}
          className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
            activeSection === "investments" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Investments ({investments.length})
        </button>
        <button
          onClick={() => setActiveSection("loans")}
          className={`flex-1 rounded-md py-1.5 text-xs font-medium transition ${
            activeSection === "loans" ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
          }`}
        >
          Loans & EMIs ({loans.length})
        </button>
      </div>

      {/* SECTION 1: FINANCIAL GOALS */}
      {activeSection === "goals" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map((g) => {
            const percent = Math.min(Math.round((Number(g.current_amount) / Number(g.target_amount)) * 100), 100)
            return (
              <div key={g.id} className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-blue-500 capitalize">
                      {g.priority} Priority
                    </span>
                    <button
                      onClick={() => deleteGoal(g.id)}
                      className="text-muted-foreground hover:text-destructive"
                      title="Delete goal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  <h3 className="font-semibold text-base">{g.goal_name}</h3>

                  <div className="mt-4 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-bold">{percent}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs font-mono pt-1">
                      <span className="text-muted-foreground">Saved: {formatINR(g.current_amount)}</span>
                      <span className="font-semibold">Target: {formatINR(g.target_amount)}</span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border flex justify-between text-[11px] text-muted-foreground">
                    <span>Monthly SIP: ₹{Number(g.monthly_contribution).toLocaleString("en-IN")}/mo</span>
                    <span>Target Date: {g.target_date}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* SECTION 2: INVESTMENTS */}
      {activeSection === "investments" && (
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
            <div>
              <h3 className="font-semibold text-base">Investment Portfolio Holdings</h3>
              <p className="text-xs text-muted-foreground">
                Total Invested: {formatINR(investments.reduce((acc, i) => acc + Number(i.invested_amount), 0))} • Current Value: {formatINR(summary.totalInvestments)}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="p-3 text-left">Asset Name</th>
                  <th className="p-3 text-left">Asset Type</th>
                  <th className="p-3 text-right">Invested</th>
                  <th className="p-3 text-right">Current Value</th>
                  <th className="p-3 text-right">Gain / Loss</th>
                  <th className="p-3 text-left">Risk</th>
                  <th className="p-3 text-center w-14">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {investments.map((inv) => {
                  const gain = Number(inv.current_value) - Number(inv.invested_amount)
                  const gainPercent = Number(inv.invested_amount) > 0 ? (gain / Number(inv.invested_amount)) * 100 : 0
                  return (
                    <tr key={inv.id} className="hover:bg-muted/40">
                      <td className="p-3 font-semibold text-foreground">{inv.asset_name}</td>
                      <td className="p-3 text-muted-foreground">{inv.asset_type}</td>
                      <td className="p-3 text-right font-mono text-muted-foreground">{formatINR(inv.invested_amount)}</td>
                      <td className="p-3 text-right font-mono font-bold text-foreground">{formatINR(inv.current_value)}</td>
                      <td className={`p-3 text-right font-mono font-semibold ${gain >= 0 ? "text-green-500" : "text-red-500"}`}>
                        {gain >= 0 ? "+" : ""}{formatINR(gain)} ({gainPercent.toFixed(1)}%)
                      </td>
                      <td className="p-3">
                        <span className="rounded bg-muted px-2 py-0.5 text-[10px] capitalize font-medium">
                          {inv.risk_category}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <button
                          onClick={() => deleteInvestment(inv.id)}
                          className="p-1 rounded text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 3: LOANS AND LIABILITIES */}
      {activeSection === "loans" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loans.map((loan) => (
            <div key={loan.id} className="rounded-xl border border-border bg-card p-5 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-red-500">
                    {loan.loan_type}
                  </span>
                  <button
                    onClick={() => deleteLoan(loan.id)}
                    className="text-muted-foreground hover:text-destructive"
                    title="Delete liability"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <h3 className="font-semibold text-base">{loan.lender_name}</h3>

                <div className="mt-4 space-y-2 border-t border-border pt-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outstanding Balance</span>
                    <span className="font-mono font-bold text-red-500">{formatINR(loan.outstanding_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Principal Borrowed</span>
                    <span className="font-mono">{formatINR(loan.principal_amount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Monthly EMI</span>
                    <span className="font-mono font-semibold">₹{Number(loan.monthly_emi).toLocaleString("en-IN")}/mo</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Interest Rate</span>
                    <span className="font-mono">{loan.interest_rate}% p.a.</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remaining Tenure</span>
                    <span className="font-mono">{loan.remaining_tenure} Months</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Goal Modal */}
      <AnimatePresence>
        {showGoalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <h3 className="font-semibold text-base">New Financial Goal</h3>
                <button onClick={() => setShowGoalModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateGoal} className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs">Goal Name</Label>
                  <Input
                    placeholder="e.g. Dream House Down Payment"
                    value={goalName}
                    onChange={(e) => setGoalName(e.target.value)}
                    required
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Target Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="2500000"
                      value={targetAmount}
                      onChange={(e) => setTargetAmount(e.target.value)}
                      required
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Already Saved (₹)</Label>
                    <Input
                      type="number"
                      placeholder="500000"
                      value={currentAmount}
                      onChange={(e) => setCurrentAmount(e.target.value)}
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Target Date</Label>
                    <Input
                      type="date"
                      value={targetDate}
                      onChange={(e) => setTargetDate(e.target.value)}
                      required
                      className="mt-1 h-9 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Monthly SIP (₹)</Label>
                    <Input
                      type="number"
                      placeholder="25000"
                      value={monthlyContribution}
                      onChange={(e) => setMonthlyContribution(e.target.value)}
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Priority</Label>
                  <Select value={priority} onValueChange={(val: any) => setPriority(val)}>
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High Priority</SelectItem>
                      <SelectItem value="medium">Medium Priority</SelectItem>
                      <SelectItem value="low">Low Priority</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowGoalModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Goal
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Investment Modal */}
      <AnimatePresence>
        {showInvModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <h3 className="font-semibold text-base">Add Investment Holding</h3>
                <button onClick={() => setShowInvModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateInvestment} className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs">Asset Name</Label>
                  <Input
                    placeholder="e.g. Parag Parikh Flexi Cap Fund"
                    value={assetName}
                    onChange={(e) => setAssetName(e.target.value)}
                    required
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Asset Type</Label>
                  <Select value={assetType} onValueChange={(val) => setAssetType(val)}>
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mutual Funds">Mutual Funds</SelectItem>
                      <SelectItem value="Stocks">Stocks</SelectItem>
                      <SelectItem value="SIP">SIP</SelectItem>
                      <SelectItem value="Gold">Gold</SelectItem>
                      <SelectItem value="Digital Gold">Digital Gold</SelectItem>
                      <SelectItem value="Cryptocurrency">Cryptocurrency</SelectItem>
                      <SelectItem value="Fixed Deposits">Fixed Deposits</SelectItem>
                      <SelectItem value="Bonds">Bonds</SelectItem>
                      <SelectItem value="Other assets">Other assets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Invested Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="350000"
                      value={investedAmount}
                      onChange={(e) => setInvestedAmount(e.target.value)}
                      required
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Current Value (₹)</Label>
                    <Input
                      type="number"
                      placeholder="420000"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                      required
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Risk Category</Label>
                  <Select value={riskCategory} onValueChange={(val) => setRiskCategory(val)}>
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low Risk</SelectItem>
                      <SelectItem value="moderate">Moderate Risk</SelectItem>
                      <SelectItem value="high">High Risk</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowInvModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Holding
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Loan Modal */}
      <AnimatePresence>
        {showLoanModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
                <h3 className="font-semibold text-base">Record Loan Liability</h3>
                <button onClick={() => setShowLoanModal(false)}>
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateLoan} className="space-y-3 text-xs">
                <div>
                  <Label className="text-xs">Lender Institution</Label>
                  <Input
                    placeholder="e.g. HDFC Bank, ICICI Bank"
                    value={lenderName}
                    onChange={(e) => setLenderName(e.target.value)}
                    required
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Loan Type</Label>
                  <Select value={loanType} onValueChange={(val) => setLoanType(val)}>
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Home Loan">Home Loan</SelectItem>
                      <SelectItem value="Car Loan">Car Loan</SelectItem>
                      <SelectItem value="Personal Loan">Personal Loan</SelectItem>
                      <SelectItem value="Education Loan">Education Loan</SelectItem>
                      <SelectItem value="Gold Loan">Gold Loan</SelectItem>
                      <SelectItem value="Credit Card EMI">Credit Card EMI</SelectItem>
                      <SelectItem value="Business Loan">Business Loan</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs">Principal Amount (₹)</Label>
                    <Input
                      type="number"
                      placeholder="950000"
                      value={principalAmount}
                      onChange={(e) => setPrincipalAmount(e.target.value)}
                      required
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Outstanding Balance (₹)</Label>
                    <Input
                      type="number"
                      placeholder="485000"
                      value={outstandingAmount}
                      onChange={(e) => setOutstandingAmount(e.target.value)}
                      required
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label className="text-xs">Monthly EMI (₹)</Label>
                    <Input
                      type="number"
                      placeholder="19450"
                      value={monthlyEmi}
                      onChange={(e) => setMonthlyEmi(e.target.value)}
                      required
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Interest %</Label>
                    <Input
                      type="number"
                      step="0.05"
                      placeholder="8.65"
                      value={interestRate}
                      onChange={(e) => setInterestRate(e.target.value)}
                      required
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Months Left</Label>
                    <Input
                      type="number"
                      placeholder="28"
                      value={remainingTenure}
                      onChange={(e) => setRemainingTenure(e.target.value)}
                      required
                      className="mt-1 h-9 text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-3">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setShowLoanModal(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Liability
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <FinancialChatDrawer />
    </DashboardLayout>
  )
}
