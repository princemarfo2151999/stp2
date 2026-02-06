export type UserRole = "admin" | "operator" | "driver"
export type UserStatus = "active" | "inactive" | "suspended"

export interface User {
  id: string
  email: string
  name: string
  phone: string
  role: UserRole
  status: UserStatus
  rfidTag?: string
  vehicleInfo?: string
  createdAt: string
  lastLogin?: string
  totalSessions: number
  totalEnergy: number
  totalSpent: number
}

export const mockUsers: User[] = [
  {
    id: "USR-001",
    email: "admin@watt.ma",
    name: "Mohamed Alami",
    phone: "+212 600-123456",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15",
    lastLogin: "2025-02-04T09:30:00",
    totalSessions: 0,
    totalEnergy: 0,
    totalSpent: 0,
  },
  {
    id: "USR-002",
    email: "operator@watt.ma",
    name: "Fatima Benali",
    phone: "+212 600-234567",
    role: "operator",
    status: "active",
    createdAt: "2024-02-20",
    lastLogin: "2025-02-04T08:15:00",
    totalSessions: 0,
    totalEnergy: 0,
    totalSpent: 0,
  },
  {
    id: "USR-003",
    email: "ahmed.driver@gmail.com",
    name: "Ahmed Tazi",
    phone: "+212 600-345678",
    role: "driver",
    status: "active",
    rfidTag: "RFID-0001234",
    vehicleInfo: "Tesla Model 3 - 2023",
    createdAt: "2024-03-10",
    lastLogin: "2025-02-03T18:45:00",
    totalSessions: 47,
    totalEnergy: 892.5,
    totalSpent: 4462.5,
  },
  {
    id: "USR-004",
    email: "sara.electric@outlook.com",
    name: "Sara Idrissi",
    phone: "+212 600-456789",
    role: "driver",
    status: "active",
    rfidTag: "RFID-0001235",
    vehicleInfo: "BMW iX3 - 2024",
    createdAt: "2024-04-05",
    lastLogin: "2025-02-04T07:20:00",
    totalSessions: 32,
    totalEnergy: 624.8,
    totalSpent: 3124.0,
  },
  {
    id: "USR-005",
    email: "youssef.ev@gmail.com",
    name: "Youssef Mansouri",
    phone: "+212 600-567890",
    role: "driver",
    status: "inactive",
    rfidTag: "RFID-0001236",
    vehicleInfo: "Renault Zoe - 2022",
    createdAt: "2024-05-12",
    lastLogin: "2025-01-15T14:30:00",
    totalSessions: 18,
    totalEnergy: 298.4,
    totalSpent: 1492.0,
  },
  {
    id: "USR-006",
    email: "leila.green@yahoo.com",
    name: "Leila Chraibi",
    phone: "+212 600-678901",
    role: "driver",
    status: "active",
    rfidTag: "RFID-0001237",
    vehicleInfo: "Peugeot e-208 - 2024",
    createdAt: "2024-06-20",
    lastLogin: "2025-02-04T06:50:00",
    totalSessions: 56,
    totalEnergy: 987.2,
    totalSpent: 4936.0,
  },
  {
    id: "USR-007",
    email: "omar.ev@watt.ma",
    name: "Omar Benjelloun",
    phone: "+212 600-789012",
    role: "operator",
    status: "active",
    createdAt: "2024-07-01",
    lastLogin: "2025-02-03T16:00:00",
    totalSessions: 0,
    totalEnergy: 0,
    totalSpent: 0,
  },
  {
    id: "USR-008",
    email: "karim.driver@gmail.com",
    name: "Karim Fassi",
    phone: "+212 600-890123",
    role: "driver",
    status: "suspended",
    rfidTag: "RFID-0001238",
    vehicleInfo: "Hyundai Ioniq 5 - 2023",
    createdAt: "2024-08-15",
    lastLogin: "2025-01-20T11:30:00",
    totalSessions: 8,
    totalEnergy: 156.4,
    totalSpent: 782.0,
  },
  {
    id: "USR-009",
    email: "nadia.electric@outlook.com",
    name: "Nadia Ouazzani",
    phone: "+212 600-901234",
    role: "driver",
    status: "active",
    rfidTag: "RFID-0001239",
    vehicleInfo: "Mercedes EQA - 2024",
    createdAt: "2024-09-01",
    lastLogin: "2025-02-04T08:45:00",
    totalSessions: 29,
    totalEnergy: 534.6,
    totalSpent: 2673.0,
  },
  {
    id: "USR-010",
    email: "hamza.ev@gmail.com",
    name: "Hamza Berrada",
    phone: "+212 600-012345",
    role: "driver",
    status: "active",
    rfidTag: "RFID-0001240",
    vehicleInfo: "Volkswagen ID.4 - 2023",
    createdAt: "2024-10-10",
    lastLogin: "2025-02-03T20:15:00",
    totalSessions: 41,
    totalEnergy: 756.8,
    totalSpent: 3784.0,
  },
]

export function getUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id)
}

export function getUsersByRole(role: UserRole): User[] {
  return mockUsers.filter((user) => user.role === role)
}

export function getUsersByStatus(status: UserStatus): User[] {
  return mockUsers.filter((user) => user.status === status)
}

export function getDrivers(): User[] {
  return getUsersByRole("driver")
}

export function getOperators(): User[] {
  return getUsersByRole("operator")
}

export function getAdmins(): User[] {
  return getUsersByRole("admin")
}
