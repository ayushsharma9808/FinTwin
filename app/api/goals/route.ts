import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api/auth-helper"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { goalSchema } from "@/lib/validations/financial"
import { mockGoals } from "@/lib/mock/db-store"

let memoryGoals = [...mockGoals]

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("financial_goals")
      .select("*")
      .eq("user_id", user.id)
      .order("target_date", { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json(memoryGoals.filter((g) => g.user_id === user.id))
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    const validated = goalSchema.parse(json)

    if (isSupabaseConfigured() && !user.isDemo) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("financial_goals")
        .insert([{ ...validated, user_id: user.id }])
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(data, { status: 201 })
    }

    const newGoal = {
      id: `goal-${Date.now()}`,
      user_id: user.id,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    memoryGoals.unshift(newGoal as any)
    return NextResponse.json(newGoal, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.errors || err.message }, { status: 400 })
  }
}

export async function PUT(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const json = await req.json()
    const { id, ...data } = json
    if (!id) return NextResponse.json({ error: "Goal ID is required" }, { status: 400 })
    const validated = goalSchema.partial().parse(data)

    if (isSupabaseConfigured() && !user.isDemo) {
      const supabase = await createClient()
      const { data: updated, error } = await supabase
        .from("financial_goals")
        .update(validated)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(updated)
    }

    const index = memoryGoals.findIndex((g) => g.id === id && g.user_id === user.id)
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })
    memoryGoals[index] = { ...memoryGoals[index], ...validated, updated_at: new Date().toISOString() } as any
    return NextResponse.json(memoryGoals[index])
  } catch (err: any) {
    return NextResponse.json({ error: err.errors || err.message }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Goal ID is required" }, { status: 400 })

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { error } = await supabase
      .from("financial_goals")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  memoryGoals = memoryGoals.filter((g) => !(g.id === id && g.user_id === user.id))
  return NextResponse.json({ success: true })
}
