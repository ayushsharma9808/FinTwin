"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Brain, SlidersHorizontal, PieChart, Settings, Link2 } from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, href: "/dashboard", label: "Dashboard" },
  { icon: Brain, href: "/digital-twin", label: "AI Digital Twin" },
  { icon: SlidersHorizontal, href: "/simulator", label: "What-If Simulator" },
  { icon: PieChart, href: "/risk-portfolio", label: "Risk & Portfolio" },
  { icon: Link2, href: "/connect", label: "Connect Accounts" },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-16 border-r border-border bg-sidebar">
      <div className="flex h-full flex-col items-center py-4">
        <div className="mb-8 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
          <span className="text-lg font-bold text-primary-foreground">F</span>
        </div>

        <nav className="flex flex-1 flex-col items-center gap-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-lg transition-all duration-200 hover:bg-sidebar-accent",
                  isActive && "bg-sidebar-accent text-sidebar-foreground",
                )}
                title={item.label}
              >
                <item.icon
                  className={cn(
                    "h-5 w-5 text-muted-foreground transition-colors",
                    isActive && "text-sidebar-foreground",
                  )}
                />
              </Link>
            )
          })}
        </nav>

        <div className="mt-auto">
          <Link
            href="/settings"
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground",
              pathname === "/settings" && "bg-sidebar-accent text-sidebar-foreground",
            )}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </aside>
  )
}
