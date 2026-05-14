/**
 * Seed script for Turso database.
 * Populates the database with all vehicle data from the static data files.
 * 
 * Usage: npx tsx src/lib/seed-turso.ts
 * 
 * Required environment variables:
 * - TURSO_DATABASE_URL
 * - TURSO_AUTH_TOKEN
 */

import { createClient } from '@libsql/client';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { passengerVehicles, niagaRinganVehicles, commercialVehicles } from '../data/vehicles';

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('❌ TURSO_DATABASE_URL not set');
    process.exit(1);
  }

  const db = createClient({ url, authToken });

  console.log('📦 Creating schema...');
  const schemaPath = join(__dirname, 'schema.sql');
  const schema = readFileSync(schemaPath, 'utf-8');
  
  // Execute schema statements one by one
  const statements = schema
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));
  
  for (const stmt of statements) {
    try {
      await db.execute(stmt);
    } catch (e: any) {
      // Ignore "already exists" errors
      if (!e.message?.includes('already exists')) {
        console.error('Schema error:', e.message);
      }
    }
  }
  console.log('✅ Schema created');

  // Check if data already exists
  const existing = await db.execute('SELECT COUNT(*) as count FROM Vehicle');
  if (Number(existing.rows[0].count) > 0) {
    console.log('⚠️  Database already has vehicle data. Skipping seed.');
    console.log('   Run "npm run db:reset-seed" to clear and re-seed.');
    return;
  }

  const allVehicles = [...passengerVehicles, ...niagaRinganVehicles, ...commercialVehicles];

  console.log(`📦 Seeding ${allVehicles.length} vehicles...`);

  for (let i = 0; i < allVehicles.length; i++) {
    const v = allVehicles[i];
    const vehicleId = crypto.randomUUID();

    // Insert vehicle
    await db.execute({
      sql: `INSERT OR IGNORE INTO Vehicle (id, slug, name, tagline, category, basePrice, imagePath, payload, specsShort, displayOrder, active)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        vehicleId,
        v.slug,
        v.name,
        v.tagline,
        v.category,
        v.basePrice,
        v.image,
        v.payload || null,
        JSON.stringify(v.specsShort),
        i,
        1
      ]
    });

    // Insert variants
    for (let j = 0; j < v.variants.length; j++) {
      const variant = v.variants[j];
      await db.execute({
        sql: `INSERT OR IGNORE INTO VehicleVariant (id, vehicleId, name, price, priceNum, transmission, drivetrain, highlights, displayOrder)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          vehicleId,
          variant.name,
          variant.price,
          variant.priceNum,
          variant.transmission,
          variant.drivetrain || null,
          JSON.stringify(variant.highlights),
          j
        ]
      });
    }

    // Insert colors
    for (let j = 0; j < v.colors.length; j++) {
      const color = v.colors[j];
      await db.execute({
        sql: `INSERT OR IGNORE INTO VehicleColor (id, vehicleId, name, hex, imagePath, displayOrder)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          vehicleId,
          color.name,
          color.hex,
          color.image || null,
          j
        ]
      });
    }

    // Insert specs
    for (let j = 0; j < v.specs.length; j++) {
      const spec = v.specs[j];
      await db.execute({
        sql: `INSERT OR IGNORE INTO VehicleSpec (id, vehicleId, category, items, displayOrder)
              VALUES (?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          vehicleId,
          spec.category,
          JSON.stringify(spec.items),
          j
        ]
      });
    }

    // Insert features
    for (let j = 0; j < v.features.length; j++) {
      const feature = v.features[j];
      await db.execute({
        sql: `INSERT OR IGNORE INTO VehicleFeature (id, vehicleId, icon, title, description, displayOrder)
              VALUES (?, ?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          vehicleId,
          feature.icon,
          feature.title,
          feature.description,
          j
        ]
      });
    }

    console.log(`  ✅ ${v.name} (${v.category}) — ${v.variants.length} variants, ${v.colors.length} colors, ${v.specs.length} specs, ${v.features.length} features`);
  }

  // Seed Hero
  console.log('📦 Seeding hero...');
  await db.execute({
    sql: `INSERT OR IGNORE INTO Hero (id, title, subtitle, imagePath, ctaText, ctaLink, active)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      'Drive Your Ambition',
      'Temukan kendaraan Mitsubishi terbaik untuk hidup dan bisnis Anda',
      '/images/hero-cinematic.png',
      'Selengkapnya',
      '#audience-gateway',
      1
    ]
  });

  // Seed Sales Consultant
  console.log('📦 Seeding sales consultant...');
  await db.execute({
    sql: `INSERT OR IGNORE INTO SalesConsultant (id, name, phone, whatsapp, email, title, description, imagePath, active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      'Andi Pratama',
      '0812-3456-7890',
      '081234567890',
      'andi.pratama@mitsubishi.co.id',
      'Sales Consultant',
      'Saya adalah Sales Consultant resmi Mitsubishi dengan pengalaman lebih dari 10 tahun. Siap membantu Anda menemukan kendaraan yang tepat — mulai dari konsultasi, test drive, simulasi kredit, hingga proses pengiriman kendaraan.',
      '/images/andi-profile.png',
      1
    ]
  });

  // Seed Audience Categories
  console.log('📦 Seeding audience categories...');
  await db.execute({
    sql: `INSERT OR IGNORE INTO AudienceCategory (id, title, description, imagePath, linkHref, displayOrder, active)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [crypto.randomUUID(), 'Passenger Cars', 'MPV keluarga, SUV tangguh, hingga kendaraan listrik', '/images/xpander.png', '/passenger', 0, 1]
  });
  await db.execute({
    sql: `INSERT OR IGNORE INTO AudienceCategory (id, title, description, imagePath, linkHref, displayOrder, active)
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    args: [crypto.randomUUID(), 'Commercial Vehicles', 'Niaga ringan hingga heavy duty untuk bisnis Anda', '/images/l300.png', '/commercial', 1, 1]
  });

  // Seed Dealer Location
  console.log('📦 Seeding dealer location...');
  await db.execute({
    sql: `INSERT OR IGNORE INTO DealerLocation (id, name, address, phone, latitude, longitude, embeddingUrl, active)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    args: [
      crypto.randomUUID(),
      'PT. Mitsubishi Motors Jakarta Pusat',
      'Jl. Jend. Sudirman No. 123, Jakarta Pusat 10220',
      '(021) 555-1234',
      -6.2088,
      106.8456,
      '',
      1
    ]
  });

  console.log('\n🎉 Seed complete! All data has been populated.');
  console.log(`   Vehicles: ${allVehicles.length}`);
  console.log(`   Total variants: ${allVehicles.reduce((sum, v) => sum + v.variants.length, 0)}`);
  console.log(`   Total colors: ${allVehicles.reduce((sum, v) => sum + v.colors.length, 0)}`);
  console.log(`   Total specs: ${allVehicles.reduce((sum, v) => sum + v.specs.length, 0)}`);
  console.log(`   Total features: ${allVehicles.reduce((sum, v) => sum + v.features.length, 0)}`);
}

main().catch(e => {
  console.error('Seed failed:', e);
  process.exit(1);
});
