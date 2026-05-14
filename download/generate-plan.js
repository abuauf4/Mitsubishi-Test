const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, Header, Footer, PageNumber, NumberFormat,
  AlignmentType, HeadingLevel, WidthType, BorderStyle, ShadingType,
  TableOfContents, SectionType,
} = require("docx");
const fs = require("fs");

// ── Palette: GO-1 Graphite Orange (proposal/plan) ──
const P = {
  primary: "1A2330",
  body: "2C3A4A",
  secondary: "6B7A8A",
  accent: "D4875A",
  surface: "F8F0EB",
  cover: { titleColor: "FFFFFF", subtitleColor: "B0B8C0", metaColor: "90989F", footerColor: "687078" },
  table: { headerBg: "D4875A", headerText: "FFFFFF", accentLine: "D4875A", innerLine: "DDD0C8", surface: "F8F0EB" },
};

const c = (hex) => hex.replace("#", "");

// ── Helpers ──
function safeText(v, ph) {
  if (v === undefined || v === null || v === "" || String(v) === "NaN" || String(v) === "undefined") return ph || "\u3010Harap diisi\u3011";
  return String(v);
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: level === HeadingLevel.HEADING_1 ? 360 : 240, after: 120 },
    children: [new TextRun({ text, bold: true, color: c(P.primary), font: { ascii: "Calibri", eastAsia: "SimHei" } })],
  });
}

function body(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 420 },
    spacing: { line: 312 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}

function bodyNoIndent(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { line: 312 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}

function boldBody(text) {
  return new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 420 },
    spacing: { line: 312 },
    children: [new TextRun({ text, bold: true, size: 24, color: c(P.primary), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}

// ── Numbering config ──
const numberingConfig = [];
const listNames = [];
for (let i = 1; i <= 30; i++) {
  const name = `list-${i}`;
  listNames.push(name);
  numberingConfig.push({
    reference: name,
    levels: [{
      level: 0,
      format: NumberFormat.DECIMAL,
      text: "%1.",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    }],
  });
}
for (let i = 1; i <= 10; i++) {
  const name = `bullet-${i}`;
  numberingConfig.push({
    reference: name,
    levels: [{
      level: 0,
      format: NumberFormat.BULLET,
      text: "\u2022",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } },
    }],
  });
}

let listIdx = 0;
function numberedItem(text) {
  return new Paragraph({
    numbering: { reference: listNames[listIdx], level: 0 },
    spacing: { line: 312 },
    children: [new TextRun({ text, size: 24, color: c(P.body), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
  });
}
function nextList() { listIdx++; }

// ── Table builder ──
function makeTable(headers, rows, colWidths) {
  const totalCols = headers.length;
  const widths = colWidths || headers.map(() => Math.floor(100 / totalCols));
  const t = P.table;

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) =>
      new TableCell({
        children: [new Paragraph({ children: [new TextRun({ text: h, bold: true, size: 21, color: c(t.headerText) })] })],
        shading: { type: ShadingType.CLEAR, fill: c(t.headerBg) },
        margins: { top: 60, bottom: 60, left: 120, right: 120 },
        width: { size: widths[i], type: WidthType.PERCENTAGE },
      })
    ),
  });

  const dataRows = rows.map((row, ri) =>
    new TableRow({
      cantSplit: true,
      children: row.map((cell, ci) =>
        new TableCell({
          children: [new Paragraph({ children: [new TextRun({ text: safeText(cell, "-"), size: 21, color: c(P.body) })] })],
          shading: ri % 2 === 0 ? { type: ShadingType.CLEAR, fill: c(t.surface) } : { type: ShadingType.CLEAR, fill: "FFFFFF" },
          margins: { top: 60, bottom: 60, left: 120, right: 120 },
          width: { size: widths[ci], type: WidthType.PERCENTAGE },
        })
      ),
    })
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: c(t.accentLine) },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: c(t.accentLine) },
      left: { style: BorderStyle.NONE },
      right: { style: BorderStyle.NONE },
      insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: c(t.innerLine) },
      insideVertical: { style: BorderStyle.NONE },
    },
    rows: [headerRow, ...dataRows],
  });
}

// ── Cover (R4 Top Color Block) ──
const NB = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const allNoBorders = { top: NB, bottom: NB, left: NB, right: NB, insideHorizontal: NB, insideVertical: NB };

function buildCover() {
  const title = "Rencana Verifikasi dan Pembaruan Gambar Kendaraan";
  const subtitle = "Mitsubishi-Test Website";
  const meta1 = "Dokumen Proposal";
  const meta2 = "Versi 1.0 \u2014 14 Mei 2026";

  return new Table({
    borders: allNoBorders,
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      // Color block top
      new TableRow({
        height: { value: 5400, rule: "exact" },
        children: [new TableCell({
          borders: allNoBorders,
          shading: { type: ShadingType.CLEAR, fill: c(P.primary) },
          verticalAlign: "top",
          children: [
            new Paragraph({ spacing: { before: 1200 }, children: [] }),
            new Paragraph({
              indent: { left: 900, right: 900 },
              spacing: { line: 920, lineRule: "atLeast" },
              children: [new TextRun({ text: title, bold: true, size: 52, color: c(P.cover.titleColor), font: { ascii: "Calibri", eastAsia: "SimHei" } })],
            }),
            new Paragraph({ spacing: { before: 200 }, children: [] }),
            new Paragraph({
              indent: { left: 900 },
              children: [new TextRun({ text: subtitle, size: 28, color: c(P.cover.subtitleColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } })],
            }),
          ],
        })],
      }),
      // Accent line
      new TableRow({
        height: { value: 120, rule: "exact" },
        children: [new TableCell({
          borders: allNoBorders,
          shading: { type: ShadingType.CLEAR, fill: c(P.accent) },
          children: [new Paragraph({ children: [] })],
        })],
      }),
      // Bottom area
      new TableRow({
        height: { value: 11318, rule: "exact" },
        children: [new TableCell({
          borders: allNoBorders,
          verticalAlign: "top",
          children: [
            new Paragraph({ spacing: { before: 1600 }, children: [] }),
            new Paragraph({
              indent: { left: 900 },
              spacing: { line: 400 },
              children: [
                new TextRun({ text: meta1, size: 24, color: c(P.cover.metaColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } }),
              ],
            }),
            new Paragraph({
              indent: { left: 900 },
              spacing: { line: 400 },
              children: [
                new TextRun({ text: meta2, size: 24, color: c(P.cover.metaColor), font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" } }),
              ],
            }),
          ],
        })],
      }),
    ],
  });
}

// ── Page size / margin ──
const pgSize = { width: 11906, height: 16838 };
const pgMargin = { top: 1440, bottom: 1440, left: 1701, right: 1417 };

// ── Footer helper ──
function footerCenter() {
  return new Footer({
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [new TextRun({ children: [PageNumber.CURRENT], size: 18, color: "808080" })],
    })],
  });
}

// ── Build document sections ──

// === COVER SECTION ===
const coverSection = {
  properties: {
    page: { size: pgSize, margin: { top: 0, bottom: 0, left: 0, right: 0 } },
  },
  children: [buildCover()],
};

// === FRONT MATTER (TOC) ===
const tocSection = {
  properties: {
    type: SectionType.NEXT_PAGE,
    page: { size: pgSize, margin: pgMargin, pageNumbers: { start: 1, formatType: NumberFormat.UPPER_ROMAN } },
  },
  footers: { default: footerCenter() },
  children: [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 480, after: 360 },
      children: [new TextRun({ text: "Daftar Isi", bold: true, size: 32, font: { eastAsia: "SimHei", ascii: "Calibri" } })],
    }),
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    }),
    new Paragraph({
      spacing: { before: 200 },
      children: [new TextRun({
        text: "Catatan: Daftar Isi ini dibuat melalui field codes. Untuk memastikan nomor halaman akurat setelah pengeditan, klik kanan pada Daftar Isi dan pilih \"Update Field\".",
        italics: true, size: 18, color: "888888",
      })],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ],
};

// === BODY SECTION ===
const bodyChildren = [];

// ─────────── 1. RINGKASAN EKSEKUTIF ───────────
bodyChildren.push(heading("1. Ringkasan Eksekutif"));
bodyChildren.push(body("Dokumen ini menyajikan rencana komprehensif untuk memastikan bahwa seluruh gambar kendaraan yang ditampilkan di website Mitsubishi-Test\u2014meliputi gambar utama, varian, warna, galeri eksterior, interior, dan highlight\u2014secara akurat mencerminkan sumber resmi dari Mitsubishi Motors Indonesia (mitsubishi-motors.co.id) dan Mitsubishi Fuso Indonesia (ktbfuso.co.id). Rencana ini mencakup tiga komponen utama: audit menyeluruh terhadap kondisi gambar saat ini, proses pembaruan gambar berdasarkan sumber resmi, dan pedoman kerja (guidelines) untuk menjaga konsistensi gambar ke depannya."));
bodyChildren.push(body("Saat ini, dari 13 model kendaraan yang terdaftar di website, hanya 8 model yang memiliki gambar utama dari Vercel Blob Storage, sementara 3 model (Triton, L100 EV, dan L300) masih menggunakan gambar statis lokal yang tidak akurat. Lebih kritis lagi, tidak ada satu pun dari sekitar 45 warna kendaraan yang memiliki gambar spesifik per warna\u2014sistem saat ini hanya menampilkan overlay warna hex pada gambar utama. Demikian pula, gambar varian dan galeri belum terisi di data statis, meskipun data katalog resmi menyediakan aset-aset ini."));
bodyChildren.push(body("Rencana ini dirancang untuk menyelesaikan semua kesenjangan (gap) tersebut melalui pendekatan bertahap yang terstruktur, dimulai dari verifikasi menyeluruh, dilanjutkan dengan pengunggahan (upload) bertahap, dan diakhiri dengan penetapan standar operasional untuk pemeliharaan berkelanjutan. Dengan implementasi rencana ini, website akan menampilkan gambar yang 100% akurat dan konsisten dengan sumber resmi, memberikan pengalaman pengguna yang lebih baik dan menghindari potensi masalah hukum terkait penggunaan aset merek dagang."));

// ─────────── 2. LATAR BELAKANG & ANALISIS MASALAH ───────────
bodyChildren.push(heading("2. Latar Belakang dan Analisis Masalah"));
bodyChildren.push(heading("2.1 Arsitektur Penyimpanan Gambar Saat Ini", HeadingLevel.HEADING_2));
bodyChildren.push(body("Sistem gambar Mitsubishi-Test menggunakan arsitektur dua lapis. Lapisan pertama adalah Vercel Blob Storage (private), yang menyimpan gambar-gambar yang telah diunggah melalui skrip batch. Gambar-gambar ini diakses melalui proxy API (/api/image) yang mengambil gambar dari blob storage menggunakan token otentikasi dan menyajikannya secara publik dengan cache satu hari. Lapisan kedua adalah file statis lokal di direktori /public/images/, yang berfungsi sebagai fallback untuk kendaraan yang belum memiliki gambar di blob storage."));
bodyChildren.push(body("Sistem proxy ini diperlukan karena Vercel Blob dikonfigurasi sebagai private storage, sehingga browser tidak dapat mengakses URL gambar secara langsung. Setiap permintaan gambar melewati route /api/image yang menerima parameter URL terenkode, mengambil gambar dari blob dengan header Authorization, dan menyajikannya ke browser. Meskipun fungsional, pendekatan ini menambah latensi dan mengharuskan penggunaan properti unoptimized pada komponen Next.js Image, yang menghilangkan optimasi otomatis seperti konversi WebP dan sizing responsif."));

bodyChildren.push(heading("2.2 Inventaris Gambar Kendaraan", HeadingLevel.HEADING_2));
bodyChildren.push(body("Berikut adalah inventaris lengkap kondisi gambar untuk seluruh kendaraan yang terdaftar di website saat ini, dikelompokkan berdasarkan kategori. Tabel ini menunjukkan dengan jelas mana saja yang sudah menggunakan gambar dari Vercel Blob (\u2713) dan mana yang masih menggunakan gambar statis lokal yang berpotensi tidak akurat (\u2717)."));

bodyChildren.push(new Paragraph({
  keepNext: true,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text: "Tabel 1: Status Gambar Utama Kendaraan Penumpang", bold: true, size: 21, color: c(P.primary) })],
}));
bodyChildren.push(makeTable(
  ["Model", "Slug", "Gambar Utama", "Sumber", "Status"],
  [
    ["New Xpander", "xpander", "\u2713", "Vercel Blob", "Akurat"],
    ["Xpander Cross", "xpander-cross", "\u2713", "Vercel Blob", "Akurat"],
    ["Pajero Sport", "pajero-sport", "\u2713", "Vercel Blob", "Akurat"],
    ["Destinator", "destinator", "\u2713", "Vercel Blob", "Akurat"],
    ["Xforce", "xforce", "\u2713", "Vercel Blob", "Akurat"],
    ["L100 EV", "l100-ev", "\u2717", "/images/l300-van.png", "Tidak Akurat"],
    ["L300", "l300", "\u2717", "/images/l300.png", "Perlu Verifikasi"],
  ],
  [20, 18, 14, 26, 22]
));

bodyChildren.push(new Paragraph({
  keepNext: true,
  spacing: { before: 300, after: 100 },
  children: [new TextRun({ text: "Tabel 2: Status Gambar Utama Kendaraan Niaga Ringan dan Komersial", bold: true, size: 21, color: c(P.primary) })],
}));
bodyChildren.push(makeTable(
  ["Model", "Slug", "Gambar Utama", "Sumber", "Status"],
  [
    ["Triton", "triton", "\u2717", "/images/l200.png", "Tidak Akurat"],
    ["Canter FE 71", "canter-fe-71", "\u2713", "Vercel Blob", "Akurat"],
    ["Canter FE 74", "canter-fe-74", "\u2713", "Vercel Blob", "Akurat"],
    ["Canter FE 84G", "canter-fe-84g", "\u2713", "Vercel Blob", "Akurat"],
    ["FUSO Fighter X", "fighter-x-fm65", "\u2713", "Vercel Blob", "Akurat"],
    ["FUSO Heavy Duty", "fz-heavy-duty", "\u2713", "Vercel Blob", "Akurat"],
  ],
  [20, 18, 14, 26, 22]
));

bodyChildren.push(heading("2.3 Kesenjangan Gambar (Gap Analysis)", HeadingLevel.HEADING_2));
bodyChildren.push(body("Analisis mendalam mengungkapkan beberapa kesenjangan kritis yang perlu ditangani secara sistematis. Kesenjangan pertama dan paling mendesak adalah gambar utama yang tidak akurat untuk tiga model: Triton menggunakan gambar L200, L100 EV menggunakan gambar L300 Van, dan L300 menggunakan gambar generik. Ini bukan hanya masalah estetika, tetapi juga masalah keakuratan informasi\u2014pelanggan yang melihat gambar Triton mengharapkan melihat truk pick-up Mitsubishi Triton, bukan model L200 yang mungkin memiliki desain berbeda."));
bodyChildren.push(body("Kesenjangan kedua yang sangat signifikan adalah absennya gambar warna (color images) untuk seluruh kendaraan. Database memiliki kolom imagePath pada tabel VehicleColor, dan antarmuka pengguna sudah mendukung tampilan gambar per warna, namun tidak ada satu pun dari sekitar 45 varian warna yang memiliki gambar spesifik. Saat ini, sistem hanya menampilkan swatch warna hex dan menerapkan overlay warna pada gambar utama, yang tidak mencerminkan tampilan aktual kendaraan dalam warna tersebut. Sumber data resmi (katalog penumpang) menyediakan gambar per warna dengan URL base yang stabil di Google Cloud Storage."));
bodyChildren.push(body("Kesenjangan ketiga adalah gambar varian yang belum terisi. Meskipun antarmuka VehicleVariant memiliki field imagePath, tidak ada gambar varian yang didefinisikan di data statis vehicles.ts. Katalog resmi menyediakan gambar per varian (misalnya, gambar khusus untuk tipe Ultimate vs tipe GLS), dan data ini perlu diintegrasikan ke dalam sistem. Kesenjangan keempat adalah data galeri (eksterior, interior, highlight) yang hanya ada di database Turso jika skrip migrasi telah dijalankan, tetapi tidak ada di data statis fallback, dan VehicleDetailPage belum merender galeri sama sekali."));

bodyChildren.push(new Paragraph({
  keepNext: true,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text: "Tabel 3: Ringkasan Kesenjangan Gambar", bold: true, size: 21, color: c(P.primary) })],
}));
bodyChildren.push(makeTable(
  ["Jenis Gambar", "Tersedia", "Dibutuhkan", "Kesenjangan", "Prioritas"],
  [
    ["Gambar Utama", "8/13", "13", "5 model", "Tinggi"],
    ["Gambar Warna", "0/45", "~45", "~45 gambar", "Tinggi"],
    ["Gambar Varian", "0/~40", "~40", "~40 gambar", "Sedang"],
    ["Galeri Eksterior", "0/13", "~80", "~80 gambar", "Sedang"],
    ["Galeri Interior", "0/13", "~30", "~30 gambar", "Rendah"],
    ["Galeri Highlight", "0/13", "~50", "~50 gambar", "Rendah"],
  ],
  [22, 18, 18, 20, 22]
));

bodyChildren.push(heading("2.4 Sumber Data Resmi yang Tersedia", HeadingLevel.HEADING_2));
bodyChildren.push(body("Proyek ini sudah memiliki data katalog yang di-scrape dari sumber resmi, tersimpan di direktori /download/. File mitsubishi-passenger-catalog.json berisi data untuk 5 kendaraan penumpang (Destinator, Pajero Sport, Xpander, Xpander Cross, Xforce) dengan 141 total gambar termasuk gambar utama, gambar per warna, dan gambar highlight. File mitsubishi-commercial-catalog.json berisi data untuk 36 kendaraan komersial dengan lebih dari 120 gambar unik, mencakup gambar utama, eksterior, varian, dan aplikasi. Selain itu, terdapat file upload-result-passenger-batch1.json, upload-result-passenger-batch2.json, dan upload-result-commercial.json yang mencatat hasil pengunggahan batch sebelumnya ke Vercel Blob."));
bodyChildren.push(body("Namun, ada beberapa tantangan dengan data yang ada. Pertama, URL gambar di katalog penumpang menggunakan Google Cloud Storage signed URLs yang memiliki masa berlaku sekitar 7 hari\u2014URL-URL ini kemungkinan sudah kedaluwarsa. Namun, setiap gambar juga memiliki base_url yang lebih stabil. Kedua, katalog komersial menggunakan slug yang lebih granular (36 varian individual) dibandingkan dengan struktur website yang mengelompokkan menjadi 5 model utama, sehingga diperlukan pemetaan (mapping) yang cermat. Ketiga, beberapa kendaraan yang ada di katalog komersial (eCanter, Rosa, Super Great) belum tercakup di data kendaraan website."));

// ─────────── 3. TUJUAN & TARGET ───────────
bodyChildren.push(heading("3. Tujuan dan Target yang Diharapkan"));
bodyChildren.push(heading("3.1 Tujuan Utama", HeadingLevel.HEADING_2));
nextList();
bodyChildren.push(numberedItem("Memastikan 100% gambar utama kendaraan di website sesuai dengan sumber resmi Mitsubishi Motors Indonesia dan Mitsubishi Fuso Indonesia, menghilangkan semua gambar placeholder atau tidak akurat."));
bodyChildren.push(numberedItem("Mengisi seluruh gambar warna (color images) untuk setiap varian warna yang tersedia, sehingga pelanggan dapat melihat tampilan aktual kendaraan dalam warna pilihan mereka."));
bodyChildren.push(numberedItem("Menyediakan gambar varian untuk setiap tipe kendaraan (misalnya GLS MT, Ultimate CVT), memberikan representasi visual yang akurat untuk setiap opsi."));
bodyChildren.push(numberedItem("Mengintegrasikan galeri gambar (eksterior, interior, highlight) ke dalam halaman detail kendaraan, meningkatkan pengalaman eksplorasi pengguna."));
bodyChildren.push(numberedItem("Menetapkan standar operasional dan alur kerja (workflow) yang jelas untuk pembaruan gambar berkelanjutan, mencegah ketidaksesuaian di masa depan."));

bodyChildren.push(heading("3.2 Target Kuantitatif", HeadingLevel.HEADING_2));
bodyChildren.push(new Paragraph({
  keepNext: true,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text: "Tabel 4: Target Kuantitatif per Fase", bold: true, size: 21, color: c(P.primary) })],
}));
bodyChildren.push(makeTable(
  ["Metrik", "Kondisi Saat Ini", "Target Fase 1", "Target Fase 2", "Target Fase 3"],
  [
    ["Gambar utama akurat", "62% (8/13)", "100% (13/13)", "100%", "100%"],
    ["Gambar warna terisi", "0% (0/45)", "0%", "100% (~45)", "100%"],
    ["Gambar varian terisi", "0% (0/40)", "0%", "50% (~20)", "100% (~40)"],
    ["Galeri terintegrasi", "0 model", "0 model", "5 penumpang", "13 model"],
    ["Skrip upload otomatis", "Tidak ada", "Ada", "Ada", "Ada"],
    ["API upload admin", "Tidak ada", "Ada", "Ada", "Ada"],
  ],
  [22, 20, 20, 20, 18]
));

// ─────────── 4. DESAIN SOLUSI ───────────
bodyChildren.push(heading("4. Desain Solusi"));
bodyChildren.push(heading("4.1 Fase 1: Verifikasi dan Perbaikan Gambar Utama", HeadingLevel.HEADING_2));
bodyChildren.push(body("Fase pertama berfokus pada memastikan bahwa setiap kendaraan memiliki gambar utama (hero image) yang akurat dan bersumber dari referensi resmi. Langkah ini merupakan prioritas tertinggi karena gambar utama adalah elemen visual pertama yang dilihat pengguna di halaman daftar kendaraan dan kartu kendaraan."));

bodyChildren.push(boldBody("Langkah 1.1: Audit Visual Manual"));
bodyChildren.push(body("Lakukan audit visual terhadap seluruh 13 gambar utama kendaraan dengan membandingkan setiap gambar yang ditampilkan di website dengan gambar resmi di mitsubishi-motors.co.id dan ktbfuso.co.id. Untuk setiap gambar, dokumentasikan: apakah gambar sesuai dengan model yang ditampilkan, apakah sudut pengambilan gambar konsisten (front-right 3/4 angle standar Mitsubishi), apakah resolusi dan kualitas gambar memadai, dan apakah latar belakang sesuai (putih/polos standar katalog). Hasil audit dicatat dalam spreadsheet verifikasi dengan kolom: Model, Slug, URL Gambar Saat Ini, Cocok/Tidak, Catatan, dan URL Referensi Resmi."));

bodyChildren.push(boldBody("Langkah 1.2: Unggah Gambar untuk Model yang Belum Akurat"));
bodyChildren.push(body("Untuk tiga model yang menggunakan gambar statis lokal (Triton, L100 EV, L300), lakukan pengunggahan gambar yang benar ke Vercel Blob Storage. Proses ini melibatkan: pengambilan gambar resmi dari sumber (katalog atau halaman produk resmi), pengunggahan ke Vercel Blob melalui skrip batch atau API upload, pembaruan database Turso dengan URL blob yang baru, dan pembaruan data statis vehicles.ts sebagai fallback. Khusus untuk Triton, data katalog komersial di file fuso-raw/triton.json sudah tersedia dan dapat langsung digunakan. Untuk L100 EV dan L300, gambar perlu diambil langsung dari halaman produk resmi karena model ini tidak tercakup di katalog otomatis."));

bodyChildren.push(boldBody("Langkah 1.3: Buat Route /api/admin/upload yang Hilang"));
bodyChildren.push(body("Ditemukan bahwa komponen ImageUpload.tsx mengirim permintaan POST ke /api/admin/upload, tetapi route ini tidak ada dalam source code. Ini menyebabkan fitur upload gambar melalui panel admin tidak berfungsi di lingkungan lokal. Route ini perlu dibuat di src/app/api/admin/upload/route.ts dengan logika: menerima FormData dengan file gambar, mengunggah file ke Vercel Blob Storage menggunakan @vercel/blob, mengembalikan path /api/image?url=... yang dapat disimpan di database, dan memvalidasi tipe file (hanya JPG/PNG/WebP) serta ukuran maksimum (5MB)."));

bodyChildren.push(boldBody("Langkah 1.4: Sinkronkan Schema.sql dengan Prisma Schema"));
bodyChildren.push(body("Terdapat perbedaan (drift) antara schema.sql dan Prisma schema. Kolom imagePath pada VehicleVariant, kolom gallery pada Vehicle, dan kolom description pada VehicleVariant telah ditambahkan melalui ALTER TABLE di skrip migrasi, tetapi schema.sql belum diperbarui. Ini berisiko jika database perlu dibuat ulang dari schema.sql. Perbaiki schema.sql untuk menyertakan semua kolom yang ada di Prisma schema, sehingga kedua sumber truth ini konsisten."));

bodyChildren.push(heading("4.2 Fase 2: Pengisian Gambar Warna dan Varian", HeadingLevel.HEADING_2));
bodyChildren.push(body("Fase kedua berfokus pada pengisian gambar warna (color images) dan gambar varian (variant images) yang saat ini kosong sepenuhnya. Ini adalah peningkatan signifikan yang akan mengubah pengalaman pengguna dari hanya melihat swatch warna hex menjadi melihat foto aktual kendaraan dalam warna yang dipilih."));

bodyChildren.push(boldBody("Langkah 2.1: Ekstraksi dan Pengunggahan Gambar Warna dari Katalog Penumpang"));
bodyChildren.push(body("Katalog penumpang (mitsubishi-passenger-catalog.json) menyediakan data warna lengkap untuk 5 model utama, termasuk URL gambar per warna. Proses yang diperlukan: pertama, ekstrak daftar warna beserta URL gambar dari katalog untuk setiap model; kedua, unduh gambar dari URL base (bukan signed URL yang sudah kedaluwarsa); ketiga, unggah ke Vercel Blob dengan konvensi penamaan yang konsisten: mitsubishi/{timestamp}-{category}_{slug}_color_{color-name}.{ext}; keempat, perbarui database Turso dengan menambahkan imagePath pada setiap record VehicleColor; kelima, perbarui data statis vehicles.ts untuk menyertakan path gambar warna."));

bodyChildren.push(boldBody("Langkah 2.2: Pengunggahan Gambar Varian dari Katalog"));
bodyChildren.push(body("Sumber katalog menyediakan gambar untuk varian tertentu (misalnya, gambar khusus tipe Ultimate vs tipe Exceed). Proses serupa dengan gambar warna: ekstrak data varian dari katalog, unduh gambar, unggah ke Vercel Blob dengan penamaan mitsubishi/{timestamp}-{category}_{slug}_variant_{variant-slug}.{ext}, dan perbarui database serta data statis. Untuk kendaraan komersial, gambar varian mencakup konfigurasi yang berbeda seperti Chassis, Jungkit, Dump Truck, dan Box yang diambil dari field variants di katalog komersial."));

bodyChildren.push(boldBody("Langkah 2.3: Penambahan Model yang Belum Tercakup"));
bodyChildren.push(body("Beberapa model yang ada di katalog resmi belum tercakup di website, termasuk eCanter (Canter listrik), Rosa (bus medium), dan Super Great (truk berat). Evaluasi apakah model-model ini perlu ditambahkan ke database kendaraan. Jika ya, buat data kendaraan lengkap (nama, slug, kategori, deskripsi, spesifikasi, fitur, varian, warna) dan unggah semua gambar terkait. Data untuk model-model ini sudah tersedia di direktori /download/fuso-raw/."));

bodyChildren.push(heading("4.3 Fase 3: Integrasi Galeri dan Pemeliharaan Berkelanjutan", HeadingLevel.HEADING_2));
bodyChildren.push(body("Fase ketiga berfokus pada integrasi galeri gambar ke halaman detail kendaraan dan penetapan pedoman pemeliharaan jangka panjang. Galeri mencakup gambar eksterior dari berbagai sudut, gambar interior (dashboard, kursi, konsol tengah), dan gambar highlight fitur (Dynamic Shield, LED Headlamp, layar infotainment)."));

bodyChildren.push(boldBody("Langkah 3.1: Implementasi Tampilan Galeri di VehicleDetailPage"));
bodyChildren.push(body("VehicleDetailPage saat ini tidak merender galeri meskipun struktur data gallery sudah ada di database (kolom JSON dengan kategori exterior, interior, highlights, applications, global). Implementasikan komponen galeri yang menampilkan gambar-gambar ini dalam format carousel atau grid, dengan dukungan lightbox untuk melihat gambar dalam ukuran penuh. Gunakan komponen Carousel dari shadcn/ui yang sudah tersedia di proyek."));

bodyChildren.push(boldBody("Langkah 3.2: Unggah Galeri dari Katalog ke Vercel Blob"));
bodyChildren.push(body("Untuk kendaraan penumpang, katalog menyediakan gambar eksterior (beberapa sudut) dan highlight fitur. Untuk kendaraan komersial, katalog menyediakan gambar eksterior dan aplikasi (misalnya, Canter sebagai Dump Truck, Fighter sebagai Truk Tangki). Proses: ekstrak data galeri dari katalog, unggah ke Vercel Blob dengan penamaan mitsubishi/{timestamp}-{category}_{slug}_{gallery-type}_{index}.{ext}, dan simpan sebagai JSON di kolom gallery pada tabel Vehicle."));

bodyChildren.push(boldBody("Langkah 3.3: Pertimbangkan Membuat Vercel Blob Public"));
bodyChildren.push(body("Saat ini, Vercel Blob dikonfigurasi sebagai private storage, sehingga setiap gambar harus melewati proxy API /api/image. Ini menambah latensi, menghilangkan optimasi Next.js Image, dan membebani server. Pertimbangkan untuk mengubah konfigurasi blob menjadi public, yang akan memungkinkan akses langsung ke URL gambar, mengaktifkan optimasi Next.js Image (lazy loading, WebP conversion, responsive sizing), dan menyederhanakan arsitektur. Langkah ini memerlukan pengujian keamanan untuk memastikan bahwa exposure publik dari aset gambar tidak menimbulkan risiko."));

// ─────────── 5. ROADMAP IMPLEMENTASI ───────────
bodyChildren.push(heading("5. Roadmap Implementasi dan Milestone"));
bodyChildren.push(body("Implementasi rencana ini dilakukan dalam tiga fase utama dengan durasi total sekitar 6 minggu. Setiap fase memiliki deliverable yang terukur dan kriteria keberhasilan yang jelas. Fase-fase ini dirancang untuk memberikan nilai (value) secepat mungkin\u2014Fase 1 menyelesaikan masalah paling kritis (gambar utama yang salah), sementara Fase 2 dan 3 secara bertahap meningkatkan kelengkapan gambar."));

bodyChildren.push(new Paragraph({
  keepNext: true,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text: "Tabel 5: Roadmap Implementasi", bold: true, size: 21, color: c(P.primary) })],
}));
bodyChildren.push(makeTable(
  ["Fase", "Aktivitas Utama", "Durasi", "Deliverable", "Kriteria Keberhasilan"],
  [
    ["Fase 1", "Audit visual + perbaikan gambar utama + buat API upload + sinkronisasi schema", "2 minggu", "13/13 gambar utama akurat, API upload berfungsi, schema konsisten", "Semua gambar utama cocok dengan referensi resmi"],
    ["Fase 2", "Unggah gambar warna + gambar varian + tambah model baru", "2 minggu", "~45 gambar warna, ~20 gambar varian, data model baru", "Setiap warna memiliki gambar spesifik"],
    ["Fase 3", "Integrasi galeri + pedoman pemeliharaan + evaluasi blob public", "2 minggu", "Galeri aktif di detail page, dokumen SOP, rekomendasi arsitektur", "Galeri tampil di semua model penumpang"],
  ],
  [10, 30, 10, 28, 22]
));

bodyChildren.push(heading("5.1 Detail Milestone Fase 1", HeadingLevel.HEADING_2));
nextList();
bodyChildren.push(numberedItem("Minggu 1, Hari 1-2: Audit visual seluruh gambar utama, dokumentasi di spreadsheet verifikasi."));
bodyChildren.push(numberedItem("Minggu 1, Hari 3-4: Pengambilan dan pengunggahan gambar resmi untuk Triton, L100 EV, dan L300 ke Vercel Blob."));
bodyChildren.push(numberedItem("Minggu 1, Hari 5: Pembaruan database Turso dan data statis vehicles.ts untuk tiga model tersebut."));
bodyChildren.push(numberedItem("Minggu 2, Hari 1-2: Implementasi route /api/admin/upload/route.ts dengan validasi file dan integrasi Vercel Blob."));
bodyChildren.push(numberedItem("Minggu 2, Hari 3-4: Sinkronisasi schema.sql dengan Prisma schema, menjalankan migrasi jika diperlukan."));
bodyChildren.push(numberedItem("Minggu 2, Hari 5: Pengujian end-to-end: upload gambar via admin, verifikasi tampilan di halaman publik, pengecekan cache dan cache-busting."));

bodyChildren.push(heading("5.2 Detail Milestone Fase 2", HeadingLevel.HEADING_2));
nextList();
bodyChildren.push(numberedItem("Minggu 3, Hari 1-2: Ekstraksi dan pengunggahan gambar warna untuk 5 model penumpang (Xpander, Xpander Cross, Pajero Sport, Destinator, Xforce) dari katalog."));
bodyChildren.push(numberedItem("Minggu 3, Hari 3-4: Pembaruan database Turso dengan imagePath untuk setiap VehicleColor, pembaruan vehicles.ts."));
bodyChildren.push(numberedItem("Minggu 3, Hari 5: Pengujian visual: verifikasi setiap warna menampilkan gambar yang benar di halaman detail."));
bodyChildren.push(numberedItem("Minggu 4, Hari 1-2: Pengunggahan gambar varian untuk model penumpang dari katalog."));
bodyChildren.push(numberedItem("Minggu 4, Hari 3-4: Pengunggahan gambar varian dan aplikasi untuk model komersial."));
bodyChildren.push(numberedItem("Minggu 4, Hari 5: Evaluasi dan penambahan model baru (eCanter, Rosa, Super Great) jika disetujui."));

bodyChildren.push(heading("5.3 Detail Milestone Fase 3", HeadingLevel.HEADING_2));
nextList();
bodyChildren.push(numberedItem("Minggu 5, Hari 1-2: Implementasi komponen galeri (carousel/grid) di VehicleDetailPage menggunakan shadcn/ui Carousel."));
bodyChildren.push(numberedItem("Minggu 5, Hari 3-4: Pengunggahan gambar galeri (eksterior, highlight) untuk 5 model penumpang."));
bodyChildren.push(numberedItem("Minggu 5, Hari 5: Pengunggahan gambar galeri (eksterior, aplikasi) untuk 5 model komersial."));
bodyChildren.push(numberedItem("Minggu 6, Hari 1-2: Penulisan dokumen SOP (Standard Operating Procedure) untuk pemeliharaan gambar berkelanjutan."));
bodyChildren.push(numberedItem("Minggu 6, Hari 3-4: Evaluasi arsitektur: analisis pro/kontra menjadikan Vercel Blob public, pengujian performa."));
bodyChildren.push(numberedItem("Minggu 6, Hari 5: Review keseluruhan, finalisasi dokumentasi, dan handover."));

// ─────────── 6. PEDOMAN KONSISTENSI GAMBAR ───────────
bodyChildren.push(heading("6. Pedoman Konsistensi Gambar Kendaraan"));
bodyChildren.push(body("Pedoman ini bertujuan memastikan bahwa setiap gambar yang ditambahkan atau diperbarui di website memenuhi standar konsistensi yang tinggi, sehingga pengalaman visual pengguna seragam di seluruh halaman. Pedoman ini harus diikuti oleh semua kontributor yang menambah atau mengubah gambar kendaraan."));

bodyChildren.push(heading("6.1 Standar Teknis Gambar", HeadingLevel.HEADING_2));
bodyChildren.push(new Paragraph({
  keepNext: true,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text: "Tabel 6: Standar Teknis Gambar", bold: true, size: 21, color: c(P.primary) })],
}));
bodyChildren.push(makeTable(
  ["Parameter", "Standar", "Keterangan"],
  [
    ["Format", "WebP (utama), JPG (fallback)", "WebP memberikan kompresi terbaik; JPG untuk kompatibilitas"],
    ["Resolusi minimum", "1920 x 1080 px", "Cukup untuk tampilan desktop tanpa pixelation"],
    ["Resolusi ideal", "2400 x 1600 px", "Untuk zoom/lightbox tanpa kehilangan detail"],
    ["Ukuran file maksimum", "2 MB per gambar", "Kompresi otomatis saat upload ke Vercel Blob"],
    ["Latar belakang", "Putih polos (#FFFFFF)", "Sesuai standar katalog Mitsubishi resmi"],
    ["Sudut gambar utama", "Front-right 3/4 angle", "Sudut standar yang digunakan di semua katalog Mitsubishi"],
    ["Rasio aspek", "16:9 (utama), 4:3 (galeri)", "Konsisten dengan desain kartu dan carousel"],
    ["Watermark", "Dilarang", "Hanya gambar tanpa watermark dari sumber resmi"],
  ],
  [22, 30, 48]
));

bodyChildren.push(heading("6.2 Konvensi Penamaan File di Vercel Blob", HeadingLevel.HEADING_2));
bodyChildren.push(body("Semua gambar yang diunggah ke Vercel Blob harus mengikuti konvensi penamaan yang konsisten untuk memudahkan identifikasi, pencarian, dan pemeliharaan. Format penamaan yang ditetapkan adalah: mitsubishi/{timestamp}-{category}_{slug}_{type}_{descriptor}.{ext}. Berikut adalah penjelasan setiap komponen: timestamp menggunakan format Unix epoch milidetik untuk menjamin keunikan; category adalah passenger, commercial, atau niaga-ringan; slug adalah identifier kendaraan (misalnya xpander, canter-fe-71); type adalah main, color, variant, exterior, interior, highlight, atau application; descriptor adalah detail tambahan seperti nama warna atau nomor urut; dan ext adalah ekstensi file (webp, jpg, png)."));
bodyChildren.push(body("Contoh penamaan yang benar: mitsubishi/1778709761819-passenger_xpander_main_hvh87jk-optimized.webp untuk gambar utama Xpander; mitsubishi/1778709761819-passenger_xpander_color_quartz-white-pearl.webp untuk gambar warna; mitsubishi/1778709761819-commercial_canter-fe-71_exterior_01.webp untuk gambar galeri eksterior. Konvensi ini harus dipatuhi oleh skrip batch upload maupun upload manual melalui panel admin."));

bodyChildren.push(heading("6.3 Standar Verifikasi Gambar", HeadingLevel.HEADING_2));
bodyChildren.push(body("Setiap gambar yang ditambahkan atau diperbarui harus melewati proses verifikasi sebelum dipublikasikan. Verifikasi dilakukan dengan checklist berikut:"));

nextList();
bodyChildren.push(numberedItem("Kecocokan model: Gambar menampilkan model kendaraan yang benar (bukan model lain yang mirip)."));
bodyChildren.push(numberedItem("Kecocokan varian: Jika gambar untuk varian tertentu, pastikan fitur visual yang ditampilkan sesuai (grille, bumper, pelek, aksesoris)."));
bodyChildren.push(numberedItem("Kecocokan warna: Gambar warna menampilkan kendaraan dalam warna yang tepat, bukan warna lain atau gambar utama dengan overlay."));
bodyChildren.push(numberedItem("Kualitas visual: Gambar tidak buram, terlalu terang/gelap, atau memiliki artefak kompresi yang mengganggu."));
bodyChildren.push(numberedItem("Konsistensi sudut: Gambar utama menggunakan front-right 3/4 angle yang sama untuk semua model."));
bodyChildren.push(numberedItem("Latar belakang: Latar belakang putih polos tanpa elemen yang mengganggu."));
bodyChildren.push(numberedItem("Resolusi: Memenuhi standar minimum 1920x1080 px."));
bodyChildren.push(numberedItem("Penamaan: Nama file mengikuti konvensi yang ditetapkan di Bagian 6.2."));

// ─────────── 7. ALUR KERJA PEMBARUAN GAMBAR ───────────
bodyChildren.push(heading("7. Alur Kerja Pembaruan Gambar (Workflow)"));
bodyChildren.push(body("Alur kerja ini mendefinisikan proses langkah demi langkah untuk memperbarui gambar kendaraan, baik secara batch (melalui skrip) maupun individual (melalui panel admin). Alur ini dirancang untuk meminimalkan kesalahan dan memastikan setiap perubahan terdokumentasi dengan baik."));

bodyChildren.push(heading("7.1 Alur Kerja Upload Batch (Skrip)", HeadingLevel.HEADING_2));
bodyChildren.push(body("Untuk pembaruan gambar dalam jumlah besar (misalnya, pengunggahan gambar warna untuk semua model penumpang), gunakan alur kerja batch. Langkah-langkahnya adalah sebagai berikut:"));

nextList();
bodyChildren.push(numberedItem("Persiapan data: Identifikasi gambar yang perlu diunggah dari katalog resmi. Verifikasi bahwa URL sumber masih valid (jika menggunakan signed URL, periksa tanggal kedaluwarsa). Untuk URL yang sudah kedaluwarsa, gunakan base_url dan unduh ulang dari sumber resmi."));
bodyChildren.push(numberedItem("Jalankan skrip upload: Gunakan skrip Node.js yang sudah ada (upload-passenger-batch1.mjs, upload-passenger-batch2.mjs, upload-commercial.mjs) sebagai template. Buat skrip baru untuk setiap batch dengan parameter yang sesuai. Skrip harus mengunggah gambar ke Vercel Blob, mencatat URL hasil upload, dan menghasilkan file laporan JSON."));
bodyChildren.push(numberedItem("Verifikasi hasil upload: Periksa file laporan JSON untuk memastikan semua gambar berhasil diunggah. Untuk setiap gambar yang gagal, catat alasan kegagalan dan coba ulang."));
bodyChildren.push(numberedItem("Perbarui database: Jalankan skrip update (seperti update-vehicle-images.mjs) untuk memperbarui Turso database dengan URL gambar baru. Skrip ini memperbarui kolom imagePath, gallery, dan color imagePath sesuai data hasil upload."));
bodyChildren.push(numberedItem("Perbarui data statis: Update file src/data/vehicles.ts dengan path gambar baru sebagai fallback jika database tidak terjangkau."));
bodyChildren.push(numberedItem("Uji tampilan: Buka halaman daftar kendaraan dan halaman detail di browser. Verifikasi bahwa semua gambar baru ditampilkan dengan benar, termasuk di berbagai ukuran layar (desktop, tablet, mobile)."));
bodyChildren.push(numberedItem("Dokumentasi: Catat perubahan di worklog.md dengan detail: tanggal, model yang terpengaruh, jenis gambar yang ditambahkan/diubah, dan URL blob yang digunakan."));

bodyChildren.push(heading("7.2 Alur Kerja Upload Individual (Panel Admin)", HeadingLevel.HEADING_2));
bodyChildren.push(body("Untuk pembaruan gambar individual (misalnya, mengganti gambar satu varian atau menambah gambar warna baru), gunakan panel admin. Pastikan route /api/admin/upload sudah berfungsi (Fase 1, Langkah 1.3). Alurnya adalah:"));

nextList();
bodyChildren.push(numberedItem("Login ke panel admin dan navigasi ke halaman kendaraan yang ingin diperbarui."));
bodyChildren.push(numberedItem("Pada bagian gambar (hero, varian, atau warna), gunakan komponen ImageUpload untuk mengunggah gambar baru. Komponen ini mendukung drag-and-drop dan input URL manual."));
bodyChildren.push(numberedItem("Setelah upload berhasil, gambar baru akan langsung tersimpan di Vercel Blob dan path-nya akan diperbarui di database."));
bodyChildren.push(numberedItem("Verifikasi tampilan: Buka halaman publik kendaraan dan pastikan gambar baru ditampilkan. Gunakan parameter _t=timestamp untuk cache-busting jika gambar lama masih muncul."));
bodyChildren.push(numberedItem("Catat perubahan di worklog.md."));

bodyChildren.push(heading("7.3 Alur Kerja Verifikasi Berkala", HeadingLevel.HEADING_2));
bodyChildren.push(body("Untuk mencegah penyimpangan gambar di masa depan, lakukan verifikasi berkala dengan jadwal berikut:"));

bodyChildren.push(new Paragraph({
  keepNext: true,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text: "Tabel 7: Jadwal Verifikasi Berkala", bold: true, size: 21, color: c(P.primary) })],
}));
bodyChildren.push(makeTable(
  ["Jenis Verifikasi", "Frekuensi", "Pelaksana", "Output"],
  [
    ["Audit visual semua gambar utama", "Bulanan", "Tim Konten", "Laporan audit dengan screenshot"],
    ["Pengecekan URL blob aktif", "Mingguan (otomatis)", "Skrip monitoring", "Notifikasi jika ada URL rusak"],
    ["Verifikasi gambar baru vs sumber", "Setiap penambahan", "Reviewer", "Checklist verifikasi yang ditandatangani"],
    ["Perbandingan dengan website resmi", "Kuartalan", "Tim QA", "Laporan perbandingan side-by-side"],
    ["Review konvensi penamaan", "Kuartalan", "Developer", "Laporan kepatuhan, perbaikan jika ada"],
  ],
  [26, 20, 22, 32]
));

// ─────────── 8. ANALISIS RISIKO ───────────
bodyChildren.push(heading("8. Analisis Risiko dan Mitigasi"));
bodyChildren.push(body("Setiap proyek memiliki risiko yang perlu diidentifikasi dan dimitigasi sejak awal. Berikut adalah analisis risiko untuk implementasi rencana ini, beserta strategi mitigasi yang direkomendasikan."));

bodyChildren.push(new Paragraph({
  keepNext: true,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text: "Tabel 8: Analisis Risiko dan Mitigasi", bold: true, size: 21, color: c(P.primary) })],
}));
bodyChildren.push(makeTable(
  ["Risiko", "Probabilitas", "Dampak", "Mitigasi"],
  [
    ["URL sumber katalog kedaluwarsa", "Tinggi", "Sedang", "Gunakan base_url yang stabil; re-scrape dari sumber resmi jika perlu"],
    ["Vercel Blob storage penuh", "Rendah", "Tinggi", "Monitor penggunaan storage; kompres gambar sebelum upload; pertimbangkan CDN alternatif"],
    ["Route /api/admin/upload bermasalah", "Sedang", "Sedang", "Uji thoroughly sebelum deploy; sediakan skrip batch sebagai fallback"],
    ["Gambar tidak cocok dengan model", "Sedang", "Tinggi", "Checklist verifikasi wajib sebelum publikasi; review oleh minimal 2 orang"],
    ["Database Turso dan statis tidak sinkron", "Sedang", "Sedang", "Jalankan skrip sinkronisasi setelah setiap perubahan; tambah integration test"],
    ["Performa website menurun akibat banyak gambar", "Rendah", "Sedang", "Lazy loading, WebP, responsive sizing; evaluasi blob public untuk optimasi"],
    ["Model baru diluncurkan sebelum update selesai", "Sedang", "Rendah", "SOP untuk penambahan model baru; template skrip upload yang siap pakai"],
  ],
  [28, 14, 12, 46]
));

// ─────────── 9. SUMBER DAYA ───────────
bodyChildren.push(heading("9. Kebutuhan Sumber Daya"));
bodyChildren.push(body("Implementasi rencana ini memerlukan sumber daya yang terencana dengan baik, baik dari segi manusia maupun teknis. Berikut adalah estimasi kebutuhan sumber daya untuk setiap fase."));

bodyChildren.push(heading("9.1 Sumber Daya Manusia", HeadingLevel.HEADING_2));
bodyChildren.push(new Paragraph({
  keepNext: true,
  spacing: { before: 200, after: 100 },
  children: [new TextRun({ text: "Tabel 9: Estimasi Kebutuhan SDM", bold: true, size: 21, color: c(P.primary) })],
}));
bodyChildren.push(makeTable(
  ["Peran", "Fase 1", "Fase 2", "Fase 3", "Total (minggu-orang)"],
  [
    ["Frontend Developer", "1 orang, 2 minggu", "0.5 orang, 2 minggu", "1 orang, 2 minggu", "5"],
    ["Backend Developer", "1 orang, 2 minggu", "1 orang, 2 minggu", "0.5 orang, 1 minggu", "5.5"],
    ["Content/Verifikasi", "1 orang, 1 minggu", "1 orang, 2 minggu", "1 orang, 1 minggu", "4"],
    ["QA Testing", "0.5 orang, 1 minggu", "0.5 orang, 1 minggu", "0.5 orang, 1 minggu", "1.5"],
  ],
  [22, 22, 22, 22, 12]
));

bodyChildren.push(heading("9.2 Sumber Daya Teknis", HeadingLevel.HEADING_2));
nextList();
bodyChildren.push(numberedItem("Vercel Blob Storage: Kapasitas saat ini perlu diverifikasi. Estimasi kebutuhan tambahan: sekitar 200-300 gambar dengan rata-rata 500KB per gambar = sekitar 100-150 MB tambahan. Ini seharusnya masih dalam batas paket Vercel."));
bodyChildren.push(numberedItem("Turso Database: Tidak ada penambahan tabel, hanya pembaruan kolom yang sudah ada (imagePath, gallery). Kapasitas seharusnya memadai."));
bodyChildren.push(numberedItem("Skrip dan Tools: Semua skrip sudah ada di direktori /scripts/ dan dapat dimodifikasi. Tidak diperlukan tools baru selain yang sudah ada di proyek."));
bodyChildren.push(numberedItem("Akses Sumber Resmi: Pastikan akses ke mitsubishi-motors.co.id dan ktbfuso.co.id tidak terblokir. Jika scraping tidak memungkinkan, unduh gambar secara manual dari halaman produk resmi."));

// ─────────── 10. MANFAAT YANG DIHARAPKAN ───────────
bodyChildren.push(heading("10. Manfaat yang Diharapkan"));
bodyChildren.push(body("Implementasi rencana ini akan memberikan manfaat signifikan baik dari perspektif pengguna maupun operasional. Dari sisi pengguna, website akan menampilkan gambar yang 100% akurat dan konsisten, memberikan kepercayaan lebih tinggi terhadap informasi yang disajikan. Pengguna akan dapat melihat kendaraan dalam warna pilihan mereka (bukan hanya swatch warna), mengeksplorasi galeri dari berbagai sudut, dan mendapatkan representasi visual yang tepat untuk setiap varian yang diminati."));
bodyChildren.push(body("Dari sisi operasional, adanya API upload yang berfungsi memungkinkan tim konten memperbarui gambar tanpa bantuan developer, mengurangi bottleneck. Pedoman konsistensi dan alur kerja yang terdokumentasi mengurangi risiko kesalahan manusia dan memastikan standar kualitas terjaga meskipun ada pergantian personel. Skrip monitoring otomatis mendeteksi masalah lebih awal sebelum berdampak pada pengguna. Secara keseluruhan, investasi dalam rencana ini akan menghasilkan website yang lebih profesional, informatif, dan mudah dipelihara\u2014sejalan dengan citra merek Mitsubishi yang mengutamakan kualitas dan keandalan."));

// === ASSEMBLE DOCUMENT ===
const bodySection = {
  properties: {
    type: SectionType.NEXT_PAGE,
    page: {
      size: pgSize,
      margin: pgMargin,
      pageNumbers: { start: 1, formatType: NumberFormat.DECIMAL },
    },
  },
  headers: {
    default: new Header({
      children: [new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [new TextRun({ text: "Rencana Verifikasi Gambar Kendaraan \u2014 Mitsubishi-Test", size: 18, color: "90989F", italics: true })],
      })],
    }),
  },
  footers: { default: footerCenter() },
  children: bodyChildren,
};

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: { ascii: "Calibri", eastAsia: "Microsoft YaHei" }, size: 24, color: c(P.body) },
        paragraph: { spacing: { line: 312 } },
      },
      heading1: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 32, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 360, after: 160, line: 312 } },
      },
      heading2: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 28, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 240, after: 120, line: 312 } },
      },
      heading3: {
        run: { font: { ascii: "Calibri", eastAsia: "SimHei" }, size: 24, bold: true, color: c(P.primary) },
        paragraph: { spacing: { before: 200, after: 100, line: 312 } },
      },
    },
  },
  numbering: { config: numberingConfig },
  sections: [coverSection, tocSection, bodySection],
});

const outputPath = "/home/z/my-project/download/Rencana_Verifikasi_Gambar_Kendaraan_Mitsubishi.docx";
Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(outputPath, buf);
  console.log("Document generated: " + outputPath);
});
