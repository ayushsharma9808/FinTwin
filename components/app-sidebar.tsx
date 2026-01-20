"use client"

import { Brain, SlidersHorizontal, PieChart, Link2, Settings, Home, ChevronUp, User2, PanelLeftClose, PanelLeftOpen, Calculator } from "lucide-react"
import { usePathname } from "next/navigation"
import { useSidebar } from "@/components/ui/sidebar"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

// Menu items.
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

function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar()
  
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleSidebar}
      className="h-8 w-8 shrink-0 hover:bg-blue-500/20 rounded-lg transition-all duration-200"
    >
      {state === "collapsed" ? (
        <PanelLeftOpen className="h-4 w-4 text-blue-400" />
      ) : (
        <PanelLeftClose className="h-4 w-4 text-blue-400" />
      )}
    </Button>
  )
}

export function AppSidebar() {
  const pathname = usePathname()
  
  return (
    <div className="w-16 h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      <div className="p-3 flex flex-col items-center">
        <div className="w-10 h-10 flex items-center justify-center rounded-lg text-white shadow-sm" style={{backgroundColor: '#11650b'}}>
          <span className="text-sm font-bold">FT</span>
        </div>
      </div>
      <div className="flex-1 p-3">
        <div className="flex flex-col gap-3">
          {items.map((item) => {
            const isActive = pathname === item.url
            return (
              <a
                key={item.title}
                href={item.url}
                className={`w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-blue-500/20 text-blue-400' 
                    : 'hover:bg-blue-500/10 text-sidebar-foreground'
                }`}
                title={item.title}
              >
                <item.icon className={`h-5 w-5 transition-colors ${
                  isActive 
                    ? 'text-blue-400' 
                    : 'text-sidebar-foreground group-hover:text-blue-400'
                }`} />
              </a>
            )
          })}
        </div>
      </div>
      <div className="p-3 border-t border-sidebar-border">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-slate-600 to-slate-700 text-white hover:bg-blue-500/10 transition-all duration-200">
              <User2 className="size-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="right" align="end" className="w-48">
            <DropdownMenuItem>
              <span>Account</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Billing</span>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}