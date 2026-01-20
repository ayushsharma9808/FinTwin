import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { RiskStressAnalysisPage } from "@/components/risk-stress-analysis"

export default function RiskPortfolioPage() {
  return (
    <DashboardLayout>
      <RiskStressAnalysisPage />
    </DashboardLayout>
  )
}