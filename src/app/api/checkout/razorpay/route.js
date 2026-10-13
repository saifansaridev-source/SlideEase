import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';
import { calculateAuthoritativePricing } from '@/lib/pricing';
import { getDb } from '@/lib/mongodb';

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
      receipt = `order_${Date.now()}`,
      orderData = null
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
      authoritativeTotal = Number(body.amount);
    } else {
      return NextResponse.json({ success: false, error: 'Valid order items or amount are required.' }, { status: 400 });
    }

    if (!authoritativeTotal || authoritativeTotal <= 0) {
      return NextResponse.json({ success: false, error: 'Calculated order total must be greater than zero.' }, { status: 400 });
    }

    // Support both RAZORPAY_KEY_ID and NEXT_PUBLIC_RAZORPAY_KEY_ID
    const key_id = (process.env.RAZORPAY_KEY_ID || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '').replace(/^["']|["']$/g, '').trim();
    const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').replace(/^["']|["']$/g, '').trim();

    if (!key_id || !key_secret) {
      return NextResponse.json({
        success: false,
        error: 'Razorpay API credentials are not configured on the server. Please verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in environment.'
      }, { status: 500 });
    }

    // Detect placeholder values
    if (key_secret.startsWith('REPLACE_WITH') || key_secret.includes('your_razorpay_key_secret')) {
      return NextResponse.json({
        success: false,
        error: 'Razorpay key secret appears to be a placeholder. Please configure your live/test Razorpay Key Secret.'
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

    const razorpayOrder = await razorpay.orders.create(options);

    // Persist pending order intent to prevent lost payments if the customer browser drops
    try {
      const db = await getDb();
      const customerInfo = orderData || body.customer || {};
      const orderNumber = `SE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      await db.collection('orders').insertOne({
        orderNumber,
        customer: {
          firstName: customerInfo.firstName || customerInfo.firstname || '',
          lastName: customerInfo.lastName || customerInfo.lastname || '',
          email: (customerInfo.email || '').toLowerCase().trim(),
          phone: customerInfo.phone || '',
          address: customerInfo.address || '',
          city: customerInfo.city || '',
          state: customerInfo.state || 'Maharashtra',
          zip: customerInfo.zip || '',
        },
        items: authoritativePricing ? authoritativePricing.items : items,
        pricing: authoritativePricing ? authoritativePricing.pricing : { total: authoritativeTotal, subtotal: authoritativeTotal, shipping: 0 },
        coupon: authoritativePricing ? authoritativePricing.coupon : null,
        b2g1: authoritativePricing ? authoritativePricing.b2g1 : null,
        giftWrapMessage: customerInfo.giftWrapMessage || '',
        payment: {
          method: 'Razorpay Online',
          status: 'Pending',
          verified: false,
          razorpayOrderId: razorpayOrder.id,
          razorpayPaymentId: null,
          createdAt: new Date(),
        },
        status: 'Pending Payment',
        fulfillmentStatus: 'Unfulfilled',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    } catch (dbErr) {
      console.warn('Pending order draft persistence non-fatal warning:', dbErr.message);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      },
      keyId: key_id,
      pricing: authoritativePricing ? authoritativePricing.pricing : null,
    });
  } catch (error) {
    const errorMsg = error.statusCode === 401
      ? 'Razorpay API credentials rejected (401 Authentication failed). Please verify your RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local.'
      : (error.message || 'Failed to create Razorpay order.');
    return NextResponse.json({ 
      success: false, 
      error: errorMsg 
    }, { status: 400 });
  }
}
