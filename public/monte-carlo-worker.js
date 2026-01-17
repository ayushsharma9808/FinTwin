// Web Worker for Monte Carlo Simulation
// This prevents UI freezing during 10,000 simulations

// Box-Muller Transform for Normal Distribution
function randomNormal(mean = 0, stdDev = 1) {
  let u = 0, v = 0
  while(u === 0) u = Math.random()
  while(v === 0) v = Math.random()
  
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  return z * stdDev + mean
}

// Calculate required retirement corpus
function calculateRequiredCorpus(input) {
  const yearsToRetirement = input.retirementAge - input.currentAge
  const retirementYears = 25
  const inflationRate = input.inflationRate / 100
  const postRetirementReturn = Math.max(input.expectedReturn - 2, 4) / 100
  
  const futureMonthlyExpense = input.monthlyExpenses * Math.pow(1 + inflationRate, yearsToRetirement)
  const annualExpenseAtRetirement = futureMonthlyExpense * 12
  
  const requiredCorpus = annualExpenseAtRetirement * ((1 - Math.pow(1 + postRetirementReturn, -retirementYears)) / postRetirementReturn)
  
  return requiredCorpus
}

// Scenario Definitions
const SCENARIO_DEFINITIONS = {
  BASELINE: {
    apply: (input, month) => ({
      income: input.monthlyIncome,
      expenses: null,
      investment: input.monthlyInvestment
    })
  },
  
  QUIT_JOB_6_MONTHS: {
    apply: (input, month) => ({
      income: month <= 6 ? 0 : input.monthlyIncome,
      expenses: null,
      investment: month <= 6 ? 0 : input.monthlyInvestment
    })
  },
  
  QUIT_JOB_AND_TRAVEL: {
    apply: (input, month) => {
      const travelMonths = 8
      return {
        income: month <= travelMonths ? 0 : input.monthlyIncome,
        expenses: month <= travelMonths ? input.monthlyExpenses * 1.4 : null,
        investment: month <= travelMonths ? 0 : input.monthlyInvestment
      }
    }
  },
  
  MEDICAL_EMERGENCY: {
    apply: (input, month) => {
      const emergencyExpense = month === 1 ? 500000 : 0
      return {
        income: input.monthlyIncome,
        expenses: emergencyExpense > 0 ? input.monthlyExpenses + emergencyExpense : null,
        investment: input.monthlyInvestment
      }
    }
  },
  
  CAREER_BREAK_AND_UPSKILL: {
    apply: (input, month) => ({
      income: month <= 12 ? input.monthlyIncome * 0.2 : input.monthlyIncome * 1.2,
      expenses: month <= 12 ? input.monthlyExpenses * 1.1 : null,
      investment: month <= 12 ? input.monthlyInvestment * 0.3 : input.monthlyInvestment * 1.1
    })
  },
  
  START_BUSINESS: {
    apply: (input, month) => {
      const initialCapital = month <= 6 ? 200000 : 0
      const businessIncome = month > 12 ? input.monthlyIncome * 1.3 : (month > 6 ? input.monthlyIncome * 0.4 : 0)
      return {
        income: businessIncome,
        expenses: initialCapital > 0 ? input.monthlyExpenses + initialCapital : null,
        investment: month > 18 ? input.monthlyInvestment * 1.2 : 0
      }
    }
  }
}

// Main simulation function
function runSimulation(input) {
  const results = []
  const requiredCorpus = calculateRequiredCorpus(input)
  
  const yearsToRetirement = input.retirementAge - input.currentAge
  const totalMonths = yearsToRetirement * 12
  const monthlyMeanReturn = (input.expectedReturn / 100) / 12
  const monthlyVolatility = (input.returnVolatility / 100) / Math.sqrt(12)
  const inflationMonthly = (input.inflationRate / 100) / 12
  
  const scenario = SCENARIO_DEFINITIONS[input.scenarioType]
  
  for (let run = 0; run < input.simulationRuns; run++) {
    let netWorth = input.currentSavings
    let monthlyExpenses = input.monthlyExpenses
    
    for (let month = 1; month <= totalMonths; month++) {
      const randomReturn = randomNormal(monthlyMeanReturn, monthlyVolatility)
      const scenarioValues = scenario.apply(input, month)
      
      // Apply inflation ONLY to base expenses
      monthlyExpenses *= (1 + inflationMonthly)
      
      // Use scenario expenses if specified, otherwise use inflated base expenses
      const actualExpenses = scenarioValues.expenses !== null ? scenarioValues.expenses : monthlyExpenses
      
      // Update net worth ONCE per month
      const monthlyFlow = scenarioValues.income - actualExpenses - scenarioValues.investment
      netWorth = (netWorth + monthlyFlow) * (1 + randomReturn)
      
      // Clamp negative values
      if (netWorth < 0) netWorth = 0
    }
    
    results.push(netWorth)
    
    // Send progress updates
    if (run % 1000 === 0) {
      self.postMessage({
        type: 'progress',
        progress: (run / input.simulationRuns) * 100
      })
    }
  }
  
  results.sort((a, b) => a - b)
  
  const mean = results.reduce((sum, val) => sum + val, 0) / results.length
  const median = results[Math.floor(results.length * 0.5)]
  const successCount = results.filter(val => val >= requiredCorpus).length
  
  // Use p95/p5 for realistic bounds
  const bestCase = results[Math.floor(results.length * 0.95)]
  const worstCase = results[Math.floor(results.length * 0.05)]
  
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

// Worker message handler
self.onmessage = function(e) {
  const { type, input } = e.data
  
  if (type === 'runSimulation') {
    try {
      const result = runSimulation(input)
      self.postMessage({
        type: 'result',
        result
      })
    } catch (error) {
      self.postMessage({
        type: 'error',
        error: error.message
      })
    }
  }
}