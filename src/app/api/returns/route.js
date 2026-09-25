import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { ObjectId } from 'mongodb';

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');

    if (!sessionCookie) {
      return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
    }

    const session = verifySession(sessionCookie.value);
    if (!session || !session.email) {
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const db = await getDb();
    const userReturns = await db
      .collection('returns')
      .find({ customerEmail: session.email.toLowerCase().trim() })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: userReturns.map((r) => ({ ...r, _id: r._id.toString() })),
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');
    const session = sessionCookie ? verifySession(sessionCookie.value) : null;

    const body = await request.json();
    const { 
      orderId, 
      type = 'return', // 'return' | 'exchange'
      itemId, 
      size, 
      replacementSize, 
      reason, 
      notes, 
      customerEmail: providedEmail 
    } = body;

    const email = (session?.email || providedEmail || '').toLowerCase().trim();

    if (!orderId || !reason || !email) {
      return NextResponse.json(
        { success: false, error: 'Order ID, reason, and customer email are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // Verify order exists and belongs to this customer
    let orderQuery = {};
    if (ObjectId.isValid(orderId)) {
      orderQuery = { $or: [{ _id: new ObjectId(orderId) }, { orderNumber: orderId }] };
    } else {
      orderQuery = { orderNumber: orderId };
    }

    const order = await db.collection('orders').findOne(orderQuery);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found.' }, { status: 404 });
    }

    if (order.customer?.email?.toLowerCase().trim() !== email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: This order does not match your customer account.' },
        { status: 403 }
      );
    }

    // Verify item exists in order
    const orderedItem = (order.items || []).find(
      (i) => i.id === itemId || i.productId === itemId || i.name === itemId
    ) || order.items?.[0];

    // If footwear size exchange: verify live replacement size inventory
    let exchangeDetails = null;
    if (type === 'exchange') {
      if (!replacementSize) {
        return NextResponse.json(
          { success: false, error: 'Please select a replacement footwear size for the exchange.' },
          { status: 400 }
        );
      }

      // Check product stock for replacement size
      const targetProdId = orderedItem.id || orderedItem.productId;
      const productDoc = await db.collection('products').findOne({
        $or: [
          { id: targetProdId },
          ...(ObjectId.isValid(targetProdId) ? [{ _id: new ObjectId(targetProdId) }] : [])
        ]
      });

      const repSizeKey = String(replacementSize).trim();
      const availableStock = productDoc?.sizeStock && typeof productDoc.sizeStock[repSizeKey] === 'number'
        ? productDoc.sizeStock[repSizeKey]
        : 10;

      if (availableStock <= 0) {
        return NextResponse.json({
          success: false,
          error: `Requested replacement size UK ${repSizeKey} is currently out of stock. Please select another size or choose a refund return.`
        }, { status: 400 });
      }

      exchangeDetails = {
        originalSize: size || orderedItem.size,
        replacementSize: repSizeKey,
        stockAvailable: availableStock,
      };
    }

    // Calculate maximum refundable amount for this item
    const itemRefundAmount = orderedItem ? (orderedItem.lineTotal || orderedItem.unitPrice || 0) : 0;

    const returnDoc = {
      returnNumber: `RET-${Date.now().toString().slice(-6)}`,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      type, // 'return' | 'exchange'
      customerName: `${order.customer.firstName} ${order.customer.lastName || ''}`.trim(),
      customerEmail: email,
      customerPhone: order.customer.phone || '',
      items: [
        {
          name: orderedItem?.name || 'Footwear Item',
          size: size || orderedItem?.size || 'Standard',
          quantity: 1,
          price: itemRefundAmount,
          id: orderedItem?.id || '',
        }
      ],
      exchangeDetails,
      reason,
      notes: notes || '',
      status: 'pending', // pending | approved | rejected | quality_check | completed
      refundAmount: type === 'return' ? itemRefundAmount : 0,
      adminNotes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const insertResult = await db.collection('returns').insertOne(returnDoc);

    // Update order with return reference
    await db.collection('orders').updateOne(
      { _id: order._id },
      { 
        $set: { 
          returnStatus: `${type === 'exchange' ? 'Exchange' : 'Return'} Requested`,
          updatedAt: new Date() 
        } 
      }
    );

    return NextResponse.json({
      success: true,
      returnId: insertResult.insertedId.toString(),
      returnNumber: returnDoc.returnNumber,
      message: type === 'exchange' 
        ? 'Size exchange request submitted! Our team will arrange reverse pickup once approved.'
        : 'Return request submitted successfully! We will review your request within 24 hours.'
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
