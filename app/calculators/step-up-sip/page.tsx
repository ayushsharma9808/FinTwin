"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { StepUpSIPCalculator } from "@/components/calculators/step-up-sip-calculator"
import { useRouter } from "next/navigation"

export default function StepUpSIPCalculatorPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/calculators")
  }

  return (
    <DashboardLayout>
      <StepUpSIPCalculator onBack={handleBack} />
    </DashboardLayout>
  )
}