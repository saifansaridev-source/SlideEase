import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// GET /api/admin/popups — list all popups
export async function GET() {
  try {
    const db = await getDb();
    const config = await db.collection('settings').findOne({ _id: 'promo_popups' });
    return NextResponse.json({ success: true, popups: config?.popups || [] });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST /api/admin/popups — create or update popup(s)
export async function POST(request) {
  try {
    const body = await request.json();
    const { popups } = body;

    if (!Array.isArray(popups)) {
      return NextResponse.json({ success: false, error: 'Invalid payload: popups must be an array.' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('settings').updateOne(
      { _id: 'promo_popups' },
      { $set: { popups, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Popup configuration saved successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
