import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Simple verification
    if (!body.email || !body.items || body.items.length === 0) {
      return NextResponse.json({ success: false, error: 'Mandatory checkout fields are missing' }, { status: 400 });
    }
    
    const client = await clientPromise;
    const db = client.db('startupbiz');
    
    const orderData = {
      orderId: 'SLDX-' + Math.floor(100000 + Math.random() * 900000),
      customer: {
        firstname: body.firstname,
        lastname: body.lastname,
        email: body.email,
        phone: body.phone,
        address: body.address,
        city: body.city,
        state: body.state,
        zip: body.zip
      },
      items: body.items,
      paymentMethod: body.paymentMethod || 'upi',
      subtotal: body.subtotal,
      discount: body.discount || 0,
      tax: body.tax || 0,
      shipping: body.shipping || 0,
      total: body.total,
      status: 'pending',
      createdAt: new Date()
    };
    
    await db.collection('orders').insertOne(orderData);
    
    return NextResponse.json({ success: true, orderId: orderData.orderId, data: orderData });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
