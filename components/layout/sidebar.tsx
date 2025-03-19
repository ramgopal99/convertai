'use client'

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ChevronRight, Settings, LayoutDashboard, Bot, Shield, Flame, User, MessagesSquare } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useAuth } from "@/lib/auth"

const sidebarItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "leads generator",
    href: "/dashboard/leads-generator",
    icon: Bot,
  },
  {
    title: "leads Email",
    href: "/dashboard/leads-email",
    icon: Flame,
  },
  {
    title: "Sample Code",
    href: "/dashboard/sample-code",
    icon: MessagesSquare,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,

  }
]

const adminItems = [
  {
    title: "Admin Dashboard",
    href: "/dashboard/admin",
    icon: Shield,
  },
]

export function Sidebar() {
  const { isAdmin } = useAuth()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className={cn(
      "sticky top-0 h-[calc(100vh-4rem)] border-r bg-background transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="flex h-16 items-center justify-between border-b px-3">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <span className="font-semibold">Present Dashboard</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "h-8 w-8",
            isCollapsed && "ml-1.5"
          )}
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <ChevronRight className={cn(
            "h-4 w-4 transition-transform duration-300",
            isCollapsed ? "" : "rotate-180"
          )} />
        </Button>
      </div>

      <div className="space-y-4 py-4">
        <nav className="px-2">
          <div className="space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent/50",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4",
                  pathname === item.href && "text-primary"
                )} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            ))}

            {/* Admin-only items */}
            {isAdmin && adminItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:bg-accent/50",
                  pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:text-foreground",
                  isCollapsed ? "justify-center" : ""
                )}
              >
                <item.icon className={cn(
                  "h-4 w-4",
                  pathname === item.href && "text-primary"
                )} />
                {!isCollapsed && <span>{item.title}</span>}
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}