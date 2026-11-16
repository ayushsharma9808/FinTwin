// FinTwin Database Schema Types

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Profile {
  id: string
  full_name: string
  email: string
  phone_number?: string | null
  date_of_birth?: string | null
  occupation?: string | null
  monthly_income: number
  monthly_expenses: number
  financial_goal?: string | null
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive' | 'very_aggressive'
  dependents: number
  currency: string
  created_at: string
  updated_at: string
}

export interface FinancialAccount {
  id: string
  user_id: string
  account_name: string
  account_type: 'savings' | 'current' | 'fixed_deposit' | 'recurring_deposit' | 'cash' | 'demat' | 'crypto' | 'gold' | 'other'
  institution_name: string
  current_balance: number
  currency: string
  account_number_masked?: string | null
  created_at: string
  updated_at: string
}

export interface IncomeTransaction {
  id: string
  user_id: string
  source: string
  amount: number
  category: 'Salary' | 'Freelance' | 'Business' | 'Investments' | 'Rental' | 'Dividends' | 'Interest' | 'Other'
  transaction_date: string
  description?: string | null
  recurring: boolean
  created_at: string
}

export interface Expense {
  id: string
  user_id: string
  amount: number
  category: 'Food' | 'Shopping' | 'Rent' | 'Transportation' | 'Education' | 'Healthcare' | 'Entertainment' | 'Utilities' | 'Travel' | 'Investments' | 'Other'
  merchant?: string | null
  payment_method?: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Cash' | 'Other' | null
  transaction_date: string
  description?: string | null
  created_at: string
  updated_at: string
}

export interface Investment {
  id: string
  user_id: string
  asset_name: string
  asset_type: 'Stocks' | 'Mutual Funds' | 'SIP' | 'Gold' | 'Digital Gold' | 'Cryptocurrency' | 'Fixed Deposits' | 'Bonds' | 'Other assets'
  invested_amount: number
  current_value: number
  quantity: number
  purchase_date: string
  risk_category: 'low' | 'moderate' | 'high' | 'aggressive'
  notes?: string | null
  created_at: string
  updated_at: string
}

export interface Loan {
  id: string
  user_id: string
  lender_name: string
  loan_type: 'Home Loan' | 'Car Loan' | 'Personal Loan' | 'Education Loan' | 'Gold Loan' | 'Credit Card EMI' | 'Business Loan' | 'Other'
  principal_amount: number
  outstanding_amount: number
  interest_rate: number
  monthly_emi: number
  remaining_tenure: number // months
  start_date?: string | null
  end_date?: string | null
  created_at: string
  updated_at: string
}

export interface FinancialGoal {
  id: string
  user_id: string
  goal_name: string
  target_amount: number
  current_amount: number
  target_date: string
  monthly_contribution: number
  priority: 'high' | 'medium' | 'low'
  status: 'in_progress' | 'achieved' | 'paused'
  created_at: string
  updated_at: string
}

export interface SimulationRecord {
  id: string
  user_id: string
  scenario_name: string
  scenario_type: string
  initial_balance: number
  monthly_income: number
  monthly_expenses: number
  additional_expenses: number
  expected_return: number
  inflation_rate: number
  simulation_duration: number // years
  success_probability: number
  p10_value: number
  p50_value: number
  p90_value: number
  risk_score: number
  simulation_results: any
  created_at: string
}

export interface AIInsight {
  id: string
  user_id: string
  insight_type: 'cash_flow' | 'savings' | 'investment' | 'risk' | 'debt' | 'emergency_fund' | 'general'
  title: string
  description: string
  recommendation: string
  risk_level: 'low' | 'medium' | 'high'
  generated_at: string
  is_read: boolean
}

export interface AIConversation {
  id: string
  user_id: string
  conversation_title: string
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  conversation_id: string
  user_id: string
  role: 'user' | 'assistant' | 'system'
  message: string
  created_at: string
}

export interface BankStatement {
  id: string
  user_id: string
  file_name: string
  file_path: string
  file_type: 'pdf' | 'csv'
  processing_status: 'pending' | 'processed' | 'failed' | 'approved'
  total_transactions: number
  imported_at: string
  created_at: string
}

export interface ImportedTransaction {
  id: string
  user_id: string
  statement_id: string
  transaction_date: string
  description: string
  debit: number
  credit: number
  balance: number
  category?: string | null
  status: 'pending' | 'approved' | 'rejected'
  created_at: string
}

export interface NotificationItem {
  id: string
  user_id: string
  title: string
  message: string
  notification_type: 'alert' | 'info' | 'warning' | 'success'
  is_read: boolean
  created_at: string
}

export interface UserSettings {
  id: string
  user_id: string
  theme: 'light' | 'dark' | 'system'
  currency: string
  notification_preferences: {
    email: boolean
    push: boolean
    weekly_report: boolean
    unusual_spending: boolean
  }
  privacy_preferences: {
    anonymize_data: boolean
    two_factor: boolean
    data_retention_days: number
  }
  created_at: string
  updated_at: string
}
