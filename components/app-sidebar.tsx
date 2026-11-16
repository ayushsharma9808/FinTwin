"use client"

import {
  Brain,
  SlidersHorizontal,
  PieChart,
  Link2,
  Settings,
  Home,
  User2,
  Calculator,
  Receipt,
  Target,
  LogOut,
} from "lucide-react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/lib/auth-context"

// Menu items
const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "AI Digital Twin",
    url: "/digital-twin",
    icon: Brain,
  },
  {
    title: "What-If Simulator",
    url: "/simulator",
    icon: SlidersHorizontal,
  },
  {
    title: "Ledger & Expenses",
    url: "/ledger",
    icon: Receipt,
  },
  {
    title: "Financial Goals",
    url: "/goals",
    icon: Target,
  },
  {
    title: "Risk & Portfolio",
    url: "/risk-portfolio",
    icon: PieChart,
  },
  {
    title: "Calculators",
    url: "/calculators",
    icon: Calculator,
  },
  {
    title: "Connect Accounts",
    url: "/connect",
    icon: Link2,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="w-16 h-screen bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
      <div className="p-3 flex flex-col items-center">
        <Link
          href="/dashboard"
          className="w-10 h-10 flex items-center justify-center rounded-lg text-white shadow-sm"
          style={{ backgroundColor: "#11650b" }}
          title="FinTwin Dashboard"
        >
          <span className="text-sm font-bold">FT</span>
        </Link>
      </div>
      <div className="flex-1 p-3 overflow-y-auto scrollbar-none">
        <div className="flex flex-col gap-2.5">
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <Link
                key={item.title}
                href={item.url}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group ${
                  isActive
                    ? "bg-blue-500/20 text-blue-400"
                    : "hover:bg-blue-500/10 text-sidebar-foreground"
                }`}
                title={item.title}
              >
                <item.icon
                  className={`h-5 w-5 transition-colors ${
                    isActive
                      ? "text-blue-400"
                      : "text-sidebar-foreground group-hover:text-blue-400"
                  }`}
                />
              </Link>
            )
          })}
        </div>
      </div>
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-white hover:bg-blue-500/10 transition-all duration-200"
              title={user?.name || "User Profile"}
            >
              <User2 className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-52">
            <div className="px-2 py-1.5 text-xs">
              <p className="font-semibold">{user?.name || "Ayush Sharma"}</p>
              <p className="text-muted-foreground truncate">{user?.email || "ayush@fintwin.com"}</p>
            </div>
            <div className="my-1 border-t border-border" />
            <DropdownMenuItem asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/connect">
                <Link2 className="mr-2 h-4 w-4" />
                <span>Connected Accounts</span>
              </Link>
            </DropdownMenuItem>
            <div className="my-1 border-t border-border" />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
