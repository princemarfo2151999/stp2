"use client"

import dynamic from "next/dynamic"
import { Shield, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"

const RoleSwitcher = dynamic(
  () => import("./role-switcher").then((mod) => ({ default: mod.RoleSwitcher })),
  {
    ssr: false,
    loading: () => (
      <Button
        variant="outline"
        size="sm"
        className="gap-2 border-dashed text-xs h-8"
        aria-hidden
      >
        <Shield className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Platform Admin</span>
        <ChevronDown className="h-3 w-3 opacity-50" />
      </Button>
    ),
  }
)

export function DashboardTopBar() {
  return (
    <div className="flex items-center justify-end px-4 lg:px-8 py-3 border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-medium tracking-wider uppercase text-muted-foreground hidden sm:inline">Dev Mode</span>
        <RoleSwitcher />
      </div>
    </div>
  )
}
