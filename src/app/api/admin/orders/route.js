import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { MOCK_ORDERS, isConnectionError } from '@/lib/dbFallback';

// GET: Fetch all checkout orders
export async function GET(request) {
  try {
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const orderId = searchParams.get('id');
    
    if (orderId) {
      const { ObjectId } = await import('mongodb');
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
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    const { ObjectId } = await import('mongodb');

    let filter = { $or: [{ orderId: orderId }, { orderNumber: orderId }] };
    if (ObjectId.isValid(orderId) && String(new ObjectId(orderId)) === orderId) {
      filter.$or.push({ _id: new ObjectId(orderId) });
    }

    const setFields = { updatedAt: new Date().toISOString() };
    if (status) setFields.status = status.toLowerCase();
    if (courierName !== undefined) setFields.courierName = courierName.trim();
    if (trackingNumber !== undefined) setFields.trackingNumber = trackingNumber.trim();
    if (adminNotes !== undefined) setFields.adminNotes = adminNotes;
    if (cancelReason !== undefined) setFields.cancelReason = cancelReason;
    if (refundAmount !== undefined) setFields.refundAmount = parseFloat(refundAmount) || 0;

    const updateDoc = { $set: setFields };

    if (status || note) {
      const timelineEntry = {
        status: (status || 'updated').toLowerCase(),
        timestamp: new Date().toISOString(),
        note: note || (cancelReason ? `Cancelled: ${cancelReason}` : `Status set to ${status || 'updated'}`)
      };
      updateDoc.$push = { timeline: timelineEntry };
    }
    
    const result = await db.collection('orders').updateOne(filter, updateDoc);
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Order record not found' }, { status: 404 });
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
