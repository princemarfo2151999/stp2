-- watt.ma CPMS Database Schema for MariaDB
-- This creates all tables needed for the EV charging management system

-- =====================
-- USERS TABLE (replaces auth.users from Supabase)
-- =====================
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================
-- PROFILES TABLE
-- =====================
CREATE TABLE IF NOT EXISTS profiles (
  id CHAR(36) PRIMARY KEY,
  email VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  phone VARCHAR(50),
  role ENUM('admin', 'operator', 'driver') DEFAULT 'driver',
  company VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_email ON profiles(email);

-- =====================
-- STATIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS stations (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  address TEXT NOT NULL,
  city VARCHAR(100) NOT NULL,
  region VARCHAR(100),
  country VARCHAR(100) DEFAULT 'Morocco',
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  status ENUM('online', 'offline', 'maintenance', 'coming_soon') DEFAULT 'offline',
  power_type ENUM('AC', 'DC', 'AC/DC'),
  max_power DECIMAL(10, 2),
  operator_id CHAR(36),
  ocpp_identity VARCHAR(255) UNIQUE,
  model VARCHAR(255),
  manufacturer VARCHAR(255),
  serial_number VARCHAR(255),
  firmware_version VARCHAR(50),
  installation_date DATE,
  last_heartbeat TIMESTAMP NULL,
  is_public BOOLEAN DEFAULT TRUE,
  amenities JSON,
  opening_hours JSON,
  images JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  created_by CHAR(36),
  FOREIGN KEY (operator_id) REFERENCES profiles(id),
  FOREIGN KEY (created_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_stations_location ON stations(latitude, longitude);
CREATE INDEX idx_stations_status ON stations(status);
CREATE INDEX idx_stations_city ON stations(city);
CREATE INDEX idx_stations_operator ON stations(operator_id);

-- =====================
-- CONNECTORS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS connectors (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  station_id CHAR(36) NOT NULL,
  connector_number INT NOT NULL,
  connector_type ENUM('Type 2', 'CCS2', 'CHAdeMO', 'Type 1', 'CCS1', 'Tesla'),
  power_kw DECIMAL(10, 2),
  status ENUM('available', 'charging', 'occupied', 'faulted', 'unavailable') DEFAULT 'available',
  current_session_id CHAR(36),
  last_status_change TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (station_id) REFERENCES stations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_station_connector (station_id, connector_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_connectors_station ON connectors(station_id);
CREATE INDEX idx_connectors_status ON connectors(status);

-- =====================
-- CHARGING SESSIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS sessions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  station_id CHAR(36),
  connector_id CHAR(36),
  user_id CHAR(36),
  transaction_id VARCHAR(255) UNIQUE,
  status ENUM('active', 'completed', 'failed', 'stopped') DEFAULT 'active',
  start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_time TIMESTAMP NULL,
  energy_kwh DECIMAL(10, 3) DEFAULT 0,
  duration_minutes INT DEFAULT 0,
  cost DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'MAD',
  tariff_id CHAR(36),
  payment_method ENUM('wallet', 'cmi', 'stripe', 'rfid', 'free', 'youcan'),
  payment_status ENUM('pending', 'authorized', 'captured', 'failed', 'refunded') DEFAULT 'pending',
  payment_reference VARCHAR(255),
  meter_start INT,
  meter_stop INT,
  stop_reason VARCHAR(255),
  vehicle_info JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (station_id) REFERENCES stations(id),
  FOREIGN KEY (connector_id) REFERENCES connectors(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_sessions_user ON sessions(user_id);
CREATE INDEX idx_sessions_station ON sessions(station_id);
CREATE INDEX idx_sessions_status ON sessions(status);
CREATE INDEX idx_sessions_start_time ON sessions(start_time);

-- =====================
-- TARIFFS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS tariffs (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  tariff_type ENUM('flat', 'time_of_use', 'dynamic') DEFAULT 'flat',
  price_per_kwh DECIMAL(10, 4) NOT NULL,
  currency VARCHAR(10) DEFAULT 'MAD',
  connection_fee DECIMAL(10, 2) DEFAULT 0,
  idle_fee_per_minute DECIMAL(10, 4) DEFAULT 0,
  time_blocks JSON,
  is_active BOOLEAN DEFAULT TRUE,
  applies_to_power_type ENUM('AC', 'DC', 'all'),
  min_power_kw DECIMAL(10, 2),
  max_power_kw DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_tariffs_active ON tariffs(is_active);
CREATE INDEX idx_tariffs_type ON tariffs(tariff_type);

-- =====================
-- PAYMENTS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS payments (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  session_id CHAR(36),
  user_id CHAR(36),
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'MAD',
  payment_method ENUM('cmi', 'stripe', 'wallet', 'rfid', 'youcan') NOT NULL,
  payment_provider VARCHAR(50),
  provider_reference VARCHAR(255),
  status ENUM('pending', 'processing', 'completed', 'failed', 'refunded') DEFAULT 'pending',
  error_message TEXT,
  metadata JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES sessions(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_session ON payments(session_id);
CREATE INDEX idx_payments_status ON payments(status);

-- =====================
-- WALLETS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS wallets (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36) UNIQUE NOT NULL,
  balance DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'MAD',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_wallets_user ON wallets(user_id);

-- =====================
-- WALLET TRANSACTIONS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  wallet_id CHAR(36),
  user_id CHAR(36),
  amount DECIMAL(10, 2) NOT NULL,
  transaction_type ENUM('topup', 'charge', 'refund', 'bonus'),
  reference_id CHAR(36),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (wallet_id) REFERENCES wallets(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id);
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);

-- =====================
-- RFID TAGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS rfid_tags (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  user_id CHAR(36),
  tag_id VARCHAR(255) UNIQUE NOT NULL,
  tag_name VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_rfid_tags_user ON rfid_tags(user_id);
CREATE INDEX idx_rfid_tags_tag_id ON rfid_tags(tag_id);

-- =====================
-- SETTINGS TABLE
-- =====================
CREATE TABLE IF NOT EXISTS settings (
  id CHAR(36) PRIMARY KEY DEFAULT (UUID()),
  `key` VARCHAR(255) UNIQUE NOT NULL,
  `value` JSON NOT NULL,
  category VARCHAR(100),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  updated_by CHAR(36),
  FOREIGN KEY (updated_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_settings_category ON settings(category);
CREATE INDEX idx_settings_key ON settings(`key`);
