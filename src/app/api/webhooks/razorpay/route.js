import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { sendOrderConfirmationEmail } from '@/lib/email';

export async function POST(request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-razorpay-signature');

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (!webhookSecret) {
      console.warn('Razorpay webhook secret not configured.');
      return NextResponse.json({ success: false, error: 'Webhook secret missing.' }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ success: false, error: 'Signature header missing.' }, { status: 400 });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(rawBody)
      .digest('hex');

    if (signature !== expectedSignature) {
      return NextResponse.json({ success: false, error: 'Invalid webhook signature.' }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const db = await getDb();

    // Handle payment capture / order paid events
    if (event === 'order.paid' || event === 'payment.captured') {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderEntity = payload.payload?.order?.entity;

      const razorpayOrderId = orderEntity?.id || paymentEntity?.order_id;
      const razorpayPaymentId = paymentEntity?.id;

      if (razorpayOrderId) {
        const order = await db.collection('orders').findOne({
          $or: [
            { 'payment.razorpayOrderId': razorpayOrderId },
            { 'payment.razorpayPaymentId': razorpayPaymentId },
          ],
        });

        if (order && order.payment?.status !== 'Paid') {
          await db.collection('orders').updateOne(
            { _id: order._id },
            {
              $set: {
                'payment.status': 'Paid',
                'payment.verified': true,
                'payment.razorpayPaymentId': razorpayPaymentId,
                'payment.paidAt': new Date(),
                status: 'Processing',
                updatedAt: new Date(),
              },
            }
          );

          try {
            await sendOrderConfirmationEmail({
              ...order,
              payment: { ...order.payment, status: 'Paid', razorpayPaymentId },
            });
          } catch (err) {
            console.warn('Webhook email dispatch error:', err.message);
          }
        }
      }
    }

    // Always respond 200 OK to acknowledge webhook receipt idempotently
    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('Razorpay webhook handler error:', error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
