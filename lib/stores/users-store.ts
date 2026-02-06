import { create } from "zustand"
import { type User, type UserRole, type UserStatus, mockUsers } from "@/lib/data/users"

interface UsersState {
  users: User[]
  searchQuery: string
  roleFilter: UserRole | "all"
  statusFilter: UserStatus | "all"
  setSearchQuery: (query: string) => void
  setRoleFilter: (role: UserRole | "all") => void
  setStatusFilter: (status: UserStatus | "all") => void
  addUser: (user: User) => void
  updateUser: (id: string, updates: Partial<User>) => void
  deleteUser: (id: string) => void
  getFilteredUsers: () => User[]
}

export const useUsersStore = create<UsersState>((set, get) => ({
  users: mockUsers,
  searchQuery: "",
  roleFilter: "all",
  statusFilter: "all",
  setSearchQuery: (query) => set({ searchQuery: query }),
  setRoleFilter: (role) => set({ roleFilter: role }),
  setStatusFilter: (status) => set({ statusFilter: status }),
  addUser: (user) => set((state) => ({ users: [...state.users, user] })),
  updateUser: (id, updates) =>
    set((state) => ({
      users: state.users.map((user) =>
        user.id === id ? { ...user, ...updates } : user
      ),
    })),
  deleteUser: (id) =>
    set((state) => ({
      users: state.users.filter((user) => user.id !== id),
    })),
  getFilteredUsers: () => {
    const { users, searchQuery, roleFilter, statusFilter } = get()
    return users.filter((user) => {
      const matchesSearch =
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery) ||
        user.id.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = roleFilter === "all" || user.role === roleFilter
      const matchesStatus = statusFilter === "all" || user.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  },
}))
