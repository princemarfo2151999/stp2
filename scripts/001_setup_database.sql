-- Drop existing tables to start fresh
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.connectors CASCADE;
DROP TABLE IF EXISTS public.stations CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- Drop existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create profiles table with role-based access
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT,
  last_name TEXT,
  role TEXT NOT NULL DEFAULT 'driver' CHECK (role IN ('platform_admin', 'cpo_admin', 'operator', 'driver')),
  organization_id TEXT,
  organization_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_select" ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'platform_admin'
    )
  );

-- Auto-create profile on signup trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, first_name, last_name, role, organization_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'driver'),
    CASE
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'driver') = 'platform_admin' THEN 'watt.ma Platform'
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'driver') = 'cpo_admin' THEN 'CPO Organization'
      WHEN COALESCE(NEW.raw_user_meta_data ->> 'role', 'driver') = 'operator' THEN 'CPO Organization'
      ELSE 'Personal'
    END
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Create stations table
CREATE TABLE public.stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  region TEXT,
  country TEXT DEFAULT 'Morocco',
  latitude DOUBLE PRECISION NOT NULL,
  longitude DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'maintenance', 'coming_soon')),
  power_type TEXT CHECK (power_type IN ('AC', 'DC', 'AC/DC')),
  max_power DOUBLE PRECISION,
  operator_id UUID REFERENCES auth.users(id),
  ocpp_identity TEXT,
  model TEXT,
  manufacturer TEXT,
  serial_number TEXT,
  firmware_version TEXT,
  installation_date TIMESTAMPTZ,
  last_heartbeat TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT TRUE,
  amenities JSONB,
  opening_hours JSONB,
  images JSONB,
  price_per_kwh DOUBLE PRECISION DEFAULT 5.0,
  operating_hours TEXT DEFAULT '24/7',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "stations_public_read" ON public.stations FOR SELECT USING (true);
CREATE POLICY "stations_auth_insert" ON public.stations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "stations_auth_update" ON public.stations FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "stations_auth_delete" ON public.stations FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create connectors table
CREATE TABLE public.connectors (
  id TEXT PRIMARY KEY,
  station_id TEXT NOT NULL REFERENCES public.stations(id) ON DELETE CASCADE,
  connector_number INTEGER NOT NULL,
  connector_type TEXT CHECK (connector_type IN ('Type 2', 'CCS2', 'CHAdeMO', 'Type 1', 'CCS1', 'Tesla')),
  power_kw DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'charging', 'occupied', 'faulted', 'unavailable')),
  current_session_id TEXT,
  last_status_change TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.connectors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "connectors_public_read" ON public.connectors FOR SELECT USING (true);
CREATE POLICY "connectors_auth_insert" ON public.connectors FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "connectors_auth_update" ON public.connectors FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "connectors_auth_delete" ON public.connectors FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create settings table
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  key TEXT NOT NULL,
  value JSONB NOT NULL DEFAULT '{}',
  organization_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(category, key, organization_id)
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_auth_read" ON public.settings FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "settings_auth_insert" ON public.settings FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "settings_auth_update" ON public.settings FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "settings_auth_delete" ON public.settings FOR DELETE USING (auth.uid() IS NOT NULL);
