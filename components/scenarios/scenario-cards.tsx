"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Briefcase, Plane, Building2, HeartPulse, PauseCircle, AlertTriangle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatINR } from "@/lib/format"

interface Scenario {
  id: string
  title: string
  description: string
  icon: React.ElementType
  impact: number // percentage impact on portfolio
  riskLevel: "low" | "medium" | "high"
  duration: string
  projectedLoss: number
}

const scenarios: Scenario[] = [
  {
    id: "quit-job",
    title: "Quit Job for 6 Months",
    description: "Take a career break to recharge and explore new opportunities",
    icon: Briefcase,
    impact: -15,
    riskLevel: "medium",
    duration: "6 months",
    projectedLoss: 450000,
  },
  {
    id: "travel-world",
    title: "Travel the World",
    description: "Quit job and travel internationally for an extended period",
    icon: Plane,
    impact: -35,
    riskLevel: "high",
    duration: "12 months",
    projectedLoss: 1200000,
  },
  {
    id: "start-business",
    title: "Start a New Business",
    description: "Launch your own venture with initial capital investment",
    icon: Building2,
    impact: -25,
    riskLevel: "high",
    duration: "24 months",
    projectedLoss: 800000,
  },
  {
    id: "medical-emergency",
    title: "Medical Emergency",
    description: "Unexpected health crisis requiring significant funds",
    icon: HeartPulse,
    impact: -20,
    riskLevel: "high",
    duration: "Immediate",
    projectedLoss: 500000,
  },
  {
    id: "investment-pause",
    title: "Pause Investments",
    description: "Stop all investment contributions for a period",
    icon: PauseCircle,
    impact: -8,
    riskLevel: "low",
    duration: "12 months",
    projectedLoss: 150000,
  },
]

interface ScenarioCardsProps {
  onScenarioSelect?: (scenario: Scenario | null) => void
  className?: string
}

export function ScenarioCards({ onScenarioSelect, className }: ScenarioCardsProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)

  const handleSelect = (scenario: Scenario) => {
    if (selectedScenario === scenario.id) {
      setSelectedScenario(null)
      onScenarioSelect?.(null)
    } else {
      setSelectedScenario(scenario.id)
      onScenarioSelect?.(scenario)
    }
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "text-chart-2 bg-chart-2/10"
      case "medium":
        return "text-chart-4 bg-chart-4/10"
      case "high":
        return "text-chart-5 bg-chart-5/10"
      default:
        return "text-muted-foreground bg-muted"
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Life Event Scenarios</h3>
        {selectedScenario && (
          <button
            onClick={() => {
              setSelectedScenario(null)
              onScenarioSelect?.(null)
            }}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Clear selection
          </button>
        )}
      </div>

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {scenarios.map((scenario) => {
          const isSelected = selectedScenario === scenario.id
          const Icon = scenario.icon

          return (
            <motion.button
              key={scenario.id}
              onClick={() => handleSelect(scenario)}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              className={cn(
                "relative rounded-xl border p-4 text-left transition-all",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border bg-card hover:border-muted-foreground/50",
              )}
            >
              {isSelected && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-2 top-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                </motion.div>
              )}

              <div className="flex items-start gap-3">
                <div className={cn("rounded-lg p-2", getRiskColor(scenario.riskLevel))}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{scenario.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-2">{scenario.description}</p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between text-xs">
                <span className={cn("rounded-full px-2 py-0.5 capitalize", getRiskColor(scenario.riskLevel))}>
                  {scenario.riskLevel} risk
                </span>
                <span className="text-chart-5 font-medium">{scenario.impact}%</span>
              </div>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedScenario && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            {(() => {
              const scenario = scenarios.find((s) => s.id === selectedScenario)!
              return (
                <div className="rounded-xl border border-border bg-muted/50 p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <AlertTriangle className="h-4 w-4 text-chart-4" />
                    Scenario Impact Analysis
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Duration</p>
                      <p className="mt-1 text-sm font-semibold">{scenario.duration}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Portfolio Impact</p>
                      <p className="mt-1 text-sm font-semibold text-chart-5">{scenario.impact}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Projected Loss</p>
                      <p className="mt-1 text-sm font-semibold text-chart-5">{formatINR(scenario.projectedLoss)}</p>
                    </div>
                  </div>
                </div>
              )
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
