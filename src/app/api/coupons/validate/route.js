import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const subtotalStr = searchParams.get('subtotal');
    
    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is missing' }, { status: 400 });
    }
    
    const db = await getDb();
    const coupon = await db.collection('coupons').findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 404 });
    }
    
    if (coupon.active === false) {
      return NextResponse.json({ success: false, error: 'This coupon code has been deactivated' }, { status: 400 });
    }

    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ success: false, error: 'This coupon code has expired' }, { status: 400 });
    }

    if (coupon.usageLimit && (coupon.usedCount || 0) >= coupon.usageLimit) {
      return NextResponse.json({ success: false, error: 'This coupon has reached its usage limit' }, { status: 400 });
    }
    
    const subtotal = subtotalStr ? parseFloat(subtotalStr) : 0;
    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json({ 
        success: false, 
        error: `Minimum order amount of ₹${coupon.minOrder} required for this coupon` 
      }, { status: 400 });
    }
    
    // Normalize discount
    let discountFraction = 0;
    if (coupon.type === 'percentage' || (!coupon.type && coupon.discount < 1)) {
      discountFraction = coupon.discount <= 1 ? coupon.discount : coupon.discount / 100;
    }

    return NextResponse.json({ 
      success: true, 
      discount: discountFraction,
      type: coupon.type || 'percentage',
      value: coupon.discount,
      maxDiscount: coupon.maxDiscount || null,
      code: coupon.code,
      message: `Promo code applied! ${coupon.type === 'flat' ? `₹${coupon.discount} off` : `${Math.round(discountFraction * 100)}% discount applied`}.`
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
