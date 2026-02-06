"use client"

import { useRBAC } from "@/lib/rbac/rbac-context"
import type { RoleName } from "@/lib/rbac/permissions"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Shield, ChevronDown, Check, Crown, Wrench, Car, Building2 } from "lucide-react"
import { cn } from "@/lib/utils"

const ROLES: { value: RoleName; label: string; description: string; icon: React.ComponentType<{ className?: string }> }[] = [
  {
    value: "platform_admin",
    label: "Platform Admin",
    description: "Full access to all features and tenants",
    icon: Crown,
  },
  {
    value: "cpo_admin",
    label: "CPO Admin",
    description: "Manages own organization's resources",
    icon: Building2,
  },
  {
    value: "operator",
    label: "Operator",
    description: "Monitors sessions and handles incidents",
    icon: Wrench,
  },
  {
    value: "driver",
    label: "Driver",
    description: "EV user with charging access only",
    icon: Car,
  },
]

export function RoleSwitcher() {
  const { roleName, setRole } = useRBAC()
  const currentRole = ROLES.find((r) => r.value === roleName) || ROLES[0]

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-dashed text-xs h-8"
        >
          <Shield className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{currentRole.label}</span>
          <ChevronDown className="h-3 w-3 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Switch Role (Dev Mode)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {ROLES.map((role) => {
          const Icon = role.icon
          const isActive = roleName === role.value
          return (
            <DropdownMenuItem
              key={role.value}
              onClick={() => setRole(role.value)}
              className={cn(
                "flex items-start gap-3 py-2.5 cursor-pointer",
                isActive && "bg-accent"
              )}
            >
              <Icon className="h-4 w-4 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{role.label}</span>
                  {isActive && <Check className="h-3.5 w-3.5 text-primary" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {role.description}
                </p>
              </div>
            </DropdownMenuItem>
          )
        })}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5">
          <p className="text-[10px] text-muted-foreground leading-tight">
            This switcher is for development and testing. In production, roles are assigned via user_org_memberships in the database.
          </p>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
