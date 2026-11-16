"use client"

import React, { useState } from "react"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion, AnimatePresence } from "framer-motion"
import {
  Building2,
  LineChart,
  Bitcoin,
  Coins,
  Wallet,
  Plus,
  Check,
  X,
  ChevronRight,
  Shield,
  Trash2,
  Lock,
  Loader2,
  ExternalLink,
} from "lucide-react"
import { useFinancialData } from "@/lib/hooks/use-financial-data"
import { formatINR } from "@/lib/format"
import { toast } from "sonner"
import type { FinancialAccount } from "@/lib/types/database"

const getAccountIcon = (type: string) => {
  switch (type) {
    case "savings":
    case "current":
    case "fixed_deposit":
    case "recurring_deposit":
      return Building2
    case "demat":
      return LineChart
    case "crypto":
      return Bitcoin
    case "gold":
      return Coins
    default:
      return Wallet
  }
}

export default function ConnectAccountsPage() {
  const { accounts, isLoading, addAccount, deleteAccount } = useFinancialData()
  const [showAddModal, setShowAddModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    account_name: "",
    account_type: "savings" as FinancialAccount["account_type"],
    institution_name: "",
    current_balance: "",
    currency: "INR",
    account_number_masked: "",
  })

  const totalBalance = accounts.reduce((acc, a) => acc + Number(a.current_balance), 0)

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.account_name || !formData.institution_name || !formData.current_balance) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)
    try {
      await addAccount({
        account_name: formData.account_name,
        account_type: formData.account_type,
        institution_name: formData.institution_name,
        current_balance: Number(formData.current_balance),
        currency: "INR",
        account_number_masked: formData.account_number_masked
          ? `•••• ${formData.account_number_masked.slice(-4)}`
          : "•••• 0000",
      })
      setShowAddModal(false)
      setFormData({
        account_name: "",
        account_type: "savings",
        institution_name: "",
        current_balance: "",
        currency: "INR",
        account_number_masked: "",
      })
    } catch {
      // toast in hook
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to disconnect ${name}?`)) {
      await deleteAccount(id)
    }
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Financial Accounts</h2>
            <p className="text-muted-foreground">
              Manage your connected bank accounts, Demat portfolios, gold vaults, and wallets
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Connect New Account
          </Button>
        </div>
      </motion.div>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <p className="font-semibold text-sm">Encrypted & Masked Accounts</p>
            <p className="text-xs text-muted-foreground">
              {accounts.length} accounts connected • Total Tracked: {formatINR(totalBalance)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Lock className="h-3.5 w-3.5 text-chart-2" />
          <span>Zero credential storage • Read-only balance tracking</span>
        </div>
      </motion.div>

      {/* Account Cards Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account, index) => {
          const Icon = getAccountIcon(account.account_type)
          return (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + index * 0.05 }}
              className="group relative rounded-xl border border-border bg-card p-5 transition-all hover:border-muted-foreground/30 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-accent">
                    <Icon className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  </div>
                  <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-500">
                    <Check className="h-3 w-3" />
                    Connected
                  </span>
                </div>

                <h3 className="font-semibold text-base">{account.account_name}</h3>
                <p className="text-xs text-muted-foreground">{account.institution_name}</p>

                <div className="mt-4 flex items-baseline justify-between border-t border-border pt-3">
                  <span className="text-xs text-muted-foreground">Current Balance</span>
                  <span className="text-lg font-bold font-mono text-foreground">
                    {formatINR(account.current_balance)}
                  </span>
                </div>

                {account.account_number_masked && (
                  <p className="text-[11px] font-mono text-muted-foreground mt-1">
                    Account: {account.account_number_masked}
                  </p>
                )}
              </div>

              <div className="mt-4 flex gap-2 border-t border-border/60 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-destructive hover:bg-destructive/10 hover:text-destructive flex items-center justify-center gap-1.5"
                  onClick={() => handleDelete(account.id, account.account_name)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Disconnect
                </Button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Add Account Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-xl"
            >
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">Connect Account</h3>
                    <p className="text-xs text-muted-foreground">Add to your Financial Digital Twin</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateAccount} className="space-y-3.5 text-xs">
                <div>
                  <Label className="text-xs">Account Label</Label>
                  <Input
                    placeholder="e.g. HDFC Salary Account, Zerodha Demat"
                    value={formData.account_name}
                    onChange={(e) => setFormData({ ...formData, account_name: e.target.value })}
                    required
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Account Type</Label>
                  <Select
                    value={formData.account_type}
                    onValueChange={(val: any) => setFormData({ ...formData, account_type: val })}
                  >
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings Account</SelectItem>
                      <SelectItem value="current">Current Account</SelectItem>
                      <SelectItem value="fixed_deposit">Fixed Deposit</SelectItem>
                      <SelectItem value="recurring_deposit">Recurring Deposit</SelectItem>
                      <SelectItem value="demat">Demat & Stocks</SelectItem>
                      <SelectItem value="gold">Digital Gold / SGB</SelectItem>
                      <SelectItem value="crypto">Cryptocurrency Wallet</SelectItem>
                      <SelectItem value="cash">Cash in Hand</SelectItem>
                      <SelectItem value="other">Other Asset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-xs">Institution / Broker Name</Label>
                  <Input
                    placeholder="e.g. HDFC Bank, Zerodha, MMTC-PAMP"
                    value={formData.institution_name}
                    onChange={(e) => setFormData({ ...formData, institution_name: e.target.value })}
                    required
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Current Balance (₹)</Label>
                  <Input
                    type="number"
                    placeholder="e.g. 250000"
                    value={formData.current_balance}
                    onChange={(e) => setFormData({ ...formData, current_balance: e.target.value })}
                    required
                    min="0"
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>

                <div>
                  <Label className="text-xs">Last 4 Digits of Account (Optional)</Label>
                  <Input
                    placeholder="e.g. 4829"
                    maxLength={4}
                    value={formData.account_number_masked}
                    onChange={(e) => setFormData({ ...formData, account_number_masked: e.target.value })}
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>

                <div className="rounded-lg bg-muted/50 p-2.5 text-[11px] text-muted-foreground flex items-center gap-2">
                  <Lock className="h-4 w-4 shrink-0 text-emerald-500" />
                  <span>FinTwin never stores passwords, OTPs, or UPI PINs. Masked for security.</span>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => setShowAddModal(false)}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Account
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
