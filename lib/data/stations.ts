export interface Connector {
  id: string
  type: "CCS2" | "CHAdeMO" | "Type2" | "Type1"
  power: number // kW
  status: "available" | "charging" | "offline" | "reserved"
  currentSession?: string
}

export interface EVSE {
  id: string
  evseId: string
  connectors: Connector[]
}

export interface Station {
  id: string
  name: string
  address: string
  city: string
  latitude: number
  longitude: number
  evses: EVSE[]
  amenities: string[]
  paymentMethods: string[]
  operatingHours: string
  status: "active" | "inactive" | "maintenance"
  totalConnectors: number
  availableConnectors: number
  pricePerKwh: number
  createdAt: string
  updatedAt: string
}

// Mock data for stations
export const mockStations: Station[] = [
  {
    id: "STN-001",
    name: "Casa Marina Mall",
    address: "Boulevard de la Corniche, Ain Diab",
    city: "Casablanca",
    latitude: 33.5975,
    longitude: -7.6698,
    evses: [
      {
        id: "EVSE-001-A",
        evseId: "WATTSC*E001*A",
        connectors: [
          { id: "C1", type: "CCS2", power: 150, status: "available" },
          { id: "C2", type: "CHAdeMO", power: 50, status: "charging", currentSession: "SES-002" },
        ],
      },
      {
        id: "EVSE-001-B",
        evseId: "WATTSC*E001*B",
        connectors: [
          { id: "C3", type: "Type2", power: 22, status: "available" },
          { id: "C4", type: "Type2", power: 22, status: "available" },
        ],
      },
    ],
    amenities: ["WiFi", "Restroom", "Coffee Shop", "Shopping"],
    paymentMethods: ["Stripe", "CMI", "Cash"],
    operatingHours: "24/7",
    status: "active",
    totalConnectors: 4,
    availableConnectors: 3,
    pricePerKwh: 5.0,
    createdAt: "2024-06-15T10:00:00Z",
    updatedAt: "2024-12-01T14:30:00Z",
  },
  {
    id: "STN-002",
    name: "Rabat Agdal Station",
    address: "Avenue de France, Agdal",
    city: "Rabat",
    latitude: 33.9911,
    longitude: -6.8498,
    evses: [
      {
        id: "EVSE-002-A",
        evseId: "WATTSC*E002*A",
        connectors: [
          { id: "C1", type: "CCS2", power: 350, status: "available" },
          { id: "C2", type: "CCS2", power: 350, status: "charging" },
        ],
      },
    ],
    amenities: ["WiFi", "Restroom", "Parking"],
    paymentMethods: ["Stripe", "CMI"],
    operatingHours: "06:00 - 23:00",
    status: "active",
    totalConnectors: 2,
    availableConnectors: 1,
    pricePerKwh: 6.0,
    createdAt: "2024-07-20T08:00:00Z",
    updatedAt: "2024-11-28T09:15:00Z",
  },
  {
    id: "STN-003",
    name: "Marrakech Guéliz",
    address: "Avenue Mohammed V, Guéliz",
    city: "Marrakech",
    latitude: 31.6295,
    longitude: -7.9811,
    evses: [
      {
        id: "EVSE-003-A",
        evseId: "WATTSC*E003*A",
        connectors: [
          { id: "C1", type: "Type2", power: 22, status: "available" },
          { id: "C2", type: "Type2", power: 11, status: "offline" },
        ],
      },
      {
        id: "EVSE-003-B",
        evseId: "WATTSC*E003*B",
        connectors: [
          { id: "C3", type: "CCS2", power: 50, status: "reserved" },
        ],
      },
    ],
    amenities: ["WiFi", "Restaurant", "Hotel"],
    paymentMethods: ["Stripe"],
    operatingHours: "24/7",
    status: "active",
    totalConnectors: 3,
    availableConnectors: 1,
    pricePerKwh: 4.5,
    createdAt: "2024-08-10T12:00:00Z",
    updatedAt: "2024-12-02T16:45:00Z",
  },
  {
    id: "STN-004",
    name: "Tanger Med Port",
    address: "Zone Portuaire, Tanger Med",
    city: "Tanger",
    latitude: 35.8835,
    longitude: -5.5084,
    evses: [
      {
        id: "EVSE-004-A",
        evseId: "WATTSC*E004*A",
        connectors: [
          { id: "C1", type: "CCS2", power: 350, status: "available" },
          { id: "C2", type: "CCS2", power: 350, status: "available" },
          { id: "C3", type: "CHAdeMO", power: 50, status: "available" },
        ],
      },
    ],
    amenities: ["WiFi", "Restroom", "Ferry Terminal"],
    paymentMethods: ["Stripe", "CMI", "Cash"],
    operatingHours: "24/7",
    status: "active",
    totalConnectors: 3,
    availableConnectors: 3,
    pricePerKwh: 5.5,
    createdAt: "2024-05-01T06:00:00Z",
    updatedAt: "2024-11-30T11:20:00Z",
  },
  {
    id: "STN-005",
    name: "Fès Ville Nouvelle",
    address: "Avenue Hassan II",
    city: "Fès",
    latitude: 34.0346,
    longitude: -5.0145,
    evses: [
      {
        id: "EVSE-005-A",
        evseId: "WATTSC*E005*A",
        connectors: [
          { id: "C1", type: "Type2", power: 22, status: "charging" },
          { id: "C2", type: "Type2", power: 22, status: "available" },
        ],
      },
    ],
    amenities: ["WiFi", "Parking", "Shopping"],
    paymentMethods: ["CMI"],
    operatingHours: "07:00 - 22:00",
    status: "active",
    totalConnectors: 2,
    availableConnectors: 1,
    pricePerKwh: 4.0,
    createdAt: "2024-09-05T14:00:00Z",
    updatedAt: "2024-12-01T08:30:00Z",
  },
  {
    id: "STN-006",
    name: "Agadir Beach Resort",
    address: "Boulevard Mohammed V, Secteur Balnéaire",
    city: "Agadir",
    latitude: 30.4278,
    longitude: -9.5981,
    evses: [
      {
        id: "EVSE-006-A",
        evseId: "WATTSC*E006*A",
        connectors: [
          { id: "C1", type: "CCS2", power: 150, status: "available" },
        ],
      },
    ],
    amenities: ["WiFi", "Beach Access", "Hotel", "Restaurant"],
    paymentMethods: ["Stripe", "CMI"],
    operatingHours: "24/7",
    status: "maintenance",
    totalConnectors: 1,
    availableConnectors: 0,
    pricePerKwh: 5.0,
    createdAt: "2024-10-12T10:00:00Z",
    updatedAt: "2024-12-03T07:00:00Z",
  },
]

export const connectorTypes = ["CCS2", "CHAdeMO", "Type2", "Type1"] as const
export const amenitiesList = [
  "WiFi",
  "Restroom",
  "Coffee Shop",
  "Shopping",
  "Restaurant",
  "Hotel",
  "Parking",
  "Beach Access",
  "Ferry Terminal",
] as const
export const paymentMethodsList = ["Stripe", "CMI", "Cash"] as const
