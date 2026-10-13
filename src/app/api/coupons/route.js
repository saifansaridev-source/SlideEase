import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { MOCK_COUPONS, isConnectionError } from '@/lib/dbFallback';

// Public endpoint — returns active, non-expired coupons for display on checkout
// (Does NOT expose usageLimit secrets; only shows displayable info)
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDb();
    const now = new Date();

    // Only return active coupons that haven't expired
    const filter = {
      active: { $ne: false },
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    };

    const coupons = await db.collection('coupons').find(filter, {
      projection: {
        code: 1,
        discount: 1,
        type: 1,
        minOrder: 1,
        active: 1,
        expiresAt: 1,
        // Exclude usageLimit/usedCount from public view
      },
    }).toArray();

    // Format for storefront display
    const displayCoupons = coupons.map(c => ({
      code: c.code,
      discount: c.discount,
      type: c.type || 'percentage',
      minOrder: c.minOrder || 0,
      label: c.type === 'flat'
        ? `₹${c.discount} off`
        : `${Math.round((c.discount <= 1 ? c.discount : c.discount / 100) * 100)}% off`,
      minOrderLabel: c.minOrder > 0 ? `Min. order ₹${c.minOrder}` : 'No minimum',
      expiresAt: c.expiresAt || null,
    }));

    return NextResponse.json({ success: true, coupons: displayCoupons });
  } catch (error) {
    if (isConnectionError(error)) {
      // Fallback: return a sanitized subset of mock coupons
      const fallback = (MOCK_COUPONS || [])
        .filter(c => c.active !== false)
        .map(c => ({
          code: c.code,
          discount: c.discount,
          type: c.type || 'percentage',
          minOrder: c.minOrder || 0,
          label: `${Math.round((c.discount <= 1 ? c.discount : c.discount / 100) * 100)}% off`,
          minOrderLabel: c.minOrder > 0 ? `Min. order ₹${c.minOrder}` : 'No minimum',
          expiresAt: null,
        }));
      return NextResponse.json({ success: true, coupons: fallback, isFallback: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
