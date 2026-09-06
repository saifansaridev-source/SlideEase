import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// Default settings if none stored in DB yet
const DEFAULTS = {
  freeShippingThreshold: 999,
  shippingFlatRate: 79,
  codCharge: 49,
  taxRate: 18,          // GST % (combined CGST+SGST or IGST)
  cgstRate: 9,
  sgstRate: 9,
  taxIncludedInPrice: true,   // whether displayed prices are tax-inclusive
  standardDeliveryDays: '5-7',
  expressDeliveryDays: '2-3',
  expressDeliveryCharge: 149,
  codEnabled: true,
  expressEnabled: true,
  freeShippingEnabled: true,
};

// GET: Return current shipping & tax settings
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('startupbiz');

    const doc = await db.collection('settings').findOne({ key: 'shipping_tax' });

    if (!doc) {
      return NextResponse.json({ success: true, data: DEFAULTS });
    }

    const { _id, key, ...data } = doc;
    return NextResponse.json({ success: true, data: { ...DEFAULTS, ...data } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST/PUT: Save shipping & tax settings (upsert)
export async function POST(request) {
  try {
    const body = await request.json();

    // Only allow known setting keys to be saved
    const allowed = Object.keys(DEFAULTS);
    const update = {};
    for (const k of allowed) {
      if (body[k] !== undefined) update[k] = body[k];
    }

    const client = await clientPromise;
    const db = client.db('startupbiz');

    await db.collection('settings').updateOne(
      { key: 'shipping_tax' },
      { $set: { key: 'shipping_tax', ...update, updatedAt: new Date() } },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Shipping & Tax settings saved.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
