interface LifeEventScenario {
  id: string
  title: string
  cost?: number
  duration: number
  monthlyImpact?: number
  probability: number
  impact: number
}

interface UserFinancials {
  monthlyIncome: number
  monthlyExpenses: number
  currentSavings: number
}

interface RiskAnalysis {
  riskRate: "Low Risk" | "Medium Risk" | "High Risk" | "Critical Risk"
  stressLevel: "Low" | "Moderate" | "High" | "Extreme"
  suggestion: string
}

export class FinancialRiskAnalyzer {
  static analyzeScenario(scenario: LifeEventScenario, userFinancials: UserFinancials): RiskAnalysis {
    const monthlySavings = userFinancials.monthlyIncome - userFinancials.monthlyExpenses
    const emergencyMonths = userFinancials.currentSavings / userFinancials.monthlyExpenses
    const totalCost = scenario.cost || 0
    const monthlyStrain = Math.abs(scenario.monthlyImpact || 0)
    
    // Risk Rate Analysis
    let riskScore = 0
    
    // Cost vs Savings ratio
    if (totalCost > userFinancials.currentSavings * 2) riskScore += 3
    else if (totalCost > userFinancials.currentSavings) riskScore += 2
    else if (totalCost > userFinancials.currentSavings * 0.5) riskScore += 1
    
    // Monthly impact vs income
    if (monthlyStrain > monthlySavings * 2) riskScore += 3
    else if (monthlyStrain > monthlySavings) riskScore += 2
    else if (monthlyStrain > monthlySavings * 0.5) riskScore += 1
    
    // Duration impact
    if (scenario.duration > 60) riskScore += 2
    else if (scenario.duration > 24) riskScore += 1
    
    // Probability factor
    if (scenario.probability > 70) riskScore += 1
    
    const riskRate = riskScore >= 7 ? "Critical Risk" : 
                    riskScore >= 5 ? "High Risk" : 
                    riskScore >= 3 ? "Medium Risk" : "Low Risk"
    
    // Stress Level Analysis
    let stressScore = 0
    
    // Emergency fund depletion
    if (totalCost > userFinancials.currentSavings * 0.8) stressScore += 2
    else if (totalCost > userFinancials.currentSavings * 0.5) stressScore += 1
    
    // Monthly cash flow strain
    if (monthlyStrain > monthlySavings * 1.5) stressScore += 3
    else if (monthlyStrain > monthlySavings) stressScore += 2
    else if (monthlyStrain > monthlySavings * 0.5) stressScore += 1
    
    // Duration stress
    if (scenario.duration > 36) stressScore += 1
    
    const stressLevel = stressScore >= 5 ? "Extreme" : 
                       stressScore >= 3 ? "High" : 
                       stressScore >= 2 ? "Moderate" : "Low"
    
    // Generate Suggestion
    const suggestion = this.generateSuggestion(scenario, userFinancials, riskScore, stressScore)
    
    return { riskRate, stressLevel, suggestion }
  }
  
  private static generateSuggestion(scenario: LifeEventScenario, userFinancials: UserFinancials, riskScore: number, stressScore: number): string {
    const monthlySavings = userFinancials.monthlyIncome - userFinancials.monthlyExpenses
    const totalCost = scenario.cost || 0
    const monthlyStrain = Math.abs(scenario.monthlyImpact || 0)
    
    // Critical situations
    if (riskScore >= 7 || stressScore >= 5) {
      if (totalCost > userFinancials.currentSavings * 2) {
        return "Consider delaying this event by 12-18 months to build emergency savings, or explore reducing the total cost by 30-40%."
      }
      if (monthlyStrain > monthlySavings * 2) {
        return "This scenario requires immediate income increase planning - consider side income or splitting the financial impact over a longer timeline."
      }
    }
    
    // High risk situations
    if (riskScore >= 5 || stressScore >= 3) {
      if (scenario.duration > 60) {
        return "Break this long-term commitment into smaller phases to reduce financial strain and maintain flexibility."
      }
      if (totalCost > userFinancials.currentSavings) {
        return "Build an additional emergency fund of ₹" + Math.round((totalCost - userFinancials.currentSavings) / 100000) + "L before proceeding with this scenario."
      }
    }
    
    // Medium risk situations
    if (riskScore >= 3) {
      if (monthlyStrain > monthlySavings * 0.7) {
        return "Increase your monthly savings by ₹" + Math.round((monthlyStrain - monthlySavings * 0.5) / 1000) + "K to comfortably handle this scenario."
      }
      return "Consider timing this event during a period of higher income or lower expenses to minimize financial impact."
    }
    
    // Low risk situations
    return "Your financial position can handle this scenario well - consider optimizing the timing for maximum benefit."
  }
}