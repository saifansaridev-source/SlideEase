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
    
    // Normalize discount to a fraction (0.10 for 10%)
    let discountFraction = 0;
    const rawDisc = parseFloat(coupon.discount || 0);
    if (coupon.type === 'fixed') {
      // Fixed amount — return as-is, fraction not applicable
      discountFraction = 0;
    } else if (rawDisc > 0 && rawDisc <= 1) {
      // Already a fraction e.g. 0.10 = 10%
      discountFraction = rawDisc;
    } else if (rawDisc > 1 && rawDisc <= 100) {
      // Integer percentage e.g. 10 = 10%
      discountFraction = rawDisc / 100;
    }

    const displayLabel = coupon.type === 'fixed'
      ? `₹${coupon.discount} off applied!`
      : `${Math.round(discountFraction * 100)}% discount applied`;

    return NextResponse.json({ 
      success: true, 
      discount: discountFraction,
      type: coupon.type || 'percentage',
      value: rawDisc,
      maxDiscount: coupon.maxDiscount || null,
      code: coupon.code,
      message: `Promo code applied! ${displayLabel}.`
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const code = body.code;
    const subtotal = parseFloat(body.subtotal || 0);

    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is missing' }, { status: 400 });
    }

    const db = await getDb();
    const coupon = await db.collection('coupons').findOne({ code: code.trim().toUpperCase() });

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

    if (coupon.minOrder && subtotal < coupon.minOrder) {
      return NextResponse.json({ 
        success: false, 
        error: `Minimum order amount of ₹${coupon.minOrder} required for this coupon` 
      }, { status: 400 });
    }

    // Normalize discount to a fraction (0.10 for 10%)
    let discountFraction = 0;
    const rawDiscPost = parseFloat(coupon.discount || 0);
    if (coupon.type === 'fixed') {
      discountFraction = 0;
    } else if (rawDiscPost > 0 && rawDiscPost <= 1) {
      discountFraction = rawDiscPost;
    } else if (rawDiscPost > 1 && rawDiscPost <= 100) {
      discountFraction = rawDiscPost / 100;
    }

    const postDisplayLabel = coupon.type === 'fixed'
      ? `₹${coupon.discount} off applied!`
      : `${Math.round(discountFraction * 100)}% discount applied`;

    return NextResponse.json({ 
      success: true, 
      valid: true,
      discount: discountFraction,
      type: coupon.type || 'percentage',
      value: rawDiscPost,
      maxDiscount: coupon.maxDiscount || null,
      code: coupon.code,
      message: `Promo code applied! ${postDisplayLabel}.`
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

