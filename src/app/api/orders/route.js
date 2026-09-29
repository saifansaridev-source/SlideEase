import { getDb } from '@/lib/mongodb';
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

    const db = await getDb();

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

    if (!body.customer?.email) {
      return NextResponse.json({ success: false, error: 'Customer email is required.' }, { status: 400 });
    }

    // Validate items: must be a non-empty array with required fields on each item
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.length === 0) {
      return NextResponse.json({ success: false, error: 'Order must contain at least one item.' }, { status: 400 });
    }

    // Sanitise and preserve item data as-received (this route does NOT re-verify prices server-side;
    // the authoritative checkout flow via /api/checkout/verify is the preferred path).
    // We still persist all provided item fields so the order record is complete.
    const items = rawItems.map((item) => {
      const q = parseInt(item.quantity || item.qty || 1, 10);
      const p = parseFloat(item.unitPrice || item.price || 0);
      return {
        id:        item.productId || item.id || '',
        productId: item.productId || item.id || '',
        name:      item.name || 'Unknown Product',
        slug:      item.slug || item.id || '',
        size:      item.size || item.variant || '',
        color:     item.color || '',
        quantity:  q,
        qty:       q,
        unitPrice: p,
        price:     p,
        lineTotal: parseFloat(item.lineTotal || (p * q)),
        image:     item.image || '',
        sku:       item.sku || '',
      };
    });

    const db = await getDb();

    const orderNumber = `SE-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;

    const orderData = {
      orderNumber,
      customer: {
        firstName:  body.customer.firstName  || body.customer.firstname  || '',
        lastName:   body.customer.lastName   || body.customer.lastname   || '',
        email:      (body.customer.email || '').toLowerCase().trim(),
        phone:      body.customer.phone  || '',
        address:    body.customer.address || '',
        city:       body.customer.city   || '',
        state:      body.customer.state  || '',
        zip:        body.customer.zip    || '',
      },
      // CRITICAL FIX: persist line items on every order document
      items,
      pricing: body.pricing || {
        subtotal: body.subtotal || 0,
        discount: body.discount || 0,
        shipping: body.shipping || 0,
        total:    body.total   || 0,
        currency: 'INR',
      },
      coupon:         body.coupon         || null,
      shippingMethod: body.shippingMethod || 'standard',
      payment: {
        method:             body.payment?.method || body.paymentMethod || 'Pending',
        status:             body.payment?.status === 'Paid' ? 'Paid' : 'Pending',
        verified:           body.payment?.status === 'Paid',
        razorpayOrderId:    body.payment?.razorpayOrderId    || null,
        razorpayPaymentId:  body.payment?.razorpayPaymentId  || null,
        paidAt:             body.payment?.status === 'Paid' ? new Date() : null,
      },
      status:           body.payment?.status === 'Paid' ? 'Processing' : 'Pending',
      fulfillmentStatus: 'Unfulfilled',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('orders').insertOne(orderData);

    return NextResponse.json({
      success: true,
      orderId: result.insertedId.toString(),
      orderNumber,
      order: { ...orderData, _id: result.insertedId.toString() },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
