import { WhatIfScenarioCalculator } from "@/components/calculators/what-if-scenario-calculator"

export default function WhatIfScenarioPage() {
  return (
    <div className="container mx-auto p-6">
      <WhatIfScenarioCalculator />
    </div>
  )
}

export const metadata = {
  title: "What-If Scenario Calculator | FinTwin",
  description: "Analyze 10,000 possible financial futures with Monte Carlo simulation",
}