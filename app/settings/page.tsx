"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"
import {
  User,
  Shield,
  CreditCard,
  Bell,
  LogOut,
  Upload,
  Check,
  Sun,
  Moon,
  Monitor,
  Lock,
  Loader2,
  DollarSign,
  HeartHandshake,
  Target,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import Link from "next/link"

type Tab = "profile" | "financial_profile" | "security" | "accounts" | "preferences"

const tabs = [
  { id: "profile" as Tab, label: "Personal Profile", icon: User },
  { id: "financial_profile" as Tab, label: "Financial Metrics", icon: DollarSign },
  { id: "security" as Tab, label: "Security & RLS", icon: Shield },
  { id: "accounts" as Tab, label: "Connected Accounts", icon: CreditCard },
  { id: "preferences" as Tab, label: "Preferences", icon: Bell },
]

export default function SettingsPage() {
  const { user, profile, logout, refreshProfile } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("profile")

  // Personal Profile fields
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [occupation, setOccupation] = useState("")

  // Financial Profile fields
  const [income, setIncome] = useState("185000")
  const [expenses, setExpenses] = useState("68000")
  const [financialGoal, setFinancialGoal] = useState("Financial Independence by 40 & Home Purchase")
  const [riskTolerance, setRiskTolerance] = useState<"conservative" | "moderate" | "aggressive" | "very_aggressive">("moderate")
  const [dependents, setDependents] = useState("2")
  const [currency, setCurrency] = useState("INR")

  // Preferences
  const [themePreference, setThemePreference] = useState<"light" | "dark" | "system">("dark")
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    weekly_report: true,
    unusual_spending: true,
  })

  const [isSaving, setIsSaving] = useState(false)
  const [panUploaded, setPanUploaded] = useState(true)

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "")
      setEmail(profile.email || "")
      setPhone(profile.phone_number || "")
      setDob(profile.date_of_birth || "1996-05-14")
      setOccupation(profile.occupation || "Senior Software Engineer")
      setIncome(String(profile.monthly_income || 185000))
      setExpenses(String(profile.monthly_expenses || 68000))
      setFinancialGoal(profile.financial_goal || "Financial Independence by 40 & Home Purchase")
      setRiskTolerance(profile.risk_tolerance || "moderate")
      setDependents(String(profile.dependents ?? 2))
      setCurrency(profile.currency || "INR")
    } else if (user) {
      setFullName(user.name || "")
      setEmail(user.email || "")
    }
  }, [profile, user])

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      const payload = {
        full_name: fullName,
        email,
        phone_number: phone,
        date_of_birth: dob,
        occupation,
        monthly_income: Number(income),
        monthly_expenses: Number(expenses),
        financial_goal: financialGoal,
        risk_tolerance: riskTolerance,
        dependents: Number(dependents),
        currency,
      }

      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      if (!res.ok) throw new Error("Failed to update profile")

      await refreshProfile()
      toast.success("Profile saved successfully to database")
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePreferences = async () => {
    setIsSaving(true)
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: themePreference,
          currency,
          notification_preferences: notifications,
        }),
      })

      if (!res.ok) throw new Error("Failed to save settings")
      toast.success("Preferences updated successfully")
    } catch (err: any) {
      toast.error(err.message || "Failed to update preferences")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Platform Settings</h2>
        <p className="text-muted-foreground">Manage your identity, twin parameters, security, and preferences</p>
      </motion.div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Navigation Tabs */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-64">
          <div className="rounded-xl border border-border bg-card p-2 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
            <div className="my-2 border-t border-border" />
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Content Panel */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 rounded-xl border border-border bg-card p-6"
        >
          {/* TAB 1: PERSONAL PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold">User Management Profile</h3>
                <p className="text-xs text-muted-foreground">
                  Stores identity in PostgreSQL `profiles` table referenced to `auth.users(id)`
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
                  {(fullName || "A").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{fullName || "User"}</p>
                  <p className="text-xs text-muted-foreground">{email}</p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName" className="text-xs">Full Name</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-xs">Email Address (Auth Registered)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    disabled
                    className="mt-1 h-9 text-xs bg-muted"
                  />
                </div>
                <div>
                  <Label htmlFor="phone" className="text-xs">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="dob" className="text-xs">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="mt-1 h-9 text-xs"
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="occupation" className="text-xs">Occupation / Industry</Label>
                  <Input
                    id="occupation"
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    placeholder="e.g. Senior Software Engineer"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Profile to Database
                </Button>
              </div>
            </div>
          )}

          {/* TAB 2: FINANCIAL PROFILE METRICS */}
          {activeTab === "financial_profile" && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold">Financial Digital Twin Parameters</h3>
                <p className="text-xs text-muted-foreground">
                  Baseline economic assumptions that initialize your Monte Carlo simulations
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="income" className="text-xs">Monthly Inflow / Income (₹)</Label>
                  <Input
                    id="income"
                    type="number"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="expenses" className="text-xs">Monthly Fixed Outflow / Expenses (₹)</Label>
                  <Input
                    id="expenses"
                    type="number"
                    value={expenses}
                    onChange={(e) => setExpenses(e.target.value)}
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="dependents" className="text-xs">Number of Dependents</Label>
                  <Input
                    id="dependents"
                    type="number"
                    value={dependents}
                    onChange={(e) => setDependents(e.target.value)}
                    min="0"
                    className="mt-1 h-9 text-xs font-mono"
                  />
                </div>
                <div>
                  <Label htmlFor="risk" className="text-xs">Risk Tolerance Classification</Label>
                  <Select
                    value={riskTolerance}
                    onValueChange={(val: any) => setRiskTolerance(val)}
                  >
                    <SelectTrigger className="mt-1 h-9 text-xs">
                      <SelectValue placeholder="Select risk profile" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="conservative">Conservative (Preservation First)</SelectItem>
                      <SelectItem value="moderate">Moderate (Balanced Growth & Safety)</SelectItem>
                      <SelectItem value="aggressive">Aggressive (High Equity / Return Target)</SelectItem>
                      <SelectItem value="very_aggressive">Very Aggressive (High Volatility / Crypto)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="sm:col-span-2">
                  <Label htmlFor="financialGoal" className="text-xs">Primary Financial Goal</Label>
                  <Input
                    id="financialGoal"
                    value={financialGoal}
                    onChange={(e) => setFinancialGoal(e.target.value)}
                    placeholder="e.g. Financial Independence by 40, Home Purchase"
                    className="mt-1 h-9 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Update Financial Parameters
                </Button>
              </div>
            </div>
          )}

          {/* TAB 3: SECURITY & RLS */}
          {activeTab === "security" && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold">Security & Authorization Architecture</h3>
                <p className="text-xs text-muted-foreground">
                  Database Row-Level Security (RLS) policies and authentication state
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="font-semibold text-sm">PostgreSQL Row-Level Security (RLS)</p>
                      <p className="text-xs text-muted-foreground">
                        Enforced via `auth.uid() = user_id` on all 14 database tables.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-500">
                    Enforced
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4 bg-muted/20">
                  <div className="flex items-center gap-3">
                    <Lock className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-semibold text-sm">Account Masking & Zero-Credential Storage</p>
                      <p className="text-xs text-muted-foreground">
                        No net banking passwords, UPI PINs, or CVVs are ever requested or stored.
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs font-semibold text-blue-500">
                    Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONNECTED ACCOUNTS */}
          {activeTab === "accounts" && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold">Connected Financial Accounts</h3>
                <p className="text-xs text-muted-foreground">
                  Manage external banking, demat, gold, and crypto asset records
                </p>
              </div>

              <div className="flex flex-col items-center justify-center p-8 text-center border border-dashed rounded-xl">
                <CreditCard className="h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-sm font-semibold">Manage All Linked Accounts</p>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Connect new savings accounts, view masked numbers, and disconnect accounts securely.
                </p>
                <Button className="mt-4" asChild>
                  <Link href="/connect">Go to Connect Accounts Hub &rarr;</Link>
                </Button>
              </div>
            </div>
          )}

          {/* TAB 5: PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div className="border-b border-border pb-4">
                <h3 className="text-lg font-semibold">Platform & Notification Preferences</h3>
                <p className="text-xs text-muted-foreground">
                  Persisted to Supabase `user_settings` table
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs font-medium">Default Currency</Label>
                  <Select value={currency} onValueChange={setCurrency}>
                    <SelectTrigger className="mt-1 h-9 text-xs w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INR">Indian Rupee (₹ INR)</SelectItem>
                      <SelectItem value="USD">US Dollar ($ USD)</SelectItem>
                      <SelectItem value="EUR">Euro (€ EUR)</SelectItem>
                      <SelectItem value="GBP">British Pound (£ GBP)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2 space-y-3">
                  <p className="text-xs font-semibold text-foreground">Notification Subscriptions</p>
                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">Unusual Spending Alerts</p>
                      <p className="text-xs text-muted-foreground">Notify when expenses exceed monthly baseline by 20%</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.unusual_spending}
                      onChange={(e) => setNotifications({ ...notifications, unusual_spending: e.target.checked })}
                      className="rounded border-border"
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">Weekly Twin Digest</p>
                      <p className="text-xs text-muted-foreground">Weekly Monte Carlo probability summary and risk metrics</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notifications.weekly_report}
                      onChange={(e) => setNotifications({ ...notifications, weekly_report: e.target.checked })}
                      className="rounded border-border"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <Button onClick={handleSavePreferences} disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Preferences
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
