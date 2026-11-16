import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api/auth-helper"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { expenseSchema } from "@/lib/validations/financial"
import { mockExpenses } from "@/lib/mock/db-store"

let memoryExpenses = [...mockExpenses]

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("user_id", user.id)
      .order("transaction_date", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json(memoryExpenses.filter((e) => e.user_id === user.id))
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    const validated = expenseSchema.parse(json)

    if (isSupabaseConfigured() && !user.isDemo) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("expenses")
        .insert([{ ...validated, user_id: user.id }])
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data, { status: 201 })
    }

    const newExpense = {
      id: `exp-${Date.now()}`,
      user_id: user.id,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    memoryExpenses.unshift(newExpense as any)
    return NextResponse.json(newExpense, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.errors || err.message }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Expense ID is required" }, { status: 400 })

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { error } = await supabase
      .from("expenses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  memoryExpenses = memoryExpenses.filter((e) => !(e.id === id && e.user_id === user.id))
  return NextResponse.json({ success: true })
}
