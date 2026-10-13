import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import { sendReturnRequestedEmail } from '@/lib/email';

const RETURN_WINDOW_DAYS = 30; // 30-day return policy

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('slidex_session');
    const session = sessionCookie ? verifySession(sessionCookie.value) : null;

    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get('email');
    const orderId = searchParams.get('orderId');

    const effectiveEmail = (session?.email || queryEmail || '').toLowerCase().trim();

    if (!effectiveEmail && !orderId) {
      return NextResponse.json({ success: false, error: 'Authentication or order reference required' }, { status: 401 });
    }

    const db = await getDb();
    let query = {};

    if (effectiveEmail) {
      query.customerEmail = effectiveEmail;
    }
    if (orderId) {
      query.$or = [{ orderId }, { orderNumber: orderId }];
    }

    const userReturns = await db
      .collection('returns')
      .find(query)
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
      quantity = 1,
      reason, 
      notes = '', 
      evidencePhotos = [],
      customerEmail: providedEmail 
    } = body;

    const email = (session?.email || providedEmail || '').toLowerCase().trim();

    if (!orderId || !reason || !email) {
      return NextResponse.json(
        { success: false, error: 'Order reference, return reason, and customer email are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    // 1. Fetch order by ObjectId or orderNumber
    let orderQuery = {};
    if (ObjectId.isValid(orderId) && String(new ObjectId(orderId)) === orderId) {
      orderQuery = { $or: [{ _id: new ObjectId(orderId) }, { orderNumber: orderId }] };
    } else {
      orderQuery = { orderNumber: orderId };
    }

    const order = await db.collection('orders').findOne(orderQuery);
    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found in records.' }, { status: 404 });
    }

    // 2. Ownership verification (protect against IDOR)
    const orderCustomerEmail = (order.customer?.email || '').toLowerCase().trim();
    if (orderCustomerEmail !== email) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: This order does not match your account email.' },
        { status: 403 }
      );
    }

    // 3. Order status check (cannot return cancelled, unpaid, or failed orders)
    const orderStatus = (order.status || '').toLowerCase();
    const paymentStatus = (order.payment?.status || '').toLowerCase();

    if (orderStatus === 'cancelled' || paymentStatus === 'failed') {
      return NextResponse.json({
        success: false,
        error: 'Cannot initiate return for cancelled or unpaid orders.'
      }, { status: 400 });
    }

    // 4. Return window verification
    const orderDate = new Date(order.createdAt || Date.now());
    const daysSinceOrder = Math.floor((Date.now() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceOrder > RETURN_WINDOW_DAYS) {
      return NextResponse.json({
        success: false,
        error: `Return window expired. Orders are eligible for returns within ${RETURN_WINDOW_DAYS} days of delivery (Order placed ${daysSinceOrder} days ago).`
      }, { status: 400 });
    }

    // 5. Item verification and quantity calculation
    const orderedItem = (order.items || []).find(
      (i) => i.id === itemId || i.productId === itemId || i.name === itemId
    ) || order.items?.[0];

    if (!orderedItem) {
      return NextResponse.json({ success: false, error: 'Selected item was not found in this order.' }, { status: 400 });
    }

    const orderedQty = orderedItem.quantity || orderedItem.qty || 1;
    const returnQty = Math.max(1, Math.min(Number(quantity) || 1, orderedQty));

    // 6. Prevent duplicate return requests for the same item/order
    const existingReturn = await db.collection('returns').findOne({
      orderId: order._id.toString(),
      'items.id': orderedItem.id || orderedItem.productId,
      status: { $nin: ['rejected', 'cancelled'] },
    });

    if (existingReturn) {
      return NextResponse.json({
        success: false,
        error: `A return request (${existingReturn.returnNumber}) is already active for this item (Status: ${existingReturn.status}).`
      }, { status: 409 });
    }

    // 7. Exchange inventory validation
    let exchangeDetails = null;
    if (type === 'exchange') {
      if (!replacementSize) {
        return NextResponse.json(
          { success: false, error: 'Please select a replacement footwear size for the exchange.' },
          { status: 400 }
        );
      }

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

    // 8. Calculate item refund amount accounting for discounts
    const unitPrice = orderedItem.unitPrice !== undefined ? orderedItem.unitPrice : (orderedItem.price || 0);
    const itemSubtotal = unitPrice * returnQty;
    // Calculate proportional discount
    const orderSubtotal = order.pricing?.subtotal || order.subtotal || itemSubtotal;
    const orderDiscount = order.pricing?.discount || order.discount || 0;
    const proportionalDiscount = orderSubtotal > 0 ? Math.round((itemSubtotal / orderSubtotal) * orderDiscount) : 0;
    const calculatedRefund = Math.max(0, itemSubtotal - proportionalDiscount);

    const returnNumber = `RET-${Date.now().toString().slice(-6)}`;
    const now = new Date();

    const returnDoc = {
      returnNumber,
      orderId: order._id.toString(),
      orderNumber: order.orderNumber,
      type, // 'return' | 'exchange'
      customerName: `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Valued Customer',
      customerEmail: email,
      customerPhone: order.customer?.phone || '',
      pickupAddress: {
        address: order.customer?.address || '',
        city: order.customer?.city || '',
        state: order.customer?.state || 'Maharashtra',
        zip: order.customer?.zip || '',
        phone: order.customer?.phone || '',
      },
      items: [
        {
          name: orderedItem.name || 'Footwear Item',
          size: size || orderedItem.size || 'Standard',
          quantity: returnQty,
          unitPrice,
          refundAmount: type === 'return' ? calculatedRefund : 0,
          id: orderedItem.id || orderedItem.productId || '',
        }
      ],
      exchangeDetails,
      reason,
      notes: notes || '',
      evidencePhotos: Array.isArray(evidencePhotos) ? evidencePhotos : [],
      status: 'requested', // requested | under_review | approved | rejected | pickup_scheduled | in_transit | received | refund_processing | refunded | completed | cancelled
      refundAmount: type === 'return' ? calculatedRefund : 0,
      refundEligibility: {
        eligible: true,
        maxRefundable: calculatedRefund,
        originalItemPrice: itemSubtotal,
        discountDeducted: proportionalDiscount,
      },
      statusHistory: [
        {
          status: 'requested',
          timestamp: now,
          actor: 'Customer',
          notes: 'Customer submitted return request with evidence.',
        }
      ],
      adminNotes: '',
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await db.collection('returns').insertOne(returnDoc);

    // Update order with return status
    await db.collection('orders').updateOne(
      { _id: order._id },
      { 
        $set: { 
          returnStatus: `${type === 'exchange' ? 'Exchange' : 'Return'} Requested`,
          updatedAt: now,
        } 
      }
    );

    // Dispatch email confirmation to customer & notification to admin
    try {
      await sendReturnRequestedEmail(returnDoc);
    } catch (mailErr) {
      console.warn('Return requested email dispatch warning:', mailErr.message);
    }

    return NextResponse.json({
      success: true,
      returnId: insertResult.insertedId.toString(),
      returnNumber: returnDoc.returnNumber,
      refundAmount: returnDoc.refundAmount,
      message: type === 'exchange'
        ? 'Size exchange request submitted! Our concierge team will review and schedule complimentary doorstep pickup.'
        : 'Return request submitted successfully! We will review your request within 24 hours.'
    });
  } catch (error) {
    console.error('Return request creation exception:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
