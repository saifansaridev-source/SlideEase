import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

const DEFAULTS = {
  storeName: 'SlideEase',
  storeTagline: 'Walk in Comfort. Stand in Style.',
  supportEmail: 'support@your-domain.com',
  supportPhone: '+91 98765 43210',
  whatsappNumber: '919876543210',
  address: '',
  gstNumber: '',
  maintenanceMode: false,
  loyaltyPointsEnabled: true,
  loyaltyPointsPerRupee: 1,        // pts earned per ₹ spent
  loyaltyRedemptionRate: 100,      // pts needed per ₹1 discount
  reviewModerationEnabled: false,
  maxCartItems: 10,
  defaultCurrency: 'INR',
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://your-domain.com',
};

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('startupbiz');

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

    const client = await clientPromise;
    const db = client.db('startupbiz');

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
