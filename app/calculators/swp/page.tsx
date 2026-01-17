"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { SWPCalculator } from "@/components/calculators/swp-calculator"
import { useRouter } from "next/navigation"

export default function SWPCalculatorPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/calculators")
  }

  return (
    <DashboardLayout>
      <SWPCalculator onBack={handleBack} />
    </DashboardLayout>
  )
}