"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SmartEMICalculator } from "@/components/calculators/smart-emi-calculator"
import { useRouter } from "next/navigation"

export default function EMICalculatorPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/calculators")
  }

  return (
    <DashboardLayout>
      <SmartEMICalculator onBack={handleBack} />
    </DashboardLayout>
  )
}