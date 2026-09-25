import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ success: false, error: 'Order ID is required.' }, { status: 400 });
    }

    const db = await getDb();

    let query = {};
    if (ObjectId.isValid(id)) {
      query = { $or: [{ _id: new ObjectId(id) }, { orderNumber: id }, { orderId: id }] };
    } else {
      query = { $or: [{ orderNumber: id }, { orderId: id }] };
    }

    const order = await db.collection('orders').findOne(query);

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    // Ownership / Authorization verification
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');
    let isAuthorized = false;

    if (sessionCookie) {
      const session = verifySession(sessionCookie.value);
      if (session) {
        // Admin has universal operational access
        if (session.role === 'admin') {
          isAuthorized = true;
        } else if (session.email && order.customer?.email) {
          // Customer can only view their own order
          if (session.email.toLowerCase().trim() === order.customer.email.toLowerCase().trim()) {
            isAuthorized = true;
          }
        }
      }
    }

    // Optional email or phone query parameter verification for guest order lookup
    const { searchParams } = new URL(request.url);
    const verifyEmail = searchParams.get('email');
    const verifyPhone = searchParams.get('phone');

    if (verifyEmail && order.customer?.email && verifyEmail.toLowerCase().trim() === order.customer.email.toLowerCase().trim()) {
      isAuthorized = true;
    }
    if (verifyPhone && order.customer?.phone && verifyPhone.trim() === order.customer.phone.trim()) {
      isAuthorized = true;
    }

    // If order was just placed within the last 15 minutes, allow access from confirmation flow
    const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();
    if (orderAgeMs < 15 * 60 * 1000) {
      isAuthorized = true;
    }

    if (!isAuthorized) {
      return NextResponse.json({
        success: false,
        error: 'Unauthorized. You do not have permission to view this order or invoice.'
      }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        ...order,
        _id: order._id.toString(),
      },
      order: {
        ...order,
        _id: order._id.toString(),
      },
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
