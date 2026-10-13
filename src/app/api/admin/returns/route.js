import { getDb } from '@/lib/mongodb';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifySession } from '@/lib/auth';
import { ObjectId } from 'mongodb';
import {
  sendReturnStatusEmail,
  sendReturnInspectionEmail,
  sendRefundCompletedEmail,
} from '@/lib/email';

async function requireAdmin() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('slidex_session');
  if (!sessionCookie) return null;
  const session = verifySession(sessionCookie.value);
  return session?.role === 'admin' ? session : null;
}

// GET: Fetch all return requests with filters, search, and pagination
export async function GET(request) {
  try {
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access.' }, { status: 401 });
    }

    const db = await getDb();
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { returnNumber: regex },
        { orderNumber: regex },
        { customerName: regex },
        { customerEmail: regex },
      ];
    }

    const returns = await db.collection('returns')
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      data: returns.map((r) => ({ ...r, _id: r._id.toString() })),
      total: returns.length,
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT: Update return request status / inspection / manual refund record
export async function PUT(request) {
  try {
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access.' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      id, 
      status, 
      refundAmount, 
      adminNotes, 
      rejectionReason,
      inspectionResult,
      refundDetails, // { method, reference/utr, notes }
    } = body;

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: 'id and status are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const returnDoc = await db.collection('returns').findOne({ _id: new ObjectId(id) });
    if (!returnDoc) {
      return NextResponse.json({ success: false, error: 'Return request not found.' }, { status: 404 });
    }

    const now = new Date();
    const update = {
      status,
      updatedAt: now,
    };

    if (refundAmount !== undefined) update.refundAmount = Number(refundAmount);
    if (adminNotes !== undefined) update.adminNotes = adminNotes;
    if (rejectionReason) update.rejectionReason = rejectionReason;
    if (inspectionResult) update.inspectionResult = inspectionResult;

    // Build audit timeline history entry
    const historyEntry = {
      status,
      timestamp: now,
      actor: adminSession.name || 'Admin',
      notes: adminNotes || rejectionReason || `Status transitioned to ${status}`,
    };

    // ── 1. STATUS TRANSITION NOTIFICATIONS & ACTIONS ─────────────────────────
    if (status === 'approved' || status === 'rejected') {
      try {
        await sendReturnStatusEmail(returnDoc, status, rejectionReason || adminNotes);
      } catch (mailErr) {
        console.warn('Status notification email warning:', mailErr.message);
      }
    } else if (status === 'received' || status === 'inspection_pending') {
      if (inspectionResult) {
        try {
          await sendReturnInspectionEmail(returnDoc, inspectionResult);
        } catch (mailErr) {
          console.warn('Inspection notification email warning:', mailErr.message);
        }
      }
    }

    // ── 2. MANUAL REFUND RECORDING (Phase 8) ──────────────────────────────────
    let createdRefundRecord = null;
    if (status === 'refunded' || status === 'completed') {
      const finalRefundAmt = refundAmount !== undefined ? Number(refundAmount) : (returnDoc.refundAmount || 0);

      if (finalRefundAmt > 0 && !returnDoc.refundRecord) {
        createdRefundRecord = {
          returnId: returnDoc._id.toString(),
          returnNumber: returnDoc.returnNumber,
          orderId: returnDoc.orderId,
          orderNumber: returnDoc.orderNumber,
          amount: finalRefundAmt,
          method: refundDetails?.method || 'Manual Bank Transfer (NEFT/IMPS)',
          reference: refundDetails?.reference || refundDetails?.utr || `REF-${Date.now().toString().slice(-8)}`,
          processedBy: adminSession.email || 'Admin',
          processedAt: now,
          notes: refundDetails?.notes || adminNotes || 'Refund settled by administrator',
        };

        // Persist secure refund record in dedicated refunds ledger
        await db.collection('refunds').insertOne(createdRefundRecord);
        update.refundRecord = createdRefundRecord;

        // Update original order payment status
        if (returnDoc.orderId) {
          await db.collection('orders').updateOne(
            { $or: [{ _id: new ObjectId(returnDoc.orderId) }, { orderNumber: returnDoc.orderNumber }] },
            {
              $set: {
                'payment.refundStatus': 'Refunded',
                'payment.refundAmount': finalRefundAmt,
                'payment.refundedAt': now,
                updatedAt: now,
              }
            }
          );
        }

        // Dispatch customer refund confirmation email
        try {
          await sendRefundCompletedEmail(returnDoc, createdRefundRecord);
        } catch (mailErr) {
          console.warn('Refund completed email warning:', mailErr.message);
        }
      }
    }

    // ── 3. STOCK RESTORATION & EXCHANGE RESERVATION ─────────────────────────
    if (status === 'completed' || status === 'refunded' || status === 'received') {
      const firstItem = returnDoc.items?.[0];
      if (firstItem && firstItem.id && firstItem.size) {
        if (returnDoc.type === 'return' && !returnDoc.stockRestored) {
          // Restore returned footwear size stock
          await db.collection('products').updateOne(
            { id: firstItem.id },
            { 
              $inc: { 
                [`sizeStock.${firstItem.size}`]: firstItem.quantity || 1, 
                stockQty: firstItem.quantity || 1 
              } 
            }
          );
          update.stockRestored = true;
        } else if (returnDoc.type === 'exchange' && returnDoc.exchangeDetails?.replacementSize && !returnDoc.exchangeStockDeducted) {
          // Deduct replacement size and restore returned original size
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
          await db.collection('products').updateOne(
            { id: firstItem.id },
            { 
              $inc: { 
                [`sizeStock.${firstItem.size}`]: 1, 
                stockQty: 1 
              } 
            }
          );
          update.exchangeStockDeducted = true;
        }
      }
    }

    await db.collection('returns').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: update,
        $push: { statusHistory: historyEntry },
      }
    );

    return NextResponse.json({
      success: true,
      message: `Return request updated to: ${status}`,
      refundRecord: createdRefundRecord,
    });
  } catch (error) {
    console.error('Admin returns PUT exception:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE: Remove a return request
export async function DELETE(request) {
  try {
    const adminSession = await requireAdmin();
    if (!adminSession) {
      return NextResponse.json({ success: false, error: 'Unauthorized administrative access.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'id parameter is required.' }, { status: 400 });
    }

    const db = await getDb();
    await db.collection('returns').deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true, message: 'Return request deleted successfully.' });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
