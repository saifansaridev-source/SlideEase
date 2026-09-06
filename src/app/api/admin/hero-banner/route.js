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

export async function POST(request) {
  try {
    const body = await request.json();
    const { heroImage1 = '', heroImage2 = '', heroImage3 = '' } = body;
    
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || 'Slidexfootware');
    
    await db.collection('settings').updateOne(
      { _id: 'hero_banner' },
      { 
        $set: { 
          heroImage1: heroImage1.trim(), 
          heroImage2: heroImage2.trim(), 
          heroImage3: heroImage3.trim(),
          updatedAt: new Date()
        } 
      },
      { upsert: true }
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Hero banners updated successfully in MongoDB!' 
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
