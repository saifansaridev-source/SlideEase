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

    const key_secret = (process.env.RAZORPAY_KEY_SECRET || '').replace(/^["']|["']$/g, '').trim();
    const db = await getDb();

    // 1. Idempotency Check: Prevent duplicate orders on retries/refreshes
    if (!isCod && razorpay_payment_id) {
      const existingPaidOrder = await db.collection('orders').findOne({
        'payment.razorpayPaymentId': razorpay_payment_id,
        'payment.status': 'Paid',
      });
      if (existingPaidOrder) {
        return NextResponse.json({
          success: true,
          orderId: existingPaidOrder._id.toString(),
          orderNumber: existingPaidOrder.orderNumber,
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

      // STRICT: Must match HMAC SHA-256 in constant time (protects against timing attacks)
      const sigBuffer = Buffer.from(razorpay_signature, 'utf8');
      const genBuffer = Buffer.from(generated_signature, 'utf8');
      if (sigBuffer.length !== genBuffer.length || !crypto.timingSafeEqual(sigBuffer, genBuffer)) {
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

    // Check if the order was already marked Paid by webhook
    if (razorpay_order_id) {
      const webhookConfirmedOrder = await db.collection('orders').findOne({
        'payment.razorpayOrderId': razorpay_order_id,
        'payment.status': 'Paid',
      });
      if (webhookConfirmedOrder) {
        return NextResponse.json({
          success: true,
          orderId: webhookConfirmedOrder._id.toString(),
          orderNumber: webhookConfirmedOrder.orderNumber,
          message: 'Payment verified and order confirmed successfully!',
          isExisting: true,
        });
      }
    }

    // 3. BACKEND-AUTHORITATIVE PRICING RECALCULATION
    const authoritativePricing = await calculateAuthoritativePricing({
      items: orderData.items,
      couponCode: orderData.couponCode || (orderData.coupon?.code),
      shippingMethod: orderData.shippingMethod || 'standard',
      isCod,
      giftWrap: !!orderData.giftWrap,
      b2g1FreeProductId: orderData.b2g1FreeProductId,
      b2g1FreeSize: orderData.b2g1FreeSize,
    });

    // 4. ATOMIC INVENTORY DEDUCTION
    const decrementedItems = [];
    for (const item of authoritativePricing.items) {
      const qtyToDeduct = item.quantity || 1;
      const sizeKey = String(item.size).trim();

      const prodDoc = await db.collection('products').findOne({
        $or: [
          { id: item.id },
          ...(ObjectId.isValid(item.id) ? [{ _id: new ObjectId(item.id) }] : [])
        ]
      });

      if (!prodDoc) {
        for (const rolled of decrementedItems) {
          await db.collection('products').updateOne(
            { $or: [{ id: rolled.id }, ...(ObjectId.isValid(rolled.id) ? [{ _id: new ObjectId(rolled.id) }] : [])] },
            { 
              $inc: { 
                [`sizeStock.${rolled.size}`]: rolled.quantity,
                ...(rolled.hadStockQty ? { stockQty: rolled.quantity } : {})
              } 
            }
          );
        }
        return NextResponse.json({
          success: false,
          error: `Product "${item.name}" was not found in catalog.`
        }, { status: 409 });
      }

      const hasSizeStock = prodDoc.sizeStock && typeof prodDoc.sizeStock[sizeKey] === 'number';
      const availableSizeQty = hasSizeStock ? prodDoc.sizeStock[sizeKey] : (typeof prodDoc.stockQty === 'number' ? prodDoc.stockQty : 50);

      if (availableSizeQty < qtyToDeduct) {
        for (const rolled of decrementedItems) {
          await db.collection('products').updateOne(
            { $or: [{ id: rolled.id }, ...(ObjectId.isValid(rolled.id) ? [{ _id: new ObjectId(rolled.id) }] : [])] },
            { 
              $inc: { 
                [`sizeStock.${rolled.size}`]: rolled.quantity,
                ...(rolled.hadStockQty ? { stockQty: rolled.quantity } : {})
              } 
            }
          );
        }
        return NextResponse.json({
          success: false,
          error: `Insufficient stock for "${item.name}" (Size UK ${sizeKey}). The item became unavailable during checkout.`
        }, { status: 409 });
      }

      const updateFilter = {
        _id: prodDoc._id,
        ...(hasSizeStock ? { [`sizeStock.${sizeKey}`]: { $gte: qtyToDeduct } } : {})
      };

      const hasStockQty = typeof prodDoc.stockQty === 'number';
      const incPayload = {
        ...(hasSizeStock ? { [`sizeStock.${sizeKey}`]: -qtyToDeduct } : {}),
        ...(hasStockQty ? { stockQty: -qtyToDeduct } : {})
      };

      const updateResult = await db.collection('products').updateOne(updateFilter, {
        $inc: incPayload,
        $set: { updatedAt: new Date().toISOString() }
      });

      if (updateResult.matchedCount === 0) {
        for (const rolled of decrementedItems) {
          await db.collection('products').updateOne(
            { $or: [{ id: rolled.id }, ...(ObjectId.isValid(rolled.id) ? [{ _id: new ObjectId(rolled.id) }] : [])] },
            { 
              $inc: { 
                [`sizeStock.${rolled.size}`]: rolled.quantity,
                ...(rolled.hadStockQty ? { stockQty: rolled.quantity } : {})
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
        hadStockQty: hasStockQty,
      });
    }

    // 5. Update coupon usage count if applied
    if (authoritativePricing.coupon?.code) {
      await db.collection('coupons').updateOne(
        { code: authoritativePricing.coupon.code },
        { $inc: { usedCount: 1 } }
      );
    }

    // 6. Check for existing pending order draft (created during /api/checkout/razorpay)
    let orderId;
    let orderNumber;
    let orderRecord;

    const existingPendingOrder = razorpay_order_id
      ? await db.collection('orders').findOne({ 'payment.razorpayOrderId': razorpay_order_id })
      : null;

    if (existingPendingOrder) {
      orderId = existingPendingOrder._id.toString();
      orderNumber = existingPendingOrder.orderNumber;

      const customerPayload = {
        firstName: orderData.firstName || orderData.firstname || existingPendingOrder.customer?.firstName || '',
        lastName: orderData.lastName || orderData.lastname || existingPendingOrder.customer?.lastName || '',
        email: (orderData.email || existingPendingOrder.customer?.email || '').toLowerCase().trim(),
        phone: orderData.phone || existingPendingOrder.customer?.phone || '',
        address: orderData.address || existingPendingOrder.customer?.address || '',
        city: orderData.city || existingPendingOrder.customer?.city || '',
        state: orderData.state || existingPendingOrder.customer?.state || 'Maharashtra',
        zip: orderData.zip || existingPendingOrder.customer?.zip || '',
      };

      await db.collection('orders').updateOne(
        { _id: existingPendingOrder._id },
        {
          $set: {
            customer: customerPayload,
            items: authoritativePricing.items,
            pricing: authoritativePricing.pricing,
            coupon: authoritativePricing.coupon,
            b2g1: authoritativePricing.b2g1,
            giftWrapMessage: orderData.giftWrapMessage || existingPendingOrder.giftWrapMessage || '',
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
            updatedAt: new Date(),
          }
        }
      );

      orderRecord = {
        ...existingPendingOrder,
        orderNumber,
        customer: customerPayload,
        items: authoritativePricing.items,
        pricing: authoritativePricing.pricing,
        payment: {
          method: isCod ? 'COD' : 'Razorpay Online',
          status: paymentStatus,
          verified: paymentVerified,
          razorpayPaymentId,
        },
      };
    } else {
      orderNumber = `SE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

      const newOrder = {
        orderNumber,
        customer: {
          firstName: orderData.firstName || orderData.firstname || '',
          lastName: orderData.lastName || orderData.lastname || '',
          email: (orderData.email || '').toLowerCase().trim(),
          phone: orderData.phone || '',
          address: orderData.address || '',
          city: orderData.city || '',
          state: orderData.state || 'Maharashtra',
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
      orderId = insertResult.insertedId.toString();
      orderRecord = newOrder;
    }

    // 7. If customer is authenticated, clear cart and award loyalty points
    try {
      const cookieStore = await cookies();
      const sessionCookie = cookieStore.get('slidex_session');
      if (sessionCookie) {
        const session = verifySession(sessionCookie.value);
        if (session && session.email) {
          const earnedPoints = Math.floor(orderRecord.pricing.total / 50); // 1 pt per ₹50 spent
          await db.collection('users').updateOne(
            { email: session.email.toLowerCase().trim() },
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
      await sendOrderConfirmationEmail(orderRecord);
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
    const isConflict = error.message?.includes('Insufficient stock') || error.message?.includes('not found') || error.message?.includes('unavailable');
    return NextResponse.json({ success: false, error: error.message }, { status: isConflict ? 409 : 500 });
  }
}
