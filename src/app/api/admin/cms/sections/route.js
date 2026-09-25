import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { DEFAULT_SECTION_IMAGES } from '@/lib/cms-defaults';

export async function GET() {
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ _id: 'cms_sections' });
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
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const db = await getDb();

    // Sanitize and keep keys clean
    const updateFields = {};
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string') {
        updateFields[key] = value.trim();
      }
    }

    updateFields.updatedAt = new Date();

    // 1. Update cms_sections
    await db.collection('settings').updateOne(
      { _id: 'cms_sections' },
      { $set: updateFields },
      { upsert: true }
    );

    // 2. Synchronize hero banner document if hero images were passed
    if (updateFields.heroImage1 !== undefined || updateFields.heroImage2 !== undefined || updateFields.heroImage3 !== undefined) {
      await db.collection('settings').updateOne(
        { _id: 'hero_banner' },
        { 
          $set: {
            heroImage1: updateFields.heroImage1 || '',
            heroImage2: updateFields.heroImage2 || '',
            heroImage3: updateFields.heroImage3 || '',
            updatedAt: new Date()
          } 
        },
        { upsert: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Storefront section images updated successfully in database!',
      images: updateFields,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
