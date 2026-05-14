import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getStaticTestimonials } from '@/lib/static-data';

export async function GET() {
  const db = getDb();
  if (!db) {
    return NextResponse.json(getStaticTestimonials());
  }
  try {
    const result = await db.execute({
      sql: 'SELECT * FROM Testimonial WHERE active = 1 ORDER BY displayOrder ASC',
      args: []
    });
    const testimonials = result.rows.map(row => ({
      ...row,
      active: row.active === 1,
      rating: Number(row.rating),
      displayOrder: Number(row.displayOrder),
    }));
    return NextResponse.json(testimonials);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return NextResponse.json({ error: 'Failed to fetch testimonials' }, { status: 500 });
  }
}
