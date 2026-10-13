import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const rawData = doc ? { ...DEFAULTS, ...doc } : DEFAULTS;

    // Ensure numeric fields are strongly typed
    const cleanData = {
      ...rawData,
      freeShippingThreshold: parseFloat(rawData.freeShippingThreshold) || 999,
      shippingFlatRate: parseFloat(rawData.shippingFlatRate) || 79,
      expressDeliveryCharge: parseFloat(rawData.expressDeliveryCharge) || 149,
      codCharge: parseFloat(rawData.codCharge) || 49,
      taxRate: parseFloat(rawData.taxRate) || 18,
      cgstRate: parseFloat(rawData.cgstRate) || 9,
      sgstRate: parseFloat(rawData.sgstRate) || 9,
      taxIncludedInPrice: Boolean(rawData.taxIncludedInPrice),
      codEnabled: Boolean(rawData.codEnabled),
      expressEnabled: Boolean(rawData.expressEnabled),
      freeShippingEnabled: Boolean(rawData.freeShippingEnabled),
      standardDeliveryDays: String(rawData.standardDeliveryDays || '5-7'),
      expressDeliveryDays: String(rawData.expressDeliveryDays || '2-3'),
    };

    delete cleanData._id;
    delete cleanData.key;

    return NextResponse.json(
      { success: true, data: cleanData },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        },
      }
    );
  } catch (err) {
    // On any DB error return defaults so storefront never breaks
    console.warn('Failed to fetch shipping settings from DB, using fallback defaults:', err.message);
    return NextResponse.json({ success: true, data: DEFAULTS });
  }
}
