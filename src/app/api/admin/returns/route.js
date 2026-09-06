import clientPromise from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// GET: Fetch all return requests
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

    const returns = await db.collection('returns')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({ success: true, data: returns });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Create a new return request (also callable from storefront)
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, customerName, customerEmail, items, reason, notes } = body;

    if (!orderId || !customerEmail || !reason) {
      return NextResponse.json(
        { success: false, error: 'orderId, customerEmail, and reason are required.' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db('startupbiz');

    const returnDoc = {
      orderId,
      customerName: customerName || 'Unknown',
      customerEmail,
      items: items || [],
      reason,
      notes: notes || '',
      status: 'pending',       // pending | approved | rejected | refunded
      refundAmount: 0,
      adminNotes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('returns').insertOne(returnDoc);
    return NextResponse.json({ success: true, returnId: result.insertedId });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update return request status / refund amount / admin notes
export async function PUT(request) {
  try {
    const { id, status, refundAmount, adminNotes } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'id and status are required.' },
        { status: 400 }
      );
    }

    const { ObjectId } = await import('mongodb');
    const client = await clientPromise;
    const db = client.db('startupbiz');

    const update = {
      status,
      updatedAt: new Date(),
    };
    if (refundAmount !== undefined) update.refundAmount = Number(refundAmount);
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    const result = await db.collection('returns').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, error: 'Return request not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: `Return updated to: ${status}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a return request
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required.' }, { status: 400 });
    }

    const { ObjectId } = await import('mongodb');
    const client = await clientPromise;
    const db = client.db('startupbiz');

    await db.collection('returns').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, message: 'Return request deleted.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
