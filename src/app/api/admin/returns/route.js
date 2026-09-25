import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';

// GET: Fetch all return requests
export async function GET(request) {
  try {
    const db = await getDb();

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

    const db = await getDb();

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
    const db = await getDb();

    const returnDoc = await db.collection('returns').findOne({ _id: new ObjectId(id) });
    if (!returnDoc) {
      return NextResponse.json({ success: false, error: 'Return request not found.' }, { status: 404 });
    }

    const update = {
      status,
      updatedAt: new Date(),
    };
    if (refundAmount !== undefined) update.refundAmount = Number(refundAmount);
    if (adminNotes !== undefined) update.adminNotes = adminNotes;

    await db.collection('returns').updateOne(
      { _id: new ObjectId(id) },
      { $set: update }
    );

    // If return is approved or completed, handle stock restoration / exchange deduction
    if (status === 'completed' || status === 'refunded' || status === 'approved') {
      const firstItem = returnDoc.items?.[0];
      if (firstItem && firstItem.id && firstItem.size) {
        if (returnDoc.type === 'return' && !returnDoc.stockRestored) {
          // Restore returned size stock
          await db.collection('products').updateOne(
            { id: firstItem.id },
            { 
              $inc: { 
                [`sizeStock.${firstItem.size}`]: 1, 
                stockQty: 1 
              } 
            }
          );
          await db.collection('returns').updateOne({ _id: new ObjectId(id) }, { $set: { stockRestored: true } });
        } else if (returnDoc.type === 'exchange' && returnDoc.exchangeDetails?.replacementSize && !returnDoc.exchangeStockDeducted) {
          // Deduct replacement size stock
          const repSize = returnDoc.exchangeDetails.replacementSize;
          await db.collection('products').updateOne(
            { id: firstItem.id },
            { 
              $inc: { 
                [`sizeStock.${repSize}`]: -1, 
                stockQty: -1 
              } 
            }
          );
          // And restore returned original size stock
          await db.collection('products').updateOne(
            { id: firstItem.id },
            { 
              $inc: { 
                [`sizeStock.${firstItem.size}`]: 1, 
                stockQty: 1 
              } 
            }
          );
          await db.collection('returns').updateOne({ _id: new ObjectId(id) }, { $set: { exchangeStockDeducted: true } });
        }
      }
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
    const db = await getDb();

    await db.collection('returns').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, message: 'Return request deleted.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
