"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { motion } from "framer-motion"
import { 
  Calculator, 
  TrendingUp, 
  PiggyBank, 
  CreditCard, 
  Target, 
  Clock, 
  Users, 
  GraduationCap, 
  Heart, 
  Gift,
  BarChart3,
  ArrowRight
} from "lucide-react"

interface CalculatorCard {
  id: string
  title: string
  description: string
  icon: React.ElementType
  category: "investment" | "loan" | "planning"
}

const calculators: CalculatorCard[] = [
  {
    id: "sip",
    title: "SIP Calculator",
    description: "Calculate returns on monthly SIP investments with compound growth",
    icon: TrendingUp,
    category: "investment"
  },
  {
    id: "lumpsum",
    title: "Lumpsum Calculator", 
    description: "Calculate future value of one-time investments over time",
    icon: PiggyBank,
    category: "investment"
  },
  {
    id: "swp",
    title: "SWP Calculator",
    description: "Plan systematic withdrawals from your investment corpus",
    icon: BarChart3,
    category: "investment"
  },
  {
    id: "emi",
    title: "EMI Calculator",
    description: "Calculate loan EMI, total interest, and payment schedule",
    icon: CreditCard,
    category: "loan"
  },
  {
    id: "goal-sip",
    title: "Goal SIP Calculator",
    description: "Calculate SIP needed to achieve your target financial goal",
    icon: Target,
    category: "planning"
  },
  {
    id: "sip-delay",
    title: "SIP Cost Delay Calculator",
    description: "See the impact of delaying your SIP investments",
    icon: Clock,
    category: "planning"
  },
  {
    id: "retirement",
    title: "Retirement Planning",
    description: "Estimate corpus needed for comfortable retirement",
    icon: Users,
    category: "planning"
  },
  {
    id: "education",
    title: "Child Education Planning",
    description: "Plan and save for your child's education expenses",
    icon: GraduationCap,
    category: "planning"
  },
  {
    id: "marriage",
    title: "Child Marriage Planning",
    description: "Estimate savings needed for marriage expenses",
    icon: Heart,
    category: "planning"
  },
  {
    id: "ssy",
    title: "Sukanya Samriddhi Yojana",
    description: "Calculate SSY returns and maturity amount",
    icon: Gift,
    category: "planning"
  },
  {
    id: "step-up-sip",
    title: "Step-Up SIP Calculator",
    description: "SIP with annual increment for better returns",
    icon: TrendingUp,
    category: "investment"
  },
  {
    id: "scenario",
    title: "What-If Scenario Calculator",
    description: "Simulate different life scenarios and their impact",
    icon: Calculator,
    category: "planning"
  }
]

const categories = {
  investment: { label: "Investment", color: "text-chart-2" },
  loan: { label: "Loan", color: "text-chart-4" },
  planning: { label: "Planning", color: "text-chart-3" }
}

export default function CalculatorsPage() {
  const router = useRouter()
  const [selectedCategory, setSelectedCategory] = useState<string>("all")

  const filteredCalculators = selectedCategory === "all" 
    ? calculators 
    : calculators.filter(calc => calc.category === selectedCategory)

  const handleCalculatorClick = (calculatorId: string) => {
    if (calculatorId === "emi") {
      router.push("/calculators/emi")
    } else if (calculatorId === "sip") {
      router.push("/calculators/sip")
    } else if (calculatorId === "lumpsum") {
      router.push("/calculators/lumpsum")
    } else if (calculatorId === "swp") {
      router.push("/calculators/swp")
    } else if (calculatorId === "goal-sip") {
      router.push("/calculators/goal-sip")
    } else if (calculatorId === "step-up-sip") {
      router.push("/calculators/step-up-sip")
    } else if (calculatorId === "sip-delay") {
      router.push("/calculators/sip-delay")
    } else if (calculatorId === "retirement") {
      router.push("/calculators/retirement")
    } else if (calculatorId === "education") {
      router.push("/calculators/child-education")
    } else if (calculatorId === "marriage") {
      router.push("/calculators/child-marriage")
    } else if (calculatorId === "scenario") {
      router.push("/calculators/what-if-scenario")
    } else {
      console.log(`Opening calculator: ${calculatorId}`)
    }
  }

  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h2 className="text-2xl font-semibold tracking-tight">Financial Calculators</h2>
        <p className="text-muted-foreground">Plan, estimate, and simulate your financial goals</p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6 flex gap-2"
      >
        <button
          onClick={() => setSelectedCategory("all")}
          className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
            selectedCategory === "all"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          All
        </button>
        {Object.entries(categories).map(([key, category]) => (
          <button
            key={key}
            onClick={() => setSelectedCategory(key)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              selectedCategory === key
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {category.label}
          </button>
        ))}
      </motion.div>

      {/* Calculator Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCalculators.map((calculator, index) => (
          <motion.div
            key={calculator.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + index * 0.05 }}
            onClick={() => handleCalculatorClick(calculator.id)}
            className="group cursor-pointer rounded-xl border border-border bg-card p-6 transition-all duration-200 hover:border-blue-500/30 hover:shadow-lg hover:shadow-blue-500/10 hover:-translate-y-1"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-blue-500/10">
                <calculator.icon className="h-6 w-6 text-muted-foreground transition-colors group-hover:text-blue-400" />
              </div>
              <span className={`rounded-full px-2 py-1 text-xs font-medium ${categories[calculator.category].color} bg-muted`}>
                {categories[calculator.category].label}
              </span>
            </div>

            <h3 className="mb-2 font-semibold text-foreground group-hover:text-blue-400 transition-colors">
              {calculator.title}
            </h3>
            
            <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
              {calculator.description}
            </p>

            <div className="border-t border-border pt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground group-hover:text-blue-400 transition-colors">
                  Open Calculator
                </span>
                <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-blue-400 transition-all group-hover:translate-x-1" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredCalculators.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <Calculator className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No calculators found</h3>
          <p className="text-muted-foreground">Try selecting a different category</p>
        </motion.div>
      )}
    </DashboardLayout>
  )
}