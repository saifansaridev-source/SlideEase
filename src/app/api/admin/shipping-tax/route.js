import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function requireAdmin() {
  const cookieStore = await cookies();
  const sc = cookieStore.get('slidex_session');
  if (!sc) return null;
  const s = verifySession(sc.value);
  return s?.role === 'admin' ? s : null;
}

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
    const db = await getDb();
    const doc = await db.collection('settings').findOne({ key: 'shipping_tax' });

    if (!doc) {
      return NextResponse.json({ success: true, data: DEFAULTS });
    }

    const { _id, key, ...data } = doc;
    const cleanData = {
      ...DEFAULTS,
      ...data,
      freeShippingThreshold: parseFloat(data.freeShippingThreshold ?? DEFAULTS.freeShippingThreshold),
      shippingFlatRate: parseFloat(data.shippingFlatRate ?? DEFAULTS.shippingFlatRate),
      expressDeliveryCharge: parseFloat(data.expressDeliveryCharge ?? DEFAULTS.expressDeliveryCharge),
      codCharge: parseFloat(data.codCharge ?? DEFAULTS.codCharge),
      taxRate: parseFloat(data.taxRate ?? DEFAULTS.taxRate),
      cgstRate: parseFloat(data.cgstRate ?? DEFAULTS.cgstRate),
      sgstRate: parseFloat(data.sgstRate ?? DEFAULTS.sgstRate),
      taxIncludedInPrice: Boolean(data.taxIncludedInPrice ?? DEFAULTS.taxIncludedInPrice),
      codEnabled: Boolean(data.codEnabled ?? DEFAULTS.codEnabled),
      expressEnabled: Boolean(data.expressEnabled ?? DEFAULTS.expressEnabled),
      freeShippingEnabled: Boolean(data.freeShippingEnabled ?? DEFAULTS.freeShippingEnabled),
      standardDeliveryDays: String(data.standardDeliveryDays || DEFAULTS.standardDeliveryDays),
      expressDeliveryDays: String(data.expressDeliveryDays || DEFAULTS.expressDeliveryDays),
    };

    return NextResponse.json({ success: true, data: cleanData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Save shipping & tax settings (upsert)
export async function POST(request) {
  try {
    if (!await requireAdmin()) {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access.' }, { status: 401 });
    }
    const body = await request.json();

    const NUMERIC_FIELDS = [
      'freeShippingThreshold',
      'shippingFlatRate',
      'expressDeliveryCharge',
      'codCharge',
      'taxRate',
      'cgstRate',
      'sgstRate',
    ];

    const BOOLEAN_FIELDS = [
      'freeShippingEnabled',
      'expressEnabled',
      'codEnabled',
      'taxIncludedInPrice',
    ];

    const STRING_FIELDS = [
      'standardDeliveryDays',
      'expressDeliveryDays',
    ];

    const update = {};

    for (const k of NUMERIC_FIELDS) {
      if (body[k] !== undefined) {
        const val = parseFloat(body[k]);
        if (isNaN(val) || val < 0) {
          return NextResponse.json({ success: false, error: `Invalid numeric value for "${k}". Must be 0 or greater.` }, { status: 400 });
        }
        update[k] = val;
      }
    }

    for (const k of BOOLEAN_FIELDS) {
      if (body[k] !== undefined) {
        update[k] = Boolean(body[k]);
      }
    }

    for (const k of STRING_FIELDS) {
      if (body[k] !== undefined) {
        update[k] = String(body[k]).trim();
      }
    }

    const db = await getDb();

    await db.collection('settings').updateOne(
      { key: 'shipping_tax' },
      { $set: { key: 'shipping_tax', ...update, updatedAt: new Date() } },
      { upsert: true }
    );

    // Fetch the updated document to confirm persistence
    const savedDoc = await db.collection('settings').findOne({ key: 'shipping_tax' });
    const { _id, key, ...cleanSaved } = savedDoc || {};

    return NextResponse.json({ 
      success: true, 
      message: 'Shipping & Tax settings saved successfully.',
      data: cleanSaved
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
