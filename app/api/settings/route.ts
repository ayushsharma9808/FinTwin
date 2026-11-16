import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api/auth-helper"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/client"

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("user_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json({
    id: `set-${user.id}`,
    user_id: user.id,
    theme: "dark",
    currency: "INR",
    notification_preferences: {
      email: true,
      push: true,
      weekly_report: true,
      unusual_spending: true,
    },
    privacy_preferences: {
      anonymize_data: false,
      two_factor: false,
      data_retention_days: 365,
    },
  })
}

export async function PUT(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()

    if (isSupabaseConfigured() && !user.isDemo) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("user_settings")
        .upsert({ ...json, user_id: user.id })
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data)
    }

    return NextResponse.json({
      user_id: user.id,
      ...json,
      updated_at: new Date().toISOString(),
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
