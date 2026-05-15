import { getDb } from '@/lib/db';
import { getStaticHero } from '@/lib/static-data';
import { ensureMigrations } from '@/lib/auto-migrate';

export interface HeroData {
  id: string;
  title: string;
  subtitle: string;
  imagePath: string;
  ctaText: string;
  ctaLink: string;
  page: string;
  active: boolean;
}

function proxyBlobUrl(url: string | null | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('/api/image?')) return url;
  if (url.includes('vercel-storage.com') || url.includes('blob.vercel-storage.com')) {
    return `/api/image?url=${encodeURIComponent(url)}`;
  }
  return url;
}

export async function fetchHeroData(page: string = 'home'): Promise<HeroData> {
  const db = getDb();
  if (!db) return getStaticHero(page) as HeroData;

  try {
    await ensureMigrations();
    const result = await db.execute({
      sql: 'SELECT * FROM Hero WHERE active = 1 AND page = ? LIMIT 1',
      args: [page],
    });
    if (result.rows.length === 0) return getStaticHero(page) as HeroData;

    const row = result.rows[0];
    return {
      id: (row.id as string) || `hero-${page}`,
      title: (row.title as string) || '',
      subtitle: (row.subtitle as string) || '',
      imagePath: proxyBlobUrl(row.imagePath as string) || '/images/hero-cinematic.png',
      ctaText: (row.ctaText as string) || '',
      ctaLink: (row.ctaLink as string) || '',
      page: (row.page as string) || page,
      active: row.active === 1,
    };
  } catch {
    return getStaticHero(page) as HeroData;
  }
}
