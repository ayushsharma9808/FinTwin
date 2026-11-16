import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api/auth-helper"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { mockInsights } from "@/lib/mock/db-store"

let memoryInsights = [...mockInsights]

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("ai_insights")
      .select("*")
      .eq("user_id", user.id)
      .order("generated_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json(memoryInsights.filter((i) => i.user_id === user.id))
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const newInsight = {
      user_id: user.id,
      insight_type: body.insight_type || "general",
      title: body.title || "Smart Financial Recommendation",
      description: body.description || "Generated from your latest portfolio snapshot.",
      recommendation: body.recommendation || "Review your monthly asset allocation.",
      risk_level: body.risk_level || "low",
      is_read: false,
    }

    if (isSupabaseConfigured() && !user.isDemo) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("ai_insights")
        .insert([newInsight])
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data, { status: 201 })
    }

    const saved = {
      ...newInsight,
      id: `ins-${Date.now()}`,
      generated_at: new Date().toISOString(),
    }
    memoryInsights.unshift(saved as any)
    return NextResponse.json(saved, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
