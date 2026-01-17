"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RetirementPlanningCalculator } from "@/components/calculators/retirement-planning-calculator"
import { useRouter } from "next/navigation"

export default function RetirementPlanningCalculatorPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/calculators")
  }

  return (
    <DashboardLayout>
      <RetirementPlanningCalculator onBack={handleBack} />
    </DashboardLayout>
  )
}