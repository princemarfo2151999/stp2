"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Building2,
  DollarSign,
  Bell,
  Plug2,
  Server,
  Webhook,
  Database,
} from "lucide-react"
import { GeneralSettings } from "@/components/settings/general-settings"
import { PricingSettings } from "@/components/settings/pricing-settings"
import { NotificationSettings } from "@/components/settings/notification-settings"
import { PaymentSettings } from "@/components/settings/payment-settings"
import { OcppSettings } from "@/components/settings/ocpp-settings"
import { WebhooksSettings } from "@/components/settings/webhooks-settings"
import { DatabaseSettings } from "@/components/settings/database-settings"
import { useRBAC } from "@/lib/rbac/rbac-context"

// Map icon names from permissions to actual Lucide components
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Building2,
  DollarSign,
  Bell,
  Plug2,
  Server,
  Webhook,
  Database,
}

// Map tab values to their components
const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  general: GeneralSettings,
  pricing: PricingSettings,
  notifications: NotificationSettings,
  integrations: PaymentSettings,
  ocpp: OcppSettings,
  webhooks: WebhooksSettings,
  database: DatabaseSettings,
}

export default function SettingsPage() {
  const searchParams = useSearchParams()
  const { settingsTabs, roleName } = useRBAC()

  // Use the first allowed tab as default, or the one from URL if permitted
  const allowedTabValues = useMemo(() => settingsTabs.map(t => t.value), [settingsTabs])
  const requestedTab = searchParams.get("tab") || "general"
  const defaultTab = allowedTabValues.includes(requestedTab)
    ? requestedTab
    : allowedTabValues[0] || "general"

  const [activeTab, setActiveTab] = useState(defaultTab)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-balance">Platform Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your platform configuration and integrations</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col gap-6">
        <TabsList className="h-auto w-full justify-start gap-2 rounded-none border-b border-border bg-transparent px-0 pb-3 flex-wrap">
          {settingsTabs.map((tab) => {
            const IconComponent = ICON_MAP[tab.icon] || Building2
            return (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="gap-2 rounded-lg border border-border bg-transparent px-4 py-2 text-sm font-medium text-muted-foreground transition-all data-[state=active]:border-primary data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-sm hover:bg-muted/50 mb-1"
              >
                <IconComponent className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            )
          })}
        </TabsList>

        {settingsTabs.map((tab) => {
          const Component = TAB_COMPONENTS[tab.value]
          if (!Component) return null
          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-0">
              <Component />
            </TabsContent>
          )
        })}
      </Tabs>
    </div>
  )
}
