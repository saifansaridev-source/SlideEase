import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// Public endpoint — returns only the settings the storefront needs
const DEFAULTS = {
  freeShippingThreshold: 999,
  shippingFlatRate: 79,
  standardDeliveryDays: '5-7',
  expressDeliveryDays: '2-3',
  expressDeliveryCharge: 149,
  codCharge: 49,
  taxRate: 18,
  cgstRate: 9,
  sgstRate: 9,
  taxIncludedInPrice: true,
  codEnabled: true,
  expressEnabled: true,
  freeShippingEnabled: true,
};

export async function GET() {
  try {
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ key: 'shipping_tax' });

    if (!doc) {
      return NextResponse.json({ success: true, data: DEFAULTS });
    }

    const { _id, key, ...data } = doc;
    return NextResponse.json({ success: true, data: { ...DEFAULTS, ...data } });
  } catch {
    // On any DB error return defaults so storefront never breaks
    return NextResponse.json({ success: true, data: DEFAULTS });
  }
}
