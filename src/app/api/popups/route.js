import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// GET /api/popups — returns only ACTIVE popups for the storefront
export async function GET() {
  try {
    const db = await getDb();
    const config = await db.collection('settings').findOne({ _id: 'promo_popups' });
    const all = config?.popups || [];
    const active = all.filter(p => p.isActive !== false);
    return NextResponse.json({ success: true, popups: active });
  } catch (error) {
    // Graceful fallback — return empty, don't crash storefront
    return NextResponse.json({ success: true, popups: [], fallback: true });
  }
}
