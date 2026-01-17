"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SIPDelayCalculator } from "@/components/calculators/sip-delay-calculator"
import { useRouter } from "next/navigation"

export default function SIPDelayCalculatorPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/calculators")
  }

  return (
    <DashboardLayout>
      <SIPDelayCalculator onBack={handleBack} />
    </DashboardLayout>
  )
}