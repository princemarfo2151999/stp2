"use client"

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import {
  type RoleName,
  hasPermission,
  canAccessSettingsTab,
  getNavigationForRole,
  getSettingsTabsForRole,
} from "./permissions"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
}

export interface RBACContextValue {
  user: UserProfile
  roleName: RoleName
  organizationId: string
  organizationName: string
  hasPermission: (resource: string, action: string) => boolean
  canAccessSettingsTab: (tabName: string) => boolean
  isPlatformAdmin: boolean
  isCPOAdmin: boolean
  isOperator: boolean
  isDriver: boolean
  navigationItems: ReturnType<typeof getNavigationForRole>
  settingsTabs: ReturnType<typeof getSettingsTabsForRole>
  setRole: (role: RoleName) => void
  signOut: () => Promise<void>
  supabaseUser: User | null
  isLoading: boolean
}

const RBACContext = createContext<RBACContextValue | null>(null)

// Map DB role values to RBAC role names
const DB_ROLE_TO_RBAC: Record<string, RoleName> = {
  admin: "platform_admin",
  operator: "operator",
  viewer: "driver",
}

// Fallback dev users when not authenticated
const ROLE_DISPLAY_INFO: Record<RoleName, { orgName: string; user: UserProfile }> = {
  platform_admin: {
    orgName: "WATTSC Platform",
    user: { id: "user-admin-001", email: "admin@wattsc.ma", firstName: "WATTSC", lastName: "Admin" },
  },
  cpo_admin: {
    orgName: "GreenCharge Morocco",
    user: { id: "user-cpo-001", email: "admin@greencharge.ma", firstName: "Mohamed", lastName: "Alami" },
  },
  operator: {
    orgName: "GreenCharge Morocco",
    user: { id: "user-op-001", email: "operator@greencharge.ma", firstName: "Fatima", lastName: "Benani" },
  },
  driver: {
    orgName: "Personal",
    user: { id: "user-driver-001", email: "driver@example.com", firstName: "Youssef", lastName: "Idrissi" },
  },
}

function userProfileFromSupabase(supabaseUser: User): UserProfile {
  const meta = supabaseUser.user_metadata || {}
  const fullName = meta.full_name || ""
  const parts = fullName.split(" ")
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    firstName: parts[0] || supabaseUser.email?.split("@")[0] || "User",
    lastName: parts.slice(1).join(" ") || "",
  }
}

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const [roleName, setRoleName] = useState<RoleName>("platform_admin")
  const [supabaseUser, setSupabaseUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setSupabaseUser(user)
          const dbRole = user.user_metadata?.role || "viewer"
          setRoleName(DB_ROLE_TO_RBAC[dbRole] || "driver")
        }
      } catch {
        // Not authenticated
      } finally {
        setIsLoading(false)
      }
    }
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setSupabaseUser(session.user)
        const dbRole = session.user.user_metadata?.role || "viewer"
        setRoleName(DB_ROLE_TO_RBAC[dbRole] || "driver")
      } else {
        setSupabaseUser(null)
      }
      setIsLoading(false)
    })

    return () => subscription.unsubscribe()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    window.location.href = "/login"
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Use real user if authenticated, otherwise use dev fallback
  const user: UserProfile = supabaseUser
    ? userProfileFromSupabase(supabaseUser)
    : ROLE_DISPLAY_INFO[roleName].user

  const organizationName = supabaseUser
    ? supabaseUser.user_metadata?.organization || "WATTSC"
    : ROLE_DISPLAY_INFO[roleName].orgName

  const organizationId = roleName === "platform_admin" ? "org-platform" : "org-greencharge"

  const checkPermission = useCallback(
    (resource: string, action: string) => hasPermission(roleName, resource, action),
    [roleName]
  )

  const checkSettingsTab = useCallback(
    (tabName: string) => canAccessSettingsTab(roleName, tabName),
    [roleName]
  )

  const navigationItems = useMemo(() => getNavigationForRole(roleName), [roleName])
  const settingsTabs = useMemo(() => getSettingsTabsForRole(roleName), [roleName])

  const value = useMemo<RBACContextValue>(
    () => ({
      user,
      roleName,
      organizationId,
      organizationName,
      hasPermission: checkPermission,
      canAccessSettingsTab: checkSettingsTab,
      isPlatformAdmin: roleName === "platform_admin",
      isCPOAdmin: roleName === "cpo_admin",
      isOperator: roleName === "operator",
      isDriver: roleName === "driver",
      navigationItems,
      settingsTabs,
      setRole: setRoleName,
      signOut: handleSignOut,
      supabaseUser,
      isLoading,
    }),
    [user, roleName, organizationId, organizationName, checkPermission, checkSettingsTab, navigationItems, settingsTabs, handleSignOut, supabaseUser, isLoading]
  )

  return React.createElement(RBACContext.Provider, { value }, children)
}

export function useRBAC(): RBACContextValue {
  const context = useContext(RBACContext)
  if (!context) {
    throw new Error("useRBAC must be used within an RBACProvider")
  }
  return context
}
