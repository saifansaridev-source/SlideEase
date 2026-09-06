import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Not authenticated', orders: [] }, { status: 401 });
    }

    const sessionData = verifySession(sessionCookie.value);
    if (!sessionData || !sessionData.email) {
      return NextResponse.json({ success: false, error: 'Invalid session', orders: [] }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db('startupbiz');

    const orders = await db
      .collection('orders')
      .find({ 'customer.email': sessionData.email.toLowerCase().trim() })
      .sort({ createdAt: -1 })
      .toArray();

    const formatted = orders.map((o) => ({
      ...o,
      _id: o._id.toString(),
    }));

    return NextResponse.json({ success: true, orders: formatted });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    if (!body.customer?.email || !body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Mandatory checkout fields are missing' }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db('startupbiz');

    const orderNumber = `SE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const orderData = {
      orderNumber,
      customer: body.customer,
      payment: {
        method: body.payment?.method || body.paymentMethod || 'Pending',
        status: body.payment?.status === 'Paid' ? 'Paid' : 'Pending',
        verified: body.payment?.status === 'Paid',
        razorpayOrderId: body.payment?.razorpayOrderId || null,
        razorpayPaymentId: body.payment?.razorpayPaymentId || null,
        paidAt: body.payment?.status === 'Paid' ? new Date() : null,
      },
      status: body.payment?.status === 'Paid' ? 'Processing' : 'Pending',
      fulfillmentStatus: 'Unfulfilled',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(orderData);

    return NextResponse.json({
      success: true,
      orderId: result.insertedId.toString(),
      orderNumber,
      order: orderData,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
