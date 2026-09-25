import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { DEFAULT_HERO_SLIDES } from '@/lib/cms-defaults';

export async function GET() {
  try {
    const db = await getDb();
    const bannerConfig = await db.collection('settings').findOne({ _id: 'hero_banner' });
    
    // Resolve slides: use saved slides or fallback to default slides
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
    return NextResponse.json({ 
      success: true, 
      banner: {
        heroImage1: '',
        heroImage2: '',
        heroImage3: '',
        slides: DEFAULT_HERO_SLIDES
      },
      fallback: true
    });
  }
}
