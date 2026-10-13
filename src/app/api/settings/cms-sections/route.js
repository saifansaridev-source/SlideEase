import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { DEFAULT_SECTION_IMAGES } from '@/lib/cms-defaults';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getDb();
    
    // Check cms_sections document
    const doc = await db.collection('settings').findOne({ _id: 'cms_sections' });

    // Also check hero_banner document for backwards compatibility
    const heroDoc = await db.collection('settings').findOne({ _id: 'hero_banner' });

    const rawData = doc?.images || doc || {};
    const { _id, updatedAt, images, ...pureImages } = rawData;

    // Filter out empty strings so they fall back to DEFAULT_SECTION_IMAGES
    const overrides = {};
    for (const [k, v] of Object.entries(pureImages)) {
      if (typeof v === 'string' && v.trim() !== '') {
        overrides[k] = v.trim();
      }
    }

    const merged = {
      ...DEFAULT_SECTION_IMAGES,
      ...overrides,
    };

    // Hero banner fallback chain
    if (heroDoc?.heroImage1?.trim()) merged.heroImage1 = heroDoc.heroImage1.trim();
    if (heroDoc?.heroImage2?.trim()) merged.heroImage2 = heroDoc.heroImage2.trim();
    if (heroDoc?.heroImage3?.trim()) merged.heroImage3 = heroDoc.heroImage3.trim();
    if (pureImages.heroImage1?.trim()) merged.heroImage1 = pureImages.heroImage1.trim();
    if (pureImages.heroImage2?.trim()) merged.heroImage2 = pureImages.heroImage2.trim();
    if (pureImages.heroImage3?.trim()) merged.heroImage3 = pureImages.heroImage3.trim();

    return NextResponse.json({
      success: true,
      images: merged,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      images: DEFAULT_SECTION_IMAGES,
      fallback: true,
      error: error.message,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
      }
    });
  }
}
