"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SIPCalculator } from "@/components/calculators/sip-calculator"
import { useRouter } from "next/navigation"

export default function SIPCalculatorPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/calculators")
  }

  return (
    <DashboardLayout>
      <SIPCalculator onBack={handleBack} />
    </DashboardLayout>
  )
}