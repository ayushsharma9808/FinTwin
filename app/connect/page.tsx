"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { Building2, LineChart, Bitcoin, Coins, Wallet, Plus, Check, X, ChevronRight, Shield } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

interface Account {
  id: string
  name: string
  type: string
  icon: React.ElementType
  description: string
  connected: boolean
}

const accountTypes: Account[] = [
  {
    id: "bank",
    name: "Bank Accounts",
    type: "bank",
    icon: Building2,
    description: "Connect your savings, current, and fixed deposit accounts",
    connected: false,
  },
  {
    id: "demat",
    name: "Demat Account",
    type: "demat",
    icon: LineChart,
    description: "Link your stocks, mutual funds, and ETF holdings",
    connected: false,
  },
  {
    id: "crypto",
    name: "Crypto Wallets",
    type: "crypto",
    icon: Bitcoin,
    description: "Connect cryptocurrency exchanges and wallets",
    connected: false,
  },
  {
    id: "gold",
    name: "Gold Assets",
    type: "gold",
    icon: Coins,
    description: "Add your digital gold and sovereign gold bonds",
    connected: false,
  },
  {
    id: "digital",
    name: "Digital Assets",
    type: "digital",
    icon: Wallet,
    description: "Link UPI accounts, digital wallets, and more",
    connected: false,
  },
]

export default function ConnectAccountsPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [accounts, setAccounts] = useState(accountTypes)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)

  useEffect(() => {
    // TEMPORARY: Skip authentication redirect
  }, [])

  const handleConnect = (account: Account) => {
    setSelectedAccount(account)
  }

  const handleConfirmConnect = () => {
    if (!selectedAccount) return

    setIsConnecting(true)
    setTimeout(() => {
      setAccounts((prev) => prev.map((a) => (a.id === selectedAccount.id ? { ...a, connected: true } : a)))
      setIsConnecting(false)
      setSelectedAccount(null)
    }, 1500)
  }

  const handleDisconnect = (accountId: string) => {
    setAccounts((prev) => prev.map((a) => (a.id === accountId ? { ...a, connected: false } : a)))
  }

  // TEMPORARY: Skip authentication check
  // if (!isAuthenticated) {
  //   return null
  // }

  const connectedCount = accounts.filter((a) => a.connected).length

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h2 className="text-2xl font-semibold tracking-tight">Connect Accounts</h2>
        <p className="text-muted-foreground">Link your financial accounts to get a complete picture</p>
      </motion.div>

      {/* Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex items-center justify-between rounded-xl border border-border bg-card p-4"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
            <Shield className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="font-medium">Account Status</p>
            <p className="text-sm text-muted-foreground">
              {connectedCount} of {accounts.length} accounts connected
            </p>
          </div>
        </div>
        <div className="flex gap-1">
          {accounts.map((account) => (
            <div
              key={account.id}
              className={cn("h-2 w-8 rounded-full transition-colors", account.connected ? "bg-chart-2" : "bg-muted")}
            />
          ))}
        </div>
      </motion.div>

      {/* Account Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            className={cn(
              "group relative rounded-xl border bg-card p-5 transition-all",
              account.connected ? "border-chart-2/30" : "border-border hover:border-muted-foreground/30",
            )}
          >
            {account.connected && (
              <div className="absolute right-3 top-3">
                <span className="flex items-center gap-1 rounded-full bg-chart-2/20 px-2 py-0.5 text-xs font-medium text-chart-2">
                  <Check className="h-3 w-3" />
                  Connected
                </span>
              </div>
            )}

            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-accent">
              <account.icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-foreground" />
            </div>

            <h3 className="mb-1 font-semibold">{account.name}</h3>
            <p className="mb-4 text-sm text-muted-foreground">{account.description}</p>

            {account.connected ? (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1 bg-transparent">
                  Manage
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => handleDisconnect(account.id)}
                >
                  Disconnect
                </Button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="w-full bg-transparent"
                onClick={() => handleConnect(account)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Connect
              </Button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Connect Modal */}
      <AnimatePresence>
        {selectedAccount && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => !isConnecting && setSelectedAccount(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-md rounded-xl border border-border bg-card p-6 shadow-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted">
                    <selectedAccount.icon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{selectedAccount.name}</h3>
                    <p className="text-sm text-muted-foreground">Connect your account</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedAccount(null)}
                  className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  disabled={isConnecting}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mb-6 space-y-3">
                <p className="text-sm text-muted-foreground">By connecting, you authorize FinTwin to:</p>
                <ul className="space-y-2">
                  {["View your account balances", "Access transaction history", "Sync data securely"].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1 bg-transparent"
                  onClick={() => setSelectedAccount(null)}
                  disabled={isConnecting}
                >
                  Cancel
                </Button>
                <Button className="flex-1" onClick={handleConfirmConnect} disabled={isConnecting}>
                  {isConnecting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    "Connect Account"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  )
}
