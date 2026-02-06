"use client"

import React, { createContext, useContext, useState, useCallback, useMemo } from "react"
import {
  type RoleName,
  ROLE_PERMISSIONS,
  hasPermission,
  canAccessSettingsTab,
  getNavigationForRole,
  getSettingsTabsForRole,
} from "./permissions"

export interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  avatarUrl?: string
}

export interface RBACContextValue {
  // Current user state
  user: UserProfile
  roleName: RoleName
  organizationId: string
  organizationName: string

  // Permission checks
  hasPermission: (resource: string, action: string) => boolean
  canAccessSettingsTab: (tabName: string) => boolean
  isPlatformAdmin: boolean
  isCPOAdmin: boolean
  isOperator: boolean
  isDriver: boolean

  // Filtered navigation/tabs
  navigationItems: ReturnType<typeof getNavigationForRole>
  settingsTabs: ReturnType<typeof getSettingsTabsForRole>

  // Role switching (for dev/testing)
  setRole: (role: RoleName) => void
}

const RBACContext = createContext<RBACContextValue | null>(null)

// Default dev user
const DEFAULT_USER: UserProfile = {
  id: "user-admin-001",
  email: "admin@wattsc.ma",
  firstName: "WATTSC",
  lastName: "Admin",
}

const ROLE_DISPLAY_INFO: Record<RoleName, { orgName: string; user: UserProfile }> = {
  platform_admin: {
    orgName: "WATTSC Platform",
    user: {
      id: "user-admin-001",
      email: "admin@wattsc.ma",
      firstName: "WATTSC",
      lastName: "Admin",
    },
  },
  cpo_admin: {
    orgName: "GreenCharge Morocco",
    user: {
      id: "user-cpo-001",
      email: "admin@greencharge.ma",
      firstName: "Mohamed",
      lastName: "Alami",
    },
  },
  operator: {
    orgName: "GreenCharge Morocco",
    user: {
      id: "user-op-001",
      email: "operator@greencharge.ma",
      firstName: "Fatima",
      lastName: "Benani",
    },
  },
  driver: {
    orgName: "Personal",
    user: {
      id: "user-driver-001",
      email: "driver@example.com",
      firstName: "Youssef",
      lastName: "Idrissi",
    },
  },
}

export function RBACProvider({ children }: { children: React.ReactNode }) {
  const [roleName, setRoleName] = useState<RoleName>("platform_admin")

  const roleInfo = ROLE_DISPLAY_INFO[roleName]
  const user = roleInfo.user
  const organizationName = roleInfo.orgName
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
    }),
    [user, roleName, organizationId, organizationName, checkPermission, checkSettingsTab, navigationItems, settingsTabs]
  )

  return <RBACContext.Provider value={value}>{children}</RBACContext.Provider>
}

export function useRBAC(): RBACContextValue {
  const context = useContext(RBACContext)
  if (!context) {
    throw new Error("useRBAC must be used within an RBACProvider")
  }
  return context
}
