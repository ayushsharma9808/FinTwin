"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Sun, Moon, ArrowLeft, Check, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { cn } from "@/lib/utils"

const securityQuestions = [
  { id: "colour", question: "What is your favourite colour?", placeholder: "e.g., Blue" },
  { id: "city", question: "Which city do you live in?", placeholder: "e.g., Mumbai" },
  { id: "school", question: "Where did you complete your 12th standard?", placeholder: "e.g., Delhi Public School" },
  { id: "bike", question: "Which company's bike do you own?", placeholder: "e.g., Royal Enfield" },
]

type Step = "login" | "security"

export default function LoginPage() {
  const { theme, setTheme } = useTheme()
  const { login } = useAuth()
  const router = useRouter()

  const [step, setStep] = useState<Step>("login")
  const [email, setEmail] = useState("")
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [errors, setErrors] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleGoogleLogin = () => {
    setIsGoogleLoading(true)
    // Simulate Google OAuth
    setTimeout(() => {
      setEmail("user@gmail.com")
      setIsGoogleLoading(false)
      setStep("security")
    }, 1000)
  }

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    if (errors[id]) {
      setErrors((prev) => ({ ...prev, [id]: false }))
    }
  }

  const handleSecuritySubmit = () => {
    // Validate all questions are answered
    const newErrors: Record<string, boolean> = {}
    let hasError = false

    securityQuestions.forEach((q) => {
      if (!answers[q.id]?.trim()) {
        newErrors[q.id] = true
        hasError = true
      }
    })

    if (hasError) {
      setErrors(newErrors)
      return
    }

    setIsSubmitting(true)
    // Simulate security verification
    setTimeout(() => {
      login(email)
      router.push("/dashboard")
    }, 800)
  }

  return (
    <div className="relative min-h-screen bg-background">
      {/* Header */}
      <header className="fixed left-0 right-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <span className="text-base font-bold text-primary-foreground">F</span>
            </div>
            <span className="text-xl font-semibold tracking-tight">FinTwin</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
        </div>
      </header>

      <main className="flex min-h-screen items-center justify-center px-6 pt-16">
        <div className="w-full max-w-md">
          <AnimatePresence mode="wait">
            {step === "login" ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-border bg-card p-8"
              >
                <div className="mb-8 text-center">
                  <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
                  <p className="mt-2 text-muted-foreground">Sign in to access your financial twin</p>
                </div>

                {/* Google Sign In */}
                <Button
                  variant="outline"
                  className="mb-6 h-12 w-full gap-3 bg-transparent"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                >
                  {isGoogleLoading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                  ) : (
                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                  )}
                  Continue with Google
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      className="mt-1.5 h-11"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <Button
                    className="h-11 w-full"
                    onClick={() => {
                      if (email.trim()) {
                        setStep("security")
                      }
                    }}
                    disabled={!email.trim()}
                  >
                    Continue
                  </Button>
                </div>

                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-foreground underline-offset-4 hover:underline">
                    Sign up
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="security"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="rounded-xl border border-border bg-card p-8"
              >
                <button
                  onClick={() => setStep("login")}
                  className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <div className="mb-8">
                  <h1 className="text-2xl font-semibold tracking-tight">Security Verification</h1>
                  <p className="mt-2 text-muted-foreground">
                    Please answer these security questions to verify your identity
                  </p>
                </div>

                <div className="space-y-5">
                  {securityQuestions.map((q, index) => (
                    <motion.div
                      key={q.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Label htmlFor={q.id} className={cn(errors[q.id] && "text-destructive")}>
                        {q.question}
                      </Label>
                      <div className="relative mt-1.5">
                        <Input
                          id={q.id}
                          placeholder={q.placeholder}
                          className={cn(
                            "h-11 pr-10",
                            errors[q.id] && "border-destructive focus-visible:ring-destructive",
                          )}
                          value={answers[q.id] || ""}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        />
                        {answers[q.id]?.trim() && !errors[q.id] && (
                          <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-chart-2" />
                        )}
                        {errors[q.id] && (
                          <AlertCircle className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                <Button className="mt-8 h-11 w-full" onClick={handleSecuritySubmit} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  ) : (
                    "Verify & Continue"
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  )
}
