// Core financial calculation utilities
export interface YearlyBreakdown {
  year: number
  investment: number
  returns: number
  totalValue: number
  cumulativeInvestment: number
}

export interface MonthlyBreakdown {
  month: number
  year: number
  investment: number
  returns: number
  totalValue: number
  balance: number
}

export class FinancialCalculations {
  // SIP Future Value: FV = P × [((1 + r)^n - 1) / r] × (1 + r)
  static calculateSIP(monthlySip: number, annualRate: number, years: number) {
    const r = annualRate / 100 / 12  // Correct monthly rate
    const n = years * 12             // Total months
    const totalInvestment = monthlySip * n
    
    // Correct SIP formula (JS-safe)
    const futureValue = monthlySip * ((Math.pow(1 + r, n) - 1) / r) * (1 + r)
    const totalReturns = futureValue - totalInvestment
    
    const yearlyBreakdown: YearlyBreakdown[] = []
    
    for (let year = 1; year <= years; year++) {
      const monthsCompleted = year * 12
      const cumulativeInvestment = monthlySip * monthsCompleted
      const yearValue = monthlySip * ((Math.pow(1 + r, monthsCompleted) - 1) / r) * (1 + r)
      const prevYearValue = year > 1 ? monthlySip * ((Math.pow(1 + r, (year - 1) * 12) - 1) / r) * (1 + r) : 0
      const yearReturns = yearValue - prevYearValue - (monthlySip * 12)
      
      yearlyBreakdown.push({
        year,
        investment: monthlySip * 12,
        returns: Math.max(0, yearReturns),
        totalValue: yearValue,
        cumulativeInvestment
      })
    }
    
    return {
      totalInvestment: Math.round(totalInvestment),
      totalReturns: Math.round(totalReturns),
      maturityValue: Math.round(futureValue),  // Round only at final step
      yearlyBreakdown,
      chartData: yearlyBreakdown.map(y => ({ year: y.year, investment: y.cumulativeInvestment, value: y.totalValue }))
    }
  }

  // Lumpsum: FV = P × (1 + r)^n
  static calculateLumpsum(principal: number, annualRate: number, years: number) {
    const rate = annualRate / 100
    const futureValue = principal * Math.pow(1 + rate, years)
    const totalReturns = futureValue - principal
    
    const yearlyBreakdown: YearlyBreakdown[] = []
    for (let year = 1; year <= years; year++) {
      const yearValue = principal * Math.pow(1 + rate, year)
      const prevYearValue = year > 1 ? principal * Math.pow(1 + rate, year - 1) : principal
      const yearReturns = yearValue - prevYearValue
      
      yearlyBreakdown.push({
        year,
        investment: year === 1 ? principal : 0,
        returns: yearReturns,
        totalValue: yearValue,
        cumulativeInvestment: principal
      })
    }
    
    return {
      totalInvestment: principal,
      totalReturns: Math.round(totalReturns),
      maturityValue: Math.round(futureValue),
      yearlyBreakdown,
      chartData: yearlyBreakdown.map(y => ({ year: y.year, investment: y.cumulativeInvestment, value: y.totalValue }))
    }
  }

  // SWP Calculator
  static calculateSWP(initialInvestment: number, monthlyWithdrawal: number, annualRate: number, years: number) {
    const r = annualRate / 100 / 12  // Correct monthly rate
    const totalMonths = years * 12
    let balance = initialInvestment
    const monthlyBreakdown: MonthlyBreakdown[] = []
    
    for (let month = 1; month <= totalMonths; month++) {
      const monthlyReturns = balance * r
      balance = Math.max(0, balance + monthlyReturns - monthlyWithdrawal)
      
      monthlyBreakdown.push({
        month,
        year: Math.ceil(month / 12),
        investment: 0,
        returns: monthlyReturns,
        totalValue: balance,
        balance
      })
      
      if (balance <= 0) break
    }
    
    const totalWithdrawn = monthlyWithdrawal * Math.min(totalMonths, monthlyBreakdown.length)
    const remainingBalance = balance
    
    return {
      totalWithdrawn: Math.round(totalWithdrawn),
      remainingBalance: Math.round(remainingBalance),
      monthlyBreakdown,
      chartData: monthlyBreakdown.filter((_, i) => i % 12 === 11).map(m => ({ year: m.year, balance: m.balance, withdrawn: monthlyWithdrawal * 12 }))
    }
  }

  // Goal SIP Calculator - Reverse calculation
  static calculateGoalSIP(targetAmount: number, years: number, annualRate: number) {
    const r = annualRate / 100 / 12  // Correct monthly rate
    const n = years * 12             // Total months
    
    const requiredSIP = targetAmount / (((Math.pow(1 + r, n) - 1) / r) * (1 + r))
    const totalInvestment = requiredSIP * n
    
    const yearlyBreakdown: YearlyBreakdown[] = []
    for (let year = 1; year <= years; year++) {
      const monthsCompleted = year * 12
      const cumulativeInvestment = requiredSIP * monthsCompleted
      const yearValue = requiredSIP * ((Math.pow(1 + r, monthsCompleted) - 1) / r) * (1 + r)
      
      yearlyBreakdown.push({
        year,
        investment: requiredSIP * 12,
        returns: yearValue - cumulativeInvestment,
        totalValue: yearValue,
        cumulativeInvestment
      })
    }
    
    return {
      requiredSIP: Math.round(requiredSIP),
      totalInvestment: Math.round(totalInvestment),
      targetAmount,
      totalReturns: Math.round(targetAmount - totalInvestment),
      yearlyBreakdown,
      chartData: yearlyBreakdown.map(y => ({ year: y.year, investment: y.cumulativeInvestment, value: y.totalValue }))
    }
  }

  // Step-up SIP
  static calculateStepUpSIP(initialSIP: number, stepUpPercent: number, annualRate: number, years: number) {
    const r = annualRate / 100 / 12  // Correct monthly rate
    let totalInvestment = 0
    let totalValue = 0
    let currentSIP = initialSIP
    
    const yearlyBreakdown: YearlyBreakdown[] = []
    
    for (let year = 1; year <= years; year++) {
      const yearInvestment = currentSIP * 12
      totalInvestment += yearInvestment
      
      // Calculate future value for each month of this year
      let yearEndValue = 0
      for (let month = 1; month <= 12; month++) {
        const remainingMonths = (years - year) * 12 + (12 - month + 1)
        yearEndValue += currentSIP * Math.pow(1 + r, remainingMonths)
      }
      
      totalValue = yearEndValue
      
      yearlyBreakdown.push({
        year,
        investment: yearInvestment,
        returns: totalValue - totalInvestment,
        totalValue,
        cumulativeInvestment: totalInvestment
      })
      
      currentSIP = currentSIP * (1 + stepUpPercent / 100)
    }
    
    return {
      totalInvestment: Math.round(totalInvestment),
      maturityValue: Math.round(totalValue),
      totalReturns: Math.round(totalValue - totalInvestment),
      yearlyBreakdown,
      chartData: yearlyBreakdown.map(y => ({ year: y.year, investment: y.cumulativeInvestment, value: y.totalValue }))
    }
  }

  // Retirement Planning Calculator
  static calculateRetirementPlanning(currentAge: number, retirementAge: number, lifeExpectancy: number, currentMonthlyExpense: number, expectedInflationRate: number, preRetirementReturn: number, postRetirementReturn: number) {
    // Validation
    if (retirementAge <= currentAge) {
      throw new Error("Retirement age must be greater than current age")
    }
    if (lifeExpectancy <= retirementAge) {
      throw new Error("Life expectancy must be greater than retirement age")
    }
    if (currentMonthlyExpense <= 0) {
      throw new Error("Monthly expenses must be greater than zero")
    }
    
    // Derived values
    const yearsToRetirement = retirementAge - currentAge
    const retirementYears = lifeExpectancy - retirementAge
    const inflationRate = expectedInflationRate / 100
    const postRetirementRate = postRetirementReturn / 100
    
    // Step 1: Future Monthly Expense at Retirement
    const futureMonthlyExpenseAtRetirement = currentMonthlyExpense * Math.pow(1 + inflationRate, yearsToRetirement)
    
    // Step 2: Annual Expense at Retirement
    const annualExpenseAtRetirement = futureMonthlyExpenseAtRetirement * 12
    
    // Step 3: Retirement Corpus Required (Present Value of Annuity)
    const retirementCorpusRequired = annualExpenseAtRetirement * ((1 - Math.pow(1 + postRetirementRate, -retirementYears)) / postRetirementRate)
    
    // Year-wise breakdown
    const yearlyBreakdown = []
    let remainingCorpus = retirementCorpusRequired
    let currentAnnualExpense = annualExpenseAtRetirement
    
    for (let year = 0; year < retirementYears; year++) {
      const age = retirementAge + year
      
      // Calculate returns on remaining corpus
      const annualReturns = remainingCorpus * postRetirementRate
      
      // Subtract annual expense
      remainingCorpus = remainingCorpus + annualReturns - currentAnnualExpense
      
      yearlyBreakdown.push({
        year: age,
        annualExpense: Math.round(currentAnnualExpense),
        remainingCorpus: Math.max(0, Math.round(remainingCorpus))
      })
      
      // Inflate expense for next year
      currentAnnualExpense = currentAnnualExpense * (1 + inflationRate)
      
      if (remainingCorpus <= 0) break
    }
    
    return {
      futureMonthlyExpenseAtRetirement: Math.round(futureMonthlyExpenseAtRetirement),
      annualExpenseAtRetirement: Math.round(annualExpenseAtRetirement),
      retirementCorpusRequired: Math.round(retirementCorpusRequired),
      retirementYears,
      yearlyBreakdown,
      chartData: yearlyBreakdown.map(y => ({
        age: y.year,
        corpus: y.remainingCorpus,
        expense: y.annualExpense
      }))
    }
  }

  // Child Marriage Planning Calculator
  static calculateChildMarriagePlanning(childCurrentAge: number, expectedMarriageAge: number, currentMarriageCost: number, marriageInflationRate: number, expectedInvestmentReturn: number, investmentType: 'SIP' | 'Lumpsum') {
    // Validation
    if (expectedMarriageAge <= childCurrentAge) {
      throw new Error("Marriage age must be greater than child's current age")
    }
    if (currentMarriageCost <= 0) {
      throw new Error("Current marriage cost must be greater than zero")
    }
    if (marriageInflationRate >= expectedInvestmentReturn) {
      console.warn("Marriage inflation rate is higher than or equal to expected investment return")
    }
    
    // Derived values
    const yearsToMarriage = expectedMarriageAge - childCurrentAge
    const inflationRate = marriageInflationRate / 100
    const annualReturnRate = expectedInvestmentReturn / 100
    const monthlyReturnRate = annualReturnRate / 12
    const totalMonths = yearsToMarriage * 12
    
    // Step 1: Future Marriage Cost (Inflation Adjusted)
    const futureMarriageCost = currentMarriageCost * Math.pow(1 + inflationRate, yearsToMarriage)
    
    let monthlySIPRequired = 0
    let lumpsumRequired = 0
    
    // Step 2A: Required Monthly SIP (If SIP Selected)
    if (investmentType === 'SIP') {
      monthlySIPRequired = (futureMarriageCost * monthlyReturnRate) / (Math.pow(1 + monthlyReturnRate, totalMonths) - 1)
    }
    
    // Step 2B: Required Lumpsum (If Lumpsum Selected)
    if (investmentType === 'Lumpsum') {
      lumpsumRequired = futureMarriageCost / Math.pow(1 + annualReturnRate, yearsToMarriage)
    }
    
    // Year-wise breakdown
    const yearlyBreakdown = []
    if (investmentType === 'SIP') {
      for (let year = 1; year <= yearsToMarriage; year++) {
        const monthsCompleted = year * 12
        const totalInvested = monthlySIPRequired * monthsCompleted
        const portfolioValue = monthlySIPRequired * ((Math.pow(1 + monthlyReturnRate, monthsCompleted) - 1) / monthlyReturnRate) * (1 + monthlyReturnRate)
        
        yearlyBreakdown.push({
          year,
          totalInvested: Math.round(totalInvested),
          portfolioValue: Math.round(portfolioValue)
        })
      }
    } else {
      // Year-wise breakdown for Lumpsum
      for (let year = 1; year <= yearsToMarriage; year++) {
        const portfolioValue = lumpsumRequired * Math.pow(1 + annualReturnRate, year)
        
        yearlyBreakdown.push({
          year,
          totalInvested: Math.round(lumpsumRequired),
          portfolioValue: Math.round(portfolioValue)
        })
      }
    }
    
    return {
      yearsToMarriage,
      futureMarriageCost: Math.round(futureMarriageCost),
      monthlySIPRequired: Math.round(monthlySIPRequired),
      lumpsumRequired: Math.round(lumpsumRequired),
      investmentType,
      yearlyBreakdown,
      chartData: yearlyBreakdown.map(y => ({
        year: y.year,
        invested: y.totalInvested,
        portfolio: y.portfolioValue,
        target: futureMarriageCost
      }))
    }
  }

  // Child Education Planning Calculator
  static calculateChildEducationPlanning(childCurrentAge: number, educationStartAge: number, currentEducationCost: number, educationInflationRate: number, expectedInvestmentReturn: number, investmentType: 'SIP' | 'Lumpsum') {
    // Validation
    if (educationStartAge <= childCurrentAge) {
      throw new Error("Education start age must be greater than child's current age")
    }
    if (currentEducationCost <= 0) {
      throw new Error("Current education cost must be greater than zero")
    }
    if (educationInflationRate >= expectedInvestmentReturn) {
      console.warn("Education inflation rate is higher than or equal to expected investment return")
    }
    
    // Derived values
    const yearsToEducation = educationStartAge - childCurrentAge
    const inflationRate = educationInflationRate / 100
    const annualReturnRate = expectedInvestmentReturn / 100
    const monthlyReturnRate = annualReturnRate / 12
    const totalMonths = yearsToEducation * 12
    
    // Step 1: Future Education Cost (Inflation Adjusted)
    const futureEducationCost = currentEducationCost * Math.pow(1 + inflationRate, yearsToEducation)
    
    let monthlySIPRequired = 0
    let lumpsumRequired = 0
    
    // Step 2A: Required Monthly SIP (If SIP Selected)
    if (investmentType === 'SIP') {
      monthlySIPRequired = (futureEducationCost * monthlyReturnRate) / (Math.pow(1 + monthlyReturnRate, totalMonths) - 1)
    }
    
    // Step 2B: Required Lumpsum (If Lumpsum Selected)
    if (investmentType === 'Lumpsum') {
      lumpsumRequired = futureEducationCost / Math.pow(1 + annualReturnRate, yearsToEducation)
    }
    
    // Year-wise breakdown for SIP
    const yearlyBreakdown = []
    if (investmentType === 'SIP') {
      for (let year = 1; year <= yearsToEducation; year++) {
        const monthsCompleted = year * 12
        const investedAmount = monthlySIPRequired * monthsCompleted
        const portfolioValue = monthlySIPRequired * ((Math.pow(1 + monthlyReturnRate, monthsCompleted) - 1) / monthlyReturnRate) * (1 + monthlyReturnRate)
        
        yearlyBreakdown.push({
          year,
          investedAmount: Math.round(investedAmount),
          portfolioValue: Math.round(portfolioValue)
        })
      }
    } else {
      // Year-wise breakdown for Lumpsum
      for (let year = 1; year <= yearsToEducation; year++) {
        const portfolioValue = lumpsumRequired * Math.pow(1 + annualReturnRate, year)
        
        yearlyBreakdown.push({
          year,
          investedAmount: Math.round(lumpsumRequired),
          portfolioValue: Math.round(portfolioValue)
        })
      }
    }
    
    return {
      yearsToEducation,
      futureEducationCost: Math.round(futureEducationCost),
      monthlySIPRequired: Math.round(monthlySIPRequired),
      lumpsumRequired: Math.round(lumpsumRequired),
      yearlyBreakdown,
      chartData: yearlyBreakdown.map(y => ({
        year: y.year,
        invested: y.investedAmount,
        portfolio: y.portfolioValue
      }))
    }
  }

  // SIP Cost Delay Calculator
  static calculateSIPDelay(monthlySIP: number, annualReturnRate: number, totalInvestmentYears: number, delayYears: number) {
    if (delayYears >= totalInvestmentYears) {
      throw new Error("Delay years cannot be greater than or equal to total investment years")
    }
    
    const monthlyRate = annualReturnRate / 100 / 12
    const totalMonths = totalInvestmentYears * 12
    const delayMonths = delayYears * 12
    const effectiveMonths = totalMonths - delayMonths
    
    // Case A: SIP Started Immediately
    const totalInvestmentWithoutDelay = monthlySIP * totalMonths
    const maturityValueWithoutDelay = monthlySIP * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate) * (1 + monthlyRate)
    
    // Case B: SIP Started After Delay
    const totalInvestmentWithDelay = monthlySIP * effectiveMonths
    const maturityValueWithDelay = monthlySIP * ((Math.pow(1 + monthlyRate, effectiveMonths) - 1) / monthlyRate) * (1 + monthlyRate)
    
    // Loss Due to Delay
    const lossDueToDelay = maturityValueWithoutDelay - maturityValueWithDelay
    
    // Year-wise breakdown
    const yearlyBreakdown = []
    for (let year = 1; year <= totalInvestmentYears; year++) {
      const monthsCompleted = year * 12
      
      // Without delay calculation
      const valueWithoutDelay = monthlySIP * ((Math.pow(1 + monthlyRate, monthsCompleted) - 1) / monthlyRate) * (1 + monthlyRate)
      
      // With delay calculation
      let valueWithDelay = 0
      if (year > delayYears) {
        const effectiveMonthsForYear = monthsCompleted - delayMonths
        valueWithDelay = monthlySIP * ((Math.pow(1 + monthlyRate, effectiveMonthsForYear) - 1) / monthlyRate) * (1 + monthlyRate)
      }
      
      yearlyBreakdown.push({
        year,
        valueWithoutDelay: Math.round(valueWithoutDelay),
        valueWithDelay: Math.round(valueWithDelay)
      })
    }
    
    return {
      sipStartedImmediately: {
        totalInvestment: Math.round(totalInvestmentWithoutDelay),
        maturityValue: Math.round(maturityValueWithoutDelay)
      },
      sipStartedAfterDelay: {
        totalInvestment: Math.round(totalInvestmentWithDelay),
        maturityValue: Math.round(maturityValueWithDelay)
      },
      lossDueToDelay: Math.round(lossDueToDelay),
      yearlyBreakdown,
      chartData: yearlyBreakdown.map(y => ({
        year: y.year,
        withoutDelay: y.valueWithoutDelay,
        withDelay: y.valueWithDelay
      }))
    }
  }
}