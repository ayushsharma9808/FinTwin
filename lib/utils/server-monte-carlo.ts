/**
 * FinTwin Server-Side Monte Carlo Simulation Engine
 * Performs 10,000 stochastic trials using Geometric Brownian Motion (GBM) / Box-Muller transforms.
 */

export interface SimulationParams {
  currentSavings: number
  monthlyIncome: number
  monthlyExpenses: number
  existingInvestments: number
  outstandingLoans: number
  monthlyEmi: number
  inflationRate: number // annual % (e.g. 6)
  expectedReturn: number // annual % (e.g. 12)
  volatility?: number // annual % (default 15)
  additionalExpenses?: number // one-time or monthly
  dependents?: number
  simulationDuration: number // years (e.g. 5, 10, 20)
  scenarioType:
    | "normal"
    | "job_loss_3m"
    | "job_loss_6m"
    | "medical_emergency"
    | "sudden_large_expense"
    | "salary_increase"
    | "salary_decrease"
    | "loan_repayment_change"
    | "market_crash"
    | "early_retirement"
  simulationRuns?: number // default 10,000
}

export interface SimulationOutput {
  scenarioName: string
  scenarioType: string
  simulationRuns: number
  durationYears: number
  p10: number
  p50: number
  p90: number
  mean: number
  successProbability: number // %
  stressScore: number // 0 - 100
  riskClassification: "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk"
  yearlyProjections: Array<{
    year: number
    p10: number
    p50: number
    p90: number
    cumulativeSavings: number
  }>
  monthlyCashFlow: {
    income: number
    expenses: number
    netSavings: number
    runwayMonths: number
  }
  assumptions: {
    runs: number
    annualReturn: number
    annualInflation: number
    annualVolatility: number
    scenarioApplied: string
  }
}

// Standard Box-Muller transform for normal distribution
function randomNormal(mean: number, stdDev: number): number {
  let u = 0, v = 0
  while (u === 0) u = Math.random()
  while (v === 0) v = Math.random()
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return mean + z * stdDev
}

export function runMonteCarloSimulation(params: SimulationParams): SimulationOutput {
  const runs = params.simulationRuns || 10000
  const years = params.simulationDuration || 10
  const months = years * 12

  const annualReturn = params.expectedReturn / 100
  const annualInflation = params.inflationRate / 100
  const annualVol = (params.volatility ?? 15) / 100

  const monthlyReturnMean = annualReturn / 12
  const monthlyVol = annualVol / Math.sqrt(12)
  const monthlyInflation = annualInflation / 12

  const baseSavings = params.currentSavings + params.existingInvestments - params.outstandingLoans
  const startingCorpus = Math.max(params.currentSavings + params.existingInvestments, 10000)

  // Track yearly distribution samples
  const yearlyP50 = new Array(years + 1).fill(0)
  const yearlyP10 = new Array(years + 1).fill(0)
  const yearlyP90 = new Array(years + 1).fill(0)

  const finalOutcomes: number[] = new Array(runs)
  const yearlySnapshots: number[][] = Array.from({ length: years + 1 }, () => new Array(runs))

  let successCount = 0

  for (let r = 0; r < runs; r++) {
    let portfolio = startingCorpus
    yearlySnapshots[0][r] = portfolio

    let activeIncome = params.monthlyIncome
    let activeExpenses = params.monthlyExpenses + params.monthlyEmi + (params.dependents ? params.dependents * 5000 : 0)

    for (let m = 1; m <= months; m++) {
      // Scenario modifications
      let monthIncome = activeIncome
      let monthExpense = activeExpenses * Math.pow(1 + monthlyInflation, m)

      switch (params.scenarioType) {
        case "job_loss_3m":
          if (m <= 3) monthIncome = 0
          break
        case "job_loss_6m":
          if (m <= 6) monthIncome = 0
          break
        case "medical_emergency":
          if (m === 2) monthExpense += 500000 // ₹5 Lakh emergency
          break
        case "sudden_large_expense":
          if (m === 1) monthExpense += 350000 // ₹3.5 Lakh unexpected shock
          break
        case "salary_increase":
          if (m > 6) monthIncome *= 1.25 // 25% raise after 6 months
          break
        case "salary_decrease":
          if (m > 3) monthIncome *= 0.8 // 20% cut after 3 months
          break
        case "loan_repayment_change":
          // Pay off loan early or rate hike
          if (m <= 12) monthExpense += 10000
          else monthExpense = Math.max(monthExpense - params.monthlyEmi, 0)
          break
        case "market_crash":
          // Severe initial market downturn
          break
        case "early_retirement":
          if (m > 36) monthIncome = 0 // Retire in 3 years
          break
        case "normal":
        default:
          break
      }

      const netSavings = monthIncome - monthExpense
      const monthlyShockReturn = randomNormal(
        monthlyReturnMean,
        params.scenarioType === "market_crash" && m <= 12 ? monthlyVol * 1.5 : monthlyVol
      )

      portfolio = portfolio * (1 + monthlyShockReturn) + netSavings

      if (m % 12 === 0) {
        const y = m / 12
        yearlySnapshots[y][r] = Math.round(portfolio)
      }
    }

    finalOutcomes[r] = portfolio
    if (portfolio > startingCorpus * Math.pow(1 + annualInflation, years)) {
      successCount++
    }
  }

  // Sort final outcomes to compute percentiles
  finalOutcomes.sort((a, b) => a - b)
  const p10 = finalOutcomes[Math.floor(runs * 0.1)]
  const p50 = finalOutcomes[Math.floor(runs * 0.5)]
  const p90 = finalOutcomes[Math.floor(runs * 0.9)]
  const mean = Math.round(finalOutcomes.reduce((acc, v) => acc + v, 0) / runs)

  // Compute yearly percentiles
  const yearlyProjections = []
  for (let y = 0; y <= years; y++) {
    const sortedYear = yearlySnapshots[y].slice().sort((a, b) => a - b)
    const yP10 = sortedYear[Math.floor(runs * 0.1)]
    const yP50 = sortedYear[Math.floor(runs * 0.5)]
    const yP90 = sortedYear[Math.floor(runs * 0.9)]

    yearlyProjections.push({
      year: y,
      p10: Math.round(yP10),
      p50: Math.round(yP50),
      p90: Math.round(yP90),
      cumulativeSavings: Math.round(
        startingCorpus + (params.monthlyIncome - params.monthlyExpenses - params.monthlyEmi) * 12 * y
      ),
    })
  }

  const successProbability = Math.min(Math.max(Math.round((successCount / runs) * 100), 1), 99)

  // Financial stress score: lower is safer, higher is more stressed
  // Based on emergency runway, debt ratio, and worst-case percentile
  const totalMonthlySpend = params.monthlyExpenses + params.monthlyEmi
  const runwayMonths = totalMonthlySpend > 0 ? (params.currentSavings / totalMonthlySpend) : 12
  const debtToIncomeRatio = params.monthlyIncome > 0 ? (params.monthlyEmi / params.monthlyIncome) : 0

  let stressScore = 30
  if (runwayMonths < 3) stressScore += 35
  else if (runwayMonths < 6) stressScore += 15
  else stressScore -= 10

  if (debtToIncomeRatio > 0.4) stressScore += 25
  else if (debtToIncomeRatio > 0.25) stressScore += 10

  if (p10 < 0) stressScore += 25

  stressScore = Math.min(Math.max(Math.round(stressScore), 5), 95)

  let riskClassification: "Low Risk" | "Moderate Risk" | "High Risk" | "Critical Risk" = "Moderate Risk"
  if (stressScore < 30) riskClassification = "Low Risk"
  else if (stressScore < 60) riskClassification = "Moderate Risk"
  else if (stressScore < 80) riskClassification = "High Risk"
  else riskClassification = "Critical Risk"

  const scenarioTitles: Record<string, string> = {
    normal: "Normal Financial Situation",
    job_loss_3m: "Job Loss for 3 Months",
    job_loss_6m: "Job Loss for 6 Months",
    medical_emergency: "Medical Emergency Shock (₹5L)",
    sudden_large_expense: "Sudden Large Expense Shock",
    salary_increase: "Salary Increase (+25%)",
    salary_decrease: "Salary Decrease (-20%)",
    loan_repayment_change: "Aggressive Loan Repayment",
    market_crash: "Severe Bear Market Scenario",
    early_retirement: "Early Retirement in 3 Years",
  }

  return {
    scenarioName: scenarioTitles[params.scenarioType] || "Custom Simulation",
    scenarioType: params.scenarioType,
    simulationRuns: runs,
    durationYears: years,
    p10: Math.round(p10),
    p50: Math.round(p50),
    p90: Math.round(p90),
    mean,
    successProbability,
    stressScore,
    riskClassification,
    yearlyProjections,
    monthlyCashFlow: {
      income: params.monthlyIncome,
      expenses: totalMonthlySpend,
      netSavings: params.monthlyIncome - totalMonthlySpend,
      runwayMonths: Math.round(runwayMonths * 10) / 10,
    },
    assumptions: {
      runs,
      annualReturn: params.expectedReturn,
      annualInflation: params.inflationRate,
      annualVolatility: params.volatility ?? 15,
      scenarioApplied: scenarioTitles[params.scenarioType] || params.scenarioType,
    },
  }
}
