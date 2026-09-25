import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { DEFAULT_BLOGS } from '@/lib/blog-defaults';
import { isConnectionError } from '@/lib/dbFallback';

export async function GET() {
  try {
    const db = await getDb();
    const count = await db.collection('blogs').countDocuments();
    
    if (count === 0) {
      await db.collection('blogs').insertMany(DEFAULT_BLOGS);
    }
    
    // Only return published blogs to public storefront
    const blogs = await db.collection('blogs')
      .find({ status: 'published' })
      .sort({ createdAt: -1 })
      .toArray();
      
    return NextResponse.json({ success: true, data: blogs });
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("MongoDB connection failed. Using mock published blogs.", error.message);
      const publishedDefaults = DEFAULT_BLOGS.filter(b => b.status === 'published');
      return NextResponse.json({ success: true, data: publishedDefaults, isFallback: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
