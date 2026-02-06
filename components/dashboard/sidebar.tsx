"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  MapPin,
  Activity,
  Users,
  Settings,
  LogOut,
  Zap,
  ChevronLeft,
  Menu,
  Shield,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useState } from "react"
import { useRBAC } from "@/lib/rbac/rbac-context"
import type { RoleName } from "@/lib/rbac/permissions"

// Map icon names from permissions to actual Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  MapPin,
  Activity,
  Users,
  Settings,
}

const ROLE_BADGE_COLORS: Record<RoleName, string> = {
  platform_admin: "bg-primary/20 text-primary",
  cpo_admin: "bg-chart-2/20 text-chart-2",
  operator: "bg-warning/20 text-warning",
  driver: "bg-chart-5/20 text-chart-5",
}

const ROLE_LABELS: Record<RoleName, string> = {
  platform_admin: "Platform Admin",
  cpo_admin: "CPO Admin",
  operator: "Operator",
  driver: "Driver",
}

export function Sidebar() {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, roleName, organizationName, navigationItems } = useRBAC()

  // Build initials from user name
  const initials = `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`

  return (
    <>
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-screen bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className={cn(
            "flex items-center gap-3 px-4 py-5 border-b border-sidebar-border",
            collapsed && "justify-center px-2"
          )}>
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary shrink-0">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold tracking-tight text-sidebar-foreground">watt.ma</h1>
                <p className="text-[11px] text-sidebar-foreground/50">EV Charging Platform</p>
              </div>
            )}
          </div>

          {/* User card */}
          <div className={cn(
            "px-4 py-3 border-b border-sidebar-border",
            collapsed && "px-2 py-3"
          )}>
            <div className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center"
            )}>
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center shrink-0">
                <span className="text-xs font-semibold text-sidebar-foreground">{initials}</span>
              </div>
              {!collapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate leading-tight">
                    {user.firstName} {user.lastName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <Badge
                      variant="secondary"
                      className={cn(
                        "text-[10px] px-1.5 py-0 h-4 font-medium border-0",
                        ROLE_BADGE_COLORS[roleName]
                      )}
                    >
                      {ROLE_LABELS[roleName]}
                    </Badge>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Navigation - filtered by role */}
          <nav className="flex-1 px-2 py-4 space-y-1">
            {navigationItems.map((item) => {
              const IconComponent = ICON_MAP[item.icon] || LayoutDashboard
              const isActive = pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-primary"
                      : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50",
                    collapsed && "justify-center px-2"
                  )}
                >
                  <IconComponent className={cn("h-5 w-5 shrink-0", isActive && "text-primary")} />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              )
            })}
          </nav>

          {/* Sign out */}
          <div className="px-2 py-4 border-t border-sidebar-border">
            <button
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 w-full transition-colors",
                collapsed && "justify-center px-2"
              )}
            >
              <LogOut className="h-5 w-5 shrink-0" />
              {!collapsed && <span>Sign out</span>}
            </button>
          </div>

          {/* Collapse button - desktop only */}
          <div className="hidden lg:block px-2 py-4 border-t border-sidebar-border">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                "w-full justify-center",
                !collapsed && "justify-start"
              )}
            >
              <ChevronLeft className={cn(
                "h-4 w-4 transition-transform",
                collapsed && "rotate-180"
              )} />
              {!collapsed && <span className="ml-2">Collapse</span>}
            </Button>
          </div>
        </div>
      </aside>
    </>
  )
}
