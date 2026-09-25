import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { DEFAULT_HERO_SLIDES } from '@/lib/cms-defaults';

export async function GET() {
  try {
    const db = await getDb();
    const bannerConfig = await db.collection('settings').findOne({ _id: 'hero_banner' });
    
    // Merge saved slides with default structure
    const savedSlides = Array.isArray(bannerConfig?.slides) && bannerConfig.slides.length > 0 
      ? bannerConfig.slides 
      : DEFAULT_HERO_SLIDES.map((s, idx) => ({
          ...s,
          image: bannerConfig?.[`heroImage${idx + 1}`] || s.image
        }));

    return NextResponse.json({
      success: true,
      banner: {
        heroImage1: bannerConfig?.heroImage1 || savedSlides[0]?.image || '',
        heroImage2: bannerConfig?.heroImage2 || savedSlides[1]?.image || '',
        heroImage3: bannerConfig?.heroImage3 || savedSlides[2]?.image || '',
        slides: savedSlides,
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { slides, heroImage1, heroImage2, heroImage3 } = body;
    
    const db = await getDb();
    
    // Derive heroImage1, 2, 3 from slides if slides provided
    const img1 = heroImage1 || slides?.[0]?.image || '';
    const img2 = heroImage2 || slides?.[1]?.image || '';
    const img3 = heroImage3 || slides?.[2]?.image || '';

    const updateDoc = {
      heroImage1: img1.trim(),
      heroImage2: img2.trim(),
      heroImage3: img3.trim(),
      updatedAt: new Date()
    };

    if (Array.isArray(slides)) {
      updateDoc.slides = slides;
    }
    
    await db.collection('settings').updateOne(
      { _id: 'hero_banner' },
      { $set: updateDoc },
      { upsert: true }
    );

    // Keep cms_sections in sync
    await db.collection('settings').updateOne(
      { _id: 'cms_sections' },
      { 
        $set: { 
          heroImage1: img1.trim(),
          heroImage2: img2.trim(),
          heroImage3: img3.trim(),
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Hero banners and slide contents updated successfully in MongoDB!' 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
