import React from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { RBACProvider } from "@/lib/rbac/rbac-context"
import { DashboardTopBar } from "@/components/dashboard/dashboard-top-bar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RBACProvider>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="lg:pl-64 transition-all duration-300">
          <DashboardTopBar />
          <div className="p-4 lg:p-6 xl:p-8">
            {children}
          </div>
        </main>
      </div>
    </RBACProvider>
  )
}
