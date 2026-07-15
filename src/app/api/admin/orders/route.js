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
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
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

// PUT: Update order fulfillment status
export async function PUT(request) {
  try {
    const { orderId, status } = await request.json();
    
    if (!orderId || !status) {
      return NextResponse.json({ success: false, error: 'Order ID and Status parameters are required' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const result = await db.collection('orders').updateOne(
      { orderId: orderId },
      { $set: { status: status.toLowerCase() } }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Order record not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: `Order status set to: ${status}` });
  } catch (error) {
    if (isConnectionError(error)) {
      return NextResponse.json({
        success: false,
        error: "Database Connection Failed. Please verify your MongoDB Atlas Network IP Whitelist. Go to MongoDB Atlas -> Security -> Network Access and add 0.0.0.0/0 to allow connections."
      }, { status: 503 });
    }
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
