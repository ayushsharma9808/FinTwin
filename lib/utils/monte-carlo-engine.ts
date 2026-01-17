// Monte Carlo Simulation Engine for What-If Scenario Calculator
export interface ScenarioInput {
  currentAge: number
  retirementAge: number
  currentSavings: number
  monthlyIncome: number
  monthlyExpenses: number
  monthlyInvestment: number
  expectedReturn: number
  returnVolatility: number
  inflationRate: number
  scenarioType: string
  simulationRuns: number
}

export interface SimulationResult {
  medianOutcome: number
  meanOutcome: number
  bestCase: number
  worstCase: number
  probabilityOfSuccess: number
  requiredCorpus: number
  percentiles: {
    p5: number
    p10: number
    p25: number
    p50: number
    p75: number
    p90: number
    p95: number
  }
  simulationResults: number[]
}

export interface ScenarioComparison {
  baseline: SimulationResult
  scenario: SimulationResult
  impactAnalysis: {
    medianDifference: number
    successProbabilityChange: number
    recoveryYears: number
  }
}

// Box-Muller Transform for Normal Distribution
function randomNormal(mean: number = 0, stdDev: number = 1): number {
  let u = 0, v = 0
  while(u === 0) u = Math.random() // Converting [0,1) to (0,1)
  while(v === 0) v = Math.random()
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return z * stdDev + mean
}

// Scenario Definitions
export const SCENARIO_DEFINITIONS = {
  BASELINE: {
    name: "Baseline (No Changes)",
    description: "Continue current financial plan without any changes",
    apply: (input: ScenarioInput, month: number) => ({
      income: input.monthlyIncome,
      expenses: null, // Use inflated base expenses
      investment: input.monthlyInvestment
    })
  },
  
  QUIT_JOB_6_MONTHS: {
    name: "Quit Job for 6 Months",
    description: "Take a 6-month career break with no income",
    apply: (input: ScenarioInput, month: number) => ({
      income: month <= 6 ? 0 : input.monthlyIncome,
      expenses: null, // Use inflated base expenses
      investment: month <= 6 ? 0 : input.monthlyInvestment
    })
  },
  
  QUIT_JOB_AND_TRAVEL: {
    name: "Quit Job & Travel",
    description: "6-12 month travel break with increased expenses",
    apply: (input: ScenarioInput, month: number) => {
      const travelMonths = 8 // Fixed 8 months for consistency
      return {
        income: month <= travelMonths ? 0 : input.monthlyIncome,
        expenses: month <= travelMonths ? input.monthlyExpenses * 1.4 : null,
        investment: month <= travelMonths ? 0 : input.monthlyInvestment
      }
    }
  },
  
  MEDICAL_EMERGENCY: {
    name: "Medical Emergency",
    description: "One-time medical expense shock",
    apply: (input: ScenarioInput, month: number) => {
      const emergencyExpense = month === 1 ? 500000 : 0 // Fixed ₹5L emergency
      return {
        income: input.monthlyIncome,
        expenses: emergencyExpense > 0 ? input.monthlyExpenses + emergencyExpense : null,
        investment: input.monthlyInvestment
      }
    }
  },
  
  CAREER_BREAK_AND_UPSKILL: {
    name: "Career Break & Upskill",
    description: "12-month break followed by 20% income increase",
    apply: (input: ScenarioInput, month: number) => ({
      income: month <= 12 ? input.monthlyIncome * 0.2 : input.monthlyIncome * 1.2,
      expenses: month <= 12 ? input.monthlyExpenses * 1.1 : null, // Slight increase during break
      investment: month <= 12 ? input.monthlyInvestment * 0.3 : input.monthlyInvestment * 1.1
    })
  },
  
  START_BUSINESS: {
    name: "Start Business",
    description: "Initial capital outflow with uncertain returns",
    apply: (input: ScenarioInput, month: number) => {
      const initialCapital = month <= 6 ? 200000 : 0 // ₹2L per month for 6 months
      const businessIncome = month > 12 ? input.monthlyIncome * 1.3 : (month > 6 ? input.monthlyIncome * 0.4 : 0)
      return {
        income: businessIncome,
        expenses: initialCapital > 0 ? input.monthlyExpenses + initialCapital : null,
        investment: month > 18 ? input.monthlyInvestment * 1.2 : 0
      }
    }
  }
}

export class MonteCarloEngine {
  // Calculate required retirement corpus with inflation adjustment
  static calculateRequiredCorpus(input: ScenarioInput): number {
    const yearsToRetirement = input.retirementAge - input.currentAge
    const retirementYears = 25 // Assume 25 years post-retirement
    const inflationRate = input.inflationRate / 100
    const postRetirementReturn = Math.max(input.expectedReturn - 2, 4) / 100 // Conservative post-retirement return
    
    // Future monthly expense at retirement (inflation-adjusted)
    const futureMonthlyExpense = input.monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement)
    const annualExpenseAtRetirement = futureMonthlyExpense * 12
    
    // Present value of retirement expenses (annuity formula)
    const requiredCorpus = annualExpenseAtRetirement * ((1 - Math.pow(1 + postRetirementReturn, -retirementYears)) / postRetirementReturn)
    
    return requiredCorpus
  }

  static async runSimulation(input: ScenarioInput): Promise<SimulationResult> {
    return new Promise((resolve, reject) => {
      // Try to use Web Worker for better performance
      if (typeof Worker !== 'undefined') {
        const worker = new Worker('/monte-carlo-worker.js')
        
        worker.onmessage = (e) => {
          const { type, result, error } = e.data
          
          if (type === 'result') {
            worker.terminate()
            resolve(result)
          } else if (type === 'error') {
            worker.terminate()
            reject(new Error(error))
          }
        }
        
        worker.onerror = (error) => {
          worker.terminate()
          reject(error)
        }
        
        worker.postMessage({ type: 'runSimulation', input })
      } else {
        // Fallback to main thread if Web Worker not available
        try {
          const result = this.runSimulationSync(input)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }
    })
  }
  
  static runSimulationSync(input: ScenarioInput): SimulationResult {
    const results: number[] = []
    const requiredCorpus = this.calculateRequiredCorpus(input)
    
    // Validation
    if (input.returnVolatility > 25) {
      console.warn('High volatility detected (>25%). Results may be unrealistic.')
    }
    
    // Derived values - CORRECT SCALING
    const yearsToRetirement = input.retirementAge - input.currentAge
    const totalMonths = yearsToRetirement * 12
    const monthlyMeanReturn = (input.expectedReturn / 100) / 12
    const monthlyVolatility = (input.returnVolatility / 100) / Math.sqrt(12)
    const inflationMonthly = (input.inflationRate / 100) / 12
    
    const scenario = SCENARIO_DEFINITIONS[input.scenarioType as keyof typeof SCENARIO_DEFINITIONS]
    
    // Run 10,000 simulations
    for (let run = 0; run < input.simulationRuns; run++) {
      let netWorth = input.currentSavings
      let monthlyExpenses = input.monthlyExpenses
      
      for (let month = 1; month <= totalMonths; month++) {
        // Generate random return using normal distribution
        const randomReturn = randomNormal(monthlyMeanReturn, monthlyVolatility)
        
        // Apply scenario rules
        const scenarioValues = scenario.apply(input, month)
        
        // Apply inflation ONLY to expenses
        monthlyExpenses *= (1 + inflationMonthly)
        
        // Update net worth ONCE per month
        const monthlyFlow = scenarioValues.income - (scenarioValues.expenses || monthlyExpenses) - scenarioValues.investment
        netWorth = (netWorth + monthlyFlow) * (1 + randomReturn)
        
        // Clamp negative values
        if (netWorth < 0) netWorth = 0
      }
      
      results.push(netWorth)
    }
    
    // Sort results for percentile calculations
    results.sort((a, b) => a - b)
    
    // Calculate statistics with realistic bounds
    const mean = results.reduce((sum, val) => sum + val, 0) / results.length
    const median = results[Math.floor(results.length * 0.5)]
    const successCount = results.filter(val => val >= requiredCorpus).length
    
    // Use p95/p5 instead of max/min for realistic bounds
    const bestCase = results[Math.floor(results.length * 0.95)]
    const worstCase = results[Math.floor(results.length * 0.05)]
    
    // Validation: Flag unrealistic results
    if (bestCase > 3 * median) {
      console.warn('Best case result may be unrealistic:', bestCase)
    }
    
    return {
      medianOutcome: Math.round(median),
      meanOutcome: Math.round(mean),
      bestCase: Math.round(bestCase),
      worstCase: Math.max(0, Math.round(worstCase)),
      probabilityOfSuccess: Math.round((successCount / results.length) * 100),
      requiredCorpus: Math.round(requiredCorpus),
      percentiles: {
        p5: Math.max(0, Math.round(results[Math.floor(results.length * 0.05)])),
        p10: Math.max(0, Math.round(results[Math.floor(results.length * 0.1)])),
        p25: Math.round(results[Math.floor(results.length * 0.25)]),
        p50: Math.round(median),
        p75: Math.round(results[Math.floor(results.length * 0.75)]),
        p90: Math.round(results[Math.floor(results.length * 0.9)]),
        p95: Math.round(results[Math.floor(results.length * 0.95)])
      },
      simulationResults: results.map(r => Math.round(r))
    }
  }
  
  static async compareScenarios(input: ScenarioInput): Promise<ScenarioComparison> {
    // STEP 1: Run baseline simulation FIRST
    const baselineInput = { ...input, scenarioType: 'BASELINE' }
    const baseline = await this.runSimulation(baselineInput)
    
    // STEP 2: Run scenario simulation
    const scenario = await this.runSimulation(input)
    
    // STEP 3: Calculate impact analysis
    const medianDifference = scenario.medianOutcome - baseline.medianOutcome
    const successProbabilityChange = scenario.probabilityOfSuccess - baseline.probabilityOfSuccess
    
    // Calculate recovery time based on median difference
    const recoveryYears = Math.abs(medianDifference) > 1000000 ? 
      (Math.abs(medianDifference) > 5000000 ? 7 : 5) : 3
    
    return {
      baseline,
      scenario,
      impactAnalysis: {
        medianDifference: Math.round(medianDifference),
        successProbabilityChange: Math.round(successProbabilityChange),
        recoveryYears
      }
    }
  }
  
  static generateHistogramData(results: number[], bins: number = 30) {
    if (!results || results.length === 0) return []
    
    // Use p5 to p95 range for realistic histogram
    const sortedResults = [...results].sort((a, b) => a - b)
    const min = sortedResults[Math.floor(results.length * 0.05)]
    const max = sortedResults[Math.floor(results.length * 0.95)]
    const binWidth = (max - min) / bins
    
    if (binWidth <= 0) return []
    
    const histogram = Array(bins).fill(0).map((_, i) => {
      const binStart = min + i * binWidth
      const binEnd = min + (i + 1) * binWidth
      return {
        range: `₹${Math.round(binStart / 100000)}L - ₹${Math.round(binEnd / 100000)}L`,
        count: 0,
        value: binStart,
        binStart,
        binEnd
      }
    })
    
    results.forEach(result => {
      if (result >= min && result <= max) {
        const binIndex = Math.min(Math.floor((result - min) / binWidth), bins - 1)
        if (histogram[binIndex]) {
          histogram[binIndex].count++
        }
      }
    })
    
    return histogram
  }
}