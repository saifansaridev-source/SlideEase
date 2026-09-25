import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { calculateAuthoritativePricing } from '@/lib/pricing';
import { sendOrderConfirmationEmail } from '@/lib/email';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature, 
      orderData,
      isCod = false 
    } = await request.json();

    if (!orderData || !orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: 'Order data must contain items.' 
      }, { status: 400 });
    }

    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const db = await getDb();

    // 1. Idempotency Check: Prevent duplicate orders on retries/refreshes
    if (!isCod && razorpay_payment_id) {
      const existingOrder = await db.collection('orders').findOne({
        'payment.razorpayPaymentId': razorpay_payment_id
      });
      if (existingOrder) {
        return NextResponse.json({
          success: true,
          orderId: existingOrder._id.toString(),
          orderNumber: existingOrder.orderNumber,
          message: 'Payment already processed and order confirmed.',
          isExisting: true,
        });
      }
    }

    let paymentVerified = false;
    let paymentStatus = 'Pending';
    let orderStatus = 'Processing';

    // 2. Verify Razorpay signature if online payment
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

      // STRICT: Must match HMAC SHA-256 exactly
      if (generated_signature !== razorpay_signature) {
        return NextResponse.json({ 
          success: false, 
          error: 'Razorpay HMAC SHA-256 signature verification failed. Payment cannot be marked as Paid.' 
        }, { status: 400 });
      }

      paymentVerified = true;
      paymentStatus = 'Paid';
      orderStatus = 'Processing';
    } else {
      // Cash on Delivery
      paymentVerified = false;
      paymentStatus = 'Pending (COD)';
      orderStatus = 'Processing';
    }

    // 3. BACKEND-AUTHORITATIVE PRICING RECALCULATION
    // Re-verify all item prices, promotions, shipping, taxes, and coupon codes from DB
    const authoritativePricing = await calculateAuthoritativePricing({
      items: orderData.items,
      couponCode: orderData.couponCode || (orderData.coupon?.code),
      shippingMethod: orderData.shippingMethod || 'standard',
      isCod,
      giftWrap: !!orderData.giftWrap,
      b2g1FreeProductId: orderData.b2g1FreeProductId,
      b2g1FreeSize: orderData.b2g1FreeSize,
    });

    // 4. ATOMIC INVENTORY DEDUCTION (Phase 4)
    // Decrement sizeStock and stockQty atomically. Rollback if any product is sold out.
    const decrementedItems = [];
    for (const item of authoritativePricing.items) {
      // Exclude free items if marked
      const qtyToDeduct = item.quantity || 1;
      const sizeKey = String(item.size).trim();

      const filter = {
        $or: [
          { id: item.id },
          ...(ObjectId.isValid(item.id) ? [{ _id: new ObjectId(item.id) }] : [])
        ],
        [`sizeStock.${sizeKey}`]: { $gte: qtyToDeduct },
        stockQty: { $gte: qtyToDeduct }
      };

      const update = {
        $inc: {
          [`sizeStock.${sizeKey}`]: -qtyToDeduct,
          stockQty: -qtyToDeduct
        },
        $set: {
          updatedAt: new Date().toISOString()
        }
      };

      const updateResult = await db.collection('products').updateOne(filter, update);

      if (updateResult.matchedCount === 0) {
        // Rollback all prior decrements
        for (const rolled of decrementedItems) {
          await db.collection('products').updateOne(
            { id: rolled.id },
            { 
              $inc: { 
                [`sizeStock.${rolled.size}`]: rolled.quantity, 
                stockQty: rolled.quantity 
              } 
            }
          );
        }

        return NextResponse.json({
          success: false,
          error: `Insufficient stock for "${item.name}" (Size UK ${sizeKey}). The item became unavailable during checkout.`
        }, { status: 409 });
      }

      decrementedItems.push({
        id: item.id,
        size: sizeKey,
        quantity: qtyToDeduct,
      });
    }

    // 5. Update coupon usage count if applied
    if (authoritativePricing.coupon?.code) {
      await db.collection('coupons').updateOne(
        { code: authoritativePricing.coupon.code },
        { $inc: { usedCount: 1 } }
      );
    }

    // 6. Generate human-friendly order number
    const orderNumber = `SE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const newOrder = {
      orderNumber,
      customer: {
        firstName: orderData.firstName || orderData.firstname || '',
        lastName: orderData.lastName || orderData.lastname || '',
        email: (orderData.email || '').toLowerCase().trim(),
        phone: orderData.phone || '',
        address: orderData.address || '',
        city: orderData.city || '',
        state: orderData.state || '',
        zip: orderData.zip || '',
      },
      items: authoritativePricing.items,
      pricing: authoritativePricing.pricing,
      coupon: authoritativePricing.coupon,
      b2g1: authoritativePricing.b2g1,
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

    // 7. If customer is authenticated, clear cart and award loyalty points
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('slidex_session');
      if (sessionCookie) {
        const session = verifySession(sessionCookie.value);
        if (session && session.email) {
          const earnedPoints = Math.floor(newOrder.pricing.total / 50); // 1 pt per ₹50 spent
          await db.collection('users').updateOne(
            { email: session.email },
            { 
              $set: { cart: [] },
              $inc: { points: earnedPoints },
            }
          );
        }
      }
    } catch (authErr) {
      // Non-blocking
    }

    // 8. Dispatch transactional order confirmation email
    try {
      await sendOrderConfirmationEmail(newOrder);
    } catch (emailErr) {
      console.warn('Order confirmation email trigger failed:', emailErr.message);
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
