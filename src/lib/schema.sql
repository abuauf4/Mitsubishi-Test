-- Turso/libSQL schema for Mitsubishi Motor Indonesia
-- Compatible with SQLite/libSQL (Turso)

-- Site Configuration (logos, badges, global settings)
CREATE TABLE IF NOT EXISTS SiteConfig (
  id TEXT PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL DEFAULT 'text',
  page TEXT NOT NULL DEFAULT 'home'
);

-- Hero Section
CREATE TABLE IF NOT EXISTS Hero (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  subtitle TEXT NOT NULL DEFAULT '',
  imagePath TEXT NOT NULL DEFAULT '/images/hero-cinematic.png',
  ctaText TEXT NOT NULL DEFAULT 'Selengkapnya',
  ctaLink TEXT NOT NULL DEFAULT '#audience-gateway',
  page TEXT NOT NULL DEFAULT 'home',
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Audience Categories (Passenger / Commercial gateway cards)
CREATE TABLE IF NOT EXISTS AudienceCategory (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  imagePath TEXT NOT NULL DEFAULT '',
  linkHref TEXT NOT NULL DEFAULT '',
  displayOrder INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Testimonials
CREATE TABLE IF NOT EXISTS Testimonial (
  id TEXT PRIMARY KEY,
  customerName TEXT NOT NULL,
  customerRole TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL DEFAULT 5,
  imagePath TEXT NOT NULL DEFAULT '',
  displayOrder INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Sales Consultant
CREATE TABLE IF NOT EXISTS SalesConsultant (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  whatsapp TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  title TEXT NOT NULL DEFAULT 'Sales Consultant',
  description TEXT NOT NULL DEFAULT '',
  imagePath TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Dealer Locations
CREATE TABLE IF NOT EXISTS DealerLocation (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  latitude REAL NOT NULL DEFAULT 0,
  longitude REAL NOT NULL DEFAULT 0,
  embeddingUrl TEXT NOT NULL DEFAULT '',
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Vehicles
CREATE TABLE IF NOT EXISTS Vehicle (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'passenger',
  basePrice TEXT NOT NULL DEFAULT '',
  imagePath TEXT NOT NULL DEFAULT '',
  payload TEXT,
  specsShort TEXT NOT NULL DEFAULT '[]',
  gallery TEXT,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  active INTEGER NOT NULL DEFAULT 1,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Vehicle Variants
CREATE TABLE IF NOT EXISTS VehicleVariant (
  id TEXT PRIMARY KEY,
  vehicleId TEXT NOT NULL,
  name TEXT NOT NULL,
  price TEXT NOT NULL DEFAULT '',
  priceNum INTEGER NOT NULL DEFAULT 0,
  transmission TEXT NOT NULL DEFAULT '',
  drivetrain TEXT,
  imagePath TEXT,
  description TEXT,
  highlights TEXT NOT NULL DEFAULT '[]',
  displayOrder INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (vehicleId) REFERENCES Vehicle(id) ON DELETE CASCADE
);

-- Vehicle Colors
-- variantId is nullable: NULL = global color (all variants), non-null = variant-specific color
CREATE TABLE IF NOT EXISTS VehicleColor (
  id TEXT PRIMARY KEY,
  vehicleId TEXT NOT NULL,
  variantId TEXT,
  name TEXT NOT NULL,
  hex TEXT NOT NULL DEFAULT '#000000',
  imagePath TEXT,
  displayOrder INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (vehicleId) REFERENCES Vehicle(id) ON DELETE CASCADE,
  FOREIGN KEY (variantId) REFERENCES VehicleVariant(id) ON DELETE CASCADE
);

-- Vehicle Specs
CREATE TABLE IF NOT EXISTS VehicleSpec (
  id TEXT PRIMARY KEY,
  vehicleId TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  items TEXT NOT NULL DEFAULT '[]',
  displayOrder INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (vehicleId) REFERENCES Vehicle(id) ON DELETE CASCADE
);

-- Vehicle Features
CREATE TABLE IF NOT EXISTS VehicleFeature (
  id TEXT PRIMARY KEY,
  vehicleId TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT 'Zap',
  title TEXT NOT NULL DEFAULT '',
  description TEXT NOT NULL DEFAULT '',
  displayOrder INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (vehicleId) REFERENCES Vehicle(id) ON DELETE CASCADE
);

-- Admin Users
CREATE TABLE IF NOT EXISTS AdminUser (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  name TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  updatedAt TEXT NOT NULL DEFAULT (datetime('now'))
);
