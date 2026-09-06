import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'Slidexfootware');
    
    const bannerConfig = await db.collection('settings').findOne({ _id: 'hero_banner' });
    
    return NextResponse.json({
      success: true,
      banner: {
        heroImage1: bannerConfig?.heroImage1 || '',
        heroImage2: bannerConfig?.heroImage2 || '',
        heroImage3: bannerConfig?.heroImage3 || '',
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
