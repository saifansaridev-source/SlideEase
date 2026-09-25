import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { calculateAuthoritativePricing } from '@/lib/pricing';

export async function POST(request) {
  try {
    const body = await request.json();
    const { 
      items, 
      couponCode, 
      shippingMethod = 'standard', 
      giftWrap = false,
      b2g1FreeProductId,
      b2g1FreeSize,
      currency = 'INR', 
      receipt = `order_${Date.now()}` 
    } = body;

    // Backend-authoritative calculation: calculate price directly from MongoDB
    let authoritativeTotal;
    let authoritativePricing;

    if (items && Array.isArray(items) && items.length > 0) {
      authoritativePricing = await calculateAuthoritativePricing({
        items,
        couponCode,
        shippingMethod,
        isCod: false,
        giftWrap,
        b2g1FreeProductId,
        b2g1FreeSize,
      });
      authoritativeTotal = authoritativePricing.pricing.total;
    } else if (body.amount && body.amount > 0) {
      // Fallback for direct amount if items not passed, but warn
      authoritativeTotal = Number(body.amount);
    } else {
      return NextResponse.json({ success: false, error: 'Valid order items or amount are required.' }, { status: 400 });
    }

    if (!authoritativeTotal || authoritativeTotal <= 0) {
      return NextResponse.json({ success: false, error: 'Calculated order total must be greater than zero.' }, { status: 400 });
    }

    const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_id || !key_secret) {
      return NextResponse.json({
        success: false,
        error: 'Razorpay API keys are not configured on the server. Please check your environment variables.'
      }, { status: 500 });
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    const amountInPaise = Math.round(authoritativeTotal * 100);

    const options = {
      amount: amountInPaise,
      currency,
      receipt,
      notes: {
        brand: 'SlideEase Footwear',
        coupon: couponCode || 'NONE',
      },
    };

    const order = await razorpay.orders.create(options);

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      keyId: key_id,
      pricing: authoritativePricing ? authoritativePricing.pricing : null,
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create Razorpay order.' 
    }, { status: 400 });
  }
}
