"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { GoalSIPCalculator } from "@/components/calculators/goal-sip-calculator"
import { useRouter } from "next/navigation"

export default function GoalSIPCalculatorPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/calculators")
  }

  return (
    <DashboardLayout>
      <GoalSIPCalculator onBack={handleBack} />
    </DashboardLayout>
  )
}