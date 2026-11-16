"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  MessageSquare,
  Sparkles,
  Send,
  X,
  Loader2,
  Brain,
  ShieldAlert,
  Car,
  TrendingDown,
  DollarSign,
  Briefcase,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedPrompts = [
  { icon: DollarSign, text: "How much did I spend this month?" },
  { icon: Car, text: "Can I afford a ₹5 lakh car?" },
  { icon: Briefcase, text: "What happens if I quit my job for 6 months?" },
  { icon: TrendingDown, text: "How can I reduce my monthly expenses?" },
  { icon: Brain, text: "What is my current net worth breakdown?" },
]

export function FinancialChatDrawer() {
  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState("")
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hello! I am your FinTwin AI Financial Assistant. I have verified access to your real financial accounts, liabilities, and Monte Carlo models. How can I help your financial strategy today?",
      timestamp: new Date(),
    },
  ])
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input
    if (!text.trim() || isTyping) return

    const userMsg: Message = {
      role: "user",
      content: text,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setIsTyping(true)

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      })
      const data = await res.json()

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply || "Sorry, I could not process that inquiry.",
          timestamp: new Date(),
        },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Failed to connect to the AI Financial Twin. Please try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsTyping(false)
    }
  }

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl transition-all duration-300 hover:scale-105 hover:shadow-blue-500/25 focus:outline-none"
        title="Open FinTwin AI Assistant"
      >
        <Sparkles className="h-6 w-6" />
      </button>

      {/* Slide-over Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="flex h-full w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <Brain className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold">FinTwin AI Assistant</h3>
                    <p className="text-xs text-muted-foreground">Connected to your Financial Twin</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${
                      m.role === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        m.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-muted text-foreground rounded-bl-none prose prose-invert max-w-none text-xs"
                      }`}
                    >
                      <div className="whitespace-pre-line">{m.content}</div>
                    </div>
                    <span className="mt-1 text-[10px] text-muted-foreground px-1">
                      {m.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground p-2">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                    <span>Analyzing your financial models...</span>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggested Prompts */}
              <div className="border-t border-border p-3 bg-muted/20">
                <p className="text-[11px] font-medium text-muted-foreground mb-2">Suggested queries:</p>
                <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                  {suggestedPrompts.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(p.text)}
                      className="flex shrink-0 items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs text-muted-foreground transition hover:border-primary hover:text-foreground"
                    >
                      <p.icon className="h-3 w-3" />
                      <span>{p.text}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <div className="border-t border-border p-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleSend()
                  }}
                  className="flex gap-2"
                >
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about spending, car purchase, investments..."
                    className="flex-1 text-sm"
                    disabled={isTyping}
                  />
                  <Button type="submit" size="icon" disabled={isTyping || !input.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
                <p className="mt-2 text-[10px] text-center text-muted-foreground flex items-center justify-center gap-1">
                  <ShieldAlert className="h-3 w-3" />
                  Educational AI analysis • Not regulated financial advice
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}
