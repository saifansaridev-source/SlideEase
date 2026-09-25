import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { MOCK_ORDERS, isConnectionError } from '@/lib/dbFallback';
import { sendShippingUpdateEmail } from '@/lib/email';
import { ObjectId } from 'mongodb';

// GET: Fetch all checkout orders
export async function GET(request) {
  try {
    const db = await getDb();
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const orderId = searchParams.get('id');
    
    if (orderId) {
      let q = { $or: [{ orderId }, { orderNumber: orderId }] };
      if (ObjectId.isValid(orderId) && String(new ObjectId(orderId)) === orderId) {
        q.$or.push({ _id: new ObjectId(orderId) });
      }
      const single = await db.collection('orders').findOne(q);
      if (!single) return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
      return NextResponse.json({ success: true, data: single });
    }

    let query = {};
    if (status && status !== 'all') {
      query.status = status.toLowerCase();
    }
    
    const orders = await db.collection('orders')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();
      
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    if (isConnectionError(error)) {
      console.warn("MongoDB connection failed. Using mock orders fallback data.", error.message);
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      
      const filtered = (status && status !== 'all') 
        ? MOCK_ORDERS.filter(o => o.status === status) 
        : MOCK_ORDERS;
        
      return NextResponse.json({ success: true, data: filtered, isFallback: true });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update order fulfillment status, tracking, notes, cancellation/refund
export async function PUT(request) {
  try {
    const body = await request.json();
    const { 
      orderId, 
      status, 
      courierName, 
      trackingNumber, 
      adminNotes, 
      cancelReason, 
      refundAmount,
      note 
    } = body;
    
    if (!orderId) {
      return NextResponse.json({ success: false, error: 'Order ID parameter is required' }, { status: 400 });
    }
    
    const db = await getDb();

    let filter = { $or: [{ orderId: orderId }, { orderNumber: orderId }] };
    if (ObjectId.isValid(orderId) && String(new ObjectId(orderId)) === orderId) {
      filter.$or.push({ _id: new ObjectId(orderId) });
    }

    const currentOrder = await db.collection('orders').findOne(filter);
    if (!currentOrder) {
      return NextResponse.json({ success: false, error: 'Order record not found' }, { status: 404 });
    }

    const setFields = { updatedAt: new Date().toISOString() };
    if (status) setFields.status = status.toLowerCase();
    if (courierName !== undefined) setFields.courierName = courierName.trim();
    if (trackingNumber !== undefined) setFields.trackingNumber = trackingNumber.trim();
    if (adminNotes !== undefined) setFields.adminNotes = adminNotes;
    if (cancelReason !== undefined) setFields.cancelReason = cancelReason;
    if (refundAmount !== undefined) setFields.refundAmount = parseFloat(refundAmount) || 0;

    // Inventory Restoration on Order Cancellation
    if (status && status.toLowerCase() === 'cancelled' && !currentOrder.stockRestored) {
      for (const item of (currentOrder.items || [])) {
        if (item.id && item.size) {
          const qty = item.quantity || item.qty || 1;
          await db.collection('products').updateOne(
            { id: item.id },
            { 
              $inc: { 
                [`sizeStock.${item.size}`]: qty, 
                stockQty: qty 
              } 
            }
          );
        }
      }
      setFields.stockRestored = true;
    }

    const updateDoc = { $set: setFields };

    if (status || note) {
      const timelineEntry = {
        status: (status || 'updated').toLowerCase(),
        timestamp: new Date().toISOString(),
        note: note || (cancelReason ? `Cancelled: ${cancelReason}` : `Status set to ${status || 'updated'}`)
      };
      updateDoc.$push = { timeline: timelineEntry };
    }
    
    await db.collection('orders').updateOne(filter, updateDoc);
    
    // If order was dispatched with tracking number, send shipping email to customer
    if (trackingNumber && (status === 'shipped' || currentOrder.status === 'shipped' || courierName)) {
      try {
        await sendShippingUpdateEmail(
          { ...currentOrder, ...setFields },
          { trackingNumber, courier: courierName || currentOrder.courierName || 'Courier Partner' }
        );
      } catch (emailErr) {
        console.warn('Shipping email non-fatal error:', emailErr.message);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Order updated successfully',
      updated: setFields
    });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB Atlas Network IP Whitelist."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
