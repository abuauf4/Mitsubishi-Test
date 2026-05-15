/**
 * Server-side vehicle data fetching utility.
 * Used by Server Components (page.tsx) to fetch vehicle data directly from Turso,
 * bypassing the API route and its HTTP caching layers entirely.
 *
 * This ensures vehicle detail pages ALWAYS show fresh data from the database.
 */

import { getDb } from '@/lib/db';
import { proxyBlobUrl } from '@/lib/image-utils';
import { VehicleData, VehicleGallery, passengerVehicles, niagaRinganVehicles, commercialVehicles } from '@/data/vehicles';
import {
  getPassengerVehicle,
  getNiagaRinganVehicle,
  getCommercialVehicle,
} from '@/data/vehicles';

/**
 * Fetch a vehicle by slug directly from Turso DB.
 * Falls back to static data if DB is not available.
 * Returns a VehicleData object or null if not found.
 */
export async function fetchVehicleBySlug(slug: string): Promise<VehicleData | null> {
  const db = getDb();

  // No DB — use static fallback
  if (!db) {
    const staticVehicle =
      getPassengerVehicle(slug) ||
      getNiagaRinganVehicle(slug) ||
      getCommercialVehicle(slug);
    return staticVehicle || null;
  }

  try {
    const vehicleResult = await db.execute({
      sql: 'SELECT * FROM Vehicle WHERE slug = ? AND active = 1',
      args: [slug],
    });

    if (vehicleResult.rows.length === 0) {
      return null;
    }

    const row = vehicleResult.rows[0];
    const vehicleId = row.id as string;

    // Fetch sub-entities in parallel
    const [variantsRes, colorsRes, specsRes, featuresRes] = await Promise.all([
      db.execute({ sql: 'SELECT * FROM VehicleVariant WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [vehicleId] }),
      db.execute({ sql: 'SELECT * FROM VehicleColor WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [vehicleId] }),
      db.execute({ sql: 'SELECT * FROM VehicleSpec WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [vehicleId] }),
      db.execute({ sql: 'SELECT * FROM VehicleFeature WHERE vehicleId = ? ORDER BY displayOrder ASC', args: [vehicleId] }),
    ]);

    // Build imagePath: proxy raw blob URLs, add cache-busting for already-proxied URLs
    let image = proxyBlobUrl((row.imagePath as string)) || '/images/canter.png';
    if (image.startsWith('/api/image?') && row.updatedAt) {
      image = `${image}&_t=${encodeURIComponent(row.updatedAt as string)}`;
    }

    return {
      slug: (row.slug as string) || '',
      name: (row.name as string) || '',
      tagline: (row.tagline as string) || '',
      category: ((row.category as string) || 'passenger') as VehicleData['category'],
      basePrice: (row.basePrice as string) || '',
      image,
      payload: (row.payload as string) || undefined,
      specsShort: parseJSON<string[]>(row.specsShort, []),
      gallery: parseJSON<VehicleGallery>(row.gallery, undefined as unknown as VehicleGallery) || undefined,
      colors: colorsRes.rows.map(c => ({
        name: (c.name as string) || '',
        hex: (c.hex as string) || '#000000',
        image: proxyBlobUrl(c.imagePath as string),
        variantId: (c.variantId as string) || null,
      })),
      variants: variantsRes.rows.map(v => ({
        id: (v.id as string) || undefined,
        name: (v.name as string) || '',
        price: (v.price as string) || '',
        priceNum: Number(v.priceNum) || 0,
        transmission: (v.transmission as string) || '',
        drivetrain: (v.drivetrain as string) || undefined,
        image: proxyBlobUrl(v.imagePath as string),
        highlights: parseJSON<string[]>(v.highlights, []),
      })),
      specs: specsRes.rows.map(s => ({
        category: (s.category as string) || '',
        items: parseJSON<{ label: string; value: string }[]>(s.items, []),
      })),
      features: featuresRes.rows.map(f => ({
        icon: (f.icon as string) || 'Star',
        title: (f.title as string) || '',
        description: (f.description as string) || '',
      })),
    };
  } catch (error) {
    console.error('Error fetching vehicle by slug:', error);
    // Fall back to static data on error
    const staticVehicle =
      getPassengerVehicle(slug) ||
      getNiagaRinganVehicle(slug) ||
      getCommercialVehicle(slug);
    return staticVehicle || null;
  }
}

/** Safely parse JSON from DB, with fallback */
function parseJSON<T>(value: unknown, fallback: T): T {
  if (Array.isArray(value)) return value as T;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/**
 * Helper: build a minimal VehicleData from a DB row (for listing pages).
 * Only includes fields needed for VehicleCard: slug, name, tagline, category,
 * basePrice, image, payload, specsShort.
 */
function buildVehicleListItem(row: Record<string, unknown>): VehicleData {
  let image = proxyBlobUrl(row.imagePath as string) || '/images/canter.png';
  if (image.startsWith('/api/image?') && row.updatedAt) {
    image = `${image}&_t=${encodeURIComponent(row.updatedAt as string)}`;
  }
  return {
    slug: (row.slug as string) || '',
    name: (row.name as string) || '',
    tagline: (row.tagline as string) || '',
    category: ((row.category as string) || 'passenger') as VehicleData['category'],
    basePrice: (row.basePrice as string) || '',
    image,
    payload: (row.payload as string) || undefined,
    specsShort: parseJSON<string[]>(row.specsShort, []),
    colors: [],
    variants: [],
    specs: [],
    features: [],
  };
}

/**
 * Fetch vehicles by category directly from Turso DB.
 * Falls back to static data if DB is not available.
 * Returns VehicleData[] (minimal — only fields needed for listing cards).
 */
export async function fetchVehiclesByCategory(category: string): Promise<VehicleData[]> {
  const db = getDb();

  // No DB — use static fallback
  if (!db) {
    if (category === 'passenger') return passengerVehicles;
    if (category === 'niaga-ringan') return niagaRinganVehicles;
    if (category === 'commercial') return commercialVehicles;
    return [...passengerVehicles, ...niagaRinganVehicles, ...commercialVehicles];
  }

  try {
    const result = await db.execute({
      sql: 'SELECT * FROM Vehicle WHERE category = ? AND active = 1 ORDER BY displayOrder ASC',
      args: [category],
    });

    if (result.rows.length === 0) {
      // No DB results — fall back to static
      if (category === 'passenger') return passengerVehicles;
      if (category === 'niaga-ringan') return niagaRinganVehicles;
      if (category === 'commercial') return commercialVehicles;
      return [];
    }

    return result.rows.map(row => buildVehicleListItem(row as Record<string, unknown>));
  } catch (error) {
    console.error('Error fetching vehicles by category:', error);
    if (category === 'passenger') return passengerVehicles;
    if (category === 'niaga-ringan') return niagaRinganVehicles;
    if (category === 'commercial') return commercialVehicles;
    return [];
  }
}
