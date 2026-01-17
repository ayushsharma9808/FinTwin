interface EMIRequest {
  principal: number
  rate: number
  tenure: number
  tenureType?: 'months' | 'years'
}

interface MonthlyBreakdown {
  month: number
  monthly_emi: number
  monthly_principal: number
  monthly_interest: number
  remaining_loan_amount: number
}

interface YearlyBreakdown {
  year: number
  yearly_emi: number
  yearly_principal: number
  yearly_interest: number
  monthly_breakdown: MonthlyBreakdown[]
}

interface EMIResponse {
  emi: number
  emi_breakdown: YearlyBreakdown[]
}

export class EMICalculatorAPI {
  private static readonly API_URL = 'https://smart-emi-calculator.p.rapidapi.com/'
  private static readonly API_KEY = 'da914be7f6msh6707bf891a7b3bfp1348c3jsna29e1dddd3f6'
  private static readonly API_HOST = 'smart-emi-calculator.p.rapidapi.com'

  static async calculateEMI(params: EMIRequest): Promise<EMIResponse> {
    try {
      const formData = new URLSearchParams()
      formData.append('loan_amount', params.principal.toString())
      formData.append('interest_rate', params.rate.toString())
      formData.append('loan_term', params.tenure.toString())

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'x-rapidapi-host': this.API_HOST,
          'x-rapidapi-key': this.API_KEY,
        },
        body: formData.toString(),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('EMI API Error:', error)
      // Fallback calculation
      return this.fallbackCalculation(params)
    }
  }

  private static fallbackCalculation(params: EMIRequest): EMIResponse {
    const { principal, rate, tenure } = params
    const monthlyRate = rate / (12 * 100)
    const totalMonths = params.tenureType === 'years' ? tenure * 12 : tenure
    
    const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / 
                (Math.pow(1 + monthlyRate, totalMonths) - 1)
    
    const totalAmount = emi * totalMonths
    const totalInterest = totalAmount - principal

    return {
      emi: Math.round(emi),
      emi_breakdown: []
    }
  }
}