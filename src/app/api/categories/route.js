import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { MOCK_CATEGORIES, isConnectionError } from '@/lib/dbFallback';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getDb();
    const categories = await db.collection('categories')
      .find({ $or: [{ isActive: true }, { isActive: { $exists: false } }] })
      .sort({ displayOrder: 1, name: 1 })
      .toArray();

    return NextResponse.json(
      { success: true, data: categories },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn('MongoDB connection failed in public categories route. Using fallback.', error.message);
      return NextResponse.json({ success: true, data: MOCK_CATEGORIES, isFallback: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
