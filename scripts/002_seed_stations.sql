-- Seed stations data (Morocco EV charging stations)
INSERT INTO public.stations (id, name, address, city, region, country, latitude, longitude, status, power_type, max_power, is_public, amenities, price_per_kwh, operating_hours)
VALUES
  ('STN-001', 'Casa Marina Mall', 'Boulevard de la Corniche, Ain Diab', 'Casablanca', 'Casablanca-Settat', 'Morocco', 33.5975, -7.6698, 'online', 'AC/DC', 150, true, '["WiFi", "Restroom", "Coffee Shop", "Shopping"]', 5.0, '24/7'),
  ('STN-002', 'Rabat Agdal Station', 'Avenue de France, Agdal', 'Rabat', 'Rabat-Sale-Kenitra', 'Morocco', 33.9911, -6.8498, 'online', 'DC', 350, true, '["WiFi", "Restroom", "Parking"]', 6.0, '06:00 - 23:00'),
  ('STN-003', 'Marrakech Gueliz', 'Avenue Mohammed V, Gueliz', 'Marrakech', 'Marrakech-Safi', 'Morocco', 31.6295, -7.9811, 'online', 'AC/DC', 50, true, '["WiFi", "Restaurant", "Hotel"]', 4.5, '24/7'),
  ('STN-004', 'Tanger Med Port', 'Zone Portuaire, Tanger Med', 'Tanger', 'Tanger-Tetouan-Al Hoceima', 'Morocco', 35.8835, -5.5084, 'online', 'DC', 350, true, '["WiFi", "Restroom", "Ferry Terminal"]', 5.5, '24/7'),
  ('STN-005', 'Fes Ville Nouvelle', 'Avenue Hassan II', 'Fes', 'Fes-Meknes', 'Morocco', 34.0346, -5.0145, 'online', 'AC', 22, true, '["WiFi", "Parking", "Shopping"]', 4.0, '07:00 - 22:00'),
  ('STN-006', 'Agadir Beach Resort', 'Boulevard Mohammed V, Secteur Balneaire', 'Agadir', 'Souss-Massa', 'Morocco', 30.4278, -9.5981, 'maintenance', 'DC', 150, true, '["WiFi", "Beach Access", "Hotel", "Restaurant"]', 5.0, '24/7')
ON CONFLICT (id) DO NOTHING;

-- Seed connectors for each station
INSERT INTO public.connectors (id, station_id, connector_number, connector_type, power_kw, status)
VALUES
  -- Casa Marina Mall (STN-001)
  ('C-001-1', 'STN-001', 1, 'CCS2', 150, 'available'),
  ('C-001-2', 'STN-001', 2, 'CHAdeMO', 50, 'charging'),
  ('C-001-3', 'STN-001', 3, 'Type 2', 22, 'available'),
  ('C-001-4', 'STN-001', 4, 'Type 2', 22, 'available'),
  -- Rabat Agdal (STN-002)
  ('C-002-1', 'STN-002', 1, 'CCS2', 350, 'available'),
  ('C-002-2', 'STN-002', 2, 'CCS2', 350, 'charging'),
  -- Marrakech Gueliz (STN-003)
  ('C-003-1', 'STN-003', 1, 'Type 2', 22, 'available'),
  ('C-003-2', 'STN-003', 2, 'Type 2', 11, 'unavailable'),
  ('C-003-3', 'STN-003', 3, 'CCS2', 50, 'available'),
  -- Tanger Med (STN-004)
  ('C-004-1', 'STN-004', 1, 'CCS2', 350, 'available'),
  ('C-004-2', 'STN-004', 2, 'CCS2', 350, 'available'),
  ('C-004-3', 'STN-004', 3, 'CHAdeMO', 50, 'available'),
  -- Fes Ville Nouvelle (STN-005)
  ('C-005-1', 'STN-005', 1, 'Type 2', 22, 'charging'),
  ('C-005-2', 'STN-005', 2, 'Type 2', 22, 'available'),
  -- Agadir Beach (STN-006)
  ('C-006-1', 'STN-006', 1, 'CCS2', 150, 'unavailable')
ON CONFLICT (id) DO NOTHING;
