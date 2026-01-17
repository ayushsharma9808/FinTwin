"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion } from "framer-motion"
import { User, Shield, CreditCard, Bell, LogOut, Upload, Check, Sun, Moon, Monitor } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

type Tab = "profile" | "security" | "accounts" | "preferences"

const tabs = [
  { id: "profile" as Tab, label: "Profile", icon: User },
  { id: "security" as Tab, label: "Security", icon: Shield },
  { id: "accounts" as Tab, label: "Connected Accounts", icon: CreditCard },
  { id: "preferences" as Tab, label: "Preferences", icon: Bell },
]

export default function SettingsPage() {
  const { user, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>("profile")
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [panUploaded, setPanUploaded] = useState(false)
  const [themePreference, setThemePreference] = useState<"light" | "dark" | "system">("system")
  const [isSaving, setIsSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    if (user) {
      setName(user.name)
      setEmail(user.email)
    }
  }, [isAuthenticated, router, user])

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }, 800)
  }

  const handleLogout = () => {
    logout()
    router.push("/")
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </motion.div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Tabs */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="w-full lg:w-64">
          <div className="rounded-xl border border-border bg-card p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                  activeTab === tab.id
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
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
              Logout
            </button>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex-1 rounded-xl border border-border bg-card p-6"
        >
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Profile Information</h3>
                <p className="text-sm text-muted-foreground">Update your personal details</p>
              </div>

              {/* Avatar */}
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted text-2xl font-semibold">
                  {name.charAt(0).toUpperCase()}
                </div>
                <Button variant="outline" size="sm">
                  Change Avatar
                </Button>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>

              {/* PAN Upload */}
              <div>
                <Label>PAN Card</Label>
                <div className="mt-1.5 rounded-lg border-2 border-dashed border-border p-6 text-center">
                  {panUploaded ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-chart-2/20">
                        <Check className="h-5 w-5 text-chart-2" />
                      </div>
                      <p className="text-sm font-medium">PAN Card Uploaded</p>
                      <Button variant="ghost" size="sm" onClick={() => setPanUploaded(false)}>
                        Replace
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Drag & drop or click to upload</p>
                      <Button variant="outline" size="sm" onClick={() => setPanUploaded(true)}>
                        Upload PAN
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : saved ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Saved
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Security Settings</h3>
                <p className="text-sm text-muted-foreground">Manage your security preferences</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Security questions enabled</p>
                  </div>
                  <span className="rounded-full bg-chart-2/20 px-3 py-1 text-xs font-medium text-chart-2">Active</span>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">Last changed 30 days ago</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Change
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border border-border p-4">
                  <div>
                    <p className="font-medium">Login History</p>
                    <p className="text-sm text-muted-foreground">View recent login activity</p>
                  </div>
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "accounts" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Connected Accounts</h3>
                <p className="text-sm text-muted-foreground">View your linked financial accounts</p>
              </div>

              <div className="space-y-3">
                {[
                  { name: "HDFC Bank", type: "Savings Account", status: "connected" },
                  { name: "Zerodha", type: "Demat Account", status: "connected" },
                  { name: "Groww", type: "Mutual Funds", status: "connected" },
                ].map((account) => (
                  <div
                    key={account.name}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                        <CreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{account.name}</p>
                        <p className="text-sm text-muted-foreground">{account.type}</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-chart-2/20 px-3 py-1 text-xs font-medium text-chart-2">
                      Connected
                    </span>
                  </div>
                ))}
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                Connect New Account
              </Button>
            </div>
          )}

          {activeTab === "preferences" && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Preferences</h3>
                <p className="text-sm text-muted-foreground">Customize your experience</p>
              </div>

              {/* Theme Preference */}
              <div>
                <Label>Theme</Label>
                <div className="mt-2 flex gap-2">
                  {[
                    { id: "light" as const, icon: Sun, label: "Light" },
                    { id: "dark" as const, icon: Moon, label: "Dark" },
                    { id: "system" as const, icon: Monitor, label: "System" },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setThemePreference(option.id)}
                      className={cn(
                        "flex flex-1 flex-col items-center gap-2 rounded-lg border p-4 transition-colors",
                        themePreference === option.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30",
                      )}
                    >
                      <option.icon className="h-5 w-5" />
                      <span className="text-sm">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="space-y-3">
                <Label>Notifications</Label>
                {[
                  { label: "Email notifications", enabled: true },
                  { label: "Push notifications", enabled: false },
                  { label: "Weekly reports", enabled: true },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex items-center justify-between rounded-lg border border-border p-4"
                  >
                    <span className="text-sm">{item.label}</span>
                    <button
                      className={cn(
                        "h-6 w-11 rounded-full transition-colors",
                        item.enabled ? "bg-primary" : "bg-muted",
                      )}
                    >
                      <span
                        className={cn(
                          "block h-5 w-5 rounded-full bg-white shadow transition-transform",
                          item.enabled ? "translate-x-5" : "translate-x-0.5",
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSave}>Save Preferences</Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  )
}
