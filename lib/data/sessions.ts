export type SessionStatus =
  | "initiated"
  | "awaiting_payment"
  | "authorized"
  | "awaiting_plug"
  | "awaiting_operator"
  | "starting"
  | "charging"
  | "stopping"
  | "completed"
  | "captured"
  | "failed"
  | "refunded"

export interface Session {
  id: string
  stationId: string
  stationName: string
  connectorId: string
  connectorType: string
  userId: string | null
  userName: string
  authMode: "subscription" | "prepaid" | "operator_override" | "guest_qr"
  status: SessionStatus
  startTime: string
  endTime: string | null
  energyKwh: number
  costTotal: number
  currency: string
  ocppTransactionId: string | null
  createdAt: string
}

export const mockSessions: Session[] = [
  {
    id: "SES-001",
    stationId: "STN-001",
    stationName: "Casa Marina Mall",
    connectorId: "C1",
    connectorType: "CCS2 - 150kW",
    userId: "USR-001",
    userName: "Ahmed Benali",
    authMode: "subscription",
    status: "completed",
    startTime: "2024-12-03T14:30:00Z",
    endTime: "2024-12-03T15:15:00Z",
    energyKwh: 32.5,
    costTotal: 162.5,
    currency: "MAD",
    ocppTransactionId: "TXN-001-ABC",
    createdAt: "2024-12-03T14:29:00Z",
  },
  {
    id: "SES-002",
    stationId: "STN-002",
    stationName: "Rabat Agdal",
    connectorId: "C2",
    connectorType: "Type 2 - 22kW",
    userId: "USR-002",
    userName: "Sarah Mansouri",
    authMode: "prepaid",
    status: "charging",
    startTime: "2024-12-03T13:45:00Z",
    endTime: null,
    energyKwh: 18.2,
    costTotal: 91.0,
    currency: "MAD",
    ocppTransactionId: "TXN-002-DEF",
    createdAt: "2024-12-03T13:44:00Z",
  },
  {
    id: "SES-003",
    stationId: "STN-003",
    stationName: "Marrakech Guéliz",
    connectorId: "C1",
    connectorType: "CHAdeMO - 50kW",
    userId: null,
    userName: "Guest",
    authMode: "guest_qr",
    status: "completed",
    startTime: "2024-12-03T12:20:00Z",
    endTime: "2024-12-03T12:55:00Z",
    energyKwh: 25.8,
    costTotal: 129.0,
    currency: "MAD",
    ocppTransactionId: "TXN-003-GHI",
    createdAt: "2024-12-03T12:19:00Z",
  },
  {
    id: "SES-004",
    stationId: "STN-004",
    stationName: "Tanger Med Port",
    connectorId: "C1",
    connectorType: "CCS2 - 350kW",
    userId: "USR-003",
    userName: "Mohammed Khalil",
    authMode: "subscription",
    status: "charging",
    startTime: "2024-12-03T14:55:00Z",
    endTime: null,
    energyKwh: 45.0,
    costTotal: 270.0,
    currency: "MAD",
    ocppTransactionId: "TXN-004-JKL",
    createdAt: "2024-12-03T14:54:00Z",
  },
  {
    id: "SES-005",
    stationId: "STN-005",
    stationName: "Fès Ville Nouvelle",
    connectorId: "C2",
    connectorType: "Type 2 - 11kW",
    userId: "USR-004",
    userName: "Fatima Zahra",
    authMode: "prepaid",
    status: "completed",
    startTime: "2024-12-03T11:30:00Z",
    endTime: "2024-12-03T12:22:00Z",
    energyKwh: 8.5,
    costTotal: 42.5,
    currency: "MAD",
    ocppTransactionId: "TXN-005-MNO",
    createdAt: "2024-12-03T11:29:00Z",
  },
  {
    id: "SES-006",
    stationId: "STN-001",
    stationName: "Casa Marina Mall",
    connectorId: "C3",
    connectorType: "Type 2 - 22kW",
    userId: "USR-005",
    userName: "Youssef Amrani",
    authMode: "subscription",
    status: "completed",
    startTime: "2024-12-02T16:00:00Z",
    endTime: "2024-12-02T18:30:00Z",
    energyKwh: 55.0,
    costTotal: 275.0,
    currency: "MAD",
    ocppTransactionId: "TXN-006-PQR",
    createdAt: "2024-12-02T15:59:00Z",
  },
  {
    id: "SES-007",
    stationId: "STN-002",
    stationName: "Rabat Agdal",
    connectorId: "C1",
    connectorType: "CCS2 - 350kW",
    userId: "USR-006",
    userName: "Amina Berrada",
    authMode: "prepaid",
    status: "failed",
    startTime: "2024-12-02T14:00:00Z",
    endTime: "2024-12-02T14:05:00Z",
    energyKwh: 0,
    costTotal: 0,
    currency: "MAD",
    ocppTransactionId: null,
    createdAt: "2024-12-02T13:59:00Z",
  },
  {
    id: "SES-008",
    stationId: "STN-003",
    stationName: "Marrakech Guéliz",
    connectorId: "C3",
    connectorType: "CCS2 - 50kW",
    userId: "USR-007",
    userName: "Karim Tazi",
    authMode: "operator_override",
    status: "starting",
    startTime: "2024-12-03T15:30:00Z",
    endTime: null,
    energyKwh: 0,
    costTotal: 0,
    currency: "MAD",
    ocppTransactionId: null,
    createdAt: "2024-12-03T15:29:00Z",
  },
  {
    id: "SES-009",
    stationId: "STN-004",
    stationName: "Tanger Med Port",
    connectorId: "C2",
    connectorType: "CCS2 - 350kW",
    userId: "USR-008",
    userName: "Leila Fassi",
    authMode: "subscription",
    status: "completed",
    startTime: "2024-12-02T09:00:00Z",
    endTime: "2024-12-02T09:25:00Z",
    energyKwh: 85.0,
    costTotal: 510.0,
    currency: "MAD",
    ocppTransactionId: "TXN-009-STU",
    createdAt: "2024-12-02T08:59:00Z",
  },
  {
    id: "SES-010",
    stationId: "STN-005",
    stationName: "Fès Ville Nouvelle",
    connectorId: "C1",
    connectorType: "Type 2 - 22kW",
    userId: "USR-009",
    userName: "Omar Benjelloun",
    authMode: "prepaid",
    status: "refunded",
    startTime: "2024-12-01T17:00:00Z",
    endTime: "2024-12-01T17:15:00Z",
    energyKwh: 5.5,
    costTotal: 27.5,
    currency: "MAD",
    ocppTransactionId: "TXN-010-VWX",
    createdAt: "2024-12-01T16:59:00Z",
  },
]

export const sessionStatusLabels: Record<SessionStatus, string> = {
  initiated: "Initiated",
  awaiting_payment: "Awaiting Payment",
  authorized: "Authorized",
  awaiting_plug: "Awaiting Plug",
  awaiting_operator: "Awaiting Operator",
  starting: "Starting",
  charging: "Charging",
  stopping: "Stopping",
  completed: "Completed",
  captured: "Captured",
  failed: "Failed",
  refunded: "Refunded",
}
