"use client"

import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { LumpsumCalculator } from "@/components/calculators/lumpsum-calculator"
import { useRouter } from "next/navigation"

export default function LumpsumCalculatorPage() {
  const router = useRouter()

  const handleBack = () => {
    router.push("/calculators")
  }

  return (
    <DashboardLayout>
      <LumpsumCalculator onBack={handleBack} />
    </DashboardLayout>
  )
}