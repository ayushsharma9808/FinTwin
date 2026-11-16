import { NextResponse } from "next/server"
import { getAuthUser } from "@/lib/api/auth-helper"
import { createClient } from "@/lib/supabase/server"
import { isSupabaseConfigured } from "@/lib/supabase/client"
import { runMonteCarloSimulation, type SimulationParams } from "@/lib/utils/server-monte-carlo"

let memorySimulations: any[] = []

export async function GET() {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  if (isSupabaseConfigured() && !user.isDemo) {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from("simulations")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  return NextResponse.json(memorySimulations.filter((s) => s.user_id === user.id))
}

export async function POST(req: Request) {
  const user = await getAuthUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const params: SimulationParams = {
      currentSavings: Number(body.currentSavings ?? 856000),
      monthlyIncome: Number(body.monthlyIncome ?? 185000),
      monthlyExpenses: Number(body.monthlyExpenses ?? 68000),
      existingInvestments: Number(body.existingInvestments ?? 1511427),
      outstandingLoans: Number(body.outstandingLoans ?? 605000),
      monthlyEmi: Number(body.monthlyEmi ?? 31250),
      inflationRate: Number(body.inflationRate ?? 6),
      expectedReturn: Number(body.expectedReturn ?? 12),
      volatility: Number(body.volatility ?? 15),
      additionalExpenses: Number(body.additionalExpenses ?? 0),
      dependents: Number(body.dependents ?? 2),
      simulationDuration: Number(body.simulationDuration ?? 10),
      scenarioType: body.scenarioType || "normal",
      simulationRuns: 10000,
    }

    // Run 10,000 Monte Carlo stochastic runs
    const simulationResult = runMonteCarloSimulation(params)

    const record = {
      user_id: user.id,
      scenario_name: simulationResult.scenarioName,
      scenario_type: simulationResult.scenarioType,
      initial_balance: params.currentSavings + params.existingInvestments,
      monthly_income: params.monthlyIncome,
      monthly_expenses: params.monthlyExpenses,
      additional_expenses: params.additionalExpenses || 0,
      expected_return: params.expectedReturn,
      inflation_rate: params.inflationRate,
      simulation_duration: params.simulationDuration,
      success_probability: simulationResult.successProbability,
      p10_value: simulationResult.p10,
      p50_value: simulationResult.p50,
      p90_value: simulationResult.p90,
      risk_score: simulationResult.stressScore,
      simulation_results: simulationResult,
    }

    if (isSupabaseConfigured() && !user.isDemo) {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from("simulations")
        .insert([record])
        .select()
        .single()

      if (error) {
        console.error("Failed to persist simulation to Supabase:", error)
        // Return computed result even if persistence errored
        return NextResponse.json({ ...record, id: `sim-${Date.now()}` })
      }
      return NextResponse.json(data)
    }

    const saved = {
      ...record,
      id: `sim-${Date.now()}`,
      created_at: new Date().toISOString(),
    }
    memorySimulations.unshift(saved)
    return NextResponse.json(saved)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
