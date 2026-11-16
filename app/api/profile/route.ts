import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api/auth-helper"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { profileSchema } from "@/lib/validations/financial"

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({
    id: user.id,
    full_name: "Ayush Sharma",
    email: user.email,
    phone_number: "+91 98765 43210",
    date_of_birth: "1996-05-14",
    occupation: "Senior Software Engineer",
    monthly_income: 185000,
    monthly_expenses: 68000,
    financial_goal: "Financial Independence by 40 & Home Purchase",
    risk_tolerance: "moderate",
    dependents: 2,
    currency: "INR",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  })
}

export async function PUT(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    const validated = profileSchema.partial().parse(json)

    if (isSupabaseConfigured() && !user.isDemo) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("profiles")
        .update(validated)
        .eq("id", user.id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    return NextResponse.json({
      id: user.id,
      ...validated,
      updated_at: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.errors || err.message }, { status: 400 })
  }
}
