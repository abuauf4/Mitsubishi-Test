# Sprint A Agent Work Record — Task ID: A

## Agent: Sprint A
## Date: 2026-03-04

---

## Task Summary
Fix blocking issues in Mitsubishi-Test project: create missing /api/admin/upload route, fix schema.sql sync, and create a reusable upload utility script.

---

## Task 1: Create /api/admin/upload/route.ts ✅

**Problem:** The admin `ImageUpload` component POSTs FormData to `/api/admin/upload` but this route did not exist, causing all admin image uploads to fail with 404.

**Solution:** Created `src/app/api/admin/upload/route.ts` with:
- POST handler accepting FormData with a `file` field
- Upload to Vercel Blob using `put()` from `@vercel/blob`
- Returns JSON `{ path: "/api/image?url=" + encodeURIComponent(blobUrl), blobUrl, filename }` matching what ImageUpload.tsx expects
- Validation: only image MIME types (jpg, png, webp, gif), max 5MB file size
- Proper error handling with try/catch and descriptive error/hint messages
- Generates unique blob pathnames with `admin-uploads/{sanitized_name}_{timestamp}.{ext}`
- Uses `addRandomSuffix: true` for collision avoidance
- Helper `mimeToExt()` for fallback extension when original filename lacks one

**File created:** `src/app/api/admin/upload/route.ts`

---

## Task 2: Fix schema.sql ✅

**Problem:** `src/lib/schema.sql` was out of sync with `prisma/schema.prisma`. Three columns were missing:
1. `gallery TEXT` on Vehicle table (Prisma has `gallery String?`)
2. `imagePath TEXT` on VehicleVariant table (Prisma has `imagePath String?`)
3. `description TEXT` on VehicleVariant table (Prisma has `description String?`)

**Solution:** Added all three columns to schema.sql:
- Vehicle table: added `gallery TEXT` after `specsShort` (line 93)
- VehicleVariant table: added `imagePath TEXT` and `description TEXT` before `highlights` (lines 109-110)

**File modified:** `src/lib/schema.sql`

---

## Task 3: Create scripts/upload-images.mjs ✅

**Problem:** No reusable generic upload utility existed. Existing scripts (upload-passenger-batch1.mjs, upload-commercial.mjs) are hardcoded for specific catalogs.

**Solution:** Created `scripts/upload-images.mjs` with:
- Three input modes: `--dir` (local directory), `--urls` (comma-separated URLs), `--url-file` (JSON file with URL array)
- Configurable `--prefix` for blob path naming (default: "uploads")
- Configurable `--output` for report file path (default: ./download/upload-report.json)
- Configurable `--api` endpoint
- `--dry-run` mode to list files without uploading
- Recursive directory scanning for image files (jpg, png, webp, gif)
- Retry logic (3 retries with 2s delay) for both download and upload
- Rate limiting (500ms between uploads)
- Deduplication-aware naming with `sanitizeFilename()`
- JSON report output with stats (total, uploaded, failed, skipped)
- Follows the same pattern as existing upload scripts (FormData → API, same helpers)

**File created:** `scripts/upload-images.mjs`

---

## Verification
- All new files pass ESLint with zero errors/warnings
- Dev server running without errors on all routes
- Pre-existing lint errors (in download/ scripts) are unchanged and unrelated
