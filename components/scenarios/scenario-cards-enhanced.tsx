"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { 
  Baby, 
  GraduationCap, 
  Heart, 
  Home, 
  Car, 
  Briefcase, 
  TrendingDown, 
  TrendingUp,
  Plane,
  Shield,
  Stethoscope,
  Building,
  Zap,
  Search
} from "lucide-react"
import { formatINR } from "@/lib/format"
import { Input } from "@/components/ui/input"
import { FinancialRiskAnalyzer } from "@/lib/utils/financial-risk-analyzer"

interface LifeEvent {
  id: string
  title: string
  description: string
  icon: React.ElementType
  impact: number // percentage impact on finances
  duration: number // months
  category: "positive" | "negative" | "neutral"
  cost?: number
  probability: number // 0-100
  timeline: string
  monthlyImpact?: number
}

const lifeEvents: LifeEvent[] = [
  {
    id: "child-birth",
    title: "New Baby",
    description: "Birth of a child with associated medical and childcare costs",
    icon: Baby,
    impact: -25,
    duration: 60,
    category: "negative",
    cost: 500000,
    probability: 85,
    timeline: "Next 2-3 years",
    monthlyImpact: -8500
  },
  {
    id: "job-promotion",
    title: "Job Promotion",
    description: "25% salary increase with new responsibilities",
    icon: TrendingUp,
    impact: 25,
    duration: 36,
    category: "positive",
    cost: 0,
    probability: 60,
    timeline: "Next 12 months",
    monthlyImpact: 31250
  },
  {
    id: "home-purchase",
    title: "Home Purchase",
    description: "Buying first home with down payment and EMI",
    icon: Home,
    impact: -40,
    duration: 240,
    category: "negative",
    cost: 2500000,
    probability: 70,
    timeline: "Next 6 months",
    monthlyImpact: -45000
  },
  {
    id: "car-purchase",
    title: "Car Purchase",
    description: "New car purchase with loan and maintenance",
    icon: Car,
    impact: -15,
    duration: 60,
    category: "negative",
    cost: 800000,
    probability: 45,
    timeline: "Next 18 months",
    monthlyImpact: -18750
  },
  {
    id: "job-loss",
    title: "Job Loss",
    description: "Temporary unemployment with reduced income",
    icon: TrendingDown,
    impact: -80,
    duration: 6,
    category: "negative",
    cost: 0,
    probability: 15,
    timeline: "Uncertain",
    monthlyImpact: -100000
  },
  {
    id: "education",
    title: "Higher Education",
    description: "MBA or professional course investment",
    icon: GraduationCap,
    impact: -30,
    duration: 24,
    category: "neutral",
    cost: 1200000,
    probability: 40,
    timeline: "Next 2 years",
    monthlyImpact: -37500
  },
  {
    id: "marriage",
    title: "Wedding",
    description: "Marriage ceremony and related expenses",
    icon: Heart,
    impact: -35,
    duration: 12,
    category: "negative",
    cost: 1500000,
    probability: 55,
    timeline: "Next 3 years",
    monthlyImpact: -43750
  },
  {
    id: "business-start",
    title: "Start Business",
    description: "Initial investment for starting own business",
    icon: Briefcase,
    impact: -50,
    duration: 18,
    category: "neutral",
    cost: 2000000,
    probability: 25,
    timeline: "Next 5 years",
    monthlyImpact: -62500
  },
  {
    id: "vacation",
    title: "International Trip",
    description: "Family vacation to Europe for 2 weeks",
    icon: Plane,
    impact: -8,
    duration: 1,
    category: "negative",
    cost: 300000,
    probability: 80,
    timeline: "Next 12 months",
    monthlyImpact: -10000
  },
  {
    id: "medical-emergency",
    title: "Medical Emergency",
    description: "Unexpected major medical expense",
    icon: Stethoscope,
    impact: -20,
    duration: 3,
    category: "negative",
    cost: 500000,
    probability: 30,
    timeline: "Uncertain",
    monthlyImpact: -25000
  },
  {
    id: "insurance-payout",
    title: "Insurance Maturity",
    description: "Life insurance policy maturity payout",
    icon: Shield,
    impact: 15,
    duration: 1,
    category: "positive",
    cost: 0,
    probability: 90,
    timeline: "Next 6 months",
    monthlyImpact: 18750
  },
  {
    id: "property-investment",
    title: "Real Estate Investment",
    description: "Investment property purchase for rental income",
    icon: Building,
    impact: -45,
    duration: 120,
    category: "neutral",
    cost: 3500000,
    probability: 35,
    timeline: "Next 2 years",
    monthlyImpact: -56250
  }
]

interface ScenarioCardsProps {
  onScenarioSelect: (scenario: LifeEvent | null) => void
}

export function ScenarioCardsEnhanced({ onScenarioSelect }: ScenarioCardsProps) {
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEvents = lifeEvents.filter(event =>
    event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleScenarioClick = (event: LifeEvent) => {
    if (selectedScenario === event.id) {
      setSelectedScenario(null)
      onScenarioSelect(null)
    } else {
      setSelectedScenario(event.id)
      onScenarioSelect(event)
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "positive": return "text-green-600 bg-green-50 dark:bg-green-950"
      case "negative": return "text-red-600 bg-red-50 dark:bg-red-950"
      default: return "text-blue-600 bg-blue-50 dark:bg-blue-950"
    }
  }

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return "text-red-600"
    if (probability >= 40) return "text-yellow-600"
    return "text-green-600"
  }

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Life Event Scenarios</h3>
          <p className="text-sm text-muted-foreground">Click to simulate impact on your finances</p>
        </div>
        {selectedScenario && (
          <span className="rounded-full bg-primary/20 px-3 py-1 text-xs font-medium text-primary">
            Scenario Active
          </span>
        )}
      </div>
      
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search scenarios..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredEvents.map((event, index) => (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => handleScenarioClick(event)}
            className={`cursor-pointer rounded-lg border p-4 transition-all duration-200 hover:shadow-md ${
              selectedScenario === event.id
                ? "border-primary bg-primary/5 shadow-md"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="mb-3 flex items-start justify-between">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${getCategoryColor(event.category)}`}>
                <event.icon className="h-5 w-5" />
              </div>
              <div className="text-right">
                <div className={`text-xs font-medium ${getProbabilityColor(event.probability)}`}>
                  {event.probability}% likely
                </div>
                <div className="text-xs text-muted-foreground">{event.timeline}</div>
              </div>
            </div>
            
            <h4 className="mb-1 font-medium text-sm">{event.title}</h4>
            <p className="mb-3 text-xs text-muted-foreground line-clamp-2">{event.description}</p>
            
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Impact:</span>
                <span className={event.impact > 0 ? "text-green-600" : "text-red-600"}>
                  {event.impact > 0 ? "+" : ""}{event.impact}%
                </span>
              </div>
              {event.cost && event.cost > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cost:</span>
                  <span className="font-medium">{formatINR(event.cost)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span>{event.duration}m</span>
              </div>
              {event.monthlyImpact && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Monthly:</span>
                  <span className={event.monthlyImpact > 0 ? "text-green-600" : "text-red-600"}>
                    {event.monthlyImpact > 0 ? "+" : ""}{formatINR(Math.abs(event.monthlyImpact))}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
      
      {filteredEvents.length === 0 && searchQuery && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No scenarios found matching "{searchQuery}"</p>
        </div>
      )}
      
      {selectedScenario && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="mt-4 space-y-4"
        >
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">Scenario Impact Analysis</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The selected scenario will affect your financial projections. 
              View the updated charts above to see the impact on your goals.
            </p>
          </div>
          
          {(() => {
            const selectedEvent = filteredEvents.find(e => e.id === selectedScenario)
            if (!selectedEvent) return null
            
            // Mock user financials - in real app, get from user context
            const userFinancials = {
              monthlyIncome: 125000,
              monthlyExpenses: 75000,
              currentSavings: 800000
            }
            
            const analysis = FinancialRiskAnalyzer.analyzeScenario(selectedEvent, userFinancials)
            
            return (
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span className="font-medium text-sm">AI Insight & Recommendation</span>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Risk Rate</p>
                    <p className={`text-sm font-semibold ${
                      analysis.riskRate === 'Critical Risk' ? 'text-red-600' :
                      analysis.riskRate === 'High Risk' ? 'text-orange-600' :
                      analysis.riskRate === 'Medium Risk' ? 'text-yellow-600' : 'text-green-600'
                    }`}>{analysis.riskRate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Stress Level</p>
                    <p className={`text-sm font-semibold ${
                      analysis.stressLevel === 'Extreme' ? 'text-red-600' :
                      analysis.stressLevel === 'High' ? 'text-orange-600' :
                      analysis.stressLevel === 'Moderate' ? 'text-yellow-600' : 'text-green-600'
                    }`}>{analysis.stressLevel}</p>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <p className="text-xs text-muted-foreground mb-1">Model Suggestion</p>
                  <p className="text-sm">{analysis.suggestion}</p>
                </div>
              </div>
            )
          })()}
        </motion.div>
      )}
    </div>
  )
}