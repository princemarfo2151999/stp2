"use client"

import { useState } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Search, Download, Upload, Users, UserCog, Shield } from "lucide-react"
import { useUsersStore } from "@/lib/stores/users-store"
import { UsersTable } from "@/components/users/users-table"
import { AddUserDialog } from "@/components/users/add-user-dialog"
import { EditUserDialog } from "@/components/users/edit-user-dialog"
import { UserDetailSheet } from "@/components/users/user-detail-sheet"
import type { User } from "@/lib/data/users"

export default function UsersPage() {
  const searchParams = useSearchParams()
  const initialRole = searchParams.get("role") || "all"

  const {
    searchQuery,
    roleFilter,
    statusFilter,
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    getFilteredUsers,
    users,
  } = useUsersStore()

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDetailSheetOpen, setIsDetailSheetOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  // Set initial filter from URL params
  useState(() => {
    if (initialRole && initialRole !== "all") {
      setRoleFilter(initialRole as "admin" | "operator" | "driver")
    }
  })

  const filteredUsers = getFilteredUsers()

  const stats = {
    total: users.length,
    drivers: users.filter((u) => u.role === "driver").length,
    operators: users.filter((u) => u.role === "operator").length,
    admins: users.filter((u) => u.role === "admin").length,
  }

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setIsDetailSheetOpen(true)
  }

  const handleEditUser = (user: User) => {
    setSelectedUser(user)
    setIsEditDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Users</h1>
          <p className="text-sm text-muted-foreground">
            Manage drivers, operators, and administrators
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button size="sm" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Total Users</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-2/10">
              <Users className="h-5 w-5 text-chart-2" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.drivers}</p>
              <p className="text-xs text-muted-foreground">Drivers</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-3/10">
              <UserCog className="h-5 w-5 text-chart-3" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.operators}</p>
              <p className="text-xs text-muted-foreground">Operators</p>
            </div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-chart-4/10">
              <Shield className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-2xl font-semibold text-foreground">{stats.admins}</p>
              <p className="text-xs text-muted-foreground">Admins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={roleFilter}
          onValueChange={(value) => setRoleFilter(value as typeof roleFilter)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="operator">Operator</SelectItem>
            <SelectItem value="driver">Driver</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}
        >
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Users Table */}
      <UsersTable
        users={filteredUsers}
        onViewUser={handleViewUser}
        onEditUser={handleEditUser}
      />

      {/* Dialogs */}
      <AddUserDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
      {selectedUser && (
        <>
          <EditUserDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            user={selectedUser}
          />
          <UserDetailSheet
            open={isDetailSheetOpen}
            onOpenChange={setIsDetailSheetOpen}
            user={selectedUser}
          />
        </>
      )}
    </div>
  )
}
