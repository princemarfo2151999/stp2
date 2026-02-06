"use client"

import useSWR from "swr"

export interface StationConnector {
  id: string
  station_id: string
  connector_number: number
  connector_type: string | null
  power_kw: number | null
  status: string
  current_session_id: string | null
  last_status_change: string
  created_at: string
}

export interface Station {
  id: string
  name: string
  status: string
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  latitude: number | null
  longitude: number | null
  power_output_kw: number | null
  connector_types: string[] | null
  network: string | null
  operating_hours: string | null
  pricing_model: string | null
  price_per_kwh: number | null
  created_at: string
  updated_at: string
  connectors: StationConnector[]
}

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export function useStations() {
  const { data, error, isLoading, mutate } = useSWR<Station[]>("/api/stations", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  })

  const addStation = async (stationData: Partial<Station>) => {
    const res = await fetch("/api/stations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(stationData),
    })
    if (!res.ok) throw new Error("Failed to add station")
    await mutate()
    return res.json()
  }

  const updateStation = async (id: string, updates: Partial<Station>) => {
    const res = await fetch("/api/stations", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...updates }),
    })
    if (!res.ok) throw new Error("Failed to update station")
    await mutate()
    return res.json()
  }

  const deleteStation = async (id: string) => {
    const res = await fetch(`/api/stations?id=${id}`, {
      method: "DELETE",
    })
    if (!res.ok) throw new Error("Failed to delete station")
    await mutate()
  }

  return {
    stations: data || [],
    isLoading,
    isError: !!error,
    error,
    mutate,
    addStation,
    updateStation,
    deleteStation,
  }
}
