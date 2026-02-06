"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Save, Shield, UserCog, Users, Plus } from "lucide-react"

interface Permission {
  id: string
  name: string
  description: string
}

interface Role {
  id: string
  name: string
  description: string
  icon: React.ElementType
  color: string
  permissions: string[]
  isSystem: boolean
}

const allPermissions: Permission[] = [
  { id: "dashboard.view", name: "View Dashboard", description: "Access to main dashboard" },
  { id: "stations.view", name: "View Stations", description: "View charging stations" },
  { id: "stations.manage", name: "Manage Stations", description: "Add, edit, delete stations" },
  { id: "stations.control", name: "Control Stations", description: "Start, stop, reset chargers" },
  { id: "sessions.view", name: "View Sessions", description: "View charging sessions" },
  { id: "sessions.manage", name: "Manage Sessions", description: "End sessions, issue refunds" },
  { id: "users.view", name: "View Users", description: "View user accounts" },
  { id: "users.manage", name: "Manage Users", description: "Add, edit, delete users" },
  { id: "reports.view", name: "View Reports", description: "Access reporting dashboard" },
  { id: "reports.export", name: "Export Reports", description: "Download report data" },
  { id: "settings.view", name: "View Settings", description: "View platform settings" },
  { id: "settings.manage", name: "Manage Settings", description: "Modify platform settings" },
  { id: "billing.view", name: "View Billing", description: "View invoices and payments" },
  { id: "billing.manage", name: "Manage Billing", description: "Process refunds, adjust billing" },
]

const defaultRoles: Role[] = [
  {
    id: "admin",
    name: "Administrator",
    description: "Full access to all platform features and settings",
    icon: Shield,
    color: "bg-chart-4/10 text-chart-4",
    permissions: allPermissions.map((p) => p.id),
    isSystem: true,
  },
  {
    id: "operator",
    name: "Operator",
    description: "Manage stations and monitor charging sessions",
    icon: UserCog,
    color: "bg-chart-3/10 text-chart-3",
    permissions: [
      "dashboard.view",
      "stations.view",
      "stations.manage",
      "stations.control",
      "sessions.view",
      "sessions.manage",
      "users.view",
      "reports.view",
    ],
    isSystem: true,
  },
  {
    id: "driver",
    name: "Driver",
    description: "Basic access for EV drivers using the platform",
    icon: Users,
    color: "bg-chart-2/10 text-chart-2",
    permissions: ["dashboard.view", "stations.view", "sessions.view", "billing.view"],
    isSystem: true,
  },
]

export function RolesSettings() {
  const [roles, setRoles] = useState<Role[]>(defaultRoles)
  const [selectedRole, setSelectedRole] = useState<Role>(roles[0])

  const handlePermissionChange = (permissionId: string, checked: boolean) => {
    if (selectedRole.isSystem && selectedRole.id === "admin") return // Can't modify admin permissions

    const updatedPermissions = checked
      ? [...selectedRole.permissions, permissionId]
      : selectedRole.permissions.filter((p) => p !== permissionId)

    const updatedRole = { ...selectedRole, permissions: updatedPermissions }
    setSelectedRole(updatedRole)
    setRoles(roles.map((r) => (r.id === updatedRole.id ? updatedRole : r)))
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Roles Overview */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Roles & Permissions</CardTitle>
            <CardDescription>
              Define access levels and permissions for different user roles
            </CardDescription>
          </div>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Custom Role
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {roles.map((role) => {
              const RoleIcon = role.icon
              return (
                <div
                  key={role.id}
                  className={`cursor-pointer rounded-lg border p-4 transition-colors ${
                    selectedRole.id === role.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50"
                  }`}
                  onClick={() => setSelectedRole(role)}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${role.color}`}
                    >
                      <RoleIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-foreground">{role.name}</p>
                        {role.isSystem && (
                          <Badge variant="secondary" className="text-xs">
                            System
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{role.description}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground">
                      {role.permissions.length} of {allPermissions.length} permissions
                    </p>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{
                          width: `${(role.permissions.length / allPermissions.length) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Permission Editor */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <selectedRole.icon className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>{selectedRole.name} Permissions</CardTitle>
              <CardDescription>
                {selectedRole.isSystem && selectedRole.id === "admin"
                  ? "Administrator role has all permissions and cannot be modified"
                  : `Configure what ${selectedRole.name.toLowerCase()}s can access`}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {allPermissions.map((permission) => {
              const isChecked = selectedRole.permissions.includes(permission.id)
              const isDisabled = selectedRole.isSystem && selectedRole.id === "admin"
              return (
                <div
                  key={permission.id}
                  className={`flex items-start gap-3 rounded-lg border border-border p-3 ${
                    isDisabled ? "opacity-60" : ""
                  }`}
                >
                  <Checkbox
                    id={permission.id}
                    checked={isChecked}
                    onCheckedChange={(checked) =>
                      handlePermissionChange(permission.id, checked as boolean)
                    }
                    disabled={isDisabled}
                    className="mt-0.5"
                  />
                  <div className="flex-1">
                    <label
                      htmlFor={permission.id}
                      className="cursor-pointer text-sm font-medium text-foreground"
                    >
                      {permission.name}
                    </label>
                    <p className="text-xs text-muted-foreground">{permission.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
