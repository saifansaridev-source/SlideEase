import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export async function POST(request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      orderData,
      isCod = false 
    } = await request.json();

    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    let paymentVerified = false;
    let paymentStatus = 'Pending';
    let orderStatus = 'Pending';

    // 1. Verify Razorpay signature if online payment
    if (!isCod) {
      if (!key_secret) {
        return NextResponse.json({ 
          success: false, 
          error: 'Razorpay secret key is not configured on the server.' 
        }, { status: 500 });
      }

      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json({ 
          success: false, 
          error: 'Missing Razorpay payment identifiers.' 
        }, { status: 400 });
      }

      const generated_signature = crypto
        .createHmac('sha256', key_secret)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

      // STRICT: Must match HMAC SHA-256 exactly. No fallback, no bypass.
      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ 
          success: false, 
          error: 'Razorpay HMAC SHA-256 signature verification failed. Payment cannot be marked as Paid.' 
        }, { status: 400 });
      }

      // ONLY set to 'Paid' upon exact cryptographically verified HMAC signature match
      paymentVerified = true;
      paymentStatus = 'Paid';
      orderStatus = 'Processing';
    } else {
      // Cash on Delivery — payment is strictly Pending until doorstep collection
      paymentVerified = false;
      paymentStatus = 'Pending (COD)';
      orderStatus = 'Processing';
    }

    // 2. Connect to MongoDB
    const client = await clientPromise;
    const db = client.db('startupbiz');

    // Generate human-friendly order reference
    const orderNumber = `SE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder = {
      orderNumber,
      customer: {
        firstName: orderData.firstName || orderData.firstname,
        lastName: orderData.lastName || orderData.lastname,
        email: (orderData.email || '').toLowerCase().trim(),
        phone: orderData.phone,
        address: orderData.address,
        city: orderData.city,
        state: orderData.state,
        zip: orderData.zip,
      },
      items: orderData.items || [],
      pricing: {
        subtotal: orderData.subtotal || 0,
        discount: orderData.discount || 0,
        giftWrap: orderData.giftWrap || 0,
        shipping: orderData.shipping || 0,
        total: orderData.total || 0,
      },
      giftWrapMessage: orderData.giftWrapMessage || '',
      payment: {
        method: isCod ? 'COD' : (orderData.paymentMethod || 'Razorpay Online'),
        status: paymentStatus,
        verified: paymentVerified,
        razorpayOrderId: razorpay_order_id || null,
        razorpayPaymentId: razorpay_payment_id || null,
        paidAt: paymentVerified ? new Date() : null,
      },
      status: orderStatus,
      fulfillmentStatus: 'Unfulfilled',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await db.collection('orders').insertOne(newOrder);
    const orderId = insertResult.insertedId.toString();

    // 3. If user is logged in, clear their cart and award loyalty points
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('slidex_session');
      if (sessionCookie) {
        const session = verifySession(sessionCookie.value);
        if (session && session.email) {
          const earnedPoints = Math.floor(newOrder.pricing.total / 50); // 1 point per ₹50 spent
          await db.collection('users').updateOne(
            { email: session.email },
            { 
              $set: { cart: [] },
              $inc: { points: earnedPoints }
            }
          );
        }
      }
    } catch (authErr) {
      // Non-blocking
    }

    return NextResponse.json({
      success: true,
      orderId,
      orderNumber,
      message: isCod 
        ? 'Order placed successfully with Cash on Delivery!' 
        : 'Payment verified and order confirmed successfully!'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
