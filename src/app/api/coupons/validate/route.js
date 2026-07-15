import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const subtotalStr = searchParams.get('subtotal');
    
    if (!code) {
      return NextResponse.json({ success: false, error: 'Coupon code is missing' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const coupon = await db.collection('coupons').findOne({ code: code.toUpperCase() });
    
    if (!coupon) {
      return NextResponse.json({ success: false, error: 'Invalid coupon code' }, { status: 404 });
    }
    
    if (!coupon.active) {
      return NextResponse.json({ success: false, error: 'This coupon code has expired' }, { status: 400 });
    }
    
    if (subtotalStr) {
      const subtotal = parseFloat(subtotalStr);
      if (coupon.minOrder && subtotal < coupon.minOrder) {
        return NextResponse.json({ 
          success: false, 
          error: `Minimum order amount of ₹${coupon.minOrder} required for this coupon` 
        }, { status: 400 });
      }
    }
    
    return NextResponse.json({ 
      success: true, 
      discount: coupon.discount,
      code: coupon.code,
      message: `Promo code applied! ${Math.round(coupon.discount * 100)}% discount applied.`
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
