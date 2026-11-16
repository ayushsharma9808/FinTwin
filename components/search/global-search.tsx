"use client"

import type React from "react"

import { useState, useCallback, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Search, Sparkles, TrendingUp, ArrowRight, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchSuggestion {
  id: string
  text: string
  type: "scenario" | "insight" | "simulation"
  confidence?: number
}

const mockSuggestions: SearchSuggestion[] = [
  { id: "1", text: "Quit job for 6 months", type: "scenario", confidence: 92 },
  { id: "2", text: "Quit job and start business", type: "scenario", confidence: 78 },
  { id: "3", text: "Job loss impact on savings", type: "simulation", confidence: 85 },
  { id: "4", text: "Career break financial analysis", type: "insight", confidence: 88 },
  { id: "5", text: "Sabbatical fund planning", type: "scenario", confidence: 75 },
]

interface GlobalSearchProps {
  className?: string
  onSearch?: (query: string) => void
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
}

export function GlobalSearch({ className, onSearch, onSuggestionSelect }: GlobalSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)

  // Filter suggestions based on query
  useEffect(() => {
    if (query.length > 1) {
      const filtered = mockSuggestions.filter((s) => s.text.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
      setSuggestions(filtered)
      setIsOpen(filtered.length > 0)
    } else {
      setSuggestions([])
      setIsOpen(false)
    }
    setSelectedIndex(-1)
  }, [query])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen) return

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : prev))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
          break
        case "Enter":
          e.preventDefault()
          if (selectedIndex >= 0) {
            onSuggestionSelect?.(suggestions[selectedIndex])
            setIsOpen(false)
            setQuery(suggestions[selectedIndex].text)
          } else {
            onSearch?.(query)
          }
          break
        case "Escape":
          setIsOpen(false)
          break
      }
    },
    [isOpen, suggestions, selectedIndex, onSuggestionSelect, onSearch, query],
  )

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "scenario":
        return <Sparkles className="h-3.5 w-3.5" />
      case "simulation":
        return <TrendingUp className="h-3.5 w-3.5" />
      default:
        return <ArrowRight className="h-3.5 w-3.5" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "scenario":
        return "text-chart-3 bg-chart-3/10"
      case "simulation":
        return "text-chart-2 bg-chart-2/10"
      default:
        return "text-chart-4 bg-chart-4/10"
    }
  }

  return (
    <div className={cn("relative w-full max-w-md", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder="Search scenarios, insights, simulations..."
          className="h-10 w-full rounded-lg border border-border bg-background pl-10 pr-10 text-sm placeholder:text-muted-foreground focus:border-muted-foreground focus:outline-none focus:ring-1 focus:ring-muted-foreground/20"
        />
        {query && (
          <button
            onClick={() => {
              setQuery("")
              inputRef.current?.focus()
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-card shadow-lg"
          >
            <div className="p-1">
              {suggestions.map((suggestion, index) => (
                <motion.button
                  key={suggestion.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => {
                    if (onSuggestionSelect) {
                      onSuggestionSelect(suggestion)
                    } else {
                      router.push("/simulator")
                    }
                    setQuery(suggestion.text)
                    setIsOpen(false)
                  }}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                    index === selectedIndex ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                  )}
                >
                  <span className={cn("rounded-md p-1.5", getTypeColor(suggestion.type))}>
                    {getTypeIcon(suggestion.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate">{suggestion.text}</p>
                    <p className="text-xs text-muted-foreground capitalize">{suggestion.type}</p>
                  </div>
                  {suggestion.confidence && (
                    <span className="text-xs text-muted-foreground">{suggestion.confidence}% match</span>
                  )}
                </motion.button>
              ))}
            </div>
            <div className="border-t border-border px-3 py-2">
              <p className="text-xs text-muted-foreground">Monte Carlo suggestions from 10,000 simulations</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
