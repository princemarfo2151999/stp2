-- watt.ma CPMS Database Schema
-- This creates all tables needed for the EV charging management system

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =====================
-- PROFILES TABLE
-- =====================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  first_name text,
  last_name text,
  phone text,
  role text default 'driver' check (role in ('admin', 'operator', 'driver')),
  company text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);
-- Admins can see all profiles
create policy "profiles_admin_select" on public.profiles for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- =====================
-- STATIONS TABLE
-- =====================
create table if not exists public.stations (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  address text not null,
  city text not null,
  region text,
  country text default 'Morocco',
  latitude decimal(10, 8) not null,
  longitude decimal(11, 8) not null,
  status text default 'offline' check (status in ('online', 'offline', 'maintenance', 'coming_soon')),
  power_type text check (power_type in ('AC', 'DC', 'AC/DC')),
  max_power decimal(10, 2),
  operator_id uuid references public.profiles(id),
  ocpp_identity text unique,
  model text,
  manufacturer text,
  serial_number text,
  firmware_version text,
  installation_date date,
  last_heartbeat timestamp with time zone,
  is_public boolean default true,
  amenities text[],
  opening_hours jsonb,
  images text[],
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  created_by uuid references auth.users(id)
);

alter table public.stations enable row level security;

-- Public can view public stations
create policy "stations_public_select" on public.stations for select using (is_public = true);
-- Authenticated users can view all stations
create policy "stations_auth_select" on public.stations for select using (auth.uid() is not null);
-- Admins and operators can manage stations
create policy "stations_admin_insert" on public.stations for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
);
create policy "stations_admin_update" on public.stations for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
);
create policy "stations_admin_delete" on public.stations for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- =====================
-- CONNECTORS TABLE
-- =====================
create table if not exists public.connectors (
  id uuid primary key default uuid_generate_v4(),
  station_id uuid references public.stations(id) on delete cascade,
  connector_number integer not null,
  connector_type text check (connector_type in ('Type 2', 'CCS2', 'CHAdeMO', 'Type 1', 'CCS1', 'Tesla')),
  power_kw decimal(10, 2),
  status text default 'available' check (status in ('available', 'charging', 'occupied', 'faulted', 'unavailable')),
  current_session_id uuid,
  last_status_change timestamp with time zone default now(),
  created_at timestamp with time zone default now(),
  unique(station_id, connector_number)
);

alter table public.connectors enable row level security;

create policy "connectors_public_select" on public.connectors for select using (true);
create policy "connectors_admin_insert" on public.connectors for insert with check (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
);
create policy "connectors_admin_update" on public.connectors for update using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
);
create policy "connectors_admin_delete" on public.connectors for delete using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- =====================
-- CHARGING SESSIONS TABLE
-- =====================
create table if not exists public.sessions (
  id uuid primary key default uuid_generate_v4(),
  station_id uuid references public.stations(id),
  connector_id uuid references public.connectors(id),
  user_id uuid references auth.users(id),
  transaction_id text unique,
  status text default 'active' check (status in ('active', 'completed', 'failed', 'stopped')),
  start_time timestamp with time zone default now(),
  end_time timestamp with time zone,
  energy_kwh decimal(10, 3) default 0,
  duration_minutes integer default 0,
  cost decimal(10, 2) default 0,
  currency text default 'MAD',
  tariff_id uuid,
  payment_method text check (payment_method in ('wallet', 'cmi', 'stripe', 'rfid', 'free')),
  payment_status text default 'pending' check (payment_status in ('pending', 'authorized', 'captured', 'failed', 'refunded')),
  payment_reference text,
  meter_start integer,
  meter_stop integer,
  stop_reason text,
  vehicle_info jsonb,
  created_at timestamp with time zone default now()
);

alter table public.sessions enable row level security;

-- Users can see their own sessions
create policy "sessions_user_select" on public.sessions for select using (auth.uid() = user_id);
-- Admins can see all sessions
create policy "sessions_admin_select" on public.sessions for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
);
-- System can create sessions (via service role)
create policy "sessions_insert" on public.sessions for insert with check (auth.uid() is not null);
create policy "sessions_update" on public.sessions for update using (
  auth.uid() = user_id or exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
);

-- =====================
-- TARIFFS TABLE
-- =====================
create table if not exists public.tariffs (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  tariff_type text default 'flat' check (tariff_type in ('flat', 'time_of_use', 'dynamic')),
  price_per_kwh decimal(10, 4) not null,
  currency text default 'MAD',
  connection_fee decimal(10, 2) default 0,
  idle_fee_per_minute decimal(10, 4) default 0,
  time_blocks jsonb, -- For time-of-use tariffs
  is_active boolean default true,
  applies_to_power_type text check (applies_to_power_type in ('AC', 'DC', 'all')),
  min_power_kw decimal(10, 2),
  max_power_kw decimal(10, 2),
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.tariffs enable row level security;

create policy "tariffs_public_select" on public.tariffs for select using (is_active = true);
create policy "tariffs_admin_all" on public.tariffs for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- =====================
-- PAYMENTS TABLE
-- =====================
create table if not exists public.payments (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid references public.sessions(id),
  user_id uuid references auth.users(id),
  amount decimal(10, 2) not null,
  currency text default 'MAD',
  payment_method text not null check (payment_method in ('cmi', 'stripe', 'wallet', 'rfid')),
  payment_provider text,
  provider_reference text,
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'refunded')),
  error_message text,
  metadata jsonb,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.payments enable row level security;

create policy "payments_user_select" on public.payments for select using (auth.uid() = user_id);
create policy "payments_admin_select" on public.payments for select using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
);
create policy "payments_insert" on public.payments for insert with check (auth.uid() is not null);

-- =====================
-- WALLETS TABLE
-- =====================
create table if not exists public.wallets (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) unique,
  balance decimal(10, 2) default 0,
  currency text default 'MAD',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.wallets enable row level security;

create policy "wallets_user_select" on public.wallets for select using (auth.uid() = user_id);
create policy "wallets_user_update" on public.wallets for update using (auth.uid() = user_id);

-- =====================
-- WALLET TRANSACTIONS TABLE
-- =====================
create table if not exists public.wallet_transactions (
  id uuid primary key default uuid_generate_v4(),
  wallet_id uuid references public.wallets(id),
  user_id uuid references auth.users(id),
  amount decimal(10, 2) not null,
  transaction_type text check (transaction_type in ('topup', 'charge', 'refund', 'bonus')),
  reference_id uuid,
  description text,
  created_at timestamp with time zone default now()
);

alter table public.wallet_transactions enable row level security;

create policy "wallet_transactions_user_select" on public.wallet_transactions for select using (auth.uid() = user_id);

-- =====================
-- RFID TAGS TABLE
-- =====================
create table if not exists public.rfid_tags (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id),
  tag_id text unique not null,
  tag_name text,
  is_active boolean default true,
  created_at timestamp with time zone default now()
);

alter table public.rfid_tags enable row level security;

create policy "rfid_tags_user_select" on public.rfid_tags for select using (auth.uid() = user_id);
create policy "rfid_tags_admin_all" on public.rfid_tags for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role in ('admin', 'operator'))
);

-- =====================
-- SETTINGS TABLE
-- =====================
create table if not exists public.settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb not null,
  category text,
  updated_at timestamp with time zone default now(),
  updated_by uuid references auth.users(id)
);

alter table public.settings enable row level security;

create policy "settings_public_select" on public.settings for select using (true);
create policy "settings_admin_all" on public.settings for all using (
  exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
);

-- =====================
-- AUTO-CREATE PROFILE TRIGGER
-- =====================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, first_name, last_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'first_name', null),
    coalesce(new.raw_user_meta_data ->> 'last_name', null),
    coalesce(new.raw_user_meta_data ->> 'role', 'driver')
  )
  on conflict (id) do nothing;

  -- Create wallet for new user
  insert into public.wallets (user_id)
  values (new.id)
  on conflict (user_id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

-- =====================
-- UPDATED_AT TRIGGER
-- =====================
create or replace function public.handle_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger stations_updated_at before update on public.stations
  for each row execute function public.handle_updated_at();

create trigger tariffs_updated_at before update on public.tariffs
  for each row execute function public.handle_updated_at();

create trigger payments_updated_at before update on public.payments
  for each row execute function public.handle_updated_at();

create trigger wallets_updated_at before update on public.wallets
  for each row execute function public.handle_updated_at();

-- =====================
-- INDEXES
-- =====================
create index if not exists idx_stations_location on public.stations(latitude, longitude);
create index if not exists idx_stations_status on public.stations(status);
create index if not exists idx_sessions_user on public.sessions(user_id);
create index if not exists idx_sessions_station on public.sessions(station_id);
create index if not exists idx_sessions_status on public.sessions(status);
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_connectors_station on public.connectors(station_id);
