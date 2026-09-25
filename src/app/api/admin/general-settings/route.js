import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const DEFAULTS = {
  storeName: 'SlideEase',
  storeTagline: 'Walk in Comfort. Stand in Style.',
  supportEmail: 'support@slideease.in',
  supportPhone: '+91 98200 12345',
  whatsappNumber: '919820012345',
  address: 'SlideEase Footwear Studio, Mumbai, Maharashtra 400001',
  gstNumber: '27AABCS1234F1Z5',
  maintenanceMode: false,
  loyaltyPointsEnabled: true,
  loyaltyPointsPerRupee: 1,        // pts earned per ₹ spent
  loyaltyRedemptionRate: 100,      // pts needed per ₹1 discount
  reviewModerationEnabled: false,
  maxCartItems: 10,
  defaultCurrency: 'INR',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://slideease.in',
};

export async function GET() {
  try {
    const db = await getDb();

    const doc = await db.collection('settings').findOne({ key: 'general' });

    if (!doc) {
      return NextResponse.json({ success: true, data: DEFAULTS });
    }

    const { _id, key, ...data } = doc;
    return NextResponse.json({ success: true, data: { ...DEFAULTS, ...data } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const allowed = Object.keys(DEFAULTS);
    const update = {};
    for (const k of allowed) {
      if (body[k] !== undefined) update[k] = body[k];
    }

    const db = await getDb();

    await db.collection('settings').updateOne(
      { key: 'general' },
      { $set: { key: 'general', ...update, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'General settings saved.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
