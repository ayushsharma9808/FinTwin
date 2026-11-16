# FinTwin — Enterprise Financial Digital Twin Platform

FinTwin is a full-stack AI-powered Financial Digital Twin platform that builds a stochastic neural and mathematical clone of a user's financial life. It bridges real banking accounts, liabilities, and assets with a 10,000-run Monte Carlo simulation engine and a server-side AI Financial Advisory Twin.

---

## 🚀 Key Platform Capabilities

1. **AI Financial Digital Twin**
   - 3D stochastic sphere visualizing the user's financial health in real-time.
   - Dynamic mood avatar reflecting risk stress and emergency runway.
   - Behavioral finance indicators (spending pattern, savings rate, risk tolerance).

2. **What-If Stochastic Simulator**
   - 10,000 Monte Carlo iterations calculated on the server per scenario using Geometric Brownian Motion (GBM) and Box-Muller normal transforms.
   - Produces worst-case (P10), median (P50), optimistic (P90) percentiles, and goal success probabilities.
   - Supports 10 distinct life scenarios:
     1. Normal financial trajectory
     2. Job loss for 3 months
     3. Job loss for 6 months
     4. Medical emergency shock (₹5 Lakh)
     5. Sudden large expense shock (₹3.5 Lakh)
     6. Salary increase (+25%)
     7. Salary decrease (-20%)
     8. Aggressive loan repayment
     9. Severe market crash
     10. Early retirement in 3 years

3. **Complete Financial Ledger & Expense Tracker**
   - Detailed categorized expense tracker (Food, Shopping, Rent, Transportation, Utilities, Healthcare, etc.).
   - Income transactions management (Salary, Freelance, Dividends, Rental, Interest).
   - In-memory optimistic updates synced with real PostgreSQL tables.

4. **Bank Statement Import & Transaction Extraction**
   - Upload PDF or CSV bank statements from any bank (HDFC, ICICI, SBI, Axis, etc.).
   - Automated transaction extraction, debit/credit classification, and category detection.
   - Secure interactive review table enabling the user to approve records before writing to their financial ledger.

5. **Financial Goals & Wealth Management**
   - Life goal tracker with progress bars, target dates, and monthly SIP requirements.
   - Investment holdings ledger with profit/loss metrics (Stocks, Mutual Funds, SIP, Gold, Crypto).
   - Loan & liability manager with monthly EMI calculation, interest rate tracking, and tenure countdown.

6. **Server-Side AI Financial Assistant (Grok / LLM Integration)**
   - Secure context injection containing the user's real financial metrics (net worth, monthly cash flow, emergency runway, active loans, goal progress).
   - Interactive slide-over chat drawer with suggested inquiries ("Can I afford a ₹5 lakh car?", "What happens if I quit my job for 6 months?").
   - Strict educational compliance distinguishing mathematical calculations from advice.

---

## 🛠 Technology Stack

- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, Recharts, Three.js / React Three Fiber.
- **Backend**: Next.js API Route Handlers, Zod Data Validation, Supabase PostgreSQL, Supabase Auth, Supabase Storage.
- **AI**: Grok API / OpenAI compatible LLM API endpoint with server-side context protection.
- **Database Security**: PostgreSQL Row-Level Security (RLS) on all user tables with `auth.uid() = user_id`.

---

## 🗄 Database Architecture & Supabase Schema

The complete relational database schema is located at:
`supabase/migrations/20240101000000_init_fintwin.sql`

Sample seed data is located at:
`supabase/seed.sql`

### Tables:
- `profiles`: User demographic and baseline financial metrics.
- `financial_accounts`: Masked bank accounts, Demat, gold, and crypto assets.
- `income_transactions`: Inflow records and recurring revenue sources.
- `expenses`: Detailed categorized outflow transactions.
- `investments`: Portfolio asset holdings, invested vs current value, and risk tags.
- `loans`: Debt liabilities, interest rates, monthly EMIs, and remaining tenures.
- `financial_goals`: Target amounts, current savings, target dates, and priorities.
- `simulations`: Historical Monte Carlo simulation runs, P10/P50/P90 outcomes, and JSONB probability curves.
- `ai_insights`: Automated financial recommendations, risk warnings, and optimizations.
- `ai_conversations` & `ai_messages`: Chat logs between the user and the AI assistant.
- `bank_statements` & `imported_transactions`: Uploaded files and extracted transactions pending approval.
- `notifications`: Alerts, loan reminders, and monthly surplus notices.
- `user_settings`: Theme preferences, currency, and notification preferences.

---

## ⚙️ Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and add your Supabase and Grok keys:
```bash
cp .env.example .env.local
```

Fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret

GROK_API_KEY=your-grok-api-key
GROK_API_BASE_URL=https://api.x.ai/v1
AI_MODEL_NAME=grok-beta
```

*(Note: The platform includes a zero-config Instant Demo mode that runs out of the box even before configuring Supabase credentials).*

### 3. Apply Supabase Database Migrations
1. Open your [Supabase Dashboard](https://app.supabase.com).
2. Navigate to **SQL Editor**.
3. Copy the contents of `supabase/migrations/20240101000000_init_fintwin.sql` and click **Run**.
4. (Optional) Run `supabase/seed.sql` to populate sample accounts, investments, and goals.

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production
```bash
npm run build
```

---

## 🔒 Security Best Practices
- **Row-Level Security (RLS)** is enabled on every user-owned table.
- **Zero Credential Storage**: FinTwin never asks for or stores internet banking passwords, UPI PINs, or CVVs. All accounts are masked (`•••• 4829`).
- **Server-Side AI API Keys**: All LLM calls and context injection occur inside Next.js Route Handlers (`/api/ai/chat`); API keys are never leaked to client bundles.
