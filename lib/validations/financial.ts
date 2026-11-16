import { z } from "zod"

export const profileSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone_number: z.string().optional().nullable(),
  date_of_birth: z.string().optional().nullable(),
  occupation: z.string().optional().nullable(),
  monthly_income: z.coerce.number().min(0, "Income must be non-negative"),
  monthly_expenses: z.coerce.number().min(0, "Expenses must be non-negative"),
  financial_goal: z.string().optional().nullable(),
  risk_tolerance: z.enum(["conservative", "moderate", "aggressive", "very_aggressive"]),
  dependents: z.coerce.number().int().min(0, "Dependents cannot be negative"),
  currency: z.string().default("INR"),
})

export const accountSchema = z.object({
  account_name: z.string().min(2, "Account name is required"),
  account_type: z.enum([
    "savings",
    "current",
    "fixed_deposit",
    "recurring_deposit",
    "cash",
    "demat",
    "crypto",
    "gold",
    "other",
  ]),
  institution_name: z.string().min(2, "Institution name is required"),
  current_balance: z.coerce.number().min(0, "Balance must be non-negative"),
  currency: z.string().default("INR"),
  account_number_masked: z.string().optional().nullable(),
})

export const incomeSchema = z.object({
  source: z.string().min(2, "Income source is required"),
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  category: z.enum([
    "Salary",
    "Freelance",
    "Business",
    "Investments",
    "Rental",
    "Dividends",
    "Interest",
    "Other",
  ]),
  transaction_date: z.string(),
  description: z.string().optional().nullable(),
  recurring: z.boolean().default(false),
})

export const expenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than zero"),
  category: z.enum([
    "Food",
    "Shopping",
    "Rent",
    "Transportation",
    "Education",
    "Healthcare",
    "Entertainment",
    "Utilities",
    "Travel",
    "Investments",
    "Other",
  ]),
  merchant: z.string().optional().nullable(),
  payment_method: z.enum([
    "UPI",
    "Credit Card",
    "Debit Card",
    "Net Banking",
    "Cash",
    "Other",
  ]).optional().nullable(),
  transaction_date: z.string(),
  description: z.string().optional().nullable(),
})

export const investmentSchema = z.object({
  asset_name: z.string().min(2, "Asset name is required"),
  asset_type: z.enum([
    "Stocks",
    "Mutual Funds",
    "SIP",
    "Gold",
    "Digital Gold",
    "Cryptocurrency",
    "Fixed Deposits",
    "Bonds",
    "Other assets",
  ]),
  invested_amount: z.coerce.number().min(0, "Invested amount must be non-negative"),
  current_value: z.coerce.number().min(0, "Current value must be non-negative"),
  quantity: z.coerce.number().min(0).default(1),
  purchase_date: z.string(),
  risk_category: z.enum(["low", "moderate", "high", "aggressive"]).default("moderate"),
  notes: z.string().optional().nullable(),
})

export const loanSchema = z.object({
  lender_name: z.string().min(2, "Lender name is required"),
  loan_type: z.enum([
    "Home Loan",
    "Car Loan",
    "Personal Loan",
    "Education Loan",
    "Gold Loan",
    "Credit Card EMI",
    "Business Loan",
    "Other",
  ]),
  principal_amount: z.coerce.number().positive("Principal amount must be positive"),
  outstanding_amount: z.coerce.number().min(0, "Outstanding amount must be non-negative"),
  interest_rate: z.coerce.number().min(0, "Interest rate cannot be negative"),
  monthly_emi: z.coerce.number().min(0, "Monthly EMI cannot be negative"),
  remaining_tenure: z.coerce.number().int().min(0, "Remaining tenure in months must be non-negative"),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
})

export const goalSchema = z.object({
  goal_name: z.string().min(2, "Goal name is required"),
  target_amount: z.coerce.number().positive("Target amount must be positive"),
  current_amount: z.coerce.number().min(0, "Current amount must be non-negative"),
  target_date: z.string(),
  monthly_contribution: z.coerce.number().min(0, "Monthly contribution must be non-negative"),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  status: z.enum(["in_progress", "achieved", "paused"]).default("in_progress"),
})

export const simulationInputSchema = z.object({
  scenario_name: z.string().min(2, "Scenario name is required"),
  scenario_type: z.string(),
  initial_balance: z.coerce.number().min(0),
  monthly_income: z.coerce.number().min(0),
  monthly_expenses: z.coerce.number().min(0),
  additional_expenses: z.coerce.number().default(0),
  expected_return: z.coerce.number(),
  inflation_rate: z.coerce.number(),
  simulation_duration: z.coerce.number().int().positive(),
  dependents: z.coerce.number().int().min(0).default(0),
})
