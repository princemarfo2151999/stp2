"use client"

import { create } from "zustand"
import { type Station, mockStations } from "@/lib/data/stations"

interface StationsState {
  stations: Station[]
  isLoading: boolean
  error: string | null
  
  // Actions
  addStation: (station: Omit<Station, "id" | "createdAt" | "updatedAt">) => void
  updateStation: (id: string, updates: Partial<Station>) => void
  deleteStation: (id: string) => void
  getStation: (id: string) => Station | undefined
}

export const useStationsStore = create<StationsState>((set, get) => ({
  stations: mockStations,
  isLoading: false,
  error: null,

  addStation: (stationData) => {
    const newStation: Station = {
      ...stationData,
      id: `STN-${String(get().stations.length + 1).padStart(3, "0")}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    set((state) => ({
      stations: [...state.stations, newStation],
    }))
  },

  updateStation: (id, updates) => {
    set((state) => ({
      stations: state.stations.map((station) =>
        station.id === id
          ? { ...station, ...updates, updatedAt: new Date().toISOString() }
          : station
      ),
    }))
  },

  deleteStation: (id) => {
    set((state) => ({
      stations: state.stations.filter((station) => station.id !== id),
    }))
  },

  getStation: (id) => {
    return get().stations.find((station) => station.id === id)
  },
}))
