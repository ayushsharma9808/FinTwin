import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api/auth-helper"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { loanSchema } from "@/lib/validations/financial"
import { mockLoans } from "@/lib/mock/db-store"

let memoryLoans = [...mockLoans]

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("loans")
      .select("*")
      .eq("user_id", user.id)
      .order("outstanding_amount", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json(memoryLoans.filter((l) => l.user_id === user.id))
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    const validated = loanSchema.parse(json)

    if (isSupabaseConfigured() && !user.isDemo) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("loans")
        .insert([{ ...validated, user_id: user.id }])
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data, { status: 201 })
    }

    const newLoan = {
      id: `loan-${Date.now()}`,
      user_id: user.id,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    memoryLoans.unshift(newLoan as any)
    return NextResponse.json(newLoan, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.errors || err.message }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Loan ID is required" }, { status: 400 })

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { error } = await supabase
      .from("loans")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  memoryLoans = memoryLoans.filter((l) => !(l.id === id && l.user_id === user.id))
  return NextResponse.json({ success: true })
}
