// Risk & Stress Analysis Engine
export interface FinancialData {
  currentAge: number
  retirementAge: number
  monthlyIncome: number
  monthlyExpenses: number
  currentSavings: number
  monthlyInvestment: number
  expectedReturn: number
  volatility: number
  inflation: number
  monteCarloResults: number[]
  baselineMedian: number
  scenarioMedian: number
  successProbability: number
}

export interface RiskScores {
  incomeStability: number
  expenseStress: number
  investmentRisk: number
  portfolioResilience: number
  goalFailureRisk: number
  stressRecoveryTime: number
}

export interface CompositeScores {
  riskScore: number
  stressScore: number
  verdict: 'SAFE' | 'CAUTION' | 'HIGH_RISK'
  verdictColor: string
}

export interface RiskAnalysis {
  scores: RiskScores
  composite: CompositeScores
  insights: string[]
  emergencyBuffer: number
  expenseRatio: number
}

export class RiskAnalysisEngine {
  static analyzeFinancialRisk(data: FinancialData): RiskAnalysis {
    // Calculate individual scores
    const scores = this.calculateIndividualScores(data)
    
    // Calculate composite scores
    const composite = this.calculateCompositeScores(scores)
    
    // Generate insights
    const insights = this.generateInsights(data, scores, composite)
    
    // Calculate additional metrics
    const emergencyBuffer = data.currentSavings / data.monthlyExpenses
    const expenseRatio = (data.monthlyExpenses / data.monthlyIncome) * 100
    
    return {
      scores,
      composite,
      insights,
      emergencyBuffer,
      expenseRatio
    }
  }

  private static calculateIndividualScores(data: FinancialData): RiskScores {
    // 1. Income Stability Score (0-100)
    const emergencyBuffer = data.currentSavings / data.monthlyExpenses
    let incomeStability = 0
    if (emergencyBuffer >= 12) incomeStability = 95
    else if (emergencyBuffer >= 6) incomeStability = 75 + (emergencyBuffer - 6) * 3.33
    else incomeStability = Math.max(20, emergencyBuffer * 12.5)

    // 2. Expense Stress Score (0-100) - inverted (lower expense ratio = higher score)
    const expenseRatio = data.monthlyExpenses / data.monthlyIncome
    let expenseStress = 0
    if (expenseRatio < 0.5) expenseStress = 90 + (0.5 - expenseRatio) * 20
    else if (expenseRatio < 0.7) expenseStress = 70 - (expenseRatio - 0.5) * 100
    else expenseStress = Math.max(10, 70 - (expenseRatio - 0.7) * 200)

    // 3. Investment Risk Score (0-100) - inverted (lower volatility = higher score)
    let investmentRisk = 0
    if (data.volatility < 10) investmentRisk = 90
    else if (data.volatility < 20) investmentRisk = 70 - (data.volatility - 10) * 2
    else investmentRisk = Math.max(20, 50 - (data.volatility - 20) * 1.5)

    // 4. Portfolio Resilience Score (0-100)
    const sortedResults = [...data.monteCarloResults].sort((a, b) => a - b)
    const p10 = sortedResults[Math.floor(sortedResults.length * 0.1)]
    const p50 = sortedResults[Math.floor(sortedResults.length * 0.5)]
    const p90 = sortedResults[Math.floor(sortedResults.length * 0.9)]
    
    const spread = (p90 - p10) / p50
    let portfolioResilience = 0
    if (spread < 0.5) portfolioResilience = 95
    else if (spread < 1.0) portfolioResilience = 80 - (spread - 0.5) * 30
    else portfolioResilience = Math.max(30, 65 - (spread - 1.0) * 25)

    // 5. Goal Failure Risk (0-100) - inverted (lower failure = higher score)
    const failureProbability = (1 - data.successProbability) * 100
    const goalFailureRisk = Math.max(10, 100 - failureProbability * 2)

    // 6. Stress Recovery Time (years) - converted to score
    const medianDifference = Math.abs(data.scenarioMedian - data.baselineMedian)
    const recoveryYears = medianDifference > 5000000 ? 7 : medianDifference > 1000000 ? 5 : 3
    const stressRecoveryTime = Math.max(20, 100 - recoveryYears * 10)

    return {
      incomeStability: Math.round(incomeStability),
      expenseStress: Math.round(expenseStress),
      investmentRisk: Math.round(investmentRisk),
      portfolioResilience: Math.round(portfolioResilience),
      goalFailureRisk: Math.round(goalFailureRisk),
      stressRecoveryTime: Math.round(stressRecoveryTime)
    }
  }

  private static calculateCompositeScores(scores: RiskScores): CompositeScores {
    // Risk Score (weighted average)
    const riskScore = Math.round(
      (scores.investmentRisk * 0.4 + 
       scores.portfolioResilience * 0.35 + 
       scores.goalFailureRisk * 0.25)
    )

    // Stress Score (weighted average)
    const stressScore = Math.round(
      (scores.incomeStability * 0.4 + 
       scores.expenseStress * 0.35 + 
       scores.stressRecoveryTime * 0.25)
    )

    // Final Verdict
    let verdict: 'SAFE' | 'CAUTION' | 'HIGH_RISK'
    let verdictColor: string

    if (riskScore > 75 && stressScore > 75) {
      verdict = 'SAFE'
      verdictColor = 'text-green-600'
    } else if (riskScore >= 50 && stressScore >= 50) {
      verdict = 'CAUTION'
      verdictColor = 'text-yellow-600'
    } else {
      verdict = 'HIGH_RISK'
      verdictColor = 'text-red-600'
    }

    return {
      riskScore,
      stressScore,
      verdict,
      verdictColor
    }
  }

  private static generateInsights(data: FinancialData, scores: RiskScores, composite: CompositeScores): string[] {
    const insights: string[] = []

    // Emergency buffer insight
    const emergencyBuffer = data.currentSavings / data.monthlyExpenses
    if (emergencyBuffer < 3) {
      insights.push("⚠️ Critical: Build emergency fund to cover at least 3 months of expenses")
    } else if (emergencyBuffer < 6) {
      insights.push("💡 Recommendation: Increase emergency fund to 6 months for better stability")
    }

    // Expense ratio insight
    const expenseRatio = data.monthlyExpenses / data.monthlyIncome
    if (expenseRatio > 0.7) {
      insights.push("🔴 High expense ratio detected - consider reducing monthly expenses")
    } else if (expenseRatio < 0.5) {
      insights.push("✅ Excellent expense management - strong savings potential")
    }

    // Volatility insight
    if (data.volatility > 20) {
      insights.push("⚡ High investment volatility may cause significant portfolio swings")
    } else if (data.volatility < 10) {
      insights.push("🛡️ Conservative investment approach provides stability")
    }

    // Success probability insight
    if (data.successProbability < 0.7) {
      insights.push("📊 Consider increasing monthly investments to improve goal success rate")
    } else if (data.successProbability > 0.9) {
      insights.push("🎯 Excellent probability of achieving financial goals")
    }

    // Overall verdict insight
    if (composite.verdict === 'SAFE') {
      insights.push("🟢 Your financial profile shows strong resilience and low stress factors")
    } else if (composite.verdict === 'CAUTION') {
      insights.push("🟡 Monitor key risk factors and consider adjustments to improve stability")
    } else {
      insights.push("🔴 Multiple risk factors detected - immediate attention recommended")
    }

    return insights
  }
}