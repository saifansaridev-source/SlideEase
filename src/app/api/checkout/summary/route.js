import { calculateAuthoritativePricing } from '@/lib/pricing';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { items, couponCode, shippingMethod, isCod, giftWrap, b2g1FreeProductId, b2g1FreeSize } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: 'No items provided for pricing.' }, { status: 400 });
    }

    const calculation = await calculateAuthoritativePricing({
      items,
      couponCode,
      shippingMethod,
      isCod,
      giftWrap,
      b2g1FreeProductId,
      b2g1FreeSize,
    });

    return NextResponse.json({
      success: true,
      data: calculation,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Pricing calculation failed',
    }, { status: 400 });
  }
}
