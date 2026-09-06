import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { amount, currency = 'INR', receipt = `order_${Date.now()}` } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid order amount.' }, { status: 400 });
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

    const options = {
      amount: Math.round(amount * 100), // convert rupees to paise
      currency,
      receipt,
      notes: {
        brand: 'SlideEase Footwear',
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
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create Razorpay order.' 
    }, { status: error.statusCode || 500 });
  }
}
