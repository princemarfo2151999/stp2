// Database types generated from SQL schema
// These types match the tables in scripts/001_create_wattma_schema.sql

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string | null
          first_name: string | null
          last_name: string | null
          phone: string | null
          role: 'admin' | 'operator' | 'driver'
          company: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: 'admin' | 'operator' | 'driver'
          company?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string | null
          first_name?: string | null
          last_name?: string | null
          phone?: string | null
          role?: 'admin' | 'operator' | 'driver'
          company?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
      }
      stations: {
        Row: {
          id: string
          name: string
          address: string
          city: string
          region: string | null
          country: string
          latitude: number
          longitude: number
          status: 'online' | 'offline' | 'maintenance' | 'coming_soon'
          power_type: 'AC' | 'DC' | 'AC/DC' | null
          max_power: number | null
          operator_id: string | null
          ocpp_identity: string | null
          model: string | null
          manufacturer: string | null
          serial_number: string | null
          firmware_version: string | null
          installation_date: string | null
          last_heartbeat: string | null
          is_public: boolean
          amenities: string[] | null
          opening_hours: Json | null
          images: string[] | null
          created_at: string
          updated_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          name: string
          address: string
          city: string
          region?: string | null
          country?: string
          latitude: number
          longitude: number
          status?: 'online' | 'offline' | 'maintenance' | 'coming_soon'
          power_type?: 'AC' | 'DC' | 'AC/DC' | null
          max_power?: number | null
          operator_id?: string | null
          ocpp_identity?: string | null
          model?: string | null
          manufacturer?: string | null
          serial_number?: string | null
          firmware_version?: string | null
          installation_date?: string | null
          last_heartbeat?: string | null
          is_public?: boolean
          amenities?: string[] | null
          opening_hours?: Json | null
          images?: string[] | null
          created_at?: string
          updated_at?: string
          created_by?: string | null
        }
        Update: {
          name?: string
          address?: string
          city?: string
          region?: string | null
          country?: string
          latitude?: number
          longitude?: number
          status?: 'online' | 'offline' | 'maintenance' | 'coming_soon'
          power_type?: 'AC' | 'DC' | 'AC/DC' | null
          max_power?: number | null
          operator_id?: string | null
          ocpp_identity?: string | null
          model?: string | null
          manufacturer?: string | null
          serial_number?: string | null
          firmware_version?: string | null
          installation_date?: string | null
          last_heartbeat?: string | null
          is_public?: boolean
          amenities?: string[] | null
          opening_hours?: Json | null
          images?: string[] | null
          updated_at?: string
        }
      }
      connectors: {
        Row: {
          id: string
          station_id: string
          connector_number: number
          connector_type: 'Type 2' | 'CCS2' | 'CHAdeMO' | 'Type 1' | 'CCS1' | 'Tesla' | null
          power_kw: number | null
          status: 'available' | 'charging' | 'occupied' | 'faulted' | 'unavailable'
          current_session_id: string | null
          last_status_change: string
          created_at: string
        }
        Insert: {
          id?: string
          station_id: string
          connector_number: number
          connector_type?: 'Type 2' | 'CCS2' | 'CHAdeMO' | 'Type 1' | 'CCS1' | 'Tesla' | null
          power_kw?: number | null
          status?: 'available' | 'charging' | 'occupied' | 'faulted' | 'unavailable'
          current_session_id?: string | null
          last_status_change?: string
          created_at?: string
        }
        Update: {
          station_id?: string
          connector_number?: number
          connector_type?: 'Type 2' | 'CCS2' | 'CHAdeMO' | 'Type 1' | 'CCS1' | 'Tesla' | null
          power_kw?: number | null
          status?: 'available' | 'charging' | 'occupied' | 'faulted' | 'unavailable'
          current_session_id?: string | null
          last_status_change?: string
        }
      }
      sessions: {
        Row: {
          id: string
          station_id: string | null
          connector_id: string | null
          user_id: string | null
          transaction_id: string | null
          status: 'active' | 'completed' | 'failed' | 'stopped'
          start_time: string
          end_time: string | null
          energy_kwh: number
          duration_minutes: number
          cost: number
          currency: string
          tariff_id: string | null
          payment_method: 'wallet' | 'cmi' | 'stripe' | 'rfid' | 'free' | 'youcan' | null
          payment_status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
          payment_reference: string | null
          meter_start: number | null
          meter_stop: number | null
          stop_reason: string | null
          vehicle_info: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          station_id?: string | null
          connector_id?: string | null
          user_id?: string | null
          transaction_id?: string | null
          status?: 'active' | 'completed' | 'failed' | 'stopped'
          start_time?: string
          end_time?: string | null
          energy_kwh?: number
          duration_minutes?: number
          cost?: number
          currency?: string
          tariff_id?: string | null
          payment_method?: 'wallet' | 'cmi' | 'stripe' | 'rfid' | 'free' | 'youcan' | null
          payment_status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
          payment_reference?: string | null
          meter_start?: number | null
          meter_stop?: number | null
          stop_reason?: string | null
          vehicle_info?: Json | null
          created_at?: string
        }
        Update: {
          station_id?: string | null
          connector_id?: string | null
          user_id?: string | null
          transaction_id?: string | null
          status?: 'active' | 'completed' | 'failed' | 'stopped'
          start_time?: string
          end_time?: string | null
          energy_kwh?: number
          duration_minutes?: number
          cost?: number
          currency?: string
          tariff_id?: string | null
          payment_method?: 'wallet' | 'cmi' | 'stripe' | 'rfid' | 'free' | 'youcan' | null
          payment_status?: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded'
          payment_reference?: string | null
          meter_start?: number | null
          meter_stop?: number | null
          stop_reason?: string | null
          vehicle_info?: Json | null
        }
      }
      tariffs: {
        Row: {
          id: string
          name: string
          description: string | null
          tariff_type: 'flat' | 'time_of_use' | 'dynamic'
          price_per_kwh: number
          currency: string
          connection_fee: number
          idle_fee_per_minute: number
          time_blocks: Json | null
          is_active: boolean
          applies_to_power_type: 'AC' | 'DC' | 'all' | null
          min_power_kw: number | null
          max_power_kw: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          tariff_type?: 'flat' | 'time_of_use' | 'dynamic'
          price_per_kwh: number
          currency?: string
          connection_fee?: number
          idle_fee_per_minute?: number
          time_blocks?: Json | null
          is_active?: boolean
          applies_to_power_type?: 'AC' | 'DC' | 'all' | null
          min_power_kw?: number | null
          max_power_kw?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          description?: string | null
          tariff_type?: 'flat' | 'time_of_use' | 'dynamic'
          price_per_kwh?: number
          currency?: string
          connection_fee?: number
          idle_fee_per_minute?: number
          time_blocks?: Json | null
          is_active?: boolean
          applies_to_power_type?: 'AC' | 'DC' | 'all' | null
          min_power_kw?: number | null
          max_power_kw?: number | null
          updated_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          session_id: string | null
          user_id: string | null
          amount: number
          currency: string
          payment_method: 'cmi' | 'stripe' | 'wallet' | 'rfid' | 'youcan'
          payment_provider: string | null
          provider_reference: string | null
          status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          error_message: string | null
          metadata: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          session_id?: string | null
          user_id?: string | null
          amount: number
          currency?: string
          payment_method: 'cmi' | 'stripe' | 'wallet' | 'rfid' | 'youcan'
          payment_provider?: string | null
          provider_reference?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          error_message?: string | null
          metadata?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          session_id?: string | null
          user_id?: string | null
          amount?: number
          currency?: string
          payment_method?: 'cmi' | 'stripe' | 'wallet' | 'rfid' | 'youcan'
          payment_provider?: string | null
          provider_reference?: string | null
          status?: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
          error_message?: string | null
          metadata?: Json | null
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance: number
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          balance?: number
          currency?: string
          updated_at?: string
        }
      }
      wallet_transactions: {
        Row: {
          id: string
          wallet_id: string | null
          user_id: string | null
          amount: number
          transaction_type: 'topup' | 'charge' | 'refund' | 'bonus'
          reference_id: string | null
          description: string | null
          created_at: string
        }
        Insert: {
          id?: string
          wallet_id?: string | null
          user_id?: string | null
          amount: number
          transaction_type: 'topup' | 'charge' | 'refund' | 'bonus'
          reference_id?: string | null
          description?: string | null
          created_at?: string
        }
        Update: {
          wallet_id?: string | null
          user_id?: string | null
          amount?: number
          transaction_type?: 'topup' | 'charge' | 'refund' | 'bonus'
          reference_id?: string | null
          description?: string | null
        }
      }
      rfid_tags: {
        Row: {
          id: string
          user_id: string | null
          tag_id: string
          tag_name: string | null
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          tag_id: string
          tag_name?: string | null
          is_active?: boolean
          created_at?: string
        }
        Update: {
          user_id?: string | null
          tag_id?: string
          tag_name?: string | null
          is_active?: boolean
        }
      }
      settings: {
        Row: {
          id: string
          key: string
          value: Json
          category: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          key: string
          value: Json
          category?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          key?: string
          value?: Json
          category?: string | null
          updated_at?: string
          updated_by?: string | null
        }
      }
    }
  }
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Station = Database['public']['Tables']['stations']['Row']
export type Connector = Database['public']['Tables']['connectors']['Row']
export type Session = Database['public']['Tables']['sessions']['Row']
export type Tariff = Database['public']['Tables']['tariffs']['Row']
export type Payment = Database['public']['Tables']['payments']['Row']
export type Wallet = Database['public']['Tables']['wallets']['Row']
export type WalletTransaction = Database['public']['Tables']['wallet_transactions']['Row']
export type RfidTag = Database['public']['Tables']['rfid_tags']['Row']
export type Setting = Database['public']['Tables']['settings']['Row']

// Insert types
export type StationInsert = Database['public']['Tables']['stations']['Insert']
export type ConnectorInsert = Database['public']['Tables']['connectors']['Insert']
export type SessionInsert = Database['public']['Tables']['sessions']['Insert']
export type TariffInsert = Database['public']['Tables']['tariffs']['Insert']

// Update types
export type StationUpdate = Database['public']['Tables']['stations']['Update']
export type ConnectorUpdate = Database['public']['Tables']['connectors']['Update']
export type SessionUpdate = Database['public']['Tables']['sessions']['Update']
export type TariffUpdate = Database['public']['Tables']['tariffs']['Update']

// Station with connectors joined
export type StationWithConnectors = Station & {
  connectors: Connector[]
}
