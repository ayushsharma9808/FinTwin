"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sun, Moon, Brain, Shield, TrendingUp, Sparkles, Calculator, PieChart, Target, ArrowRight, CheckCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const benefits = [
  {
    icon: Brain,
    title: "AI-Powered Insights",
    description: "Get personalized financial recommendations powered by advanced AI algorithms.",
  },
  {
    icon: Calculator,
    title: "Smart Calculators",
    description: "Access 12+ financial calculators for SIP, EMI, retirement, and goal planning.",
  },
  {
    icon: PieChart,
    title: "Portfolio Analysis",
    description: "Analyze your investments and get risk-adjusted portfolio recommendations.",
  },
  {
    icon: Target,
    title: "Goal Planning",
    description: "Plan for education, marriage, retirement, and other life goals systematically.",
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your financial data is encrypted and never shared with third parties.",
  },
  {
    icon: TrendingUp,
    title: "Future Simulation",
    description: "Simulate scenarios and plan for major life events with confidence.",
  },
]

const features = [
  "SIP & Lumpsum Calculators",
  "EMI & Loan Planning",
  "Retirement Planning",
  "Child Education Planning",
  "Marriage Planning",
  "Goal-based SIP Calculator",
  "Step-up SIP Calculator",
  "SWP Calculator",
  "Risk Assessment",
  "Portfolio Optimization",
  "What-if Scenarios",
  "AI-powered Insights"
]

export default function LandingPage() {
  const { theme, setTheme } = useTheme()
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // Allow viewing landing page even when authenticated
  }, [isAuthenticated, router])

  return (
    <div className="relative min-h-screen bg-background">
      {/* Navbar */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-700">
              <span className="text-base font-bold text-white">FT</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">FinTwin</span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Link href="/dashboard">
              <Button size="sm">Enter Dashboard</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative pt-16">
        <section className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl flex-col items-center justify-center px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5"
          >
            <Sparkles className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">AI-Powered Financial Planning Platform</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="max-w-4xl text-balance text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
          >
            Plan Your Financial Future with{" "}
            <span className="bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">
              AI Precision
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 max-w-2xl text-pretty text-lg text-muted-foreground"
          >
            Complete financial planning suite with 12+ calculators, AI insights, and goal-based planning.
            Make informed decisions for SIP, EMI, retirement, education, and more.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 flex flex-col gap-4 sm:flex-row"
          >
            <Link href="/dashboard">
              <Button size="lg" className="min-w-[180px] bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                Start Planning Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/calculators">
              <Button variant="outline" size="lg" className="min-w-[180px]">
                <Calculator className="mr-2 h-4 w-4" />
                Try Calculators
              </Button>
            </Link>
          </motion.div>

          {/* Features List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 grid w-full max-w-4xl grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
                className="flex items-center gap-2 rounded-lg bg-muted/30 px-3 py-2 text-sm"
              >
                <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                <span className="text-muted-foreground">{feature}</span>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Benefits Grid */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4">Why Choose FinTwin?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive financial planning tools designed for Indian investors
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid w-full grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="group rounded-xl border border-border bg-card p-6 text-left transition-all hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 transition-colors group-hover:bg-blue-500/20">
                  <benefit.icon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mb-2 font-semibold text-lg">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* CTA Section */}
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="rounded-2xl border border-border bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 p-12"
          >
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Ready to Transform Your Financial Future?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join thousands of users who are already planning smarter with FinTwin's AI-powered tools.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800">
                Get Started for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border py-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-gradient-to-br from-blue-600 to-blue-700">
                <span className="text-xs font-bold text-white">FT</span>
              </div>
              <span className="text-sm text-muted-foreground">© 2024 FinTwin. All rights reserved.</span>
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Contact
              </a>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
