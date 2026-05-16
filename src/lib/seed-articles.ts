/**
 * Seed script for article data in the GalleryItem table.
 * Populates articles sourced from mitsubishi-motors.co.id & ktbfuso.co.id.
 *
 * Usage: npx tsx src/lib/seed-articles.ts
 *
 * Required environment variables:
 * - TURSO_DATABASE_URL
 * - TURSO_AUTH_TOKEN
 *
 * The GalleryItem table is auto-created by ensureMigrations() in auto-migrate.ts.
 * Columns: id, type, title, description, imagePath, customerName, vehicleName,
 *          articleContent, displayOrder, active, createdAt, updatedAt
 */

import { createClient } from '@libsql/client';

interface ArticleSeed {
  title: string;
  description: string;
  articleContent: string;
  source: 'mitsubishi-motors.co.id' | 'ktbfuso.co.id';
}

const articles: ArticleSeed[] = [
  // ---- Articles from mitsubishi-motors.co.id ----
  {
    title: 'Banyak Untungnya! Promo Penjualan Mei 2026',
    description: 'Program promo penjualan Mitsubishi Motors Mei 2026 dengan berbagai keuntungan menarik.',
    articleContent: `Mitsubishi Motors Indonesia kembali menghadirkan program promo penjualan spesial untuk bulan Mei 2026. Program ini menawarkan berbagai keuntungan menarik bagi konsumen yang ingin memiliki kendaraan Mitsubishi, mulai dari cashback, bunga kredit ringan, hingga bonus aksesoris.

Dengan promo ini, Mitsubishi Motors berkomitmen untuk memberikan nilai lebih kepada pelanggan setianya. Setiap pembelian kendaraan Mitsubishi selama periode promo berhak mendapatkan penawaran eksklusif yang dirancang untuk memudahkan kepemilikan kendaraan berkualitas.

Segera kunjungi diler Mitsubishi Motors terdekat untuk mendapatkan informasi lengkap mengenai syarat dan ketentuan promo penjualan Mei 2026. Jangan lewatkan kesempatan ini!`,
    source: 'mitsubishi-motors.co.id',
  },
  {
    title: 'Mitsubishi Xpander Ultimate CVT Nyaman Buat Harian, Andal Diajak Mudik',
    description: 'Pengalaman pemilik Xpander Ultimate CVT setelah 20.000 km — nyaman untuk harian dan andal saat mudik.',
    articleContent: `Seorang pemilik Mitsubishi Xpander Ultimate CVT berbagi pengalaman setelah menempuh jarak lebih dari 20.000 km. Menurutnya, Xpander Ultimate CVT memberikan kenyamanan luar biasa untuk penggunaan sehari-hari di jalanan kota maupun saat diajak mudik ke luar kota.

Kabin yang luas dengan konfigurasi 7 penumpang menjadi nilai plus utama, terutama saat perjalanan jauh bersama keluarga. Fitur Cruise Control dan Dual Zone AC turut menambah kenyamanan selama perjalanan panjang tanpa merasa lelah.

Mesin 1.5L MIVEC dengan transmisi CVT terbukti hemat bahan bakar namun tetap responsif saat akselerasi. Bagasi yang luas setelah baris ketiga dilipat juga sangat membantu membawa barang bawaan saat mudik.`,
    source: 'mitsubishi-motors.co.id',
  },
  {
    title: '6 Fitur Eksklusif Mitsubishi Destinator',
    description: 'Mengenal 6 fitur eksklusif yang hanya ada di Mitsubishi Destinator, SUV premium terbaru.',
    articleContent: `Mitsubishi Destinator hadir sebagai SUV premium terbaru yang menghadirkan 6 fitur eksklusif tidak ditemukan di kendaraan sekelasnya. Fitur-fitur ini menjadikan Destinator pilihan yang menarik bagi konsumen yang menginginkan kendaraan dengan teknologi canggih dan kenyamanan premium.

Salah satu fitur unggulan adalah Diamond Sense ADAS yang mencakup Forward Collision Mitigation (FCM), Adaptive Cruise Control (ACC), Blind Spot Warning (BSW), dan Rear Cross Traffic Alert (RCTA). Sistem keselamatan aktif ini memberikan perlindungan menyeluruh bagi pengemudi dan penumpang.

Selain itu, Destinator juga dilengkapi Panoramic Sunroof, Yamaha Premium Audio 8 speaker, Multi Around Monitor 360°, dan Mitsubishi Connect untuk konektivitas smartphone. Kombinasi fitur premium ini menjadikan Destinator SUV paling lengkap di segmennya.`,
    source: 'mitsubishi-motors.co.id',
  },
  {
    title: 'Diler Mitsubishi Motors Pertama di Kabupaten Gowa, Sulawesi Selatan',
    description: 'MMKSI meresmikan diler pertama di Kabupaten Gowa, memperluas jaringan di Indonesia Timur.',
    articleContent: `PT Mitsubishi Motors Krama Yudha Sales Indonesia (MMKSI) meresmikan diler Mitsubishi Motors pertama di Kabupaten Gowa, Sulawesi Selatan. Peresmian ini menandai komitmen MMKSI untuk memperluas jaringan penjualan dan after-sales service di wilayah Indonesia Timur.

Kehadiran diler baru di Gowa diharapkan dapat memudahkan masyarakat Sulawesi Selatan dalam mengakses produk dan layanan Mitsubishi Motors. Konsumen tidak perlu lagi menempuh jarak jauh untuk melakukan test drive, pembelian kendaraan, maupun perawatan berkala.

Diler ini menyediakan fasilitas 3S (Sales, Service, Spare Parts) yang lengkap dengan mekanik tersertifikasi dan suku cadang orisinal. MMKSI terus berupaya mendekatkan layanan terbaiknya ke seluruh penjuru Indonesia.`,
    source: 'mitsubishi-motors.co.id',
  },
  {
    title: 'BBM Diesel Naik, Mitsubishi Pajero Sport Siap di Berbagai Kondisi',
    description: 'Mitsubishi Pajero Sport tetap tangguh dan efisien di tengah kenaikan harga BBM diesel.',
    articleContent: `Di tengah kenaikan harga BBM diesel, Mitsubishi Pajero Sport tetap menjadi pilihan yang handal bagi konsumen yang membutuhkan kendaraan tangguh untuk berbagai kondisi. Mesin 2.4L DI-D MIVEC Turbo Diesel yang dimilikinya dikenal efisien namun tetap bertenaga dengan output 181 PS dan torsi 430 Nm.

Pajero Sport juga dilengkapi berbagai mode berkendara yang memungkinkan pengemudi menyesuaikan performa kendaraan sesuai kondisi jalan — dari Gravel, Snow, Mud, hingga Sand. Sistem Super Select 4WD-II memberikan fleksibilitas untuk beralih antara penggerak 2 roda dan 4 roda sesuai kebutuhan.

Dengan konsumsi BBM yang relatif efisien untuk kelasnya dan ketangguhan yang telah terbukti, Pajero Sport tetap menjadi investasi yang tepat di tengah fluktuasi harga bahan bakar.`,
    source: 'mitsubishi-motors.co.id',
  },

  // ---- Articles from ktbfuso.co.id ----
  {
    title: 'Mitsubishi Fuso Hadirkan Ekosistem Zero Down Time di GIICOMVEC 2026',
    description: 'FUSO memperkenalkan ekosistem Zero Down Time untuk mendukung operasional logistik Indonesia.',
    articleContent: `Mitsubishi Fuso memperkenalkan ekosistem Zero Down Time di ajang GIICOMVEC 2026, sebuah solusi komprehensif untuk mendukung operasional logistik Indonesia yang membutuhkan keandalan tinggi. Ekosistem ini mengintegrasikan berbagai layanan untuk meminimalkan waktu henti kendaraan.

Konsep Zero Down Time mencakup predictive maintenance melalui telematics, jaringan bengkel luas dengan suku cadang ready stock, serta layanan darurat 24 jam. Dengan pendekatan ini, operator armada dapat memastikan kendaraan selalu dalam kondisi prima dan siap beroperasi.

Kehadiran ekosistem ini menunjukkan komitmen FUSO tidak hanya menjual truk, tetapi juga menyediakan solusi total untuk menjaga kelangsungan bisnis pelanggan. Hal ini sejalan dengan visi FUSO sebagai partner terpercaya bagi industri logistik Indonesia.`,
    source: 'ktbfuso.co.id',
  },
  {
    title: 'Mitsubishi Fuso Kembali Raih Top Brand 100 Award',
    description: 'FUSO konsisten jadi merek kendaraan niaga andalan dengan pangsa pasar 39.9%.',
    articleContent: `Mitsubishi Fuso kembali meraih penghargaan Top Brand 100 Award, menegaskan posisinya sebagai merek kendaraan niaga andalan di Indonesia. Dengan pangsa pasar 39.9%, FUSO konsisten menjadi pemimpin pasar di segmen kendaraan komersial.

Pencapaian ini merupakan bukti kepercayaan konsumen terhadap kualitas, ketahanan, dan keandalan produk FUSO. Dari truk ringan Canter hingga Heavy Duty, setiap produk FUSO dirancang untuk memenuhi kebutuhan bisnis Indonesia yang dinamis dan menantang.

Penghargaan Top Brand 100 Award juga mencerminkan komitmen FUSO dalam memberikan layanan purna jual terbaik. Jaringan diler dan bengkel yang luas, ketersediaan suku cadang, serta program perawatan berkala menjadi fondasi kepercayaan pelanggan.`,
    source: 'ktbfuso.co.id',
  },
  {
    title: 'Perluas Manfaat ke Penjuru Negeri, KTB Mendonasikan Fuso Colt Diesel Kepada SMK',
    description: 'KTB mendonasikan Mitsubishi Fuso Colt Diesel kepada SMK Negeri 3 Sorong untuk pendidikan kejuruan.',
    articleContent: `PT Krama Yudha Tiga Berlian (KTB) mendonasikan unit Mitsubishi Fuso Colt Diesel kepada SMK Negeri 3 Sorong, Papua Barat Daya, sebagai bentuk kepedulian terhadap dunia pendidikan kejuruan di Indonesia Timur. Donasi ini diharapkan dapat membantu siswa mempraktikkan langsung teknologi kendaraan niaga modern.

Kendaraan yang didonasikan akan digunakan sebagai alat praktik oleh siswa jurusan Teknik Otomotif. Dengan akses langsung ke kendaraan Fuso Colt Diesel, siswa dapat mempelajari sistem mesin diesel, transmisi, dan kelistrikan kendaraan niaga secara hands-on.

Program donasi ini merupakan bagian dari komitmen KTB dalam mendukung pengembangan sumber daya manusia di sektor otomotif. KTB percaya bahwa pendidikan vokasi yang berkualitas akan menghasilkan tenaga kerja terampil yang siap memenuhi kebutuhan industri otomotif Indonesia.`,
    source: 'ktbfuso.co.id',
  },
  {
    title: 'Mitsubishi Fuso Perkuat Kualitas Layanan Melalui Apresiasi Frontliner',
    description: 'FUSO mengapresiasi frontliner terbaik di National Dealer Contest & Awarding 2026.',
    articleContent: `Mitsubishi Fuso mengapresiasi frontliner terbaiknya dalam ajang National Dealer Contest & Awarding 2026. Acara ini menjadi momen penting untuk mengakui dedikasi dan kontribusi mekanik, service advisor, dan sales consultant yang senantiasa memberikan layanan terbaik kepada pelanggan.

Kompetisi ini menguji kompetensi frontliner dalam berbagai aspek, mulai dari diagnosa kerusakan, kecepatan servis, kemampuan komunikasi dengan pelanggan, hingga pengetahuan produk. Para pemenang merupakan representasi standar layanan tertinggi yang diusung FUSO.

Melalui apresiasi ini, FUSO berharap dapat terus meningkatkan kualitas layanan di seluruh jaringan diler. Frontliner yang terlatih dan termotivasi akan memberikan pengalaman servis yang lebih baik bagi setiap pelanggan FUSO di Indonesia.`,
    source: 'ktbfuso.co.id',
  },
  {
    title: 'Mitsubishi Fuso Menambah Kecanggihan Aplikasi MyFUSO dengan Tujuh Fitur Andalan',
    description: 'Aplikasi MyFUSO kini dilengkapi 7 fitur andalan baru untuk kemudahan manajemen armada.',
    articleContent: `Mitsubishi Fuso meluncurkan pembaruan signifikan pada aplikasi MyFUSO dengan menambahkan tujuh fitur andalan baru. Pembaruan ini dirancang untuk memberikan kemudahan bagi para pemilik armada dalam mengelola dan memonitor kendaraan FUSO mereka secara real-time.

Fitur-fitur baru mencakup vehicle tracking real-time, fuel monitoring, driver behavior analysis, maintenance scheduling, trip history, geofencing alerts, dan integrated service booking. Kombinasi fitur ini memungkinkan manajemen armada yang lebih efisien dan cost-effective.

Dengan MyFUSO yang semakin canggih, pelanggan FUSO dapat mengoptimalkan operasional armada, mengurangi biaya perawatan melalui predictive maintenance, dan meningkatkan keselamatan berkendara. Aplikasi ini tersedia gratis untuk semua pemilik kendaraan FUSO dan dapat diakses melalui smartphone.`,
    source: 'ktbfuso.co.id',
  },
];

async function main() {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    console.error('❌ TURSO_DATABASE_URL not set');
    process.exit(1);
  }

  const db = createClient({ url, authToken });

  console.log(`📦 Seeding ${articles.length} articles into GalleryItem...`);

  // Ensure GalleryItem table exists (mirrors auto-migrate logic)
  await db.execute({
    sql: `CREATE TABLE IF NOT EXISTS GalleryItem (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL DEFAULT 'delivery',
      title TEXT NOT NULL DEFAULT '',
      description TEXT DEFAULT '',
      imagePath TEXT DEFAULT '',
      customerName TEXT DEFAULT '',
      vehicleName TEXT DEFAULT '',
      articleContent TEXT DEFAULT '',
      displayOrder INTEGER NOT NULL DEFAULT 0,
      active INTEGER NOT NULL DEFAULT 1,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    )`,
    args: [],
  });

  let inserted = 0;
  let skipped = 0;

  for (let i = 0; i < articles.length; i++) {
    const article = articles[i];

    // Check if article already exists by title
    const existing = await db.execute({
      sql: 'SELECT id FROM GalleryItem WHERE title = ? AND type = ?',
      args: [article.title, 'article'],
    });

    if (existing.rows.length > 0) {
      console.log(`  ⏭️  Skipping (already exists): "${article.title}"`);
      skipped++;
      continue;
    }

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO GalleryItem (id, type, title, description, imagePath, customerName, vehicleName, articleContent, displayOrder, active, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        'article',
        article.title,
        article.description,
        '',       // imagePath — no images yet
        '',       // customerName — empty for articles
        '',       // vehicleName — empty for articles
        article.articleContent,
        i,        // displayOrder — incrementing
        1,        // active
        now,
        now,
      ],
    });

    console.log(`  ✅ Inserted: "${article.title}" (order: ${i}, source: ${article.source})`);
    inserted++;
  }

  console.log(`\n🎉 Article seed complete!`);
  console.log(`   Inserted: ${inserted}`);
  console.log(`   Skipped (already exist): ${skipped}`);
  console.log(`   Total articles in seed file: ${articles.length}`);
}

main().catch((e) => {
  console.error('Article seed failed:', e);
  process.exit(1);
});
