-- FinTwin Production Database Schema
-- Comprehensive PostgreSQL Schema for Supabase

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone_number TEXT,
    date_of_birth DATE,
    occupation TEXT,
    monthly_income NUMERIC(15,2) DEFAULT 0.00,
    monthly_expenses NUMERIC(15,2) DEFAULT 0.00,
    financial_goal TEXT,
    risk_tolerance TEXT DEFAULT 'moderate' CHECK (risk_tolerance IN ('conservative', 'moderate', 'aggressive', 'very_aggressive')),
    dependents INTEGER DEFAULT 0 CHECK (dependents >= 0),
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 3. FINANCIAL ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.financial_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    account_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('savings', 'current', 'fixed_deposit', 'recurring_deposit', 'cash', 'demat', 'crypto', 'gold', 'other')),
    institution_name TEXT NOT NULL,
    current_balance NUMERIC(15,2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'INR',
    account_number_masked TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_financial_accounts_updated_at
    BEFORE UPDATE ON public.financial_accounts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. INCOME TRANSACTIONS TABLE
CREATE TABLE IF NOT EXISTS public.income_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('Salary', 'Freelance', 'Business', 'Investments', 'Rental', 'Dividends', 'Interest', 'Other')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    recurring BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EXPENSES TABLE
CREATE TABLE IF NOT EXISTS public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(15,2) NOT NULL CHECK (amount > 0),
    category TEXT NOT NULL CHECK (category IN ('Food', 'Shopping', 'Rent', 'Transportation', 'Education', 'Healthcare', 'Entertainment', 'Utilities', 'Travel', 'Investments', 'Other')),
    merchant TEXT,
    payment_method TEXT CHECK (payment_method IN ('UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Cash', 'Other')),
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_expenses_updated_at
    BEFORE UPDATE ON public.expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. INVESTMENTS TABLE
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    asset_name TEXT NOT NULL,
    asset_type TEXT NOT NULL CHECK (asset_type IN ('Stocks', 'Mutual Funds', 'SIP', 'Gold', 'Digital Gold', 'Cryptocurrency', 'Fixed Deposits', 'Bonds', 'Other assets')),
    invested_amount NUMERIC(15,2) NOT NULL CHECK (invested_amount >= 0),
    current_value NUMERIC(15,2) NOT NULL CHECK (current_value >= 0),
    quantity NUMERIC(15,4) DEFAULT 1.0000,
    purchase_date DATE DEFAULT CURRENT_DATE,
    risk_category TEXT DEFAULT 'moderate' CHECK (risk_category IN ('low', 'moderate', 'high', 'aggressive')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON public.investments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. LOANS AND LIABILITIES TABLE
CREATE TABLE IF NOT EXISTS public.loans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    lender_name TEXT NOT NULL,
    loan_type TEXT NOT NULL CHECK (loan_type IN ('Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Gold Loan', 'Credit Card EMI', 'Business Loan', 'Other')),
    principal_amount NUMERIC(15,2) NOT NULL CHECK (principal_amount > 0),
    outstanding_amount NUMERIC(15,2) NOT NULL CHECK (outstanding_amount >= 0),
    interest_rate NUMERIC(5,2) NOT NULL CHECK (interest_rate >= 0),
    monthly_emi NUMERIC(15,2) NOT NULL CHECK (monthly_emi >= 0),
    remaining_tenure INTEGER NOT NULL CHECK (remaining_tenure >= 0), -- in months
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_loans_updated_at
    BEFORE UPDATE ON public.loans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. FINANCIAL GOALS TABLE
CREATE TABLE IF NOT EXISTS public.financial_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    goal_name TEXT NOT NULL,
    target_amount NUMERIC(15,2) NOT NULL CHECK (target_amount > 0),
    current_amount NUMERIC(15,2) NOT NULL DEFAULT 0.00 CHECK (current_amount >= 0),
    target_date DATE NOT NULL,
    monthly_contribution NUMERIC(15,2) DEFAULT 0.00 CHECK (monthly_contribution >= 0),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'achieved', 'paused')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_financial_goals_updated_at
    BEFORE UPDATE ON public.financial_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. SIMULATIONS TABLE
CREATE TABLE IF NOT EXISTS public.simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    scenario_name TEXT NOT NULL,
    scenario_type TEXT NOT NULL,
    initial_balance NUMERIC(15,2) NOT NULL,
    monthly_income NUMERIC(15,2) NOT NULL,
    monthly_expenses NUMERIC(15,2) NOT NULL,
    additional_expenses NUMERIC(15,2) DEFAULT 0.00,
    expected_return NUMERIC(5,2) NOT NULL,
    inflation_rate NUMERIC(5,2) NOT NULL,
    simulation_duration INTEGER NOT NULL, -- in years
    success_probability NUMERIC(5,2) NOT NULL, -- percentage 0-100
    p10_value NUMERIC(15,2) NOT NULL,
    p50_value NUMERIC(15,2) NOT NULL,
    p90_value NUMERIC(15,2) NOT NULL,
    risk_score NUMERIC(5,2) NOT NULL,
    simulation_results JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. AI INSIGHTS TABLE
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_type TEXT NOT NULL CHECK (insight_type IN ('cash_flow', 'savings', 'investment', 'risk', 'debt', 'emergency_fund', 'general')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    risk_level TEXT DEFAULT 'medium' CHECK (risk_level IN ('low', 'medium', 'high')),
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    is_read BOOLEAN DEFAULT false
);

-- 11. AI CONVERSATIONS & MESSAGES
CREATE TABLE IF NOT EXISTS public.ai_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_title TEXT NOT NULL DEFAULT 'Financial Advisory Chat',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_ai_conversations_updated_at
    BEFORE UPDATE ON public.ai_conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.ai_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.ai_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. BANK STATEMENTS & IMPORTED TRANSACTIONS
CREATE TABLE IF NOT EXISTS public.bank_statements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'csv')),
    processing_status TEXT DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processed', 'failed', 'approved')),
    total_transactions INTEGER DEFAULT 0,
    imported_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.imported_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    statement_id UUID NOT NULL REFERENCES public.bank_statements(id) ON DELETE CASCADE,
    transaction_date DATE NOT NULL,
    description TEXT NOT NULL,
    debit NUMERIC(15,2) DEFAULT 0.00,
    credit NUMERIC(15,2) DEFAULT 0.00,
    balance NUMERIC(15,2) DEFAULT 0.00,
    category TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    notification_type TEXT DEFAULT 'info' CHECK (notification_type IN ('alert', 'info', 'warning', 'success')),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. APPLICATION SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    theme TEXT DEFAULT 'dark' CHECK (theme IN ('light', 'dark', 'system')),
    currency TEXT DEFAULT 'INR',
    notification_preferences JSONB NOT NULL DEFAULT '{"email": true, "push": true, "weekly_report": true, "unusual_spending": true}'::jsonb,
    privacy_preferences JSONB NOT NULL DEFAULT '{"anonymize_data": false, "two_factor": false, "data_retention_days": 365}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on auth.users registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (
        id,
        full_name,
        email,
        monthly_income,
        monthly_expenses,
        risk_tolerance,
        currency
    ) VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        NEW.email,
        125000.00,
        75000.00,
        'moderate',
        'INR'
    )
    ON CONFLICT (id) DO NOTHING;

    INSERT INTO public.user_settings (
        user_id,
        theme,
        currency
    ) VALUES (
        NEW.id,
        'dark',
        'INR'
    )
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.notifications (
        user_id,
        title,
        message,
        notification_type
    ) VALUES (
        NEW.id,
        'Welcome to FinTwin',
        'Your AI Financial Digital Twin platform is initialized and ready.',
        'success'
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Financial Accounts RLS
ALTER TABLE public.financial_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own financial accounts"
    ON public.financial_accounts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own financial accounts"
    ON public.financial_accounts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own financial accounts"
    ON public.financial_accounts FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own financial accounts"
    ON public.financial_accounts FOR DELETE
    USING (auth.uid() = user_id);

-- Income Transactions RLS
ALTER TABLE public.income_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own income"
    ON public.income_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own income"
    ON public.income_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own income"
    ON public.income_transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own income"
    ON public.income_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Expenses RLS
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
    ON public.expenses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
    ON public.expenses FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
    ON public.expenses FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
    ON public.expenses FOR DELETE
    USING (auth.uid() = user_id);

-- Investments RLS
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own investments"
    ON public.investments FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own investments"
    ON public.investments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own investments"
    ON public.investments FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own investments"
    ON public.investments FOR DELETE
    USING (auth.uid() = user_id);

-- Loans RLS
ALTER TABLE public.loans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own loans"
    ON public.loans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own loans"
    ON public.loans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own loans"
    ON public.loans FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own loans"
    ON public.loans FOR DELETE
    USING (auth.uid() = user_id);

-- Financial Goals RLS
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals"
    ON public.financial_goals FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
    ON public.financial_goals FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
    ON public.financial_goals FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
    ON public.financial_goals FOR DELETE
    USING (auth.uid() = user_id);

-- Simulations RLS
ALTER TABLE public.simulations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own simulations"
    ON public.simulations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own simulations"
    ON public.simulations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own simulations"
    ON public.simulations FOR DELETE
    USING (auth.uid() = user_id);

-- AI Insights RLS
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own insights"
    ON public.ai_insights FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own insights"
    ON public.ai_insights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
    ON public.ai_insights FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own insights"
    ON public.ai_insights FOR DELETE
    USING (auth.uid() = user_id);

-- AI Conversations RLS
ALTER TABLE public.ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations"
    ON public.ai_conversations FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations"
    ON public.ai_conversations FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations"
    ON public.ai_conversations FOR DELETE
    USING (auth.uid() = user_id);

-- AI Messages RLS
ALTER TABLE public.ai_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversation messages"
    ON public.ai_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversation messages"
    ON public.ai_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Bank Statements RLS
ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bank statements"
    ON public.bank_statements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bank statements"
    ON public.bank_statements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own bank statements"
    ON public.bank_statements FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bank statements"
    ON public.bank_statements FOR DELETE
    USING (auth.uid() = user_id);

-- Imported Transactions RLS
ALTER TABLE public.imported_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own imported transactions"
    ON public.imported_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own imported transactions"
    ON public.imported_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own imported transactions"
    ON public.imported_transactions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own imported transactions"
    ON public.imported_transactions FOR DELETE
    USING (auth.uid() = user_id);

-- Notifications RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- User Settings RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own settings"
    ON public.user_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
    ON public.user_settings FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
    ON public.user_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================================
-- PERFORMANCE INDEXES
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.financial_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_income_user_date ON public.income_transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_income_category ON public.income_transactions(category);
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON public.expenses(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON public.expenses(category);
CREATE INDEX IF NOT EXISTS idx_investments_user ON public.investments(user_id, asset_type);
CREATE INDEX IF NOT EXISTS idx_loans_user ON public.loans(user_id);
CREATE INDEX IF NOT EXISTS idx_goals_user_date ON public.financial_goals(user_id, target_date);
CREATE INDEX IF NOT EXISTS idx_simulations_user_created ON public.simulations(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_read ON public.ai_insights(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_ai_messages_conv ON public.ai_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_bank_statements_user ON public.bank_statements(user_id);
CREATE INDEX IF NOT EXISTS idx_imported_trans_stmt ON public.imported_transactions(statement_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON public.notifications(user_id, is_read);
