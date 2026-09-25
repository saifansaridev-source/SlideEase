import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { DEFAULT_SECTION_IMAGES } from '@/lib/cms-defaults';

export async function GET() {
  try {
    const db = await getDb();
    
    // Check cms_sections document
    const doc = await db.collection('settings').findOne({ _id: 'cms_sections' });

    // Also check hero_banner document for backwards compatibility
    const heroDoc = await db.collection('settings').findOne({ _id: 'hero_banner' });

    const merged = {
      ...DEFAULT_SECTION_IMAGES,
      ...(doc?.images || doc || {}),
      heroImage1: doc?.heroImage1 || heroDoc?.heroImage1 || DEFAULT_SECTION_IMAGES.heroImage1,
      heroImage2: doc?.heroImage2 || heroDoc?.heroImage2 || DEFAULT_SECTION_IMAGES.heroImage2,
      heroImage3: doc?.heroImage3 || heroDoc?.heroImage3 || DEFAULT_SECTION_IMAGES.heroImage3,
    };

    return NextResponse.json({
      success: true,
      images: merged,
    });
  } catch (error) {
    return NextResponse.json({
      success: true,
      images: DEFAULT_SECTION_IMAGES,
      fallback: true,
      error: error.message,
    });
  }
}
