-- FinTwin Seed Data
-- Run this in the Supabase SQL editor after creating a test user, or replace YOUR_USER_ID with your auth user UUID.

DO $$
DECLARE
    v_user_id UUID;
    v_account_hdfc UUID;
    v_account_icici UUID;
    v_account_zerodha UUID;
    v_statement_id UUID;
    v_conv_id UUID;
BEGIN
    -- Select the first existing user, or specify an explicit UUID
    SELECT id INTO v_user_id FROM auth.users LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'No user found in auth.users. Please create a user first via signup.';
        RETURN;
    END IF;

    -- 1. Profiles
    INSERT INTO public.profiles (
        id, full_name, email, phone_number, date_of_birth, occupation,
        monthly_income, monthly_expenses, financial_goal, risk_tolerance,
        dependents, currency
    ) VALUES (
        v_user_id, 'Ayush Sharma', 'ayush@fintwin.com', '+91 98765 43210',
        '1996-05-14', 'Senior Software Engineer', 185000.00, 68000.00,
        'Financial Independence by 40 & Home Purchase', 'moderate', 2, 'INR'
    ) ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        monthly_income = EXCLUDED.monthly_income,
        monthly_expenses = EXCLUDED.monthly_expenses;

    -- 2. User Settings
    INSERT INTO public.user_settings (user_id, theme, currency)
    VALUES (v_user_id, 'dark', 'INR')
    ON CONFLICT (user_id) DO NOTHING;

    -- 3. Financial Accounts
    INSERT INTO public.financial_accounts (id, user_id, account_name, account_type, institution_name, current_balance, currency, account_number_masked)
    VALUES 
        (gen_random_uuid(), v_user_id, 'HDFC Salary Account', 'savings', 'HDFC Bank', 425000.00, 'INR', '•••• 4829')
    RETURNING id INTO v_account_hdfc;

    INSERT INTO public.financial_accounts (id, user_id, account_name, account_type, institution_name, current_balance, currency, account_number_masked)
    VALUES 
        (gen_random_uuid(), v_user_id, 'ICICI Emergency Savings', 'savings', 'ICICI Bank', 431000.00, 'INR', '•••• 9104')
    RETURNING id INTO v_account_icici;

    INSERT INTO public.financial_accounts (id, user_id, account_name, account_type, institution_name, current_balance, currency, account_number_masked)
    VALUES 
        (gen_random_uuid(), v_user_id, 'Zerodha Demat Trading', 'demat', 'Zerodha Broking', 1250000.00, 'INR', '•••• 7721')
    RETURNING id INTO v_account_zerodha;

    INSERT INTO public.financial_accounts (user_id, account_name, account_type, institution_name, current_balance, currency, account_number_masked)
    VALUES 
        (v_user_id, 'Vault Digital Gold', 'gold', 'MMTC-PAMP', 185000.00, 'INR', 'GLD-88219'),
        (v_user_id, 'CoinDCX Hardware Wallet', 'crypto', 'CoinDCX / Ledger', 76427.00, 'INR', '0x9B...3E41');

    -- 4. Income Transactions
    INSERT INTO public.income_transactions (user_id, source, amount, category, transaction_date, description, recurring)
    VALUES 
        (v_user_id, 'Tech Corp Salary', 175000.00, 'Salary', CURRENT_DATE - INTERVAL '12 days', 'Monthly tech salary credit', true),
        (v_user_id, 'Contract Consulting', 25000.00, 'Freelance', CURRENT_DATE - INTERVAL '5 days', 'Architecture advisory sprint', false),
        (v_user_id, 'Nifty 50 Dividend', 4200.00, 'Dividends', CURRENT_DATE - INTERVAL '18 days', 'Quarterly index dividend payout', false),
        (v_user_id, 'FD Quarterly Interest', 5800.00, 'Interest', CURRENT_DATE - INTERVAL '25 days', 'Fixed deposit interest accrual', true);

    -- 5. Expenses
    INSERT INTO public.expenses (user_id, amount, category, merchant, payment_method, transaction_date, description)
    VALUES 
        (v_user_id, 32000.00, 'Rent', 'Prestige Estates', 'Net Banking', CURRENT_DATE - INTERVAL '14 days', 'Apartment monthly rent'),
        (v_user_id, 8450.00, 'Food', 'Nature Basket & Swiggy', 'UPI', CURRENT_DATE - INTERVAL '2 days', 'Groceries and weekly dinners'),
        (v_user_id, 4500.00, 'Transportation', 'Uber & Fuel Shell', 'Credit Card', CURRENT_DATE - INTERVAL '4 days', 'Commute and highway fuel'),
        (v_user_id, 3500.00, 'Utilities', 'Tata Power & ACT Fiber', 'UPI', CURRENT_DATE - INTERVAL '8 days', 'Electricity bill and high-speed broadband'),
        (v_user_id, 6200.00, 'Shopping', 'Amazon & Zara', 'Credit Card', CURRENT_DATE - INTERVAL '6 days', 'Books and seasonal apparel'),
        (v_user_id, 4800.00, 'Entertainment', 'BookMyShow & Spotify', 'UPI', CURRENT_DATE - INTERVAL '3 days', 'Concert tickets and audio subscription'),
        (v_user_id, 8550.00, 'Healthcare', 'Apollo Pharmacy & Dental Care', 'Debit Card', CURRENT_DATE - INTERVAL '10 days', 'Routine checkup and preventive vitamins');

    -- 6. Investments
    INSERT INTO public.investments (user_id, asset_name, asset_type, invested_amount, current_value, quantity, purchase_date, risk_category, notes)
    VALUES 
        (v_user_id, 'Parag Parikh Flexi Cap Fund', 'Mutual Funds', 350000.00, 420000.00, 6420.50, '2023-01-10', 'moderate', 'Core equity mutual fund SIP'),
        (v_user_id, 'Mirae Asset Large Cap Fund', 'Mutual Funds', 250000.00, 290000.00, 2810.15, '2023-03-15', 'moderate', 'Large cap blue chip exposure'),
        (v_user_id, 'Nifty 50 Index ETF', 'Stocks', 300000.00, 355000.00, 1500.00, '2022-08-01', 'low', 'Broad market low-cost tracker'),
        (v_user_id, 'Tata Motors Ltd Equity', 'Stocks', 100000.00, 185000.00, 200.00, '2022-11-20', 'high', 'EV manufacturing growth play'),
        (v_user_id, 'Sovereign Gold Bonds (SGB)', 'Gold', 150000.00, 185000.00, 28.00, '2022-06-15', 'low', 'RBI issued sovereign gold tranche'),
        (v_user_id, 'Bitcoin (BTC)', 'Cryptocurrency', 50000.00, 76427.00, 0.0125, '2023-04-10', 'aggressive', 'Decentralized digital store of value');

    -- 7. Loans and Liabilities
    INSERT INTO public.loans (user_id, lender_name, loan_type, principal_amount, outstanding_amount, interest_rate, monthly_emi, remaining_tenure, start_date, end_date)
    VALUES 
        (v_user_id, 'HDFC Bank', 'Car Loan', 950000.00, 485000.00, 8.65, 19450.00, 28, '2023-04-01', '2028-03-31'),
        (v_user_id, 'ICICI Bank', 'Education Loan', 600000.00, 120000.00, 9.20, 11800.00, 11, '2021-08-01', '2026-07-31');

    -- 8. Financial Goals
    INSERT INTO public.financial_goals (user_id, goal_name, target_amount, current_amount, target_date, monthly_contribution, priority, status)
    VALUES 
        (v_user_id, 'Emergency Reserve Fund (6 Months)', 450000.00, 431000.00, CURRENT_DATE + INTERVAL '2 months', 15000.00, 'high', 'in_progress'),
        (v_user_id, 'Dream Home Down Payment', 2500000.00, 1120000.00, CURRENT_DATE + INTERVAL '30 months', 35000.00, 'high', 'in_progress'),
        (v_user_id, 'European Summer Vacation', 350000.00, 210000.00, CURRENT_DATE + INTERVAL '8 months', 15000.00, 'medium', 'in_progress'),
        (v_user_id, 'Retirement Corpus Milestone', 10000000.00, 2367427.00, CURRENT_DATE + INTERVAL '180 months', 40000.00, 'high', 'in_progress');

    -- 9. AI Insights
    INSERT INTO public.ai_insights (user_id, insight_type, title, description, recommendation, risk_level, is_read)
    VALUES 
        (v_user_id, 'emergency_fund', 'Emergency Fund 96% Funded', 'Your liquid reserves currently stand at ₹4.31 Lakh, covering ~6.3 months of necessary expenses.', 'Maintain the remaining ₹19,000 target then reallocate the ₹15,000 monthly SIP toward higher-yield equity funds.', 'low', false),
        (v_user_id, 'debt', 'Education Loan Nearing Payoff', 'Only 11 EMIs remaining on your ICICI education loan at 9.2% interest.', 'Consider a prepayment of ₹1.2L from this month bonus to eliminate ₹11,800/mo EMI overhead immediately.', 'medium', false),
        (v_user_id, 'investment', 'Asset Allocation Optimization', 'Current equity-to-debt ratio is 68:32, which matches your moderate-aggressive risk tolerance.', 'Continue systematic monthly SIPs into large & flexi cap funds to maintain dollar-cost averaging.', 'low', false);

    -- 10. Notifications
    INSERT INTO public.notifications (user_id, title, message, notification_type, is_read)
    VALUES 
        (v_user_id, 'Monthly Surplus Detected', 'You saved ₹35,650 more than projected this month. Would you like to allocate it to your Home Down Payment goal?', 'success', false),
        (v_user_id, 'Upcoming Car Loan EMI', '₹19,450 will be auto-debited from HDFC Bank on the 5th.', 'info', false),
        (v_user_id, 'Quarterly Portfolio Rebalance', 'Digital Twin detected a 4.2% drift in your gold allocation due to recent rally.', 'alert', false);

    -- 11. AI Conversations
    INSERT INTO public.ai_conversations (id, user_id, conversation_title)
    VALUES (gen_random_uuid(), v_user_id, 'Retirement & Emergency Strategy')
    RETURNING id INTO v_conv_id;

    INSERT INTO public.ai_messages (conversation_id, user_id, role, message)
    VALUES 
        (v_conv_id, v_user_id, 'user', 'What happens if I face a job loss for 6 months? Will my emergency fund hold up?'),
        (v_conv_id, v_user_id, 'assistant', 'Based on your actual records, your essential monthly expenses (rent, utilities, groceries, and debt EMIs) total approximately ₹64,700/mo. Your current liquid savings across HDFC and ICICI accounts stand at ₹8,56,000.\n\nHere is your 6-Month Emergency Runway Analysis:\n1. Total 6-Month Essential Cost: ₹3,88,200\n2. Current Liquid Cash: ₹8,56,000\n3. Surplus Remaining After 6 Months: ₹4,67,800\n\nVerdict: You have a healthy 13.2 months of survival runway without touching your mutual funds, gold, or crypto assets. You are in a strong financial position.');

    RAISE NOTICE 'Seed data inserted successfully for user %', v_user_id;
END $$;
