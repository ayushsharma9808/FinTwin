import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api/auth-helper"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { accountSchema } from "@/lib/validations/financial"
import { mockAccounts } from "@/lib/mock/db-store"

let memoryAccounts = [...mockAccounts]

export async function GET() {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("financial_accounts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json(data)
  }

  return NextResponse.json(memoryAccounts.filter((a) => a.user_id === user.id))
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await req.json()
    const validated = accountSchema.parse(json)

    if (isSupabaseConfigured() && !user.isDemo) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("financial_accounts")
        .insert([{ ...validated, user_id: user.id }])
        .select()
        .single()

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }
      return NextResponse.json(data, { status: 201 })
    }

    const newAccount = {
      id: `acc-${Date.now()}`,
      user_id: user.id,
      ...validated,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    memoryAccounts.unshift(newAccount as any)
    return NextResponse.json(newAccount, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.errors || err.message }, { status: 400 })
  }
}

export async function PUT(req: Request) {
  const user = await getAuthUser()
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const json = await req.json()
    const { id, ...data } = json
    if (!id) return NextResponse.json({ error: "Account ID is required" }, { status: 400 })
    const validated = accountSchema.partial().parse(data)

    if (isSupabaseConfigured() && !user.isDemo) {
      const supabase = await createClient()
      const { data: updated, error } = await supabase
        .from("financial_accounts")
        .update(validated)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single()

      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json(updated)
    }

    const index = memoryAccounts.findIndex((a) => a.id === id && a.user_id === user.id)
    if (index === -1) return NextResponse.json({ error: "Not found" }, { status: 404 })
    memoryAccounts[index] = { ...memoryAccounts[index], ...validated, updated_at: new Date().toISOString() } as any
    return NextResponse.json(memoryAccounts[index])
  } catch (err: any) {
    return NextResponse.json({ error: err.errors || err.message }, { status: 400 })
  }
}

export async function DELETE(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get("id")
  if (!id) return NextResponse.json({ error: "Account ID is required" }, { status: 400 })

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { error } = await supabase
      .from("financial_accounts")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
  }

  memoryAccounts = memoryAccounts.filter((a) => !(a.id === id && a.user_id === user.id))
  return NextResponse.json({ success: true })
}
