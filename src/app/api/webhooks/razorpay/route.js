import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendOrderConfirmationEmail, sendPaymentFailedEmail } from '@/lib/email';
import { ObjectId } from 'mongodb';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.warn('Razorpay webhook secret is not configured in server environment.');
      return NextResponse.json({ success: false, error: 'Webhook secret missing.' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ success: false, error: 'Signature header missing.' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret.trim())
      .update(rawBody)
      .digest('hex');

    const sigBuffer = Buffer.from(signature, 'utf8');
    const expBuffer = Buffer.from(expectedSignature, 'utf8');
    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      return NextResponse.json({ success: false, error: 'Invalid webhook signature.' }, { status: 400 });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (parseErr) {
      return NextResponse.json({ success: false, error: 'Invalid JSON payload.' }, { status: 400 });
    }

    const event = payload.event;
    const eventId = payload.event_id || payload.id || `${event}_${Date.now()}`;
    const db = await getDb();

    // 1. Webhook Idempotency Check (prevent duplicate event processing)
    const existingEvent = await db.collection('webhook_events').findOne({ eventId });
    if (existingEvent) {
      return NextResponse.json({ success: true, message: 'Event already processed', idempotent: true });
    }

    await db.collection('webhook_events').insertOne({
      eventId,
      event,
      receivedAt: new Date(),
    });

    // 2. Handle Payment Captured / Order Paid Events
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const razorpayOrderId = orderEntity?.id || paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId || razorpayPaymentId) {
        const orderQuery = {
          $or: [
            ...(razorpayOrderId ? [{ 'payment.razorpayOrderId': razorpayOrderId }] : []),
            ...(razorpayPaymentId ? [{ 'payment.razorpayPaymentId': razorpayPaymentId }] : []),
          ],
        };

        const order = await db.collection('orders').findOne(orderQuery);

        if (order && order.payment?.status !== 'Paid') {
          // If inventory wasn't already deducted, deduct atomically
          if (!order.inventoryDeducted) {
            for (const item of (order.items || [])) {
              const qtyToDeduct = item.quantity || item.qty || 1;
              const sizeKey = String(item.size).trim();
              const targetId = item.id || item.productId;

              await db.collection('products').updateOne(
                {
                  $or: [
                    { id: targetId },
                    ...(ObjectId.isValid(targetId) ? [{ _id: new ObjectId(targetId) }] : [])
                  ]
                },
                {
                  $inc: {
                    [`sizeStock.${sizeKey}`]: -qtyToDeduct,
                    stockQty: -qtyToDeduct,
                  },
                  $set: { updatedAt: new Date().toISOString() }
                }
              );
            }
          }

          await db.collection('orders').updateOne(
            { _id: order._id },
            {
              $set: {
                'payment.status': 'Paid',
                'payment.verified': true,
                'payment.razorpayPaymentId': razorpayPaymentId || order.payment?.razorpayPaymentId,
                'payment.paidAt': new Date(),
                inventoryDeducted: true,
                status: 'Processing',
                updatedAt: new Date(),
              },
            }
          );

          try {
            await sendOrderConfirmationEmail({
              ...order,
              payment: {
                ...order.payment,
                status: 'Paid',
                razorpayPaymentId: razorpayPaymentId || order.payment?.razorpayPaymentId
              },
            });
          } catch (err) {
            console.warn('Webhook order confirmation email dispatch error:', err.message);
          }
        }
      }
    } 
    // 3. Handle Payment Failed Event
    else if (event === 'payment.failed') {
      const paymentEntity = payload.payload?.payment?.entity;
      const razorpayOrderId = paymentEntity?.order_id;
      const failureReason = paymentEntity?.error_description || 'Payment declined by bank';

      if (razorpayOrderId) {
        const order = await db.collection('orders').findOne({
          'payment.razorpayOrderId': razorpayOrderId,
          'payment.status': { $ne: 'Paid' },
        });

        if (order) {
          await db.collection('orders').updateOne(
            { _id: order._id },
            {
              $set: {
                'payment.status': 'Failed',
                'payment.failureReason': failureReason,
                status: 'Payment Failed',
                updatedAt: new Date(),
              },
            }
          );

          try {
            await sendPaymentFailedEmail(order, failureReason);
          } catch (err) {
            console.warn('Webhook payment failure notification error:', err.message);
          }
        }
      }
    }

    // Always acknowledge Razorpay webhook delivery within response SLA
    return NextResponse.json({ success: true, received: true, event });
  } catch (error) {
    console.error('Razorpay webhook handler exception:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
