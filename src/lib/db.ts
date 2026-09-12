import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import fs from 'node:fs';
import {
  mockLoads,
  mockDriverCounterBids,
  mockFleetTrucks,
  mockDriverAvailabilities,
  mockCommissionInvoices,
  mockKYCSubmissions,
  presetTestAccounts,
} from './mockData';

// Ensure data directory exists
const DATA_DIR = path.join(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'safarload.db');

// Global singleton for Next.js hot-reloading preservation
declare global {
  // eslint-disable-next-line no-var
  var __safarload_db__: DatabaseSync | undefined;
}

function initDatabase(): DatabaseSync {
  if (global.__safarload_db__) {
    return global.__safarload_db__;
  }

  const db = new DatabaseSync(DB_PATH);

  try {
    // 0. Set busy_timeout first so concurrent workers wait up to 5s if DB is briefly locked
    db.exec('PRAGMA busy_timeout = 5000;');
    // 1. WAL mode: massive concurrent read/write throughput without blocking readers
    db.exec('PRAGMA journal_mode = WAL;');
    // 2. synchronous = NORMAL: safe with WAL, eliminates write sync delays
    db.exec('PRAGMA synchronous = NORMAL;');
    // 3. 64MB memory page cache: queries resolve instantly from RAM
    db.exec('PRAGMA cache_size = -64000;');
    // 4. In-memory temp storage for sorts and aggregations
    db.exec('PRAGMA temp_store = MEMORY;');
    // 5. Foreign keys enforcement
    db.exec('PRAGMA foreign_keys = ON;');
    // 6. Memory mapped I/O (256MB)
    db.exec('PRAGMA mmap_size = 268435456;');
  } catch (e) {
    // Ignore transient lock during concurrent static page worker init
  }

  // Create Tables
  db.exec(`
    -- Users Table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      role TEXT NOT NULL,
      name TEXT NOT NULL,
      name_ur TEXT,
      email TEXT UNIQUE NOT NULL,
      phone TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Loads Table
    CREATE TABLE IF NOT EXISTS loads (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      pickup_city TEXT NOT NULL,
      pickup_city_ur TEXT,
      pickup_address TEXT,
      dropoff_city TEXT NOT NULL,
      dropoff_city_ur TEXT,
      dropoff_address TEXT,
      pickup_lat REAL,
      pickup_lng REAL,
      dropoff_lat REAL,
      dropoff_lng REAL,
      cargo_type TEXT NOT NULL,
      cargo_type_ur TEXT,
      cargo_icon TEXT DEFAULT '📦',
      truck_type TEXT NOT NULL,
      truck_type_ur TEXT,
      weight REAL NOT NULL,
      price REAL NOT NULL,
      price_per_km REAL,
      distance REAL,
      estimated_hours REAL,
      pickup_date TEXT NOT NULL,
      pickup_time TEXT,
      special_requirements TEXT, -- JSON string array
      shipper_name TEXT NOT NULL,
      shipper_rating REAL DEFAULT 5.0,
      shipper_loads INTEGER DEFAULT 0,
      shipper_verified INTEGER DEFAULT 1,
      status TEXT NOT NULL DEFAULT 'posted', -- 'posted' | 'booked' | 'in_transit' | 'completed' | 'cancelled'
      posted_ago TEXT,
      bids_count INTEGER DEFAULT 0,
      is_urgent INTEGER DEFAULT 0,
      is_book_now INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Bids Table
    CREATE TABLE IF NOT EXISTS bids (
      id TEXT PRIMARY KEY,
      load_id TEXT NOT NULL,
      load_title TEXT,
      route TEXT,
      shipper_name TEXT,
      driver_name TEXT NOT NULL,
      driver_name_ur TEXT,
      driver_phone TEXT NOT NULL,
      driver_rating REAL DEFAULT 5.0,
      driver_trips INTEGER DEFAULT 0,
      truck_number TEXT NOT NULL,
      truck_type TEXT NOT NULL,
      original_price REAL NOT NULL,
      offered_bid_price REAL NOT NULL,
      bid_message TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'accepted' | 'rejected' | 'countered'
      submitted_time TEXT,
      shipper_counter_price REAL,
      shipper_counter_note TEXT,
      last_updated_by TEXT DEFAULT 'driver',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (load_id) REFERENCES loads(id) ON DELETE CASCADE
    );

    -- Fleet Trucks Table
    CREATE TABLE IF NOT EXISTS fleet_trucks (
      id TEXT PRIMARY KEY,
      registration_number TEXT UNIQUE NOT NULL,
      type TEXT NOT NULL,
      type_ur TEXT,
      type_icon TEXT DEFAULT '🚛',
      driver_name TEXT NOT NULL,
      driver_name_ur TEXT,
      status TEXT NOT NULL DEFAULT 'active', -- 'active' | 'idle' | 'maintenance'
      current_city TEXT NOT NULL,
      current_city_ur TEXT,
      lat REAL,
      lng REAL,
      fuel_level INTEGER DEFAULT 100,
      last_maintenance TEXT,
      next_maintenance TEXT,
      total_km REAL DEFAULT 0,
      current_load TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Driver Availabilities Table (Return-Trip Radar)
    CREATE TABLE IF NOT EXISTS driver_availabilities (
      id TEXT PRIMARY KEY,
      driver_name TEXT NOT NULL,
      driver_name_ur TEXT,
      driver_phone TEXT NOT NULL,
      driver_rating REAL DEFAULT 5.0,
      completed_trips INTEGER DEFAULT 0,
      health_status TEXT,
      is_fleet_managed INTEGER DEFAULT 0,
      fleet_company_name TEXT,
      fleet_manager TEXT,
      truck_number TEXT NOT NULL,
      truck_type TEXT NOT NULL,
      current_city TEXT NOT NULL,
      current_city_ur TEXT,
      current_location TEXT,
      preferred_destination TEXT,
      preferred_destination_ur TEXT,
      available_capacity_tons REAL NOT NULL,
      departure_time TEXT,
      status TEXT NOT NULL DEFAULT 'available', -- 'available' | 'matched' | 'offline'
      posted_ago TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Invoices & Commission Ledger Table
    CREATE TABLE IF NOT EXISTS commission_invoices (
      id TEXT PRIMARY KEY,
      invoice_number TEXT UNIQUE NOT NULL,
      entity_name TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      load_id TEXT,
      route TEXT,
      gross_freight_amount REAL NOT NULL,
      commission_rate_percent REAL NOT NULL,
      commission_amount REAL NOT NULL,
      payment_status TEXT NOT NULL DEFAULT 'pending', -- 'paid' | 'pending' | 'overdue'
      due_date TEXT NOT NULL,
      paid_date TEXT,
      payment_method TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Deposit Slips Table
    CREATE TABLE IF NOT EXISTS deposit_slips (
      id TEXT PRIMARY KEY,
      slip_number TEXT UNIQUE NOT NULL,
      sender_name TEXT NOT NULL,
      sender_phone TEXT NOT NULL,
      bank_name TEXT NOT NULL,
      amount REAL NOT NULL,
      transaction_id TEXT NOT NULL,
      slip_image_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending', -- 'pending' | 'verified' | 'rejected'
      submitted_at TEXT NOT NULL,
      verified_by TEXT,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- KYC Submissions Table
    CREATE TABLE IF NOT EXISTS kyc_submissions (
      id TEXT PRIMARY KEY,
      user_type TEXT NOT NULL,
      applicant_name TEXT NOT NULL,
      applicant_name_ur TEXT,
      phone TEXT NOT NULL,
      cnic_front_url TEXT,
      cnic_back_url TEXT,
      permanent_address TEXT,
      city TEXT,
      truck_number TEXT,
      truck_type TEXT,
      is_truck_owner_different INTEGER DEFAULT 0,
      truck_owner_name TEXT,
      truck_owner_cnic_front_url TEXT,
      truck_owner_cnic_back_url TEXT,
      truck_owner_address TEXT,
      company_name TEXT,
      ntn_number TEXT,
      company_registration_url TEXT,
      status TEXT NOT NULL DEFAULT 'pending',
      submitted_date TEXT,
      assigned_support_agent TEXT,
      review_notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Platform Banners Table
    CREATE TABLE IF NOT EXISTS banners (
      id TEXT PRIMARY KEY,
      message_en TEXT NOT NULL,
      message_ur TEXT NOT NULL,
      type TEXT NOT NULL DEFAULT 'info',
      active INTEGER NOT NULL DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- High-Efficiency Composite & Covering B-Tree Indexes
    CREATE INDEX IF NOT EXISTS idx_loads_status_route ON loads (status, pickup_city, dropoff_city);
    CREATE INDEX IF NOT EXISTS idx_loads_truck_status ON loads (truck_type, status);
    CREATE INDEX IF NOT EXISTS idx_loads_created ON loads (created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_loads_pickup_date ON loads (pickup_date);

    CREATE INDEX IF NOT EXISTS idx_bids_load_status ON bids (load_id, status);
    CREATE INDEX IF NOT EXISTS idx_bids_driver ON bids (driver_phone);
    CREATE INDEX IF NOT EXISTS idx_bids_created ON bids (created_at DESC);

    CREATE INDEX IF NOT EXISTS idx_fleet_status_city ON fleet_trucks (status, current_city);
    CREATE INDEX IF NOT EXISTS idx_avail_city_status ON driver_availabilities (current_city, status);
    CREATE INDEX IF NOT EXISTS idx_invoices_status_due ON commission_invoices (payment_status, due_date);
    CREATE INDEX IF NOT EXISTS idx_deposit_status ON deposit_slips (status);
    CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_submissions (status, user_type);
    CREATE INDEX IF NOT EXISTS idx_users_role_phone ON users (role, phone);
  `);

  // Seed initial data if tables are empty
  seedInitialData(db);

  if (process.env.NODE_ENV !== 'production') {
    global.__safarload_db__ = db;
  }

  return db;
}

function seedInitialData(db: DatabaseSync) {
  // No-op: Dummy data auto-seeding disabled per user request.
}

// Export Singleton Database Instance
export const db = initDatabase();

// Pre-compiled Prepared Statements Cache for Extreme Efficiency
export const statements = {
  // Loads
  getLoadById: db.prepare('SELECT * FROM loads WHERE id = ?'),
  updateLoadStatus: db.prepare('UPDATE loads SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'),
  deleteLoad: db.prepare('DELETE FROM loads WHERE id = ?'),
  getBidsForLoad: db.prepare('SELECT * FROM bids WHERE load_id = ? ORDER BY offered_bid_price ASC'),
  
  // Bids
  getBidById: db.prepare('SELECT * FROM bids WHERE id = ?'),
  updateBidStatus: db.prepare('UPDATE bids SET status = ? WHERE id = ?'),
  incrementLoadBidsCount: db.prepare('UPDATE loads SET bids_count = bids_count + 1 WHERE id = ?'),
  
  // Stats
  countLoadsByStatus: db.prepare('SELECT status, COUNT(*) as count FROM loads GROUP BY status'),
  getDbPragmas: () => ({
    journalMode: db.prepare('PRAGMA journal_mode;').get(),
    synchronous: db.prepare('PRAGMA synchronous;').get(),
    cacheSize: db.prepare('PRAGMA cache_size;').get(),
    mmapSize: db.prepare('PRAGMA mmap_size;').get(),
    pageCount: db.prepare('PRAGMA page_count;').get(),
    pageSize: db.prepare('PRAGMA page_size;').get(),
  }),
};
