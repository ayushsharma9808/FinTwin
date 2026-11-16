import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api/auth-helper"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/client"

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { transactions } = await req.json()
    if (!Array.isArray(transactions) || transactions.length === 0) {
      return NextResponse.json({ error: "No transactions provided for approval" }, { status: 400 })
    }

    const expensesToAdd = []
    const incomeToAdd = []

    for (const t of transactions) {
      if (t.debit > 0) {
        expensesToAdd.push({
          user_id: user.id,
          amount: t.debit,
          category: t.category || "Other",
          merchant: t.description,
          payment_method: "Net Banking",
          transaction_date: t.transaction_date || new Date().toISOString().split("T")[0],
          description: `Imported from bank statement: ${t.description}`,
        })
      } else if (t.credit > 0) {
        incomeToAdd.push({
          user_id: user.id,
          source: t.description,
          amount: t.credit,
          category: t.category === "Salary" ? "Salary" : "Other",
          transaction_date: t.transaction_date || new Date().toISOString().split("T")[0],
          description: `Imported from bank statement: ${t.description}`,
          recurring: false,
        })
      }
    }

    if (isSupabaseConfigured() && !user.isDemo) {
      const supabase = await createClient()

      if (expensesToAdd.length > 0) {
        await supabase.from("expenses").insert(expensesToAdd)
      }
      if (incomeToAdd.length > 0) {
        await supabase.from("income_transactions").insert(incomeToAdd)
      }

      // Mark imported transactions as approved
      const ids = transactions.map((t) => t.id).filter(Boolean)
      if (ids.length > 0) {
        await supabase
          .from("imported_transactions")
          .update({ status: "approved" })
          .in("id", ids)
      }
    }

    return NextResponse.json({
      success: true,
      addedExpenses: expensesToAdd.length,
      addedIncome: incomeToAdd.length,
      message: `Successfully approved and added ${expensesToAdd.length + incomeToAdd.length} transactions to your financial ledger.`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
